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
