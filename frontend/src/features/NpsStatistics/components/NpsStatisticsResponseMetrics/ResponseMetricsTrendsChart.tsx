import { Typography } from '@mui/material';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import { formatQuarter } from 'utils/quarterGenerator';
import type { IApiNpsStatisticsData } from 'types/api';

const ResponseMetricsTrendsChart = ({
  responseTrends,
}: {
  responseTrends: IApiNpsStatisticsData['npsResponseTrends'];
}) => {
  const trends = responseTrends
    .map((trend) => ({
      quarter: formatQuarter(trend.quarter),
      responses: trend.totalResponses,
    }))
    .reverse(); // Reverse to show the most recent quarter on the right

  if (!trends.length) {
    return (
      <Typography fontSize='0.875rem!important' fontWeight='600' mb={2}>
        No response trends available
      </Typography>
    );
  }

  return (
    <div>
      <Typography fontSize='0.875rem!important' fontWeight='600' mb={2}>
        Quarterly Response Trend
      </Typography>
      <ResponsiveContainer width='100%' height={120}>
        <LineChart data={trends}>
          <XAxis dataKey='quarter' />
          <YAxis />
          <Tooltip />
          <Line
            type='monotone'
            name='Responses'
            dataKey='responses'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseMetricsTrendsChart;
