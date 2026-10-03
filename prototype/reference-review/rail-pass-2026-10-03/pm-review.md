# PM 独立レビュー（2026-10-03）

最新ソースの接触・表示・セッション回帰、および新3動画のfixture・会計・source照合は受入合格。実機未確認仕様の認定や全条件の完全再現を意味しない。

## ユーザー挙動を再現した修正前診断

自然5条件の実substep centerline横断とframe後の全launch capsule侵入をfront/rear別に測定。旧sourceで標準.20/.24/.25は34/77/50横断、高密.24/.05は203横断。.24球1はt1.665でinnerarcを横断。全てfront→frontで、当時のlaunch-inner/outer/inner-arc除外が有効だった。高密度rearもframe後侵入最大.11355。別planeの意図だけで正常とせず、実横断を修正対象にした。これはsegment横断数でunique球数ではない（pm-before-rail-probe.json/log/pm-before-source-sha256.txt）。

## 新コードの独立判定

- 全launch railsをadvanceと後補正の両方でfront/rearへ適用。球分離後はpins→静的wallsを最大10pass、位置移動1e-9未満で早期収束。rearは直線部だけでなく上方arcも補正する。任意球移動/削除・不可視連結barは追加しない。
- x80/y300の曖昧なfront化を廃止。既存inner tipと同角outer点の開口segmentを実横断し、球+railの半径だけ離れてからfrontへ。planeはpin/guideの適用と描画に残るが、壁の横断を許す条件には使わない。角度/radii/接触r.7は既存の推定設計で実機深度の実測ではない。
- 可視contactcoreはshared幅1.4=2×r.7、同じsegmentのroundcap/join。太い支持10/3とouter金縁3は球背面に置く。球画像/色/alpha/径・center・速度を表示で変えない。描画変更で物理横断を隠す扱いはしない。

## 最新独立検証

pm-final-rail-probeは.20/.24/.25/.28/.22/.23/.26と高密.05/.12の計10条件。全条件centerline横断0、front/rear frame後wall侵入0、残球0、全回収一致。各発射数34/34/100/34/311/34/34/34/147/442。physics/board-rails/lcd-layout/runtime/source-layoutの5sourcehashは試験前後一致。標準.24の20秒と.25の60秒では自然HESO各1を観測、実機頻度一致へ一般化しない。

pm-live-continuityは最新Chrome5checks/pageerror0、16製品hash試験前後一致。18回同tick実ボタン切替でsnapshot.view以外不変、同model/session/feedを保持。停止発射・メニュー停止/再開、4viewport×3view収容、終了新規intro/defaultboard保持を確認。初期RUSH/初回結果固定と自然発射で実bonus135→225中に12view切替を行い、時計/発射/イベント/実入賞/払出が継続。実機仕様同定とは別のfixture。

新rail/inlet5testsは独立実行して全成功（pm-rail-targeted-tests.log）。旧fixture座標(47.70319846,310.51026441,r1.8)は復活innerarcへ距離2.194489/必要2.5＝壁内.305511、隣arc端も距離2.396208<2.5、guideは距離2.4の接線。新合法位置(40,350)はguide4.35683/必要2.4、innerarc5.06191/必要2.5で全collider非重複（pm-old/new-inlet-fixture-geometry.json）。置換後は合法球のinnerarc反発と排出を確認し、自然inletの多数接触・下流通過・排出・計数の既存責務も維持する。旧位置を新合法状態と誤認して壁接触を除外する方法へ戻さない。

## 時点と範囲

旧collision-lcdの成功、r5/3候補/4・6pass候補の結果を最終成功へ流用しない。追加rear位置probeは全rails復活候補で走ったためbeforeとして扱わずpm-restored-rail-rear-overlapへ改名した。初回beforeのrear侵入事実とは別。

釘101点、球r1.8、軸r.2、普通口の前回表示校正、W lottery/payout policyは今回変更しない。これらやrail径は実機実測ではない。SE・保存・クラウド更新なし。既存W実機未確認事項は残る。

## 最終動画・受入確定

2026-10-03 最終撮影3本のrecord.jsonを独立に読了し、spawned＝各回収counts合計＋inFlight、spent＝spawned、payout＝session.total、payout−spent＝balanceを再計算した。3本ともreconciled=true、pageerror配列0。動画およびrecord SHA256はpm-video-confirmation.jsonに保存。撮影manifest12製品sourceとPM試験manifest16製品sourceは全て現ファイルへ一致（pm-source-match.json）。旧動画の成功は使用していない。

| 最新動画 | 発射/回収/遊技中球 | 払出/収支 | 条件と範囲 |
| --- | --- | --- | --- |
| left-mobile.mp4 | 108/108/0 | 17/−91 | .6s自然発射、.24/.20/.25/.28を各16s、30s排出。普通口2、普図7、HESO0。結果外れ固定、球配置なし。この動画だけのHESO到達成功は主張しない。 |
| dense-mobile.mp4 | 314/314/0 | 37/−277 | .05s要求のローカル負荷条件、20s自然発射＋30s排出。普通口5、HESO12。結果外れ固定、球配置なし。標準発射仕様との同一視なし。 |
| rush-mobile.mp4 | 278/274/4 | 3065/+2787 | 初期RUSHと初回当選結果のみ固定、球配置なし。普図63、電チュー2、アタッカー200、out9。lastBonus.payout=3000。継続遊技中4球で撮影終了し、全球排出済みとはしない。 |

lead-record.mjsの自然発射・UI強さ変更・drain・RUSH固定範囲を独立照合した。PMは最終designer-ball-1/3静止cropとrush-final-mobile.pngを目視し、球の旧細片欠けを当該2時点で認めず、3000/3000表示を確認。PMによる全編連続再生や全接触の目視確認とはしない。統括/Designerの実動画確認は各担当記録の観測範囲で扱う。

root-regression.logは最終13ファイル39/39成功、fail/cancel0。build.logはビルド成功（既存の大きなchunk警告あり）。これは今回必要な回帰の実行範囲で、全suiteを再実行したとの記述へ広げない。PMの独立自然10条件、実表示5checks、rail/inlet5testsと合わせ、今回の未解決受入失敗はない。

未確認として残す事項: real rail深度/径/端点実寸、球r1.8/釘軸r.2の実機寸法同定、warp/stageと奥行き、通常低確普図・特図2直撃・V内部・実機開放秒数・普図保留容量・W固有コンプリート条件。既存開放秒数/普図保留4/V代用等のpolicyは今回検証で実機確認済みへ昇格しない。今回のnatural頻度も実機入賞率一致の根拠ではない。
