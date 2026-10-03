# 遊技中3表示・2026-10-03

`setView('whole'|'board'|'lcd')`は現在sceneと筐体frameのcamera変換だけを変更し、trueを返す。無効値・dispose後・非productionはfalse。flow.pause/start/stop/reset・物理・抽選・保留・出玉計算は変更しない。onUpdateを同期呼出ししないため、mainのgame.events清掃にも触れない。既存introは維持、intro中setViewは選択を記憶し完了時適用。skipIntroは常に盤面へ戻る。

whole/board/lcdのposeはintroと同じcreateViewCamerasを共用。全体は既存高精細筐体frame＋本編scene、盤面は採用crop、液晶は本編LCD_LAYOUT全域contain。frame/source寸法は前回introの視覚合わせで、実機寸法ではない。全体表示の外枠が全玉経路を一切遮蔽しないとは主張しない。

カメラ単体4件合格。自然左打ちの最新録画`views-left-mobile.mp4`では3表示を2周し、time3.04→18.34秒、spawned5→27の同session継続。結果のみハズレ固定のreview入口を使用し、球の確認配置なし。pageerror0。`views-left-motion.jpg`は3秒ごとのサンプル。

撮影直前のsource-sha256.txtは撮影後も5件一致。自然RUSH録画は初期RUSHと初回結果のみ固定、玉は全て自然発射。raw JSONのcompleteflagは撮影開始時の旧早期終了判定(wBatch.paid)のため、成功指標には使用しない。実払出はsamples.lastBonus.payoutとaccountingから別途評価する。保存scriptは現在のlastBonus.payoutへ修正済み。

自然RUSH最終動画`views-rush-mobile.mp4`は248.64秒。3秒ごとに全体→盤面→液晶を反復し、遊技開始から167.189秒の全体表示sampleでlastBonus.payout3000・終了time165.658・accounting.reconciled=trueを確認。累計払出3065は一般賞球を含む。末sampleは累計3176・発射406・持玉3170・収支一致。判定根拠を`rush-payout-verdict.json`へ保存。動画の遊技開始offsetは約5.46秒、3000完了はおよそ171～175秒付近、1500境界は88～94秒付近。`views-rush-payout-motion.jpg`は動画161秒から1秒ごとの15frameサンプルであり、全編レビューの代用ではない。製品5hashは長録画変換後も一致。
