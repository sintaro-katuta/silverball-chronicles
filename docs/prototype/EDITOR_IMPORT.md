# PlayCanvas Editorへの部品取り込み

これは筐体素材と右ユニットの動作プレビュー。ゲーム全体をクラウドへ登録するパッケージではない。

## 生成

`prototype/`で `npm run export:editor`。出力は `../../prototype/builds/playcanvas-editor`。
PlayCanvas Engine 2.22.4でローカル検証。クラウドEditorでの検証はプロジェクト接続後に行う。

## 取り込み

1. EditorのAssetsに`course-0.glb`、`right-unit.mjs`、`right-unit-preview.mjs`を取り込む。2つのスクリプトは同じフォルダに置く。
2. GLBをシーンへ配置。モデルの座標・スケールを維持する。`right-unit`以下の部品名を変更しない。
3. `right-unit` EntityへScriptコンポーネントを追加し、`rightUnitPreview`を追加する。
4. スクリプトをParseし、`mode`の`normal` / `rush` / `bonus`で起動時の姿勢を選ぶ。プレビュー制御が`rightUnit`を生成して状態を渡す。
5. カメラを正投影、位置`(0,0,900)`、回転`(0,0,0)`、ortho height `370`、far clip `2000`にする。光源を用意してLaunchする。縦長の表示領域を使う。ローカルの環境反射・照明はこのパッケージには含まない。

発光値もInspectorで指定する場合は、`rightUnit`を先に追加してから`rightUnitPreview`を追加する。`closedEmission` / `openEmission` / `inletClosedEmission` / `inletOpenEmission`を調整できる。

実ゲーム側は`rightUnit.applyState(physics)`を呼ぶ。プレビュー制御は実ゲームに付けない。形状座標・開放判定は既存Physicsに従い、賞球・抽選を変更しない。

## 接続後に行う作業

- 実際のEditorでインポート・属性のParse・Launchを検証。
- 右ユニットをTemplateとして管理し、Editorからの変更をローカル版へ戻すフローを作る。
- 液晶・UI・ゲーム制御と素材ロードを統合し、ゲーム全体の起動を確認。

プロジェクトURLだけで認証・編集権限が付与されるわけではない。接続時に利用可能なログイン済みEditorまたは連携手段を確認する。

## 接続済みシーン

2026-09-25に[Scene 2605094](https://playcanvas.com/editor/scene/2605094)へ上記3ファイルを取り込み済み。CameraのOrtho Heightは余白を含め400。`right-unit`のScript > `rightUnitPreview` > `mode`にnormal / rush / bonusを入力・Enterで確定し、Launchで確認できる。現在はnormal。

実行時はEngine 2.22.4。通常・RUSH・大当りの動作確認済み。液晶やゲームロジックの移植は未完了で、現シーンは部品プレビュー。詳細は[移行記録](PLAYCANVAS_MIGRATION.md)末尾。
