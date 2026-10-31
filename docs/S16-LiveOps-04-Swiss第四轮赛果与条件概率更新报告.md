# S16-LiveOps-04：Swiss R4赛果与条件概率更新

LOCAL COMPLETE · PRODUCTION NOT UPDATED。未推送、未部署、未创建Preview。

## 基线与范围

起始分支 `feat/s16-liveops-03-swiss-r3`，HEAD `6abf3fc`。生成器冻结提交 `74102fe13704f9b31e064713fedec159a20bb2b2`。保留U2、Tooltip、简洁详情、时间标签与淘汰截断，以及全部原有未跟踪报告和研究文件。本轮只追加R4事实、R5签表、第六概率节点与验证，不修改共享模型、赛制、统计或用户会话。

## 官方事实

核查/信息截止：`2026-10-31T12:14:40.631Z`，北京时间10月31日20:14:40。R5首场尚未开始。精确抽签发布时间未知，`drawPublishedAt=null`，`drawKnownBy`为实际观察时间，未猜测历史发布时间。

直接读取并交叉核对两个官方页面的赛事记录。完整响应及其SHA留仓库外：

- [官方Swiss签表](https://lolesports.com/en-SG/tournament/115660540725177488/stage/115660540725570706)
- [官方Worlds赛程](https://lolesports.com/en-US/leagues/worlds)

| R4对阵（保留历史方向） | 比分 | 官方Match ID | 北京时间计划开赛 |
|---|---:|---|---|
| MKOI–T1 | 0–2 | 115660540726095061 | 10/29 04:00 |
| LYON–IG | 1–2 | 115660540726095065 | 10/29 07:00 |
| CFO–KC | 0–2 | 115660540726095073 | 10/30 04:00 |
| BLG–TES | 1–2 | 115660540726095069 | 10/30 07:00 |
| TLAW–LOS | 1–2 | 115660540726095077 | 10/31 04:00 |
| G2–HLE | 0–2 | 115660540726095081 | 10/31 07:00 |

全部为已结束BO3。R1–R3记录未改。

| R5官方签表 | 官方Match ID | 北京时间计划开赛 |
|---|---|---|
| MKOI–KC | 115660540726095085 | 11/01 01:00 |
| LOS–LYON | 115660540726095089 | 11/01 04:00 |
| HLE–BLG | 115660540726095093 | 11/01 07:00 |

R5均SCHEDULED、比分和胜者null。官方占位0–0不作为赛果，未导入R5结果。

## 条件状态与冻结模型

`worlds-2026-swiss-r4-complete-r5-draw-v1` 基于R3事实。适配器恢复原R3状态，应用六场R4 OFFICIAL结果，调用原advance推导战绩，再固定R5三场官方BO3。共36场完成结果锁定（6场入围赛＋30场Swiss）、3场未完成R5，后续复用原引擎与Monte Carlo。

已晋级：DK、GEN（3–0），IG、T1、TES（3–1）。2–2池：BLG、HLE、KC、LOS、LYON、MKOI。Swiss淘汰：AL、TSW、CFO、G2、TLAW；入围赛淘汰：C9、FUR、MVK。

冻结 `gpr-prob-v1.1`、GPR `riot-gpr-2026-09-29-v2`、scale 0.85、Elo divisor 400、`worlds-2026-official-draw-v2`，均未修改。

- Rating SHA：`50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb`
- 事实SHA：`a5cdd0416ee2f6d40d8f963cf84482b2994fcea092848a1528e7747cc7c49c97`
- 模拟输入SHA：`39ad21b71fbc5c35da27be38d4cb474ac78adf827ae5cdf2893b3c6c4cc896ab`

## 正式计算与归档

正式运行一次：请求100,000、有效100,000、失败0。seed `20261031`，耗时50.101秒，进程峰值RSS约130.9 MiB。另有256条低成本完整路径审计与64条重复种子比较；未冒充正式快照。

- Snapshot：`worlds-2026-swiss-r4-probability-v1`
- Count SHA：`e152b499bbed390aa02821097e7fbf807fe9e58553f5af4cb8a06d433fe45592`
- 文件SHA：`82924a088f77d7a3a9b70c1817184f515faae1a05621e1c1d56dd738280f9262`

候选验证后排他写入新归档目录。已有PRE、POST、R1/R2/R3文件不变，重复输出到已有目录被拒绝。完整条件由事实链和状态SHA绑定：R3通过基准状态继承，实际包含R1–R4全部结果；生成器说明字符串的R1/R2/R4为简写，不能解读为遗漏R3。

整数总计：Swiss 1,600,000；八强800,000；四强400,000；决赛200,000；冠军100,000。每队五事件嵌套、确定晋级/淘汰通过。

## 页面与验收

19队、57条曲线、六个真实历史节点、342条完整历史事件记录。官方淘汰截断后绘制300个可交互点；CFO/G2/TLAW在R4终止，旧淘汰节点保持不变。纵轴0–100%、精确Tooltip、简洁详情、相对赛前pp及小概率精度不变。R4六场比分和R5三场待开赛按轮次、时间展示。

实际浏览器验收最终Prebuilt的本地HTTP入口，1440/768/390/320均无页面横向溢出，小屏图表内部可滚动。筛选、六节点、精确键盘Tooltip、Enter详情、Escape关闭和淘汰终点通过。未宣称实体手机或Production验收。

仓库外审阅目录 `s16-liveops-04-2026-10-31/screenshots`：

- `1440-six-node-detail.png`、`768-six-node-detail.png`、`390-six-node-detail.png`、`320-six-node-detail.png`
- `320-eliminated-c9.png`、`320-round4-results.png`、`1440-round4-r5.png`
- `system-refresh.png`、`custom-refresh.png`

验证结果：

- lint、typecheck、完整网站测试通过；含R1规则、模型锁、Worker、Manual、历史归档、展示及负例。
- R4门槛：错误比分/胜者/队伍、重复ID、未来赛果、时间边界、规则/Rating/hash篡改与历史覆盖均拒绝。
- A1、PRE/POST原始SHA验证通过，PRE仍与R1正式缓存一致。`lib/sim`、`lib/team-profile`、旧事实与旧概率归档无diff。
- 最终Prebuilt HTTP/RSC：23请求，39场完整投影、19队57线、受限文件404通过。
- 聚合统计HTTP：122请求，19队95人所有指标、RSC及无下载入口通过。
- 英雄池HTTP：19队95人1302行、Roster、Road to Worlds通过。
- 实际浏览器System：手动C9 3–1→冠军AL→刷新，冠军与手动1保留。Custom：手动FUR 3–2→冠军GEN→刷新恢复。使用独立本地origin，不触碰正式站存档。
- GoL隔离、本地Prebuilt安全门禁及统计展示专项通过。

预览初次默认Turbopack遇到既有动态路径兼容问题，沿用Webpack后正常，未修改冻结代码。单档案函数验收器不支持Live静态路由，改用原有完整静态＋动态Prebuilt验收器后通过；未把首次失败当作成功。

## 构建和安全

Node22.23.3、pnpm9.15.9、Vercel CLI64.2.0，实际本地`build --prod --standalone`及Next生产构建通过。仍使用原批准聚合候选SHA `c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`。

完整产物597文件、59内部链接，私人路径/凭据/受限数据命中0。树SHA：`be2d29e6307051631d3978f8932d21f9cc85ef3e781f42343f36474a7d50afbe`。Live追踪包含R4必要资源，未新增运行时模拟API。原始响应、截图、日志和研究文件不入Git。

## 文件与维护入口

新增round4.ts、round4四份JSON、generate/validate-live-round4.mjs、tests/live-round4.mjs。修改Live投影/读取/条件说明、Next追踪、package入口、相关测试和Runbook。仅暂存审核过的具体文件。

日常只读复验：`pnpm live:round4:validate`、`pnpm live:validate`、`pnpm live:odds:validate`、`pnpm test`。此次ID已完成，不重算或覆盖。未来R5须新版本、事实核验、状态门槛及正式计算授权。

本地数据/条件状态/模型/100k/概率完整性/追加归档/Live/原系统/统计/Prebuilt安全均PASS。本地候选GO；Production与GitHub未更新。正式部署前仍需重新核对项目、登录、现生产/回滚资格、统计参数及同一产物SHA，等待用户单独授权。

## 19队原始整数与概率对照

| Team | Swiss | 八强 | 四强 | 决赛 | 冠军 | R3夺冠% | R4夺冠% | 较R3变化pp |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GEN | 100000 | 100000 | 66846 | 46025 | 28900 | 27.582 | 28.900 | 1.318 |
| HLE | 100000 | 54749 | 38499 | 28249 | 19137 | 14.010 | 19.137 | 5.127 |
| T1 | 100000 | 100000 | 68895 | 34188 | 16717 | 12.791 | 16.717 | 3.926 |
| DK | 100000 | 100000 | 45137 | 20628 | 6513 | 5.989 | 6.513 | 0.524 |
| AL | 100000 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| BLG | 100000 | 45251 | 29409 | 19973 | 12570 | 23.143 | 12.570 | -10.573 |
| TES | 100000 | 100000 | 38804 | 10769 | 2727 | 1.463 | 2.727 | 1.264 |
| IG | 100000 | 100000 | 34819 | 8758 | 1938 | 0.996 | 1.938 | 0.942 |
| G2 | 100000 | 0 | 0 | 0 | 0 | 3.873 | 0.000 | -3.873 |
| MKOI | 100000 | 39509 | 10221 | 2262 | 388 | 0.460 | 0.388 | -0.072 |
| KC | 100000 | 60491 | 21891 | 7177 | 1931 | 0.755 | 1.931 | 1.176 |
| TSW | 100000 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| CFO | 100000 | 0 | 0 | 0 | 0 | 0.126 | 0.000 | -0.126 |
| MVK | 0 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| LYON | 100000 | 88440 | 44585 | 21895 | 9176 | 8.053 | 9.176 | 1.123 |
| TLAW | 100000 | 0 | 0 | 0 | 0 | 0.759 | 0.000 | -0.759 |
| C9 | 0 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |
| LOS | 100000 | 11560 | 894 | 76 | 3 | 0.000 | 0.003 | 0.003 |
| FUR | 0 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 |

概率变化同时包含R4实际结果和R5已知签表，不能解释为Rating升降。HLE与BLG的八强计数互补，总计100,000。小幅变化可能包含抽样噪声，100k单节点最坏标准误约0.158个百分点；LOS夺冠3次即0.003%，不是理论不可能。所有概率均直接来自整数计数，未人工调整。

## 后续UI微调：已确认晋级事件终止绘制

基于产品提交 `390cdff`。仅修改展示投影、共享图表、样式和相关测试。

- 依据A1验证后的directToSwiss/qualifiedToSwiss，以及各轮官方战绩3胜事实，标记首次确认晋级节点；绝不根据概率或计数等于100%推断。
- 直通15队的正赛曲线仅保留赛前确认点；KC保留到入围赛后。GEN/DK八强曲线保留到R3，T1/IG/TES保留到R4。
- 终点显示事件对应颜色的“已晋级正赛／已晋级八强”；终点Tooltip和ARIA也保留确认状态。之后该事件的线、点、Hover及键盘命中区域全部停止。其他事件沿原规则继续，官方淘汰仍终止所有剩余轨迹。
- 全局六节点轴不变，原342条历史事件、所有原始概率/整数、当前数值与相对赛前变化不变。实际绘制221点；57事件分组保留。
- 全站测试、lint、typecheck、R4归档校验、23请求最终Prebuilt HTTP/RSC通过。新增直接资格、入围赛资格、不同轮八强资格、抽样100%反例、未来R5和旧终点不后移测试。
- 最终Prebuilt实际浏览器1440/768/390/320均无页面横向溢出；精确键盘Tooltip、Enter详情、Escape、LEC筛选及KC终点通过。截图位于仓库外审阅目录的qualification-ui/下。
- 未重新运行正式Monte Carlo，未修改事实、快照、模型、引擎、Team/Player及Session。未上线、未推送。

**本地候选已更新，替代上文旧产物哈希。** 新产物树SHA：`428bbadd72803f008183fc34baccb7914da5c17996aac0b942b4ca9fa17cdce8`；597文件、59内部链接、私人内容命中0；原批准统计聚合SHA不变。未来发布须使用此新版候选并重新核对发布门禁。

## 正式发布记录（2026-10-31）

用户已明确授权“上线，同步github”，并完成原Vercel账户设备验证与本次GitHub写入Deploy Key添加。

| 项目 | 核查结果 |
|---|---|
| 产品源码 | `2a34d9e893af9a5590a370c08f66d1c460131cf4` |
| 发布前Production／立即回滚目标 | `dpl_GSe1cM1eXZNmF7Zha6K8XNENEQKs`，READY |
| 发布后Production | `dpl_H1SFQx9NFzCjry5kckVYsx3YcRnL`，READY |
| 正式域名 | https://worlds-2026-simulator.vercel.app/ |
| 发布后控制面核查 | `2026-10-31T13:03:24.212Z` |
| Prebuilt树SHA | `428bbadd72803f008183fc34baccb7914da5c17996aac0b942b4ca9fa17cdce8` |
| Git自动部署 | 云端Ignored Build Step仍为`exit 0`，本地deploymentEnabled=false不变 |

实际仅执行一次手动Production Prebuilt部署，日志明确“Using prebuilt build artifacts”。没有重建、运行正式Monte Carlo、修改业务代码或云端项目设置。显式携带`TEAM_STATS_RELEASE_ENABLED=true`及原批准SHA参数，不使用私人完整快照、URL或Token输入。API未直接返回统计参数明文，不能冒充读取验证；参数依据实际部署命令与本地严格Checksum Gate核实。

部署后通过原项目API和正式域名Alias独立核对：新ID、READY、源码SHA、产物SHA及域名目标一致。当前列表中紧邻上一Production仍为上述正常版本。回滚状态无进行中操作；未执行回滚。若重大应用回归，可用已验证CLI和原账户执行 `vercel rollback dpl_GSe1cM1eXZNmF7Zha6K8XNENEQKs --yes`，然后复核域名、READY、统计及Simulator。Hobby紧邻上一Production限制依据[Vercel官方说明](https://vercel.com/docs/instant-rollback)，不假定任意旧版本均可回滚。

独立公网HTTPS连接仍超时，未取得生产页面正文，不能把HTTP/RSC或线上交互标为PASS。已请求用户验证R4六场结果、R5三场待赛、六节点、晋级事件终止及GEN/Chovy统计；截至此记录仍待人工回复。没有证据显示重大应用故障，因此未因网络超时盲目回滚。

GitHub同步范围：仅把本轮审核过的代码与发布记录快进推送到`release/s16-u2`，不修改`main`（核查值`6cc9de086075c40e6bd4ee2f0141f9b719cc2c67`），不强推、不推Tag。推送内容审计为22个产品/测试/报告文件，不包含原始CSV、研究资料、凭据或私人路径；未跟踪成果留本地。发布记录提交也属于本次同步范围，实际结果以推送回执和远端ref复核为准。

PRODUCTION DEPLOYMENT：READY。PRODUCTION VERIFICATION：CONDITIONAL（控制面PASS，公网独立访问未完成，人工验证待回复）。
