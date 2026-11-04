# 绳网情报站（ZZZ Wiki）设计调研

> 目标站点：https://baike.mihoyo.com/zzz/wiki/ （米哈游官方《绝区零》WIKI「绳网情报站」）
> 采集环境：Windows / headless Chrome 1440×900 DPR1（移动端 390×844 DPR2），工具 C:/Users/SkyWingDN/Desktop/tmp/zzz-ui/scripts/render.mjs
> 采集日期：2026-11-05 ｜ 研究员：wiki-researcher（task-2）
> 全部截图：C:/Users/SkyWingDN/Desktop/tmp/zzz-ui/shots/wiki-*.jpg；结构数据（colors/fonts/radii/cssVars/elshots）在同目录 wiki-*-analysis.json。
> 说明：站点为 Nuxt + Element UI，PC 端整页包在内部滚动容器 .root__scroll-body 中，固定 60px 顶栏 + 固定背景涂鸦图。所有截图 URL 均加 ?mhy_presentation_style=fullscreen 以获得无外框完整页面。

---

## 0. 页面清单（已采集）

| # | 页面 | URL | 类型 | 截图前缀 |
|---|------|-----|------|----------|
| 1 | 门户首页 | /zzz/wiki/ | 门户 | wiki-portal-*（5 屏 + full） |
| 2 | 首页（Lead 侧同页） | 同上 | 门户 | wiki-home2-*（5 屏） |
| 3 | 游戏图鉴·代理人 | /channel/map/2/43 | 列表（5 列卡） | wiki-agents-* |
| 4 | 游戏图鉴·音擎 | /channel/map/2/45 | 列表（6 列卡） | wiki-weapons-* |
| 5 | 游戏图鉴·邦布 | /channel/map/2/44 | 列表（5 列卡） | wiki-bangboo-* |
| 6 | 游戏图鉴·驱动盘 | /channel/map/2/46 | 列表（2 列行卡） | wiki-drive-* |
| 7 | 游戏图鉴·敌人 | /channel/map/2/65 | 列表（5 列卡） | wiki-enemies-* |
| 8 | 地图收集 | /channel/map/2/97 | 列表（2 列行卡） | wiki-map-* |
| 9 | 档案·壁纸收录 | /channel/map/13/98 | 列表（2 列行卡） | wiki-wallpaper-* |
| 10 | 代理人详情·浮波柚叶 | /content/1386/detail | 详情（角色） | wiki-detail-yuye-* |
| 11 | 代理人详情·赛维里安·洛威尔 | /content/2217/detail | 详情（角色） | wiki-detail-sev-* |
| 12 | 音擎详情·涅槃初翎 | /content/2259/detail | 详情（道具） | wiki-detail-weapon-* |
| 13 | 移动端首页 390×844 | 同上 | 移动端 | wiki-mobile-*（4 屏） |
| 交互 | 筛选下拉展开 / 搜索输入 / 头像登录弹窗 / 右侧导航抽屉 | 同上 | 状态 | wiki-agents2-dropdown.jpg、wiki-portal-search.jpg、wiki-portal-avatar.jpg、wiki-portal-nav-drawer.jpg |

其余快捷导航入口（仅取 URL / 未逐页截图，供后续补采）：材料 /channel/map/2/47、空洞见闻 /channel/map/6/7、活动攻略 /channel/map/66/71、萌新指南 /channel/map/66/70、攻略合集 /content/2281/detail。

---

## 1. 信息架构（IA）

### 1.1 顶栏（固定 60px，纯黑）
    [miHoYo logo 90×60] │ [米游社·绝区零 99×60]    [搜索条 360×34 胶囊]      [头像 36×36 圆]
     x=120                x=221                     x=894 y=13                 x=1284 y=12
    [绳网情报站]（文字导航，x=341..421）

- 类名：.header / .header__logo / .header__title / .header__nav / .header__right / .search-header / .search-bar / .search-bar-input / .header-user / .header-user__avatar-wrap。
- 搜索框：999px 胶囊，深灰底（比页面背景略亮），左侧放大镜 16px，占位文字 14px rgba(255,255,255,.45)；输入后右侧出现「✕ 清空」+ 黄色「搜索」文字按钮（.search-btn:hover{color:#FFE84D}），见 wiki-portal-search.jpg。
- 头像：36px 圆形，::after 1px 描边，hover 时描边变黄（.header-user:hover .header-user__avatar-wrap::after{border-color:#FFDE00}）。点击头像不会开站点菜单，而是拉起米哈游登录弹窗（见 5.12）。
- 搜索面板另有完整状态（DOM 中存在）：.search / .search__header / .search__cancel / .search__associative-list / .search__result-list / .search__history / .search__result-empty(-img/-tip) —— 空状态为「插图 + 提示文案」，历史搜索为词条胶囊列表。本次仅捕获到输入态（点搜索按钮后面板未在 1s 内绘制，见 §9 限制）。

### 1.2 首页模块序列（自上而下）
1. Hero 轮播 840×360：宣传图（邦布图鉴 / INTER-KNOT 试运行公告等），右下角圆点指示器；公告图带橙色「⚠ 试运行公告」贴纸。
2. 快捷导航 6×2 宫格（12 入口）：代理人、音擎、邦布、驱动盘、攻略合集、地图收集 / 壁纸收录、空洞见闻、敌人、材料、活动攻略、萌新指南。
3. 更新日志精选：2×2 卡片轮播（可露出第 3 张），每卡 = 80×80 头像 + 标题 18px/700 + 「♟ N个编者」+「◷ 最近更新：日期」；底部圆形箭头 + 细进度条。
4. 游戏图鉴：12 个 tab（代理人/音擎/邦布/驱动盘/小游戏/敌人/材料/地图/委托/成就/街道/录像带）+ 4 个筛选下拉 + 5 列角色卡。
5. 空洞见闻：5 个 tab（迷宮诡境/鸣徽图鉴/事件图鉴/噩音大断居/迷失之地）+ 3 列 × 2 行「图标 + 名称」条目卡。
6. 攻略推荐：2×2 卡，左列 3 条子链接，右侧 ZENLESS 透明插画。
7. 档案：7 个 tab（角色视频/游戏视频/式舆防卫战/危局强袭战/壁纸收录/好感壁纸/前瞻情报）+ 4 列视频卡（16:9 缩略图 + 标题 12px）。
8. 考据漫谈：2×2 图文卡（150px 图 + 18px 标题 + 12px 描述）。

### 1.3 右栏（340px，内宽 306px）模块
关于Wiki（内联简介面板，不是弹窗）→ 更新日志（4 条：日期 11.04 + 标题 + 作者 +「新建/编辑词条」）→ 热点活动（黄色「活动日历」胶囊按钮 305×28 黑字；活动卡 306×112，带「⏱ 还剩11天1小时」黄色倒计时）→ 调频（4 个卡池卡，「还有6天9小时1分钟18秒」黄色倒计时 + 48px 图标）→ 绳网贡献榜（周榜/月榜/总榜；行 = 名次 01/02/03… + 40px 头像 + 昵称 + 贡献值）→ 扫码下载米游社 APP 卡（黄色角标 + 二维码）。
- 右栏模块标题 18px inpinHongmengti，左侧同样有「///」斜线装饰；「全部 >」在模块右上角。

### 1.4 右侧悬浮「导航」
- 收起态：右缘竖向黑色小标签（竖排「导航」+ « 双箭头），约 x=1410..1440、y≈470..570；另有随内容绝对定位的 .side-toolbar（76×173，含 .side-toolbar__outline 72×169 与两个 .side-toolbar__icon 72×90 / 72×79），承载「导航 / 反馈 / 返回顶部」竖排按钮。
- 展开态：.newMap 固定定位右侧抽屉 256×840（y=60 起、通高），底色 #2A2C2B，直角、无阴影、无遮罩；收起时 transform: translateX(256px) 滑出屏外。内部 .new_map_container 25px 左内边距，35 个 .new-item：
  - 一级行 h≈32，14px/700 rgba(255,255,255,.9)，左侧 16px chevron；
  - 当前一级项 = 黄色 999 胶囊（≈211×30）黑字（见 wiki-portal-nav-drawer.jpg 的「首页」）；
  - 二级行 h=33–41，缩进 24px，前置 5px 圆点，14px/700 .65，选中黄色；
  - 内容与站点目录同源：首页 / 更新日志精选 / 游戏图鉴（代理人…录像带 12 项）/ 空洞见闻（迷宮诡域、鸣徽图鉴、事件图鉴、噩音大断层、迷失之地）……
- 抽屉为 hover/JS 触发（本次用样式强制展开后截图；正常入口为右侧「导航」标签）。

### 1.5 列表页 IA（/channel/map/{a}/{b}）
    [面包屑 12px .45]  首页 / 游戏图鉴
    [左：目录面板 250px]                 [右：内容面板 943px]
     目录 24px 标题                        「代理人」24px 标题
     游戏图鉴(一级,黄色胶囊)               筛选行：4 个胶囊下拉
      · 代理人(选中黄字+▸)                 ┌─ 5 列卡片网格（无限滚动，无分页）─┐
      · 音擎 / 邦布 / 驱动盘 / 小游戏 …
     空洞见闻 / 攻略推荐 / 档案 / 考据漫谈（可折叠组）

- 一级分组可折叠：游戏图鉴 / 空洞见闻 / 攻略推荐 / 档案 / 考据漫谈；折叠组标题行高 48–56px，展开后二级项行高 48px（14px/700）。
- 选中态：一级 = 黄色胶囊底 + 黑字（高 40–48，圆角 999）；二级 = 黄色文字 + 黄色 ▸ 三角；未选中 = rgba(255,255,255,.65) + 前置小圆点。
- 无分页控件：列表用底部无限滚动加载（.channel-detail__list 内部滚动 sh≈3437 / ch≈766）。

### 1.6 详情页 IA（/content/{id}/detail）
    面包屑 首页 / 游戏图鉴 / 音擎
    ┌ Hero（约 480–520px，全出血到右缘）────────────────────────────┐
    │ [196×196 图标/立绘卡 + 底部稀有度色条]   角色/道具名（64px）    │
    │ 阵营/副标题（33px）                                            │
    │ 2×2 信息胶囊 [属性|物理] [职业|支援] [出生日期|11/2] [身高|162cm]  │
    └────────────────────────────────────────────────────────────────┘ 右侧 sticky 锚点目录（基础信息/角色介绍/技能展示…，选中=黄胶囊）
    ┌ 正文面板 x120..1320（1200 宽）─────────────────────────────────┐
    │ 「/// 基础信息」模块标题 22px + 右上「⋮」                       │
    │ 折叠块（角色CV / 扩展）19px 标题 + 展开▾                        │
    │ 技能展示：6 个 72px 圆形 icon（选中黄环）+ 技能 tab 胶囊 + 视频  │
    │ 突破材料：10/20/30/40/50 突破 tab + 材料 icon 64px + 数量       │
    └────────────────────────────────────────────────────────────────┘
    底部固定评论条（胶囊输入 + 评论数 242）

- 角色页 Hero 背景按角色主题色渐变（浮波柚叶=粉红、赛维里安=蓝），右下角压 S RANK 橙章。
- 正文：14px Microsoft YaHei / PingFang，rgba(255,255,255,.65)，行高约 1.8；关键字高亮 #FADB14（如「物理伤害」），属性名按元素色（火=红）着色。
- 音擎详情页（wiki-detail-weapon-*）复用同一模板：196 图标卡 + 名称 + 基本信息 tabs（音擎展示/装备动画/专属特效）+ 效果表 + 突破材料 pills + 材料图标表。
- 右侧锚点目录与列表页左目录同款选中样式（黄色胶囊 + ▸），强复用。

---

## 2. 布局与栅格

| 区域 | 实测值 |
|---|---|
| 画布 | 1440×900；页面背景为固定 .pc_page_bg 黑灰 ZZZ 涂鸦大图（1104×840） |
| 顶栏 | 高 60px，纯 #000，全宽固定 |
| 内容容器 | x=120 → 1320（宽 1200），左右留白 120 |
| 主栏（首页） | 840px（x=120..960） |
| 栏间距 | 20px |
| 右栏 | 340px（x=980..1320），面板内宽 306（17px padding） |
| 右缘浮窗 | x≥1344（.side-toolbar）/ 抽屉 256 覆盖右缘 |
| 首页面板 | 圆角 16–18px，1px #2A2C2B 描边，底色 #0D0E0D–#101110（比背景涂鸦略亮） |
| 面板内边距 | 首页主模块 32px；右栏 17px；列表右面板 32px |
| 模块间距 | 24–32px（首页 28–32，右栏 24） |
| 列表页两栏 | 左 250（120..370）+ 间距约 8 + 右 943（377..1320） |
| 首页内部滚动 | .root__scroll-body（内容高 3749，可视高 840） |
| 列表页滚动 | .channel-detail__list（3437/766）与左目录 .map-catalog（1066/766）双容器独立滚动 |
| 移动端 | 390×844 DPR2，单列流式，卡片 3 列，.root__scroll-body 内容高 5082 |

层级（由深到浅）：

    页面背景：黑灰大涂鸦（fixed，图像层）
    面板：#0D0E0D ~ #101110，1px #2A2C2B，radius 12–18
    卡片/行卡：#1D1F1E，1px #2A2C2B，radius 12
    内嵌条目/表格行：近黑 #0A0A0A 或 rgba(0,0,0,.2~.9)，1px #333534
    悬浮胶囊按钮/下拉：#0A0A0A 底 + 1px #333534

> 没有明显投影（box-shadow）用于面板分层，全靠「底色差 + 1px 低对比描边 + 圆角」；阴影只出现在浮层（登录弹窗）。

---

## 3. 设计 Tokens（cssVars 实测）

### 3.1 强调色 / 功能色
| Token | 值 | 用法 |
|---|---|---|
| --general-function-yellow | #FFDE00 | 主强调色：选中态、当前 tab、CTA、倒计时、榜单名次、目录选中胶囊 |
| hover 亮黄 | #FFE84D | 搜索按钮 hover、技能 tab hover、表格展开 hover |
| 正文高亮 | #FADB14 | 详情正文关键词（技能倍率/属性名） |
| orange | #F1AD3D | 次级强调、活动/公告贴纸（⚠ 试运行公告） |

### 3.2 稀有度（rank）
| 等级 | 纯色 | 渐变 |
|---|---|---|
| S / golden | #FFB500 | linear-gradient(180deg,#FD9300,#F25300) |
| A / purple | #E900FF | linear-gradient(180deg,#D73CEB,#8A1FE3) |
| B / blue | #00A9FF | linear-gradient(180deg,#5EC1F6,#527BF4) |
| 其他 | green #7DA89B | metal linear-gradient(90deg,#ABABAB,#808080) |

### 3.3 元素色（属性）
physics #FFDE00（物理，正好与主强调同黄）、fire #FB5421、electric #2CACF1、ice #98EFF0、ether #FF4483。

### 3.4 文本 / 背景 / 描边 / 圆角
| 类别 | 值 |
|---|---|
| 文本白阶 | rgba(255,255,255,1 / .9 / .65 / .45 / .35)（主标题/正文标题/正文/辅助/禁用） |
| 文本黑阶 | rgba(0,0,0,.9 / .65 / .45 / .25)（黄底/白底上的文字） |
| 背景 | #000（header、名称条）×48、#0A0A0A（卡片/下拉）×32、rgba(0,0,0,.2)×20、#1D1F1E（卡片/行卡）×15、#2A2C2B（导航抽屉、浅一层面板）×5 |
| 描边 | 1px #2A2C2B（最常用，面板/卡）、1px #333534（胶囊控件）、1px #000（图内分隔）、3px #494949（详情信息胶囊） |
| 圆角 | 12px（卡片/条目，81 处）、4px（角标 S/A/B）、6px、8px（下拉项 hover）、16–18px（大面板）、999px（所有胶囊：tab/筛选/按钮/选中目录）、50%（头像/圆形按钮） |
| 字距 | 全站 letter-spacing: normal（无扩展字距） |

---

## 4. 字体层级

| 用途 | 字号/字重/字体 |
|---|---|
| 分区标题（模块） | 24px / 400 / inpinHongmengti，rgba(255,255,255,.9)，左侧「///」斜线小图标 + 8–10px 英文副标 |
| 角色名 H1（详情） | 64px / inpinHongmengti（「浮波 柚叶」实测 278×86） |
| 阵营/副标题 | 33px / inpinHongmengti .9 |
| 详情正文模块标题 | 22px / inpinHongmengti +「///」 |
| 折叠块标题 | 19px 加粗 |
| 右栏模块标题 | 18px / inpinHongmengti |
| 卡片标题（更新日志/活动） | 16–18px / 700 |
| 列表卡片名 | 14px / 700 rgba(255,255,255,.9)（名称条高 32–40px，黑底） |
| 正文/链接/标签 | 14px / 400–700（系统栈 -apple-system, PingFang SC, Microsoft YaHei） |
| 辅助（日期/编者/描述） | 12px / 400 .45–.65 |
| 数字/名次/倒计时 | impact 16–20px 或 12px/700 黄色（榜单 01/02、剩余时间） |
| 极少数 | 10px（角标）、13px/700（技能 tab）、16px/700（tab 选中） |

- 字体族计数（首页）：-apple-system 系统栈 ×1370、inpinHongmengti ×59、Microsoft YaHei UI ×53、Impact ×18（数字）、Arial ×17。
- 标题一律 inpinHongmengti（Q 版粗黑体），长正文用系统 sans（PingFang/雅黑）；数字/排名用 Impact 做「数据感」。
- 字号分布印证「14px 为绝对主力」：14/700×122、16/400×99、14/400×99、24/400×74、12/400×53、16/700×37、12/700×26。
- Tab 规格：16px inpinHongmengti，选中 #FFDE00 + 2–3px 黄色下划线，未选 .65；高 36px、间距 16–20px。
- 注：Lead 规格里的 100px display 在 Wiki 页面未出现；本站最大实测 64px，Hero 大字为图片而非文本。

---

## 5. 组件与状态（anatomy）

### 5.1 面板标题装饰「///」
- 结构：[/// 斜线图标 20×20，白色 .9] + 中文标题 24px + 右下 8px 英文小字（如 SECTIONS），标题后还可跟一个细「／」分隔符。
- 位置：所有模块左上角；右栏用 18px 版本。
- 作用：把「区块」视觉化，替代色带；配合 32px 上间距形成节奏。

### 5.2 Tabs
- 文字型 tab（游戏图鉴/空洞见闻/档案）：16px，选中黄字 + 黄下划线（2–3px，宽=文字宽），未选 .65，无背景；行高 36px。
- 胶囊型 tab（详情页 突破 10/20/…、技能切换、音擎展示）：999px 胶囊高 30–32px，内边距 14–16px；选中 = 黄底 + 黑字 700，未选 = 近黑底 #0A0A0A + 1px #333534 + 灰字 .65；hover 背景 #FFE84D（技能 tab）或文字变黄（el-tabs）。
- 贡献榜 tab：文字型，选中黄字 + 黄下划线，与上面一致。

### 5.3 筛选下拉（胶囊 select）
- 收起：999px 胶囊 193×38，底 #0A0A0A，1px #333534，内文 14px .65，右侧 chevron 12px。
- 展开（wiki-agents2-dropdown.jpg，实测成功）：下方浮出深色面板（近 #1D1F1E，1px 描边，圆角 8–12），宽与胶囊同宽略宽（≈199），行高 42px，左内边距 20；选项「全部 / S / A」；右侧为单选圆圈：选中 = 黄圈 + 黄 ✓，未选 = 灰空心圆；选中文字为白色（hover 整行 rgba(255,255,255,.08)）。
- 打开动效：chevron 翻转；点击胶囊本身即可展开。

### 5.4 卡片（代理人/邦布/敌人）
- 网格：5 列，列 pitch 182px，卡宽约 146–164（含内边距），行 pitch ≈240–253；图片约 3:4，底部名称条 32–40px 纯黑。
- 角标：
  - 稀有度方章 20×20，radius 4，白字/粗体，S=橙渐变 #FD9300→#F25300，A=紫渐变，B=蓝渐变；位于立绘左上，略外扩。
  - 元素标 20px 圆形（属性色底 + 元素图形）；其下特性/职业标 20px。
  - 右上状态 pill「预告 / 复刻 / 前沿」：黄橙渐变底 + 黑粗字 + 黑描边，圆角 6，12px/700；「复刻」为灰底黑字。
- 名称：14px/700 白色 .9，居中；名称条底色 #000。
- hover：类名 hover-border-out hover-border-out--avatar（外层描边动效），另有卡片整体 transform: scale(1.05)（快捷导航同理）与图标白→黄双图切换。
- 音擎卡：6 列，图更方（道具立绘），名称条下缘多一条 2–3px 稀有度渐变色条（金/紫/蓝）。
- 驱动盘/地图/壁纸行卡：2 列，行高 112–117，#1D1F1E 底 radius 12，左 64–154px 图（地图/壁纸为 16:9 缩略图），右侧标题 16px/700 + 描述 12px .45（两行截断）；行间距 20–24。
- 空洞见闻条目卡：3 列×2 行，行卡 254×64，左 36px 图标 + 14px/700 名称，radius 8。

### 5.5 视频卡 / 图文卡
- 档案视频卡：4 列；16:9 封面 + 中部播放钮（圆形深色半透明 + ▶）；标题 12px .65 两行；封面左下角有作者/影片类型 mini pill。
- 攻略推荐卡：2×2，404×176：左侧内嵌 3 行子链接（24px 图标 + 14px 文字），右侧 172px 宽 ZENLESS 插画（透明底）。
- 考据卡：2×2，404×128：左 150px 图 + 18px/700 标题 + 12px .45 描述。

### 5.6 榜单（绳网贡献榜）
- 行：[名次 01..05，Impact 20px，黄色] + 40px 圆形头像 + 昵称 14px/700 + 右侧「N 贡献值」12px .65；行高约 43。
- 前 3 名可加头像描边/底色差异（截图第 1 名头像带黄框）。

### 5.7 倒计时 / 活动卡
- 「⏱ 还剩11天1小时」= 12px/700 #FFDE00，前带时钟图标；
- 调频卡：306×120，#1D1F1E 底 radius 12，标题 14/700 +「还有6天9小时1分钟18秒」黄色 12/700 + 右侧 48px 卡池图标。
- 热点活动卡：306×112，左 72px 方块图 + 标题 14/700 + 说明 12 .45 + 倒计时。

### 5.8 按钮
| 类型 | 规格 |
|---|---|
| 主 CTA 黄胶囊 | 305×28，#FFDE00 底 + 黑字/700（「活动日历」）；全宽撑满右栏 |
| 选中胶囊 | 黄底黑字 700，高 30–48（目录一级/技能 tab/突破 tab） |
| 描边胶囊 | 透明/近黑底 + 1px #333534 + 白 .65/.9 文字；hover 描边变黄（.wiki-consumer-strategy__item:hover{border-color:#FFDE00}） |
| 圆形箭头 | 32px 圆，黄色 #FFDE00 底（轮播左右箭头）/ 深色半透明底 + 白箭头（返回顶部） |
| 图标按钮 | 56×56 / 72×90 圆角 12，深色半透明，白线稿图标；hover 图标变黄 |
| FAB（移动端） | 56px 深色圆 + 黄色 ☰（浮动菜单） |

### 5.9 搜索框
- 收起：360×34 胶囊，rgba(255,255,255,.08) 或近黑底，左侧放大镜，14px .45。
- 激活：输入文字白色 .9；右侧出现 ✕ 与黄色「搜索」；hover 搜索变 #FFE84D。搜索联想项 hover = border-radius:8px; background:rgba(255,255,255,.08)。

### 5.10 详情页专用组件
- 信息胶囊 2×2：label 14px .45–.65（如「属性」）+ 右对齐 value 14px/700 白；底 rgba(0,0,0,.35) + 1px #494949，圆角 6–8，尺寸约 218×34，间距 12。
- 技能圆标：72px 圆形，选中 = 3px 黄环 + 图标满色；未选 = 灰环 + 灰图标；6 个横排，间距 18。
- 技能 tab：13px/700，胶囊高 32，选中黄底黑字，未选 #0A0A0A + 1px #333534；文字前缀「普通攻击：」。
- 视频区：16:9 嵌入 + 右下圆形播放/音量钮；下方黄色圆形左右箭头 32px + 灰色进度条 + 右侧「1 / 16」计数。
- 倍率切换：「伤害倍率 / 失衡倍率」14px/700，选中黄字 + 1px 黄描边胶囊，未选白 .65。
- 突破材料表：tab（10/20/30/40/50 突破）+「晋升材料」卡片（图标 64px + 右上数量角标 + 下方名称 pill）+ 1px 分隔线。
- 底部评论条：固定在视口底部，胶囊输入 1000×44 #1D1F1E + 占位「有什么话想问对词条贡献者说的？」+ 右侧圆形评论图标 + 评论数 242。

### 5.11 浮窗（导航 / 反馈 / 返回顶部）
- .side-toolbar：绝对定位于内容（随滚动），76×173，两个 72×90 / 72×79 圆角 12 深色块，白线稿图标 + 下方 12px 标签「反馈」；「返回顶部」图标为双 V。
- 「导航」竖排标签贴右缘：竖排文字 + « 双箭头，深黑底，圆角左侧 8–12。
- 抽屉见 §1.4（256×840、#2A2C2B、黄胶囊选中）。

### 5.12 登录弹窗（站点唯一弹窗）
- 触发：点击头像。白色卡片（约 440×480，radius 12，浅色投影），居中 + 黑色 60% 遮罩。
- 内部：居中 miHoYo logo → tab「短信登录 / 密码登录」（选中黑字 + 黄色下划线 2px）→ 胶囊输入框（+86 | 手机号，浅灰底 radius 999，高 44）→ 验证码行 +「获取验证码」文本按钮 → 协议勾选 + 黄色链接文字 → 灰色禁用「登录」大胶囊（高 44）→ 底部黄色「遇到问题」。右上 ✕ 关闭。
- 这个弹窗是唯一亮色 UI，与站点黑底形成强对比；动效为缩放淡入。

### 5.13 状态汇总
| 状态 | 视觉 |
|---|---|
| 选中 tab | 黄色文字 + 2–3px 黄下划线（文字型）/ 黄底黑字胶囊（胶囊型） |
| 选中目录 | 黄色 999 胶囊 + 黑字（一级）/ 黄字 + 黄 ▸（二级） |
| 选中筛选 | 胶囊描边变黄 + chevron 翻转；下拉行 hover rgba(255,255,255,.08) |
| hover 卡片 | 1px 黄描边（hover-border-out）/ scale 1.05 / 图标白→黄 |
| hover 列表/链接 | 文字变黄 #FFDE00 / 背景 rgba(255,255,255,.08) radius 8 |
| hover 头像 | 描边变黄 |
| 禁用 | 灰字 .35 / 灰底胶囊（登录按钮 #ccc） |
| 空状态 | 搜索：插图 + 提示（.search__result-empty-img / -tip）；列表无空态（整页无分页，数据直接铺满） |
| 加载 | 图片懒加载（首屏外白块）；未捕获骨架屏 |

---

## 6. 移动端 390×844（wiki-mobile-*）

- 顶部换成米游社 App 壳：白底「米哈游官方社区」+ 蓝色「打开App」按钮（高 60），下方深色站点 header：居中「绝区零Wiki」+ 右侧「编辑词条 / 更多」两个 40px 圆形按钮 + 搜索行（胶囊 +「Wiki频道」按钮）。
- 内容单列全宽：Hero 全宽（≈390×190）、快捷导航 4 列（12 项 3 行，图标 48px，标签 13px/700）+ 黄色短横线分页指示器；模块标题仍 24px；游戏图鉴 tab 横向滚动（无滚动条），筛选 4 胶囊换行；卡片 3 列（≈121×175）；更新日志精选 1 列大卡（横滑，露 1.2 张）；右下角圆形 FAB（56px，深色 + 黄色 ☰）。
- 移动端字体栈同为系统 sans，inpinHongmengti 仅标题；.root__scroll-body 内容高 5082。
- 结论：移动端是「再压缩一档」的同一套 token（黄强调、面板黑、胶囊），并非独立设计。

---

## 7. 可迁移到 DSH 的 8 条设计结论

1. 三层嵌套 + 1px 低对比描边 + 12px 圆角是这套 UI 的基座：页面涂鸦背景 → #0A0A0A 面板 → #1D1F1E 卡片 → rgba(0,0,0,.2) 条目；不需要阴影、不需要毛玻璃。DSH 插件面板可直接映射：--panel-bg（#0d0e0d）/ --card-bg（#1d1f1e）/ --border（1px #2a2c2b）/ --radius（12px）。
2. 强调色纪律：全站只有一个交互黄 #FFDE00，只出现在「当前/可点/关键数值」上（选中 tab、选中目录、CTA、倒计时、名次），占比目测 <8%；语义色（元素/稀有度）只出现在数据本身。DSH 主题里应把荧光黄绿 #d8ff3e 同样限定为「状态色」而非装饰色。
3. 选中态的两套语法：① 黄字 + 2–3px 黄下划线（横向 tab / 榜单）；② 黄底黑字 999 胶囊 + ▸ 三角（纵向目录 / 筛选）。两套并存且稳定复用（首页/列表/详情/抽屉），DSH 侧栏导航可直接用 ②，tab 栏用 ①。
4. hover 三件套：1px 黄描边（卡片/下拉项/头像环）、scale(1.05)（图标宫格/卡片）、背景 rgba(255,255,255,.08) + radius 8（列表项/联想词）。开关量少、反馈明确，适合 DSH 这种密集点击界面。
5. 「///」斜线 + 中英双行小标作为分区标题的固定装饰（24px inpinHongmengti + 8–10px 英文副标）；对 DSH 的可借鉴点是：用等宽小标签「// SECTION」替代粗分隔线，既 ZZZ 又不占空间。
6. 信息密度靠文字色阶而非字号：正文 14px/400，辅助 12px/400 .45，标题 14px/700 .9；白阶严格 1/.9/.65/.45/.35 五档 + 黑阶四档。DSH 的会话列表/设置项可用同一套 opacity 梯度，避免堆字号。
7. 数据语言：数字用 Impact（榜单 01、倒计时）或等宽加大，配合黄色胶囊/笔刷条；「名称条黑底 + 14/700」是卡片列表的统一收口方式。DSH 的统计/缓存/模型参数展示可借用「Impact 大数字 + 黄色 12px 标签」。
8. 双容器固定导航：列表页左侧 250px 目录（可折叠组）+ 详情页右侧 sticky 锚点，复用同一「黄胶囊选中」样式；DSH 设置/文档类页面可用「左目录 250 + 右内容」骨架，比纯 tab 更有层级感。

> 不建议迁移：桌面大面积涂鸦背景（会抢文字）、白底登录弹窗（与黑玻璃体系冲突；DSH 若需弹窗应做「黑玻璃 + 黄描边」版）、无分页无限滚动（DSH 列表需要明确总数与加载状态）。

---

## 8. 截图清单

门户首页：wiki-portal-scroll-00..04.jpg（逐屏）、wiki-portal-full.jpg（全页）、wiki-home2-scroll-00..04.jpg（Lead 侧 5 屏）
首页交互：wiki-portal-search.jpg（搜索输入态）、wiki-portal-search-empty.jpg（搜索面板尝试）、wiki-portal-avatar.jpg（登录弹窗）、wiki-portal-about.jpg（关于Wiki 点击无效证明）、wiki-portal-floatnav.jpg（导航点击前）、wiki-portal-nav-open.jpg / wiki-portal-nav2.jpg / wiki-portal-nav3.jpg（展开尝试）、wiki-portal-nav-drawer.jpg（强制展开的 256px 导航抽屉，最终证据）
列表页：wiki-agents-scroll-00..04 + full、wiki-agents-zoom.jpg（1.8× 放大卡片细节）、wiki-agents2-dropdown.jpg（筛选下拉展开）；wiki-weapons-scroll-00..03；wiki-bangboo-scroll-00..03；wiki-drive-scroll-00..03；wiki-enemies-scroll-00..04；wiki-map-scroll-00..04；wiki-wallpaper-scroll-00..01（以上均有 -full）
详情页：wiki-detail-yuye-scroll-00..05 + full（角色·浮波柚叶）；wiki-detail-sev-scroll-00..05 + full（角色·赛维里安）；wiki-detail-weapon-scroll-00..04 + full（音擎·涅槃初翎）
移动端：wiki-mobile-scroll-00..03.jpg
分析数据：各前缀 *-analysis.json（colors/backgrounds/fonts/fontSizes/radii/borders/cssVars/links/scrollables/elshots）。其中 wiki-portal-analysis.json 与 wiki-agents-analysis.json 的 title 字段被探针覆盖为「class 几何 + hover 规则」JSON（一手证据）；wiki-navprobe3-analysis.json 记录 .newMap 抽屉结构。

---

## 附录 A：站点 hover 规则摘录（原文）

    .header-user:hover .header-user__avatar-wrap::after { border-color: rgb(255,222,0); }
    .header-user__menu-item:hover { border-radius:30px; color:rgba(255,255,255,.65); background:rgba(255,255,255,.08); }
    .search-btn:hover { color: rgb(255,232,77); }
    .associative-word-list__item:hover { border-radius:8px; background:rgba(255,255,255,.08); }
    .kingkong-16-item--pc a:hover { transform: scale(1.05); }
    .kingkong-16-item--pc a:hover img:first-of-type { opacity:0; }
    .kingkong-16-item--pc a:hover img:last-of-type { opacity:1; }        /* 白图标→黄图标 */
    .summary-verti-list li .item__bg:hover { background-color: rgb(255,222,0) !important; }
    .egg-pool__list--voice:hover .egg-pool__audio,
    .egg-pool__list--voice:hover .egg-pool__list--avatar { border-color: rgb(255,222,0) !important; }
    .wiki-basic-component__popover-item:hover { color:#fff; border-radius:8px; background:rgba(255,255,255,.08); }
    .wiki-consumer-roleTalent__slide-tabs__tab:hover { background: rgb(255,232,77); }
    .wiki-consumer-strategy__item:hover { border-color: rgb(255,222,0); }
    .wiki-consumer-eventsFilter__item:hover { border-color: rgb(255,222,0); }
    .el-tabs__item:hover { color: rgb(255,222,0); }
    .collection-item__href > h5:hover { color: rgb(150,124,104); }
    .el-dialog__headerbtn:hover .el-dialog__close { color: rgb(255,222,0); }

## 附录 B：实测几何速查（1440 视口）

| 元素 | x / y / w / h |
|---|---|
| header | 0,0,1440,60 ｜ logo 120,0,90,60 ｜ title 221,0,99,60 ｜ nav 341,0,80,60 ｜ right 894,0,426,60 |
| 搜索条 | 894,13,360,34 ｜ input 935,21,306,18 ｜ 头像 1284,12,36,36 |
| 右栏关于Wiki 面板 | 980,92,340,248 ｜ 标题 997,109,306,26 ｜ 正文 997,147,306,176 |
| 首页主面板 | 120..960（840 宽）｜ 右栏 980..1320 ｜ hero 840×360 |
| 首页内部滚动 | .root__scroll-body 3749 内容 / 840 可视 |
| 列表页标题 | .channel-detail__list-title 411,117,888,72（24px） |
| 左目录项 | 181,241,153×48（14px/700，选中 #FFDE00） |
| 代理人卡名 | 424,460,134×32 → 列 pitch 182（606-424）｜ 行 pitch ≈253 |
| 筛选胶囊 | 193×38 radius 999；展开行高 42 |
| 详情 H1 | 浮波柚叶 120,192,278×86（64px inpinHongmengti） |
| 导航抽屉 | .newMap fixed 256×840 @ right，bg rgb(42,44,43)；一级 24–32 高，二级 33–41 高 |
| 移动端 | 390×844，.root__scroll-body 内容 5082 / 可视 745 |

## 附录 C：方法与限制

- 工具：headless Chrome CDP 渲染，内部滚动容器自动探测；列表页无限滚动，截图取首屏 + 逐屏，未遍历到底。
- 无法真实 hover：hover 态通过「样式表 CSS 规则提取 + DOM 类名（hover-border-out）+ 少数 --click-sel 交互」近似还原；缺 hover 截图。
- 右侧导航抽屉是 hover/JS 触发的滑出层，点击「导航」标签未能在当前工具链下触发，最终通过将 .newMap 的 transform 置 0 强制展开截图；真实动画为 256px 左滑。
- 「关于Wiki」在右栏是内联面板而非弹窗；站点唯一弹窗为登录框（已截图）。
- 空状态：仅从 DOM 类名（.search__result-empty*）确认存在，未拿到可达截图。
- 早期产物 wiki-home-* 保留备用，权威首页图为 wiki-portal-*（与 wiki-home2-* 同页）。
