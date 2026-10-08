# S2 PR #14：CIのPUSH待機失敗と限定修正

対象は承認済みS2のCI修正。隔離sprint/S02、開始head `2a3ddd3`。原workspaceのdirty source、製品／ゲーム／描画／時計／物理／抽選／賞球は変更しない。Git操作とPR更新はPM担当。

## 失敗の事実と原因の確度

[失敗run37600624726](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/37600624726) は2026-10-07 09:26:32〜09:45:39 UTC、job19分07秒。458テスト全部成功（442.7秒）、release build成功、390／1440のrelease画像読込／停止復帰、controlsとUI両幅が成功。その後feedback.browserのbattle体験で `.decision-push-button` の可視待ち180秒がtimeoutした。存在するボタンはhiddenとして198回観測され、exit1。20分job全体のtimeoutやゲーム当落assert失敗ではない。成功候補／artifactは発行されていない。

[前成功run37579596923](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/37579596923) ではUI1440完了→battle経路合格まで183.13秒、今回同区間の失敗は185.20秒。両runのbundleは `game-D3TKWLRC.js`。この比較は固定180秒待機の余裕が小さい根拠で、失敗時の実presentation.time／paused／backendは元CIで未保存のため、具体的な進行停止原因は未確定。

ローカルの同release／管理Chromium153.0.8010.12／390×844・既定DPR1のbattle単独観測は、SwiftShader・canvas396×436でPUSHまで52.12秒（reach47.08）で成功。元180秒以内、paused=false／playing／自然進行。**Linux失敗をローカル再現したとは報告しない**。S2 #6のDPR3／異なるcanvas条件とも混同しない。

## 修正範囲と有限予算

- feedback.browserのbattle可視待ちを180→300秒へ変更。PUSH実クリック、右打ち案内、bonus専用実払出、snapshot消化回数、停止／復帰／体験終了後reset、例外assertは全て維持。時計seek／freeze／期限無限化／失敗skip／自動retryは追加しない。
- 待機中の10秒間隔観測で実時間、gameTime、reach.time、paused／phase／可視状態／button.hiddenを記録。intervalはfinallyで終了。成功traceは既存feedback証拠内へ保存する。
- 失敗時は最終snapshot／backend／段階／clock traceを `prototype/.cache/release/failures/feedback/` とstdoutへ保存し、元errorを再throw。prepareが不完全candidateを削除しても残るようcandidate UUIDの外に置く。内部cacheはsource fingerprintと公開assetsの対象外。診断自体が失敗しても元失敗を成功に変換しない。
- PR workflowのjob予算20→30分。同一失敗job19分07秒＋PUSH最大追加2分＋未実行だった後続払出／bonus／rush／終了操作・artifactの余裕を設ける。個々の判定は有限期限を保持し、30分を性能合格基準と呼ばない。

本番CDは25分のまま、今回は有効化／権限／Secrets／公開変更なし。同じprepare後にdeploy／公開assets確認／全browser smokeを行うため、PR側30分予算が必要な場合CD25分へ収まる保証は未検証。#11の有効化前に実測と段階別予算を見直す残リスクとしてPMへ提出する。CD期限変更をCI修正へ無条件に混ぜない。

## 検証と証拠

2026-10-08ローカルで既存decision-push／release-cd／release-workflowの関連54件成功、構文検査と実workflow2本のactionlint成功、git diff --check成功。正のbrowser経路は既存DEMO_ONLYでbattle／bonus／rushを管理Chromium再実行し、3経路とも成功・exit0。PUSH実クリック→右打ち案内→bonus専用実賞球、snapshotと表示の消化回数、停止／再開、体験終了後のtotal／draws resetの既存assertを確認した。UI全経路と458全回帰は次の新SHAのLinux CIで検証し、前成功runを新修正の合格へ付け替えない。

負例はlocalhostのunsafe portを指定し、page.goto失敗→failure JSON／stdout diagnostic生成→元errorでexit1を確認。これはstartup失敗経路の保全確認で、PUSH300秒timeoutの再現とは呼ばない。release-workflowの既存失敗guard試験で候補無効化・deploy未呼出しは維持した。

ローカル証拠（PR非同梱）：`/private/tmp/silverball-s02-ci-failed.log`、`silverball-s02-ci-success-prior.log`、`silverball-s02-battle-clock.{log,json}`、`silverball-s02-ci-related-tests.log`、`silverball-s02-feedback-negative.log`。修正後browser証拠は原workspaceの `prototype/reference-review/s2-ci-2026-10-08/feedback/`。成功／失敗と各環境を分けて保存する。既存の不明reference-review素材を削除／一括stageしない。

commit境界：prototype/tests/feedback.browser.mjs、.github/workflows/pr-ci.yml、本書。新Linux CI成功とPM受入までは修正提出／再検証待ち。新GitHub送信／公開／S3未承認実装は本担当では行わない。
