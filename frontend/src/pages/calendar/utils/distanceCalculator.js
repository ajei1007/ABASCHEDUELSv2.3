function calculateTime(seconds, minutes) {
  // Convert seconds to minutes and calculate the exact fraction of the given minutes
  let exactFraction = seconds / 60 / minutes;

  // Calculate the lower bound integer multiple of the exact fraction
  let lowerBoundMultiple = Math.floor(exactFraction);

  // Calculate the threshold to decide whether to round up or not
  let threshold = lowerBoundMultiple + 0.4; // 40% above the lower multiple

  // Decide whether to round up or stay, ensuring result is never 0
  let resultMultiple =
    exactFraction > threshold ? lowerBoundMultiple + 1 : lowerBoundMultiple;
  resultMultiple = Math.max(1, resultMultiple); // Ensure result is never 0

  // Calculate and return the final result in minutes
  return resultMultiple * minutes;
}

export default calculateTime;
