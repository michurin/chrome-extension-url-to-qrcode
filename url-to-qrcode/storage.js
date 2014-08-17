/*global chrome */
/*exported storage */
/*jslint
  indent:   2,
  vars:     true
*/

var storage = (function () {
  var storage = chrome.storage.local;
  var defaults = {
    error_correction_level: 'L',
    size: 300,
    substitutions: function () {
      return [];
    }
  };
  function fix(k, v) {
    var g;
    if (v === undefined) {
      g = defaults[k];
      if (typeof g === 'function') {
        return g();
      }
      return g;
    }
    return v;
  }
  return {
    get: function (a, f) {
      storage.get(a, function (x) {
        var b = {};
        a.forEach(function (k) {
          b[k] = fix(k, x[k]);
        });
        f(b);
      });
    },
    set: function (a, f) {
      storage.set(a, f);
    },
    onchange: function (f) {
      chrome.storage.onChanged.addListener(function (a, area) {
        if (area === 'local') {
          var k, b = {};
          for (k in a) {
            if (a.hasOwnProperty(k)) {
              b[k] = fix(k, a[k].newValue);
            }
          }
          f(b);
        }
      });
    }
  };
}());
