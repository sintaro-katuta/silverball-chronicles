# 実際の店内写真と制服を参考に改訂

組み込みimage_genでv8を編集。ユーザー提供の店内写真を基準に、黒い天井、両側に並ぶ台と赤い椅子、吊り旗、紫・赤・黄の柄入りカーペットへ変更。店員は提供写真の制服（白シャツ・濃いベスト・赤系ネクタイ）を参考とし、実在人物の顔は再現しない。手前の遊技客と奥の客、写真風の質感を保つ。

最終画像：`assets/ranobe-cover-v9.png`

## プロンプト

Use case: precise-object-edit / compositing.
Input 1 EDIT TARGET is the existing photorealistic title background. Input 2 is authoritative REFERENCE for actual Japanese pachinko parlor architecture and decorative finishes. Input 3 is REFERENCE for staff uniform clothing only, NOT people's identity or posed promotional composition.
Keep the foreground ordinary middle-aged man's EXACT face, skin texture, salt-and-pepper hair, charcoal sweatshirt, beige trousers, seated pose, hand on launch handle, his blue fish-themed machine, and the second mildly streetwear-styled adult customer in middle distance. Keep candid photographic realism, not anime, not painting, not glamour or synthetic game art. Keep the foreground composition and 16:9 framing. Do not beautify protagonist.
Change room to match the REAL PARLOR in input 2:
- Replace blank beige wall and flat gray floor with a believable long narrow operating pachinko aisle, machines on both sides facing outward toward their corresponding seats. There are two opposite banks with the central walking aisle between their chairs; all geometry recedes toward one vanishing point. One red padded seat per cabinet, all attached/supported normally, no floating seats or intersecting rows.
- Real black exposed commercial ceiling with practical small white downlights/linear lights, not a spaceship ceiling. Gray woodgrain aisle-end panels and ordinary white structural columns, modest hanging promotional pennants supported from real ceiling points.
- Distinctive BUSY printed commercial CARPET from input 2: dark purple/black base with magenta, orange/yellow abstract marbled/splashed pattern. It is a physically printed carpet on floor, NOT glowing lava, magical rays, light trails or wet reflections. Use the colors and pattern of actual reference, don't exaggerate.
- Modest realistic promotional hanging banners and practical overhead per-machine data-counter panels. No fantasy RGB beams or huge gilded decorations. No readable new logo or nonsense foreground text.
Staff: retain exactly ONE adult male staff member in background aisle, but update uniform to the clothing in input 3: crisp white shirt, dark charcoal fitted waistcoat, muted red patterned necktie, small chest badge/pen, dark trousers. Natural attentive standing/walking posture, not promotional raised fist or heart gesture. Do not copy any real reference person's face; fictional anonymous staff face.
Placement: staff and extra customer remain in MIDDLE distance at center, foreground man dominates right. Left 38-42% is now realistic darker parlor background, slightly softer/less contrast so existing editable cover typography can be placed over it. Avoid shifting any person's face under the main title if possible. Keep title text out of generated image.
Lighting: natural ordinary commercial parlor, black ceiling moderately dark with white practical lighting and blue LED cabinets; mild wear and non-ideal surfaces; realistic skin. Do not go back to glamorous rainbow sparkle. No additional people beyond existing two customers and one staff. No watermark or title.
