# 当たり判定・奥行き表示の確認 2026-10-03

## 原因を分けた結果

- 通常自然左打ち(.20/.24/.28、.6秒間隔)の2400frameでは、修正前アルゴリズム/修正後とも前面球の釘軸侵入0。高速の中心横断は既存adaptive substepが防ぎ、10000unit/sの実球回帰で反発する。
- 高密度(.24/.05秒)では球同士の分離後に釘軸を再解決せず、前面球が2回侵入（最大.03654unit）。同じ既存釘のcontactを後解決する修正で0。不可視連結・球強制移動・寿命削除は追加していない。
- 奥側発射平面の球は前面釘と非接触の既存policyなのに、全て手前に描画していた。自然20秒で3球/10frameの前面釘との投影重なりを計測。後方launchBallsLayerへ描画し、前面へ出た球だけ従来ballsLayerへ置く。玉画像・色・alpha・大きさは変更なし。これはソフトの平面policyとの整合であり、実機深度の確認ではない。
- 釘頭の表示幅14*.52/3≒2.43に対し釘軸接触径.4。頭と軸は同じ径ではなく、頭の絵への重なり全てをphysics tunnelingとは判断しない。球r1.8/釘軸r.2は推定校正値。中心採寸101点は不変。

## 普通口の追加回帰で見つかった停止

強さ.25の自然60秒+排出30秒で、球24が(143.28668,560.74715)に停止。近傍釘なし。普通口上下の縦rim端(141,560.5)/(143.75,563)距離3.7165に対し球径+両rim半径は4.6で閉鎖。停止位置は両capsuleに接する点で、接触順序による押出しで逃がす根拠はない。新釘解決によって旧閉鎖場所へ入る軌道が生じた。位置に球を置いた比較は新後解決の有無とも停止し、古いrim自体の問題と確認した（rim-trap-isolation.json）。

普通口sprite SIZE12/anchor.375/front分割.49の前面境界は約+1.38unit。縦rimの根拠のない+5をこの境界へ合わせ、normalのみ短縮。中心/幅/釘/球/ヘソ普図rimは維持。round(textureHeight*.49)による約.0044差は校正誤差として残る。+1.38は素材合成policyで、実機の壁奥行きではない。表示変更はなし。

## 検証と記録の範囲

lead-final-regression.log 21/21成功。追加の旧停止点実球・自然.25 60+30秒は排出/計数一致。contact-final.jsonlは.20/.24/.28/.25通常と.24高密度の5条件で前面釘軸侵入0/残球0/計数一致。

修正前比較contact-before-algorithm.jsonlは、新engineで追加post-pin処理だけを無効化した比較。元sourceの再実行とは区別する。初回probeのsetMode抜け記録(*wrong-mode.jsonl)は自然左証拠として使用しない。

normal-spin-flowの停止順assertは従来自然120秒しか採取しておらず、mouth fixture/排出時も状態採取するよう修正し、既存停止順assertを維持。lcd-flowのnatural HESO>0は頻度前提だったため、自然側のLCD非重複・左経路優勢・排出・収支を維持し、実口crossingを別testで検証。自然全条件でヘソ入賞を保証するものではない。

before-rim-fix/の動画・JSON・manifestは普通口是正前の履歴。直下の最終動画は現11製品hashを対象とし、別時点の成功を流用しない。dense.htmlは同じproductionrenderer/SessionGameへlaunchInterval.05を与えるローカルharness、本編default.6は維持。SE/クラウド送信なし。

最終left-mobile.mp4は標準.24を20秒、操作UIから.25へ変更して40秒、操作UIで発射停止して30秒排出。最終time90.408・spawn82・残0・各OUT/戻り/入賞合計82・accounting.reconciled=true。普通入賞1・ヘソ1で、ヘソ1は.25 cohort、球配置なし。これはこの録画条件での到達確認であり、単独power sweep全条件の入賞頻度を保証しない。

最終dense-mobile.mp4は同じrenderer/SessionGame・自然.05秒の要求間隔で20秒発射後30秒排出。実発射はcanLaunchで制限され、254球、普通4・ヘソ3・OUT131・戻り116・残0、収支一致。図柄結果だけmiss固定（CHARGE等の演出を導入するfixtureはなし）。left-motion.jpg/dense-motion.jpgは時系列サンプル、連続動画の代用ではない。撮影後11製品hash一致。

最終rush-mobile.mp4は173.64秒、初期RUSHと初回結果のみ固定し全自然発射。166.557遊技秒sampleでlastBonus.payout3000、総払出3065（一般賞球込み）、発射278、accounting.reconciled=true。動画の3000到達はおよそ171～173秒。rush-payout-motion.jpgは165秒から毎秒サンプル。直下3動画は全て普通口是正後の同じ11hashに対応し、最終変換後も全件一致。
