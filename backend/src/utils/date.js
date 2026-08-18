/**
 * Calculates the duration in seconds between two dates
 * @param {Date|string} startDate - The start date/time
 * @param {Date|string} endDate - The end date/time
 * @param {boolean} [allowNegative=false] - Whether to allow negative durations
 * @returns {number} Duration in seconds (always positive unless allowNegative is true)
 */
const getSecondsBetweenDates = (startDate, endDate, allowNegative = false) => {
    // Convert to Date objects if strings are provided
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    // JavaScript Date subtraction returns milliseconds, so divide by 1000 to get seconds
    const durationSeconds = Math.floor((end - start) / 1000);
    
    return allowNegative ? durationSeconds : Math.max(0, durationSeconds);
};

module.exports = { getSecondsBetweenDates };