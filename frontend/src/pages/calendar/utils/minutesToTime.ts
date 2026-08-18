export function minutesToTime(minutes: number): string {
  // Clamp the value to maximum 1439 minutes (23:59)
  const clampedMinutes = Math.min(Math.max(0, Math.floor(minutes)), 1439);

  const hours = Math.floor(clampedMinutes / 60);
  const mins = clampedMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
