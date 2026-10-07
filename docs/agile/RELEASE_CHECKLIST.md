# Sprint集約PRと3スプリント単位のリリースチェックリスト

初回はユーザー確認後に開始したS01〜S03の受入済み成果をR01へまとめる。S01は#2/#3/#4と#10/#11追加のユーザー開始承認によりActive、2026-10-07〜10-13の暫定1週間。S02/S03とS01追加対象はそれぞれユーザー確認が必要。PM受入、PR作成、マージ、ローカルリリース準備、公開完了を別々に記録する。[スクラム運用](SCRUM.md)、[開始時点](BASELINE.md)、[既存Cloudflare手順](../prototype/CLOUDFLARE_DEPLOYMENT.md) が根拠。

最新運用は毎Sprintの集約向けPR3本と、3Sprint後のrelease→main PR1本。実リリース周期は3Sprintを維持する。初期の3Sprint1PRだけ/毎公開チャット確認は履歴。#10ローカル機構は [RELEASE_MECHANISM](RELEASE_MECHANISM.md)、#11のCI/CDと有効化は [RELEASE_CD](RELEASE_CD.md) を参照。

## 対象Issueと開始確認

- [ ] PBI正本のGitHub Issuesで対象番号/リンク・要件・状態・受入条件を確認し、ローカルBACKLOGの鏡と一致する。
- [ ] S01/S02/S03それぞれのユーザー開始確認と対象Issueを記録した。未確認で着手した差分は未受入として区別する。
- [ ] 対象追加/差戻し修正/次スプリント開始がユーザー確認範囲内にある。未承認対象をPR/releaseへ混ぜない。

## 既存変更の保護

- [ ] 最新の `git status --porcelain=v1 -uall` と `git diff --stat` を確認し、開始時の既存変更と今回の成果を分けた。
- [ ] 変更の所有・目的・受入をPMが確認。旧変更を今回の成果として計上していない。
- [ ] `tmp/`、生成途中の証拠、秘密情報、不要な公開素材はPR/配布対象から除外した。
- [ ] shared checkout上の他担当ファイルを巻き戻していない。必要な差分保全を確認し、reset/clean/強制pushを行っていない。
- [ ] PRへ含めるファイル/差分だけを明示的にステージする。既存変更を未確認で `git add .` へ渡さない。

## 受入対象manifest

R01の実際の対象が決まった時に下表を埋める。空欄は準備未完了。PMの条件付き受入は条件を明記し、未受入・保留を混ぜない。既存改修を含めるなら、今回の追加成果とは別行にする。

| 項目 | 記入内容 |
|---|---|
| リリースID / 日程 | R01 / S01〜S03、予定と実際の完了日 |
| 受入済み要件 | 正本Issue番号/リンク、ユーザー開始確認、PM受入記録、S01/S02/S03それぞれの完了判定 |
| 対象コード | ブランチ、commit SHA、既存差分を含む場合の由来 |
| PR差分 | repository、base branch、base SHA、head SHA、比較コマンド、対象ファイル |
| 対象資産 | release buildの許可資産、追加/差し替え一覧、HTML/JS/CSS、hash/サイズ |
| 試験 | 今回の日時・環境・コマンド・結果・ログ、既存結果との区別 |
| 未確認 | 実機・音・性能など未確認事項、影響と残タスク |
| 引き継ぎ | 変更履歴、次のReady、公開操作担当、戻し方 |
| 公開承認 | 具体的対象、公開先、ユーザーの新たな明示許可の根拠。未取得なら未実行 |

## PRと認証・CI

- [ ] remoteとブランチを読み、PR比較baseを既存の `main` と決めつけず、実際のリポジトリ設定/作業開始点と照合した。
- [ ] base/headのSHAを記録し、三点比較（例：`git diff <base>...<head>`）で差分範囲を確認した。
- [ ] GitHubの認証・書込権限・既存PRの有無を確認した。未検証を成功と記載していない。
- [ ] リポジトリのCI定義、必須チェック、branch protectionを確認し、適用される結果を記録した。CIがない場合はローカル結果をCI結果と呼ばない。
- [ ] 各Sprintは最新release集約SHAからbranchを開始し、Sprint→releaseのPRで正本Issue/AC/今回の証拠を説明した。3Sprintで3本を受入・集約し、各PRをこのタスクへ添付した。
- [ ] 3回の受入済みSprintを説明するrelease→mainのPR1本を作成し、version/package/予定tag/merge対象、ノート、今回の試験/未確認を確認した。
- [ ] CIは公開権限/Cloudflare Secretsなし、CDはmerged closed/base main/same-repo head release/のみに限定し、main直接pushやSprint集約マージで公開しない。
- [ ] 前版のCD成功または障害復旧完了後に次release→main PRをマージする。検証途中にmainを先へ進めず、merge SHAとcurrent mainの照合を維持する。
- [ ] PMのマージ判断とチェック結果を記録した。PR作成だけをマージ・公開完了と説明していない。

## ローカルリリース候補

- [ ] 変更に応じた単体/統合/本編ブラウザ試験、`git diff --check` を実施した。
- [ ] `npm run release:prepare` が成功し、test/build/browserログと `prototype/.cache/release/candidate.json` がある。公開用の `prototype/dist-release/` を対象とし、通常 `dist/` は公開対象へ渡さない。
- [ ] prepareの自前ephemeral strict previewで `test:release` と本編操作を確認し、preview cleanupを確認した。
- [ ] 390×844/1440×900の全画像/HTTP/ブラウザエラー、休止/復帰/終了、変更した状態を確認した。必要に応じて狭幅/横向きも含めた。
- [ ] 試験後にコードを変更していない。変更がある場合は影響する試験とビルドを再実施した。
- [ ] `npm run release:verify` が成功し、ソースfingerprint/実際の対象設定/candidate固有assetsの全資産集合が候補に一致する。内部manifestは公開対象へ混ぜない。
- [ ] 資産manifestとメインJS等のhashを記録し、公開前版・戻す版の根拠を保存した。
- [ ] 既存チャンク警告、音の聴取、実機/Capacitorなどの未確認事項を隠さず記録した。

素材と操作の手順は [起動改修](../prototype/STARTUP_REFACTOR.md)、[最新受け皿検証](../prototype/RECEIVING_TRAY_2026-10-07.md)、[公開手順](../prototype/CLOUDFLARE_DEPLOYMENT.md) を参照する。過去に公開25画像を確認した記録は、次の候補の再検証を代替しない。

## 公開と公開後の確認

この節は#11のCD有効化を具体的workflow・既存公開先・merge自動公開方式についてユーザー確認後に適用する。現在はdefaultoff/Secrets未登録。確認後はユーザーのrelease→main PRマージが公開合図で、毎リリースのチャット再承認へ戻さない。スケジュール実行や3スプリント到達だけでは公開しない。公開待ちはローカルリリース準備済みと記録し、確認済みスプリントの対象内だけ開発を続ける。対象が尽きたらIssue整理・提案・証拠まとめへ移る。

- [ ] CD有効化のユーザー確認とENABLE_PRODUCTION_CD=true/必要Secrets設定があり、ユーザーが対象release→main PRをマージした。
- [ ] 既存Cloudflare認証と公開前のVersion ID/trafficを今回freshに確認した。資料の過去Versionを現行値として流用しない。認証情報を文書/チャットへ保存していない。
- [ ] 許可されたcandidate固有の固定assetsだけをmanifestから指定して公開し、Version ID/URL/時刻を記録した。可変dist-releaseや別buildを送信していない。
- [ ] 公開メインJSなどのhashがmerge SHAから検証した固定candidateと一致する。PR時の結果をmerge後候補の成功に代用していない。
- [ ] 公開URLでスマホ幅/PCの画像、HTTP/ブラウザエラー、発射停止/ポーズ/復帰/終了、今回の変更を確認した。
- [ ] DNS等の環境条件は記録し、条件付きのアクセスを全環境の成功へ拡張していない。
- [ ] deployと公開smoke成功後にだけ、同version/merge SHAのtag・GitHub Release・notesを作成した。同版同SHA再runは冪等、同版異SHAは拒否した。
- [ ] 公開失敗/smoke失敗は成功Releaseとして公開せず、Version/hash/失敗段階と復旧を記録した。

公開後の証拠は役割で照合する。デザイナーは390/1440の結果「消化回数 / 大当り」の折返し・説明と3表示の操作/案内/パネル非重なりを新しい公開画像で判定。Leadは公開JS hash、画像ロード、ブラウザ例外、体験→通常の初期400/獲得0/draws0（導入中spawned0）、bonus専用counts/payoutを検証する。SMは公開URL/Version/撮影条件と役割別の証拠をIssueへ対応させ、PMは正本ACで判定する。ローカル画像を公開検証へ転用せず、実機/聴感をこの確認だけで合格にしない。

最新CDはmerge SHAのprepare/固定candidate/verify後に同じ成果物をpublishする。旧手動入口 `npm run release:publish -- --confirm-target tsukikage-pachinko` は#10の履歴/復旧用で、#11有効化前に送信しない。`deploy` は今はpublishへ委譲し、引数なしでは停止する。手順では明示的な `release:publish` を使う。公開失敗時はまず画像欠落/HTTP/ブラウザエラーと対象Versionを確認する。戻し先は今回記録した直前Versionを使い、初回公開版を常に正解と扱わない。ロールバックもユーザーの指示に基づいて実施し、結果を再検証する。[公開手順の操作と運用](../prototype/CLOUDFLARE_DEPLOYMENT.md#操作と運用)

## 完了判定

PMがmanifest・チェック結果・残課題を照合し、「PR作成済み」「ローカルリリース候補準備済み」「公開待ち」「公開完了」の実際の状態を記録する。R01の公開待ちが残っていても、S04の独立したReady/予備を提案できる。S04の実装開始はユーザー確認後に限る。
