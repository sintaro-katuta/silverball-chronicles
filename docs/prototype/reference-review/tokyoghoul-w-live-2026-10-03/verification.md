# 2026-10-03 引継ぎ後の最新実動証拠

直下の4動画とJSONは、101釘への採寸訂正・右4連結線撤去・接触校正・発射内周arcの平面除外を含む最終製品ソースで撮影。`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/source-sha256.txt` の8ファイルは録画後も一致。ローカルのみ、SE追加なし、動画は無音・等速。これは実機との完全一致の証明ではない。

## 動画の条件と結果

| 動画 | 長さ（開始操作含む） | 条件と結果 |
|---|---:|---|
| left.mp4 | 42.44秒 | 自然左発射、当選結果を外れ固定。玉位置変更なし。最終56発射、41OUT・11返却・4残球。短窓のヘソ/一般賞球は0、入賞率一致の証拠とはしない |
| charge.mp4 | 43.32秒 | 最初のヘソ2有料玉のみ入口直上へ配置、当選固定。その後自然発射。20アタッカー入賞で300、一般賞球18は別。CHARGEから通常復帰 |
| normal.mp4 | 115.68秒 | 同じヘソ2玉fixtureと当選固定、その後自然発射。100アタッカー入賞で1500、一般52は別。RUSHへ入り普図消化 |
| rush.mp4 | 189.24秒 | 初期RUSH/最初の当選だけfixture、全球自然発射・位置変更/入賞callback注入なし。電チュー2、V2、200アタッカー入賞で1500×2=3000、一般90は別。RUSH継続 |

全4本のpageerror0・物理球数・持玉収支一致を `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/video-count-summary.json` で新たに検査。`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/video-metadata.json` はffprobeの結果。終了時の盤面上玉は映像の残球であり、発射停止後の排出確認は別の9条件試験に分ける。

## 修正と回帰

右5釘の間に残っていた半径.7の4連結接触線を撤去。原図採寸により左70+左道26+右道5=101点、ヘソ2点/右寄り3点の役割判定も共通座標へ同期。

新採寸後に実際の詰まりを検出し、左最狭ピッチ4.031、右釘–成形壁4.25に対し、球半径1.8を維持して釘軸の推定接触半径.25→.2、電チュー左成形壁のみ.65→.4と再校正。資料座標は変更していない。実機寸法を測った値ではない。

高密度seed5で、盤面側の玉が左上ガイドと奥の発射内周arcの両方へ接触していた漏れを検出。発射面を出た玉には内周arcを当てないよう2接触ループを同期。外周arcの盤外境界は維持。強制移動・時間切れ消去なし。

- `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/lead-plane-fixed-regression.log`: 最新差分の関連20件成功。
- `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/inlet-plane-reproducer.log`: 元詰まり点へ実径球を置いた再現試験を含む2件成功。
- `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/contact-range-final-fixed.jsonl` / `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/contact-range-summary.json`: 左強弱/右開閉/高密度9条件、停止後残球0・計数一致。
- `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/compact-final.log`: 2件成功。24秒内の自然ヘソ入賞保証を排出試験から分離、全3modeの排出/計数と右開口の入賞条件は維持。seed101 normalはspawn113/普通2/OUT57/返却54・ヘソ0だった事実を残す。

`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/before-calibration` と `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/before-plane-fix` の動画・JSON、失敗したlead-final-regression/contact-range-final/contact-range-calibratedは修正途中の履歴。現在成功の証拠として使わない。

## 未達の境界

釘中心の原図照合は図上の±1source pxの採寸。実機の釘角度/球径/反発/奥行き/入賞率一致ではない。ワープ→ステージ、内部V、通常低確普図、特図2直撃、実機開放時間、普図最大保留、W固有コンプリート条件は依然未確認または未実装。既存暫定policyを実機確認済みとしない。

独立実表示レビューと最終全テストの結果は [統括の最終確認](root-review.md) とPMの受入台帳を参照。全体264件中263成功・旧compact頻度assert1失敗の後、試験責務修正後に該当2件をroot/PMが独立再実行して成功した。修正後264件の一括再実行ではない。最終build成功、既存チャンク容量警告あり。

## 最新スマホ再検証（390×844）

`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-check.mjs` を最終ソースで新規実行。`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-check.json`、`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile.mp4`、`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-play.png` / `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-paused.png` / `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-fresh-start.png` / `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-restarted.png` に保存。盤面canvasはx16/y78/358×409.14、右374/下487.14でviewport内、document横幅390で横溢れなし。画像を目視し盤面/操作/文字の見切れなし。

メニュー中はsnapshot全体が2.2秒凍結、resumeで進行。明示終了→台選択→新規開始では累計払出/当り数0。synthetic visibility/BFCacheの復帰経路も再実行成功。ただし実OSタブ切替/実ブラウザBFCache採用を確認した試験ではない。

pageerror0。console errorは `favicon.ico` 404が1件。遊技資産のHTTP失敗は観測なし。この欠落を隠してconsole error0とはしない。製品ソース変更なし。
