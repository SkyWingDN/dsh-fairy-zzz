window.__ModuleLoader__.load({
  id: 'dsh-fairy-zzz',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useLayoutEffect, useRef, useState } = React

    const NS = 'fairy-zzz'
    const PKG = 'dsh-fairy-zzz'
    const VOICE_KEY = 'fairy.zzz.voice'
    const SEEN_KEY = 'fairy.zzz.seen'
    const greetSlot = () => {
      const hh = new Date().getHours()
      if (hh >= 5 && hh < 11) return 'morning'
      if (hh >= 11 && hh < 14) return 'noon'
      if (hh >= 14 && hh < 18) return 'afternoon'
      if (hh >= 18 && hh < 23) return 'evening'
      return 'night'
    }
    const GREETING = () => '/fairy-zzz/assets/voice/greet-' + greetSlot() + '.mp3'

    /* 眼标拖拽 / 显隐 / 主题偏好的 localStorage 键（设置页写，皮肤图层读） */
    const DRAG_KEY = 'fairy.zzz.drag'
    const POS_KEY = 'fairy.zzz.dock-pos'
    const EYE_KEY = 'fairy.zzz.eye-hidden'
    const THEME_KEY = 'fairy.zzz.theme-mode'
    /* 欢迎页 hero 的标题与徽章没有插槽，只能改写 DOM 文本：按界面语言换成 H.D.D 字样 */
    const HERO_COPY = {
      zh: { headline: '空洞深潜系统', badge: 'H.D.D Ⅲ' },
      en: { headline: 'HOLLOW DEEP DIVE SYSTEM', badge: 'H.D.D III' },
    }
    const CJK_RE = /[\u3400-\u9fff]/

    /* Fairy 眼睛：Apache-2.0，改编自 Fairy-DSH（见 NOTICE-fairy-dsh.md） */
    const FAIRY_EYE_SVG = `<!-- SPDX-License-Identifier: Apache-2.0 Adapted from Fairy-DSH, Copyright 2026 Chengzhibense. Source commit d639887a386b0de6fef2e61c97dc268631854591: mascot-geometry.js / mascot-eye-svg.js (see ../NOTICE). MODIFIED for pi-fairy-animation: standalone SVG, padded canvas, named offline animation anchors, white outer halo in both themes, separate contrast edge; browser effects, states, scanlines and glitch clones removed. Generated PNGs and vector previews inherit this attribution; see ../NOTICE. --> <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-1 -1 162 162"> <title>Fairy — selective Fairy-DSH idle adaptation (unofficial)</title> <desc>Transparent floating blue eye, white soft halos, rotating corners, independently breathing eye layers and a lower-right catchlight. No official bitmap.</desc> <defs> <linearGradient id="outer-gradient" x1=".2" y1="0" x2=".8" y2="1"> <stop stop-color="#3145d6"/> <stop offset=".54" stop-color="#2233b2"/> <stop offset="1" stop-color="#2b3cbc"/> </linearGradient> <!-- One static radial field replaces separate halo strokes, avoiding alpha seams. --> <radialGradient id="sclera-halo-gradient" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="56" color-interpolation="linearRGB"> <stop offset=".82" stop-color="#ffffff" stop-opacity="0"/> <stop offset=".864" stop-color="#ffffff" stop-opacity=".22"/> <stop offset=".875" stop-color="#ffffff" stop-opacity=".28"/> <stop offset=".89" stop-color="#ffffff" stop-opacity=".19"/> <stop offset=".91" stop-color="#ffffff" stop-opacity=".11"/> <stop offset=".94" stop-color="#ffffff" stop-opacity=".07"/> <stop offset=".96" stop-color="#ffffff" stop-opacity=".035"/> <stop offset="1" stop-color="#ffffff" stop-opacity="0"/> </radialGradient> <radialGradient id="outer-halo-gradient" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="79" color-interpolation="linearRGB"> <stop offset=".80" stop-color="#ffffff" stop-opacity="0"/> <stop offset=".84" stop-color="#ffffff" stop-opacity=".10"/> <stop offset=".868" stop-color="#ffffff" stop-opacity=".28"/> <stop offset=".90" stop-color="#ffffff" stop-opacity=".18"/> <stop offset=".95" stop-color="#ffffff" stop-opacity=".06"/> <stop offset=".99" stop-color="#ffffff" stop-opacity=".02"/> <stop offset="1" stop-color="#ffffff" stop-opacity="0"/> </radialGradient> <radialGradient id="highlight-halo-gradient" gradientUnits="userSpaceOnUse" cx="98" cy="100.5" r="18" color-interpolation="linearRGB"> <stop offset=".53" stop-color="#f5f8fd" stop-opacity="0"/> <stop offset=".56" stop-color="#f5f8fd" stop-opacity=".16"/> <stop offset=".611" stop-color="#f5f8fd" stop-opacity=".43"/> <stop offset=".72" stop-color="#f5f8fd" stop-opacity=".19"/> <stop offset=".77" stop-color="#f5f8fd" stop-opacity=".12"/> <stop offset=".83" stop-color="#f5f8fd" stop-opacity=".055"/> <stop offset=".89" stop-color="#f5f8fd" stop-opacity=".02"/> <stop offset=".96" stop-color="#f5f8fd" stop-opacity=".004"/> <stop offset="1" stop-color="#f5f8fd" stop-opacity="0"/> </radialGradient> <clipPath id="fz3-lid-clip" clipPathUnits="userSpaceOnUse"><path class="fz3-lid-clip-shape" d="M20 60 Q80 90 140 60 V161 H20 Z"/><rect x="-1" y="108" width="162" height="54"/></clipPath> </defs> <!-- 79-unit halo within an 81-unit half-canvas: padding with near-original apparent disc size. --> <g id="fairy"> <circle id="outer-halo" cx="80" cy="80" r="79" fill="url(#outer-halo-gradient)"/> <!-- Only this supporting edge changes with theme; white rim and halo stay white. --> <circle id="contrast-edge" cx="80" cy="80" r="68" fill="none" stroke="#dceaff" stroke-width="1.8"/> <circle id="outer-disc" cx="80" cy="80" r="68" fill="url(#outer-gradient)" stroke="#f2fbff" stroke-width="1.2"/> <g id="corners" transform="rotate(0 80 80)" fill="#1f2573"> <circle cx="80" cy="80" r="51.75"/> <rect x="37" y="37" width="86" height="86" rx="2" transform="rotate(3 80 80)"/> </g> <g id="eye-anatomy" class="fz3-anatomy"><g id="sclera" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="48" fill="#eef0f5"/> <circle id="sclera-halo" cx="80" cy="80" r="56" fill="url(#sclera-halo-gradient)"/> <circle cx="80" cy="80" r="48" fill="none" stroke="#ffffff" stroke-width=".8" stroke-opacity=".16"/> </g> <g id="iris-outer" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="33" fill="#9daee0"/> </g> <g id="iris-blue" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="24.15" fill="#eef0f5"/> <circle cx="80" cy="80" r="23.5" fill="#2f74c9"/> </g> <g id="pupil" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="16.6" fill="none" stroke="#f5f8fd" stroke-width=".1"/> <circle cx="80" cy="80" r="16" fill="#2e2f78"/> </g> <!-- Same phase as blue iris, but painted last (above pupil), as in upstream. --> <g id="highlight" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle id="highlight-halo" cx="98" cy="100.5" r="18" fill="url(#highlight-halo-gradient)"/> <circle id="catchlight-lower-right" cx="98" cy="100.5" r="11" fill="#f5f8fd"/> </g> </g>  </g> </svg> `

    /* FZ3_ASSETS_BEGIN */
    /* 五圈同心睫毛脉冲环：Fairy-DSH 的 PULSE_SVG（Apache-2.0，见 NOTICE-fairy-dsh.md）。 */
    const FAIRY_PULSE_SVG = `<svg class="fz3-pulse-svg" viewBox="-160 -160 480 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="fz3-pulse-wave" fill="none" stroke="#f4fdff"><circle cx="80" cy="80" r="52" stroke-width="20" stroke-opacity=".05"/><circle cx="80" cy="80" r="52" stroke-width="16" stroke-opacity=".06"/><circle cx="80" cy="80" r="52" stroke-width="12" stroke-opacity=".08"/><circle cx="80" cy="80" r="52" stroke-width="8" stroke-opacity=".10"/><circle cx="80" cy="80" r="52" stroke-width="4.5" stroke-opacity=".09"/></g></svg>`

    /* 水平拉丝故障滤镜：feTurbulence 噪声只沿 X 轴位移（蓝通道固定 .5）。运行时挂到文档一次。 */
    const FAIRY_THREADS_SVG = `<svg id="fz3-threads-defs" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><defs><filter id="fz3-interference" x="-30%" y="0%" width="160%" height="100%" filterRes="96 72" color-interpolation-filters="sRGB"><feTurbulence id="fz3-noise" type="fractalNoise" baseFrequency=".012 .72" numOctaves="1" seed="1" result="noise"/><feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 0 0 .5  0 0 0 1 0" result="horizontal-noise"/><feDisplacementMap id="fz3-displace" in="SourceGraphic" in2="horizontal-noise" scale="5" xChannelSelector="R" yChannelSelector="B"/></filter></defs></svg>`
    /* FZ3_ASSETS_END */
    /* ------------------------------------------------------------------ *
     * ———————————— */
    const ZH = {
      'boot.sound': '🔊 点击任意处开启声音',
      'greet.kicker': 'H.D.D CORE // ONLINE',
      'greet.sub': 'Ⅲ型总序式集成泛用人工智能 · VOICE LINK ACTIVE',
      'greet.tap': '点击任意处唤起声音',
      'dock.error': '语音链路异常',
    }
    const EN = {
      'boot.sound': '🔊 Tap anywhere to enable sound',
      'greet.kicker': 'H.D.D CORE // ONLINE',
      'greet.sub': 'III-Type Omnibus Integrated AI · VOICE LINK ACTIVE',
      'greet.tap': 'Tap anywhere to wake her voice',
      'dock.error': 'voice link error',
    }
    let tr = null
    const t = (key) => {
      try {
        if (tr) {
          const value = tr(key)
          if (value && value !== key) return value
        }
      } catch {}
      return ZH[key] ?? key
    }

    /* ------------------------------------------------------------------ *
     * 声音状态 */
    const voice = { enabled: readBool(VOICE_KEY, true), busy: false, speaking: false, error: '' }
    const listeners = new Set()
    const emit = () => {
      for (const fn of [...listeners]) {
        try {
          fn()
        } catch {}
      }
    }
    const patchVoice = (next) => {
      Object.assign(voice, next)
      emit()
    }
    const useVoice = () => {
      const [, bump] = useState(0)
      useEffect(() => {
        const fn = () => bump((n) => n + 1)
        listeners.add(fn)
        return () => {
          listeners.delete(fn)
        }
      }, [])
      return voice
    }

    let player = null
    /* 设置页「试听问候」用的独立播放器：不能游离在 player 之外，否则「停止」停不掉 */
    let preview = null
    let playSeq = 0
    let autoArmAt = Date.now() + 30_000

    const pausePlayer = () => {
      if (player) {
        try {
          player.pause()
        } catch {}
        player = null
      }
    }

    const stopSpeech = () => {
      playSeq += 1
      pausePlayer()
      if (preview) {
        try {
          preview.pause()
        } catch {}
        preview = null
      }
      patchVoice({ busy: false, speaking: false })
    }

    function playClip(url, token) {
      return new Promise((done) => {
        if (token !== playSeq) {
          done()
          return
        }
        const audio = new Audio(url)
        let settled = false
        let failsafe = null
        const finish = () => {
          if (settled) return
          settled = true
          /* 正常结束/出错都要清掉 240s 兜底定时器，否则每段音频留一个长定时器 */
          if (failsafe) clearTimeout(failsafe)
          if (player === audio) player = null
          done()
        }
        player = audio
        audio.onended = finish
        audio.onerror = finish
        audio.onpause = () => {
          if (!audio.ended) finish()
        }
        audio
          .play()
          .then(() => {
            if (token === playSeq) patchVoice({ speaking: true, busy: false, error: '' })
          })
          .catch(() => {
            if (token === playSeq) patchVoice({ error: t('dock.error') })
            finish()
          })
        failsafe = setTimeout(finish, 240_000)
      })
    }

    async function fetchVoice(text) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 240_000)
      try {
        const res = await fetch('/fairy-zzz/tts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.url) throw new Error(data.error || 'tts failed')
        return data.url
      } finally {
        clearTimeout(timer)
      }
    }

    function cleanSpeakable(raw) {
      return String(raw ?? '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_~#>|]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 420)
    }

    function chunkText(text, maxLength = 90, maxChunks = 8) {
      const pieces = text.split(/(?<=[。！？；\n])/).map((s) => s.trim()).filter(Boolean)
      const chunks = []
      let buffer = ''
      for (const piece of pieces) {
        if ((buffer + piece).length > maxLength && buffer) {
          chunks.push(buffer)
          buffer = piece
        } else {
          buffer += piece
        }
        if (chunks.length >= maxChunks) break
      }
      if (buffer && chunks.length < maxChunks) chunks.push(buffer)
      const out = chunks.filter((s) => s.length > 0)
      return out.length ? out : [text.slice(0, maxLength)]
    }

    async function speakText(raw, options = {}) {
      const force = options.force === true
      const text = cleanSpeakable(raw)
      if (!text) return
      if (!force && !voice.enabled) return
      stopSpeech()
      const token = ++playSeq
      const chunks = chunkText(text)
      patchVoice({ busy: true, speaking: false, error: '' })
      let next = fetchVoice(chunks[0])
      for (let index = 0; index < chunks.length; index += 1) {
        let url
        try {
          url = await next
        } catch (cause) {
          if (token === playSeq) patchVoice({ busy: false, error: String(cause?.message || cause) })
          return
        }
        if (token !== playSeq) return
        if (index + 1 < chunks.length) next = fetchVoice(chunks[index + 1])
        patchVoice({ busy: false, speaking: true })
        await playClip(url, token)
        if (token !== playSeq) return
      }
      if (token === playSeq) patchVoice({ busy: false, speaking: false })
    }

    function readStored(key, fallback) {
      try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
      } catch {
        /* 坏值（手改/旧格式）每次读都会抛，顺手清掉，别让 catch 变成常态 */
        try {
          localStorage.removeItem(key)
        } catch {}
        return fallback
      }
    }
    function readBool(key, fallback) {
      const value = readStored(key, fallback)
      return typeof value === 'boolean' ? value : fallback
    }
    function writeStored(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {}
    }

    /* ------------------------------------------------------------------ *
     * 用量气泡的数据源
     * ------------------------------------------------------------------ */
    const runtime = { ctx: null }

    async function fetchUsage() {
      try {
        const res = await fetch('/fairy-zzz/usage', { cache: 'no-store' })
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    }

    async function fetchBalance() {
      const ctx = runtime.ctx
      if (!ctx) return { ok: false, reason: '没有插件上下文' }
      let account
      let active
      try {
        /* 账户服务挂在 ctx.remote 上；旧的挂法（独立 remote.account）也兼容 */
        account = (ctx.remote && ctx.remote.account) || (ctx['remote.account'] && ctx['remote.account'].account) || null
        active = ctx.locale && ctx.locale.getSnapshot ? ctx.locale.getSnapshot().active : undefined
      } catch (cause) {
        return { ok: false, reason: '账户服务不可用：' + (cause && cause.message ? cause.message : cause) }
      }
      if (!account || typeof account.getBalance !== 'function') return { ok: false, reason: '账户服务未就绪' }
      const version = (typeof globalThis.__DSH_CLIENT_VERSION__ === 'string' && globalThis.__DSH_CLIENT_VERSION__) || '0.2.1-rc.2'
      try {
        const res = await account.getBalance({
          version,
          locale: active || navigator.language || 'zh-CN',
          timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
        })
        if (!res) return { ok: false, reason: '电费余额接口没有返回' }
        if (!res.ok) return { ok: false, reason: '电费余额读取被拒绝：' + String((res.error && (res.error.code || res.error.message)) || '未登录') }
        /* value 可能是钱包数组，也可能被包成 { wallets } / { value } / { bonusWallets } */
        const raw = res.value
        const pick = (list) => (Array.isArray(list) ? list.filter((item) => item && Number.isFinite(Number(item.balance))) : [])
        let wallets = pick(raw)
        if (!wallets.length && raw && !Array.isArray(raw)) {
          wallets = pick(raw.wallets)
          if (!wallets.length) wallets = pick(raw.value)
          if (!wallets.length) wallets = pick(raw.bonusWallets)
        }
        if (!wallets.length) {
          const shape = raw === null ? 'null' : Array.isArray(raw) ? 'array(' + raw.length + ')' : raw && typeof raw === 'object' ? 'object(' + Object.keys(raw).join(',') + ')' : typeof raw
          return { ok: false, reason: '账户里没有钱包（' + shape + '）' }
        }
        const cny = wallets.filter((item) => (item.currency || 'CNY') === 'CNY')
        const use = cny.length ? cny : wallets
        const amount = use.reduce((sum, item) => sum + Number(item.balance), 0)
        return { ok: true, amount, currency: use[0].currency || 'CNY' }
      } catch (cause) {
        return { ok: false, reason: '电费余额请求失败：' + (cause && cause.message ? cause.message : cause) }
      }
    }

    /* 用量/余额预取缓存：到坞后空闲预取一次；点眼徽时先用缓存秒开、再后台刷新。
       宿主 /usage 冷启动要解压会话日志（~0.5s），余额要走一次远端，全部挪到用户点击之前完成。 */
    const usageCache = { usage: null, usageAt: 0, balance: null, balanceAt: 0, usagePromise: null, balancePromise: null }
    const USAGE_TTL = 60_000
    const BALANCE_TTL = 30_000
    function loadUsage(force) {
      if (!force && usageCache.usage && Date.now() - usageCache.usageAt < USAGE_TTL) return Promise.resolve(usageCache.usage)
      if (usageCache.usagePromise) return usageCache.usagePromise
      usageCache.usagePromise = fetchUsage()
        .then((usage) => {
          if (usage) {
            usageCache.usage = usage
            usageCache.usageAt = Date.now()
          }
          return usage || usageCache.usage
        })
        .finally(() => {
          usageCache.usagePromise = null
        })
      return usageCache.usagePromise
    }
    function loadBalance(force) {
      if (!force && usageCache.balance && Date.now() - usageCache.balanceAt < BALANCE_TTL) return Promise.resolve(usageCache.balance)
      if (usageCache.balancePromise) return usageCache.balancePromise
      usageCache.balancePromise = fetchBalance()
        .then((balance) => {
          if (balance) {
            usageCache.balance = balance
            usageCache.balanceAt = Date.now()
          }
          return balance || usageCache.balance
        })
        .finally(() => {
          usageCache.balancePromise = null
        })
      return usageCache.balancePromise
    }
    function prefetchUsage() {
      loadUsage(false)
      loadBalance(false)
    }

    function yuan(value) {
      if (!Number.isFinite(value)) return '—'
      if (value === 0) return '¥0'
      if (value < 0.01) return '¥' + value.toFixed(4)
      if (value < 10) return '¥' + value.toFixed(3).replace(/0+$/, '')
      return '¥' + value.toFixed(2)
    }

    function tokensText(tokens) {
      const n = Number(tokens) || 0
      if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M'
      if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k'
      return String(n)
    }

    /* 倒计时表盘：04:09:12 */
    function clockText(ms) {
      const total = Math.max(0, Math.floor(Math.max(0, ms) / 1_000))
      const hours = String(Math.floor(total / 3600)).padStart(2, '0')
      const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
      const seconds = String(total % 60).padStart(2, '0')
      return hours + ':' + minutes + ':' + seconds
    }
    /* v1.3.3 文案：用量 / 花费 / 峰谷一律按「电费」口径展示。
       宿主旧版 index.js 仍返回「高峰 / 空闲」字样，这里做一次兜底改写，旧宿主也能正确显示。 */
    function feeText(value) {
      return String(value == null ? '' : value)
        .replace(/高峰时段/g, '十倍电费')
        .replace(/空闲时段/g, '五倍电费')
        .replace(/高峰/g, '十倍电费')
        .replace(/空闲/g, '五倍电费')
        .replace(/(十倍电费|五倍电费)价/g, '$1')
    }

    /* ———————————————————— */
    /* 旧版回退路径：原来从按钮一路向上爬 10 层取最长文本，很容易把 thinking /
       工具输出一起念出来。现在只在「这一条消息」的局部 DOM 里取，并复用 strip 规则。 */
    function readMessageText(el) {
      if (!el || typeof el.closest !== 'function') return ''
      const tail = el.closest('[data-turn-tail]')
      const local = tail && tail.parentElement ? tail.parentElement : null
      const own = el.closest('[data-chat-turn]')
      const target = local || (own && own.parentElement) || el.parentElement
      if (!target) return ''
      const text = speechTextOfRow(target)
      if (text.length > 2) return text
      const row = own || el.parentElement
      return row ? speechTextOfRow(row) : ''
    }

    /* ————————————————————————————————————————————————————————————————
     * 只朗读“最终回答”的正文。
     * DSH 一个回合的 DOM 里同时包含：思考(think)、工具调用/命令卡片、
     * 步骤过程(process) 和最终回答。旧实现从按钮向上取最长 innerText，
     * 会把思考、命令输出、步骤摘要一起念出来。现在改成：
     *   1. 从动作按钮找到所在回合的 flow 容器和 turn id；
     *   2. 只取该回合的 assistant-step 行，跳过过程成员(reasoning 分组)；
     *   3. 取最后一条回答行，克隆后删掉思考/过程/代码/隐藏节点再取文本。
     * 找不到新结构时回退旧逻辑，兼容旧版 DSH。
     * ———————————————————————————————————————————————————————————————— */
    const NON_SPEECH_SELECTORS = [
      '[data-variant="think"]',
      '[data-variant="others"]',
      '[data-turn-process-inline]',
      '[data-turn-process]',
      '[data-step-process]',
      '[data-turn-usage-details]',
      '[data-chat-flow-kind="turn-process"]',
      '[data-shimmer-decoration]',
      '[aria-hidden="true"]',
      '[hidden]',
      'pre',
      'code',
      'svg',
      'button',
      /* 动作条与附件属于交互壳，不属于回答正文 */
      '[data-turn-tail]',
      '[data-message-attachments]',
    ]

    function speechTextOfRow(row) {
      const clone = row.cloneNode(true)
      for (const selector of NON_SPEECH_SELECTORS) {
        for (const node of Array.from(clone.querySelectorAll(selector))) node.remove()
      }
      return String(clone.innerText || clone.textContent || '').trim()
    }

    function readAssistantText(el) {
      if (!el || typeof el.closest !== 'function') return ''
      const flow = el.closest('[data-chat-flow]')
      const owner = el.closest('[data-chat-turn]')
      const turn = owner === null ? null : owner.getAttribute('data-chat-turn')
      if (flow !== null && turn !== null) {
        const rows = Array.from(flow.querySelectorAll('[data-chat-flow-kind="assistant-step"]'))
          .filter((row) => row.getAttribute('data-chat-turn') === turn)
        /* 拆分“过程/回答”时，过程里的思考行带 group-part=reasoning，要跳过 */
        const answers = rows.filter((row) => row.getAttribute('data-chat-group-part') !== 'reasoning')
        const chosen = answers.length > 0 ? answers : rows
        for (let index = chosen.length - 1; index >= 0; index -= 1) {
          const text = speechTextOfRow(chosen[index])
          if (text.length > 1) return text
        }
      }
      return readMessageText(el)
    }

    const seen = new Set(readStored(SEEN_KEY, []))
    const saveSeen = () => {
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-400)))
      } catch {}
    }
    let lastMountAt = 0
    function autoRead(el, messageId) {
      if (!el || !messageId) return
      const now = Date.now()
      const gap = now - lastMountAt
      lastMountAt = now
      if (seen.has(messageId)) return
      /* 同一批消息连续挂载：只念最后一条，前面的直接记已读（避免连环叠音） */
      if (gap < 900) {
        seen.add(messageId)
        saveSeen()
        return
      }
      /* 刚打开 DSH / 刚回坞的静默期：等它结束后补念一次，而不是把回复直接吞掉 */
      if (now < autoArmAt) {
        const wait = autoArmAt - now + 60
        window.setTimeout(() => {
          if (!el.isConnected || seen.has(messageId) || !voice.enabled) return
          const text = readAssistantText(el)
          if (text.length <= 2) return
          seen.add(messageId)
          saveSeen()
          speakText(text)
        }, wait)
        return
      }
      /* 手动关掉自动朗读时不动已读标记：重新打开后仍有机会念到 */
      if (!voice.enabled) return
      const text = readAssistantText(el)
      if (text.length <= 2) return
      /* 只在真正入队朗读之后记已读：被静默期/静音跳过的回复不会被永久标记 */
      seen.add(messageId)
      saveSeen()
      speakText(text)
    }

    /* ------------------------------------------------------------------ *
     * ———————————— */
    const baseTokens = {
      '--dsw-alias-bg-base': 'rgba(8,10,18,0.88)',
      '--dsw-alias-bg-layer-1': 'rgba(11,14,24,0.92)',
      '--dsw-alias-bg-layer-2': 'rgba(15,19,32,0.95)',
      '--dsw-alias-bg-overlay': 'rgba(4,5,12,0.98)',
      '--dsw-alias-border-l1': 'rgba(120,110,255,0.22)',
      '--dsw-alias-border-l2': 'rgba(58,68,140,0.32)',
      '--dsw-alias-brand-primary': '#3f6bff',
      '--dsw-alias-label-primary': '#eef0fa',
      '--dsw-alias-label-secondary': '#8b93b8',
      '--dsw-alias-state-error-primary': '#ff5d7a',
      '--dsw-alias-state-idle-primary': '#7078ac',
      '--dsw-alias-state-success-primary': '#3ef0b0',
      '--dsw-alias-state-warn-primary': '#ffc93c',
      '--dsw-specific-sidebar-fill': 'rgba(9,11,20,0.9)',
      '--dsw-specific-bubble': 'rgba(22,26,42,0.92)',
      '--dsw-alias-markdown-code-block': 'rgba(8,9,20,0.94)',
    }
    /* 宿主切到浅色外观时用的同一套设计变量（键与 baseTokens 一一对应） */
    const lightTokens = {
      '--dsw-alias-bg-base': 'rgba(247,250,255,0.92)',
      '--dsw-alias-bg-layer-1': 'rgba(255,255,255,0.94)',
      '--dsw-alias-bg-layer-2': 'rgba(255,255,255,0.97)',
      '--dsw-alias-bg-overlay': 'rgba(255,255,255,0.99)',
      '--dsw-alias-border-l1': 'rgba(60,90,220,0.18)',
      '--dsw-alias-border-l2': 'rgba(120,140,200,0.32)',
      '--dsw-alias-brand-primary': '#2f55e8',
      '--dsw-alias-label-primary': '#141a2e',
      '--dsw-alias-label-secondary': '#59648a',
      '--dsw-alias-state-error-primary': '#d42a4c',
      '--dsw-alias-state-idle-primary': '#818ab0',
      '--dsw-alias-state-success-primary': '#0d9f6e',
      '--dsw-alias-state-warn-primary': '#b1700a',
      '--dsw-specific-sidebar-fill': 'rgba(243,247,255,0.94)',
      '--dsw-specific-bubble': 'rgba(255,255,255,0.96)',
      '--dsw-alias-markdown-code-block': 'rgba(238,243,255,0.96)',
    }
    const TOKENS = {}
    for (const key of Object.keys(baseTokens)) TOKENS[key] = { light: lightTokens[key] || baseTokens[key], dark: baseTokens[key] }

    /* ------------------------------------------------------------------ *
     * 样式
     * ------------------------------------------------------------------ */
    const CSS = `
:root{
  --fz3-cyan:#8fb4ff;
  --fz3-amber:#ffc93c;
  --fz3-text:#e8f3ff;
  --fz3-font:"Bahnschrift","DIN Alternate","HarmonyOS Sans SC","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif;
  --fz3-dock-x:25vw;
  --fz3-dock-y:52vh;
  --fz3-dock-size:128px;
  /* 自适应：问候页的眼睛直径 / 眼睛中心高度 / 眼睛到文案的间距，全部随视口缩放 */
  --fz3-eye:clamp(132px,min(32vmin,34vh),330px);
  --fz3-eye-cy:42vh;
  --fz3-eye-gap:clamp(14px,3.4vh,54px);
  color-scheme:dark;
}
html,body{background:#080a12!important;color-scheme:dark;}
body{font-family:var(--fz3-font)!important;}
body::before{
  content:"";position:fixed;inset:-12%;z-index:-2;pointer-events:none;
  background:
    radial-gradient(42% 34% at 88% -6%,rgba(96,64,255,.30),transparent 68%),
    radial-gradient(34% 30% at 2% 4%,rgba(46,52,220,.26),transparent 70%),
    radial-gradient(48% 40% at 50% 118%,rgba(92,40,214,.22),transparent 66%),
    radial-gradient(28% 22% at 62% 38%,rgba(98,120,255,.08),transparent 74%),
    repeating-linear-gradient(-24deg,rgba(150,160,255,.045) 0 1px,transparent 1px 132px),
    linear-gradient(160deg,#0a0818 0%,#050410 52%,#080513 100%);
  /* 40s 位移漂移已静态化：全屏层动画在 165Hz 下每帧合成，实测占 GPU ~20%@165Hz；
     这一层几乎被应用界面覆盖，漂移肉眼几乎不可见，保留原起始位姿即可。 */
  transform:translate3d(-1.4%,-1%,0) scale(1.03);
}
/* body::after 只在下面「图层」段定义一次。这里早先的 76px 网格版本已被后面 48px 网格版本
   逐属性完全覆盖（含 -webkit-mask-image 别名），属于死规则，删掉可少一层绘制声明。 */
/* fz3-drift（背景 40s 漂移）已删除：全屏层每帧合成的成本远超观感收益，
   背景层固定在上面的起始位姿，不再产生逐帧合成。 */
::selection{background:rgba(87,232,255,.30);color:#fff}
*::-webkit-scrollbar{width:9px;height:9px}
*::-webkit-scrollbar-track{background:transparent}
*::-webkit-scrollbar-thumb{
  background:linear-gradient(180deg,rgba(87,232,255,.42),rgba(123,92,255,.52));
  border-radius:9px;border:2px solid transparent;background-clip:padding-box;
}
*::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgba(87,232,255,.8),rgba(123,92,255,.9));background-clip:padding-box}
textarea,input{caret-color:var(--fz3-cyan);}
textarea:focus,input:focus{
  box-shadow:0 0 0 1px rgba(87,232,255,.5),0 0 28px -10px rgba(87,232,255,.85)!important;
}
a{color:var(--fz3-cyan);text-underline-offset:3px}
pre,code,kbd,samp{font-family:"Cascadia Code","JetBrains Mono","SFMono-Regular",Consolas,monospace!important}
button{transition:filter .16s ease,box-shadow .2s ease,background-color .2s ease,color .2s ease,border-color .2s ease}
button:not([disabled]):active{transform:translateY(1px)}
:focus-visible{outline:2px solid rgba(87,232,255,.7);outline-offset:2px}

/* ---------- 品牌 ---------- */
.fz3-brandmark{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px}
.fz3-brandmark-eye{width:100%;height:100%;display:block;filter:drop-shadow(0 0 6px rgba(80,140,255,.5))}
.fz3-brandmark-eye svg{width:100%;height:100%;display:block}
/* 欢迎页 hero 品牌位（conversation.hero.brand.mark）：替换 DSH 鲸鱼 fallback，放静态 Fairy 眼标 */
.fz3-hero-brand{display:inline-flex;align-items:center;justify-content:center;flex:none}
.fz3-hero-brand-eye{display:block;width:100%;height:100%;filter:drop-shadow(0 0 6px rgba(80,140,255,.5))}
.fz3-hero-brand-eye svg{display:block;width:100%;height:100%}
.fz3-brandname{display:flex;flex-direction:column;gap:2px;line-height:1.05;font-family:var(--fz3-font);min-width:0}
.fz3-brandname b{font-weight:700;font-size:14px;letter-spacing:.34em;color:#eaf7ff;text-shadow:0 0 14px rgba(87,232,255,.55)}
.fz3-brandname i{font-style:normal;font-size:8px;letter-spacing:.2em;color:rgba(122,188,240,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---------- 图层 ---------- */
body::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(120,150,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(120,150,255,.05) 1px,transparent 1px);
  background-size:48px 48px,48px 48px;mask-image:radial-gradient(120% 120% at 50% 30%,#000 40%,transparent 100%)}
.fz3-layer{position:fixed;inset:0;z-index:9000;pointer-events:none;font-family:var(--fz3-font);color:var(--fz3-text);-webkit-font-smoothing:antialiased}
.fz3-screen{position:absolute;inset:0;pointer-events:auto;transition:opacity 1.25s ease,filter 1.25s ease,visibility 0s linear;overflow:hidden;background:#02050d}
/* 收进 dock 后整块舞台（hero 大图、BootStage 视频）必须彻底退出绘制：只写 opacity:0 时
   合成器仍会保留大约一屏的图层；visibility 在淡出结束（1.25s）后再隐藏，过渡观感不变。 */
.fz3-layer[data-phase="dock"] .fz3-screen{opacity:0;pointer-events:none;filter:blur(7px);visibility:hidden;
  transition:opacity 1.25s ease,filter 1.25s ease,visibility 0s linear 1.25s}
.fz3-bg{position:absolute;inset:0;background:
  radial-gradient(56% 52% at 50% 44%,rgba(26,38,110,.5),transparent 74%),
  radial-gradient(42% 38% at 84% 6%,rgba(88,60,235,.26),transparent 72%),
  #030409;}
.fz3-hero{
  position:absolute;inset:0;background:url('/fairy-zzz/assets/hero.webp') center/cover no-repeat;
  opacity:0;transform:scale(1.04);mix-blend-mode:screen;
  filter:saturate(1.35) brightness(1.08) contrast(1.05);
  -webkit-mask-image:radial-gradient(96% 92% at 50% 46%,#000 46%,rgba(0,0,0,.55) 78%,transparent 97%);
  mask-image:radial-gradient(96% 92% at 50% 46%,#000 46%,rgba(0,0,0,.55) 78%,transparent 97%);
  transition:opacity 1.9s ease,transform 14s ease-out;
}
.fz3-layer[data-phase="greet"] .fz3-hero{opacity:.9;transform:scale(1.01)}
.fz3-layer[data-phase="dock"] .fz3-hero{opacity:0;transition:opacity 1.4s ease}

/* ———————————————————— */
.fz3-boot{position:absolute;inset:0;background:#04060d;overflow:hidden;transition:opacity .6s ease}
.fz3-boot.is-out{opacity:0}
/* 自适应：视频按 contain 完整显示，四周用同一帧的模糊放大量补齐，任何比例都不出现突兀黑边 */
.fz3-boot-fill{
  position:absolute;inset:-8%;z-index:0;pointer-events:none;overflow:hidden;
  background:url('/fairy-zzz/assets/poster.jpg') center/cover no-repeat;
  filter:blur(46px) brightness(.74) saturate(1.45);transform:scale(1.1);opacity:1;
}
.fz3-boot video{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:contain;filter:saturate(1.06) contrast(1.04) brightness(.94)}
.fz3-boot::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  background:
    repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px),
    radial-gradient(124% 96% at 50% 50%,transparent 52%,rgba(0,0,0,.5) 100%);
}
/* 浏览器拦截带声音的自动播放时，提示点击一次开启（DSH 桌面壳通常允许直接出声，不显示这条）。 */
.fz3-boot-sound{position:absolute;left:0;right:0;bottom:78px;text-align:center;z-index:3;pointer-events:none;
  font-size:10px;letter-spacing:.2em;color:rgba(255,201,60,.85);animation:fz3-blink 1.6s ease-in-out infinite}

/* ---------- 全息核心 ---------- */
.fz3-core{
  position:fixed;left:50%;top:var(--fz3-eye-cy);width:var(--fz3-eye);aspect-ratio:1/1;
  transform:translate(-50%,-50%);opacity:0;pointer-events:none;z-index:2;
  transition:left 1.35s cubic-bezier(.62,0,.22,1),top 1.35s cubic-bezier(.62,0,.22,1),width 1.35s cubic-bezier(.62,0,.22,1),opacity .55s ease;
}
.fz3-layer[data-phase="greet"] .fz3-core{opacity:1}
.fz3-layer[data-phase="dock"] .fz3-core{
  left:var(--fz3-dock-x);top:var(--fz3-dock-y);width:var(--fz3-dock-size);opacity:1;pointer-events:none;
}
.fz3-layer[data-phase="boot"] .fz3-core{opacity:0}
.fz3-core svg{display:block;width:100%;height:100%;filter:none}
.fz3-layer[data-phase="dock"] .fz3-core svg{filter:none;transition:transform .3s ease}
.fz3-core::after{
  content:none;
}
.fz3-eye{--fz3-eye-glow:drop-shadow(0 0 26px rgba(52,96,240,.42));position:relative;width:100%;height:100%;display:grid;place-items:center}
/* 白边辉光原本用 drop-shadow 挂在 SVG 外壳上，但眼球呼吸会让滤镜每帧重新栅格化整棵 SVG 子树。
   现在换成一圈静态 ::before 径向柔光：只画一次、随图层合成，呼吸动画因此能留在合成器线程。
   --fz3-eye-glow 变量仍保留给随机花屏/表情转场的瞬时滤镜（那些只有几十到几百毫秒）。 */
.fz3-eye::before{
  content:"";position:absolute;inset:-13%;border-radius:50%;z-index:0;pointer-events:none;
  background:radial-gradient(closest-side,rgba(96,148,255,.30),rgba(64,112,255,.17) 46%,rgba(40,70,210,.05) 74%,transparent 100%);
}
.fz3-eye-svg{position:relative;z-index:2;width:100%;height:100%}
.fz3-eye-svg svg{width:100%;height:100%;display:block;overflow:visible}
.fz3-eye #sclera,.fz3-eye #iris-outer,.fz3-eye #iris-blue,.fz3-eye #pupil,.fz3-eye #highlight{
  transform-box:view-box;transform-origin:80px 80px;
}
/* 眼球呼吸完全由这条 CSS 时间线驱动（1440ms 周期 = .72s alternate，四层相位差 0/-45/-90/-180ms），
   与下方 FZ3 运行时常量一致：待机时主线程没有任何逐帧 JS，呼吸动画跑在合成器线程上。
   选择器用 .fz3-eye 而不是 .fz3-eye-svg，这样花屏时那 5 份切片克隆也会跟着一起呼吸。 */
.fz3-eye #corners{
  transform-box:view-box;transform-origin:80px 80px;
  animation:fz3-corners 15s linear infinite;
  animation-delay:var(--fz3-lash-delay,0s);
}
.fz3-eye #sclera{animation:fz3-breath-a .72s cubic-bezier(.72,0,.28,1) 0s infinite alternate}
.fz3-eye #iris-outer{animation:fz3-breath-b .72s cubic-bezier(.72,0,.28,1) -.045s infinite alternate}
.fz3-eye #iris-blue{animation:fz3-breath-c .72s cubic-bezier(.72,0,.28,1) -.09s infinite alternate}
.fz3-eye #pupil{animation:fz3-breath-d .72s cubic-bezier(.72,0,.28,1) -.18s infinite alternate}
/* 参考实现的「外部光晕」是静态线条（避免重绘）；这里保持静态，只用多层径向渐变模拟柔光。
   原先的 filter:blur(20px) 会强制整块离屏栅格化（台眼、花屏切片都要重算），换成 4 段渐变软过渡，
   肉眼基本无差，但合成器不再需要滤镜。 */
.fz3-eye-halo{position:absolute;inset:7%;border-radius:50%;z-index:0;pointer-events:none;opacity:.72;
  background:radial-gradient(closest-side,rgba(74,124,255,.32),rgba(64,112,255,.21) 34%,rgba(52,88,235,.12) 52%,rgba(38,64,200,.05) 68%,rgba(30,48,170,.015) 84%,transparent 97%)}

/* 睫毛脉冲环：5 圈同心描边共享同一条 4s 时间线，0-36% 扩散淡出，其余静默等待下一轮 */
.fz3-eye-pulse{position:absolute;left:-100%;top:-100%;width:300%;height:300%;z-index:1;pointer-events:none;opacity:.92}
.fz3-eye-pulse svg{display:block;width:100%;height:100%;overflow:visible}
.fz3-eye-pulse .fz3-pulse-wave{
  transform-box:view-box;transform-origin:80px 80px;
  animation:fz3-lash-pulse 4s cubic-bezier(.42,0,.22,1) infinite;
  will-change:opacity,transform;
}

/* ---------- 设置页 ---------- */
.fz3-set{display:flex;flex-direction:column;gap:14px;padding:2px 2px 8px;color:#e2ecfa;font-family:var(--fz3-font)}
.fz3-set-head{display:flex;align-items:center;gap:12px;padding:2px 0 6px}
.fz3-set-eye{width:46px;height:46px;flex:none;display:block;filter:drop-shadow(0 0 12px rgba(64,116,255,.5))}
.fz3-set-eye svg{width:100%;height:100%;display:block;overflow:visible}
.fz3-set-name{font-size:15px;letter-spacing:.03em}
.fz3-set-sub{font-size:11.5px;color:#8fa3bb;margin-top:3px}
.fz3-set-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(130,160,210,.14)}
.fz3-set-label{font-size:13px}
.fz3-set-desc{font-size:11px;color:#8b9fb8;margin-top:3px;line-height:1.5}
.fz3-set-dot{width:8px;height:8px;border-radius:50%;flex:none;box-shadow:0 0 10px currentColor}
.fz3-set-dot.is-on{background:#4ee6a8;color:#4ee6a8}
.fz3-set-row.is-stack{display:block}
.fz3-set-path{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}
.fz3-set-input{flex:1 1 260px;min-width:0;padding:8px 11px;font-family:inherit;font-size:12.5px;font-weight:400;line-height:1.45;letter-spacing:0;color:#dbe8f6;background:rgba(9,13,22,.82);border:1px solid rgba(120,160,220,.26);border-radius:9px;outline:none;transition:border-color .18s ease,box-shadow .18s ease}
.fz3-set-input:focus{border-color:rgba(87,232,255,.55);box-shadow:0 0 0 3px rgba(87,232,255,.12)}
.fz3-set-input::placeholder{color:rgba(150,172,200,.5)}
.fz3-set-dot.is-wait{background:#f0b45c;box-shadow:0 0 11px rgba(240,180,92,.6)}
.fz3-set-dot.is-off{background:#7d8ea6;color:#7d8ea6}
.fz3-set-switch{width:42px;height:24px;border-radius:99px;border:1px solid rgba(140,170,220,.3);background:rgba(120,150,200,.18);position:relative;cursor:pointer;flex:none;transition:background .18s ease,border-color .18s ease}
.fz3-set-switch::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#cfdcee;transition:transform .18s ease,background .18s ease}
.fz3-set-switch[data-on="1"]{background:linear-gradient(90deg,#2f7bff,#57e8ff);border-color:rgba(120,225,255,.6)}
.fz3-set-switch[data-on="1"]::after{transform:translateX(18px);background:#04121f}
.fz3-set-actions{display:flex;flex-wrap:wrap;gap:8px}
.fz3-set-btn{font:inherit;font-size:12px;padding:8px 14px;border-radius:9px;cursor:pointer;color:#e8f2ff;background:rgba(87,232,255,.12);border:1px solid rgba(110,200,255,.32);transition:background .16s ease,border-color .16s ease}
.fz3-set-btn:hover:not(:disabled){background:rgba(87,232,255,.22);border-color:rgba(120,225,255,.6)}
.fz3-set-btn:disabled{opacity:.4;cursor:default}
.fz3-set-btn.is-ghost{background:rgba(255,255,255,.04);border-color:rgba(140,160,190,.24)}
.fz3-set-note{font-size:11px;line-height:1.6;color:#7f92a9}

/* ---------- 信号故障：threads（水平拉丝）/ blocks（5 条横切片） ---------- */
.fz3-eye[data-glitch] .fz3-eye-svg,
.fz3-eye[data-transition-glitch] .fz3-eye-svg{
  filter:var(--fz3-eye-glow) brightness(var(--fz3-g-bright,1.03)) contrast(var(--fz3-g-contrast,1.04));
  transform:translateX(var(--fz3-g-x,0px)) skewX(var(--fz3-g-skew,0deg));
  transition:none;will-change:transform,filter;
}
/* 参考实现：threads 拉丝与表情切换转场期间，整只眼都叠加 feTurbulence 水平位移滤镜。 */
.fz3-eye[data-glitch="threads"] .fz3-eye-svg,
.fz3-eye[data-transition-glitch] .fz3-eye-svg{
  filter:url(#fz3-interference) brightness(var(--fz3-g-bright,1.06)) contrast(var(--fz3-g-contrast,1.08)) var(--fz3-eye-glow);
}
.fz3-glitch{position:absolute;inset:0;z-index:3;pointer-events:none;display:none}
.fz3-eye[data-glitch="blocks"] .fz3-glitch{display:block}
.fz3-gband{position:absolute;inset:0;display:block;will-change:transform,opacity}
.fz3-gband > span{position:absolute;inset:0;display:block}
.fz3-gband svg{width:100%;height:100%;display:block;overflow:visible}
/* 参考实现的故障切片只克隆眼盘本体，外圈光晕不进入克隆（否则 5 份光晕错位叠加会糊成重影）。 */
.fz3-glitch #outer-halo{display:none}
.fz3-gband[data-slice="1"]{transform:translateX(var(--fz3-g-s1-x,0px))}
.fz3-gband[data-slice="2"]{transform:translateX(var(--fz3-g-s2-x,0px))}
.fz3-gband[data-slice="3"]{transform:translateX(var(--fz3-g-s3-x,0px))}
.fz3-gband[data-slice="4"]{transform:translateX(var(--fz3-g-s4-x,0px))}
.fz3-gband[data-slice="5"]{transform:translateX(var(--fz3-g-s5-x,0px))}
/* 切块期间锁定睫毛角度，避免 5 份切片克隆各跑一条旋转时间线 */
.fz3-eye[data-glitch="blocks"] #corners{animation:none!important;transform:rotate(var(--fz3-lash-angle,0deg))}

/* ---------- 待机小动作：眼闪 + 半闭眼（眼闪由运行时的事件定时器触发；半闭眼形状固定，不再逐帧呼吸） ---------- */
/* 半闭眼沿用参考实现的做法：用 clipPath 裁切整只眼球（#eye-anatomy），被裁掉的上半部分会露出
   后面的旋转睫毛/暗角，而不是盖一块纯色遮罩。
   形状不做持续呼吸：动画对象是 <clipPath> 里的形状，Chrome 每帧都要重算裁切并重绘整棵 eye 子树
   （只走主线程，不能上合成器）。实测思考态稳吃一个核 ~28%，而且换成 steps 降帧也没用——只要动画在跑，
   每一帧仍然要重绘；只有把动画去掉才回落到 ~1%。所以这里固定成原呼吸的 "to" 端（translateY(15.5px)
   scaleY(1)），裁切只在思考态被引用；眼球四层自己的呼吸、睫毛旋转、五圈脉冲照旧在跑，整体仍然"活着"，
   观感差别很小，而思考态主线程成本几乎归零。 */
.fz3-eye .fz3-lid-clip-shape{
  transform-box:view-box;transform-origin:80px 60px;
  transform:translateY(15.5px) scaleY(1);
}
.fz3-eye[data-lid="thinking"] .fz3-anatomy{clip-path:url(#fz3-lid-clip)}

/* 眼闪：极轻的白色亮度跳动；随机 1750-3600ms 一次，单次 155-255ms */
.fz3-eye-flicker{position:absolute;inset:7.12%;border-radius:50%;background:#fff;opacity:0;z-index:4;pointer-events:none;mix-blend-mode:screen}
.fz3-eye[data-flicker="1"] .fz3-eye-flicker{
  animation:fz3-eye-flicker-overlay var(--fz3-flicker-ms,210ms) cubic-bezier(.32,0,.68,1) both;
  will-change:opacity;
}

/* 完成：弹一下 + 光环炸开 */
.fz3-layer[data-mood="done"] .fz3-eye{animation:fz3-celebrate 1s cubic-bezier(.3,1.5,.5,1) 1}
.fz3-eye-flash{position:absolute;inset:-4%;z-index:0;border-radius:50%;pointer-events:none;opacity:0;
  border:2px solid rgba(190,220,255,.85)}
.fz3-layer[data-mood="done"] .fz3-eye-flash{animation:fz3-burst .95s ease-out 1}

/* 页面隐藏：冻结全部 CSS 时间线（四层呼吸、睫毛旋转、脉冲环都在这一个属性上停下）。 */
.fz3-eye[data-fz3-suspended] *{animation-play-state:paused!important;will-change:auto!important}
/* 不提供 reduced-motion 降级：Windows 关闭动画效果时也必须保持完整动效。 */
@keyframes fz3-corners{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes fz3-breath-a{from{transform:scale(.985)}to{transform:scale(.91)}}
@keyframes fz3-breath-b{from{transform:scale(1)}to{transform:scale(.90)}}
@keyframes fz3-breath-c{from{transform:scale(1)}to{transform:scale(.87)}}
@keyframes fz3-breath-d{from{transform:scale(1)}to{transform:scale(.85)}}
/* 5 圈脉冲环：周期 4s；0-36% 内扩散并淡出，其余 64% 静默等待下一轮 */
@keyframes fz3-lash-pulse{
  0%{opacity:0;transform:scale(.98)}
  5%{opacity:.72}
  12%{opacity:.52}
  20%{opacity:.19}
  27%{opacity:0}
  36%,100%{opacity:0;transform:scale(2.78)}
}
@keyframes fz3-eye-flicker-overlay{
  0%,100%{opacity:0}
  22%{opacity:var(--fz3-flicker-1,.04)}
  48%{opacity:var(--fz3-flicker-mid,.012)}
  72%{opacity:var(--fz3-flicker-2,.03)}
}
@keyframes fz3-celebrate{0%{transform:scale(1)}30%{transform:scale(1.14)}62%{transform:scale(.97)}100%{transform:scale(1)}}
@keyframes fz3-burst{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.5);opacity:0}}

/* ———————————————————— */
.fz3-copy{
  position:fixed;left:50%;top:calc(var(--fz3-eye-cy) + var(--fz3-eye) / 2 + var(--fz3-eye-gap));
  transform:translate(-50%,0);width:min(820px,90vw);
  text-align:center;opacity:0;pointer-events:none;z-index:3;transition:opacity .6s ease,transform 1s ease,visibility 0s linear;
}
.fz3-layer[data-phase="greet"] .fz3-copy{opacity:1}
.fz3-layer[data-phase="dock"] .fz3-copy{opacity:0;transform:translate(-50%,-16px);visibility:hidden;
  transition:opacity .6s ease,transform 1s ease,visibility 0s linear .6s}
.fz3-copy-kicker{font-size:clamp(8px,.78vw,9.5px);letter-spacing:.44em;color:rgba(150,172,255,.82);margin-bottom:clamp(6px,1.4vh,14px);text-indent:.44em}
.fz3-copy-title{display:inline-block;position:relative;margin-bottom:clamp(24px,4.4vh,56px);font-size:clamp(18px,min(3.1vw,4.6vh),38px);font-weight:700;letter-spacing:.045em;line-height:1.06;color:#fff;text-align:center;
  text-shadow:0 0 24px rgba(96,124,255,.85),0 0 60px rgba(70,90,255,.5);}
/* 参考视频里的镜面倒影：同一串文字翻转过来，向下渐隐 */
.fz3-copy-title::after{
  content:attr(data-text);position:absolute;left:0;right:0;top:100%;transform:scaleY(-1);transform-origin:top center;
  opacity:.26;filter:blur(.7px);pointer-events:none;
  -webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9),transparent 70%);
  mask-image:linear-gradient(180deg,rgba(0,0,0,.9),transparent 70%);
}
.fz3-copy-title-wrap{text-align:center}
.fz3-copy-title-zh{
  font-size:clamp(10px,min(1.15vw,1.7vh),15px);letter-spacing:.34em;text-indent:.34em;
  color:rgba(168,224,255,.92);text-shadow:0 0 18px rgba(87,232,255,.6);
  margin-bottom:clamp(4px,1vh,12px);
}
.fz3-copy-lines{display:flex;flex-direction:column;gap:clamp(4px,.9vh,8px);padding:0 clamp(14px,3vw,28px);text-wrap:balance;font-size:clamp(13px,min(1.7vw,2.6vh),22px);line-height:1.52;color:#eef8ff;text-shadow:0 0 24px rgba(87,232,255,.55),0 0 6px rgba(120,220,255,.35)}
.fz3-copy-lines span{opacity:0;transform:translateY(10px);animation:fz3-line .75s cubic-bezier(.2,.7,.2,1) forwards;white-space:pre-wrap}
.fz3-copy-lines span:nth-child(1){animation-delay:.55s}
.fz3-copy-lines span:nth-child(2){animation-delay:1.15s}
.fz3-copy-lines span:nth-child(3){animation-delay:1.75s}
.fz3-copy-sub{margin-top:clamp(6px,1.4vh,16px);font-size:clamp(7px,.66vw,8.5px);letter-spacing:.32em;color:rgba(122,178,230,.6);text-indent:.32em}
.fz3-skip2{
  position:absolute;right:clamp(12px,2.4vw,30px);bottom:clamp(10px,2.6vh,26px);pointer-events:auto;background:none;border:0;font:inherit;
  font-size:9.5px;letter-spacing:.26em;color:rgba(150,200,235,.55);cursor:pointer;padding:8px;
}
.fz3-skip2:hover{color:#9fefff}

/* ---------- 左下角坞 ---------- */

/* ———————————————————— */
.fz3-voice{
  display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;
  border-radius:50%;border:1px solid transparent;background:transparent;cursor:pointer;
  color:rgba(170,198,228,.72);transition:color .18s ease,background .18s ease,border-color .18s ease,box-shadow .2s ease;
}
.fz3-voice svg{width:15px;height:15px}
.fz3-voice:hover{color:#9ff0ff;background:rgba(87,232,255,.1);border-color:rgba(87,232,255,.35);box-shadow:0 0 16px -6px rgba(87,232,255,.9)}
.fz3-voice[data-state="busy"]{color:var(--fz3-amber);animation:fz3-blink 1.1s steps(2) infinite}
.fz3-voice[data-state="play"]{color:var(--fz3-cyan);text-shadow:0 0 10px var(--fz3-cyan)}

/* ———————————————————— */
/* 官方字标是 SVG（没有文本节点）：按 CSS Module 的语义后缀直接隐掉，
   再由 .fz3-sb-brand 在同一位置画 Fairy 字标。 */
[class*="_brandName"],[class*="_brandMark"]{visibility:hidden!important}

.fz3-sb-brand{position:fixed;left:var(--fz3-brand-left,10px);top:var(--fz3-brand-top,52px);width:262px;height:var(--fz3-brand-h,46px);padding:0 10px;border-radius:11px;display:flex;align-items:center;gap:11px;pointer-events:none;z-index:4;background:transparent;box-shadow:none;border-radius:0;
  opacity:0;transition:opacity .6s ease .35s}
.fz3-layer[data-phase="dock"] .fz3-sb-brand{opacity:1}
.fz3-sb-logo{width:22px;height:22px;flex:0 0 22px;display:block}
.fz3-sb-logo svg{width:100%;height:100%;display:block}
.fz3-sb-text{display:flex;flex-direction:column;gap:3px;min-width:0}
.fz3-sb-text b{font-size:19px;font-weight:700;letter-spacing:.02em;color:#f2f5ff;line-height:1;
  font-family:"Palatino Linotype","Songti SC",Georgia,serif;font-style:italic}
.fz3-sb-text i{font-style:normal;font-size:8.5px;letter-spacing:.16em;color:rgba(150,168,220,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.fz3-rim{position:fixed;left:-90px;top:-140px;width:560px;height:560px;pointer-events:none;
  background:radial-gradient(closest-side,rgba(126,92,255,.16),rgba(70,60,220,.05) 58%,transparent 76%);filter:blur(8px)}
.fz3-bay{position:fixed;left:50%;bottom:-190px;width:980px;height:400px;transform:translateX(-50%);pointer-events:none;
  background:radial-gradient(closest-side,rgba(74,96,255,.16),rgba(60,50,200,.05) 60%,transparent 78%)}
.fz3-atmos{position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden;mix-blend-mode:screen;opacity:.75}
.fz3-atmos-frame{position:absolute;inset:9px;border:1px solid rgba(87,232,255,.06)}
.fz3-atmos-frame::before,.fz3-atmos-frame::after{content:"";position:absolute;width:16px;height:16px;border:1px solid rgba(87,232,255,.22)}
.fz3-atmos-frame::before{left:-1px;top:-1px;border-right:0;border-bottom:0}
.fz3-atmos-frame::after{right:-1px;bottom:-1px;border-left:0;border-top:0}
/* 两团氛围光原本各带一层大半径滤镜（blur 34px / 20px），在整块屏幕尺寸上常驻栅格化；
   径向渐变本身已经是软过渡，去掉滤镜后观感几乎不变，但这块不再需要离屏滤镜。 */
.fz3-atmos-glow{position:absolute;left:-12%;top:-26%;width:64%;height:70%;background:radial-gradient(circle,rgba(70,52,255,.16),rgba(60,46,240,.05) 52%,transparent 78%);opacity:.55;transform:scale(1)}
.fz3-atmos-flash{position:absolute;right:4%;top:2%;width:34%;height:30%;background:radial-gradient(ellipse at 60% 20%,rgba(120,190,255,.16),rgba(100,160,255,.04) 42%,transparent 72%);animation:fz3-flash 11s steps(1) infinite}

@keyframes fz3-line{to{opacity:1;transform:none}}
@keyframes fz3-blink{50%{opacity:.3}}
/* fz3-breathe（氛围光 14s 呼吸）改由 JS 环境时钟按余弦曲线写入 opacity/scale；
   原 CSS 动画在 .fz3-atmos 全屏 mix-blend-mode 层里，每帧都要重做整屏混合。 */
@keyframes fz3-flash{0%,38%,41%,63%,100%{opacity:.35}39%,40%,64%{opacity:.85}}

@media (max-width:1180px){
  :root{--fz3-dock-size:112px}
}
@media (max-width:820px){
  :root{--fz3-dock-size:84px;--fz3-eye-cy:40vh}
  .fz3-copy{width:92vw}
  .fz3-copy-title{letter-spacing:.01em}
  .fz3-copy-lines{font-size:clamp(11px,2.55vw,15px);padding:0 18px;line-break:strict}
}
/* 矮视口：收掉次要行、压字号，保证眼睛与文案都完整在画面内 */
@media (max-height:620px){
  :root{--fz3-eye-cy:40vh}
  .fz3-copy-kicker{display:none}
  .fz3-copy-lines{font-size:clamp(12px,min(1.7vw,2.9vh),18px)}
  .fz3-copy-sub{display:none}
  .fz3-copy-sub.fz3-tap{display:block}
  .fz3-copy-title{margin-bottom:clamp(16px,3.2vh,30px)}
}
@media (max-height:460px){
  :root{--fz3-eye-cy:38vh;--fz3-eye:clamp(96px,min(26vmin,30vh),180px)}
  .fz3-copy-title::after{display:none}
  .fz3-copy-title-zh{display:none}
}

/* ==================================================================
 * v1.3.0 新增：浅色主题 / 用量气泡 / 眼徽拖拽 / 设置页分段开关
 * 性能约定：气泡只在展开时才挂载，并且去掉了参考实现的
 * backdrop-filter:blur()（整块区域模糊在高刷屏上每帧重算背景）改纯渐变；
 * 其余新增规则全部是静态声明，没有常驻动画。
 * ================================================================== */
:root{--fz3-mute:#9aa4d6;--fz3-line:rgba(120,170,255,.3)}

/* ---------- 浅色主题：宿主切浅色时 <html data-fz3-theme="light"> ---------- */
:root[data-fz3-theme="light"]{--fz3-cyan:#2f62e0;--fz3-text:#151b2f;--fz3-mute:#5c6684;--fz3-line:rgba(60,90,220,.18);color-scheme:light}
html[data-fz3-theme="light"],html[data-fz3-theme="light"] body{background:#eef3fc!important;color-scheme:light;color:var(--fz3-text)}
html[data-fz3-theme="light"] body::before{
  background:
    radial-gradient(42% 34% at 88% -6%,rgba(120,150,255,.34),transparent 68%),
    radial-gradient(34% 30% at 2% 4%,rgba(90,130,255,.24),transparent 70%),
    radial-gradient(48% 40% at 50% 118%,rgba(150,120,255,.20),transparent 66%),
    repeating-linear-gradient(-24deg,rgba(70,100,200,.05) 0 1px,transparent 1px 132px),
    linear-gradient(160deg,#f8fbff 0%,#eaf0ff 52%,#f3f6ff 100%);
}
html[data-fz3-theme="light"] body::after{
  background-image:linear-gradient(rgba(70,110,220,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(70,110,220,.08) 1px,transparent 1px);
  background-size:48px 48px,48px 48px;
}
html[data-fz3-theme="light"] ::selection{background:rgba(61,91,240,.22);color:#0d1424}
html[data-fz3-theme="light"] .fz3-brandname b{color:#0f1730!important;text-shadow:0 0 12px rgba(96,132,255,.35)!important}
html[data-fz3-theme="light"] .fz3-brandname i{color:rgba(68,96,166,.9)!important}
html[data-fz3-theme="light"] .fz3-sb-text b{color:#101a35!important;text-shadow:0 0 10px rgba(96,132,255,.28)!important}
html[data-fz3-theme="light"] .fz3-sb-text i{color:rgba(70,98,166,.9)!important}
html[data-fz3-theme="light"] .fz3-brandmark-eye,html[data-fz3-theme="light"] .fz3-hero-brand-eye{filter:drop-shadow(0 0 7px rgba(70,110,230,.42))}
html[data-fz3-theme="light"] .fz3-tag,html[data-fz3-theme="light"] .fz3-tag b{color:rgba(40,62,120,.9)!important;text-shadow:none!important}
html[data-fz3-theme="light"] .fz3-tag i{color:rgba(70,92,150,.85)!important}
html[data-fz3-theme="light"] .fz3-set{color:#16213a}
html[data-fz3-theme="light"] .fz3-set-name{color:#0f1730}
html[data-fz3-theme="light"] .fz3-set-sub,html[data-fz3-theme="light"] .fz3-set-desc{color:#5c6b8f}
html[data-fz3-theme="light"] .fz3-set-row{background:rgba(255,255,255,.72);border-color:rgba(60,90,220,.16)}
html[data-fz3-theme="light"] .fz3-set-btn{color:#1b2a4a;background:rgba(47,85,232,.10);border-color:rgba(70,110,230,.34)}
html[data-fz3-theme="light"] .fz3-set-btn:hover:not(:disabled){background:rgba(47,85,232,.18);border-color:rgba(70,110,230,.55)}
html[data-fz3-theme="light"] .fz3-set-btn.is-ghost{background:rgba(255,255,255,.6);border-color:rgba(120,140,200,.34)}
html[data-fz3-theme="light"] .fz3-set-input{color:#18203a;background:rgba(255,255,255,.9);border-color:rgba(60,90,220,.22)}
html[data-fz3-theme="light"] .fz3-set-note{color:#65759b}
html[data-fz3-theme="light"] .fz3-set-switch{background:rgba(120,150,200,.25);border-color:rgba(60,90,220,.25)}
html[data-fz3-theme="light"] .fz3-set-switch::after{background:#fff;box-shadow:0 1px 3px rgba(20,40,90,.28)}
html[data-fz3-theme="light"] .fz3-set-switch[data-on="1"]::after{background:#04121f;box-shadow:none}

/* ---------- 设置页分段开关（外观：跟随 / 深色 / 浅色） ---------- */
.fz3-set-seg{display:inline-flex;gap:4px;padding:3px;border-radius:10px;background:rgba(9,13,22,.72);border:1px solid rgba(130,160,210,.18);flex:none}
.fz3-set-segbtn{font:inherit;font-size:11.5px;padding:5px 11px;border-radius:8px;border:1px solid transparent;background:transparent;color:#9fb2cb;cursor:pointer;transition:background .16s ease,color .16s ease,border-color .16s ease}
.fz3-set-segbtn:hover{color:#e8f2ff}
.fz3-set-segbtn[data-on="1"]{color:#04121f;background:linear-gradient(90deg,#2f7bff,#57e8ff);border-color:rgba(120,225,255,.6)}
html[data-fz3-theme="light"] .fz3-set-seg{background:rgba(255,255,255,.78);border-color:rgba(60,90,220,.18)}
html[data-fz3-theme="light"] .fz3-set-segbtn{color:#5c6b8f}
html[data-fz3-theme="light"] .fz3-set-segbtn:hover{color:#141a2e}

/* ---------- 眼徽交互：点一下弹用量气泡，按住可以拖到任意位置 ---------- */
.fz3-layer[data-phase="dock"] .fz3-core{pointer-events:auto;cursor:pointer}
.fz3-layer[data-drag="1"][data-phase="dock"] .fz3-core{cursor:grab;touch-action:none}
.fz3-layer[data-dragging="1"][data-phase="dock"] .fz3-core{transition:none;cursor:grabbing;will-change:transform}
.fz3-layer[data-dragging="1"][data-phase="dock"] .fz3-core svg{transition:none;transform:none}
/* 拖动期临时关掉最贵的两处合成：300% 的脉冲环与全屏 mix-blend 氛围层（松手即恢复） */
.fz3-layer[data-dragging="1"] .fz3-eye-pulse{display:none}
.fz3-layer[data-dragging="1"] .fz3-atmos{mix-blend-mode:normal}
.fz3-eye-svg{transition:transform .28s ease}
.fz3-layer[data-phase="dock"] .fz3-core:hover .fz3-eye-svg{transform:scale(1.07)}

/* ---------- 用量气泡 ---------- */
.fz3-bubble{
  position:fixed;z-index:9002;pointer-events:auto;width:236px;padding:12px 14px 11px;border-radius:14px;
  background:linear-gradient(160deg,rgba(12,26,70,.97),rgba(5,12,34,.97));
  border:1px solid rgba(120,170,255,.3);
  box-shadow:0 18px 44px -18px rgba(0,0,0,.85),inset 0 0 0 1px rgba(120,170,255,.06),0 0 32px -12px rgba(90,140,255,.55);
  color:var(--fz3-text);font-family:var(--fz3-font);font-size:12px;line-height:1.55;
  transform:translateY(-50%);animation:fz3-bubble-in .18s ease-out both;
}
.fz3-bubble::after{
  content:"";position:absolute;left:-5px;top:50%;width:10px;height:10px;margin-top:-5px;transform:rotate(45deg);
  background:linear-gradient(160deg,rgba(12,26,70,.97),rgba(5,12,34,.97));
  border-left:1px solid rgba(120,170,255,.3);border-bottom:1px solid rgba(120,170,255,.3);
}
.fz3-bubble[data-side="left"]{animation-name:fz3-bubble-in-left}
.fz3-bubble[data-side="left"]::after{left:auto;right:-5px;border-left:0;border-bottom:0;border-right:1px solid rgba(120,170,255,.3);border-top:1px solid rgba(120,170,255,.3)}
.fz3-bubble-head{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8fb4ff;margin-bottom:7px}
.fz3-bubble[data-mode="turn"] .fz3-bubble-head{color:#ffd98a}
.fz3-bubble-row{display:flex;align-items:baseline;justify-content:space-between;gap:18px}
.fz3-bubble-row + .fz3-bubble-row{margin-top:3px}
.fz3-bubble-k{color:var(--fz3-mute)}
.fz3-bubble-v{font-variant-numeric:tabular-nums;color:#eaf4ff}
.fz3-bubble-v b{font-weight:600}
.fz3-bubble-sub{margin-top:7px;font-size:10px;line-height:1.5;color:rgba(154,164,214,.85)}
.fz3-bubble[data-loading="1"] .fz3-bubble-v{opacity:.35}
.fz3-peak{display:inline-flex;align-items:center;gap:7px}
.fz3-peak-badge{width:19px;height:19px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;line-height:1;color:#fff;background:#2ec25f;box-shadow:0 0 12px rgba(46,194,95,.45)}
.fz3-peak-badge[data-tone="peak"]{background:#f0a13a;box-shadow:0 0 12px rgba(240,161,58,.45)}
.fz3-peak-clock{font-family:"Cascadia Code","JetBrains Mono",Consolas,monospace;font-size:12.5px;font-weight:700;letter-spacing:.06em;color:#3ed873;border-bottom:1px solid rgba(62,216,115,.35)}
.fz3-peak-clock[data-tone="peak"]{color:#ffb45c;border-bottom-color:rgba(255,180,92,.35)}
@keyframes fz3-bubble-in{from{opacity:0;transform:translateY(-50%) translateX(-6px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
@keyframes fz3-bubble-in-left{from{opacity:0;transform:translateY(-50%) translateX(6px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
html[data-fz3-theme="light"] .fz3-bubble{
  background:linear-gradient(160deg,rgba(255,255,255,.99),rgba(240,246,255,.99));
  border-color:rgba(60,90,220,.24);
  box-shadow:0 18px 44px -20px rgba(30,60,140,.55),inset 0 0 0 1px rgba(255,255,255,.8);
  color:#141a2e;
}
html[data-fz3-theme="light"] .fz3-bubble::after{background:linear-gradient(160deg,rgba(255,255,255,.99),rgba(240,246,255,.99));border-color:rgba(60,90,220,.24)}
html[data-fz3-theme="light"] .fz3-bubble-head{color:#2f5fe0}
html[data-fz3-theme="light"] .fz3-bubble[data-mode="turn"] .fz3-bubble-head{color:#a76a06}
html[data-fz3-theme="light"] .fz3-bubble-v{color:#111a33}
html[data-fz3-theme="light"] .fz3-bubble-sub{color:rgba(72,86,130,.9)}
html[data-fz3-theme="light"] .fz3-peak-badge{box-shadow:none}
html[data-fz3-theme="light"] .fz3-peak-clock{color:#128a4a;border-bottom-color:rgba(18,138,74,.3)}
html[data-fz3-theme="light"] .fz3-peak-clock[data-tone="peak"]{color:#b56a00;border-bottom-color:rgba(181,106,0,.3)}
`

    /* ------------------------------------------------------------------ *
     * 图标
     * ------------------------------------------------------------------ */
    /* FZ3_RUNTIME_BEGIN */
    /* —— Fairy 大眼待机运行时（移植自 Fairy-DSH）——
     * 来源：mascot-runtime.js / mascot-motion-clock.js / mascot-event-scheduler.js
     * （Apache-2.0，Copyright 2026 Chengzhibense，见 NOTICE-fairy-dsh.md）。
     * 移植点：1440ms 单相位时钟、四层眼球呼吸、睫毛 15s 旋转、4s 五圈脉冲、眼闪、
     *         threads/blocks 随机故障、表情切换两段故障；页面隐藏时暂停（不做 reduced-motion 降级）。
     *
     * 性能约定（本插件性能优化重点）：四层眼球呼吸 / 睫毛旋转 / 五圈脉冲现在全部由 CSS
     * @keyframes 驱动（fz3-breath-a..d / fz3-corners / fz3-lash-pulse），思考态裁切形状固定；
     * 运行时不再持有 requestAnimationFrame 主循环，也不再逐帧写
     * style.transform —— 待机时主线程没有任何逐帧 JS 唤醒。这里只负责离散事件：
     * 随机花屏、眼闪、表情切换故障，单次几十到几百毫秒，事件之间靠 setTimeout 静默。 */
    /* 睫毛旋转周期（参考实现 15s/圈）：与 CSS 里 .fz3-eye #corners 的 animation-duration 必须一致。
       切块故障结束时要用它把暂停的旋转按当前角度接回时间线，写错会让睫毛在故障后跳一下。 */
    const FZ3_LASH_PERIOD_S = 15
    const FZ3_FAULT = {
      /* 按参考文档：threads 4 拍 / 30–42ms 间隔 / 34–76ms 收尾；
         blocks 2 或 4 拍 / 56–104ms 间隔 / 48–96ms 收尾。 */
      threads: { pulses: 4, gapMin: 30, gapMax: 42, fadeMin: 34, fadeMax: 76 },
      blocks: { gapMin: 56, gapMax: 104, fadeMin: 48, fadeMax: 96 },
    }
    /* 花屏视觉的硬上限：超过这个时间仍未收尾就强制清掉。 */
    const FZ3_GLITCH_MAX_MS = 900
    const fz3Random = (min, max) => min + Math.random() * (max - min)

    const fz3Scheduler = (() => {
      const tasks = new Map()
      return {
        schedule(name, callback, delay) {
          const previous = tasks.get(name)
          if (previous) clearTimeout(previous.timer)
          const entry = { timer: 0 }
          entry.timer = setTimeout(() => {
            if (tasks.get(name) !== entry) return
            tasks.delete(name)
            callback()
          }, Math.max(0, Number(delay) || 0))
          tasks.set(name, entry)
          return entry.timer
        },
        cancel(name) {
          const entry = tasks.get(name)
          if (!entry) return
          clearTimeout(entry.timer)
          tasks.delete(name)
        },
        has: (name) => tasks.has(name),
        cancelAll() {
          for (const name of [...tasks.keys()]) this.cancel(name)
        },
      }
    })()

    /* 运行时是单例：同一时间只有一个舞台大眼。 */
    const fz3EyeRuntime = (() => {
      const glitchVars = ['--fz3-g-x', '--fz3-g-skew', '--fz3-g-bright', '--fz3-g-contrast',
        '--fz3-g-s1-x', '--fz3-g-s2-x', '--fz3-g-s3-x', '--fz3-g-s4-x', '--fz3-g-s5-x']
      const flickerVars = ['--fz3-flicker-ms', '--fz3-flicker-1', '--fz3-flicker-mid', '--fz3-flicker-2']
      let root = null
      let bands = []
      let noise = null
      let displace = null
      let glitchToken = 0
      let flickerToken = 0
      let transitionToken = 0
      let lastMode = Math.random() < 0.5 ? 'threads' : 'blocks'
      let appliedState = null
      let state = 'normal'
      let suspended = false
      let bound = false

      const elementUnit = () => ((root && root.clientWidth) || 200) / 162

      const ensureFilter = () => {
        if (typeof document === 'undefined') return
        if (!document.getElementById('fz3-threads-defs')) {
          const holder = document.createElement('div')
          holder.setAttribute('aria-hidden', 'true')
          holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
          holder.innerHTML = FAIRY_THREADS_SVG
          document.body.appendChild(holder)
        }
        noise = document.getElementById('fz3-noise')
        displace = document.getElementById('fz3-displace')
      }

      const cache = (el) => {
        root = el
        /* 5 条故障切片只在 blocks 花屏时可见，顺带缓存，避免每次花屏再查询。 */
        bands = Array.from(root.querySelectorAll('.fz3-gband'))
        ensureFilter()
      }

      /* 切块花屏时暂停睫毛旋转，并把当前角度/周期写进 CSS 变量，清除后能接回原时间线。
         旋转本身由 CSS 驱动（不再由 JS 逐帧写 transform），这里只在故障开始前读一次。 */
      const lockLashFrame = () => {
        if (!root) return
        const corners = root.querySelector('.fz3-eye-svg #corners')
        if (!corners) return
        let angle = 0
        try {
          const matrix = getComputedStyle(corners).transform
          const match = matrix && matrix.match(/^matrix\(([^)]+)\)$/)
          if (match) {
            const values = match[1].split(',')
            const a = parseFloat(values[0])
            const b = parseFloat(values[1])
            if (Number.isFinite(a) && Number.isFinite(b)) angle = Math.atan2(b, a) * 180 / Math.PI
          }
        } catch {}
        const normalized = (angle + 360) % 360
        root.style.setProperty('--fz3-lash-angle', normalized.toFixed(3) + 'deg')
        /* 从当前生效的 CSS 时间线取周期；拿不到时退回常量，保证恢复旋转时角度连续。 */
        let period = FZ3_LASH_PERIOD_S
        try {
          const duration = parseFloat(getComputedStyle(corners).animationDuration)
          if (Number.isFinite(duration) && duration > 0) period = duration
        } catch {}
        root.style.setProperty('--fz3-lash-delay', (-normalized / 360 * period).toFixed(4) + 's')
      }

      const clearGlitch = () => {
        if (!root) return
        fz3Scheduler.cancel('glitch-watch')
        root.removeAttribute('data-glitch')
        root.removeAttribute('data-transition-glitch')
        for (const name of glitchVars) root.style.removeProperty(name)
      }

      /* 兜底：故障视觉最多保留 FZ3_GLITCH_MAX_MS，定时器丢失/DOM 异常时也不会一直挂着。 */
      const armGlitchWatchdog = () => {
        /* 每拍都重新计时：主线程卡顿（长帧、截图）时不会把还在播的故障提前清掉。 */
        fz3Scheduler.cancel('glitch-watch')
        fz3Scheduler.schedule('glitch-watch', () => {
          if (!root) return
          clearGlitch()
          if (!suspended && state === 'normal') scheduleGlitch()
        }, FZ3_GLITCH_MAX_MS)
      }

      /* 单拍故障：threads 只做水平位移；blocks 给 5 个切片交替极性的位移。 */
      const setPulse = (mode, strong) => {
        if (!root) return
        const unit = elementUnit()
        const style = root.style
        armGlitchWatchdog()
        /* 文档的视觉变量范围：待机 x ±0.9px / skew ±0.24deg / bright 1.02–1.14 / contrast 1.02–1.16；
           转场加强为 x ±1.6px / skew ±0.32deg / bright 1.06–1.18 / contrast 1.08–1.22。 */
        style.setProperty('--fz3-g-x', (fz3Random(strong ? -1.6 : -0.9, strong ? 1.6 : 0.9) * unit).toFixed(2) + 'px')
        style.setProperty('--fz3-g-skew', fz3Random(strong ? -0.32 : -0.24, strong ? 0.32 : 0.24).toFixed(2) + 'deg')
        style.setProperty('--fz3-g-bright', fz3Random(strong ? 1.06 : 1.02, strong ? 1.18 : 1.14).toFixed(2))
        style.setProperty('--fz3-g-contrast', fz3Random(strong ? 1.08 : 1.02, strong ? 1.22 : 1.16).toFixed(2))
        if (mode === 'threads') {
          const begins = root.getAttribute('data-glitch') !== 'threads'
          if (begins && noise) {
            noise.setAttribute('seed', String(Math.floor(fz3Random(1, 999))))
            noise.setAttribute('baseFrequency',
              (fz3Random(0.004, 0.011) / unit).toFixed(4) + ' ' + (fz3Random(strong ? 0.78 : 0.65, strong ? 1.18 : 1) / unit).toFixed(3))
          }
          if (begins && displace) {
            displace.setAttribute('scale', (fz3Random(strong ? 30 : 17, strong ? 46 : 29) * unit).toFixed(1))
          }
        } else {
          /* 进入切块档时锁一次睫毛角度；已在切块档内则沿用。 */
          if (root.getAttribute('data-glitch') !== 'blocks') lockLashFrame()
          const polarity = Math.random() < 0.5 ? -1 : 1
          const strength = fz3Random(strong ? 4.2 : 1.4, strong ? 6.8 : 3) * unit
          for (let i = 1; i <= 5; i += 1) {
            const direction = i % 2 === 0 ? polarity : -polarity
            const offset = direction * (strength + fz3Random(-0.35, 0.35))
            style.setProperty('--fz3-g-s' + i + '-x', offset.toFixed(2) + 'px')
          }
        }
        root.setAttribute('data-glitch', mode)
      }

      /* 每次 blocks 故障重新划分 5 条高度略随机的横切片（viewBox 12..148 / 160）。 */
      const layoutBlocks = () => {
        const weights = []
        let total = 0
        for (let i = 0; i < 5; i += 1) {
          const weight = fz3Random(0.9, 1.1)
          weights.push(weight)
          total += weight
        }
        let y = 12
        for (let i = 0; i < 5; i += 1) {
          const band = bands[i]
          if (!band) continue
          const height = i === 4 ? 148 - y : 136 * weights[i] / total
          const top = (y + 1) / 162 * 100
          const bottom = 100 - (y + height + 1) / 162 * 100
          band.style.clipPath = 'inset(' + top.toFixed(3) + '% 0 ' + bottom.toFixed(3) + '% 0)'
          y += height
        }
      }

      const stopFlicker = () => {
        flickerToken += 1
        fz3Scheduler.cancel('flicker')
        if (!root) return
        root.removeAttribute('data-flicker')
        for (const name of flickerVars) root.style.removeProperty(name)
      }

      const flickerOnce = () => {
        if (!root) return
        const duration = fz3Random(155, 255)
        root.style.setProperty('--fz3-flicker-ms', duration.toFixed(0) + 'ms')
        root.style.setProperty('--fz3-flicker-1', fz3Random(0.026, 0.048).toFixed(3))
        root.style.setProperty('--fz3-flicker-mid', fz3Random(0.006, 0.016).toFixed(3))
        root.style.setProperty('--fz3-flicker-2', fz3Random(0.018, 0.040).toFixed(3))
        root.setAttribute('data-flicker', '1')
        fz3Scheduler.schedule('flicker', () => {
          if (!root) return
          root.removeAttribute('data-flicker')
          scheduleFlicker()
        }, duration)
      }

      const scheduleFlicker = () => {
        if (!root || suspended || state !== 'normal' || fz3Scheduler.has('flicker')) return
        const token = flickerToken
        fz3Scheduler.schedule('flicker', () => {
          if (!root || suspended || state !== 'normal' || token !== flickerToken) return
          flickerOnce()
        }, fz3Random(1750, 3600))
      }

      const stopGlitch = () => {
        glitchToken += 1
        transitionToken += 1
        fz3Scheduler.cancel('glitch')
        fz3Scheduler.cancel('transition')
        clearGlitch()
        stopFlicker()
      }

      const scheduleGlitch = () => {
        /* 随机花屏在任何表情状态下都可能出现（与上游一致），单次时长由 FZ3_FAULT 控制。 */
        if (!root || suspended || fz3Scheduler.has('glitch')) return
        const token = glitchToken
        fz3Scheduler.schedule('glitch', () => {
          if (!root || suspended || token !== glitchToken) return
          const mode = lastMode === 'threads' ? 'blocks' : 'threads'
          lastMode = mode
          if (mode === 'blocks') layoutBlocks()
          const pulseCount = mode === 'threads' ? FZ3_FAULT.threads.pulses : 2 * (1 + Math.floor(Math.random() * 2))
          let index = 0
          const pulse = () => {
            if (!root || suspended || token !== glitchToken) return
            setPulse(mode, false)
            index += 1
            if (index < pulseCount) {
              fz3Scheduler.schedule('glitch', pulse, fz3Random(FZ3_FAULT[mode].gapMin, FZ3_FAULT[mode].gapMax))
            } else {
              fz3Scheduler.schedule('glitch', () => {
                if (!root || token !== glitchToken) return
                clearGlitch()
                scheduleGlitch()
              }, fz3Random(FZ3_FAULT[mode].fadeMin, FZ3_FAULT[mode].fadeMax))
            }
          }
          pulse()
        }, fz3Random(2300, 4600))
      }

      /* 表情切换的两段式故障：2 拍 threads -> 28ms -> 6 拍（前 2 拍 blocks）-> 28ms。 */
      const playStateTransition = () => {
        if (!root || suspended) return
        stopGlitch()
        const token = ++transitionToken
        /* 参考实现用 data-transition-glitch 给整段转场叠加更强的拉丝/亮度档。 */
        root.setAttribute('data-transition-glitch', '')
        const burst = (pulseCount, blockCount, clearAtEnd, done) => {
          let index = 0
          const pulse = () => {
            if (!root || token !== transitionToken) return
            if (index < blockCount) {
              if (index === 0) layoutBlocks()
              setPulse('blocks', true)
            } else {
              setPulse('threads', true)
            }
            index += 1
            if (index < pulseCount) {
              fz3Scheduler.schedule('transition', pulse, 40)
            } else {
              fz3Scheduler.schedule('transition', () => {
                if (!root || token !== transitionToken) return
                if (clearAtEnd) clearGlitch()
                done()
              }, 28)
            }
          }
          pulse()
        }
        /* 第一段保留故障画面衔接到第二段；第二段播完才清除（与上游 keepVisual 语义一致）。 */
        burst(2, 0, false, () => {
          if (!root || token !== transitionToken) return
          burst(6, 2, true, () => {
            if (!root || token !== transitionToken) return
            scheduleGlitch()
            scheduleFlicker()
          })
        })
      }

      const normalizeState = (next) => (next === 'thinking' || next === 'working' ? 'thinking' : next === 'comforting' ? 'comforting' : 'normal')

      const setState = (next) => {
        if (!root) return
        const normalized = normalizeState(next)
        if (appliedState === normalized && state === normalized) {
          if (!suspended) scheduleGlitch()
          return
        }
        const changed = appliedState !== null && appliedState !== normalized
        state = normalized
        appliedState = normalized
        /* 半闭眼只由 clipPath 状态控制；形状固定，不做逐帧呼吸。 */
        if (normalized === 'thinking') root.setAttribute('data-lid', 'thinking')
        else root.removeAttribute('data-lid')
        if (suspended) return
        if (changed) {
          playStateTransition()
        } else {
          scheduleGlitch()
          scheduleFlicker()
        }
      }

      const suspend = () => {
        if (suspended || !root) return
        suspended = true
        stopGlitch()
        stopFlicker()
        root.setAttribute('data-fz3-suspended', '')
      }
      const resume = () => {
        if (!suspended || !root) return
        suspended = false
        root.removeAttribute('data-fz3-suspended')
        scheduleGlitch()
        scheduleFlicker()
      }
      const onVisibility = () => {
        if (!root) return
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') suspend()
        else resume()
      }
      const onPageHide = () => suspend()
      const onPageShow = () => resume()

      const mount = (el) => {
        unmount()
        if (!el || typeof document === 'undefined') return
        bound = true
        cache(el)
        suspended = false
        appliedState = null
        state = 'normal'
        document.addEventListener('visibilitychange', onVisibility)
        window.addEventListener('pagehide', onPageHide)
        window.addEventListener('pageshow', onPageShow)
        scheduleGlitch()
        scheduleFlicker()
      }

      const unmount = () => {
        stopGlitch()
        stopFlicker()
        if (root) root.removeAttribute('data-fz3-suspended')
        if (bound) {
          document.removeEventListener('visibilitychange', onVisibility)
          window.removeEventListener('pagehide', onPageHide)
          window.removeEventListener('pageshow', onPageShow)
        }
        bound = false
        root = null
        bands = []
        appliedState = null
        suspended = false
      }

      return { mount, unmount, setState, suspend, resume }
    })()
    /* FZ3_RUNTIME_END */

    /* 待机小动作全部移入上面的单相位运行时；这里只负责把舞台 DOM 交给它。 */
    const bootHooks = new Set()
    /* shell.overlay 重挂载（路由切换/设置页刷新）不应该再播一遍开机 + 问候 */
    let bootPlayed = false

    /* memo：FairySkin 会因为阶段/情绪/语音状态重渲染，眼睛本身（含 6 份内联 SVG）不需要跟着重渲染。 */
    const CoreGlyph = React.memo(function CoreGlyph({ mood }) {
      const eyeRef = useRef(null)
      useEffect(() => {
        if (!eyeRef.current) return undefined
        fz3EyeRuntime.mount(eyeRef.current)
        return () => fz3EyeRuntime.unmount()
      }, [])
      useEffect(() => {
        if (!eyeRef.current) return
        fz3EyeRuntime.setState(mood)
      }, [mood])
      return h(
        'div',
        { className: 'fz3-eye', ref: eyeRef },
        h('span', { className: 'fz3-eye-halo', 'aria-hidden': 'true' }),
        h('span', { className: 'fz3-eye-pulse', 'aria-hidden': 'true', dangerouslySetInnerHTML: { __html: FAIRY_PULSE_SVG } }),
        h('div', { className: 'fz3-eye-svg', 'aria-hidden': 'true', dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG } }),
        h(
          'span',
          { className: 'fz3-glitch', 'aria-hidden': 'true' },
          [0, 1, 2, 3, 4].map((index) => h(
            'span',
            { key: index, className: 'fz3-gband', 'data-slice': String(index + 1) },
            h('span', { dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG } }),
          )),
        ),
        h('span', { className: 'fz3-eye-flicker', 'aria-hidden': 'true' }),
        h('span', { className: 'fz3-eye-flash', 'aria-hidden': 'true' }),
      )
    })

    /* 设置页：语音开关、引擎状态、重播问候 / 重播开机 / 测试语音 / 停止 */
    function FairySettings() {
      const voiceState = useVoice()
      const [engine, setEngine] = useState(null)
      const [engineBusy, setEngineBusy] = useState('')
      /* 切走设置页时：取消在途 health 请求、清掉引擎操作留下的重测定时器 */
      const aliveRef = useRef(true)
      const engineTimer = useRef([])
      const pingAbort = useRef(null)
      useEffect(() => {
        aliveRef.current = true
        return () => {
          aliveRef.current = false
          if (pingAbort.current) {
            try {
              pingAbort.current.abort()
            } catch (e) {}
          }
          for (const timer of engineTimer.current) clearTimeout(timer)
          engineTimer.current = []
        }
      }, [])
      /* 眼徽：拖动 / 显隐 / 外观。三项都写 localStorage，再广播自定义事件让皮肤图层立刻响应 */
      const [dragPref, setDragPref] = useState(() => readBool(DRAG_KEY, true))
      const [eyeHidden, setEyeHidden] = useState(() => readBool(EYE_KEY, false))
      const [hasCustomPos, setHasCustomPos] = useState(() => {
        const saved = readStored(POS_KEY, null)
        return !!(saved && Number.isFinite(saved.x) && Number.isFinite(saved.y))
      })
      const toggleDrag = () => {
        const next = !dragPref
        setDragPref(next)
        writeStored(DRAG_KEY, next)
        try { window.dispatchEvent(new Event('fz3:drag-pref')) } catch (e) {}
      }
      const toggleEye = () => {
        const next = !eyeHidden
        setEyeHidden(next)
        writeStored(EYE_KEY, next)
        try { window.dispatchEvent(new Event('fz3:eye-pref')) } catch (e) {}
      }
      const [themeMode, setThemeMode] = useState(() => readStored(THEME_KEY, 'auto'))
      const pickTheme = (mode) => {
        setThemeMode(mode)
        writeStored(THEME_KEY, mode)
        try { window.dispatchEvent(new Event('fz3:theme-pref')) } catch (e) {}
      }
      const resetDockPos = () => {
        try { localStorage.removeItem(POS_KEY) } catch (e) {}
        setHasCustomPos(false)
        try { window.dispatchEvent(new Event('fz3:dock-reset')) } catch (e) {}
      }

      const ping = useCallback(() => {
        if (pingAbort.current) {
          try {
            pingAbort.current.abort()
          } catch (e) {}
        }
        const controller = typeof AbortController === 'function' ? new AbortController() : null
        pingAbort.current = controller
        fetch('/fairy-zzz/health', { cache: 'no-store', signal: controller ? controller.signal : undefined })
          .then((res) => res.json())
          .then((data) => {
            if (aliveRef.current) setEngine(data)
          })
          .catch(() => {
            if (aliveRef.current && (!controller || !controller.signal.aborted)) setEngine({ ok: false, engine: false })
          })
      }, [])
      useEffect(() => {
        ping()
        let timer = null
        const start = () => {
          if (!timer) timer = setInterval(ping, 5000)
        }
        const stop = () => {
          if (timer) {
            clearInterval(timer)
            timer = null
          }
        }
        /* 后台标签页不轮询：隐藏时停掉 5s 一次的健康检查，可见时立刻补一次。 */
        const onVis = () => {
          if (document.visibilityState === 'hidden') stop()
          else {
            ping()
            start()
          }
        }
        document.addEventListener('visibilitychange', onVis)
        start()
        return () => {
          stop()
          document.removeEventListener('visibilitychange', onVis)
        }
      }, [ping])
      const [voiceHome, setVoiceHome] = useState('')
      const [voiceInfo, setVoiceInfo] = useState(null)
      const [voiceHomeBusy, setVoiceHomeBusy] = useState('')
      const loadVoiceHome = useCallback(() => {
        fetch('/fairy-zzz/voice-home', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (!data) return
            setVoiceInfo(data)
            setVoiceHome(data.home || '')
          })
          .catch(() => {})
      }, [])
      useEffect(() => {
        loadVoiceHome()
      }, [loadVoiceHome])
      /* 宿主还没有 voice-home 路由时（旧版本），至少把当前引擎目录显示出来 */
      useEffect(() => {
        if (voiceInfo) return
        const home = (engine && engine.engineHome) || ''
        if (home && !voiceHome) setVoiceHome(home)
      }, [engine, voiceInfo, voiceHome])
      const saveVoiceHome = useCallback(
        (home) => {
          setVoiceHomeBusy('save')
          fetch('/fairy-zzz/voice-home', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ home: String(home ?? '') }),
          })
            .then((r) => {
              if (r.status === 404) {
                return { ok: false, reason: '宿主还在跑旧版本，重启 DSH 之后这里才能保存' }
              }
              return r.json().catch(() => null)
            })
            .then((data) => {
              if (data) setVoiceInfo(data)
              setVoiceHome((data && data.home) || '')
              ping()
            })
            .catch(() => {})
            .then(() => setVoiceHomeBusy(''))
        },
        [ping],
      )
      const controlEngine = useCallback(
        (action) => {
          if (!aliveRef.current) return
          setEngineBusy(action)
          fetch('/fairy-zzz/engine?action=' + action, { cache: 'no-store' })
            .catch(() => {})
            .then(() => {
              if (!aliveRef.current) return
              ping()
              /* 三个重测定时器记下来，设置页卸载时统一清掉，避免 stale setState */
              engineTimer.current.push(
                setTimeout(ping, 1500),
                setTimeout(ping, 4000),
                setTimeout(() => {
                  if (aliveRef.current) setEngineBusy('')
                }, 600),
              )
            })
        },
        [ping],
      )
      const busy = voiceState.busy || voiceState.speaking
      const ready = !!(engine && engine.ok && engine.engine)
      const enginePhase = (engine && engine.engineState) || (ready ? 'ready' : 'dead')
      const engineHome = (engine && engine.engineHome) || ''
      const engineText = busy
        ? '正在合成…'
        : voiceState.speaking
          ? '正在播放…'
          : enginePhase === 'ready'
            ? '已就绪 · GPT-SoVITS'
            : enginePhase === 'loading'
              ? '模型加载中，请稍候…'
              : enginePhase === 'error'
                ? '引擎报错：' + String((engine && engine.engineError) || '未知错误').slice(0, 80)
                : engineHome
                  ? '未运行（引擎在 ' + engineHome + '）'
                  : '未运行：没找到语音引擎'
      const setVoice = (enabled) => {
        patchVoice({ enabled: enabled })
        writeStored(VOICE_KEY, enabled)
        if (!enabled) stopSpeech()
      }
      const playGreet = () => {
        stopSpeech()
        const audio = new Audio(GREETING())
        preview = audio
        audio.onended = () => {
          if (preview === audio) preview = null
        }
        audio.play().catch(() => {})
      }
      const replayBoot = () => { bootHooks.forEach((fn) => { try { fn() } catch (e) {} }) }
      const testVoice = () => { speakText('测试中。主人，我的声音听起来还满意吗？不满意也请忍着，本系统就这一副嗓子。', { force: true }) }
      return h(
        'div',
        { className: 'fz3-set' },
        h(
          'div',
          { className: 'fz3-set-head' },
          h('span', { className: 'fz3-set-eye', 'aria-hidden': 'true', dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG } }),
          h(
            'div',
            null,
            h('div', { className: 'fz3-set-name' }, 'Fairy · Ⅲ型'),
            h('div', { className: 'fz3-set-sub' }, 'H.D.D 空洞深潜系统 · 皮肤与语音'),
          ),
        ),
        h(
          'div',
          { className: 'fz3-set-row' },
          h('div', null, h('div', { className: 'fz3-set-label' }, '自动朗读回复'), h('div', { className: 'fz3-set-desc' }, '助手回答完成后用 Fairy 的声音念出来')),
          h('button', {
            type: 'button',
            className: 'fz3-set-switch',
            'data-on': voiceState.enabled ? '1' : '0',
            'aria-pressed': !!voiceState.enabled,
            onClick: () => setVoice(!voiceState.enabled),
          }),
        ),
        h(
          'div',
          { className: 'fz3-set-row' },
          h('div', null, h('div', { className: 'fz3-set-label' }, '拖动眼徽'), h('div', { className: 'fz3-set-desc' }, '按住左下角的眼标可以拖到任意位置，点一下展开电费气泡')),
          h('button', {
            type: 'button',
            className: 'fz3-set-switch',
            'data-on': dragPref ? '1' : '0',
            'aria-pressed': !!dragPref,
            onClick: toggleDrag,
          }),
        ),
        h(
          'div',
          { className: 'fz3-set-row' },
          h('div', null, h('div', { className: 'fz3-set-label' }, '显示眼徽'), h('div', { className: 'fz3-set-desc' }, '关掉之后对话界面只留 Fairy 字标，不再显示状态眼标')),
          h('button', {
            type: 'button',
            className: 'fz3-set-switch',
            'data-on': eyeHidden ? '0' : '1',
            'aria-pressed': !eyeHidden,
            onClick: toggleEye,
          }),
        ),
        h(
          'div',
          { className: 'fz3-set-row' },
          h('div', null, h('div', { className: 'fz3-set-label' }, '外观'), h('div', { className: 'fz3-set-desc' }, themeMode === 'auto' ? '跟随 DSH 的深色 / 浅色设置' : themeMode === 'light' ? '强制浅色：不用再眯眼看白底' : '强制深色：夜里开机也不刺眼')),
          h(
            'div',
            { className: 'fz3-set-seg' },
            h('button', { type: 'button', className: 'fz3-set-segbtn', 'data-on': themeMode === 'auto' ? '1' : '0', onClick: () => pickTheme('auto') }, '跟随'),
            h('button', { type: 'button', className: 'fz3-set-segbtn', 'data-on': themeMode === 'dark' ? '1' : '0', onClick: () => pickTheme('dark') }, '深色'),
            h('button', { type: 'button', className: 'fz3-set-segbtn', 'data-on': themeMode === 'light' ? '1' : '0', onClick: () => pickTheme('light') }, '浅色'),
          ),
        ),
        h(
          'div',
          { className: 'fz3-set-row' },
          h('div', null, h('div', { className: 'fz3-set-label' }, '语音引擎'), h('div', { className: 'fz3-set-desc' }, engineText)),
          h('span', { className: 'fz3-set-dot' + (ready ? ' is-on' : enginePhase === 'loading' ? ' is-wait' : ' is-off') }),
        ),
        h(
          'div',
          { className: 'fz3-set-row is-stack' },
          h(
            'div',
            null,
            h('div', { className: 'fz3-set-label' }, '语音引擎目录'),
            h(
              'div',
              { className: 'fz3-set-desc' },
              voiceInfo && voiceInfo.ok
                ? (voiceInfo.source === 'settings' ? '已指定：' : voiceInfo.source === 'env' ? '来自环境变量：' : voiceInfo.source === 'portable' ? '便携包自带：' : '旧变量：') + (voiceInfo.home || '')
                : (voiceInfo && voiceInfo.reason) || '选一个装好 GPT-SoVITS 的目录，整个目录搬去哪都行',
            ),
          ),
          h(
            'div',
            { className: 'fz3-set-path' },
            h('input', {
              type: 'text',
              className: 'fz3-set-input',
              value: voiceHome,
              spellCheck: false,
              placeholder: '例如 D:\\Fairy\\tts 或 /opt/fairy-tts',
              onChange: (event) => setVoiceHome(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') saveVoiceHome(voiceHome)
              },
            }),
            h(
              'button',
              { type: 'button', className: 'fz3-set-btn', onClick: () => saveVoiceHome(voiceHome), disabled: voiceHomeBusy === 'save' },
              voiceHomeBusy === 'save' ? '保存中…' : '保存',
            ),
            h(
              'button',
              { type: 'button', className: 'fz3-set-btn is-ghost', onClick: loadVoiceHome },
              '检测',
            ),
            h(
              'button',
              { type: 'button', className: 'fz3-set-btn is-ghost', onClick: () => saveVoiceHome('') },
              '清除',
            ),
          ),
        ),
        h(
          'div',
          { className: 'fz3-set-actions' },
          h('button', { type: 'button', className: 'fz3-set-btn', onClick: () => controlEngine('start'), disabled: engineBusy === 'start' || ready }, engineBusy === 'start' ? '启动中…' : '启动引擎'),
          h('button', { type: 'button', className: 'fz3-set-btn is-ghost', onClick: () => controlEngine('stop'), disabled: engineBusy === 'stop' || !ready }, '停止引擎'),
          h('button', { type: 'button', className: 'fz3-set-btn is-ghost', onClick: ping }, '刷新状态'),
        ),
        h(
          'div',
          { className: 'fz3-set-actions' },
          h('button', { type: 'button', className: 'fz3-set-btn', onClick: playGreet }, '试听问候'),
          h('button', { type: 'button', className: 'fz3-set-btn', onClick: replayBoot }, '重播开机动画'),
          h('button', { type: 'button', className: 'fz3-set-btn', onClick: resetDockPos, disabled: !hasCustomPos }, '眼标复位'),
          h('button', { type: 'button', className: 'fz3-set-btn', onClick: testVoice, disabled: busy }, '测试语音'),
          h('button', { type: 'button', className: 'fz3-set-btn is-ghost', onClick: stopSpeech, disabled: !busy }, '停止'),
        ),
        h('div', { className: 'fz3-set-note' }, 'Fairy 皮肤 · 待机随机眨眼与花屏、思考态眼睑呼吸；点一下左下的眼标展开电费气泡（电费余额 / 今日电费 / 电费倍率倒计时），按住可拖动。开关都在这里。'),
      )
    }

    function BrandMark() {
      return h(
        'span',
        { className: 'fz3-brandmark', 'aria-hidden': 'true' },
        h('span', {
          className: 'fz3-brandmark-eye',
          'aria-hidden': 'true',
          dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG },
        }),
      )
    }

    function HeroBrandMark(props) {
      const size = props && typeof props.size === 'number' ? props.size : 34
      const extra = props && props.className ? ' ' + props.className : ''
      return h(
        'span',
        {
          className: 'fz3-hero-brand' + extra,
          style: { width: size + 'px', height: size + 'px', display: 'inline-flex' },
          'aria-hidden': 'true',
        },
        h('span', {
          className: 'fz3-hero-brand-eye',
          'aria-hidden': 'true',
          dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG },
        }),
      )
    }

    function BrandName() {
      return h(
        'span',
        { className: 'fz3-brandname' },
        h('b', null, 'FAIRY'),
        h('i', null, 'Ⅲ · H.D.D'),
      )
    }

    /* ------------------------------------------------------------------ *
     * ———————————— */
    function BootStage({ onDone }) {
      const videoRef = useRef(null)
      const [out, setOut] = useState(false)
      const [soundBlocked, setSoundBlocked] = useState(false)
      const doneRef = useRef(false)
      const doneTimer = useRef(null)

      const finish = useCallback(() => {
        if (doneRef.current) return
        doneRef.current = true
        setOut(true)
        doneTimer.current = setTimeout(onDone, 640)
      }, [onDone])

      /* 640ms 的退场延时要在卸载时清掉，否则图层已经切走还会回调一次父组件 */
      useEffect(() => () => {
        if (doneTimer.current) clearTimeout(doneTimer.current)
      }, [])

      useEffect(() => {
        const video = videoRef.current
        if (!video) return undefined
        let disposed = false
        video.volume = 0.9
        video.muted = false
        /* 开机片本身带 H.D.D 音效：优先带声音自动播放；被浏览器自动播放策略拦下时
           先静音播放，等第一次点击/按键后再开声（DSH 桌面壳通常直接出声）。 */
        const unlockSound = () => {
          if (disposed) return
          video.muted = false
          video.volume = 0.9
          setSoundBlocked(false)
          /* 有的浏览器在解除静音时会暂停自动播放的媒体，这里无条件再 play 一次（真实点击手势下会成功）。 */
          const retry = video.play()
          if (retry && retry.catch) retry.catch(() => {})
        }
        const playing = video.play()
        if (playing && playing.catch) {
          playing.catch(() => {
            if (disposed) return
            video.muted = true
            setSoundBlocked(true)
            const mutedPlay = video.play()
            if (mutedPlay && mutedPlay.catch) mutedPlay.catch(() => {})
          })
        }
        document.addEventListener('pointerdown', unlockSound, true)
        document.addEventListener('keydown', unlockSound, true)
        const failsafe = setTimeout(finish, 18_000)
        return () => {
          disposed = true
          clearTimeout(failsafe)
          document.removeEventListener('pointerdown', unlockSound, true)
          document.removeEventListener('keydown', unlockSound, true)
        }
      }, [finish])


      return h(
        'div',
        { className: 'fz3-boot' + (out ? ' is-out' : '') },
        /* 原先这里还有第二路 <video>（同源 loop 播放、整屏 blur(46px) 铺底），
           等价于每帧对一路 1600x900 视频解码 + 全屏模糊；模糊铺底保留为静态 poster，视频只留主路。 */
        h('div', { className: 'fz3-boot-fill', 'aria-hidden': 'true' }),
        h('video', {
          ref: videoRef,
          src: '/fairy-zzz/assets/boot-opt.mp4',
          poster: '/fairy-zzz/assets/poster.jpg',
          playsInline: true,
          preload: 'auto',
          onEnded: finish,
        }),
        soundBlocked ? h('div', { className: 'fz3-boot-sound' }, t('boot.sound')) : null
      )
    }

    /* ------------------------------------------------------------------ *
     * ———————————— */
    function VoiceAction(props) {
      const ref = useRef(null)
      const state = useVoice()
      const messageId = props && props.messageId
      const mode = state.busy ? 'busy' : state.speaking ? 'play' : 'idle'

      useEffect(() => {
        autoRead(ref.current, messageId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      const onClick = useCallback(() => {
        if (state.busy || state.speaking) {
          stopSpeech()
          return
        }
        speakText(readAssistantText(ref.current), { force: true })
      }, [state.busy, state.speaking])

      return h(
        'button',
        {
          ref,
          type: 'button',
          className: 'fz3-voice',
          'data-state': mode,
          title: mode === 'busy' ? 'Fairy 正在组织声带…' : '让 Fairy 念出来',
          'aria-label': 'Fairy 朗读',
          onClick,
        },
        h(
          'svg',
          { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' },
          h('path', { d: 'M4 9.5v5a1 1 0 0 0 1 1h2.6l3.6 3.1a1 1 0 0 0 1.7-.8V6.2a1 1 0 0 0-1.7-.8L7.6 8.5H5a1 1 0 0 0-1 1Z' }),
          h('path', { d: 'M16 8.6a4.6 4.6 0 0 1 0 6.8' }),
          h('path', { d: 'M18.8 6a8 8 0 0 1 0 12' }),
        ),
      )
    }

    /* ------------------------------------------------------------------ *
     * 背景氛围层 */
    const Atmos = React.memo(function Atmos() {
      const glowRef = React.useRef(null)
      React.useEffect(() => {
        const glow = glowRef.current
        if (!glow) return undefined
        const GLOW_MS = 14000
        const t0 = performance.now()
        const tick = () => {
          if (document.hidden) return
          const t = performance.now() - t0
          /* 氛围光呼吸：0% opacity .55/scale 1 → 50% opacity 1/scale 1.06，余弦即 ease-in-out */
          const gp = (t % GLOW_MS) / GLOW_MS
          const ge = 0.5 - 0.5 * Math.cos(2 * Math.PI * gp)
          glow.style.opacity = (0.55 + 0.45 * ge).toFixed(3)
          glow.style.transform = 'scale(' + (1 + 0.06 * ge).toFixed(4) + ')'
        }
        let id = null
        const start = () => {
          if (!id) id = window.setInterval(tick, 500)
        }
        const stop = () => {
          if (id) {
            window.clearInterval(id)
            id = null
          }
        }
        /* 后台标签页把 500ms 的样式计算也停掉，不再空转 */
        const onVis = () => {
          if (document.hidden) stop()
          else {
            tick()
            start()
          }
        }
        document.addEventListener('visibilitychange', onVis)
        tick()
        if (!document.hidden) start()
        return () => {
          document.removeEventListener('visibilitychange', onVis)
          stop()
        }
      }, [])
      return h(
        'div',
        { className: 'fz3-atmos', 'aria-hidden': 'true' },
        h('div', { className: 'fz3-atmos-glow', ref: glowRef }),
        h('div', { className: 'fz3-atmos-flash' }),
        h('div', { className: 'fz3-atmos-frame' }),
        h('div', { className: 'fz3-rim' }),
        h('div', { className: 'fz3-bay' }),
      )
    })

    /* ------------------------------------------------------------------ *
     * 主界面：开机→问好→左下坞 */
    function greetLine() {
      const hh = new Date().getHours()
      if (hh >= 5 && hh < 11) return '主人，早上好。Fairy 已就位，今天的日程也已就位。'
      if (hh >= 11 && hh < 14) return '主人，中午好。饭可以不吃，进度不能停。'
      if (hh >= 14 && hh < 18) return '主人，下午好。H.D.D 在线，摸鱼请自便。'
      if (hh >= 18 && hh < 23) return '主人，晚上好。夜班系统已启动，本系统不困。'
      return '主人，夜深了。这个点还醒着，是需要我陪着，还是放不下手里的事？'
    }

/* 气泡（v1.3.3 文案按电费口径）：usage 态给「电费余额 / 今日电费 / 电费倍率」，turn 态只给「本轮电费 / 电费倍率」。
   只在展开期间挂载；倒计时每秒 tick 一次（1s 定时器，单实例）。 */
function BubbleCard({ data, onMeasure, onFlip }) {
  const { mode, x, y, side, loading, usage, balance } = data
  const peak = usage && usage.peak
  const bucket = usage ? (mode === 'turn' ? usage.turn : usage.today) : null
  const rows = []

  /* 把真实尺寸交回父层，翻面/夹边都按实际宽高算，不会盖到眼徽 */
  const boxRef = useRef(null)
  const lastSize = useRef({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el || typeof onMeasure !== 'function') return
    const w = el.offsetWidth
    const h = el.offsetHeight
    if (w === lastSize.current.w && h === lastSize.current.h) return
    lastSize.current = { w: w, h: h }
    onMeasure({ w: w, h: h })
  })

  /* 峰谷剩余时间：每秒走一格，换价瞬间归零 */
  const [nowTick, setNowTick] = useState(() => Date.now())
  const nextAt = peak && peak.nextAt ? peak.nextAt : 0
  useEffect(() => {
    if (!nextAt) return undefined
    setNowTick(Date.now())
    const timer = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [nextAt])

  const left = nextAt ? nextAt - nowTick : 0

  /* 倒计时归零 = 刚换了价：让父层重新拉一次，峰谷标签与花费跟着翻面 */
  const flipFired = useRef(0)
  useEffect(() => {
    if (!nextAt || left > 0 || flipFired.current === nextAt) return
    flipFired.current = nextAt
    if (typeof onFlip === 'function') onFlip(mode)
  }, [left, nextAt, mode, onFlip])

  if (mode === 'usage') {
    rows.push(['电费余额', loading ? '…' : balance && balance.ok ? yuan(balance.amount) : '读取失败'])
    rows.push(['今日电费', loading ? '…' : bucket ? yuan(bucket.cost) : '—'])
  } else {
    rows.push(['本轮电费', loading ? '…' : bucket ? yuan(bucket.cost) : '—'])
  }
  const tone = peak && peak.offPeak ? 'valley' : 'peak'
  /* 峰谷时段改叫电费倍率：谷时 5 倍、峰时 10 倍 */
  const peakTerm = peak ? (peak.offPeak ? '五倍电费' : '十倍电费') : '电费时段'
  rows.push([
    peakTerm,
    loading
      ? '…'
      : peak
        ? nextAt && left > 0
          ? h(
              'span',
              { className: 'fz3-peak' },
              h('span', { className: 'fz3-peak-badge', 'data-tone': tone }, peak.offPeak ? '谷' : '峰'),
              h('span', { className: 'fz3-peak-clock', 'data-tone': tone }, clockText(left)),
            )
          : feeText(peak.label)
        : '—',
  ])

  const detail = []
  if (bucket && bucket.calls) {
    detail.push(
      bucket.calls + ' 次请求 · ' + tokensText(bucket.hit) + ' 命中 / ' + tokensText(bucket.miss) + ' 未命中 / ' + tokensText(bucket.out) + ' 输出',
    )
  }
  if (peak) {
    const flip = peak.offPeak ? '十倍电费' : '五倍电费'
    detail.push(
      nextAt
        ? left > 0
          ? feeText(peak.window) + ' · 后转' + flip
          : feeText(peak.window) + ' · 换价时刻已到，正在刷新'
        : feeText(peak.window) + ' · ' + feeText(peak.next),
    )
  }
  if (mode === 'usage' && !loading && balance && !balance.ok && balance.reason) detail.push(balance.reason)

  return h(
    'div',
    {
      ref: boxRef,
      className: 'fz3-bubble',
      'data-mode': mode,
      'data-side': side || 'right',
      'data-loading': loading ? '1' : '0',
      style: { left: x + 'px', top: y + 'px' },
    },
    h('div', { className: 'fz3-bubble-head' }, mode === 'turn' ? 'Fairy · 本轮结算' : 'Fairy · 电费'),
    rows.map(([k, v]) =>
      h('div', { className: 'fz3-bubble-row', key: k }, h('span', { className: 'fz3-bubble-k' }, k), h('span', { className: 'fz3-bubble-v' }, h('b', null, v))),
    ),
    detail.length ? h('div', { className: 'fz3-bubble-sub' }, detail.map((line, i) => h('div', { key: i }, line))) : null,
  )
}


    function FairySkin() {
      /* 已经完整播过一次开机 → 重挂载直接从 dock 开始；设置页「重播开机动画」会清标记 */
      const [phase, setPhase] = useState(() => (bootPlayed ? 'dock' : 'boot'))
      const aliveRef = useRef(true)
      useEffect(() => {
        aliveRef.current = true
        return () => {
          aliveRef.current = false
        }
      }, [])

      /* 运行态情绪：宿主 /fairy-zzz/mood 轮询（idle / thinking / working / done） */
      const [mood, setMood] = useState('idle')

      /* 眼徽拖拽：开关与坐标都放 localStorage，设置页改开关时靠事件通知这里 */
      const [dragOn, setDragOn] = useState(() => readBool(DRAG_KEY, true))
      const [eyeHidden, setEyeHidden] = useState(() => readBool(EYE_KEY, false))
      const [dragging, setDragging] = useState(false)
      const [customPos, setCustomPos] = useState(() => {
        const saved = readStored(POS_KEY, null)
        return saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : null
      })
      const dragRef = useRef(null)
      const coreRef = useRef(null)
      /* 可拖拽 / 吸附的范围（v1.3.2）：不再是整个视口，而是「会话内容区」——
         左边界 = 左侧栏右缘，上边界 = 顶部标题栏底缘，右 / 下到窗口边缘。
         由 dock 测量 effect 写入；还没测到就退回整个视口。 */
      const regionRef = useRef(null)
      /* 现场量一次「会话内容区」边界（左=侧栏右缘，上=标题栏底缘，右下=窗口边缘）。
         只在挂载测量 / 按下指针时调用，拖动过程中不再读布局。 */
      const measureRegion = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        try {
          const sidebar = document.querySelector('[class*="_sidebarCol"]')
          const sr = sidebar ? sidebar.getBoundingClientRect() : null
          const left = sr && sr.width > 0 && sr.right < vw * 0.6 ? Math.round(sr.right) : 0
          let top = 0
          const headers = document.querySelectorAll('header')
          for (const hr of headers) {
            const r = hr.getBoundingClientRect()
            if (r.height > 0 && r.height < 120 && r.top <= 12 && r.width > vw * 0.3 && r.left > left - 8) {
              top = Math.round(r.bottom)
              break
            }
          }
          return { left, top, right: vw, bottom: vh }
        } catch (err) {
          return { left: 0, top: 0, right: vw, bottom: vh }
        }
      }
      const regionBounds = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const r = regionRef.current
        if (r && r.right - r.left > 200 && r.bottom - r.top > 200) {
          return {
            left: Math.max(0, Math.min(r.left, vw - 240)),
            top: Math.max(0, Math.min(r.top, vh - 240)),
            right: Math.min(vw, Math.max(r.right, 240)),
            bottom: Math.min(vh, Math.max(r.bottom, 240)),
          }
        }
        return { left: 0, top: 0, right: vw, bottom: vh }
      }

      /* 电费气泡：null = 收起；mode = 'usage'（电费余额·今日电费·电费倍率）| 'turn'（本轮电费·电费倍率） */
      const [bubble, setBubble] = useState(null)
      const bubbleTimer = useRef(null)
      const bubbleSize = useRef({ w: 236, h: 162 })

      const closeBubble = useCallback(() => {
        if (bubbleTimer.current) {
          clearTimeout(bubbleTimer.current)
          bubbleTimer.current = null
        }
        setBubble(null)
      }, [])

      /* 气泡挂点：右侧放不下（会越出右边界）就翻到眼徽左侧，垂直始终跟着眼徽中心 */
      const bubblePlace = useCallback((rect) => {
        const W = bubbleSize.current.w || 236
        const H = bubbleSize.current.h || 162
        const gap = 16
        const margin = 12
        const flip = rect.right + gap + W > window.innerWidth - margin
        const raw = flip ? rect.left - gap - W : rect.right + gap
        return {
          x: Math.round(Math.min(Math.max(raw, margin), Math.max(margin, window.innerWidth - W - margin))),
          y: Math.round(
            Math.min(Math.max(rect.top + rect.height / 2, H / 2 + 8), Math.max(H / 2 + 8, window.innerHeight - H / 2 - 8)),
          ),
          side: flip ? 'left' : 'right',
        }
      }, [])

      const openBubble = useCallback(async (mode) => {
        const el = coreRef.current
        if (!el) return
        const pos = bubblePlace(el.getBoundingClientRect())
        /* 有缓存就立刻显示（loading=false），后台再刷新一次；没有缓存才走骨架占位 */
        const cachedUsage = usageCache.usage && Date.now() - usageCache.usageAt < USAGE_TTL ? usageCache.usage : null
        const cachedBalance =
          mode === 'usage' && usageCache.balance && Date.now() - usageCache.balanceAt < BALANCE_TTL ? usageCache.balance : null
        setBubble({ mode, ...pos, loading: !cachedUsage, usage: cachedUsage, balance: cachedBalance })
        if (bubbleTimer.current) {
          clearTimeout(bubbleTimer.current)
          bubbleTimer.current = null
        }
        const [usage, balance] = await Promise.all([
          loadUsage(!cachedUsage),
          mode === 'usage' ? loadBalance(!cachedBalance) : Promise.resolve(null),
        ])
        /* 请求回来时图层可能已经卸载，别再 setState / 挂 18s 定时器 */
        if (!aliveRef.current) return
        setBubble((prev) => (prev && prev.mode === mode ? { ...prev, ...pos, loading: false, usage, balance } : prev))
        if (mode === 'turn') {
          bubbleTimer.current = setTimeout(() => {
            bubbleTimer.current = null
            if (!aliveRef.current) return
            setBubble((prev) => (prev && prev.mode === 'turn' ? null : prev))
          }, 18_000)
        }
      }, [bubblePlace])

      const clampPos = useCallback((x, y) => {
        const root = document.documentElement
        const size = parseFloat(getComputedStyle(root).getPropertyValue('--fz3-dock-size')) || 128
        const half = size / 2 + 4
        const reg = regionBounds()
        const minX = reg.left + half
        const maxX = Math.max(minX, reg.right - half)
        const minY = reg.top + half
        const maxY = Math.max(minY, reg.bottom - half)
        return {
          x: Math.round(Math.min(Math.max(Number(x) || 0, minX), maxX)),
          y: Math.round(Math.min(Math.max(Number(y) || 0, minY), maxY)),
        }
      }, [])

      const applyPos = useCallback((p) => {
        const root = document.documentElement
        root.style.setProperty('--fz3-dock-x', p.x + 'px')
        root.style.setProperty('--fz3-dock-y', p.y + 'px')
      }, [])

      useEffect(() => {
        /* 官方字标位置测量：拿到 logo 行 / brandIdentity 的矩形，把我们的
           Fairy 字标钉在同一位置。字标本身由 CSS 隐藏（它是 SVG，没有文本）。
           首次最多轮询 14 次 × 500ms；命中之后改用 ResizeObserver + resize 监听
           跟随侧栏折叠/窗口缩放，不再反复全文档查询。 */
        let tries = 0
        let timer = null
        let target = null
        let observer = null
        let resizeTimer = null
        const run = () => {
          const row = target || document.querySelector('[class*="_brandIdentity"]') || document.querySelector('[class*="_logoRow"]')
          if (!row) return false
          const r = row.getBoundingClientRect()
          if (r.width <= 0 || r.height <= 0) return false
          const root = document.documentElement
          root.style.setProperty('--fz3-brand-top', Math.round(r.top - 6) + 'px')
          root.style.setProperty('--fz3-brand-left', Math.round(r.left) + 'px')
          root.style.setProperty('--fz3-brand-h', Math.round(Math.max(34, r.height + 10)) + 'px')
          if (!target) {
            target = row
            if (timer) {
              clearInterval(timer)
              timer = null
            }
            if (typeof ResizeObserver === 'function') {
              observer = new ResizeObserver(() => {
                try { run() } catch (e) {}
              })
              try { observer.observe(row) } catch (e) {}
            }
            window.addEventListener('resize', onResize)
          }
          return true
        }
        function onResize() {
          if (resizeTimer) return
          resizeTimer = setTimeout(() => {
            resizeTimer = null
            try { run() } catch (e) {}
          }, 260)
        }
        timer = setInterval(() => {
          tries += 1
          try {
            if (run() || tries > 14) {
              clearInterval(timer)
              timer = null
            }
          } catch (e) {
            clearInterval(timer)
            timer = null
          }
        }, 500)
        return () => {
          if (timer) clearInterval(timer)
          if (resizeTimer) clearTimeout(resizeTimer)
          if (observer) observer.disconnect()
          window.removeEventListener('resize', onResize)
        }
      }, [])
      useEffect(() => {
        /* 主人自己拖过眼徽：用记住的坐标，不再自动测量 */
        if (customPos) {
          applyPos(clampPos(customPos.x, customPos.y))
          return undefined
        }
        if (eyeHidden) return undefined
        /* dock 定位：找到会话区（左侧最靠左的宽容器），把眼标钉在它的左缘中部，
           与参考视频里「对话时靠在聊天区左边」的位置一致；找不到就退回 25vw / 52vh。
           性能注意：全量 getBoundingClientRect 扫描会强制同步布局（上千个 div），原来最多扫 16 次；
           现在只要扫到过一次就缓存命中的那个容器，之后重试/窗口缩放只量它一个元素。 */
        let tries = 0
        let timer = null
        let cached = null
        let observer = null
        /* 会话区的候选容器：先查窄选择器（通常十来个元素），找不到才退回全文档扫描，
           而且全量扫描只在最初几次重试里允许，避免长会话时反复强制布局。 */
        const NARROW = '[data-chat-flow],[data-conversation-scroll],[class*="_conversation"],[class*="_chatBody"],[class*="_threadBody"],main'
        const fits = (r, vw) => r.width >= 420 && r.height >= 300 && r.left >= 260 && r.left <= vw * 0.5 && r.width <= vw * 0.9
        const pick = (nodes, vw) => {
          let best = null
          let bestEl = null
          for (let i = 0; i < nodes.length; i += 1) {
            const el = nodes[i]
            const r = el.getBoundingClientRect()
            if (!fits(r, vw)) continue
            if (!best || r.left < best.left) {
              best = r
              bestEl = el
            }
          }
          return { best, bestEl }
        }
        const watch = () => {
          if (!cached || observer || typeof ResizeObserver !== 'function') return
          observer = new ResizeObserver(() => {
            try { measure() } catch (e) {}
          })
          try { observer.observe(cached) } catch (e) {}
        }
        const measure = () => {
          let best = null
          const root = document.documentElement
          const vw = window.innerWidth
          /* 先量上次命中的容器：窗口缩放后它通常还是同一个会话区。 */
          if (cached && cached.isConnected) {
            const r = cached.getBoundingClientRect()
            if (fits(r, vw)) best = r
          }
          if (!best) {
            let found = pick(document.querySelectorAll(NARROW), vw)
            if (!found.bestEl && tries <= 3) found = pick(document.querySelectorAll('div,main,section'), vw)
            best = found.best
            if (found.bestEl) {
              cached = found.bestEl
              watch()
            }
          }
          if (best) {
            /* 拖拽 / 吸附的范围（v1.3.2）= 会话内容区，而不是整个窗口：
               左边界取左侧栏右缘，上边界取顶部标题栏底缘，右 / 下到窗口边缘。 */
            const vh = window.innerHeight
            const region = measureRegion()
            if (!region.left) region.left = Math.round(best.left)
            regionRef.current = region
            if (customPos) {
              const c = clampPos(customPos.x, customPos.y)
              root.style.setProperty('--fz3-dock-x', c.x + 'px')
              root.style.setProperty('--fz3-dock-y', c.y + 'px')
            } else {
              const size = parseFloat(getComputedStyle(root).getPropertyValue('--fz3-dock-size')) || 128
              const half = size / 2 + 4
              let cx = Math.round(region.left + half + 10)
              let cy = Math.round(region.top + (region.bottom - region.top) * 0.5)
              cx = Math.min(Math.max(cx, region.left + half), region.right - half)
              cy = Math.min(Math.max(cy, region.top + half), region.bottom - half)
              root.style.setProperty('--fz3-dock-x', cx + 'px')
              root.style.setProperty('--fz3-dock-y', cy + 'px')
            }
          }
          return !!best
        }
        const kick = () => {
          tries += 1
          try { if (measure() || tries > 16) clearInterval(timer) } catch (e) { clearInterval(timer) }
        }
        timer = setInterval(kick, 600)
        /* 拖动窗口会连续触发 resize；原来每个事件都排一个 setTimeout，拖动期间会堆出几十个定时器。 */
        let resizeTimer = null
        const onResize = () => {
          if (resizeTimer) return
          resizeTimer = setTimeout(() => {
            resizeTimer = null
            kick()
          }, 260)
        }
        window.addEventListener('resize', onResize)
        return () => {
          clearInterval(timer)
          if (resizeTimer) clearTimeout(resizeTimer)
          if (observer) observer.disconnect()
          window.removeEventListener('resize', onResize)
        }
      }, [customPos, eyeHidden, applyPos, clampPos])

      /* 记住的位置也要跟着窗口缩放夹一下，别把眼标留在屏幕外 */
      useEffect(() => {
        if (!customPos) return undefined
        const onResize = () => applyPos(clampPos(customPos.x, customPos.y))
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [customPos, applyPos, clampPos])

      /* 设置页里的开关与「眼标复位」通过自定义事件同步到这个图层 */
      useEffect(() => {
        const syncDrag = () => setDragOn(readBool(DRAG_KEY, true))
        const syncEye = () => setEyeHidden(readBool(EYE_KEY, false))
        const onReset = () => {
          try { localStorage.removeItem(POS_KEY) } catch {}
          setCustomPos(null)
          setDragging(false)
        }
        window.addEventListener('fz3:drag-pref', syncDrag)
        window.addEventListener('fz3:eye-pref', syncEye)
        window.addEventListener('fz3:dock-reset', onReset)
        window.addEventListener('storage', syncDrag)
        window.addEventListener('storage', syncEye)
        return () => {
          window.removeEventListener('fz3:drag-pref', syncDrag)
          window.removeEventListener('fz3:eye-pref', syncEye)
          window.removeEventListener('fz3:dock-reset', onReset)
          window.removeEventListener('storage', syncDrag)
          window.removeEventListener('storage', syncEye)
        }
      }, [])

      /* 欢迎页 hero 的标题与「预览版」徽章没有插槽，只能改写 DOM 文本。
         参考实现是每 900ms 轮询一次；这里改成 MutationObserver：只在 hero 重新挂载
         （节点被加进来）时改一次，文本已经对了就不写，空闲时零定时器。 */
      useEffect(() => {
        if (typeof document === 'undefined') return undefined
        const rewrite = () => {
          const group = document.querySelector('[class*="_headline"] [class*="_titleGroup"]')
          if (!group) return false
          const headline = group.querySelector('span')
          const badge = group.querySelector('[class*="_previewBadge"]')
          const zh = CJK_RE.test((headline && headline.textContent) || '') || CJK_RE.test((badge && badge.textContent) || '')
          const copy = zh ? HERO_COPY.zh : HERO_COPY.en
          if (headline && headline.textContent !== copy.headline) headline.textContent = copy.headline
          if (badge && badge.textContent !== copy.badge) badge.textContent = copy.badge
          return true
        }
        rewrite()
        let pending = null
        const observer = new MutationObserver((records) => {
          if (pending) return
          let hit = false
          for (let i = 0; i < records.length && !hit; i += 1) {
            const record = records[i]
            /* 文本被宿主重新渲染（characterData）也算命中：只认标题与徽章内的改动 */
            if (record.type === 'characterData') {
              const parent = record.target && record.target.parentElement
              if (parent && parent.closest && parent.closest('[class*="_headline"],[class*="_previewBadge"]')) hit = true
              continue
            }
            const added = record.addedNodes
            for (let j = 0; j < added.length; j += 1) {
              const node = added[j]
              if (!node || node.nodeType !== 1) continue
              if ((node.matches && node.matches('[class*="_headline"]')) || (node.querySelector && node.querySelector('[class*="_headline"]'))) {
                hit = true
                break
              }
            }
          }
          if (!hit) return
          pending = setTimeout(() => {
            pending = null
            try { rewrite() } catch (e) {}
          }, 60)
        })
        try {
          observer.observe(document.body, { childList: true, subtree: true, characterData: true })
        } catch (e) {
          return undefined
        }
        return () => {
          if (pending) clearTimeout(pending)
          observer.disconnect()
        }
      }, [])

      /* 一轮跑完 → 自动弹一次「本轮电费」，18 秒后自己消失。
         用「上一轮情绪」判迁移而不是时间戳分桶：同一分钟内连跑两轮也能各弹一次。 */
      const prevMood = useRef('')
      useEffect(() => {
        const before = prevMood.current
        prevMood.current = mood
        if (phase !== 'dock' || mood !== 'done' || before === 'done') return
        openBubble('turn')
      }, [mood, phase, openBubble])
      useEffect(() => closeBubble, [closeBubble])
      /* 气泡打开后：点页面任意其他地方 / 按 Esc 收起（点眼徽或气泡内部不算，避免刚开就关） */
      useEffect(() => {
        if (!bubble) return undefined
        const onDown = (e) => {
          const t = e.target
          if (t && typeof t.closest === 'function' && (t.closest('.fz3-bubble') || t.closest('.fz3-core'))) return
          closeBubble()
        }
        const onKey = (e) => {
          if (e.key === 'Escape') closeBubble()
        }
        document.addEventListener('pointerdown', onDown, true)
        document.addEventListener('keydown', onKey, true)
        return () => {
          document.removeEventListener('pointerdown', onDown, true)
          document.removeEventListener('keydown', onKey, true)
        }
      }, [bubble, closeBubble])
      /* 到坞后空闲预取用量与余额：点眼徽时直接用缓存秒开 */
      useEffect(() => {
        if (phase !== 'dock' || eyeHidden) return undefined
        let alive = true
        const timer = setTimeout(() => {
          if (alive) prefetchUsage()
        }, 700)
        const onVis = () => {
          if (!document.hidden && alive && Date.now() - usageCache.usageAt > USAGE_TTL) loadUsage(false)
        }
        document.addEventListener('visibilitychange', onVis)
        return () => {
          alive = false
          clearTimeout(timer)
          document.removeEventListener('visibilitychange', onVis)
        }
      }, [phase, eyeHidden])

      useEffect(() => {
        let alive = true
        let timer = null
        let inFlight = false
        const tick = () => {
          /* 上一请求还没回来就跳过本拍：宿主卡顿时不会堆积请求。 */
          if (inFlight) return
          inFlight = true
          fetch('/fairy-zzz/mood', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (!alive || !d || typeof d.mood !== 'string') return
              // running 以宿主权威快照为准：宿主说没在跑，就不接受 thinking/working
              //（宿主如果没这个字段，保持旧行为）
              if (d.running === false && (d.mood === 'thinking' || d.mood === 'working')) return
              setMood(d.mood)
            })
            .catch(() => {})
            .then(() => {
              inFlight = false
            })
        }
        const start = () => {
          if (!timer) timer = setInterval(tick, 900)
        }
        const stop = () => {
          if (timer) {
            clearInterval(timer)
            timer = null
          }
        }
        /* 后台标签页完全停掉 900ms 的情绪轮询（浏览器本来也会把定时器节流到 1 次/分钟）。 */
        const onVis = () => {
          if (document.visibilityState === 'hidden') stop()
          else {
            tick()
            start()
          }
        }
        document.addEventListener('visibilitychange', onVis)
        tick()
        start()
        return () => {
          alive = false
          stop()
          document.removeEventListener('visibilitychange', onVis)
        }
      }, [])
      const [needTap, setNeedTap] = useState(false)
      const [engine, setEngine] = useState(null)
      const greetAudio = useRef(null)
      const voiceState = useVoice()

      const toGreet = useCallback(() => {
        stopSpeech()
        bootPlayed = true
        setPhase('greet')
      }, [])

      const toDock = useCallback(() => {
        bootPlayed = true
        setPhase('dock')
        setNeedTap(false)
        autoArmAt = Date.now() + 2600
      }, [])

      /* ———————————————————— 眼徽拖拽 + 用量气泡 ———————————————————— */
      const toggleBubble = useCallback(() => {
        if (phase !== 'dock') return
        if (bubble) {
          closeBubble()
          return
        }
        openBubble('usage')
      }, [bubble, phase, openBubble, closeBubble])

      /* ——— 拖拽（v1.3.1）———
         旧实现每个 pointermove 都改 :root 的 --fz3-dock-x/y，会让整页样式失效并触发布局 + 重绘，
         165Hz 屏上很卡。现在拖动期间只写核心元素自己的 transform（合成器线程），rAF 合并事件，
         松手才提交 left/top；拖动时顺带关掉脉冲环与全屏 mix-blend 合成。 */
      /* 吸附范围（v1.3.2）：松手时离「会话内容区」四边 64px 以内就贴边（角落两轴同时吸）。
         范围来自 regionBounds()：左 = 侧栏右缘，上 = 标题栏底缘，右 / 下 = 窗口边缘。 */
      const SNAP_EDGE = 64
      const snapPos = (pos, half) => {
        const reg = regionBounds()
        const m = half + 6
        let x = pos.x
        let y = pos.y
        if (x - reg.left - m <= SNAP_EDGE) x = reg.left + m
        else if (reg.right - m - x <= SNAP_EDGE) x = reg.right - m
        if (y - reg.top - m <= SNAP_EDGE) y = reg.top + m
        else if (reg.bottom - m - y <= SNAP_EDGE) y = reg.bottom - m
        return { x: Math.round(x), y: Math.round(y) }
      }
      /* 吸附目标若正好被别的浮层盖住（例如右下角的鲸鱼挂件 z-index 9999，比覆盖层高），
         就沿吸附边往里让开，避免眼徽被压在下面既看不见也点不到。 */
      /* 我们这层挂在 overlay 槽里，参与堆叠的是最近带 z-index 的祖先（实测 z=20）；
         逐个取该点上方非本插件元素的最高 z-index 来比较，判断是否被盖住。 */
      const ourStackZ = () => {
        try {
          const layer = document.querySelector('.fz3-layer')
          let el = layer ? layer.parentElement : null
          while (el) {
            const cs = getComputedStyle(el)
            const z = parseInt(cs.zIndex, 10)
            if (!Number.isNaN(z) && cs.position !== 'static') return z
            el = el.parentElement
          }
        } catch (err) {}
        return 0
      }
      const foreignZAt = (x, y) => {
        let best = 0
        try {
          const stack = document.elementsFromPoint(x, y)
          for (const el of stack) {
            if (!el || (el.closest && el.closest('.fz3-layer'))) continue
            let node = el
            let z = 0
            while (node) {
              const cs = getComputedStyle(node)
              const val = parseInt(cs.zIndex, 10)
              if (!Number.isNaN(val) && cs.position !== 'static') {
                z = val
                break
              }
              node = node.parentElement
            }
            if (z > best) best = z
          }
        } catch (err) {
          return 0
        }
        return best
      }
      const occludedAt = (x, y) => foreignZAt(x, y) > ourStackZ()
      const avoidOcclusion = (pos, half) => {
        const m = half + 6
        const reg = regionBounds()
        if (!occludedAt(pos.x, pos.y)) return pos
        const xDir = pos.x === reg.left + m ? 1 : pos.x === reg.right - m ? -1 : 0
        const yDir = pos.y === reg.top + m ? 1 : pos.y === reg.bottom - m ? -1 : 0
        for (const step of [72, 144, 216, 288, 360]) {
          const cands = []
          if (yDir) cands.push({ x: pos.x, y: pos.y + yDir * step })
          if (xDir) cands.push({ x: pos.x + xDir * step, y: pos.y })
          for (const cand of cands) {
            if (cand.x < reg.left + m || cand.x > reg.right - m || cand.y < reg.top + m || cand.y > reg.bottom - m) continue
            if (!occludedAt(cand.x, cand.y)) return { x: Math.round(cand.x), y: Math.round(cand.y) }
          }
        }
        return pos
      }
      const onCoreDown = (e) => {
        if (!dragOn || phase !== 'dock') return
        if (typeof e.button === 'number' && e.button !== 0) return
        /* 拖拽/吸附前重新量一次范围：打开会话、折叠侧栏后标题栏高度可能变，不能只信挂载时那次 */
        regionRef.current = measureRegion()
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        /* 拖动期间禁用 left/top 的 1.35s 过渡，落位由手势/吸附动画接管 */
        el.style.transition = 'none'
        /* 拖动时先收起气泡：气泡跟随会带来每帧 React 重渲染，也是卡顿来源之一 */
        if (bubble) closeBubble()
        dragRef.current = {
          id: e.pointerId,
          dx: e.clientX - (r.left + r.width / 2),
          dy: e.clientY - (r.top + r.height / 2),
          sx: e.clientX,
          sy: e.clientY,
          startX: r.left + r.width / 2,
          startY: r.top + r.height / 2,
          half: r.width / 2 + 4,
          cur: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
          moved: false,
          frame: 0,
          el,
        }
        try { el.setPointerCapture(e.pointerId) } catch (err) {}
        /* move/up/cancel 挂到 window：拖出眼徽范围、甚至拖出窗口也能正常跟随与落位
           （只靠元素自身的 pointer capture 在某些输入路径下会丢事件） */
        /* 全屏氛围层是独立挂载（不在 .fz3-layer 内），拖动期直接临时关掉它的 mix-blend 合成 */
        try {
          const atmos = document.querySelector('.fz3-atmos')
          if (atmos) {
            atmos.style.mixBlendMode = 'normal'
            drag.atmos = atmos
          }
        } catch (err) {}
        const drag = dragRef.current
        drag.move = (ev) => onCoreMove(ev)
        drag.up = (ev) => onCoreUp(ev)
        drag.cancel = (ev) => onCoreCancel(ev)
        window.addEventListener('pointermove', drag.move, true)
        window.addEventListener('pointerup', drag.up, true)
        window.addEventListener('pointercancel', drag.cancel, true)
      }
      const detachDrag = (drag) => {
        if (drag.move) window.removeEventListener('pointermove', drag.move, true)
        if (drag.up) window.removeEventListener('pointerup', drag.up, true)
        if (drag.cancel) window.removeEventListener('pointercancel', drag.cancel, true)
        if (drag.atmos) drag.atmos.style.mixBlendMode = ''
      }
      const paintDrag = (drag) => {
        drag.frame = 0
        const el = drag.el
        if (!el) return
        const dx = Math.round(drag.cur.x - drag.startX)
        const dy = Math.round(drag.cur.y - drag.startY)
        el.style.transform = 'translate(-50%,-50%) translate3d(' + dx + 'px,' + dy + 'px,0)'
      }
      const onCoreMove = (e) => {
        const drag = dragRef.current
        if (!drag || drag.id !== e.pointerId) return
        if (!drag.moved) {
          if (Math.abs(e.clientX - drag.sx) < 4 && Math.abs(e.clientY - drag.sy) < 4) return
          drag.moved = true
          setDragging(true)
        }
        const half = drag.half
        const reg = regionBounds()
        const cx = Math.round(Math.min(Math.max(e.clientX - drag.dx, reg.left + half), reg.right - half))
        const cy = Math.round(Math.min(Math.max(e.clientY - drag.dy, reg.top + half), reg.bottom - half))
        drag.cur = { x: cx, y: cy }
        if (!drag.frame) drag.frame = window.requestAnimationFrame(() => paintDrag(drag))
      }
      const finishDrag = (drag, allowClick) => {
        const el = drag.el
        if (drag.frame) {
          window.cancelAnimationFrame(drag.frame)
          drag.frame = 0
        }
        if (!drag.moved) {
          if (el) {
            el.style.transform = ''
            el.style.transition = ''
          }
          if (allowClick) toggleBubble()
          return
        }
        /* 先落位（transition 关着，不产生 1.35s 长过渡），再把 transform 从松手点补间回 0，
           做出「被吸过去」的最后一段动画；动画结束恢复常规过渡。 */
        const target = avoidOcclusion(snapPos(drag.cur, drag.half), drag.half)
        const offX = Math.round(drag.cur.x - target.x)
        const offY = Math.round(drag.cur.y - target.y)
        applyPos(target)
        setCustomPos(target)
        writeStored(POS_KEY, target)
        if (!el) return
        el.style.transform = 'translate(-50%,-50%) translate3d(' + offX + 'px,' + offY + 'px,0)'
        const cleanup = () => {
          if (!el) return
          el.style.transform = ''
          el.style.transition = ''
        }
        try {
          const anim = el.animate(
            [
              { transform: 'translate(-50%,-50%) translate3d(' + offX + 'px,' + offY + 'px,0)' },
              { transform: 'translate(-50%,-50%) translate3d(0px,0px,0)' },
            ],
            { duration: 170, easing: 'cubic-bezier(.2,.9,.25,1)' },
          )
          anim.onfinish = cleanup
          anim.oncancel = cleanup
        } catch (err) {
          cleanup()
        }
      }
      const onCoreUp = (e) => {
        const drag = dragRef.current
        if (!drag || drag.id !== e.pointerId) return
        dragRef.current = null
        detachDrag(drag)
        setDragging(false)
        finishDrag(drag, true)
      }
      /* 指针被系统取消（触摸滚动被外层接管等）不当成一次点击；已移动过就落位，否则复位 */
      const onCoreCancel = (e) => {
        const drag = dragRef.current
        if (!drag || drag.id !== e.pointerId) return
        dragRef.current = null
        detachDrag(drag)
        setDragging(false)
        finishDrag(drag, false)
      }

      /* ———————————————————— */
      useEffect(() => {
        if (phase !== 'greet') return undefined
        let alive = true
        let timer = null
        const lock = setTimeout(() => {
          if (alive) toDock()
        }, 13_000)
        const audio = new Audio(GREETING())
        greetAudio.current = audio
        audio.volume = 0.95
        audio.onended = () => {
          if (!alive) return
          clearTimeout(lock)
          timer = setTimeout(() => {
            if (alive) toDock()
          }, 1900)
        }
        audio.play().then(
          () => {
            if (alive) setNeedTap(false)
          },
          () => {
            if (alive) setNeedTap(true)
          },
        )
        return () => {
          alive = false
          clearTimeout(lock)
          if (timer) clearTimeout(timer)
          try {
            audio.onended = null
            audio.pause()
          } catch {}
          greetAudio.current = null
        }
      }, [phase, toDock])

      const retryVoice = useCallback(() => {
        const audio = greetAudio.current
        if (!audio) return
        audio.play().then(
          () => setNeedTap(false),
          () => {},
        )
      }, [])

      /* 设置页里的「重播开机动画」→ 回到 boot 阶段 */
      useEffect(() => {
        const fn = () => {
          stopSpeech()
          bootPlayed = false
          setPhase('boot')
        }
        bootHooks.add(fn)
        return () => { bootHooks.delete(fn) }
      }, [])

      const busy = voiceState.busy || voiceState.speaking

      return h(
        'div',
        { className: 'fz3-layer', 'data-phase': phase, 'data-mood': mood, 'data-drag': dragOn ? '1' : '0', 'data-dragging': dragging ? '1' : '0' },
        h(
          'div',
          { className: 'fz3-screen', onClick: needTap ? retryVoice : undefined },
          h('div', { className: 'fz3-bg' }),
          h('div', { className: 'fz3-hero' }),
          phase === 'boot' ? h(BootStage, { onDone: toGreet }) : null,
          phase !== 'boot' && needTap
            ? h('div', { className: 'fz3-copy-sub fz3-tap', style: { position: 'absolute', left: 0, right: 0, bottom: 'clamp(12px,5vh,44px)', textAlign: 'center' } }, t('greet.tap'))
            : null,
          phase === 'greet' ? h('button', { type: 'button', className: 'fz3-skip2', onClick: toDock }, 'SKIP ▸') : null,
        ),

        phase === 'dock'
          ? h(
              'div',
              { className: 'fz3-sb-brand', 'aria-hidden': 'true' },
              h('span', { className: 'fz3-sb-logo', dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG } }),
              h(
                'span',
                { className: 'fz3-sb-text' },
                h('b', null, 'Fairy'),
                h('i', null, 'Ⅲ型总序式集成泛用人工智能'),
              ),
            )
          : null,

        /* ———————————————————— */
        phase !== 'boot' && !eyeHidden
          ? h(
              'div',
              {
                ref: coreRef,
                className: 'fz3-core',
                'data-phase': phase,
                onPointerDown: onCoreDown,
                onClick: dragOn ? undefined : toggleBubble,
                onKeyDown: (e) => {
                  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault()
                    toggleBubble()
                  }
                },
                role: 'button',
                tabIndex: 0,
                /* 不挂 title：悬浮提示会盖住眼徽，交互由气泡自己说明 */
                'aria-label': 'Fairy 电费气泡',
              },
              h(CoreGlyph, { phase, mood }),
            )
          : null,

        /* ———————————————————— 用量气泡 ———————————————————— */
        bubble && !eyeHidden
          ? h(BubbleCard, {
              key: bubble.mode,
              data: bubble,
              /* 换价瞬间：重新拉一次用量，气泡里的峰谷立刻翻面 */
              onFlip: (mode) => {
                openBubble(mode)
              },
              onMeasure: (size) => {
                bubbleSize.current = size
                /* 尺寸一变立刻重算一次挂点，避免首帧用旧宽高定位 */
                const el = coreRef.current
                if (!el) return
                const next = bubblePlace(el.getBoundingClientRect())
                setBubble((prev) =>
                  prev && (prev.x !== next.x || prev.y !== next.y || prev.side !== next.side) ? { ...prev, ...next } : prev,
                )
              },
            })
          : null,

        /* ———————————————————— */
        phase !== 'boot'
          ? h(
              'div',
              { className: 'fz3-copy' },
              h('div', { className: 'fz3-copy-kicker' }, t('greet.kicker')),
              h('div', { className: 'fz3-copy-title-zh' }, '空 洞 深 潜 系 统'),
              h('div', { className: 'fz3-copy-title-wrap' }, h('div', { className: 'fz3-copy-title', 'data-text': 'HOLLOW DEEP DIVE SYSTEM' }, 'HOLLOW DEEP DIVE SYSTEM')),
              h(
                'div',
                { className: 'fz3-copy-lines' },
                h('span', null, greetLine()),
              ),
              h('div', { className: 'fz3-copy-sub' }, t('greet.sub')),
            )
          : null,

      )
    }

    /* ------------------------------------------------------------------ *
     * 挂载
     * ------------------------------------------------------------------ */
    return {
      inject: ['slots', 'locale', 'theme', 'remote', 'remote.account'],
      apply(ctx) {
        /* 账户余额等接口要经过 ctx 上的远程服务，气泡里用 runtime.ctx 取 */
        runtime.ctx = ctx
        const guard = (label, fn) => {
          try {
            return fn()
          } catch (cause) {
            try {
              console.warn('[fairy-zzz] ' + label, cause)
            } catch {}
            return undefined
          }
        }

        guard('locale', () => {
          const locale = ctx.get && ctx.get('locale')
          if (!locale || typeof locale.register !== 'function') return
          locale.register(NS, 'zh-CN', ZH)
          locale.register(NS, 'en-US', EN)
          tr = locale.bind(NS)
        })

        guard('styles', () => {
          if (typeof document === 'undefined') return
          const tagId = PKG + '/fairy-zzz.css'
          const existing = document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']')
          if (existing) {
            /* 宿主热重载会重新执行 apply：样式内容变了就地更新，不再重复插入 <style> */
            if (existing.textContent !== CSS) existing.textContent = CSS
            return
          }
          const tag = document.createElement('style')
          tag.dataset.plugin = PKG
          tag.dataset.pluginCss = tagId
          tag.textContent = CSS
          document.head.appendChild(tag)
          if (ctx && typeof ctx.effect === 'function') {
            ctx.effect(() => () => {
              try { tag.remove() } catch {}
            })
          }
        })

        guard('tokens', () => {
          const theme = ctx.get && ctx.get('theme')
          if (theme && typeof theme.overrideTokens === 'function') theme.overrideTokens(PKG, TOKENS)
        })

        guard('theme-watch', () => {
          /* 外观：跟随宿主主题，或听设置页「外观」分段开关的强制值。
             只切 <html data-fz3-theme>，CSS 侧全部是静态覆盖；观察 html 属性时做 260ms 去抖，
             宿主频繁改 style 也不会把回调打成风暴。 */
          if (typeof document === 'undefined') return
          const root = document.documentElement
          const forced = () => {
            const value = readStored(THEME_KEY, 'auto')
            return value === 'light' || value === 'dark' ? value : ''
          }
          const probeLight = () => {
            try {
              const theme = ctx.get && ctx.get('theme')
              const active = theme && typeof theme.getTheme === 'function' ? theme.getTheme() : null
              const id = active && active.active ? String(active.active.id || '') : ''
              if (id) {
                if (/light|snow|day/i.test(id)) return true
                if (/dark|night|midnight/i.test(id)) return false
              }
            } catch (e) {}
            try {
              /* 兜底：量一下宿主实际刷上的 --dsw-alias-bg-base 亮度 */
              const probe = document.createElement('div')
              probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;pointer-events:none;background:var(--dsw-alias-bg-base)'
              document.body.appendChild(probe)
              const value = getComputedStyle(probe).backgroundColor || ''
              probe.remove()
              const m = value.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/)
              if (m) return (Number(m[1]) * 299 + Number(m[2]) * 587 + Number(m[3]) * 114) / 1000 > 140
            } catch (e) {}
            try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) } catch (e) { return false }
          }
          let lastForce = null
          const apply = () => {
            const force = forced()
            const pick = force || (probeLight() ? 'light' : 'dark')
            if (root.dataset.fz3Theme !== pick) root.dataset.fz3Theme = pick
            /* 设置页强制外观时，宿主外壳本身仍是它自己的主题（侧栏/输入框不会变），
               这里把 Fairy 的设计变量双写进 light+dark 两套，让宿主也走强制配色。 */
            if (force !== lastForce) {
              lastForce = force
              try {
                const theme = ctx.get && ctx.get('theme')
                if (theme && typeof theme.overrideTokens === 'function') {
                  if (!force) theme.overrideTokens(PKG, TOKENS)
                  else {
                    const map = force === 'light' ? lightTokens : baseTokens
                    const merged = {}
                    for (const key of Object.keys(baseTokens)) {
                      const value = map[key] || baseTokens[key]
                      merged[key] = { light: value, dark: value }
                    }
                    theme.overrideTokens(PKG, merged)
                  }
                }
              } catch (e) {}
            }
          }
          apply()
          let timer = null
          const soon = () => {
            if (timer) return
            timer = setTimeout(() => {
              timer = null
              apply()
            }, 260)
          }
          window.addEventListener('fz3:theme-pref', apply)
          const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null
          if (media) {
            if (typeof media.addEventListener === 'function') media.addEventListener('change', soon)
            else if (typeof media.addListener === 'function') media.addListener(soon)
          }
          const observer = new MutationObserver(soon)
          observer.observe(root, { attributes: true, attributeFilter: ['style', 'class', 'data-theme', 'data-color-scheme'] })
          if (ctx && typeof ctx.on === 'function') {
            try { ctx.on('theme/change', soon) } catch (e) {}
          }
          if (ctx && typeof ctx.effect === 'function') {
            ctx.effect(() => () => {
              if (timer) clearTimeout(timer)
              window.removeEventListener('fz3:theme-pref', apply)
              if (media) {
                if (typeof media.removeEventListener === 'function') media.removeEventListener('change', soon)
                else if (typeof media.removeListener === 'function') media.removeListener(soon)
              }
              observer.disconnect()
            })
          }
        })

        const mount = (key, spec, component) => {
          guard('inject:' + key, () => {
            ctx.slots.inject(key, () => {
              guard('register:' + key, () => {
                ctx.slots.register({ name: key, ...spec }, component)
              })
            })
          })
        }

        mount('sidebar.brand.mark', { id: 'fairy-zzz-brandmark', priority: 100 }, BrandMark)
        mount('sidebar.brand.name', { id: 'fairy-zzz-brandname', priority: 100 }, BrandName)
        mount('conversation.hero.brand.mark', { id: 'fairy-zzz-hero-brand', priority: 0 }, HeroBrandMark)
        mount('shell.overlay', { id: 'fairy-zzz-skin', order: 24 }, FairySkin)
        mount('shell.overlay', { id: 'fairy-zzz-atmos', order: 12 }, Atmos)
            mount('conversation.chat.assistant-actions', { id: 'fairy-zzz-voice', order: 20, label: '朗读' }, VoiceAction)
        mount('settings.section', { id: 'fairy-zzz-settings', order: 40, label: 'Fairy' }, FairySettings)
      },
    }
  },
})

