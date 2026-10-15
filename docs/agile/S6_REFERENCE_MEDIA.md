# S6追加比較：実座標リプレイの準備

媒体用ファイルは `prototype/tools/s6-reference-media/` の4本です。機械ソース・試射条件・写真素材は変更しません。現段階は入力検査と静止・隣接フレーム確認のhelperで、PRの台本依存シーンや完成動画ではありません。新raw到着・測定quiet返却後の静止QAは末尾に記録しました。完成動画の実再生は未完です。

## 入力と表示

- `trial-input.mjs`：JSON/gzipをmagic bytesで判別し、圧縮・展開後SHAを別々に記録します。30/60Hzの宣言、発射＋排出の全時間、全4951/10351フレーム（30Hzの165/345秒）、元101本、実半径・前後層・座標・機構角・計数の整合を検査します。先頭60秒だけや1秒記録を全時間映像として受け付けません。
- `replay.html/js`：現在の `mountBoard({trialReplay:true})` に実flowOptionsを渡し、表示pinsとrawを照合します。全体と同倍率拡大を同じ記録から表示します。実timeに対応する直前フレームを選び、補間・物理再計算をしません。30Hzと60Hzを比べる場合も、各側の実時刻とfpsを表示します。
- `capture.mjs`：元配置・旧道釘2・新案のうち2条件を指定できます。開始条件・発射・半径・口・重力などと固定形状の一致を検査し、機械source inventoryを取得前後で照合します。媒体4ファイルは機械sourceと別にhash記録します。

入賞の前後は `events` の `type=admission, kind=start` を使います。`outcome` と二重に数えません。入賞した側のイベントを選び、相手側にも同じ試射秒を要求します。相手側にその時刻の入賞がないこともそのまま示します。発射停止と排出終端を別に取得し、途中の計数を終端成績にしません。

## 実行例（新raw・quiet確認後）

作業場ルートから既存依存でサーバーを起動します。別ターミナルで、SHA・世代の確定した入力と新しい空の出力先を指定します。

```sh
node prototype/node_modules/vite/bin/vite.js prototype --host 127.0.0.1 --port 5307 --strictPort
node prototype/tools/s6-reference-media/capture.mjs --a "$RAW_A" --b "$RAW_B" --provenance "$PROVENANCE" --manifest "$RAW_MANIFEST" --out "$NEW_OUTPUT" --event 1:0 --motion-time 5
```

- `--manifest` は同じ試射フォルダの`raw-manifest.json`です。
- `--a/--b` は `.json` または `.json.gz` の絶対パスです。`--provenance` はその試射世代の機械source inventory入り記録です。別世代の原データへの付け替えは拒否します。
- 時刻を指定しなければ、開始・5秒・10秒・発射停止・排出終端を取得します。`--times 0,5,120,165` などで明示できます。
- `--event 1:0` は2番目の入力の最初の実ヘソ入賞です。前2秒・イベント時刻・次の保存フレーム・後3秒を両側同時刻で取得します。存在しないイベントなら失敗し、架空の入賞は作りません。
- `--crop '{"x":49,"y":307,"w":36,"h":44.28}' --crop-time 5` で、現在の396×436盤面表示内の同じ範囲を両側同倍率で取得できます。縦横比は出力600×738と揃えます。
- `--motion-time` は隣接実フレームの移動有無を確認して2枚を保存します。これだけで全尺の連続再生・性能・全球安全を合格にしません。
- 出力先が空でなければ拒否します。検証完了後は所有Chromeをfinallyで閉じます。サーバーは操作者がCtrl-Cで終了し、quiet返却を通知します。

`verification.json` にrawの双方SHA、機械source、実条件・配置、表示側形状、要求/実時刻とフレームindex、同時刻計数、媒体hash、エラー、ブラウザ・DPRを保存します。説明動画の書き出しは結果・採否・新台本の人間承認後の別工程です。

## guardの階層と素材の照合

機械inventoryは`base/extra/files`を全階層から再帰抽出し、path重複は統合します。同じpathに違うSHAがあれば拒否します。測定provenanceのsuccess/sourceUnchanged/endSourceSHA一致とrawのsourceSHAを確認し、全入力bytesを取得前後で照合します。raw-manifestは圧縮/展開SHA・bytes・source/config/layout・fps/framesを全て照合します。

媒体4ファイルと、public全ファイルおよびインストール済みDotGothic16フォントは、機械hashとは別の媒体inventoryとして前後保存・一致検査します。public inventoryは使用素材を含む広い範囲で、全ファイルが実際に要求されたという意味ではありません。実際のresource request一覧とdocument.fontsの状態も取得します。ブラウザ/OSのシステムフォントそのもののbytes保証へ拡張しません。

階層抽出は、既存173入力を1段包み3つの合成項目を追加する軽いfixtureで176件抽出・重複除去・衝突拒否を確認しました。これは新測定や素材全hashの実行ではありません。

## 2026-10-15 静止・隣接フレームQA

新5gzip（原配置・旧道釘2・新3案）は全て165秒/30Hz/4951フレームを検査しました。取得した原対各新案の10秒全体/局所、120秒発射停止、165秒排出終端で元101・左上の狙い・外枠・レールと指定した釘差を確認しました。原対旧道釘2は実入賞62.876190秒の前後を取得し、直後の保存フレーム62.900秒でヘソ0対1を表示できました。正確なイベント時刻と画像の実時刻は分けて記録しています。

正本はローカル`reference-informed/media-qa-final/`です。機械176入力・gzipmanifest・public/font392項目・媒体4ファイルの前後一致、pageerror0、両側の隣接実フレーム位置変化を確認しました。これは全尺動画鑑賞や性能の合格ではありません。新3案は改善未達の未採用、説明動画と新台本は別工程です。取得中の計数文字の重なりを直した前世代は`media-qa/`へ履歴保持しました。商品ソースは変更していません。
