# 台一覧/詳細の全筐体表示確認・2026-10-03

ユーザーは遊技中の台拡大を採用し、一覧/詳細は筐体全体を要求。現実装は既にこの区分を満たすため、製品コードと素材を変更せず採用を確認した。

`floor-art.js` は48×64の既存 `arcadeCabinetTexture` 全体を描く。一覧は整数pixel scale、詳細は縦横同じcontain scale。屋根/肩/ガラス/上皿/裾/右ハンドルが全体に含まれる。遊技rendererの396×436 cropはこのrendererへ適用されない。

今回新しく撮影したPC1280×960、mobile390×844、small320×568の一覧/詳細6枚と `../../../../prototype/reference-review/cabinet-overview-2026-10-03/lead-geometry.json` を保存。詳細hostと実rendererサイズはそれぞれ490×500、362×260、292×260で一致、横overflowなし。smallの一覧/詳細を目視し筐体の上下/ハンドルの欠けなし。PC一覧は既存floorの縦scroll構造であり、20台全てを全画面に収める構造へ変更したものではない。

`before-*.png` と対応する `floor-*.png` / `detail-*.png` は同じ今回の撮影を安定名へ複製したもの。コード無変更なのでbefore/after差分を捏造しない。

未使用事項: `mountCabinetArt(kind='dummy')` はactive引数を省略しており一覧と表示が異なるが、現ユーザーフローはdummy選択不可。今回の全体表示要望には不要と統括判断しメモに留めた。

ローカルのみ。新素材制作/SE/物理/遊技UI変更/クラウド更新なし。
