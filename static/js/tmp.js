        var t = get_transformation(697,0,766,0,0,0,1,1);
        var p1 = transform(t, 700, 0);
        var p2 = transform(t, 750, 0);
        var easing1 = 'cubic-bezier('+p1+','+p2+')';

        var t = get_transformation(697,0,766,0,0,0,1,1);
        var p1 = transform(t, 0, 220);
        var p2 = transform(t, 0, 250);
        var easing2 = 'cubic-bezier('+p1+','+p2+')';



{
      time = time||2000;
      // Update body and label
      new_state.cx = new_state.x;
      new_state.cy = new_state.y;
      var easing = 'linear';
      if (this.name == '6' && this.type == 'o') {
        var t = get_transformation(697,0,766,0,0,0,1,0);
        var p1 = transform(t, 700, 0);
        var p2 = transform(t, 750, 0);
        var easing1 = 'cubic-bezier('+p1+','+p2+')';
        console.log(easing1)

        var t = get_transformation(0,322.5,0,359.5,0,0,0,1);
        var p1 = transform(t, 0, 200);
        var p2 = transform(t, 0, 220.5);
        var easing2 = 'cubic-bezier('+p1+','+p2+')';
        console.log(easing2)

        var anim = Raphael.animation({x:new_state.x}, time, easing1, cb);
        this.label.animate(anim);
        this.label.animate(this.label, anim, {y:new_state.y}, time, easing2);
        this.body.animateWith(this.label, anim, {cx:new_state.cx}, time, easing1);
        this.body.animateWith(this.label, anim, {cy:new_state.cy}, time, 'linear');

      } else {
        var anim = Raphael.animation(new_state, time, easing, cb);
        this.label.animate(anim);
        this.body.animateWith(this.label, anim, new_state, time, easing);
      }
    }


{
      time = time||2000;
      // Update body and label
      new_state.cx = new_state.x;
      new_state.cy = new_state.y;
      var easing = 'linear';
      if (this.name == '6' && this.type == 'o' && Math.floor(this.x) == 697) {
        var t = get_transformation(697,322.5,766,359.5,0,0,1,1);
        var p1 = transform(t, 700, 200);
        var p2 = transform(t, 750, 220.5);
        var easing1 = 'cubic-bezier('+p1[0] +',0'+','+p2[0]+',0'+')';
        var easing2 = 'cubic-bezier('+'0,'+p1[1]+','+'0,'+p2[1]+')';
        var easing = 'cubic-bezier('+p1+','+p2+')';
        console.log(easing1, easing2, easing);
        var anim = Raphael.animation(new_state, time, 'linear', cb);
        this.label.animate(anim);
        // this.label.animate(this.label, anim, {y:new_state.y}, time, easing);
        this.body.animateWith(this.label, anim, new_state, time, easing);
        // this.body.animateWith(this.label, anim, {cy:new_state.cy}, time, easing2);

      } else {
        var anim = Raphael.animation(new_state, time, easing, cb);
        this.label.animate(anim);
        this.body.animateWith(this.label, anim, new_state, time, easing);
      }
    }


    animate: function(new_state, time, cb) {
      time = time||500;
      // Update body and label
      new_state.cx = new_state.x;
      new_state.cy = new_state.y;
      var easing = 'linear';
      if (this.name == '6' && this.type == 'o' && this.x == 697) {
        var t = get_transformation(697,0,766,0,0,0,1,1);
        var p1 = transform(t, 700, 0);
        var p2 = transform(t, 750, 1);
        var easing1 = 'cubic-bezier('+p1+','+p2+')';
        console.log(easing1)

        var t = get_transformation(0,322.5,0,359.5,0,0,1,1);
        var p1 = transform(t, 0, 200);
        var p2 = transform(t, 0, 220.5);
        var easing2 = 'cubic-bezier('+p1+','+p2+')';
        console.log(easing2)

        var anim = Raphael.animation({x:new_state.x}, time, easing1, cb);
        this.label.animate(anim);
        this.label.animate(this.label, anim, {y:new_state.y}, time, easing2);
        this.body.animateWith(this.label, anim, {cx:new_state.cx}, time, easing1);
        this.body.animateWith(this.label, anim, {cy:new_state.cy}, time, easing2);

      } else {
        var anim = Raphael.animation(new_state, time, easing, cb);
        this.label.animate(anim);
        this.body.animateWith(this.label, anim, new_state, time, easing);
      }

        var get_easing = function(a, b) {
          var easing = function(n){
            //return (1-3*a-3*b)*Math.pow(n, 3) + (3*b-6*a)*Math.pow(n, 2) + (3*a)*n;
            return (1 - n) * n * n * 3 + n * n * n;
          };
          return easing;
        }





      case "control":
      P = ControlPoint;
      container = this._control_points;
      radius = DIMENSIONS.disc_radius * 1.5 * this.scale;
      break;
