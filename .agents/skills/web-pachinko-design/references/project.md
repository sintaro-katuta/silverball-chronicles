# プロジェクト対応表

調査日：2026-09-24。これは実装の読み取り記録であり、新しい仕様の承認ではない。以降変更され得る。

## 対象と資料の読み方

- ユーザー指定：液晶演出中心の現代的パチンコ、プロジェクト専用、Webでできる表現。
- 実装：`prototype/`。Vite、Three.js、Canvas、Web Audio、Capacitor。iOS/Android向け縦画面、オフライン。
- 作品：「月影機関」。独自IP、3D筐体・玉・釘と、イラストを使った液晶映像。
- `pachinko.md` には旧仕様も残る。冒頭の優先記述と日付付き更新を確認する。`prototype/README.md` にも過去のパス・発射位置が残るため、その一文だけを根拠に修正しない。
- `prototype/DESIGN.md` は筐体の夜色・青鋼・銀・真鍮などの方向性。演出の全状態を同じ寒色に固定する意味ではない。
- `prototype/reference-review/**/REVIEW.md` は過去の観察記録。現在の画面の欠陥としてそのまま再利用しない。

## 変更箇所の入口（パスはプロジェクトルート基準）

| 対象 | 主なファイル |
|---|---|
| 変動・図柄の表示 | `prototype/src/reels.js`, `reel-display.js` |
| 戦闘の進行・分岐 | `prototype/src/cinematic.js`, `reach-scenes.js` |
| イラスト合成・効果 | `prototype/src/battle.js`, `battle-effects.js` |
| 押し出し・面取りの演出文字 | `prototype/src/title-art.js`, `title-glyphs.json` |
| 音・音量・同時発音 | `prototype/src/sound.js` |
| 筐体・装飾役物・盤面 | `prototype/src/scene.js`, `cabinet.css` |
| RUSH・BONUS | `prototype/src/rush-screen.js`, `rush-screen.css` |
| 共通時計・操作・画面サイズ | `prototype/src/main.js`, `viewport-fit.js`, `style.css` |
| ゲームルール・物理 | `prototype/src/game.js`, `machine-spec.js`, `physics.js`, `shot-control.js` |
| オリジナル画像 | `prototype/public/`, `prototype/public/battles/` |

## 見た目変更で壊さないもの

現状は左→中央→右の停止順、左と中央一致からリーチ。保留最大5個は本作の独自仕様。一般的な実機の印象で修正しない。大当り・R数・RUSH結果は告知前に決まるが、未告知結果をHUDへ漏らさない。

画面と装飾枠は非衝突の例外で、玉が液晶前を通る。盤面の見える釘・通路と物理形状の対応を維持する。装飾役物にV入賞判定を新設しない。

共通ゲーム時間による演出停止、スキル選択中の停止、非表示時のポーズを維持する。ステージの持ち玉純増目標、賞球倍率、チケットなどはデザインスキルの採用ルールではない。

## 既存の試遊・検証入口

試遊サポートからシーン・展開を指定できる。`window.__pachinko.snapshot()` と `.audio()` は内部状態・音キューの診断用。音の聴感評価を代替しない。

関連テスト：`prototype/tests/cinematic.test.js`, `cinematic-smoke.mjs`, `expanded-ui-smoke.mjs`, `reel-order.test.js`, `hold-visual-ui-smoke.mjs`, `rush-screen-ui-smoke.mjs`, `sound-cues-ui-smoke.mjs`, `viewport-fit-ui-smoke.mjs`。ブラウザテストはローカルサーバーと出力先を使うため、実行前に読む。

`prototype/screenshots/` は保存済みの過去画面。今回のスキル作成では `battle-awakening.png` を観察したが、現在の起動確認・最新画面検証は行っていない。
