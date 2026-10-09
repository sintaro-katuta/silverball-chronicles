# S1 PR #12：実Linux CIの証拠と受入

PMがlocal `release/0.1.0` をnon-force fetchで実マージd99へfast-forward同期し、作業ファイル不変を確認した。実マージ `d99fc23b627276f4ebd499473ab49c1c4a6cdfb2` とCI対象head `b649b70e2c7acf34088a84f7d1c9632a183a27c2` のtreeはともに `4289b4ed4ab56cca0605855d7072acd7606bb0cc` で完全一致。source差分がないため追加テストは不要とPMが判定した。これは既存CI証拠とのtree一致確認であり、d99の新規CI実行を意味しない。

最新：[PR #12](https://github.com/sintaro-katuta/silverball-chronicles/pull/12) は2026-10-07T03:33:17Zに `release/0.1.0` へマージ済み、実commit `d99fc23b627276f4ebd499473ab49c1c4a6cdfb2`。本書のCI検証ref `576bfda0084593e6f998e98913cbad80029c6302` と区別し、過去証拠は差し替えない。本番未公開・S2未承認・本番CD未検証。

[PR #12](https://github.com/sintaro-katuta/silverball-chronicles/pull/12) は `sprint/S01` → `release/0.1.0`。以下の証拠はマージ前CIの受入記録。PMは以下の実CI証拠を照合し、**#11のPR CI部分を合格、本番CD部分は未検証のReview**と判定した。S2は未承認。mainマージ・Secrets/CD有効化・Cloudflare公開・GitHub Releaseは実施していない。

## 実行と候補の対応

| 項目 | 今回の証拠 |
|---|---|
| CI | verify [run 37559217841](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/37559217841)、SUCCESS |
| PR head | `b649b70e2c7acf34088a84f7d1c9632a183a27c2` |
| 検証したmerge-ref | `576bfda0084593e6f998e98913cbad80029c6302`。PR headや将来のmain merge commitとは区別 |
| base開始点 | `38b06d24d71e5113db16f51929cfac04fc1d4681` |
| artifact | `pr-local-release-37559217841` / ID11457140270。[artifact情報](https://api.github.com/repos/sintaro-katuta/silverball-chronicles/actions/artifacts/11457140270) |
| candidate | `b3fa3a09-89e1-4863-aefb-59922fab6959`、verified、Linux上のgit clean |
| source SHA | `bfd6f66d49638a7682af964f1c898ef6b7c7cc654f9abc09f98a4906dfc827cf`。PMのlocal fingerprint502inputsと一致 |
| 配布資産 | 45件/14,901,612 bytes。Leadが全SHA/集合を検証 |
| 環境 | Linux、Node24.21.0/npm11.19.0/managed Chromium153.0.8010.12、Vite8.3.0/Wrangler4.147.0/Playwright1.63.0 |
| 終端 | 452成功/失敗0、release build、release/controls/feedback全ブラウザ経路が成功 |

SMもartifact metadataとcandidateを直接読み、実run/head/candidateの対応とclean/版/source/資産数を確認した。CIのcandidate `issueNumbers=[]` はPR jobのprepareにIssue引数がないためで、関連Issue #2/#3/#4/#10/#11はPR本文・変更manifestと本記録で対応付ける。

永続ローカル保存先は `prototype/reference-review/pr12-linux-ci-37559217841/`。全artifactと `github-run.log` をbyteコピーで保存したローカル証拠で、PRへ新規同梱しない。feedbackは `candidates/b3fa3a09-89e1-4863-aefb-59922fab6959/feedback/`。このLinux merge-ref候補を、元checkout・旧macOS候補・本番公開の成功へ流用しない。

## AC照合

| 対象 | 今回の判定と範囲 |
|---|---|
| #2/#3/#4 回帰/UI | 全452成功。Designerが実CIの新6パネル＋2結果を目視合格。消化回数の意味、390結果折返し、3表示/操作の非重なり、PC音checkbox保持を確認 |
| #10 固定候補/一致 | source502inputsと固定45資産の対応をPM/Leadが照合。内部manifest/log/画像は配布assetsと分離 |
| #11 PR CI | SecretsなしのPR検証が実Linux runnerでtest→build→browser→artifactまで成功。PRのmerge-refを実証拠として保持 |
| #11 CD/Release | 未検証。Sprint→release PRでCDを公開済みとしない。production設定・mainリリースPR・実deploy/smoke/Releaseの確認は別途 |

画像のmacOSとの差は動的な球/図柄/玉数とOS文字描画で、読み取り/操作配置の退行なしとDesignerが判定。pixel完全一致の認定ではない。音の聴感、実機/Capacitor、長時間/全台品質は未検証のまま。

## 初回失敗の解消と運用記録

初回 [run 37558233041](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/37558233041) は451/452で失敗、build/browser未到達、artifactなし。末尾100件の診断履歴を全期間受理数として読んだfixtureが原因で、製品sourceを変えずテストのみb649b70で修正した。

今回Linux再実行のログも `retainedRush=98`、`actualRushEntries=102`、`accepted=100`、`consumed=100`、`bonus=60` / 900賞球を示す。診断履歴の制限が残る条件でも成功し、偶然98が100へ変わったことで通した修正ではない。旧ba386候補はtests変更前の履歴として区別する。

verify所要18分37秒/timeout20分は運用記録として残す。今回timeout変更・再テストは行わない。PRの集約マージ判断はPM、S2開始はユーザー確認後、本番CD有効化も別確認。実CI成功だけで全PBI/3Sprint/本番公開完了としない。
