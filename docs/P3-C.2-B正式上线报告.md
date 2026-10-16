# P3-C.2-B 正式上线报告

日期：2026-10-16，CST。**已执行一次Production部署；数据、HTTP、安全及解锁后补充的浏览器交互验收均已完成。**未推送GitHub、未创建公开Preview、未改变UI或统计结果。

## 1. 发布记录

|项目|实际结果|
|---|---|
|项目|worlds-2026-simulator，沿用现有绑定|
|分支|release/p3-c1|
|实际部署Commit|a57532f722b1386255a2e4d6e986b1e761b1b53c|
|本地发布Tag|worlds-s16-p3c2-production，指向上述Commit，未推送|
|稳定检查点|checkpoint-p3b1-2026-10-15，保留不变|
|新Deployment|dpl_B1pKQEe5JcZbRRFZiRmDALcg5Ley|
|Deployment URL|https://worlds-2026-simulator-7w1gawyyl-luis-cf15.vercel.app|
|正式域名|https://worlds-2026-simulator.vercel.app|
|部署创建时间|2026-10-16 09:55:25 CST|
|平台状态|READY，target=production，Node22.x|
|部署前正常版本／回滚基准|dpl_6CTe6U541YXsukbjLpgbAEYx7BRo|

平台Deployment metadata的githubCommitSha与实际部署Commit一致。发布后重新读取项目和Deployment API，确认正式域名alias与新Deployment对应；旧版本仍保留，生产部署列表中的紧邻上一版就是上述回滚基准。未执行第二次部署或回滚。

## 2. Git自动发布防覆盖：实际云端操作

已通过Vercel官方Dashboard的 **Build and Deployment → Ignored Build Step → Don’t build anything** 保存。页面返回“success: Ignored build step updated”；之后GET项目API确认`commandForIgnoringBuildStep=exit 0`，GET本次Deployment也确认对应项目设置为`exit 0`。这是实际云端状态，不是从本地配置推断。

该命令无分支／环境条件，Git触发的Production和Preview构建均会被取消；不会发布可用站点或覆盖生产域名。**Git事件仍可能产生CANCELED任务记录并占用平台部署配额，不能宣称Git webhook或所有任务记录已经消失。**本轮没有推送测试提交来制造任务。

现有GitHub连接、仓库、main生产分支、项目、域名、旧Deployment全部保留。官方Prebuilt流程跳过云端源码Build Step，本轮实际CLI手动发布成功，证明手动发布能力保留。

本地`vercel.json`同时新增`git.deploymentEnabled=false`，原framework和buildCommand不变；已重新完成全部Prebuilt构建。该本地配置没有推到GitHub，因此**不能将它当成远端所有分支已经读取此文件的证据**；实际防覆盖保障来自已保存并回读确认的项目级Ignored Build Step。

补充纠正P3-C.2-A的判断依据：`gitProviderOptions.createDeployments=enabled`本身不是可靠的自动构建开关证据。官方SDK将其描述为GitHub deployment事件相关行为；此轮没有猜测修改该字段，也没有把它改成disabled冒充关闭自动构建。云端Git页面的GitHub连接依然存在。

依据：[官方项目设置](https://vercel.com/docs/project-configuration/project-settings)、[Ignored Build Step使用说明](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel)、[Git配置](https://vercel.com/docs/project-configuration/git-configuration)。官方说明exit 0会取消构建；并不等于不存在取消任务。

## 3. 代码、构建与数据

本轮产品代码没有变化。部署Commit只修改：

- `vercel.json`：增加全分支Git自动部署禁用配置。
- `.gitignore`、`.vercelignore`：补充本轮私人审计目录排除规则。

本报告在部署后记录验收，不改变部署代码及产物；发布Tag始终指向实际部署Commit。

按要求重新pull既有生产设置，使用原`pnpm build:prebuilt`流程：Node22.23.3、pnpm9.15.9、Vercel CLI64.2.0，真实执行`build --prod --standalone`。没有重新下载／计算797局统计，不使用云存储。

候选：886,093字节。

数据SHA-256：

`c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`

本轮重新构建后的产物树SHA-256：

`265fc91f3e226fb1240423ee756f94783a6717bb84e56fb364f26db2b9f14e10`

与上轮产物树SHA不同，原因是本轮配置／源码快照和新构建生成信息变化；不是统计数据变化。实际文件／链接逐项manifest存于仓库外私人审计目录。

514个实际文件、54个内部链接检查通过：Build Output version3、target production、函数nodejs22.x、无外部符号链接／filePathMap，两个逻辑统计页面函数共享已验证服务端聚合资源。8个真实GoL逐局canary未命中；没有原CSV、完整P2-C、GoL研究文件、个人源路径、.env或实际凭据。数据资源未进入Git或public。

原P2-C源SHA保持`79781a1d8c05ab9649866eae8401049084eeb4634f1f0f0713ac5030ad4c10dc`；原Champion Pool SHA保持`4862aa1a8eecbcf99b520e5debfa3c44067e964bd6077a78514fcc5130b6175f`。

## 4. 部署命令与运行模式

仅执行一次：

```sh
vercel deploy --prebuilt --prod \
  --env TEAM_STATS_RELEASE_ENABLED=true \
  --env TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2
```

实际使用已登录的隔离global-config目录和CLI64.2.0。没有设置TEAM_STATS_LOCAL／TEAM_STATS_SNAPSHOT，没有URL／Token云存储输入。日志确认“Using prebuilt build artifacts”，没有云端重新运行Next源码构建。

本次Deployment运行统计页面正常，19队95人的受门禁页面均成功读取资源；若开关不生效不会出现统计，若SHA不符会报错。由此验证了发布开关及SHA校验的实际运行。Deployment GET返回的env是平台处理后的变量名清单，未直接暴露这两项的明文值；没有据该清单假装读取了明文运行值。项目级变量不需要永久写入，配置属于本次CLI部署。

生产LOCAL PRIVATE门禁代码、测试均不变；线上只通过固定发布资源读取统计，没有私人快照回退或公开JSON接口。

## 5. 本地测试：全部通过

- lint、TypeScript。
- 原网站完整回归：System、Custom、Manual Pick保留、Play-In／Swiss／Knockout、冠军、GPR、Rating、Monte Carlo复现及100,000次快照。
- P3-A.6统计显示测试。
- P3-B统计安全19组环境／代理头／路径检查。
- P3-B.1 GoL隔离。
- P3-C发布转换：114页一致、字节复现、严格schema、CI／Preview／私人输入拒绝。
- LOCAL_PREBUILT保护。
- 新产物函数实际启动：122次HTTP／RSC通过。
- 新产物原英雄池：19队95人、1,302条英雄行顺序／场次／胜率一致；Roster及Road To Worlds正常。
- Next生产构建及Vercel真实本地构建通过。

## 6. 线上自动检查：通过

使用正式域名进行，不是本地或Deployment保护绕过地址。

1. 19战队＋95选手页面，全部114页的统计指标与批准候选逐项格式化值一致；共122个统计HTTP／RSC及禁止下载路径检查通过。
2. 19队95人原英雄池1,302行的英雄顺序、出场数、胜率全部一致；Roster和Road To Worlds仍显示。
3. 14个核心／代表页面均200：主页、Rankings、Simulator New、Simulator、Methodology、Teams、GEN／BLG／CFO、GEN五个位置档案。
4. 从实际HTML发现的21个JS／CSS资产均200；扫描未发现完整聚合文件、私人源路径、逐局研究标识或真实凭据。
5. `.env`、`.env.local`、聚合JSON、完整快照、GoL研究文件及研究目录下载路径9项均404；RSC／伪造本地主机头3项仍只返回批准的发布视图。

批量检查最初使用Node直连时遇到本机DNS连接超时，未返回网站5xx。随后仅在仓库外验证工具中复用macOS已有系统代理，重跑通过；未改网站或平台网络安全设置。

## 7. 实际浏览器验收：完成

先前验收因Mac锁屏暂停；用户回复“已解锁”后继续。未尝试绕过锁屏，未再次部署。统计响应式检查使用正式站点的实际浏览器视口；完整模拟及部分统计交互使用Safari操作。

### 页面与宽度

|页面|实际检查宽度|结果|
|---|---|---|
|GEN|320px|scrollWidth=320；PARTIAL及样本面板正常|
|Chovy（MID）|1440px|scrollWidth=1440；5项指标3＋2布局|
|Canyon（JUNGLE）|768px|scrollWidth=768；3项指标同排，图片无破损|
|Kiin（TOP）|1440px|scrollWidth=1440；4项同排|
|Ruler（BOT）|390px|scrollWidth=390；7项自然换行，图片无破损|
|Duro（SUPPORT）|320px|scrollWidth=320；两项依空间纵向排列，图片无破损|
|BLG|390px|scrollWidth=390；LPL部分数据、8项展开及BP正常，图片无破损|
|CFO|320px及Safari桌面|scrollWidth=320；LCP完整数据、赛区均值、BP及组合正常|

这是代表页面覆盖四个指定宽度，不将其描述为所有页面×所有宽度的穷举测试。

### 统计交互

- Ruler手机端“GD@15：定义”成功展开：公式、单位、方向及有效规则正确；切换“样本量”后只剩该面板，显示实际29局、有效29局、缺失0、排除0、PARTIAL、12个真实观察点、范围和快照；展开后仍无水平溢出。
- GEN手机样本面板保持PARTIAL，没有把缺失字段数0误解为整个赛段完整。
- CFO PLAYSTYLE“查看全部指标”可展开其余4项图表；完整基准使用“赛区均值”，场均时长显示“低于赛区均值1分3秒”，比例差使用“个百分点”。LCK／LPL仍使用“已收录样本均值”。
- CFO DRAFT样本展开分别显示Pick、本队Ban、对手Ban及3类组合的独立有效分母（本队35局），状态COMPLETE，保留来源及缺失不补0说明。
- 分布图使用键盘Enter选择当前战队，成功显示“当前战队 · +187 · 35局有效”，不是仅hover可见。
- BP“查看更多（67）”成功展开真实剩余英雄、次数与比例。
- 原紧凑Header、姓名／国旗／年龄、Roster、Road To Worlds、英雄池未修改。

### 模拟器线上流程

1. System：使用RIOT GPR系统模型创建新会话，实际点击“模拟到冠军”，46场完成；本次HLE夺冠、决赛3–2。冠军阵容、夺冠之路及10万赛前参考显示正常。
2. System刷新：同一冠军、比分及46场结果恢复。点击“更新夺冠概率”后后台5,000次条件模拟完成，已确定冠军HLE显示100.0%，说明线上Worker计算正常。
3. Custom：在设置页将HLE从S移到A，预览与等级更新；创建会话后显示“自定义Tier List”，比赛使用自定义胜率，不显示系统GPR作为比赛输入。
4. Manual：手动选择第一场FUR 3–1 KC，再模拟本轮剩余比赛，计数为手动1／模拟1。
5. 推进：分阶段完成入围赛进入Swiss；模拟Swiss首轮、点击下一轮，分轮记录清晰；模拟Swiss阶段进入QF，淘汰赛对阵图正常。
6. Full Simulation：Custom“模拟到冠军”后46场完成，手动1／模拟45，GEN夺冠、决赛3–0。回看入围赛首轮仍为KC 1／FUR 3，来源“我的选择”。
7. Custom刷新：GEN冠军、3–0及手动1／模拟45保持一致；没有覆盖手动结果。

本轮没有重置用户原有数据或修改引擎，只操作新建的验收会话。浏览器临时视口覆盖已清除。

工具层面仍有个别浏览器连接／日志接口超时，已通过另一实际浏览器完成必要交互；未取得完整console日志，不能宣称逐条console日志均已审计。未观察到网站运行异常、页面5xx或需要回滚的故障。

范围外记录：Simulator Setup仍有“LCS与CBLOL种子尚未确认”的旧说明。实际本轮初始参赛队及数据沿用现有正式名单；本轮没有顺手修改该历史文案，建议后续独立清理。

## 8. 回滚及备份

官方Hobby允许回滚到紧邻上一Production。发布后重新读取生产列表，上一条确认为`dpl_6CTe6U541YXsukbjLpgbAEYx7BRo`，状态READY，URL为`https://worlds-2026-simulator-i3vzyr9lq-luis-cf15.vercel.app`。如出现已授权范围内的严重故障，核对该ID后使用Instant Rollback；不要回滚到未知版本。[官方回滚规则](https://vercel.com/docs/instant-rollback)

本轮所有自动页面检查正常、未发现泄漏或持续5xx，未触发回滚条件；保留当前发布，未连续部署修复版本。云端Ignored Build Step保持exit 0，防止Git构建覆盖。

本次实际代码和经扫描的Prebuilt产物另存仓库外私人备份，未包含认证输入；候选与原始研究数据仍保留原私人位置。没有推送Commit／Tag或改写历史。

## 9. 当前决策与停止点

|项目|当前结论|
|---|---|
|GIT AUTO DEPLOY|DISABLED（云端全部Git构建取消；Git连接及取消记录保留）|
|PRODUCTION|PASS（已部署READY、正式域名、14核心页及114统计页正常）|
|STATISTICS|PASS（线上19队95人与批准候选一致，英雄池不变）|
|SIMULATOR|PASS（System及Custom完整赛事、Manual保留、分轮／分阶段推进、条件Monte Carlo及刷新恢复实测通过）|
|SECURITY|PASS（本地产物＋已检查公网HTML／RSC／JS／路径范围）|

**P3-C.2-B完成。**解锁后剩余验收已补齐；沿用本次唯一Production Deployment，不需要再次部署。产品代码、统计数据及发布Tag不变；只更新本报告。停止后续开发与发布。
