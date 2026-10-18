# S9 音源・接続・試聴の受入台帳

## 最新状態（2026-10-18）

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

## 正式計画のACと現在判定

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

## 担当WIP・次のReady

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
