requirejs.config({

  baseUrl: 'static/js',

  paths: {
    jquery: ['http://code.jquery.com/jquery-1.9.1.min', 'scripts/js/jquery'],
    raphael: ['https://raw.github.com/DmitryBaranovskiy/raphael/master/raphael-min', 'scripts/js/raphael'],
    ractive: ['https://raw.github.com/Rich-Harris/Ractive/master/release/0.3.4/Ractive.min', 'scripts/js/Ractive.min'],
    game: ['game', 'http://huckerdom.github.io/layout/static/js/game']
  }

});

// Start the main app logic.
requirejs(['jquery', 'raphael', 'ractive', 'game'],
          function   ($, Raphael, Ractive, Game) {
            // FIXME: Hack to avoid fixing game.js to use define?
            window.Ractive = Ractive;
            window.Game.create_instances();
          });
