import { useMemo } from 'react';
import { Stack, Box } from '@mui/material';
import ResponseDistributionHeadline from './ResponseDistributionHeadline';
import ResponseDistributionBarSegment from './ResponseDistributionBarSegment';
import ResponseDistributionLegendItem from './ResponseDistributionLegendItem';
import { RATING_DISTRIBUTION_SEGMENTS } from '../../constants';
import type { NpsBreakdownSegment } from './types';
import type { IApiNpsStatisticsData } from 'types/api';

type NpsStatisticsResponseDistributionProps = {
  ratingDistribution: IApiNpsStatisticsData['npsRatingDistribution'];
};

const NpsStatisticsResponseDistribution = ({
  ratingDistribution,
}: NpsStatisticsResponseDistributionProps) => {
  const total = useMemo(
    () =>
      Object.values(ratingDistribution ?? {}).reduce(
        (sum, value) => sum + (value?.count ?? 0),
        0,
      ),
    [ratingDistribution],
  );

  const npsBreakdown = useMemo<NpsBreakdownSegment[]>(
    () =>
      Object.entries(RATING_DISTRIBUTION_SEGMENTS).map(
        ([key, { label, color }]) => {
          const count =
            ratingDistribution?.[key as keyof typeof ratingDistribution]
              ?.count ?? 0;
          const percentage =
            total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
          return {
            category: label,
            count,
            percentage,
            color,
          };
        },
      ),
    [ratingDistribution, total],
  );

  return (
    <Stack
      height='100%'
      rowGap={2}
      flexDirection='column'
      sx={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        px: '1rem',
        py: '1.25rem',
      }}
      aria-label='NPS Response Distribution'
      role='region'
    >
      <ResponseDistributionHeadline />
      <Box
        width='100%'
        display='flex'
        flexDirection='column'
        flexGrow={1}
        justifyContent='center'
        gap={6}
        pr='0.5rem'
        pl='0.25rem'
        maxHeight='16rem'
      >
        <Box
          height={32}
          width='100%'
          bgcolor='#e5e7eb'
          borderRadius='999px'
          overflow='hidden'
          display='flex'
          aria-label='NPS Bar Chart'
          role='img'
        >
          {npsBreakdown.map((segment, index) => (
            <ResponseDistributionBarSegment
              segment={segment}
              index={index}
              key={segment.category}
            />
          ))}
        </Box>
        {/* Legend */}
        <Box
          display='grid'
          gridTemplateColumns='repeat(3, 1fr)'
          gap={2}
          fontSize='0.95rem'
          aria-label='NPS Legend'
        >
          {npsBreakdown.map((segment) => (
            <ResponseDistributionLegendItem
              segment={segment}
              key={segment.category}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

export default NpsStatisticsResponseDistribution;
