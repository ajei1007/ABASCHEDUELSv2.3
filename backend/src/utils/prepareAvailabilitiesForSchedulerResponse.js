const { v4: uuidv4 } = require('uuid');
const formatAvailabilityForScheduler = require('./formatAvailabilityForScheduler');
const timezoneUsesDLS = require('./timezoneUsesDLS');
const moment = require('moment');

const mergeIntervals = (intervals) => {
  // test if there are at least 2 intervals
  //if(!intervals) return [[]]
  if (intervals.length <= 1) return intervals;

  var stack = [];
  var top = null;

  // sort the intervals based on their start values
  intervals.sort((a, b) => moment(a[0]) - moment(b[0]));

  // push the 1st interval into the stack
  stack.push(intervals[0]);

  // start from the next interval and merge if needed
  for (var i = 1; i < intervals.length; i++) {
    // get the top element
    top = stack[stack.length - 1];

    // if the current interval doesn't overlap with the
    // stack top element, push it to the stack
    if (top[1] < intervals[i][0]) {
      stack.push(intervals[i]);
    }
    // otherwise update the end value of the top element
    // if end of current interval is higher
    else if (top[1] < intervals[i][1]) {
      top[1] = intervals[i][1];
      top[2] = intervals[i][2];
      stack.pop();
      stack.push(top);
    }
  }

  return stack;
};

const prepareAvailabilitiesForSchedulerResponse = ({
  resources,
  availabilities,
  type,
  timezone,
  startCalendar,
  endCalendar,
}) => {
  const currentTimezoneUsesDLS = timezoneUsesDLS(timezone);

  const resourcesMap = resources.reduce((acc, resource) => {
    acc[resource] = { av: [], unav: [] };
    return acc;
  }, {});

  availabilities.rows.reduce((acc, row) => {
    const availability = row?.dataValues;
    if (availability?.[type]) {
      acc = formatAvailabilityForScheduler({
        resourceAvailabilities: acc,
        availability,
        currentTimezoneUsesDLS,
        startCalendar,
        endCalendar,
        type,
        timezone
      });
    }
    return acc;
  }, resourcesMap);

  const result = [];
  Object.entries(resourcesMap).map((e) => {
    let [id, value] = e;
    value.av.map((e) => {
      const [start, end] = e;
      result.push({
        resourceIds: [id],
        id: uuidv4(),
        start: start,
        color: e[2],
        location: e[3],
        end: end,
        av: true,
        av_id: e[4],
        status: e[5],
        onCall: e[6],
        branchId: e[7],
        startRange: e[8],
        endRange: e[9],
        branch: e[10],
      });
    });
  });

  Object.entries(resourcesMap).map((e) => {
    let [id, value] = e;
    mergeIntervals(value.unav).map((e) => {
      const [start, end] = e;
      result.push({
        resourceIds: [id],
        id: uuidv4(),
        start: start,
        end: end,
        av: false,
        av_id: e[4],
        status: e[5],
        onCall: e[6],
        branchId: e[7],
        startRange: e[8],
        endRange: e[9],
        branch: e[10],
      });
    });
  });

  return result;
};

module.exports = prepareAvailabilitiesForSchedulerResponse;
