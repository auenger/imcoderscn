---
name: agnes-media-generation
description: Generate text, images, and videos from natural-language prompts with the Agnes official API. Use when Codex needs Agnes text generation, image generation, video generation, Chinese prompt-to-image/video workflows, project visual assets, mockups, short clips, promotional videos, or Hermes/OpenAI-compatible Agnes model setup.
---

# Agnes Media Generation

Use Agnes through its OpenAI-compatible API:

- Base URL: `https://apihub.agnes-ai.com/v1`
- Text model: `agnes-2.0-flash`
- Image model: `agnes-image-2.0-flash`
- Video model: `agnes-video-v2.0`

Read the API key from `AGNES_API_KEY`. Never hard-code the key in generated source files, docs, commits, or examples.

## One Prompt Workflow

When the user asks in natural language to generate an image or video, call the unified script:

```bash
python3 .claude/skills/agnesimg/agnes_generate.py generate image "PROMPT" --out ./assets/generated
python3 .claude/skills/agnesimg/agnes_generate.py generate video "PROMPT" --out ./assets/generated --wait
python3 .claude/skills/agnesimg/agnes_generate.py generate text "PROMPT"
```

Use `--wait` for videos unless the user only wants the task id. Video generation is asynchronous: `POST /videos` returns a task id, then the script polls `GET /videos/{task_id}` and downloads the finished mp4.

For longer videos, `--num-frames 441 --frame-rate 24` requests about 18 seconds, but Agnes may fail large jobs with server-side GPU memory errors. If that happens, retry with `--num-frames 241 --frame-rate 24` (about 10 seconds) or split the idea into multiple shots and stitch them later.

## Chinese User Intents

Use this skill for Chinese requests that mean:

- generate image, generate visual, draw a picture, make an icon
- generate video, make a short film, create animation, promo video
- use Agnes, call Agnes, prompt-to-image, prompt-to-video

## Output Rules

For project work:

- Save generated files inside the current workspace, commonly `assets/generated/`, `public/generated/`, or `src/assets/generated/`.
- Return absolute paths so local images/videos can render in Codex.
- Verify generated files exist and are non-empty.
- For videos, report both the final file path and the Agnes task id when available.

## Prompting Guidance

For images, include subject, style, composition, lighting, palette, aspect ratio, and any negative constraints.

For videos, include duration, scene progression, camera motion, style, palette, and constraints such as `no text overlays`, `no logos`, or `no human faces`.

For software projects, generate media only when it helps the requested app, site, game, or presentation. Prefer using the generated asset directly in the project after verifying it exists.

## Direct Commands

The script also supports lower-level commands:

```bash
python3 .claude/skills/agnesimg/agnes_generate.py models
python3 .claude/skills/agnesimg/agnes_generate.py image --prompt "PROMPT" --out ./assets
python3 .claude/skills/agnesimg/agnes_generate.py video --prompt "PROMPT" --out ./assets
python3 .claude/skills/agnesimg/agnes_generate.py video-wait TASK_ID --out ./assets
```

## Hermes / Local Agent Config

For Hermes or another OpenAI-compatible local agent:

```text
Provider: Agnes
API Key env: AGNES_API_KEY
Base URL: https://apihub.agnes-ai.com/v1
Default text model: agnes-2.0-flash
```
