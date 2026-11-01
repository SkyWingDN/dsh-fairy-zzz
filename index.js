import { appendFileSync, createReadStream, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import zlib from 'node:zlib'

/**
 * Fairy Ⅲ · H.D.D Skin — Host half.
 *
 *   GET  /fairy-zzz/assets/<file>   boot-opt.mp4 / poster.jpg / hero.webp / icon-180.png / voice/greet-*.mp3
 *   GET  /fairy-zzz/audio/<hash>.wav synthesized voice cache (Range capable)
 *   POST /fairy-zzz/tts             { text } -> { url, cached, seconds }
 *   GET  /fairy-zzz/mood            { mood } -> idle | thinking | working | done
 *   GET  /fairy-zzz/voice-home      { ok, home, source, reason }
 *   POST /fairy-zzz/voice-home      { home, probe? } -> 保存/校验引擎目录
 *   GET  /fairy-zzz/engine          { phase, home, error } -> 本地语音引擎状态
 *   POST /fairy-zzz/engine          { action: 'start' | 'stop' }
 *   GET  /fairy-zzz/health          { ok, engine, voice }
 *   GET  /fairy-zzz/usage           { ok, now, peak, today, turn } -> 今日用量 / 花费 / 峰谷价
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
/* 用量气泡是点击才请求，但一次要扫最近两天的会话日志；给 3000ms 缓存，峰谷倒计时
   用绝对的 nextAt，客户端自己按秒走，缓存不会影响显示。 */
const USAGE_CACHE_MS = 3000

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

let enginePromise = null
let engineChild = null
/* 引擎代际：stop 或「新一次启动」都会 +1。启动循环每轮都核对代际，发现变了
   立刻中止；否则 stop 之后旧循环还会把 promise 解成 true，下一个请求就会以为
   引擎可用，再拉起一个进程（重复进程 / 端口冲突）。 */
let engineGen = 0

function ensureEngine() {
  syncVoiceHome()
  if (!enginePromise) {
    const gen = ++engineGen
    const holder = {}
    const task = (async () => {
      const state = await engineState()
      if (gen !== engineGen) throw new Error('语音引擎启动已取消（引擎状态已变更）')
      if (state.up) return true
      if (!existsSync(TTS_PY) || !existsSync(TTS_SERVER)) {
        throw new Error(TTS_DIR ? `语音引擎不完整：${TTS_DIR}（请在 设置 → Fairy 里重新指定目录）` : '还没有指定语音引擎目录（设置 → Fairy → 语音引擎目录）')
      }
      /* 之前拉起的进程还活着但不应答：先杀掉再重来，避免两个进程抢同一个端口。 */
      const stale = engineChild
      if (stale && stale.exitCode === null && stale.signalCode === null) {
        try {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', String(stale.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true })
          } else {
            stale.kill('SIGTERM')
          }
        } catch {}
        engineChild = null
      }
      const logFile = join(TTS_DIR, 'server.log')
      let out = 'ignore'
      try {
        out = openSync(logFile, 'a')
      } catch {}
      if (gen !== engineGen) throw new Error('语音引擎启动已取消（引擎状态已变更）')
      const child = spawn(TTS_PY, [TTS_SERVER, '--port', String(TTS_PORT)], {
        detached: true,
        stdio: ['ignore', out, out],
        cwd: TTS_DIR,
        windowsHide: true,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
      child.unref()
      engineChild = child
      /* 进程没了（含 TTS 服务 300s 空闲自杀 / 崩溃）必须清掉缓存的 promise 和
         child，否则之后每次 /tts 都拿旧的「已启动」直接 502，只能手动 stop/start。 */
      const release = () => {
        if (engineChild === child) engineChild = null
        if (holder.task && enginePromise === holder.task) enginePromise = null
      }
      child.once('exit', release)
      child.on('error', release)
      for (let tick = 0; tick < 180; tick += 1) {
        await sleep(1000)
        if (gen !== engineGen) throw new Error('语音引擎启动已取消（引擎状态已变更）')
        const now = await engineState()
        if (gen !== engineGen) throw new Error('语音引擎启动已取消（引擎状态已变更）')
        if (now.up) return true
        if (child.exitCode !== null && child.exitCode !== undefined) break
      }
      throw new Error('语音引擎启动超时（日志见 voice/server.log）')
    })()
    holder.task = task
    enginePromise = task
    task.catch(() => {
      if (enginePromise === task) enginePromise = null
    })
  }
  return enginePromise
}

async function stopEngine() {
  /* 代际 +1：让还在跑的启动循环立刻作废，而不是等它 180s 超时后
     再把 promise 解成 true。 */
  engineGen += 1
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
    /* 引擎可能在 ensureEngine 返回「已启动」之后、fetch 之前挂掉（崩溃 / 空闲
       自杀）：这时缓存的 promise 已过时，清掉它重来一次；只重试一次。 */
    for (let attempt = 0; ; attempt += 1) {
      await ensureEngine()
      let res
      try {
        res = await fetch(`http://127.0.0.1:${TTS_PORT}/tts`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, out: file, speed: TTS_SPEED }),
          signal: AbortSignal.timeout(240_000),
        })
      } catch (cause) {
        if (attempt >= 1) throw cause
        enginePromise = null
        continue
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok) return data
      const cause = new Error(`tts ${res.status}: ${data.error ?? 'unknown'}`)
      /* 5xx 多半是引擎正在启动 / 重启（或刚被 kill），重试一次；4xx 是文本问题不重试。 */
      if (res.status >= 500 && attempt < 1) {
        enginePromise = null
        continue
      }
      throw cause
    }
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


/* ---------------------------------------------------------------- 用量与花费
   数据源：<DSH_HOME>/sessions/<项目>/<会话>/session.v4.jsonl.zstd（DSH_HOME 未
   设置时退回 ~/.dsh，与上游一致）。日志是多帧 zstd 拼接，逐帧解压后每行一个
   事件；只有 assistant/message 事件带 data.usage，字段
   { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens }。
   宿主写日志是纯追加：活跃会话的日志会持续变长（本机实测单文件 6MB，每次全量
   重解约 240ms），所以缓存里额外记住解析到哪一帧，文件变长时只解压新帧。 */
const DSH_ROOT = process.env.DSH_HOME || join(homedir(), '.dsh')
const SESSIONS_ROOT = join(DSH_ROOT, 'sessions')

/* DeepSeek 官方价目（元 / 百万 token），下标 0 = 空闲时段，1 = 高峰时段 */
const PRICES = {
  'deepseek-flash': { hit: [0.02, 0.04], miss: [1, 2], out: [4, 8] },
  'deepseek-v4-pro': { hit: [0.15, 0.3], miss: [4.5, 9], out: [13.5, 27] },
}
const DEFAULT_PRICE = PRICES['deepseek-flash']

/* 高峰：北京时间 周一至周五 09:00–12:00、14:00–18:00（不含中国法定节假日）；
   其余时间——含周末、法定节假日全天——一律空闲，价格是高峰的一半。
   规则出处：https://api-docs.deepseek.com/zh-cn/quick_start/pricing */
const BJ_OFFSET = 8 * 60 * 60 * 1000
const PEAK_RANGES = [[9 * 60, 12 * 60], [14 * 60, 18 * 60]]

/* 2026 年法定节假日（国办发明电〔2025〕，首尾都算）。新年份要补一行，缺年份时按纯工作日算。 */
const HOLIDAY_RANGES = [
  ['2026-01-01', '2026-01-03'], // 元旦
  ['2026-02-15', '2026-02-23'], // 春节
  ['2026-04-04', '2026-04-06'], // 清明节
  ['2026-05-01', '2026-05-05'], // 劳动节
  ['2026-06-19', '2026-06-21'], // 端午节
  ['2026-09-25', '2026-09-27'], // 中秋节
  ['2026-10-01', '2026-10-07'], // 国庆节
]
const HOLIDAY_DAYS = new Set()
for (const [from, to] of HOLIDAY_RANGES) {
  for (let t = Date.parse(from + 'T00:00:00Z'); t <= Date.parse(to + 'T00:00:00Z'); t += 86_400_000) {
    HOLIDAY_DAYS.add(new Date(t).toISOString().slice(0, 10))
  }
}

/* 把时刻换算成北京时间的日期 / 星期 / 当天分钟数 */
function beijingStamp(ms) {
  const d = new Date(ms + BJ_OFFSET)
  return {
    date: d.toISOString().slice(0, 10),
    weekday: d.getUTCDay(),
    minute: d.getUTCHours() * 60 + d.getUTCMinutes(),
  }
}

function isPeakAt(ms) {
  const s = beijingStamp(ms)
  if (s.weekday === 0 || s.weekday === 6) return false
  if (HOLIDAY_DAYS.has(s.date)) return false
  return PEAK_RANGES.some(([from, to]) => s.minute >= from && s.minute < to)
}

/* 下一次换价：逐分钟找第一个状态翻转的整分（最长间隔是周五 18:00 → 周一 09:00，7 天足够）。
   从「当前时刻所在的整分」开始比对：上游从下一分钟才开始查，08:59:30 → 09:00:00 这种
   整分翻价点会晚一分钟，客户端倒计时和换价刷新也跟着晚一分钟。 */
function nextPeakFlip(ms) {
  const current = isPeakAt(ms)
  let t = Math.ceil(ms / 60_000) * 60_000
  const limit = t + 7 * 86_400_000
  while (t < limit) {
    if (isPeakAt(t) !== current) return t
    t += 60_000
  }
  return t
}

function peakState(now = new Date()) {
  const time = now.getTime()
  const offPeak = !isPeakAt(time)
  const flipAt = nextPeakFlip(time)
  const remainMs = Math.max(0, flipAt - time)
  const next = new Date(flipAt + BJ_OFFSET)
  const hh = String(next.getUTCHours()).padStart(2, '0')
  const mm = String(next.getUTCMinutes()).padStart(2, '0')
  return {
    offPeak,
    label: offPeak ? '空闲时段' : '高峰时段',
    window: '工作日 09–12、14–18 高峰',
    remainMs,
    nextAt: flipAt,
    nextClock: hh + ':' + mm,
    next: formatLeft(remainMs) + '后转' + (offPeak ? '高峰' : '空闲') + '价',
  }
}

/* 剩余时长：3 小时 12 分 / 47 分 / 不到 1 分 */
function formatLeft(ms) {
  const total = Math.max(0, Math.round(ms / 60_000))
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours && minutes) return hours + ' 小时 ' + minutes + ' 分'
  if (hours) return hours + ' 小时'
  if (minutes) return minutes + ' 分'
  return '不到 1 分'
}

const ZSTD_MAGIC = [0x28, 0xb5, 0x2f, 0xfd]
const USAGE_CACHE_MAX = 256
/* 日志路径 -> { mtimeMs, size, events, parsedTo }。
   parsedTo 是下次接着解压的字节位置（一定是某个帧的起点）；=== size 表示已解完。 */
const usageCache = new Map()

function sessionFiles() {
  const out = []
  let projects = []
  try {
    projects = readdirSync(SESSIONS_ROOT, { withFileTypes: true })
  } catch {
    return out
  }
  for (const project of projects) {
    if (!project.isDirectory()) continue
    const dir = join(SESSIONS_ROOT, project.name)
    let sessions = []
    try {
      sessions = readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const session of sessions) {
      if (!session.isDirectory()) continue
      const file = join(dir, session.name, 'session.v4.jsonl.zstd')
      if (existsSync(file)) out.push(file)
    }
  }
  return out
}

/* 按 zstd 帧结构（RFC 8878）算出从 start 开始一帧的字节长度：magic + 帧头 +
   block 头 + block 数据 + 可选 checksum。返回 -1 表示没写完 / 不是帧起点。
   不能只靠「试解压」判断帧界：raw block 被截断时 zstdDecompressSync 也会返回
   部分数据而不报错，假帧头会被当成真帧界，parsedTo 就卡死在压缩 payload 里。 */
function zstdFrameLength(buf, start) {
  const size = buf.length
  if (start + 4 > size) return -1
  if (buf[start] !== ZSTD_MAGIC[0] || buf[start + 1] !== ZSTD_MAGIC[1] || buf[start + 2] !== ZSTD_MAGIC[2] || buf[start + 3] !== ZSTD_MAGIC[3]) return -1
  let p = start + 4
  if (p + 1 > size) return -1
  const descriptor = buf[p]
  p += 1
  const fcsFlag = descriptor >> 6
  const singleSegment = (descriptor >> 5) & 1
  const hasChecksum = (descriptor >> 2) & 1
  const dictFlag = descriptor & 3
  if (!singleSegment) {
    if (p + 1 > size) return -1
    p += 1 /* Window_Descriptor */
  }
  p += [0, 1, 2, 4][dictFlag] /* Dictionary_ID */
  let fcsSize = 0
  if (fcsFlag === 0) fcsSize = singleSegment ? 1 : 0
  else if (fcsFlag === 1) fcsSize = 2
  else if (fcsFlag === 2) fcsSize = 4
  else fcsSize = 8
  p += fcsSize
  for (;;) {
    if (p + 3 > size) return -1
    const header = buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16)
    const last = header & 1
    const type = (header >> 1) & 3
    const blockSize = header >> 3
    p += 3
    if (type === 0 || type === 2) p += blockSize
    else if (type === 1) p += 1
    else return -1 /* reserved block type */
    if (last) break
    if (p > size) return -1
  }
  if (hasChecksum) p += 4
  return p > size ? -1 : p - start
}

/* 解一份日志，只留用量事件（避免把工具输出全塞进内存）。日志只追加，所以文件
   变长时从上次没解开的帧接着解；只有首次 / 文件被重写时才整份重解。
   pruneBefore > 0 时只保留该时刻之后的事件（collectUsage 传当天 0 点，长期驻留的
   宿主不会把历史会话全攒在内存里）。导出：验收脚本可直接调用。 */
export function readUsageEvents(file, known, pruneBefore = 0) {
  let st = known
  if (!st) {
    try {
      st = statSync(file)
    } catch {
      return []
    }
  }
  const cached = usageCache.get(file)
  if (cached && cached.mtimeMs === st.mtimeMs && cached.size === st.size) {
    /* 跨天：缓存是昨天剪过的，今天第一次读时把旧事件再剪一次。 */
    if (pruneBefore > 0 && cached.pruneBefore !== pruneBefore) {
      cached.events = cached.events.filter((ev) => ev.time >= pruneBefore)
      cached.pruneBefore = pruneBefore
    }
    return cached.events
  }
  /* 宿主 Node 没有 zstd 能力时（旧 Electron）静默退回空用量：峰谷仍然可用。 */
  if (typeof zlib.zstdDecompressSync !== 'function') return []

  let buf
  try {
    buf = readFileSync(file)
  } catch {
    return []
  }
  const size = buf.length
  /* 增量条件：同一文件、只变长、续解位置恰好是帧起点；否则整份重解。 */
  let from = 0
  let events = []
  if (cached && size > cached.size && cached.parsedTo >= 0 && cached.parsedTo < size) {
    const at = cached.parsedTo
    if (buf[at] === ZSTD_MAGIC[0] && buf[at + 1] === ZSTD_MAGIC[1] && buf[at + 2] === ZSTD_MAGIC[2] && buf[at + 3] === ZSTD_MAGIC[3]) {
      from = at
      events = cached.events
    }
  }

  /* 逐帧按结构走：payload 里偶然出现的 magic 字节不再影响帧界；
     最后一帧没写完（或文件损坏）时停在它的真实起点，下次从 parsedTo 接着解。 */
  let parsedTo = size
  let cursor = from
  while (cursor < size) {
    const frameLen = zstdFrameLength(buf, cursor)
    if (frameLen < 0) {
      parsedTo = cursor
      break
    }
    let text = ''
    try {
      text = zlib.zstdDecompressSync(buf.subarray(cursor, cursor + frameLen)).toString('utf8')
    } catch {
      /* 完整帧都解不开 = 文件损坏：停在这里，别把 parsedTo 推进到坏数据里。 */
      parsedTo = cursor
      break
    }
    for (const line of text.split('\n')) {
      if (!line) continue
      let ev
      try {
        ev = JSON.parse(line)
      } catch {
        continue
      }
      if (ev?.type !== 'assistant/message') continue
      const usage = ev?.data?.usage
      const time = ev?.time
      if (!usage || typeof time !== 'number') continue
      events.push({
        time,
        turn: ev?.data?.turn,
        model: ev?.data?.message?.source?.model || '',
        input: Number(usage.inputTokens) || 0,
        output: Number(usage.outputTokens) || 0,
        hit: Number(usage.cacheReadTokens) || 0,
        write: Number(usage.cacheWriteTokens) || 0,
      })
    }
    cursor += frameLen
  }
  if (pruneBefore > 0 && events.length > 0) {
    events = events.filter((ev) => ev.time >= pruneBefore)
  }

  while (usageCache.size >= USAGE_CACHE_MAX && !usageCache.has(file)) {
    const oldest = usageCache.keys().next()
    if (oldest.done) break
    usageCache.delete(oldest.value)
  }
  usageCache.set(file, { mtimeMs: st.mtimeMs, size, events, parsedTo, pruneBefore })
  return events
}

function emptyBucket(extra) {
  return { hit: 0, miss: 0, out: 0, cost: 0, calls: 0, ...extra }
}

/* 每一笔都按它自己发生的那一刻计价：白天跑的算高峰价，夜里补跑的算空闲价 */
function addToBucket(bucket, ev) {
  const price = PRICES[ev.model] || DEFAULT_PRICE
  const priceIndex = isPeakAt(ev.time) ? 1 : 0
  const miss = ev.input + ev.write
  bucket.hit += ev.hit
  bucket.miss += miss
  bucket.out += ev.output
  bucket.calls += 1
  bucket.cost += (ev.hit * price.hit[priceIndex] + miss * price.miss[priceIndex] + ev.output * price.out[priceIndex]) / 1e6
}

/* 最近一次扫描的统计，只给 /usage?diag=1 排查用 */
let usageLastRun = { at: 0, files: 0, recent: 0, ms: 0 }

/* 导出：单元 / 验收脚本可以直接调用（与 createMoodTracker 同理）。 */
export function collectUsage() {
  const started = Date.now()
  const now = new Date()
  const stamp = beijingStamp(now.getTime())
  const todayStart = Date.parse(stamp.date + 'T00:00:00+08:00')
  const peak = peakState(now)

  const today = emptyBucket()
  let total = 0
  let recent = 0
  let latest = null
  for (const file of sessionFiles()) {
    total += 1
    let st
    try {
      st = statSync(file)
    } catch {
      continue
    }
    /* 两天内没动过的日志不可能有今天的用量，跳过，省掉解压 */
    if (st.mtimeMs < todayStart - 2 * 86400000) continue
    recent += 1
    const events = readUsageEvents(file, st, todayStart)
    if (latest === null || st.mtimeMs > latest.mtimeMs) latest = { file, mtimeMs: st.mtimeMs, events }
    for (const ev of events) {
      if (ev.time < todayStart) continue
      addToBucket(today, ev)
    }
  }

  let turn = null
  if (latest && latest.events.length > 0) {
    const last = latest.events[latest.events.length - 1]
    if (typeof last.turn === 'number') {
      turn = emptyBucket({ turn: last.turn })
      for (const ev of latest.events) {
        if (ev.turn === last.turn) addToBucket(turn, ev)
      }
    }
  }

  usageLastRun = { at: Date.now(), files: total, recent, ms: Date.now() - started }
  return { ok: true, now: now.getTime(), peak, today, turn }
}

function usageDiagnostics() {
  return {
    root: SESSIONS_ROOT,
    zstd: typeof zlib.zstdDecompressSync === 'function',
    cached: usageCache.size,
    files: usageLastRun.files,
    recent: usageLastRun.recent,
    ms: usageLastRun.ms,
    at: usageLastRun.at,
  }
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
  const usageMemo = createMemo(USAGE_CACHE_MS)
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
        let rest = ''
        try {
          rest = decodeURIComponent(url.pathname.slice('/fairy-zzz/assets'.length))
        } catch {
          /* 坏 % 转义：当作资源不存在（404），别让 URIError 冒出去变成 400。 */
          sendJson(res, 404, { error: 'not found' })
          return
        }
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
        let rest = ''
        try {
          rest = decodeURIComponent(url.pathname.slice('/fairy-zzz/audio'.length))
        } catch {
          sendJson(res, 404, { error: 'not found' })
          return
        }
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
      path: '/fairy-zzz/usage',
      handler: (req, res) => {
        const raw = String(req.url ?? '')
        /* diag=1 是人工排查入口：绕过缓存，附上日志目录 / zstd 可用性 / 扫描耗时。 */
        let diag = false
        if (raw.includes('?')) {
          const url = new URL(raw, 'http://localhost')
          diag = url.searchParams.get('diag') === '1'
        }
        if (diag) usageMemo.clear()
        try {
          const payload = usageMemo(() => collectUsage())
          sendJson(res, 200, diag ? { ...payload, diag: usageDiagnostics() } : payload)
        } catch (cause) {
          sendJson(res, 500, { ok: false, error: String(cause?.message ?? cause) })
        }
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
