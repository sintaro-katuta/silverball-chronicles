# Release 0.2.0の説明動画

S4の見た目・共通配置の説明、S5の内部試射と出口・外枠、S6の釘比較を一本にまとめました。本編の変更、内部候補、未採用を分けて表示します。既存承認済みのS4とS6の発話は全文・順序・速度を保持し、新しい発話・音声合成はありません。S5は無音比較だけを使います。VOICEVOX:ずんだもん。

構成は、概要8秒、S4約52.7秒、S5無音章カード8秒と元映像8〜43秒の比較35秒、S6約89.7秒、結論12秒です。S5旧ツールの参考95秒は含めず、元動画の「続く95秒」という案内も新しい無音カードに置き換えました。前後の実プレイ比較は元映像内の同時刻・同倍率のままです。

S4/S6は元コンテナの全音声長を確保するため、最終実フレームを各2フレーム保持しました。音声は無音区間を挟んで配置し、AACへ再圧縮しています。波形のビット一致・原AACパケット一致は主張しません。元MP4/WAVは変更していません。

## 再生成

Remotion/@remotion/cli 4.0.505、React/react-dom 19.2.3、FFmpeg/FFprobe、ローカルChromeを使います。専用制作ディレクトリへ依存を用意し、商品依存へ追加しません。

```sh
npm init -y
npm install --save-exact remotion@4.0.505 @remotion/cli@4.0.505 react@19.2.3 react-dom@19.2.3
```

このリポジトリの`tools/pr-video/release020-index.tsx`と`release020-assemble.py`を使用します。入力の既存3MP4は私有検証資料で、リポジトリには同梱しません。S4完成版、S5 PR24修正説明完成版、S6参照資料に基づく比較完成版を別途用意し、[PRODUCTION.json](PRODUCTION.json)のSHA256と照合してください。

`OUT`を専用出力先、`SOURCE_TSX`を構成ソース、`CHROME`をローカルChromeの絶対パスとして設定し、依存を用意した制作ディレクトリから実行します。

```sh
npx remotion render "$SOURCE_TSX" Release020Intro "$OUT/intro.mp4" --browser-executable "$CHROME" --codec h264 --crf 22 --x264-preset fast --concurrency 2
npx remotion render "$SOURCE_TSX" Release020S5 "$OUT/s5-context.mp4" --browser-executable "$CHROME" --codec h264 --crf 22 --x264-preset fast --concurrency 2
npx remotion render "$SOURCE_TSX" Release020End "$OUT/end.mp4" --browser-executable "$CHROME" --codec h264 --crf 22 --x264-preset fast --concurrency 2
```

`OUT/input-inventory.json`に`inputs`配列を用意します。各要素には`id`（`s4`/`s5`/`s6`）、`path`（実MP4の絶対パス）、`sha256`を記録します。公開制作記録の3入力SHAと一致するファイルのみ使用してください。結合スクリプトは始終の入力SHAを確認し、H264/AACの`release020-review.mp4`と`assembly-receipt.json`を出力します。

```sh
python3 "$SOURCE_ASSEMBLE_PY" --evidence "$OUT"
ffmpeg -v warning -i "$OUT/release020-review.mp4" -f null -
```

## 制作時点の確認

最終媒体は1920×1080、30fps、6,162フレーム、205.400秒、9,736,455バイトです。全編デコードは終了0、警告・エラー0。元3MP4の始終SHA一致と、媒体ソースを商品・機械ソースから分けた最終SHA照合を確認しました。実MP4の出口比較・旧長比較の悪化・末尾の図表を抽出して確認しています。

末尾のCD再開版照合は関連100件と独立照合をPMが受け入れた範囲を記載します。実障害からの復旧・ロールバック・人間の聴感は未検証です。自然再生とPRプレイヤーの最終受入は、この制作時点の公開記録を後書き換えせず、PR・Issue側の受入記録に残します。制作担当はGitHub投稿や本番操作を行いません。
