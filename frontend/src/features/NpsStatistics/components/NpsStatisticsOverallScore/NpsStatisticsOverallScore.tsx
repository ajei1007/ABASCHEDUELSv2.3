import React, { useMemo } from 'react';
import { Stack, Box, Typography, Paper } from '@mui/material';
import OverallScoreTargetIcon from './OverallScoreTargetIcon';
import OverallScoreGuageChart from './OverallScoreGuageChart';
import OverallScoreChangeChip from './OverallScoreChangeChip';
import OverallScoreTrendingIcon from './OverallScoreTrendingIcon';
import OverallScoreHeading from './OverallScoreHeading';
import OverallScoreStatusChip from './OverallScoreStatusChip';
import type { IApiNpsStatisticsData } from 'types/api';

export interface INpsStatisticsOverallScoreProps {
  npsScores: IApiNpsStatisticsData['npsScore'];
  totalResponses: number;
}

const NpsStatisticsOverallScore: React.FC<INpsStatisticsOverallScoreProps> = ({
  npsScores,
  totalResponses,
}) => {
  // Memoize to avoid unnecessary recalculations
  const currentQuarterNpsScore = useMemo(
    () => npsScores?.[0] || null,
    [npsScores],
  );
  const previousQuarterNpsScore = useMemo(
    () => npsScores?.[1] || null,
    [npsScores],
  );

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        border: '2px solid #60a5fa',
        boxShadow: 3,
        background: 'linear-gradient(to right, #f3f8ff, #e7edff)',
      }}
    >
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        p='1.5rem'
        pb='1rem'
        textAlign='center'
      >
        <Stack
          direction='row'
          spacing={2}
          justifyContent='center'
          alignItems='center'
        >
          <span
            style={{
              width: '40px',
              height: '40px',
              color: '#2563eb',
              marginBottom: '0.25rem',
            }}
            aria-label='NPS Target Icon'
          >
            <OverallScoreTargetIcon />
          </span>
          <Typography
            fontWeight='600'
            fontSize='1.875rem'
            lineHeight='2.25rem'
            variant='h4'
          >
            Overall NPS Score
          </Typography>
        </Stack>
      </Box>
      <Box sx={{ p: '1.5rem', pt: 0, pb: '2rem', textAlign: 'center' }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='center'
          spacing={5}
          mb={2}
        >
          <OverallScoreHeading npsScore={currentQuarterNpsScore} />
          {currentQuarterNpsScore && previousQuarterNpsScore && (
            <Stack direction='column' alignItems='center'>
              <OverallScoreTrendingIcon
                currentQuarterNpsScore={currentQuarterNpsScore}
                previousQuarterNpsScore={previousQuarterNpsScore}
              />
              <OverallScoreChangeChip
                currentQuarterNpsScore={currentQuarterNpsScore}
                previousQuarterNpsScore={previousQuarterNpsScore}
              />
            </Stack>
          )}
        </Stack>
        <div>
          <OverallScoreGuageChart npsScore={currentQuarterNpsScore} />
        </div>
        <OverallScoreStatusChip npsScore={currentQuarterNpsScore} />
        {totalResponses > 0 && (
          <Typography
            mt='1.5rem'
            fontSize='1rem!important'
            lineHeight='1.75'
            sx={{ color: '#64748b' }}
            aria-label='NPS Total Responses'
          >
            Based on {totalResponses} responses
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default NpsStatisticsOverallScore;
