# 同一盤面の導入・実装検証 2026-10-03

遊技開始時、既存`moonlit-pachinko-frame.png`の全筐体を、本編の実sceneと合成する。全体0.8秒→盤面へ0.7秒/保持0.3秒→液晶へ0.65秒/保持0.7秒→採用済み盤面へ0.65秒。計3.8秒。合成のscale1.7/offset(190,-44)はデザイナーとの視覚合わせであり、実機寸法ではない。

`board-runtime.js`は導入active中に`flow.step`を呼ばない。カメラだけを別elapsedで進める。pause/hiddenではカメラも停止し、skip/reduced-motionは正確に採用済み盤面(-12,-166,scale1)へ戻す。skipはpauseやfeed状態を変更しない。物理・釘・抽選・出玉・既存演出・SEの変更なし。

`lead-record.json`の最新記録は390×844、自然左打ちの確認用review入口で開始した。本編と同じsceneを使用し、導入中に当選等を固定する追加fixtureなし。whole/board/lcd/return/completeの観測点は全て遊技time0・spawned0。完了3秒後にtime約3秒・spawned5。pageerror0。カメラ単体3件合格（`lead-camera-tests.log`）。

`intro-mobile.mp4`は`page@9cc98e4f5eee3ead1eb64f80ccfa582f.webm`から変換した最終8.48秒録画（開始前の詳細と読込も含む）。`intro-mobile-motion.jpg`は1秒ごとの時系列サンプル。各phaseのpngはそのphaseへ入った直後であり、移動先へ到達した静止状態とは限らない。全編動作の確認にはmp4を使う。

撮影直前の`source-sha256.txt`は撮影後も5件一致を確認。筐体全体は現在の396×436表示領域内でcontainするため、スマートフォン縦では上下の余白が残る。最終盤面の表示サイズと演出は前回採用を維持する。
