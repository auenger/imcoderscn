// 微信 JS-SDK 签名服务
// 部署到云函数（腾讯云 SCF / Vercel / Cloudflare 等），不要放前端。
// 环境变量：WX_APPID、WX_APPSECRET、ALLOW_ORIGIN（默认 https://imcoders.cn）

const crypto = require('crypto');

const APPID = process.env.WX_APPID;
const SECRET = process.env.WX_APPSECRET;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || 'https://imcoders.cn';

// 全局缓存 access_token / jsapi_ticket（有效期 7200s，不能频繁刷）
let accessToken = null, tokenExpire = 0;
let jsapiTicket = null, ticketExpire = 0;

async function getAccessToken() {
  const now = Date.now();
  if (accessToken && now < tokenExpire - 300000) return accessToken; // 提前 5 分钟刷新
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`;
  const data = await (await fetch(url)).json();
  if (!data.access_token) throw new Error('token: ' + JSON.stringify(data));
  accessToken = data.access_token;
  tokenExpire = now + data.expires_in * 1000;
  return accessToken;
}

async function getJsapiTicket() {
  const now = Date.now();
  if (jsapiTicket && now < ticketExpire - 300000) return jsapiTicket;
  const token = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  const data = await (await fetch(url)).json();
  if (!data.ticket) throw new Error('ticket: ' + JSON.stringify(data));
  jsapiTicket = data.ticket;
  ticketExpire = now + data.expires_in * 1000;
  return jsapiTicket;
}

function makeSignature(ticket, nonceStr, timestamp, url) {
  const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

// 腾讯云 SCF（API 网关触发器）入口
exports.main = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  const url = event.queryString && (event.queryString.url || event.queryString.URL);
  if (!url) return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing url' }) };

  try {
    const nonceStr = Math.random().toString(36).slice(2);
    const timestamp = Math.floor(Date.now() / 1000);
    const ticket = await getJsapiTicket();
    const signature = makeSignature(ticket, nonceStr, timestamp, url);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ appId: APPID, timestamp, nonceStr, signature }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String((e && e.message) || e) }) };
  }
};

// Vercel 入口（放 /api/wx-sign.js 时用这个代替 exports.main）
// export default async function handler(req, res) {
//   res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   if (req.method === 'OPTIONS') return res.status(204).end();
//   const url = req.query.url;
//   if (!url) return res.status(400).json({ error: 'missing url' });
//   try {
//     const nonceStr = Math.random().toString(36).slice(2);
//     const timestamp = Math.floor(Date.now() / 1000);
//     const ticket = await getJsapiTicket();
//     const signature = makeSignature(ticket, nonceStr, timestamp, url);
//     res.status(200).json({ appId: APPID, timestamp, nonceStr, signature });
//   } catch (e) {
//     res.status(500).json({ error: String((e && e.message) || e) });
//   }
// }
