test( "test all external packages loaded", function() {
  ok( window.jQuery, "We expect to have jQuery" );
  ok( window.Raphael, "We expect to have Raphael" );
  ok( window.Game.initialized, "We expect to have game.js intialized" );
});

module( "game-tests", {
  setup: function(){
    var fixture = $('#qunit-fixture');
    var layout = $('<div>').attr('class', 'layout').attr('width', 1200).attr('height', 600).appendTo(fixture);
    Game.create_instances();
  },
});

test( "Game instances are created correctly, when layout divs are present", function(){
  var layout = $('.layout');
  notEqual(layout.children().length, 0, "We expect the layout svg to be created");
  equal(Game.instances.length, 1, "We expect one game instance");
});


test("Reading game state works", function(){
  var game = Game.instances[0];
  var state = game.get_current_state();

  // Check if each players' state is correctly represented.
  state.players.forEach(function(player, idx){
    for (var x in player) {
      equal(game.players[idx][x], player[x], "state variable should match");
    }
  });

});

test("Check if saving and loading game works", function(){
  // Capture game state
  var game = Game.instances[0];
  game.capture_state();

  // Save game
  var saved_game = game.save_game();
  notEqual(saved_game.length, 0, "We expect a non-empty saved game state");

  // Change game state
  var old_x = game.players[0].x;
  game.players[0].x += 10;
  notEqual(game.players[0].x, old_x);

  // Update game with saved state and check if restored correctly
  game.update(saved_game);
  equal(game.players[0].x, old_x);

});
