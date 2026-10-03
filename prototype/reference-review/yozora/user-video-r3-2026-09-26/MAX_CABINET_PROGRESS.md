# 現時点での最大モデリング — 作業記録

2026-09-26。ユーザーの「まずは一旦今できる最大のモデリング」を受けたローカル作業。全体の完全一致とは扱わない。Unity実描画はrootが統合して行う。

## Main筐体担当：ソース実装済み・描画確認待ち

観察：R1のDMM全体写真、R3 `board-0130.jpg`、既に確認した`fair-0100.jpg`、DMM `dmm-8.jpg`を画像で参照。左右非対称の透明成形面、外枠の連続したメッキ、黒いスピーカー、上部クレスト、銀/紫の六角印刷を基準にした。実測寸法・金型CADではない。

変更ファイル：`ReferenceCabinetBuilder.cs`、新規 `PremiumMainCabinetGeometry.cs`。

- 外枠を途切れた棒から、黒い厚い肩・クロームの巻いた返し・細い紫の挿入レンズを持つ連続曲面リボンへ変更。
- スピーカーを96分割の旋削断面（外周ベゼル/凹んだコーン）と黒い細い織り網へ変更。明るい水玉状の点列を使わない。
- 上部クレストを複数高さの面取りした土台/紫の光学レンズ/金属縁へ変更。黒いグリル床自体を曲げ、76本の細い稜線を載せる。
- 左透明成形面は連続した三日月形の面、4本の内部筋、六角印刷、ねじ座。右は異なる輪郭の背骨と段付き面、曲線の浅い彫りを使用し左右を複製しない。
- LCD面は維持し、周囲のみ細い座と光学的な返しを追加。LCD上へ装飾板をかぶせない。
- 金色神器の台座は厚み/面取り/黒い内側/巻いた金色彫りを分離。文字の押出メッシュはrootのBlender制作物が担当し、この担当では重複生成しない。
- 盤面の空いた左右に、既存の玉/ガラスより奥の薄い銀/紫の幾何印刷を追加。物理・液晶を変更せず、黒板状の余白を減らす。
- Tubeは6角断面の個別flat法線から、16/24角断面・共有接続・解析的な滑らかな法線へ変更。主要リボンや旋削面も法線を明示し、RecalculateNormalsだけで面割れさせない。
- 主要透明広面は青白い濃い色から弱い無彩色寄り(alpha .035、metallic .015)へ変更。稜線の材質も全面発光をやめる。紫の細い発光レンズは独立。
- 主要部品はそれぞれ意味のある名前のMeshとして保持。単一の巨大な筐体メッシュに焼き込まない。
- 旧LowerApron呼出は停止し、下部専用担当の`PremiumControlsBuilder`へ移管。FAIR機構のソースには触れていない。

## 固定したもの

玉のモデル/材質、全体照明、既存`StudioReflection`、発射/釘/センサー/ガイド/回転速度、Rules/抽選、先行A/B/C。新たなCollider/Rigidbodyは追加していない。動画フレームの貼り付けを完成モデルの代わりにしていない。

## 検証と残差

Main担当のruntime + 新旧Editor helperを、Unity DLLを参照したMono静的コンパイルで確認しexit 0。Unityプロセス、Generated、scene、Web出力は本担当からは起動/更新していない。

まだ実描画確認待ち。透明部品の重なり、反射の濃さ、クレストと外部データカウンターの距離、印刷と玉/釘の読みやすさ、金色文字の台座との重なりをroot統合画像で確認する必要がある。写真からの近似形状であり、実機の全素材、光学屈折、LED全点灯状態、背面機構は未再現。

## Main cabinet: first render review and corrective pass

Observed `maximum-model-2026-09-26/after-front.png` and `after-oblique.png` against the R1 full cabinet and DMM left-route closeup. These first-pass renders remain markedly simpler than the real machine: excessive black blank space, a flat blue flower, flat bright violet crown plates, rectangular character inlays, and sparse secondary clear mouldings. They are evidence of the first pass, not acceptance evidence for the following corrections.

- Identified a concrete occlusion error: printed pattern at z=-0.042 was behind the legacy dark bezel front (about -0.0545). Moved decorative printing to -0.064 and added staggered larger silver/purple hex fields following the observed left-route pattern. No collider or ball path moved.
- Added small mirrored cut prisms and separate clear covers to the outer side mouldings. Their placement and dimensions are artistic approximations, not measurements.
- Changed the crown medallions from uniformly emissive violet faces to non-emissive amethyst material and raised triangular cut faces.
- Replaced the previous planar polygon blue rose with five layers / 45 curved crystal petals, rolled rims, and a chrome receptacle. Shape and layering are inferred from the full-cabinet reference; this is not a scanned rose or proof of an exact match.
- Corrected sword front-triangle winding and supplied the back ridge to form a closed diamond section, thin chrome blade edges, and non-emissive polished metal materials. Animation root and transforms unchanged.

Pure C# compilation against installed Unity assemblies passed (exit 0) after this corrective pass. Unity regeneration/rendering is delegated to root and was not run here. The modified geometry's final appearance, transparent sorting, glyph intersection and actual frame cost remain unverified pending that render. The opaque rectangular crown illustration remains a visible separate limitation; existing transparent character atlas could replace it, but no unrequested image editing was performed.
