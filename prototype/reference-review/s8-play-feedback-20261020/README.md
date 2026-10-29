# Sprint 8 play-feedback evidence (2026-10-20)

Local prototype based on `16084d9`, final case `guarded2`. Read `docs/agile/S8_PLAY_FEEDBACK_REVIEW.md` for scope, comparison limits and remaining issues. This is a mechanical fixture, not a real-machine rate or lottery/payout validation.

- `summary.json`: all 20 trial summaries, including failed cases. Final guarded2 normal: 3×250 launches; RUSH/BONUS: 50 each.
- `verification-summary.json`, `unit-tests.log`, `build.log`, `preview-build.log`, `audio-browser.log`: final checks (trailing whitespace normalized in build logs).
- `browser-rendered/verification.json`: current rendered source, two widths, real physics launches with a specified losing draw fixture, pause/resume and view changes. Local PNG/WebM captures share this directory (ignored by git).
- `physics-source-final/{manifest,current-check}.json`: 8 physical source files unchanged after measurement; the final overlap correction only touches the foreground drawing.

Raw per-trial `result.json`/`frames.json.gz`, launch probes, frozen physical source copies and the earlier `browser/` captures remain locally in this directory. Source-controlled summaries retain provenance; do not substitute earlier captures for the current rendered result. The measurement script refuses to overwrite an existing result. To reproduce, use a fresh checkout/artifact directory with the same source and run, for example:

```
node prototype/tools/s8-play-feedback.mjs guarded2 normal 0.35 250
cd prototype
node tools/s8-play-feedback.browser.mjs rendered
```

The browser server defaults to http://127.0.0.1:5460 (override with REVIEW_URL).
