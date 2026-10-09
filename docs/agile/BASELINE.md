# アジャイル開始時の現在地

## 現在フェーズ：分離worktree統合中

PMが最新 `origin/main` の `38b06d2`（既存効果音PR #1）から managed worktree `/Users/sintaro.katuta/.codex/worktrees/sprint-s01/silverball-chronicles` を作成し、local `sprint/S01` と `release/0.1.0` を準備した。原workspaceの全変更は保持し、必要source/docだけを3-way移送している。remoteの採用済みSEと、localの受け皿/図柄/ロード/演出/Agileを両方保持する。隔離版のCIは未実施で、原workspaceの候補成功を統合後SHAの成功へ流用しない。

GitHub `release/0.1.0` pushはauto_reviewが [AGENTS.md](../../AGENTS.md) の「クラウドへのアップロード・更新は新たな明示許可まで行わない」に基づき、具体送信の明示許可不足として拒否した。remote branch/PRはまだ未送信。GitHub API branch作成等で迂回しない。ローカル統合・manifest・commit/検証を完成させ、具体対象/SHAを提示して `release/0.1.0` / `sprint/S01` のpushとSprint1集約PR作成の許可を得る。mainマージ・本番公開・Secrets/CD有効化はこの送信許可へ含めない。

取得日：2026-10-07。スクラムマスターがローカルの資料・Git・実行環境を読み、初回運用の出発点を記録した。既存改修は今回のチーム成果として計上しない。運用は [SCRUM](SCRUM.md) に従う。

## 現在の開始状態

最新追記：ユーザーが#11のCI/CD構築をS01へ追加承認。branch/PR/公開運用は [RELEASE_CD](RELEASE_CD.md) の最新方針に従い、各Sprint集約PR3本と3Sprint後main向けPR1本を区別する。その後PMはoptional版回答待ちで全体を停止していた扱いを訂正し、現在のapp版0.1.0を暫定作業版として `release/0.1.0` / `sprint/S01` 準備とSprint1 PR/実CIへ進める。変更可能な暫定値で、実公開ではない。差分整理/CI準備は回答に依存せず続行し、必須Secrets/有効化などの依存操作だけ留保する。Git操作はPMが所有し、SMはbranch/stage/commit/push/PRを実行しない。下の開始時点・#10までの記録は履歴であり、#11後のソース/候補の成功を保証しない。

初期記録ではS01はProposed/確認待ちだったが、その後ユーザーが#2/#3/#4開始と#10の追加開始を承認。現在はActive、2026-10-07〜10-13の暫定1週間。PBI正本は [GitHub Issues](https://github.com/sintaro-katuta/silverball-chronicles/issues)、ローカルBACKLOGはIssue番号/リンクの鏡。S02/S03の対象・日程とS01の追加PBIはユーザー確認後に設定する。未承認の新規実装・差戻し修正・次スプリント開始は行わず、確認待ちではIssue整理/提案/証拠まとめに限定する。

開始承認前のPM報告（履歴）：DUX-01はユーザー確認前に着手した差分があり未受入。390pxの結果表示はデザイナー差戻し、全テストのright road失敗は単独再現でも失敗した。当時は修正を確認待ちとしていた。現在#2/#3/#4/#10は承認済み範囲として修正・検証を進める。最新の現行検証と証拠はPM受入記録を参照し、過去の380件通過で上書きしない。

## 方針と現行構成

- 月影機関に開発対象を限定。現行本編は `prototype/index.html` とPixiJS、遊技は `domain/session-game.js`、描画接続は `pixi/board-runtime.js`。PlayCanvasは部品確認/旧実装、Three.jsはオフライン素材生成に残る。[アーキテクチャ](../prototype/ARCHITECTURE.md)
- 最新仕様は10月7日の受け皿、右打ち案内、PC拡大、常設操作、自然入賞/体験の分離まで。[仕様書](../pachinko.md)、[採用方針](../prototype/DESIGN.md)
- 入賞済み当落、保留FIFO、出玉、物理、演出尺を無断で変えない。通常/RUSHの1〜9図柄と保存した図柄の引継ぎを維持する。
- PlayCanvas Editor全体統合は過去からの未完了項目だが、現行本編の移行対象とは別。クラウド更新は新たな明示許可まで禁止。[移行記録](../prototype/PLAYCANVAS_MIGRATION.md)、[AGENTS.md](../../AGENTS.md)

## Gitの開始点

ブランチ `main`、HEAD `941f79d`（Tsukikage構成整理）、remote `origin` はGitHubの `sintaro-katuta/silverball-chronicles`。remoteの到達性、認証、PR作成は今回未検証。

取得時の `git status --porcelain=v1 -uall` は tracked変更42件・未追跡141件、計183件。並行作業開始後は変わるため、PR作成直前に再棚卸しする。

| 既存変更のまとまり | 主な対象 |
|---|---|
| 最新仕様/設計・公開記録 | `docs/pachinko.md`、`docs/prototype/DESIGN.md`、受け皿/フィードバック/図柄/起動/演出改修文書、`docs/README.md` |
| 遊技・表示・操作 | `prototype/src/app/`、`domain/`、`pixi/`、`ui/`。受け皿、光、待機、図柄、PUSH、ロードなど |
| 依存/ビルド/公開準備 | root/prototypeのpackage、lock、Vite設定、release資産ツール、Wrangler設定 |
| 試験・校正・証拠 | `prototype/tests/`、`tools/feedback-*`、多数の `prototype/reference-review/` |
| その他未追跡 | `tmp/`。今回の自動追加・削除・PR包含対象とはしない |

既存tracked差分は42ファイル、3,330追加/903削除。未追跡はこのdiff statに含まれない。リセット、クリーン、まとめてステージング、コミットは行っていない。

## 既存品質の記録と限界

以下は資料に書かれた過去の実施結果で、今回の再実行結果ではない。

| 根拠資料 | 記録されている結果 | 残る条件 |
|---|---|---|
| [遊技フィードバック](../prototype/PLAYER_FEEDBACK_2026-10-07.md) | 単体380件、releaseビルド、スマホ幅/PCブラウザ、体験→本遊技の分離 | 音の実聴取、スマホ実機/Capacitor、長期入賞率は未検証 |
| [受け皿の最新修正](../prototype/RECEIVING_TRAY_2026-10-07.md) | 関連13件、公開資産2件、releaseビルド、390×844/1440×900、同条件3位相で69→77入賞、排出後残球0 | 最大無入賞間隔59/61/57秒、全台・全強度・長時間の保証なし |
| [演出改修](../prototype/PRESENTATION_REFACTOR.md) | 高DPI/補間/連続動作、PUSH/停止復帰/当落/会計 | RUSH突入Canvasに低解像度工程、連続人物作画、スマホGPU/熱は残る |
| [起動改修](../prototype/STARTUP_REFACTOR.md) | 25画像の圧縮/キャッシュ/再入場/失敗再試行 | 再計測なしで現在の性能値として使用しない |
| [公開運用](../prototype/CLOUDFLARE_DEPLOYMENT.md) | Cloudflare公開版が存在し、10月7日まで個別許可による更新の記録 | 現行本編の途中保存・報酬保存未接続。今回の公開許可は別 |

既存の500kB超チャンク警告が複数資料に残る。音のない動画やCSS幅だけの試験で、音やスマホ実機の品質を合格としない。9月のPlayCanvas旧台向けバックログは現行PixiJSの障害と断定せず再確認する。

最新公開Version IDは両資料で `5e39c37c-135e-4b4b-b1e1-9ff0fefd339c` と一致する。ここでは文書の整合だけを確認しており、現在のクラウド状態を問い合わせたものではない。

## 依存と検証コマンド

今回確認した手元環境：Node `v25.8.1`、npm `11.11.0`、`prototype/node_modules` あり。依存の再インストールは未実施。package記載はPixiJS `^8.21.0`、PlayCanvas `2.22.4`、Vite `8.3.0`、Playwright `1.63.0`、Sharp `^0.35.5`、Wrangler `^4.147.0`、Capacitor `8.5.2`（Preferences `8.0.1`）。これはpackageの指定で、今回すべての実解決版を確認したものではない。

| 目的 | コマンド・前提 |
|---|---|
| 単体/統合 | rootで `npm test`（`node --test tests/*.test.js` へ委譲） |
| 本編ビルド | `npm run build` |
| 本編操作 | 起動済みローカル5173に `npm run test:browser`、任意URLは `REVIEW_URL` |
| 開発確認ページ | `npm run build:previews` / `npm run test:previews` |
| ローカル公開候補 | `npm run build:release`、`npm --prefix prototype run preview:release -- --port 4178`、別ターミナルで `npm --prefix prototype run test:release` |
| 自然入賞の決定論的校正 | `node prototype/tools/feedback-calibration.mjs verify` / `node prototype/tools/feedback-session.mjs` |
| 差分形式 | `git diff --check` |

ブラウザ試験はChromeとローカルサーバーが必要。公開操作の `npm run deploy` はこの棚卸しでは実行しない。通常buildはpublic全体を含むため公開候補はreleaseビルドを使う。

今回のスクラムマスター自身は資料/Git/環境の読み取りと文書作成のみ実施し、コード試験・ビルド・ブラウザ・公開アクセスは未実施。第1スプリントのリードの現行検証は、提出後にPM受入記録へ結果と証拠を追記する。

## 次のReady候補

以下はIssue化とスプリント対象案のための候補であり、開始許可ではない。PMが容量・担当・競合を確認し、ユーザー確認後に採択する。未知の仕様を実装する前に、ローカルで完了可能な調査/定義へ絞る。

| 候補 | 根拠・要求 | 受入条件・出口 | 主担当 / 予備担当 |
|---|---|---|---|
| 無入賞時間の分布と待機UXの切り分け | 最新受け皿でも最長61秒の無入賞区間 | 同じseed/位相/発射条件で入賞間隔を記録。数値と現在の状態案内を照合し、物理変更をせず改善候補・維持条件をPMへ提出 | リード / デザイナー |
| 狭幅/横向きの現行操作QA | 最新受け皿の主検証は390×844と1440×900 | 320×568と844×390で3表示/パネル開閉/発射/ポーズ/復帰を現在のコードで確認。欠け・重なり・画面外を証拠付きで分類し、修正要件を定義 | デザイナー / リード |
| 次の3スプリント用リリース引き継ぎひな形 | 公開資料に初回と最新の資産方式/数値が同居し、3スプリント単位の記録がまだない | 受入済み要件、対象ファイル、今回のbuild/試験、資産hash、公開承認、公開前版、戻し方を埋めるひな形を作る。履歴と現在を分け、通信なしでローカルリリース候補を引き継げる | スクラムマスター / リード |
| 保存対象の要件整理 | 現行本編の途中/報酬保存未接続という明記 | 既存旧Game継承と現行セッションの境界を調査。保存したい状態、体験除外、再入場/復帰の期待、二重報酬防止、採否が必要な論点を整理。保存機能は未実装のまま提出 | リード / PM |

スマホ実機、聴取環境がないタスクはReady実装へ混ぜず、環境待ちと記録する。候補はGitHub Issueへ整理し、実装/調査の開始対象をユーザーに確認する。承認範囲が尽きたら、次のReady/予備の提案を補充し、勝手に着手しない。リリース引き継ぎひな形はRELEASE_CHECKLIST.mdとして作成済みで、次の作業案は承認後の受入manifest記入。

## S01振り返りの提案

PM報告で#2/#3/#4は受入済み、#10の正常prepareをログ/manifest/固定assetsと照合済みで、最終PM受入待ち。全4PBIの受入後も、10月7日〜13日のS01はReview/振り返り準備へ移り、3スプリントを数合わせで即完了しない。次の未承認実装は始めず、#5/#6/#7の次スプリント要求整理・既存証拠まとめを予備として進める。

| 今回の観察 | 次回へ向けた改善提案 |
|---|---|
| 右道釘のgap単体probeが最新受け皿と干渉 | 単体fixtureの対象部材/前提を要件と明記し、人工連結の負例とfull-board回帰を別の証拠として提出する |
| 一般賞球込みのw.payoutで大当り払出を説明した | 受入条件へcounterの責務を明記し、bonus専用payout/countを記録する。値が増えたことだけを因果の根拠にしない |
| 可変dist-releaseのmanifestだけでは候補固定が不十分だった | 検証済みbytesをcandidate固有assetsへ固定し、公開入口がその候補だけを使うことを負例/実正常経路で照合する |

改善提案はPMがふりかえりで採否と担当を決め、仕様や次スプリント対象を無断で追加しない。
