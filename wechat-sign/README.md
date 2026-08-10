# 微信 JS-SDK 签名服务（Cloudflare Pages Function）

> 当前方案：`functions/api/wx-sign.js`（Cloudflare Pages Function，与站点同源）。
> 旧的腾讯云 SCF 版 `wechat-sign/index.js` 仍保留作备选，Cloudflare 上不用它（用 Node `crypto`，Worker 跑不了）。

## 已确认的现状

- 站点托管在 **Cloudflare**（`server: cloudflare`），域名 `imcoders.cn`。
- 新 Astro 站已上线，OG 标签全对，验证文件 `https://imcoders.cn/MP_verify_x11WIEcBGoEuJwDH.txt` 返回 200。
- 前端 `src/layouts/Layout.astro` 已接好 JS-SDK，默认调用同源 `/api/wx-sign`（无需 CORS、无需 `.env`）。
- AppId `wxb30ef6e2b54c72ff` 已在函数里兜底默认。

## 还差 4 步配置

### 1. Cloudflare Pages 配环境变量

Cloudflare Dashboard → 你的 Pages 项目 → Settings → Environment variables → Production（和 Preview 都加）：

| 变量 | 值 |
|---|---|
| `WX_APPID` | `wxb30ef6e2b54c72ff`（函数里已兜底，可不配） |
| `WX_APPSECRET` | 公众号后台「开发 → 基本配置 → AppSecret」重置后复制，**只贴这里，别进仓库** |

### 2. 确保 functions/ 被部署

`functions/api/wx-sign.js` 在源码根。部署到 Cloudflare 的两种情况：

- **CF 连的是源码仓库**（build=`npm run build`，output=`dist`）：Cloudflare 会自动把项目根 `functions/` 识别为 Pages Functions，无需额外操作。
- **CF 连的是 dist-only 仓库**（即 `auenger/ImCorders`）：`deploy.sh` 已加了 `cp -r functions dist/`，函数会随 dist 一起推上去，同样被识别。

部署后访问 `https://imcoders.cn/api/wx-sign` 应返回 `{"error":"missing url param"}`（说明函数活着）。

### 3. 公众号后台配 JS 安全域名

公众号后台 → 设置与开发 → 公众号设置 → 功能设置 → **JS接口安全域名** 填 `imcoders.cn`。

验证文件已就绪（上面 200），点验证能过。

### 4. ⚠️ IP 白名单（最容易卡的坑）

微信要求调用 `access_token` 的出口 IP 在白名单里。**Cloudflare 出口 IP 是动态的**，首次调用很可能返回 `errcode: 40164, invalid ip xxx.xxx.xxx.xxx`。

排查与解法：

```bash
curl "https://imcoders.cn/api/wx-sign?url=https://imcoders.cn/blog/fde-china-kernel/"
```

- 返回 `{"appId":..., "signature":...}` → 通了，不用管白名单。
- 返回 `{"error":"getAccessToken {...\"errcode\":40164, \"errmsg\":\"invalid ip xx.xx.xx.xx\"...}"}` → 把错误里的那个 IP 加进公众号后台「开发 → 基本配置 → IP白名单」，再试。CF IP 段多，可能要加几次（或按段加）。
- 实在加不齐 → 退回腾讯云 SCF 方案（见文末），SCF 出口 IP 相对稳定、且在腾讯云段内微信更友好。

## 验证整条链路

1. `curl "https://imcoders.cn/api/wx-sign?url=https://imcoders.cn/blog/fde-china-kernel/"` 拿到 signature。
2. 真机微信里打开 `https://imcoders.cn/blog/fde-china-kernel/`，点右上角「…」→ 发送给朋友 / 分享到朋友圈，看卡片标题、描述、图是否是文章的。
3. 排错在微信里：连开发者工具 / vConsole 看 `[wx-sign]` 的 `console.warn`（`wx.error` 会打出 `invalid signature` / `domain not in whitelist` 等原因）。

## 备注：腾讯云 SCF 备选

`wechat-sign/index.js` 是腾讯云 SCF 版（Node `crypto` + `exports.main`）。若 Cloudflare 的 IP 白名单搞不定，按文件内注释部署到腾讯云 SCF，再把前端 `WX_SIGN_URL` 指过去：

项目根建 `.env`（不提交）：
```
WX_SIGN_URL=https://service-xxx.gz.apigw.tencentcs.com/release/wx-sign
```
`Layout.astro` 里已支持 `WX_SIGN_URL` 环境变量覆盖，重新 `./deploy.sh` 即可。
