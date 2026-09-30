# Worlds 2026 数据快照与更新

## 当前快照

- 参赛队：`lib/sim/teamSnapshot.ts`，2026-09-30 核对，18 支真实队伍、1 个 CBLOL 待定席位。
- 官方资格来源：https://lolesports.com/en-US/tournament/115660540725177488/overview
- GPR：`lib/sim/gprSnapshot.ts`，官网标注 2026-09-29，本站 2026-09-30 核对；18 支已确认队伍均匹配。
- GPR 来源：https://lolesports.com/en-US/gpr/2026/current
- 明确的 `gprKey` 将队伍身份映射到 Riot 榜单，不按字符串模糊猜测；Cloud9 Kia/C9、Team Liquid Alienware/TLAW 等使用稳定 key。
- 本地快照包含来源、来源日期、快照日期和版本。没有每次访问抓取，也没有定时自动刷新。

## 种子与参赛身份

参赛身份已确认不等于种子已确认。`officialSeed: null` 在公开页面显示“种子待定”。数值 `seed` 是兼容赛事引擎的模拟安排，不是官方断言。此前用户确认的 LPL/LCK/LEC 顺位继续保留；LCP 使用已有区域赛顺位。LCS/CBLOL 官方种子尚未核对完成。

赛前概率使用显式默认假设：LYON #1、TLAW #2、C9 #3、LOS #1、CBLOL 待定队伍 #2。这些假设在首页、实力榜与方法页标出。创建模拟可交换 LCS/CBLOL 种子，`seedAssignments` 随本局保存，重置也保留该安排；不能重复种子。未来官方种子确认后更新统一队伍快照和假设即可，不改抽签/晋级算法。

## 概率模型

系统输入为 Riot GPR 分数。`GprProbabilityModel` 使用：

Δ = GPR_A − GPR_B
P(A 胜) = 1 / (1 + 10^(-kΔ/400))，k=0.85。

系数位于 `lib/sim/ratingConfig.ts`，模型 `gpr-prob-v1.1`，状态为 heuristic。没有可靠的同期历史快照，因此未做历史 Log Loss/Brier 校准。引擎内部保留等价强度值以兼容既有逐局比赛模拟，但公开页面不再展示第二套系统 Rating。Custom Tier 映射与逐局模拟不变。

缺少 GPR 的队伍/席位进入现有回退模型，不编造官方分数。当前回退仅 CBLOL 待定队伍。Riot 官方排名与本站晋级/夺冠概率分开展示。

## 手动更新流程

1. 核对官方参赛资格，更新 `teamSnapshot.ts` 的身份、官方种子、映射、来源及日期。
2. 核对官方 GPR 分数，更新 `gprSnapshot.ts` 的条目、日期与版本，新增队徽到 `public/team-logos`。
3. 运行 `pnpm update-worlds-data`：先验证身份、slug、映射、分数和本地 Logo，再生成 100,000 次完整赛事概率。
4. 运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build:vercel`。
5. 预览主要页面与系统/自定义模拟，然后推送 main，Vercel 自动构建部署。

验证失败不会覆盖生产概率文件。结果保存模拟数量、生成时间、模型版本、GPR/队伍快照日期和输入 hash。队伍、GPR、参数、种子假设或赛事状态改变都会改变 hash；过期概率会阻止生产构建。首页/实力榜读取预生成结果，不在访问时执行 100k；本局概率继续由后台 Worker 计算并按状态复用缓存。

## 保留限制

1 个身份待定席位、LCS/CBLOL 种子未知、启发式系数，以及暂无正式赛果自动同步。新确认的四支队伍选手名单尚待核对，不编造阵容。

赛程时间使用北京时间 CST（UTC+8）。来源为 LoL Esports；队徽使用官方站点公开资源，本地加载并保留 initials fallback。参见 `docs/logo-sources.md`。
