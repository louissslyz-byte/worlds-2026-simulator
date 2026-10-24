# S16 LiveOps Daily Update Runbook

版本：LiveOps-01 / 2026-10-24。首次实际走通：Swiss R1完成＋R2官方签表→100000次有效剩余赛事路径→第三快照→最终Prebuilt本地验收。

## 1. 边界与前置检查

- M0 CLOSED。保持gpr-prob-v1.1、scale0.85、divisor400、2026-09-29实力输入。冻结Rating SHA：`50ecd08a842afff2cfb2146a92fa67b929c42c121f831a6e110de9185a7ed8cb`。
- 规则worlds-2026-official-draw-v2、state worlds-state-v2。读取现有引擎，不能复制抽签或胜率算法。
- 先看status/branch/log/tag及上次LiveOps报告；保留所有未提交和研究文件，建立独立本地分支。严禁git add -A、reset或覆盖旧Tag。
- 数据截止在本次赛果全部确认及已知抽签公开之后、下一轮首场之前。未知精确发布时间保存null，实际已知上界可用当时官方页面的观察证据；不得从事后页面猜测此前已知的信息。
- 不将下一轮已发生的比分混入本节点。没有正式100K授权时只验证，不生成。数据、用户Session和网站原赛前缓存严格隔离。

## 2. 正常获取官方证据

优先[官方Swiss页面](https://lolesports.com/en-SG/tournament/115660540725177488/stage/115660540725570706)及[官方赛程](https://lolesports.com/en-US/leagues/worlds)。

逐官方Match ID核对身份、轮次、BO、completed/unstarted、比分、赢家、计划UTC时间；比分与strategy.count交叉检查。未开赛来源中的0–0是占位，正式事实必须null。美国当地日期和北京时间分开，计划时间不冒充实际开赛。

原始页面/响应、SHA及核查日志保存在仓库外。可公开事实文件只留必要赛程、比分、官方ID、来源URL与响应摘要。403停止，不绕过、不反复请求。冲突未消除则禁止正式概率。

## 3. 事实文件与校验

当前注册的首个增量版本：

- `lib/live/updates/facts/swiss-r1-v1.json`
- `lib/live/updates/facts/index.json`
- A1基准仍为`lib/live/snapshots/post-play-in-v1.json`。

使用现有19队Team ID；先核对全轮16队各出场一次，再推导战绩，核对下一轮同战绩、无重赛、BO条件。来源与历史边界必须通过。事实SHA规范对象键及比赛集合顺序；观察/更新时间不随意混入事实输入。

```sh
pnpm live:validate
pnpm live:odds:validate
pnpm live:update:validate --facts-only
```

上述全部已实际执行。任一失败非零退出，不自动修正。

## 4. 条件Session与低成本门禁

当前入口`createSwissRound2Session()`复用A2的POST状态、原applyResult与advance。它按事实锁定R1，在原引擎重建records后安装已知R2签表；所有正式路径只模拟未决未来。不要直接改stage而漏掉matches/records/opponents/qualified/rating/rules/RNG字段。

```sh
node --import tsx tests/live-updates.mjs --facts-only
```

实际门禁：256条完整路径审计；两组64次同种子精确复现；不变性、14个已知结果/8个固定对阵、已淘汰不复活、非法状态拒绝。它们不是正式概率。

## 5. 一次正式生成与候选只读验证

先把事实、生成器及配置保存为审核过的本地Commit。生成脚本要求实际生成代码与Commit一致；明确冻结新ID、asOf、输入SHA、seed和100000次。

```sh
pnpm live:update:generate --candidate "$NEW_CANDIDATE_DIRECTORY"
node --import tsx scripts/validate-live-update-candidate.mjs "$NEW_CANDIDATE_DIRECTORY"
```

`NEW_CANDIDATE_DIRECTORY`必须尚不存在；生成器自己创建。不得指向已归档目录。验证命令已对本次真实候选执行并通过；它不运行MC、不联网、不归档，通过git show核对实际执行提交的源码指纹，而不是假定后来加载器修复就是当时计算代码。

生成失败保存非敏感样本seed/索引/错误并停止，不能跳过、无限重试或把不足100000标成功。正式输出保留19队五事件整数与count/100000；阶段计数总和必须是1600000/800000/400000/200000/100000，逐队嵌套，已确定淘汰事件为0、Swiss资格已确定为100000。

本次正式运行：seed20261024、实际提交02de5ac、100000/0失败、75212ms，count SHA `b0ee80de2d41e2328e36035a5a315de4c99a3d711b723fc1cc4e7d0b30f31511`。没有第二次正式100K。此ID已归档，正常维护不应重跑同ID；若用户另行授权精确复现实验，应在独立工作副本使用实际生成提交02de5ac。比较整数count SHA，不能要求generatedAt/耗时/内存等运行元数据字节相同。

## 6. 审阅后追加归档

- 当前新概率位于`lib/live/updates/snapshots/swiss-r1-v1.json`；新index绑定文件SHA、count SHA、旧history index SHA。
- 原PRE/POST的7文件严格归档及原验证器保留；不能往旧目录塞第三文件，也不能削弱原两个节点断言。
- 当前扩展包含独立生成源码审计`generation-source-v1.json`，绑定02de5ac原源码指纹，记录后续读取兼容修复与原计算的区别。
- 审阅候选后只采用独占新文件写入或人工显式新增；核对已存在ID时必须拒绝，不得覆盖。此阶段不自动发布。

```sh
pnpm live:update:validate
pnpm test
```

现有专项包含对已存在正式目录的真实生成入口拒绝覆盖测试：在任何MC启动之前EEXIST退出，旧文件字节不变。

## 7. 下一个比赛日的扩轮注册（未执行）

**当前可执行配置明确只注册R1节点，不能把R2赛果替换进swiss-r1-v1.json，也不能声称当前generate已接受任意Swiss轮次。**

下一节点要新增版本化事实及snapshotId、asOf、seed，追加历史索引而非修改原节点。按当前状态恢复方式依次应用各已完成轮的OFFICIAL比分，每轮调用原advance推导战绩/交手历史，若下一轮抽签已知则替换为核验签表；未公布签表保留原引擎随机生成。新增该轮事实/时间边界、BO及状态恢复测试，再注册对应验证器及显示标签。复用同一runMonteCarloFromState，无需设计新的MC或赛事规则。

未来通用schema/多轮配置还需以对应轮次验收，本次没有虚构“任意轮次一键导入”命令。这是版本输入与注册的后续工作，不是重新研究模型。不得为省事放宽R1旧版验证器。

## 8. 页面、变化审计与回归

读取链：`readLiveView()`先严查旧档案，再加载已验证增量历史；`projectUpdatedLiveView()`只投影公开事实与概率。当前值和相对赛前pp从最新节点自动计算，原始整数和精度保留。所有队伍、全部事件、历史节点按时间排列；样本零与确定不可能区分。

```sh
pnpm lint
pnpm typecheck
pnpm test
node --import tsx tests/local-prebuilt.mjs
node --import tsx tests/gol-research-isolation.mjs
node --import tsx tests/statistics-presentation.mjs
```

生成19队PRE/POST/新节点夺冠及pp对照，审查最大增减和Knockout变化。独立seed的微小差异可能是抽样噪声；不得人工修正概率。检查A1、旧PRE/POST、R1缓存、M0冻结、1302英雄池和58受保护源文件不变。

## 9. 新Prebuilt与实际产物验收

复用批准聚合输入（886093字节、SHA `c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`），不要读完整P2-C或重新计算统计。先在仓库外备份上一产物。

使用已验证Node22、pnpm9.15.9、CLI64.2.0及原项目绑定：

```sh
TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2 pnpm build:prebuilt "$APPROVED_PRIVATE_RELEASE_INPUT"
TEAM_STATS_RELEASE_SHA256=c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2 node --import tsx scripts/audit-prebuilt.mjs
```

这是本次真正使用的构建/审计流程；CLI位置和登录配置按本机实际工具路径设置，不能把Token或私人路径写进公开文档。构建只是本地build --prod --standalone，不是deploy。安全审计失败不能关闭检测。

产物验收用本地静态资源＋Node函数handler验收器，清楚区分其与Vercel云端/CDN的范围。以下命令假定已启动受控loopback服务，不能把未启动的服务写成已通过：

```sh
LIVE_UPDATE_BASE_URL=http://127.0.0.1:3061 node --import tsx tests/live-update-http.mjs
STATISTICS_BASE_URL=http://127.0.0.1:3061 STATISTICS_RELEASE_INPUT="$APPROVED_PRIVATE_RELEASE_INPUT" node --import tsx tests/statistics-release-http.mjs
PROFILE_AUDIT_URL=http://127.0.0.1:3061 PROFILE_STATS_RELEASE=1 node --import tsx tests/gol-profile-http.mjs
```

本次验收器保存在仓库外证据目录，只读最终`.vercel/output`，不作为产品服务器发布。实际检查19队95人、1302英雄记录、Live HTTP/RSC投影及404下载路径。对整个产物扫描个人路径、凭据、原始CSV、GoL逐局、完整P2-C、研究目录和外部链接。服务器内部非个人临时构建路径单独分类，不谎称公网私人数据泄漏，也不隐藏真实公开命中。

浏览器实际测1440/768/390/320，全部曲线/点、最新节点、PRE基准pp、标签、鼠标/键盘/触屏点击、筛选、溢出；独立loopback origin完成System与Custom手动结果→冠军→刷新恢复。不得覆盖用户正式站存档。

## 10. 发布批准门禁与停止

记录源码Commit、事实/状态/计数/文件/产物树SHA、失败/有效数量、资源与测试结果。只暂存审核过的具体路径；原始证据/截图/日志及研究文件留项目外。

重新只读核对原Vercel项目、当前Production、可接受回滚目标、Git自动部署关闭和统计运行参数。403、访问受限等要记录准确证据，不能当成应用故障或伪造验证成功。本次只读403尚需恢复权限，因此正式部署NO-GO；本地数据/页面/产物均通过。

**停在本地候选与报告。等待用户分别批准Production部署及Git Push。** 不因为构建成功自动执行deploy，不创建Preview，不更改云端设置，不推进下一轮结果或M0研究。
