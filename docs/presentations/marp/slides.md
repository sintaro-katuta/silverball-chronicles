---
marp: true
theme: base
size: 16:9
paginate: true
lang: ja
title: 個人開発紹介
---

<!-- _class: lead -->
<!-- _paginate: false -->

# 個人開発紹介

カツタシンタロウ

<!-- 名前／趣味の個人開発 -->

---

<!-- _class: ranobe-title -->
<!-- _paginate: false -->

![bg](assets/ranobe-cover-v9.png)

# <span class="title-line title-intro">ローグライク好きの私ですが、</span><span class="title-line title-with"><span class="title-ai">AI</span>と一緒に</span><span class="title-line title-catch"><span class="dopagaki">ドパガキ</span>に刺さる</span><span class="title-line title-focus"><span class="title-pachinko">パチンコ</span><span class="title-particle">を</span></span><span class="title-line title-question">作ってもいいですか？</span>

<!-- ローグライク好き／AIと一緒にパチンコを作る -->

---

# ゲームが趣味

[これまで遊んだゲームを見る](https://playtime-panorama.superserio.us/76561199132069185)

<!-- Steam履歴／ゲーム紹介は軽く -->

---

<!-- _class: game-genres -->

# よく遊んでいるゲームのジャンル

<div class="genre-bubbles" role="img" aria-label="ジャンル別の累計プレイ時間。円の面積が時間に比例し、FPS・TPSが最も大きい。">
<div class="genre-bubble" style="left:10.00px;top:40.00px;width:360.00px;height:360.00px;background:#2455b8;font-size:38px" aria-label="FPS・TPS：累計約1755時間"><span>FPS・TPS</span></div>
<div class="genre-bubble" style="left:414.11px;top:24.11px;width:191.79px;height:191.79px;background:#187d72;font-size:25px" aria-label="サバイバル・クラフト：累計約498時間"><span>サバイバル<br/>クラフト</span></div>
<div class="genre-bubble" style="left:682.10px;top:27.10px;width:155.79px;height:155.79px;background:#b97123;font-size:25px" aria-label="シミュレーション：累計約329時間"><span>シミュレー<br/>ション</span></div>
<div class="genre-bubble" style="left:611.93px;top:281.93px;width:106.14px;height:106.14px;background:#6264b7;font-size:20px" aria-label="工場・自動化：累計約153時間"><span>工場・<br/>自動化</span></div>
<div class="genre-bubble" style="left:417.09px;top:277.09px;width:115.82px;height:115.82px;background:#b52b58;font-size:17px" aria-label="ローグライク・ローグライト：累計約182時間"><span>ローグライク<br/>ローグライト</span></div>
<div class="genre-bubble" style="left:917.92px;top:57.92px;width:134.16px;height:134.16px;background:#8b593f;font-size:20px" aria-label="アクションRPG：累計約244時間"><span>アクション<br/>RPG</span></div>
<div class="genre-bubble" style="left:823.30px;top:253.30px;width:153.40px;height:153.40px;background:#6c7a89;font-size:25px" aria-label="その他：累計約319時間"><span>その他</span></div>
</div>

<!-- FPSが多い／今回はローグライク -->

---

<!-- _class: invert shout -->
<!-- _paginate: false -->

# <span class="metal-red">パチンコ</span><span class="particle">が</span><span class="metal-silver">やりたい！</span>

<!-- スマホのメダルゲーム／手軽に遊びたい／だから作る -->

---

<!-- _class: equation -->
<!-- _paginate: false -->

# ローグライク <span class="multiply">×</span> パチンコ <span class="equals">＝</span> <span class="game-title">ドパガキ</span>

<!-- 好きな2つを掛け合わせる -->

---

<!-- _class: roguelike -->

# よく遊ぶのはローグライク

強化を選んで生き残り、次の挑戦へ。

![w:1120 Vampire Survivorsの流れ：敵を倒し、経験値で強化を選ぶ。プレイ終了後はコインで永続強化し、再挑戦](assets/roguelike.png)

<!-- 敵 → 経験値 → 強化／終了 → 永続強化 → 再挑戦 -->

---

<!-- _class: pachinko-intro -->

# パチンコって、どう遊ぶ？

![w:1120 パチンコの遊び方：玉を打ってヘソに入賞させ、大当りを抽選。当たれば出玉を獲得し、条件を満たすとRUSHへ。RUSHでは大当りの連続を目指し、終了後は通常へ戻る](assets/pachinko.png)

<!-- ヘソ → 抽選 → 大当り → RUSH -->

---

<!-- _class: original-machine -->

# 初めはオリジナルの台を作ろうとしたけど、

<p class="no-thrill">脳汁はでない。</p>

<!-- 動くだけでは、気持ちよくない -->

---

<!-- _class: machine-spec -->

# e 東京喰種（通常版）

<div class="machine-layout">
<figure class="machine-photo"><img src="assets/tokyoghoul-machine.png" alt="通常版 e 東京喰種の筐体"/></figure>
<div class="machine-numbers">
<table>
<tbody>
<tr><th>通常時の図柄揃い</th><td>約 1 / 399.9</td></tr>
<tr><th>大当り確率（チャージ込み）</th><td>約 1 / 199.9</td></tr>
<tr><th>RUSH突入率</th><td>約 51% <small>（チャージ含む）</small></td></tr>
<tr><th>RUSH継続率</th><td>約 75% <small>（ST130回）</small></td></tr>
<tr><th>初当り出玉（図柄揃い）</th><td>1,500個</td></tr>
<tr><th>RUSH中の出玉</th><td>3,000個以上</td></tr>
</tbody>
</table>

</div>
</div>

<!-- 参考にした通常版／見た目・スペック -->

---

<!-- _class: video-slide -->

# 東京喰種の演出

<video controls playsinline preload="metadata" poster="assets/tokyoghoul-modes.webp" aria-label="公式 パチンコ東京喰種 モード紹介まとめ動画"><source src="assets/tokyoghoul-modes.mp4" type="video/mp4"/>動画を再生できない場合は、同梱のMP4を開いてください。</video>

<!-- 映像・光・役物・音を見る -->

---

<!-- _class: unknown-terms -->

# 用語がわかんない。

<div class="terms-scene">
<img src="assets/irasutoya-confused-man.png" alt="専門用語に囲まれ、頭にクエスチョンマークを浮かべて困惑している男性"/>
<span class="term term-rush">RUSH？</span>
<span class="term term-heso">ヘソ？</span>
<span class="term term-nyusho">入賞？</span>
<span class="term term-st">ST？</span>
<span class="term term-tokuzu">特図？</span>
<span class="term term-zugara">図柄揃い？</span>
</div>

<!-- 自分も用語を知らなかった -->

---

<!-- _class: youtube-learning -->

# まずは<span>YouTube</span>で勉強する。

実機の動画を見ながら、用語と遊びの流れを覚える。

<div class="youtube-thumbnails">
<a href="https://www.youtube.com/watch?v=rimXVYU_qdg" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/rimXVYU_qdg.jpg" alt="【素材】高音質 ユニコーン3000FEVERの脳汁演出と音 #ぱちんこ #ユニコーン #UC"/></a>
<a href="https://www.youtube.com/watch?v=NakloAPrNTI&amp;t=291s" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/NakloAPrNTI.jpg" alt="【ASMR】32分耐え切れたら最強！脳に響くぱちんこ確定音、４５◯連発！『パチンコ演出集』【たぬパチ！】"/></a>
<a href="https://www.youtube.com/watch?v=lhdA-1R2t1Y" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/lhdA-1R2t1Y.jpg" alt="【再現】e Re:ゼロ2　落ちブル〜強欲3000 BONUSの音 再現してみた"/></a>
<a href="https://www.youtube.com/watch?v=T0-EQM9ElL0&amp;t=30s" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/T0-EQM9ElL0.jpg" alt="パチンコ大当たりギミック集① 役物集 その1"/></a>
<a href="https://www.youtube.com/watch?v=IRvp0ammDbg&amp;t=22s" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/IRvp0ammDbg.jpg" alt="【確変とは？】世界一丁寧なパチンコ初心者講座【時短って？】"/></a>
<a href="https://www.youtube.com/watch?v=dCnV9syTbY4&amp;t=532s" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/dCnV9syTbY4.jpg" alt="パチンコ大当たりギミック集⑩【15機種】役物集 その10"/></a>
<a href="https://www.youtube.com/watch?v=oE3A1TSjEEA&amp;t=253s" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/oE3A1TSjEEA.jpg" alt="【脳汁効果音】パチンコの脳が壊れる効果音の演出達"/></a>
</div>

<!-- 実機動画で学ぶ／AI任せにしない -->

---

<!-- _class: learning-pick -->

# 特にわかりやすかったのが、粗品の解説。

<div class="learning-pick-layout">
<div class="learning-pick-intro"><a href="https://www.youtube.com/watch?v=IRvp0ammDbg&amp;t=22s" target="_blank" rel="noopener noreferrer"><img src="assets/youtube-study/IRvp0ammDbg.jpg" alt="粗品 Official Channel：【確変とは？】世界一丁寧なパチンコ初心者講座【時短って？】"/></a><p>文字起こしして、内容を整理。<br/><strong>話の流れをフロー図にした。</strong></p></div>
<a class="learning-pick-diagram" href="assets/soshina-overview.png" target="_blank" rel="noopener noreferrer"><img src="assets/soshina-overview.png" alt="粗品さんのパチンコ初心者講座を整理した全体図。共通の遊び方、抽選と演出、STタイプ、確変ループタイプ、用語をまとめたフロー図"/></a>
</div>

<!-- 文字起こし → フロー図／基礎知識はわかったけど… -->

---

<!-- _class: breakdown -->

# でも、<span>ドパガキは作れなかった。</span>

<!-- 仕組みだけでは、ドキドキは作れない -->

---

<!-- _class: effects-mix -->

# <img class="melting-brain" src="assets/melting-brain.png" alt="とろける脳（脳汁）"/> ＝ 映像 × 発光 × ギミック × 効果音

<!-- 映像 × 発光 × ギミック × 効果音／刺激の重なり -->

---

<!-- _class: effects-learning -->

# 脳汁の作り方は、まだ勉強中。

<!-- どう効くかは勉強中／ロゴ・文字から -->

---

<!-- _class: roguelike-transition -->

# ローグライクは？

<!-- ローグライクをどう組み込む？ -->

---

<!-- _class: silverball-flow -->

# パチンコに、成長と選択を。

![銀玉クロニクルのゲームフロー](assets/silverball-game-flow.png)

<!-- 目標 → 3択 → 次へ／終了 → チケット → 永続強化 -->

---

<!-- _class: demo-transition -->

# デモ

<!-- ゲームへ切替／見せたらスライドへ戻る -->

---

<!-- _class: future-features -->

# 今後の機能追加・改善予定

- スキル
- 台選択UI
- 台としての完成度
- 共通の仕組みを土台に、他の台へ展開

<!-- スキル・UI・完成度／まず1台／他の台へ -->
