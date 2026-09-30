# Worlds 视觉系统

统一样式位于 `app/worlds-design.css`，保留 `globals.css` 既有布局，以展示层覆盖方式渐进应用。字体、颜色、间距、数字层级、圆角、分割线和动画时间均通过 tokens 定义。

## 字体与授权

- 中文短标题：Noto Sans SC 900，Google Fonts text 子集，仅 27.8KB；本地 `noto-sans-sc-display-900.ttf`。使用 optional，避免字体晚到引起布局跳动；缺字回退系统中文字体。仅用于短 Display，不用于正文。
- 英文标题和重要数字：既有 Barlow Condensed 800 Latin WOFF2；不使用 Riot 商业字体。
- UI／正文：Arial + 系统中文 sans；表格 tabular-nums。
- Noto 与 Barlow 均为 SIL Open Font License 1.1；授权随文件存放在 `public/fonts`。
- 来源：https://github.com/google/fonts/tree/main/ofl/notosanssc ，https://github.com/google/fonts/tree/main/ofl/barlowcondensed 。视觉参考 Worlds 2022 官方制作团队案例 https://tendril.studio/work/worlds2022/ ，没有复制官方 KV 或字体。

## 展示组件

- SiteNavigation：读取当前路径，展示 underline 和 aria-current，不改变路由。
- RosterStrip：复用已存在的 rosters 数据，固定五位置顺序。位置为原创单色 SVG，带中文 accessible name；不输出英文位置标签。
- ChampionCard：仅从 tournament state 获取冠军、决赛和对手、Swiss 战绩、淘汰赛路径；未核对的阵容隐藏。System 赛前概率参考来自原有 100k 缓存，Custom 不显示系统概率。
- 冠军视图为深海军蓝终帧、少量金色、156px 队徽、战队简称、决赛比分与横向路径；手机为 3+2 阵容、纵向路径。
- Hover 180ms、赛果 320ms、赛段 400ms、冠军 850ms；尊重 reduced-motion。

赛事引擎、GPR、参赛快照、rating、Monte Carlo 和概率缓存均未修改。
