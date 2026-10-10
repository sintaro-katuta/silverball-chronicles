# S5 #22 釘配置ツール説明動画

ユーザー「OKです」で7文の発話を承認。CLI approval fingerprintを検証し、VOICEVOXずんだもん・ノーマル（style3）で7WAVを生成した。台詞・読み上げ設定は変更しない。音声と字幕は同じtimeline start_frame/duration_framesを使用し、字幕の句点で改行する。冒頭から手動ツールの使い方を示し、指示中の新探索機能や探索完了の説明は加えない。

主素材はformatVersion2の実DOM操作・固定部材への実pointerクリックによる拒否。基準101本、釘1→grid:12:77、保存・復元・同SHA読込を対応づける。旧v1、API拒否のみの旧動画は履歴として保持し、最終映像には使わない。盤面と同条件計測の共通候補SHAはa86304…。

計測表は最終Chromeのfinal-local-3c136dd/pin-layout-tool-final-v2から生成。入賞は発射＋排出待ち、無入賞区間は発射中の実観測窓。有限玉の実窓は約281〜300秒と示す。改善・悪化を併記し、source/定義/engine geometryを区別する。流路の補助図は実物理1秒ごとの保存記録の12秒付近の静止であり、補間や自然play全フレームの映像ではない。本編の固定配置を維持し、配置採用は別の判断。

出力は原workspace prototype/reference-review/s5-video-2026-10-10/review.mp4。64.085333秒、1921f/30fps、H2641920×1080/AAC48kHz、2,371,572B。SHA・承認・音声・素材・構成ソースはSOURCE_PROVENANCE.json。MP4/WAV/private rawはGitに含めない。

7章previewと実MP4の8抽出画像を実見し、字形・字幕・表の脚注・creditが読め、重複しないことを確認した。Designerは全尺実再生・聴感を確認していない。PMがnativeで開始→36.668→64.085333秒の自然終端を連続再生し、ended=true・paused=true・muted=false・再生エラー無しと開始/表/終端の実画面を確認した。音声聴感はPM/Designerとも未検証で、ゲーム音#7の聴感へ拡張しない。PRへの送信・アップロードはPM担当。

## 再制作

既存Remotion4.0.505環境を依存として使用する。tools/pr-video/node_modulesはその既存環境を参照し、新規依存の追加や旧プロジェクトsourceの変更はしない。外部公開はしない。approved script/WAV、timeline、V2 rawと実計測JSONを同じ出力フォルダに保持し、public派生素材を用意してから以下を実行する。

- `python3 tools/pr-video/s5-build.py`：全7章preview。
- `remotion render tools/pr-video/s5-index.tsx S5Review <output>/review.mp4 --public-dir=<output>/public --codec=h264 --crf=28 --audio-bitrate=128k --concurrency=2`：既Chromeをbrowser-executableで指定。
- `python3 tools/pr-video/s5-verify.py`：承認fingerprint、7台詞/voice3、WAV同一性、MP4形式・容量・抽出・原録画SHAの検査。

新発話や読み上げ設定の変更は、台本の新承認後に行う。

### 可搬なパス指定

verifyの承認資料は既定でrepo内docs/agile/s5-video、出力はrepo内prototype/reference-review/s5-video-2026-10-10を使う。制作cloneの絶対パスをsourceへ埋め込まない。別配置ではS5_APPROVED_SCRIPT_DIRとS5_VIDEO_OUTPUT_DIRを指定する。preview用CLIはS5_REMOTION_CLI、ブラウザはREMOTION_BROWSER_EXECUTABLEで既存依存を指定できる。

今回は制作cloneをcwdに、S5_VIDEO_OUTPUT_DIRだけ原workspaceの保持済み出力へ指定して直接verifyを実行しexit0。MP4 SHA0db3f5f…e1dfa、7承認文・7音声・原操作SHAは不変。
