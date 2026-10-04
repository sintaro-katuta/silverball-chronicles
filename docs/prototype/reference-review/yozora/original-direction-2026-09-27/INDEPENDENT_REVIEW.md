# 独立査読 — オリジナル演出

2026-09-27。査読者 original_narrative_review。コードの編集・Unity の実行はしていない。対象は今回の `DIRECTION.md` と、最新 runtime 撮影 `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final` の画像。`../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/capture`、従来の演出比較、過去の PASS は現在の証拠として使っていない。web-pachinko-design と review.md、現行 DESIGN.md を確認した。

## 判定

**静止画で判定可能な因果・主役・文字可読性・代表結果の構成は承認可能。** 同じ剣士が同じ封印に挑戦し、傷が残り、成功で消失、失敗では残るため、演出が問う内容を追える。実機場面を継ぎ足す方針から、一本の問いへ統一したことを確認した。

これは「軽さが完全に解消した」「連続再生・音まで承認」「実機級」の判定ではない。連続動画の実視聴、音の実聴、端末負荷は未確認。静止画の範囲で提出を止める重大な結果矛盾や文字欠けは発見していない。

## 実画像で確認したこと

画像は全て `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final`。フレーム番号から示す秒数は 15 fps の録画開始基準の概算であり、ゲーム内の厳密な cut 開始は runtime-results.txt の SCENE 行を参照。

| 対象・証拠 | 観察・評価 |
|---|---|
| normal-sealed-road.png / SCENE 4.60 秒 | 街・剣士・一つの封印・「封印を斬り裂け」が同時に読める。目的が明瞭。字幕と顔が分離している。 |
| normal-blade-repelled.png / SCENE 10.67 秒 | 同じ封印に対し防御姿勢、「弾かれた」。画像は接触フラッシュ中。持続する白飛びという判断はしない。 |
| normal-frames/00220.png / 約14.67 秒 | 反発後に封印へ実際の亀裂線が残る。字幕だけで損傷を説明していない。 |
| normal-frames/00420.png / 約28.00 秒、push-before.png / push-pressed.png | PUSH が主役へ切り替わり、剣士と封印の状況は残る。人物の胴は隠れるが目と表情、課題を読む支障にはならない。 |
| normal-frames/00489.png / 約32.60 秒 | 斬撃光が封印中心を通り、接触フラッシュと損傷が同じ場所にある。剣士が無関係な方向を向いた敵へ突然切り替わる構成ではない。 |
| normal-frames/00558.png / 約37.20 秒 | 成功で封印が消え、背後の街が現れる。「封印突破」「道は、開かれた。」と一致。normal-seal-outcome.png は開放開始直後であり、単独だと未開放に見えるため比較の完成像には不適切。 |
| normal-frames/00567.png、00595.png / 約37.80・39.67 秒 | 222 の同一図柄へ受け渡している。 |
| miss-frames/00558.png / 約37.20 秒、miss-result.png / 約38 秒 | 封印が残り「まだ、届かない」。その後 525 の不揃い図柄へ戻る。成功と失敗の画面が明確に区別される。 |
| rush-frames/00245.png / 約16.33 秒 | 同じ勝利の因果から図柄へのディゾルブを確認。完全なテンポの評価ではない。 |
| bonus-intro-30.png、payout-step-15.png | 勝利した剣士と同じ街を維持。ROUND、実払出 240/300、獲得 240、告知 300 が区別される。無関係な対戦場面を新規に始めていない。 |
| bonus-passage-approach.png、bonus-passage-push.png | 次の道の告知へ移る。獲得 300 玉が残るので、現在の大当りが取り消される問いには見えにくい。 |
| bonus-frames/00135.png / 約9 秒 | 封印が開いた後 SWORD RUSH、剣士、獲得 300 玉が明瞭。 |
| drive-frames/00515.png / 約34.33 秒 | 4,500 と獲得 4,500 玉が一致、数字・ラベルが分離。drive-drive-total.png は拡大スライドの最初のフレームで数字が画面外にあるため、保持画面の証拠にはこちらを使う。 |
| upper-result.png、reset.png、full-cabinet.png | 上位 RESULT の 0 玉、通常復帰、全体表示を確認。上位結果は抽出プレビューで通常プレイの出玉実証ではない。 |

## コード・ログで確認したこと（映像観察とは別）

- ReferenceSequenceView.cs は同一 ticket と elapsed から cut を選び、cut 11 の a.win で封印開放を決める。Hero は同一の narrativeAtlas の 3 姿勢を使う。
- SealDuelGraphic.cs は同じ6面の geometry に damage / opening を与える。勝ちの opening にだけ破片・開放がある。
- BonusStoryView.cs は行先の名称を Result / Entrance の分岐で開示している。Story 中の「RUSHへの扉」は挑戦の題で、突入済み表示ではない。
- final/runtime-results.txt の13件 PASS を読んだ。勝ち一度解決、PUSHでticket不変、4倍/8倍、一時停止、外れ賞球なし、RUSH解決、300/1500/4500払出、上位完了snapshot、リセットを報告している。査読者が別実行して再現したものではない。強制試演は確率や自然入賞率の証拠ではない。

## 残る品質上の課題

1. **紙芝居感は残る。** 剣士は3つの静止姿勢で、封印は正面固定の幾何学図形。背景もほぼ同じ正面構図なので、奥行きの移動、体重の移動、腕・剣の連続した動きまでは表現されていない。今回の「繋がり」の改善は確認できるが、これを根拠に「動きの重さも完成」とは言えない。次に強化するなら、装飾を増やす前に振りかぶり→接触→振り抜きの姿勢補間と接触後の体の減衰を優先する。
2. **光の剣は人物原画の剣と別の図形として見える瞬間がある。** normal-frames/00489.png の接触点は合っているが、発光図形の柄と人物の握り手は一致していない。原画の剣からの軌跡として根元を合わせると、力の出所がより伝わる。現状でも「斬撃が封印へ届いた」という結果は読めるため静止画承認の妨げにはしない。
3. **BONUS 後の PUSH は本編と造形が異なる。** bonus-passage-push.png は平たい小楕円と強い放射線、本編は厚い大ボタン。操作の読解はできるが、本編で上げた重量感をここで弱める。今後は同じボタンを再利用し、放射線の顔への重なりを下げる方が統一感が出る。
4. **開いた道は主に封印消失と字幕で示す。** 明瞭な空間移動や先へ踏み出す行為はまだない。BONUS へ同じ剣士を引き継ぐ連続性は成立しているが、冒険の進展としての達成感には改善余地がある。

## 未確認

連続動画・音の実視聴、音圧や低音・減衰の聴感、反復での疲れ、入力のブラウザ実操作、自然遊技の全分岐、モバイル端末。コード上の hit-stop / 音イベントだけを根拠に「重くなったと体験した」とは報告しない。

## final2 差分再査読 — 現在の判定

初稿 `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final` の上記記録を残し、最新の `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2` を追加で実画像確認した。**静止画での因果・主役・文字可読性・代表結果の構成は承認可能**。初稿の「正面固定」の指摘に対して、対象へ寄る→主役へ寄る→全体へ戻る構図差が実際に追加された。連続動画・音未確認という範囲は変わらない。

- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/normal-frames/00230.png`（約15.33秒）：亀裂の発見で封印が拡大。傷へ視線を誘導する。顔と字幕・目的文の欠けなし。
- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/normal-frames/00278.png`（約18.53秒）：剣士へ寄り、「狙うのは、あの一点」と視線・構えを読みやすくした。封印も残り、場所を見失わない。
- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/normal-gathering-light.png`：全体構図に戻る。追加した寄りを後続へ持ち越して画面を塞いでいない。
- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/normal-held-breath.png`、`normal-contact-hold.png`：人物と封印の双方へ暗い露出が反映され、文字も一時退いている。静止画としては前後との明暗差が成立。実時間の静止感は未判定。
- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/normal-frames/00558.png`、`miss-frames/00558.png`：成功では封印消失、失敗では残存。暗転層を移した後も結果の可読性が保たれている。
- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/bonus-frames/00087.png`：BONUS後PUSHの保持を確認。初稿の平たいボタン・前面放射線という品質上の指摘は残る。開始直後の `bonus-passage-push.png` は一時的フラッシュなので、持続的白飛びとは扱わない。
- `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2/runtime-results.txt` の13件PASSを読み、初稿と同じ機能条件が報告されていることを確認した。別実行ではない。

残る注記：亀裂への寄りでは人物を alpha .42 にしているため、背景が体を透けて見え、幽霊のような見え方になる。意図的な主役交代として理解は可能だが、将来は人物を不透明のまま露出を落とすか、画面外へ寄せる方が人物の質量感を保てる。姿勢3枚の補間・剣の根元・BONUS後ボタンに関する初稿の課題も継続。新しい重大な文字被り・結果不整合は発見していない。

## bonus-final 再査読 — BONUS後PUSHの修正確認

最新の BONUS 後ボタンだけを `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/bonus-final` で実画像確認した。通常・RUSH本編は `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/final2` の判定を維持する。

**初稿と final2 に記した「平たい小楕円と強い前面放射線」の課題は解消確認。** `../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/bonus-final/bonus-passage-push.png` と `bonus-frames/00087.png`（録画開始から約5.8秒）では、本編と同じ厚みのある青い面・銀色ベベル・下側の縁が見える。画面全体を横断していた金色放射線も消えている。ボタンが主役となるため人物の胴と顔下半分は隠れるが、眼、封印、問いの字幕、獲得玉が残り、現在の操作と文脈は読める。字幕・獲得300玉の欠けや重大な被りなし。

`../../../../../prototype/reference-review/yozora/original-direction-2026-09-27/bonus-final/bonus-frames/00135.png` ではボタンと封印が退出し、SWORD RUSH / 道は、続いている。/ 獲得300玉へ受け渡すことを確認した。

コード上は BonusStoryView.cs が SequencePushGraphic を生成し、PushFeedback から縦横の押込み倍率を与えること、Push内で burst を有効化しなくなったことを確認した。押込みの実操作・連続動画・音は査読者未確認。従って実画像で解消確認した範囲は造形の統一と放射線の除去である。

現在の静止画構成の承認判定は維持する。継続課題は人物の透け・3姿勢による動きの制約・原画の剣と発光剣の根元などであり、**BONUS後ボタンの平たさを現在の未解消課題として扱わない。**
