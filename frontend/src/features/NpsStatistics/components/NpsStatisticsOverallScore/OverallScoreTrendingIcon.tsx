import type { FC } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { IApiNpsStatisticsData } from 'types/api';

const OverallScoreTrendingIcon: FC<{
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

  if (diff > 0) {
    return (
      <TrendingUpIcon
        sx={{ fontSize: 30, color: 'rgb(34, 197, 94)' }}
        aria-label='Trending Up'
      />
    );
  }

  return (
    <TrendingDownIcon
      sx={{ fontSize: 30, color: 'rgb(239, 68, 68)' }}
      aria-label='Trending Down'
    />
  );
};

export default OverallScoreTrendingIcon;
