# 発射レール再指摘の受入範囲（2026-10-03）

今回はユーザーが自然発射で見たレールすり抜けを再検証する。旧collision-lcd成功、レールの存在、意図した別planeという説明だけを根拠に挙動を正常としない。local only/SE追加なし/保存追加なし。

## 修正前の独立観測

pm-before-rail-probeの旧physicsfdca/source manifestで自然5条件を測定した。標準.20/.24/.25の実中心segment横断は34/77/50件、高密度.24/.05は203件、.28は0件。全てfront→frontのlaunch-inner/outer/inner-arc除外中。これはsegment横断数でありunique球数ではない。例.24球1はt1.665、(57.485,284.207)→(57.193,284.099)でinnerarcを横断した。front切替はt.821、(80.046,240.568)。高密度のframe後rear壁重複も最大.11355を観測。

追加rear位置probeはsourceが全rail再有効候補へ切り替わった後に実行されたため、before証拠とせずpm-restored-rail-rear-overlapへ改名した。空記録を旧source成功へ流用しない。

Designerは球が金縁で欠ける表示を別に観測。可視rail半幅約1.667/金縁半幅1.5と接触r.7の不一致、balllayerより前面の金縁を照合する。表示上の部分欠けと実線中心横断を混同しない。

## 受入条件

- 前面/背面/plane切替前後の自然経路を実座標で検証し、除外されたレール横断を意図planeだけで承認しない。
- 実際に壁として描く面とcontactを対応させ、通常integrate/球同士の分離後/pin補正後にも壁内侵入を残さない。高速移動も同じ壁に反発する。
- 成形railの端点/開口が資料根拠か表示校正かを明示する。半径・奥行きを実機実測値へ昇格しない。
- 旧inletjam・ordinaryrimjamなど既知停止点と自然複数power/高密度で排出と全計数一致を確認。不可視追加バリア、球ワープ、寿命/都合による削除で帳尻を合わせない。
- 新sourceの自然left/dense/RUSH動画とjson/会計/残球を記録し、初期RUSH/結果固定や要求発射間隔を明示。通常版は標準.6間隔を維持する。
- 新sourceで3view同session/fire/pause/時計/抽選/保留/払出継続を独立確認し、撮影対象hashと最終sourceを一致させる。

旧e東京喰種W台帳の実機未確認事項は本修正の受入で解消扱いしない。

## 最新ソースの受入結果

PM独立10自然条件でcenterline横断0、front/rear接触侵入0（観測許容1e-6）、残球0、計数一致。合法inlet反発/排出責務を維持した5tests成功、最新3view同セッション継続5checks成功。新3動画はfixture/会計を独立照合し、撮影12sourceとPM16source全一致。left108・dense314は全回収、RUSHは3000完了後継続中の278発/274回収/4遊技中球。root39tests/build成功。詳細と動画SHAはpm-review.md・pm-video-confirmation.json参照。今回の受入は合格、実機未確認仕様・頻度・実寸の完全再現認定は残す。
