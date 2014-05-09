window.Box = (function () {

  function averagePosition (posA, posB) {
    return {
      x: (posA.x + posB.x)/2,
      y: (posA.y + posB.y)/2
    }
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
    Matter.World.add(world, [
      Matter.Bodies.rectangle(width * 0.5, 0, width + 0.5, 0.5, { isStatic: true }),
      Matter.Bodies.rectangle(width * 0.5, height, width + 0.5, 0.5, { isStatic: true }),
      Matter.Bodies.rectangle(width, height * 0.5, 0.5, height + 0.5, { isStatic: true }),
      Matter.Bodies.rectangle(0, height * 0.5, 0.5, height + 0.5, { isStatic: true })
    ])

    //Matter.World.add(world, Matter.MouseConstraint.create(this.engine));

    // Balls
    Matter.World.add(world, Matter.Bodies.circle(100, 100, 50, { restitution: 0.2, render: {fillStyle: 'red', strokeStyle: 'red'}}))
    Matter.World.add(world, Matter.Bodies.circle(300, 100, 50, { restitution: 0.2, render: {fillStyle: 'green', strokeStyle: 'green'}}))

    // Collisions
    Matter.Events.on(this.engine, 'collisionStart', function (event) {
      event.pairs.forEach(function (pair) {
        if (pair.bodyA.render.fillStyle === 'red' && pair.bodyB.render.fillStyle === 'green') {
          var position = averagePosition(pair.bodyA.position, pair.bodyB.position)
          Matter.World.add(world, Bodies.circle(position.x, position.y, 30, { restitution: 0.2, render: {fillStyle: 'blue', strokeStyle: 'blue'}}))
        }
      })
    })

  }

  Box.prototype = {
    updateGravity: function () {
      var gravity = this.engine.world.gravity;
      gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      gravity.y = Common.clamp(event.beta, -90, 90) / 90;
    },

    canvas: function () {
      return this.engine.render.canvas
    }
  }

  return Box
})()
