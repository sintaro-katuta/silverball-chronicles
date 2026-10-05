# 月影機関 抽選・保持量の改善実装

実装・調査日: 2026-10-05。対象: [改善点GF01〜GF08](game-flow.md)。クラウド更新・pushは行っていない。

## 実装したもの

| 改善点 | 実装 | 維持したもの |
|---|---|---|
| GF07 四分岐/演出事前確率の重複を整理 | `prototype/src/domain/tokyoghoul-w-spec.js` に `W_NORMAL_MODEL` と `wPublishedNormalOutcome`、`wNormalSymbolProbability`、`wPresentationWinProbability` を集約。既存policyのresolverはre-export。演出担当が `normal-spin-flow.js` のW priorを共通helperへ接続。 | 公表近似の1/199.9と25/0.5/24.5/50という既存四分岐、symbol-only prior .495/199.9、普図1/95.3と保証時1/1。公表カテゴリ約1/399.9とsymbol-only事前確率を混同しない。 |
| GF08 消費済みWイベント | event sequenceを配列長と独立した累計へ変更。SessionGameはsequenceで未処理を取得し、処理後に消費済み履歴だけを直近2048件へ制限。未処理イベントは削除しない。単独WMachine制御レビューは明示pruneしない限り全履歴を保持できる。 | 賞球、払出、RUSH開始終了、各大当り群の処理順。履歴を捨ててもsequenceはリセットしない。 |
| GF08 捕球済み数値ID | Physicsの単調増加nextIdと生存球最小IDから退役境界を進め、境界未満のseen要素を削除。以後、境界未満の遅延入賞は常に拒否。V代用入口の特別処理にも同じ拒否を適用。演出担当が物理step終了後にretireを接続。 | 抽選済み保留record、球の座標/速度/接触、自然入賞、二重払出防止。IDの忘却で古い球を再受理する処理にはしない。 |

seenの退役は実物理が使う数値IDに限る。文字列fixture IDは引き続き保持する。古い生存球が滞留すれば退役境界も待つため、seenの無条件固定上限は主張しない。退役は「最古の生存球より前の範囲」を閉じる安全な保持量対策であり、玉の強制消去ではない。表示側の `w.events.length` は直近の保持件数で、全イベント総数は `w.eventSequence` に分離した。

本編のGame側イベントは画面更新ごとに既存の `pixi-main.js` が消費/clearする。normal-spin-flowの入賞観測履歴は演出担当が直近100件＋累計へ整理済み。130入賞後の履歴100件と累計維持の検証は演出担当のテストに含まれる。

## GF01〜GF06の無料一次資料調査

[公式W機種ページ](https://pachi-e-tokyoghoul.jp/)を今回再取得した。公表確率、賞球、10C、1500×2/×4、V必須という注意書き、コンプリート搭載は確認できた。未確認項目の制御定数や内部構造は掲載内容から確定できない。既存の詳細未達を公表値だけで解決済みへ変更しない。

[FIELDS 2025年製品一覧](https://www.fields.biz/products/ps/machine_list2025.html)でW時期の機種を確認し、後発の[超デカ超一撃ページ](https://www.pachi-e-tokyoghoul.jp/chodeka.html)は別仕様のため値を採用しない。検索は公式機種ページ・FIELDS・Bisty・SANKYOに対して「W/普図/保留/電チュー/開放時間/V/コンプリート」の組合せを使用。掲示板やQ&Aは制御仕様の根拠として採用していない。

| 改善点 | 今回確定できなかった情報 | 現状と次に必要な根拠 |
|---|---|---|
| GF01 通常低確普図 | W通常時の当選率、短開放時間/回数 | 通常時は普図賞球のみという現行制限を維持。Wの制御表または判別可能な無編集近接映像が必要。RUSH95.3を流用しない。 |
| GF02 内部V | V位置、内部振分け、非V排出経路、アタッカー賞球との検知順 | 最初の小当り実入賞をV代用とするpolicyを維持。内部経路図・近接球追跡が必要。V代用を完全再現と説明しない。 |
| GF03 開閉時間 | 電チュー、小当り、アタッカーの開閉秒数とパターン | 8秒/8秒/15秒/0.65秒の試作設定を維持。型式Wの時間表またはfpsが明確な無編集比較映像が必要。 |
| GF04 特図2直撃 | 直撃と小当りの厳密分母・分岐 | 全件小当りV待ちの近似を維持。内部の割合を公式の3000/6000表示から推定しない。 |
| GF05 普図保留 | W固有普図容量 | 試作4を維持。特図保留4/1から普図容量を導かない。普図表示を含む映像または容量の公表表が必要。 |
| GF06 コンプリート | W固有の計数/警告/上限/リセット | 搭載の事実と未実装を区別。一般的な95,000値だけでは計数とリセットを実装できず、他機種の警告閾値を流用しない。 |

## 今回の検証

新規 `prototype/tests/w-model-retention.test.js` は四分岐の境界/10,001点の旧resolver一致、共通演出prior、10,000入賞の払出整合/消費済み履歴2048件/seen退役、未消費イベントの保全、古い生存球による境界制限、遅延V callback拒否を検証した。テストはfixture入賞を使い、端末の実メモリ使用量を計測するものではない。

関連テスト27件が成功。演出担当のprior/退役接続後にsession/自然物理橋/lifecycle/新規保持テスト16件を再実行し、全成功した。自然右発射テストでは当選乱数と初期RUSHだけをfixtureとし、teleportなしで普図→電チュー2→V2→3000と収支一致を確認した。追加の録画とブラウザ実動作確認はroot担当。単体成功を実機W内部の完全一致や表示/音の確認へ拡大しない。

```sh
node --test tests/w-model-retention.test.js tests/tokyoghoul-w-machine.test.js tests/tokyoghoul-w-spec.test.js tests/w-session.test.js tests/w-session-flow.test.js tests/w-session-lifecycle.test.js
node --test tests/w-model-retention.test.js tests/w-session-flow.test.js tests/w-session-lifecycle.test.js tests/w-session.test.js
```
