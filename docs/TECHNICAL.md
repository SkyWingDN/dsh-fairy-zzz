# dsh-fairy-zzz 插件技术说明（v1.7.0）

> 目标读者：**没有参与过本项目、但要继续维护或修改这个插件的人 / AI 智能体**。读完这篇文档，应该能独立定位代码、改功能、打版本、发布到 GitHub，并复现验证。
> 最后更新：2026-11-04，对应版本 v1.6.2（v1.6.2 删掉设置页「外观三档」，皮肤始终自动跟随宿主深浅色；「试听问候」改为每次点击都从本时段 5 条语音里重新随机抽一条并显示台词，不再复用开机抽中的那条。v1.6.0 把眼徽渲染从 v1.5.0 的「4 份 HTML 合成层 + CSS steps 动画」换回 **单 SVG + 15fps JS 向量重绘**：合成层的旋转 / 缩放动的是已经栅格化的位图副本，眼睑 clip 边、深蓝眼眶这类高对比边缘在重采样时会出现台阶 / 发虚（用户截图报「像素没覆盖到」）；v1.6.0 每 66.7ms 直接写 `#corners` / `#fz3-lens` / `#fz3-drift` 的 SVG transform 属性，由 Skia 按设备像素重新抗锯齿，边缘始终干净。代价：隔离 harness GPU 0.99% → 1.52%（+0.5 点）、主线程 0% → 0.8%；真实页面同轮 A/B 在噪声内（2.28% → 2.10 / 1.98%），相对 v1.4.0 的 9.3–11.8% / 47–54% 仍是约 1/6 与 1/50；192px 原生截图清晰度 +2%–4%。没有新增常驻层，动画数量与 v1.5.0 相同（4 个，全部 15fps）。v1.5.1 修问候语音 greet-night-2 的断句停顿：v1.4.0 那 20 条 mp3 本就按早期草稿台词合成，其中全角「；」不在引擎 cut5 的切分符号里，导致「我值班 / 您不睡」连读；现按同一份草稿台词重新合成，把该处「；」改成「。」，并在合成后于该句号的自然停顿处补 0.20s 静音（总停顿约 0.44s）；注意引擎 `merge_short_text_in_array(threshold=5)` 会把「我值班。」（4 字）与「您不睡，」（4 字）合并回同一片段，仅改标点只有模型自然的 ~0.2s 微停顿；屏幕字幕仍保留简洁版、与音频不强制逐字一致，V1 原版 5 条未动；v1.5.0 眼徽动效重做：4 份静态 SVG 副本 + 叶片公转 / 目光微动，持续动画用 steps() 量化到 15fps，GPU / CPU 再降约 80% / 90%；v1.4.0 新增问候语音库：每个时段 5 条（原 1 条 + 新录 4 条），按 Fairy 人设撰写 / 录制，随机播放且避免连续重复，屏幕台词为音频的简洁理解版；v1.3.4 修气泡脚注半句与眼标悬停原生提示；v1.3.0 新增：眼徽用量 / 花费气泡、眼徽拖拽与隐藏、外观三档（跟随 / 深色 / 浅色）、欢迎页文案改写，以及 host 侧 GET /fairy-zzz/usage 路由与 5 个稳定性修复；v1.3.1 把拖拽重写为 transform-only + 四边吸附 + 遮挡让位、用量改为预取缓存（点开即显）、气泡支持点外 / Esc 关闭、设置页删掉「（本地 CPU 推理）」后缀；v1.3.2 把拖拽与吸附范围从整个视口收进**会话内容区**（左 = 侧栏右缘、上 = 标题栏底缘，右 / 下 = 窗口边缘），边界在每次 pointerdown 时实时重量；v1.2.1 的死代码清理成果保留；v1.3.3 只改文案：气泡里的「用量 / 花费 / 峰谷」统一成「电费」口径（用量→电费、余额→电费余额、今日花费→今日电费、峰谷→五倍电费 / 十倍电费，峰段窗口提示为「十倍电费」），客户端对旧宿主的「高峰 / 空闲」字样做兜底改写）。
> 姊妹文档：[docs/PERFORMANCE.md](PERFORMANCE.md)（性能优化报告：为什么这么改、数据怎么量出来的）。

---

## 0. 一分钟速览

- 插件名 / 包名：`dsh-fairy-zzz`（目录名同样是这个）。
- 它做什么：把 DeepSeek Harness 的 Web UI 换成《绝区零》Fairy 的 H.D.D 终端 —— 整屏开机视频 → 居中问好（按时段从 5 条预录语音里随机播一条）→ 收缩成聊天区左缘的常驻眼标；同时提供可选的本地 GPT-SoVITS 朗读（仓库不含模型 / 引擎）。
- v1.3.0 起，眼标还是**交互入口**：点一下弹出「电费余额 / 今日电费 / 电费倍率倒计时」气泡，每轮回答结束自动弹一次「本轮结算」；按住可以拖到任意位置，设置里可隐藏眼标；外观始终跟随宿主深浅色。v1.3.1 起拖拽只写眼标自身的 `transform`（rAF 合并，165 Hz 下无长任务），松手会吸附到视口四边（距边 64px 内，角落两轴同时吸），落点被更高 `z-index` 的悬浮组件盖住时沿边让位；气泡点外任意位置或 Esc 即可关闭，dock 后 700ms 预取用量，点开 65–166ms 出数。v1.3.2 再把拖拽 / 吸附限制在会话内容区（不越过左侧栏和标题栏），边界在按下时实时测量，打开会话导致标题栏变高也会自动适配。v1.3.3 把气泡文案统一成「电费」口径（谷时「五倍电费」、峰时「十倍电费」），客户端兼容旧宿主的「高峰 / 空闲」字样。v1.6.2 删掉设置页的外观三档开关（外观始终跟随宿主）并把「试听问候」改成每次点击都随机抽本时段一条。
- 代码在哪（三处，同步关系见第 2 节）：
  - 实际运行目录：`C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz`（DSH 加载的是这里）
  - 本地 git 仓库：`C:\Users\SkyWingDN\Desktop\dsh-fairy-zzz`（发布用，内容应与运行目录一致）
  - 远端仓库：`https://github.com/SkyWingDN/dsh-fairy-zzz`（public，MIT；release：https://github.com/SkyWingDN/dsh-fairy-zzz/releases ）
- 代码只有三个入口文件：`index.js`（host 侧，Node 路由 / TTS / 情绪 / 用量统计）、`client.js`（浏览器侧，React 组件 + 全部 CSS + 动效运行时）、`cordis.patch.yml`（一行 insert 完成插件装配）。
- 体积（v1.6.2）：`client.js` 163,113 B / 3,332 行；`index.js` 47,892 B / 1,392 行；`package.json` 1.6.2；发布版资源约 7.8 MB（开机视频 2.4 MB + 25 条问候语音 2.71 MB）。
- 性能（GPU 数据来自 v1.2.0，v1.2.1 / v1.3.0 / v1.3.1 / v1.3.2 均未触碰渲染路径）：dock 待机 GPU 从 v1.1.1 的约 43% 降到约 5%（同机 165 Hz headless 实测，约 −88%）；主线程约 1–2.5%，首屏运行时下载约 2.9 MB。v1.3.0 新增的用量气泡、主题、拖拽全部是**按需 / 静态**路径，没有新增常驻动画；v1.3.1 的拖拽重写、用量预取、点外关闭同样是交互期 / 低频路径，没有新增常驻开销；v1.3.2 只在 `onCoreDown` 时多量一次侧栏 / 标题栏矩形（一次 `getBoundingClientRect`，拖动期不再读布局），同样无常驻成本（见 14.4）；v1.3.3 只改气泡文案与格式化函数，未触碰渲染路径与定时器；v1.3.4 只改文案并删掉一个 SVG `<title>`；v1.4.0 只新增预录音频、常量表与随机选择函数，不进渲染路径、不加定时器；v1.5.0 用 4 份 HTML 合成层 + CSS steps() 把眼徽持续动画压到 15fps；v1.6.0 为修边缘重采样把眼徽改回单 SVG、用 15fps JS ticker 写 SVG 属性（隔离测量 +0.5 GPU 点 / +0.8% 主线程，真实页面噪声内），见 8.6 与 14.6；v1.6.2 只删设置项与改问候选择逻辑，未触碰渲染路径与定时器。
- 当前安装的 DSH：桌面 Electron 版（`C:\softs\DeepSeek Harness\resources\app.asar`，0.2.1-rc 系列）。DSH 升级后前端 bundle 的 hash 会变，但插件只依赖**槽位名**和少量 data 属性，通常不需要改。

---

## 1. 版权与来源（改代码前先读）

这是**第三方修改版**，不是官方插件。上游与来源：

| 角色 | 项目 / 人 | 许可 | 本仓库如何使用 |
| --- | --- | --- | --- |
| 原始插件 | [AssassinVIX/fairy-zzz-plugin](https://github.com/AssassinVIX/fairy-zzz-plugin)（B 站 BV1d4HK6eE3g 作者 黑塔小蛋糕） | MIT | 本仓库的代码基础 |
| 眼标 SVG、动画几何与时长、眼闪 / 故障参数 | [Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH)（B 站 BV1SD4C63EZz 作者 橙汁本色） | Apache-2.0，Copyright 2026 Chengzhibense，commit `d639887a386b0de6fef2e61c97dc268631854591` | 眼标 SVG 与动效语义的参考；`FAIRY_EYE_SVG` 里保留了 SPDX 注释 |
| 修改者 / 本仓库维护者 | SkyWingDN | MIT（修改部分） | 性能优化 + 1.1.1 欢迎页品牌位 + 1.3.0 用量 / 拖拽 / 主题 + 1.3.3 电费文案 + 1.4.0 问候语音库 |
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
| `ctx.remote.account` | 账户余额接口 | `fetchBalance()`（气泡里的「电费余额」行） |
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

### 4.2 本插件注册的 7 个槽位（client.js 末尾 `apply` 内，搜 `conversation.hero.brand.mark` / `settings.section`）

| 槽位 | spec | 组件 | 作用 |
| --- | --- | --- | --- |
| `sidebar.brand.mark` | `{ id: 'fairy-zzz-brandmark', priority: 100 }` | `BrandMark` | 侧栏品牌图标（官方优先，本插件实际靠 CSS 隐藏官方再叠自己的，见 4.3） |
| `sidebar.brand.name` | `{ id: 'fairy-zzz-brandname', priority: 100 }` | `BrandName` | 侧栏品牌文字 `FAIRY Ⅲ · H.D.D` |
| `conversation.hero.brand.mark` | `{ id: 'fairy-zzz-hero-brand', priority: 0 }` | `HeroBrandMark` | 1.1.1 新增：新会话欢迎页标题左侧图标（替换官方鲸鱼） |
| `shell.overlay` | `{ id: 'fairy-zzz-skin', order: 24 }` | `FairySkin` | 全屏皮肤层：开机 / 问好 / 左下眼标 / 背景 / 文案 / 气泡（含 mood 轮询、dock 定位、拖拽、主题） |
| `shell.overlay` | `{ id: 'fairy-zzz-atmos', order: 12 }` | `Atmos` | 氛围光（低于 skin 的层级，纯静态 CSS 渐变 + 500ms 环境时钟） |
| `conversation.chat.assistant-actions` | `{ id: 'fairy-zzz-voice', order: 20, label: '朗读' }` | `VoiceAction` | 每条 AI 回复旁的"朗读"按钮 |
| `settings.section` | `{ id: 'fairy-zzz-settings', order: 40, label: 'Fairy' }` | `FairySettings` | 设置 → Fairy 面板（朗读、眼标拖动 / 显隐 / 复位、引擎、重播、测试） |

### 4.3 侧栏品牌位为什么这么绕

官方 `@deepseek-ai/dsh-client-ui-brand-official` 也注册了 `sidebar.brand.mark` / `sidebar.brand.name`（priority 0，比本插件的 100 小，所以**官方赢**）。而官方字标是 SVG，没有文本节点，**没法靠 i18n 改**。于是本插件的做法是：

1. 用 CSS 把官方字标藏掉：`[class*="_brandName"],[class*="_brandMark"]{visibility:hidden!important}`（client.js CSS 段搜 `[class*="_brandName"]`）；
2. 用宿主已有的测量数据算出品牌行位置，把 `.fz3-sb-brand` 定位到同一位置：JS 量 `[class*="_brandIdentity"]` / `[class*="_logoRow"]` 的 rect，写 `--fz3-brand-top/left/h`（`FairySkin` 内搜 `--fz3-brand-top`；先轮询 14×500ms，命中后用 `ResizeObserver` + resize）；
3. 自己的 Fairy 眼标 + `Fairy` 字标用 `position:fixed` 画在这个位置，只在 `dock` 阶段显示。

### 4.4 欢迎页品牌位与文案（1.1.1 / 1.3.0）

DSH 新会话欢迎页的标题行结构：

```text
[HeroShell]  span.fishHitbox → renderSlot('conversation.hero.brand.mark', { size: 34, className: 'WOwLGG_fish' },
                                        fallback: <HeroFish hovering />)  →  span.WOwLGG_headline  「探索未至之境」+「预览版」
```

- 槽位声明在 `@deepseek-ai/dsh-client-ui-conversation/lib/client.js`（asar 内，Electron 的 fs 可读）：`offset 668,759` 附近是 HeroShell，`offset 767,813` 附近是 `children: { 'conversation.hero.brand.mark': { kind: 'single', scope: 'root' } }`。**这些偏移量随 DSH 版本变化**，搜槽位名字符串即可重新定位。
- 官方**没有插件占用**这个槽，渲染的是 fallback `HeroFish`（鲸鱼）。因此本插件注册 `priority: 0` 的条目后，鲸鱼被**完全替换**，不需要额外隐藏。
- 实现要点（`HeroBrandMark`，搜 `function HeroBrandMark`）：
  - 组件收到 `{ size, className }`：`size` 固定 34px；`className` 必须拼接到自己的 `className` 上（官方 hover 摆动的 `fish` 类，以及它的 `:hover animation`），否则欢迎页 hover 时眼标不会摆动。
  - 内部复用静态 `FAIRY_EYE_SVG`（34px 下细节足够，且**不挂 .fz3-eye 类** → 不会启动呼吸 / 故障动画，零额外开销）。
  - CSS：`.fz3-hero-brand` / `.fz3-hero-brand-eye`（CSS 段搜 `.fz3-hero-brand`），只做弹性居中和静态 `drop-shadow` 光晕。
- **v1.3.0 新增：欢迎页文案改写**。`HERO_COPY` 给中英两套 `{ headline, badge }`；`FairySkin` 里用 `MutationObserver` 监听 `[class*="_headline"] [class*="_titleGroup"]`，在 hero 重新挂载或宿主重渲染文本（`characterData`）时改写标题与「预览版」徽章；文本已经正确就不写，**空闲时零定时器**（参考实现是每 900ms 轮询一次）。
- 验证结果（1624×1042 窗口）：`document.querySelectorAll('.fz3-hero-brand').length === 1`；元素 outerHTML 的 class 是 `fz3-hero-brand WOwLGG_fish`；rect 为 `[819,421,34,34]`，即原鲸鱼的位置；控制台无报错。效果图见 [docs/img/hero-brand-mark.png](img/hero-brand-mark.png)。

---

## 5. client.js 文件地图（3,332 行，163,113 B，v1.6.2）

> **行号会随改动漂移，本表刻意不写行号，改用「搜索锚点」定位**：在 client.js 里 `grep` 锚点列的符号即可。
> 当前校准值：CSS 段 611–1099、FZ3 运行时 1104–1653、组件区 1661–3332（`FZ3_RUNTIME_END` 在 1653）。
> 1100 行之前的旧文档行号仍然适用；之后的行号整体比 v1.5.1 后移，不要再照抄旧编号。

| 搜索锚点 | 区块 | 内容 |
| --- | --- | --- |
| `window.__ModuleLoader__.load` | 模块头 | `require('react')`、`h = React.createElement` |
| `const NS =`、`GREET_LINES`、`const HERO_COPY` | 常量 / 问候语库 / 存储键 | `NS` / `PKG`、`VOICE_KEY`、`SEEN_KEY`、`greetSlot()`、`GREET_LAST_KEY`、`GREET_LINES`、`currentGreeting()`、`GREETING()`、`DRAG_KEY` / `POS_KEY` / `EYE_KEY`、`HERO_COPY`、`CJK_RE` |
| `const FAIRY_EYE_SVG`（`FZ3_ASSETS_BEGIN/END`） | SVG 资产 | `FAIRY_EYE_SVG`（viewBox `-1 -1 162 162`，defs 渐变 + clipPath `#fz3-lid-clip` + 眼睑 `#fz3-lid-rim`）、`FAIRY_PULSE_SVG`（5 圈脉冲环）、`FAIRY_THREADS_SVG`（feTurbulence 拉丝滤镜） |
| `const ZH =` / `const EN =` | i18n | 各 5 条：`boot.sound`、`greet.kicker/sub/tap`、`dock.error` |
| `const voice =`、`function playClip`、`function speakText` | 声音状态 + 语音工具 | `voice`、`playClip`、`fetchVoice`、`chunkText`、`speakText` |
| `function readStored` | 本地存储容错 | `readStored` / `readBool` / `writeStored` |
| `async function fetchUsage`、`function yuan`、`function feeText` | 余额 / 用量 + 格式化 | `runtime.ctx`、`fetchUsage`、`fetchBalance`、`usageCache`、`USAGE_TTL` / `BALANCE_TTL`、`loadUsage` / `loadBalance` / `prefetchUsage`、`yuan`、`tokensText`、`clockText`、`feeText` |
| `function readMessageText` / `function autoRead` | 读回答文本 + 自动朗读 | `readMessageText`、`NON_SPEECH_SELECTORS`、`autoRead` |
| `const baseTokens` / `const TOKENS` | 主题 token | `baseTokens`、`lightTokens`、`TOKENS` |
| `const CSS =` | **CSS 字符串** | 全部样式（489 行），分区见第 6 节 |
| `/* FZ3_RUNTIME_BEGIN */` | **FZ3 动效运行时** | `FZ3_RUNTIME_BEGIN/END` 包裹；`fz3Random`、`fz3Scheduler`、`fz3EyeRuntime`、`elementUnit`、`ensureFilter`、`cache`、`writeDrift`、`stepGaze`、`startTicker` / `stopTicker`、`clearGlitch`、`armGlitchWatchdog`、`setPulse`、`layoutBlocks`、`flickerOnce` / `scheduleFlicker`、`stopGaze` / `scheduleGaze`、`scheduleGlitch`、`playStateTransition`、`normalizeState`、`setState`、`suspend` / `resume`、`mount` / `unmount`；详见第 8 节 |
| `const bootHooks` | 开机标记 | `bootHooks`、`bootPlayed` |
| `const CoreGlyph = React.memo` | `CoreGlyph` | `useEffect` 里 `mount(el)`；**v1.6.0 DOM：`.fz3-eye > .fz3-eye-halo + .fz3-eye-pulse + .fz3-eye-svg`（innerHTML 一份静态 `FAIRY_EYE_SVG`，运行时向 SVG 里插入 `#fz3-drift` / `#fz3-lens` 两个 g）+ `.fz3-glitch`（5 份克隆）+ flicker + flash** |
| `function FairySettings` | `FairySettings` | 设置 → Fairy：`/health` 5s 轮询（隐藏页停）、朗读开关、眼标拖动 / 显隐 / 复位、引擎目录与启停、重播问候 / 开机、随机试听 / 测试 / 停止朗读 |
| `function BrandMark`、`function HeroBrandMark`、`function BrandName` | 品牌三件 | 侧栏眼标（34px 静态 SVG）、欢迎页品牌位（1.1.1，拼接官方 `className` 保留 hover）、侧栏文字 `FAIRY Ⅲ · H.D.D` |
| `function BootStage` | `BootStage` | 全屏开机视频：单路 `boot-opt.mp4` + 静态 poster 模糊铺底；静音兜底与 18s 超时 |
| `function VoiceAction` | `VoiceAction` | 回复旁「朗读」按钮；挂载时触发 `autoRead` |
| `function Atmos` | `Atmos` | **v1.5.0 起纯静态渲染**（5 个 div），呼吸完全交给 `.fz3-atmos-glow` 的 `14s steps(14,end)` CSS 时间线 |
| `function greetLine` | `greetLine()` | 居中问好中文台词：与语音同源（简洁字幕版） |
| `function BubbleCard` | `BubbleCard` | v1.3.0 用量气泡：只在展开时挂载；usage 态「电费余额 / 今日电费 / 五倍或十倍电费」，turn 态「本轮电费 / …」；每秒 tick 倒计时 |
| `function FairySkin` | `FairySkin` | 主组件：`phase`（boot/greet/dock）+ `mood`；会话内容区测量、`closeBubble/openBubble`、品牌 / dock `ResizeObserver`、hero `MutationObserver`、mood 900ms 轮询（隐藏页停）、拖拽子系统 |
| `apply(ctx)` | apply / 挂载 | `guard` 容错、locale、样式注入（HMR 就地更新）、`theme.overrideTokens`、`theme-watch`（含 `probeLight`）、`mount()` helper、7 条槽位注册 |

---

## 6. CSS 分区（`const CSS =` 大字符串，文本 489 行；v1.6.1 含眼睑 rim / 问候上移补丁共 498 行，v1.6.2 删外观开关 −9 行）

> 同样用锚点定位：`grep` 锚点列里的选择器 / 注释。CSS 段当前在 client.js 的 611–1099 行。

| 搜索锚点 | 分区 | 说明 |
| --- | --- | --- |
| `:root{--fz3-mute` | `:root` 变量 + 全局壳 | `--fz3-*` 色板 / 字体 / `--fz3-eye`（clamp 132–330px）/ `--fz3-dock-x/y/size`；body 背景、`body::before` 静态渐变、滚动条、输入框 |
| `.fz3-brandmark{` | 品牌 | `.fz3-brandmark`（侧栏）、`.fz3-hero-brand`（欢迎页，1.1.1）、`.fz3-brandname` |
| `.fz3-layer{` | 图层 | `.fz3-layer`、`.fz3-screen`（dock 后 `visibility:hidden` 停画）、`.fz3-bg` / `.fz3-hero`（`hero.webp`） |
| `.fz3-boot{` | 开机舞台 | `.fz3-boot` / `-boot-fill`（静态 poster 模糊铺底）/ `video` / 扫描线 / 静音提示 |
| `.fz3-core{` | **全息核心（v1.6.0 重写）** | `.fz3-core` 定位与 dock 过渡；`.fz3-eye` 网格；`.fz3-eye::before` 静态径向柔光 + `fz3-halo-breathe 6.4s steps(3)`；**`.fz3-eye-svg`（单 SVG 容器：`position:absolute;inset:0;z-index:2`，`transition:transform .28s` 供 hover 放大）与 `.fz3-eye-svg svg{width/height:100%;overflow:visible}`**；`.fz3-eye-pulse`（`fz3-lash-pulse 6.4s steps(24)`）。v1.5.0 的 gaze / body / plate / blades / anatomy / shine 六组规则已全部删除 |
| `.fz3-set{` | 设置页 | 现役 `.fz3-set-*` 样式 |
| `.fz3-gband{` | 信号故障 | `data-glitch="threads/blocks"` 的滤镜 / 切片 / 克隆；`.fz3-gband` 只在 blocks 时提升图层；滤镜目标为 `.fz3-eye-svg` |
| `#fz3-lid-rim` | 待机小动作 + 关键帧 | 半闭眼：`clip-path:url(#fz3-lid-clip)` 裁 `#eye-anatomy`（形状固定，几何直接写在 path `d` 里）；**眼睑 rim**：`#fz3-lid-rim` 默认 `display:none`、thinking 态 `inline`，给裁切边界压同色描边消去 AA 白边；眼闪、完成庆祝、`[data-fz3-suspended]` 暂停全部时间线；现行关键帧 `fz3-halo-breathe` / `fz3-lash-pulse` / `fz3-atmos-breathe` 等；v1.5.0 的 `fz3-orbit` / `fz3-lens-breathe` 已删除 |
| `.fz3-copy{` | 问候文案 | 镜面倒影标题、kicker / sub、SKIP2 按钮 |
| `.fz3-sb-brand{` | 左下角坞 + 朗读按钮 | 字标、`.fz3-voice` 三态 |
| `[class*="_brandName"]` | 官方字标隐藏 + 氛围 + 响应式 | 隐藏官方字标、`.fz3-rim` / `.fz3-bay`、`.fz3-atmos*`（glow 带 `fz3-atmos-breathe 14s steps(14)`）、`@media` 矮视口 |
| `* v1.3.0 新增` | v1.3.0 段头 | 共用变量与分节说明 |
| `html[data-fz3-theme="light"]` | 浅色主题 | 静态覆盖 |
| `cursor:grab` | 眼徽交互 | dock 态 `pointer-events:auto`、拖动光标、`[data-dragging="1"]` 下关脉冲环 / 关全屏混合、hover 放大 `.fz3-eye-svg` |
| `.fz3-bubble{` | 用量气泡 | `.fz3-bubble` 及行 / 峰谷徽章 / 倒计时；纯渐变，无 `backdrop-filter` |

**v1.6.2 的 CSS 变化**：删掉设置页外观分段开关的 9 行规则（`.fz3-set-seg` / `.fz3-set-segbtn` + 两条 `html[data-fz3-theme="light"]` 覆盖），CSS 文本 498 → 489 行；其余不变。

**v1.6.0 的 CSS 变化（相对 v1.5.0）**：CSS 文本 500 → 484 行，含眼睑 rim 补丁后 **489 行**。① 删除 `.fz3-eye-gaze` / `-body` / `-plate` / `-blades` / `-anatomy` / `-shine` 六组显隐规则与 `@keyframes fz3-orbit` / `fz3-lens-breathe`；② 新增 `.fz3-eye-svg` 容器与内部 `svg` 尺寸规则；③ 花屏滤镜与 hover 放大目标改为 `.fz3-eye-svg`；④ 光晕 / 脉冲 / 氛围光的时间线保持不变；⑤ 删除失效的 `.fz3-lid-clip-shape{transform:translateY(15.5px)}`（页面有 8 份重复 `#fz3-lid-clip`，`url()` 解析到侧栏字标副本，主眼从来拿不到这个 transform），改为把几何写死在 path `d`；⑥ 新增默认隐藏的 `#fz3-lid-rim`（thinking 态显示），修半闭眼白边；⑦ 死样式清理：删 `--fz3-line` 定义与两条 `.fz3-tag` 浅色覆盖。

**v1.5.0 的 CSS 变化（历史）**：CSS 文本 492 → 500 行；新增 4 层容器规则与 `fz3-orbit` / `fz3-lens-breathe` / `fz3-halo-breathe` / `fz3-lash-pulse` / `fz3-atmos-breathe`，删除旧四层呼吸与 `fz3-corners`（v1.6.0 已把前两者删掉）。

**v1.2.0–v1.4.0 的历史变更（保留结论）**：v1.2.0 删除 `body::before` 的 40s 漂移、把光晕换成静态径向渐变；v1.2.1 清掉 93 条死规则（CSS 517 → 383 行）；v1.3.0 新增浅色主题 / 设置开关 / 眼徽交互 / 气泡（383 → 489 行，全部静态或按需）；v1.3.1 只改眼徽交互段（489 → 492 行）；v1.4.0 不动 CSS。

**动画性能约定（v1.6.0 修订，改动画前必读）**：
1. **小面积高对比图标（眼徽这类 SVG）必须向量重绘**：由 JS 按 15fps 写 SVG `transform` 属性，让 Skia 每帧重新抗锯齿；**不允许**把同一份 SVG 复制成多个 HTML 合成层再做旋转 / 缩放（合成器动的是栅格化位图，边缘会重采样出台阶 / 发虚——v1.5.0 的教训，见 8.6 / 17.17）；
2. **全屏层仍然只能静态或 `steps()` 低帧率**（≤1–2fps），见 8.5；
3. **量化到约 15fps**：JS ticker 用 `1000/15` ms、CSS 用 `steps(n)`，且周期取 1/15s 的整数倍（1.6s = 24 帧、6.4s = 96 帧），让多段动画落在同一帧网格；
4. **禁止 rAF 逐帧主循环、禁止高频写 `:root` 变量**（实测每次样式写入约 +0.4 GPU 点，降频无用）；
5. 不要对全屏 fixed 层做逐帧动画 / 混合；光晕用静态多层渐变，不用 `blur()` / `drop-shadow` 动画；`backdrop-filter` 一律不用；
6. 页面隐藏时靠 `[data-fz3-suspended]` 暂停 CSS 时间线，同时 `stopTicker()` 停掉 JS ticker。

---

## 7. 组件清单速查

| 组件 | 类型 | 挂在哪 | 备注 |
| --- | --- | --- | --- |
| `FairySkin` | 状态机（phase/mood） | `shell.overlay` order 24 | 全屏皮肤主层，唯一持有全局阶段状态的地方；拖拽（v1.3.1：transform-only + 四边吸附 + 遮挡让位；v1.3.2：拖拽与吸附边界限制在会话内容区）/ 气泡 / 主题监听的宿主 |
| `BootStage` | 局部 | FairySkin 内 | 开机视频（单路 + 静态 poster 模糊铺底），完成后回调；v1.2.1 起无 HUD / 进度条 |
| `CoreGlyph` | memo | FairySkin | 眼标舞台，交给 FZ3 运行时；**v1.6.0：只渲染一份静态眼 SVG（`.fz3-eye-svg`）+ 5 份花屏克隆（`display:none` 常驻，只在 blocks 故障的几百 ms 里显示）；运行时向 SVG 内部插入 `#fz3-drift` / `#fz3-lens` 做目光与呼吸** |
| `Atmos` | memo | `shell.overlay` order 12 | **v1.5.0：无状态、无 effect、无定时器的纯静态渲染**（5 个 div）；呼吸交给 CSS `fz3-atmos-breathe 14s steps(14,end)` |
| `BrandMark` / `BrandName` | 纯展示 | sidebar 两个槽 | 官方赢（priority），靠 CSS 隐藏 + 自绘 |
| `HeroBrandMark` | 纯展示 props({size,className}) | `conversation.hero.brand.mark` | 1.1.1；静态眼标替换鲸鱼 |
| `VoiceAction` | 交互 | assistant-actions | 朗读按钮 + 自动朗读 |
| `FairySettings` | 交互 | settings.section | 设置页（朗读 / 眼标 / 引擎 / 重播 / 随机试听） |
| `BubbleCard` | 交互（局部状态） | FairySkin 内 | v1.3.0 用量气泡（1.3.3 起文案为电费口径）；只在展开时挂载，尺寸量完回报父层做翻面 / 夹边；数据来自父层预取缓存（v1.3.1），点外 / Esc 由父层关闭 |

---

## 8. FZ3 动效运行时（client.js 1103–1652，`FZ3_RUNTIME_BEGIN/END` 标记之间）

这是本插件性能优化最核心的部分。原版用常驻 `requestAnimationFrame` 每帧计算并向 SVG 元素写 `style.transform`；v1.2.0 改成「零常驻 JS、全 CSS 时间线」；v1.5.0 把眼徽拆成 4 个 HTML 合成层、用 `steps()` 压到 15fps；**v1.6.0 为了修边缘重采样，把眼徽动画改成「单 SVG + 15fps JS ticker 写 SVG 属性」，光晕 / 脉冲 / 氛围光仍是 CSS 时间线**。

### 8.1 对外 API

```js
const fz3EyeRuntime = (() => { ... return { mount, unmount, setState, suspend, resume } })()
```

| API | 作用 |
| --- | --- |
| `mount(el)` | 绑定舞台根节点 `.fz3-eye`；`cache(el)` 取出内部 SVG、把 `#fairy` 包进 `#fz3-drift`、把 `#eye-anatomy` 的内容移进 `#fz3-lens`；启动 15fps ticker；排故障 / 眼闪 / 目光微动 |
| `unmount()` | 停 ticker（`stopTicker`）、清 gaze / glitch / flicker 定时器、解绑可见性事件、清空 `svg/corners/lens/drift` 引用 |
| `setState(mood)` | 只切 `data-lid="thinking"` 与 `data-glitch` 属性；thinking/working 时眼睑半闭（CSS clipPath）并 `stopGaze()`，其余状态恢复目光微动 |
| `suspend() / resume()` | 页面 hidden / visible：暂停 ticker、CSS 时间线（`data-fz3-suspended`）、清空目光并停止三个调度；恢复时重排相位（`clockElapsed` 累加） |

### 8.2 时间常量

- **JS ticker（v1.6.0）**：`FZ3_TICK_MS = 1000 / 15`（66.67ms，15fps）。叶片 `FZ3_ORBIT_MS = 6400` / `FZ3_ORBIT_STEPS = 96`（每步 3.75°）；眼球呼吸 `FZ3_LENS_MS = 1600` / `FZ3_LENS_STEPS = 24` / `FZ3_LENS_SCALE = 0.095`（`scale 1→0.905`，余弦缓动）；目光缓动 `FZ3_GAZE_EASE_MS = 920`。三个周期都是 1/15s 的整数倍。
- **CSS 时间线**：光晕 `fz3-halo-breathe 6.4s steps(3)`、脉冲环 `fz3-lash-pulse 6.4s steps(24)`、氛围光 `fz3-atmos-breathe 14s steps(14)`。
- `FZ3_GLITCH_MAX_MS = 900`：一次花屏视觉的硬上限，定时器丢了也不会一直挂着。
- `FZ3_FAULT`：threads（水平拉丝，feTurbulence）与 blocks（5 条横切片）两类故障的拍数、拍间隔、收尾时长、位移 / 亮度 / 对比档位。
- **目光微动**：首次间隔 `fz3Random(4600, 8800)` ms；偏移半径 `fz3Random(0.9, 2.6)`（**SVG user unit，不是 px**；dock 128px 下约 12.8px/162 ≈ 1–2 CSS px）、角度随机一周、纵向压到 0.75、旋转 ±0.45°；停 `fz3Random(1300, 2400)` ms 后回中再排下一次。

### 8.3 调度方式

- **一个 15fps ticker + 三个离散 setTimeout 链**。ticker（`setInterval(tick, 66.67)`）每拍做三件事：写 `#corners` 的 `rotate(deg 80 80)`、写 `#fz3-lens` 的 `translate(80 80) scale(s) translate(-80 -80)`、推进目光缓动（`stepGaze` 把 x/y/r 写进 `#fz3-drift` 的 `transform`）。相位来自 `clockNow() = clockElapsed + (performance.now() - clockBase)`，页面隐藏后恢复也不会跳帧。
- 三个 `setTimeout` 链：`scheduleFlicker`（1.75-3.6s 随机轻闪，切 `data-flicker`）、`scheduleGlitch`（2.3-4.6s 随机故障，切 `data-glitch` + CSS 变量）、`scheduleGaze`（4.6-8.8s 一次目光，缓动去 / 回）；表情切换时 `playStateTransition` 播两段式强转场。
- 花屏切片高度每次随机（`layoutBlocks`）；`armGlitchWatchdog` 兜底清理；`suspend` 后 ticker 与三个计时器全部停止、CSS 时间线一并暂停（后台标签页 ≈ 0 开销）。

### 8.4 想改观感时动哪里

| 想改 | 改哪里 |
| --- | --- |
| 叶片旋转速度 | `tick()` 里的 `FZ3_ORBIT_MS / FZ3_ORBIT_STEPS`（改 ms 必须同步改 steps = ms × 15） |
| 眼球呼吸速度 / 幅度 | `FZ3_LENS_MS / FZ3_LENS_STEPS / FZ3_LENS_SCALE`（余弦缓动写 `scale`） |
| 目光微动幅度 / 频率 | `scheduleGaze()` 里的 `fz3Random` 区间 + `FZ3_GAZE_EASE_MS`（缓动曲线在 `gazeEase` 的 cubic-bezier） |
| 光晕呼吸节奏 | `@keyframes fz3-halo-breathe`（852，6.4s / steps(3)） |
| 眼闪频率 | `scheduleFlicker` 里的随机区间与持续时间（CSS `.fz3-eye-flicker`） |
| 花屏频率 / 参数 | `FZ3_FAULT`（拍数、间隔、位移、亮度）与 `scheduleGlitch` 的随机区间 |
| 思考态半闭眼形状 | `FAIRY_EYE_SVG` 里 `#fz3-lid-clip` 的 path（`.fz3-lid-clip-shape`） |
| 大眼尺寸 / 位置 | CSS 变量 `--fz3-eye` / `--fz3-eye-cy` / `--fz3-eye-gap`，以及问候页的额外上移量 `--fz3-eye-lift`（见 17.19） |
| 加一层新的常驻动画 | 先读 8.5 / 8.6 的规则再动手：大面积的走 CSS `steps`，小图标走 ticker 写 SVG 属性 |

### 8.5 全屏动画层与 GPU（v1.2.0 静态化 → v1.5.0 回归 CSS steps）

**为什么全屏 CSS 动画在高刷屏上可怕**：合成器判断「这一层变了、要重新合成」。如果变化发生在**全屏尺寸的 fixed 层**上，合成范围就是整个视口 —— 165 Hz 屏每秒重做 165 次整屏合成，GPU 占用随刷新率线性放大。插件里有两处这种层：`body::before`（fixed、`inset:-12%`、原 40s 漂移）和 `.fz3-atmos`（fixed `inset:0`、原 14s 呼吸的 `.fz3-atmos-glow`）。`mix-blend-mode:screen` 会进一步放大代价。

**v1.2.0 的做法（已废弃）**：背景漂移删除、改静态；氛围光呼吸改成 `Atmos` 里 500ms 的 JS 环境时钟写内联 `opacity` / `transform`（2 次/秒），当时判断「CSS animation 无法降频、steps(24) 仍贵（实测 11.0%）」。

**v1.5.0 的做法（现行）**：分层实验证明 **HTML 图层 + `steps()` 量化** 才是对的（`.fz3-atmos-glow` 用 `fz3-atmos-breathe 14s steps(14,end) infinite alternate`，14s / 14 步 ≈ 1fps；全屏混合层只在 14 个瞬间重合成），所以把 JS 环境时钟整个删掉，`Atmos` 退化为纯静态渲染。实测这条路径比 500ms JS 写入更省（JS 每次写入都要样式失效 + 主线程 paint + 整屏重合成），也不再需要处理 `document.hidden`。

**为什么 v1.2.0 时 steps(24) 显得贵**：当时动画作用在全屏层内部、更新频率没有被压到 1–2fps，且与其他动画没有对齐帧网格；v1.5.0 把更新压到 1fps、按 1/15s 取整后，量变引起质变。

**维护规则（新增氛围效果前必读）**：

- ❌ 不要对全屏 `fixed` 层做逐帧 / 逐秒的 CSS 动画或 `mix-blend-mode` / 滤镜动画；
- ❌ 不要再引入 JS 定时器驱动**大面积**常驻样式（每次写入都有固定合成成本，降频无用）；
- ✅ 动画只做在小面积元素上（眼徽、脉冲环、按钮、文字）；全屏层如必须动，用 `steps()` 把更新压到 ≤1–2fps；
- ✅ 页面隐藏时暂停定时器（`document.hidden`），组件卸载时清理。

### 8.6 为什么 v1.6.0 又用 JS 写 SVG 属性了（与 8.5 的边界）

v1.5.0 把眼徽拆成「4 份静态 SVG 副本 + 4 个 HTML 层的 CSS `transform` 动画」时，性能确实最好（隔离 harness 0.99% GPU、主线程 0%）。但它有一个观感代价：**合成层动的是已经栅格化的位图**，旋转 / 缩放时浏览器只能对位图重采样。眼蛋黄白对比极强、还有一条由 `clipPath` 裁出来的眼睑硬边，一旦位图被旋转缩放，这些边缘就会出现台阶 / 发虚。用户截图上看到的就是「某些像素没覆盖到、边缘毛刺」（v1.5.0 在 165 Hz 屏上尤其明显，因为每一步旋转的角度更大）。

v1.6.0 的取舍：**单份 SVG，每 66.7ms 改写 `#corners` / `#fz3-lens` / `#fz3-drift` 的 SVG transform 属性**，让 Skia 按当前设备像素重新做矢量抗锯齿。代价是每次写属性都要重新绘制这块 128–330px 的 SVG：隔离 harness GPU 0.99% → 1.52%、主线程 0% → 0.8%；真实页面同轮 A/B 在噪声内（2.28% → 2.10 / 1.98%）。相对 v1.4.0 的 9.3–11.8% GPU / 47–54% 主线程，仍然低一个数量级以上。

**边界（不要误读成「可以随便用 JS 驱动动画」）**：

- ✅ 允许：**小面积、高对比、需要矢量清晰度**的元素（眼徽）用 15fps ticker 写 SVG 属性；
- ❌ 禁止：把同样的 SVG 复制成 HTML 合成层再做旋转 / 缩放（边缘重采样，v1.5.0 的坑，见 17.17）；
- ❌ 禁止：ticker 频率提到 30/60fps（实测每提高一倍成本线性上涨，肉眼收益为零）；
- ❌ 禁止：用 ticker 驱动全屏层 / `:root` 变量；
- ✅ 大面积 / 全屏层继续走 8.5 的 `steps()` 规则。

---

## 9. 主题、本地化与设置持久化（v1.3.0 重写）

### 9.1 主题 token

- `baseTokens` 覆盖 `--dsw-alias-bg-base/layer-1/layer-2/border/brand/label/state-*` 等 16 个 token（深蓝玻璃配色）；`lightTokens` 是浅色对应值。
- `TOKENS` 由两套合成：每个 key 的 `light` 取 `lightTokens`、`dark` 取 `baseTokens`（插件自己的深蓝玻璃观感；v1.6.2 起不再有「强制外观」，宿主深浅色只影响 `html[data-fz3-theme]` 的静态覆盖）。
- 生效：`theme.overrideTokens(PKG, TOKENS)`（搜 `theme.overrideTokens`）。

### 9.2 外观：始终跟随宿主

- 设置页不再提供外观开关（v1.6.2 删除），也没有 `fairy.zzz.theme-mode` 这个 localStorage 键；皮肤永远跟随 DSH。
- `apply` 里的 `theme-watch`（搜 `theme-watch`）负责：① `probeLight()` 先读 `theme.getTheme().active.id` 里的 light / snow / day 与 dark / night / midnight 关键字，取不到就临时插一个探针 div 量 `--dsw-alias-bg-base` 亮度（>140 判浅色），再退回 `prefers-color-scheme`；② 只切 `html[data-fz3-theme="light"|"dark"]`，CSS 侧全部是静态覆盖（CSS 段搜 `html[data-fz3-theme="light"]`）；③ 强制外观时把设计变量双写进 light+dark 两套，让宿主外壳也跟着强制配色；③ 监听 `matchMedia`、`MutationObserver(html[style,class,data-theme,data-color-scheme])`（260ms 去抖）与 `ctx.on('theme/change')`。

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
| `fairy.zzz.greet-last` | 无 | 最近一次播放的问候文件名（用于避免连续重复） |

- 设置页与皮肤层之间的同步事件：`fz3:drag-pref`、`fz3:eye-pref`、`fz3:dock-reset`（同时监听 `storage`，多窗口也能同步）。

---

## 10. index.js 文件地图（1,392 行，约 47 KB）

> 与第 5 节同理：按锚点 `grep`，不要照抄行号（v1.3.3 之后 apply 段整体 +3 行）。

| 搜索锚点 | 区块 | 内容 |
| --- | --- | --- |
| `export const name` / `import ` | imports / 导出 | node:fs / fs.promises / crypto / child_process / path / url / os / zlib；`name = 'fairy-zzz'`、`inject = ['webServer']` |
| `const HERE` / `const ASSETS` / `const CACHE` | 路径 | `HERE`、`ASSETS`、`CACHE`（可用 `FAIRY_CACHE_DIR` 覆盖）；`TTS_PORT`（`FAIRY_TTS_PORT`，默认 9800） |
| `const VOICE_HINT` / `function readVoiceHome` | 引擎目录发现 | 优先级：`voice-home.txt` → `FAIRY_VOICE_HOME` → 插件旁 `../voice` → 旧版 `FAIRY_TTS_DIR`；`voiceHomeSource()` 说明来源 |
| `const IS_WIN` / `function cleanHome` | 路径清洗 | 去引号 / 合并重复分隔符 / Windows 统一反斜杠 |
| `function inspectVoiceDir` / `function saveVoiceHome` | 引擎校验 / 保存 | 要求 `fairy_server.py` + `GPT-SoVITS/` + `models/` + python 可解析；写 `voice-home.txt` |
| `let TTS_DIR` / `function resolvePython` / `function syncVoiceHome` | 运行时解析 | 每次用前重新解析，改路径后不用重启 |
| `const TTS_SPEED` / `const MIME` | 常量 / 工具 | `TTS_SPEED = 1.04`、`MAX_CHARS = 500`、MIME 表、`sizeOf` |
| `文件缓存策略`（注释） | **静态文件服务** | `STATIC_CACHE` / `IMMUTABLE_CACHE`、`etagOf`（size-mtime）、304 协商（If-None-Match / If-Modified-Since）、Range / 206 / If-Range、`sendFile`、`sendJson`、`readBody`（64 KB 上限） |
| `热路径记忆化`（注释） / `function createMemo` | 记忆化 | `createMemo(ttl)` / `createAsyncMemo(ttl)`（in-flight 去重）；TTL：`MOOD_CACHE_MS=300`、`ENGINE_CACHE_MS=1500`、`VOICE_CACHE_MS=3000`、`USAGE_CACHE_MS=3000` |
| `async function engineState` / `function ensureEngine` | **引擎生命周期 + TTS** | `engineState`、`enginePromise/engineChild`、`engineGen`（代际号）、`ensureEngine`（spawn `python fairy_server.py --port`，日志写 <引擎目录>/server.log；exit/error 清缓存，stale 进程先 kill）、`stopEngine`（bump gen + taskkill /T /F）、`enqueue`（串行队列）、`synthesize`（POST /tts；失败 / 5xx 清缓存重试一次）、`cleanText` |
| `用量与花费`（注释） / `const PRICES` | **用量与花费** | `DSH_ROOT` / `SESSIONS_ROOT`、`PRICES`（`deepseek-flash` / `deepseek-v4-pro` 的 hit/miss/out 三档）、`DEFAULT_PRICE`、`BJ_OFFSET`、`PEAK_RANGES`（工作日 09-12 / 14-18）、`HOLIDAY_RANGES`（2026 年 7 段）、`beijingStamp`、`isPeakAt`、`nextPeakFlip`、`peakState`、`formatLeft`、`ZSTD_MAGIC`、`usageCache`、`sessionFiles`（两级遍历 `sessions/*/*/session.v4.jsonl.zstd`）、`zstdFrameLength`（按 RFC 8878 算一帧长度）、`readUsageEvents`（导出；增量解析 + 按天裁剪）、`addToBucket`（每笔按发生时刻计价）、`collectUsage`（导出）、`usageDiagnostics` |
| `mood`（注释） / `function createMoodTracker` | **情绪追踪** | 权威数据源 `ctx.get('agents')`（AgentRegistry），不可用时退回事件机（`MOOD_ACTIVITY_EVENTS` / `MOOD_CLEAR_EVENTS`）；`MOOD_INFER_TTL_MS=10min`、思考窗口 2500ms、完成窗口 2400ms；诊断写 `cache/mood.log` |
| `function apply` / `webServer.register` | **apply / 路由** | 8 个 `webServer.register`（见第 11 节）；`usageMemo` |

---

## 11. host 路由一览（index.js，8 个注册）

全部挂在 DSH 自带 webServer 上，前缀 `/fairy-zzz/`；`?diag=1` 绕过记忆化并附诊断字段。注意 DSH 的 `webServer.register` 支持 **prefix 匹配**（第 2、3 条注册的是 `/fairy-zzz/assets` 与 `/fairy-zzz/audio` 子路径），其余是精确方法 + 路径。

| 方法 | 路径 | 行号 | 返回 / 行为 |
| --- | --- | --- | --- |
| GET | `/fairy-zzz/mood` | 1160-1183 | `idle / thinking / working / done` 字符串（`ctx.get('agents')` 权威快照；`?diag=1` 带诊断）；记忆化 300ms |
| GET | `/fairy-zzz/assets/<file>` | 1184-1207 | assets 目录静态文件；`sendFile` 处理 ETag / Last-Modified / 304 / HEAD / Range / 206 / If-Range；前缀路由，`decodeURIComponent` 包 try/catch，坏 URI → 404 JSON |
| GET | `/fairy-zzz/audio/<hash>.wav` | 1208-1229 | `cache/` 下的合成音频；只接受 40 位十六进制文件名（防目录穿越）；坏编码同样 404；一年 immutable 缓存 |
| GET | `/fairy-zzz/health` | 1230-1254 | `{ ok, engine, engineHome, engineManaged, voiceHome, voice, speed, on, seen, mood }`；引擎状态记忆化 1500ms |
| GET | `/fairy-zzz/usage` | 1255-1277 | v1.3.0 新增：`collectUsage()` 的 `{ ok, now, peak, today, turn }`（字段见 11.1）；异常 → 500 `{ ok:false, error }`；记忆化 3000ms |
| GET / POST | `/fairy-zzz/voice-home` | 1278-1319 | GET 返回当前引擎目录与来源（`voiceHomeSource()`）；POST 校验并写 `voice-home.txt`；成功后清缓存 |
| GET / POST | `/fairy-zzz/engine` | 1320-1348 | GET 引擎进程状态；POST `{ action: 'start' \| 'stop' }`；记忆化 1500ms |
| POST | `/fairy-zzz/tts` | 1349-1391 | `{ text }` → `{ url, cached, seconds }`；`cleanText` 清 markdown / 代码块、截 500 字；串行队列 + 磁盘缓存 |

### 11.1 `/usage` 返回字段（v1.3.0）

```json
{
  "ok": true,
  "now": 1762000000000,
  "peak": {
    "offPeak": false,
    "label": "十倍电费",
    "window": "工作日 09–12、14–18 十倍电费，其余时段五倍电费",
    "remainMs": 3600000,
    "nextAt": 1762003600000,
    "nextClock": "18:00",
    "next": "1 小时 0 分后转五倍电费"
  },
  "today": { "hit": 0, "miss": 0, "out": 0, "cost": 0, "calls": 0 },
  "turn": null
}
```

- `today`：北京时区当天 0 点起算；`hit` / `miss` / `out` 是 token 数，`miss = input + cache-write`，`cost` 单位为人民币元。
- `turn`：最近修改的会话文件里最后一轮（`turn` 序号）的统计；可能是 `null`（若该 session 最后一轮完全落在昨天，会被按天裁剪掉——上游接口同样允许 null）。
- `peak`：工作日 09:00-12:00 / 14:00-18:00 为高峰；周末与 2026 年节假日窗口全天低价；`remainMs` 精确到毫秒，`nextClock` 是 `HH:MM`。v1.3.3 起 `label` 直接返回「五倍电费 / 十倍电费」，`window` / `next` 也用同一口径（谷时 5 倍、峰时 10 倍）；v1.3.4 起 `window` 补上「其余时段五倍电费」，气泡底部只展示这条规则行，倒计时留在倍率行（客户端对旧宿主缺「五倍」的 `window` 会自动补全）。
- `?diag=1` 追加 `diag: { root, zstd, cached, files, recent, ms, at }`。

---

## 12. 静态资源、缓存与热路径

### 12.1 静态资源服务（index.js 166-311）

- 强 ETag = `size-mtime`（`etagOf`）+ `Last-Modified`；`If-None-Match` / `If-Modified-Since` 命中 → **304 空 body**；支持 `HEAD`（`sendFile`）。
- `Range` → **206** + `Content-Range`，`If-Range` 不匹配则回 200 全量（视频拖动 / 音频 seek 正常）。实测：`assets/boot-opt.mp4` 200 ETag 命中 304；`Range: bytes=0-99` → 206 `content-range: bytes 0-99/74349`。
- `assets/` 走 `public,max-age=0,must-revalidate`；`cache/` 下 40 位 sha1 命名的音频走 `public,max-age=31536000,immutable`（`IMMUTABLE_CACHE`）。
- `sendJson` 统一 JSON；`readBody` 上限 64 KB，防止超大 POST。

### 12.2 记忆化 TTL（`createMemo` / `createAsyncMemo` / `*_CACHE_MS`）

| 接口 | TTL | 常量 |
| --- | --- | --- |
| `/mood` | 300ms | `MOOD_CACHE_MS` |
| `/engine`、`/health` 里的引擎状态 | 1500ms | `ENGINE_CACHE_MS` |
| `/voice-home` | 3000ms | `VOICE_CACHE_MS` |
| `/usage` | 3000ms | `USAGE_CACHE_MS` |

`createMemo / createAsyncMemo`（330 / 350）都做 in-flight 去重；start / stop / TTS / 保存目录成功后主动清缓存。`?diag=1` 一律绕过。

### 12.3 用量统计的增量解析（552-903，v1.3.0 的热路径）

- 会话日志位置：`@DSH_HOME或~/.dsh` `/sessions/*/*/session.v4.jsonl.zstd`（`sessionFiles`，两级遍历；只扫 mtime ≥ 当天 0 点 − 2 天的文件）。
- 每个文件缓存 `{ mtimeMs, size, events, parsedTo }`（`usageCache`，上限 `USAGE_CACHE_MAX = 256`）；mtime / size 没变直接复用，变了从 `parsedTo` 继续解析新增的 zstd 帧。
- `zstdFrameLength()` 按 RFC 8878 逐字节算 frame 长度，**不能**把整个文件丢给 `zlib.zstdDecompressSync`（多帧拼接会失败），也**不能** `TextDecoder` 解原始字节（payload 里可能出现伪 `b5 2f fd` 魔数）。
- 解析出的事件按 `isPeakAt(ev.time)` 逐笔计价（`addToBucket`），所以跨峰谷边界的一轮回答会拆成两档；只保留 ≥ `todayStart` 的桶（跨天裁剪，`pruneBefore`）。
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
| `assets/voice/greet-*.mp3` | 合计 2,708,325（25 段：原 5 段 404,577 + 新增 20 段 2,303,748；v1.5.1 按原草稿重录后） | 预录问候：每个时段 5 条，按时段随机播放且不连续重复；`text` 是屏幕简洁版、音频是富文本台词，二者允许不一致 |
| `screenshots/*.png` | 4 张 | README 用截图 |
| `docs/img/*` | 9 个（v1.6.0 重绘 2 张 + 白边修复对照 1 张） | 文档配图（见下） |

`docs/img/` 实测大小：`before-after-dock-eye.png` 234,947；`gpu-attribution.png` 63,363；`gpu-before-after-dock.jpg` 169,122；`hero-brand-mark.png` 52,357；`theme-light.jpg` 38,464；`usage-bubble.jpg` 39,584；`lid-edge-fix.png` 412,667（半闭眼白边修复前后对照，本版新增）；**`eye-lively-before-after.png`（眼球动效前后对比）与 `eye-layers.png`（眼球渲染管线示意）在 v1.6.0 按「单 SVG + 15fps 向量重绘」重绘**。

### 13.2 不发布的东西

- `cache/`：TTS 合成音频 + `mood.log`，体积随使用增长，已在 `.gitignore`。
- `voice-home.txt`：本机引擎绝对路径（隐私）。
- GPT-SoVITS 权重、参考音频、推理引擎：体积与许可原因均不随包发布。

---

## 14. 性能：核心改动与数据

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
12. v1.5.0：**眼徽动效全部搬到 HTML 图层**（4 份静态 SVG 副本），持续动画只动 `transform` / `opacity` 并用 `steps()` 量化到 15fps；通量周期统一为 1/15s 整数倍；删除 `FZ3_LASH_PERIOD_S` / `lockLashFrame`；氛围光 500ms JS 时钟改回 CSS `14s steps(14)`（1fps）；新增的目光微动是**低频 2 次 CSS 变量写入**（4–9s 一次），不是常驻循环。GPU 9.3–11.8% → 1.9–2.3%，渲染进程 CPU 47–54% → 4.5–6.6%。
13. v1.6.0：**眼徽改成单 SVG + 15fps JS ticker 写 SVG 属性**（修 v1.5.0 合成层旋转 / 缩放导致的边缘重采样）；光晕 / 脉冲 / 氛围光仍是 CSS 时间线；ticker 在页面隐藏时停表、相位用 `clockElapsed` 维护。代价是隔离 harness +0.5 GPU 点 / +0.8% 主线程，真实页面噪声内；换到的是边缘永远按设备像素矢量重绘。
14. v1.6.2：**只删设置项与改问候选择逻辑**（外观三档移除、试听每次随机抽一条，O(1) 内存），不新增动画 / 定时器，GPU 与主线程占用与 v1.6.1 相同。

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
| 拖拽 / 吸附边界（v1.3.2） | 整个窗口（含侧栏、标题栏） | **会话内容区**：左 = 侧栏右缘、上 = 标题栏底缘、右 / 下 = 窗口边缘 | `onCoreDown` 时 `measureRegion()` 现场量一次（`[class*="_sidebarCol"]` + 首个 `header`，header 含 tabs 时自动变高）；拖动期不读布局 |

- 唯一新增的常驻成本是 `document` 上两个被动监听（`pointerdown` 捕获用于点外关闭、`visibilitychange` 用于补预取），都只在气泡打开 / 到 dock 后挂载，卸载时移除；v1.3.2 的额外测量只在 `pointerdown` 发生一次，拖拽期仍零布局读取。
- 没有 `scroll` / `resize` 高频监听；`ResizeObserver` 均 220–260 ms 去抖；拖动期间不 `setState`（只有首次超过 4 px 时置一次 `data-dragging`）。

### 14.5 眼徽动效重做（v1.5.0）

| 指标（dock 待机） | v1.4.0 | v1.5.0 | 变化 |
| --- | --- | --- | --- |
| GPU 引擎平均占用（隔离 harness，只加载插件 CSS + 眼球 DOM） | 9.3–11.8% | **1.9–2.3%** | 约 −80% |
| 渲染进程 CPU（单核 %，同上 harness） | 47–54% | **4.5–6.6%** | 约 −90% |
| GPU（DSH 真页面，新旧 `client.js` 同轮 A/B，测的是还带彗星层的中间版本） | 14.6–14.9% | **4.4%** | 约 −70% |
| 常驻动画数量 | 6（SVG 内部 4 层呼吸 + 睫毛 + 脉冲，165fps） | 4（叶片 / 眼球 / 光晕 / 脉冲，15fps） | 帧数 1/11 |

- 关键实验：把 SVG 内部动画改成 `steps()` 量化无效（13.3 vs 13.9）；JS 每写入一次样式约 +0.4 GPU 点，降频到 12Hz 也几乎不降（10.7 → 10.4）；同样内容搬到 HTML 图层后 `steps()` 动画 1.9%（相对 static 只 +0.9），但连续 165fps 合成仍 11.3%。
- 因此 v1.5.0 的三条硬规则：**①持续动画只在 HTML 图层上；②用 `steps()` 量化到 15fps 且周期取 1/15s 整数倍；③不用 JS 做持续驱动。**（v1.6.0 对「小面积高对比 SVG」例外，见 8.6 / 14.6）
- 完整实验数据、放弃方案与复现步骤见 [docs/PERFORMANCE.md](PERFORMANCE.md) 第 10 节。

### 14.6 眼徽改回单 SVG 向量重绘（v1.6.0：修边缘重采样）

v1.5.0 的合成层方案在性能上最优，但旋转 / 缩放已经栅格化的 SVG 位图会让眼睑 clip 硬边与深蓝眼眶出现台阶 / 发虚。v1.6.0 改成单 SVG + 15fps ticker 写 SVG transform 属性（见 8.6）。**代价与收益**：

| 指标 | v1.5.1（4 层合成 + CSS steps） | v1.6.0（单 SVG + 15fps JS） | 说明 |
| --- | --- | --- | --- |
| GPU 引擎平均（隔离 harness，dock 待机） | 0.99% | **1.52%** | +0.53 点 |
| 主线程（同上） | 0% | **0.8%** | +0.8 点 |
| 静态底噪（所有动画关掉） | 0.40% | 0.40% | 同一静态基线 |
| 8fps 变体（放弃） | — | 1.05% / 0.5% | 旋转每步 7.5°，肉眼太跳 |
| GPU（DSH 真页面同一页面同轮 A/B，headless 1138×640 dpr1.5） | 2.28% | 2.10% / 1.98% | 噪声内，没有上升 |
| 主线程 TaskDuration（同上，两次 run） | 3.69% / 2.14% | 3.28% / 4.73% | 噪声 ±1.5pp，趋势 +0.5–1pp |
| 清晰度（192px 原生截图 Laplacian 梯度） | thinking 30.43 / idle 30.83 | **thinking 31.00 / idle 32.05** | +2% / +4% |

- **收益**：边缘永远按当前设备像素重新抗锯齿；旋转 / 缩放的中间帧不会再出现位图台阶。半闭眼（thinking）的眼睑弧线与深蓝眼眶在 420px 放大截图里恢复平滑，与 v1.3.3 单 SVG 观感一致。
- **代价**：隔离 harness +0.5 GPU 点 / +0.8% 主线程；真实页面 A/B 在噪声内。相对 v1.4.0 的 9.3–11.8% / 47–54% 仍是约 1/6 与 1/50。
- **放弃的方案**：8fps（省 0.5 点但叶片每步 7.5° 太跳）；保留 4 层合成只改边缘（位图重采样是本质问题，改边缘无解）。
- 复现：`iso/bench.mjs`（隔离 4 变体）+ 真页面 A/B（同一 Chrome 会话、磁盘换 `client.js` + `Page.reload`，用 DOM marker 断言换版成功）；完整步骤见 [docs/PERFORMANCE.md](PERFORMANCE.md) 第 11 节。

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
Get-FileHash .\client.js -Algorithm SHA256    # 与安装目录副本比对，应完全一致
Get-FileHash .\index.js  -Algorithm SHA256    # 哈希随版本变化，不要照抄旧值
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
document.querySelector('.fz3-set-seg') === null            // v1.6.2 起外观开关已删
document.querySelector('.fz3-bubble') === null            // 默认无气泡
document.querySelector('.fz3-peak-badge')                 // 气泡打开后存在
localStorage.getItem('fairy.zzz.theme-mode')              // null（v1.6.2 起不再使用）
// v1.6.0 单 SVG 向量重绘
document.querySelectorAll('.fz3-eye-svg').length            // 1
document.querySelectorAll('.fz3-eye-svg svg').length        // 1（静态 FAIRY_EYE_SVG）
document.querySelector('.fz3-eye-svg #fz3-drift')           // 运行时插入，非 null
document.querySelector('.fz3-eye-svg #fz3-lens')            // 运行时插入，非 null
document.querySelectorAll('.fz3-eye-gaze,.fz3-eye-plate,.fz3-eye-blades,.fz3-eye-anatomy,.fz3-eye-shine').length  // 0（v1.5.0 的层已删）
document.querySelector('.fz3-eye').getAnimations({subtree:true}).map(a => a.animationName)
// ['fz3-halo-breathe','fz3-lash-pulse']（叶片 / 眼球 / 目光已改为 JS ticker）
document.querySelector('.fz3-eye-svg #corners').getAttribute('transform')   // 两次读取应不同，如 rotate(18.75 80 80)
document.querySelector('.fz3-eye-svg #fz3-lens').getAttribute('transform')  // translate(80 80) scale(0.9xx) translate(-80 -80)
document.querySelector('.fz3-eye-svg #fz3-drift').getAttribute('transform') // translate(x y) rotate(r 80 80)，14s 内会变
document.querySelector('.fz3-eye').getAttribute('data-lid')  // idle 时为 null；thinking/working 时为 'thinking'
// v1.6.0 补丁：半闭眼眼睑 rim（白边修复）
document.querySelectorAll('#fz3-lid-rim').length            // 8（主眼 1 + 花屏克隆 5 + 品牌位 / 字标 2）
document.querySelectorAll('.fz3-eye[data-lid="thinking"] #fz3-lid-rim').length  // 6（主眼 + 克隆）
getComputedStyle(document.querySelectorAll('#fz3-lid-rim')[0]).display  // 'none'（品牌位副本默认隐藏）
```

### 16.2 headless Chrome 真实加载（v1.3.0 流程）

开发时用一次性 headless Chrome harness（临时目录，已随交付清理，未随包发布）。要点：

1. 自签 cookie 连当前 Web GUI 端口（历史值 12505 / 12489 / 10388 等；**cookie 的 authority 必须与该端口一致**，换端口要重签），用 CDP 打开页面。
2. 等 `#root` 出现（约 2.5s）→ 点欢迎页的「继续」→ 断言 `.fz3-layer` / `.fz3-hero-brand` 数量。
3. 等 `data-phase` 变成 `greet` / `dock`，点 `.fz3-skip2`；读 `.fz3-core` 的 rect、`--fz3-dock-x/y`、`pointerEvents`、`cursor`。
4. `fetch('/fairy-zzz/usage')` 断言 `status 200、ok:true`、keys 含 `now/peak/today/turn`、`peak.label` 有值。
5. 在眼徽中心 `dispatchMouseEvent` 点一下 → 等 `.fz3-bubble` → 读 text / side / mode / loading；截图。
6. 拖拽 6 步（x−40·i, y+14·i）→ 读 `--fz3-dock-x/y` 与 `localStorage['fairy.zzz.dock-pos']`、确认气泡关闭。
7. 点两次「试听问候」→ 读 `.fz3-set-note` 里「刚刚试听：…」两行应不同（同一会话也不复用）；切换 DSH 深浅色 → 断言 `html.dataset.fz3Theme` 跟着变；设置页不应再有 `.fz3-set-seg`。
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
16. **问候音频的台词与屏幕字幕是两套文案**：`GREET_LINES` 里 `file`（mp3）是富文本台词、`text` 是给屏幕看的简洁理解版，两者**允许不一致**（v1.4.0 起就是这样，v1.5.1 已在文档中澄清）；改 `text` 不必重录音频，只有改音频台词本身才需要重录（方法见 13.1）。另注意引擎行为：①`cut5` 的切分符号集合只含**半角** `;`、不含全角 `；`，全角分号处不会切；②切完还会走 `TextPreprocessor.merge_short_text_in_array(threshold=5)`，把累计不足 5 字的短片段合并——「我值班。」（4 字）与「您不睡，」（4 字）会被合并回同一片段，所以**仅把「；」改成「。」也只得到模型自然的 ~0.2s 微停顿**。要让停顿明显，除了改标点，还要在合成后对 wav 该处追加静音（v1.5.1 追加 0.20s，总停顿 0.44s）再编码 mp3；或者调整前后文让该片段本身 ≥5 字。
17. **不要让合成层去旋转 / 缩放 SVG 位图**（v1.5.0 的教训，v1.6.0 已修）：把同一份 SVG 复制成多个 HTML 层、用 CSS `transform` 做旋转 / 缩放时，合成器搬的是已经栅格化的位图，眼徽这种高对比小图标（尤其 `clipPath` 裁出的眼睑硬边）会出现台阶 / 发虚，用户看到的就是「像素没覆盖到」。小面积图标要「会转」就必须让矢量重绘：单 SVG + 15fps ticker 写 `transform` 属性（见 8.6）；大面积 / 全屏层仍然只能静态或 `steps()`。
18. **同一份内联 SVG 被复制多份时，`url(#id)` 只解析文档里第一个同 id 元素**（v1.6.0 半闭眼白边的根因）：页面同时有 8 份 `#fz3-lid-clip`（主眼 1 + 花屏克隆 5 + 品牌位 / 字标 2）；主眼 `clip-path:url(#fz3-lid-clip)` 吃到的是**最靠前**的侧栏字标副本，而字标不在 `.fz3-eye` 作用域内、拿不到 `.fz3-eye .fz3-lid-clip-shape{transform:translateY(15.5px)}`，所以主眼实际裁切边界一直是 path 原始曲线 `y=75`（不是注释里写的 90.5）。教训：**眼睑 / clip 几何必须写死在 path `d` 里**，不要靠 CSS transform 调；重复 id 数量可用 `document.querySelectorAll('#fz3-lid-clip').length` 检查。裁切边界上的 AA 白边用同色 rim 描边（`#fz3-lid-rim`，thinking 态才显示）把「白压深」反转成「深压白」，静态绘制、零运行时开销。

19. **问候页第一行小字被眼徽光晕压住**（v1.6.1）：`.fz3-copy` 的 `top` 是 `calc(--fz3-eye-cy + --fz3-eye/2 + --fz3-eye-gap)`，而 `.fz3-eye::before` 的静态柔光用 `inset:-13%`，比眼睛包围盒每边多探出 `0.13 × eye`（1610×949 下 39.5px）。于是 kicker（`H.D.D CORE // ONLINE`，高 12px）上半截正好落在柔光里，8–9.5px 细字在亮蓝底上的对比度只剩 ~1.2，看起来就像被图案盖住。
    **修法**：新增 `--fz3-eye-lift:clamp(12px,2.8vh,28px)`，只从 `.fz3-core` 的 `top` 里减掉（`calc(var(--fz3-eye-cy) - var(--fz3-eye-lift))`），`.fz3-copy` 锚点保持 `--fz3-eye-cy`——眼徽上移、文案原地，等于把两者的间距拉开一个 lift，而不是把整组内容一起上移。实测（headless Chrome，真实 GUI 1610×949 dpr1）光晕底边到 kicker 的净空：1610×949 = 19px、1440×900 = 19px、1280×800 = 16px、1100×700 = 15px（矮视口 `max-height:620` 本来就 `display:none` 掉 kicker）。
    **同时**把 kicker 颜色由 `rgba(150,172,255,.82)` 提到 `rgba(202,220,255,.96)`，并加一层 `text-shadow:0 1px 2px rgba(0,8,28,.62),0 0 10px rgba(40,90,220,.4)` 贴字形暗描边——纯静态声明，没有动画 / 滤镜 / 新图层，观感仍是「背景里的小字」但能读清。dock 态有显式 `top` 覆盖，不受 lift 影响；`boot → greet → dock` 的 top 过渡仍由同一条 1.35s transition 完成。

20. **设置项不要重复造开关**（v1.6.2）：外观三档看起来是「给用户选择」，但宿主本身已有深浅色设置，多一套只会带来 `localStorage` 键、事件、强制 token 双写与文档负担；现在只保留自动跟随。教训：**能跟随宿主就跟随宿主**，插件不要复制宿主已有的设置项。

21. **「试听 / 重放」类按钮不要复用缓存的选择**（v1.6.2）：问候音频是随机抽的，`currentGreeting()` 为了避免同一条反复播会缓存 `greetPick`；但「试听问候」如果直接调 `GREETING()`，就会一直播放开机时抽中的那条，看起来像按钮坏了。修法：把选择器拆成 `pickGreeting(forceFresh)`，试听显式传 `true`，并回显实际播放的台词，让用户确认换了一条。

---

## 18. 常见改法（recipes）

| 我想… | 改哪里 |
| --- | --- |
| 改问候台词 / 时段的语音与随机规则 | `GREET_LINES`（每时段 5 条 `{file,text}`）、`currentGreeting()`、`GREETING()`、`greetSlot()`；新增音频放 `assets/voice/`；改 `text`（屏幕字幕）不需要重录，改音频台词才要重录（见 17.16） |
| 改欢迎页标题 / 徽章文案 | `HERO_COPY`（中英各一套）；DOM 改写 effect 在 `FairySkin` 内（hero `MutationObserver` 段） |
| 改欢迎页眼标尺寸 / 光晕 | `HeroBrandMark` + CSS `.fz3-hero-brand` |
| 改眼徽大小 / 位置 | CSS 变量 `--fz3-eye` / `--fz3-eye-cy` / `--fz3-eye-gap` / `--fz3-eye-lift`（617 附近）+ dock 测量（`FairySkin` 内的 `measureRegion` / `regionBounds`） |
| 改叶片转速 / 眼球呼吸 / 目光微动 | `FZ3_RUNTIME`：`FZ3_ORBIT_MS/STEPS`、`FZ3_LENS_MS/STEPS/SCALE`、`scheduleGaze`；观感对照表见 8.4 |
| 改眼闪 / 花屏 / 光晕 / 脉冲 | `FZ3_RUNTIME`（`scheduleFlicker` / `scheduleGlitch` / `FZ3_FAULT`）+ CSS `@keyframes fz3-halo-breathe` / `fz3-lash-pulse` |
| 改气泡内容 / 计价展示 | `BubbleCard`；金额格式化 `yuan`、`tokensText`、`clockText`、`feeText` |
| 改价目 / 峰谷时段 / 节假日 | index.js `PRICES` / `PEAK_RANGES` / `HOLIDAY_RANGES` |
| 改拖拽 / 显隐默认值 / 吸附距离 | `DRAG_KEY` / `EYE_KEY` + `FairySkin`；设置页在 `FairySettings` |
| 改外观跟随逻辑（无设置项） | `theme-watch` + CSS 浅色主题段 + `TOKENS` |
| 改眼徽渲染架构 | `CoreGlyph` 渲染 + `fz3EyeRuntime`（`cache` 里插入 `#fz3-drift` / `#fz3-lens`）+ CSS `.fz3-eye-svg`；改前先读 8.6 / 17.17 |
| 加一个槽位组件 | 末尾 `apply` 的 `mount()` helper 与注册区，照 4.1 写法 |
| 加一个 host 路由 | index.js `apply` 内照现有 `webServer.register` 写，并加 `guard` |
---

## 19. 变更记录

### 1.6.2（2026-11-04）

- **删除「外观」三档设置**（用户反馈「外观没啥用，跟着 DSH 设置的主题颜色就行」）：设置页删掉「跟随 / 深色 / 浅色」分段开关与 `THEME_KEY` / `fairy.zzz.theme-mode`、`fz3:theme-pref` 事件、强制外观的 token 双写；`theme-watch` 只保留自动跟随（`probeLight` 探测 → 写 `html[data-fz3-theme]`）。
- **「试听问候」改为每次点击重新随机**：旧实现直接 `new Audio(GREETING())`，复用本次会话开机时抽中的 `greetPick`，所以点几次都是同一条；现在拆出 `pickGreeting(forceFresh)`，试听走 `nextGreeting()`，每点一次从本时段 5 条里重抽（跳过上一条），并新增「刚刚试听：…」台词回显。
- **体积**：`client.js` 165,574 → 163,113 B、3,376 → 3,332 行；CSS 文本 498 → 489 行；`package.json` 1.6.1 → 1.6.2；无新资源、无渲染路径 / 定时器变化。
- **验证**：`node --check` 通过；`pickGreeting` 逻辑模拟 5,000 次随机无连续重复、5 条均匀（各约 1,000 次）；缓存复用（`currentGreeting()` 连续调用返回同一条）保持。

### 1.6.1（2026-11-04）

- **修复问候页第一行小字被眼徽光晕压住**（用户截图反馈）：kicker `H.D.D CORE // ONLINE`（8–9.5px）的上半截落在 `.fz3-eye::before` 的 13% 外扩柔光里，深色小字被亮背景冲淡，看起来像被图案盖住。新增 `--fz3-eye-lift:clamp(12px,2.8vh,28px)` 并只从 `.fz3-core` 的 `top` 里扣除（`.fz3-copy` 锚点不动），眼徽上移、文案原位，光晕底边与 kicker 的净空从 −7px 变成 +15～19px；同时把 kicker 提亮到 `rgba(202,220,255,.96)` 并加一层贴字暗描边（静态 CSS，无新增动画层 / 定时器，GPU 与主线程占用不变）。dock 与矮视口布局不受影响；`client.js` 164,855 → 165,574 B / 3,376 行。
- 验证：headless Chrome（真实 GUI :9042、自签 cookie）跑 `boot → greet → dock`；1610×949 下净空 19px，1440×900 / 1280×800 / 1100×700 分别 19 / 16 / 15px；dock 眼徽坐标不变（x294 y431 128px）；点眼徽弹电费气泡正常；0 console exception。对照图 `docs/img/greet-lift-before-after.png`。
### 1.6.0（2026-11-03）

- **修复眼徽边缘「像素没覆盖到 / 发虚 / 台阶」**（用户截图反馈，v1.5.0 遗留）：v1.5.0 把眼徽拆成 4 份静态 SVG 的 HTML 合成层，用 CSS `steps()` 旋转 / 缩放。合成器动的是**已栅格化的位图**，眼睑 clip 硬边与深蓝眼眶在重采样时出现台阶 / 发虚（165 Hz 屏每步旋转角度更大，更明显）。
- **改法**：回到**单份 SVG**（`.fz3-eye-svg`），运行时在 SVG 内插入 `#fz3-drift`（目光）与 `#fz3-lens`（眼球呼吸）两个 g；`#corners`（叶片）、`#fz3-lens`、`#fz3-drift` 由 **15fps ticker**（`FZ3_TICK_MS = 1000/15`）每拍写 SVG `transform` 属性，由 Skia 按设备像素重新抗锯齿；CSS 只保留光晕 / 脉冲 / 氛围光时间线。ticker 相位用 `clockElapsed + (performance.now() - clockBase)` 维护，页面隐藏时 `stopTicker()`、恢复后不跳帧。
- **删除**：`.fz3-eye-gaze/-body/-plate/-blades/-anatomy/-shine` 六组 CSS 与 `@keyframes fz3-orbit` / `fz3-lens-breathe`；花屏滤镜与 hover 放大目标改回 `.fz3-eye-svg`。
- **性能**（同一隔离 harness，dock 待机）：GPU 0.99% → **1.52%**（+0.53 点）、主线程 0% → **0.8%**；静态底噪 0.40% 不变。真页面同轮 A/B（headless 1138×640 dpr1.5）2.28% → **2.10 / 1.98%**（噪声内），主线程 3.69/2.14% → 3.28/4.73%（噪声 ±1.5pp，趋势 +0.5–1pp）。仍比 v1.4.0 的 9.3–11.8% / 47–54% 低一个数量级以上。
- **清晰度**：192px 原生截图的 Laplacian 梯度 sharpness，thinking 30.43 → **31.00**（+1.9%）、idle 30.83 → **32.05**（+4.0%）；420px 放大截图里半闭眼弧线与眼眶恢复平滑。
- **放弃的方案**：8fps ticker（GPU 1.05%，但叶片每步 7.5° 肉眼太跳）。
- **体积**：`client.js` 160,210 → 164,855 B（含两项补丁）、3,231 → 3,369 行；`index.js` 不变；`package.json` 1.6.0；CSS 文本 500 → 489 行（484 + rim 5 行）；文档配图 2 张重绘 + 白边修复对照图。
- **补丁：半闭眼眼睑白边修复**（用户截图反馈：「这个白色的边缘以前没有的」）：根因见 17.18（8 份重复 `#fz3-lid-clip`，主眼裁切解析到字标副本、`translateY(15.5px)` 从未生效，裁切边界落在 `y=75`，AA 把近白巩膜压到深蓝眼睑上形成浅色毛边）。修法：① 删除已失效的 `.fz3-lid-clip-shape{transform}` 并在注释里写明原因；② 新增 `#fz3-lid-rim`（`d="M31 65 Q80 85 129 65"`，与 clip 同一条二次贝塞尔，只截 x∈[31,129]，两端收在深蓝睫毛片内），`stroke:#1f2573`、`stroke-width:2.2`，默认 `display:none`、`.fz3-eye[data-lid="thinking"]` 时 `inline`。rim 在 `#fairy` 内 → 随 `#fz3-drift` 目光移动、不受 `#fz3-lens` 呼吸缩放，与裁切边界同坐标系；静态 path，零运行时开销。
- **补丁验证**：静态 128px A/B diff 407 px、bbox `(413,301)-(564,317)`、max 560，只改眼睑边界一条线；live（headless Chrome 登录真实 GUI，dpr1.5、clip 4×）A/B diff 2,881 px、bbox `(222,385)-(689,436)`，全部沿眼睑边界；8 条 rim 中 2 条 `display:none`（品牌位 / 字标）、6 条 `inline`（主眼 + 花屏克隆）；idle 态外观不变、blocks 花屏帧对齐。
- **补丁：死代码 / 死样式清理**（按软件工程标准）：删 `--fz3-line`（定义 2 次、0 引用）、两条 `html[data-fz3-theme="light"] .fz3-tag,…` 覆盖（DOM 已无该元素）、clipPath 上无 CSS 引用的 `fz3-lid-clip-shape` class。扫描结论（`tmp/eye-white/deadscan2.cjs`）：CSS 32,288 chars / 80 个 class、`@keyframes` 11 个全部有引用、顶层声明 103 个最少引用 2 次；其余 `--fz3-g-*` / `--fz3-flicker-*` / `--fz3-brand-*` 均由运行时 JS 写入，保留。清理后 `client.js` 164,855 B / 3,369 行、CSS 文本 489 行（含 rim 的 5 行）。
- **验证**（headless Chrome 自签 cookie 登录真实 GUI）：`.fz3-eye-svg` 与内部 `svg` 各 1；`#fz3-drift` / `#fz3-lens` / `#corners` 存在且 320ms 内 transform 变化（叶片 18.75° → 37.5°、lens scale 0.9648 → 0.9114）；gaze 12s 采样出现 16 种 `#fz3-drift` 取值；旧 4 层选择器数量 0；`data-lid="thinking"` 时 `clip-path` 计算值为 `url("#fz3-lid-clip")`；花屏 5 条 gband 出现；控制台 0 exception。

---
### 1.5.1（2026-11-03）

- **修复 `greet-night-2.mp3` 断句连读**：v1.4.0 的 20 条新语音（`greet-<slot>-2..5.mp3`）是按早期草稿台词合成的，`greet-night-2` 的草稿句「所以您睡，我值班；您不睡，我也值班。」里的全角「；」不在引擎 `cut5` 的切分符号集合中，于是「我值班 / 您不睡」连读、没有停顿（用户反馈的原句）。
- **修复方式**：按**同一份草稿台词**重新合成 20 条 mp3（引擎 127.0.0.1:9800，`speed=1.04`，ffmpeg `-ac 1 -ar 32000 -c:a libmp3lame -b:a 128k`），把 `greet-night-2` 那处全角「；」改成「。」，并在合成后的 wav 该句号自然停顿处插入 0.20s 静音（引擎会把 4 字短句合并、只改标点不够）；覆盖安装目录与仓库的 `assets/voice/`；V1 原版 5 条 `greet-<slot>.mp3` 不动。屏幕字幕 `GREET_LINES.text` 仍是简洁版、不要求与音频逐字一致。
- **资源**：20 条新语音 **2,303,748 B / 5.24–9.84 s**；25 段合计 **2,708,325 B**（原 5 段 404,577 B）；总发布资源约 7.8 MB。
- **体积**：`client.js` / `index.js` 无改动（160,210 B / 3,231 行、47,892 B / 1,392 行）；`package.json` 1.5.1。
- **验证**：①`ffprobe` 逐条确认 20 条时长 5.24–9.84 s（greet 阶段 13 s 锁足够）；ffmpeg `silencedetect(-38dB, 0.14s)` 每条 7–8 处 0.2–0.48 s 停顿，`greet-night-2.mp3` 在 5.76–6.20 s（「我值班」与「您不睡」之间）有 **0.44 s** 停顿；②安装目录与仓库 25 个 mp3 的 sha256 全部一致；③宿主 `GET /fairy-zzz/assets/voice/greet-night-2.mp3` 返回 200 / 159,021 B，ETag / Content-Length 正确。
- **说明**：旧版 20 条 mp3 已被 v1.5.1 早期实现覆盖、无法逐字节恢复，本次用同一引擎、同一份草稿台词重新合成；音色一致，个别句子的时长 / 韵律可能与旧版差 ±0.6 s（`greet-night-2` 因补静音比旧版长约 0.5 s）。

### 1.5.0（2026-11-03）

- **眼徽灵动性重做**：按用户提供的游戏内 Fairy 动图参考（米游社 article/54939105）给眼徽补上「叶片缓慢公转、外圈辉光不规则呼吸、眼球轻微收放、目光微动」。最初还实现过「白环亮点绕圈」的彗星高光，用户反馈**太突兀**后在定稿前删除（连同样式与关键帧一并清掉，分层由 5 层减为 4 层）。
- **分层 DOM**：`CoreGlyph` 改为 `.fz3-eye > .fz3-eye-halo + .fz3-eye-pulse + .fz3-eye-gaze > .fz3-eye-body > (plate / blades / anatomy / shine) + glitch + flicker + flash`；同一份静态 `FAIRY_EYE_SVG` 复制 4 份、按父层选择器只显示各自部件。
- **CSS**：删除 `fz3-breath-a..d` / `fz3-corners` / 旧 4s 脉冲；新增 `fz3-orbit` / `fz3-lens-breathe` / `fz3-halo-breathe` / `fz3-lash-pulse` / `fz3-atmos-breathe` 与分层规则；花屏滤镜目标改 `.fz3-eye-body`；`.fz3-gband` 延迟提升图层；CSS 文本 492 → 500 行。
- **运行时**：删除 `FZ3_LASH_PERIOD_S` / `lockLashFrame` / `setPulse` 里锁角度调用；新增 `stopGaze` / `scheduleGaze`（写 `--fz3-gaze-x/y/r`，4.6–8.8s 一次、停 1.3–2.4s 回中）；`setState` / `suspend` / `resume` / `mount` / `unmount` 全部接上目光微动。
- **Atmos**：删除 500ms JS 环境时钟，组件退化为纯静态渲染；呼吸改 CSS `14s steps(14,end)`。
- **体积**：`client.js` 159,519 → 160,210 B、3,244 → 3,231 行；`index.js` 不变（47,892 B / 1,392 行）；`package.json` 1.5.0；新增文档配图 2 张。
- **性能**（同一隔离 harness、dock 待机）：GPU 9.3–11.8% → 1.9–2.3%（约 −80%），渲染进程 CPU 47–54% → 4.5–6.6%（约 −90%）；DSH 真页面同轮 A/B（测的是带彗星层的中间版本）14.6–14.9% → 4.4%。
- **验证**（headless Chrome 自签 cookie 登录真实 GUI；用 `Page.addScriptToEvaluateOnNewDocument` 覆写 `fetch('/fairy-zzz/mood')` 以在「主动思考」的宿主里拿到 `idle` 态）：4 个分层容器各 1 个；4 个动画按 `steps` 时间线运行；`data-lid` 在 idle 为 null、切 `working` 后为 `thinking`；`--fz3-gaze-x/y/r` 在 12s 采样里出现 3 种取值（确认微动生效）；眼闪 / 花屏属性均被观察到；点眼徽弹气泡、Esc 关闭正常；控制台 0 exception。

### 1.4.0（2026-11-03）

- **问候语音库**：开屏问候从每个时段 1 条固定语音扩成 5 条（原版 1 条 + 按 Fairy 人设新写并合成 4 条），26 个时段分支改为 `GREET_LINES` 表（23-58）+ `currentGreeting()`（61-72）随机选择；用 `localStorage['fairy.zzz.greet-last']` 记录上一条文件名，命中则顺延一位，保证同一时段不会连续重复；`replayBoot()` 重置 `greetPick`，重播开机动画会重新随机。
- **台词与语音同源**：`greetLine()`（2079-2081）返回 `currentGreeting().text`，居中显示的是该条语音对应的**简洁字幕版**，音频本身是更长的富文本台词，二者不要求逐字一致（v1.5.1 澄清；v1.5.1 只是按同一份草稿重录并修了 night-2 的停顿，见 1.5.1）。
- **资源**：`assets/voice/` 新增 20 条 mp3（greet-<slot>-2..5.mp3，32 kHz 单声道约 130 kbps，5.08–9.36 s），合计 2,289,924 B；25 段合计 2,694,501 B（原 5 段 404,577 B）。音频只在 greet 阶段播放一次，不进渲染路径。（v1.5.1 按原草稿重录后为 2,303,748 B / 5.24–9.84 s，25 段合计 2,708,325 B。）
- **体积**：`client.js` 155,626 → 159,519 B、3,196 → 3,244 行；`index.js` 不变（47,892 B / 1,392 行）；`package.json` 1.4.0。
- **验证**：①Node 单测抽取 12-73 行源码块，stub localStorage / 随机数，验证 25 条命名与文案齐全、24 小时时段映射、5 个随机值索引、skip-last、跨时段重选全部正确；②headless Chrome 自签 cookie 登录真实 GUI 走 boot → greet → dock，命中的 mp3 与 localStorage 记录一致、`.fz3-copy-lines` 文本与库内文案逐字相同、网络里确有该 mp3 请求、无 console error；③两次独立加载分别命中不同文件，确认跨页面随机生效。

### 1.3.4（2026-11-03）

- **文案修复**：气泡底部脚注原为「工作日 09–12、14–18 十倍电费 · 后转十倍电费」——后半句省略了剩余时长（倒计时已在上一行），成了没有主语的半句。现改为完整规则行「工作日 09–12、14–18 十倍电费，其余时段五倍电费」；`index.js` 的 `peakState.window` 同步补全，客户端对旧宿主缺「五倍」的 `window` 自动兜底。
- **悬停提示**：眼标 SVG 常量里的 `<title>Fairy — selective Fairy-DSH idle adaptation (unofficial)</title>` 会让鼠标悬停时弹出浏览器原生提示（眼徽 / 侧栏字标 / 欢迎页眼标共用同一常量，全部受影响）；已删除该 `<title>`（保留 `<desc>` 与 SPDX 注释），不再出现提示。
- **体积**：`client.js` 155,313 → 155,626 B、3,192 → 3,196 行；`index.js` 47,865 → 47,892 B、1,392 行；无新资源。
- **验证**：headless Chrome 自签 cookie 登录真实 GUI，boot → dock 后点眼徽：气泡底部为「工作日 09–12、14–18 十倍电费，其余时段五倍电费」，无「后转」半句；页面内 SVG `<title>` 数量 0；眼徽 / 气泡不再有原生悬停提示；无 console error。

### 1.3.3（2026-11-01）

- **文案**：气泡统一成「电费」口径——标题「Fairy · 电费」；usage 态「电费余额 / 今日电费 / 五倍电费（谷时）或十倍电费（峰时）」；turn 态「本轮电费」+ 同样倍率行；底部提示「工作日 09–12、14–18 十倍电费 · 后转…」；设置页两条说明同步；`fetchBalance()` 的错误串改「电费余额…」。
- **host**：`peakState` 的 `label` / `window` / `next` 改新口径。
- **兼容**：客户端新增 `feeText()`（`clockText` 之后）把旧宿主的「高峰 / 空闲 / 高峰价」兜底改写，所以只换 `client.js` 也能显示新文案；`index.js` 的新文案要重启 DSH 才生效。
- **体积**：`client.js` 154,438 → 155,313 B、3,180 → 3,192 行；`index.js` 47,855 → 47,865 B、1,391 → 1,392 行；`package.json` 1.3.3；无新资源。
- **验证**：headless Chrome 自签 cookie 登录真实 GUI，boot → greet → dock 后点眼徽，气泡文本包含「电费余额 / 今日电费 / 五倍电费」、不再出现「用量 / 峰谷 / 今日花费」；无 console error / page error；截图核对长标签不换行。

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
| MED | 试听问候用裸 `Audio`，不受「停止」控制 | client.js 统一 `preview` 播放器（100 声明 / 113-121 停止 / 1655 试听）；v1.6.2 起试听每次随机抽一条并回显台词 |
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

---

## 21. 宿主皮肤层（v1.7.0「绳网终端」）

> 设计规范见 [UI-DESIGN.md](UI-DESIGN.md)；本文只记实现位置、改法与回退。

### 21.1 它改了什么

v1.7.0 在保留原有 H.D.D 开场 / 眼徽 / 问候 / 语音的前提下，把宿主 DSH Web GUI 的**外壳**整体重绘：侧栏、顶栏、欢迎页、composer、会话气泡、设置弹窗、插件自有设置页，以及 boot 覆盖层。设计语言 = 官网表达层（纸白 / 墨黑 / 荧光青柠 #d8fa00 / 斜切块 / Impact 数字）+ 绳网情报站工作层（三层黑面板 / 1px hairline / 12px 圆角 / 等宽 `//` 小标 / 单强调色）；浅色 = 纸面 + 墨黑侧栏，深色 = 监控台。

### 21.2 代码位置

- 全部皮肤样式是 **client.js 里 `const CSS` 模板字符串末尾追加的一大段静态 CSS**（搜索 `WIRE-NET TERMINAL` 或 `/* ===== SECTION` 即可定位）。它排在旧规则之后，靠后置 + 更高特异度 + `!important` 覆盖宿主默认样式；没有新增 React 组件、没有新增 DOM。
- 参考副本：`docs/skin/wire-net-terminal.css`（与 client.js 内该段一致，便于审阅 / diff / 单独改）。
- 两套设计 token 由 `theme.overrideTokens(PKG, TOKENS)` 覆盖（原 1.6.2 已有的机制，v1.7.0 把键扩到 41 个 × 2 主题）：基础面、描边、文本 4 档、interactive、状态色、按钮、sidebar/bubble/input/selector、滚动条、代码块、elevation、radius。深色值放 `baseTokens`，浅色值放 `lightTokens`。
- 主题判定仍是插件原有逻辑：读宿主 `theme.getTheme().active.id` / 量 `--dsw-alias-bg-base` 亮度 / `prefers-color-scheme` 三级回退，结果写 `html[data-fz3-theme="light"|"dark"]`；皮肤 CSS 只按这个属性分叉，不监听宿主类名。

### 21.3 选择器策略（宿主升级时先看这里）

1. **优先** `[data-slot="..."]`（宿主稳定锚点，如 `sidebar.brand.mark`、`conversation.hero.brand.mark`、`conversation.composer`、`main.conversation`、`settings.launcher`）、语义角色 `[role="menu"]` / `aria-selected`。
2. **其次** hash 类名前缀：`.wtg9ga_`（侧栏）、`.wnFoaW_`（会话行）、`.GRgSLq_`（composer）、`.WOwLGG_`（欢迎页）、`.AnXs9G_`（设置）、`.an3WzG_`（顶栏/布局）、`.LOmM4q_`（消息）。这些来自 DSH 0.2.1-rc.5 的 CSS Modules，**宿主升级后可能全部失效**。
3. 失效时的回退流程：按 `docs/research/dsh-host.md` 的 CDP 流程重新导出 DOM map（`docs/research/host-classes.json` 是当前快照），先保侧栏与 composer，欢迎页装饰可暂缺。
4. 皮肤**不改宿主布局变量**（`--dsh-chat-content-width`、`--dsh-composer-card-max-width`、侧栏宽度），只改颜色、描边、圆角、字体与装饰；需要宽度差异时用容器自身 max-width，不动宿主断点。

### 21.4 改法（调皮肤）

1. 先改 `docs/skin/wire-net-terminal.css`（或直接定位 client.js 内同名段落）。
2. 把改动同步进 client.js 的 `const CSS`：该段在旧 CSS 之后、模板字符串收尾反引号之前。
3. 若改 token 值，改 client.js 里 `baseTokens` / `lightTokens` 两个对象（保持 41 键同名），刷新页面即生效（client.js 是动态加载的，整页刷新即可，无需重启 DSH）。
4. 验证：`node --check client.js`；无头 Chrome 截图（cookie 认证 + 等 9s + 隐藏 `.fz3-layer`/`.fz3-atmos` 才能看到宿主 UI）；浅/深各截欢迎页 + 设置 + 会话；像素校验关键值（青柠 #d8fa00、纸面 #efefed、深色面板 #1b1d1b、侧栏 #111210）。
5. 同步安装目录 `%USERPROFILE%\.dsh\plugins\dsh-fairy-zzz\client.js` 后才真正生效；仓库副本与安装副本要 SHA256 一致。

### 21.5 回退

- 只回退皮肤：删除 client.js 中 `WIRE-NET TERMINAL` 起至 CSS 模板字符串收尾前的整段，并把 `baseTokens` / `lightTokens` 恢复为 1.6.2 的 15 键版本（`docs/skin/wire-net-terminal.css` 只做参考，不参与运行）。
- 完全回退版本：`git checkout v1.6.2` 并同步安装目录即可。

### 21.6 性能与动效纪律

- 皮肤是纯静态声明：无新增 `@keyframes`、无 `backdrop-filter`、无 `mix-blend-mode`、无逐帧 JS；交互只给颜色 / 1px 位移 / 硬偏移，统一 140ms。
- 原 boot 视频滤镜调暗为 `grayscale(.45) contrast(1.05) brightness(.84) saturate(.78)`，不新增层。
- 面积纪律：青柠（#d8fa00）只做行动 / 选中填充，任一张截图取色 < 5%；浅色下青柠**不作文本色**（文本强调用 #6f8700）。

