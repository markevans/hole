window.Box = (function () {

  function Box (container) {
    this.container = container
    this.engine = Matter.Engine.create(this.container, { render: { options: { wireframes: false } } })
    this.width = document.documentElement.clientWidth
    this.height = document.documentElement.clientHeight

    Matter.Engine.run(this.engine)

    var width = this.width,
        height = this.height,
        world = this.engine.world

    extend(world.bounds.max, {x: width, y: height})
    extend(this.engine.render.options, {width: width, height: height})
    extend(this.engine.render.canvas, {width: width, height: height})

    // Walls
    var offset = 5
    Matter.World.add(world, [
      Matter.Bodies.rectangle(width*0.5, -offset, width+0.5, 50.5, { isStatic: true }),
      Matter.Bodies.rectangle(width*0.5, height+offset, width+0.5, 50.5, { isStatic: true }),
      Matter.Bodies.rectangle(width+offset, height*0.5, 50.5, height+0.5, { isStatic: true }),
      Matter.Bodies.rectangle(-offset, height*0.5, 50.5, height+0.5, { isStatic: true })
    ])
    // Hole
    Matter.World.add(world, Matter.Bodies.circle(width/2, height/2, 40, {isStatic: true, render: {fillStyle: 'black'}, collisionLabel: 'hole'}))
    // Sinks
    var positions = [
      [width*1/4, height*1/4],
      [width*1/4, height*3/4],
      [width*3/4, height*1/4],
      [width*3/4, height*3/4]
    ]
    positions.forEach(function (pos) {
      Matter.World.add(world, Matter.Bodies.circle(pos[0], pos[1], 40, {
        isStatic: true,
        render: {
          fillStyle: 'white',
          strokeStyle: 'black'
        },
        collisionLabel: 'sink'
      }))
    })

    // Init Balls
    for(var i=1; i<8; i++) {
      this.addRandomBall()
    }

    // Collisions
    var self = this
    Matter.Events.on(this.engine, 'collisionStart', function (event) {
      event.pairs.forEach(function (pair) {
        var a = pair.bodyA,
            b = pair.bodyB,
            objects
        if ((objects = matchPair(a, b, /ball/, /ball/)) && a.collisionLabel == b.collisionLabel) {
          Box.COLLISION_HANDLERS.sameColouredBall(self, objects[0], objects[1])
        } else if (objects = matchPair(a, b, /ball/, 'hole')) {
          Box.COLLISION_HANDLERS['ball-hole'](self, objects[0], objects[1])
        } else if (objects = matchPair(a, b, /ball/, 'sink')) {
          Box.COLLISION_HANDLERS['ball-sink'](self, objects[0], objects[1])
        }
      })
    })

  }

  Box.COLOURS = ['red', 'yellow', 'blue', 'green', 'orange']

  Box.COLLISION_HANDLERS = {
    sameColouredBall: function (box, a, b) {
      var position = averagePosition(a.position, b.position)
      box.removeBall(a)
      box.removeBall(b)
      box.addBall(combinedRadius(a.circleRadius, b.circleRadius), a.render.fillStyle, position.x, position.y)
    },

    'ball-hole': function (box, ball, hole) {
      box.removeBall(ball)
    },

    'ball-sink': function (box, ball, sink) {
      box.addRandomBall()
    }
  }

  Box.prototype = {
    addBall: function (radius, colour, x, y) {
      var ball = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.4,
        render: {
          fillStyle: colour,
          strokeStyle: colour
        },
        collisionLabel: 'ball-'+colour
      })
      Matter.World.add(this.engine.world, ball)
    },

    removeBall: function (ball) {
      Matter.World.remove(this.engine.world, ball)
    },

    addRandomBall: function (side, options) {
      if(!side) { side = sample(['top', 'bottom', 'left', 'right']) }
      if(!options) { options = {} }
      var radius = options.radius || 30,
          colour = options.colour || sample(Box.COLOURS),
          rand = Math.random(),
          w = this.width,
          h = this.height
      switch (side) {
        case "top": this.addBall(radius, colour, rand*w, 0)
        break;
        case "bottom": this.addBall(radius, colour, rand*w, h)
        break;
        case "left": this.addBall(radius, colour, 0, rand*h)
        break;
        case "right": this.addBall(radius, colour, w, rand*h)
        break;
      }
    },

    setGravity: function (x, y) {
      extend(this.engine.world.gravity, {x: x, y: y})
    },

    canvas: function () {
      return this.engine.render.canvas
    }
  }

  return Box

  // ------------------------------------------------------------

  function averagePosition (posA, posB) {
    return {
      x: (posA.x + posB.x)/2,
      y: (posA.y + posB.y)/2
    }
  }

  function combinedRadius (radiusA, radiusB) {
    var power = 2,
        weightA = Math.pow(radiusA, power),
        weightB = Math.pow(radiusB, power)
    return Math.pow(weightA + weightB, 1/power)
  }

  function extend (object, attributes) {
    var key
    for(key in attributes) {
      object[key] = attributes[key]
    }
  }

  function sample (array) {
    return array[Math.floor(Math.random()*array.length)]
  }

  function matchPair (obj1, obj2, matcher1, matcher2) {
    if (!obj1.collisionLabel || !obj2.collisionLabel) { return }
    if (obj1.collisionLabel.match(matcher1) && obj2.collisionLabel.match(matcher2)) {
      return [obj1, obj2]
    } else if (obj2.collisionLabel.match(matcher1) && obj1.collisionLabel.match(matcher2)) {
      return [obj2, obj1]
    }
  }

})()
