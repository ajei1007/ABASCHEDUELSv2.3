import moment from 'moment-timezone';

/**
 * Validates if a time window value is valid
 * @param {string} value - The time window value to validate
 * @returns {boolean} - Returns true if valid, false otherwise
 */
export const validateTimeWindowValue = (value: string) => {
  if (typeof value !== 'string') {
    return false;
  }

  // Check if it's the special 'today' case
  if (value === 'today') {
    return true;
  }

  // Check if it matches the pattern: number_unit (e.g., "30_m", "2_h")
  const timePattern = /^(\d+)_(m|h)$/;
  const match = value.match(timePattern);

  if (!match) {
    return false;
  }

  const [, number, unit] = match;
  const num = parseInt(number, 10);

  // Validate that the number is positive
  return num > 0;
};

/**
 * Parses a time window value to minutes
 * @param {string} value - The time window value to parse
 * @param {string} [timezone] - Optional timezone (e.g., 'America/New_York', 'Europe/London'). If not provided, uses local timezone.
 * @returns {number|null} - Returns parsed minutes as number, or null if parsing fails
 */
export const parseTimeWindowValueToMinutes = (
  value: string,
  timezone: string | null = null,
) => {
  // Use validator first
  if (!validateTimeWindowValue(value)) {
    return null;
  }

  // Handle special case 'today' - return minutes from midnight to now
  if (value === 'today') {
    let now, midnight;

    if (timezone) {
      // Use specified timezone with moment
      now = moment().tz(timezone);
      midnight = moment().tz(timezone).startOf('day');
    } else {
      // Use local timezone with moment
      now = moment();
      midnight = moment().startOf('day');
    }

    const minutesFromMidnight = now.diff(midnight, 'minutes');
    return minutesFromMidnight;
  }

  // Parse the time format (number_unit)
  const timePattern = /^(\d+)_(m|h)$/;
  const match = value.match(timePattern);

  if (!match) {
    return null;
  }

  const [, number, unit] = match;
  const num = parseInt(number, 10);

  // Convert to minutes based on unit
  if (unit === 'm') {
    return num; // already in minutes
  } else if (unit === 'h') {
    return num * 60; // convert hours to minutes
  }

  return null;
};
