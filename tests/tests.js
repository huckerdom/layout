QUnit.config.autostart = false;

module( "game-tests", {
  setup: function(){
    var fixture = $('#qunit-fixture');
    var layout = $('<div>').attr('class', 'layout').attr('width', 1200)
      .attr('height', 600).attr('data-mode', 'edit').appendTo(fixture);
    Game.create_instances();

  },
  teardown: function(){
    Game.reset();
  }
});

test( "Game instances are created correctly, when layout divs are present", function(){
  var layout = $('.layout');
  notEqual(layout.children().length, 0, "We expect the layout svg to be created");
  equal(Game.instances.length, 1, "We expect one game instance");
});


test("Reading game state works", function(){
  var game = Game.instances[0];
  var state = game.get_current_state();

  // Check if each player's state is correctly represented.
  for (var team in state.players) {
    for (var player in state.players[team]) {
      for (var x in state.players[team][player]) {
        var p = state.players[team][player]
        equal(game.players[p.type][p.id][x], p[x], "state variable should match");
      }
    }
  };

  // Check if each disc's state is correctly represented.
  for (var disc_id in state.discs) {
    for (var x in state.discs[disc_id]) {
      var disc = state.discs[disc_id]
      equal(game.discs[disc.id][x], disc[x], "state variable should match");
    }
  }

  // FIXME: Check for the state of control points
});

test("Check if saving and loading game works", function(){
  // Capture game state
  var game = Game.instances[0];
  game.capture_state();
  equal(game.current_state, 0);

  // Save game
  var saved_game = game.save_game();
  notEqual(saved_game.length, 0, "We expect a non-empty saved game state");

  // Change game state
  var player = game.players["o"][1];
  var old_x = player.x;
  var old_y = player.y;
  player.x += 10;
  notEqual(player.x, old_x);

  // Update game with saved state and check if restored correctly
  game.update(saved_game);
  ok(close(player, {x: old_x, y:old_y}, 0.1));

});

asyncTest("Check if animation works", function(){
  expect( 11 );
  // Capture the game state
  var game = Game.instances[0];
  game.capture_state();
  equal(game.current_state, 0);

  // Change game state and capture again
  var player = game.players["d"][3];
  var old_player_x = player.x;

  var disc = game.discs[1];
  ok(disc);
  var old_disc_x = disc.x;

  player.x += 10;
  disc.x += 10;

  notEqual(player.x, old_player_x);
  notEqual(disc.x, old_disc_x);
  game.capture_state();
  equal(game.current_state, 1);

  // Reset to state-0
  game.reset_to_state(0);
  equal(player.x, old_player_x);
  equal(disc.x, old_disc_x);

  var cb = function(){
    notEqual(player.x, old_player_x);
    equal(player.x, old_player_x+10);
    notEqual(disc.x, old_disc_x);
    equal(disc.x, old_disc_x+10);
    start();
    game.stop();
  };
  game.animate(30, undefined, false, cb);

});


test("Check drag and drops", function(){
  // expect( 2 );
  // Capture the game state
  var game = Game.instances[0];
  game.capture_state();
  equal(game.current_state, 0);

  // Change game state and capture again
  var player = game.players["d"][3];
  var old_player_x = player.x;
  var disc = game.discs[1];
  var old_disc_x = disc.x;
  var P1 = game._control_points[1];

  equal($(P1.body.node).css('display'), 'none');

  var dx = player.x - disc.x, dy = player.y - disc.y;
  $(disc.body.node).simulate("drag", {dx: dx, dy: dy});
  ok(close(disc, player));
  equal($(P1.body.node).css('display'), 'inline');

  var state = disc.get_state();
  ok(state._control_points[1]);
  ok(state._control_points[1].x, P1.x);
  ok(state._control_points[1].y, P1.y);

});

// FIXME: More animation tests.
// Test if our animated object really is going on the path specified.
// Stop animating, get position, check if it lies on the path.

// FIXME: Check if looping works.

// FIXME: Add play mode tests.

/********************************************************************************/
// Util functions
/********************************************************************************/

var close = function(a, b, error) {
  var dist = Math.sqrt( ( a.x - b.x ) * ( a.x - b.x ) + ( a.y - b.y ) * ( a.y - b.y ) );
  error = error || Math.PI * 2;
  return dist < error;
}

/********************************************************************************/
