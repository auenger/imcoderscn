// 微信 JS-SDK 签名服务 — Cloudflare Pages Function
// 上线后地址：https://imcoders.cn/api/wx-sign?url=<当前页URL>
// 前端（src/layouts/Layout.astro）已用同源相对路径 /api/wx-sign 调用，无需 CORS。
//
// 为什么必须有后端：wx.config 的 signature 要用 jsapi_ticket 在服务端算，
// AppSecret 不能进前端。静态站没有后端，所以挂一个云函数。
//
// 环境变量（Cloudflare Pages → Settings → Environment variables → Production）：
//   WX_APPID       公众号 AppId（默认 wxb30ef6e2b54c72ff，可用环境变量覆盖）
//   WX_APPSECRET   公众号 AppSecret（必填，只放这里，绝不进仓库）
//
// ⚠️ IP 白名单：微信要求调用 access_token 的出口 IP 在「公众号后台 → 开发 → 基本配置 → IP白名单」里。
//    Cloudflare 的出口 IP 是动态的，首次调用可能返回 errcode 40164。
//    解法见 wechat-sign/README.md。

// 模块级缓存：同一 Worker isolate 内复用 token/ticket（有效期 7200s，个人站足够）。
// 要跨 isolate 稳定缓存，可改用 Cloudflare KV（env.WX_KV）。
let accessToken = null, tokenExpireAt = 0;
let jsapiTicket = null, ticketExpireAt = 0;

async function sha1Hex(str) {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getAccessToken(env) {
  const now = Date.now();
  if (accessToken && now < tokenExpireAt - 5 * 60 * 1000) return accessToken;
  const u = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${env.WX_APPID}&secret=${env.WX_APPSECRET}`;
  const d = await (await fetch(u)).json();
  if (!d.access_token) throw new Error('getAccessToken ' + JSON.stringify(d)); // 含 errcode，便于排查 40164
  accessToken = d.access_token;
  tokenExpireAt = now + d.expires_in * 1000;
  return accessToken;
}

async function getJsapiTicket(env) {
  const now = Date.now();
  if (jsapiTicket && now < ticketExpireAt - 5 * 60 * 1000) return jsapiTicket;
  const token = await getAccessToken(env);
  const u = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  const d = await (await fetch(u)).json();
  if (!d.ticket) throw new Error('getJsapiTicket ' + JSON.stringify(d));
  jsapiTicket = d.ticket;
  ticketExpireAt = now + d.expires_in * 1000;
  return jsapiTicket;
}

function jsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store',
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders() });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const headers = jsonHeaders();
  const targetUrl = new URL(request.url).searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'missing url param' }), { status: 400, headers });
  }
  if (!env.WX_APPSECRET) {
    return new Response(JSON.stringify({ error: 'WX_APPSECRET not configured on Cloudflare' }), { status: 500, headers });
  }

  // env.WX_APPID 兜底默认值，避免再配一遍
  const appId = env.WX_APPID || 'wxb30ef6e2b54c72ff';
  const envWithDefaults = { ...env, WX_APPID: appId };

  try {
    const nonceStr = Math.random().toString(36).slice(2);
    const timestamp = Math.floor(Date.now() / 1000);
    const ticket = await getJsapiTicket(envWithDefaults);
    const raw = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${targetUrl}`;
    const signature = await sha1Hex(raw);
    return new Response(JSON.stringify({ appId, timestamp, nonceStr, signature }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e && e.message) || e) }), { status: 500, headers });
  }
}
