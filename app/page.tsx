"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownToLine, ArrowRight, AudioLines, BookOpen, Check, ChevronDown,
  CircleAlert, Eye, EyeOff, FileText, Globe2, Image as ImageIcon,
  KeyRound, Layers3, Loader2, LockKeyhole, Mail, Moon, Network, Paperclip,
  Search, Send, ShieldCheck, Sun, Video, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { services, type AuthContext, type ServiceId } from "@/lib/services";

const permissionIcons = {
  search: Search, file: FileText, layers: Layers3, video: Video,
  audio: AudioLines, image: ImageIcon, book: BookOpen, download: ArrowDownToLine,
  mail: Mail, send: Send, paperclip: Paperclip,
};

const emptyContext: AuthContext = {
  service: "general", request: "", clientName: "MCP 客户端", callbackHost: "",
  action: "", expiresAt: 0, error: "request_expired",
};

function ServiceIcon({ service, className = "" }: { service: ServiceId; className?: string }) {
  const Icon = service === "transcriptor" ? Video : service === "xuexitong" ? BookOpen : service === "mailbridge" ? Mail : Network;
  return <Icon className={className} strokeWidth={1.7} aria-hidden="true" />;
}

export default function AuthorizationPage() {
  const [context, setContext] = useState<AuthContext | null>(null);
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [previewCompleted, setPreviewCompleted] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [dark, setDark] = useState(false);
  const [publicHost, setPublicHost] = useState("");

  useEffect(() => {
    let value = emptyContext;
    try {
      const parsed = JSON.parse(document.getElementById("mcp-auth-context")?.textContent || "null");
      if (parsed && Object.hasOwn(services, parsed.service)) value = parsed;
    } catch { /* A direct visit has no authorization request. */ }
    if (value.preview) {
      const parameters = new URLSearchParams(location.search);
      value = { ...value, expiresAt: Math.floor(Date.now() / 1000) + 600 };
      if (parameters.get("state") === "error") value.error = "password_incorrect";
      if (parameters.get("state") === "expired") value.error = "request_expired";
      const theme = parameters.get("theme");
      if (theme === "dark" || theme === "light") document.documentElement.dataset.theme = theme;
    }
    setContext(value);
    setPublicHost(value.preview ? "mcp.example.com" : window.location.host);
    setDark(document.documentElement.dataset.theme === "dark");
    document.title = `授权连接 · ${services[value.service].name}`;
    const updateTime = () => setRemaining(Math.max(0, Math.ceil(value.expiresAt - Date.now() / 1000)));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    const restore = () => setPending(false);
    window.addEventListener("pageshow", restore);
    return () => { clearInterval(timer); window.removeEventListener("pageshow", restore); };
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("mcp-auth-theme", next ? "dark" : "light"); } catch { /* Theme storage is optional. */ }
  };

  const service = services[context?.service || "general"];
  const expired = context?.error === "request_expired" || remaining === 0;
  const deniedPassword = context?.error === "password_incorrect";
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (context?.preview) { event.preventDefault(); setVisible(false); setPreviewCompleted(true); return; }
    if (!context?.request || expired || pending) { event.preventDefault(); return; }
    setPending(true);
  };

  return (
    <div className="page-surface flex h-svh min-h-0 flex-col overflow-hidden">
      <header className="page-header absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
        <div className="flex items-center gap-2.5" aria-label="kfjie MCP">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground"><Network className="size-[18px]" strokeWidth={1.7} /></span>
          <span className="text-[15px] font-semibold tracking-[-0.4px]">kfjie<span className="mx-2 font-normal text-muted-foreground/35">/</span><span className="font-normal text-muted-foreground">MCP</span></span>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><LockKeyhole className="size-3" />{publicHost}</span>
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" onClick={toggleTheme} aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </header>

      <main className="mx-auto flex h-svh min-h-0 w-full max-w-[540px] flex-col justify-center px-5 pb-10 pt-16 sm:px-0 sm:pb-12 sm:pt-20">
        <div className="authorization-stack card-enter min-h-0">
        <Card className="authorization-card gap-0 rounded-[20px] border-border/90 py-0">
          <div className="flex items-center justify-between gap-3 rounded-t-[19px] border-b bg-muted/45 px-6 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground"><ServiceIcon service={context?.service || "general"} className="size-5" /></div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-5">{context ? service.name : "MCP 服务"}</p>
                <p className="text-[11px] leading-4 text-muted-foreground">{context ? service.subtitle : "正在读取连接请求"}</p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 gap-1 rounded-md border-border bg-card px-2 py-0.5 text-[10px] font-normal text-muted-foreground"><ShieldCheck className="size-3" />授权连接</Badge>
          </div>

          <CardContent className="px-6 pb-7 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
            {!context ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground" role="status"><Loader2 className="loading-spinner size-5" />正在准备授权请求…</div>
            ) : cancelled || expired || previewCompleted ? (
              <div className="py-7 text-center" aria-live="polite">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">{previewCompleted ? <Check className="size-6" /> : cancelled ? <X className="size-6" /> : <CircleAlert className="size-6" />}</div>
                <h1 className="text-xl font-semibold tracking-tight">{previewCompleted ? "预览完成" : cancelled ? "已取消连接" : "授权请求已过期"}</h1>
                <p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-6 text-muted-foreground">{previewCompleted ? "这里只演示页面交互，没有建立真实授权连接。" : cancelled ? "本次连接尚未授权。你可以关闭此窗口，或返回继续授权。" : "请回到发起连接的客户端，重新连接此 MCP 服务。"}</p>
                {(cancelled || previewCompleted) && !expired ? <Button className="mt-7 h-10 w-full" variant="outline" onClick={() => { setCancelled(false); setPreviewCompleted(false); }}>返回授权页<ArrowRight className="size-4" /></Button> : <div className="mt-7 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">此窗口可以安全关闭</div>}
              </div>
            ) : (
              <>
                <div className="auth-intro mb-5 sm:mb-6">
                  <h1 className="text-[23px] font-semibold leading-[1.45] tracking-[-0.7px]">允许<span className="mx-1.5 break-words text-[var(--service)]">{context.clientName}</span>连接吗？</h1>
                  <p className="mt-2 text-[13px] leading-[1.9] text-muted-foreground">连接后，客户端可通过{service.name === "Agent Reach" ? " Agent Reach " : service.name}使用以下功能。</p>
                  {context.accountLabel && <p className="mt-2 break-words text-[13px] leading-5">账号：{context.accountLabel}</p>}
                </div>

                <div className="permission-list space-y-3.5 pb-5 sm:space-y-4 sm:pb-6">
                  {service.permissions.map(permission => {
                    const Icon = permissionIcons[permission.icon];
                    return <div className="flex gap-3.5" key={permission.title}>
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" strokeWidth={1.65} /></span>
                      <div><p className="text-[13px] font-medium leading-5">{permission.title}</p><p className="permission-description mt-0.5 text-[11.5px] leading-5 text-muted-foreground">{permission.description}</p></div>
                    </div>;
                  })}
                </div>

                <div className="auth-divider mb-5 h-px bg-border sm:mb-6" />
                <form action={context.action} method="post" onSubmit={onSubmit} className="space-y-4">
                  <input type="hidden" name="request" value={context.request} />
                  <div className="space-y-2">
                    <Label htmlFor="mcp-password" className="flex items-center gap-1.5 text-xs font-medium"><KeyRound className="size-3.5 text-muted-foreground" />MCP 连接密码</Label>
                    <div className="relative">
                      <Input id="mcp-password" name="password" type={visible ? "text" : "password"} autoComplete={context.preview ? "off" : "current-password"} placeholder={context.preview ? "预览无需填写真实密码" : "输入此服务的连接密码"} required={!context.preview} readOnly={pending} aria-invalid={deniedPassword ? true : undefined} aria-describedby={deniedPassword ? "password-error password-help" : "password-help"} className="h-11 rounded-lg bg-card pr-11 text-[13px] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/20" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setVisible(!visible)} aria-label={visible ? "隐藏密码" : "显示密码"} aria-pressed={visible} className="absolute right-1 top-1 size-9 text-muted-foreground hover:bg-transparent hover:text-foreground">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button>
                    </div>
                    {deniedPassword && <p id="password-error" className="flex items-start gap-1.5 text-xs leading-5 text-destructive" role="alert"><CircleAlert className="mt-0.5 size-3.5 shrink-0" />连接密码不正确，请检查后重试。</p>}
                    <p id="password-help" className="text-[11px] leading-5 text-muted-foreground">{context.preview ? "这是界面预览，不会提交密码或创建连接。" : "使用此 MCP 服务的连接密码，无需输入平台账号密码。"}</p>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" className="auth-action h-11 flex-1 rounded-lg text-[13px]" disabled={pending} onClick={() => { setCancelled(true); setVisible(false); }}>取消</Button>
                    <Button type="submit" className="auth-action auth-action-primary h-11 flex-[2] gap-2 rounded-lg text-[13px] font-medium" disabled={pending}>{pending ? <><Loader2 className="loading-spinner size-4" />正在授权…</> : <>授权并连接<ArrowRight className="size-4" /></>}</Button>
                  </div>
                </form>

                <details className="connection-details group relative mt-4 rounded-lg border border-border/80 text-[11px] sm:mt-5">
                  <summary aria-controls="connection-detail-layer" className="flex list-none items-center justify-between rounded-lg px-3.5 py-2.5 text-muted-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-ring"><span className="flex items-center gap-2"><Globe2 className="size-3.5" />连接详情</span><ChevronDown className="size-3.5 transition-transform group-open:rotate-180" /></summary>
                </details>
              </>
            )}
          </CardContent>

          <div className="flex items-center justify-center gap-1.5 rounded-b-[19px] border-t bg-muted/35 px-4 py-3 text-[10px] text-muted-foreground"><LockKeyhole className="size-3" />凭据仅用于验证此连接</div>
        </Card>
        {context && !cancelled && !expired && !previewCompleted && (
          <div id="connection-detail-layer" className="details-layer" aria-label="连接详情">
            <dl className="details-layer-content">
              <div><dt>回调地址</dt><dd className="pointer-events-auto cursor-help" title={context.callbackHost}>{context.callbackHost}</dd></div>
              <div><dt>授权范围</dt><dd className="font-mono">{service.scope}</dd></div>
              <div><dt>请求有效期</dt><dd className="tabular-nums">{remaining === null ? "—" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}</dd></div>
            </dl>
          </div>
        )}
        {context && !cancelled && !expired && !previewCompleted && (
          <button type="button" className="details-original-hitbox" aria-hidden="true" tabIndex={-1} onClick={(event) => event.currentTarget.closest(".authorization-stack")?.querySelector("details")?.removeAttribute("open")} />
        )}
        </div>

        <footer className="page-footer mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground sm:mt-5"><Check className="size-3" strokeWidth={1.5} />由 kfjie 提供<span className="mx-1 text-muted-foreground/30">·</span>Model Context Protocol</footer>
      </main>
    </div>
  );
}
