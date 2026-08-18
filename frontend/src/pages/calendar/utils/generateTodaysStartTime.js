import moment from 'moment';

const generateTodaysStartTime = (date) => {
  const time = moment(date).toDate();
  time.setHours(8);
  time.setMinutes(0);
  time.setSeconds(0);
  time.setMilliseconds(0);
  return time;
};

export default generateTodaysStartTime;