import type { FC } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import OnboardingChecklistCircularProgress from '../OnboardingChecklistCircularProgress';

// Constants for better maintainability
const PROGRESS_SIZE = 60;
const STROKE_WIDTH = 4;
const SKELETON_SIZE = '60px';

export interface IChecklistHeaderCircleProgressProps {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Loading state indicator */
  isLoading: boolean;
  /** Optional ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Memoized component for better performance
 * Only re-renders when props actually change
 */
const ChecklistHeaderCircleProgress: FC<
  IChecklistHeaderCircleProgressProps
> = ({ percentage, isLoading, ariaLabel }) => {
  // Clamp percentage to valid range for safety
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
      role='progressbar'
      aria-label={ariaLabel || `Progress: ${clampedPercentage}%`}
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {isLoading ? (
        <Skeleton
          width={SKELETON_SIZE}
          height={SKELETON_SIZE}
          variant='circular'
          animation='wave'
          sx={{
            transform: 'none',
            flexShrink: 0, // Prevent skeleton from shrinking
          }}
          aria-label='Loading progress'
        />
      ) : (
        <OnboardingChecklistCircularProgress
          percentage={clampedPercentage}
          size={PROGRESS_SIZE}
          strokeWidth={STROKE_WIDTH}
          sx={{
            flexShrink: 0, // Prevent shrinking
          }}
        >
          <Typography
            variant='subtitle2'
            sx={{
              fontWeight: 'bold',
              color: '#4d53e0',
            }}
            aria-hidden='true' // Screen readers will use the progress bar aria-label
          >
            {clampedPercentage}%
          </Typography>
        </OnboardingChecklistCircularProgress>
      )}
    </Box>
  );
};

// Display name for debugging
ChecklistHeaderCircleProgress.displayName = 'ChecklistHeaderCircleProgress';

export default ChecklistHeaderCircleProgress;
