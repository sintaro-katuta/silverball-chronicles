# PM 独立レビュー（2026-10-03）

今回の接触・LCD配置改善の受入は合格。実機Wの未確認事項を解消したとの認定は行わない。

## 最終ソースの受入結果

| 対象 | 最新結果 | 証拠 |
| --- | --- | --- |
| 自然左・高密度接触 | 10条件の全回収一致/残球0/front pin侵入0。.25は79発79回収（旧残1解消） | pm-contact-regression.json/log |
| 同session/3view/停止/再開始/resize | Chrome5checks成功、pageerror0、15製品hash試験前後一致 | pm-live-continuity.json/log |
| LCDの最大保留・図柄配置 | polygon収容試験と独立画像目視で欠け/不要なstatus重複なし | lcd-safe-layout.test.js、Designer24画像・PM目視範囲下記 |
| 修正後接触/口/自然W3000等 | 統括の最新35tests全成功、build成功 | root-final-targeted.log、build-after-rim.log |
| 最終録画のソース対応 | 直下3動画の対象11製品hash独立一致、各mp4 SHA256記録 | pm-source-match.json、pm-video-confirmation.json |
| 最新自然left | UI.24を20秒→.25を40秒→停止drain30秒。82発/計数82/残0、普通1・HESO1、収支一致 | left-record.json/left-mobile.mp4 |
| 最新高密度 | 同renderer/SessionGame、要求間隔.05秒。254発/計数254/残0、普通4・HESO3、収支一致 | dense-record.json/dense-mobile.mp4 |
| 最新自然RUSH | 初期RUSH/初回結果のみ固定、球位置変更なし。lastBonus.payout3000、総払出3065（一般賞球含む）、278発=計数274+遊技継続中4球、収支一致 | rush-record.json/rush-mobile.mp4 |

PMは録画script/3json/計数/収支/fixture/hashを独立確認し、171秒のroot画像でも3000/3000を目視した。全編連続視聴や全玉接触確認をしたという主張はしない。統括とDesignerの別動画確認範囲はそれぞれの記録を参照。

## 修正を根拠から分離したコードレビュー

実際のsolver不足はpair分離後にsegmentだけ再解決して釘を再解決しなかったこと。実ROAD釘id1(72.5,488)へ2球を意図配置する独立診断で、修正前距離1.1/接触距離2.0のめり込みが修正後2.0へ解消した。共通resolvePinsを通常積分とpair分離後から呼び、同じ101点と球r1.8/軸r.2を維持する。これらは推定校正値。supportbar・不可視バリア・任意球ワープ/削除は追加しない。

背面発射球は既存rear planeの接触除外を保ち、表示だけlaunchBallsLayerへ置く。前面へ出た球は従来ballsLayerへ移る。位置・径・tint・alpha・時間の変更はなく、描画平面を接触policyへ合わせる。実機Z測定ではない。釘head表示幅約2.43とshaft接触径.4は異なるため、頭の全輪郭への重なりを同平面tunnelingと認定しない。

新軌道で既存普通口rimtrapへ入る.25残球をPMが検出した。停止点(143.28668,560.74715)に近傍釘はなく、普通口2capsule端が球を支えていた。postpinだけ無効にした比較では自然軌道がそこへ入らず残0、同停止位置に球を置く比較では旧rim自体が支持することをLEが確認した。

一般口normalだけ、根拠のないrim+5を採用assetのSIZE12/anchor.375/front-cut.49の前面境界+1.38程度へ短縮。中心/幅/釘/球/ヘソ普図rimは維持。roundによる実表示+1.3756との差約.0044は校正誤差。実機の壁深度が1.38との認定はしない。既存U/斜め受口の資料上の存在、asset合成、2D接触の仮定を区別する。共有ordinary-pocket-geometryをruntime描画とlcd-layout接触で使う。

## LCD配置・時計の独立確認

hold-viewはroot.x=22だけを変更し、hold-motionと保留/抽選stateは変更しない。開口polygonへplateとactive/最大queue・入場bboxを収める。normal中心63、RUSH中心65.5は開口面積重心62.8と上部statusを考慮し、columns/shade/777pivotを同期。PMはPCnormal/lcd・rush/lcd・mobile normal/board・normal/wholeでactive+4queued全輪郭、下左斜辺の見切れ解消、図柄/status/保留非重複を目視した。Designerの24画像は停止中表示fixture（active+4queue、normal/rush/win/charge直接選択）で、自然入賞・払出動画とは別。

最新Chrome試験では18回同tickの実ボタン切替でsnapshot.view以外完全一致し、同model/session/feedを保持。停止発射/メニュー停止、4viewport×3view fit、終了新規intro/defaultboardを確認。自然RUSH実bonus135→225個の間に12回切替してclock/shots/W events/実入賞が継続した。fixtureは初期RUSH/結果固定、玉配置はなし。

## 証拠の時点と制限

初回全suite273件中271成功/2失敗。natural120秒だけpartialstop state収集するnormal-spin-flowを、mouth fixture/後drainも採取して既存2assertを維持するtest-only修正へ。lcd-flowは自然左優勢・LCD外・排出・計数を残し、実HESO mouthcrossingを独立1testへ分離。PM該当2件/6件は全成功。統括の全274/274成功は**普通口rim修正前**で、最終全274一括再実行の成功とは報告しない。最終rim後は上の35件とPM10条件/Chrome5checks/buildを別に記録する。

最初のmode省略PM試行はrushになっていたためpm-contact-wrong-modeとして履歴保存し自然左根拠から除外。rim前の6条件/Chrome/録画はbefore-rim-fixへ保存し、最終物理証拠として流用しない。旧停止点の診断JSONはその時点の失敗証拠。

機械fixtureの各固定power sweepではHESO全0、near到達はある。最新本編録画のUI.24→.25で初めて46.189秒にHESO1を確認し、.25 cohort53球中1。この録画条件の自然positiveと、単独sweepや実機頻度一致は区別する。高密度録画のHESO3も別条件。保留容量/warp/stage/Z/V内部/実開放秒/低確普図/T2直撃/complete等の既存未確認事項は残る。SE・保存・クラウド更新は追加していない。
