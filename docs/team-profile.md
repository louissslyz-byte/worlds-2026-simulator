# 战队档案：数据与验收记录

最新补齐记录：[2026-10-06 核验表](./team-profile-completion-2026-10-06.md)。下文保留上一轮历史记录。

资料核对日：2026-10-05（CST）。本轮仅补充档案数据和必要展示，未发布到 Production。

## 范围与本轮修改

仍复用 19 支已确认参赛队伍的现有 identity、种子和 95 名选手阵容。没有新建路由，没有修改参赛资格、种子、共享 roster、全站样式、赛事状态、GPR、Rating、Probability、Monte Carlo 或 100,000 次概率缓存。详细选手资料仍只出现在 /teams/[slug]/[player]；Champion Roster 保持位置图标 + Player ID。

- /teams：每队增加常规赛战绩与排名；原赛区与种子排序不变。
- /teams/[slug]：晋级之路增加常规赛战绩、排名、口径与来源。
- /teams/[slug]/[player]：补充缺失资料；沿用原 UI，不改字体、颜色、布局、动画。

## 覆盖情况

| 字段 | 上轮 | 当前 | 新增 | 仍缺失 |
|---|---:|---:|---:|---:|
| 常规赛战绩与排名 | 2 支战绩、未单独存排名 | 19 支 | 全部排名及其他 17 支战绩 | 0 |
| Real Name | 32 | 53 | 21 | 42 |
| 完整 DOB | 5 | 34 | 29 | 61 |
| 可显示年龄 | 10 | 37 | 27 | 58 |
| Nationality | 5 | 34 | 29 | 61 |
| 完整第三赛段英雄池 | 79 | 79 | 0 | 16 |

年龄按 2026-10-05 CST 核验；34 人由出生日期动态计算，3 人仅有原官方年龄与核验日期。既有官方资料优先，未用第三方不同拼写覆盖官方值。

## 常规赛战绩与排名

LCK：累计战绩包含 Rounds 1–2 结转；另展示 Rounds 3–4 战绩。排名是传奇组最终排名。LPL：各自常规赛组内排名。LCP：瑞士轮结束时名次，CFO、MVK 并列第二，不包含后续种子决定赛。LEC、LCS、CBLOL：相应第三赛段常规赛最终积分榜。

| 赛区 | 战队 | 常规赛战绩 | 排名口径 | Rounds 3–4 | 来源 |
|---|---|---|---|---|---|
| LCK | GEN | 19–7 | 传奇组 · 第 1 名 | 5–3 | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548147890329817/stage/115548147896621274) / [Liquipedia · LCK 常规赛累计积分榜](https://liquipedia.net/leagueoflegends/LCK/2026/Rounds_3-4) |
| LCK | HLE | 19–7 | 传奇组 · 第 2 名 | 4–4 | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548147890329817/stage/115548147896621274) / [Liquipedia · LCK 常规赛累计积分榜](https://liquipedia.net/leagueoflegends/LCK/2026/Rounds_3-4) |
| LCK | T1 | 17–9 | 传奇组 · 第 3 名 | 3–5 | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548147890329817/stage/115548147896621274) / [Liquipedia · LCK 常规赛累计积分榜](https://liquipedia.net/leagueoflegends/LCK/2026/Rounds_3-4) |
| LCK | DK | 17–9 | 传奇组 · 第 4 名 | 6–2 | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548147890329817/stage/115548147896621274) / [Liquipedia · LCK 常规赛累计积分榜](https://liquipedia.net/leagueoflegends/LCK/2026/Rounds_3-4) |
| LPL | AL | 9–5 | 登峰组 · 第 2 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115616254668930796/stage/115616269722396460) |
| LPL | BLG | 12–2 | 登峰组 · 第 1 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115616254668930796/stage/115616269722396460) |
| LPL | TES | 9–5 | 登峰组 · 第 3 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115616254668930796/stage/115616269722396460) |
| LPL | IG | 4–2 | 涅槃组 · 第 2 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115616254668930796/stage/115616269722396460) |
| LEC | G2 | 6–3 | 第 3 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548681802226458/stage/115548681802750747) |
| LEC | MKOI | 4–5 | 第 6 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548681802226458/stage/115548681802750747) |
| LEC | KC | 9–0 | 第 1 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115548681802226458/stage/115548681802750747) |
| LCP | TSW | 3–0 | 瑞士轮 · 第 1 名 | — | [Liquipedia · LCP 瑞士轮积分榜](https://liquipedia.net/leagueoflegends/LCP/2026/Split_3/Swiss_Stage) |
| LCP | CFO | 3–1 | 瑞士轮 · 并列第 2 名 | — | [Liquipedia · LCP 瑞士轮积分榜](https://liquipedia.net/leagueoflegends/LCP/2026/Split_3/Swiss_Stage) |
| LCP | MVK | 3–1 | 瑞士轮 · 并列第 2 名 | — | [Liquipedia · LCP 瑞士轮积分榜](https://liquipedia.net/leagueoflegends/LCP/2026/Split_3/Swiss_Stage) |
| LCS | LYON | 6–1 | 第 1 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115564797158840434/stage/115564797161986163) |
| LCS | TLAW | 6–1 | 第 2 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115564797158840434/stage/115564797161986163) |
| LCS | C9 | 5–2 | 第 3 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-US/tournament/115564797158840434/stage/115564797161986163) |
| CBLOL | LOS | 6–1 | 第 2 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-GB/tournament/115565671525288828/stage/115565671525813117) |
| CBLOL | FUR | 5–2 | 第 4 名 | — | [LoL Esports · 常规赛积分榜](https://lolesports.com/en-GB/tournament/115565671525288828/stage/115565671525813117) |

## 本轮选手资料补充

补充文件涵盖以下 33 人：GEN Kiin、Chovy、Ruler、Duro；HLE Zeus、Kanavi、Gumayusi、Delight；T1 Peyz；DK Siwoo、Lucid、Smash、Career；AL Breathe、Kael；BLG Bin；G2 BrokenBlade、SkewMond；MKOI Jojopyun；KC Yike、kyeahoo、Busio；MVK Harky；C9 Thanatos、Loki、Tactical、Vulcan；LOS Feisty；FUR Guigo、Tatu、Tutsz、Ayu、JoJo。具体各字段的原值和补充来源见数据文件及下表。

以 Riot / 战队官网已核验字段优先，缺失字段使用 Liquipedia 选手资料；FUR JoJo 姓名与 DOB 使用 Leaguepedia 巴西选手页，国籍使用 Liquipedia 巴西战队名册。JoJo 是巴西辅助 Gabriel Dzelme de Oliveira，不是同名其他地区选手。Yike、Busio 的第三方资料涉及双国籍，尚无官方确认，国籍保持未核验。SkewMond、Labrov 原官方姓名拼写冲突说明保留；SkewMond 使用 Liquipedia 补充姓名，Labrov 仍留空。

## 第三赛段范围

- LCK：2026 LCK 第三赛段；Rounds 3–4 + Season Play-In + Season Playoffs。
- LPL：2026 LPL 第三赛段及区域资格赛；常规赛 + 季后赛资格赛 + 季后赛 + 区域资格赛。
- LEC：2026 LEC Summer；常规赛 + 季后赛。
- LCS：2026 LCS Summer；常规赛 + 季后赛。
- LCP：2026 LCP Split 3；瑞士轮 + 资格赛 + 季后赛。
- CBLOL：2026 CBLOL Split 2 / Etapa 2；常规赛 + 季后赛（截至资料核对日）。

LPL 计入独立 Regional Finals：TES 五人各增加 4 局，IG 五人各增加 8 局；AL、BLG 没有参加资格赛，不增加该段。LCP GOL Split 3 已合并全部子阶段，不重复统计。所有赛区排除 Worlds、MSI、First Stand、前两个赛段及其他杯赛。CBLOL 仍在进行，仅统计截至核对日已完成比赛。

## 仍缺失的英雄池

AL / Kael、G2 / BrokenBlade、MKOI / Jojopyun、KC / Yike、KC / kyeahoo、KC / Busio、MVK / Harky、C9 / Thanatos、C9 / Loki、C9 / Vulcan、LOS / Feisty、FUR / Guigo、FUR / Tatu、FUR / Tutsz、FUR / Ayu、FUR / JoJo。

已继续检索 Liquipedia、Leaguepedia、Games of Legends。部分页面受读取限制，公开缓存又缺少最新常规赛或季后赛场次，无法核验完整统计。没有以旧缓存或部分场次冒充完整英雄池；现有 79 人统计保持不变，16 人继续显示待核验。本轮未修改 champion-pools.json、gol-segments.json 或概率数据。

## 文件与更新流程

新增数据：lib/team-profile/regular-season.json、lib/team-profile/supplemental-biographies.json。所有字段保存来源链接和核对日期。

修改：lib/team-profile/data.ts、types.ts、validate.ts；components/team-profile/qualification-path.tsx；app/teams/page.tsx；app/teams/[slug]/[player]/page.tsx；tests/team-profile.mjs；docs/team-profile.md。

常规赛数据更新后运行档案校验和测试。英雄池仍沿用既有流程：核实完整场次后更新 gol-segments.json / gol-match-rows.json，再运行 scripts/generate-profile-pools.mjs；不读取或写入概率缓存。

## 验收

lint、typecheck、全部 tests、Next.js production build 均通过。120 个路由请求（档案 115 个及现有主要页面 5 个）返回 200。已实际用 Chrome 检查桌面 /teams、390px 与 320px 的 DK 战绩和晋级之路、320px 的 Tactical 资料；已有阵容与英雄池显示方式保持。档案列表手机布局继续为单列，战绩行自然换行，未改 CSS。

本轮改动尚未推送 GitHub / 部署；Production 仍为此前发布版本。

## 逐名核验表

Age 为 2026-10-05 CST 的核验值；实际页面动态计算 DOB 年龄。UNVERIFIED 表示尚无可发布的核验资料。Source 可包含原官方与第三方资料；每个字段的具体来源保存在数据文件中。

| Team | Role | Player ID | Real Name | DOB | Age | Nationality | Country Code | Source | Champion Pool |
|---|---|---|---|---|---|---|---|---|---|
| GEN | 上路 | Kiin | Gi In Kim | 1999-05-28 | 27 | South Korea | KR | [Gen.G 官网](https://geng.gg/pages/league-of-legends) / [Liquipedia · Kiin](https://liquipedia.net/leagueoflegends/Kiin) | 已核对 |
| GEN | 打野 | Canyon | Geon Bu Kim | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [Gen.G 官网](https://geng.gg/pages/league-of-legends) | 已核对 |
| GEN | 中路 | Chovy | Ji Hun Jung | 2001-03-03 | 25 | South Korea | KR | [Gen.G 官网](https://geng.gg/pages/league-of-legends) / [Liquipedia · Chovy](https://liquipedia.net/leagueoflegends/Chovy) | 已核对 |
| GEN | 下路 | Ruler | Park Jae-hyuk | 1998-12-29 | 27 | South Korea | KR | [Gen.G 官网](https://geng.gg/pages/league-of-legends) / [Liquipedia · Ruler](https://liquipedia.net/leagueoflegends/Ruler) | 已核对 |
| GEN | 辅助 | Duro | Joo Min-kyu | 2002-02-04 | 24 | South Korea | KR | [Gen.G 官网](https://geng.gg/pages/league-of-legends) / [Liquipedia · Duro](https://liquipedia.net/leagueoflegends/Duro) | 已核对 |
| HLE | 上路 | Zeus | CHOI WOOJE | 2004-01-31 | 22 | South Korea | KR | [HLE 官网公开选手资料](https://hle.kr/en) / [Liquipedia · Zeus](https://liquipedia.net/leagueoflegends/Zeus) | 已核对 |
| HLE | 打野 | Kanavi | SEO JINHYEOK | 2000-11-02 | 25 | South Korea | KR | [HLE 官网公开选手资料](https://hle.kr/en) / [Liquipedia · Kanavi](https://liquipedia.net/leagueoflegends/Kanavi) | 已核对 |
| HLE | 中路 | Zeka | KIM GEONWOO | 2002-11-28 | 23 | UNVERIFIED | UNVERIFIED | [HLE 官网公开选手资料](https://hle.kr/en) | 已核对 |
| HLE | 下路 | Gumayusi | LEE MINHYUNG | 2002-02-06 | 24 | South Korea | KR | [HLE 官网公开选手资料](https://hle.kr/en) / [Liquipedia · Gumayusi](https://liquipedia.net/leagueoflegends/Gumayushi) | 已核对 |
| HLE | 辅助 | Delight | YU HWANJUNG | 2002-09-12 | 24 | South Korea | KR | [HLE 官网公开选手资料](https://hle.kr/en) / [Liquipedia · Delight](https://liquipedia.net/leagueoflegends/Delight) | 已核对 |
| T1 | 上路 | Doran | HYEONJUN CHOI | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · T1](https://lolesports.com/en-US/teams/t1) | 已核对 |
| T1 | 打野 | Oner | HYUNJUN MUN | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · T1](https://lolesports.com/en-US/teams/t1) | 已核对 |
| T1 | 中路 | Faker | Lee Sang-hyeok | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [Riot · Hall of Legends](https://lolesports.com/en-GB/news/lol-esports-welcomes-faker-to-hall-of-legends) | 已核对 |
| T1 | 下路 | Peyz | SOOHWAN KIM | 2005-12-05 | 20 | South Korea | KR | [LoL Esports · T1](https://lolesports.com/en-US/teams/t1) / [Liquipedia · Peyz](https://liquipedia.net/leagueoflegends/Peyz) | 已核对 |
| T1 | 辅助 | Keria | MINSEOK RYU | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · T1](https://lolesports.com/en-US/teams/t1) | 已核对 |
| DK | 上路 | Siwoo | Jeon Si-woo | 2007-11-24 | 18 | South Korea | KR | [Liquipedia · Siwoo](https://liquipedia.net/leagueoflegends/Siwoo) | 已核对 |
| DK | 打野 | Lucid | Choi Yong-hyeok | 2005-01-28 | 21 | South Korea | KR | [Liquipedia · Lucid](https://liquipedia.net/leagueoflegends/Lucid) | 已核对 |
| DK | 中路 | ShowMaker | Heo Su | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · MSI 2021](https://lolesports.com/news/2021-msi-) | 已核对 |
| DK | 下路 | Smash | Sin Guem-jae | 2006-07-20 | 20 | South Korea | KR | [Liquipedia · Smash](https://liquipedia.net/leagueoflegends/Smash) | 已核对 |
| DK | 辅助 | Career | Oh Hyung-suk | 2004-08-29 | 22 | South Korea | KR | [Liquipedia · Career](https://liquipedia.net/leagueoflegends/Career) | 已核对 |
| AL | 上路 | Breathe | Chen Chen | 2001-02-19 | 25 | China | CN | [Liquipedia · Breathe](https://liquipedia.net/leagueoflegends/Breathe) | 已核对 |
| AL | 打野 | Tarzan | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 中路 | Shanks | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 下路 | Hope | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| AL | 辅助 | Kael | Kim Jin-hong | 2004-02-11 | 22 | South Korea | KR | [Liquipedia · Kael](https://liquipedia.net/leagueoflegends/Kael_%28Korean_player%29) | UNVERIFIED |
| BLG | 上路 | Bin | Chen Zebin | 2003-09-28 | 23 | China | CN | [Liquipedia · Bin](https://liquipedia.net/leagueoflegends/Bin) | 已核对 |
| BLG | 打野 | Xun | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 中路 | Knight | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 下路 | Viper | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| BLG | 辅助 | ON | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 上路 | ZUIAN | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 打野 | Tian | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 中路 | Creme | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 下路 | JackeyLove | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TES | 辅助 | Zhuo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| IG | 上路 | TheShy | SEUNG-LOK KANG | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · IG](https://lolesports.com/en-US/teams/invictus-gaming) | 已核对 |
| IG | 打野 | Wei | YANG-WEI YAN | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · IG](https://lolesports.com/en-US/teams/invictus-gaming) | 已核对 |
| IG | 中路 | Rookie | UI-JIN SONG | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · IG](https://lolesports.com/en-US/teams/invictus-gaming) | 已核对 |
| IG | 下路 | JiaQi | JIAQI ZI | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · IG](https://lolesports.com/en-US/teams/invictus-gaming) | 已核对 |
| IG | 辅助 | Meiko | YE TIAN | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · IG](https://lolesports.com/en-US/teams/invictus-gaming) | 已核对 |
| G2 | 上路 | BrokenBlade | Sergen Çelik | 2000-01-19 | 26 | Germany / Turkey | DE / TR | [G2 官方选手页](https://g2esports.com/blogs/team-member/broken-blade) / [Liquipedia · BrokenBlade](https://liquipedia.net/leagueoflegends/BrokenBlade) | UNVERIFIED |
| G2 | 打野 | SkewMond | Rudy Semaan | 2004-08-09 | 22 | France / Lebanon | FR / LB | [Liquipedia · SkewMond](https://liquipedia.net/leagueoflegends/SkewMond) / [G2 官方选手页](https://g2esports.com/blogs/team-member/skewmond) | 已核对 |
| G2 | 中路 | Caps | Rasmus Winther | UNVERIFIED | 26 | Denmark | DK | [G2 官方选手页](https://g2esports.com/blogs/team-member/caps) | 已核对 |
| G2 | 下路 | Hans Sama | Steven Liv | UNVERIFIED | 27 | France | FR | [G2 官方选手页](https://g2esports.com/blogs/team-member/hans-sama) | 已核对 |
| G2 | 辅助 | Labrov | UNVERIFIED | UNVERIFIED | 24 | Greece | GR | [G2 官方选手页](https://g2esports.com/blogs/team-member/labrov) | 已核对 |
| MKOI | 上路 | Myrwn | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MKOI | 打野 | Elyoya | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MKOI | 中路 | Jojopyun | Joseph Joon Pyun | 2004-10-01 | 22 | Canada | CA | [Liquipedia · Jojopyun](https://liquipedia.net/leagueoflegends/Jojopyun) | UNVERIFIED |
| MKOI | 下路 | Supa | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MKOI | 辅助 | Alvaro | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| KC | 上路 | Canna | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| KC | 打野 | Yike | Martin Sundelin | 2000-11-11 | 25 | UNVERIFIED | UNVERIFIED | [Liquipedia · Yike](https://liquipedia.net/leagueoflegends/Yike) | UNVERIFIED |
| KC | 中路 | kyeahoo | Kang Yea-hoo | 2005-08-13 | 21 | South Korea | KR | [Liquipedia · kyeahoo](https://liquipedia.net/leagueoflegends/Kyeahoo) | UNVERIFIED |
| KC | 下路 | Caliste | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| KC | 辅助 | Busio | Alan Cwalina | 2003-10-23 | 22 | UNVERIFIED | UNVERIFIED | [Liquipedia · Busio](https://liquipedia.net/leagueoflegends/Busio) | UNVERIFIED |
| TSW | 上路 | Pun | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 打野 | Hizto | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 中路 | Dire | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 下路 | Eddie | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TSW | 辅助 | Bie | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 上路 | Rest | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 打野 | Shad0w | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 中路 | POUT | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 下路 | Doggo | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| CFO | 辅助 | Kino | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 上路 | Kratos | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 打野 | Gury | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 中路 | Chika | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| MVK | 下路 | Harky | Nguyễn Văn Hữu | 2005-08-21 | 21 | Vietnam | VN | [Liquipedia · Harky](https://liquipedia.net/leagueoflegends/Harky) | UNVERIFIED |
| MVK | 辅助 | SiuLoong | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 上路 | Dhokla | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 打野 | Inspired | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 中路 | Saint | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 下路 | Berserker | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LYON | 辅助 | Isles | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| TLAW | 上路 | Morgan | RUHAN PARK | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · TLAW](https://lolesports.com/en-US/teams/team-liquid) | 已核对 |
| TLAW | 打野 | Josedeodo | BRANDON VILLEGAS | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · TLAW](https://lolesports.com/en-US/teams/team-liquid) | 已核对 |
| TLAW | 中路 | Quid | HYEONSEUNG LIM | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · TLAW](https://lolesports.com/en-US/teams/team-liquid) | 已核对 |
| TLAW | 下路 | Yeon | SEAN SUNG | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · TLAW](https://lolesports.com/en-US/teams/team-liquid) | 已核对 |
| TLAW | 辅助 | CoreJJ | YONGIN JO | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [LoL Esports · TLAW](https://lolesports.com/en-US/teams/team-liquid) | 已核对 |
| C9 | 上路 | Thanatos | Seung-gyu Park | 2004-05-01 | 22 | South Korea | KR | [Cloud9 官网](https://cloud9.gg/teams/league-of-legends/) / [Liquipedia · Thanatos](https://liquipedia.net/leagueoflegends/Thanatos) | UNVERIFIED |
| C9 | 打野 | Blaber | Robert Huang | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | [Cloud9 官网](https://cloud9.gg/teams/league-of-legends/) | 已核对 |
| C9 | 中路 | Loki | Lee Sang-min | 2005-03-26 | 21 | South Korea | KR | [Liquipedia · Loki](https://liquipedia.net/leagueoflegends/Loki) | UNVERIFIED |
| C9 | 下路 | Tactical | Edward Ra | 2000-08-18 | 26 | United States | US | [Liquipedia · Tactical](https://liquipedia.net/leagueoflegends/Tactical) | 已核对 |
| C9 | 辅助 | Vulcan | Philippe Laflamme | 1999-04-20 | 27 | Canada | CA | [Cloud9 官网](https://cloud9.gg/teams/league-of-legends/) / [Liquipedia · Vulcan](https://liquipedia.net/leagueoflegends/Vulcan) | UNVERIFIED |
| LOS | 上路 | Zest | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LOS | 打野 | Curse | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LOS | 中路 | Feisty | Jeong Seong-hoon | 2003-12-19 | 22 | South Korea | KR | [Liquipedia · Feisty](https://liquipedia.net/leagueoflegends/Feisty) | UNVERIFIED |
| LOS | 下路 | Duduhh | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| LOS | 辅助 | Ackerman | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | 已核对 |
| FUR | 上路 | Guigo | Guilherme Ruiz | 2002-01-28 | 24 | Brazil | BR | [Liquipedia · Guigo](https://liquipedia.net/leagueoflegends/GUIGO) | UNVERIFIED |
| FUR | 打野 | Tatu | Pedro Seixas | 2006-06-13 | 20 | Brazil | BR | [Liquipedia · Tatu](https://liquipedia.net/leagueoflegends/Tatu) | UNVERIFIED |
| FUR | 中路 | Tutsz | Arthur Peixoto Machado | 2002-12-16 | 23 | Brazil | BR | [Liquipedia · Tutsz](https://liquipedia.net/leagueoflegends/Tutsz) | UNVERIFIED |
| FUR | 下路 | Ayu | Andrey Saraiva | 2005-10-06 | 20 | Brazil | BR | [Liquipedia · Ayu](https://liquipedia.net/leagueoflegends/Ayu) | UNVERIFIED |
| FUR | 辅助 | JoJo | Gabriel Dzelme de Oliveira | 1998-11-11 | 27 | Brazil | BR | [Leaguepedia · JoJo (Gabriel Dzelme)](https://lol.fandom.com/wiki/JoJo_(Gabriel_Dzelme)) / [Liquipedia · 巴西战队名单](https://liquipedia.net/leagueoflegends/Portal:Teams/Americas) | UNVERIFIED |
