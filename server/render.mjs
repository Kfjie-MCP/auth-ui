import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const templatePath = fileURLToPath(new URL("../out/index.html", import.meta.url));
const serviceNames = { "agent-reach": "Agent Reach", transcriptor: "视频理解", xuexitong: "学习通", mailbridge: "邮件" };
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const safeJson = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);

export function renderAuthorizationPage({ service, request = "", clientName = "MCP 客户端", redirectUri, expiresAt = 0, error = null, preview = false }, template = readFileSync(templatePath, "utf8")) {
  if (!Object.hasOwn(serviceNames, service)) throw new Error("Unknown authorization service");
  const redirect = redirectUri ? new URL(redirectUri) : null;
  const context = {
    service, request, clientName: String(clientName), callbackHost: redirect?.host || "",
    action: preview ? "#" : `/${service}/oauth/approve`, expiresAt, error, ...(preview ? { preview: true } : {}),
  };
  const marker = /(<script\b[^>]*id="mcp-auth-context"[^>]*>)[\s\S]*?(<\/script>)/;
  if (!marker.test(template)) throw new Error("Authorization UI build is missing its context marker");
  const nonce = randomBytes(24).toString("base64");
  let html = template.replace(marker, (_match, open, close) => open + safeJson(context) + close);
  html = html.replace(/<script(?=\s|>)/g, `<script nonce="${nonce}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>授权连接 · ${serviceNames[service]}</title>`);
  // The same native form remains usable with JavaScript disabled.
  const fallback = `<noscript><section style="position:fixed;inset:0;z-index:99;background:#f8f9fb;overflow:auto;padding:10vh 24px;font:15px/1.8 system-ui;color:#1c2025"><div style="max-width:440px;margin:auto;background:white;padding:32px;border:1px solid #e8ebef;border-radius:16px"><h1>连接 ${serviceNames[service]}</h1>${error === "request_expired" ? "<p>授权页面已过期，请返回客户端重新连接。</p>" : `<p>授权 ${escapeHtml(clientName)} 连接此服务。</p>${error === "password_incorrect" ? '<p role="alert">连接密码不正确，请重试。</p>' : ""}<form method="post" action="${context.action}"><input type="hidden" name="request" value="${escapeHtml(request)}"><label for="fallback-password">MCP 连接密码</label><input id="fallback-password" name="password" type="password" autocomplete="current-password" required style="display:block;width:100%;box-sizing:border-box;padding:12px;margin:8px 0 16px;border:1px solid #dce0e6;border-radius:8px"><button style="padding:12px 20px;border:0;border-radius:8px;background:#252a31;color:white">授权并连接</button></form>`}<p style="font-size:12px;color:#737b87">不希望连接时，可直接关闭此窗口。</p></div></section></noscript>`;
  const previewFallback = '<noscript><p style="padding:32px;font:16px system-ui">这是授权页面预览。请启用 JavaScript 查看交互，无需输入真实密码。</p></noscript>';
  html = html.replace("</body>", (preview ? previewFallback : fallback) + "</body>");
  const csp = [
    "default-src 'none'", `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'", "font-src 'self' data:", "img-src 'self' data:",
    "connect-src 'self'", `form-action 'self'${redirect ? " " + redirect.origin : ""}`,
    "frame-ancestors 'none'", "base-uri 'none'", "object-src 'none'",
  ].join("; ");
  return { html, csp };
}

export function sendAuthorizationPage(res, context) {
  const { html, csp } = renderAuthorizationPage(context);
  res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Content-Security-Policy": csp, "X-Content-Type-Options": "nosniff" });
  return res.type("html").send(html);
}
