# 最終校正版の記録

2026-10-03、ローカルChrome390×844。本作暫定ヘソ入口幅16worldを採用し、寄り反発は0.46へ戻した。sourceのw24（12world）と101釘中心は保持。物理入口幅・左右rim・表示黒口/lip16/body20を同期、高さ/中心不変。半径1.8/軸0.2は推定校正値のまま。実機入口幅/入賞率の認定ではない。

source-sha256.txtは製品13ファイル、post-record-hash-check.logで録画終了後13/13一致。video-sha256.txtは新3動画。gather-only-candidate配下は中間反発候補であり現在の成功根拠から除外した。

- left-mobile.mp4：本編SessionGameの自然標準左打ち0.6秒/default0.24を120秒、その後操作パネルで発射停止して30秒排出。抽選結果のみ外れ固定、球配置なし。201発、ヘソ4/一般3/OUT194/残0、会計reconciled true、pageerror0。自然入賞game時刻17.475/28.383/43.958/50.233はleft-admissions.jsonでdrawId1〜4と対応。50秒以降の長い無入賞区間は残り、十分回ると断言しない。
- dense-mobile.mp4：同じ本編renderer/SessionGameをローカル専用dense.htmlから使用、発射間隔だけ0.05秒要求。20秒自然発射→30秒排出。312発、ヘソ17/一般5/OUT290/残0、会計reconciled true、pageerror0。抽選外れ固定、球配置なし。
- rush-mobile.mp4：本編自然右打ち。初期RUSHと最初の結果のみ固定、全玉自然発射。166.741秒sampleでlastBonus.payout3000、278発/普図63/電チュー2/アタッカー200/OUT9/残4、会計reconciled true、pageerror0。残4は動画終端も発射継続しているためで、排出完了試験とは分ける。払出完了の重点は動画末尾付近171〜174秒。

各record.jsonは2秒ごとのsnapshot、admissions.jsonはspin.eventsを重複除去した自然ball/time/drawId/accepted記録。mp4には読み込み/導入が先行するためgame timeと動画時刻は同一ではない。motion-samples.jpgは時系列サンプルであり全編連続レビューではない。

lead-final-regression.log：入口sensor/一般口/rail containment/inlet8件全合格。rootの追加校正回帰と独立39件/PM自然多power・phase・レール・会計/Designer動画レビューはそれぞれ別ログ。旧成功は今回検証へ流用しない。

候補比較と未達はlead-candidate-review.md。入口捕捉前の供給経路が少なく、warp/stage/3D奥行きは未確認または未実装。本作校正目安4〜8/100発は未達、完全再現や100%完成とは扱わない。大当り確率・抽選・保留容量は変更していない。
