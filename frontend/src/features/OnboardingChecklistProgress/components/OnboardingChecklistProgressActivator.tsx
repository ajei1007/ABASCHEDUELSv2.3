import { useCallback, type FC, type MouseEvent } from 'react';
import { Box, Stack, Typography, Collapse } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useOnboardingChecklistProgressPopoverContext } from '../context/OnboardingChecklistProgressPopoverContext';
import { useOnboardingChecklistOverallProgress } from '@/features/OnboardingChecklist/hooks/useOnboardingChecklistOverallProgress';
import OnboardingChecklistCircularProgress from '@/features/OnboardingChecklist/components/OnboardingChecklistCircularProgress';

// Constants for better maintainability and consistency
const ACTIVATOR_CONFIG = {
  HEIGHT: '60px',
  BORDER_RADIUS: '12px',
  PROGRESS_SIZE: 35,
  ICON_SIZE: '0.65rem',
  CHECK_ICON_SIZE: '2.25rem!important',
} as const;

const COLORS = {
  PRIMARY: 'rgba(77, 83, 224, 0.75)',
  PRIMARY_TEXT: 'rgb(62, 67, 179)',
  PRIMARY_BG: 'rgba(77, 83, 224, 0.05)',
  PRIMARY_BG_HOVER: 'rgba(77, 83, 224, 0.1)',
  PRIMARY_BG_ACTIVE: 'rgba(77, 83, 224, 0.15)',
  SECONDARY_TEXT: 'rgba(77, 83, 224, 0.9)',
} as const;

// Props interface for better type safety
interface OnboardingChecklistProgressActivatorProps {
  /** Controls visibility of the activator component */
  visible?: boolean;
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Optional test ID for testing */
  'data-testid'?: string;
}

const OnboardingChecklistProgressActivator: FC<
  OnboardingChecklistProgressActivatorProps
> = ({ visible = true, className, 'data-testid': testId }) => {
  const { toggleOpen } = useOnboardingChecklistProgressPopoverContext();
  const { percentage, totalItems, completedItems, isCompleted } =
    useOnboardingChecklistOverallProgress();

  // Memoized click handler for better performance
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      toggleOpen(event);
    },
    [toggleOpen],
  );

  return (
    <Collapse in={visible} appear>
      <Box pt={1}>
        <Box
          component='button'
          width='100%'
          height={ACTIVATOR_CONFIG.HEIGHT}
          className={className}
          data-testid={testId}
          sx={{
            textAlign: 'left',
            border: `1px solid ${COLORS.PRIMARY}`,
            borderRadius: ACTIVATOR_CONFIG.BORDER_RADIUS,
            backgroundColor: COLORS.PRIMARY_BG,
            display: 'flex',
            alignItems: 'center',
            pl: 1.25,
            pr: 1,
            columnGap: 1.25,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: COLORS.PRIMARY_BG_HOVER,
            },
            '&:active': {
              backgroundColor: COLORS.PRIMARY_BG_ACTIVE,
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'rgb(77, 83, 224)',
              outlineOffset: '2px',
            },
            // Ensure proper accessibility for interactive elements
            '&:disabled': {
              cursor: 'not-allowed',
              opacity: 0.6,
            },
          }}
          onClick={handleClick}
          aria-label={`Onboarding progress: ${completedItems} of ${totalItems} tasks completed (${percentage}%)`}
          aria-expanded={false}
          role='button'
          tabIndex={0}
          // Add keyboard support
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleClick(event as any);
            }
          }}
        >
          <OnboardingChecklistCircularProgress
            size={ACTIVATOR_CONFIG.PROGRESS_SIZE}
            percentage={percentage}
          >
            {isCompleted && (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                role='img'
                aria-label='Onboarding completed'
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: ACTIVATOR_CONFIG.CHECK_ICON_SIZE,
                    color: 'rgba(77, 83, 224)',
                  }}
                />
              </Box>
            )}
          </OnboardingChecklistCircularProgress>

          <Stack
            flex={1}
            rowGap={0.25}
            pt='1px'
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              minWidth: 0, // Prevent flex item from growing beyond container
            }}
          >
            <Typography
              fontSize='0.85rem!important'
              lineHeight='1.3'
              fontWeight='600'
              color={COLORS.PRIMARY_TEXT}
              component='h3'
            >
              Onboarding{' '}
              <Box component='span' role='img' mx='0.25rem' aria-label='rocket'>
                🚀
              </Box>
            </Typography>
            <Typography
              fontSize='0.725rem!important'
              lineHeight='1.3'
              color={COLORS.SECONDARY_TEXT}
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              aria-live='polite'
              aria-atomic='true'
            >
              {completedItems}/{totalItems} completed tasks
            </Typography>
          </Stack>

          <ArrowForwardIosIcon
            sx={{
              fontSize: ACTIVATOR_CONFIG.ICON_SIZE,
              color: COLORS.PRIMARY_TEXT,
              transition: 'transform 0.2s ease',
            }}
            aria-hidden='true'
          />
        </Box>
      </Box>
    </Collapse>
  );
};

// Add display name for better debugging experience
OnboardingChecklistProgressActivator.displayName =
  'OnboardingChecklistProgressActivator';

export default OnboardingChecklistProgressActivator;
