# Sprint 4 PR動画

ユーザー承認の7文をずんだもんnormalで合成し、Remotionで約53秒MP4を作成。RUSHの同条件前後比較、実台詳細の説明追加、旧CIの工程時間と改善採否方針を示す。音声/字幕の文字列は承認内容を保持。

PMがネイティブプレイヤーで開始から52.693333秒の終端までエラーなしを確認。Designerの7章/motion/hold検査とPM抽出画像の確認で動画採用。人間によるゲーム音の聴感合格とは別。同期は既カット6/8秒で校正し、25fps原録画を記録markerから編集。全frame完全一致は主張しない。

次集約版をユーザー確認後にSprint PRへ掲載し、新Linux CIで改善効果と運用コストを判断する。rawのffprobe/sync/source/audio identityはprototype/reference-review/s4-video-2026-10-09/、書き出し結果はPRODUCTION.json。本番CDの公開は今回の作業で未実施。
