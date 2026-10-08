# S3 #15/PR16検証引継ぎ

2026-10-08、head `3b502a08cc63fa9a14c481aee5cac82b0462c6d3`。PR16はDraft、初回run `37738355830`/job `113182992617` はfailure。修正helperはcommit `2a26e61507a2ee038d2353fc6495a2627b81728c` に保存済み・未push、新CIは未実行。これはローカル受入証拠とCI監視の途中記録で、全AC/候補完成/公開の判定ではない。

## ローカルの確認済み範囲

- pressure nonflash gather24〜33だけにsmooth envelopeのcamera x-2/y-1/scale+.06と背景alpha最大.22を追加。人物より下/背景より上、下端6logical pxのみ静的feather。caption fade、素材/高DPI、PUSH、当落時計、domain/物理/賞球は未改変。
- `node --test prototype/tests/presentation-clock.test.js prototype/tests/presentation-integration.test.js prototype/tests/reach-ending.test.js prototype/tests/presentation-quality.test.js prototype/tests/long-reach.test.js prototype/tests/decision-push.test.js`：28pass/0fail、10.15秒。私有log `/private/tmp/s3-related-3b502a08.log`、PRには同梱しない。
- 固定before timelineをoracleとして261時刻×144options=37,584比較成功。対象pressure nonflash24<t<33の1,376比較だけcameraを除外して全old field一致。他variant/flash/対象外は全old field完全一致、新captionBackdropAlpha0。beforetimelineSHA `6f448488a53b77434b3aecbefdbe6ef46b9695800d751617ad3cd6da40a7ab17`、after `7f5df3013a283dcb01b143d0a855c0daadbb40b6edbd8c3bee7a8656339c64dc`。私有 `prototype/reference-review/s3-2026-10-08/after-prototype-feather/pose-oracle.json` と実行scriptはPR非同梱。
- 代表両幅feather各50PNG/DOM等速録画、source/public301hash前後一致/errors0。視覚runtime SHA `c6a4c77990448c5d42ea2b1621f6de46ee69da5e599dc47f3e98329f2ad4c8a1`。実隣接frame gap最大.20833秒、targetlag最大390.05秒/1440.025秒。0.2秒のtarget列を正確なencoder cadenceとは呼ばない。PM/Designerは成熟frameと入り/保持/抜けの静止列で代表採用、全動画鑑賞は未実施。

## 初回CI時の入力と新候補（未完成）

同headの実Linux CIだけを判定対象とする。初回head3b502a08時の隔離sourceFingerprintは507入力、SHA `0e9aadbcd686a827070d660697678d430a989f91fa9fe7662b7af466796056c4`。これはtests/tools/workflows/pkg等を含み、視覚runtime SHAとは別定義。CI候補/mergeRef/clean/asset数・全SHA/manifest/Node/npm/browser/log/artifact/runの対応は終端artifactから照合予定。旧S2候補や458test成功を新head合格へ転記しない。

## 残ACと次担当

Designer：固定after snapshotによる通常pressure標準勝ち/外れ/復活・RUSH pressure標準勝ち/外れ/flash、両幅、他view/休止復帰/PUSH実操作の新証拠。Lead：新CI終端・候補集合/サイズ/SHA・source/mergeRef対応と失敗診断。PM：目的別Git操作、AC採否とS3集約/3Sprint残件判定。録画quiet中の重いローカルprepare/browserは重ねない。

#7人間聴感、#11実CD/Secrets/productionGate/公開を新CI成功で受入にしない。公開許可と有限CD予算は別確認。全影響経路と新CI候補完了まで#15の最終ACは未受入とする。


## 初回CI失敗（新head3b502a08、履歴保持）

run `37738355830` はfailure。job06:34:31〜06:56:11UTC（21分40秒）、prepare06:35:30〜06:56:07（20分37秒）。30分のjob timeoutではない。461unit全成功/0fail/456.509秒、release build、release両幅、controls、UI両幅、battle体験まで成功。その後 `feedback.browser.mjs:49` のbonus専用payout>0待機50秒でtimeout。主bundleは `game-m9GZ9GA3.js`。失敗を候補成功にしない。

artifact `11533721987` は2791bytes、zipSHA `aacb6283abfa6ac159a351eef5364415741fc7a93d80b592d44de61751ad2d50`。`failures/feedback/1791442564018.json` のみでverified manifest/候補はない。私有生log `/private/tmp/s3-ci-failed-37738355830.log`、artifact展開 `/private/tmp/s3-ci-failure-artifact` はPR非同梱。

失敗snapshotはSwiftShader、visibility visible、paused=false、gameTime11.95、告知後winTime5.1833、round.phase=celebration、mode=normal、bonus.open=false/count=0/payout=0、counts.bonus=0、一般賞球w.payout=5、収支reconciled=true。現bonus flowは通常告知5.8秒後にright-closed→guide1.2秒→扉開→実球入賞で払い出すため、終了時点ではまだ合法celebration。direct bonusは新gather改修対象外。これだけで製品の当り実払い出し不具合や新camera由来と断定しない。

battleのPUSHは実壁216.596秒でreach46.7417秒に到達し300秒枠内。失敗JSONのclockTraceはbattle分が残っており、bonusの50秒間を連続観測したtraceではない。bonusの最終snapshotは新観測、経過の欠測は推測で埋めない。

最小修正案はbonus待機の有限150秒とscenarioごとのtrace reset/bonus進行診断。既w.bonus.payout/countの強assert、元error、自然時計/実入賞を保持し、製品sourceは変更しない。本案はPM内部採用後にhelperだけ実装し、下の局所検証を完了した。30分枠は現failure21分40秒＋bonus上限追加100秒の同条件参考23分20秒と未到達rush等を分けて考え、これを最悪時間保証としない。本番CD25分はなお有効化前の予算課題。


## CI修正commit2a26e61と次実行への引継ぎ

変更は `prototype/tests/feedback.browser.mjs` 1ファイル。bonus専用払い出しの有限待機を50→150秒、scenario開始でtrace reset、bonus10秒進行観測を追加。battle/bonusのobserveは各開始時の配列を捕捉し、前scenarioの遅いevaluateが次traceへ混入しないようにした。finallyでtimerを停止し、元errorと既bonus専用payout/count・通常復帰assertは保持。battle待機50秒/PUSH300秒/PR workflow30分、製品sourceは未変更。

固定after devの局所managedChromium153/SwiftShader probeは自然14.378秒で実bonus入賞1・payout15・open=true・収支整合・例外0。50秒前に成功したため50秒時点は未取得。Linux50秒不足の再現/完全原因確定にはしない。初回非昇格起動はmacOS MachPort sandbox拒否で製品未開始、限定昇格の再起動から観測。probe起動Nodeは25.8.1、この起動補助をCI Node版の確認へ代用しない。

修正helperはNode24.21.0/managedChromium153、`DEMO_ONLY=1`でbattle/bonus/rush体験と通常復帰assertが全成功。新bonus trace3records/14.371秒、実入賞1/payout15、全recordにbonusAdmissionsがありbattle reach fieldはなし。battlePUSH49.406秒。Node24構文・diffcheck成功。UI全域/build/全unitは繰り返していない。私有証拠 `prototype/reference-review/s3-2026-10-08/ci-bonus-probe/` と `ci-helper-local/` はGit非同梱。ownedChrome/Viteは終了済み。

最新507入力のsourceFingerprint（commit2a26e61）は `678f899aaa7114af87e8a1cd1a70f8edb458578df8b52d38a788dfd8f0821b39`。視覚runtime/source+publicは `c6a4c77990448c5d42ea2b1621f6de46ee69da5e599dc47f3e98329f2ad4c8a1` のまま。旧失敗head3b502a08と新helper headを同tree/同候補にしない。後続文書commitはsourceInputsから除外されるが、CIの実head/mergeRefはその実値で記録する。

初回Linuxの段階所要は、unit456.509秒、release buildはbuild:release開始〜built出力まで約13.9秒（Vite本体314msだけと区別）、release browser両幅約44.2秒、controls初段約21.1秒。ログの成功マーカー間はUI390約92.2秒、UI1440約257.5秒、battle体験約290.5秒、bonus開始/準備を含む失敗まで約55.6秒。これら成功マーカー間にはページ遷移/撮影/終了等が含まれ、純GPU時間とは呼ばない。job21分40秒/prepare20分37秒、最終失敗は50秒のbonus待機で、未到達rushと候補生成は未確認。

CD25分との差は初回jobから3分20秒であり、同prepare後の実送信/freshVersion/公開SHA/再度の公開browser/Release添付は入っていない。失敗runの所要を本番成功の予算としない。新CI終端を取得後に段階所要を更新し、有効化前の有限予算をPMが別レビューする。

次Ready：Designerの#9直接shortcut確認・finaldocsをPMがまとめてpush→新CI一度。Leadは新head/mergeRef、461全unit/build/browserと新候補507入力SHA、全asset集合/size/hash、artifact/run/cleanを照合する。新CI/候補は未確認、旧成功部分や局所成功を新head全合格へ転記しない。
