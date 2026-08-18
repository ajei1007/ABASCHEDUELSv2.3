import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import type { IApiNpsStatisticsData } from 'types/api';

interface ScoreDistributionByRoleBarChartProps {
  npsByRole: (IApiNpsStatisticsData['npsDistributionByRole'][string] & {
    role: string;
  })[];
}

const getBarColor = (score: number) => {
  if (score >= 50) return '#22c55e';
  if (score >= 0) return '#3b82f6';
  return '#ef4444';
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const ScoreDistributionByRoleBarChart: React.FC<
  ScoreDistributionByRoleBarChartProps
> = ({ npsByRole }) => {
  // Memoize capitalized roles for XAxis
  const data = useMemo(
    () =>
      npsByRole.map((item) => ({
        ...item,
        roleLabel: capitalize(item.role),
        barColor: getBarColor(item.npsScore),
      })),
    [npsByRole],
  );

  return (
    <ResponsiveContainer width='100%' height={200}>
      <BarChart
        data={data}
        aria-label='NPS Score Distribution by Role'
        role='img'
      >
        <XAxis
          style={{ fontSize: '0.8rem' }}
          dataKey='roleLabel'
          tickLine={false}
          axisLine={false}
        />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [value, 'NPS Score']}
          labelFormatter={(label: string) => `Role: ${label}`}
        />
        <Bar name='NPS' dataKey='npsScore' radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.role}`} fill={entry.barColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ScoreDistributionByRoleBarChart;
