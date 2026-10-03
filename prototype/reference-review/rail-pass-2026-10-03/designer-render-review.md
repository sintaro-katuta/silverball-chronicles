# レール前面接触線と支持材の修正・表示確認

2026-10-03。修正対象はboard-runtime.jsの小さなレール表示整合。PixiJS router/scene-graphicsを確認して実装。球素材、釘、採用月影機関の人物・world・演出・下部の縁表示は作り直さない。

発射レールの幅10/3の陰影と幅2の支持材はlaunchRailBackとして発射球の背面へ配置。前面launchRailFrontはphysics c.a/c.bの同じsegmentからPixiGraphicsでstrokeし、LE共有LAUNCH_RAIL_CORE_WIDTH=2×.7=1.4、cap round/join round。中心ハイライトは幅.4。狭いcontactcoreにpainter.lineのBresenham squarebrushを使わないので、斜線法線幅がsqrt2に拡大する誤差を回避。outer金の幅3支持材もcontent背面へ、前面outer金線は同じOUTER_ARC/幅1.4/roundcapjoin。下部の金前面は従来3を維持。

独立PMのコードレビュー合格。物理壁の復活やtipgate/拘束solveはLE所有であり、この描画だけを理由に横断が正常と認定しない。LE最終10pass/tipgate/.7確定後、現在ソースを独立起動して自然標準左発射id1を新たに追跡・撮影。撮影瞬間だけpauseし、位置再取得→render→撮影→resume。初期球配置や当選結果は変えていない（開発reviewの外れ固定fixture）。

最終frozen4段階：world(29,373.80)/plane false、(48.72,284.53)/false、(68.91,253.12)/false、(73.41,247.73)/true。各原画＋球cropを実際に開いた。外周接触近傍にも球の白ハイライトと青い輪郭が残り、旧の細い欠片に見える状態を改善。tip近傍の移行後もサイズと軌跡が継続して見える。pageerror=0。ピクセルラスタやnearest拡大による端の量子化は残るが、旧可視半幅1.667とr.7の大差は前面coreに残さない。

証拠：designer-check.mjs/json（frozen/stageが最新画像に対応）、designer-stage-0..3.png、designer-ball-0..3.png、designer-final-sha256.txt。旧の球cropと診断はbefore-render-fit配下へ分離。designer-launch-motion.jpgは修正前動画の区間であり、現在成功の根拠にしない。designer-diagnosis.mdは修正前の所見、現在のrender合否はこの文書による。最終自然標準/高密度/RUSH動画とcross0/残球0の実証はLE/PM/rootの最新証拠で別途確認する。
