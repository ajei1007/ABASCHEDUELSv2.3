const moment = require('moment');

function getQuarterDates(input) {
  const match = input.match(/^(\d{4})_q([1-4])$/i);

  if (!match) {
    throw new Error("Invalid input format. Expected format: 'YYYY_q[1-4]'");
  }

  const year = parseInt(match[1], 10);
  const quarter = parseInt(match[2], 10);

  const startMonth = (quarter - 1) * 3;

  const startDate = moment.utc({ year, month: startMonth, day: 1 });
  const endDate = moment.utc(startDate).endOf('quarter');

  return { 
    startDate: startDate.format('YYYY-MM-DD'), 
    endDate: endDate.format('YYYY-MM-DD') 
  };
}

function getPreviousQuarters(input) {
  const match = input.match(/^(\d{4})_q([1-4])$/i);
  if (!match) {
    throw new Error("Invalid input format. Expected format: 'YYYY_q[1-4]'");
  }

  let year = parseInt(match[1], 10);
  let quarter = parseInt(match[2], 10);

  const result = [];

  for (let i = 1; i <= 3; i++) {
    quarter -= 1;
    if (quarter === 0) {
      quarter = 4;
      year -= 1;
    }
    result.push(`${year}_q${quarter}`);
  }

  return result;
}

function calculateStatisticsByRatings(ratings) {
  if (!Array.isArray(ratings)) {
    console.error("argument of function calculateStatisticsByRatings must be an Array")
    throw Error("invalid ratings provided in calculateStatisticsByRatings") 
  }
  const total = ratings.length;
  if (total == 0) {
    return {
      nps: 0.00,
      mean: 0.00,
      median: 0.00,
      variance: 0.00,
      stdDev: 0.00,
      promoters: { count: 0, percentage: 0.00 },
      passives: { count: 0, percentage: 0.00 },
      detractors: { count: 0, percentage: 0.00},
      total: 0
    };
  }

  const promoters = ratings.filter(r => r >= 8.5).length;
  const passives = ratings.filter(r => r >= 6.5 && r < 8.5).length;
  const detractors = ratings.filter(r => r < 6.5).length;

  const nps = ((promoters - detractors) / total) * 100;

  const mean = ratings.reduce((sum, r) => sum + r, 0) / total;

  const sorted = [...ratings].sort((a, b) => a - b);
  const mid = Math.floor(total / 2);

  const median = total % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
    
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / total;
  const stdDev = Math.sqrt(variance);

  return {
    nps: +nps.toFixed(2),
    mean: +mean.toFixed(2),
    median: +median.toFixed(2),
    variance: +variance.toFixed(2),
    stdDev: +stdDev.toFixed(2),
    promoters: {
      count: promoters,
      percentage: +((promoters / total) * 100).toFixed(2)
    },
    passives: {
      count: passives,
      percentage: +((passives / total) * 100).toFixed(2)
    },
    detractors: {
      count: detractors,
      percentage: +((detractors / total) * 100).toFixed(2)
    },
    total
  };
}


module.exports = {getQuarterDates, getPreviousQuarters, calculateStatisticsByRatings};