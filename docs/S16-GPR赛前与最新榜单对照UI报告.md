# GPR赛前与最新榜单对照

本地完成，未部署、未推送。基准823ed58，保留所有未跟踪研究文件。

实力榜原表整合为：最新全球名次、队伍/赛区/种子、赛前GPR、最新GPR、分数变化、两类赛前模拟概率。默认按最新官方全球名次排序，并列不拆分；最新分数旁显示相对赛前全球名次升降。手机使用三列小面板对照两期分数及增减。正负号和箭头兼顾不依赖颜色读数。

新增lib/rankings/gpr-comparison.ts，仅由Rankings展示层使用；最新数据与lib/sim/gprSnapshot.ts冻结模型快照严格分开。基准仍为2026-09-29，最新官方表日期2026-10-31。查询日期2026-11-01，来源：https://lolesports.com/en-US/gpr/2026/current 。页面标注10/31/26, 5:00 AM，时区未确认，不转北京时间。此版官方表仍带R5前战绩，不冒充瑞士轮结束后的新实力数据。只保存19支参赛队伍。

FUR赛前没有官方GPR：赛前分数、分数变化及名次变化显示缺失，不用回退Rating冒充官方GPR。GEN/HLE最新并列#1，MKOI/C9并列#16；排名不是参赛队内重新编号。分数变化=最新减赛前，名次变化=赛前全球名次减最新全球名次，二者独立计算；例如TLAW分数不变但全球名次下降。

原有概率数值不变，并明确标注为“本站赛前模拟”。数据与计算方法折叠说明保留冻结模型与最新展示数据的区别、日期及来源。未运行新100K、未改变GPR模型输入/Rating/赛事引擎、任何Live快照、Team/Player统计或Champion Pool。

修改：app/rankings/page.tsx、rankings.module.css；新增lib/rankings/gpr-comparison.ts；更新tests/rankings-presentation.mjs和tests/ui-information.mjs的排序/展示断言，原概率精确值与缓存损坏拒绝检查保留。

验证：typecheck、相关ESLint、完整tests/run.mjs通过；真实桌面浏览器模拟1440/768/390/320宽度，19队完整，无页面级横向溢出。桌面表格允许区域内横向滚动，手机对照三列不裁切。截图位于仓库外gpr-comparison-review/rankings-1440.png、768.png、390.png、320.png（各文件名均带rankings-前缀），未测试实体手机。

完整本地Prebuilt/Next生产构建通过，691文件59内部链接扫描，私人数据/凭据命中0。树SHA：9db37b9ea667f9b8492296df3dc01783bdc7bf98da3816987f49bbb4612679e0。批准19队95人聚合SHA保持c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2。此候选包含此前尚未发布的R5前/后抽签快照，不是只含本页修改的独立生产版本；未来上线时需按完整候选复核，等待用户明确授权。
