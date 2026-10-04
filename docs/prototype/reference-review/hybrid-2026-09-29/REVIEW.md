# PlayCanvasとドット絵の折衷実装 — 2026-09-29

ユーザーの「間を取った実装」に基づくローカル改修。最新方針は `pachinko.md` の現行ビジュアル方針。クラウド更新なし。

## 変更と意図

- 重ねていたPixiJSの外枠を遊技画面から撤去。元の筐体を復帰するだけでなく、PlayCanvasの筐体材質を紺・銀・青・控えめな真鍮へ変更。天部・下皿に段状の立体意匠、盤面に210×344で直接描画した街／配線模様を追加した。機構を隠さず、液晶の世界観とつなぐ。
- 3D筐体のバックバッファを180×293から540×880へ変更。玉・釘・扉の輪郭を保つ。金属面の反射と塗装の光沢を抑え、やや平面的な色面へ寄せた。
- 通常液晶と人物カットインに `moon-guardian-pixel-v2.png` を導入。元絵を参考に新たに生成したドット絵調原画。元画像の縮小コピーではない。縦構図で顔を上部、図柄を下部へ分離。
- DOM画像を一律1/8に縮小する処理を起動経路から外した。戦闘画像のデコード時の1/8縮小も廃止し、戦闘Canvasは実表示サイズ×最大DPR 2で描画。既存戦闘原画・立体文字は鮮明なまま混在させる。
- 機種名はドット書体の実テクスチャへ変更。小さいカウンター・操作・字幕は通常の日本語書体で読みやすさを優先。保留は菱形と段状陰影。
- フロア一覧・機種詳細のPixiJSは継続。抽選・賞球・釘位置・物理計算は未変更。

参考原理：web-pachinko-design `visual-patterns.md` のD1（図柄と保留の独立した設計）、D3（輪郭・陰影・主役以外の輝度）。新しい実機模倣ではなく本作向けの意匠提案。

## 実画面の証拠

[比較ビュー](../../../../prototype/reference-review/hybrid-2026-09-29/index.html)

- [変更前・通常390×844](../../../../prototype/reference-review/hybrid-2026-09-29/before-mobile.png) / [変更後・通常390×844](../../../../prototype/reference-review/hybrid-2026-09-29/after-mobile.png)：先頭台、通常、AUTO OFF。生成見本ではなく同じローカルアプリを起動して撮影。
- [変更前・PC](../../../../prototype/reference-review/hybrid-2026-09-29/before-desktop.png) / [変更後・PC](../../../../prototype/reference-review/hybrid-2026-09-29/after-desktop.png)：1440×1000。
- [戦闘リーチ](../../../../prototype/reference-review/hybrid-2026-09-29/after-battle.png) / [4R大当り](../../../../prototype/reference-review/hybrid-2026-09-29/after-bonus.png) / [RUSH](../../../../prototype/reference-review/hybrid-2026-09-29/after-rush.png)：390×844、DPR 2。UIのデバッグ再生を使用した実時間での連続実行。

通常静止画の旧版撮影では乱数を固定していた。動的検証では固定値によるEngine GUID衝突が発覚したため、値の異なるseed付き乱数へ修正した。変更後通常画面は本来の乱数で再撮影。ゲーム側の乱数処理は変更していない。

## 検証結果

- `npm test`：144件成功。
- `npm run build`：成功。既存の大きなchunk／node worker外部化警告は残る。
- `../../../../prototype/reference-review/hybrid-2026-09-29/verify.mjs`：実球発射、通常入賞／アウト、ポーズ中の状態不変、再開、枠画像の不在、新原画の読み込み、液晶と物理開口の位置合わせ、リーチから4R大当り、開放時gateOpen=true、RUSHを確認。実行時エラー／失敗リクエスト0。
- 320×568、390×844、1440×1000、844×390で盤面の収まり・横方向のoverflowなしを確認。横長の短い画面は盤面が非常に小さくなる既存の制約あり。
- 保存データ：[verification.json](../../../../prototype/reference-review/hybrid-2026-09-29/verification.json)。再現用：[verify.mjs](../../../../prototype/reference-review/hybrid-2026-09-29/verify.mjs)、[capture.mjs](../../../../prototype/reference-review/hybrid-2026-09-29/capture.mjs)。

静止画の確認：人物の顔と図柄が分離され、右始動口・アタッカー・下部入賞口が外枠画像に遮られない。通常と大当り／RUSHの状態差が画面と筐体で表示される。

## 範囲と未確認

これは折衷構成であり、全50枚の戦闘原画のドット絵化ではない。生成原画の厳密な統一ピクセルグリッド・24色制限も保証しない。採用素材と指示は [ART_PROMPT.md](ART_PROMPT.md)。

全演出分岐の再生、音の実聴、スマートフォン実機での負荷・メモリは未検証。全画像の元解像度デコードへ戻したため実機のメモリ計測は残る。今回は既存のステージ表記・進行ルール移行は対象外。
