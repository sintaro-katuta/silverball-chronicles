# Engineering baseline — 2026-10-07

担当：リードエンジニア。Sprint 1 の提案作成のため、作業ツリー現行版をローカルで検証した。ユーザーの追加指示により、各スプリントはユーザー確認後に開始し、PBIの正本はGitHub Issuesとする。今回の表示変更は事前着手・未受入で保持し、追加編集・不具合修正は停止した。PR・commit・デプロイ・クラウド更新は行っていない。

## 現在地と仕様

AGENTS.md、docs/pachinko.md の冒頭/最新追記、DESIGN.md、ARCHITECTURE.md、PLAYER_FEEDBACK_2026-10-07.md、RECEIVING_TRAY_2026-10-07.md、STARTUP_REFACTOR.md、PRESENTATION_REFACTOR.md、CLOUDFLARE_DEPLOYMENT.md と両 package.json を確認した。最新仕様を履歴より優先し、過去の成功ログを今回の証拠へ転用しない。

- 本編は PixiJS。PlayCanvas は部品確認・旧表示等で利用。本番入口は index.html のみで、確認ページは別ビルド。
- W制御の抽選済み記録、FIFO、実球入賞・V・払出を維持。内部V経路・開放時間・通常低確普図等は暫定policy/未完。完全再現とは判定しない。
- 最新は幅20/初期強度.20、101釘、接触受け皿、常設操作、独立演出体験、1〜9図柄。演出尺は54/58/12秒、採用済み高DPI・補間、25画像並列ロード・公開用WebPを維持。
- 多数の既存未コミット/未追跡変更がある。全面ステージ・上書き・旧状態への復元は実施していない。

## 今回の実行

2026-10-07 08:49〜08:53 JST。Node v25.8.1、npm 11.11.0、macOSローカル。ログは 今回の証拠：`../../prototype/reference-review/agile-2026-10-07/`（ローカル保存証拠、PRへ同梱しない） に保存。

|コマンド|結果|証拠/条件|
|---|---|---|
|`npm test`|失敗：381件中380成功、1失敗、150.98秒|npm-test.log。DUX-01編集前に開始、ドメイン/物理編集なし|
|`npm run build`|成功|build.log。game chunk 511.86kB、既存500kB警告|
|`npm run build:release`|成功|build-release.log。game-DMR7qvaL.js、514.65kB、既存警告|
|`npm --prefix prototype run preview:release -- --port 4178`|ローカル起動成功|preview.log。アップロードしない|
|`npm --prefix prototype run test:release`|sandbox内Chrome起動失敗→制限外再実行成功|release-browser.log/release-browser-retry.log。390×844/1440×900、25画像全読込・停止/再開・HTTP/ブラウザエラーなし|
|`REVIEW_URL=http://127.0.0.1:4178 npm run test:browser`|sandbox内Chrome起動失敗→制限外再実行成功|session-controls.log/session-controls-retry.log。停止・ポーズ・フォーカス・再開・退席|
|`node --test prototype/tests/left-discrete-pins.test.js`|2件中1成功/1失敗|right-road-failure.log。同じ失敗を単独再現|
|`npm run build:release`（DUX-01後）|成功|build-release-dux01.log。ローカルのみ|
|`git diff --check`|成功|2026-10-07 08:51 JST実行|

Chromeの最初の失敗は起動時SIGABRT/kill EPERMで、アプリassertに未到達。同じ既存テストの制限外再試行は成功しており、アプリ失敗と区別する。

## 品質欠陥

`tests/left-discrete-pins.test.js:25` の `the free midpoint must not act like a continuous wall` が失敗。右道釘5点の一致と不可視michi連結segmentなしのassertは通る。最初の2軸中点を横断する実球probeが横断しない。別部材との接触、probe前提、実経路問題のどれかは未診断。ゲーム変更を避け、Issueとスプリント確認後に調査する。全テスト成功とは判定しない。

## DUX-01 の事前着手・未受入差分

PM/デザイナーと値の意味を確認。保留混在という初期仮説はlegacy画面の誤認だった。本編の `#draws` は `game.draws` 単独で、SessionGame.step の図柄初期停止時に増え、その後に長尺演出へ進む。最終当落告知前の回も含むため「結果が出た回数」の説明は正確でない。

`src/app/main.js` の情報パネル/結果を「消化回数（通常＋RUSH）」、数値N回、説明「通常とRUSHで消化した抽選の合計（演出中を含む）」へ変更。抽選、FIFO、会計、バー、盤面、カウンタ処理の変更はない。結果は既存の大当りとの複合行を維持した。

既存 `tests/feedback.browser.mjs` に、snapshot.spin.drawsと表示一致、3表示のパネル横溢れ/バー非重なり、停止/再開、結果の名称/値、体験終了後の通常0回への復帰assertを追加。専用重複テストは作っていない。`web-pachinko-design` とreview参照を適用した遊技外UIの意味整合修正であり、参考実機の仕様追加はない。

390×844/1440×900の3表示パネル、停止/再開、結果assertは成功（feedback-dux01.log）。新規8画像をデザイナーが目視し、6パネルは欠字/重なりなしを確認。一方390-resultは長い複合ラベルの「り」が孤立し、値も折返し、未合格。短い結果ラベルまたは別行化の修正候補はあるが、ユーザー確認前の追加編集停止を優先して未修正。

体験3経路も完了・成功（feedback-dux01.log、exit 0）。戦闘の実PUSH→右打ち案内→実払出、大当り実払出、RUSH再生、各体験終了→通常0回/獲得0、snapshot一致を確認。体験当選条件は指定であり、自然当選成績とは区別する。最終記録は2026-10-07 08:54 JST。

## 次の小さな独立候補（Issue化とSprint確認待ち）

1. **右道釘probe失敗の切り分け**。AC：失敗球の接触部材/軌跡を記録し、5釘・不可視橋なしの要件とprobe前提を確認。根拠ある最小修正後に当該2件、自然右打ち→普図→電チュー2→V2→3000、停止後残留0、会計/FIFOを通す。吸引・球消去・軌道置換を使わない。調査だけで済む場合も「実球経路が合格」を誤認しない。
2. **DUX-01結果画面の折返し修正**。AC：390/1440の現行releaseで名称と値の対応を読みやすくし、欠字/孤立文字/横溢れを解消。同じ消化済み値と演出中を含む意味を維持し、デザイナーの新規画像再判定を得る。domain/physics変更なし。
3. **検証入口の整備**。ルートには test:release がなく、prototypeへ別指定が必要。AC：クラウド操作を含まない明示的ローカル検証の入口/記録を一貫させ、release生成→preview→25画像/操作/準備キャンセル・再試行が再現できる。既存失敗を隠すassert削除や単なる警告閾値変更をしない。

## 未検証

スマホ実機/GPU/熱/長期性能、Capacitor、音の実聴取、長期自然抽選成績、W内部の未確定policy、今回の公開先との一致、全演出全尺は未検証。headlessの寸法/動作成功をこれらの保証へ拡張しない。

## Sprint 1 承認後の #2/#3 実施（2026-10-07）

ユーザーの「はい、大丈夫そう」を対象 #2/#3/#4 の開始承認としてPMがSprint 1をActiveに変更。PBI正本は [#2](https://github.com/sintaro-katuta/silverball-chronicles/issues/2) / [#3](https://github.com/sintaro-katuta/silverball-chronicles/issues/3)。上記の事前着手/停止は履歴であり、次の変更は承認後に行った。

`software-delivery` に従い、IssueのAC→対象コード/fixture→回帰→運用をこの追記に対応付ける。変更範囲は `tests/left-discrete-pins.test.js`、`src/app/main.js` の結果ラベル、既存 `tests/feedback.browser.mjs` の対応assertだけ。物理コード・抽選・FIFO・会計・受け皿・常設バー・追加リリース機構は変更しない。

### #2 要求・診断・設計

AC1の単独再現から、20stepの位置/速度/lastContactを採取。右釘の第一/第二軸の中点は236.25/546.5、間隔4.61。旧probe初期位置は最新の `heso-guide` 受け皿に重なり、最初のstepで受け皿へ接触して方向が変わる。その後にmichi釘へ当たり、20stepの横断が起きない。同条件でfixtureの `heso-guide` だけを外すと7stepで横断する。診断ログ：`../../prototype/reference-review/agile-2026-10-07/right-road-diagnosis.log`（ローカル保存証拠、PRへ同梱しない）。

原因は釘gap単体テストに受け皿が混入したこと。現在の受け皿を撤去/縮小すると最新採用仕様を壊すため、AC2の最小修正はテストfixtureの分離を選択した。元の「michi collider 0」「5点釘一致」を維持し、gap横断は受け皿だけ除いたfixtureで検証。同じfixtureへ第一/第二軸をつなぐ人工michi segmentを加える負例を追加し、横断が阻止されることも確認する。実欠陥をassert削除で隠さず、不可視橋が導入された場合に確実に検知する。

AC3はfull-boardの受け皿/排出/自然右打ち/会計/FIFO回帰により別途検証。受け皿を除外した単体probeの成功を、full-boardの自然経路成功へ転用しない。

### #3 要求・設計

情報パネルの「消化回数（通常＋RUSH）」「N回」と合計説明は保持。結果の複合ラベルだけ「消化回数 / 大当り」へ短縮し、説明で「通常とRUSHで消化した抽選の合計（演出中を含む）」を維持。カウンタやsnapshotに変更はない。既存feedbackテストの結果ラベルassertも対応した。新画像は s1-dux03：`../../prototype/reference-review/agile-2026-10-07/s1-dux03/`（ローカル保存証拠、PRへ同梱しない） に保存。

### 検証と運用

2026-10-07 08:58 JST開始。`node --test prototype/tests/left-discrete-pins.test.js prototype/tests/heso-calibration.test.js prototype/tests/rush-physics.test.js prototype/tests/w-session-flow.test.js`：13件全成功、29.60秒（s1-related.log）。実球による普図→電チュー2→V2→3000、密集時10count境界、受け皿排出等を含む。

`npm run build:release`：成功（s1-build-release.log）。現行JSは `game-BSMJhrm5.js`、公開用画像49.24→12.40 MiB、既存500kB警告。4178のlocal previewを利用し、以降再buildせずデザイナー#4と同一ビルドを確認。

`REVIEW_URL=http://127.0.0.1:4178 FEEDBACK_OUTPUT=../reference-review/agile-2026-10-07/s1-dux03/ node prototype/tests/feedback.browser.mjs`：390/1440のUIassert成功、体験経路は継続中（s1-feedback.log）。全回帰も実行中（s1-all-tests.log）。完了とデザイナー判定は追記する。

運用はローカルbuild/previewまで。今回変更のrollbackは対象ラベル/fixtureのみを戻す差分に限定し、作業ツリー全体を戻さない。PR/commit/クラウド更新は行わない。追加リリースPBIは未承認のため未実装。

#2全回帰：381件全成功、172.82秒（s1-all-tests.log）。#3の新8画像はデザイナーが再目視し、390結果の孤立文字と値の折返し解消、6パネルの意味/欠字/非重なりを合格。s1-feedback-payout.logは3経路までexit0だが、当初の `w.payout>0` は一般賞球を含むため「大当り実払出」の証拠には使わない。PMからのレビューで `w.bonus.payout>0` と `counts.bonus>0` の専用ゲートへ変更し、snapshot JSON保存を追加した。これを #10 の実正常prepareに含め、最終証拠を更新する。

## Sprint 1 #10 実装・検証設計

ユーザーの「はい、それで進めてください」で追加 [#10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10) を開始承認。`tools/release-workflow.js` と `tests/release-workflow.test.js` を追加、root/prototype package scriptsへ `release:prepare` / `release:verify` / `release:publish` を追加。旧 `deploy` は再buildを廃止しpublishへ委譲し、confirm不足なら送信前に失敗する。

prepare開始で旧active candidate manifestを無効化。npm test→release build→自前の空きport/strictPort preview→既存release/操作/feedback検証を実行。成功後、UUID固有 `.cache/release/candidates/<id>/assets/` に検証済みbytesをcopyし、集合/サイズ/SHA一致を確認する。`candidate.json` は同 `.cache/release/` でatomic発行。内部manifest/checks.log/feedback画像は公開assetsの外に置く。既存4178は終了対象にしない。

sourceFingerprintはroot packageとprototypeのsrc/public/tests/tools/package/lock/vite/wranglerを安定パス/サイズ/SHA digest化。docs/reference-review/tmp/dist/.cacheを除外し、PM/SMの資料編集による偽失敗を避ける。検証前後sourceとbuild資産が一致すること、publish直前には固定assetsの全ファイル集合/サイズ/SHAとsource/configを再照合する。後のdist再buildは固定candidate bytesに影響しない。

publishは明示 `--confirm-target tsukikage-pachinko` が必要で、現在のWrangler config実name/routes/Workers.dev/assets設定も照合。設定は現ファイルが使用するstrict JSON subsetのJSONCだけ受理し、未知形式をfail-closedとする。Wrangler installed helpで `deploy --assets` と `--name` を確認し、固定candidate assetsだけを指す。CLI confirm flagは誤操作防止であり、ユーザーの具体候補への公開許可を代替しない。今回はpublish本体を実行していない。

fixture20件：テスト/build/preview/browser失敗の候補無効化・preview cleanup、改変/追加/欠落/source変更/symlink/パストラバース/manifest欠落の送信前拒否、明示flag不足/未知args拒否、actual Worker不一致拒否、固定candidateのbytes送信経路、deploy失敗の非成功、docs変更の許容が成功（s1-release-workflow-tests.log）。`npm run deploy` 単独も実際にexit1し、送信前拒否（s1-deploy-gate.log）。

正常経路 `npm run release:prepare -- --issues 2,3,4,10` は実行中。条件にはNode/npm/Chrome/installed Vite/Wrangler/Playwright版、commit/dirty、Issue番号、候補ID、日時、check一覧、logPathを記録する。実公開・GitHub Actions/Secrets/クラウド設定変更は未実施。

### #10 正常経路の最終結果

2026-10-07 09:08:52 JST、`npm run release:prepare -- --issues 2,3,4,10` 成功。全401テスト成功/0失敗、148.51秒。release buildと25画像/停止復帰の390×844/1440×900、操作/フォーカス/退席、既存feedback全3体験/通常0復帰が成功。公開用JSは `game-BSMJhrm5.js`。

候補ID：`79011609-06b2-4c3b-8ca4-2e4689a27c15`。45資産、14,885,469 bytes。commit `941f79d2e9b114c41a4c4e559dfa1c17b24e10a5`、dirty=true。source SHA `a8013c242d72a38f353097ba481836f95ed4ed1ae7dd1d01193b45224b52ba0c`。active manifestは `prototype/.cache/release/candidate.json`、固定資産は `.cache/release/candidates/<id>/assets/`、checks.log/feedbackはその親に保持。現ソースの追加変更はverifyが拒否するため、変更後はprepareから再検証する。

Node25.8.1/npm11.11.0/Chrome154.0.8037.98/Vite8.3.0/Wrangler4.147.0/Playwright1.63.0。Chrome headlessのローカル画面であり実機/音の品質保証ではない。manifestは上記環境・Issue2/3/4/10・check条件・dirty情報・sourceと全assetsの各SHAを記録する。

`npm run release:verify` 成功。実固定candidateのindex.htmlを同じbyte長の1byteだけ変更し、publish stubがdeploy runnerへ到達する前にhash不一致を検知することを確認。finallyで元bytesへ戻しverify再成功。self-owned preview `127.0.0.1:56109` の終了（接続不可）と既存4178のHTTP200を確認。試験中もWrangler deploy本体は呼んでいない。

最終のbattle/bonus JSONは双方 `w.bonus.payout=15`、`counts.bonus=1`、`spin.draws=1`。一般賞球でなくattacker専用払出と実入賞を確認してから撮影し、各体験→通常0回/獲得0も成功した。これは指定当選の独立体験であり、自然当選率の成績へ加算しない。以前のtotal/w.payoutだけの証拠は大当り払出合格に使わない。

証拠：`s1-release-prepare.log`、`s1-release-workflow-tests.log`（20fixture成功）、`s1-deploy-gate.log`（旧deploy単独exit1）、`s1-release-verify.log`、`s1-release-candidate-checks.log`、`s1-candidate-checks.log`、最終画像/実入賞JSON：`../../prototype/reference-review/agile-2026-10-07/s1-final-feedback/`（ローカル保存証拠、PRへ同梱しない）。`git diff --check` は最終再実行成功。

変更のAC対応：#2の原因/最小fixture/負例/全回帰、#3の名称/値/補助説明/新画像/停止復帰/体験分離、#10の単一prepare/失敗無効化/atomic manifest/候補凍結/sourceと全assets照合/actual target/送信前guard/cleanup/非公開metadataを実検証。運用と公開後/rollbackは [RELEASE_MECHANISM.md](RELEASE_MECHANISM.md) でSMが照合する。実公開、公開後本番検証、rollback、GitHub Actions/Secrets、commit/PRは未実施。PM受入判定待ち。

## Sprint 1 #11 CI/CD のローカル実装

ユーザーが#11を追加承認し、最新運用を「各Sprintのbranch→`release/<version>`へPR、3Sprint集約後に同release branch→mainのPR/merge、mergeを起点にRelease/CD」と指定した。先のmain向け1PRと手動publishは履歴。実branch/具体version/tag/commit/PR/GitHub Release/Cloudflare公開/Secrets・var登録は今回行わない。CD有効化は運用文書で別の明示ゲートとして保持する。

対象：`.github/workflows/pr-ci.yml` / `release-cd.yml`、`tools/release-cd.js` / `tests/release-cd.test.js`、既存3browserだけの `tests/browser-launch.js` env選択、root scripts `ci:check-pr` / `release:cd`。#10 source fingerprintへworkflow入力を追加し、previewへ非公開envを渡せる最小対応を追加。既存ゲーム/盤面/抽選/FIFO/出玉/画像は変更しない。

PR CIはsprint→releaseとrelease→mainだけを検証、contents:read、公開Secretsを持たない。CDはclosed/merged=true/base main/same repo head release/、repository var `ENABLE_PRODUCTION_CD=true`、production environmentに限定。checkoutはeventのmerge_commit_sha、branch suffix/tag/packageの安定SemVer(vなし)とcheckout/既存tag/Releaseを照合。未公開/途中runはcurrent main一致、新版はlatest成功版より新しいことを要求。既に成功した同版同SHAは歴史runでも再deployせずnoop、異SHA/異版の衝突は拒否。

3SprintのPM受入済み内容をrelease PR本文の `silverballReleaseSummary` 単一JSONで入力し、3正のdistinct Sprint/重複なしIssue/改善・修正・制限と版を形式検査。API generated notesを下段へ併用してsquash時のmain PR一件だけから内容を読めるようにする。形式検査がIssueの実受入/主張の正しさを保証するとは扱わず、PMレビューを残す。

CD順序：検証/固定候補→main再照合→fresh現deployment/全Version trafficをrollback根拠としてpre-deploy checkpoint→同じ固定候補publish→Cloudflare APIで記録Version100%active確認＋公開asset SHA→公開URLでrelease/操作/3体験smoke→main再照合→notes/draft Release/manifest・record・notes添付→添付成功後のみRelease公開。`_headers`はCloudflareが消費する設定でHTTP資産比較からだけ除外し、candidate manifestには残す。

途中のcheckpointはrun artifactからrestoreし、版/SHA/summary/source/asset digest/Workerを照合する。deployed checkpointは再deployせず、必ずfresh APIのVersion100%とHTTP SHA/smokeを再確認。pre-deployで終わった曖昧な失敗はfresh prior deployment/trafficが記録と同じ時だけ再試行し、変化していれば運用で照合するまで止める。添付失敗はdraftを成功Releaseにしない。prepare/browserの子process/previewからCloudflare/GitHub credentialsを除き、internal manifest/record/logへ秘密値を記録しない。

concurrencyは既知互換のgroup `production-cloudflare` とcancel-in-progress:false（default pending1）へ限定。最初のqueue:max案はPM方針で撤回。次release→main mergeは前CD成功/復旧完了後に順次行う運用とし、未知のqueue構文へのvalidator例外は完成証拠に使わない。

### 根拠とローカル確認

installed enginesはVite8.3 (^20.19 or >=22.12)、Wrangler4.147 (>=22)、Playwright1.63 (>=20)、Capacitor8.5 (>=22)。[Node公式配布](https://nodejs.org/dist/v24.21.0/)の24.21.0をchecksum照合してローカルにも準備し、CIのubuntu-24.04/Node24.21.0を固定。Playwright1.63の管理Chromium1243をinstallし、既存3browserは `PLAYWRIGHT_BROWSER=chromium` でGoogle Chromeへのローカル依存を外す。通常ローカルChromeは既定のまま。

Actions pinは公式tag refsを2026-10-07に照合： [checkout v6.1.0](https://github.com/actions/checkout/releases/tag/v6.1.0) `d23441a48e516b6c34aea4fa41551a30e30af803`、[setup-node v6.5.0](https://github.com/actions/setup-node/releases/tag/v6.5.0) `249970729cb0ef3589644e2896645e5dc5ba9c38`、[upload-artifact v6.0.0](https://github.com/actions/upload-artifact/releases/tag/v6.0.0) `b7c566a772e6b6bfb58ed0dc250532a479d7789f`。workflowはYAMLのJSON subsetで記述。

[GitHub event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)、[Release API](https://docs.github.com/en/rest/releases/releases)、[concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)、[Playwright CI](https://playwright.dev/docs/ci-intro)、[Cloudflare deployments API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/deployments/methods/list/)を一次根拠とし、Cloudflare result.deployments[0]がcurrent trafficであることを確認。

- `node --test prototype/tests/release-cd.test.js prototype/tests/release-workflow.test.js`：50件全成功（s1-cd-unit.log）。merge/enable/repo/版/SHA/main/tag/latest版/summary gate、失敗後success抑止、historical noop、checkpoint/traffic/公開SHA、draft添付retry、notes、workflow権限/固定SHAを確認。
- official actionlint1.7.12 archive checksum照合後、加工していない実workflow両ファイルへ実行：exit0、診断0（s1-actionlint.log）。最初のqueue未対応診断は撤回案の履歴であり完成証拠にしない。
- `node prototype/tools/release-cd.js execute`：repository flag未設定でexit1（s1-cd-disabled.log）。Cloudflare/Release本体未呼出し。
- 合成notes fixtureは cd-notes-fixtures：`../../prototype/reference-review/agile-2026-10-07/cd-notes-fixtures/`（ローカル保存証拠、PRへ同梱しない） に保存。実公開の証拠ではない。
- `PATH=<Node24.21.0>/bin:$PATH PLAYWRIGHT_BROWSER=chromium npm run release:prepare -- --issues 2,3,4,10,11`：改訂後の正常経路は実行中（s1-cd-managed-prepare.log）。最終結果を追記する。

実GitHub Actions/Ubuntu runner、Secrets・production environment/var設定、実API接続、CD有効化、実Cloudflare deploy/公開後smoke/rollback、実tag/GitHub Releaseは未検証・未実施。fixtureの成功とローカル正常prepareをこれらの成功へ拡張しない。運用/順序は [RELEASE_CD.md](RELEASE_CD.md) のSM照合とPM受入を残す。

### #11 正常経路の最終結果（2026-10-07 09:42 JST）

改訂後のNode24.21.0/管理Chromiumによるprepareは成功。全431テスト成功、150.13秒。release build/両幅25画像・HTTP/例外/停止復帰/操作/全3体験・結果・通常0回復帰が成功し、battle/bonusは専用払出15・実attacker入賞1をJSON保存。managed browserはChromium153.0.8010.12、npm11.19.0。今回のplatformはdarwinでありGitHub ubuntu-24.04の実成功ではない。

最新active candidateは `b1965bd5-7eaa-48f7-85f5-6fc0b540b38f`、45資産/14,885,469bytes、JS `game-BSMJhrm5.js`。commit941f79d2e9b114c41a4c4e559dfa1c17b24e10a5/dirty=true、source SHA `c7f8c625a8146bbb3f866efed2c54427c02619e37f61ee21e452a5f50ff12baa`。先の#10候補は履歴として保持し、今の公開候補には最新manifestを使う。local dirty候補は#10ローカル検証に使えるが、CDのclean merge commit gateを満たす実CI成果物ではない。

Node24 `release:verify` とdefault Node25のverifyが成功。自前preview56761は終了、既存4178はHTTP200で維持。PR CLIも合成eventで正しい版は成功、不一致版はexit1で拒否。`git diff --check` 最終成功。

証拠：`s1-cd-managed-prepare.log` / `s1-cd-managed-verify.log` / `s1-cd-managed-candidate.log` / `s1-cd-managed-checks.log` / `s1-cd-managed-manifest.json` / managed browserの画像・JSON：`../../prototype/reference-review/agile-2026-10-07/s1-cd-managed-feedback/`（ローカル保存証拠、PRへ同梱しない）、`s1-cd-unit.log`（50成功）、`s1-actionlint.log`（実workflow全体診断0）、`s1-cd-disabled.log`（exit1）、`s1-cd-cli-pr-valid.log` / `s1-cd-cli-pr-invalid.log`。

最初のNode24 prepareはqueue案訂正時に自分のprocess treeだけ終了し、改訂後を再実行した。中断された実行を成功証拠へ使わない。node/browserの取得はローカル検証のためで、Secrets/var/cloud設定を変更していない。

#11提出はローカル実装・形式/境界/失敗/再試行・managed browser互換まで。実GitHub CI/CD、実Secrets接続・公開有効化、本番deploy/smoke/rollback、tag/Release作成は未実施。source変更後は同一候補guardが拒否するため、追加コード変更をするならprepareから再検証する。PM受入待ち。


## 最新main SEとS1の隔離統合（2026-10-07）

原workspace941f/dirtyは保持。最新remote main38b06d24d71e5113db16f51929cfac04fc1d4681（既存音PR #1）にPMがisolated sprint/S01を用意し、既知baseline＋S1の102 source/docを3way転送した。LEはmain.js/board-runtime.jsのコード2衝突だけを解消し、SMがdocs3を解消。stage/commit/push/PRはPM所有でLEは行わない。新規私的媒体/tmp/referenceは除外し、現在source502 inputはすべてgit indexに登録済みとPMが確認した。

remote createPresentationSound/unlock handoff/mute/pause/visibility stop/disposeと、local prefetch/loading/cancel/体験/常設UI/消化回数/画質/受け皿/PUSH/trailを両保持。renderで音routerがeventsを消費してからonUpdateがeventsをclearする順序を維持。passed Soundはcancelled mountでも破棄できる。音色/ピッチ/聴感の新制作は行わない。

検証（Node24.21/npm11.19、Chromium153.0.8010.12、darwin）：

- 隔離npm ci成功。esbuild/fsevents/workerdのinstall-scripts未承認warningはあったが、今回実unit/build/browserは成功した。実CD公開まで成功したという意味ではない。
- remote SEのoriginal-se/atmosphere/signature unit21件全成功。
- 最新統合のprepare成功：全452unit/0失敗、release build、390×844/1440×900の25画像・HTTP/ブラウザ例外・休止復帰、操作/結果/3体験・実bonus払出・通常0復帰成功。新JS game-D3TKWLRC.js。
- Designer専用4190で、新6パネル/2結果と効果音checkbox off/on、停止/再開、休止時計停止/復帰/終了を確認し目視合格、例外0。音checkbox下の写真とpanel先頭を分け、条件を揃えた。聴感未検証。
- 必要な音integration API/native context：handoff state running、mute enabledfalse/voices0、pause時間固定/voices0、resume running、旧board dispose後stateclosed/voices0/cacheBytes0/canvas0、pageerror0。

音補助fixtureの途中失敗は製品失敗ではない。最初はVite cwdをrepo rootにして/404だったのでprototype cwdへ訂正。次の旧8経路seek fixtureは自然physics/残留玉が進む中でtotal不変を要求し0→1の一般賞球を拾った。これを合格証拠に使わず、統合で触れたhandoff/mute/pause/resume/disposeだけへ限定したtmp fixtureで終端成功。製品を変えて合格させていない。全尺/全音/聴感はS2等の別受入対象のまま。

証拠はlocalのみでPRへ同梱しない：`/private/tmp/silverball-s1-worktree-npm-ci.log`、`/private/tmp/silverball-s01-sound-tests.log`、`/private/tmp/silverball-s01-integrated-prepare.log`、`/private/tmp/silverball-s01-sound-lifecycle.log/json`、隔離treeの`prototype/reference-review/s1-integration/ui.mjs/json/log`と新画像。失敗fixtureのログもlocal履歴で保持する。

candidate ba3864d5-f9cb-45f4-834c-2c3cca133ff9、source SHA311a391ab477bcc79737b2203a4ecac7f37bb62e0202302137dbfb59a712df62、45asset/14,901,612bytes。Git metadataは38b/dirty=true。PMがverifyでsource/assets/target一致を実確認した。commit前dirty候補をclean CI成功とは呼ばない。次は103pathのcoherent integration snapshotへPMがcommitし、具体GitHub送信許可後にSprint→release PRと実CIへ進む。Cloudflare/Secrets/CD有効化は未実施、GitHubpushはauto-review拒否を回避しない。
