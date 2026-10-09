# S2 #6 高DPI本編の負荷計測

対象：[Issue #6](https://github.com/sintaro-katuta/silverball-chronicles/issues/6)。S2開始承認後のローカル計測。製品描画・素材・ゲーム・物理・保存当落は変更なし。最適化は別PBIとして計測根拠とACを承認してから実装する。本書はPC計測／画質保持の受入提出で、スマホ性能の認定ではない。

## 環境と試行の分離

| 試行 | 条件と結果 |
| --- | --- |
| attempt01 | 管理Chromium153.0.8010.12／headless、ANGLE Vulkan SwiftShader。390通常3＋戦闘3の6窓成功、次PUSHのpresentation.time>=40.5自然到達待ちが120秒でtimeout、exit1。最終到達時刻は初版に記録がなく未確認。原6窓／エラー／provenanceを保持 |
| environment-probe | installed Chrome154.0.8037.98／headless、ANGLE Metal Renderer Apple M4。同390DPR3の5秒probeで301rAF、平均16.6658ms、gameTime3.03→8.06。24窓とは別証拠 |
| attempt02 | installed Chrome154.0.8037.98／headless、ANGLE Metal Renderer Apple M4。24窓＋actualPUSH両幅の計測外画像を完成、exit0 |

attempt01の通常平均178.49〜195.01ms、戦闘216.18〜220.31msはソフトウェア描画環境の観測。ゲーム時計は既存dt制限の影響で実時間より遅く進んだ。ブラウザ版とbackendが異なる2試行を同じ母集団へ混ぜず、環境変更と本体改修の成果を区別する。描画設定／dt／時計／PUSH受付尺／待機timeoutは変更していない。

attempt02は2026-10-07 05:11:22〜05:39:55 UTC（14:11〜14:39 JST）、開始commit `0118688f58b1c85f66a40b64ef6c77523291f1bc`。Node24.21.0、Darwin25.6.0／arm64、Apple M4／10 CPU／16GiB、Pixi8.21.0・Playwright1.63.0・Vite8.3.0。runtime SHA `e00f4b08d2fb827905ef1675aee27249c317a9d30947e3b7eab8826395002deb`、開始／終端一致。実行tool SHA `cbf1d6d81efbdb2fa7787a96b923311425f91bcc61618bc9949240e37b55ca08`。

## 条件と観測方法

390×844 DPR3（canvas1170×1288）／1440×900 DPR1（canvas725×798）、液晶表示、通常・pressure戦闘・PUSH前後・右打ち実賞球の各30秒×3、実時間3秒warmup。viewport／DPRだけのエミュレーションで、スマホ実端末／実タッチではない。音off、控えめoff、画像・操作設定をprovenanceへ記録する。

- 通常：dev専用セッションの固定外れ、自然発射。自然当落成績ではない。
- 戦闘：dev専用の保存当落レコードを受け入れ、pressureの表示21秒到達後warmup。Metal試行のbeforeは約24.01秒。SwiftShaderでは約21.69秒となり、実到達時刻で区別する。seek／freezeなし。
- PUSH：表示40.5秒到達後warmup、約43.5秒から前後30秒。46.5〜49.9秒だけの実ボタンvisible marker／サンプルを分離。戦闘窓にもPUSH区間を含む。押下は行わず自動決着、操作時刻null。actualPUSH画像は非計測の別再生で46.94〜46.97秒を取得した。
- 右打ち：direct当選指定後、snapshot.mode=bonus・counts.bonus>0・w.bonus.payout>0を待つ。全6窓のbeforeはbonus入賞5／専用払出75。軽いmarkerのmodel modeはright-closed、game stageはbonus（表示snapshot.modeと別フィールド）。一般賞球／total>0を大当り根拠にしない。

rAF毎は通知時刻／intervalの保存のみ。状態markerは200ms以上の間隔で既存game/modelの軽い値を読む。full snapshot・layout・画像は窓外。状態対応は直前の疎markerによる近似で、真の状態遷移時刻やGPU実行時間とは呼ばない。最初のrAF timestampが計測開始のperformance.nowより早く、最初のmarker offsetが負になる窓もある。原因を時間原点の違いと断定せず、interval差分が正であることを確認して生値を保持した。

集計は平均／nearest-rank p50・p95／最大／33.4・50・100msを**超えた**割合。区切りは分布記述で、スマホの合否閾値ではない。#5CPU終了→#7録音／encoder終了→#6quiet実行を守り、ロードと撮影は測定窓から分離した。

## attempt02 結果

各行3反復。全24窓、43,204interval、各実窓30,000.5〜30,016.5ms、ブラウザ／HTTP／可視状態／pauseの異常なし。

| viewport／DPR | 場面 | 平均ms（3反復範囲） | p95 ms範囲 | 最大ms | 33.4ms超 |
| --- | --- | --- | --- | --- | --- |
| 390／3 | 通常 | 16.6660 | 16.7 | 16.8 | 0/5,400 |
| 390／3 | 戦闘 | 16.6659〜16.6660 | 16.7〜16.8 | 16.8 | 0/5,400 |
| 390／3 | PUSH前後 | 16.6659〜16.6661 | 16.7〜16.8 | 16.8 | 0/5,400 |
| 390／3 | 右打ち | 16.6660〜16.6661 | 16.7〜16.8 | 16.8 | 0/5,402 |
| 1440／1 | 通常 | 16.6659〜16.6660 | 16.7〜16.8 | 16.8 | 0/5,400 |
| 1440／1 | 戦闘 | 16.6659〜16.6660 | 16.7〜16.8 | 16.8 | 0/5,400 |
| 1440／1 | PUSH前後 | 16.6660〜16.6661 | 16.8 | 16.8 | 0/5,402 |
| 1440／1 | 右打ち | 16.6660 | 16.7 | 16.8 | 0/5,400 |

50／100ms超も全0。PUSH可視対応は戦闘窓194〜209interval、PUSH前後窓207〜213interval（疎marker近似）、各subset p95最大16.8ms・33.4ms超0。30秒全体をPUSH30秒と偽らない。

## 画質・表示scope

Designerが24 before画像＋両幅actualPUSHの26枚を目視。顔／目／両手握り／刃／服／髪透過／図柄／枠／操作の読取りと非重なりを確認。pressure24.01秒の上字幕はfade中で全文未読を保留し、25.3秒付近を自然時計で待つ各幅補助2枚を追加した（opacity強制なし）。`subtitle-support`のbefore presentation timeは390=25.3083、1440=25.3167、各errors0。補助は計測外で、原24.01画像の評価を合格へ書き換えない。最終目視判定はDesignerの [S2_VISUAL_ACCEPTANCE](S2_VISUAL_ACCEPTANCE.md) を参照する。

性能fixtureはprivate board.feed(false)を直接使う。一方main.jsの発射表示はfeed-toggle onclickで更新されるUI側feeding変数を参照するため、実flowが停止していてもdockに発射中／発射停止ボタンが映る。fixtureによる状態と表示のscope差として記録し、自然遊技の不具合や自然操作表示整合の合格をこの画像から判定しない。字幕補助では既存feed-toggleを実クリックして停止し、snapshot.feeding=falseで撮影した。製品ソース修正はしない。

## 性能採用基準案とAC提出

1. **PC基準**：今回のChrome／Metal M4・DPR／canvas／素材／固定scene／warmup／窓を一組の比較基準として保存。16.7〜16.8ms p95とslow0は今回の観測レンジで、別端末の保証値へ流用しない。
2. **改修判定**：将来の最適化は同条件3反復の平均・p95・最大・slow比率・状態別分布と原画の目視を対応付ける。改善主張には反復ばらつきを超える変化の根拠を求め、反復範囲が重なる差は改善未確認とする。各場面の新しい劣化区間／例外／画質退行は差戻し候補とし、数値だけで意匠退行を受け入れない。
3. **スマホ採用**：対象実端末・ブラウザ・DPR・温度／充電・連続時間と期待応答をPMが定義してから絶対閾値を合意する。現時点ではGPU時間／GPUメモリ／発熱／電池／実タッチ／スマホ性能／音の聴感は未検証。取得できない項目は空欄を成功にしない。

| Issue AC | 提出判定と範囲 |
| --- | --- |
| 1 環境／時間 | 記録完了、2環境／probeを分離 |
| 2 通常／戦闘／PUSH／右打ち | PC24窓と状態内訳を提出、PUSHは短い実可視subset、fixture／自然遊技を区別 |
| 3 意匠を守る性能基準 | 原画維持の画像／runtime不変／基準案を提出。自然操作表示の整合はfixtureから判定しない |
| 4 実端末不可の扱い | 実スマホは未検証、計測可能なPC証拠を提出 |
| 5 最適化開始ゲート | 最適化実装なし、別PBI／AC承認後のみ |

PM判定：AC1〜5は今回のPC計測・現行画質基準と未検証の開示の範囲で合格。SMの全24生値・状態内訳・集計表・ハッシュ独立照合と、Designerの新28画像の条件照合を根拠に受入。実スマホ・連続動作・熱・聴感・fixtureでの自然操作表示整合を認定したとは扱わない。Issueは集約PRマージ前のためOpenのままAcceptedへ置く。今回のデータから物理／描画最適化を追加せず、スマホ計測／熱／GPU profilerの環境準備は別PBI候補とする。

## 実行・保全・編集境界

`pixijs`→`pixijs-performance`を適用。frame集計／厳密slow境界／疎marker対応の必要テスト2件成功、構文検査成功。全8分CI／prepareは再実行しない。

```sh
node --test prototype/tests/perf06-measurement.test.js
PLAYWRIGHT_BROWSER=chrome node prototype/tools/perf06-measurement.mjs --url http://127.0.0.1:5199 --out /Users/sintaro.katuta/dev/silverball-chronicles/prototype/reference-review/s2-2026-10-07/perf06/attempt02
```

上記URLは自前Node24 Viteの実行時URL。全Chrome／画像補助終了後、owned Vite5199を停止して接続不可を確認。既存5198／4178等は停止しない。quiet測定は終了済み。

原workspace `prototype/reference-review/s2-2026-10-07/perf06/` が証拠領域（Git送信対象外）：attempt01原6窓／exit1／executed-harness、environment-probe5秒、attempt02全24 JSON／summary／provenance／26画像、subtitle-supportの自然時計capture.mjs／2画像／JSON、metric-tests.log。実行ハーネスは終端後にcurrent SHA=記録SHAを照合してexecuted-harness.mjsへ保全し、harness-preservation.jsonに事後保存と明記。計測前保存とは呼ばない。

#6目的のcommit対象はこの文書、prototype/tools/perf06-measurement.mjs、prototype/tests/perf06-measurement.test.js。Designerの視覚判定文書はPMが同目的へ集約する。#5／#7とは分離し、Git操作はPM担当。クラウド／新GitHub送信／公開は行っていない。
