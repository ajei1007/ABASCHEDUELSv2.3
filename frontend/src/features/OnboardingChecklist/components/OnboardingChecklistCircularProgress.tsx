import type { FC } from 'react';
import { Box, type BoxProps } from '@mui/material';

interface ICircularProgressProps {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Circle size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Child content to display in center */
  children?: React.ReactNode;
  /** Additional styling */
  sx?: BoxProps['sx'];
}

const OnboardingChecklistCircularProgress: FC<ICircularProgressProps> = ({
  percentage,
  size = 40,
  strokeWidth = 3,
  children,
  sx,
}) => {
  // Clamp percentage to valid range
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;

  // Center position
  const center = size / 2;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden='true'
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke='#dfdfdf'
            strokeWidth={strokeWidth}
            fill='none'
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke='#4d53e0'
            strokeWidth={strokeWidth}
            fill='none'
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out',
              willChange: 'stroke-dashoffset', // Optimize for animations
            }}
            strokeLinecap='round'
          />
        </svg>

        {children && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Display name for debugging
OnboardingChecklistCircularProgress.displayName =
  'OnboardingChecklistCircularProgress';

export default OnboardingChecklistCircularProgress;
