import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OptimizerResultsAnalyzerPassed = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        columnGap: '0.45rem',
        alignItems: 'center',
        paddingTop: '0.15rem',
        paddingX: '0.15rem',
      }}
    >
      <CheckCircleIcon fontSize='small' color='success' />
      <Typography
        fontSize='1rem'
        fontWeight='600'
        color='#2e7d32'
        sx={{
          paddingTop: '1px',
          lineHeight: 1.5,
        }}
      >
        Passed
      </Typography>
    </Box>
  );
};

export default memo(OptimizerResultsAnalyzerPassed);
