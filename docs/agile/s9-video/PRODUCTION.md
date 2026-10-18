# S9 PR動画の制作条件

台本はscript.mdの読み上げ7段落。2026-10-18にユーザーが7段落を承認し、公式CLIで承認記録を保存した。VOICEVOX ずんだもん（ノーマル・speaker 3）の7WAVと正本timelineを生成済み。動画には同音声のクレジットを全編で記載する。実engineの利用規約情報はvoice-policy.jsonへ保存した。

音付きの同条件前後実プレイを使用し、比較中は読み上げを止める。基準と候補を同時に鳴らさない。固定した当落/演出は字幕で明示し、自然抽選率の証拠として扱わない。

本編の抽選・保留・払出・釘配置を維持する。結果のテスト数やCIは実際に終わった記録から結果表へ反映する。台本承認を検証や聴感受入の代わりにしない。

## 構成と再生成

映像は1920×1080・30fps。正本の発話2281フレームへ、発話を切らずに比較8区間900フレームを挿入し、全3181フレーム（106.033秒）とする。説明中はゲーム音を消し、比較中はナレーションを入れない。

変更前はscene-before-v1、変更後はscene-after-v2の等速収録を使う。戦闘は表示時計48.5秒付近から6秒ずつ。通常は3秒ずつ、BONUS/RUSHは変更後3秒ずつ。一撃SEは実プレイと分けて合成音単体の波形図で3秒ずつ比較する。RUSH抜粋は当たり後のBONUS切替を含む。media-receipt.jsonに抜粋位置・元媒体SHA・比較gainを残す。

実行はcheckoutルートで行う。Remotion 4.0.505と同版のReact環境を使用し、public-dirはprototype/reference-review/s9-20261018/pr-video/public。WAV/原WebM/MP4はローカル保存、作曲データ・台本・正本timeline・合成設定・収録と編集ツール・receiptをGitへ保存する。

```sh
python3 tools/pr-video/s9-prepare-media.py
tools/pr-video/node_modules/.bin/remotion still tools/pr-video/s9-index.tsx S9Review /tmp/s9-preview.png --frame=1500 --public-dir=prototype/reference-review/s9-20261018/pr-video/public
tools/pr-video/node_modules/.bin/remotion render tools/pr-video/s9-index.tsx S9Review /tmp/s9-review.mp4 --codec=h264 --crf=24 --audio-codec=aac --concurrency=2 --public-dir=prototype/reference-review/s9-20261018/pr-video/public
```

収録先や音源を上書きする再実行は、元の証拠を世代別に保全してから行う。最終媒体・再生確認はpr-videoのreceiptと[S9受入記録](../S9_ACCEPTANCE.md)へ対応づける。

## リール・ヘソ入賞の追加（v2）

ユーザーの追加指示により、新5用途を冒頭32秒の字幕と本編実音で説明する。承認済み7段落・7WAVは変更せず、新しい発話も合成しない。先行動画は元SHAを確認してそのまま素材に使い、「先行実装分：BGM4曲・演出SE8用途」の表示で説明範囲を明示する。現在の合計はBGM4曲・新SE13用途である。

追加比較は、追加前fead11aと追加後の通常発射で物理入賞した映像を各12秒、BGMのみUIで消音して1倍再生する。外れを指定した収録用の遊技であり、入賞を注入せず、自然抽選率や軌道の完全一致は主張しない。選別規則は最初の物理ヘソ入賞の0.3秒前からとし、100ms観測での位置合わせであることを残す。旧ソースのローカル複製ではHTMLのscriptパスだけ相対化し、製品ソースのbyte一致を別に確認する。

`s9-reel-record.mjs`が原WebM/記録、`s9-reel-prepare.py`が抜粋と元媒体SHA、`s9-reel-index.tsx`が4141フレームのRemotion構成、`s9-reel-verify.py`が入力始終一致・全尺decode・音声区間を確認する。出力は`pr-video-v2/`へ分け、旧媒体を上書きしない。

```sh
python3 tools/pr-video/s9-reel-prepare.py
python3 tools/pr-video/s9-reel-verify.py --snapshot
tools/pr-video/node_modules/.bin/remotion still tools/pr-video/s9-reel-index.tsx S9ReelReview /tmp/s9-reel-preview.png --frame=570 --public-dir=prototype/reference-review/s9-20261018/pr-video-v2/public --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
tools/pr-video/node_modules/.bin/remotion render tools/pr-video/s9-reel-index.tsx S9ReelReview prototype/reference-review/s9-20261018/pr-video-v2/s9-review-v2.mp4 --codec=h264 --crf=28 --audio-codec=aac --audio-bitrate=128k --concurrency=2 --public-dir=prototype/reference-review/s9-20261018/pr-video-v2/public --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
python3 tools/pr-video/s9-reel-verify.py
```
