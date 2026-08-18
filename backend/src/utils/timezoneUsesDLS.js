const moment2 = require('moment-timezone');

function timezoneUsesDLS(timeZone) {
  const startOfYear = moment2.tz([2024, 0, 1], timeZone); // January 1, 2024
  const endOfYear = moment2.tz([2024, 11, 31], timeZone); // December 31, 2024

  // Get the initial offset at the start of the year
  let initialOffset = startOfYear.utcOffset();

  // Iterate through the year by month and check if the offset changes
  for (let month = 0; month < 12; month++) {
    let date = moment2.tz([2024, month, 1], timeZone);
    if (date.utcOffset() !== initialOffset) {
      return true; // Offset change indicates DST usage
    }
  }

  return false; // No offset change indicates no DST usage
}

module.exports = timezoneUsesDLS;
