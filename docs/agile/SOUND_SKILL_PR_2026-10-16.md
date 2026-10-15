# 効果音制作スキルの作成PR

目的：以前作成していた効果音スキルを再び使える状態で保存し、今後の効果音制作の手順を引き継ぐ。ユーザーの「release0.3.0に取り込むPR」の直接依頼を対象合意とする。

対象：`feat/pachinko-sound-skill → release/0.3.0`。基準は `2ef267a4a9c6173990788bc6fa8a2bc6b8502531`。ゲーム本編・抽選・出玉・本番の音素材・公開設定は変更しない。Sprint7の釘や発射調整を含めない。

## 変更

- `.agents/skills/pachinko-sound-design/`：合成・解析スクリプト、設定、評価方法、試聴フィードバックを復旧したスキル。
- 設計票：ユーザー指定の外部sound-effectsスキルから、対象・質感・空間・尺の記述と、制作方法の使い分けを取り入れた。API接続・課金・素材送信は追加していない。
- `prototype/audio/skill-recovery-2026-10-16/`：再生成できた確定音と測定記録、持ち運べる検証スクリプト。
- `.github/workflows/sound-skill.yml`：このスキルの変更を対象にしたCI。既存スプリント／リリースCIの条件や公開処理は変えない。

詳細と復旧できなかった資料は [復旧記録](../prototype/PACHINKO_SOUND_SKILL_RECOVERY_2026-10-16.md)。スキル復旧と音声ファイル一致を、新しい音の聴感受入と混同しない。

## 検証

依存はPython、numpy/scipy、librosa/matplotlib、FFmpeg、生成HTMLの構文確認にNode。既存のPython環境か作業用venvへ用意し、リポジトリルートから実行する。

```sh
python -m pip install numpy scipy librosa matplotlib
python prototype/audio/skill-recovery-2026-10-16/verify.py --out /tmp/sound-skill-check
```

出力先は新しい空のディレクトリを使う。設定の異常系6種類、キュー単位の再現性、補助指標の同一音／ゲイン／時間ずれ、汎用音と2声音の生成、WAV/MP3デコード、440Hzと無音を含むpYIN、参照リンクと生成JavaScriptを確認する。

今回の専用ブランチで実行済み。[結果JSON](../../prototype/audio/skill-recovery-2026-10-16/pr-validation.json)。以前の確定音と再生成WAVのSHA256は一致。pYINの既知440Hzに対する有効区間中央値は約441.27Hzで、指定した無音区間はnull。検出率の増加を品質の目標にしていない。

CIでも同じ検証を実行するが、OS・依存版が違う環境で過去のWAVの完全一致を一律に必須にしない。ハッシュ一致は結果に記録し、有限値・クリップ・時間・既知信号の判定を検証する。通常のゲームCIはこのfeatureブランチでは対象外になり得るため、ゲーム本編の回帰成功とは報告しない。

## 残件とPRの状態

説明動画の [承認用台本](sound-skill-video/NARRATION.md) と [絵コンテ](sound-skill-video/PLAN.md) を準備した。台本は人間承認待ち。Remotion＋VOICEVOXの音声・依存シーン・MP4制作はまだ行わない。

動画を実再生・受入し、PR先頭プレイヤーを確認するまではDraft。台本承認後にずんだもん・ノーマルで音声と字幕を同期して制作する。過去の台本承認を今回へ流用しない。

このPRは集約依頼であり、mainへのマージ・ゲーム本編の差し替え・本番公開・CD有効化を含めない。
