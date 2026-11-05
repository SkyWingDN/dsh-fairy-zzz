#!/usr/bin/env node
/* 把 docs/skin/wire-net-terminal.css 内联回 client.js 的 CSS 模板。
 *
 * client.js 是单文件产物：CSS 模板 = 插件自带基础样式 + 「绳网终端」皮肤层。
 * 皮肤层（模板里 v1.7.0 注释起，到模板结尾反引号为止）由本脚本维护，
 * 不要手改 client.js 里的这一段；改皮肤只改 docs/skin/wire-net-terminal.css，
 * 然后运行： node scripts/build-client.mjs
 *
 * 校验：内联后的 client.js 必须通过 node --check，且内联结果可复现。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const clientPath = join(root, 'client.js');
const cssPath = join(root, 'docs', 'skin', 'wire-net-terminal.css');
const checkOnly = process.argv.includes('--check');

/* 皮肤层起点：模板里的 v1.7.0 注释头；终点：CSS 模板的收尾反引号。
   两处标记在 client.js 中各只出现一次，缺失或重复都直接报错，避免误替换。 */
const START = '/* ==================================================================\n * v1.7.0 — 「绳网终端 / WIRE-NET TERMINAL」宿主皮肤层';
const END = '\n`\n\n    /* ------------------------------------------------------------------ *\n     * 图标';

const source = readFileSync(clientPath, 'utf8');
const cssRaw = readFileSync(cssPath, 'utf8');

if (cssRaw.includes('`') || cssRaw.includes('${') || cssRaw.includes('\\')) {
  throw new Error('wire-net-terminal.css 含反引号 / 模板插值 / 反斜杠，无法安全内联进模板字符串');
}

const startCount = source.split(START).length - 1;
const endCount = source.split(END).length - 1;
if (startCount !== 1 || endCount !== 1) {
  throw new Error('client.js 皮肤段标记异常：start=' + startCount + ' end=' + endCount + '（应各为 1）');
}

const startIdx = source.indexOf(START);
const endIdx = source.indexOf(END);
if (endIdx <= startIdx) throw new Error('client.js 皮肤段标记顺序错误');

/* 模板现状：起始注释 ... 规则 ... 空行 + 反引号收尾。
   新内容保持同样形状：css 去掉尾部空行，补一个空行后接反引号。 */
const body = cssRaw.replace(/^\n+/, '').trimEnd() + '\n\n';
const next = source.slice(0, startIdx) + body + source.slice(endIdx + 1);

if (next === source) {
  console.log('client.js 已是最新，无需改动。');
  process.exit(0);
}
if (!checkOnly) writeFileSync(clientPath, next);
console.log('已内联 ' + basename(cssPath) + '：' + cssRaw.length + ' B，client.js ' + source.length + ' -> ' + next.length + ' B');

/* 产物必须是可解析的 JS */
execFileSync(process.execPath, ['--check', clientPath], { stdio: 'inherit' });

if (!checkOnly) {
  const again = readFileSync(clientPath, 'utf8');
  if (again !== next) throw new Error('client.js 写入后读回不一致');
  const stable = again.replace(body, body) === again;
  if (!stable) throw new Error('unreachable');
}
console.log('node --check 通过。');
