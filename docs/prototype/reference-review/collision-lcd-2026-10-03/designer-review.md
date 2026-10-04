# 保留の見切れ・図柄縦中央：実装と表示確認

2026-10-03、今回変更後の新規撮影。採用月影機関の人物・世界観・pixel素材、LCDの開口形状、物理と抽選stateは維持。

旧保留active中心x45/y130、台座x36〜155/y124〜138はLCD左下の斜辺にかかる。論理210×140内の実開口は、y134で左境界約49。このためactive球左下x41/y134がmask外。保留描画rootだけ右22へ移しactive中心67、待ち保留91/109/127/145/163、台座58〜177へ配置。hold-motionの識別・動き・容量・ゲームstateは変更しない。

LCD_LAYOUTの矩形中心は論理y70、LCD_OPENINGの面積重心は約(105.8,62.8)。旧normal図柄中心89を63へ、旧RUSH77.5を65.5へ移す。RUSHは既存上部status28pxと高さ75pxの図柄を干渉させないtop28が必要なので重心から2.7px下とする。通常の陰影と通常/RUSH勝利777のpivot・配置も新中心へ同期。背景・キャラは動かさない。採用済み一撃777の6倍ズームと意図的画面カットは維持。

変更：normal-spin-view.js、hold-view.js、新lcd-safe-layout.js、新tests/lcd-safe-layout.test.js。lcd-view.jsとLCDmaskは変更不要。独立PMレビュー合格。

PC1280×960とスマホ390×844、normal/RUSH定常/勝利RUSH777/CHARGE300/通常777/リーチ/右打ち案内×全3viewの42画像を新規撮影。代表画像を実際に開き、active＋待ち4の5球と台座が左下斜辺に切られないこと、正常3図柄と戻り777が中央寄りになること、RUSHstatusと図柄・保留の間が空くことを確認。リーチ・CHARGE300・右打ち案内も保留列とは重ならず、案内時の既存減光を通して保留が残る。全体viewは台が小さいため保留も小さいが、欠けず5つの点を維持。

撮影は明示した表示fixture：遊技pause、active id＋待ち4のidentityを設定し、保留着地/RUSH導入終了/案内表示のため表示clockを直接進めた。自然入賞・抽選・払出が成功したとの根拠にはしない。guide用にflow表示clockも進めた。JSONに方法を明示。14 phase/端末条件のpageerrorは全0。

node6件全成功。polygonテストは最大6保留のglyph入場〜着地全域、台座、通常図柄のbox、RUSH図柄の可視glyph範囲と下線が実開口内に収まることを検証。RUSHの透明texture隅は表示pixelでないため可視glyph範囲で確認。guide/文字は代表表示画像で確認し、全位相の全pixel解析との主張はしない。

証拠：designer-check.mjs/json、designer-*.png、designer-tests.log、designer-source-sha256.txt。自然発射の最新動画はLEが再撮影、rootが独立再生確認する。
