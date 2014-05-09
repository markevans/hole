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

    //Matter.World.add(world, Matter.MouseConstraint.create(this.engine));

    // Balls
    this.addBall(50, 'red', 100, 100)
    this.addBall(50, 'green', 300, 100)

    // Collisions
    var self = this
    Matter.Events.on(this.engine, 'collisionStart', function (event) {
      event.pairs.forEach(function (pair) {
        var a = pair.bodyA,
            b = pair.bodyB
        if (a.label === 'Circle Body' &&
              b.label === 'Circle Body' &&
              a.render.fillStyle === b.render.fillStyle) {
          var position = averagePosition(a.position, b.position)
          self.removeBall(a)
          self.removeBall(b)
          self.addBall(combinedRadius(a.circleRadius, b.circleRadius), a.render.fillStyle, position.x, position.y)
        }
      })
    })

  }

  Box.COLOURS = ['red', 'yellow', 'blue', 'green', 'orange', 'black']

  Box.prototype = {
    addBall: function (radius, colour, x, y) {
      var ball = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.2, render: {
          fillStyle: colour,
          strokeStyle: colour
        }
      })
      Matter.World.add(this.engine.world, ball)
    },

    removeBall: function (ball) {
      Matter.World.remove(this.engine.world, ball)
    },

    addRandomBall: function (side, options) {
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

})()
