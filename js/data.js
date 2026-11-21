/*
 * data.js - facts the Journey So Far page counts from.
 */
window.VAULT_DATA = {

  // Global solar eclipses (peak time, UTC), computed with astronomy-engine
  // from the birth date up to 2030. Anything in the past is counted automatically.
  solarEclipses: [
    "2007-03-19T02:31Z", "2007-09-11T12:31Z", "2008-02-07T03:55Z", "2008-08-01T10:21Z", "2009-01-26T07:58Z",
    "2009-07-22T02:35Z", "2010-01-15T07:06Z", "2010-07-11T19:33Z", "2011-01-04T08:50Z", "2011-06-01T21:16Z",
    "2011-07-01T08:38Z", "2011-11-25T06:20Z", "2012-05-20T23:52Z", "2012-11-13T22:11Z", "2013-05-10T00:25Z",
    "2013-11-03T12:46Z", "2014-04-29T06:03Z", "2014-10-23T21:44Z", "2015-03-20T09:45Z", "2015-09-13T06:54Z",
    "2016-03-09T01:57Z", "2016-09-01T09:06Z", "2017-02-26T14:53Z", "2017-08-21T18:25Z", "2018-02-15T20:51Z",
    "2018-07-13T03:01Z", "2018-08-11T09:46Z", "2019-01-06T01:41Z", "2019-07-02T19:22Z", "2019-12-26T05:17Z",
    "2020-06-21T06:40Z", "2020-12-14T16:13Z", "2021-06-10T10:41Z", "2021-12-04T07:33Z", "2022-04-30T20:41Z",
    "2022-10-25T11:00Z", "2023-04-20T04:16Z", "2023-10-14T17:59Z", "2024-04-08T18:17Z", "2024-10-02T18:44Z",
    "2025-03-29T10:47Z", "2025-09-21T19:41Z", "2026-02-17T12:11Z", "2026-08-12T17:45Z", "2027-02-06T15:59Z",
    "2027-08-02T10:06Z", "2028-01-26T15:07Z", "2028-07-22T02:55Z", "2029-01-14T17:12Z", "2029-06-12T04:04Z",
    "2029-07-11T15:36Z", "2029-12-05T15:02Z", "2030-06-01T06:27Z", "2030-11-25T06:50Z"
  ],

  // Lunar eclipses (total, partial and penumbral), same source.
  lunarEclipses: [
    "2007-03-03T23:20Z", "2007-08-28T10:37Z", "2008-02-21T03:26Z", "2008-08-16T21:10Z", "2009-02-09T14:38Z",
    "2009-07-07T09:38Z", "2009-08-06T00:39Z", "2009-12-31T19:22Z", "2010-06-26T11:38Z", "2010-12-21T08:16Z",
    "2011-06-15T20:12Z", "2011-12-10T14:31Z", "2012-06-04T11:03Z", "2012-11-28T14:33Z", "2013-04-25T20:07Z",
    "2013-05-25T04:10Z", "2013-10-18T23:50Z", "2014-04-15T07:45Z", "2014-10-08T10:54Z", "2015-04-04T12:00Z",
    "2015-09-28T02:47Z", "2016-03-23T11:47Z", "2016-09-16T18:54Z", "2017-02-11T00:43Z", "2017-08-07T18:20Z",
    "2018-01-31T13:29Z", "2018-07-27T20:21Z", "2019-01-21T05:12Z", "2019-07-16T21:30Z", "2020-01-10T19:10Z",
    "2020-06-05T19:24Z", "2020-07-05T04:29Z", "2020-11-30T09:42Z", "2021-05-26T11:18Z", "2021-11-19T09:02Z",
    "2022-05-16T04:11Z", "2022-11-08T10:59Z", "2023-05-05T17:22Z", "2023-10-28T20:13Z", "2024-03-25T07:12Z",
    "2024-09-18T02:44Z", "2025-03-14T06:58Z", "2025-09-07T18:11Z", "2026-03-03T11:33Z", "2026-08-28T04:12Z",
    "2027-02-20T23:12Z", "2027-07-18T16:02Z", "2027-08-17T07:13Z", "2028-01-12T04:13Z", "2028-07-06T18:19Z",
    "2028-12-31T16:51Z", "2029-06-26T03:22Z", "2029-12-20T22:41Z", "2030-06-15T18:33Z", "2030-12-09T22:27Z"
  ],

  // US presidential elections since the birth date (election day, winner).
  // After the next election, add a line here, e.g.
  //   { date: '2028-11-07', winner: 'Name Here' },
  elections: [
    { date: '2008-11-04', winner: 'Barack Obama' },
    { date: '2012-11-06', winner: 'Barack Obama' },
    { date: '2016-11-08', winner: 'Donald Trump' },
    { date: '2020-11-03', winner: 'Joe Biden' },
    { date: '2024-11-05', winner: 'Donald Trump' }
  ],
  nextElection: { date: '2028-11-07', label: 'November 7, 2028' },

  // Who held the office, by inauguration date. After the next inauguration
  // (January 20, 2029) add the new president here.
  presidents: [
    { start: '2001-01-20', name: 'George W. Bush', ordinal: '43rd' },
    { start: '2009-01-20', name: 'Barack Obama',   ordinal: '44th' },
    { start: '2017-01-20', name: 'Donald J. Trump', ordinal: '45th' },
    { start: '2021-01-20', name: 'Joe Biden',      ordinal: '46th' },
    { start: '2025-01-20', name: 'Donald J. Trump', ordinal: '47th' }
  ],

  // Daily output (per day) at points in time, as [decimal year, per day].
  // Linear between points; the last value carries on afterwards.
  // Songs: new tracks delivered to music services. Calibrated so ~253 million
  // tracks exist by end of 2025 (Luminate: ~99k/day in 2024, ~106k/day in 2025).
  songsPerDay: [
    [2006.9, 1321], [2010, 3962], [2013, 7483], [2016, 13206], [2018, 21130], [2020, 27293],
    [2022, 100000], [2023, 120000], [2024, 99000], [2025.5, 106000]
  ],
  // YouTube: calibrated so ~20 billion videos exist by April 2025
  // (YouTube's own 20th-anniversary figure).
  videosPerDay: [
    [2006.9, 85774], [2008, 214435], [2010, 600417], [2012, 1286608], [2014, 1972798],
    [2016, 2573215], [2018, 3259406], [2020, 4288692], [2022, 5575299], [2025, 6861907]
  ]
};
