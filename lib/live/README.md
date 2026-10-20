# Live Tournament：离线官方事实层（S16-A1）

本目录尚未接入页面、用户会话或概率计算。只维护获准公开展示的系列赛事实，不包含OE、GoL研究数据、P2-C统计或模型预测。

## 已有快照

- `snapshots/post-play-in-v1.json`：六场入围赛＋Swiss首轮官方签表。
- `snapshots/index.json`：不可变快照索引，分别绑定文件SHA-256与标准化事实输入SHA-256。
- 信息截止：2026-10-19 20:00 CST；来源核查：2026-10-20 08:52:35 CST。
- 此截止时点不是决赛完赛或抽签发生的精确时刻。日期精度的历史报道按UTC−12当天结束计算保守上界，避免擅自假定报道时区。

## 运行

使用项目既有Node22和pnpm9：

```sh
pnpm live:validate
pnpm test
```

验证失败非零退出。命令只读，不抓取网络、不计算概率、不写文件、不自动修复比分。

## API

- `loadOfficialSnapshot(snapshotId?)`：按索引读取并核验文件及事实哈希，返回`data`、`state`、`facts`、`inputSHA256`、`warnings`。
- `validateOfficialTournament(input)`：严格Schema、来源、历史边界、真实双败依赖、身份、签表及时区验证。
- `deriveOfficialTournamentState(input)`：从已验证事实推导晋级、淘汰、16队及尚未开打的八场Swiss比赛。
- `buildA2FactsInput(input)`：供A2未来离线适配器读取的纯事实对象及SHA；不生成Simulator Session。
- `resolveOfficialTeamId(name)`：精确受控别名，例如TL→TLAW；未知名称报错，不做模糊猜测。

没有导出模拟器Match/Session类型，没有LocalStorage写入，也没有API或JSON下载路由。`identity.ts`只读复用既有身份；`validate.ts`只读复用S16-R1规则常量，不执行抽签。

## 时间和证据

所有时间使用带毫秒的UTC ISO 8601。另保存来源当地分钟及IANA时区；`formatBeijingTime`统一显示北京时间CST。`knownBy`是最晚已知上界，不是精确发布时间；`sourceCheckedAt`是事后核查时间。

`OFFICIAL_VERIFIED`表示当前官方页面直接确认的事实；`CROSS_VERIFIED`表示多来源交叉支持；`UNVERIFIED`不得进入正式输入。来源还记录其能够支持的事实类别，不能用赛制预告冒充实际抽签或完场结果。历史时间边界必须有相应事实类别的已注明日期来源支撑。

Swiss签表行序不是比赛顺序。截止时点无法可靠核实的逐场时间保持null／TIME_TBD，不从一小时一个槽、日程开幕时间或模拟结果补齐。日程时间是计划时间，不是实际开赛时间。

## 人工更新与修订

1. 阅读官方原始结果及发布时间，保留URL、核查时间、证据类别和冲突说明。
2. 不修改既有快照。另建版本文件，更换`snapshotId`和`dataVersion`，用`revisionOf`指向被修订的历史节点。事实冲突先标UNVERIFIED；不要选一个比分强行通过。
3. 新文件先执行`pnpm live:validate --candidate <候选文件>`。已登记ID的内容或文件字节变化会被拒绝；脚本不覆盖索引或历史文件。
4. 当前校验器仅验收POST_PLAY_IN。未来Swiss逐轮节点需在另阶段明确扩展Schema/验证器，不能把Swiss赛果塞入本快照。
5. 候选通过后人工审阅事实差异，计算文件SHA-256，把新文件名、事实SHA和文件SHA追加到索引。保留旧条目、旧文件；再次执行`pnpm live:validate`及全套测试。
6. 概率生成、用户Session转换及发布不属于此流程，本轮均未执行。

事实SHA不含核查时间、更新时间、来源备注或运行时间，并规范对象键、比赛与队伍集合顺序。文件SHA保护整个存档，包括其证据元数据；格式变动可能改变文件SHA，但不会无意义地改变事实SHA。正式存档不因此就允许被静默改写。
