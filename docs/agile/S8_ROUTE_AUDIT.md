# S8：元配置の精細経路観測・独立監査

## 現在地（2026-10-16）

ユーザーが次の1・2（元配置250発の精細観測と映像、原図照合から修正案1つの提案）を承認しました。既存Issue23・PR35 Draftの範囲内で進めます。配置/寸法/物理の修正、提案の実装、改善比較は未承認です。主計画は[S8_ROUTE_PLAN.md](S8_ROUTE_PLAN.md)を正本とし、値や分類の未決点を監査担当が独断で追加しません。

作業cloneは`/private/tmp/silverball-s8-20261016`、準備時HEADは1ff021bです。正式HEADdabdd358/sourcee5e6b5…0355e0を凍結し、新観測実250の終端と旧基準全既存値一致まで独立監査済みです。経路分類の全球集計/映像/原図照合/提案は未確認です。旧風車5記録と以前の釘比較は履歴で、今回の精細観測成功として代用しません。目標750発60ヘソ以上は未達のままです。

## 受入対応表

| AC | 確認条件・必要証拠 | 状況 |
|---|---|---|
| R1 承認境界 | 元配置の観測/原図照合/映像/提案1つに限定。新配置・寸法・物理変更/改善比較なし | 範囲記録済み、実差分は未確認 |
| R2 元条件・保全 | 元101全座標/属性、発射.18・球1.8と既定表示・全fixed/回転初期値・legacy/口20/既存皿を固定。実250spawnで停止＋45秒排出、全計数と実終点、始終source/HEAD/実行計画/圧縮展開SHA保全。未達は実分母/失敗を保持 | 正式freeze/新raw監査済み、旧基準の全既存値一致 |
| R3 観測非作用 | 新fresh短窓ON/OFFの非作用と、正式観測1件対旧基準実250の全既存物理/events/replay/終端一致を別々に証明。metadata/追加観測だけを除外し、短窓を全250証明へ拡張しない | 短fresh ON/OFFと正式250対旧基準の一致を確認済み |
| R4 記録の意味 | 各1/120更新と内部solver接触時点を区別。位置補正/反発/接触回数/固有球数を分け、substep位置だけから衝突部材を推定しない | API/記録定義待ち |
| R5 経路・最終接触 | 出入り・落下の分類を事前定義、未観測/判定不能はunknown。最後の接触は実solverの時刻順記録で確認し、各釘の初反発リスト末尾を最後接触と呼ばない。全shot→outcome/残球を追跡 | 計画/新raw待ち |
| R6 原図対応 | 原図観察/コードの静的計算/モデル内の実観測/機能仮説を分離。実寸・奥行・メーカー意図は未校正、形の一致だけで機能一致を保証しない | Designer原図照合待ち |
| R7 映像 | 新raw/sourceと同時刻・座標・計数/部材geometryの一致、抜粋/速度/再掲/保持の範囲を表示。実frame目視と動画等速自然再生・終端/エラー/seek有無を確認 | 無音観測player・媒体未完成 |
| R8 提案と終了 | 観測根拠と限界から修正案は1つ。具体的対象/期待/副作用/必要検証を記し、未実装を明示。今回の観測完了を入賞改善達成や提案採用/公開へ拡張しない | 観測/PM判断後 |

## 担当・次Ready

- Lead：受動トレースの実装、ON/OFF一致、正式入力/記録定義と保存。完成後にSMがコード/guard/証拠を読む。
- Designer：原図と現モデルの対応・無音映像player、抜粋と実時刻/geometryの対応。SMの計数監査と目視判定を分ける。
- SM：本票だけを編集。正式凍結後の全rawSHA/実250/全計数/fixed/最後接触・unknown分類/媒体対応を独立監査する。
- PM：計画/凍結・代表画面/実行・採否・Git/Issue/PR操作。手順内の承認済み作業を進め、修正案の実装は今回の承認に含めない。

現時点で正式試射/コード編集/新テストは監査担当から実行しません。計画が揃ったら観測窓・記録粒度・容量/欠測・分類とON/OFF証明の範囲を先に照合し、不足はLead/PMへ報告します。測定/撮影quietを守り、同じ旧証拠の重複監査や改善候補探索を追加しません。

## 正式計画への対応と非作用証明の範囲（2026-10-16）

PM正式計画を読み、全固定値/原記録同一性、非作用、実250計数/終点、分類/実最後接触、原図と表示/接触、動画/未実装提案の6受入項目を上のR1〜8へ対応づけました。代表球は各主要区分の最小IDを原則とし、欠測/unknown/複数回通過・イベント回数と球数を分けます。

- **新fresh短窓OFF/ON：** 同じ入力で新observerの有無だけを変え、既存の物理状態・events・全replay/終端が一致する直接証拠を確認します。observerが本物stateを変更できない構造もコードで確認します。
- **正式観測1件対旧基準250：** HEAD24d7edf/source7962…の保存fresh基準（15ヘソ/6一般/229OUT、実250＋45秒）と、新観測の全既存物理/events/replay/終端を照合します。source等の記録metadataと追加観測以外の差は成功にせず、除外項目を明示します。旧原記録のsourceを書き換えません。

新OFF250を重複して追加しない方針です。短窓一致と旧250実記録との一致は証拠の範囲が異なるため、片方だけで両方が証明されたとは扱いません。現時点は正式トレース0発・新テスト/映像未検証です。

## 観測実装前の別版CI（2026-10-16）

[run38837167358](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/38837167358) attempt1をAPIで読み取り、head `1ff021b195ba3705f85c3a58be8bd43346375dd4`、completed/success、unit/browser/verify全3ジョブ成功を確認しました。単体step、一般全ブラウザ、配置ツールfull比較、verify結合stepも成功です。

これは受動トレース実装前の別版CIです。今回大量artifactは取得せず、unit件数/候補/全資産の新しい独立監査はしていません。開発中の新observerの非作用や正式観測・新HEADのCI成功へ転用しません。新正式試射/重いテスト/ソース変更/Git操作は行っていません。

## 正式実250前の実装read監査（2026-10-16）

Lead担当5path（physics/passive-trace、physics本体、dev collector、runner、直接test）と`route-implementation/`を確認しました。担当5file SHA・186 unique coverageの現bytesは保存値と一致、precommit sourceは`e5e6b5d4e04b43f5f82a1cd20b56828588e332a9f5ac6a0aa96ba2a4060355e0`です。準備時HEAD1ff021bを正式測定HEADへ付け替えません。正式実250はまだ0件です。

- **非作用設計：** sinkへ渡す球点は値copy、部材はclone、pair両側も値copyで、本物のstate参照を渡しません。同期hookはfinallyで復元し、予測経路は記録対象外です。predicateは記録可否だけを決め、原solverは真偽いずれも1回実行します。polyは固有solid.boundsで保守判定し、互換a/bだけで取りこぼさない設計です。
- **記録の粒度：** 各内部substep前後、自由積分motion、solverによる変更接触、outcomeをseq順で分けます。pairは双方ID/前後状態、速度反転と位置だけの補正を記録。gapは有限中心線交差で、自由運動/solver補正・front前後・半径clearanceを分離します。接触時刻はsubstep内で同一になり得るため順序はseqで読みます。
- **最後の接触の限界：** `lastChangedContact`と`lastVelocityChangingContact`は、実solverが位置/速度を変更した記録の最後です。状態変化を伴わない幾何的な接触まで記録した「最後の全接触」とは呼びません。単なる中心線交差も球全体が抜けた証明ではなく、unknown/半径clearanceの留保を維持します。
- **旧raw照合：** 旧圧縮/展開SHA/bytes・元provenance/source/HEAD・config/layoutSHAを先に検査。新旧canonical全JSONから除外するのはsourceSHA/planSHA/caseManifestSHAの3metadataだけで、configSHA/layoutSHA/flowOptions/全旧観測も比較対象です。正式1回後の一致はまだ未検証です。
- **保存/失敗：** baseline/phase0だけ、旧oracle bytes/provenance/manifestもsourceへ固定。既存started記録上書き拒否、raw/trace-summary/失敗実数と始終source/HEADを保存します。traceはJSONL逐次書込み→gzip、双方SHA/bytesとrecord数を残し、元error/旧失敗を成功へ書換えません。

`focused-final-v3.log`は24/24成功、fail/skip/cancel0、883.647833msです。本文で2秒発射＋1秒排出のOFF/ON全JSON一致、copy変異不能と例外復元、実pin補正false/反発true、pair両ID、有限gap分類、poly bounds、保存gzip canonical比較、合成250の全終点を確認しました。短窓/合成controlを正式250性能や非作用の全窓証明へ拡張しません。監査担当による再実行はありません。

現時点のreadで正式観測を妨げる重大指摘はありません。正式freezeと1回の新raw/trace終端、旧基準全既存値一致、分類/映像/原図照合/提案1つは未確認です。本票以外の変更・試射・重処理・Git操作はしていません。

## 正式観測1件・全トレースの独立監査（2026-10-16・最新）

`route-trace/baseline-phase0/`の成功provenanceでHEAD `dabdd358b77367e35366e4af5fa039bb69b2f1db`とsource `e5e6b5d4e04b43f5f82a1cd20b56828588e332a9f5ac6a0aa96ba2a4060355e0`の始終一致、186 unique入力現bytes、実行PLAN/manifest、全原rawの圧縮/展開SHA/bytesを確認しました。旧oracleの保存参照/成功guardも保持しています。

正式250の生shot/outcome各250固有IDはヘソ15・一般6・OUT229で一致。返却/残球/滞留/LCD4区分は0、停止152.916667秒＋排出45秒＝終端197.916667秒、元101全座標/属性、全既存fixed/機構・規則30Hzframeの計数と実終点も確認しました。

sourceSHA/planSHA/caseManifestSHAの3metadataだけを除外し、旧風車fresh基準の全既存JSONと新rawを独立deep比較して完全一致しました。config/layoutSHA、flowOptions、events、全replay、全旧観測・終端を含みます。旧原記録やprovenanceを新sourceへ付け替えていません。

大きなtraceは逐次読み取りのみで検査しました。gzip79,815,949 bytes、展開1,061,241,065 bytesの双方SHA一致、全1,666,878行のseqが連続しています。型別はsubstep341,804、自由motion977,739、変更contact347,058、outcome250、gap-cross27です。全170,902内部substepでbefore/afterのindex・時刻/区間/dtが対になり、各球の実最後changed接触/最後velocity-changing接触/実outcomeを全streamから再構成してsummaryの全250球と一致しました。pair双方IDも同じ実seqから対応づけています。

これは受動観測の保全/非作用/計数の確認であり、globalCSVの全球経路分類・unknownの理由や代表選択の妥当性、映像/原図の意味・修正案1つの受入は別です。Leadの分類集計後に実発射250を分母として監査します。新たな配置・寸法・物理修正/改善比較は行わず、目標60/750未達は維持します。監査は本票の編集と逐次読取りだけで、重い試験/新試射/再撮影/ソース/HEAD/Git変更はありません。

## 全球分類・観測根拠の独立照合（2026-10-16・最新）

[S8_ROUTE_OBSERVATION.md](S8_ROUTE_OBSERVATION.md)と`route-analysis/`を読み、保存traceを逐次再読して各球の実pin変更/成功反発・風車変更/成功反発・皿接触・実前面の風車最短距離を再構成し、all250.json全250球と一致しました。既に監査したtrace-summaryの全gap/最後接触/outcomeとの対応、CSV全250行・主分類と中心のみ分類・終点/最後seq、全集計fileのmanifest SHA/bytesも一致しています。

| 最初の有効な幾何横断（排他） | 球数 | ヘソ | 一般 | OUT |
|---|---:|---:|---:|---:|
| 通常23隙間 | 6 | 0 | 1 | 5 |
| 大切れ目2組 | 18 | 0 | 5 | 13 |
| 有効横断なし | 226 | 15 | 0 | 211 |
| 全発射 | 250 | 15 | 6 | 229 |

有効条件は実front前後・自由積分下降・有限中心線交差・半径余白非負です。負の3球（13/227/249）は全OUTで主表の有効なしに残します。位置補正cross0・背面/混合cross0を確認しました。群を排他表と重複観測に分け、横断だけを原因にしません。

有効横断なしOUT211のうち、道実変更なし203・あり8。左初下降OUT180は道変更0で、全180が実前面点で風車の全回転包絡＋球半径13.1内へ入り、実成功反発71/なし109でした。後者109は風車の位置補正を含む変更接触も0です。これは回転4腕をsolid円と見なす根拠ではなく、変化しない幾何touchは未記録です。y713一点だけの距離を全経路の必要移動量/解決案にしません。

皿接触16球はヘソ7/一般3/OUT6、末端矩形20球は11/3/6で一致しました。両群は重複し、矩形未入域を末端未到達の因果へ拡張しません。主排他区分×終点の最小IDは、有効なしOUT1/ヘソ2、大切れ目一般7/OUT12、通常OUT34/一般107で、代表表と一致しています。都合のよい成功球だけの選択ではありません。

局所unit receiptは同HEAD/sourceの623/623成功・失敗/skip0をログ末尾とlogSHAで確認しました。ローカル単体証拠で、新CI/映像/PR受入とは別です。次の提案は「風車の見た目と接触形状の共通化・実位相の照合」1案へ絞るPM方針ですが、提案は未実装、修正効果/60ヘソ目標は未達のままです。元図/媒体の実見・再生は担当提出後に別監査します。本票以外の変更・新試射・試験再実行・Git操作はありません。
