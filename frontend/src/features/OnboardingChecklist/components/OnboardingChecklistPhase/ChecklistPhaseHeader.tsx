import type { FC } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  type SxProps,
  type Theme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { useOnboardingChecklistPhaseProgress } from '../../hooks/useOnboardingChecklistPhaseProgress';
import OnboardingChecklistCircularProgress from '../OnboardingChecklistCircularProgress';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';

export interface IChecklistPhaseHeaderProps {
  /** Zero-based index of the phase */
  index: number;
  /** Phase data containing checklist items */
  phase: IApiOnboardingChecklistPhaseItem;
  /** Whether the accordion is expanded */
  isExpanded?: boolean;
  /** Function to toggle the accordion expansion */
  toggleExpanded?: () => void;
}

// Constants for better maintainability
const HEADER_HEIGHT = 90;
const PROGRESS_CIRCLE_SIZE = 40;
const ICON_SIZE = 24;
const ARROW_ICON_SIZE = 20;

// Extracted styles for better performance and readability
const headerContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 1.5,
  px: 3,
  py: 2,
  height: `${HEADER_HEIGHT}px`,
  width: '100%',
};

const headerContentStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
};

const progressIndicatorStyles: SxProps<Theme> = {
  my: 'auto',
  display: 'flex',
  alignItems: 'center',
};

const completedBadgeStyles: SxProps<Theme> = {
  width: `${PROGRESS_CIRCLE_SIZE}px`,
  height: `${PROGRESS_CIRCLE_SIZE}px`,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgb(77, 83, 224)',
  color: 'white',
};

const phaseInfoStyles: SxProps<Theme> = {
  letterSpacing: '0.01em',
};

const descriptionStyles: SxProps<Theme> = {
  mt: 0.5,
};

const ChecklistPhaseHeader: FC<IChecklistPhaseHeaderProps> = ({
  index,
  phase,
  isExpanded = true,
  toggleExpanded,
}) => {
  const { percentage, totalItems, completedItems, isCompleted } =
    useOnboardingChecklistPhaseProgress({ phase });

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded?.();
  };

  return (
    <Box sx={headerContainerStyles}>
      <Box sx={headerContentStyles}>
        <Stack direction='row' alignItems='center' spacing={4}>
          <Stack direction='row' alignItems='center' spacing={3}>
            <Box sx={progressIndicatorStyles}>
              {isCompleted ? (
                <Box
                  sx={completedBadgeStyles}
                  role='img'
                  aria-label='Phase completed'
                >
                  <CheckIcon
                    sx={{
                      fontSize: `${ICON_SIZE}px!important`,
                    }}
                  />
                </Box>
              ) : (
                <OnboardingChecklistCircularProgress
                  percentage={percentage}
                  aria-label={`Phase ${index + 1} progress: ${percentage}%`}
                >
                  <Typography variant='body2' fontWeight={600} color='grey.800'>
                    {index + 1}
                  </Typography>
                </OnboardingChecklistCircularProgress>
              )}
            </Box>
            <Box>
              <Typography
                variant='h6'
                fontWeight={600}
                color='grey.900'
                sx={phaseInfoStyles}
              >
                {phase.title}
              </Typography>
              {phase.description && (
                <Typography
                  variant='body2'
                  color='grey.600'
                  sx={descriptionStyles}
                >
                  {phase.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={2}>
          <Typography
            variant='caption'
            color='grey.500'
            aria-label={`${completedItems} of ${totalItems} items completed`}
          >
            {completedItems}/{totalItems} completed
          </Typography>
          <IconButton
            size='small'
            onClick={handleToggleClick}
            aria-label={isExpanded ? 'Collapse phase' : 'Expand phase'}
            aria-expanded={isExpanded}
          >
            <KeyboardArrowDownIcon
              sx={{
                color: 'grey.400',
                width: ARROW_ICON_SIZE,
                height: ARROW_ICON_SIZE,
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease-in-out',
              }}
            />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

ChecklistPhaseHeader.displayName = 'ChecklistPhaseHeader';

export default ChecklistPhaseHeader;
