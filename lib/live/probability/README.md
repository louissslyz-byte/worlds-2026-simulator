# Live 概率快照（S16-A2，离线）

只读使用A1事实、冻结System实力与S16-R1共享引擎。没有网络同步、浏览器存储、计算API或前端页面。本轮产物不得自动推送或部署。

## 计算定义

- PRE-TOURNAMENT：复用经过文件SHA、输入/规则/源码指纹及完整五阶段整数计数校验的R1正式100,000次缓存。Swiss/八强/半决赛/决赛/冠军来自同一批实验，不拼接其他批次。
- PRE的asOf是首场前的时间轴锚点；其条件严格沿用R1“入围赛抽签及全部赛果未知、Swiss首轮抽签未知”的模型。不是声称包含当时已经公开的真实Play-In抽签。
- POST-PLAY-IN：读取`worlds-2026-post-play-in-v1`及固定事实SHA，独立构造6场完场OFFICIAL/locked、16队0–0战绩、8场UNDECIDED首轮的Session。不会模拟Play-In或抽首轮；随后调用原`runMonteCarloFromState`运行100,000次。
- 两节点使用同一个`frozen-system-v1.json`；k=0.85、Elo divisor=400、实力和公式均未更新。每局/系列赛、后续Swiss及八强路径由共享引擎实现。
- 两个不同固定seed，不实现共同随机数或声称逐路径配对。POST包含Play-In结果和首轮抽签两个条件，变化不能解释为Rating变化或单一赛果效应。

## 命令

Node22、pnpm9，在项目目录执行：

```sh
pnpm live:validate
pnpm live:odds:generate --out /tmp/worlds-live-odds-candidate
pnpm live:odds:validate /tmp/worlds-live-odds-candidate
# 人工审阅两个Snapshot、对照表和生成审计后，明确保存：
pnpm live:odds:generate --save /tmp/worlds-live-odds-candidate
pnpm live:odds:validate
# 从同一事实、实力、种子再次计算，逐项比较整数计数；不覆盖档案：
pnpm live:odds:generate --verify-existing
```

`--out`要求新目录，生成器源码必须与记录的本地Commit逐文件一致；它不会修改原`precomputedOdds.json`。失败立即终止，不输出部分成功快照。共享引擎失败时只保存非敏感样本索引/seed/计数上下文，不输出Session、私人路径或堆栈。

`--save`只允许首次创建本版本历史目录。已存在则拒绝，禁止默默覆盖；只允许七个规定的普通文件，额外文件、目录、符号链接均拒绝，避免把研究文件混入概率包。保存先在独立临时目录重新校验，再原子移入；不修改A1快照或冻结文件。

## 文件及读取

- `model.ts` / `frozen-system-v1.json`：19队评分、GPR参考值、参数、模型/规则版本及来源源码指纹。
- `adapter.ts`：事实→独立模拟Session，显式检查固定比分、首轮对阵及字段；只读A1。
- `schema.ts` / `snapshot.ts`：严格Schema、五事件整数计数/名额/嵌套、概率等于count/100000、事实及模型绑定、百分点对照。
- `generate.ts`：现有R1缓存复用＋共享条件MC入口，无第二套抽签或胜率算法。
- `archive.ts`：只读`validateProbabilityHistory()`及显式候选保存。
- `snapshots/index.json`：按asOf排序的两个节点索引，各文件有SHA-256。
- `snapshots/pre-tournament-v1.json`、`post-play-in-v1.json`：完整19队五阶段计数、数值概率、版本、种子、输入/计数SHA和运行元数据。
- `snapshots/comparison-v1.json` / `.csv`：POST−PRE的百分点差值。JSON保留数值；CSV的差值列为三位小数。
- `snapshots/generation-v1.json`：成功数量、资源、来源复用证明、整数总和与生成审计。
- `snapshots/frozen-system-v1.json`：与上级冻结文件一致的归档副本。

未来A3的服务端读取可调用`validateProbabilityHistory()`，取得`pre`、`post`、`comparison`、`index`。不应导入`generate.ts`作为页面请求处理器，不允许页面访问触发10万次计算。未来可拆出更轻的只读投影；本轮未开发前端。

## 可复现性与历史保护

- 固定seed；共享R1每个样本种子仍为`(seed + i*7919) >>> 0`，没有改变RNG。
- Session UUID和createdAt不进入System概率结果；适配器按A1规范ID排序固定R1比赛执行顺序，不冒充官方转播顺序。
- 所有成功样本均由共享`assertCompletedTournament`验收，再计数；失败不跳样本，不重抽补足。
- `countSHA256`只绑定五个整数计数映射，与运行时间/内存和generatedAt无关。文件SHA绑定完整不可变产物，两者用途不同。
- 再次运行可能改变生成时间、运行时间和峰值RSS，预期整数计数必须完全一致。`--verify-existing`不改写原档案。
- 未来节点必须使用新snapshotId；事实修订须绑定A1的新revision及事实SHA，保留旧文件。现阶段只验收PRE/POST两个节点，追加Swiss节点须在后续明确扩展生成及验证配置，不能手改已有节点的结果。
- 此版本保存操作不提供覆盖或自动追加历史的后门；将来新版本历史包应保留原始文件和已归档节点，并显式审核差异。

## 不确定性

100,000次是抽样次数，非真实未来路径穷举。小幅变化有抽样误差，0次事件不等于数学概率为0。原R1没有峰值内存记录，PRE该字段保持null；POST记录的是本地进程高水位RSS，不是单个样本的独立内存。
