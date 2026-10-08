# S3 #15/PR16検証引継ぎ

2026-10-08。PR16はDraft。実Linuxの初回head3b502a08/run37738355830と2回目head832ab1e2/run37745135499はfailureで、verified候補はない。最新段階helperはcommit `b3845663165a7321a4a9edf6ffeb84942c26d700` に保存済み、新Linux CIは未実行。本書はローカル証拠と実CI失敗履歴の引継ぎで、全AC/候補完成/公開の判定ではない。

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


## 実Linux2回目：head832ab1e2/run37745135499の失敗

実head `832ab1e227a6e87a37c115feb15f9d6a1ad16d43`、source507入力/SHA `678f899aaa7114af87e8a1cd1a70f8edb458578df8b52d38a788dfd8f0821b39`。job `113204710490` は07:42:51〜08:03:03UTC（20分12秒）、prepare07:43:46〜08:03:01（19分15秒）。30分job timeoutではない。461unit全成功/0fail/442.826秒、build/release両幅/controls/UI両幅成功後、PUSHを押した後の `session.jackpots>0` 15秒待機でtimeout（feedback:43）。前回修正のdirectbonus150秒段階へはまだ進んでいない。

段階所要はbuild:release開始〜built出力約13.8秒（Vite本体304msと区別）、release browser両幅約47.9秒、controls初段約22.1秒。成功マーカー間はUI390約97.5秒、UI1440約273.8秒、UI1440成功からbattle失敗診断まで約251.9秒。後者にgoto/撮影/操作等を含む。PUSH可視は実壁226.762秒/reach46.6917秒で300秒枠内。純GPU時間や完全所要上限に読み替えない。

失敗後の診断snapshotはjackpots=1/bonus生成済、告知後winTime .06667秒、roundcelebration/openfalse/count0/payout0、stock400/feedingfalse/pausedfalse/収支整合。15秒deadline直後の診断に合法当りが成立していることは、境界付近の待機不足/race案の根拠となるが、deadline時点の正確なstateや根本原因の確定を意味しない。製品当落・時計・物理を変更しない。

artifact `11536585805` は2685bytes、zipSHA `a4a7f86448a883ade7482d098ef53147284aa54ca02505cb000f3b9d379665ac`。failureJSONのみ、manifestはない。原workspace私有 `prototype/reference-review/s3-2026-10-08/linux-ci-37745135499/` にrun/head/artifact/index、生log、zip、診断を保全（Git非同梱）。初回失敗と別directory、どちらも成功候補へ置き換えない。

## 最新段階helper b384566：局所成功、Linux未成功

変更はfeedback.browser.mjs 1ファイル。PM内部採用の有限枠：postPUSH当り60秒、右打ちguidance（既文字列includes）とpower-caption（既文字列完全一致）のANDを同一90秒段階、battle実bonus専用payout150秒。directbonus150秒/PUSH300秒/PRjob30分を維持。各段階trace reset・配列捕捉・10秒currentPhase/round/win/mode/bonusAdmissions/payout/feeding/paused観測・finallyclearを共通helperにまとめ、元predicate/専用countとpayout/通常復帰assertを保持。製品runtime/抽選/FIFO/機構/物理/賞球は変更していない。

Node24.21.0/managedChromium153の局所DEMO_ONLY battle/bonus/rush・通常復帰assert全成功、構文/diffcheck成功。実段階trace：award3.220秒→celebration、guidanceAND7.043秒→opening、battle実入賞1/payout15まで1.798秒→open、directbonus14.298秒/実入賞1/payout15→open。各traceのwaitStageは単一、先頭elapsed32〜33msで他段階の履歴混入なし。既存固定after初期inventoryに対する301hash終端一致（局所実行開始時の専用guardは別記録なし）。ownedChrome/Vite終了済み。私有 `prototype/reference-review/s3-2026-10-08/ci-helper-phases/` にindex/log/phase-clock/経験結果を保全、Git非同梱。ローカル成功をLinuxの失敗再現や新CI成功にしない。

最新507入力source SHAは `3bc394860db78c354fe55f98d40454842a7b6b830666d83af077896e3b9c6ea5`、視覚runtime c6a4c779…c8a1は不変。helper SHA `d070cf530d3c5ce4e0ee63fe7b3021bd2d055b99342e8495109ff995eb47f030`。旧head832/source678と最新helper入力を同candidateにしない。後続文書commitを同treeと誤認せず、CI実head/mergeRefとsource入力一致の範囲を分ける。

最大postPUSHは60+90+150=300秒、PUSH可視300秒と合わせた段階wait参考は600秒。初期ロード/撮影/入力/他ケース/unit等は別で、これをjob全体や本番CDの完全所要保証にはしない。実CI2のjob20分12秒からCD25分余白は4分48秒、しかもbonus/rush/候補完成未到達。prepare後に公開browser等をもう一度走らせるCD25分の問題は有効化前レビューに残す。今回はPR30分/CD25分の設定を変更していない。

次Ready：PMがfinaldocsをまとめてcommit/push→CI3一度。Leadは新Linux終端・candidate・507sourceSHA3bc394…・全asset集合/size/hash・実mergeRef/tree・Node/browser/artifactを照合する。追加local全testは不要、新Linux成功/verified候補はまだ未確認。
