# 銀玉クロニクルのゲームフロー図

2026-10-15、リポジトリの現物を確認して19枚目を追加。

- `../../../prototype/src/domain/game.js`：`candidates`、`checkStage`、`selectSkill`、`requiredGain`、`lowerBorder`、`payoutMultiplier`、`fireRate`、`confirmTickets`、`claimTickets`、`finish`。ラン内スキルと永続プロフィールを区別。
- `../../../prototype/src/legacy/main.js`：`new Game` による通常モード、永続強化画面への接続。
- `../../pachinko.md`：ステージ成長・下限・途中精算、最新の目標増加率2倍、通常入賞にはステージ倍率を掛けない旨。
- `../../../prototype/src/domain/session-game.js`：実機寄せセッションではステージ・チケットを無効化している。通常モードの成長フローと混同しない。

図は通常モードのローグライク構成。10ステージでクリアし、1〜9の突破後にスキル選択。全スキル最大時は選択なしで続行。途中精算、敗北、クリアをプレイ終了にまとめた。遊技中の報酬差分確定等の会計詳細と例外モードは発表メモへ。

元データは `diagrams/silverball-game-flow.mmd`。`node scripts/render-silverball-flow.mjs` でMermaidノードを描画後、配置と矢印を直線・直角に整列してPNG化する。`npm run build` でスライドへ反映。
