# Visual direction — 月影機関

### 2026-10-06 最新：音域をもう1半音だけ下げる

「もうちょっとだけ」の指示で、当たりと通常SEを直前の調整からもう1半音下げる。シンセの音色・倍音・音量・リズム・尺は維持。[音域の調整](SYNTH_ONLY_SOUND.md)。


### 2026-10-06 最新：シンセの高い音域を少し抑える

「悪くないけど、ちょっと音が高い」の指摘を受け、シンセ主体を保ち、当たり音を3半音・通常SEを2半音下げ、高次倍音を10%抑える。明るさと識別リズム、音量目標、尺と当落公開の同期は維持する。鈍い素材音への戻しは行わない。[音域の調整](SYNTH_ONLY_SOUND.md)。


### 2026-10-06 最新：明るいシンセ音色に統一

「前の方がよかった」「鈍い感じではなくシンセだけ」という最新指定で、硬い金属の返しを撤回。当たりの明るい音階を戻し、本編SEと支えの音を周期波のシンセへ統一する。低い衝撃・擦れ・金属の素材感を外し、明瞭なリード、短い変調音、ユニゾンと電子ディレイで勢いを出す。音の識別リズム、4音型、静けさ、当落の公開と音量設定は維持する。以下の金属/素材音を重視した方針より本節を優先。[制作・検証](SYNTH_ONLY_SOUND.md)。


### 2026-10-06 当たり音の木琴感を減らす

ユーザーの質感レビューにより、月輪パルスの返しを柔らかい打楽器から硬い金属へ修正。丸い立ち上がりと音階の分散を減らし、不規則な倍音・擦れ・飽和・長い金属の響きで鋭さを出す。音量と識別リズム、当たりだけへの割当は維持。[音色修正](SIGNATURE_SOUND.md)。


### 2026-10-06 覚えられる当たり音

ユーザーが「その音が聞きたくてたまらないような特徴的かつ中毒性のある音」を制作目標に指定。月影機関の当たり音へ、短い立ち上がり→加速する金属連打→強い解放→明るい返しという固有のリズムを設ける。核は認識できる形を保ち、4音型で加工波形・反射・返しを変える。通常予告と斬撃へ完全な音型を流用せず、当たり公開後の通常/RUSH当たりだけへ。聴きたくなるかは制作目標として残し、検証済みの心理的効果とは断定しない。[制作・試聴](SIGNATURE_SOUND.md)。


### 2026-10-06 効果音の素材感と主役

「効果音を仕上げて」の指示で、決着の一撃・当たり・溜めを基準に音色を作り直す。低域だけに重さを任せず中域の衝撃と金属の複数の響きを重ね、左右の反射と減衰で余韻を作る。溜めは粒状の刃の響きを徐々に開き、単独の三角波のサイレンを撤去。重要な一撃と当たりでは背景を引き、操作音で確定音を切らない。保存当落・静けさ・現行尺を維持。[制作と検証](SOUND_FINISH.md)。


### 2026-10-06 連続する空気音と溜め

プレイ動画の長い無音への指摘を受け、短いSEの間を薄い空気・共鳴でつなぐ。決意の一閃は24秒から音程と密度を徐々に上げ、49.65〜50.2秒の直前だけ音を引いて一撃を際立たせる。勝敗・復活の結果公開までは同じ音にし、既存の間・敗北後の静けさを保つ。停止・消音・表示時計のジャンプにも追従する。[追加修正・検証](ORIGINAL_SE.md)。


### 2026-10-06 効果音の独自性・ノイズと反復回避

ユーザー依頼を本編SEへ適用。金属・月光・粒状ノイズを軸に、70音名×4音型を別のリズム・共鳴・左右の動きで作り、同じ音名でも隣り合う発音で同じ音型を避ける。予告、攻撃、溜め、当落、BONUS、RUSHの役割を分け、既存の表示時刻と音を同期する。決意の一閃は直前の無音から一撃、復活は普通の敗北と同じ音から再起。前段の強い音は当確扱いにしない。操作・情報の効果音チェックで停止できる。[割当・試聴・検証範囲](ORIGINAL_SE.md)。実機スピーカー・イヤホンの聴感評価は残す。


### 2026-10-05 決意の一閃：溜めから一撃へ

ユーザーの「溜めて溜めて、一撃で放つ」「何回もちょんちょんしないで」をpressureの演出へ適用。多段反撃ではなく、敵の圧力→揺るがない構え→刃へ収束する月光→顔/握りの切替→直前の静けさ→大きな一閃に集中する。120msの接触姿勢保持と振り抜きで一撃の重みを出す。待ち時間を埋める反復斬撃や単純な再生速度変更は採用しない。復活は残った月光の再点火と再起で見せる。54/58秒と上部5秒、保存当落は維持。先手/互角の斬り合いへ一律適用しない。

[実装と最新の本編確認](long-reach/RESOLVE_SINGLE_STRIKE.md)。従来の3連斬りの動画は修正前の履歴として扱う。

### 2026-10-05 続行分：長髪・専用5映像の本編反映

戦闘の既存/中間atlasを長髪v4/v7へ同時接続し、握り・刀身・足元登録と髪/布の風を合わせ直す。人物の決意・記憶・門の防衛・屋根の追跡・橋の救出の専用カットを本編の通常5秒/RUSH2秒へ編集して接続。字幕の切替で映像をリセットしない。原型の長い銀髪・青眼・金の髪飾り・紺金衣装を維持し、変更前の短髪の画面を今の成功証拠へ流用しない。図柄のみのリーチも維持。

現在の接続と検証範囲は[統合受け入れ記録](long-reach/QUALITY_ACCEPTANCE.md)。下段の髪型未反映／専用映像未制作は途中経過。スマホ実機・ユーザーの最終好みレビューは未確認。雰囲気・静止差分の成功を全時間の連続作画の完成へ拡張しない。

### 2026-10-05 予告・発展の本編構造

ユーザーが東京喰種Wの全演出説明を確認後、実装変更を指示。通常／RUSHの予告を分け、保留の青・赤・金の兆し、段階予告、人物／影の短い入口→発展タイトル、任意の途中チャンスアップを月影の言葉と既存素材で接続する。色だけでなく保留の輪・菱形・二重輪で区別する。強い予告は外れにも使い、確定を意味する全回転は当選プレミアの一部だけ。

新しい入口では元の長い銀髪の `character-static-v1.png` を使う。戦闘atlasの髪型修正は以下のC担当作業と別であり、今回の構造接続で品質合格にはしない。通常5秒／RUSH2秒の入口は既存54秒内を使い、短尺の発展なし当落も残す。月／剣の上部5秒・矢印・液晶継続、復活58秒・即告知12秒を維持。

各予告は全文を液晶の斜辺内で読めるように配置し、戦闘中の顔・攻撃を隠さない。新しいSE・PUSH・原作の人物素材は追加しない。参照の掲載全項目と未制作の専用映像は[予告・発展の実装対応](long-reach/PREDICTION_IMPLEMENTATION.md)に区別して記録する。

### 2026-10-05 戦闘素材の髪型不整合

ユーザー指摘を受け、元の`character-still-v1.png`の長い銀髪と戦闘用`duel-poses-v1.png`/`duel-intermediates-v4.png`を目視比較した。戦闘用の最初の6姿勢から短髪になっており、追加姿勢にも引き継がれていた。髪型の設定変更は採用していない。統合担当の人物同一性の確認漏れとして、長髪の元キャラクターを基準に両atlasの修正をC担当へ依頼した。現行の戦闘素材は暫定接続であり、人物素材として品質未合格。透過・当落の検証成功とは分けて扱う。

### 2026-10-05 図柄回転の方向訂正

ユーザー指摘により、通常・RUSH・短いリーチ・直当たりの図柄を上から下へ流し、時間順に1→2→…→9→1と増える方向へ統一する。従来の減る数字順は不採用。短いリーチの外れは7を通過して8へ進み、787で停止する。保存結果と描画の停止目を一致させ、当落・獲得・尺・信頼度の配分は変えない。現行の確認記録は`../../prototype/reference-review/reel-direction-2026-10-05/`。以前の動画は方向訂正前の履歴。

### 2026-10-05 全パターンの本編接続・第一段階

PixiJSの本編へ短いリーチ・直当たり・月/剣プレミアと当落別配分を接続。剣プレミアの紋章は本編の刀身へ追従し、図柄は本編と同じ描画を使用する。戦闘は既存6姿勢に中間6姿勢を追加し、刀身の接触・反応・通常敗北と復活前の共有を改善した。灰色地が残った追加素材v3は不採用とし、透過v4へ切り替えて本編で再確認した。

液晶の攻防を続けながら小さい矢印と上部約5秒を重ねる。上部予告なしの回では矢印も出さない。完成済みの連続作画とは扱わず、全3本・通常/RUSH双方の全尺、実機端末、長時間遊技とユーザーの演出レビューを残す。現行証拠と限界は[本編統合](long-reach/INTEGRATION.md)。過去の独立試作の成功を本編確認へ転用しない。

### 2026-10-03 ヘソ入口幅の物理・表示校正

入賞頻度調整のため、本作の暫定入口幅16 worldを採用。資料転記の原値24 source px（12 world）と実機未確認の校正値を区別する。口の高さ・中心・命釘/その他101釘・球・反発は維持する。

黒口と前面lipを同じ物理pocket.w=16、内帯14で描く。既存中央口素材のrear/frontを共に横20・縦15へ合わせ、前面分割/y位置は維持。既存素材の横幅を調整するだけで、人物・背景・液晶演出は作り直さない。入賞判定だけを広げない。PC/スマホの全体・盤面・液晶と自然入賞→図柄変動を最新ソースで確認する。

証拠は `../../prototype/reference-review/heso-calibration-2026-10-03`。短い候補動画や停止表示の確認を長期自然頻度の証拠へ転用しない。4〜8入賞/100球という本作の暫定目安は未達、ワープ/ステージなどの未確認・未実装も残る。実機寸法・入賞率の確定とは扱わない。

### 2026-10-03 発射レールの接触と可視縁を再訂正

盤面へ出た後も内壁・外壁・内周arcへ衝突させる。先行の別平面説明で実レール横断を許可しない。射出口切替は実装の内周終端を使った横断・端cap離脱で判断する。

接触r.7を維持し、前面のレールcoreと外周金縁を共有幅1.4、丸端/丸継ぎへ揃える。従来の幅広の陰影・支持材と太い外周金支持は玉の後方へ移し、発射玉が細い片に隠れる状態を改善。下側の枠幅・人物・液晶・既存演出・球素材は維持する。幅を合わせるためr5/3へ増やす候補は自然玉詰まりを作り不採用とした。前面contactと背面supportの区別は表示整合policyで、実機内部の実測ではない。

最終撮影と独立自然経路検証は `../../prototype/reference-review/rail-pass-2026-10-03`。修正前の横断/表示欠け画像は履歴として保存する。

### 2026-10-03 接触の見え方・保留・図柄中心

発射レール内の玉を釘・樹脂より背面へ描画し、盤面へ出た玉は既存前面層へ置く。玉の素材・大きさ・色・透明度は変えない。釘頭の見た目と接触軸の寸法差は残るため、見える頭との重なりだけで接触漏れを判定しない。実際の球同士分離後の釘重なりは物理側で修正する。

一般入賞口の暫定壁は、見える開口を越え下部goldbodyまで伸びていた+5を、既存size12/anchor.375/frontcut.49に対応する約+1.38へ合わせる。共通定数で描画と対応させ、既存spriteと球・釘・口中心幅を維持する。図の壁深度は未測定で、この長さは描画整合policyである。

保留列を右へ22logical px移し、斜めのLCD開口内へ収める。通常図柄の中心Yを89から63、RUSHを77.5から65.5へ移し、勝利777の拡大支点も揃える。RUSH上部statusと下部保留の領域を確保し、既存人物・背景・演出を維持する。今回の画像・動画は `../../prototype/reference-review/collision-lcd-2026-10-03`。

### 2026-10-03 遊技中も3段階の表示を切り替える

ユーザーは筐体全体・盤面・液晶のどの表示でも遊べて、プレイ中に切り替えられることを希望。開始導入を維持し、完了後に左上の「全体・盤面・液晶」を表示する。選択は同じ本編sceneのカメラと外枠表示だけを変更し、遊技・発射・抽選・保留・払出を継続する。一時停止や明示的な発射停止も変更しない。初期表示と新規開始は盤面、導入スキップも盤面から開始。表示選択の保存は追加しない。

右上の操作・情報は全3表示で開閉できる。表示切替ボタンが台へ重ならないよう上部の小さな操作領域を確保する。全体は既存高精細筐体枠＋同じ本編盤面、液晶は同じ人物・背景・図柄へ寄る。物理座標や素材は再制作しない。現行証拠は `../../prototype/reference-review/view-switch-2026-10-03`。

### 2026-10-03 本編と同じ台を見せる導入へ訂正

一覧用48×64の簡略筐体を詳細で拡大する表現は、本編の見た目を確認する用途に合わないというユーザー指摘を受け撤去する。詳細は仕様と開始の入口とし、読み込みを伴う実際の台はプレイ開始後に見せる。開始時は既存の高精細ドット絵筐体枠と本編盤面を使い、全体→採用済み盤面範囲→液晶へ寄り、盤面へ戻って発射を開始する。これは本作向けの導入演出で、実機の開始仕様を示すものではない。

遊技中の通常表示は引き続き盤面中心＋操作情報の開閉。一覧の小さな選択用サムネイルは維持するが、全体が入っていることだけを根拠に本編と同じ見た目だと評価しない。新素材・SE・物理やW制御の変更は追加しない。今回の実装・現行検証は `../../prototype/reference-review/intro-zoom-2026-10-03` に分離する。

### 2026-10-03 表示範囲の使い分けを採用

ユーザーは遊技中の拡大盤面表示を採用。台一覧と台詳細では、上部・左右枠・玉皿・ハンドル・下部まで含む筐体全体を見せる。現行の一覧・詳細は既存48×64の全筐体素材を使用しており、遊技用396×436のcropとは独立している。この使い分けを維持し、遊技中へ筐体全体を戻す変更や新しい筐体素材の制作は行わない。

### 2026-10-03 台を主役にする表示・操作パネル

遊技中は台を画面内に縦横比を保って最大表示し、台の外の矩形枠・固定ヘッダー・常設情報欄を撤去。右上の「操作・情報」から持ち玉、累計、発射停止/開始、左打ちの強さ、メニューを表示・非表示に切り替える。展開中はPCと横向き画面では右側、スマホ縦向きでは下側に操作領域を確保し、玉路や液晶へ重ねない。小さい画面では操作欄内をスクロールする。

本編の描画領域だけを396×436へ詰め、筐体・玉路・OUTを残す。釘、物理座標、抽選、演出素材は変更しない。表示切替は遊技を継続し、メニューの一時停止は従来どおり。縦長端末の上下余白は台全体と縦横比を維持するために残る。今回の現行証拠は `../../prototype/reference-review/focus-view-2026-10-03` に分離する。ローカルのみ。

### 2026-10-03 W盤面の引継ぎ訂正

月影機関の人物・世界観・ドット絵・採用済み液晶演出を維持。右5釘間の資料根拠のない不可視連結4線を撤去した。原図の各釘を個別採寸し、LEFT_PINS_SOURCEの欠落9点と誤写を訂正、左道26点・右道5点との合計101点へ更新。採寸比較は `../../prototype/reference-review/tokyoghoul-w-handoff/designer-pin-comparison.html`。これは図上±1source pxの近似であり、釘の実寸・角度・奥行きの完全一致ではない。

図上の座標を保持して接触を再校正（球1.8、釘軸0.2、電チュー左成形壁0.4）。さらに発射内周arcの別平面接触漏れを修正。外周境界は維持。これらの半径は原機実測値ではない。修正前後の試験・実動動画は `../../prototype/reference-review/tokyoghoul-w-live-2026-10-03` に保存し、失敗版を成功証拠へ転用しない。今回の訂正を未確認のワープ/ステージ内部・奥行き・遊技制御の一致へ拡大しない。SEなし、途中保存追加なし、ローカルのみ。

### 2026-10-02 最新：実機Wの完全再現へ方針変更

盤面だけでなく抽選・RUSH・払出もe東京喰種Wへ合わせることをユーザーが明示した。キャラクター・世界観は月影機関、ドット絵を維持。旧ゲームルールよりpachinko.md冒頭の新方針を優先する。公開資料の観測結果と未確認の内部構造は reference-review/tokyoghoul-w-analysis/observations.json で区別する。

着手：公式公表仕様を独立したtokyoghoul-w-spec.jsへ記録。130回の独立抽選の合成確率と、3000/6000を複数の10R大当りとして扱う計画のテスト3件成功。既存Gameへの接続、普図→電チュー→特図2→Vの制御、未確認の開閉時間、盤面の誤認箇所の修正は未完了。現在画面の旧仕様を実機再現済みと扱わない。

Purpose: a portrait offline pachinko game, readable enough to watch individual balls, with a fully pixel-art presentation as the target.

Current user instruction (2026-09-29, supersedes hybrid interpretation): all visuals must become pixel art. Prepare to migrate rendering to PixiJS while retaining independent physics and game rules. The user will review materials separately; do not create new artwork, alter the current look, or lock palette/resolution/font/frame-count choices during preparation. The existing hybrid screen remains unchanged as a comparison baseline, not an accepted final art direction. Preparation and the material handoff are in [migration-prep](migration-prep/README.md).

Historical hybrid implementation (superseded by the user correction above): take a practical middle ground between PlayCanvas and pixel art. This supersedes the complete pixel/PixiJS migration below. Retain 3D physical cabinet, balls, pins and moving mechanisms; redesign their actual materials and decorative surfaces instead of placing a second cabinet picture over them. Use newly reinterpreted pixel-style art for the normal LCD and portrait cut-ins, existing detailed illustration for battle sequences, and legible system Japanese type for small operational labels. Preserve PixiJS floor selection. Do not globally downsample source artwork or the 3D board. Current local implementation uses a fixed 540×880 board buffer, navy/silver/blue materials, stepped crown/deck inlays and authored pixel-city foil. This is a hybrid visual revision, not full asset conversion. Evidence: [current before/after and replay captures](reference-review/hybrid-2026-09-29/REVIEW.md).

Historical direction (superseded where conflicting):

Global art direction (2026-09-28, user-approved): use one coherent pixel-art language throughout the complete game: machine lineup and individual nail layouts, HUD, menus, results, icons, backgrounds, characters, LCD/reels/holds, cabinet, playfield, balls, pins, mechanical parts and effects. This supersedes the realistic metal, high-resolution illustration and smooth-rendering goals below. Preserve the pachinko machine's recognizable physical layout and ball physics, but translate its appearance into pixel art. Establish a shared logical pixel scale, palette, outline and shading rules, and pixel UI typography; use nearest-neighbor scaling and avoid blur or smoothing that breaks pixel edges. Keep small-screen readability for symbols, counts and balls. Conversion has started with the floor-one selection screen; the gameplay board and remaining screens still need migration.

Rendering direction (2026-09-28, confirmed by user): use **PixiJS** for the unified pixel-art presentation and its sprite/UI/effect layers; keep game rules and the existing physics model independent of the renderer. The current project renders its board with PlayCanvas, so this is a renderer migration, not a drop-in package addition. Convert one representative full machine view first and verify physical alignment and mobile readability before migrating all screens. PixiJS provides a GPU-accelerated WebGL/WebGPU canvas renderer and texture/sprite pipeline; it does not replace the game's physics by itself. Follow the [PixiJS tutorials](https://pixijs.com/8.x/tutorials), [renderer guide](https://pixijs.com/8.x/guides/components/renderers) and [texture guide](https://pixijs.com/8.x/guides/components/textures).

Progression direction (2026-09-28, user-approved; per-unit nail variation clarified 2026-09-29): remove the stage concept. Machine selection evokes a game center: show about 20 individual cabinets on each floor screen and use pagination to move between floors. Repeat units of a model share their lottery odds and nail count, with small per-unit nail-position differences changing how balls enter. The first floor contains only 0-ticket machines, so play remains possible at zero balance. On paid floors, every machine on the same floor has the same play price; starting a play consumes that floor's price. The working price schedule is 1F 0, 2F 50, 3F 150, 4F 450 tickets, then ×3 for each additional paid floor. Keep this proposal; it remains adjustable rather than final. Show floor price, machine difficulty and clear reward before start, and prevent starting when the player cannot afford the floor price. Difficulty should rise through nail adjustments and more courses / greater total balls required to clear; higher-risk units award more tickets on clear. This supersedes the numbered course plates and stage-progress dashboard described below. Exact unit roster, course structure, clear/failure rules, floor prices/rewards, and refund rules are still to be designed. The floor-one selection UI is implemented; gameplay progression still follows the legacy rules.

Floor-one prototype (2026-09-28, individual nail layouts added 2026-09-29): replaced the course landing page with a 20-unit game-center grid. The first five slots are individual 月影機関 units; the other 15 are explicitly dummy units. All floor-one units cost zero. The user clarified the floor list: always arrange cabinet pixel art in 5×4, with no visible machine names, numbers, per-machine ticket labels, selection summary, unrelated utility buttons, branding header, or footer; retain only minimal floor and floor-cost navigation. Cabinet selection proceeds to the detail screen. A pixel-art cabinet sprite based on the user's supplied reference is shared by the floor and detail views; dummy units use restrained tint variations. This illustration is presentation-only. Gameplay nail coordinates, per-machine nail variation, and physics are unchanged. The five 月影機関 units share lottery odds and nail count, while each gets a stable small per-pin layout variation. The same generated pin coordinates drive both collision and visible named pin meshes. The play screen still uses legacy stage progression and does not represent the new adopted progression rules. Dummy units cannot be started.

Pixel-art implementation audit (2026-09-29): UI text uses the bundled DotGothic16 font. DOM and battle source images are automatically reduced to one-eighth width/height; the battle canvas and PlayCanvas views also render at reduced resolution. These are pixelation treatments, not redrawn pixel-art assets. Gameplay still uses the PlayCanvas Machine renderer, with a separate PixiJS frame image mounted above it. This does not complete the adopted whole-machine pixel-art redesign or PixiJS renderer migration. The floor/detail illustration must not be used as evidence that the gameplay board was replaced.

User clarification (2026-09-29): use the original artwork as reference and recreate it as pixel art, deliberately designing silhouettes, facial features, outlines, palette and shading for the intended pixel resolution. Adding a frame above the existing machine or merely shrinking existing artwork does not satisfy this request. For every visual revision, submit newly captured images of the running revised implementation, identifying the screen and conditions. Where comparison is useful, capture before/after under matching conditions. Generated source artwork and historical screenshots are not evidence of the integrated result. Report any remaining old artwork or renderer explicitly; do not describe partial conversion as complete.

Palette: retain the midnight, blue, silver, brass and cold-light identity as a constrained pixel-art palette; define exact ramps and contrast roles during implementation.
Type: use pixel-compatible Japanese title, narrative and UI typography with tabular numerals; avoid mixing smooth type with pixel-art assets.
Layout: machine selection presents a game-center floor with roughly 20 pixel-art cabinets, pagination between floors, and each cabinet's ticket price, difficulty and clear reward. Selecting a cabinet opens its detail/spec screen with machine art, shared model odds, its individual nail layout, price, play record/graph, and a distinct play button. In play, a full-width physical board dominates mobile, with a compact dashboard for current balls, spins and graph; controls sit below without covering the board or outlets. On desktop, the same portrait board sits beside play information.
Signature: pixel-art balls, pins, LCD and machine mechanisms share a consistent logical pixel scale and outline language. The cabinet may retain dimensional depth, but its final rendered appearance must read as pixel art rather than realistic chrome.
QA revision: first lighting pass washed out the board. Lowered exposure and board environment reflection to separate chrome objects from the navy background.

Physical geometry (2026-09-22): one right-bottom launcher fires upward. Initial velocity, gravity and contacts with the upper kicker / reflector produce trajectories; there is no destination threshold or path interpolation. Rail, resin, rubber, pocket-edge and moving-door meshes share the collision segment coordinates and radii. Balls stay on one playfield depth.
The ordinary field uses orderly role-based pin groups with multiple routes, two contact-driven windmills, life/jump/road/approach nails and deliberate spills. Courses vary groups, wheels and pocket positions. The right drop contains thin transparent resin guides and no nails, floor band or arrows. The closed attacker door diverts balls; the open flap exposes the mouth. Central out and launcher return outlets remain visible. Decorative LCD imagery is the explicit non-colliding exception.
A ball radius of 4.6 and pin shaft radius of 2.1 are prototype board units; pin heads sit in front of the shaft. This is a coherent 2D-contact simulation rendered in 3D, not a real-dimension replica or simulation of pin flexibility and playfield depth.
Reels stop left, middle, then right. A matching first two reels leads to reach while the right reel continues; outcome remains fixed before the presentation.

Launcher clearance fix (2026-09-25): the left barrel below the upper exit uses a single-file 11.4-unit clear width for 9.2-unit balls. Visible rails use the same segments as collision surfaces. The upper exit retains its existing kicker. New shots wait for muzzle clearance and descending return balls, including manual and free shots. This applies only to the launcher.

Upper launcher exit fix (2026-09-25): the stage-6 stream needs a shallower kicker and lower inner lip. The kicker now runs from (18,165) to (68,90), with the inner exit ending at (39,190). This supersedes the prior note about retaining the old kicker. Visible rails continue to share collider geometry; gravity and launch velocity are unchanged.

Component production and preload (2026-09-25, adopted): refine cabinet parts individually, starting with the right receiving unit and ordinary receiving ports. Each owns its geometry group, material copies and state-driven animation. Keep shared physics coordinates. Provide a development-only isolated preview and compare each part in the complete board. A pre-play loading screen may take real preparation time; show asset completion and offer retry/cancel, with no game progression before readiness. The current implementation predecodes LCD images; detailed geometry improvements and asset compression remain next tasks. See [COMPONENTS.md](COMPONENTS.md).

PlayCanvas migration (2026-09-25, adopted): migrate the whole game's execution/rendering foundation to PlayCanvas. The current implementation uses PlayCanvas for the game update loop, cabinet/balls/mechanisms and sculpted titles. Existing geometry is supplied as editable GLB assets with named moving parts; Three.js is retained only in offline authoring tools. DOM UI and Canvas 2D illustration composition remain integrated with that loop. Cloud Editor setup and its authoring workflow are still pending; see [PLAYCANVAS_MIGRATION.md](PLAYCANVAS_MIGRATION.md). Preserve the original rules and physical coordinate mapping throughout.

Attacker local revision (2026-09-25): replace the broad gold face with blue-steel shutter panels, a narrow silver surround, restrained brass inlays and a small central diamond. Add stepped casing, side hinge details and a chamfered upper hood; preserve the original physical mouth width and collision endpoints. Door decoration is parented to the moving gatePanel. This is an implementation proposal for the user's requested visual improvement, pending user aesthetic feedback; it does not define a new game rule. Inspired by the front/edge depth and restrained highlight principles in the design skill's visual-patterns reference (D3), not a reproduction of a specific real machine.

Cloud workflow (user instruction, 2026-09-25): all development and visual review stay local. Upload or update cloud assets only after fresh explicit user permission, preferably together at the end.

Presentation scope clarification (user instruction, 2026-09-25): lighting and moving spectacle props may enrich the presentation. A sword entering from the side or a descending logo are examples, not required deliverables or a checklist to reproduce. Select suitable effects for Tsukikage's fiction and the scene's purpose; mechanical realism applies to functional ball-handling devices and does not require every suggested decorative mechanism. Preserve readability of the LCD, symbols and ball paths; distinguish normal, anticipation and payoff through timing and intensity. Continue local-only development until fresh explicit cloud permission.

Overhead data display (2026-09-25): user requested real-machine-style upper information. Implemented a separate DOM `data-counter` component with a dark glass face, silver housing, prominent jackpot / starts counts, total starts and the existing balance graph. Lamp rim and text follow normal / RUSH / active jackpot without revealing pending results. Stage, current stock and target occupy a separate lower strip. Reference: [Daiichi, デー太郎ランプε](https://www.daiichi.net/products/dle-1l.html), documenting jackpot counts, starts between jackpots, total starts and state-responsive lamps. This is an original adaptation, not a replica of that product. Data is explicitly “今回の遊技”; no fabricated previous-day history, and RUSH is not relabelled 確変. Counts retain existing game semantics: starts are completed spins (including RUSH), jackpots count bonus entries rather than rounds; the graph remains stock minus initial stock, including supply and returns, explained in its expanded view. Game rules are unchanged. Local build, five viewport sizes (320×568, 390×664, 390×844, 1440×900, 844×390), both view modes and manual controls passed. Current normal screenshot inspected; a short viewport makes the board smaller to preserve complete device visibility. No cloud upload.
Data-lamp transition QA: local debug inputs exercised normal → RUSH → winning presentation → active 4R bonus. Waited for bonus entry (the pending win must not increment the lamp early). Screenshots `counter-rush.png` / `counter-bonus.png` inspected; fixed a CSS specificity issue that initially kept the rim cyan across states. Existing browser smoke passed play, pause, retirement, jackpot, skills, result and persistence. Native mobile hardware and sound were not assessed for this HUD change.

### 2026-09-26 ユーザー修正：装飾より釘・機構を優先
SAO Unity試作は装飾追加を保留。釘、左右の玉通路、入賞口、可動ギミック、右側アタッカーの構造照合を先に行う。初期表示は装飾非表示の構造確認モードとし、完成外観と構造一致を混同しない。現釘配置と右側機構は暫定実装で未照合。右下青薔薇は全体画像を参考にした装飾であり、アタッカー開口の再現根拠ではないため、薔薇上のATTACKER表示を撤去。後工程の明示差分：上部ロゴの形、神器の詰まった字間と中央の十字星。既存ルールや玉の物理パラメータは今回変更しない。



### 2026-09-27 — 月影機関・入賞から決着までのギミック

ユーザーの実装指示により、PlayCanvasの月影機関へオリジナル案を導入。入賞元と取得時のビルドを保留ごとに保持し、入賞→保留→発展へ光と印を引き継ぐ。追加玉系は援護射撃、入賞強化系は防壁、粘り系は受け流しから反撃。同じ敵の防壁に残る亀裂を狙い、斬撃時に左右の月蝕役物が合体、決着で開放／収納する。大当りの下部機関は告知済みR数だけに連動。既存の抽選、乱数消費、賞球、物理、コース別テンポは維持。外れ後の敵損傷持ち越しは未導入。SAO独立Unity版には適用しない。

実装・独立レビュー・修正の反復で、消化保留の誤った光跡、デモへの残存ID混入、結果時の残光、字幕と技名の重なり、復活前の777漏れを修正。復活前は表示用776、成立後に777。受入記録は `MOON_GIMMICKS_REVIEW.md`。ローカルのみ。

### 2026-09-27 — 右側球路とアタッカーの機構改善

ユーザーが右打ち改善の対象を「玉の通路・アタッカーなど右側の機構」と指定。月影PlayCanvas版の右ユニットへnative造形を追加。上部はLCDを塞がない側縁、下部は奥面と側壁、右始動口は取込みケースと軸、アタッカーは奥底と側面を作る。扉の表示とヒンジを実物理の接触端点へ同期し、閉鎖時の斜辺以下に背面扉を設ける。確率・賞球・接触形状は変更しない。部品プレビューでは始動口／アタッカー拡大と実球の単発・連続発射・停止・計数を追加。固定開閉の開発用画面であり、通常のラウンド制御とは区別する。クラウド未更新。詳細は `RIGHT_MECHANISM_REVIEW.md`。

### 2026-09-29 — PixiJSアタッカー接続例

ユーザー承認の代表部品試作として `/dev/attacker-pixi.html` を追加。提供された銀・金・青の意匠を簡略化したドット素材をケース／球路／開閉扉／玉に分割し、既存Physicsの実発射・衝突・入賞と同期する。部品内の画素基準は物理1単位=2画素。これはアタッカー試作限定で、全台の解像度・全素材の採用を意味しない。現行扉の接触線は開閉で基点と長さが変化するため、2状態の即時交換で一致を保ち、連続回転アニメを完成扱いにしない。実画面動画・座標仕様・検証結果は `reference-review/pixi-attacker/README.md`。本編外観・抽選・賞球・保存・物理パラメータは変更せず、クラウド未更新。

### 2026-09-29 — アタッカーの立体感・参照意匠の修正
提供パーツシート10を基準にPixiJS試作の固定枠を再作画。金の浮き彫り、中央星、銀の面取り、ケース右側面、暗い内壁と青い下皿を追加。描画だけの変更で、入賞・扉接触線は維持。`../../prototype/reference-review/pixi-attacker` に新しい実画面と約22秒の録画、v1に旧画面を保存。参照どおりの扉機構や全台完成の採用判断は含まない。

### 2026-09-29 — PixiJS部品試作の開閉アニメーション
ユーザー指示によりv2外観の扉へ伸縮収納アニメーションを追加。開放0.65秒・閉鎖0.5秒、途中逆操作と停止に対応。試作インスタンスだけ動的接触線を同じ姿勢に同期し、開放完了時に入賞受付。既存の本編物理とラウンド仕様への採用は含まない。動画と途中画像は `../../prototype/reference-review/pixi-attacker`。

### 2026-09-29 — アタッカー扉の解釈訂正
ユーザーの「四角形の一辺を固定し奥へ開く」意図に合わせ、PixiJS試作v3の伸縮方式を撤回。下辺固定の板が奥へ倒れる方式へ変更。固定ヒンジ、板面と装飾の投影、途中逆転を実装。試作の接触線は上端投影へ同期。本編へは未適用。

### 2026-09-29 — 上辺固定へ変更
ユーザー指定でアタッカーの固定軸を上辺へ変更。下辺が奥へ持ち上がる板扉とし、全開時は奥へ退いた扉の接触を解除。独立試作の変更。

### 2026-09-29 — 下辺接触を除去
上辺固定の扉の可動下辺には接触を設けない。独立試作では入口の固定線で閉鎖し、全開で解除。可動板の投影と入口判定を分離。

### 2026-09-29 — アタッカー自体の衝突を除去
ユーザーが「下の左下がりの坂で流れ、開放中は穴へ取込み、閉鎖中は坂から落下」と明確化。独立PixiJS試作の扉・入口障壁をすべて無効化。入口横断の取込みセンサーだけ開閉状態に連動させる。上辺固定の開閉表示は維持。v6の固定入口判定は撤回。

### 2026-09-29 — 扉寸法と収納位置
ユーザー指示により、独立PixiJS試作の扉を開口部の内寸に合わせ、上辺より上へ出る投影を撤去。全開で非表示。扉に隠れていた球路は前面表示へ変更。衝突なし・開放中だけ取込みという確定挙動は維持。

### 2026-09-29 — 右側面の張り出し削除
ユーザー承認により、PixiJSアタッカーの右側に張り出した台形側面を削除。開口内部の陰影と扉の開閉による奥行きは維持。

### 2026-09-29 — 樹脂ガイドへの位置合わせ
ユーザー指示により、独立PixiJSアタッカーのケース右下を縦ガイドと坂の接続点へ配置。穴中心・扉を同時に左16／下16物理単位移動。坂と縦ガイドの衝突位置は維持し、見た目を半透明樹脂へ変更。

### 2026-09-29 — 坂の奥にアタッカー配置
ユーザーの修正動画依頼に基づき、独立試作の穴を坂の奥へ移動。坂を左へ進む玉も取り込める開口内の領域センサーを使用。開閉条件・扉の非衝突・樹脂坂を維持。

### 2026-09-29 — 受け皿式への変更
ユーザー指定で下辺固定・手前に倒れる扉へ変更。独立試作のアタッカーを落下途中へ戻し、全開の扉に物理接触した玉を奥へ送る。上辺固定・全開非表示・扉接触なしの旧指定はこの方式では置き換え。閉鎖中は下の坂へ流れる。

### 2026-09-29 — 落下列の中央へ配置
10秒の実発射で受け皿付近y610を下降横断する73サンプルの中央値x357.45を確認。独立試作の受け皿中心をx358.25へ合わせるため、穴基準x343→361へ右18移動。高さ・扉機構・球路は維持。

### 2026-09-29 — ガイド内への収まり
ユーザー指定のはみ出し防止として、独立試作のケース・板を同比率で縮小。落下列中央を維持し、開いた受け皿の縁も右ガイド内へ収める。接触・取込みも同じ倍率で調整。

### 2026-09-29 — 左ガイドを移して中央配置
ユーザー指示により、アタッカー左上の斜め樹脂ガイドを独立試作内で左20移動し、表示と衝突を同期。左右出口の中央x354.5へ受け皿を配置。右ガイド・下の坂は維持し、はみ出しを防ぐ余白を確認。

### 2026-09-29 — アタッカー完成承認
ユーザーがv15（左ガイド移動・通路中央・下辺固定の受け皿式）を完成承認。以後の右始動口試作ではアタッカーの実装・見た目を変更しない。

### 2026-09-29 — 右始動口の確認用試作
ユーザー依頼で素材09を基準に銀の獣面・金枠・青い入口をPixiJSで再作画。既存の右始動口の誘導羽根・蓋の開閉端点を維持し、0.55秒の動作と実発射を接続。独立ページright-start-pixi.htmlで確認用動画を制作。アタッカー完成版には変更なし。右始動口の採用・完成承認は未確定。

### 2026-09-29 — 右始動口の銀の虎
素材09の獣は虎というユーザー訂正を反映。狼・装甲面風の表現から、丸耳・幅広い鼻先・額と頬の縞を持つ銀の虎へ再作画。右始動口の動作は維持。

### 2026-09-29 — 虎の表情を調整
右始動口の虎についてユーザーが格好良さ不足を指摘。丸みの強い表情を抑え、鋭い目・低い眉・牙・金属の陰影を追加。採用承認は未確定。

### 2026-09-29 — 銀虎の装飾統合
右始動口の虎をさらに厳つくするユーザー指示と、他の装飾に混ぜる指示を反映。暗い銀の顔、細い青眼、強い眉と牙に変更。星紋章・金の唐草・銀の接続飾りを周囲の枠と入賞口へ繋げた。

### 2026-09-29 — 右始動口素材の再制作
ユーザーの拡大参照を基準に、独自解釈の丸い虎顔を撤去。内蔵画像生成で細長い銀の虎・刃状の毛並み・金の額飾り・青い開口部を一体の素材として作り直し、PixiJSの固定ケースを置換。public/assets/right-start/silver-tiger-housing-v5.png。羽根・蓋と球の処理は別レイヤーで維持。ユーザーの採用承認は未確定。

### 2026-09-29 — 右始動口のドット絵再制作
ユーザー指示でv5の構図を保ち、輪郭と発光を粗いピクセル群へ整理して再制作。v6-pixel素材へ差替え。機構と配置は維持。

### 2026-09-29 — 右始動口の上方展開試作
ユーザー指定の「閉鎖時は小さく、上へ展開して口が開く」を独立PixiJS試作へ反映。v6ドット素材を上部・下顎・下ケースへ分割し、下端を固定して上部48px／下顎24pxを上へ移動。高さは従来172pxから閉鎖132px・開放180px。顔の拡大縮小はせず、下ケースへ重ねて収納。口内の暗部と元素材の頬・枠を間に描画する。既存の羽根・蓋・入賞センサーは維持し、虎の口への直接入賞ではなく開閉連動装飾として試作。採用承認は未確定。

### 2026-09-29 — 右始動口の旧蓋を撤去
ユーザー指示により、開放時に左下へ立つ旧入口蓋を独立PixiJS試作から撤去。閉鎖中も描画せず、全開閉状態でその接触判定を無効化。誘導羽根と虎の展開、開放時だけ受け付ける入賞センサーは維持。

### 2026-09-29 — 右始動口に受け皿を追加
ユーザー指定で完成アタッカーと同様の下辺固定・手前へ倒れる受け皿を右始動口の独立試作へ追加。旧左下縦蓋とは異なる板として配置。全開時の前縁接触を入賞条件とし、受けた玉を0.22秒で奥へ送る。途中・閉鎖中は受け皿の接触と入賞を無効化。虎の上方展開と同期。完成アタッカーには変更なし。

### 2026-09-29 — 虎の装飾を固定へ復帰
ユーザー指示により虎の口の開閉・上方展開を撤回。v6の一枚絵を元の96×172pxで常時表示し、顔・顎・青い内部の分割と収納を除去。受け皿の動作は維持し、板面を薄い透明樹脂表現へ変更して閉鎖中も元の装飾を見せる。

### 2026-09-29 — 装飾全体を受け皿にする構造へ訂正
ユーザーが「全体が前にせり出し、上部が受け皿の頭」と明確化。独立した透明板を撤去し、虎・枠・青い面を一枚の可動面として下辺固定で手前へ倒す試作へ変更。元の上辺が受け口の前縁となり、その投影位置と物理接触線を共用。開放時は背後の暗い穴が現れる。虎の顎自体は動かさない。閉じると元の素材全体が正面に戻る。

### 2026-09-29 — 右始動口の装飾位置を下げる
ユーザー指定で装飾と背面開口を物理30単位（描画60px）下げ、閉鎖時の虎の頭が既存入口y477付近に来る位置へ調整。下辺軸・可動上辺・受け止めセンサーも同量移動。誘導羽根と既存球路は維持。独立試作で入賞と閉鎖時の通過を再確認する。
位置移動のみでは取込みが低下したため、全開角度を72度から50.4度へ調整。下辺は下げたまま、開いた上辺を従来の取込高さ付近へ維持する。

### 2026-09-29 — 開いた隙間の奥へ取込み
ユーザーが「開いた分の空間の奥に穴があり、そこに玉が入って消える」と明確化。上辺接触後の玉を下辺へ移動していた表現を撤回し、上辺の奥（上方）の開口へ移動・縮小・フェードさせる。取込み玉を可動装飾より背面に配置し、装飾の面を流れる表示を避ける。

### 2026-09-29 — 電チュー付き始動口としての役割
ユーザーが実機と同じ役割を希望。右始動口を電チュー付き始動口として扱い、独立PixiJSページに「電チューの役割を実演（RUSH）」を追加。スルー→開放抽選→時間制限付き開放→始動入賞→既存Gameの抽選／保留／賞球を接続。単なる装飾開閉の20秒実演は別ボタンで維持。制御仕様と本編未適用範囲はMECHANISM_MIGRATION.md。

### 2026-09-29 — 新素材09の左右羽根式電チュー
ユーザー提供の新版09と配置一任に基づき、虎の可動面方式を撤回。金・青の固定円筒と銀・金の2枚の羽根を分離したドット素材を内蔵画像生成で制作。右打ちレーン下流、入口中心(363.5,493)へ配置。両羽根は下端固定で外側へ0.4秒で開閉し、羽根間から中央入口へ取り込む。全開時のみ始動受付。閉鎖・途中でも羽根の接触は有効。本体は常時固定。完成アタッカーは変更なし。元画像・プロンプトはpublic/assets/denchuとreference-review/pixi-right-start/tulip-prompt.txt。
配置検証で閉鎖時の残留玉を検出したため、試作の左ガイド下側をx336→338へ移し、入口をx359.5へ左4調整。左右の軸はx353/x366、開放先端x346/x373。閉鎖先端は中央で合流させて玉が乗る隙間を解消。40秒発射後30秒排出で残留0を確認。

### 2026-09-29 — 電チュー完成承認
ユーザーが現行の電チューを完成承認。新版素材09の金・青の固定本体と左右の銀羽根、右打ちレーン下流の入口中心(359.5,493)、左右羽根の開閉と中央穴への取込み、閉鎖時の通過幅を採用。独立試作で接続したスルー→普図抽選→開放→右始動入賞→既存抽選・保留・賞球の役割も維持する。以後、この部品の外観・配置・動作を無断で作り替えない。本編への組込みと通常時制御の未対応は別の残作業として保持し、今回の承認をそれらの実装完了とは扱わない。

### 2026-09-29 — 中央始動口の実働確認試作
ユーザー依頼で中央始動口素材v1を独立PixiJSページへ配置。既存の中央始動口(210,535)、入口幅20、釘と衝突判定を維持し、通常打ちパワー0.5で実発射。実入賞時だけ0.26秒で穴の奥へ縮小・消失する。手前の縁と内部の玉をレイヤー分離。入賞カウントのみの機構確認で、抽選・賞球・保存は接続しない。完成したアタッカー・電チューは変更しない。

### 2026-09-29 — 玉を基準にドット表現を統一
ユーザーが中央始動口試作の銀玉の粗さを好み、全台共通の玉を基準にする方針を指定。通常銀玉の既存28px絵をsilver-ball.jsへそのまま切り出し、今後の台素材はこの陰影密度・輪郭に合わせる。中央始動口から器の細部と色数を整理し、釘も滑らかな円から段階的なドット輪郭へ変更。全台の既存描画を一括置換した意味ではなく、アタッカー・電チューの完成形状と動作は維持する。

### 2026-09-29 — 玉との比較で装飾の密度を整理
ユーザーはv2のドット絵の雰囲気を評価しつつ、玉に比べて装飾が細かいと指摘。銀玉の寸法・画風を維持し、器の金網状の細線、小さい星、細かい台座装飾を減らす方向へ修正。解像度だけを下げるのではなく、太い縁・少数の支柱・大きな中央宝石へ意匠を整理する。

### 2026-09-29 — 既存部品のドット表現を共通化
ユーザーの「揃える」指示により、完成済みのアタッカー・電チューの独立試作を中央始動口v3と共通銀玉の表現へ整理。通常銀玉はsilver-ball.jsの28px素材を共用し、各試作のカメラ倍率に合わせた既存表示径19pxを維持。アタッカーは微細な唐草・鋲・重複した細い縁取りを除き、太い金枠と単一の青い宝石へ簡略化。電チューは内蔵画像生成でtulip-atlas-v2を制作し、太い支柱・少ない銀の面へ変更。電チューも描画解像度1・nearestへ統一。承認済みの部品位置、可動端点、開閉時間、物理判定・抽選は維持。本編全体の素材置換完了を意味しない。

### 2026-09-29 — 部品の画風統一承認と風車の試作
ユーザーがアタッカー・電チューのドット表現統一を「おけ」と承認し、次へ進むよう指示。次の確認対象として左風車の独立PixiJS試作を追加。共通銀玉と同じカメラ倍率3で、既存の位置(75,384)・半径18・4本の接触軸・物理回転角を描画する。金・青・銀の少ない色面で羽根と中心軸を構成。参照素材07の多枚羽根ではなく既存物理の4本に合わせた確認案であり、風車の外観自体は未承認。本編や完成部品の挙動は変更しない。

### 2026-09-29 — 風車承認と通常入賞口の試作
ユーザーが風車を「おけ」と承認して次へ進むよう指示。次の部品として左下の通常入賞口を独立PixiJSで試作。中央始動口v3の太い金縁と青い器を踏襲し、星を外して金の紋章にする識別案を内蔵画像生成で制作。既存位置(67,617)・幅19を維持。共通銀玉を使用し、入賞した玉のみを奥へ縮小・消失させる。通常入賞口の外観は未承認。試作はカウント確認のみで、賞球・本編接続の完了とは扱わない。

### 2026-09-29 — 通常入賞口承認と釘列の確認
ユーザーが通常入賞口を「とてもいい」と評価し、次へ進むよう指示。中央始動口・通常入賞口・風車の試作で使っていた14px釘素材をpin-texture.jsへ共通化し、絵自体を保ったまま参照を統一。次の確認用に振り分け釘・寄り釘・道釘の実発射プレビューを追加。共通銀玉28pxとカメラ倍率3を使用し、釘の位置・半径・反発は変更しない。釘列の試作は未承認。

### 2026-09-29 — 釘列承認と下部球路・OUT口の試作
ユーザーが釘列を「おけ」と承認し、次へ進むよう指示。次の部品として下部の左右樹脂ガイドとOUT口の独立PixiJS試作を追加。既存out-left / out-rightの位置・半径・反発、outlet(210,668,w68)とy675以降の回収処理を維持。共通銀玉、太い透明樹脂の縁・側面、金属枠と暗い回収穴をコードからドット描画。回収後に短い落下表示を加え、手前の縁で玉が隠れる。外観は未承認。本編への球路素材の反映はまだ行わない。

### 2026-09-29 — OUT口承認・樹脂ガイド単体確認
ユーザーがOUT口を承認し、樹脂ガイドだけの表示を希望。完成したOUT口は維持。resin-pixi.htmlで既存の左右ガイドの全長を同一倍率3で上下に並べ、OUT口や装飾を隠す。初期表示は玉なし、任意で実発射の玉を表示。素材の形・厚み・色や物理の変更はなく、表示範囲と並べ方のみ変更。樹脂ガイドの外観は引き続き確認中。

### 2026-09-29 — 樹脂ガイドの取付けネジ
ユーザーがガイドの浮遊感を指摘し、ネジ追加を提案。左右各ガイドの両端寄りに、盤面側へ張り出す小さな取付け部と銀色の十字ネジを追加。玉が走る上縁を避けて下側に配置。ネジと取付け部は盤面側の装飾で、新しい衝突判定は追加しない。ガイド単体と下部球路の共通描画をresin-guide-art.jsへ整理。確定したOUT口の形状と既存物理は維持。

### 2026-09-29 — ネジ付き樹脂ガイド採用と発射レーン試作
ユーザーがネジ付きガイドの採用について確認し、採用案とする返答後に次へ進むよう指示。ネジ付き樹脂ガイドを採用案として記録し、盤面に組み込んだ際の馴染みを後で確認する。次の部品は発射口・発射レーンの独立PixiJS試作。既存の左打ちパワー0.5、発射点(29,652)、金属レーンの接触線を維持。共通28px銀玉・金属の段階的陰影・通路外の取付け部とネジを描画。発射口10秒、上端10秒、5秒排出の動画で確認。外観の採用承認は未確定。本編の発射や物理は変更しない。

### 2026-09-29 — 発射機構を見せる試作の訂正
ユーザーが実機では発射瞬間や下から打ち上げる通路が見えず、盤面外から入る玉を見る点を指摘。内部機構の可視化を遊技者視点として提示した前案を撤回。launcher-pixi.htmlを盤面上部の固定開口だけを描く確認画面に変更。下部発射装置・上昇レーンの描画はなくし、玉と釘を同じ開口でクリップして枠の裏から現れるようにする。発射点・速度・軌道・衝突判定は変更しない。上昇・下降速度を理由に表示を切り替えず、固定の枠による遮蔽を使う。周囲の枠は確認用の仮枠で、筐体素材の確定を意味しない。本編の表示切替は未適用。
参考資料: JP6195742B2（前面扉に隠れる下部発射装置）、JP2004313429A（前面枠に一部が覆われる誘導レール）。機種によって見える範囲は異なり、すべての実機で上昇玉が完全不可視と断定しない。

### 2026-09-29 — 盤面への玉の入り方を承認
ユーザーが遊技者視点への修正を「おけ」と承認。発射機構と上昇レーンを見せず、固定した枠の裏から玉が盤面へ入る表示方針を採用。内部の発射計算・軌道・衝突判定は維持する。この承認は表示方針に対するもので、確認用の簡易枠を最終筐体素材として確定したり、本編への組込み完了を意味したりしない。

### 2026-09-29 — 確定部品の盤面統合試作
ユーザーの「次」指示で、玉・釘・風車2基・中央始動口・通常入賞口3か所・電チュー・アタッカー・樹脂ガイド・OUT口をboard-pixi.htmlへ統合。個別試作の確定素材を再利用し、盤面座標へ同じ縮尺で置く。発射機構は描画せず、筐体の仮開口で玉を隠す。液晶・背景・筐体装飾は未統合。

個別試作ではright-inner-lowerを電チューが上端x336/下端x338、アタッカーが上端x327.486/下端x330としていたため、そのまま併用できなかった。統合版だけ上端(336,468)→下端(330,558)の共通ガイドとし、電チュー入口x359.5とアタッカー中心x354.5（pocket.x357.25）、開閉端点・時間を維持。通常→電チュー→アタッカーの順で各12秒、36秒後停止して排出する。共有ガイド調整は今回の統合案であり、個別完成版の定義は変更しない。

これは部品の位置・重なり・流れを確認する機構統合。電チュー開放は確認用切替で、本編の抽選・賞球・保存は未接続。統合版の採用は未承認。

### 2026-09-29 — 盤面部品の統合表示を承認
ユーザーが「全体は問題ないです！」と承認。直前に説明した確認範囲に基づき、統合した部品の玉に対する大きさ、ドット表現の統一感、部品の重なりと開閉・取込みの見え方を採用する。統合版の共有右側ガイドを含む現行の部品構成を今後の作業の基準とする。釘の最終配置・入賞率、一般入賞口の最終的な数と配置、液晶・背景・筐体装飾、抽選・賞球・保存の接続は、この承認によって確定・完了とは扱わない。

### 2026-09-29 — 液晶背景と周囲枠の確認案
ユーザーの継続指示で、提供素材表13の銀髪の人物・月・城を参照し、中央始動口v3の粗い色面を画風の基準として液晶背景を内蔵画像生成で新規制作。lcd-pixi.htmlで盤面座標(108,236)、210×140へ仮配置し、コード描画の金枠と四隅の青い宝石を付けた。暗い内縁と明るい下縁で奥行きを付け、右風車を避ける高さに調整。液晶は物理部品の後ろで、衝突判定を持たない。
従来の部品統合版board-pixi.htmlを比較用に維持。完成済み部品・釘位置・物理・抽選ルールは変更しない。液晶に重なる釘は次の配置調整対象。今回は背景と枠の位置・大きさ・画風の未承認案であり、図柄・保留・変動演出・ゲーム本編接続の完了とは扱わない。新しい検証画像・動画はreference-review/pixi-lcdへ保存する。

### 2026-09-29 — 液晶前を通さない球路へ訂正（ユーザー指示）
ユーザーは通常打ちで液晶の左、右打ちで液晶の右を流れ、画面前を横切らない構成を指定。前項の液晶を無衝突の背景として置く案を撤回し、lcd-pixi.htmlに囲いの実衝突判定を導入。表示と物理はlcd-layout.jsの共通外周座標を使用。上部を左右へ下る庇とし、左右・下辺も囲う。玉を描画で消す処理は使わない。
液晶と庇周辺の釘を除き、左風車は中心x75→63に変更して左枠との詰まりを解消。左下へ(84,405)→(166,470)の樹脂ガイドを追加し、近接して玉を挟む道釘を除いた。中央始動口・電チュー・アタッカーの位置と開閉は維持。通常の主流は左、右打ちは右で、玉同士の接触による通常打ちの少数の右への逸れは強制補正しない。
通常／電チュー／アタッカーを各40秒発射し、各物理ステップで玉の半径を含め液晶矩形への侵入0を検証。各入賞と閉鎖・停止後30秒以内の全玉回収を検証。新規3件と旧盤面2件のテスト、ビルドを通過。入賞率の確定、本編の抽選・賞球・保存への接続は別作業。過去の「玉が液晶前を流れる」方針よりこのユーザー指定を優先する。

### 2026-09-29 — 三角庇から密な上部釘列へ（ユーザー写真に基づく訂正）
ユーザーは「屋根というより釘で上を覆うように隙間なく埋まっている」構成を提示。液晶上の三角板とその2本の直線衝突面を撤去。上部を57本の共通釘で弧状に覆い、実際の釘衝突で玉を受ける。中心間隔は約4〜4.6、釘半径2.1、玉直径9.2で、隣り合う釘間を玉は通れない。左右・下辺の液晶囲いは維持する。
釘の反発で通常打ちが右へ逸れる割合が増えたため、液晶確認版だけ通常発射強度を0.5→0.46へ調整。発射後の玉を強制的に左へ動かす処理はしない。右打ちは1のまま。左下の樹脂ガイドと部品配置は前案を維持し、この釘列案の承認待ち。画像と物理が同じ釘位置を参照する。最新動画はreference-review/pixi-lcd/lcd-pins.mp4。

### 2026-09-29 — 装飾枠そのものを球路の境界にする確認案
ユーザーが特別な密集釘や遮蔽物の追加を否定し、既存の液晶装飾枠が手前へ張り出して玉を遮る構造を指定。57本の追加釘を撤去し、三角屋根も復活させない。金色の上縁を中央で9だけ高い緩い曲線にし、その縁と左右・下辺の共通座標に衝突判定を付ける。液晶上方の元の振り分け釘（y200以下の既存位置）は戻し、追加の遮断専用釘は配置しない。
通常強度0.46と右打ち1を維持。40秒の通常単独確認で左通過248／右通過96となり、左が主流だが右へ逸れる割合は未調整。液晶への侵入0・停止後全玉回収・入賞は検証済み。テストの通常左右比は旧密集釘案の20倍から、左を主流とする2倍へ改めた。旧比率達成とは報告しない。左下樹脂ガイドは今回は変更しない。最新動画lcd-frame.mp4で枠の見え方を確認する案であり、最終球路の完成とは扱わない。

### 2026-09-30 — 発射密度・共通軌道・ヘソまでの球路を見直す
ユーザーの動画評価を基本的に採用。液晶確認版の発射周期を0.1秒から0.6秒へ変更し、両モード共通の(29,652)から発射。内部の発射装置・下部の上昇レーンは隠し続け、盤面上部までカメラと開口を広げて左から上部を横切り右へ届く過程を表示。ユーザーの従前の「発射装置は見せない」方針と両立させる。
密度に依存していた球同士の衝突が減るため、液晶確認版のみ共通発射偏向面の終点y90→70、通常強度0.44／右強度0.8に調整。弱打ち・強打ちで同じ物理経路を利用し、発射後に座標・速度をコースへ強制補正しない。既存の部品単体・board比較版の発射周期は維持。
長いlcd-feed樹脂ガイドを撤去。ヘソの位置をy535→480（x210維持）へ上げ、命釘y467、左右道釘を(90+14n,407+5.5n)と左右反転で配置。n4を抜いてこぼれを作り、詰まりを起こす旧ジャンプ釘は今回の案から外す。液晶の絵・サイズ・装飾枠、右の完成部品は維持。液晶下ステージ・ワープはまだ追加していない。入賞率・道釘の最終調整は未確定。
確認動画は通常・電チュー・アタッカー各24秒の等速再生。LCD侵入なし、左右の流れ、各入賞、停止後回収、発射間隔と共通発射元をテスト6件で確認。最新動画reference-review/pixi-lcd/lcd-tempo.mp4。ゲーム本編の発射周期や抽選・賞球・保存への接続は対象外。
参考: Sammy「初めてのパチンコ」https://www.sammy.co.jp/japanese/zero-pachi/howtopachi.pdf（右打ちはハンドルを回して強く発射）。0.6秒は今回ユーザーが提示した確認基準として採用。

### 2026-09-30 — 盤面比率・曲線発射レール・右上流誘導
ユーザーの比較レビューを採用し、優先度の高い盤面・軌道・受け渡しを改修。LCD確認版の表示高さを690→560へ戻し、盤面上部は中心(210,415)、半径(188,265)の曲線外レールで囲う。内レールは半径(174,251)、出口215度。同じ発射点(29,652)から両モードを発射し、上昇の専用通路を描く一方、発射装置自体は下端で隠す。上部にあった長い放物線用の空白を縮めた。余分な右外側余白は実球路の外周へ合わせて除いた。球や素材を縦横別倍率で潰していない。
発射強度は通常0.24、右0.6。周期0.6秒、重力690、等速時間、既存開閉時間を維持。レールが通る位置の釘は除外し、既存風車・道釘・ヘソの受け渡しを再確認。風車は衝突トルクと減衰、材質別反発、速度依存サブステップは既存実装に存在した。
右の上流ガイドは入口をy340へ下げ、外周レールからの玉を妨げない位置へ変更。右外側ガイドはy510からx370へ絞ってアタッカー受け皿へ渡す。個別承認済み扉・センサー・入口の形は変更しない。単独30秒の右打ちは電チュー47/50、アタッカー47/50。これは固定テスト条件の値で最終入賞率ではない。
ストレス検証: 要求間隔0.6/0.1/0.05/0.025秒を各モード30秒、その後閉鎖・45秒排出。全12条件で液晶侵入0、計数保存、過大な速度増加なし。0.1/0.05秒要求では全玉排出。ただし通常打ちは戻り玉で発射安全待ちが入り、実発射は7.03/13.57玉毎秒。0.025秒要求の通常打ちは実23.13玉毎秒で停止後21玉残留したため不合格・未解決。右打ち2条件は実40玉毎秒でも排出。レート上限やステージ別値は未確定で、高速対応完了とは扱わない。
最新の動画lcd-round.mp4、stress.json、REVIEW-2026-09-30.mdを参照。ワープ・ステージ採用、遊技開閉制御の接続、質感と音、左側の最終配置と高密度の戻り・詰まり対策は残る。

### 2026-09-30 — 左道釘の終端調整・強弱比較・部品の取付表現
ユーザーの「お願いします」で、右球路・速度・発射周期を維持し、左道釘の最後3本を左6／下8へ調整。新設left-route-metrics.jsで物理を変更せず、道釘接触、ヘソ近傍到達、命釘接触後の非入賞、途中落ちを記録。強度0.22〜0.26で各120秒を変更前後比較。0.24の近傍到達52→69、0.25は15→34。入る・直前で外れる・途中でこぼれる結果が残る。強さ0.22は戻り玉58/160があり、全強度で同じ性能とは扱わない。
確認ページに0.20〜0.28の通常強度スライダーと拡大カメラ、経路集計を追加。強さ変更は次の発射からで、既存玉や右打ちに影響しない。右ガイドは既存当たり判定の非走行側へ側面を描き、液晶枠には内側の面分けと右下の影、入賞口には台座・固定ネジ、下部には取付板とOUTの明るい縁を追加。表示のみの部品を衝突物にしない。共通銀玉は維持。
左全体の幅や筐体最終形は未確定。詳細と動画はreference-review/pixi-left-finish。既知の0.025秒要求時の通常打ち残留問題は本変更で解決したと扱わない。

### 2026-09-30 — 右通過ゲートを追加
ユーザーの継続指示でLCD確認版の右ガイド上部y370に通過センサーを追加。既存ガイドの外側に金色・紺の固定部とネジ、青い検知灯を描き、上下が通り抜けられる構造とする。センサーの左右344〜379を玉全体が下向きに横切ると1玉1回計数し、0.18秒点灯。玉の回収・賞球・開放抽選は行わない。既存ガイドの曲がりと衝突形状を維持し、不要な障害物は追加しない。
右打ち両閉鎖モードと右側拡大カメラを追加。開閉は部品確認用の手動操作で、本編の電チュー開放条件とは未接続。0.6秒と0.05秒要求間隔の閉鎖／電チュー／アタッカー各条件で、ゲート有無の全玉状態・入賞数一致、停止後排出・計数保存を確認。既知の0.025秒通常打ちの残留問題は対象外で、解決扱いしない。検証動画はreference-review/pixi-pass-gate。

### 2026-09-30 — 左経路集計の明確化とヘソ入口の視認性
ユーザーの左打ち動画レビューを受け、保存済みの33到達を入賞10・命釘接触後非入賞9・命釘接触記録なし非入賞14と確認。従来表示はnearMissを省略していた。「直前の釘で外れた」は因果の断定になるため「命釘に接触・非入賞」へ訂正。命釘接触記録なし非入賞を表示し、発射時の強度ごとに到達・入賞・非入賞を集計。近傍内の未回収玉nearPendingとnearAdmittedを追加し、到達の内訳が稼働中も一致することを検証。非入賞後の一般入賞・OUT等の結果も今後はJSONへ記録。過去14玉の最終行き先内訳は未記録のため断定しない。
風車直下の最初3本を(90,407)/(104,412.5)/(118,418)から(84,406)/(100,411)/(116,418)へ寄せる比較案は、0.23/0.24/0.25各200玉でヘソ到達122/69/34→0/0/1と悪化したため不採用。現行の物理配置は維持。外観は入口の暗部・明るい前縁、命釘の暗い輪郭背景だけを追加。銀玉素材や右経路は維持。今回の記録reference-review/pixi-left-entry。釘調整の完成・目標入賞率の確定とは扱わない。

### 2026-09-30 — PixiJS通常変動の最初の接続
ユーザーの演出着手指示でlcd-play.htmlを追加。現行盤面のヘソ入賞だけを既存Game.enqueueDrawへ渡し、Game.tick/reelStateを再利用する確認アダプターを作成。既存の保留5個＋変動中1、2.2秒から左停止・0.55秒間隔の中央/右停止、ハズレ0.85秒保持を継承。機構確認版lcd-pixi.htmlは変更対象と分ける。
今回は通常ハズレの一連の表示を確認するため、確認専用の決定的乱数系列（0.15〜0.85）を使用。本編の抽選確率は変更しない。賞球・チケット・プロフィール保存・ステージ進行・当り演出・右打ち自動連携は未接続。Game自体に結果を書き換える変更はしない。長時間の天井到達は通常確認範囲外。
構図：背景の人物・月は上半分へ残し、下部に金縁の数字3列、最下段に青い保留珠5個と変動中の菱形。図柄はコードで描いた粗い字形と段階的な金属陰影、縦移動し、停止直前に減速。通常ハズレでは大きな失敗文字や派手なフラッシュは置かない。背景の人物を揺らして新規作画の代用にしない。音は今回未実装。
タイムライン：実入賞→即変動（変動中なら保留追加）→2.2秒左停止→2.75秒中央停止→3.3秒右停止→0.85秒保持→次保留、なければ停止図柄維持。一時停止・ページ非表示は既存の物理時間と一緒に凍結する。
確認動画・新しい実装画像はreference-review/pixi-normal-spin。既存機構の物理位置・速度・玉素材は維持。見た目の採用は確認待ち。

### 2026-09-30 — 通常リール採用・短いハズレリーチ確認
ユーザーが液晶リール演出を「いいと思います」と承認。通常図柄のサイズ、縦移動、左→中央→右の停止と保留表示を基準として維持する。
続く指示でlcd-reach.htmlを追加。2回目の受理抽選だけ、確認用乱数のリーチ判定を固定し、既存Gameで7・7の停止を成立させる。本編Gameの確率や演出パターンは変更しない。短い通常リーチの見た目確認として、このページ内だけ戦闘部分を省き、告知2秒を含む計4.4秒で右図柄を減速停止。左・中央は7で固定、右は保存された外れ結果へ止まり、既存0.85秒停止後に保留消化を再開する。
白銀のドット書体「リーチ」を液晶上部の紺の帯へ表示。0.18秒で出現、2秒で退出。図柄・人物・保留を主役から外す全画面フラッシュは入れず、通常変動の位置・素材を維持。右図柄の動きは告知開始前の位置から継続し、停止値へ減速。音・戦闘・当りは本変更に含まない。将来の本編通常リーチの発展率・長さを確定するものではない。
リーチ中の保留保持、左・中央固定、右変動、一時停止、外れ結果と0.85秒停止、後続保留への復帰をテスト。実入賞での動画と画像はreference-review/pixi-basic-reach。

### 2026-09-30 — リーチ告知を中央の大文字へ変更
ユーザーが「ど真ん中にリーチってどん！」と指定。上部の控えめな帯から、液晶中央(105,70)に図柄へ重なる48pxドット文字へ変更。登場時は1.24倍から0.1秒で着地し、短い反動と0.2秒以内の微振動を付ける。2秒の告知時間、右図柄変動、停止結果、保留消化は維持。液晶領域でクリップし、筐体へはみ出さない。音は引き続き未実装。新しい録画はreference-review/pixi-reach-impact。

### 2026-09-30 — 中央リーチ採用・当たり告知から右打ち案内
ユーザーが中央へ「ドン」と出るリーチを「おけ、次」と承認。告知位置・サイズ・短い着地動作を採用し、次にlcd-win.htmlを追加。2回目の実入賞を確認用の当たり系列とし、受理時の既存Game.createDrawでwinRollを0にして結果を保存。表示時の再抽選や本編の確率変更は行わない。
右図柄まで777で停止→0.45秒揃いを見せる→中央の金色「大当り」→確定から2.8秒後に上部の「右打ち」と矢印へ移る。通常リールと採用済み中央リーチを維持。控えめな金の粒を確定時だけ表示する。音は未実装。
今回の確認アダプターは当たり告知後、保留とラウンド状態を保持して案内を表示し続ける。Game本編のアタッカー・出玉・保存を接続した完成版とは扱わず、既存の物理試作へ当たり演出の表示を組み合わせる範囲。録画では案内後に発射停止して残玉を排出。実測はreference-review/pixi-basic-win。既存通常・ハズレリーチと当たり保持を合わせた4テスト、およびビルドを確認。

### 2026-09-30 — 当たり確定777の虹色・同期傾斜を強化
ユーザーが戦闘部分を後回しにし、最後の当たり表示をもっと派手にするよう指定。縦軸方向の傾き、3つ同方向の揺れ、7の虹色発光を追加。確定後は専用表示へ移り、通常より大きい3枚の7を、共通の時計・位相による横縮尺＋スキュー＋小さな回転で疑似立体表示。側面の暗部を添え、数字面は6色帯が流れるテクスチャ差分を9段階/秒で切替。文字や画面全体の明滅ではなく、数字面の色変化と背後の低透明度の放射光で強調する。
確定1.8秒まで777を主役にし、中央へ大きい「大当り」を出してから下方へ移動・縮小し、777を隠し続けない。5.8秒後に右打ち案内。通常図柄・リーチ・当落結果・保留保持は維持。音・戦闘・アタッカー連動は本変更の対象外。新規録画と確認画像はreference-review/pixi-rainbow-win。

### 2026-09-30 — 777確定後の「大当り」文字を撤去
ユーザーは虹色777の質感を評価しつつ、揃ったあとに「大当り」と文字で告知する流れは違うと指摘。確定後の中央および下段の文字帯を撤去し、同期傾斜・虹色・放射光の777自体を当たり表示とする。採用済み「リーチ」告知は維持。5.8秒後の右打ち案内と、抽選・保留・確認アダプターの処理は変更しない。新録画はreference-review/pixi-777-only。

### 2026-09-30 — 右打ち案内・アタッカー・ラウンドの連動確認
ユーザーの承認でlcd-bonus.htmlを追加。既存の確認用当たり→虹色777→5.8秒後の案内に、右打ちの自動操作とラウンド制御を接続。案内1.2秒後に扉を開き、開き切ってからラウンドの15秒時計を進める。入賞10個または15秒で閉鎖し、0.5秒で閉じ切ってから既存設定0.65秒の閉鎖待機、次ラウンドを開く。10個目で直ちに受入判定を閉じ、高密度でも同じラウンドへ余分に計上しない。
既存Game.tickとGame.hitのラウンド判定・賞球計算を利用。強化なし1入賞15玉、10入賞150玉。LCDにはROUND、入賞数/10、払出累計、開閉状態を表示する。払出は発射分を差し引いた差玉ではない。この機構確認は独立Gameに旧ステージ進行とチケット確定を走らせず、保存しない。本編への全機能移行・RUSH接続の完了とは扱わない。
当たり告知中の通常保留は維持。開放時間は開き切った時点からで、開閉アニメーション中に消費しない。最終ラウンド後は閉鎖して確認終了状態とし、RUSH遊技への自動連動は後続作業。電チューは今回閉鎖を維持。自動右打ちは確認用操作で、本番の手動・自動操作仕様の確定ではない。
検証：実球の10入賞・150払出・完全閉鎖・次ラウンド開放、15秒無入賞終了、一時停止、0.05秒要求時の10個上限と二重払出なし。既存通常/当たり/リーチも回帰確認。動画・新規画像・記録はreference-review/pixi-bonus-round。

### 2026-09-30 — リーチは中央待ち、演出復帰後に中央だけ高速拡縮
ユーザーの新指示を優先し、リーチの表示停止順を左→右→中央へ変更。旧「左と中央が揃って右待ち」は本表示では撤回。既存Gameの保存結果・当落・保留・消化数は変えず、確認表示で列0/2/1へ対応付ける。通常の非リーチ変動の採用済み表示は維持。
中央リーチ告知2秒の後、図柄を全面で隠す2.4秒の月光カットへ入り、戻ったフレームで7・7・7または7・別数字・7の保存結果を提示する。戦闘作画はまだ後続であり、今回は月と収束する光による短い接続演出。
当たり復帰から0.18秒後、中央の7だけ約6回/秒で最大3.5倍まで拡大縮小。約2.05秒で通常サイズへ完全復帰。左右は通常位置・通常倍率のまま動かさず、以前の3枚同方向の揺れは本指定で置換。虹色と放射光は維持、「大当り」文字は戻さない。告知後5.8秒で右打ち案内、ラウンド連動の時刻は維持。一時停止は既存ゲーム時計に同期。
当たり・ハズレの列対応、保存結果の一致、保留保持、高速拡縮の回数と終端倍率、既存ラウンドを8テストで確認。新しい実装動画・画像はreference-review/pixi-centre-reveal。

### 2026-09-30 — 確定時の拡大は3リール連動へ訂正
ユーザーが「中央しか液晶に見えないくらい拡大」「3つのリールが連動」と再指定。中央1枚だけの拡縮を撤回。3枚を共通コンテナに置き、中央図柄中心(105,89)を支点として配置間隔・3枚のサイズを同率で拡縮する。最大6倍で左右の図柄は液晶外へ出てクリップされ、中央の7だけが画面に残る。約6回/秒の拡縮と約2.05秒で倍率1へ戻る時間は維持。個別カードの倍率はすべて1/3のまま。虹色、月光カット、中央待ち、当落判定、右打ち・ラウンド制御は変更しない。
ピーク時に左右が画面外になる範囲、3列の結果対応、終端倍率を検証。新録画はreference-review/pixi-linked-zoom。

### 2026-09-30 — 6倍へ一度だけ寄り、0.5秒保持
ユーザー指定で高速の反復拡縮を撤去。確定0.18秒から0.08秒で3リール一体を6倍にし、0.26〜0.76秒の0.5秒間、倍率を固定。0.25秒で通常サイズへ一度だけ戻す。保持開始に0.5秒のオリジナル合成確定音を同期。操作で音声を有効化し、一時停止・非表示時は音も止め、再開時はゲーム時刻に対応する残り部分を再生する。右打ち案内とラウンド開始時刻は維持。新規確認動画はreference-review/pixi-zoom-hold。

### 2026-09-30 — 確定図柄の停止を1秒へ延長・演出採用
ユーザーが停止を1秒へ延長する条件で本演出を承認。3リール一体の6倍拡大を0.26〜1.26秒まで保持し、0.25秒で戻って1.51秒に通常倍率へ復帰。拡大速度・反復なし・既存の短い効果音は維持。効果音は停止開始から0.5秒で終了し、追加の0.5秒は図柄を保持する間とする。

### 2026-09-30 — 右側を折り返しのある樹脂通路へ
ユーザーが「単なる仕切りではなく玉の通り道」「右に寄せるなど楽しい動き」を指定。LCD試作の右上〜電チュー直前に、スルー通過後に左へ滑り、次の斜面で右へ折り返して電チューへ落とすS字の溝を追加。right-resin-route.jsの左右境界を表示と物理で共有し、暗い底面・側面・明るい縁・固定ネジを描く。方向を変える速度の強制代入や吸い込みは使わず、低反発の樹脂境界への接触で誘導。既存電チューとアタッカーの形状・開閉は維持。確認用の右拡大表示は通路入口からアタッカーまでが見える範囲に変更。
初期0.6秒と高レート0.05秒で、同一玉が左へ曲がった後に右へ曲がること、通過ゲートの計数、全玉の排出・計数一致を確認。既存ゲート・ラウンド10テストと追加通路2テストが成功。実表示の画像・動画はreference-review/pixi-resin-route。
追加の限界試験：0.025秒要求では20秒発射・30秒排出後、電チュー試行に1玉残留。全発射が右へ届かない例もあり、このレートの安定動作は未達。初期と0.05秒の成功を最大レート保証にはしない。

### 2026-09-30 — 右通路を直角の折り返しへ
ユーザーの「90度に曲げれない？」を受け、S字の長い斜面を、落下→左向きの横通路→落下→右向きの横通路→電チューへ落下する段付き形状へ変更。液晶下の空間へ折り返しを広げる。角には短い面取りを設け、横通路の底はわずかに下げ、自然な衝突と重力で転がす。完全に水平な棚や瞬間的な速度変更にはしていない。描画と物理は引き続き同じ頂点から作る。
最初の案は0.05秒発射で角に残玉が出たため、最初の折り返しの床を8px下げて内側の余裕を確保。修正後は0.6秒・0.05秒で同一玉の左右折り返し、発射停止後の全玉排出、計数一致を確認。新規録画はreference-review/pixi-right-angle。0.025秒の上限レート保証は引き続き未実施。
追試で0.05秒の電チュー開閉後、通路入口と液晶枠の隙間に1玉が残るケースを確認。入口の左縁を液晶枠へ斜めに接続し、玉径より狭い隙間へ落ち込む箇所を解消した。右通路の横区間だけでなく、この入口接続にも同じ描画・衝突形状を使用する。
入口修正後、通路・スルー・ラウンドの12テストすべて成功。ビルド成功。動画も入口修正後の実装で再撮影。

### 2026-09-30 — 手前の横通路から奥の電チューへ渡す
ユーザーが3候補のうち「手前の横通路→奥へ落とす」を採用。右通路に前後の深さを定義し、玉と通路の頂点を同じ投影で表示する。スルー下から手前へせり出し、横へ転がる部分で最大24盤面単位の張り出し、出口の30単位区間で奥へ戻り、電チューの手前で盤面座標へ連続的に接続。玉サイズは固定。前縁は玉より前へ描き、玉の下端や出口を一部遮蔽する。支持金具・側面・影で盤面から離れた棚として見せる。電チューを通過した玉にはアタッカーへ続く通路底面も追加。
物理は2.5D方式：通路の展開面で既存の重力・衝突を解き、前後の深さはその面の形状に従う。任意の3D空間の自由運動や交差する別階層の物理を新設したものではない。横幅を拡張した試案は高レートの混雑を増やしたため、安定確認済みの幅へ戻し、奥行きと遮蔽を追加。電チュー・アタッカーの形と開閉は維持。
左右への実移動・初期と0.05秒間隔の排出、スルー・ラウンド、深さの連続性と停止同期を合計14テストで確認。実表示の新規証拠はreference-review/pixi-depth-route。最大レートの保証は引き続き別課題。

### 2026-09-30 — 通路は縦横を整列し、90度の角だけ丸める
ユーザーが入口の斜めの絞り込み、継ぎ足したような不揃いな角度を指摘。曲がる方向は90度のみ、転がるための小さな丸みは許容と明示。中心線の縦・横区間から一定幅20の左右壁を生成し、90度の接続に中心半径14の四分円を使う方式へ変更。入口はx359〜379の真っ直ぐな溝とし、斜めの漏斗と追加の斜め板を撤去。床の不揃いな三角パネル、斜めの支持金具を整理し、連続した底面と縁、整列した固定耳へ統一。
奥行きは維持するが、投影の横ずれを廃止。手前へ出る／奥へ戻る深さ変化を縦の直線区間に限定し、水平区間と四分円を歪めない。スルーの表示位置も同じ投影に合わせる。出口は閉じた電チューの上に逃げ道を残す高さで終了させる。
通常速度・0.05秒間隔の同一玉の左右移動と排出、深さ連続性、停止同期を確認。新しい実動動画と画像はreference-review/pixi-clean-route。

### 2026-09-30 — 電チュー上を開いた空間と逆ハの釘に変更
ユーザーが電チュー周囲に少し開いた空間と逆ハの字の釘を希望し、そのための上流通路の直線化・短縮を許可。上流はx359〜379、y310〜400の短い直線溝へ変更。折り返し棚を撤去し、入口の小さな奥行きはy400までに盤面へ戻す。電チュー上は左右壁x326〜395の広場とし、左右3本ずつ、上が広く下が狭い釘を追加。中心線は概ねx359。釘と表示は同じPhysics.pinsを使用し、実際の接触で進路を変える。
最初の狭い案では右の釘と壁の間に玉が残ったため、広場の右側を16px広げ、盤面開口と下流ガイドも同じ位置へ合わせた。玉が釘の外側へ出た場合も閉鎖中の電チュー横を通り、アタッカーまたはOUTへ流れる。電チュー自体の開閉・素材は維持。新規動画・静止画・計数はreference-review/pixi-denchu-pins。旧左右折り返しを要求するテストは本指定に合わせ、逆ハの釘への実接触と排出の検証へ更新。

仕上げで釘を左右4本ずつへ変更。途中の隙間からの抜けを減らしつつ、最下段の釘間隔は24まで広げて、高レートの玉同士の詰まりを防ぐ。上段は40、下段は24の間隔で逆ハの形を維持する。

### 2026-09-30 — 電チュー左の樹脂を内側へ絞る
ユーザー指定に合わせ、電チュー左の樹脂をy448〜500でx326から340へ右に傾け、その下はx340で下流へ接続。逆ハの釘から電チューへ向かう空間を左側から少し絞る。描画と当たり判定は同じ線分を使用し、下流の床の左端も合わせる。釘、電チュー、上流の短い直線溝は維持。
通常0.6秒・高レート0.05秒の排出、スルー検知、ラウンド制御の12テストとビルドが成功。今回の実表示の証拠はreference-review/pixi-denchu-taper。

### 2026-09-30 — 右打ち入口からOUTまで樹脂を接続
ユーザー指定により、短い入口溝と電チュー広場の左上を接続し、電チュー左の絞りからアタッカー横、下部の排出斜面、OUT口まで連続する内側ガイドを追加。外側は既存の形を維持し、OUT口まで最後の縦縁を延長。底面も同じ頂点に沿う一続きの形へ変更した。電チュー・アタッカーの位置と開閉仕様は維持。
盤面合成時だけアタッカーの試作用の矩形背景を透明にして、部品周囲の通路を隠さない。単体プレビューの背景は維持。
0.6秒と0.05秒間隔で全玉排出・計数一致・右の閉鎖時の全玉がOUT口内(x218〜244)へ到達することを確認。スルー・ラウンドを含む12テストが成功し、OUT到達の追加検証も成功。ビルド成功。修正後の画像・動画はreference-review/pixi-connected-route。
仕上げでは通常打ちの玉がポケット下とガイドの間に残る問題を検出し、内側の下部折れ点を(329,634)〜(230,658)へ下げて解消。高レートでの通路幅も確保するため、外側の下部折れ点を(379,647)へ下げ、盤面の表示範囲と底面も一致させた。最終形状で通常打ちの強さ0.20/0.24/0.28を含む15テストすべて成功。最終録画は46玉＝電チュー8＋アタッカー9＋OUT29、残玉0。

### 2026-09-30 — ガイドはアタッカーまで、継ぎ目を一体化
ユーザー訂正：右打ちの専用ガイドはアタッカーまででよく、その下からOUTへの追加通路は不要。追加した内側の排出ガイド・OUT延長・底面を撤去。既存の最下部のOUT受け斜面は維持。
不揃いな見た目について再指摘。線分ごとの厚み・端部・ネジの重ね描きをやめ、左右の縁を連続した輪郭で描く。入口左の斜め接続を水平に整列し、指定済みの電チュー左の絞りは維持。曲がり角は小さく丸め、同じ頂点から衝突線を生成。アタッカー横の内壁はx340で直線接続し、前回のx329への折れを撤去。ネジは継ぎ目を避けて直線部へ配置し、固定耳で本体につなぐ。右の固定耳が表示範囲で切れないよう開口マスクを調整。
通常打ち3強度、通常・高レート右打ち、スルー、ラウンドの15テスト成功。ビルド成功。専用OUT通路を要求していたテストは今回の仕様に合わせ、全玉排出と計数一致を維持して更新。今回の動画・画像はreference-review/pixi-attacker-route-clean。今後の通路変更でも、接続位置・縁の太さ・固定耳・マスクによる欠けを実表示で確認してから提出する。

### 2026-09-30 — 入口の肩とアタッカー終端を仕上げ
ユーザーが提案した3点の調整を承認。入口から広場へ広がる肩の丸みを4から8へそろえ、前縁をy395からy380へ移動して継ぎ目への重なりをなくした。指定済みの逆ハ釘・左側の絞りは維持。ガイド両側の終端をy612からy576へ短縮し、固定枠の上部に収まる取り付け部を加えて、アタッカー下へ出ていた底面と縁を撤去。
通路形状と衝突形状は同一の頂点を継続使用。通常打ち3強度、0.6秒/0.05秒間隔の右打ち、スルー、ラウンド、奥行きと停止同期の17テストが成功。ビルド成功。修正後の画像・実動動画はreference-review/pixi-route-joints。

### 2026-09-30 — ラウンド画面の状態文字を削除
ユーザー指定により、払出玉数の下の「開放中」「右打ち →」「閉鎖中」「次のラウンドへ」「ラウンド終了」を削除。ラウンド数・入賞カウント・払出玉数は維持。開閉制御は変更しない。

### 2026-09-30 — 右壁の二重表示を解消
ユーザーが、ネジのために広げた盤面外周線と樹脂ガイドが二重の壁に見えると指摘。右ガイドに沿う区間だけ金色の盤面外周線を描かず、樹脂ガイドを単一の見える境界とする。固定耳とネジの表示領域は維持し、マスク境界を壁として描く扱いをやめた。衝突・通路形状は変更なし。ビルド成功。表示確認はreference-review/pixi-single-right-wall。

### 2026-09-30 — 液晶は現在払出／今回の最大払出だけ表示
ユーザー指定によりROUND表記・入賞カウント・入賞ゲージを撤去し、「払出玉数」と「現在 / 最大 玉」のみを中央表示。最大値は今回の実ラウンド数×入賞上限×賞球×当たり開始時の倍率（この確認用台は倍率1）から計算し、ラウンド終了後もlastBonusから維持する。以前の段階的なラウンド数開示より今回の最大払出表示指示を優先し、今回の当たり全体の最大値を最初から示す。開閉制御と実際の賞球処理は変更しない。4/6/10ラウンドと時間切れ終了を含む4テスト成功、ビルド成功。表示確認はreference-review/pixi-payout-total。

### 2026-09-30 — 左右の打ち分け案内をカットイン化
ユーザー指定により、上部に常駐していた右打ち案内を撤去し、液晶中央に大きい「右打ち／左打ち」と方向矢印を表示する共通カットインを追加。0.16秒で横から入り、1.5秒まで保持し、0.3秒で進行方向へ抜ける（計1.8秒）。右系モード同士では再表示せず、通常⇔右打ちの切り替えで表示。ゲーム時計に同期し、停止中は進行しない。液晶の払出表示より前に重ねる。単体の当たり演出プレビューでも既存の5.8秒の案内開始時点へ接続。
今回の動画は右打ち→通常打ちを確認用操作で切り替えたもの。RUSH終了処理の本編接続が完了した証拠として扱わない。表示状態と停止時計の2テスト、ビルド成功。画像・動画はreference-review/pixi-direction-cutin。

### 2026-09-30 — カットイン確定を撤回、実動RUSHで再確認
ユーザーは、先の動画がRUSH突入ではなく手動の打ち分け切り替えだったことを受け、カットインの確定を撤回。見た目は確認中へ戻し、新しい実動動画を提出する。
独立したlcd-rush.htmlで、既存Gameの大当たり終了判定からRUSH状態へ移行し、実際の電チュー入賞を右の抽選保留へ接続する。100回を消化してRUSH状態が終了したら、モデルの打ち方を通常へ戻し、左打ちカットインを自動表示。途中に手動のモード変更や残回数の書き換えを入れない。確認用の固定乱数系列（2回目が大当たり、以後はハズレ）は明示し、本番の当選確率を変更しない。電チューは確認用として直近のスルー通過と保留余裕に連動して開閉。実機固有の普図抽選パターンを再現したものではない。
通常復帰・非RUSH大当たり終了・ラウンド・カットインを含む8テスト成功。RUSH100回には実際に受け付けた電チュー入賞100件が対応し、900玉の払出と60玉のアタッカー入賞が一致。証拠はreference-review/pixi-real-rush。既存の単体確認ページは維持。本番画面への統合・保存処理は対象外。

### 2026-09-30 — SEを保留、仮のリーチ発展を撤去、RUSH専用図柄
ユーザー指示によりSEは後で差し替えるため、PixiJS確認盤面から再生を外す。旧仮音をsrc/pixi/seへ集約し既定では無効。新しい確認動画は音声トラックなし。リーチ文字の2秒は維持し、その後の「月光、集え」と2.4秒の仮発展を撤去して直接結果へ進む。採用済みの3図柄連動6倍ズーム・1秒保持は維持。
RUSH専用表示として額縁を外した大きい斜体の立体数字、白銀の上面・金の側面、深紫の背景と控えめな流光へ変更。通常より1.5倍の表示枠を使い、停止直後0.18秒だけ短い押し出しを加える。抽選時間・結果・入賞条件は変更しない。虹は当たり成立時用に維持。資料visual-patternsの図柄主体／告知色、motion-and-soundのRUSH構図・主役の緩急を参考にした本作向け提案であり、実機の共通ルールではない。カットインの採用確定は撤回のまま。確認先はreference-review/pixi-rush-style。

### 2026-09-30 — 通常背景のキャラクター待機アニメーション
ユーザー承認した動きは、その場で髪・マントが風になびく、呼吸で肩が上下する、ときどき瞬きするもの。元のmoon-castle-v1.pngからキャラクターを輪郭マスクで取り出し、LCDの210×140の画素格子上で部分ごとに変位させる。髪・マントは先端ほど大きく、上半身は4.8秒周期の小さい呼吸、瞬きは5.7秒周期の約0.25秒。12fpsで更新し、整数画素・nearest表示を維持。背景全体の揺れやズームは付けない。
背後の風景だけを組込みimage_genで補ったmoon-castle-clean-v1.pngを追加。元画像は保持し、顔・衣装・髪の画素は元画像から使用。プロンプトは同じ素材フォルダに保存。通常モードだけゲーム時計に同期して動き、一時停止で完全停止。RUSH専用図柄、抽選、入賞、SE無効方針は維持。これは可動部分の簡易変形と瞬き描画による待機アニメーションで、振り向きなどの新しいポーズ作画は含まない。
確認動画・比較フレームはreference-review/pixi-character-idle。通常液晶を12秒再生、ページエラーなし、一時停止前後の画像一致を検証。

### 2026-09-30 — 待機アニメのなびきを修正
ユーザー評価：呼吸と瞬きは良いが、なびき方が不自然。呼吸・瞬きのタイミングと描画は維持。髪とマントに座標ごとに位相の異なる波を加えていた変形を撤去し、髪の付け根と肩を基準にした小さい一方向の曲げへ変更。風の周期は約7秒、マントは髪に0.45秒遅れて動く。頭・胴体に近い部分は変形を減衰し、振幅は毛先で約1画素程度。新しい確認証拠はreference-review/pixi-character-idle-v2。ユーザーの再確認待ち。

### 2026-09-30 — 待機アニメは描き分けたコマへ全面置換
ユーザーが呼吸・瞬きも含めて不自然と再評価。一枚絵の座標変形と目の矩形上描きを撤去し、組込みimage_genで生成した8コマのドット絵シートcharacter-idle-cels-v1.pngへ置換。各コマに髪・マント・呼吸・まぶたを描く。4列2行、実画像2172×724、1コマ543×362。実行時は画像を切り替えるだけで、メッシュ変形・座標ゆがみ・目の上描き・フレーム間補間は使用しない。表示は210×140へのnearestサンプリング。
コマ順序0〜7、保持時間1.4/.45/.55/.08/.10/.08/.50/1.20秒。閉じかけ・閉眼・開きかけは短く、通常の目を開いた姿勢を長く保つ。通常モードのゲーム時計に同期し、停止・RUSH切替時に既存の表示制御に従う。コマ順序・周回と瞬き時間の2テスト、ビルド成功。新たな描画素材のため、元画像との細部の差とループの自然さは確認中。以前の呼吸・瞬きの採用評価も撤回として扱う。コマ一覧と実動動画の提出先はreference-review/pixi-character-cels。生成プロンプトは素材と同じフォルダへ保存。

### 2026-09-30 — コマの長い保持を廃止、8fpsと瞬き周期を分離
ユーザーがコマ送りの遅さを指摘し修正を指示。旧8枚約4.4秒・最大1.4秒保持を廃止。中間姿勢を含む16コマの髪／呼吸ループと、その先頭4姿勢に対応する瞬き4コマを新規生成したcharacter-idle-cels-v2.png（4列5行）へ置換。通常は各0.125秒＝8fpsで16コマを周回し、3周に1回（6秒周期）だけ先頭4コマを瞬き用に差し替える。旧素材の単純な早回しにはせず、長時間の静止を入れない。変形・上描き・コマ間の画像補間は引き続き不使用。時刻からコマを決めるのでフレーム落ちで速度が低下せず、一時停止はゲーム時計に同期する。
0.125秒ごとの16コマ進行と瞬き6秒周期の2テスト、ビルド成功。確認動画はreference-review/pixi-character-cels-fast。生成プロンプトは新しいアトラスと同じディレクトリに保存。見た目の採用はユーザー確認待ち。

### 2026-09-30 — コマ全体の交換をやめ、固定画を共用
画面全体のちらつきへの修正指示。全景が異なる20コマをそのまま交換する方式を撤去。最初のコマを背景・顔・鎧・剣の共通画として保持し、生成済みコマから髪・マントの指定領域と瞬きの目の部分だけを合成する。髪は銀色の画素を抽出して共通6色へ、マントは共通5色へ揃え、背景が見えるところは固定の補完済み背景を使用。元画像変形や目の矩形描画は使わない。顔と胴体のコマ間のずれを止めるため、呼吸による輪郭の変化も今回は停止。8fpsと6秒周期の瞬きは維持。
実際の全20コマで、可動領域外の画素変化0、可動領域内の画素差37920を確認。通常ページ12秒、ページエラーなし、停止前後の画像一致。ビルド・コマ進行の2テスト成功。証拠はreference-review/pixi-character-stable。背景が画素単位で固定されたことと、残る可動部分の自然さの評価は区別する。

### 2026-09-30 — 髪の外周のちらつきを抑制
ユーザーが髪の周囲のちらつきを再指摘。色による毎コマの髪切り抜きが、背景との境界で画素の出没を起こしていた。全コマの髪領域の和集合を補完背景で消してから重ねる処理を廃止。最初の絵の髪の外周・毛束間の隙間・外周から2画素分を固定し、共通の髪領域の内側だけを生成コマの色面で更新する。5コマの近傍で中央値を取り、一瞬だけ現れる色変化を除去。基準コマからの変化をパレット1段階に制限。瞬き・8fps・6秒周期は維持。
これは輪郭を動かすなびきを抑える対策で、髪の完全な作画アニメが完成したとは扱わない。毛束内部の描き分けは残す。全20コマで固定部分の変化0、可動部差15658、そのうち髪内部635を検証。修正証拠はreference-review/pixi-hair-edge。ユーザー確認待ち。

### 2026-09-30 — なびき記事の原画設計を参考に、独立した透明毛束コマへ
ユーザー提示 https://saraemi.com/1609nabiki/ の原画例を確認し、「持ち上がる間はゆっくり、風が抜けると速く落ち、揺れ返して収束する」原理を採用。記事画像そのものは製品素材に使わず、組込みimage_genで毛束だけの透明12コマ（hair-strands-v1.png、4列3行）と、元キャラの後ろ髪だけを除去した固定画（character-static-v1.png）を生成。
色による髪抽出、外周固定、内部色のみの更新を撤去。透明コマの輪郭自体が動き、根元は静止した頭部の後ろへ重ねる。透明度240以上を不透明画素として使用し、10画素未満の孤立片を除外する。背景から髪を色抜きする処理ではない。ゲーム時刻に同期し、12fps基準の露出[2,2,2,2,2,1,1,2,2,2,2,2]で前半をゆっくり・落下を短く・収束へつなぐ。連続サイン変形や補間は使わない。
今回は毛束に検証を絞り、瞬き・呼吸・マントは静止。これらのアニメ全体を完成扱いにしない。全12コマで髪の表示範囲外の画素差0、髪のアルファ輪郭差7025を検証。12秒再生のページエラーなし、一時停止時画像一致。コマ順・ループ・落下の時間差2テストとビルド成功。動画・静止画はreference-review/pixi-hair-strands。新しい毛束の形、量、速さはユーザー確認待ち。

### 2026-09-30 — 頭・首・肩・髪を同一の人物コマへ
ユーザーが「髪だけと頭の動きが同期しておらず怖い」と指摘。静止した頭の後ろへ毛束だけを合成する前方式を廃止。頭・首・肩・髪・体をまとめて描いた透明12コマのcharacter-coherent-v1.pngを生成し、人物一枚として同じコマ番号で表示。毛束を別に動かすクロック、頭部の静止画上書き、前回の頭部遮蔽マスクは撤去。背景はmoon-castle-clean-v1.png一枚を全コマで共用。人物は共通の固定配置に合わせ、各部位の別変形は行わない。
全12コマを実際に組み立て、背景画素差0、頭部画素差14638、髪領域差32385を確認。一時停止画像一致・ページエラーなし、コマ進行の2テストとビルド成功。これらの数値だけで自然な動きを保証せず、実表示のフレームと拡大動画を確認して提出。今回は頭・肩・髪の小さい同期動作に絞り、瞬きは未再接続。素材の再作画による顔や衣装の細部の差は残り、採用はユーザー確認待ち。証拠はreference-review/pixi-character-coherent。生成と配置修正のプロンプトを素材と同じディレクトリに保存。

### 2026-09-30 — 固い毛束の小刻みな動きから、曲がりの伝播へ
ユーザーが「髪が固まってピクピクしている」と指摘。前回コマの小さいずれを速度調整で済ませず、3つの毛束に隙間を作り、根元→中ほど→毛先へ曲がりが伝わる16コマを再生成（character-flow-v1.png、4列4行、1536×1024）。頭・首・肩・髪は人物全体の同一コマで維持し、背景は一枚を共用。全16コマを8fps、2秒で周回。各コマ125msで長い保持はない。
全16コマで人物の表示範囲外の画素変化0、頭部・髪の変化あり。髪の上側の輪郭の平均高さはコマ間で約16.4px変化しており、小さな位置ずれや明暗差だけではないことを確認。これは自然さの点数ではない。新しい素材では髪の振幅・量が前回より大きい。12秒再生と停止時の画像一致、ページエラーなし、2テストとビルド成功。証拠はreference-review/pixi-hair-flow。元の指示・参照からの顔や装飾の細部の差は残るため、見た目の採用は確認待ち。

### 2026-09-30 — 太い3本の毛束を撤去し、元の毛流れへ修正
ユーザーが3本の太い髪だけがなびく形を指摘。前回生成物を参照せず、元のmoon-castle-v1.pngから細い髪が重なる人物16コマを再生成（character-fine-flow-v1.png）。頭・肩・髪を同じコマで表示し、8fpsと固定背景を維持。各コマを同じ比率で配置し、前回の横圧縮を廃止。透明背景を共用景色に合成する。
12秒の通常液晶を新規撮影。背景の人物領域外の画素変化0、停止前後の画像一致、ページエラーなし。ビルドと既存コマ進行2テスト成功。録画の連続8フレームで、太い独立3本から細い重なった毛流れへの変更を確認。再作画による顔・装飾の差は残る。瞬きは未再接続。自然さや採用はユーザー確認待ち。証拠はreference-review/pixi-hair-fine。

### 2026-09-30 — 元絵へ戻し、水面だけを控えめに動かす
ユーザー承認により人物再作画アトラスの表示・読み込みを外し、元のmoon-castle-v1.pngを通常液晶の基準画像へ戻した。water-idle.jsで210×140にnearest表示し、人物・剣・岸辺を避けた水面だけを横方向最大1画素ずらす。8fps、48コマ、6秒周期。色・明るさ・輪郭ぼかし・ズームは加えない。第0コマは元画像と完全一致。人物・髪・マント・月・雲・城は固定。今回の範囲は水面のみで、雲や髪の次段階は未実施。
48コマを元絵と比較し、水面マスク外の差0、第0コマの差0、水面内の変化ありを確認。実際の通常液晶12秒の録画、一時停止前後の画像一致、ページエラーなし、ビルド成功。録画から連続フレームを抽出し、人物と剣の形状保持および右側反射の小さい変化を目視確認。動画はreference-review/pixi-water-only/lcd.mp4、音声なし。採用判断はユーザー確認待ち。

### 2026-09-30 — 水面採用、上空の雲を別レイヤーで右へ流す
水面のみの動画をユーザーが承認。その速度・振幅・マスクは維持し、次段階として雲を追加。元絵を参照して、遮蔽物に隠れた領域まで補った空・雲の画像cloud-sky-v1.pngを生成。人物・剣・月・城を元画像の固定領域として残し、上空のマスク内にだけ雲レイヤーを表示する。全景・人物の再作画には使わない。1.5秒に1論理画素ずつ右へ移動し、ぼかし・半透明補間は使わない。端は鏡像接続して急な継ぎ目を防ぐ。6秒の水面周期と独立して進み、ゲーム時計・停止・通常モードに同期。
初期案の元画像から色で雲を抜く方式は月付近に切り抜き跡が出たため不採用。cloudless補完画像も実行時には使わない。最終案の雲の形・配置は補完によって元絵と一部異なる。人物と城の周囲の細部は固定領域として残す。
検証：0/6/12/24/90/628.5/630秒の合成で空マスク外の画素変化0、水面への雲の影響0。24秒の通常液晶を実録画し、停止前後の画像一致・ページエラーなしを確認。ビルド成功。録画の連続6フレームを目視確認。証拠はreference-review/pixi-cloud-water/lcd.mp4（音声なし）。雲の見た目の採用はユーザー確認待ち。

### 2026-09-30 — 雲採用、左端の毛先だけコマ差分を追加
ユーザーが雲のループ確認を了承し、毛先だけの小さな動きへ進行を指示。元画像の顔・頭・体・髪の根元は固定。元画像の(0,160,400,560)を参照用に切り出し、4列2行の8コマhair-tip-detail-v1.pngを生成した。元絵と同じ位置へ戻し、液晶座標x<28、24<=y<94にある髪の画素だけを表示対象とする。元の髪と新しい髪が共通する画素は元の陰影を保持。追加される輪郭は近い元の銀色を使用し、コマごとの色変化を抑制。毛先が離れた箇所のみ既存character-static-v1.pngの背面補完を使う。8コマ・4fps・2秒周期、ゲーム時計に同期。
全景16コマ版と、その輪郭を狭く制限する途中案は動き・輪郭が不十分だったため不採用。最終は毛先を大きく参照して描いた8コマを使用。人物全体の再作画、メッシュ変形、瞬き・呼吸の再追加は行わない。
採用済み水面・雲を同時刻で描いた基準画像と全8コマを比較し、毛先領域外の画素差0、毛先内の変化とコマ間変化を確認。通常液晶16秒の実録画、停止画像一致、ページエラーなし、ビルド成功。連続コマと録画抽出フレームを目視確認。自然さ・採用はユーザー確認待ち。証拠はreference-review/pixi-hair-tips/lcd.mp4（音声なし）。

### 2026-09-30 — 毛先アニメーションを暫定許容
ユーザー評価：「これが限界かな、、一旦許容します。これから改善します」。現在の毛先アニメーションは進行のため暫定採用とし、自然さの完成・最終確定とは扱わない。毛流れの連続性、輪郭の安定、元絵の細い毛流れを保ったなびきは今後の改善課題として残す。今回の応答では見た目・速度・素材は変更しない。水面・雲の採用は維持する。

### 2026-09-30 — 通常／RUSH背景の切替を実装
ユーザーが通常とRUSHの背景切替へ進行を承認。通常は採用済みの月夜と水面・雲、暫定採用の毛先を維持。RUSHは新規のrush-eclipse-v1.png（深紫の夜空、金色の月縁、正面の城と橋）に変更し、既存の金銀の大型専用図柄へ合わせた。旧単色背景・菱形線を置換し、流光は画面端へ寄せる。背景画は210×140へnearestで揃える。虹色は当たり演出用を維持し、背景の金色は世界観の照明として使う。
実際のgame.rush状態と当たり演出終了に連動し、通常⇔RUSHを0.8秒のクロスフェードで切替。ゲーム時計に同期し、途中反転・停止・時計リセットに対応。通常背景も裏で同じ時計を進め、復帰時に雲や水面を先頭へ戻さない。SEは無効のまま。抽選・入賞条件・ラウンド・払出・図柄デザインは変更しない。
検証：背景遷移2テストと既存RUSH動作2テスト、ビルド成功。lcd-rush.htmlの実際のヘソ入賞→900玉払出（アタッカー60玉）→電チュー入賞でRUSH100回消化→通常復帰を約168秒録画。RUSH中の停止画像一致、ページエラーなし、音声なし。突入と復帰の連続フレーム・RUSHの図柄視認性を確認。提出動画reference-review/pixi-rush-background/transitions.mp4は実動録画から通常4秒・突入14秒・復帰8秒を抜粋した26秒。途中に時間の省略はあるが、状態の強制切替はしていない。見た目はユーザー確認待ち。

### 2026-09-30 — 通常／RUSH背景切替を採用
ユーザーが26秒の実動抜粋動画を確認し「おけ、ばつぐん！」と承認。深紫・金色の月光と正面の城を使うRUSH背景、通常の月夜との0.8秒クロスフェード、終了時の通常背景への復帰を現状で採用とする。毛先アニメーションの暫定採用・改善課題は引き続き別扱いで維持する。今回、実装・素材の変更は行わない。

### 2026-09-30 — 保留の追加・消化アニメーション（確認待ち）
通常／RUSH背景の採用後、次の表示改善として保留欄を更新。青銀色のドット保留と金色の台座を共通化し、変動中の位置を左へ分離。追加時は10画素上から着地、消化時は先頭が左へ移り、後続が詰まる。0.28秒のゲーム時計同期、座標は整数化。保留数だけでなく抽選IDで追跡し、追加と消化が同時でも動作する。表示のための抽選追加・結果変更なし。保留上限5、SE無効、背景・図柄・物理は維持。
同数入れ替え・即変動・満杯・停止・モード切替・時計リセットの2テスト、既存RUSHの2テスト、ビルド成功。実際の確認用当たり→払出900玉→RUSH100回→通常復帰を録画し、停止画像一致・ページエラーなしを確認。録画から通常16秒、RUSH16秒、復帰5秒を抜粋しreference-review/pixi-holds/holds.mp4（37秒、音声なし）へ保存。連続フレームで追加・詰め・消化位置への移動を確認。採用はユーザー確認待ち。

### 2026-09-30 — 保留表示の採用、RUSH突入告知を追加
ユーザーが保留追加・消化の37秒動画を「おけです」と承認。現状の保留表示を採用。
次の演出として、実際の払出終了後にRUSHが遊技可能となる遷移へ突入告知を追加。主役は金色のRUSH文字、伝える情報はRUSHの開始のみ。次の抽選結果や期待度を知らせる演出にはしない。
タイムライン：0〜0.22秒で左右の文字を中央へ集合、0.28〜1.1秒に一度だけ光が通過、1.4秒まで保持、1.75秒で消えて専用リールへ戻る。紫・金の背景に合わせたドット文字と月輪を使い、下端の保留欄は覆わない。ゲーム時計で停止し、同じRUSH中には繰り返さない。図柄・抽選・保留・物理・払出条件を変更しない。SEとリーチ後の戦闘演出は引き続き後回し。
参照：web-pachinko-design の visual-patterns / motion-and-sound にある主役の切替・入り保持抜けの構成を本作へ適用。特定実機の演出の再現ではない。見た目はユーザー確認待ち。
検証：突入モーション2件・保留2件・既存RUSHライフサイクル2件の計6テスト、ビルド成功。実ブラウザで900玉払出からRUSH開始を録画し、告知中の停止画像一致・ページエラーなし・開始後の抽選進行を確認。録画の連続フレームで文字集合・保持・リールへの復帰を確認。提出はreference-review/pixi-rush-entry/entry.mp4（14秒、音声なし）。今回の動画は突入前後のみ。

### 2026-09-30 — RUSH告知の補助文字を削除
ユーザー指示「文字はRushだけでいいです」に合わせ、突入告知の「突 入」を削除。主文字RUSH、月輪・枠・光の動きと表示時間は維持する。

### 2026-09-30 — RUSHを一文字ずつ落下、縁に小さい炎
ユーザー指示：R/U/S/Hを一文字ずつ上から「ダン！」と着地させ、揃ってから既存の光を走らせ、文字周囲を軽く燃やす。横からの文字集合を置換。
Rから0.27秒間隔で落下開始、各0.15秒で加速して着地。着地時に横10%・縦14%の短い変形と小さい火花、0.14秒で元の文字へ戻す。H着地後の1.3秒から一度だけ光が横切る。2.55秒まで保持し2.9秒で終了。文字の上向き輪郭へ赤・橙・金の小さい炎を8コマ12fpsで重ねる。炎は文字の後ろ、着地後だけ。タイトルはRUSHのみ。SEは今回も追加しない。
順番・4回の着地・全字着地後の光・停止時計・再突入・リセットをテスト。抽選・保留・払出・背景は変更なし。採用は新しい動画でユーザー確認待ち。
検証：モーション2テスト・ビルド成功。実際の900玉払出からRUSH開始を再録画し、文字の順次落下・集合後の光・輪郭の炎を12連続フレームで確認。ページエラーなし、終了後の抽選進行と停止画像一致。提出動画はreference-review/pixi-rush-drop/entry.mp4（14秒・音声なし）。

### 2026-09-30 — RUSH文字の落下テンポを速める
ユーザー指示「もっとテンポよく」に合わせ、文字間隔を0.27秒から0.16秒、落下時間を0.15秒から0.10秒、着地の戻りを0.14秒から0.09秒へ短縮。4文字の着地完了は開始1.06秒から0.68秒へ。全字着地後の光も1.3秒から0.8秒へ前倒しし、告知全体を2.9秒から2.4秒へ短縮。炎・文字の形・SEなしの方針は維持。順番と光の開始条件のテスト、ビルド成功。動画はreference-review/pixi-rush-drop-fast/entry.mp4を新規撮影する。

### 2026-09-30 — RUSHの背面パネル撤去、文字形状に光を限定
ユーザー指示に合わせ、文字の後ろの多角形パネル・縁・月輪・菱形装飾を削除。RUSH専用の城の背景へ文字と炎を直接重ねる。告知中だけ通常の図柄表示を隠し、告知が抜けると現在の変動状態のリールへ戻す。抽選時計は停止しない。
光のマスクを矩形から文字の前面と縁の画素形状へ変更。文字間・文字の穴・城には光の帯を描かない。採用した0.16秒間隔の落下と炎・2.4秒の長さ・SEなしは維持。モーション2テスト・ビルド成功。新規動画はreference-review/pixi-rush-letter-shine/entry.mp4。

### 2026-09-30 — 文字内の光を強化
ユーザー指示「文字の光をもっと派手に」に合わせ、幅8画素・透明度45%だった単独の光を、金色の外帯・明るい内帯・幅18画素の白い芯の3層へ変更。各文字を通過後、0.25秒で減衰する金白色の余韻を追加。すべて同じ文字形状マスクの内側だけに表示。背面パネルは復活させず、落下テンポ・炎・2.4秒の告知時間・SEなしを維持。ビルド成功。新しい録画はreference-review/pixi-rush-bright-shine/entry.mp4。

### 2026-09-30 — RUSH文字を中央配置、虹色の光へ変更
ユーザー指示：虹色に光らせ、文字を真ん中へ。告知の文字・炎・光を同一コンテナで右2画素・下11画素移し、前面文字の中心を液晶中央（約105,70）へ揃える。金白色の光を赤〜紫7色のドット帯へ置換し、文字ごとの残光も同じ虹色に変更。光は引き続き文字形状の内側だけ。背面パネルなし、0.16秒間隔の落下、2.4秒の告知、炎・SEなしは維持。
この虹色はユーザー指定のRUSH開始告知の装飾であり、次の当たりを保証する先読み表現には使わない。ビルド成功。新規動画はreference-review/pixi-rush-rainbow-center/entry.mp4。

### 2026-09-30 — RUSH突入演出を完成として採用
ユーザーが「これで完成にします」と承認。中央のRUSH文字が0.16秒間隔で順次落下し、控えめな炎と文字内の虹色の光・残光を伴う現状を完成として採用。背面パネルなし、2.4秒、SEなし。対象は突入告知であり、後回しの戦闘演出やSE全体を完成とするものではない。

### 2026-09-30 — RUSH終了から左打ち案内への接続
次の演出として、Game.lastRush.endedAtの実際の終了時刻を基準に、中央へ銀青色のRUSH ENDを1.1秒表示。0.12秒で現れ、最後0.2秒で消える。終了表示の間は図柄を隠し、通常背景への既存クロスフェードを進める。その後に既存の左打ち案内を1.8秒表示し、通常の図柄へ戻す。通常復帰・発射方向の切替自体は即時に行い、演出でゲーム時計や抽選を止めない。
左打ち案内の表示開始だけを1.1秒遅らせる。非RUSH当たりの終了・手動打ち分け・初期状態・時計巻戻しではRUSH ENDを誤表示しない。再突入や大当たり中には過去の終了表示を出さない。SE・確率・保留・出玉条件は変更なし。
終了表示1テストと実動ライフサイクル2テスト、ビルド成功。突入の確定デザインは維持。見た目の採用はユーザー確認待ち。
実録画の検証：確認用当たり→900玉払出→電チュー入賞でRUSH100回消化→自動終了を約168秒撮影。終了表示→左打ち案内→通常図柄復帰の連続12フレームを確認し、終盤11秒をreference-review/pixi-rush-end/ending.mp4へ抜粋。ページエラーなし、RUSH中の停止画像一致。方向カットイン2テストを加えて関連5テスト成功。

### 2026-09-30 — RUSH終了の流れを完成として採用
ユーザーが終了動画を「それでおけです完成でいいです」と承認。銀青色のRUSH END→左打ち案内→通常図柄への復帰を現状で採用。

### 2026-09-30 — RUSH中当たり・払出・継続を接続
次の実装として、RUSH中当たりの777を通常の額縁付き図柄から、RUSH用の大型金色図柄と虹色の差分へ切替。背景もRUSHの城を維持する。3図柄連動の6倍拡大・1秒保持は既存仕様を共用。大当たり文字や戦闘演出、SEは追加しない。
RUSH当たり成立時に右通路を閉鎖モードへ切替え、電チューを閉じてから既存のアタッカー払出へ進む。払出後は残り100回へ戻り、保留を保持してRUSH専用図柄へ復帰。確率・払出・継続ルールの変更なし。
確認用lcd-rush-win.htmlを追加。通常2個目と電チューで受け付けた5個目の抽選だけ当たりを指定し、実際の入賞から動作させる。本番の確率変更ではない。既存lcd-rush.htmlは従来どおり100回消化して終了する確認用系列を維持。
テストでは2回目のアタッカー60玉入賞による900玉払出、RUSH継続回数2、残り100回、保留5個保持、当たり演出フラグの解除を確認。既存の通常終了・非RUSH当たり復帰と合わせ3テスト、ビルド成功。動画での採用はユーザー確認待ち。
ブラウザ検証：RUSH中当たり→アタッカー60玉・900玉払出→保留を維持して100回に復帰→次変動を新規録画。ページエラーなし、当たり中の停止画像一致。通常当たりと合わせアタッカー120玉。専用777の6倍拡大・保持と再開後の専用リールを連続フレームで確認。提出はreference-review/pixi-rush-win/continuation.mp4（26秒・音声なし、払出途中を省略）。

### 2026-09-30 — RUSHの払出増加と専用当たり演出（試作）
ユーザーが通常とRUSHの払出・演出の差を要望。従来は通常600/900/1500玉＝45/35/20%、RUSHは同じ玉数＝20/30/50%だった。具体値の質問に対しユーザーは振分けの意味を質問。仕組みを説明したうえで、1500玉固定をアシスタント提案の試作値として実装し、採用待ちとする。ユーザーが1500玉を確定したとは扱わない。
初号機のみ右の振分けを0/0/100（10R）へ変更。満額は15玉賞球×10カウント×10R＝1500玉。通常の振分け・当選確率1/199と1/66・100回転・保留・他機種は維持。時間切れで入賞が不足すれば払出は満額より減る。
演出はRUSHだけ中央待ちを0.45秒へ短縮し、リーチ文字を省略。金白色の斬撃、飛び散る小さい光、左右から26画素だけ寄る大型777で素早く決着。通常の6倍拡大・放射状の虹光はRUSHには使わない。専用金色図柄の虹差分は維持。確定表示を2.4秒に短縮し、0.35秒の接続からアタッカーへ。通常当たりの演出・時間は維持。SEなし。
テストはRUSH10R固定・通常の振分け不変・当選確率不変・保留継承・実玉100個の入賞による1500玉払出と継続・専用の短い動作を検証。旧振分けを期待していた既存テストを新しい試作設定に合わせ更新。関連15テストとビルド成功。動画はreference-review/pixi-rush-special/continuation.mp4を新規撮影する。

### 2026-09-30 — 未承認の1500玉固定化を撤回
ユーザー訂正「固定にしてとは言ってない」。固定化はアシスタントの先走りであり、承認仕様として扱わない。機種定義とテストを従前のRUSH600/900/1500玉・20/30/50%へ戻し、仕様書の先行記載も訂正。1500玉固定での録画は中止・不採用。払出を通常より増やす要望は有効だが、具体的な玉数と割合は未確定。RUSH専用演出の作業は別として保持する。

### 2026-09-30 — 当落確率と払出振分けを分離する指定
ユーザー明示：RUSH中の大当たりになる確率66%、その当たりの中で1000玉30%・1500玉50%・3000玉20%。1500固定・旧20/30/50%は新しい要望として採用しない。
66%を継続抽選ごとの当落（外れで終了）とするか各図柄変動（外れても継続）とするか、また払出振分けを通常初当たりにも適用するかを質問中。未回答のため実行中の当落ルール・通常払出を推測で変更しない。独立した当たり後の払出選択関数を追加し、30%／50%／20%の境界をテスト済み。ゲーム本体への接続・新仕様の実動動画はまだ未実施。


## 2026-09-30 RUSH確率と払出の訂正・専用決着

ユーザー確定：100回転以内の当選66%。1回外れても続き、100回転を外し切ったら終了。別途34%終了抽選は設けない。1回転p=1-0.34^(1/100)。RUSH当りのみ1000/1500/3000玉を30/50/20%で選択する。通常払出は変更しない。前の「未確定・質問中」記述を更新する。

RUSH当りの新しい確認案：通常の3図柄連動6倍拡大を用いず、短い金白の斬撃と虹色の777、外側の数字が中央へ収まる動きで決着。RUSHリーチ待ちは0.45秒、当り表示は2.4秒。SEと戦闘演出は追加しない。入賞による払出、100回転への再セット、保留引継ぎは維持。専用決着の外観はユーザー確認待ち。

検証記録：`../../prototype/reference-review/pixi-rush-66/continuation.mp4`（26秒、SEなし）。当落を指定した確認系列で1500玉を選択し、実入賞100玉で1500/1500玉、残り100回・連数2へ復帰。確率そのものは別テストで検証。212件のテストとビルド成功。映像は抜粋で、払出途中を省略する。

### 2026-09-30 RUSHのリーチ告知を復元

ユーザーの「リーチってでないん？」に対応。RUSH専用化の際に省いていた中央の「リーチ」表示を戻した。左右一致・中央待ちの既存0.45秒に、通常で採用した文字の登場・保持・短いフェードを表示する。通常の2秒表示、当落・払出・RUSH回数、SEなしは維持。動画は `../../prototype/reference-review/pixi-rush-reach` に記録する。

### 2026-09-30 RUSH当たりの衝撃を強化（確認案）

ユーザーが提案の実装を依頼。0〜0.09秒は背景を暗くし、0.09〜0.24秒で777が最大1.68倍へ迫る。0.16秒から金色の破片28個と光片が外へ飛ぶ。0.24〜0.44秒の一度だけの短い揺れを経て、大きい777を保持。0.52〜1.17秒は数字の面だけに切り抜いた虹色・白の光が走り、1.8秒以降に通常サイズ・背景へ戻る。全体は既存の2.4秒に収める。

通常時の連動6倍拡大、RUSHのリーチ文字、確率・払出・開閉のタイミングは維持。追加文字・SE・リーチ後の戦闘は足さない。数字の光はCanvasで事前生成した16枚の透過テクスチャ、破片は整数座標に置く。確認動画は `../../prototype/reference-review/pixi-rush-impact`。

実再生確認：`../../prototype/reference-review/pixi-rush-impact/impact.mp4`（約7秒、SEなし）。リーチから飛び出し、破片、数字に沿う虹色光、払出への切替まで収録。コマ一覧で数字面への光の切り抜きと収束後の全図柄の収まりを確認。関連テスト5件・ビルド成功、ブラウザエラー0。新演出の採用はユーザー確認待ち。

### 2026-09-30 大型「月蝕」可動役物・通常/RUSH共通の試作

参照：ユーザー提示 https://www.youtube.com/watch?v=ETUy6gbyZUE 。冒頭のシンフォギアと1:23〜1:28付近のエヴァを画面で確認。液晶前への大きな部品の侵入・収納・表示面の遮蔽という構造を参考にし、機種の絵や音は流用しない。ユーザーは大型「月蝕」役物の試作と、通常当たりにも出す方針を承認。

試作：左右の「月」「蝕」の金属キャリアが枠裏から直線移動し、上部の月付き冠と合体。文字は側面の押出し、金縁、銀色の面取り、青い台座、固定ネジを持つ。奥の横レール、液晶へ落ちる影、枠に固定された収納口を別レイヤーにした。液晶内の図柄より前、既存枠の前面に重なる演出専用部品。玉への衝突形状は追加しない。

時間案：0.06〜0.36秒進入、0.36〜0.52秒小さく反動、1.38秒まで合体保持・発光、1.38〜1.88秒収納、奥の777へ戻る。通常/RUSHとも既存の当たり表示時間内で作動し、払出や開閉時刻は変更しない。SEなし。確認素材は `../../prototype/reference-review/pixi-eclipse-mechanism`。外観は採用確定ではなくユーザー確認待ち。

実動確認：通常約8秒・RUSH約7秒の動画とコマ一覧で、枠裏から進入→合体→収納→777の再表示を確認。最初の切り抜き不具合を修正し撮り直し済み。ビルド成功、ブラウザエラー0。今回は大型役物の造形と動きの試作で、SEは未追加。

### 2026-09-30 月蝕役物の造形・動きを確定、出現順を修正

ユーザーが演出自体を確定。通常当たりでも使用する。出る順序は「液晶で当たりが決着→気持ちいい確定SE→月蝕役物」に訂正。同時に出す方式を採用しない。SEは従来どおり後から追加し、今回は無音の差し込み位置を定義する。

通常：図柄6倍拡大から戻る1.51秒をSE位置、1.65秒から役物。RUSH：液晶の飛び出し・虹色光が終わる2.4秒をSE位置、2.55秒から役物。造形・移動・反動・保持・収納は変えず1.9秒。通常の当たり表示は5.8秒を維持し、RUSHは役物収納後に払出へ移れるよう4.7秒へ延長。数値は今回の仮タイミングで、SE実装時に同期を調整する。確率・払出振分け・入賞による払出は変更しない。

### 2026-09-30 最優先訂正：役物は図柄が揃う前

ユーザー訂正：左右の「月蝕」と上部の飾りは、揃う前に合体して液晶を覆い、収納されなければならない。直前の「液晶で当たり決着→SE→役物」というアシスタントの解釈は撤回する。確定した役物の造形・移動は維持。

新しい順序は通常/RUSH共通で、左右図柄一致→リーチ告知0.45秒→役物合体・保持・収納1.9秒→中央図柄停止（リーチ開始2.5秒）→777の当たり表示→払出。役物は当たり確定後の時計で起動せず、当選済みのリーチ演出時間にのみ接続。通常の外れリーチ2秒、RUSH外れリーチ0.45秒は維持。RUSH当たり後の表示時間は元の2.4秒に戻す。SEは追加しない。確率・賞球・保留のルールは変更しない。

録画は `../../prototype/reference-review/pixi-eclipse-before-stop`。前回のafter-win動画は今回の指示に合わない旧版として扱う。

### 2026-10-01 RUSH払出玉数告知の試作（採用未確定）

ユーザーが1000・1500・3000玉の告知試作を依頼。RUSHの777決着後、アタッカー開放前に玉数だけを大きく提示し、従来の現在払出／最大玉数表示へつなぐ。1000玉は銀青、1500玉は金、3000玉は一段大きく数字面に虹色の光を流す。最初に小さく飛び出して収束、通常2秒、3000玉2.6秒。背景は濃紺・紫と細い光片。SE・戦闘は追加しない。ユーザーに別のイメージがあるため採用確定扱いしない。

通常当たりの600/900/1500玉には今回の告知を適用しない。RUSHの確率・振分けは変更せず、当選済みの最大払出を表示する。告知中は実払出0、開放後の実入賞で初めてカウンターが増える。payout-reveal.htmlは1000/1500/3000を指定して比較する専用確認ページ。抽選結果の指定はこのページに限定。

前の役物の順序はユーザー「いいね！」で採用済み：リーチ→役物合体・収納→777。今回も維持する。

検証：`../../prototype/reference-review/pixi-payout-reveal/comparison.mp4`（約28秒・無音）。1000/1500/3000の各最大値が一致、告知中0から実入賞で加算されることを確認。関連テスト10件・ビルド成功、ブラウザエラー0。造形・タイミングは比較用の試案。

### 2026-10-01 払出告知の立体回転と全種類虹色

ユーザー指定：500/1500/3000すべて虹色。告知から「玉」と上下の横線を外す。数字を一枚の奥行き付き平面として投影し、左端が大きく面が右を向く姿勢から、右端が大きく面が左を向く姿勢へ回転。桁の順序を維持し、500は3桁。既存の現在払出/最大払出HUDは維持。SE追加なし。RUSH最低払出のみ500へ変更、30/50/20%は維持。

### 2026-10-01 払出告知の注視点移動

ユーザー確認済みの意図：開始時は左端の桁を液晶中央へ、回転に合わせ中央に見せる位置を右へ順に移し、終了時は右端の0を中央へ。数字列の回転と同じイージングで投影後の注視点を追従し、前面と側面に共通のカメラ位置補正を適用する。500/1500/3000共通、虹色・既存の演出尺と払出仕様は維持。SEなし。

### 2026-10-01 払出告知の追従幅を半減

ユーザー指示：端まで追い切る動きが強すぎるため、中央を捉えつつ途中で止める。試案としてカメラ追従幅を50%へ縮小。回転角・演出尺・虹色は維持し、始終点とも数字列の中央に近い位置を見る。

### 2026-10-01 払出告知の縦軸回転を控えめに

ユーザー指示：縦軸の傾きを少し抑える。最大ヨー角を±0.68rad（約39度）から±0.54rad（約31度）へ約2割縮小。直前の追従幅50%と演出尺、虹色は維持。

### 2026-10-01 払出告知の傾きをさらに縮小

ユーザー「もうちょっと抑えて」に合わせヨー角を±0.54radから±0.40rad（約23度）へ変更。視点追従幅50%・尺・虹色は維持。

### 2026-10-01 払出告知の回転角16度

ユーザー指定により最大ヨー角を左右16度（±16°）へ変更。中央付近の追従幅50%、演出尺、虹色は維持。

### 2026-10-01 払出告知を奥から迫る動きに変更

ユーザー方針変更：回転せず、奥から正面へドンと迫る。従来の縦軸回転と横追従を撤去。中央の奥から0.42秒で接近・衝撃、0.12秒で一度だけ軽く収束し、そのまま保持。全桁同じ正面向き、虹色・数字のみを維持。SE追加なし。

### 2026-10-01 払出告知の虹色グラデーション

ユーザー指定：数字面の虹色を滑らかなグラデーションに。段階的な帯と色切替を連続補間・連続移動へ変更し、光沢も滑らかにする。輪郭のnearest描画、奥から迫る動き、払出仕様、SEなしは維持。

### 2026-10-01 払出告知の最終採用

ユーザー「確定で」により `../../prototype/reference-review/pixi-payout-gradient/comparison.mp4` の演出を採用。500/1500/3000の数字が正面のまま奥から迫り、ドンと止まって保持する。回転・横追従なし。全種類とも数字面は滑らかな虹色グラデーション、輪郭はドット表現、末尾の「玉」と上下の横線なし。SEは引き続き未追加。以前の回転角・追従幅の案は履歴とし、本項を優先する。RUSH払出振分け500/1500/3000＝30/50/20%は維持。

### 2026-10-01 RUSH終了演出の試作

ユーザーが提案に同意し実装依頼。最後のハズレ図柄を0.25秒保持し、光と図柄を落とす。0.8秒から「RUSH 終了」「合計払出」と実際のlastRush.totalを表示、4.2秒で終了して左打ちカットイン・通常背景と通常図柄へ復帰。通常保留は終了表示と案内中に消化しない。共通時計でポーズ対応。SEなし。確認用rush-end.htmlは累計2500・消化97回・残り3回から開始する専用fixtureであり、本番抽選や払出を変更しない。映像の採用確定は未確認。

### 2026-10-01 RUSH終了演出を採用確定

ユーザー「おけ、確定して」により `../../prototype/reference-review/pixi-rush-ending/ending.mp4` の演出を採用。最後のハズレ停止→光と図柄が引く→「RUSH 終了」と合計払出→左打ちカットイン→通常背景・通常図柄へ復帰。終了表示4.2秒、左打ちカットイン1.8秒。終了と案内の間は通常保留を保持し、案内後に再開。合計払出は実際のlastRush.totalを表示し、確認動画の2500に固定しない。SEは引き続き未追加。直前の試作・採用未確認の記述は、本項で確定へ更新する。

### 2026-10-01 払出中の背景を各モードのリール背景と共通化

ユーザー依頼：通常当たりは通常リールの人物・城背景、RUSH当たりはRUSHリールの月・城背景を払出中にも継続使用。既存の背景レイヤーをそのまま表示し、払出レイヤーの不透明背景を撤去。リール・当たり図柄は払出中非表示、数字の読みやすさは薄い暗幕と文字縁取りで確保。RUSHの虹色払出告知も同じ背景を透過表示。動き・金額・確率・SEなしは維持。

### 2026-10-01 初当たり払出後のRUSH突入告知6案（試作）

ユーザー依頼：単一の告知ではなく複数パターン。①リザルト・左打ち・通常画面から再暗転復活、②蒼い月が接近し紅く光る、③水面だけ先に紅く変わる、④城の窓から塔・月へ点灯、⑤リザルトを斬り裂く、⑥月蝕役物が反応し合体、の6種類。各々の独立した前段演出を経て、採用済みの燃えるRUSH文字落下・虹色光沢へ接続。SEなし。映像は採用未確定の比較試作。

既存のentryEligibleと開始済みrushを条件にするだけで、再抽選・賞球追加・回転数の消費はしない。初回通常当たりのみ、RUSH中当たりには挿入しない。払出完了・扉閉鎖後に開始。演出中は保留消化を保持し、終了後に右打ち案内とRUSH遊技へ渡す。復活の通常画面は表示上の見せかけであり通常抽選を開始しない。

実機根拠：SANKYO「ユニコーン再来」公式紹介は偶数図柄の払出後にファイナルチャンス、奇数図柄は突入と説明（https://www.sankyo-fever.jp/collection/964/）。SANKYO「ユニコーン」公式パンフに敗北後の復活を記載（https://www.sankyo-fever.jp/products/assets/pdf/pmz/pmz_mp.pdf）。後者はRUSH中の復活例であり、初当たり後の突入と同じ抽選方式の証拠にはしない。「左打ち指示後に通常画面を経て再暗転」は実機共通の定番と断定せず本作の創作案とする。月・水面・城の6案の造形も本作オリジナル。

確認ページrush-entry-patterns.htmlでは当選済み通常900玉の最後の1入賞から開始し、実入賞で900へ到達して告知へ進む。初期885玉・最終区間9入賞を確認用に設定する。実際の全入賞から始めた録画ではない。本番払出分布を変えない。

## 2026-10-01 RUSH突入告知：専用ドット絵へ改稿（確認待ち）
- ユーザー指摘：全案が紅い月に収束する構成、通常背景の上へ色や線を重ねる表現は不採用。専用ドット絵を生成し、期待を溜めてから解放する。
- `../../prototype/public/assets/lcd/rush-entry-v2`：6案それぞれ6カットを新規生成。復活＝銀髪騎士の覚醒、月＝蒼から紅の月、水面＝青白い奔流、城＝金色の門、剣＝蒼白の抜刀、機関＝青い動力の解放。紅い月は月案のみ。
- 予兆1.25秒→蓄積1.65秒→増幅1.65秒→限界の静止1.75秒→解放0.32秒→余韻1.38秒。既存RUSH文字演出へ接続。復活案のみ前段にリザルト・左打ち・通常復帰・再暗転6.05秒。
- 生成した専用カットを切り替える演出。全フレーム作画の連続アニメーションではない。静止する間とカット割り、控えめなカメラ寄りを組み合わせる。
- 確定済みのRUSH文字、当選確率・払出振分け・100回転ルールは変更なし。SEなし。ローカルのみ。

## 2026-10-01 城のRUSH突入：連続動作の試作
ユーザーが「固定背景＋部分アニメーション」の方法で城を先に仕上げる方針に同意。城案のみ6カットの全画面切替を撤去し、専用素材の閉門カットを固定背景として使用する。元絵の暖色画素に限定して下部から塔へ発光を進め、光の粒を門へ集める。左右の扉は同じ絵から切り出し、固定した蝶番から奥へ開くように毎フレーム投影する。奥の景色も専用生成素材の開門カットを開口部内だけに使用。建物や雲の形は切り替えない。

全体8秒。0.5秒から照明と集光、5.85〜6.15秒に短い間、6.15〜7秒で扉を開放し、余韻から確定済みRUSHタイトルへ接続。カメラ寄りも全区間連続。Canvasテクスチャを共通ゲーム時計で更新しPixiJSへ描画する。SEなし。残る5案は前版のまま。城の確認後に展開する。

### 2026-10-01 城のカメラ固定・虹色の周縁モヤ
ユーザー指摘：寄りの際の輪郭のうねりが不快。城のカメラ拡大・移動を完全に撤去し、210×140の画素位置を固定。左右扉のみ開閉する。依頼された虹色のモヤは液晶内の周囲に限定し、透ける流れと小さな白い光点を加える。溜めに応じて濃く、解放時に最も強くする。中央の門を覆わない。SEなし。確認用動画は `../../prototype/reference-review/pixi-castle-rainbow/castle.mp4`。

### 2026-10-01 虹色を周囲から扉の奥へ渡す
ユーザー依頼：開門の少し前にモヤを消し、開いた中を虹色にする。周縁モヤ・光点は5.5〜5.85秒で消え、6.15秒の開門まで0.3秒の間を置く。門の奥の専用素材は模様と明暗を保持した虹色グラデーションにし、開いた隙間から見せる。閉じた扉や城の外壁は虹色にしない。カメラ固定・SEなしを維持。

### 2026-10-01 他5案も部分的な連続動作へ
ユーザー依頼により、採用した城の方針を他案へ展開。全案でカメラ拡大を撤去、60Hz上限で同じゲーム時計から描画。既存の専用生成素材を部分レイヤーとして再利用する。
- 月：同じ月・空・塔を固定。月の画素に沿って紅が強まり、集光後に放射状に解放する。
- 水面：城と空を固定、水の範囲だけ横方向の流れを付ける。水紋の明部と専用の水柱素材を別レイヤーとして解放する。
- 覚醒：顔・髪の形を固定し、暗さから現れる人物と剣への集光、解放の動きで示す。口や目の形状変形は行わない。
- 抜刀：構えと振り抜き後の2姿勢に絞り、連続して画面を横切る斬撃の最中にカットを切り替える。姿勢間を変形補間した全身アニメーションではない。
- 機関：背景を固定し、中央の左右機構を移動して奥の動力を見せる。盤面役物の連動を維持。
城の採用済み「開門前にモヤを消す→扉の奥だけ虹色」は維持。他案に虹色のモヤを一律展開していない。SEなし、確率・払出変更なし。映像はユーザー確認待ち。

### 2026-10-01 同じ渦の使い回しを撤去し、決着へ虹色を集中
ユーザー指摘：渦・集光の似た演出が多く、月の変色が不完全で遅い。城を除く5案から吸い込み状の粒子と長い共通タイミングを撤去。決定時の短い散る粒子は残す。
- 月4.6秒：専用の紅い月の全カットを基準に同じ画素位置で蒼→紅を0.22秒で切り替え、2.3秒で月の光に虹色。部分的なしきい値マスクによる紅色化を撤去。
- 水面5.2秒：横へ走る反射→短い静けさ→3.2秒で虹色の水柱。渦の水紋素材を撤去。
- 覚醒4.5秒（偽通常復帰6.05秒を別途加算）：暗い人物、縦に上がる剣の光、2.5秒で人物を見せ、青いオーラを虹色にする。顔の変形なし。
- 抜刀3.8秒：短い構え、1.65秒で虹色の斬撃、振り抜いた剣の光沢へ接続。
- 機関5秒：下から回路点灯、3秒で左右の機構を素早く開放、奥の動力を虹色。盤面役物連動時刻も短縮に合わせる。
採用済み城8秒は変更なし。全案カメラ固定・SEなし。虹色は各案の決め所の素材に限定。新映像は確認待ち。

### 2026-10-01 抜刀をリザルト画面の斬断へ変更
ユーザー依頼：リザルト画面ごと斜めに切れ、切り込みが左右に開いてRUSH演出へ。人物の構え・振り抜きカットはこの案から撤去。実際の払出額を描いたリザルトを1.25秒見せ、右上→左下へ0.16秒で斬撃。切れ目を短く保持して1.65秒から左右の三角形を1.2秒で開く。文字と数字も画面の一部として同じ切断線で割る。奥にはRUSH背景、3秒で既存RUSH文字演出へ接続。切れ目のみ虹色＋白芯の光。カメラ固定、SEなし。他案は変更なし。

### 2026-10-01 リザルト斬断の全開とRUSH光沢を同期
ユーザー依頼：開き切ると同時にRUSHの虹色「きらっ」。斬断案のみ全開2.85秒でRUSHタイトルへ渡し、文字が揃った後の虹色掃引（タイトル内1.01秒、光が最初の文字へ到達する時点）から開始する。全開後に文字落下を待つ時間を撤去。他案の1文字ずつ落ちる演出は維持。右打ち案内の待ち時間も短縮後のタイトル終端へ合わせた。SEなし。

### 2026-10-01 斬断後のRUSH文字演出を省略せず再生
ユーザー訂正：文字落下を飛ばさない。2.85秒で全開、0.35秒の間を置き、3.2秒からR→U→S→Hの落下・炎・虹色光沢をすべて先頭から再生する。直前の光沢開始位置へ飛ばす仕様は撤回。RUSH背景の継続は維持。

### 2026-10-01 斬断全開後の待ちを撤去
ユーザー最新指定：0.35秒待たず再生。全開2.85秒でそのままRUSH文字演出を先頭から開始。R→U→S→Hの落下・炎・虹色の光沢は省略しない。直前の待ち時間指定を置き換える。

### 2026-10-01 割れ目の奥でRUSH演出を先行再生
ユーザー指摘：開いて見える背景だけの時間をなくす。斬断後1.5秒からRUSH文字の落下を先頭から開始、1.65秒から左右へ開くリザルトの隙間だけに文字を表示する。RUSH文字はリザルトの手前に乗らず、開くにつれて露出する。全開2.85秒時点でも同じタイトル時計が継続し、3.9秒で演出完了・右打ち案内へ。通常側でタイトルを二重再生しない。文字落下・炎・虹色光沢の省略なし。SEなし。

### 2026-10-01 割れ目が広がってから文字落下開始
ユーザー依頼：RUSH演出を見えるように開始を遅らせる。タイトル開始を1.5秒から2.15秒へ0.65秒後ろ倒し。全開2.85秒より前に開始し、文字が落ちる間に隙間がさらに広がる。全タイトル2.4秒を再生するため前段終端も4.55秒へ延長。省略なし。

### 2026-10-01 リザルト斬断→RUSH演出を採用確定
ユーザー「完璧👌」により `../../prototype/reference-review/pixi-result-slash-readable/slash.mp4` を採用確定。実払出額を表示したリザルトを斜めに斬断し、左右へ開く。タイトルは斬断案開始2.15秒から割れ目の奥でR→U→S→Hと落下、全開2.85秒をまたいで炎・虹色光沢をすべて再生。4.55秒で右打ち案内へ接続。文字が落ちる様子を見せるための開始時刻を維持し、省略・全開後の追加待ち・カメラ寄りは行わない。SEなし。この確定は抜刀（リザルト斬断）案に適用し、他の未確定案まで採用済みとは扱わない。

### 2026-10-01 次の実装：通常復帰からの復活RUSH（確認待ち）
ユーザーの次の実装・動画依頼に対し、未確定の復活案を仕上げる。リザルト表示→1.7秒で左打ち→通常画面→4.35秒で再暗転→4.8秒で専用の人物カット→5.9秒で虹色覚醒→6.6秒でRUSH文字の全演出へ接続。旧10.55秒の前段を6.6秒へ短縮。

偽の通常復帰で当たり777が残らないよう、表示だけ2・4・6の停止図柄にする。保存された当たり結果、払出、RUSH残り100回、保留、抽選は変更しない。人物は同じ絵のまま剣の光とオーラで見せ、顔の変形・渦・カメラ拡大は追加しない。RUSHへの受け渡しで通常背景が再び混ざらないようにする。確定した城・リザルト斬断は変更なし。SEなし。

### 2026-10-01 通常復帰からの復活RUSHを採用確定
ユーザー「おけです」により `../../prototype/reference-review/pixi-revival-entry/revival.mp4` を採用確定。リザルト→左打ち→通常図柄2・4・6→再暗転→専用人物の覚醒→RUSH文字全演出→右打ち。前段6.6秒、人物の形とカメラを固定し、虹色は剣と外側の光へ限定。通常復帰は表示だけで抽選・払出・残り100回転を変更しない。SEなし。この確定は復活案に適用する。

### 2026-10-01 レビュー単位をまとめる・RUSH残り3案
ユーザー指示により、細かな変更のたびに確認を求めず、内部検証後に一組で提出する。第一組は月・水面・機関。虹色の主役素材を維持したまま同じ画面上でRUSHタイトルを先頭から再生し、空の背景への切替待ちを撤去。タイトル開始は月2.55秒、水面3.45秒、機関4.25秒（盤面役物の収納に合わせる）。落下・炎・虹色光沢2.4秒をすべて保持し、二重再生せず右打ちへ渡す。タイトルの背後だけ控えめに暗くし、図柄を読めるようにした。カメラ固定、SEなし。城・斬断・復活の承認済み時刻は維持。採用確認は3案一括の比較動画で行う。

### 2026-10-01 RUSH残り3案の確認・月の虹色範囲を修正
ユーザー「月の下らへんが虹色になってないのが気になった、それ以外は問題ない」により、水面・機関と月の進行を採用。月のみ虹色対象の高さ制限を撤去し、淡いハイライトを含めた。白のまま残らないよう月の発光レイヤーに輝度の余地を設け、元の画素の明暗を保ちながら下端まで色が乗るよう修正。演出時間・タイトル・他案・抽選・払出は変更なし。SEなし。Chrome再生で下端の変色とRUSHへの接続、ブラウザエラーなしを確認。修正動画は `../../prototype/reference-review/pixi-moon-complete-rainbow/moon.mp4`。

### 2026-10-01 RUSH突入6案をすべて採用確定
ユーザー「全部確定で良い」により、下端まで虹色に修正した月を含む全6案（城・斬断・復活・月・水面・機関）を採用確定。次の単位は台選択からPixiJS本編への接続。SEと後回しの戦闘リーチは追加しない。

### 2026-10-01 PixiJS本編接続の確認候補
台選択→機種詳細→承認済み盤面・演出→結果→台選択を接続。発射で持ち玉消費、実入賞で抽選・賞球、右打ち自動切替、一時停止・非表示時停止を統合。SEなし。全6案の演出内容は維持。進行報酬・強化・保存は次の組であり、旧数値を復活させない。入口・実装・検証の範囲は `PIXI_SESSION_INTEGRATION.md`。通し動画は当選指定の開発専用確認モードで全払出と100回転終了を実行し、提出用のみ待ち時間をカット。通常入口は本来の抽選。

### 2026-10-01 台選択をゲーセンのフロアへ（確認候補）
ユーザー「ゲーセンの感じの見た目」に対応。独立したカード枠を外し、筐体の島・手前の椅子とカウンター・タイル床・奥のネオン看板・壁の照明・入口を同じドットの店内として描く。PCは5列×4段、スマホは4列×5段。20台のうち既存の遊べる5台を点灯、他15台は準備中表示とし、機種や料金の追加はしない。描画とクリック領域は同一DOM座標に合わせ、画面幅の変更時も再配置する。台番号と空席表示、キーボードフォーカスを保持。台詳細・ゲームの流れ・確率・払出・SEは変更なし。PC/スマホ撮影、20台/5台選択可、詳細とフロアへの往復、横はみ出しなし、ビルドを確認。資料は `../../prototype/reference-review/pixi-arcade-room`。

### 2026-10-01 ゲーセンを明るくカラフルに変更（確認候補）
ユーザー指摘「暗い、カラフルで明るい感じ」に対応。フロア限定でページ背景をクリーム、床を水色とアイボリー、壁を明るいピンク、看板を紫と黄色へ変更。筐体島の背面は水色・ピンク・ラベンダー・黄色・ミント、椅子は水色とピンク。準備中の筐体の過度な減光を弱め、状態ラベルで区別する。配置・操作・遊技中の色は維持。PC/スマホで台選択と戻り、横はみ出しなし、ビルド成功を確認。画像・動画は `../../prototype/reference-review/pixi-arcade-bright`。

### 2026-10-01 ゲーセンの装飾小物（確認候補）
ユーザー依頼：機能がなくても、ぬいぐるみ等のゲーセンらしい物を置く。店内奥にクマ・うさぎの景品棚、ぬいぐるみ入りクレーンゲーム、ピンク/水色のカプセルトイ、三角旗を追加。既存台の上に専用の飾り領域を確保し、描画のみ・クリック対象外。明るい配色・ドット単位を継続。台の数・遊べる台・抽選・料金を変えない。PC/スマホ表示、20台中5台の選択、詳細への往復、横はみ出しなし、ビルド成功を確認。証拠は `../../prototype/reference-review/pixi-arcade-props`。

### 2026-10-01 台選択用筐体のドット密度と世界観を統一（確認候補）
ユーザー指摘：筐体だけドットが細かく、世界観に合わない。旧高精細筐体画像の縮小利用をフロア/機種詳細から撤去。専用24×32ドットの筐体を新しく描き、白い丸みのある外装・パステルの縁・簡潔な盤面/液晶/受け皿/ハンドルへ。フロアでは整数倍率で拡大し、小物と近い粒度にする。遊べる5台は水色、準備中はピンク・紫・黄色・ミント。同じデザインを機種詳細でも使う。遊技中の承認済み盤面・液晶演出は変更なし。PC/スマホで表示と台選択・往復、20台と5台選択可、横はみ出しなし、ビルドを確認。証拠は `../../prototype/reference-review/pixi-arcade-cabinets`。

### 2026-10-01 フロア上下の補助表示を撤去
ユーザー指定：ゲーセン名の看板より上、ENTRANCEより下の要素は不要。台選択のページ見出し・1F/FREE PLAY・入口下の操作説明/料金説明をDOMから撤去。店内の看板・装飾・台番号・選択操作を維持し、料金は既存の機種詳細で確認できる。フロアのアクセシブル名は維持。

### 2026-10-01 看板撤去・スマホのフロア/階ページング（確認候補）
ユーザー意図はパチンコ台を大きく見せること。ゲーセン名の看板を撤去し、小物コーナーを上へ詰める。スマホのみ暫定4台/ページ（2列×2段）へ変更し、1F20台を5ページ化。左スワイプで次ページ、右で前ページ。上で2F、下で1F。2Fは未実装の準備中表示だけで料金/遊べる台を追加しない。上下限で循環せず、曖昧な斜め操作/短いタップはページングしない。1Fのページ位置は階変更/台詳細から戻る際も保持。下部に最小限の階・ページ表示と代替ボタンを置く。PCは20台表示。画面幅を切り替える際に表示数を再構成する。証拠は `../../prototype/reference-review/pixi-floor-paging`。

### 2026-10-01 デザインレビュー・文字なしの空席表示（確認候補）
ユーザー要望でデザイン担当エージェントを呼び、修正前と修正後の画像を独立レビュー。指摘の中心は、拡大表示時の24×32筐体と店内の粒度不一致、椅子の薄さ、背面の平坦さ。筐体を48×64の専用画で再作画し、ガラス反射・盤面・受け皿・銀玉・回転ハンドル・側面を描き分け。白とパステルを維持。椅子の座面厚み/明暗、脚、台座と背面の奥行き、ぬいぐるみとクレーンの陰影も追加。
空席/準備中の可視文字を撤去し、空席は点灯した液晶/ランプと空いた椅子、準備中は消灯と椅子前の低いバーで区別。アクセシブル名では状態を保持。デザイン再レビューの『筐体が以前より小さくなった』を受け、スマホで整数倍率を再調整し台の大きさを維持。4台ページング・操作は変更なし。タッチの横/縦スワイプ、ページ保持、台選択、PC20台、ビルド成功。証拠は `../../prototype/reference-review/pixi-arcade-detailed`。

### 2026-10-01 記事を踏まえた店内素材の規格統一（確認候補）
参照: https://note.com/twotenky/n/n60594c10fe91 の同じ規格で素材を揃える考え方と、https://note.com/shiroiudonko666/n/n9f941e249b8c のアングルの解説。記事の素材は流用せず独自描画。
台選択は浅い俯瞰で、筐体の天面、圧縮された正面、椅子の座面、景品棚/クレーン/カプセル機の上面、床タイルの縦横比を合わせた。筐体の背面を覆う大きなカード状パネルを撤去し、低いカウンターと足元の影へ変更。店内と筐体は同じ整数倍率の画素に揃え、斜線の輪郭も画素単位で描く。幅/高さの小さい端末は上下余白を削減して筐体サイズを確保。点灯＋空椅子、消灯＋バーの区別、台数・ページング・遊技仕様は維持。
390×844、390×667、320×568、PC1040幅の実画面を撮影。横/縦タッチ、ページ保持、台詳細往復、PC20台、横はみ出しなし、ブラウザエラーなし、ビルド成功を確認。証拠: reference-review/pixi-arcade-unified/。採用未確定。SE/クラウド更新なし。

### 2026-10-01 台の稼働状態を木札で表示
ユーザー指定：空席を示す必要はなく、稼働可否だけ分かればよい。稼働していない台は前面に「調整中」と書いた木札を貼る。椅子前のバーを撤去し、未稼働筐体の前面へ木目/縁/留め具付きの木札を追加。稼働台は通常の点灯表示。アクセシブル名も稼働中/調整中へ。架空の客は追加しない。将来プレイヤーがいる場合は着席表示する方針であり、今回マルチプレイヤーや着席同期を実装したものではない。
スマホ/PC撮影、横縦ページング、選択/戻り、ブラウザエラーなし、ビルド成功を確認。証拠: reference-review/pixi-arcade-maintenance/。

### 2026-10-01 筐体を3回レビュー・再作画（確認候補）
ユーザー指定の3ループを実施。各回でブラウザ実画面を撮影して目視確認。
1. 元の長方形ヘッダーと細長い盤面が券売機風に見えるため、丸い肩・円形遊技盤・月メダリオン・張り出した受け皿・円形ハンドルへ外形を再作画。pass-1.pngで確認し、盤面の淡い空白と小さい液晶を次の課題とした。
2. 液晶を拡大し、月/城/3図柄と額縁を描き、外周レール・道釘・中央入口・右の入口を分離。pass-2.pngを確認し、外装と受け皿の単色感が残るため次へ。
3. 肩の月飾り、外装の段差、金属の明暗、受け皿の奥行きと銀玉、ハンドルの縁/くぼみを描き分け。pass-3.pngと木札付きpage2.pngを目視確認。48×64画素と店内共通の整数倍率は維持。新たな客や状態ラベルは追加せず、木札も保持。
最終版はスマホ3寸法/PC、横縦ページング、詳細往復、横はみ出し、ブラウザエラー、ビルドを確認。証拠 reference-review/pixi-cabinet-three-pass/。完成承認は未取得。抽選・物理・SE・クラウドは変更なし。

### 2026-10-01 筐体を採用・調整中文字のみ修正
ユーザー「それ以外は問題ない」により3回レビュー後の筐体外観を採用。調整中の文字だけ、10pxフォント描画から専用11×13ビットマップ3文字へ変更し、半透明の輪郭をなくした。木札の文字下の木目だけ平らにし、背景との干渉も除去。他の筐体・配置・配色は維持。スマホ/PC実画面、台選択/ページング、ビルドを確認。証拠 reference-review/pixi-maintenance-sharp/。

### 2026-10-01 木札の文字サイズ調整
ユーザー依頼で「調整中」の専用ドット文字を11×13から9×11へ再作画し中央配置。木札のサイズを維持して左右と上下に余白を確保。ぼかしや縮小補間なし。実画面で確認。証拠 reference-review/pixi-maintenance-small/page2.png。

### 2026-10-01 プレイ中の筐体・盤面装飾（確認候補）
ユーザー「次でおねがいします」により遊技画面を装飾。cabinet-decor.jsで静的な背景を追加：紺色の印刷盤面、控えめな城/放射模様、外周の銀色の面・金の縁・青いインレイ・星の飾り、OUTを塞がない下部外装。全て描画専用で当たり判定/通路/玉/釘/役物位置は変更なし。液晶枠は同じ幅の中で段差と光沢を追加。盤面下部の大きな長方形パネルを撤去し、入賞口ごとの台座と背景に整理。
初稿は当たり/900払出/RUSH100回終了/結果復帰を記録して計数整合とブラウザエラーなしを確認。仕上げ後はスマホ390×844で通常打ち→当たり→払出の動画、PC1280×960の実画像を新規撮影。最終版のブラウザエラーなし・計数整合・既存227テスト成功・ビルド成功。録画のみ既存の当選指定モード。SEなし。最終証拠 reference-review/pixi-game-cabinet/final/。採用は未確定、クラウド未更新。

### 2026-10-01 Y字の空白を盤面構成から見直し（確認候補）
ユーザー指摘を受け、装飾追加だけでなくLCD下〜ヘソ〜一般入賞口を再配置。LCDの画像/演出の寸法は保ち、下部の枠を中央へ張り出す連続形状に変更。LCD_APRONが描画と衝突面の共通定義。道釘の縦間隔を縮め、ヘソ480→462、ヘソ釘467→449、一般入賞口617→563へ。一般入賞口周囲の釘・入口側面判定も54上へ移動。ヘソ下に6本の受け渡し/分岐釘を追加。右打ち樹脂ルート、電チュー、アタッカー、OUT、抽選/払出仕様は維持。
参照したSANKYOの部品解説 https://www.sankyo-fever.jp/beginner/useful-information/7/ と実機写真 https://www.a-pachinko.com/SHOP/sankyo246.html の『中央装置と下部を一体の配置として扱う』考え方を、この台独自の配置へ反映。ワープ/ステージを追加したものではない。絵で玉を隠す処理なし。
通常強度0.23/0.24/0.25を各200玉（pegSeed0）で確認：中央37/26/10、一般14/22/21、OUT149/152/169、残球0。入賞率を維持したと扱わず、新しい配置の試行値として記録。スマホ/PC実画面と通常→当たり→右打ち払出を撮影、ブラウザエラーなし。動画だけ既存の当選指定。証拠 reference-review/pixi-compact-board/。

### 2026-10-01 装飾の意図を訂正：SAO試作の前景積層を参照
ユーザーは盤面の上に重なって張り出す装飾を意図していた。直前の『空白を縮めるための釘/入賞口移動』だけを解決策・採用確定と扱わない。当時のSAO Unity試作を参照（実装・画像は2026-10-06に対象外として削除）。上部の剣/ロゴ、側面の複層レンズ、下部の薔薇/プレートが盤面とは異なる奥行きに載る構成を確認。
月影へはSAO固有意匠の転用ではなく、盤面印刷→玉/釘/球路→手前の立体装飾という層構造を翻案する。前景装飾は側面・厚み・落ち影を持ち、玉が裏を通る部分と玉へ接触するガイドを区別する。前景にあるという理由だけで物理壁を追加しない。釘のない領域にだけ小模様を描く方針を改める。このターンは参照と方針記録のみ、新しい前景装飾はまだ未実装。

### 2026-10-01 SAOの積層を参考に前景装飾を実装（確認候補）
ユーザー「お願いします」により前景専用cabinet-foreground.jsを追加。参照は当時のSAO試作の正面/斜め画像と造形コード（2026-10-06に対象外として削除）。月影の月メダリオン、上部の銀の翼、液晶側面の金属パネル、下部の翼と台座を、玉の表示層より手前・可動する月蝕役物より奥へ配置。各部品は別の面色、厚み、盤面に落ちる影を持つ。画面に一様な加工をかける方式ではなく、透明な画面上に専用のドット形状を描く。
LCD全域、一般/中央の入口、右側通路と開閉機構の表示範囲を抜き、前景の隙間から盤面が見える構成。前景の奥を通る玉は一時的に隠れる。前景外装は遊技面より手前にあるため、新たな衝突壁は足していない。この変更で釘/入口/物理設定は変更なし（直前の再配置を元に戻したという意味でもない）。SEなし。
スマホ390×844/PC1280×960、通常から当たり/払出を撮影。ブラウザエラーなし、計数整合、ビルド成功。証拠 reference-review/pixi-raised-decoration/。動画は既存の当選指定。採用未確定・クラウド未更新。

### 2026-10-01 玉の全行程より筐体演出の楽しさを優先・前景連動（確認候補）
ユーザー指定で前景装飾を液晶の演出に同期。cabinet-light-motion.jsは実ゲーム時計から状態を決定し、通常は弱い青、リーチは金色の立上がり、当たりは約0.16秒で前景を寄せ/拡大し虹色発光、約1.9秒で復帰、払出は金、RUSH突入は虹、RUSH中は青/紫。cabinet-light-view.jsで上部/左右/下部の4キャリアと、装飾のレンズ・金属の形に沿う加算発光層を構成。輪郭のない画面全体フラッシュは加えない。新たなSEなし。可動する装飾に玉が一時的に隠れることを許容、釘/入賞口/物理は変えない。
既存ゲーム時計なので一時停止と同期。リーチ中の光は当落によらず同じで、この追加装飾が未確定結果を先出ししない。元の月蝕合体演出は保持。動作単体テスト成功、ビルド成功。実ブラウザで通常/リーチ/当たり/払出/突入/RUSHを再生して撮影、PC画像も確認、エラーなし・玉の計数整合。reference-review/pixi-cabinet-light/に約29秒の等速編集動画（待ち時間カット、確認用当選指定）と各場面の証拠を保存。採用未確定。

### 2026-10-01 液晶の占有面積を拡大（確認候補）
液晶210×140を210×170へ変更し面積を約21.4%拡大。横幅と上端は発射レール・右ルートの通過余地を保つため維持し、下端を30下げる。横も拡張した初期案は発射経路と干渉したため不採用。背景・図柄・演出は縦横比を保ったcover表示で約1.214倍、左右端はマスクで切り抜く。中央の図柄・文字は表示範囲内、月蝕合体役物も同じ倍率と中心へ合わせる。枠と下側エプロンの実衝突境界、風車・道釘・中央始動口を下側へ配置し直し、右ユニットは維持。前景側面装飾も縦方向へ配置し直す。新しいSE・抽選/払出変更なし。
左打ち強度0.23/0.24/0.25各200玉で中央39/23/18、一般24/35/31、OUT137/142/151、残球0。配置変更による試行値で、以前と同じ入賞率を保証するものではない。通常/右打ちの液晶非侵入と高速発射0.12秒の回収・計数、強度変更後の排出をテスト。証拠はreference-review/pixi-large-lcd/。採用未確定、クラウド未更新。
最終確認：全230テスト成功・ビルド成功。スマホ390×844とPC1280×960で実画面確認、通常→リーチ→当たり→払出→RUSHを録画し、ブラウザエラー0・払出時計数整合。large-lcd.mp4は約26秒、待ち時間のみカットした等速動画。当選は既存のreview=session指定、玉は実物理。

### 2026-10-01 確定：盤面の約40％を液晶へ
ユーザー「この調整したら、確定で」により、外枠・ハンドル・下皿を除いた盤面に対し液晶約40％、残りを球路・役物・入賞口とする比率を確定。実機の実測値ではなく本作のレイアウト基準。前回の『元の液晶から21％拡大』をこの比率の達成とは扱わない。
実装は盤面開口PLAYFIELD_APERTUREの多角形面積182,698.31、液晶開口236×302＝71,272（約39.01％）。40％の目安に対して±1.5ポイントの回帰チェックを追加。前回液晶210×170の約2倍の面積。幅だけでなく高さを取り、背景は等方拡大・切り抜き、図柄/文字/既存演出は縦横比を維持した中央の表示領域へ配置する。既存の横長演出は縦長いっぱいに引き伸ばさず、暗転時は開口全体を暗くする。月蝕役物の格納枠は液晶の高さに追従し、可動プレートの縦横比は維持。
上部外周レールは横座標をスーパー楕円寄りに整形し、左右共通発射経路を維持。左の風車を小型化、LCD下の短い樹脂ガイド（実衝突面と同じ形・ネジ付き）から道釘→ヘソへ接続。中央始動口はy640へ、一般入賞口の中央はx132/y634へ移動し、OUTとの重なりを回避。右ユニットの位置は維持、電チューの逆ハ釘は縦間隔12→14へ広げ、高密度時の詰まりを解消。前景装飾は拡大液晶の縁に沿って再配置。SE・抽選確率・払出振分けは変更なし。
通常強度0.23/0.24/0.25各200玉：中央64/44/32、一般6/26/40、OUT130/130/128、残球0。この配置固有の試行値で、前配置と同じ入賞率を保証するものではない。通常・右打ちの非侵入/排出、高速0.12秒と0.05秒間隔の排出・計数を検証。証拠reference-review/pixi-lcd-40/。クラウド未更新。
最終確認：全231テスト・ビルド成功。スマホ390×844/PC1280×960で実表示を確認し、通常→リーチ→当たり→払出→突入→RUSHを撮影。ブラウザエラー0、払出時の計数整合。lcd-40.mp4は待ち時間だけを省いた等速動画。確認用の既存当選指定あり、玉は実物理。ユーザーの事前承認に従い、この比率・配置を確定扱いとする。

### 2026-10-01 修正：上部の月を1つに整理・液晶を上へ・左下ポケットの入口を開ける
ユーザー指摘：形はよいが配置が混雑し、左下ポケットが使えない。上部の月を1つ削除して液晶を上へ移動する。
液晶サイズ236×302と約40％の比率を維持したままy272→236（36px上）。下側に重複していた月メダリオンを削除し、上部の翼と月1つを残す。LCD枠の表示・衝突境界・側面/下部装飾を同じ移動量で合わせる。
左下ポケットを覆っていた一本の受け渡しガイドを2部分へ分け、x58〜77の間に実際に玉が落ちる開口を設ける。ポケット入口x67に向かう落下路と、右へ渡って道釘へ進む経路が分かれる。ポケット別の実入賞を調べる回帰テストを追加。一般入賞口の中央はy634→628、縁下端は638へ調整し、OUT斜面との挟まりを解消。
強度0.23/0.24/0.25を各200玉：左下(id0)80/79/87、中央一般(id1)8/7/5、右一般(id2)2/1/0、ヘソ19/13/9、OUT91/100/99。全ケース残球0・計数一致。一般入賞の合計だけで左下が機能したと判断しない。全232テスト成功。証拠reference-review/pixi-pocket-access/、physics-audit.json。SE・抽選/払出変更なし、クラウド未更新。
実ブラウザでもスマホ/PCの全体、通常→当たり→払出→RUSHを確認。ブラウザエラーなし・ビルド成功。pocket-fix.mp4は前半10秒が全体、後半12秒が入口の拡大、いずれも等速（同じ録画の一部を再掲）。

### 2026-10-01 一般入賞口は3つにこだわらず2つへ
ユーザー「無理に3つポケットにしないんでいいんじゃない？」に従い、左端x67の一般入賞口とその左右の衝突縁を削除。個別部品プレビューは維持し、実盤面のみ中央寄りx132と右x268の2つにする（ヘソ・電チュー・アタッカーは別）。左端を成立させるために開けたガイドの隙間も撤回し、x36/y589→x122/y604の連続した樹脂ガイドへ戻す。液晶の形・面積・上へ36px移動した位置、上部の月1つは維持。
2つの一般入賞口・残存する衝突縁・実入賞と排出の回帰テストを更新。関連13テスト成功、通常と高速発射の排出・計数を確認。証拠reference-review/pixi-two-pockets/。クラウド未更新。
スマホ/PC実表示、通常遊技20秒の実録画を確認。ブラウザエラーなし・実セッション計数整合、ビルド成功。two-pockets.mp4は等速・当選指定なし。

### 2026-10-01 実機写真1〜3の共通傾向を参考に左ゲージを再構成（確認候補）
主参考はユーザー添付の実機写真1（リコリス・リコイル）、2（東京喰種）、3（takt op.）。写真4の手描きスケッチは意図の補足に留め、寸法・配置の基準にはしない。特定機種の部品・ロゴ・固有の経路をコピーせず、液晶左下の斜めの縁、縁に沿って右下へ続く複数列の釘、目立ちすぎない入賞口という見えている共通傾向を翻案。
LCD_OPENINGを矩形から左下が斜めの多角形へ変更。左端y468からx190/y558へ斜めに接続し、映像のマスク・画面枠・前景の抜き・衝突境界を同じ輪郭から作る。元の映像を変形させず表示開口を変える。外接高さは322、実開口面積71,132（盤面約38.93％）で従来の約40％目安を維持。斜めに空いた部分は本当に玉が通れ、旧矩形の見えない壁を残さない。
左側は段違いの2列、風車下から右下へは3列の実釘を配置。下側の受け渡し列は横12/縦7、他は横14/縦7で、釘列の役割を分ける。長いleft-lcd-feed樹脂ガイドを撤去。小型風車はx55/y492へ移動。ヘソ位置と2つの一般入賞口は維持。一般入賞口は既存素材の色を抑えて台座になじませる。上部の月1つ、丸みのある内周・四角い外枠、右打ちユニットを維持。玉のサイズは今回は変更せず、レイアウトの比較を先に行う。抽選・払出・SE変更なし。
通常強度0.23/0.24/0.25を各200玉：中央15/8/12、一般27/22/24、OUT158/170/164。全て残球0・計数一致。以前と同じ入賞率を保証するものではない。証拠reference-review/pixi-diagonal-board/、physics-audit.json。クラウド未更新。

- 最終検証：233テスト成功、production build成功。スマホ・PCの実ブラウザで表示を確認し、通常→リーチ→当たり→払出→RUSHを記録。ブラウザエラーなし。`../../prototype/reference-review/pixi-diagonal-board/diagonal-board.mp4` は24秒、前半全体・後半同録画の通路拡大（等速）。確認候補として提出し、クラウド更新は行っていない。

### 2026-10-01 液晶左下と道釘の角度統一
ユーザー指定に従い、液晶開口の斜辺・外枠の物理境界・道釘3列を共通傾き7/12（約30.3度）で計算。開口左下の折れ点y495、外枠y503。月蝕役物の左収納枠も折れ点に追従。道釘の列始点y521/543/559、横間隔14/14/12、各列の縦間隔は横間隔×7/12。通常/右打ちの非侵入・排出・計数、保留消化、高速0.12秒発射を含む関連12テスト成功。抽選・払出は変更なし。証拠 reference-review/pixi-parallel-angle/。クラウド未更新。

### 2026-10-01 道釘の下へ一般入賞口2つ・右下を右打ち専用部品へ
ユーザー指定：右下へ並ぶ道釘の下にポケット2つ、右のポケットと歯車を撤去し右打ちギミックを配置。一般入賞口は(98,604)/(151,634)へ移設、入口の判定・台座も同期。中央ヘソは(210,640)を維持。右風車は表示・物理とも削除。電チューの位置を維持し、下流を丸い角の樹脂通路で左下へ曲げ、アタッカーを(302.75,627)に移設。受け皿と入賞判定も同期、閉鎖時は下流のOUTへ流す。旧右ポケット周辺の独立した釘も撤去。微小な丸みの線分が画素座標で同一点になった際の描画停止を防止。全233テスト・ビルド成功、通常と高速発射の排出・計数を確認。証拠 reference-review/pixi-left-pockets-right-gimmick/。クラウド未更新。

### 2026-10-01 写真解釈の訂正：整列するのは道釘1列目のみ／右ガイドは導入部まで
ユーザー指摘：実機写真の2列目以降を平行な直線列として扱ったのは誤り。液晶左下と平行な1列目を残し、下の釘は受け・こぼしの固定配置へ変更。描画だけのランダム散布ではなく物理位置も共通、狭い隙間で玉を保持しないよう確認。右樹脂は天井側y230から液晶右端沿いy400までの導入部に限定し、その下の長い囲い・取付ネジ・隠れた当たり判定を撤去。下流は液晶枠の境界と電チュー周辺の釘を通る。アタッカーは自然な落下先(359.5,596)へ移し、左側の一般入賞口2つ・中央ヘソを維持。通常/右打ち/開放・閉鎖・高速0.12秒/0.05秒の関連15テスト成功。証拠 reference-review/pixi-open-right-field/。クラウド未更新。

### 2026-10-02 東京喰種の盤面図から構造の傾向を反映
ユーザー提供の盤面図・アタッカー/電チュー位置写真を参考に修正。1列目は液晶斜辺と平行な連続道釘を維持し、下段は3本前後の短いまとまりをポケット上流とヘソ終端へ配置。単なるランダム散布を撤去。右側はアタッカー(359.5,446)を上、電チュー(359.5,596)を下へ変更。羽根と入賞口の描画・当たり判定はポケット座標を共通参照。電チュー手前の釘はy510以降へ移し、上のアタッカーを通過した玉が下流へ進む構造。液晶右端と役物を同じ凹んだ取付面へ組み込み、別々の容器に見える状態を軽減。取付面に見えない衝突壁は追加しない。上部導入ガイドのみ維持、2つの一般入賞口・中央ヘソ・抽選/払出は維持。証拠 reference-review/pixi-integrated-gauge/。クラウド更新なし。

検証：全233テスト・ビルド成功。スマホ/PC表示、通常/アタッカー開放/電チュー開放の実ブラウザ撮影を確認。ブラウザエラーなし。動画は34秒の等速抜粋で、後半2区間は既存の部品確認画面を使用。

### 2026-10-02 最新指示：提供された東京喰種の盤面図を配置基準にする
従来の「複数機種の傾向のみ」「液晶40%」「一般入賞口2つ」から方針変更。今回の904×1280盤面図を基準に、キャラクター・月影機関の意匠を維持して可視配置を再構成する。図記載の確率・RUSH回数・賞球も変更するかはユーザーへ質問中で、回答前にゲームルールは変更しない。
`../../prototype/src/pixi/source-layout.js` に画像座標で液晶/枠/上部装飾の輪郭、左釘・道釘・右釘、入賞口、右通路を管理。画像座標から盤面へx/yとも0.5倍の等方変換を行う。旧画面へ縦方向だけ押し込む変形は廃止し、表示を420×480に変更。一般口は図から読み取った5箇所、ヘソは中央下、アタッカーは右上、電チューは右下。図に合わせ、電チューは大きな羽根から小型の横長開口へ変更した。既存キャラクターと青/銀/金の月の意匠を使い、上部彫刻・左縦装飾・右の装飾帯の占有範囲を図へ合わせる。
画像から読めない内部寸法・奥行き・動作方式は完全一致を保証できない。画像の手作業による座標採取にも誤差があるため、「実機の完全な複製」とは扱わない。左枠の小さな暗い口は可視形状のみで、画像だけから未確定のワープ内部経路を創作して接続しない。
物理：玉半径2.2、散らばる釘は頭の絵と軸の接触半径を分離。玉が通れないほど密な道釘部分は連続した接触包絡面、終端4本は個々の釘との接触を維持する。左の発射通路と盤面は別の奥行きにあり、発射経路内の玉が盤面側の釘へ衝突しないようにした。上昇通路を出た玉だけが盤面側の釘へ当たる。図の縮尺に合わせて発射初速を調整し、発射間隔0.6秒・ステージの発射レート仕様は維持。
証拠 `../../prototype/reference-review/pixi-source-layout`。旧実装は同ディレクトリのbeforeに比較用として保存。クラウド更新なし。

追記：確認用の物理スケールは玉半径2.2、右打ちの発射強度0.85。発射通路と盤面を分離する出口条件を追加。下段の小型電チューは閉時に斜めの蓋で玉を通過させ、開時は可視開口を横切った実球で入賞する。旧「2つの口」「液晶40%」「上部の奥行き変位」のテストは新しい画像配置に基づく検証へ更新。5つの通常口それぞれに実球を落とし、表示と入口判定が一致することも検証する。各口への自然入賞率を原機と同じにしたという意味ではない。

最終調整：密集した玉同士の位置補正後にも樹脂面との接触を解決し、薄い通路を押し抜ける問題を防止。釘と線分には同じ接触計算を保つAABB早期除外を追加。アタッカー前の通路端を画像座標734→746へ、左側の1本を105→107へ微調整した。電チュー開放時には受け面がせり出し、玉がその面へ接触した場合だけ入賞を受理する。玉を0.22秒で開口へ運ぶ表示を付け、閉鎖時は受け面を収納して下流へ通す。これらは写真からの手動採寸を物理的に成立させるための調整であり、図の全座標への厳密一致ではない。
RUSHが進みにくかった原因は電チューへの受け渡し。通常保留との混同と一度説明したが、getterの確認で誤りと判明し訂正した。保留のゲームロジックは変更していない。通常保留があっても電チューを閉じない回帰テストを追加。実入賞で初回900払出→RUSH100回転消化→通常復帰、およびRUSH中の1500払出→100回転復帰を検証した。
比較は compare.html、動画は source-layout.mp4。通常遊技12秒と部品開放試験各11秒を接続した34秒、無音・等速。後半を抽選による連続した実遊技と混同しない。変換元と切り出し範囲はedit.jsonに保存。外観は新たな確認候補であり、ユーザー確定扱いにはしない。
電チュー下の受け面は画像座標(635,856)→(573,856)。下向きの折れを除去し、閉鎖時には受け面も収納する。画像では内部の開閉機構を断定できないため、この動作はゲーム側の再構成であり、実機と同一とは主張しない。受け面との物理接触を入賞条件とし、開口へ移動する玉の表示と大きさを通常の玉に合わせた。
最終検証：全234テスト成功、ビルド成功（既存の500 kB超チャンク警告あり）。0.6秒/0.12秒/0.05秒発射、停止後の排出、液晶非侵入、入口・ゲート計数、実入賞でRUSH100回転→通常復帰を含む。スマホ390×844とPC1280×960の実表示・計数整合、部品動画のブラウザエラー0。source-layout.mp4は34.000秒、無音・等速。tests.log/build.logと各チェックJSONを同じ証拠ディレクトリへ保存。クラウドは更新していない。

### 2026-10-02 左打ち再現の不足への修正（確認候補）
ユーザー指摘「まだ全然再現があまい」。前段の資料風配置と、玉の動作再現は同一ではない。左道釘の間を連続線分で埋めた近似を撤去し、30本を個々の円形接触へ変更。右道釘の接触面は今回の対象外。釘の軸の接触半径を一般釘0.25、道釘0.7、道釘の反発係数を0.85とした。これらはゲームの試作値で、実機測定値ではない。表示上の釘頭と軸径は区別する。位置・入賞判定を吸引したり、ヘソ到達を確率で決める処理は追加していない。
検証：通常の左/右・高速排出・個別釘の跳ね返り・通常変動/保留・RUSHライフサイクルの関連20テストを確認。旧テストの自然入賞頻度への依存を分離：左通常の観測窓を120秒へ、保留の蓄積は自然発射に加えて実玉を入口直上へ落とす試験で確認。ゲーム側の発射間隔0.6秒や保留仕様は変更していない。ブラウザ上の実プレイ30秒を撮影、スマホ/PCエラーなし・計数整合・ビルド成功。動画は全体10秒＋左下拡大12秒の等速抜粋、無音。証拠reference-review/pixi-left-discrete/。
同一条件120秒＋停止後30秒、強さ0.22:一般1/ヘソ7/OUT150/戻り19、0.24:一般15/ヘソ2/OUT141/戻り20、0.26:一般199/ヘソ0/OUT1/戻り0。各残球0。ただし強さによる経路・入賞の偏りは大きく、実機の動的な再現や入賞率一致が完成したという検証ではない。今回の採用をユーザー確定扱いにせず、前回の完成相当の説明を引き継がない。クラウド未更新。

### 2026-10-02 左上の最初の通路（確認候補）
ユーザーが拡大提示した入口に範囲を限定。入口4本と下の散らばる釘の既存座標を維持し、抜けていた2本の細い下降ガイドをsource-layoutへ追加。描画と接触線分を同じ座標から構成。上部装飾の左輪郭を参考図の段階的な絞りへ変更した。手前の縦装飾と奥の通路壁を分け、手前の装飾を結ぶ隠れた斜面が入口を塞いでいた箇所を撤去。物理境界は手動採寸誤差と玉径のため微調整しており、内部奥行きの実測再現ではない。
新ガイドは盤面へ出た玉だけに作用し、発射レール上昇中の玉には作用しない。入口10本の釘の反発を0.8へ調整。これはゲーム試作値であり実機の測定係数ではない。道釘は個別接触のまま。右側・抽選・払出・SEは変更なし。
検証：関連10テストと左道釘の個別接触1テスト成功。通常120秒、右側各40秒、高速発射の停止後排出、液晶非侵入、計数整合、保留消化を含む。別途強さ0.22/0.24を各40秒発射＋30秒排出し、両方残球0。スマホ/PCブラウザエラーなし、計数整合、ビルド成功（既存のチャンク容量警告あり）。動画left-inlet.mp4は全体8秒＋左上拡大14秒、等速・無音。撮影と複数フレームで入口の表示を確認。証拠reference-review/pixi-left-inlet/。ユーザー確定扱いにはしない。クラウド未更新。

### 2026-10-02 役割分担によるW移行・第一統合
ユーザー指示によりLE/デザイナー/PMの3名が直接調整。W独立制御を実装し、PMが特図排他と保留追越しを指摘してLEが修正。新制御11テスト成功。一般入賞口を左3個、下部普図口を別分類へ訂正。上部架空ゲートを撤去し、普図口への実入賞を計数。旧Sessionには賞球1のみ互換接続し、特図抽選を増やさない。旧本編の開放条件は互換動作であり実機W制御へ移行済みではない。
W制御の操作レビューは /dev/w-control-review.html （開発サーバー用）。ブラウザで普図1消化→電チュー2玉→特図2/V→10入賞150払出と閉鎖を確認。既存盤面起動とerror logなしも確認。fuzu観測8テスト＋別途下部口実玉1テスト成功、ビルド成功（既存チャンク警告）。証拠 reference-review/tokyoghoul-w-team/。
変更前全テスト239件のうち237成功、左道釘の残球2件あり。位置126.939/515.005と153.014/528.655、隣接釘の谷で停滞。球径と釘軸径の再校正が必要で、強制移動・消去は未導入。本編W接続、通常突入母数の解決、開閉時間、6000+α、内部V経路は未完了。クラウド更新なし。


## 2026-10-02 W本編接続と実球検証（完全再現は未完）

W独立制御をSessionGameの本編へ接続。通常・特図2・普図の保留と抽選結果を分離し、1500×2の各V入賞を物理球で検出する。Vは内部実形状未確認のため小当り中のアタッカー実入賞で代用したpolicy。チャージは777確定図柄を出さずCHARGE/300表示に分離。旧天井・強化・賞球倍率は適用しない。

本編Chromeでチャージ300→通常復帰、初期RUSH/当選だけ固定した自然発射→普図→電チュー2→V2→3000→RUSH継続を録画。玉の位置/入賞を注入したのはチャージ確認の最初のヘソ2球のみ。RUSH動画の全球は自然発射。実画面の収支一致・pageerrorなし。証拠は reference-review/tokyoghoul-w-live/。

物理校正で球半径1.8、釘軸半径.25、右道釘5本と成形体を採用。これは資料座標に対する推定校正で実測値ではない。15テストと9条件の停止後残球0・計数一致。釘96点の原図1対1一致やワープ/ステージ、奥行き、開放時間は未確定。途中保存は既存方針どおり設けず、BFCache復帰は台選択へ戻す。

### 2026-10-03 上部装飾：液晶の人物と下向きの剣

ユーザー指示により、上部の仮面／兜を液晶の銀髪騎士の胸像、手／籠手を少し左下へ向く下向きの剣へ変更し、上部中央の月を撤去。今回の範囲は上部装飾と筐体装飾の移動。外枠上端の月・液晶背景・既存月蝕役物の造形動作には適用しない。人物・銘板・枠・右帯・下部装飾は固定し、当たり時に剣だけを真下へ急落下→小さな反動→保持→収納する。発光は維持。透過人物は採用済み液晶画像を参照した生成素材で、配置方針を実装した確認候補。画像細部の採用は未確定。動作動画と検証は `../../prototype/reference-review/upper-character-sword-2026-10-03`。物理・抽選・払出変更なし、クラウド更新なし。

### 2026-10-03 上部訂正：キャラが構えた剣を右の月へ振る

最新ユーザー指示により前項の下向き剣・月の撤去・垂直落下を置換。剣をキャラの肩近くへ移し、柄の手前に小さな鎧の手を付け、刃を上向きにする。三日月を上部右端へ復帰し、当たり時は柄を支点にその月へ素早く振り、反動・保持を経て構えへ戻る。人物の虹色化を禁止し、上部人物／背景／月を既存発光対象から除外。中央の斜め線は撤去し、夜空・雲・遠景の城の背景を生成して上部へ配置。月蝕役物や液晶の当たり図柄は今回の変更対象外。実画面動画・素材生成記録・検証は `../../prototype/reference-review/upper-moon-slash-2026-10-03`。絵と動作の採用は確認候補、クラウド更新なし。

### 2026-10-03 月の満ち欠け×色、長い剣、追加の手を撤去

最新ユーザー指示により刃を右の月を横切る長さへ延長し、キャラに追加した小さな鎧の手を撤去。月の金銀の外縁と黒い円盤を撤去して透明な三日月／半月／満月へ変更。色は無色／緑／青／赤、各軸この順で強くする。追加回答により色を優先し、全体順位は無色三日月→半月→満月→緑三日月→半月→満月→青三日月→半月→満月→赤三日月→半月→満月。剣を振る結果演出中は月を赤くする。キャラの虹色禁止を維持。

12組の具体的期待度％はユーザー指定待ち。形・色の12通りと表示経路を実装したが、出現率／信頼度の割り当ては未実装。予告の赤と結果演出の赤を混同しない。現時点の通常表示は三日月・無色。証拠 `../../prototype/reference-review/moon-cues-2026-10-03`。月のゲーム側抽選・W仕様を勝手に変えない。クラウド更新なし。

### 2026-10-03 月予告：期待度12値を確定・接続

ユーザー指定：無色6/11/23%、緑8/19/31%、青14/28/39%、赤26/38/54%（各行は三日月／半月／満月）。同じ形で色が、同じ色で月相が強くなる。組み合わせ全体の序列は最新の%に従い、直前の一律色優先12段階を置換する。

既に確定した当たり／外れ側の判定に表示専用月予告を付与し、当たり確率やゲームrngを変えずに指定の事後期待度へ校正。通常は図柄揃い判定、RUSHは普図当選判定に対する値。予告なしの暗い月と、点灯した予告月を区別。全リーチに必ず月予告を出す方式にはしない。剣の結果後の赤化は予告値の対象外。合成サンプル・数式確認・抽選結果とrngの同一性・実表示の証拠は `../../prototype/reference-review/moon-reliability-2026-10-03`。手なし・月の外縁なし・長い剣・キャラ虹色禁止・背景を維持。クラウド更新なし。

### 2026-10-03 柄を中心に剣を一周・月を軌道内へ移動

最新ユーザー指示により、剣は固定した柄を支点に時計回りに一周し、小さな反動を経て元の構えへ戻る。盤面からはみ出さない長さへ調整し、月を上部右端から剣の届く位置へ移動。原図座標で柄426/324、月558/296。追加の手、月の外縁、人物の虹色化は引き続き設けない。

指定12値は当たる前の月予告の期待度だけに適用。当たり後の赤い月は結果演出として扱い、予告フラグと期待度を解除する。抽選確率の変更なし。関連8テストとビルド成功。Chrome録画で一周・停止・画面内の軌道・予告11%から結果後の期待度なしへの切替を確認、ブラウザエラー0。証拠 `../../prototype/reference-review/hilt-spin-2026-10-03`。クラウド更新なし。

### 2026-10-03 月の見た目を自然にする

ユーザー指示により上部の月を滑らかな球面の光と影で描画し、海の暗部・柔らかいクレーター・淡い光を追加。陰側は透明、外縁の枠なし。256pxの事前生成テクスチャを線形補間して表示する。三日月／半月／満月と無色／緑／青／赤の12通り、指定期待度、位置、大きさ、柄を中心とする剣の一周は維持。予告期待度は当たり前のみ。

12通りの比較画像とChromeの通常→リーチ→当たり→剣回転→復帰を今回のソースで撮影。関連8テストとビルド成功、ブラウザエラー0。証拠 `../../prototype/reference-review/natural-moon-2026-10-03`、6秒等速・無音MP4。クラウド未更新。

### 2026-10-03 予告なしの薄い月を撤去

ユーザー指示により、月予告も当たり結果演出もない時の月のalphaを0へ変更。従来の28%表示を廃止し、月予告または当たり演出でだけ表示する。無色予告は月が表示される有効な予告であり、非表示とは区別する。自然な表面・12値・剣の動きは維持。証拠 `../../prototype/reference-review/moon-hidden-idle-2026-10-03`。クラウド未更新。

### 2026-10-03 月の出現時に色を確定

最新ユーザー指示により、月が最初に表示された時点の形・色をその変動の終了まで固定する。当たり時・剣回転時に赤へ上書きする従来方針を撤回。次の変動で新しい月予告を選ぶ。非表示待機と、当たり前だけの指定12期待度は維持。9テスト・ビルド成功。今回の証拠 `../../prototype/reference-review/moon-locked-color-2026-10-03`。クラウド未更新。

### 2026-10-03 月蝕役物を液晶の外から進入させる

ユーザーの「映像からではなく、もっと外から」という訂正により、可動役物全体の液晶開口クリップと可動部の矩形クリップを撤去。暗転だけを液晶開口へクリップする。左右の文字プレートは枠の外から手前へ入り、上部冠は液晶上端より外から降りて合体、枠外へ収納する。支持レールを外へ延長し、作動中の枠沿い格納口を表示。液晶内の合体映像に見えていた描画境界を修正する。図柄停止前の作動時間、文字の造形、上部の人物・剣・月予告、抽選と物理は維持。

今回のChrome録画と進入／合体／収納の連続フレームで、左右部品が液晶外の装飾に重なることと上部からの進入を確認。10テストとビルド成功、ブラウザエラー0。証拠 `../../prototype/reference-review/eclipse-outside-2026-10-03`。6秒等速・無音MP4。クラウド未更新。


### 2026-10-05 初心者資料に基づく案内・通常発展の改善

ユーザー指示により改善レビューから実装。通常リーチの表示専用発展を4.8秒で追加し、リーチ止まり・発展外れも残す。月光収束→剣に光→一閃→当落。勝ち側のみ2.4秒から既存月蝕、外れの不揃い停止を0.7秒保持。RUSHの既存短尺は維持。消化中保留へ角括弧、電チュー/V待機へ液晶案内を追加。詳細・任意ヘルプに自動発射・入賞口・持ち玉/払出/通算抽選・月予告12値を説明し、操作パネルに現在状態と残回数を追加。未告知当選を先に表示しない。

既存W抽選・物理・出玉・自然入賞・月12値と形/色固定・6倍ズームは維持。GF07確率の共通定義、GF08消費済み履歴と古い球IDの安全な退役を実装。内部V・開閉時間などGF01〜06は一次資料で確定できず既存policyのまま未完。

今回のChrome実画面で発展当たり/外れ・CHARGE300・自然右発射からV/払出・V時間切れ・RUSH終了を確認し、等速/無音の約2分25秒MP4を作成。スマホ幅390×844の3表示で発展/拡大/777復帰も確認。全体298テスト、最終追加・関連20テスト、最終ビルド成功。録画に指定条件は字幕で明示。根拠と範囲は[実装記録](improvement-review/2026-10-05/implementation.md)、最新証拠は`../../prototype/reference-review/improvements-2026-10-05/`。クラウド未更新・pushなし。

### 2026-10-05 ユーザー訂正：改善対象は内部処理

上記のマニュアル追加は依頼の意図と異なるため撤去。開始前の自動発射説明、任意ヘルプ、入賞口位置図、月予告期待度表は現行画面に残さない。内部処理の確率共通化・履歴保持と抽選／保留／払出を中心に改善する。上記の案内追加・録画は撤去前の履歴として扱う。


### 2026-10-05 内部処理中心の最終検証

最新方針に合わせマニュアル追加を外し、内部処理・発展・状態表示の現行画面を再確認。確率共通化・保持量・演出中も進む機構期限とポーズ時停止・実払出の関連20テスト、最終ビルド、Chromeの停止/再開/終了が成功。自然通常・発展当たり/外れ・自然RUSH払出・CHARGE300・V時間切れ・RUSH終了の8区間を2分11秒のMP4へ更新。字幕で指定条件を明示。詳しくは[最終実装記録](improvement-review/2026-10-05/implementation.md)。クラウド更新・pushなし。

### 2026-10-05 通常・RUSHとも液晶主役の90秒リーチ

最新ユーザー指示で、通常とRUSHの両方のリーチを1〜2分にする。代表一本を90秒で実装し、先行の通常4.8秒／RUSH短尺維持方針を上書きする。28秒から液晶で「上に注目」を案内し、30〜35秒だけ上部の剣・既存月予告を見せる。その間、液晶の攻撃・布の動きを待機させる。液晶表示を選んでいる場合も一時的に盤面へ引き、36秒までに元の表示へ戻す。月予告がない抽選では月を作らない。月の形と色は既存の抽選済み値を保持する。

液晶の対峙・先制・反撃・圧力・再起・一閃を別区間にし、新しい人物6ポーズと月下の石橋背景を採用した試作。最後の87.7秒から勝ち側のみ既存月蝕を作動し、90秒で中央決着。通常とRUSHに共通の表示タイムラインを使い、結果、保留、出玉、機構期限は変更しない。手足はポーズ差分であり、完成した連続作画とは扱わない。

PixiJS優先。Three.jsとの同素材・共有動作の比較画面を用意し、両者の滑らかさとCPU描画送信を計測する。端末実機の検証は別途必要。詳細は[絵コンテ](long-reach/STORYBOARD.md)と[比較・実装記録](long-reach/IMPLEMENTATION.md)。クラウド更新・pushなし。

### 2026-10-05 最新訂正：54秒の攻防・専門用語を外した案内

ユーザーは、尺を伸ばすために動作をゆっくりにすることを求めていない。通常・RUSHとも1分未満へ。上記90秒方針は撤回し、[絵コンテ](long-reach/STORYBOARD.md)の54秒へ再構成する。斬り込みは約0.18秒。先制・回避・押される・反撃・敵の受け止め・主人公の再起・最後の一閃を別の動作と構図で示す。顔の近景と引きを切り替える。17秒案内、19〜24秒の上部を独立させ、25秒までに選択表示へ戻す。

`juice-it-or-lose-it`をプロジェクトの`.agents/skills/`へ導入。攻撃の接触に剣筋・局所光・火花・反応・短いカメラ反動を同期し、物語と顔を隠さない。動作を遅くして埋める処理、機構時計を止めるhit-stop、全面白フラッシュは入れない。控えめ設定を用意する。手足の連続作画の完成とは扱わない。

遊技中の液晶・操作パネル・当り／RUSH終了の表示と、旧戦闘・発射案内を点検。「電チューへ」「V入賞待ち」「普図」「ヘソ」「アタッカー」の処理名は案内に使わず、「右打ちを続けて」「左打ちでスタート」へ。結果の合計は「獲得玉数」、回数は「プレイ回数」。保留・内部処理の用語を機械的に全部禁止する規則にはせず、専門説明は開発・仕様画面へ分ける。記録は[54秒への修正](long-reach/REVISION-54S.md)。


### 2026-10-05 最新訂正：液晶継続・矢印だけの上部案内

[演出パターン台帳](PRESENTATION_PATTERNS.md)を優先する。上部演出による液晶待機・「上に注目」・暗転・自動引き画を撤回する。17〜21秒の弾む上矢印のみ重ね、19〜24秒にも受け止め・反撃を描く。RUSH突入は大当りと共通の右打ちカットインで案内する。


### 2026-10-05 同じリーチの連続を避ける

承認された演出台帳の方針を維持し、逆境からの反撃／先手からの逆転劇／互角の斬り合いを本編へ接続。攻撃側・反撃順・冒頭の近景・再起の画角を変える。3種類の順序を組み直す演出専用処理を通常とRUSHで独立させ、連続を抑える。当落・遊技乱数・月予告には依存しない。54秒本編、上部5秒、既存素材、控えめ設定を維持。専用の復活と即告知は未制作。


### 2026-10-05 復活58秒とRUSH即告知12秒

通常の当りへ敗北→静寂→月光→再起の復活、RUSHの当選へ対峙→構え→一閃の即告知を接続。共通の攻防差分とは別に、当選4件のうち標準3件＋特殊1件を演出専用で組み直す。外れを復活当りへ再抽選しない。勝利告知は復活55.7秒、即告知9.7秒まで出さない。即告知も上部4〜9秒に既存月予告を表示し信頼度の割当を保つ。現行素材のポーズ差分での構成。

### 2026-10-05 全パターン表と信頼度の採用方針

ユーザーが復活発生後の確定、通常勝利に加えた直当たり・プレミアの方針を了承し、全パターン表の作成を指示。[制作基準の全表](PRESENTATION_PATTERNS.md)に通常・RUSH・短い当たり／外れ・戦闘3本の全当落・復活・直当たり・月／剣のプレミア・保留・上部月12値・獲得・突入6種類・継続・終了を整理した。

互角→先手→逆境の順に期待を上げ、通常5／20／50%、RUSH20／50／80%を制作目標にする。復活は発生前まで普通の敗北と共通にし、発生後は確定の喜びを見せる。全外れを長い戦闘や復活待ちへ集めない。追加プレミアは液晶内の固有の二重月輪／刀身紋章で示し、既存の上部月の形・色・通常剣動作の意味を置き換えない。信頼度の数字は液晶に出さない。

本追記は制作方針。現行の当落非依存の3本一巡と特殊各25%は未変更。今後は当落別配分・連続抑制・既存月12値の同時校正が必要であり、表の数値を実測済みと扱わない。今回の新規設計は外部実機の信頼度を再現するという主張ではない。
