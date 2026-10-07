# PM受け入れ・進行判定

2026-10-07。PBI正本はGitHub Issues。現在はS1の対象提案・ユーザー開始確認待ち。以下は事前準備と確認前に着手した差分の評価であり、スプリント完了ではない。

## 提出物と要件判定

| 対象 | 証拠 | PM判定と次の指示 |
|---|---|---|
| 運用R01/R02/R03 | [SCRUM](SCRUM.md)、[BASELINE](BASELINE.md)、[BACKLOG](BACKLOG.md) | 運用準備は合格。役割、DoR/DoD、WIP、予備キュー、AC判定を定義。PBI正本はIssueへ変更し、手待ち回避は承認済み範囲内に限定 |
| 運用R04 | [SPRINTS](SPRINTS.md)、[RELEASE_CHECKLIST](RELEASE_CHECKLIST.md) | 計画は合格。1週間は暫定、開始確認から日程を再計算。3スプリント終了後のPR/公開対象準備を定義。PR/公開はまだ実施せず |
| 運用R05 | heartbeat `pm` の作成/更新成功 | 平日10時Asia/Tokyo、ACTIVE。GitHub Issuesとユーザー開始確認を定期プロンプトへ反映。未確認中は整理・提案のみ |
| [#2 QA-01](https://github.com/sintaro-katuta/silverball-chronicles/issues/2) | [リード提出](ENGINEERING_BASELINE.md)、npm-test.log、right-road-failure.log | ベースライン記録は合格、現行品質は不合格。381件中380成功/1失敗。右道釘中点probeは単独でも再現。原因は未診断、修正はS1開始確認後 |
| [#3 DUX-01](https://github.com/sintaro-katuta/silverball-chronicles/issues/3) | [デザインAC判定](DESIGN_REVIEW.md)、main.js/feedback.browserの差分、新規画像/feedback-dux01.log | 差戻し・未受入。6パネルは読めるが390結果で「り」と値が孤立改行。結果ラベル短縮等の最小修正後に再撮影。値一致/体験独立のassert成功は確認、通常→RUSHの非リセットや長尺演出中カウント増加の網羅確認は未完了 |
| [#4 DUX-02](https://github.com/sintaro-katuta/silverball-chronicles/issues/4) | [UI検証行列](UI_ACCEPTANCE_MATRIX.md) | 要件準備は合格、24条件の検証は未完了。#3の6画像や既存操作試験を行列全体の合格へ拡張しない。S1開始確認後に実施 |

## PMが直接確認した証拠

- 全体ログの tests381 / pass380 / fail1 と150981ms、および失敗stackがleft-discrete-pins.test.js:25であることを読み取った。
- feedback-dux01.log の390/1440 UIおよびbattle/bonus/rush成功を確認した。これは指定した体験ルートで自然当選率の観測ではない。
- リードの対象コードと既存変更が混在するdiffを読んだ。今回の追加はラベル・説明・回数単位と既存ブラウザ試験のassert。main.js全diffを今回の新規成果にしない。
- 390pxの結果画面：`../../prototype/reference-review/agile-2026-10-07/390-result.png`（ローカル保存証拠、PRへ同梱しない）をPMが直接目視。「大当り」の末尾と0回/0の折返しが対応を読みにくくするため、デザイナーの差戻しに同意した。

証拠の保存先：今回のログ・新規画像：`../../prototype/reference-review/agile-2026-10-07/`（ローカル保存証拠、PRへ同梱しない）。スマホ実機、Capacitor、音の実聴取、全演出全尺、長期自然成績は未検証。

## スプリント開始確認に出す具体案

S1のゴール：現行の品質失敗を解消し、消化回数の意味と結果画面を読みやすくし、操作状態を検証する。

対象は #2 / #3 / #4。期間は確認日から暫定1週間。#2は原因診断と根拠ある最小修正・全回帰成功、#3は最新画像で折返しを解消し値と操作を維持、#4は24条件の状態/案内/入力を証拠付きで判定する。新しい確率・出玉・素材制作・クラウド送信は対象外。

リードは #2 → #3、デザイナーは #3 の新画像判定 → #4、SMはIssue/依存/証拠/手待ちを管理する。承認された対象が尽きた場合は要件準備へ移り、次のPBIは確認後に開始する。

開始確認：未受領。確認前の追加修正を停止し、既存差分を保持。スプリント完了数0、PR作成数0、今回公開更新0。

## 自動承認レビューによる公開制約

クラウド公開を将来の定期実行に含めた最初の設定は、自動承認レビューが新たな明示許可不足を理由に拒否した。公開操作を除いた安全な範囲の設定で成功。3スプリント後に具体的な完成対象・検証・復旧手順を提示して公開承認を受ける。公開されていない候補をリリース済みとは報告しない。


## 2026-10-07 S1開始確認と追加提案

ユーザー「はい、大丈夫そう」で #2/#3/#4 の開始確認を受領。S1はActive、暫定10/7〜10/13。リード/デザイナー/SMへ再割当。前段の確認待ち/停止記録は開始確認前の履歴。

ユーザー追加質問のリリース仕組みは [REL-02 #10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10) として具体化。ローカル検証→資産manifest→一致検査付き手動公開→公開後確認/復旧の最小構築を提案。追加確認待ちで実装未開始。3スプリントごとの実リリース周期は維持。


## 2026-10-07 #10追加承認

ユーザー「はい、それで進めてください」で #10 の最小構築範囲を承認。S1対象は #2/#3/#4/#10。リードへ実装/試験、SMへ手順/証拠照合を割当済み。#10の実公開は範囲外。公開成功は未検証としてローカル正常/失敗経路の証拠でACを判定する。


## S1 #2受入（2026-10-07）

Accepted。原因は受け皿と旧probe開始位置の接触。製品物理を変えず局所fixtureを分離し、人工連結壁の負例を追加した差分をPMが確認。関連13件成功、全381件成功/失敗0・172821msを今回ログで確認。[Issue #2のAC別判定](https://github.com/sintaro-katuta/silverball-chronicles/issues/2)。PR/リリース待ち。

#3の新390結果画像もPMが直接目視し、孤立改行解消と意味/単位の維持を確認。操作/体験の補強検証と#4最終提出を待って最終判定する。


## S1 #3/#4受入（2026-10-07）

#3 Accepted：修正後390結果をPMが直接目視し折返し解消を確認。2サイズ×3表示と値一致/休止/体験独立の操作証拠を照合。表示以外のドメイン処理は変更なし。

#4 Accepted：matrix29件すべてpass（基本24＋復帰5）、initial-stock6件は400球/獲得0/回数0/実発射0。両幅のbonus専用payout0→15→30と実入賞数0→1→2をPMがJSONで確認。w.payoutは一般賞球も含むので証拠から除外した。代表的な右打ち停止/PC RUSHパネルをPMが直接目視。実機/音、満保留、玉切れ全消化、自然RUSH終了など補足未検証は合格範囲に含めない。

GitHub #3/#4へAC別判定を投稿しAcceptedラベルを付与。PBIはPR追跡のためopenを保持。#10は正常prepareと最終PMレビュー待ち、スプリント自体はActive。


## S1 #10受入とスプリント現在地（2026-10-07）

Accepted。正常prepareの全401pass/0fail、build/25画像/操作/体験3経路を確認。PM自身の `npm run release:verify` はexit0。候補 `79011609-06b2-4c3b-8ca4-2e4689a27c15`、45資産14,885,469B、Issue2/3/4/10、全path/size/SHAと実ツール版をmanifestで直接確認。内部log/manifestは配信資産外。

コードレビューで候補固有assets固定、CLI明示flag、実target/config整合の3点を差戻し、修正版で解消。20fixture成功と同サイズ1byte改変の送信前stub拒否→復元verify成功を証拠で確認。自前preview56109終了・既存4178保持、失敗時無効化/cleanupを確認。最終battle/bonusは専用payout15/実bonus入賞1/消化1のJSONで確認し、一般賞球の累計で代替していない。

運用文書はSMとデザイナーが実CLI/正常終端/失敗復旧/手動承認/公開後確認/rollbackを照合。公開・本番rollback・実機・音は未実施。公開周期は3スプリントを維持。

S1の全4PBIをPM受入。IssueへAC別記録とAcceptedラベル、milestoneをReview/振り返り準備へ更新。PR追跡用にIssueはopen保持。スプリント完了数を数合わせで増やさず、S2は要求精緻化と対象提案まで進め、開始はユーザー確認後。今回PR/commit/クラウド公開なし。


## リリース意図の訂正（2026-10-07）

ユーザーはPRがマージされた時のGitHub Actions CDを想定。PMの先行整理は手動publish入口までだった。#10の受入はローカル検証・候補固定・手動公開前検査の範囲であり、CD完了ではない。期待フローを3スプリント1PR→PR CI→ユーザーによるmainマージ→マージ済みcommitを検証→同一候補を既存Cloudflareへ自動公開→公開後確認へ訂正。追加PBI [#11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11) を作成し、S1追加確認待ち。workflow未実装、Secrets登録/自動公開有効化未実施。


## 2026-10-07 #11追加承認とRelease要求

ユーザーが#11 S1追加を承認。最新の運用はSprint branch→version/release集約branch→3Sprint後mainへリリースPR→merge毎に検証/CD/公開後確認/Release notesとGitHub Release。バージョンbranchとreleasebranchを同じ集約branchと仮定し担当へ指示。既存#10のローカル受入は保持、#11はActive。具体版や実branch・Secret・有効化はまだ未実施。


## #11ローカル構築判定（2026-10-07）

ローカル構築受入、PBI全体はReview/実接続・稼働確認待ち。PM自身が実workflow両ファイルactionlint1.7.12 exit0、release:verify exit0を確認。managed Node24.21/npm11.19/Chromium153で431pass/0fail、release/controls/feedback3の正常終端を読取り、候補b1965bd5-7eaa-48f7-85f5-6fc0b540b38f、45assets14,885,469B、Issue2/3/4/10/11、sourceSHA c7f8c625a8146bbb3f866efed2c54427c02619e37f61ee21e452a5f50ff12baaをmanifestで確認。

50fixtureとコードでevent/branch/version/SHA、同一候補、失敗停止、fresh配信Version100%/全公開SHA、notes/Releaseのpost-smoke生成・draft/retry・前版記録を照合。macOS dirty作業ツリーのprepareであり、GitHub Ubuntu/clean merge/CD本番を実行した結果ではない。

GitHub読取時点でenvironments/Repo Secrets/Variablesは未設定。workflowはローカル未push。初回集約版を確認中、実branch/commit/PR/Secrets登録/有効化/本番Release・公開は未実施。#11を全完了やCD稼働済みとは呼ばない。

次の実作業は初回版と既存差分の受入範囲を確定→Sprint/release branchとSprint1 PR→実CI、productionのsecure Secrets/有効化→3Sprint後main release PRで実CD確認。今回のユーザー方式では、CD有効化後はmainへのrelease PRマージが公開合図となり、毎回の手動チャット公開に戻さない。

## 最新main統合後の再判定（2026-10-07）

既存音PR #1を含むmain `38b06d24` から作成した分離 `sprint/S01` に、必要な先行実装と承認済みS1改修を統合した。原workspaceは保持した。[変更一覧](S1_CHANGE_MANIFEST.md)の103ファイルを明示的にステージし、未知ファイル・private画像/動画・生成物・運用exportは追加していない。

Node24.21.0/npm11.19.0/管理Chromium153で全452単体テスト、release build、390/1440のrelease/controls、feedbackを実行し、prepareは成功した。音専用21テスト、actionlint2workflow、全差分形式と競合marker検査も成功した。候補 `ba3864d5-f9cb-45f4-834c-2c3cca133ff9` は45資産/14,901,612 bytes。source SHA256は `311a391ab477bcc79737b2203a4ecac7f37bb62e0202302137dbfb59a712df62`。PMのverifyで全資産・source・target構成の一致を再確認した。

この候補はcommit前（git38b06d24、dirty=true）の統合sourceを検証したもの。clean CI候補や実GitHub CI成功とは扱わない。最終commit後にverifyし、同一sourceであることとcommitの対応をPR本文に記録する。ログはローカル保存 `/private/tmp/silverball-s01-integrated-prepare.log`。ゲームchunk530.93kBのbuild警告は残り、実機負荷・聴感・実CDは未検証。

PM判定：#2/#3/#4/#10の自動回帰は再合格。Designer提出の新6表示＋2結果、効果音checkbox、発射/休止/復帰/終了を今回の画像・JSONで照合し合格。聴感/実機の合格へ拡張しない。#11はローカル基盤合格、GitHub送信と実runner判定はReviewを維持。開始未確認のS2/S3実装には進まない。各担当は統合証拠・PR本文・要求照合を現在作業とし、その後は承認済みPR CIの診断準備へ引き継ぐ。

GitHubへのreleaseブランチpushは自動承認審査に拒否された。AGENTSの新たな明示許可までクラウド更新しない方針と、具体的送信許可不足が理由。ローカルsnapshot完成後、`release/0.1.0`と`sprint/S01`の送信およびS1集約PR作成を具体的に確認する。mainマージ・本番公開・Secret登録/CD有効化は別途確認する。
