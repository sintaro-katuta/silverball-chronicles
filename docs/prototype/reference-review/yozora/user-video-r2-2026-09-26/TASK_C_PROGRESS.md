# Sprint C：上位RUSH段階・図柄セット・終了内訳

2026-09-26。ソースのみ実装。Unity起動、Editor/CLIビルド、Generated、scene、Web出力、クラウド更新は行っていない。

## 根拠と訂正

R2 `ANALYSIS.md` を読み、`../../../../../prototype/reference-review/yozora/user-video-r2-2026-09-26/drive-reveal-2.jpg`（16:40〜45）、`../../../../../prototype/reference-review/yozora/user-video-r2-2026-09-26/ending-0.jpg`（17:30〜18:50）、単独拡大 `/tmp/yozora-r2/frame-1020.jpg`（17:00）・`frame-1050.jpg`（17:30）を画像として確認。全編連続視聴・音声聴取はしていない。

- 16:39〜45はAWAKENINGの独立ロゴ。INVADINGと段階が異なる。
- 17:00は紫の楕円枠内の8。全人物対応・全番号体系はこの画面だけでは確定できない。
- **17:30の拡大では小文字はEND。従来概観のFINAL表記を訂正。** `Alicization BONUS` も判読できるが、どの内部Award分類に対応するかは不明。
- 18:00は円形RESULT/BATTLE×1。17:30終了と同じセッションの次画面かは編集を跨いで不明。BATTLEを当り回数や消化回転と決めつけない。
- 18:50では整合騎士群とAmayoriが戻る。AWAKENING素材を全RUSHへ固定するのは誤り。

## 担当間のAPI合意

A担当：`LastUpperRushResult` のId/Jackpots/CompletedDrives/Payout。実WoU移行時点からのwin・CountBonus・完了したDRIVEのみ集計。突入契機の出玉と始動賞球/補給は含まない。上位終了時の確定snapshotのみ使う。

B担当：`ReferenceBonusView.BlocksBasePresentation`。BonusまたはBonusPresentation Story/Result/Entranceが前面の場合、Cの結果画面・基底図柄/保留/カットイン/当り線を隠す。上位入口に独自の待機時間は追加しない。実Mode適用後はINVADINGの表示状態を持つだけで、STを背後で消化する追加入口映像を重ねない。

## 実装

- `UpperRushPresentationState`：通常/INVADING/AWAKENING、明示試演フラグ、終了snapshotの表示寿命とリセットを分離。一般的なAWAKENING移行条件が未確定なので、自動抽選条件を追加しない。
- `UpperRushSymbolSet`：専用のdigit/texture/uv/evidence配列をInspectorから供給。未知のAWAKENING人物に旧整合騎士アトラスを流用しない。未素材は数字枠のみの表示試演。観測できた紫8を待機中の一箇所に表示するが、当落や抽選番号は変更しない。
- `RushSymbolState`：段階のrevisionをキーに含め、INVADINGのAmayori・旧当落が別セットへ漏れないよう再初期化。既存5ラインの選択/勝敗整合ロジックを維持。
- `UpperRushPresentationView`：実上位終了はWAR OF UNDERWORLD / END。完成DRIVE回数、上位中の実当り回数、上位開始後の大当り実払出を表示。動画の1/3/金額を固定値で入れない。意味不明な項目に値を割り当てない。TOTALの計上範囲を補助表示する。
- 別RESULTレイアウトは実snapshotがある場合にのみ明示試演。BATTLE×の意味は未確定なので表示しない。FINAL→RESULTの自動連続遷移も捏造しない。
- 終了画面は仮の最大10秒、通常の次変動/Bonus開始時に即座に退避。ルールを凍結せず、進行中の新変動を覆わない。Pause中は寿命を進めない。
- `ReferencePresentation` がBONUS優先順位を統合。AWAKENING試演では未知の戦闘人物の代わりに旧knightカットインを見せず、図柄表示を保持する。

### 後日の操作接続API

`ReferencePresentation.PreviewUpperStage("invading" | "awakening")` は実WoU中でBonus/演出待機がない時のみ成功。

`PreviewUpperResult("final" | "result")` は実終了snapshotがあり通常待機中のみ成功。`DismissUpperResult()` で閉じる。これらは当落/Mode/ST/出玉を変更しない。root所有のMachine/Web操作には未接続。

### 素材manifest

`Assets/Yozora/Art/upper-rush-symbols.manifest.json` に観測済み8、既存INVADING近似、AWAKENINGの不足素材・対応未確定項目・終了項目の意味不明点を記録。数値スロット0〜8はエンジン側の受け口であり実機の完全な図柄一覧とは扱わない。

## 検証

Unityを起動せず、同梱Monoコンパイラで実ソースのルール/段階状態/図柄検証をコンパイルして実行。

- 既存5ライン×9数字×2当落×Amayori有無の180条件が成功。
- 0/8/通常図柄の旧試演から新RUSH待機へのリセット、外れ復帰の誤揃い防止が成功。
- INVADING/AWAKENINGの分離、Bonus/pending中の段階試演拒否、実DRIVE1回/当り1回/実払1500の終了snapshot表示、Pause/閉じる/次通常変動/リセットの状態検証を追加。
- UnityのDLLを参照して全runtimeソースをMonoで静的コンパイルし成功。Unityプロセスやビルドを起動したものではない。出力は`/tmp/yozora-sprint-c/`のみ。
- 実機原画、全人物、正確な演出尺/カット割り、AWAKENINGの全条件、RESULTの全種類は未達。
- Unityの描画・Web表示・モバイル・音・長時間遊技は今回未検証。ソース検証の成功をそれらの確認済みと扱わない。
