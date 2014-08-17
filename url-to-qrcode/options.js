/*global window, chrome */
/*global storage, by_id */
/*jslint
  indent:   2,
  vars:     true
*/

(function (d) {

  'use strict';

  var mk = (function (tags) {
    var r = {};
    tags.forEach(function (tag) {
      r[tag] = function (attrs, childs) {
        if (arguments.length === 1) {
          childs = attrs;
          attrs = undefined;
        }
        var k, v;
        var x = d.createElement(tag);
        if (attrs) {
          for (k in attrs) {
            if (attrs.hasOwnProperty(k)) {
              v = attrs[k];
              if (typeof v === 'function') {
                x[k] = v;
              } else if (v === true) {
                x[k] = k;
              } else if (v !== false) {
                x.setAttribute(k, v);
              }
            }
          }
        }
        if (childs) {
          if (typeof childs === 'string') {
            x.innerText = childs;
          } else {
            childs.forEach(function (v) {
              x.appendChild(v);
            });
          }
        }
        return x;
      };
    });
    return r;
  }(['input', 'button', 'div', 'table', 'tr', 'td', 'label', 'span', 'fieldset', 'legend']));


  function mk_radio(name, id, label, onchange) {
    return mk.label({
      'for': id
    }, [
      mk.input({
        type: 'radio',
        id: id,
        name: name,
        onchange: onchange
      }, []),
      mk.span(label)
    ]);
  }


  function mk_fieldset(label, childs) {
    d.body.appendChild(mk.fieldset({}, [
      mk.legend(label)
    ].concat(childs)));
  }

  // INIT

  mk_fieldset('Error correction level', [
    ['L', '7'],
    ['M', '15'],
    ['Q', '25'],
    ['H', '30']
  ].map(function (x) {
    var level = x[0];
    var label = x[1];
    return mk_radio(
      'error_correction_level',
      'error_correction_level_' + level,
      ' ' + label + '%',
      function () {
        chrome.storage.local.set({
          error_correction_level: level
        });
      }
    );
  }));

  mk_fieldset('Size', [150, 200, 250, 300, 400].map(function (v) {
    return mk_radio(
      'size',
      'size_' + v,
      ' ' + v + 'x' + v + ' px',
      function () {
        chrome.storage.local.set({
          size: v
        });
      }
    );
  }));

  mk_fieldset('Substitutions', [
    mk.table({id: 'substitutions'}, []),
    mk.input({type: 'button', value: 'Add substitutions', onclick: function () {
      by_id('input-area-from').value = '';
      by_id('input-area-to').value = '';
      by_id('input-area').style.display = 'block';
    }}, [])
  ]);

  by_id('input-area-cancel').onclick = function () {
    by_id('input-area').style.display = 'none';
  };

  by_id('input-area-save').onclick = function () {
    by_id('input-area').style.display = 'none';
    storage.get(['substitutions'], function (x) {
      x.substitutions.push({
        from: by_id('input-area-from').value,
        to: by_id('input-area-to').value
      });
      storage.set({
        substitutions: x.substitutions
      });
    });
  };

  function substitutions_table(substitutions) {
    var t = by_id('substitutions');
    while (t.hasChildNodes()) {
      t.removeChild(t.lastChild);
    }
    substitutions.forEach(function (x, n) {
      t.appendChild(mk.tr([
        mk.td(x.from),
        mk.td({'class': 'wide'}, '⇨'),
        mk.td(x.to),
        mk.td({'class': 'wide'}, [
          mk.span({title: 'delete', onclick: function () {
            if (window.confirm('Delete? Sure?')) {
              substitutions.splice(n, 1);
              storage.set({
                substitutions: substitutions
              });
            }
          }}, '☒')
        ])
      ]));
    });
  }

  // SETUP

  storage.get(['error_correction_level', 'size', 'substitutions'], function (x) {
    by_id('error_correction_level_' + x.error_correction_level).checked = true;
    by_id('size_' + x.size).checked = true;
    substitutions_table(x.substitutions);
  });

  // EVENTS

  storage.onchange(function (x) {
    if (x.substitutions) {
      substitutions_table(x.substitutions);
    }
    if (x.error_correction_level) {
      by_id('error_correction_level_' + x.error_correction_level).checked = true;
    }
    if (x.size) {
      by_id('size_' + x.size).checked = true;
    }
  });

}(window.document));
