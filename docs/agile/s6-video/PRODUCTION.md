# S6説明動画の再生成と検証

最新の人間承認済み8段落をそのまま使用します。VOICEVOX:ずんだもん・ノーマル。発話の追加・修正は行っていません。音声timelineの開始frame/長さを正本にし、字幕は同じ発話を句読点で分割して表示します。段落内の字幕境界は文字数配分の目安で、単語単位の強制アラインメントではありません。

## 必要最小のソースと入力

- `tools/pr-video/s6-capture.mjs`：新5gzipのmanifest・sourceを照合し、同時刻の実座標から6秒の無音比較素材を逐次生成します。物理再計算・補間・片側の速度変更はありません。
- `tools/pr-video/s6-index.tsx` と `s6-data.json`：承認音声timeline、全5条件の表、先行長比較の別表を組み合わせます。0.14は未採用の実験対照、新3案は不採用、本編設定は維持します。
- `prototype/tools/s6-reference-media/` の4ファイル：全165秒のgzip検査と、既存の盤面描画への実frame適用。機械176入力とは別に媒体sourceとして管理します。
- 機械の検証済み版・既存public素材、最新5gzip/manifest/成功provenance、承認済み台本・8WAV/timelineが別途必要です。私有raw・WAV・MP4を公開ソースへ大量同梱しません。記事写真を新素材には使いません。

## 依存と実行

Remotion/@remotion/cli 4.0.505、React/react-dom 19.2.3、既存Playwright・ViteとFFmpeg・ローカルChromeを使用しました。既存のRemotion依存ディレクトリを媒体専用node_modulesへsymlinkして利用でき、商品用依存に追加しません。再準備する場合も媒体専用ディレクトリへ同じバージョンを固定します。

```sh
npm init -y
npm install --save-exact remotion@4.0.505 @remotion/cli@4.0.505 react@19.2.3 react-dom@19.2.3
```

`S6_EVIDENCE` は今回の証拠親ディレクトリ、`S6_VIDEO` はその `reference-informed/video` の絶対パスです。既存の承認WAV/timelineは `$S6_VIDEO/public/audio` に置きます。新しい承認を伴わず発話を再生成・変更しません。

```sh
node prototype/node_modules/vite/bin/vite.js prototype --host 127.0.0.1 --port 5307 --strictPort
node tools/pr-video/s6-capture.mjs
```

captureは原配置/旧道釘2/新3案の圧縮・展開SHA、全165秒/4951frame、実pins/半径/層/機構/計数、機械sourceとpublic/font素材の前後一致を確認します。実8秒からの局所3本、実6秒からの全体、実60.5秒からの入賞前後全体/局所を各6秒1倍で保存します。IVFの一時データはH.264素材に変換後削除します。新しい出力先を使い、旧世代を上書きしません。

表用データは公開結果と、同じ新rawの集計から `s6-data.json` に保存されています。再生成時はその表・timeline・WAVを検証し、結果の異なるrawを同じ版と扱わないでください。

```sh
npx remotion render tools/pr-video/s6-index.tsx S6ReferenceReview "$S6_VIDEO/s6-reference-review.mp4" --public-dir "$S6_VIDEO/public" --browser-executable "$CHROME" --codec h264 --crf 24 --x264-preset fast --concurrency 2
```

## 表示と検証の範囲

素材の6秒を超える場面では、最後の実フレームを静止保持したことを明記します。局所の再掲は再掲と表示し、120秒発射停止から165秒排出終端への静止切替は途中省略と表示します。全165秒は原記録に保存されていますが、動画自体を全165秒の通し映像とは呼びません。

旧道釘2の実ヘソ入賞62.876190秒は、前後を両側同じ秒で示します。30Hzの実保存frameとイベント時刻は別です。原配置側にその時刻の入賞が無いことも保持します。先行の長比較26→29は別記録であり、新3案の長比較は行っていません。一般26→24、逆戻り4→4、開始0.525秒での最大無ヘソ80.920→104.065秒悪化を併記します。

制作証拠の `capture.json`、`media-source-inventory.json`、`voice-input-proof.json` と最終 `PRODUCTION.json` に実行版、入力SHA、映像尺・fps・容量、実時刻/元frame対応、音声同一性、全デコード・少数抽出・自然再生結果を保存します。機械source176・媒体source・描画素材は別inventoryです。実再生の聴感を確認していない場合は未検証と記録します。PR添付・Draft解除・Git操作はPM担当、本番公開とは別です。
