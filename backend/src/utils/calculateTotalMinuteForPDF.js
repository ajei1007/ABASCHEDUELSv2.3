const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const calculateTotalMinuteForPDF = (intervals) => {
  // Convert intervals to minutes and sort by start time
  intervals = intervals
    .map(([start, end]) => [timeToMinutes(start), timeToMinutes(end)])
    .sort((a, b) => a[0] - b[0]);

  let merged = [];
  let totalMinutes = 0;

  for (const [start, end] of intervals) {
    if (merged.length > 0 && start <= merged[merged.length - 1][1]) {
      // Merge overlapping intervals
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
    } else {
      merged.push([start, end]);
    }
  }

  // Calculate total minutes from merged intervals
  for (const [start, end] of merged) {
    totalMinutes += end - start;
  }

  return totalMinutes;
}

module.exports = calculateTotalMinuteForPDF;
