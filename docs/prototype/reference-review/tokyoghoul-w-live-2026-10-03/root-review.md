# 引継ぎ統括・最終確認

2026-10-03。対象は2025年e東京喰種W。ローカルのみ、SE・途中保存追加・クラウド送信なし。原機完全一致の完了報告ではない。

## 実装と独立レビュー

LEが右5釘間の不可視連結4線を撤去し、Designerが原図各円中心を採寸。LEFT70＋左道26＋右道5＝101釘へ訂正した。PMと統括がヘソ2点・右寄り3点の共通採寸参照、重複なし、両接触ループでの発射内周arcの平面分離をレビューした。

資料中心を保持し、球1.8・軸0.2・電チュー左壁接触0.4へ校正。実機測定ではない。途中版の玉詰まりと旧試験の失敗ログは削除せず、最新成功と区別した。

## 試験結果の読み方

- `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/root-verified-tests.log`: 最終製品ソースの全体実行264件中263成功・1失敗・cancel0。唯一の失敗は旧compact試験の「24秒の自然左打ちでヘソ入賞する」という頻度依存assert。
- 排出・収支検証からその通常時の頻度要求を分離。RUSH/bonusの入賞要求は保持。製品ソースを変更せず、修正後`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/root-compact-final.log`で2/2成功。PMも独立2/2成功。修正後264件を一括再実行したとは主張しない。
- `../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/root-verified-build.log`: build成功、既存500kB超チャンク警告あり。
- LE/PMの校正・平面修正後の関連回帰、元詰まり点の実径球probe、9代表条件の停止後残球0・計数一致を確認。証拠の条件は`verification.md`と各JSON/ログを参照。
- 録画後の8ソースのSHA256を統括でも照合し、全件一致。製品ソースの検証後変更なし。

## 最新録画の実表示

直下の4MP4が最終physics版。`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/before-plane-fix`内は修正前の履歴。

Designerは4動画の時系列フレームと払出境界を独立目視、動画SHAを`../../../../prototype/reference-review/tokyoghoul-w-handoff/designer-final-video-review.json`へ保存。統括もブラウザで録画を等速再生・部分シークし、以下を目視した。全編の全フレームを連続視聴したとは主張しない。

- left: 最終42.44秒版を再生。通常背景・盤面を維持。今回40秒観測の自然ヘソ入賞は0、自然入賞機能/原機の入賞率一致の証明にしない。
- rush: 約23秒の150/3000、129秒の2205/3000、160秒付近の2850/3000、約170秒のRUSH残129。払出・継続と月影のドット絵表示を確認。
- normal: 約75秒の1200/1500、115.68秒の終端でRUSH残107を確認。
- charge: 最終43.32秒の終端で通常図柄129に復帰、累計318はチャージ300＋その他18。Designerの時系列確認でもCHARGE告知・300払出・通常復帰、777/RUSH混入なし。

4動画のpageerror0、持玉収支と撮影時の在飛球を含む物理計数一致を`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/video-count-summary.json`で独立確認。在飛球を残球詰まりと混同しない。停止後排出は別の9条件検証。通常/chargeの最初のヘソ2球配置、RUSH初期状態と当否固定を本来の確率・自然初当り検証に転用しない。RUSHは全球自然発射で電チュー2入賞・V2回・実200球の1500×2＝3000。

## 最新スマホ確認

390×844の`../../../../prototype/reference-review/tokyoghoul-w-live-2026-10-03/mobile-play.png`を統括でも目視。盤面358×409.14、操作・文字の見切れと横溢れなし。pause全状態凍結・resume・明示終了→新規開始・合成visibility/BFCache経路の5確認成功。pageerror0、favicon.icoの404が1件残る。実OS切替/実BFCache採用の検証ではない。

## 残る境界

ワープ→液晶下ステージ、奥行き、通常低確普図、特図2直撃、内部V、実機開放時間、普図最大保留、W固有コンプリート条件は未達。資料不足と機能欠落を`../tokyoghoul-w-analysis/completeness-audit.md`で分けた。既存の暫定policyを実機確認済みへ昇格していない。
