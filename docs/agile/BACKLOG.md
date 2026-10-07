# PM要求・要件とバックログ

整理日：2026-10-07。S1は2026-10-07開始確認済み（#2/#3/#4/#10）。ユーザー要求：PMが方針と現在地を認識し、要求整理・要件定義・担当への指示・成果物の判定を行う。開発はリードエンジニア、スクラムマスターはサブマネージャー、デザイン/UIUXはデザイナー。手待ちを防ぎ、3スプリントごとにPRとリリースをまとめる。

## PBIの正本と開始ゲート

PBIは[GitHub Issues](https://github.com/sintaro-katuta/silverball-chronicles/issues)で管理する。本書は方針とIssueリンクの鏡。各スプリントの対象Issue・ACを提示し、ユーザー確認後に開始。Readyは準備状態で着手許可ではない。対象追加・次スプリントも確認待ち。未承認中の定期実行は整理・提案・既存証拠の確認のみ。

## 方針と境界

正本は [仕様の最新追記](../pachinko.md) と [採用デザイン](../prototype/DESIGN.md)。対象は月影機関のPixiJS本編。旧PlayCanvas移行や過去の未接続記述を現在の実装より優先しない。最新のユーザー指示・資料から実装済みと未確認を区別する。

盤面と液晶を主役にし、自然入賞・保存当落・FIFO・賞球を維持する。美術改修で確率・ゲームルールを変えない。今ある大量の未コミット変更は持ち主不明のまま一括コミットしない。最新記録では受け皿・右打ち案内・PC表示まで公開済みだが、今回の実行結果ではなく履歴である。

## 運用の受け入れ基準

- R01：全着手項目に要求根拠、担当、変更境界、確認方法、受け入れ基準がある。
- R02：担当の主タスクは各1件。完了後には確認済みスプリント内の次のReady項目を渡し、Ready候補は最低2件を維持する。未承認項目は実装を始めない。ブロック理由と代替を記録する。
- R03：成果物はPMが要件別に合格・差戻し・未検証で判定する。テスト成功と美術/音/実端末の確認を同一視しない。
- R04：1週間を暫定スプリント長とし、3スプリントごとに受け入れ済み変更をPRへまとめる。期間内の担当タスクの完了だけでスプリントを閉じない。
- R05：平日10時（Asia/Tokyo）にこのスレッドで進行確認。スプリント未確認中は整理・提案のみ、確認後はその対象内でローカル続行。具体的な公開対象・検証・復旧手順を揃え、公開更新は新たな明示許可後にまとめて行う。

## 優先キュー

状態は Ready → In progress → Review → Accepted。Blockedは理由と解除条件を付け、担当は確認済みスプリント内の別のReadyへ移る。候補は要件が具体化するまで着手しない。

| ID | 要求・根拠 | 担当 | 受け入れ基準 / 提出物 | 状態・予定 |
|---|---|---|---|---|
| OPS-01 | ユーザー指定の役割・アジャイル運用を定着 | SM / PM | 役割、DoR/DoD、WIP、引継ぎ、3スプリント公開手順を文書化。現在地と既存変更の記録を保持 | 運用準備受領・スプリント対象外 |
| [QA-01 #2](https://github.com/sintaro-katuta/silverball-chronicles/issues/2) | 現在の品質を履歴に頼らず確認 | Lead | 現行品質の記録は提出済み。右道釘probe失敗の原因を示し、必要な最小修正と関連/全回帰の成功を提出 | Accepted・PR待ち / S1 |
| [DUX-01 #3](https://github.com/sintaro-katuta/silverball-chronicles/issues/3) | 任意情報パネルの「プレイ回数」の意味が曖昧 | Lead / Designer | 本編のパネルと結果で消化回数の意味と回数単位を表示。パネルは「消化回数（通常＋RUSH）」、結果は短いラベルと説明の併用を許容。長尺演出中も含むことを説明。値の集計や抽選を変えない。390×844/1440×900で読めて溢れず、値がsnapshotと一致。詳細は[デザインAC](DESIGN_REVIEW.md) | Accepted・PR待ち / S1 |
| [DUX-02 #4](https://github.com/sintaro-katuta/silverball-chronicles/issues/4) | 通常・休止・右打ち・体験での操作案内を再評価 | Designer / Lead | [検証行列](UI_ACCEPTANCE_MATRIX.md)に画面/状態/期待文言/入力/確認証拠を記入。通常の未告知当落を読まない。体験→本遊技の玉/獲得/表示の独立を確認。欠陥を再現できる場合だけ追加修正を起票 | Accepted・PR待ち / S1 |
| [QA-02 #5](https://github.com/sintaro-katuta/silverball-chronicles/issues/5) | 最新受け皿でも長い無入賞区間が残る | Lead / SM | 既存feedback-calibration/session手順を使い、実装済み5台の固定seed・同一初期強度・口幅・発射/排出時間で発射/入賞/最大無入賞/残球/収支を比較。現仕様の変更なし。改善提案と観測を分離し、実遊技保証をしない | Ready / S2 |
| [REL-01 #8](https://github.com/sintaro-katuta/silverball-chronicles/issues/8) | 3スプリント分をレビュー可能な単位で届ける | SM / Lead / PM | リリースチェックリスト、受入対象の一覧、現行差分と既存変更の区別、PR比較元、検証記録、公開後確認/rollbackを揃える | Ready / S1準備・S3実行 |
| [PERF-01 #6](https://github.com/sintaro-katuta/silverball-chronicles/issues/6) | 高DPIのスマホ負荷未確認 | Lead / Designer | エミュレーション計測と実端末評価を分け、素材/DPR/場面/フレーム時間を記録。基準と再現端末を定義後に最適化を起票 | Refinement / S2 |
| [ART-01 #9](https://github.com/sintaro-katuta/silverball-chronicles/issues/9) | 戦闘中盤の構図は直近修正の対象外 | Designer | 最新本編の全尺を見て、人物・攻撃・字幕の主役を場面単位に評価。既存採用を尊重し最小案とタイムラインを提出 | Refinement / S2 |
| [SOUND-01 #7](https://github.com/sintaro-katuta/silverball-chronicles/issues/7) | 実聴取・実端末での音の評価が未確認 | Designer / PM | 聴取可能な環境で通常/期待/当落/復帰を確認し、音量とタイミングの再現記録を提出。無音録画/音イベントログだけで合格にしない | Refinement / S2〜S3 |

追加提案：[REL-02 #10](https://github.com/sintaro-katuta/silverball-chronicles/issues/10)。リリース準備の1コマンド化、資産manifestと公開前一致検査、公開後確認/復旧手順をS1へ追加する案。2026-10-07追加承認済み、Accepted・PR待ち / S1。

## 要件の訂正記録

2026-10-07：DUX-01の初期案「回数/保留の混在」はlegacyコードの読み違いだったため撤回。本編はgame.draws単独。待ち保留の新表示は対象外。回数は図柄初期停止で増え、長尺演出の最終当落より前の回も含むので「結果が出た回数」とは説明しない。

## 追跡

[スプリント計画・担当キュー](SPRINTS.md) / [PM受け入れ記録](PM_REVIEW.md) / [スクラム運用](SCRUM.md)。状態更新はPMが行い、担当は証拠を提出する。


## CD追加案

[REL-03 #11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11)：PR CI、mainマージを起点にしたGitHub Actions自動公開、公開後確認。#10を再利用するが、現在の手動publish入口だけをCD完成と扱わない。S1追加提案・確認待ち。開始確認後にworkflowを作成・検証し、具体的なworkflow/公開先/マージ時公開を確認後に有効化する。


#11更新：2026-10-07 S1追加承認済み・In progress。Sprint→release集約のPRと、3Sprint後release→mainのリリースPRを分離。mainへのrelease PRマージがCD/成功Release・ノートの起点。既存4件受入の上に#11を実装する。


#11ローカル構築受入（431test/Node24+managedChromium/actionlint）。PBI状態はReview、初回版/実branch/Secrets/実GitHub CI/CDの確認待ち。現在のdefaultoffを稼働済みCDと扱わない。
