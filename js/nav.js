/* nav.js - builds the top navigation on every vault page */
(function () {
  'use strict';

  var host = document.getElementById('site-nav');
  if (!host) return;
  var active = host.getAttribute('data-active');

  function cur(key) { return active === key ? ' aria-current="page"' : ''; }

  host.className = 'site-nav';
  host.setAttribute('data-menu', 'closed');
  host.innerHTML =
    '<div class="site-nav__inner">' +
      '<a class="site-nav__brand" href="journey.html">The Vault</a>' +
      '<button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-panel"><span></span></button>' +
      '<div class="site-nav__panel" id="nav-panel" style="display:contents">' +
        '<ul class="site-nav__links">' +
          '<li><a href="journey.html"' + cur('journey') + '>Journey So Far</a></li>' +
          '<li><a href="past-present-future.html"' + cur('stills') + '>Past Present Future</a></li>' +
          '<li class="has-sub" data-open="false">' +
            '<button type="button" class="nav-link" aria-haspopup="true" aria-expanded="false"' + (active === 'last' ? ' aria-current="page"' : '') + '>One Last Time<span class="caret" aria-hidden="true">&#9662;</span></button>' +
            '<ul class="sub">' +
              '<li><a href="one-last-time.html#paintings" data-tab="paintings">Paintings</a></li>' +
              '<li><a href="one-last-time.html#songs" data-tab="songs">Songs</a></li>' +
            '</ul>' +
          '</li>' +
        '</ul>' +
        '<button type="button" class="site-nav__leave" id="leave-vault">Leave the vault</button>' +
      '</div>' +
    '</div>';

  var panel = host.querySelector('.site-nav__panel');
  var toggle = host.querySelector('.nav-toggle');
  var sub = host.querySelector('.has-sub');
  var subBtn = sub.querySelector('button');

  // on desktop the panel is just a transparent wrapper; on phones it is the drop-down menu
  var mq = window.matchMedia('(max-width: 860px)');
  function layout() {
    if (mq.matches) { panel.style.display = ''; }
    else { panel.style.display = 'contents'; host.setAttribute('data-menu', 'closed'); toggle.setAttribute('aria-expanded', 'false'); }
  }
  layout();
  if (mq.addEventListener) mq.addEventListener('change', layout); else mq.addListener(layout);

  toggle.addEventListener('click', function () {
    var open = host.getAttribute('data-menu') !== 'open';
    host.setAttribute('data-menu', open ? 'open' : 'closed');
    toggle.setAttribute('aria-expanded', String(open));
  });

  function setSub(open) {
    sub.setAttribute('data-open', String(open));
    subBtn.setAttribute('aria-expanded', String(open));
  }
  subBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setSub(sub.getAttribute('data-open') !== 'true');
  });
  document.addEventListener('click', function (e) { if (!sub.contains(e.target)) setSub(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSub(false); });

  document.getElementById('leave-vault').addEventListener('click', function () { window.Vault.logout(); });

  // Sub-links on the One Last Time page switch tabs without reloading.
  if (active === 'last') {
    host.querySelectorAll('[data-tab]').forEach(function (a) {
      a.addEventListener('click', function () {
        setSub(false);
        host.setAttribute('data-menu', 'closed');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
