import { useMemo, type FC } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { getResponseRateState } from '../utils';
import { RESPONSE_STATE_STYLES } from '../constants';

interface INpsStatisticsResponseMetricsOutcomeProps {
  totalResponses: number;
  responseRate: number;
}

const NpsStatisticsResponseMetricsOutcome: FC<
  INpsStatisticsResponseMetricsOutcomeProps
> = ({ totalResponses, responseRate }) => {
  const responseState = useMemo(
    () => getResponseRateState(responseRate),
    [responseRate],
  );
  const styles = RESPONSE_STATE_STYLES[responseState];
  const { background, border, color, dot } = styles;

  return (
    <Stack
      sx={{
        backgroundImage: background,
        borderRadius: 2,
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
        border: border,
        px: 2,
        py: 2.5,
      }}
      aria-label='NPS Statistics Response Metrics Outcome'
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='center'
        spacing={1}
        sx={{ color }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            bgcolor: dot,
            borderRadius: '50%',
            animation: 'mui-pulse 1.5s infinite',
            '@keyframes mui-pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
          role='status'
          aria-label={`Response state: ${responseState}`}
        />
        <Typography variant='body1' fontWeight={500}>
          Statistical Confidence: {responseState} ({responseRate}% response rate
          with {totalResponses} responses)
        </Typography>
      </Stack>
    </Stack>
  );
};

export default NpsStatisticsResponseMetricsOutcome;
