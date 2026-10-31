# Launch return regression, 2026-10-24

Read docs/agile/S8_LAUNCH_RETURN_FIX.md. Base: bda2707. The previous presentation allowed 354/750 returns and is explicitly rejected.

summary.json contains all final-v3 trial summaries, current source SHA256 and intermediate failures. Seven final conditions total 950 launches with zero returns, residual balls, cross-plane pairs and front LCD intrusions. Raw per-condition result.json/frames.json.gz and diagnostic contact captures remain local; earlier failure folders are preserved. Re-run tools/s8-launch-return.mjs from a fresh artifact directory; it refuses overwrites.

This is a mechanical fixture. It is separate from the real browser session and from lottery/payout verification. Current visual verification used the final reloaded production page in Brave, PC viewport 1702×974; smartphone hardware and hinge inertia are unverified. Build logs have trailing whitespace normalized.
