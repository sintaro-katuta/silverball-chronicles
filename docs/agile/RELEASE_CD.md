# #11：Sprintブランチからmainマージ時のCDへ

## 現在フェーズ：分離worktree統合中

PMが最新 `origin/main` の `38b06d2`（既存効果音PR #1）から managed worktree `/Users/sintaro.katuta/.codex/worktrees/sprint-s01/silverball-chronicles` を作成し、local `sprint/S01` と `release/0.1.0` を準備した。原workspaceの全変更は保持し、必要source/docだけを3-way移送している。remoteの採用済みSEと、localの受け皿/図柄/ロード/演出/Agileを両方保持する。隔離版のCIは未実施で、原workspaceの候補成功を統合後SHAの成功へ流用しない。

GitHub `release/0.1.0` pushはauto_reviewが [AGENTS.md](../../AGENTS.md) の「クラウドへのアップロード・更新は新たな明示許可まで行わない」に基づき、具体送信の明示許可不足として拒否した。remote branch/PRはまだ未送信。GitHub API branch作成等で迂回しない。ローカル統合・manifest・commit/検証を完成させ、具体対象/SHAを提示して `release/0.1.0` / `sprint/S01` のpushとSprint1集約PR作成の許可を得る。mainマージ・本番公開・Secrets/CD有効化はこの送信許可へ含めない。

2026-10-07。正本は [Issue #11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11)。ユーザーはS01への追加開始を承認済み。#10のローカル候補検証/固定を再利用し、PRのCIと、リリースPRのmainマージを起点にしたCDを構築する。PMはローカル構築を受入済み、Issue #11はReview（実GitHub CI/CD・接続未確認）に置く。PBI全体完了と扱わない。初回版のoptional回答待ちを停止条件とせず、現在app版 `0.1.0` を暫定作業版として `release/0.1.0` / `sprint/S01` の準備、Sprint1 PR/実CIへ進める。変更可能な暫定版で、実公開ではない。Git操作はPM担当。SMはbranch/commit/PRを実行せず、Secrets登録・クラウド更新・CD有効化も行っていない。

## 最新のブランチ・PR運用

ユーザーの「バージョンブランチ」と「リリースブランチ」は同じ `release/<version>` 集約ブランチとして整理する。初回作業版は現アプリの `0.1.0` を暫定採用し、後で変更可能。vなしSemVerと `prototype/package.json` のversion一致、tag/Release名も同じversion文字列とする。branch/PRはPMが準備し、SMはその差分・AC・CI証拠をレビューする。

1. 次の3Sprintをまとめるrelease集約branchは、確認したmainのSHAを開始点として作る。既存dirty変更は [BASELINE](BASELINE.md) と所有を確認し、未確認のまま取り込まない。
2. 各Sprint開始対象をユーザー確認後、最新の集約branch SHAから `sprint/<id>` を切る。最初だけmainから、次は前Sprint受入PRの集約済み状態から始める。
3. Sprint内の受入成果をCI/レビューし、Sprint→release集約PRを作り、受入後にマージする。各PRは正本Issue/ACと今回の証拠を説明する。各Sprintで1本、3回で3本。
4. 3Sprint受入・累積回帰・ノート確認を終え、release集約→mainのリリースPRを1本作る。ユーザーによるこのPRのマージを、有効化後の公開開始合図とする。
5. CDがmainへのmerge SHAを検証し、その固定候補をCloudflareへ公開、公開smoke成功後に同じSHAのtag/GitHub Release/リリースノートを作る。

従来の「3SprintごとにPR1本だけ」は初期運用の履歴。最新運用は集約向け3本とmain向け1本を区別し、実リリースの周期は3Sprintを維持する。Sprint内PBI完了だけで期間/ふりかえりを飛ばさず、次Sprint開始は引き続きユーザー確認後。

## CIとCDの境界

| 経路 | 検証/権限 | 公開 |
|---|---|---|
| Sprint→release PR | clean checkout、依存固定、test/release build/browser。contents read、Cloudflare Secrets不要 | しない |
| release→main PRの未マージ時 | 同じCIとPMレビュー | しない |
| release→main PRのmerged closed | 合致したイベント・merge SHA・versionと有効化ゲートを検査後、CD | 有効化/Secrets設定後のみ |
| main直接push、別branch→main、未マージclose、fork PR、Sprint→releaseマージ | CD対象外として拒否/skip | しない |

CDの条件は `pull_request` の `closed`、`merged == true`、base `main`、head同一repository、head `release/<version>` の全一致。イベント欠損/不正merge SHA/version不一致ならfail closed。PRタイトル/本文/branch名を直接シェルコードとして実行しない。GitHub公式はclosedイベントとmerged条件の組合せを案内している。[GitHubイベント資料](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

CDはイベントの `merge_commit_sha` を明示checkoutし、実checkout SHAと照合する。PR時の結果や移動するmain最新HEADをそのmerge SHAの成功証拠へ代用しない。prepareで生成したcandidate固有assetsをpublishへ渡し、公開直前にsource/config/全資産SHA/集合を再検査する。公開時に再buildしない。

## CI環境と同時実行

初稿workflowの実設定はrunner `ubuntu-24.04`、Node `24.21.0`、npm依存は `npm --prefix prototype ci`、`PLAYWRIGHT_BROWSER=chromium`。Playwright ChromiumとOS依存を `node prototype/node_modules/@playwright/test/cli.js install --with-deps chromium` で用意する。checkout/setup-node/upload-artifactはcommit SHAを指定する。viewportは390×844/1440×900。

これらの設定とNode/npm、Playwright/Chromium、Vite/Wrangler実使用版、package-lockを実行記録へ残す。ローカルmacOS/Chromeで成功していてもGitHub Linux runnerの成功とは区別する。具体的なworkflowとhelperの最終提出、ローカルChromium試験の結果を後段AC表へ照合する。

CIにproduction Secretsを渡さず、CI jobの成功は公開成功と呼ばない。CDのproduction向け実行は共通concurrency groupへ直列化し、進行中deployを後続で中断しない。**次のrelease→main PRをmainへマージするのは、前版のCD成功または障害復旧完了後**。mainはreleasePR経由のみとし、直接pushや別head経由はCDをskipする。current mainとmerge SHAを照合するゲートがあるため、前版の検証中に次版をマージすると前版runが古いrunとして停止し、各マージのReleaseを完結できない。待ち行列の存在をこのマージ順の代わりにしない。再runが別versionの公開を巻き戻さないよう、既存tag/Releaseとdeployment記録を照合する。

採用案はgroup `production-cloudflare` / `cancel-in-progress: false` の既知互換設定。標準のpendingは1件で、さらに後続が来るとpendingが置換されるため、上記の「前CD完了まで次mainマージをしない」を必須にする。dispatch順を暗黙に保証した待ち行列とは扱わない。[GitHub concurrency資料](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)

診断履歴：初稿の `queue: max` はactionlint1.7.12の未対応で検証が通らず、PMが大量queue不要と判断して削除を指示した。採用workflowはvalidator例外で通さず、全体のactionlint成功を受入証拠とする。

## 有効化ゲートとSecrets設定

`ENABLE_PRODUCTION_CD` は既定off。未設定、false、Secrets不足なら本番送信を行わない。今回のローカル完成ではoff/Secrets未設定を保持する。workflow・公開先・merge時自動公開・再run/復旧の具体的成果を提示してからユーザーに有効化を確認する。有効化承認後はユーザーのrelease→mainマージが公開合図で、毎リリースをチャットで再承認する運用へ戻さない。

Cloudflareの非対話CI認証はAPI tokenとaccount IDを使用する。対象account/zoneなど必要最小の範囲へ絞り、tokenの権限と既存Worker/ルートを確認する。[Cloudflare公式手順](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)

設定担当はユーザー/管理者。以下は将来の設定手順で、今回登録操作は行っていない。

1. GitHub repository Settings → Environments → `production` のenvironment Secretsに、`CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を登録する。初稿CD jobが `production` を参照するため、置き場所を一致させる。
2. token値は管理画面の安全な入力へ直接登録し、チャット・文書・コマンド引数・Git/ログへ貼らない。秘密値の読み出しはしない。存在と有効範囲だけを確認する。
3. GitHub Release作成用のCD jobは `GITHUB_TOKEN` にcontents write、チェックポイントartifact参照にactions readを指定する。PR CIはcontents readのみ。別の恒常PATをSecretsへ足すことを標準にしない。
4. 実workflowのreview、対象version/集約branch/公開先、rollbackと権限をユーザーが確認し、自動公開の有効化を承認した後だけrepository Settings → Secrets and variables → Actions → Variablesへ `ENABLE_PRODUCTION_CD=true` を設定する。job開始条件で参照するrepository variableであり、environment内だけに置かない。
5. 必須チェック/branch保護/ユーザーのマージ責務を確認し、最初の実CI/CD実行を記録する。実行前に「GitHub CI/CD動作確認済み」と書かない。

GitHubはrepository/environment Secretsの登録方法を案内し、未設定Secretsは空文字として扱われる。実装は値不足を明示停止する。[GitHub Secrets資料](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)

## ノート・tag・Releaseと再実行

[リリースノートひな形](RELEASE_NOTES_TEMPLATE.md) で3Sprint/対象Issue、利用者向け改善/修正、既知制限を整理し、技術ログを利用者本文に混ぜない。ノートの準備は公開候補として行えるが、成功Releaseを公開するのはCloudflare deployと公開URLのsmoke成功後だけ。notesにはversion、公開日/URL、merge SHA、今回の成功証拠を対応させる。

Release/tagのversionと対象commitが一致することを先に確認する。既存tagの指すcommitを読む。Release APIのtarget指定だけでは既存tagを書き換えないため、異commitのtagを検出して止める。[GitHub Release API](https://docs.github.com/en/rest/releases/releases)

release→main PR本文には、PMが確認した3SprintのsummaryをJSON blockとして1件入れる。以下は置換用ひな形で、具体version/対象は未指定。Sprint番号は3件が異なり、Issueは正本の受入対象だけ。helperの形式検査はPM受入そのものを代替しない。

```json
{
  "silverballReleaseSummary": {
    "version": "<version>",
    "sprints": [1, 2, 3],
    "issues": [2, 3, 4, 10, 11],
    "improvements": ["<利用者の改善>"],
    "fixes": ["<修正後の動作>"],
    "knownLimitations": ["<今回の未確認/制限>"]
  }
}
```

上のIssue一覧は現在のS01対象を示す入力例で、未来の3Sprint全対象が確定したリリースmanifestではない。実PR作成時は全3Sprintの受入と本文を照合する。

`knownLimitations` が空でも形式検査だけは通りうるため、PMは今回の実機/聴感/長時間など未確認が利用者へ必要な制限として記入されているかを確認する。APIの自動変更履歴だけを利用者向け説明の完成とせず、PM summaryを残す。ノート生成の成功recordもversion/SHA/status/公開証拠と照合し、単に値が渡されたことだけで公開成功文にしない。

- 同version・同merge SHAですでに成功Releaseがある場合、tag/成功record/summaryを検証してskipし、二重公開/重複Releaseをしない。後の版が公開されmainが進んでいても、履歴版の再runは配信を巻き戻さずno-opにする。
- 同version・異merge SHAのtag/Releaseがある場合は拒否し、tagを動かしたり強制削除して通さない。新しい/未完了のreleaseはcurrent mainとmerge SHAの一致、および最新公開安定版より大きいversionを必須にする。
- deploy失敗はRelease/成功ノートを作らず、Version状態をfresh確認する。
- deploy成功後smoke失敗は公開済み障害として記録し、Release未完成のまま診断/復旧へ進む。成功として隠さない。
- smoke成功後Release作成だけが失敗した場合は、保存したmerge SHA/candidate/Versionと公開状態を照合して再実行する。単にReleaseがない理由だけで別成果物を公開しない。

helperは配信前のfresh `previousDeployment` と `pre-deploy`、配信後の `deployed`、smoke後の `smoke-verified` をcheckpointへ保存する。GitHubの同runの再実行ではcheckpoint artifactを復元し、version/SHA/summary/source/assetsの一致を再検査する。deployed/smoke-verifiedからの再開も現配信Versionと公開bytesを読み直し、再deployを避ける。pre-deployで失敗した後に現deploymentが変わっている場合は、結果不明の送信を重ねず手動の状態照合へ戻る。

GitHub Releaseはsmoke成功後にdraftで作成し、candidate manifest/配信record/notesの添付がそろってから公開する。添付失敗は成功Releaseとせず、同版同SHAのdraftを再開してそろえる。checkpointとevidence artifactの保持期間を確認し、失効した記録を推測で再構成しない。

## 公開確認・障害・rollback

CDは公開URLで25画像/HTTP/ブラウザ例外、操作/休止/復帰/終了を確認し、公開JSとcandidate SHAを対応させる。#3/#4の画面判定、体験→通常の初期状態、bonus専用payout/countの引き継ぎは [checklist](RELEASE_CHECKLIST.md) を使用する。headless smokeは実機/音の聴取を保証しない。

公開前にfresh取得したCloudflare deployment/Version/trafficを保存する。履歴Versionを現在値や戻し先に固定しない。rollbackは具体Versionと影響を確認して指示を得たうえで実施し、公開hash/操作を再検証する。Git tagの巻戻しでWorkerが戻ると扱わず、公開後の復旧状態を同じIssue/Release記録へ追記する。実コマンドと診断手順は [#10手順](RELEASE_MECHANISM.md#公開前のfresh確認と障害時診断) を参照。

## #11 ACと今回の検証範囲

| 正本AC | 提出が必要な証拠 | 現在の状態 |
|---|---|---|
| AC1 PR CIはSecretsなし/失敗停止 | workflow条件/permissions、ローカルfixture、実GitHub CIログ | 現workflow読取り/全体actionlint成功報告、50fixture、Node24/managed prepare431成功を確認。SecretsなしCI。実GitHub未実施 |
| AC2 対象mergeだけCD | merged/base/head repo/release-prefixの正負例 | merged/base/repo/head/push/版/checkout/main/tagのfixtureと実helperを確認 |
| AC3 merge SHAから固定bytes公開 | checkout/実SHA照合、prepare/publishの候補指定、stubログ | clean merge制約と固定assets公開のコード/負例確認。実ローカル候補45資産をSMが全件SHA/集合再計算してmanifest一致。実公開なし |
| AC4 再現環境/直列化/記録 | CI版/ブラウザ設定、concurrency、candidate/log/merge/Version対応 | Node24.21/npm11.19/Chromium153の正常経路、production group+cancel false、checkpoint/artifact保持確認。実Linux runner未実施 |
| AC5 Secrets/許可分離 | defaultoff、Secrets不足停止、設定手順と責務 | 本書とworkflow照合、disabled終了1ログを確認。値登録/有効化なし |
| AC6 post-smoke Release/冪等 | deploy/smoke失敗、同版同SHA再run/異SHA拒否、notes/tag検査 | helper/ひな形と50fixtureを確認。success/status/前配信/fresh100%/全公開SHA/再run/Release失敗/API-stub、候補/成功/負例ノートを照合。実API未接続 |
| AC7 ローカル完成→有効化確認 | 対象workflow/既存公開先/merge公開方式のレビュー、ユーザー有効化確認、実CI/CDログ | PMがローカル構築受入、#11 Review。有効化未承認・off、実CI/CD未実施 |

今回ローカルfixtureでworkflow/helperを検証しても、Secrets/GitHub runner/Cloudflareの実接続は未検証のまま残す。PMは「ローカル構築受入」と「CD有効化/実公開確認」を分けて判定する。

最終ローカル証拠：50件CD/候補fixtureログ：`../../prototype/reference-review/agile-2026-10-07/s1-cd-unit.log`（ローカル保存証拠、PRへ同梱しない） は50成功/0失敗、disabled検査：`../../prototype/reference-review/agile-2026-10-07/s1-cd-disabled.log`（ローカル保存証拠、PRへ同梱しない） は `CD failed: Production CD is disabled` で終了1/送信前停止。PR CLI正常：`../../prototype/reference-review/agile-2026-10-07/s1-cd-cli-pr-valid.log`（ローカル保存証拠、PRへ同梱しない） と 版不一致拒否：`../../prototype/reference-review/agile-2026-10-07/s1-cd-cli-pr-invalid.log`（ローカル保存証拠、PRへ同梱しない） を照合。actionlintログ：`../../prototype/reference-review/agile-2026-10-07/s1-actionlint.log`（ローカル保存証拠、PRへ同梱しない） は診断なし。SMも `/private/tmp/silverball-actionlint/actionlint -color .github/workflows/pr-ci.yml .github/workflows/release-cd.yml` で実両workflowを独立再確認し、診断0/終了0。例外つきの旧supported-schema検査は最終成功証拠へ使わない。

Node24/managed Chromium prepareログ：`../../prototype/reference-review/agile-2026-10-07/s1-cd-managed-prepare.log`（ローカル保存証拠、PRへ同梱しない） は431成功/0失敗（150.13秒）、release build/25画像/controls/feedback全3経路と実プロジェクトの候補成功終端を確認。verify：`../../prototype/reference-review/agile-2026-10-07/s1-cd-managed-verify.log`（ローカル保存証拠、PRへ同梱しない）、版/cleanup/専用払出記録：`../../prototype/reference-review/agile-2026-10-07/s1-cd-managed-candidate.log`（ローカル保存証拠、PRへ同梱しない）、保存manifest：`../../prototype/reference-review/agile-2026-10-07/s1-cd-managed-manifest.json`（ローカル保存証拠、PRへ同梱しない） を対応させた。

実ローカル候補は `b1965bd5-7eaa-48f7-85f5-6fc0b540b38f`、45資産/14,885,469 bytes。SMがfixed assets全ファイルのsize/SHA-256/集合を直接再計算し、manifest一致・内部manifest/log/feedback非混入を確認。sourceSHAは `c7f8c625a8146bbb3f866efed2c54427c02619e37f61ee21e452a5f50ff12baa`。作成時刻2026-10-07 09:42:06 JST、Node24.21.0/npm11.19.0/managed Chromium153.0.8010.12、macOS darwin。dirty=trueであり、将来のGitHub clean merge SHA候補ではない。owned preview56761終了と既存4178維持、battle/bonusは専用payout15・bonus入賞1を確認した。

ローカル検証入口は `node --test prototype/tests/release-cd.test.js prototype/tests/release-workflow.test.js`、`PLAYWRIGHT_BROWSER=chromium npm run release:prepare -- --issues 2,3,4,10,11`、`npm run release:verify`。Node24を実際に選択した環境でprepareし、版はmanifestから確認する。workflowが呼ぶ `node prototype/tools/release-cd.js check-pr` はイベントfileに基づくPR検査、`execute` は有効化/権限/イベント条件を満たすCD専用。ローカル通常確認でexecuteへ本番credentialを渡さない。

SMの推薦後、PMは#11の**ローカル構築を受入、実接続はReview待ち**と判定した。production defaultoff/Secrets未登録、初回0.1.0暫定/branch準備はPM担当、実GitHub Linux CI・配信/Release API・Cloudflare deploy/公開smoke・Release作成は未実施。これらをローカルfixtureやmacOS Chromiumの成功へ置き換えず、具体的workflowのユーザー有効化確認と実実行結果で別途判定する。PMが現時点のGitHub environments/Repository Secrets/Variablesすべて空、workflowローカル未pushを確認した。

実接続へ進む未完了順序は、暫定0.1.0で各branchと開始SHA/対象既存差分の整理 → 初Sprint PRと実CI → secureなproduction Secrets登録/merge CD有効化確認 → 3Sprint集約後の初mainリリースPR → merge時の実CD検証。初回版のoptional回答はこの非依存準備を停止させない。Secrets未登録ならCDだけを止め、SecretsなしのPR CIを先行する。初Sprint PRは集約向けで公開を起こさない。秘密値はチャットへ要求せず、設定担当が上記の管理画面へ安全に登録する。#11 Reviewを、S01全PBI完了/3Sprint完了/実公開完了へ読み替えない。

Leadの [Issue #11提出コメント](https://github.com/sintaro-katuta/silverball-chronicles/issues/11#issuecomment-6028340589) と本書の証拠を対応付けた。SMはドキュメント編集・読取り照合・asset SHA再計算・actionlintのみで、コード/Secrets/クラウド/branch/PR/commitを操作していない。

現在の作業/次Ready：Leadは既存baselineとS01対象manifestの依存閉包を調査中、提出後は承認済み#11の実CI結果分類/最小修正/再検証へ。SMは [S1 PRレビュー](S1_PR_REVIEW.md) を作成し、次はLead manifest/PR本文/実CIの要件照合。Designerは既存#3/#4の事実/既知制限をPR本文と照合する。PMはGit操作とPR/CI進行を所有する。次Sprintの実装は未承認のまま開始しない。
