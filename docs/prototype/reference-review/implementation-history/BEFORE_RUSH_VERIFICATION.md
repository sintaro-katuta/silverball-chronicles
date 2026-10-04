# 現行版の検証記録 — 2026-09-22

26項目の一括改修、図柄の左→中央→右停止、台上部の統合パネルを含む版。過去版の検証は [履歴](VERIFICATION_BEFORE_PHYSICS_REPAIR.md) を参照。現在の実装対応は [修正記録](../../REPAIR_BACKLOG.md)。

## 自動テスト

`npm test`：63件成功。発射初速・重力・接触による左右分岐、アタッカー扉、玉同士の接触、高速衝突、弱打ち返却、釘役割別の到達、追加玉と止め打ち、保留抽選の固定、会計の一致、天井、R上乗せ、図柄停止順、従来のステージ・永続強化・無限モード・演出を検証。

## 物理測定

再現：`node tests/physics-report.mjs`。データは [measurements.json](../../../../prototype/reference-review/physics-audit/measurements.json)、[軌跡図](../../../../prototype/reference-review/physics-audit/trajectories.svg)、[スロー再生](../../../../prototype/reference-review/physics-audit/replay.html)。再生は `node tests/physics-replay.mjs` で生成した物理ソルバーの実座標・速度サンプルを表示。

| 条件 | コース1 | コース2 | コース3 |
| --- | --- | --- | --- |
| 通常500発の始動入賞 | 28 | 18 | 21 |
| 通常500発の一般入賞 | 23 | 43 | 43 |
| 通常試験終了後の残留 | 0 | 0 | 0 |
| 10Rオートの発射 / 入賞 | 100 / 100 | 100 / 100 | 100 / 100 |
| 同条件のアウト | 0 | 0 | 0 |

通常は強さ57%、大当りは100%、0.6秒間隔と止め打ち支援。大当り試験は上乗せなし、ステージ移行が起きない目標で測定。10Rは各81.3秒。追加玉20発と双子玉を含む別の回帰試験でも、100発入賞・アウト0を確認。これはこの設定の測定値であり、手動・別強度・全スキル条件での保証ではない。

釘の役割ごとの接触玉数、始動・一般入賞・アウトへの到達数、経路の組合せもJSONへ記録。時間切れで玉を消す処理は使用していない。

## ブラウザー確認

以下のChromeテストが成功。

- `browser-smoke.mjs`：開始・停止・リタイア・大当り・スキル選択・リザルト・試遊報酬分離・モバイルレイアウト。
- `right-lane-ui-smoke.mjs`：実際の右側入賞、通常時の右打ち観測と案内。
- `scene-geometry-smoke.mjs`：共有形状の描画、通常・開放アタッカーを撮影。
- `dashboard-ui-smoke.mjs`：320 / 390 / 2048px幅。上部数値・グラフ・操作が一つの枠内に収まり、盤面を覆わない。下部ボタンもアウト口を覆わない。仕様・会計内訳の画面。
- `reel-order-ui-smoke.mjs`：左・中央・右が別々のフレームで順番に停止。
- `reach-entry-ui-smoke.mjs`：左・中央一致後の通常色／赤リーチ告知から戦闘への遷移。
- `debug-smoke.mjs`：変更値、天井保証、10R振分け、演出後の大当り。
- `physics-replay-ui-smoke.mjs`：実際の上部反射時点の座標・速度を表示し、シークと再生が動作。

最終画像：`screenshots/unified-dashboard-mobile.png`、`unified-dashboard-small.png`、`unified-dashboard-desktop.png`。停止順：`reels-left-stop.png`、`reels-middle-stop.png`、`reels-right-stop.png`。共有形状を目視し、最後にアウト口を覆っていた下枠を開口に変更。

## ビルド

- `npm run sync`：Web本番ビルド、iOS / AndroidへのWeb資産同期に成功。
- `xcodebuild`：iOS Simulator向けDebugビルド成功。`builds/ios-simulator/App.app` を今回の最終Web資産で更新済み。今回のネイティブ起動操作・実機性能検証は未実施。
- Android：JavaランタイムとAndroid SDKがないため、APKビルド・実機動作は未確認。同期済みをビルド済みとは扱わない。

## 範囲と制約

2D盤面の物理を3Dで描画する試作。釘のたわみ・奥行き・盤面傾斜・特定実機の実測値の再現ではない。盤面バランスは試作値。ST・時短・LT・電チュー抽選は未採用。既決の保留5個・天井・R上乗せ・強化などはゲーム独自仕様。今回、効果音の実装は変更していない。
