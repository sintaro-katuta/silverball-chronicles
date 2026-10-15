# 効果音制作スキルの復旧

2026-10-16、ユーザーの「覚えている限りで復旧してほしい」という依頼で `pachinko-sound-design` を復旧した。既存ゲームやスプリント対象を変更する作業ではなく、以前の制作スキルとその評価上の判断を取り戻す作業。公開・ゲームへの音源差し替え・GitHubへの送信は行っていない。

## 発見した状態

個人用 `/Users/sintaro.katuta/.codex/skills/pachinko-sound-design` はプロジェクトの `.agents/skills/pachinko-sound-design` へのシンボリックリンクとして残っていたが、リンク先フォルダがなくなっていた。プロジェクト資料や過去の音源フォルダも一部見つからなかった。削除の原因・日時・実行者は特定していない。ブランチ切替や削除操作が原因だったとは断定しない。

## 復旧先

- プロジェクト用：[SKILL.md](../../.agents/skills/pachinko-sound-design/SKILL.md)。コード・設定・補足資料を含む。
- 個人用：`/Users/sintaro.katuta/.codex/skills/pachinko-sound-design/SKILL.md`。壊れたリンクを独立した実フォルダへ置き換え、同じ内容を配置した。プロジェクト側が消えても個人用の実体は残る構成。今後の変更は両方のSHAを確認して同期する必要がある。
- 来歴・ハッシュ・検証：[recovery-manifest.json](../../.agents/skills/pachinko-sound-design/recovery-manifest.json)。私的なセッション全文や認証情報は同梱していない。

## 履歴から回収したもの

スキル本文、JSON設定仕様、測定方法、参照再現実験の手順、pYINの比較方法、共通パルス／鋸波と2声ハーモニーの設計を回収。汎用合成器 `render.py`、DSP `engine.py`、補助指標 `compare.py`、librosa/pYIN `pitch_compare.py`、過去の3プリセット設定も復旧した。

`engine.py` と `pitch_compare.py` はそれぞれ次の過去記録のSHA256に一致する。

|対象|SHA256|
|---|---|
|engine.py|53188945e024f442044fec50c2388f0846b986a4a2b434a06e180b79d04bee77|
|pitch_compare.py|5a84fdc19ffd0945a342f3cf24c183c0f47e49fe8f7420362de37d96c0f97f5f|

`render.py` は保存された元ファイルと後続の文字列変更を順に適用して復元し、構文・実行を確認した。完全な過去ファイルのハッシュ照合はこのファイルには適用していない。

## 今回再構成したものと未回収

`render_pulse.py` は過去の確定音のコードを回収し、外部プロジェクトの固定パスへ依存しないよう、設定ファイルと出力先を指定する薄いラッパーへ再構成。確定した2声の数値は `assets/pulse-harmony-approved.json` に保存した。

後続のユーザー評価は `references/session-feedback.md` と `assets/reference-experiment-feedback.json` に再構成した。C方式がB方式より好まれ、2声の低いハーモニー版が確定したこと、今回の録音ドラム・シンセベース追加版はゲーム効果音として邪魔と評価されたことを保持する。各楽器の一般的な禁止へ広げない。最後のフォールは音程と音量の解釈が未確定で、音量の減衰を延ばした試作は採用済みとしない。

スキルはシンセ専用という制約にしない。明示的に実音を使う場合、利用条件を確認した素材の出典と加工を記録する。既存機種の演出録音を製品へコピーする用途とは区別する。

クイズ参照の `reference-experiment.json`、当時の全音声・全比較ページ、以前の一時Python環境は回収できていない。未回収ファイルへのリンクは取り除き、復旧済みとして扱わない。UIメタデータ `agents/openai.yaml` は今回作成した。

## 検証結果

- スキルのfrontmatter・名前・未完成雛形の検査：合格。相対参照も存在を確認。
- 全Pythonスクリプトの構文検査、生成された試聴HTML内のJavaScript構文検査：合格。
- 汎用設定の検証と単独キューの実生成：合格。負のHz・層の時間超過・重複ID・未知キー・NaNゲイン・危険なファイル名を拒否。
- seedをキューごとに初期化する再現性、補助指標の同一音・固定ゲイン・時間ずれによる挙動：確認。
- 440 Hzと無音区間を含む解析テスト：信頼できる区間の基音を推定し、無音区間のF0をnullのまま保持。F0検出率を品質の目標にしない。
- 以前に確定した6秒の「月光開放」を再生成し、WAVのSHA256が過去記録 `4d873b3468ce37244badef9b3dd22c6a0765ec4b163e553a5b03b3e7b352207c` と一致。48 kHz・stereo・PCM24、−19.99 LUFS、true peak−11.68 dBFS、クリップ0。

再生成音と検証結果は [skill-recovery-2026-10-16](../../prototype/audio/skill-recovery-2026-10-16/) に保存した。これは実ファイル一致と数値検証であり、今回新たなブラウザ再生・実聴取・本編受入を行ったという意味ではない。過去の音を採用する判断と、現在のゲームへ接続する判断は区別する。

今回の検証環境はPython3.14.7、numpy2.5.4、scipy1.18.1。作業用venvは `/tmp/pachinko-skill-recovery/venv` であり、恒久的な依存先にはしない。次回は利用環境のnumpy/scipy・FFmpeg、音程解析時のlibrosa/matplotlibを確認する。

## 指定された外部スキルからの取り込み

復旧後、ユーザーが指定した [awesome-genmedia/skills の sound-effects](https://github.com/awesome-genmedia/skills/blob/e4e641e21e59561fab7ab2bb7d90889e04aed84e/sound-effects/SKILL.md) を読んで取り込みを依頼した。2026-10-16時点の対象コミットは `e4e641e21e59561fab7ab2bb7d90889e04aed84e`、対象ファイルSHA256は `e716155b31d82db7b1d02b26d0c8204a36ea88cfa8d52de40bc1812be7d782f3`。

本文とコードのコピーではなく、音の対象・質感・空間・尺の具体化、複雑な効果を必要な要素ごとに試す考え方を [音の設計票](../../.agents/skills/pachinko-sound-design/references/sound-brief.md) として整理した。シンセ・録音素材・生成サービスを役割で選ぶ対応表は、このプロジェクトの過去の評価に合わせた設計上の提案であり、参照先で検証された品質順位ではない。

元スキルはeach::senseの外部APIを呼ぶ方式だが、今回はAPI接続・キー設定・外部送信・課金・モデル名の既定化を導入していない。一括生成を制作の既定にもしていない。比較ページは参照と最新候補の2音、共通音色の保持、F0欠測の扱い、数値と実聴取の区別を維持する。

プロジェクト用・個人用の両方へSKILL.mdの参照導線、sound-brief.md、更新来歴とSHA256を反映した。相対リンクとスキル定義を検証し、合成・解析コードとプリセットが変更されていないことを照合した。今回は手順の更新であり、新しい音の生成や聴感改善の実証は行っていない。

## release/0.3.0への取り込み準備

その後のユーザー依頼を受け、release/0.3.0基準の専用ブランチに今回のスキル・資料・再生成音だけをまとめた。[PRの対象と検証](../agile/SOUND_SKILL_PR_2026-10-16.md)。復旧時の「GitHubへ送信していない」は復旧時点の記録であり、今回のPR送信許可とは別の時点を示す。
