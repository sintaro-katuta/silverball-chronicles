# 発射レール：独立表示診断

2026-10-03、最新一般口rim修正後の現行sourceを独立ローカルブラウザ起動。素材/製品コードは変更せず診断のみ。以前の動画成功から今回のレール表示を正常と断定しない。

自然球id1を追跡し、撮影時だけpause→球位置再取得→render→撮影→resumeで位置と画面を対応させた。designer-check.jsonのfrozen配列が各stage原画に対応する。最初の実時間snapshot後撮影は位置が進むため、その位置から画像を断定しない方法へ補正済み。pageerror=0。

実画像と球中心cropを視認：stage0 (29,365.43)/plane=falseは全球が見える。stage1 (42.16,298.39)/false、stage2 (70.41,251.28)/falseは外周金縁との接触近傍で球左側が欠け、細い片に見える。stage3 (83.90,236.84)/trueはほぼ全体が見える。球が全面的に消失するとの主張ではないが、途中の見え方の変化は認められる。

コード根拠：発射球layerはrearLayerの前（背面）に置かれ、その後にrails/pins/pocketsなどを描画する。rail art線幅10/3world（半幅1.667）に対してphysics接触r=.7。さらにscene edge金stroke幅3（半幅1.5）はcontentの後のscene siblingなので全balllayerより前面。球外縁が物理上railから.7world離れていても、可視stroke内に約.8〜1world重なりうる。この可視壁幅と接触面の差は、縁に入り込む・すり抜ける印象の候補。layerをrear前へ動かすだけでscene金縁の遮蔽は解消しない。

INNER_ARC先端はworld(75.98,256.04)/source(179.96,272.09)。現plane移行条件x>80/y<300は先端そのものとは一致しない。資料上の射出口細い楕円口と先端線、最初の釘はdesigner-rail-source.pngで確認できる。最初pin[185,268.5]などとの対応からphase移行の妥当性は別途物理軌跡で確認すべきで、『別planeだから正常』とは先決めしない。ただし本4frameだけで物理の壁抜けを立証したという主張も行わない。

修正候補をLE/rootへ連絡：球/採寸釘を動かさず、まず可視rail/金縁の半幅とcontact面を対応させる。発射球layerと可視壁の前後は実壁縁を守る必要があり、単に全球を前面へ置く方法では内壁無効化の見え方が残りうる。phaseはinner tipの接線normal越え/通路からの退出に対応させる検討を依頼。新素材・演出作り直し不要。

証拠：designer-check.mjs/json、designer-stage-0..3.png、designer-ball-0..3.png、designer-rail-source.png。designer-launch-motion.jpgは最新left-mobile.mp4の5〜7秒を8fpsで復号しcropした区間視認用であり、撮影freeze4frameの座標根拠とは別。修正後の正常表示判断は新証拠で行う。
