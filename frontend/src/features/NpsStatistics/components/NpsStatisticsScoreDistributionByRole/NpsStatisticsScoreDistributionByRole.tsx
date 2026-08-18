import { useMemo } from 'react';
import { Stack, Box } from '@mui/material';
import ScoreDistributionByRoleHeadline from './ScoreDistributionByRoleHeadline';
import ScoreDistributionByRoleBarChart from './ScoreDistributionByRoleBarChart';
import ScoreDistributionByRoleNumbersItem from './ScoreDistributionByRoleNumbersItem';
import type { IApiNpsStatisticsData } from 'types/api';

const NpsStatisticsScoreDistributionByRole = ({
  distributionByRole,
}: {
  distributionByRole: IApiNpsStatisticsData['npsDistributionByRole'];
}) => {
  const npsByRole = useMemo(
    () =>
      Object.entries(distributionByRole).map(([role, data]) => ({
        ...data,
        role,
        npsScore: Number.isInteger(data.npsScore)
          ? data.npsScore
          : parseFloat(data.npsScore.toFixed(1)),
      })),
    [distributionByRole],
  );
  return (
    <Stack
      height='100%'
      rowGap={2}
      sx={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        px: '1rem',
        py: '1.25rem',
      }}
    >
      <ScoreDistributionByRoleHeadline />

      <Box
        width='100%'
        display='flex'
        flexDirection='column'
        gap={2}
        pr='0.5rem'
        pl='0.25rem'
      >
        {npsByRole.length === 0 ? (
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            minHeight='180px'
            width='100%'
            sx={{ color: 'text.secondary', opacity: 0.8 }}
          >
            <Box fontSize={48} mb={1}>
              📊
            </Box>
            <Box fontSize={18} fontWeight={500} mb={0.5}>
              No NPS data by role available
            </Box>
            <Box fontSize={14}>Data will appear here once available.</Box>
          </Box>
        ) : (
          <>
            <ScoreDistributionByRoleBarChart npsByRole={npsByRole} />
            <Box
              display='grid'
              gridTemplateColumns='repeat(2, 1fr)'
              rowGap={1}
              columnGap={5}
              mt={4}
              fontSize='0.875rem'
            >
              {npsByRole.map((item) => (
                <ScoreDistributionByRoleNumbersItem
                  key={item.role}
                  item={item}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

export default NpsStatisticsScoreDistributionByRole;
