# 台中心表示・2026-10-03の最新検証

ユーザーの「できるだけ台だけ表示、外部UIは表示/非表示切替」に対応。defaultは台だけをviewportへ縦横比を保って最大表示し、小さな「操作・情報」toggleを常設。open時のみ持玉/累計払出/回転/当り、発射、強さ、メニューを表示。表示切替はDOM状態のみで、pause/feed/抽選/物理のAPIを呼ばない。終了・新規開始では閉状態へ戻る。

production描画のみ、420×480の表示から x12/y36/396×436へcropし、sceneを(-12,-166)へ移動。資料/source/物理座標/抽選/払出/採用済み演出素材は変更なし。冠・外周・左球路・右開口・下OUTを残し、余白と旧直線外枠を減らした。

## 新しい実動証拠

- `../../../../prototype/reference-review/focus-view-2026-10-03/focus-mobile.mp4`: 最終ソースで安定表示後、closed→open→menu pause→resume/closed→再open→closedを再録。14.20秒、390×844、無音等速。ロード/終了の黒画面を除いたtrimのみ。`../../../../prototype/reference-review/focus-view-2026-10-03/focus-record.json` / `../../../../prototype/reference-review/focus-view-2026-10-03/video-edit.json` に元動画と区間を保存。
- `../../../../prototype/reference-review/focus-view-2026-10-03/focus-mobile-motion.jpg`: 最新動画の8時系列サンプル。
- `../../../../prototype/reference-review/focus-view-2026-10-03/focus-check.json` / `../../../../prototype/reference-review/focus-view-2026-10-03/lead-focus-check.log`: 最新6条件で全assert成功/pageerror0。mobile390×844、PC1280×960、PC1280×720、小320×568、横844×390、safe-area相当（top47/bottom34をレイアウト変数で模擬）。実端末notchの実測ではない。
- 6条件でcanvas全体とtoggleはviewport内、open panelはcanvasと非重複。clock継続、発射stop/start、強さ、menu snapshot凍結/resume、close focus戻り、fresh resetも確認。
- PC幅871.92→871.92、スマホ幅390→390、横幅354.22→354.22をopen時も維持。小型/安全領域条件は全経路を収めるためopen時に縮小する。

## 独立レビューと修正

PMのsafe-area下段侵入懸念を受け、下panelの実bottom insetと12px間隔をcanvas fit計算へ同期、常設toggleは44px高に変更。Designerの横向き窮屈化所見を受け、幅700以上横向きは右sidepanelへ変更。最終画像は冠/LCD/球路/OUTに欠けなし。

`pm-review.md`、`designer-review.md`、`root-review.md` が独立記録。`../../../../prototype/reference-review/focus-view-2026-10-03/source-sha256.txt` の製品5ファイルは録画後も一致。`before-*.png` は変更前、`../../../../prototype/reference-review/focus-view-2026-10-03/before-safe-area` / `../../../../prototype/reference-review/focus-view-2026-10-03/before-landscape-fix` は途中差分、`../../../../prototype/reference-review/focus-view-2026-10-03/before-fast-focus-mobile.mp4` はレビューしにくかった最初の短い録画で、最終動画の代用にしない。

台の比率と全経路を維持するcontain表示なので、細長いスマホでは上下に余白が残る。物理・実機再現の未達を解決した変更ではない。クラウド更新なし、SE追加なし。
