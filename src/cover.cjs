'use strict';
const deck=require('./market-deck.cjs');
const deckJSON=JSON.stringify(deck).replace(/</g,'\\u003c');

function coverHTML() {
  return `<header class="home-intro atlas-cover" data-atlas-cover aria-labelledby="cover-title">
    <div class="market-scene" data-cover-layer="scene"><img src="assets/market-scene.webp" fetchpriority="high" width="1672" height="941" alt="晨光穿过铁架玻璃拱顶，照在菜摊之间的石板路上。"></div>
    <div class="market-shade" aria-hidden="true"></div>
    <div class="market-copy">
      <p class="market-course">中级微观经济学</p>
      <h1 id="cover-title">市场之中</h1>
      <p class="market-lead">在市场里停一停，拖动图上的点，看看选择怎样改变。</p>
      <a class="primary home-open" href="learn.html">进入全书随题图解<span aria-hidden="true">→</span></a>
      <button type="button" class="market-summon" hidden>随机看一张图</button>
    </div>
    <div class="market-figure" data-cover-layer="boy"><img src="assets/market-boy.webp" alt="穿着赭红外套的少年背向我们，望向市场深处。"></div>
    <script type="application/json" data-market-deck>${deckJSON}</script>
  </header>`;
}

module.exports = {coverHTML};
