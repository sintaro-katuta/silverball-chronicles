# 演出改修の検証 — 2026-09-27

最新版：通常・当落・右＝Round2、LAST FLOOR・DRIVE・上位終了＝Round3、決意の刃＝Round4。

- `round2/runtime-results.txt` 13項目PASS：通常当り一度、PUSH後の同一チケット、4/8倍速、一時停止、外れ無払出、RUSH当り、300/1500/4500玉の既存結果、上位終了、reset。
- `round3/runtime-results.txt` 6項目PASS：大当りの再描画、1500/4500実払出、上位終了、reset。
- `round4/runtime-results.txt` 2項目PASS：二重人物背景を除去した決意とreset。
- `/tmp/yozora-presentation-round1.log`：既存ルール15項目、長期20000変動、賞球境界、上位集計、5ライン/特殊数字、FAIR、構造監査PASS。
- 収録はUnity実行中の共通時計を1/15秒ずつ進めた15fps描画。PUSH比較・外れ終盤は確認用の時刻指定を含む。大当り映像は検証用入賞入力を含み、実射出の入賞率測定ではない。
- 原画は追加生成した8場面。元動画の画像/音声を製品へ貼り付けていない。身体の連続作画・全実機演出・実機楽曲の一致は未達であり、今回の代表経路の承認に含めない。
- 映像の独立査読は指定時刻の連番PNG比較。音声/音楽の実聴は未検証。Unity内合成BGM/効果音の発火とPause連動を実装したが、音の一致承認とは区別。

詳細は `BASELINE_REVIEW.md` の修正履歴と最新結論。各roundのMP4は無音、録画一覧はcapture-manifest.json。

## 最終ビルド・ブラウザ

- `/tmp/yozora-presentation-web-final.log`: `BONUS_PUSH_PASS response / immutable outcome / reset`、WebGL `Build Finished, Result: Success.`。大当りPUSHは所定窓で反応し、時刻・払出を変えずresetで消える。
- 最終WebGL出力後に `npm run build` 成功。既存のPlayCanvas worker外部化・chunkサイズ警告は継続。
- rootが最終ローカルWebGLを再読込し、液晶拡大、RUSHリーチ1倍の人物カットからBONUSへの進行、決意8倍試演からRUSH復帰、最後の一時停止を画面上で確認。取得したブラウザerrorログは空。全150秒を等速で連続目視したという意味ではない。
- 比較ページのMP4再生ボタンとnative playerの再生進行を画面上で確認。台はLAST FLOOR・液晶視点で停止して残した。再開または試演選択で動かせる。
- 独立査読Round4：今回確認した画面に追加必須修正なし。通常Round2／大当りRound3／決意Round4の画面構成の範囲で承認。原作画完全一致、全ルート、音の承認とは区別。
- ローカルのみ更新。クラウドへのアップロード/更新は行っていない。
