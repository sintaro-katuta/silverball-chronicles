# S01 #10：検証済み成果物を公開へ引き継ぐ仕組み

2026-10-07。ユーザーの「リリースする仕組みもこのスプリントに入れれそうでしょうか？」への具体的提案。PBI正本は [GitHub Issue #10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10)。ユーザーの「はい、それで進めてください」により#10追加開始承認済み。S01は#2/#3/#4/#10の4件がActive（10月7日〜13日）。本書の編集担当はコード・CI・Secrets・公開操作を変更していない。

承認範囲はローカルの準備・検証・資産manifestと、公開の明示許可後に同じ成果物を公開する手順まで。3スプリントで1PR/リリースを維持し、S01で本番公開する計画にはしない。[リリースチェックリスト](RELEASE_CHECKLIST.md)、[スクラム運用](SCRUM.md)

## #11による最新運用（#10の手動案は履歴）

ユーザーが [Issue #11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11) を追加承認し、各Sprint branch→release/<version>集約PR、3Sprint後release→main PRのマージ起点CDへ変更。各Sprint集約PR3本とmain向けPR1本を区別する。#10の固定candidate/検証は再利用し、本書の毎公開チャット確認/手動publishを最新の標準運用とはしない。

具体的workflowと公開先・merge時自動公開をユーザーが有効化確認した後は、release→mainマージが公開合図となる。現在はENABLE_PRODUCTION_CD既定off/Secrets未登録で、実公開なし。実装/環境/ゲートとpost-smoke notes/Releaseは [RELEASE_CD](RELEASE_CD.md) を参照する。以下の#10結果/candidateはその時点の履歴で、新しいCIコード変更後の現candidate成功を保証しない。

## 問題と既存の仕組み

実装前に読み取り確認したコード（開始時点の履歴）：root `package.json` はtest/build/build:release/deployをprototypeへ委譲。`prototype/package.json` のdeployは `npm run build:release && wrangler deploy` で、公開時に再ビルドする。releaseビルドは既に存在し、Viteが `dist-release/` へ本編を出し、資産ツールが許可リストの25画像をWebP化・コピーする。Wranglerは既存Worker `tsukikage-pachinko` と既存2ドメイン、assets directory `./dist-release` を指定している。

既存ブラウザ検証はローカル4178を対象に390×844/1440×900の25画像・休止/復帰・HTTP/ブラウザエラーを確認する。本編操作確認は別コマンドであり、準備コマンド・試験記録・全出力のSHA manifestをまとめる入口はない。画像URL用のSHA生成はあるが、release出力全体の一覧と同一成果物の公開保証ではない。`.github/` は今回のローカル読み取り時点では存在しない。

現在の不足は検証した出力と公開時の再build出力の一致を、運用上保証する入口がないこと。ゲーム仕様・素材品質・確率を変更せず、この境界を明確にする。

## 最小実装範囲案

Leadの採用設計はroot/prototype共通の `release:prepare` / `release:verify` / `release:publish`。以下は承認された責務。今回の実行結果は後段の提出証拠で確認する。

1. **prepare入口**：承認対象Issue、候補ID、現行ソース識別を入力し、ローカルtest → release build → ローカルpreviewの起動待ち → releaseブラウザと本編操作確認 → 全資産manifest生成を順番に行う。失敗時は公開可能と判定しない。previewは終了/失敗時に片付け、既存サーバーを勝手に停止しない。
2. **候補の固定**：成功した `dist-release/` の全ファイル集合・相対パス・bytes・SHA-256をcandidate固有のローカルassetsへコピーし、可変dist-releaseとは分離して固定する。配信外の内部manifestに固定assetsのパスと全集合を記録し、全成功後だけatomicに書き込む。publishが固定assetsだけを指定し、改変/欠落/追加は検査で拒否する。固定先は `prototype/.cache/release/candidates/<candidateId>/assets/`、内部manifestは `prototype/.cache/release/candidate.json`。checks.logとfeedback証拠はcandidate assetsの外に置く。
3. **同一成果物検査**：公開の直前に候補の全ファイルをmanifestと照合する。改変・欠落・余分なファイル・別候補・未合格を拒否する。公開時にbuildを再実行しない。元のdeploy入口による再buildを使わず、固定候補を既存Wranglerへ渡す手順を明示する。
4. **手動公開の引き継ぎ**：具体的な候補/対象Worker/ドメインと新たな明示許可を記録した後、担当者が公開する。公開Version ID、公開前版、公開URL、ローカル候補hashと公開確認結果を記録し、必要時のrollback手順を既存資料へつなぐ。S01では送信を含まないローカル検査まで実証する。

候補検査と公開先指定の具体的実装は、今あるWrangler設定を壊さずLeadが検証する。認証済みであることやdry-run成功だけを送信許可と扱わない。

## manifestと試験記録

| 必須欄 | 内容 |
|---|---|
| 対象 | candidate ID、Sprint/リリースID、正本Issueリンク、ユーザー対象追加確認 |
| ソース識別 | branch/HEAD SHA、dirty有無、対象ソース/設定/lock/素材のfingerprint、既存変更の由来 |
| 作業中変更検出 | 検証開始と候補固定時のfingerprint照合。変わったら未合格にして再prepare |
| 実行環境 | Node/npm、lock、実際のWrangler/Chromeなど使用版、日時 |
| 検証 | 各コマンドの終了状態・ログ・環境、対象Issueの追加AC、警告/未確認 |
| 成果物 | 全配信ファイルの相対パス/bytes/SHA-256、総サイズ、ファイル数、許可資産検査 |
| 引き継ぎ | candidate保存先、公開予定対象、承認状態、公開前Version、rollback根拠 |

HEAD SHAだけでは現在の大量のdirty変更を識別できない。fingerprintの入力範囲は実装で明示し、コード・package/lock・Vite/Wrangler設定・入力素材を含める。試験ログや生成先は入力fingerprintの対象外とし、秘密情報をmanifestへ写さない。試験に影響する変更が起きたらその候補を無効にする。

## 受入条件（追加PBI用AC）

- AC1：prepare入口がtest/build/browserを順次実行し、どこかが不合格なら公開準備済みを生成しない。#2のright-road失敗は解消され全回帰合格後に候補を作る。assert削除や失敗無視で通さない。
- AC2：成功候補が全ファイルのSHA/size/path、ソースfingerprint、Issue/試験ログ/環境を持ち、同じ入力を識別できる。manifestは配信に混ざらない。
- AC3：検証中のソース変更、候補資産の1byte変更/欠落/追加、manifest不一致、未合格候補を公開入口が拒否する。これらは小さなfixtureで必要な自動試験を追加する。
- AC4：公開入口/手順は再buildせず、指定した合格候補のbytesだけを対象とする。S01の検証はローカルまたは送信しない検査で完結し、Cloudflare更新を行わない。
- AC5：ローカルpreviewの起動待ち、port競合、ブラウザ起動失敗、test/build失敗を記録し、終了時に自分が起動したプロセスを片付ける。既存previewを勝手に終了しない。
- AC6：手動の公開承認・認証・Version/hash・公開後操作確認・rollback指示の残る箇所が文書で明確。公開失敗後に成功と表示しない。
- AC7：現行#2/#3/#4のACと3スプリント1PR/リリース運用を維持する。ゲームコード・抽選/出玉/物理・素材内容を仕組み構築で変更しない。

## 依存・見積・担当

Lead回答：prepare CLI、manifest検証、その試験、候補一致＋手動公開/rollback手順、統合検証を各1作業単位として計5単位、**1〜2実装日相当**。コードを実装して確認した精度ではなく、容量判断用の暫定見積。既存#2/#3/#4を優先し、S01の残容量をPMが再評価するまで確定日程としない。日数は納期保証ではない。

主要依存は#2の全回帰合格、#3修正後releaseの画面受入、Chrome起動権限、port競合の処理、dirty tree識別、実使用Wrangler版の確認。機構は不合格を正しく停止する検査を先に組めるが、不合格候補を正式release候補にしない。

Leadがコード/試験、SMがmanifest/引き継ぎ記録の整合、Designerが既存#3/#4の画面証拠、PMがIssue化・対象追加確認・AC判定を担当する。#10は追加承認済みのため、Leadが実装し、SMが運用手順・証拠整合を進める。実公開は引き続き範囲外。

現在の承認済みキュー：Leadは#2診断/修正/回帰 → #3結果ラベル → #10仕組み実装。Designerは#3の新画像とrelease更新待ちの間に#4のAC/コードを照合し、更新後に#3判定 → #4の2サイズ×3表示/状態・体験 → 証拠整理。#10は承認済みの次タスクとして、既存3件の検証と競合しない範囲で進める。

## 手動で残る操作と対象外

ユーザーのスプリント対象追加確認、PMの受入、3スプリントのPR/マージ判断、具体的候補の公開許可、Wrangler認証、実公開操作、公開後目視/音/実機、rollbackの指示は手動のまま残す。

GitHub Actionsによる自動公開、CI/Secrets導入、Git連携での自動deploy、アカウント変更、実際のCloudflare/PlayCanvas送信は今回の最小案に含めない。既存 [公開資料](../prototype/CLOUDFLARE_DEPLOYMENT.md)、[資産/起動設計](../prototype/STARTUP_REFACTOR.md)、[AGENTS.md](../../AGENTS.md) を公開時の根拠として使う。

## 実行入口と引き継ぎ条件

以下はLeadの採用設計に合わせた入口。rootで実行する。20件fixtureログとコード、実prepareの成功終端と候補manifest/全資産を照合済み。今回の結果は下のAC表を参照する。

```sh
npm run release:prepare -- --issues 2,3,4,10
npm run release:verify
```

prepareはローカルの単体/統合、release build、自前のephemeral portでstrict preview、既存 `test:release` と `test:browser`、bonus専用カウンタを含む `feedback.browser.mjs`、ソースと全配布資産の一致検査を行う。自分で開始したpreviewだけをcleanupするため、別ターミナルで4178 previewを立ち上げる必要はない。Chromeが起動できない環境は不合格と記録し、同じ試験の許可された環境で再実行する。source fingerprint対象はroot packageとprototypeのsrc/public/tests/tools/package/lock/Vite/Wrangler設定。docs/reference-review/tmp/dist/.cacheは除外する。

verifyは内部manifestと現ソース・target設定・candidate固有の固定assetsの全集合を照合する。verify成功だけでは今回の画面要件の目視判定、PM受入、公開許可が完了したとは扱わない。source変更後はverifyを通して候補を取り違えない。別buildがdist-releaseを置き換えても、固定候補を変更したことにはしない。

3スプリントの受入後、公開候補と明示許可がそろった担当者だけが次を実行する。#10の今回の検証では実行しない。

```sh
npm run release:publish -- --confirm-target tsukikage-pachinko
```

publishはverify後に再buildせず、manifestに記録したcandidate固有assetsを明示指定して手動Wranglerへ渡す。CLIは明示したconfirm-targetフラグを解析し、単なる文字列の出現で確認済みにしない。実際に使うWrangler設定/targetとmanifestも一致させる。`--confirm-target` は誤送信防止のCLI指定で、ユーザーの公開明示許可を代替しない。従来の `deploy` は再buildしていたが、#10では `release:publish` への委譲へ変更された。引数なしのdeployはtarget確認不足で停止する。手順では意図を明確にする `release:publish` を使う。公開担当はmanifest/ログ・受入Issue・fresh取得Versionと公開先・許可記録を突合してからpublishする。

| 操作 | 正常終端と判定 | 失敗時の戻り先 |
|---|---|---|
| prepare | `Verified local release candidate: <manifest path>` と終了0。途中のtest成功だけでは未完了 | `Release workflow failed: ...` と終了1。原因を切り分け、変更/source mismatchは修正後再prepare |
| verify | `Verified candidate assets, source inputs and target configuration.` と終了0 | candidate改変/欠落/source不一致は原因確認後再prepare。target不一致は許可/対象設定の照合へ戻る |
| publish | 専用成功文はなく、Wrangler終了成功の後にもVersion/hash/公開操作確認が必要 | CLI不足/誤targetは許可/対象照合へ戻る。公開操作失敗はfresh deployment確認と障害診断へ |

Chrome起動制限はアプリassert失敗と区別する。CLI終了0をデザイン・音・実機の合格へ拡張しない。

## 公開前のfresh確認と障害時診断

以下は将来の手動公開担当用。#10の今回の作業ではクラウド問い合わせ・公開・rollbackを実行していない。履歴のVersion `5e39c37c-135e-4b4b-b1e1-9ff0fefd339c` は過去記録であり、現在値や自動rollback先へ固定しない。

ローカルにあるWrangler実解決版は `4.147.0`。既存CLIソースで `deployments status/list`、`versions list` の `--name/--json` と、`rollback` のVersion位置引数/`--name` を確認した。以下は `prototype/` を作業ディレクトリとし、依存が変わったら実際の版/ヘルプを再確認する。

```sh
./node_modules/.bin/wrangler --version
./node_modules/.bin/wrangler whoami
./node_modules/.bin/wrangler deployments status --name tsukikage-pachinko --json
./node_modules/.bin/wrangler deployments list --name tsukikage-pachinko --json
./node_modules/.bin/wrangler versions list --name tsukikage-pachinko --json
```

担当者は現在のdeployment、各Versionとtraffic割合、直前の既知正常版、対象Worker/domain、取得時刻をローカル引き継ぎ記録へ残す。アカウント情報は必要部分だけ照合し、認証token・認証設定・環境変数を出力/転載しない。問い合わせ失敗ならVersionを推測せず、認証/ネットワーク/Worker名を切り分ける。deploymentが複数Versionのtraffic分割なら、単一版100%へのrollbackが同じ配信状態の復元ではない点をPMへ提示する。

公開後はcandidate manifestと公開メインJSのSHAを比較し、本編のHTTP/画像/操作確認を実行する。HTTP 404や資産欠落は公開HTMLが参照するpath、正しい候補、対象Worker、応答/cache、DNS条件を順に確認する。ブラウザ起動制限はアプリassert失敗と区別し、自動で別candidateを公開しない。

rollbackが必要なら、その時点のdeploymentを読み直し、戻す具体的Versionと影響をユーザーへ提示する。指示を得てから `./node_modules/.bin/wrangler rollback <記録したVersion-ID> --name tsukikage-pachinko` を実行する（山括弧は置換する説明用表記）。引数省略による既定版の選択や `--yes` を承認の代わりに使わない。戻した後もVersion/公開SHA/画像/操作を再確認し、成功と未確認を記録する。

## #10の提出証拠とAC照合

PM初稿レビューで、可変dist-releaseのmanifest固定だけでは候補凍結が不十分として差戻し。candidate固有assetsコピーとpublish指定、confirmflag解析、実際のtarget/config整合が必要。コード自己申告だけでAC2/4を合格にしない。

2026-10-07、Leadの実装・正常prepare提出をSMがログ/manifest/実固定assetsで照合。PMもverifyを実行して終了0を確認した。以下はSMの受入推薦で、最終PM判定は正本Issue #10とPM受入記録へ記録する。

| AC | 必要な提出証拠 | 現在の照合 |
|---|---|---|
| AC1 順次実行/失敗停止 | prepare実コマンド、全回帰/test→build→browserのログ・終了状態、失敗fixture | 実prepare終了0、401成功/0失敗、release build/25画像/controls/feedback3経路成功。失敗fixtureで候補無効化も確認 |
| AC2 全出力識別 | candidateの内部manifest、全path/bytes/SHA、Issue/fingerprint/環境/ログ | 候補79011609…の固定45資産/14,885,469 bytesをSMが全件SHA/集合再計算しmanifest一致。Issue2/3/4/10・版・logPath確認 |
| AC3 差分/未合格拒否 | 改変/欠落/追加/ソース変更/未合格candidateのfixture結果 | 20fixtureで改変/追加/削除/source/symlink/traversal/manifest欠落拒否。実candidate同サイズ改変の送信前拒否/復元verifyも確認 |
| AC4 同一bytes/再buildなし | publish検査の結果、build非実行の証拠、送信しない実証 | stubでcandidate固有assets指定/再buildなし、別dist更新後も固定候補維持。実candidate同サイズ改変をdeploy runner前に拒否。実公開なし |
| AC5 preview管理 | 起動待ち/port競合/起動失敗/終了cleanupの試験、実prepare終了後の状態 | fixtureのpreview失敗/cleanup、strictPort/起動待ちのコード確認。実prepare自前56109閉鎖、既存4178維持を確認 |
| AC6 手動承認/復旧 | 本書とchecklist、履歴Versionとfresh取得の区別、公開/rollbackの未実施明記 | 文書整備済み。CLI明示confirm/誤target拒否/失敗伝播fixture確認。実公開/rollbackなし |
| AC7 周期/既存対象維持 | 実変更ファイル、#2/#3/#4の結果、3スプリント周期・Issue承認記録 | PMの#2/#3/#4 Accepted、差分範囲と#10非公開/3スプリント周期の維持を照合。全4件受入後はS01 Review/振り返り準備 |

2026-10-07の最新PM報告では#2/#3/#4がAccepted、#10は正常prepare確認済みで最終PM受入待ち。#4はmatrix29/initial6と局所bonus実数の直接照合による。大当りの実払い出し証拠は通常賞球を含む `w.payout > 0` だけでは足りず、`w.bonus.payout`（アタッカー専用）と実bonus入賞数などの専用カウンタを対応させる。自己申告の「実払い出し」をこの限定証拠なしで受入済みにしない。

今回照合した 20件fixtureログ：`../../prototype/reference-review/agile-2026-10-07/s1-release-workflow-tests.log`（ローカル保存証拠、PRへ同梱しない） は20成功/0失敗。publishはrunner stubで、Cloudflare送信を行った結果ではない。実prepareログ：`../../prototype/reference-review/agile-2026-10-07/s1-release-prepare.log`（ローカル保存証拠、PRへ同梱しない） は401成功/0失敗、各ブラウザ成功と実プロジェクトの正常終端を確認済み。verifyログ：`../../prototype/reference-review/agile-2026-10-07/s1-release-verify.log`（ローカル保存証拠、PRへ同梱しない）、実候補改変/cleanup/限定払出記録：`../../prototype/reference-review/agile-2026-10-07/s1-release-candidate-checks.log`（ローカル保存証拠、PRへ同梱しない）、deploy引数不足拒否：`../../prototype/reference-review/agile-2026-10-07/s1-deploy-gate.log`（ローカル保存証拠、PRへ同梱しない） を対応させた。fixture内の一時プロジェクト成功を実正常終端と取り違えない。

当時の内部manifestは `prototype/.cache/release/candidate.json`（再prepareで無効化/置換されるactive pointer）、固定候補IDは `79011609-06b2-4c3b-8ca4-2e4689a27c15`。作成時刻は2026-10-07 09:08:52 JST、sourceSHAは `a8013c242d72a38f353097ba481836f95ed4ed1ae7dd1d01193b45224b52ba0c`。HEAD `941f79d2e9b114c41a4c4e559dfa1c17b24e10a5`、dirty=trueを明記し、既存変更をPR受入済みとしない。環境はNode25.8.1/npm11.11.0/Chrome154.0.8037.98/Vite8.3.0/Wrangler4.147.0/Playwright1.63.0。

SMはfixed assetsの全45件のサイズ/SHAと集合を直接再計算し、内部manifestと一致、manifest/log/feedbackが公開assetsへ混ざらないことを確認。battle/bonusの保存snapshotを直接読み、両方 `w.bonus.payout=15` / `counts.bonus=1` を確認した。通常賞球込みのw.payoutを根拠に加算していない。

本スプリントで実公開・freshクラウドVersion取得・rollbackは未実施。今あるcandidateはローカルの検証済み候補で、R01の3スプリント受入manifestや具体的公開許可の代替ではない。S01全4件受入後はReview/振り返り準備とし、次#5/#6/#7の要求整理・証拠まとめまでを予備とする。次スプリントの実装開始はユーザー確認後。
