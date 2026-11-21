/*
 * config.js - the few things you may want to tweak.
 */
window.VAULT_CONFIG = {
  // Birth moment. Only the date was given, so this is midnight on the birthday
  // in Sri Lanka time (UTC+05:30). If you ever learn the exact time of birth,
  // change it here (keep the +05:30 at the end) and every counter follows.
  birthISO: '2006-11-22T00:00:00+05:30',
  tzOffsetMinutes: 330,

  // When the two films unlock (Past Present Future page).
  // Midnight at the start of next year's birthday. If this moment ever passes,
  // the countdown automatically rolls forward to the following November 22.
  unlockISO: '2027-11-22T00:00:00+05:30',

  // ---- Estimates (shown with a "≈" on the page) --------------------------
  MIN_PER_YEAR: 525949.2,

  // Average resting heartbeats per minute by age band: [fromYear, toYear, bpm]
  heartSegments: [
    [0, 1, 125], [1, 3, 110], [3, 6, 98], [6, 12, 88], [12, 18, 78], [18, 200, 72]
  ],
  // Average breaths per minute by age band: [fromYear, toYear, breaths/min]
  breathSegments: [
    [0, 1, 40], [1, 3, 28], [3, 6, 22], [6, 12, 19], [12, 18, 17], [18, 200, 15]
  ],

  // Orbital periods in days
  EARTH_YEAR_DAYS: 365.256363,
  VENUS_YEAR_DAYS: 224.701,

  // Motion through space (km per second)
  SUN_ORBIT_KM_S: 230,          // the Solar System around the Milky Way's centre
  GALAXY_KM_S: 552,             // the Milky Way relative to the cosmic microwave background
  KM_PER_LIGHT_YEAR: 9.4607304725808e12,

  // Star formation: ~100 billion galaxies x ~1 solar mass of new stars per
  // year each, at ~0.4 solar masses per average star -> ~250 billion stars
  // a year across the observable universe.
  STARS_PER_YEAR: 2.5e11,
  PLANETS_PER_STAR: 1.6,        // microlensing surveys: >1 bound planet per star on average
  PLANETARY_SYSTEM_FRACTION: 0.5 // share of new stars that end up with a planetary system
};
