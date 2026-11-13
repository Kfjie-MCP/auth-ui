import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderAuthorizationPage } from "../server/render.mjs";

for (const service of ["agent-reach", "transcriptor", "xuexitong", "mailbridge"]) {
  const directory = fileURLToPath(new URL(`../out/preview/${service}/`, import.meta.url));
  mkdirSync(directory, { recursive: true });
  const { html, csp } = renderAuthorizationPage({ service, clientName: "ChatGPT", request: "preview-only", redirectUri: "https://chatgpt.com/connector/callback", expiresAt: 2000000000, preview: true });
  const policy = csp.replace(/; frame-ancestors 'none'/, "").replaceAll('"', '&quot;');
  writeFileSync(directory + '/index.html', html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`));
}
console.log('Built four disconnected authorization previews.');
