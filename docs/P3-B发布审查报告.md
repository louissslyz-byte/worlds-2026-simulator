# P3-B：发布前安全与使用条件审查

日期：2026-10-15，CST（UTC+8）。完成本地审查和必要的最小安全修复；没有提交、推送、部署、公开Preview、注册产品或联系维护者。生产统计仍关闭。本报告不包含受限统计数值、原始数据或凭据；详细日志保留在项目外私人审计目录。

## 一、三个独立发布结论

|发布对象|结论|依据与未满足条件|
|---|---|---|
|A CODE RELEASE：新代码，生产统计保持关闭|**CONDITIONAL**|技术门禁、回归和生产产物检查通过，可以按白名单准备提交；真正推送／部署前还需核对远端自动部署设置，并处理Riot登记／声明／商标和已有GoL数据使用问题。不是无条件发布批准。|
|B STATISTICS RELEASE：OE／GoL聚合统计展示|**BLOCKED**|OE当前条款不可读；GoL使用条件未确认。Riot粉丝政策不能替代来源授权，服务端展示也不消除该问题。保持本地预览。|
|C RAW DATA RELEASE：CSV／逐局缓存／研究样本再分发|**BLOCKED**|未取得明确适用的再分发依据；已有GoL逐局文件还存在历史跟踪风险，不能新增公开数据包。|

BLOCKED表示当前发布证据不足，不表示已认定违法。以下为公开使用条件研究，不是最终法律意见。

## 二、Git与文件审计

- 当前分支`main`；本地HEAD为`a43de3ee2e322fd0b0b23f618c52d279fe315e91`。18个可达提交、511个可达对象，其中324个blob已扫描；索引207文件，暂存区为空。
- 逐一检查P3-A至P3-A.6已有修改／未跟踪代码。没有发现本轮之外新增的业务修改；此前Player Header提交及本地未提交成果保留。
- 索引和可达历史未发现OE CSV、P2-C快照、`.env`或常见私钥／GitHub／Riot／JWT凭据候选。模式扫描不是对未知秘密格式的数学保证。
- `.env.local`存在本地Vercel OIDC凭据，已忽略；没有输出其值，也未将其写入新文档／代码。没有读取或复用历史部署密钥。
- **历史风险**：`lib/team-profile/gol-match-rows.json`已在`c44ba0a`被跟踪，包含选手逐局研究记录。`gol-segments.json`为来源聚合研究材料；`champion-pools.json`为当前页面使用的聚合英雄池。它们不是本轮P2-C快照泄漏，但各自使用／再分发条件仍需核实。
- 本轮没有删除这些已跟踪文件、改变英雄池、移除索引或重写历史。忽略规则不会让历史对象消失。后续若要移除：先保留私有备份、确认生成流程与页面依赖，再由用户授权索引清理；如需历史清理，另行评估fork／缓存和协作者影响，不进行强制推送。

### 可提交与应排除

**新代码候选白名单**见`docs/p3b-release-files.txt`。该清单不表示整个既有仓库历史已获数据再分发许可。正式提交前须检查实际暂存差异；本轮未创建提交。

继续排除：OE CSV、P2-C完整JSON、offline-worlds-stats、GoL研究原始文件的新副本、本地验收HTML／截图／日志、`.env*`、私钥、`.vercel`、`.next`、开发缓存、个人交接文档及含真实统计样例的P3-A完成报告。旧报告仍在磁盘，仅加入忽略规则，没有丢弃。

建议两笔本地提交：①完整的P3-A系列代码＋本轮安全修复／测试（作为可验收整体，统计仍仅本地）；②本报告＋白名单。未经用户审核待提交清单，不创建正式提交。禁止使用不加审阅的`git add -A`；白名单不是执行命令。

## 三、本轮安全修复与信任边界

1. `.gitignore`补充私有快照、离线目录、研究文件、私人报告／验收目录和私钥排除。
2. `.vercelignore`补充研究／文档／私钥排除，减少本地CLI上传面；它不保护Git历史，不能作为Git集成或运行时门禁的唯一保障。[Vercel忽略规则](https://vercel.com/docs/deployments/vercel-ignore)
3. `statistics-server.ts`只收紧项目外路径验证：按真正父目录分段判断，并用`realpath`核对符号链接后的路径。修复`..name`前缀误判与外部符号链接指回项目内部的问题。原production／CI／Vercel前置关闭不变，未开放新读取方式。
4. 发现`.next/dev`开发缓存与生产输出并存，已移到项目外私人目录保留。生产扫描脚本遇到混合开发输出会失败，防止将其冒充生产结果；没有删除源码或离线快照。

**本地门禁不是网络身份认证**：Host与转发头可伪造；安全预览要求服务只绑定127.0.0.1、信任本机用户，且不得接公网代理／隧道。真实HTTP测试验证非本地Host和外部Forwarded／X-Forwarded头不显示统计，但不能证明任意恶意代理都不会伪装成本机。若未来要多人远程预览，需要单独设计认证，不能复用此本地开关。生产模式硬关闭独立于这些请求头，已实际验证。

没有公开下载API；路由参数不能改变快照路径。页面只输出必要聚合投影，完整数据包、源逐局ID和私有路径不发给浏览器。

## 四、OE／GoL行为分级

所有本轮查询日期均为2026-10-15。状态只针对表中具体行为，不扩大到其他用途。

|行为|OE 2026|GoL|证据能支持／不能支持|
|---|---|---|---|
|A 官网正常获取|UNCLEAR（当前条件）|UNCLEAR|OE已有10月13日正常取得记录；当前下载页403、普通浏览器超时。GoL请求超时、普通浏览器连接重置。历史取得事实不等于当前完整许可。|
|B 本地研究与分析|UNCLEAR（2026完整条款）|UNCLEAR|OE旧官方说明支持分析用途，本轮沿用已取得文件做有边界的本地检查；不能由旧页推定2026全部权利。GoL没有取得可确认适用的当前许可。|
|C 免费粉丝网站展示自行计算聚合指标|UNCLEAR|UNCLEAR|事实本身、原创计算、数据库复制和合同条件可能不同；目前不足以确认本项目具体公开展示权。|
|D 公开GitHub存放聚合JSON|UNCLEAR|UNCLEAR|比页面展示多了完整文件复制／下载用途，不能由C自动推导。|
|E 浏览器读取聚合数据，包括RSC／HTML|UNCLEAR|UNCLEAR|属于公开展示或传输，服务端处理、隐藏URL均不是豁免。|
|F 原始CSV／逐局缓存的公开缓存、下载、再分发|UNCLEAR|UNCLEAR|未找到适用的明示再分发条款；发布决策为BLOCKED，不断言一概违法。|
|G 现有英雄池及补充样本|NOT APPLICABLE（网站原英雄池不以新OE统计替换）|UNCLEAR|原网站英雄池有独立GoL来源及研究缓存；P2-C另有GoL补充来源。不能将OE结论套用于它们，也不能因为已经上线而视为获授权。|

### 已核验的来源与适用范围

|来源URL|当前访问及具体依据|结论边界|
|---|---|---|
|[OE当前下载页](https://oracleselixir.com/tools/downloads)|403；正常浏览器尝试超时，停止重复访问，未绕过限制|未重新确认当前2026下载说明、展示或再分发条款。|
|[OE旧官方下载说明](https://lol.timsevenhuysen.com/matchdata/)|当前可读；说明免费提供给分析师、解说和粉丝，页面列到2020文件|支持旧资料的分析用途；不作为2026 CSV完整许可。|
|[OE旧About](https://lol.timsevenhuysen.com/about/)|当前可读；CC-BY-SA说明仅针对部分Leaguepedia内容|不能扩大成整个OE数据库或GoL的统一许可证。|
|[GoL官方站](https://gol.gg/)|网页工具超时；正常浏览器连接重置；未取得当前条款|C–G仍需独立确认；没有用其他项目的GitHub许可证替代。|
|[Riot粉丝政策](https://www.riotgames.com/en/legal)|当前可读，页标2018-08；§1、§4–6|条件性非商业使用、第三方权益、标识与声明规则；不授予OE／GoL权利。|
|[Riot General Policies](https://developer.riotgames.com/policies/general)|当前可读，页标2025-05-29；Core／Registration／Monetization|规定登记／审核、声明、素材与商业化条件；不证明本项目已被批准。|
|[LoL Developer Policy](https://developer.riotgames.com/docs/lol)|当前可读；Registration明确不以使用官方API为前提，Data Dragon有静态资源说明|不应声称“不用API就无需注册”；静态英雄资源许可不涵盖第三方赛事数据库。|
|[Riot API Terms](https://developer.riotgames.com/terms)|当前可读，页标2013-12-09；Definitions／Licensed Uses|受其约束的API Materials有范围和第三方权利边界；不是OE／GoL的通用授权。|

没有联系维护者、发邮件、注册或提交审核。未使用访问受限页的历史文本冒充本轮当前条款。

## 五、Riot第三方项目要求

|事项|状态／建议|
|---|---|
|一般粉丝素材使用|ALLOWED，仅在粉丝政策条件内；不包含任意第三方资料。|
|产品登记／审核|RESTRICTED：面向玩家产品应按LoL Registration及General Registration处理。当前未核实已有产品登记／审核记录，发布前由用户完成或确认适用范围；本轮不代办。|
|鉴权API生产Key|NOT APPLICABLE于当前未调用鉴权API的离线统计路径；不豁免产品登记及其他政策。|
|非官方声明|RESTRICTED：正式发布应在明显位置提供适用官方legal boilerplate。当前公共footer只有赛程提示，不能替代。建议footer可见、Methodology补充；本轮不改UI。|
|Worlds／Riot标志与品牌|RESTRICTED：粉丝政策§5限制标志／商标，Developer Policies仅提供受条件限制的Press Kit素材使用路径。现有Worlds品牌／favicon来源与必要性、授权依据尚需核对，不能仅凭CDN可下载认定许可。战队标识还涉及各队权利。|
|原创性与外观|RESTRICTED：需保留独立产品身份，避免令人误认官方或过度近似Riot产品；本轮不重做视觉。|
|广告／收费／捐赠|RESTRICTED：非商业政策与Developer Monetization有不同适用条件及例外；目前维持免费，不自动增加商业化。|
|真实赛事举办规则|NOT APPLICABLE于本项目仅模拟赛事、不举办收费比赛的当前功能；如后续实际办赛需另审。|
|来源与口径|建议保留来源、范围、状态和快照，不称Riot官方预测；OE／GoL具体署名要求仍UNCLEAR。署名不能代替许可。|

建议中文辅助声明：“本站是非官方粉丝项目，未获Riot Games认可或赞助，不代表Riot Games或相关人员的观点。Riot Games及相关标识的商标权归各自权利人所有。”正式发布时应从[适用官方页面Core Policies](https://developer.riotgames.com/policies/general)核对完整英文boilerplate并按要求使用；中文建议不是对官方要求的替代。没有在本轮向页面加入声明或改变品牌。

## 六、未来数据发布方案

|方案|权限／数据安全|Git／Vercel／性能／维护|
|---|---|---|
|A 只发UI代码，生产统计关闭|不新增OE统计公开面；仍须解决既有GoL／Riot发布事项|最简单；当前架构已验证，无新增数据服务成本。当前优先选择。|
|B 获许可后发布最小聚合静态快照|须明确许可覆盖展示／浏览器传输；公开Git存放另外审查。剔除逐局记录、源数据库ID、无关区域包|适合现有Next；预生成一次、缓存读取，快且维护成本低。不要求每访客重算。|
|C 服务端按页面返回必要聚合|仍是公开数据，不能规避许可；可减少一次性暴露范围和payload|Vercel Functions／RSC可行，但增加运行与缓存维护成本；不应为隐藏JSON强造复杂后端。|

未来优先B的最小、已获许可聚合输入＋现有服务端页面投影，可结合C的按页输出；是否进公开Git单独决定。保留teamId／playerId／role、指标值与样本、区域分布、BP三类组合、来源、定义版本、日期及COMPLETE／PARTIAL／UNAVAILABLE。当前不生成公开包、不改生产开关。

## 七、GitHub／Vercel只读核查

- origin为`https://github.com/louissslyz-byte/worlds-2026-simulator.git`。
- 本轮匿名读取GitHub `main`提交接口返回`60893bb28625863d5bf488cb96bdc671169a4ef9`；本地HEAD比该观察点多一个Player Header提交。没有fetch／pull／push或修改远端。仓库元信息接口限流403，未拿到visibility字段。
- `.vercel/project.json`指向同名项目；未输出org／project ID。`vercel.json`为Next.js和`pnpm build:vercel`；Node配置22.x。本地测试环境实际Node24.19.0，未冒称已验证云端Node22。
- README称main自动发布，但本地配置不能证明云端当前Production Branch、Preview启用状态、部署保护、环境变量或alias对应commit。上述均为**待平台确认**，没有登录、改配置或调用远程写入。
- 实际线上GEN与Chovy页面均200，未显示新增统计，原阵容／英雄池仍显示。不能从两张页面反推云端环境变量已完整审计。
- [Vercel Git文档](https://vercel.com/docs/git)说明生产分支推送会发布，其他分支通常生成Preview。因此“只推非main分支”也不等于不会公开；当前禁止任何推送。

安全环境设置：Production和Preview不配置`TEAM_STATS_LOCAL`／`TEAM_STATS_SNAPSHOT`或对应`NEXT_PUBLIC_*`；正常Next生产模式，不覆盖NODE_ENV，不把本机.env或OIDC值复制上云。即使误配本地开关，当前代码仍硬关闭。

## 八、部署与回滚计划（仅计划，未执行）

### 部署前

1. 用户审阅白名单和实际暂存差异，确认无私有文件；解决历史GoL材料的处置与使用依据。
2. 核实Riot登记／审核、非官方声明和品牌素材条件；未满足不作为无条件发布。
3. 平台核对Git连接、生产分支、Preview触发规则、保护设置、Node22及环境变量，不靠README猜测。
4. 运行下节所有检查。停止dev，隔离`.next/dev`；新建生产构建并扫描，不使用旧`.vercel/output`直接`--prebuilt`发布。
5. 记录当前正常deployment ID／URL、域名指向、来源commit及环境配置；确认账号可用的回滚范围。
6. 获得用户新的发布授权后，才按确认的单一路径提交／推送／部署；若不允许公开Preview，必须先处理平台自动触发规则。不要双轨CLI和Git同时发布。

### 发布后冒烟

检查`/`、`/rankings`、`/simulator/new`、`/simulator`、`/methodology`、`/teams`及队伍／选手深层链接刷新；阵容、原英雄池、图片、字体、Header正常。统计仍关闭，JSON路径404，HTML／RSC无受限数据。实际走System和Custom完整模拟、Manual Pick保留、分轮／赛段模拟、重置、冠军生成和浏览器状态恢复，核对概率缓存及日志。不得因代码上线顺便开启统计。

### 故障回滚

确认故障后，用户授权将Production流量指回记录的正常deployment（平台Rollback或适用CLI），先恢复服务，再排查；验证上述路由和模拟关键流程。检查账户可回滚范围，Hobby与其他计划可能不同。随后用常规revert修复Git分支并重新验收，避免下一次推送重新发布坏版本；不强制改写历史。若涉及数据曝光，回滚不等于删除已被下载的副本，还需停止分发、处理缓存和独立评估历史材料。[Vercel回滚说明](https://vercel.com/docs/deployments/rollback-production-deployment)

## 九、本轮实测结果与复现

|检查|结果|
|---|---|
|lint／TypeScript／现有网站回归|PASS|
|P3-A专项读取|PASS，19队95位共114页面，数值／null／隔离检查|
|P3-A.5真实缺失／小样本渲染|PASS，仅项目外私有样例|
|P3-A.6显示测试|PASS|
|新增server安全测试|PASS，19组环境／代理头／路径／符号链接／缓存／投影；生产及CI在读headers前返回|
|本地启用HTTP／RSC攻击面检查|PASS，25个请求；实际发送Host，外部代理头及未知下载路径均拒绝统计|
|生产模式HTTP／RSC检查|PASS，32个请求；含路由参数和原网站路径；错误设置本地开关仍关闭|
|Next生产构建|PASS，故意设置TEAM_STATS_LOCAL＋真实外部路径＋CI／VERCEL变量|
|生产产物隐私扫描|PASS，282个生产文件、15个私有canary／路径，未命中私有数据或本地凭据；trace／public／客户端绝对本地路径无命中；没有生成source map|
|数据保留校验|PASS，P2-C清单文件哈希未变，OE原CSV与取得记录SHA-256一致|

新增复现命令（在已有Node／pnpm环境下，快照路径由本机安全设置，不写进仓库）：

```sh
pnpm lint
pnpm typecheck
pnpm test
node --import tsx tests/statistics-presentation.mjs
TEAM_STATS_SNAPSHOT="$PRIVATE_SNAPSHOT" node --import tsx tests/statistics-security.mjs
# 本地受控开发服务运行于3022时
TEAM_STATS_SNAPSHOT="$PRIVATE_SNAPSHOT" node --import tsx tests/private-statistics.mjs
STATISTICS_BASE_URL=http://127.0.0.1:3022 STATISTICS_EXPECT=enabled node --import tsx tests/statistics-http-security.mjs
# 停止dev并把.next/dev移至项目外私人目录；不混用开发缓存与生产输出
TEAM_STATS_LOCAL=1 TEAM_STATS_SNAPSHOT="$PRIVATE_SNAPSHOT" CI=1 VERCEL=1 pnpm build:vercel
TEAM_STATS_SNAPSHOT="$PRIVATE_SNAPSHOT" node scripts/audit-statistics-build.mjs
# 另以生产模式在本机3023启动，仍保留错误配置的本地开关测试
STATISTICS_BASE_URL=http://127.0.0.1:3023 STATISTICS_EXPECT=disabled node --import tsx tests/statistics-http-security.mjs
```

扫描是可复验的静态／动态证据，不声称覆盖所有未知漏洞。Host／代理测试使用原生HTTP，避免fetch实现将测试Host改回URL主机而造成假测试；正常RSC请求按Next同源`?_rsc`重定向处理，不放宽安全断言。

## 十、本轮修改及停止点

修改仅`.gitignore`、`.vercelignore`和`statistics-server.ts`的路径防护；新增server单测loader、安全测试、HTTP测试、生产扫描工具、本报告与白名单。P3-A.6界面、赛事／概率代码、离线数据、字典、身份、原英雄池均不调整，旧未提交成果保留。

建议先完成上述条件处理，再决定P3-C的**代码关闭统计发布**。当前不建议直接进入统计公开部署。来源许可、历史GoL材料、Riot登记／声明／素材和云端设置是具体待解决项；不能用构建通过替代这些条件。

本轮测试用本地服务均已停止，生产产物与项目外开发缓存保持分离。后续如需私人预览，按原P3-A本地启动方式重启；不能把开发缓存用于发布。

本轮到P3-B停止，不自动执行P3-C。
