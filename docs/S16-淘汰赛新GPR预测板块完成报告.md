# 第三板块：八强新GPR夺冠预测

LOCAL COMPLETE / PRODUCTION NOT UPDATED。基准99293e1，所有既有未跟踪研究文件保留。

新增03 / KNOCKOUT FORECAST，只展示最终八强的夺冠概率，复用原卡片、统一0–100%纵轴、金色实线/实心圆、精确Tooltip、简洁详情、键盘操作及独立赛区筛选。抽签前为新基准，不标作赛前；第三板块的DOM ID与Tooltip键独立。原19队57线及全部旧节点数值不变。

新GPR来源：https://lolesports.com/en-US/gpr/2026/current ，2026-11-01核查。当前官网版本日期2026-10-31，原标注10/31/26, 5:00 AM时区未确认；该版仍带R5前战绩，未声称已纳入R5。用户授权使用此最新可用版本，板块可见标注日期，限制说明保留在ⓘ内。

独立冻结strength.json，19队Rating由新GPR通过原GprProbabilityModel转换。参数0.85、400及reference不变，规则不变。克隆原官方条件Session后只替换ratingSnapshot/强度版本，未完成QF调用原makeMatch重建胜率。抽签前路径随机合法签表，抽签后固定官方四场与半区；均复用原runMonteCarloFromState，不新建概率算法。

两次各先128路径验证，随后正式100000有效、0失败。19队五事件整数计数完整，阶段合计1600000/800000/400000/200000/100000；八强之外后续事件为0。原始模型、GPR/Rating、事实/概率归档、模拟器、用户Session、Team/Player与Champion Pool未修改。

新板块独立index、强度/文件/计数/事实SHA，节点绑定原板块legacySnapshotId。客户端只接收必要展示投影，不接收strength完整档案或生成源码指纹。最新进度必须与第二板块一致，单边更新会导致验证/Next构建失败。未来维护仍需追加同事实下两套各100K产物并登记原始快照路径，未伪装实现未知赛事的自动导入。

命令：pnpm live:knockout:generate <新候选目录>初始化两个节点，拒绝已有目录；pnpm live:parallel:validate只读校验同步和完整性。后续不得用不断变化的最新GPR覆盖第三板块冻结输入，必须保留历史。Daily Runbook已加入两板块并行工作流。

完整tests/run.mjs、新专项反例/状态Hash复建/128路径复现/旧输入隔离/同步拒绝测试通过；全站lint、typecheck通过。1440/768/390/320均19旧卡+8新卡、57旧线+8新线、无重复DOM ID与页面溢出。实测新GEN Focus精确提示42.311%、点击单事件详情、Escape、独立LCK筛选3队。鼠标近点逻辑复用原真实坐标算法及测试，本轮额外实测键盘等效提示与点击；未测试实体手机。

有效截图位于仓库外knockout-forecast-review/forecast-section-390.png、forecast-open-detail-390.png。部分早期截图因视口切换滚动仍停在原板块，不作为新板块视觉证据。

最终完整Prebuilt/Next生产构建和隐私审计通过；最终HTTP/RSC23请求与新8队8线检查通过，额外确认不传完整strength、Rating输入SHA、生成源码指纹或本机路径。19队95人统计122请求通过（最终仅变更可见版本标签后未重复全量，但同批准资源经过最终产物审计）。

生成器记录计算时的基准HEAD与脚本SHA；新文件在最终本地提交保存，不声称旧HEAD已含新生成器。所有开发及计算仅本地，没有Push、Preview、Production部署或云端设置修改。

DATA / 2×100K / MODEL ISOLATION / UI / PARALLEL VALIDATION / REGRESSION / PREBUILT SECURITY：PASS。

Rating SHA: 3c017959c6cf3b13431f0978126494b70716872afc9dc8292dfb4236d034b2f6

强度版本: riot-gpr-2026-10-31-knockout-v1

BEFORE-DRAW: 100000有效 / 0失败 / seed 20261111 / 50510ms / peak RSS 169476096 bytes / count SHA 2749c0b86734cb0eb4d6eaef359e017c2bb1420754af0fd7c3d7192c4bfa28e7

AFTER-DRAW: 100000有效 / 0失败 / seed 20261112 / 43236ms / peak RSS 169476096 bytes / count SHA bc8be86f1cc232d90bcd1ab60c5147063215414f56bd7d545180d95f18912201

|队伍|新GPR|抽签前冠军计数|抽签前%|抽签后冠军计数|抽签后%|变化pp|
|---|---:|---:|---:|---:|---:|---:|
|BLG|1492|15364|15.364|15114|15.114|-0.250|
|DK|1459|10559|10.559|8121|8.121|-2.438|
|GEN|1559|38566|38.566|42311|42.311|3.745|
|IG|1392|3176|3.176|3376|3.376|0.200|
|KC|1415|4512|4.512|3775|3.775|-0.737|
|LYON|1435|6215|6.215|5665|5.665|-0.550|
|T1|1495|17826|17.826|17343|17.343|-0.483|
|TES|1402|3782|3.782|4295|4.295|0.513|

最终Prebuilt: 699文件 / 59内部链接 / 私人凭据命中0。树SHA: 363591089829637888732b9ea59404e2a83aec1c98f91180aece07d60dd9290a。批准统计聚合SHA c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2。
