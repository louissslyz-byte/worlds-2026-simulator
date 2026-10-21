# S16-U2-AB — 导航与布局精修报告

日期：2026-10-22。范围：本地 UI 精修、测试与截图；没有推送、部署、公开 Preview 或新的正式概率计算。

## 1. 版本与修改范围

- 起点：`feat/s16-u2-text-cleanup`，`7e96e33b9f14779f42ddd65ccbabb338051cfb7c`。U2-T 三个产品提交均在祖先链中。
- 本轮分支：`feat/s16-u2-ab-visual-refinement`。
- 最终产品版本：`f46656d62bcf3ae9b28301f3d02244b42f5ba0ba`；本报告随后独立提交。
- 原有五份未跟踪审计/上线报告完整保留，未混入本轮提交。Next 开发服务器另生成未跟踪的 `AGENTS.md`、`CLAUDE.md`，也保留且未纳入产品提交。没有删除用户文件或改写历史。

| 本地提交 | 内容 |
| --- | --- |
| `fa40a47` | A1：导航 CTA 的 Active/Hover/Focus 对比度与当前页标记 |
| `62e1e9c` | A2：移动端“更多”、完整七入口与键盘交互 |
| `0d59aaa` | B1：首页窄屏数字、CTA 节奏、System/Custom 开始区 |
| `0e62471` | B2：Simulator 操作分组、Rankings、Team Header/Roster |
| `f46656d` | 浏览器发现 375px 数字过近后的连续响应式字号修正 |

修改文件：

- `components/site-navigation.tsx`
- `components/live/navigation.module.css`
- `app/worlds-design.css`
- `app/simulator/new/page.tsx`
- `app/simulator/page.tsx`
- `app/rankings/page.tsx`
- `app/teams/[slug]/page.tsx`
- `components/team-profile/profile.module.css`
- 新增 `tests/navigation-loader.mjs`、`tests/navigation-layout.mjs`、`tests/layout-presentation.mjs`
- `tests/run.mjs`
- 本报告。

没有修改核心引擎、数据、模型、Worker、发布适配器、环境配置或 Session Schema。

## 2. A1：实际颜色与对比度

在真实浏览器中读取计算样式，按 WCAG 相对亮度公式计算：

| 状态 | 文字 / 背景 RGB | 对比度 |
| --- | --- | --- |
| 修改前 Active 常态 | `(0,107,158)` / `(0,122,181)` | **1.24:1** |
| 修改前 Hover + Focus 实测 | `(0,107,158)` / `(13,104,158)` | **1.03:1** |
| 修改后 Active 常态（无 Hover/Focus） | `(255,255,255)` / `(0,122,181)` | **4.72:1** |
| 修改后 Hover | `(255,255,255)` / `(0,107,158)` | **5.84:1** |
| 修改后独立键盘 Focus（无 Hover） | `(255,255,255)` / `(0,107,158)` | **5.84:1** |
| 普通导航文字 | `(83,105,119)` / 白色 | **5.75:1** |

只提高导航 CTA 样式优先级。普通当前页有蓝色下划线，CTA 当前页有白色内嵌底线，保留焦点外框，不单靠颜色标识。冠军深色内容区及普通业务按钮没有被统一换色。

## 3. A2：移动端七入口完整可达

手机直接显示：首页、LIVE TOURNAMENT、创建模拟；“更多”内提供实力榜、模拟器、战队档案、模型说明。桌面/平板保留原七项顺序。

| 宽度 | 原直接入口 | 新直接入口 | 新展开后总入口 |
| --- | ---: | ---: | ---: |
| 320px | 3（首页被隐藏） | 3（首页/Live/创建模拟） | **7** |
| 390px | 4 | 3（首页/Live/创建模拟） | **7** |
| 768px | 7 | 7 | 7，无手机菜单 |
| 1440px | 7 | 7 | 7，无手机菜单 |

320/390px 各实际点击全部七个目的地，核对 URL、当前页提示及路由切换后关闭。二级页收起时，“更多”下划线与可访问名称标明当前页面；展开后具体链接带 `aria-current=page`。

原生按钮有 `aria-expanded` / `aria-controls`。点击、Space、Enter 均可展开；Escape 关闭并把焦点送回“更多”；Tab 顺序为“更多 → 创建模拟 → 第一个二级链接”。焦点离开导航关闭，路由切换关闭。隐藏的响应式布局不进入可见链接和键盘顺序；SSR 中两套布局各有七链接是有意设计，不是屏幕上的重复导航。

手机导航目标至少 44px 高：“首页”和“更多”至少 44×44，Live 约 98×44，创建约 70×44。菜单为 Header 内两列，不是遮挡页面的浮层。

Header 实测：1440px 为 66px；768px 约 100px；手机约 98–98.5px；展开约 207–207.5px。Simulator Sticky 偏移分别为 66/100/209px。390px 滚动后展开菜单实测 Header 底部 207.5px、阶段导航顶部 209px，没有互相遮挡。

## 4. B1：首页与 Setup

### 首页

保持前三名并排、五队完整、排名/Logo/百分号/三列概率条及原始概率不变。只在 ≤390px 使用连续字号：320px 为 36px，375px 为 45px，390px 仍为 48px；桌面不变。

| 指标 | 宽度 | 修改前 | 修改后 |
| --- | ---: | ---: | ---: |
| 相邻前三名数字实际边界间距 | 320 | 8.95px | **13.80px** |
| 同上 | 390 | 6.63px | **6.63px（NO CHANGE）** |
| 同上 | 1440 | 147.37px | **147.37px（NO CHANGE）** |
| 正文创建 CTA 顶部 | 320 | y=910.43 | **y=867.93** |
| 同上 | 390 | y=935.88 | **y=889.88** |
| 同上 | 768 | y=871.27 | **y=829.77** |
| 同上 | 1440 | y=548.02 | **y=548.02（NO CHANGE）** |

补查 375px 时发现初稿 48px 数字间距仅 1.63px，修为连续字号后 **8.93px**；没有将这一中间版本冒充 U2-T 基线。未删除第四、第五名，没有新增重复 CTA，也不强行压进一屏。

### Setup

把原有唯一“开始模拟”按钮移动到模式选择旁/下方；同一个回调、同一条操作说明，不增加 Sticky 按钮。System 预览与说明顶部对齐，手机自然单列；Custom 完整 Tier 列表及移动控件保留。

| 宽度 | System 开始按钮 y：前 → 后 | Custom 开始按钮 y：前 → 后 |
| --- | --- | --- |
| 1440 | 754.43 → **254.20** | 2403.27 → **254.20** |
| 768 | 921.66 → **259.84** | 2976.99 → **259.84** |
| 390 | 914.78 → **279.20** | 3951.95 → **279.20** |
| 320 | 894.91 → **276.55** | 4135.55 → **276.55** |

没有变更 Tier 分值、默认队伍、排序/移动逻辑、开始回调或保存结构。模式按钮明确 `aria-pressed`。

## 5. B2：Simulator

当前轮次按钮为主要操作；整赛段与全赛事按钮为较轻的次级组，两个组有独立可访问名称。重置保留原确认机制，仅使用现有危险色与边框。入围赛/淘汰赛完整路径默认收起；当前轮次比赛仍展开，路径仍可查看。没有修改操作作用范围、锁定/手动结果或晋级条件。

以下为同一个未决定首轮会话、相同滚动位置的文档坐标，**首个可操作比赛指有手动比分入口的比赛，不是只读路径缩略卡**：

| 宽度 | Header 高度：前 → 后 | 阶段标题 y：前 → 后 | 当前操作区 y：前 → 后 | 首组操作按钮 y：前 → 后 | 首个可操作比赛 y：前 → 后 |
| --- | --- | --- | --- | --- | --- |
| 1440 | 66 → 66 | 533.94 → 523.94 | 434.39 → 430.39 | 450.66 → 446.66 | **1324.22 → 849.77** |
| 768 | 81.45 → 99.95 | 588.68 → 597.18 | 429.13 → 443.63 | 505.68 → 520.18 | **1753.85 → 912.66** |
| 390 | 100.50 → 98.50 | 721.22 → 679.42 | 507.67 → 469.88 | 584.22 → 546.42 | **2200.83 → 1015.95** |
| 320 | 94.50 → 98 | 715.22 → 678.92 | 501.67 → 469.38 | 578.22 → 545.92 | **2194.83 → 1015.45** |

768px 为完整七项导航增加少量 Header 高度是有意的；没有为了减少像素牺牲导航可读性。手机首个可编辑比赛仍可能在第一屏下沿之后，但不再被整张对阵路径推迟到约 2200px。BO、战绩、比分、模拟来源、我的选择、轮次状态、旧存档提示均保留。

## 6. Rankings 与 Team Profile

### Rankings

局部调整标题与状态区间距，不再次删除 U2-T 已整理文案。首队位置：1440px **464.74 → 416.74**，390px **447.50 → 413.50**，320px **439.34 → 410.84**。768px **451.88 → 450.18**，保留滚动提示所需空间，不追求强压高度。

768px 原表格已经是合法横向滚动，并非概率丢失。新增加可聚焦、带名称的滚动区域与平板提示。最终实测容器 732px、表格 790px；聚焦后两次 ArrowRight 到 `scrollLeft=58`，最右列右边界 **750px**，恰好等于容器右边界。表头和全部 19 行保持对应，无文档横向溢出。手机不增加新 KO/Seed 结构，本轮不开展 U2-C。

### Team Profile

仅 Team 详情使用局部作用域类，缩减 Header 非必要 Padding、模块间距及 Roster 内边距。保留 **Roster → Road to Worlds → Statistics**，Player 资料及统计图表没有重新设计。

| 指标 | 1440px：前 → 后 | 390px：前 → 后 |
| --- | --- | --- |
| Header 底部至首个 Roster 卡顶部 | 126.20 → **106.20px** | 99.84 → **95.84px** |
| Roster 顶部文档位置 | 505.79 → **453.79px** | 463.63 → **441.63px** |
| Roster 卡片区域总高度 | 133.95 → **109.95px** | 226.30 → **210.30px** |

另实际检查 TLAW 320px：长战队名、Josedeodo 等选手 ID、Logo、五个选手入口正常；卡片高约 104–105px；展开“阵容来源”宽 296px、内容滚动宽也为 296px，无裁切/横向溢出。登记/首发待核验提示、来源及日期完整保留。没有改阵容或晋级记录。

## 7. 浏览器与可访问性验收

最终产品代码对应的本地 Next 生产服务器，使用真实浏览器引擎模拟视口：

- 1440 / 768 / 390 / 320px：Home、Rankings、System Setup、Custom Setup、Simulator、GEN Team、Chovy Player、Live，共 32 个最终页面状态；每次断言实际 `innerWidth` 与目标一致，避免只修改名义尺寸。
- Champion：同一条 System 完整结果在四宽度检查；深色金色内容保持，导航仍清楚。
- 补查 375 / 430 / 700 / 701 / 1024 / 1050 / 1051px 的首页/导航断点。375px 修复后的最终证据另存；700px 手机菜单与 701px 七项布局切换正常，1050/1051px 双行与单行 Header 切换正常。
- 手机所有七路由实际访问；菜单点击、Space、Enter、Escape、焦点回归、Tab 顺序和路由关闭通过。
- 768px 表格键盘滚动、手机菜单展开与 Sticky 阶段导航间距通过。
- 没有发现最终检查页面的文档横向溢出；表格/Tier 局部横向内容可在自身区域访问。
- 原生来源说明可以展开；真实页面的说明文字及来源链接未隐藏或删除。

限制：这是桌面浏览器模拟视口和鼠标/键盘操作，不是实体手机触摸测试或完整屏幕阅读器认证。44px 目标为实际几何检查。

## 8. System / Custom 实际流程

均在本地专用会话完成，没有访问或清除 Production 存档。

| 流程 | 浏览器实测结果 |
| --- | --- |
| System | 手动选 **C9 3–1 KC** → 模拟本轮剩余 → 进入下一轮 → 模拟入围赛至 Swiss R1 → 模拟到冠军 **LYON**（决赛 3–0 GEN） |
| System 刷新 | 冠军区完整可见文本与刷新前逐字一致；返回入围赛首轮，手动 C9 3–1 KC 与“我的选择”保留 |
| Custom | 实际将 **HLE 移到 A** → 开始 → 手动 **KC 3–1 C9** → 本轮/下一轮/赛段推进至 Swiss R1 → 模拟到冠军 **BLG**（决赛 3–2 GEN） |
| Custom 刷新 | 冠军区完整文本相同；手动 KC 3–1 C9 保留；Swiss R1 所有比赛展示胜率数组与完成赛事前一致（包括 TES/HLE 39%/61%），Custom 模式保留 |

另有 AST 回归证明 Simulator 与 Setup 的组件状态、回调等最终返回 JSX 之前的语句未改，和既有 Session/Tier 测试共同约束原数据行为。只改变呈现及原生 details 的默认展开状态。

既知问题：本次 System 抽到 LYON 冠军，其 Champion Roster 没有显示，属于原已记录的五队冠军阵容资料缺口。本轮按范围限制未补数据；BLG 的冠军阵容、决赛、夺冠之路正常。没有用不同随机冠军截图冒充纯布局前后对照。

## 9. 信息、模型、数据与隐私完整性

- 全部 `lib/` 与 Methodology 共 **68 个受保护文件**对 U2-T 基线逐字节一致；额外测试约束 Worker、Next/Vercel/ignore 配置、Live 组件、Roster/Road 组件、Player 页面不变。
- 新的 HTTP 对照 **120 页**：保留 **536 个页面来源 URL**，**1302 条英雄池记录**完全相同。
- 最小批准聚合输入仍为 886093 字节，SHA-256：`c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`。只在仓库外使用；未复制到 public/Git，未读取完整 P2-C 或 OE/GoL 研究数据。
- 最终生产 HTTP 统计检查 **122 请求**：19队95人指标、RSC 与无 JSON 下载路径通过。英雄池检查：19队95人、1302英雄行、Roster/Road 正常。
- Live HTTP：19队57条线、两正式节点、HTML/RSC 与客户端资源检查通过。没有新概率节点。
- 公开构建资源扫描 **115 个文件**（静态资源、public、可公开预渲染 HTML/RSC）：私人路径、研究文件标记、完整私有包标记、私钥标记 **0 命中**。没有宣称普通 Next 内部构建 trace 中绝无机器生成路径；这些内部文件不等于公开页面。本轮未执行新版部署产物安全审计。
- Git 只纳入审阅后的具体 UI/测试/报告路径；无 CSV、私有 JSON、环境文件、Token 或本地截图新增到跟踪树。

保护值：

| 输入 | 不变的 SHA-256 |
| --- | --- |
| A1 事实 | `e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b` |
| A2 PRE 整数计数 | `04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd` |
| A2 POST 整数计数 | `5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509` |
| 冻结 Rating 输入 | `50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb` |
| 原预计算文件 | `8ce8f63929caca68eff760377e16729df419f20a31c05f103c7e991849baad78` |
| 原英雄池文件 | `4862aa1a8eecbcf99b520e5debfa3c44067e964bd6077a78514fcc5130b6175f` |

## 10. 最终验证结果与复现

最终产品 HEAD 上执行：

| 检查 | 结果 |
| --- | --- |
| ESLint / TypeScript / Git diff 格式 | PASS |
| 完整 `tests/run.mjs` | PASS：R1、System/Custom/Session、Worker、Live、统计安全与展示、U1/U2-T、新导航/布局测试 |
| 新导航 SSR 与可见浏览器交互 | PASS：七入口、嵌套路由 Active、原生状态、44px、CTA AA |
| 新布局测试 | PASS：五名概率、完整榜列、单一前置 Start、操作组、默认路径收起、受保护文件 |
| A1 / A2 只读 CLI | PASS：原事实/计数哈希，PRE 精确匹配 R1 |
| HTTP/RSC、120页前后来源、19队95人统计/英雄池 | PASS |
| 最终普通 Next 生产构建 | PASS：Node 22.23.3、Next 16.3.4、pnpm 9.15.9；全部既有路由及 `/live` 正常生成 |
| 最终浏览器四宽度及断点 | PASS，测试边界见第7节 |
| 公开资源与数据不变扫描 | PASS，范围见第9节 |

测试套件内包含既有小样本 Monte Carlo（例如 50/100/200 局场景）和抽签重复采样；这些只是回归测试，**没有运行新的正式100,000次模拟，没有写入任何新概率快照**。

构建使用既有 `scripts/build-production.mjs`，通过批准的项目外最小聚合输入及既有 release checksum gate。原有门禁、生产参数及 Vercel 配置没有修改。原旧 `.vercel/output` 另做只读保全检查，仍为 **570 文件、59 内部链接**，树 SHA 为 `6622b19d47d49d1a5c01dbecf44dc87a79bc5075e934f064552c161dd689afed`。这只证明旧产物没变，**不是本轮新 UI 的可发布产物**。未来上线必须从 U2 新源码重新生成并完整审计 Prebuilt。

本地复现命令：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm live:validate`、`pnpm live:odds:validate`；受控生产构建遵循现有 README 的外部最小候选输入与校验流程。HTTP 专项为 `tests/text-cleanup-http.mjs`、`tests/statistics-release-http.mjs`、`tests/gol-profile-http.mjs` 与既有 Live HTTP 校验入口。没有新增运行时计算接口。

## 11. 前后截图及本地预览

截图、几何测量、完整日志都在仓库外的 **s16-u2-ab-review** 证据目录，不加入提交。完整可点击索引为该目录的 `截图索引-LOCAL.md`。

| 内容 | 修改前 | 最终修改后 |
| --- | --- | --- |
| Home 320/390/1440 | `before-home-{width}.jpg` | `after-home-{width}.jpg` |
| Header 320/390/768/1440 | 对应 Home 截图顶部 | 对应 Home 截图顶部 |
| System/Custom Setup 390/1440 | `before-setup-system/custom-{width}.jpg` | `after-setup-system/custom-{width}.jpg` |
| Simulator 390/1440 | `before-simulator-{width}.jpg` | `after-simulator-{width}.jpg` |
| Rankings 390/768/1440 | `before-rankings-{width}.jpg` | `after-rankings-{width}.jpg` |
| Team 390/1440 | `before-team-{width}.jpg` | `after-team-{width}.jpg` |
| Player/Live 四宽度 | `before-player/live-{width}.jpg` | `after-player/live-{width}.jpg` |

额外最终截图：`after-more-open-320.jpg`、`after-more-open-390.jpg`、`after-nav-keyboard-1440.jpg`、`after-nav-focus-1440.jpg`、`after-rankings-right-column-768.jpg`、`after-sticky-menu-390.jpg`、`after-team-tlaw-source-320.jpg`、`after-home-375.jpg`、`after-home-430.jpg`、`after-champion-{width}.jpg`。开发中间证据以 a1/a2/b1/b2 命名，不代替最终 after 图。

前后主对照视口、数据、页面状态和滚动起点一致；Simulator 是同一初始 System 会话。Champion 仅展示本轮完整流程的最终状态，不提供不同冠军的伪前后对照。

本地最终生产预览：**http://127.0.0.1:3052/**。Production 没有更新；本轮没有进行远程写入或改动自动部署。既有 Production ID `dpl_66SjEVj8nKDggn6NLJwzjQ6Ag7T4` 仅作为用户提供的背景，本轮没有重新查询远端。

## 12. 结论与下一阶段

| 验收项 | 状态 | 证据 |
| --- | --- | --- |
| NAVIGATION CONTRAST | PASS | 实测常态4.72、Hover/独立键盘Focus5.84 |
| MOBILE NAVIGATION | PASS | 320/390各七路由、原生键盘与焦点、44px目标 |
| HOME RESPONSIVE | PASS | 320数字间距提高，375补查修正，390/桌面维持 |
| SETUP USABILITY | PASS | 唯一Start提前，System/Custom实际创建与Tier操作 |
| SIMULATOR USABILITY | PASS | 可操作比赛明显提前，分组清楚，手动/完整赛事/恢复通过 |
| RANKINGS & TEAM LAYOUT | PASS | 768最右列键盘可达，Header/Roster与长名称证据 |
| ACCESSIBILITY | PASS | 本轮范围内键盘、语义、颜色、目标与溢出通过；不是全站无障碍认证 |
| MODEL & DATA INTEGRITY | PASS | 字节对照、A1/A2/Rating/概率/英雄池哈希及HTTP |
| REGRESSION | PASS | 最终HEAD完整测试、生产构建、实际浏览器及HTTP |
| READY FOR U2-C | PASS | 可在用户审核后进入；本轮没有自动开始 |

U2-C 建议优先单独审阅 Rankings 手机字段需求，再评估 Live 卡片密度；不要把本轮导航与局部间距调整扩展成统计图重设计。五队冠军阵容缺口继续独立处理。实体手机触摸与屏幕阅读器测试可在后续发布验收补充。

**LOCAL COMPLETE — NOT PUSHED — NOT DEPLOYED。**
