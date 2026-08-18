/**
 * Extracts minutes from a time string in format "10:00am" or "2:30pm"
 * @param timeString - Time string like "10:00am", "2:30pm", etc.
 * @returns The minutes as a number (0-59)
 */
export function extractMinutes(timeString: string): number {
    const match = timeString.match(/:(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Converts time string to total minutes since midnight
 * @param time - Time string in format "10:30am", "2:15pm", etc.
 * @returns Total minutes since midnight (0-1439)
 */
export function timeToTotalMinutes(time: string): number {
    const timeMatch = time.match(/(\d{1,2}):(\d{2})(am|pm)/i);
    if (!timeMatch) {
        throw new Error(`Invalid time format: ${time}`);
    }

    let hour = parseInt(timeMatch[1]);
    let minute = parseInt(timeMatch[2]);
    let period = timeMatch[3].toLowerCase();

    // Convert to 24-hour format first, then calculate total minutes
    if (period === "pm" && hour !== 12) {
        hour += 12;
    } else if (period === "am" && hour === 12) {
        hour = 0;
    }

    let totalMinutes = hour * 60 + minute;
    return totalMinutes;
}

/**
 * Converts total minutes back to time string format
 * @param totalMinutes - Total minutes since midnight (0-1439)
 * @returns Time string in format "10:30am", "2:15pm", etc.
 */
export function totalMinutesToTime(totalMinutes: number): string {
    let hour = Math.floor(totalMinutes / 60);
    let minute = totalMinutes % 60;
    let period = hour >= 12 ? "pm" : "am";

    hour = hour % 12 || 12; // Convert back to 12-hour format, ensuring 0 becomes 12

    return `${hour}:${minute.toString().padStart(2, "0")}${period}`;
}

/**
 * Rounds time to nearest 30-minute interval and returns the time string
 * @param time - Time string in format "10:30am", "2:15pm", etc.
 * @param roundDirection - "nearest" rounds to closest interval, "previous" rounds down
 * @returns Rounded time string
 */
export function roundTimeToInterval(
    time: string,
    roundDirection: "nearest" | "previous" = "nearest"
): string {
    let totalMinutes = timeToTotalMinutes(time);

    if (roundDirection === "previous") {
        totalMinutes -= 1;
    }

    // Round to nearest or previous 30-minute interval
    totalMinutes = Math.floor(totalMinutes / 30) * 30;

    return totalMinutesToTime(totalMinutes);
}

export function formatTime(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return time.toLowerCase();
  const [, hour, minutes, period] = match;
  if (minutes === '00') {
    return `${hour}${period}`.toLowerCase();
  }
  return time.toLowerCase();
}
