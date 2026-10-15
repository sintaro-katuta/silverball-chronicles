# #19 CI最小改善設計（レビュー用）

実測でunit6〜7.5分、build＋全browser8〜14分が支配。キャッシュのみでは主因を解消しない。数値目標・固定反復数は置かない。

## 採用候補

PR CIだけをunitとbuild/browserの2系統にする。別runnerのCPUで同時実行し、単一runnerでunitとSwiftShaderを競合させない。現CD/local release:prepareは全検証逐次を維持。viewport/scenario別多jobshardは複雑さと課金を増すため今回行わない。

unit job: 同PR merge SHAをcheckout、sourceFingerprintを前後照合→既npm test全件→成功unit証拠（SHA/source全entry/checks/time）を保存。失敗証拠は残し合格証拠を出さない。
build/browser job: 同merge SHA、build一度→全25資産release/controls/feedbackの同条件全assert→source/全assetsを再照合→固定bytesとbrowser成功証拠を保存。unit未合流段階ではstatus browser-verifiedのみ、公開/通常verify対象ではない。
aggregate verify job: 2jobのsuccess必須。checkout同mergeSHA、両証拠のschema/status/commit/source全集合を一致検査、全browserchecksとunitcheckが存在し、fixed assetsの全path/size/hashが同一と確認して初めてstatus verifiedのcandidateをatomic保存。候補gitは実checkout/ref、oldcandidate書換/再build無し。unit失敗/欠落/asset改変/異SHAはverifiedを出さず停止。並列API送信なし。

## 変更境界と費用

新private CI helper（unit/browser/aggregate）と直接guard tests、release-workflowの共通内部モード、PR YAML。通常prepare/publish/CDの全assertガードは保持。工程timerは既実装2files。

現1jobのrunner時間総量に対し2jobの重複checkout/installと小aggregatejob、artifact転送分が増える。critical pathをunit＋browserの和から長い方へ変える効果が見込めるが、runner差/キュー/転送があり保証しない。必要な実CIを見て、短縮が乏しい/運用が過大ならtimerのみ残す判断も可能。

受入: 全test/全browser範囲不変・同SHA/source/assets・失敗join停止・private診断/自己cleanup・必要測定で効果と費用を比較する。branch protectionのrequired check名はverifyを保持し、常時成功skipへ変えない。
