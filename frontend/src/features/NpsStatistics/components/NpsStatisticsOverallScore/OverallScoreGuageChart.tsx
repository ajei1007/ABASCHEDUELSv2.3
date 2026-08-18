import type { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getScoreSectionName } from '../../utils';
import { SCORE_SECTIONS } from '../../constants';
import type { IApiNpsStatisticsData } from 'types/api';

const OverallScoreGuageChart: FC<{
  npsScore: IApiNpsStatisticsData['npsScore'][number] | null;
}> = ({ npsScore }) => {
  const currentSection = npsScore ? getScoreSectionName(npsScore.score) : '';
  return (
    <ResponsiveContainer width='100%' height={220}>
      <PieChart aria-label='NPS Gauge Chart'>
        <Pie
          data={SCORE_SECTIONS}
          cx='50%'
          cy='70%'
          startAngle={180}
          endAngle={0}
          innerRadius={80}
          outerRadius={135}
          dataKey='value'
        >
          {SCORE_SECTIONS.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              opacity={entry.name === currentSection ? 1 : 0.4}
              stroke={entry.name === currentSection ? '#1f2937' : 'none'}
              strokeWidth={entry.name === currentSection ? 2 : 0}
              aria-label={entry.name}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const section = payload[0].payload;
              return (
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #ccc',
                    padding: 8,
                    borderRadius: 6,
                  }}
                  role='tooltip'
                >
                  <strong>{section.name}</strong>
                  <div>
                    NPS Range: {section.range[0]} to {section.range[1]}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default OverallScoreGuageChart;
