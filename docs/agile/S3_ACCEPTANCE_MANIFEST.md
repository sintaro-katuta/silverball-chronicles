# S3受入manifest台帳

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
