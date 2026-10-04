# プレイ中の表示切替・統括確認

2026-10-03。全体/盤面/液晶を同じ本編sceneとsessionで切り替える。開始導入は維持し、完了後に小さな3ボタンを表示。setViewはカメラ/外枠とrenderだけを変更し、mainの定例onUpdateも呼ばない。新規開始とスキップは盤面から。表示の保存、SE、物理/W制御の変更は追加しない。

- rootはローカル製品画面で開始→スキップ→全体→液晶→操作情報展開を実操作し、同じ筐体/人物/図柄と操作を確認した。
- PM独立5チェック合格、pageerror0。18回の同tick実ボタン切替ではview以外のfull snapshotが一致。同game/model/flow参照、発射停止/一時停止、resize、終了/新規開始を保持。RUSH実アタッカー入賞bonus9→15、払出135→225、time/shot/Wイベントが継続した。dev結果固定は実機仕様の認定ではない。`pm-review.md`参照。
- Designer独立18画面はPC/mobile縦横×全3view×controls開閉。台/切替バー/操作欄の非重複を視認。入賞口/OUTで外枠のalpha遮蔽を別確認。`designer-review.md`参照。
- rootは最新left動画 `../../../../prototype/reference-review/view-switch-2026-10-03/views-left-mobile.mp4` の時系列画像を視認し、ローカルブラウザで再生/23.76秒終端を確認。全フレーム連続目視の主張ではない。自然発射のtime/spawn継続は `../../../../prototype/reference-review/view-switch-2026-10-03/lead-left-record.json` に記録。
- 長いRUSH録画では表示を3秒ごとに切り替えながら自然発射。sample167.189秒のwhole表示で `lastBonus.payout=3000`、一般賞球を含むtotal3065、accounting.reconciled=trueを確認。旧試験scriptの誤った `wBatch.paid` によるraw completeflagは判定根拠へ使わず、`../../../../prototype/reference-review/view-switch-2026-10-03/rush-payout-verdict.json` の現モデルの払出と計数で判定した。初期RUSHと当選結果のみ固定した検証で、自然な当選確率の証拠ではない。
- rootが最終RUSH動画の172秒をデコードし `../../../../prototype/reference-review/view-switch-2026-10-03/root-rush-after-3000.png` を視認、盤面選択と液晶3000/3000表示を確認した。全長248.64秒を連続目視したという主張ではない。
- 最終ビルド成功、既存500kB超chunk警告。撮影対象5ファイルのSHA256はrootがすべて現行との一致を確認。LEのカメラ単体4試験も成功し、古い3試験ログと区別した。

表示は現在の固定396×436 canvas内でcontainするため、全体表示/縦長画面には余白が残る。切替UIの上部領域60pxを確保し、台へボタンが重ならないことを優先する。液晶拡大では周囲の玉路は画面外になるが、同じ遊技が進む。ローカルのみ。W未確認項目の解消とは別の変更。
