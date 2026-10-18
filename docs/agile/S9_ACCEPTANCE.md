# S9 音源・接続・試聴の受入台帳

## PM判定：v3と導入修正の局所確認（2026-10-19）

最新候補は、改修前02054e8上で制作・検証したソース210件のSHAへ対応する。計測時のHEADだけを完成版とせず、各receiptの入力一覧と現ソースの一致を確認した。以下はPMの技術判定であり、迫力・好みについてユーザーが受け入れたという判定ではない。

| AC | PM判定 | 根拠と残件 |
|---|---|---|
| 1：4曲 | 技術合格 | v3の4曲・作曲設定・再生成元・計測・旧新ブラウザ再生を照合。聴感は試遊で確認 |
| 2：13用途と既存確定音 | 技術合格 | 13用途の全variant、17用途の比較配信、署名8PCM保持と対象外不変を確認 |
| 3：割当・時間表 | 局所技術合格 | 本編と共通の定義、既存の時間表、今回の本編8収録を照合 |
| 4：同期・導入・情報保持 | 局所技術合格 | 導入の曲頭反復25回→開始1回、通常への受渡し・スキップ、絶対戦闘時計・無音窓を確認。初回の素材準備待ちは残る |
| 5：音量・停止復帰 | 局所技術合格 | 両幅の個別操作、導入停止/復帰、既存本編回帰を確認。スマホ実機・OS背景状態の全条件を保証しない |
| 6：遊技条件の保持 | 局所確認済み・最終CI待ち | source照合、関連30テスト・ビルド・本編回帰で確認。最終HEADの全回帰はPR Checksで判定 |
| 7：計測・実出力・試聴 | 技術確認済み・人の聴感待ち | 全17用途×旧新×両幅の68自然再生、実音8収録を確認。音の派手さ・好み・疲労は数値で認定しない |
| 8：動画・CI・レビュー | 最終確認待ち | 目的別コミットと比較動画を準備。完成動画の自然再生・PRプレイヤー・最終CIの結果はPR本文とChecksへ記録。ユーザーレビュー・集約は未実施 |

検証時の原記録は`runtime/energy-v3/`、単体比較は`audition-qa-v3/`、最新媒体は`pr-video-v3/`に分けた。以降の最終判定先は[PR #39](https://github.com/sintaro-katuta/silverball-chronicles/pull/39)とそのChecksで、本文に対象HEAD・結果・残件を残す。mainへのマージ・本番公開は今回実施しない。

## 最新追加：導入BGMの一音停止を修正中（2026-10-18）

ユーザー依頼で、開始前の全体→盤面→液晶導入の音連続性を同S9/#37へ追加しました。Leadが実再現/修正し、修正後の局所QA receiptを独立read照合済み。全回帰/最終媒体/新CI/人の聴感は未確認。音源v3の制作/測定は不変で、下段の素材技術確認を維持します。修正前の局所v3 28tests/既browser/reel成功は履歴であり、現在のruntime最終合格ではありません。

| 追加AC | 条件 | 判定/必要証拠 |
|---|---|---|
| INTRO-1 / AC4 | 導入全相でBGM連続、通常handoffで曲頭へ戻らない | 両幅natural/skipの局所技術確認済み。初回lazy待ち約.44〜.56秒後は連続、通常handoffで曲位置の後戻り0 |
| INTRO-2 / AC6 | 導入中に遊技時計・発射/玉消費・抽選を音のために進めない | 全7ケースのintro active sampleでgameTime0。pause snapshotでstock400/消費0/発射0/抽選0を確認。音のための遊技進行なしの局所証拠 |
| INTRO-3 / AC5 | skip/pause/hidden/退出で重複・残音・遅着再開がない | natural/skip/pause・既S9 lifecycle局所QA済み。visibility合成handlerとOS背景を区別し、全端末/聴感へ広げない |
| INTRO-4 / AC4 | 体験battleの絶対presentation音時計・PUSH追従を保持 | 体験battle含む3体験と両幅既S9の絶対表示時計/50.2167秒位置を確認。既無音窓の局所技術確認済み |
| INTRO-5 / AC6/8 | 新source/関連/本編回帰・最終媒体/新CIを対応づける | 修正後30関連/両幅browser/release buildをreceiptで確認。最終全回帰/新媒体/CI未確認、旧28等は履歴 |

原因候補のgame.time固定とAudioContext進行のdrift再startはLead再現待ちの仮説です。SMはPLAN/本台帳のみ編集し、実装・重処理・新録画・Gitは行いません。

### 導入修正後の根拠と限界（2026-10-19）

`runtime/energy-v3/qa-receipt-intro-fixed.json`はHEAD02054e8上の未コミットsource、SHA `6e2034bf784a8065b4bfd258e0e8b3d21e01c30e389fcd029e88da6eb277b867`。qa-source-start/endの全210入力リストexact、現byte SHAも独立一致。修正後30関連tests・release build・既S9両幅browser・自然導入両幅/skip/pause/3体験がexit0。導入収録はそのsourceguard直前に同じ所有編集で行ったとreceiptが明記し、録画中の始終guardと偽りません。修正前reel局所証拠は別です。

intro-fixedの7ケースでerrors0、全active intro sampleのgameTime0、normal曲位置の後戻り0。自然390/1440とskipはnormal source start1回で通常へhandoff。pauseは止めて再開するため2回、battleは曲切替で2回、rushは状態遷移で3回であり、start総数だけを重複不具合と数えません。pause中snapshotはintro elapsed/曲位置固定・voice0・stock400/消費0/発射0/抽選0。導入完了後の遊技進行は正常な別区間です。

whole初期にはlazy生成待ち約0.44〜0.56秒、開始offset約0.53〜0.61秒が残り、その後のboard/lcd/return/normalは持続。『クリック直後から全sample有音』とは判定しません。原PCM記録に区間energyがあり、初期/意図した停止以外の連続性を示しますが人の聴感採否とは別です。

`intro-fixed-existing-s9-browser/verification.json`は実Worker4曲と両幅でerrors0、個別音量0.25/0.7維持、battle初位置0.0333秒・pending0/active1（短いcrossfadeは総voice2）、50.2167秒の表示時計位置を確認。visibilityは合成handler分岐でOS実背景ではありません。その後の全17用途×旧新×両幅の自然試聴と、新8場面収録は以下の別receiptで確認済み。最終CI/新動画/人の聴感は未完了です。

### v3単体試聴ページの全用途技術確認（2026-10-19）

`audition-qa-v3/verification.json`と`generation.json`/logを独立照合。HEAD02054e8の未コミット凍結v3＋導入修正として保存され、10入力の始終リストexact・現byte SHAも一致。音源manifest SHAは`c900e63b3d1b7f01f4abf083455c69d136780ff9d0f6f39f58dc2dc6cf51c779`です。

1440×900と390×844の各17用途×旧/新2音、計68再生を再集計し、全件ended/rate1/seek0/error null、除外なし。全68配信のHTTP200/SHA/bytesを音源manifestと独立一致、WebAudio decode・同LUFS player gain・2playerの停止/切替/resetと幅確認はsuccess/errors0。logはAUDITION_QA_PASS/OWNED_CHROME_CLOSED、session68581 exit0に対応します。

これは音源単体のブラウザ自然再生です。本編8場面収録は別途開始中で、録音mix・最新全回帰/CI/PR媒体や人の聴感採否をこの成功で代用しません。旧音源は02054e8実S9の同用途で、旧padの比較ではありません。

### v3本編8場面の収録・可逆保存（2026-10-19）

`runtime/energy-v3/verification.json`/`media-verification.json`/`record-archives.json`を独立照合。旧02054e8と未コミットv3＋導入修正版の各normal/battle/bonus/rush、計8記録。beforeInputs/afterInputsはそれぞれ210件で、旧新版同士が同sourceという意味ではありません。各原記録のsourceStart/Endは一致・sourceUnchanged true・errors0、新側210現byte SHAも一致しました。observed HEAD02054e8だけでは新版を識別せず、実入力SHAを使います。

全8原WebMのSHA/bytesを独立一致。receiptは映像/音声全尺decode各exit0、Opus48k stereo・有限非ゼロ平均/peakを示します。今回はreceipt読取と保存SHAの照合で、SMはdecode/撮影を重複実行していません。音源そのものの同LUFS試聴と、この本編固定gainの実音収録は別条件です。

対となる場面のfixture/settingsは一致（BGM0.5/SE1・両有効/演出軽減false）、最終計数も同数。normalは実発射45秒・固定乱数/通常.18/直接表示経路で各ヘソ7、battleはpressure当たりfixture、BONUS/RUSHは正規体験UI。自然入賞/抽選確率・全球完全軌道の同一性は主張しません。各sampleは約100msで、入賞/演出切替の切抜き提案もprecision0.1秒です。

全8JSON gzipは圧縮/展開両SHA/bytesを独立一致し、展開bytesと保持した元JSONも完全一致。圧縮は可逆・原保持。原記録/音源を上書きしていません。

PM技術判定の候補：AC1/2は素材・旧保持・17用途技術再生、AC3は定義/時間表、AC4/5は導入/同期/無音と局所操作まで技術確認。AC6はsource固定のread/局所回帰までで最終全回帰待ち、AC7は技術出力を確認し人間聴感待ち、AC8は最終媒体・最新CI・PRレビュー/集約待ちです。技術候補をユーザーの音楽性採用とはしません。

最終段取りは、最終動画とlocal/PR実再生を終えてから目的別commit/push→Ready、同じ最終HEADのrunを確認します。ready_for_review再起動を踏まえた既存workflow運用であり、新CI設定は変更しません。最終媒体/CIの判定先はPR39本文とChecks、生成receiptはローカル記録です。現在prepare/Remotion前後の作業中で、新最終媒体/CI/聴感/マージは未完了です。

## 継続中：v3音の方向調整と素材確認（2026-10-18）

試遊の「全体BGM/SEがchillすぎ、もっとアップテンポで派手に」を同S9・#37/#38の修正として受領。4BGM/13SE用途をv3へ再作曲/合成します。現在PR39は未マージ、基準02054e84078d421caf087cb8dc2dda490a146b4b。旧音源v1/v2、動画、695pass・CI39132459628全3成功は改修前の履歴として保護し、新版の合格へ付け替えません。

代表normal＋リール/ヘソ＋decisiveHitを自己/技術レビュー後に全用途へ展開。新しい台本/音声は作らず既存承認発話を流用し、字幕と最新実音で説明します。工程再承認なし。改善完了・聴感採用は人の試聴待ちで、BPMやattack等の数値を改善率とはしません。

| v3確認 | 対応AC | 最新判定 / 必要証拠 |
|---|---|---|
| 代表→全4曲13用途の再作曲/合成 | AC1/2 | stage all受領。17用途/150ファイルとsourceSHA、58数値receiptを独立照合。聴感待ち |
| 02054e8基準とv3候補の2音・同LUFS比較 | AC7 | 基準17/gain式/両幅68単体自然再生の技術確認済み。本編8場面は同設定収録/技術確認済み、聴感は別途 |
| 署名8PCM・時計/無音/公開前情報/FIFO/賞球/盤面固定 | AC2/4/6 | 旧v1/v2全140ファイル不変と署名8PCM保持proof確認。ゲーム回帰/新ミックス待ち |
| 表/同期・個別音量/消音・停止/復帰/寿命 | AC3/4/5 | 新音源接続後のreceipt待ち。既同期方式の成功は履歴 |
| 実ブラウザ/通し・人の試聴/ユーザー採否 | AC7 | 単体68再生と導入後局所QA済み。本編8場面の実音/保存技術確認済み。最終媒体と聴感は未確認 |
| 既承認発話流用＋字幕/新実音の比較動画 | AC8 | v3媒体未完了。実再生/自然終端/PRplayerを新版で確認 |
| 最終source/HEADとCI・PRレビュー/集約 | AC6/8 | 新CI未確認、未マージ。Draft/Readyと外部操作はPM所有 |

SMの担当はPLAN/本台帳と後続receiptの独立照合のみ。実装・重いテスト・撮影・Git/PR/Issue更新は行いません。次Readyは代表の素材/技術receiptの提出後です。

## v3素材の独立照合（source凍結前・2026-10-18）

`audio-v3/manifest.json`はstage all、4music＋13SEの17用途。比較基準は02054e8の実S9音源17用途で、旧padではありません。manifest全150音源ファイルSHA/bytes、sources/additionalSources実byteを独立照合し全一致。基準17コピーも元audio-v1/v2と一致。HEADは02054e8のまま制作sourceが変わるため、HEADだけを生成版の根拠にせず保存executed-sourceとmodule/tool SHAへ対応づけます。UI/本編接続は編集中で、この音源確認を新runtime合格へ流用しません。

新曲/新SE全variant/代表mixの58測定JSONはnonFinite0・clipped0・peak<1・input TP≤−2dBTP・MP3 decode0。LUFS範囲は−31.55〜−16.60。各17用途のgainは旧/新の小さいLUFSへ大きい側だけを減衰する式と独立一致（gain≤1）。ファイルへloudness加工せず、試聴プレイヤーで適用します。数値条件は音楽性/派手さの改善率ではありません。

`technical-checks.json`/`signature-proof.json`は旧win/rushWin8PCM一致、旧v1/v2計140ファイル保持、代表7音の全展開後byte一致、異なるsample rate/不正入力の検査を記録。旧140ファイルの現SHAは独立一致しました。署名PCMは保存proofと既受入SHAの整合確認であり、SMによる全再合成はしていません。

`self-review.json`では初稿normalはdrum transientが正規化を支配し、旋律/低音の平均が低かったためlayer配分を変更。master peakを上げず、LUFS−26.87→−22.35、crest19.27→15.01dBとした制作上の理由を保持。BPM160/160/180/192は設計値です。比較mixは同じ12秒のscripted mock scene（旧−23.52/新−24.66LUFS）で、実ゲーム音や人の改善採用を証明しません。

pYIN最終技術完了receipt `audio-v3/pitch-completion.json`（既実行session17765 exit0）と6派生artifactのSHA/bytesも独立一致。JSON SHA `a531e4ef30e4108ffc157c852f8213a1d63b61bb02371d92d2a041ad62a1f913`、4つの実入力stem/mixのSHA、環境librosa1.0.0/numpy2.5.4をread照合。150〜3000Hz・解析22050Hz/1024窓128hop・confidence0.8、同sample-zero/正規化なし・欠測補間なしの条件です。spectrograms.png/f0.pngの存在とDesigner実見完了を受領しました（SMの画像実見は未実施）。

JSONのaccepted rowsから0.12〜0.35秒body中央値を独立再集計し、旧262.678Hz（39frames）→新348.614Hz（40frames）と一致。全尺validはbody45.9→23.9%、mix48.5→46.3%。新bodyは約0.458秒で止まり、残りの無音も全1.55秒の分母に入るため、valid低下を劣化/改善と解釈しません。混合の共通倍音/オクターブ曖昧・欠測、約46ms窓の急なattack瞬時Hzの限界を保持。指定音程への対応記述であり、全曲の調性/品質点/聴感一致率ではありません。

sourcefreeze完了はPM通知に対応。Leadの新unit/browserQAは開始中で、音源技術確認を本編実音/全回帰/媒体/CI/人間聴感へ拡張せず結果待ちです。

v3動画は承認済発話の適用箇所を原音まま流用する予定。現案は段落3〜7を元の順序・全尺WAVで使用し、総SE8と旧pad比較の段落1/2は使いません。冒頭字幕で4BGM＋演出8/リール4/入賞1＝13と今回の方向変更を説明し、発話内の演出8用途の範囲も字幕で示します。新台本/新発話合成は0。実制作後の音声同一/構成・実再生は別途確認します。

## 以下は改修前の受入履歴

### リール/ヘソ追加時の状態（履歴）

ユーザーの「開始してください。」で開始承認済み。作業場所は `/private/tmp/silverball-s9-20261018`・sprint/S09、基準はrelease/0.3.0のaebe077。PR39は未マージです。追加前HEAD feadの成功記録は保存し、新追加の検証へ流用しません。

最新の「お願いします」により、同じS9/#38でリール回転・左/右/中央停止の4用途を作り直し、ヘソ物理入賞1回ごとの専用音1用途を追加します。**BGM4曲＋元SE8用途＋追加5用途＝新SE合計13用途**。元8用途や旧音源v1・承認7文/既存動画の履歴を説明なく上書きしません。追加5用途の制作・局所接続・実ブラウザ試聴の技術QAを受領/独立照合済み。通常発射からの追加前後45秒も収録済み（実入賞各7回、専用音0→7回）。追加後の全回帰・前後動画v2・新HEAD CI・人間聴感/採否は未完了です。

追加前は素材・旧確定音保持のPM技術合格、runtime/時間表/前後13WebM/全692単体テスト/関連画面回帰/完成動画の確認がありました。これらは当時の対象/版に限る成功です。新追加後の聴感・製品回帰・媒体・最新CI・ユーザーPRレビューとreleaseへの集約は別途確認します。公開/CDは未実施です。

## 追加承認のAC（2026-10-18・技術確認と残件）

以下を既存AC2/4/5/6/7/8の追加確認として管理します。新ナレーション文は作成せず、既存承認7文を新用途まで説明した承認とはしません。

| ID | 追加条件と独立確認 | 現在判定 |
|---|---|---|
| ADD-1 | リール回転spinと左/右/中央停止の計4用途を新作し、実際の開始・各停止の表示時計へ接続。フレーム反復やmute解除で重複しない | 4素材/接続/28関連testsと両幅実出力の技術確認済み。自然図柄全経路/聴感は別 |
| ADD-2 | 実ヘソ物理入賞1回につき専用音を1回。保留追加/消化開始/抽選成功の通知と混同せず、通常/右入賞・払出音へ誤接続しない | 実solver入賞fixture＋満杯保留の両幅確認済み（start1/cue1、queue/serial不変）。自然入賞率/全経路検証ではない |
| ADD-3 | 抽選・保存当落・保留順・払出・時計・盤面を変更せず、満杯保留時等も元の物理入賞事実と抽選受付を区別する | hit処理後の通知・球object弱参照で1回性をread確認。満杯FIFO/会計関連test成功。最終全回帰待ち |
| ADD-4 | 個別SE mute/volume、pause/再開、退出/遅着、短間隔の複数入賞/停止で重複・追い鳴らし・残音がない。上限/優先制御で当たり音を壊さない | mute/pause/exit/同球重複・利用不能時消費の直接/両幅fixture技術確認済み。OS実背景/自然連打全件へ広げない |
| ADD-5 | win/rushWin各4のPCMを維持。元BGM4/SE8との混合・無音/公開前情報保持を再確認 | v2 preservationで旧BGM4・元SE32音型/保存90ファイル・署名8PCM保持を確認。新ミックス聴感待ち |
| ADD-6 | 新5用途の音源SHA/数値・同条件前後試聴/音付き媒体・新HEAD CIとPRレビューを対応づける | 追加音源50ファイルSHA/配信/両幅自然1倍再生確認。動画v2/新CI/聴感は未完了 |

初期readでは現cueのspin/stopLeft/stopRightは抽選/図柄時計、stopCenterは解決通知へ対応し、物理ヘソ入賞と同じイベントではありません。追加音はcue差分だけで済むと決めず、実物理入賞の1回性と抽選/保留受付の分離を確認します。現在の板/物理/抽選処理を音のために変更することは条件に含めません。receipt時HEADはfeadのまま追加source未コミットで、HEADだけでは版を識別できません。source210の始終SHAで結び、SMはtests/媒体を重複実行しません。

## 追加5用途の技術QA（2026-10-18・聴感/新CIは別）

`runtime/reel-admission/receipt.json`はHEAD fead始終同一、source210入力SHA `2eb53c77333c7b881e3cc8447e808fee5904332bf0e0e63e87f7bdc8d2e12f95`始終一致。source-end全210現byte、receipt列挙ログ/画像/JSONのSHA/bytesを独立照合し全一致。関連実PCM/runtime28pass・fail0（2.856秒）、release build exit0、両幅の新入賞/リールと既存S9 UI/Workerを確認。旧692件/旧CIは追加前の結果で、新全回帰/CIを代用しません。

`browser/verification.json`は390/1440幅とも、満杯queue [2,3,4,5]・serial5を維持した実solverの口通過でstart0→1/cue0→1。別の実AudioContextリール時計fixtureはadmission/spin/stopLeft/stopRight/stopCenterを各1回記録し、全5区間の実出力energy>0・errors0。初期位置を口付近に置くfixtureであり、通常発射からの自然入賞率や全図柄状態の受入ではありません。

`audition-qa-v2/verification.json`は両幅17用途のHTTP/SHA/WebAudio decode等、追加5＋維持pushPressの6用途で基準/候補の自然終端を確認（計24再生、rate1/seek0/error null）。ヘソ基準は旧専用音が無いため意図した無音で、旧当たり音等との置換比較ではありません。before/after入力リスト一致、generationはfead上の未コミットv2source/page/helperと明記。

`audio-v2/manifest.json`の50音源SHA/bytesとsource実byteを独立一致。追加5用途の数値はnonFinite0/MP3 decode0。`preservation-proof.json`は旧4曲/元SE8×4variant、保存旧90ファイル不変、署名8PCM一致を記録し、旧90ファイルの現SHAも独立一致。旧音源v1/承認7文・既存動画を変更した証拠とはしません。人間聴感は全receiptで未検証、動画v2/追加後CIは未実施です。

## 正式計画ACの改修前判定（履歴）

正本IDは[S9_PLAN](S9_PLAN.md)のAC1〜AC8。技術条件の確認、人の聴感、PM/ユーザー採否を分けます。

| AC | 条件 | 現在の判定・証拠 / 残件 |
|---|---|---|
| AC1 | BGM4曲・再生成可能な作曲データ | **PM技術合格**。4曲/score/再生成条件、音源SHAと数値receiptを確認。聴感採否はユーザー確認待ち |
| AC2 | 元SE8＋追加リール4/ヘソ1、旧win/rushWin確定音保持 | 元8用途はPM技術合格・旧署名8PCM一致の履歴。追加5用途と新source保持確認はADD-1〜6の技術確認済み。最終全回帰/媒体は別 |
| AC3 | 全割当と代表一本の映像/BGM/SE/光の時間表 | **技術確認済み**。全割当read、両幅3結末の光/剣/無音境界DOM QA、同定義参照とiframe制限を確認。専用編集器/全演出の映像受入へ広げない |
| AC4 | 共通時計・意図した無音・結果公開前の情報保持 | **技術確認済み**。PUSH表示時計、共通曲、関連tests、両幅runtime、前後実収録の半開無音窓を確認。100ms sampleは全PCM完全無音の証明ではなく、聴感は別 |
| AC5 | 個別音量/消音・停止復帰・寿命/上限 | **局所ブラウザ技術確認済み**。保存/別bus、pause/resume、退出遅着無効、先読みとcacheを確認。visibilityは合成handler分岐で、OS実背景/スマホ実機を確認したとはしない |
| AC6 | 抽選/保留/出玉/機構/採用盤面不変 | **ローカル技術合格**。差分の不変、全692テスト、本番/プレビュービルド、両幅release・操作回帰を確認。最終HEADのCIはPR Checksで別確認 |
| AC7 | 数値・実出力・単体試聴・本編通しを区別 | 数値/実出力/媒体を別証拠で確認済み。**人の聴感・ユーザー採否は未検証**。speaker/イヤホン等の未確認条件を残す |
| AC8 | 目的別commit・承認台本動画・最新CI・PRレビュー/集約 | 目的別commit、承認7発話＋比較8区間の完成動画・ローカル自然終端を確認。**PR動画再生/最新CI/ユーザーレビュー/マージ待ち**。本番未更新 |

## 曲・音の進行

| 対象 | 制作/接続 | 技術確認 | 聴感/採否 |
|---|---|---|---|
| normal「月下の歩み」24秒 | score/音源・本編接続済み | 素材QA、実Worker再生、通常原WebM音声確認 | PM技術合格、ユーザー聴感待ち |
| battle「一閃への決意」54秒 | 全結果共通曲・表示時計へ接続 | 勝/負/復活、先読み、PUSH/無音窓、正規戦闘体験の原WebM確認 | 同上。復活延長/混合の聴感も別 |
| bonus「暁の祝祭」16秒 | score/音源・本編接続済み | 素材QA、Worker再生、BONUS原WebMと体験からの遷移確認 | PM技術合格、ユーザー聴感待ち |
| rush「月影疾走」40/3秒 | score/音源・本編接続済み | 素材QA、Worker再生、RUSH原WebM確認 | 同上 |
| development / pushPrompt / pushPress / heroHit | 新4用途・本編cue接続済み | 素材/割当/再生QA、前後原WebM。各用途の採否は聴感と分ける | PM技術合格、ユーザー聴感待ち |
| decisiveHit / revival / bonusStart / rushStart | 新4用途・本編cue接続済み | 素材/割当/再生QA。bonusStartは旧chargeと別用途 | 同上 |
| win / rushWin | 既存signature維持 | 48k各4variant計8PCM独立一致、声数上限時の保護を関連testsで確認 | 新ミックスの聴感は未確認 |

## 追加前の証拠と確認範囲（履歴）

根拠は `prototype/reference-review/s9-20261018/` 以下。新HEADへ旧成功を付け替えず、各receiptの保存source/HEADと開始終了を保持します。

### 素材・旧確定音

`audio-v1/manifest.json`の90音源ファイル、11source、派生2資料と実行版module/rendererのSHA/bytesは独立一致。45測定JSONはnonFinite0・peak<1・input true peak≤−2dBTP・MP3 decode0、spectral45件。LUFS分析のみ末尾1秒paddingで、原音源は延長していません。spectral重心を混合音の基音/品質点とはしません。

`signature-sound.js`と`synth-wave.js`はaebe・保存baseline・currentの実byte一致。現win/rushWin各4variantを48kで独立再生成し、`technical-checks.json`の左右PCM8SHAに全一致。制作時rendererとmetadata追記版は別SHAで保存。音源API/再生成条件は[S9_SOUND_DESIGN](S9_SOUND_DESIGN.md)、手順は[S9_OPERATIONS](S9_OPERATIONS.md)に対応します。

### runtime・先読み・固定条件

`runtime/prewarm-ready.json`の全srcは現byte SHAと独立一致。receiptの保存HEAD e048e4cと現40e3は分けます。`focused-prewarm-real.log`相当のreceiptは33pass、`browser-prewarm/verification.json`は390/1440幅でbattle入場pending0/active1、position0.0417/0.0333秒、normal+battle decoded29,952,000B。BGM decoded cache上限32MiBはWorker転送やAudioBufferコピーを含む瞬間プロセスメモリの保証ではありません。直接battleで通常を経由しない場合のlazy生成は留保です。

musicPoseはbattleのpresentation.time絶対位置でPUSHに追従。個別prefsはlocalStorage `tsukikage-audio-v1`へ保存し、mute中のSE境界消費とdispose後のworker無効化を維持。旧padの生成はruntimeから除き、既存の共通無音条件を使用します。browserの実Worker/AudioContextと局所lifecycleの確認を、OS実背景やスピーカー聴感へ広げません。

aebe比でdomain/physics/production-board-profile/board-flow/board-runtime/publicの既存差分なし。app変更は音設定・UI・接続で、抽選/保留/払出/元101・17本採用差/3枚羽根/ガイドなし/通常.18・右.85を変更する差分は確認されませんでした。最終全回帰は別工程です。

### 割当・時間表・素材試聴ページ

[S9_SOUND_ASSIGNMENT](S9_SOUND_ASSIGNMENT.md)は新4曲/8用途・維持・無音を区別。BONUS開始とchargeを分け、castleのbreakthrough追記を反映済み。全音名の作り直しは今回条件ではありません。

`timeline-qa/verification.json`は両幅3結末、光/剣、49.65/50.2/53.3/54/55.7秒、iframe seek/clampがsuccess・errors0。loss53.3秒の無音は共通presentationSilenceWindowsから反映します。DOMの表/時計確認を本編通し再生と同一視しません。

`audition-qa-attempt02/verification.json`は両幅12用途のHTTP/SHA/WebAudio decode・gain/幅・停止切替を確認。自然等速無seek再生はPC24回/mobile4回であり、全用途を両幅すべて自然終端したという意味ではありません。

### 前後13本の原WebM

`scene-before-v1/verification.json`は旧HEAD f9b1322・202入力・6ケース、`scene-after-v2/verification.json`は40e3b597・210入力・7ケース。双方source始終リストexact・success・errors0。after-v2全210入力は現byte SHAとも一致。beforeはaebeと製品src/public/index/vite同byteというPM確認に対応し、旧収録を新製品の回帰成功にはしません。

全13WebMを独立ffprobe/音声全尺decode・volumedetectで確認。全件Opus 48kHz stereo 1stream・probe/decode exit0・平均/ピーク有限の非ゼロ音声。原媒体は無変更。canvas30Hzと実AudioContext音声を等速収録し、DOM操作UIは含みません。波形の存在と人が良いと感じることは別です。

| case | before平均/peak dBFS | after平均/peak dBFS |
|---|---|---|
| normal | −51.5 / −45.0 | −29.2 / −16.6 |
| pressure-loss | −29.4 / −5.1 | −27.9 / −5.9 |
| pressure-win | −27.6 / −5.3 | −26.6 / −5.9 |
| pressure-revival | −26.9 / −5.0 | −26.4 / −5.7 |
| bonus | −27.2 / −5.8 | −23.8 / −5.4 |
| rush | −24.3 / −3.7 | −23.3 / −3.8 |
| battle-experience | 対応する旧収録なし | −25.7 / −5.6 |

この全尺volumedetect値はLUFS/true peakではありません。尺/役割差を残し、数値だけで新旧の聴感品質を順位付けしません。

新版pressure3種の最初の保存sample（表示0.0917/0.0917/0.1秒）はbattle active1/pending0・normal+battleキャッシュ済み。半開窓16.2≤t<17（各8sample）、49.65≤t<50.2（各6sample）、loss/revival53.3≤t<54（各7sample）は全BGM voices0。100ms間隔sampleであり、サンプル間の全PCM完全無音は未証明です。

追加battle-experienceは勝敗fixtureなしの正規「戦闘・PUSH」体験から60.525秒連続収録し、終端BONUS曲position約3.55秒を確認。pressure3種の勝敗fixtureと分け、自然入賞率/全抽選の試験とはしません。

## 最終ローカル回帰とPM判定

製品source40e3を凍結して全692テスト（fail/skip 0）、本番用・プレビュー用ビルドを完了。Chrome155で390×844/1440×900の本番smokeは25画像読込・停止復帰・HTTP/browser error 0、既存の遊技操作と両幅UI回帰も成功しました。記録はruntime/final-validation/です。音色の聴感はこれらの成功で代替しません。

補助のpreview-navigationは、開発用toolsページも巡回するスクリプトをビルド済みプレビューへ向けたため、tools/bake-models.htmlの404で停止しました。対象の指定誤りとして失敗ログを保持し、成功とは扱いません。製品のrelease smokeと新試聴ページQAは別に成功済みで、追加の任意テストは広げません。

PMはAC1〜AC6の実装・技術条件をレビュー候補として受入。AC7の人の聴感、AC8のPR上の動画/最終CI/ユーザーレビュー/集約は別途確認します。ユーザーがレビューするまで音色の最終採用やSprint終了とはしません。

## 改修前の担当WIP（履歴）

|担当|現在/所有境界|次の割当|
|---|---|---|
|PM|前後比較動画とローカル再生、技術受入まで完了|PR動画の掲載/再生と最終CI、ユーザーの試聴フィードバック対応|
|Designer|4曲/8用途/score・動画と媒体QA提出済み|承認範囲の音色/映像の指摘が来た場合に修正|
|Lead|runtime/UI・先読み、全単体と関連画面回帰提出済み|最終CIの不具合があれば原因を限定して修正|
|SM|台帳/運用、独立SHA/割当/音声媒体の照合済み|レビューの指摘と残件をIssueへ整理|

収録と重い検証は同時に行わず、開始終了を担当間で共有します。音源・コード変更時は対象世代を保護し再確認範囲を決めます。未承認の別PBI・新釘探索へ着手しません。

## 履歴（現在の未確認と混同しない）

- 初期runtimeはfakePCM/worker stub 8tests、次に実PCM関連29pass/2.965秒。現在の先読み関連33passとは別記録です。
- after-v1の初回生成待ち約0.8秒は保護し、先読み後after-v2に成功を付け替えません。
- 初回readの「50.2秒の表境界不足」は誤指摘として撤回。既存strike:resolve cueが50.2秒にあり、境界に含まれます。現DOM QAで復帰表示を確認済み。loss53.3不足は別途共通定義で対応済みです。
- 提案当時の開始未承認、台本未承認、光/役物列未実装は当時の状態。現在は開始済み、台本7文をユーザー/公式CLI承認後に7WAV/timeline生成、実engine API由来voice-policyを保存済みです。

## 終了と対象外

最終動画は106.033秒・8,644,762bytes。全編decode成功、7発話と8比較区間の実AAC非無音、実映像の代表場面を確認。Braveの新規動画タブで通常速度・音声あり・シークせず106.090667秒の自然終端（AAC末尾込み）を確認しました。媒体SHAと実測はpr-video/VIDEO_VERIFICATION.json、local-playback.jsonです。人の聴感/端末差、PRplayer、最新CI、ユーザーレビューとrelease/0.3.0へのマージは別の残件です。新ナレーション本文/声の変更は既存承認条件に従います。S8の個別動画免除をS9へ流用しません。

固定週期間を設けず合意範囲の受入と集約でS9を終了。#27/専用編集器/#25全体/#28全体/新釘探索は対象外。S7〜S9集約後のmain/公開・CDは別の既存承認/運用手順で、現在は未実施です。

## 追加分の通常発射収録

`runtime/reel-recording-verification.json`と`runtime/scene-reel-{before,after}-v1/record.json.gz`。元JSONはlossless gzip、復元SHAは`runtime/reel-archives.json`に保存。fead11aの製品src210はgit blob一致、ローカル複製HTMLのscriptパスだけ相対化。追加後src210も収録始終一致。前後各45秒、同じ台・通常強度0.18、BGMだけUI消音、外れ指定・direct表示。発射/球/solverへ注入しない物理通過で各7回ヘソへ入り、専用音は0→7回。回転7回・左右中停止は各6回。軌道完全一致・自然抽選率・聴感の証明へ広げない。最初の入賞の100ms観測から0.3秒前を開始として各12秒を使い、良い結果による抜粋選別をしない。

## 追加動画v2と最終CIの参照先

追加動画は138.033秒・4141frame・1920×1080/30fps、8,034,865bytes、SHA `c11e2681c00be0e5d25c888ab815a18fce9b517fa395f37c6a1384c022e21454`。Remotionで旧発話を変更せず、冒頭32秒に追加5用途の字幕/実音比較を追加。入力始終一致、全尺decode exit0、前後/旧説明の符号化済み音声非ゼロを確認し、抽出した開始・比較・先行説明の実画面をPMが確認。`pr-video-v2/VIDEO_VERIFICATION.json`はpush前の数値受領記録で、自然再生と新HEAD CIの実行後判定は[PR39本文/Checks](https://github.com/sintaro-katuta/silverball-chronicles/pull/39)を正本とする。過去feadの成功を新HEADの合格へ転記しない。聴感採否とユーザーPRレビュー/マージは別。
