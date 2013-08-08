requirejs.config({

  baseUrl: '/static/js',

  shim: {
    'simulate': ['jquery']
  },

  paths: {
    jquery: ['http://code.jquery.com/jquery-1.9.1.min', 'scripts/js/jquery'],
    simulate: ['jquery-simulate'],
    raphael: ['https://raw.github.com/DmitryBaranovskiy/raphael/master/raphael-min', 'scripts/js/raphael'],
    game: ['game', 'http://huckerdom.github.io/layout/static/js/game']
  }

});

// Start the main app logic.
requirejs(['jquery', 'simulate', 'raphael', 'game'],
          function () {
            QUnit.load();
            QUnit.start();
          });
