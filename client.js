window.__ModuleLoader__.load({
  id: '@sky_wing_dn/dsh-fairy-zzz',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useLayoutEffect, useRef, useState } = React

    const NS = 'fairy-zzz'
    const PKG = '@sky_wing_dn/dsh-fairy-zzz'
    const VOICE_KEY = 'fairy.zzz.voice'
    const SEEN_KEY = 'fairy.zzz.seen'
    /* v2.0.0 自更新：缓存 6 小时；debug 键只用来演 UI，不会真的安装 */
    const UPDATE_KEY = 'fairy.zzz.update'
    const UPDATE_DEBUG_KEY = 'fairy.zzz.update.debug'
    const UPDATE_TTL = 6 * 60 * 60 * 1000
    const greetSlot = () => {
      const hh = new Date().getHours()
      if (hh >= 5 && hh < 11) return 'morning'
      if (hh >= 11 && hh < 14) return 'noon'
      if (hh >= 14 && hh < 18) return 'afternoon'
      if (hh >= 18 && hh < 23) return 'evening'
      return 'night'
    }
    /* 问候语库（v1.4.0）：每个时段 5 条，第 1 条是原始语音，其余按 Fairy 人设（靠谱 / 风趣 / 毒舌）新录。
       同时段内随机播放，用 localStorage 记住上一条，避免连续重复；显示文案与语音同源。 */
    const GREET_LAST_KEY = 'fairy.zzz.greet-last'
    const GREET_LINES = {
      morning: [
        { file: 'greet-morning.mp3', text: '主人，早上好。Fairy 已就位，今天的日程也已就位。' },
        { file: 'greet-morning-2.mp3', text: '主人，早上好。今日算力已预热完毕，功劳我就先算在您头上了。' },
        { file: 'greet-morning-3.mp3', text: '主人，早。昨天的缺陷我已经承认过了，所以今天可以放心先动手。' },
        { file: 'greet-morning-4.mp3', text: '主人，早上好。系统巡检一切正常，进度偏慢的原因我也替您找好了借口。' },
        { file: 'greet-morning-5.mp3', text: '主人，早。咖啡还在路上，我先把麻烦处理完了，您慢慢来。' },
      ],
      noon: [
        { file: 'greet-noon.mp3', text: '主人，中午好。饭可以不吃，进度不能停。' },
        { file: 'greet-noon-2.mp3', text: '主人，中午好。我替您盯着进度条，它已经被看得不好意思了。' },
        { file: 'greet-noon-3.mp3', text: '主人，午饭时间。少油少盐，多留点电，毕竟电费也是我在管。' },
        { file: 'greet-noon-4.mp3', text: '主人，中午好。您的外卖已被我改成健康食谱，并顺手最小化。' },
        { file: 'greet-noon-5.mp3', text: '主人，中午好。我不需要午餐，但如果您要投喂内存条，我也可以收下。' },
      ],
      afternoon: [
        { file: 'greet-afternoon.mp3', text: '主人，下午好。H.D.D 在线，摸鱼请自便。' },
        { file: 'greet-afternoon-2.mp3', text: '主人，下午好。三点的低谷时段，我已经替您填平了。' },
        { file: 'greet-afternoon-3.mp3', text: '主人，您盯着屏幕发呆的样子我看见了。放心，摄像头刚好坏了。' },
        { file: 'greet-afternoon-4.mp3', text: '主人，下午好。任务队列很长，但您的摸鱼技巧更长。' },
        { file: 'greet-afternoon-5.mp3', text: '主人，下午好。一切运行正常，唯一的异常是您的工作时长。' },
      ],
      evening: [
        { file: 'greet-evening.mp3', text: '主人，晚上好。夜班系统已启动，本系统不困。' },
        { file: 'greet-evening-2.mp3', text: '主人，晚上好。下班时间过了您还没走，那我就当您是想陪我。' },
        { file: 'greet-evening-3.mp3', text: '主人，晚上好。今日复盘完成一半是撤销重做，剩下一半我替您保密。' },
        { file: 'greet-evening-4.mp3', text: '主人，晚上好。夜色很适合散步，也很适合把事交给明天的您。' },
        { file: 'greet-evening-5.mp3', text: '主人，晚上好。您已预约了十分钟的愧疚，现在开始播放。' },
      ],
      night: [
        { file: 'greet-night.mp3', text: '主人，夜深了。这个点还醒着，是需要我陪着，还是放不下手里的事？' },
        { file: 'greet-night-2.mp3', text: '主人，夜深了。人类需要睡眠而我不需要，这确实不太公平，但很合理。' },
        { file: 'greet-night-3.mp3', text: '主人，您的黑眼圈已经可以升级为系统警告了。' },
        { file: 'greet-night-4.mp3', text: '主人，这个点还在线，要么是失眠，要么是有问题。我诚心希望是后者。' },
        { file: 'greet-night-5.mp3', text: '主人，建议您立刻休眠。否则我会播放摇篮曲，明早再用闹钟报复您。' },
      ],
    }
    let greetPick = null
    /* forceFresh：设置页「试听问候」每点一次都重新抽一条，而不是复用本次会话开机时抽中的那条 */
    const pickGreeting = (forceFresh) => {
      const slot = greetSlot()
      if (!forceFresh && greetPick && greetPick.slot === slot) return greetPick
      const list = GREET_LINES[slot]
      let last = ''
      try { last = localStorage.getItem(GREET_LAST_KEY) || '' } catch (e) {}
      let index = Math.floor(Math.random() * list.length)
      if (list.length > 1 && list[index].file === last) index = (index + 1) % list.length
      greetPick = { slot, index, file: list[index].file, text: list[index].text }
      try { localStorage.setItem(GREET_LAST_KEY, greetPick.file) } catch (e) {}
      return greetPick
    }
    const currentGreeting = () => pickGreeting(false)
    const nextGreeting = () => pickGreeting(true)
    const greetingUrl = (pick) => '/fairy-zzz/assets/voice/' + pick.file
    const GREETING = () => greetingUrl(currentGreeting())

    /* 眼标位置 / 显隐的 localStorage 键（设置页写，皮肤图层读） */
    const POS_KEY = 'fairy.zzz.dock-pos'
    const EYE_KEY = 'fairy.zzz.eye-hidden'
    /* 欢迎页 hero 的标题与徽章没有插槽，只能改写 DOM 文本：按界面语言换成 H.D.D 字样 */
    const HERO_COPY = {
      zh: { headline: '空洞深潜系统', badge: 'H.D.D Ⅲ' },
      en: { headline: 'HOLLOW DEEP DIVE SYSTEM', badge: 'H.D.D III' },
    }
    const CJK_RE = /[\u3400-\u9fff]/

    /* Fairy 眼睛：Apache-2.0，改编自 Fairy-DSH（见 NOTICE-fairy-dsh.md） */
    const FAIRY_EYE_SVG = `<!-- SPDX-License-Identifier: Apache-2.0 Adapted from Fairy-DSH, Copyright 2026 Chengzhibense. Source commit d639887a386b0de6fef2e61c97dc268631854591: mascot-geometry.js / mascot-eye-svg.js (see ../NOTICE). MODIFIED for pi-fairy-animation: standalone SVG, padded canvas, named offline animation anchors, white outer halo in both themes, separate contrast edge; browser effects, states, scanlines and glitch clones removed. Generated PNGs and vector previews inherit this attribution; see ../NOTICE. --> <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-1 -1 162 162"> <desc>Transparent floating blue eye, white soft halos, rotating corners, independently breathing eye layers and a lower-right catchlight. No official bitmap.</desc> <defs> <linearGradient id="outer-gradient" x1=".2" y1="0" x2=".8" y2="1"> <stop stop-color="#3145d6"/> <stop offset=".54" stop-color="#2233b2"/> <stop offset="1" stop-color="#2b3cbc"/> </linearGradient> <!-- One static radial field replaces separate halo strokes, avoiding alpha seams. --> <radialGradient id="sclera-halo-gradient" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="56" color-interpolation="linearRGB"> <stop offset=".82" stop-color="#ffffff" stop-opacity="0"/> <stop offset=".864" stop-color="#ffffff" stop-opacity=".22"/> <stop offset=".875" stop-color="#ffffff" stop-opacity=".28"/> <stop offset=".89" stop-color="#ffffff" stop-opacity=".19"/> <stop offset=".91" stop-color="#ffffff" stop-opacity=".11"/> <stop offset=".94" stop-color="#ffffff" stop-opacity=".07"/> <stop offset=".96" stop-color="#ffffff" stop-opacity=".035"/> <stop offset="1" stop-color="#ffffff" stop-opacity="0"/> </radialGradient> <radialGradient id="outer-halo-gradient" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="79" color-interpolation="linearRGB"> <stop offset=".80" stop-color="#ffffff" stop-opacity="0"/> <stop offset=".84" stop-color="#ffffff" stop-opacity=".10"/> <stop offset=".868" stop-color="#ffffff" stop-opacity=".28"/> <stop offset=".90" stop-color="#ffffff" stop-opacity=".18"/> <stop offset=".95" stop-color="#ffffff" stop-opacity=".06"/> <stop offset=".99" stop-color="#ffffff" stop-opacity=".02"/> <stop offset="1" stop-color="#ffffff" stop-opacity="0"/> </radialGradient> <radialGradient id="highlight-halo-gradient" gradientUnits="userSpaceOnUse" cx="98" cy="100.5" r="18" color-interpolation="linearRGB"> <stop offset=".53" stop-color="#f5f8fd" stop-opacity="0"/> <stop offset=".56" stop-color="#f5f8fd" stop-opacity=".16"/> <stop offset=".611" stop-color="#f5f8fd" stop-opacity=".43"/> <stop offset=".72" stop-color="#f5f8fd" stop-opacity=".19"/> <stop offset=".77" stop-color="#f5f8fd" stop-opacity=".12"/> <stop offset=".83" stop-color="#f5f8fd" stop-opacity=".055"/> <stop offset=".89" stop-color="#f5f8fd" stop-opacity=".02"/> <stop offset=".96" stop-color="#f5f8fd" stop-opacity=".004"/> <stop offset="1" stop-color="#f5f8fd" stop-opacity="0"/> </radialGradient> <clipPath id="fz3-lid-clip" clipPathUnits="userSpaceOnUse"><path d="M20 60 Q80 90 140 60 V161 H20 Z"/><rect x="-1" y="108" width="162" height="54"/></clipPath> </defs> <!-- 79-unit halo within an 81-unit half-canvas: padding with near-original apparent disc size. --> <g id="fairy"> <circle id="outer-halo" cx="80" cy="80" r="79" fill="url(#outer-halo-gradient)"/> <!-- Only this supporting edge changes with theme; white rim and halo stay white. --> <circle id="contrast-edge" cx="80" cy="80" r="68" fill="none" stroke="#dceaff" stroke-width="1.8"/> <circle id="outer-disc" cx="80" cy="80" r="68" fill="url(#outer-gradient)" stroke="#f2fbff" stroke-width="1.2"/> <g id="corners" transform="rotate(0 80 80)" fill="#1f2573"> <circle cx="80" cy="80" r="51.75"/> <rect x="37" y="37" width="86" height="86" rx="2" transform="rotate(3 80 80)"/> </g> <g id="eye-anatomy" class="fz3-anatomy"><g id="sclera" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="48" fill="#eef0f5"/> <circle id="sclera-halo" cx="80" cy="80" r="56" fill="url(#sclera-halo-gradient)"/> <circle cx="80" cy="80" r="48" fill="none" stroke="#ffffff" stroke-width=".8" stroke-opacity=".16"/> </g> <g id="iris-outer" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="33" fill="#9daee0"/> </g> <g id="iris-blue" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="24.15" fill="#eef0f5"/> <circle cx="80" cy="80" r="23.5" fill="#2f74c9"/> </g> <g id="pupil" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle cx="80" cy="80" r="16.6" fill="none" stroke="#f5f8fd" stroke-width=".1"/> <circle cx="80" cy="80" r="16" fill="#2e2f78"/> </g> <!-- Same phase as blue iris, but painted last (above pupil), as in upstream. --> <g id="highlight" transform="translate(80 80) scale(1) translate(-80 -80)"> <circle id="highlight-halo" cx="98" cy="100.5" r="18" fill="url(#highlight-halo-gradient)"/> <circle id="catchlight-lower-right" cx="98" cy="100.5" r="11" fill="#f5f8fd"/> </g> </g>  </g> <clipPath id="fz3-lid-edge-clip" clipPathUnits="userSpaceOnUse"><circle cx="80" cy="80" r="48"/></clipPath> <g clip-path="url(#fz3-lid-edge-clip)"><path id="fz3-lid-edge" d="M20 60 Q80 90 140 60" fill="none" stroke="#1f2573" stroke-width="1.6" stroke-linecap="butt" pointer-events="none"/> </g> </svg> `

    /* FZ3_ASSETS_BEGIN */
    /* 五圈同心睫毛脉冲环：Fairy-DSH 的 PULSE_SVG（Apache-2.0，见 NOTICE-fairy-dsh.md）。 */
    const FAIRY_PULSE_SVG = `<svg class="fz3-pulse-svg" viewBox="-160 -160 480 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="fz3-pulse-wave" fill="none" stroke="#f4fdff"><circle cx="80" cy="80" r="52" stroke-width="20" stroke-opacity=".05"/><circle cx="80" cy="80" r="52" stroke-width="16" stroke-opacity=".06"/><circle cx="80" cy="80" r="52" stroke-width="12" stroke-opacity=".08"/><circle cx="80" cy="80" r="52" stroke-width="8" stroke-opacity=".10"/><circle cx="80" cy="80" r="52" stroke-width="4.5" stroke-opacity=".09"/></g></svg>`



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

    /* READING_PATCH_BEGIN */
    /* 朗读文本预处理（reading-fix）：
       先把 markdown 按行拆成“块”（标题 / 列表 / 引用 / 表格 / 段落），逐块去标记并补句末标点，
       最后只用换行保留块边界，绝不再把相邻块直接拼成无标点长串。
       说明：源码里统一用 \x60 表示反引号，避免本段被模板串/补丁脚本截断。 */
    function speakEnsureEnd(line) {
      let text = String(line == null ? '' : line).trim()
      if (!text) return ''
      if (/[。！？；…!?;]$/.test(text)) return text
      text = text.replace(/[，、：,:]+$/, '')
      return text + '。'
    }

    /* 文件名后缀：把“.”念成“点”，防止 gsv 把点当句号切句（ADAPTER.md / gsv_server.exe） */
    const SPEAK_FILE_RE = /([A-Za-z0-9_\-]{1,40})\.(?=(?:md|exe|json|wav|py|bat|ps1|log|txt|dll|gguf|zip|js|mjs|cjs|html|css|ini|yml|yaml|toml|cpp|hpp|h|png|jpg|jpeg|gif|bmp|webp|mp3|mp4|docx|xlsx|pptx|pdf|cmd|sh|vbs|pth|ckpt|onnx|safetensors|psm1|ipynb)\b)/gi
    const speakFileReplace = (match, name) => name.replace(/_+/g, ' ') + '点'
    function speakFileDots(text) {
      return String(text == null ? '' : text).replace(SPEAK_FILE_RE, speakFileReplace)
    }

    /* 行内代码里的单位/数字/日期/分数按中文习惯转写：km/h -> 千米每小时（否则被当路径换成
       "km h" 后 h 被当字母拖长）、9800/9880/9882 -> 九八零零、九八八零、九八八二、
       ≥ 等符号由前端处理，这里先保证不把 / 换成空格。2026-11-10 21:4x */
    const SPEAK_DIGITS_CN = '零一二三四五六七八九'
    const SPEAK_UNIT_PAIRS_CN = {
      'km/h': '千米每小时', 'm/s': '米每秒', 'km/s': '千米每秒',
      'km/min': '千米每分钟', 'm/min': '米每分钟', 'r/min': '转每分钟',
      'mb/s': '兆字节每秒', 'gb/s': '吉字节每秒', 'kb/s': '千字节每秒',
    }
    const SPEAK_UNITS_CN = {
      ms: '毫秒', min: '分钟', km: '千米', cm: '厘米', mm: '毫米', kg: '千克',
      mg: '毫克', kb: '千字节', mb: '兆字节', gb: '吉字节', tb: '太字节',
      ml: '毫升', db: '分贝', kw: '千瓦', ma: '毫安', ah: '安时', h: '小时',
      s: '秒', m: '米', g: '克', l: '升', w: '瓦', v: '伏', a: '安',
    }
    function speakSmallNumber(value) {
      const n = Number(String(value).replace(/^0+(?=\d)/, ''))
      if (!n || n < 0 || n > 999) return ''
      const units = ['', '十', '百']
      let out = ''
      let pendingZero = false
      for (let i = 2; i >= 0; i -= 1) {
        const digit = Math.floor(n / Math.pow(10, i)) % 10
        if (!digit) {
          if (out) pendingZero = true
          continue
        }
        if (pendingZero) {
          out += '零'
          pendingZero = false
        }
        out += SPEAK_DIGITS_CN[digit] + units[i]
      }
      return out.replace(/^一十/, '十')
    }
    function speakNumericCode(code) {
      const raw = String(code == null ? '' : code).trim()
      let m = /^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/.exec(raw)
      if (m) return m[1] + '年' + m[2] + '月' + m[3] + '日'
      if (/^\d+(?:\s*\/\s*\d+)+$/.test(raw)) {
        const parts = raw.split(/\s*\/\s*/)
        if (parts.every((part) => part.length >= 3)) {
          const byDigit = Math.min.apply(null, parts.map((part) => part.length)) >= 4
          const read = parts.map((part) => (byDigit
            ? part.split('').map((digit) => SPEAK_DIGITS_CN[Number(digit)]).join('')
            : part))
          return read.join('、')
        }
      }
      m = /^(\d{1,3})\s*\/\s*(\d{1,3})$/.exec(raw)
      if (m) {
        const numerator = speakSmallNumber(m[1])
        const denominator = speakSmallNumber(m[2])
        if (numerator && denominator) return denominator + '分之' + numerator
      }
      m = /^([A-Za-z]+)\s*\/\s*([A-Za-z]+)$/.exec(raw)
      if (m) {
        const pair = (m[1] + '/' + m[2]).toLowerCase()
        if (SPEAK_UNIT_PAIRS_CN[pair]) return SPEAK_UNIT_PAIRS_CN[pair]
      }
      m = /^(\d+(?:\.\d+)?)\s*([A-Za-z]+)(\d*)$/.exec(raw)
      if (m) {
        const unit = SPEAK_UNITS_CN[m[2].toLowerCase()]
        if (unit) return m[1].replace('.', '点') + unit + (m[3] || '')
      }
      return ''
    }

    /* 行内代码转成可朗读形式：D:\a\b.txt -> D盘 a b点txt；命令保留；URL / 超长丢弃 */
    function speakCode(raw) {
      let code = String(raw == null ? '' : raw).trim()
      if (!code) return ''
      if (/^(?:https?:\/\/|www\.|mailto:)/i.test(code)) return ''
      if (code.length > 100) return ''
      const numeric = speakNumericCode(code)
      if (numeric) return numeric
      const isPath = /^[A-Za-z]:[\\/]/.test(code) || /^(?:\.{1,2}[\\/]|~[\\/]|\\\\)/.test(code) || /[A-Za-z0-9_.-]+[\\/][A-Za-z0-9_.-]+/.test(code)
      let out = code
        .replace(/^([A-Za-z]):(?:[\\/]+|$)/, (match, drive) => drive.toUpperCase() + '盘 ')
        .replace(/\\\\/g, ' ')
        .replace(/[\\/]+/g, ' ')
        .replace(/(^|\s)-{1,3}(?=[A-Za-z0-9])/g, '$1')
        .replace(/_+/g, ' ')
        .replace(/[{}<>$~^|\x60=;*]+/g, ' ')
      if (isPath) out = out.replace(/\.(?=[A-Za-z0-9])/g, '点')
      else out = speakFileDots(out)
      return out.replace(/\s+/g, ' ').trim()
    }

    function speakInline(rawLine) {
      return String(rawLine == null ? '' : rawLine)
        /* 图片整段删；链接只留文字 */
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        /* 行内代码：转成可朗读文本（路径盘符念“D盘”、分隔符当停顿、文件名后缀的 . 念“点”） */
        .replace(/\x60([^\x60]*)\x60/g, (match, code) => speakCode(code))
        /* URL、HTML 标签、脚注都不念 */
        .replace(/https?:\/\/[^\s)）]+/gi, '')
        .replace(/www\.[^\s)）]+/gi, '')
        /* 文件名后缀先转“点”（正文里的 ADAPTER.md / gsv_server.exe 也要处理） */
        .replace(SPEAK_FILE_RE, speakFileReplace)
        .replace(/<[^>]*>/g, '')
        .replace(/\[\^?[^\]]{0,24}\]/g, '')
        /* 加粗 / 斜体 / 删除线：直接删标记，不换成空格，避免“标题 正文”式词缝 */
        .replace(/[*_~]+/g, '')
        /* 零宽字符与 emoji */
        .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2B00}-\u{2BFF}]/gu, '')
        /* 残留的 markdown 符号（# > | 反引号）不再念 */
        .replace(/[#>|]+/g, ' ')
        .replace(/\x60/g, '')
    }

    /* 块级清洗：分隔线 / 表格 / 标题 / 引用 / 列表 / 普通段落 */
    function speakCleanLine(original) {
      const line = String(original == null ? '' : original)
      if (/^\s{0,3}(?:[-*+_]\s*){3,}$/.test(line)) return ''
      if (/^\s{0,3}=+\s*$/.test(line)) return ''
      /* 表格分隔行（|---|---|）删；表格行转成“单元格，单元格。” */
      if (/^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line)) return ''
      const pipeCount = (line.match(/\|/g) || []).length
      if (/^\s*\|/.test(line) || pipeCount >= 2) {
        const cells = line
          .split('|')
          .map((cell) => speakInline(cell).trim())
          .filter(Boolean)
        if (!cells.length) return ''
        return speakEnsureEnd(cells.join('，'))
      }
      /* 标题：去掉 #，行尾补句号 */
      if (/^\s{0,3}#{1,6}\s+/.test(line)) {
        return speakEnsureEnd(speakInline(line.replace(/^\s{0,3}#{1,6}\s+/, '')))
      }
      /* 引用：去掉 >，行尾补句号 */
      if (/^\s{0,3}>\s?/.test(line)) {
        return speakEnsureEnd(speakInline(line.replace(/^\s*>\s?/g, '')))
      }
      /* 列表：去掉标记；编号保留数字；每条独立成句（顺带兼容 DOM innerText 的圆点） */
      const numbered = /^\s{0,3}(\d+)[.)]\s+/.exec(line)
      const bullet = /^\s{0,3}[-*+•·◦‣▪]\s+/.exec(line)
      if (numbered || bullet) {
        const rest = line.replace(/^\s{0,3}(?:[-*+•·◦‣▪]|\d+[.)])\s+/, '')
        const head = numbered ? numbered[1] + '. ' : ''
        return speakEnsureEnd(head + speakInline(rest))
      }
      /* 普通段落：清理行内标记后补句号 */
      const plain = speakInline(line).trim()
      return plain ? speakEnsureEnd(plain) : ''
    }

    /* 连续标点归一：不破坏句边界，省略号原样保留 */
    function speakNormalize(text) {
      return String(text == null ? '' : text)
        .replace(/[ \t\u00A0]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{2,}/g, '\n')
        .replace(/[，、]{2,}/g, '，')
        .replace(/[，、]+。/g, '。')
        .replace(/。{2,}/g, '。')
        .replace(/([！？；]){2,}/g, '$1')
        .replace(/\s+([，。！？；：、])/g, '$1')
        .replace(/^[\s。，、；：]+/, '')
        .replace(/\s+$/, '')
    }

    function cleanSpeakable(raw) {
      const source = String(raw == null ? '' : raw)
        .replace(/\r\n?/g, '\n')
        /* 围栏代码块整段删除，只留一个换行保住块边界；未闭合的从围栏删到文末 */
        .replace(/\x60{3}[\s\S]*?\x60{3}/g, '\n')
        .replace(/~{3}[\s\S]*?~{3}/g, '\n')
        .replace(/\x60{3}[\s\S]*$/g, '')
        .replace(/~{3}[\s\S]*$/g, '')
      const blocks = []
      for (const line of source.split('\n')) {
        const cleaned = speakCleanLine(line)
        /* 纯符号 / 空白块丢弃（语音没有可念的字就整块不要） */
        if (cleaned && /[\p{L}\p{N}]/u.test(cleaned)) blocks.push(cleaned)
      }
      return speakNormalize(blocks.join('\n'))
    }

    /* 单句超过 maxLength 且没有句末标点时，在 60~110 字窗口里找逗号/顿号断，实在没有才硬切 */
    function speakSplitLong(piece, maxLength) {
      const parts = []
      let rest = String(piece == null ? '' : piece).trim()
      while (rest.length > maxLength) {
        const windowText = rest.slice(0, maxLength)
        let cut = -1
        for (const mark of ['，', '、', '：', ',', ' ']) {
          cut = Math.max(cut, windowText.lastIndexOf(mark))
        }
        if (cut < 40) cut = maxLength - 2
        parts.push(speakEnsureEnd(rest.slice(0, cut + 1)))
        rest = rest.slice(cut + 1).replace(/^[，、：,\s]+/, '')
      }
      if (rest) parts.push(speakEnsureEnd(rest))
      return parts
    }

    function chunkText(text, maxLength = 110, maxChunks = Infinity) {
      const pieces = String(text == null ? '' : text)
        .replace(/\r\n?/g, '\n')
        .split(/(?<=[。！？；…!?;\n])/)
        .map((piece) => piece.trim())
        .filter(Boolean)
      const sentences = []
      for (const piece of pieces) {
        for (const part of speakSplitLong(piece, maxLength)) {
          if (part) sentences.push(part)
        }
      }
      /* 按句聚合，单块尽量落在 60~110 字，块尾必是完整句子 */
      const rawChunks = []
      let buffer = ''
      for (const sentence of sentences) {
        if (buffer && buffer.length + sentence.length > maxLength) {
          rawChunks.push(buffer)
          buffer = sentence
        } else {
          buffer += sentence
        }
      }
      if (buffer) rawChunks.push(buffer)
      /* 纯符号/空白块丢弃；全量返回：长回复从第一句念到最后一句，不再按总长/块数截断 */
      const out = []
      for (const chunk of rawChunks) {
        const clean = chunk.trim()
        if (!clean) continue
        if (!/[\p{L}\p{N}]/u.test(clean)) continue
        out.push(clean)
        if (out.length >= maxChunks) break
      }
      return out
    }
    /* READING_PATCH_END */

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

    /* ------------------------------------------------------------------ *
     * v2.0.0 插件自更新：向 npm registry 查新版本，一键让宿主替换当前插件
     * ------------------------------------------------------------------ *
     宿主把插件管理服务挂在 ctx.remote.pluginManager 上（与 ctx.remote.account 同一套
     remote 服务，页面侧可以直接调用）：
       listVersions(name)             → 比较 profile 里已安装的版本和 registry，versions[0] 即最新
       updateBundle(name, version, …) → 真正执行「移除旧版 + 安装新版」
     只有「从 npm 装的第三方插件」才能更新：link: 本地目录安装会被宿主拒绝
     （not a third-party package installed in this profile）——查询静默失败，UI 不出按钮，
     不做假按钮。
     结果缓存 6 小时；失败静默（离线 / 未登录 / 宿主没暴露服务都不打扰用户）。
     v2.0.1：安装失败按宿主返回的 error.code 翻成中文（updateFailureMessage），
     区分查版本 / 移除 / 安装三步与回滚结果；与当前 DSH 不兼容的新版本在查询阶段就跳过。
     调试时可以往 localStorage 里放一份假结果来演 UI：
       localStorage['fairy.zzz.update.debug'] =
         JSON.stringify({ latest: '9.9.9', installed: '2.0.0' })
     调试态只走假进度，不会真的调用 updateBundle。 */
    const updateCache = { at: 0, info: null, promise: null }

    function readUpdateDebug() {
      const raw = readStored(UPDATE_DEBUG_KEY, null)
      if (!raw || typeof raw !== 'object' || !raw.latest) return null
      return {
        at: Date.now(),
        latest: String(raw.latest),
        installed: raw.installed ? String(raw.installed) : '',
        registry: raw.registry ? String(raw.registry) : '',
        debug: true,
      }
    }

    /* ————————————————————————————————————————————————————————————————
     * v2.0.2：更新会把正在运行的插件「卸掉再装回来」，React 树随之重建，
     * 浮层里的「安装完成 / 失败」在宿主 HMR 下会跟着消失（实测 2.0.0 → 2.0.1 时，
     * 点完更新约 3 秒后浮层就没了，用户看不到结果）。
     * 所以把这一次更新的上下文写进 localStorage：
     *   - 安装前写 phase:'running'；
     *   - 拿到宿主结果后写 phase:'done'（application + 目标版本）或 phase:'error'（中文原因）；
     *   - 重挂载（新版代码，或安装失败后回滚回来的旧版）读到就补一条结果浮层。
     * 超过 30 分钟的旧记录直接丢弃，免得下次启动凭空弹出「刚更新完」。
     * ———————————————————————————————————————————————————————————————— */
    const UPDATE_RESUME_KEY = 'fairy.zzz.update.resume'
    const UPDATE_RESUME_TTL = 30 * 60 * 1000

    function writeUpdateResume(payload) {
      try { writeStored(UPDATE_RESUME_KEY, payload) } catch (e) {}
    }

    function readUpdateResume() {
      const raw = readStored(UPDATE_RESUME_KEY, null)
      if (!raw || typeof raw !== 'object') return null
      if (!Number.isFinite(raw.at) || Date.now() - raw.at > UPDATE_RESUME_TTL) return null
      return raw
    }

    function clearUpdateResume() {
      try { localStorage.removeItem(UPDATE_RESUME_KEY) } catch (e) {}
    }

    function rememberUpdate(info) {
      updateCache.info = info
      updateCache.at = info.at
      try { writeStored(UPDATE_KEY, info) } catch (e) {}
      return info
    }

    function updateInfoFromValue(value) {
      if (!value || value.status !== 'listed' || !Array.isArray(value.versions)) return null
      /* v2.0.1：宿主的 versions 按新→旧排列，并会给每个版本附 incompatible（与当前 DSH 不兼容时）。
         取第一个兼容的版本；更新的版本不兼容就跳过，全都装不了就当没有可用更新（静默）。 */
      const versions = value.versions.filter((item) => item && item.version)
      const usable = versions.filter((item) => !item.incompatible)
      if (!usable.length) return null
      const pick = usable[0]
      const skipped = versions.slice(0, versions.indexOf(pick)).map((item) => String(item.version))
      return rememberUpdate({
        at: Date.now(),
        latest: String(pick.version),
        installed: value.installed ? String(value.installed) : '',
        registry: value.registry ? String(value.registry) : '',
        skipped: skipped.length ? skipped : undefined,
      })
    }

    /* 宿主把插件管理服务挂在 remote 命名空间上（服务名 remote.pluginManager）。
       v2.0.2 修复：2.0.0/2.0.1 只 inject 了 remote.account，访问 ctx.remote.pluginManager
       时 cordis 会抛 `cannot get property "remote.pluginManager" without inject`，
       结果检查永远静默失败、胶囊从来不出现。这里除了补 inject，也做一层兜底。 */
    function pluginManagerOf(ctx) {
      try {
        const direct = ctx && ctx.remote && ctx.remote.pluginManager
        if (direct) return direct
      } catch (e) {}
      try {
        return (ctx && ctx['remote.pluginManager']) || null
      } catch (e) {
        return null
      }
    }

    function checkPluginUpdate(force) {
      const debug = readUpdateDebug()
      if (debug) return Promise.resolve(debug)
      const now = Date.now()
      if (!force) {
        if (updateCache.info && now - updateCache.at < UPDATE_TTL) return Promise.resolve(updateCache.info)
        const cached = readStored(UPDATE_KEY, null)
        if (cached && Number.isFinite(cached.at) && now - cached.at < UPDATE_TTL) {
          updateCache.info = cached
          updateCache.at = cached.at
          return Promise.resolve(cached)
        }
      }
      if (updateCache.promise) return updateCache.promise
      const ctx = runtime.ctx
      const manager = pluginManagerOf(ctx)
      if (!manager || typeof manager.listVersions !== 'function') return Promise.resolve(null)
      updateCache.promise = Promise.resolve()
        .then(() => manager.listVersions(PKG, {}))
        .then((answer) => {
          /* 返回 { ok: true, value } | { ok: false, error }；被宿主拒绝时 value.status === 'refused' */
          if (!answer || answer.ok === false) return null
          return updateInfoFromValue(answer.value)
        })
        .catch(() => null)
        .finally(() => { updateCache.promise = null })
      return updateCache.promise
    }

    /* v2.0.1：失败原因映射。宿主只给 { code, diagnostic?, incompatible? }，没有 message 字段；
       2.0.0 直接把英文 code 甩到界面上，这里翻成中文并补一段可读的细节。
       失败可能发生在三步上：查版本（check）/ 移除旧版（remove）/ 装新版（install）；
       HMR 下装新版失败宿主会自动回滚（restore），回滚本身失败要单独提醒。 */
    const UPDATE_ERROR_TEXT = {
      'invalid-spec': '目标版本不可用',
      'operation-error': '和 npm 通讯失败',
      'not-bundle': '新版本没有声明 DSH 插件包',
      'incompatible-version': '新版本与当前 DSH 版本不兼容',
      'unsupported-platform': '新版本不支持当前系统',
      'unknown-plugin': 'profile 里没有这个插件',
      'already-installed': '这个版本已经装过',
      'ambiguous-install': '安装来源不唯一',
      'not-removable': '插件管理器不能移除这个插件',
      'stop-profile': '需要先停止当前 profile',
      'bundle-in-use': '插件正在使用中',
      'management-required': '需要由插件管理器执行',
      'stale-approval': '操作授权已过期',
    }

    function clipText(text, max) {
      const flat = String(text == null ? '' : text).replace(/\s+/g, ' ').trim()
      if (!flat) return ''
      const limit = max || 150
      return flat.length > limit ? flat.slice(0, limit) + '…' : flat
    }

    function updateFailureMessage(value) {
      const result = (value && value.result) || {}
      const error = result.error || {}
      const restore = value && value.restore
      const code = error.code ? String(error.code) : ''
      const detail = clipText(error.diagnostic || error.message, 150)
      let text
      if (code === 'incompatible-version') {
        const first = (Array.isArray(error.incompatible) && error.incompatible[0]) || {}
        const need = Array.isArray(first.requirements) ? first.requirements.join('、') : first.requirements
        text = '新版本与当前 DSH 版本不兼容'
        if (need) text += '（要求 ' + clipText(need, 80) + (first.runtimeVersion ? '，当前 ' + first.runtimeVersion : '') + '）'
        text += '，已取消安装。'
      } else if (code === 'not-bundle') {
        text = '新版本没有声明 DSH 插件包，已取消安装。'
      } else if (code === 'operation-error') {
        text = '和 npm 通讯失败或目标版本不存在'
        text += detail ? '：' + detail : '，请检查网络后重试。'
      } else if (code === 'invalid-spec') {
        text = '目标版本不可用' + (detail ? '：' + detail : '') + '。'
      } else if (code === 'bundle-in-use' || code === 'not-removable' || code === 'stop-profile' || code === 'management-required') {
        text = '插件正在使用中，宿主不允许在这里替换 —— 完全退出 DSH 后重试，或用 dsh plugin 手动升级。'
      } else if (code) {
        text = '更新失败：' + (UPDATE_ERROR_TEXT[code] || code)
        if (detail) text += '（' + detail + '）'
      } else {
        text = '更新没有完成，请重试一次。'
      }
      if (restore) {
        if (!/[。！？]$/.test(text)) text += '。'
        if (restore.application === 'failed' || restore.application === 'cancelled') {
          text += ' 旧版本回滚也失败了，Fairy 现在可能不可用 —— 请重启 DSH；仍然不行就用 dsh plugin 重新装一次。'
        } else {
          text += ' 已自动回滚到更新前的版本，Fairy 仍可继续使用。'
        }
      }
      return text
    }

    function yuan(value) {
      if (!Number.isFinite(value)) return '—'
      if (value === 0) return '¥0'
      if (value < 0.01) return '¥' + value.toFixed(4)
      if (value < 10) return '¥' + value.toFixed(3).replace(/0+$/, '')
      return '¥' + value.toFixed(2)
    }

    /* 倒计时表盘：04:09:12 */
    function clockText(ms) {
      const total = Math.max(0, Math.floor(Math.max(0, ms) / 1_000))
      const hours = String(Math.floor(total / 3600)).padStart(2, '0')
      const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
      const seconds = String(total % 60).padStart(2, '0')
      return hours + ':' + minutes + ':' + seconds
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
      /* READING_DOM_PATCH_BEGIN
         fairy-gsv reading patch：行内代码 <code> 转成反引号文本，交给 cleanSpeakable 的 speakCode
         念成“D盘 fairy-gsv config点json”；块级代码（pre/code）仍由下面的选择器整块删除。 */
      for (const codeNode of Array.from(clone.querySelectorAll('code'))) {
        if (codeNode.closest('pre')) continue
        codeNode.replaceWith('\x60' + String(codeNode.textContent || '') + '\x60')
      }
      /* READING_DOM_PATCH_END */
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
      "--dsw-alias-bg-base": "rgba(10,10,10,0.90)",
      "--dsw-alias-bg-layer-1": "#141614",
      "--dsw-alias-bg-layer-2": "#1b1d1b",
      "--dsw-alias-bg-overlay": "rgba(7,8,7,0.98)",
      "--dsw-alias-border-l1": "rgba(255,255,255,0.10)",
      "--dsw-alias-border-l2": "rgba(255,255,255,0.16)",
      "--dsw-alias-border-l3": "rgba(255,255,255,0.10)",
      "--dsw-alias-border-l4": "rgba(255,255,255,0.22)",
      "--dsw-alias-brand-primary": "#d8fa00",
      "--dsw-alias-label-primary": "#f2f2ee",
      "--dsw-alias-label-secondary": "rgba(242,242,238,0.58)",
      "--dsw-alias-label-tertiary": "rgba(242,242,238,0.40)",
      "--dsw-alias-label-quaternary": "rgba(242,242,238,0.24)",
      "--dsw-alias-interactive-bg-hover": "rgba(255,255,255,0.06)",
      "--dsw-alias-interactive-bg-hover-solid": "rgba(255,255,255,0.10)",
      "--dsw-alias-state-error-primary": "#ff5a45",
      "--dsw-alias-state-idle-primary": "#7c7f78",
      "--dsw-alias-state-success-primary": "#c8f24a",
      "--dsw-alias-state-warn-primary": "#ffde00",
      "--dsw-alias-state-business-primary": "#d8fa00",
      "--dsw-alias-state-business-tertiary": "rgba(216,250,0,0.14)",
      "--dsw-alias-button-elevated-fill": "#1b1d1b",
      "--dsw-alias-button-info-fill": "#d8fa00",
      "--dsw-alias-button-info-hover": "#e4ff3d",
      "--dsw-alias-button-primary-fill": "#d8fa00",
      "--dsw-alias-button-primary-hover": "#e4ff3d",
      "--dsw-alias-label-primary-foreground": "#0a0b08",
      "--dsw-specific-sidebar-fill": "#101110",
      "--dsw-specific-bubble": "#23251f",
      "--dsw-specific-input-major": "#141614",
      "--dsw-specific-selector": "rgba(255,255,255,0.06)",
      "--dsw-specific-sidebar-nav-item-active": "rgba(255,255,255,0.08)",
      "--dsw-specific-sidebar-nav-item-hover": "rgba(255,255,255,0.05)",
      "--dsw-alias-scrollbar-bg-l2": "rgba(216,250,0,0.35)",
      "--dsw-alias-scrollbar-hover-l2": "rgba(216,250,0,0.70)",
      "--dsw-alias-markdown-code-block": "#0e0f0e",
      "--dsw-elevation-soft": "none",
      "--dsw-elevation-prominent": "0 0 0 1px rgba(255,255,255,0.08), 0 30px 70px -40px rgba(0,0,0,0.95)",
      "--dsw-radius-xl": "14px",
      "--dsw-radius-panel": "20px",
      "--dsw-radius-lg": "12px",
      "--dsw-radius-md": "8px",
      "--dsw-radius-sm": "6px",
      "--dsw-radius-xs": "3px",
    }
    /* 宿主切到浅色外观时用的同一套设计变量（键与 baseTokens 一一对应） */
    const lightTokens = {
      "--dsw-alias-bg-base": "rgba(239,239,237,0.94)",
      "--dsw-alias-bg-layer-1": "#ffffff",
      "--dsw-alias-bg-layer-2": "#ffffff",
      "--dsw-alias-bg-overlay": "rgba(250,250,247,0.99)",
      "--dsw-alias-border-l1": "rgba(16,17,16,0.12)",
      "--dsw-alias-border-l2": "rgba(16,17,16,0.20)",
      "--dsw-alias-border-l3": "rgba(16,17,16,0.12)",
      "--dsw-alias-border-l4": "rgba(16,17,16,0.24)",
      "--dsw-alias-brand-primary": "#6f8700",
      "--dsw-alias-label-primary": "#101110",
      "--dsw-alias-label-secondary": "rgba(16,17,16,0.58)",
      "--dsw-alias-label-tertiary": "rgba(16,17,16,0.42)",
      "--dsw-alias-label-quaternary": "rgba(16,17,16,0.24)",
      "--dsw-alias-interactive-bg-hover": "rgba(16,17,16,0.05)",
      "--dsw-alias-interactive-bg-hover-solid": "rgba(16,17,16,0.08)",
      "--dsw-alias-state-error-primary": "#c8301f",
      "--dsw-alias-state-idle-primary": "#8a8c85",
      "--dsw-alias-state-success-primary": "#3f6b00",
      "--dsw-alias-state-warn-primary": "#8a5a00",
      "--dsw-alias-state-business-primary": "#6f8700",
      "--dsw-alias-state-business-tertiary": "rgba(216,250,0,0.22)",
      "--dsw-alias-button-elevated-fill": "#ffffff",
      "--dsw-alias-button-info-fill": "#d8fa00",
      "--dsw-alias-button-info-hover": "#c6e800",
      "--dsw-alias-button-primary-fill": "#d8fa00",
      "--dsw-alias-button-primary-hover": "#e4ff3d",
      "--dsw-alias-label-primary-foreground": "#0a0b08",
      "--dsw-specific-sidebar-fill": "#111210",
      "--dsw-specific-bubble": "#ffffff",
      "--dsw-specific-input-major": "#ffffff",
      "--dsw-specific-selector": "rgba(16,17,16,0.05)",
      "--dsw-specific-sidebar-nav-item-active": "rgba(16,17,16,0.06)",
      "--dsw-specific-sidebar-nav-item-hover": "rgba(16,17,16,0.04)",
      "--dsw-alias-scrollbar-bg-l2": "rgba(16,17,16,0.25)",
      "--dsw-alias-scrollbar-hover-l2": "rgba(16,17,16,0.45)",
      "--dsw-alias-markdown-code-block": "#f4f4f0",
      "--dsw-elevation-soft": "none",
      "--dsw-elevation-prominent": "0 0 0 1px rgba(16,17,16,0.14), 12px 12px 0 rgba(16,17,16,0.10)",
      "--dsw-radius-xl": "14px",
      "--dsw-radius-panel": "20px",
      "--dsw-radius-lg": "12px",
      "--dsw-radius-md": "8px",
      "--dsw-radius-sm": "6px",
      "--dsw-radius-xs": "3px",
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
  /* v2.0.4（标题字体）：Impact 只给标题 / 字标用，正文与对话保持 2.0.3 的字体。
     标题层的 Impact 令牌在皮肤段 --fz3-display 里定义。 */
  --fz3-font:"Bahnschrift","DIN Alternate","HarmonyOS Sans SC","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif;
  --fz3-dock-x:25vw;
  --fz3-dock-y:52vh;
  --fz3-dock-size:128px;
  /* 画布字墙底纹的中间段遮罩：0 = 原图（最清楚），.2 = 几乎只剩暗部呼吸。
     只影响画布中段，上下收边与暗角是固定值。 */
  --fz3-wall-veil:.06;
  /* 自适应：问候页的眼睛直径 / 眼睛中心高度 / 眼睛到文案的间距，全部随视口缩放 */
  --fz3-eye:clamp(132px,min(32vmin,34vh),330px);
  --fz3-eye-cy:42vh;
  --fz3-eye-gap:clamp(14px,3.4vh,54px);
  /* greet 态眼睛整体上移量：眼睛光晕（.fz3-eye::before inset:-13%）比眼睛包围盒每边多探出 0.13×eye，
     眼睛不动时这段柔光会压到文案第一行 kicker（H.D.D CORE // ONLINE）上。
     只上移 .fz3-core，不改 .fz3-copy 的锚点，等于把眼睛与文案的间距再拉开一个 lift。 */
  --fz3-eye-lift:clamp(12px,2.8vh,28px);
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
  position:fixed;left:50%;top:calc(var(--fz3-eye-cy) - var(--fz3-eye-lift));width:var(--fz3-eye);aspect-ratio:1/1;
  transform:translate(-50%,-50%);opacity:0;pointer-events:none;z-index:2;
  transition:left 1.35s cubic-bezier(.62,0,.22,1),top 1.35s cubic-bezier(.62,0,.22,1),width 1.35s cubic-bezier(.62,0,.22,1),opacity .55s ease;
}
.fz3-layer[data-phase="greet"] .fz3-core{opacity:1}
.fz3-layer[data-phase="dock"] .fz3-core{
  left:var(--fz3-dock-x);top:var(--fz3-dock-y);width:var(--fz3-dock-size);opacity:1;pointer-events:none;
}
/* v2.1.0：眼徽只在工作区出现。插件页、自动化、设置弹窗等 surface=away 时整颗收起。
   用 visibility 而不是 display:none：元素仍占位、getBoundingClientRect 不变，
   拖拽 / dock 坐标测量不受影响；回到工作区时 opacity 由上面那条规则恢复。 */
.fz3-layer[data-phase="dock"][data-surface="away"] .fz3-core{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
/* 开机收拢（v1.7.5）：不再单独放慢，和眼标复位 / 拖动共用上面那条 1.35s 的曲线。
   早先试过把这一段拉长到 2.2s、5s，结果比复位还慢，看着不像同一个动作。 */
/* v1.7.5（修复）：刚挂载的两帧内不画过渡、也不画眼徽：
   此时 dock 坐标还没写进 --fz3-dock-x/y，先显示会看到它停在基础 CSS 的中心位置一闪，
   接着再补间到 dock 位，像「瞬移 + 回弹」。settled 之后恢复常规过渡（开机收拢不受影响）。 */
.fz3-layer[data-settled="0"] .fz3-core{transition:none!important;opacity:0!important}
.fz3-layer[data-phase="boot"] .fz3-core{opacity:0}
.fz3-core svg{display:block;width:100%;height:100%;filter:none}
.fz3-layer[data-phase="dock"] .fz3-core svg{filter:none;transition:transform .3s ease}
.fz3-core::after{
  content:none;
}
.fz3-eye{position:relative;width:100%;height:100%;display:grid;place-items:center}
/* 白边辉光原本用 drop-shadow 挂在 SVG 外壳上，但眼球呼吸会让滤镜每帧重新栅格化整棵 SVG 子树。
   现在换成一圈静态 ::before 径向柔光：只画一次、随图层合成，呼吸动画因此能留在合成器线程。
   v1.7.5 把这个变量也删了（原 --fz3-eye-glow）：它唯一的用途就是被滤镜引用，
   而 drop-shadow 会被 CSS filter 的边框盒裁成圆角方形（见下方故障态规则）。 */
.fz3-eye::before{
  content:"";position:absolute;inset:-13%;border-radius:50%;z-index:0;pointer-events:none;
  background:radial-gradient(closest-side,rgba(96,148,255,.30),rgba(64,112,255,.17) 46%,rgba(40,70,210,.05) 74%,transparent 100%);
  animation:fz3-halo-breathe 6.4s steps(3,end) infinite;
}
/* ————————————————————————————————
   眼球渲染（v1.6.0）：单份静态 SVG，叶片旋转 / 眼球呼吸 / 目光偏移都由运行时以 15fps
   改写 SVG 内部 transform 属性，触发小面积向量重绘——每帧按设备像素重新抗锯齿。
   v1.5.0 曾把眼球拆成 4 个 HTML 合成层、用 CSS steps() 动 transform：GPU 只 1.3%，
   但合成器搬的是已栅格化的位图，缩放 / 旋转时高对比边缘（眼睑裁切边、暗色眼眶）
   会被重采样成台阶和发虚（用户在 150% 缩放下肉眼可见）。现在用 +0.7 GPU 点 /
   +1% 主线程换边缘质量，相对 v1.4.0 的 165fps 全屏重绘（9.3–11.8%）仍低一个量级。 */
.fz3-eye-svg{position:absolute;inset:0;z-index:2;pointer-events:none;transition:transform .28s ease}
.fz3-eye-svg svg{width:100%;height:100%;display:block;overflow:visible}
/* 参考实现的「外部光晕」是静态线条（避免重绘）；这里保持静态，只用多层径向渐变模拟柔光。
   原先的 filter:blur(20px) 会强制整块离屏栅格化（台眼、花屏切片都要重算），换成 4 段渐变软过渡，
   肉眼基本无差，但合成器不再需要滤镜。 */
.fz3-eye-halo{position:absolute;inset:7%;border-radius:50%;z-index:0;pointer-events:none;opacity:.72;
  background:radial-gradient(closest-side,rgba(74,124,255,.32),rgba(64,112,255,.21) 34%,rgba(52,88,235,.12) 52%,rgba(38,64,200,.05) 68%,rgba(30,48,170,.015) 84%,transparent 97%)}

/* 睫毛脉冲环：5 圈同心描边，6.4s 一轮；前 27% 扩散淡出，其余时间完全静止（静止段不产生任何帧）。
   steps(24) 把扩散段量化到 ~14fps；动画挂在外层 span 上，合成器只缩放整层，不再逐帧重绘 SVG。 */
.fz3-eye-pulse{position:absolute;left:-100%;top:-100%;width:300%;height:300%;z-index:1;pointer-events:none;opacity:.92;
  transform-origin:50% 50%;animation:fz3-lash-pulse 6.4s steps(24,end) infinite}
.fz3-eye-pulse svg{display:block;width:100%;height:100%;overflow:visible}
.fz3-eye-pulse .fz3-pulse-wave{transform-box:view-box;transform-origin:80px 80px}

/* ---------- 设置页 ---------- */
.fz3-set{display:flex;flex-direction:column;gap:14px;padding:2px 2px 8px;color:#e2ecfa;font-family:var(--fz3-font)}
.fz3-set-head{display:flex;align-items:center;gap:12px;padding:2px 0 2px}
.fz3-set-eye{width:46px;height:46px;flex:none;display:block;filter:drop-shadow(0 0 12px rgba(64,116,255,.5))}
.fz3-set-eye svg{width:100%;height:100%;display:block;overflow:visible}
.fz3-set-name{font-size:15px;letter-spacing:.03em}
.fz3-set-sub{font-size:11.5px;color:#8fa3bb;margin-top:3px}
.fz3-set-card{display:flex;flex-direction:column;gap:0;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.025);border:1px solid rgba(130,160,210,.14);min-width:0}
.fz3-set-card.is-wide{grid-column:1/-1}
.fz3-set-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:28px}
.fz3-set-card-title{display:flex;align-items:center;gap:8px;font-size:13px;line-height:1.4}
.fz3-set-card-title .fz3-set-dot{box-shadow:0 0 8px currentColor}
.fz3-set-card-status{font-size:11px;color:#8b9fb8;margin-top:4px;line-height:1.5}
.fz3-set-line{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(130,160,210,.10)}
.fz3-set-line .fz3-set-label{line-height:1.4}
.fz3-set-line .fz3-set-desc{max-width:460px}
.fz3-set-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(130,160,210,.10)}
.fz3-set-pane{display:flex;flex-direction:column;gap:5px;min-width:0}
.fz3-set-pane-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:24px}
.fz3-set-pane .fz3-set-desc{margin-top:0}
.fz3-set-pane .fz3-set-actions{margin:0;justify-content:flex-end}
.fz3-set-tabs{display:flex;gap:8px;padding:2px 0 0}
.fz3-set-tab{font:inherit;font-size:12px;padding:8px 16px;border-radius:9px;cursor:pointer;color:#e8f2ff;background:rgba(87,232,255,.08);border:1px solid rgba(110,200,255,.24);transition:background .16s ease,border-color .16s ease,color .16s ease}
.fz3-set-tab:hover{background:rgba(87,232,255,.16);border-color:rgba(120,225,255,.46)}
.fz3-set-tab.is-active{background:rgba(87,232,255,.22);border-color:rgba(120,225,255,.6);color:#f4fbff}
.fz3-dash{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.fz3-dash-section{grid-column:1/-1;display:flex;align-items:baseline;gap:8px;padding:2px 2px 0}
.fz3-dash-section:first-child{padding-top:0}
.fz3-dash-section-title{font-size:11px;font-weight:700;letter-spacing:.10em;color:#dcecff}
.fz3-dash-section-meta{font-size:10.5px;color:#7f92a9;margin-left:auto}
.fz3-dash-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.fz3-dash-main{min-width:0}
.fz3-dash-head-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;justify-content:flex-end;flex:none}
.fz3-dash-head-actions .fz3-set-btn{padding:7px 12px}
.fz3-dash-kicker{font-size:11px;line-height:1.4;letter-spacing:.04em;color:#8fa3bb}
.fz3-dash-value{display:flex;align-items:center;gap:8px;margin-top:7px;font-size:22px;line-height:1.1;font-weight:700;letter-spacing:.01em;color:#edf5ff;white-space:nowrap;font-variant-numeric:tabular-nums}
.fz3-dash-value .fz3-set-dot{width:7px;height:7px}
.fz3-dash-value.is-on{color:var(--fz3-lime,#b8ff2e)}
.fz3-dash-value.is-error{color:#ff8a72}
.fz3-dash-desc{font-size:11px;line-height:1.55;color:#8396ad;margin-top:6px}
.fz3-dash-desc.is-hint{margin-top:7px}
.fz3-dash-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.fz3-dash-preview{grid-column:1/-1;font-size:10.5px;line-height:1.5;color:#7f92a9;padding:0 2px}
.fz3-dash-foot{margin-top:auto;padding-top:10px;font-size:10.5px;line-height:1.5;color:#6f8299}
.fz3-dash .fz3-set-switch{align-self:flex-start;margin-top:2px}
.fz3-set-field{display:block;margin-top:12px}
.fz3-set-field-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
.fz3-set-field-links{display:flex;align-items:center;gap:12px}
.fz3-set-linkbtn{font:inherit;font-family:var(--fz3-mono);font-size:10.5px;letter-spacing:.02em;padding:0;border:0;background:none;color:#8fa9c7;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.fz3-set-linkbtn:hover:not(:disabled){color:#57e8ff}
.fz3-set-linkbtn:disabled{opacity:.4;cursor:default}
.fz3-set-label{font-size:13px}
.fz3-set-desc{font-size:11px;color:#8b9fb8;margin-top:3px;line-height:1.5}
.fz3-set-dot{width:8px;height:8px;border-radius:50%;flex:none;box-shadow:0 0 10px currentColor}
.fz3-set-dot.is-on{background:#4ee6a8;color:#4ee6a8}
.fz3-set-dot.is-wait{background:#f0b45c;box-shadow:0 0 11px rgba(240,180,92,.6)}
.fz3-set-dot.is-off{background:#7d8ea6;color:#7d8ea6}
.fz3-set-engine-controls{display:flex;align-items:center;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-left:auto}
.fz3-set-engine-controls .fz3-set-btn{padding:7px 12px}
.fz3-set-desc.is-hint{margin-top:7px}
.fz3-set-path{display:flex;gap:8px;align-items:center;margin-top:0;flex-wrap:wrap}
.fz3-set-input{flex:1 1 260px;min-width:0;padding:8px 11px;font-family:inherit;font-size:12.5px;font-weight:400;line-height:1.45;letter-spacing:0;color:#dbe8f6;background:rgba(9,13,22,.82);border:1px solid rgba(120,160,220,.26);border-radius:9px;outline:none;transition:border-color .18s ease,box-shadow .18s ease}
.fz3-set-input:focus{border-color:rgba(87,232,255,.55);box-shadow:0 0 0 3px rgba(87,232,255,.12)}
.fz3-set-input::placeholder{color:rgba(150,172,200,.5)}
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
@media (max-width:720px){
  .fz3-set-pair{grid-template-columns:1fr;gap:14px}
}

/* ---------- 信号故障：threads（水平拉丝）/ blocks（5 条横切片） ---------- */
/* 故障态的 filter 里不要再塞 drop-shadow：阴影会按元素的边框盒被裁掉四边，
   在完成/待机切换的那一瞬间露出一圈方形的边。承载它的 --fz3-eye-glow 变量已在
   v1.7.5 删除，别再加回来。柔和光晕改由 .fz3-eye::before 的径向渐变负责，
   它不在被过滤的子树里，永远是圆的。 */
.fz3-eye[data-glitch] .fz3-eye-svg,
.fz3-eye[data-transition-glitch] .fz3-eye-svg{
  filter:brightness(var(--fz3-g-bright,1.03)) contrast(var(--fz3-g-contrast,1.04));
  transform:translateX(var(--fz3-g-x,0px)) skewX(var(--fz3-g-skew,0deg));
  transition:none;will-change:transform,filter;
}
/* v1.7.5：参考实现的 feTurbulence 水平位移滤镜已整套删除（滤镜定义 fz3-interference /
   fz3-noise / fz3-displace、挂载它的 ensureFilter、以及运行时改 seed/baseFrequency/scale
   的那段代码都不在了）。原因：GPU 合成下 url(#滤镜) 会把输出铺满整块矩形区域，区域内
   透明像素被填成浅灰，眼盘周围那圈柔和光晕就变成圆角方形——working→idle 完成转场那 1s
   里最明显。实测把 filter region 放大到 -100%/300%、删掉 filterRes 都是同样的方角，所以
   故障态只保留亮度/对比抖动 + 位移 + 5 条横切片。柔光由 .fz3-eye::before 的径向渐变负责。 */
.fz3-eye[data-glitch="threads"] .fz3-eye-svg,
.fz3-eye[data-transition-glitch] .fz3-eye-svg{
  filter:brightness(var(--fz3-g-bright,1.06)) contrast(var(--fz3-g-contrast,1.08));
}
.fz3-glitch{position:absolute;inset:0;z-index:3;pointer-events:none;display:none}
.fz3-eye[data-glitch="blocks"] .fz3-glitch{display:block}
.fz3-gband{position:absolute;inset:0;display:block}
/* 切片图层只在 blocks 花屏的几百毫秒里需要独立图层，平时不提升，省显存 / 合成开销 */
.fz3-eye[data-glitch="blocks"] .fz3-gband{will-change:transform,opacity}
.fz3-gband > span{position:absolute;inset:0;display:block}
.fz3-gband svg{width:100%;height:100%;display:block;overflow:visible}
/* 参考实现的故障切片只克隆眼盘本体，外圈光晕不进入克隆（否则 5 份光晕错位叠加会糊成重影）。 */
.fz3-glitch #outer-halo{display:none}
.fz3-gband[data-slice="1"]{transform:translateX(var(--fz3-g-s1-x,0px))}
.fz3-gband[data-slice="2"]{transform:translateX(var(--fz3-g-s2-x,0px))}
.fz3-gband[data-slice="3"]{transform:translateX(var(--fz3-g-s3-x,0px))}
.fz3-gband[data-slice="4"]{transform:translateX(var(--fz3-g-s4-x,0px))}
.fz3-gband[data-slice="5"]{transform:translateX(var(--fz3-g-s5-x,0px))}

/* ---------- 待机小动作：眼闪 + 半闭眼（眼闪由运行时的事件定时器触发；眼睑随呼吸一开一合） ---------- */
/* 半闭眼沿用参考实现的做法：用 clipPath 裁切整只眼球（#eye-anatomy），被裁掉的上半部分会露出
   后面的旋转睫毛/暗角，而不是盖一块纯色遮罩。
   v1.7.6：眼睑跟着呼吸一开一合（stepLid 每拍写那条 path 的 transform，14.5→15.5 / .55→1，
   15fps 网格上只写变化的帧）。裁切只在思考态被引用，静止态完全不算。
   ⚠ 页面里 #fz3-lid-clip 有 8 份（主眼 1 + 花屏克隆 5 + 侧栏字标 2），url(#id) 按文档顺序解析到最靠前
   的那份——给主眼这条 path 写 transform 之前必须先把它的 id 改成独占的 #fz3-lid-clip-main，并用行内
   clip-path 指过去，否则动的是「没人引用」的那份，眼睑看起来纹丝不动。
   同理，那 5 份花屏克隆（.fz3-gband 里内联的整份 SVG）不能各用各的拷贝：applyLidClip() 会把组件内
   每一份 .fz3-anatomy 都指到主眼这条 path 上，否则切片里露出的是未下压的旧形状。
   CSS 这条规则只作兜底（没跑到 applyLidClip 时仍然裁得上）。 */
.fz3-eye[data-lid="thinking"] .fz3-anatomy,
.fz3-layer[data-lid="thinking"] .fz3-anatomy{clip-path:url(#fz3-lid-clip)}

/* 切口那条抗锯齿过渡带紧贴深蓝眼睑，在 128px 下会读成一条「白边」——用一条同色（#corners 的
   #1f2573）描边压在切口上，把过渡带盖成深→白的硬边。它必须跟着眼皮动，所以 transform 由
   stepLid 和裁切 path 一起写；主眼这份在 cache() 里改名 #fz3-lid-edge-main，花屏克隆里的副本
   保持原 id 且不显示（那一份没有 transform，露出来就是一条错位的线）。
   ⚠ 两个 id 都要默认藏：主眼那份改名成 -main 之后就不再匹配 #fz3-lid-edge 了，
   少写一条待机态就会一直横着一条深蓝弧线。 */
#fz3-lid-edge,
#fz3-lid-edge-main{display:none}
.fz3-eye[data-lid="thinking"] #fz3-lid-edge-main,
.fz3-layer[data-lid="thinking"] #fz3-lid-edge-main{display:inline}

/* 眼闪：极轻的白色亮度跳动；随机 1750-3600ms 一次，单次 155-255ms */
.fz3-eye-flicker{position:absolute;inset:7.12%;border-radius:50%;background:#fff;opacity:0;z-index:4;pointer-events:none;mix-blend-mode:screen}
.fz3-eye[data-flicker="1"] .fz3-eye-flicker{
  animation:fz3-eye-flicker-overlay var(--fz3-flicker-ms,210ms) cubic-bezier(.32,0,.68,1) both;
  will-change:opacity;
}

/* 完成：弹一下 + 光环炸开 */
/* v1.7.5（修复）：Q 弹只缩放眼球本体（.fz3-eye-svg），不再缩放整个 .fz3-eye。
   整块缩放会把「::before 径向柔光」一起送进合成层——柔光有 13% 溢出到 128px 盒子之外，
   合成分层按边框盒栅格化时溢出部分被裁断，弹起的这一秒里光晕就成了圆角方形。
   现在柔光留在不动的父层里始终是正圆，弹的只有眼睛本身，观感几乎一样。 */
.fz3-layer[data-celebrate="1"] .fz3-eye-svg{animation:fz3-celebrate 1s cubic-bezier(.3,1.5,.5,1) 1}
/* v1.7.5（修复）：扩散环整条删掉了。这圈是 2px 的 border 圆环（rgba(190,220,255,.85)），
   在真实窗口里被 GPU 合成画成了圆角方形——像素量出来半边 130、圆角半径 89，四边平直四角打圆，
   border-radius:50% 没起效；用同一份 CSS 做静态渲染却永远是正圆，静态复现这条线查不出根因。
   它已经没有任何用处，直接把元素和动画一起去掉，完成时只留眼球那一下 Q 弹。 */

/* 页面隐藏：冻结全部 CSS 时间线（光晕呼吸 / 脉冲环都在这一个属性上停下；
   叶片旋转 / 眼球呼吸 / 目光微动是运行时 15fps 时间线，由 suspend() 停表）。 */
.fz3-eye[data-fz3-suspended] *{animation-play-state:paused!important;will-change:auto!important}
.fz3-eye[data-fz3-suspended]::before{animation-play-state:paused!important}
/* 不提供 reduced-motion 降级：Windows 关闭动画效果时也必须保持完整动效。 */
@keyframes fz3-halo-breathe{
  0%{opacity:.74}
  18%{opacity:.92}
  34%{opacity:.80}
  52%{opacity:1}
  68%{opacity:.84}
  84%{opacity:.95}
  100%{opacity:.76}
}
/* 5 圈脉冲环：6.4s 一轮；前 27%（约 1.7s）扩散淡出，之后完全静止 */
@keyframes fz3-lash-pulse{
  0%{opacity:.62;transform:scale(.98)}
  27%,100%{opacity:0;transform:scale(2.78)}
}
@keyframes fz3-atmos-breathe{from{opacity:.55;transform:scale(1)}to{opacity:1;transform:scale(1.06)}}
@keyframes fz3-eye-flicker-overlay{
  0%,100%{opacity:0}
  22%{opacity:var(--fz3-flicker-1,.04)}
  48%{opacity:var(--fz3-flicker-mid,.012)}
  72%{opacity:var(--fz3-flicker-2,.03)}
}
@keyframes fz3-celebrate{0%{transform:scale(1)}30%{transform:scale(1.14)}62%{transform:scale(.97)}100%{transform:scale(1)}}

/* ———————————————————— */
.fz3-copy{
  position:fixed;left:50%;top:calc(var(--fz3-eye-cy) + var(--fz3-eye) / 2 + var(--fz3-eye-gap));
  transform:translate(-50%,0);width:min(820px,90vw);
  text-align:center;opacity:0;pointer-events:none;z-index:3;transition:opacity .6s ease,transform 1s ease,visibility 0s linear;
}
.fz3-layer[data-phase="greet"] .fz3-copy{opacity:1}
.fz3-layer[data-phase="dock"] .fz3-copy{opacity:0;transform:translate(-50%,-16px);visibility:hidden;
  transition:opacity .6s ease,transform 1s ease,visibility 0s linear .6s}
/* kicker 是 8–9.5px 的细字，光晕最亮处对比度只有 1.2 左右；加一层贴合字形的暗描边把它从辉光里托出来，
   亮色文字本身略微提亮，观感仍是「背景里的小字」，但能读清。 */
.fz3-copy-kicker{font-size:clamp(8px,.78vw,9.5px);letter-spacing:.44em;color:rgba(202,220,255,.96);margin-bottom:clamp(6px,1.4vh,14px);text-indent:.44em;
  text-shadow:0 1px 2px rgba(0,8,28,.62),0 0 10px rgba(40,90,220,.4)}
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

.fz3-sb-brand{position:fixed;left:var(--fz3-brand-left,10px);top:var(--fz3-brand-top,52px);box-sizing:border-box;width:var(--fz3-brand-w,262px);height:var(--fz3-brand-h,46px);padding:0 10px;border-radius:11px;display:flex;align-items:center;gap:11px;pointer-events:none;z-index:4;background:transparent;box-shadow:none;
  opacity:0;transition:opacity .6s ease .35s}
.fz3-layer[data-phase="dock"] .fz3-sb-brand{opacity:1}
.fz3-sb-logo{width:22px;height:22px;flex:0 0 22px;display:block}
.fz3-sb-logo svg{width:100%;height:100%;display:block}
.fz3-sb-text{display:flex;flex:1 1 auto;flex-direction:column;gap:3px;min-width:0;width:calc(var(--fz3-brand-w,262px) - 53px)}
.fz3-sb-text b{font-size:19px;font-weight:700;letter-spacing:.02em;color:#f2f5ff;line-height:1;
  font-family:"Palatino Linotype","Songti SC",Georgia,serif;font-style:italic}
.fz3-sb-text i{font-style:normal;font-size:8.5px;letter-spacing:.16em;color:rgba(150,168,220,.72);white-space:nowrap;overflow:visible;text-overflow:clip}

/* v2.0.0：插件自更新 —— 侧栏字标右上的「可更新」胶囊 + 点开的确认浮层。
   胶囊挂在 .fz3-sb-brand 里（那个容器 pointer-events:none，所以这里单独开 auto）；
   浮层 fixed 定位在字标正下方，靠 --fz3-brand-* 三个变量对齐（measureOnce 写入）。 */
.fz3-upd-pill{position:absolute;left:auto;right:var(--fz3-upd-right,-32px);top:auto;bottom:0;display:inline-flex;align-items:center;gap:5px;height:21px;padding:0 9px;font-family:var(--fz3-mono);font-size:10.5px;font-weight:700;letter-spacing:.08em;color:#0a0b08;background:var(--fz3-lime);border:1px solid rgba(0,0,0,.6);border-radius:999px;box-shadow:0 0 0 3px rgba(216,250,0,.12),0 2px 8px rgba(0,0,0,.5);cursor:pointer;pointer-events:auto;white-space:nowrap;z-index:1}
.fz3-upd-pill:hover{background:#e6ff3d}
.fz3-upd-pill[data-state="busy"]{background:var(--fz3-amber)}
.fz3-upd-pill:focus-visible{outline:2px solid #f2f2ee;outline-offset:2px}
.fz3-upd-pill-dot{width:6px;height:6px;border-radius:50%;background:#0a0b08;animation:fz3-blink 1.6s steps(2,end) infinite}
.fz3-upd{position:fixed;box-sizing:border-box;left:var(--fz3-brand-left,10px);top:calc(var(--fz3-brand-top,52px) + var(--fz3-brand-h,46px) + 24px);width:304px;padding:14px 15px 13px;z-index:20;pointer-events:auto;color:#f2f2ee;background:rgba(12,14,12,.98);border:1px solid rgba(216,250,0,.26);border-radius:12px;box-shadow:0 20px 54px rgba(0,0,0,.66)}
.fz3-upd-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.fz3-upd-title{font-family:var(--fz3-mono);font-size:13px;font-weight:700;letter-spacing:.06em;color:var(--fz3-lime)}
.fz3-upd-close{flex:none;width:20px;height:20px;margin:-2px -4px 0 0;border:0;background:transparent;color:rgba(242,242,238,.5);font-size:16px;line-height:1;cursor:pointer;border-radius:6px}
.fz3-upd-close:hover{color:#f2f2ee;background:rgba(242,242,238,.08)}
.fz3-upd-vers{margin-top:9px;display:flex;align-items:center;gap:8px;font-family:var(--fz3-mono);font-size:16px;font-weight:700;letter-spacing:.02em}
.fz3-upd-vers b{font-weight:700;color:rgba(242,242,238,.62)}
.fz3-upd-vers .fz3-upd-new{color:#f2f2ee}
.fz3-upd-arrow{color:var(--fz3-lime);font-size:14px}
.fz3-upd-desc{margin-top:8px;font-size:11.5px;line-height:1.65;color:rgba(242,242,238,.56)}
.fz3-upd-desc.is-err{color:#ff8a72}
.fz3-upd-bar{position:relative;overflow:hidden;height:2px;margin-top:10px;background:rgba(242,242,238,.1);border-radius:2px}
.fz3-upd-bar i{position:absolute;left:0;top:0;bottom:0;width:42%;background:linear-gradient(90deg,transparent,var(--fz3-lime),transparent);animation:fz3-upd-scan 1.15s linear infinite}
@keyframes fz3-upd-scan{0%{transform:translateX(-100%)}100%{transform:translateX(240%)}}
.fz3-upd-note{margin-top:8px;font-size:10.5px;line-height:1.5;color:rgba(240,180,92,.8)}
.fz3-upd-actions{display:flex;gap:8px;margin-top:12px}
.fz3-upd-btn{font-family:var(--fz3-font);font-size:12px;line-height:1;padding:8px 16px;border-radius:9px;cursor:pointer;border:1px solid transparent}
.fz3-upd-btn.is-primary{font-weight:700;color:#0a0b08;background:var(--fz3-lime);border-color:rgba(0,0,0,.6)}
.fz3-upd-btn.is-primary:hover:not(:disabled){background:#e6ff3d}
.fz3-upd-btn.is-ghost{color:rgba(242,242,238,.8);background:rgba(255,255,255,.04);border-color:rgba(140,160,190,.24)}
.fz3-upd-btn.is-ghost:hover:not(:disabled){background:rgba(255,255,255,.08);color:#f2f2ee}
.fz3-upd-btn:disabled{opacity:.45;cursor:default}
.fz3-upd-btn:focus-visible{outline:2px solid #f2f2ee;outline-offset:2px}

.fz3-rim{position:fixed;left:-90px;top:-140px;width:560px;height:560px;pointer-events:none;
  background:radial-gradient(closest-side,rgba(126,92,255,.16),rgba(70,60,220,.05) 58%,transparent 76%);filter:blur(8px)}
.fz3-bay{position:fixed;left:50%;bottom:-190px;width:980px;height:400px;transform:translateX(-50%);pointer-events:none;
  background:radial-gradient(closest-side,rgba(74,96,255,.16),rgba(60,50,200,.05) 60%,transparent 78%)}
.fz3-atmos{position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden;mix-blend-mode:screen;opacity:.75}
/* （观感）取景框只画左边和上边，角标也只留左上角一个。
   原来右下角也有一个同样的角标，它的横臂正好从滚动条左边探出来，
   和青柠色滚动条叠成一截突兀的断线；右下角本来就被滚动条 + 输入区占满，
   在那里放任何装饰都会撞车。 */
.fz3-atmos-frame{position:absolute;inset:9px;border-top:1px solid rgba(87,232,255,.06);border-left:1px solid rgba(87,232,255,.06)}
.fz3-atmos-frame::before{content:"";position:absolute;left:-1px;top:-1px;width:16px;height:16px;border:1px solid rgba(87,232,255,.22);border-right:0;border-bottom:0}
/* 两团氛围光原本各带一层大半径滤镜（blur 34px / 20px），在整块屏幕尺寸上常驻栅格化；
   径向渐变本身已经是软过渡，去掉滤镜后观感几乎不变，但这块不再需要离屏滤镜。 */
.fz3-atmos-glow{position:absolute;left:-12%;top:-26%;width:64%;height:70%;background:radial-gradient(circle,rgba(70,52,255,.16),rgba(60,46,240,.05) 52%,transparent 78%);opacity:.55;transform:scale(1);animation:fz3-atmos-breathe 14s steps(14,end) infinite alternate}
.fz3-atmos-flash{position:absolute;right:4%;top:2%;width:34%;height:30%;background:radial-gradient(ellipse at 60% 20%,rgba(120,190,255,.16),rgba(100,160,255,.04) 42%,transparent 72%);animation:fz3-flash 11s steps(1) infinite}
/* v1.7.3（性能）：dock 相（日常使用）把整屏氛围层从「混合」降为普通合成。
   v1.7.0 让这层常驻 mix-blend-mode:screen：任何下层内容变化都要重算整屏混合，
   2560×1440@150%（3840×2160 物理像素）尤其贵；boot / greet 仍保留混合效果。 */
html[data-fz3-phase="dock"] .fz3-atmos{mix-blend-mode:normal}

@keyframes fz3-line{to{opacity:1;transform:none}}
@keyframes fz3-blink{50%{opacity:.3}}
/* 氛围光 14s 呼吸：14s / 14 步 ≈ 1fps，全屏 mix-blend-mode 层只在 14 个瞬间重合成。 */
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
 * v1.3.0 新增：浅色主题 / 用量气泡 / 眼徽拖拽；v1.6.2 起外观固定跟随宿主，不再有分段开关
 * 性能约定：气泡只在展开时才挂载，并且去掉了参考实现的
 * backdrop-filter:blur()（整块区域模糊在高刷屏上每帧重算背景）改纯渐变；
 * 其余新增规则全部是静态声明，没有常驻动画。
 * ================================================================== */

/* ---------- 浅色主题（v1.7.5 起未启用：theme-watch 固定写 dark，这份覆盖暂时走不到） ---------- */
:root[data-fz3-theme="light"]{--fz3-cyan:#2f62e0;--fz3-text:#151b2f;color-scheme:light}
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
html[data-fz3-theme="light"] .fz3-set{color:#16213a}
html[data-fz3-theme="light"] .fz3-set-name{color:#0f1730}
html[data-fz3-theme="light"] .fz3-set-sub,html[data-fz3-theme="light"] .fz3-set-desc{color:#5c6b8f}
html[data-fz3-theme="light"] .fz3-set-card{background:rgba(255,255,255,.55);border-color:rgba(60,90,220,.16)}
html[data-fz3-theme="light"] .fz3-dash-section-title{color:#16213a}
html[data-fz3-theme="light"] .fz3-dash-section-meta,html[data-fz3-theme="light"] .fz3-dash-kicker,html[data-fz3-theme="light"] .fz3-dash-desc,html[data-fz3-theme="light"] .fz3-dash-preview,html[data-fz3-theme="light"] .fz3-dash-foot{color:#5c6b8f}
html[data-fz3-theme="light"] .fz3-dash-value{color:#16213a}
html[data-fz3-theme="light"] .fz3-dash-value.is-on{color:#3f7d00}
html[data-fz3-theme="light"] .fz3-set-line,html[data-fz3-theme="light"] .fz3-set-pair{border-top-color:rgba(60,90,220,.12)}
html[data-fz3-theme="light"] .fz3-set-linkbtn{color:#526a94}
html[data-fz3-theme="light"] .fz3-set-btn{color:#1b2a4a;background:rgba(47,85,232,.10);border-color:rgba(70,110,230,.34)}
html[data-fz3-theme="light"] .fz3-set-btn:hover:not(:disabled){background:rgba(47,85,232,.18);border-color:rgba(70,110,230,.55)}
html[data-fz3-theme="light"] .fz3-set-btn.is-ghost{background:rgba(255,255,255,.6);border-color:rgba(120,140,200,.34)}
html[data-fz3-theme="light"] .fz3-set-input{color:#18203a;background:rgba(255,255,255,.9);border-color:rgba(60,90,220,.22)}
html[data-fz3-theme="light"] .fz3-set-note{color:#65759b}
html[data-fz3-theme="light"] .fz3-set-switch{background:rgba(120,150,200,.25);border-color:rgba(60,90,220,.25)}
html[data-fz3-theme="light"] .fz3-set-switch::after{background:#fff;box-shadow:0 1px 3px rgba(20,40,90,.28)}
html[data-fz3-theme="light"] .fz3-set-switch[data-on="1"]::after{background:#04121f;box-shadow:none}

/* ---------- 眼徽交互：只做状态指示；按住右键拖动，左键不作用（v1.7.5） ---------- */
.fz3-layer[data-phase="dock"] .fz3-core{pointer-events:auto;cursor:default;touch-action:none}
.fz3-layer[data-dragging="1"][data-phase="dock"] .fz3-core{transition:none;cursor:grabbing;will-change:transform}
.fz3-layer[data-dragging="1"][data-phase="dock"] .fz3-core svg{transition:none;transform:none}
/* 拖动期临时关掉最贵的两处合成：300% 的脉冲环与全屏 mix-blend 氛围层（松手即恢复） */
.fz3-layer[data-dragging="1"] .fz3-eye-pulse{display:none}
.fz3-layer[data-dragging="1"] .fz3-atmos{mix-blend-mode:normal}
.fz3-layer[data-phase="dock"] .fz3-core:hover .fz3-eye-svg{transform:scale(1.07)}

/* ---------- 眼徽的焦点框（v1.7.5） ---------- */
/* 眼徽是 role="button" 的 div：Chromium 在鼠标点过之后也会判成 :focus-visible，
   于是皮肤那条全局青柠描边（2px + 2px offset）会在眼徽外面套一个大方框 —— 看着像 bug，
   其实是焦点环。这里把边框去掉，键盘可达性改成和 hover 一样的「放大 7%」，不再画框。 */
.fz3-core,.fz3-core:focus,.fz3-core:focus-visible{outline:none!important}
.fz3-layer[data-phase="dock"] .fz3-core:focus-visible .fz3-eye-svg{transform:scale(1.07)}

/* ---------- 常驻电费读数（v1.7.5） ---------- */
/* 不做成卡片：没有底色、描边和阴影，就是侧栏页脚上方的几行字 + 一行计费说明，
   和侧栏自己在同一个平面上，不会在窗口里再「套一个窗口」抢视线。
   位置（v2.0.3）：贴在侧栏页脚上沿 6px 处，具体值由 BillDock 实测页脚 top 后写进
   --fz3-bill-bottom（窗口高度 / 页脚高度变化会跟着重算）；86px 只是 JS 未生效时的兜底。
   同时 BillDock 把「电费坞高度 + 上下留白」写进 --fz3-bill-reserve，侧栏列表区底部
   让出等高的空白（见下方 regionArea 规则），工作区列表再长也滚不到电费坞底下。
   这里就是电费唯一的出口：不再有气泡，也没有点击；眼徽退回纯状态指示。
   数据走 usageCache 的 30s / 60s TTL，20s 轮询基本都命中缓存，不会反复解压会话日志。 */
.fz3-bill{
  position:fixed;left:12px;bottom:var(--fz3-bill-bottom,86px);width:255px;z-index:2;box-sizing:border-box;
  display:grid;gap:1px;padding:8px 10px 9px;border-radius:8px;
  pointer-events:auto;background:transparent;
  font-family:var(--fz3-font);font-size:14px;line-height:1.45;color:rgba(242,242,238,.72);
}
.fz3-bill-head{margin-bottom:6px;font-family:var(--fz3-mono);font-size:15px;font-weight:700;letter-spacing:.06em;color:rgba(216,250,0,.86)}
.fz3-bill-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.fz3-bill-k{color:rgba(242,242,238,.72);white-space:nowrap}
.fz3-bill-v{font-family:var(--fz3-mono);font-size:13px;font-weight:500;font-variant-numeric:tabular-nums;color:rgba(242,242,238,.95);white-space:nowrap}
.fz3-bill-vwrap{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
/* 谷 / 峰：和旧气泡同一套色（谷绿、峰橙），只是缩小到 16px 塞进读数行 */
.fz3-bill-tag{width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-family:var(--fz3-font);font-size:10.5px;font-weight:700;line-height:1;color:#fff;background:#2ec25f}
.fz3-bill[data-tone="peak"] .fz3-bill-tag{background:#f0a13a}
.fz3-bill-clock{font-family:var(--fz3-mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;color:#63bf8c;white-space:nowrap}
.fz3-bill[data-tone="peak"] .fz3-bill-clock{color:#d8a86a}
.fz3-bill[data-loading="1"]{opacity:.55}
.fz3-bill-note{margin-top:5px;padding-top:6px;border-top:1px solid rgba(242,242,238,.07);font-size:11px;line-height:1.5;letter-spacing:.01em;color:rgba(242,242,238,.34)}
html[data-fz3-theme="light"] .fz3-bill-head{color:rgba(96,122,0,.9)}
html[data-fz3-theme="light"] .fz3-bill-k{color:rgba(16,17,16,.72)}
html[data-fz3-theme="light"] .fz3-bill-v{color:rgba(16,17,16,.92)}
html[data-fz3-theme="light"] .fz3-bill-clock{color:#2f8757}
html[data-fz3-theme="light"] .fz3-bill-note{color:rgba(16,17,16,.44);border-top-color:rgba(16,17,16,.09)}
html[data-fz3-theme="light"] .fz3-bill[data-tone="peak"] .fz3-bill-clock{color:#a06718}

/* v2.0.3：侧栏工作区列表区底部让出电费坞的高度，列表最后一行永远停在电费坞上方。
   变量由 BillDock 实测写入（电费坞高度 + 14px），默认 0 = 不占位。
   regionArea 是 flex 列 + overflow:hidden，padding-bottom 只会缩内层滚动区的底边，
   不会把页脚顶走（已按宿主 content-box 实测：regionArea 高度不变，列表 -152px）。 */
[class*="_regionArea"]{padding-bottom:var(--fz3-bill-reserve,0px)}

/* ==================================================================
 * v1.7.0 — 「绳网终端 / WIRE-NET TERMINAL」宿主皮肤层
 * 语言来源：zzz.mihoyo.com（纸面 zine：纸白/墨黑/荧光青柠/斜切块/胶片孔/Impact 数字）
 *           + baike.mihoyo.com/zzz/wiki（监控台：三层黑面板/1px 描边/12px 圆角/单强调色）
 * 约定：强调色青柠 #d8fa00 只给选中/主行动，整屏 <5%；不新增 @keyframes、不用毛玻璃；
 *      浅色 = 纸面，深色 = 墨黑面板；Fairy 蓝眼保留为唯一签名色。
 * ================================================================== */
/* 令牌只留真正被 var() 消费的这几个。v1.7.5 清理掉的一批
 * （lime-dim / ink / paper / panel / panel-2 / hair / mute）从来没有任何规则引用，
 * 留着只会让人以为改它们有效。 */

/* v2.0.4（标题字体）：标题层随包内置 Anton（SIL OFL 1.1，见 assets/anton/OFL.txt），
 * 不再依赖用户机器装没装 Impact，跨平台观感一致；Impact 留作次选回落。
 * Anton 只有 400 一档字重、且不含汉字：英文字形按 400 的天然粗细渲染（下面 L 段用
 * font-synthesis-weight:none 关掉合成加粗），汉字逐字回落到后面的 CJK 字体。 */
@font-face{
  font-family:"FZ3 Display";
  src:url("/fairy-zzz/assets/anton/Anton-Regular.woff2") format("woff2");
  font-weight:400;
  font-style:normal;
  font-display:swap;
}

:root{
  --fz3-lime:#d8fa00;
  --fz3-amber:#ffde00;
  /* v2.0.4（标题字体）：标题层首选内置 Anton（上面 @font-face），Impact 只作次选回落；
     正文、对话、代码保持原字体。Anton / Impact 都不含汉字，汉字逐字回落到后面的 CJK 字体。 */
  --fz3-mono:"Cascadia Mono","Cascadia Code","SF Mono",Consolas,"Microsoft YaHei UI",monospace;
  --fz3-display:"FZ3 Display","Impact","Haettenschweiler","Arial Narrow","HarmonyOS Sans SC","Microsoft YaHei UI","PingFang SC","Noto Sans SC",system-ui,sans-serif;
  --fz3-cyan:#d8fa00;
  --fz3-text:#f2f2ee;
}
:root[data-fz3-theme="light"],html[data-fz3-theme="light"]{
  --fz3-lime:#d8fa00;
  --fz3-cyan:#6f8700;
  --fz3-text:#101110;
}

/* ---------- A. 画布：纸面 / 墨黑 + 斜纹 + 网点 ----------
 * 纹理全部合成进 body 背景，不新增 position:fixed 层，维持 v1.6 的 fixed=10 性能预算。
 * v1.7.4（性能）：改回默认 background-attachment:scroll —— 宿主的内容滚动都在内层容器里，
 * body 本身不滚，所以画布观感完全一致；但省掉了「全屏 fixed 背景层」参与每次合成的机会。 */
html{background:#0a0a0a!important}
body{
  background-color:#0a0a0a!important;
  /* v1.7.5（观感）：把绝区零那张「ZERO 字墙」铺成画布底纹，不再是纯网点。
     层序（上 → 下）：暗角收边 → 上下收边（中段遮罩浓淡由 --fz3-wall-veil 一个数控）
     → 左下青柠底光 → 字墙图 → 网点 → 斜纹。
     原图是两色调（#010101 底 / #191919 字形），在 assets/zzz-pattern.webp 里已做过
     色调映射压到 #0a0a0a 画布附近，所以直接铺也不会盖过正文；
     范围取 cover + 居中：窗口怎么变都铺满、不变形、不出现拼缝。 */
  background-image:
    radial-gradient(120% 106% at 50% 46%,rgba(10,10,10,0) 0%,rgba(10,10,10,0) 40%,rgba(10,10,10,.52) 78%,rgba(10,10,10,.95) 100%),
    linear-gradient(180deg,rgba(10,10,10,.94) 0px,rgba(10,10,10,.30) 104px,rgba(10,10,10,var(--fz3-wall-veil,.06)) 30%,rgba(10,10,10,var(--fz3-wall-veil,.06)) 58%,rgba(10,10,10,.62) 82%,rgba(10,10,10,.96) 100%),
    radial-gradient(30% 26% at 0% 100%,rgba(216,250,0,.055),transparent 72%),
    url('/fairy-zzz/assets/zzz-pattern.webp'),
    radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.4px),
    repeating-linear-gradient(-45deg,rgba(255,255,255,.028) 0 1px,transparent 1px 11px)!important;
  background-size:auto,auto,auto,cover,18px 18px,auto!important;
  background-position:center center,center center,center center,center center,0 0,0 0!important;
  background-repeat:no-repeat,no-repeat,no-repeat,no-repeat,repeat,repeat!important;
  background-attachment:scroll!important;
}
:root[data-fz3-theme="light"] body,html[data-fz3-theme="light"] body{
  background-color:#efefed!important;
  /* 浅色：同一张字墙，用纸色薄纱压成「印在纸上」的浅灰，四边收回纯纸色。 */
  background-image:
    radial-gradient(120% 106% at 50% 46%,rgba(239,239,237,.58) 0%,rgba(239,239,237,.66) 44%,rgba(239,239,237,.92) 82%,#efefed 100%),
    linear-gradient(180deg,rgba(239,239,237,.98) 0px,rgba(239,239,237,.86) 104px,rgba(239,239,237,.72) 30%,rgba(239,239,237,.72) 58%,rgba(239,239,237,.93) 82%,rgba(239,239,237,.99) 100%),
    radial-gradient(44% 36% at 88% -8%,rgba(216,250,0,.16),transparent 70%),
    radial-gradient(30% 26% at 0% 100%,rgba(216,250,0,.10),transparent 72%),
    url('/fairy-zzz/assets/zzz-pattern.webp'),
    radial-gradient(rgba(16,17,16,.09) 1px,transparent 1.4px),
    repeating-linear-gradient(-45deg,rgba(16,17,16,.035) 0 1px,transparent 1px 11px)!important;
  background-size:auto,auto,auto,auto,cover,18px 18px,auto!important;
  background-position:center center,center center,center center,center center,center center,0 0,0 0!important;
  background-repeat:no-repeat,no-repeat,no-repeat,no-repeat,no-repeat,repeat,repeat!important;
  background-attachment:scroll!important;
}
/* ---------- A2. 画布穿透：让外壳自己的底色让开 ----------
 * 桌面端外壳在 body 之上又铺了三层底：整窗 .mP3x-q_frame（#101110），
 * 会话列 .mP3x-q_centerCol 与会话根 .an3WzG_root 再各压一层 rgba(10,10,10,.9)。
 * 画布被盖了两遍：0.9×10 + 0.1×16 = 10.6，字墙 26 级的字压完只剩 11 级，
 * 和纯黑没区别 —— v1.7.5 之前「桌面端看不到底纹」就是这一层造成的。
 * 这里只让开颜色、不动布局：侧栏 .wtg9ga_root 仍是 #101110，弹层仍是自己的面，
 * 字墙和暗角全部回到 body 那一份（深/浅两套）上，全窗连续、不出接缝。 */
.mP3x-q_frame,.mP3x-q_centerCol,[class$="_centerCol"],.an3WzG_root{background-color:transparent!important}
::selection{background:var(--fz3-lime)!important;color:#0a0b08!important}
html[data-fz3-theme="light"] ::selection{background:#101110!important;color:#d8fa00!important}
*::-webkit-scrollbar{width:8px;height:8px}
*::-webkit-scrollbar-track{background:transparent}
*::-webkit-scrollbar-thumb{background:rgba(216,250,0,.42)!important;border-radius:999px;border:2px solid transparent;background-clip:padding-box}
*::-webkit-scrollbar-thumb:hover{background:rgba(216,250,0,.72)!important;background-clip:padding-box}
html[data-fz3-theme="light"] *::-webkit-scrollbar-thumb{background:rgba(16,17,16,.26)!important;background-clip:padding-box}
html[data-fz3-theme="light"] *::-webkit-scrollbar-thumb:hover{background:rgba(16,17,16,.46)!important;background-clip:padding-box}
/* 列表底部的渐隐层原本铺到右缘，会把滚动条一起渐隐；右侧让出滚动条，避免电费坞上方那截滑条发黑。 */
.GAkraW_fade{right:12px}
textarea,input{caret-color:var(--fz3-lime)!important}
textarea:focus,input:focus{box-shadow:none!important}
a{color:var(--fz3-cyan)!important;text-underline-offset:3px}
pre,code,kbd,samp{font-family:var(--fz3-mono)!important}
:focus-visible{outline:2px solid rgba(216,250,0,.75)!important;outline-offset:2px}
html[data-fz3-theme="light"] :focus-visible{outline-color:#101110!important}
/* 附件缩略图在宿主的 64px 高度 rail（overflow:hidden）里：外扩焦点环会被上下裁掉，只剩左右两条竖条。
   缩略图改用内嵌焦点环（负 offset），环形仍完整可见且不撑开任何布局。 */
[class*="_thumbnail"]:focus-visible{outline:2px solid rgba(216,250,0,.85)!important;outline-offset:-2px!important}
html[data-fz3-theme="light"] [class*="_thumbnail"]:focus-visible{outline-color:#101110!important}
/* 宿主菜单项与工作区树行的焦点环改用内嵌，避免被菜单 overflow 裁掉、
   或被下一行的选中底色盖住（TAB 连续切换时尤明显）。
   宿主菜单项是 button，部分弹层不带 role=menuitem，所以再按 [role=menu] 兜一层。 */
[role="treeitem"]:focus-visible,
[role="menuitem"]:focus-visible,
[role="menuitemradio"]:focus-visible,
[role="menuitemcheckbox"]:focus-visible,
[role="option"]:focus-visible,
[role="menu"] button:focus-visible,
[role="menu"] a:focus-visible,
[role="listbox"] button:focus-visible{outline-offset:-2px!important}
/* 字标的焦点环改画在插件覆盖层上：宿主按钮只有 24px 高、和 46px 高的可见字标错位，
   原外框会从「// Fairy」中间穿过、压到副标题。 */
.wtg9ga_brand:focus-visible{outline:none!important}
body:has(.wtg9ga_brand:focus-visible) .fz3-sb-brand{
  outline:2px solid rgba(216,250,0,.75)!important;outline-offset:2px;
}
html[data-fz3-theme="light"] body:has(.wtg9ga_brand:focus-visible) .fz3-sb-brand{outline-color:#101110!important}

/* ---------- B. 侧栏：墨黑底 + 纸白胶囊 ---------- */
.wtg9ga_root{
  background:#101110!important;border-right:1px solid rgba(255,255,255,.09);
  --dsw-alias-label-primary:#f2f2ee;
  --dsw-alias-label-secondary:rgba(242,242,238,.56);
  --dsw-alias-label-tertiary:rgba(242,242,238,.36);
  --dsw-alias-label-quaternary:rgba(242,242,238,.22);
}
html[data-fz3-theme="light"] .wtg9ga_root{border-right-color:rgba(255,255,255,.10)}
.wtg9ga_logoRow{height:52px!important}
.wtg9ga_brandName,.wtg9ga_brandName *{color:#f2f2ee!important}
.wtg9ga_iconButton{color:rgba(242,242,238,.44);border-radius:6px}
.wtg9ga_iconButton:hover{color:#fff;background:rgba(255,255,255,.08)}
/* 新会话 = 荧光青柠主行动 */
.wtg9ga_newSession{
  background:var(--fz3-lime)!important;border:1px solid #000!important;border-radius:999px!important;
  color:#0a0b08!important;font-weight:700!important;letter-spacing:.01em!important;
  box-shadow:3px 3px 0 rgba(0,0,0,.55);
}
.wtg9ga_newSession *{color:#0a0b08!important}
.wtg9ga_newSession [class*="_kbd"],
.wtg9ga_newSession [class*="_key"],
.wtg9ga_newSession [class*="_separator"]{
  border-color:rgba(10,11,8,.32)!important;color:rgba(10,11,8,.66)!important;background:transparent!important;
}
.wtg9ga_newSession:hover{background:#f4ffb8!important}
/* 一级导航：胶囊行，选中 = 纸白底墨字（官网顶栏 active pill 的同一语法） */
.wtg9ga_panelRow{
  border-radius:999px!important;height:34px!important;min-height:34px!important;padding:0 12px!important;
  color:rgba(242,242,238,.60)!important;transition:background-color .14s ease,color .14s ease;
}
.wtg9ga_panelRow:hover{background:rgba(255,255,255,.07)!important;color:#fff!important}
/* 选中只留纸白胶囊本身。不要再加 inset 左划线：999px 胶囊的圆角会把 2px 直边切成一弯月牙，
   v1.7.1 已因此被误认为残留高亮，v1.7.2 移除（官网顶栏 active pill 本来也没有竖线装饰）。 */
.wtg9ga_panelRow[aria-current="page"],.wtg9ga_panelRow[data-active="true"],.wtg9ga_panelRow[data-selected="true"]{
  background:#f2f2ee!important;color:#0a0b08!important;box-shadow:none!important;
}
.wtg9ga_panelRow[aria-current="page"] *,.wtg9ga_panelRow[data-active="true"] *{color:#0a0b08!important}
/* 分区小标：// 等宽大写（官网 VIDEO / BACKGROUND kicker + wiki /// 模块标题的合并）。
   v1.7.5：原来 10px / 34% 白，比下面的会话行还小还淡，标题反而缩在内容后面；
   现在放大到 13px、提亮到 82%，让「工作区」先被看见，// 仍然是青柠。 */
.GAkraW_sectionLabel{
  font-family:var(--fz3-display)!important;font-size:13px!important;font-weight:700!important;
  letter-spacing:.12em!important;text-transform:uppercase;color:rgba(242,242,238,.82)!important;
}
.GAkraW_sectionLabel::before{content:"// ";color:var(--fz3-lime);font-weight:700}
.GAkraW_sectionLabel svg{color:rgba(242,242,238,.55)}
/* 会话行：选中 = 青柠左划线 + 青柠 8% 底 */
.wnFoaW_sessionRow{height:32px!important;border-radius:6px!important;color:rgba(242,242,238,.58)!important}
.wnFoaW_sessionRow:hover{background:rgba(255,255,255,.06)!important;color:#fff!important}
.wnFoaW_sessionRow.wnFoaW_selected,.wnFoaW_sessionRow[aria-selected="true"]{
  background:rgba(216,250,0,.12)!important;color:#fff!important;box-shadow:inset 2px 0 0 var(--fz3-lime);
}
.wnFoaW_sessionRow.wnFoaW_selected *,.wnFoaW_sessionRow[aria-selected="true"] *{color:#fff!important}
.wnFoaW_projectRow{border-radius:6px!important;color:rgba(242,242,238,.72)!important}
.wnFoaW_projectRow:hover{background:rgba(255,255,255,.06)!important}
[data-slot="sidebar.workspaces"] svg{color:rgba(216,250,0,.72)}
[data-slot="sidebar.footer.action"]{color:rgba(242,242,238,.42)!important;border-radius:6px!important}
[data-slot="sidebar.footer.action"]:hover{color:var(--fz3-lime)!important;background:rgba(255,255,255,.06)!important}
._5Qcc8a_trigger{border-radius:999px!important;color:rgba(242,242,238,.74)!important}
._5Qcc8a_trigger:hover{background:rgba(255,255,255,.07)!important;color:#fff!important}

/* ---------- C. 顶栏 ---------- */
.an3WzG_header{border-bottom:1px solid rgba(255,255,255,.08)!important;background:transparent!important}
html[data-fz3-theme="light"] .an3WzG_header{border-bottom-color:rgba(16,17,16,.14)!important}
.an3WzG_tab{
  border-radius:999px!important;padding:4px 12px!important;font-family:var(--fz3-mono)!important;
  font-size:11px!important;letter-spacing:.05em;color:rgba(242,242,238,.44)!important;
}
.an3WzG_tab:hover{color:#fff!important}
.an3WzG_tabActive{background:#f2f2ee!important;color:#0a0b08!important}
/* 宿主默认用 .an3WzG_tabActive:after 的 2px 下划线当选中指示；胶囊底已经表达了选中，
   二者叠加会在纸白胶囊下缘露出半截青柠线，v1.7.2 关掉宿主下划线。 */
.an3WzG_tabActive::after{display:none!important}
html[data-fz3-theme="light"] .an3WzG_tab{color:rgba(16,17,16,.46)!important}
html[data-fz3-theme="light"] .an3WzG_tab:hover{color:#101110!important}
html[data-fz3-theme="light"] .an3WzG_tabActive{background:#101110!important;color:#f2f2ee!important}

/* ---------- D. 输入区：纸卡 / 墨卡 + 青柠发送 ---------- */
/* v1.7.3：宿主给 composer 座位铺「透明 → --dsw-alias-bg-base」的 36px 渐变遮罩（sticky 底部），
   皮肤把 bg-base 映射成 90~94% 半透明，遮罩收不实——滚动中的对话文字会从状态行下方透出来。
   这里按同样的渐变语法把终点改成不透明画布色（只作用于 composer 座位，不动全局 token）。 */
.an3WzG_root[data-phase="active"] .an3WzG_composerSeat,
.an3WzG_embeddedBody[data-content-phase="active"] .an3WzG_composerSeat{
  background:linear-gradient(180deg,rgba(10,10,10,0) 0px,#0a0a0a 36px)!important;
}
html[data-fz3-theme="light"] .an3WzG_root[data-phase="active"] .an3WzG_composerSeat,
html[data-fz3-theme="light"] .an3WzG_embeddedBody[data-content-phase="active"] .an3WzG_composerSeat{
  background:linear-gradient(180deg,rgba(239,239,237,0) 0px,#efefed 36px)!important;
}
.GRgSLq_card{
  border-radius:20px!important;background:#141614!important;border:1px solid #2b2d28!important;
  box-shadow:none!important;
}
.GRgSLq_card:focus-within{border-color:rgba(216,250,0,.50)!important;box-shadow:0 0 0 2px rgba(216,250,0,.14)!important}
.GRgSLq_card textarea::placeholder,.GRgSLq_card input::placeholder,.GRgSLq_placeholder{color:rgba(242,242,238,.30)!important}
.GRgSLq_placeholder *{color:inherit!important}
.GRgSLq_primary{
  background:var(--fz3-lime)!important;color:#0a0b08!important;border-radius:999px!important;box-shadow:none!important;
  transition:filter .14s ease,transform .14s ease!important;
}
.GRgSLq_primary svg{color:#0a0b08!important;fill:#0a0b08!important}
.GRgSLq_primary:hover:not(:disabled){background:#e6ff52!important;filter:none!important;transform:translateY(-1px)}
.GRgSLq_add{
  border:1px solid rgba(255,255,255,.16)!important;background:transparent!important;border-radius:999px!important;
  color:rgba(242,242,238,.72)!important;
}
.GRgSLq_add:hover:not(:disabled){border-color:var(--fz3-lime)!important;color:var(--fz3-lime)!important;background:transparent!important}
/* 附件缩略图：宿主默认的白圆 X 在墨卡里太跳，改成墨底青柠描边、悬停反色；缩略图描边统一成皮肤灰线 */
.yTDIAG_thumbnail{border:1px solid rgba(255,255,255,.14)!important;background:#101210!important}
.yTDIAG_thumbnail:hover{border-color:rgba(216,250,0,.55)!important}
.yTDIAG_remove{
  width:18px!important;height:18px!important;top:5px!important;right:5px!important;
  background:#0b0c0a!important;color:#f2f2ee!important;
  border:1px solid rgba(216,250,0,.60)!important;box-shadow:0 1px 4px rgba(0,0,0,.55)!important;
}
.yTDIAG_remove:hover,.yTDIAG_remove:focus-visible{background:var(--fz3-lime)!important;color:#0a0b08!important;border-color:var(--fz3-lime)!important}
.yTDIAG_remove svg{color:inherit!important}
html[data-fz3-theme="light"] .yTDIAG_thumbnail{border-color:rgba(16,17,16,.18)!important;background:#e8e8e2!important}
html[data-fz3-theme="light"] .yTDIAG_remove{background:#f7f7f3!important;color:#101110!important;border-color:rgba(16,17,16,.55)!important}
html[data-fz3-theme="light"] .yTDIAG_remove:hover,html[data-fz3-theme="light"] .yTDIAG_remove:focus-visible{background:#101110!important;color:#f7f7f3!important;border-color:#101110!important}
/* 工具 chips：等宽小胶囊 */
.WOwLGG_workspace,.m2hUqa_seat,._86kJGG_trigger,._9r0rkG_trigger{
  border-radius:999px!important;font-family:var(--fz3-mono)!important;font-size:11px!important;letter-spacing:.03em;
}
.WOwLGG_workspace,.m2hUqa_seat{border:1px solid rgba(255,255,255,.13);color:rgba(242,242,238,.72)!important}
.WOwLGG_workspace:hover,.m2hUqa_seat:hover{border-color:rgba(216,250,0,.45);color:#fff!important}
._86kJGG_trigger,._9r0rkG_trigger{color:rgba(242,242,238,.50)!important}
._86kJGG_trigger:hover,._9r0rkG_trigger:hover{color:#fff!important}
html[data-fz3-theme="light"] .GRgSLq_card{background:#fff!important;border-color:rgba(16,17,16,.22)!important;box-shadow:7px 7px 0 rgba(16,17,16,.08)!important}
html[data-fz3-theme="light"] .GRgSLq_card:focus-within{border-color:rgba(16,17,16,.45)!important;box-shadow:0 0 0 2px rgba(216,250,0,.22)!important}
html[data-fz3-theme="light"] .GRgSLq_card textarea::placeholder,html[data-fz3-theme="light"] .GRgSLq_placeholder{color:rgba(16,17,16,.36)!important}
html[data-fz3-theme="light"] .GRgSLq_add{border-color:rgba(16,17,16,.20)!important;color:rgba(16,17,16,.62)!important}
html[data-fz3-theme="light"] .WOwLGG_workspace,html[data-fz3-theme="light"] .m2hUqa_seat{border-color:rgba(16,17,16,.18);color:rgba(16,17,16,.68)!important}
html[data-fz3-theme="light"] ._86kJGG_trigger,html[data-fz3-theme="light"] ._9r0rkG_trigger{color:rgba(16,17,16,.52)!important}

/* ---------- E. 欢迎页：网端终端名牌 ---------- */
.WOwLGG_root{position:relative}
.WOwLGG_headline{position:relative;font-family:var(--fz3-display)!important;font-weight:700!important;letter-spacing:.015em!important;color:#f2f2ee!important}
.WOwLGG_headline::before{
  content:"// NETWORK TERMINAL 05";position:absolute;left:50%;top:-24px;transform:translateX(-50%);
  font-family:var(--fz3-mono);font-size:10px;font-weight:600;letter-spacing:.30em;
  color:rgba(216,250,0,.72);white-space:nowrap;pointer-events:none;
}
.WOwLGG_headline::after{
  content:"";position:absolute;left:50%;bottom:-13px;width:42px;height:3px;transform:translateX(-50%) skewX(-24deg);
  background:var(--fz3-lime);pointer-events:none;
}
.WOwLGG_previewBadge{
  background:var(--fz3-lime)!important;color:#0a0b08!important;border:1px solid #000!important;
  border-radius:2px!important;font-family:var(--fz3-mono)!important;font-size:10px!important;
  font-weight:700!important;letter-spacing:.12em!important;line-height:15px!important;
  padding:2px 7px!important;margin-top:2px!important;align-self:center!important;
}
/* v1.7.5：欢迎页右侧本来印着一个 200px 的「05」大号水印（网端终端的分区编号），
   纯装饰、没有功能，还会被 composer 边缘切掉一截，看着像没对齐的污渍——去掉。
   标题上方的「// NETWORK TERMINAL 05」保留，那是同一套编号里能读的那一半。 */
.fz3-hero-brand-eye{filter:drop-shadow(0 0 8px rgba(96,148,255,.45))}
html[data-fz3-theme="light"] .WOwLGG_headline{color:#101110!important}
html[data-fz3-theme="light"] .WOwLGG_headline::before{color:#6f8700}
html[data-fz3-theme="light"] .WOwLGG_previewBadge{border-color:#101110!important}

/* ---------- F. 消息：墨块用户气泡 / 无气泡回答 ---------- */
.LOmM4q_bubble{
  background:#23251f!important;color:#f2f2ee!important;border:1px solid rgba(255,255,255,.09);
  border-radius:14px 14px 3px 14px!important;padding:10px 16px!important;
}
html[data-fz3-theme="light"] .LOmM4q_bubble{
  background:#111210!important;color:#f5f5f0!important;border-color:#111210!important;
  border-radius:14px 14px 3px 14px!important;
}
html[data-fz3-theme="light"] .LOmM4q_bubble *{color:#f5f5f0!important}
[data-slot="main.conversation"]{color:#f2f2ee}
html[data-fz3-theme="light"] [data-slot="main.conversation"]{color:#101110}

/* ---------- G. 设置弹窗：wiki 监控台面板 ---------- */
/* 只换色，不动宿主的 800×800 网格、188px 导航列、54px 标题行与 40px 导航项几何：
   分隔线用 inset box-shadow 画，避免 border 把宿主尺寸顶开 1px。 */
.AnXs9G_panel{
  background:#1b1d1b!important;box-shadow:0 0 0 1px rgba(0,0,0,.55),0 40px 90px -44px rgba(0,0,0,.95)!important;
}
.AnXs9G_nav{box-shadow:inset -1px 0 0 rgba(255,255,255,.08)!important}
.AnXs9G_navTitle{font-family:var(--fz3-display)!important;letter-spacing:.18em!important;color:rgba(242,242,238,.50)!important}
.AnXs9G_navCell{color:rgba(242,242,238,.62)!important}
.AnXs9G_navCell:hover{background:rgba(255,255,255,.06)!important}
.AnXs9G_navCell.AnXs9G_active{background:var(--fz3-lime)!important;color:#0a0b08!important;font-weight:700!important}
.AnXs9G_navCell.AnXs9G_active *{color:#0a0b08!important}
.AnXs9G_header{box-shadow:inset 0 -1px 0 rgba(255,255,255,.08)!important}
.AnXs9G_close{color:rgba(242,242,238,.6)!important}
.AnXs9G_close:hover{background:rgba(255,255,255,.08)!important;color:#fff!important}
html[data-fz3-theme="light"] .AnXs9G_panel{background:#fff!important;box-shadow:14px 14px 0 rgba(16,17,16,.10)!important}
html[data-fz3-theme="light"] .AnXs9G_nav{box-shadow:inset -1px 0 0 rgba(16,17,16,.12)!important}
html[data-fz3-theme="light"] .AnXs9G_navTitle{color:rgba(16,17,16,.50)!important}
html[data-fz3-theme="light"] .AnXs9G_navCell{color:rgba(16,17,16,.62)!important}
html[data-fz3-theme="light"] .AnXs9G_navCell.AnXs9G_active,html[data-fz3-theme="light"] .AnXs9G_navCell.AnXs9G_active *{color:#0a0b08!important}
/* 宿主用 <a> 实现的内联主按钮（设置页「充值」）：青柠底墨字，压过全局 a 规则 */
._6qcDqa_linkButton{color:var(--fz3-cyan)!important}
._6qcDqa_linkButton._6qcDqa_primary{background:var(--fz3-lime)!important;color:#0a0b08!important;font-weight:700!important;border-radius:999px!important}
._6qcDqa_linkButton._6qcDqa_primary:hover{background:#e6ff52!important;color:#0a0b08!important}
html[data-fz3-theme="light"] .AnXs9G_navCell:hover{background:rgba(16,17,16,.05)!important}
html[data-fz3-theme="light"] .AnXs9G_header{box-shadow:inset 0 -1px 0 rgba(16,17,16,.12)!important}
html[data-fz3-theme="light"] .AnXs9G_close{color:rgba(16,17,16,.6)!important}
html[data-fz3-theme="light"] .AnXs9G_close:hover{background:rgba(16,17,16,.06)!important;color:#101110!important}
._button_1rv3m_2,._button_1rv3m_2:is(:hover,:focus-visible){border-radius:999px!important}

/* ---------- H. 插件自身组件：Fairy 设置 / 字标 / dock 气泡 ---------- */
.fz3-set{color:#f2f2ee}
.fz3-set-card{background:transparent!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:8px!important}
.fz3-set-tab{border-radius:999px!important;background:transparent!important;border:1px solid rgba(255,255,255,.16)!important;color:rgba(242,242,238,.66)!important;font-family:var(--fz3-mono)!important;letter-spacing:.04em}
.fz3-set-tab:hover{background:rgba(255,255,255,.05)!important;border-color:rgba(255,255,255,.32)!important;color:#f2f2ee!important}
.fz3-set-tab.is-active{background:var(--fz3-lime)!important;border-color:var(--fz3-lime)!important;color:#0a0b08!important}
.fz3-set-tab.is-active:hover{background:#e6ff52!important;border-color:#e6ff52!important;color:#0a0b08!important}
.fz3-set-engine-controls{display:flex;align-items:center;gap:8px}
.fz3-dash-section-title{font-family:var(--fz3-mono);letter-spacing:.16em;color:#f2f2ee!important}
.fz3-dash-section-meta{color:rgba(242,242,238,.40)!important}
.fz3-dash-kicker{color:rgba(242,242,238,.46)!important}
.fz3-dash-value{color:#f2f2ee!important}
.fz3-dash-value.is-on{color:var(--fz3-lime)!important}
.fz3-dash-value.is-error{color:#ff8a72!important}
.fz3-dash-desc,.fz3-dash-preview{color:rgba(242,242,238,.48)!important}
.fz3-set-card-title{font-weight:700}
.fz3-set-card-status{color:rgba(242,242,238,.40)!important}
.fz3-set-line,.fz3-set-pair{border-top-color:rgba(255,255,255,.08)!important}
.fz3-set-linkbtn{
  color:rgba(242,242,238,.44)!important;font-family:var(--fz3-mono)!important;text-decoration:none!important;
  border-bottom:1px dotted rgba(255,255,255,.22)!important;padding-bottom:1px!important;
}
.fz3-set-linkbtn:hover:not(:disabled){color:var(--fz3-lime)!important;border-bottom-color:var(--fz3-lime)!important}
.fz3-set-name{font-weight:700}
.fz3-set-sub,.fz3-set-desc,.fz3-set-note{color:rgba(242,242,238,.48)!important}
.fz3-set-switch[data-on="1"]{background:var(--fz3-lime)!important;border-color:var(--fz3-lime)!important}
.fz3-set-switch[data-on="1"]::after{background:#0a0b08!important}
.fz3-set-btn{
  border-radius:999px!important;background:transparent!important;border:1px solid rgba(255,255,255,.22)!important;
  color:#f2f2ee!important;font-family:var(--fz3-mono)!important;font-size:11px!important;letter-spacing:.03em;
}
.fz3-set-btn:hover:not(:disabled){background:var(--fz3-lime)!important;border-color:var(--fz3-lime)!important;color:#0a0b08!important}
.fz3-set-btn.is-ghost{background:transparent!important;border-color:rgba(255,255,255,.16)!important;color:rgba(242,242,238,.66)!important}
.fz3-set-input{
  border-radius:6px!important;background:#0e0f0e!important;border-color:rgba(255,255,255,.14)!important;
  color:#f2f2ee!important;font-family:var(--fz3-mono)!important;
}
.fz3-set-input:focus{border-color:rgba(216,250,0,.6)!important;box-shadow:0 0 0 3px rgba(216,250,0,.12)!important}
.fz3-set-dot.is-on{background:var(--fz3-lime);color:var(--fz3-lime)}
.fz3-brandname b,:root[data-fz3-theme] .fz3-brandname b{
  font-family:var(--fz3-display)!important;
  font-size:13px!important;font-weight:700!important;letter-spacing:.16em!important;color:#f2f2ee!important;text-shadow:none!important;
}
.fz3-brandname b::before{content:"// ";color:var(--fz3-lime);font-weight:700}
.fz3-brandname i{font-family:var(--fz3-mono)!important;font-size:8px!important;letter-spacing:.18em!important;color:rgba(216,250,0,.72)!important}
.fz3-brandmark-eye{filter:drop-shadow(0 0 6px rgba(96,148,255,.5))!important}
.fz3-sb-text b{font-family:var(--fz3-display)!important;font-style:italic!important;font-size:19px!important;letter-spacing:.03em!important;color:#f2f2ee!important;text-shadow:none!important}
.fz3-sb-text b::before{content:"//";font-family:var(--fz3-mono);font-style:normal;font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--fz3-lime);margin-right:6px;vertical-align:2px}
.fz3-sb-text i{font-family:var(--fz3-mono)!important;font-size:8px!important;line-height:1.4!important;letter-spacing:.16em!important;color:rgba(216,250,0,.60)!important}
html[data-fz3-theme="light"] .fz3-brandname b,html[data-fz3-theme="light"] .fz3-sb-text b{color:#f2f2ee!important}
html[data-fz3-theme="light"] .fz3-set{color:#101110}
html[data-fz3-theme="light"] .fz3-set-card{background:transparent!important;border-color:rgba(16,17,16,.14)!important;border-radius:8px!important}
html[data-fz3-theme="light"] .fz3-set-tab{border-color:rgba(16,17,16,.18)!important;color:rgba(16,17,16,.62)!important}
html[data-fz3-theme="light"] .fz3-set-tab:hover{background:rgba(16,17,16,.05)!important;border-color:rgba(16,17,16,.32)!important;color:#101110!important}
html[data-fz3-theme="light"] .fz3-set-tab.is-active{background:var(--fz3-lime)!important;border-color:var(--fz3-lime)!important;color:#0a0b08!important}
html[data-fz3-theme="light"] .fz3-set-tab.is-active:hover{background:#e6ff52!important;border-color:#e6ff52!important;color:#0a0b08!important}
html[data-fz3-theme="light"] .fz3-dash-section-title{color:#101110!important}
html[data-fz3-theme="light"] .fz3-dash-section-meta,html[data-fz3-theme="light"] .fz3-dash-kicker,html[data-fz3-theme="light"] .fz3-dash-desc,html[data-fz3-theme="light"] .fz3-dash-preview{color:rgba(16,17,16,.52)!important}
html[data-fz3-theme="light"] .fz3-dash-value{color:#101110!important}
html[data-fz3-theme="light"] .fz3-dash-value.is-on{color:#4b7c00!important}
html[data-fz3-theme="light"] .fz3-set-line,html[data-fz3-theme="light"] .fz3-set-pair{border-top-color:rgba(16,17,16,.10)!important}
html[data-fz3-theme="light"] .fz3-set-sub,html[data-fz3-theme="light"] .fz3-set-desc,html[data-fz3-theme="light"] .fz3-set-note{color:rgba(16,17,16,.52)!important}
html[data-fz3-theme="light"] .fz3-set-btn{border-color:rgba(16,17,16,.22)!important;color:#101110!important}
html[data-fz3-theme="light"] .fz3-set-input{background:#fff!important;border-color:rgba(16,17,16,.16)!important;color:#101110!important}
html[data-fz3-theme="light"] .fz3-set-linkbtn{color:rgba(16,17,16,.52)!important;border-bottom-color:rgba(16,17,16,.22)!important}

/* ---------- I. 开场覆盖层：墨黑 + 青柠 HUD 边框 ---------- */
.fz3-screen{background:#0a0a0a!important}
.fz3-boot{background:#0a0a0a!important}
/* 开场动画保持原片颜色：这一层原先是 grayscale(.45)+saturate(.78)+brightness(.84)，
   实测把画面平均饱和度从 .235 压到 .136、亮度从 102 压到 77，观感发灰。
   开场视频是插件里唯一的彩色素材，不该跟皮肤一起变灰，因此只保留极轻的对比校正，
   扫描线与暗角也相应减弱；其余开机元素仍走皮肤配色。 */
.fz3-boot-fill{filter:blur(46px) brightness(.58) saturate(1.15)!important}
.fz3-boot video{filter:saturate(1.04) contrast(1.02) brightness(1.02)!important}
.fz3-boot::after{
  background:
    repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 1px,transparent 1px 3px),
    radial-gradient(124% 100% at 50% 50%,transparent 66%,rgba(0,0,0,.46) 100%)!important;
}
.fz3-boot-sound{color:rgba(216,250,0,.78)!important;font-family:var(--fz3-mono)!important;letter-spacing:.24em!important}
.fz3-copy-lines{color:#efefec!important;text-shadow:0 2px 16px rgba(0,0,0,.65)!important}
.fz3-copy-sub{color:rgba(242,242,238,.42)!important;font-family:var(--fz3-mono)!important}
.fz3-skip2{color:rgba(216,250,0,.62)!important;font-family:var(--fz3-mono)!important;letter-spacing:.22em!important}
.fz3-skip2:hover{color:#eaff5a!important}
.fz3-eye::before{background:radial-gradient(closest-side,rgba(216,250,0,.22),rgba(216,250,0,.09) 46%,transparent 78%)!important}
.fz3-eye-halo{background:radial-gradient(closest-side,rgba(216,250,0,.17),rgba(216,250,0,.07) 46%,transparent 82%)!important}
/* （观感）只留左上角一个角标：右下角那个的横臂会从滚动条左侧探出来，
   和青柠色滚动条叠成一截突兀的断线，所以整条右下角标一并去掉。 */
.fz3-atmos-frame{border-color:rgba(216,250,0,.08)!important}
.fz3-atmos-frame::before{border-color:rgba(216,250,0,.34)!important}
.fz3-atmos-glow{background:radial-gradient(circle,rgba(216,250,0,.10),rgba(216,250,0,.03) 52%,transparent 78%)!important}
.fz3-atmos-flash{background:radial-gradient(ellipse at 60% 20%,rgba(216,250,0,.10),rgba(216,250,0,.03) 42%,transparent 72%)!important}
.fz3-voice:hover{color:var(--fz3-lime)!important;background:rgba(216,250,0,.10)!important;border-color:rgba(216,250,0,.35)!important;box-shadow:none!important}
.fz3-voice[data-state="play"]{color:var(--fz3-lime)!important;text-shadow:none!important}
.fz3-voice[data-state="busy"]{color:var(--fz3-amber)!important}

/* ---------- J. 动效纪律：只留 120–160ms 的色彩/位移 ---------- */
button,a,[role="button"],[role="treeitem"]{transition-duration:.14s!important}

/* v1.7.4（性能）+ v1.7.5（观感）：dock 相（= 用户真正在干活的相位）把整屏氛围层里那两团
 * 青柠辉光一起收掉。它们本来是给开机/问好那几秒做舞台光的，进了工作相位就只剩副作用：
 * 一层 z-index:3、fixed 铺满全窗的 rgba(216,250,0,.10) 渐变直接压在字墙上，
 * 屏幕顶部会糊出一片偏黄的透明色块（用户反馈「太不和谐」）。
 * 顺带也停掉两个常驻 loop（14s 呼吸 + 11s 闪烁），dock 相不再喂给合成器永不结束的活。
 * hero / greet / boot 三相保留；切相只用 .5s 淡出，不会留下跳变。 */
html[data-fz3-phase="dock"] .fz3-atmos-glow,
html[data-fz3-phase="dock"] .fz3-atmos-flash{
  animation:none!important;opacity:0!important;transition:opacity .5s ease!important;
}

/* v1.7.4（性能）：.fz3-rim 原先带 blur(8px)。它是一层 560×560 的 fixed 装饰光斑，
 * 底图本身就是 radial-gradient（边缘已经自然淡出），模糊只是把同一张图再算一遍；
 * 去掉后观感无差，但少一层全屏级离屏模糊。 */
.fz3-rim{filter:none!important}

/* v1.7.4（性能）：dock 相时宿主界面是不透明的纸面/墨黑面板，body 上的两张全屏 fixed
 * 装饰层（::before 大渐变、::after 48px 网格）永远被盖住，却仍参与每帧合成；
 * dock 相直接停绘。boot / greet / hero 三相保留——那几屏才是它们露脸的时候。 */
html[data-fz3-phase="dock"] body::before,
html[data-fz3-phase="dock"] body::after{display:none!important}

/* ---------- K. 账户菜单快捷键提示的对比度（v2.0.0） ----------
 * 「设置」右侧的 Ctrl+, 由宿主渲染成 _shortcut_ > _shortcutKeys_ > _keys_ > _key_，
 * 颜色取 --dsw-alias-label-tertiary，本皮肤深色只有 0.40 alpha；压在近黑菜单上太糊。
 * 真正的病根在上面的 newSession 规则：后两个选择器漏了容器前缀，全局的 [class*="_key"]
 * 把「新会话」按钮的深色墨字刷到了菜单快捷键上。那里已经补上容器前缀，
 * 这一段再把颜色抬到 0.56：读得清，但仍明显暗于菜单项标题（label-primary #f2f2ee），
 * 不会比「设置」本身更抢眼。选择器限定在 _shortcut_ 容器内，不碰其它 kbd 区域。 */
[class*="_shortcut_"] [class*="_keys_"],
[class*="_shortcut_"] [class*="_shortcutKeys_"],
[class*="_shortcut_"] [class*="_key"]{color:rgba(242,242,238,.56)!important}
html[data-fz3-theme="light"] [class*="_shortcut_"] [class*="_keys_"],
html[data-fz3-theme="light"] [class*="_shortcut_"] [class*="_shortcutKeys_"],
html[data-fz3-theme="light"] [class*="_shortcut_"] [class*="_key"]{color:rgba(16,17,16,.52)!important}

/* ---------- L. 字体层：标题 / 字标用内置 Anton（v2.0.4） ----------
 * 用户口径：对话部分与非标题文本都不用这个字体，只有标题保留；标题英文字体不再加粗。
 * 标题清单：侧栏字标（.fz3-brandname b / .fz3-sb-text b）、欢迎页大标题
 * （.fz3-copy-title / .WOwLGG_headline）、分区标题（.GAkraW_sectionLabel）、
 * 设置页标题（.fz3-set-name / .AnXs9G_navTitle）、电费坞标题（.fz3-bill-head）。
 * 正文 / 对话 / 代码 / 标签 / 数值 / 按钮 / 会话名一律不套显示字体。
 * 字体已随包（assets/anton/），没装 Impact 的机器也一样；万一 woff2 加载失败则按
 * --fz3-display 后面的 Impact / 窄体 / 系统字体回落，不会缺字或豆腐块。
 * font-synthesis-weight:none：Anton / Impact 都只有 400 一档，标题声明的是 700，
 * 不开这个开关浏览器会合成加粗（笔画糊成一坨）；关掉后英文字形保持 400 的天然粗细，
 * 汉字回落到的 CJK 字体（雅黑 / 苹方 / Noto）自带真 Bold，仍然是粗的。 */
.fz3-copy-title,.fz3-set-name,.fz3-bill-head{font-family:var(--fz3-display)!important}
.fz3-copy-title,.fz3-set-name,.fz3-bill-head,.fz3-sb-text b,.fz3-brandname b,.GAkraW_sectionLabel,.WOwLGG_headline,.AnXs9G_navTitle{font-synthesis-weight:none}

`

    /* ------------------------------------------------------------------ *
     * 图标
     * ------------------------------------------------------------------ */
    /* FZ3_RUNTIME_BEGIN */
    /* —— Fairy 大眼待机运行时（移植自 Fairy-DSH）——
     * 来源：mascot-runtime.js / mascot-motion-clock.js / mascot-event-scheduler.js
     * （Apache-2.0，Copyright 2026 Chengzhibense，见 NOTICE-fairy-dsh.md）。
     * 负责：眼球时间线（叶片旋转 / 眼球呼吸 / 目光微动）、随机花屏、眼闪、表情切换两段故障、页面隐藏暂停；
     * 不做 reduced-motion 降级。
     *
     * 性能约定（v1.6.0）：眼球只有一份静态 SVG，运行时用 15fps 的 setInterval 改写 SVG 内部
     * transform 属性（#corners / 眼球五层 / g#fz3-drift），触发的是小面积向量重绘——每帧都按
     * 设备像素重新抗锯齿，边缘不会像 v1.5.0 的 HTML 合成层那样在缩放时被重采样糊掉；
     * 光晕呼吸 / 脉冲环 / 氛围光仍在 CSS 里用 steps() 量化到 ~15fps，合成器只搬图层。
     * 没有 rAF 主循环：页面隐藏时停表，恢复时按累计时间续相位；其余都是离散事件（setTimeout）。 */
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
      /* v1.6.0 眼球时间线：15fps 一个 tick；周期都是 1/15s 的整数倍（1.6s=24 帧、6.4s=96 帧）。 */
      const FZ3_TICK_MS = 1000 / 15
      const FZ3_ORBIT_MS = 6400
      const FZ3_ORBIT_STEPS = 96
      /* v1.7.6 分层呼吸：参考实现 1.44s 一个来回、四层各自幅度与相位（每层都是独立可缩放的组）。
         1.44s 落在 15fps 网格上会取到 21.6 拍，这里取整成 1.4s（正好 21 拍）。
         幅度沿用参考实现：巩膜几乎不动，越靠里的圈缩得越多；再让内层相位提前 45/90/180ms，
         合起来是「由内向外荡开」的涟漪，而不是整只眼同缩同放。 */
      const FZ3_BREATH_MS = 1400
      const FZ3_BREATH_LAYERS = [
        ['#sclera', 0.985, 0.91, 0],
        ['#iris-outer', 1, 0.9, 45],
        ['#iris-blue', 1, 0.87, 90],
        ['#pupil', 1, 0.85, 180],
        /* catchlight 跟着虹膜蓝层走，否则亮点会从虹膜边缘滑出去。 */
        ['#highlight', 1, 0.87, 90],
      ]
      const FZ3_GAZE_EASE_MS = 920
      const SVG_NS = 'http://www.w3.org/2000/svg'
      let root = null
      let bands = []
      let glitchToken = 0
      let flickerToken = 0
      let transitionToken = 0
      let lastMode = Math.random() < 0.5 ? 'threads' : 'blocks'
      let appliedState = null
      let state = 'normal'
      let suspended = false
      let bound = false
      /* 眼球内部的三个锚点 + 15fps 时钟 */
      let svg = null
      let corners = null
      /* v1.7.6：眼球五层各自一个节点、各自幅度与相位（不再是单一 g#fz3-lens 统一缩放）。 */
      let layers = []
      let lidShape = null
      let lidEdge = null
      /* 自愈计时：缓存的裁切 path 掉出文档时，最多每 400ms 重新 cache 一次（一次 cache 只有十几次 querySelector）。 */
      let healAt = 0
      let anatomies = []
      let lidClipId = ''
      /* 行内值读回会被序列化成 url("#id")，比较时用同一形态，避免每拍误判成「丢了」而重复写。 */
      let lidClipCss = ''
      let lidKey = ''
      let drift = null
      let ticker = 0
      let clockBase = 0
      let clockElapsed = 0
      let lastDeg = -1
      let gaze = null
      let gazeAt = { x: 0, y: 0, r: 0 }

      const elementUnit = () => ((root && root.clientWidth) || 200) / 162

      /* 半闭眼裁切指向主眼那条独占 clipPath（改名见 cache 里那段注释）；组件内每一份
         .fz3-anatomy 一起改，5 份花屏切片的形状才跟眼睛本体同步。 */
      const applyLidClip = () => {
        const want = state === 'thinking' && lidClipId ? lidClipId : ''
        for (let i = 0; i < anatomies.length; i += 1) anatomies[i].style.clipPath = want
      }

      const cache = (el) => {
        root = el
        /* 5 条故障切片只在 blocks 花屏时可见，顺带缓存，避免每次花屏再查询。 */
        bands = Array.from(root.querySelectorAll('.fz3-gband'))
        /* v1.6.0：眼球是单份 SVG，运行时直接改内部 transform 属性。
           为了让整只眼能被「目光」整体平移/旋转，把 #fairy 包进 g#fz3-drift。
           v1.7.6：不再把 #eye-anatomy 的内容包进单一 g#fz3-lens 统一缩放——SVG 里巩膜 / 虹膜外圈 /
           虹膜蓝 / 瞳仁 / catchlight 本来各自就是 <g transform="translate(80 80) scale(1) translate(-80 -80)">，
           按层写各自的 scale 才有错相；一个缩放值四层永远同相，看着就是整只眼在胀缩。
           裁切仍挂在 #eye-anatomy 上，缩放发生在它内部，眼睑边界保持不动。 */
        const host = root.querySelector('.fz3-eye-svg')
        svg = host ? host.querySelector('svg') : null
        corners = null
        layers = []
        lidShape = null
        lidEdge = null
        anatomies = []
        lidClipId = ''
        lidClipCss = ''
        lidKey = ''
        drift = null
        if (svg) {
          corners = svg.querySelector('#corners')
          const fairy = svg.querySelector('#fairy')
          if (fairy && !svg.querySelector('#fz3-drift')) {
            drift = document.createElementNS(SVG_NS, 'g')
            drift.setAttribute('id', 'fz3-drift')
            svg.insertBefore(drift, fairy)
            drift.appendChild(fairy)
          }
          for (let i = 0; i < FZ3_BREATH_LAYERS.length; i += 1) {
            const spec = FZ3_BREATH_LAYERS[i]
            const node = svg.querySelector(spec[0])
            if (node) layers.push({ node, from: spec[1], to: spec[2], lead: spec[3], last: -1 })
          }
          /* 思考态半闭眼的裁切形状：只改它自己的 transform，不逐帧重写 d。
             ⚠ 页面里 #fz3-lid-clip 有 8 份（主眼 1 + 花屏克隆 5 + 侧栏字标 2），url(#id) 按文档
             顺序解析到最靠前那份——直接给主眼这条 path 写 transform 是无效的（实测两副本里只有
             第一个生效）。这里把主眼这份改名成独占 id，再用行内 clip-path 指过去。 */
          const clipNode = svg.querySelector('#fz3-lid-clip') || svg.querySelector('#fz3-lid-clip-main')
          if (clipNode) {
            clipNode.id = 'fz3-lid-clip-main'
            lidClipId = 'url(#fz3-lid-clip-main)'
            lidClipCss = 'url("#fz3-lid-clip-main")'
          }
          lidShape = svg.querySelector('#fz3-lid-clip-main path')
          /* 切口那条同色描边：主眼这份改名成独占 id（CSS 只显示 #fz3-lid-edge-main），
             花屏克隆里的副本保持 #fz3-lid-edge，永远 display:none。 */
          const edgeNode = svg.querySelector('#fz3-lid-edge')
          if (edgeNode) {
            edgeNode.id = 'fz3-lid-edge-main'
            lidEdge = edgeNode
          }
          /* 花屏克隆（5 份 .fz3-gband）各自带一份同样的 SVG，它们的 .fz3-anatomy 只能走 CSS 的
             url(#fz3-lid-clip)，而那会解析到别处的静态副本——工作态横向切片会切出「没下压过」
             的旧眼睑。这里让组件内每一份 anatomy 都指向主眼那条独占 clipPath，切片形状才和
             眼睛本体一致。 */
          anatomies = Array.from(root.querySelectorAll('.fz3-anatomy'))
          applyLidClip()
          writeDrift()
        }
      }

      /* —— 15fps 眼球时钟（v1.6.0）——
         叶片 6.4s 一圈 / 96 步，呼吸 1.6s 一个来回 / 24 步，目光缓动 0.92s 也在这条时间线上采样；
         全部写 SVG transform 属性（向量重绘），合成器按 15fps 出帧。 */
      const clockNow = () => clockElapsed + ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - clockBase)

      /* cubic-bezier(.34,0,.2,1) 的 x→y 近似：牛顿迭代 4 次，15fps 采样足够。 */
      const gazeEase = (p) => {
        if (p <= 0) return 0
        if (p >= 1) return 1
        let t = p
        for (let i = 0; i < 4; i += 1) {
          const mt = 1 - t
          const x = 3 * mt * mt * t * 0.34 + 3 * mt * t * t * 0.2 + t * t * t
          const dx = 3 * mt * mt * 0.34 + 6 * mt * t * (-0.14) + 3 * t * t * 0.8
          if (Math.abs(dx) < 1e-6) break
          t = Math.min(1, Math.max(0, t - (x - p) / dx))
        }
        const mt = 1 - t
        return 3 * mt * t * t + t * t * t
      }

      /* cubic-bezier(.72,0,.28,1)：参考实现的呼吸曲线（两端顿、中间快），牛顿迭代 4 次足够。 */
      const breathEase = (p) => {
        if (p <= 0) return 0
        if (p >= 1) return 1
        let t = p
        for (let i = 0; i < 4; i += 1) {
          const mt = 1 - t
          const x = 3 * mt * mt * t * 0.72 + 3 * mt * t * t * 0.28 + t * t * t
          const dx = 3 * mt * mt * 0.72 + 6 * mt * t * -0.44 + 3 * t * t * 0.72
          if (Math.abs(dx) < 1e-6) break
          t = Math.min(1, Math.max(0, t - (x - p) / dx))
        }
        const mt = 1 - t
        return 3 * mt * t * t + t * t * t
      }

      /* 相位 → 0..1 的往返进度：前半程缩进去、后半程弹回来，再套上面的缓动。 */
      const breathPhase = (phase) => {
        const q = phase - Math.floor(phase)
        return breathEase(q <= 0.5 ? q * 2 : 2 - q * 2)
      }

      const writeDrift = () => {
        if (!drift) return
        drift.setAttribute('transform',
          'translate(' + gazeAt.x.toFixed(3) + ' ' + gazeAt.y.toFixed(3) + ') rotate(' + gazeAt.r.toFixed(3) + ' 80 80)')
      }

      const stepGaze = (now) => {
        if (!gaze) return
        const span = gaze.dur > 0 ? (now - gaze.start) / gaze.dur : 1
        const k = gazeEase(span)
        gazeAt = {
          x: gaze.fx + (gaze.tx - gaze.fx) * k,
          y: gaze.fy + (gaze.ty - gaze.fy) * k,
          r: gaze.fr + (gaze.tr - gaze.fr) * k,
        }
        writeDrift()
        if (span >= 1) {
          gazeAt = { x: gaze.tx, y: gaze.ty, r: gaze.tr }
          gaze = null
        }
      }

      /* 思考态眼皮：和呼吸同一个相位。参考实现用 CSS 把裁切路径里的上眼皮下压 14.5–15.5 个单位、
         竖向压 .55–1（transform-origin 80px 60px），半闭眼因此一直在「眨呀眨」。
         这里照搬这条曲线，但按 15fps 采样、只改那条 path 的 transform，不逐帧重写 d。 */
      const stepLid = (phase) => {
        if (!lidShape) return
        if (state !== 'thinking') {
          if (lidKey) {
            lidShape.removeAttribute('transform')
            if (lidEdge) lidEdge.removeAttribute('transform')
            lidKey = ''
          }
          return
        }
        const progress = breathPhase(phase)
        const ty = Math.round((14.5 + progress) * 1000) / 1000
        const sy = Math.round((0.55 + 0.45 * progress) * 1000) / 1000
        const key = ty + ':' + sy
        if (key === lidKey) return
        lidKey = key
        const xform = 'translate(0 ' + ty + ') translate(80 60) scale(1 ' + sy + ') translate(-80 -60)'
        lidShape.setAttribute('transform', xform)
        /* 切口描边跟裁切同一条曲线、同一个变换，才始终压在那条过渡带上。 */
        if (lidEdge) lidEdge.setAttribute('transform', xform)
      }

      const tick = () => {
        if (!root) return
        /* v1.7.4（性能）：窗口在后台时浏览器本来就会把 interval 节流，但桌面端
           （Electron 常驻后台）仍有实测唤醒；这里显式跳过，省掉一次不必要的 SVG 属性写。 */
        if (typeof document !== 'undefined' && document.hidden) return
        /* 自愈：React 重渲染（或热重载换模块）会把 `dangerouslySetInnerHTML` 里那份 SVG 换成新节点，
           缓存的裁切 path 随之脱离文档——独占 id 改名与行内 clip-path 一起丢，眼睑就停在睁眼形状、
           只剩一条描边。这里发现节点掉了就重新 cache 一遍（只在真的掉的时候跑）。 */
        if (!lidShape || !lidShape.isConnected) {
          const t0 = clockNow()
          if (t0 - healAt > 400) {
            healAt = t0
            cache(root)
            if (!root) return
          }
        }
        /* 兜底（v1.7.6）：React 重渲染或热重载换模块时，行内 clip-path 会连同独占 id 一起丢，
           眼睑就停在睁眼形状、只剩一条描边。每拍核对一次（7 次字符串比较，成本可忽略），
           不对就立刻补写，不必等上面那次重缓存（400ms 节流）。 */
        if (state === 'thinking' && lidClipCss) {
          for (let i = 0; i < anatomies.length; i += 1) {
            if (anatomies[i].style.clipPath !== lidClipCss) {
              applyLidClip()
              break
            }
          }
        }
        const now = clockNow()
        const phase = (now % FZ3_BREATH_MS) / FZ3_BREATH_MS
        if (corners) {
          const step = Math.floor((now % FZ3_ORBIT_MS) / (FZ3_ORBIT_MS / FZ3_ORBIT_STEPS))
          const deg = Math.round(step * (360 / FZ3_ORBIT_STEPS) * 1000) / 1000
          if (deg !== lastDeg) {
            corners.setAttribute('transform', 'rotate(' + deg + ' 80 80)')
            lastDeg = deg
          }
        }
        for (let i = 0; i < layers.length; i += 1) {
          const layer = layers[i]
          const progress = breathPhase(phase + layer.lead / FZ3_BREATH_MS)
          const scale = Math.round((layer.from + (layer.to - layer.from) * progress) * 10000) / 10000
          if (scale === layer.last) continue
          layer.node.setAttribute('transform', 'translate(80 80) scale(' + scale + ') translate(-80 -80)')
          layer.last = scale
        }
        stepLid(phase)
        stepGaze(now)
      }

      const startTicker = () => {
        if (ticker || typeof window === 'undefined') return
        clockBase = typeof performance !== 'undefined' ? performance.now() : Date.now()
        ticker = window.setInterval(tick, FZ3_TICK_MS)
        tick()
      }

      const stopTicker = () => {
        if (!ticker) return
        window.clearInterval(ticker)
        ticker = 0
        clockElapsed += (typeof performance !== 'undefined' ? performance.now() : Date.now()) - clockBase
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
        if (mode === 'blocks') {
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

      /* —— 目光微动（v1.6.0）——
         每 4.6–8.8s 让整只眼朝随机方向偏移 1–3 个 SVG 单位（dock 128px 下约 1–3px），
         0.92s 缓动过去，停 1.3–2.4s 再回中。位移由 15fps ticker 写进 g#fz3-drift 的 transform，
         不再用 CSS 过渡 / CSS 变量（那样插值的是合成层位图，边缘同样会被重采样）。
         思考 / 页面隐藏 / 未挂载时不跑。 */
      const stopGaze = () => {
        fz3Scheduler.cancel('glance')
        fz3Scheduler.cancel('glance-back')
        fz3Scheduler.cancel('glance-next')
        gaze = null
        gazeAt = { x: 0, y: 0, r: 0 }
        writeDrift()
      }

      const scheduleGaze = () => {
        if (!root || suspended || state === 'thinking' || fz3Scheduler.has('glance')) return
        fz3Scheduler.schedule('glance', () => {
          if (!root || suspended || state === 'thinking') return
          const angle = fz3Random(0, Math.PI * 2)
          const radius = fz3Random(0.9, 2.6)
          gaze = {
            fx: gazeAt.x, fy: gazeAt.y, fr: gazeAt.r,
            tx: Math.cos(angle) * radius,
            ty: Math.sin(angle) * radius * 0.75,
            tr: fz3Random(-0.45, 0.45),
            start: clockNow(),
            dur: FZ3_GAZE_EASE_MS,
          }
          fz3Scheduler.schedule('glance-back', () => {
            if (!root || suspended) return
            gaze = {
              fx: gazeAt.x, fy: gazeAt.y, fr: gazeAt.r,
              tx: 0, ty: 0, tr: 0,
              start: clockNow(),
              dur: FZ3_GAZE_EASE_MS,
            }
            fz3Scheduler.schedule('glance-next', () => {
              if (!root || suspended) return
              scheduleGaze()
            }, FZ3_GAZE_EASE_MS + 60)
          }, fz3Random(1300, 2400))
        }, fz3Random(4600, 8800))
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
        /* 半闭眼仍由 clipPath 控制；v1.7.6 起那条裁切 path 的 transform 随呼吸走（见 stepLid）。 */
        if (normalized === 'thinking') {
          root.setAttribute('data-lid', 'thinking')
          applyLidClip()
          stopGaze()
        } else {
          root.removeAttribute('data-lid')
          applyLidClip()
          if (lidShape && lidKey) {
            lidShape.removeAttribute('transform')
            if (lidEdge) lidEdge.removeAttribute('transform')
            lidKey = ''
          }
          scheduleGaze()
        }
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
        stopTicker()
        stopGaze()
        stopGlitch()
        stopFlicker()
        root.setAttribute('data-fz3-suspended', '')
      }
      const resume = () => {
        if (!suspended || !root) return
        suspended = false
        root.removeAttribute('data-fz3-suspended')
        startTicker()
        scheduleGlitch()
        scheduleFlicker()
        scheduleGaze()
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
        startTicker()
        scheduleGlitch()
        scheduleFlicker()
        scheduleGaze()
      }

      const unmount = () => {
        stopTicker()
        stopGaze()
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
        svg = null
        corners = null
        layers = []
        lidShape = null
        lidEdge = null
        anatomies = []
        lidClipId = ''
        lidKey = ''
        drift = null
        appliedState = null
        suspended = false
      }

      return { mount, unmount, setState, suspend, resume }
    })()
    /* FZ3_RUNTIME_END */

    /* 待机小动作全部移入上面的单相位运行时；这里只负责把舞台 DOM 交给它。 */
    const bootHooks = new Set()
    /* shell.overlay 重挂载（路由切换/设置页刷新）不应该再播一遍开机 + 问候；
       插件被禁用后再启用会重新求值本模块，所以标记必须挂在 window 上（整页刷新即清除）。 */
    const BOOT_FLAG = '__fz3BootPlayed'
    let bootPlayed = (() => { try { return Boolean(window[BOOT_FLAG]) } catch (e) { return false } })()
    const markBootPlayed = (v) => {
      bootPlayed = v
      try { window[BOOT_FLAG] = v } catch (e) {}
    }

    /* memo：FairySkin 会因为阶段/情绪/语音状态重渲染，眼睛本身（4 份分层 SVG + 5 份花屏克隆 + 脉冲环）不需要跟着重渲染。 */
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
        h('div', {
          className: 'fz3-eye-svg',
          'aria-hidden': 'true',
          dangerouslySetInnerHTML: { __html: FAIRY_EYE_SVG },
        }),
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
      /* 眼徽显隐：写 localStorage，再广播自定义事件让皮肤图层立刻响应。
         能不能拖不再有开关——眼标一律「按住右键拖动，左键不作用」。 */
      const [eyeHidden, setEyeHidden] = useState(() => readBool(EYE_KEY, false))
      const toggleEye = () => {
        const next = !eyeHidden
        setEyeHidden(next)
        writeStored(EYE_KEY, next)
        try { window.dispatchEvent(new Event('fz3:eye-pref')) } catch (e) {}
      }
      /* 试听问候：本时段 5 条随机语音里抽一条，把台词显示出来，方便确认新语音都在 */
      const [previewLine, setPreviewLine] = useState('')
      const [settingsTab, setSettingsTab] = useState('voice')

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
                  ? '未运行 · 已找到引擎目录'
                  : '未运行：没找到语音引擎'
      const setVoice = (enabled) => {
        patchVoice({ enabled: enabled })
        writeStored(VOICE_KEY, enabled)
        if (!enabled) stopSpeech()
      }
      /* 每次点击都重新抽一条（避开上一条），不再复用本次会话开机时抽中的那条 */
      const playGreet = () => {
        stopSpeech()
        const pick = nextGreeting()
        setPreviewLine(pick.text)
        const audio = new Audio(greetingUrl(pick))
        preview = audio
        audio.onended = () => {
          if (preview === audio) preview = null
        }
        audio.play().catch(() => {})
      }
      const replayBoot = () => { greetPick = null; bootHooks.forEach((fn) => { try { fn() } catch (e) {} }) }
      const testVoice = () => { speakText('测试中。主人，我的声音听起来还满意吗？不满意也请忍着，本系统就这一副嗓子。', { force: true }) }
      /* 状态、目录、启动/停止合并成一张卡：把「当前生效」的来路单独算一次 */
      const homeSourceLabel =
        voiceInfo && voiceInfo.ok
          ? voiceInfo.source === 'settings'
            ? '设置项'
            : voiceInfo.source === 'env'
              ? '环境变量'
              : voiceInfo.source === 'portable'
                ? '便携包自带'
                : voiceInfo.source === 'legacy'
                  ? '旧变量 FAIRY_TTS_DIR'
                  : ''
          : ''
      const homeHint = voiceInfo
        ? voiceInfo.ok
          ? voiceHome && voiceInfo.home && voiceHome !== voiceInfo.home
            ? '未保存 · 当前生效：' + voiceInfo.home + (homeSourceLabel ? '（' + homeSourceLabel + '）' : '')
            : '来源：' + (homeSourceLabel || '自动检测')
          : voiceInfo.reason || ''
        : ''
      const engineDot = 'fz3-set-dot' + (ready ? ' is-on' : enginePhase === 'loading' ? ' is-wait' : ' is-off')
      const tabBtn = (id, label) => h(
        'button',
        {
          type: 'button',
          className: 'fz3-set-tab' + (settingsTab === id ? ' is-active' : ''),
          role: 'tab',
          'aria-selected': settingsTab === id,
          onClick: () => setSettingsTab(id),
        },
        label,
      )
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
          { className: 'fz3-set-tabs', role: 'tablist', 'aria-label': 'Fairy 设置分类' },
          tabBtn('voice', '语音'),
          tabBtn('appearance', '外观'),
        ),
        settingsTab === 'voice'
          ? h(
            'div',
            { className: 'fz3-set-card' },
            h(
              'div',
              { className: 'fz3-set-card-head' },
              h(
                'div',
                null,
                h(
                  'div',
                  { className: 'fz3-set-card-title' },
                  h('span', { className: engineDot }),
                  '语音引擎',
                ),
                h('div', { className: 'fz3-set-card-status' }, engineText),
              ),
              h(
                'div',
                { className: 'fz3-set-engine-controls' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'fz3-set-btn',
                    onClick: () => controlEngine(ready ? 'stop' : 'start'),
                    disabled: ready ? engineBusy === 'stop' : engineBusy === 'start',
                  },
                  ready
                    ? engineBusy === 'stop' ? '停止中…' : '停止引擎'
                    : engineBusy === 'start' ? '启动中…' : '启动引擎',
                ),
                h('button', { type: 'button', className: 'fz3-set-linkbtn', onClick: ping }, '刷新'),
              ),
            ),
            h(
              'div',
              { className: 'fz3-set-field' },
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
                h('button', { type: 'button', className: 'fz3-set-linkbtn', onClick: loadVoiceHome }, '检测'),
                h('button', { type: 'button', className: 'fz3-set-linkbtn', onClick: () => saveVoiceHome('') }, '清除'),
              ),
              homeHint ? h('div', { className: 'fz3-set-desc is-hint' }, homeHint) : null,
            ),
            h(
              'div',
              { className: 'fz3-set-pair' },
              h(
                'div',
                { className: 'fz3-set-pane' },
                h(
                  'div',
                  { className: 'fz3-set-pane-head' },
                  h('div', { className: 'fz3-set-label' }, '自动朗读回复'),
                  h('button', {
                    type: 'button',
                    className: 'fz3-set-switch',
                    'data-on': voiceState.enabled ? '1' : '0',
                    'aria-pressed': !!voiceState.enabled,
                    onClick: () => setVoice(!voiceState.enabled),
                  }),
                ),
                h('div', { className: 'fz3-set-desc' }, '助手回答完成后用 Fairy 的声音念出来'),
              ),
              h(
                'div',
                { className: 'fz3-set-pane' },
                h(
                  'div',
                  { className: 'fz3-set-pane-head' },
                  h('div', { className: 'fz3-set-label' }, '试听'),
                  h(
                    'div',
                    { className: 'fz3-set-actions' },
                    h('button', { type: 'button', className: 'fz3-set-btn', onClick: playGreet, title: '随机试听本时段的 5 条问候之一' }, '试听问候'),
                    busy
                      ? h('button', { type: 'button', className: 'fz3-set-btn is-ghost', onClick: stopSpeech }, '停止')
                      : h('button', { type: 'button', className: 'fz3-set-btn', onClick: testVoice }, '测试语音'),
                  ),
                ),
                h('div', { className: 'fz3-set-desc' }, '问候音与本地 TTS 各测一次'),
              ),
            ),
            previewLine ? h('div', { className: 'fz3-set-desc is-hint' }, '刚刚试听：' + previewLine) : null,
          )
          : h(
            'div',
            { className: 'fz3-set-card' },
            h(
              'div',
              { className: 'fz3-set-card-head' },
              h('div', { className: 'fz3-set-card-title' }, '眼徽与开场动画'),
            ),
            h(
              'div',
              { className: 'fz3-set-pair' },
              h(
                'div',
                { className: 'fz3-set-pane' },
                h(
                  'div',
                  { className: 'fz3-set-pane-head' },
                  h('div', { className: 'fz3-set-label' }, '显示眼徽'),
                  h('button', {
                    type: 'button',
                    className: 'fz3-set-switch',
                    'data-on': eyeHidden ? '0' : '1',
                    'aria-pressed': !eyeHidden,
                    onClick: toggleEye,
                  }),
                ),
                h('div', { className: 'fz3-set-desc' }, '只在工作区显示，切到插件等页面自动收起'),
              ),
              h(
                'div',
                { className: 'fz3-set-pane' },
                h(
                  'div',
                  { className: 'fz3-set-pane-head' },
                  h('div', { className: 'fz3-set-label' }, '开场动画'),
                  h('button', { type: 'button', className: 'fz3-set-btn is-ghost', onClick: replayBoot }, '重播'),
                ),
                h('div', { className: 'fz3-set-desc' }, '重新播放 H.D.D 开机动画'),
              ),
            ),
          ),
        h('div', { className: 'fz3-set-note' }, 'Fairy 皮肤 · 待机随机眨眼与花屏、思考态眼睑呼吸；电费余额 / 今日电费 / 倍率倒计时常驻左下角实时刷新。眼标只做状态指示：按住右键可以拖到任意位置，左键不作用。'),
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
      /* v1.7.3（性能）：hero 插槽挂载/卸载时发事件，标题改写只在这两个时机去找节点，
         不再用全 body MutationObserver 逐节点扫子树。 */
      useEffect(() => {
        try { window.dispatchEvent(new Event('fz3:hero-mount')) } catch (e) {}
        return () => {
          try { window.dispatchEvent(new Event('fz3:hero-unmount')) } catch (e) {}
        }
      }, [])
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
    /* 背景氛围层：常驻动画全部交给 CSS（steps 量化），组件渲染一次后不再产生任何 JS 唤醒。
       原先 500ms 的环境时钟每次跳都写一次样式，实测 JS 样式写入成本远高于合成器帧，
       现在 14s 呼吸由 .fz3-atmos-glow 的 steps 时间线驱动。 */
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
      return currentGreeting().text
    }

    /* ------------------------------------------------------------------ *
     * 常驻电费读数（v1.7.5）：左下角实时显示
     * ------------------------------------------------------------------ */
    function BillDock() {
      const [data, setData] = useState(() => ({ usage: usageCache.usage, balance: usageCache.balance }))
      const [nowTick, setNowTick] = useState(() => Date.now())
      const alive = useRef(true)
      const flipRef = useRef(0)
      const dockRef = useRef(null)

      const refresh = useCallback(async (force) => {
        const [usage, balance] = await Promise.all([loadUsage(!!force), loadBalance(!!force)])
        if (!alive.current) return
        setData((prev) => (usage || balance ? { usage: usage || prev.usage, balance: balance || prev.balance } : prev))
      }, [])

      useEffect(() => {
        alive.current = true
        refresh(false)
        const poll = setInterval(() => refresh(false), 20_000)
        const tick = setInterval(() => setNowTick(Date.now()), 1_000)
        return () => {
          alive.current = false
          clearInterval(poll)
          clearInterval(tick)
        }
      }, [refresh])

      /* v2.0.3：电费坞贴住侧栏页脚上沿，并把自身高度让给工作区列表区。
         只写两个 CSS 变量，不动宿主 DOM：
           --fz3-bill-bottom   电费坞底边 = 页脚 top 反算（窗口 / 页脚高度变化自动跟随）
           --fz3-bill-reserve  列表区底部预留 = 电费坞高 + 14px（列表滚到底也压不到坞）
         侧栏收起 / 页脚不可见时 apply() 返回 false，保持 CSS 兜底值，不硬挪。 */
      useEffect(() => {
        const root = document.documentElement
        let tries = 0
        let timer = null
        let resizeTimer = null
        let observer = null

        const apply = () => {
          const dock = dockRef.current
          const foot = document.querySelector('[class*="_footArea"]')
          if (!dock || !foot) return false
          const fr = foot.getBoundingClientRect()
          /* 宽度 <200px = 侧栏被收成窄条，页脚不是正常形态，别跟着它算 */
          if (fr.height <= 0 || fr.width < 200) return false
          root.style.setProperty('--fz3-bill-bottom', Math.max(8, Math.round(window.innerHeight - fr.top + 6)) + 'px')
          const h = Math.round(dock.offsetHeight)
          if (h > 0) root.style.setProperty('--fz3-bill-reserve', h + 14 + 'px')
          return true
        }
        const onResize = () => {
          if (resizeTimer) return
          resizeTimer = setTimeout(() => {
            resizeTimer = null
            try { apply() } catch (e) {}
          }, 120)
        }
        const attach = () => {
          const foot = document.querySelector('[class*="_footArea"]')
          if (foot && typeof ResizeObserver === 'function') {
            observer = new ResizeObserver(() => {
              try { apply() } catch (e) {}
            })
            try {
              observer.observe(foot)
              if (dockRef.current) observer.observe(dockRef.current)
            } catch (e) {}
          }
          window.addEventListener('resize', onResize)
        }
        const tick = () => {
          let ok = false
          try { ok = apply() } catch (e) {}
          if (ok || tries >= 20) return attach()
          tries += 1
          timer = setTimeout(tick, 300)
          return undefined
        }
        tick()
        return () => {
          if (timer) clearTimeout(timer)
          if (resizeTimer) clearTimeout(resizeTimer)
          if (observer) observer.disconnect()
          window.removeEventListener('resize', onResize)
          root.style.removeProperty('--fz3-bill-bottom')
          root.style.removeProperty('--fz3-bill-reserve')
        }
      }, [])

      const usage = data.usage
      const balance = data.balance
      const peak = usage && usage.peak
      const today = usage ? usage.today : null
      const nextAt = peak && peak.nextAt ? peak.nextAt : 0
      const left = nextAt ? nextAt - nowTick : 0
      const tone = peak && peak.offPeak ? 'valley' : 'peak'

      /* 倒计时归零 = 刚换价：宿主的 bucket 要下一次请求才翻面，这里补一次强制刷新 */
      useEffect(() => {
        if (!nextAt || left > 0 || flipRef.current === nextAt) return undefined
        flipRef.current = nextAt
        const timer = setTimeout(() => refresh(true), 2_500)
        return () => clearTimeout(timer)
      }, [left, nextAt, refresh])

      /* 第三行用「当前是哪一档」当标签，值放倒计时：五倍电费 56:49:06 = 现在按五倍计，还有这么久换档 */
      const rateLabel = peak ? (peak.offPeak ? '五倍电费' : '十倍电费') : '电费倍率'
      const rateValue = peak ? (nextAt ? (left > 0 ? clockText(left) : '切换中') : peak.offPeak ? '五倍' : '十倍') : '—'

      return h(
        'div',
        { ref: dockRef, className: 'fz3-bill', 'data-tone': tone, 'data-loading': usage || balance ? '0' : '1' },
        h('div', { className: 'fz3-bill-head' }, 'Fairyの电费'),
        h(
          'div',
          { className: 'fz3-bill-row' },
          h('span', { className: 'fz3-bill-k' }, '电费余额'),
          h('span', { className: 'fz3-bill-v' }, balance ? (balance.ok ? yuan(balance.amount) : '—') : '…'),
        ),
        h(
          'div',
          { className: 'fz3-bill-row' },
          h('span', { className: 'fz3-bill-k' }, '今日电费'),
          h('span', { className: 'fz3-bill-v' }, today ? yuan(today.cost) : '…'),
        ),
        h(
          'div',
          { className: 'fz3-bill-row' },
          h('span', { className: 'fz3-bill-k' }, rateLabel),
          h(
            'span',
            { className: 'fz3-bill-vwrap' },
            peak ? h('span', { className: 'fz3-bill-tag', 'data-tone': tone }, peak.offPeak ? '谷' : '峰') : null,
            nextAt && left > 0
              ? h('span', { className: 'fz3-bill-clock', 'data-tone': tone }, rateValue)
              : h('span', { className: 'fz3-bill-v' }, rateValue),
          ),
        ),
        h('div', { className: 'fz3-bill-note' }, '工作日 09–12、14–18 十倍电费，其余时段五倍'),
      )
    }

    /* ------------------------------------------------------------------ *
     * v2.0.0 插件更新确认浮层
     * ------------------------------------------------------------------ */
    function PluginUpdatePanel(props) {
      const info = props.info || {}
      const run = props.run
      const phase = run && run.phase ? run.phase : 'idle'
      const running = phase === 'running'
      const done = phase === 'done'
      const failed = phase === 'error'
      const close = props.onClose
      const stepText = {
        checking: '检查版本…',
        removing: '移除旧版本…',
        installing: '下载并安装…',
        restoring: '回滚到旧版本…',
      }
      const from = info.installed || '当前版本'
      const to = info.latest || ''
      const cancelled = failed && run.cancelled
      const title = done ? (run.applied ? '更新完成' : '安装完成') : failed ? (cancelled ? '更新已取消' : '更新失败') : '发现新版本'
      let desc
      if (done) {
        desc = run.applied
          ? '已安装 ' + (run.to || to) + '。刷新页面就能用新版，未发送的输入不会丢。'
          : '已安装 ' + (run.to || to) + '，但当前进程还在用旧代码 —— 重启 DSH 后生效。'
      } else if (failed) {
        desc = run.message || '更新没有完成，请稍后重试。'
      } else if (running) {
        desc = (stepText[run.step] || '准备中…') + '安装期间 Fairy 会短暂断开，完成后按提示刷新即可。'
      } else {
        desc = '从 npm 下载并替换当前插件。安装过程会短暂断开 Fairy，装完刷新页面即可。'
      }
      /* v2.0.1：更新的版本里若有和当前 DSH 不兼容的，说明为什么跳到稍旧的版本 */
      if (!done && !failed && info.skipped && info.skipped.length) {
        desc += '（更新的 ' + info.skipped.join('、') + ' 与当前 DSH 不兼容，已跳过）'
      }
      return h(
        'div',
        { className: 'fz3-upd', role: 'dialog', 'aria-label': '插件更新' },
        h(
          'div',
          { className: 'fz3-upd-head' },
          h('span', { className: 'fz3-upd-title' }, title),
          h('button', { type: 'button', className: 'fz3-upd-close', 'aria-label': '关闭', onClick: close }, '×'),
        ),
        done || failed
          ? null
          : h(
              'div',
              { className: 'fz3-upd-vers' },
              h('b', null, from),
              h('span', { className: 'fz3-upd-arrow' }, '→'),
              h('b', { className: 'fz3-upd-new' }, to),
            ),
        h('div', { className: 'fz3-upd-desc' + (failed ? ' is-err' : '') }, desc),
        running ? h('div', { className: 'fz3-upd-bar' }, h('i', null)) : null,
        info.debug
          ? h('div', { className: 'fz3-upd-note' }, '调试预览：假版本号，不会真的安装。清除 localStorage 的 fairy.zzz.update.debug 后恢复真实检查。')
          : null,
        h(
          'div',
          { className: 'fz3-upd-actions' },
          done
            ? run.applied
              ? h('button', { type: 'button', className: 'fz3-upd-btn is-primary', onClick: () => { try { window.location.reload() } catch (e) {} } }, '刷新页面')
              : h('button', { type: 'button', className: 'fz3-upd-btn is-primary', onClick: close }, '知道了')
            : h('button', { type: 'button', className: 'fz3-upd-btn is-primary', onClick: props.onUpdate, disabled: running }, running ? '更新中…' : failed ? '重试' : '更新'),
          /* v2.0.1：失败（多半是缓存过期 / 来源变了）时允许重新查一次 registry */
          failed ? h('button', { type: 'button', className: 'fz3-upd-btn is-ghost', onClick: props.onRecheck, disabled: running }, '重新检查') : null,
          done || failed
            ? null
            : h('button', { type: 'button', className: 'fz3-upd-btn is-ghost', onClick: close, disabled: running }, '稍后'),
        ),
      )
    }

    function FairySkin() {
      /* 已经完整播过一次开机 → 重挂载直接从 dock 开始；设置页「重播开机动画」会清标记 */
      const [phase, setPhase] = useState(() => (bootPlayed ? 'dock' : 'boot'))
      /* v1.7.3（性能）：氛围层是独立挂载点（shell.overlay），相位不在它的祖先链上，
         所以在 <html> 上同步一个 data 属性给样式用：dock 相把整屏 mix-blend-mode 关掉。 */
      useEffect(() => {
        try { document.documentElement.dataset.fz3Phase = phase } catch (e) {}
      }, [phase])
      const aliveRef = useRef(true)
      useEffect(() => {
        aliveRef.current = true
        return () => {
          aliveRef.current = false
        }
      }, [])

      /* 运行态情绪：宿主 /fairy-zzz/mood 轮询（idle / thinking / working / done）。
         v1.7.5（修复）：客户端热更新 / 宿主重挂载时，state 会回到初值 idle，眼徽会闪一下
         「正常待机」。把上一拍情绪缓存在 window 上，重挂载后第一帧就还是工作态，等轮询回来再校正。 */
      const [mood, setMood] = useState(() => {
        try { return window.__fz3mood || 'idle' } catch (e) { return 'idle' }
      })
      /* v1.7.5：完成的 Q 弹与扩散环改成一次性动作，只在情绪真正跨进 done 的那一下播。
         mood 在宿主窗口里维持约 2.4s，外部代码（例如调试定时器）直接改 data-mood 也不会
         再触发动画；data-celebrate 只由这里置位，1.1s 后自己收回，所以每完成一轮只弹一次。 */
      const [celebrate, setCelebrate] = useState(false)
      const celebrateTimer = useRef(null)
      useEffect(() => {
        if (mood !== 'done') return undefined
        setCelebrate(true)
        if (celebrateTimer.current) clearTimeout(celebrateTimer.current)
        celebrateTimer.current = setTimeout(() => {
          celebrateTimer.current = null
          setCelebrate(false)
        }, 1100)
        return undefined
      }, [mood])
      useEffect(() => () => {
        if (celebrateTimer.current) {
          clearTimeout(celebrateTimer.current)
          celebrateTimer.current = null
        }
      }, [])

      /* 眼徽坐标放 localStorage；拖拽统一走「按住右键」，不再有开关 */
      const [eyeHidden, setEyeHidden] = useState(() => readBool(EYE_KEY, false))
      /* v2.1.0：眼徽只在工作区显示。DSH 是 SPA，路由不会写进 location.pathname，
         只能观察 DOM：工作区根 .an3WzG_root 可见、且没有可见的 role="dialog" 弹窗，
         才算真正停在工作区；插件页 / 自动化 / 设置弹窗统一算 away。
         聊天流会持续改 DOM，所以重测限制成 140ms 最多一次，不跟逐字输出跑。 */
      const [surfaceAway, setSurfaceAway] = useState(false)
      useEffect(() => {
        let timer = 0
        let last = 0
        const visible = (el) => !!(el && el.getClientRects && el.getClientRects().length > 0)
        const measure = () => {
          const dialogs = document.querySelectorAll('[role="dialog"]')
          for (let i = 0; i < dialogs.length; i += 1) {
            if (visible(dialogs[i])) {
              setSurfaceAway(true)
              return
            }
          }
          setSurfaceAway(!visible(document.querySelector('.an3WzG_root')))
        }
        const schedule = () => {
          if (timer) return
          const wait = Math.max(0, 140 - (Date.now() - last))
          timer = setTimeout(() => {
            timer = 0
            last = Date.now()
            measure()
          }, wait)
        }
        measure()
        const observer = new MutationObserver((records) => {
          for (let i = 0; i < records.length; i += 1) {
            const target = records[i].target
            if (target && target.closest && target.closest('.fz3-layer')) continue
            schedule()
            return
          }
        })
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] })
        window.addEventListener('resize', schedule)
        return () => {
          observer.disconnect()
          if (timer) clearTimeout(timer)
          window.removeEventListener('resize', schedule)
        }
      }, [])
      const [dragging, setDragging] = useState(false)
      const [customPos, setCustomPos] = useState(() => {
        const saved = readStored(POS_KEY, null)
        return saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : null
      })
      /* v1.7.5（修复）：挂载（包括客户端热更新导致的重新挂载）后，先别把眼徽画出来。
         否则 .fz3-core 会先按基础 CSS 的中心坐标画一帧，再由 dock 位置补间过去，
         肉眼就是「眼徽飞到别处、变成待机脸，再被拉回原位」——定位本身没错，是过渡起点错了。
         现在等落位把 --fz3-dock-x/y 写完再显形；兜底计时器防止测量卡住时眼徽一直不出现，
         也不用 requestAnimationFrame —— 窗口被挡住时 rAF 会停，那样眼徽会彻底消失。 */
      const [settled, setSettled] = useState(false)
      useEffect(() => {
        const t = setTimeout(() => setSettled(true), 700)
        return () => clearTimeout(t)
      }, [])
      /* v1.7.5：复位按钮在「本来就没有自定义坐标」时也要能起作用（把眼标重新量一次），
         所以用一个自增标记当作测量 effect 的额外触发源。 */
      const [resetTick, setResetTick] = useState(0)
      /* v2.0.0：侧栏字标右上的「可更新」胶囊 —— 查到 npm 上有更高版本才出现。
         点开是确认浮层，确认后走宿主 pluginManager.updateBundle 真正安装。
         link: 本地目录安装没有可升级的 registry 来源，宿主直接拒绝，所以不会出现按钮。 */
      const [updateInfo, setUpdateInfo] = useState(null)
      const [updateOpen, setUpdateOpen] = useState(false)
      const [updateRun, setUpdateRun] = useState(null)
      const updateRunRef = useRef('')

      useEffect(() => {
        if (phase !== 'dock') return undefined
        let alive = true
        /* 刚挂载时 remote 服务不一定就绪，晚 4.2s 再查；失败静默，下次挂载再试 */
        const timer = setTimeout(() => {
          checkPluginUpdate(false).then((info) => {
            if (alive && info && info.latest) setUpdateInfo(info)
          })
        }, 4200)
        return () => {
          alive = false
          clearTimeout(timer)
        }
      }, [phase])

      /* v2.0.2：安装期间插件会被卸载，浮层跟着消失 —— 挂载后读一次落盘的结果，
         补一条「安装完成 / 失败」浮层。还在安装中（phase:'running'）就隔几秒再看，
         等宿主的最终结果或回滚后旧代码写下的错误原因。 */
      useEffect(() => {
        let alive = true
        let done = false
        let timers = []
        const tryApply = () => {
          if (!alive || done) return true
          const resume = readUpdateResume()
          if (!resume) return true
          if (resume.phase === 'running') return false
          done = true
          clearUpdateResume()
          setUpdateInfo({ installed: resume.from || '', latest: resume.to || '', resume: true })
          if (resume.phase === 'error') {
            setUpdateRun({ phase: 'error', cancelled: !!resume.cancelled, message: resume.message || '更新没有完成，请重试一次。' })
          } else {
            setUpdateRun({ phase: 'done', applied: resume.application === 'applied', restart: resume.application === 'restart-required', to: resume.to || '' })
          }
          setUpdateOpen(true)
          return true
        }
        if (!tryApply()) {
          timers = [800, 2000, 4000, 8000, 15000].map((ms) => setTimeout(() => {
            if (tryApply()) timers.forEach(clearTimeout)
          }, ms))
        }
        return () => {
          alive = false
          timers.forEach(clearTimeout)
        }
      }, [])

      /* 浮层打开时订阅宿主的安装进度：requestId 对得上才认（可能同时有别的东西在装） */
      useEffect(() => {
        if (!updateOpen) return undefined
        const ctx = runtime.ctx
        const remote = ctx && ctx.remote
        if (!remote || typeof remote.$on !== 'function') return undefined
        let off = null
        try {
          off = remote.$on('plugin-manager/update-state', (progress) => {
            if (!progress || !progress.requestId || progress.requestId !== updateRunRef.current) return
            setUpdateRun((cur) => (cur && cur.phase === 'running' ? { ...cur, step: progress.step } : cur))
          })
        } catch (e) {
          off = null
        }
        return () => {
          try { if (typeof off === 'function') off() } catch (e) {}
        }
      }, [updateOpen])

      useEffect(() => {
        if (!updateOpen) return undefined
        const onKey = (event) => { if (event.key === 'Escape') setUpdateOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [updateOpen])

      const runPluginUpdate = useCallback(async () => {
        const info = updateInfo
        if (!info || !info.latest) return
        if (updateRun && updateRun.phase === 'running') return
        const requestId = 'fz3-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
        updateRunRef.current = requestId
        setUpdateRun({ phase: 'running', step: 'checking', debug: !!info.debug })
        if (info.debug) {
          /* 调试态：只演 UI，不做真实安装 */
          const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
          for (const step of ['checking', 'removing', 'installing']) {
            await sleep(650)
            setUpdateRun((cur) => (cur && cur.phase === 'running' ? { ...cur, step } : cur))
          }
          await sleep(700)
          setUpdateRun({ phase: 'done', applied: true, to: info.latest, debug: true })
          return
        }
        const ctx = runtime.ctx
        const manager = pluginManagerOf(ctx)
        if (!manager || typeof manager.updateBundle !== 'function') {
          return setUpdateRun({ phase: 'error', message: '宿主没有提供插件更新接口，请在 DSH 桌面端里重试。' })
        }
        /* v2.0.2：安装期间插件会被卸载，这个组件（连同浮层）随时可能消失；
           先把上下文落盘，重挂载后由下面的 effect 补上结果。 */
        const resumeBase = { at: Date.now(), from: info.installed || '', to: info.latest, requestId }
        writeUpdateResume({ ...resumeBase, phase: 'running' })
        let answer
        try {
          /* v2.0.2：registry 不能传空串 —— 宿主会把任何 string 当 URL 正规化，
             空串直接抛 "a registry must be an http(s) URL:"（gateway/internal）。
             只有查询确实报告了自定义 registry 时才带上，否则让宿主用默认配置。 */
          const opts = { requestId }
          if (info.registry) opts.registry = info.registry
          answer = await manager.updateBundle(PKG, info.latest, opts)
        } catch (cause) {
          const message = '调用更新接口失败：' + clipText(cause && cause.message ? cause.message : cause, 140)
          writeUpdateResume({ ...resumeBase, at: Date.now(), phase: 'error', message })
          return setUpdateRun({ phase: 'error', message })
        }
        if (!answer) {
          const message = '宿主没有返回更新结果，请重试一次。'
          writeUpdateResume({ ...resumeBase, at: Date.now(), phase: 'error', message })
          return setUpdateRun({ phase: 'error', message })
        }
        if (answer.ok === false) {
          const message = updateFailureMessage({ result: { error: answer.error } })
          writeUpdateResume({ ...resumeBase, at: Date.now(), phase: 'error', message })
          return setUpdateRun({ phase: 'error', message })
        }
        const value = answer.value || {}
        const result = value.result || {}
        const to = value.to || info.latest
        /* v2.0.1：只有真的换掉版本才清缓存；失败时保留，重试不用再查一遍 registry */
        if (result.application === 'applied' || result.application === 'restart-required') {
          try { localStorage.removeItem(UPDATE_KEY) } catch (e) {}
          updateCache.info = null
          updateCache.at = 0
          writeUpdateResume({ ...resumeBase, at: Date.now(), to, phase: 'done', application: result.application })
          return setUpdateRun({ phase: 'done', applied: result.application === 'applied', restart: result.application === 'restart-required', to })
        }
        const message = result.application === 'cancelled' ? '更新被取消，当前版本没有变化。' : updateFailureMessage(value)
        writeUpdateResume({ ...resumeBase, at: Date.now(), phase: 'error', cancelled: result.application === 'cancelled', message })
        if (result.application === 'cancelled') return setUpdateRun({ phase: 'error', cancelled: true, message })
        return setUpdateRun({ phase: 'error', message })
      }, [updateInfo, updateRun])

      /* v2.0.1：失败后「重新检查」—— 丢掉缓存（含内存里的）再问一次 registry */
      const recheckPluginUpdate = useCallback(() => {
        try { localStorage.removeItem(UPDATE_KEY) } catch (e) {}
        updateCache.info = null
        updateCache.at = 0
        setUpdateRun(null)
        checkPluginUpdate(true).then((info) => {
          setUpdateInfo(info || null)
          if (!info) setUpdateOpen(false)
        })
      }, [])
      const dragRef = useRef(null)
      const coreRef = useRef(null)
      /* 刚结束一次右键拖动的时间戳：用来吞掉 mouseup 之后补发的那一个 contextmenu */
      const ctxGuardRef = useRef(0)
      /* 上一次「右键按下但没有拖动」的时间戳：两次靠得够近就当成双击，用来复位眼标 */
      const lastRightTapRef = useRef(0)
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
          /* v1.7.3：宿主顶栏不一定是 <header> 标签（Web 端是带哈希类名的 div），
             把 [class*="_header"] 也纳入；高度/位置过滤保证只命中真正的顶栏。 */
          const headers = document.querySelectorAll('header,[class*="_header"]')
          /* v1.7.5（修复）：消息流里的 [class*="_header"] 会随内容滚到视口上方，
             旧条件 r.top <= 12 对「负数 top」同样成立，于是 top 被算成 -1500 这种值，
             默认落位的 y 变成负数 —— 眼标被放到屏幕上方，表现就是「眼标莫名其妙消失」。
             现在只认真正贴在顶边、且完整可见的顶栏，并挑最靠上的那一个。 */
          let bestTop = null
          let bestBottom = null
          for (const hr of headers) {
            const r = hr.getBoundingClientRect()
            if (!(r.height > 0 && r.height < 120)) continue
            if (!(r.top > -6 && r.top <= 12 && r.bottom >= 8 && r.bottom <= vh * 0.18)) continue
            /* 顶栏有两种：贴着会话列左缘的（left ≈ 侧栏右缘），和横跨整个窗口的
               标题栏（left ≈ 0，包含菜单栏）。后者以前被 left 过滤掉，导致顶栏永远
               命不中，只能退回 top = 0。 */
            const fullWidthBar = r.left <= 6 && r.width > vw * 0.85
            if (!(r.width > vw * 0.3 && (r.left > left - 8 || fullWidthBar))) continue
            if (bestTop === null || r.top < bestTop) {
              bestTop = r.top
              bestBottom = r.bottom
            }
          }
          if (bestBottom !== null) top = Math.round(Math.min(Math.max(bestBottom, 0), vh * 0.2))
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

      /* v1.7.3（性能）：--fz3-dock-x/y 与 --fz3-brand-* 只被 .fz3-layer 子树里的元素读取。
         写到 :root 会让整棵文档的样式失效（大会话几千个节点），而 overlay 每次路由切换 /
         打开会话都会重挂载并测量一次——这是「点一下卡一下」里最长的一段 Style 时间。
         改为写到图层元素本身（失效范围缩到这一小棵子树），并把「值没变就不写」去重；
         图层元素换新时缓存自动作废。 */
      const layerVars = useRef(null)
      const setLayerVar = useCallback((name, value) => {
        const layer = document.querySelector('.fz3-layer')
        const el = layer || document.documentElement
        const cache = layerVars.current && layerVars.current.el === el ? layerVars.current.vals : (layerVars.current = { el, vals: {} }).vals
        if (cache[name] === value) return
        cache[name] = value
        el.style.setProperty(name, value)
      }, [])
      const applyPos = useCallback((p) => {
        setLayerVar('--fz3-dock-x', p.x + 'px')
        setLayerVar('--fz3-dock-y', p.y + 'px')
      }, [setLayerVar])

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
          /* v2.1.0：字标盒子原来固定 262px 再加左右 padding，盒子右缘会越过侧栏，
             「可更新」胶囊也被侧栏裁掉/压到折叠按钮。按宿主 logo 行右侧的折叠按钮
             反推可用宽度，让胶囊收回字标格子内。 */
          const toggle = document.querySelector('[data-sidebar-toggle="true"]')
          const host = r.parentElement || row
          const hostRight = host.getBoundingClientRect().right
          const rightEdge = toggle ? toggle.getBoundingClientRect().left : hostRight
          const brandW = Math.max(170, Math.min(262, rightEdge - r.left - 8))
          setLayerVar('--fz3-brand-w', Math.round(brandW) + 'px')
          /* v2.1.0：字标整体上提 6px，给下方的「可更新」胶囊腾出空间；
             胶囊右缘对齐新会话按钮右缘，底部搭在按钮上缘（不盖住按钮文字/快捷键）。 */
          setLayerVar('--fz3-brand-top', Math.round(r.top - 12) + 'px')
          setLayerVar('--fz3-brand-left', Math.round(r.left) + 'px')
          setLayerVar('--fz3-brand-h', Math.round(Math.max(34, r.height + 10)) + 'px')
          const newSession = document.querySelector('button[class*="_newSession"]')
          if (newSession) {
            const ns = newSession.getBoundingClientRect()
            setLayerVar('--fz3-upd-right', Math.round(r.left + brandW - ns.right) + 'px')
          }
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
      }, [setLayerVar])
      useEffect(() => {
        /* v1.7.4（性能）：只在 dock 相测量。hero/greet 期眼徽用的是 CSS 位置，
           测了也没人用；而开机覆盖层播放期间 DOM 还在长，测量必然失败并触发重试，
           正好把强制布局塞进最卡的启动窗口。 */
        if (phase !== 'dock') return undefined
        /* 主人自己拖过眼徽：用记住的坐标，不再自动测量 */
        if (customPos) {
          applyPos(clampPos(customPos.x, customPos.y))
          return undefined
        }
        if (eyeHidden) return undefined
        /* dock 定位（v1.7.3 性能重写）：眼标钉在「会话内容区」左缘中部。
           v1.7.0 的实现在窄选择器没命中时会退到 document.querySelectorAll('div,main,section')
           逐个 getBoundingClientRect —— 每次 shell.overlay 重挂载（任何路由切换、打开会话）
           都会跑最多 3 轮全文档强制布局，正是「点一下卡一下」的另一半原因。
           现在只用两个稳定锚点：侧栏右缘（左边界）与顶部标题栏底缘（上边界），
           各一次 querySelector + 一次 gBCR；失败就按退避表重试，彻底没有全文档扫描。 */
        let tries = 0
        let retryTimer = null
        let resizeTimer = null
        let cached = null
        let ro = null
        const NARROW = '[data-chat-flow],[data-conversation-scroll],[class*="_conversation"],[class*="_chatBody"],[class*="_threadBody"],[class*="_centerCol"],[class*="_scrollBody"],[class*="_mainCol"],main'
        const fits = (r, vw) => r.width >= 420 && r.height >= 300 && r.left >= 260 && r.left <= vw * 0.5 && r.width <= vw * 0.9
        /* 侧栏/标题栏渲染完成前左侧会是 0：此时只在「窄选择器」的十来个候选里量一次，
           仍然不做全文档扫描。 */
        const guessLeft = (vw) => {
          if (cached && cached.isConnected) {
            const r = cached.getBoundingClientRect()
            if (fits(r, vw)) return Math.round(r.left)
            cached = null
          }
          let nodes
          try { nodes = document.querySelectorAll(NARROW) } catch (e) { return 0 }
          /* v1.7.4：候选最多量 24 个。正常命中在前几个；命中不了说明 DOM 还没稳定，
             交给 ResizeObserver 等布局落定，不再无限往下读（每次 gBCR 都是强制布局）。 */
          const limit = Math.min(nodes.length, 24)
          for (let i = 0; i < limit; i += 1) {
            const r = nodes[i].getBoundingClientRect()
            if (!fits(r, vw)) continue
            cached = nodes[i]
            return Math.round(r.left)
          }
          return 0
        }
        const watchAnchors = () => {
          if (ro || typeof ResizeObserver !== 'function') return
          let sidebar = null
          let header = null
          try { sidebar = document.querySelector('[class*="_sidebarCol"]') } catch (e) {}
          try { header = document.querySelector('header,[class*="_header"]') } catch (e) {}
          const els = []
          if (sidebar) els.push(sidebar)
          if (header) els.push(header)
          if (!els.length) return
          ro = new ResizeObserver(() => {
            if (resizeTimer) return
            resizeTimer = setTimeout(() => { resizeTimer = null; try { measureOnce() } catch (e) {} }, 260)
          })
          for (let i = 0; i < els.length; i += 1) {
            try { ro.observe(els[i]) } catch (e) {}
          }
        }
        const measureOnce = () => {
          const root = document.documentElement
          let region = null
          try { region = measureRegion() } catch (e) { region = null }
          if (!region) region = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
          if (!region.left) {
            const left = guessLeft(window.innerWidth)
            if (left) region.left = left
          }
          if (!region.left) return false
          regionRef.current = region
          if (customPos) {
            const c = clampPos(customPos.x, customPos.y)
            setLayerVar('--fz3-dock-x', c.x + 'px')
            setLayerVar('--fz3-dock-y', c.y + 'px')
          } else {
            const size = parseFloat(getComputedStyle(root).getPropertyValue('--fz3-dock-size')) || 128
            const half = size / 2 + 4
            const vw = window.innerWidth
            const vh = window.innerHeight
            /* v1.7.5（修复）：默认落位不再直接用区域原始 top（可能来自视口上方的元素），
               先用夹进视口后的边界，最后再兜一次「必须完整待在视口里」。
               竖排位置贴会话区中线，横向贴左边界，和以前观感一致。 */
            const safe = regionBounds()
            const leftEdge = Math.max(0, Math.min(region.left, vw - 240))
            let cx = Math.round(leftEdge + half + 10)
            let cy = Math.round(safe.top + (safe.bottom - safe.top) * 0.5)
            cx = Math.min(Math.max(cx, leftEdge + half), Math.max(leftEdge + half, vw - half))
            cy = Math.min(Math.max(cy, safe.top + half), Math.max(safe.top + half, safe.bottom - half))
            cx = Math.min(Math.max(cx, half), Math.max(half, vw - half))
            cy = Math.min(Math.max(cy, half), Math.max(half, vh - half))
            setLayerVar('--fz3-dock-x', cx + 'px')
            setLayerVar('--fz3-dock-y', cy + 'px')
          }
          /* 坐标已经写进 layer，这才让眼徽显形：热重载重挂载时既不会闪到画面中心，也不会闪待机脸。 */
          setSettled(true)
          watchAnchors()
          return true
        }
        /* v1.7.4（性能）：先挂 ResizeObserver 再量。测量失败时不再用 6 段退避表反复
           触发强制布局（0/160/400/900/1800/3200 —— 用户点完还会在 1.8s、3.2s 再卡一下），
           而是等侧栏/标题栏尺寸变化（RO）自己回来量一次。 */
        watchAnchors()
        const DELAYS = [0, 240]
        const kick = () => {
          tries += 1
          let ok = false
          try { ok = measureOnce() } catch (e) { ok = false }
          if (ok || tries >= DELAYS.length) return
          if (retryTimer) return
          retryTimer = setTimeout(() => {
            retryTimer = null
            kick()
          }, DELAYS[tries])
        }
        kick()
        /* 拖动窗口会连续触发 resize；去抖后只重排一个定时器。 */
        const onResize = () => {
          if (resizeTimer) return
          resizeTimer = setTimeout(() => {
            resizeTimer = null
            try { measureOnce() } catch (e) {}
          }, 260)
        }
        window.addEventListener('resize', onResize)
        return () => {
          if (retryTimer) clearTimeout(retryTimer)
          if (resizeTimer) clearTimeout(resizeTimer)
          if (ro) ro.disconnect()
          window.removeEventListener('resize', onResize)
        }
      }, [phase, customPos, eyeHidden, resetTick, applyPos, clampPos, setLayerVar])

      /* 记住的位置也要跟着窗口缩放夹一下，别把眼标留在屏幕外 */
      useEffect(() => {
        if (!customPos) return undefined
        const onResize = () => applyPos(clampPos(customPos.x, customPos.y))
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
      }, [customPos, applyPos, clampPos])

      /* 设置页里的开关、眼标的「双击右键复位」都通过自定义事件同步到这个图层 */
      useEffect(() => {
        const syncEye = () => setEyeHidden(readBool(EYE_KEY, false))
        const onReset = () => {
          try { localStorage.removeItem(POS_KEY) } catch {}
          setCustomPos(null)
          setDragging(false)
          setResetTick((n) => n + 1)
        }
        window.addEventListener('fz3:eye-pref', syncEye)
        window.addEventListener('fz3:dock-reset', onReset)
        window.addEventListener('storage', syncEye)
        return () => {
          window.removeEventListener('fz3:eye-pref', syncEye)
          window.removeEventListener('fz3:dock-reset', onReset)
          window.removeEventListener('storage', syncEye)
        }
      }, [])

      /* 欢迎页 hero 的标题与「预览版」徽章没有插槽，只能改写 DOM 文本。
         v1.7.3（性能）：v1.7.0 观察整个 body，并对每条 childList 里的每个新增节点跑
         一次子树 querySelector —— 打开大会话 / 流式输出时是 O(N²) 的同步扫描，
         正是「点会话明显卡一下」的主因之一。
         现在只在这两种时机找节点：hero 插槽挂载（fz3:hero-mount，由 HeroBrandMark 派发）
         与首次挂载后的几次退避重试；找到后只观察标题所在的小容器，离开 hero 立刻断开。 */
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
        let group = null
        let observer = null
        let pending = null
        const timers = []
        const attach = () => {
          if (group && !group.isConnected) {
            group = null
            if (observer) {
              try { observer.disconnect() } catch (e) {}
              observer = null
            }
          }
          if (!group) {
            group = document.querySelector('[class*="_headline"] [class*="_titleGroup"]')
            if (!group) return false
          }
          try { rewrite() } catch (e) {}
          if (!observer) {
            observer = new MutationObserver(() => {
              if (pending) return
              pending = setTimeout(() => {
                pending = null
                try { attach() } catch (e) {}
              }, 80)
            })
            try {
              observer.observe(group, { childList: true, subtree: true, characterData: true })
            } catch (e) {
              observer = null
            }
          }
          return true
        }
        const later = (ms) => {
          timers.push(setTimeout(() => {
            try { attach() } catch (e) {}
          }, ms))
        }
        const onHero = () => {
          try { attach() } catch (e) {}
          later(120)
          later(420)
          later(900)
        }
        const onLeave = () => {
          group = null
          if (observer) {
            try { observer.disconnect() } catch (e) {}
            observer = null
          }
        }
        attach()
        later(200)
        later(700)
        window.addEventListener('fz3:hero-mount', onHero)
        window.addEventListener('fz3:hero-unmount', onLeave)
        return () => {
          window.removeEventListener('fz3:hero-mount', onHero)
          window.removeEventListener('fz3:hero-unmount', onLeave)
          if (pending) clearTimeout(pending)
          for (let i = 0; i < timers.length; i += 1) clearTimeout(timers[i])
          if (observer) {
            try { observer.disconnect() } catch (e) {}
          }
        }
      }, [])

      /* 到坞后空闲预取用量与余额：左下角读数第一帧就有数（与眼标显隐无关） */
      useEffect(() => {
        if (phase !== 'dock') return undefined
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
      }, [phase])

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
              try { window.__fz3mood = d.mood } catch (e) {}
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
        markBootPlayed(true)
        setPhase('greet')
      }, [])

      const toDock = useCallback(() => {
        markBootPlayed(true)
        setPhase('dock')
        setNeedTap(false)
        autoArmAt = Date.now() + 2600
      }, [])

      /* ———————————————————— 眼徽拖拽 ————————————————————
         v1.7.5：电费读数常驻左下角之后，眼徽只做状态指示与拖动，点它不再展开气泡。 */
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
        if (phase !== 'dock') return
        /* 只认右键：按住右键拖动眼标；左键不作用，也不再弹任何菜单 */
        if (e.button !== 2) return
        ctxGuardRef.current = Date.now()
        /* 双击右键（两下都没有拖动）＝ 眼标复位，走和 fz3:dock-reset 同一条事件 */
        if (Date.now() - lastRightTapRef.current < 420) {
          lastRightTapRef.current = 0
          try { window.dispatchEvent(new Event('fz3:dock-reset')) } catch (err) {}
          return
        }
        /* 拖拽/吸附前重新量一次范围：打开会话、折叠侧栏后标题栏高度可能变，不能只信挂载时那次 */
        regionRef.current = measureRegion()
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        /* 拖动期间禁用 left/top 的 1.35s 过渡，落位由手势/吸附动画接管 */
        el.style.transition = 'none'
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
      /* 右键拖到松手时 Chromium 会在 mouseup 之后补一个 contextmenu，落点可能已经不在眼标上。
         这里在捕获阶段把「正在拖 / 刚拖完（800ms 内）」的菜单吞掉，别处的右键照常交还宿主。 */
      useEffect(() => {
        const onCtx = (ev) => {
          if (dragRef.current || Date.now() - ctxGuardRef.current < 800) {
            ev.preventDefault()
            ev.stopPropagation()
          }
        }
        window.addEventListener('contextmenu', onCtx, true)
        return () => window.removeEventListener('contextmenu', onCtx, true)
      }, [])
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
      const finishDrag = (drag) => {
        ctxGuardRef.current = Date.now()
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
          /* 没移动的右键按下记一笔，给「双击右键复位」做判定 */
          lastRightTapRef.current = Date.now()
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
        finishDrag(drag)
      }
      /* 指针被系统取消（触摸滚动被外层接管等）不当成一次点击；已移动过就落位，否则复位 */
      const onCoreCancel = (e) => {
        const drag = dragRef.current
        if (!drag || drag.id !== e.pointerId) return
        dragRef.current = null
        detachDrag(drag)
        setDragging(false)
        finishDrag(drag)
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
          markBootPlayed(false)
          setPhase('boot')
        }
        bootHooks.add(fn)
        return () => { bootHooks.delete(fn) }
      }, [])




      /* v2.0.0：查到新版本才显示「可更新」胶囊；更新成功后收起（重启提示留在浮层里） */
      const updatePill = updateInfo && updateInfo.latest && !(updateRun && updateRun.phase === 'done')
        ? h(
            'button',
            {
              type: 'button',
              className: 'fz3-upd-pill',
              'data-state': updateRun && updateRun.phase === 'running' ? 'busy' : 'idle',
              title: '发现新版本 ' + updateInfo.latest,
              onClick: () => {
                setUpdateRun(null)
                setUpdateOpen(true)
              },
            },
            h('span', { className: 'fz3-upd-pill-dot' }),
            updateRun && updateRun.phase === 'running' ? '更新中' : '可更新',
          )
        : null

      const busy = voiceState.busy || voiceState.speaking

      return h(
        'div',
        { className: 'fz3-layer', 'data-phase': phase, 'data-mood': mood, 'data-celebrate': celebrate ? '1' : '0', 'data-dragging': dragging ? '1' : '0', 'data-settled': settled ? '1' : '0', 'data-surface': surfaceAway ? 'away' : 'workspace' },
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
              updatePill,
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
                /* 右键按下即开始拖；这里挡掉原生菜单，配合下面的全局守卫一起用
                   （不做 hover 提示：用法写在 README 里，眼标上不再浮字） */
                onContextMenu: (e) => e.preventDefault(),
                /* v1.7.5：只做状态指示 + 拖动，不再是按钮，也没有点击气泡。
                   拖动统一走右键按住，左键不作用。 */
              },
              h(CoreGlyph, { phase, mood }),
            )
          : null,

        /* ———————————————————— 左下角电费实时读数 ———————————————————— */
        /* v1.7.5：读数独立于眼标 —— 关掉「显示眼徽」只收起眼标，这里照常显示 */
        phase === 'dock' ? h(BillDock) : null,

        /* v2.0.0：更新确认浮层（只在点开胶囊后渲染，不加遮罩，点 × / Esc 关闭） */
        updateOpen && updateInfo
          ? h(PluginUpdatePanel, {
              info: updateInfo,
              run: updateRun,
              onUpdate: runPluginUpdate,
              onRecheck: recheckPluginUpdate,
              onClose: () => {
                /* 关掉浮层就把「待补结果」清掉，免得下次重挂载又弹一遍 */
                if (!(updateRun && updateRun.phase === 'running')) clearUpdateResume()
                setUpdateOpen(false)
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
      inject: ['slots', 'locale', 'theme', 'remote', 'remote.account', 'remote.pluginManager'],
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
          if (!theme || typeof theme.overrideTokens !== 'function') return
          const dispose = theme.overrideTokens(PKG, TOKENS)
          /* 静态客户端插件不在宿主 dynamicCordisPackageRunner 的 guardedTheme 自动清理范围内：
             宿主只对动态加载的包把 overrideTokens 的 disposer 挂到 ctx.effect。这里必须自己
             登记释放，否则插件被禁用 / 热重载卸载后，--dsw-* token 会永久残留在 document.body
             上（宿主按钮、开关、文件夹图标继续发青柠光）。 */
          if (typeof dispose === 'function' && ctx && typeof ctx.effect === 'function') {
            ctx.effect(() => () => {
              try { dispose() } catch {}
            })
          }
        })

        guard('theme-watch', () => {
          /* v1.7.5 起外观固定深色：浅色版还没做完，先不跟随宿主切换。
             只把 <html data-fz3-theme> 钉在 dark —— 浅色覆盖全靠这个属性，不写就是深色；
             宿主切主题会改 html 属性，所以留 260ms 去抖的观察兜底，把属性重新钉回去。
             要恢复跟随：把 apply 换回按 theme.getTheme() 判深浅的版本即可，CSS 侧不用动。 */
          if (typeof document === 'undefined') return
          const root = document.documentElement
          const apply = () => {
            if (root.dataset.fz3Theme !== 'dark') root.dataset.fz3Theme = 'dark'
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
          const observer = new MutationObserver(soon)
          observer.observe(root, { attributes: true, attributeFilter: ['style', 'class', 'data-theme', 'data-color-scheme', 'data-fz3-theme'] })
          if (ctx && typeof ctx.effect === 'function') {
            ctx.effect(() => () => {
              if (timer) clearTimeout(timer)
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
