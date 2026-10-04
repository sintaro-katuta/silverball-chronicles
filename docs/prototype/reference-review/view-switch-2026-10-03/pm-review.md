# PM 独立レビュー（2026-10-03）

今回の範囲は遊技中の全体/盤面/液晶切替。同じ台・セッションの発射、抽選、保留、払出を維持し、導入後の初期値は盤面とする。実機Wの未確認仕様や既存policyの確定扱いは対象外。

## 独立試験

`pm-independent-check.mjs/json/log`でローカルChromeの5項目を検証。試験前後の6製品ファイルhash一致もassertする。

- 通常中に18回連続で実ボタンのonclickを同tickで実行。snapshot.viewだけを除外した全board snapshotは完全一致し、flow.continuous、model、SessionGame参照を保持する。
- 発射停止中の切替、メニュー停止中の切替でも状態を維持する。メニュー中はsnapshot全体が進まない。明示再開後も停止していた発射を勝手に再開しない。
- 全3viewを390×844、844×390、1280×960、320×568の4viewportで確認。canvasが画面内に収まり横overflowなし。見た目の具体的構図はDesignerの独立画像レビューを参照。
- 終了→一覧→新規開始で旧sessionを破棄し、導入active、view=board、spawned=0を確認。
- dev review=session/scenario=rushの初期RUSH/結果固定を使い、自然発射で実アタッカー入賞・払出開始を待った後、3view切替を12回行う。時計、発射数、実アタッカー入賞数、実bonus払出、Wイベントが進むことをjsonに記録。賞球だけを大当り払出と扱わないため待機条件はcounts.bonus>0かつtotal>=150。玉の入賞配置は追加していない。実機仕様の同定試験ではない。

## コード

setViewは同じscene/frameViewのposition/scale/alphaだけを変更し、flow.step/pause/feed/sessionの生成を呼ばない。API内のonUpdateを除いたため、表示変更からゲームイベント掃除等のmain update副作用も呼ばない。main onclickは選択viewのaria-pressedだけを同期する。intro中のview指定は記憶し完了時に反映、skipは採用盤面へ戻る。production以外/invalid/disposedに対して拒否する。既存intro cameraのwhole/board/lcd poseを共用し、盤面の物理worldは変えない。

physics.js/source-layout.jsは前回intro採用時とhash一致。SE・保存・クラウド送信は追加していない。

最終判定: 5項目成功、pageerror 0。試験前後6製品hash一致、最新撮影側5hashも独立一致（pm-source-match.json）。実bonus払出 135→225、アタッカー入賞 9→15 と進行。コード/ライフサイクルに阻害所見なし。
