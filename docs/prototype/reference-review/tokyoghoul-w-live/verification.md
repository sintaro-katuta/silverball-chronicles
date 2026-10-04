# W本編接続・今回の検証

2026-10-02。完全実機一致の証明ではない。世界観と演出は月影機関。SEなし。クラウド更新なし。

- charge.json / charge.mp4: CHARGE 300、実入賞20個×15、通常復帰を録画。最初のヘソ2球のみ有料発射した球を入口直上へ配置、以後は自然発射。当選は確認用に固定。40秒前後、pageerror0、最終収支一致。
- normal.json / normal.mp4: 同じヘソ2球fixture、通常1500個→RUSH突入→普図消化まで110秒。本編の払出/復帰を確認。pageerror0、最終収支一致。
- rush.json / rush.mp4: 初期RUSHと最初の当選だけを固定。全て0.6秒の自然発射、玉位置変更/入賞call注入なし。電チュー2球→V2回→実入賞による1500×2=3000個→RUSH継続。一般賞球は3000とは別計数。185秒、pageerror0、収支一致。
- mobile-check.json / mobile-*.png:390×844でメニューpauseの全snapshot凍結、resumeで進行、終了後新規開始。visibilitychangeとBFCacheは合成イベントによる経路検証で、実際のOSタブ切替/BFCache採用の確認ではない。
- デザイナーのframe-review.json:旧矩形金枠の残存を修正後、3条件で文字切れなし。

実機動画 gqHt1D4aMD0 の06:00と07:20を追加静止確認。左釘/手前ロゴの遮蔽は見えるが、下部字幕がワープ/ステージの球路を隠すため、内部再現の新根拠には採用しない。

残項目は ../tokyoghoul-w-analysis/completeness-audit.md 。特に開放秒数、普図保留容量、V内部、ワープ/ステージ、奥行き、釘個別採寸の一致を未完成のまま隠さない。
