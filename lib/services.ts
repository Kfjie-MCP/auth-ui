export type ServiceId = "agent-reach" | "transcriptor" | "xuexitong" | "mailbridge" | "general";

export const services = {
  "agent-reach": {
    name: "Agent Reach",
    subtitle: "多平台公开内容检索",
    category: "内容检索",
    scope: "reach:read",
    permissions: [
      { icon: "search", title: "搜索公开内容", description: "跨平台查找帖子、文章和社区讨论" },
      { icon: "file", title: "读取链接内容", description: "获取公开页面与帖子中的有效信息" },
      { icon: "layers", title: "整理检索结果", description: "在对话中汇总、比较与引用内容" },
    ],
  },
  transcriptor: {
    name: "视频理解",
    subtitle: "Transcriptor MCP",
    category: "视频与音频",
    scope: "videos:read",
    permissions: [
      { icon: "video", title: "读取视频信息与字幕", description: "获取视频元信息、字幕与内容摘要" },
      { icon: "audio", title: "转录音频内容", description: "生成语音转录及对应时间轴" },
      { icon: "image", title: "查看视频画面", description: "提取指定时间的画面辅助理解" },
    ],
  },
  xuexitong: {
    name: "学习通",
    subtitle: "Xuexitong MCP",
    category: "学习与课程",
    scope: "xuexitong:read",
    permissions: [
      { icon: "book", title: "读取课程信息", description: "查看课程、章节与学习安排" },
      { icon: "file", title: "查看作业与学习资料", description: "获取作业信息和课程资源" },
      { icon: "download", title: "获取课件与课表", description: "下载课程资料及导出课表" },
    ],
  },
  mailbridge: {
    name: "邮件",
    subtitle: "MailBridge MCP",
    category: "邮箱与通信",
    scope: "mail:full",
    permissions: [
      { icon: "mail", title: "搜索与读取邮件", description: "访问已配置邮箱的文件夹、邮件正文与会话" },
      { icon: "send", title: "发送与回复邮件", description: "使用已授权邮箱发送、回复及转发邮件" },
      { icon: "paperclip", title: "管理邮箱内容", description: "处理附件、邮件状态、文件夹及删除操作" },
    ],
  },
  general: {
    name: "MCP 服务", subtitle: "连接授权", category: "MCP", scope: "", permissions: [],
  },
} as const;

export interface AuthContext {
  service: ServiceId;
  request: string;
  clientName: string;
  callbackHost: string;
  action: string;
  expiresAt: number;
  error: "password_incorrect" | "request_expired" | null;
  preview?: boolean;
}
