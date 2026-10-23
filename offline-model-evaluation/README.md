> **M0 RESEARCH CLOSED — 2026-10-23用户决策**
>
> 停止D3.5/D4、参数校准、LCK/战队修正及新算法实验。下文与各阶段README中的继续研究建议仅为历史记录，不是默认任务。工具及私有归档保留，不自动抓取、采样或训练。
>
> 最新规范：[模型研究结项与冻结决策](../docs/S16-M0-FINAL-模型研究结项与冻结决策.md)；[研究归档索引](../docs/S16-M0研究归档索引.md)。每日LiveOps仍按独立授权，使用相同冻结模型更新条件概率。

# S16-M0 离线胜率评估

本工具只读复用网站的 `SystemRatingProvider`、`gameProbability`、`seriesProbability` 和A1验证器。不运行Monte Carlo，不请求网络，不修改网站或历史数据。

## 运行

在网站仓库根目录使用Node22及现有tsx依赖：

```sh
node --import tsx offline-model-evaluation/test.mjs
node --import tsx offline-model-evaluation/run.mjs \
  --stats-root /path/to/existing/offline-worlds-stats \
  --output /path/outside/website-and-data-project/m0-run-v1
node --import tsx offline-model-evaluation/validate.mjs /path/to/m0-run-v1
node --import tsx offline-model-evaluation/test-output.mjs /path/to/m0-run-v1
```

两个路径都须由操作者显式提供。工具拒绝把结果写入网站仓库或原数据工程；相同目录只允许写入相同内容，不覆盖不同版本。新输入/代码版本应使用新输出目录。

已有六赛区797局清单、系列赛对账文件及OE原CSV按固定SHA验证；没有下载或复制CSV。每次读取前后复查输入哈希，比较全部既有Git跟踪文件以验证网站不变。运行结果不自动提交到Git。

## 模型与时间

18队GPR和原k=.85/divisor=400核对现有代码及68acbb1历史版本；FUR回退1575核对e8f07f6。分别以9月30日、10月5日的日期证据结束时刻（采用UTC-12的保守上界）作为输入可用界限。比赛日期采用UTC+14的最早可能时刻，两者严格比较。不将当前动态榜单冒充旧版GPR。

这些是已有本地Git和项目来源核查记录，不声称独立第三方时间戳存证。A1比赛通过原文件/事实哈希、双败结构及来源校验；原比赛结果不重新手写。

原k与divisor仅在双方均有GPR时通过比值决定概率，不应同时拟合。含回退队时还涉及保持不变的强度参考锚点，不能把回退值当作官方GPR。对称温度缩放若作用于单局logit，在纯GPR样本上与尺度调整等价，后续应去重比较，不能包装为独立的新算法。

## 正式输出

- `frozen-model.json`：19队、输入来源、参数、版本及SHA。
- `series-predictions.json/csv`：9场BO5预测、真实结果、来源。
- `game-predictions.json/csv`：3场国内系列赛中的13局，独立评分。
- `series-exclusions.json`、`game-eligibility.json/csv`：逐项纳入/排除理由。
- `summary.json`：Brier、自然对数Log Loss、正确率、分组、校准分箱、候选状态及决策。
- `input-manifest.json`、`output-manifest.json`：输入、输出SHA及网站保护证据。

Brier采用二元事件`mean((p-y)^2)`，范围0–1；Log Loss采用自然对数，不以裁剪掩盖错误的0/1预测。概率为当前列表Team A获胜概率。校准图转为“模型较看好一方”的置信度，每个原始事件只记一次，不镜像扩充样本。精确50/50正确率记半分。

系列赛与单局结果不合并。单局来自BO5而非独立BO1赛制。未导入六场入围赛的逐局顺序，绝不从最终比分捏造逐局记录。替代模型未拟合，`metrics=null`。7–8月训练窗、9月验证窗为空，10月9场只能做描述性检验，不是新的盲测集；3个事件块不做可靠性不足的聚类显著性检验。

图表（Matplotlib环境）：

```sh
MPLCONFIGDIR=/path/to/private/cache python3 offline-model-evaluation/plot.py \
  /path/to/m0-run-v1/summary.json /path/to/private/figures
```

## 后续输入准入

新增历史GPR必须同时保存分数、稳定队伍ID、明确的数据时点、赛前可用证据、来源及校验值。网页当前可读/搜索缓存日期不能代替历史发布证据。完整结果、去重和赛制经过核验后，先冻结训练/验证/测试边界及功效评估，再比较仅调尺度和对称校准；不在当前9场上选择最佳参数。

原始OE和研究输出保持本地私有，`publicExportAllowed=false`。本工具没有公开导出或网站接入入口，不能以本次离线读取推断数据公开展示授权。
