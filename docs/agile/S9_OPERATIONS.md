# S9 音源のローカル確認と復元

2026-10-19更新。現在はアップテンポへ改修したv3と、導入BGMの連続再生修正を確認します。制作完了、数値検証、実ブラウザ出力、人の試聴、PM採否は別に記録します。最新状態は[S9_ACCEPTANCE](S9_ACCEPTANCE.md)、割当は[S9_SOUND_ASSIGNMENT](S9_SOUND_ASSIGNMENT.md)を参照してください。

## ローカルで確認する

作業場所は `/private/tmp/silverball-s9-20261018`。現在の試聴ページは `http://127.0.0.1:5449/dev/s9-audio.html`、本編は同じoriginの `/` です。Leadが5449で検証中の場合は共有サーバーを再起動しません。停止済みで担当間の静穏時間を確保した場合だけ、checkoutルートから起動します。

```sh
npm --prefix prototype run dev -- --host 127.0.0.1 --port 5449 --strictPort
```

試聴ページでは17用途から選び、基準/候補を一つずつ再生します。現在の基準は改修直前02054e8の同じ用途のS9音源で、候補はaudio-v3です。初稿時の背景padや別用途charge、入賞音なしの比較は現在のプレイヤーでは使用しません。manifestのauditionGainは大きい側だけを減衰して比較し、原素材は変更しません。試聴ページの音量と、本編のBGM/SE個別設定は別です。

代表一本の時間表は本編定義を参照しますが、素材プレイヤーや既存の演出比較画面だけで本編の当落後・復帰・実ミックスを検証したとはしません。光/剣列と無音開始/解除境界は両幅3結末のDOM QA済みです。50.2秒は既存cueにも含まれ、loss53.3秒は共通無音窓から反映します。音源再生/本編通しの判定とは分けて受入票を確認してください。

本編はユーザー操作で音声を開始します。通常→代表戦闘の勝ち/外れ/復活→BONUS/通常復帰、RUSH/終了を音付きで確認します。個別音量/消音、PUSH前後、pause/hiddenと手動復帰、退出再入場を確認し、曲位置・二重音・残音・過去cueの追い鳴らしを記録します。試聴は低い端末音量から始め、出力機器と設定値を保存します。OSの音量・別origin・別端末・スマホ実機を検証したと推定しません。

## 再生成と保存版

同じcheckoutの作曲/合成APIを使います。Node/FFmpeg版、実行前後のsourceとscoreのSHA、対象音源、ログ、判定を保存します。新旧の試聴/収録中には実行しません。v3の専用toolは完成済み出力への上書きを拒否します。再生成が必要なら新しい保存先を用意するようtoolを調整し、その変更も記録します。audio-v1/v2の旧toolを現在のsourceで実行して過去素材を上書きしません。

```sh
# checkoutルート。空の保存先で最初に代表音、その後に全素材。
node prototype/tools/s9-render-audio-v3.mjs --representative
node prototype/tools/s9-render-audio-v3.mjs
node prototype/tools/s9-audio-spectrum-v3.mjs
node prototype/tools/s9-v3-technical.mjs
```

出力は `prototype/reference-review/s9-20261018/audio-v3/`。manifestに17用途・音源150ファイルのSHA/bytes、source、実行版renderer、loop/尺、試聴gainを対応づけます。WAVとMP3は同じ素材の形式違いです。音源生成時のsourceはexecuted-sourceへ保存しています。`measurements/` とspectral資料の数値、MP3 decode、旧win/rushWin各4variantのPCM一致は技術証拠です。スペクトルの重心やpYIN valid率を品質点として扱いません。技術検証を人間の聴感や新sourceの本編出力に流用しません。

## 個別音量の保存と設定だけの復元

本編の保存キーは `tsukikage-audio-v1`、実装は `prototype/src/app/audio-settings.js` です。

|キー内の値|初期値|範囲|
|---|---|---|
|musicVolume|0.5|0〜1の有限数|
|effectsVolume|1|0〜1の有限数|
|musicMuted|false|boolean|
|effectsMuted|false|boolean|

設定はorigin単位のlocalStorageへ保存します。消音は音量を上書きせず、解除後に個別音量を維持します。保存禁止/破損時は初期値で動作します。OS音量や試聴ページのvolumeは保存対象外です。

設定だけ戻す場合は先に当該キーの元値を控え、ローカル本編originの開発者コンソールで次のキーだけを削除して再読込します。遊技状態や他の保存データ全体は削除しません。

```js
localStorage.removeItem('tsukikage-audio-v1');
location.reload();
```

控えた設定へ戻す場合は同じキーへ元のJSON文字列を戻して再読込します。アプリ内設定保持の実確認と、開発者操作で復元したことは分けて記録します。

## 不具合時の切分けと戻し方

収録の100ms詳細記録は、PRでコードの差分を読みやすく保つため、Gitには同じ内容の `.json.gz` を保存します。元JSONと原媒体はローカルに維持しています。`scene-archives.json` に圧縮前後のSHA/bytesと可逆一致を記録し、必要時は対象の `.json.gz` を展開して参照します。原記録の値を要約値へ置き換えたものではありません。

まず再現条件、HEAD/未コミット差分、音源manifest SHA、音量、AudioContext状態、曲/曲位置、voice/cache、実際のログと録音を保存します。初回操作ブロック、worker読み込み失敗、mute、hidden、素材URL欠落を分けます。音が出ないことを抽選/盤面の変更で回避しません。

一時的に音を止める場合は本編のBGM/SEを個別消音し、音量値を維持します。これは以前の製品版へ戻したこととは異なります。素材差戻しでは当該素材と対応score/manifest/生成sourceを同じ保存世代へ揃え、runtime差戻しでは音関連差分をレビュー対象として最小化します。現S8採用配置・3枚羽根・ガイドなし・通常.18/右.85・抽選/保存/払出を古いruntime丸ごと復元で巻き戻しません。どちらも旧検証を新しい版の成功とせず、必要な出力/回帰を再確認します。

今回は復元操作・PR集約・mainマージ・CD/公開を実施していません。7段落のナレーションはユーザー承認・公式CLI承認記録済みで、7WAV/timelineを保存しています。v3動画では現在にも当てはまる3〜7段落だけを文面・原音・順序を保って使い、新しい発話を合成しません。voice-policyは実engine APIから取得。本文や声の変更が必要な場合は既存承認条件に従います。旧before-v1/after-v2と動画v1/v2は過去の証拠です。最新収録はruntime/energy-v3、媒体はpr-video-v3へ分け、完成・再生・CIの状態は受入台帳とPRへ記録します。人の聴感採否は別に扱います。クラウド更新/公開の許可をローカル作業から推定しません。
