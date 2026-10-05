# 英雄池继续补齐与部分记录展示 · 2026-10-06

## 当前覆盖

- 沿用现有 19 支战队、95 名首发身份。
- 95 名选手均有可展示的英雄池；87 名完整，8 名为部分数据。
- 部分数据展示已收录场次，并说明场次与胜率仅按已核验比赛计算。
- “完整”指当前快照范围，不表示仍在进行的赛段已经结束。
- 发布状态：本地检查通过，等待 GitHub 部署密钥配置后推送并核验 Production。

## 本轮新增记录

| 战队 | 选手 | 新增记录 | 当前结果 |
| --- | --- | --- | --- |
| MVK | Harky | 8 月 29 日对 CFO 的 4 局 | 28 场 / 13 胜，完整 |
| LOS | Feisty | 9 月 12 日对 FUR 的 4 局、9 月 27 日对 LOUD 的 5 局 | 24 场 / 18 胜，完整 |
| C9 | Thanatos | 11 场季后赛统计、10 月 3 日对 LYON 前三局 | 31 场 / 18 胜，部分 |
| C9 | Loki | 10 月 3 日对 LYON 前三局 | 31 场，部分 |
| C9 | Vulcan | 10 月 3 日对 LYON 前三局 | 31 场，部分 |
| FUR | JoJo | 9 月 26 日对 RED 的 Thresh、Yuumi、Shen 三局 | 21 场 / 15 胜，部分 |

合计新增 37 条选手逐局贡献记录。没有把已有片段再次累计；同一赛段采用已核验最大覆盖片段。

## 仍缺记录

| 战队 | 选手 | 已收录总场次 | 当前缺项 |
| --- | --- | ---: | --- |
| C9 | Thanatos | 31 | 10 月 3 日对 LYON 第四局 |
| C9 | Loki | 31 | 10 月 3 日对 LYON 第四局 |
| C9 | Vulcan | 31 | 10 月 3 日对 LYON 第四局 |
| FUR | Guigo | 27 | 最近季后赛系列赛的个人英雄记录 |
| FUR | Tatu | 21 | 完整个人出场与英雄记录；Shini 的替补出场不能算入 Tatu |
| FUR | Tutsz | 27 | 最近季后赛系列赛的个人英雄记录 |
| FUR | Ayu | 27 | 最近季后赛系列赛的个人英雄记录 |
| FUR | JoJo | 21 | 缺 9 月 12 日、9 月 26 日其余两局及 10 月 3 日逐局记录 |

资料缺项沿用上一份报告：Yike、Busio、Dhokla 的多国籍信息仍未官方确认。姓名、DOB 与动态年龄均已录入，第三方补充明确标记 SECONDARY。

## 来源与统计范围

- [Harky 比赛记录](https://gol.gg/players/player-matchlist/5166/season-ALL/split-ALL/tournament-LCP%202026%20Split%203/)、[Winrate.gg Harky](https://winrate.gg/pro/player/harky)。
- [Feisty 比赛记录](https://gol.gg/players/player-matchlist/4234/season-ALL/split-ALL/tournament-ALL/)：具体来源以 gol-segments.json 中核对过的 player ID / URL 为准。
- [Thanatos 季后赛统计](https://gol.gg/players/player-stats/3434/season-ALL/split-ALL/tournament-LCS%202026%20Summer%20Playoffs/)、[LeagueLab Thanatos](https://leaguelab.cc/en/players/thanatos)。
- [Post-Match Team 对 LYON 第二、三局赛果表](https://www.reddit.com/r/leagueoflegends/comments/1wx1832/cloud9_vs_lyon_lcs_2026_summer_playoffs_lower/)：仅使用主帖赛果表，与 GoL 系列赛胜负及逐局时长交叉核验，不使用评论。
- [C9 对 LYON 第一局](https://gol.gg/game/stats/83292/page-fullstats/)、[系列赛胜负](https://gol.gg/game/stats/83292/page-summary/)。
- [JoJo 对 RED 的 Shen 逐局记录](https://gol.gg/game/stats/83087/page-fullstats/)。Thresh 与 Yuumi 的英雄比赛记录来源也保存在数据文件。

继续沿用现有各赛区第三赛段 scope；LPL 区域资格赛仍计入。未混入国际赛事、前两赛段或其他杯赛。第三方来源不标为 Riot 官方统计。

## 改动范围

- 数据：champion-pools.json、gol-segments.json；同时发布上一轮已核验 supplemental-biographies.json 补充。
- 必要展示：仅选手档案页面新增“部分数据”提示并显示已有英雄统计，复用已有样式。
- 工具与校验：types.ts、validate.ts、generate-profile-pools.mjs、team-profile.mjs。
- 文档：team-profile.md、上一轮核验表、本记录。
- 未修改字体、颜色、CSS、其他页面、共享阵容、晋级队伍、种子、赛事引擎、GPR、概率模型、Monte Carlo、缓存。

## 验证

- lint、typecheck、测试、Production build 通过。
- 档案页面桌面端、390px、320px 检查；部分提示、英雄图标与表格可读。
- 现有赛事、手动结果优先、自定义模型、GPR 回退、Monte Carlo 复现及 100,000 次缓存测试通过。
- Production 发布完成后另行补入提交与线上核验结果。
