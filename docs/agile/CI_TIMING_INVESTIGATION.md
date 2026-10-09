# CI時間調査（2026-10-09、実装前）

正本PBIは [#19](https://github.com/sintaro-katuta/silverball-chronicles/issues/19)。本章は実装前の調査記録。S4はその後ユーザー承認で開始済み。採用判断と効果確認に必要な範囲で実CIを測定する。

読み取り調査のみ。基準はrelease/0.1.0実マージ7ec4c6ad（受入S3 c814a575とtree f315e58d…同一）と実GitHub Linux CI。原dirty製品コードや設定の編集、新計測/テスト/Secrets/公開は行っていない。ユーザーの「10分くらい」は現状時間への質問で、時間目標ではない。原因を調査し、有効そうな改善があれば実施、妥当な改善がなければ現状維持とする。

## 実測

|工程|PR18最新 37863179904|S3最終 37754523491|
|---|---:|---:|
|verify job（待ち行列除く）|15分36秒|22分58秒|
|release:prepare step|14分43秒|22分03秒|
|461unit tests、fail/skip0（Node報告）|364.285秒|452.569秒|
|unit終了→release browser開始（build/preview含む）|11.726秒|14.239秒|
|release browser、390/1440連続|27.513秒|45.738秒|
|controls、390操作|13.670秒|21.897秒|
|feedback UI390（controls終端→pass近似）|58.206秒|97.955秒|
|feedback UI1440（前幅pass→pass近似）|157.654秒|274.715秒|
|battle体験（UI終端→pass、復帰含む近似）|179.203秒|306.891秒|
|bonus体験（前体験終端→pass近似）|49.423秒|80.968秒|
|rush体験（前体験終端→pass近似）|16.650秒|22.846秒|

PR18 job 00:09:18〜00:24:54 UTC、prepare00:10:06〜00:24:49。npm ci13秒、Chromium/deps23秒。unit終了00:16:11.543、release開始00:16:23.269、controls開始00:16:50.989、controls完了00:17:04.659、最終rush00:24:45.794。主なfeedback区間は約7分41秒（開始/closeの僅かな差を含む近似）。ログはstdout buffer/Node test結果の一括排出を含むため、テスト表示行からunitファイル開始時刻やCPU時間を推定しない。node summary durationをunit全wallの根拠とする。buildのvite coreは233msだが画像変換等を含む工程全体が233msという意味ではない。

原証拠：`prototype/reference-review/ci-timing-2026-10-09/pr18.log` と旧S3 `prototype/reference-review/s3-2026-10-08/linux-ci-37754523491/{complete.log,index.json,run.json}`（Git非同梱）。API取得: /private/tmp/ci18-jobs.json。前PR18 run37862599140はcancelledで成功時間の比較へ混ぜない。

## 支配要因と依存

- unit6〜7.5分とfeedback8〜13分が支配的。setup/npm cacheやbuildだけの改善は主要な待ち時間への効果が小さい。Node --testは既にファイル単位並列であり、安易な並列数増加が短縮するとは限らない。
- 遅いunit例: pass-gate.test.js の0.05秒右closed128.850秒/RUSH77.214秒、bonus-round-flow.test.jsの実入賞上限51.880秒。compact-board/rail排出など実球長時間回帰もある。これはテストケースwallで、総時間へ単純加算できない。球数/dt/観測時間/assert削減は対象外。
- build前提にunit成功の論理依存はなく、browserは完成buildが必須。現prepareはunit→build→release browser→controls→feedbackを逐次実行し、最後に入力と資産を再照合してcandidateコピー/atomic manifestを完成する。
- browserは別page/contextで状態を初期化するが、同runnerでunit/複数WebGLブラウザを同時実行するとCPU/SwiftShaderを取り合い、自然時計の進行が遅れて有限wait失敗を増やす恐れがある。既Linux2failの壁時計不足履歴を保持し、製品dt/時計・当落・物理を変更して短縮しない。
- release/controls/feedbackでload・pause等が一部重なるが、releaseは全25資産/HTTP/口幅/強度、controlsはfocus/keyboard/retirement、feedbackは全view/寸法/消化回数/体験復帰/専用入賞payoutと目的が異なる。重複を理由に検証削除しない。統合する場合も各AC/assert・error listener範囲・fresh sessionを保持する設計レビューが必要。

## 検証維持の改善候補（S4確認後）

1. 最優先はCI工程ごとの開始/終了/runner・renderer・phaseを構造化記録。現成功画像からGPU backendを認定しない。既10秒phase traceと有限300/60/90/150秒wait、失敗renderer/snapshot/元errorを維持する。timeout無限化/retry成功だけ残す方式は不可。
2. unitとbuild/browserを別jobへ分離し、CPU干渉を避けて全範囲を並行実行する。build資産を一度freezeしてbrowserへ同bytes配送、全jobの同commit/sourceSHA/asset全集合size/SHAを照合。全461と全browser成功後だけaggregate candidateをverified化する。新jobのcheckout merge-ref/tree対応と候補gitを実物から記録し、旧candidateを付替えない。
3. feedbackは390/1440 UIとDEMOを分離できる既UI_ONLY/DEMO_ONLY入口がある。ただしviewport選択は未実装。独立runnerならUI1440約2分38秒、DEMO約4分05秒の並行化余地がある。同runner同時browserは先行案としない。release/controlsも各assertを残し同固定buildで実施。
4. Node unit長時間物理ファイルのshardを独立runnerへ割り当て、同ファイル内のテストを重複/欠落せず全inventoryを集約する案。複数runner費用/起動/転送・runner CPU差は実CIで測る。現unit6分がcriticalなら、build/browserと別jobにするだけで待ち時間が短縮する可能性はあるが、新構成の実測前に効果を確定しない。
5. npm cacheは既setup-node npm有効。lock/OS/Playwright版に基づくbrowser cache改善は補助（現23秒）で、依存安全性と管理browser一致を保持。成功テスト結果のcacheを別sourceへ流用しない。

受入案：同sourceの全461test、全browser条件/意味assert、45資産の集合size/SHA、candidate失敗無効化/自己preview cleanup、各job欠落/失敗時verified禁止を保持。旧構成と新構成を判断に必要な範囲で実GitHubで測り、job/prepare相当critical path、個々phase、欠測/flake/runner条件を記録する。時間目標や固定計測回数を設けない。原因・改善採否の根拠・採用した場合の必要な効果確認が揃えば終了する。新renderer導入・製品描画最適化は別採用判断。

## CI30分と現release CD25分

PR18成功だけならCD25分の差は9分24秒（prepareだけ10分17秒）、旧S3成功だと2分02秒（prepareだけ2分57秒）。CDはprepare後に実deploy/freshVersion・traffic/API/全HTTP SHA、さらに同3browser公開smokeとnotes/Release/添付がある。PR18のbrowser合計約8分20秒をもう一度行う概算でも余白は小さく、旧S3では25分に収まらない。ネットワーク/公開側browserは未実測なので完全所要保証不可。

#11の時間予算と公開接続は現releaseのgateであり、S4へ繰延べて公開可とはしない。CI短縮の採用とは別にCDの有限予算/段階別上限・smoke・失敗再run/checkpointをレビューする。本調査でworkflow延長/公開設定/Secrets変更はしていない。

## 追加の原因根拠

board-runtimeのrAF経過dtはball-flow.stepへ渡る。physics/ball-flow.jsはMath.min(.05,dt)だけを蓄積するため、描画間隔が50msを超える環境では演出時計が壁時計より遅く進む。過去S3の演出49.45秒到達に壁時計228.3秒というtraceと整合する。成功runの実rAF/backendは未記録なのでGPUを断定しない。物理保護の上限は変更せず、今回の2系統化は独立検証の逐次待ちを減らす対象で、ブラウザ自体の遅さを解消したとは扱わない。
