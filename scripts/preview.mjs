import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const port = Number(process.env.PREVIEW_PORT || 3180);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon" };
createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/") { res.writeHead(302, { Location: "/auth-ui/preview/mailbridge/" }).end(); return; }
    if (!pathname.startsWith("/auth-ui/")) { res.writeHead(404).end(); return; }
    let file = resolve(root, pathname.slice("/auth-ui/".length));
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch { res.writeHead(404).end(); }
}).listen(port, "127.0.0.1", () => console.log(`Preview: http://127.0.0.1:${port}/auth-ui/preview/mailbridge/`));
