# C担当・代表戦闘の品質改善

## 長髪v4/v7の担当受け入れ完了（2026-10-05 最新）

長髪の既存v4・中間v7と再測定した登録値を、本編採用可能なC成果として受け渡す。素材は変更せず、`long-reach-timeline.js` の全12姿勢の刀身・足元登録と `long-reach-view.js` の風変形範囲を修正した。共有loader・flow・normal-spin-viewは編集していない。rootが2枚同時接続した本編の受け入れ検証はroot担当。以下の「未採用」「登録修正待ち」「全尺進行中」は途中経過で、本節がCの最終状態。

`hair-full/browser-check.json` に3本×当たり54秒／外れ54秒／復活58秒の全9条件・例外0を記録。等速の全尺動画は `hair-full/{pressure,initiative,exchange}.mp4`（各3結果の連続記録、結果間に測定用seekあり）。各結果の開始から最後までを実時間再生し、振り下ろし・接触・反撃・膝つき・再起をPNGと動画で確認。表示fixtureでの当たり51.7秒／復活55.7秒以降は描画を本編結果へ渡すため隠れる。本編の図柄決着・右打ち・会計が独立動画に含まれるという意味ではない。

全9条件のrAF間隔p95は16.7〜16.8ms、最大16.8ms（headless Chrome・420×280表示・3並列contextでのrAF時刻差）。この条件では姿勢動作が追える。スマホ実機の描画性能や連続60fpsの保証にはしない。時刻・動画パス・検証ソースSHAはJSONに保存。コードfreeze継続、rootの全尺検証中にCのコード変更は行わない。

人物の同一性とセル収まりの最終比較は `hair/comparison-final-candidates.png` と `hair/registration-overlay.png`。全12姿勢を200px表示で明るい空・黒へ合成した `hair/all-12-{sky,black}.png` でも灰霞・不自然な透明化・セル欠けは確認されなかった。橋／空／黒での実PixiJSの構え・膝つき・立ち上がりは `hair/{bridge,sky,black}-{guard,kneel,rise}.png`。主人公全7姿勢で長い銀髪、青い目、金の髪飾り、紺金衣装を維持しているとCで確認。再生成を追加せず、登録が確定した2枚を維持する。

登録後の短い比較動画は `hair-registered-playback/{pressure,initiative,exchange}.mp4`。3本とも敗北前の51.85秒／53.5秒の通常外れ・復活PNGが同一で、例外0。関連18テスト成功、`git diff --check`成功。変更ソースと素材のSHAは `hair/source-sha256.txt`。確認画面は今回の長髪素材へ更新済み。旧比較画面の残った短髪参照は下段の注意を守る。

残る限界：12作画姿勢＋35msの移行であり、全時間の腕・脚の連続作画ではない。測定点は約3source pxの視覚測定許容。微小alpha1〜2の境界残留は数値上あるが、3背景合成では見えない。敵の右足・マントをセル内へ畳んだことは比較で確認済み。スマホ実機・長時間遊技・音の実聴取・本編全尺と結果復帰・ユーザーの好みのレビューはrootの全体受け入れに残す。これらをC独立確認の成功へ含めない。

## 長髪素材の登録反映・コードfreeze（2026-10-05 最新）

長髪の既存v4・中間v7専用の登録を `long-reach-timeline.js` へ反映した。全12セルを512pxの元寸法で測り直し、握り／刀身先端の `WEAPON_POINTS` と足元の `FRAME_FLOORS` を明示した。測定許容は約3 source px。`hair/registration.json` と `hair/registration-overlay.png` が実素材へ重ねた測定証拠。旧短髪用登録との互換は保持していないので、本編は2枚同時にv4/v7を使用すること。rootから本編2枚同時切替済みとの連絡を受けた。Cは共有loaderを編集していない。

風によるMesh変形を主人公の髪・上側の布へ限定し、足元と敵の剣を揺らさないようにした。画像の全身変形で握りや剣先が登録から外れる原因を減らした。関連18テストで全3本の刀身交差・接触後反応・粒子の接触位置保持・姿勢境界の連続性・当落とFIFO・時計の回帰を確認。`hair/tests-registered.txt`。Cのコードはここでfreezeし、rootの本編受け入れ確認中は変更しない。

alphaFullが1/0になる理由は人物内部の主alphaが250〜254だからで、画像全体が薄いという意味ではない。既存側alpha>=250は443267画素、中間側386497画素。alpha129〜249は各53832／44563画素。全256値と人物内のサンプル分布は `hair/alpha-distribution.json` に記録。境界のalpha1〜2は残るが、実際の420×280液晶表示で橋／明るい空／黒背景へ合成し、灰青霞・背面矩形・目に見える人物の薄さは確認されなかった。背景のRGBをそのまま表示する画像ビューの霞を、RGBA合成の結果と混同しない。不要な再生成による人物・握りの変化を避け、同じv4/v7を維持する。

`hair/{bridge,sky,black}-{guard,kneel,rise}.png` と `hair/background-check.json` が実合成証拠。主人公全7姿勢の長い銀髪・青眼・金の髪飾り・紺金衣装、全12姿勢のセル内収まり、敵の畳んだ足とマントを測定overlayと比較画面で確認した。敵の足変更は下段に明記したままとする。Cの現在の専用 `combat-review.html` / `hair-combat-review.html` は長髪v4/v7を参照。過去stage2/stage3動画は旧短髪の歴史資料であり現行品質の証拠ではない。

登録反映後の等速抜粋は `hair-registered-playback/`。全3本×当たり／外れ／復活の全尺実再生は `capture-hair-full.mjs` で進行中、完了後 `hair-full/browser-check.json` と動画へ記録する。これは実描画の担当確認で、ゲーム会計・本編結果表示・スマホ実機の合格とは分ける。全尺完了待ち以外にCが予定しているコード変更はない。

既存の `src/reach-comparison.js` と `tests/long-reach.browser.mjs` には旧 `duel-poses-v1.png` の参照が残る。Cの所有範囲外なので編集していない。以前のPixiJS/Three.js比較fixtureは今回の登録変更との組合せで現行採用確認に使わず、歴史資料として扱う。再比較する際はrootが2描画器の登録と素材を同時に揃える必要がある。

## 長髪修正候補の受け渡し（2026-10-05 最新・未採用）

候補は `prototype/public/assets/lcd/long-reach/duel-poses-longhair-v4.png` と `duel-intermediates-longhair-v7.png`。元の基準画像と対象atlasを参照した内蔵imagegen編集で、主人公の全7姿勢に長い銀髪を戻した。顔、青い目、金の髪飾り、紺と金の装備、剣は比較画面で確認。各1536×1024・RGBA、3×2セル。共有loader・タイムライン・当落処理は変更していない。

セル越境を直すため、既存側frame4と中間側frame9の敵の右下腿・足先を内側へ曲げ、frame9のマントを畳んだ。敵の足先位置を完全に維持した素材ではない。生成を重ねると刀身先端にも変化が残り、既存側frame4では旧ランドマークのlocal x≈10に対し候補先端はx≈48。中間側frame7/frame10にも先端差があるため、旧 `WEAPON_POINTS` をそのまま使った本編採用は不可。候補の剣・握りの再測定と採用時の登録更新を残す。これは髪だけを戻した完全同一画像ではない。

`prototype/reference-review/parallel-combat-2026-10-05/hair/asset-check-final.json` にSHA・alpha・全12セルの高alpha輪郭boundsを記録。全12セルでalpha>128の輪郭は境界内に収まり、隣セルの人物・剣・髪・マントの切れを比較画面で確認した。外側の多くはalpha=0だが、一部セル境界にalpha1〜2/255の極小残留があり「全背景完全alpha0」とは報告しない。Chromeでチェッカーと月夜背景へ合成した比較・実再生では灰色の地は見えなかった。厳密alpha清掃と登録更新を含め、品質合格はまだ出していない。

比較証拠：`hair/comparison-final-candidates.png`（元絵＋修正前後12姿勢）。再現画面：`hair-identity-review.html` / `hair-combat-review.html`。生成プロンプト：`hair/prompts.json`（初回identity-preserve、越境修正2段階、内蔵imagegen・transparent_background:true）。生成元はCodexのgenerated_imagesへ保存したまま、候補を新しいファイル名でコピーした。初稿v2/v5と途中v3/v6は不採用候補。

候補を現行 `createLongReachView` へ渡した独立PixiJS画面で3本の攻撃→反撃→敗北→復活を等速抜粋再生した。`hair-playback/browser-check.json`：JavaScript例外0、通常敗北／復活前の51.85秒・53.5秒の液晶PNGは3本とも同一。PNGと3本のMP4を `hair-playback/` に保存。通常姿勢から振り下ろし、膝つき、立ち上がりの連続再生を含む。旧刀身登録を使用した候補検討用映像であり、登録整合の合格・本編接続後の確認・自然入賞・会計の証明にはしない。

候補SHA-256：既存側 `804c6dc3a8d900703c701436213c3020c66f90a3385d1813cff31e2aae703a9e`、中間側 `0391ea3c361d9f24a03b3b73a271cd2e77d9b6691bfe63b2fe8ccc2bde910259`。統合担当は静止比較と動画を見て人物同一性・敵の足変更をレビューし、刀身登録の修正とalphaの扱いを解決してから2枚同時に接続・本編再録画する。ユーザーへ技術的受け入れ判定を委ねない。旧短髪素材も候補も、全演出の完成品質ではない。

## キャラクター同一性の訂正（2026-10-05 最新・品質未合格）

ユーザーが髪型の変更を指摘。アイデンティティ基準の `prototype/public/assets/lcd/character-still-v1.png` は長い銀髪だが、既存6姿勢 `duel-poses-v1.png` と中間6姿勢 `duel-intermediates-v4.png` は短髪になっていた。設定変更の許可はない。下段の透過・動作・当落検証の成功を、人物同一性の合格へ流用しない。現行v1/v4は髪型不整合により品質未合格。

元キャラクター画像と各対象atlasをimagegenへ併せて参照し、髪だけを長い銀髪へ戻す修正を進める。顔・装備・金の髪飾り・剣・握り・足元・各512×512セルの配置と尺度を保ち、RGBAの真の透過と3×2セル収まりを確認する。旧atlasと共有loaderは上書きしない。生成結果・比較証拠をCで記録し、統合担当が比較レビューした後に接続する。

## 透過修正・最終採用v4（2026-10-05 最新）

追加atlas v3は実再生で灰色の半透明の地が見えたため、品質合格にしない。imagegenの背景抽出編集で、人物・剣・衣装を保ったまま周囲のalphaを0へ修正した。採用は新規URL `/assets/lcd/long-reach/duel-intermediates-v4.png`。元atlasとv3を上書きせず保存した。

採用ファイル：`prototype/public/assets/lcd/long-reach/duel-intermediates-v4.png`。

統合担当が本編をv4へ切り替え、長尺5ケースで灰色の地が消えたこと・例外0・当落/会計を確認したとの連絡を受けた。v3は本編ロードから外れたため `prototype/reference-review/parallel-combat-2026-10-05/asset-drafts/duel-intermediates-v3.png` へ退避した。v1/v2も同ディレクトリ。公開素材には採用v4だけを残し、stage2の動画・画像は不採用v3の履歴として保持する。Cの確認用HTMLもv4を参照する。

SHA-256：`1b9132dc968ec69c00ee4f5ae1df92ba5295cd6f51073b37788cc0ff2d8a636c`。

RGBA・1536×1024。完全透過pixel数はv3の670からv4の1,132,483へ。顔・手・剣の外に採った5点のalphaは、v3の156/230/58/25/5からv4ですべて0になった。これはalpha確認で、見た目の合格を統計だけで認定しない。最終再生確認は `prototype/reference-review/parallel-combat-2026-10-05/stage3/` に記録し、stage2は灰色の地が残る不採用v3の証拠として残す。

**統合担当への変更：** board-runtime.jsの追加atlas URLをv3からv4へ変更して新規にロードする。12枚版のAPI・ランドマーク・登録位置・upperCueActiveは変更なし。既存v3をロードしたままのブラウザの録画を、v4の成功根拠には使わない。Cは共有ロードを編集していない。

最終実描画：Chromeの420×340表示、3本それぞれで敵の先制・反撃・通常敗北・復活を等速で再生。`stage3/browser-check.json` は3本すべて完了・JavaScript例外0・通常敗北と復活前の51.85/53.5秒の液晶PNG一致を記録する。先手の6.32秒と各本編の53.5秒など、追加姿勢の周囲から灰色の地が消え、元の橋・空がそのまま見えることを実際のPNGで確認した。`stage3/{pressure,initiative,exchange}.mp4` は各本編の等速抜粋（区間間はseekで移動したfixture）。`stage3/source-sha256.txt` はコード・テスト・採用v4のhash。関連18テストは `tests-stage3.txt` で成功。本編での再録画・長時間・スマホ実機は統合担当の検証へ渡す。

最終背景抽出の編集プロンプト（内蔵imagegen、参照はv3）：

> Use case: background-extraction. Edit target: this six-sprite 1536x1024 image. ONLY FIX ALPHA TRANSPARENCY, preserve all six characters, poses, sword shapes, anatomy, colors, details, sizes and positions exactly. This atlas has unwanted gray brown and blue semitransparent background haze/cloud/rectangular backplates around the characters. REMOVE ALL THIS HAZE COMPLETELY. Every pixel outside the physical silhouette of each character, their cape, armor, boots, hair and sword must be fully transparent alpha=0, not translucent gray. No atmosphere, no aura, no rim glow spread outside silhouette, no bloom, no drop shadow, no floor. Sword blades remain solid blue/silver/purple physical shapes with crisp outlines, no cloudy emission. Preserve sharp pixel-art silhouettes and internal shading. The final image must be six isolated sprites on truly empty transparent RGBA canvas, three columns two rows512x512, exact1536x1024 size. No checkerboard printed into image, no black/white/gray background, no grid, no text. Do not redraw faces, armor or poses. Background extraction only.

## 第二段階（2026-10-05 最新）

第一成果の `win` 接続は統合担当が実施済みとの連絡を受けた。今回C担当は共有ロードを編集せず、追加atlasを任意入力できる描画APIと全本編への中間姿勢接続を実装した。下段は第一段階の履歴。

### 採用素材・描画API

採用素材は `prototype/public/assets/lcd/long-reach/duel-intermediates-v3.png`（1536×1024、3列×2行、RGBA）。内蔵imagegenで既存atlasを参照して生成・編集し、実alphaを確認した。元の `duel-poses-v1.png` は変更していない。中間姿勢の初稿と登録修正版は剣の越境・握りの不整合があったため不採用とし、配布素材に混ぜず `reference-review/parallel-combat-2026-10-05/asset-drafts/` に保持する。

追加frameは6=主人公の振り下ろし中間、7=引き戻し、8=敵の受け止め準備、9=押し返し、10=主人公の膝をつく敗北、11=立ち上がり。足元の登録位置と身長差は `actorFrameLayout` で校正し、刀身の握り・先端ランドマークは同じ登録へ追従する。35msの短い姿勢移行を併用し、6→2→7などの腕・脚の実作画差分で斬撃をつなぐ。純粋な全画像振動による代用はしていない。

新API：`createLongReachView(atlas, landscape, {motionAtlas})`。追加atlasなしでは従来6枚の互換表示、ありでは12枚の姿勢を使う。returned `frames` は追加分を含む12Textureで、呼び出し側の既存 `destroy(false)` 管理を継続できる。追加atlasのsourceはロード側の所有。非表示の移行レイヤーは頂点更新を省き、常時2倍の頂点更新にしない。

統合用の必須接続案（共有ファイルはCで編集していない）：

1. `pixi-main.js` の既存atlasと同じ読み込み経路で `/assets/lcd/long-reach/duel-intermediates-v3.png` をAssets.loadし、scaleModeをnearestにする。
2. `normal-spin-view.js` → `createDevelopmentView` へ任意の追加atlasを渡す。
3. `development-view.js` が `createLongReachView(atlas,landscape,{motionAtlas})` を呼ぶ。追加atlasは既存の引数を壊さない省略可能な引数として追加する。

統合担当から、実際の共有ロードである `board-runtime.js` が追加atlasを読み込み、normal-spin-view→development-view→long-reach-viewへ `motionAtlas` を渡す接続を完了したとの連絡を受けた。該当コードの読み取りでも接続を確認。本編で追加素材が有効になった。上記pixi-main.jsへの接続案は接続前の想定として扱い、現行はboard-runtimeの既存ロード経路に従う。専用確認画面も追加atlasを読み込み済みで、第二段階の画像・動画は12枚版の実描画を記録する。本編の統合ブラウザ録画は統合担当が別途記録する。

### 接触と復活

3本の全通常斬撃で、受け止め時に実際の両刀身が交差する地点を求め、接触光・火花をその地点へ配置する。人物の横方向の踏み直しは接触・回復の時間から滑らかに算出。接触後はその場に粒子を残し、引き戻す剣先に火花を引きずらせない。空振りの回避には接触光・接触反応を付けない。

通常外れと復活の膝つき・静寂は54秒直前まで共通。54.12秒から復活だけ立ち上がり中間→構え→再攻撃へ進む。敗北の種類から復活を事前に漏らさない。標準54秒・復活58秒・即告知12秒、勝利役物の既存開始時刻は変更しない。

統合担当依頼のU00対応も追加：`longReachPose` / view options の `upperCueActive` は省略時true。falseならhandoff/矢印を非表示にし、本編は続行する。`upperReachPose(presentation)` は新配分の `displayRoute` が存在し、`moonCue` がnullの記録だけ非作動とする。従来のdisplayRouteなし試作は既存5秒窓を保持。

### 検証と限界

第二段階は関連18テストで、3本の刀身交差、光と粒子の接触位置保持、姿勢境界の刀身連続性、受け止め時の人物位置の瞬間移動なし、12枚版でも敗北共通、U00でも本編継続を確認する。既存のFIFO・停止再開・当落・会計の関連テストも含む。テスト結果は `tests-stage2.txt`、ビルド結果は `build-stage2.txt`。最終ブラウザ確認結果は `stage2/browser-check.json` を参照する。

これは中間姿勢を加えた12ポーズによるアニメーションで、腕・脚を全時間連続で描いた24/60fpsの完全な作画ではない。35msの移行では短く絵が重なるため、高解像度で残る違和感は統合後のレビュー対象。新atlasを本編へ接続後の長時間遊技・スマホ実機・音の実聴取はCの独立画面では確認できない。敵と剣の接触を共有計算にした改善は3本に反映済みだが、3本の全尺を自然入賞で通した受け入れは統合担当が行う。

### 最終編集プロンプト（内蔵imagegen）

参照は登録修正版v2。以下の編集で最終v3を作成し、生成先からプロジェクトへコピーした。

> Edit target: this 1536x1024 three-column two-row sprite atlas. Make ONE surgical correction only in TOP LEFT CELL (x=0..511,y=0..511). The heroine mid downward slash currently has an anatomically incorrect separated grip: one hand raised above head holding an extra pommel and another hand holding sword guard. Correct to ONE sword and ONE hilt with BOTH hands CLOSE TOGETHER on that single hilt, at local x=335,y=250, elbows naturally bent forward. Sword blade diagonal down-right, tip near x=485,y=400. Left arm must descend from shoulder to this same grip; no raised hand, no extra pommel, no second sword, no long imaginary handle. Keep heroine face, hair, body, boots, cape, leg stance, pixel-art style and existing colors. All FIVE OTHER CELLS MUST remain visually unchanged, same framing and placement. Retain exact1536x1024 canvas, transparency, all sprites completely inside their own 512x512 cells. No grid or text or background.

2026-10-05。対象は逆境からの反撃の当たり／外れ／復活。採用方針は[全パターン表](../PRESENTATION_PATTERNS.md)、編集境界は[並列引き継ぎ](PARALLEL_DELIVERY.md)。他担当・共有flowは編集していない。

## 実装した変更

- 既存6ポーズの刀身位置をatlas内の握り・先端ランドマークで定義。`weaponPose(actor)` は人物の移動・拡縮・回転を適用した世界位置を返す。斬撃の光は刀身の中央、接触光と火花は攻撃側の剣先、溜めの光は主人公の刀身へ追従する。
- 斬撃の弧を全長112から48 worldへ縮め、人物の顔や場面を横切る光を減らした。剣と光が別の場所を動く問題を改善。
- 相手の押し戻し・傾きは接触の20ms後から70msで立ち上げる。攻撃側が近づく途中で相手が先に逃げる反応を撤去。180msの攻撃移動と既存の時計は維持。
- 敵の立ち位置・押し戻し幅を調整し、広い攻防で敵が右端に大きく切れる問題を軽減。復活の主人公を内側へ寄せ、傾いた構えの剣が左端へ出る問題を改善。
- `longReachPose(t, {win:false, ending:'standard'})` と `{win:true, ending:'revival'}` は敗北〜静寂の表示を54秒直前まで完全共有。通常外れは54秒で終了し、復活だけが月光→再起→55.25秒一閃→55.7秒既存勝利告知へ進む。

## 統合担当に必要な接続

`longReachPose` と `createLongReachView.render` の既存APIに省略可能な `win` を追加した。`win` が省略される標準リーチは、互換性のため従来どおり51.7秒から独立描画を隠す。既存の本編呼び出しはまだ `win` を渡していないので、通常敗北の新しい表示は専用確認画面で検証済み、本編への接続は統合担当が行う。

必須変更：`prototype/src/pixi/development-view.js` の `long.render(presentation.time,{...options,variant:presentation.reachVariant,ending:presentation.reachEnding})` に `win:presentation.win` を追加する。標準当たりは51.7秒の既存結果表示へ、標準外れは54秒まで共通の敗北表示へ、復活は55.7秒の既存結果表示へ渡る。

推奨変更：`normal-spin-flow.js` の表示snapshot用 `longReachPose` にも同じ `win` を渡す。これで外れの51.7〜54秒が `decision` ではなく `defeat` / `silence` と報告される。機構告知時点・reachSeconds・実際の当落処理は変更不要。

## 今回の検証

- `long-reach.test.js` / `reach-ending.test.js` / `reach-variety.test.js` の関連14テスト成功。新規チェックは、3本×通常/控えめ設定の敗北・復活表示一致、刀身の光の追従、接触前に反応しないこと。既存の当落/FIFO/停止再開/実入賞/会計も関連テストで維持。
- `npm run build` 成功。既存のchunk-size等の警告は `build.txt` に残す。
- Chrome実描画、420×340の専用確認画面で敵の攻撃、主人公の反撃、通常敗北、復活を連続再生し、PNGとWebM/MP4を記録。JavaScript例外0。
- 51.85秒と53.5秒の液晶部分は、通常敗北と復活でPNGのSHA-256が一致。数字・開発用のラベルは比較対象から除外している。
- 確認画面は `win` / `ending` を固定した表示用fixture。自然入賞・獲得・本編の結果復帰をこの録画で検証したという意味ではない。関連テストと表示検証は分けて扱う。

証拠は `prototype/reference-review/parallel-combat-2026-10-05/`。`browser-check.json` が最終録画の一覧と液晶画像のハッシュを保持し、`capture.mjs` で再現できる。`tests.txt` / `build.txt` / `source-sha256.txt` は今回の対象コードと検証を記録する。`raw/` 内の旧録画は途中確認であり、最終ソースの証拠はJSONの一覧のみ。

## 見た目の評価と残る作業

剣の光・接触・反応の位置関係、敗北の共有、復活時の刀身の画面内配置は改善した。ただし人物は既存6ポーズの切替で、腕や足が連続して動く作画ではない。ポーズの切替で刀身が跳ぶ瞬間は残る。接触点は攻撃側の剣先で、対戦相手の刀身と全斬撃で厳密に一致する剣戟の作画には達していない。大きな光・揺れで隠して完成と扱わない。

次段階の素材：主人公の構え→振り下ろし中間→突き→引き戻し、敵の振りかぶり→踏込み→受け止め→押し返し、主人公の膝をつく敗北→立ち上がり中間。各動作で握り位置と刀身方向を連続させる必要がある。まず逆境の代表1本で制作し、品質確認後に先手・互角へ展開する。

未確認：本編への `win` 接続後の当たり/外れ/復活の連続遊技、スマホ実機GPU/熱/フレーム時間、実聴取、他人の試遊。この段階を「他人に渡せる最終品質」や全演出完成とは扱わない。抽選・出玉・音・クラウドへの変更はない。
