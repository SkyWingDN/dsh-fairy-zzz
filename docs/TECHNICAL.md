# dsh-fairy-zzz 插件技术说明（v1.3.2）

> 目标读者：**没有参与过本项目、但要继续维护或修改这个插件的人 / AI 智能体**。读完这篇文档，应该能独立定位代码、改功能、打版本、发布到 GitHub，并复现验证。
> 最后更新：2026-11-01，对应版本 v1.3.1（v1.3.0 新增：眼徽用量 / 花费气泡、眼徽拖拽与隐藏、外观三档（跟随 / 深色 / 浅色）、欢迎页文案改写，以及 host 侧 `GET /fairy-zzz/usage` 路由与 5 个稳定性修复；v1.3.1 把拖拽重写为 transform-only + 四边吸附 + 遮挡让位、用量改为预取缓存（点开即显）、气泡支持点外 / Esc 关闭、设置页删掉「（本地 CPU 推理）」后缀；v1.3.2 把拖拽与吸附范围从整个视口收进**会话内容区**（左 = 侧栏右缘、上 = 标题栏底缘，右 / 下 = 窗口边缘），边界在每次 pointerdown 时实时重量；v1.2.1 的死代码清理成果保留）。
> 姊妹文档：[docs/PERFORMANCE.md](PERFORMANCE.md)（性能优化报告：为什么这么改、数据怎么量出来的）。

---

## 0. 一分钟速览

- 插件名 / 包名：`dsh-fairy-zzz`（目录名同样是这个）。
- 它做什么：把 DeepSeek Harness 的 Web UI 换成《绝区零》Fairy 的 H.D.D 终端 —— 整屏开机视频 → 居中问好（按时段播预录语音）→ 收缩成聊天区左缘的常驻眼标；同时提供可选的本地 GPT-SoVITS 朗读（仓库不含模型 / 引擎）。
- v1.3.0 起，眼标还是**交互入口**：点一下弹出「余额 / 今日花费 / 峰谷倒计时」气泡，每轮回答结束自动弹一次「本轮结算」；按住可以拖到任意位置，设置里可隐藏眼标；外观支持跟随宿主 / 强制深色 / 强制浅色。v1.3.1 起拖拽只写眼标自身的 `transform`（rAF 合并，165 Hz 下无长任务），松手会吸附到视口四边（距边 64px 内，角落两轴同时吸），落点被更高 `z-index` 的悬浮组件盖住时沿边让位；气泡点外任意位置或 Esc 即可关闭，dock 后 700ms 预取用量，点开 65–166ms 出数。v1.3.2 再把拖拽 / 吸附限制在会话内容区（不越过左侧栏和标题栏），边界在按下时实时测量，打开会话导致标题栏变高也会自动适配。
- 代码在哪（三处，同步关系见第 2 节）：
  - 实际运行目录：`C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz`（DSH 加载的是这里）
  - 本地 git 仓库：`C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz`（发布用，内容应与运行目录一致）
  - 远端仓库：`https://github.com/SkyWingDN/dsh-fairy-zzz`（public，MIT；release：https://github.com/SkyWingDN/dsh-fairy-zzz/releases ）
- 代码只有三个入口文件：`index.js`（host 侧，Node 路由 / TTS / 情绪 / 用量统计）、`client.js`（浏览器侧，React 组件 + 全部 CSS + 动效运行时）、`cordis.patch.yml`（一行 insert 完成插件装配）。
- 体积（v1.3.2 实测）：`client.js` 154,438 B / 3,180 行；`index.js` 47,855 B / 1,391 行；`package.json` 1.3.2；发布版资源约 5.5 MB（开机视频 2.4 MB）。
- 性能（GPU 数据来自 v1.2.0，v1.2.1 / v1.3.0 / v1.3.1 / v1.3.2 均未触碰渲染路径）：dock 待机 GPU 从 v1.1.1 的约 43% 降到约 5%（同机 165 Hz headless 实测，约 −88%）；主线程约 1–2.5%，首屏运行时下载约 2.9 MB。v1.3.0 新增的用量气泡、主题、拖拽全部是**按需 / 静态**路径，没有新增常驻动画；v1.3.1 的拖拽重写、用量预取、点外关闭同样是交互期 / 低频路径，没有新增常驻开销；v1.3.2 只在 `onCoreDown` 时多量一次侧栏 / 标题栏矩形（一次 `getBoundingClientRect`，拖动期不再读布局），同样无常驻成本（见 14.4）。
- 当前安装的 DSH：桌面 Electron 版（`C:\softs\DeepSeek Harness\resources\app.asar`，0.2.1-rc 系列）。DSH 升级后前端 bundle 的 hash 会变，但插件只依赖**槽位名**和少量 data 属性，通常不需要改。

---

## 1. 版权与来源（改代码前先读）

这是**第三方修改版**，不是官方插件。上游与来源：

| 角色 | 项目 / 人 | 许可 | 本仓库如何使用 |
| --- | --- | --- | --- |
| 原始插件 | [AssassinVIX/fairy-zzz-plugin](https://github.com/AssassinVIX/fairy-zzz-plugin)（B 站 BV1d4HK6eE3g 作者 黑塔小蛋糕） | MIT | 本仓库的代码基础 |
| 眼标 SVG、动画几何与时长、眼闪 / 故障参数 | [Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH)（B 站 BV1SD4C63EZz 作者 橙汁本色） | Apache-2.0，Copyright 2026 Chengzhibense，commit `d639887a386b0de6fef2e61c97dc268631854591` | 眼标 SVG 与动效语义的参考；`FAIRY_EYE_SVG` 里保留了 SPDX 注释 |
| 修改者 / 本仓库维护者 | SkyWingDN | MIT（修改部分） | 性能优化 + 1.1.1 欢迎页品牌位 + 1.3.0 用量 / 拖拽 / 主题 |
| 素材版权 | miHoYo / HoYoverse | — | 开机视频与角色形象；仅个人桌面改造，勿商用 |

对应文件：`LICENSE`（MIT 全文）、`NOTICE-fairy-dsh.md`（上游署名 / Fairy-DSH 声明）、`licenses/Apache-2.0.txt`、`licenses/Fairy-DSH-NOTICE.txt`、`licenses/Fairy-DSH-TRADEMARKS.md`。**改这个插件时不要把这几处署名删掉**，这是许可要求，也是社区约定。

v1.3.0 的用量 / 峰谷口径参考 DSH 桌面端内置用量面板（价目表、高峰时段、2026 年节假日）；host 侧是按同一口径独立实现的，不 import 宿主的内部模块。

---

## 2. 三处目录与同步关系

```text
C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz      ← 安装目录：DSH 从这里加载（运行中）
C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz          ← 本地 git 仓库：改完 push 到 GitHub
https://github.com/SkyWingDN/dsh-fairy-zzz        ← 远端：给用户 clone / 下载
```

- **安装目录**是被 DSH 的 profile 用 `link:C:/Users/SkyWingDN/.dsh/plugins/dsh-fairy-zzz` 引用的（见 `C:\Users\SkyWingDN\.dsh\profiles\desktop\package.json` 的 dependencies）。DSH 桌面端**动态读取**插件文件：改完 `client.js` 后不需要重启，**整页刷新**即可加载新代码（host 的 `index.js` 改动才需要重启 DSH）。
- **本地仓库**是发布副本。约定流程：先改安装目录 → 验证 → 把 `client.js` / `index.js` / 相关资源复制到仓库 → commit → push。
- 仓库里没有 `cache/`（TTS 合成缓存，几十 MB，已在 .gitignore）和 `voice-home.txt`（本机引擎路径，属于隐私，不发布）。仓库也**不含 GPT-SoVITS 权重、参考音频或推理引擎**。

---

## 3. DSH 插件架构（理解这两段就能动手）

### 3.1 两个进程，两段代码

DSH 插件 = host（Node 进程）+ client（浏览器页）。本插件两边都写了，互不 import：

| 侧 | 文件 | 运行位置 | 能做什么 |
| --- | --- | --- | --- |
| host | `index.js` | DSH 主进程（Node） | 注册 HTTP 路由（`ctx.webServer.register`）、读写文件、spawn GPT-SoVITS 进程、读取 Agent 注册表判断"AI 是否在思考"、增量解析会话日志算用量与花费 |
| client | `client.js` | Web UI 页面里 | 注入 CSS、注册 UI 槽位、轮询 host 路由、播音频、渲染 React 组件、拖拽 / 主题 / 气泡 |

### 3.2 装配：cordis.patch.yml

```yaml
- insert:
    - id: fairy-zzz-skin
      name: 'dsh-fairy-zzz'
```

这个 patch 由 `package.json` 的 `dsh.bundle.patch` 声明，安装时合并进 profile 的 `cordis.patch.yml`。它负责让 DSH 在启动时把 `dsh-fairy-zzz` 这个包加载成插件（host + client 各加载一次）。

### 3.3 host 契约（index.js）

```js
export const name = 'fairy-zzz'
export const inject = ['webServer']
export function apply(ctx) { /* 注册路由 ... */ }
```

- `inject: ['webServer']`：声明依赖宿主提供的 `webServer` 服务。
- `apply(ctx)`：插件被启用时调用一次；内部所有 `ctx.effect(() => webServer.register({...}))` 会在卸载插件时自动清理。
- `ctx.get('agents')` 可拿 AgentRegistry，用来判断是否有 agent 正在跑（情绪 / 眼睑状态的数据源，见 `createMoodTracker`）。
- 路由挂在 DSH 自带 web server 上，路径前缀固定 `/fairy-zzz/`；共 8 个注册（第 11 节）。

### 3.4 client 契约（client.js）

```js
window.__ModuleLoader__.load({
  id: 'dsh-fairy-zzz',
  factory(require) {
    const React = require('react')
    return {
      inject: ['slots', 'locale', 'theme', 'remote', 'remote.account'],
      apply(ctx) { /* 注入样式、注册槽位 ... */ },
    }
  },
})
```

- 页面加载插件时由宿主的 ModuleLoader 调用 `factory`；`require('react')` 拿到的是宿主提供的 React 单例（**不要自己打包 React**）。
- `apply(ctx)` 里能做五件事：注册语言包、覆盖主题 token、插入 `<style>`、监听 / 写入 `html[data-fz3-theme]`、通过 `ctx.slots.inject` + `register` 注册 UI。

### 3.5 动手改代码时最常用的 ctx 能力

| API | 用途 | 本插件里的调用点 |
| --- | --- | --- |
| `ctx.get('locale')` | 注册 i18n 词条 | `client.js` `apply` 开头（`locale.register(NS,'zh-CN',ZH)`） |
| `ctx.get('theme')` | 覆盖 `--dsw-alias-*` 主题 token、读当前主题 id | `theme.overrideTokens(PKG, TOKENS)`、`theme.getTheme()`（深浅色探测） |
| `ctx.remote.account` | 账户余额接口 | `fetchBalance()`（气泡里的「余额」行） |
| `ctx.slots.inject / register` | 占坑 / 注册组件 | 见第 4 节槽位表 |
| `ctx.effect(fn)` | 注册可清理副作用 | host 路由、`<style>` 清理 |
| `ctx.webServer.register` | 注册 HTTP 路由（host） | 第 11 节 |
| `ctx.get('agents')` | Agent 注册表快照 | `createMoodTracker` |

> 所有 inject / register 都包在 `guard(label, fn)` 里：DSH 版本不兼容时只 `console.warn`，不会让整个 UI 崩掉。新增注册请沿用这个模式。

---

## 4. 槽位（slot）系统：本插件改了界面的哪些位置

### 4.1 语义（读源码得出的规则）

- 每个 slot 声明了 `kind`（`single` / `list`）和作用域。`single` 槽同一时刻只渲染一个 occupant，**priority 数值最小的生效**；没有 occupant 时渲染宿主给的 `fallback`。
- 想替换别人的 single 槽：注册一个 **更小 priority** 的条目"遮住"它；同 priority 抢同一个 single 槽会抛错 `single slot ... already has a registration ... register at a different priority to shadow it`。
- `list` 槽（如 `shell.overlay`）用 `order` 决定层序；注册时传 `label` 的槽（如 `settings.section`）会出现在对应 UI 列表里。
- 推荐写法（本插件用的）：`ctx.slots.inject(key, () => ctx.slots.register({ name: key, ...spec }, Component))` —— inject 先占坑，注册在回调里执行，宿主重新渲染时不会重复注册。

### 4.2 本插件注册的 7 个槽位（client.js 末尾 apply，3107-3113 行）

| 槽位 | spec | 组件 | 作用 |
| --- | --- | --- | --- |
| `sidebar.brand.mark` | `{ id: 'fairy-zzz-brandmark', priority: 100 }` | `BrandMark` | 侧栏品牌图标（官方优先，本插件实际靠 CSS 隐藏官方再叠自己的，见 4.3） |
| `sidebar.brand.name` | `{ id: 'fairy-zzz-brandname', priority: 100 }` | `BrandName` | 侧栏品牌文字 `FAIRY Ⅲ · H.D.D` |
| `conversation.hero.brand.mark` | `{ id: 'fairy-zzz-hero-brand', priority: 0 }` | `HeroBrandMark` | 1.1.1 新增：新会话欢迎页标题左侧图标（替换官方鲸鱼） |
| `shell.overlay` | `{ id: 'fairy-zzz-skin', order: 24 }` | `FairySkin` | 全屏皮肤层：开机 / 问好 / 左下眼标 / 背景 / 文案 / 气泡（含 mood 轮询、dock 定位、拖拽、主题） |
| `shell.overlay` | `{ id: 'fairy-zzz-atmos', order: 12 }` | `Atmos` | 氛围光（低于 skin 的层级，纯静态 CSS 渐变 + 500ms 环境时钟） |
| `conversation.chat.assistant-actions` | `{ id: 'fairy-zzz-voice', order: 20, label: '朗读' }` | `VoiceAction` | 每条 AI 回复旁的"朗读"按钮 |
| `settings.section` | `{ id: 'fairy-zzz-settings', order: 40, label: 'Fairy' }` | `FairySettings` | 设置 → Fairy 面板（朗读、眼标拖动 / 显隐 / 复位、外观、引擎、重播、测试） |

### 4.3 侧栏品牌位为什么这么绕

官方 `@deepseek-ai/dsh-client-ui-brand-official` 也注册了 `sidebar.brand.mark` / `sidebar.brand.name`（priority 0，比本插件的 100 小，所以**官方赢**）。而官方字标是 SVG，没有文本节点，**没法靠 i18n 改**。于是本插件的做法是：

1. 用 CSS 把官方字标藏掉：`[class*="_brandName"],[class*="_brandMark"]{visibility:hidden!important}`（`client.js` 870 行，CSS 区块 869-927）；
2. 用宿主已有的测量数据算出品牌行位置，把 `.fz3-sb-brand` 定位到同一位置：JS 量 `[class*="_brandIdentity"]` / `[class*="_logoRow"]` 的 rect，写 `--fz3-brand-top/left/h`（`client.js` 2226-2286 行，先轮询 14×500ms，命中后用 `ResizeObserver` + resize）；
3. 自己的 Fairy 眼标 + `Fairy` 字标用 `position:fixed` 画在这个位置，只在 `dock` 阶段显示。

### 4.4 欢迎页品牌位与文案（1.1.1 / 1.3.0）

DSH 新会话欢迎页的标题行结构：

```text
[HeroShell]  span.fishHitbox → renderSlot('conversation.hero.brand.mark', { size: 34, className: 'WOwLGG_fish' },
                                        fallback: <HeroFish hovering />)  →  span.WOwLGG_headline  「探索未至之境」+「预览版」
```

- 槽位声明在 `@deepseek-ai/dsh-client-ui-conversation/lib/client.js`（asar 内，Electron 的 fs 可读）：`offset 668,759` 附近是 HeroShell，`offset 767,813` 附近是 `children: { 'conversation.hero.brand.mark': { kind: 'single', scope: 'root' } }`。**这些偏移量随 DSH 版本变化**，搜槽位名字符串即可重新定位。
- 官方**没有插件占用**这个槽，渲染的是 fallback `HeroFish`（鲸鱼）。因此本插件注册 `priority: 0` 的条目后，鲸鱼被**完全替换**，不需要额外隐藏。
- 实现要点（`client.js` 1812-1828 行 `HeroBrandMark`）：
  - 组件收到 `{ size, className }`：`size` 固定 34px；`className` 必须拼接到自己的 `className` 上（官方 hover 摆动的 `fish` 类，以及它的 `:hover animation`），否则欢迎页 hover 时眼标不会摆动。
  - 内部复用静态 `FAIRY_EYE_SVG`（34px 下细节足够，且**不挂 .fz3-eye 类** → 不会启动呼吸 / 故障动画，零额外开销）。
  - CSS：`.fz3-hero-brand` / `.fz3-hero-brand-eye`（`client.js` CSS 601-604 行），只做弹性居中和静态 `drop-shadow` 光晕。
- **v1.3.0 新增：欢迎页文案改写**。`HERO_COPY`（28-31 行）给中英两套 `{ headline, badge }`；`FairySkin` 里用 `MutationObserver`（2413-2464 行）监听 `[class*="_headline"] [class*="_titleGroup"]`，在 hero 重新挂载或宿主重渲染文本（`characterData`）时改写标题与「预览版」徽章；文本已经正确就不写，**空闲时零定时器**（参考实现是每 900ms 轮询一次）。
- 验证结果（1624×1042 窗口）：`document.querySelectorAll('.fz3-hero-brand').length === 1`；元素 outerHTML 的 class 是 `fz3-hero-brand WOwLGG_fish`；rect 为 `[819,421,34,34]`，即原鲸鱼的位置；控制台无报错。效果图见 [docs/img/hero-brand-mark.png](img/hero-brand-mark.png)。

---

## 5. client.js 文件地图（3,180 行，约 154 KB）

> 行号基于 v1.3.2 实测（v1.3.1 为 151,180 B / 3,119 行；v1.3.2 在 `FairySkin` 内新增约 61 行「会话内容区」测量与吸附边界代码，2126 行之后整体后移）。改代码前先 `grep` 函数名 / 注释定位，不要只信行号。

| 行号 | 区块 | 内容 |
| --- | --- | --- |
| 1-6 | 模块头 | `window.__ModuleLoader__.load`、`require('react')`、`h = React.createElement` |
| 8-34 | 常量与存储键 | `NS` / `PKG`、`VOICE_KEY`（朗读开关）、`SEEN_KEY`（已朗读消息 id）、`greetSlot()`（按时段返回 morning/noon/afternoon/evening/night）、`GREETING()`、`DRAG_KEY`（23）/ `POS_KEY`（24）/ `EYE_KEY`（25）/ `THEME_KEY`（26）、`HERO_COPY`（28）、`CJK_RE`（32） |
| 35-43 | SVG 资产 | `FAIRY_EYE_SVG`（35，256×256 viewBox，含 defs 渐变 / clipPath `#fz3-lid-clip`；带 SPDX 注释）、`FAIRY_PULSE_SVG`（39，5 圈睫毛脉冲环）、`FAIRY_THREADS_SVG`（42，feTurbulence 拉丝滤镜）；`FZ3_ASSETS_BEGIN/END` 标记在 36 / 43 行 |
| 44-70 | i18n | `ZH` / `EN` 各 5 条：`boot.sound`、`greet.kicker/sub/tap`、`dock.error`（设置面板与气泡文案直接写中文字面量，不进 i18n） |
| 71-124 | 声音状态 | 模块级 `voice = { enabled, busy, speaking, error }`、`listeners / emit / patchVoice / useVoice()` 订阅式 hook（不用 Redux / Context）、播放器 `player` / `preview` 状态与 `stopSpeech` |
| 125-237 | 语音工具 | `playClip(url, token)`（125；Audio 播放 + token 防串音 + 240s 兜底且正常结束会 clear）、`fetchVoice`（161，POST /fairy-zzz/tts）、`cleanSpeakable`（179）、`chunkText(text, 90, 8)`（193）、`speakText`（211） |
| 238-262 | 本地存储容错 | `readStored / readBool / writeStored`（localStorage 被禁用 / 值损坏时回退默认值并清除坏值） |
| 263-380 | 余额 / 用量格式化 + 预取缓存 | `runtime`（263，存 `ctx`）、`fetchUsage()`（265，GET /fairy-zzz/usage）、`fetchBalance()`（275，`ctx.remote.account.getBalance`，兼容钱包数组 / 包装对象）、`usageCache`（321）、`USAGE_TTL = 60_000`（322）、`BALANCE_TTL = 30_000`（323）、`loadUsage(force)`（324）、`loadBalance(force)`（340）、`prefetchUsage()`（356）、`yuan`（361）、`tokensText`（369）、`clockText`（377，`04:09:12` 倒计时盘） |
| 381-500 | 读回答文本 + 自动朗读 | `readMessageText`（388，只在「这一条消息」局部 DOM 取文本）、`NON_SPEECH_SELECTORS`（411）、`speechTextOfRow`（431）、`readAssistantText`（439）、`seen`（458）、`autoRead`（465，只在真正入队后记已读） |
| 502-544 | 主题 token | `baseTokens`（502，16 个 `--dsw-alias-*` / `--dsw-specific-*` 深蓝玻璃配色）、`lightTokens`（521，浅色对应值）、`TOKENS`（539，同时给 light/dark 两套） |
| 545-1038 | **CSS 字符串** | 全部样式，字符串文本 492 行（546-1037），见第 6 节分区表 |
| 1043-1430 | **FZ3 动效运行时** | `FZ3_RUNTIME_BEGIN/END` 标记包裹；详见第 8 节。CSS 驱动、无常驻 rAF |
| 1433-1436 | 开机标记 | `bootHooks`（设置页「重播开机动画」的钩子集合）、`bootPlayed`（本次页面会话是否已播过开机；已播则重挂载直接从 dock 开始） |
| 1438-1468 | `CoreGlyph` | `React.memo`；挂 DOM 后在 `useEffect` 里 `fz3EyeRuntime.mount(el)`，mood 变化时 `setState`；渲染 6 份内联 SVG（眼标 ×1 + 花屏克隆 ×5） |
| 1470-1798 | `FairySettings` | 设置 → Fairy 面板：`/health` 5s 轮询（页面隐藏时停）、自动朗读开关、眼标拖动 / 显隐 / 复位、外观三档、引擎目录与启停、重播问候 / 开机、测试 / 停止朗读；引擎行文案只显示 `已就绪 · GPT-SoVITS` |
| 1800-1810 | `BrandMark` | 侧栏眼标（34px 静态 SVG） |
| 1812-1828 | `HeroBrandMark` | 欢迎页品牌位（1.1.1），拼接官方 `className` 保留 hover |
| 1830-1839 | `BrandName` | 侧栏文字 `FAIRY Ⅲ · H.D.D` |
| 1841-1917 | `BootStage` | 全屏开机视频：单路 `boot-opt.mp4`（`object-fit:contain`，四周静态 `poster.jpg` 模糊铺底）；自动播放被拦时先静音 + 底部提示点击解锁声音；`onEnded` 后 640ms 回调（卸载会清理定时器），另有 18s 兜底 |
| 1919-1959 | `VoiceAction` | 回复旁「朗读」按钮；挂载时 `autoRead` 触发自动朗读 |
| 1961-2014 | `Atmos` | `React.memo`；v1.2.0 起用 500ms 环境时钟写呼吸内联样式（隐藏页暂停，见 8.5），静态基线只作兜底 |
| 2016-2025 | `greetLine()` | 按时段的居中问好中文台词 |
| 2027-2124 | `BubbleCard` | v1.3.0 用量气泡：只在展开时挂载；usage 态「余额 / 今日花费 / 峰谷」，turn 态「本轮花费 / 峰谷」；每秒 tick 倒计时、换价瞬间回调父层重拉；用 `useLayoutEffect` 把真实宽高交回父层 |
| 2126-3017 | `FairySkin` | 主组件：`phase`（boot/greet/dock）+ `mood`（idle/thinking/working/done）；**会话内容区测量 2153-2194**（`regionRef` 2153、`measureRegion` 2156、`regionBounds` 2177，v1.3.2）、`closeBubble` 2197 / `bubblePlace` 2206 / `openBubble` 2222；品牌测量 `ResizeObserver`（~2298）、dock 测量 `ResizeObserver`（~2368）、hero `MutationObserver`（2487-2543）、done 气泡（2529-2535）、点外 / Esc 关闭（2538-2554）、用量预取（2556-2571）、mood 轮询（2579+）；**拖拽子系统 2650-2869**（`SNAP_EDGE` 2653、`snapPos` 2654、`ourStackZ` 2669、`foreignZAt` 2682、`occludedAt` 2706、`avoidOcclusion` 2707、`onCoreDown` 2724、`detachDrag` 2768、`paintDrag` 2774、`onCoreMove` 2782、`finishDrag` 2797、`onCoreUp` 2840、`onCoreCancel` 2849）；render 核心区 ~2946-2972、气泡 ~2974-3000 |
| 3019-3175 | apply / 挂载 | `guard` 容错（3022）、locale（3033）、样式注入（3041-3060，HMR 就地更新）、主题 token + theme-watch（3062-3156）、`mount()` helper（3158）、7 条槽位注册（3168-3174） |

---

## 6. CSS 分区（都在第 545 行起的 `CSS` 大字符串里，v1.3.1 行号）

| 行号 | 分区 | 说明 |
| --- | --- | --- |
| 546-559 | `:root` 变量 | `--fz3-cyan/amber/text/font` 色板与字体、`--fz3-eye`（clamp 自适应眼径 132-330px）、`--fz3-eye-cy/eye-gap`、`--fz3-dock-x/y/size`；v1.2.1 已删除 6 个未使用变量 |
| 560-596 | 全局壳 | body 背景 / `body::before` 多层渐变（40s 漂移已静态化，留注释说明原因）、`::selection`、滚动条、输入框 / 按钮 / 焦点样式 |
| 597-607 | 品牌 | `.fz3-brandmark`（侧栏）、`.fz3-hero-brand`（欢迎页，1.1.1）、`.fz3-brandname` |
| 609-632 | 图层 | `.fz3-layer`（固定全屏、层级）、`.fz3-screen`（收 dock 后 `visibility:hidden` 彻底停画）、`.fz3-bg` / `.fz3-hero`（`hero.webp` 背景图）；旧 `.fz3-veil` 已删除 |
| 634-651 | 开机舞台 | `.fz3-boot` / `.fz3-boot-fill`（静态 poster 模糊铺底）/ `.fz3-boot video` / `.fz3-boot::after` 扫描线 / `.fz3-boot-sound`（静音播放时的点击提示）；v1.2.1 已删除 HUD / 进度条 / 跳过按钮样式 |
| 653-708 | 全息核心 | `.fz3-core` 定位与 dock 过渡、`.fz3-eye` 尺寸与四层解剖结构、`.fz3-eye-halo` 静态多层径向渐变、`.fz3-eye-svg`、睫毛脉冲环 5 圈同心描边共享 4s 时间线 |
| 709-738 | 设置页 | 现役 `.fz3-set-*` 样式（旧设置面板已在 v1.2.1 删除） |
| 739-765 | 故障（glitch） | `data-glitch="threads/blocks"` 下的滤镜 / 切片 / 克隆规则 |
| 766-818 | 待机小动作 | 呼吸关键帧 `fz3-breath-a..d`、眼闪 `.fz3-eye-flicker`、`.fz3-eye[data-lid="thinking"]` 半闭眼剪裁、`[data-fz3-suspended]` 暂停全部时间线、庆祝 / 爆闪辅助关键帧 |
| 819-855 | 问候文案 | 镜面倒影标题、kicker / sub、SKIP2 按钮 |
| 856-868 | 左下角坞 + 朗读按钮 | 坞内旧 `.fz3-tag` 标签、旧设置面板、dock 波形条 `.fz3-wave*` 均已删除；现役左下坞品牌字标 `.fz3-sb-brand` 在 869-927 区间，这里只剩分区注释；`.fz3-voice` 及 idle / busy / play 三态（859-867） |
| 869-927 | 官方字标隐藏 + 氛围 + 响应式 | `[class*="_brandName"],[class*="_brandMark"]{visibility:hidden}`、`.fz3-sb-brand`、`.fz3-rim` / `.fz3-bay`、`.fz3-atmos*` 氛围光、辅助关键帧 `fz3-line/blink/flash`、三档媒体查询 |
| 928-935 | v1.3.0 新增段头 | 浅色主题 / 用量气泡 / 眼徽拖拽 / 设置页分段开关的分节说明与共用变量（`--fz3-mute/line`） |
| 936-971 | 浅色主题 | `:root[data-fz3-theme="light"]` 变量覆盖 + 全屏背景 / 字标 / 设置面板 / 气泡等静态覆盖 |
| 972-980 | 设置页分段开关 | `.fz3-set-seg` / `.fz3-set-segbtn`（外观：跟随 / 深色 / 浅色） |
| 981-991 | 眼徽交互 | dock 态 `pointer-events:auto`、拖动 `cursor:grab/grabbing`、`[data-dragging="1"]` 下关闭 300% 脉冲环与全屏 `mix-blend` 氛围、hover 放大 `.fz3-eye-svg`（v1.3.1 只动了这一段） |
| 992-1037 | 用量气泡 | `.fz3-bubble` 及标题 / 行 / 提示 / 峰谷徽章 / 倒计时表盘；纯渐变背景，**不用 backdrop-filter**（高刷屏每帧重算背景） |

**v1.2.0 的 CSS 变化**：① `body::before` 的 40s 漂移动画 `fz3-drift` 已删除，背景固定为原动画起始位姿 `transform:translate3d(-1.4%,-1%,0) scale(1.03)`；② `.fz3-atmos-glow` 的 14s 呼吸动画 `fz3-breathe` 已删除，静态基线改为 `opacity:.55; transform:scale(1)`，呼吸改由 JS 每 500ms 写内联样式（见 8.5）；③ `.fz3-atmos-flash` 的 11s `steps(1)` 离散闪烁保留（实测几乎免费）；④ 其余分区与动效不变。

**v1.2.1 的 CSS 清理**：共删除 93 条死规则 —— 旧设置面板 `.fz3-panel/.fz3-row/.fz3-switch/.fz3-btn/.fz3-actions/.fz3-dot/...`（现役面板用 `.fz3-set-*`）、旧侧栏统计块 `.fz3-sb-stats/.fz3-sb-row*`、dock 波形条 `.fz3-wave*` 与 `fz3-bar` 动画、`.fz3-frame/.fz3-veil/.fz3-eye-glyph/.fz3-copy-tap`、boot HUD / 进度条 / 跳过按钮相关样式；另删 6 个未使用 `@keyframes`（`fz3-bar/fz3-wave/fz3-panel-in/fz3-rot/fz3-rot-rev/fz3-twinkle`）和 6 个未使用 CSS 变量。CSS 文本因此从 517 行降到 383 行。

**v1.3.0 的 CSS 变化**：CSS 文本 383 → 489 行。新增的都是静态声明或按需规则：浅色主题覆盖（936-971）、设置页分段开关（972-980）、眼徽 hover / 拖动光标（981-991）、用量气泡（992-1037）；**没有新增任何常驻 `animation`**，气泡刻意去掉了参考实现的 `backdrop-filter: blur()`（全屏背景模糊在高刷屏上每帧重算）。

**v1.3.1 的 CSS 变化**：CSS 文本 489 → 492 行（文件 545-1038），只改了眼徽交互区（981-991）：`[data-dragging="1"]` 下 `transition:none; cursor:grabbing; will-change:transform`（984）、`svg{transition:none;transform:none}`（985）、拖动期间隐藏 300% 脉冲环（987）、把全屏 `.fz3-atmos` 的 `mix-blend-mode` 临时改回 `normal`（988，松手恢复）；其余分区与 v1.3.0 完全一致。

**动画性能约定**：所有持续动画只用 `transform` / `opacity` 或纯 CSS `animation`，**不要**在 JS 里逐帧写 style；大光晕用静态径向渐变代替 `blur()/drop-shadow` 的逐帧重栅格化；页面隐藏时整层 `animation-play-state:paused`。**v1.2.0 追加**：禁止对全屏 `fixed` 层做逐帧 / 逐秒 CSS 动画或混合，小面积动画或低频写元素自身内联样式才是安全做法（见 8.5）。**v1.3.0 追加**：常驻 UI 不要用 `backdrop-filter`；主题切换只改 `html[data-fz3-theme]` 走静态覆盖。**v1.3.1 修正**：拖动眼徽**不要**写 `:root` 的 `--fz3-dock-x/y`（每次写都会让整页样式失效重算），只写元素自身 `transform` 并用 `requestAnimationFrame` 合并，落位后一次性写变量（见 14.4）。

---

## 7. 组件清单速查

| 组件 | 类型 | 挂在哪 | 备注 |
| --- | --- | --- | --- |
| `FairySkin` | 状态机（phase/mood） | `shell.overlay` order 24 | 全屏皮肤主层，唯一持有全局阶段状态的地方；拖拽（v1.3.1：transform-only + 四边吸附 + 遮挡让位；v1.3.2：拖拽与吸附边界限制在会话内容区）/ 气泡 / 主题监听的宿主 |
| `BootStage` | 局部 | FairySkin 内 | 开机视频（单路 + 静态 poster 模糊铺底），完成后回调；v1.2.1 起无 HUD / 进度条 |
| `CoreGlyph` | memo | FairySkin | 眼标舞台，交给 FZ3 运行时；6 份 SVG 只渲染一次 |
| `Atmos` | memo | `shell.overlay` order 12 | React.memo + 500ms 环境时钟（呼吸）；静态氛围光层 |
| `BrandMark` / `BrandName` | 纯展示 | sidebar 两个槽 | 官方赢（priority），靠 CSS 隐藏 + 自绘 |
| `HeroBrandMark` | 纯展示 props({size,className}) | `conversation.hero.brand.mark` | 1.1.1；静态眼标替换鲸鱼 |
| `VoiceAction` | 交互 | assistant-actions | 朗读按钮 + 自动朗读 |
| `FairySettings` | 交互 | settings.section | 设置页（朗读 / 眼标 / 外观 / 引擎 / 重播） |
| `BubbleCard` | 交互（局部状态） | FairySkin 内 | v1.3.0 用量气泡；只在展开时挂载，尺寸量完回报父层做翻面 / 夹边；数据来自父层预取缓存（v1.3.1），点外 / Esc 由父层关闭 |

---

## 8. FZ3 动效运行时（client.js 1043-1430）

这是本插件性能优化最核心的部分：**原版用常驻 `requestAnimationFrame` 每帧计算并写 SVG style，本版改为 CSS 时间线 + 极少量事件定时器**。

### 8.1 对外 API

```js
const fz3EyeRuntime = (() => { ... return { mount, unmount, setState, suspend, resume } })()
```

| API | 作用 |
| --- | --- |
| `mount(el)` | 绑定舞台根节点 `.fz3-eye`；缓存 5 个花屏切片、绑可见性事件、启动故障 / 眼闪调度 |
| `unmount()` | 清定时器、解绑事件、移除 `data-fz3-suspended` |
| `setState(mood)` | 只切 `data-lid="thinking"` 和 `data-glitch` 属性；thinking/working 时眼睑半闭（CSS clipPath） |
| `suspend() / resume()` | 页面 hidden / visible 时暂停 / 恢复（挂 `data-fz3-suspended` → 所有 CSS 时间线 `animation-play-state:paused`） |

### 8.2 时间常量

- `FZ3_LASH_PERIOD_S = 15`：睫毛旋转一周 15s（与 Fairy-DSH 参考一致；改这里要同步改 CSS 的 `animation-duration`，运行时恢复角度时会从 CSS 现取值）。
- `FZ3_GLITCH_MAX_MS = 900`：一次花屏视觉的硬上限，定时器丢了也不会一直挂着。
- `FZ3_FAULT`：threads（水平拉丝，feTurbulence）与 blocks（5 条横切片）两类故障的拍数、拍间隔、收尾时长、位移 / 亮度 / 对比档位，参数与参考文档一致。

### 8.3 调度方式

- **没有 rAF 主循环**：常驻动画全部是 CSS `@keyframes`（四层呼吸 1440ms、睫毛 15s、脉冲环 4s、眼闪由事件定时器触发 `.fz3-eye-flicker` 类、故障由事件定时器切 `data-glitch` + CSS 变量）。
- 两个 `setTimeout` 链：`scheduleFlicker`（1.75-3.6s 随机轻闪）与 `scheduleGlitch`（2.3-4.6s 随机故障）；表情切换时 `playStateTransition` 播两段式强转场（2 拍 threads → 28ms → 6 拍，前 2 拍 blocks → 28ms 清理）。
- 花屏切片高度每次随机（`layoutBlocks`），切入 blocks 档时锁一次睫毛角度（`lockLashFrame`），避免 5 份克隆各跑一条旋转时间线。
- `armGlitchWatchdog` 兜底清理；`suspend` 后所有计时器停止，CSS 时间线一并暂停（后台标签页 ≈ 0 开销）。

### 8.4 想改观感时动哪里

| 想改 | 改哪里 |
| --- | --- |
| 呼吸速度 | CSS `@keyframes fz3-breath-a..d` 的 duration（1440ms），以及四层的 animation-delay（45/90/180ms） |
| 睫毛旋转速度 | `FZ3_LASH_PERIOD_S` + 对应 CSS `animation-duration`（两处必须一致） |
| 眼闪频率 | `scheduleFlicker` 里的随机区间（1.75-3.6s）与持续时间（155-255ms，CSS `.fz3-eye-flicker`） |
| 花屏频率 / 参数 | `FZ3_FAULT`（拍数、间隔、位移、亮度）与 `scheduleGlitch` 的随机区间 |
| 思考态半闭眼形状 | `FAIRY_EYE_SVG` 里 `#fz3-lid-clip` 的 path（`.fz3-lid-clip-shape`） |
| 大眼尺寸 / 位置 | CSS 变量 `--fz3-eye` / `--fz3-eye-cy` / `--fz3-eye-gap` |

### 8.5 全屏动画层与 GPU：环境时钟（v1.2.0）

**为什么全屏 CSS 动画在高刷屏上可怕**：合成器判断"这一层变了、要重新合成"。如果变化发生在**全屏尺寸的 fixed 层**上，合成范围就是整个视口 —— 165 Hz 屏每秒重做 165 次整屏合成，GPU 占用随刷新率线性放大；60 Hz 屏只是被"层数 × 60 次"掩盖了同一份成本。插件里有两处这种层：`body::before`（fixed、`inset:-12%`、原 40s 漂移）和 `.fz3-atmos`（fixed `inset:0`、原 14s 呼吸的 `.fz3-atmos-glow`）。它们即使大部分被界面遮住，**渲染成本仍按层计算**。

`mix-blend-mode:screen` 会进一步放大代价：这一整层每帧都要和下面所有内容重新混合，相当于给"整屏合成"再加一遍全内容读取。所以氛围层既是全屏层、又是混合层，是本次最大的单项开销之一（归因见 [docs/PERFORMANCE.md](PERFORMANCE.md) 第 9 节）。

**当前实现**（`Atmos` 组件，client.js 1961-2014）：

- `React.memo` 包裹；`const glowRef = React.useRef(null)`，在 `React.useEffect` 里启动 `window.setInterval(tick, 500)`；
- `tick` 里取 `t`，算 `gp = (t % 14000)/14000`、`ge = 0.5 - 0.5*Math.cos(2*Math.PI*gp)`（等价于原 ease-in-out 呼吸曲线）；
- 写 `glow.style.opacity = (0.55 + 0.45*ge).toFixed(3)`、`glow.style.transform = 'scale(' + (1 + 0.06*ge).toFixed(4) + ')'`；
- `document.hidden` 时跳过本次更新；effect 清理函数里 `clearInterval`；
- CSS 里 `.fz3-atmos-glow` 保留静态基线 `opacity:.55; transform:scale(1)`（CSS 895 行），作为 JS 未运行 / 挂载前的**兜底**；`.fz3-atmos` 的 `mix-blend-mode:screen` 与 `opacity:.75` 不变（保留观感）。

效果：呼吸仍然在，但只在 500ms 的更新点让合成器重做一次整屏混合（**2 次/秒**），而不是 165 次/秒。

**为什么不用 CSS animation**：CSS 动画只要在跑，每次值变化就会让全屏层进入重合成，无法降频（`animation-timing-function` 只改曲线、不改更新频率）；用 `animation-play-state` 暂停又会让呼吸停住。

**为什么不用 `steps()`**：把呼吸换成 `steps(24)` 离散仍然每秒变化 24 次（实测 11.0%，只比连续动画好一点）；`steps(1)` 的离散闪烁之所以几乎免费，是因为可见变化极少、两次变化之间合成器可完全缓存。

**为什么放弃 `:root` CSS 变量定时驱动（教训）**：曾尝试保留背景漂移 —— 每 500ms 在 `document.documentElement` 上写 `--fz3-drift-x/y/s`，让 `body::before` 的 transform 用 `var()` 跟随。GPU 确实降到 ~5.7%，但主线程变差：CDP Performance 20 秒窗口 `RecalcStyleDuration` **4.055 s**，同样窗口基线只有 **0.82 s**（约 +16% 主线程；写未注册的继承型自定义属性会触发整棵文档样式重算，43 次更新 × ~80ms）。最终放弃漂移、背景静态化。**结论：定时器不要驱动 `:root` 上的自定义属性；低频更新必须写在具体元素自身的 `style` 上，只影响该元素。**（v1.3.0 的拖拽每次 `pointermove` 写两个 `:root` 变量属于**指针按住期间的人机交互**，不是定时器常驻驱动，见第 14 节。）

**维护规则（新增氛围效果前必读）**：

- ❌ 不要对全屏 `fixed` 层做逐帧 / 逐秒的 CSS 动画、`mix-blend-mode` 或滤镜动画；
- ✅ 动画只做在小面积元素上（眼徽、脉冲环、按钮、文字），或低频（≥500ms）写元素自身的内联 `opacity` / `transform`；
- ✅ 若必须让全屏层动，先评估合成范围：能不能换成独立小元素、限制 `clip-path` / `contain` 范围，或只在切换时动一次；
- ✅ 页面隐藏时暂停定时器（`document.hidden`），组件卸载时清理。

---

## 9. 主题、本地化与设置持久化（v1.3.0 重写）

### 9.1 主题 token

- `baseTokens`（502-520 行）覆盖 `--dsw-alias-bg-base/layer-1/layer-2/border/brand/label/state-*` 等 16 个 token（深蓝玻璃配色）；`lightTokens`（521-538）是浅色对应值。
- `TOKENS`（539-544）由两套合成：默认 `{ light: baseTokens, dark: baseTokens }`（插件固定深色观感），强制外观时会把同一套值双写进 light / dark（见 9.2）。
- 生效：`theme.overrideTokens(PKG, TOKENS)`（`client.js` 3003 / 3049-3058 行）。

### 9.2 外观三档（跟随 / 深色 / 浅色）

- 偏好存在 `localStorage['fairy.zzz.theme-mode']`（`auto` 默认 / `dark` / `light`），设置页分段开关写入并 `dispatchEvent(new Event('fz3:theme-pref'))`。
- `apply` 里的 `theme-watch`（3006-3095 行）负责：① `probeLight()` 先读 `theme.getTheme().active.id` 里的 light / snow / day 与 dark / night / midnight 关键字，取不到就临时插一个探针 div 量 `--dsw-alias-bg-base` 亮度（>140 判浅色），再退回 `prefers-color-scheme`；② 只切 `html[data-fz3-theme="light"|"dark"]`，CSS 侧全部是静态覆盖（894-929 行）；③ 强制外观时把设计变量双写进 light+dark 两套，让宿主外壳也跟着强制配色；④ 监听 `fz3:theme-pref`、`matchMedia`、`MutationObserver(html[style,class,data-theme,data-color-scheme])`（260ms 去抖）与 `ctx.on('theme/change')`。

### 9.3 本地化与存储

- 本地化：`locale.register('fairy-zzz','zh-CN',ZH)` 与 `'en-US',EN`；文案用 `t('greet.kicker')` 这种 key 取。加新文案：ZH/EN 两份都要加，否则回退 ZH。
- 设置持久化 key：

| key | 默认 | 含义 |
| --- | --- | --- |
| `fairy.zzz.voice` | `true` | 自动朗读开关 |
| `fairy.zzz.seen` | `[]` | 已朗读消息 id（防重复） |
| `fairy.zzz.drag` | `true` | 眼标是否可拖动 |
| `fairy.zzz.dock-pos` | 无 | 拖拽后的眼标中心 `{ x, y }` |
| `fairy.zzz.eye-hidden` | `false` | 是否隐藏眼标与气泡 |
| `fairy.zzz.theme-mode` | `auto` | 外观：跟随 / 深色 / 浅色 |

- 设置页与皮肤层之间的同步事件：`fz3:drag-pref`、`fz3:eye-pref`、`fz3:dock-reset`、`fz3:theme-pref`（同时监听 `storage`，多窗口也能同步）。

---

## 10. index.js 文件地图（1,391 行，约 47 KB）

| 行号 | 区块 | 内容 |
| --- | --- | --- |
| 1-28 | imports / 导出 | node:fs / fs.promises / crypto / child_process / path / url / os / zlib；`export const name = 'fairy-zzz'`（27）、`inject = ['webServer']`（28） |
| 30-32 | 路径 | `HERE`、`ASSETS`、`CACHE`（可用环境变量 `FAIRY_CACHE_DIR` 覆盖）；`TTS_PORT`（`FAIRY_TTS_PORT`，默认 9800） |
| 34-66 | 引擎目录发现 | 优先级：`voice-home.txt` → `FAIRY_VOICE_HOME` → 插件旁 `../voice` → 旧版 `FAIRY_TTS_DIR`；`voiceHomeSource()` 说明来源 |
| 67-78 | 路径清洗 | `IS_WIN`、`cleanHome`（去引号 / 合并重复分隔符 / Windows 统一反斜杠） |
| 79-108 | 引擎校验 / 保存 | `inspectVoiceDir`（要求 `fairy_server.py` + `GPT-SoVITS/` + `models/` + python 可解析）、`saveVoiceHome`（写 `voice-home.txt`） |
| 109-136 | 运行时解析 | `TTS_DIR`、`resolvePython`、`syncVoiceHome`（每次用前重新解析，改路径后不用重启） |
| 138-164 | 常量 / 工具 | `TTS_SPEED = 1.04`、`MAX_CHARS = 500`、MIME 表、`sizeOf` |
| 166-311 | **静态文件服务** | 缓存头策略（`STATIC_CACHE` / `IMMUTABLE_CACHE`）、`etagOf`（size-mtime）、304 协商（If-None-Match / If-Modified-Since）、Range / 206 / If-Range、`sendFile`、`sendJson`、`readBody`（64 KB 上限） |
| 313-383 | 记忆化 | `createMemo(ttl)` / `createAsyncMemo(ttl)`（in-flight 去重）；TTL：`MOOD_CACHE_MS=300`、`ENGINE_CACHE_MS=1500`、`VOICE_CACHE_MS=3000`、`USAGE_CACHE_MS=3000` |
| 385-549 | **引擎生命周期 + TTS** | `engineState`（385）、`enginePromise/engineChild`（398-399）、`engineGen`（403，代际号）、`ensureEngine`（405-470，spawn `python fairy_server.py --port`，日志写 <引擎目录>/server.log；exit/error 清缓存，stale 进程先 kill）、`stopEngine`（471-490，bump gen + taskkill /T /F）、`enqueue`（492-503，串行队列）、`synthesize`（505-536，POST /tts；失败 / 5xx 清缓存重试一次）、`cleanText`（537-549） |
| 552-903 | **用量与花费** | `DSH_ROOT` / `SESSIONS_ROOT`（559-560）、`PRICES`（563，`deepseek-flash` / `deepseek-v4-pro` 的 hit/miss/out 三档）、`DEFAULT_PRICE`（567）、`BJ_OFFSET`（572）、`PEAK_RANGES`（573，工作日 09-12 / 14-18）、`HOLIDAY_RANGES`（576-590，2026 年 7 段）、`beijingStamp`（593）、`isPeakAt`（602）、`nextPeakFlip`（609-622）、`peakState`（623-641）、`formatLeft`（643-652）、`ZSTD_MAGIC`（653）、`usageCache`（655-657）、`sessionFiles`（659-684，两级遍历 `sessions/*/*/session.v4.jsonl.zstd`）、`zstdFrameLength`（685-728，按 RFC 8878 算一帧长度）、`readUsageEvents`（729-826，导出；增量解析 + 按天裁剪）、`addToBucket`（832-842，每笔按发生时刻计价）、`collectUsage`（847-891，导出）、`usageDiagnostics`（892-903） |
| 905-1140 | **情绪追踪** | `createMoodTracker(ctx)`：权威数据源 `ctx.get('agents')`（AgentRegistry），不可用时退回事件机（`MOOD_ACTIVITY_EVENTS` / `MOOD_CLEAR_EVENTS`）；`MOOD_INFER_TTL_MS=10min`（917）、思考窗口 2500ms、完成窗口 2400ms；诊断写 `cache/mood.log` |
| 1142-1391 | **apply / 路由** | 8 个 `webServer.register`（见第 11 节）；`usageMemo`（1154） |

---

## 11. host 路由一览（index.js，8 个注册）

全部挂在 DSH 自带 webServer 上，前缀 `/fairy-zzz/`；`?diag=1` 绕过记忆化并附诊断字段。注意 DSH 的 `webServer.register` 支持 **prefix 匹配**（第 2、3 条注册的是 `/fairy-zzz/assets` 与 `/fairy-zzz/audio` 子路径），其余是精确方法 + 路径。

| 方法 | 路径 | 行号 | 返回 / 行为 |
| --- | --- | --- | --- |
| GET | `/fairy-zzz/mood` | 1157-1179 | `idle / thinking / working / done` 字符串（`ctx.get('agents')` 权威快照；`?diag=1` 带诊断）；记忆化 300ms |
| GET | `/fairy-zzz/assets/<file>` | 1181-1203 | assets 目录静态文件；`sendFile` 处理 ETag / Last-Modified / 304 / HEAD / Range / 206 / If-Range；前缀路由，`decodeURIComponent` 包 try/catch，坏 URI → 404 JSON |
| GET | `/fairy-zzz/audio/<hash>.wav` | 1205-1225 | `cache/` 下的合成音频；只接受 40 位十六进制文件名（防目录穿越）；坏编码同样 404；一年 immutable 缓存 |
| GET | `/fairy-zzz/health` | 1227-1250 | `{ ok, engine, engineHome, engineManaged, voiceHome, voice, speed, on, seen, mood }`；引擎状态记忆化 1500ms |
| GET | `/fairy-zzz/usage` | 1252-1273 | v1.3.0 新增：`collectUsage()` 的 `{ ok, now, peak, today, turn }`（字段见 11.1）；异常 → 500 `{ ok:false, error }`；记忆化 3000ms |
| GET / POST | `/fairy-zzz/voice-home` | 1275-1315 | GET 返回当前引擎目录与来源（`voiceHomeSource()`）；POST 校验并写 `voice-home.txt`；成功后清缓存 |
| GET / POST | `/fairy-zzz/engine` | 1317-1344 | GET 引擎进程状态；POST `{ action: 'start' \| 'stop' }`；记忆化 1500ms |
| POST | `/fairy-zzz/tts` | 1346-1390 | `{ text }` → `{ url, cached, seconds }`；`cleanText` 清 markdown / 代码块、截 500 字；串行队列 + 磁盘缓存 |

### 11.1 `/usage` 返回字段（v1.3.0）

```json
{
  "ok": true,
  "now": 1762000000000,
  "peak": {
    "offPeak": false,
    "label": "高峰",
    "window": "工作日 09–12、14–18 高峰",
    "remainMs": 3600000,
    "nextAt": 1762003600000,
    "nextClock": "18:00",
    "next": "1 小时 0 分后转高峰价"
  },
  "today": { "hit": 0, "miss": 0, "out": 0, "cost": 0, "calls": 0 },
  "turn": null
}
```

- `today`：北京时区当天 0 点起算；`hit` / `miss` / `out` 是 token 数，`miss = input + cache-write`，`cost` 单位为人民币元。
- `turn`：最近修改的会话文件里最后一轮（`turn` 序号）的统计；可能是 `null`（若该 session 最后一轮完全落在昨天，会被按天裁剪掉——上游接口同样允许 null）。
- `peak`：工作日 09:00-12:00 / 14:00-18:00 为高峰；周末与 2026 年节假日窗口全天低价；`remainMs` 精确到毫秒，`nextClock` 是 `HH:MM`。
- `?diag=1` 追加 `diag: { root, zstd, cached, files, recent, ms, at }`。

---

## 12. 静态资源、缓存与热路径

### 12.1 静态资源服务（index.js 166-311）

- 强 ETag = `size-mtime`（`etagOf`，182 行）+ `Last-Modified`；`If-None-Match` / `If-Modified-Since` 命中 → **304 空 body**；支持 `HEAD`（`sendFile`，226-283）。
- `Range` → **206** + `Content-Range`，`If-Range` 不匹配则回 200 全量（视频拖动 / 音频 seek 正常）。实测：`assets/boot-opt.mp4` 200 ETag 命中 304；`Range: bytes=0-99` → 206 `content-range: bytes 0-99/74349`。
- `assets/` 走 `public,max-age=0,must-revalidate`；`cache/` 下 40 位 sha1 命名的音频走 `public,max-age=31536000,immutable`（`IMMUTABLE_CACHE`，176 行）。
- `sendJson`（285）统一 JSON；`readBody`（295-310）上限 64 KB，防止超大 POST。

### 12.2 记忆化 TTL（313-383）

| 接口 | TTL | 常量 |
| --- | --- | --- |
| `/mood` | 300ms | `MOOD_CACHE_MS`（322） |
| `/engine`、`/health` 里的引擎状态 | 1500ms | `ENGINE_CACHE_MS`（323） |
| `/voice-home` | 3000ms | `VOICE_CACHE_MS`（324） |
| `/usage` | 3000ms | `USAGE_CACHE_MS`（327） |

`createMemo / createAsyncMemo`（330 / 350）都做 in-flight 去重；start / stop / TTS / 保存目录成功后主动清缓存。`?diag=1` 一律绕过。

### 12.3 用量统计的增量解析（552-903，v1.3.0 的热路径）

- 会话日志位置：`@DSH_HOME或~/.dsh` `/sessions/*/*/session.v4.jsonl.zstd`（`sessionFiles`，659-684，两级遍历；只扫 mtime ≥ 当天 0 点 − 2 天的文件）。
- 每个文件缓存 `{ mtimeMs, size, events, parsedTo }`（`usageCache`，655-657，上限 `USAGE_CACHE_MAX = 256`，654）；mtime / size 没变直接复用，变了从 `parsedTo` 继续解析新增的 zstd 帧。
- `zstdFrameLength()`（685-728）按 RFC 8878 逐字节算 frame 长度，**不能**把整个文件丢给 `zlib.zstdDecompressSync`（多帧拼接会失败），也**不能** `TextDecoder` 解原始字节（payload 里可能出现伪 `b5 2f fd` 魔数）。
- 解析出的事件按 `isPeakAt(ev.time)` 逐笔计价（`addToBucket`，832-842），所以跨峰谷边界的一轮回答会拆成两档；只保留 ≥ `todayStart` 的桶（跨天裁剪，`pruneBefore`）。
- 冷启动开销：真实 HTTP harness 实测 `/usage` 冷 505–608ms（190 个 session 文件、8 个近期文件），热 ~20ms；`?diag=1` 示例 `{ zstd: true, cached: 8, files: 190, recent: 8, ms: 16–23 }`。前端只在点开气泡时请求，所以这笔开销不落在启动路径上。
- 正确性对照：3 份真实日志（1,102,484 + 7,485,134 + 1,002,876 B）上，新旧实现 `today` 完全一致（hit 56,786,176 / miss 1,570,036 / out 815,636 / cost 5.968303520000003 / calls 553）。

### 12.4 host 不热重载

`index.js` 改动**必须重启 DSH 桌面端**才生效；`client.js` 改动整页刷新即可。证据：DSH asar 内 `cordis.patch.yml` 的 `dsh-hmr` 配置 `root: []`（"module roots are opt-in"），即插件源码不在热重载根名单里。

---

## 13. 资产清单（assets/ 与 docs/img/）

### 13.1 运行期资产（仓库发布）

| 文件 | 大小 (B) | 说明 |
| --- | --- | --- |
| `assets/boot-opt.mp4` | 2,394,692 | 1280×720 crf27 重编码，保留音轨；开机视频 |
| `assets/poster.jpg` | 77,642 | 开机静态 poster（`boot-fill` 模糊铺底） |
| `assets/hero.webp` | 23,014 | 1600×1017 q82 背景图 |
| `assets/icon-180.png` | 32,158 | 插件图标 |
| `assets/voice/greet-*.mp3` | 合计 420,129（5 段约 72–101 KB） | 预录问候，按时段播放 |
| `screenshots/*.png` | 4 张 | README 用截图 |
| `docs/img/*` | 6 个 | 文档配图（见下） |

`docs/img/` 实测大小：`before-after-dock-eye.png` 234,947；`gpu-attribution.png` 63,363；`gpu-before-after-dock.jpg` 169,122；`hero-brand-mark.png` 52,357；`theme-light.jpg` 38,464；`usage-bubble.jpg` 39,584。

### 13.2 不发布的东西

- `cache/`：TTS 合成音频 + `mood.log`，体积随使用增长，已在 `.gitignore`。
- `voice-home.txt`：本机引擎绝对路径（隐私）。
- GPT-SoVITS 权重、参考音频、推理引擎：体积与许可原因均不随包发布。

---

## 14. 性能：11 条核心改动与数据

### 14.1 核心改动

1. 删除常驻 `requestAnimationFrame` 主循环 → CSS `@keyframes`（0 rAF/s）。
2. 删除每帧 SVG 写 `transform` / 12 步二分缓动 / 5 份克隆逐帧同步（克隆只在花屏时 `display:block`）。
3. 眼睑半闭眼形状静态化（唯一有意简化的动效）。
4. 开机动画两路视频 → 单路 `boot-opt.mp4`；去掉全屏 `blur(46px)` 铺底。
5. 常驻模糊 / 滤镜改为静态多层渐变。
6. 轮询感知 `document.hidden`（mood 900ms、health 5s），in-flight 去重。
7. dock 定位缓存容器、合并 resize 定时器，杜绝周期性全量 `getBoundingClientRect`。
8. `React.memo` 包裹眼睛 / 氛围层；淡出后 `visibility:hidden`。
9. v1.2.0：两处全屏动画层静态化 / 降频（背景漂移删除、氛围光呼吸改 500ms JS 环境时钟）。
10. v1.3.0：新增 UI 全部走**按需 / 静态 / 交互期**路径 —— 用量气泡只在展开时挂载并只在此期间跑 1s 倒计时、刻意无 `backdrop-filter`、主题只切 `html[data-fz3-theme]` 静态覆盖、欢迎页改文案用 `MutationObserver` 取代 900ms 轮询、`/usage` 由 host 增量解析 zstd 且 3s memo。**不新增任何常驻动画 / 定时器。**
11. v1.3.1：拖拽重写为**只写元素自身 `transform` + rAF 合并**（不再每帧写 `:root`，165 Hz 下零长任务）；用量改 dock 后 700ms 预取 + TTL 缓存（点开 65–166ms）；气泡点外 / Esc 关闭只挂两个被动监听；落位用 170ms `el.animate` 补间替代 1.35s CSS `left/top` 过渡；遮挡让位用一次 `elementsFromPoint` + 祖先 `z-index` 比较，无轮询。**依旧不新增任何常驻动画 / 定时器。**

### 14.2 主线程（headless Chrome 156，10 秒稳态，同机同 harness）

| 场景 | 优化前 | 优化后 | 降幅 |
| --- | --- | --- | --- |
| 侧栏待机 dock idle | 31.2% | **1.8%**（复测 1.0%） | −94% |
| 模型思考 thinking | 30.9% | **1.6%** | −95% |
| 问候页待机 greet | 41.1% | **2.5%** | −94% |
| 开机 boot | 0.4% | 0.4% | 持平 |

其它 dock idle 指标：Script 2.0% → 0.1% core；Recalc Style 8.9% → 0.6%；Layout 1.3% → 0.1%；rAF 158 次/秒 → 0；首屏下载 ≈9.0 MB → ≈2.9 MB（−68%）。

### 14.3 GPU（v1.2.0 修复，165 Hz 高刷屏 dock 待机）

| 变体 | GPU 引擎平均 |
| --- | --- |
| v1.1.1 原样 | 43.1% |
| 只关眼徽四层呼吸 / 睫毛 / 脉冲环 | 42.6%（可忽略） |
| 只关 `body::after` 网格层 | 40.9%（可忽略） |
| 只关氛围光呼吸 + 闪光 | 36.9%（−6.2） |
| 氛围层整层 `display:none` | 29.9%（−13.2） |
| 只把背景漂移静态化 | 23.4%（−19.7） |
| 漂移静态化 + 氛围光呼吸 / 闪光关 | 5.2%（−37.9） |
| v1.2.0 最终版 | **5.1%** |

- 结论：成本不在 128px 眼徽，而在两处**全屏动画层**（`body::before` 40s 漂移、`.fz3-atmos-glow` 14s 呼吸 + `mix-blend-mode:screen`）；165 Hz 下每帧整屏合成，代价随刷新率线性放大。
- 真机对照：未刷新仍跑旧 `client.js` 的真实 Electron（1624×977、dpr 1.5）dock 待机约 **17.9%** GPU；用户原始反馈核显 80–90% vs 关插件 ~10%。刷新到 v1.2.0 后的真机数字待验证。
- 旧版已知例外（v1.3.1 已修）：v1.2.0–v1.3.0 拖拽眼徽时每次 `pointermove` 写 `--fz3-dock-x/y` 到 `:root`，会让整页样式失效重算，165 Hz 下拖动明显卡顿；v1.3.1 改为只写元素自身 `transform` 并用 `requestAnimationFrame` 合并，落位后才一次性写变量（见 14.4）。
- v1.2.1 / v1.3.0 / v1.3.1 均未触碰上述渲染路径（v1.3.1 只在 `pointerdown` 时把 `.fz3-atmos` 的 inline `mix-blend-mode` 改 `normal`、松手恢复），第 14.2 / 14.3 节数据继续有效。

### 14.4 交互路径（v1.3.1 / v1.3.2，headless Chrome，1602×944 @ dpr 1.5，165 Hz）

| 指标 | v1.3.0 | v1.3.1 | 做法 |
| --- | --- | --- | --- |
| 拖动 24 次 `pointermove` 的 JS 总耗时 | 每个事件都写 `:root` 变量 → 整页样式失效重算，165 Hz 下明显掉帧 | **146–201 ms**，无 >50 ms 长任务 | 只写眼徽自身 `transform` + `requestAnimationFrame` 合并；`data-dragging` 下临时关脉冲环与全屏 `mix-blend` |
| 点击眼徽 → 气泡出数 | 每次现拉 `/usage` + balance（宿主冷解析约 0.5 s 起） | **65–166 ms**（缓存命中） | dock 后 700ms `prefetchUsage()`，TTL 60 s / 30 s，`visibilitychange` 过期再补 |
| 松手 → 落位 | 1.35 s CSS `left/top` 过渡滑行 | 60 ms 内贴边，170 ms `el.animate` 补间 | 先 `applyPos` 写变量与 `localStorage`，再补间 `transform` 余量到 0 |
| 遮挡 | 可能落在鲸鱼挂件等 `z-index` 更高的元素下面 | 沿吸附边向内 72/144/216/288/360 px 自动让位 | `ourStackZ()`（本层祖先最高 z）vs `foreignZAt()`（`elementsFromPoint` 过滤自身后的最高 z）比较 |
| 拖拽 / 吸附边界（v1.3.2） | 整个窗口（含侧栏、标题栏） | **会话内容区**：左 = 侧栏右缘、上 = 标题栏底缘、右 / 下 = 窗口边缘 | `onCoreDown`（2724）时 `measureRegion()`（2156）现场量一次（`[class*="_sidebarCol"]` + 首个 `header`，header 含 tabs 时自动变高）；拖动期不读布局 |

- 唯一新增的常驻成本是 `document` 上两个被动监听（`pointerdown` 捕获用于点外关闭、`visibilitychange` 用于补预取），都只在气泡打开 / 到 dock 后挂载，卸载时移除；v1.3.2 的额外测量只在 `pointerdown` 发生一次，拖拽期仍零布局读取。
- 没有 `scroll` / `resize` 高频监听；`ResizeObserver` 均 220–260 ms 去抖；拖动期间不 `setState`（只有首次超过 4 px 时置一次 `data-dragging`）。

---

## 15. 开发与发布

### 15.1 本地改动的标准流程

```powershell
# 1) 语法检查（宿主是 Node；client.js 是浏览器模块，node --check 也能查语法）
node --check client.js
node --check index.js

# 2) 通过后同步到安装目录（DSH 从这里加载）
Copy-Item .\client.js .\index.js C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz\ -Force
# 若动了 docs/README，也同步：Copy-Item .\README.md, .\docs\*.md ... -Force

# 3) 整页刷新（client.js）或重启 DSH（index.js）验证
```

### 15.2 打版本与发布（1.3.0 示例）

```powershell
# 1) package.json 的 version 改成 1.3.0
# 2) 看现有 tag 与 HEAD（本例从 v1.2.1 之后发 v1.3.0）
git tag --list
git log --oneline -3

# 3) 提交 + 推分支
git add client.js index.js package.json README.md docs/
git commit -m "v1.3.0: usage/balance bubble, draggable eye badge, theme modes, welcome copy, host /usage"
git push origin main

# 4) 打 tag 并推送
git tag -a v1.3.0 -m "v1.3.0"
git push origin v1.3.0

# 5) 发布后核对哈希
Get-FileHash .\client.js -Algorithm SHA256    # E13E86E1E1CA...（151,180 B / 3,119 行）
Get-FileHash .\index.js  -Algorithm SHA256    # D7EE704...（47,855 B / 1,391 行）
```

发布前检查：`git status` 里不应有 `cache/`、`voice-home.txt`；`package.json` 的 `files` 已含 `docs`；`dsh.client` 仍是 `{ platform: 'web', immediately: true, inject: [] }`。GitHub release 说明直接抄第 19 节对应行。

---

## 16. 验证清单（改完必须过）

### 16.1 DOM 断言（DevTools Console）

```js
// 基础层
document.querySelectorAll('.fz3-layer').length            // 1
document.querySelector('.fz3-core') !== null              // true
document.querySelectorAll('.fz3-hero-brand').length       // 欢迎页时为 1
document.documentElement.dataset.fz3Theme                 // 'dark' | 'light'
// v1.3.0
document.querySelectorAll('.fz3-set-seg').length          // ≥1（设置页）
document.querySelector('.fz3-bubble') === null            // 默认无气泡
document.querySelector('.fz3-peak-badge')                 // 气泡打开后存在
localStorage.getItem('fairy.zzz.theme-mode')              // 'auto' 或 'dark' / 'light'
```

### 16.2 headless Chrome 真实加载（v1.3.0 流程）

开发时用一次性 headless Chrome harness（临时目录，已随交付清理，未发布）。要点：

1. 自签 cookie 连 `http://127.0.0.1:12505`（Web GUI 端口），先给宿主模块发一个合法 authority cookie；用 CDP 打开页面。
2. 等 `#root` 出现（约 2.5s）→ 点欢迎页的「继续」→ 断言 `.fz3-layer` / `.fz3-hero-brand` 数量。
3. 等 `data-phase` 变成 `greet` / `dock`，点 `.fz3-skip2`；读 `.fz3-core` 的 rect、`--fz3-dock-x/y`、`pointerEvents`、`cursor`。
4. `fetch('/fairy-zzz/usage')` 断言 `status 200、ok:true`、keys 含 `now/peak/today/turn`、`peak.label` 有值。
5. 在眼徽中心 `dispatchMouseEvent` 点一下 → 等 `.fz3-bubble` → 读 text / side / mode / loading；截图。
6. 拖拽 6 步（x−40·i, y+14·i）→ 读 `--fz3-dock-x/y` 与 `localStorage['fairy.zzz.dock-pos']`、确认气泡关闭。
7. 设 `localStorage['fairy.zzz.theme-mode']='light'` + `dispatchEvent(new Event('fz3:theme-pref'))` → 读 `html.dataset.fz3Theme` / `body` 背景 / `--fz3-text` / 气泡背景；截图；再复位 `auto`。
8. 检查欢迎页标题 / 预览徽章文案（v1.3.0 改写）与 console 里 error / exception / warning 为零。

产物截图：`docs/img/usage-bubble.jpg`、`docs/img/theme-light.jpg`（拖动位置截图未入库）。

### 16.3 host 自检

```text
GET /fairy-zzz/health          → 200 { ok:true, engine, mood, ... }
GET /fairy-zzz/mood            → 200 idle/thinking/working/done
GET /fairy-zzz/usage?diag=1    → 200 { ok:true, now, peak, today, turn, diag:{ root,zstd,cached,files,recent,ms,at } }
```

v1.3.0 的回归 harness（`tmp/merge/`，一次性）：`t7-routes.mjs`（8 个路由真实 HTTP 断言，T7-ROUTES-PASS）、`t7-engine.mjs`（fake engine：recover / fail-once / fail5xx / race 全 PASS；旧模块可复现 H1 死进程缓存）、`t7-usage-frames.mjs`（payload 内含伪 `b5 2f fd` 不拆帧、partial last frame、prune）、`t7-usage-compare.mjs`（3 份真实日志，新旧实现 today 完全一致）。

---

## 17. 已知坑与排错

1. **DSH 版本升级可能改槽位 / DOM 结构**：品牌位、hero 标题、`_brandIdentity` 这类 `class*="_xxx"` 选择器最脆弱；出问题先 `grep` asar 里的槽位名 / 类名重新对齐（4.3 / 4.4）。
2. **single 槽位抢注册会抛错**：想覆盖别人的 single 槽必须换 priority（更小值赢）。
3. **不要自己打包 React**：`require('react')` 拿宿主单例。
4. **`ctx.effect` 里注册的东西要能在卸载时清理**；所有 register 包 `guard`，坏一个不能拖垮整个 UI。
5. **host 不热重载**（12.4）：改 `index.js` 必须重启；改 `client.js` 刷新页面即可。
6. **GUI 端口不是固定的 12505**：harness 的 cookie authority 必须跟着实际端口；换端口要重签 cookie。
7. **被遮挡的窗口会被浏览器判 hidden**，动画 / 轮询暂停，测出 0 —— 测量时窗口必须置顶且不被遮挡（9.2）。
8. **不要用定时器驱动 `:root` 自定义属性**（8.5 的 4.055s vs 0.82s 教训）；低频更新写元素自身内联 `style`。
9. **不要给常驻全屏层加 `backdrop-filter` / `blur()` / `mix-blend-mode` 动画**。
10. **`pointercancel` 不能当 click 处理**：拖拽被系统打断时只清拖拽态，不能触发气泡 toggle（`onCoreCancel`）。
11. **zstd 会话日志不能整文件解压、也不能 TextDecoder 当文本切**：多帧拼接 + 二进制 payload，必须按 RFC 8878 算帧边界（12.3）。
12. **`/usage` 的 `turn` 可能为 null**：某 session 最后一轮完全在昨天会被 prune 掉，前端必须容忍 null。
13. **价目表 / 节假日按年维护**：`PRICES`（563）、`PEAK_RANGES`（573）、`HOLIDAY_RANGES`（576-590）硬编码，跨年必须更新，否则花费与峰谷判断会错。
14. **`readMessageText` 必须在单条消息内取文本**：取全页会连侧栏 / 设置面板一起念出来。
15. **缓存目录不要提交**：`cache/`、`voice-home.txt` 都在 .gitignore；发布前 `git status` 复核。

---

## 18. 常见改法（recipes）

| 我想… | 改哪里 |
| --- | --- |
| 改问候台词 / 时段 | `greetLine()`（2016-2025）、`greetSlot()`（12-19）、`GREETING()`（20） |
| 改欢迎页标题 / 徽章文案 | `HERO_COPY`（28-31），中英各一套；DOM 改写 effect 在 2408-2464 |
| 改欢迎页眼标尺寸 / 光晕 | `HeroBrandMark`（1812-1828）+ CSS `.fz3-hero-brand`（601-604） |
| 改眼徽大小 / 位置 | CSS 变量 `--fz3-eye` / `--fz3-eye-cy` / `--fz3-eye-gap`（555-557）+ dock 测量（2304-2427，`NARROW` 窄选择器 + `ResizeObserver`） |
| 改呼吸 / 睫毛 / 眼闪 / 故障 | `FZ3_RUNTIME`（1043-1430）与 8.4 表 |
| 改气泡内容 / 计价展示 | `BubbleCard`（2027-2124）；金额格式化 `yuan`（361）、`tokensText`（369）、`clockText`（377） |
| 改价目 / 峰谷时段 / 节假日 | index.js `PRICES`（563）/ `PEAK_RANGES`（573）/ `HOLIDAY_RANGES`（576-590） |
| 改拖拽 / 显隐默认值 / 吸附距离 | `DRAG_KEY` / `EYE_KEY`（23-25）+ `FairySkin` 2141-2147；`SNAP_EDGE`（2653）、区域测量 `measureRegion` / `regionBounds`（2156-2194）；设置页 1470-1798 |
| 改外观三档行为 | `theme-watch`（3006-3095）+ CSS 936-971 + `TOKENS`（539） |
| 加一个槽位组件 | 末尾 `apply` 的 `mount()`（3097-3105）与注册区（3107-3113），照 4.1 写法 |
| 加一个 host 路由 | index.js `apply`（1142-1391）内照现有 `webServer.register` 写，并加 `guard` |

---

## 19. 变更记录

### 1.3.2（2026-11-01）

- **范围**：眼徽拖拽与吸附边界从整个视口收进**会话内容区**（左 = 侧栏右缘，上 = 标题栏底缘，右 / 下 = 窗口边缘）；`measureRegion`（2156）读 `[class*="_sidebarCol"]` 与首个 `header`（height<120 && top<=12），`regionBounds`（2177）做 clamp 兜底；`clampPos`（2251）与默认停靠（2395）改按区域夹取；`snapPos`（2654）/ `avoidOcclusion`（2707）按区域四边判定；`onCoreDown`（2724）在每次按下时重量一次（打开会话后 tabs 使 header 变高会自动适配）。
- **边界兜底**：量不到侧栏或标题栏时退回整个视口；拖动期不读布局，只写元素自身 `transform`。
- **体积**：`client.js` 3,119 → 3,180 行、151,180 → 154,438 B；`index.js` 不变（47,855 B / 1,391 行）；`package.json` 1.3.2；无新资源、无 CSS 变化。
- **验证**：headless Chrome（1602×944 @ dpr 1.5）实测默认停靠 x=358 / y=492（旧版左缘 278 压到侧栏 2px，新版左缘 295 完全在会区内）；拖到最左 x=354（=280+74，rect.x=290 ≥ 280）；拖到最上 y=114（=40+74，rect.y=50 ≥ 40）；右下角仍按吸附 + 遮挡让位到 x=1528 / y=798；localStorage 写入 `{"x":354,"y":320}`；无 console error。

### 1.3.1（2026-11-01）

- **拖拽**：重写为 transform-only + `requestAnimationFrame` 合并（不再每个 `pointermove` 写 `:root`）；新增视口四边吸附（`SNAP_EDGE = 64`，角落两轴同时吸）、170 ms `transform` 补间落位、遮挡让位（与 dsh-whale-widget 等更高 `z-index` 组件共存）；拖动期临时关闭 300% 脉冲环与全屏 `mix-blend` 氛围层；`pointercancel` 不再当点击；眼徽补 `role="button"` / `tabIndex` / Enter / Space。
- **用量气泡**：dock 后 700 ms 预取 `/usage` 与 balance（TTL 60 s / 30 s，页面隐藏不拉），点开即显（65–166 ms）；打开后点页面任意其他位置或按 Esc 关闭；`openBubble` await 后加 `aliveRef` 守卫。
- **文案**：设置页引擎状态删掉「（本地 CPU 推理）」后缀，只显示 `已就绪 · GPT-SoVITS`。
- **体积**：`client.js` 2,882 → 3,119 行、140,594 → 151,180 B；`index.js` 不变（47,855 B / 1,391 行）；`package.json` 1.3.1；无新资源。
- **验证**：headless Chrome（自签 cookie 登录真实 GUI）走通 boot → greet → dock、点眼徽出数、点外 / Esc 关闭、拖拽 + 左边缘 / 右下角吸附 + 鲸鱼挂件遮挡让位，24 次 pointermove 无长任务，全程无 console error / page error。

### 1.3.0（2026-11-01）

- **交互**：眼徽点击弹出「余额 / 今日花费 / 峰谷倒计时」气泡（每轮回答结束自动弹一次本轮结算，18s 自动关）；眼徽可拖拽（记 `localStorage`）并可隐藏 / 复位；外观三档（跟随宿主 / 强制深色 / 强制浅色）；欢迎页标题与「预览版」徽章文案改写（中英）。
- **host**：新增 `GET /fairy-zzz/usage`（增量解析 zstd 会话日志、按峰谷逐笔计价、3s memo、`?diag=1`）。
- **稳定性**：引擎启动代际号 `engineGen` 防「stop 与在飞启动」竞态；`exit` / `error` 清 `enginePromise`（修死进程永久缓存）；`synthesize` 失败 / 5xx 清缓存重试一次；zstd 假帧头修复；跨天 prune；坏 URI → 404 JSON。
- **体积**：`client.js` 1,919 → 2,882 行、93,886 → 140,594 B；`index.js` 943 → 1,391 行、30,812 → 47,855 B；`package.json` 1.3.0。

### 1.3.0 修复清单（按严重度，行号为当前 client.js / index.js）

| 级别 | 问题 | 修复位置 |
| --- | --- | --- |
| HIGH | 引擎 promise 永久缓存已死进程（stop 后在飞启动也串） | index.js `ensureEngine`（405-470）：`engineGen` 代际号（403）+ `exit` / `error` 清 `enginePromise` / `engineChild`；`synthesize`（505-536）失败 / 5xx 清缓存重试一次 |
| HIGH | 静默期回复被先记为已读、永不朗读 | client.js `autoRead`（465-500）：只在真正入队后写 `SEEN_KEY`（458-463），静默期结束补念一次 |
| MED | 官方字标位置只量一次，窗口变化后错位 | client.js 品牌测量（2226-2286）：14×500ms 轮询命中后 `ResizeObserver` + `resize` 260ms 去抖 |
| MED | dock 定位全文档 `div/main/section` 扫描（强制布局） | client.js dock 测量（2287-2411）：`NARROW` 窄选择器（2304）优先，命中即 `ResizeObserver`，全量扫描仅 `tries<=3` |
| MED | 设置页引擎轮询定时器卸载不清、`ping` 无法取消 | client.js `FairySettings`（1470-1798）：`aliveRef`（1475）/ `engineTimer`（1476）/ `pingAbort`（1477，`AbortController`） |
| MED | 试听问候用裸 `Audio`，不受「停止」控制 | client.js 统一 `preview` 播放器（100 声明 / 113-121 停止 / 1655 试听） |
| MED | `pointercancel` 被当成点击，误弹气泡 | client.js 独立 `onCoreCancel`（2788，只清拖拽态；键盘 Enter / Space 另见 2903-2906）；键盘 Enter / Space 可达 |
| LOW | `playClip` 240s 兜底定时器、`BootStage` 640ms 退场定时器卸载不清 | client.js `playClip`（125-159）、`BootStage`（1841-1917） |
| LOW | `Atmos` 环境时钟在隐藏页不暂停 | client.js `Atmos`（1961-2014，`document.hidden` 时停表） |
| LOW | `readStored` 坏 JSON 不清、`readMessageText` 上爬 10 层会念 thinking / 工具文本 | client.js `readStored`（238-262）、`readMessageText`（346-388，`NON_SPEECH_SELECTORS` 369） |
| LOW | 重挂载时重播开机动画 | client.js `bootPlayed`（1433）+ `FairySkin` phase 初始化（2128）/ 重播钩子（2851-2852） |
| LOW | 同一时间桶内第二回合不弹气泡 | client.js `prevMood` 状态迁移（2469-2474）替换 `doneMark` 时间桶 |
| LOW | `openBubble` await 后可能对已卸载组件 setState | client.js `openBubble`（2181-2210）+ `aliveRef` 守卫 |
| LOW | hero 观察器漏 `characterData` | client.js `MutationObserver`（2428，childList + characterData、60ms 去抖） |
| LOW | zstd 假帧头导致 `parsedTo` 卡死、事件数组无界 | index.js `zstdFrameLength`（685-728）、`readUsageEvents`（729-826：增量 + `pruneBefore` 裁剪、上限 `USAGE_CACHE_MAX=256`） |
| LOW | 坏 `%` 编码 → 400（应为 404） | index.js assets 前缀（1181-1203）与 audio 前缀（1205-1225）包 `try/catch` → 404 JSON |

> 这张表说明「为什么代码是这样写的」；各功能的正常行为见第 11-13 节。

### 1.2.1（2026-11-01）

- 删除死代码 / 死样式，**零用户可见行为变化**：从未渲染的 `Waveform`、被 `display:none` 隐藏的 boot HUD / 进度条 / 跳过按钮（含 `barRef/pctRef/onTime` 直写 DOM 代码）、FairySkin 左下角 `fz3-tag`、`index.js` 的 `pingEngine()`；CSS 删 93 条死规则 / 6 个 `@keyframes` / 6 个 CSS 变量、i18n 删 25 条。`client.js` 2,171 → 1,919 行、109,117 → 93,886 B（−14%）；`index.js` 30,859 → 30,812 B。

### 1.2.0

- GPU 优化：背景 40s 漂移静态化、氛围光 14s 呼吸改 500ms JS 环境时钟；dock 待机 GPU 43.1% → 5.1%（约 −88%）；boot 9.85%。

### 1.1.1

- 新增欢迎页品牌位：接管 `conversation.hero.brand.mark`，用 Fairy 眼标替换官方鲸鱼；复用静态 SVG，无新资源。

### 1.1.0

- 性能优化修改版首版：移除常驻 rAF、CSS 时间线化、资源压缩（首屏 ≈9.0 MB → ≈2.9 MB）、静态资源 ETag/304/Range。

### 1.0.x

- 皮肤本体：开机视频 → 居中问好 → 眼徽；侧栏品牌位替换；本地 GPT-SoVITS 朗读；设置面板；`/health` / `/mood` / `/tts` 等路由。

---

## 20. 参考与链接

- 性能报告：[docs/PERFORMANCE.md](PERFORMANCE.md)（含 GPU 归因与失败方案）
- 上游插件：[AssassinVIX/fairy-zzz-plugin](https://github.com/AssassinVIX/fairy-zzz-plugin)
- 眼徽动效参考：[Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH)（Apache-2.0）
- 本仓库：[SkyWingDN/dsh-fairy-zzz](https://github.com/SkyWingDN/dsh-fairy-zzz)
- 许可证：[LICENSE](../LICENSE)、[NOTICE-fairy-dsh.md](../NOTICE-fairy-dsh.md)、[licenses/](../licenses/)
