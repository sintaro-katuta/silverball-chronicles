# PR24の修正説明動画

冒頭8秒で今回の範囲を説明し、35秒の無音追補で出口・接触・外枠と長い試射の結果を示します。最後の約95秒は旧要件の釘編集ツールの参考映像です。今回の微調整は内部APIとコードによる比較です。

製品の既定はlegacy・通常強度0.20を維持します。強度0.14の固定採用は見送り、ヘソの改善は未完了です。左上の釘群を狙う方針は維持します。資料の比較対照0.20は内部試射条件であり、本編の目標採用候補を意味しません。

## 音声の再利用

旧動画の承認済み7文は、当時のツール制作と検証を述べた記録として保持しています。発話本文・順序・WAVを変更せず、新しい発話や合成はありません。今回の結果は無音追補の字幕で説明します。旧MP4本体は変更せず、結合後も全2851映像フレームとAAC全パケットの内容一致を確認しました。音声の開始位置だけ43秒後へ移しています。merge承認を新しい台本の承認には扱っていません。VOICEVOX:ずんだもんのクレジットを表示します。

## 制作証拠

`prototype/reference-review/pr24-reviewed-20261014/PRODUCTION.json`に入力・生成MP4・ハッシュ・音声一致・映像一致・デコード・自然再生の記録を保存します。元の試射データ、先行動画、商品ソースは変更しません。外枠は表示snapshot10、長窓の表はattempt10/paired-longを使います。実機の寸法や奥行、バネ挙動の校正は未実施です。

新しい構成ソースは`tools/pr-video/pr24-reviewed-index.tsx`です。ローカルRemotionで8秒と35秒を出力し、既95秒を時刻単位だけ揃えてstream-copy結合します。音声は原AACのstream-copyです。MP4/WAV・私有実素材はcommit対象外です。

## 再生成手順

実際の制作環境はRemotion/@remotion/cli 4.0.505、React/react-dom 19.2.3です。専用のローカル制作ディレクトリで次の依存を用意し、構成ソースを配置します。商品用package.jsonには追加しません。

```sh
npm init -y
npm install --save-exact remotion@4.0.505 @remotion/cli@4.0.505 react@19.2.3 react-dom@19.2.3
```

この専用ディレクトリから、配置した構成ソースのパスで以下のrenderコマンドを実行します。FFmpegとローカルChromeも別途必要です。公開リポジトリに私有映像を同梱しないため、入力素材を別途用意する必要があります。旧承認済み動画、最新表示比較の8秒MP4、全体PNG、接触前のPNGを、制作証拠と照合して使います。架空の画面で置き換えません。

```sh
# SOURCE_TSX: このリポジトリの tools/pr-video/pr24-reviewed-index.tsx の絶対パス
# SOURCE_MP4: 先行承認済み95秒動画（元ファイルは変更しない）
# OUT: 専用出力ディレクトリの絶対パス
# CHROME: ローカルChrome実行ファイル
# OUT/publicに frame-restore.mp4、frame-whole.png、contact-before.png を置く
npx remotion render "$SOURCE_TSX" Pr24Context "$OUT/context.mp4" --public-dir "$OUT/public" --browser-executable "$CHROME" --codec h264 --crf 22 --x264-preset fast --concurrency 2
npx remotion render "$SOURCE_TSX" Pr24Appendix "$OUT/appendix.mp4" --public-dir "$OUT/public" --browser-executable "$CHROME" --codec h264 --crf 22 --x264-preset fast --concurrency 2
```

出力2本と先行動画の映像を、再圧縮せず`ffmpeg -map 0:v -c copy -video_track_timescale 90000`で時刻単位を統一します。concatの順序はcontext8秒・appendix35秒・旧映像95.033333秒です。動画だけを結合し、原動画の音声を`-itsoffset 43 -map 1:a -c copy`で加えます。旧動画の音声自体は31秒から始まるため、完成版の音声開始は74秒です。

最終MP4を全デコードし、旧部分の全2851フレームのdecoded hashと原映像を照合します。原AACと最終AACをADTSにstream-copy抽出して全内容を照合します。実MP4の13秒・35秒を画像として確認し、通常速度・seek無しで自然終端を確認します。公開操作は担当PMが行います。

## 公開可能な制作記録

- 構成：今回の概要8秒、無音追補35秒、旧ツール参考95秒。
- 出力：H.264/AAC、1920×1080、30fps、4141映像フレーム。コンテナ尺138.085333秒（音声末尾padding込み）、5,175,838バイト。
- 最終MP4 SHA256：`71d83a28c27a657e1bdeb06a06c5c9ca35a91f1bcf8d984c957085d422cba29e`。
- 旧参考全2851映像フレーム、全AACパケット内容の一致を確認。新しい発話・合成なし。
- 全編デコード成功、エラー・警告なし。13秒と35秒の実抽出画像はPM受入済み。通常速度・seek無しの自然再生で138.085333秒の終端（ended=true、errorなし）を確認済みです。音声の人間聴感評価は未実施です。

commit対象はこの制作記録と`tools/pr-video/pr24-reviewed-index.tsx`だけです。素材・WAV・MP4・私有実行ログは対象外です。
