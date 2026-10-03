# 実台の全体→盤面→液晶：独立デザインレビュー

2026-10-03。新たなユーザー指示により、簡略48×64素材の詳細拡大を採用する従来レビューは今回の要望への合格根拠としない。本レビューは導入実装後のローカルソースを独立起動・新規撮影した結果。

全体に既存高詳細 `moonlit-pachinko-frame.png` を使用し、中央の透明開口の背面へ実際の本編sceneを置く。別の顔や図柄の代替絵へ切り替えず、同じsceneのcameraを全体→採用済み盤面範囲→LCD→盤面範囲へ約3.8秒で移動。枠の配置倍率1.7は素材開口へ視覚的に合わせた値であり、実機寸法ではない。

PC1280×960とスマホ390×844のwhole/盤面/LCD/完了画像を実際に開いた。冠、左右柱、上皿、下部裾、右ハンドルが全体内に収まる。実盤面の釘、右経路、キャラ顔、図柄、月、城が継続して見える。0.8～1.5秒の外枠fadeを含む拡大に、別素材へ替わる不連続や白flashは見られない。LCDcameraには既存キャラ・図柄を維持し、終了後は従来の広い盤面表示へ戻る。

通常intro中のsnapshotはwhole→board→lcd→returnの各active状態でspent=0。3.8秒complete後はspent=1→2へ進行。skipは直後complete/spent=0、続いて1→3。reduced-motionは最初からcomplete/elapsed=0で通常盤面、spentが進行。4ケースpageerror=0。skipとreduced-motionの初期画面も視認し、枠や拡大状態を残さない。

証拠：designer-check.mjs/json、designer-{mobile,desktop,skip,reduce}-*.png、designer-videos/*.webm、designer-mobile-motion.jpg。動画は0.5秒間隔の復号frame列を独立に視認したもので、全編連続再生したとの主張ではない。frame列先頭は台選択ロード中、最後の黒セルはtile余白。

非阻害所見：スマホの全体表示は通常canvasのアスペクト比を維持するため約234×390px。画面全高の最大利用ではないが、全筐体と同一本編sceneの導入は成立する。通常盤面の採用済みサイズを安全に保持し、ここを理由に物理や素材を変更する必要はない。
