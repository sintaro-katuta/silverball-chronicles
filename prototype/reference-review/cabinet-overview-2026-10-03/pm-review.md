# 全筐体表示の独立確認

2026-10-03。製品コードの変更なしで現在表示を確認。台一覧と台詳細は既存48×64の全筐体スプライト、遊技中は採用済み396×436の盤面表示として使い分けている。阻害所見なし。

## コード/表示

`arcade-cabinet.js` は肩部・盤面・受皿・ハンドル・下端まで48×64内に描く。floorは全textureを一様pixel scaleで配置、detailは幅/高さの小さい側から一様contain scaleを決める。遊技crop画像を一覧/詳細へ流用していない。

PM独立の現在画像（`pm-mobile-floor.png`、`pm-small-detail.png`）を目視し、全体輪郭・受皿・ハンドル・下端が見え、筐体だけの切れ/歪みなしを確認。小画面の詳細情報はページ下へ続くが筐体全体はcanvas内に入る。

## 独立操作確認

`pm-independent-check.json` / `pm-independent-check.log`: PC1280×960、mobile390×844、small320×568でpageerror0。

- 一覧の稼働台/調整中台の選択制御を保持。
- 5番台へ選択して詳細の個体番号が一致、backで元のmobile pageへ戻る。
- 詳細→遊技→メニュー終了→一覧の往復が成功。
- mobile next/previous、2F移動/1F復帰を保持。
- 採用済み遊技canvas396×436・初期UI非表示・viewport内を維持。
- detailはResizeObserver初回描画完了後にhostとlogical canvas寸法の一致を記録、document横溢れなし。

## ソース維持

`pm-source-comparison.json` でfloor-art.js、pixi-session.cssが作業前コピーとbyte一致。`pm-play-source-check.log` で採用済みfocus-viewのmanifest5件（pixi-main/CSS/board-runtime/physics/source-layout）が全OK。製品差分がないためbuild/全W再検査は再実行していない。
