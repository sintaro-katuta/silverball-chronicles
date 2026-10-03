# SAO アリシゼーション 夜空 — Unity prototype

Unity 6000.4.6f1。ユーザーの2026-09-25の依頼により、従来のPlayCanvas試作から独立したUnity版を作成。実機の完全再現ではなく、公開スペックを使ったローカル制作中の試作。

## 開く

- Unity Hub → Add → この `unity-yozora` ディレクトリ。
- `Assets/Yozora/Scenes/Yozora.unity` を開き、Play。
- ブラウザ：`prototype` で `npm run dev` → `http://localhost:5173/sao-unity.html`。
- Unity Web用バイナリは `prototype/public/unity-yozora/` に出力。ページは実際のUnity WebAssemblyを読み込む。以前のJavaScript試作への代替表示は行わない。

## 操作

ブラウザ下部に発射開始／停止、一時停止／再開、250玉補給、PUSH、斜め視点、音ON/OFF・音量、リセット、試演シーンを用意。試演を選ぶと現在のUnity台の遊技をリセット。試演速度は1／4／8倍で、4／8倍中は音声を停止する。0・8図柄の表示試演も選べる。タブが非表示になった後は再開操作が必要。

## 編集

筐体、釘、レール、衝突面、入賞センサー、キネマティック回転体／振分板／アタッカー、カメラ、照明、Canvas液晶をシーンの階層で編集できる。玉は `Prefabs/SteelBall.prefab`。設定値はYozoraMachineコンポーネント。

`Yozora/Create editable machine scene` は**生成シーンとGenerated素材を作り直す**。手編集したシーンは別名保存してから使う。`Yozora/Build Web` は現在保存されているYozora.unityをビルドする。

## 構成

- `YozoraRules.cs`: 公開確率・振分、保留、当落、ST、払い出し。
- `YozoraMachine.cs`: 発射、物理入賞、表示同期、ポーズ、ブラウザコマンド。
- `BallBody.cs`, `PocketSensor.cs`, `RotorDrive.cs`: PhysXでの玉と役物。
- `ReferenceSequenceTimeline.cs`, `ReferenceSequenceView.cs`: 参照動画を基に再構成した代表リーチの進行・カット・音イベント。
- `ReferencePresentation.cs`, `RushSymbolLayout.cs`, `SpecialSymbolGraphic.cs`: 通常／RUSH／0・8図柄とAmayori表示。
- `YozoraSoundscape.cs`: 新規合成BGM・効果音、音量と一時停止。
- `Editor/ReferenceCabinetBuilder.cs`: 成形レンズ・外枠・PUSH・剣などの装飾造形。
- `Editor/FairMechanismBuilder.cs`: 5玉振分と水平6ポケットの機構生成。
- `Editor/YozoraBuilder.cs`: 編集可能なシーンの作成とWebビルド。
- `Editor/YozoraValidation.cs`: 抽選／払い出し／図柄整合・演出タイムラインの検証とFAIR検証の実行。
- `Assets/WebGLTemplates/Yozora/`: ブラウザ操作部、読み込み表示、Unity起動。
- `Assets/Plugins/WebGL/YozoraBridge.jslib`: 読み取り用の遊技状態通知。

## 素材

`Art/alicization-fan-art.png` は今回生成した非公式ファンイラスト。公式の実機映像や原画を取得したものではない。実機声優音声・楽曲は未収録。現在は新規合成の通常／RUSH用BGM、釘接触・発射・入賞・予告・斬撃・PUSH・当落等の効果音を使用する。実機音源と一致するものではない。

日本語フォントは Noto Sans CJK JP（SIL Open Font License、`Fonts/LICENSE.txt`）。

## 実機との差

抽選は既存の [公開スペック調査](../prototype/reference-review/yozora/IMPLEMENTATION.md) に基づく。通常1/199.9、右1/51.6、53回／70回、300／1500玉単位のDRIVE。保留4、モードを跨いだ保留破棄、R間0.65秒などは仮設定。電チュー・V入賞・内部時短の厳密制御は未再現。

玉は半径5.5mm・質量5.4gのRigidbody。Z軸固定をせず、表裏のガラス接触面とピン・レールで運動を制限する。一般の盤面区間は初速と重力・接触が軌道を決める。下記FAIR選別・搬送区間には拘束ガイドを併用する。実機の材質値・寸法・釘配置を計測したものではない。

FAIR STARTは選別部を通過した5玉目を拘束ガイドで水平6ポケットへ送る方式。6ポケット中2個を当りとする。全発射玉の5玉目が必ず入るという意味ではない。自由物理だけで実機の振分装置を再現したものではなく、実測入賞率・正確な材質や寸法は未校正。

代表リーチは通常150秒、右打ち23秒。提供された編集済み実戦動画の時刻と場面を基に再構成し、新規イラスト・画面切替・術式・斬撃を同期させる。動画の編集点を含むため、全実機変動の尺やカット割りが一致するものではない。通常0／8の表示試演とRUSHのAmayori図柄を追加したが、特殊図柄の実機出現条件や全リール制御は未再現。

原作の全映像・音声・楽曲、精密な役物、告知カスタム、隠し演出は未再現。

クラウドへのアップロードは行わない。

## Webを再ビルド

```sh
./unity-yozora/build-web.sh
```

保存済みシーンからビルドする。Unity Editorで同じプロジェクトを開いている場合は、Editorメニューの `Yozora/Build Web` を使う。ログは `/tmp/yozora-unity-web-build.log`。gzip圧縮とUnityの展開フォールバックを利用するため、ローカルViteでも読み込める。

シーンの自動再作成まで含むCLIは `-executeMethod YozoraBuilder.BuildWeb`。こちらは手編集を上書きするため、通常の再ビルドには使わない。

## 旧版の検証記録（2026-09-25）

以下は初版の記録であり、現在のFAIR・筐体・演出・音の検証結果ではない。

- Unity 6000.4.6f1 Webビルド成功。C#ルール検証10項目成功。Vite production build成功（既存PlayCanvas由来のチャンクサイズ等の警告あり）。
- 最終ビルドをローカルBraveで実際に操作。通常29発、接触426回、FAIR受入28玉／当りポケット9玉、完了スタート4、保留4。これは動作確認の1サンプルで、入賞率の校正ではない。
- 一時停止後、shots・contacts・stock・activeTimeが変化しないことを別時点の読み取りで確認。
- 初当り300玉試演：物理入賞20カウントで300玉を払い出し、ST53へ移行。移行後の右始動賞球を含む観測値はpayout302、remaining53。その後のST消化も確認。
- 正面／斜め視点の画像を確認。リセットで2500玉・発射0・盤面玉0・通常・自動発射OFFに戻る。ブラウザエラーログなし。
- 配信本体は圧縮後約27MB。モバイル実機の性能、音の聴取、全演出の画面検証は未実施。

## 旧版の改修履歴（2026-09-25 追加依頼）

[追加調査と反映表](../prototype/reference-review/yozora/REFERENCE_ALIGNMENT.md)。公式機種資料・フェアぱちんこ説明・公式PVの抽出画像・DMMの拡大写真を照合。液晶比率と外装、中央FAIRへの通路、人物図柄、結晶保留を変更。`ReferencePresentation.cs` は結果を変更せず画面構成を担当し、`ReferenceShape.cs` は液晶と図柄のクリップ形状を担当する。

`Art/symbol-portraits.png` も今回生成したファンアート。実機画像をゲームへ転用したものではない。9候補のST表示を追加したが、実機の5ライン選択制御・全人物図柄・カスタム・音は未完成。FAIRの回転軸や5玉振分の物理機構も近似のまま。上の初版検証記録は旧レイアウトの結果なので、追加改修の検証は反映表末尾を参照。

### 提供動画との追加照合・旧版記録（2026-09-26）

`../prototype/reference-review/yozora/user-video-2026-09-26/ALIGNMENT.md` に動画時刻、今回の変更、残差を記録しています。`sao-unity.html` の「実機動画と比較」では、ローカルMP4をブラウザ内で開いて指定時刻と見比べられます。

新規素材は `Art/normal-symbols-video.png` / `rush-symbols-video.png` / `academy-video.png`。実機原画そのものではありません。RUSH図柄は6種類の別キャラクターを使い、外れ時の誤った揃い表示を防ぐ検証を追加（ルール検証合計12件）。完全一致・全演出再現は未達です。

## 現在の並列改修（2026-09-26）

上記履歴の後に、FAIRの5玉振分と水平化、筐体再造形、通常150秒／右23秒の代表リーチ、新規合成BGMと効果音、0／8・Amayori表示を実装した。筐体の観察と近似箇所は [CABINET_PASS.md](../prototype/reference-review/yozora/user-video-2026-09-26/CABINET_PASS.md) に記載。今回の統合Web検証を完了。通常33発で振分通過32／選別6／FAIR受入6／当り2を確認し、通常リーチの当り・外れ、300玉払出、WoUの右リーチからDRIVEへの移行、0／8表示を操作した。最終修正版では0試演→WoU切替時の誤揃いが消え、下中央にAmayoriが1個だけ出ることを確認。Unityのルール15件・FAIR・図柄整合性と切替回帰検証、Webビルド、Viteビルドが成功。ブラウザerrorログ0件。音の聴取・モバイル・長時間遊技は未検証。詳細は [今回の記録](../prototype/reference-review/yozora/user-video-2026-09-26/ALIGNMENT.md) を参照。

## 2026-09-26 追加動画R2の反映

[追加動画の時刻付き解析・統合結果](../prototype/reference-review/yozora/user-video-r2-2026-09-26/ANALYSIS.md)。5ライン、BONUS単位表示、筐体細部、音の追加タイミング、入力の修正を統合。実機映像・音声の一致、専用リーチ、AWAKENING図柄、BONUS後の物語待機は引き続き未達。最新の検証範囲と担当別残件は解析末尾から参照できる。
