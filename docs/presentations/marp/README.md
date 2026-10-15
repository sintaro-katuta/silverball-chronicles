# 個人開発紹介

## 発表する（インストール不要）

リポジトリをクローンしたら、このフォルダの **[index.html](index.html)** をChromeやEdgeなどのブラウザで開く。

```text
docs/presentations/marp/index.html
```

Marp・VS Code拡張・Node.js・ローカルサーバーは不要。表示用HTML、画像、図、サムネイル、MP4動画をGit管理している。フォルダをコピーして持ち運ぶ場合は、`index.html` と `assets/` を一緒にコピーする。

- 次・前のページ：右・左矢印キー、または画面下の操作ボタン。
- 全画面：画面下の全画面ボタン（ブラウザの全画面操作も利用可能）。
- 発表者表示：画面下の発表者表示ボタン。各ページの短いキーワードメモを表示。
- 11枚目の動画：再生ボタンで開始。ローカルのMP4を使用する。
- スライド表示、図、動画、虹色の文字アニメーションはオフラインで利用可能。
- Steamのプレイ履歴やYouTubeの外部リンクを開くときは通信が必要。
- フォントは各PCにある日本語フォントを使用するため、環境によって字形は多少変わる。

発表用メモ一覧：[発表メモ.md](発表メモ.md)。出典・技術上の長い補足は[参考資料・補足.md](参考資料・補足.md)と各資料に分けている。

## 原稿を編集する

原稿は `slides.md`、スタイルは `themes/base.css`。このディレクトリで実行する。

```sh
npm ci
npm run dev
```

`npm run dev` は原稿とテーマを監視し、`dist/slides.html` のプレビューを開く。VS Codeでは推奨拡張「Marp for VS Code」も利用できる。

編集後は次を実行し、更新された `index.html` と原稿・素材を一緒にコミットする。

```sh
npm run build
```

`npm run build` はGit管理する `index.html` と、配布用の `dist/slides.html`・`dist/assets/` を更新する。`node_modules/`・`dist/`・採用前の背景画像はGit管理しない。

PDFが必要な場合：

```sh
npm run pdf
```

PDF書き出しにはChrome等のブラウザが必要。PDFでは動画・アニメーションは動かない。

## 図やジャンルの集計を編集する

図のPNGは同梱済みなので、発表や通常のビルドで再生成する必要はない。

- `diagrams/roguelike.mmd` と `diagrams/pachinko.mmd`：`npm run diagram`。箱の中心と接続線を水平・垂直に整列してPNG化する。
- `diagrams/silverball-game-flow.mmd`：`node scripts/render-silverball-flow.mjs`。
- `diagrams/soshina-overview.mmd`：`npm run diagram:soshina`。
- 図の描画設定：`diagrams/mermaid.json`。再生成時だけ `diagrams/puppeteer.json` のChromeパスを使用PCに合わせる。
- `data/steam-playtime.json` と `data/game-genre-classification.json`：ジャンル別累計時間の元データ。`npm run genres` または `npm run build` で、円の面積がプレイ時間に比例する図を更新する。分類の記録は `GAME_GENRES.md`。

画像の生成経緯・プロンプトは `IMAGE_PROMPT*.md`、動画とサムネイルの記録は `MEDIA_SOURCES.md`、ゲームフローの根拠は `GAME_FLOW_SOURCES.md`。
