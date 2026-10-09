# Sprint 1集約PRのレビューとCI判定

## 現在フェーズ：分離worktree統合中

PMが最新 `origin/main` の `38b06d2`（既存効果音PR #1）から managed worktree `/Users/sintaro.katuta/.codex/worktrees/sprint-s01/silverball-chronicles` を作成し、local `sprint/S01` と `release/0.1.0` を準備した。原workspaceの全変更は保持し、必要source/docだけを3-way移送している。remoteの採用済みSEと、localの受け皿/図柄/ロード/演出/Agileを両方保持する。隔離版のCIは未実施で、原workspaceの候補成功を統合後SHAの成功へ流用しない。

GitHub `release/0.1.0` pushはauto_reviewが [AGENTS.md](../../AGENTS.md) の「クラウドへのアップロード・更新は新たな明示許可まで行わない」に基づき、具体送信の明示許可不足として拒否した。remote branch/PRはまだ未送信。GitHub API branch作成等で迂回しない。ローカル統合・manifest・commit/検証を完成させ、具体対象/SHAを提示して `release/0.1.0` / `sprint/S01` のpushとSprint1集約PR作成の許可を得る。mainマージ・本番公開・Secrets/CD有効化はこの送信許可へ含めない。

2026-10-07。現app版 `0.1.0` を変更可能な暫定作業版とし、`sprint/S01` → `release/0.1.0` の集約PRを準備する。版のoptional未回答は差分整理/CI準備を止めない。branch・stage・commit・push・PR作成はPM担当で、SMは本書の要求/対象/証拠照合を担当する。これはSprint 1の集約PRで、main向けリリースPRや実公開ではない。

## PR本文のひな形

以下を実際の提出物・SHA・結果で埋める。空欄や進行中は未確認とする。対象Issueの正本はGitHub、状態/ACはPMの最新判定を使う。

```markdown
## 問題と変更後の動作

<利用者の消化回数の意味/スマホ結果表示を明確にし、物理fixtureとrelease候補検証/CI-CD基盤を整えた具体的な変更。過去の改修を今回の成果へ混ぜない。>

## 対象と要求

- Sprint 1、暫定版0.1.0。head: sprint/S01、base: release/0.1.0。
- #2: 右道釘gap probeと受け皿の干渉を切り分け、製品物理を変えず対象fixtureと負例/full-board回帰を確認。
- #3: 消化回数の意味/単位/補助説明、スマホ結果の孤立改行を修正。集計/抽選を変えない。
- #4: 状態/操作/体験分離の検証行列と専用払出証拠。未実装の新UIを含めない。
- #10: prepare→固定candidate→verify/publish、全資産SHA/集合とsource、失敗停止/cleanup。
- #11: SecretsなしPR CI、release→main mergeだけのCD、defaultoff、post-smoke notes/Release、再run/復旧。

## 変更対象と既存baseline

<対象manifestへのリンク。既存baselineの必要依存とS01追加差分を別記する。>
<base/head commit SHA、差分/未追跡の扱い、含めた根拠。>

## 検証

<今回のローカルtest/build/browser/actionlint、対象SHA/環境/日時/ログ。>
<GitHub実CI run URL、tested SHA/check名/結論。pendingならpending。>
<デザイン目視、bonus専用payout/count、未確認/警告。>

## 公開と未完了

Sprint→releaseのPRなので公開しない。production Secrets/有効化は未設定。
#11はローカル構築受入と実GitHub CI/CDを分けて判定する。
3Sprint集約後のrelease→main PRがCDの入口で、次Sprint開始はユーザー確認後。
```

実PRでは正本Issueリンクと最新のAC状態を付ける。将来main向けPRの3Sprint JSON summaryをS1単独の完了summaryとして挿入しない。

## 対象manifestの記録

| 欄 | 必須の内容 | 初期状態 |
|---|---|---|
| 要求の対象 | Issue2/3/4/10/11、ユーザー開始/追加確認、PM判定 | 承認済み。#11は実接続Review |
| 集約branch開始点 | release/0.1.0の開始SHA、既存baseline依存を含めた由来 | 最新main38b06d2からlocal ref準備、remote未送信 |
| Sprint branch | sprint/S01の開始SHA/head SHA、最新release集約から開始した根拠 | 分離worktree/local branch作成済み、統合commit SHAはPM提出待ち |
| 既存baseline | 開始前のファイル/必要依存/目的、S1の新成果ではない明示 | Lead調査中 |
| S1追加差分 | 各ファイル/変更理由/対応Issue/受入条件 | Lead提出待ち |
| 必要な依存 | imports/入力素材/lock/scripts/workflow/testsの参照が閉じること | Lead調査中 |
| 除外 | tmp、不要captures/動画、秘密値、生成cache/dist、無関係な未確認変更 | PM/Lead明示待ち |
| 検証コード | ローカルcandidate commit/dirty/source SHAとPR headの違い | 既存ログをhead成功へ流用しない |
| CI証拠 | run/check/対象SHA/日時/終了/ログ、必要チェック | 実CI未開始 |

manifestはPMが具体的なファイルと差分をレビューしてから確定する。git add全部/作業ツリーreset/cleanを前提にしない。CIに必要なbaselineを除外して壊すことも避け、既存依存を今回の成果へ改称しない。

## 要件ごとの判定

| 要求/AC | 受入証拠 | 判定の注意 |
|---|---|---|
| #2 釘gapと自然経路 | 原因診断、対象fixture、人工連結負例、関連/全回帰 | fixtureの成功をfull-boardに代用せず、物理改変の有無を照合 |
| #3 文言/結果表示 | 正しい消化回数、snapshot一致、390/1440の新画像/操作 | 長尺演出中を含む。孤立文字/値折返しの目視を別判定 |
| #4 状態/体験の独立 | UI matrix、通常初期400/獲得0/draws0、bonus専用payout/count | 一般賞球を含むw.payoutだけをbonus実払出の根拠にしない |
| #10 固定候補/guard | prepare/verify終端、全path/size/SHA/集合、負例、cleanup | dirtyローカル候補をPR headやCD clean merge候補へ代用しない |
| #11 PR CI | 実GitHub runnerで対象head/merge-refを検証したcheck、ログ/artifact | Node24ローカルmacOS成功やactionlintだけを実CI成功としない |
| #11 CD/Secrets/Release | gated workflow、stubの正負例、後続の有効化/実CD記録 | 今回S1集約PR/CIは非公開。Secrets未登録はCIの停止理由ではない |

PMはIssue別にAccepted/差戻し/Review/未検証を記録する。PRのCI成功だけでスマホ実機/音/実CDまで合格にしない。

## 実CIの確認と失敗時キュー

- **PM**：PR head/base・実SHA・check/runを確認。required checksとレビューがそろうまで集約マージ判定を保留する。Secrets設定を理由に非公開CIを待機させない。
- **Lead**：失敗job/step/ログ/runner版を分類し、承認済み#11範囲の必要最小修正と該当ローカル試験を行う。次は同PRの新SHAの実CIを照合する。ゲームルール/新PBI変更が必要ならIssue提案としてユーザー確認へ戻す。
- **SM**：要求/manifest/CIログ/環境/提出SHAを結び、失敗原因・担当・次Readyを更新する。CI待ち中はmanifest/README/引継ぎの整合を先行する。
- **Designer**：既存#3/#4の受入事実・現在の画面/ノート本文・既知制限を照合する。ゲーム表示に影響しないCI失敗なら新UI実装を始めない。

| 障害 | 主担当の現在作業 | 非依存の次Ready |
|---|---|---|
| workflow/schema/実CI起動なし | Leadがactionlint/イベント条件/ログを診断、PMがGitHub設定と送信許可を確認 | SMがhead/base/対象Issue/manifestの照合、DesignerがPR本文の事実確認 |
| 依存/素材/import欠落 | Leadが必要baseline閉包とlockを特定、PMが包含差分を決定 | SMが既存/新規の分類と除外を記録 |
| Node/Chromium/browser起動 | LeadがLinux runner版・install・browser envを診断 | Designer/SMが既存画像/AC/制限の証拠を整理 |
| app assertion/表示回帰 | Leadが現在SHAで再現し承認範囲を修正、Designerが影響画面を判定 | SMが再現条件/修正対象/次検証を整理 |
| GitHub送信auto rejection | PMが具体branch/commit/除外対象をレビュー可能にし、push/PR作成許可を得る | Leadは隔離版統合/ローカル検証、SM/Designerはmanifest/AC照合を継続 |
| Secrets未登録/CD off | 必須値/有効化に依存するCDだけ留保 | PR CI、集約レビュー、notes/rollback準備を継続 |
| optional初回版未回答 | 暫定0.1.0を記録して非公開準備を続ける | 要件/差分/CI準備を止めず、版変更時の整合点を列挙 |

「待ち」だけで担当へ次割当なしにしない。必要値・承認・環境に依存しないタスクを具体的に割り当てる。新しいSprint実装/未承認PBIは勝手に開始しない。

## 現在作業と次Ready

| 担当 | 現在作業 | 次Ready（承認済み範囲） |
|---|---|---|
| PM | branch/既存baseline/対象差分を決め、S1 PRと実CIを進める | 実CI/checkとPM受入を照合、集約マージ判断 |
| Lead | 隔離worktreeのmain/board-runtime衝突とSE同期を統合、S1_CHANGE_MANIFEST作成 | 統合後のローカル全回帰/Node24 prepare→送信許可後の実CI診断 |
| SM | 隔離worktreeのREADME/仕様/採用方針3衝突を解消、現在phase/送信留保を記録 | S1_CHANGE_MANIFEST/統合後結果/PR本文のAC照合、実CIは送信許可後 |
| Designer | 最新SE先行成果と#3/#4差分の境界をsummaryへ記録、専用UI確認を準備 | 統合Ready後2サイズ×3表示/SE操作checkbox/停止復帰を新証拠で判定（聴感は別） |

完了提出は「対応Issue/AC、対象ファイル/SHA、今回の証拠、未確認、次担当/次Ready」で行う。SMは提出後に次割当を確認し、担当のタスクが無いまま終了しない。

## 隔離統合版の今回のローカル最終結果

隔離worktreeでremote main38bのSEと前提/S1差分を統合した今回の検証：SE専用21成功/0失敗、全452成功/0失敗（150.34秒）、release build成功、managed Chromium153で390/1440の25画像/HTTP/例外なし、controls、feedback3体験と実プロジェクトprepare正常終端を確認。PMがrelease:verifyを実行してsource/assets/target config一致・終了0を確認し、SMも固定45資産の全size/SHA/集合を直接再計算してmanifest一致を確認した。既存game chunk530.93kB警告は残し、実機性能を合格にしない。

今回候補は `ba3864d5-f9cb-45f4-834c-2c3cca133ff9`、45資産/14,901,612 bytes、sourceSHA `311a391ab477bcc79737b2203a4ecac7f37bb62e0202302137dbfb59a712df62`。Node24.21.0/npm11.19.0/managed Chromium153.0.8010.12、macOS darwin。記録のgitは38b06d2/dirty=true（commit前）で、clean commit候補/実GitHub Linux CI成功と呼ばない。原workspace431や先行SE過去テストを今回統合結果へ代用しない。

今回ログは `/private/tmp/silverball-s01-sound-tests.log` と `/private/tmp/silverball-s01-integrated-prepare.log`（ローカル保存証拠、PRへ同梱しない）。private reference-reviewの証拠リンクは同梱しないpath表記へ正規化した。

Designerの統合補足は今回のgame-D3TKWLRC.js/ローカル4190で完了。390/1440の6表示＋2結果8recordsをSMも直接読み、8件すべてpass、6表示のscriptが同じgame-D3TKWLRC.js、ui.log両幅成功を確認した。Designerが新6パネル/2結果を目視合格、各表示の効果音checkbox off/on、発射停止/開始、休止/復帰/終了、例外0を確認。聴感/音全経路/統合後24全状態の合格へ拡張しない。

残る確認はPMの統合commit snapshot SHAと、GitHub送信許可後の実PR/CI。音の実聴取/スマホ実機/Capacitor、Secrets/CD有効化/実公開は未検証・未実施。次担当はSMが新UIのAC照合済みPR本文を提出し、PMがsnapshot/送信許可、Leadが送信許可後の実CI診断を担当する。DesignerはS2 #7の要求提案だけを別保存し、今回snapshotへ含めず、次Sprint実装は開始しない。
