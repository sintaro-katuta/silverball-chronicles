# S7：公開後確認で失敗した時の記録

対象は [#11](https://github.com/sintaro-katuta/silverball-chronicles/issues/11)。0.2.0の初回台選択待ち失敗は再実行で再現せず、原因は未確定です。今回は次の調査に使う証拠を増やし、成功条件や待機時間は変えません。

## 実装と確認

`prototype/tests/release.browser.mjs` は失敗時だけ `tools/smoke-diagnostics.js` を呼びます。最初の応答のHTTP状態とURL、最終URL、通信・ブラウザ・consoleのエラー、ページ題名・本文、HTMLとスクリーンショットを記録します。捕捉中にページが閉じたり保存できなくても元の例外を再送出します。後片付けの例外も元の例外を置き換えません。

保存はエラー／console各100件・各2000文字、題名500文字、本文8000文字、HTML100万文字までです。画面情報・HTML・画像の取得は並列に各2秒で待機を打ち切ります。既存の合否用エラー収集配列やHTML取得時のメモリ、ファイル書込の時間までをこの2秒で強制中断する設計ではありません。

実ソースで103件の関連単体試験が成功しました。実際の `release.browser.mjs` をローカル模擬ページへ実行し、制御失敗は元の30秒locatorエラーとHTTP200・404・console・画面を保存、保存不能は同じ元エラーで失敗、通常成功は390/1440の両幅で既存の成功判定を通り診断出力なしでした。これらは模擬ページによる診断検証です。現在のゲーム通し検証・Linux CIとは分けます。

- [検証の対象・条件](../../prototype/reference-review/s7-20261015/smoke-diagnostics/verification.json)
- [関連テストログ](../../prototype/reference-review/s7-20261015/smoke-diagnostics/related-tests.log)
- [実ブラウザ3経路](../../prototype/reference-review/s7-20261015/smoke-diagnostics/browser/verification-results.json)
- 条件別の最終判定：[S7受入台帳](S7_ACCEPTANCE.md)

## 運用で調べる方法

失敗証拠の既定保存先は `prototype/.cache/release/smoke-failures/` です。作業ディレクトリによらず同じ場所に保存します。既存のPRとCDのartifact収集対象 `.cache/release` に含まれます。`SMOKE_FAILURE_OUTPUT` で出力先を指定できます。正常時は証拠ファイルを作りません。

1. 失敗したGitHub Actionsの実行と最初の元エラーを確認します。診断保存の失敗を、テストの最初の失敗原因へ置き換えません。
2. 実行のartifactから `smoke-failures` の画面幅・時刻が一致するJSON/HTML/PNGを開きます。HTTP・最終URL・本文・画面とconsoleを照合し、待機対象が表示されていたか確認します。
3. 保存できなかった場合もstderrの `Smoke failure diagnostic` と `originalError` を確認します。画面取得や保存の失敗は診断の不足として記録します。
4. 原因を確認してから対処案を分けます。本番の制限変更や再公開、ロールバックを診断コードが自動実行することはありません。

局所検証はprototypeで `node --test tests/smoke-diagnostics.test.js`、模擬ブラウザ検証は `node tests/smoke-diagnostics.browser.mjs`。現在ゲームの検証は公開用ビルドと既存の `npm run test:release` 等を別に行います。復旧時はこの診断用helperと呼出差分だけを戻せますが、実際の本番ロールバックを今回実施したことにはしません。

## 残件

初回の公開後失敗の原因確定、別障害からの実復旧、実ロールバックは未確認です。今回の診断追加だけで#11全体を閉じません。
