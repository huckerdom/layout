requirejs.config({

  baseUrl: '/static/js',

  paths: {
    jquery: ['http://code.jquery.com/jquery-1.9.1.min', 'scripts/js/jquery'],
    raphael: ['https://raw.github.com/DmitryBaranovskiy/raphael/master/raphael-min', 'scripts/js/raphael'],
    knockout: ['http://knockoutjs.com/downloads/knockout-2.2.1', 'scripts/js/knockout'],
    game: ['game', 'http://huckerdom.github.io/layout/static/js/game']
  }

});
