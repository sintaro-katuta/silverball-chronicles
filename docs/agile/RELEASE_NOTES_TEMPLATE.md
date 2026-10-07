# リリースノートのテンプレートと受入条件

2026-10-07、S1追加承認済みIssue #11のローカル設計。ユーザー向けの変更説明と担当者向けの検証証拠を分ける。実Actions・GitHub Release・Cloudflare公開は今回実行しない。

最新運用はSprintごとのPRを`release/<version>`へ集約し、3 Sprint受入後に同ブランチからmainへのPRを作る。main PRのmergeだけをCDの入口にし、deployと公開URLのsmokeが成功した後にtag・GitHub Release・ノートを作成する。バージョンブランチとreleaseブランチは同じものとして扱い、別の集約先を増やさない。

## 利用者向けテンプレート

以下の各括弧を今回の受入済み事実で置換する。未実装案・過去の成果・確認していない成功を追加しない。空の区分は省略し、同じ改善をSprintごとに重複列挙しない。

```markdown
# <version>

<今回の主な変化を1〜2文。利用者が何をしやすくなったか。>

## 改善

- <利用者の操作/画面/待ち時間がどう改善したか。必要なら対象場面。>（#<Issue>）

## 修正

- <起きていた具体的な問題と修正後の挙動。>（#<Issue>）

## 既知の制限

- <影響のある未解消問題、または検証範囲に限定した未確認事項。>

対象：<Sprint 1>〜<Sprint 3>。対象Issue：<リンク付き一覧>。
公開日：<deployと公開smoke成功後の日時>。
公開版：[遊ぶ](<今回確認した公開URL>)。
版の対応：<version> / <mainの対象commit短縮SHAへのリンク>。
```

「速くなった」「入賞しやすくなった」は今回の条件付き計測・採用範囲に合わせる。全台/全強度/実端末への保証にしない。抽選確率を変更していない改修を「当たりやすくなった」と説明しない。「消化回数」変更なら、発射球数・入場回数と混ざらず、通常＋RUSHの抽選消化回数（演出中を含む）が読めるようになった、と書く。

実機/音の未確認は適切な範囲で記す。例：「今回の確認はPCブラウザとスマホ幅表示です。スマホ実機/Capacitorの動作、変更した音の聴感は未確認です」。音を変更していない版で、すべての既存音が不具合という意味に読める説明をしない。無音録画・イベントログを聴感の成功にしない。

## mainへまとめるPR本文の入力例

PMが3 Sprintの受入Issueを確認し、次のJSON blockをrelease→main PR本文へ1件だけ記入する。Sprint→release PRにはこの3 Sprint summaryを必須入力しない。helperは形式を検査するが、対象Issueの受入や説明の正確さはPMレビューで確認する。

```json
{
  "silverballReleaseSummary": {
    "version": "1.2.3",
    "sprints": [1, 2, 3],
    "issues": [2, 3, 4, 10, 11],
    "improvements": [
      "遊技中の回数を消化回数として表示し、通常とRUSHの合計で演出中の回を含むことを読めるようにしました。"
    ],
    "fixes": [
      "スマホ幅の結果画面で大当りのラベルと数値が途中で折り返される問題を修正しました。"
    ],
    "knownLimitations": [
      "今回の操作確認はPCブラウザとスマホ幅表示です。スマホ実機・Capacitorと音の実聴取は未確認です。"
    ]
  }
}
```

これは記入形式の説明用。`1.2.3`は具体版の作成指示ではなく、Issue一覧は現在のS1を含む例であり、未来の3 Sprintが受入済みとは意味しない。実PRではversionをreleaseブランチのsuffix・package.versionと合わせ、全3 Sprintの受入Issue・変更内容に置換する。別のJSON例を同じPR本文へそのまま残すと複数summaryになるため、例を削除して確定した1件だけにする。

利用者向け説明はPM summaryから生成し、GitHub APIのgenerated notesを下段の変更履歴として併用する。squash mergeでPRタイトルだけになっても3 Sprintの内容が失われない。summaryが空・不一致なら公開候補の検査で停止し、GitHubの自動履歴だけを利用者説明の代替にしない。`knownLimitations`の空配列は「検証済み」の証明ではなく、未確認がある版ではその範囲を必ず記入する。

## 公開候補・失敗時の文言

deploy/smoke成功前に生成したファイルは担当者用の「公開候補ノート」。冒頭に「公開候補：まだ公開成功を確認していません」と付け、公開日を予定/未確定として扱う。候補ファイル生成やPRmergeだけを公開完了にしない。

deploy失敗なら「公開失敗」、deploy成功後smoke失敗なら「公開後確認失敗」と担当記録へ分ける。どちらも成功したGitHub Releaseを作成しない。失敗時の候補ノートを利用者向け成功ノートとして公開しない。公開URLが既存版を返しているだけなら今回の版が公開済みとしない。

## 担当者向けの参照記録

利用者向けノートの末尾に必要なら「検証記録」への1リンクを付ける。詳細は内部manifest・CD成果物・リリース記録に置き、利用者向け本文へ長いテストログやCLI出力を貼らない。

| 対応項目 | 担当者記録の必須内容 |
|---|---|
| 対象範囲 | 受入済み3 Sprint、Issueリンク、各Sprint PR、release→main PR。Sprint追加や未受入Issueを自動で含めない。 |
| バージョン | `release/<version>`のsuffix、作成するtag、GitHub Releaseの版が一致。既存tag/Release衝突は成功扱いで上書きしない。 |
| コード | mainのCD対象commit SHA、PRmerge SHA、検証した候補のsource識別。どのcommitからビルドしたかを明記。 |
| 配信 | Worker、確認した公開URL、今回のVersion ID、公開asset SHA、ローカル候補manifest/asset SHA。deploy/smokeの対象が同じ候補であること。 |
| 実行 | CD runリンク、test/build/deploy/smoke終了結果、作成したtag/Release URL。失敗時は失敗段階・未実行の後続を区別。 |
| 画面/操作 | サイズ、入力、日時、実行コマンド、対象URL、新画像/ブラウザログ。ローカル/公開を区別。 |
| 残る条件 | 実機/音/長時間など未確認範囲。次のIssueがある場合だけリンクし、未承認の修正を勝手に開始しない。 |

## 公開後の確認と既存試験の対応

| 確認 | 既存入口・必要な証拠 | 判定担当 |
|---|---|---|
| 画像/例外/休止復帰 | `prototype/tests/release.browser.mjs`を今回の公開URLへ向ける。390×844/1440×900、25画像、HTTP/ブラウザ例外、公開メインJS、pause/resumeを保存。今回のasset hashをmanifestと照合。 | Lead |
| 基本操作 | `prototype/tests/session-controls.browser.mjs`を公開URLへ向ける。パネル初期状態、休止/復帰、focus、発射、退席。 | Lead |
| 3表示・結果ラベル | `prototype/tests/feedback.browser.mjs`で全体/盤面/液晶・2サイズの新公開画像。情報パネル非重なり、消化回数/大当りと補助説明、390結果の折返しを目視。 | Lead撮影、Designer判定 |
| 専用体験→通常 | 同feedbackのbattle/bonus/rush、PUSH実操作と終了→新規通常。初期400/獲得0/draws0は導入中spawned0で測定し、発射後値と区別。 | Lead |
| 実大当り払い出し | `w.bonus.payout`と実bonus入賞数を対応。一般口も含むtotal/`w.payout`だけで成功にしない。 | Lead |
| ノートの事実確認 | 受入Issue・3 Sprint・version/commit/URL、既知制限、deploy/smoke成功の記録に照合。ローカル画像を公開の証拠へ転用しない。 | SM整理、Designer内容確認、PM受入 |

各スクリプトの公開URL指定は`REVIEW_URL`の既存対応を実装で確認して使用する。ブラウザ起動失敗はアプリ不具合と区別する。公開後の自動smokeをすべての目視・実端末・聴感の代わりにしない。自動確認範囲と担当目視範囲はCD文書で明記する。

## notes生成helperの受入基準

1. 3 Sprintの受入済み対象を入力し、Issueリンクと利用者向け改善/修正/既知制限を生成できる。Issueのタイトルを機械的に並べただけで利用者向け説明が完成したと扱わない。
2. 公開候補/成功/失敗の状態を区別する。deployと公開smoke成功前はtag/GitHub Releaseの成功ノートを作らない。
3. version、branch、tag/Release、main対象commit、公開URLが対応する。候補や別commitを今回の成功版として使わない。
4. 技術ログ・manifest・runを担当参照へ分離し、利用者向け本文は変化と制限が読める長さにする。秘密・認証情報を含めない。
5. 未検証の実機・聴感・長時間範囲を隠さず、確認済みのPC/スマホ幅を実機へ拡張しない。実Actions・Release・Cloudflare未実行の今回のローカル試験を実公開成功と書かない。

helper提出後に、正常fixtureとdeploy/smoke失敗fixtureの生成内容・後続抑止を読み取り確認し、PMへ提出する。デザイナーはworkflow/code/sourceassetsを編集しない。
