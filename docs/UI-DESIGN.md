---
version: 1.7.1
name: 绳网终端 / WIRE-NET TERMINAL
description: >-
  《绝区零》官网的表达层语法（纸白/墨黑、荧光青柠 #d8fa00、斜切块、Impact 数字、白胶囊 active）
  与绳网情报站的工作层密度（#0a0a0a 画布、#141614/#1b1d1b 黑面板、1px 低对比描边、12px 圆角、
  1/.58/.40/.24 文本色阶、等宽 // 小标）合成的一套 DSH Web GUI 皮肤。浅色 = 纸面印刷品，
  深色 = 监控台面板；青柠只给行动与选中（整屏 < 5%）；零软阴影，层级靠 1px 描边、0 blur 硬偏移、
  18px 网点与 45° 斜纹。
colors:
  accent:
    light: "#d8fa00"
    dark: "#d8fa00"
    usage: "唯一强调色：主行动填充（新会话/发送）、选中指示、开关 ON；浅色只做填充，不作文本色"
  accent-dim:
    light: "#6f8700"
    dark: "#b6d400"
    usage: "浅色下的文字/链接/描边青柠；深色 hover 与次级强调"
  accent-soft:
    light: "rgba(216,250,0,.22)"
    dark: "rgba(216,250,0,.12)"
    usage: "选中底/标签底/悬停底，最大 22%，不得再叠第二层青柠"
  ink-0:
    light: "#0a0b08"
    dark: "#0a0b08"
    usage: "青柠填充上的文字与图标、选中块文字、深色画布基色"
  ink-1:
    light: "#101110"
    dark: "#101110"
    usage: "浅色正文/标题墨色；浅色主题保留的墨黑侧栏底色"
  ink-2:
    light: "#0a0a0a"
    dark: "#0a0a0a"
    usage: "深色画布（官网 #000 与 wiki #0a0a0a 的折中实测值）"
  paper:
    light: "#efefed"
    dark: "#141614"
    usage: "浅色画布（官网 #efefef 实测）；深色下仅作面板基色"
  panel-0:
    light: "#ffffff"
    dark: "#141614"
    usage: "输入卡、一级面板"
  panel-1:
    light: "#f7f7f3"
    dark: "#1b1d1b"
    usage: "设置面板、次级面板（wiki 面板实测 #1d1f1e）"
  panel-2:
    light: "#111210"
    dark: "#23251f"
    usage: "用户气泡、深嵌块；浅色仍为墨黑，形成纸面里的墨块"
  hairline:
    light: "rgba(16,17,16,.14)"
    dark: "rgba(255,255,255,.10)"
    usage: "1px 描边/分隔线，面板层级唯一结构线"
  text-1:
    light: "#101110"
    dark: "#f2f2ee"
    usage: "主标题/一级正文（不透明度 100%）"
  text-2:
    light: "rgba(16,17,16,.58)"
    dark: "rgba(242,242,238,.58)"
    usage: "次级文字、未选导航、会话行默认"
  text-3:
    light: "rgba(16,17,16,.42)"
    dark: "rgba(242,242,238,.40)"
    usage: "说明、占位、小标；控件允许 .34–.52 的局部微调，但不新增第 5 档"
  text-4:
    light: "rgba(16,17,16,.24)"
    dark: "rgba(242,242,238,.24)"
    usage: "禁用、装饰、最低对比信息"
  amber:
    light: "#ffde00"
    dark: "#ffde00"
    usage: "仅语义：turn 模式气泡头、TTS busy、警告；不参与交互强调"
  blue-fairy:
    light: "#6094ff"
    dark: "#6094ff"
    usage: "Fairy 眼标辉光唯一签名色（drop-shadow rgba(96,148,255,.45–.50)），其他位置禁用"
typography:
  display:
    fontFamily: "Bahnschrift, DIN Alternate, HarmonyOS Sans SC, Microsoft YaHei UI, PingFang SC, system-ui, sans-serif"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: .015em
  section-title:
    fontFamily: "Bahnschrift, DIN Alternate, HarmonyOS Sans SC, Microsoft YaHei UI, PingFang SC, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0
  numeral:
    fontFamily: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif"
    fontSize: "clamp(120px, 14vw, 200px)"
    fontWeight: 400
    lineHeight: .8
    letterSpacing: .02em
  label-mono:
    fontFamily: "Cascadia Mono, Cascadia Code, SF Mono, Consolas, Microsoft YaHei UI, monospace"
    fontSize: 10px
    fontWeight: 700
    lineHeight: 20px
    letterSpacing: .20em
  body:
    fontFamily: "Bahnschrift, DIN Alternate, HarmonyOS Sans SC, Microsoft YaHei UI, PingFang SC, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0
  small:
    fontFamily: "Bahnschrift, DIN Alternate, HarmonyOS Sans SC, Microsoft YaHei UI, PingFang SC, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: "Bahnschrift, DIN Alternate, HarmonyOS Sans SC, Microsoft YaHei UI, PingFang SC, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 22px
    letterSpacing: 0
rounded:
  pill: 999px
  panel: 20px
  xl: 14px
  control: 8px
  row: 6px
  badge: 2px
  bubble: "14px 14px 3px 14px"
spacing:
  base: 4px
  xxs: 2px
  xs: 6px
  sm: 8px
  md: 10px
  lg: 12px
  xl: 14px
  xxl: 16px
  xxxl: 18px
  h1: 20px
  h2: 24px
  h3: 28px
  h4: 32px
  section: 90px
components:
  new-session:
    backgroundColor: "{colors.accent.dark}"
    textColor: "{colors.ink-0}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: 38px
    padding: "8px 12px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-2.dark}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: 34px
    padding: "0 12px"
  session-row:
    backgroundColor: "transparent"
    textColor: "{colors.text-2.dark}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    height: 32px
    padding: "0 8px"
  section-label:
    backgroundColor: "transparent"
    textColor: "{colors.text-3.dark}"
    typography: "{typography.label-mono}"
    rounded: 0
    height: 20px
    padding: 0
  header-tab:
    backgroundColor: "transparent"
    textColor: "{colors.text-3.dark}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.pill}"
    height: 25px
    padding: "4px 12px"
  composer:
    backgroundColor: "{colors.panel-0.dark}"
    textColor: "{colors.text-1.dark}"
    typography: "{typography.body}"
    rounded: "{rounded.panel}"
    height: auto
    padding: "8px 0 6px"
  send:
    backgroundColor: "{colors.accent.dark}"
    textColor: "{colors.ink-0}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: 34px
    padding: 0
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.text-2.dark}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.pill}"
    height: 28px
    padding: "0 10px"
  welcome-hero:
    backgroundColor: "transparent"
    textColor: "{colors.text-1.dark}"
    typography: "{typography.display}"
    rounded: 0
    height: auto
    padding: 0
  hero-badge:
    backgroundColor: "{colors.accent.dark}"
    textColor: "{colors.ink-0}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.badge}"
    height: 19px
    padding: "2px 7px"
  ghost-numeral:
    backgroundColor: "transparent"
    textColor: "rgba(255,255,255,.045)"
    typography: "{typography.numeral}"
    rounded: 0
    height: auto
    padding: 0
  user-bubble:
    backgroundColor: "{colors.panel-2.dark}"
    textColor: "{colors.text-1.dark}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    height: auto
    padding: "10px 16px"
  settings-panel:
    backgroundColor: "{colors.panel-1.dark}"
    textColor: "{colors.text-1.dark}"
    typography: "{typography.body}"
    rounded: "{rounded.panel}"
    height: auto
    padding: 0
  fairy-row:
    backgroundColor: "transparent"
    textColor: "{colors.text-1.dark}"
    typography: "{typography.small}"
    rounded: "{rounded.control}"
    height: auto
    padding: "12px 14px"
  boot-overlay:
    backgroundColor: "{colors.ink-2.dark}"
    textColor: "rgba(216,250,0,.62)"
    typography: "{typography.label-mono}"
    rounded: 0
    height: "100%"
    padding: "22px 26px"
  voice-button:
    backgroundColor: "transparent"
    textColor: "{colors.text-2.dark}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    height: 26px
    padding: 0
---

## 1. Overview

「绳网终端」不是把《绝区零》贴图铺到 DSH 上，而是把两个官方站点各自成立的语言合成一套能每天工作的界面。DSH 原本是低对比的灰白工具外观；改造后它应该读起来像新艾利都（New Eridu）里的一台联网终端机。

**表达层：官网。** zzz.mihoyo.com 首页与子页给的是纸白 #efefef、墨黑 #000/#111111/#222122、荧光青柠 #d8fa00、斜切分区标签、87.75px Impact 幽灵字、白胶囊 active（67.5px 圆角、scale 1.12、500ms）。它的问题是信息密度低、正文只有 11.25px——适合海报，不适合长时间工作。（依据 research/official.md §2–§3）

**工作层：绳网情报站。** baike.mihoyo.com/zzz/wiki 给的是 #0a0a0a 画布、#0d0e0d–#101110 面板、#1d1f1e 卡片、1px #2a2c2b 描边、12px 圆角、单强调 #FFDE00、白字 1/.9/.65/.45/.35、14px 正文、等宽 // 模块小标。它的问题是气质偏资料库，缺少品牌电压。（依据 research/wiki.md §2–§3）

**合成规则一句话：用官网的 chrome 语法包装，装 wiki 的工作密度。** 侧栏、顶栏、输入区、设置、气泡、开场用官网语法（青柠、胶囊、硬偏移、斜切小色块）；字号、色阶、面板层级、行高用 wiki 语法。两者共用的只有三样——1px 低对比描边、单一强调色、等宽 // 标签——所以能粘在一起。

名字与氛围：浅色 = 印在纸上的终端说明书（#efefed 纸面 + 墨黑侧栏）；深色 = 监控台本身（#0a0a0a + 三层黑面板）。同一台机器换光照，不换语法。

版本 1.7.0。范围 = DSH Web GUI 宿主 + dsh-fairy-zzz 插件自有组件；不改变模型、会话与插件功能。已验收证据（1624×1042）：欢迎页 [浅色](img/skin-v17-light-home.jpg) / [深色](img/skin-v17-dark-home.jpg)；会话页 [浅色](img/skin-v17-light-chat.jpg) / [深色](img/skin-v17-dark-chat.jpg)；设置面板 [浅色](img/skin-v17-light-settings.jpg) / [深色](img/skin-v17-dark-settings.jpg)；开场覆盖层 [浅色](img/skin-v17-light-boot.jpg) / [深色](img/skin-v17-dark-boot.jpg)。

## 2. Design principles

1. **青柠只给行动与选中，整屏面积 ≤ 5%。** #d8fa00 只出现在新会话、发送键、选中/焦点指示、开关 ON、boot 小标；不做正文，不做大面积背景。验收：任一张截图取色，青柠像素占比 < 5%，且不存在整块青柠面。
2. **零软阴影建层级。** 主界面面板一律 box-shadow: none；深度 = 底色阶差（#0a0a0a → #141614 → #1b1d1b）+ 1px hairline + 0 blur 硬偏移（3/6/8/14px）。唯一允许的软阴影是深色设置浮层的一层压暗，浅色改为 14px 硬偏移。
3. **纸面与墨黑是同一套语法。** 同一组件两主题只换 token 值，不换半径、字号、间距或布局；浅色侧栏保留墨黑 #111210（v17 截图像素实测 x<280 为 #111111），让纸面主区像「嵌在终端里的一张纸」。
4. **标签一律等宽 + `//` 前缀。** 分区小标、插件字标、boot、气泡标题、欢迎页 kicker 全部 Cascadia Mono、大写、字距 .12–.38em、以 `// `开头。
5. **Impact 只做数字与水印。** 幽灵 05、编号、计数；中文与正文永远系统 sans，不靠斜体伪造品牌感。
6. **不新增 @keyframes、不用毛玻璃、不做 filter 动画。** 只允许 140ms 的颜色/位移；性能合同基线（keyframes 11 / blur 6 / fixed 10）不上升。
7. **浅色不把青柠当文字。** 浅色下青柠只做填充（配 ink-0）；链接、描边、文字改用 #6f8700。验收：浅色截图里不存在 #d8fa00 的文字像素。

## 3. Colors

完整 token 表（深色优先实现，浅色为同一语法的换值）。来源：官网实测色（research/official.md §3.1）、wiki 实测色（research/wiki.md §3.4）、皮肤实现（skin/wire-net-terminal.css L9–31）。

| Token | 深色 | 浅色 | 用途 | 来源 |
|---|---|---|---|---|
| accent | #d8fa00 | #d8fa00 | 主行动填充、选中指示、开关 ON | 官网实测 / skin L10 |
| accent-dim | #b6d400 | #6f8700 | 浅色文字青柠、深色 hover 与次级强调 | skin L11、L25 |
| accent-soft | rgba(216,250,0,.12) | rgba(216,250,0,.22) | 选中底/标签底，最大 22% | skin 选区/映射 |
| ink-0 | #0a0b08 | #0a0b08 | 青柠上的文字、深色画布 | skin L13 |
| ink-1 | #101110 | #101110 | 浅色正文与墨黑侧栏 | skin L26、L77 |
| ink-2 | #0a0a0a | #0a0a0a | 深色画布 | wiki 实测 #0a0a0a |
| paper | #141614 | #efefed | 纸面画布 / 深色面板基色 | 官网 #efefef、skin L14 |
| panel-0 | #141614 | #ffffff | 输入卡、一级面板 | skin L15/L28 |
| panel-1 | #1b1d1b | #f7f7f3 | 设置面板、次级面板 | wiki #1d1f1e、skin L16 |
| panel-2 | #23251f | #111210 | 用户气泡、墨黑深嵌块 | skin L208/L211 |
| hairline | rgba(255,255,255,.10) | rgba(16,17,16,.14) | 1px 描边/分隔 | wiki #2a2c2b、skin L17 |
| text-1 | #f2f2ee | #101110 | 一级文字 | skin L20/L26 |
| text-2 | rgba(242,242,238,.58) | rgba(16,17,16,.58) | 次级文字/未选导航 | host 映射 |
| text-3 | rgba(242,242,238,.40) | rgba(16,17,16,.42) | 说明/占位/小标 | host 映射 |
| text-4 | rgba(242,242,238,.24) | rgba(16,17,16,.24) | 禁用/装饰 | host 映射 |
| amber | #ffde00 | #ffde00 | turn 气泡头、TTS busy、警告 | wiki #FFDE00、skin L12 |
| blue-fairy | #6094ff | #6094ff | Fairy 眼标辉光（唯一签名色） | skin L200/L271 |

**面积纪律。** 青柠填充 < 5%；accent-soft 的选中底 ≤ 22%；amber 只在语义处；blue-fairy 只允许出现在眼标的 drop-shadow。文本只有 4 档，控件实现中存在 .34/.44/.50/.52/.62 等中间值，视为 text-3/text-2 的局部微调，新增组件不得再引入第 5 档。

**状态色只给语义**（来自 theme.overrideTokens，见 §14）：error #ff5a45 / #c8301f、success #c8f24a / #3f6b00、warn #ffde00 / #8a5a00、idle #7c7f78 / #8a8c85。它们不承担强调角色。

**透明与玻璃。** 不引入 backdrop-filter；透明只用于 rgba 描边、焦点环（rgba(216,250,0,.10–.55)）与选区。深色 text-3 为 .40、浅色为 .42，是 v1.7 实现的既有差异，尚未统一（见 §13）。

## 4. Typography

**字体栈（唯一事实来源 client.js L666 与 skin/wire-net-terminal.css L18）。**
- 中文/正文/展示：`"Bahnschrift","DIN Alternate","HarmonyOS Sans SC","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif`。Bahnschrift 承担拉丁与数字的压缩感，中文回落到 HarmonyOS Sans SC / 雅黑。
- 等宽：`"Cascadia Mono","Cascadia Code","SF Mono",Consolas,"Microsoft YaHei UI",monospace`。只用于 `//` 标签、boot、气泡头、chip、时间与计数。
- Impact：`Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif`。**仅**幽灵数字与水印，永不用于正文或标题。

**字号阶梯（全部为宿主或皮肤实测值）。**

| px | 出现位置 | 依据 |
|---|---|---|
| 10 | section label、kicker、H.D.D. 徽章、boot 小标 | skin L111/L181/L191/L310 |
| 11 | header tab、composer chips、插件按钮 | skin L136/L164/L256 |
| 12 | 设置导航标题（mono）、插件说明 | skin L227；client.js L829 |
| 13 | 设置 navCell、插件标签 | skin L228；client.js L828 |
| 14 | 正文、导航、会话行、新会话 | host 14/22；skin L101 |
| 16 | 设置内容标题、宿主标题 | host `_title` 16/500/24 |
| 26 | 欢迎页 display | host `.WOwLGG_headline` 26/500/32；skin 改 700 |
| clamp(120,14vw,200) | 幽灵 05 | skin L197 |

**字距。** 10px 等宽小标 .20em（section label）与 .30em（kicker、boot）；boot 音效 .24em；bubble head .20em；navTitle .18em；徽章 .12em；header tab .05em；chips .03em；display .015em；正文 normal。英文标签靠 uppercase + 字距撑气势；中文正文不额外加字距。

**中英混排。** 中文用 400/500（标题 700，不用 800），不使用斜体；英文标签全大写，正文英文保持 normal；数字优先等宽（天然 tabular）或 Impact；`//` 后固定一个半角空格再接内容；中文标点用全角，不混排半角逗号。

## 5. Layout

**宿主实测三栏。**
- 侧栏：280px（v17 截图 1624 宽下，x=280 处出现 #111111 → #efefed 的硬边界）。
- 中栏：内容列 = host `clamp(680px, 64%, 920px)`，composer 上限再 +32px；v17 截图中 composer 卡片实测 x=502–1392（约 890px，与交接的 892px 相符）。
- 浮层：设置面板 `min(880px, 92vw)`，`max-height: min(780px, 86vh)`，radius 20（skin L220–225）。

**骨架。** 顶栏 `.an3WzG_header` min-height 76、padding 10 28 0 20、1px 下边线；侧栏 root padding 6 12、logo 行高 52；设置面板 header 58、nav padding 18 12、content padding 20 24。这些是宿主结构，皮肤只换颜色与描边，不改网格。

**间距节奏。** 4 为基准：2（kbd/徽章内）、6（行内 gap）、8（行 padding/卡 padding）、10（bubble 纵向）、12（会话/侧栏 padding）、14（fairy 行 padding）、16（bubble 横向/弹窗 padding）、18（设置 nav 纵向）、20（content/圆角）、24（content 横向）、28（顶栏右 padding）、32（大块留白）、90（官网分区节奏，仅供水印/幽灵对齐参考）。

**欢迎页构图**（welcome 区域，实测见 v17 两张首屏）：
- 中央单列：kicker 在标题上方 24px（`top:-24px`），标题 26/32 居中，H.D.D. 徽章与标题同一行（宿主 gap 12px 10px），标题下 13px 处一条 42×3 的青柠斜切下划线。
- 右侧幽灵 05：`right:2.5%; top:4%`，Impact、clamp(120,14vw,200)、透明度 .045（浅色 .06），z-index 0，可被 composer 左缘遮住一部分。
- composer 紧贴标题下方，宽度 890–892px；其下是空白画布，不留其他卡片。
- 结论：欢迎页只允许「一组居中文案 + 一个输入卡 + 一个幽灵数字」，不要加导航卡片或插画。

## 6. Elevation & Depth

**层级表（由深到浅，深色值 / 浅色值）。**

| 层 | 深色 | 浅色 | 用途 |
|---|---|---|---|
| 画布 | #0a0a0a | #efefed | body 背景 + 网点/斜纹 |
| 一级面板 | #141614 | #ffffff | 输入卡、dock |
| 二级面板 | #1b1d1b | #f7f7f3 | 设置弹窗、侧栏浮层 |
| 深嵌块 | #23251f | #111210 | 气泡、kbd、嵌入块 |

**替代手段与禁用场景。**
- **1px hairline**：所有面板、行、输入的唯一结构线；深色 rgba(255,255,255,.10)，浅色 rgba(16,17,16,.14)。禁用：>1px 的彩色描边（除 focus ring）；禁用：双描边。
- **0 blur 硬偏移**：新会话 3px 3px 0 rgba(0,0,0,.55)；插件气泡 6px 6px 0 rgba(0,0,0,.55)；浅色 composer 6px 6px 0 rgba(16,17,16,.07)，focus 时 8px 8px 0 rgba(216,250,0,.55)；浅色设置面板 14px 14px 0 rgba(16,17,16,.10)。禁用：给列表行、导航、tab 加硬偏移（会变成贴纸墙）。
- **斜切块**：42×3、skewX(-24deg) 的青柠下划线（skin L186）；只做标题下划线与小色块，禁用：整块背景斜切。
- **胶片孔**：官网的胶片/斜切母题。本期只在 boot 的 3px 扫描线里暗示，未做成独立组件；禁用：给面板打装饰性圆孔。
- **18px 网点**：`body::after` 固定层，radial-gradient 1px/1.4px，opacity .5，浅色 rgba(16,17,16,.10)，遮罩从中心向外淡出。禁用：放进面板内部或文字正下方（摩尔纹）。
- **45° 斜纹**：`body::before`，pitch 11px、线宽 1px、透明度 .028（浅色 .035 墨线）。禁用：叠加到卡片上、与网点同时高密度出现。
- **扫描线**：仅 boot 层，0/1px 暗线 3px 循环 + 径向压暗到 rgba(0,0,0,.72)。禁用在主界面。

**唯一的软阴影**是深色设置浮层：`0 0 0 1px rgba(0,0,0,.55), 0 40px 90px -44px rgba(0,0,0,.95)`，作用是「把监控台面板从纸面/画布上抬起」。它不能下放到普通卡片。boot 的 `blur(42px)` 是既有启动视频滤镜，不属于新增。

## 7. Shapes

**圆角阶梯。**

| Token | 值 | 用途 |
|---|---|---|
| pill | 999px | 新会话、发送、tab、chip、导航/会话行、开关 |
| panel | 20px | composer 卡、设置弹窗 |
| xl | 14px | 基础气泡（宿主的 radius-xl） |
| control | 8px | fairy 行、小卡 |
| row | 6px | 会话行、设置 navCell、输入框 |
| badge | 2px | H.D.D. 徽章、官方下拉面板级小角 |
| bubble | 14px 14px 3px 14px | 用户气泡（右下角切平 = 指向说话人） |

**斜切角。** 官网母题是 `border-radius: 0 30.94px 0 30.94px`（0.55rem，右上+左下，用于 16:9 缩略图与轮播大卡，official.md §3.4）。在 DSH 里**不套用到宿主卡片**——20px 面板 + 30.94 对角圆角会打架；降级为两种小形态：标题下 42×3 的 `skewX(-24deg)` 斜切条、以及徽章/小标签的直角边（radius 2）。禁用：把 30.94px 对角圆角直接套在设置弹窗或 composer 上。

**45° 条纹与网点**是纹理而非形状（见 §6）；圆形只用于头像、发送键、voice、开关滑块（50%）。

## 8. Components

以下规格默认引用深色侧；浅色差异行内标注。选择器为 DSH 0.2.1-rc.5 / 插件 1.7.0 的 hash 类名，风险见 §12。

**8.1 new-session / 新会话** — 侧栏唯一常驻青柠填充。height 38、padding 8 12、margin 0 2 12、radius {rounded.pill}、bg {colors.accent.dark}、text {colors.ink-0}、font 14/500/22、border 1px #000、硬偏移 3px 3px 0 rgba(0,0,0,.55)；hover #f4ffb8；kbd/分隔符降为 rgba(10,11,8,.66)。（skin L89–98；host L1623）

**8.2 nav-item / 一级导航** — 胶囊行。height 34（宿主 36 压到 34）、padding 0 12、radius {rounded.pill}、text {colors.text-2.dark}；hover 底 rgba(255,255,255,.07) + 文字 text-1；选中 = 纸白 #f2f2ee 底 + ink 字 + 2px 青柠 inset（官网白胶囊 active 的同款语法）。（skin L100–108）

**8.3 session-row / 会话行** — height 32、padding 0 8、radius {rounded.row}、text .58；hover 底 rgba(255,255,255,.06)；选中 = 青柠 12% 底 + inset 2px 0 0 青柠 + 文字 text-1。选中行不再加其他装饰。（skin L117–122）

**8.4 section-label / 分区小标** — 等宽 10/700/.20em/uppercase、text-3、line-height 20；::before 为青柠 `// `。它是 ZZZ 语汇出现频率最高的符号，任何新分区都必须复用。（skin L110–115）

**8.5 header-tab / 顶栏 tab** — radius {rounded.pill}、padding 4 12、mono 11/.05em、默认 text-3（.44）；active = #f2f2ee 底 + ink 字；浅色反相（#101110 底 + #f2f2ee 字）。宿主 tab 高 25，skin 只改形状不改高度。（skin L134–142；host L1732）

**8.6 composer / 输入卡** — radius {rounded.panel}、bg {colors.panel-0.dark}、border 1px #2b2d28、box-shadow none；:focus-within 边框 rgba(216,250,0,.55) + 3px 光环 rgba(216,250,0,.10)；浅色 = #fff + 6px 硬偏移，focus 时 8px 青柠硬偏移。内部：输入区 padding 4 8 0 14、min-height 36（hero 52）、row padding 2 8 6、gap 12。（skin L145–175；host L1827–1857）

**8.7 send / 发送键** — 34×34 圆、radius {rounded.pill}、bg {colors.accent.dark}、图标 {colors.ink-0}、host translateY(-2px)；hover #e6ff52 + translateY(-1px)；disabled opacity .4。它是「青柠只给行动」规则的最强示范。（skin L151–156；host L1867）

**8.8 chip / 工具胶囊** — workspace/seat、PTC 模式统一 radius 999、mono 11/.03em。workspace/seat 加 1px rgba(255,255,255,.13) 描边 + text-2，hover 描边变 rgba(216,250,0,.45)；trigger 类默认 .50，hover 到 text-1；浅色描边 rgba(16,17,16,.18)。（skin L163–175）

**8.9 welcome-hero / 欢迎主标题** — 26/32、700、.015em、text-1；::before 为 `// NETWORK TERMINAL 05`（mono 10/600/.30em，rgba(216,250,0,.72)，top -24 居中）；::after 为 42×3 青柠斜切条（bottom -13）。浅色 kicker 改 #6f8700、标题 #101110。（skin L179–204）

**8.10 hero-badge / H.D.D. 徽章** — 青柠填充 + ink 字、border 1px #000、radius {rounded.badge}、mono 10/700/.12em、line-height 15、padding 2 7。它是「官网斜切标签 + wiki 稀有度角标」的最小合成，只出现在标题右侧。（skin L189–194）

**8.11 ghost-numeral / 幽灵数字** — 内容 `05`，Impact、clamp(120,14vw,200)、line-height .8、.02em、rgba(255,255,255,.045)（浅色 rgba(16,17,16,.06)）；定位 right 2.5% / top 4%、z-index 0、pointer-events none；与标题同属 welcome 根节点，可被 composer 遮住。（skin L195–203）

**8.12 user-bubble / 用户气泡** — bg #23251f、border 1px rgba(255,255,255,.09)、radius {rounded.bubble}、padding 10 16、font 14/22；浅色强制 #111210 底 + #f5f5f0 字。assistant 回答不使用气泡（宿主原文排版），只继承 conversation 文字色。（skin L207–217）

**8.13 settings-panel / 设置弹窗** — width min(880,92vw)、height auto、max-height min(780,86vh)、radius {rounded.panel}、bg #1b1d1b、border 1px rgba(255,255,255,.10)、压暗阴影；浅色 #fff + 14px 硬偏移。内部：header 58、nav padding 18 12 + 1px 右边线、navTitle mono 12/.18em、navCell 40/radius 6/13px，**active = 青柠底 + ink 字 + 700**（含 icon），content padding 20 24。（skin L220–243）

**8.14 fairy-row / Fairy 设置行** — 插件自有。.fz3-set gap 14；行 flex space-between + gap 16、padding 12 14、radius {rounded.control}、透明底 + 1px rgba(255,255,255,.10) 描边；标题 15、副文 11.5/.48；switch 42×24/radius 99，OFF 近黑底 + 冷灰描边，ON 青柠底 + ink 滑块 translateX(18)；按钮 radius 999 + mono 11，hover 青柠填充 ink 字。（client.js L821–849；skin L247–296）

**8.15 boot-overlay / 开场覆盖层** — 全屏 #0a0a0a；::before 左上 `// H.D.D. NORTH SEEK DATA SYSTEM`（mono 10/600/.30em，rgba(216,250,0,.62)，left 26/top 22）；::after 为 3px 扫描线 + 径向压暗；视频降饱和 grayscale(.30) contrast(1.06) brightness(.92) saturate(.90)；skip 按钮 mono/.22em/青柠 .62。（skin L299–324）

**8.16 voice-button / 语音按钮** — 26×26 圆、透明底/透明描边、图标 15；hover = 青柠 10% 底 + 青柠 .35 描边、无发光；play 态青柠；busy 态 amber。发光只保留给 Fairy 眼标，voice 不得抢签名色。（skin L332–334；client.js L983–991）

## 9. Motion

- **统一时长 140ms。** button、a、[role=button]、[role=treeitem] 的 transition-duration 强制 .14s；输入卡 focus 走宿主 .12s；不允许 `transition: all`。
- **hover 清单。** 新会话 → 底 #f4ffb8；导航行 → 底 rgba(255,255,255,.07) + 文字 text-1；会话行 → 底 .06；chip → 描边青柠 .45；发送 → 底 #e6ff52 + 位移 -1px；设置 navCell → 底 .06；关闭键 → 底 .08；voice → 青柠 10% 底 + 描边 .35。
- **选中态无过渡。** 导航行换纸白底、会话行加青柠 inset、设置 nav 换青柠底都是直接切换，不做颜色渐变以外的动画。
- **禁用**：新增 @keyframes；scale 1.12（官网营销节奏，DSH 只用 -1px 位移）；blur()/backdrop-filter；全屏闪烁；动画 width/height/top/left；加速既有 boot 淡出（600ms 保持）。
- **预算**：keyframes 11、blur 6、position:fixed 10 是插件性能合同基线，只允许持平或下降。

## 10. Do's and Don'ts

### Do
- Do: 选中会话用 2px 青柠 inset 条 + 12% 青柠底，让「当前」在低对比侧栏里一眼可辨。
- Do: 新会话、发送这类主动作用青柠填充 + #0a0b08 文字。
- Do: 用 1px hairline + 底色阶差区分面板，而不是投影。
- Do: 每个分区标题写成 `// WORKSPACE` 式的等宽小标，字距 .20em。
- Do: 浅色主题保留墨黑侧栏（#111210），让纸面像被嵌在终端里。
- Do: 浮层用 1px 描边 + 0 blur 硬偏移（浅色），深色设置浮层允许单层压暗。
- Do: 过渡只给颜色与 1px 位移，统一 140ms。
- Do: 数字用 Impact（水印/编号）或等宽（计数/时间），让数字比文字更像仪表。

### Don't
- Don't: 给面板加 box-shadow 软阴影（除深色设置浮层）。
- Don't: 用青柠做正文或链接文字（浅色用 #6f8700，深色只给 .72 透明度的极小标签）。
- Don't: 让青柠面积超过 5%，或把青柠做成渐变铺底。
- Don't: 新增 @keyframes、blur、backdrop-filter、mix-blend-mode。
- Don't: 把官网 30.94px 对角圆角直接套到宿主卡片上。
- Don't: 用 amber 当第二个交互强调色——它只表态（turn / busy / 警告）。
- Don't: 靠放大字号表达层级；用 text-1…4 的色阶。
- Don't: 在浅色把侧栏改成纸白，那会丢掉「终端」叙事。

## 11. Responsive

本期皮肤**尚未写 media query**（见 §13）；以下是下一版必须落地的降级清单，属设计约定而非实测。

- **≥1200px**：全量形态，ghost 用 14vw。
- **<1200px**：ghost 保持 clamp 下限 120px；设置面板吃 92vw；composer 侧留白按宿主 16px；kicker 文案不变；45° 斜纹 pitch 不变。
- **<900px**：隐藏 ghost 05（避免压住 composer）；kicker 缩短为 `// WIRE-NET 05`；45° 斜纹透明度 .028 → .015；18px 网点 opacity .5 → .35；composer dock inset 8；设置面板 max-height 86vh；侧栏收成 36px rail（宿主行为）。
- **<640px**：单列；气泡 padding 10 14、radius 不变；发送键保持 34px 触控下限；header tab 退回宿主 13px（mono 11 在触屏过小）。

## 12. Implementation notes

- **优先 data-slot 稳定锚点。** 皮肤已使用 [data-slot="sidebar.workspaces"]、[data-slot="sidebar.footer.action"]、[data-slot="main.conversation"]；新增规则必须先找 data-slot / role / aria，再考虑类名。
- **hash 类名是最大风险。** wtg9ga_（侧栏）、wnFoaW_（会话行）、GRgSLq_（composer）、WOwLGG_（欢迎页）、AnXs9G_（设置）五组前缀来自 DSH 0.2.1-rc.5 的 CSS Modules，宿主升级即可能失效。回退：用 notes/host-classes.json 与 scripts/dsh-tree.mjs 重生成 DOM map；每个 hash 选择器配一条 data-slot/role 回退；失效时优先保侧栏与 composer，欢迎页装饰可暂缺。
- **theme.overrideTokens 共 41 键 × 2 主题**（交接写 40，实测 41）：① 基础面 4（bg-base / layer-1 / layer-2 / overlay）；② 描边 4（border-l1..l4）；③ 文本 4（label-primary…quaternary）；④ 交互 2（interactive-bg-hover / -hover-solid）；⑤ 状态 6（state-error/idle/success/warn/business-primary + business-tertiary）；⑥ 按钮 3（button-elevated-fill / info-fill / info-hover）；⑦ 专属 6（specific-sidebar-fill / bubble / input-major / selector / sidebar-nav-item-active / -hover）；⑧ 滚动与代码 3（scrollbar-bg-l2 / scrollbar-hover-l2 / markdown-code-block）；⑨ 阴影 2（elevation-soft / prominent）；⑩ 圆角 6（xl / panel / lg / md / sm / xs）。**风险**：--dsw-alias-brand-primary 被改写为青柠/橄榄，会影响所有引用 brand 的宿主与第三方插件，升级时需优先核对。
- **主题驱动**：html[data-fz3-theme="light"|"dark"] 由插件写值；两套 token 分别位于 :root 与 html[data-fz3-theme="light"]（skin L9–31）。宿主自身主题类不参与决策，避免双写冲突。
- **浅色保留墨黑侧栏的理由**：① v17 截图像素实测侧栏 #111111；② 官网浅色子页仍有纯黑 header/footer，黑 chrome 是固定语法；③ 纸面主区 + 墨黑侧栏形成「印刷品嵌进监视器」的叙事；④ 侧栏不再出现青柠/纸白大面，长时工作更稳。
- **焦点与滚动**：:focus-visible = 2px rgba(216,250,0,.75) 外描边 + offset 2（浅色改 #101110）；**例外**：附件缩略图（`[class*="_thumbnail"]`）在 64px 高的 overflow 横条内，外环会被上下裁成两条竖条，故改 `outline-offset:-2px` 内嵌环；缩略图本体 = 墨黑底 + 1px rgba(255,255,255,.14) 描边，hover 描边转青柠，移除按钮 = 墨黑底 + 青柠描边 + 纸白图标（浅色反相）；滚动条 8px、radius 999、thumb 青柠 42%（浅色墨 26%）、2px 透明 border + background-clip；::selection 深色青柠底 ink 字 / 浅色墨底青柠字；caret 颜色随青柠。
- **不改布局变量**：不覆盖 --dsh-chat-content-width、--dsh-composer-card-max-width、--dsh-sidebar-inline-padding，让宿主继续负责宽度与断点。

## 13. Known gaps

- 未单独压测的宿主区域：右侧详情栏 .xeixwq_details、命令面板、toast/通知、模型选择下拉、附件预览、代码块 toolbar、diff 视图。
- 会话页截图为 v1.7 审计快照（skin-v17-light-chat / skin-v17-dark-chat）：采集时 2403 步长会话在无头 Chrome 中会卡死渲染线程，故使用会话页快照而非最终重建轮截图；侧栏、顶栏、气泡、composer 与 token 实测一致，未覆盖长会话滚动性能。
- 5 组 hash 类名（wtg9ga_ / wnFoaW_ / GRgSLq_ / WOwLGG_ / AnXs9G_）尚未全部补 data-slot 回退。
- Responsive 清单未实现（无 media query）；幽灵数字隐藏、斜纹减淡目前只是约定。
- 胶片孔母题未落地为组件，只在 boot 扫描线中暗示。
- 深色 text-3 .40 与浅色 .42 的不一致未统一；部分控件存在 .34/.44/.50 等中间透明度，尚未收敛为 token。
- 未验证：移动端触控（voice 26px 是否过小）、boot 视频滤镜在低性能机上的开销。键盘 focus 已在 v1.7.1 专项验证：附件缩略图内嵌环完整，但尚未逐控件走完整链路。

## 14. 设计 token ↔ 宿主变量映射

| 设计 token | 浅色 | 深色 | 宿主变量 | 用途 |
|---|---|---|---|---|
| paper / canvas | rgba(239,239,237,.94) | rgba(10,10,10,.90) | --dsw-alias-bg-base | 页面画布 |
| panel-0 | #ffffff | #141614 | --dsw-alias-bg-layer-1 | 输入卡/一级面板 |
| panel-1 | #ffffff | #1b1d1b | --dsw-alias-bg-layer-2 | 设置面板 |
| overlay | rgba(250,250,247,.99) | rgba(7,8,7,.98) | --dsw-alias-bg-overlay | 浮层底 |
| hairline | rgba(16,17,16,.12) | rgba(255,255,255,.10) | --dsw-alias-border-l1 / -l3 | 普通描边/分隔 |
| hairline-strong | rgba(16,17,16,.20) | rgba(255,255,255,.16) | --dsw-alias-border-l2 | 输入/卡片描边 |
| text-1 | #101110 | #f2f2ee | --dsw-alias-label-primary | 一级文字 |
| text-2 | rgba(16,17,16,.58) | rgba(242,242,238,.58) | --dsw-alias-label-secondary | 次级文字 |
| text-3 | rgba(16,17,16,.42) | rgba(242,242,238,.40) | --dsw-alias-label-tertiary | 说明/占位 |
| text-4 | rgba(16,17,16,.24) | rgba(242,242,238,.24) | --dsw-alias-label-quaternary | 禁用/装饰 |
| accent-dim | #6f8700 | #d8fa00 | --dsw-alias-brand-primary | 链接/品牌强调 |
| accent | #d8fa00 | #d8fa00 | --dsw-alias-button-info-fill | 主行动填充 |
| accent-hover | #c6e800 | #e4ff3d | --dsw-alias-button-info-hover | 主行动 hover |
| accent-soft | rgba(216,250,0,.22) | rgba(216,250,0,.14) | --dsw-alias-state-business-tertiary | 选中底 |
| amber | #8a5a00 | #ffde00 | --dsw-alias-state-warn-primary | 警告/turn |
| error | #c8301f | #ff5a45 | --dsw-alias-state-error-primary | 错误 |
| success | #3f6b00 | #c8f24a | --dsw-alias-state-success-primary | 成功 |
| idle | #8a8c85 | #7c7f78 | --dsw-alias-state-idle-primary | 空闲/中性 |
| sidebar | #111210 | #101110 | --dsw-specific-sidebar-fill | 侧栏（两主题都墨黑） |
| bubble | #ffffff | #23251f | --dsw-specific-bubble | 气泡底（浅色实际被 #111210 覆盖） |
| input | #ffffff | #141614 | --dsw-specific-input-major | 输入卡底 |
| selector / nav | rgba(16,17,16,.05) | rgba(255,255,255,.06) | --dsw-specific-selector / -sidebar-nav-item-* | 加号底 / 导航态 |
| hover | rgba(16,17,16,.05) | rgba(255,255,255,.06) | --dsw-alias-interactive-bg-hover | 通用 hover |
| scrollbar | rgba(16,17,16,.25) | rgba(216,250,0,.35) | --dsw-alias-scrollbar-bg-l2 | 滚动条 |
| code-block | #f4f4f0 | #0e0f0e | --dsw-alias-markdown-code-block | 代码块底 |
| elevation-soft | none | none | --dsw-elevation-soft | 平面层级 |
| elevation-prominent | 0 0 0 1px rgba(16,17,16,.14), 12px 12px 0 rgba(16,17,16,.10) | 0 0 0 1px rgba(255,255,255,.08), 0 30px 70px -40px rgba(0,0,0,.95) | --dsw-elevation-prominent | 浮层抬起 |
| radius-panel / xl / lg / md / sm / xs | 20 / 14 / 12 / 8 / 6 / 3px | 同左 | --dsw-radius-panel … -xs | 面板/气泡/控件/行/徽章 |

> 口径：宿主变量是「机制」，本文 token 是「设计意图」。同名映射之外的场景以 §3 的面积纪律为准，不以变量名为准。

## 15. v1.7.1 修整（设计侧记录）

v1.7.0 上线后按用户截图修了 6 类回归，其中 4 条改的是「设计纪律」而不是单纯 bug，后续改皮肤必须遵守：

1. **覆盖要最小化。** 设置弹窗 v1.7.0 覆写了 width / height / padding / border / font-size，结果按钮位置错位。现在只换 background + box-shadow，导航分栏线用 `box-shadow: inset -1px 0` 代替 border，几何（800×800 / 188px nav / 40px 行高 / 54px header）全部归还宿主。→ 皮肤只负责「颜色、描边、圆角、字体、装饰」，布局尺寸与断点归宿主。
2. **外扩焦点环有边界条件。** 全局 `:focus-visible` 的 offset 2 在 overflow 容器边缘会被裁剪（表现为两条竖条）。凡是 64px 级小控件（缩略图、徽章）一律用内嵌环 `outline-offset:-2px`。
3. **覆盖层必须是一次性的。** 开机 / 问候覆盖层是整屏半透明层，只要在用户已经进入工作态后重播，就会给整屏染色（用户看到的是「UI 颜色错误」）。`bootPlayed` 必须存到 window（模块级变量在插件 disable→enable 后会重置）。
4. **token 覆盖要能撤销。** `theme.overrideTokens` 返回 disposer；静态客户端插件不会自动清理，必须自己 `ctx.effect` 释放，否则禁用插件后宿主仍被 44 个 `--dsw-*` 变量染色。
5. 装饰层（boot 左上角小标、kicker 染色）不比原生信息重要：用户嫌「突兀」就删，不要为了「像 ZZZ」加戏。

### 验证快照（v1.7.1，深色，1624×1042）

- 欢迎页：![v171 home](img/skin-v171-dark-home.jpg)
- 附件缩略图焦点（内嵌环，右侧为移除按钮）：![v171 thumb focus](img/skin-v171-dark-thumb.jpg)
- 插件页关闭再启用后（无覆盖层重播、侧栏选中行为纸白胶囊 + 左端青柠弧）：![v171 plugin on](img/skin-v171-dark-plugin-on.jpg)

## 16. 截图索引

- 皮肤（欢迎页）：[浅色](img/skin-v17-light-home.jpg) / [深色](img/skin-v17-dark-home.jpg)（1624×1042，含侧栏、欢迎页、composer、幽灵 05）。

  ![skin light home](img/skin-v17-light-home.jpg)
  ![skin dark home](img/skin-v17-dark-home.jpg)

- 皮肤（会话页与设置）：[浅色会话](img/skin-v17-light-chat.jpg) / [深色会话](img/skin-v17-dark-chat.jpg) / [浅色设置](img/skin-v17-light-settings.jpg) / [深色设置](img/skin-v17-dark-settings.jpg)。

  ![skin light chat](img/skin-v17-light-chat.jpg)
  ![skin dark settings](img/skin-v17-dark-settings.jpg)

- 皮肤（开场覆盖层）：[浅色](img/skin-v17-light-boot.jpg) / [深色](img/skin-v17-dark-boot.jpg)。
- 官网表达层参考：[ref-zzz-main-00](img/ref-zzz-main-00.jpg) 至 [ref-zzz-main-06](img/ref-zzz-main-06.jpg)（1440×900 七屏，取青柠、白胶囊、斜切、幽灵字、Impact 编号）。
- wiki 工作层参考：[ref-wiki-home-00](img/ref-wiki-home-00.jpg) 至 [ref-wiki-home-04](img/ref-wiki-home-04.jpg)（1440×900 五屏，取三层黑面板、1px 描边、// 小标、黄色选中胶囊）。
- v1.7.1 修整快照：[深色欢迎页](img/skin-v171-dark-home.jpg) / [缩略图焦点环](img/skin-v171-dark-thumb.jpg) / [插件页重启用](img/skin-v171-dark-plugin-on.jpg)（见 §15）。
- 实现参考：皮肤样式全文见 [skin/wire-net-terminal.css](skin/wire-net-terminal.css)；宿主 DOM/类名清单见 [research/host-classes.json](research/host-classes.json)。
