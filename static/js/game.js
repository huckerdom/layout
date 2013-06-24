(function () {

  "use strict";

  var DIMENSIONS = {
    length: 100,
    breadth: 37,
    end_zones: [18, 82],
    bricks: [36, 64],
    boundary: 5,
    line_width: 0.1,
    player_radius: 0.8,
    disc_radius: 0.5
  }

  var svgNS = "http://www.w3.org/2000/svg";

  var Game = {
    instances: [],

    current_state: 0,
    states: [],
    players: {},
    discs: {},
    _control_points: {},
    canvas: null,  // SVG element
    initialized: false,
    // Set of all drawn elements
    all_elements: null // Useful for applying global transormations
  };


  // Initialize game.js
  Game.init = function(){
    var head = document.getElementsByTagName("head")[0];
    var scripts = [

      {
        name: 'raphael.js',
        url: 'https://raw.github.com/DmitryBaranovskiy/raphael/master/raphael-min.js',
        window_object: 'window.Raphael',
      },

      {
        name: 'jquery.js',
        url: 'http://code.jquery.com/jquery-1.9.1.min.js',
        window_object: 'window.jQuery',
      }

    ];

    document.onreadystatechange = function(){

      var initialize = function(){
        var done = true;

        scripts.forEach(function(script){
          if (eval(script.window_object) == undefined) {
            done = false;
          };
        });

        if (done) {
          console.log('All external libraries loaded!');
          // Hacky, but not too much, I guess.
          if (window.QUnit) { QUnit.load();
                              QUnit.start();
                            };
          Game.create_instances();
        };

      };

      // Wait for all other js (and images!) to finish loading..
      // Load those libraries which aren't already loaded
      if (document.readyState === "complete" && !Game.initialized) {

        // If all the libraries are already loaded
        initialize();

        scripts.forEach(function(script){
          if (eval(script.window_object) == undefined) {
            console.log('Loading ' + script.name);
            var newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            newScript.src = script.url;
            head.appendChild(newScript);
            newScript.onload = initialize;
            newScript.onreadystatechange = initialize;
          };
        });

      };

    };

    // FIXME: Load <link rel="STYLESHEET" href="static/css/game.css" type="text/css">

  };

  // Create games for each canvas
  Game.create_instances = function() {
    Game.initialized = true;

    var canvases = $('div[class~=layout]'), game;
    // FIXME: we could add text/gif while waiting for js to load, which is removed on load.

    // For each canvas, look at the data file and do shit!
    for (var i=0; i<canvases.length; i++) {
      var game = Object.create(Game);
      var canvas = $(canvases[i]);

      game.players = {};
      game.discs = {};
      game.states = [];
      game._control_points = {};
      game._mode = canvases[i].dataset.mode || 'play';
      var display = calculate_display(canvas.attr('width'), canvas.attr('height'));
      var width = display[0], height = display[1];
      game.canvas = Raphael(canvases[i], width, height);
      game.scale = display[2], game.view = display[3];
      game._center = [width/2, height/2];
      game._transform = ('R90,'+game._center);
      Game.instances.push(game);
      game.init_game();

      // Add custom attribute "along"
      game.canvas.customAttributes.along = function (v, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
        var p = Raphael.findDotsAtSegment(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, v);
        return {x:p.x, y:p.y, cx:p.x, cy:p.y};
      };

    };

  };

  // Remove all game instances
  Game.reset = function() {
    Game.instances = [];
    Game.initialized = false;
  }

  // Initial setup for a game instance
  Game.init_game = function() {
    // Setup the canvas to have a field and default player objects.
    this.init_setup_field();
    this.init_setup_players();
    this.add_control_points();
    this.add_on_field_object("disc", undefined, this._center[0], this._center[1]);
    // Read layout file from data-layout attribute on canvas
    this.read_layout_file();

    // Add buttons and other stuff
    this.add_UI();

  };

  /* Lots of Cleanup needed here!
     // FIXME: Add a legend for player colors
     // FIXME: Add an arrow to show where the team on offense is scoring
  */
  // Sets up the field
  Game.init_setup_field = function() {
    var scale = this.scale || 10;

    var length = DIMENSIONS.length * scale, breadth = DIMENSIONS.breadth * scale;
    var x = (this.canvas.width - length)/2,
        y = (this.canvas.height - breadth)/2;

    var b = DIMENSIONS.boundary * scale;
    this.all_elements = this.canvas.set();

    // Draw field
    var field = this.canvas.rect(x, y, length, breadth)
      .attr({'id': 'field', 'fill': 'green',
             'stroke': '#ffffff', 'stroke-width': DIMENSIONS.line_width*scale,
            });
    this._field_id = field.id;
    this.all_elements.push(field);


    // Draw extra outer zone
    var boundary = this.canvas.rect(x-b/2, y-b/2, length+b, breadth+b)
      .attr({'stroke': '#00aa00', 'stroke-width': b});
    this.all_elements.push(boundary);

    // Draw end zone lines
    var lines = "M" + (x + DIMENSIONS.end_zones[0]*scale) + "," + y +
                "L" + (x + DIMENSIONS.end_zones[0]*scale) + "," + (y+breadth) +
                "M" + (x + DIMENSIONS.end_zones[1]*scale) + "," + y +
                "L" + (x + DIMENSIONS.end_zones[1]*scale) + "," + (y+breadth);

    var end_zones = this.canvas.path(lines)
      .attr({'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale});
    this.all_elements.push(end_zones);

    // Draw brick marks
    var c = (DIMENSIONS.player_radius * this.scale) / 2;

    var bricks = "M" + (x + DIMENSIONS.bricks[0]*scale - c) + "," + (y + breadth/2 - c) +
                 "L" + (x + DIMENSIONS.bricks[0]*scale + c) + "," + (y + breadth/2 + c) +
                 "M" + (x + DIMENSIONS.bricks[0]*scale - c) + "," + (y + breadth/2 + c) +
                 "L" + (x + DIMENSIONS.bricks[0]*scale + c) + "," + (y + breadth/2 - c) +

                 "M" + (x + DIMENSIONS.bricks[1]*scale - c) + "," + (y + breadth/2 - c) +
                 "L" + (x + DIMENSIONS.bricks[1]*scale + c) + "," + (y + breadth/2 + c) +
                 "M" + (x + DIMENSIONS.bricks[1]*scale - c) + "," + (y + breadth/2 + c) +
                 "L" + (x + DIMENSIONS.bricks[1]*scale + c) + "," + (y + breadth/2 - c);

    var brick_marks = this.canvas.path(bricks)
      .attr({'stroke': 'white', 'stroke-width': DIMENSIONS.line_width*scale});
    this.all_elements.push(brick_marks);

    if (this.view == 'portrait') {
      this.all_elements.transform(this._transform);
    };

  };

  // Sets up the players
  Game.init_setup_players = function(num_players) {
    num_players = num_players || 7;
    var field = this.canvas.getById(this._field_id||0);

    // Setup players;
    for (var i=1; i<=num_players; i++) {
      for (var t in {"o":null, "d":null}){
        var x_pos = t==="o"?.18:.82;
        var x_rand = Math.random() * DIMENSIONS.player_radius * this.scale * 2 * (t==="o"?-1:1);
        var d = {x: field.attrs.x, y: field.attrs.y,
                 width: field.attrs.width, height: field.attrs.height};
        this.add_on_field_object(t, i,
                                 d.x+d.width*x_pos+x_rand,
                                 d.y+d.height/(num_players+1)*i);
      };
    };

    this._default_state = this.get_current_state();

  };

  // Init control points.
  // Points to be used to specify the path of an on field object
  Game.add_control_points = function(){
    var ids = [0, 1, 2];
    ids.forEach(function(id){
      var cp = this.add_on_field_object("control", id, this._center[0], this._center[1]);
    }, this);

    this._control_points[0].body.undrag();
    this._control_points[0].body.dblclick(hide_control_points);

    // Add a path
    var path = "M0,0 0,0,0,0 0,0"
    var P = this.canvas.path(path);
    P.attr('stroke', 'white').attr('stroke-width', 2);
    this._control_points['path'] = P;

    this.hide_control_points();

  };

  Game.hide_control_points = function(){
    for (var i in this._control_points) {
      if (i != 'current') {
        this._control_points[i].body && this._control_points[i].body.hide() || this._control_points[i].hide();
      }
    }
  };

  // Adds an object on to the field, either a Player or a Disc
  Game.add_on_field_object = function(type, id, x, y){
    var P, container, radius = DIMENSIONS.player_radius * this.scale;
    switch ( type.toLowerCase() )
    {
      case "o":
      P = OffensivePlayer;
      container = this.players["o"];
      if (container === undefined) { this.players["o"] = container = {} };
      break;

      case "d":
      P = DefensivePlayer;
      container = this.players["d"];
      if (container === undefined) { this.players["d"] = container = {} };
      break;

      case "disc":
      P = Disc;
      container = this.discs;
      radius = DIMENSIONS.disc_radius * this.scale;
      break;

      case "control":
      P = ControlPoint;
      container = this._control_points;
      radius = DIMENSIONS.disc_radius * 1.5 * this.scale;
      break;

      default:
      throw "Invalid type for OnFieldObject";
    }

    // Check if an object with specified 'id' already exists.
    if (container[id] != undefined) {
      throw "Object of type: " + type + " with id: " + id + ", already exists"
    }

    // If no id is specified, auto-assign an id.
    if (id === undefined) {
      var ids = [];
      for (var x in container) { ids.push(x) };
      if (ids.length > 0) {
        id =  Math.max.apply(this, ids) + 1
      } else {
        id = 1;
      }
    };

    var obj = P.create({id:id, x:x, y:y, radius:radius, _mode:this._mode,
                       type:type.toLowerCase()});
    var elem = obj.draw(this.canvas);
    if (this.view == 'portrait') {
      elem.transform(this._transform+'r-90');
    }
    this.all_elements.push(elem);
    container[id] = obj;
    return obj;
  };

  Game.get_current_state = function(){
    // FIXME: Normalize on scale and moved origin, to make the data file portable.
    var state = {};
    state.players = {};
    state.discs = {};

    for (var team_id in this.players) {
      var team = state.players[team_id];
      for (var player_id in this.players[team_id]) {
        if (team === undefined) { state.players[team_id] = team = {} };
        var p = this.players[team_id][player_id].get_state();
        team[player_id] = p;
      };
    };

    for (var disc_id in this.discs) {
      state.discs[disc_id] = this.discs[disc_id].get_state();
    }

    return state;
  }

  // Add the current state of the stage to the list of states in Game
  Game.capture_state = function(){
    var state = this.get_current_state();
    this.states.push(state);
    this.current_state = this.states.length-1;
    return state;
  };

  Game.save_game = function(){
    var field = this.canvas.getById(this._field_id), h = field.attr('x'), k = field.attr('x'),
        scale = this.scale;

    var fix_data = function(key, value) {
      if (key == 'x' || key == 'cx') {
        return ((value-h)/scale);
      } else if (key == 'y' || key == 'cy') {
        return ((value-k)/scale);
      } else {
        return value;
      }
    }

    return JSON.stringify(this.states, fix_data, "  ");
  };

  Game.update = function(text){
    if (!text) { alert('Empty text, cannot load game'); };

    var field = this.canvas.getById(this._field_id), h = field.attr('x'), k = field.attr('x'),
        scale = this.scale;

    var fix_data = function(key, value) {
      if (key == 'x' || key == 'cx') {
        return value * scale + h;
      } else if (key == 'y' || key == 'cy') {
        return value * scale + k;
      } else {
        return value;
      }
    }

    try {
      var states = JSON.parse(text, fix_data);
    } catch (e) {
      alert('Not a valid json file, cannot load game');
    }

    this.states = states;
    this.current_state = 0;
    if (this.states) {this.reset_to_state(this.current_state)};
    return this;
  };

  Game.reset_to_state = function(state_index){
    state_index = state_index||0;
    var state = this.states[state_index];
    if (!state) {return;};
    this.current_state = state_index;

    for (var team_id in this.players) {
      for (var player_id in this.players[team_id]) {
        this.players[team_id][player_id].set_state(state.players[team_id][player_id]);
      }
    };

    for (var disc_id in this.discs) {
      this.discs[disc_id].set_state(state.discs[disc_id]);
    };

    return this;
  };

  Game.animate = function(time, start, loop, callback){
    /*
      time - number of ms that one step of the animation should run for.
      start - the state index at which the animation should start at
      loop - should we loop, the animation after we reach the end?
      callback - is called each time one animation is finished.
    */
    // FIXME: Add a flag for already animating and don't start another animation if already animating
    // FIXME: Check paused flag and resume
    this.hide_control_points();
    if ( $.isEmptyObject(this.players) || !this.states.length ) { return; };
    time = time||2000;
    start = start < (this.states.length-1) && start ||
            this.current_state < (this.states.length-1) && this.current_state || 0;
    var end = start+1;
    if (start != this.current_state) { this.reset_to_state(start) };

    // callback passed to some animate?
    var called = false;
    var next_step = Game.animate.bind(this, time, start+1, loop, callback);

    if (loop) {
      var cb = function(){
        next_step();
        if (callback) { callback() };
      }
    } else {
      var cb = callback
    }

    // Clear the control point info if it's useless
    var clear_control_point_info = function(state, obj) {
      if ( state._control_points && state._control_points[0] ){
        if ( obj.x != state._control_points[0].x || obj.y != state._control_points[0].y ){
          state._control_points = undefined;
        }
      }
      return state;
    };


    for (var disc_id in this.discs) {
      var disc = this.discs[disc_id];
      var state = this.states[end].discs[disc_id];
      clear_control_point_info(state, disc);
      disc.animate(state, time);
    }

    for (var team_id in this.players) {
      for (var player_id in this.players[team_id]) {
        var player = this.players[team_id][player_id];
        var state = this.states[end].players[team_id][player_id];
        clear_control_point_info(state, player);
        if ( ! called ) {
          player.animate(state, time, cb);
          called = true;
        } else {
          player.animate(state, time);
        }
      }
    }

    this.current_state += 1;
    this.current_state = this.current_state < this.states.length && this.current_state || 0;
  };

  // Stop or pause animation
  Game.stop = function(pause){
    // FIXME: Add a flag for paused state somewhere
    pause = pause || false;
    for (var team_id in this.players) {
      for (var player_id in this.players[team_id]) {
        var player = this.players[team_id][player_id];
        player.stop(pause);
      }
    };
    this.reset_to_state(this.current_state);
  };

  Game.read_layout_file = function(){
    var layout_file = this.canvas.canvas.parentElement.dataset.layoutFile;
    if (layout_file == undefined) { return; }

    // Check if the layout_file is on the same domain and act accordingly
    var url = document.createElement('a');
    url.href = layout_file;
    var game = this;

    if (document.location.host === url.host) {
      var jqxhr = $.get(layout_file);
      jqxhr.done(function(data){
        game.update(data);
      });
    } else {
      var jqxhr = $.getJSON('http://whateverorigin.org/get?url=' +
                        encodeURIComponent(url.toString()) + '&callback=?');
      jqxhr.done(function(data){
        game.update(data.contents);
      });
    };


  };

  Game.clear_states = function(){
    this.states = [this._default_state];
    this.reset_to_state();
    this.states = [];
  };

  // Function to Add UI using SVG
  Game.add_UI = function(){

    // Useful to get position of next box or whatever
    this._icons = this.canvas.set();
    var game = this;

    // Forward button
    var forward = 'M256,90c91.742,0,166,74.245,166,166c0,91.741-74.244,166-166,166c-91.742,0-166-74.245-166-166C90,164.259,164.246,90,256,90z M256,50C142.23,50,50,142.229,50,256s92.23,206,206,206c113.771,0,206-92.229,206-206S369.771,50,256,50z M303.52,276.929v32.969l77.518-77.386l-77.518-77.385v32.97c0,0-136.162,27.71-163.502,146.774C198.227,272.546,303.52,276.929,303.52,276.929z';

    // Back button
    var back = 'M256,90c91.742,0,166,74.245,166,166c0,91.741-74.244,166-166,166c-91.742,0-166-74.245-166-166C90,164.259,164.246,90,256,90z M256,50C142.23,50,50,142.229,50,256s92.23,206,206,206c113.771,0,206-92.229,206-206S369.771,50,256,50z';

    // Animate button
    var animate = 'M256,92.481c44.433,0,86.18,17.068,117.553,48.064C404.794,171.411,422,212.413,422,255.999s-17.206,84.588-48.448,115.455c-31.372,30.994-73.12,48.064-117.552,48.064s-86.179-17.07-117.552-48.064C107.206,340.587,90,299.585,90,255.999s17.206-84.588,48.448-115.453C169.821,109.55,211.568,92.481,256,92.481 M256,52.481c-113.771,0-206,91.117-206,203.518c0,112.398,92.229,203.52,206,203.52c113.772,0,206-91.121,206-203.52C462,143.599,369.772,52.481,256,52.481L256,52.481z M206.544,357.161V159.833l160.919,98.666L206.544,357.161z';

    // Stop button
    var stop = 'M335.084,339.042H178.916V172.958h156.168V339.042z M256,92.481c44.433,0,86.18,17.068,117.553,48.064C404.794,171.411,422,212.413,422,255.999s-17.206,84.588-48.448,115.455c-31.372,30.994-73.12,48.064-117.552,48.064s-86.179-17.07-117.552-48.064C107.206,340.587,90,299.585,90,255.999s17.206-84.588,48.448-115.453C169.821,109.55,211.568,92.481,256,92.481 M256,52.481c-113.771,0-206,91.117-206,203.518c0,112.398,92.229,203.52,206,203.52c113.772,0,206-91.121,206-203.52C462,143.599,369.772,52.481,256,52.481L256,52.481z';

    // Capture state
    var add_state = 'M363.68,288.439h-76.24v76.238h-58.877v-76.238h-76.24v-58.877h76.24v-76.24h58.877v76.24h76.24V288.439zM462,256c0,113.771-92.229,206-206,206S50,369.771,50,256S142.229,50,256,50S462,142.229,462,256z M422,256c0-91.755-74.258-166-166-166c-91.755,0-166,74.259-166,166c0,91.755,74.258,166,166,166C347.755,422,422,347.741,422,256z';

    var delete_state = 'M363.68,288.439H152.322v-58.877H363.68V288.439z M462,256c0,113.771-92.229,206-206,206S50,369.771,50,256S142.229,50,256,50S462,142.229,462,256z M422,256c0-91.755-74.258-166-166-166c-91.755,0-166,74.259-166,166c0,91.755,74.258,166,166,166C347.755,422,422,347.741,422,256z';

    var clear_all = 'M345.938,314.829l-57.848-57.841l57.842-57.847l-31.102-31.08l-57.832,57.841l-57.841-57.832l-31.095,31.075l57.85,57.847l-57.843,57.85l31.075,31.097l57.857-57.86l57.856,57.854L345.938,314.829z M256,111c38.73,0,75.144,15.083,102.53,42.47S401,217.27,401,256s-15.083,75.144-42.47,102.53S294.73,401,256,401s-75.144-15.083-102.53-42.47S111,294.73,111,256s15.083-75.144,42.47-102.53S217.27,111,256,111z M256,71C153.827,71,71,153.828,71,256s82.827,185,185,185c102.172,0,185-82.828,185-185S358.172,71,256,71z';

    var upload = 'M461.4,299.303c0,50.852-41.371,92.221-92.221,92.221h-36.847v-40h36.847c28.795,0,52.221-23.426,52.221-52.221c0-35.412-23.816-53.746-49.18-53.844c-1.303-58.902-40.637-84.982-78.664-84.982c-50.308,0-70.974,38.08-76.131,52.662c-20.51-29.582-76.177-7.248-64.641,32.348C118.25,239.225,90.6,265.225,90.6,299.303c0,28.795,23.427,52.221,53.222,52.221h50.512v40h-50.512c-51.852,0-93.222-41.369-93.222-92.221c0-41.408,27.561-77.127,66.153-88.463c10.854-36.998,49.784-58.686,86.933-48.779c22.24-26.299,54.773-41.584,89.871-41.584c57.115,0,105.365,40.816,115.781,95.777C440.941,231.457,461.4,263.389,461.4,299.303z M189.752,315.263h33.84v76.261h79.486v-76.261h33.84l-73.582-73.708L189.752,315.263z';

    var download = 'M461.4,244.318c0,50.852-41.371,92.221-92.221,92.221h-36.847v-40h36.847c28.795,0,52.221-23.426,52.221-52.221c0-35.412-23.816-53.746-49.18-53.844c-1.303-58.902-40.637-84.982-78.664-84.982c-50.308,0-70.974,38.08-76.131,52.662c-20.51-29.582-76.177-7.248-64.641,32.348C118.25,184.24,90.6,210.24,90.6,244.318c0,28.795,23.427,52.221,53.222,52.221h50.512v40h-50.512c-51.852,0-93.222-41.369-93.222-92.221c0-41.408,27.561-77.127,66.153-88.463c10.854-36.998,49.784-58.686,86.933-48.779c22.24-26.299,54.773-41.584,89.871-41.584c57.115,0,105.365,40.816,115.781,95.777C440.941,176.473,461.4,208.404,461.4,244.318z M336.918,372.8h-33.84v-76.261h-79.486V372.8h-33.84l73.582,73.708L336.918,372.8z';

    this.add_transformed_path(forward, 'Step forward', function(){game.animate()});
    this.add_transformed_path(animate, 'Animate (Loop)', function(){game.animate(null, null, true)});
    this.add_transformed_path(stop, 'Stop animation', function(){game.stop()});
    // this.add_transformed_path(back, 'Back button (non-functional)');

    // Download
    window.URL = window.URL || window.webkitURL;
    // Major Hack to get downloading working.  The SVG gets embedded inside an anchor tag!
    var download_link = $('<a>').appendTo(this.canvas.canvas.parentElement).append(this.canvas.canvas);
    this.add_transformed_path(download, 'Download Layout', function(){
      var blob = new Blob([game.save_game()], {type: 'text/plain'});
      var d = new Date(), date = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();
      $(download_link).attr("href", window.URL.createObjectURL(blob))
        .attr("download", "layout-" + year + '-' + month + '-' + date + ".txt");
      setTimeout(function(){
        $(download_link).removeAttr('href').removeAttr('download');
      }, 50);
    });

    if (game._mode != 'play') {
      // Spacer
      this.add_transformed_path('M0,0 50,0 50,50, 0,50', '');

      this.add_transformed_path(add_state, 'Capture State', function(){game.capture_state()});
      // this.add_transformed_path(delete_state, 'Delete', function(){console.log('CLEAR!')});
      this.add_transformed_path(clear_all, 'Clear All Game States', function(){game.clear_states()});


      // Upload button
      var upload_button = $('<input type=file>').attr('id', 'upload-game-file')
        .attr('accept', 'text/plain').css('display', 'none')
        .change(function(evt){
          read_game_files(evt, game);
        });
      upload_button.insertAfter(game.canvas.canvas);
      this.add_transformed_path(upload, 'Load layout', function(){upload_button.click()});
    }

    // Center the icon_set
    var bbox = this._icons.getBBox()
    if (this.view == 'landscape') {
      this._icons.transform('...T'+[0, this._center[1]-bbox.y-bbox.height/2]);
    } else {
      this._icons.transform('...t'+[this._center[0]-bbox.y-bbox.width/2, 0]);
    }

  };

  Game.add_transformed_path = function(path, tooltip, onclick){
    var icon = this.canvas.path(path).attr({fill: "#000", stroke: "none"});
    var bbox = icon.getBBox();
    var side = DIMENSIONS.boundary * this.scale;
    var space = side * 0.1;
    var icons_bbox = this._icons.getBBox();

    if (this.view == 'landscape'){
      var scale = (side * 0.8) / bbox.width;
      var x = space;
      var y = this._icons.length && (icons_bbox.height + icons_bbox.y + space) || side + space;
    } else {
      scale = (side * 0.8) / bbox.height;
      x = this._icons.length && (icons_bbox.width + icons_bbox.x + space) || side;
      y = space;
    }
    var background = this.canvas.rect(bbox.x, bbox.y, bbox.width, bbox.height)
      .attr({fill: "#00aa00", stroke: "none"});
    icon.toFront();
    var transform =  'S' + scale + ' T' + [x-bbox.x, y-bbox.y];
    var set = this.canvas.set(background, icon).transform('S' + scale);
    bbox = background.getBBox();
    set.transform('...T' +[x-bbox.x, y-bbox.y]);
    set.attr({'title': tooltip});
    set.click(onclick);
    this._icons.push(set);

    // If no tooltip, icon is hidden; Used to add space
    if (!tooltip){set.hide();};

    return set;
  }

  // Get the game instance from a canvas object
  Game.get_from_canvas = function(canvas){
    var g;
    Game.instances.forEach(function(game){
      if (game.canvas == canvas){ g = game; };
    });
    return g;
  };


  // Get the object's state in the game's current state
  Game.get_object_state = function(obj) {
    if (this.states.length == 0) { return };
    var container, current_state = this.states[this.current_state];

    switch (obj.type.toLowerCase()) {

      case "o":
      case "d":
      container = current_state.players[obj.type.toLowerCase()];
      break;

      case "disc":
      container = current_state.discs;
      break;

      default:
      return;

    };

    return container[obj.id];
  };

  /********************************************************************************/

  var OnFieldObject = {
    id: 0,
    radius: 0,
    color: "green",
    show_label: false,
    _x: 0,
    _y: 0,

    get x() {
      if (this.label) { return this.label.attr('x'); };
      return this._x;
    },

    set x(val) {
      this._x = val;
      if (this.label) {this.label.attr({x: val})};
      if (this.body) {this.body.attr({cx: val})};
    },

    get y() {
      if (this.label) { return this.label.attr('y'); };
      return this._y;
    },

    set y(val) {
      this._y = val;
      if (this.label) {this.label.attr({y: val})};
      if (this.body) {this.body.attr({cy: val})};
    },

    // Create an object of this type
    create: function(state) {
      var obj = Object.create(this);
      obj.x = state.x || 0;
      obj.y = state.y || 0;
      obj.id = state.id;
      obj.type = state.type;
      obj._mode = state._mode || 'play';
      if (state.radius) {obj.radius = state.radius};
      return obj;
    },

    // Draws the player on the canvas
    draw: function(canvas){
      // Create a "body"
      this.body = canvas.circle(this.x, this.y, this.radius).attr({'fill': this.color});
      this.label = canvas.text(this.x, this.y, this.id)
        .attr({'fill':'green', 'font-size': (this.radius * 1.5)});
      this.body.node.id = this.type + '-' + this.id + '-' + 'body'
      this.label.node.id = this.type + '-' + this.id + '-' + 'label'
      // Create a group that holds the body and the label together.
      // Ability to drag the player around
      this._elements = canvas.set(this.body, this.label)

      if (this._mode == 'edit') {
        this._elements.drag(drag_obj_move, drag_obj_start, drag_obj_done, this, this, this);
       // FIXME: Add a doubleclick handler to change the label.
      }

      if (!this.show_label) { this.label.hide() };

      return this._elements;
    },

    // Updates the object given a new state
    set_state: function(state) {
      for (var e in state) {
        this[e] = state[e];
      };
    },

    // Return state variables to reconstruct the player
    get_state: function() {
      return {
        type:this.type,
        id:this.id,
        x: this.x,
        y: this.y,
        _control_points: this._control_points,
      };
    },

    // Animate the object to the given new_state, for the given length of time
    animate: function(new_state, time, cb) {
      time = time||2000;
      // Update body and label
      new_state.cx = new_state.x;
      new_state.cy = new_state.y;

      if ( new_state._control_points === undefined ) {
        // Nothing to do
      } else {
        var p0x = this.x, p0y = this.y,
            p1x = new_state._control_points[1].x, p1y = new_state._control_points[1].y,
            p2x = new_state._control_points[2].x, p2y = new_state._control_points[2].y,
            p3x = new_state.x, p3y = new_state.y;
        this.body.attr({along: [0, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y]});
        this.label.attr({along: [0, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y]});
        new_state = {along: [1, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y]}
      }

      var anim = Raphael.animation(new_state, time, 'linear', cb);
      this.label.animate(anim);
      this.body.animateWith(this.label, anim, new_state, time);
    },

    // Stop or Pause all active animations on the object.
    stop: function(pause) {
      pause = pause||false;
      // Stop animating body and label
      if (pause) {
        this.label.pause();
        this.body.pause();
      } else {
        this.label.stop();
        this.body.stop();
      }
    },

  };



  // Start dragging an on field object
  var drag_obj_start =  function(){
    this._ox = this.body.attr('cx');
    this._oy = this.body.attr('cy');
  };

  // Drag and move the object around
  var drag_obj_move = function(dx, dy){
    this.body.attr({cx: this._ox + dx, cy:this._oy + dy});
    this.label.attr({x: this._ox + dx, y:this._oy + dy});
  };

  // Click obj
  var drag_obj_done = function(){
    var game = Game.get_from_canvas(this.body.paper);
    var previous_state = game.get_object_state(this);
    if (previous_state === undefined && this.type != "control") { return };

    var P0 = game._control_points['0'];
    var P1 = game._control_points['1'];
    var P2 = game._control_points['2'];
    var P = game._control_points['path'];
    var P3;

    if (this.type === "control") {
      P3 = game._control_points['current'];
    } else {
      P3 = this;
    }

    // Clear out old cached locations of control points
    var cp = this._control_points
    if (cp && previous_state && (cp[0].x != previous_state.x || cp[0].y != previous_state.y)) {
      this._control_points = cp = undefined
    };

    if ( previous_state != undefined && (game._control_points['current'] != this  || !cp)) {
      game._control_points['current'] = this;

      // Move P0 to the previous position.
      // Set radius, fill and opacity
      P0.x = previous_state.x;
      P0.y = previous_state.y;
      P0.body.attr('r', previous_state.radius);
      P0.body.attr('fill', previous_state.fill);
      P0.body.attr('opacity', 0.5);

      // Move P1, P2 to required locations
      P1.x = cp && cp[1].x || 1/3 * (2 * previous_state.x + P3.x);
      P1.y = cp && cp[1].y ||1/3 * (2 * previous_state.y + P3.y);

      P2.x = cp && cp[2].x || 1/3 * (previous_state.x + 2 * P3.x);
      P2.y = cp && cp[2].y || 1/3 * (previous_state.y + 2 * P3.y);

    };

    // Draw the path and show the control points
    var path = "M" + P0.x + ',' + P0.y + ' C' + P1.x + ',' + P1.y + ', '
      + P2.x + ',' + P2.y + ' ' + P3.x + ',' + P3.y;
    P.attr('path', path);
    P.show();
    P0.body.show();
    P1.body.show();
    P2.body.show();

    // Get state for P0, P1, P2 and save it. (P0 is technically the
    // previous position, and P3 the current position, but anyway...)
    P3._control_points = {};
    P3._control_points[0] = game._control_points[0].get_state();
    P3._control_points[1] = game._control_points[1].get_state();
    P3._control_points[2] = game._control_points[2].get_state();

  }

  var hide_control_points = function() {
    var game = Game.get_from_canvas(this.paper)
    game.hide_control_points();
  };

  /********************************************************************************/

  // Disc class
  var Disc = Object.create(OnFieldObject);
  Disc.radius = DIMENSIONS.disc_radius;
  Disc.color = "white";

  /********************************************************************************/

  // Control point class
  var ControlPoint = Object.create(OnFieldObject);
  ControlPoint.radius = DIMENSIONS.disc_radius;
  ControlPoint.color = "red";

  /********************************************************************************/

  // Player class
  var Player = Object.create(OnFieldObject);
  Player.radius = DIMENSIONS.player_radius;
  Player.show_label = true;

  // Offensive Player class
  var OffensivePlayer = Object.create(Player);
  OffensivePlayer.color = 'yellow';
  OffensivePlayer.type = 'o';

  // Defensive Player class
  var DefensivePlayer = Object.create(Player);
  DefensivePlayer.color = 'black';
  DefensivePlayer.type = 'd';


  /****************************** UTILITY FUNCTIONS ******************************/

  // Calculate the scaling to use, based on canvas width and height
  var calculate_display = function(width, height){
    var w, h, view;
    width = parseInt(width);
    height = parseInt(height);
    if (width > height) {
      w = (DIMENSIONS.length+DIMENSIONS.boundary*2);
      h = (DIMENSIONS.breadth+DIMENSIONS.boundary*2);
      view = 'landscape'
    } else {
      w = (DIMENSIONS.breadth+DIMENSIONS.boundary*2);
      h = (DIMENSIONS.length+DIMENSIONS.boundary*2);
      view = 'portrait'
    }
    var scale = Math.min(width/w, height/h);
    return [Math.ceil(w*scale), Math.ceil(h*scale), scale, view];
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
  var create_element = function(type, attr_dict, parent){
    var elem = document.createElementNS(svgNS, type);
    for (var attr in attr_dict){
      elem.setAttributeNS(null, attr, attr_dict[attr]);
    };
    parent.appendChild(elem);
    return elem;
  };

  /********************************************************************************/
  Game.init()
  window.Game = Game;

})();
