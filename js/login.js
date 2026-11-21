/* login.js - security page behaviour */
(function () {
  'use strict';

  // Already verified in this tab? Go straight to the vault.
  if (window.Vault.currentPerson()) {
    window.location.replace('journey.html');
    return;
  }

  var REDIRECT_MS = 3400;
  var MAX_TRIES = 5;
  var LOCK_SECONDS = 30;

  var page = document.getElementById('login-page');
  var form = document.getElementById('login-form');
  var nameInput = document.getElementById('name');
  var tokenInput = document.getElementById('token');
  var toggle = document.getElementById('toggle-token');
  var hint = document.getElementById('form-hint');
  var submit = document.getElementById('submit');
  var welcome = document.getElementById('welcome-modal');
  var welcomeTitle = document.getElementById('welcome-title');
  var denied = document.getElementById('denied-modal');
  var deniedClose = document.getElementById('denied-close');

  var fails = 0;
  var lockedUntil = 0;
  var lockTimer = null;
  var busy = false;

  toggle.addEventListener('click', function () {
    var show = tokenInput.type === 'password';
    tokenInput.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide access token' : 'Show access token');
  });

  function setHint(msg) { hint.textContent = msg || ''; }

  function startLock() {
    lockedUntil = Date.now() + LOCK_SECONDS * 1000;
    submit.disabled = true;
    clearInterval(lockTimer);
    lockTimer = setInterval(function () {
      var left = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(lockTimer);
        submit.disabled = false;
        fails = 0;
        setHint('');
      } else {
        setHint('Too many attempts. Please wait ' + left + 's before trying again.');
      }
    }, 250);
  }

  function showModal(el) {
    el.hidden = false;
    document.body.classList.add('no-scroll');
  }
  function hideModal(el) {
    el.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  function closeDenied() {
    hideModal(denied);
    tokenInput.value = '';
    tokenInput.focus();
  }
  deniedClose.addEventListener('click', closeDenied);
  denied.addEventListener('click', function (e) { if (e.target === denied) closeDenied(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !denied.hidden) closeDenied();
  });

  function onSuccess(person) {
    window.Vault.startSession(person);
    // 1) the login window closes with an animation
    page.classList.add('is-closing');
    form.classList.add('is-closing');
    // 2) then the welcome window appears
    setTimeout(function () {
      welcomeTitle.textContent = 'Welcome ' + person.title + ',';
      document.documentElement.style.setProperty('--redirect', REDIRECT_MS + 'ms');
      showModal(welcome);
      // 3) and finally we head into the vault
      setTimeout(function () { window.location.href = 'journey.html'; }, REDIRECT_MS);
    }, 800);
  }

  function onFail() {
    fails += 1;
    busy = false;
    submit.disabled = false;
    submit.textContent = 'Enter the vault';
    form.classList.remove('is-shaking');
    void form.offsetWidth; // restart the animation
    form.classList.add('is-shaking');
    showModal(denied);
    deniedClose.focus();
    if (fails >= MAX_TRIES) startLock();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy || Date.now() < lockedUntil) return;

    var name = nameInput.value.trim();
    var token = tokenInput.value.trim();

    if (!name || !token) {
      setHint(!name ? 'Please enter your name.' : 'Please enter your access token.');
      (!name ? nameInput : tokenInput).focus();
      return;
    }
    setHint('');
    busy = true;
    submit.disabled = true;
    submit.textContent = 'Checking…';

    // small delay so the button state paints before the hashing work runs
    setTimeout(function () {
      var person = null;
      try { person = window.Vault.verify(token); } catch (err) { person = null; }
      if (person) onSuccess(person); else onFail();
    }, 60);
  });
})();
