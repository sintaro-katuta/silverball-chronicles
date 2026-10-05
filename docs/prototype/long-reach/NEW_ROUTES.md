# B担当：短いリーチ・直当たり・プレミア

2026-10-05。[並列制作の担当境界](PARALLEL_DELIVERY.md)に従い、独立モジュールと確認画面を実装した。共通flow、既存long-reach、月予告コード、遊技抽選・獲得処理は変更していない。**本編への接続は統合担当の作業。独立した表示部品の実装・検証完了であり、製品全体の完成を意味しない。**

## 第二段階の訂正（2026-10-05 最新）

### 最新：下方向に流れ、数字は1→2→…→9→1へ増加

ユーザー指示により、通常・RUSH・直当たりの全図柄を、上から下へ動きながら時間順に数字が増える方向へ統一。短いリーチ外れは中央の7を通過して8で止め、最終停止目を**787**へ訂正する。以下の7→6・767という履歴より本節を優先。7秒／5秒／4秒／3秒の尺、当落、当落境界以前のwin/loss共通動作は維持。

**positionsの座標契約を変更した。** 各列の`positions[i]`は、周回を展開した1始まりの連続図柄座標で、増加すると図柄が下へ動く。整数1〜9は図柄1〜9、10は図柄1、0は図柄9、負数も同様に周回する。停止は7なら7、外れ中央は8。旧実装の「0＝停止済み7」の特別扱いを廃止し、0も有効な周回位置にする。停止判定には`stopped`を使う。

`specialReelStrip(position)`が3枚の`{digit,y}`を返す。1図柄間隔はlogical 50px。例えば座標3.4では、図柄3が中央から下へ20px、次の図柄4が上から-30pxにあり、時間が進むと4が中央へ到達する。旧実装と逆に、上下のSpriteへ大きい数字を上側、小さい数字を下側に割り当て、fraction増加でyを正方向へ動かす。

外れはdecisionAtから0.65秒で7→8へ進み、入る速度1.8図柄/秒からHermite曲線で8停止速度0へつなぐ。途中の`passing`はtrue、`stopped[1]`はfalse。最終`digits`は[7,8,7]。`result`は記録済みの外れであり、演出による再抽選はない。統合担当が所有するflowの保存停止目は統合側で787へ揃える必要がある。

関連8テスト成功。ブラウザで通常/RUSHの短いリーチと直当たり全3列を時間順にseekし、実際に描かれたSpriteの数字が増加し、9→1も正しく周回することを検証した。別検証では実Spriteの3がy+20、4がy-30となる位置と、7が下へ動いて8が上から入る位置を確認。全8ルートの等速再生・全8件の控えめ設定・18図柄の本編画素比較を新しい方向で再実行した。

最新証拠は`prototype/reference-review/parallel-routes-2026-10-05/direction-fix/`。全ルートの`all-routes.mp4`と、`pass/seven-eight-pass.mp4`が新しい方向。下位の旧`pass-fix/`の7→6映像は旧方向の履歴として残し、現行の確認結果に使わない。共有ファイルは変更せず、担当のmotion/viewと関連検証だけを変更した。

### 旧方向：7を通過する前に6へ変わる表示の修正の履歴

ユーザーが短い外れリーチの図柄切替を指摘。初版はdecisionAtで中央の7のテクスチャを6へ即座に置き換えており、物理的な通過を描いていなかった。通常・RUSHとも、decisionAt以降0.65秒かけて同じ図柄列を7から6へ連続移動させる方式へ訂正した。7は下へ通過し、上から次の6が入り減速停止する。入る速度を1.8図柄/秒でつなぎ、Hermite曲線で停止速度0へ収束させる。

全体の尺7秒／5秒と当落は維持。`result`と`digits`は従来どおり決着時点から記録済みの結果・最終停止目を返すが、描画は`positions`を優先する。通過中の`passing`はtrue、`stopped[1]`はfalse、0.65秒経過後にtrue。外れの着地反応も実際の6停止まで遅らせ、通過中に跳ねさせない。

関連6テスト成功。追加テストは当落共通区間、境界の座標連続性、7→6の単調な移動、途中で未停止、6到達後の停止を確認。`prototype/reference-review/parallel-routes-2026-10-05/pass-fix/`に通常・RUSHの等速再生、境界前後6コマずつ、ブラウザ検証、修正動画を保存。先行の`all-routes.mp4`はこの修正前の録画であり、7→6の修正確認には新しいpass-fixの録画を使う。

統合担当の指示で、通常の小さい図柄をRUSHにも流用していた初版を訂正。通常・RUSHそれぞれ、本編の9図柄と一致する質感へ揃えた。RUSHは金色の斜体数字、1.5倍、x=10/75/140・y=28。通常は金属縁の図柄、x=32/85/138・y=38。共有の`LCD_REEL_LAYOUT`を使う。

剣プレミアの独立したベクトル刀身も撤去。現在は**戦闘で実際に使う武器の握り位置・剣先へ紋章を貼る透明overlay**。同じatlasの`weaponPose`と、そのフレームのhero/cameraを使うため、振り・回復・画角変更で紋章が刀身に追従する。背景、人物、剣を差し替えるカットインは使わない。新しい専用剣画像は不要になった。以下の初版の近景刀身という記述より本節を優先する。

月の二重輪は画面上部右側（174,22）へ小さく配置し、中央の上矢印・人物の顔から離す。剣の紋章は刀身の中ほどへ置き、効果を剣の周囲だけに限定。確認画面では既存の`createLongReachView`の27〜30.4秒を動かし、その実際の攻防へ重ねている。

### 第二段階の追加API

剣プレミアでは、`render`入力に**現在表示している本編の`battlePose`**を渡す。`longReachPose`または`createLongReachView.render`の戻り値で、`hero`と`camera`が必要。指定がない場合はTypeErrorで接続漏れを知らせる。静止した仮の剣へ戻すfallbackはない。月プレミアにはこの追加入力は不要。

```js
const battlePose = longView.render(time, {variant, ending, win, reducedEffects});
premiumView.render({
  route: 'battle', mode, win, time,
  premium: 'sword', premiumAt: 27,
  battlePose, reducedEffects
});
```

`battlePose.camera`はlogical座標からLCDへ移す現在の変換。既存ビューがworldを中央105/70へ配置する方式に一致する。統合側で独自カメラ変換を追加した場合は、その変換への追従も確認する。C担当のweaponPoseのランドマークを直接再利用し、別の座標台帳を増やさない。

### 第二段階の自己レビューと証拠範囲

通常9図柄・RUSH9図柄は`createNormalSpinView`が生成するテクスチャとRGBA全画素を比較するブラウザ検証を追加。配置は共有レイアウト値、RUSH拡大率は本編と同じ1.5で確認する。見た目の近似ではなく、比較した18枚の画素差が0であることを証拠にする。

画像の自己レビューでは、RUSHの金色数字が大きく識別でき、通常の枠付き小図柄とは明確に異なること、紋章が青白い既存の刀身に金色で重なること、敵・主人公の顔を隠す別の大きな剣を出していないことを確認した。月の二重輪は右上で顔から離しているが、今後別の近景や敵配置へ重ねる場合は安全位置を再確認する。

最終確認は、他担当の同時編集による開発サーバーの自動再読み込みを避けるため、専用ビルドの静的プレビューで収録する。URLは開発専用でユーザーへは渡さない。全8ルートを等速再生し、全8ルートの控えめ設定を別途seekして画像を保存。さらに本編19秒（矢印・上部予告中）の月・剣overlayを保存する。`moon-upper-attention.png`と`sword-upper-attention.png`が重なり点検の画像。

専用確認では既存武器と同じ素材・座標への接続が成立した。残る素材不足は人物の連続作画で、この担当では新規人物素材を制作していない。紋章を載せる剣そのものの追加素材不足は解消した。本編の全ルート、全カメラ、実際の月役物との同時再生は統合後の検証であり、今回確認した27〜30.4秒と19秒の構図から全区間の安全を一般化しない。

## ファイル

- `prototype/src/pixi/special-route-motion.js`：DOM/PixiJSなしの純粋な表示ポーズ計算。
- `prototype/src/pixi/special-route-view.js`：210×140のPixiJS描画器。
- `prototype/src/dev/special-routes.js` と `prototype/dev/special-routes.html`：開発用の独立確認画面。
- `prototype/tests/special-route.test.js`：関連ユニットテスト。
- `prototype/tests/special-routes.browser.mjs`：等速録画・スクリーンショット・表示終了・停止・低効果・破棄のブラウザ確認。

確認画面はVite開発時に利用できる。共有の`vite.config.js`を担当外のため変更しておらず、通常のビルド入力には未登録。専用ビルドでバンドルを確認済み。必要なら統合担当が確認用HTMLをビルド入力に追加する。本編で使うモジュール自体は通常のimportで含まれる。

## 接続API

```js
import {createSpecialRouteView} from './pixi/special-route-view.js';
import {SPECIAL_ROUTE_TIMINGS} from './pixi/special-route-motion.js';

const view = createSpecialRouteView({background: optionalBorrowedTexture});
lcdContainer.addChild(view.root); // LCD logical coordinates: 210 × 140

const pose = view.render({
  route: 'basic',          // basic | direct | battle
  mode: 'normal',          // normal | rush
  win: storedResult.win,   // admission result, never a new lottery
  time: presentation.time,
  reducedEffects: false,
  premium: null,           // null | moon | sword; battle overlay only
  premiumAt: 28            // battle-local start time in seconds
});
// Caller resolves the existing stored draw when pose.finished. This view does
// not resolve, pay out, move holds, open mechanisms or update game clocks.

view.destroy();            // idempotent, also removes root from its parent
```

入力契約：`time`と`premiumAt`は有限数。`route`/`mode`/`premium`は上記値。`direct`に外れ記録を渡すとRangeError。`battle`＋プレミアに外れ記録を渡した場合は非表示になり、確定を偽装しない。`basic`は当たり／外れの両方を描画する。`flash`・チャージは既存担当の表示を使い、この描画器へ渡さない。

返すポーズには`seconds`、`decisionAt`、`visible`、`finished`、`phase`、`revealed`、`result`、`digits`、`positions`、`stopped`、`formed`を含む。`result`は決着前null。プレミアは当落の再表示ではなくoverlayなので、`result`はnullのまま、固有現象の完成を`formed`で示す。`premiumAt`は統合側の本編で自然なカットに合わせて指定する。

所有：`view.textures`は内部生成テクスチャ一覧だが**destroy時に描画器自身が破棄する**。統合側で二重に破棄しない。`background`は借用で破棄しない。rootは自身の210×140マスクを持つ。`route:'battle'`時は背景・図柄を描かず透明なプレミア部品だけを描く。rootのpositionは局所反動に使うため、全体配置を変える場合は親Containerへ置く。倍率はroot.scaleで指定できる。

## 絵コンテとタイムライン

| ルート | 入口・主役 | 展開 | 決着 | 終了 |
|---|---|---|---|---|
| 通常短いリーチ | 左右7停止・中央追跡、「リーチ」を0〜1.6秒 | 中央の図柄を追い、終盤で減速。図柄が主役 | 5.7秒から777／787へ。外れは0.65秒の7通過を含む | 7秒 |
| RUSH短いリーチ | 同じ構造、短い追跡 | 通常と同じ結果非依存の動き | 3.8秒から777／787へ。外れは0.65秒の7通過を含む | 5秒 |
| 通常直当たり | 特別な見出しなし、3列変動 | 左→中央→右が短い間隔で止まる | 2.8秒：777成立 | 4秒 |
| RUSH直当たり | 同上、短い変動 | 3列が止まり、図柄自体で知らせる | 1.9秒：777成立 | 3秒 |
| 二重月輪 | 本編途中、液晶背景へ透明overlay | 二本の輪を逆方向から描く | 1.2秒で二重輪完成。金の輪と6色の接点 | overlay開始から3.4秒 |
| 紋章完成 | 実際の戦闘の刀身 | 刀身の中ほどに菱形＋軸線の6画を順に描く | 1.6秒で固有紋章完成。局所の金輪 | overlay開始から3.4秒 |

通常短いリーチの当たり／外れは5.7秒まで全表示ポーズが同一、RUSHでは3.8秒まで同一。外れは7を通過して中央だけ8へ止まり、過剰な失敗ラベルや派手な外れ光を出さない。当たりは小さな着地反応と図柄周囲の放射光。既存の当たり祝福へ渡すまでの表示で、右打ちカットインや払出を重ねて作らない。

月は普通の三日月・半月・満月の予告と混同しない固有の二重輪。刀身紋章も通常の上部剣の動作や火花とは別の形。上部月の形・色を変更する処理は一切ない。プレミア完成後は敗北煽りへ戻さず、統合側が勝利までの本編を選ぶ。

動き・光：通常は最大1.3 logical px・0.2秒の局所反動。控えめ設定は反動・粒子・輪の回転を止め、タイミングと結果は同じ。光は図柄周囲と固有紋章に限定し、全面白フラッシュや暗転を使わない。新規音なし。

## 素材と画面品質

図柄は既存の金属縁・赤い奇数／青い偶数・ドット数字の構成に合わせた内部生成テクスチャ。9種類を生成時だけ作り、再生中にテクスチャを作り直さない。背景は既存`moon-bridge-v1.png`を確認画面で借用。プレミアは手続き図形で、静止した画像を揺らして人物の新規作画と見せる処理はない。

二重輪と刀身紋章は識別できる独立意匠。初版のベクトル刀身は撤去済みで、現在は既存武器の上に紋章だけを重ねる。剣・人物の画素は既存atlasそのものなので素材の連続性は保たれる。顔や衣装の新しい連続作画は今回追加していない。人物の連続作画完成・実機一致とは扱わない。

## 検証・画像・動画

証拠：`prototype/reference-review/parallel-routes-2026-10-05/`。

- ユニット5件成功：当落共通区間、境界の結果受け渡し・逆方向seek、直当たりの入力制約、プレミアの当選専用表示・完成タイミング、控えめ設定と入力不変。
- Chrome、390×740で8ルートを等速再生：通常/RUSHの短い当たり・外れ、通常/RUSH直当たり、月・剣プレミア。全件終了時の非表示を確認。
- 全8ルートの控えめ表示を別途確認。停止状態で400ms待ってポーズ不変、destroy二回が安全に完了。pageerrorは0。上矢印が出る本編19秒へ月・剣を重ねた画像も実見し、矢印・両者の顔を覆わないことを確認。
- 生成画像を実見：通常777、月二重輪、剣の紋章。図柄・固有形が画面内で識別可能。最終録画はChromeの画面から保存した。
- 専用Viteビルド成功。`build.txt`にログ。共有ビルド設定・他担当の作業は変更なし。
- `browser-check.json`、`unit-tests.txt`、`source.sha256`に条件・最終担当ソースを保存。`build-v3-input.sha256`は静的ビルド開始時点の担当ソースと参照した共有コード。ブラウザ検証スクリプトは静的ビルド後に待機方法を修正したため、その最終版のhashは`source.sha256`を参照。
- 全ルートのMP4：`all-routes.mp4`。無音・等速、確認画面の液晶部分358×240を切り出した。生録画と対応パスも保存。失敗した初回録画は`raw/`に残るが、最終証拠は`video-path.txt`が指す録画と`all-routes.mp4`。

主な画像：`normal-basic-loss.png`、`normal-basic-win.png`、`rush-basic-loss.png`、`rush-basic-win.png`、`normal-direct-win.png`、`rush-direct-win.png`、`normal-moon-win.png`、`normal-sword-win.png`。全8枚の`*-reduced.png`は最新の控えめ表示。初版の大きいベクトル刀身・中央二重輪の控えめ画像は`initial-v1/`へ分離し、最新確認結果に使わない。

直近600フレームのフレーム間隔95%点は16.7msだったが、独立確認画面・このChrome環境のみの観測。製品本編やスマホGPUの性能保証にはしない。

## 統合後に残る確認

1. 配分担当のrouteと既存結果受け渡しへ接続し、decisionAtまでは当落を漏らさず、secondsで既存の確定処理へ渡す。
2. 短い当たり・直当たりの月予告なし分も含め、既存月12値の配分を統合側で校正する。5秒の上部を短い変動に無理に重ねない。
3. プレミアを実際の戦闘の月／剣のカットに重ね、顔・剣・文字・上部矢印と競合しない配置を調整する。戦闘や全体／盤面／液晶切替での実再生は未確認。
4. 本編の停止・再開、保留、獲得、RUSH終了と同時に確認する。この独立画面では遊技を動かしていないため、それらの安全性を検証済みと言わない。
5. スマホ実機・タッチ操作・長時間遊技・本編の負荷確認は未実施。

参照：web-pachinko-designのmotion-and-sound、juice-it-or-lose-itのclarity、PixiJSのgraphics/container/application/ticker。抽選・信頼度・新しい実機情報の調査や変更は行っていない。クラウド更新・push・コミットなし。
