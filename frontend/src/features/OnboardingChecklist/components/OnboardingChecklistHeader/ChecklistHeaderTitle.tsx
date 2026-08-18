import { lazy, Suspense } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

const ChecklistHeaderTitle = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Suspense
        fallback={
          <Skeleton
            width='60px'
            height='60px'
            animation='wave'
            sx={{
              transform: 'none',
              borderRadius: '14px',
            }}
          />
        }
      >
        <ABASchedulesLogoAnimated width='60px' height='60px' />
      </Suspense>
      <Box>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            color: 'grey.900',
            letterSpacing: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          Getting Started{' '}
          <Box component='span' role='img' mx='0.25rem' aria-label='rocket'>
            🚀
          </Box>
        </Typography>
        <Typography variant='body2' sx={{ color: 'grey.600', mt: 0.5 }}>
          Your ABA Schedules onboarding journey
        </Typography>
      </Box>
    </Box>
  );
};

export default ChecklistHeaderTitle;
