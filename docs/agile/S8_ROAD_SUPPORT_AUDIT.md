# S8 道支持釘の独立監査（2026-10-16）

## 現在の判定

新しい道支持釘1案の短比較3件を独立照合しました。候補12/250は現3枚羽根9/250を上回りますが、旧形状対照13/250を超えません。元計画のstrict両対照超えは不成立、選別はnull、元計画による確認比較は開始していません。目標60/750達成や本編採用とは扱いません。

PMは別の診断計画として既存支持1案を両fresh対照と3位相で確認する方針を提示しています。新位置・閾値の追加ではなく、現在3枚羽根との差の再現性を調べる未実施の別工程です。今回の選別規則を遡及変更しません。

## ソースとガード

- HEAD `7ba3312764ea8d6ffb0a1d1c90694d5e816ce374`、195入力SHA `65e3a032afef9bd51596f9aece2071e48992b3defc02fb04baf86513892867b2`。原provenanceの始終一致と現195入力の実SHAを確認しました。
- 内部resolver/prepare第2引数、measure第3引数のみで例外を伝搬します。`three-road2-support050`・釘2右0.5・3枚羽根・風車offset0・口20・ガイドなし・発射0.18・球径既定のexactcase限定です。config/CLIの汎用profile指定や旧right050は拒否します。
- 例外は道釘2/3だけです。軸非重複、実Sprite全14px枠から求める頭AABB非重複を要求し、他pairの中心距離4、壁・口・風車・累積距離1など既存ガードは保持します。球通過幅不足を許す支持仮説であり、流路成功の保証ではありません。
- 候補原記録だけに `validationProfile` と `conditions.pinSpacingProfile` が必要です。欠落・旧対照への混入を拒否します。
- 新源の証拠は関連30件成功と旧resolver/factory/短JSON・events/replay一致です。旧644件全unitは変更前db96源の証拠として分離します。追加試験は実行していません。

## 原記録の独立集計

| 条件 | 実発射 | ヘソ | 一般 | OUT | 返却・残球・滞留・LCD4区分 | 最大無ヘソ秒 |
|---|---:|---:|---:|---:|---:|---:|
| legacy-control | 250 | 13 | 3 | 234 | 0 | 30.926190 |
| three-base | 250 | 9 | 4 | 237 | 0 | 70.189286 |
| three-road2-support050 | 250 | 12 | 6 | 232 | 0 | 31.722619 |

3件とも固有shot/outcome ID250、全終点計数一致、30Hz全5938frameの時刻・発射/終点/残球計数一致、実250発目停止152.916667秒＋排出45秒を確認しました。圧縮/展開SHA・byte数は各raw-manifestと一致します。既存validatorを保存原記録へ適用して初期/正規化終端fixed、全frame/endpointの機構・半径・表示・条件を確認しました（再試射なし）。全101釘の属性と始終位置を保持、候補差は原釘2のx+0.5だけ、現3枚羽根との全fixedおよび250発射時刻は同一です。

## 根拠

- [計画](S8_ROAD_SUPPORT_PLAN.md)
- 原記録: `prototype/reference-review/s8-20261016/road-support/phase0/` 各 `result.json.gz / raw-manifest.json / provenance.json`
- 実装証拠: `prototype/reference-review/s8-20261016/road-support-implementation/` の `source-ready.json / compatibility-proof.json / related-final.log / preflight-*`

仮1.53mm相当は11mm球径による換算で実機採寸ではありません。未観測位相の改善、実機率、改善目標達成、本編反映を保証しません。
