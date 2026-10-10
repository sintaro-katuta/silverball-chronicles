# S5 釘配置ツール UI 実装・確認

2026-10-10。Issue #22、Sprint開始承認後の開発用ローカルツール。UI目的コミットは `07fe335`。本編UI・本編配置は変更しない。

## 実装

`prototype/dev/pin-layout.html` と `prototype/src/dev/pin-layout-ui.{js,css}`、`pin-layout-ui-worker.js` を担当。Lead所有の model/measurement/source moduleへ接続する。共有釘/球textureを本編盤面と同じ倍率で使用し、固定部材・接触輪郭はmodelデータから描く。

配置編集／同条件比較の2モード。釘ID、群、役割、半径、反発を表示し、許可地点を選択して移動する。全群候補の薄点、選択群候補の輪、禁止領域のハッチ、固定輪郭、変更前の菱形と変更線、差分表で情報を区別する。パン・拡大はドラッグに加えDOMボタンを提供する。固定ヘソ・禁止地点・他釘の基準地点をcore判定で拒否し、理由を表示する。

保存／読込はLeadのSHA付きexportLayout/importLayoutを使用する。基準復元は未保存時の確認を挟む。基準・候補・制約SHAと制約版を表示し、101本を保持する。格子はPM採用の原点(22,180)、間隔4 logicalであり、実測寸法や球の安全通路の保証とは扱わない。

比較はworkerで実measurementを呼び、基準／候補×2種×3位相の12行、実物理時刻1秒ごとの保存フレームを表示する。条件・SHA・流路・入賞・無入賞区間・排出・残球・計数を対応づける。コードSHAはsimulation input限定。比較前後にsource manifestを検証し、不一致は結果を拒否する。計測中の配置変更でworkerを停止し、requestID・候補SHA・現在SHAの一致を検査する。条件一致を配置採用と説明しない。

## 今回の実操作・実見

証拠は隔離 `prototype/reference-review/s5-2026-10-10/ui/`。`review.json`、実行版 `review.executed.mjs`、390/1440のbaseline/edited PNGを保存。Node24.21、Chrome154で短UIの実操作がexit0、owned Chrome終了。UI4ファイルとbackend3ファイルの始終SHAが一致する。

両幅で101本の読み込み、許可地点への1本移動、差分1行、未定義地点の拒否、ページ横溢れなしをassertした。最新1440-edited/390-baselineを実見し、盤面全体・候補地点・禁止ハッチ・選択属性・差分表の読み取りを確認した。初版の固定canvas幅によるスマホcropと釘texture倍率をUI内で修正後に取得した証拠である。

これは短UI確認のみ。保存・復元・再読込、12条件計測、流路再生、計測中変更時のキャンセルの実操作は、PM所有 `prototype/tests/pin-layout.browser.mjs` の新固定実行で判定する。初版へのHMR中のPMテスト失敗は独立履歴であり、短UI成功へ混ぜない。実機・聴感・自然抽選の遊技結果は未検証。

## 動画と残作業

7文草稿は `docs/agile/s5-video/script.md`。CLIでJSONとclean Markdown、pending review stateを作成した。発話承認待ちのため、音声合成・dependent Remotion scene・renderは未実施。承認後、差分・拒否・保存再現・実計測を示す動画素材へつなぐ。測定表や図解を実プレイ映像の証拠と取り違えない。

### 固定後の実装レビュー修正

`4f2d8cc`：計測開始ごとにworkerを新規作成する。各trialで新しいsimulation moduleを読み込み、前後のraw SHA検証と古いworkerのmodule cacheを混同しない。

`5057d9a`：配置変更・再計測・計測エラーで旧結果・条件・流路・時刻表示を消す。初期workerは再生app初期化後に作成する。実フレームの銀玉textureも本編と同じ物理半径に対応する表示倍率へ合わせる。今回の短UI証拠は07fe335に対応しており、この2修正の実動作は新固定PM browserの証拠で判定する。

### キャンセル操作の追加検証

`ui-fresh-worker/`に別世代の短検証を保存。両幅で実DOMの計測開始→編集へ戻る→基準復元を操作し、worker停止、result null、条件欄/再生選択肢空、時刻「未計測」をassertした。exit0・owned Chrome終了、UI/backend7ファイルの始終SHA一致。これは計測開始後のキャンセルと旧表示消去の確認であり、12条件が正常完走する証拠にはしない。

### 完走比較の実表・画像レビュー

PMの新固定browser `prototype/.cache/release/pin-layout-tool-attempt02/` はpin1→grid:12:77に統一。baseline ef5ec8…、candidate a86304…、constraint a572ec…を実JSONで照合した。12runが条件一致・計数/会計整合、simulation source59161a…は前後一致。1440-comparisonと390-editedを実見し、条件・表・流路と全面・差分の読み取りを確認した。これはPM実browserの証拠であり、旧HMR失敗や短UIとは世代を分ける。

UIの表「入賞」は発射＋排出待ちの合計、無入賞区間は発射中の実観測窓。finite位相.175の入賞21と発射観測窓の入賞20を混同しない。表「排出」は処理済み総数だったため、PM指示で`c306788`にて「処理済み（入賞含む）」へ改称。保存frameのfloat誤差には1e-8秒だけ許容し、指定12秒が保存11秒へ落ちるのを修正した。CPU生ログは不変、この表示修正の短確認はPM担当。

raw操作録画は `prototype/reference-review/s5-2026-10-10/ui-video/` に保全。実DOMで基準→pin1移動→未定義地点拒否→保存→復元→同SHA再読込を実施。末尾の比較画面は未計測状態であり、完走結果を録ったとは扱わない。相対出力でclone rootのreference-reviewへ保存した原本を保持し、同bytesコピーと対応表copy-provenanceをprototype側へ保存。新台詞・dependent scene・合成・renderは未実施。

## 保存形式補修に伴う証拠の世代

旧ui/、ui-fresh-worker/、ui-video/とPM browser attempt02は、旧保存形式の実行履歴として保持する。跨環境でexact geometry SHAが変わる問題の補修後の保存互換性を、旧JSON成功だけで合格としない。新UIはformatVersion2と安定制約定義SHA、exact engine geometry SHAを区別し、geometry差だけなら警告付き読み込み、現在の制約不正・基準/配置/定義不一致なら拒否する。新短操作と録画は別v2フォルダへ取得する。7文台本は不変、音声承認待ちは継続する。

### 新形式の短QA・新raw素材

UI目的コミット `4ba4dfc`。Leadのbackend v2固定後、`ui-import-v2/`に別証拠を取得した。Chrome154、390/1440の実保存formatVersion2→復元→同SHA再読込を確認。実Node24生成のpin1→grid:12:77 exportを読み込み、制約定義SHA ed0d47…は共通、Chrome geometry e420f9…／Node geometry cf1fb3…の差だけを黄色警告として表示する。synthetic geometry差を実跨環境結果へ転用しない。旧形式・未定義地点を含む配置は拒否し、元の候補SHA a86304…を保持する。両幅errors0・始終source一致・exit0・owned Chrome終了。両幅warning PNGを実見し、警告と制約/geometry/本編未採用の識別欄が読めることを確認した。

`ui-video-v2/`は旧動画を上書きしない新format2の操作録画。基準・移動・未定義地点拒否・保存・復元・同SHA再読込・実Node geometry警告を実操作で記録した。WebM SHA `14a61663c693ae6f04f39ebbec313b904fb57cb94aeea39036cc0f7aaae071ad`、source始終一致、errors0・exit0・owned Chrome終了。実動画1/4.5/11.5秒の抽出PNGを実見し、基準・拒否・geometry警告を確認。全尺動画鑑賞とは区別する。末尾の比較画面は未計測、物理12条件再試射はしていない。

指定12秒のframe表示は、PMの新default browserで最終確認する。新UIを旧完走結果の画像へ付け替えず、表示修正と旧生ログ不変の系譜を保持する。7文台本とpending reviewを変更せず、音声合成・Remotion scene・renderは未実施。
