# S3リリース候補引継ぎ（#8）

2026-10-08。S3 #8/#9/#15は開始承認済み、隔離branch `sprint/S03`、基点 `c989ee8`。本書は候補作成前の手順整理。作成時の設計待ちは履歴。現在はDraft PR #16作成・添付済み、head `3b502a08cc63fa9a14c481aee5cac82b0462c6d3`、CI37738355830進行中。代表pressure feather改修はcommit済み、代表2幅はPM/Designer合格。#9全尺網羅・#15全経路/操作・新CI/候補の受入は未完了。main PR/本番未実施。 本書は公開手順であり、実公開の記録ではない。

## 候補を作る条件と証拠

1. Designerの#9調査、Leadの#15代表pressure改修、両幅静止/等速連続・関連機能検証をPMがACから判定。保存当落/図柄、54/58/12秒、PUSH受付/告知、抽選/FIFO/物理/賞球を保持し、未取得経路を残す。
2. PMが目的別commitと対象pathを管理。原dirtysourceとprivate画像/動画/logを保護し、runtime/public/tests/tools/設定/依存の必要閉包をレビュー。候補を作るsourceへの編集と重い測定/録音を止める。
3. Node24.21.0とPlaywright管理Chromiumを明示した環境で `PLAYWRIGHT_BROWSER=chromium npm run release:prepare -- --issues 8,9,15`、続いて `npm run release:verify`。前SprintのIssueは3Sprint受入表/構造化要約から参照し、今回の試験Issueと混同しない。全unit→release build→自前preview→release/controls/feedback browserを既存入口で検証する。
4. prepareは開始時に旧候補を無効化し、検証中source/出力の不変を照合して、`prototype/.cache/release/candidates/<UUID>/assets`へ成功bytesをコピー・全inventory再照合後にmanifestを完成する。内部manifest/logは公開assetsへ置かない。送信時に再buildしない。
5. 新candidateのID、実commit/dirty、sourceSHA/入力集合、全資産path/size/SHA/総数、Node/npm/browser/backend、checks/log、390/1440画像/連続範囲を実結果から記録。前候補の45資産/数値を新結果へ転記しない。tests/toolsを含むsource変更後は旧候補を履歴扱いとし、verify成功を付け替えない。
6. S3 PR→`release/0.1.0`の実CIでhead・検証mergeRef・新source/assets・artifact/runを対応付ける。3Sprintの受入残件と利用者向けsummaryをPMが確定後、release→main PRへ進める。未実CIをローカル成功で認定しない。

## 公開時の確認・担当（接続/有効化は未許可）

Workerは `tsukikage-pachinko`。主確認URLは `https://silverball-chronicles.sintaro-katuta.com`、同Worker別名は `https://tsukikage.sintaro-katuta.com` とworkers.dev。設定・許可境界は [CD_ENABLE_REVIEW](CD_ENABLE_REVIEW.md)、実装手順は [RELEASE_CD](RELEASE_CD.md)／[RELEASE_MECHANISM](RELEASE_MECHANISM.md)。

PMは対象版/3Sprint受入/許可/merge順序/障害判断を所有。接続管理者はaccount・Worker/routes・production environmentと `CLOUDFLARE_API_TOKEN`／`CLOUDFLARE_ACCOUNT_ID`、repository var `ENABLE_PRODUCTION_CD`を許可後に安全なUIで確認。具体的接続管理者はPMが確定する。値を文書へ保存しない。Leadはcandidate・公開SHA・browser診断、Designerは同条件の公開画面、SMはAC/欠測/履歴対応を照合する。

有効化後の同repo release→main mergeだけがCD起点。fresh公開前deployment/Version/trafficを復旧根拠に保存し、固定候補の送信→fresh現Version/traffic→実配信資産SHA→公開browser smoke成功後にtag/GitHub Release/notesを完成する。Cloudflare非配信設定ファイルをHTTP公開資産と同じ扱いにしない。別名個別smokeは現自動helper対象外として残る。

deploy後失敗は未公開失敗と区別し、Leadがcheckpoint・fresh配信状態を診断してPMへ報告。記録だけで成功/再送可としない。同版再runは現在Version/bytesを再照合し、具体Versionへのrollbackは影響と新指示を確認して接続管理者が実施、公開hash/操作を再検証する。前版成功/復旧完了前に次releaseをmainへmergeしない。

## 残件と有限予算

#7は録音準備と人間聴感の受入を分ける。人間聴取未受入を新候補/Releaseで完了扱いせず、PMが既知制限または受入残件として明示する。#11はPR CI/ローカルガードと本番接続を分け、Secrets登録・productionGate変更・実deploy/GitHub Releaseは今回行わない。外部settingsの現在値も本書では未確認。

PR CI枠30分、本番CD枠25分。S2最新CI15分34秒からの余白9分26秒に、送信/fresh API/公開SHA/再度の公開browser（参考約6分）/Release添付が追加される。実公開の所要は未測定、25分で足りると認定しない。有効化前に段階予算/有限上限と必要workflow修正をPMレビューする。新S3 CI実績を得た時に見直し、PUSH最大300秒の有限待機・失敗diagnostic/元errorを維持する。

次Ready：代表改修commit済みの新CI結果と候補を照合し、Designer全経路/操作/連続レビューとPM受入へ進む。#8は残件/検証/公開条件を整理し、新CI成功だけで#9/#15全受入としない。Git/送信はPM、原文書の持込みもPM担当。
