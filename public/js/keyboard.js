window.keyboard = (function () {

  var keyMap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  }

  var keyUpCallbacks = []

  var keyMatches = function (keyMatcher, key) {
    return keyMatcher.indexOf(key.key) > -1
  }

  window.addEventListener('keyup', function (event) {
    var key = {
      code: event.keyCode,
      key: keyMap[event.keyCode]
    }
    keyUpCallbacks.forEach(function (obj) {
      if ( keyMatches(obj.keyMatcher, key) ) {
        obj.callback(key)
      }
    })
  });

  return {
    onKeyUp: function (keyMatcher, callback) {
      keyUpCallbacks.push({keyMatcher: keyMatcher, callback: callback})
    }
  }
})()
