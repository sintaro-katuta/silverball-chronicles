# S8：実250発実装版のCI独立監査

2026-10-16、[run38832600561](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/38832600561) attempt1のunit/browser/verify全3ジョブ・全step成功をAPIで確認しました。旧実250発実装版の結果で、開発中の風車位置比較版や目標60/750達成へ転用しません。

| 項目 | 実物の確認値 |
|---|---|
| head | `9c71af798bc739a966e850a2cf5e29058ca83c8d` |
| CI結合コミット | `9be66afba487bd93a50357fd6fc0172433dac519` / clean |
| 結合親 | 基点9317e613…と上記head |
| head/結合tree | `3727ebba3790206d63181772537ffdf15069fc89` / 一致 |
| verified候補 | `c469008d-bea8-4fc8-ba6a-789cdaf7c096` |
| source | `a6aea9c6018059afc450b67c33fb26381c6d35514d21615ae9a03c3be06b8247` / **583入力** |
| 単体 | 606/606成功、125 files、失敗/skip/cancel 0 |
| 資産 | 全45path / 14,928,294 bytes |

依頼時の576入力ではなく、実artifactは583入力でした。unit/candidateの全source一覧が一致し、現在の風車作業中bytesを使わず保存headのGit blobから全size/SHAを照合しました。資産全path集合/size/SHAも取得実体と差分0です。

ブラウザの一般全条件・旧配置ツール全比較・verify結合stepが成功しました。12比較はcomparable/fullWindow true・errors空・残球0・計数整合、有限持玉の会計も整合しています。UIは両幅errors空、ライブ各幅24events/errors空を確認しました。これは旧ツール回帰で、新風車4案の性能試射ではありません。実機・人の聴感・本番は対象外です。

## 証拠と境界

`prototype/reference-review/s8-20261016/ci-38832600561/`へrun/jobs/artifacts API、head/結合情報、unit/verified ZIPと展開全体、`independent-audit.json`を保存しました。privateローカル証拠でPR同梱リンクではありません。browser単独ZIPは未取得ですが、verified内のブラウザ成果/資産とAPIのbrowser upload成功を照合しています。

source/計画/製品/Git/試射/CI再実行は変更していません。風車専用コードの新source・fresh試射・新HEAD CIは別に検証します。
