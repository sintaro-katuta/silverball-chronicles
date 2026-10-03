# PM gather restitution .7 in-memory candidate

Candidate only; product unchanged. pins.slice(36,63) = gather27 centers/radii unchanged; restitution .46→.7. Standard .6s, default.24,300+45s. Source before/after matched.

| delay ticks | spawned | nearHeso | admission | per100 | max admission gap including leading/trailing shoot period | remain |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 498 | 39 | 13 | 2.61 | 71.43s | 0 |
| 21 | 498 | 33 | 8 | 1.61 | 111.26s | 0 |
| 42 | 499 | 33 | 4 | 0.80 | 114.66s | 0 |

All three phase counts improve from baseline8/3/2 to13/8/4, but candidate4〜8/100 expectation is not met (2.61/1.61/.80). This is a modest consistent increase; target remains provisional, adoption is not inferred. No actual-machine coefficient or rate is verified.

## 実装後同値確認（中間候補）

製品gather .7版の位相3は13/8/4でin-memory候補と同値。7power長期は.20=8,.22=4,.23=1,.24=13,.25=5,.26=2,.28=0で、低強度/隣接.23は減る。全条件増加や十分回るとの受入はしない。rail10条件cross/overlap/drain0、continuity5/pageerror0成功。mouth高さの追加候補へ進むため、ここまでのpm-final-*はpm-gather-only-*へ改名し最終成功に流用しない。source各試験前後一致。
