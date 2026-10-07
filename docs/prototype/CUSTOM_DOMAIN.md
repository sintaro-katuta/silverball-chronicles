# 独自ドメイン接続

2026-10-06 命名訂正：正式なプロジェクト／サービス名はpackage.jsonの `silverball-chronicles`。「月影機関」は台の名前。ユーザーの訂正を受け、主URLを [silverball-chronicles.sintaro-katuta.com](https://silverball-chronicles.sintaro-katuta.com) へ合わせた。従来のtsukikageサブドメインは互換用の別名として保持し、Wranglerにも両方を記録している。

追加Domain IDは `97422be4e6f10d6566d0ba908128311d8af588e0`、enabled true。Cloudflare権威DNSと1.1.1.1／8.8.8.8でAレコードを確認。公開DNSが返すIPを用いた証明書検証付きcurlでHTTPS 200、同IPで一時的に名前解決したChromeで390×844／1440×900の全25画像、停止・再開、HTTP／ブラウザエラー0件を確認。検証環境の通常リゾルバーには追加直後の否定キャッシュが残っていたため、通常の名前解決で開けるまでの時間は利用環境に依存する。コンピューターのDNS設定は変更していない。

2026-10-06。ユーザーが所有する `sintaro-katuta.com` を使い、月影機関を `https://tsukikage.sintaro-katuta.com` で公開する。ユーザーの「はい、進めて」に基づく作業。ドメイン契約・更新はお名前.com、DNSはCloudflare Free、配信は既存のWorkers Static Assets。ドメイン移管・有料プラン・既存のworkers.dev URL削除は行わない。

接続完了：[silverball-chronicles](https://silverball-chronicles.sintaro-katuta.com)。旧別名：[月影機関](https://tsukikage.sintaro-katuta.com)。Cloudflareゾーンactive、Custom Domain enabled、HTTPS正常、スマホ・PCの本編操作確認済み。

## 接続結果と検証

- Cloudflareゾーンは2026-10-06 09:46:18 UTCにactiveへ移行。.com権威DNSと独立した公開DNSでelisa/mike.ns.cloudflare.comへの委任を確認。
- Domain ID：`cddae3c313fa6303ab904555032660fb78a14aea`。対象hostnameはtsukikage.sintaro-katuta.com、serviceはtsukikage-pachinko、enabled true。
- 接続時の公開済みWorker Version ID：`85a826ca-9eeb-4b6b-a843-344ae9a8b2da`（既存の2026-10-06 08:15:20 UTCのデプロイをAPIで確認）。この接続作業で新しいコンテンツ版は作成していない。
- 接続直後は証明書の配信待ちでTLSハンドシェイクが失敗。待った後は証明書検証を有効にしたcurlでHTTP/2 200。
- 独自ドメインの `test:release`：390×844／1440×900で全25画像、停止・再開成功。HTTP／ブラウザエラー0件。main scriptはassets/game-CuvvurV7.js。
- 独自ドメインの既存 `test:browser`：発射停止、ポーズ、キーボードフォーカス、再開、終了、台選択復帰が通過。ブラウザ例外0件。
- 画像HTTP 200、image/webp、Cache-Control public, max-age=31536000, immutableを確認。
- NS切替後の公開DNSでルートA 150.95.255.38、MX 0 .、TXT v=spf1 -allを確認。workers.dev URLも保持。

## 接続までの作業記録

以下のpending／未接続という記述は作業中の経過であり、現在は上記のとおり接続済み。

- お名前.comのDNS `dns1.onamae.com` / `dns2.onamae.com` が有効。Cloudflare／Googleの公開DNSと.com権威DNSで照合済み。公式RDAPでも登録状態active。
- 既存公開DNSを `prototype/reference-review/domain-setup-2026-10-06/dns-before.json` に記録。ルート・www・対象サービス名の公開レコードだけであり、完全なDNSゾーン書き出しではない。
- ルート・www・対象サービス名にA `150.95.255.38`、MX `0 .`、TXT `v=spf1 -all` が返る。対象名でも既存レコードが返るため、サブドメイン接続時の置き換え対象を明示する。
- ユーザーがCloudflareへ追加済み。ゾーン `c7d834c57e0cd857436c75cd24f44c85`、状態pending、Free Website、価格0 USDをAPIで確認。
- 指定ネームサーバーは `elisa.ns.cloudflare.com` / `mike.ns.cloudflare.com`。
- Wrangler認証にはzone readはあるがzone create／DNS編集権限はない。無料ゾーン作成APIはHTTP 403で拒否され、その後ユーザーが手元で追加した。DNS一覧APIも403であり、指定のCloudflare権威DNS2系統からルートのA／MX／TXTを問い合わせたところ、すべてNOERROR・回答0件。引き継ぎを完了してからNS変更する。パスワード／APIトークンの共有は不要。
- `prototype/wrangler.jsonc` に対象Custom Domainを設定済み。Cloudflareゾーンがactiveになるまで通常のdeployは行わない。現行公開内容は変更していない。

ユーザーが4件を入力後、Cloudflareのゾーン書き出し `cloudflare-zone-export.txt` を添付した。ルートA、www A、Null MX、SPF TXTを確認し、A2件のproxy OFFも書き出しに一致。`elisa.ns.cloudflare.com`への直接問い合わせで4件すべての応答を確認した。書き出しに含まれる既存の追加サブドメインNSは変更していない。.com権威DNSの委任先はまだdns1/dns2.onamae.comであり、次は登録元のNS変更が必要。

続行：ユーザーが登録元のネームサーバーを変更済み。.com権威DNSと1.1.1.1の両方でelisa/mike.ns.cloudflare.comを確認。Cloudflareゾーンは直後の確認でまだpending。有効化確認APIはZone Writeが必要で403のため、ユーザーへ概要画面の「Check nameservers now」を案内した。

既存Workerへのドメイン割り当てはWorkers Scripts Write権限のある公式APIで行える。ゾーンactive確認後、`PUT /accounts/5ab5eac84b7578d883029e2eeefe8b94/workers/domains` に対象hostname・既存service・zone_idを指定する。コンテンツは再ビルド／再アップロードせず、公開済み版をそのまま接続する。Wrangler設定には同じCustom Domainが既に記録されており、将来のユーザー許可済み更新でも保持される。

## 設計・受け入れ条件

既存のA／MX／TXT等をCloudflareへ引き継ぎ、対象サブドメインだけ既存Workerに接続する。ルートドメインのサイト・メール用途を無断で変更しない。公開DNSの照合だけでは未知のサブドメイン・DKIM・検証TXTを網羅できないため、お名前.comの設定一覧とCloudflareの自動取得レコードを比較してからネームサーバーを変更する。

接続完了はCloudflareゾーンactive、対象URLのHTTPS正常、全25画像と遊技開始／停止／再開の確認をもって判断する。Cloudflareへのドメイン追加・ネームサーバーの案内だけでは完了としない。

## 実施した手順

CloudflareのDNS Records画面で、現在の公開設定を次のとおり引き継ぐ（既存レコードがあれば重複追加しない）。AはDNS only（プロキシOFF）にして従来の配信先を保つ。お名前.comの全設定一覧も照合し、ここにないカスタム用途のレコードがある場合はそれも移す。

| 種類 | 名前 | 内容 | 優先度 |
|---|---|---|---|
| A | @ | 150.95.255.38 | — |
| A | www | 150.95.255.38 | — |
| MX | @ | . | 0 |
| TXT | @ | v=spf1 -all | — |

MXの内容 `.` は現状のNull MX（メールを受信しない宣言）。フォームで入力できなければ、その時点で案内を確認し、独自のメール配送先を作らない。

1. 手元の [Cloudflare](https://dash.cloudflare.com/) で `sintaro-katuta.com` を追加し、Freeを選択する。
2. 取得済みDNSを照合し、既存用途のレコードを引き継ぐ。Cloudflareの指定ネームサーバー2件はドメインごとの実際の値を使用し、推測しない。
3. お名前.comのドメイン設定でネームサーバーを指定の2件へ変更する。DNSSECが既に有効なら公式移行手順に従い、DSの整合を確認する。
4. DNS反映とCloudflareのactiveを確認する。
5. 公式Worker Domain APIで公開済みWorkerを接続する。今回、コンテンツの再アップロードは行わなかった。将来の許可済み更新はwrangler.jsoncに同じCustom Domainを記録した `npm run deploy` で保持できる。
6. 対象URLで `REVIEW_URL=https://tsukikage.sintaro-katuta.com npm --prefix prototype run test:release` を実行する。

お名前.com側の操作はログイン済みの手元ブラウザで行う。こちらのリモート環境でブラウザを開いても手元には表示されないため、必要な操作と値をチャットで案内する。

## 診断・復旧

NSは.com権威DNSと独立した公開DNSで照合し、Cloudflareのゾーン状態も確認する。HTTPS／画像の問題はCustom Domain証明書とHTTP応答を確認する。CloudflareのDNSレコードが正しいのに一部回線だけ旧NSを参照する場合はキャッシュ反映を区別する。

DNS接続に問題がある間も既存 [workers.dev URL](https://tsukikage-pachinko.sintaro-katuta.workers.dev) は利用できる。戻す場合はお名前.com側のNSを `dns1.onamae.com` / `dns2.onamae.com` へ戻す必要があり、これにも反映時間がかかる。原本のDNSレコードを削除しない。

## 公式資料

- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [CloudflareのFull setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [お名前.comのネームサーバー変更](https://help.onamae.com/answer/20390)
