# プレイ中3view切替の独立デザインレビュー

2026-10-03。実装後の現在ローカルソースを別Vite/Playwrightブラウザで起動、新規撮影。PC1280×960、スマホ縦390×844、横844×390で全体/盤面/液晶×操作パネル開閉の18状態を確認。過去の導入成功を切替後の成功に流用していない。

合格。全体は既存高詳細frameの冠・左右柱・上皿・下部裾・右ハンドルと同一本編sceneを保持。盤面は採用済み範囲、液晶は同じキャラの顔・図柄・月・城を維持する。3viewbarは台と重ならず、操作・情報は全3viewで使用できる。スマホ縦は下部パネル、横とPCは横パネルへ配置。横844×390の全3viewopen画像で台をパネルが覆わず、液晶も図柄3つを残す。既存右打ちcutinはlcdRoot内の描画なのでLCDcamera範囲内を維持し、追加の未確認進行情報は表示しない。パネル下部は既存の内部スクロール。

玉経路の確認：全体frameの前面合成は入賞口を塞がない。現在snapshotのbonus/rush/normal3/start/fuzu各中心をframe素材座標へ変換しalphaを抽出、いずれも0。OUT中心は1/255でほぼ透明。結果はdesigner-frame-aperture-check.json。これは中心7点＋OUTの確認であり、球の全軌跡全画素を透明性検証したという主張ではない。全体画面では左釘・右入口・下部口が透過穴の中に見える。

全3端末の3viewはpaused=false、timeが順に増加し、spentが2〜3→4→6、パネルopen後も3→5→7へ進行。各選択後snapshot.viewとaria-pressedの1つの選択が一致。全条件pageerror=0、open時document横overflow=false。選択は表示変換のみで遊技が続く。

証拠：designer-check.mjs/json、designer-{mobile,landscape,desktop}-{whole,board,lcd}-{closed,open}.png、designer-videos/*.webm。designer-mobile-motion.jpgは動画から0.5秒間隔で復号したframe列を実際に視認し、導入→3view→操作開閉で別キャラへの切替、白flash、描画の途切れは見られない。全編連続再生との主張ではない。末尾の黒tileはpadding。
