# 今回の受入範囲

2026-10-03追加依頼の対象は、左自然発射のすり抜けに見える接触整合とLCD開口形に合わせた保留・リール配置。月影機関の採用素材、W抽選・保留容量・RUSH・払出policy、3表示切替は維持する。local only、SE・保存・クラウド更新なし。

## 受入条件

1. 見える釘中心とcolliderの座標対応を保ち、見える頭/接触軸/平面の違いと実際tunnelingを分離する。釘半径・球半径は推定校正値で実測扱いしない。
2. 球同士の分離後も静的接触を満たす。高速入射で釘/壁を抜けない意味ある試験と、高密度自然左発射の排出・計数回帰を新コードで確認する。不可視supportbar、球ワープ、削除による帳尻合わせを追加しない。
3. 左釘101点採寸と途中道隙間の自由通過を保持し、rear launch arc/front planeの区別を維持する。
4. 保留最大描画数の全bboxがLCD_OPENING polygon内にあり、active/queue移動中も斜辺で切れない。保留数や抽選ロジックを表示改善で変えない。
5. 図柄を開口形の安全中心へ置き、normal/RUSHの既存演出・status/保留との重なりを確認する。矩形中心とpolygon面積中心は区別する。
6. 最新製品hashに対応する自然left/RUSH、whole/board/lcd実表示証拠を新規作成。fixture固定範囲を記録し、既存動画や成功ログを現在の証拠に流用しない。

## 初期診断

`../../../../prototype/reference-review/collision-lcd-2026-10-03/pm-before-pair-pin-probe.json` は実ROADpinid1に2球を意図的配置した診断。現コードでpair分離後にpin距離1.1 < 接触距離2.0のoverlapが残る。自然発射でユーザーが見た全例の原因と断定しない。釘head描画幅14*.52/3≈2.43とshaft接触径.4の差も別要因。径一律拡大は資料通路を塞ぐため、この診断だけを理由に採用しない。

未確認実機仕様（warp/stage/Z/V内部/開放実秒/低確普図/T2直撃/普図容量/complete）を本表示・solver改良の受入で解消扱いしない。

## 最終判定（普通口rim是正後）

今回scopeは合格。PM自然10条件で残球0/全計数一致/front pin侵入0、.25旧停止は79発79回収へ解消。最新Chrome5checks/pageerror0/15製品hash試験前後一致。直下3動画の11製品hash独立一致、JSON/source-script/fixture/収支を照合（pm-video-confirmation.json）。統括最新35tests/build成功。旧全274成功はrim前と分離する。

left82球・dense254球は計数一致/残0、球配置なしで自然HESO1/3を確認。rushは3000個bonus完了、総3065、278発=274計数+継続中4球で収支一致。固定power機械sweep全0と最新UI.24→.25動画のpositiveは条件別に保持し、実機入賞頻度一致には広げない。詳細はpm-review.mdの最終受入表と時点区分へ集約した。
