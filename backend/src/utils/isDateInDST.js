function isDateInDST(date) {
  // Extract the year from the given date
  const year = date.getFullYear();

  // Get the actual DST start and end dates for the given year
  const dstStart = getSecondSundayOfMarch(year);
  const dstEnd = getFirstSundayOfNovember(year);

  // Check if the given date falls within the DST period
  return date >= dstStart && date < dstEnd;
}

// Function to find the second Sunday of March
function getSecondSundayOfMarch(year) {
  const marchFirst = new Date(year, 2, 1); // March 1st
  const dayOfWeek = marchFirst.getDay(); // Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const secondSunday = 8 + (7 - dayOfWeek) % 7; // Second Sunday formula
  return new Date(year, 2, secondSunday, 2); // 2 AM local time
}

// Function to find the first Sunday of November
function getFirstSundayOfNovember(year) {
  const novemberFirst = new Date(year, 10, 1); // November 1st
  const dayOfWeek = novemberFirst.getDay(); // Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const firstSunday = 1 + (7 - dayOfWeek) % 7; // First Sunday formula
  return new Date(year, 10, firstSunday, 2); // 2 AM local time
}

module.exports = isDateInDST;
