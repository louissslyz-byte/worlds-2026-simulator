# 数据来源与更新

## Riot GPR

- 官方页面：[2026 Global Power Rankings](https://lolesports.com/en-US/gpr/2026/current)
- 当前快照：Riot 页面标注 2026-09-29 更新；本站于 2026-09-30 核对
- 本地数据：`lib/sim/gprSnapshot.ts`
- 覆盖范围：14 支已确定身份的参赛队
- 回退范围：LCS#1、LCS#2、LCS#3、CBLOL#1、CBLOL#2

这些席位尚未映射到确定队伍身份，因此没有对应的官方 GPR 分数。它们继续使用 `lib/sim/data.ts` 中保留的系统评分。`CACHED` 表示采用已核对的本地快照，不表示实时联网；`FALLBACK` 表示使用原有评分。若 Riot 页面暂时无法访问，已发布站点仍使用快照。

更新步骤：核对官方队名、排名和分数；修改 `gprSnapshot.ts` 的条目、`sourceUpdatedAt`、`fetchedAt` 和 `strengthVersion`；必要时更新参赛名单；运行 `pnpm odds:generate`；运行 lint、typecheck、test 和 `pnpm build:vercel`；检查首页、实力榜及模拟器。不要根据排名自行推断分数，也不要将本站夺冠概率称为 Riot 官方预测。

## 其他来源

- 参赛队与赛段：[LoL Esports 赛事页面](https://lolesports.com/en-US/tournament/115660540725177488/overview)
- 赛段日期：[LoL Esports 更新](https://lolesports.com/en-US/news/msi-and-worlds-updates)
- 开赛时间：[LoL Esports 场馆与赛事说明](https://lolesports.com/en-US/lolesports/news/worlds-2026-venue-event-policies)

比赛时间以北京时间 CST（UTC+8）显示。参赛名单和部分种子由已核对的官方资料及用户确认的信息组成；尚未确认的席位保留赛区加种子号。当前没有自动同步正式赛果。队徽为 `public/team-logos` 下的本地资源，加载失败时统一显示队伍缩写。

## 模拟结果

`lib/sim/precomputedOdds.json` 由固定种子和当前系统实力生成，默认 100,000 次。它记录 `simulationCount`、`generatedAt`、`modelVersion`、`strengthVersion`、`tournamentStateHash`。GPR 转评分的参数集中在 `lib/sim/ratingConfig.ts`，模拟次数集中在 `lib/sim/oddsConfig.ts`。如名单、规则、评分或版本发生变化，需重新生成概率快照。
