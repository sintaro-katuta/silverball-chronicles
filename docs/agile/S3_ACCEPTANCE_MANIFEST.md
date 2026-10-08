# S3受入manifest台帳

## 最新CI2失敗：AC4 pending継続

SM独立API/原linux-ci-37745135499のlog/artifactを照合。run37745135499/head832ab1eはFAILURE、job20分12秒/prepare19分15秒、30分超ではない。461unit成功/失敗0（442.826秒）、build/release/controls/UI2幅成功後、battlePUSHはwall226.762秒/reach46.6917秒で300秒内到達。直後jackpots>0待機15秒がfeedback.browser:43でtimeout/exit1となり、directbonus150秒経路は未到達。

最終診断はjackpots1、winTime0.06667秒、celebration/open=false/count0/payout0、会計reconciled=true、playing/notpaused/visible。診断採取時には当たり成立していても、待機期限内にassertが成功したとは読替えない。clockTraceはPUSH待機の記録。artifact11536585805にfailureJSONを保全、candidate.json無し。前失敗と別run/headとして保持する。

次の有限補修案award60秒/guide+captionAND90秒/battlebonus150秒、PUSH300/directbonus150/job30維持は局所検証と新CI待ち。実装範囲外のclock/抽選/賞球変更を行わず、補修案を成功へ換算しない。#15AC4/#8candidateCI受入はpending、#9観察scope等の既存判定は分けて維持する。

## 最新PM AC判定：#9合格/集約待ち、#15 AC4待ち

PMはDesigner最終doc、直接96PNG・内容同定42補助とbefore28/after12/ops2、SM独立metadataを根拠に#9 AC1〜4を観察要求scopeで合格（集約待ちReview）と判定。連続動画全尺鑑賞/音/実機へ判定を拡張しない。#15 AC1/2/3/5は合格、AC4は新CI37745135499/head832ab1e227a6e87a37c115feb15f9d6a1ad16d43未終端でpending。

SMの追加remaining metadata28unique/44PNGはsurge10/dodge16/clash16/vow2、全前後cut時刻/actualstage/sourcecut/fixture/viewport/toolSHA一致・errors0、専用initial/final固定301guardと実hash一致。2context同時自然clockであり性能評価ではない。

#8の新candidate/source/assets/CI受入・S3実merge・main Release PR・残件処理は未完。#7未聴取/#11本番gate/#13除外、本番未公開を保持。下の#9全場面pending/代表限定・#15全ACpendingは各時点の過去判定で、最新AC欄を優先する。旧CI失敗は保存、新CIartifact到着時に完全head/ref/source/assetsを独立照合する。sourceInputsを変更せず、設計doc取込み/commit/GitはPM担当。

## short26終端guardと新CI進行

SMが新残4recordのみ追加監査し、非flash13経路×2幅26unique/52PNGの直接silence・attention記録を終端summaryで確認。PNG前後timeはcut.at<=t<end、actualSnapshotStage/sourcePoseCut/snapshot stageが全一致、fixture/viewport/toolcopy SHA一致、errors0。logALL_DONEshort26/Chromeclosedを確認。実画像の観察はDesigner/PMの別判定。

before/snapshot-guard-final.json（16:27 JST）は固定c989 src/public301が初期SHA5737…と最終一致、SM現実ファイル再hashも不一致0。after-finalの終端guardも固定feather301/c6a4…と全実hash一致。shortbatch専用開始guardは未採取で、旧midguardをshort前後へ改称しない。初期固定snapshot→最終hash一致の限定証拠で、tools/config/dependencyは別管理。

#9の追加dodge/clash直接metadataは取得待ちで、不足cutの実見判定はDesigner。新CI37745135499/head832ab1e227a6e87a37c115feb15f9d6a1ad16d43は進行中、source678f899…/507入力はPM報告値。最新artifact到着後に完全SHA/source/assetsを独立監査し、旧fail37738355830を保持する。未完CIを合格にせず、S4原候補をS3へ入れない。

## 操作の最新受付判定：pressedAt直接証拠

両幅PUSHの受付はクリック実行/画像ringだけで判定しない。recordのclick後presentation.pushInput.pressedAtは390=`47.033333333331306`、1440=`46.83333333333132`で、既存受付窓46.5<=t<49.9の内側。直前はpushInputなし・visible/enabled・playing/notpaused、同id/drawId/win=falseを保持。click後49.92は成功受付時のreleaseAtで、期限49.9を越えた受付とは扱わない。既存pressDecisionPushはenabled時だけpushInputを作りreleaseAtへ進め、自然advanceは新規pushInputを作らないことをread-only照合した。

操作toolはクリック戻り値/insideWindowの専用assertを持たないため、保存pressedAtとsource対応による独立判定である。固定snapshot301の現実ファイルSHA一致と、操作実行専用initial/end inventory guard無しを別記する。自然当落全経路/賞球・画像品質・新CI成功とは分離する。

次Readyは新short26のactual cut metadataと新CI run/head/artifactの独立照合。未到着の新証拠を合格にせず、S4原候補文書をS3へコピーしない。

## #15操作metadataの独立照合

原after-operationsの2幅summary/recordと実行tool SHAが一致、errors0。実DOM切替lcd→whole→board→lcdのsnapshot view一致、pause holdはwall約803ms/782msでpresentationとgame時刻が完全停止、resume後の演出時刻増加を確認した。PUSHは390演出46.85秒/1440演出46.6667秒でvisible/enabled、実click後49.92秒へ既存受付動作で進みhidden/disabled、最終presentation=null。全fixtureは通常pressure外れを保持した。手動seek/freezeや自然抽選/賞球の検証とは称さない。

固定after301ファイルの実SHAは保存snapshotと全件一致。ただし操作summary自体に開始/終端inventory guard欄はなく、固定snapshotの出所と現ファイル照合を根拠として分ける。各画像はsnapshot後の時計進行を含み、画像品質/重なりはDesigner/PM判定。音disabled/聴感未検証。操作metadataの成立を失敗Linux CIのAC4合格へ換算しない。

新CI失敗log/artifactは原linux-ci-37738355830の保存indexへ対応付け可能。461成功・bonus50秒timeout・候補未発行と直前battle216.596秒traceを別に保持する。次Readyは修正headのCI/候補照合と全after目視判定のAC対応。

## 最新CI失敗：#15 AC4未合格

SMがrun37738355830のjob APIと失敗log/artifactを独立照合。head3b502a08、job06:34:31〜06:56:11 UTC（21分40秒）、prepare06:35:30〜06:56:07（20分37秒）。30分job上限超ではない。461unit成功/失敗0（456.509秒）、build/release両幅/controls/UI両幅/battle経路は成功。feedback.browser.mjs:49 bonus専用payout>0待機50秒がtimeout/exit1、#15 AC4全体は未合格。

失敗stateはChrome153/SwiftShader、visible/paused=false/playing、gameTime11.95秒、roundcelebration、w.bonus.open=false/count0/payout0、専用counts.bonus0。clockTrace23件は直前battleの観測でありbonus50秒の連続traceではない。battleはwall216.596秒/reach46.7417秒でPUSH可視となり300秒内に成功したが、旧180秒内成功とは称さない。bonus段階の最終stateだけで根本原因を確定しない。

artifactのfailure JSONは保存、candidate.jsonは存在せず成功候補未発行。新CI成功/全経路操作受入までDraftと残件を維持。代表feather視覚判定とbefore/after metadata取得は別証拠として保持する。元失敗を単なるretryで隠さず、実装範囲外の時計/賞球変更は行わない。

## #9/#15観察とACの対応（代表判定を限定）

原 `docs/agile/S3_DESIGN_REVIEW.md` をIssue #9の4ACと#15の5ACへ照合した。最新fixed beforeとafter-prototype/featherを分けた観察記録で、原画の欠字修正ではなく主役分離の改善とする根拠を保持する。

| AC | 現在の対応証拠/判定可能範囲 | 残る不足 |
|---|---|---|
| #9 AC1/2 | SMはbefore14経路×2幅28recordのfixture/尺/終端/tool世代/固定301sourceを独立照合、欠落0。Designerは代表pressure外れの原PNGと離散連続列を実見し、主役/入り/抜けを記録。失敗起動/fsallow/中断130は分離 | 全28動画の取得は全28の実目視/場面別観察の代替ではない。通常/RUSH勝外復活の全尺観察提出と音未検証の明示を継続 |
| #9 AC3/4・#15 AC1 | pressure24〜33の最小camera寄り/背景限定減光、既存素材再利用、24/33で追加量0、54/58/12維持を設計へ対応。矩形段差差戻し→6strip featherを同S3内で再判定 | 最新全尺の競合cut観察との最終対応/PM #9受入は未了 |
| #15 AC2 | 新feather390/1440原PNG25.3/29.5と50frame列ずつ。PM/Designer代表pressure外れ判定は字幕の抜け/顔眼手刃/原画/下端のなじみ改善、重要crop/保留dockへの新重複なし。SMはmetadata/source対応を照合 | 代表2幅の24〜33だけ。全経路/全表示/操作を合格へ拡張しない |
| #15 AC3 | 代表の24cut後の入り、32.8までの追加量戻り、33既存cutへの抜けを離散列で観察。SM pose境界比較は別のpure関数証拠 | 全afterの通常pressure勝/外/復活・RUSH pressure勝/外・flash非改変の連続確認、共有描画へ影響する他variantの確認は新metadata/Designer判定待ち |
| #15 AC4/5 | 2製品source/2直接testのcommit3b502a0、関連19成功、37584 pose比較で既存field境界保持。Draft PR16/新CIを追跡 | 実PUSH/停止復帰/保存当落FIFO賞球の機能検証と新build/CI/PM各AC判定は未受入。実機/聴感/性能未確認 |

次after監査は到着した新recordだけについて、期待case×2幅/fixture/結果/54-58-12/実演出時刻/世代source/tool/正常終端/失敗除外を検査する。代表を全体へ換算せず、既存pure pose比較を再実行しない。視覚判定はDesigner/PM、PR/CI artifactは別のrun/head/候補照合を行う。

## Draft PR/CI現在

Draft PR #16 https://github.com/sintaro-katuta/silverball-chronicles/pull/16 作成・添付済み。head `3b502a08cc63fa9a14c481aee5cac82b0462c6d3`、CI run37738355830進行中。#8/#9/#15受入未完了、Draft維持、main PR・本番未実施。新runの結果/検証ref/source/assetsは未受領、到着後に独立照合する。下のPR未受領は作成前履歴。

## feather代表2幅の確認とPR/CI引継ぎ

PM/Designerの代表2幅判定は合格、SMはafter-prototype-featherの固定301入力を実ファイルSHAで独立照合し不一致0、inventory SHA c6a4c77990448c5d42ea2b1621f6de46ee69da5e599dc47f3e98329f2ad4c8a1を確認。beforeからの変更はtimeline/viewの2sourceのみ。capturetool/pose-oracletoolとbefore/after timeline SHAが記録と一致した。

SM独立pure pose比較は37,584組合せ・261時点・対象1,376で成功。pressure非flashの24<t<33以外は旧pose fields同一、captionBackdropAlpha=0。対象内もcamera以外の旧fieldを保持した。これは描画補間関数の境界照合で、全製品/視覚/当落経路の受入ではない。

両幅normal-pressure-lossは同fixture/viewport、50frame targetsずつ。390の最大target遅れ約50ms、1440約25ms、25.3/29.5の成熟時刻をmetadataから確認。元矩形prototypeはRework履歴として残し、feather世代へ書き換えない。全経路/操作/全尺動画の目視・回帰CI・candidateは未検証/pending。

PMの4コード/test commitとDraft PR #16作成は完了し、新CI/全経路受入を追跡する。受入記録はPR番号/base/head、CI run/実merge-ref、458等の実test件数/失敗、候補ID/source/資産全SHA、画面世代/条件、PM各AC判定、実集約commit/treeを到着後に埋める。PR情報は上記の通り受領済み。CI新結果は未受領で、旧S2成功を新head合格へ流用しない。Git/push/commitはPM担当、既存dirty文書を保護する。

## #15 Rework：背景下端の段差（途中判定）

PM実見で旧prototypeのcamera/原画主役保持は候補、背景0〜30の単矩形下端が月/雲を水平に切るためAC2をRework。Leadは24〜30の下端6strip alpha .833→0の静的geometryへ改修し、global上限.22/envelope/camera量/captionを維持。関連19test成功は再撮影前の局所証拠で、視覚合格ではない。

SM独立照合：固定before inventory301のSHA5737d7c…f2be3と旧after-prototypeの301入力SHA3ca617a…b5c39dを別保持。before→旧afterとbefore→現作業版のruntime/public差はlong-reach-timeline.js/long-reach-view.jsの2sourceだけ、新規/欠落なし。2幅のnormal-pressure-lossはfixture/viewport/自然clock同条件。23.8/25.3/29.5/33.2秒の実presentation時刻は近接するが最大25ms程度の差があり、完全同時snapshotと称さない。

当時after-featherは予定世代だった。現在は上のfeather代表2幅確認を優先し、再撮影/sourceguard照合は実施済み。元失敗と中断を成功へ混ぜず、#9全尺網羅・#15PM/Designer再after判定・全回帰CI/候補はpending。直接test以外へscopeを広げない。

#8の対応台帳。S3は2026-10-08に#8/#9/#15開始承認済み、sprint/S03の起点はrelease集約 `c989ee8ba5427fd1cc03ac29b2037c008e5b9206`。本書は受入と未受入を分ける台帳であり、ビルド候補candidate.jsonの代替ではない。S3の新candidate/最新CI/実集約は未発行・未実施。固定deadlineなし。PMがAC判定とGit/外部更新を所有する。

## 台帳の記録単位

各Issueは要求/AC、対象commitとfile、担当、証拠環境/条件/実行日時、検証head/merge-ref、候補ID/source SHA/資産個別SHA一覧の場所、PM判定、未検証/残件、実集約commit/treeを対応付ける。CIのsynthetic merge-ref・head・実マージは別欄とし、過去候補のgitSHAを書き換えない。未受入をAccepted列へ含めない。

## 受入済み成果と集約証拠

| 対象 | file/変更境界と受入根拠 | CI/head/検証ref | 実集約とtree |
|---|---|---|---|
| S1 #2/#3/#4/#10 | [S1変更manifest](S1_CHANGE_MANIFEST.md) の前提73/S1変更23/混在6を区別。先行SE PR #1をS1新制作へ数えない。[実CI受入](S1_CI_REVIEW.md)で452成功・UI/体験・資産を対応 | run37559217841 SUCCESS、headb649b70、merge-ref576bfda0084593e6f998e98913cbad80029c6302 | PR #12、実merged99fc23b627276f4ebd499473ab49c1c4a6cdfb2、head/実merge tree4289b4ed4ab56cca0605855d7072acd7606bb0cc |
| S2 #5 | [QAレビュー](S2_QA_REVIEW.md)、qa05-measurement.mjsと直接test、commitfd962ea。物理15/有限400校正15の計数会計。元guard失敗・result停止censor・全5台同配置を開示し物理改変なし | 下のPR #14成功候補に含む。新測定による保証へ拡張しない | PR #14の実集約に含む |
| S2 #6 | [性能レビュー](S2_PERFORMANCE_REVIEW.md)/[画質確認](S2_VISUAL_ACCEPTANCE.md)、commit1a86ee3。PC Metal24窓と現行静止基準。旧SwiftShader失敗/probeを分離、実スマホ/熱未検証 | 下のPR #14成功候補に含む。最適化の受入ではない | PR #14の実集約に含む |
| S2 CI修正 | [CI修正](S2_CI_REVIEW.md)、feedback.browser.mjs有限300秒/失敗診断・pr-ci30分、commita5e491c。製品clock未変更、関連54/体験3と新Linux458成功 | run37692427739 SUCCESS、heada5e491c9ffa076e07dcc4fd0db27781420369227、merge-ref4195e4afbef18e3e85f444015c6824cb88187a82 | PR #14、実mergec989ee8ba5427fd1cc03ac29b2037c008e5b9206、head/ref/実merge tree981f86bec0e5a01363a2568cfdef49470718fa02 |

資産対応：S1候補b3fa3a09-89e1-4863-aefb-59922fab6959/sourcebfd6f66d49638a7682af964f1c898ef6b7c7cc654f9abc09f98a4906dfc827cf。S2候補f618d7b0-653a-4794-a4d8-64f9d0aaeec0/sourcefe9b1bcfe8ed6a50d0f4d3f6c98c440ed0d97c0445bbc81218514886a90d66a6（507入力）。両候補は45公開資産/14,901,612B。個別SHAは既存candidate.jsonのassets配列で確認する。S2はSM/PMが全size/SHA/集合を独立照合しmissing/extra/mismatch0、clock11観測PUSH到達wall94.786秒/reach46.7333秒。今回の成功で旧失敗原因確定・flakeゼロを主張しない。

ローカル保存証拠（PR非同梱）：原workspace `prototype/reference-review/pr12-linux-ci-37559217841/`、`prototype/reference-review/s2-2026-10-07/qa05/`、`perf06/attempt02/`、`sound07/`、S2修正artifact `/private/tmp/silverball-s02-ci-fixed-artifact/`。GitHub artifact11514238673はrun37692427739/headと対応済み。private media/logを公開資産へ混入させない。

## 未受入・限定受入の分離

| 項目 | 現在の境界 | 解除/次証拠 |
|---|---|---|
| #7音 | 11素材取得と準備commit0118688は記録済み。人間聴感AC未受入、hidden/実機未検証 | 聴取者/出力/音量/時刻・経路と5AC評価→PM。録音成功を聴感へ換算しない |
| #11 CD全体 | ローカル構築とPR CI部分のみ受入。本番CD有効化/Secrets/実接続/公開未検証 | [CD有効化レビュー](CD_ENABLE_REVIEW.md)・対象権限/復旧先/25分予算を具体化し別ゲートへ |
| S3 #9 | baseline全尺調査/案は作業中、未受入 | 最新SHA・通常/RUSH勝外復活・時刻別観察→PM内部設計判定 |
| S3 #15 | 実装/画面AC未受入 | PM範囲内設計承認→Lead実装/直接test→390/1440前後と連続→SM照合→PM |
| S3 #8 | 台帳/検証/公開復旧の準備中、未受入 | S3成果file/SHA追加、必要test/build/CI、未完了処理合意、Sprint集約PR/添付 |
| #13 | S3対象外、未承認 | 要求比較だけ。配置変更/追加測定へ進まない |

## quietと固定before/afterの提出順

Designerのbeforeはc989集約snapshotのsrc/public301入力を固定したimmutable比較元。全28条件のうち8完了時点でafter優先へ切り替え、途中caseはfailed/interruptedとして隔離した。固定beforeのため#15runtime実装は同時進行できるが、重いbrowser/全testは短いquiet枠で調整する。元撮影のSIGABRT/fsallow失敗・中断exit130を成功経路へ混ぜない。

PMはbefore390/25.3秒と1440/29.5秒の実見から範囲内の設計を内部承認。Leadのcamera/envelope/背景限定層と直接18test成功はprototype途中成果で、全S3受入・全CI合格ではない。Chrome終了確認→Leadのafter2幅prototype撮影→Designer/PM目視のgateを維持する。

SM次Readyは同variant/結果/演出秒/viewport/設定のbefore-after対応、metadataのwallとpresentation時刻、固定before/source guard、after source/描画系field変更境界を独立照合する。画像の主役/字幕/連続体験の判定はDesigner/PM。撮影段階で不足caseを保持し、before全28/after全28・自然遊技・実機・音の合格へ拡張しない。

原dirty sourceを使わず、固定beforeと作業中afterのSHAを別記する。SMは#8台帳/証拠読取を並行し、提出後AC照合→PM受入へ渡す。新candidate/全CIはまだ未実行、GitはPM所有。承認範囲内の工程ごとのユーザー再承認は不要だが、対象拡大は別確認。

## 検証・公開・復旧の対応

[リリースチェック](RELEASE_CHECKLIST.md)、[候補の仕組み](RELEASE_MECHANISM.md)、[CD運用](RELEASE_CD.md)、[CD_ENABLE_REVIEW](CD_ENABLE_REVIEW.md)を正本手順として参照する。

1. S3完成headで必要test/release build/preview/browser/画像を確認し、prepare/verifyの終端exit0と固定候補のsource/target/assets全SHAを照合。新S3検証を旧S1/S2候補で代替しない。
2. sprint/S03→release/0.1.0集約PRを作成/添付し、実CIと実merge/treeを追記。3Sprint未完了を数合わせで完了にせず、#7残件を合意なく除去しない。
3. release→main PRの対象version/commit/notes/公開先・未検証・復旧をレビュー。本番有効化は別の具体的明示許可、Secrets値を台帳へ書かない。有効化後はrelease→main mergeを公開合図とする。
4. Cloudflare deploy→fresh Version/traffic/公開資産SHA→production smoke成功後に同version/mergeSHAのtag/Releaseを発行する。main直接push/Sprint集約mergeで公開しない。
5. 公開失敗時は保存fresh prior Version/trafficと差を確認し、既存rollback手順で復旧/再確認する。復旧先を古い履歴値から決めない。前CD成功/復旧完了前に次release→mainをマージしない。PR30分とCD25分の予算差は有効化前の残リスク。

本書のS3欄はpendingのまま提出する。新candidate・CI・実集約・本番公開を実施済みとは記録していない。
