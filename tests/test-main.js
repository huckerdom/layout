requirejs.config({

  baseUrl: '/static/js',

  shim: {
    'simulate': ['jquery']
  },

  paths: {
    jquery: ['http://code.jquery.com/jquery-1.9.1.min', 'scripts/js/jquery'],
    simulate: ['jquery-simulate'],
    raphael: ['https://raw.github.com/DmitryBaranovskiy/raphael/master/raphael-min', 'scripts/js/raphael'],
    ractive: ['https://raw.github.com/Rich-Harris/Ractive/master/release/0.3.4/Ractive.min', 'scripts/js/Ractive.min'],    
    game: ['game', 'http://huckerdom.github.io/layout/static/js/game']
  }

});

// Start the main app logic.
requirejs(['jquery', 'simulate', 'raphael', 'ractive', 'game'],
          function () {
            QUnit.load();
            QUnit.start();
          });
