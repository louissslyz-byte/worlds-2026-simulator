# Worlds 2026 模拟器

中文、非官方的英雄联盟全球总决赛赛事模拟器。项目沿用原有 Play-In、Swiss、淘汰赛引擎和浏览器会话状态。原始产品需求保存在工作区的 `PRD.docx`；仓库内当前没有 `/docs/PRD.md`。

## 本地运行

需要 Node.js 22.x 和 pnpm 9。执行 `pnpm install`、`pnpm dev`。质量检查：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build:vercel`。

## 页面

- `/`：赛前夺冠概率、系统实力榜和日程
- `/rankings`：官方 GPR 与本站模型数据分列展示
- `/simulator/new`：系统模型或自定义 Tier List
- `/simulator`：手动选比分、分阶段模拟、条件概率与冠军
- `/teams/[slug]`：队伍、选手名单和模拟指标
- `/methodology`：数据来源、公式与模型限制

## 数据和模型

`lib/sim/gprSnapshot.ts` 是 [Riot 官方 2026 GPR](https://lolesports.com/en-US/gpr/2026/current) 的本地快照。`RiotGprProvider` 读取快照，`GprRatingAdapter` 按 `lib/sim/ratingConfig.ts` 的参数转换为系统评分。未确定队伍身份的 LCS 和 CBLOL 席位使用原有回退评分；页面明确标示 `CACHED` 和 `FALLBACK`。访问页面时不向 Riot 发请求。

GPR 是官方队伍实力数据。单局、Bo3、Bo5 和夺冠概率均由本站模型计算。自定义 Tier List 独立生成评分快照，不使用 GPR 计算比赛胜率。会话保存在当前浏览器的 localStorage；每局保留建局时的评分、Tier 排序、模型版本和随机种子。

首页、实力榜和队伍页直接读取 `lib/sim/precomputedOdds.json`，不会让访客运行 10 万次模拟。该文件由 `pnpm odds:generate` 在本地生成，包含模拟次数、生成时间、模型版本、实力数据版本与赛事状态哈希。构建时会验证快照是否仍对应当前系统评分。模拟器内的条件概率使用 Web Worker 在后台运行 5,000 次，并按赛事状态哈希复用浏览器缓存。

更新官方 GPR 或评分参数后，应先核对官方榜单，更新 `gprSnapshot.ts` 的分数、更新时间与 `strengthVersion`，再运行 `pnpm odds:generate`，最后执行质量检查和构建。详细来源与操作见 [docs/data-sources.md](docs/data-sources.md)。

## 部署

Vercel 使用 Next.js 预设、Node.js 22.x，`vercel.json` 以 `pnpm build:vercel` 构建。当前产品无需运行时 API Key 或环境变量；官方 GPR 和 10 万次模拟结果随仓库发布。推送到 GitHub `main` 后，已连接的 Vercel 项目会自动构建并发布。直接访问或刷新 `/simulator` 等路由应由 Next.js 正常处理。

发布后检查 `/`、`/rankings`、`/simulator/new`、`/simulator`、`/methodology`、`/teams/gen`，并测试队徽、自定义 Tier、手动结果保留及完整模拟。概率是模型估计，不代表官方预测或确定赛果。

### 当前数据更新

队伍身份集中在 `lib/sim/teamSnapshot.ts`，官方 GPR 在 `lib/sim/gprSnapshot.ts`。更新后运行 `pnpm update-worlds-data` 验证并生成 100,000 次概率，再通过检查和生产构建。完整流程与种子假设见 [数据说明](docs/data-sources.md)。当前模型 `gpr-prob-v1.1` 使用启发式 k=0.85，尚未历史校准。
