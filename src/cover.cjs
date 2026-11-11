'use strict';
const deck = require('./market-deck.cjs');
const deckJSON = JSON.stringify(deck).replace(/</g, '\\u003c');

function coverHTML(withFilm = false) {
  return `<header class="home-intro atlas-cover" data-atlas-cover aria-labelledby="cover-title">
    <div class="market-scene" data-cover-layer="scene"><img src="assets/market-scene.webp" fetchpriority="high" width="1672" height="941" alt="晨光穿过铁架玻璃拱顶，照在菜摊之间的石板路上。"></div>
    <div class="market-shade" aria-hidden="true"></div>
    <div class="cover-mast"><span>中级微观经济学</span><a class="cover-directory" href="catalog.html">课程目录 <span aria-hidden="true">↗</span></a></div>
    <div class="market-copy">
      <h1 id="cover-title">市场之中</h1>
      <p class="market-lead">第一次学，从生活里的选择开始。<br>准备考试，带着题型和公式进场。</p>
      <nav class="market-routes" aria-label="学习通道">
        <a class="primary home-open" href="learn.html">生活例子理解版 <span aria-hidden="true">→</span></a>
        <a class="formula-door" href="formula-4h.html">4h 速通公式版 <span aria-hidden="true">→</span></a>
      </nav>
      <div class="market-extras"><button type="button" class="market-summon" hidden>随机看一张图</button>
      ${withFilm ? '<button type="button" class="reel-replay" hidden>重播片头</button>' : ''}</div>
    </div>
    <script type="application/json" data-market-deck>${deckJSON}</script>
  </header>`;
}
module.exports = { coverHTML };
