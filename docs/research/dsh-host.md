# DSH 宿主 UI 注入地图（ZZZ 皮肤层 · task-3）

> 采集目标：DSH Web GUI `http://127.0.0.1:12212`（本地，2026 构建：`assets/index-BXV-oxvX.js` + `assets/index-BNYAYEM7.css` + `vendor-DV2921Zo.css`）。
> 采集时插件：`dsh-fairy-zzz` v1.6.2（`C:\Users\SkyWingDN\.dsh\plugins\dsh-fairy-zzz`），body 内联 16 个 `--dsw-*` token，并带 `.fz3-layer` 全屏开场（z-index 9000）。
> 视口：1624×1042 @dpr1。产物：本文件 + `zzz-ui/shots/dsh-ui-*` 截图 + `dsh-ui-tokens.json`（418 token × 浅/深）+ `dsh-ui-styles-both.json`（57 选择器浅/深 computed style）+ `dsh-ui-styles-home-both.json`（欢迎页/门户组件补充）。
> 注意：最后一批实时探测时，团队已开始在宿主/插件里叠加 ZZZ 皮肤（侧栏 rgb(17,18,16)、强调色 rgb(216,250,0)、999px 胶囊、3px 硬阴影）。**本文件的浅/深基准表来自叠加皮肤之前**，可直接作为「原生宿主」对照。

---

## 0. TL;DR（给实现者的最短路径）

1. **需要改 UI 时优先改 token，不写组件样式**：宿主几乎所有 surface 都由 `--dsw-*` token 驱动（hover/selected/focus 也是），重映射 ~25 个语义 token 即可拿到 80% 皮肤效果。
2. **token 的官方注入点是插件 API**：`theme.overrideTokens(PKG, TOKENS)`（client.js:3240），token 值以 `{ light, dark }` 成对给出；扩展现有 16 个 token 的 map 即可，不必和 body 内联样式抢优先级。
3. **组件级样式只有一个统一注入点**：client.js 的单个 CSS 字符串模板 `611–1099` 行 → 对应 DOM 里唯一的 `<style data-plugin-css="dsh-fairy-zzz/fairy-zzz.css">`。在模板末尾追加「ZZZ 皮肤层」段即可，不要新增 style 标签（省一次 DOM/顺序问题）。
4. **选择器优先级**：插件 style 标签在宿主 178 个 style 里排第 22，**早于** 宿主 client-module 样式（#24…），同优先级会输。因此皮肤规则必须用**父级 scope 提权**：`html[data-fz3-theme='dark'] .mP3x-q_sidebarCol`（0,2,0+），或选择`[data-slot="..."]` 包裹。
5. **深浅色开关已现成**：插件把 `html[data-fz3-theme='light'|'dark']` 写好并随系统/宿主主题切换，皮肤 CSS 直接用它做双套配色；**不要再写一套 prefers-color-scheme 判断**。
6. **稳定挂钩顺序**：`[data-slot="..."]`（最稳，51 个值）→ `[data-*` 属性（data-align / data-state / data-chat-* 等）→ 宿主 hash 类名（如 `.wnFoaW_selected`，随构建变）→ 结构伪类（最后).
7. **禁区**：不要覆盖 `--dsw-alias-brand-primary`（Fairy 蓝；技能规范明确要求保留）；不要碰 `.fz3-layer` 开场 overlay；不要新增 `@keyframes`/`blur()`/`position:fixed`（性能预算：keyframes 11、blur 6、fixed 10，保持不变）；强调色 #d8ff3e 占比 < 5% 屏幕。

---

## 1. 采集与复现方法

- 截图/探测走 headless Chrome CDP（render.mjs 或直接 WebSocket）：`GET http://127.0.0.1:9440/json/list` → page `webSocketDebuggerUrl` → `Emulation.setDeviceMetricsOverride` 1624×1042 + `Emulation.setEmulatedMedia prefers-color-scheme` → `Runtime.evaluate` / `Page.captureScreenshot`。
- **必须先隐藏插件开场**：`document.querySelectorAll('.fz3-layer,.fz3-atmos').forEach(e=>e.style.display='none')`，否则 `.fz3-screen`（z 9000）全屏遮住宿主。这是所有 dsh-ui 截图能拍到宿主 UI 的原因。
- 主题切换用 `Emulation.setEmulatedMedia` 后等 1.2–1.5s，插件 theme-watch（debounce 260ms）会把 `html.dataset.fz3Theme` 翻到 light/dark，且 body 内联 token 随之更新。
- 点击路径：账号触发器 `._5Qcc8a_trigger` → 菜单 leaf「设置」→ 设置弹窗；会话行点击 `.wnFoaW_title` 的 leaf 走 SPA 导航（不刷新）。
- 截图前缀：**dsh-ui-**（不与 Lead 的 dsh-light/dsh-dark 冲突）；端口 9440–9449。

---

## 2. 截图清单（1624×1042，均已隐藏 fz3 开场）

| 文件 | 内容 | 状态 |
|---|---|---|
| `shots/dsh-ui-h-light-home.jpg`（=dsh-ui-final-light-home.jpg） | 浅色 默认/新会话欢迎页：侧栏 + 顶栏 + hero + 输入卡 | ✅ 可用 |
| `shots/dsh-ui-h-dark-home.jpg`（=dsh-ui-final-dark-home.jpg） | 深色 同页 | ✅ 可用 |
| `shots/dsh-ui-set-light-panel.jpg` | 浅色 设置弹窗（账号与余额页，含 nav 激活态） | ✅ 可用 |
| `shots/dsh-ui-set-dark-panel.jpg` | 深色 设置弹窗 | ✅ 可用 |
| `shots/dsh-ui-conv-light.jpg` / `-conv-dark.jpg` | 已有会话消息视图底部（气泡、停止行、输入卡） | ✅ 可用 |
| `shots/dsh-ui-conv-light-tools.jpg` / `-conv-dark-tools.jpg` | 同一会话上滚 1400px（工具卡、思考行、markdown、badge、turn tail） | ✅ 可用 |
| `shots/dsh-ui-p-light-settings-menu.jpg` 等 | 账号下拉菜单「设置/意见反馈/退出登录」状态 | 可用（辅助） |
| `shots/dsh-ui-light-settings-01.jpg` / `dark-...` / `*-session-01.jpg` / `dsh-ui-plugins*` / `dsh-ui-p-*-session-conv.jpg` | 早期失败批次（被开场挡住/空白） | ❌ 忽略 |

> 说明：host 端另有 Lead 的 `dsh2-light-*`/`dsh2-dark-*` 截图（home/chat/settings/menu/model/plugins），两套可互相对照，但类名数据以本文件为准。

---

## 3. 主题与 token 机制（最重要的底层事实）

### 3.1 主题状态挂在三处

| 位置 | 值 | 说明 |
|---|---|---|
| `html[data-ds-theme-source]` | `system` | 宿主主题来源（system/light/dark） |
| `html[data-fz3-theme]` | `light` / `dark` | **插件写入**，皮肤层直接用 |
| `body[data-ds-dark-theme]` | 深色时存在（空值），浅色时**属性不存在** | 宿主自身的深色标记 |

- 宿主 token 默认值来自 `<style data-plugin-css="@deepseek-ai/dsh-client-ui-theme/design-platform.css">`（19,081 B），规则是 `body{...}`（浅色）与 `body[data-ds-dark-theme]{...}`（深色）。
- CSSOM 中 `--dsw-*`/`--dsh-*` 名字共 **422 个**，计算后带值 **418 个**（见 `shots/dsh-ui-tokens.json`，浅/深成对）。
- 插件在 **body 内联 style** 里覆盖 19 个属性：3 个字号（`--dsh-content-font-size: 14px`、`--dsh-code-font-size: 11px`、`--dsh-terminal-font-size: 13px`）+ 恰好 16 个 `--dsw-*` token（`--dsw-alias-bg-base`、`bg-layer-1`、`bg-layer-2`、`bg-overlay`、`border-l1`、`border-l2`、`brand-primary`、`label-primary`、`label-secondary`、`state-error-primary`、`state-idle-primary`、`state-success-primary`、`state-warn-primary`、`--dsw-specific-sidebar-fill`、`--dsw-specific-bubble`、`--dsw-alias-markdown-code-block`）。

**推论**：给 `body` 写普通 CSS 覆盖这些 token 会输给 body 内联样式（除非 `!important`）；但 token 会被后代继承，所以把 token 覆盖声明在 `.mP3x-q_frame`（或 `[data-slot="root"]`）上，整个应用子树（侧栏、主列、overlay）都会用新值，且**无需 !important**。最干净的做法仍是走插件的 `theme.overrideTokens`，让内联值本身变成皮肤值。

### 3.2 样式加载顺序 / 级联

- 插件 style 标签是第 **22** 个 `<style>`；宿主 client-module 样式在其后（sidebar 模块 #24、InputBar #33、ToolRow #44、SettingsRoot #61…），共 178 个 style 标签、177 个带 `data-plugin`（宿主每个插件各插自己的样式）。
- 结论：插件 CSS 模板里的普通组件规则会被同优先级的宿主模块规则覆盖；**皮肤规则必须提权**：
  - `html[data-fz3-theme='dark'] .mP3x-q_sidebarCol {}` → 0,2,1（父级 1 类 + 1 属性 + 1 类），稳赢宿主 0,1,0；
  - `[data-slot="conversation.input.attachments"] .GRgSLq_card {}` → 0,2,0；
  - 必要时对插件自身 `html,body` 级 `!important` 规则做同等 `!important` 反击（见 §3.3）。
- token 级联不受影响：只要 token 声明落在应用子树容器上即可。

### 3.3 插件现有的全局 !important 规则（皮肤层必须知道）

来自 client.js CSS 模板（611–1099 行）：

```css
html, body { background: #080a12 !important; color-scheme: dark; }   /* 深色；浅色有 html[data-fz3-theme='light'] body { background:#eef3fc !important } */
body { font-family: var(--fz3-font) !important; }                     /* Bahnschrift/DIN Alternate… */
body::before { /* 两层渐变背景 */ }
::selection { ... }
::-webkit-scrollbar* { ... }
textarea, input { caret-color: var(--fz3-cyan); }
textarea:focus, input:focus { box-shadow: ... !important; }
a { color: var(--fz3-cyan); }
pre, code, kbd, samp { font-family: ... !important; }
button { transition: filter .16s, box-shadow .2s, background-color .2s, color .2s, border-color .2s; }
button:not([disabled]):active { transform: translateY(1px); }
:focus-visible { outline: 2px solid rgba(87,232,255,.7); outline-offset: 2px; }
```

- 皮肤层若要把背景/字体换成 ZZZ 质感，需要自己的 `html[data-fz3-theme='dark'] body {... !important}` 或直接改这些模板行（模板在同一文件，属同一注入点）。
- `body::before` 的渐变是「Fairy 蓝氛围层」；ZZZ 皮肤建议保留其存在（避免布局/层级变化），只把色相/透明度调暗或覆盖为点阵渐变。
- `button:active { transform: translateY(1px) }` 与 ZZZ 常用的「硬阴影 + 按压缩回」兼容，可保留。

---

## 4. 稳定注入点地图

### 4.1 `data-slot` 清单（51 个值；槽位包裹元素均 `display:contents`，rect=0，不能直接给背景）

| data-slot | 元素 / 关键类 | 说明 |
|---|---|---|
| `root` | div > body | 应用根 |
| `sidebar` | div.mP3x-q_sidebarCol / .mP3x-q_frame | 侧栏容器 280×1042 |
| `sidebar.brand.mark` | span.wtg9ga_brandMark | logo 图形 |
| `sidebar.brand.name` | span.wtg9ga_brandName | logo 文字（18px/600） |
| `sidebar.panellist` | button.wtg9ga_panelRow ×3 | 插件 / 自动化任务 / 更多 |
| `sidebar.workspaces` | div.wtg9ga_regionArea | 工作区树区域 |
| `sidebar.workspaces.directoryFlow` | div.GAkraW_sectionHeader | 「工作区」分组头 |
| `sidebar.workspaces.session.row.action` | span.wnFoaW_rowActions | 会话行 hover 操作 |
| `sidebar.session.row.leading` | span.wnFoaW_slot | 会话行前置槽（图标/状态点） |
| `sidebar.footer.action` | div.wtg9ga_footerActions | 侧栏底部动作 |
| `sidebar.settings` | div.wtg9ga_settingsArea | 设置入口区 |
| `settings.launcher` | div.AnXs9G_triggerRow | 账号/设置触发器行 |
| `main` | div.mP3x-q_centerCol | 主列 1344 |
| `main.conversation` | div | 会话主区 |
| `conversation.header` | div.an3WzG_root | 会话根（bg 在此） |
| `conversation.header.leading` | div.an3WzG_headerLeading | 顶栏左槽 |
| `conversation.session.header` | header.an3WzG_header (1344×76) | 会话顶栏 |
| `conversation.session.header.lineage` | span.an3WzG_crumbSeg | 面包屑段 |
| `conversation.session.header.actions` | div.an3WzG_headerActions | 智能体团队 / PTC 模式 |
| `conversation.session.header.utilities` | div.an3WzG_headerUtilities | 右侧工具（app 切换、toggle） |
| `conversation.session.header.corner` | div.an3WzG_headerCorner | 右上角 |
| `conversation.session` | div.an3WzG_scrollBody (1342×966) | 会话滚动体 |
| `conversation.view` | div.an3WzG_viewArea | 视图区 |
| `conversation.chat.flow` | div.V4vHZW_column (860 宽居中) | 消息流列 |
| `conversation.chat.node` | div.V4vHZW_flowItem | 每条消息/节点 |
| `conversation.user.text.node` | span（在 div.LOmM4q_bubble 内） | 用户消息文本 |
| `tool.call.toolview` | div.pDft-q_callRow | 工具卡 |
| `conversation.chat.turnTail` | div.cVfUIq_root | 回合尾（时间/复制/操作） |
| `conversation.chat.assistant-actions` | div._1KfHza_actions.cVfUIq_actions | 助手操作条 |
| `conversation.chat.user.images` | div.LOmM4q_attachmentRow | 用户附件图 |
| `conversation.composer` | div.an3WzG_composerSeat | 输入区座位 |
| `conversation.input.dock` | div.an3WzG_composerStack | dock 容器 |
| `conversation.composer.bar` | div | 输入条 |
| `conversation.input.overlay` | div.GRgSLq_overlayAnchor | 输入浮层锚点 |
| `conversation.input.attachments` | div.GRgSLq_card | 输入卡片本体（可给背景/圆角） |
| `conversation.input.permission` / `.plan` | div.GRgSLq_modes | 权限/计划 chip 组 |
| `conversation.input.left` | div.GRgSLq_tools | 左工具（+、权限） |
| `conversation.input.right` / `.model` | div.GRgSLq_standardControls | 右控制（模型、发送） |
| `conversation.input.model.label` | span | 模型名标签 |
| `conversation.input.activity` | div.GRgSLq_activity | 输入区活动/状态 |
| `conversation.composer.dock` | div.GRgSLq_dock | dock 变体 |
| `rightbar` / `rightbar.session` | div.mP3x-q_rightbarCol | 右侧栏（可折叠） |
| `shell.bottom` | div.mP3x-q_bottomRow | 底部条 |
| `shell.overlay` | div.mP3x-q_overlayLayer | **z20 门户层**：菜单/弹窗/toast 都进这里 |
| `settings.header` | div.AnXs9G_navTitle | 设置标题 |
| `settings.action` | div.AnXs9G_actions | 设置头部按钮 |
| `settings.close` | button.AnXs9G_close | 设置关闭 |
| `settings.section` | div.AnXs9G_options | 设置内容区 |
| `conversation.hero.brand.mark` | （欢迎页插件槽） | 欢迎页品牌 mark |

> 只有欢迎页出现的槽：`conversation.hero.brand.mark`。toast / 菜单没有 data-slot，走通用模块类（§5.8/5.9）。
> `settings.section` 内部才是 `section._6qcDqa_section > div._6qcDqa_card`。

### 4.2 有用 `data-*` 属性（比 hash 类名稳，且能区分状态）

- 布局/外壳：`data-shell-bottom`、`data-shell-overlay`、`data-dsh-center-col`、`data-rightbar-col`、`data-rightbar-collapsed`、`data-dsh-bottom-toggle`、`data-width-handle`、`data-window-drag`。
- 主题：`data-ds-theme-source`、`data-ds-dark-theme`、`data-fz3-theme`。
- 会话头：`data-conversation-header-leading / corner / tabs / content / region / scroll / session`。
- 消息：`data-chat-turn`（288 个）、`data-chat-node-key`、`data-chat-flow-kind`、`data-chat-call-id`、`data-tool`（工具类型）、`data-chat-group-key`、`data-chat-group-part`、`data-turn-process`、`data-step-process`、`data-turn-tail`、`data-align`（用户消息对齐）、`data-actions-reveal`、`data-message-attachments`。
- 工具卡展开：`data-state`、`data-variant`、`data-disclosure-header`、`data-disclosure-row`、`data-expandable`、`data-shimmer-decoration`（骨架/流光，慎动）。
- 输入区：`data-composer-seat/card/overlay/input/dock/placeholder/stat`、`data-input-scroll`、`data-lexical-editor`、`data-placeholder`、`data-provider-id`、`data-model-id`。
- 门户：`data-dockkit-surface/strip/pane/...`、`data-modal-autofocus`、`data-shortcut-modal`、`data-open`、`data-side`、`data-tone`。
- 宿主插件：`data-plugin` / `data-plugin-css`（177 个 style 标签）、`data-dsh-better-sidebar*`。

### 4.3 选择器优先级建议（写皮肤时按此顺序）

1. `html[data-fz3-theme='dark'] [data-slot="conversation.input.attachments"] .GRgSLq_card`（槽位 + 作用域，最稳）
2. `html[data-fz3-theme='dark'] .GRgSLq_card`（仅作用域提权）
3. `[data-slot="sidebar"] .wnFoaW_sessionRow.wnFoaW_selected`（类名会变，但状态语义明确）
4. `[data-chat-turn] .LOmM4q_bubble`（属性挂钩）
5. 纯 hash 类名（会随构建变）：`.AnXs9G_navCell.AnXs9G_active`
6. 结构伪类（最脆，不推荐做视觉主线）

> 宿主是 CSS Modules：类名形如 `名称_hash_行号`（`.wnFoaW_sessionRow`、`.GRgSLq_card`、`._6qcDqa_card`）。同一模块内 hash 稳定到该构建为止；升级 DSH 后大概率全变。**建议把 hash 类集中在皮肤段落，并写注释标明「构建相关」**。

---

## 5. 组件 atlas（浅/深 computed style 实测）

> 记号：L=浅色（`html[data-fz3-theme=light]`，body 无 data-ds-dark-theme）；D=深色。数值来自 `dsh-ui-styles-both.json`（57 选择器 ×2）与 `dsh-ui-styles-home-both.json`。
> 背景为 `rgba(...)` 的是半透明玻璃；token 名见 §6。

### 5.1 应用外壳

| 选择器 | L | D |
|---|---|---|
| `.mP3x-q_frame` | bg rgba(247,250,255,0.92)，fg rgb(21,27,47) | bg rgba(8,10,18,0.88)，fg rgb(238,240,250) |
| `.mP3x-q_sidebarCol` | bg rgba(243,247,255,0.94)，280×1042 | bg rgba(9,11,20,0.9) |
| `.mP3x-q_centerCol` | 透明，1344×1042 | 同 |
| `.mP3x-q_overlayLayer` | z-index 20，pointer-events none，门户层 | 同 |

### 5.2 侧栏（280 宽；内边距 6px 12px）

| 选择器 | L | D | 状态/备注 |
|---|---|---|---|
| `.wtg9ga_logoRow` | 透明，pad 8px 0 8px 4px，12,6 256×60 | 同 | 品牌行 |
| `.wtg9ga_brandMark` | 透明，24×18 | 同 | 图标 |
| `.wtg9ga_brandName` | 透明，fs18 fw600 ls .72px | 同 | 文字 |
| `.wtg9ga_newSession` | bg rgb(255,255,255) fg rgb(20,26,46) br12 fw500 252×38 pad 8px 12px border 1px rgba(0,0,0,.12) | bg rgb(67,69,74) fg rgb(238,240,250) border rgba(255,255,255,.16) | hover → `--dsw-alias-button-floating-hover` |
| `.wtg9ga_panelRow` | 透明 br12 252×36 pad 7px 8px，fg rgb(20,26,46) | fg rgb(238,240,250) | hover → interactive-bg-hover；focus-visible 描边 |
| `.wtg9ga_panelTitle` | fs14 | fs14 | 插件/自动化任务/更多 |
| `.GAkraW_sectionHeader/.sectionLabel` | 透明 fg rgb(129,133,140) fs14 42×20 | fg rgb(173,178,184) | 「工作区」；右侧搜索/排序图标按钮 |
| `.GAkraW_searchButton` | 透明 fg rgb(89,100,138) br8 28×28 | fg rgb(139,147,184) | hover → interactive-bg-hover |
| `.wnFoaW_projectRow` | 透明 br12 252×34 pad 0 8px | 同 | 工作区行（tmp 等） |
| `.wnFoaW_sessionRow` | 透明 br12 252×32 pad 0 8px fs14 | 同 | hover → interactive-bg-hover |
| `.wnFoaW_sessionRow.wnFoaW_selected` | bg rgba(38,49,72,0.06) br12 | bg rgba(255,255,255,0.08) | **当前会话；hover 与 selected 同 token** |
| `.wnFoaW_title` | fs14 fg rgb(20,26,46) | fg rgb(238,240,250) | 会话标题 |
| `.wnFoaW_time` | fs10 fg rgb(129,133,140) | fs10 fg rgb(173,178,184) | hover 时隐藏、显示 rowActions |
| `._5Qcc8a_trigger` | 透明 br12 260×44 fs14，y988 | 同 | 账号触发器；hover → interactive-bg-hover |
| `._5Qcc8a_label` | fs14，默认昵称 | fs14 | 头像 24×24 br50% |
| `._5Qcc8a_avatar / .zSpNNG_image` | br50% | 同 | |

### 5.3 顶栏 / 标签页（主列 1344；header 高 76）

| 选择器 | L | D | 备注 |
|---|---|---|---|
| `.an3WzG_header` | 透明，pad 10px 28px 0 20px，1344×76 | 同 | 背景继承 root |
| `.an3WzG_titleRow / .titleCluster` | flex | 同 | 面包屑 + 动作 |
| `.an3WzG_crumb`（button） | 透明 br12 fs14 fw500 128×28 | 同 | hover → interactive-bg-hover |
| `.an3WzG_tab` | 透明 fs13 fw500 fg rgb(65,118,230)（激活） | fg rgb(122,170,255) | 激活态 `::after` 2px 下划线 `--dsw-alias-state-business-primary`；非激活 fg rgb(129,133,140) |
| `.VBK9GG_trigger`（智能体团队） | 透明 br6 fs12 93×28 | 同 | |
| `.rezYhW_trigger`（PTC 模式） | 透明 br8 fs12 92×28 | 同 | |
| `.mOxcpG_main/.mOxcpG_split` | fg 继承 fs11 23×22 | 同 | app 切换/分隔 |
| `.nArs4W_toggleButton` | 透明 br50% 28×28 | 同 | 右栏开关 |

### 5.4 欢迎页（hero）

DOM：`div.WOwLGG_root > div.WOwLGG_stack > div.WOwLGG_headline > span.WOwLGG_titleGroup`（标题「空洞深潜系统」+ 内嵌 `span` 产物 "H.D.D Ⅲ" 胶囊）；工作区行 `div.an3WzG_heroWorkspaceRow > button.WOwLGG_workspace > span.WOwLGG_workspaceLabel`（tmp、PTC 模式）；下方 `div.an3WzG_composerSeat > .an3WzG_composerStack.an3WzG_composerHero > div.GRgSLq_root.GRgSLq_hero`。
- 欢迎 hero 的视觉（大标题/开场氛围/点阵）是插件自己画的，宿主部分主要是 composer card + workspace chips；**ZZZ 皮肤应只做「外壳 + 输入卡」，不要重画 hero 标题**（技能规范：不要和 Fairy 蓝欢迎视觉打架）。
- 截图里可见：浅色 hero 标题深墨色、右侧「H.D.D Ⅲ」浅蓝胶囊、输入卡白底 br28；深色反之。

### 5.5 输入卡（composer）

DOM：`div.an3WzG_composerSeat (280,914 1333×128) > [data-slot=conversation.input.dock] > div.an3WzG_composerStack > div.GRgSLq_root (pad 0 16px 4px) > div.GRgSLq_card > div.GRgSLq_scroll > div.GRgSLq_grow > div.GRgSLq_placeholder`；底行 `div.GRgSLq_row > .GRgSLq_tools + .GRgSLq_standardControls`。

| 选择器 | L | D |
|---|---|---|
| `.GRgSLq_root` | 透明 pad 0 16px 4px，1333×128 | 同 |
| `.GRgSLq_card` | bg rgb(255,255,255) **br28** 892×98 at (500,914) | bg rgb(44,44,46)，boxShadow rgba(58,68,140,.32) 0 0 0 .5px |
| `.GRgSLq_input` | 透明 fs14 h36 | 同 |
| `.GRgSLq_placeholder` | fg rgb(173,178,184) fs14 | fg rgb(129,133,140) |
| `.GRgSLq_add`（+ 按钮） | bg rgb(245,246,247) br999 28×28 | bg rgb(53,54,56) |
| `.GRgSLq_primary`（发送） | bg rgb(65,118,230) fg #fff br999 **34×34** | bg rgb(122,170,255) |
| `._86kJGG_trigger`（权限） | fg rgb(89,100,138) br8 fs13 fw500，「工作区内修改」 | fg rgb(139,147,184) |
| `._9r0rkG_trigger`（模型） | 同上 fg，fs13，「DeepSeek-V4.1-Flash」+ `_2Cxzxa_label` | 同 |
| `.hNGZaa_pill`（上下文 %） | fg rgb(129,133,140) br8 fs12，如「1017」「Max」 | fg rgb(173,178,184) |

hover：`.GRgSLq_add:hover` → interactive-bg-hover-solid；`.GRgSLq_primary:hover` → `--dsw-alias-button-info-hover`；`.GRgSLq_select:hover` → interactive-bg-hover。
> 注意发送键用的是 **'--dsw-alias-button-info-fill'（蓝）**，不是 brand-primary；ZZZ 皮肤把它改成荧光黄绿即可得到「发送=强调色」且不动 Fairy 品牌蓝。

### 5.6 会话消息（气泡 / 工具卡 / 思考 / 尾行 / badge）

| 选择器 | L | D | 备注 |
|---|---|---|---|
| `.V4vHZW_scroll` | pad 16px 32px，1333 宽 | 同 | 滚动体 |
| `.V4vHZW_column` | 860 宽居中（x516–1376） | 同 | 消息列 |
| `.LOmM4q_userRow > .LOmM4q_userStack > .LOmM4q_bubble` | bg rgba(255,255,255,0.96) fg rgb(20,26,46) **br20** fs14 pad 10px 16px | bg rgba(22,26,42,0.92) fg rgb(238,240,250) | 用户消息；`[data-align]` 控制方向 |
| `.n-Yh7q_frame`（附件图） | bg rgba(38,49,72,.06) br20 border 1px rgba(0,0,0,.1) | bg rgba(255,255,255,.08) border rgba(255,255,255,.06) | |
| `.BE0jCW_root > .BE0jCW_body > .BE0jCW_content` | 透明容器 | 同 | 助手回合 |
| `.pDft-q_callRow` | 透明 br8 860×24 fs16 | 同 | 工具卡行；`[data-tool]` 区分类型 |
| `.hKdVjq_root/_header/_row/hKdVjq_title` | fg rgb(129,133,140) fs13 | fg rgb(173,178,184) | 工具标题/摘要；`_summarySuffix`（1KB）`_errorSummary`（error 色）`_fileLink`（可点，13px muted） |
| `.VJlF5q_root/.row/.title/.summary`（思考行） | title/summary fg rgb(129,133,140) fs13；`_leading` 16×16；`_separator` 2×2 圆点 | fg rgb(173,178,184) | 可折叠 |
| `.hE4tRW_root/.label`（「已完成，用时…」） | 透明按钮 860×33，fg rgb(129,133,140) fs14 | fg rgb(173,178,184) | |
| `.cVfUIq_root`（turnTail） | 627×32 | 同 | 时间/操作 |
| `.cVfUIq_actions / ._1KfHza_actions/_action/_timeStart/_endInfo` | fs12/fs13 muted，动作按钮 28×28 br8 | 同 | 复制/重试等 |
| `.BI5uFG_trigger` | fs12 fg rgb(129,133,140) br8 pad 6px 8px | 同 | |
| `.jy423G_badge / ._tag_brmue_4` | bg rgb(245,246,247) fg rgb(89,100,138) **br999** fs11 fw500 pad 1px 8px 65×19 | bg rgb(53,54,56) fg rgb(139,147,184) | 标签（1017、角色等）；`.jy423G_dot` 4×4 br50% error 色 |
| `._markdown_1ypvv_5` | fg rgb(20,26,46) fs14，860 宽 | fg rgb(238,240,250) | 正文；链接 `._fileLink_1ypvv_59` / `._fileMention_1ypvv_85` 用 `--dsw-alias-link`（浅 rgb(65,118,230) / 深 rgb(122,170,255)） |
| `.md-code-block`（宿主通用） | 用 `--dsw-alias-markdown-code-block` token（浅 rgba(238,243,255,.96) / 深 rgba(8,9,20,.94)） | | 代码块；banner 用 `...-banner` |

### 5.7 设置弹窗

DOM：`div.AnXs9G_overlay > div.AnXs9G_mask + div.AnXs9G_panel`（800×800 @412,121）→ 左 `nav.AnXs9G_nav`（188）+ 右 `div.AnXs9G_content`（612）→ `[data-slot="settings.section"] > section._6qcDqa_section > div._6qcDqa_card/_balanceCard`。

| 选择器 | L | D |
|---|---|---|
| `.AnXs9G_mask` | rgba(0,0,0,0.24) | rgba(0,0,0,0.5) |
| `.AnXs9G_panel` | bg rgba(255,255,255,0.97) br28，shadow 三层 | bg rgba(15,19,32,0.95)，border .5px rgba(255,255,255,.2) |
| `.AnXs9G_nav` | 188×800 pad 22px 12px 0 | 同 |
| `.AnXs9G_navTitle` | fs16 fw500 pad 0 12px 164×24 | 同 |
| `.AnXs9G_navCell` | 164×40 br12 fs14 pad 9px 16px 9px 12px，透明 | 同 |
| `.AnXs9G_navCell.AnXs9G_active` | bg rgb(235,238,242) fg rgb(20,26,46) | bg rgb(67,69,74) fg rgb(238,240,250) |
| `.AnXs9G_navCell:hover` | → `--dsw-specific-sidebar-nav-item-hover` | 同 |
| `.AnXs9G_content` | 612×800 | 同 |
| `.AnXs9G_header` | 612×54 pad 20px 14px 8px 10px | 同 |
| `._outline_1rv3m_54`（打开配置文件） | fg rgb(20,26,46) br8 fs12 94×28 border 1px rgba(0,0,0,.12) | fg rgb(238,240,250) border rgba(255,255,255,.16) |
| `.AnXs9G_close` | 28×28 br8 | 同 |
| `.AnXs9G_options` | 612×746 pad 0 24px 24px | 同 |
| `._6qcDqa_card/_balanceCard` | bg rgba(255,255,255,.97) fg rgb(20,26,46) br20 pad 12px 16px border 1px rgba(0,0,0,.16) | bg rgba(15,19,32,.95) fg rgb(238,240,250) border rgba(255,255,255,.2) |
| `._6qcDqa_amount` | fs18 fw510（¥12.71） | 同 |
| `._6qcDqa_linkButton` | 86×36 br12 fs14 pad 0 14px border | 同 |
| `._6qcDqa_linkButton._6qcDqa_primary`（充值） | bg rgb(47,85,232) fg #fff | bg rgb(63,107,255) fg rgb(15,17,21) |

> 设置 nav 项：账号与余额 / 通用设置 / 模型 / 内置插件 / Agent 预设 / Fairy / bili设置 / 侧边卡片。

### 5.8 账号下拉菜单（门户层 `.mP3x-q_overlayLayer`）

- 面板：`_surface_ri079_1 _list_4ub78_7 _scrollable_4ub78_19 _portal_4ub78_41`，位于触发器上方（y874 h110）。
- 项：`._item_4ub78_90`（内 `._itemWrap_4ub78_90 > ._viewport_4ub78_19`），label `._itemLabel_4ub78_190`，图标 `._itemIcon_4ub78_148`，快捷键 `._shortcut_4ub78_198/. _shortcutKeys_4ub78_203`，选中 `._selected_4ub78_216/. _selectedFill_4ub78_221`，危险 `._danger_4ub78_226`，分隔 `._separator_4ub78_80`，分组 `._group_121p8_1 / ._heading_121p8_19`。
- 菜单项样式：`._menuItem_6nhg2_561 { padding:4px 7px; color: var(--dsw-alias-label-primary); font-size: calc(var(--dsh-content-font-size-secondary,13px) - 1px); border-radius: var(--dsw-radius-md); }`，hover → interactive-bg-hover；菜单容器 `._menu_6nhg2_547`：fixed z70，padding 4px，border .5px `--dsw-alias-border-l2`，背景由 `--dsw-menu-surface-fill` + `--dsw-menu-backdrop-filter: blur(40px) saturate(150%)` 提供。
- 账号菜单 3 项：设置（Ctrl+Alt+,）/ 意见反馈 / 退出登录。

### 5.9 通用基础组件（宿主 index CSS，跨页面复用）

| 选择器 | 要点 |
|---|---|
| `._toast_l6cvn_6` | 背景 `--dsw-alias-toast-bg`（浅 #353638 / 深 #43454a），文字 `--dsw-alias-toast-label`；自带 1s fade @keyframes（`_dsh-toast-fade_l6cvn_1`） |
| `._tooltip_38b9q_20` | fs11 lh14，背景 `--dsw-alias-tooltip-bg`（浅 #2c2c2e / 深 #43454a），keycap `._key_38b9q_1` 16×16 br4 `--dsw-alias-tooltip-key-bg` |
| `._dialog_o6lrb_33` | width min(380px,100%)，br `--dsw-radius-panel`（28），bg `--dsw-alias-bg-layer-2`，shadow `--dsw-elevation-prominent` |
| `._bubble_44yfq_1` | 浮层气泡，`[data-side]/[data-align]` 定位，portal z1100 |
| `._switch_1ik0f_5` | 36×20 br999 bg border-l3；选中 bg brand-primary；thumb `_thumb_1ik0f_33` |
| `._input_14sgc_25` | 透明 input，fs14 lh22，color label-primary，placeholder label-dimmed |
| `._button_1rv3m_2` + 变体 | `_primary_1rv3m_36` / `_outline_1rv3m_54` / `_ghost_1rv3m_45` / `_sm_1rv3m_28`；28×28 br8 fs12（小尺寸） |
| `._key_38b9q_1` / `_separator_38b9q_30` | 快捷键帽 / 分隔符 |
| `._card_38jqx_9`、`._pill_1bqmh_1`、`._segmented/_tabs_1p79o_1` | 卡片/胶囊/分段控件 |

### 5.10 字号/字重规格速查（token）

- 正文字号 token：`--dsw-font-xxxs-11`（11/14）、`xxs-12`（12/18）、`xs-13`（13/20）、`s-14`（14/22）、`base-16`（16/24）、`l-20`（20/28 fw500）、`xl-24`（24/32 fw600）、`m-18`（16/28 fw500）。
- Markdown：base 14/24、code 12/19、code-block 11/19、small 12/20、h1 21/30 fw700、h2 19/28 fw700、h3 18/26 fw700、h4 14/24 fw600。
- 宿主界面实际用法：侧栏会话 14、时间 10、分组标签 14（灰）、tab 13、crumb 14、正文 14、工具摘要 13、badge 11、设置 nav 14、标题 16。
- `--dsh-content-font-size: 14px`（可被插件/皮肤改，body 内联 14px）、`--dsh-code-font-size: 11px`、`--dsh-content-font-size-secondary: 13px`。
- 字体：`--dsw-font-family` = -apple-system / BlinkMacSystemFont / Segoe UI / PingFang SC / Microsoft YaHei…；插件 body `font-family: var(--fz3-font) !important` = Bahnschrift / DIN Alternate / HarmonyOS Sans SC…；代码 `--dsw-font-family-code` = SF Mono/JetBrains Mono/Fira Code/Consolas。

---

## 6. 可覆盖 token 清单（皮肤真正要动的 ~25 个）

> 完整 418 个见 `shots/dsh-ui-tokens.json`（键为 token 名，值 `{light,dark}`）。以下按用途分组，括号内为宿主当前 L | D 值。

**背景/面板**
- `--dsw-alias-bg-base`（rgba(247,250,255,.92) | rgba(8,10,18,.88)）— 应用底
- `--dsw-alias-bg-layer-1`（#ffffff/0.94 | rgba(11,14,24,.92)）
- `--dsw-alias-bg-layer-2`（#ffffff/0.97 | rgba(15,19,32,.95)）— 菜单/弹窗底
- `--dsw-alias-bg-overlay`（rgba(255,255,255,.99) | rgba(4,5,12,.98)）
- `--dsw-specific-sidebar-fill`（rgba(243,247,255,.94) | rgba(9,11,20,.9)）
- `--dsw-specific-bubble`（rgba(255,255,255,.96) | rgba(22,26,42,.92)）
- `--dsw-alias-markdown-code-block`（rgba(238,243,255,.96) | rgba(8,9,20,.94)）
- `--dsw-alias-settings-card-fill` / `--dsw-alias-settings-card-stroke`
- `--dsw-alias-bg-mask-1` / `bg-mask-2`（遮罩）

**文字**
- `--dsw-alias-label-primary`（#141a2e | #eef0fa）
- `--dsw-alias-label-secondary`（#59648a | #8b93b8）
- `--dsw-alias-label-tertiary`（#81858c | #adb2b8）
- `--dsw-alias-label-dimmed`（placeholder）
- `--dsw-alias-label-primary-foreground`（#fff，强调色底上的字）

**边界/线**
- `--dsw-alias-border-l1`（rgba(60,90,220,.18) | rgba(120,110,255,.22)）
- `--dsw-alias-border-l2`（rgba(120,140,200,.32) | rgba(58,68,140,.32)）— 菜单/卡片描边
- `--dsw-alias-border-l3`（#0000001f | #ffffff29）

**强调/状态**（ZZZ 皮肤核心）
- `--dsw-alias-button-info-fill`（#4176e6 | #7aaaff）→ 发送按钮/主 CTA
- `--dsw-alias-button-info-hover`（#7aaaff | #4176e6）
- `--dsw-alias-state-business-primary`（#4176e6 | #7aaaff）→ tab 下划线、focus ring 兜底、链接
- `--dsw-alias-link`（#4176e6 | #7aaaff）
- `--dsw-alias-interactive-bg-hover`（#2631480f | #ffffff14）→ 所有行 hover
- `--dsw-alias-interactive-bg-active`（#2631481a | #ffffff24）
- `--dsw-alias-interactive-bg-hover-solid`（#f1f3f5 | #353638）
- `--dsw-specific-sidebar-nav-item-hover`（#f1f3f5 | #2c2c2e）
- `--dsw-specific-sidebar-nav-item-active`（#ebeef2 | #43454a）
- `--dsw-specific-sidebar-nav-item-active-accent`（#e4edfd | #353638）
- `--dsw-alias-button-floating-fill` / `-hover`（「新会话」按钮）
- `--dsw-alias-toast-bg` / `--dsw-alias-tooltip-bg`

**圆角/阴影/字体**
- `--dsw-radius-panel`（28px）→ 设置弹窗、输入卡；ZZZ 建议 16–18px
- `--dsw-radius-md`（12）/`--dsw-radius-lg`（16）/`--dsw-radius-xl`（20）/`--dsw-radius-sm`（8）/`--dsw-radius-xs`（4）
- `--dsw-elevation-prominent` / `soft` / `panel`（阴影）
- `--dsw-font-family`、`--dsw-font-family-code`、`--dsh-content-font-size`
- `--dsw-menu-surface-fill`、`--dsw-menu-backdrop-filter`（blur(40px)，**不要新增 blur**）

**不要动**：`--dsw-alias-brand-primary`（#2f55e8 | #3f6bff）— 保留 Fairy 品牌蓝；`--dsw-menu-backdrop-filter` 的 blur 值（性能预算）。

---

## 7. 插件挂载分析（dsh-fairy-zzz v1.6.2）

### 7.1 宿主半 `index.js`（42,779 B）

- `export const name = 'fairy-zzz'`；`export const inject = ['webServer']`。
- 只做 webServer 路由：`GET /fairy-zzz/assets/<file>`（开场视频 boot-opt.mp4、poster、hero.webp、icon、问候语音）、`GET /fairy-zzz/audio/<hash>.wav`、`POST /fairy-zzz/tts`、`GET /fairy-zzz/mood`（idle|thinking|working|done）、`voice-home`、`engine`、`health`、`usage`；对接本地 GPT-SoVITS `127.0.0.1:9800`。
- `cordis.patch.yml`（262 B）：`- insert: - id: fairy-zzz-skin / name: 'dsh-fairy-zzz'` —— 只插「皮肤」条目；Fairy agent preset 默认不启用。
- `package.json`：v1.6.2，`type: module`，`exports ./index.js ./client.js ./icon`，`dsh.bundle.patch: ./cordis.patch.yml`，`dsh.client: { platform: 'web', immediately: true, inject: [] }`。

### 7.2 客户端半 `client.js`（约 163 KB）关键行

| 行 | 内容 |
|---|---|
| `3195` 附近 | `export default { inject: ['slots','locale','theme','remote','remote.account'], apply(ctx) {…} }` |
| `3219–3238` | **样式注入守卫**：`tagId = PKG + '/fairy-zzz.css'`；`document.querySelector('style[data-plugin-css="dsh-fairy-zzz/fairy-zzz.css"]')`；已存在则只替换 `textContent`，否则创建 `<style data-plugin=PKG data-plugin-css=tagId>` 并 append 到 `document.head`；`ctx.effect` 负责卸载时移除标签 |
| `3240–3243` | `const theme = ctx.get('theme'); theme.overrideTokens(PKG, TOKENS)` — **官方 token 注入 API** |
| `3245–3308` | **深浅色跟随**：`probeLight()` 先读 `theme.getTheme().active.id` 正则（/light|snow|day/ vs /dark|night|midnight/），否则读 `--dsw-alias-bg-base` 亮度 >140，否则 `matchMedia('(prefers-color-scheme: light)')`；`apply()` 设 `document.documentElement.dataset.fz3Theme = 'light'|'dark'`；debounce 260ms；监听 media change + MutationObserver(`html` 的 style/class/data-theme/data-color-scheme) + `ctx.on('theme/change')` |
| `3310–3318` | 挂载 helper：`ctx.slots.inject(key, () => ctx.slots.register({ name:key, ...spec }, component))` |
| `3320–3326` | 7 个槽位注册：`sidebar.brand.mark`、`sidebar.brand.name`、`conversation.hero.brand.mark`、`shell.overlay`（FairySkin order24）、`shell.overlay`（Atmos order12）、`conversation.chat.assistant-actions`（朗读，order20）、`settings.section`（Fairy 设置，order40） |
| `568–606` | `TOKENS` map：16 个 `--dsw-*`，每项 `{ light, dark }`（light 缺失时回退 base/dark） |
| `611–1099` | **CSS 模板字符串**（约 489 行）：`:root { --fz3-cyan:#8fb4ff; --fz3-amber:#ffc93c; --fz3-text:#e8f3ff; --fz3-font:…; --fz3-dock-x/y/size; --fz3-eye… }` + 全局 element 规则 + `html[data-fz3-theme='light']` 覆盖段（约 1009–1099） |

### 7.3 结论：挂载方式与统一注入点

- 像素全部来自 **React 组件 + 单个全局 `<style>` 文本 + body 内联 token**，不是 CSS 文件、不走 Shadow DOM、没有 CSS 变量主题文件。
- 现有 CSS **没有任何宿主 hash 类名选择器**（全部 `.fz3-*` 与元素选择器），也没有「宿主 UI 皮肤层」段。
- **统一注入点存在且只有一个**：CSS 模板字符串末尾（同一 style 标签、无 FOUC、无额外 DOM、卸载时随标签清理）。皮肤层作为该字符串最后一段：
  - 选择器用 `html[data-fz3-theme='dark'] …` / `html[data-fz3-theme='light'] …` scope（同时提权 + 双主题）；
  - token 重映射优先扩展 `TOKENS` map（line 568–606，走 `theme.overrideTokens`），或退而在 `.mP3x-q_frame` 上声明 token（无需 !important）。
- 若不愿改 `TOKENS`（比如想把 ZZZ 与 Fairy 主题解耦），在皮肤段顶部用 `html[data-fz3-theme='dark'] .mP3x-q_frame { --dsw-alias-…: …; }` 也能覆盖到整个应用子树（含 `.mP3x-q_overlayLayer` 内的菜单/弹窗）。唯一例外是**挂在 body 下、不在 frame 内的门户**（需实测 toast；当前 toast/菜单/弹窗都进 overlayLayer，frame 内）。

---

## 8. 推荐皮肤注入方案

### 8.1 分层（从便宜到贵，按需取用）

| 层 | 手段 | 覆盖效果 | 风险 |
|---|---|---|---|
| L1 token 重映射 | 扩 `TOKENS` map / scope 到 `.mP3x-q_frame` | ~80%：背景、文字、hover/selected/focus、菜单、弹窗、输入卡、发送键颜色、圆角 | 低；不改结构、不改布局 |
| L2 组件轮廓 | 皮肤段 10–15 条规则：胶囊行、999px、点阵/斜纹底纹、分组标签 mono、面板硬边描边 | ~15%：ZZZ 辨识度 | 中；选择器依赖 hash/data-slot |
| L3 装饰层 | 侧栏角标「// SECTION」、输入卡左上角三角、卡片右上角序号、硬阴影偏移 | ~5%：氛围 | 低；纯伪元素，不占布局 |

### 8.2 token 映射建议（ZZZ ⇄ 宿主）

| ZZZ 语义 | 建议值（暗 / 亮） | 宿主 token |
|---|---|---|
| 强调 | #d8ff3e / #4f6b00 | `--dsw-alias-button-info-fill`、`--dsw-alias-state-business-primary`、`--dsw-alias-link` |
| 强调 hover | #e6ff70 / #3e5400 | `--dsw-alias-button-info-hover` |
| 黑玻璃面板 | rgba(12,14,10,.94) / rgba(247,247,242,.96) | `--dsw-alias-bg-base`、`--dsw-specific-sidebar-fill` |
| 面板 2 层 | rgba(18,20,16,.96) / rgba(255,255,252,.98) | `--dsw-alias-bg-layer-1`、`bg-layer-2` |
| 气泡 | rgba(16,18,13,.92) / rgba(255,255,252,.96) | `--dsw-specific-bubble` |
| 主文字 | #f2f2ee / #14160f | `--dsw-alias-label-primary` |
| 次文字 | rgba(242,242,238,.58) / rgba(20,22,15,.56) | `--dsw-alias-label-secondary` |
| 弱文字 | rgba(242,242,238,.34) / rgba(20,22,15,.38) | `--dsw-alias-label-tertiary`、`--dsw-alias-label-dimmed` |
| 线 | rgba(216,255,62,.22) / rgba(40,50,10,.24) | `--dsw-alias-border-l1`、`border-l2` |
| hover | rgba(216,255,62,.10) / rgba(20,22,15,.06) | `--dsw-alias-interactive-bg-hover` |
| 选中行 | rgba(216,255,62,.14) + inset 2px 强调 | `--dsw-specific-sidebar-nav-item-active`、`-active-accent` |
| 代码块 | rgba(8,9,6,.94) / rgba(240,242,234,.98) | `--dsw-alias-markdown-code-block` |
| 圆角 | 面板 16–18px，胶囊 999 | `--dsw-radius-panel`（28→16px） |
| 强调色底上的字 | #0a0b08 | `--dsw-alias-label-primary-foreground` |

> 新会话按钮（`--dsw-alias-button-floating-fill`）适合直接做成「荧光黄绿胶囊 + 黑字 + 1px 黑描边 + 3px 硬阴影」。
> 发送键（`button-info-fill`）改成强调色后箭头自动继承 `label-primary-foreground`（当前 #fff；暗底强调色上应改 #0a0b08）。

### 8.3 可直接抄用的组件规则（骨架）

```css
/* ===== ZZZ skin layer (append inside plugin CSS template, after existing rules) ===== */
html[data-fz3-theme='dark'] {
  --zzz-accent: #d8ff3e;
  --zzz-ink: #0a0b08;
  --zzz-paper: #f2f2ee;
  --zzz-line: rgba(216, 255, 62, .22);
  --zzz-glass: rgba(12, 14, 10, .94);
  --zzz-mono: 'JetBrains Mono', 'Cascadia Mono', Consolas, monospace;
}
html[data-fz3-theme='light'] {
  --zzz-accent: #4f6b00;
  --zzz-ink: #14160f;
  --zzz-paper: #f2f2ee;
  --zzz-line: rgba(40, 50, 10, .24);
  --zzz-glass: rgba(247, 247, 242, .96);
}

/* L1: token remap scoped on the app frame (inherits into sidebar/main/overlays) */
html[data-fz3-theme='dark'] .mP3x-q_frame,
html[data-fz3-theme='light'] .mP3x-q_frame { /* 两套用同一批变量，值由主题里的 --zzz-* 决定 */ }

/* L2: 侧栏 —— 黑玻璃 + 点阵纹理（静态 repeating-linear-gradient，不用 blur） */
html[data-fz3-theme='dark'] .mP3x-q_sidebarCol {
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px),
    var(--zzz-glass);
  border-right: 1px solid rgba(216,255,62,.10);
}
/* 导航行 / 会话行 → 999px 胶囊（ZZZ HUD 语言） */
html[data-fz3-theme='dark'] .wtg9ga_newSession {
  border-radius: 999px;
  border: 1px solid var(--zzz-accent);
  background: var(--zzz-accent);
  color: var(--zzz-ink);
  font-weight: 700;
  box-shadow: 3px 3px 0 rgba(0,0,0,.55);
}
html[data-fz3-theme='dark'] .wnFoaW_projectRow,
html[data-fz3-theme='dark'] .wnFoaW_sessionRow,
html[data-fz3-theme='dark'] .wtg9ga_panelRow { border-radius: 999px; }
html[data-fz3-theme='dark'] .wnFoaW_selected {
  border-radius: 999px;
  background: rgba(216,255,62,.14);
  box-shadow: inset 2px 0 0 var(--zzz-accent);   /* 左侧强调条，不新增元素 */
}
/* 分组标签 → // MONO 小标（10–11px, .08em；中文不做 uppercase） */
html[data-fz3-theme='dark'] .GAkraW_sectionLabel {
  font: 700 10px/20px var(--zzz-mono);
  letter-spacing: .14em;
  color: rgba(242,242,238,.34);
}
html[data-fz3-theme='dark'] .GAkraW_sectionLabel::before {
  content: '// '; color: var(--zzz-accent); letter-spacing: 0;
}
/* 输入卡 → 硬边面板 + 角标；圆角 16–18px 与 999 混用 */
html[data-fz3-theme='dark'] [data-slot='conversation.input.attachments'] .GRgSLq_card {
  border-radius: 18px;
  border: 1px solid rgba(216,255,62,.28);
  box-shadow: 3px 3px 0 rgba(0,0,0,.45);
  background: var(--zzz-glass);
}
html[data-fz3-theme='dark'] [data-slot='conversation.input.attachments'] .GRgSLq_card::after {
  content: 'INPUT';
  position: absolute; right: 12px; top: -9px; padding: 0 6px;
  font: 700 9px/14px var(--zzz-mono); letter-spacing: .12em;
  color: var(--zzz-ink); background: var(--zzz-accent);
  border-radius: 2px;
}
/* 发送键 = 强调色胶囊，暗字 */
html[data-fz3-theme='dark'] .GRgSLq_primary {
  background: var(--zzz-accent); color: var(--zzz-ink); border-radius: 999px;
}
/* 设置弹窗 → 硬边 + 8px 网格质感；mask 加深 */
html[data-fz3-theme='dark'] .AnXs9G_panel {
  border-radius: 18px;
  border: 1px solid rgba(216,255,62,.18);
  background: rgba(14,16,12,.97);
}
html[data-fz3-theme='dark'] .AnXs9G_navCell { border-radius: 999px; }
html[data-fz3-theme='dark'] .AnXs9G_navCell.AnXs9G_active {
  background: rgba(216,255,62,.14);
  box-shadow: inset 2px 0 0 var(--zzz-accent);
}
```

> 注意：`.GRgSLq_card::after` 需要 `.GRgSLq_card { position: relative }`；当前它是 static，加 `position: relative` 不改变布局。类似角标一律用 `::before/::after`，不新增 DOM。

### 8.4 状态层策略（hover / selected / focus / disabled）

- 宿主 44 条状态规则几乎全部走 token（`--dsw-alias-interactive-bg-hover` 等，见 `dsh-ui-styles-both.json.hoverRules`），**改 token 即可免费拿到全部状态**。
- 需要「ZZZ 式」状态时守恒：hover 用 10% 强调色淡底；selected 用 14% 淡底 + inset 2px 强调条；focus-visible 用强调色 2px 描边（宿主已在用 `--dsw-focus-ring-color` 兜底 `--dsw-alias-state-business-primary`，改后者即可）。
- disabled 状态宿主用 opacity .5 或 label-dimmed，不要额外加动画。

---

## 9. 信息架构（做映射时对照）

- **App shell**：侧栏 280（`mP3x-q_sidebarCol`）+ 主列 1344（`mP3x-q_centerCol`）；右栏可折叠（`mP3x-q_rightbarCol`，data-rightbar-collapsed）；底部条 `mP3x-q_bottomRow`；门户层 `mP3x-q_overlayLayer` z20。
- **侧栏自上而下**：品牌行（mark+name，60 高）→ 新会话按钮 38 → 面板导航 3 行 ×36（插件/自动化任务/更多）→ 工作区分组头 20（label + 搜索/排序/新建）→ 工作区树（项目行 34、会话行 32、分组「未分组」）→ 底部设置区/账号触发器 44（y988）→ footer 动作。
- **主列**：会话顶栏 76（面包屑 28 + headerActions + headerUtilities + corner）→ 视图 tabs 25（对话/轨迹/上下文 + more）→ 会话滚动体 966 → 输入 seat 128（卡片 892×98–100）→ 底部 stats 行（`hNGZaa_pill`：轮次/耗时/tokens/缓存%/上下文%）。
- **欢迎页**：hero 标题 + H.D.D Ⅲ 胶囊 → workspace chips（tmp / PTC 模式）→ 输入卡（同上）→ 无消息流。
- **设置**：overlay → mask + panel 800×800；左 nav 188 固定；右 content 612（header 54 + options）。

---

## 10. 风险清单（按严重度）

1. **hash 类名随构建漂移**（高）：宿主 477 个类 token 中 361 个含数字 hash；`_6qcDqa_card`、`.wnFoaW_sessionRow` 等在 DSH 升级后会变。缓解：优先 `data-slot` / `data-*`；hash 选择器集中在一个段落并注释；升级后跑一遍截图回归。
2. **CSS 顺序劣势**（高）：插件 style #22 早于宿主模块样式（#24+）。缓解：所有皮肤规则加 `html[data-fz3-theme=…]` scope（特异性≥0,2,1）；必要时 `!important`（与插件现有 !important 一致）。
3. **body 内联 token**（中）：16 个 token 内联在 body；想改它们必须走 `theme.overrideTokens` 或改 `TOKENS` map；在 CSS 里对 body 写普通覆盖无效。把 token 声明在 `.mP3x-q_frame` 上可绕开（后代继承）。
4. **插件全局 !important**（中）：`html,body` 背景、body 字体、`textarea:focus` 光晕、`:focus-visible` outline、`pre,code` 字体均带 `!important`；皮肤若改这些需同等 `!important`，否则会拼出两种风格。
5. **门户归属**（中）：菜单/设置/toast 目前都在 `.mP3x-q_overlayLayer`（frame 内）。若某类 toast 挂 body 下，frame 上声明的 token 覆盖不到，需要给对应 portal 根加 token 或额外 selector；改动后务必点一次设置/菜单/看 toast 验证。
6. **开场 overlay `.fz3-layer`（z 9000）**（中）：全屏、pointer-events none，boot 阶段存在。皮肤不要动它的 z-index/fixed 数量；皮肤层应位于其下。
7. **性能预算**（高约束）：当前 keyframes 11、`blur()` 6、`position: fixed` 10，**不新增**；禁止新增 `will-change`/`backdrop-filter`；装饰只用静态渐变/伪元素；过渡统一 120–160ms，只作用 color/background-color/border-color/box-shadow。
8. **设计约束**：强调色占比 <5%；浅色主题用暖纸白；不要覆盖 `--dsw-alias-brand-primary`；不要重画 Fairy 蓝欢迎 hero/开场（技能规范 + 产品识别）；中文标签不做 letter-spacing/uppercase 的「伪英文」处理。

---

## 11. 验证 checklist（改完自测）

1. `html.dataset.fz3Theme` 在 light/dark 下都切换正常（系统主题切换 + 插件设置里切换各一次）。
2. 截图 6 态回归：home L/D、settings L/D、conversation L/D（1624×1042，隐藏 fz3）。
3. 点开账号菜单、模型菜单、设置弹窗、触发一次 toast：确认门户 token 生效、无「半蓝半黄」。
4. `getComputedStyle` 抽查：`.wnFoaW_selected`、`.GRgSLq_primary`、`.AnXs9G_navCell.active`、`.LOmM4q_bubble` 在 L/D 下均为预期色。
5. 性能：DevTools Performance 录一次启动 + 会话滚动，确认无新增 long task；`document.styleSheets` 中 keyframes 数仍为 11、含 blur 的规则仍为 6、`position:fixed` 仍为 10。
6. 对比度：主文字/背景 ≥ 7:1（暗 #f2f2ee on rgba(12,14,10,.94)）；强调色上的暗字 ≥ 7:1。
