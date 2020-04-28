const axios = require('axios');
const cache = require('memory-cache');
const { flat, getCurrentTimeInSeconds } = require('./utils');

const codeforces = require('./parsers/codeforces');
const hackerearth = require('./parsers/hackerearth');
const hackerrank = require('./parsers/hackerrank');
const topcoder = require('./parsers/topcoder');
const codechef = require('./parsers/codechef');

const runner = () => axios.all([
  codeforces(),
  hackerearth(),
  hackerrank(),
  topcoder(),
  codechef(),
])
  .then((contestsByPlatform) => {
    const contests = flat(contestsByPlatform.filter(it => Array.isArray(it)));

    const curTime = getCurrentTimeInSeconds();

    const sortByStartTime = (a, b) => a.startTime - b.startTime;
    const sortByEndTime = (a, b) => a.endTime - b.endTime;

    const isOngoing = contest => contest.startTime < curTime && contest.endTime > curTime;
    const isUpcoming = contest => contest.startTime > curTime && contest.endTime > curTime;

    const ongoingContests = contests.filter(isOngoing).sort(sortByEndTime);
    const upcomingContests = contests.filter(isUpcoming).sort(sortByStartTime);

    cache.put('results', {
      timestamp: curTime,
      ongoing: ongoingContests,
      upcoming: upcomingContests,
    });
  });

module.exports = runner;
