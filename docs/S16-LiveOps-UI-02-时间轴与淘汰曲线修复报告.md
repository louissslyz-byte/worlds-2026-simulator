# S16-LiveOps-UI-02 — 时间轴与淘汰曲线修复

日期：2026-10-26（北京时间）。状态：LOCAL COMPLETE；未推送、未部署。

## 版本与范围

- 起始分支：`feat/s16-liveops-02-swiss-r2`。
- 起始 HEAD：`5ec9e9503963e028956a453750fda7dbff7314fb`。
- 工作分支：`ui/s16-liveops-ui02`。
- 实现提交：`6fdf55973caa29b378da77486cbdf45ce29f37fc`；本报告另行提交，最终报告提交可用 `git log -1 --format=%H -- 本文件` 查询。
- 原未跟踪规则、报告及模型研究资料均保留，未纳入本轮提交。未执行远程操作或修改已有 Tag。
- Swiss R2 已完成并上线；本轮继续保留 PRE、POST PLAY-IN、Swiss R1、Swiss R2 四份正式历史概率。没有导入新比赛或运行正式 Monte Carlo。

## 修改文件

| 文件 | 变更 |
|---|---|
| `components/live/chart-interaction.ts` | 统一短标签、全局坐标及可绘制节点上限函数 |
| `components/live/live-tournament.tsx` | 截断折线、实心点、透明点击目标和悬停命中集合；加入淘汰终点注释及可访问说明 |
| `components/live/live.module.css` | 克制的淡红虚线与终点文字 |
| `lib/live/view.ts` | 仅展示投影：保留索引正式节点语义，生成完整名称及官方淘汰节点索引 |
| `tests/live-chart-interaction.mjs` | 真实淘汰、零计数反例、Swiss R3 淘汰、第五/第六节点、原始值保护 |
| `tests/data-presentation.mjs` | 将绘制点数量断言更新为真实轨迹长度，继续验证全局坐标、实际概率与汇总 |
| `tests/live-ui.mjs` | 合成未来节点明确使用测试语义，避免继承 POST 类型 |
| `tests/live-update-http.mjs` | 验证210个可见概率点及228个保留历史值；不将普通 Next HTTP 测试称作 Prebuilt 验收 |

## 横轴标签

统一使用已验证快照索引的 `label` 作为节点语义 `kind`，不解析 Team ID、snapshotId 或中文名称猜测阶段。

- PRE-TOURNAMENT → 赛前。
- POST-PLAY-IN → 入围赛后。
- SWISS-R1-COMPLETE 至 SWISS-R5-COMPLETE → Swiss R1 至 Swiss R5。
- 已登记的淘汰赛阶段完成语义可显示 Quarterfinals、Semifinals、Final；实际尚未新增这些正式快照。
- 未知语义保留原文，不能擅自认定阶段；未来不同语义应明确登记。

Tooltip、节点按钮可访问名称和简洁详情继续显示完整名称，例如“瑞士轮第二轮后”；未来 Swiss R3–R5 同样保留完整中文名称。

X 坐标始终按全局完整节点列表计算。保留原有每节点约120单位的最小间距和图表内部横向滚动，未缩小字体或使用省略号截断。图表滚动区域可获得键盘焦点。

## 官方淘汰事实与终止点

当前 C9、FUR、MVK 的依据为 A1 已验证官方赛事状态的 `eliminatedTeams`，通过 `validateOfficialTournament` 和现有服务器端哈希校验后进入展示投影。选取第一个已涵盖该事实截止时点的正式概率节点：本次均为“入围赛后”，全局索引1。

未来 Swiss 事实投影依据已验证真实战绩中的三负淘汰状态调用同一展示辅助函数。保留最早已知淘汰节点，找不到涵盖事实的快照时明确报错，不猜测节点。新增后续事实适配器仍须提供已验证的淘汰名单/事实截止时间；不要求逐队修改图表。

没有从冠军计数、任何概率为0或某条曲线触底推断淘汰。LOS 当前冠军计数为0但没有官方淘汰事实，仍完整显示四节点。

| 对象 | 绘制节点/每事件 | 终点 |
|---|---:|---|
| C9、FUR、MVK | 2 | 入围赛后 |
| HLE、GEN、LOS等其余16队 | 4 | 最新 Swiss R2 节点 |

19队仍使用同一完整四节点时间轴、同一0–100%纵轴，共57条事件曲线。正式历史仍有228个事件数值，只绘制210个点。淘汰后的18个值仍保留在快照及页面数据中，没有删除、置零或修改。

路径、可见圆点、透明点击目标与鼠标最近点集合使用同一终点限制；后续区域没有隐藏按钮。保留淘汰节点实际数值，之后自然留空。终点仅标注一次“已淘汰”和淡红竖虚线，虚线先于概率点绘制且不接收指针事件，不遮挡数据点、横轴标签或交互。Tooltip和键盘节点名称在该节点说明“已淘汰”。

底部三项当前概率、赛前基准及pp差值继续读取最新完整快照，不改为终止节点数据。

## 测试与浏览器证据

以下命令均使用项目 Node22 环境，退出码0：

- `pnpm lint` 对应的直接 ESLint 命令。
- `pnpm typecheck` 对应的 `tsc --noEmit`。
- `node --import tsx tests/run.mjs` 全部现有回归及新增图表断言。
- 原 A1/A2/R1/R2 历史、冻结模型、计数及归档校验，包含在完整测试中。
- `scripts/build-production.mjs` 本地 Next 生产构建（Webpack）；读取原批准的仓库外最小统计聚合候选，SHA仍为 `c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`。
- 新本地生产构建 `tests/live-update-http.mjs`：19请求，精确 RSC 投影、30场赛事、19队、57曲线、210绘制点、原始228历史值及私有路径404。
- `tests/statistics-release-http.mjs`：122请求，19队95人统计和RSC数据一致。
- `tests/gol-profile-http.mjs`：19队95人、1302条英雄池记录、Roster和Road to Worlds通过。
- `git diff --check` 及暂存区审计通过；未提交JSON、截图、凭据或私有研究数据。

四宽度使用实际桌面内置浏览器模拟视口，不是实体手机：

| 宽度 | 19队横轴标签不重叠 | 全局节点对齐 | 淘汰终点/无后续目标 | 页面横向溢出 |
|---|---|---|---|---|
| 1440 | PASS | PASS | PASS | 无 |
| 768 | PASS | PASS | PASS | 无 |
| 390 | PASS | PASS | PASS | 无 |
| 320 | PASS | PASS | PASS | 无 |

窄屏完整横轴通过图表内部滚动访问；键盘右方向键实测能够改变图表滚动位置。鼠标悬停、Tab焦点提示、点击/Enter详情、Escape关闭及焦点恢复通过。节点重叠时沿用既有稳定选择顺序，各事件可独立Tab访问。精准0%、100%及0.001%格式化测试保留。

当前正式事实没有 Swiss 淘汰队，因此仅在内存夹具验证 Swiss R3 淘汰：五/六节点均终止于索引4，后续无点/线/命中目标，已实现的 Swiss 100%仍保持100%。没有将夹具写入正式数据。所有76份真实节点详情的精确数值仍可独立验证，图表只允许访问实际绘制的节点。

完整回归覆盖 System、Custom、Manual Pick、会话恢复、R1规则、Rankings、Team/Player及英雄池。未新增业务状态写入。

## 数据与安全不变性

相对起始 HEAD 比较106个受保护已跟踪文件（排除本次展示投影），全部逐字节相同，包含事实/概率JSON、冻结Rating、Simulator、会话及Team Profile代码和英雄池数据。仓库外审阅目录保存 `integrity.json` 文件哈希清单。

- A1事实输入：`e71bb7d0d9828b5b6a1b2f7f2323fe72043c8d057289f7fc64698c867591748b`。
- PRE计数：`04996473ee71f26573d3459f5b799ad4ff4d3e3883b46594a07fc12ff97c8ddd`。
- POST计数：`5601fb1f64d30f9b90f8ef508d832dc36083adbb0890c639975121f65a77c509`。
- Swiss R1计数：`b0ee80de2d41e2328e36035a5a315de4c99a3d711b723fc1cc4e7d0b30f31511`。
- Swiss R2计数：`037a48093502b90e8af90cee512b8931579f66b64af39f7e219ae8dcd05e26ab`。
- Rating输入：`50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb`。

模型仍为 `gpr-prob-v1.1`，系数0.85、divisor400；没有新增正式MC运行，没有读取P2-C完整私有包或原始研究数据。生产开关、Vercel配置、用户会话和模型冻结均未修改。

## 前后截图与本地预览

截图和日志位于仓库外独立审阅目录 `s16-live-ui02-2026-10-26`，未加入Git。Before来自上一版Swiss R2冻结产物的本地只读预览，After来自新本地Next生产构建；均为真实浏览器截图。

| 宽度 | 修改前 | 修改后 |
|---|---|---|
| 1440 | before-1440.jpg | after-1440.jpg |
| 768 | before-768.jpg | after-768.jpg |
| 390 | before-390.jpg | after-390.jpg |
| 320 | before-320.jpg | after-320.jpg |

另有 `alive-gen-1440.jpg`（存活队伍完整四节点）、`hover-elimination-390.jpg`（终点Tooltip）、`scroll-320.jpg`（内部滚动）。这三张为同版开发预览阶段的交互证据。

本地生产预览：`http://127.0.0.1:3067/live`，仅在本机预览进程运行时有效。

## 发布边界与剩余事项

本地展示修复验收通过。没有Push、Preview、Production部署、云端设置改动或新比赛日更新。原生产版本保持不变。

本次只做本地Next生产构建，未重新生成Vercel Prebuilt。旧Swiss R2冻结产物仅用于Before对照，不包含本轮修改，不能作为本轮发布候选或复用其旧审计SHA。若用户后续批准上线，须以新提交重新生成并审计完整Prebuilt，再按既有发布门禁部署。

未来新增官方快照仍须通过原有事实/模型/归档验证；图表自动使用全局节点坐标和官方淘汰终点，无需逐队手工裁剪。新的赛事阶段语义须明确登记，未知语义不会被猜测映射。

## 补充微调：Swiss节点明确标注“后”（2026-10-26）

用户要求横轴排除赛前/赛后歧义。统一格式化函数已将 Swiss R1–R5 的完成节点显示为 `Swiss R1 后` 至 `Swiss R5 后`；当前四节点显示为“赛前 → 入围赛后 → Swiss R1 后 → Swiss R2 后”。未来合法Swiss完成快照自动沿用同一规则，不需要逐队修改。Tooltip、详情完整名称以及淘汰终点逻辑均未改变。

本次基线为 `1691c12`，仍位于 `ui/s16-liveops-ui02`。仅修改共享标签函数、相应测试及本报告；没有修改任何事实、概率、模型、Session或其他页面。

重新运行lint、typecheck、完整现有回归、本地Next生产构建和19请求Live HTTP/RSC测试，全部通过。浏览器在1440/768/390/320四宽度读取全部19队的实际标签边界，未发现标签重叠或页面横向溢出。测试明确覆盖 R1–R5 通用后缀；原第五、第六节点和淘汰截断测试保持通过。

新截图及日志保存于原仓库外审阅目录的 `label-followup/` 子目录，截图为 `after-1440.jpg`、`after-768.jpg`、`after-390.jpg`、`after-320.jpg`；微调前对照使用原目录同宽度 `after-*.jpg`，未覆盖旧证据。所有数据文件保持不变，无正式Monte Carlo、Push、部署或Prebuilt发布行为。旧Prebuilt仍不得用于发布本轮修复。
