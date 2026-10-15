# S7 最新CIの独立確認

2026-10-16時点、HEAD296d813の全CI成功と候補結合を独立照合した記録です。最終結果の正本は[PR33のchecks](https://github.com/sintaro-katuta/silverball-chronicles/pull/33/checks)と[run38761334212](https://github.com/sintaro-katuta/silverball-chronicles/actions/runs/38761334212)です。PRはOpen/Draft、集約先はrelease/0.3.0です。

## 版と確認結果

| 項目 | 今回の実値・状態 |
|---|---|
| PR HEAD | `296d81377b08c6ba5babe85f6e821b7dddbd0962` |
| CI checkout | `8e84f2dc8edad9409d5010d626f8fda75de2fcdd`。PRの仮マージ参照で、PR HEADとは別 |
| 仮マージの親 | base `2ef267a4…`と上記HEAD。GitHub commit APIで対応確認 |
| checkout tree | `8a28756cf92057355b94b10d952ae188a30d1eec` |
| unit | SUCCESS。590成功/失敗0/中止0/skip0、123 test files |
| 入力 | 565件、SHA `11e057f99324032ff7f0686be28b0341a8bfe206085eb43cdccc61cdf47226b0` |
| browser | SUCCESS。通常の全browser条件・釘ツール全比較・artifact保存を完了 |
| verify / run全体 | 全3jobとrun全体SUCCESS。候補status verified |

## 独立照合した証拠

ローカル保存は`/private/tmp/s7-ci-current/unit/ci-unit.json`と`timings/unit.json`です。unit-verified記録、集計590/590、全565入力および123試験ファイルのsize/SHAを共有cloneの現在bytesへ照合し、差異はありませんでした。原作業場所の別のdirtyソースを比較入力にしていません。

タイミング記録はrun38761334212/attempt1、Node24.21.0、単体実行419,772msで成功。unit receipt全体の壁時計は420,149msです。これは単体のみの所要で、browserやCI全体の所要へ置き換えません。独立監査でテストを追加実行していません。

## 残る確認

同じrun/HEADの全artifactとverify結合結果を照合済みです。今回HEADのCI受入を、動画受入、集約マージ、公開や将来HEADのCI成功へ拡張しません。

本記録は旧d61の成功CIと別の証拠です。今後の媒体・文書commitでHEADが変わった場合は最新PR checksを再確認し、現在のunit成功を新HEADへ付け替えません。この記録時点では台本承認・最終説明動画等が未完了でした。最新の承認・制作状態は末尾へ記載します。

## 同じ管理Chromiumの局所確認

共有cloneの`prototype/reference-review/s7-20261015/chromium153-local-probe/verification.json`を確認しました。現在のHEAD296d813、試験sourceと45配信資産のsize/SHAは始終不変で、現bytesとも一致します。macOS上の管理Chromium153で既存release試験を一度実行し、390/1440の両幅が10.668秒・exit0で成功しました。新しいビルド/試射/物理変更を伴いません。

この一度の局所結果からLinuxのstep7が13分59秒を要した原因は確定できません。step7には複数のbrowser条件を含み、局所releaseの10.668秒と同じ範囲の比較でもありません。当時未完了だった全job・artifact・verifyは、その後次節のとおり独立照合を完了しました。

## 完了候補と結合の独立照合

保存先は`/private/tmp/s7-ci-current/{unit,browser,verified}/`。run-final.jsonの全体SUCCESSと、unit/browser/verifyの成功に対応する成果物を確認しました。

- 候補`83648aa0-2653-48cb-b20b-07767589ba51`、verified、CI仮マージref8e84、dirty=false。実manifestのIssue番号配列は空のまま保持し、#31/#11への対応はこの台帳で管理します。
- unitの元receiptとverified側receiptは完全一致し、結合unitEvidenceも590件成功/123試験ファイルと一致。browserとverifiedの候補ID・565入力の全entry・資産一覧は一致しました。
- 全565入力の現在clone bytesをsize/SHA照合しました。45資産・14,928,294Bは保存候補の全path集合/size/SHAが一致し、現在ローカルdist-releaseの全同名bytesとも一致します。元local QAと同じsourceで、試射の179入力と製品CIの565入力は別の範囲です。
- checks.logのrelease390/1440・controls・UI両幅・battle/bonus/rushの成功終端を確認しました。公開・実機・聴感の検証ではありません。

prepare.jsonの各phaseは成功、build14.00秒・release51.15秒・controls24.33秒・feedback744.14秒です。長い区間がfeedbackであることは分かりましたが、環境差等の根本原因は未確定で、同じ原因が全所要を説明すると断定しません。

HEAD296d813のCI受入は完了です。媒体などの追加commit後はPR checksと新しいrun/HEADを再照合し、この候補や成功記録を付け替えません。台本7段落はユーザー/公式CLI承認済み、7WAV生成済み・7場面preview PM合格です。その後、最終MP4の全decode・PM実場面確認・ローカル自然終端は合格し、PR冒頭へ掲載済みです。PRplayerも92.053秒の自然終端・等速・音声有効・error無しを確認済み。最終媒体/文書commit後のHEAD CIをPR checksで再確認します。PR33はDraft、集約前です。
