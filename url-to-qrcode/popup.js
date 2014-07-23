/*global window, chrome */
/*jslint
  indent:   2,
  vars:     true
*/


(function (d) {

  'use strict';

  function by_id(x) {
    return d.getElementById(x);
  }

  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    var ht = by_id('t');
    if (tabs.length !== 1) {
      ht.innerText = 'ERROR: LEN(TABS)=' + tabs.length;
    } else {
      chrome.storage.local.get({
        'error_correction_level': 'L',
        'size': 300,
        'substitutions': null
      }, function (state) {
        var txt = tabs[0].url;
        if (state.substitutions) {
          state.substitutions.forEach(function (v) {
            txt = txt.replace(v.from, v.to);
          });
        }
        ht.innerText = txt;
        ht.style.maxWidth = state.size + 'px';
        by_id('i').setAttribute('src',
          'https://chart.googleapis.com/chart?cht=qr&chld=' +
          state.error_correction_level +
          '|0&chs=' + state.size + 'x' + state.size + '&chl=' +
          encodeURIComponent(txt));
      });
    }
  });

}(window.document));
