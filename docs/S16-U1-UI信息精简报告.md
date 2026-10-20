# S16-U1 — UI信息精简报告

日期：2026-10-20（北京时间）。**LOCAL COMPLETE · PRODUCTION NOT UPDATED**。

## 1. 结论

|验收项|结果|依据|
|---|---|---|
|INFORMATION HIERARCHY|PASS|核心数据/操作常驻，重复解释集中折叠，重要状态保留|
|INTERACTION & ACCESSIBILITY|PASS|原生details/summary，实际点击及Enter展开/关闭，明确可访问名称与焦点|
|RESPONSIVE DESIGN|PASS|六个主要页面×1440/768/390/320实测无水平溢出；窄屏展开正常|
|MODEL & DATA INTEGRITY|PASS|全部已跟踪lib文件及Methodology与d2dd830逐字节一致|
|REGRESSION TESTS|PASS|专项、HTTP/RSC、19队95人/1302英雄行、System/Custom完整流程与恢复|
|READY FOR A4 REBUILD|PASS|可进入新的A4构建审计；不代表可直接部署或解除原NO-GO|

未推送、未部署、未创建公开Preview、未修改生产环境及Git自动部署。没有运行Monte Carlo；浏览器只执行单次完整赛事模拟，不是批量概率模拟。

## 2. Git基准及保护

- 起点：`feat/s16-a3-live-ui`，HEAD `d2dd830820265556ce9019d1700ffac8f493a33a`，包含R1/A1/A2/A3。
- 本轮分支：`feat/s16-u1-ui-simplification`。
- 最终产品代码提交：`bd869e6`（`ui: simplify explanations with accessible inline disclosures`）。本报告另作本地文档提交，不改变已验收产品代码。
- 原有S16-A0、S16-R1上线、S16-A4发布前报告均保持原文件，未覆盖或混入本轮产品提交。
- 稳定Tag及历史不变，未重置用户修改。

## 3. 文字分级与处理清单

|页面/模块|A类：常驻核心|B类：常驻状态|C类：折叠或删除重复|
|---|---|---|---|
|Rankings|排名、战队、GPR、种子、八强/夺冠概率、操作入口|GPR缺失/回退、数据覆盖与快照状态|排序依据、GPR与概率区别、来源及方法论集中到“数据与计算方法”；删除底部重复来源句|
|首页|冠军概率、实力榜、赛程、创建模拟|数据覆盖、时间与非官方页脚|移除Hero重复介绍与预测列表重复免责声明；完整说明保留在“关于预测”，GPR来源合并到同一入口|
|Simulator Setup|模式切换、排序/等级控制、实力预览、开始按钮|所选模型沿用提示；FUR GPR暂无/回退常驻|系统模型原理、模型日期版本、自定义概率次数折叠；没有待定种子时不显示空白假设面板|
|Simulator|阶段、战绩、模式、手动/模拟计数、锁定/错误/旧存档提示及所有按钮|当前查看阶段、待决定/不可推进原因、赛段日期/北京时间|详细时区和来源转入“赛程说明”；未定种子字符串为空时不输出空标签|
|Team统计|指标、数值、图例、真实分布、基准差值|PARTIAL/UNAVAILABLE、字段缺失、小样本及独立BP分母|PLAYSTYLE解释转“对比说明”；BP比例/Fearless说明合并进已有“样本量”|
|Player统计|原紧凑Header、各位置指标/图表、英雄池|缺失、PARTIAL、小样本|已有定义/样本入口足够，本轮不强行改动|
|Live|19队、三线/图例、数值、pp、筛选、阶段与比分|截止时间、冻结历史快照、人工非实时、未知时间/对阵/淘汰|模型、100k、条件化、抽样误差与局限合并“关于概率”；来源核查时间移入已有来源折叠区|
|Methodology|完整正文、来源、公式|原有模型局限及版本信息|不折叠正文，不修改该页面|

没有删除唯一的数据来源或关键模型解释；合并的内容仍可点击访问。合法性/准确性相关的全站非官方页脚及冠军模拟免责声明保留。

## 4. 共用说明交互

新增轻量`InfoDisclosure`，复用项目已有的原生details/summary模式，未引入Popover、图表库或新依赖。

- 默认关闭、集中于模块，一处入口承载相关短说明。
- 中性小字、44px最小点击高度、明确aria-label、可见键盘焦点。
- 展开状态由浏览器原生无障碍语义提供，Enter/Space切换；无需自制aria-expanded状态同步。
- 内容内联展开，有边界和自动换行，不是浮层，不遮挡按钮，不依赖hover。
- 原有Team统计的受控“定义/样本量”、来源details及小样本说明继续使用，不重写其交互。

## 5. 各页面实现

### Rankings

标题下不再默认铺设说明段落。`ⓘ 数据与计算方法`保留Riot来源、GPR实力输入、本站Monte Carlo、非Riot官方预测、快照/模拟次数及完整Methodology链接。表格、移动端队伍排列与概率完全不变。

### 首页

Hero直接进入赛事模拟器标题和核心内容。冠军概率区统一提供`ⓘ 关于预测`，替代两个重复描述；保留CTA短操作提示、模拟次数、数据状态和赛程来源。没有大幅调整布局或导航。

### Simulator

System/Custom按钮名称与流程不变。Setup简介精简为选择模型并沿用本局选择；System模型解释默认折叠。**FUR GPR暂无、使用回退模型仍直接可见**，没有藏进说明。模型信息卡取消跟随右侧预览自动拉高，避免折叠后出现大片空白。

未定种子面板仅在现有数据确实存在null种子时显示，原选择控件及操作代码保留；当前全部种子已确认时不再显示过期的空假设面板。本局假设字符串为空时也不显示空标签。这是展示条件调整，未改变种子或初始化。

模拟页仅折叠时区/官方赛程来源。模式、手动反馈、错误、旧规则兼容提示、待决定计数和推进按钮全部常驻。

### Team/Player Profile

Team PLAYSTYLE增加单一`ⓘ 对比说明`。BP比例定义和Fearless解释移入已有模块级样本量说明。低场次组合警示和星号仍常驻，独立缺失字段提示仍存在。8项指标、默认4项PLAYSTYLE、展开、图表、排序、样本量/分母和英雄池均未变。

Player原有定义/样本入口已经满足按需解释，因此没有改动Player Header、位置网格、英雄池或资料来源页面。

### Live

顶部仍直接显示截止时间与“人工维护 · 非实时更新”。来源核查时间与历史边界合入原来源details。概率区长说明合并为`ⓘ 关于概率`，完整保留固定实力、10万次、POST条件、无Rating调整、误差及局限。原图例、pp单位、57条曲线、19队及点位交互原样保留。

## 6. 实际浏览器验收

使用最终本机Next生产构建，不是仅静态代码审查。桌面浏览器模拟移动宽度，未宣称实体手机/屏幕阅读器设备测试。

检查页面：`/`、`/rankings`、`/simulator/new`、`/teams/gen`、`/teams/gen/chovy`、`/live`。

|宽度|六页面结果|重点交互|
|---|---|---|
|1440|document宽度全部1440|Rankings默认关闭；Enter展开/关闭；来源与Methodology链接存在|
|768|document宽度全部768|Live关于概率键盘展开；截止/非实时仍常驻|
|390|document宽度全部390|点击Live说明开/关；Swiss8场均显示时间待核实|
|320|document宽度全部320|Rankings长说明不越界；GEN对比说明与GD@15样本量可展开；PARTIAL仍可见|

最终Setup额外复核：FUR缺失提示常驻、空种子面板不存在、说明默认收起、开始按钮存在；Custom仍有19个等级控件。Live最终仍为19队57线，截止与非实时均可见。临时浏览器尺寸覆盖已清除。

截图保存在仓库外审阅目录，没有提交Git。

## 7. 原Simulator可执行回归

在新本机预览端口建立验收会话，不接触生产用户存档：

- Custom：HLE从S移A，手动FUR3–1KC，模拟到冠军。46场、手动1/模拟45；LYON3–2GEN夺冠。刷新恢复同一结果；回看首轮仍FUR3–1KC、“我的选择”。
- System：手动MVK3–1，模拟到冠军，GEN3–2AL；刷新后46场、手动1/模拟45、同一冠军比分恢复。赛程说明可键盘展开，系统模式保持常驻。
- 没有点击计算/更新夺冠概率，未重新运行Monte Carlo。条件MC、Worker及R1规则复用同源码既有验收证据，并通过源文件一致性证明未改。

额外AST测试逐项比较Simulator及Setup组件**除最终JSX返回外的全部语句**，包括状态、初始化、move/start/odds、pick/recalc/reset等回调，与d2dd830保持一致；没有通过UI改动改变存储或模型行为。

## 8. 自动化与生产构建

本轮通过：

- ESLint、TypeScript、Git diff格式检查。
- 新`tests/ui-information.mjs`：默认收起、可访问名称、说明/来源保留、19条Rankings、lib/Methodology逐字节保护及Simulator AST保护。
- `tests/live-ui.mjs`：19队57线、实际两节点、未来节点渲染、数值格式、缺失/损坏快照拒绝。
- Team Profile身份与95人检查、统计呈现专项。
- A1 Live事实测试、A2历史归档测试及两个只读验证命令。
- GoL隔离与本地Prebuilt门禁专项。
- 本地HTTP/RSC Live检查；Team统计122请求；19队95人、1302英雄行逐项校验。
- Node22.23.3 / Next16.3.4生产构建，批准最小聚合候选复用，未读取完整P2-C包。

新测试已注册到`tests/run.mjs`。本轮使用上述定向套件及既有同源码回归证据，**未运行会启动Monte Carlo的整套入口**，避免违背用户“不重新运行Monte Carlo”。

## 9. 模型与数据不变证据

测试对所有Git已跟踪`lib/`文件及`app/methodology/`与d2dd830逐字节比较：全部一致。包括GPR、Rating、规则、随机数、Monte Carlo、Session结构、Team/Player资料、统计、A1/A2及英雄池。

|文件/数据|SHA-256|
|---|---|
|原赛前概率|`8ce8f63929caca68eff760377e16729df419f20a31c05f103c7e991849baad78`|
|Champion Pool|`4862aa1a8eecbcf99b520e5debfa3c44067e964bd6077a78514fcc5130b6175f`|
|A1事实|`e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b`|
|PRE计数|`04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd`|
|POST计数|`5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509`|

本地构建/public扫描183文件，公开HTML/RSC/客户端未发现私人路径、原始研究文件或私钥。普通Next服务端内部引用清单仍有框架生成的构建路径，与A3/A4已记录行为一致；不等同公开泄漏，也不等于新版Prebuilt通过完整产物审计。

## 10. 修改文件

- `app/page.tsx`
- `app/rankings/page.tsx`
- `app/simulator/new/page.tsx`
- `app/simulator/page.tsx`
- `components/live/live-tournament.tsx`
- `components/team-profile/statistics.tsx`
- `components/ui/info-disclosure.tsx`（新增）
- `components/ui/info-disclosure.module.css`（新增）
- `tests/ui-information.mjs`（新增）
- `tests/run.mjs`
- 本报告。

没有修改导航、设计变量、断点体系、Methodology正文、图表实现或任何数据文件。

## 11. 尚存事项及与A4合并发布

- **没有生成新版Vercel Prebuilt，也没有做任何部署。** Next构建通过不能冒充Vercel产物审计通过。
- A4历史候选及冻结备份保持原树SHA：`b66c8606cd80cc03970468defc7d29fe90f7962b164e8c63e8e5e91b9fbd4bf7`。备份全部570文件重新逐项核验未变。
- 该候选属于U1之前的源码，不能用于发布本轮UI；保留作历史审计及回溯。
- A4的Production HTTPS/运行参数核查NO-GO未解除，本轮没有重做公网访问或改变平台设置。
- 下一步必须从包含U1的最终代码重新执行：Prebuilt生成 → 完整隐私审计 → 功能/响应式回归 → Production与回滚核查 → GO/NO-GO → 用户明确部署批准。

本轮到此停止，不推进Swiss数据、不重算概率、不推送、不部署。
