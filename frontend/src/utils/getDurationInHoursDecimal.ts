export default function getDurationInHoursDecimal(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Calculate the difference in milliseconds
  const diffMs = end.getTime() - start.getTime();

  // Convert milliseconds to total minutes
  const totalMinutes = diffMs / (1000 * 60);

  // Extract whole hours and remaining minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Convert minutes to fraction of an hour
  const fractionalHours = minutes / 60;

  // Combine whole hours and fractional hours
  return hours + fractionalHours;
}
