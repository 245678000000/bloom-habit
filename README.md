# Bloom Habit（绽放习惯）

让每一天都悄悄开花。

## 技术栈

- Next.js 15（App Router）
- TypeScript
- Tailwind CSS
- shadcn/ui 风格组件（`components/ui/*`）
- framer-motion
- lucide-react
- `localStorage` 持久化
- Vitest（核心逻辑单测）
- PWA（manifest + production service worker）

## 本地运行

```bash
corepack pnpm install
corepack pnpm dev
```

生产构建：

```bash
corepack pnpm build
corepack pnpm start
```

测试：

```bash
corepack pnpm test
```

## 页面

- `/` 首页 Dashboard
  - 温柔问候 + 日期
  - 近 14 天日期条 / 历史补打卡
  - **休息日**标记（不打断连胜）
  - 连胜火焰区
  - 当日环形进度 / 习惯打卡（Toast + 撤销）
  - 本周热力图（可点击切换日期；斜纹=休息）
- `/habits` 习惯库
  - 新增 / 编辑 / 删除（确认 + 撤销）/ 归档
  - 自定义星期、上下排序、emoji 预设
- `/stats` 统计
  - 最长连胜 / 总完成率
  - **自然月历**（周一为一周起点）+ 日明细
  - **按习惯**完成率与连胜
  - 每周趋势柱图
- `/settings` 设置
  - 昵称、浅色/深色
  - 导出 / 导入备份
  - 每日提醒（**仅前台有效**）
  - 重置数据（确认）

## 数据存储

- `localStorage` key: `bloom-habit-store-v1`
- 内容 `version` 当前为 **3**（含 `restDays`）；打开时自动迁移
- 主题 key: `bloom-habit-theme`
- 备份文件名: `bloom-habit-backup-YYYY-MM-DD.json`

## 休息日

标记为休息的日期：

- 不出现 due 习惯清单
- **不打断**全局 / 单习惯连胜（与「无安排日」相同，跳过）
- 不计入完成率分母
- 热力图以斜纹区分

## PWA

- `public/manifest.webmanifest` + `public/icons/icon.svg`
- Service Worker 仅在 **production** 注册（`public/sw.js`）
- 开发模式请用 `pnpm dev`；验证安装与离线请用 `pnpm build && pnpm start`

## 提醒说明

浏览器没有原生「本地闹钟」能力。本应用在 **已开启提醒、已授权通知、应用打开或前台运行** 时，于设定时间附近检查今日完成度并发送系统通知。关闭标签页后不保证送达。
