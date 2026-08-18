import { type FC } from 'react';
import { Stack, Box } from '@mui/material';
import OnboardingChecklistHeader from '@/features/OnboardingChecklist/components/OnboardingChecklistHeader/OnboardingChecklistHeader';
import OnboardingChecklistBody from '@/features/OnboardingChecklist/components/OnboardingChecklistBody/OnboardingChecklistBody';

/**
 * Container component for the onboarding checklist progress page.
 * Provides a sticky header with progress information and scrollable body content.
 */
const OnboardingChecklistProgressBody: FC = () => {
  return (
    <Stack
      component='main'
      role='main'
      aria-label='Onboarding checklist progress'
      sx={{
        backgroundColor: 'white',
        flexDirection: 'column',
      }}
    >
      {/* Sticky header with progress indicators */}
      <Box
        component='header'
        role='banner'
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          py: 2.5, // 20px
          px: 2, // 16px
        }}
      >
        <OnboardingChecklistHeader />
      </Box>

      {/* Main content area */}
      <Box
        component='section'
        role='main'
        sx={{
          flex: 1,
          pb: 2.5, // 20px
          px: 2, // 16px
        }}
      >
        <OnboardingChecklistBody />
      </Box>
    </Stack>
  );
};

OnboardingChecklistProgressBody.displayName = 'OnboardingChecklistProgressBody';

export default OnboardingChecklistProgressBody;
