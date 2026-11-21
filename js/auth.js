/*
 * auth.js - token hashing, verification and the page guard.
 * Pure JavaScript SHA-256 so it works everywhere (phones, old browsers,
 * even when the files are opened straight from a folder).
 */
(function () {
  'use strict';

  var K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function sha256(bytes) {
    var H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    var l = bytes.length;
    var padLen = ((l + 9 + 63) >> 6) << 6;
    var buf = new Uint8Array(padLen);
    buf.set(bytes);
    buf[l] = 0x80;
    var dv = new DataView(buf.buffer);
    dv.setUint32(padLen - 8, Math.floor((l * 8) / 0x100000000));
    dv.setUint32(padLen - 4, (l * 8) >>> 0);
    var w = new Uint32Array(64);
    for (var off = 0; off < padLen; off += 64) {
      var i;
      for (i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (i = 16; i < 64; i++) {
        var a15 = w[i - 15], a2 = w[i - 2];
        var s0 = ((a15 >>> 7) | (a15 << 25)) ^ ((a15 >>> 18) | (a15 << 14)) ^ (a15 >>> 3);
        var s1 = ((a2 >>> 17) | (a2 << 15)) ^ ((a2 >>> 19) | (a2 << 13)) ^ (a2 >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    var out = new Uint8Array(32);
    var odv = new DataView(out.buffer);
    for (var j = 0; j < 8; j++) odv.setUint32(j * 4, H[j]);
    return out;
  }

  function utf8(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var s = unescape(encodeURIComponent(str)), arr = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i);
    return arr;
  }

  function toHex(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
    return s;
  }

  // salted, iterated SHA-256 (same recipe that produced the hashes in auth-data.js)
  function hashToken(token) {
    var V = window.VAULT;
    var tokenBytes = utf8(token);
    var d = sha256(utf8(V.salt + token));
    for (var i = 1; i < V.rounds; i++) {
      var joined = new Uint8Array(32 + tokenBytes.length);
      joined.set(d);
      joined.set(tokenBytes, 32);
      d = sha256(joined);
    }
    return toHex(d);
  }

  function findByHash(hash) {
    var people = window.VAULT.people;
    for (var i = 0; i < people.length; i++) {
      if (people[i].hash === hash) return people[i];
    }
    return null;
  }

  // Returns the matching person for a token, or null.
  function verify(token) {
    if (typeof token !== 'string' || token.length === 0) return null;
    return findByHash(hashToken(token));
  }

  var KEY = 'vault.session';

  function startSession(person) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ hash: person.hash, t: Date.now() }));
    } catch (e) { /* private mode: ignore */ }
  }

  function currentPerson() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      return s && s.hash ? findByHash(s.hash) : null;
    } catch (e) { return null; }
  }

  function logout() {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    window.location.replace('index.html');
  }

  // Put at the top of every protected page: sends visitors without a
  // verified token back to the security page before anything is shown.
  function guard() {
    if (!currentPerson()) {
      document.documentElement.style.display = 'none';
      window.location.replace('index.html');
    }
  }

  window.Vault = {
    sha256: sha256, hashToken: hashToken, verify: verify,
    startSession: startSession, currentPerson: currentPerson,
    logout: logout, guard: guard
  };
})();
