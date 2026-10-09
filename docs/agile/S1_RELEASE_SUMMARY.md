# S1の変更説明とR01への引継ぎ

2026-10-07。Sprint 1→release集約PRと、将来の3 SprintをまとめるR01ノートへ使う説明。現行package.versionの`0.1.0`を作業用に仮置きする。具体版・tag・GitHub Releaseを作成した記録ではない。

まだ1 Sprintの成果であり、本番リリースノートではない。S2/S3の受入・集約後に、3 Sprintの実対象と版を確認してmain向けPRのsummaryを完成させる。3 SprintのJSON検査を通すために未来のSprintを受入済みとして記入しない。

## 最新remoteの先行成果と統合確認

統合先は音PR #1を既に取り込んだmain `38b06d24d71e5113db16f51929cfac04fc1d4681`。この音作業はS1に先行して受け入れられた別成果であり、S1で新しく制作した音とは記載しない。初期共有checkoutの音なし状態へ戻してよいという意味ではない。

[ORIGINAL_SE](../prototype/ORIGINAL_SE.md)と[SYNTH_ONLY_SOUND](../prototype/SYNTH_ONLY_SOUND.md)の最新採用を確認した。前回基準の周期波シンセ音（当たり-3半音、通常SE-2半音、高次倍音係数0.90）を維持し、その後の追加1半音引下げ・硬い金属への過去案を復活させない。効果音checkbox、開始操作からの解除、消音・休止・復帰・破棄の寿命管理をS1との統合で保持する。

音の過去21テスト/8経路/録音資料は先行成果の証拠であり、今回の統合結果ではない。Leadの統合後previewで今回の新画像・操作を確認し、音制御UIの非破壊とS1の消化回数/常設操作を照合する。音の実聴取、実機は今回も実施しなければ未検証。統合検証は`prototype/reference-review/s1-integration/`へ保存する。統合が進行中のため、ここでは新画面が成功したと記録しない。

## 利用者向けの短い変更説明

遊技中の回数を「消化回数」として表示し、通常とRUSHの抽選消化回数の合計で、演出中の回も含むことを読めるようにしました。スマホ幅の結果画面では、消化回数と大当りのラベル・数値が途中で不自然に折り返される問題を修正しました。（[#3](https://github.com/sintaro-katuta/silverball-chronicles/issues/3)）

今回の確認はPCブラウザとスマホ幅表示です。スマホ実機・Capacitor、音の実聴取、全台・全強度の長時間動作は未確認です。今回の回数表示修正で抽選確率・保留・賞球・物理・演出尺を変更していません。

この文章はS1のローカル受入済み差分の説明。公開日や公開完了を付記しない。R01では重複する改善をまとめ、同版の公開smoke成功後にだけ公開日/URLを付ける。

## 既存公開baselineと今回の成果の境界

| 範囲 | 内容 | S1ノートでの扱い |
|---|---|---|
| S1開始前のbaseline | 常設の発射/休止/強度、右打ち案内、受け皿、PC拡大、全図柄、起動時間/素材圧縮、専用演出体験。 | [開始時点](BASELINE.md)と[最新の既存修正](../prototype/RECEIVING_TRAY_2026-10-07.md)へリンク。今回新しく実装したUI成果として列挙しない。 |
| #3のUI差分 | 消化回数の意味と単位、演出中も含む説明、390結果の孤立改行の解消。 | 今回の利用者向け改善/修正として記載。 |
| #2/#4の検証 | #2は製品物理を変えずprobe fixtureを修正し負例を追加。#4は24条件の操作/案内・体験分離を確認。 | 品質確認としてPR検証欄へ。新機能や入賞率向上として書かない。 |
| #10/#11の運用 | 固定候補/一致検査と、PR CI・main merge後CD/notesのローカル構築。 | 担当者向け引継ぎ。実GitHub runner/CD/Release成功や利用者の遊技UI改善と書かない。 |

## S1 PRの検証・証拠参照

- [#3のAC別レビュー](DESIGN_REVIEW.md)：新8画像を目視し、390結果の折返し・2サイズ/3表示のパネル・回数/説明を確認。リードの既存ブラウザでsnapshot一致、各体験→通常draws0を確認。
- [#4の実行行列](UI_ACCEPTANCE_MATRIX.md)：24条件と体験復帰、正確な初期400球/獲得0/draws0は導入中実発射0で測定。大当りの実獲得はbonus専用count/payoutで区別。
- 現行#11環境の保存候補：`prototype/reference-review/agile-2026-10-07/s1-cd-managed-manifest.json`、candidate `b1965bd5-7eaa-48f7-85f5-6fc0b540b38f`、Issue2/3/4/10/11、45配信資産。managed Node24/Chromiumの431成功は[PM照合](PM_REVIEW.md)のローカル確認であり、実GitHub CIの結果ではない。
- #3/#4の最初の画面証拠は`prototype/reference-review/agile-2026-10-07/s1-dux03/`と`dux-02/`。後続の現行ビルド証拠は`s1-cd-managed-feedback/`とmanaged checks/prepare logで区別する。過去の画面を現在のCI/公開成功へ流用しない。

最終PR差分とLeadのS1manifestに、対象Issue・新UI差分・検証日時・現行ソース/commitの対応を照合してからPR本文へコピーする。上記保存候補は現在の証拠であり、後からソース・版・buildが変わればそのまま現在候補と呼ばない。

## notes helperの最終ローカルレビュー

[テンプレート](RELEASE_NOTES_TEMPLATE.md)と`prototype/tools/release-cd.js`、`prototype/tests/release-cd.test.js`、`s1-cd-unit.log`の50成功を読み取り確認した。正常/候補/失敗の生成内容は`prototype/reference-review/agile-2026-10-07/cd-notes-fixtures/{candidate.md,success.md,negative.json}`。各成果物は合成fixture・未実公開と明記している。

| 条件 | 判定 |
|---|---|
| 3 Sprint/Issue/改善修正制限 | 合格。PRのPM summaryとAPIgenerated履歴を併用し、squash後にも利用者説明を残す。PM受入を形式検査で代替しない。 |
| 公開候補→成功の識別 | 合格。recordなしは候補、成功notesはsmoke-verified・同版/同SHA・Worker/Versionの一致を要求。deployed-onlyや異SHAは拒否。 |
| deploy/smoke後のみRelease | 合格。deploy/公開照合/smoke失敗でcreateRelease未呼出し、添付失敗はdraft維持、retryで添付後publishをfixture確認。 |
| 利用者説明と技術記録 | 合格。改善/修正/制限を本文へ、詳細recordはhidden marker/添付へ分離。版・merge SHA・公開URLが対応。 |
| 未検証の正直な表示 | 合格。fixtureは合成と明記、実機/聴感未検証をknownLimitationsへ記入。実Actions/GitHub Release/Cloudflare未実行のローカル構築受入として提出。 |

## 次Ready：PR記述と実CIの比較

Leadのmanifest提出後、Designerは対象Issue・UIファイル/差分・新画像・未確認範囲が本説明と一致するか読み取る。実PR/CI提出後は、新CIの390/1440結果/パネル画像と現行ソースSHA・例外・体験初期値を既存ACに比較する。SMが証拠をPR/Issueへ対応付け、PMが受け入れる。新UI、次Sprint、公開操作にはこの準備だけで着手しない。

## 隔離統合版の新UI検証

2026-10-07、Leadが統合buildを固定した後、`http://127.0.0.1:4190`、`game-D3TKWLRC.js`を今回動かした。補助previewの起動cwd誤りは修正後の正しいURLで検証し、アプリ欠陥へ数えない。原workspaceの旧431テスト/旧S1画像は今回の判定に代用しない。

Chrome headless、マウス入力、390×844/1440×900の全体/盤面/液晶で、パネル先頭の消化回数/通常＋RUSH/演出中の説明、常設バーの発射停止/開始・休止、canvas寸法/バー非重なりを新画像と実操作で確認。各表示で効果音checkboxをスクロールして操作でき、off/onの値を確認した。休止で時計停止→復帰、遊技終了→結果も通過し、両サイズのブラウザ例外0。

新6パネルと2結果を目視し、消化回数の説明と390結果の折返し修正が保持されることを確認。両サイズの効果音off新画像も目視し、S1情報と先行音制御が共存する。390では任意情報パネルをスクロールして効果音に届き、その間も常設の発射・休止操作は画面内にある。パネル先頭の画像と音操作位置の画像は別条件として保存。

判定：今回の統合版の表示・音制御UI・発射/休止/復帰/終了操作は合格としてPMへ提出。音の実聴取・音型/全経路の聴感、実機、統合後の全状態24条件をこの短いUI確認だけで合格に拡張しない。体験/払出の統合後確認はLeadの新prepare/browser証拠を別途参照する。

専用証拠：`prototype/reference-review/s1-integration/ui.json`（6表示＋2結果、URL/新JS/状態）、`ui.log`、正確な`ui.mjs`、`provenance.json`。画像は`{390,1440}-{whole,board,lcd}-panel.png`、同`-sound-off.png`/`-paused.png`、`{390,1440}-result.png`。ローカル/private証拠であり、PR本文では未配布の画像を公開リンクと呼ばない。
