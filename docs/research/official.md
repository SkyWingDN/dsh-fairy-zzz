# 《绝区零》官网子页面调研 — official-researcher (task-1)

> 调研对象：https://zzz.mihoyo.com/main/ 的首页之外页面（角色介绍 / 影像资料 / 新闻资讯 / 设定档案 / 更多下拉 / 新闻详情 / 概念站 / 页脚细节）。
> 测量口径：1440x900 视口、DPR=1、Chrome headless。1rem = 56.25px（html font-size = 3.90625vw，设计基准 1920px 下 1rem=75px）。文中 px 均为 1440 视口实测，括号内为官方 CSS 的 rem 值。
> 采证方式：render.mjs（Node + CDP）逐屏截图 + analysis JSON（colors/fonts/radii/links/sections/elshots + 注入 getComputedStyle 的 title 字段）。因站点为 SPA、导航/卡片大量依赖 CSS :hover 与 JS 事件，部分状态通过注入 :hover 规则副本 + .zzz-hover 类强制复现（见第 9 节）。

---

## 1. 页面清单与信息架构（IA）

### 1.1 路由清单（实测可访问）
| 页面 | URL | title | 内容高度 | 备注 |
|---|---|---|---|---|
| 首页 | /main/ | 《绝区零》官网-3.3全新版本「重返天空的旅程」现已上线！ | 4823 | Lead 已采，不重复 |
| 角色介绍 | /character -> 302 -> /character?id=166519 | 《绝区零》官方网站-卡芙卡 | 730+56 | 65 名角色轮播，默认卡芙卡 |
| 影像资料 | /video | 影像资料 | 2013 | 5 个 tab，6 页 x9 |
| 新闻资讯 | /news | 新闻资讯 | 2101 | 4 个 tab，185 页 |
| 新闻详情 | /news/167206、/news/167166（任意 id） | 文章标题 | 长滚 | 影像类/公告类两种正文 |
| 设定档案 | /world | 设定档案 | 1352 | coverflow 卡，点击进详情（详情页未证实） |
| 概念站（外站） | https://webstatic.mihoyo.com/nap/event/e20220508concept-6oj9/index.html#/ | 来自未知时间的记录——《绝区零》概念站 | 1289 | 沉浸式场景 + CN 页脚 |
| 成长关爱 | https://jiazhang.mihoyo.com/#/ | — | — | 外站 |
| 社区 | https://bbs.mihoyo.com/zzz/ | — | — | 外站 |
| 充值 | 更多下拉内（外站/米游社） | — | — | 未点开证实落地 URL |

导航真实 DOM 是 span 而非 a（点击由 JS 路由），首页 links 里可提取的只有 /video、/news、/world、/character、/news/{id} 与外部页。

### 1.2 顶部导航结构（顺序）
首页 · 角色介绍 · 影像资料 · 新闻资讯 · 设定档案 · 更多▾(充值 / 社区) · 成长关爱系统 · [立即下载] · ♪ · 分享 · 用户

- Logo（绝区零 ZENLESS ZONE ZERO 白色字标）点击回首页。
- 当前所在页 -> 白色胶囊黑字（active）；其余 #787878。
- 「更多」为唯一下拉；「成长关爱系统」是顶级项（不在下拉里）。
- 「立即下载」是荧光黄绿胶囊 CTA，与导航文字同级但单独样式。
- 右侧 3 个圆形图标：BGM 播放、分享（社媒二维码弹层）、用户/登录。
- 首页右缘另有 01–06 竖向分节锚点（首页报告已覆盖）；子页面沿用分区编号 02–05 放在斜切标签里。

### 1.3 每条路由的页面骨架（统一模板）
[固定 header 56px 黑底]
[斜切荧光标签块：中文名 / 英文名 / 两位编号]  [右上角 87.75px Impact 幽灵字]
[主视觉轮播（3 卡 + 圆点）]  <- 角色页则是全屏立绘 + 信息栏
[黑色胶囊 tab 栏]
[3 列内容网格（720px 宽）]
[黑色胶囊分页]
[页脚：社交图标条 + 协议/备案 + 厂牌 logo/徽章]

编号体系：角色介绍=02 / 影像资料=03 / 新闻资讯=04 / 设定档案=05（01 属首页）。

---

## 2. 全局骨架（跨页组件）

### 2.1 Header（.header）
| 属性 | 值 |
|---|---|
| 固定方式 | position:fixed; top:0; height:1rem(56.25px); background:#000; z-index:99 |
| 内容盒 | .header-wrap 19.2rem=1080px，margin auto，padding 0 0.56rem(31.5px)，flex space-between |
| Logo | 2.3x0.54rem（129x30px），白色字标 |
| 导航项 | .header__navbar-link 高 1rem，字号 0.2rem(11.25px)，700，默认 #787878；间距 margin-left 0.4rem(22.5px) |
| 导航 pill | .nav-content 高 0.44rem(24.75px)，圆角 1.2rem(67.5px)=999 胶囊，padding 0 0.1rem，min-width 1.24rem(70px)，transition 500ms |
| hover/active | 背景 #fff、文字 #000、transform: scale(1.12) |
| 立即下载 | .nav-content-download bg #d8fa00、文字 #000（hover 也变白胶囊黑字） |
| 更多箭头 | 0.12x0.1rem 图片，绝对定位 right -0.15rem / top 0.04rem，hover rotate(180deg)；「更多」的文字胶囊被 CSS :not(.nav-content-more) 排除，所以它 hover 时保持灰字，只有箭头转 |
| 右侧图标 | bgm 0.58rem、share margin-left 0.52rem、login margin-left 0.38rem |

### 2.2 更多下拉面板（.nav-content-sub）— 已采证
- 位置：绝对定位于「更多」下方，top 0.9rem(50.6px)，left 50% + margin-left -0.86rem，宽 1.72rem(96.75px)。
- 外观：背景 #111111，圆角 0.05rem(2.8px)（全站最小圆角，硬朗），padding 0.16/0.06/0.06rem。
- 顶部荧光条：::before 通栏高 0.1rem(5.6px)，圆角 0.05rem，背景 #d8fa00。
- 条目：「充值」「社区」，高 0.43rem(24.2px)，字号 0.2rem，色 #787878，圆角 2.8px；右侧 ::after 0.15rem 斜向箭头图标；hover 背景 #3d3d3d、文字 #acacac。
- 出现方式：opacity 0->1（hover 到导航项时）。

### 2.3 固定「返回」侧标签（.back-btn，仅详情页）
- position:fixed; top:3.2rem(180px); right:0; width:0.82rem(46px); min-height:2.88rem(162px)。
- 黑底 + 边框，圆角 0.18rem 0 0 0.18rem（左侧 10px 圆角，右侧贴边直角）。
- 内容：backArrow 0.44x0.36rem(24.75x20.25px) 白色返回箭头 -> 荧光绿「返回」0.4rem(22.5px)，色 rgb(202,249,3)=#caf903（hover 变白）-> 白色 BACK 0.2rem(11.25px)，rotate(90deg)、transform-origin right top 竖排。
- 这是「返回上一层/返回列表」的常驻入口，不随滚动消失。

### 2.4 TOP 按钮（.backTop）
- 位置：接近页脚时出现（--show 时 opacity 1，200ms ease-out，cursor pointer），位于页脚上方右侧（实测约 x1270-1356 / y450-548）。
- 尺寸：1.6x1.8rem（90x101px）整图资源（黑底、仅上缘大圆角，白色圆形线条向上箭头 + 白色 TOP 字）；浅底页面用 .dark 变体 1.12x1.4rem（63x79px），hover 换图（反色）。
- 出现/隐藏：靠滚动位置 JS 切换 class。

### 2.5 页脚（.mihoyo-cn-footer，全站 + 概念站一致）
三段式（黑底 #000）：
1. 社交图标条：9 个白色线性图标横排居中（米游社/抖音/小红书/微博/微信/微博/TapTap/YouTube/链接），约 34-40px，视觉间距约 90px；CSS 里 a 命中区 116x46px、margin-right 15px、background-size 116x46（部分页面变体背景白 + 4px 圆角）。hover 图标变亮/反白。
2. 协议 + 备案：.footer-content 宽 1280px flex；.footer-info margin-left 60px、宽约 870px、行高 24px、色 #aaa、字号 14px。第一行协议链接白色 14px（hover #ccc + underline，左右用 | 分隔）：用户协议 | 隐私政策 | 儿童隐私政策 | 自律公约 | 成长关爱 | 联系我们 | 加入我们（各链真实 URL 见首页调研）。下面依次：健康游戏忠告、沪公网安备、沪ICP备19018275号-4、沪网文〔2025〕0178-050号、国新出审〔2023〕1809号、举报邮箱/电话、防诈电话、未成年成长关爱热线、客服电话、© 2022 米哈游版权。
3. 厂牌 + 资质徽章：左侧 miHoYo / ZZZ STUDIO / 绝区零 三个 logo（分隔线 1x28px #666，footer-logo min-width 300、min-height 94、game-logo 200px）；下方 5 枚资质徽章（上海市互联网违法和不良信息举报中心、网上有害信息举报专区、互联网文化经营单位、2022 net、电子营业执照）。

### 2.6 页面背景与装饰
- 子页面（video/news/详情）主背景 #efefef 浅灰；详情页左上/左下有大块更浅的圆角装饰形（#e8e8e8 类，超大圆角 blob），营造纸张/海报拼贴感。
- 设定档案页是全屏模糊街景照片（黄蓝调、固定背景 background: url(bg.123ba49.jpg) center/cover no-repeat fixed），叠一层顶部内阴影图 inner-top.png（10.3rem x 11.6rem）。
- 角色页是左黑右灰斜切大色块（品红/主题色描边）。

---

## 3. 设计 Tokens（可直接抄）

### 3.1 颜色
| Token | Hex / rgb | 用途 |
|---|---|---|
| accent（荧光黄绿） | #d8fa00 / rgb(216,250,0) | 立即下载 CTA、轮播 active 圆点、标签胶囊底、更多下拉顶部条、更多阵营按钮、斜切标签块 |
| accent-alt（返回绿） | #caf903 / rgb(202,249,3) | 详情页「返回」文字 |
| accent-alt2（设定档案中文） | #c7f603 / rgb(199,246,3) | 世界卡中文名 |
| ink-0 | #000000 | header/footer/黑胶囊/黑描边 |
| ink-1 | #111111 | 更多下拉面板 |
| ink-2 | #222122 / rgb(34,33,34) | 正文主色、tab/分页底 |
| ink-3 | #3d3d3d | 下拉条目 hover 底 |
| page-bg | #efefef | 子页浅灰背景 |
| watermark | #dfdfdf | 右上超大 Impact 幽灵字 |
| gray-nav | #787878 | 未激活导航、下拉条目 |
| gray-nav-hover | #acacac | 下拉条目 hover 文字 |
| gray-body | #7a7a7a | 新闻摘要 |
| gray-desc | #a6a6a6 | 角色引语（hongmengti light） |
| gray-sep | #666666 | 厂牌分隔线 |
| footer-text | #999999 / #aaaaaa | 页脚正文 |
| white | #ffffff | active pill、标题反白 |
| theme-magenta | #df267c | 卡芙卡页面主题色（角色/阵营强调色会随角色变化，格莉丝=红橙） |

### 3.2 字体
- 中文标题/展示：inpin hongmengti（印品鸿蒙黑体，字重 400 但视觉厚重）— 30.375 / 51.75 / 65.25px 等。
- 中文引言/描述：inpin hongmengti light。
- 正文/UI 中文：Microsoft YaHei（400/700/800）。
- 拉丁/数字/水印：Impact（斜体 italic、uppercase）— 日期、编号、VIDEO/LATEST NEWS 幽灵字、英文标签。
- 角色英文名：Mont-Heavy。
- 字距：全站 letter-spacing: normal（靠字体本身与字重撑气势，不额外加 tracking）；英文/数字标签靠 uppercase + 小字号 + 负行高压缩。

### 3.3 字号阶梯（1440 视口实测，rem 值）
| px | rem | 用途 |
|---|---|---|
| 87.75 | 1.56 | 右上幽灵字（Impact italic uppercase） |
| 73.125 | 1.3 | 角色英文名（Mont-Heavy 水印） |
| 65.25 | 1.16 | 斜切标签的大编号 02/03/04/05 |
| 51.75 | 0.92 | 角色中文名（hongmengti） |
| 30.375 | 0.54 | 斜切标签中文标题 |
| 25.875 | 0.46 | 新闻详情主标题（800） |
| 22.5 | 0.4 | 返回「返回」 |
| 18 | 0.32 | — |
| 15.75 | 0.28 | 角色引语（hongmengti） |
| 13.5 | 0.24 | 新闻标题（800）、标签英文、面包屑 |
| 12.375 | 0.22 | 视频/新闻标题（800）、日期（Impact）、tab 文字（800） |
| 11.25 | 0.2 | 导航项（700）、正文段（详情正文）、BACK |
| 10.125 | 0.18 | 新闻摘要 |
| 7.875 | 0.14 | 新闻列表标签（Impact 700） |
| 6.75 | 0.12 | 视频列表标签（Impact 700） |

### 3.4 圆角
- 胶囊：999px（tab 栏 18px 高的一半 -> 0.32rem；导航 pill 67.5px；分页 15.75px）。
- 对角双圆角（标志性）：border-radius: 0 30.94px 0 30.94px（=0.55rem，右上+左下），用于 16:9 缩略图/轮播大卡；卡片外框无圆角或 0.12rem(6.75px)。
- 小圆角：2.8px（下拉面板/条目）、6.75px（世界卡遮罩）、10px（返回标签左侧）。
- 世界卡：0.12rem(6.75px)。

### 3.5 布局网格
- 内容区起点 x=360px（6.4rem），宽度 720px（12.8rem）：3 列 x 223px + 2 x 26px gap（223x3+26x2=721）。
- 分区顶部留白 1.6rem(90px)；斜切标签块 top 90、left -388（宽 557、高 398，只露约 170px 在屏内）。
- 右上幽灵字：top 90px、right 27px。
- 轮播区：大卡 386x207，margin-right 0.76rem(42.75px)，第三张溢出右边界被裁切。
- 垂直节奏（video/news）：轮播图 y≈254 -> 圆点 y≈520 -> tab y≈614（高 36）-> 网格 y≈712 -> 分页（9 项后）-> 页脚。

### 3.6 动效
- 通用过渡：transition: 500ms（导航 pill）、300ms（角色立绘位移、返回文字色）、200ms ease-out（TOP 出现）、卡片 hover scale(1.12)（pill/分页项）、scale(1.1)（箭头图标）。
- 世界卡点击：isClickAnim 让容器 opacity 0（延迟 0.5s）+ cover slideLeft / tape slideRight 各 500ms cubic-bezier(0.39, 0, 0.99, 0.61)，动画完再路由。
- 世界卡 hover：封面 translateX(-34%)、内层 tape translateX(+34%)（像录像带封面被撕开）。

---

## 4. 组件 Anatomy + 状态

### 4.1 斜切分区标签（.section-nav）— 全站最强识别符号
绝对定位：top 1.6rem(90px), left -6.9rem(-388px)，w 9.91rem(557px)，h 7.08rem(398px)
背景 = inner-title.png（荧光黄绿几何块，右缘斜切 + 巨大圆角），文字色 #222122
.inner 绝对定位 right:0，宽 3.02rem(170px)，padding-left .2rem；文字右对齐
  label 中文 0.54rem(30.375px)
  en    0.24rem(13.5px) Impact uppercase，margin-top .06rem，padding-left .04rem
  num   1.16rem(65.25px) Impact，margin-top .06rem
变体 .lg：top 2.98rem, left -3.23rem, 8.45x7.86rem，label .65rem / en .32rem / num 1.86rem
变体 .right：靠右对齐

- 视觉：标签块左缘贴出屏幕外，右缘是「大圆角 + 斜切」复合轮廓，像一张从画面左侧抽出的贴纸；三行文字（中文/英文/编号）右对齐码在露出部分。
- 角色页变体：品红/主题色块（#df267c）+ 白色字；其余页为荧光块 + 深墨字。

### 4.2 顶部幽灵字
- 位置：右对齐、top 90px、right 27px；font: italic 87.75px Impact; color:#dfdfdf; text-transform:uppercase。
- 截图中带深灰偏移副本形成 3D 立体感（类似 text-shadow / 双层字）。
- 内容：VIDEO / LATEST NEWS / CHARACTER / BACKGROUND（与斜切标签的英文呼应）。

### 4.3 主视觉轮播（video/news 通用）
- 结构：3 张大卡横排（第 3 张溢出裁切）+ 下方 5 个圆点 + 左右可滑动。
- 大卡：386x207px（6.86x3.68rem，16:9），对角圆角 0.55rem（右上+左下），overflow hidden；卡片间距 0.76rem(42.75px)。
- 圆点：11.25x11.25px（0.2rem）圆形图片，间距 0.22rem(12.375px)；active 为荧光绿实心，未激活深灰。
- 交互：拖动/箭头切页，圆点同步；卡片可点击进入视频弹层/新闻详情。

### 4.4 黑色胶囊 Tab 栏（.video-tab / .news-tab）
- 容器：高 36px（0.64rem），padding 0 0.2rem，背景 #222122，圆角 18px（999 胶囊）；宽度由 item 数决定（video 5 项≈576px，news 4 项≈461px）。
- 单个 tab：宽 109.7px（1.95rem），高 36px，字号 12.375px（0.22rem），800，白字，居中。
- 状态：默认白字透明底；hover/active -> 文字 #333 + 白色胶囊底图（scale 1.12）。
- tab 文案：video = 最新 / 角色PV / 角色EP&MV / 角色展示 / 过场动画；news = 最新 / 新闻 / 公告 / 活动。

### 4.5 内容卡片（video / news 共用骨架）
| 元素 | 规格 |
|---|---|
| 卡片 | 223x224px（图片 16:9 = 223x125 + 文字区 99） |
| 缩略图 | 223x125.4，border-radius: 0 30.94px 0 30.94px（右上+左下），hover 无缩放（video 实测无 CSS hover 变化） |
| meta 行 | 日期（Impact 12.375px、#000）+ 荧光小胶囊标签（Impact 700，7.875(新闻)/6.75(视频)px，宽≥24.75、高≥8.4，圆角 999，底 #d8fa00、字深色） |
| 标题 | 13.5px / 800 / #222122 / 最多 2 行（video 12.375px/800） |
| 摘要（仅新闻） | 10.125px / 400 / #7a7a7a / 行高约 13.5px / 两行截断（h27） |
| 行距 | 卡片行高间距约 239px（grid 3 列，列宽 223、gap 26） |

- 新闻主页 9 张卡 = 3x3；视频页同样 3x3，6 页。
- 标签语义：video = 角色EP&MV / 版本PV / 角色PV / 角色展示；news = 新闻 / 公告 / 活动。

### 4.6 分页器（.mihoyo-pager-rich）
- 结构：◀ [页码胶囊条] ▶；胶囊条高 29.25px（0.52rem），圆角 15.75px，背景 #222122，居中。
- 数字按钮：min-width 36px，字号 11.25px，白色；当前页/hover -> 白底胶囊 + 文字 #000 + scale 1.12（白胶囊为 36x18 背景图）。
- 前后箭头：36x22.5px 图标按钮，hover scale 1.1。
- 页码规则：video 1–6；news 1 2 3 4 5 … 185。

### 4.7 角色介绍页（/character）— 全屏立绘 + 右栏阵营筛选
布局（1440x730 区域，从 header 下开始）：
- 左侧立绘：.character-cover 900x730px，背景图 auto 13.69rem 宽、left -0.72rem；默认 translateX(-2rem)，激活 slide 时位移归 0（入场滑动 300ms）。
- 斜切主题块：左上品红斜切标签「角色介绍 CHARACTER 02」（同 section-nav 结构，颜色随角色主题）。
- 中央信息列（.character-info，绝对定位 left 12rem(675px)、top 2.14rem(120px)，宽 563px）：
  - 角色名 51.75px hongmengti（黑色，左侧可能带 S/A 级图标 0.79x0.82rem）。
  - 英文名 73.125px Mont-Heavy，浅灰水印，压在名字右下。
  - CV 语音条：221x32px 黑描边胶囊（border:3.4px #000; radius:16.9px），左侧 32px 黑圆播放按钮，白底内文字「CV: 徐慧」15.75px，右侧语言切换黑胶囊 43x17px（中/日/英，白色圆钮滑动）。
  - 属性胶囊：黑色胶囊 68x32px，内 2 个 0.46rem 圆形属性/元素图标，margin-left 0.16rem。
  - 引语：15.75px hongmengti，黑色，宽 563。
  - 描述区：宽 435px（文字 419px），12.375px hongmengti light，#a6a6a6，行高 22.5px；多条引用之间用 1px 竖线分隔（左侧灰竖线）。
  - 底部同阵营角色缩略图条：斜切平行四边形小卡（约 84x48），当前角色有主题色描边，右侧 > 箭头切换。
- 右侧阵营筛选栏（#side-character-camp-selection，164x730，x=1276）：
  - 竖向 swiper，条目 148x204px：阵营徽章图 148x155 + 名称条 118x30（hongmengti 小字，黑底白字/灰字）。
  - 可见徽章：怪啖屋、云岿山、反舌鸟、防卫军·白银小队、天琴座、对空六课、白祇重工、狡兔屋、未明界域、罗斯凯利法…（可上下滚动）。
  - 底部荧光绿「更多阵营」胶囊按钮（黑字）。
  - 交互已验证：点击阵营徽章 -> 切换到该阵营代表角色（如白祇重工 -> 格莉丝·霍华德），页面主题色、立绘、文案整体换肤。
- 角色数据：.cha-swiper-slide 共 65 个；开头顺序：卡芙卡/Kafka -> 知更鸟/Robin -> 挽昼/Sunbringer -> 赛维里安·洛威尔 -> 菲欧妮·蕾法爱菈 -> 洛克茜·伊芙莉塔·普莱斯…；URL 形如 /character?id=166519。
- 切换方式：同阵营缩略图条 / 右栏徽章 / 左右拖拽；切换时 fade 过渡。

### 4.8 影像资料页（/video）
- 顶部：斜切标签「影像资料 VIDEO 03」+ 右上 87.75px 幽灵字 VIDEO。
- 最新轮播：3 张大卡（386x207，对角圆角）+ 5 圆点（active 荧光）。
- Tab：5 项黑色胶囊（见 4.4）。
- 网格：3x3 视频卡；每张 = 16:9 缩略图 + 日期（Impact 12.375）+ 荧光标签（6.75px，角色EP&MV/版本PV/角色PV/角色展示）+ 标题（12.375/800，两行）。
- 分页：1–6，黑色胶囊。
- 点击卡片 -> 原生视频弹层：背景 dim rgba(0,0,0,0.6)，视频区 720x405（16:9）居中黑底，Chrome 原生 controls（播放/时间/音量/全屏/菜单），无 ZZZ 定制皮肤、无可见关闭按钮（原生行为），页面后方变暗。hover 无可见 CSS 效果（无缩放/遮罩）。

### 4.9 新闻资讯页（/news）与详情页（/news/{id}）
列表：
- 结构同 video：斜切标签「新闻资讯 LATEST NEWS 04」+ 幽灵字 LATEST NEWS；3 卡轮播 + 5 圆点；4 项 tab；3x3 卡片（=4.5 骨架，多一行两行摘要）；分页 1 2 3 4 5 … 185。
详情：
- 背景 #efefef，左上/左下超大浅灰圆角装饰形。
- 标题：居中，25.875px/800，#222122，宽 720（x360），y≈203。
- 面包屑条：全宽黑色胶囊（x360->1080，高约 30px，圆角 999），左：「绝区零 >」+ 白色 13.5px 分类标签（新闻/公告），右：日期 13.5px 白色。
- 正文：x360、宽 720；正文 11.25px（0.2rem）/ #222122，行高约 17px，段落间距约 11px；标题段用加粗小标题（公告：【活动时间】【参与条件】【活动说明】）+ 圆点列表。
- 配图：居中，肖像插画约 433px 宽、横版约 575px 宽（不撑满 720）。
- 右侧固定「返回」竖标签（见 2.3）；滚近页脚右下浮出 TOP（见 2.4）。

### 4.10 设定档案页（/world）— Coverflow 录像带卡
- 背景：全屏模糊街景照片（固定 cover），叠顶部装饰图；内容高约 1352。
- 斜切标签「设定档案 BACKGROUND 05」+ 幽灵字 BACKGROUND。
- 中央 coverflow：3 张竖版卡（中间 active 约 300x520px，两侧约 208x364px 且缩小 0.69/0.38、带 rgba(0,0,0,0.8) 黑罩压暗）；卡圆角 6.75px。
- 封面卡（.world__slide-cover，背景 tape-cover.png）：
  - 左上白色 ZZZ logo；
  - 大字英文标题（IMPACT 1rem=56.25px，白色，uppercase）如 THE CITY LIFE / BANGBOO / HOLLOW；
  - 荧光绿中文小字（0.26rem=14.6px，#c7f603）城市生活 / 邦布 / 空洞；
  - 底部灰色摘要：0.18rem(10.1px)、800、行高 1.4、#7a7979，例「新艾利都都有空洞，数量还不少。」
  - 封面右缘有斜切拼贴插画（录像带贴纸感）。
- hover 效果：封面 translateX(-34%)、内层 tape translateX(+34%)——封面左右滑开露出录像带内页（tape 层：5.27x9.62rem 背景 cover-inner.png，内部 tape-name 4.04x2.48rem 旋转 90° 的字块，name-en 0.92rem、中文 0.32rem 800 右对齐）。
- 点击：整组 500ms 滑开/淡出动画后进入详情（详情页未采证，合成 click 无效）。
- 左右黑色胶囊箭头按钮（白色 chevron）居中两侧；当前卡有 cursor pointer。

### 4.11 概念站（外站，氛围型 teaser）
- URL：https://webstatic.mihoyo.com/nap/event/e20220508concept-6oj9/index.html#/
- 单屏 1440x900 场景：复古电视 + VHS 录像机 + 音箱 + 海报/磁带架的沉浸式插画，无任何导航。
- 右下角：浮动分享圆钮 + 黑底小胶囊提示「ⓘ 关注官方社媒，探索更多细节」。
- 下方直接接与官网相同的 CN 页脚（协议/备案/logo/社交图标/徽章）。
- 定位：纯氛围/世界观点题，无功能组件，是「整屏插画 + 最小 chrome」的极端案例。

---

## 5. 可迁移到 DSH 的设计结论（8 条）

1. 荧光黄绿只做 accent，永不铺面。全站 #d8fa00 只出现在：立即下载 CTA、active 圆点、标签胶囊、下拉面板 5.6px 顶条、更多阵营按钮、分区标签块。单屏占比 <5%。-> DSH：--accent:#d8fa00 仅用于主操作（发送/确认）、选中 indicator、// 小标签；不要给大面积背景/渐变。（证据：official-news-scroll-00.jpg / official-nav-hover.jpg；实测色值见 3.1）
2. 导航用「白胶囊黑字 + 1.12 缩放」表达 active，hover 500ms。未激活 #787878；「更多」这类纯菜单触发器不抢 pill（保持灰、箭头转 180°）。-> DSH 顶栏/侧栏的模式切换器、标签页直接复用：active = 白底胶囊，其余灰字。（证据：official-video-scroll-00.jpg；实测 pill 67.5px 圆角/24.75px 高/scale 1.12/500ms）
3. 斜切分区标签是最值得复用的版式符号。负 left 溢出 + 右侧「大圆角+斜切」轮廓（557x398 的块只露 ~170px），内部三行右对齐：中文 30px / 英文 13.5px Impact / 大数字 65px。-> DSH 设置页/插件详情页的 section 标题可用 CSS clip-path 或伪元素做斜切角，成本低、识别度高。（证据：official-video-scroll-00.jpg、official-char-scroll-00.jpg（品红变体）；实测 top 90/left -388/w557/h398）
4. 对角双圆角（0 30.94px 0 30.94px）比统一圆角更有 ZZZ 味。所有 16:9 缩略图/轮播大卡都用右上+左下大圆角。-> DSH 的会话卡片、插件市场截图、附件预览统一 border-radius: 0 20px 0 20px。（证据：official-news-scroll-00.jpg；实测 0 30.94px / 大卡 386x207）
5. 一套黑色胶囊语法统治所有控件。tab 栏（36px 高/999 圆角/#222122/白色 active 胶囊/109.7px item）、分页器（29.25px 高/#222122/白 current 胶囊 36x18）、语音条（32px 黑描边胶囊）、属性胶囊。-> DSH 输入区工具条、模式切换、分页统一到「黑胶囊 + 白色 active 胶囊 + hover scale 1.12」。（证据：official-video-scroll-00.jpg、official-news-scroll-02.jpg（分页）、official-char-scroll-00.jpg（语音/属性胶囊））
6. 字体分工明确：Impact = 数字/拉丁/水印，hongmengti = 中文标题与引语，YaHei = 正文。日期（Impact 12.375px 黑）紧贴荧光小胶囊标签（7.875px Impact 700）是卡片的固定 meta 语法；正文只有 11.25px，靠行高 17px 与 720px 宽控制可读性。-> DSH：数字/版本号/时间用 condensed/Impact 类字体 + 小号荧光胶囊标签，正文保持 12px 左右，别放大。（证据：official-news-scroll-01.jpg；实测 12.375/7.875/11.25px，行高 17px）
7. 页面骨架：左 360px 给斜切标签、右侧 720px 三列网格（223x3+26x2），右上 87.75px 幽灵字，分区顶部 90px 留白。-> DSH 页面容器可以直接采用「88px 标签栏 + 720px 内容列 + 顶部右侧大字水印」的骨架，尤其适合设置/关于/插件页。（证据：official-video-scroll-00.jpg / official-news-scroll-00.jpg；实测起 x360/宽 720/列 223/gap 26）
8. 固定「返回」侧标签 + TOP 的回位设计。返回：46x162 贴右边缘、仅左侧 10px 圆角、荧光绿 22.5px「返回」+ 白 BACK 旋转小字；TOP：90x101 黑色上圆角块，滚动接近页脚时 200ms 淡入。-> DSH 侧栏/抽屉/长页面的「返回」「回顶」两枚浮动控件可照搬形态（DSH 更克制：单枚即可）。（证据：official-news-detail-img-scroll-00.jpg / official-news-scroll-02.jpg；实测 46x162、90x101）
9. 交互节奏：hover 500ms ease + scale(1.12)；coverflow 非焦点卡 80% 黑遮罩压暗、hover 封面滑开 34%、点击 500ms cubic-bezier(.39,0,.99,.61) 后跳转。-> DSH 弹窗遮罩用 60–80% 黑压暗非焦点，动效缩短到 150–200ms 以避免拖慢工作流。（证据：official-char-faction.jpg、official-world-card.jpg；实测 mask rgba(0,0,0,.8)/translate 34%/500ms）
10. 营销页面允许极小字号 + 极大留白 + 大图，但 DSH 是工作界面：保留「meta 行（日期 Impact + 荧光标签）+ 两行摘要 + 大图 16:9」的卡片结构，不照搬 6.75–10px 的字号下限。（证据：official-news-scroll-01.jpg）

---

## 6. 截图与数据索引（C:\Users\SkyWingDN\Desktop\tmp\zzz-ui\shots）

关键截图（前缀 official-）：
- 导航：official-nav-hover.jpg（更多下拉 + 荧光顶条，强制 hover）、official-nav-dropdown.jpg / official-nav-dropdown2.jpg（未展开）、official-nav-download.jpg、official-nav-character-route.jpg
- 角色页：official-char-scroll-00.jpg（卡芙卡全屏）、official-char-scroll-01.jpg、official-char-faction.jpg（格莉丝/白祇重工，红色主题）、official-char-morecamps.jpg、official-char-full.jpg
- 影像资料：official-video-scroll-00..02.jpg、official-video-player.jpg（原生视频弹层）、official-video-hover.jpg / official-video-hover2.jpg（无 hover 变化）、official-video-full.jpg
- 新闻资讯：official-news-scroll-00..02.jpg、official-news-full.jpg
- 新闻详情：official-news-detail-img-scroll-00..03.jpg（/news/167206 影像）、official-news-detail-text-scroll-00..02.jpg（/news/167166 公告）
- 设定档案：official-world-scroll-00..01.jpg、official-world-card.jpg（coverflow 中央卡）、official-world-arrow.jpg、official-world-full.jpg
- 概念站：official-concept-scroll-00..01.jpg、official-concept-full.jpg
- 页脚/TOP/返回：见 news/video 各 scroll 末屏

规格数据（analysis JSON 的 title 字段存放注入的 getComputedStyle dump）：
- official-nav-spec-analysis.json = NAVCSS（header/nav/dropdown/section-nav CSS）
- official-video-spec-analysis.json = VCSS（video 页 CSS）
- official-char-spec-analysis.json = CHARCSS、official-char-spec2-analysis.json = CHARSPEC（65 角色列表/阵营/字号）
- official-news-spec-analysis.json = NEWSSPEC（卡片各元素 bbox + 字号）
- official-world-spec-analysis.json = WORLDSPEC（coverflow CSS）
- 各 <prefix>-text.txt 为页面纯文本（用于核对文案/IA）
- 各 <prefix>-analysis.json 另有 colors/fonts/fontSizes/radii/sections/links/scrollables/elshots。

---

## 7. 覆盖度与遗留
已覆盖：导航（含更多下拉强制 hover 态）、角色页（默认/阵营切换/更多阵营按钮）、影像资料（列表/滚动/分页/视频弹层）、新闻列表 + 两种详情正文、设定档案 coverflow、概念站、页脚/TOP/返回。

未确证（受 SPA/合成事件限制，建议后续真人操作或读 JS 源码）：
1. 「立即下载」点击后的下载弹层（合成 click 无效果，无 /download 路由）。
2. 设定档案卡点击后的详情页（isClickAnim 动画需真实点击；详情路由未知）。
3. 视频卡 hover 是否有 JS 驱动的自动预览（CSS 层无变化）。
4. 「更多」下拉里的「充值」落地 URL；用户/登录图标弹层；分享二维码弹层（.share__list 有 social__qrcode hover 显示，未截）。
5. 新闻「最新/新闻/公告/活动」tab 的真实筛选 URL 参数（可能为 ?category=279/280，未逐一验证）。
6. 移动端/响应式断点（本次只测 1440）。
