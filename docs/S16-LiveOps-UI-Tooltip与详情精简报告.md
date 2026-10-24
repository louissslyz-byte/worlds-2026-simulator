# S16-LiveOps-UI — Tooltip与节点详情精简

2026-10-24 · **LOCAL COMPLETE — NOT PUSHED / NOT DEPLOYED**

## 1. 版本与范围

- 起始HEAD：`dea84a744e46386dd732a8faec6aa82fea281fa7`，起始分支`feat/s16-liveops-01-swiss-r1`；已包含U2、Swiss R1正式增量及三节点历史。
- 本轮独立分支：`feat/s16-liveops-ui-tooltip`。
- 最终产品提交：`2779b5c`；本报告另作本地文档提交，最终报告HEAD以该分支`git log -1`为准。
- 起始已跟踪工作区干净。未跟踪旧报告、研究脚本、AGENTS/CLAUDE均保留，未纳入提交。
- 只改变Presentation + Interaction。没有运行新的正式100,000次计算，没有改动赛事、模型、概率或部署配置。

## 2. 修改文件

| 文件 | 用途 |
|---|---|
| components/live/live-tournament.tsx | 共享提示、每事件命中点、键盘与精简详情 |
| components/live/chart-interaction.ts | 展示精度、最近点与边界定位纯函数 |
| components/live/live.module.css | 轻量提示及双列详情排版 |
| tests/live-chart-interaction.mjs | 真实详情、精度、重叠点、边界与未来节点验证 |
| tests/data-presentation.mjs | 每事件独立键盘目标数量；保留坐标/概率/模型保护断言 |
| tests/live-update-http.mjs | 区分171个真实点与171个透明交互点 |
| tests/run.mjs | 纳入新专项测试 |
| 本报告 | 交付记录 |

## 3. Tooltip交互

- 鼠标靠近真实点14个屏幕像素内，按屏幕坐标选择最近点；不再悬停整列就展开面板。
- 每个事件/历史节点均有独立透明圆形命中点与Tab入口。19队×3事件×3节点，共171个键盘入口；原57条曲线、171个真实点及坐标不变。
- 完全重叠时鼠标按正式事件顺序稳定选择；Tab可独立访问全部重叠事件。点击重叠位置展开同一历史节点的三个事件，不丢数据。
- 全页仅一个提示，通过React Portal挂在body，固定定位，不受SVG或图表横向滚动容器裁切；pointer-events:none，不抢点击、不改变页面尺寸。
- 鼠标坐标偏移16px；根据实际提示宽高在右边缘向左、下边缘向上翻转，并保留8px边距。
- 内容只有节点名称、单个事件和精确概率；固定三位百分数，与原节点精度一致：`0.000%`、`0.001%`、`100.000%`。
- 指针离开/移至非命中区关闭鼠标提示；键盘提示跟随焦点，自动滚动不抢走焦点提示。Escape关闭。切换筛选关闭提示。
- 浏览器实际验证了不同卡片跳转、54个代表点、移开关闭、Enter/Space入口及Escape/关闭按钮的焦点恢复。触摸不依赖hover，仍用点击详情。

## 4. 精简详情

共享`NodeProbabilityDetail`只保留一个节点名称、三个事件及精确概率、可访问的×关闭按钮。

删除的仅为显示内容：日期/北京时间、Snapshot ID、整数计数、分母与解释性小字。原始字段、整数计数、历史来源和校验能力全部保留。全局“关于概率”中的样本零/确定淘汰说明也保留。

同一节点重复点击/按键可收起，换节点可更新；关闭及Escape后恢复原触发点焦点，并清除提示。各队独立详情状态不串数据。320px详情实测宽296px，三行百分数均在边界内；不保留原多余高度。

未来节点由现有nodes/points映射自动生成。测试以仅内存中的第四节点验证结构，不写入任何虚构正式快照。

## 5. 数据与模型保护

147个受保护文件（lib、app、Team Profile、Tournament组件及public）相对起始HEAD逐字节完全相同。没有改动System/Custom会话、Rating、R1规则、统计、英雄池或数据schema。

| 保护输入 | 复验值 |
|---|---|
| Rating输入 | `50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb` |
| A1事实 | `e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b` |
| PRE计数 | `04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd` |
| POST计数 | `5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509` |
| Swiss R1事实增量 | `6af05985c917676b74d5844a70a8b6c270a10c877c36753dc923acd30edc5bb4` |
| Swiss R1计数 | `b0ee80de2d41e2328e36035a5a315de4c99a3d711b723fc1cc4e7d0b30f31511` |

三份已归档100k结果只读取校验，没有重算。冻结模型仍为gpr-prob-v1.1。

## 6. 测试与浏览器验收

**最终Prebuilt，而非仅开发页面：**

| 检查 | 结果 |
|---|---|
| ESLint / TypeScript | PASS |
| 完整现有测试＋新专项测试 | PASS |
| A1 / A2 / Swiss R1只读校验 | PASS |
| 全57个真实节点详情SSR内容反例检查 | PASS：仅名称、三事件精确概率，无日期/ID/计数等 |
| 3/4节点结构、0/极小/100%、重叠与最近点、四宽度边界 | PASS |
| HLE、GEN、BLG、LOS、C9、FUR所有3节点×3事件 | 54项实际键盘提示全部与真实点标签一致 |
| 鼠标三事件提示 | PASS：实际指针移动，不点击展开详情 |
| 右/下屏幕边界翻转 | PASS：390px实际指针验证 |
| Enter、重复展开/收起、Escape、关闭按钮与焦点恢复 | PASS |
| 1440 / 768 / 390 / 320 | PASS：桌面浏览器模拟视口，无页面级横向溢出 |
| 320px极小概率 | PASS：LOS POST冠军0.001%，未变成0 |
| 筛选、Swiss比赛列表 | PASS：LEC3队/ALL19队，R1/R2共16场 |
| Live最终HTTP/RSC | PASS：17请求、精确源码投影、22场事实/19队/57曲线/171真实点 |
| 19队95人统计HTTP/RSC | PASS：122请求、批准聚合数据精确一致 |
| 原Champion Pool / Roster / Road | PASS：19队95人1302条英雄行 |
| System/Custom、手动结果、会话等 | 现有可执行回归PASS；相关业务源码完全未改 |

浏览器为桌面受控本地预览，不宣称实体手机或线上生产验收。鼠标提示以真实指针移动（浏览器拖移至点位后松开）检查；键盘逐点检查独立记录。没有用脚本伪造概率或更改页面状态。

## 7. 新本地发布候选

- Node22.23.3、pnpm9.15.9、Next16.3.4、Vercel CLI64.2.0。
- 复用批准的项目外最小聚合候选，886093字节，SHA `c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`；没有读取完整P2-C数据包。
- 最终源码2779b5c，真实`build --prod --standalone`成功；没有执行deploy。
- 新产物树SHA：**`04513d8f092bb64a53822555bf9ace53106a2383dcdd62f70bdddd529becf446`**。
- 579文件、59内部链接，0 source map、0外部符号链接，私有/凭据命中0；统计资源位于服务端函数且Checksum Gate不变。
- 34个服务端内部文件仍有非个人的临时构建目录字符串；公开静态/HTML/RSC中命中0。没有将内部临时路径等同私人信息公网泄漏。
- 新产物已在仓库外另存prebuilt-v1；旧版LiveOps审计及产物副本未覆盖。前一阶段的任何产物SHA不能用于本轮发布。
- 初次受限网络构建因依赖域名解析失败；使用已批准的锁定工具和网络访问后成功。调试时既有Turbopack历史校验模块不兼容，改用与正式构建相同的Webpack检查，没有改动数据加载模块或项目配置。

## 8. 截图与证据索引

全部截图和完整日志均在仓库外独立的`s16-liveops-ui-2026-10-24`审阅目录，不提交。

| 文件 | 内容 |
|---|---|
| before-detail-1440.jpg | 原日期、Snapshot ID与计数密集面板 |
| hover-swiss-1440.jpg | 正赛100%提示与三节点图 |
| hover-knockout-1440.jpg | 八强提示 |
| hover-champion-1440.jpg | 冠军提示 |
| detail-1440.jpg | 精简后桌面详情 |
| detail-768.jpg | 768px最终详情 |
| hover-390.jpg | 390px最终指针提示 |
| hover-edge-390.jpg / hover-bottom-390.jpg | 右/下边缘翻转 |
| detail-390.jpg / detail-320.jpg | 最终窄屏点击等效详情 |
| focus-tiny-320.jpg / detail-tiny-320.jpg | 320px的0.001%提示与详情 |

`focus-validation-final.json`、`responsive-final.json`、`integrity.json`、`prebuilt-final-manifest.json`和HTTP/回归日志保留在同一私有证据目录。

## 9. 结论与停止

**UI / DATA INTEGRITY / REGRESSION / PREBUILT SECURITY：PASS。**

本地代码、截图、测试及新候选已完成。未发现未解决的阻断交互问题。实体手机/生产环境未测；本轮不推送、不部署、不生成Preview。后续上线需要用户独立授权，并复验本次新产物SHA和运行参数，不能使用旧冻结候选。
