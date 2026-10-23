# S16-M0-FINAL — 模型研究结项与冻结决策

决策日期：2026-10-23（Asia/Shanghai）。决策来源：用户正式指令。

**M0 RESEARCH：CLOSED。停止参数优化；保留固定模型与每日LiveOps。**

本文是M0后续行动的最新决策，优先于M0/D1/D2/D3中“下一步研究、前瞻扩展或D4候选”的历史建议。旧报告、代码及数据原样保留，不改写其当时结论；那些建议已被用户后续决策取代，不是待自动执行的任务。

## 1. 研究起点与成果

最初目标是在保护生产模型的前提下，检查历史数据是否支持改善胜率预测。研究始终独立于网站、Simulator、Team Profile、正式概率和部署。

|阶段|实际成果|限制|
|---|---|---|
|M0初步审计|固定现有模型；9场BO5及13局试评分，保存准入/排除与复现证据|小样本，不足以拟合或独立验证|
|D1|正常官方历史GPR页面解析，去重1708点、58队；56队/797局完成匹配|计算时间不是历史公开时间；缺失的日期不插值|
|D2|797局、六赛区；48h主分析，0/24h敏感性；18场明确BO系列赛|所有样本是条件性回溯，月份窗口已经被观察|
|D3|LCK153局诊断；补齐62场BO证据，完整系列赛扩到80场；保留前瞻存储工具|没有获得严格历史as-of认证，没有拟合参数|

正式结论：**现有GPR模型具有一定历史预测信息，可作为固定实力假设下的赛事模拟基础，但其真实概率校准和未来泛化能力尚未获得充分独立验证。**

## 2. 已支持与未支持的能力

D2的797局（56队、六赛区）48h主分析：准确率61.73%、Brier0.229281、自然对数Log Loss0.650531。固定50/50分别为50%、0.25、0.693147。整体损失较低表明有预测信息，不证明概率已严格校准，更不保证未来世界赛会有相同准确率。

D3原18场+新补证62场，共80场：准确率67.50%、Brier0.205405、Log Loss0.593900。补证扩大了完整系列赛评价范围，不是新盲测，也不能混合地图和系列赛的准确率。

LCK153局未发现身份、胜负、GPR选点错误；弱表现主要在常规赛，部分大差距冷门贡献较多额外损失。对50/50的系列聚类损失差区间包含0，尚不能证明长期稳定的赛区独立偏差。因此不引入LCK或队伍专属参数。

**797局中严格认证赛前可获取GPR仍为0局。** 这表示证据不足，不表示这些分数当时没有公开。48h缓冲不能证明具体历史值当时已公开或从未修订。BO格式核验和GPR历史时效是两个独立维度。

版本、BP、选边、选手状态、临场决策、风格、阵容磨合与系列内相关性可能影响现实结果；本研究没有可靠地量化它们的独立影响。同队/选手重复出现使独立信息量小于表面样本量，国内比赛也不能直接验证跨赛区校准。

没有证明算法最优，没有证明模型完全无效，也没有取得可信的新参数收益。

## 3. 停止优化的正式决定

基于历史证据、样本独立性、过拟合风险和维护成本，用户决定M0到此结项。网站优先提供透明、可交互、可复现的世界赛模拟与赛事分析，而不以追求最精确博彩/结果预测为目标。

以下全部为 **CLOSED — NOT PURSUED BY USER DECISION**：

- M0-D3.5前瞻研究扩展。
- M0-D4参数校准。
- LCK赛区修正、战队专属参数。
- BO独立性假设参数拟合。
- GPR映射斜率搜索。
- 更复杂概率算法实验。

保留离线代码和前瞻记录工具，但不自动抓取历史数据、采集前瞻样本、训练、搜索、校准或建立研究定时任务。既有测试中的合成记录不是真实未来预测。只有用户明确重新启动，才另建研究版本和冻结协议。

## 4. 冻结的模型配置

|项目|冻结值|
|---|---|
|Model ID / probability model|`gpr-prob-v1.1`|
|Strength version|`riot-gpr-2026-09-29-v2`|
|Rating version|`system-gpr-prob-v1.1@riot-gpr-2026-09-29-v2`|
|GPR源快照日期|2026-09-29|
|GPR映射系数|0.85|
|Elo divisor|400|
|GPR / Rating参考锚|1350 / 1700|
|规则|`worlds-2026-official-draw-v2`|
|State version|`worlds-state-v2`|
|RNG / sampling|`lcg32-high-bucket-v1` / `canonical-uniform-legal-pairings-v1`|
|正式Rating输入|原有19队，FUR保留原回退1575|
|Rating input SHA-256|`50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb`|
|冻结系统语义SHA|`f41a8bd77d58a296929bc35b2badb7a0f3a089703e88bfefe273c6e0104d0826`|
|Engine source SHA|`9acb9dc2544401aad5ebeb9f1f36359064b100389952c211ccb3286932578191`|
|Strength source SHA|`0d5a1631ee412933003e3454bd599f95ad59b0b94c48673924206ea529e5bdb0`|
|Rules SHA|`1fb944c1931223d34663f5c6a964998e912bd972387b39dc32c78822fdfd6709`|

公式：Rating=1700+(GPR−1350)×0.85；`P(A胜)=1/(1+10^((RatingB−RatingA)/400))`。BO3/BO5仍使用原共享多数胜概率公式，假设各局同p且独立，不增加相关/选边/赛区系数。纯GPR两队主要识别k/divisor比率，不将它们误作两个独立调优维度。

19队完整原清单位于`lib/live/probability/snapshots/frozen-system-v1.json`。该文件及原`SystemRatingProvider`逐项一致；不从历史研究56队输入替换线上冻结19队，也不将研究中的FUR历史GPR写入生产。

模型冻结是使用政策，不是发布一个新的实力版本。本轮没有修改参数、模型版本、抽签/RNG、正式预计算概率或用户会话。

## 5. A1/A2与源码完整性基线

|对象|语义/计数SHA-256|
|---|---|
|A1官方事实输入|`e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b`|
|A2 PRE计数|`04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd`|
|A2 POST计数|`5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509`|
|A2 PRE文件|`d08592ed5f7cfaef241c3c8f9f6d1e91b4782c18f2166bc462ad1cc8c98c5124`|
|A2 POST文件|`56f2b4913d3c42b3c6f47546a2c596b40a76a58eeeb079647ca5fba568534052`|

两节点都保持100000次成功样本，PRE精确等于R1基线，POST包含已核验Play-In结果及当时已公布Swiss首轮签表；不是Rating更新。既有文件字节、输入哈希和计数均通过原校验器。本轮不重算、补写或修订任何节点。

关键源码/文件指纹：

|文件|SHA-256|
|---|---|
|`lib/sim/gprSnapshot.ts`|`c0c20a04d1de503acea6329b5f25bca4f513cc7efdbe8dc73dc3bcb5f18cd8b3`|
|`lib/sim/ratingConfig.ts`|`fc341c00ede365fe0392fcd24f1b8fea433ee5bbeabc3da3b975c535e6349c89`|
|`lib/sim/gprProbability.ts`|`acd3177c03cceee142203303f5b1575a5d1720e07facc7228ca9f6417c799b24`|
|`lib/sim/ratings.ts`|`be611ceb14bc6d21f4c7f5db47cb3a01345d58769aa0679fa3cd0243bd942be6`|
|`lib/sim/monteCarlo.ts`|`6a780be98b27d37f20964441e301a6057f13be93d0f685c59d8068f8938171bd`|
|`lib/sim/worlds2026.ts`|`395e9179722e806786a2b9867685a894ab8427b06eb8fa909b3611cf319a994f`|
|`lib/sim/precomputedOdds.json`|`8ce8f63929caca68eff760377e16729df419f20a31c05f103c7e991849baad78`|
|`lib/live/probability/snapshots/frozen-system-v1.json`|`f55e1d76f6f3fc6475daa7ff30a879fc0970553bd3a7e517345bdc68ace6ec83`|
|`lib/live/snapshots/post-play-in-v1.json`|`ab0ddfcbef89d046a89f2025c4d9fdd65e7a9f89e3ac6e4c1248e5a01f82f91e`|

完整源文件指纹继续复用已有frozen-system中的sourceFiles，不新增第二套模型锁。

## 6. 研究归档和协议

权威结果目录全部在仓库外的私有研究区。下列为目录标识，不是网站public路径，也不是允许公开的数据包。

|阶段|私有结果目录标识|output-manifest.json SHA-256|
|---|---|---|
|M0|`s16-m0-review/final-v1`|`166ef9f752815b0d99f9bf516fd79beeb0a016b95f4f693561aa2bd47373f5f1`|
|D1|`s16-m0-d1-review/accepted-v1`|`da8e03697032efd3db6eb5a4e7e33efcc15ec08be8a5b46d6587009b6f567dda`|
|D2|`s16-m0-d2-review/accepted-v1`|`42282fcd1bac89de12f7d17bfeb8b6808ab1db12b76c486e0210dadfd4a6fcc7`|
|D3|`s16-m0-d3-review/accepted-v2`|`ac82b559c38ee2bcf9609ee6956bc47fdcc55c5fe552c9b05b32bff3d213f623`|

- D1审阅程序：`c6f046a2d2f9ccf9ace1dfb38ba6df916b2494d74323d6dc99ad38e58c65977b`（`offline-model-evaluation/history-review/review.py`）
- D1准入README：`7be9b18a408f26fc842fdd1ba8b8737c1d243c8b1dc1ae1c75adf95129ede423`（`offline-model-evaluation/history-review/README.md`）
- D2协议：`3c78fc6f548aa5937791fa48cec231ae85606ef3fbdf473a25eb71cf1c91ea15`（`offline-model-evaluation/backtest/protocol.json`）
- D3协议：`b23ac6debc90f66edaef052e7dc838a820fb350d90f6644fe0f0e481df3cd2dc`（`offline-model-evaluation/diagnostics/protocol.json`）

M0与D1没有另设独立protocol.json：M0冻结输入在原frozen-model.json，D1准入规则由其README和固定审阅代码记录。不能虚构协议文件。M0冻结输入语义SHA为`3fea737615c5d608daf5f54d1a242195e75341f77b945090c82e978863a54f08`。

原始M0/D1/D2/D3报告保留当时建议，本文明确取代其默认继续研究的含义。D3正式结果使用accepted-v2，其他D3中间目录保留但不混用。

本轮另在仓库外`S16-M0-FINAL`本地归档区保存研究代码/报告备份及其SHA清单、结项核验记录；不是重新下载或复制OE/P2-C数据。已有私有结果目录继续原地保留，不删除、不上传。SHA证明所核对副本完整性，不证明第三方历史发布时间、不可修订性或数据许可证。

## 7. 网站模型定位与文案

网站定位：**透明、可交互、可复现的世界赛模拟与赛事分析平台**。

四类概念必须分开：Riot官方GPR、本站内部Rating、模拟输出的事件概率、真实官方赛果。概率是在固定实力假设、指定赛制和已知赛事条件下，通过Monte Carlo计算的估计，不是经过严格现实校准的真实概率，不保证结果。

只读检查Methodology后，现文案已明确启发式参数、本站计算、当前假设下的模拟频率及非确定预测，没有发现需要本轮紧急处理的最优/保证准确宣称。本轮不修改页面。

记录一项非阻断建议：未来若授权文案更新，可将“尚未获得可靠同期历史GPR、未声称完成Brier/Log Loss验证”进一步说明为“已做条件性回溯评估，尚未完成独立校准”，避免读者误以为从未有历史研究。不能改写为已经严格验证或校准。

## 8. 每日LiveOps保留，与优化研究隔离

**赛事事实可以更新，赛事状态可以推进，条件概率可以重新计算；冻结的实力模型不能隐式改变。** 关闭M0不关闭Live Tournament维护，也不等于授权本轮更新比赛。

未来单独LiveOps任务执行：

1. 人工核验官方赛果、来源、截止时点和已确认对阵，未确认对阵保持未知。
2. 新建独立事实版本与状态，保留旧A1/A2；不能把新Swiss结果塞进POST-PLAY-IN。
3. 调用现有模型锁，核对相同19队Rating SHA、参数、rules/RNG/source版本；不取最新GPR、不重新拟合。
4. 锁定已完成比赛，从真实进度模拟剩余赛事；既有比赛不重新抽胜负，已公布抽签固定。
5. 运行100000次**有效完整**模拟；异常停止，不丢样本或用简单概率加减替代。
6. 校验19队、16/8/4/2/1计数总和、概率嵌套、确定晋级/淘汰、官方条件保持与输入不变。
7. 保存新唯一快照ID、asOf、事实/状态/模型/输出哈希、固定种子、有效次数、源版本和失败数；只追加，修订显式关联旧版本。
8. 审阅差异与抽样误差，更新图表读取的新索引，做回归及发布审计，获得该轮用户授权后手动部署。

概率变化来自已知条件和剩余路径及有限抽样误差，不解释为队伍每天变强/变弱。用户System/Custom/Manual存档与官方数据隔离。

**当前实现边界**：已有`loadFrozenSystem`严格比较参数、19队Rating、模型/实力/规则版本及源文件SHA；`validateProbabilityHistory`绑定A1、模型及R1计数，拒绝历史内容变化。但A1校验器目前专用于POST-PLAY-IN，A2归档校验器固定PRE/POST两节点。不能把保留LiveOps误写为任意Swiss新节点已受支持；未来独立LiveOps阶段需验收向后兼容的节点/状态支持，复用同一冻结引擎，不另写抽签规则。本轮不实施。

现有只读检查入口：`pnpm live:validate`、`pnpm live:odds:validate`。生成命令与部署命令仅在单独任务授权后使用，本结项文档不授权运行它们。

## 9. 正确性维护与重新启动的条件

停止参数优化不意味着保留已证实功能错误。确定性的实现Bug、官方赛制差异、队伍身份/事实错误应另立问题，提供最小复现、影响范围和修复提案，经独立审计与用户明确授权后处理。涉及历史快照需保留旧版本、标记修订及说明影响，不能静默覆盖。不得将调整实力包装成数据Bug修复。

重启研究必须由用户明确提出，并具备新的独立证据或项目目标：可核验的赛前值与时间存档、足够跨时间/赛事的独立信息、清晰数据许可、未被用于选型的评价材料、预先冻结的研究协议/候选/评价标准。纯参数数量增加不是重启依据。新研究另建版本，旧结项与归档不改写；是否修改生产模型仍需独立批准。

## 10. 本轮核验与Git范围

本轮重新执行：M0/D1/D2/D3只读归档验收、A1事实校验、A2概率历史校验及既有网站回归；全部通过。验证的是已有输入/输出，不是新的回测实验或正式10万次模拟。模型文件与既有研究代码/报告逐字节保护；离线README仅添加关闭声明。

本轮没有运行参数实验、新数据获取、真实前瞻采样、新正式Monte Carlo、Next构建或Vercel Prebuilt，也没有生产HTTP验收。没有网站源码变动，不为文档结项重复构建；未运行的检查不标记PASS。

工作分支保持`feat/s16-u2-c-data-presentation`，进入本轮HEAD为`7734178fdefc4c0fb96a5cec6ecca3794a425b83`。初始暂存区为空、已跟踪文件无改动，存在此前研究代码及历史报告等未跟踪成果，全部保留。

仅允许将本FINAL文档、研究归档索引及离线README的关闭声明加入本轮本地文档提交。不会顺带提交D1–D3源码、原报告、UI、原始数据或其他未跟踪文件；本地备份保护这些未提交研究成果。最终提交SHA由提交后记录和Git日志给出，避免在本文自引用。没有Push、Tag覆盖、部署或历史重写。

## 11. 最终验收

|项目|状态|
|---|---|
|M0 RESEARCH|CLOSED|
|D1/D2/D3 ARCHIVE|VERIFIED（SHA/结构）；历史时效仍CONDITIONAL|
|MODEL VERSION|FROZEN：gpr-prob-v1.1|
|MODEL PARAMETERS|UNCHANGED|
|RATING INPUT|UNCHANGED|
|A1/A2 SNAPSHOTS|UNCHANGED|
|D3.5/D4 OPTIMIZATION|CANCELLED BY USER DECISION|
|DAILY LIVEOPS|RETAINED（独立任务、冻结模型）|
|WEBSITE CHANGES|NONE|
|PRODUCTION CHANGES|NONE|

**完成后停止。不得从本地保留的工具或D3旧建议自动继续研究。**
