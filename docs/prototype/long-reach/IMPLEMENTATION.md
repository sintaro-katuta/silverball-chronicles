# 旧90秒リーチ：実装と比較

本記録は先行90秒版の履歴。最新ユーザー訂正による現行54秒版は[修正記録](REVISION-54S.md)を参照。旧画像・計測・録画を現行の証拠として使わない。

2026-10-05。通常・RUSHのリーチを両方長くするユーザー回答を適用。代表の攻防一本を共通タイムラインで90秒にした。抽選済みの当落を最後に提示し、保留はFIFOで待機する。28秒から「上に注目」、30〜35秒だけ上部の剣が一周し、月は選択済み予告がある場合だけ表示。液晶は案内・静かな待機へ切り替える。液晶表示選択中は盤面へ引き、36秒までに元の表示へ戻す。機構の期限は演出中も進み、一時停止では双方が止まる。

## 変更したもの

- `long-reach-timeline.js`：通常/RUSHと比較画面に共通の90秒動作。移動・回転・カメラを時間から計算し、フレーム数で速さが変わらない。
- `long-reach-view.js`：PixiJSの人物ポーズ、9×9頂点の布変形、背景移動、剣筋、光、液晶案内。顔と鎧を布の変形から除外。
- `normal-spin-flow.js` / `win-sequence.js`：本番SessionGameのリーチを90秒へ。既存単体デモは従来時間。87.7秒から勝ち側のみ既存月蝕、90秒中央停止。
- `cabinet-light-motion.js` / `moon-cue.js` / `board-runtime.js`：上部の時間分離、月の形・色の保持、液晶→盤面→液晶の視線誘導。
- `reach-comparison.html` / `long-reach-three-view.js`：開発用の比較画面。本番のエンジン切替UIは増やさない。

## PixiJSとThree.jsの判断

**今回の2D液晶演出はPixiJSを継続する。** 布の頂点変形と連続移動は両者で可能。Three.jsへ移しても素材のポーズ数や攻防の演出設計は増えず、自然な手足の動きが自動的に得られるわけではない。3Dモデルの骨格・立体カメラが必要になった場合は別の代表場面で再評価する。

公式資料：[PixiJS Mesh](https://pixijs.com/8.x/guides/components/scene-objects/mesh)、[Three.js Animation System](https://threejs.org/manual/pages/animation-system.html)。今回はPixiJSでメッシュ変形と描画が成立することをコードと再生で確認し、Three.jsには同素材・共有タイムラインの比較アダプターを実装した。

最終ローカル比較はChrome headless、1100×900表示、840×560キャンバス、DPR1、WebGL、44〜54秒の10秒再生。エンジンを一つずつ実行し、各600フレームを集計した。

| 計測 | PixiJS | Three.js |
|---|---:|---:|
| フレーム間隔中央値 | 16.7ms | 16.7ms |
| フレーム間隔95%点 | 16.7ms | 16.7ms |
| CPU更新・描画送信95%点 | 0.5ms | 2.4ms |
| 33.4ms超のフレーム | 0 | 0 |

両者ともこの環境では約60fps。再実行前のCPU送信95%点は0.2ms／0.6msで、ローカル負荷による変動がある。表は時刻表示を待って撮影した最終再実行の値。CPU数値は今回のアダプターの測定でありライブラリ一般の優劣ではない。GPU完了時間は測っていない。図形の描画方法やフィルタに差がありピクセル一致の比較ではない。スマートフォン実機・Capacitor上の負荷や音声は未検証。

## 現在の画質の限界

新しい月下の石橋背景と銀髪の騎士・対手を使い、敵の先制、反撃、押し戻し、最後の一閃を分けた。長い区間を旧4.8秒演出の引き延ばしにはしない。ただし人物は6ポーズ差分で、手足の連続作画や骨格アニメーションは未実装。切替の唐突さ、溜めの長さ、斬撃の描画、剣先に合う光の位置、相手の反応の種類は仕上げ対象。90秒の映像として完成品質を認定しない。

次の画質改善はエンジン変更より、構え→踏み込み→接触→戻りの中間作画・顔の近景・別の攻防カットに時間を使う。現行録画と実画面で比較する。比較ページのシーク機能で14秒・28秒・80秒へ移動できる。

## 素材生成の記録

生成素材は本作の既存人物・背景を参照したオリジナル試作。実機の人物や映像を製品素材へ転用していない。

保存場所：

- `prototype/public/assets/lcd/long-reach/duel-poses-v1.png`：1536×1024、3列×2行、透明RGBA。角alpha0、透明画素967,966を検査した。
- `prototype/public/assets/lcd/long-reach/moon-bridge-v1.png`：1536×1024、月下の石橋・湖・城。

生成指示の要点（英語プロンプト）：

> Premium pixel-art sprite atlas, exact regular 3×2 grid, transparent background, no text or UI. Preserve the silver-haired knight's navy and gold identity from character-static-v1.png. Three full-body hero poses: guard, raised sword, forward slash. Three full-body violet hollow-knight enemy poses: guard, attack, recoil. Separate every figure within its 512×512 cell, consistent scale and readable face, cloak and sword silhouettes. No contact sheet labels.

> Premium detailed pixel art, moonlit ancient stone bridge over a lake, ground-level view. Gothic castle at right with warm windows, broken arch at left, mountains and moonlit clouds, clear dark open sky, mossy paving in the bottom third. Fine intentional pixel clusters, no characters, no text, no UI, no 3D render, grid or neon. Reference upper-night-landscape-v1.png for the world and palette.

## 検証

全306テスト成功。自然右発射から普図→電チュー→V→3000払出、密集時の10個閉鎖、当落保持、保留FIFO、演出/機構時計と一時停止を含む。90秒に合わせ既存Wフロー試験の待機期限を延長した。最終ビルド成功。既存の大きなchunk警告は残る。

比較ページは8/19/29/32/49/65/75/84秒の現行静止画、最終計測JSON、ブラウザエラー0を保存した。通常外れ/RUSH当たりの90秒本番録画の結果は下記追記へ記す。

証拠：`prototype/reference-review/long-reach-2026-10-05/`。録画は無音。通常/RUSHの結果を指定し、一発の有料球を正しい口の直上へ配置した検証条件であり、自然入賞頻度の認定へ使わない。開発再読込で中断した録画は成功証拠として扱わない。クラウド更新・pushなし。

最終本番再生：390×844のChromeで通常外れとRUSH当たりをそれぞれ約92秒、90秒リーチの終了まで等速再生した。8/19/29/32/36/49/65/75/84/88秒と終了後の現行画面を保存。31秒のメニュー一時停止で時計の停止を確認。32秒は剣回転、他の検査時刻は角度0、終了後は選択した液晶表示へ復帰。通常は外れ、RUSHは当たりのままで、会計整合あり、ブラウザエラー0。`session-check.json`に成功した2本の録画パスを記録した。最後の変更は検査用snapshotの区間名を共通タイムラインへ合わせるもので描画は変えない。

成功録画の見やすいコピー：`normal-loss-90s.webm`、`rush-win-90s.webm`（同証拠ディレクトリ）。
