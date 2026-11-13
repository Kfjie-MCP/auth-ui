# 接入授权页面

## 构建

```bash
git clone https://github.com/Kfjie-MCP/auth-ui.git /opt/mcp/auth-ui
cd /opt/mcp/auth-ui
npm ci
npm run build
```

静态文件输出到 `out/`。Nginx 路由模板为 `deploy/mcp-auth-ui-locations.conf`，由部署者在自己的 HTTPS server 中引用。

## 网关调用

```js
import { sendAuthorizationPage } from "/opt/mcp/auth-ui/server/render.mjs";

sendAuthorizationPage(res, {
  service: "mailbridge",
  request: "temporary-request-id",
  clientName: "MCP client",
  redirectUri: "https://client.example/callback",
  expiresAt: Math.floor(Date.now() / 1000) + 600,
  error: null,
});
```

支持 `mailbridge`、`transcriptor`、`agent-reach`、`xuexitong`。表单提交到同源 `/<service>/oauth/approve`；网关负责验证请求、密码和 OAuth 参数。

页面使用当前浏览器域名；静态预览固定显示 `mcp.example.com`。真正的外部 URL 由各网关私有 `.env` 的 `PUBLIC_URL` 配置，UI 无需填写生产域名。

渲染器读取 `out/index.html`、注入请求上下文并添加 CSP nonce。视频网关通过只读挂载访问此目录，其余网关直接读取。更新静态资源后，保留旧资源直到已有页面完成加载。
