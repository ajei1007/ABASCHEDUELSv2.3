import { Box } from '@mui/material';
import { useOnboardingChecklist } from '../../hooks/useOnboardingChecklist';
import { useOnboardingChecklistOverallProgress } from '../../hooks/useOnboardingChecklistOverallProgress';
import ChecklistHeaderTitle from './ChecklistHeaderTitle';
import ChecklistHeaderCircleProgress from './ChecklistHeaderCircleProgress';
import ChecklistHeaderLinearProgress from './ChecklistHeaderLinearProgress';

const OnboardingChecklistHeader = () => {
  const { isLoading, hasError, getLastFetchingStatus } =
    useOnboardingChecklist();
  const { percentage } = useOnboardingChecklistOverallProgress();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        px: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <ChecklistHeaderTitle />
        {!hasError && (
          <ChecklistHeaderCircleProgress
            percentage={percentage}
            isLoading={isLoading && getLastFetchingStatus() !== 'success'}
          />
        )}
      </Box>
      {!hasError && (
        <ChecklistHeaderLinearProgress
          percentage={percentage}
          isLoading={isLoading && getLastFetchingStatus() !== 'success'}
        />
      )}
    </Box>
  );
};

export default OnboardingChecklistHeader;
