# S8 道末端4本・独立監査（2026-10-16）

## 判定

候補は12/250で、現3枚羽根9/250を上回りますが、旧形状13/250を厳密に超えません。計画どおり選別null、追加3条件750発の確認なし、採用・目標達成には至りません。動画は改善後まで保留、本編未反映です。

## 全3原記録の再集計

| 条件 | 実発射 | ヘソ | 一般 | OUT | 最大無ヘソ秒 |
|---|---:|---:|---:|---:|---:|
| legacy-control | 250 | 13 | 3 | 234 | 30.926190 |
| three-base | 250 | 9 | 4 | 237 | 70.189286 |
| three-road-tail-right025 | 250 | 12 | 5 | 233 | 39.355952 |

全3件で返却・残球・滞留・LCD全層/前面×中心/半径境界4区分は0です。phase0の比較だけで60/750達成や未観測条件への改善を主張しません。

## 静的範囲・原記録・源

- 新宣言/manifestは元配置の23〜26各x+0.25、y不変の1案と両対照だけです。既定strictを用い、例外profileなし。元101全属性・他97位置と始終位置を保持、4本間の相対ベクトルを全組で独立照合しました。仮約0.76mmは球11mm仮定の換算で実測ではありません。
- 現3枚羽根との候補全fixedはexact。風車の形状/中心/回転属性、球1.8/表示、発射0.18、間隔0.6、重力690、legacy壁/レール、口20、追加ガイドなし、係数は不変です。
- HEAD `e8930c9a574444a1a277bda27b9cbe8b759f9211`、源 `6275df21dfa252211ab1c78b7cc1544b7675c0fcf734182dbdf06d639f5f3a03`。3provenanceの始終一致/成功、現全196入力byte SHA、実行計画/manifestの保存コピーと現byte SHAを確認しました。
- 3gzipの圧縮/展開SHA・byte数、250固有shot/outcome IDと全集合、全kind終点計数、全30Hz frameの時刻/発射・計数・残球、別実stop/end snapshotを確認。最大無ヘソを先頭/末尾込みで再計算しました。
- 保存原記録への既存validator適用で、初期/正規化終端fixed、全frame/endpointsの機構/有限回転/球/表示、250発停止＋45秒排出等が通過。再試射や重いテストは行っていません。
- 関連19件成功と旧2秒＋1秒の出力互換は準備段階の証拠です。過去の全unit成功を新源の全回帰成功へ付け替えません。

## 根拠

- [計画](S8_ROAD_TAIL_PLAN.md)
- `prototype/reference-review/s8-20261016/road-tail/phase0/` 各3条件の原gzip/provenance/manifest
- 同 `preflight/three-road-tail-right025/`（strict静的成立・measurementStarted false）
- 同 `independent-audit.json`（独立集計と源照合）
- `prototype/reference-review/s8-20261016/road-tail-implementation/`（準備証拠）

幾何成立・安全・有限比較の完了とヘソ改善の採用は別です。結果を見た移動量や対象本数の変更、追加試射・Git操作・動画作成は行っていません。
