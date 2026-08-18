const getWeekDayIdsFromWeekdayNumber = (data) => {
  if (!data || data.length === 0) {
    return [];
  }

  // Mapping numbers to corresponding UUIDs
  const weekDayUUIDs = [
    '20770718-a98e-499f-ae8b-c395f0f743bb', // 0 - Sunday
    '2d0599e7-2729-49ee-acbe-ede6de8ad9b7', // 1 - Monday
    '3260c7e7-c57b-4144-803f-7db9cf88393c', // 2 - Tuesday
    '56cbe76a-0cf6-4647-8a49-2ef9fd102079', // 3 - Wednesday
    '6d92706c-9bb1-447e-bf74-572609066663', // 4 - Thursday
    'ecd70b60-3fef-4d43-9181-2f9db60e19fe', // 5 - Friday
    'fa2adb44-e5ba-4586-ae19-5f1e1767228d', // 6 - Saturday
  ];

  // Result array to hold the UUIDs found in the input
  let result = [];

  // Loop over each number in data.daysOfWeek and add corresponding UUID to result
  data.forEach((day) => {
    if (day >= 0 && day <= 6) {
      // Ensure the day is within the valid range
      result.push(weekDayUUIDs[day]);
    }
  });

  return result;
};

module.exports = getWeekDayIdsFromWeekdayNumber;
