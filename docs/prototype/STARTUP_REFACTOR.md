# 台の準備時間のリファクタリング

2026-10-06。公開版の「台を準備中」が長いというユーザー指摘への改修。ローカル検証後、ユーザーの「はい良いです」という明示許可を受けて公開先も更新済み。

## 要件と原因

台の準備を短縮し、待ち時間の進捗・戻る・再試行を維持する。抽選・入賞・出玉・演出時間を変更しない。PNG原本・寸法・透過を保持する。通常の開発／ネイティブビルドでは原本を使う。

旧実装は49.24 MiBの25画像を必要とし、筐体2画像のdecode→口→枠→背景→RUSH→戦闘→予告→通常の雲／髪を複数のawaitで直列取得していた。単に公開フォルダを整理するだけでは、本編で必要な画像の転送量と直列待ちは減らなかった。

## 変更

- `src/pixi/board-assets.js`：本編画像の定義を一本化。公開用許可リストもここから生成し、読み込みと配布のずれを防ぐ。
- `board-asset-loader.js`：全画像を並列ロードし、URLごとのPromiseを共有。台詳細画面から先読みし、台準備と再入場で再取得しない。失敗したPromiseは取り除き再試行できる。
- `board-runtime.js`：画像とフォントを並列に待ち、筐体の画像もPixiキャッシュから利用。キャンセル済みならApplicationを作らず、初期化中のキャンセルでは破棄して旧画面へcanvasを追加しない。
- `app/main.js`：台詳細からの先読み、件数ベースの読み込み進捗、画面世代を確認した状態更新。
- `tools/release-assets.js`：Sharpで公開用WebPを生成。口・電チュー・枠4画像は可逆、人物／背景／演出21画像は品質95・alphaQuality100。サイズ変更はしない。原本と圧縮設定・Sharpの版からハッシュ付きURLを生成し、ゲーム画像に1年のimmutableキャッシュを設定。ビルド中断で不完全な画像が残らないよう、一時ファイルからatomic renameする。
- 公開用画像は `.cache/game-art/` で再利用し、`dist-release/game-art/` にだけ配布。通常のpublicフォルダへ派生画像を追加しない。

人物・背景のWebPは非可逆であり、全画素が原本と一致するとは言わない。テストで寸法・全画素のalpha一致を確認し、可視RGBの平均誤差4/255未満を確認。ドット絵4画像は可視RGBも完全一致。通常と液晶拡大の戦闘・PUSH・当たりを原本と比較し、顔・髪・刀・透過・構図が維持されることを目視確認した。

## 実測と検証

Chrome、390×844、10 Mbps下り／1 Mbps上り、遅延60 ms、HTTPキャッシュ無効、台詳細から直ちに開始。ロード完了は準備オーバーレイの除去で計測。実機の回線・GPU性能を保証する値ではない。

| 項目 | 改修前 | 改修後 |
|---|---:|---:|
| 準備時間 | 43.193秒 | 10.893秒 |
| 本編画像25枚の総容量 | 49.24 MiB | 12.40 MiB |

公開フォルダ全体は51.02 MiBから14.19 MiBへ削減。45ファイルで、最大ファイルは0.93 MiB。

準備時間は約75%短縮。改修前のPerformance API記録にはPixiのWorker内画像取得が含まれず2画像しか記録されないため、容量は公開素材25枚の実ファイルから測定。改修後のレスポンスContent-Length集計も12.40 MiB。これを3.17 MiBから増えたとは解釈しない。

- 全体 `npm test`：375件通過。
- 公開素材テスト：25枚の圧縮後容量、原本維持、寸法、全alpha、ドット絵RGB、高品質画像の平均誤差、サイズ上限、キャッシュヘッダー。
- ローダーテスト：25件の並列開始、先読みとの進行中Promise共有、成功キャッシュ、失敗時の再試行、部品確認ページの最小素材集合。
- `test:release`：390×844／1440×900で全25画像が読み込まれ、停止・再開成功、HTTP／ブラウザエラー0件。
- `loading-lifecycle.browser.mjs`：戻る→再入場3回で画像取得は合計25件のみ。開始時間568／343／327 ms、旧canvasやPUSHが残らない。画像取得を1件失敗させた後、台選択から再試行成功。
- 既存の `session-reentry.browser.mjs`：原PNGの開発版で3回再入場、停止・PUSHの破棄が通過。
- `loading-art.browser.mjs`：本編の元PNG／公開WebPで戦闘・PUSH・当たりを撮影し目視比較。ブラウザエラー0件。
- 通常ビルドと公開用ビルド成功。JSチャンクの500 kB警告は従来どおり残る。
- 公開前の `wrangler deploy --dry-run` 成功。

## 公開後の検証

[公開URL](https://tsukikage-pachinko.sintaro-katuta.workers.dev)、Version ID `dca6e1a5-bb7c-4623-ae02-b750c79daea3`。

- 公開用ビルド後、29ファイルを新規／更新アップロード、既存15ファイルを再利用して公開完了。`_headers`は配信設定として処理される。
- 公開URLの10 Mbps／遅延60 ms／HTTPキャッシュ無効で準備11.455秒、画像12.40 MiB、ブラウザ／HTTPエラー0件。記録は `reference-review/loading-2026-10-06/published/timing.json`。
- 390×844／1440×900で25画像の読み込み、停止・再開成功。
- キャンセルからの入場1856 ms、その後の同ページ内再入場343／343 ms。取得は合計25画像のみ、古いcanvasなし。画像取得失敗後の再試行成功。
- 公開画像のHTTP 200、Content-Type image/webp、Cache-Control public, max-age=31536000, immutableを確認。

記録：[準備時間・画像](../../prototype/reference-review/loading-2026-10-06/)、[比較用の撮影コード](../../prototype/tests/loading-art.browser.mjs)。

## 更新と運用

```sh
npm run build:release
npm --prefix prototype run preview:release -- --port 4178
# 別ターミナル
npm --prefix prototype run test:release
cd prototype
node tests/loading-performance.browser.mjs
node tests/loading-lifecycle.browser.mjs
```

新画像はboard-assetsの定義に追加する。静的ドット絵を増やす場合はLOSSLESS_ARTにも追加。素材・圧縮設定を変えるとURLも変わるため、長期キャッシュから旧画像が使われることはない。`.cache/game-art/` は再生成できるローカルキャッシュ。手動でクラウドへ送信しない。

改修のクラウド更新はAGENTS.mdのクラウド運用に従い、今回の改修に対する新たな明示許可後に `npm run deploy` でまとめて行う。以前の公開版Version IDとロールバック手順は[Cloudflare公開](CLOUDFLARE_DEPLOYMENT.md)を参照。
