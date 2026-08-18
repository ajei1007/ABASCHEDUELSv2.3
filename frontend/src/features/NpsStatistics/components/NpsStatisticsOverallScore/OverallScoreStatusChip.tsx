import type { FC } from 'react';
import { Box } from '@mui/material';
import { getScoreSectionData } from '../../utils';
import type { IApiNpsStatisticsData } from 'types/api';

const OverallScoreStatusChip: FC<{
  npsScore: IApiNpsStatisticsData['npsScore'][number] | null;
}> = ({ npsScore }) => {
  if (!npsScore) {
    return null;
  }

  const section = getScoreSectionData(npsScore.score);

  return (
    <Box textAlign='center'>
      <Box
        display='inline-flex'
        alignItems='center'
        borderRadius='999px'
        border={`1px solid ${section.color}`}
        fontWeight='600'
        fontSize='1rem'
        px={1.5}
        py={0.75}
        sx={{
          cursor: 'default',
          backgroundColor: section.color,
          color: 'white',
        }}
        aria-label={`NPS Status: ${section.name}`}
      >
        {section.name}
      </Box>
    </Box>
  );
};

export default OverallScoreStatusChip;
