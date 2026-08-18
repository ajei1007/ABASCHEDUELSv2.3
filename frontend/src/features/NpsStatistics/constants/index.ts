// Define styles for each state
export const RESPONSE_STATE_STYLES = {
  'Very Low': {
    background: 'linear-gradient(to right, #fff6f6, #ffeaea)',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    dot: '#ef4444',
  },
  Low: {
    background: 'linear-gradient(to right, #fffde7, #fff9c4)',
    border: '1px solid #fde68a',
    color: '#b45309',
    dot: '#f59e42',
  },
  Moderate: {
    background: 'linear-gradient(to right, #f7fefb, #e0fbe6)',
    border: '1px solid #bbf7d0',
    color: '#059669',
    dot: '#34d399',
  },
  High: {
    background: 'linear-gradient(to right, #f6fefa, #d1fae5)',
    border: '1px solid #6ee7b7',
    color: '#047857',
    dot: '#22c55e',
  },
  Excellent: {
    background: 'linear-gradient(to right, #f6fefd, #ccfbf1)',
    border: '1px solid #5eead4',
    color: '#0e7490',
    dot: '#06b6d4',
  },
};

export const SCORE_SECTIONS = [
  {
    name: 'Very Poor',
    value: 50,
    color: '#dc2626',
    range: [-100, -50],
  },
  {
    name: 'Poor',
    value: 50,
    color: '#ea580c',
    range: [-50, 0],
  },
  {
    name: 'Fair',
    value: 30,
    color: '#ca8a04',
    range: [0, 30],
  },
  {
    name: 'Good',
    value: 40,
    color: '#16a34a',
    range: [30, 70],
  },
  {
    name: 'Excellent',
    value: 30,
    color: '#059669',
    range: [70, 100],
  },
];

export const RATING_DISTRIBUTION_SEGMENTS = {
  promoters: {
    label: 'Promoters',
    color: '#22c55e',
  },
  passives: {
    label: 'Passives',
    color: '#94a3b8',
  },
  detractors: {
    label: 'Detractors',
    color: '#ef4444',
  },
};
