# S16-A3 — Live Tournament UI 开发报告

## 1. 结论

**LOCAL COMPLETE · PRODUCTION NOT UPDATED**

| 验收项 | 结果 | 范围 |
|---|---|---|
| MATCHES UI READY | PASS | 六场真实Play-In、八场Swiss官方对阵、Knockout待定结构 |
| PROBABILITY UI READY | PASS | 19队、每队3条线、2个实际节点、筛选及精确文本 |
| SNAPSHOT INTEGRITY | PASS | A1/A2原文件未改；全部19队3事件的计数及概率逐项一致 |
| RESPONSIVE & ACCESSIBILITY | PASS | 实际浏览器1440/768/390/320；点击、键盘、筛选及溢出检查 |
| REGRESSION & SECURITY | PASS | 回归、哈希、隔离、生产HTTP/RSC、公开产物检查 |
| A4 DEPLOY READY | CONDITIONAL | Next生产构建通过；本轮未生成或部署新版Vercel Prebuilt，需A4另行执行完整产物审计 |

未推送、未部署、未创建公开Preview、未改云端配置。未运行新的正式10万次模拟。已有回归中小样本模拟及抽签采样测试照常执行。

## 2. 代码基准与保护

起点：`aeba866`，原分支`feat/s16-a2-probability-snapshots`。新本地分支：`feat/s16-a3-live-ui`。

包含R1、A1 `65026d7`、A2完整成果。既有生产及检查点Tag未改，未改写历史。原有两份未跟踪文件继续保留：

- `docs/S16-A0-Live-Tournament技术审计.md`
- `docs/S16-R1正式上线记录.md`

对`lib/sim`、`lib/live/probability`、`lib/live/snapshots`、`lib/team-profile`、`components/team-profile`全部已跟踪文件与起点逐字节比较：无改变。

## 3. 页面结构

新增`/live`，主导航新增`LIVE TOURNAMENT`。沿用现有字体、背景斜纹、蓝色强调、硬分割线与TeamLogo。未增加图表库或其他依赖。

顶部明确标注冻结历史快照、非实时、入围赛结束/Swiss尚未开始。截止时间来自A1：**2026-10-19 20:00 北京时间**；来源核查时间单独显示，不以系统当前时间替代。

### 01 / MATCHES & RESULTS

- 三阶段按钮使用`aria-pressed`；键盘及点击均可操作。
- Play-In按现有记录顺序展示胜者组首轮、胜者组决赛、败者组及最终资格赛。六场比分直接读取A1，不复制第二份比赛数据。
- 晋级/淘汰状态来自A1推导：KC晋级；C9/FUR/MVK淘汰。
- Swiss八场均为待开赛，不显示0–0或赢家。全部逐场时间保持null，显示“时间待核实”。赛段开幕单独显示10月24日01:00北京时间，并明确不是各场开始时间。
- Swiss后续轮次显示“待抽签”；KO仅展示QF/SF/Final待定，不引入任何模拟参赛队伍。
- Play-In未知时段保留赛事当地日期，已知时间明确为计划时间，未冒充实际开赛时间。
- 官方及交叉核查来源集中在原生details中，链接直接使用A1来源注册表URL。

### 02 / PROBABILITY EVOLUTION

每队独立一张轻量SVG图，共19张，每张恰好三条线：

- Swiss：蓝色实线/圆点。
- Knockout：绿色虚线/方点。
- Champion：克制金色点线/菱形。

统一0–100%纵轴，顶部/底部留出点位空间。重合曲线使用形状、线型和非遮挡文本共同辨识；极小夺冠概率保持原始纵轴比例，不夸大趋势。

默认最新夺冠概率降序，同值按Team ID稳定排序，淘汰队伍仍在ALL中。支持全部六赛区筛选。所有19队引用现有teamId、slug、logo与region；无第二套身份数据。

图表下方始终显示三项最新值、赛前值及变化pp；无需tooltip即可阅读。每个时间节点具有可聚焦/可点击的完整竖向目标，选择后在图内下方展开详情，避免悬浮内容超出手机边界。详情包含3位小数、原始次数/100,000及时间。Escape或“收起”关闭；Enter/Space可选择。

## 4. 数据、格式与扩展

实际数据来源：A2的概率索引和两个正式快照，未新建概率输入源。

| 节点 | Count SHA-256 |
|---|---|
| PRE | `04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd` |
| POST | `5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509` |

A1事实SHA：`e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b`。

全部19队3事件、两个节点的原始计数与概率逐项断言一致，包括KC54.915→100%、八强22.764→41.805%；T1八强69.982→74.103%；G2八强71.172→69.948%。这些值未硬编码进页面。

- 概率默认一位小数；精确0显示0%，非零且小于0.1%显示`<0.1%`。
- 差值用整数计数之差除以共同分母再乘100，单位pp。小于0.1pp使用三位自适应精度，例如LOS夺冠变化`−0.001 pp`，不会变成−0.0pp。
- 不把变化解释成Rating调整，不作显著性或校准承诺。顶部简述固定赛前GPR/Rating、R1规则、100,000次/节点、POST包含真实入围赛结果与真实R1抽签、有限抽样误差。
- 客户端以`nodes[]`及各队`points[]`构建横轴，不依赖两个固定概率字段。测试使用不保存的第三个合成节点，确认19图均自动新增点及标签。
- 当前A2归档Schema仍只批准两个正式节点；未来新增正式节点须先在数据阶段扩展并验收Schema/索引，不能绕过现有A2限制。本轮没有制造第三个事实或概率节点。

## 5. 服务端读取与生产构建

新增只读`readLiveView`/`loadLiveView`适配器，显式使用项目相对路径，解决离线校验器`import.meta.url`在Next打包后的资源定位差异。

读取流程：

1. A1文件SHA、事实SHA、Schema、时间边界及赛事结构验证。
2. A2索引Schema、冻结模型及概率文件SHA验证。
3. 逐一核对R1引擎/实力源文件与冻结指纹，核对生成器指纹及原赛前缓存SHA。
4. 复用现有`validateProbabilitySnapshot`，验证版本、起点、事实绑定、19队计数、事件总量与分母。
5. 验证索引时间顺序及PRE原始计数与R1缓存精确一致。
6. 仅投影页面所需身份、时间、赛果、3事件概率/次数，不发送完整冻结模型、源码指纹或模拟Session。

原A2文件及公式均未修改。适配器只验证/构造校验用起点，不执行Monte Carlo。现有正式构建包装器在Next构建前调用完整`validateProbabilityHistory()`，包含归档审计/比较CSV等离线检查。快照损坏或缺失会使构建失败，无旧缓存或虚构数据回退。

实际Next生产构建成功把`/live`预渲染为静态HTML/RSC；访问不触发模拟或重新读取私人数据。无需新API。显式`outputFileTracingIncludes['/live']`包含批准的A1/A2 JSON及验证指纹所需公开代码，检查Next trace存在正式POST资源，无OE/GoL研究/CSV/P2-C目录。

生产HTTP响应约110.6KB、独立RSC约22.1KB（含现有导航/资源引用，以未压缩字符长度计）。SVG复用React，无新增图表依赖。图表交互只处理当前点和筛选，不运行计算引擎。

本轮通过Next生产构建及本地HTTP/RSC，**未执行新版Vercel CLI Prebuilt构建**，不能等同云端或Prebuilt已验收。

## 6. 文件清单

新增：

- `app/live/page.tsx`：服务端页面、metadata。
- `components/live/live-tournament.tsx`：赛程、阶段/赛区选择、三曲线、可访问点详情。
- `components/live/live.module.css`：局部响应式视觉。
- `components/live/navigation.module.css`：新增导航的窄屏换行/入口可见性。
- `lib/live/view.ts`：最小页面投影、格式化、稳定筛选排序。
- `lib/live/view-server.ts`：只读Next资源定位及验证适配。
- `tests/live-ui.mjs`：A3数据/反例/格式/渲染/扩展测试。
- `tests/live-ui-loader.mjs`：仅单元测试的CSS与Next组件替身；实际Next行为由生产HTTP及浏览器验收。
- `scripts/validate-live-ui-http.mjs`：HTTP/RSC/资源及禁止路径验收。
- 本报告。

修改：

- `components/site-navigation.tsx`：新增入口；原链接及目标不变。
- `next.config.ts`：仅增加Live资源追踪。
- `scripts/build-production.mjs`：增加完整A2只读校验。
- `tests/run.mjs`：注册A3专项测试。

## 7. 实际浏览器与交互验收

使用本机Next生产服务，并非开发页面截图或静态mock。

| 宽度 | 实测结果 |
|---|---|
| 1440 | document宽度1440；19张图/57条线；桌面两列；阶段切换、LCK筛选4队、ALL恢复19队；Enter展开HLE POST的真实整数计数 |
| 768 | document宽度768；两列图各352px；详情不溢出 |
| 390 | document宽度390；单列；Live导航可见；LCP3队；点击MVK POST读到三个0/100,000及淘汰状态 |
| 320 | document宽度320；逐项检查main元素无右侧越界；CBLOL2队；LOS POST键盘详情显示0.001%=1/100,000 |

另验证：Swiss切换后8场、8个未知时间；Knockout3个TBD；详情文字及背景保持可读；不同点形/线型和固定纵轴已检查。浏览器截图保存在仓库外审阅目录，未纳入Git。

桌面鼠标点击/进入点区域、手机尺寸下点击、Enter键已实际操作；Space/Escape/Tab目标均有实现及语义。未用真实物理手机或独立屏幕阅读器做设备验收，不把桌面视口测试宣称为真机测试。

## 8. 测试与安全

通过：

- ESLint、TypeScript。
- 全部`tests/run.mjs`（含新A3、R1、Live A1/A2、System/Custom/Manual、旧会话、条件MC、预计算概率、19队95人）。
- `live:validate`、`live:odds:validate`。
- `statistics-presentation`、`gol-research-isolation`、`local-prebuilt`专项。
- Next16.3.4/Node22生产构建，复用原批准的最小统计发布候选，没有读取完整P2-C。
- 本地HTTP/RSC；原首页/实力榜/模型说明/模拟器/新建模拟/GEN及Chovy路由200；Live资源无404。
- 猜测的快照JSON、私有聚合文件、GoL逐局路径均404。
- 损坏/缺失快照反例拒绝；未来第三节点组件渲染；全部19队逐值映射。

保护哈希：

- 原`precomputedOdds.json`：`8ce8f63929caca68eff760377e16729df419f20a31c05f103c7e991849baad78`。
- 原`champion-pools.json`：`4862aa1a8eecbcf99b520e5debfa3c44067e964bd6077a78514fcc5130b6175f`。

构建/public共扫描183文件，公开HTML/RSC/客户端资源无私人路径、凭据、OE原始CSV、GoL逐局研究或完整P2-C快照。未增加下载接口；Git待提交清单不含上述数据、截图或.env。

普通Next服务端编译代码及客户端引用**内部清单**仍含Next自动生成的本机构建模块绝对路径（25文件），这些不属于HTTP/RSC/客户端可访问内容，未发现公开泄漏。已有Prebuilt流程使用受控暂存目录及严格完整产物扫描；A4必须重新运行，不可直接把当前普通`.next`当成已审计可上传的Prebuilt产物。

## 9. 本地预览与A4待办

本地生产预览：`http://127.0.0.1:3045/live`。服务仅监听loopback。

常规验证：`pnpm live:validate`、`pnpm live:odds:validate`、`pnpm test`；预览运行后可执行`node scripts/validate-live-ui-http.mjs`。

A4需单独授权后：

1. 基于最终本地Commit重新生成Vercel Prebuilt；复用批准聚合候选及原统计生产开关，不回退完整私人快照。
2. 检查新版`/live`静态HTML/RSC/客户端资源、函数追踪及完整产物隐私扫描。
3. 保存当前正常Deployment作为回滚目标；确认Git自动部署继续关闭。
4. 执行用户批准的手动部署，保持既有统计生产环境变量；线上复验Live及原模拟器/TeamProfile。
5. 未授权前不推送、不部署、不创建Preview。

本轮到此停止，不进入S16-A4。
