// Button styles for the table actions
export const BUTTON_STYLES = {
  common: {
    height: '30px',
    whiteSpace: 'nowrap',
  },
  request: {
    backgroundColor: '#1976d2!important',
    '&:hover': {
      backgroundColor: '#115293!important',
    },
    '&:active': {
      backgroundColor: '#0d3a6b!important',
    },
  },
  success: {
    backgroundColor: '#4caf50!important',
    '&:hover': {
      backgroundColor: '#388e3c!important',
    },
    '&:active': {
      backgroundColor: '#2e7d32!important',
    },
  },
  warning: {
    backgroundColor: '#ff9800!important',
    '&:hover': {
      backgroundColor: '#f57c00!important',
    },
    '&:active': {
      backgroundColor: '#ef6c00!important',
    },
  },
} as const;

// Date format configuration
export const DATE_FORMAT = 'MM/DD/YYYY HH:mm:ss';
