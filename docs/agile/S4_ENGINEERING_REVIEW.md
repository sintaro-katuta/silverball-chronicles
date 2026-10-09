# S4 開発検証（進行中）

基準release/0.1.0 `7ec4c6ad`、隔離clone `/private/tmp/silverball-s04-20261009`。原dirtyworkspaceの製品コードは変更しない。版変更・push・PR・本番公開はPM管理。

## #19 最小CI改善

unitとbuild＋全browserを2runnerへ分離、alwaysのverify joinを必須として成功jobのみ・同commit/source全entry/資産全path size SHAが一致する場合だけcandidateをverified化。browser単独はbrowser-verifiedで通常verify/publish拒否。多shard・製品時計改変・検証削減なし。CD/local release:prepareは全検証逐次を維持。phase wall時刻はprivate cacheへ開始/終端/失敗を保存、unit失敗時も合格receiptを出さずタイミングをupload。タイミング保存失敗がoperation元errorを覆わない。

Node24.21.0でCI/releaseworkflow/CD/longreach関連88tests成功。HEAD8c5d4f782a858886766edf9ed055619e5096c33d固定後に実全unit488pass/失敗skipcancel0、111testfiles全inventory、Node24.21、wall151.65秒を確認。511入力source SHA81ddf54148020bd89877ef75742bb7a5a4bcb203c76ea315a1edec5b42e587b6。これはローカルPC値でLinux改善値ではない。guardsは失敗/cancel/skip/missingjob、test inventory/低件数、異SHA/source、欠落check、資産追加/変更/重複/不正path/UUID、実privatebytesjoinと失敗manifest削除を含む。actionlint1.7.12で両実workflow exit0、構文/diff check成功。

遅い自然待機のコード根拠：board-runtimeはrAF経過dtをflowへ渡すが、ball-flowは1frameにMath.min(.05,dt)だけ蓄積する。描画間隔が50ms超ならsimulationの進行がwallより遅くなる。S3成功PUSHの約49.45演出秒/228.3wall秒という観測と整合するが、成功時rAF/backend実値が無くGPU原因は断定しない。この製品clock/物理保護を変更せず、2runner化の効果は逐次工程の和をcriticalpathの長い側へ置換する範囲。

費用と効果：2job重複setup＋小joinjob＋artifact転送は増えるが、unit6〜7.5分とbrowser8〜14分の逐次criticalpathを長い方へ変える案。数値目標/固定反復数は置かず、判断に必要な実CIを取得して採否を決める。ローカル同PCの順次実行はLinux並列速度改善の実証にしない。

## #17 flash vow構図

ending flashの6〜8秒だけ `camera.y += 4 * smooth((t-6)/.25) * smooth((8-t)/.25)`。x/scale/人物・刀・保留/字幕/時計は変更しない。6/8境界は追加補正0。Designerは両幅の原7秒/52枚前後列の実見で+4を採用推薦。最終採用はPM判定。旧camera自体のcut境界まで連続化したとは称さない。

固定before対after pose oracle10,440cases（3variants×standard/revival/flash×win/loss×0〜58秒0.1間隔）で、envelope非0の許容case120（near8浮動小残差で実camera差0の6case含む）/実pose差114、camera.y以外の旧fieldが全一致。最終浮動sampleは57.9秒、6/8のexact境界は別直接unitで確認。longreach12tests成功。両幅5.8〜8.2の13PNG/全尺/出口はDesigner取得済み、guard不変/errors0、Designer実見で顔余白改善、刀/握りのcrop・補正残り無し。全フレーム鑑賞/聴感確認とは区別。再現tool `prototype/tools/s04-flash-review.mjs` はpresentation fixtureだけを開始し、その後seek/freeze/clock倍率変更なし。指定flash lossは構図fixtureで自然RUSH入賞や当落率の証明ではない。

## #13 A固定維持

5台catalog.noteを『月影機関の1〜5番台は、釘配置が共通です。』へ訂正、既詳細spec内の小hint1文へ表示。従来note未表示を表示済みに読み替えない。新help/menu/台UIは増やさない。

catalog旧比較でnote5文以外ID/台番号/pegSeed/他15units完全同一。physics/domain全src bytesは旧beforeと一致。既migration-prep4tests Node24で成功、非LCDseed物理baselineを保持。両幅×5台の実floor選択/詳細hint/台番号/非溢れallpass。390台5は次ページの実クリック、390台5/1440台1原画像の実見で読取・非重複を確認。

## 証拠・残件

原 `prototype/reference-review/s4-2026-10-09/{flash-before,flash-after}/` に自然時計PNG/WebM/records/sourceguard（Git非同梱）。短関連ログ `/private/tmp/s04-node24-related.log`、`s04-ci-tests.log`、`s04-catalog-regression.log`。before/afterは/tmp固定runtimeから取得しCIhelperの編集と切り離した。clone製品src差分はmain.js/catalog/long-reach-timelineの3だけ。

HEAD/sourceInputsを固定して実全unit＋browser＋joinが成功。Linux実効果は未実証、全AC受入はPM判定。#11 CD25分予算と公開/Secrets、音の実聴取は別残件。

## 固定HEADの実統合結果

HEAD `8c5d4f782a858886766edf9ed055619e5096c33d`。source511入力SHA `81ddf54148020bd89877ef75742bb7a5a4bcb203c76ea315a1edec5b42e587b6`。Node24.21.0 / npm11.19.0 / 管理Chromium、local darwin。

|段階|実測wall|結果|
|---|---:|---|
|全unit111ファイル|151.65秒|488pass、fail/cancel/skip/todo0|
|release build|8.09秒|一度だけbuild|
|自己preview準備|0.23秒|自前port、終了cleanup|
|release browser|9.37秒|390/1440、全25素材/HTTP/休止復帰|
|controls|5.37秒|focus/keyboard/発射/終了|
|feedback|150.71秒|両幅3view/パネル/結果、battle/bonus/rush/実専用入賞payout/通常復帰|
|aggregate＋verify|exit0|全unit/browserの同SHA/source/全45資産照合|

候補 `f00a4443-41d8-4bf5-8ac5-fefeadc333f2`、verified、45資産14,902,484B。原 `prototype/reference-review/s4-2026-10-09/local-split-8c5d4f7/{index.json,artifact/,s04-*.log}` へ保全し、コピー後全path/size/SHA一致、全unit/browser source entry一致を独立再計算。candidate.issueNumbersは実値[]のまま、PBI対応は台帳で別記。

候補gitは**dirty=true**：S4_ACCEPTANCE/S4_ENGINEERING_REVIEWの未tracked docsと、Designer作成 `prototype/tools/designer-catalog-review.mjs` が未tracked。このharnessはunit開始時からsource511入力に含まれ、始終不変。後commitするかは所有確認後PM判断。GitHEADを後の文書headへ付替えない。依存/media/logはPR非同梱。全物理回帰を短縮・削除していない。

local同PCでunit→browserを順次実行した機能検証であり、Linux2runnerの効果・課金・flake改善の証拠ではない。PR CIの実時間・各job wall/合計runner時間/同source coverageを受領後に採否を判断し、数値目標や固定3回測定は設けない。CD25分のprepare＋公開全browser再smoke予算は現releaseの別gate。

### #13 本編5台の追加短確認

詳細のみのDesigner10条件と分け、固定after5222にて390幅で台1〜5の実一覧選択→詳細→プレイ開始→イントロスキップ→本編情報パネル台番号→休止→結果/台選択へ退出を追加。全5台成功、errors0、専用Chrome終了、runtime inventory始終不変。公開snapshotのLCD/口幅20/休止状態も確認。全画面再撮影・物理長期計測・全回帰は追加しない。原 `prototype/reference-review/s4-2026-10-09/catalog-gameplay/{records.json,unit-gameplay.executed.mjs,gameplay.log}` （Git非同梱）。

実catalog moduleのID tsukikage-1〜5、番号1〜5、pegSeed101〜105は採取一致。本編snapshotはseed/IDを直接公開しないため、実seed採取と称さない。コードはfloor handlerがFLOOR_ONE indexをselectedへ保持（main27）、details/main panelがselected.unit（main38/61）、mountBoardへunit:selected（main74）、resetがcreateBoardFlowへunit.pegSeed（board-runtime61）、factoryからPhysicsへ渡しLCD固定配置に置換する。対応はこの静的forwardingと実5台開始/本編台番号を合わせて確認した。非LCDのseed物理baselineは既4testsで別確認済み。

追加QAは/tmpスクリプトのみでclone商品/source編集無し。旧local candidate8c5/source81ddのGitやsourceは後portableharness commitへ付替えない。
