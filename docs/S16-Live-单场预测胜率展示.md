# Live单场预测胜率展示

新增每场双方整场获胜概率，适用于已完成与待开赛的已知对阵。Play-In/Swiss使用原System赛前GPR及既有缺失GPR回退；Knockout使用第三预测板块冻结的2026-10-31实力档案，经归档文件SHA校验后读取。

复用gameProbability与seriesProbability，按BO1/3/5计算；不依据比分回填，不运行Monte Carlo，不修改赛果、快照、模型、Session。服务端仅向界面投影双方概率及简短来源，未知双方的TBD槽位不伪造数值。首页复用同一比赛卡片，也获得一致显示。

通过：43场专项测试（模型阶段选择、系列赛公式、双方互补、交换双方、比分无关、缺失身份拒绝）、完整tests/run.mjs、TypeScript、受影响文件ESLint。测试隔离边界只对两个明确的展示模块允许读取ratings，模拟引擎/Monte Carlo/存档导入禁令保留。

本地Webpack预览验证：Swiss33场66个百分数；淘汰赛4场8个百分数；320px无页面横向溢出，树状图维持内部滚动。Turbopack预览遇到项目既有动态URL模块解析限制，改用Webpack正常验证，未更改框架配置。未执行新的生产构建、推送或部署。

预览：http://127.0.0.1:3078/live
