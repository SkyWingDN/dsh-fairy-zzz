import { appendFileSync, createReadStream, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Fairy Ⅲ · H.D.D Skin — Host half.
 *
 *   GET  /fairy-zzz/assets/<file>   boot.mp4 / poster.jpg / hero.png / voice/greet-*.wav
 *   GET  /fairy-zzz/audio/<hash>.wav synthesized voice cache (Range capable)
 *   POST /fairy-zzz/tts             { text } -> { url, cached, seconds }
 *   GET  /fairy-zzz/mood            { mood } -> idle | thinking | working | done
 *   GET  /fairy-zzz/voice-home      { ok, home, source, reason }
 *   POST /fairy-zzz/voice-home      { home, probe? } -> 保存/校验引擎目录
 *   GET  /fairy-zzz/engine          { phase, home, error } -> 本地语音引擎状态
 *   POST /fairy-zzz/engine          { action: 'start' | 'stop' }
 *   GET  /fairy-zzz/health          { ok, engine, voice }
 *
 * The Client half owns every pixel; this half owns bytes, cache and the local
 * GPT-SoVITS process (already resident on 127.0.0.1:9800 in the usual case).
 */
export const name = 'fairy-zzz'
export const inject = ['webServer']

const HERE = fileURLToPath(new URL('.', import.meta.url))
const ASSETS = join(HERE, 'assets')
const CACHE = process.env.FAIRY_CACHE_DIR || join(HERE, 'cache')

const TTS_PORT = Number(process.env.FAIRY_TTS_PORT || 9800)

/* 语音引擎位置由用户自己指定，优先级：
   1. voice-home.txt（设置面板里填的目录，与插件同目录）—— 用户选择永远优先
   2. FAIRY_VOICE_HOME 环境变量（安装脚本 / 进阶用户）
   3. 插件同级 voice/（免安装便携包自带引擎）
   4. 旧版 FAIRY_TTS_DIR 环境变量（兼容早期安装）
   都没有就返回空串：皮肤照常工作，只是不朗读，设置面板会提示去指定目录。
   （问候语是预录 wav，不依赖引擎。） */
const VOICE_HINT = join(HERE, 'voice-home.txt')

function readVoiceHome() {
  try {
    const hint = readFileSync(VOICE_HINT, 'utf8').trim()
    if (hint) return resolve(hint)
  } catch {}
  if (process.env.FAIRY_VOICE_HOME) return resolve(process.env.FAIRY_VOICE_HOME)
  const beside = join(HERE, '..', 'voice')
  if (existsSync(join(beside, 'fairy_server.py'))) return resolve(beside)
  if (process.env.FAIRY_TTS_DIR) return resolve(process.env.FAIRY_TTS_DIR)
  return ''
}

function voiceHomeSource() {
  try {
    if (readFileSync(VOICE_HINT, 'utf8').trim()) return 'settings'
  } catch {}
  if (process.env.FAIRY_VOICE_HOME) return 'env'
  if (existsSync(join(HERE, '..', 'voice', 'fairy_server.py'))) return 'portable'
  if (process.env.FAIRY_TTS_DIR) return 'legacy'
  return 'none'
}

/* 用户填进来的路径：去引号、合并重复分隔符，Windows 下统一成反斜杠。 */
const IS_WIN = process.platform === 'win32'

function cleanHome(value) {
  let out = String(value ?? '')
    .trim()
    .replace(/^"+|"+$/g, '')
    .replace(/([\\/])\1+/g, '$1')
  if (IS_WIN) out = out.replace(/\//g, '\\')
  return out
}

/* 检查一个目录是不是能跑起来的语音引擎，返回可读的诊断。 */
function inspectVoiceDir(dir) {
  const empty = { ok: false, home: '', source: voiceHomeSource(), reason: '' }
  if (!dir) return { ...empty, reason: '还没有指定语音引擎目录' }
  if (!existsSync(dir)) return { ...empty, home: dir, reason: '目录不存在：' + dir }
  const server = join(dir, 'fairy_server.py')
  if (!existsSync(server)) return { ...empty, home: dir, reason: '目录里没有 fairy_server.py' }
  const python = resolvePython(dir)
  if (!existsSync(python)) return { ...empty, home: dir, reason: '目录里没有 python\\python.exe 或 py311\\python.exe' }
  if (!existsSync(join(dir, 'GPT-SoVITS'))) return { ...empty, home: dir, reason: '目录里没有 GPT-SoVITS' }
  return {
    ok: true,
    home: dir,
    source: voiceHomeSource(),
    python,
    server,
    models: existsSync(join(dir, 'models')) ? join(dir, 'models') : '',
    reason: '',
  }
}

function saveVoiceHome(dir) {
  const clean = cleanHome(dir)
  const info = inspectVoiceDir(clean)
  if (!info.ok) return info
  try {
    writeFileSync(VOICE_HINT, clean + '\n', 'utf8')
  } catch (cause) {
    return { ...info, ok: false, reason: '写不进 voice-home.txt：' + String(cause?.message ?? cause) }
  }
  syncVoiceHome()
  return { ...inspectVoiceDir(clean), source: 'settings', saved: true }
}

let TTS_DIR = readVoiceHome()
let TTS_PY = resolvePython(TTS_DIR)
let TTS_SERVER = join(TTS_DIR, 'fairy_server.py')

function resolvePython(dir) {
  if (!dir) return ''
  return existsSync(join(dir, 'python', 'python.exe'))
    ? join(dir, 'python', 'python.exe')
    : join(dir, 'py311', 'python.exe')
}

/* 每次用到引擎前重新解析一次：改了环境变量 / voice-home.txt 之后
   不必重启宿主，下一次请求就会指向新目录。 */
function syncVoiceHome() {
  let dir = ''
  try {
    dir = readVoiceHome()
  } catch {
    return
  }
  if (dir === TTS_DIR) return
  TTS_DIR = dir
  TTS_PY = resolvePython(dir)
  TTS_SERVER = join(dir, 'fairy_server.py')
}
const TTS_SPEED = 1.04
const MAX_CHARS = 500

const MIME = {
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
}

const mimeOf = (file) => MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'

async function sizeOf(file) {
  try {
    const info = await stat(file)
    return info.isFile() ? info.size : -1
  } catch {
    return -1
  }
}

/* ---------------------------------------------------------------- 文件缓存策略
   旧版 sendFile 一律发 cache-control:no-cache 且没有 ETag/Last-Modified：boot.mp4
   （4.8MB）、hero.png、问候 wav 每次页面加载都要重新下载整份字节。现在：
   - 用 stat 生成强 ETag（size + mtime，零读盘），同时发 Last-Modified；
   - If-None-Match / If-Modified-Since 命中 → 304 空 body；
   - cache/ 里 sha1 命名的合成语音内容不可变 → 一年 immutable；其余静态资源
     max-age=0 + must-revalidate，重复加载只花一个 304；
   - 保留 Range/206，并支持 If-Range（<video> 拖动进度条时按强 ETag 判断）；
   - 支持 HEAD（只回头部字节，不打开文件流）。 */
const STATIC_CACHE = 'public, max-age=0, must-revalidate'
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'
const IMMUTABLE_ROOT = resolve(CACHE) + sep

const cacheControlFor = (file) =>
  resolve(file).startsWith(IMMUTABLE_ROOT) ? IMMUTABLE_CACHE : STATIC_CACHE

const etagOf = (info) => `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`

const lastModifiedOf = (info) => new Date(Math.floor(info.mtimeMs / 1000) * 1000).toUTCString()

/** 一次 stat 同时拿到大小和 mtime；不存在/不是文件返回 null。 */
async function metaOf(file) {
  try {
    const info = await stat(file)
    return info.isFile() ? { size: info.size, mtimeMs: info.mtimeMs } : null
  } catch {
    return null
  }
}

function ifNoneMatch(req, etag) {
  const raw = req.headers['if-none-match']
  if (!raw) return false
  const want = etag.replace(/^W\//, '')
  return String(raw)
    .split(',')
    .some((part) => {
      const tag = part.trim()
      return tag === '*' || tag.replace(/^W\//, '') === want
    })
}

function ifModifiedSince(req, info) {
  const raw = req.headers['if-modified-since']
  if (!raw) return false
  const since = Date.parse(String(raw))
  if (Number.isNaN(since)) return false
  return Math.floor(info.mtimeMs / 1000) * 1000 <= since
}

/** Range 是否依然可用：If-Range 用强 ETag 比对，日期形式则对比 mtime。 */
function ifRangeAllows(req, info) {
  const raw = req.headers['if-range']
  if (!raw) return true
  const value = String(raw).trim()
  if (value.startsWith('"') || value.startsWith('W/')) return value.replace(/^W\//, '') === etagOf(info)
  const date = Date.parse(value)
  return !Number.isNaN(date) && Math.floor(info.mtimeMs / 1000) * 1000 <= date
}

async function sendFile(req, res, file) {
  const info = await metaOf(file)
  if (!info) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('not found')
    return
  }
  const total = info.size
  const type = mimeOf(file)
  const etag = etagOf(info)
  const lastModified = lastModifiedOf(info)
  const cacheControl = cacheControlFor(file)
  const headers = {
    'content-type': type,
    'accept-ranges': 'bytes',
    'cache-control': cacheControl,
    etag,
    'last-modified': lastModified,
  }
  const isHead = req.method === 'HEAD'
  /* HEAD 只回头；带 Range 的请求不用 304（<video> 要的是分片，304 会让它空转）。 */
  const range = isHead ? '' : req.headers.range
  if (!range && (ifNoneMatch(req, etag) || ifModifiedSince(req, info))) {
    res.writeHead(304, { 'cache-control': cacheControl, etag, 'last-modified': lastModified })
    res.end()
    return
  }
  if (range && ifRangeAllows(req, info)) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (match) {
      const start = match[1] ? Number(match[1]) : 0
      const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1
      if (start <= end && start < total) {
        res.writeHead(206, {
          ...headers,
          'content-range': `bytes ${start}-${end}/${total}`,
          'content-length': end - start + 1,
        })
        if (isHead) {
          res.end()
          return
        }
        const stream = createReadStream(file, { start, end })
        stream.on('error', () => res.destroy())
        stream.pipe(res)
        return
      }
    }
  }
  res.writeHead(200, { ...headers, 'content-length': total })
  if (isHead) {
    res.end()
    return
  }
  const stream = createReadStream(file)
  stream.on('error', () => res.destroy())
  stream.pipe(res)
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((done, fail) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        fail(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => done(Buffer.concat(chunks).toString('utf8')))
    req.on('error', fail)
  })
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

/* ---------------------------------------------------------------- 热路径记忆化
   /mood 每 900ms 轮询、/health 每 5s 轮询。旧版每次 /health 都要探测
   127.0.0.1:9800（最长 1500ms 超时）再对语音目录做一串 stat；/mood 每次都跑一遍
   registry 快照。这里给纯只读状态加短 TTL：mood 300ms（run/idle 最多迟到 300ms，
   远小于客户端 900ms 轮询间隔）、引擎探测 1500ms、语音目录 3000ms。
   写操作（POST voice-home / engine start·stop / tts 拉起引擎）之后主动 clear，
   所以“开始/停止引擎”和换目录的反馈仍是即时的。 */
const MOOD_CACHE_MS = 300
const ENGINE_CACHE_MS = 1500
const VOICE_CACHE_MS = 3000

/** 同步记忆：TTL 内直接返回上次结果，过期后重新计算；带 clear()。 */
function createMemo(ttlMs) {
  let at = 0
  let value
  let has = false
  const get = (compute) => {
    const now = Date.now()
    if (has && now - at < ttlMs) return value
    value = compute()
    at = now
    has = true
    return value
  }
  get.clear = () => {
    has = false
    value = undefined
  }
  return get
}

/** 异步记忆：并发请求共享同一次计算（in-flight 去重），带 clear()。 */
function createAsyncMemo(ttlMs) {
  let at = 0
  let value
  let has = false
  let inflight = null
  let generation = 0
  const get = (compute) => {
    const now = Date.now()
    if (has && now - at < ttlMs) return Promise.resolve(value)
    if (inflight) return inflight
    const mine = generation
    inflight = Promise.resolve()
      .then(compute)
      .then((result) => {
        if (mine === generation) {
          value = result
          at = Date.now()
          has = true
        }
        return result
      })
      .finally(() => {
        if (mine === generation) inflight = null
      })
    return inflight
  }
  get.clear = () => {
    generation += 1
    has = false
    value = undefined
    inflight = null
  }
  return get
}

async function engineState() {
  try {
    const res = await fetch(`http://127.0.0.1:${TTS_PORT}/health`, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return { up: false, loading: false, ready: false, error: '', state: 'dead' }
    const data = await res.json().catch(() => ({}))
    const loading = Boolean(data?.loading)
    const ready = Boolean(data?.ready)
    return { up: true, loading, ready, error: String(data?.error ?? ''), state: ready ? 'ready' : loading ? 'loading' : 'error' }
  } catch {
    return { up: false, loading: false, ready: false, error: '', state: 'dead' }
  }
}

async function pingEngine() {
  return (await engineState()).up
}

let enginePromise = null
let engineChild = null

function ensureEngine() {
  syncVoiceHome()
  if (!enginePromise) {
    enginePromise = (async () => {
      const state = await engineState()
      if (state.up) return true
      if (!existsSync(TTS_PY) || !existsSync(TTS_SERVER)) {
        throw new Error(TTS_DIR ? `语音引擎不完整：${TTS_DIR}（请在 设置 → Fairy 里重新指定目录）` : '还没有指定语音引擎目录（设置 → Fairy → 语音引擎目录）')
      }
      const logFile = join(TTS_DIR, 'server.log')
      let out = 'ignore'
      try {
        out = openSync(logFile, 'a')
      } catch {}
      const child = spawn(TTS_PY, [TTS_SERVER, '--port', String(TTS_PORT)], {
        detached: true,
        stdio: ['ignore', out, out],
        cwd: TTS_DIR,
        windowsHide: true,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
      child.unref()
      engineChild = child
      for (let tick = 0; tick < 180; tick += 1) {
        await sleep(1000)
        const now = await engineState()
        if (now.up) return true
        if (child.exitCode !== null && child.exitCode !== undefined) break
      }
      throw new Error('语音引擎启动超时（日志见 voice/server.log）')
    })().catch((cause) => {
      enginePromise = null
      throw cause
    })
  }
  return enginePromise
}

async function stopEngine() {
  enginePromise = null
  const child = engineChild
  engineChild = null
  if (!child) return false
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true })
    } else {
      child.kill('SIGTERM')
    }
    return true
  } catch {
    return false
  }
}

/** CPU 推理排队：一次只跑一句，跟引擎保持一致。 */
let queue = Promise.resolve()

function enqueue(run) {
  const task = queue.then(run, run)
  queue = task.then(
    () => undefined,
    () => undefined,
  )
  return task
}

const pending = new Map()

function synthesize(text, file) {
  return enqueue(async () => {
    await ensureEngine()
    const res = await fetch(`http://127.0.0.1:${TTS_PORT}/tts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, out: file, speed: TTS_SPEED }),
      signal: AbortSignal.timeout(240_000),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`tts ${res.status}: ${data.error ?? 'unknown'}`)
    return data
  })
}

function cleanText(raw) {
  return String(raw ?? '')
    .replace(/```[\s\S]*?```/g, '。')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~#>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CHARS)
}


/* ------------------------------------------------------------------ mood
   眼睑表情的唯一事实来源：GET /fairy-zzz/mood → idle | thinking | working | done

   权威快照是 `ctx.get('agents')`（AgentRegistry）。registry.list() 只返回
   当前进程里活着的 agent，agent.status 由 agent-loop 的 phase 决定
   （phase.kind 为 idle / maintenance 时是 idle，其余是 running）。插件中途
   重载、会话恢复、事件丢失都不会让这份快照说谎，所以每次轮询都以它为准。

   事件机（agent/status、session/event …）只在 agents 服务不可用时兜底：只有
   白名单里的“真的在干活”的事件算活动，turn/end、session/end-seed、dispose
   类事件立即清除；推断结果带 10 分钟 TTL，避免任何一个空闲事件把眼徽永久
   卡在“思考”（旧版就是 s随便一个 session/event 都算 running 导致的半闭眼）。 */
const MOOD_INFER_TTL_MS = 10 * 60 * 1000
const MOOD_THINK_WINDOW_MS = 2500
const MOOD_DONE_WINDOW_MS = 2400
const MOOD_DIAG_LIMIT = 60

/** 兜底模式下算作“有回合在跑”的会话事件。宽松的 session/title、模型选择、
    权限/沙箱设置等空闲事件一律不算，免得误判。 */
const MOOD_ACTIVITY_EVENTS = new Set([
  'turn/start',
  'step/start',
  'step/end',
  'assistant/attempt',
  'assistant/message',
  'request/header',
  'request/context',
  'tool/call',
  'tool/result',
  'tool/ptc-dispatch',
  'tool/ptc-dispatch-start',
  'system/message',
  'compaction/start',
  'compaction/summary',
  'approval/asked',
  'approval/decided',
])

/** 见到就把该会话判为 idle 的事件。 */
const MOOD_CLEAR_EVENTS = new Set(['turn/end', 'session/end-seed'])

/**
 * 创建 mood 状态机。返回 { mood, seen, snapshot(), diag(), events(), logPath }。
 * 拆出来是为了能脱离 webServer 单元测试。
 */
export function createMoodTracker(hostCtx) {
  const startedAt = Date.now()
  const mood = { running: false, since: 0, doneAt: 0 }
  const seen = { api: 0, agent: 0, stream: 0, session: 0, turn: 0 }
  /** id -> { running, at }：事件里看到的权威状态（仅兜底模式生效，带时间防陈旧） */
  const observed = new Map()
  /** id -> 最近活动时间：事件兜底推断（仅兜底模式生效） */
  const inferred = new Map()
  const eventTypes = new Map()
  const loggedTypes = new Set()
  const diag = []
  let source = 'events'
  let agents = []

  const logFile = join(CACHE, 'mood.log')
  let logReady = false
  const log = (entry) => {
    try {
      if (!logReady) {
        mkdirSync(CACHE, { recursive: true })
        logReady = true
      }
      appendFileSync(logFile, `${JSON.stringify({ t: new Date().toISOString(), ...entry })}\n`)
    } catch {}
  }
  const note = (entry) => {
    diag.push({ at: Date.now(), ...entry })
    while (diag.length > MOOD_DIAG_LIMIT) diag.shift()
  }
  const setRunning = (running, why) => {
    if (running === mood.running) return
    mood.running = running
    if (running) {
      mood.since = Date.now()
    } else {
      mood.doneAt = Date.now()
    }
    note({ kind: running ? 'run' : 'idle', why })
    log({ kind: running ? 'run' : 'idle', why, source, seen })
  }
  const service = (name) => {
    try {
      if (typeof hostCtx.get === 'function') {
        const found = hostCtx.get(name)
        if (found !== undefined) return found
      }
      return hostCtx[name]
    } catch {
      return undefined
    }
  }
  /** agents 服务可用 → 返回权威快照；不可用 → null（退回事件机）。 */
  const readAgents = () => {
    const registry = service('agents')
    if (!registry || typeof registry.list !== 'function') return null
    let live
    try {
      live = registry.list()
    } catch {
      return null
    }
    if (!Array.isArray(live)) return null
    const snapshot = []
    let running = false
    for (const agent of live) {
      if (!agent) continue
      let id = ''
      try {
        id = String(agent.id ?? agent.session?.id ?? '')
      } catch {}
      let status = 'unknown'
      try {
        if (typeof agent.status === 'string') {
          status = agent.status
        } else if (agent.phase && typeof agent.phase.kind === 'string') {
          status = agent.phase.kind === 'idle' || agent.phase.kind === 'maintenance' ? 'idle' : 'running'
        }
      } catch {}
      if (status === 'running') running = true
      snapshot.push({ id, status })
    }
    return { running, agents: snapshot }
  }
  const setObserved = (id, running) => {
    const key = String(id ?? '')
    if (!key) return
    observed.set(key, { running: Boolean(running), at: Date.now() })
    inferred.delete(key)
  }
  const infer = (id) => {
    const key = String(id ?? '')
    if (!key || observed.has(key)) return
    inferred.set(key, Date.now())
  }
  const refreshEvents = (now) => {
    let running = false
    for (const [id, state] of observed) {
      if (now - state.at > MOOD_INFER_TTL_MS) observed.delete(id)
      else if (state.running) running = true
    }
    if (!running) {
      for (const [id, at] of inferred) {
        if (now - at > MOOD_INFER_TTL_MS) inferred.delete(id)
        else running = true
      }
    }
    setRunning(running, 'events')
  }

  try {
    if (typeof hostCtx.on === 'function') {
      hostCtx.on('api-session/status', (sessionId, running) => {
        seen.api += 1
        setObserved(sessionId, running)
      })
      hostCtx.on('agent/status', (payload) => {
        seen.agent += 1
        setObserved(payload?.agent?.id, payload?.status === 'running')
      })
      hostCtx.on('agent/disposed', (payload) => {
        setObserved(payload?.agent?.id, false)
      })
      hostCtx.on('session/disposed', (session) => {
        setObserved(session?.id, false)
      })
      hostCtx.on('agent/assistant-stream', (payload) => {
        seen.stream += 1
        infer(payload?.agent?.id)
      })
      hostCtx.on('session/event', (session, event) => {
        seen.session += 1
        const id = session?.id
        const type = String(event?.type ?? '')
        if (type) {
          eventTypes.set(type, (eventTypes.get(type) ?? 0) + 1)
          if (!loggedTypes.has(type)) {
            loggedTypes.add(type)
            log({ kind: 'event', type, id: String(id ?? '') })
          }
        }
        if (MOOD_CLEAR_EVENTS.has(type)) {
          seen.turn += 1
          setObserved(id, false)
          return
        }
        if (MOOD_ACTIVITY_EVENTS.has(type)) infer(id)
      })
    }
  } catch {}

  const snapshot = () => {
    const now = Date.now()
    const authority = readAgents()
    if (authority) {
      source = 'agents'
      agents = authority.agents
      setRunning(authority.running, 'agent')
    } else {
      source = 'events'
      agents = []
      refreshEvents(now)
    }
    let state = 'idle'
    if (mood.running) {
      state = now - mood.since > MOOD_THINK_WINDOW_MS ? 'working' : 'thinking'
    } else if (mood.doneAt && now - mood.doneAt < MOOD_DONE_WINDOW_MS) {
      state = 'done'
    }
    return {
      mood: state,
      running: mood.running,
      elapsed: mood.running ? now - mood.since : 0,
      doneAt: mood.doneAt,
      source,
      agents,
      tracked: [...observed].filter(([, value]) => value.running).map(([id]) => id),
      inferred: [...inferred.keys()],
      seen,
      uptime: now - startedAt,
    }
  }

  return {
    mood,
    seen,
    snapshot,
    logPath: logFile,
    diag: () => [...diag],
    events: () => [...eventTypes].map(([type, count]) => ({ type, count })),
  }
}

export function apply(ctx) {
  const webServer = ctx.webServer
  if (!webServer) return

  const tracker = createMoodTracker(ctx)
  const mood = tracker.mood
  const moodSeen = tracker.seen

  /* 轮询热路径的短 TTL 缓存（见 MOOD_CACHE_MS / ENGINE_CACHE_MS / VOICE_CACHE_MS）。 */
  const moodMemo = createMemo(MOOD_CACHE_MS)
  const engineMemo = createAsyncMemo(ENGINE_CACHE_MS)
  const voiceMemo = createMemo(VOICE_CACHE_MS)
  const inspectVoice = () => voiceMemo(() => inspectVoiceDir(TTS_DIR))

  ctx.effect(() =>
    webServer.register({
      kind: 'exact',
      path: '/fairy-zzz/mood',
      handler: (req, res) => {
        const raw = String(req.url ?? '')
        /* diag=1 是人工排查入口：绕过缓存，永远现算。 */
        if (raw.includes('?')) {
          const url = new URL(raw, 'http://localhost')
          if (url.searchParams.get('diag') === '1') {
            moodMemo.clear()
            const payload = tracker.snapshot()
            payload.diag = tracker.diag()
            payload.events = tracker.events()
            payload.log = tracker.logPath
            sendJson(res, 200, payload)
            return
          }
        }
        sendJson(res, 200, moodMemo(() => tracker.snapshot()))
      },
    }),
  )

  ctx.effect(() =>
    webServer.register({
      kind: 'prefix',
      path: '/fairy-zzz/assets',
      handler: (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const rest = decodeURIComponent(url.pathname.slice('/fairy-zzz/assets'.length))
        const file = resolve(ASSETS, '.' + rest)
        if (!file.startsWith(ASSETS + sep)) {
          sendJson(res, 403, { error: 'forbidden' })
          return
        }
        return sendFile(req, res, file)
      },
    }),
  )

  ctx.effect(() =>
    webServer.register({
      kind: 'prefix',
      path: '/fairy-zzz/audio',
      handler: (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const rest = decodeURIComponent(url.pathname.slice('/fairy-zzz/audio'.length))
        if (!/^\/[a-f0-9]{40}\.wav$/.test(rest)) {
          sendJson(res, 404, { error: 'not found' })
          return
        }
        return sendFile(req, res, join(CACHE, rest.slice(1)))
      },
    }),
  )

  ctx.effect(() =>
    webServer.register({
      kind: 'exact',
      path: '/fairy-zzz/health',
      handler: async (req, res) => {
        syncVoiceHome()
        const engine = await engineMemo(() => engineState())
        sendJson(res, 200, {
          ok: true,
          engine: engine.up,
          engineState: engine.state,
          engineError: engine.error,
          engineHome: TTS_DIR,
          engineManaged: Boolean(engineChild),
          voiceHome: inspectVoice(),
          voice: 'Fairy · Ⅲ',
          speed: TTS_SPEED,
          on: typeof ctx.on,
          seen: moodSeen,
          mood: mood.running ? 'running' : 'idle',
        })
      },
    }),
  )

  ctx.effect(() =>
    webServer.register({
      kind: 'exact',
      path: '/fairy-zzz/voice-home',
      handler: async (req, res) => {
        syncVoiceHome()
        if (req.method !== 'POST') {
          sendJson(res, 200, { ok: true, ...inspectVoiceDir(TTS_DIR) })
          return
        }
        let body = {}
        try {
          body = JSON.parse(await readBody(req))
        } catch {
          sendJson(res, 400, { ok: false, reason: 'bad request' })
          return
        }
        const raw = cleanHome(body?.home)
        if (body?.probe) {
          sendJson(res, 200, inspectVoiceDir(raw))
          return
        }
        if (!raw) {
          try {
            rmSync(VOICE_HINT, { force: true })
          } catch {}
          syncVoiceHome()
          voiceMemo.clear()
          engineMemo.clear()
          sendJson(res, 200, { ok: true, ...inspectVoiceDir(TTS_DIR), cleared: true })
          return
        }
        const info = saveVoiceHome(raw)
        if (info.ok) {
          voiceMemo.clear()
          engineMemo.clear()
        }
        sendJson(res, info.ok ? 200 : 400, info)
      },
    }),
  )

  ctx.effect(() =>
    webServer.register({
      kind: 'exact',
      path: '/fairy-zzz/engine',
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const action = url.searchParams.get('action') || 'status'
        syncVoiceHome()
        try {
          if (action === 'start') {
            await ensureEngine()
            engineMemo.clear()
            sendJson(res, 200, { ok: true, engine: await engineState(), home: TTS_DIR })
            return
          }
          if (action === 'stop') {
            const stopped = await stopEngine()
            engineMemo.clear()
            sendJson(res, 200, { ok: true, stopped, engine: await engineState(), home: TTS_DIR })
            return
          }
          sendJson(res, 200, { ok: true, engine: await engineState(), home: TTS_DIR, managed: Boolean(engineChild) })
        } catch (cause) {
          sendJson(res, 500, { ok: false, error: String(cause?.message ?? cause), home: TTS_DIR })
        }
      },
    }),
  )

  ctx.effect(() =>
    webServer.register({
      kind: 'exact',
      path: '/fairy-zzz/tts',
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }
        let text = ''
        try {
          const body = JSON.parse(await readBody(req))
          text = cleanText(body?.text)
        } catch {
          sendJson(res, 400, { error: 'bad request' })
          return
        }
        if (!text) {
          sendJson(res, 400, { error: 'empty text' })
          return
        }
        const hash = createHash('sha1').update(text).digest('hex')
        const file = join(CACHE, `${hash}.wav`)
        const url = `/fairy-zzz/audio/${hash}.wav`
        try {
          if ((await sizeOf(file)) > 0) {
            sendJson(res, 200, { ok: true, url, cached: true })
            return
          }
          let job = pending.get(hash)
          if (!job) {
            await mkdir(CACHE, { recursive: true })
            job = synthesize(text, file).finally(() => pending.delete(hash))
            pending.set(hash, job)
          }
          const data = await job
          /* 这次合成可能顺手把引擎拉起来了：让 /health 立刻反映新状态。 */
          engineMemo.clear()
          sendJson(res, 200, { ok: true, url, cached: false, seconds: data?.seconds ?? 0 })
        } catch (cause) {
          sendJson(res, 502, { error: String(cause?.message ?? cause) })
        }
      },
    }),
  )
}
