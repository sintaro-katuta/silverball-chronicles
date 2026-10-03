# 台最大表示・操作情報切替の独立レビュー

2026-10-03。対象は表示と操作導線。ゲーム仕様の再調査/変更、クラウド送信、SE追加、途中保存は対象外。

## 判定

最終3ファイルのコード/UXレビューとPM独立ブラウザ6checkは合格、阻害所見なし。証拠は `pm-independent-check.json` / `pm-independent-check.log`。全編動画の目視はroot/Designerの別記録を参照する。

- toggleはpanel.hidden、aria-expanded、ラベル、CSSクラス、focusのみ変更。盤面API/発射/物理時計を操作しない。開閉前後を同一JavaScript task内で比較し、full snapshotとfeed状態が完全一致することを独立確認。
- 発射を明示停止してUIを隠しても停止状態を保持し、残玉/抽選の処理時計は進む。メニューを開いた時だけ全snapshotが凍結し、resume後も明示停止したfeedを勝手に再開しない。
- 常設44px toggleから操作を再表示でき、panelのmenuからpause/resume/終了へ到達。閉じる操作でfocusはtoggleへ戻る。UIを隠した状態でもEscapeからmenu/終了へ到達できる。
- 同一mounted gameで390×844→844×390→1280×960→320×568→720×320をresize。各サイズの開/閉でcanvas/toggleがviewport内、横溢れなし、open panelと盤面は非重複、feed状態不変。short画面ではpanel/dialogに内部scrollがあり終了操作へ到達可能。
- safe bottom34/top47を対応CSS変数で模擬。盤面下477.98、panel上490/下810で非重複。これは実機のOS安全領域を測った試験ではない。

## 独立所見と修正

初回mobile式はpanel bottomだけ安全領域を考慮し、盤面領域の固定24px余白と不整合だった。LEが同じpanelBottom/controlsTop変数を盤面高さとfit幅へ同期して解消。常設toggleも36→44pxへ修正。

Designerが指摘した横844×390での下panelによる過剰縮小は、幅700以上landscapeをside panelへ切り替えて解消。PM独立観測で最終横盤面354.22×389.98、panel320×318、非重複。short720×320も盤面290.64×319.98を維持した。

production描画のみ396×436、scene offset(-12,-166)へ変更し、CSS/inline aspectを同期。図上外周と下部OUT前縁が入る余裕を残したcropで、物理source座標/モデル更新を変えない。非production previewは従来寸法/offsetを保持。

## ソース一致

独立検証時の3ファイルSHA256は `pm-source-sha256.txt`。撮影側 `source-sha256.txt` の同3件と一致し、撮影後の全5件（physics/source-layoutを含む）も `pm-source-check.log` で全OK。最終横向き/safe-area修正後のsourceに対する判定であり、before-safe-area画像を最終合格の根拠へ流用していない。
