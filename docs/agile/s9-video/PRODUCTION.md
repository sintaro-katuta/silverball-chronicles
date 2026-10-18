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

## アップテンポへの改修と導入BGM（v3）

今回の比較基準はS9の02054e8である。旧pad素材と新曲の比較を、今回の曲調変更の比較へ流用しない。4曲と新SE13用途の改修、本編の全体→盤面→液晶の導入で曲頭へ戻り続ける不具合の修正を、最新の実出力で説明する。曲調の変更と導入の再生制御は別の変更として記録する。

既承認7段落のうち3〜7を、WAV・文面・順序・全尺・正本の間隔を保持して使う。1段落目は新SE8の全体説明、2段落目は旧pad比較なので今回の基準に合わず使用しない。新しい発話やTTS合成はしない。「八つの用途」は演出SE8の範囲と字幕で示し、リール4・ヘソ1を含む合計13は冒頭・割当表で説明する。原台本の承認状態とSHA、流用5WAVのSHAを照合し、流用部分まで新たに承認されたとは記録しない。

本編比較はBGM.5・SE1・1倍のcanvasと実AudioContext。通常は実発射と物理通過による最初の入賞付近から各12秒、戦闘は表示時計48.5秒付近から各6秒、BONUS/RUSHは体験UIの同じ録画9秒から各4秒とする。通常の外れ指定・戦闘の当たり指定・体験用結果を字幕で示し、抽選率や全軌道の一致は主張しない。単体一撃SEの比較は別枠で大きい側だけを減衰し、同LUFSで聴けるようにする。音源単体の比較gainを本編の録音へ黙って適用しない。

`s9-energy-record.mjs`が前後8本の等速収録、導入不具合の専用browser検証が導入音の証拠を保存する。`s9-energy-prepare.py`で抜粋/原媒体SHA/原音声を固定し、`s9-energy-index.tsx`のRemotion構成で説明と比較を分ける。入力始終一致・全尺decode・符号化後の音を`s9-energy-verify.py`で確認する。素材・媒体・receiptは`pr-video-v3/`へ世代を分ける。最新媒体の自然再生、PRプレイヤー、CI、聴感の状態は受入台帳とPRへ対応させる。

```sh
node prototype/tools/s9-energy-record.mjs
python3 tools/pr-video/s9-energy-prepare.py
python3 tools/pr-video/s9-energy-verify.py --snapshot
tools/pr-video/node_modules/.bin/remotion still tools/pr-video/s9-energy-index.tsx S9EnergyReview /tmp/s9-energy-preview.png --frame=1400 --public-dir=prototype/reference-review/s9-20261018/pr-video-v3/public --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
tools/pr-video/node_modules/.bin/remotion render tools/pr-video/s9-energy-index.tsx S9EnergyReview prototype/reference-review/s9-20261018/pr-video-v3/s9-review-v3.mp4 --codec=h264 --crf=28 --audio-codec=aac --audio-bitrate=128k --concurrency=2 --public-dir=prototype/reference-review/s9-20261018/pr-video-v3/public --browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
python3 tools/pr-video/s9-energy-pack.py
python3 tools/pr-video/s9-energy-verify.py
```

録画とprepareは新しい出力先に一度だけ実行する。再試行する場合は世代を分ける。予定構成は4010フレーム・133.667秒で、導入前後は各7.5秒。captionだけの冒頭6秒は意図した無音とし、以後の比較・既承認発話には符号化後も音声があることを検査する。

RemotionのCRF28出力は添付上限を超えたため、原MP4を`s9-review-v3-render.mp4`へ保持し、packing toolで映像だけCRF31へ再符号化する。AACはcopyしパケット一致を検査する。原版/添付版のSHAとbytes・実コマンドはpacking-receipt.jsonへ保存し、最終検査と自然再生には添付版を使う。

完成した添付版は4010frame・8,092,114bytes、SHA `3299fcefaf96c70d0b0aadd2e90f10012b110d92fcb6c2f7be2b43fa0ca326ce`。入力始終一致・全尺decode・比較12区間/発話5区間の有音を確認。local-playback.jsonとpr-playback.jsonに、ローカル/PRでの133.717秒自然終端・音あり・rate1・error null・seek操作なしを記録した。PRの先行タブ移動による未完了試行は成功に含めない。人間聴感と最終CIは別判定。
