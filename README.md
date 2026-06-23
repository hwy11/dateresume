# TraceDay · 时间复盘

每天从 6:00 到 24:00，一眼看清时间流到哪里去了。

![TraceDay](https://img.shields.io/badge/React-19-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## 功能

- **时间轴审计台**：纵向 06:00–24:00，拖拽空白区域快速切块记录
- **效率标记**：点击时间块循环切换 未标 / 高效 / 中效 / 低效，左侧色条即时反馈
- **缩放精度**：四档缩放（概览 60 分 → 30 分 → 15 分 → 5 分），支持 `Ctrl+滚轮` 与 ± 按钮
- **今日概览**：已记录 / 未记录时长、效率分布进度条
- **导出 Markdown**：预览后复制或下载，效率用文字标签，方便丢给 AI 复盘
- **Supabase 后端**：用户认证 + 云端同步；未配置时自动降级为本地存储演示

## 快速开始

```bash
npm install
cp .env.example .env   # 填入 Supabase 项目 URL 和 anon key
npm run dev
```

浏览器打开 http://localhost:5173

## Supabase 配置

1. 在 [Supabase](https://supabase.com) 创建项目
2. SQL Editor 中执行 `supabase/migrations/001_init.sql`
3. Settings → API 复制 `Project URL` 和 `anon public` key 到 `.env`：

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

4. Authentication → Providers 启用 Email

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS v4
- Supabase (Auth + PostgreSQL)

## 设计规范

| 元素 | 色值 |
|------|------|
| 背景 | `#F6F7FB` |
| 主卡片 | `#FFFFFF` |
| 主文字 | `#111827` |
| 弱文字 | `#6B7280` |
| 边框 | `#E5E7EB` |
| 高效 | `#22C55E` |
| 中效 | `#EAB308` |
| 低效 | `#F97316` |
| 未标 | `#9CA3AF` |

## License

MIT
