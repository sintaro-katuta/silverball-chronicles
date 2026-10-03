# PlayCanvas移行記録

最新：ユーザーの全面ドット絵指示を優先し、PixiJS移行準備へ進む。素材はユーザー検討待ち。遊技更新と座標をエンジンから分離したが、現在の表示は比較用に維持。以下の折衷構成継続方針は履歴であり最終方針ではない。詳細は `migration-prep/README.md`。

2026-09-29 現行：ユーザーの折衷構成の指示により、遊技盤面と可動機構のPlayCanvasを継続し、通常液晶のドット絵調素材・PixiJSのフロア一覧と組み合わせる。全面PixiJS移行を完了目標として扱わない。クラウド未更新。今回の実装・証拠は `reference-review/hybrid-2026-09-29/REVIEW.md`。

2026-09-25。ユーザー採用方針：最終的にゲーム全体をPlayCanvasへ移行し、Editorで部品を作り込める構成にする。

## 現在の実装

- ゲーム本体の3D描画はPlayCanvas 2.22.4。`src/scene.js` が筐体・釘・入賞口のGLBを読み込み、玉・風車・扉・RUSH始動口・筐体発光を更新する。
- `src/title-art.js` の立体文字もPlayCanvas。元の文字輪郭をGLB化し、色別の材質と既存の登場動作を適用する。
- ゲーム更新はPlayCanvas Applicationの`update`イベントから呼ぶ。既存の120Hz物理、時間上限、ポーズ、非表示時の停止を維持する。
- 抽選・賞球・ステージ・保存・音は既存ロジックを利用。ゲーム内UIはDOM、戦闘イラストの合成はCanvas 2Dを継続している。これらまでEditorのEntityとして編集できる段階ではない。
- ロード画面で画像と選択コースのGLB・文字GLBを準備する。失敗時の再試行・中断に対応し、準備完了前に遊技を開始しない。
- `/parts.html` もPlayCanvasへ移行。右ユニット・一般入賞口・全体を、通常・RUSH・大当りで確認できる。
- `src/` にThree.jsの実行時importはない。Three.jsは`tools/legacy/`で既存造形を書き出す開発用依存としてのみ保持する。

## 構成と座標

`src/playcanvas/runtime.js` がApplication、カメラ、環境反射、GLBロード、リサイズ、破棄を管理する。各表示のApplicationにEntityを明示的に所属させる。素材の材質はインスタンス用に複製する。

この台では既存の盤面座標を維持し、`x−210, 340−y, z`をPlayCanvasの座標へ写す。独自の2D接触計算を利用し、Engineのメートル単位の剛体シミュレーションへ置換していない。角度APIへは度に変換して渡す。

コース0のGLBを公式`inspect-glb`で検査：静的頂点境界は最小`[-232,-377,-20]`、最大`[232,361,55.425]`、寸法`[464,738,75.425]`。盤面の意図した基準点を使うため、自動接地・中心補正は行わない。正面は+Z側から見る。通常画面は既存の460×740投影を維持する。

## 素材の再生成

1. `prototype/`で`npm run dev`。
2. 別ターミナルから`node tools/bake-models.mjs`。
3. `node --test tests/playcanvas-assets.test.js`。

書き出し元は`tools/legacy/`、出力は`public/models/course-{0,1,2}.glb`、`title-glyphs.glb`、対応メタデータ。物理配置を変更したら盤面も再生成する。テストは古い盤面と新しい物理の食い違いを検出する。

現在はコースごとに約8MB、立体文字約27MB。GLBの圧縮・重複削減と画像素材約158MBの軽量化は未実施。モバイル実機での通信量・GPUメモリ・フレーム時間の計測も残る。

## Editorへの移行で残る作業

- PlayCanvas Editorのプロジェクト作成・接続は未実施。ローカルEngine版とクラウドEditorの進捗を混同しない。
- 生成したGLBは部品階層・材質付きでEditorへ取り込める素材。`gatePanel`等の可動部名を保持する。
- Editorのテンプレート・Script属性として部品パラメータを公開する。
- 液晶・図柄・保留・演出文字の編集フローを統合する。
- 全体移行の後、右ユニットの造形改善を行う。エンジン移行そのものは造形の完成を意味しない。

## 公式スキル

ユーザー指定の[playcanvas/skills](https://github.com/playcanvas/skills)をプロジェクトの`.agents/skills/`へ導入。今回利用：`build-app`、`apply-conventions`、`inspect-glb`、`light-scene`。本作の美術・ゲーム仕様には引き続き`web-pachinko-design`と`pachinko.md`を適用する。

## 今回の検証

- 既存の単体テスト105件と、新規のGLB・物理配置／文字網羅テスト2件が通過。
- `browser-smoke`、`scene-geometry-smoke`、`cinematic-smoke`、`components-loading-ui-smoke`、`playcanvas-ui-smoke`が通過。
- Chromeの390×844表示で通常、アタッカー開放、戦闘各区間、部品プレビューを実際に表示・撮影して確認。3コースともPlayCanvasのRender Componentは390個。通常時の例は約382 draw calls。
- DPR 2でバックバッファ幅733、CSS幅367を測定し、指定倍率に対応することを確認。モバイル実機のFPS保証ではない。
- 液晶の透過を阻害する環境背景、発光の加算方式、終了時の玉Entityと材質の解放を修正。ブラウザ実行時にThree.jsを要求しないことも確認。
- `npm run build`成功。Engine由来の大きいJSチャンクと未使用Node workerの外部化警告は残る。音の聴感、スマホ実機、クラウドEditorは未検証。

移行後は環境反射・トーンマッピングが変わるため、旧版と完全な画素一致は主張しない。盤面下部の明度・金属の反射と文字のハイライトは、次の美術調整で比較する。

## Editor準備の追加（2026-09-25）

アカウント登録済みの連絡を受領。プロジェクトURL・クラウド接続はまだ未確認。

- `src/playcanvas/right-unit.mjs`のEngine Scriptへアタッカー・RUSH始動口の開閉描画を分離。実ゲームから同じ物理状態を渡す。4つの発光値をEditor属性として宣言。
- `npm run export:editor`で3コースのGLB・本番部品スクリプト・Editor向けプレビュー制御・手順書を`builds/playcanvas-editor/`へ出力する。これは部品取り込み用で、ゲーム全体のクラウド移行完了を意味しない。
- [取り込み手順](EDITOR_IMPORT.md)。EditorのTemplate化・編集結果の取り込みは接続後に行う。
- `tests/parts-pixels.mjs record`と比較実行で、右側・一般入賞口・全体 × 通常・RUSH・大当りの9姿勢を検証。変更前2回の一致を確認したうえで、変更後も各600×800画素のRGBA SHA-256が一致（差分0画素）。比較基準は`/tmp/silverball-parts-pixels.json`。
- `tests/editor-export-smoke.mjs`で書き出しスクリプトの独立初期化、3状態、発光値、終了処理をローカルChromeで確認。実際のクラウドEditorでのParse・Launchは未検証。

## クラウド接続先の確認（2026-09-25）

- ユーザー指定シーン：https://playcanvas.com/editor/scene/2605094
- ログイン済みの「Blank Project | Editor」を確認。初期HierarchyはRoot / Camera / Light / Box / Plane。画面のEngine表示はv2.33.2（ローカルは2.22.4）。
- course-0.glb / right-unit.mjs / right-unit-preview.mjsのアップロード操作は、自動承認レビューが具体的なファイル送信の承認不足として拒否。アップロード完了は確認されていない。ユーザーの明示承認を受けてから再開する。
- 次の検証：ファイル取り込み、ESM属性のParse、右ユニットの配置、Launch。Engineバージョン差も実際の起動で確認する。

### アップロード承認後の接続状況

ユーザーが上記3ファイルの送信を明示承認済み。再承認は不要。送信操作中のブラウザ切断から復旧したが、再試行でfileChooser.setFilesが `Not allowed` を返した。Editor AssetsはSkyboxのみで、3ファイルの登録は未完了。現在の障害はブラウザ拡張のファイルアクセスで、ユーザー承認不足ではない。BraveのChatGPT拡張にある「ファイルのURLへのアクセスを許可する」設定を確認後、同じシーンへ再開する。

## クラウドEditorへの初回取り込み完了（2026-09-25）

ファイルURLアクセス設定後、ユーザー承認済みの3ファイルをアップロードできた。

- Project 1607422 / Scene 2605094: https://playcanvas.com/editor/scene/2605094
- 起動プレビュー：https://launch.playcanvas.com/2605094?debug=true
- `course-0.glb`は材質・テクスチャ・Render素材・`course-0` Templateへ展開。TemplateのインスタンスをRoot配下へ配置。
- `right-unit.mjs`と`right-unit-preview.mjs`を登録。`right-unit` EntityへScriptと`rightUnitPreview`を割り当て。属性`mode`をnormal/rush/bonusで切り替え、通常へ戻した。
- カメラは位置(0,0,900)、回転(0,0,0)、Orthographic、Ortho Height 400、Near .1、Far 2000。Box / Planeと通常時に不要なcinematic-crestを無効化。
- Editor下部v2.33.2はEditorの表示。Launchの実行ログでは **PlayCanvas 2.22.4 b5b9839** を確認した。先のメモでこれをEngineバージョンと解釈した箇所は訂正する。
- Launchで通常・RUSH・大当りを目視確認。実行中の一時ログでnormal: gate [149,-247.5,27], open false, inlet .12 / rush: 同座標, open false, inlet 1.8 / bonus: gate [119,-254.5,27], open true, inlet .12。検証ログはコードから除去し、ローカルの元プレビューコードへ戻した。
- Runtime errorログは0。`Ignoring invalid StandardMaterial property: alphaDither null`の警告あり。材質のインポート互換性調整は残る。
- Editorのテキスト属性はfillだけでは保存が確定しない場合があった。実キー入力とEnterで保存を確定し、Launchの状態変化まで検証。modeは現環境ではテキスト入力欄として表示される。

これは筐体・可動部のクラウド配置と動作確認まで。液晶画像、立体文字、玉、抽選・賞球・UI・保存などゲーム全体のクラウド統合は未完了。照明・背景はBlank Project側の設定を利用している。部品用Templateの独立化、Editorの編集結果をローカルへ戻す仕組みも残る。

## 運用方針の変更（2026-09-25・ユーザー確定）

今後はローカル開発を優先し、クラウドへのアップロード・更新はユーザーから新たに明示許可を得た場合のみ行う。クラウドへ上げる場合も最後にまとめる。既存のEditorは今回のローカル改修に同期しない。

## アタッカーのローカル外観改修

大きな金色面を紺の金属扉へ変更し、銀の縁、真鍮の細い装飾、中央ダイヤ、ヒンジ、段差のあるケースを追加。旧造形ツールはオフライン素材生成だけに使い、ゲーム実行は引き続きPlayCanvas。`node tools/bake-models.mjs --boards-only`で文字素材を触らず3コースを更新できる。

確認：assets単体2件、components-loading-ui-smoke、scene-geometry-smoke、build成功。390×844の通常ゲームと部品プレビューの通常・RUSH・開放時を撮影。閉鎖時の青鋼の面と銀縁、開放時の暗い口・細くなった扉を目視確認。既存テストで実球の入賞も確認。スマホ実機・聴感は対象外。既存の大きいJSチャンク／worker外部化のビルド警告は継続。

今回クラウドは未更新。Editor向けbuildsのパッケージも再生成していないため、公開・アップロード許可を受けてから最新素材で作り直す。
