const dayIds = require('../constants/days');

const getWeekDayBooleanMap = (data) => {
  if (!data.days) {
    return {
      U: data.U || false,
      M: data.M || false,
      T: data.T || false,
      W: data.W || false,
      R: data.R || false,
      F: data.F || false,
      S: data.S || false,
    };
  }

  let U = false;
  let M = false;
  let T = false;
  let W = false;
  let R = false;
  let F = false;
  let S = false;

  if (data.days.includes(dayIds.sunday_id)) {
    U = true;
  }
  if (data.days.includes(dayIds.monday_id)) {
    M = true;
  }
  if (data.days.includes(dayIds.tuesday_id)) {
    T = true;
  }
  if (data.days.includes(dayIds.wednesday_id)) {
    W = true;
  }
  if (data.days.includes(dayIds.thursday_id)) {
    R = true;
  }
  if (data.days.includes(dayIds.friday_id)) {
    F = true;
  }
  if (data.days.includes(dayIds.saturday_id)) {
    S = true;
  }
  return { 
    U, 
    M, 
    T, 
    W, 
    R, 
    F, 
    S,
  };
}


module.exports = getWeekDayBooleanMap