/*global window, chrome */
/*jslint
  indent:   2,
  vars:     true
*/

(function (d) {

  'use strict';

  function redraw_table() {
    window.location.reload(); // hard redraw :-[
  }

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

  function mk_fieldset(label, childs) {
    d.body.appendChild(mk.fieldset({}, [
      mk.legend(label)
    ].concat(childs)));
  }

  function mk_radio(name, id, checked, label, onchange) {
    return mk.label({
      'for': id
    }, [
      mk.input({
        type: 'radio',
        id: id,
        name: name,
        checked: checked,
        onchange: onchange
      }, []),
      mk.span(label)
    ]);
  }

  function mk_substitutions_table(substitutions, input_area) {
    var input_from = mk.input({type: 'text'}, []);
    var input_to = mk.input({type: 'text'}, []);
    input_area.appendChild(mk.div([
      mk.table([
        mk.tr([mk.td({colspan: 2}, 'From (string to replace):')]),
        mk.tr([mk.td({colspan: 2}, [input_from])]),
        mk.tr([mk.td({colspan: 2}, 'To (replacement):')]),
        mk.tr([mk.td({colspan: 2}, [input_to])]),
        mk.tr([
          mk.td([mk.button({onclick: function () {
            chrome.storage.local.get({
              substitutions: null
            }, function (state) {
              var p = state.substitutions || [];
              p.push({
                from: input_from.value,
                to: input_to.value
              });
              chrome.storage.local.set({
                substitutions: p
              }, redraw_table);
            });
          }}, 'save')]),
          mk.td([mk.button({onclick: function () {
            input_area.style.display = 'none';
          }}, 'cancel')])
        ])
      ]) // mk.table
    ]));
    var table = [];
    if (substitutions) {
      substitutions.forEach(function (v, n) {
        table.push(mk.tr([
          mk.td(v.from),
          mk.td(v.to),
          mk.td([mk.button({
            onclick: function () {
              substitutions.splice(n, 1);
              chrome.storage.local.set({
                substitutions: substitutions
              }, redraw_table);
            }
          }, 'delete')])
        ]));
      });
    }
    table.push(mk.tr([
      mk.td({
        colspan: 3
      }, [
        mk.button({
          onclick: function () {
            input_area.style.display = 'block';
          }
        }, 'Add substitution')
      ])
    ]));
    return mk.table({id: 'list'}, table);
  }

  chrome.storage.local.get({
    error_correction_level: 'L',
    size: 300,
    substitutions: null
  }, function (state) {
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
        level === state.error_correction_level,
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
        v === state.size,
        ' ' + v + 'x' + v + ' px',
        function () {
          chrome.storage.local.set({
            size: v
          });
        }
      );
    }));
    var input_area = d.createElement('div');
    input_area.id = 'input-area';
    mk_fieldset('Substitutions', [mk_substitutions_table(state.substitutions, input_area)]);
    d.body.appendChild(input_area); // must be at the end of document
  });

}(window.document));
