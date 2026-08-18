import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import type { IApiNpsStatisticsData } from 'types/api';

const OverallScoreHeading: React.FC<{
  npsScore: IApiNpsStatisticsData['npsScore'][number] | null;
}> = ({ npsScore }) => {
  const label = useMemo(() => {
    if (!npsScore) return 'N/A';
    const sign = npsScore.score > 0 ? '+' : npsScore.score < 0 ? '-' : '';
    const score = Number.isInteger(Math.abs(npsScore.score))
      ? Math.abs(npsScore.score)
      : Math.abs(npsScore.score).toFixed(1);
    return `${sign}${score}`;
  }, [npsScore]);

  return (
    <Typography
      variant='h1'
      fontWeight='600'
      sx={{
        color: label.startsWith('-') ? 'rgb(239, 68, 68)' : 'rgb(37, 99, 235)',
        fontSize: '6rem',
      }}
      aria-label='NPS Score Heading'
    >
      {label}
    </Typography>
  );
};

export default OverallScoreHeading;
