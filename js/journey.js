/* journey.js - live counters for the Journey So Far page */
(function () {
  'use strict';

  var C = window.VAULT_CONFIG;
  var D = window.VAULT_DATA;

  var BIRTH = Date.parse(C.birthISO);
  var DAY_MS = 86400000;
  var YEAR_MS = 365.2425 * DAY_MS;

  function $(id) { return document.getElementById(id); }
  function whole(n) { return Math.floor(n).toLocaleString('en-US'); }
  function fixed(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }

  // ---------- helpers ----------
  // cumulative count for "per minute" age bands
  function banded(segments, ageYears) {
    var total = 0;
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i];
      var overlap = Math.max(0, Math.min(ageYears, s[1]) - s[0]);
      total += overlap * C.MIN_PER_YEAR * s[2];
    }
    return total;
  }

  // daily-rate anchors: [decimalYear, perDay], linear in between, flat after the last
  function rateAt(anchors, y) {
    if (y <= anchors[0][0]) return anchors[0][1];
    for (var i = 1; i < anchors.length; i++) {
      if (y <= anchors[i][0]) {
        var a = anchors[i - 1], b = anchors[i];
        return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]);
      }
    }
    return anchors[anchors.length - 1][1];
  }
  function integrate(anchors, y0, y1) {
    if (y1 <= y0) return 0;
    var pts = [y0], i;
    for (i = 0; i < anchors.length; i++) if (anchors[i][0] > y0 && anchors[i][0] < y1) pts.push(anchors[i][0]);
    pts.push(y1);
    var sum = 0;
    for (i = 0; i < pts.length - 1; i++) {
      sum += (rateAt(anchors, pts[i]) + rateAt(anchors, pts[i + 1])) / 2 * (pts[i + 1] - pts[i]) * 365.2425;
    }
    return sum;
  }
  function decimalYear(ts) { return 1970 + ts / YEAR_MS; }

  function toTimes(list) { return list.map(function (s) { return Date.parse(s); }); }
  var SOLAR = toTimes(D.solarEclipses);
  var LUNAR = toTimes(D.lunarEclipses);
  function countPast(times, now) {
    var n = 0;
    for (var i = 0; i < times.length; i++) if (times[i] <= now) n++;
    return n;
  }
  function nextAfter(times, now) {
    for (var i = 0; i < times.length; i++) if (times[i] > now) return times[i];
    return null;
  }

  // calendar age, measured on the birthplace clock (UTC+05:30)
  function wall(ts) {
    var d = new Date(ts + C.tzOffsetMinutes * 60000);
    return { y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(),
             mi: d.getUTCMinutes(), s: d.getUTCSeconds(), ms: d.getUTCMilliseconds() };
  }
  var B = wall(BIRTH);
  function calendarAge(now) {
    var n = wall(now);
    var r = { y: n.y - B.y, mo: n.mo - B.mo, d: n.d - B.d, h: n.h - B.h, mi: n.mi - B.mi, s: n.s - B.s, ms: n.ms - B.ms };
    if (r.ms < 0) { r.ms += 1000; r.s--; }
    if (r.s < 0) { r.s += 60; r.mi--; }
    if (r.mi < 0) { r.mi += 60; r.h--; }
    if (r.h < 0) { r.h += 24; r.d--; }
    if (r.d < 0) { r.d += new Date(Date.UTC(n.y, n.mo, 0)).getUTCDate(); r.mo--; }
    if (r.mo < 0) { r.mo += 12; r.y--; }
    return r;
  }

  function presidentAt(ts) {
    var found = D.presidents[0];
    for (var i = 0; i < D.presidents.length; i++) {
      if (Date.parse(D.presidents[i].start + 'T00:00:00-05:00') <= ts) found = D.presidents[i];
    }
    return found;
  }

  // ---------- element cache ----------
  var el = {
    today: $('today'), banner: $('birthday-banner'),
    ay: $('age-y'), amo: $('age-mo'), ad: $('age-d'), ah: $('age-h'), ami: $('age-mi'), as: $('age-s'), ams: $('age-ms'),
    heart: $('s-heart'), breath: $('s-breath'), songs: $('s-songs'), videos: $('s-videos'),
    elections: $('s-elections'), chips: $('election-chips'), pNow: $('president-now'), pBirth: $('president-birth'),
    earth: $('s-earth'), venus: $('s-venus'),
    sunLy: $('s-sun-ly'), sunKm: $('s-sun-km'), mwLy: $('s-mw-ly'), mwKm: $('s-mw-km'),
    stars: $('s-stars'), planets: $('s-planets'), systems: $('s-systems'),
    solar: $('s-solar'), lunar: $('s-lunar'), next: $('eclipse-next')
  };

  var lastDay = '';
  var lastElectionCount = -1;
  var shortDate = { month: 'long', day: 'numeric', year: 'numeric' };

  function renderSlow(now) {
    var elapsed = now - BIRTH;
    var ageYears = elapsed / YEAR_MS;
    var seconds = elapsed / 1000;
    var yNow = decimalYear(now);
    var yBirth = decimalYear(BIRTH);

    el.heart.textContent = whole(banded(C.heartSegments, ageYears));
    el.breath.textContent = whole(banded(C.breathSegments, ageYears));
    el.songs.textContent = whole(integrate(D.songsPerDay, yBirth, yNow));
    el.videos.textContent = whole(integrate(D.videosPerDay, yBirth, yNow));

    el.earth.textContent = fixed(elapsed / DAY_MS / C.EARTH_YEAR_DAYS, 9);
    el.venus.textContent = fixed(elapsed / DAY_MS / C.VENUS_YEAR_DAYS, 9);

    var sunKm = seconds * C.SUN_ORBIT_KM_S;
    var mwKm = seconds * C.GALAXY_KM_S;
    el.sunLy.textContent = fixed(sunKm / C.KM_PER_LIGHT_YEAR, 9);
    el.sunKm.textContent = whole(sunKm);
    el.mwLy.textContent = fixed(mwKm / C.KM_PER_LIGHT_YEAR, 9);
    el.mwKm.textContent = whole(mwKm);

    var stars = (elapsed / YEAR_MS) * C.STARS_PER_YEAR;
    el.stars.textContent = whole(stars);
    el.planets.textContent = whole(stars * C.PLANETS_PER_STAR);
    el.systems.textContent = whole(stars * C.PLANETARY_SYSTEM_FRACTION);

    el.solar.textContent = String(countPast(SOLAR, now));
    el.lunar.textContent = String(countPast(LUNAR, now));

    // next eclipses
    var ns = nextAfter(SOLAR, now), nl = nextAfter(LUNAR, now);
    var parts = [];
    if (ns) parts.push('Next solar eclipse: ' + new Date(ns).toLocaleDateString('en-US', shortDate));
    if (nl) parts.push('next lunar eclipse: ' + new Date(nl).toLocaleDateString('en-US', shortDate));
    el.next.textContent = parts.join(' · ') + (parts.length ? '.' : '');

    // today's date (re-checked every tick so it flips at midnight)
    var d = new Date(now);
    var key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
    if (key !== lastDay) {
      lastDay = key;
      el.today.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      var w = wall(now);
      el.banner.hidden = !(w.mo === B.mo && w.d === B.d);
    }

    // elections + presidents
    var done = D.elections.filter(function (e) {
      var t = Date.parse(e.date + 'T00:00:00-05:00');
      return t > BIRTH && t <= now;
    });
    if (done.length !== lastElectionCount) {
      lastElectionCount = done.length;
      el.elections.textContent = String(done.length);
      el.chips.innerHTML = done.map(function (e) {
        return '<li><b>' + e.date.slice(0, 4) + '</b>' + e.winner + '</li>';
      }).join('');
    }
    var pres = presidentAt(now), born = presidentAt(BIRTH);
    el.pNow.textContent = pres.name + ' (' + pres.ordinal + ')';
    el.pBirth.textContent = 'In office at birth: ' + born.name + '. Next election: ' + D.nextElection.label + '.';
  }

  function renderAge(now) {
    var a = calendarAge(now);
    el.ay.textContent = a.y;
    el.amo.textContent = a.mo;
    el.ad.textContent = a.d;
    el.ah.textContent = pad(a.h, 2);
    el.ami.textContent = pad(a.mi, 2);
    el.as.textContent = pad(a.s, 2);
    el.ams.textContent = pad(a.ms, 3);
  }

  var lastSlow = 0;
  function frame() {
    var now = Date.now();
    renderAge(now);
    if (now - lastSlow >= 100) { lastSlow = now; renderSlow(now); }
    requestAnimationFrame(frame);
  }
  renderSlow(Date.now());
  requestAnimationFrame(frame);
})();
