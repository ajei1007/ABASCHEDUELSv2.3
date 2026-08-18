import type React from 'react';
import { Stack, Grid2 as Grid } from '@mui/material';
import ResponseMetricsHeadline from './ResponseMetricsHeadline';
import ResponseMetricsNumbers from './ResponseMetricsNumbers';
import ResponseMetricsTrendsChart from './ResponseMetricsTrendsChart';
import type { IApiNpsStatisticsData } from 'types/api';

interface INpsStatisticsResponseMetricsProps {
  totalResponses: number;
  responseRate: number;
  responseTrends: IApiNpsStatisticsData['npsResponseTrends'];
  goToResponsesLinkElement?: React.ReactNode;
}

const NpsStatisticsResponseMetrics: React.FC<
  INpsStatisticsResponseMetricsProps
> = ({
  totalResponses,
  responseRate,
  responseTrends,
  goToResponsesLinkElement,
}) => {
  return (
    <Stack
      justifyContent='center'
      sx={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        px: '1rem',
        py: '1.25rem',
      }}
      role='region'
      aria-label='NPS Statistics Response Metrics'
    >
      <ResponseMetricsHeadline
        goToResponsesLinkElement={goToResponsesLinkElement}
      />
      <Grid mt={1.5} container spacing={4} px={2}>
        <Grid size={{ sm: 12, md: 12, lg: 6 }}>
          <ResponseMetricsNumbers
            totalResponses={totalResponses}
            responseRate={responseRate}
          />
        </Grid>
        <Grid size={{ sm: 12, md: 12, lg: 6 }}>
          <ResponseMetricsTrendsChart responseTrends={responseTrends} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default NpsStatisticsResponseMetrics;
