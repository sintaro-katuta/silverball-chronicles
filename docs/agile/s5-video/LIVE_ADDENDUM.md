# S5 リアルタイム試射・最終動画

最終movieは `prototype/reference-review/s5-video-2026-10-10/live-addendum-lifecycle/review.mp4`。収録対応はPM確認のHEAD b793c45、全source529 SHA 2752a8741c8ccb67fce3cfcdb8e0c3169bf478feed128aaf5e09d7a9b6281998です。以後の根movie/docsコミットでprototype fingerprintは変わりません。

承認済み7文とずんだもん（ノーマル、style 3）の既音声を維持し、無音の実Live操作を加えます。新発話、探索成果、本編への配置採用を含みません。

## 映像の構成

- 0〜3秒：変更前の実slider画面。先行計測の基準12秒静止で、1秒ごとの保存記録です。
- 3〜25秒：新1440×900の等速実Live操作。pin1→grid:12:77で発射、停止後の残球、休止・再開、reset、1クリック発射を示します。
- 25〜31秒：新390×844で盤面・操作・6計数を同時に見る独立試射。PCとの同期した物理比較ではありません。
- 31秒以降：既承認の約64秒説明映像。表は追補前の先行実測で比較物理source164は同一。世代注記とVOICEVOX:ずんだもんのcreditを維持します。

新原録画は `prototype/reference-review/s5-2026-10-10/live-video-lifecycle-catch/`。元WebMは25fps、編集30fpsへフレーム複製（動きの補間なし）です。原動画・記録は保持します。

## 検証と世代

最終 `live-ui-lifecycle-catch/record.json` は両幅24イベント、errors0、5ファイル部分SHA始終一致。実球位置進行、発射＝全処理＋残球、停止・休止・reset・保存読込、非同期競合を確認しました。pause/非表示editorでLive描画・DOM更新カウンタが増えず、遅い比較開始→編集/pagehideで古いworker再作成・postは0。同期postMessage throw時にrunning=false、開始ボタンとLive操作が復旧、旧結果は消去されます。

故障注入・digest gate・hidden/pagehideの分岐試験ではオフライン計測を起動しません。実背景タブ保証とは区別します。正常全12比較はPMのquiet実行で別に完走しました。旧599秒timeoutでworker進行・error無しだった事実は保持し、不要描画をtimeoutの単独原因と断定しません。

旧ceaea0c世代の `live-video-final/` と95秒MP4 c84a2c95…a607592、途中 `live-ui-lifecycle/` の22イベントは履歴です。旧5SHA・旧head・旧表を最終世代に付け替えません。前世代の初回全95秒renderは、encode/mux終端前のrenameによりfaststart失敗。無効媒体・ログを旧live-addendum/historyへ保持し、成功素材へ転用しません。

実機、実時間FPS、人間聴感、全尺人間鑑賞は実施した範囲に限定します。5ファイルの部分ガードとPM全sourceガードは別です。

## 再制作

既存Remotion 4.0.505依存を再利用します。MP4/WAV/private原録画はGitに含めません。出力先publicに次を用意します。

1. `before-recorded-ui.png`：旧final-local-3c136ddの1440-comparison.pngをbyte同一でコピー。
2. `live-1440.mp4`：最終原WebMの0.8秒から22秒、H264/30fps、無音、等速。
3. `live-390.mp4`：最終原WebMの2秒から6秒、同編集条件。
4. `approved-reference.mp4`：旧承認64秒MP4をbyte同一でコピー。

`S5_LIVE_VIDEO_OUTPUT`は新private出力ディレクトリ、`S5_VIDEO_OUTPUT_DIR`は旧64秒movieのディレクトリ、`S5_REMOTION_CLI`は既存.bin/remotionを指定します。必要な依存symlinkは新規作成分だけ終了時に除去。browserは`REMOTION_BROWSER_EXECUTABLE`で指定できます。

```sh
python3 tools/pr-video/s5-live-build.py
python3 tools/pr-video/s5-live-finish.py
python3 tools/pr-video/s5-live-verify.py
```

buildは4previewと無音0〜929f prefixを出力します。全encode/mux正常終端後、finishはprefix930f・参考1921fの完成をffprobe確認してから、76px不透明注記帯を参考章へ合成・連結します。旧AACは31秒offsetでstreamcopy、旧/新demux AAC SHAを照合。生成中のファイルをrenameしません。

verifyには `S5_PRODUCT_SOURCE_SHA` と `S5_PRODUCT_SOURCE_HEAD` をPMの値で明示します。movie.pathは実outからrepo-relativeへ算出。最終SHA/codec/尺/音声identity/元素材/実見範囲は `LIVE_ADDENDUM_PROVENANCE.json`。Git・PR添付・公開はPMが担当します。
