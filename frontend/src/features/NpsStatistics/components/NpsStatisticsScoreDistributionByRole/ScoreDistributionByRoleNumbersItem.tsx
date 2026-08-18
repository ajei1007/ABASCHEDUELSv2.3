import { Box, Typography } from '@mui/material';
import type { IApiNpsStatisticsData } from 'types/api';

// Define a named type for props for better reusability
export type ScoreDistributionByRoleNumbersItemProps = {
  item: IApiNpsStatisticsData['npsDistributionByRole'][string] & {
    role: string;
  };
};

const ScoreDistributionByRoleNumbersItem = ({
  item,
}: ScoreDistributionByRoleNumbersItemProps) => {
  const sign = item.npsScore > 0 ? '+' : item.npsScore < 0 ? '-' : '';
  const score = Number.isInteger(Math.abs(item.npsScore))
    ? Math.abs(item.npsScore)
    : Math.abs(item.npsScore).toFixed(1);

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      aria-label={`NPS score for ${item.role}`}
    >
      <Typography
        component='span'
        sx={{
          fontSize: '0.875rem',
          textTransform: 'capitalize',
        }}
      >
        {item.role}:
      </Typography>
      <Typography component='span' fontWeight={500} fontSize='0.875rem'>
        {sign}
        {score} ({item.totalResponses} responses)
      </Typography>
    </Box>
  );
};

export default ScoreDistributionByRoleNumbersItem;
