# P3-B.1：GoL历史数据与Git安全处理

日期：2026-10-15，CST。仅本地维护；未创建提交、推送、部署、公开Preview或改写历史。P3-A至P3-A.6未提交成果保留，生产统计门禁未改。

## 1. 结论

- `gol-match-rows.json`不是网站运行依赖，可以安全停止当前版本跟踪。
- `gol-segments.json`同样仅供离线生成，可移至仓库外私人目录。
- 两文件已先备份、验证SHA-256，再执行精确的`git rm --cached`并移出工作树。暂存区仅有这两项删除；尚未提交，GitHub与线上内容完全没变。
- `champion-pools.json`继续保留，文件逐字节未变，95人英雄池未重算、未替换来源、未相加新数据。
- 当前工作树和新生产构建已无这两份研究输入；**HEAD及历史、远端旧提交仍保留副本**。本轮没有消除历史风险。
- 聚合英雄池的公开展示／文件再分发条件仍UNCLEAR。清理中间文件不等于解决许可问题；不能由此批准公开新统计。

## 2. 文件清单与分类

分类：A开发研究；B构建输入；C页面运行需要；D可私有化冗余输入。类别可重叠；“构建输入”不表示构建时重新计算英雄池。

|文件／位置|实际内容及来源|Git／历史|依赖及产物／浏览器|处理|
|---|---|---|---|---|
|`lib/team-profile/gol-match-rows.json`|GoL选手比赛列表的48名选手、2,029条逐局研究记录，含行号、英雄、胜负、日期、对阵、赛事|此前跟踪；始于c44ba0a；本轮索引移除，历史保留|只有手动生成器读取；无App运行读取；不是公开路由；新构建无输入或trace命中|A/D：移至项目外私有备份|
|`lib/team-profile/gol-segments.json`|200个选手／赛事聚合片段、来源和核验信息，包含GoL及既有补核来源；不是完整OE数据|此前跟踪；c44ba0a加入、dfb1419更新；本轮索引移除，历史保留|只有手动生成器读取；App不读取；不是公开路由；新构建无输入或trace命中|A/D：移至同一私有目录|
|`lib/team-profile/gol-player-mapping.json`|95组Player ID与GoL来源ID映射，不含逐局战绩|仍跟踪；c44ba0a起存在|仅生成器读取；不是App运行／生产构建所需；未发现同名缓存|A：保留稳定身份映射，避免无关改动；来源映射本身不提供数据许可|
|`lib/team-profile/champion-pools.json`|95个页面所需英雄池，含英雄ID、场次、胜场、来源、片段覆盖／状态；是聚合数据|仍跟踪，c44ba0a加入、dfb1419更新|`data.ts`静态导入；进入服务端构建。页面HTML／RSC展示当前选手统计与来源；没有独立JSON下载路由|B/C：必须保留；公开使用条件单独待确认|
|`scripts/generate-profile-pools.mjs`|手动转换脚本，不是数据|仍跟踪|package构建不调用；本轮改为显式外部输入|保留；未执行成功生成，不改英雄池|
|`docs/team-profile.md`、`docs/team-profile-completion-2026-10-06.md`、`docs/team-profile-partial-pools-2026-10-06.md`|范围、核验表、聚合补录说明及来源链接，不是两份逐局研究输入的副本|原已跟踪，继续保留|不由页面读取；部署忽略docs|保持原样；不是来源许可证明|
|`tests/team-profile.mjs`及已有HTTP安全测试|来源URL断言、固定回归样例和404路径测试|原测试／P3-B待提交测试保留|仅测试，不是运行数据依赖|保留|
|`outputs/data-availability-2026-10-12/`下报告、`player-coverage.csv`、`evidence/player-availability-audit.json`|此前可用性研究与覆盖审计，含GoL链接|现有outputs忽略，未跟踪|不是App输入，不在public|继续私有，不移动、不公开|
|`.next`、`.vercel/output`、`dist`、`.vinext`等本地输出|缓存／旧构建目录|忽略，不跟踪|本轮重新生产构建；另扫已有缓存，未命中研究抽样记录；没有发现研究文件同名副本|开发缓存已隔离至项目外，不作为发布输入|

项目外的P2-C包、OE CSV及其历史GoL补核样例保持私有且不修改，不作为本轮清理目标。完整路径清单及缓存扫描日志仅保存在私人审计目录。

### 备份与哈希

已保存两份研究文件、当前英雄池及ID映射；另建并验证包含全部本地引用的Git bundle。备份目录700，文件600。`backup-manifest.json`记录实际私人位置、字节数与校验；不把私人路径或研究内容写入公开代码。

|文件|字节数|SHA-256|
|---|---:|---|
|gol-match-rows.json|448739|a51332f5c9a535fa4786086f82d353d9d1b12051e13bc7e16b9c57c3ecffe9bf|
|gol-segments.json|258705|9fd2c8b3f38ec071ae216bff970917b2e4f8a4abf4ac6d0d30c60dd16decfac7|
|gol-player-mapping.json|1649|6ff952a7ec72b8f73984962d7bec47ed999abd5fd7046c17caae5cbe76a82292|
|champion-pools.json|347296|4862aa1a8eecbcf99b520e5debfa3c44067e964bd6077a78514fcc5130b6175f|

旧版segments与旧版英雄池仍可从私人Git bundle恢复，没有覆盖历史对象。

## 3. 依赖关系及最小变更

原离线流程：研究文件＋ID映射＋现有身份／赛事／英雄目录 → 手动生成器 → champion-pools.json。

页面流程：champion-pools.json → lib/team-profile/data.ts → 选手详情英雄池。**页面不实时访问GoL，也不需要读取逐局研究记录。**

本轮生成器只改输入路径，不改汇总公式或输出格式。需显式设置`GOL_RESEARCH_DIR`指向现有仓库外绝对目录；用realpath检查目录及两个文件，拒绝指回仓库的符号链接。production、CI、Vercel拒绝生成。没有环境变量时明确失败，不默认去仓库内找文件，也不自动获取远端。

未来经授权维护时：

```sh
# 仅本地手动维护；PRIVATE_GOL_DIR由本机设置，不提交路径或.env。
GOL_RESEARCH_DIR="$PRIVATE_GOL_DIR" node --import tsx scripts/generate-profile-pools.mjs
```

该命令会改写聚合英雄池，**本轮未执行生成**。生成器不承担许可判断，不能将能运行理解成获准公开。

`.gitignore`／`.vercelignore`原已排除两研究文件；本轮补充私人审计／备份目录规则。更新待审阅文件清单，明确包括两项删除；没有`git add -A`或自动暂存其他修改。

## 4. 历史与远端证据

两研究文件在以下五个本地可达提交中存在：

|提交|说明|
|---|---|
|c44ba0a|最初加入两研究文件、映射及聚合英雄池|
|44c2b10|保留研究文件|
|dfb1419|更新segments与英雄池，逐局文件不变|
|60893bb|仍含研究文件|
|a43de3e（当前HEAD）|仍含研究文件；当前索引删除尚未提交|

这些提交由main保留；本地origin/main指向更早的afacacf，不能拿它代表远端当前状态。其他本地checkpoint引用已纳入只读清点及完整bundle备份，不移动或删除任何引用。

GitHub tree API本轮返回限流403；对已知远端提交[60893bb](https://github.com/louissslyz-byte/worlds-2026-simulator/commit/60893bb28625863d5bf488cb96bdc671169a4ef9)的两个raw文件进行了只读核对，均200，SHA-256与私人备份完全一致。因此可以确认**远端该历史提交确有公开可读取副本**。本轮没有据此声称已审计全部远端分支、fork、PR或当前main tip。

旧Vercel部署可能仍含当时上传的源码／构建缓存，不能从当前页面404推定平台存储已清除；没有登录检查或删除部署。研究文件不是现有Next公开路由，旧部署是否有其他公开入口未作全面远端扫描。

## 5. 历史处理方案A／B

|事项|A 当前版本清理（本轮仅完成本地准备）|B 经另行授权的历史处理（未执行）|
|---|---|---|
|解决问题|未来经审核提交后，新树不再含两研究文件；新构建不需要它们|按确认的路径／blob范围清理选定远端历史及引用，降低旧地址可访问面|
|不能解决|旧commit、raw地址、fork、已下载副本、旧部署；聚合英雄池许可|第三方已有副本无法收回；仍需处理fork／PR／缓存／部署；不自动解决保留聚合数据的许可|
|Git影响|普通删除提交，不需强制推送；本轮尚未提交或推送|相关commit SHA改变；通常需协调强制推送、分支保护、协作者重新同步；不应只看main|
|部署影响|本轮对线上零影响；未来推送可能自动触发Vercel，必须另获发布授权|可能影响提交关联、回滚和自动构建；须先核对平台设置、保存已知正常部署；不要顺带重建项目|
|备份|外部哈希备份＋历史bundle；旧历史不动|完整离线／异地备份、分支／tag／PR引用清单、允许清理范围及维护窗口|
|回退|尚未提交时只取消这两路径的暂存删除，再从已核验私人备份恢复；输入路径改动单独反向修补，保留其他未提交成果|先在独立副本演练并验算；恢复原引用需再次协调，可能重新暴露材料；备份不公开|

**目前不自动决定必须重写历史。** 如果目标只是不再新增分发，A足够；如果目标是尽可能撤除旧公开副本，A不够，需用户明确授权后评估B，并核对来源要求及GitHub／Vercel缓存处理。没有执行filter-repo、BFG、force push、reset、分支删除或远端重建。

## 6. 使用条件

沿用[此前P3-B审查](./P3-B发布审查报告.md)在2026-10-15的证据，不重复对受阻GoL网页进行请求。

|行为|结论|
|---|---|
|GoL逐局研究记录公开再分发|UNCLEAR：未确认适用明示条款，继续阻止新增发布|
|GoL聚合研究片段公开存入仓库|UNCLEAR：不能由网页可访问推导再分发权|
|现有英雄池在HTML／RSC展示|UNCLEAR：功能暂保留不代表确认许可|
|公开champion-pools.json文件|UNCLEAR：文件复制／再分发与页面展示应分别确认|
|添加署名／Riot粉丝政策|不能自动授权GoL第三方数据|

适用来源：[GoL官网](https://gol.gg/)、[Riot粉丝政策](https://www.riotgames.com/en/legal)、[Riot开发者政策](https://developer.riotgames.com/policies/general)。本轮复用先前研究，不声称重新取得当前GoL条款，不认定缺乏明示许可就必然违法；不是最终法律意见。未联系维护者。

下一步：获得可适用的公开条款或授权依据后，分别确认页面聚合展示、浏览器传输、公开JSON、逐局缓存的允许范围及署名要求。若仍无依据，保留UNCLEAR和发布限制，不扩大公开数据。

## 7. 验收结果

|检查|结果|
|---|---|
|lint／TypeScript|PASS|
|原网站回归（赛事、Manual Pick、Custom、GPR、Monte Carlo、10万次缓存）|PASS|
|Team Profile原测试|PASS，19队95人、阵容／晋级／英雄池等|
|新增GoL隔离测试|PASS：外部目录、生产／CI门禁、符号链接、默认失败不改英雄池、索引及忽略规则|
|P3-A.6显示回归／P3-B安全19组|PASS|
|本地统计全部页面|PASS，114页面（19队95人），无需研究输入|
|本地HTML／RSC安全检查|PASS，25请求|
|Next生产构建|PASS；故意配置本地统计开关＋真实外部快照＋CI／Vercel仍关闭|
|生产完整英雄池HTTP检查|PASS，19队95人、1,302条英雄行，顺序／场次／胜率与现有聚合文件一致；原阵容与晋级之路正常|
|生产HTML／RSC安全检查|PASS，32请求；错误本地开关仍不显示私有统计|
|GoL构建／public检查|PASS，318文件、8个真实逐局对象canary，研究内容／文件路径／trace无命中|
|私有统计及凭据构建扫描|PASS，282生产文件、15个canary；私有数据／trace／public／客户端私人路径无命中，source map为0|
|其他本地缓存抽样|244文件，无研究canary命中；不代表已清除云端旧缓存|
|数据不变|英雄池及映射SHA-256与起始备份一致；P2-C清单、原始CSV未改|
|Git审计|仅两项研究删除被暂存，HEAD及引用不变，既有修改保留；未新增私有数据入索引|

本机Node24.19.0，项目目标Node22，未声称完成云端Node22构建。开发首次遇到watch文件句柄限制，改为进程级WATCHPACK_POLLING重启后验收通过；未改项目配置。Next自动生成的代理说明和开发缓存移至外部审计目录，未提交。

生产扫描是本次新构建的验证，不能覆盖未知漏洞、旧部署、第三方拷贝或历史数据使用条件。

## 8. 本轮文件与停止点

修改：`.gitignore`、`.vercelignore`、`scripts/generate-profile-pools.mjs`、`docs/p3b-release-files.txt`。

新增：`scripts/private-gol-input.mjs`、`scripts/audit-gol-artifacts.mjs`、`tests/gol-research-isolation.mjs`、`tests/gol-profile-http.mjs`、本报告。

索引及工作树移除：`lib/team-profile/gol-match-rows.json`、`lib/team-profile/gol-segments.json`（均有验证后的私人备份）。

UI、原英雄池、ROSTER、ROAD TO WORLDS、P2-C、公式、身份、GPR、Rating、Monte Carlo、赛事引擎及生产开关均未改。所有本地测试服务在验收后停止。本轮止于P3-B.1，不自动发布或执行方案B。
