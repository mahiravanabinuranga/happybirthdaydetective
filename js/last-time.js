/* last-time.js - switches between the Paintings and Songs sub-pages */
(function () {
  'use strict';

  var tabs = [].slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  var panels = {
    paintings: document.getElementById('panel-paintings'),
    songs: document.getElementById('panel-songs')
  };

  function show(name, updateHash) {
    if (!panels[name]) name = 'paintings';
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
    document.title = (name === 'songs' ? 'Songs' : 'Paintings') + ' · One Last Time';
    if (updateHash && window.history && history.replaceState) history.replaceState(null, '', '#' + name);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('data-tab'), true); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      show(next.getAttribute('data-tab'), true);
    });
  });

  function fromHash() { show((location.hash || '').replace('#', ''), false); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
