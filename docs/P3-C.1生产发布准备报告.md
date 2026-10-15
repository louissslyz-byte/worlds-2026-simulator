# P3-C.1：生产统计适配与发布准备

日期：2026-10-16，CST（UTC+8）。基于稳定检查点`e3f6494`，在本地`release/p3-c1`分支开发。未推送、部署、创建公开Preview或修改云端设置；旧Tag保持不变。

## 1. 三项判断

|事项|结论|依据／剩余条件|
|---|---|---|
|CODE READY|**PASS**|生产与本地读取分离、默认关闭、严格聚合schema、构建输入校验、Next函数打包及Node22测试完成。保留原UI与业务逻辑。|
|DATA READY|**PASS（限已确认的网页展示用途）**|最小候选数据生成完成，114个页面投影逐字段一致、两次生成字节相同。按本轮用户声明，Riot／OE／GoL聚合网页展示获授权；不据此批准公开GitHub存放聚合文件、原始数据再分发。|
|DEPLOY READY|**CONDITIONAL**|尚未配置真实的私有构建输入HTTPS地址／凭据及Production环境变量；Vercel只读项目接口403，云端生产分支、Preview设置、当前Deployment与回滚权限未核实。需P3-C.2按下节具体步骤配置并验证；本轮不部署。|

本报告取代此前“许可未确认”作为本轮技术实施前提，依据是用户确认的授权声明，未独立审阅授权合同，也未扩大授权范围。此前历史审查报告保持原样。

## 2. 实施与架构

选择**方案B：私有构建输入**。不增加数据库、不做访客实时抓取或计算。

```text
仓库外P2-C固定快照（不变）
  → 本地显式转换、114页一致性校验
  → 仓库外最小聚合候选＋SHA-256清单（不提交）
  → 未来经授权上传私人HTTPS构建资源（本轮未上传）
  → 构建时校验SHA／严格schema
  → .team-stats-release/data.json（忽略，server函数资源）
  → 服务端仅投影当前战队／选手页面
```

运行期不访问外部服务；服务端首次读取资源后复用缓存。没有新增API或JSON下载路由。`server-only`不是许可依据：HTML和RSC中的必要统计仍属于用户授权的公开网页展示。

方案比较：

|方案|选择与原因|
|---|---|
|A 聚合JSON进公开Git|本轮不选；公开文件再分发不在已明确的网页展示授权范围内。|
|B 私有构建输入＋服务端资源|本轮实现；Next trace可带入Vercel函数，免数据库、免每次请求抓取，构建与内容有固定哈希。|
|C 运行时受控存储|本轮不选；增加运行时网络、认证、缓存和费用，当前静态聚合数据没有必要。|

正式私有存储的访问范围必须是构建账号可读，不是浏览器可下载的公开桶；可以使用Bearer认证或受控的短期HTTPS地址。配置URL并不会自动上传文件，本轮未执行这一步。平台必要的私有构建留存与公开Git分发分开管理。

## 3. 最小数据与一致性

schema：`team-profile-release-v1`。

|字段|保留内容|
|---|---|
|metadata|797局范围、源快照日期、源文件SHA、definitionVersion、用户确认网页展示用途；原始再分发及公开仓库分发未批准标记|
|pages|19战队＋95选手的身份键、赛区、真实样本、指标及BP；引用共享基准，避免重复保存整个区域包|
|entity.metrics|value、有效／应计／缺失／排除局数、分子／分母、来源、定义版本、覆盖状态；null保留|
|baselines|同赛区／同位置的真实分布，绘图所需对象标签、值、有效／出场局数、小样本标记、原有均值及分位数；区域基准状态不变|
|definitions|页面实际用到的原Metric Dictionary定义及原始顺序，单位、公式、方向、范围和有效规则不变|
|champions|Draft实际引用的canonical ID及名称；不包含原英雄池副本|
|draft|三类Pick／Ban及独立有效分母；仅MID+JUNGLE、BOT+SUPPORT、TOP+JUNGLE组合及场次／胜场／胜率|

没有逐局记录、missing/excluded gameId清单、来源选手数据库ID、完整区域研究包、GPR、Rating、预测字段、私人路径或源CSV。

转换只选择已有聚合值，不重算统计。抽出既有`project()`供本地与发布转换共同复用；增加原来未送出、但来源已经存在的分子／分母字段，未改变数值和公式。补充类型以如实表达JSON中可缺省的观察点playerId，不改变身份。

候选文件：886,093字节。

- SHA-256：`c2ba86bf8da177c664c5e34d9fa10e9ae16fa671f4e067769775da4fc817b3d2`
- 源快照SHA-256：`79781a1d8c05ab9649866eae8401049084eeb4634f1f0f0713ac5030ad4c10dc`
- 源快照日期：2026-10-13；P2-C包生成日期：2026-10-14。
- 同一输入两次生成相同字节；114个完整页面投影逐字段比较通过，包含数值、顺序、样本、状态、基准与定义。

候选数据及清单保留在仓库外私人审计目录；没有写入public或Git。原P2-C文件内`publicExportAllowed=false`及原离线导出限制不变，原始CSV和历史快照不修改。

## 4. 两种读取机制

### LOCAL PRIVATE

保留原`TEAM_STATS_LOCAL=1`、development、loopback及代理头限制、项目外绝对路径、realpath／符号链接检查。production／CI／Vercel永远不读取完整私人快照。没有删除这些检查。

### PRODUCTION RELEASE

`TEAM_STATS_RELEASE_ENABLED=true`且NODE_ENV=production才允许；Vercel还要求`VERCEL_ENV=production`，Preview／development拒绝。CI可以验证批准的发布路径，但不能用原私人读取机制。

运行期只读取固定的`.team-stats-release/data.json`，不读取`TEAM_STATS_RELEASE_INPUT`、URL或`TEAM_STATS_SNAPSHOT`。缺少资源、SHA不符、schema不符明确报错，无私人快照回退。

构建流程先准备数据，再执行Next。默认关闭的构建会移除旧的生成资源，避免沿用上次开启构建的输入；不读取私人路径。云端启用时必须通过HTTPS输入，拒绝仅以本机路径作为CI输入；禁止重定向，检查大小、SHA及白名单schema。错误信息不输出URL凭据或数据内容。

`.gitignore`和`.vercelignore`排除生成资源；Next的`outputFileTracingIncludes`只给战队／选手两条函数带入生成文件。忽略源码上传与函数打包是两个阶段：本轮已验证最终NFT引用存在，不能只靠忽略规则猜测部署行为。

## 5. UI及声明

- P3-A.6 CSS、Header、图表、交互、Roster、Road To Worlds、Champion Pool不重做。
- 仅将发布模式的“仅本地预览”改成“统计数据”，本地模式仍显示原提示；完整性说明及缺口保留。
- Footer同一行最小补充非官方项目／非官方概率声明；没有声称Riot认证数据或本站为官方产品，没有改布局。
- 原GoL英雄池逐字节不变；两研究文件仍不在当前代码树，构建不依赖。旧历史仍有副本，未重写历史，未推定授权要求必须删除或允许任意原始再分发。

## 6. 环境变量

|变量|Development|Preview|Production|
|---|---|---|---|
|TEAM_STATS_LOCAL|仅本机预览设1|不配置|不配置|
|TEAM_STATS_SNAPSHOT|仅本机外部快照|不配置|不配置|
|TEAM_STATS_RELEASE_ENABLED|通常不配置；本地生产测试可true|**不配置／false**|获发布授权后才true；当前云端未改|
|TEAM_STATS_RELEASE_SHA256|本地生产验收用候选哈希|不配置|与批准的候选哈希一致，构建和运行都保留|
|TEAM_STATS_RELEASE_INPUT|仅本机生产构建：外部聚合文件绝对路径|禁止|禁止；CI／Vercel忽略此输入|
|TEAM_STATS_RELEASE_URL|通常不配置|不配置|私有HTTPS聚合资源，仅构建读取|
|TEAM_STATS_RELEASE_TOKEN|通常不配置|不配置|可选Bearer凭据，仅构建读取、设为敏感值|

NODE_ENV由Next管理，VERCEL／VERCEL_ENV由平台设置；不要手改它们来伪装Production。不得使用NEXT_PUBLIC传递URL、Token、快照或开关；不要把本机.env复制到云端。

不能将Production数据设置共享到Preview。构建与运行环境开关须一致：禁用构建没有打包资源，之后单独打开运行开关会失败，应重新构建。

## 7. 构建与测试

实际使用官方下载、SHA校验的**Node22.23.3**（非将Node24结果冒称Node22）。Next16.3.4 webpack，现有框架保持不变。

|检查|结果|
|---|---|
|lint／TypeScript／网站原回归|PASS|
|P3-A.6显示测试／P3-B安全19组／GoL隔离测试|PASS|
|本地私人预览|PASS，114页面，19队95人，与私有数据值对应|
|生产关闭构建与HTTP／RSC|PASS；32个请求，故意配置本地开关仍拒绝私人读取|
|生产开启构建|PASS，使用独立最小候选；没有读取完整快照|
|生产开启HTTP／RSC|PASS，122个请求，19队95人显示值、请求头独立性、JSON路径404|
|原英雄池生产关闭／开启|PASS，各19队95人、1,302条英雄行，顺序／场次／胜率相同|
|转换／schema／开关专项|PASS，114逐字段相等、两次字节复现、拒绝完整私有包及多余字段、Preview拒绝、CI拒绝本机路径|
|NFT打包|PASS，两条详情函数trace包含固定聚合资源，列表页无该资源|
|开启时隐私扫描|PASS，282生产文件；私人快照标识／路径、真实本地凭据、研究依赖无命中，source map为0|
|GoL研究canary扫描|PASS，318个构建／public文件、8个真实研究对象无命中|
|完整发布包检查|PASS，client/public不含完整发布文件；没有下载API|

开启模式允许网页所需的聚合数值出现在HTML／RSC中，因此扫描明确区分“获授权展示数值”和“私有来源标识／凭据／逐局内容”。关闭模式仍检查原15个数值／路径canary。没有为了通过检查而关闭私人来源扫描。

云端私有HTTPS下载端点尚未配置，故不声称已完成真实Vercel云端下载／部署测试。已验证本机prepare→Next→NFT→生产HTTP完整链路，以及云端输入缺失时构建拒绝路径。

## 8. 浏览器验收

GEN、BLG、CFO和Chovy／Canyon／Ruler／Duro／Kiin，在1440、768、390、320px共32组本地生产页面均正常，无页面级横向溢出，实际显示发布模式数据。

检查了：原有各位置指标布局、真实分布、COMPLETE／PARTIAL提示、资料及英雄池；Chovy样本量／定义互斥、Escape关闭、键盘数据点；GEN的PLAYSTYLE默认4项与展开8项、真实均值差、Draft六类独立样本。控制台无warn/error。测试未发现需要重新设计UI的问题。浏览器尺寸在验收后恢复。

## 9. 修改文件

修改：`.gitignore`、`.vercelignore`、`package.json`、`next.config.ts`、`app/layout.tsx`、`components/team-profile/statistics.tsx`、`lib/team-profile/statistics-server.ts`、`statistics-types.ts`、`scripts/audit-statistics-build.mjs`、`tests/gol-profile-http.mjs`。

新增：

- `lib/team-profile/statistics-projection.ts`：既有聚合投影共用。
- `lib/team-profile/statistics-release.ts`：严格发布schema、引用解包和开关。
- `lib/team-profile/statistics-release-server.ts`：生产固定资源读取。
- `scripts/create-statistics-release.mjs`：可复现选择／一致性检查。
- `scripts/prepare-statistics-release.mjs`、`build-production.mjs`：受控构建输入及原Next构建。
- `scripts/audit-statistics-release-build.mjs`：打包／公开资源检查。
- `tests/statistics-release.mjs`、`statistics-release-http.mjs`：转换与生产路径回归。
- 本报告。

没有修改lib/sim、统计公式、Metric Dictionary、身份、P2-C、原CSV或原英雄池。没有新增数据依赖库（使用现有zod）。

## 10. 复现

以下环境变量由本机设置，私人路径不写入Git；采用Node22及现有依赖。

```sh
# 输出必须在仓库外；已存在且不同内容时拒绝覆盖。
pnpm stats:release "$PRIVATE_P2C_SNAPSHOT" "$PRIVATE_RELEASE_OUTPUT"
pnpm lint
pnpm typecheck
pnpm test
TEAM_STATS_SNAPSHOT="$PRIVATE_P2C_SNAPSHOT" STATISTICS_RELEASE_INPUT="$PRIVATE_RELEASE_OUTPUT" node --import tsx tests/statistics-release.mjs

# 关闭：原功能与私人快照门禁
TEAM_STATS_RELEASE_ENABLED=false pnpm build:vercel

# 本机生产候选；与云端私有HTTPS输入分开。
TEAM_STATS_RELEASE_ENABLED=true TEAM_STATS_RELEASE_INPUT="$PRIVATE_RELEASE_OUTPUT" TEAM_STATS_RELEASE_SHA256="$APPROVED_RELEASE_SHA256" pnpm build:vercel
TEAM_STATS_RELEASE_ENABLED=true TEAM_STATS_RELEASE_SHA256="$APPROVED_RELEASE_SHA256" pnpm exec next start --hostname 127.0.0.1 --port 3023
STATISTICS_RELEASE_INPUT="$PRIVATE_RELEASE_OUTPUT" node --import tsx tests/statistics-release-http.mjs
PROFILE_STATS_RELEASE=1 node --import tsx tests/gol-profile-http.mjs
node --import tsx scripts/audit-statistics-release-build.mjs
STATISTICS_AUDIT_RELEASE=1 TEAM_STATS_RELEASE_SHA256="$APPROVED_RELEASE_SHA256" TEAM_STATS_SNAPSHOT="$PRIVATE_P2C_SNAPSHOT" node --import tsx scripts/audit-statistics-build.mjs
```

最终构建保留为本机开启模式候选，资源仍忽略且不在public；本地测试服务验收后停止。它不改变线上配置。不要直接上传本机整个.next或使用旧.vercel/output执行prebuilt部署。

## 11. P3-C.2执行顺序（本轮不执行）

1. 用户确认本轮代码与候选SHA；保留稳定Tag和私人源数据备份，审阅实际Git差异。不得把候选JSON加入公开仓库。
2. 在有权限的Vercel后台核对实际Production Branch、Root Directory、Node22、`pnpm build:vercel`、Preview自动触发和部署保护。README描述不等于平台事实。
3. 记录当前正常Deployment ID／URL、关联commit、alias和环境配置，并确认当前账户可回滚的范围。本轮未取得这些后台信息。
4. 经用户授权，将**最小候选**放入批准的私有构建存储，确认URL可从Vercel构建机读取、Token及URL有效期覆盖构建。不要上传P2-C包、CSV或研究行。
5. 仅Production设置上表release变量；Preview不继承。对URL返回内容验证SHA。核对构建日志不打印凭据，构建返回正确schema。
6. 再运行全部检查，保存构建记录和数据清单。只有用户授权正式发布后，才推送批准的生产分支或执行确认的单一路径发布；不要Git／CLI双轨重复部署。
7. 推送release分支也可能触发公开Preview；必须先确认其关闭／保护设置。本轮没有推送任何分支或Tag。
8. 平台正式构建通过后核对函数资源及日志，执行下列冒烟，再确认域名对应新Deployment。

### 当前只读结果

origin仍为`https://github.com/louissslyz-byte/worlds-2026-simulator.git`；匿名GitHub main接口返回`60893bb`。线上GEN页面200，新增统计仍不可见，说明本轮未改变线上。Vercel项目API403，项目本地绑定存在，但生产分支、Preview、云端变量、当前Deployment ID／来源commit及回滚权限均待后台确认。本轮未复用本机.env中的旧OIDC凭据登录。

### 部署后冒烟

- 首页／实力榜／模拟器设置／模拟器／模型说明／teams列表和深层链接刷新均200，字体／图片无错误。
- GEN、BLG、CFO及五个位置页面显示批准快照，ⓘ、样本／缺字段、真实分布、PLAYSTYLE和Draft正常；Mobile320／390无溢出。
- 原95人英雄池、Roster、Road To Worlds不变。
- System与Custom完整赛事、Manual Pick保留、分轮／赛段模拟、Reset、冠军及缓存／刷新恢复正常。
- Production启用的是release路径；Preview关闭；原始／完整JSON路径404；HTML/RSC没有私人路径和源记录。

### 回滚

先经用户授权将流量指回步骤3记录的正常Deployment，确认原页面和模拟器恢复；若仅统计资源问题，也可关闭release并重新构建发布，不能仅删资源造成开启状态500。随后在Git用普通revert修复发布提交，避免后续推送再次发布问题版本，不强推、不重写稳定Tag。

保留每次已批准聚合候选／SHA对应关系，回滚代码时同步选择对应数据。私人备份不公开；回滚不能收回访问者已读取的网页聚合数据。

## 12. 停止点

P3-C.1技术适配完成。尚需具体配置私有构建资源、Vercel权限及环境／自动部署／回滚信息；这些是P3-C.2执行条件，不是要求重新调查数据许可。公开Git分发JSON和原始数据库再分发仍未获本轮批准。

不自动进入P3-C.2。没有推送或部署，当前公网版本不变。
