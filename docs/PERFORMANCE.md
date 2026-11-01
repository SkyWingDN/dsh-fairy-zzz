# 性能优化报告 / Performance notes

This page records why and how the **performance-optimized edition** of
dsh-fairy-zzz differs from the upstream plugin, plus the measurements used to
validate the result. 中文在前，English summary at the end. Section 9 adds the v1.2.0 GPU-usage work; §9.10 covers the v1.2.1 dead-code / dead-style cleanup, §9.11 checks the v1.3.0 interaction additions (usage bubble, drag, themes) and why they add no resident cost, §9.12 covers the v1.3.1 interaction-path rewrite, §9.13 covers the v1.3.2 conversation-region drag bounds, and §9.14 records the v1.3.3 fee-label copy change (no performance impact).

## 1. 背景与目标

上游 `fairy-zzz-plugin` 的眼徽动效由一个**常驻 `requestAnimationFrame` 主循环**逐帧驱动：
四层眼球呼吸、睫毛旋转、脉冲环、SVG 裁切眼睑、故障克隆同步等全部在 JS 里每帧计算，
并逐帧写 `style.transform` / SVG `clipPath`。由此带来：

- 待机与思考时主线程持续忙碌（约 31–41% 的一个 CPU 核），风扇与耗电明显；
- 启动页同时解码两路 `boot.mp4` 并铺全屏 `blur(46px)`；
- 常驻 `blur(34px)` / `blur(20px)` / `drop-shadow` 每帧重栅格化；
- 多 MB 资源以 `no-cache` 下发，每次刷新重传。

目标：**在不牺牲 Fairy 观感的前提下把资源占用压到接近空闲**，并保留全部动效语义。

## 2. 测量方法

测量条件：headless Chrome 156，视口 1600×1000、dpr 1，**10 秒稳态窗口**，
同一台机器、同一套静态 harness（harness 直接从 `client.js` 抽取 CSS / SVG / 运行时，
页面结构与 `FairySkin` 一致），改动前后使用完全相同的参数。

「主线程 %core」= 浏览器主线程任务占一个 CPU 核的百分比。headless 以约 160fps 出帧，
真实 60fps 下绝对数字更低，但**前后比例**可信。

harness 与测量脚本属于一次性验证工具，**未随仓库发布**；复测方法见第 8 节。

## 3. 前后对比

| 场景 | 优化前 主线程 | 优化后 主线程 | 降幅 |
| --- | --- | --- | --- |
| 侧栏待机（dock idle） | 31.2% | **1.8%**（复测 1.0%） | -94% |
| 模型思考中（thinking） | 30.9% | **1.6%** | -95% |
| 问候页待机（greet） | 41.1% | **2.5%** | -94% |
| 启动动画（boot） | 0.4% | 0.4% | 持平（本来就很低） |

同一窗口的其它指标（dock idle）：

| 指标 | 优化前 | 优化后 | 说明 |
| --- | --- | --- | --- |
| Script（JS 执行） | 2.0% core | 0.1% core | 常驻 rAF 循环已删除（rAF 请求 158 次/秒 → **0 次/秒**） |
| Recalc Style | 8.9% core | 0.6% core | 不再每帧改 SVG 裁切 / transform |
| Layout | 1.3% core | 0.1% core | dock 定位不再周期性全量测量 |
| Chrome 进程树 CPU | 201.6% | 86.9% | 含合成器 / GPU，噪声较大，趋势可信 |
| 长任务（>50ms） | 0 | 0 | 两者都没有卡顿 |
| DOM 元素数 | 496 | 496 | 无增加 |
| 首屏下载资源 | ≈9.0 MB | **≈2.9 MB** | -68% |
| 静态资源缓存 | 每次 no-cache 重下 | **ETag / 304 协商缓存**，音频 immutable | 刷新不再重传几 MB |

## 4. 关键发现：真正的元凶是「SVG 裁切形状动画」

优化过程中一度出现「JS 全删了、rAF 归零了，但主线程仍占 23%」：脚本时间 0.1%，
样式重算却有 6%。逐项关动画做二分定位后发现：

- 眼睑（半闭眼）的「呼吸」动画作用在 `<clipPath>` 里的形状上；
- 形状每帧变化 → Chrome 每帧都要重新解析 SVG 裁切、重绘整棵眼睛子树
  （**只能走主线程，上不了合成器**）；
- 待机时该裁切根本不可见，动画却在空转，于是每秒 60 次白算；
- 降帧无效（`steps(8/12/24)` 实测 34.6% / 29.7% / 30.9%，与连续动画 31.8% 同一量级），
  只有 `animation: none` 才降到 1.3%；
- 最终方案：**删掉这条动画，把眼睑形状固定在原呼吸的「张开」相位**。眼球四层自身的
  缩放呼吸、睫毛旋转、脉冲环、眼闪全部保留（它们跑在合成器上，经探针验证零主线程成本），
  所以眼睛依然「活」着，只是思考时不再持续做半闭眼开合的动作。

## 5. 改动清单

### client.js（前端动效与组件）

1. 删除常驻 `requestAnimationFrame` 主循环：四层眼球呼吸、睫毛 15s 旋转、4s 脉冲环、
   眼闪改为纯 CSS `@keyframes` 驱动；花屏 / 故障 / 表情切换仍由离散定时器触发，
   事件之间主线程完全静默。
2. 删除每帧 SVG 写 transform、12 步二分缓动、5 份眼睛克隆的逐帧同步
   （克隆只在花屏时 `display:block`）。
3. 眼睑半闭眼形状改为静态（详见第 4 节）。
4. 启动动画：两路 `boot.mp4` 同时解码改为单路 `boot-opt.mp4`；去掉全屏 `blur(46px)` 铺底；
   boot 进度条改为直接写 DOM（不再每帧 `setState` 触发 React 重渲染）——该进度条随后在 v1.2.1 随被隐藏的 boot HUD 一并删除（见本节第 11 条）。
5. 去掉多道常驻模糊 / 滤镜：氛围光 `blur(34px)`、闪光 `blur(20px)`、眼周光晕 `blur(20px)`、
   眼睛 `drop-shadow` 全部改成静态多层渐变（不再每帧重栅格化）。
6. 轮询感知页面可见性：mood 900ms、health 5s 轮询在页面隐藏时暂停、可见时恢复，
   并做 in-flight 去重（避免请求堆叠）。
7. dock（侧栏）定位：缓存容器、合并 resize 定时器，不再每 600ms 遍历全部
   `div/main/section` 做 `getBoundingClientRect`（强制布局）。
8. `React.memo` 包裹眼睛 / 氛围层，减少父组件重渲染波及；淡出结束后的图层加
   `visibility:hidden`，彻底停止绘制。
9. 清理重复的 `body::after` 死规则等。
10. （v1.2.0）GPU 占用优化：背景 40s 漂移动画静态化、氛围光 14s 呼吸改为 500ms JS 环境时钟、删除 `fz3-drift` / `fz3-breathe` 两个全屏动画关键帧（详见第 9 节）。
11. （v1.2.1）死代码 / 死样式清理（**零行为变化**）：删除从未渲染的 `Waveform`、被 CSS `display:none` 隐藏的 boot HUD / 进度条 / 跳过按钮（含 `barRef/pctRef/onTime` 直写 DOM 的代码）、FairySkin 左下角 `fz3-tag`，以及 `index.js` 里从未调用的 `pingEngine()`；CSS 删除 93 条死规则 / 6 个未使用 `@keyframes` / 6 个未使用 CSS 变量，i18n 删除 25 条未使用词条。`client.js` 2,171 → 1,919 行、109,117 → 93,886 B（约 −14%）；不改动任何渲染路径与动画，第 3 / 9 节的 GPU / 主线程数据不受影响（详见 9.10）。
12. （v1.3.0）新增交互全部是**按需 / 静态 / 交互期**路径，不新增常驻动画或定时器：用量气泡只在展开时挂载并只在此期间跑 1s 倒计时（关闭即卸载、清定时器），刻意不用 `backdrop-filter`（高刷屏上每帧都要重算全屏背景模糊）；外观三档只切 `html[data-fz3-theme]` 走静态 CSS 覆盖，不改渲染循环；眼徽拖拽只在 `pointermove`（指针按住期间）写 `:root` 的 `--fz3-dock-x/y` 两个变量，松开即停（属于人机交互，不是定时器驱动的常驻样式重算，见第 7 节教训与 §9.11）；欢迎页文案改写用 `MutationObserver`（childList + characterData，60ms 去抖）替代参考实现的 900ms 轮询，空闲时零定时器。

### index.js（host 路由）

1. 静态资源：强 ETag（size-mtime）、`Last-Modified`、`If-None-Match` / `If-Modified-Since`
   → 304 空 body；HEAD；Range / 206 + If-Range（视频拖动 / 音频 seek 正常）；
   `cache/` 下 sha1 命名的音频改为一年 immutable。
2. 高频接口记忆化：`/mood` 300ms、`/engine` 1500ms、`/voice-home` 3000ms，带 in-flight 去重；
   `?diag=1` 绕过缓存；start / stop / TTS 成功后主动清缓存。
3. 既有路由的行为不变（v1.3.0 之前 30/30 端点断言全部通过；v1.3.0 新增的 `/usage` 见下条）。
4. （v1.3.0）新增 `GET /fairy-zzz/usage`：按需增量解析 `sessions/*/*/session.v4.jsonl.zstd`（按 RFC 8878 逐帧切分，按文件缓存 `{mtimeMs,size,events,parsedTo}`），按北京时区当天与峰谷逐笔计价，返回 `{ ok, now, peak, today, turn }`；3s 记忆化 + in-flight 去重，冷启动 505–608ms / 热 ~20ms，只在气泡展开时被请求，不落在首屏路径上。

### 媒体资产

| 文件 | 前 | 后 | 降幅 |
| --- | --- | --- | --- |
| boot.mp4 → boot-opt.mp4 | 4,814,589 B | 2,394,692 B | -50.3%（1280×720 crf27，PSNR 38/36/34 dB） |
| hero.png → hero.webp | 1,943,569 B | 23,014 B | -98.8%（1600×1017 q82，PSNR 42.4 dB） |
| greet 问候语音 wav → mp3 | 1,653,980 B | 420,129 B | -74.6%（时长不变） |
| **运行时实际下载合计** | **≈9.0 MB** | **≈2.9 MB** | **-68%** |

旧文件（boot.mp4 / hero.png / voice/*.wav）在本仓库中已删除，如需回滚请从上游
`AssassinVIX/fairy-zzz-plugin` 取。

## 6. 观感验证

用「冻结动画相位」的方式对改动前后截图做逐像素对比（同页面、同视口、同参数）：

- 启动画面：**逐像素完全一致**（mean / max 差异均为 0）；
- 待机 / 问候：整图平均差异 0.23–1.49 / 255，差异超过 16 灰阶的像素不到 1%，
  文字 / 布局 / 形状未变；
- 眼睛区域是唯一的可见差异区（mean 8–11 / 255，面积约 128×128 px）：约 1/3 来自
  外圈辉光由实时 `drop-shadow` 换成静态多层渐变的正常差异（外圈 15.4→11.0，
  眼球内部差异仅 2.1，基本不可见），约 2/3 是冻结相位 / 光栅化造成的边缘细环伪影
  （无整体缩放或位移）。

结论：**观感保持**。呼吸、睫毛旋转、脉冲环、眼闪、花屏故障、思考半闭眼等动效全部保留；
唯一变化是思考态半闭眼不再持续开合（见第 7 节取舍）。

![待机眼徽前后对比（BEFORE | AFTER）](img/before-after-dock-eye.png)

## 7. 如何生效 / 注意事项

1. **完全退出并重启 DeepSeek Harness 桌面应用**（host 端 `index.js` 的路由改动只有重启
   才生效）。
2. 重启后**整页刷新一次**（Ctrl+Shift+R）加载新的 `client.js`。
3. 验证：DevTools → Network 里 `hero.webp` / `boot-opt.mp4` 应出现 304 或 from cache；
   任务管理器里该插件的 CPU 占用应明显下降。
4. 回滚：用上游原版 `client.js`、`index.js` 覆盖回插件目录即可（本仓库不含旧资产）。

注意：

- 上面的百分比是 headless（约 160fps 出帧）口径，会放大主线程占比；真实 60fps 下
  绝对值更低，但逐帧工作量的比例差异方向可靠。
- GPU / 合成器相关指标（进程树 CPU）噪声较大，同配置重复测量可差 ±10 个百分点；
  `Task%` / `Script%` / `Recalc%` 更稳定。
- **代价 / 取舍**：思考态的半闭眼不再做持续开合呼吸（静态半闭眼）。这是本次唯一
  有意做的动效简化，也是拿掉约 27% 一个核的必要条件；想恢复的话，成本约为每秒 60 次
  整棵眼睛子树的裁切重算。
- **GPU 取舍（v1.2.0）**：背景漂移不再移动、氛围光呼吸改由 500ms 环境时钟驱动，肉眼几乎不可察觉，但把 dock 待机 GPU 从 43.1% 降到 5.1%（约 -88%）。boot 阶段的视频解码与 greet 切换瞬间仍是短暂的 GPU 高点，属于可接受代价（见第 9 节）。

## 8. 复现方法

本次的对比 harness 与测量脚本是一次性验证工具，未随仓库发布。复测思路：

1. 从任意版本的 `client.js` 中用标记 `/* FZ3_RUNTIME_BEGIN */ … /* FZ3_RUNTIME_END */`
   抽取运行时，并连同页面里的 CSS / SVG 拼成一个静态 HTML harness；
2. 用 headless Chrome + DevTools Protocol 的 `Performance.getMetrics` 记录 10 秒稳态窗口，
   分别统计 `TaskDuration`、`ScriptDuration`、`RecalcStyleDuration`、`LayoutDuration`；
3. 用同样的参数跑两份 `client.js`（上游 / 本版），对比绝对值和比例即可。

## 9. GPU 占用优化（v1.2.0）

### 9.1 现象与目标

用户实测：核显下开着插件 GPU 平均 **80–90%**，关掉插件约 **10%**；即使只是把插件挂在侧栏待机，风扇也一直在转。复现后定位到原因：在 **165 Hz 高刷屏**上，任何**全屏尺寸的 CSS 动画层**都会导致每帧整屏重新合成，GPU 占用随刷新率翻倍。插件里恰好有两处这种层。

目标：165 Hz 屏待机时也接近空闲，同时保留呼吸观感（不靠删动效换数字）。

### 9.2 测量方法

- headless Chrome 156 真实加载插件页面，进入 DSH GUI 后等 dock 稳态再开始采样；
- 视口 1610×883、dpr 1.5、165 Hz 显示器；
- 窗口用 `SetWindowPos` 置顶，避免被其它窗口遮挡（被遮挡时页面被判定为 hidden、动画暂停，会测出 0）；
- GPU 指标 = Windows 计数器 `\GPU Engine(*)\Utilization Percentage` 里该浏览器 GPU 进程的**引擎最大值**，每秒一个样本；
- 每变体 12–20 秒采样、丢弃前 2 个样本（最终版本取 20 秒）；
- **同轮内做相对比较**：跨轮 base 会漂移（37–43%），绝对值的量级可信，但不要跨轮对比。

### 9.3 归因表（dock 待机，GPU 引擎平均占用，同一轮测量）

| 变体 | GPU |
| --- | --- |
| v1.1.1 原样（所有氛围动画在跑） | 43.1% |
| 只关眼睛四层呼吸 / 睫毛 / 脉冲环 | 42.6%（−0.45，可忽略） |
| 只关 body::after 网格层 | 40.9%（−2.2，可忽略） |
| 只关氛围光呼吸 + 闪光（glow/flash 动画停 + blend 改 normal + rim 去 blur） | 36.9%（−6.2） |
| 氛围层整层 display:none | 29.9%（−13.2） |
| 只把背景漂移静态化 | 23.4%（−19.7） |
| 漂移静态化 + 氛围光呼吸 / 闪光关 | 5.2%（−37.9） |
| v1.2.0 最终版（漂移静态 + JS 环境时钟呼吸） | 5.1% |

交叉验证（以「背景漂移已静态化」为基线 22.6%）：

- 把氛围光呼吸动画加回来 → **44.4%**；只加回闪光 `steps(1)` → **14.0%**；两者都不加 → **14.1%**；
- 把 `mix-blend-mode:screen` 改成 `normal` → 20.35%（只省 2.3）；去掉 `.fz3-rim` 的 `blur(8px)` → 22.9%（无效）；
- 把发光呼吸换成 `steps(24)` 离散 → 11.0%（仍然很贵）；
- 同一 harness 下「纯 DSH、不启用插件」基线约 4.7–7%。

结论一句话：**成本不在 128px 的眼徽动画，而在两处全屏动画层；165 Hz 下每帧整屏合成把成本放大了。**

### 9.4 原理解释

- 全屏 `position:fixed` 层只要每帧有变化，合成器就要重做整屏合成；165 Hz 即每秒 165 次，代价随刷新率线性放大。
- 背景层 `body::before`：`fixed`、`inset:-12%`、多层渐变，带 40s 位移/缩放漂移动画——覆盖并超出整个视口。它大部分被界面遮住，但**渲染成本是按层算的**，看不见不等于不花钱。
- 氛围层 `.fz3-atmos`：`fixed` `inset:0` + `mix-blend-mode:screen`，这一整层每帧都要和下面所有内容重新混合，代价被进一步放大。
- 小面积元素（128px 眼徽、384px 脉冲环）的动画跑在合成器上，实测几乎免费。
- 所以正确的优化对象是**两处全屏层**，而不是眼徽本身。

### 9.5 改动清单（client.js，仅这三处 + 一个 JS 环境时钟）

1. 删掉 `body::before` 的 `animation:fz3-drift ...`；背景层固定为原动画起始位姿 `transform:translate3d(-1.4%,-1%,0) scale(1.03)`；删掉 `@keyframes fz3-drift`（保留注释说明原因）。
2. 删掉 `.fz3-atmos-glow` 的 `animation:fz3-breathe ...`，静态基线 `opacity:.55`、`transform:scale(1)`。
3. 删掉 `@keyframes fz3-breathe`（保留注释）。
4. 呼吸观感改由 JS 环境时钟驱动（Atmos 组件，`React.memo`）：
   - 新增 `glowRef = React.useRef(null)` 与 `React.useEffect(...)`；
   - `window.setInterval` 每 **500ms** 写一次 `glow.style.opacity = (0.55 + 0.45*ge).toFixed(3)`、`glow.style.transform = 'scale(' + (1 + 0.06*ge).toFixed(4) + ')'`；
   - 其中 `gp = (t % 14000)/14000`、`ge = 0.5 - 0.5*cos(2π·gp)`（等价于原 ease-in-out 呼吸曲线）；
   - `document.hidden` 时跳过该次更新；组件卸载时 `clearInterval`；JSX 里 glow div 加 `ref`。
   - 效果：**呼吸观感保留**，但只在 500ms 的更新点让合成器重做一次整屏混合（2 次/秒），而不是 165 次/秒。
5. 保留不动：眼徽四层呼吸、睫毛 15s 旋转、脉冲环、眼闪、花屏/故障、思考半闭眼、hero/对话界面过渡、`.fz3-atmos-flash`（11s `steps(1)` 离散闪烁，实测几乎免费）。

### 9.6 失败方案与教训

- **保留背景漂移（已放弃）**：用 JS 每 500ms 在 `document.documentElement` 上写 `--fz3-drift-x/y/s` 三个 CSS 变量，让 `body::before` 的 `transform` 用 `var()` 跟随。GPU 确实降到 ~5.7%，但**主线程变差**：CDP Performance 20 秒窗口 `RecalcStyleDuration` 4.055 s，而同样窗口基线只需 0.82 s（≈ +16% 主线程；每次写未注册的继承型自定义属性会触发整棵文档样式重算，43 次更新 × ~80ms）。教训：**定时器不要驱动 `:root` 上的自定义属性**；漂移最终放弃、背景静态化。
- **prefers-reduced-motion 分支（已删除）**：曾加 `prefers-reduced-motion: reduce` 时早退，但原插件本来就没有这个降级逻辑，且 headless Chrome 默认报 `reduce=true` 导致无法测量，已删除，保持与原版一致的行为。

### 9.7 改后数据

- dock 稳态 GPU **5.1%**（43.1 → 5.1，约 **−88%**）；
- boot 阶段 **9.85%**（主要是视频解码）；greet 切换瞬间前 3 秒 39/46/23%，之后回落到 5–6%；
- 主线程仍处低水平（22 秒窗口：`TaskDuration` 20.462 s、`ScriptDuration` 0.075 s、`RecalcStyleDuration` 1.146 s、`LayoutDuration` 0.342 s；RecalcStyle 绝对量很小、与基线同量级，远低于失败方案的 4.055 s）；
- 真机对照（诚实写法）：真实桌面端 Electron（1624×977、dpr 1.5、未刷新仍跑旧 `client.js`）dock 待机实测约 **17.9%** GPU；用户原始反馈是核显下 80–90% vs 关插件约 10%。刷新到 v1.2.0 后的真机数字**待验证**，预计会回落到接近纯净 DSH 的水平。

### 9.8 图片

![GPU attribution](img/gpu-attribution.png)
![GPU before/after](img/gpu-before-after-dock.jpg)

图注：上图为 dock 待机时逐项关闭各层的 GPU 归因；下图为整页截图的前后对比（BEFORE 43% / AFTER 5%）。

### 9.9 取舍与后续可选项

- 背景漂移不再移动——几乎不可见（背景本就被界面遮住，且固定为原动画起始位姿）。
- boot 的视频解码与 greet 过渡仍是瞬态高点，属于可接受代价。
- 未来若想恢复漂移：可把背景换成独立小元素并限制合成范围（例如只在一个小区域做动画），但**不要**用定时器改 `:root` CSS 变量。

### 9.10 v1.2.1：死代码 / 死样式清理（零行为变化）

v1.2.1 只删代码、不碰渲染与动画路径，因此本节 GPU / 主线程数据全部继续有效：

- `client.js` 2,171 → 1,919 行、109,117 → 93,886 B（约 −14%）；`index.js` 30,859 → 30,812 B（删掉从未被调用的 `pingEngine()`）。
- CSS 文本 517 → 383 行（文件行 347-729）：删除 93 条死规则、6 个未使用 `@keyframes`（`fz3-bar/fz3-wave/fz3-panel-in/fz3-rot/fz3-rot-rev/fz3-twinkle`）、6 个未使用变量（`--fz3-blue/violet/magenta/ink/mute/line`）。
- 被删除的选择器 / 变量 / 关键帧在删除前已全文件 `grep` 确认无引用；眼徽动画、boot 视频、静态 poster 模糊铺底、问候与 SKIP2、设置面板、朗读按钮全部保留。
- headless Chrome 真实加载插件页面验证：boot → greet → dock 正常，无 JS 报错，`.fz3-boot-hud` / `.fz3-tag` / `.fz3-wave*` 元素数为 0，截图与 v1.2.0 一致。

### 9.11 v1.3.0：交互新增功能的增量性能核查

v1.3.0 新增的用量气泡、眼徽拖拽 / 显隐、外观三档与欢迎页文案改写，全部避开常驻动画 / 定时器路径，因此第 3 / 9 节的 GPU / 主线程数据继续有效：

- 用量气泡只在点击 / 轮末展开时挂载，关闭即卸载；只有展开期间才有 1s 倒计时（归零回调父层重拉一次）；不使用 `backdrop-filter`（对比参考实现的全屏实时模糊，高刷屏上每帧都要重算）。
- 外观三档只改 `html[data-fz3-theme]`，CSS 侧全部是静态覆盖（CSS 936-971 行），不触发动画 / 布局循环；主题探测只在挂载与 theme 变化时跑。
- 眼徽拖拽用 `pointermove` 事件直接写 `:root` 的两个变量（`--fz3-dock-x/y`），仅指针按住期间发生，松开即结束 —— 这是 §9.6 教训的**明确例外**：驱动源是人手交互而非定时器，没有常驻重算。（v1.3.1 起这条写法也改掉了，见 9.12：拖动只写元素自身 `transform`。）
- 欢迎页文案改写用 `MutationObserver`（childList + characterData、60ms 去抖）替代参考实现的 900ms 轮询，空闲时零定时器。
- host 侧 `GET /fairy-zzz/usage` 走 3s 记忆化 + 增量 zstd 帧解析（冷 505–608ms / 热 ~20ms），前端只在气泡展开时请求。
- 代码体积：`client.js` 140,594 B / 2,882 行（CSS 文本 489 行）、`index.js` 47,855 B / 1,391 行；仍是零构建、运行期零依赖。

### 9.12 v1.3.1：拖拽与用量气泡的交互路径重做

v1.3.1 不新增任何常驻动画，改的是两条**用户交互路径**的成本，并补上拖拽吸附。

**拖拽为什么卡**：v1.3.0 的 `onCoreMove` 每个 `pointermove` 都写 `document.documentElement.style` 的 `--fz3-dock-x/y`。这两个变量被 `.fz3-core` 的 `left/top` 使用，改它等于让**整页样式失效 + 重新布局 + 全屏重绘**；165 Hz 屏每秒产生 165 个事件，每个都触发一次全文档 recalc。

v1.3.1 的做法：

| 项 | v1.3.0（旧） | v1.3.1（新） |
| --- | --- | --- |
| 拖动中的几何写入 | 每个 `pointermove` 写 `:root` 两个变量 → 全文档 recalc + layout | 只写**元素自身** `style.transform` → 只走合成器，不触发 layout / paint |
| 事件节流 | 无（每秒 165 次全部执行） | `requestAnimationFrame` 合并，一帧最多写一次 |
| React 开销 | 拖动期间可能因气泡 state 每帧重渲染 | 移动期间**不 setState**，仅超过 4px 时置一次 `dragging` |
| 事件监听 | 元素上的 pointer capture | `window` 捕获阶段监听 move/up/cancel，统一在 `detachDrag` 移除 |
| 拖拽期视觉降压 | 无 | 关掉脉冲环、`.fz3-atmos` 内联 `mix-blend-mode:normal`（临时去掉全屏混合） |
| 松手 | 慢过渡（1.35 s） | 先落位写存储，再 `el.animate()` 170 ms 补间余量 |

**吸附**：`SNAP_EDGE = 64`。松手时距**会话内容区**任一边（v1.3.1 为整个视口；v1.3.2 起收紧，见 9.13）≤64px 即贴边，角落两轴同时吸（离边为「半个核 + 6px」，核不会切出屏幕）。贴边约 60 ms 完成，再用 170 ms 补间消除视觉跳变。

**遮挡让位**：右下角常驻的 `dsh-whale-widget` 根节点 `z-index:9999`，插件层只有 `z-index:20`。旧实现只比较 `elementsFromPoint()[0]`，拖动时命中的还是自己，于是永远不避让。新实现用 `ourStackZ()`（从 `.fz3-layer` 父级向上找第一个非 static 的 `z-index`，实测 20）与 `foreignZAt(x,y)`（`elementsFromPoint` 过滤插件层后取祖先链最高数值 `z-index`）比较，被盖住就沿吸附边向内 72 → 144 → 216 → 288 → 360px 试位。

**用量气泡为什么慢**：v1.3.0 每次点击都 `Promise.all([fetchUsage(), fetchBalance()])`，`/usage` 在宿主侧要扫会话日志（冷 505–608 ms），用户看到约半秒骨架屏。

v1.3.1 加了模块级预取缓存：`USAGE_TTL = 60_000`、`BALANCE_TTL = 30_000`；进入 dock 后 700 ms 调一次 `prefetchUsage()`；点击有新鲜缓存就**立即出数**（实测 65–166 ms），后台同时刷新；完全没缓存才显示骨架。页面隐藏超过 TTL 后再可见时补一次 `loadUsage(false)`。

**点外关闭**：气泡打开期间挂 `document` 捕获阶段 `pointerdown`，目标不在 `.fz3-bubble` / `.fz3-core` 内即关闭；`Escape` 同样关闭；关闭 / 卸载时移除监听。

**headless 实测（Chrome，1602×944 @ dpr1.5，165 Hz 显示器）**：

| 指标 | 结果 |
| --- | --- |
| 拖拽 24 次 `pointermove` 总耗时 | 146–201 ms |
| 长任务（`PerformanceObserver('longtask')`） | 0 个 |
| 拖动中 `--fz3-dock-x` | 保持不变（旧实现会连续跳变） |
| 左边缘吸附落点 | 60 ms 后 `rect.x = 10`，`--fz3-dock-x = 74px`（中心） |
| 右下角（鲸鱼遮挡）落点 | 自动上移 72px → `--fz3-dock-x = 1528px`、`--fz3-dock-y = 798px` |
| 点击出气泡（有缓存） | 65–166 ms |
| 控制台错误 / 页面异常 | 0 |

代码体积：`client.js` 3,119 行 / 151,180 B（CSS 文本 492 行，比 v1.3.0 只多交互态 3 行）。

### 9.13 v1.3.2：拖拽 / 吸附边界收进会话内容区

v1.3.1 的吸附以**整个视口**为边界，眼徽可以被拖到左侧栏、标题栏上，贴边时也会贴着窗口四条边。v1.3.2 把可拖拽 / 可吸附区域限制在**会话内容区**：左 = 侧栏右缘，上 = 标题栏底缘，右 / 下 = 窗口边缘。

- `measureRegion()`（client.js 2156）读 `[class*="_sidebarCol"]` 的右缘与首个 `header`（`height<120 && top<=12 && width>vw*0.3`）的底缘；宿主 bundle 里 tabs 就在 `header` 内部（`.an3WzG_header:has(.an3WzG_tabs)` 时 min-height:76px），所以打开会话后 header 变高，量到的上边界自动跟着下移。
- `regionBounds()`（2177）做 clamp 兜底，`clampPos`（2251）、默认停靠（2395）、`snapPos`（2654）、`avoidOcclusion`（2707）都改用区域边界；`onCoreDown`（2724）在每次 `pointerdown` 时重量一次，拖动期不读布局。
- 量不到侧栏 / 标题栏（例如宿主改版类名）时退回整个视口，行为退化为 v1.3.1，不会卡死或把眼徽锁死在一个点。

headless 实测（1602×944 @ dpr1.5）：默认停靠 `--fz3-dock-x=358px`、`--fz3-dock-y=492px`（核 rect x=295..423，完全在 x≥280 的会区内；旧版左缘 278 压到侧栏 2px）；拖到最左落位 x=354=280+74（rect.x=290）；拖到最上 y=114=40+74（rect.y=50）；右下角吸附 + 鲸鱼遮挡让位仍为 x=1528 / y=798；localStorage 写入 `{"x":354,"y":320}`；24 次 pointermove 146–201 ms、零长任务，无 console error。

代码体积：`client.js` 3,180 行 / 154,438 B（只加区域测量约 61 行，无 CSS 变化、无新资源）。

### 9.14 v1.3.3：电费文案（零性能影响）

v1.3.3 只把用量气泡的文案从「用量 / 余额 / 今日花费 / 峰谷」改为「电费 / 电费余额 / 今日电费 / 五倍电费·十倍电费」，并按时段动态切换第三行标签（谷时「五倍电费」、峰时「十倍电费」、无数据兜底「电费时段」）。

- 客户端只新增一个模块级纯函数 `feeText()`（把旧宿主可能返回的「高峰 / 空闲 时段」映射成「十倍 / 五倍电费」，`client.js` 里是字符串替换），没有新增动画、`setInterval`、`requestAnimationFrame` 或请求；气泡仍然只在打开时挂载，关闭即卸载。
- 宿主 `index.js` 只改 `peakState()` 返回的 `label` / `window` / `next` 三个字符串，`/usage` 的解析、3 s memo 与缓存路径完全没动，开销与 v1.3.2 相同（冷 505–608 ms、热 ~20 ms，仍只在气泡打开时请求）。
- 新增 1 行动态标签文本不会改变布局成本：气泡宽度仍固定 236 px（`--fz3-bubble-w`），最长标签「五倍电费」4 个字单行显示，headless 截图核对无溢出 / 无换行。

因此第 3 / 7 节的 GPU 与主线程数据继续有效；`client.js` 3,192 行 / 155,313 B、`index.js` 1,392 行 / 47,865 B（相对 v1.3.2 分别 +12 行 / +875 B、+1 行 / +10 B）。
---

## English summary

The upstream plugin drives all eye motion from a resident `requestAnimationFrame`
loop: every frame it recomputes transforms, SVG `clipPath` geometry and glitch
clones. On the measured machine that kept the main thread at ~31–41% of one CPU
core while merely idling or thinking, decoded two boot videos at once, kept several
`blur()` / `drop-shadow` filters live, and served multi-MB assets with `no-cache`.

This edition:

- replaces the JS animation loop with CSS keyframes (0 rAF requests per second at
  idle; main thread ~1.0–2.5%, a ~94–95% reduction);
- drops the per-frame `clipPath` eyelid breathing — the single largest main-thread
  cost — and keeps the eyelid as a static half-closed shape while an agent runs
  (the eye itself still breathes, the lashes still rotate, the pulse rings and
  flicker are intact);
- replaces live `blur()` / `drop-shadow` with static layered gradients;
- makes the boot stage a single `boot-opt.mp4` without a full-screen blur backfill,
  and wrote progress straight to the DOM until v1.2.1 removed the progress bar
  together with the hidden boot HUD;
- adds strong ETag / `Last-Modified` / 304 revalidation, `Range` / `If-Range`, and
  immutable caching for synthesized audio; memoises `/mood`, `/engine` and
  `/voice-home` briefly; pauses polling while the page is hidden;
- shrinks the runtime payload from ~9.0 MB to ~2.9 MB (`boot-opt.mp4` 2.3 MB,
  `hero.webp` 23 KB, greeting clips as MP3).
- removes the two **full-screen animated layers** that dominated GPU cost on a
  165 Hz display: the 40 s background drift is now static, and the 14 s
  atmosphere-glow breath is driven by a **2 Hz JS ambient clock** that writes
  inline `opacity` / `transform` (dock idle GPU 43.1% → 5.1%, about −88%; boot
  stage 9.85% is mostly video decoding);
- leaves small animations alone — the 128 px eye, 384 px pulse rings and the
  discrete `steps(1)` flicker are nearly free; the pitfall to avoid is driving
  `:root` custom properties from a timer (even at 2 Hz it triggered a
  full-document style recalc: 4.055 s vs 0.82 s over a 20 s window), so the
  background drift was dropped instead;
- trims dead code and dead CSS (v1.2.1, zero visible behaviour change): removes
  the unused `Waveform` component, the CSS-hidden boot HUD / progress bar / skip
  button and their direct-DOM `barRef` / `pctRef` / `onTime` code, the sidebar
  dock tag, and the never-called `pingEngine()`; deletes 93 dead CSS rules,
  6 unused `@keyframes`, 6 unused CSS custom properties and 25 unused i18n
  entries — `client.js` goes 2,171 → 1,919 lines / 109,117 → 93,886 B (about
  −14%) while touching no render path, so the GPU / CPU numbers above stand.
- adds (v1.3.0) the on-demand usage / balance bubble, draggable & hideable eye badge, three-way appearance mode and rewritten welcome copy; every addition is on-demand, static or pointer-driven (no resident animation or timer): the bubble mounts only while open with a 1 s countdown and no `backdrop-filter`, themes flip a single `html[data-fz3-theme]` attribute over static CSS, drag writes two `:root` variables only while the pointer is down, welcome copy uses a debounced `MutationObserver` instead of 900 ms polling, and the host parses session logs incrementally for `GET /fairy-zzz/usage` (cold 505–608 ms, warm ~20 ms, 3 s memo, requested only when the bubble opens). The GPU / CPU numbers above remain valid; `client.js` is now 140,594 B / 2,882 lines.

- adds (v1.3.1) a transform-only drag path: while dragging, the eye badge writes only its own
  `transform` (rAF-coalesced, no React state updates) and never the `:root` custom properties —
  the v1.3.0 approach invalidated styles for the whole document on every `pointermove`; 24 moves
  now cost 146–201 ms with **zero long tasks**. Releasing snaps to a viewport edge when within
  64 px (corners on both axes) with a 170 ms tween, and the badge steps aside from foreign overlays
  with a higher stacking `z-index` (the 9999 `dsh-whale-widget`) instead of landing underneath them.
  The usage bubble opens from a prefetched cache (65–166 ms; TTL 60 s / 30 s, prefetched once at
  dock) instead of a cold `/usage` scan (~0.5 s), closes on outside click / `Escape`, and the
  settings page no longer prints the "local CPU inference" suffix. `client.js` is now 151,180 B /
  3,119 lines with no new resident animation or timer.
- adds (v1.3.2) conversation-region drag bounds: the drag area and the snap edges are limited to the
  conversation content area (right of the sidebar, below the header; right/bottom are the window
  edges). The region is measured with one `getBoundingClientRect` pass on pointer-down
  (`[class*="_sidebarCol"]` plus the first short `header`; the header contains the chat tabs, so it
  grows automatically in an open conversation) and falls back to the full viewport when either
  element is missing. `client.js` is now 154,438 B / 3,180 lines; no CSS or asset changes and no
  resident cost.
Pixel-level comparison of frozen animation frames shows the boot screen is
pixel-identical and idle / greeting screens differ only by 0.23–1.49 / 255 on
average (the eye halo is the only visible region, from switching from a live
drop-shadow to static gradients).

Attribution and the full list of adapted code are in [../NOTICE-fairy-dsh.md](../NOTICE-fairy-dsh.md);
the eye art and motion timings are ported from Chengzhibense/Fairy-DSH (Apache-2.0),
the original plugin is AssassinVIX/fairy-zzz-plugin (MIT).
