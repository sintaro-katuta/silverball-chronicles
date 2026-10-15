# CD途中再開：PR版とマージ版の照合補修

2026-10-15、0.2.0公開前に必要な#11の残件へ対応しました。ユーザーのリリース実施指示に含まれる公開準備として最小補修を行い、PMが差分・関連100テスト・独立レビューを受け入れました。実運用の障害復旧・ロールバックは未実施です。

## 原因と変更

過去の実行37914705868では、Actionsの実行情報とartifactのheadはPR版`88d5910`、保存本文と実checkoutはmainのマージ版`f21bd08`でした。旧処理はartifactのheadをマージ版と同一視し、同じ実行で作られた正しい記録を拒否しました。

- 実行ID・リポジトリとID・pull_requestイベント・CD workflow・ブランチ・PRのheadを、現在のマージ済みPRイベントと照合します。
- artifactは同じ実行・リポジトリ・PR版であることを照合します。過去実行と同様、runのPR一覧が空でも他の照合を通れば受理し、非空なら対象PR番号とheadを確認します。
- 保存本文の版・リポジトリ・Worker・マージSHAは別に照合します。候補のclean状態・source・全資産・summaryと、現在の公開内容の再照合は既存処理で維持します。
- 復元成功だけを公開成功にせず、公開内容の再検査・smoke成功後だけReleaseへ進みます。ダウンロード失敗・不正JSON・重複artifact・混在記録は停止します。

## ローカル検証

対象は`prototype/tools/release-cd.js`と`prototype/tests/release-cd.test.js`の2ファイルです。関連4suite（release-cd/release-workflow/ci-release/release-assets）の100テストが全成功し、構文と差分検査も成功しました。

```sh
node --test prototype/tests/release-cd.test.js prototype/tests/release-workflow.test.js prototype/tests/ci-release.test.js prototype/tests/release-assets.test.js
```

新しい模擬経路は、PR版とマージ版が異なる状態でsmokeを失敗させ、保存記録を復元し、再deployせず公開再照合・smoke・Release作成へ進むことを確認します。別run/repo/ID/event/workflow/head/branch/PR、保存本文のmerge/version/Worker、source/assetsの混在拒否も確認しました。実GitHub run/artifactの形状は読み取りで独立照合しています。

検証したhelper SHAは`fb38fac671b53a08215d8c67e2750445008960b764c5bab58edcd1dc29a9cdd3`、test SHAは`1869f3721b481c86cd16b4e0792c550a0db52aad1876ceff3d13456857494b7c`。ローカル証拠は`prototype/reference-review/cd-checkpoint-20261015/`のhandoff・ログ・実行版コピーに保全しています。

## 残る確認

新しいリリースPRの全CIと、mainのマージ版からの実CD・公開後確認は別に判定します。本番へ故意の障害を作っておらず、実際の障害後再開・以前の版へ戻す操作の成功とは扱いません。#11はこの残件を分けて管理します。新しいSecretの読取・登録、認証範囲の変更は行っていません。
