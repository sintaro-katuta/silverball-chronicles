# Sprint A：払出完了から結果告知・RUSH入口までの進行制御

2026-09-26。ローカルのコード実装まで。**Unityの起動・コンパイル・ビルド・Web再生はこの担当では実行していない。Generated、scene、Web成果物も変更していない。** 既存のR2統合成功ログはこの変更前であり、新状態の検証結果として扱わない。

## 根拠と意図

[ANALYSIS.md](ANALYSIS.md) のR2 03:25〜04:10では、300玉の払出進行、LAST FLOORの対決、PUSH、SWORD RUSH入口が別場面に分かれる。以前は最終入賞の同じ処理内で次モードとST回数を設定し、表示だけ物語を延ばすと裏でSTが消化された。

今回、実払出終了と遊技の再開の間に `BonusPresentationState` を挿入した。抽選・振分・当選済の総払出・行先は変えず、再開する時点を表示シーケンスの終了へ移す。これは演出進行の試作仕様であり、実機の主基板時短/V入賞制御を復元したものではない。

## 状態と時計

1. 最終 `CountBonus` の15玉を払う。
2. `Bonus=null` とし、完了賞・実払・移行元/行先をスナップショット化。以後 `CountBonus` はfalseで二重払い出ししない。
3. `Story → Result → Entrance` をルールの `Tick` だけで進める。その間Mode・Remaining・既存Holdsは変えず、新しい抽選保留の受付もしない。
4. `Complete` で当選時に確定していた行先を一度だけ適用し、53/70回を設定。既存のモード変更時保留破棄方針は維持。
5. Completeへ到達したTickはここでreturnし、同じTickの余り時間でSTや保留を消化しない。次のTickから通常の変動処理へ戻る。

Storyの仮秒数はLAST FLOOR20秒、決意の刃12秒、DRIVE6秒、その他3秒。Result4秒、Entrance4秒（通常へ戻る場合2秒）。**動画の編集間隔や実機の正確な所要時間ではなく、表示担当と合意した制作上の仮設定。**

## 表示担当とのAPI契約

`Rules.BonusPresentation` はnullまたは最新の状態。Complete後も最新snapshotを保持するため、表示は `Rules.IsBonusPresentationPending` または `state.IsActive` で判定する。

- `Id`: 同じRules内の一連払出完了ごとの識別子。
- `Phase`: `BonusPresentationPhase.Story / Result / Entrance / Complete`。
- `Elapsed`: phase内経過。`TotalElapsed`: 全phase累計。
- `PhaseDuration`, `StoryDuration`, `Duration`。
- `CompletedAward`: 完了したAwardのコピー。元のAwardとは独立。
- `Paid`: 実際にCountBonusで払った総玉数。
- `SourceMode`, `Destination`: 移行元・確定行先。Destinationと尺はコピー元を変更しても変わらない。
- `PushAvailable`: Story末尾3秒の演出用入力窓。PUSHはフィードバックのみで結果・時計を変更しない。

イベントは払出完了時 `bonus-paid`、全phase終了時 `bonus-presentation-complete` と既存 `mode`。解除はルール側で自動処理し、画面の描画成否や未ロード素材に依存しない。Story中の行先先出しは表示担当で避け、Result以降に行先を描く。

`ReferenceBonusView`・`ReferencePresentation`・`RushSymbol`は担当B/Cへ委譲し、本担当から変更していない。実際の上位入口はこのEntrance4秒に合わせ、Complete後にさらに独自の待機画面を足してSTを覆わないよう共有済み。

## 停止・試演・機械側

- `Rules.SetPaused` を追加し、Machineのpause/focus/pause-resumeと連動。停止中のTick・抽選受付・発射消費・アタッカー払い出しを抑止。
- ResetMachineは新Rulesを生成する既存方式により、保留中の演出・識別子・時間・完了情報を破棄。
- 試演倍率は既存Unityのscaled fixed clockを使用。1/4/8倍が物語時計にもそのまま反映され、別の壁時計を持たない。
- 最終払出後はアタッカーを閉める。保留中は旧数字・R表示を隠し、ステータスを演出中にする。発射を続ける場合の方向は右を維持。
- 右始動口を実際に通った玉の1賞球と、保留の受理は別処理。待機中に始動賞球が増えてもSTや新規保留の受付にはならない。
- Telemetryへ `bonusPresentationPending / bonusPresentationPhase / bonusPresentationElapsed` を追加。

## 上位セッションの結果API（担当Cとの接続）

`CompletedDriveCount / SessionJackpots / SessionPayout` と `LastUpperRushResult` を追加。

- WoUへModeが実際に切り替わった時点でセッション開始。突入前に払ったきっかけ出玉はこのセッションに含まない。
- 上位中のwinだけで当り数、実CountBonusだけで払出玉数を加算。DRIVE回数は全払出完了で1件。
- 最後のST外れで通常に戻ると、`LastUpperRushResult` の `Id / Jackpots / CompletedDrives / Payout` が確定。
- INVADING/AWAKENINGの不明な発生条件はこの集計から推測しない。画面に表示する場合は以上の集計範囲を明示。

## 用意した検証（未実行）

新規 `BonusPresentationValidation.Run()` を既存 `YozoraValidation.Run()` に追加。

- 移行元3種×行先3種の9組で、19玉時は待機しない、20玉目で1度だけ払出終了、追加CountBonusなし。
- 待機中にST残数・保留数・開始数が変わらず、新しい受付もない。
- pause中の時計・発射・払出停止、resume後の解除1回、Completeと同じTickで変動を消化しない。
- Machineのdemo→待機→pause→reset→別demoで古い状態が残らない。
- 1倍相当と8倍相当の刻みで同じ行先・残ST・払出・経過になる。
- 上位の実当り1件・DRIVE1件・1500玉からST終了リザルトを生成。
- 既存2万変動/乱数独立性の検証は、待機phaseを消化してから次の変動を入れるよう更新。公開確率・振分テストは維持。

ルール以外の絵・効果・音の視認/聴取、描画とphaseの実同期、実Webのfocus・reset・試演倍率操作はroot統合後に確認する必要がある。台詞・原画・実機のV制御は本実装で完成したとはしない。
