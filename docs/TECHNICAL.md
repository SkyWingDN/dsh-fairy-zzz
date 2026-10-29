# dsh-fairy-zzz 插件技术说明（v1.1.1）

> 目标读者：**没有参与过本项目、但要继续维护或修改这个插件的人 / AI 智能体**。读完这篇文档，应该能独立定位代码、改功能、打版本、发布到 GitHub，并复现验证。
> 最后更新：2026-10-28，对应版本 v1.1.1（在 1.1.0 的"性能优化修改版"之上新增了欢迎页品牌位）。
> 姊妹文档：[docs/PERFORMANCE.md](PERFORMANCE.md)（性能优化报告：为什么这么改、数据怎么量出来的）。

---

## 0. 一分钟速览

- 插件名 / 包名：`dsh-fairy-zzz`（目录名同样是这个）。
- 它做什么：把 DeepSeek Harness 的 Web UI 换成《绝区零》Fairy 的 H.D.D 终端 —— 整屏开机视频 → 居中问好（按时段播预录语音）→ 收缩成聊天区左缘的常驻眼标；同时提供可选的本地 GPT-SoVITS 朗读（仓库不含模型/引擎）。
- 代码在哪（三处，同步关系见第 2 节）：
  - 实际运行目录：`C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz`（DSH 加载的是这里）
  - 本地 git 仓库：`C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz`（发布用，内容应与运行目录一致）
  - 远端仓库：`https://github.com/SkyWingDN/dsh-fairy-zzz`（public，MIT；另有 release v1.1.0）
- 代码只有三个入口文件：`index.js`（host 侧，Node 路由 / TTS / 情绪）、`client.js`（浏览器侧，React 组件 + 全部 CSS + 动效运行时）、`cordis.patch.yml`（一行 insert 完成插件装配）。
- 图标 / 视频 / 试听音频都在 `assets/`；发布版约 5.5 MB（其中开机视频 2.4 MB）。
- 当前安装的 DSH 版本：`0.2.1-rc.3`（`C:\softs\DeepSeek Harness\resources\app.asar`，桌面 Electron 壳）。DSH 升级后前端 bundle 的 hash 会变，但插件只依赖**槽位名**和少量 data 属性，通常不需要改。

---

## 1. 版权与来源（改代码前先读）

这是**第三方修改版**，不是官方插件。上游与来源：

| 角色 | 项目 / 人 | 许可 | 本仓库如何使用 |
| --- | --- | --- | --- |
| 原始插件 | [AssassinVIX/fairy-zzz-plugin](https://github.com/AssassinVIX/fairy-zzz-plugin)（B 站 BV1d4HK6eE3g 作者 黑塔小蛋糕） | MIT | 本仓库的代码基础 |
| 眼标 SVG、动画几何与时长、眼闪/故障参数 | [Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH)（B 站 BV1SD4C63EZz 作者 橙汁本色） | Apache-2.0，Copyright 2026 Chengzhibense，commit `d639887a386b0de6fef2e61c97dc268631854591` | 眼标 SVG 与动效语义的参考；`FAIRY_EYE_SVG` 里保留了 SPDX 注释 |
| 修改者 / 本仓库维护者 | SkyWingDN | MIT（修改部分） | 性能优化 + 1.1.1 欢迎页品牌位 |
| 素材版权 | miHoYo / HoYoverse | — | 开机视频与角色形象；仅个人桌面改造，勿商用 |

对应文件：`LICENSE`（MIT 全文）、`NOTICE-fairy-dsh.md`（上游署名 / Fairy-DSH 声明）、`licenses/Apache-2.0.txt`、`licenses/Fairy-DSH-NOTICE.txt`、`licenses/Fairy-DSH-TRADEMARKS.md`。**改这个插件时不要把这几处署名删掉**，这是许可要求，也是社区约定。

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
| host | `index.js` | DSH 主进程（Node） | 注册 HTTP 路由（`ctx.webServer.register`）、读写文件、spawn GPT-SoVITS 进程、读取 Agent 注册表判断"AI 是否在思考" |
| client | `client.js` | Web UI 页面里 | 注入 CSS、注册 UI 槽位、轮询 host 路由、播音频、渲染 React 组件 |

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
- `ctx.get('agents')` 可拿 AgentRegistry，用来判断是否有 agent 正在跑（情绪/眼睑状态的数据源，见 `createMoodTracker`）。
- 路由挂在 DSH 自带 web server 上，路径前缀固定 `/fairy-zzz/`。

### 3.4 client 契约（client.js）

```js
window.__ModuleLoader__.load({
  id: 'dsh-fairy-zzz',
  factory(require) {
    const React = require('react')
    return {
      inject: ['slots'],
      apply(ctx) { /* 注入样式、注册槽位 */ },
    }
  },
})
```

- 页面加载插件时由宿主的 ModuleLoader 调用 `factory`；`require('react')` 拿到的是宿主提供的 React 单例（**不要自己打包 React**）。
- `apply(ctx)` 里能做四件事：`ctx.get('locale')` 注册文案、`ctx.get('theme')` 覆盖主题 token、往 `document.head` 插 `<style>`、`ctx.slots.inject(key, () => ctx.slots.register(spec, Component))` 注册 UI。

### 3.5 动手改代码时最常用的 ctx 能力

| API | 用途 | 本插件里的调用点 |
| --- | --- | --- |
| `ctx.get('locale')` | 注册 i18n 词条 | `client.js` `apply` 开头（`locale.register(NS,'zh-CN',ZH)`） |
| `ctx.get('theme')` | 覆盖 `--dsw-alias-*` 主题 token | `theme.overrideTokens(PKG, TOKENS)` |
| `ctx.slots.inject / register` | 占坑 / 注册组件 | 见第 4 节槽位表 |
| `ctx.effect(fn)` | 注册可清理副作用 | host 路由、`<style>` 清理 |
| `ctx.webServer.register` | 注册 HTTP 路由（host） | 第 10 节 |
| `ctx.get('agents')` | Agent 注册表快照 | `createMoodTracker` |

> 所有 inject/register 都包在 `guard(label, fn)` 里：DSH 版本不兼容时只 `console.warn`，不会让整个 UI 崩掉。新增注册请沿用这个模式。

---

## 4. 槽位（slot）系统：本插件改了界面的哪些位置

### 4.1 语义（读源码得出的规则）

- 每个 slot 声明了 `kind`（`single` / `list`）和作用域。`single` 槽同一时刻只渲染一个 occupant，**priority 数值最小的生效**；没有 occupant 时渲染宿主给的 `fallback`。
- 想替换别人的 single 槽：注册一个 **更小 priority** 的条目"遮住"它；同 priority 抢同一个 single 槽会抛错 `single slot ... already has a registration ... register at a different priority to shadow it`。
- `list` 槽（如 `shell.overlay`）用 `order` 决定层序；注册时传 `label` 的槽（如 `settings.section`）会出现在对应 UI 列表里。
- 推荐写法（本插件用的）：`ctx.slots.inject(key, () => ctx.slots.register({ name: key, ...spec }, Component))` —— inject 先占坑，注册在回调里执行，宿主重新渲染时不会重复注册。

### 4.2 本插件注册的 6 个槽位（client.js 末尾 apply）

| 槽位 | spec | 组件 | 作用 |
| --- | --- | --- | --- |
| `sidebar.brand.mark` | `{ id: 'fairy-zzz-brandmark', priority: 100 }` | `BrandMark` | 侧栏品牌图标（官方优先，本插件实际靠 CSS 隐藏官方再叠自己的，见 4.3） |
| `sidebar.brand.name` | `{ id: 'fairy-zzz-brandname', priority: 100 }` | `BrandName` | 侧栏品牌文字 `FAIRY Ⅲ · H.D.D` |
| `conversation.hero.brand.mark` | `{ id: 'fairy-zzz-hero-brand', priority: 0 }` | `HeroBrandMark` | **1.1.1 新增**：新会话欢迎页标题左侧图标（替换官方鲸鱼） |
| `shell.overlay` | `{ id: 'fairy-zzz-skin', order: 24 }` | `FairySkin` | 全屏皮肤层：开机/问好/左下眼标/背景/文案（含 mood 轮询、dock 定位） |
| `shell.overlay` | `{ id: 'fairy-zzz-atmos', order: 12 }` | `Atmos` | 氛围光（低于 skin 的层级，纯静态 CSS 渐变） |
| `conversation.chat.assistant-actions` | `{ id: 'fairy-zzz-voice', order: 20, label: '朗读' }` | `VoiceAction` | 每条 AI 回复旁的"朗读"按钮 |
| `settings.section` | `{ id: 'fairy-zzz-settings', order: 40, label: 'Fairy' }` | `FairySettings` | 设置 → Fairy 面板（语音开关、引擎状态、重播、测试） |

### 4.3 侧栏品牌位为什么这么绕

官方 `@deepseek-ai/dsh-client-ui-brand-official` 也注册了 `sidebar.brand.mark` / `sidebar.brand.name`（priority 0，比本插件的 100 小，所以**官方赢**）。而官方字标是 SVG，没有文本节点，**没法靠 i18n 改**。于是本插件的做法是：

1. 用 CSS 把官方字标藏掉：`[class*="_brandName"],[class*="_brandMark"]{visibility:hidden!important}`（`client.js` 约 829 行）；
2. 用宿主已有的测量数据算出品牌行位置，把 `.fz3-sb-brand` 定位到同一位置：JS 量 `[class*="_brandIdentity"]` / `[class*="_logoRow"]` 的 rect，写 `--fz3-brand-top/left/h`（`client.js` 约 1806-1826 行）；
3. 自己的 Fairy 眼标 + `Fairy` 字标用 `position:fixed` 画在这个位置，只在 `dock` 阶段显示。

### 4.4 欢迎页品牌位（1.1.1 新增）

DSH 新会话欢迎页的标题行结构：

```text
[HeroShell]  span.fishHitbox → renderSlot('conversation.hero.brand.mark', { size: 34, className: 'WOwLGG_fish' },
                                        fallback: <HeroFish hovering />)  →  span.WOwLGG_headline  「探索未至之境」+「预览版」
```

- 槽位声明在 `@deepseek-ai/dsh-client-ui-conversation/lib/client.js`（`C:\softs\DeepSeek Harness\resources\app.asar\dsh\node_modules\...`，asar 内，Electron 的 fs 可读）：`offset 668,759` 附近是 HeroShell，`offset 767,813` 附近是 `children: { 'conversation.hero.brand.mark': { kind: 'single', scope: 'root' } }`。**这些偏移量随 DSH 版本变化**，搜槽位名字符串即可重新定位。
- 官方**没有插件占用**这个槽，渲染的是 fallback `HeroFish`（鲸鱼）。因此本插件注册 `priority: 0` 的条目后，鲸鱼被**完全替换**，不需要额外隐藏。
- 实现要点（`client.js` 约 1573 行 `HeroBrandMark`）：
  - 组件收到 `{ size, className }`：`size` 固定 34px；`className` 必须拼接到自己的 `className` 上（官方 hover 摆动的 `fish` 类，以及它的 `:hover animation`），否则欢迎页 hover 时眼标不会摆动。
  - 内部复用静态 `FAIRY_EYE_SVG`（34px 大小下细节足够，且**不挂 .fz3-eye 类** → 不会启动呼吸/故障动画，零额外开销）。
  - CSS：`.fz3-hero-brand` / `.fz3-hero-brand-eye`（`client.js` 约 459-466 行），只做弹性居中和静态 `drop-shadow` 光晕。
- 验证结果（1624×1042 窗口）：`document.querySelectorAll('.fz3-hero-brand').length === 1`；元素 outerHTML 的 class 是 `fz3-hero-brand WOwLGG_fish`；rect 为 `[819,421,34,34]`，即原鲸鱼的位置；控制台无报错。效果图见 [docs/img/hero-brand-mark.png](img/hero-brand-mark.png)。

---

## 5. client.js 文件地图（2152 行，约 108 KB）

> 行号基于 v1.1.1。改代码前先 `grep` 函数名定位，不要只信行号。

| 行号（约） | 区块 | 内容 |
| --- | --- | --- |
| 1-6 | 模块头 | `window.__ModuleLoader__.load`、`require('react')`、`h = React.createElement` |
| 8-20 | 常量 | `NS='fairy-zzz'`、`PKG='dsh-fairy-zzz'`、`VOICE_KEY='fairy.zzz.voice'`、`SEEN_KEY='fairy.zzz.seen'`、`greetSlot()`（按时段返回 morning/noon/afternoon/evening/night，5-11/11-14/14-18/18-23/其余）、`GREETING()` → `/fairy-zzz/assets/voice/greet-<slot>.mp3` |
| 22-31 | SVG 资产 | `FAIRY_EYE_SVG`（256×256 viewBox "-1 -1 162 162"，眼标本体，含 defs 渐变 / clipPath `#fz3-lid-clip`；带 SPDX 注释）、`FAIRY_PULSE_SVG`（5 圈睫毛脉冲环）、`FAIRY_THREADS_SVG`（feTurbulence 拉丝滤镜） |
| 33-107 | i18n | `ZH` / `EN` 词条表；`t(key)` 优先用 `locale.bind(NS)` 的 tr，缺词回退 ZH |
| 109-153 | 声音状态 | 模块级 `voice = { enabled, busy, speaking, error }`，`useVoice()` 订阅式 hook（不用 Redux/Context） |
| 155-280 | 语音工具 | `playClip(url, token)`（Audio 播放 + token 防串音）、`cleanSpeakable`、`chunkText(text, 90, 8)`（按句切段送 TTS）、`readStored/readBool/writeStored`（localStorage 容错） |
| 283-390 | 读回答文本 | `readMessageText` / `NON_SPEECH_SELECTORS` / `speechTextOfRow` / `readAssistantText` / `autoRead`：从消息 DOM 里只抓"最终回答"，跳过思考块、工具卡片、过程区 |
| 371-392 | 主题 token | `baseTokens`（约 20 个 `--dsw-alias-*` / `--dsw-specific-*` 深蓝玻璃配色），`TOKENS` 同时给 light/dark（插件固定深色观感） |
| 397-916 | **CSS 字符串** | 全部样式，见第 6 节分区表 |
| 917-1304 | **FZ3 动效运行时** | `FZ3_RUNTIME_BEGIN/END` 标记包裹；详见第 8 节。CSS 驱动、无常驻 rAF |
| 1306-1339 | `CoreGlyph` | React.memo；挂 DOM 后在 `useEffect` 里 `fz3EyeRuntime.mount(el)`，mood 变化时 `setState`；渲染 6 份内联 SVG（眼标 ×1 + 花屏克隆 ×5） |
| 1341-1559 | `FairySettings` | 设置 → Fairy 面板；`/health` 5s 轮询（页面隐藏时停）、引擎 start/stop、重播问候/开机、测试/停止朗读 |
| 1561-1597 | 品牌组件 | `BrandMark`（侧栏眼标）、`HeroBrandMark`（欢迎页，1.1.1）、`BrandName`（FAIRY Ⅲ · H.D.D） |
| 1600-1609 | `Waveform` | 朗读时的小波形（4 根 i 标签，纯 CSS 动画） |
| 1611-1732 | `BootStage` | 全屏开机视频：单路 `boot-opt.mp4`（`object-fit:contain`，四周用静态 poster 模糊铺底），进度条直接写 DOM（`barRef/pctRef`，不走 setState）；自动播放被拦时先静音 + 提示点击解锁声音；播完 640ms 后 `onDone` |
| 1734-1788 | `VoiceAction` | 回复旁"朗读"按钮；挂载时 `autoRead` 触发自动朗读 |
| 1776-1789 | `Atmos` | React.memo，纯静态氛围光层 |
| 1790-1797 | `greetLine()` | 按时段的居中问好中文台词 |
| 1799-2082 | `FairySkin` | 主组件：`phase`（boot/greet/dock）+ `mood`（idle/thinking/working/done）；品牌位置测量、dock 位置测量、mood 轮询、问候音频、SKIP 按钮、dock 后渲染 `fz3-sb-brand` |
| 2084-2152 | apply / 挂载 | `guard` 容错、locale、样式注入、主题 token、`mount()` helper、6 个槽位注册 |

---

## 6. CSS 分区（都在第 397 行的 `CSS` 大字符串里）

| 行号（约） | 分区 | 说明 |
| --- | --- | --- |
| 398-417 | `:root` 变量 | `--fz3-cyan/blue/violet/...` 色板、字体、`--fz3-eye`（clamp 自适应眼径 132-330px）、`--fz3-dock-x/y/size` |
| 418-454 | 全局壳 | body 背景/网格/扫描线/滚动条/焦点光/hover 发光 |
| 455-466 | 品牌 | `.fz3-brandmark`（侧栏）、`.fz3-hero-brand`（欢迎页，1.1.1） |
| 467-494 | 图层 | `.fz3-layer`（固定全屏、层级）、`.fz3-bg` / `.fz3-hero`（`hero.webp` 背景图） |
| 495-536 | 开机舞台 | `.fz3-boot` / `.fz3-boot-fill` / HUD / 进度条 / 声音提示 |
| 537-594 | 全息核心 | `.fz3-eye` 尺寸与居位、四层解剖结构、`.fz3-eye-halo` 静态多层径向渐变、`.fz3-eye-svg`、睫毛旋转 |
| 586-594 | 脉冲环 | 5 圈同心描边共享 4s 时间线 |
| 595-624 | 设置面板 | `.fz3-set-*` 样式 |
| 625-651 | 故障（glitch） | `data-glitch="threads/blocks"` 下的滤镜/切片/克隆规则 |
| 652-704 | 待机小动作 | 呼吸关键帧 `fz3-breath-a..d`、眼闪 `.fz3-eye-flicker`、`.fz3-eye[data-lid="thinking"]` 半闭眼剪裁、`[data-fz3-suspended]` 暂停全部时间线 |
| 705-742 | 问候文案 | 镜面倒影标题、kicker、sub、SKIP |
| 743-803 | 左下角坞 | `.fz3-core` / `.fz3-dock` / `.fz3-sb-brand`（含 829 行隐藏官方品牌） |
| 804-897 | 其它 | 设置按钮、滚动条、杂项 |
| 898-916 | 响应式 | 矮视口收起次要行、压缩字号 |

**动画性能约定**：所有持续动画只用 `transform` / `opacity` 或纯 CSS `animation`，**不要**在 JS 里逐帧写 style；大光晕用静态径向渐变代替 `blur()/drop-shadow` 的逐帧重栅格化；页面隐藏时整层 `animation-play-state:paused`。

---

## 7. 组件清单速查

| 组件 | 类型 | 挂在哪 | 备注 |
| --- | --- | --- | --- |
| `FairySkin` | 状态机（phase/mood） | `shell.overlay` order 24 | 全屏皮肤主层，唯一持有全局阶段状态的地方 |
| `BootStage` | 局部 | FairySkin 内 | 开机视频 + HUD，完成后回调 |
| `CoreGlyph` | memo | FairySkin | 眼标舞台，交给 FZ3 运行时；6 份 SVG 只渲染一次 |
| `Atmos` | memo | `shell.overlay` order 12 | 静态氛围光 |
| `BrandMark` / `BrandName` | 纯展示 | sidebar 两个槽 | 官方赢（priority），靠 CSS 隐藏 + 自绘 |
| `HeroBrandMark` | 纯展示 props({size,className}) | `conversation.hero.brand.mark` | 1.1.1；静态眼标替换鲸鱼 |
| `VoiceAction` | 交互 | assistant-actions | 朗读按钮 + 自动朗读 |
| `FairySettings` | 交互 | settings.section | 设置页 |
| `Waveform` | 纯展示 | VoiceAction / 设置页 | 播放指示 |

---

## 8. FZ3 动效运行时（client.js 917-1304）

这是本插件性能优化最核心的部分：**原版用常驻 `requestAnimationFrame` 每帧计算并写 SVG style，本版改为 CSS 时间线 + 极少量事件定时器**。

### 8.1 对外 API

```js
const fz3EyeRuntime = (() => { ... return { mount, unmount, setState, suspend, resume } })()
```

| API | 作用 |
| --- | --- |
| `mount(el)` | 绑定舞台根节点 `.fz3-eye`；缓存 5 个花屏切片、绑可见性事件、启动故障/眼闪调度 |
| `unmount()` | 清定时器、解绑事件、移除 `data-fz3-suspended` |
| `setState(mood)` | 只切 `data-lid="thinking"` 和 `data-glitch` 属性；thinking/working 时眼睑半闭（CSS clipPath） |
| `suspend() / resume()` | 页面 hidden / visible 时暂停/恢复（挂 `data-fz3-suspended` → 所有 CSS 时间线 `animation-play-state:paused`） |

### 8.2 时间常量

- `FZ3_LASH_PERIOD_S = 15`：睫毛旋转一周 15s（与 Fairy-DSH 参考一致；改这里要同步改 CSS 的 `animation-duration`，运行时恢复角度时会从 CSS 现取值）。
- `FZ3_GLITCH_MAX_MS = 900`：一次花屏视觉的硬上限，定时器丢了也不会一直挂着。
- `FZ3_FAULT`：threads（水平拉丝，feTurbulence）与 blocks（5 条横切片）两类故障的拍数、拍间隔、收尾时长、位移/亮度/对比档位，参数与参考文档一致。

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
| 花屏频率/参数 | `FZ3_FAULT`（拍数、间隔、位移、亮度）与 `scheduleGlitch` 的随机区间 |
| 思考态半闭眼形状 | `FAIRY_EYE_SVG` 里 `#fz3-lid-clip` 的 path（`.fz3-lid-clip-shape`） |
| 大眼尺寸/位置 | CSS 变量 `--fz3-eye` / `--fz3-eye-cy` / `--fz3-eye-gap` |

---

## 9. 主题与本地化

- 主题：`baseTokens` 覆盖 `--dsw-alias-bg-base/layer-1/layer-2/border/brand/label/state-*` 等 token，经 `theme.overrideTokens(PKG, TOKENS)` 生效；light/dark 都给同一套深色值（插件强制深色观感）。
- 本地化：`locale.register('fairy-zzz','zh-CN',ZH)` 与 `'en-US',EN`；文案用 `t('greet.kicker')` 这种 key 取。加新文案：ZH/EN 两份都要加，否则回退 ZH。
- 设置持久化 key：`fairy.zzz.voice`（朗读开关）、`fairy.zzz.seen`（已朗读消息 id，防重复）。

---

## 10. index.js 文件地图（948 行，约 31 KB）

| 行号（约） | 区块 | 内容 |
| --- | --- | --- |
| 1-6 | imports | node:fs / fs.promises / crypto / child_process / path / url |
| 8-25 | 导出 | `export const name = 'fairy-zzz'`、`inject = ['webServer']`（apply 在第 735 行） |
| 27-31 | 路径 | `HERE`、`ASSETS`、`CACHE`（可用环境变量 `FAIRY_CACHE_DIR` 覆盖）、`TTS_PORT`（`FAIRY_TTS_PORT`，默认 9800） |
| 33-62 | 引擎目录发现 | 优先级：环境变量 → `voice-home.txt` → 插件旁 `../voice`；`voiceHomeSource()` 说明来源 |
| 64-108 | 引擎校验 | `cleanHome`（去引号/合并分隔符）、`inspectVoiceDir`（要求 `fairy_server.py` + `GPT-SoVITS/` + `models/` + python 可解析）、`saveVoiceHome`（写 `voice-home.txt`） |
| 110-134 | 运行时解析 | `syncVoiceHome`（每次用前重新解析，改路径后不用重启） |
| 135-161 | 常量/工具 | `TTS_SPEED = 1.04`、`MAX_CHARS = 500`、MIME 表、`sizeOf` |
| 163-280 | **静态文件服务** | 缓存头策略、`etagOf`（size-mtime）、304 协商（If-None-Match / If-Modified-Since）、Range/206、`sendFile`、`sendJson`、`readBody`（64 KB 上限） |
| 310-378 | 记忆化 | `createMemo(ttl)` / `createAsyncMemo(ttl)`（in-flight 去重）；TTL：`MOOD_CACHE_MS=300`、`ENGINE_CACHE_MS=1500`、`VOICE_CACHE_MS=3000` |
| 379-452 | 引擎生命周期 | `engineState`（fetch `127.0.0.1:9800/health`，1.5s 超时）、`ensureEngine`（spawn `python fairy_server.py --port`，日志写 `<引擎目录>/server.log`）、`stopEngine`（taskkill /T /F） |
| 454-496 | TTS | 串行队列 `enqueue`、并发同文本共享 `pending`、`synthesize`（POST /tts 到引擎，拿 wav）、`cleanText` |
| 498-733 | **情绪追踪** | `createMoodTracker(ctx)`：权威数据源 `ctx.get('agents')`（AgentRegistry），不可用时退回事件机（`MOOD_ACTIVITY_EVENTS` / `MOOD_CLEAR_EVENTS`）；`MOOD_INFER_TTL_MS=10min`、思考窗口 2500ms、完成窗口 2400ms；诊断写 `cache/mood.log` |
| 735-947 | **apply / 路由** | 7 个 `webServer.register`（见第 11 节） |

---

## 11. host 路由表

| 方法/路径 | 类型 | 作用 | 关键行为 |
| --- | --- | --- | --- |
| `GET /fairy-zzz/mood` | exact | 返回情绪快照 `{ mood, running, ... }` | 300ms memo；`?diag=1` 绕过缓存并附 diag/events/log 路径 |
| `GET /fairy-zzz/assets/*` | prefix | 提供 `assets/` 下的静态文件 | 路径必须落在 `ASSETS` 内（防目录穿越），ETag/304/Range |
| `GET /fairy-zzz/audio/<sha1>.wav` | prefix | 提供 TTS 合成缓存 | 只接受 40 位 sha1 文件名；`cache/` 目录用 immutable 缓存 |
| `GET /fairy-zzz/health` | exact | 引擎 + 语音 + 情绪综合状态 | 1.5s 超时的引擎健康探测（1.5s memo），返回 engine/voiceHome/speed 等 |
| `GET /fairy-zzz/voice-home` | exact | 读当前引擎目录与校验结果 | — |
| `POST /fairy-zzz/voice-home` | exact | 保存引擎目录 `{ home }` | `{ probe: true }` 只校验不保存；空 home 清除提示文件 |
| `GET /fairy-zzz/engine?action=status|start|stop` | exact | 引擎状态 / 启动 / 停止 | start 走 ensureEngine，stop 走 taskkill；成功后清 memo |
| `POST /fairy-zzz/tts` | exact | `{ text }` → `{ ok, url, cached, seconds }` | sha1(text) 缓存 `cache/<hash>.wav`；同文本并发合并；失败 502 |

---

## 12. 静态资源与缓存策略（性能关键）

- 静态资源（`assets/`）：`Cache-Control: public, max-age=0, must-revalidate` + 强 ETag（`"<size hex>-<mtime hex>"`）+ Last-Modified → 刷新走 304，不再重传几 MB。
- TTS 合成缓存（`cache/`）：`public, max-age=31536000, immutable`（内容寻址，永不失效）。
- Range 请求（`<video>`/`<audio>`）：支持 `206 Partial Content`、`Accept-Ranges: bytes`、`If-Range`（强 ETag 或时间）；带 Range 的请求不返回 304（否则视频空转）；HEAD 只回头不回体。
- host 侧热路径用短 TTL memo（mood 300ms / engine 1.5s / voice 3s），避免 900ms 一次的轮询真的每次都读盘 / 打引擎。

---

## 13. 资产清单（仓库发布版 31 个文件，约 5.5 MB）

| 路径 | 大小 | 用途 |
| --- | --- | --- |
| `assets/boot-opt.mp4` | 2,394,692 B | 开机动画（已压缩版；原版 boot.mp4 4.8 MB 不发布） |
| `assets/hero.webp` | 23,014 B | 问好页背景光晕图（原 hero.png 1.9 MB 已转 webp） |
| `assets/poster.jpg` | 77,642 B | 开机视频封面 / 视频未就绪时的铺底 |
| `assets/icon-180.png` | 32,158 B | 插件图标 |
| `assets/voice/greet-{morning,noon,afternoon,evening,night}.mp3` | 72-101 KB ×5 | 预录问候（按时段选一条） |
| `screenshots/*.png` | 4 张 | README 展示图 |
| `docs/img/before-after-dock-eye.png` | 234,947 B | 性能对比图 |
| `docs/img/hero-brand-mark.png` | 52,357 B | 1.1.1 欢迎页品牌位效果图 |

**不发布**：`cache/`（TTS 缓存，几十 MB）、`voice-home.txt`（本机路径）、GPT-SoVITS 模型/引擎/参考音频、旧资产（`boot.mp4`、`hero.png`、`*.wav`）、`*.bak`。见 `.gitignore`。

---

## 14. 性能：本版做了什么、效果如何

完整报告见 [docs/PERFORMANCE.md](PERFORMANCE.md)，这里只列结论与改点：

**核心改动**：上游用常驻 `requestAnimationFrame` 主循环逐帧计算并写 `style.transform` / SVG `clipPath`；本版改为：
1. 全部常驻动效 → CSS `@keyframes`（四层呼吸、睫毛、脉冲环、发光），rAF 归零；
2. 思考态眼睑 → 静态 `clipPath` 形状（唯一有意简化的动效，因为逐帧裁切 SVG 是原版最大的开销）；
3. 大光晕 / 眼闪 → 静态多层径向渐变，去掉逐帧 `blur()` / `drop-shadow`（重栅格化）；
4. 开机舞台：单路 `boot-opt.mp4`（原两路视频 + 全屏 `blur(46px)`）、进度条直写 DOM（不走 setState）；
5. 轮询感知页面可见性（mood 900ms / health 5s 在 hidden 时停），请求去重；
6. dock 定位缓存容器 + resize 合并（原来每 600ms 全量扫描 DOM 强制布局）；
7. 资源压缩 + ETag/304/Range（9.0 MB → 2.9 MB 首屏运行时下载）。

**同机 headless Chrome 10 秒稳态（主线程占一个核的比例）**：

| 场景 | 原版 | 本版 |
| --- | --- | --- |
| 侧栏待机 | 31.2% | **1.8%** |
| 模型思考中 | 30.9% | **1.6%** |
| 问候页待机 | 41.1% | **2.5%** |

**取舍**：思考态眼睑不再随 1440ms 相位开合（固定半闭）。除此外外观/动效语义与上游一致；系统"减少动态效果"不被遵循（刻意保持完整动效）。

---

## 15. 开发与发布流程

### 15.1 改代码

1. 改 `C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz\client.js`（或 index.js / assets）。
2. `node --check client.js` 与 `node --check index.js` 做语法检查（client.js 是浏览器代码，但语法层面 Node 也能校验；注意它内部用 `window`，只能 check 不能运行）。
3. 刷新 DSH 页面（client 改动无需重启；host 改动要重启 DSH），看效果；用第 16 节的方法自动验证。

### 15.2 同步到仓库并发布

```powershell
# 1) 复制改动到仓库
Copy-Item C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz\client.js  C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz\client.js -Force
Copy-Item C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz\index.js   C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz\index.js -Force

# 2) 改版本号（package.json 的 version；README/NOTICE 如需）
# 3) 提交
cd C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz
git add -A
git commit -m "feat: ..."
git push origin main
```

- 版本号是 `package.json` 的 `version`（1.1.0 → 1.1.1）。插件安装目录的 `package.json` 不必同步（DSH 不看它，但保持一致性更省心）。
- 发布远端需要 HTTPS 凭据（git credential manager 已存 SkyWingDN 的 token）。本机有代理 `http://127.0.0.1:7897`；若 push 失败，用 `git -c http.proxy= -c https.proxy= push` 直连重试。
- 打 tag / release：`git tag v1.1.1 && git push origin v1.1.1`，再在 GitHub 建 release（可选）。
- 校验一致性：`Get-FileHash` 对比安装目录与仓库的 `client.js` / `index.js`。

### 15.3 安装目录与 profile

- 插件通过 `C:\Users\SkyWingDN\.dsh\profiles\desktop\package.json` 的 `link:` 依赖 +
  `cordis.patch.yml` 里 `id: fairy-zzz-skin` 生效。
- 新机器安装：`install-windows.ps1`（Windows，支持 `-ProfilePath / -VoiceHome / -Uninstall`），或直接把仓库 clone 到 `.dsh\plugins` 再按 README 加 patch。

---

## 16. 验证方法（无需用户手动操作）

### 16.1 最省事：看 DOM

刷新页面后，在 DevTools Console 里：

```js
document.querySelectorAll('.fz3-hero-brand').length   // 1 → 欢迎页品牌位已替换
document.querySelector('.fz3-hero-brand').outerHTML    // class 应包含 WOwLGG_fish
document.querySelectorAll('.fz3-eye').length           // ≥1 → 眼标舞台已挂载
```

注意：要看到欢迎页，需等开机动画结束或在 Console 里临时 `display:none` 掉 `.fz3-boot / .fz3-screen / .fz3-dock`（BootStage 是全屏遮罩）。

### 16.2 自动化：headless Chrome + 自签 session cookie（本项目实际用的方法）

GUI 端口 `http://127.0.0.1:12427`（以运行时 context 里的 URL 为准）用 cookie 鉴权，直接 GET 会 401。可以自己造一个合法 cookie：

1. 读 secret：`C:\Users\SkyWingDN\.dsh\.credentials.yaml` 里 `records."client-connection/browser-session".payload.secret`（base64url，32 字节）。**这是敏感信息，不要写进仓库/文档/对话。**
2. authority = `127.0.0.1:<port>`（与浏览器地址栏 host 一致）。
3. cookie 名 = `dsh-auth-` + base64url(sha256(authority))。
4. cookie 值 = `v1.` + base64url(JSON `{version:1, authority, issuedAt, expiresAt}`) + `.` + base64url(HMAC-SHA256(secret, body))；`version` 必须是 1，有效期不超过 30 天（用 29 天即可）。index 页的 `isAuthenticated` 只认 v1。
5. 起 headless Chrome 并连 CDP：

```text
chrome --headless=new --remote-debugging-port=9333 \
  --user-data-dir=<临时目录> --window-size=1624,1042 \
  --force-device-scale-factor=1 --autoplay-policy=no-user-gesture-required
```

用 Node 自带 `WebSocket` 连 `PUT /json/new?about:blank` 返回的 `webSocketDebuggerUrl`，然后依次：`Network.setCookie`（domain `127.0.0.1`）→ `Page.navigate` → 等加载 → 点掉首启"继续"弹窗 → `Runtime.evaluate` 断言 → `Page.captureScreenshot`。

6. 断言参考：`.fz3-hero-brand` 数量 1、class 含官方 `WOwLGG_fish`、无 console error、rect ≈ [819,421,34,34]（1624×1042 下与原鲸鱼位置一致）。
7. **收尾**：删掉存了 cookie 的临时文件、Chrome profile 目录和截图。

### 16.3 host 侧快速自检

```powershell
# 带上浏览器 cookie 后：
Invoke-WebRequest http://127.0.0.1:12427/fairy-zzz/health      # 200，engine/voiceHome 等字段
Invoke-WebRequest http://127.0.0.1:12427/fairy-zzz/mood        # {"mood":"idle",...}
```

- 插件代码是 DSH 动态从磁盘读的：改完 `client.js` 后刷新页面即可；host 的 `index.js` 改动需要重启 DSH 才生效。

---

## 17. 常见坑（都是踩过的）

1. **不要指望从 asar 里直接 grep**：`C:\softs\DeepSeek Harness\resources\app.asar\dsh\...` 是 asar 虚拟路径，外部 `rg`/`pwsh` 打不开（os error 3）；要么用 Electron 的 `fs`（插件宿主进程里就是），要么先用 `npx asar extract` 解出来再看。
2. **槽位竞争**：single 槽同 priority 会抛错；想替换官方实现要用更小 priority，或者走 CSS 隐藏 + 自绘（侧栏品牌就是后者）。
3. **重复 SVG id**：`FAIRY_EYE_SVG` 被内联 6 份（眼标本体 + 5 个花屏克隆），defs 里的 id 重复；浏览器取文档里第一个定义，所有克隆共用同一份渐变，属于**预期行为**，不要试图给每份改 id（会显著增大 DOM）。
4. **官方字标不可 i18n**：它是 SVG，没有文本；要换只能隐藏 + 自绘，并用测量定位。
5. **开机视频有声音**：桌面壳一般允许自动播放，浏览器会拦。代码的策略是"先带声播放，被拦就静音播放 + 提示点击一次解锁"，别把这段删了。
6. **页面隐藏必须停**：`visibilitychange` 时停 mood 轮询（900ms）与 CSS 时间线（`data-fz3-suspended`）；新增轮询/动画要遵守同样约定，否则后台会一直烧 CPU。
7. **不要引入构建步骤或新依赖**：`client.js` 是浏览器原样加载的普通脚本，`index.js` 是 ESM；**不要 import `@deepseek-ai/*`**（宿主不保证这些包在插件解析路径里）。
8. **系统"减少动态效果"被刻意忽略**：插件始终保持完整动效（用户要求观感一致）；不要自作主张加 `prefers-reduced-motion` 降级。
9. **不要提交** `cache/`、`voice-home.txt`、模型文件、`*.bak`；仓库 `.gitignore` 已经覆盖。
10. **改完记得同步仓库**：安装目录和仓库是两个副本，只改安装目录 = 下次重装/给用户发版时丢失。

---

## 18. 常用改法（recipes）

| 想做的事 | 步骤 |
| --- | --- |
| 改欢迎页问候语/时段文案 | 改 `greetLine()`（`client.js` 约 1790 行）与 `ZH.greet.*` 词条 |
| 换问候音频 | 替换 `assets/voice/greet-<slot>.mp3`（保持文件名，`GREETING()` 按时段拼路径） |
| 换开机视频 | 替换 `assets/boot-opt.mp4`（建议 H.264 + faststart，控制在 2.5 MB 内），封面换 `poster.jpg` |
| 换问好页背景 | 替换 `assets/hero.webp`（CSS 在 `client.js` 约 482 行） |
| 换眼标样式 | 改 `FAIRY_EYE_SVG`（注意 6 份克隆共用同一字符串；改完保留 SPDX 注释） |
| 给某槽位加自己的 UI | `mount('<slot.name>', { id: '...', order/priority }, YourComponent)`，参照 `client.js` 末尾 6 行 |
| 加一个 host 路由 | 在 `index.js` 的 `apply` 里 `ctx.effect(() => webServer.register({ kind, path, handler }))`，参照第 11 节现有路由 |
| 调性能 | 先看 `docs/PERFORMANCE.md` 的测量方法；原则：不新增常驻 rAF、不逐帧写 style、大模糊改静态渐变、轮询要感知可见性 |

---

## 19. 变更记录

| 版本 | 变更 |
| --- | --- |
| 1.1.1 | 新增欢迎页品牌位：接管 `conversation.hero.brand.mark`，把新会话页 DeepSeek 鲸鱼换成静态 Fairy 眼标（复用 `FAIRY_EYE_SVG`，保留官方 hover 动画类） |
| 1.1.0 | 性能优化修改版：rAF → CSS 时间线、思考眼睑静态化、单路压缩视频、静态渐变、ETag/304/Range、资源 9.0 → 2.9 MB（主线程 31-41% → 1.6-2.5%）、去掉本地模型/引擎/缓存 |
| 1.0.x | 上游 AssassinVIX/fairy-zzz-plugin 的原版 |

---

## 20. 相关链接

- 上游插件：[AssassinVIX/fairy-zzz-plugin](https://github.com/AssassinVIX/fairy-zzz-plugin)
- 动画参考：[Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH)（Apache-2.0）
- 本仓库：https://github.com/SkyWingDN/dsh-fairy-zzz
- 性能报告：[docs/PERFORMANCE.md](PERFORMANCE.md)
- 参考视频：BV1d4HK6eE3g（黑塔小蛋糕）、BV1SD4C63EZz（橙汁本色）
