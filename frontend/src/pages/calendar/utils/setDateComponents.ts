export function setDateComponents(
  momentObj: any,
  { year, month, day }: any = {},
) {
  // Clone the original moment object to avoid mutations
  const result = momentObj.clone();

  // Store original time components
  const hours = result.hours();
  const minutes = result.minutes();
  const seconds = result.seconds();
  const milliseconds = result.milliseconds();

  // Update date components if provided
  if (year !== undefined) {
    result.year(year);
  }
  if (month !== undefined) {
    result.month(month);
  }
  if (day !== undefined) {
    result.date(day);
  }

  // Restore original time components
  result
    .hours(hours)
    .minutes(minutes)
    .seconds(seconds)
    .milliseconds(milliseconds);

  return result;
}
