requirejs.config({

  baseUrl: 'static/js',

  paths: {
    jquery: ['http://code.jquery.com/jquery-1.9.1.min', 'scripts/js/jquery'],
    raphael: ['https://raw.github.com/DmitryBaranovskiy/raphael/master/raphael-min', 'scripts/js/raphael'],
    game: ['game', 'http://huckerdom.github.io/layout/static/js/game']
  }

});

// Start the main app logic.
requirejs(['jquery', 'raphael', 'game'],
          function   ($, Raphael, Game) {
            window.Game.create_instances();
          });
