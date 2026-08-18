import {
  allGradients,
  greenGradientColors,
  orangeGradientColors,
  yellowGradientColors,
} from '../constants';

export const applyGradient = (sortedData, selectedSolutionSortOption) => {
  let backgroundColors = {};
  let a = '';
  let b = '';
  let rank = 0;
  let percentile = 0;
  sortedData.forEach((t, index) => {
    if (index === 0) {
      a = t;
    } else {
      b = t;
    }
    if (index !== 0) {
      rank = sortingSolution(selectedSolutionSortOption.value, a, b, true);
    }
    a = t;
    if (rank !== 0) {
      percentile = (index / sortedData.length) * 100;
    }
    let color = 'white';
    let color_arr = greenGradientColors;
    if (t.backgroundColor_real === 'orange') {
      color_arr = orangeGradientColors;
    } else if (t.backgroundColor_real === 'yellow') {
      color_arr = yellowGradientColors;
    }
    if (percentile >= 0 && percentile < 20) {
      color = color_arr[0];
    } else if (percentile >= 20 && percentile < 40) {
      color = color_arr[1];
    } else if (percentile >= 40 && percentile < 60) {
      color = color_arr[2];
    } else if (percentile >= 60 && percentile < 80) {
      color = color_arr[3];
    } else {
      color = color_arr[4];
    }
    backgroundColors = { ...backgroundColors, [t.id]: color };
  });
  return backgroundColors;
};

export const sortingSolution = (type, a, b, full = false) => {
  let t = 0;
  // t = b.priority - a.priority;
  if (type === 'start-time-earliest') {
    t = new Date(a.start).getTime() - new Date(b.start).getTime();
  } else if (type === 'start-time-latest') {
    t = new Date(b.start).getTime() - new Date(a.start).getTime();
  } else if (type === 'end-time-earliest') {
    t = new Date(a.end).getTime() - new Date(b.end).getTime();
  } else if (type === 'end-time-latest') {
    t = new Date(b.end).getTime() - new Date(a.end).getTime();
  } else if (type === 'duration-longest') {
    t =
      new Date(b.end).getTime() -
      new Date(b.start).getTime() -
      (new Date(a.end).getTime() - new Date(a.start).getTime());
  } else if (type === 'duration-shortest') {
    t =
      new Date(a.end).getTime() -
      new Date(a.start).getTime() -
      (new Date(b.end).getTime() - new Date(b.start).getTime());
  }
  if (full || t !== 0) {
    return t;
  } else {
    return (
      allGradients.findIndex((p) => p === a.backgroundColor) -
      allGradients.findIndex((p) => p === b.backgroundColor)
    );
  }
};

// Custom sorting functions for each option
export const sortFunctions = {
  'start-time-earliest': (a, b) => sortingSolution('start-time-earliest', a, b),
  'start-time-latest': (a, b) => sortingSolution('start-time-latest', a, b),
  'end-time-earliest': (a, b) => sortingSolution('end-time-earliest', a, b),
  'end-time-latest': (a, b) => sortingSolution('end-time-latest', a, b),
  'duration-longest': (a, b) => sortingSolution('duration-longest', a, b),
  'duration-shortest': (a, b) => sortingSolution('duration-shortest', a, b),
};
