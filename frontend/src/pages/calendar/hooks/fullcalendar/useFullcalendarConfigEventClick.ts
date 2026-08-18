import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useLatestCallback } from 'hooks/useLatestCallback';
import role_permissions from 'helpers/role_permissions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { operateSelectedEvents, replacing } from 'store/slices/calendar/thunks';
import { toggleOptimizerResultsSelectedId } from 'store/actions/optimizerActions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import { selectSolutionGeneratorJobs } from 'store/slices/solutionGenerator';
import {
  showReplaceEventsModal,
  showConflictingEventsModal,
} from 'store/slices/solutionGenerator/actions';
import { eventExtractFormatter } from '../../utils/eventExtractFormatter';
import { useCalendarCopyModeContext } from '../../context/CalendarCopyModeContext';
import { useCalendarSelectedResourcesContext } from '../../context/CalendarSelectedResourcesContext';
import { useCalendarSelectedEventsContext } from '../../context/CalendarSelectedEventsContext';
import { useCalendarOptimizerJobUtilsContext } from '../../context/CalendarOptimizerJobUtilsContext';

export function useFullcalendarConfigEventClick({
  hasCurrentDayHaveOptimizerJob,
  showEditEventSidebar,
}: {
  hasCurrentDayHaveOptimizerJob: boolean;
  showEditEventSidebar: (event: any) => void;
}) {
  const dispatch = useAppDispatch();
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const storeSolutionGeneratorJobs = useAppSelector(
    selectSolutionGeneratorJobs,
  );

  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  // Context for copy mode
  const { copyModeActive } = useCalendarCopyModeContext();

  const { toggleSelectedEvent } = useCalendarSelectedEventsContext();

  // Context for selected resources
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  const eventClick = useLatestCallback(
    async ({ event: clickedEvent }: { event: any }) => {
      if (isOptimizerResultsPreviewMode) {
        const opResult = clickedEvent.extendedProps.opResult;
        if (opResult) {
          const eventId = `${clickedEvent.id}`.split('__')[0];
          dispatch(toggleOptimizerResultsSelectedId(eventId));
        }
        return;
      }

      if (
        hasCurrentDayHaveOptimizerJob ||
        hasOptimizerJobRunning(clickedEvent)
      ) {
        return;
      }

      // Check if the clicked event is a background event or if the user doesn't have permission to edit events
      if (
        clickedEvent.display === 'background' ||
        !role_permissions(currentUser, 'editEvent')
      ) {
        return;
      }

      // Check if the clicked event is a solution generator event
      if (
        clickedEvent.extendedProps.av !== 't' &&
        clickedEvent.extendedProps.av !== 'n'
      ) {
        if (copyModeActive) {
          // If copyModeActive is true, toggle the selected event
          toggleSelectedEvent(clickedEvent);
        } else {
          // If not in copy mode, show the edit sidebar for the clicked event
          showEditEventSidebar(clickedEvent);
        }
        return;
      }

      const currentBranchId = storeCurrentBranches[0]?.value;
      const resourceIds = Array.from<string>(
        clickedEvent?._def?.resourceIds || [],
      ).map((id) => `${id}`.slice(0, 36));

      const hasRunningSolutionGeneratorJob = resourceIds.some((resourceId) => {
        const jobKey = `${resourceId}__${currentBranchId}`;
        const job = storeSolutionGeneratorJobs[jobKey];
        return job && job.status !== 'success';
      });

      if (hasRunningSolutionGeneratorJob) {
        // If there is a running solution generator job, do not proceed
        return;
      }

      // Handle solution generator white solution case
      if (clickedEvent.extendedProps.av === 't') {
        const formattedEvent = eventExtractFormatter(clickedEvent);
        formattedEvent.timezone = storeSettingsValuesTimezone;

        const drive_id = storeActivityResources.find(
          (e) => e.firstName === 'Drive',
        )?.id;

        let drive_array: any[] = [];
        // Handle person drive events
        if (clickedEvent.extendedProps?.person_drive) {
          Object.keys(clickedEvent.extendedProps.person_drive).forEach(
            (key) => {
              const value = clickedEvent.extendedProps.person_drive[key];
              if (value['start'] !== 0) {
                let drive_start = cloneDeep(formattedEvent);
                drive_start = {
                  ...drive_start,
                  id: uuidv4(),
                  start: new Date(value['beginningDrive'][0]),
                  end: new Date(value['beginningDrive'][1]),
                  timezone: storeSettingsValuesTimezone,
                };
                drive_start['users'] = [{ value: drive_id }, { value: key }];
                drive_array.push(drive_start);
              }
              if (value['end'] !== 0) {
                let drive_end = cloneDeep(formattedEvent);
                drive_end = {
                  ...drive_end,
                  id: uuidv4(),
                  start: new Date(value['endDrive'][0]),
                  end: new Date(value['endDrive'][1]),
                  timezone: storeSettingsValuesTimezone,
                };
                drive_end['users'] = [{ value: drive_id }, { value: key }];
                drive_array.push(drive_end);
              }
            },
          );
        }

        const actions = await dispatch(replacing(formattedEvent));

        // it means we have overlapping events
        if (actions) {
          const { replacingData, overlappingEvents } = actions;
          dispatch(
            showReplaceEventsModal({
              replaceReasons: replacingData,
              toBeAddedEvent: formattedEvent,
              toBeDeletedEvents: overlappingEvents,
            }),
          );
          return;
        }

        dispatch(
          operateSelectedEvents({
            operations: {
              toBeAdded: {
                items: [formattedEvent, ...drive_array],
              },
            },
            skipValidation: true,
          }),
        ).then(({ success }) => {
          if (success) {
            resetAnySelected();
          }
        });
        return;
      }

      // Handle solution generator orange solution case
      if (clickedEvent.extendedProps.av === 'n') {
        const conflictReasons = clickedEvent.extendedProps.reasons.map(
          (reason: any) => ({
            conflict: reason.reason,
          }),
        );
        dispatch(
          showConflictingEventsModal({
            conflictReasons,
            toBeAddedEvent: eventExtractFormatter(clickedEvent),
          }),
        );
      }
    },
  );

  return eventClick;
}
