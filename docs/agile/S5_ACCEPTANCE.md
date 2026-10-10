# S5 #22 設計・検証と受入記録

## 最新PM判定（2026-10-10、ローカル検証完了）

対象#22。最終ローカル検証のHEADは `3c136dd4a028119781d5256a8313e475460a2b5a`。500件/113単体testfiles、全既存release/controls/feedbackブラウザ、最終V2ツールの両幅操作・ブラウザ→Node保存互換・ソース欠落/重複/改変拒否・12条件比較が成功した。

|AC|PM判定と根拠|
|---|---|
|1 基準/属性共有|ローカル合格。101本の基準/候補pins SHA、直接テスト、描画と衝突へ同一データを使用。本編source非変更。|
|2 配置制約|ローカル合格。許可地点/固定部材/群境界/距離制約と不正配置拒否。両幅表示と実操作の拒否理由を確認。|
|3 保存再現|ローカル合格。V2同配置の両幅保存/復元/読込、実ブラウザ→Node互換、定義SHA厳密照合と生成形状差警告、不正/旧形式拒否。|
|4 条件固定比較|ローカル合格。同条件の12runs、全ソース164入力の前後照合、条件/固定形状hash・入賞/無入賞/残球/流路の記録。環境差を保持。|
|5 計数/ゲーム保持|ローカル合格。全runsの発射/処理済み/残球整合、有限玉の会計/spent整合。抽選/保留/賞球など本編は変更なし。|
|6 PR動画/レビュー|未完了。台本7文の承認待ち。操作録画・図表素材は準備済み、音声合成/MP4/PR/実GitHub CIはまだ実施していない。|

ローカル集約候補 `6b424150-1582-4a7c-8a96-6297bc6b6e15` はverified。source526入力 SHA `d03721df480678b3d0eddee83a7fa1020f7d5d48ce9d5d1ee6e91bc326992274` とunit/browserのcommit/source/45資産が完全一致。45資産14,902,484Bは受入済みS4の全bytesと一致。本編へツールを混ぜて公開していない。

候補git.dirty=trueは実測時のまま保持（未追跡の台本・私用証拠フォルダ）。後続の文書commitや実GitHub CIのclean結果へ付け替えない。試射専用source SHAは `da1e2c01de863fd23d7524d7ad5793cb0e9afd12f675dee6d231d88a0f3d9bd6` /164入力、制約定義 SHAは `ed0d47ae50ac9573ac94614da0306f6d125eb707f9d1d7b9a855c16c53ae29e1`。

PMが最終1440比較画像を実見し、指定12秒の保存フレーム表示が実物理12.00秒へ一致することを確認。画像とJSONは原workspace `prototype/reference-review/s5-2026-10-10/final-local-3c136dd/`、旧失敗/旧保存形式は別フォルダで保持する。物理成績はエンジン環境別で、本編採用・実機再現・最適配置の保証にしない。

台本確認後にRemotion/VOICEVOX MP4を制作・検証し、非Draft `sprint/S05 → release/0.2.0` PRを作成して実CIを判定する。Sprint終了はユーザーのPRマージ後。以下は設計・試験各世代の履歴で、現在の判定は本節を優先する。

2026-10-10。#22開始承認済み。[実行計画](S5_PLAN.md)の6ACに対応する。現在はbrowser/CLI attempt02成功提出済み。エンジン間保存schema補修と新操作検証・実CI・動画が残り、全ACの最終判定は未完了。進行表はユーザーのPRレビューを代替しない。

## 接続契約と担当

基準101点は自動丸めしない。釘ID/群/役割/半径/反発を持つ配置と、地点・禁止領域・固定部材・制約版を分ける。移動は座標だけを変え、描画と自然衝突へ同一配置を渡す。地点間隔/原点/編集群/安全通路の値はLeadの読取根拠とDesigner表示案をPMが確認して確定し、未確定値をここで補わない。

Leadはschema・拒否・保存/復元・自然試射/会計・直接tests、Designerは許可地点/固定部材・拒否理由・差分/比較UIと実画面/動画、SMは契約/条件/生ログの照合、PMは設計/AC判定とGit/正本Issue/PR管理を担当。商品JS所有はLead/Designerが直接調整し、SMはdocsのみ編集する。

|AC|必要な提出証拠|現在|
|---|---|---|
|1 基準/属性共有|元101点のID/属性/座標と基準SHA、無編集roundtrip、描画/物理の同配置接続|未検証|
|2 地点/拒否|採用制約版/根拠、101本/ID保持、重複・盤面外・禁止領域・干渉・未定義地点の負例、理由の実表示|未検証|
|3 保存再現|配置/制約版・実効SHA・差分の保存読込/復元、不正schema/欠落/改変時の適用拒否|未検証|
|4 同条件比較|基準/候補ID、実code/tool SHA、固定物理/発射/観測条件、条件別自然試射生ログ/集計、欠測区別|未検証|
|5 製品ルール保持|抽選/保存当落/保留/賞球の非変更根拠と必要回帰、強制入賞/吸引/消去なし、発射/排出/残球整合|未検証|
|6 説明/PM判定|同条件実プレイ比較・差分/拒否/保存再現、利点/悪化/限界を説明する承認台本・Remotion/VOICEVOX動画、PR冒頭掲載とPM AC判定|未検証|

## 実行と失敗時の手順

1. 実branch/HEAD・dirty所有・source/基準配置/制約版を保存し、候補の編集IDと属性保持を確認する。未確認の既存変更を取り込まない。
2. 不正入力を負例で確認し、拒否後に既存有効配置が保持されることを確かめる。UIは未定義値を勝手に修復しない。
3. 基準→候補保存→読込→基準復元を行い、実効配置SHAと差分を照合する。比較する両者に同じ物理/発射/観測条件を設定する。
4. 自然試射を実行し、初期球・発射・入賞/賞球・排出・残球と無入賞観測窓を分けて記録。300秒+45秒等の計画値は実ハーネス/実終端へ照合し、有限玉終了やcensorを完走へ付け替えない。
5. 生ログ/集計・sourceguard・終了codeを保全する。guard不一致、計数不整合、未取得条件は失敗/未検証のまま原因と修正対象を記録し、前成功へ換算しない。
6. 必要全回帰/今回build/browserとUI/比較動画を対応させ、SMが不足を報告、PMがAC別判定。目的別commit、短いIssue bulletの非Draft Sprint PRでレビューする。PR作成だけで集約完了としない。

コマンド・artifact名・比較条件の最終値はLead提出時に追記する。attempt02の実成功証拠は末尾で世代別に記録する。private素材/logは用途別保存しPRへ同梱せず、run/HEAD/候補/日時/生ログの対応を記録する。過去qa05ログ・図解だけで今回の試射成功としない。

## 手待ちを避けるReady

- backend接続待ち：Designerは拒否理由・固定部材/地点の識別・差分/基準復元の表示案、Leadは属性保持/保存roundtrip/無効配置fixtureを準備。
- 試射待ち：SMは条件台帳/数式・計数境界のレビュー、Designerは比較動画の構成・台本案を準備。重い収録/回帰のquietは担当間で調整。
- 成果提出後：SMが新証拠だけ照合しPMへ不足を報告、担当へ承認範囲内の差戻しを渡す。対象が尽きれば要求整理に移り、新PBI/#11補修を勝手に実装しない。

終了は合意AC・必要検証・PM受入・Sprint集約PRのユーザーマージ。本編への候補採用、実機同等性、自動探索、公開は本Sprintの成功から拡張しない。

## 現APIと採用制約（2026-10-10）

Lead初稿ではgetPinLayoutModel/createBaselineLayout/validateLayout/validateMove/applyMove/resolvePins/diffLayout/serializeLayout/parseLayout/layoutHash/constraintHashに加えexportLayout/importLayoutを公開。内部layoutはschemaVersion/constraintVersion/baselineIdentity/placements(pinId,siteId)。baselineIdentityはcanonical JSON文字列でSHAではない。保存envelopeの初稿はlayout＋metadataで3SHAを厳密照合したが、現在は下記formatVersion2のstable定義/engine形状分離へ補修中。古いbaselineHash名の初稿は履歴で、現保存形式に使わない。

PM採用はpitch4/原点[22,180]、矩形群、heso2固定、最低中心距離4・固定clearance2。既存基準を丸めず保持し、中心距離検査は移動釘を含む組に適用する。左道/左上/左下/ヘソ/右一般/右道の本数26/10/55/2/3/5、閉じ受け皿polygon追加後の格子地点数376/117/708/0/53/27、baseline101/validはLead提出値。ここではschema読取と提出を受領した段階で、全操作・測定を合格にしない。

## ローカル運用手順（実行は担当の新証拠で判定）

リポジトリrootから `npm --prefix prototype run dev:pins`。これは先にdev/pin-layout-inputs.jsonを生成し、Viteを127.0.0.1:5250 strictPortで起動する。入口は `http://127.0.0.1:5250/dev/pin-layout.html`。通常Viteだけで起動してmanifest生成を省かない。port競合時は既存serverを無断終了せず担当を確認する。

1. 基準101本・固定部材/禁止領域・群を確認し、pinと許可siteを選択して移動する。拒否理由と旧有効配置の保持を確認。
2. JSON保存→読込でbaseline/layout/安定constraintの3SHAと同配置を再現し、engineGeometrySHAの相違は警告と現在エンジンでの再検査へ対応させ、基準復元で差分0へ戻す。保存JSONはローカルツール配置だけで、本編/月影5台への適用・公開操作を含まない。
3. 比較modeで基準/候補を同条件試射し、条件/配置SHA/codeSHA・全生events/計数・欠測を確認。結果JSONを保存し、再生は保存済み生比較結果から行う。配置変更後の旧結果を採用しない。
4. browser受入は `npm --prefix prototype run test:pins`。CLI比較は `npm --prefix prototype run compare:pins -- --out <local-evidence-dir> --layout <saved-layout.json>`。--moveによる候補入力も実CLIで受理されるが、受入では実候補JSON/移動IDを固定する。実行済み成功を示すコマンドではなく、最終helper/条件/ログは担当提出後に追記する。

manifest/codeSHAの対象は実際に利用する全シミュレーション依存へ照合し、UI/画像除外が比較scopeとして妥当かを説明する。動的風車状態は実行後に変わるため固定部材hashへ混ぜず、不変構造と動的状態を分けて検証する。修正前はpresentation入力不足と動的windmill混入が判明したため初測定を未受入として保存、修正後の新測定は別世代へ保全する。

## 最新証拠と差戻し（世代を分ける）

- CLI attempt01は全12rawを保存したexit1。風車の実行後angle/omegaをfixedHashへ混ぜ6pairsで不一致、受入には不使用。入賞/計数rawを破棄・成功化しない。
- CLI attempt02はexit0、source164入力SHA `59161a5092194b6d22334690e81f81e7e5109f33b308b48f4e6a5cbb6faf5b21` 前後一致、git5057d9a/dirtyを保持。12runsの計数/有限会計が整合、全残球0、6pairs固定部材hash一致、comparable/fullWindow=trueとLead提出。有限位相.35基準の実physics293.6667秒と候補300秒を分け、要求300秒へのpaddingを実観測へ付け替えない。自然賞球/stock終了差により発射数475対474も保持する。
- browser attempt02は同source59161a/164入力前後一致、12runs計数/会計、両幅編集・保存/読込・復元/errors0をPM確認。CLIとbrowserは環境別結果で、通常発射校正のみ。右群が可動でも右打ち性能/RUSH自然成績を合格にしない。
- Node固定形状SHA19eaa…とChromea572…はsin/cosの14端点で最大5.684e-14差があり、browser保存をCLI importすると拒否をPM再現。旧測定/保存SHAは保持。CLI入賞[22,28,27]→[21,22,28]とChrome[27,19,28]は環境別、差の原因を14端点だけに断定しない。

原証拠は `prototype/reference-review/s5-2026-10-10/pin-layout-comparison-attempt02/` と `browser-attempt02/`（原workspaceのローカル保存証拠、PRへ同梱しない）。SMはCLI provenanceの実schema/git/sourceを読取確認し、browser全結果はPM確認を受領。現在の新コードの測定と誤認しない。

### portable V2補修：局所受入・全回帰進行

現コードはformatVersion2で `{formatVersion,layout,metadata}` を保存する。metadataはbaselineSHA/layoutSHA/安定constraintSHA＋exact engineGeometrySHA。constraintDefinitionはsource定義/変換/rail生成条件/固定ルールを保持し、生成端点bytesをstable定義hashと区別する。inspectImportはstable3SHAと配置validを厳密検査し、engine形状のみ相違なら記録値/現在値とwarningを返す。旧envelopeを無言で受理したり、物理同等性を保証したりしない。生成点・物理・measurement moduleの変更はこの補修範囲に含めない。

UI c306の時刻選択float epsilon補修、処理済み入賞を含む再生注記を受領。07fe335短UI、5057旧表/流路完全clear、HMR中断、attempt02、schema補修後の短geometrywarning操作は別世代。V2新短操作の両幅import/警告/保存/復元・旧format/invalid拒否・errors0・source始終一致をDesignerが提出。12秒frameと新source全回帰はPM新browser終端待ち。

旧全497unit成功＋新target12はPM提出。sourceguard欠落/duplicate/alteredのbrowser負例は `source-guards-before-identity-fix.json` を初稿として保持し、現在helper対応は別照合する。新schema全測定/実CI・動画・PRは未受入。7文ナレーション承認pending、PR動画は必須で未制作/未掲載。次ReadyはPM final unit/release browser/tool browserの新終端とcandidate joinの独立照合、現sourceの実CIと承認後動画の対応照合。

## portable V2提出と最終ローカル検証の現在地

backend `acb8363`、PM scripts/CI/新toolbrowser `d979058`、UI `ba4dfc`、Designer資料 `9bacab8`を受領。12target pass、実Chrome154.0.8037.98保存→Node24読込成功。安定definitionSHA `ed0d47…ae29e1`共通、exact geometryはChrome `e420f9…f97d8`とNode `cf1fb3…6a78a`を別々に保持して警告する。実候補/基準の再検査は保持し、エンジン成績同一を保証しない。

原 `portable-definition-v2/{roundtrip,node,browser,physical-equivalence}.json` とtarget-tests.logで補修を提出。measurement module旧bytes完全一致、旧model fixed/sites/12rawpinsの一致を補助証明とし、古い12rawのHEAD/sourceは改変しない。新UI証拠はclone `ui-import-v2/` と `ui-video-v2/`、両幅format2保存/復元、geometrywarning、旧format/invalid拒否、errors0/source前後一致。動画素材取得はPR説明動画完成・掲載を意味しない。

PM final3job（unit/release browser/new tool browser）が進行中。全500unit/本編全browser/新toolbrowser・最終候補join・実Linux CIはまだ未確認。承認待ち7文ナレーションは合成のみ留保し、PR/movieは未作成。4文書commit後はcandidate join終端までGit/文書を凍結し、監査は読取のみ。レビュー対象はSprint PRで、内部進行資料を代替にしない。
