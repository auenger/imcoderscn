#!/usr/bin/env python3
"""Generate text, images, or videos through the Agnes OpenAI-compatible API."""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


BASE_URL = os.getenv("AGNES_BASE_URL", "https://apihub.agnes-ai.com/v1").rstrip("/")
TEXT_MODEL = os.getenv("AGNES_TEXT_MODEL", "agnes-2.0-flash")
IMAGE_MODEL = os.getenv("AGNES_IMAGE_MODEL", "agnes-image-2.0-flash")
VIDEO_MODEL = os.getenv("AGNES_VIDEO_MODEL", "agnes-video-v2.0")


def slugify(text: str, limit: int = 48) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip()).strip("-").lower()
    return (slug[:limit].strip("-") or "agnes-output")


def request_json(
    path: str,
    payload: dict[str, Any] | None = None,
    method: str | None = None,
    retries: int = 3,
    retry_delay: int = 5,
) -> dict[str, Any]:
    api_key = os.getenv("AGNES_API_KEY")
    if not api_key:
        raise SystemExit("AGNES_API_KEY is not set.")

    data = None
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        method=method or ("POST" if payload is not None else "GET"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
            break
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise SystemExit(f"HTTP {exc.code} from Agnes API:\n{body}") from exc
        except urllib.error.URLError as exc:
            if attempt >= retries:
                raise SystemExit(f"Agnes API connection failed after retries: {exc}") from exc
            print(f"connection error, retrying in {retry_delay}s: {exc}", file=sys.stderr)
            time.sleep(retry_delay)

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Agnes API returned non-JSON response:\n{raw[:1000]}") from exc


def download_url(url: str, out_path: Path) -> Path:
    req = urllib.request.Request(url, headers={"User-Agent": "Codex Agnes Skill"})
    with urllib.request.urlopen(req, timeout=240) as resp:
        content_type = resp.headers.get("Content-Type", "")
        data = resp.read()
    if out_path.suffix == "":
        ext = mimetypes.guess_extension(content_type.split(";")[0].strip()) or ".bin"
        out_path = out_path.with_suffix(ext)
    out_path.write_bytes(data)
    return out_path


def save_b64(data: str, out_path: Path, default_ext: str) -> Path:
    if "," in data and data.lstrip().startswith("data:"):
        header, data = data.split(",", 1)
        mime = header.split(";")[0].replace("data:", "")
        default_ext = mimetypes.guess_extension(mime) or default_ext
    if out_path.suffix == "":
        out_path = out_path.with_suffix(default_ext)
    out_path.write_bytes(base64.b64decode(data))
    return out_path


def find_media_item(resp: dict[str, Any]) -> Any:
    data = resp.get("data")
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    return resp


def save_media_response(resp: dict[str, Any], out_dir: Path, prompt: str, default_ext: str) -> Path | None:
    out_dir.mkdir(parents=True, exist_ok=True)
    item = find_media_item(resp)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    base = out_dir / f"{stamp}-{slugify(prompt)}"

    candidates: list[tuple[str, str]] = []
    if isinstance(item, dict):
        for key in ("url", "image_url", "video_url", "output_url", "download_url", "remixed_from_video_id"):
            if isinstance(item.get(key), str):
                candidates.append(("url", item[key]))
        for key in ("b64_json", "base64", "image_base64", "video_base64"):
            if isinstance(item.get(key), str):
                candidates.append(("b64", item[key]))
    elif isinstance(item, str):
        candidates.append(("url" if item.startswith("http") else "b64", item))

    for kind, value in candidates:
        if kind == "url" and value.startswith("http"):
            return download_url(value, base)
        if kind == "b64":
            return save_b64(value, base, default_ext)
    return None


def cmd_models(_: argparse.Namespace) -> None:
    print(json.dumps(request_json("/models"), ensure_ascii=False, indent=2))


def cmd_text(args: argparse.Namespace) -> None:
    payload = {
        "model": args.model or TEXT_MODEL,
        "messages": [{"role": "user", "content": args.prompt}],
        "temperature": args.temperature,
    }
    if args.max_tokens:
        payload["max_tokens"] = args.max_tokens
    resp = request_json("/chat/completions", payload)
    content = (
        resp.get("choices", [{}])[0]
        .get("message", {})
        .get("content")
    )
    print(content if content is not None else json.dumps(resp, ensure_ascii=False, indent=2))


def cmd_image(args: argparse.Namespace) -> None:
    payload = {"model": args.model or IMAGE_MODEL, "prompt": args.prompt, "n": args.n}
    if args.size:
        payload["size"] = args.size
    resp = request_json("/images/generations", payload)
    saved = save_media_response(resp, Path(args.out), args.prompt, ".png")
    if saved:
        print(str(saved.resolve()))
    else:
        print(json.dumps(resp, ensure_ascii=False, indent=2))


def cmd_video(args: argparse.Namespace) -> None:
    payload = {"model": args.model or VIDEO_MODEL, "prompt": args.prompt}
    if args.duration:
        payload["duration"] = args.duration
    if getattr(args, "num_frames", None):
        payload["num_frames"] = args.num_frames
    if getattr(args, "frame_rate", None):
        payload["frame_rate"] = args.frame_rate
    if args.size:
        payload["size"] = args.size
    resp = request_json("/videos", payload)
    saved = save_media_response(resp, Path(args.out), args.prompt, ".mp4")
    if saved:
        print(str(saved.resolve()))
    else:
        print(json.dumps(resp, ensure_ascii=False, indent=2))


def cmd_video_status(args: argparse.Namespace) -> None:
    resp = request_json(f"/videos/{args.task_id}", method="GET")
    saved = None
    if args.out:
        saved = save_media_response(resp, Path(args.out), args.task_id, ".mp4")
    if saved:
        print(str(saved.resolve()))
    else:
        print(json.dumps(resp, ensure_ascii=False, indent=2))


def cmd_video_wait(args: argparse.Namespace) -> None:
    deadline = time.time() + args.timeout
    last_resp: dict[str, Any] = {}
    while time.time() < deadline:
        last_resp = request_json(f"/videos/{args.task_id}", method="GET")
        status = str(last_resp.get("status", "")).lower()
        progress = last_resp.get("progress")
        print(f"status={status or 'unknown'} progress={progress}", file=sys.stderr)
        if status in {"completed", "succeeded", "success", "failed", "error"}:
            break
        time.sleep(args.interval)

    saved = save_media_response(last_resp, Path(args.out), args.task_id, ".mp4")
    if saved:
        print(str(saved.resolve()))
    else:
        print(json.dumps(last_resp, ensure_ascii=False, indent=2))


def cmd_generate(args: argparse.Namespace) -> None:
    if args.kind == "text":
        args.model = args.model or TEXT_MODEL
        args.temperature = args.temperature
        args.max_tokens = args.max_tokens
        cmd_text(args)
        return

    if args.kind == "image":
        args.model = args.model or IMAGE_MODEL
        args.n = args.n
        cmd_image(args)
        return

    if args.kind == "video":
        args.model = args.model or VIDEO_MODEL
        resp = request_json(
            "/videos",
            {
                "model": args.model,
                "prompt": args.prompt,
                **({"duration": args.duration} if args.duration else {}),
                **({"num_frames": args.num_frames} if args.num_frames else {}),
                **({"frame_rate": args.frame_rate} if args.frame_rate else {}),
                **({"size": args.size} if args.size else {}),
            },
        )
        saved = save_media_response(resp, Path(args.out), args.prompt, ".mp4")
        if saved:
            print(str(saved.resolve()))
            return

        task_id = resp.get("task_id") or resp.get("id")
        status = str(resp.get("status", "")).lower()
        if task_id:
            print(f"task_id={task_id}", file=sys.stderr)
        if args.wait and task_id and status not in {"completed", "succeeded", "success"}:
            wait_args = argparse.Namespace(
                task_id=task_id,
                out=args.out,
                interval=args.interval,
                timeout=args.timeout,
            )
            cmd_video_wait(wait_args)
            return

        print(json.dumps(resp, ensure_ascii=False, indent=2))
        return

    raise SystemExit(f"Unsupported kind: {args.kind}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(required=True)

    p = sub.add_parser("models", help="List available Agnes models")
    p.set_defaults(func=cmd_models)

    p = sub.add_parser("generate", help="Generate text, image, or video from one prompt")
    p.add_argument("kind", choices=["text", "image", "video"])
    p.add_argument("prompt")
    p.add_argument("--model")
    p.add_argument("--out", default="agnes-output")
    p.add_argument("--size")
    p.add_argument("--duration", type=int)
    p.add_argument("--num-frames", type=int)
    p.add_argument("--frame-rate", type=int)
    p.add_argument("--n", type=int, default=1)
    p.add_argument("--wait", action="store_true", help="For video, poll until the asset is ready")
    p.add_argument("--interval", type=int, default=10)
    p.add_argument("--timeout", type=int, default=900)
    p.add_argument("--temperature", type=float, default=0.7)
    p.add_argument("--max-tokens", type=int)
    p.set_defaults(func=cmd_generate)

    p = sub.add_parser("text", help="Generate text")
    p.add_argument("--prompt", required=True)
    p.add_argument("--model")
    p.add_argument("--temperature", type=float, default=0.7)
    p.add_argument("--max-tokens", type=int)
    p.set_defaults(func=cmd_text)

    p = sub.add_parser("image", help="Generate an image")
    p.add_argument("--prompt", required=True)
    p.add_argument("--model")
    p.add_argument("--out", default="agnes-output")
    p.add_argument("--size")
    p.add_argument("--n", type=int, default=1)
    p.set_defaults(func=cmd_image)

    p = sub.add_parser("video", help="Generate a video")
    p.add_argument("--prompt", required=True)
    p.add_argument("--model")
    p.add_argument("--out", default="agnes-output")
    p.add_argument("--size")
    p.add_argument("--duration", type=int)
    p.add_argument("--num-frames", type=int)
    p.add_argument("--frame-rate", type=int)
    p.set_defaults(func=cmd_video)

    p = sub.add_parser("video-status", help="Get video task status")
    p.add_argument("task_id")
    p.add_argument("--out")
    p.set_defaults(func=cmd_video_status)

    p = sub.add_parser("video-wait", help="Poll a video task until completion")
    p.add_argument("task_id")
    p.add_argument("--out", default="agnes-output")
    p.add_argument("--interval", type=int, default=10)
    p.add_argument("--timeout", type=int, default=900)
    p.set_defaults(func=cmd_video_wait)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
