# S2 #5 自然入賞・排出・収支の測定

対象：[Issue #5](https://github.com/sintaro-katuta/silverball-chronicles/issues/5)。ユーザーのS2開始承認後のローカル計測。固定期限は設けず、合意ACの検証・集約で終了する。ゲーム／物理／当選確率／賞球は変更しない。原workspaceのdirty sourceは測定に使わない。

## 再現条件と測定の意味

承認済み集約元 `d99fc23` からの隔離 `sprint/S02`。台IDは月影1〜5、catalogのpegSeed101〜105。各台の位相0/.175/.35秒、初期強度.20、口幅20、現factory受け皿、1/120秒更新、発射間隔.6秒、300秒発射＋45秒排出。位相は発射前の空更新。旧棒やガイドなしの比較条件へ置き換えない。

- **物理連続15条件**：既存createBoardFlowの機械確認factory。持ち玉・抽選・会計は生成しない。300秒の連続発射条件をそろえ、捕球／OUT／戻り／残球の物理計数を確認する。賞球の実収支とは呼ばない。
- **有限持ち玉15条件**：既存SessionGameの初期400球を保持し、既存feedback-sessionと同じ固定外れrng=.9で通常校正。SessionGame.fire／入賞／lose／returnedを既存接続と同じにし、実賞球・発射消費・戻りと最終持ち玉を照合する。stock不足で発射できない時間は生ログへ残す。このデータは自然当落成績ではなく、当たり供給を除いた会計校正。

無入賞時間はヘソ実入賞のみ。発射開始→初回、入賞間、最終→発射停止を含む300秒の観測窓の最大値とする。全窓無入賞なら300秒。排出45秒中の入賞は別欄で、発射窓の末尾gapを短縮しない。生値は丸めず、表示表だけ小数2桁へ丸める。有限stockの供給停止が含まれる値は物理のみのgapと区別する。

物理の計数：spawned = terminal outcomes + remaining、terminal球IDの重複なし。会計：initial + payout + returned + supply + debugAdjustment - spent = final stock、spent = spawned。一般賞球と大当り賞球を混同しない。固定外れなのでjackpots=0を観測する。

## 実行と証拠

計測専用 `prototype/tools/qa05-measurement.mjs`、意味検証 `prototype/tests/qa05-measurement.test.js` を追加。製品ソースは変更なし。指標テストは無入賞／窓境界／排出の分離／会計不一致／result停止のcensor分離を検証。最初の小数厳密比較が浮動小数差で失敗し、許容誤差へ訂正。最終4件成功。全CI／prepareは再実行しない。

```sh
node --test prototype/tests/qa05-measurement.test.js
node prototype/tools/qa05-measurement.mjs --out /Users/sintaro.katuta/dev/silverball-chronicles/prototype/reference-review/s2-2026-10-07/qa05
```

Node24.21.0のローカル実行。証拠は原workspaceの `prototype/reference-review/s2-2026-10-07/qa05/`（Git送信対象外）：各条件のイベントJSON、summary.json、provenance.json、measurement.log、metric-tests.log、effective-layout.json。日時／commit／digestはprovenance参照。実端末／ブラウザ計測ではない。

## 現時点の観測と制限

2026-10-07 04:26:40〜04:36:07 UTC（13:26〜13:36 JST）に全30条件を実行。全5台の結果は同じ実効配置のため同位相で一致。下表は**各台それぞれの値**で、全15条件の個別ログを省略して1台だけ測ったという意味ではない。

| 種別 | 位相 | 発射 | ヘソ入賞（発射窓） | 実観測gap最大秒 | 要求窓padding込gap秒 | 実physics発射／排出秒 | 最終残球 | 実賞球／最終持ち玉 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| 物理連続 | 0 | 497 | 22 | 58.80 | 58.80 | 300／45 | 0 | 対象外 |
| 物理連続 | .175 | 496 | 28 | 61.43 | 61.43 | 300／45 | 0 | 対象外 |
| 物理連続 | .35 | 497 | 27 | 56.51 | 56.51 | 300／45 | 0 | 対象外 |
| 有限400・固定外れ | 0 | 494 | 20 | 58.80 | 58.80 | 300／45 | 0 | 95／1 |
| 有限400・固定外れ | .175 | 496 | 28 | 61.43 | 61.43 | 300／45 | 0 | 103／7 |
| 有限400・固定外れ | .35 | 475 | 25 | 56.51 | 56.51 | 293.67／0 | 0 | 75／0 |

物理15条件は7,450発／385ヘソ入賞（100発あたり約5.17）。全30条件でspawned=terminal outcomes+remaining、終端ID重複なし、残球0。有限15条件は全件収支整合／spent=spawned、draws=accepted=ヘソ入賞、保留0／active=false／jackpots=0。全位相で排出中ヘソ入賞0。

有限位相0はphysics295.49〜297.91秒でstock不足による供給停止→賞球で復帰。位相.35は286.10秒から供給不足、result到達でphysics293.67秒へ停止し、45秒のstep要求でも実排出時間0。残球はresult前に0なので詰まりではない。実観測spanのgapと停止後padding込み要求300秒窓のgapは今回たまたま同値だが、意味は別。後処理の`observation.observedFiringGap`と`requestedWindowGapIncludingPadding`に独立保存する。後処理はイベント／状態の既存生ログのみから算出し、新たなゲーム進行をしない。

元ハーネスはrelease共通fingerprintに並行作成の#7 toolも含め、終端source guardがexit1となった。生30条件・元provenance（broad sourceUnchanged=false）と実行時ハーネスを保持。全計数／会計は成功し、開始gitStatusと終端commit差分で製品runtime変更0を別証拠化した。後処理時runtime SHAは`e00f4b08d2fb827905ef1675aee27249c317a9d30947e3b7eab8826395002deb`（306入力）。これは開始時採取digestとは主張しない。`supplemental-provenance.json`が時刻・根拠・tool SHAを記録する。

提出ハーネスは将来の再実行でruntimeとtool fingerprintを分離し、要求時間／実physics時間／censor gap／実効配置SHAを最初から記録する。今回の元生ログは書換えず、`--summarize <evidence-dir>`の後処理でderived-summary.jsonを再生成した（exit0）。実行時ハーネスSHAと提出版SHAは別に保存。全30条件の再実行や新しい成功記録への付け替えはしていない。

5台のcatalog seedは異なるが、本編lcd:trueでは `installLcdBoundary` が `physics.pins=[]` へ置換しsource-layout固定釘を作る。そのため5台の実効釘101本・衝突面・入口のcanonical SHAが同じ（derived-summary.jsonのeffectiveLayoutに各count／SHA、先行effective-layout.jsonは通常JSONのSHA）。これは現在のfactoryから独立生成して確認した値。台ごとの釘差による入賞差を評価済みとは主張できない。計測中のseed101／102の同位相結果も一致している。今回は配置を変更しない。

## 判定と別PBI候補

数値下限／無入賞秒数上限は合意されていないため、今回の成功は同条件の記録・計数／会計整合・制限の開示を意味する。過去の4〜8入賞/100球は暫定目安であり、全台保証や新しい合格閾値へ変換しない。

別PBI候補：[QA-03 #13](https://github.com/sintaro-katuta/silverball-chronicles/issues/13)。5台のseed個体差が本編盤面で実効化される要件を確認し、承認後に表示／接触の一致と釘の役割を維持する方法を設計する。長い無入賞区間の改善は今回の観測に基づいて要求を整理し、物理変更は別途承認する。自然当落の長期成績・全強度・実機入賞率・スマホ／音の評価は未検証。

commit対象境界はこの文書、qa05-measurement.mjs、qa05-measurement.test.jsの3パスだけ。#6負荷／#7音toolは別目的へ分け、Git操作はPMが担当する。

## AC提出判定

AC1〜2：5台×3位相の指定seedと実効配置、要求／実観測時間、発射／入賞／最大gap／残球／収支を対応付け提出。AC3：観測ラッパーは元関数へ同じ引数を渡し戻り値を保持、吸引・軌道置換・入賞注入・追加抽選なし。AC4〜5：観測値／未確認／別PBIを分離、遊技頻度や当たり保証なし。PMが全30条件・独立再計算・runtime差分なし・制限開示を照合し、測定ACをAcceptedと判定。releaseへの集約はまだ行っていない。元source guard失敗の事実は上記の通り残し、全run exit0とは報告しない。
