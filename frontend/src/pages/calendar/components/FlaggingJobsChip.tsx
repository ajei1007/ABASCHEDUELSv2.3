import { memo, type FC } from 'react';
import { Box, Stack, Chip, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FlagIcon from '@mui/icons-material/Flag';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { useAppSelector } from 'store/hooks';
import { selectFlaggingBeingFetchedResourcesSet } from 'store/slices/flagging/selectors';

/**
 * FlaggingJobsChip
 * Displays a status chip for flagging or overbooking jobs, with loading and enabled states.
 * Shows a flag or layers icon depending on which feature is enabled, and a spinner or check icon for status.
 */
const FlaggingJobsChip: FC = () => {
  // Select whether flagging and overbooking features are enabled from the store
  const isFlaggingEnabled = useAppSelector(
    (state) => state.flagging.flaggingEnabled,
  );
  const isOverbookingEnabled = useAppSelector(
    (state) => state.settings.settingValues?.overbooking,
  );

  // Select the set of resources currently being fetched for flagging
  const flaggingBeingFetchedResourcesSet = useAppSelector(
    selectFlaggingBeingFetchedResourcesSet,
  );

  // If neither feature is enabled, do not render the chip
  if (!isFlaggingEnabled && !isOverbookingEnabled) {
    return null;
  }

  // Determine if flagging jobs are currently being fetched
  const isFlaggingBeingFetched = flaggingBeingFetchedResourcesSet.size > 0;

  // Set border color based on loading state
  const borderColor = isFlaggingBeingFetched ? '#6b859e' : '#1976d2';

  /**
   * Returns the appropriate icon for the chip based on which feature is enabled.
   */
  const getFeatureIcon = () => {
    if (isFlaggingEnabled) {
      return <FlagIcon sx={{ color: `${borderColor} !important` }} />;
    }
    return <LayersOutlinedIcon sx={{ color: `${borderColor} !important` }} />;
  };

  /**
   * Returns the status icon: spinner if loading, check if loaded.
   */
  const getStatusIcon = () => {
    if (isFlaggingBeingFetched) {
      return <CircularProgress size='13px' />;
    }
    return (
      <CheckCircleOutlineIcon
        sx={{
          fontSize: '1rem',
          color: '#1976d2',
        }}
      />
    );
  };

  /**
   * Returns the tooltip text based on current state.
   */
  const getTooltipTitle = () => {
    if (isFlaggingBeingFetched) {
      return isFlaggingEnabled
        ? 'Flagging is being loaded...'
        : 'Overbooking is being checked...';
    }
    return isFlaggingEnabled
      ? 'Flagging is enabled'
      : 'Overbooking check is enabled';
  };

  return (
    <Box sx={{ ml: '1rem!important' }}>
      {/* Tooltip provides context for the chip's current state */}
      <Tooltip arrow title={getTooltipTitle()} placement='top'>
        <Chip
          size='small'
          variant='outlined'
          sx={{
            height: '25px',
            paddingLeft: 0.75,
            paddingRight: 0.15,
            borderColor,
            position: 'relative',
            // Add a pulse animation when loading
            '&::after': isFlaggingBeingFetched
              ? {
                  '--custom-pulse-color': '77, 83, 224',
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  animation: `custom-pulse 1.5s infinite`,
                  zIndex: -1,
                }
              : undefined,
          }}
          icon={getFeatureIcon()}
          label={
            <Stack
              direction='column'
              alignItems='center'
              justifyItems='center'
              sx={{ paddingLeft: 0.25 }}
            >
              {/* Status icon: spinner or check */}
              {getStatusIcon()}
            </Stack>
          }
        />
      </Tooltip>
    </Box>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(FlaggingJobsChip);
