# S3リリース候補引継ぎ（#8）

2026-10-08。S3 #8/#9/#15は開始承認済み、隔離branch `sprint/S03`、基点 `c989ee8`。本書は候補作成前の手順整理。作成時の設計待ちは履歴。現在はDraft PR #16作成・添付済み、head `3b502a08cc63fa9a14c481aee5cac82b0462c6d3`、CI37738355830進行中。代表pressure feather改修はcommit済み、代表2幅はPM/Designer合格。#9全尺網羅・#15全経路/操作・新CI/候補の受入は未完了。main PR/本番未実施。 本書は公開手順であり、実公開の記録ではない。

## 候補を作る条件と証拠

1. Designerの#9調査、Leadの#15代表pressure改修、両幅静止/等速連続・関連機能検証をPMがACから判定。保存当落/図柄、54/58/12秒、PUSH受付/告知、抽選/FIFO/物理/賞球を保持し、未取得経路を残す。
2. PMが目的別commitと対象pathを管理。原dirtysourceとprivate画像/動画/logを保護し、runtime/public/tests/tools/設定/依存の必要閉包をレビュー。候補を作るsourceへの編集と重い測定/録音を止める。
3. Node24.21.0とPlaywright管理Chromiumを明示した環境で `PLAYWRIGHT_BROWSER=chromium npm run release:prepare -- --issues 8,9,15`、続いて `npm run release:verify`。前SprintのIssueは3Sprint受入表/構造化要約から参照し、今回の試験Issueと混同しない。全unit→release build→自前preview→release/controls/feedback browserを既存入口で検証する。
4. prepareは開始時に旧候補を無効化し、検証中source/出力の不変を照合して、`prototype/.cache/release/candidates/<UUID>/assets`へ成功bytesをコピー・全inventory再照合後にmanifestを完成する。内部manifest/logは公開assetsへ置かない。送信時に再buildしない。
5. 新candidateのID、実commit/dirty、sourceSHA/入力集合、全資産path/size/SHA/総数、Node/npm/browser/backend、checks/log、390/1440画像/連続範囲を実結果から記録。前候補の45資産/数値を新結果へ転記しない。tests/toolsを含むsource変更後は旧候補を履歴扱いとし、verify成功を付け替えない。
6. S3 PR→`release/0.1.0`の実CIでhead・検証mergeRef・新source/assets・artifact/runを対応付ける。3Sprintの受入残件と利用者向けsummaryをPMが確定後、release→main PRへ進める。未実CIをローカル成功で認定しない。

## 公開時の確認・担当（接続/有効化は未許可）

Workerは `tsukikage-pachinko`。主確認URLは `https://silverball-chronicles.sintaro-katuta.com`、同Worker別名は `https://tsukikage.sintaro-katuta.com` とworkers.dev。設定・許可境界は [CD_ENABLE_REVIEW](CD_ENABLE_REVIEW.md)、実装手順は [RELEASE_CD](RELEASE_CD.md)／[RELEASE_MECHANISM](RELEASE_MECHANISM.md)。

PMは対象版/3Sprint受入/許可/merge順序/障害判断を所有。接続管理者はaccount・Worker/routes・production environmentと `CLOUDFLARE_API_TOKEN`／`CLOUDFLARE_ACCOUNT_ID`、repository var `ENABLE_PRODUCTION_CD`を許可後に安全なUIで確認。具体的接続管理者はPMが確定する。値を文書へ保存しない。Leadはcandidate・公開SHA・browser診断、Designerは同条件の公開画面、SMはAC/欠測/履歴対応を照合する。

有効化後の同repo release→main mergeだけがCD起点。fresh公開前deployment/Version/trafficを復旧根拠に保存し、固定候補の送信→fresh現Version/traffic→実配信資産SHA→公開browser smoke成功後にtag/GitHub Release/notesを完成する。Cloudflare非配信設定ファイルをHTTP公開資産と同じ扱いにしない。別名個別smokeは現自動helper対象外として残る。

deploy後失敗は未公開失敗と区別し、Leadがcheckpoint・fresh配信状態を診断してPMへ報告。記録だけで成功/再送可としない。同版再runは現在Version/bytesを再照合し、具体Versionへのrollbackは影響と新指示を確認して接続管理者が実施、公開hash/操作を再検証する。前版成功/復旧完了前に次releaseをmainへmergeしない。

## 残件と有限予算

#7は録音準備と人間聴感の受入を分ける。人間聴取未受入を新候補/Releaseで完了扱いせず、PMが既知制限または受入残件として明示する。#11はPR CI/ローカルガードと本番接続を分け、Secrets登録・productionGate変更・実deploy/GitHub Releaseは今回行わない。外部settingsの現在値も本書では未確認。

最新のS3失敗run37738355830はjob21分40秒、prepare20分37秒。461unit成功/失敗0で456.509秒、build/release/controls/両幅UI/battle成功後、bonus専用払出待ち50秒timeoutでexit1。rush未到達の途中所要であり、完全prepare成功の所要とは扱わない。CD25分との差を単純計算してもjob側3分20秒/prepare側4分23秒しかなく、未完bonus/rush/終了操作に加えてdeploy・fresh API/公開資産照合・公開browser smoke・notes/Release/添付を要するため、25分内に収まると認定できない。

前成功run37692427739の15分34秒/458testと約6分browserは履歴参考で、最新失敗をその成功時間へ換算しない。新runのbattlePUSHは216.596秒で300秒内に成功しており、旧180秒内に到達したと読み替えない。Leadのbonus待機150秒最小修正は局所観測待ちで、採用値や成功実績を本レビューから推定しない。

現設定はPR30分/CD25分を維持。有効化前に修正後の完全prepareと段階別予算/有限上限を根拠付きでレビューする。新timeout値を独断固定せず、今回workflow/settings/権限は変更していない。実CD成功・ネットワーク/API所要・公開smokeは未検証。


次Ready：代表改修commit済みの新CI結果と候補を照合し、Designer全経路/操作/連続レビューとPM受入へ進む。#8は残件/検証/公開条件を整理し、新CI成功だけで#9/#15全受入としない。Git/送信はPM、原文書の持込みもPM担当。


## 2026-10-08 更新：#8候補未完成・再CI待ち

初回実Linuxはhead3b502a08/run37738355830、461unit/build/release/controls/UI/battle成功後にbonus専用payout待機50秒で失敗。verified manifestはない。helper1file修正commit2a26e61は局所Node24の3経路/通常復帰成功、bonus14.371秒/実入賞1/payout15。Linux待機不足は未再現で、旧失敗は私有 `prototype/reference-review/s3-2026-10-08/linux-ci-37738355830/` に保全しGit非同梱。

最新sourceFingerprintは507入力/SHA `678f899aaa7114af87e8a1cd1a70f8edb458578df8b52d38a788dfd8f0821b39`、視覚runtimeはc6a4c779…c8a1不変。finaldocsと修正をまとめた新CIを一度実行し、候補freeze/全asset/source対応を新実結果で確認する。段階所要・50秒時点未取得・Node環境・CD25分予算の制約は [S3_CI_REVIEW](S3_CI_REVIEW.md) を参照。新候補/全AC/本番CDは未受入。
