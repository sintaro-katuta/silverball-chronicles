# S2 #7：試聴素材と評価表

開始承認済み。今回の役割は先行採用音の録音・条件整理と人の評価支援。実聴取者/PC出力のユーザー回答は待ち。回答と実聴取がない行を合格にしない。録音素材を取得できても聴感は未検証。

## 素材の取得条件

`prototype/tools/sound07-review.mjs`で先行`original-se.browser.mjs`の8指定descriptorを再利用し、通常待機を別の1条件として記録する。全尺はwall秒だけでなく実presentation完了を待つ。音源/描画/抽選の製品sourceは変更せず、指定場面は独立セッションへ置く。指定音/当落は自然遊技の成績へ足さない。退役したseek前後の会計不変assertは使わない。

各経路は音声＋canvas WebM、開始/終了PNG、イベントの表示秒・録画内のwall時刻・実入力JSONを保存する。音声は実AudioContextのMediaRecorder出力。動画はcanvasのみで、DOMのPUSH/操作UIは映らない。実PUSH表示/クリック、音off、休止は同条件PNGと入力時刻JSONで補助し、動画へDOMが映ったと主張しない。指定descriptor/名目時間と録画の実時間を分け、音声付きファイルができたことを同期/質感の実聴取成功へ拡張しない。

ローカルの`index.html`でWebMと評価項目を提示する。任意WAVは同じ録音からPCM float32へ復号し、音量・音色・速度を加工しない。Opus録音からの復号なので原合成PCMとのbit一致とは扱わない。

出力先：原workspace `prototype/reference-review/s2-2026-10-07/sound07/`。実行用Viteはローカルだけ。製品runtime/publicのhashと、録音tool自身hashを別記する。#5CPU/#6rAF計測と同時に録音を開始しない。

## 人が記入する簡潔評価表

| 条件/素材名 | 聴取者・端末/出力/音量 | 時刻・聴こえた事実 | 役割/同期/バランス/連続性/秘匿 | 判定 |
|---|---|---|---|---|
| 通常待機 `normal` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| pressure外れ `pressure-loss` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| initiative当たり `initiative-win` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| exchange外れ `exchange-loss` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| pressure復活 `pressure-revival` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| RUSH即告知 `rush-flash` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| 短い外れ `basic-loss` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| 直当たり `direct-win` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| 月/全回転 `moon-fullrotation` | 回答待ち | 未聴取 | 未評価 | 未検証 |
| 操作 `operations`（上記9条件と別） | 回答待ち | 未聴取 | off/on・休止/復帰・非表示/復帰・終了を評価 | 未検証 |

pressure外れ/復活とinitiative当たりは全尺等速で聴く。その他も今回toolは実完了まで等速記録する。優先して聴くのは溜めの連続性、一撃直前の静けさ、敗北と復活前の共通性、当たり公開以降の確定音。PCスピーカー/イヤホン比較・スマホ実機は用意できた範囲だけ評価し、不足分は別の未検証欄へ残す。

## 操作時の技術確認と未確認

JSONはmute/off-on、休止/復帰、実際のdocument.hiddenの有無、終了/再入場の時刻と音voice/cacheを補助記録する。headlessがhidden状態を出さない場合は非表示を未検証と記し、イベントの模擬発火で実非表示成功に置き換えない。cleanupは音声state/cache/canvasを確認できるが、音が耳で止まったことの評価は人が聴くまで未検証。

SYNTH_ONLY_SOUND最新採用の当たり-3半音/通常SE-2半音/高次倍音0.90を保持。改善が必要なら経路/時刻/環境・影響・最小修正案を次PBIへ提出し、採用音を評価だけで変えない。実機/Capacitor/全台長時間・主観的好みの完成は今回の録音成功で認定しない。

## 今回の取得結果（2026-10-07）

通常待機＋先行8指定fixtureの9条件、通常実入賞/初期消化の補助、操作/PUSHの計11素材を取得。原workspaceの`prototype/reference-review/s2-2026-10-07/sound07/index.html`にWebM/WAVと評価軸を用意した。音声付きcanvas動画、開始/終了PNG、各JSON、操作の音off/休止/PUSH/cleanup PNGを保存。WAV11本は同じOpus録音の無加工float32復号で、原合成PCMとのbit一致ではない。

- 等速のpressure外れ/initiative当たりは約55.7秒、復活は既存58秒の実完了まで録画。時刻は録画開始からのwallMsとpresentation秒を分けて保存。WebM容器のdurationと同一のミリ秒基準とは主張しない。
- 通常補助は実接触の受理/初期消化を観測し、停止操作まで約14秒。review用指定抽選を使うため自然当選成績の校正ではない。
- 操作は音off/on、休止/復帰、PUSH表示/実クリック。PUSH前はwall48.047秒/表示46.925秒、クリック後はwall48.150秒/表示49.92秒。これはcanvasにDOMボタンが映った証拠ではなく、`operations-push.png`と入力JSONの補助。
- 終了後はAudioContext closed、voice0/cache0/canvas0。headlessは実hidden状態を出さず非表示の確認は未検証。聴感・実機・出力機器は全件未評価。

初版は9条件まで取得後、操作用の2タブ生成でPlaywright convenience contextの制約に当たりexit1。製品不具合ではなく、`recording.log`/`partial-index.initial.json`/`recording-tool.initial.mjs`に残した。明示browser contextへ修正し、`SOUND07_CASES=operations,normal-admission`で残る2素材だけ再試行、実tool返却exit0を確認。exitは保存stdout内にないため、`execution.json`でtool completionの観測根拠と区別した。終了後にChrome/MediaRecorder/ffmpegがすべて停止し、Leadへ#6 perf quietを引き継いだ。Vite5198のみ127.0.0.1 idle。

初版/再試行はruntime/src/public（301ファイル）の同hashを確認。実行版2つのcopy/SHAと対象素材を`index.json.generations`へ分けた。その後、現在toolにローカルHTTP URL guardと通常補助のscope表記を追加。構文確認と非local URLのexit1だけ確認し、この最終tool版で再録音したとは書かない。

## tool再利用の入口

現在の`prototype/tools/sound07-review.mjs`は全経路用にも限定retry用にも使える。`REVIEW_URL`はlocalhost/127.0.0.1/::1のHTTPに限定する。全再実行は空の専用出力先を指定して既存素材と混ぜない。限定retryは既存素材とruntime/src/publicのhash一致を確認し、実行版ごとのcopy/SHAを残す。

```sh
# 隔離worktreeルート。全条件を新しい出力先へ（音源変更なし）。
REVIEW_URL=http://127.0.0.1:5198 SOUND07_DIR=<新しい専用出力先> SOUND07_WAV=1 node prototype/tools/sound07-review.mjs
# 同じruntimeの限定retry。今回実行した条件。
REVIEW_URL=http://127.0.0.1:5198 SOUND07_DIR=<今回の出力先> SOUND07_WAV=1 SOUND07_CASES=operations,normal-admission node prototype/tools/sound07-review.mjs
```

録音/復号は#5CPU/#6rAFと重ねず、Chrome/encoder終了を通知してから次のquietへ渡す。material11取得は準備結果であり、#7の聴取AC合格ではない。聴く人/環境の回答と実聴取後に上表へ事実を記入する。
