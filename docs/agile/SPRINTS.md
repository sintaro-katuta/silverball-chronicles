# スプリント提案と担当キュー

2026-10-07。PBI正本は[GitHub Issues](https://github.com/sintaro-katuta/silverball-chronicles/issues)。各スプリントの対象Issue・受け入れ基準をユーザーが確認した後に開始する。期間は承認日起点で暫定1週間。以前の10/7〜10/27の日付は未確定のため撤回した。

| Sprint | ゴール・候補Issue | 状態 |
|---|---|---|
| [S1](https://github.com/sintaro-katuta/silverball-chronicles/milestone/1) | [#2](https://github.com/sintaro-katuta/silverball-chronicles/issues/2)右道釘失敗の切り分け/解消、[#3](https://github.com/sintaro-katuta/silverball-chronicles/issues/3)消化回数とスマホ結果表示、[#4](https://github.com/sintaro-katuta/silverball-chronicles/issues/4)状態別の操作案内確認、[#10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10)リリース仕組み構築、[#11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11)GitHub Actions CD・Release/ノート | Review・#11実接続確認待ち（既存4件受入） |
| [S2](https://github.com/sintaro-katuta/silverball-chronicles/milestone/2) | [#5](https://github.com/sintaro-katuta/silverball-chronicles/issues/5)5台自然入賞測定、[#6](https://github.com/sintaro-katuta/silverball-chronicles/issues/6)端末負荷、[#7](https://github.com/sintaro-katuta/silverball-chronicles/issues/7)音評価から改善を選ぶ | 候補・未承認 |
| [S3](https://github.com/sintaro-katuta/silverball-chronicles/milestone/3) | S2の結果から要件を定義し、[#8](https://github.com/sintaro-katuta/silverball-chronicles/issues/8)受入成果のPRとリリース候補をまとめる | 候補・未承認 |

## S1の具体的な割当案

- リード：#2の原因診断・最小修正・全回帰 → #3の結果画面折返し修正と再撮影 → #10のリリース仕組み実装・検証。
- デザイナー：#3の新規画面をAC別に判定 → #4の状態別検証行列を確認。
- スクラムマスター：対象Issueの状態/証拠/依存を整理し、障害時にはS1の承認範囲内から独立タスクを割り当てる。
- PM：各IssueのACと提出証拠を照合し受入/差戻しを記録。未承認PBI追加は提案だけに留める。

#3には開始確認の新指示より前に着手した差分がある。開始確認まで追加編集を止めて保持していた。現在は承認対象内の修正を再開。計画時には390結果の孤立改行と#2の失敗が未解消だったが、現在は修正・再検証して受入済み。事前着手をS1の完了や受入にしない。

## 定期実行と承認記録

heartbeat「銀玉クロニクル PM・スプリント進行」、ID `pm`、ACTIVE。平日10時（Asia/Tokyo）。2026-10-07ユーザー指定の頻度で作成し、追加指示に従ってGitHub Issues正本と開始ゲートへ更新済み。未承認中は整理・提案・証拠まとめのみ。確認後は対象内の開発・検証・PM判定を続行する。常駐は保証しない。[定期実行の公式説明](https://learn.chatgpt.com/docs/automations?surface=app)。

S1開始確認：2026-10-07、ユーザー「はい、大丈夫そう」で #2/#3/#4 の開始を確認。Activeへ変更し、リード/デザイナー/SMへ再割当済み。現在は全4PBI受入済み、レビュー・振り返り準備。

追加提案：[REL-02 #10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10) リリース仕組み構築。2026-10-07「はい、それで進めてください」で追加承認済み。リードが実装、SMが運用手順と証拠を担当し、全7ACをPM受入済み。既存コマンドを統一してローカル検証・manifest作成・同一成果物の手動公開・復旧手順を整える。本番公開は対象外。

3スプリントごとにPRとリリース準備。クラウド公開を含む最初の定期設定は自動承認レビューに拒否されたため、公開を除いた設定へ変更した。具体的な完成対象を示し、新たな明示許可後に公開する。

## 次の継続と振り返り

開始確認前は対象/ACを提示して待つ。確認後はIssueの状態を更新し、同じ承認範囲内で手待ちを防ぐ。期末に差戻し件数、ブロック時間、Ready不足、実端末/音確認の可否を振り返り、次の提案を具体化する。日付だけでスプリントを完了扱いしない。


## S1提出結果と次のキュー

#2/#3/#4/#10 Accepted。401全テストとローカルrelease正常経路成功、候補 `79011609-06b2-4c3b-8ca4-2e4689a27c15` を固定。S1はReview/振り返り準備、まだ3スプリント完了や公開完了ではない。

次の平日10時には振り返りと #5/#6/#7 の要件精緻化・S2対象提案を進める。承認済み実装対象が尽きても、未承認コードを開始せず要求整理・証拠整備を担当キューへ渡す。PBIはAcceptedラベルでPR追跡待ち。


## CDの追加確認待ち

ユーザーの想定はPRマージ時の自動公開。#10のローカル仕組みからCDへつなぐ追加 [#11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11) をS1へ提案する。追加の確認前は開発を開始しない。既存4PBIの受入は維持し、CDを未実装として区別する。


## 2026-10-07 CD追加承認とブランチ運用

#11はユーザー「はい、追加して構いません」で承認、S1 Activeへ戻して実装。Sprintごとに集約releaseブランチから分岐→releaseへPR、3Sprint集約後release→mainへリリースPR、ユーザーマージを起点に検証/CD/公開後確認/成功Release・ノート。バージョンブランチとリリースブランチは同一として扱う。実ブランチ/版はまだ作成せず、命名例は sprint/<id> と release/<version>。

各Sprint集約PR（3件）とmain向けリリースPR（1件）を区別し、「3Sprintごと1PR」はmain向けの区切りとする。#11ローカル実装と実GitHubCI/CDの稼働確認は分け、実行していないクラウドを完了扱いしない。


#11最終ローカル結果：431全テスト/managedChromium正常prepare/実workflow actionlint成功、PMローカル構築受入。実GitHub CI/CD、Secrets/有効化、初回branch/版は未了でReview。次の未承認Sprint実装を始めず、接続準備・要件精緻化を進める。
