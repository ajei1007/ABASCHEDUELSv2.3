export const MOCK_STATISTICS = {
  // total number of responses for this quarter
  npsTotalResponses: 247,

  // 0%-100% percentage of responses compared to total number of active users
  npsResponseRate: 62,

  // return array with 2 items
  //  - first item - score for requested quarter
  //  - second item - score for previous quarter
  npsScore: [
    {
      quarter: '2025_q2',
      score: 32,
    },
    {
      quarter: '2025_q1',
      score: 28,
    },
  ],

  npsRatingStatistics: {
    mean: 7.2,
    median: 7,
    deviation: 2.1,
  },

  npsRatingDistribution: {
    detractors: {
      count: 58, // 0-6 ratings
      percentage: 23, // 58/247 ≈ 23%
    },
    passives: {
      count: 110, // 7-8 ratings
      percentage: 45, // 110/247 ≈ 45%
    },
    promoters: {
      count: 79, // 9-10 ratings
      percentage: 32, // 79/247 ≈ 32%
    },
  },

  npsDistributionByRole: {
    clinician: {
      npsScore: 7.8, // average score for this role
      totalResponses: 142,
    },
    technician: {
      npsScore: 6.4, // average score for this role
      totalResponses: 67,
    },
    administrator: {
      npsScore: 7.1, // average score for this role
      totalResponses: 28,
    },
    manager: {
      npsScore: 8.2, // average score for this role
      totalResponses: 10,
    },
  },

  // array of objects with nps response trends for the last 4 quarters
  npsResponseTrends: [
    {
      quarter: '2025_q2',
      totalResponses: 247,
    },
    {
      quarter: '2025_q1',
      totalResponses: 198,
    },
    {
      quarter: '2024_q4',
      totalResponses: 156,
    },
    {
      quarter: '2024_q3',
      totalResponses: 134,
    },
  ],
};
