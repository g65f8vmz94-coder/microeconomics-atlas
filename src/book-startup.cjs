'use strict';

exports.filmMarkup = function (art,plates) {
  const sources = ['en','zh'].filter(lang => art[lang]).map(lang =>
    '<img data-jacket="'+lang+'" alt="" src="'+art[lang]+'">').join('');
  return `<div class="market-film" aria-label="中级微观经济学开场" hidden>
    <div hidden>${sources}</div>
    <script type="application/json" data-book-plates>${JSON.stringify(plates).replace(/</g,'\\u003c')}</script>
    <canvas class="reel-paper" aria-hidden="true"></canvas>
    <div class="reel-tools"><button type="button" class="reel-full" hidden>全屏观看</button><button type="button" class="reel-skip" aria-label="跳过片头" aria-keyshortcuts="Escape">跳过</button></div>
  </div>`;
};
