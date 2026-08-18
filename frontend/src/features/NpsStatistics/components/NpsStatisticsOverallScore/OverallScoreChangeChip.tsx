import type { FC } from 'react';
import { Box } from '@mui/material';
import { formatQuarter } from 'utils/quarterGenerator';
import type { IApiNpsStatisticsData } from 'types/api';

const OverallScoreChangeChip: FC<{
  currentQuarterNpsScore: IApiNpsStatisticsData['npsScore'][number] | null;
  previousQuarterNpsScore: IApiNpsStatisticsData['npsScore'][number] | null;
}> = ({ currentQuarterNpsScore, previousQuarterNpsScore }) => {
  if (!currentQuarterNpsScore || !previousQuarterNpsScore) {
    return null;
  }

  const diff = currentQuarterNpsScore.score - previousQuarterNpsScore.score;
  if (diff === 0) {
    return null;
  }

  const sign = diff > 0 ? '+' : '-';
  return (
    <Box
      mt={2}
      px={2}
      py={0.5}
      borderRadius={999}
      fontWeight='500'
      fontSize='0.875rem'
      display='inline-flex'
      alignItems='center'
      sx={{
        border: '1px solid transparent',
        boxShadow: 1,
        backgroundColor: 'rgb(15, 23, 42)',
        color: 'white',
        cursor: 'default',
      }}
      aria-label='NPS Score Change'
    >
      {sign}
      {Number.isInteger(Math.abs(diff))
        ? Math.abs(diff)
        : Math.abs(diff).toFixed(1)}{' '}
      vs {formatQuarter(previousQuarterNpsScore.quarter)}
    </Box>
  );
};

export default OverallScoreChangeChip;
