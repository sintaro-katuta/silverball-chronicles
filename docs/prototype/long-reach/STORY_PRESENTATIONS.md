# B担当：月影オリジナルの人物・物語専用映像

## 代表の実描画レビュー（他の映像へ展開する前）

救出6カットをimagegenで生成し、専用PixiJS画面を静的ビルドしてChrome 390×740、液晶210×140の拡大表示で再生。通常5秒は崩落→顔→手→剣→防護の5出来事、RUSH2秒は崩落→手→防護の3出来事に編集し、6カットを早送りしない。顔の青い瞳、流れる長い銀髪、紺黒と金・青いマント、金の鍔と銀の刀身を各画像で実見。踏み込む足・差し伸べる手・受ける刀身が小画面でも判別できる。シートは正方形セルで生成されたため中央3:2切り抜きを使用。足のカットと救援の手は残るが、剣受けの石接触は画面上端に近い。今後別の配置で上端字幕を重ねる時は再確認が必要。

表示は6枚の専用原画の編集と局所石片であり、人物の手足が連続作画で動く映像とは扱わない。通常・RUSHの等速再生、短い1.43秒版、控えめと上矢印を確認。代表の証拠はprototype/reference-review/story-presentations-2026-10-05/representative/。ブラウザ例外0、借用素材を破棄しないdestroyを確認。このレビュー後に他4映像の制作を開始する。

2026-10-05。PREDICTION_IMPLEMENTATIONと全演出台帳の「文字だけ／専用映像未制作」を改善する。共有のprediction-plan、prediction-view、normal-spin-view、board-runtimeは編集しない。入賞済み当落・抽選・出玉・RUSHモード・54/58/12秒の尺は変更しない。独立した表示部品を制作し、接続は統合担当が行う。

## 最初の代表：崩れかけた橋での救出

主役は原型character-still-v1.pngと同じ長い銀髪・青い瞳・黒紺と金の衣装の主人公。守る相手は特定の原作人物ではなく、月影の街の小さな避難者の後ろ姿。敵の固有名・新ゲームルールは追加しない。予告時点で救出成功・大当り・敗北を確定させず、主人公が守りに入ったところから既存戦闘へ渡す。

| 秒 | 出来事 | 構図・動作 | 光と入り／抜け | 表示 |
|---|---|---|---|---|
| 0〜1 | 橋の縁が崩れ、避難者の足場が傾く | 引き。人物・橋・落下先の関係を示す | 夜の月光。石の欠片が下へ落ちる | 文字なし |
| 1〜2 | 主人公が危険に気づく | 長髪・顔・視線の近景。背景の異変を見る | 近景へカット。顔を光で隠さない | 文字なし |
| 2〜3 | 橋へ踏み込む | 足と衣装、石の亀裂。髪とマントが後ろへ流れる | 着地の小さな石片。全面フラッシュなし | 文字なし |
| 3〜4 | 避難者へ手を伸ばす | 横から。手の距離と視線で目的を示す | 切り替えは短い重なり。ズームだけで移動を代用しない | 文字なし |
| 4〜5 | 落下物が迫り、剣で受ける | 主人公・剣・落下石の関係が読める構図 | 刀身の接触点だけ光・石片 | 文字なし |
| 5〜6 | 主人公が前に立ち、さらに迫る影を見る | 避難者は背後、主人公の構えは前。守る理由から戦闘へ | 月光へ戻し、次の本編へ短く退く | 任意で「まだ、間に合う」 |

画像を6回拡大する映像ではなく、各出来事に別の絵を用意する。静止差分による編集映像であり、人物の完全な連続作画とは扱わない。控えめ設定でも出来事・カット・時刻は同じで、反動や粒子だけを減らす。

## 展開候補と別々の役割

| 専用映像 | 出来事 | 表示先候補 |
|---|---|---|
| 人物ステップアップ | 足元の気配→手が剣へ→長髪の主人公の視線 | 通常step、character入口 |
| 回想 | 暖かい街の約束→守る印→現在の冷たい夜と手 | 通常story、RUSHidentity |
| エピソード | 閉じかけた門→避難の通路→主人公が敵を止める構え | episode／守り抜く約束への導入 |
| 追跡 | 影の通過→足跡→屋根の跳躍→影が向かった先 | RUSHtrail/search/pursuit、long入口 |
| 救出 | 崩れる橋→踏み込み→手を伸ばす→剣で守る | RUSHresolve、episode系の選択候補 |

## 公開APIと本編の接続境界

`prototype/src/pixi/story-prediction-assets.js`の`STORY_PREDICTION_ASSETS`は5種の公開URLの台帳。素材は`prototype/public/assets/lcd/story-prediction/{kind}-v1.png`、使用した正確なプロンプトは同じ場所の`{kind}-v1.prompt.txt`。生成はbuilt-in imagegen、原型character-still-v1.pngをidentity/style参照に使用。生成元はCodex generated_imagesに残し、製品が参照するコピーをworkspaceへ保存する。

```js
const scene = createStoryPredictionView({sheets: loadedTextures});
lcd.addChild(scene.root); // logical 210×140。位置は親で設定
scene.available; // 読込済みkindだけ。部分ロード可
scene.hasFamily('identity'); // memoryが読込済みならtrue
const pose = scene.update({family:'rescue', time:age, start:0,
  duration:5, mode:'normal', reducedEffects:false, upperAttention:false});
if (!pose.supported) { /* 既存prediction-viewへfallback */ }
scene.destroy(); // 二度呼べる。借用sheetsのsourceを破棄しない
```

create/update/render/destroy。updateとrenderは同じ。unknownまたは未読込family、1.2秒未満のwindowはsupported:false/visible:false/result:nullで戻り、throwせずfallback可能。対応済みwindowは有限のtime/start/duration（1.2〜12秒）を要求し、不正な時刻は例外で接続ミスを知らせる。frameテクスチャ30枚はviewが所有し、destroy(false)で破棄。返したframesを呼び出し側で二重破棄しない。

| 入力family | kind |
|---|---|
| step、character | step |
| story、identity、memory | memory |
| episode | episode |
| trail、search、pursuit、long | pursuit |
| resolve、rescue | rescue |

通常入口5秒は5出来事に再編集、各1秒。RUSH入口2秒・短い入口1.9/2.5秒は3出来事へ、各window/3秒。通常before1.43秒は入口／最終視線の2カットへ、各約0.715秒。RUSHbefore.48秒は対応外として既存の短い記号に戻す。6秒の全カット版は独立確認専用。通常入口5秒／RUSH入口2秒を延長せず、既存precursor/developmentの字幕境界でsceneのwindowをリセットしない。root担当のstory-prediction-window.jsがwindowを指定する。

全てresult:null。当落入力を参照せず、描画の時間・フレームから抽選や払出へ干渉しない。上部の演出中も描画は進め、upperAttentionは中央上端の薄い補助帯だけ。独立確認画面の上矢印は確認用であり、部品から本編矢印を二重に作らない。新音・PUSH操作・専門説明文字は追加しない。

## 検証の進行

5種の公開シート・正確なpromptをworkspaceへ保存済み。各6カット、計30原画。built-in imagegenで新しい専用の出来事と構図を生成し、原型を参照した。文字名だけを変えた映像ではなく、決意の手・剣／回想の約束と同じ印／防衛の門と通路／追跡の足跡・跳躍・着地／救出の崩落・手・防護をそれぞれ描いた。全素材が原型と同じ長い銀髪・青い瞳・紺黒金の衣装・青マント・金の鍔と銀の刀身を持つことを原画と実描画で確認。

最終証拠は`prototype/reference-review/story-presentations-2026-10-05/final-v4/`。前のrepresentative/final/final-v3は途中版。最終版はChrome 390×740、液晶logical210×140を358×238.7へ表示。全5種×6/5/2/1.43秒の20条件で専用カット、終了、結果nullを点検。控えめとupperAttentionの5枚、停止中150msのポーズ不変、未対応familyと.48秒のfallback、destroy二回と借用sourceの保持を確認。ブラウザ例外0。通常5秒/RUSH2秒の全10本を等速で連続再生して録画。5つの関連ユニットテストと専用Viteビルド成功。証拠はbrowser-check.json、unit-tests.txt、build.txt、source.sha256。

実描画の批評で、剣受け・門を支える・剣を抜くカットが中央切り抜きでは刀身や顔の上を欠くこと、追跡の着地が足元を欠くことを確認。前3カットは上を残す構図、着地は足元を残す構図へ変更し、同じ液晶サイズで再確認した。足の接地と手、約束の印、避難者が通る門、接触点の石と剣が判別できる。人物の顔を隠す全面光・拡大揺れを入れず、局所の石片、追跡の線、0.09秒のカット重なりで出来事をつなぐ。

`final-v4/all-story-films.mp4`は液晶だけの約35.5秒の無音映像。決意→記憶→防衛→追跡→救出の順で各通常5秒／RUSH2秒。inline版にも同じMP4を埋め込み、localhostなしで確認できる。実動画の再生・時間進行と画面サイズをChromeで確認した。動画は確認画面の実録画からの切り出しで、手足の連続作画や動画生成ではない。

部品・素材・独立検証はここでfreeze。共有本編はrootが接続するため、この担当ではprediction-view/normal-spin-view/board-runtime/prediction-planを編集していない。本編の字幕・既存上矢印との同時表示、4種RUSHモード、スマホ実機GPU・長時間遊技、音の聴感は統合または実機確認の範囲。原画編集による専用映像として完成し、実機の連続アニメと一致したとは扱わない。クラウド更新・コミット・pushなし。
