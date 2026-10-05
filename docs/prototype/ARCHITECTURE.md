# 月影機関のアーキテクチャ

2026-10-06。開発対象は月影機関の台のみ。独立したSAO夜空のWeb版・Unityプロジェクト・Webビルド・専用テスト・専用レビュー資料を削除した。月影で採用した考え方の履歴は残す。抽選・保留・払出・演出尺・物理パラメータは変更していない。

## 起動とビルド

依存導入はルートで `npm --prefix prototype ci`。`npm run dev` で開発サーバーを起動し、`/` から本編を開く。`npm test` は単体・統合テスト、`npm run test:browser` は起動済みサーバーに対する本編の操作確認（Chromeが必要）。確認先は `REVIEW_URL` で指定でき、既定は `http://127.0.0.1:5173`。`npm run test:previews` で盤面・PlayCanvas部品・演出比較・GLB生成ページの起動を確認する。

`npm run build` は本編だけを `prototype/dist/` に出力する。`npm run build:previews` は部品・演出の確認ページを `prototype/dist-previews/` に出力する。Vite開発サーバーでは `/dev/board-pixi.html`・`/dev/lcd-reach.html`・`/dev/parts.html` などを直接開ける。プレビューは遊技・機構の固定系列を使うため、本番アプリの配布入口から分離する。

## 配置と責務

| 配置 | 責務 |
| --- | --- |
| `prototype/index.html` | 本編の唯一のHTML入口 |
| `prototype/src/app/` | 起動、画面遷移、ユーザー操作、表示の破棄 |
| `prototype/src/domain/` | 遊技状態、抽選済み記録、保留、払出、機種仕様と再構成policy |
| `prototype/src/physics/` | 発射、接触、入賞の境界判定、固定刻みの球更新 |
| `prototype/src/presentation/` | 演出の場面・時間・台詞を決めるデータと純粋関数 |
| `prototype/src/pixi/` | 現行の盤面・液晶・図柄・役物・演出表示とその接続 |
| `prototype/src/ui/` | 台選択フロア、状態表示、画面のCSS |
| `prototype/src/runtime/` | フレームループの開始・停止 |
| `prototype/dev/`・`prototype/src/dev/` | 開発用の確認ページとその起動コード |
| `prototype/src/legacy/` | 月影の旧PlayCanvas画面・旧UI・素材読込みの実装 |
| `prototype/src/playcanvas/` | 月影のPlayCanvas部品、旧素材のメタデータ、共有する機構計算 |
| `prototype/tools/` | 素材生成・Editor用ローカル書出し・移行素材一覧生成 |
| `prototype/tools/legacy/` | Three.jsによるオフラインGLB造形 |
| `prototype/tests/` | 現行遊技・機構・表示のテストと過去方式の回帰検証 |
| `prototype/public/` | アプリが配信する画像・映像・GLB素材 |
| `prototype/reference-review/` | 過去の撮影・動画・ログ・実行用レビュー素材 |
| `prototype/ios/`・`prototype/android/` | 月影のCapacitorアプリ |
| `docs/` | 仕様・設計・調査・レビュー文書 |

`domain/session-game.js` はレンダラーから独立した遊技状態を管理する。`app/main.js` が遊技と表示を作り、`pixi/board-runtime.js` が描画・更新を接続する。抽選済み当落を表示側で変更しない。DOM・PixiJS・PlayCanvas・Three.jsを `domain/`・`physics/`・`presentation/` へ持ち込まない。アーキテクチャテストでこの依存方向とローカルimportの解決を確認する。

今回、描画の中に置かれていた `session-game.js` と `w-runtime-policy.js` を `domain/` に移した。`part-flow-fixture.js` は本編でも球更新に使うため `physics/ball-flow.js` に移した。東京喰種Wの公開情報を基にした機種ロジックは月影の本編が使用しているため保持する。

旧PlayCanvas表示を一括削除しない理由は、部品確認・GLB生成・機構の回帰検証が利用しているため。現行 `SessionGame` も旧 `Game` を継承している。将来、共通の会計・遊技状態を抽出してから旧コース・強化・保存コードを縮小する。旧UIの大量のDOMテストは履歴として残り、既定のブラウザテストには含めない。

## 運用

過去の検証画像・ログを今回の検証結果として扱わない。生成素材・月影のレビュー資料・ネイティブアプリは維持する。クラウドへのアップロード・更新は今回行わない。SAO/Unityの削除済みファイルが必要になった場合はGit履歴から取得する。

## 今回の検証

- 改修前は371件通過。SAO専用9件を除いた月影の362件が改修後もすべて通過。
- 追加のアーキテクチャ検査2件が通過。全ローカルimportの解決と、遊技・物理・演出データからレンダラーへの依存がないことを確認。
- 本番・確認ページの両ビルドが成功。本番のHTMLは `index.html` だけ。確認ページ側には従来からの大きいJSチャンクの警告が残る。
- Chromeで現行本編の開始・発射停止・一時停止・キーボードフォーカス・再開・終了・台選択への復帰を確認。
- 移動後のPixiJS盤面・PlayCanvas部品・リーチ比較・GLB生成ページの初期化を確認。ページ例外とHTTPエラーは0件。

ルートの未追跡 `tmp/` は今回の整理対象に含めない。ネイティブ実機・音の実聴取・クラウド環境は今回の検証範囲外。
