# 月影機関のオリジナル効果音（2026-10-06）

ユーザー依頼：演出の効果音を一式作成し、ノイズ感と独自性を持たせ、同じ音を繰り返し使わず複数の音を割り当て、GitHub PRとして提出する。

## 音の方針

参照は `web-pachinko-design/references/motion-and-sound.md` と `review.md`。役割の分離、画面と音の共通時計、確定告知と期待の区別という既存の制作基準を利用。新しい実機音の採取・模倣・サンプリングは行っていない。独自のFM、金属共鳴、帯域を分けたノイズ、粒状ゲート、ステレオの動きをPCMとして合成する。

70の音名に各4音型（合計280）を用意。単なる音程差だけでなく、粒の密度、FMの比率、パルス間隔、左右の動きを切り替える。各音名で0→2→1→3の順に音型を循環し、隣り合う使用で同じ音型にならない。無限に一度きりの音源を生成する方式ではない。音の選択は遊技乱数を消費しない。

通常音を控えめにし、攻撃は乾いた金属とノイズ、溜めは空気と粒、月は非整数倍のガラス音、確定は独立の和音で区別する。最大同時発音6、マスター0.65、コンプレッサー、バッファ上限12MiB。ダウンロード無しでローカル合成し、必要になった音型をキャッシュする。BGM・キャラクターボイスは今回の効果音の対象外。

## 本編への割当

| 演出 | 音名・タイミング |
|---|---|
| 始動・左右停止・中央停止 | spin / stopLeft / stopRight / stopCenter、変動・実停止と同期 |
| 保留の変化 | holdBlue / holdRed / holdGold、画面と同じ入賞済み保留の予告情報 |
| 通常の前予告 | serial / story / step / background / route、段階表示の境界 |
| RUSH前予告 | trail / approach / alert / search / resolve / moon / awakening / crest / identity / pursuit |
| 短い入口・発展 | character / long / special / development、既存入口の切替 |
| 戦闘の各カット | arrival / enemy / dodge / pressure / gather / counter / clash / surge / rally / vow / final |
| 上部剣・月 | attention → upperSword → moon、19秒/即告知4秒の既存枠内 |
| 刃の接触 | heroHit / enemyHit / decisiveHit、既存ストライクの接触時刻 |
| 途中チャンスアップ | chanceTitle / chanceDialogue / chanceResolve |
| 決着PUSH連携 | pushPrompt / pushPress、PUSH APIを持つ本編でだけ有効 |
| プレミア・全回転 | premiumMoon / premiumSword / fullrotation、既存45.5秒の公開から |
| 当落 | win / rushWin / loss、標準51.7秒・復活55.7秒・即告知9.7秒、短い経路は既存専用時刻 |
| 復活 | 51.7秒は通常敗北と同じloss、54秒の再起からrevival |
| チャージ | charge、実際のチャージ確定時 |
| 右打ち・突入 | rightGuide、moon / reflection / castle / slash / mechanismとrushStart |
| 復活突入 | 通常敗北と同じloss → ブラックアウトで停止 → 4.8秒でrevival |
| BONUS | open / close / roundReveal / payout / clear、ラウンドの公開状態と払出更新 |
| RUSH終了 | rushReset / rushEnd、実際の残数補充とRUSH状態の終了 |

`original-se.js` は音源カタログ、`presentation-cues.js` は読取専用の割当、`presentation-sound.js` は実再生と寿命管理。既存の単音のwin-zoomに代わり本編のSEを有効にする。PUSHは別の未コミット作業をPRに取り込まず、`pressDecision` APIが存在する場合だけ受付音を有効にする。押下情報がある場合は押下音を鳴らし、進んだ表示時計へ追従する。

## 静けさと復帰

16.2秒の間、一閃49.65秒から50.2秒、復活突入ブラックアウトで再生中の音を止める。「決意の一閃」は50.2秒の一撃だけに刃の衝撃音を置き、先手・互角の多段接触音を流用しない。通常勝敗と復活は敗北まで同じ音列。プレミア以外の当確音を当落公開前に出さない。

プレイ開始のユーザー操作でAudioContextを解除し、追加のクリック無しで発音を開始できる。操作・情報に「効果音」チェックを追加。一時停止、タブ非表示、消音、盤面破棄で音を停止する。消音中や遅延で過ぎたキューはまとめて再生せず消費し、復帰時に再発火しない。同じ当たりのズームで確定音を二重再生しない。

## 試聴・検証

ローカル `npm run dev` → `/dev/original-se.html` で全280音型をボタンから試聴できる。試聴ページは本番ビルドに含めず `npm run build:previews` で別出力。

- `node --test prototype/tests/original-se.test.js`：全音型のPCM値、末尾フェード、非無音、ハッシュ重複、4音型循環、全割当、当落の秘匿、単発一閃、pause/mute/seek、二重当確防止、同時音・キャッシュ上限・破棄。
- `cd prototype && SE_BASE=http://localhost:5192 SE_CONTINUOUS=1 node tests/original-se.browser.mjs`：本編の実AudioContext、8経路の表示境界、録音、消音→復帰、ポーズ、試聴ページ。
- 既存全テストと本番・確認ページのビルドも実行。

ブラウザ検証は通常外れの実入賞から54秒の連続再生と、8経路の指定境界へ表示時計を進める条件。録音は実際のWeb Audio出力であり、ログのみの確認と区別する。スマホ実機/Capacitor・小スピーカー/イヤホンの実聴取・全経路の全尺自然遊技における聴感は未検証。ノイズの心地よさや実機級の完成を保証した結果ではない。クラウドのサイト・Editorのアップロードは行わず、依頼されたGitHub PRのみ提出する。

検証資料は `prototype/reference-review/original-se-2026-10-06/`。`continuous` は54秒連続＋8経路、`startup` は開始操作での解除を最終ソースで再確認した8経路。録音と画面、JSONの音履歴を同梱する。全体373テスト（初期音声9件を含む）通過後、追加を含む最終音声11テストを通過。本番・確認ページビルド通過。
