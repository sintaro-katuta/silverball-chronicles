# 部品単位の制作と開始前ロード

2026-09-25更新：描画基盤をPlayCanvasへ移行。実装状況・Editorに残る作業は [PlayCanvas移行記録](PLAYCANVAS_MIGRATION.md) を参照。

| ファイル | 担当 |
| --- | --- |
| `src/scene.js` | PlayCanvasの盤面、玉、風車、右ユニット、発光、部品プレビュー |
| `src/playcanvas/runtime.js` | Application、素材ロード、カメラ・照明、リサイズ・解放 |
| `src/title-art.js` | PlayCanvasによる立体文字 |
| `public/models/course-*.glb` | 各コースの筐体・入賞口・釘・部品階層・材質 |
| `src/playcanvas/board-metadata.json` | GLBと物理配置の対応 |
| `tools/legacy/`、`tools/bake-models.*` | 旧造形から素材を生成する開発用ツール |

`/parts.html` で右側ユニット／入賞口／全体、通常／RUSH／大当りを比較する。保存データは変更しない。材質はモデルのインスタンス用に複製し、他のコースや表示と共有しない。開閉は既存の物理状態へ同期する。

開始前に液晶画像52点と、選択コースのGLB・文字GLB・文字表示の初期化を準備する。進捗は55工程の完了数で、通信バイト数ではない。準備中にゲームは進行しない。失敗時の再試行とコース選択へ戻る操作に対応する。

部品プレビューは製品ビルドにも `parts.html` として出力する開発確認用ページ。遊技画面からのリンクや報酬保存は持たない。クラウドのPlayCanvas Editorとは別のページ。

次はEditorへの部品登録、右ユニットの造形改善、画像とGLBの容量削減、モバイル実機の負荷確認を行う。

### Editor用の右ユニット

`src/playcanvas/right-unit.mjs`が開閉描画を所有するPlayCanvas Script。`Machine`は物理状態を渡し、部品内で扉・カバー・発光を更新する。`npm run export:editor`と[Editor取り込み手順](EDITOR_IMPORT.md)でクラウドへ持ち込む素材を準備できる。クラウド側の登録・Template化は未完了。
