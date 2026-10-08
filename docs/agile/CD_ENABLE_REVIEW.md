# #11 CD有効化の許可提示用チェックリスト

2026-10-08、既存workflow／helper／公開記録の読取りだけで作成。#11の接続準備資料で、S3 #8／#9開始や有効化を承認した記録ではない。設定／Secrets／コード変更、接続・新候補・テスト・公開・Git操作は行っていない。秘密値は読んでいない。

## 提示する具体的な対象

| 項目 | 既存実装の対象 |
| --- | --- |
| repository | `sintaro-katuta/silverball-chronicles` |
| workflow | `.github/workflows/release-cd.yml`、表示名 `Merged release production CD`、job `release`、environment `production` |
| Worker／config | `tsukikage-pachinko`、`prototype/wrangler.jsonc`。既存Workerを更新する。新Worker／domain購入の提案ではない |
| 正式URL／自動smoke | `https://silverball-chronicles.sintaro-katuta.com`。helperのproductionURL／公開assets SHA／全browser smokeの対象 |
| 同Workerの別名 | `https://tsukikage.sintaro-katuta.com`（custom_domain）、`https://tsukikage-pachinko.sintaro-katuta.workers.dev`（workers_dev=true）。同Worker更新の影響先として提示。別名への個別自動smokeは現helperにない |
| 更新するbytes | mainへのイベントmerge SHAをcheckout→prepare。公開は `.cache/release/candidates/<UUID>/assets` の検証済み固定bytesをWrangler `--assets` で指定し、送信時に再buildしない |

URL／旧Versionは [公開記録](../prototype/CLOUDFLARE_DEPLOYMENT.md)、運用は [RELEASE_CD](RELEASE_CD.md)／[RELEASE_MECHANISM](RELEASE_MECHANISM.md)。公開記録のVersion `5e39c37c-135e-4b4b-b1e1-9ff0fefd339c` は履歴で、今回fresh照合した現在値／rollback先とは呼ばない。上表はsourceと記録の対応で、現Cloudflare資源／domain／accountの実接続照合は未実施。

## 必要なキー名と場所（値は提示・読み出ししない）

| キー | 場所／役割 |
| --- | --- |
| `ENABLE_PRODUCTION_CD` | **Repository Actions variable**。job-level ifとhelperで文字列`true`を要求。未設定／他値ならCDは送信前にskip／拒否。environment variableだけで代用しない |
| `CLOUDFLARE_API_TOKEN` | GitHub **production environment Secret**。既存Workerへの送信とdeployment照合に使う。対象account／必要zoneへの最小権限を管理者が確認 |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub **production environment Secret**。対象Workerのaccountと一致するものを管理者が安全な設定UIへ直接登録 |
| `GH_TOKEN` | workflowが`${{ github.token }}`を渡す。独自PATを新しく登録する設計ではない。jobは`contents:write`／`actions:read`、PR CIへproduction Secretsは渡さない |

production環境の実存在、Secretキー登録、repository var／保護ルール／token権限の現在状態は今回確認していない。過去文書の未登録／defaultoff記録を今日のlive settings確認へ代用しない。値をチャット・文書・コマンド引数へ貼る依頼はしない。

## 有効化前に完了させる確認

- [ ] ユーザーへ上記repository／workflow／Worker／影響URL／キーの設定場所を提示し、**設定・有効化と、その後のrelease→main mergeを公開開始合図にする範囲**の明示許可を確認。S2集約PRの送信／merge許可を本番有効化へ流用しない。
- [ ] 管理者が対象accountと既存Worker／routes／domain所有・token必要権限を照合し、production環境Secret／保護ルールを確認。登録と`ENABLE_PRODUCTION_CD=true`への変更は許可後の操作。具体的な実接続担当／失敗時担当を決める。
- [ ] 同repoの`release/<version>`→`main` PRがmerged closedであること。Sprint→release merge、未merge close、fork、main直接pushは起点外。`release-cd.js execute`を手動で本番credential付き実行して代用しない。
- [ ] branch suffix／`prototype/package.json`／tag／Release名が同じvなし安定SemVer。現在packageは`0.1.0`だが初回公開版の採用はPMレビュー。既存tag／Release／latest版との衝突はfresh確認する。
- [ ] 3つの異なるSprintと受入Issue、改善／修正／既知制限をPR本文の`silverballReleaseSummary`へ確定。自動生成notesだけで3Sprintの中身を表せると保証しない。
- [ ] 実checkout SHA＝PR merge_commit_sha、未完了の公開ではcurrent mainも一致。前版CD成功／復旧完了前に次release PRをmainへmergeしない。concurrencyは`production-cloudflare`／cancel=falseで、main mergeの順次運用も必要。
- [ ] **下記25分予算の不足リスクを解決し、変更が必要なら承認範囲と根拠を先にレビュー。** PR CIの成功を実CDの成功へ読み替えない。
- [ ] 公開前fresh deployment／Version／trafficを保存する担当・記録先を確認。失敗はcheckpointと公開状態を照合し、具体的な復旧／rollback先を確認した新指示に従う。古いVersionを固定の戻し先にしない。

有効化後はユーザーのrelease→main mergeが公開開始合図。送信→fresh現Version／公開SHA→全smokeが成功してからtag／GitHub Release／notesを公開する。deploy後のsmoke／添付失敗は公開済み障害／未完成Releaseとして扱い、成功として隠さない。checkpoint再開も現Versionとbytesを読み直す。同版同SHA成功はno-op、異SHA版は拒否する。

## 25分予算と実CIの差

現CD jobは**25分**、PR CIは**30分**。新Linux PR CI run `37692427739` は15分34秒、458test／build／全browser成功。CD25分との差は**9分26秒**だが、CDは同prepareに加えてWrangler送信、fresh deployment／公開資産照合、release／controls／feedbackの**公開browser smokeをもう一度**、notes／Release／添付／artifact処理を行う。

同runのbrowser区間は約6分。これを参考にすると余白は約3分半となるが、本番の送信／ネットワーク／API／公開smokeは未実測。旧失敗runのjob19分07秒なら25分との差は5分53秒で、同じ公開smokeの参考時間さえ余裕に収まるとは言えない。PUSH待機は最大300秒の有限枠を持つ。単一の成功CIからCD25分で十分と認定しない。

有効化前の次Readyは、S3対象／接続操作の承認後に段階別予算と有限上限を確定し、必要workflow差分をreviewすること。今回は時間予算変更／CD実行をしていない。実公開後に25分で切れた場合は、checkpointのdeployed状態をfresh確認し、同版の復旧を完了するまで次版をmergeしない。

## 現在地と不足

S1／S2の実PR CIと固定candidateは検証済み、PR14はmerge `c989ee8`として受入済み。旧RELEASE_CD文書の「未送信／Linux未実施／統合中」は当時の履歴で、今のCI現在地とは分ける。公開を伴うCD／GitHub Release API／production設定はこのスレッドで実施していない。外部での現在設定・実接続状態は今回未確認として残る。

具体的不足は、設定のlive状態／対象accountと権限／有効化の明示許可／3Sprintとrelease版の最終要約／CD時間予算／fresh復旧情報。次ReadyはPMの許可提示と環境照合準備であり、S3 #8／#9の実装開始、新Issue採用、新候補生成、Secrets登録、公開を自動開始しない。
