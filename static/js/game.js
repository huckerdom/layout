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


/*
   TESTS!
*/

/*
   TODO
   - Have scale factor in saved game state... or restoring fails.
*/

(function () {

  var DIMENSIONS = {
    length: 100,
    breadth: 37,
    end_zones: [18, 82],
    bricks: [36, 64],
    boundary: 10,
    line_width: 0.1,
    player_radius: 7,
    disc_radius: 3
  }

  var svgNS = "http://www.w3.org/2000/svg";

  var Game = {
    current_state: 0,
    states: [],
    players: [],
    instances: [],
    canvas: null  // SVG element
  };


  // Initialize game.js
  Game.init = function(){
    var head = document.getElementsByTagName("head")[0];
    scripts = [
      //'http://code.jquery.com/jquery-1.9.1.min.js',
      // 'http://code.createjs.com/createjs-2013.02.12.min.js',
    ];
    for (var i=0; i<scripts.length; i++) {
      var newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      newScript.src = scripts[i] ;
      head.appendChild(newScript);
    };

    // Wait for the page to load, before going ahead
    window.onload = Game.create_instances;

  };

  // Create games for each canvas
  Game.create_instances = function() {
    //var canvases = d('svg[class~=layout]'), game;
    var canvases = document.getElementsByTagName('svg'), game;
    // For each canvas, look at the data file and do shit!
    for (var i=0; i<canvases.length; i++) {
      game = Object.create(Game);
      game.players = [];
      game.states = [];
      game.canvas = canvases[i];
      Game.instances.push(game);
      game.init_game();
    }

  }

  // Initial setup for a game instance
  Game.init_game = function() {
    // Setup the canvas to have a field and default player objects.
    this.init_setup_field();
    this.init_setup_players();
    // Read layout file from data-layout attribute on canvas
    //this.read_layout_file();
    // Add buttons and other stuff
    // this.add_UI();

  }

  /* Lots of Cleanup needed here!
     // FIXME: Add a legend for player colors
     // FIXME: Add an arrow to show where the team on offense is scoring
  */
  // Sets up the field
  Game.init_setup_field = function(scale) {
    scale = scale || 10;

    var length = DIMENSIONS.length * scale, breadth = DIMENSIONS.breadth * scale;
    var x = (this.canvas.getAttribute('width') - length)/2, y = (this.canvas.getAttribute('height') - breadth)/2;
    var b = DIMENSIONS.boundary * scale;

    // Draw extra outer zone
    create_element('rect',
                   {
                     'x': x-b/2, 'y': y-b/2,
                     'width': length+b, 'height': breadth+b,
                     'stroke': '#00aa00', 'stroke-width': b
                   }, this.canvas);

    // Draw field
    create_element('rect',
                   {
                     'id': 'field',
                     'width': length, 'height': breadth,
                     'x': x, 'y': y, 'fill': 'green',
                     'stroke': '#ffffff', 'stroke-width': DIMENSIONS.line_width*scale,
                   }, this.canvas);

    // Draw end zone lines
    create_element('line',
                   {
                     'x1': x + DIMENSIONS.end_zones[0]*scale, 'y1': y,
                     'x2': x + DIMENSIONS.end_zones[0]*scale, 'y2': y + breadth,
                     'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale,
                     'class': 'field-lines',
                   }, this.canvas);

    create_element('line',
                   {
                     'x1': x + DIMENSIONS.end_zones[1]*scale, 'y1': y,
                     'x2': x + DIMENSIONS.end_zones[1]*scale, 'y2': y+breadth,
                     'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale,
                     'class': 'field-lines',
                     }, this.canvas);

    // Draw brick marks
    var c = DIMENSIONS.player_radius/2

    // Left brick
    create_element('line',
                   {
                     'x1': x + DIMENSIONS.bricks[0]*scale - c, 'y1': y + breadth/2 - c,
                     'x2': x + DIMENSIONS.bricks[0]*scale + c, 'y2': y + breadth/2 + c,
                     'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale,
                     'class': 'field-lines',
                   }, this.canvas);
    create_element('line',
                   {
                     'x1': x + DIMENSIONS.bricks[0]*scale - c, 'y1': y + breadth/2 + c,
                     'x2': x + DIMENSIONS.bricks[0]*scale + c, 'y2': y + breadth/2 - c,
                     'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale,
                     'class': 'field-lines',
                   }, this.canvas);

    // Right brick
    create_element('line',
                   {
                     'x1': x + DIMENSIONS.bricks[1]*scale - c, 'y1': y + breadth/2 - c,
                     'x2': x + DIMENSIONS.bricks[1]*scale + c, 'y2': y + breadth/2 + c,
                     'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale,
                     'class': 'field-lines',
                   }, this.canvas);
    create_element('line',
                   {
                     'x1': x + DIMENSIONS.bricks[1]*scale - c, 'y1': y + breadth/2 + c,
                     'x2': x + DIMENSIONS.bricks[1]*scale + c, 'y2': y + breadth/2 - c,
                     'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale,
                     'class': 'field-lines',
                   }, this.canvas);

  };

  // Sets up the players
  Game.init_setup_players = function(num_players) {
    num_players = num_players || 7;
    var field = this.canvas.getElementById('field');

    // Setup players;
    for (var i=1; i<=num_players; i++) {
      for (var t in {o:null, d:null}){
        var x_pos = t==="o"?.18:.82;
        var d = {x: field.getAttribute('x'), y: field.getAttribute('y'),
                 width: field.getAttribute('width'), height: field.getAttribute('height')};
        player = Player.from_dict({type:t, name:i,
                                   x:d.x+d.width*x_pos,
                                   y:d.y+d.height/(num_players+1)*i});
        player.draw(this.canvas);
        this.players.push(player);
      };
    };

    Game._default_state = this.get_current_state();

  };

  Game.get_current_state = function(){
    var state = {};
    state.players = [];
    this.players.forEach(function(player){
      state.players.push(player.to_dict());
    });
    // FIXME: state.disc = XXX
    return state;
  }

  // Add the current state of the stage to the list of states in Game
  Game.capture_state = function(){
    var state = this.get_current_state();
    this.states.push(state);
    return state;
  };

  Game.save_game = function(){
    var game;
    game = JSON.stringify(this.states, null, "  ");
    // FIXME: Save game to a shit file!
    return game;
  };

  Game.update = function(text){
    if (!text) { alert('Empty text, cannot load game'); };
    try {
      var states = JSON.parse(text);
      // FIXME: add more checks?
    } catch (e) {
      alert('Not a valid json file, cannot load game');
    }
    this.states = states;
    this.current_state = 0;
    if (this.states) {this.reset_to_state(this.current_state)};
    this.stage.update();
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
    if ( !this.players.length || !this.states.length ) { return; };
    fps = fps||24;
    start = start || 0;
    end = end || this.states.length;
    this.reset_to_state(start);
    createjs.Ticker.setFPS(fps);
    createjs.Ticker.addEventListener("tick", this.stage);
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
    this.timeline = new createjs.Timeline(tweens, labels, {useTicks:true, paused: true});
    this.stage.update();
    this.timeline.setPaused(false);
  };

  Game.read_layout_file = function(){
    var layout_file = this.stage.canvas.dataset.layoutFile;
    if (layout_file == undefined) { return; }
    game = this;
    var read_layout = $.get(layout_file, function(data){
      game.update(data);
    });
  }

  Game.clear_states = function(){
    this.states = [Game._default_state];
    this.reset_to_state();
    this.states = [];
  };

  Game.add_UI = function() {
    // Do miscellaneous UI stuff
    add_download(this);
    add_upload(this);
    add_capture(this);
    add_clear_states(this);
    add_animate(this);
  }


  /********************************************************************************/

  // Disc class
  var Disc = {
    x: 0,
    y: 0,
    radius: DIMENSIONS.disc_radius,
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
    radius: DIMENSIONS.player_radius,
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
  var add_download = function(game){
    window.URL = window.URL || window.webkitURL;
    var download = $('<a>').attr('id', 'saveGame').text('Save Game')
      .insertAfter(game.stage.canvas).attr('href', '#').css('display', 'block');

    download.click(function(evt){
      var blob = new Blob([game.save_game()], {type: 'text/plain'});
      var d = new Date(), date = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();
      $(evt.target).attr("href", window.URL.createObjectURL(blob))
        .attr("download", "layout-" + year + '-' + month + '-' + date + ".txt");
    });

  }

  var add_upload = function(game){
    var upload_button = $('<input type=file>').attr('id', 'upload-game-file')
      .attr('accept', 'text/plain').css('display', 'none')
      .insertAfter(game.stage.canvas).attr('href', '#')
      .change(function(evt){
        read_game_files(evt, game);
      });

    $('<a>').attr('id', 'loadGame').text('Load Game')
      .insertAfter(game.stage.canvas).attr('href', '#').css('display', 'block')
      .click(function(evt){upload_button.click()})

  }

  var add_capture = function(game){
    $('<a>').attr('id', 'captureGameState').text('Capture Game State').css('display', 'block')
      .insertAfter(game.stage.canvas).attr('href', '#')
      .click(function(evt){game.capture_state()});
  }

  var add_clear_states = function(game){
    $('<a>').attr('id', 'clearGameStates').text('Clear All Game States').css('display', 'block')
      .insertAfter(game.stage.canvas).attr('href', '#')
      .click(function(evt){game.clear_states()});
  }

  var add_animate = function(game){
    $('<a>').attr('id', 'animateGame').text('Animate Game').css('display', 'block')
      .insertAfter(game.stage.canvas).attr('href', '#')
      .click(function(evt){game.animate()});
  }

  var read_game_files = function(evt, game){
    var file = evt.target.files[0];
    var gameReader = new FileReader();

    gameReader.readAsText(file);
    gameReader.onload = function(evt){
      var text = evt.target.result;
      if (text) { game.update(text) };
    };

  };

  // Creates and adds an element of given type, with specified attributes to the given svg element.
  var create_element = function(type, attr_dict, svg){
    var elem = document.createElementNS(svgNS, type);
    for (var attr in attr_dict){
      elem.setAttribute(attr, attr_dict[attr]);
    };
    svg.appendChild(elem);
  };


  /********************************************************************************/
  Game.init()
  window.Game = Game;

})();
