# S8 風車右0.25・3条件診断の独立監査（2026-10-16）

## 判定

新3件の合計は24/750で、前回参照の旧形状31/750・現3枚羽根31/750の双方を下回り、目標60に36不足します。条件別でも0.175は現3枚羽根より1減、0.35は旧形状より3減、0.525は両対照より減少し、各条件非悪化も不成立です。性能採用不可、目標未達、本編未反映。原記録・安全の検証成功を改善達成としません。

## 原記録再集計

| 位相 | 条件・取得区分 | 実発射 | ヘソ | 一般 | OUT | 最大無ヘソ秒 |
|---|---|---:|---:|---:|---:|---:|
| 0.175 | legacy-control（旧参照） | 250 | 10 | 5 | 235 | 38.632143 |
| 0.175 | three-base（旧参照） | 250 | 11 | 4 | 235 | 57.508333 |
| 0.175 | three-wheel-right025（新測定） | 250 | 10 | 2 | 238 | 29.007292 |
| 0.35 | legacy-control（旧参照） | 250 | 10 | 2 | 238 | 41.641667 |
| 0.35 | three-base（旧参照） | 250 | 5 | 6 | 239 | 92.666369 |
| 0.35 | three-wheel-right025（新測定） | 250 | 7 | 8 | 235 | 49.792560 |
| 0.525 | legacy-control（旧参照） | 250 | 11 | 3 | 236 | 38.553571 |
| 0.525 | three-base（旧参照） | 250 | 15 | 5 | 230 | 48.028571 |
| 0.525 | three-wheel-right025（新測定） | 250 | 7 | 6 | 237 | 44.277827 |

| 条件 | 取得区分 | 実発射 | ヘソ | 一般 | OUT | ヘソ/100発 |
|---|---|---:|---:|---:|---:|---:|
| legacy-control | 前診断の参照 | 750 | 31 | 10 | 709 | 4.133333 |
| three-base | 前診断の参照 | 750 | 31 | 15 | 704 | 4.133333 |
| three-wheel-right025 | 新測定 | 750 | 24 | 16 | 710 | 3.200000 |

全9原記録の返却・残球・滞留・LCD全層/前面の中心/半径境界4区分は0。一般は候補16で旧対照10より多く、現対照15より1多い結果です。主目標の未達を一般入賞で置き換えません。phase0の11は今回750に混ぜていません。

## 同一入力と保全の事後確認

- 新HEAD `0ad3e5c087c2f5cf73f8d0c7b52ea51440282985`、新源 `fee1e6e38459ac113e1f6564aa785e7fb3683eaabedc047ef617aa03059adc1b`。新3provenanceで始終HEAD/源一致と成功を確認。
- 試射後も全195機械入力の現byte SHAが同一。前対照の源 `567bc9d73788843679eb2cc358824543c05bb3d153d5298e8c0845a2c91dcf60` と、トップ全体SHA/計画SHA/active manifestSHA以外のnested base/extraを完全照合しました。使用combinedmanifest現byteと新計画SHAも一致。
- 前対照6件はHEAD `f89b5073b8474a0dc8a3c438dd9691680d9963c7` と旧源のままです。input-equivalenceに保存された圧縮/展開SHAを再計算し、旧provenance始終およびactive manifest選択対照configとの完全一致を確認。今回fresh取得した対照と表示しません。
- 新3件を既存validatorで原記録readbackし、元101位置/属性、全固定物・全frame/endpointの機構属性/半径/表示、phase・250発停止＋45秒排出などを確認。現3枚羽根との差は宣言風車x+0.25だけで、釘移動/道支持profile/新物理値はありません。
- 全9件のgzip圧縮/展開SHAとbyte数、固有250shot/outcome IDと全集合、終点kind別計数、全30Hz frame時刻・球数計数、実stop/end別snapshotを独立確認。最大無ヘソを発射窓の先頭/末尾込みで再計算しました。

## 根拠と限界

- [計画](S8_WHEEL_RIGHT_PHASE_PLAN.md)
- [参照対照の先行監査](S8_ROAD_SUPPORT_PHASE_DIAGNOSIS_AUDIT.md)
- `prototype/reference-review/s8-20261016/wheel-right-phases/input-equivalence.json`
- 同ディレクトリ `phasep175,phasep35,phasep525/three-wheel-right025/` の原gzip/provenance/manifest
- 独立監査JSON: `prototype/reference-review/s8-20261016/wheel-right-phases/independent-audit.json`

既知3条件での有限診断であり、原因確定・実機率・未観測条件への一般化はしません。動画/音声はユーザーの「改善できてから」に従い停止中。追加試射・ソース/Git操作は行っていません。
