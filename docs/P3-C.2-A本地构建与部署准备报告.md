# P3-C.2-A：本地生产构建与Vercel Prebuilt准备

日期：2026-10-16，CST。沿用`release/p3-c1`、P3-C.1提交`aac697a`及稳定Tag。仅登录、读取现有Vercel项目并在本地构建／测试；未创建远端Deployment、未推送、未修改云端设置。

## 一、四项结论

|项目|结果|说明|
|---|---|---|
|BUILD READY|**PASS**|真实Vercel CLI 64.2.0执行`build --prod --standalone`成功，已生成完整`.vercel/output/`，不是只通过Next构建。|
|DATA READY|**PASS**|原886,093字节聚合候选不变；114页投影一致、797局范围及19队95人不变。|
|SECURITY READY|**PASS（本地产物）**|514个实际文件、54个内部符号链接检查通过；无个人源路径、凭据、.env、原CSV、完整研究快照或GoL逐局输入，完整聚合只在服务端函数。|
|DEPLOY READY|**CONDITIONAL**|技术产物可供下一轮部署；正式命令必须携带两项运行变量，并需用户确认Git自动部署的防覆盖策略。云端运行、域名切换、CDN／平台路由和回滚执行留待P3-C.2-B。|

本轮不要求云存储、数据库、数据API或GitHub上传聚合文件。没有改变授权范围或重新研究数据许可。

## 二、实际绑定与平台只读结果

- 项目名称：`worlds-2026-simulator`；沿用原projectId／orgId，没有创建或重新绑定项目。
- Framework：Next.js；云端Node：`22.x`；Build Command：`pnpm build:vercel`；Root Directory未设额外子目录。
- 已执行现有项目的`vercel pull --yes --environment=production`，只下载设置与变量到忽略的`.vercel/`。
- `autoExposeSystemEnvs=true`。拉取的生产变量中没有`TEAM_STATS_RELEASE_ENABLED`、`TEAM_STATS_RELEASE_SHA256`；当前项目级统计仍未开启。
- GitHub连接仍存在，Production Branch=`main`，`gitProviderOptions.createDeployments=enabled`，deploy hooks为空。
- 当前生产域名：`https://worlds-2026-simulator.vercel.app`。
- 当前正常Production：`dpl_6CTe6U541YXsukbjLpgbAEYx7BRo`，状态READY。
- Deployment URL：`https://worlds-2026-simulator-i3vzyr9lq-luis-cf15.vercel.app`；创建于2026-10-12 21:10:46 CST。
- 当前账号方案Hobby，成员角色OWNER；项目`lastRollbackTarget=null`，没有执行回滚。

以上来自已登录CLI的pull、inspect和GET API。完整响应、账户／认证信息仅在项目外私人审计目录；报告不包含Token或原始环境值。

## 三、本地Prebuilt架构

```text
项目外原聚合候选
 → 本地SHA／严格schema检查
 → 固定的已验证聚合资源
 → 不含开发.env的临时源码副本（沿用同一个项目绑定）
 → vercel build --prod --standalone
 → 只清理可选诊断信息中的私人路径
 → 复制完整Build Output回原项目.vercel/output
 → 检查函数与数据、直接启动打包handler做HTTP验收
```

采用CLI官方支持的本地构建与Build Output API流程。[build说明](https://vercel.com/docs/cli/build)支持生成`.vercel/output`；本轮使用`--standalone`将函数依赖内联，避免CLI64默认的`filePathMap`继续引用源码目录。构建的framework仍是现有Next，没有新建产品或更换框架。

本机实际工具：**Node22.23.3、pnpm9.15.9、Vercel CLI64.2.0**。包装器会核对版本，拒绝本机默认的Node24／pnpm11回退包装器。Next实际构建仍由原`pnpm build:vercel`调用，lockfile／依赖声明未改变。

## 四、LOCAL_PREBUILT与安全边界

`scripts/build-prebuilt.mjs`是本地入口，拒绝直接在CI／VERCEL环境启动；先用P3-C.1既有转换校验路径准备候选，不重算统计。

新的`LOCAL_PREBUILT`内层模式**不读取外部输入路径**，只读取固定的筛选后资源；需要忽略目录下的临时许可文件，匹配项目／owner、候选SHA、一小时有效期及活跃本地runner。许可文件只在临时构建目录存在，结束即移除。

普通云端构建既无该许可，也不读取外部候选；启用统计却没有批准的本地Prebuilt输入时明确失败。原P3-A私有快照门禁不改，production／CI／Vercel不能读取完整P2-C，也没有失败后回退。

不再调用HTTPS数据下载；`TEAM_STATS_RELEASE_URL`／`TOKEN`不再需要。运行期仍只读取固定聚合资源并验证SHA，不使用任何私人输入路径。

源码副本只来自Git管理／未忽略的本轮代码文件，额外复制现有项目绑定、三个必要的真实pull生产标识和已验证候选。根目录开发者`.env*`、OIDC凭据、完整生产变量文件、原研究目录都不复制。构建后删除临时源码副本，最终产物不依赖它。

## 五、发现并修复的真实构建问题

1. CLI固定缓存目录不可写：改用CLI依赖支持的`XDG_CACHE_HOME`到私人工作目录，没有改变HOME或扩大目录权限。
2. 默认pnpm包装器启动Node24／pnpm11并写入无关workspace项：撤销仅该自动添加项，改用项目固定pnpm9；`pnpm-workspace.yaml`与起始版本一致。
3. CLI默认产物含`filePathMap`：使用官方`--standalone`，全部依赖复制到产物内部，外部符号链接为0。
4. Next/Vercel默认会带入开发`.env.local`及带个人路径的模块引用：改在中性临时目录构建同一源码，不复制开发.env。原文件留在原位、内容不变，没有临时删除用户环境文件。
5. CLI附带诊断trace和builds.json中的本机CLI／builder路径：不发布可选`diagnostics`、`static/_next/__private`；将`builds.json.argv`改为可复现的命令名、去掉本机`requirePath`。保留target、error保护、CLI版本、framework及实际构建记录。已查CLI64.2.0的prebuilt读取代码，其部署校验使用这些保留字段；没有改函数代码、路由或统计。

Next仍保留中性`/private/tmp/worlds-s16-build-*`模块标识。它不含用户名、原项目、候选或凭据路径；临时目录已删除，打包函数仍通过实际HTTP测试。**没有声称所有绝对路径字符串都不存在**，而是确认个人／私人源路径不进入产物。

## 六、产物与数据审查

Build Output API version=3，target=production。所有函数runtime=`nodejs22.x`，无`filePathMap`，所有符号链接均指向产物内部；没有本机原生`.node`插件或source map。

聚合资源位于：

`functions/teams/[slug].func/.team-stats-release/data.json`

Player函数由CLI去重为指向同一bundle的内部链接；战队、选手两个逻辑函数均可读取同一个完整候选。Launcher在函数目录内运行，固定资源相对路径正确。

候选SHA-256：

`c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`

产物树SHA-256（实际文件哈希及内部链接清单）：

`95c344754572ba08818b1c244a4c9ab3ff90e16783b572eb3204029ed1eb3b1d`

扫描514个实际文件、54个内部链接、8个真实GoL逐局对象canary；检查开发／pull环境中的真实凭据及CLI认证Token，不输出其值。未命中个人路径、真实凭据、原研究文件／CSV、完整P2-C标识、外部链接或public完整聚合包。批准展示的聚合数值不作为泄漏误报。

数据文件未进Git，`.vercel/output`本来就被忽略；私人审计目录新副本也被忽略。按本轮范围，不对旧Git历史作任何处理。

## 七、功能与回归验收

|检查|结果|
|---|---|
|lint／typecheck|PASS|
|原网站回归|PASS，System／Custom、Manual Pick保留、Play-In／Swiss／Knockout、GPR／Rating、Monte Carlo复现、10万概率缓存|
|P3-A.6显示测试、P3-B安全、GoL隔离|PASS|
|发布转换专项|PASS，114投影一致，两次数据字节复现，拒绝完整快照／多余字段及CI私人输入，Preview拒绝|
|LOCAL_PREBUILT保护|PASS，绑定、许可有效期、活跃runner、符号链接、失败关闭和target元数据保留|
|Next生产构建|PASS，实际由Vercel CLI调用|
|Vercel本地build|PASS，真实CLI64.2.0、Production、standalone|
|直接运行打包函数|PASS，使用复制后的output，临时源码已删除|
|19队95人生产HTTP／RSC|PASS，122请求，所有现有显示指标、样本、缺失状态、真实分布与三类组合继续读取同一候选；JSON／研究路径404|
|原Champion Pool|PASS，1,302条英雄行的顺序、场次、胜率不变，Roster／Road To Worlds正常|
|产物安全扫描|PASS，514文件／54内部链接，未见受限输入或凭据|

`tests/serve-prebuilt.mjs`直接require CLI生成的函数launcher，通过127.0.0.1:3025接收请求。它比只测原Next目录更进一步，但**不是Vercel CDN／Linux容器、域名路由、云端流式传输或云端系统变量的完整模拟**。这些必须在正式部署后验证，不能将本机设置production测试当作已经上线验证。

本轮没有UI改动，不重复P3-A.6视觉设计。原样保留图表／定义／样本交互与布局；全部现有统计值由同一schema、SHA和一致性测试保护。没有修改原CSV、P2-C、Metric Dictionary、19队95人身份、英雄池或赛事逻辑。

## 八、Production运行变量

本地build由真实`vercel pull`下载的Production标识及`build --prod`目标选择生产路径，不依赖未来新Deployment ID、URL或Git SHA。项目代码不需要这些构建期尚不存在的系统变量。

运行仍需要：

```text
TEAM_STATS_RELEASE_ENABLED=true
TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2
```

Prebuilt不会自动将本地shell自定义变量变成云端运行配置。下一轮用正式命令的`--env`为该次部署设置上述两项，无需先修改项目级变量，也不传私人路径或LOCAL_PREBUILT许可。

本项目实际开启了系统变量暴露。官方说明[VERCEL／VERCEL_ENV在运行时可用](https://vercel.com/docs/environment-variables/system-environment-variables)，生产目标应提供production；本轮没有手改云端系统变量。正式部署后仍需inspect确认target，实际访问统计页面验证门禁与资源，才算云端运行通过。[Prebuilt说明](https://vercel.com/docs/cli/deploy)特别指出构建时缺少未来系统变量，所以本轮不依赖新Deployment URL／ID；没有启用额外Skew Protection功能。

## 九、Git自动部署防覆盖

**风险已确认存在**：Git连接的`createDeployments=enabled`且生产分支main。当前项目级release变量不存在，未来Git推送可能重新构建出不带统计的版本，覆盖CLI发布。只不推release分支不能防住main或其他自动部署。

最简单可靠方案：经用户确认后，暂停该项目的Git自动创建Deployment，保留Git仓库及关联，S16期间只用经审计Prebuilt维护；或由用户确认采用官方`git.deploymentEnabled=false`策略并安排其在远端仓库生效。**本轮没有切换任何设置或推送配置**。

正式部署前请确认是否暂停自动部署；未确认之前至少不要向已连接的分支推送。不要将“不推送”的操作约定误称技术上已经禁止自动覆盖。[官方Git配置](https://vercel.com/docs/project-configuration/git-configuration)说明默认会触发未禁用分支的部署。

## 十、构建复现与正式命令

先确保Node22.23.3及真实pnpm9.15.9在PATH前部，Vercel固定64.2.0。若CLI不在PATH，可通过本机`VERCEL_CLI_BIN`／`VERCEL_CLI_CONFIG`选择已登录的CLI及私人配置目录；这些值不写入Git，也不进入最终产物。

```sh
# 只读更新已有绑定，不创建新项目。
vercel pull --yes --environment=production

# 仅本地：PRIVATE_CANDIDATE是原仓库外候选，绝不提交。
TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2 pnpm build:prebuilt "$PRIVATE_CANDIDATE"

# 扫描并复核批准哈希，完整日志／manifest仅写到私人位置。
TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2 node --import tsx scripts/audit-prebuilt.mjs
```

以下是**P3-C.2-B经授权后才执行**的完整正式部署命令，本轮未执行：

```sh
vercel deploy --prebuilt --prod \
  --env TEAM_STATS_RELEASE_ENABLED=true \
  --env TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2
```

使用本轮已登录的同一global-config；如为隔离配置目录，在命令中增加相应`--global-config`，不要改用默认目录造成未登录／错账号。部署前核对项目绑定、产物target、候选SHA、产物树SHA及文件清单；不要将命令改成不带prebuilt的云端构建，也不要使用其他旧output。

此命令只上传已生成的Build Output，不要求推送main或release分支，不需要云存储URL／Token。没有准备或执行创建公开Preview的替代命令。

## 十一、部署后及回滚

### 部署后

1. inspect新Deployment：target production、READY、域名指向正确；实际运行Node22，错误日志无找不到聚合资源／SHA不符。
2. `/`、`/rankings`、`/simulator/new`、`/simulator`、`/methodology`、`/teams`及深层链接刷新正常，字体／队徽／英雄图标正常。
3. GEN／BLG／CFO、五个位置页面正常；19队95人的显示、PARTIAL／COMPLETE、样本与来源仍真实。
4. 定义／样本、PLAYSTYLE、选点、Draft展开正常，320／390px无溢出，原英雄池不变。
5. System／Custom完整赛事，Manual Pick、分轮／赛段模拟、重置、概率与冠军恢复正常。
6. 数据下载路径404，HTML／RSC无个人路径或原始研究数据；没有意外Preview或Git后续覆盖。

### 回滚

当前Hobby／OWNER账户按官方规则可回到**紧邻的上一生产部署**，不是任意历史部署。新部署后，若没有其他生产发布插入，本报告记录的`dpl_6CTe6U541YXsukbjLpgbAEYx7BRo`应成为候选上一版；正式操作前在平台核对资格，不自行假定。

故障时经用户授权通过Dashboard Instant Rollback恢复上一正常版本，核对域名、旧页面与模拟器。回滚使用旧Deployment配置，不会因本地变量或当前项目变量变化而自动重构旧版。[官方回滚规则](https://vercel.com/docs/instant-rollback)

保留当前正常部署，不删除远端Deployment；保留稳定Tag和当前本地代码及数据哈希。若需要修复代码，用普通提交／revert，不改Git历史。没有执行回滚演练或云端写操作。

## 十二、文件与停止点

修改：`.gitignore`、`.vercelignore`、`package.json`、`scripts/prepare-statistics-release.mjs`。

新增：`scripts/build-prebuilt.mjs`、`local-prebuilt-input.mjs`、`prebuilt-stage.mjs`、`audit-prebuilt.mjs`、`tests/local-prebuilt.mjs`、`tests/serve-prebuilt.mjs`、本报告。

`.vercel/project.json`／生产变量缓存是pull下载的忽略文件；认证、原产物备份、manifest和审计记录位于项目外私人目录，不提交。原`.env.local`未改，workspace与lockfile未改；没有修改UI、lib/sim或任何数据公式。

本地产物已准备好。本轮到P3-C.2-A停止；下一步仅在用户授权P3-C.2-B后执行正式Prebuilt部署，并确认自动部署防覆盖策略。
