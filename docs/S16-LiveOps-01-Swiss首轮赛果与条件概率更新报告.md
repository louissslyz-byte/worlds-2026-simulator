# S16-LiveOps-01 — Swiss首轮赛果与条件概率更新报告

2026-10-24 · 初次验收为 LOCAL COMPLETE / PRODUCTION NOT UPDATED。后续用户授权的正式发布见第11节；保留原NO-GO历史记录。

## 1. 基准、保护范围与提交

起始分支 `feat/s16-u2-c-data-presentation`，HEAD `269e3c9ff1591856d72489111ac7b72ff1341046`。独立工作分支 `feat/s16-liveops-01-swiss-r1`。起始无已跟踪文件修改；已有未跟踪的AGENTS/CLAUDE、旧审计报告及M0研究脚本全部保留，没有暂存这些文件。

基准已包含U2-T、U2-AB、U2-C及实线圆点更新 `7734178`；M0-FINAL已CLOSED。未从GitHub main覆盖。生产稳定Tag `worlds-s16-p3c2-production`未改动。当前产品/构建源码：`87e47d5f60ccf698566d0fa0cc11efcf37acee87`。生成器实际执行提交：`02de5acde9270124fb077e0283e74a247a181e07`。

本轮提交：`02de5ac`（事实及生成器）、`97fd922`（快照及页面）、`14cfbfc`、`601dbf7`、`87e47d5`（生产读取路径兼容修复）。另有最终测试/报告提交见本分支Git记录。没有amend、reset、rebase、Push或部署。

当前Production只读查询返回HTTP403 `forbidden / Not authorized`，不能独立确认此刻Deployment ID或自动部署设置。最后既有发布记录为 `dpl_DZ8NTHED3eXAts1kLEinauXB8WSe`，不将历史记录冒充本轮实时确认。没有改动Vercel设置。

## 2. 官方核验与历史边界

- [官方Swiss阶段](https://lolesports.com/en-SG/tournament/115660540725177488/stage/115660540725570706)：正常GET、HTTP200，读取时间 `2026-10-24T04:11:35.758Z`，532716字节，SHA `04f5bd3c3a41af15eee57ba1d7c3316d144b63567b27e5baa556ecbeed9a8519`。
- [官方赛程](https://lolesports.com/en-US/leagues/worlds)：正常GET、HTTP200，读取时间 `2026-10-24T04:11:37.729Z`，SHA `1321d3de086f3160746ac8c658716d4566e83117bd134e1497ff5210449333c6`。逐Match ID核对EventMatch.strategy.count=1、参赛身份、状态、比分及计划时间。
- [官方赛事说明](https://lolesports.com/en-GB/news/worlds-2026-primer)说明每轮比赛后抽签。未将日期精度描述转成虚构的精确发布时间。
- 第三方赛后报道直接GET403，未绕过，也未把其未知时区的发布时间当UTC证据。正式输入全部来自可读取官方页面。

**asOf = `2026-10-24T04:11:37.729Z`（北京时间2026-10-24 12:11:37.729）**。这是官方签表已可见的实际观察上界，既不是最后一场R1结束的精确时刻，也不是抽签精确时刻。`sourceCheckedAt`独立保存，R2 `drawPublishedAt=null`、`drawKnownBy=asOf`。观察时点早于最早R2计划开赛 `2026-10-24T17:00:00.000Z`（北京时间10-25 01:00）。因此明确纳入R2已公布签表，没有混入任何R2结果；不声称“仅首轮赛果、尚未知第二轮签表”。

官方源页面在本次读取时，R1均completed、R2均unstarted；后者源站0–0占位已正规化为score/winner=null。官方日程为计划时间，不等于逐场实际开赛/结束时间。未知的旧Play-In逐场时间仍为null。所有R1比赛为美国芝加哥10月23日，显示层使用Asia/Shanghai，跨日正确。

| 轮次 | 官方Match ID | 对阵 | 结果 | 计划北京时间 |
|---|---|---|---|---|
| R1 | 115660540726095005 | GEN–IG | 1–0 | 10-24 01:00 |
| R1 | 115660540726095007 | TLAW–CFO | 0–1 | 10-24 06:00 |
| R1 | 115660540726095009 | AL–KC | 0–1 | 10-24 04:00 |
| R1 | 115660540726095011 | G2–DK | 0–1 | 10-24 05:00 |
| R1 | 115660540726095013 | HLE–TES | 1–0 | 10-24 02:00 |
| R1 | 115660540726095015 | LOS–T1 | 0–1 | 10-24 07:00 |
| R1 | 115660540726095017 | TSW–LYON | 0–1 | 10-24 08:00 |
| R1 | 115660540726095019 | BLG–MKOI | 0–1 | 10-24 03:00 |
| R2 | 115660540726095021 | MKOI–CFO | SCHEDULED · null | 10-25 02:00 |
| R2 | 115660540726095023 | KC–LYON | SCHEDULED · null | 10-25 04:00 |
| R2 | 115660540726095025 | HLE–GEN | SCHEDULED · null | 10-25 06:00 |
| R2 | 115660540726095027 | DK–T1 | SCHEDULED · null | 10-25 07:00 |
| R2 | 115660540726095029 | TES–AL | SCHEDULED · null | 10-25 01:00 |
| R2 | 115660540726095031 | LOS–G2 | SCHEDULED · null | 10-25 03:00 |
| R2 | 115660540726095033 | IG–TSW | SCHEDULED · null | 10-25 05:00 |
| R2 | 115660540726095035 | BLG–TLAW | SCHEDULED · null | 10-25 08:00 |

## 3. 增量事实与条件状态

新增 `lib/live/updates/facts/swiss-r1-v1.json`，引用A1的snapshotId和输入SHA，不重写A1或复制另一套Play-In结果。新事实版本 `worlds-2026-swiss-r1-complete-r2-draw-v1`，状态 `SWISS_R1_COMPLETE_R2_DRAW_CONFIRMED`。来源证据留URL、读取时间、原响应SHA/大小；原始网页证据保存在仓库外，不打包。

事实文件SHA `4395cd045c4457688329e3d33e8ae100ca477cad51ea5e60065babda3ba3d70d`。

标准化事实SHA `6af05985c917676b74d5844a70a8b6c270a10c877c36753dc923acd30edc5bb4`。规范对象键及比赛集合顺序，排除来源核查/运行时间等非事实信息。

条件状态SHA `ca36b77705d6f46615288d7355fb41ce05e05b5e7dbce7dbaf6206d2ae93a4de`；模拟输入SHA `c44f75a4013e07bee83835321d3a6e04def3f3e097fd2d3cb058b196cc15daa1`；原缓存式state hash `2ac6b833-5463`。

`createSwissRound2Session()`先使用A2原POST适配器恢复六场真实Play-In及官方R1；按对阵映射8场真实结果，调用原引擎applyResult锁定OFFICIAL；调用advance重建战绩与交手历史，再用已核验R2签表替换这一推进步骤产生的临时R2签表。没有模拟临时比赛；MC每条路径按原算法重设RNG，因此丢弃临时签表不会改变未来抽样分布。最终固定14场结果、8场未决R2，22个唯一比赛ID、16队，8支1–0、8支0–1；无人因R1直接晋级/淘汰。

共享引擎、draws、RNG、胜率、Worker、用户Session/LocalStorage全部未改。真实事实对象、初始Session不可变测试通过。没有第二套赛制或胜率实现。

## 4. 冻结模型与正式执行

| 项目 | 值 |
|---|---|
| model | `gpr-prob-v1.1` |
| strength | `riot-gpr-2026-09-29-v2` |
| ratingVersion | `system-gpr-prob-v1.1@riot-gpr-2026-09-29-v2` |
| rules / state | `worlds-2026-official-draw-v2` / `worlds-state-v2` |
| GPR scale / Elo divisor | 0.85 / 400 |
| ratingInputSHA256 | `50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb` |
| engineSourceSHA256 | `9acb9dc2544401aad5ebeb9f1f36359064b100389952c211ccb3286932578191` |
| strengthSourceSHA256 | `0d5a1631ee412933003e3454bd599f95ad59b0b94c48673924206ea529e5bdb0` |
| RNG / sampling | `lcg32-high-bucket-v1` / `canonical-uniform-legal-pairings-v1` |
| requested / completed / failed | 100000 / 100000 / 0 |
| randomSeed / sessionSeed | 20261024 / 2026 |
| duration | 75212 ms |
| peak process RSS | 124452864 bytes（进程高水位，非单样本内存） |
| calculatedAt | `2026-10-24T04:19:24.975Z` |
| generator source SHA | `d63a4fc78960344635c6ed83de70864be94e562cb9dd7a90a35fc74dd246bb43` |

正式100000次只运行一次。先执行256条逐路径完整赛事审计、两组64次固定种子复现及坏状态拒绝；后续回归仅小样本或只读正式计数验证，没有再次跑正式100K。每条正式路径均由原runMonteCarloFromState完成assertCompletedTournament后计数；异常会包含样本索引和seed并终止，不能丢弃或无限重试。

新快照 `worlds-2026-swiss-r1-probability-v1`，count SHA `b0ee80de2d41e2328e36035a5a315de4c99a3d711b723fc1cc4e7d0b30f31511`，文件SHA `e9d004aa54600b9dda9fb1e7b93729c8aa359b4e0d91afdc9071b219e480a392`。生成时间 `2026-10-24T04:19:24.975Z`。概率严格为count/100000，19队全保留。

| 战队 | Swiss | Knockout | Semifinal | Final | Champion |
|---|---:|---:|---:|---:|---:|
| GEN | 100000 | 86171 | 58570 | 37013 | 22096 |
| HLE | 100000 | 89538 | 65007 | 44437 | 29032 |
| T1 | 100000 | 80936 | 47146 | 24263 | 11067 |
| DK | 100000 | 68047 | 29287 | 10757 | 3422 |
| AL | 100000 | 34279 | 14268 | 5220 | 1671 |
| BLG | 100000 | 61512 | 39918 | 24312 | 13699 |
| TES | 100000 | 24326 | 7897 | 2271 | 539 |
| IG | 100000 | 21533 | 6335 | 1646 | 349 |
| G2 | 100000 | 58063 | 32690 | 16903 | 7818 |
| MKOI | 100000 | 47036 | 11396 | 2205 | 361 |
| KC | 100000 | 58424 | 21034 | 6285 | 1602 |
| TSW | 100000 | 26742 | 9107 | 2743 | 737 |
| CFO | 100000 | 44256 | 10835 | 2245 | 373 |
| MVK | 0 | 0 | 0 | 0 | 0 |
| LYON | 100000 | 76623 | 39525 | 17716 | 6757 |
| TLAW | 100000 | 20359 | 6814 | 1976 | 477 |
| C9 | 0 | 0 | 0 | 0 | 0 |
| LOS | 100000 | 2155 | 171 | 8 | 0 |
| FUR | 0 | 0 | 0 | 0 | 0 |

合计Swiss=1600000、Knockout=800000、Semifinal=400000、Final=200000、Champion=100000。所有队伍满足阶段计数嵌套。C9/FUR/MVK全部事件确定为0；其余16队Swiss=100000。

## 5. 历史快照、版本与复现

原7文件概率归档、A1及冻结模型完全保留。原验证器仍严格验收原两个节点；新版本扩展层先保留旧校验，再绑定新增事实、状态和第三节点，不通过放宽旧规则验收新节点。

- A1输入：`e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b`。
- PRE count：`04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd`，文件 `d08592ed5f7cfaef241c3c8f9f6d1e91b4782c18f2166bc462ad1cc8c98c5124`。
- POST count：`5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509`，文件 `56f2b4913d3c42b3c6f47546a2c596b40a76a58eeeb079647ca5fba568534052`。
- R1网站原赛前缓存：`8ce8f63929caca68eff760377e16729df419f20a31c05f103c7e991849baad78`，完全未改。

生成器、原事实与代码版本均已保存到本地Git。生产集成中发现离线URL加载方式与Next预渲染不兼容，分别修复目录URL、文件路径、复用服务器已验证A1对象；没有重跑或改写正式概率。`generation-source-v1.json`保存**实际执行提交**的4个源码SHA，专项测试逐个git show核验。它不假装正式计算使用了后续修复提交；新的运行时校验仍严查模型/规则/计数/输入哈希。复现该计算应使用生成提交02de5ac，而非要求生成时间和内存等元数据字节相同。

候选生成只写新目录（mkdir非recursive、文件wx），拒绝复用目录；不会自动写入历史归档。正式新快照单独保存，index绑定文件/计数SHA。未来修订必须使用新ID，不能覆盖旧节点。

## 6. 概率变化审计

| 战队 | PRE夺冠% | POST夺冠% | 首轮后夺冠% | 较POST变化(pp) |
|---|---:|---:|---:|---:|
| GEN | 20.382 | 20.093 | 22.096 | +2.003 |
| HLE | 27.070 | 27.115 | 29.032 | +1.917 |
| T1 | 9.131 | 9.780 | 11.067 | +1.287 |
| DK | 2.615 | 2.518 | 3.422 | +0.904 |
| AL | 2.678 | 2.565 | 1.671 | -0.894 |
| BLG | 18.200 | 18.164 | 13.699 | -4.465 |
| TES | 0.826 | 0.774 | 0.539 | -0.235 |
| IG | 0.559 | 0.525 | 0.349 | -0.176 |
| G2 | 9.961 | 9.660 | 7.818 | -1.842 |
| MKOI | 0.236 | 0.184 | 0.361 | +0.177 |
| KC | 0.614 | 1.126 | 1.602 | +0.476 |
| TSW | 1.054 | 1.036 | 0.737 | -0.299 |
| CFO | 0.230 | 0.247 | 0.373 | +0.126 |
| MVK | 0.004 | 0.000 | 0.000 | +0.000 |
| LYON | 5.413 | 5.284 | 6.757 | +1.473 |
| TLAW | 0.905 | 0.928 | 0.477 | -0.451 |
| C9 | 0.120 | 0.000 | 0.000 | +0.000 |
| LOS | 0.002 | 0.001 | 0.000 | -0.001 |
| FUR | 0.000 | 0.000 | 0.000 | +0.000 |

较POST夺冠增加最多：GEN +2.003pp, HLE +1.917pp, LYON +1.473pp, T1 +1.287pp, DK +0.904pp。

下降最多：BLG -4.465pp, G2 -1.842pp, AL -0.894pp, TLAW -0.451pp, TSW -0.299pp。

Knockout绝对变化最大：MKOI +22.446pp。以上从三份原始快照自动生成，未手工修改。

赢下一场不代表夺冠概率必然大幅增加：第二轮对手、竞争者的赛果及剩余路径共同改变条件概率。本节点同时条件化R1结果及R2签表，不能将变化全部归因于一场胜负或实力升降。没有发现需要修正事实/状态的显著反直觉异常。

独立固定种子，不采用额外共同随机数改造。作为近似，100K二项样本单比例95%抽样误差最大约±0.31pp，两独立节点差值约±0.44pp；不是模型校准置信区间，PRNG样本也并非严格独立试验保证。特别是LOS由1次到0次的−0.001pp不可当成确定实力变化。现保留真实0计数，对仍存理论机会的样本零标0%＊并解释“本批未抽中”，确定淘汰队的0不附此标记。

## 7. 页面与实际浏览器

`/live`以当前事实投影展示R1八场已结束、R2八场待开赛（null比分/胜者），ROUND3–5待抽签，Knockout TBD；旧Play-In完整保留。时间为北京时间的计划开赛。19队状态显示8队1–0、8队0–1、3队已淘汰。

全部19卡片各3曲线、每线3真实节点：57线、171个圆形实心点；颜色/实线保留U2终版；当前值来自最新节点，pp始终相对PRE。没有插值节点。原source links、精确count/100000、snapshotId和北京时间保留。

实际浏览器测试对象为**最终Prebuilt本地HTTP验收器**，不是普通开发模式，也不是Vercel CDN或实体手机。1440/768/390/320均无页面级横向溢出；三横轴标签实测不碰撞，点数/曲线数一致。320px图表继续使用U2可横向滚动区域，点击/键盘能到达两端，不把局部图表滚动误报为页面溢出。LEC筛选3队、恢复ALL19队、KC节点点击显示58.424%/1.602%、Enter展开/Escape关闭通过。

截图（仓库外验收目录，未加入Git/构建）：`before-1440/768/390/320.jpg`、`after-1440/768/390/320.jpg`；另有`after-chart-1440.jpg`、`after-kc-detail-320.jpg`和三个小屏详情图。截图是真实浏览器渲染，不是设计稿。

System：手动C9 3–1 FUR，模拟46场至LYON冠军，刷新恢复；Custom：将T1移至S，手动FUR 3–1 KC，模拟至GEN冠军，刷新及历史手动3–1保留。测试使用独立loopback端口，不覆盖用户原站存档。证明真实Live结果不会污染Manual Pick；GEN/Chovy浏览器页面及全部19队95人HTTP统计正常。

## 8. 自动化、构建与隐私验收

- lint、TypeScript、完整tests/run.mjs、R1正式规则/抽签分布/旧存档/Worker入口回归、新Live事实/适配/快照正反例：PASS。
- A1与A2只读验证：PASS；没有MC重算旧节点。
- 实际Prebuilt Live HTML/RSC：17请求，完整数据投影与源码逐字段一致，禁止下载路径404。
- 实际Prebuilt战队/选手统计：122请求，19队95人及样本值；英雄池19队95人1302行、Roster/Road通过。
- 本地Prebuilt门禁、GoL研究隔离、统计显示测试：PASS。没有读取完整P2-C研究快照；复用原批准最小聚合输入。
- 58个模型、规则、旧事实、原概率及Team Profile受保护文件与起始HEAD逐字节相同；原Simulator/Worker与页面代码无变更。
- 旧U2展示测试改为枚举其**历史基准树**，避免新增Live文件错误地要求存在于旧提交；只明确豁免本轮获准的Live投影/读取器及trace配置，保留旧模型/数据字节保护。
- 生产构建经历离线URL兼容失败，已修复并重新构建验收；未用关闭校验掩盖错误。

Node22.23.3、pnpm9.15.9、Next16.3.4、VercelCLI64.2.0。真实执行build --prod --standalone，生成新的`.vercel/output`，没有deploy。

最小聚合批准输入886093字节，SHA `c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`，Checksum Gate未修改。新树SHA **`4b3a30301e103b34c732e60a7bff9eac79bc550aa4b6df5eab8503d3cd7dd1bc`**。579个普通文件、59内部链接；source map/native addon均0；私人主页路径/凭据/原始CSV/GoL逐局/P2-C完整快照命中0。聚合JSON只在服务器资源，客户端没有完整聚合包或下载API。

额外扫描发现34个**服务器内部**文件保留非个人的临时构建目录字符串（launcher/Next内部清单或服务端模块）。它们不是私人home/研究来源路径；公开HTML/RSC/JS对应命中0。按A/B分类记录，不谎称整个产物没有任何绝对路径，也不武断将内部临时目录标成公网私人信息泄漏。原旧产物已在仓库外保留，未复用旧SHA。

## 9. 文件和后续操作

主要新增：`lib/live/updates/`（版本化事实、状态适配、概率校验、原生成源码审计、独立快照/index）；`scripts/generate-live-update.mjs`、`validate-live-update.mjs`、只读候选验证`validate-live-update-candidate.mjs`、`tests/live-updates.mjs`、`tests/live-update-http.mjs`、本报告与Daily Runbook。

主要修改：`lib/live/view-server.ts`、`view.ts`、`components/live/live-tournament.tsx`、`next.config.ts`（仅新增source trace）、`package.json`（两个离线入口）、相关展示/回归测试。引擎、实力输入、旧概率、原档案和研究目录未改。

实际入口：`pnpm live:update:validate --facts-only`、`pnpm live:update:validate`、`pnpm live:update:generate --candidate <全新目录>`。本轮已使用这些脚本的Node22等价命令。generate不会自动归档或联网。`node --import tsx scripts/validate-live-update-candidate.mjs <候选目录>`已对本次真实候选验证通过（核对实际执行Commit源码）。生产预览在本机3061；不要把验收器当成CDN仿真。

Daily流程详见[Runbook](S16-LiveOps-Daily-Update-Runbook.md)。**当前facts/adapter/ID配置只验收了R1节点，不能把明天R2事实塞进R1文件。** 下一节点需追加独立版本文件、注册其验证和ID/seed，按相同推进/替换已知签表的方法扩展轮次测试；复用原引擎，无需重建MC。没有声称今天的固定R1命令已经验收任意未来轮次。

## 10. 最终发布门禁

| 项目 | 状态 |
|---|---|
| SWISS R1 FACTS | PASS |
| OFFICIAL R2 DRAW | PASS（实际观察时已公开；精确原发布时间仍未知/null） |
| CONDITIONED STATE | PASS |
| FROZEN MODEL | PASS |
| MONTE CARLO 100K | PASS |
| PROBABILITY INTEGRITY | PASS |
| SNAPSHOT APPEND-ONLY | PASS |
| LIVE MATCH RESULTS | PASS |
| LIVE THREE-NODE CHART | PASS |
| SYSTEM/CUSTOM REGRESSION | PASS |
| TEAM/PLAYER DATA | PASS |
| PREBUILT SECURITY | PASS（内部临时构建路径按上述分类记录） |
| PRODUCTION READY | **NO-GO：发布控制面403，当前Production/回滚目标/自动部署状态需在正式发布前重新核实** |

本地技术候选已就绪，最后剩余发布阻碍是Vercel只读权限，不是已发现的应用故障。恢复原账户/项目访问后，先核对Production/回滚与关闭自动部署、复验同一产物SHA、核对统计运行参数，获得用户另行Production授权后才能执行手动Prebuilt部署。Push需独立授权。当前本轮没有任何远程写入、Preview或正式发布，没有推进第二轮赛果，也没有开启M0-D4。


## 11. 后续正式发布（用户另行授权）

用户回复“上线”，并完成原账户Vercel登录恢复。此前403阻碍已解除；本节是后续发布记录，不删除第10节当时的NO-GO结论。

### 发布前复核

- 原项目绑定：worlds-2026-simulator，projectId `prj_pETbiwwBgfF7fqBELVMeyyLczbdb`；未创建新项目、未更改域名或Git设置。
- Production直接只读确认：`dpl_DZ8NTHED3eXAts1kLEinauXB8WSe`，READY，源码7734178，正式域名仍指向它。
- Git自动部署门禁`ignoreCommand=exit 0`、本地deploymentEnabled=false未变；CLI只读确认无回滚进行中。
- Hobby回滚资格：此部署在新版本发布后成为紧邻上一Production，仍READY并曾绑定正式域名，符合[官方Instant Rollback规则](https://vercel.com/docs/instant-rollback)（2026-10-24核查）。没有执行云端回滚演练。
- 冻结产物重新审计，579文件、59内部链接，树SHA仍为`4b3a30301e103b34c732e60a7bff9eac79bc550aa4b6df5eab8503d3cd7dd1bc`；统计资源SHA仍为`c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`。
- 当前部署API未返回统计运行环境变量明文，不能声称直接读到了旧参数。新部署通过`--env`明确指定TEAM_STATS_RELEASE_ENABLED=true和上述批准SHA，且项目autoExposeSystemEnvs=true直接核实。

### 执行及版本

使用原Vercel CLI64.2.0和原项目，执行`vercel deploy --prebuilt --prod --yes`，显式携带两项统计运行参数。没有重新构建、重新运行Monte Carlo或上传GitHub。CLI确认使用`.vercel/output`预构建产物；638个部署条目对应579文件＋59内部链接。

| 项目 | 结果 |
|---|---|
| 原Production / 回滚目标 | `dpl_DZ8NTHED3eXAts1kLEinauXB8WSe` |
| 新Deployment | `dpl_Da4zRHe9yQz4GRdZ5vy7FzycJcYe` |
| 状态 / target | READY / production |
| 正式域名 | https://worlds-2026-simulator.vercel.app/ |
| 实例URL | https://worlds-2026-simulator-273jsme6h-luis-cf15.vercel.app |
| 构建业务源码 | `87e47d5f60ccf698566d0fa0cc11efcf37acee87` |
| CLI时Git HEAD | `b68251dc152a6c195d0548597da56ed4951ce7f7`（后续仅测试、离线只读工具及文档） |
| 产物树SHA | `4b3a30301e103b34c732e60a7bff9eac79bc550aa4b6df5eab8503d3cd7dd1bc` |

新Deployment元数据同时记录gitCommitSha（构建业务提交）、githubCommitSha（CLI当时HEAD）、releaseReportCommit及产物SHA。未把报告提交冒充重新构建过的业务源码。部署后再次GET项目确认正式别名指向新ID，旧Production为紧邻上一条；Git自动部署仍关闭。部署后本地产物再审计SHA一致。

### 生产验证及局限

- 控制面独立验证：**PASS**。新Deployment READY、原项目、production、正式域名及元数据产物SHA一致。
- 独立公网HTTP：**未完成**。对/live、/rankings、/simulator/new、/teams/gen、/teams/gen/chovy各一次有限请求均UND_ERR_CONNECT_TIMEOUT，未收到应用HTTP响应；不能标200/PASS。
- 独立生产浏览器：**未完成**。打开正式/live时浏览器连接超时；没有伪造生产截图。
- 最终同一Prebuilt的本地HTTP/RSC、19队95人、1302英雄记录、System/Custom与四宽度浏览器验证，见前节PASS。这些不自动替代生产交互验证。
- 已请用户在真实浏览器复核R1八场结果、R2八组待开赛对阵、第三概率节点、KC58.424%/1.602%及GEN/Chovy统计。用户随后回复“正常”。记录为 **USER-REPORTED PRODUCTION BROWSER VERIFICATION：PASS**，仅覆盖上述项目，不冒充Codex独立HTTP或浏览器验收。

上述连接超时不构成已确认应用故障，未据此盲目回滚。若用户发现重大应用错误，先确认并按原账户执行`vercel rollback dpl_DZ8NTHED3eXAts1kLEinauXB8WSe --yes`，核对READY、正式别名及统计功能；回滚沿用目标部署原环境，不能以当前项目变量覆盖旧参数。未执行回滚。

**PRODUCTION DEPLOYMENT：READY**

**PRODUCTION VERIFICATION：用户浏览器验收PASS；控制面PASS；Codex独立公网HTTP/浏览器验收仍受连接限制。**

已按授权发布Swiss R1增量和第三概率节点。没有推进R2结果、修改模型或原统计；没有Git Push、额外Preview或云端配置调整。
