function subtractDateDifference(date1, date2) {
  if (!date1 || !date2) {
    return 0;
  }
  // Parse the dates into JavaScript Date objects
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  // Calculate the difference in milliseconds
  const difference = firstDate - secondDate;

  // Convert milliseconds to days (1000 ms/sec, 60 sec/min, 60 min/hr, 24 hr/day)
  const days = difference / (1000 * 60 * 60 * 24);

  // Return the number of days, can be negative if date2 is earlier than date1
  return days;
}

module.exports = subtractDateDifference;
