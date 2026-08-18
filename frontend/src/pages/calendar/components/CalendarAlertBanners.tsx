import { memo, type FC } from 'react';
import { Alert, Stack, Collapse } from '@mui/material';
import { useAppSelector } from 'store/hooks';
import OptimizerJobAlert from './OptimizerJobAlert';
import CopySelectModeActiveAlert from './CopySelectModeActiveAlert/CopySelectModeActiveAlert';
import { useCalendarCopyModeContext } from '../context/CalendarCopyModeContext';
import type { IOptimizerJobItem } from 'types';

export interface ICalendarAlertBannersProps {
  hasCurrentDayHaveOptimizerJob: boolean;
  currentDaysOptimizerJob: IOptimizerJobItem | null;
  deleteEvents: () => void;
  pasteEvents: () => void;
  resetAnySelected: () => void;
}

const CalendarAlertBanners: FC<ICalendarAlertBannersProps> = ({
  hasCurrentDayHaveOptimizerJob,
  currentDaysOptimizerJob,
  deleteEvents,
  pasteEvents,
  resetAnySelected,
}) => {
  const isOnboarding = useAppSelector(
    (state) => state.settings.settingValues.isOnboarding,
  );

  const schedulerLocked = useAppSelector(
    (state) => state.settings.schedulerLocked,
  );

  const sandboxMode = useAppSelector((state) => state.calendar.sandboxMode);

  // Context for copy mode
  const { copyModeActive } = useCalendarCopyModeContext();

  return (
    <Stack>
      {/* Onboarding Mode Alert */}
      <Collapse in={isOnboarding}>
        <Stack mb={2}>
          <Alert
            sx={{
              '&': { justifyContent: 'center', borderRadius: '0.5rem' },
            }}
            severity='info'
            data-qa='onboarding-mode-alert'
          >
            Onboarding Mode is activated!
          </Alert>
        </Stack>
      </Collapse>
      {/* Sandbox Mode Alert */}
      <Collapse in={sandboxMode}>
        <Stack mb={1}>
          <Alert
            sx={{
              '&': { justifyContent: 'center', borderRadius: '0.5rem' },
            }}
            severity='warning'
            data-qa='sandbox-mode-alert'
          >
            Sandbox Mode is activated!
          </Alert>
        </Stack>
      </Collapse>
      {/* Scheduler Locked Alert */}
      <Collapse in={schedulerLocked}>
        <Stack mb={1}>
          <Alert
            sx={{
              '&': { justifyContent: 'center', borderRadius: '0.5rem' },
            }}
            severity='error'
            data-qa='scheduler-locked-alert'
          >
            Scheduler is locked!
          </Alert>
        </Stack>
      </Collapse>
      {/* Copy Mode Active Alert */}
      <Collapse in={copyModeActive} unmountOnExit>
        <Stack mb={1}>
          <CopySelectModeActiveAlert
            disableActions={hasCurrentDayHaveOptimizerJob}
            onDeleteEvents={deleteEvents}
            onPasteEvents={pasteEvents}
            onExitMode={resetAnySelected}
          />
        </Stack>
      </Collapse>
      {/* Optimizer Running Alert */}
      {hasCurrentDayHaveOptimizerJob && (
        <Stack mb={1}>
          <OptimizerJobAlert optimizerJob={currentDaysOptimizerJob!} />
        </Stack>
      )}
    </Stack>
  );
};

CalendarAlertBanners.displayName = 'CalendarAlertBanners';

export default memo(CalendarAlertBanners);
