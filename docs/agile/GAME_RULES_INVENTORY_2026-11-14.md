# 遊技ルール・保存の採用状態（#57）

調査日：2026-11-14。目的は現状への索引であり、ルール変更ではない。仕様は [pachinko.md](../pachinko.md) の最新追記と、対象ごとの優先関係を読む。特に開始玉・精算は10月19日追記、Wの抽選・賞球は10月2日の移行方針が旧記述に優先する。下表の「採用」は対象版の実装・公開記録に限り、実機の完全再現や今回の通し試遊合格を意味しない。

2026-11-14：ユーザーが本一覧を #57 のローカル成果として承認。[レビュー資料](ISSUE_57_HUMAN_REVIEW.md)。GitHub Issueの状態変更、マージ、公開を意味しない。

## 版の区別

| 対象 | 確認した版と根拠 |
|---|---|
| GitHub main | [9793e2f](https://github.com/sintaro-katuta/silverball-chronicles/commit/9793e2f173b23e67afd7c3e74d09426fda7cc943)。GitHubのbranch APIで確認。手元のorigin/mainは古く7e096f1のため同一視しない。 |
| release/0.3.0 | [6ce4124](https://github.com/sintaro-katuta/silverball-chronicles/commit/6ce4124e57263a5974bbb9bf123d49313aa8fad4)。当時の公開タグは[0.3.0 / 7e096f1](https://github.com/sintaro-katuta/silverball-chronicles/releases/tag/0.3.0)。 |
| PR #39 | [head 09fc6e0、merge 56401a1](https://github.com/sintaro-katuta/silverball-chronicles/pull/39)。音の候補であり、開始玉チャレンジ導入前。 |
| 公開記録 | [0.4.0 / 9793e2f](https://github.com/sintaro-katuta/silverball-chronicles/releases/tag/0.4.0)、10月31日公開。開始玉チャレンジを含む。今回は稼働中サイトの配信内容との一致を確認していない。 |
| 手元の作業ツリー | HEAD `6067384a6769dbb7477e15533ec3b07d354484c1` に既存の未コミット・未追跡ファイルが重なった状態。以下のローカル実装の根拠であり、HEAD単体や公開版と同一ではない。 |

版間照合：`prototype/src/domain/` は 0.3.0 タグ、release/0.3.0、PR #39 head の間で差分なし。上表のW基礎・保留・賞球・RUSHと旧ステージ無効はこの3版で同じドメイン実装を参照する。GitHub main `9793e2f` の W定数・W制御・runtime policy・SessionGame・開始玉計算・wallet・保存アダプタは、今回参照した手元の各ファイルと内容が一致した（2026-11-14取得）。画面や配信資産まで一致したという意味ではない。

## 現状の索引

| 項目 | 判定と内容 | 根拠・限界 |
|---|---|---|
| 通常抽選 | **採用**：図柄・チャージ各約1/399.9、各満額1500・300玉。分岐は公表丸め値からのゲーム内再構成。 | [W定数と4分岐](../../prototype/src/domain/tokyoghoul-w-spec.js)、[仕様](../pachinko.md)。公表51%を合算初当り全件へ掛けない。内部ROMの厳密値は未確認。 |
| 保留と結果 | **採用**：特図1保留4、特図2保留1。入賞時の乱数・普図の確率を記録し、既存保留を保証移行で書き換えない。 | [W制御](../../prototype/src/domain/tokyoghoul-w-machine.js)、[本編接続](../../prototype/src/domain/session-game.js)。普図容量は公表値不明で、本編の4は[暫定policy](../../prototype/src/domain/w-runtime-policy.js)。 |
| 入賞・賞球 | **採用**：一般5、始動・電チュー・普図各1、大入賞15。実球の入賞で払い出し、大入賞は1ラウンド最大10カウント。3000・6000はそれぞれ1500×2・×4の公表上の満額で、無条件の付与ではない。 | [W定数](../../prototype/src/domain/tokyoghoul-w-spec.js)、[W制御](../../prototype/src/domain/tokyoghoul-w-machine.js)。形状・接触条件は[既存盤面条件表](https://github.com/sintaro-katuta/silverball-chronicles/blob/sprint/S06/docs/agile/BOARD_CONDITIONS.md)とその後の変更記録を参照。 |
| RUSH | **採用**：普図130回・約1/95.3。普図成功後の電チューと特図2・Vを区別する。 | [W定数](../../prototype/src/domain/tokyoghoul-w-spec.js)、[W制御](../../prototype/src/domain/tokyoghoul-w-machine.js)。開放時間、Vの経路、普図保留、保証等は[暫定policy](../../prototype/src/domain/w-runtime-policy.js)で、実機値として未確定。 |
| 開始玉・チケット | **0.4.0採用**：通常400玉、任意0または1〜50枚の賭けで開始玉抽選。累計払出0なら0枚、正なら `max(1, floor(sqrt(累計払出 / 100)))`。発射消費を引かず、体験遊技は対象外。 | [0.4.0記録](https://github.com/sintaro-katuta/silverball-chronicles/releases/tag/0.4.0)、[計算](../../prototype/src/domain/starting-ball-wager.js)、[実装の記録](STARTING_BALL_WAGER_PROPOSAL.md)。0.3.0・PR #39の `SessionGame` は `confirmTickets()` が空で、今回の仕組みは含まない。 |
| 保存・終了 | **0.4.0採用、詳細は手元ソースで確認**：残高・開始前確定・累計払出を端末内保存。途中終了も精算し、再読込後は記録済み払出から回復精算する。盤面や持ち玉の途中復元はしない。 | [wallet](../../prototype/src/domain/session-ticket-wallet.js)、[保存アダプタ](../../prototype/src/app/session-ticket-store.js)、[本編](../../prototype/src/app/main.js)。Web Locks非対応環境はロックが省略されるため、複数タブの排他を無条件に保証しない。未保存の直近払出がある場合は保存済み値が回復対象。 |
| 旧ステージ・スキル・永続強化・倍率・天井 | **現行Wセッション未採用**：旧 `Game` にコードが残っていても、本編 `SessionGame` はステージ処理を空にし、倍率1・天井無効で接続する。 | [旧Game](../../prototype/src/domain/game.js)、[SessionGame](../../prototype/src/domain/session-game.js)、[W優先方針](../pachinko.md)。旧資料の存在だけで復活させない。 |
| 進行・発射速度・有料フロア | **未確定／現行実装への採用未確認**：旧ステージ進行の発射速度上昇について仕様に指示が残る一方、現行Wはステージ処理を無効化している。料金やコース等の具体設計も未確定。 | [仕様の9月28日以降の進行方針](../pachinko.md)、[SessionGame](../../prototype/src/domain/session-game.js)。矛盾を解消済みと扱わず、[最小ループ #54](https://github.com/sintaro-katuta/silverball-chronicles/issues/54)で整理する。 |

Wの公表RUSH突入約51%はチャージを含む値であり、ゲーム内の通常当選4分岐はその公表丸め値を使った再構成。RUSHの公表払出振分けは3000玉97%・6000玉3%で、実際の入賞不足を補填する保証ではない。[公表値と再構成](../../prototype/src/domain/tokyoghoul-w-spec.js)。

0.3.0系・PR #39の本編はチケット精算が無効で、今回の開始玉walletは未接続。[旧版のSessionGame](https://github.com/sintaro-katuta/silverball-chronicles/blob/6ce4124e57263a5974bbb9bf123d49313aa8fad4/prototype/src/domain/session-game.js)、[旧版の本編](https://github.com/sintaro-katuta/silverball-chronicles/blob/6ce4124e57263a5974bbb9bf123d49313aa8fad4/prototype/src/app/main.js)。0.4.0は[版固定の本編](https://github.com/sintaro-katuta/silverball-chronicles/blob/9793e2f173b23e67afd7c3e74d09426fda7cc943/prototype/src/app/main.js)でwalletを接続し、体験用を別セッションとして扱う。手元の本編ファイル全体が公開版と同一だとは主張しない。

## 更新と検証

仕様変更時は該当行の判定・根拠・未確定を更新し、集約時は候補SHAと対象を追加する。公開時はリリース記録と実配信の照合結果を分けて追記する。既存の歴史的記録を書き換えて公開済みと推測しない。演出・画面は #58、盤面は上記既存表と後続の盤面記録を参照する。

本表はソースとGitHubの版・公開記録の照合であり、今回サイト配信・実端末・通し試遊を実施した記録ではない。`pachinko.md` の10月19日節にある「公開は未実施」は当時の記録で、0.4.0リリース後の現況とは異なる。

### 今回の受入確認

| #57の条件 | 結果・証拠 |
|---|---|
| 採用・試作・未採用・未確定の区別 | 上表で対象版・根拠・未確定を明示。Wの機構policyは公表値ではなく暫定再構成。 |
| main・release/0.3.0・PR #39・公開版を区別 | 上記の版とSHA、GitHubのbranch・PR・リリース記録を照合。稼働中の配信照合は未実施。 |
| 優先関係と実装の不一致 | 冒頭に優先関係を記載し、ステージ別発射速度とWでの無効化を未解決として記録。 |
| 旧ローグライクとの区別 | 旧Gameの残存と本編SessionGameの無効化、#54への引継ぎを明記。 |
| 索引と更新方法 | [docs索引](../README.md)に追加し、本節の前に更新契機を記載。 |

2026-11-14の関連検証：`cd prototype && node --test tests/tokyoghoul-w-spec.test.js tests/tokyoghoul-w-machine.test.js tests/w-session.test.js tests/w-session-flow.test.js tests/w-session-lifecycle.test.js tests/starting-ball-wager.test.js` は29件成功。ローカル相対リンクは存在を確認。これは作業ツリーの自動検証であり、各旧版や実際の公開サイトでのテストではない。
