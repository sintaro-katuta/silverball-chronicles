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
