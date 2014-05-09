window.Box = (function () {

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

  function extend(object, attributes) {
    var key
    for(key in attributes) {
      object[key] = attributes[key]
    }
  }

  // ---------------------------------------------

  function Box (container) {
    this.container = container
    this.engine = Matter.Engine.create(this.container, { render: { options: { wireframes: false } } })

    Matter.Engine.run(this.engine)

    var width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight;

    var world = this.engine.world

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
          self.addBall(combinedRadius(a.circleRadius, b.circleRadius), 'blue', position.x, position.y)
        }
      })
    })

  }

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

    setGravity: function (x, y) {
      extend(this.engine.world.gravity, {x: x, y: y})
    },

    canvas: function () {
      return this.engine.render.canvas
    }
  }

  return Box
})()
