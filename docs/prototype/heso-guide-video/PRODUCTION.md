# ヘソガイド撤去のPR説明動画

PR #36 → release/0.3.0向け。2026-10-16にユーザーがscript.mdの9段落を承認。公式yukkuri-video CLIで承認を記録し、既存のVOICEVOXずんだもん・ノーマル（style3）で合成。発話・順序は変更していません。クレジットは動画内に「VOICEVOX:ずんだもん」。声の規約と取得元はvoice-policy.jsonに保存しています。

制作ソースは `tools/pr-video/heso-index.tsx` と `heso-capture.mjs`。音声タイムラインの実測長から1920×1080/30fps、2269フレームの構成を作ります。字幕は同じ発話を句読点と文字数で分割し、各音声区間へ配置します。音素単位の強制アラインメントではありません。

## 比較条件

変更前はrelease/0.3.0の9317e61324b274be9b74025643f26cd7bdaf3308、変更後は94e98b4f81f3706a0fe3a1c37e5afcac56ac120c。両方とも本番用ビルドのChrome、1280×960、通常発射強度0.18で撮影。導入スキップ直後の0秒から自然発射を追い、撮影のため当選指定・入賞注入を行っていません。

各180枚の実ブラウザフレームを保存し、両側の機構時計は0→6.1166667秒。対応フレームの時刻差は最大1/120秒。記録時刻に合わせて映像タイムスタンプを伸長し、30fpsへ量子化しています。盤面全体とヘソ局所は同じ記録を再掲し、局所は同倍率で拡大。映像を使い切った場合は最後の実フレームと明示して保持します。約6秒の映像比較を長時間の入賞率検証へ広げません。

PC/スマホ画面は候補の現在版。初回main試作の画像・旧入賞数は使いません。関連17テスト・本番ビルド、追加の全体590テストが成功。スマホ実機・長時間入賞率は未検証、本番未更新。

## 再生成

Remotion4.0.505、React19.2.3の既存runtimeを `tools/pr-video/node_modules` から参照します。製品の依存は変更しません。WAV・原フレーム・MP4は `prototype/reference-review/heso-guide-removal-030-20261016/pr-video/` へ保持し、Gitへ大量rawは追加しません。

台本・承認記録を使いyukkuri_tts.pyでpublic/audioへWAVとtimeline.jsonを生成後、変更前と変更後の本番ビルドを別portで起動し、HESO_VIDEO_PUBLIC、HESO_BEFORE_URL、HESO_AFTER_URLを指定してheso-capture.mjsで収録します。capture.jsonが実時刻・前後SHA・例外を記録します。元180枚の時計6.1166667秒へ合わせる処理はffmpegのsetpts（6.1166667/6）とfps=30です。

```sh
node /path/to/runtime/node_modules/@remotion/cli/remotion-cli.js render \
  tools/pr-video/heso-index.tsx HesoGuideReview \
  prototype/reference-review/heso-guide-removal-030-20261016/pr-video/heso-guide-review.mp4 \
  --public-dir=prototype/reference-review/heso-guide-removal-030-20261016/pr-video/public \
  --codec=h264 --crf=24 --audio-codec=aac --concurrency=2 \
  --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

## 検証状態

局所拡大と結果表のRemotion静止画を今回実見し、字幕の欠け・重なりがないことを確認。9WAVの実長とtimelineの一致を検査済み。最終MP4はH264/AAC、1920×1080/30fps、2269frame、映像75.633333秒・container75.690667秒、5,639,904B。SHA256は `90b3fbabf310e335f5f18f04ab77f48c960123e2ecc966dee53e8d7d3d850c5b`。全デコード成功、全9発話区間の音声ありを確認。実MP4の冒頭・PC/スマホ・最終場面も実見。ローカルChromeで音声有効・rate1・seekなしの自然終端（75.690667秒、error null）を確認しました。

[PR36冒頭動画](https://github.com/user-attachments/assets/41bb889b-d5d3-44b4-a2e5-cacd1e3260c6)へ添付済み。PR内でも先頭から音声有効・rate1の連続再生で75.690667秒の自然終端、error nullを確認。再生記録はpr-playback.json、表示はpr-player-ended.pngへ保存しました。最新CIはGitHubの該当HEADへ結び付け、以前の成功を最新結果へ流用しません。人間の耳による聴感確認は未検証です。
