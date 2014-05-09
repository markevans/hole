window.keyboard = (function () {

  var keyMap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  }

  var keyDownCallbacks = []

  var keyMatches = function (keyMatcher, key) {
    return keyMatcher.indexOf(key.key) > -1
  }

  window.addEventListener('keydown', function (event) {
    var key = {
      code: event.keyCode,
      key: keyMap[event.keyCode]
    }
    keyDownCallbacks.forEach(function (obj) {
      if ( keyMatches(obj.keyMatcher, key) ) {
        obj.callback(key)
      }
    })
  });

  return {
    onKeyDown: function (keyMatcher, callback) {
      keyDownCallbacks.push({keyMatcher: keyMatcher, callback: callback})
    }
  }
})()
