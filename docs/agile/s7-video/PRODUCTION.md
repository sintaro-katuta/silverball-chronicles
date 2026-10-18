# S7比較動画の制作

承認済み7段落の音声timelineを正本に、1920×1080/30fpsの92秒構成を制作します。VOICEVOX:ずんだもん。発話・順序・設定は変更していません。ナレーションはPMが公式CLIで承認記録後に生成しました。字幕は同じ本文を句読点と文字数で分割し、各音声区間内へ配置します。音素単位の強制アラインメントとは扱いません。

## 現在の受入（2026-10-16）

承認7文・7音声と元5clipを保持した最終MP4はPM受入済みです。実MP4と全renderInputsのsize/SHAを独立照合しました。`s7-review.mp4`はSHA `6b17b3d5c291967605d4ee871d829986fb6a5b76d6ba41b2222b7a6365a0cd7e`、8,008,465B、H264/AAC1920×1080/30fps2760frame、映像92.0秒・container92.053333秒です。全decode終了0、7発話区間の音声ありを確認しました。これは人間聴感の合格ではありません。

PMは実export7場面を実見し、`PM_NATIVE_PLAYBACK.json`でrate1/seek0/自然終端/エラー無し・音声有効を確認しました。#31-2/3の局所映像と#11-D1〜4の今回診断scopeはPM合格です。根本原因修正・#11全体完了へ拡張しません。

[PR33冒頭動画](https://github.com/user-attachments/assets/2af6c99a-9fbd-4ec9-8d03-a44a978d9d3a)は掲載済みで、PRプレイヤーの進行/音声有効を確認、PR内でも92.053秒の自然終端・等速・音声有効・error無しを確認しました。PRはDraft、最終媒体/文書commit後の最新CI・ユーザーPRレビュー・release/0.3.0集約は未完了、本番は未更新です。現在のHEAD296d813のCI成功を将来HEADへ付け替えず、最新PR checksで確認します。

## 入力と区別

媒体ソースは `tools/pr-video/s7-index.tsx` と `s7-data.json`、承認済み台本は同資料dirのscript.md/jsonです。音声/WAV、原5MP4、各MP4の最後の実フレームPNGは私有evidence `s7-20261015/pr-video/public/` に配置します。原MP4/SHAと実行版媒体、機械源179入力、資産392は `evidence-clips/` の各capture/inputs-before記録を保持します。旧機械源はd61ee30/c4cf4340…5891、新本編回帰HEAD34604b3とは別です。私有PRODUCTION.jsonへ全媒体入力SHAを記録しています。大量raw/WAV/MP4はGitへ含めません。

撮影時の誤った説明帯は原映像を保持したまま、x24/y90/幅1232/高さ32だけ訂正します。訂正文は「ヘソ率は2条件で低下・一般41→33／本編設定0.18・公開前」、文字原点x28/ベースラインy111です。時刻・盤面・計数は編集しません。

## 時刻と構成

短全体/左上は物理3〜9秒、長左上は8.5〜14.5秒です。末尾を延ばす場合は最後の実フレーム静止と表示します。flow場面は全体8.5〜12.5秒→下流12.5〜16.5秒を連続するカメラ切替にし、元downstreamの先頭1秒を外します。物理時刻を巻き戻しません。両側の入賞13.4896/15.9865秒を局所で示し、以後は最後の実フレームを保持します。他場面で同じ区間を示す場合はそれぞれの記録時刻を明記します。全165/345秒を連続上映した映像とは呼びません。

短4条件・長3条件と合算、ヘソ率2条件低下・一般41→33を表示します。0.18は位置合わせ目的の限定採用で、成績改善や実機率の保証ではありません。元101、球半径1.8（内部単位）と既定表示、壁/レール/口20/受け皿は保持。factory既定0.20、本編初期0.18、今回は本番未更新です。

## 再生成

Remotion/@remotion/cli/@remotion/bundler/@remotion/renderer 4.0.505、React/ReactDOM 19.2.3を使用します。既存依存を読む環境では tools/pr-video/node_modules を既存runtimeへsymlinkします。新環境は隔離したnpmディレクトリで同版を準備し、そのnode_modulesを参照してください。製品packageは変更しません。

```sh
node "$REMOTION_RUNTIME/node_modules/@remotion/cli/remotion-cli.js" render \
  tools/pr-video/s7-index.tsx S7Review "$S7_VIDEO_DIR/s7-review.mp4" \
  --public-dir="$S7_VIDEO_DIR/public" --codec=h264 --crf=24 \
  --audio-codec=aac --concurrency=2 --browser-executable="$CHROME_EXECUTABLE"
```

プレビュー7場面とflow切替/保持を実見してから書き出します。書き出し後の全デコード・SHA/codec/フレーム数/音声・実MP4代表画像はLeadのs7-verify.pyで別検証。通常速度・seekなしの自然再生はPMが担当し、完了前は未確認とします。人間の耳での聴取は未検証です。

## 音声入力の独立確認

7WAVは24kHz/mono、実長は順に10.773333/11.104/10.741333/9.450667/17.450667/15.626667/14.730667秒です。各実SHAは私有INPUT_VERIFICATION.jsonと一致。実長から開始秒/開始frame・ceilした音声frame・各0.3秒gapを再計算し、timeline合計91.977333秒/2760frameとRemotion構成内timelineが一致しました。speed1.08は承認済み合成設定の値で、波形の聴感評価や話者の耳による確認を完了した意味ではありません。

## PRへの掲載と再生

PM_PR_PLAYER.jsonにPR33と添付URL、MP4 SHA、プレイヤーの92.053333秒自然終端・rate1・muted=false・error=nullを記録しました。ローカル自然再生はseek0で終端、GitHub上も再生ボタンと音声有効操作だけで終端を確認しました。映像は92.0秒、コンテナ/プレイヤーの92.053333秒との差はAACを含む媒体尺として分けます。実MP4から抽出した13枚（7場面・拡大切替前後・両入賞直後・保持・終端）をPMが実見し、可読性、説明帯、左右時刻と比較条件、悪化結果の開示を受入れました。人間の聴感は保証しません。
