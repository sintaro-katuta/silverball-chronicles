# PM 独立仕様・コード・ライフサイクルレビュー（2026-10-03）

対象は今回の全筐体→採用盤面→液晶→採用盤面の導入と、詳細の簡略筐体絵撤去。実機W制御の完成度を再認定するものではない。

## 判定

現最終候補に阻害所見なし。独立ローカルChrome検証5項目成功、pageerror 0。`pm-independent-check.mjs/json/log` が今回の新証拠。撮影時の見た目・録画との対応はDesigner/統括の別記録を参照する。

- 全4 phaseを採取し、導入中のflow game time=0、spawned=0、stock=400を確認。完了後に自然発射する。
- タッチで導入メニューへ入り、導入elapsedも含むsnapshotの停止を確認。停止中にAPI skipを呼んでもpausedを維持し、明示的な戻る操作後だけ発射する。
- synthetic document.hidden/visibilitychangeで導入が停止し、明示再開後の早期skipから発射する。実OS背景化そのものの試験とは区別する。
- prefers-reduced-motion:reduceでは導入完了へ直行して自然発射する。
- 初回asset読込を意図的に遅延させ、loading-backで詳細へ戻った後のstale mountが詳細画面を上書きしないこと、snapshot=null、再開始で新しい導入を行い、タッチメニューから終了後はsnapshot=nullを確認。

## コードの確認

Runtimeは導入active中にflow.stepを呼ばず、cameraだけを独立dtで動かす。camera.stepはflow.pausedまたはresultで抑止される。skipはflow.pause/feedを変更しない。完了poseは従前採用値x=-12/y=-166/scale=1へ厳密に戻る。disposeはframe loop/listenerを停止。mainは世代guard、stale mounted.dispose、読込後hiddenのmenu処理を保持。導入メニューを常設したためタッチ端末でもskipなしで停止/終了へ到達できる。

簡略48×64詳細canvasを撤去し、仕様とプレイ開始ボタンへ変更。一覧の選択/pagingロジックは今回変更していない。

`../../../../prototype/reference-review/intro-zoom-2026-10-03/pm-source-sha256.txt` に検証対象6ファイルを記録。physics.jsとsource-layout.jsはfocus-view採用時manifestと一致（玉経路/釘を本変更で変更していない）。最新録画側`../../../../prototype/reference-review/intro-zoom-2026-10-03/source-sha256.txt`全5件（main/CSS/runtime/camera/fullframe）を現在ファイルと独立照合し一致。`../../../../prototype/reference-review/intro-zoom-2026-10-03/pm-source-match.json`に記録。今回の5checksは以前のW全回帰や実機未確認policyを確定扱いにする証拠ではない。
