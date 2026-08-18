import { useMemo, type FC } from 'react';
import { Stack, Typography, Grid2 as Grid } from '@mui/material';
import { getResponseRateState } from '../../utils';
import { RESPONSE_STATE_STYLES } from '../../constants';

/**
 * Displays NPS response metrics: total responses and response rate.
 */
interface ResponseMetricsNumbersProps {
  totalResponses: number;
  responseRate: number;
}

const ResponseMetricsNumbers: FC<ResponseMetricsNumbersProps> = ({
  totalResponses,
  responseRate,
}) => {
  const responseState = useMemo(
    () => getResponseRateState(responseRate),
    [responseRate],
  );

  const styles = RESPONSE_STATE_STYLES[responseState];

  return (
    <Grid container spacing={2}>
      <Grid size={{ sm: 12, md: 6 }}>
        <Stack
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          px='0.5rem'
          py='1.5rem'
          rowGap='0.25rem'
          sx={{
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid rgb(150, 194, 255)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography
            fontSize='1.5rem!important'
            lineHeight='1.2'
            fontWeight='600'
            sx={{
              color: '#2563eb',
            }}
          >
            {totalResponses}
          </Typography>
          <Typography
            fontSize='0.875rem!important'
            lineHeight='1.2'
            sx={{
              color: '#64748b',
            }}
          >
            Total Responses
          </Typography>
        </Stack>
      </Grid>
      <Grid size={{ sm: 12, md: 6 }}>
        <Stack
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          px='0.5rem'
          py='1.5rem'
          rowGap='0.25rem'
          sx={{
            background: styles.background,
            border: styles.border,
            borderRadius: '8px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography
            fontSize='1.5rem!important'
            lineHeight='1.2'
            fontWeight='600'
            sx={{
              color: styles.color,
            }}
          >
            {responseRate}%
          </Typography>
          <Typography
            fontSize='0.875rem!important'
            lineHeight='1.2'
            sx={{
              color: '#64748b',
            }}
          >
            Response Rate
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ResponseMetricsNumbers;
