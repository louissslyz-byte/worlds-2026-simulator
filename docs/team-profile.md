# 战队档案：数据与验收记录

资料核对日：2026-10-05（CST）。

## 范围

19 支队伍直接复用现有 Worlds Team Snapshot 的 identity 与 officialSeed；没有改动参赛资格、种子、实力模型或模拟状态。模块不显示 GPR、Rating 或模型预测。95 名选手；C9 中路 Loki、下路 Tactical，依据用户确认与 Liquipedia Worlds 阵容核对。当前公开阵容不等于已经核验的 Worlds 注册首发名单。

## 数据来源

姓名、DOB、年龄与国籍：只发布已经核验的 Riot / 官方战队资料，各字段 source 见 snapshot.ts。共 32 个真实姓名、5 个完整出生日期、10 个年龄（5 个动态计算，5 个官方页面所载年龄）、5 名选手的国籍信息。G2 SkewMond 与 Labrov 的官方姓名资料存在拼写冲突，未采用任何猜测拼写。完整逐名缺失字段见下表。

英雄池：Games of Legends 公共统计页与逐局比赛记录，静态下载整理，79 名选手已通过本地场次/胜场一致性与官网已完成系列赛场次对照。16 名选手无法确认完整覆盖，未发布部分统计；来源可能为较旧缓存，后续需更新。Liquipedia 作为可信第三方来源使用，部分统计页仍无法读取；Oracle's Elixir 当前下载限额，取得的第三方镜像只到 3 月，未用于第三赛段。英雄图标与 ID 目录：Riot Data Dragon 16.19.1。页面展示快照日期和每个统计来源链接，不在用户访问时抓取网站。

晋级之路：LoL Esports 六赛区官方赛事页的 81 场已完成系列赛；CBLOL 另有 28 场常规赛记录，LOS 6–1、FUR 5–2。其他赛区完整常规赛战绩待核验，不冒充完整战绩。仅展示实际已完成赛果，不预测未来比赛。

## 第三赛段范围

- LCK：2026 LCK 第三赛段；Rounds 3–4 + Season Play-In + Season Playoffs。
- LPL：2026 LPL 第三赛段及区域资格赛；常规赛 + 季后赛资格赛 + 季后赛 + 区域资格赛。
- LEC：2026 LEC Summer；常规赛 + 季后赛。
- LCS：2026 LCS Summer；常规赛 + 季后赛。
- LCP：2026 LCP Split 3；瑞士轮 + 资格赛 + 季后赛。
- CBLOL：2026 CBLOL Split 2 / Etapa 2；常规赛 + 季后赛（截至资料核对日）。

LPL 计入独立 Regional Finals：TES 五人各增加 4 局，IG 五人各增加 8 局；AL、BLG 没有参加资格赛，不增加该段。LCP GOL Split 3 已合并全部子阶段，不重复统计。所有赛区排除 Worlds、MSI、First Stand、前两个赛段及其他杯赛。CBLOL 仍在进行，仅统计截至核对日已完成比赛。

## 未发布的英雄池

AL / Kael、G2 / BrokenBlade、MKOI / Jojopyun、KC / Yike、KC / kyeahoo、KC / Busio、MVK / Harky、C9 / Thanatos、C9 / Loki、C9 / Vulcan、LOS / Feisty、FUR / Guigo、FUR / Tatu、FUR / Tutsz、FUR / Ayu、FUR / JoJo。

## 更新与验证

修改模块专用 gol-segments.json / gol-match-rows.json，确认完整赛段覆盖、玩家身份映射及官方场次一致性后，运行：

`node --import tsx scripts/generate-profile-pools.mjs`

生成 champion-pools.json；不读取或写入任何概率快照。然后运行 lint、typecheck、tests、production build。Hero 目录默认使用随项目保存的 champion-catalog.json，也可提供新的 Data Dragon JSON 文件路径。

## 本次数据补充

本次只更新 snapshot.ts、data.ts 的 LPL 统计范围、gol-player-mapping.json、gol-segments.json、champion-pools.json、统计生成脚本、模块测试和本报告。未修改任何页面、UI component、样式、导航或共享 roster。完整英雄池从 72 人增至 79 人：新增 Myrwn、Shad0w、Kino、Kratos、Chika、SiuLoong、Tactical。其余 16 人的可用来源缺少常规赛/季后赛或最新系列赛场次，继续显示待核验，不把旧缓存标为完整。Loki 的身份已确认，英雄池仍缺少最新系列赛。

## 页面与文件

- /teams：6 个赛区，按官方种子排列，未知种子列最后。
- /teams/[slug]：身份、五位置阵容、晋级时间线。沿用现有详情 URL，新页面仅显示客观信息。
- /teams/[slug]/[player]：身份资料与英雄池。
- app/teams、components/team-profile、lib/team-profile：模块专用。
- components/site-navigation.tsx：只新增档案入口；移动端保留可见入口。
- tests/team-profile.mjs、tests/run.mjs：数据校验及模块隔离测试。

桌面双列队伍列表 / 五列阵容；手机单列列表 / 3+2 阵容；英雄池紧凑三列；晋级之路纵向时间线。复用现有字体、颜色、spacing、位置 SVG 图标，没有改动全站 Design System。

## 本轮验收结果

lint、typecheck、全部 tests、Next.js production build 均通过。115 个档案路由返回 200；无效队伍 / 选手和 C9 的 APA、Zven 路径返回 404。浏览器实际检查 C9 五人阵容、Tactical 英雄池，以及 390px / 320px 的英雄图标、场次、胜率和可读性。没有新增 UI 或调整样式。更新暂保存在当前工作区，尚未推送或部署。

## 逐名资料核验

| Team | Role | Player ID | Real Name | DOB | Age | Nationality | Champion Pool |
|---|---|---|---|---|---|---|---|
| GEN | 上路 | Kiin | Gi In Kim | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| GEN | 打野 | Canyon | Geon Bu Kim | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| GEN | 中路 | Chovy | Ji Hun Jung | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| GEN | 下路 | Ruler | Park Jae-hyuk | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| GEN | 辅助 | Duro | Joo Min-kyu | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| HLE | 上路 | Zeus | CHOI WOOJE | 2004-01-31 | 22 | UNVERIFIED | 已核对 |
| HLE | 打野 | Kanavi | SEO JINHYEOK | 2000-11-02 | 25 | UNVERIFIED | 已核对 |
| HLE | 中路 | Zeka | KIM GEONWOO | 2002-11-28 | 23 | UNVERIFIED | 已核对 |
| HLE | 下路 | Gumayusi | LEE MINHYUNG | 2002-02-06 | 24 | UNVERIFIED | 已核对 |
| HLE | 辅助 | Delight | YU HWANJUNG | 2002-09-12 | 24 | UNVERIFIED | 已核对 |
| T1 | 上路 | Doran | HYEONJUN CHOI | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| T1 | 打野 | Oner | HYUNJUN MUN | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| T1 | 中路 | Faker | Lee Sang-hyeok | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| T1 | 下路 | Peyz | SOOHWAN KIM | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| T1 | 辅助 | Keria | MINSEOK RYU | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| DK | 上路 | Siwoo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| DK | 打野 | Lucid | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| DK | 中路 | ShowMaker | Heo Su | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| DK | 下路 | Smash | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| DK | 辅助 | Career | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 上路 | Breathe | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 打野 | Tarzan | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 中路 | Shanks | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 下路 | Hope | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 辅助 | Kael | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| BLG | 上路 | Bin | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 打野 | Xun | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 中路 | Knight | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 下路 | Viper | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 辅助 | ON | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 上路 | ZUIAN | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 打野 | Tian | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 中路 | Creme | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 下路 | JackeyLove | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 辅助 | Zhuo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| IG | 上路 | TheShy | SEUNG-LOK KANG | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| IG | 打野 | Wei | YANG-WEI YAN | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| IG | 中路 | Rookie | UI-JIN SONG | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| IG | 下路 | JiaQi | JIAQI ZI | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| IG | 辅助 | Meiko | YE TIAN | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| G2 | 上路 | BrokenBlade | Sergen Çelik | UNVERIFIED | 26 | Germany (DE) / Turkey (TR) | UNVERIFIED |
| G2 | 打野 | SkewMond | UNVERIFIED | UNVERIFIED | 22 | France (FR) / Lebanon (LB) | 已核对 |
| G2 | 中路 | Caps | Rasmus Winther | UNVERIFIED | 26 | Denmark (DK) | 已核对 |
| G2 | 下路 | Hans Sama | Steven Liv | UNVERIFIED | 27 | France (FR) | 已核对 |
| G2 | 辅助 | Labrov | UNVERIFIED | UNVERIFIED | 24 | Greece (GR) | 已核对 |
| MKOI | 上路 | Myrwn | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MKOI | 打野 | Elyoya | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MKOI | 中路 | Jojopyun | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| MKOI | 下路 | Supa | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MKOI | 辅助 | Alvaro | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| KC | 上路 | Canna | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| KC | 打野 | Yike | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| KC | 中路 | kyeahoo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| KC | 下路 | Caliste | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| KC | 辅助 | Busio | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| TSW | 上路 | Pun | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 打野 | Hizto | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 中路 | Dire | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 下路 | Eddie | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 辅助 | Bie | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 上路 | Rest | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 打野 | Shad0w | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 中路 | POUT | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 下路 | Doggo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 辅助 | Kino | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 上路 | Kratos | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 打野 | Gury | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 中路 | Chika | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 下路 | Harky | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| MVK | 辅助 | SiuLoong | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 上路 | Dhokla | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 打野 | Inspired | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 中路 | Saint | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 下路 | Berserker | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 辅助 | Isles | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TLAW | 上路 | Morgan | RUHAN PARK | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TLAW | 打野 | Josedeodo | BRANDON VILLEGAS | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TLAW | 中路 | Quid | HYEONSEUNG LIM | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TLAW | 下路 | Yeon | SEAN SUNG | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TLAW | 辅助 | CoreJJ | YONGIN JO | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| C9 | 上路 | Thanatos | Seung-gyu Park | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| C9 | 打野 | Blaber | Robert Huang | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| C9 | 中路 | Loki | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| C9 | 下路 | Tactical | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| C9 | 辅助 | Vulcan | Philippe Laflamme | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| LOS | 上路 | Zest | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LOS | 打野 | Curse | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LOS | 中路 | Feisty | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| LOS | 下路 | Duduhh | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LOS | 辅助 | Ackerman | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| FUR | 上路 | Guigo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| FUR | 打野 | Tatu | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| FUR | 中路 | Tutsz | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| FUR | 下路 | Ayu | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
| FUR | 辅助 | JoJo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED |
