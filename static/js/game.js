/* IDEAS...

   - Snap players to grid
   - Different line types, and line colors.
   - Undo, redo
   - Load, Save, Share, search, blah, blah, blah...
   - Convert to PDF
   - Print friendly
   - Add notes/commentary/description to each play, each frame/stage
   - Offense only mode; Offense and Defense mode; Defense only mode...
   - Rulers/scale to see the strategy to scale...
   - Standard templates
   - Select multiple  players to move around.. both offense and defense
   - Show players' trail to see how players are moving
   - Handlers and cutters can be shown in different colors
   - Score?
   - Add tools to measure distances or add some sort of a ruler/grid.
   - Add keyboard shortcuts to move around players..
   - allow selecting multiple players, and move with keyboard/mouse?
   - Allow drawing lines... which can be saved in the state..
*/

/* TESTS!

*/

(function () {

  var Game = {
    current_state: 0,
    states: [],
    players: [],
    stage: null,
  };

  // Entry point for the whole thing
  Game.init_game = function() {
    // game = Object.create(Game);
    // // FIXME: is this reasonable?
    // window.Game = game;
    this.id = this.id || "gameCanvas";
    this.stage = new createjs.Stage(this.id);
    this.init_setup_field();
    this.init_setup_players();
    this.stage.update();

    // Do miscellaneous stuff
    add_download('saveGame');
    add_upload('loadGame');
    add_capture('captureGameState');
    add_animate('animateGame');
  }

  /* Lots of Cleanup needed here!
     // FIXME: Create a Field class
     // FIXME: Add a legend for player colors
     // FIXME: Add an arrow to show where the team on offense is scoring
  */
  // Sets up the field
  Game.init_setup_field = function(scale) {
    scale = scale || 10;
    var length = 100 * scale,
    breadth = 37 * scale,
    x = (this.stage.canvas.width - length)/2,
    y = (this.stage.canvas.height - breadth)/2;

    var field = new createjs.Shape();
    field.name = 'field';
    field.graphics.beginFill("green").drawRect(x, y, length, breadth);
    field.dimensions = new createjs.Rectangle(x, y, length, breadth);

    // FIXME: draw lines and shit ...
    this.stage.addChild(field);
  };

  // Sets up the players
  Game.init_setup_players = function(num_players) {
    num_players = num_players || 7;
    var field = this.stage.getChildByName('field')

    // Setup players;
    for (var i=1; i<=num_players; i++) {
      for (var t in {o:null, d:null}){
        var x_pos = t==="o"?.18:.82;
        var d = field.dimensions;
        player = Player.from_dict({type:t, name:i,
                                   x:d.x+d.width*x_pos,
                                   y:d.y+d.height/(num_players+1)*i});
        player.draw(this.stage);
        this.players.push(player);
      };
    };
  };

  // Add the current state of the stage to the list of states in Game
  Game.capture_state = function(){
    var state = {};
    state.players = [];
    this.states.push(state);
    this.players.forEach(function(player){
      state.players.push(player.to_dict());
    });
    // FIXME: state.disc = XXX
    return state;
  };

  Game.save_game = function(){
    var game;
    game = JSON.stringify(this.states, null, "  ");
    // FIXME: Save game to a shit file!
    return game;
  };

  Game.load_game = function(text){
    this.states = JSON.parse(text);
    this.current_state = 0;
    if (this.states) {this.reset_to_state(this.current_state)};
    return this;
  };

  Game.reset_to_state = function(state_index){
    state_index = state_index||0;
    var state = this.states[state_index];
    if (!state) {return;};
    this.current_state = state_index;
    this.players.forEach(function(player, idx){
      player.update(state.players[idx]);
    });
    // this.disc.update(state.disc);
    this.stage.update();
    return this;
  };

  Game.animate = function(fps, start, end){
    if ( !this.players || !this.states) { return; };
    fps = fps||24;
    start = start || 0;
    end = end || Game.states.length;
    Game.reset_to_state(start);
    createjs.Ticker.setFPS(fps);
    createjs.Ticker.addEventListener("tick", Game.stage);
    var tweens = [], labels = [];
    this.players.forEach(function(player, i){
      var tween = createjs.Tween.get(player);
      this.states.forEach(function(state, j){
        // Skip adding the first state to animation
        if (j <= start || j >= end) {return;};
        tween.to(state.players[i], fps*2).call(function(){this.current_state=j}, null, this)
          .wait(fps);
        tweens.push(tween);
      }, this);
    }, this);
    Game.timeline = new createjs.Timeline(tweens, labels, {useTicks:true, paused: true});
    Game.stage.update();
    Game.timeline.setPaused(false);
  };


  /********************************************************************************/

  // Disc class
  var Disc = {
    x: 0,
    y: 0,
    radius: 3,
    color: "white",

    create: function(stage){
      this.disc = new createjs.Shape();
      this.disc.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);
      this.disc.x = this.x;
      this.disc.y = this.y;

      stage.addChild(this.disc);
    }

  };

  /********************************************************************************/

  // Player class
  var Player = {
    name: 0,
    radius: 7,
    color: "green",
    _x: 0,
    _y: 0,

    get x() {
      if (this.player) { return this.player.x; };
      return this._x;
    },

    set x(val) {
      this._x = val;
      if (this.player) { this.player.x = val; };
    },

    get y() {
      if (this.player) { return this.player.y; };
      return this._y;
    },

    set y(val) {
      this._y = val;
      if (this.player) { this.player.y = val; };
    },

    // Draws the player on the stage
    draw: function(stage){
      // Create a "body"
      this.body = new createjs.Shape();
      this.body.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);

      // Add a label,
      // FIXME: color should be selected based on our color (complementing?)
      this.label = new createjs.Text(this.name, 'bold 10px Arial', 'green');
      this.label.textAlign = "center";
      this.label.y = -this.radius/1.4;

      // Add the body and the label into a container
      this.player = new createjs.Container();
      this.player.x = this._x;
      this.player.y = this._y;
      this.player.addChild(this.body, this.label);

      // Ability to drag the player around
      // FIXME: Should be a toggle-able feature!
      this.player.addEventListener("mousedown", drag_object.bind(this));

      // FIXME: Add a doubleclick handler to change the label.

      // Add the player container onto the stage
      stage.addChild(this.player);

      return this;
    },

    // Return state variables to reconstruct the player
    to_dict: function(){
      return {type:this.type, name:this.name, radius: this.radius, x: this.x, y: this.y};
    },

    from_dict: function(state) {
      if (state.type.toLowerCase() === "o") {
        var player = Object.create(OffensivePlayer);
      } else if (state.type.toLowerCase() === "d") {
        var player = Object.create(DefensivePlayer);
      } else {
        return;
      };
      player.x = state.x;
      player.y = state.y;
      player.name = state.name;
      if (state.radius) {player.radius = state.radius};
      return player;
    },

    update: function(state) {
      for (var e in state) {
        this[e] = state[e];
      };
    }

  }

  // Create offensive and defensive player "classes"
  var OffensivePlayer = Object.create(Player);
  OffensivePlayer.color = 'yellow';
  OffensivePlayer.type = 'o';
  var DefensivePlayer = Object.create(Player);
  DefensivePlayer.color = 'black';
  DefensivePlayer.type = 'd';


  /****************************** UTILITY FUNCTIONS ******************************/

  // Event listener to update position of an object on the stage on drag
  var drag_object = function(evt) {
    var offset = {x:evt.target.x-evt.stageX, y:evt.target.y-evt.stageY};
    // add a handler to the event object's onMouseMove callback
    // this will be active until the user releases the mouse button:
    evt.addEventListener("mousemove",function(ev) {
      ev.target.x = ev.stageX+offset.x;
      ev.target.y = ev.stageY+offset.y;
      ev.target.getStage().update();
    });
  }

  // FIXME: Add buttons, instead of ugly looking links.
  var add_download = function(label){
    window.URL = window.URL || window.webkitURL;
    var download = $('<a>').attr('id', label).text('Save Game')
      .insertAfter(Game.stage.canvas).attr('href', '#').css('display', 'block');

    download.click(function(evt){
      var blob = new Blob([Game.save_game()], {type: 'text/plain'});
      var d = new Date(), date = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();
      $(evt.target).attr("href", window.URL.createObjectURL(blob))
        .attr("download", "saved-game-" + year + '-' + month + '-' + date + ".txt");
    });

  }

  var add_upload = function(label){
    var upload_button = $('<input type=file>').attr('id', 'upload-game-file')
      .attr('accept', 'text/plain').css('display', 'none')
      .insertAfter(Game.stage.canvas).attr('href', '#')
      .change(read_game_files);

    $('<a>').attr('id', label).text('Load Game')
      .insertAfter(Game.stage.canvas).attr('href', '#').css('display', 'block')
      .click(function(evt){upload_button.click()})

  }

  var add_capture = function(label){
    $('<a>').attr('id', label).text('Capture Game State').css('display', 'block')
      .insertAfter(Game.stage.canvas).attr('href', '#')
      .click(function(evt){Game.capture_state()});
  }

  var add_animate = function(label){
    $('<a>').attr('id', label).text('Animate Game').css('display', 'block')
      .insertAfter(Game.stage.canvas).attr('href', '#')
      .click(function(evt){Game.animate()});
  }

  var read_game_files = function(evt){
    var file = evt.target.files[0];
    var gameReader = new FileReader();

    gameReader.readAsText(file);
    gameReader.onload = function(evt){
      try {
        // Creating a temporary object so as to not leave Game in a funky state
        obj = Object.create(Game);
        obj.load_game(evt.target.result);
      } catch (e) {
        console.log(e);
        alert('Sorry, not a valid Game file.');
        return;
      }
      Game.load_game(evt.target.result);
    }

  };


  /********************************************************************************/

  window.Game = Game;

})();
