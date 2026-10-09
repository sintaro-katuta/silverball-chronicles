# Sprint 1 change manifest

2026-10-07。担当：LE。Git操作はPM、docs conflictはSM、コード2 conflict統合はLE。ユーザー承認済み対象は #2/#3/#4/#10/#11。公開/Cloudflare Secrets/CD有効化は対象外。

## 基準と安全な進め方

原workspace HEAD/既知origin/mainは941f79d2e9b114c41a4c4e559dfa1c17b24e10a5だったが、`git ls-remote origin refs/heads/main` は38b06d24d71e5113db16f51929cfac04fc1d4681を返した。最新mainはPR #1の承認済みSE統合（元親941f79d＋2043918）。古いlocalをremoteへ丸コピーするとSEを失うため、元workspaceを保持し、PMが最新38b基準の隔離worktreeに102の既知source/docをallowlistコピー/3way統合した。

作業用初回版は既存prototype/package.version 0.1.0を暫定使用。release/0.1.0とsprint/S01はPM所有であり、LEは作成/stage/commit/push/PRを行わない。GitHub送信はauto-reviewが具体的許可不足で拒否したため、local統合/検証を先に完成し、レビューできるsnapshotへのユーザー許可後にPR/実CIへ進む。別APIでの送信による回避はしない。

提案は **初期baseline＋S1を明示したSprint1→release PR**。baselineは新たなS1機能と主張せず、既存公開済み/採用済み実装をclean checkoutにする前提としてPRへ含める。純S1だけをstageすると依存欠落や旧テスト不一致を起こす。PMは今回の初回snapshotを1つの統合commitとする。package/vite/main/testsの依存が混在しており、粗い分割で中間commitを壊さないため。前提実装とS1成果の境界は本文/このmanifestで明示する。

## R：既に最新mainにある、上書きせず継承するもの

PR #1のcreatePresentationSound、original-se/atmosphere/cues/signature/synth-wave modules、SE tests/dev確認ページ/音採用docsはremote38bから継承する。remoteで既にtrackedの過去参考媒体は、今回のコピー除外を理由に削除しない。

重複/競合は main.js、board-runtime.js、long-reach-timeline.js、docs/README/pachinko/DESIGN。コード2はLEがlocal loading/experience/UIとremote Sound factory/unlock handoff/pause/mute/visibility stop/disposeを両保持して解消。画面renderのsound.syncがonUpdateによるevents clearより先に実行される順序を維持。timeline exported constantsは3way自動統合、remote win-sequenceは継承。docs3はSMが両方の最新採用内容を保持する。

## B：CI成立に必要な初期baseline（今回の新要求ではない）

- 準備/画像配布：board-assets/loader、release-assets、Sharp/Wrangler package+lock、vite release mode、wrangler target config。25画像は原workspaceで全部git tracked、原本51,630,828bytes。生成WebP/キャッシュをcommitする必要はない。
- 既存画質：presentation-quality、cloud/water/予告/長尺/図柄の描画補間。採用済み記録PRESENTATION_REFACTORに対応。
- 既存ゲーム表示：reel-symbolsとdomain/pixiの1〜9保存図柄継承、既存PUSH/finale/光、盤面silhouette/cabinet外装。
- 既存フィードバック：幅20/初期.20/接触受け皿、実入賞/保留/銀玉trail/待機動作、常設バー/体験/状態案内。
- 回帰テスト：上記変更に合わせたunitと必要browser sourceを保持。旧77固定/幅16/.24のassertへ戻さない。calibrationツールは資料で参照する再現source（既存成果の検証用、CI必須importではない）。

原workspace（941f＋dirty）のmain入口のローカルimport到達114ファイルに欠落0。うち11runtimeファイルがuntrackedだった：admission-feedback / board-asset-loader / board-assets / board-silhouette / decision-push-overlay / decision-push.css / decision-push / heso-guide / presentation-quality / reach-finale-view / presentation/reel-symbols。これらを除いた「S1だけ」ではclean import/buildが成立しない。

## S：今回S1の変更

- #2：right-road probeを受け皿から分離し、人工bridge負例を追加。製品の接触物理は変更しない。
- #3：パネルと結果の消化回数/N回/通常＋RUSH/演出中を含む意味整合、390結果短縮label。既存feedback内でsnapshot一致/停止復帰/独立体験/専用bonus払出を検証。
- #4：UI/state行列・新画像/初期値/未告知getter/休止復帰の検証資料。baselineの新UI機能を#4で制作したと主張しない。
- #10：prepare/verify/publish、fixed候補/資産SHA/source/actualtarget guard、旧deployの再build迂回口廃止、失敗/改変/cleanup試験。
- #11：PR read-only CI、main merged releaseだけのdefault-off CD、安定SemVer/3Sprint summary/merge SHA/current main/既存版/再試行/current CF traffic/公開SHA/smoke/notes/Release guard。既存3browserだけ管理Chromiumをenv選択。workflowをsource fingerprintへ追加。
- PM/SM/Designer/LEのdocs/agile全提出物、特にENGINEERING_BASELINEと本manifestもS1に含める。

## 明示allowlist

下の一覧はtransfer snapshotの102ファイルを分類したもの。現在の採用sourceは最新remoteへ3way統合した隔離worktreeを使う。originalの内容を再上書きしない。manifest/後続S1資料はSprint群へ追加し、未知pathは自動追加しない。

### Baseline 前提

```text
.gitignore
docs/pachinko.md
docs/prototype/BOARD_SHAPE_2026-10-06.md
docs/prototype/CLOUDFLARE_DEPLOYMENT.md
docs/prototype/CUSTOM_DOMAIN.md
docs/prototype/DESIGN.md
docs/prototype/HESO_ADJUSTMENT_2026-10-06.md
docs/prototype/PLAYER_FEEDBACK_2026-10-07.md
docs/prototype/PRESENTATION_PATTERNS.md
docs/prototype/PRESENTATION_REFACTOR.md
docs/prototype/RECEIVING_TRAY_2026-10-07.md
docs/prototype/REEL_SYMBOLS_2026-10-06.md
docs/prototype/STARTUP_REFACTOR.md
docs/prototype/long-reach/DECISION_PUSH.md
prototype/package-lock.json
prototype/src/domain/game.js
prototype/src/domain/reels.js
prototype/src/domain/session-game.js
prototype/src/pixi/admission-feedback.js
prototype/src/pixi/board-asset-loader.js
prototype/src/pixi/board-assets.js
prototype/src/pixi/board-flow.js
prototype/src/pixi/board-runtime.js
prototype/src/pixi/board-silhouette.js
prototype/src/pixi/cabinet-decor.js
prototype/src/pixi/cabinet-light-motion.js
prototype/src/pixi/cloud-idle.js
prototype/src/pixi/decision-push-overlay.js
prototype/src/pixi/decision-push.css
prototype/src/pixi/decision-push.js
prototype/src/pixi/heso-guide.js
prototype/src/pixi/heso-pocket-geometry.js
prototype/src/pixi/hold-motion.js
prototype/src/pixi/hold-view.js
prototype/src/pixi/lcd-view.js
prototype/src/pixi/long-reach-timeline.js
prototype/src/pixi/long-reach-view.js
prototype/src/pixi/normal-spin-flow.js
prototype/src/pixi/normal-spin-view.js
prototype/src/pixi/prediction-view.js
prototype/src/pixi/presentation-quality.js
prototype/src/pixi/reach-finale-view.js
prototype/src/pixi/silver-ball.js
prototype/src/pixi/special-route-motion.js
prototype/src/pixi/water-idle.js
prototype/src/presentation/reel-symbols.js
prototype/src/ui/pixi-session.css
prototype/src/ui/session-status.js
prototype/tests/basic-reach.test.js
prototype/tests/basic-win.test.js
prototype/tests/board-asset-loader.test.js
prototype/tests/centre-reveal.test.js
prototype/tests/decision-push.browser.mjs
prototype/tests/decision-push.test.js
prototype/tests/feedback-natural.browser.mjs
prototype/tests/heso-calibration.test.js
prototype/tests/loading-art.browser.mjs
prototype/tests/loading-lifecycle.browser.mjs
prototype/tests/loading-performance.browser.mjs
prototype/tests/moon-provenance.test.js
prototype/tests/presentation-integration.test.js
prototype/tests/presentation-quality.test.js
prototype/tests/reel-symbols.browser.mjs
prototype/tests/reel-symbols.test.js
prototype/tests/release-assets.test.js
prototype/tests/revival-reels.test.js
prototype/tests/session-reentry.browser.mjs
prototype/tests/session-status.test.js
prototype/tools/feedback-calibration.mjs
prototype/tools/feedback-session.mjs
prototype/tools/release-assets.js
prototype/vite.config.js
prototype/wrangler.jsonc
```

### Sprint 1

```text
.github/workflows/pr-ci.yml
.github/workflows/release-cd.yml
docs/agile/BACKLOG.md
docs/agile/BASELINE.md
docs/agile/DESIGN_REVIEW.md
docs/agile/ENGINEERING_BASELINE.md
docs/agile/PM_REVIEW.md
docs/agile/RELEASE_CD.md
docs/agile/RELEASE_CHECKLIST.md
docs/agile/RELEASE_MECHANISM.md
docs/agile/RELEASE_NOTES_TEMPLATE.md
docs/agile/S1_PR_REVIEW.md
docs/agile/S1_RELEASE_SUMMARY.md
docs/agile/SCRUM.md
docs/agile/SPRINTS.md
docs/agile/UI_ACCEPTANCE_MATRIX.md
prototype/tests/browser-launch.js
prototype/tests/left-discrete-pins.test.js
prototype/tests/release-cd.test.js
prototype/tests/release-workflow.test.js
prototype/tests/session-controls.browser.mjs
prototype/tools/release-cd.js
prototype/tools/release-workflow.js
```

### Baseline/S1 混在（hunk/説明で分離）

```text
docs/README.md
package.json
prototype/package.json
prototype/src/app/main.js
prototype/tests/feedback.browser.mjs
prototype/tests/release.browser.mjs
```

追加S1提出物：`docs/agile/S1_CHANGE_MANIFEST.md`。PM/SM/Designerが新規提出した同S1資料はowner/ACを確認して追加する。

## 保護・今回の新規commitから除外

`prototype/reference-review/**`、`tmp/**`、`.cache/**`、`dist*/**`、`.wrangler/**`、node_modules、撮影画像/動画、生成WAV/字幕、途中失敗/改訂前ログを原workspaceに保持し、新規PRにはコピーしない。とくにdomain-setupのzone/export/DNS JSON/txtは運用情報でSecret有無を監査していないため、sourceと一緒に送らない。旧SE試作mediaもS1 sourceではない。remoteで既にtrackedのものを削除する指定ではない。

画像原本25枚と既存src/dev/native構成はbaseにtrackedで残る。assetを除外する時は、本編の画像と検証撮影を混同しない。新しい候補manifest/log/画像はCI artifactsへ出し、公開assetsへ内部資料を混入しない。

## 受入条件と次担当

1. main38bからのSEと採用済みbaseline/S1 sourceが両保持され、conflict marker/import欠落なし。2.隔離treeのnpm ci→unit（remoteSEを含む）→build/release→管理Chromiumのrelease/操作/体験を成功させ、旧原workspace431成功を統合後の成功へ転用しない。3.mute/休止復帰/cleanupのAPI状態を確認するが、音を聴いた/聴感合格とは報告しない。4.PR本文でbaseline/S1/除外/未実公開を説明。5.clean commitの実CIで成功を判定し、実GitHubCI未実施は未検証のまま保持。

LE次Ready：隔離統合のlocal検証→CI失敗時の原因分類/最小修正/再試験。SM：manifest/PR要求/証拠の照合。Designer：統合後の音checkbox/新UI画像の目視。PM：stage/commit/具体snapshot提示→GitHub送信の許可→Sprint1→release PR/実CI。Cloudflare/Secrets/CD有効化は留保。

## 隔離統合の最終結果・commit判断

PM判断で今回はmixed hunkを中間commitへ切り分けず、必要依存を閉じた **103pathの1 coherent integration commit** とする。baseline/S1/Rの区別はこのmanifestとPR本文で説明し、既存の音・公開済み機能を新S1成果とは主張しない。`/private/tmp/silverball-s01-stage.txt` が明示stage候補で、source502 fingerprint inputの全件がgit indexに存在し未登録0をPMが確認した。新規reference-review/media/tmp/cacheはstage対象外。

session-status.js/testのコード差分はS1着手前のpublic-state案内baseline。S1 #3の表示/意味の周辺前提、#4の状態/provenance確認へ対応するが、S1で状態ロジックを新規実装したという分類にはしない。

最新remote38bを継承した隔離treeでnpm ci、remote SE unit21件、全unit452件、release build/管理Chromiumの2サイズ25画像・HTTP・pause/resume・操作・3表示/結果・専用3体験/実bonus払出/通常復帰が成功。Designerの統合UIも新6表示/2結果/音checkbox/停止・休止・復帰・終了が全合格、例外0。新JSはgame-D3TKWLRC.js。音handoff/mute/pause/resume/disposeの実AudioContext/API状態も成功し、聴感は未検証。

最新candidate：ba3864d5-f9cb-45f4-834c-2c3cca133ff9、source SHA311a391ab477bcc79737b2203a4ecac7f37bb62e0202302137dbfb59a712df62、45asset/14,901,612bytes。候補は38b/dirty=trueで発行されており、commit後のclean実CI成果物と同一とは呼ばない。GitHub送信の具体許可後にPRのclean checkoutで実CI判定する。source変更がなければ今回UI/音の追加確認だけを理由に全テストを繰り返す必要はない。
