# PM independent review — HESO calibration (2026-10-03)

最終製品の幅16world校正は独立コード/自然経路/会計/表示操作回帰と最新3動画の条件・計数・源hash確認に合格。改善は本作の暫定校正で、実機入賞率の一致や常時入賞を主張しない。

## 最小校正の範囲

旧source口幅12をHESO_SOURCE_WIDTHとして保持、HESO_MOUTH_WIDTH16を本作のpolicyとして分離。全101釘の位置/反発/径/role/idはbeforeと完全一致。gather.7中間候補は廃止し元.46へ戻す。口center208.5/553・高さ固定、左右rimはx200.5/216.5・y553→558。捕球の中心範囲は球r1.8を差引き±6.2。source採寸訂正を意味しない。

表示もactualp.w由来: blackmouth/lip16、内帯14、rear/front body20（p.w×1.25）、縦15とy/cut維持。sensorだけ拡大して見えない集球を行う差分ではない。PC/mobile口cropをPM独立目視し命釘と口の配置維持を確認。物理口径/釘中心/口位置/表示サイズの関係はpm-final-code-geometry.json参照。

物理algorithm・ballr1.8/軸r.2・launcher rails .7/core1.4・W抽選/保留/RUSH/払出はこの変更で維持。球ワープ/引力/強制入賞/不可視barは追加していない。SE/保存/クラウドなし。

## 最新製品による標準長期比較

各power標準.6s300秒自然発射＋45秒drain、機械createBoardFlow fixtureで実pocketCrossingを計数。近傍到達は入賞と別。seed0/1/101はinstallLcdBoundaryの採寸再生成でinstalledpins同一、独立試行として重複加算しない。

| Power | before actual HESO / shots | final actual HESO / shots | final per100 |
| --- | --- | --- | --- |
| .20 | 14/497 | 16/497 | 3.22 |
| .22 | 8/499 | 11/499 | 2.20 |
| .23 | 4/498 | 6/498 | 1.20 |
| .24 | 8/499 | 14/499 | 2.81 |
| .25 | 3/498 | 8/498 | 1.61 |
| .26 | 1/499 | 1/499 | .20 |
| .28 | 0/500 | 0/500 | 0 |

.20〜.25は増加、.26/.28は同じ。全7power増加とはしない。default.24の発射位相0/21/42ticksはbefore8/3/2→final14/6/5、全3条件増加。21/42ticksはstart前.175/.35秒だけ進め、sin(time*17.17)のlaunch tolerance位相を変える自然条件。全7power＋全3phase残球0/count一致、試験前後sourcehash不変、in-memory候補と同値。pm-final-sweep/phase.json参照。

仮目安4〜8/100はPM提案履歴でユーザー指定や決定済み合否閾値ではなく、今回も未達。統括は位置/釘を維持する最小校正、default全位相と低強度帯の増加・他帯域減少なしを採用基準とした。default最長無入賞区間（頭尾含）はphase0約54秒、21約104秒、42約103秒。before21約167/42約153から縮小しても1分超区間は残る。頻度や待ち時間が実機と一致する証拠にはしない。

## 最新回帰

PM実substep10自然条件でrail centerlinecross0、front/rear frame後侵入0（観測許容1e-6）、drain残0、計数一致。pm-final-rail-probe.jsonのsource5件試験前後一致。

Chrome独立5checks/pageerror0:18回同tick実DOMview切替でsnapshot.view以外不変、同flow/game/feed参照。発射停止/メニューpause/resume保持、4viewport×3view界内、終了新規intro/defaultboard/初期発射0保持。dev初期RUSH/当選固定かつ自然発射の実払出中12回切替で時計/発射/イベント/払出継続。pm-live-continuity.jsonの16source前後/現ファイル一致。

root-regression.logは最終39/39成功、新heso-calibration.test.js2/2成功、build.logビルド成功（既存大chunk警告）。全suite再実行との主張はしない。新自然180+45testはSessionGame draw/保留排出/会計責務を保持し、別左右口crossfixtureは±5.5実入賞/±11口外不捕球を検証。隔離fixture球配置を自然入賞証拠と混ぜていない。

## 候補と未確認の区別

gather.7のみはdefault全位相増加でも.20/.22/.23減少、最終採用しない。pm-gather-only-*とgather-only-candidate/旧動画へ分離。口高さ−2/−4/+2/+4/+6と幅20の追加候補は最終sourceへ反映しない。100秒短候補・旧rail-pass成功を今回final成功へ流用しない。

実機入口幅/高さ・奥行き・球径/軸径・rail径は実測不明。warp/stage、低確普図、特図2直撃、V内部、実機開放秒数、普図保留容量、W固有コンプリート条件等は今回未確認のまま。既存policy秒数/普図4/V代用を実機確認済みへ昇格しない。決定論的校正で各球を独立確率標本とは見なさない。

## 最終動画の独立会計・源確認

2026-10-03 変換完了後の最新3mp4 SHA256はvideo-sha256.txtと全一致。record.jsonも独立読了してspawned=counts+inFlight、spent=spawned、payout=session.total、balance=payout−spentを再計算。3本ともreconciled=true/pageerror0。撮影13source、PMChrome16source、現製品全一致（pm-source-match.json）。動画/recordのSHAと計数/fixtureをpm-video-confirmation.jsonへ保存。

| 新動画 | 自然条件 | 計数 | 払出/収支 |
| --- | --- | --- | --- |
| left-mobile.mp4 | 標準.6s/default.24、120s+30sdrain、抽選外れ固定 | 201発=HESO4+普通3+OUT194、残0 | 19/−182 |
| dense-mobile.mp4 | local負荷.05s要求、20s+30sdrain、外れ固定 | 312発=HESO17+普通5+OUT290、残0 | 42/−270 |
| rush-mobile.mp4 | 初期RUSHと初回結果固定、自然右発射 | 278発=普図63+電チュー2+bonus200+OUT9+継続中4 | lastBonus3000、total3065、収支+2787 |

3本とも球位置配置なしをlead-record.mjs/dense harnessから独立確認。RUSHは3000完了後の継続中球4があり、全排出済みとはしない。denseの17実入賞と抽選採用数は別（満保留中は拒否され得る）。通常動画4/201と機械長期14/499は異なる時計/発射位相/SessionGame条件で、同一結果への一般化や動画にない成功の転用はしない。

PMは今回最終動画の全編連続視聴/全球接触の目視を主張しない。PC/mobile口cropの静止目視、最新Chrome実操作、数値記録/fixture/source監査が独立範囲。統括とDesignerの実動画時系列観測は各担当の記録範囲で追加する。今回の採用基準内で未解決受入失敗なし。実機未確認・絶対目安未達・1分超の無入賞区間は上記のまま残る。
