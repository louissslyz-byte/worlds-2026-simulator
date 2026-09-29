# Worlds 2026 模拟器

非官方英雄联盟全球总决赛赛事模拟网站，按照 PRD.docx 的核心流程实现。界面为中文。

## 本地运行

需要 Node.js 22.13+。运行 `pnpm install`、`pnpm dev`，打开终端显示的本地地址。可用 `pnpm typecheck`、`pnpm lint`、`pnpm test` 验证。

## 页面

- `/` 系统模型概览和创建入口
- `/rankings` 示例实力榜
- `/simulator/new` 系统模型或自定义 Tier List 设置
- `/simulator` 分阶段手动选比分、模拟剩余比赛、条件概率
- `/teams/[slug]` 队伍资料
- `/methodology` 数据与模型说明

## 模拟架构

`lib/sim/worlds2026.ts` 管理赛事参数与抽签限制；`ratingConfig.ts` 管理 Tier 到评分的映射。`RatingProvider` 和 `EsportsDataProvider` 隔离数据来源。`engine.ts` 包含 PlayIn、Swiss、Knockout 和 Worlds 的状态推进，组件只调用引擎。`monteCarlo.ts` 从当前会话状态复制样本继续模拟，保留官方和手动结果。会话保存于浏览器 localStorage，包括模式、评分快照、模型版本、Tier 快照和随机种子。

## 当前数据与限制

Riot 已公布 2026 世界赛 19 队、4 队 Bo5 双败入围赛、16 队瑞士轮和 8 队淘汰赛框架。`data.ts` 中的参赛队伍依据 [LoL Esports 世界赛名单](https://lolesports.com/en-US/tournament/115660540725177488/overview) 更新。LPL、LCK、LEC 种子顺序由用户指定；LCP 依赛区赛果排列。LCS 的 LYON、TLAW、C9 与 CBLOL 的 LOS 已列入官方名单，但对应种子未确定，因此模拟器用 LCS#1/#2/#3、CBLOL#1/#2 占位。评分为本站演示数据，并非 Riot 预测。比赛数据接口已预留；当前没有官方赛程或赛果同步。瑞士轮同战绩池抽签、种子限制及入围赛决赛重赛开关可配置，最终规则公布后需要核对。夺冠概率通过 Monte Carlo 估算，精度随样本数变化。

## 部署

使用 Vercel 的 Next.js 框架预设，项目根目录为仓库根目录，Node.js 版本为 22.x。`vercel.json` 将构建命令固定为 `pnpm build:vercel`；依赖由 `pnpm-lock.yaml` 安装，输出目录使用 Next.js 默认值。当前产品不读取运行时环境变量，不需要填写 API Key。`pnpm build` 保留为本地工作区的 Vinext/Sites 构建。

将 GitHub 仓库导入 Vercel 并将 `main` 设为 Production Branch 后，每次推送到 `main` 都会触发生产部署；其他分支推送会生成预览部署。发布后应检查 `/`、`/rankings`、`/simulator/new`、`/simulator`、`/teams/gen`、`/methodology`，并直接刷新 `/simulator`，确认路由和本地队徽资源可正常读取。模拟进度保存在当前浏览器的 localStorage，不会跨设备同步。当前公开版本采用已公布参赛队与未确定席位占位，页面明确标注模拟评分并非官方预测；取得正式种子后再更新。

## 后续优先事项

接入经过核实的官方参赛队、种子、赛程及赛果；完成真实比赛的 Live 模式和独立假设场景；根据官方最终规则确认瑞士轮与淘汰赛抽签；用职业赛事数据训练并校准系统评分。
