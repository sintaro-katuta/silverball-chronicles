# Cloudflare公開

2026-10-06。公開先はCloudflare Workers Static Assets、公式CLIはWrangler。ユーザーの「はい、公開して」という明示許可を受けて初回公開を実施。Git連携による自動公開・有料サービス・独自ドメイン購入は追加しない。

公開URL：[silverball-chronicles](https://silverball-chronicles.sintaro-katuta.com)

台名で接続していた [tsukikageの旧URL](https://tsukikage.sintaro-katuta.com) も別名として保持。サービス名の正式表記は `silverball-chronicles`。

予備URL：[workers.dev](https://tsukikage-pachinko.sintaro-katuta.workers.dev)。独自ドメイン接続と検証は[独自ドメイン接続](CUSTOM_DOMAIN.md)を参照。ゲームは再アップロードせず公開済みWorkerへ接続し、HTTPS・スマホ／PCの25画像・操作を確認済み。

現在のCloudflare Version ID：`5e39c37c-135e-4b4b-b1e1-9ff0fefd339c`


2026-10-07 再レビューの優先4点を公開：ユーザーの「公開版に反映して」という今回の明示許可により、[受け皿・右打ち案内・PC拡大](RECEIVING_TRAY_2026-10-07.md)を同じ公開URLへ反映。変更前Version IDは `381ded4a-22fc-48a8-97ff-b15a17480ebf`。公開用ビルドと素材テスト2件成功、`dist-release/` の変更5ファイルをアップロードした。公開JS `game-DMR7qvaL.js` のSHA-256は `d1c7f97c7b6ccfef9ee43f0df4949a02abcd5681d7e3fe978a83e550febeefd3` でローカルビルドと一致。直後の単体JS取得は一度404となったが、再取得成功。公開URLのスマホ390×844／PC1440×900で全25画像・停止/復帰と今回の表示・操作を確認。今回の許可はこの更新だけに適用する。証拠は `prototype/reference-review/receiving-tray-2026-10-07/published/`。


2026-10-07 遊技フィードバックの公開：ユーザーの「公開版に反映させて」を今回の明示許可として、[常設操作・入賞待ち・演出体験の改善](PLAYER_FEEDBACK_2026-10-07.md)を同じ公開URLへ反映。変更前Version IDは `80df47bb-1bfb-4099-8f96-ffad7a57899b`。検証済みreleaseを再ビルドし、素材テスト2件を確認。公開対象は `dist-release/` のみ、変更5ファイルをアップロードした。公開メインJS `game-BKu6XS4z.js` のSHA-256は `3eb9d71ee3c6477cbaf7d25c5328ad15ca668801fb162d2ecfe761ce5b8737b4` で、ローカルの検証済みビルドと一致する。

独自ドメインは通常のDNSでHTTP 200。390×844/1440×900の全25画像・休止/復帰、常設発射操作・強さ調整・表示切替を公開URLで確認し、HTTP/ブラウザエラーなし。戦闘/PUSH、大当りの実払い出し、RUSHの体験と、体験終了後の通常遊技への復帰も公開URLで成功。記録は `prototype/reference-review/player-feedback-2026-10-07/published/`。今回の許可を今後の更新へ拡張しない。

2026-10-06 全図柄リーチの公開：ユーザーの「公開版にも反映させて」を今回の明示許可として、[1〜9のリーチ・大当り図柄](REEL_SYMBOLS_2026-10-06.md)を反映。変更前は `85a826ca-9eeb-4b6b-a843-344ae9a8b2da`。公開用ビルドと素材テスト2件、公開前の390×844／1440×900で25画像・停止/再開を確認。変更4ファイルをアップロードし、公開メインJSは `game-ByAv1Tki.js`。公開JSのSHA-256が手元の検証済みreleaseと一致。

更新後の独自ドメインでも390×844／1440×900の25画像・停止/再開と、発射停止・ポーズ・フォーカス・終了/台選択復帰を確認。HTTP/ブラウザエラー0件。ただし、この環境のローカルDNS（192.168.2.1）は独自ドメインにNXDOMAINを返したため、Cloudflare DNS（1.1.1.1）の応答 `104.21.87.95` をChromeのhost resolverとcurlのresolveへ指定して検証した。URL・Host・HTTPS証明書検証は維持。端末/ルーターのDNS設定は変更していない。記録は `prototype/reference-review/reel-symbols-2026-10-06/published-release.json`。今回の許可を今後の公開許可には拡張しない。

2026-10-06 盤面外周・装飾の公開：ユーザーの「更新して」を今回の明示許可として、[外周形状と装飾追加](BOARD_SHAPE_2026-10-06.md)を同じURLへ反映。公開用ビルド、素材テスト2件、公開前の390×844／1440×900で25画像・入口幅20・初期強度.20・停止/再開を確認して更新した。更新前Version IDは `9e58997c-b1e9-4af4-9ec6-94e9397258cc`。変更4ファイルをアップロードし、公開メインJSは `game-CuvvurV7.js`。今回の許可はこの更新に限る。

更新後も公開URLの390×844／1440×900で同じ25画像・停止/再開・入口幅・初期強度を確認、HTTP/ブラウザエラー0件。公開版の全体・盤面を `prototype/reference-review/board-decor-2026-10-06/published-*.png` に撮影し、装飾の反映を確認した。

2026-10-06 ヘソ調整の公開：ユーザーの「これで公開版にのせて欲しい」を今回の明示許可として、[ヘソ再調整](HESO_ADJUSTMENT_2026-10-06.md)を反映。入口幅20・初期左打ち.20を含む録画時の現行本編を公開用ビルドから更新し、変更4ファイルをアップロード。更新前Version IDは `dca6e1a5-bb7c-4623-ae02-b750c79daea3`。公開用ビルドと公開前/後の390×844・1440×900検証で、入口幅20・初期強度.20・25画像の読込・停止/再開を確認、HTTP/ブラウザエラー0件。公開メインJSは `game-B46b3Jbn.js`。今回の許可はこの更新に限り、今後の更新許可としては扱わない。

初回公開Version ID（ロールバック先）：`03cca2c3-a603-4733-bdc9-959e4e81e050`

2026-10-06 続行：[準備時間のリファクタリング](STARTUP_REFACTOR.md)で、公開用画像をWebP＋ハッシュ付きURLへ変更し、読み込みを並列化した。ユーザーの「はい良いです」という今回の修正版の公開許可後、同じURLへ更新済み。25画像12.40 MiB、配布全体14.19 MiB。公開URLで初回11.455秒（10 Mbps・遅延60 ms・キャッシュ無効）、同ページ内の再入場343 ms、PC／スマホの全画像と停止・再開、キャンセル・通信失敗後の再試行を確認。画像のHTTP 200と1年のimmutableキャッシュも確認した。以下のPNGコピー・44ファイル・51.02 MiB・圧縮しないという説明は初回公開の記録。

## 要件と設計

- 現行本編 `/` を外部のスマホ・PCから遊べるようにする。
- 旧素材・確認用ページ・生成プロンプトは公開しない。ローカルの原本と通常／確認用ビルドは保持する。
- 抽選・出玉・物理・演出・画像自体は変更しない。画像の縮小・再圧縮は行わない。
- 1ファイル25 MiB以下。本編の画像が欠けず、ブラウザ／HTTPエラーがないことを確認する。

`vite build --mode release` はpublic全体の自動コピーを停止し、`tools/release-assets.js` の許可リスト25画像だけを `dist-release/` にコピーする。Viteが生成する本編HTML・JS・CSS・フォントも同じ出力に含まれる。STORY_PREDICTION_ASSETSから予告画像名を取得する。コピー前にサイズを検査し、素材欠落・サイズ超過でビルドを失敗させる。

`wrangler.jsonc` はこの出力だけを静的配信する。サーバー処理・DB・R2・有料プランは不要。現在の画面遷移は `/` 内で行うためSPAの404フォールバックは設定しない。旧素材のURLは公開先で404になる。

## 検証

- 整理前：144ファイル、301.19 MiB、最大27.08 MiB。
- 公開用：44ファイル、51.02 MiB、最大3.26 MiB。HTMLはindex.htmlのみ。
- `npm run build:release` 成功。従来の500 kB以上のJSチャンク警告は残る。
- `release-assets.test.js`：許可リストの画像だけをコピーし、内容が原本と一致すること、25 MiB超過の拒否を検査。
- `npm --prefix prototype run test:release`：390×844／1440×900で25画像すべてが実際に読み込まれ、一時停止・再開が動作。HTTP／ブラウザ／リクエスト失敗0件。
- `wrangler deploy --dry-run` 成功。これはアップロード・公開成功を意味しない。
- `npm test`：371件すべて通過。その実行開始後に追加した25 MiB超過の拒否テストを含む公開素材テスト2件も個別実行して通過。

- Cloudflareへ44ファイルをアップロードし、公開完了。
- 公開URLの `test:release`：390×844／1440×900で25画像すべて読み込み成功、一時停止・再開成功、HTTP／ブラウザエラー0件。
- 公開URLの既存 `test:browser`：発射停止、ポーズ、キーボードフォーカス、再開、終了、台選択への復帰が通過。ブラウザ例外0件。
- 公開URLへのcurl：本編 `/` は200。旧GLB、旧画像確認HTML、開発ページ、生成プロンプトの代表URL4件は404。

リモート向けのデバイス認証でログインした。公開の自動承認レビューでは追加許可を要求されたが、その後ユーザーの「はい、公開して」を受けて公開成功。現在は認証待ち・公開待ちではない。

## 操作と運用

リポジトリルートから実行する。

```sh
npm --prefix prototype ci
npm run build:release
npm --prefix prototype run preview:release -- --port 4178
# 別のターミナルで公開用出力を確認
npm --prefix prototype run test:release
```

初回認証：

```sh
cd prototype
npx wrangler login
```

手元のブラウザと実行環境が別（リモート）の場合は、localhostへのコールバックを使わないデバイス認証を使う。

```sh
npx wrangler login --device --browser=false
```

表示されたCloudflareの認証リンクを手元のブラウザで開き、期限内にコードを入力して認可する。パスワード・APIトークンをチャットへ送る必要はない。

認証済みの状態で公開・更新：

```sh
npm run deploy
```

ルートのdeployはprototype側へ委譲し、公開用ビルド後にWranglerを実行する。公開対象は `prototype/dist-release/` のみ。今後のクラウド更新もユーザーの明示許可を得て実行する。

公開先URLに対する確認：

```sh
REVIEW_URL=https://公開先 npm --prefix prototype run test:release
REVIEW_URL=https://公開先 npm run test:browser
```

素材を追加・差し替えたら許可リストも更新し、公開用ビルドとブラウザ検証を実行する。通常の `npm run build` はpublic全体を含むため、そのdistをWranglerへ渡さない。

障害時はまずブラウザのHTTPエラー・画像欠落を確認する。認証失敗は `wrangler whoami`／`wrangler login` で確認する。既存公開のロールバックはCloudflare管理画面の対象WorkerのDeploymentsから以前の版を選ぶか、prototype内で `npx wrangler rollback <VERSION_ID>` を実行する。初回公開には以前の版がない。ロールバックもユーザーの指示を得て行う。

現行本編の途中保存・報酬保存は未接続であり、公開してもアカウント同期は追加されない。

## 公式資料

- [Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [料金](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [制限](https://developers.cloudflare.com/workers/platform/limits/)
