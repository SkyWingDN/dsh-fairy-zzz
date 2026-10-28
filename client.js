window.__ModuleLoader__.load({
  id: 'dsh-fairy-zzz',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React

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
      'boot.kicker': 'H.D.D // BOOT SEQUENCE',
      'boot.version': 'FAIRY.OS 3.01',
      'boot.title': 'Ⅲ型总序式集成泛用人工智能',
      'boot.check1': 'CORE LINK',
      'boot.check2': 'VOICE MODULE',
      'boot.check3': 'HDD INTERFACE',
      'boot.skip': 'SKIP',
      'boot.sound': '🔊 点击任意处开启声音',
      'greet.kicker': 'H.D.D CORE // ONLINE',
      'greet.1': '主人，Fairy 已就位。',
      'greet.2': 'H.D.D 全链路自检通过，语音模块在线。',
      'greet.3': '今天的烂摊子，也请交给本系统。',
      'greet.sub': 'Ⅲ型总序式集成泛用人工智能 · VOICE LINK ACTIVE',
      'greet.tap': '点击任意处唤起声音',
      'dock.tag': 'FAIRY Ⅲ',
      'dock.tagsub': 'H.D.D / B4',
      'dock.title': 'FAIRY Ⅲ // H.D.D CORE',
      'dock.sub': 'Ⅲ型总序式集成泛用人工智能',
      'dock.autoVoice': '自动语音',
      'dock.engine': '语音引擎',
      'dock.ready': '就绪',
      'dock.idle': '待机',
      'dock.busy': '合成中',
      'dock.speaking': '发声',
      'dock.replayGreet': '重播问候',
      'dock.replayBoot': '重新开机',
      'dock.stop': '停止发声',
      'dock.test': '试听一句',
      'dock.foot': 'GPT-SoVITS · Fairy_e10_s870',
      'dock.error': '语音链路异常',
    }
    const EN = {
      'boot.kicker': 'H.D.D // BOOT SEQUENCE',
      'boot.version': 'FAIRY.OS 3.01',
      'boot.title': 'III-Type Omnibus Integrated General-Purpose AI',
      'boot.check1': 'CORE LINK',
      'boot.check2': 'VOICE MODULE',
      'boot.check3': 'HDD INTERFACE',
      'boot.skip': 'SKIP',
      'boot.sound': '🔊 Tap anywhere to enable sound',
      'greet.kicker': 'H.D.D CORE // ONLINE',
      'greet.1': 'Master. Fairy is online.',
      'greet.2': 'H.D.D self-check passed. Voice module linked.',
      'greet.3': 'Your mess, as always, is mine to clean.',
      'greet.sub': 'III-Type Omnibus Integrated AI · VOICE LINK ACTIVE',
      'greet.tap': 'Tap anywhere to wake her voice',
      'dock.tag': 'FAIRY Ⅲ',
      'dock.tagsub': 'H.D.D',
      'dock.title': 'FAIRY Ⅲ // H.D.D CORE',
      'dock.sub': 'III-Type Omnibus Integrated General-Purpose AI',
      'dock.autoVoice': 'Auto voice',
      'dock.engine': 'Voice engine',
      'dock.ready': 'ready',
      'dock.idle': 'idle',
      'dock.busy': 'synth',
      'dock.speaking': 'speaking',
      'dock.replayGreet': 'Replay greeting',
      'dock.replayBoot': 'Reboot',
      'dock.stop': 'Stop',
      'dock.test': 'Test voice',
      'dock.foot': 'GPT-SoVITS · Fairy_e10_s870',
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
        const finish = () => {
          if (settled) return
          settled = true
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
        setTimeout(finish, 240_000)
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

    /* ———————————————————— */
    function readMessageText(el) {
      if (!el) return ''
      let node = el
      let best = ''
      for (let depth = 0; depth < 10 && node; depth += 1) {
        const text = (node.innerText || '').trim()
        if (text.length > best.length) best = text
        if (text.length > 300) break
        node = node.parentElement
      }
      return best
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
      seen.add(messageId)
      saveSeen()
      if (now < autoArmAt || gap < 900 || !voice.enabled) return
      const text = readAssistantText(el)
      if (text.length > 2) speakText(text)
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
    const TOKENS = {}
    for (const key of Object.keys(baseTokens)) TOKENS[key] = { light: baseTokens[key], dark: baseTokens[key] }

    /* ------------------------------------------------------------------ *
     * 样式
     * ------------------------------------------------------------------ */
    const CSS = `
:root{
  --fz3-cyan:#8fb4ff;
  --fz3-blue:#3d5bf0;
  --fz3-violet:#6a5cff;
  --fz3-magenta:#ff3d8b;
  --fz3-amber:#ffc93c;
  --fz3-ink:#070818;
  --fz3-text:#e8f3ff;
  --fz3-mute:#9aa4d6;
  --fz3-line:rgba(110,130,255,.2);
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
  animation:fz3-drift 40s ease-in-out infinite alternate;
}
/* body::after 只在下面「图层」段定义一次。这里早先的 76px 网格版本已被后面 48px 网格版本
   逐属性完全覆盖（含 -webkit-mask-image 别名），属于死规则，删掉可少一层绘制声明。 */
@keyframes fz3-drift{
  from{transform:translate3d(-1.4%,-1%,0) scale(1.03)}
  to{transform:translate3d(1.6%,1.2%,0) scale(1.08)}
}
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
.fz3-veil{position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(58% 52% at 50% 42%,transparent 12%,rgba(2,5,13,.45) 72%,rgba(2,5,13,.92) 100%),
  linear-gradient(180deg,rgba(2,5,13,.62),transparent 32%,rgba(2,5,13,.78));}

/* ———————————————————— */
.fz3-boot{position:absolute;inset:0;background:#04060d;overflow:hidden;transition:opacity .6s ease}
.fz3-boot.is-out{opacity:0}
/* 自适应：视频按 contain 完整显示，四周用同一帧的模糊放大量补齐，任何比例都不出现突兀黑边 */
.fz3-boot-fill{
  position:absolute;inset:-8%;z-index:0;pointer-events:none;overflow:hidden;
  background:url('/fairy-zzz/assets/poster.jpg') center/cover no-repeat;
  filter:blur(46px) brightness(.74) saturate(1.45);transform:scale(1.1);opacity:1;
}
.fz3-boot-fill video{display:block;width:100%;height:100%;object-fit:cover;opacity:.85}
.fz3-boot video{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:contain;filter:saturate(1.06) contrast(1.04) brightness(.94)}
.fz3-boot::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  background:
    repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px),
    radial-gradient(124% 96% at 50% 50%,transparent 52%,rgba(0,0,0,.5) 100%);
}
.fz3-boot-hud{position:absolute;inset:0;pointer-events:none;font-size:10px;letter-spacing:.22em}
.fz3-boot-top{position:absolute;left:32px;right:70px;top:56px;display:flex;justify-content:space-between;color:rgba(150,225,255,.72);text-shadow:0 0 12px rgba(87,232,255,.6);letter-spacing:.24em}
.fz3-boot-top b{color:#eaf7ff;font-weight:600;letter-spacing:.18em}
.fz3-corner{position:absolute;width:34px;height:34px;border:1px solid rgba(110,220,255,.4);pointer-events:none}
.fz3-corner.tl{left:20px;top:44px;border-right:0;border-bottom:0}
.fz3-corner.tr{right:20px;top:44px;border-left:0;border-bottom:0}
.fz3-corner.bl{left:20px;bottom:96px;border-right:0;border-top:0}
.fz3-corner.br{right:20px;bottom:96px;border-left:0;border-top:0}
.fz3-boot-foot{position:absolute;left:32px;right:32px;bottom:30px;display:flex;flex-direction:column;gap:12px}
.fz3-boot-row{display:flex;align-items:center;gap:18px;width:100%}
.fz3-boot-title{font-size:10px;letter-spacing:.3em;color:rgba(206,238,255,.82);white-space:nowrap}
.fz3-boot-checks{display:flex;gap:16px;font-size:9px;letter-spacing:.18em;color:rgba(126,196,240,.6);margin-left:auto}
.fz3-boot-checks span::before{content:"◇";color:rgba(87,232,255,.78)}
.fz3-boot-bar{flex:1;height:2px;background:rgba(110,190,255,.14);position:relative;overflow:hidden;min-width:80px;box-shadow:0 0 18px rgba(60,120,255,.25)}
.fz3-boot-bar span{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#2f7bff,#57e8ff);box-shadow:0 0 16px rgba(87,232,255,.95);transition:width .22s linear}
.fz3-boot-pct{font-size:10.5px;font-variant-numeric:tabular-nums;color:#a9ecff;min-width:38px;text-align:right;letter-spacing:.1em}
/* 浏览器拦截带声音的自动播放时，提示点击一次开启（DSH 桌面壳通常允许直接出声，不显示这条）。 */
.fz3-boot-sound{position:absolute;left:0;right:0;bottom:78px;text-align:center;z-index:3;pointer-events:none;
  font-size:10px;letter-spacing:.2em;color:rgba(255,201,60,.85);animation:fz3-blink 1.6s ease-in-out infinite}
.fz3-skip{
  pointer-events:auto;font:inherit;font-size:9.5px;letter-spacing:.26em;color:rgba(206,240,255,.85);
  background:rgba(6,16,34,.55);border:1px solid rgba(110,220,255,.38);padding:7px 14px;cursor:pointer;flex:none;
  clip-path:polygon(0 0,100% 0,calc(100% - 9px) 100%,0 100%);
}
.fz3-skip:hover{background:rgba(87,232,255,.18);color:#fff;border-color:rgba(87,232,255,.75)}

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
.fz3-eye-glyph{transition:transform .28s ease}
.fz3-layer[data-phase="dock"] .fz3-core svg{filter:none;transition:transform .3s ease}
.fz3-layer[data-phase="dock"] .fz3-core:hover .fz3-eye-glyph{transform:scale(1.07)}
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
.fz3-copy-tap{margin-top:14px;font-size:10px;letter-spacing:.2em;color:rgba(255,201,60,.85);animation:fz3-blink 1.6s ease-in-out infinite}
.fz3-skip2{
  position:absolute;right:clamp(12px,2.4vw,30px);bottom:clamp(10px,2.6vh,26px);pointer-events:auto;background:none;border:0;font:inherit;
  font-size:9.5px;letter-spacing:.26em;color:rgba(150,200,235,.55);cursor:pointer;padding:8px;
}
.fz3-skip2:hover{color:#9fefff}

/* ---------- 左下角坞 ---------- */
.fz3-tag{
  position:fixed;left:calc(var(--fz3-dock-x) + 62px);top:calc(100% - 262px);z-index:5;pointer-events:none;
  display:flex;flex-direction:column;gap:3px;padding:5px 12px 6px 10px;border-left:2px solid rgba(87,232,255,.75);
  background:linear-gradient(90deg,rgba(8,20,42,.82),rgba(8,20,42,0));
  opacity:0;transform:translateX(-8px);
  transition:opacity .6s ease .35s,transform .6s ease .35s;
}
.fz3-layer[data-phase="dock"] .fz3-tag{opacity:1;transform:none}
.fz3-tag b{font-size:11px;letter-spacing:.3em;color:#e6f8ff;text-shadow:0 0 14px rgba(87,232,255,.7)}
.fz3-tag i{font-style:normal;font-size:7.5px;letter-spacing:.24em;color:rgba(140,196,240,.85)}
.fz3-panel{
  position:fixed;left:calc(var(--fz3-dock-x) - 30px);bottom:330px;width:308px;z-index:6;pointer-events:auto;
  padding:14px 15px 12px;color:var(--fz3-text);
  background:linear-gradient(158deg,rgba(10,21,44,.97),rgba(4,8,20,.985));
  border:1px solid rgba(87,232,255,.32);
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
  box-shadow:0 26px 70px -26px rgba(0,0,0,.95),0 0 46px -22px rgba(87,232,255,.75);
  animation:fz3-panel-in .26s cubic-bezier(.2,.8,.2,1);
  transform-origin:10% 100%;
}
.fz3-panel::before{content:"";position:absolute;left:0;top:0;width:72px;height:2px;background:linear-gradient(90deg,#57e8ff,transparent)}
.fz3-panel::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.24;
  background:repeating-linear-gradient(0deg,rgba(0,0,0,.4) 0 1px,transparent 1px 4px)}
.fz3-panel-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:9px;border-bottom:1px solid rgba(87,232,255,.18)}
.fz3-panel-title{font-size:10.5px;letter-spacing:.26em;color:#dff4ff;text-shadow:0 0 10px rgba(87,232,255,.5)}
.fz3-dot{width:6px;height:6px;border-radius:50%;background:#3ef0b0;box-shadow:0 0 10px #3ef0b0;flex:none}
.fz3-dot.off{background:#ff5d7a;box-shadow:0 0 10px #ff5d7a}
.fz3-dot.warn{background:#ffc93c;box-shadow:0 0 10px #ffc93c}
.fz3-panel-sub{font-size:8.5px;letter-spacing:.14em;color:rgba(130,170,215,.68);margin:8px 0 10px}
.fz3-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;font-size:12px;color:rgba(222,238,255,.92)}
.fz3-row-label{display:flex;align-items:center;gap:8px;letter-spacing:.06em}
.fz3-row small{font-size:9px;letter-spacing:.14em;color:rgba(120,170,215,.7)}
.fz3-switch{
  position:relative;width:38px;height:19px;flex:none;padding:0;border:1px solid rgba(87,232,255,.35);
  background:rgba(8,16,34,.9);cursor:pointer;
  clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
}
.fz3-switch::after{
  content:"";position:absolute;top:2px;left:2px;width:13px;height:13px;background:rgba(150,180,210,.75);
  transition:transform .18s ease,background .18s ease,box-shadow .18s ease;
}
.fz3-switch[data-on="1"]{border-color:rgba(87,232,255,.8);box-shadow:inset 0 0 14px -6px rgba(87,232,255,.9)}
.fz3-switch[data-on="1"]::after{transform:translateX(19px);background:var(--fz3-cyan);box-shadow:0 0 10px var(--fz3-cyan)}
.fz3-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;position:relative;z-index:1}
.fz3-btn{
  font:inherit;font-size:10px;letter-spacing:.1em;color:rgba(214,236,255,.9);background:rgba(10,22,44,.8);
  border:1px solid rgba(87,232,255,.24);padding:8px 8px;cursor:pointer;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
}
.fz3-btn:hover{background:rgba(87,232,255,.16);border-color:rgba(87,232,255,.7);color:#fff}
.fz3-btn:disabled{opacity:.45;cursor:not-allowed}
.fz3-btn.is-ghost{background:transparent;border-color:rgba(120,160,210,.16);color:rgba(160,190,220,.75)}
.fz3-panel-foot{margin-top:10px;padding-top:8px;border-top:1px solid rgba(87,232,255,.12);display:flex;justify-content:space-between;font-size:7.5px;letter-spacing:.16em;color:rgba(110,150,200,.55)}
.fz3-wave{display:inline-flex;align-items:flex-end;gap:2px;height:11px;margin-left:8px}
.fz3-wave i{display:block;width:2px;height:3px;background:var(--fz3-cyan);box-shadow:0 0 6px var(--fz3-cyan)}
.fz3-wave.on i{animation:fz3-wave .9s ease-in-out infinite}
.fz3-wave i:nth-child(2){animation-delay:.1s}
.fz3-wave i:nth-child(3){animation-delay:.2s}
.fz3-wave i:nth-child(4){animation-delay:.3s}

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
.fz3-frame{position:fixed;inset:0;pointer-events:none;z-index:3;border-radius:16px;
  box-shadow:0 0 0 7px rgba(8,6,18,.92),0 0 0 8px rgba(146,126,255,.22),0 0 0 14px rgba(70,50,180,.10),0 24px 70px rgba(0,0,0,.55)}
.fz3-sb-stats{position:fixed;left:12px;bottom:74px;width:258px;padding:10px 12px;border-radius:12px;pointer-events:none;z-index:4;
  background:linear-gradient(180deg,rgba(16,14,34,.94),rgba(11,10,24,.94));border:1px solid rgba(120,110,255,.16);
  box-shadow:0 12px 30px rgba(0,0,0,.45);opacity:0;transition:opacity .6s ease .45s}
.fz3-layer[data-phase="dock"] .fz3-sb-stats{opacity:1}
.fz3-sb-row{display:flex;align-items:baseline;gap:8px;font-size:10px;letter-spacing:.06em;color:rgba(150,164,214,.78)}
.fz3-sb-row b{font-size:12px;font-weight:600;color:#eaf0ff;letter-spacing:.02em}
.fz3-sb-row2{margin-top:7px}
.fz3-sb-row em{margin-left:auto;font-style:normal;font-size:9px;padding:2px 7px;border-radius:6px;
  color:rgba(196,208,255,.9);background:rgba(90,80,190,.22);border:1px solid rgba(130,120,255,.22)}
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

.fz3-wave{position:fixed;right:24px;bottom:118px;width:104px;display:flex;flex-direction:column;align-items:center;gap:7px;
  pointer-events:none;z-index:4;opacity:0;transition:opacity .6s ease .5s}
.fz3-layer[data-phase="dock"] .fz3-wave{opacity:1}
.fz3-wave-dot{width:5px;height:5px;border-radius:50%;background:#ff6b8a;box-shadow:0 0 8px rgba(255,107,138,.9);align-self:flex-start;margin-left:6px}
.fz3-wave-bars{display:flex;align-items:center;gap:3px;height:22px;min-height:22px}
.fz3-wave-bars i{display:block;width:4px;height:22px;border-radius:2px;background:linear-gradient(180deg,rgba(196,216,255,1),rgba(108,140,255,.75));
  transform-origin:bottom;animation:fz3-bar 1.05s ease-in-out infinite}
.fz3-wave-bars i:nth-child(1){animation-delay:0s}.fz3-wave-bars i:nth-child(2){animation-delay:.12s}
.fz3-wave-bars i:nth-child(3){animation-delay:.24s}.fz3-wave-bars i:nth-child(4){animation-delay:.06s}
.fz3-wave-bars i:nth-child(5){animation-delay:.3s}.fz3-wave-bars i:nth-child(6){animation-delay:.18s}
.fz3-wave-bars i:nth-child(7){animation-delay:.36s}.fz3-wave-bars i:nth-child(8){animation-delay:.09s}
.fz3-wave-bars i:nth-child(9){animation-delay:.27s}.fz3-wave-bars i:nth-child(10){animation-delay:.15s}
.fz3-wave-bars i:nth-child(11){animation-delay:.33s}.fz3-wave-bars i:nth-child(12){animation-delay:.21s}
@keyframes fz3-bar{0%,100%{transform:scaleY(.28)}50%{transform:scaleY(1)}}
.fz3-wave-slider{position:relative;width:88px;height:10px;border-radius:6px;background:rgba(18,20,44,.92);
  border:1px solid rgba(120,140,255,.18);box-shadow:inset 0 1px 2px rgba(0,0,0,.5)}
.fz3-wave-slider b{position:absolute;left:3px;top:2px;bottom:2px;width:58%;border-radius:5px;
  background:linear-gradient(90deg,rgba(110,90,255,.85),rgba(150,120,255,.55))}
.fz3-wave-slider-2 b{width:34%;background:linear-gradient(90deg,rgba(70,120,255,.8),rgba(120,150,255,.45))}
.fz3-boot-top,.fz3-boot-foot,.fz3-boot-checks,.fz3-boot-ver,.fz3-boot-corner,.fz3-corner,.fz3-tag{display:none!important}
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
.fz3-atmos-glow{position:absolute;left:-12%;top:-26%;width:64%;height:70%;background:radial-gradient(circle,rgba(70,52,255,.16),rgba(60,46,240,.05) 52%,transparent 78%);animation:fz3-breathe 14s ease-in-out infinite}
.fz3-atmos-flash{position:absolute;right:4%;top:2%;width:34%;height:30%;background:radial-gradient(ellipse at 60% 20%,rgba(120,190,255,.16),rgba(100,160,255,.04) 42%,transparent 72%);animation:fz3-flash 11s steps(1) infinite}

@keyframes fz3-rot{to{transform:rotate(360deg)}}
@keyframes fz3-rot-rev{to{transform:rotate(-360deg)}}
@keyframes fz3-line{to{opacity:1;transform:none}}
@keyframes fz3-blink{50%{opacity:.3}}
@keyframes fz3-breathe{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes fz3-twinkle{0%,100%{opacity:.15}45%{opacity:.9}55%{opacity:.35}}
@keyframes fz3-wave{0%,100%{height:3px}50%{height:11px}}
@keyframes fz3-flash{0%,38%,41%,63%,100%{opacity:.35}39%,40%,64%{opacity:.85}}
@keyframes fz3-panel-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}

@media (max-width:1180px){
  :root{--fz3-dock-size:112px}
}
@media (max-width:820px){
  :root{--fz3-dock-size:84px;--fz3-eye-cy:40vh}
  .fz3-tag{left:calc(var(--fz3-dock-x) + 38px);top:calc(100% - 214px)}
  .fz3-panel{left:12px;width:min(320px,calc(100vw - 24px))}
  .fz3-boot-checks{display:none}
  .fz3-boot-title{display:none}
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
      const ping = useCallback(() => {
        fetch('/fairy-zzz/health', { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => setEngine(data))
          .catch(() => setEngine({ ok: false, engine: false }))
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
          setEngineBusy(action)
          fetch('/fairy-zzz/engine?action=' + action, { cache: 'no-store' })
            .catch(() => {})
            .then(() => {
              ping()
              setTimeout(ping, 1500)
              setTimeout(ping, 4000)
              setTimeout(() => setEngineBusy(''), 600)
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
            ? '已就绪 · GPT-SoVITS（本地 CPU 推理）'
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
      const playGreet = () => { stopSpeech(); const audio = new Audio(GREETING()); audio.play().catch(() => {}) }
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
          h('button', { type: 'button', className: 'fz3-set-btn', onClick: testVoice, disabled: busy }, '测试语音'),
          h('button', { type: 'button', className: 'fz3-set-btn is-ghost', onClick: stopSpeech, disabled: !busy }, '停止'),
        ),
        h('div', { className: 'fz3-set-note' }, 'Fairy 皮肤 · 待机随机眨眼与花屏、思考态眼睑呼吸，开关都在这里；聊天区左下的眼标只作状态指示，不再弹出面板。'),
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

    function BrandName() {
      return h(
        'span',
        { className: 'fz3-brandname' },
        h('b', null, 'FAIRY'),
        h('i', null, 'Ⅲ · H.D.D'),
      )
    }

    function Waveform({ on }) {
      return h(
        'span',
        { className: 'fz3-wave' + (on ? ' on' : '') },
        h('i'),
        h('i'),
        h('i'),
        h('i'),
      )
    }

    /* ------------------------------------------------------------------ *
     * ———————————— */
    function BootStage({ onDone }) {
      const videoRef = useRef(null)
      /* 进度条不再走 React state：timeupdate 每秒约 4 次，setState 会连带重渲染整个 HUD。
         改成直接写两个 DOM 节点的 width/textContent，渲染次数从 ~60 次降到 1 次。 */
      const barRef = useRef(null)
      const pctRef = useRef(null)
      const [out, setOut] = useState(false)
      const [soundBlocked, setSoundBlocked] = useState(false)
      const doneRef = useRef(false)

      const finish = useCallback(() => {
        if (doneRef.current) return
        doneRef.current = true
        setOut(true)
        setTimeout(onDone, 640)
      }, [onDone])

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

      const onTime = () => {
        const video = videoRef.current
        if (!video || !video.duration) return
        const value = Math.max(0, Math.min(100, (video.currentTime / video.duration) * 100))
        if (barRef.current) barRef.current.style.width = value + '%'
        if (pctRef.current) pctRef.current.textContent = Math.round(value) + '%'
      }

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
          onTimeUpdate: onTime,
        }),
        soundBlocked ? h('div', { className: 'fz3-boot-sound' }, t('boot.sound')) : null,
        h(
          'div',
          { className: 'fz3-boot-hud' },
          h(
            'div',
            { className: 'fz3-boot-top' },
            h('span', null, t('boot.kicker')),
            h('span', null, 'FAIRY.OS ', h('b', null, '3.01')),
          ),
          h('span', { className: 'fz3-corner tl' }),
          h('span', { className: 'fz3-corner tr' }),
          h('span', { className: 'fz3-corner bl' }),
          h('span', { className: 'fz3-corner br' }),
          h(
            'div',
            { className: 'fz3-boot-foot' },
            h(
              'div',
              { className: 'fz3-boot-row' },
              h('span', { className: 'fz3-boot-title' }, 'H.D.D // SYSTEM BOOT'),
              h(
                'span',
                { className: 'fz3-boot-checks' },
                h('span', null, t('boot.check1')),
                h('span', null, t('boot.check2')),
                h('span', null, t('boot.check3')),
              ),
            ),
            h(
              'div',
              { className: 'fz3-boot-row' },
              h('span', { className: 'fz3-boot-bar' }, h('span', { ref: barRef })),
              h('span', { className: 'fz3-boot-pct', ref: pctRef }, '0%'),
              h('button', { type: 'button', className: 'fz3-skip', onClick: finish }, t('boot.skip') + ' ▸'),
            ),
          ),
        ),
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
      return h(
        'div',
        { className: 'fz3-atmos', 'aria-hidden': 'true' },
        h('div', { className: 'fz3-atmos-glow' }),
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


    function FairySkin() {
      const [phase, setPhase] = useState('boot')

      /* 运行态情绪：宿主 /fairy-zzz/mood 轮询（idle / thinking / working / done） */
      const [mood, setMood] = useState('idle')

      useEffect(() => {
        /* 官方字标位置测量：拿到 logo 行 / brandIdentity 的矩形，把我们的
           Fairy 字标钉在同一位置。字标本身由 CSS 隐藏（它是 SVG，没有文本）。 */
        let tries = 0
        const run = () => {
          const row = document.querySelector('[class*="_brandIdentity"]') || document.querySelector('[class*="_logoRow"]')
          if (!row) return false
          const r = row.getBoundingClientRect()
          if (r.width <= 0 || r.height <= 0) return false
          const root = document.documentElement
          root.style.setProperty('--fz3-brand-top', Math.round(r.top - 6) + 'px')
          root.style.setProperty('--fz3-brand-left', Math.round(r.left) + 'px')
          root.style.setProperty('--fz3-brand-h', Math.round(Math.max(34, r.height + 10)) + 'px')
          return true
        }
        const timer = setInterval(() => {
          tries += 1
          try { if (run() || tries > 14) clearInterval(timer) } catch (e) { clearInterval(timer) }
        }, 500)
        return () => clearInterval(timer)
      }, [])
      useEffect(() => {
        /* dock 定位：找到会话区（左侧最靠左的宽容器），把眼标钉在它的左缘中部，
           与参考视频里「对话时靠在聊天区左边」的位置一致；找不到就退回 25vw / 52vh。
           性能注意：全量 getBoundingClientRect 扫描会强制同步布局（上千个 div），原来最多扫 16 次；
           现在只要扫到过一次就缓存命中的那个容器，之后重试/窗口缩放只量它一个元素。 */
        let tries = 0
        let timer = null
        let cached = null
        const fits = (r, vw) => r.width >= 420 && r.height >= 300 && r.left >= 260 && r.left <= vw * 0.5 && r.width <= vw * 0.9
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
            const all = document.querySelectorAll('div,main,section')
            let bestEl = null
            for (let i = 0; i < all.length; i += 1) {
              const el = all[i]
              const r = el.getBoundingClientRect()
              if (!fits(r, vw)) continue
              if (!best || r.left < best.left) {
                best = r
                bestEl = el
              }
            }
            if (bestEl) cached = bestEl
          }
          if (best) {
            const size = parseFloat(getComputedStyle(root).getPropertyValue('--fz3-dock-size')) || 128
            let cx = Math.round(best.left + size / 2 - 2)
            let cy = Math.round(best.top + best.height * 0.5)
            if (cx < vw * 0.16 || cx > vw * 0.46) cx = Math.round(vw * 0.25)
            if (cy < window.innerHeight * 0.22 || cy > window.innerHeight * 0.82) cy = Math.round(window.innerHeight * 0.52)
            root.style.setProperty('--fz3-dock-x', cx + 'px')
            root.style.setProperty('--fz3-dock-y', cy + 'px')
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
          window.removeEventListener('resize', onResize)
        }
      }, [])

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
      const coreRef = useRef(null)
      const voiceState = useVoice()

      const toGreet = useCallback(() => {
        stopSpeech()
        setPhase('greet')
      }, [])

      const toDock = useCallback(() => {
        setPhase('dock')
        setNeedTap(false)
        autoArmAt = Date.now() + 2600
      }, [])

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
        const fn = () => { stopSpeech(); setPhase('boot') }
        bootHooks.add(fn)
        return () => { bootHooks.delete(fn) }
      }, [])

      const busy = voiceState.busy || voiceState.speaking

      return h(
        'div',
        { className: 'fz3-layer', 'data-phase': phase, 'data-mood': mood },
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
        phase !== 'boot'
          ? h(
              'div',
              {
                ref: coreRef,
                className: 'fz3-core',
                'data-phase': phase,
                title: phase === 'dock' ? 'Fairy · 设置 → Fairy' : undefined,
              },
              h(CoreGlyph, { phase, mood }),
            )
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

        /* 左下角标签 */
        h(
          'div',
          { className: 'fz3-tag' },
          h('b', null, t('dock.tag')),
          h('i', null, t('dock.tagsub')),
        ),

      )
    }

    /* ------------------------------------------------------------------ *
     * 挂载
     * ------------------------------------------------------------------ */
    return {
      inject: ['slots'],
      apply(ctx) {
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
          if (document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']')) return
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
        mount('shell.overlay', { id: 'fairy-zzz-skin', order: 24 }, FairySkin)
        mount('shell.overlay', { id: 'fairy-zzz-atmos', order: 12 }, Atmos)
            mount('conversation.chat.assistant-actions', { id: 'fairy-zzz-voice', order: 20, label: '朗读' }, VoiceAction)
        mount('settings.section', { id: 'fairy-zzz-settings', order: 40, label: 'Fairy' }, FairySettings)
      },
    }
  },
})

