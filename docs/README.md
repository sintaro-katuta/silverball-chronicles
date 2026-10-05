# プロジェクト資料

仕様書、設計・移行資料、参考機種の調査、レビュー文書、動画の文字起こしをこのディレクトリにまとめています。元のプロジェクト階層を保ち、文書から実装や検証素材へリンクしています。

## 主な入口

- [ゲーム仕様書](pachinko.md)：冒頭の優先関係と最新追記を確認してください。
- [試作の起動方法と実装範囲](prototype/README.md)
- [月影機関のアーキテクチャとディレクトリ構成](prototype/ARCHITECTURE.md)
- [PixiJSの接続範囲と検証](prototype/PIXI_SESSION_INTEGRATION.md)
- [採用済みのデザイン方針](prototype/DESIGN.md)
- [PlayCanvas移行記録](prototype/PLAYCANVAS_MIGRATION.md)
- [パチンコ初心者講座の概要と全体図](transcripts/パチンコ概要_IRvp0ammDbg.md)
- [月影機関の改善点24項目と担当レビュー](prototype/improvement-review/2026-10-05/README.md)
- [改善実装・動作確認動画・残る課題](prototype/improvement-review/2026-10-05/implementation.md)

## 配置方針

```text
docs/
├── README.md                 資料の索引と配置方針
├── pachinko.md               ゲーム仕様書
├── prototype/                試作の設計・移行・検証・参考資料
│   ├── reference-review/     レビュー文書と参考PDF
│   ├── material-review/      素材レビュー文書
│   └── migration-prep/       移行と素材一覧の文書
└── transcripts/              文字起こし・概要・Mermaid
```

新しいプロジェクト資料は`docs/`配下へ追加します。Markdownのファイルリンクは、その文書の位置を基準にした相対パスにします。

画像・動画・実行用HTML・検証ログ・測定CSV・コードのバックアップは、実装や生成処理と一緒に既存の場所へ残しています。`AGENTS.md`、スキルの定義、第三者パッケージのREADME・ライセンス、アプリが参照する設定ファイルも所定の場所にあります。レビューの日付や過去の検証結果は、文書の移動で最新になったものではありません。

## 全資料の索引

### ゲーム仕様

- [pachinko.md](pachinko.md)

### 試作の設計と開発資料

- [prototype/ARCHITECTURE.md](prototype/ARCHITECTURE.md)
- [prototype/ASSET_PROMPT.md](prototype/ASSET_PROMPT.md)
- [prototype/COMPONENTS.md](prototype/COMPONENTS.md)
- [prototype/DESIGN.md](prototype/DESIGN.md)
- [prototype/DESIGN_NEXT_TASKS.md](prototype/DESIGN_NEXT_TASKS.md)
- [prototype/EDITOR_IMPORT.md](prototype/EDITOR_IMPORT.md)
- [prototype/EXPANSION.md](prototype/EXPANSION.md)
- [prototype/GAME_FLOW_PROPOSAL.md](prototype/GAME_FLOW_PROPOSAL.md)
- [prototype/MECHANISM_MIGRATION.md](prototype/MECHANISM_MIGRATION.md)
- [prototype/MOON_GIMMICKS_REVIEW.md](prototype/MOON_GIMMICKS_REVIEW.md)
- [prototype/PIXI_SESSION_INTEGRATION.md](prototype/PIXI_SESSION_INTEGRATION.md)
- [prototype/PLAYCANVAS_MIGRATION.md](prototype/PLAYCANVAS_MIGRATION.md)
- [prototype/README.md](prototype/README.md)
- [prototype/REAL_MACHINE_AUDIT.md](prototype/REAL_MACHINE_AUDIT.md)
- [prototype/REPAIR_BACKLOG.md](prototype/REPAIR_BACKLOG.md)
- [prototype/REVIEW_BATCHES.md](prototype/REVIEW_BATCHES.md)
- [prototype/RIGHT_MECHANISM_REVIEW.md](prototype/RIGHT_MECHANISM_REVIEW.md)
- [prototype/VERIFICATION.md](prototype/VERIFICATION.md)
- [prototype/src/pixi/se/README.md](prototype/src/pixi/se/README.md)

### 移行準備と素材一覧

- [prototype/migration-prep/ASSET_LIST.md](prototype/migration-prep/ASSET_LIST.md)
- [prototype/migration-prep/IMAGE_FILES.md](prototype/migration-prep/IMAGE_FILES.md)
- [prototype/migration-prep/README.md](prototype/migration-prep/README.md)
- [prototype/migration-prep/materials/ASSET_LIST.md](prototype/migration-prep/materials/ASSET_LIST.md)
- [prototype/migration-prep/materials/IMAGE_FILES.md](prototype/migration-prep/materials/IMAGE_FILES.md)

### 文字起こしとパチンコ概要

- [transcripts/パチンコ初心者講座_IRvp0ammDbg.txt](transcripts/パチンコ初心者講座_IRvp0ammDbg.txt)
- [transcripts/パチンコ概要_IRvp0ammDbg.md](transcripts/パチンコ概要_IRvp0ammDbg.md)
- [transcripts/パチンコ概要_IRvp0ammDbg.mmd](transcripts/パチンコ概要_IRvp0ammDbg.mmd)
- [transcripts/粗品_パチンコ超初心者講座_文字起こし.txt](transcripts/粗品_パチンコ超初心者講座_文字起こし.txt)

### 素材レビュー

- [prototype/material-review/user-reference-2026-09-29/README.md](prototype/material-review/user-reference-2026-09-29/README.md)

### 参考機種とレビュー

- [prototype/reference-review/balance-audit/NORMAL_PAYOUT_REVIEW_2026-09-25.md](prototype/reference-review/balance-audit/NORMAL_PAYOUT_REVIEW_2026-09-25.md)
- [prototype/reference-review/balance-audit/PAYOUT_SEPARATION_2026-09-25.md](prototype/reference-review/balance-audit/PAYOUT_SEPARATION_2026-09-25.md)
- [prototype/reference-review/cabinet-intro-2026-10-03/designer-review.md](prototype/reference-review/cabinet-intro-2026-10-03/designer-review.md)
- [prototype/reference-review/cabinet-overview-2026-10-03/designer-review.md](prototype/reference-review/cabinet-overview-2026-10-03/designer-review.md)
- [prototype/reference-review/cabinet-overview-2026-10-03/lead-review.md](prototype/reference-review/cabinet-overview-2026-10-03/lead-review.md)
- [prototype/reference-review/cabinet-overview-2026-10-03/pm-review.md](prototype/reference-review/cabinet-overview-2026-10-03/pm-review.md)
- [prototype/reference-review/collision-lcd-2026-10-03/acceptance-scope.md](prototype/reference-review/collision-lcd-2026-10-03/acceptance-scope.md)
- [prototype/reference-review/collision-lcd-2026-10-03/designer-general-pocket-review.md](prototype/reference-review/collision-lcd-2026-10-03/designer-general-pocket-review.md)
- [prototype/reference-review/collision-lcd-2026-10-03/designer-review.md](prototype/reference-review/collision-lcd-2026-10-03/designer-review.md)
- [prototype/reference-review/collision-lcd-2026-10-03/lead-verification.md](prototype/reference-review/collision-lcd-2026-10-03/lead-verification.md)
- [prototype/reference-review/collision-lcd-2026-10-03/pm-review.md](prototype/reference-review/collision-lcd-2026-10-03/pm-review.md)
- [prototype/reference-review/collision-lcd-2026-10-03/verification.md](prototype/reference-review/collision-lcd-2026-10-03/verification.md)
- [prototype/reference-review/confirmation/REVIEW.md](prototype/reference-review/confirmation/REVIEW.md)
- [prototype/reference-review/cutin/2026-09-24/REVIEW.md](prototype/reference-review/cutin/2026-09-24/REVIEW.md)
- [prototype/reference-review/cutin/REVIEW.md](prototype/reference-review/cutin/REVIEW.md)
- [prototype/reference-review/dmm-specs/REVIEW.md](prototype/reference-review/dmm-specs/REVIEW.md)
- [prototype/reference-review/eclipse-outside-2026-10-03/REVIEW.md](prototype/reference-review/eclipse-outside-2026-10-03/REVIEW.md)
- [prototype/reference-review/fireforce99/REVIEW.md](prototype/reference-review/fireforce99/REVIEW.md)
- [prototype/reference-review/focus-view-2026-10-03/designer-review.md](prototype/reference-review/focus-view-2026-10-03/designer-review.md)
- [prototype/reference-review/focus-view-2026-10-03/pm-review.md](prototype/reference-review/focus-view-2026-10-03/pm-review.md)
- [prototype/reference-review/focus-view-2026-10-03/root-review.md](prototype/reference-review/focus-view-2026-10-03/root-review.md)
- [prototype/reference-review/focus-view-2026-10-03/verification.md](prototype/reference-review/focus-view-2026-10-03/verification.md)
- [prototype/reference-review/genshin/REVIEW.md](prototype/reference-review/genshin/REVIEW.md)
- [prototype/reference-review/godzilla7/ITERATION_LOG.md](prototype/reference-review/godzilla7/ITERATION_LOG.md)
- [prototype/reference-review/godzilla7/REVIEW.md](prototype/reference-review/godzilla7/REVIEW.md)
- [prototype/reference-review/heso-calibration-2026-10-03/designer-geometry-review.md](prototype/reference-review/heso-calibration-2026-10-03/designer-geometry-review.md)
- [prototype/reference-review/heso-calibration-2026-10-03/designer-render-review.md](prototype/reference-review/heso-calibration-2026-10-03/designer-render-review.md)
- [prototype/reference-review/heso-calibration-2026-10-03/lead-candidate-review.md](prototype/reference-review/heso-calibration-2026-10-03/lead-candidate-review.md)
- [prototype/reference-review/heso-calibration-2026-10-03/lead-verification.md](prototype/reference-review/heso-calibration-2026-10-03/lead-verification.md)
- [prototype/reference-review/heso-calibration-2026-10-03/pm-acceptance.md](prototype/reference-review/heso-calibration-2026-10-03/pm-acceptance.md)
- [prototype/reference-review/heso-calibration-2026-10-03/pm-baseline-review.md](prototype/reference-review/heso-calibration-2026-10-03/pm-baseline-review.md)
- [prototype/reference-review/heso-calibration-2026-10-03/pm-gather-candidate-review.md](prototype/reference-review/heso-calibration-2026-10-03/pm-gather-candidate-review.md)
- [prototype/reference-review/heso-calibration-2026-10-03/pm-review.md](prototype/reference-review/heso-calibration-2026-10-03/pm-review.md)
- [prototype/reference-review/heso-calibration-2026-10-03/verification.md](prototype/reference-review/heso-calibration-2026-10-03/verification.md)
- [prototype/reference-review/hilt-spin-2026-10-03/REVIEW.md](prototype/reference-review/hilt-spin-2026-10-03/REVIEW.md)
- [prototype/reference-review/hybrid-2026-09-29/ART_PROMPT.md](prototype/reference-review/hybrid-2026-09-29/ART_PROMPT.md)
- [prototype/reference-review/hybrid-2026-09-29/REVIEW.md](prototype/reference-review/hybrid-2026-09-29/REVIEW.md)
- [prototype/reference-review/implementation-history/AUDIT_BEFORE_PHYSICS_REPAIR.md](prototype/reference-review/implementation-history/AUDIT_BEFORE_PHYSICS_REPAIR.md)
- [prototype/reference-review/implementation-history/BACKLOG_BEFORE_PHYSICS_REPAIR.md](prototype/reference-review/implementation-history/BACKLOG_BEFORE_PHYSICS_REPAIR.md)
- [prototype/reference-review/implementation-history/BEFORE_RUSH_GAME_FLOW_PROPOSAL.md](prototype/reference-review/implementation-history/BEFORE_RUSH_GAME_FLOW_PROPOSAL.md)
- [prototype/reference-review/implementation-history/BEFORE_RUSH_REAL_MACHINE_AUDIT.md](prototype/reference-review/implementation-history/BEFORE_RUSH_REAL_MACHINE_AUDIT.md)
- [prototype/reference-review/implementation-history/BEFORE_RUSH_REPAIR_BACKLOG.md](prototype/reference-review/implementation-history/BEFORE_RUSH_REPAIR_BACKLOG.md)
- [prototype/reference-review/implementation-history/BEFORE_RUSH_VERIFICATION.md](prototype/reference-review/implementation-history/BEFORE_RUSH_VERIFICATION.md)
- [prototype/reference-review/implementation-history/BEFORE_RUSH_pachinko.md](prototype/reference-review/implementation-history/BEFORE_RUSH_pachinko.md)
- [prototype/reference-review/implementation-history/SPEC_BEFORE_PHYSICS_REPAIR.md](prototype/reference-review/implementation-history/SPEC_BEFORE_PHYSICS_REPAIR.md)
- [prototype/reference-review/implementation-history/VERIFICATION_BEFORE_PHYSICS_REPAIR.md](prototype/reference-review/implementation-history/VERIFICATION_BEFORE_PHYSICS_REPAIR.md)
- [prototype/reference-review/intro-zoom-2026-10-03/designer-review.md](prototype/reference-review/intro-zoom-2026-10-03/designer-review.md)
- [prototype/reference-review/intro-zoom-2026-10-03/lead-verification.md](prototype/reference-review/intro-zoom-2026-10-03/lead-verification.md)
- [prototype/reference-review/intro-zoom-2026-10-03/pm-review.md](prototype/reference-review/intro-zoom-2026-10-03/pm-review.md)
- [prototype/reference-review/intro-zoom-2026-10-03/root-review.md](prototype/reference-review/intro-zoom-2026-10-03/root-review.md)
- [prototype/reference-review/intro-zoom-2026-10-03/storyboard.md](prototype/reference-review/intro-zoom-2026-10-03/storyboard.md)
- [prototype/reference-review/kyuin/REVIEW.md](prototype/reference-review/kyuin/REVIEW.md)
- [prototype/reference-review/lunar-decor-2026-10-03/REVIEW.md](prototype/reference-review/lunar-decor-2026-10-03/REVIEW.md)
- [prototype/reference-review/moon-cues-2026-10-03/REVIEW.md](prototype/reference-review/moon-cues-2026-10-03/REVIEW.md)
- [prototype/reference-review/moon-hidden-idle-2026-10-03/REVIEW.md](prototype/reference-review/moon-hidden-idle-2026-10-03/REVIEW.md)
- [prototype/reference-review/moon-locked-color-2026-10-03/REVIEW.md](prototype/reference-review/moon-locked-color-2026-10-03/REVIEW.md)
- [prototype/reference-review/moon-reliability-2026-10-03/REVIEW.md](prototype/reference-review/moon-reliability-2026-10-03/REVIEW.md)
- [prototype/reference-review/natural-moon-2026-10-03/REVIEW.md](prototype/reference-review/natural-moon-2026-10-03/REVIEW.md)
- [prototype/reference-review/pachinko-type/REVIEW.md](prototype/reference-review/pachinko-type/REVIEW.md)
- [prototype/reference-review/pin-layout/REVIEW.md](prototype/reference-review/pin-layout/REVIEW.md)
- [prototype/reference-review/pin-layout/WIKIPEDIA_NOTES.md](prototype/reference-review/pin-layout/WIKIPEDIA_NOTES.md)
- [prototype/reference-review/pixi-777-only/README.md](prototype/reference-review/pixi-777-only/README.md)
- [prototype/reference-review/pixi-attacker/README.md](prototype/reference-review/pixi-attacker/README.md)
- [prototype/reference-review/pixi-basic-reach/README.md](prototype/reference-review/pixi-basic-reach/README.md)
- [prototype/reference-review/pixi-basic-win/README.md](prototype/reference-review/pixi-basic-win/README.md)
- [prototype/reference-review/pixi-board/README.md](prototype/reference-review/pixi-board/README.md)
- [prototype/reference-review/pixi-bonus-round/README.md](prototype/reference-review/pixi-bonus-round/README.md)
- [prototype/reference-review/pixi-castle-continuous/README.md](prototype/reference-review/pixi-castle-continuous/README.md)
- [prototype/reference-review/pixi-central-start/README.md](prototype/reference-review/pixi-central-start/README.md)
- [prototype/reference-review/pixi-centre-reveal/README.md](prototype/reference-review/pixi-centre-reveal/README.md)
- [prototype/reference-review/pixi-character-coherent/README.md](prototype/reference-review/pixi-character-coherent/README.md)
- [prototype/reference-review/pixi-cloud-water/README.md](prototype/reference-review/pixi-cloud-water/README.md)
- [prototype/reference-review/pixi-eclipse-after-win/README.md](prototype/reference-review/pixi-eclipse-after-win/README.md)
- [prototype/reference-review/pixi-eclipse-before-stop/README.md](prototype/reference-review/pixi-eclipse-before-stop/README.md)
- [prototype/reference-review/pixi-eclipse-mechanism/README.md](prototype/reference-review/pixi-eclipse-mechanism/README.md)
- [prototype/reference-review/pixi-entry-authored-v2/README.md](prototype/reference-review/pixi-entry-authored-v2/README.md)
- [prototype/reference-review/pixi-entry-continuous/README.md](prototype/reference-review/pixi-entry-continuous/README.md)
- [prototype/reference-review/pixi-entry-patterns/README.md](prototype/reference-review/pixi-entry-patterns/README.md)
- [prototype/reference-review/pixi-entry-payoff/README.md](prototype/reference-review/pixi-entry-payoff/README.md)
- [prototype/reference-review/pixi-hair-fine/README.md](prototype/reference-review/pixi-hair-fine/README.md)
- [prototype/reference-review/pixi-hair-flow/README.md](prototype/reference-review/pixi-hair-flow/README.md)
- [prototype/reference-review/pixi-hair-strands/README.md](prototype/reference-review/pixi-hair-strands/README.md)
- [prototype/reference-review/pixi-hair-tips/README.md](prototype/reference-review/pixi-hair-tips/README.md)
- [prototype/reference-review/pixi-holds/README.md](prototype/reference-review/pixi-holds/README.md)
- [prototype/reference-review/pixi-launcher/README.md](prototype/reference-review/pixi-launcher/README.md)
- [prototype/reference-review/pixi-lcd/README.md](prototype/reference-review/pixi-lcd/README.md)
- [prototype/reference-review/pixi-lcd/REVIEW-2026-09-30.md](prototype/reference-review/pixi-lcd/REVIEW-2026-09-30.md)
- [prototype/reference-review/pixi-left-entry/README.md](prototype/reference-review/pixi-left-entry/README.md)
- [prototype/reference-review/pixi-left-finish/README.md](prototype/reference-review/pixi-left-finish/README.md)
- [prototype/reference-review/pixi-normal-pocket/README.md](prototype/reference-review/pixi-normal-pocket/README.md)
- [prototype/reference-review/pixi-normal-spin/README.md](prototype/reference-review/pixi-normal-spin/README.md)
- [prototype/reference-review/pixi-outlet/README.md](prototype/reference-review/pixi-outlet/README.md)
- [prototype/reference-review/pixi-pass-gate/README.md](prototype/reference-review/pixi-pass-gate/README.md)
- [prototype/reference-review/pixi-payout-focus-soft/README.md](prototype/reference-review/pixi-payout-focus-soft/README.md)
- [prototype/reference-review/pixi-payout-focus/README.md](prototype/reference-review/pixi-payout-focus/README.md)
- [prototype/reference-review/pixi-payout-gentle-yaw/README.md](prototype/reference-review/pixi-payout-gentle-yaw/README.md)
- [prototype/reference-review/pixi-payout-gradient/README.md](prototype/reference-review/pixi-payout-gradient/README.md)
- [prototype/reference-review/pixi-payout-impact/README.md](prototype/reference-review/pixi-payout-impact/README.md)
- [prototype/reference-review/pixi-payout-perspective/README.md](prototype/reference-review/pixi-payout-perspective/README.md)
- [prototype/reference-review/pixi-payout-reel-background/README.md](prototype/reference-review/pixi-payout-reel-background/README.md)
- [prototype/reference-review/pixi-payout-reveal/README.md](prototype/reference-review/pixi-payout-reveal/README.md)
- [prototype/reference-review/pixi-payout-subtle-yaw/README.md](prototype/reference-review/pixi-payout-subtle-yaw/README.md)
- [prototype/reference-review/pixi-payout-yaw16/README.md](prototype/reference-review/pixi-payout-yaw16/README.md)
- [prototype/reference-review/pixi-pins/README.md](prototype/reference-review/pixi-pins/README.md)
- [prototype/reference-review/pixi-rainbow-win/README.md](prototype/reference-review/pixi-rainbow-win/README.md)
- [prototype/reference-review/pixi-reach-impact/README.md](prototype/reference-review/pixi-reach-impact/README.md)
- [prototype/reference-review/pixi-resin/README.md](prototype/reference-review/pixi-resin/README.md)
- [prototype/reference-review/pixi-revival-entry/README.md](prototype/reference-review/pixi-revival-entry/README.md)
- [prototype/reference-review/pixi-right-start/README.md](prototype/reference-review/pixi-right-start/README.md)
- [prototype/reference-review/pixi-rush-66/README.md](prototype/reference-review/pixi-rush-66/README.md)
- [prototype/reference-review/pixi-rush-background/README.md](prototype/reference-review/pixi-rush-background/README.md)
- [prototype/reference-review/pixi-rush-bright-shine/README.md](prototype/reference-review/pixi-rush-bright-shine/README.md)
- [prototype/reference-review/pixi-rush-drop/README.md](prototype/reference-review/pixi-rush-drop/README.md)
- [prototype/reference-review/pixi-rush-end/README.md](prototype/reference-review/pixi-rush-end/README.md)
- [prototype/reference-review/pixi-rush-ending/README.md](prototype/reference-review/pixi-rush-ending/README.md)
- [prototype/reference-review/pixi-rush-entry/README.md](prototype/reference-review/pixi-rush-entry/README.md)
- [prototype/reference-review/pixi-rush-impact/README.md](prototype/reference-review/pixi-rush-impact/README.md)
- [prototype/reference-review/pixi-rush-letter-shine/README.md](prototype/reference-review/pixi-rush-letter-shine/README.md)
- [prototype/reference-review/pixi-rush-rainbow-center/README.md](prototype/reference-review/pixi-rush-rainbow-center/README.md)
- [prototype/reference-review/pixi-rush-reach/README.md](prototype/reference-review/pixi-rush-reach/README.md)
- [prototype/reference-review/pixi-rush-win/README.md](prototype/reference-review/pixi-rush-win/README.md)
- [prototype/reference-review/pixi-water-only/README.md](prototype/reference-review/pixi-water-only/README.md)
- [prototype/reference-review/pixi-windmill/README.md](prototype/reference-review/pixi-windmill/README.md)
- [prototype/reference-review/rail-pass-2026-10-03/acceptance-scope.md](prototype/reference-review/rail-pass-2026-10-03/acceptance-scope.md)
- [prototype/reference-review/rail-pass-2026-10-03/before-render-fit/designer-diagnosis.md](prototype/reference-review/rail-pass-2026-10-03/before-render-fit/designer-diagnosis.md)
- [prototype/reference-review/rail-pass-2026-10-03/designer-diagnosis.md](prototype/reference-review/rail-pass-2026-10-03/designer-diagnosis.md)
- [prototype/reference-review/rail-pass-2026-10-03/designer-render-review.md](prototype/reference-review/rail-pass-2026-10-03/designer-render-review.md)
- [prototype/reference-review/rail-pass-2026-10-03/lead-verification.md](prototype/reference-review/rail-pass-2026-10-03/lead-verification.md)
- [prototype/reference-review/rail-pass-2026-10-03/pm-review.md](prototype/reference-review/rail-pass-2026-10-03/pm-review.md)
- [prototype/reference-review/rail-pass-2026-10-03/verification.md](prototype/reference-review/rail-pass-2026-10-03/verification.md)
- [prototype/reference-review/tokyoghoul-w-analysis/acceptance-ledger.md](prototype/reference-review/tokyoghoul-w-analysis/acceptance-ledger.md)
- [prototype/reference-review/tokyoghoul-w-analysis/completeness-audit.md](prototype/reference-review/tokyoghoul-w-analysis/completeness-audit.md)
- [prototype/reference-review/tokyoghoul-w-analysis/lead-audit.md](prototype/reference-review/tokyoghoul-w-analysis/lead-audit.md)
- [prototype/reference-review/tokyoghoul-w-analysis/signals.pdf](prototype/reference-review/tokyoghoul-w-analysis/signals.pdf)
- [prototype/reference-review/tokyoghoul-w-handoff/designer-review.md](prototype/reference-review/tokyoghoul-w-handoff/designer-review.md)
- [prototype/reference-review/tokyoghoul-w-live-2026-10-03/root-review.md](prototype/reference-review/tokyoghoul-w-live-2026-10-03/root-review.md)
- [prototype/reference-review/tokyoghoul-w-live-2026-10-03/verification.md](prototype/reference-review/tokyoghoul-w-live-2026-10-03/verification.md)
- [prototype/reference-review/tokyoghoul-w-live/verification.md](prototype/reference-review/tokyoghoul-w-live/verification.md)
- [prototype/reference-review/upper-character-sword-2026-10-03/REVIEW.md](prototype/reference-review/upper-character-sword-2026-10-03/REVIEW.md)
- [prototype/reference-review/upper-moon-slash-2026-10-03/REVIEW.md](prototype/reference-review/upper-moon-slash-2026-10-03/REVIEW.md)
- [prototype/reference-review/view-switch-2026-10-03/designer-review.md](prototype/reference-review/view-switch-2026-10-03/designer-review.md)
- [prototype/reference-review/view-switch-2026-10-03/lead-verification.md](prototype/reference-review/view-switch-2026-10-03/lead-verification.md)
- [prototype/reference-review/view-switch-2026-10-03/pm-review.md](prototype/reference-review/view-switch-2026-10-03/pm-review.md)
- [prototype/reference-review/view-switch-2026-10-03/root-review.md](prototype/reference-review/view-switch-2026-10-03/root-review.md)


### 月影機関の改善レビュー 2026年10月5日

- [統合した改善点一覧](prototype/improvement-review/2026-10-05/README.md)
- [抽選・状態の詳細](prototype/improvement-review/2026-10-05/game-flow.md)
- [演出の詳細](prototype/improvement-review/2026-10-05/presentation.md)
- [初心者案内の詳細](prototype/improvement-review/2026-10-05/onboarding.md)
- [改善作業のMermaid](prototype/improvement-review/2026-10-05/improvements.mmd)

### 液晶主役の長尺リーチ 2026年10月5日

- [リーチの絵コンテ（現行54秒）](prototype/long-reach/STORYBOARD.md)
- [旧90秒版の実装・エンジン比較・検証の履歴](prototype/long-reach/IMPLEMENTATION.md)

- [最新訂正：54秒の攻防・案内文言の点検](prototype/long-reach/REVISION-54S.md)

- [月影機関の全演出パターン表](prototype/PRESENTATION_PATTERNS.md)：通常・RUSHの全ルート、戦闘信頼度、復活・直当たり・プレミア、月予告12種類、突入6種類、獲得・継続・終了。制作目標と実装状況を区別。

- [54秒本編の変化と連続抑制](prototype/long-reach/VARIETY.md)：3種類の攻防と当落に依存しない選択。

- [復活58秒・RUSH即告知12秒](prototype/long-reach/SPECIALS.md)：特殊決着の接続、当落と月予告の維持、検証記録。

- [並列制作の担当・引き継ぎ](prototype/long-reach/PARALLEL_DELIVERY.md)：演出配分／新規ルート／戦闘品質の3セッション、編集範囲、統合と品質確認の条件。

- [全演出パターンの本編統合](prototype/long-reach/INTEGRATION.md)：配分・短尺・直当たり・プレミア・敗北/復活の接続、回帰・実画面確認、素材品質の残作業。

- [東京喰種Wの予告・リーチ構造の照合](prototype/long-reach/W_PREDICTION_STRUCTURE.md)：先読み・リーチ前・発展・チャンスアップの役割、公式情報と月影の未実装範囲。

- [予告・発展構造の実装対応](prototype/long-reach/PREDICTION_IMPLEMENTATION.md)：掲載全項目から月影への翻案、通常／RUSH・保留・発展・全回転、専用映像の未達と検証範囲。

- [続行分の本編受け入れ確認](prototype/long-reach/QUALITY_ACCEPTANCE.md)：長髪・専用5映像・入賞済み当落固定の修正と、全尺/タッチ/再入場/比較/長期検証の範囲。
- [専用5映像の制作と編集](prototype/long-reach/STORY_PRESENTATIONS.md)：決意・回想・門の防衛・追跡・救出の素材と、通常/RUSHのカット構成。

- [決意の一閃：溜めから一撃へ](prototype/long-reach/RESOLVE_SINGLE_STRIKE.md)：反復斬撃を廃止し、一撃の加速・接触保持・振り抜きへ集中。

- [オリジナル効果音・割当と試聴](prototype/ORIGINAL_SE.md)

- [効果音の素材感・溜め・ミックスの仕上げ](prototype/SOUND_FINISH.md)
