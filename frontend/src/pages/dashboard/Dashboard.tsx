import { useEffect, lazy, Suspense } from 'react';
import { Stack, Grid2 as Grid, Typography, Skeleton } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import config from 'config';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import { useOnboardingChecklistViewAccess } from '@/features/OnboardingChecklist/hooks/useOnboardingChecklistViewAccess';
import { useAppCrash } from 'hooks/useAppCrash';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

const OnboardingChecklist = lazy(
  () => import('@/features/OnboardingChecklist/OnboardingChecklist'),
);

const Dashboard = () => {
  const { companyLabel, companyLogo, hasLogoAnimation } = config;
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const dispatch = useAppDispatch();

  const companyOnboarded = currentUser?.company?.onboarded ?? false;
  const hasAccessViewChecklist = useOnboardingChecklistViewAccess();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(
        checkNpsSurvey({
          chance: 0.85, // 85% chance to show NPS survey
        }),
      );
    }, 100);

    return () => window.clearTimeout(timer);
  }, [dispatch]);

  // Crash hook for testing error boundaries,
  // NOTE: works only in dev or beta environments
  useAppCrash({
    crashFnName: 'crashDashboard',
    errorMessage: 'Dashboard crashed!',
  });

  return (
    <Stack px={1.25}>
      <Stack py={2} mb={1} direction='row' justifyContent='space-between'>
        <Typography variant='h1' fontSize='2.5rem!important' fontWeight='600'>
          Welcome, {currentUser ? currentUser.firstName || 'User' : 'User'}!
        </Typography>
      </Stack>
      {companyOnboarded || !hasAccessViewChecklist ? (
        <Stack width={500} mt={2.5}>
          {hasLogoAnimation ? (
            <Suspense>
              <ABASchedulesLogoAnimated width={undefined} height={undefined} />
            </Suspense>
          ) : (
            <img src={companyLogo} alt={companyLabel} />
          )}
        </Stack>
      ) : (
        <Grid container columns={12}>
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12,
              xl: 9,
            }}
          >
            <Suspense
              fallback={
                <Skeleton
                  component='div'
                  width='100%'
                  height='470px'
                  animation='wave'
                  sx={{
                    my: 0,
                    transform: 'none',
                    borderRadius: '10px',
                  }}
                />
              }
            >
              <OnboardingChecklist />
            </Suspense>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
};

export default Dashboard;
