import React from 'react';
import { Stack, Box, Typography, Paper, Grid2 as Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import type { IApiNpsStatisticsData } from 'types/api';

// Utility to format float numbers
function formatFloatNumber(value: number, decimalPlaces: number = 1): string {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(decimalPlaces);
}

// Props interface for clarity and reusability
interface NpsStatisticsRatingStatisticsProps {
  ratingStatistics: IApiNpsStatisticsData['npsRatingStatistics'];
}

const cardBorder = '2px solid #bbf7d0';
const mainGreen = 'rgb(22, 163, 74)';

const NpsStatisticsRatingStatistics: React.FC<
  NpsStatisticsRatingStatisticsProps
> = ({ ratingStatistics }) => {
  // Defensive: fallback if ratingStatistics is undefined
  const mean = ratingStatistics?.mean ?? 0;
  const median = ratingStatistics?.median ?? 0;
  const deviation = ratingStatistics?.deviation ?? 0;
  return (
    <Paper
      elevation={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        border: '2px solid #86efac',
        boxShadow: 3,
        background: 'linear-gradient(to right, #f6fef9, #e7fbee)',
      }}
      aria-label='NPS Rating Statistics'
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
          <BarChartIcon
            sx={{ fontSize: 40, color: mainGreen }}
            aria-label='Bar chart icon'
          />
          <Typography fontWeight={600} variant='h4' component='h2'>
            Rating Statistics
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
        }}
        px={6}
        pb={6}
      >
        <Stack spacing={6}>
          <Box textAlign='center'>
            <Typography
              variant='h2'
              fontWeight={600}
              color={mainGreen}
              mb={1}
              sx={{
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                },
              }}
              aria-label='Mean rating'
            >
              {formatFloatNumber(mean)}/10
            </Typography>
            <Typography variant='h6' fontWeight={600}>
              Mean Rating
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Average rating from all responses
            </Typography>
            {mean >= 7.5 && (
              <Stack
                direction='row'
                spacing={1}
                justifyContent='center'
                alignItems='center'
                mt={1}
              >
                <TrendingUpIcon
                  fontSize='small'
                  color='success'
                  aria-label='Trending up'
                />
                <Typography variant='body2' fontWeight={500} color={mainGreen}>
                  Above industry average
                </Typography>
              </Stack>
            )}
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={3}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  border: cardBorder,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                }}
                aria-label='Median rating card'
              >
                <Typography
                  variant='h4'
                  fontWeight={600}
                  color={mainGreen}
                  mb={1}
                >
                  {formatFloatNumber(median)}/10
                </Typography>
                <Typography
                  variant='subtitle1'
                  fontWeight={600}
                  lineHeight={1.2}
                >
                  Median Rating
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  lineHeight={1.2}
                >
                  Middle value (outlier resistant)
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={3}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  border: cardBorder,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                }}
                aria-label='Standard deviation card'
              >
                <Typography
                  variant='h4'
                  fontWeight={600}
                  color={mainGreen}
                  mb={1}
                >
                  {formatFloatNumber(deviation)}
                </Typography>
                <Typography
                  variant='subtitle1'
                  fontWeight={600}
                  lineHeight={1.2}
                >
                  Std. Deviation
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  lineHeight={1.2}
                >
                  Rating variability
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Paper>
  );
};

export default NpsStatisticsRatingStatistics;
