# S16 LiveOps-06 八强赛果与条件概率更新

基准提交 `43cdaa0`。2026-11-07 14:38（北京时间）核查 Riot 官方签表，四场八强已完成，两场半决赛待开始。事实档案保存官方比赛 ID、原始 UTC、比分、赢家及原始响应 SHA-256。半决赛比分保留 null。[LoL Esports 官方签表](https://lolesports.com/en-SG/tournament/115660540725177488/stage/115660540725570707)

| 八强 | 比分 | 晋级 |
|---|---|---|
| DK–BLG | 0–3 | BLG |
| KC–T1 | 1–3 | T1 |
| TES–IG | 1–3 | IG |
| GEN–LYON | 3–0 | GEN |

半决赛计划时间为北京时间 11 月 8 日 06:00 IG–GEN，11 月 9 日 06:00 BLG–T1。树状图按官方半区连接。

复用现有引擎锁定四场官方比分并推进至半决赛，按官方队伍顺序建立两场待模拟 BO5。两套模型独立读取原冻结实力输入，分别完成 100,000 条路径，失败均为 0。赛前 GPR 种子 20261107，用时 32.044 秒。10 月 31 日 GPR 种子 20261108，用时 32.151 秒。计数和输入 SHA 保存在快照文件。旧快照保留原字节，新增节点绑定同一事实哈希。

| 队伍 | 赛前 GPR 夺冠概率 | 10 月 31 日 GPR 夺冠概率 |
|---|---:|---:|
| GEN | 46.046% | 53.527% |
| T1 | 18.292% | 21.343% |
| BLG | 32.327% | 20.305% |
| IG | 3.335% | 4.825% |

其余队伍的夺冠计数为 0。DK、KC、TES、LYON 的曲线在八强赛后节点终止。赛事追踪为 45 场，43 场已完成、2 场待开赛。原模型 19 队 9 节点，八强预测 8 队 3 节点。首页 MATCHUPS 随最新赛程显示八强和半决赛。

验证通过 TypeScript、修改文件 ESLint、完整回归、两套模型的状态和归档校验、生产 Prebuilt、Live 生产函数 HTML/RSC。浏览器工具连接超时，浏览器布局未复验。产物 709 文件、59 内部链接、19 队 95 人统计资源，隐私扫描无命中。

本地 Prebuilt 树 SHA-256 `6818aef0b97ef38dca1f5a5fb873d9540cf823ba7b0c0eada9d1a360ef5b3345`。生产发布与 GitHub 同步待授权。

复算命令 `node --import tsx scripts/generate-live-quarterfinals.mjs <新的仓库外候选目录>`。校验命令 `node --import tsx tests/live-quarterfinals.mjs` 和 `node --import tsx scripts/validate-knockout-forecast.mjs`。
