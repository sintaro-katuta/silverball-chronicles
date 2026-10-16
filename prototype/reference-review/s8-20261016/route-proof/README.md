# 元配置250発・観測証拠

全250球の計数と接触・横断はroute-analysis/、元の30Hz結果と全窓の新旧一致はroute-trace/baseline-phase0/、約59秒の無音映像と自然再生記録はroute-clips/にあります。

receipts.json.gzは、実入力・原trace/保存frame・選別cache・描画source/assets・時刻・球IDの対応を確認した10件の媒体記録です。展開したJSONに各原receiptのSHAと全内容を保持しています。manifest.jsonで圧縮/展開の両SHAとbytesを照合できます。

元のtrace.jsonl.gzは79,815,949bytes（展開1,061,241,065bytes・1,666,878行）で、共有workspaceのprototype/reference-review/s8-20261016/route-trace/baseline-phase0/に全量を保全しました。GitHubのPRへ全量を同梱したとは扱いません。trace-manifest.jsonに両SHAを保存し、SMがstreamで全行を独立確認しました。

映像は観測資料です。補間・新しい物理計算・音声は加えていません。最終の音声付きPR説明動画とは別で、形状修正や改善候補の比較も未実施です。
