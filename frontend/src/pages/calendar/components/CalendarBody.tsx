import { useEffect, useRef, memo, forwardRef, useCallback } from 'react';
import type { Ref } from 'react';

import { Stack, Fade } from '@mui/material';

import FullCalendar from '@fullcalendar/react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedEvent } from 'store/slices/calendar/actions';
import { toggleEventFormDrawerOpen } from 'store/slices/calendarOverlayingPanels/actions';
import { handleSettingValues } from 'store/actions/settingsActions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';

import type { TApiEventDeleteType } from 'types/api';

import ContextMenu from 'components/ContextMenu';
import ModalWrapper from 'components/ModalWrapper';
import type { IModalWrapperRef } from 'components/ModalWrapper';

import ParameterButtons from './ParameterButtons';
import CalendarToolbar from './CalendarToolbar';
import FilteredItemChips from './FilteredItemChips';
import OptimizerJobs from './OptimizerJobs';
import CalendarAlertBanners from './CalendarAlertBanners';

import EventsDeleteConfirmModal, {
  type IEventsDeleteConfirmModalPropsForRef,
} from './modals/EventsDeleteConfirmModal/EventsDeleteConfirmModal';
import SelectAndConfirmPromiseModal, {
  type ISelectAndConfirmPromiseModalPropsForRef,
} from './modals/SelectAndConfirmPromiseModal';
import ChangeAffectedEventGroupsConfirmModal, {
  type IChangeAffectedEventGroupsConfirmModalPropsForRef,
} from './modals/ChangeAffectedEventGroupsConfirmModal';
import SelectAndConfirmUnavailabilityModal, {
  type ISelectAndConfirmUnavailabilityPropsForRef,
} from './modals/SeletedAndConfirmedUnavailabilityModal';
import SelectAndConfirmAvailabilityModal, {
  type ISelectAndConfirmAvailabilityPropsForRef,
} from './modals/SeletedAndConfirmedAvailabilityModal';
import ResourceEditModal, {
  type IResourceEditModalPropsForRef,
} from './modals/ResourceEditModal';
import PasteEventsConfirmModal, {
  type IPasteEventsConfirmModalPropsForRef,
} from './modals/PasteEventsConfirmModal';

import { useLatestCallback } from 'hooks/useLatestCallback';

import { useFullcalendarApiContext } from '../context/FullcalendarApiContext';
import { useCalendarViewContext } from '../context/CalendarViewContext';
import { useCalendarCopyModeContext } from '../context/CalendarCopyModeContext';
import { useCalendarSelectedResourcesContext } from '../context/CalendarSelectedResourcesContext';
import { useCalendarSelectedEventsContext } from '../context/CalendarSelectedEventsContext';

import { useRootResizeObserver } from '../hooks/useRootResizeObserver';
import { useCalendarContextMenu } from '../hooks/useCalendarContextMenu';
import { useOptimizerJobGoToDate } from '../hooks/useOptimizerJobGoToDate';
import { useSolGenTriggerOnSandboxChange } from '../hooks/useSolGenTriggerOnSandboxChange';
import { useSettingsHighlightRecentlyChangedOnChange } from '../hooks/useSettingsHighlightRecentlyChangedOnChange';
import { useCurrentDaysOptimizerJob } from '../hooks/useCurrentDaysOptimizerJob';
import { useCalendarEventsPaste } from '../hooks/useCalendarEventsPaste';
import { useCalendarReplaceEventsHandler } from '../hooks/useCalendarReplaceEventsHandler';
import { useCalendarAddDriveBetweenEventsHandler } from '../hooks/useCalendarAddDriveBetweenEventsHandler';
import { useCalendarDeleteMultipleEventsHandler } from '../hooks/useCalendarDeleteMultipleEventsHandler';
import { useCalendarEventsSandboxChangeHandler } from '../hooks/useCalendarEventsSandboxChangeHandler';
import { useCalendarUndeleteMultipleEventsHandler } from '../hooks/useCalendarUndeleteMultipleEventsHandler';
import { useCalendarDataFetchForVisibleResources } from '../hooks/useCalendarDataFetchForVisibleResources';
import { useCalendarSocketConnection } from '../hooks/useCalendarSocketConnection';
import { useCalendarUserAvailabilityActionHandlers } from '../hooks/useCalendarUserAvailabilityActionHandlers';
import { useFullcalendarConfigOptions } from '../hooks/fullcalendar/useFullcalendarConfigOptions';
import { useFullcalendarSyncEventsResources } from '../hooks/fullcalendar/useFullcalendarSyncEventsResources';

interface ICalendarBodyProps {
  //
}

const CalendarBody = forwardRef(
  (_props: ICalendarBodyProps, ref: Ref<HTMLDivElement>) => {
    const dispatch = useAppDispatch();

    const isOptimizerResultsPreviewMode = useAppSelector(
      isOptimizerResultsPreviewModeSelector,
    );

    // Context for FullCalendar API
    const { calendarApi, setCalendarApi, updateCalendarSize } =
      useFullcalendarApiContext();

    // Context for active day and view
    const {
      activeDay,
      activeView,
      weekExpanded,
      toggleWeekExpanded,
      handleSetActiveDay,
      handleSetActiveDayAndView,
    } = useCalendarViewContext();

    // Context for copy mode
    const { copyModeActive, setCopyModeActive } = useCalendarCopyModeContext();

    // Context for selected resources
    const { selectedResources, unselectAllResources, resetAnySelected } =
      useCalendarSelectedResourcesContext();

    const { selectedEvents, toggleSelectedEvent, setSelectedEvents } =
      useCalendarSelectedEventsContext();

    const calendarRef = useRef<any>(null);
    const deleteSelectedEventsModalRef = useRef<
      IModalWrapperRef<
        IEventsDeleteConfirmModalPropsForRef,
        {
          items: any[];
          deleteType: TApiEventDeleteType;
        }
      >
    >(null);

    const updateSelectedEventsModalRef =
      useRef<IModalWrapperRef<ISelectAndConfirmPromiseModalPropsForRef, any>>(
        null,
      );

    const changeAffectedEventsModalRef =
      useRef<
        IModalWrapperRef<IChangeAffectedEventGroupsConfirmModalPropsForRef, any>
      >(null);

    const unavailabilityModalRef =
      useRef<IModalWrapperRef<ISelectAndConfirmUnavailabilityPropsForRef, any>>(
        null,
      );

    const availabilityModalRef =
      useRef<IModalWrapperRef<ISelectAndConfirmAvailabilityPropsForRef, any>>(
        null,
      );

    const resourceEditModalRef =
      useRef<IModalWrapperRef<IResourceEditModalPropsForRef, any>>(null);

    const pasteEventsConfirmModalRef = useRef<
      IModalWrapperRef<
        IPasteEventsConfirmModalPropsForRef,
        {
          includeCanceled: boolean;
        }
      >
    >(null);

    const { currentDaysOptimizerJob, hasCurrentDayHaveOptimizerJob } =
      useCurrentDaysOptimizerJob();

    const pasteEvents = useCalendarEventsPaste();

    const handlePasteEvents = useLatestCallback(async () => {
      const hasSelectedEventsSomeCanceled = selectedEvents.some(
        (ev: any) => ev?.extendedProps?.canceled ?? false,
      );

      if (!hasSelectedEventsSomeCanceled) {
        pasteEvents({
          allowCanceledEvents: false,
        });
        return;
      }

      if (!pasteEventsConfirmModalRef.current) {
        console.warn(
          'pasteEventsConfirmModalRef ref is not attached to component',
        );
        return;
      }

      const result = await pasteEventsConfirmModalRef.current.show({});
      if (!result.isSubmit) {
        return;
      }

      pasteEvents({
        allowCanceledEvents: result.payload.includeCanceled,
      });
    });

    const { handleReplaceEvents } = useCalendarReplaceEventsHandler({
      updateSelectedEventsModalRef,
      changeAffectedEventsModalRef,
    });

    const { handleAddDriveBetweenEvent } =
      useCalendarAddDriveBetweenEventsHandler();

    const { trash, deleteMultipleEvents } =
      useCalendarDeleteMultipleEventsHandler({
        deleteSelectedEventsModalRef,
      });

    const { handleEventsSandboxeChange: handleClickMakeEventsSandboxed } =
      useCalendarEventsSandboxChangeHandler({
        updateSelectedEventsModalRef,
        changeAffectedEventsModalRef,
      });

    const { handleUndelete: handleClickUndelete } =
      useCalendarUndeleteMultipleEventsHandler();

    useEffect(() => {
      if (calendarApi === null) {
        setCalendarApi(calendarRef.current.getApi());
      }
    }, [calendarApi, setCalendarApi]);

    const isolate = useLatestCallback(() => {
      dispatch(handleSettingValues('isolatedResources', selectedResources));
    });

    const showEditEventSidebar = (event: any) => {
      let toBeSelectedEvent = JSON.parse(JSON.stringify(event));

      const parentId = toBeSelectedEvent?.extendedProps?.parentId ?? null;
      const parentEvent = parentId ? calendarApi?.getEventById(parentId) : null;
      if (parentEvent) {
        toBeSelectedEvent = JSON.parse(JSON.stringify(parentEvent));
        toBeSelectedEvent.isSupervisionEvent = true;
        toBeSelectedEvent.start = toBeSelectedEvent.extendedProps.startUTC;
        toBeSelectedEvent.end = toBeSelectedEvent.extendedProps.endUTC;
      }

      toBeSelectedEvent.users = [...toBeSelectedEvent.extendedProps.users];
      toBeSelectedEvent.canceled = toBeSelectedEvent.extendedProps.canceled;
      toBeSelectedEvent.reason_canceled =
        toBeSelectedEvent.extendedProps.reason_canceled;
      toBeSelectedEvent.user_canceled =
        toBeSelectedEvent.extendedProps.user_canceled;
      toBeSelectedEvent.visible = toBeSelectedEvent.extendedProps.visible;
      toBeSelectedEvent.converted = toBeSelectedEvent.extendedProps.converted;
      toBeSelectedEvent.sandboxMode =
        toBeSelectedEvent.extendedProps.sandboxMode;
      toBeSelectedEvent.daysofweek =
        toBeSelectedEvent.extendedProps.daysOfWeek_real;
      toBeSelectedEvent.timezone = toBeSelectedEvent.extendedProps.timezone;
      // toBeSelectedEvent.start =
      //   toBeSelectedEvent.extendedProps.start_real;
      // toBeSelectedEvent.end = toBeSelectedEvent.extendedProps.end_real;

      dispatch(setSelectedEvent(toBeSelectedEvent));
      dispatch(toggleEventFormDrawerOpen());
    };

    const handleClickEditButton = useCallback(
      (_id: any, _resourceType: any) => {
        if (!resourceEditModalRef.current) {
          console.warn('resourceEditModalRef ref is not attached to component');
          return;
        }

        resourceEditModalRef.current.show({
          modalData: {
            id: _id,
            type: _resourceType,
          },
        });
      },
      [resourceEditModalRef],
    );

    const calendarOptions = useFullcalendarConfigOptions({
      calendarRef,
      hasCurrentDayHaveOptimizerJob,
      handleClickEditButton,
      handleReplaceEvents,
      showEditEventSidebar,
    });

    const isDeleteDisabled = !Boolean(selectedEvents.length);

    /* Need to include includeDeleted */
    const isUnDeleteDisabled = !Boolean(selectedEvents.length);

    const { rootElRef } = useRootResizeObserver({
      handleResize: useLatestCallback(() => updateCalendarSize(50)),
    });

    const {
      creatingUnavailabilites,
      creatingAvailabilites,
      handleAddUnavalabilities,
      handleRemoveUnavailabilities,
      handleAddAvalabilities,
    } = useCalendarUserAvailabilityActionHandlers({
      unavailabilityModalRef,
      availabilityModalRef,
    });

    const { contextMenuRef } = useCalendarContextMenu({
      calendarApi,
      copyActive: copyModeActive,
      selectedEvents,
      isOptimizerResultsPreviewMode,
      hasCurrentDayHaveOptimizerJob,
      setCopyActive: setCopyModeActive,
      setSelectedEvents,
      toggleSelectedEvent,
      showEditEventSidebar,
      pasteEvents: handlePasteEvents,
      deleteEvents: deleteMultipleEvents,
    });

    useOptimizerJobGoToDate({
      calendarApi,
      activeDay,
      activeView,
      handleSetActiveDayAndView,
    });

    useSolGenTriggerOnSandboxChange();
    useSettingsHighlightRecentlyChangedOnChange();

    // Sync events and resources with FullCalendar
    useFullcalendarSyncEventsResources();

    // Fetch data for visible resources
    useCalendarDataFetchForVisibleResources();

    // Establish socket connection for calendar events
    useCalendarSocketConnection();

    return (
      <Stack
        ref={rootElRef}
        className='calendar-wrapper'
        sx={{
          backgroundColor: isOptimizerResultsPreviewMode
            ? 'rgba(255, 255, 255, 0.65)'
            : undefined,
        }}
        height='100%'
      >
        {/* Parameter Buttons */}
        <ParameterButtons
          checkedResources={selectedResources}
          isolate={isolate}
          trash={trash}
          handleClickMakeEventsSandboxed={handleClickMakeEventsSandboxed}
          handleClickUndelete={handleClickUndelete}
          handleAddUnavalabilities={handleAddUnavalabilities}
          handleAddAvalabilities={handleAddAvalabilities}
          handleRemoveUnavailabilities={handleRemoveUnavailabilities}
          creatingUnavailabilites={creatingUnavailabilites}
          creatingAvailabilites={creatingAvailabilites}
          activeDay={activeDay}
          handleAddDriveBetweenEvent={handleAddDriveBetweenEvent}
          setSelectedEvents={setSelectedEvents}
          uncheckAll={unselectAllResources}
          paste={handlePasteEvents}
          handleSetActiveDay={handleSetActiveDay}
          activeView={activeView}
          calendarApi={calendarApi}
          isDeleteDisabled={isDeleteDisabled}
          isUnDeleteDisabled={isUnDeleteDisabled}
          hasCurrentDayHaveOptimizerJob={hasCurrentDayHaveOptimizerJob}
          weekExpanded={weekExpanded}
          toggleWeekExpanded={toggleWeekExpanded}
        />
        <FilteredItemChips />
        {/* Calendar Toolbar */}
        <CalendarToolbar calendarApi={calendarApi} activeDay={activeDay} />
        {/* Alerts */}
        <CalendarAlertBanners
          hasCurrentDayHaveOptimizerJob={hasCurrentDayHaveOptimizerJob}
          currentDaysOptimizerJob={currentDaysOptimizerJob}
          deleteEvents={trash}
          pasteEvents={handlePasteEvents}
          resetAnySelected={resetAnySelected}
        />
        {/* // Oncall */}
        <Fade in={calendarApi ? true : false} timeout={1150}>
          <Stack
            sx={{
              position: 'relative',
              backgroundColor: '#fff',
              height: '100%',
              boxShadow:
                '0px 1px 1px -1px rgba(0,0,0,0.12), 0px 0px 1px 0px rgba(0,0,0,0.07), 0px 1px 2px 0px rgba(0,0,0,0.05)',
            }}
          >
            <div
              ref={ref}
              style={{
                height: '100%',
              }}
            >
              <FullCalendar {...calendarOptions} data-qa='calendar-container' />
            </div>

            <OptimizerJobs disabled={isOptimizerResultsPreviewMode} />
          </Stack>
        </Fade>

        {/* Delete Selected Events Modal */}
        <ModalWrapper
          ref={deleteSelectedEventsModalRef}
          renderModal={(
            isOpen,
            modalProps: IEventsDeleteConfirmModalPropsForRef,
            handleClose,
            handleConfirm,
          ) => (
            <EventsDeleteConfirmModal
              isOpen={isOpen}
              title='Confirm Delete for Selected Events'
              confirmButtonText='Delete'
              confirmButtonColor='error'
              enableTypeToConfirm
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        {/* Updated Selected Events Modal */}
        <ModalWrapper
          ref={updateSelectedEventsModalRef}
          renderModal={(
            isOpen,
            modalProps: ISelectAndConfirmPromiseModalPropsForRef,
            handleClose,
            handleConfirm,
          ) => (
            <SelectAndConfirmPromiseModal
              isOpen={isOpen}
              title='Confirm Update for Selected Events'
              confirmButtonText='Update'
              confirmButtonColor='primary'
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        <ModalWrapper
          ref={changeAffectedEventsModalRef}
          renderModal={(
            isOpen,
            modalProps: IChangeAffectedEventGroupsConfirmModalPropsForRef,
            handleClose,
            handleConfirm,
          ) => (
            <ChangeAffectedEventGroupsConfirmModal
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        <ModalWrapper
          ref={unavailabilityModalRef}
          renderModal={(isOpen, modalProps, handleClose, handleConfirm) => (
            <SelectAndConfirmUnavailabilityModal
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        <ModalWrapper
          ref={availabilityModalRef}
          renderModal={(isOpen, modalProps, handleClose, handleConfirm) => (
            <SelectAndConfirmAvailabilityModal
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        <ModalWrapper
          ref={resourceEditModalRef}
          renderModal={(isOpen, modalProps, handleClose, handleConfirm) => (
            <ResourceEditModal
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        <ModalWrapper
          ref={pasteEventsConfirmModalRef}
          renderModal={(isOpen, modalProps, handleClose, handleConfirm) => (
            <PasteEventsConfirmModal
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={handleConfirm}
              {...modalProps}
            />
          )}
        />

        <ContextMenu ref={contextMenuRef} />
      </Stack>
    );
  },
);

export default memo(CalendarBody);
