/* stills.js - locked films, countdown timers and the swipeable first-look window */
(function () {
  'use strict';

  var C = window.VAULT_CONFIG;

  /* ------------------------------------------------------------
   * The two slots. The image names must match your files exactly:
   *   images/stills/2700bcestill1.png ... 2700bcestill4.png
   *   images/stills/2140acestill1.png ... 2140acestill4.png
   * ------------------------------------------------------------ */
  var SLOTS = {
    '2700bce': { title: '2700 BCE – Heladvipa', count: 4 },
    '2140ace': { title: '2140 ACE – New York', count: 4 }
  };
  function stillPath(slot, n) { return 'images/stills/' + slot + 'still' + n + '.png'; }

  /* ---------- countdown ---------- */
  var UNLOCK = Date.parse(C.unlockISO);
  function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }

  function target(now) {
    var t = UNLOCK;
    // if the unlock moment has passed, roll on to the next November 22 (midnight, UTC+05:30)
    while (t <= now) {
      var d = new Date(t + C.tzOffsetMinutes * 60000);
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      t = d.getTime() - C.tzOffsetMinutes * 60000;
    }
    return t;
  }

  var timers = [].slice.call(document.querySelectorAll('[data-countdown]')).map(function (box) {
    return {
      d: box.querySelector('[data-u="d"]'), h: box.querySelector('[data-u="h"]'),
      m: box.querySelector('[data-u="m"]'), s: box.querySelector('[data-u="s"]')
    };
  });
  function tick() {
    var now = Date.now();
    var left = Math.max(0, target(now) - now);
    var secs = Math.floor(left / 1000);
    var d = Math.floor(secs / 86400);
    var h = Math.floor((secs % 86400) / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    timers.forEach(function (t) {
      t.d.textContent = pad(d, 3);
      t.h.textContent = pad(h, 2);
      t.m.textContent = pad(m, 2);
      t.s.textContent = pad(s, 2);
    });
  }
  tick();
  setInterval(tick, 1000);

  // hide the blurred teaser image if the file isn't there yet
  [].forEach.call(document.querySelectorAll('.film__thumb'), function (img) {
    img.addEventListener('error', function () { img.setAttribute('data-missing', 'true'); });
  });

  /* ---------- first-look window ---------- */
  var lb, viewport, track, titleEl, countEl, prevBtn, nextBtn, dotsEl, closeBtn;
  var slot = null, index = 0, opener = null;

  function build() {
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'First look');
    lb.innerHTML =
      '<div class="lb__top">' +
        '<h2 class="lb__title"></h2>' +
        '<div style="display:flex;align-items:center">' +
          '<span class="lb__count num" aria-live="polite"></span>' +
          '<button type="button" class="lb__close" aria-label="Close">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="lb__stage">' +
        '<div class="lb__viewport"><div class="lb__track"></div></div>' +
        '<button type="button" class="lb__arrow lb__arrow--prev" aria-label="Previous still">&#8249;</button>' +
        '<button type="button" class="lb__arrow lb__arrow--next" aria-label="Next still">&#8250;</button>' +
      '</div>' +
      '<div class="lb__dots"></div>' +
      '<p class="lb__hint">Swipe or use the arrows</p>';
    document.body.appendChild(lb);

    viewport = lb.querySelector('.lb__viewport');
    track = lb.querySelector('.lb__track');
    titleEl = lb.querySelector('.lb__title');
    countEl = lb.querySelector('.lb__count');
    prevBtn = lb.querySelector('.lb__arrow--prev');
    nextBtn = lb.querySelector('.lb__arrow--next');
    dotsEl = lb.querySelector('.lb__dots');
    closeBtn = lb.querySelector('.lb__close');

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { go(index - 1); });
    nextBtn.addEventListener('click', function () { go(index + 1); });
    // clicking the dark area outside the picture closes the window
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'Tab') trapFocus(e);
    });
    enableSwipe();
  }

  function trapFocus(e) {
    var f = [].slice.call(lb.querySelectorAll('button:not([disabled])'));
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function fillSlides() {
    var cfg = SLOTS[slot];
    track.innerHTML = '';
    dotsEl.innerHTML = '';
    for (var i = 1; i <= cfg.count; i++) {
      (function (n) {
        var li = document.createElement('div');
        li.className = 'lb__slide';
        var img = new Image();
        img.alt = cfg.title + ' – first look ' + n + ' of ' + cfg.count;
        img.draggable = false;
        img.decoding = 'async';
        img.addEventListener('error', function () {
          li.innerHTML = '<div class="lb__missing">Add this still to your folder:<b>' + stillPath(slot, n) + '</b></div>';
        });
        img.src = stillPath(slot, n);
        li.appendChild(img);
        track.appendChild(li);

        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'lb__dot';
        dot.setAttribute('aria-label', 'Go to still ' + n);
        dot.addEventListener('click', function () { go(n - 1); });
        dotsEl.appendChild(dot);
      })(i);
    }
  }

  function go(i) {
    var max = SLOTS[slot].count - 1;
    index = Math.max(0, Math.min(max, i));
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    countEl.textContent = (index + 1) + ' / ' + (max + 1);
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === max;
    [].forEach.call(dotsEl.children, function (d, n) {
      if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }

  function open(key, trigger) {
    if (!lb) build();
    slot = key;
    opener = trigger;
    titleEl.textContent = SLOTS[key].title;
    fillSlides();
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    track.classList.add('is-dragging');       // jump to first still with no slide animation
    go(0);
    void track.offsetWidth;
    track.classList.remove('is-dragging');
    closeBtn.focus();
  }

  function close() {
    lb.hidden = true;
    document.body.classList.remove('no-scroll');
    if (opener) opener.focus();
  }

  /* swipe / drag with finger or mouse */
  function enableSwipe() {
    var startX = 0, startY = 0, dx = 0, active = false, locked = false;
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      active = true; locked = false; startX = e.clientX; startY = e.clientY; dx = 0;
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!active) return;
      var mx = e.clientX - startX, my = e.clientY - startY;
      if (!locked) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        if (Math.abs(my) > Math.abs(mx)) { active = false; return; }   // vertical gesture: let the page handle it
        locked = true;
        track.classList.add('is-dragging');
        viewport.classList.add('is-dragging');
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
      dx = mx;
      var atStart = index === 0 && dx > 0;
      var atEnd = index === SLOTS[slot].count - 1 && dx < 0;
      var eased = (atStart || atEnd) ? dx * 0.3 : dx;     // resist at the ends
      track.style.transform = 'translateX(calc(' + (-index * 100) + '% + ' + eased + 'px))';
    });
    function finish() {
      if (!active && !locked) return;
      var w = viewport.clientWidth || 1;
      track.classList.remove('is-dragging');
      viewport.classList.remove('is-dragging');
      if (locked) {
        if (dx < -Math.min(60, w * 0.12)) go(index + 1);
        else if (dx > Math.min(60, w * 0.12)) go(index - 1);
        else go(index);
      }
      active = false; locked = false; dx = 0;
    }
    viewport.addEventListener('pointerup', finish);
    viewport.addEventListener('pointercancel', finish);
  }

  [].forEach.call(document.querySelectorAll('.film'), function (card) {
    var key = card.getAttribute('data-slot');
    card.querySelector('.film__poster').addEventListener('click', function (e) { open(key, e.currentTarget); });
  });
})();
