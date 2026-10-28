# Third-party notice — dsh-fairy-zzz (modified edition)

This repository is a **modified, unofficial edition** of
[fairy-zzz-plugin](https://github.com/AssassinVIX/fairy-zzz-plugin) (MIT),
maintained by [SkyWingDN](https://github.com/SkyWingDN). The original DSH
plugin and its client/host code are Copyright (c) 2026 dsh-fairy-zzz
contributors (AssassinVIX); modifications in this repository are
Copyright (c) 2026 SkyWingDN and released under the same MIT license
(see LICENSE).

## Fairy-DSH (Apache-2.0) attribution

Parts of `client.js` are adapted from **Fairy-DSH** by Chengzhibense,
released under the Apache License, Version 2.0:

- Source: https://github.com/Chengzhibense/Fairy-DSH
- Commit: `d639887a386b0de6fef2e61c97dc268631854591`
- Source directory: `fairy-visual/dsh-fairy-visual/src/client/`
- Copyright 2026 Chengzhibense.

The following parts are adapted/ported from that source:

- `FAIRY_EYE_SVG` — eye geometry, gradients, colors and layer order
  (from `mascot-geometry.js` / `mascot-eye-svg.js`), inlined as a padded SVG;
- the clip-based thinking eyelid, the four-layer eye breathing, the 15 s lash
  rotation, the flicker/glitch parameters and the idle-motion clock/event
  scheduler in the client runtime (from `mascot-runtime.js`,
  `mascot-motion-clock.js`, `mascot-event-scheduler.js`);
- the animation timings/parameters documented in the reference video
  [BV1SD4C63EZz](https://www.bilibili.com/video/BV1SD4C63EZz/) by 橙汁本色
  (the same author's Fairy-DSH project).

Apache-2.0 license text: `licenses/Apache-2.0.txt`.
Upstream NOTICE: `licenses/Fairy-DSH-NOTICE.txt`.
Upstream trademark/content limitations: `licenses/Fairy-DSH-TRADEMARKS.md`.

## Modifications made in this edition (summary)

Performance work done by SkyWingDN with DeepSeek Harness (see
`docs/PERFORMANCE.md` for measurements):

- replaced the frame-by-frame JS animation runtime with CSS-driven animations
  (no resident `requestAnimationFrame` loop);
- turned the thinking eyelid into a static half-closed shape: the per-frame
  SVG `clipPath` animation was the single largest main-thread cost and was
  removed; the eyelid still appears while an agent runs, it simply does not
  breathe;
- reimplemented the eye halo / atmosphere glow / flash as static gradients
  instead of per-frame `drop-shadow` / `blur()` re-rasterisation;
- boot stage: one `boot-opt.mp4` instead of two simultaneous decodes, no
  full-screen `blur(46px)` backfill, progress bar writes to the DOM instead of
  re-rendering React every frame;
- compressed media (`boot-opt.mp4` 2.3 MB, `hero.webp` 23 KB, greeting clips
  as MP3) — runtime payload down from ~9 MB to ~2.9 MB;
- host server: strong ETag/Last-Modified + 304, Range/If-Range, immutable
  caching for `cache/` audio and short-TTL memoisation for `/mood`,
  `/engine`, `/voice-home`;
- polling (mood/health) pauses while the page is hidden; dock positioning no
  longer measures every `div/main/section` on a timer.

## Assets, voice and trademark

- The boot clip, the poster frame, the character likeness and the `Fairy` /
  Zenless Zone Zero names belong to miHoYo / HoYoverse. This is an unofficial
  fan reskin for personal desktops — **not for commercial use**.
- The pre-recorded greeting clips are fan-made/synthesized audio shipped only
  for the demo greeting.
- **This repository does not contain GPT-SoVITS, model weights, reference
  audio or any voice engine.** To read replies aloud, deploy your own local
  GPT-SoVITS + Fairy voice model and point the plugin at it (see README).
- No third-party source dependencies are bundled; the plugin only uses the
  slots and web server provided by DeepSeek Harness at runtime.
