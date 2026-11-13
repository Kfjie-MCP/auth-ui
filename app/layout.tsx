import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "授权连接 · kfjie MCP",
  description: "确认 MCP 客户端的服务连接请求。",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  icons: { icon: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#252a31"/><g fill="none" stroke="#fff" stroke-width="1.5"><rect x="12" y="5" width="8" height="7" rx="1.5"/><rect x="4" y="21" width="8" height="7" rx="1.5"/><rect x="20" y="21" width="8" height="7" rx="1.5"/><path d="M16 12v5M8 21v-4h16v4"/></g></svg>') },
};

const themeScript = `try{const t=localStorage.getItem('mcp-auth-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch{}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script id="mcp-auth-context" type="application/json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "__MCP_AUTH_CONTEXT__" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
