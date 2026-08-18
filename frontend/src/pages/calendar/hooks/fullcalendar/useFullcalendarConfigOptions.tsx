import { useCallback, useMemo } from 'react';
import moment from 'moment';

// FullCalendar plugins
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactinPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import scrollgridPlugin from '@fullcalendar/scrollgrid';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';

// Store and hooks
import { useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';

// Helpers and utils
import role_permissions from 'helpers/role_permissions';
import hasUserPermissionOnLockedScheduler from '../../utils/hasUserPermissionOnLockedScheduler';
import getCalendarView from '../../utils/getCalendarView';

// Constants
import { calendarsColor } from '../../constants';

// Contexts
import { useFullcalendarApiContext } from '../../context/FullcalendarApiContext';
import { useCalendarViewContext } from '../../context/CalendarViewContext';

// FullCalendar config hooks
import { useFullcalendarConfigEventOrder } from './useFullcalendarConfigEventOrder';
import { useFullcalendarConfigSlotMinMaxTime } from './useFullcalendarConfigSlotMinMaxTime';
import { useFullcalendarConfigResourceAreaWidth } from './useFullcalendarConfigResourceAreaWidth';
import { useFullcalendarConfigResourceAreaColumns } from './useFullcalendarConfigResourceAreaColumns';
import { useFullcalendarConfigResourceLabelContent } from './useFullcalendarConfigResourceLabelContent';
import { useFullcalendarConfigCustomButtons } from './useFullcalendarConfigCustomButtons';
import { useFullcalendarConfigViews } from './useFullcalendarConfigViews';
import { useFullcalendarConfigDatesSet } from './useFullcalendarConfigDatesSet';
import { useFullcalendarConfigSlotLaneDidMount } from './useFullcalendarConfigSlotLaneDidMount';
import { useFullcalendarConfigSlotLabelContent } from './useFullcalendarConfigSlotLabelContent';
import { useFullcalendarConfigEventResize } from './useFullcalendarConfigEventResize';
import { useFullcalendarConfigEventChange } from './useFullcalendarConfigEventChange';
import { useFullcalendarConfigEventReceive } from './useFullcalendarConfigEventReceive';
import { useFullcalendarConfigEventClick } from './useFullcalendarConfigEventClick';
import { useFullcalendarConfigEventDidMount } from './useFullcalendarConfigEventDidMount';
import { useFullcalendarConfigSelect } from './useFullcalendarConfigSelect';
import { useFullcalendarConfigResourceGroupLabelDidMount } from './useFullcalendarConfigResourceGroupLabelDidMount';
import { useFullcalendarConfigResourceLabelDidMount } from './useFullcalendarConfigResourceLabelDidMount';
import { useFullcalendarConfigResourceLabelWillUnmount } from './useFullcalendarConfigResourceLabelWillUnmount';
import { useFullcalendarConfigResourceLaneDidMount } from './useFullcalendarConfigResourceLaneDidMount';
import { useFullcalendarConfigDayHeaderContent } from './useFullcalendarConfigDayHeaderContent';

// Components
import renderItem from '../../components/fullcalendar/EventItem';
import {
  resourceClassNames,
  resourceLabelClassNames,
  resourceLaneClassNames,
} from 'pages/calendar/utils/resourceClassNames';

const plugins = [
  scrollgridPlugin,
  interactinPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  resourceTimelinePlugin,
  resourceTimeGridPlugin,
  rrulePlugin,
  momentTimezonePlugin,
];

const eventConstraint = {
  startTime: '00:15',
  endTime: '23:45',
};

const dayHeaderFormat = {
  weekday: 'short' as const,
};

const eventClassNames = (args: any) => {
  const { event: calendarEvent } = args;

  let colorName =
    calendarsColor[
      calendarEvent._def.extendedProps.calendar as keyof typeof calendarsColor
    ];
  colorName = calendarEvent._def.extendedProps.newColor;
  if (colorName && colorName[0] === '#') {
    colorName = colorName.slice(1);
  }
  let names = `bg-light-${colorName}`;
  if (calendarEvent.visible) {
    names = `bg-light-visible-${colorName}`;
  }
  if (calendarEvent.extendedProps.eventStatusPendingCancellation) {
    names += ` pendingRequest`;
  }
  if (calendarEvent.extendedProps.eventStatusPendingCancellation) {
    names += ` pendingCancelation`;
  }
  names += ` event-id-${calendarEvent?.id}`;
  return names;
};

export function useFullcalendarConfigOptions({
  calendarRef,
  hasCurrentDayHaveOptimizerJob,
  handleClickEditButton,
  handleReplaceEvents,
  showEditEventSidebar,
}: {
  calendarRef: React.RefObject<any>;
  hasCurrentDayHaveOptimizerJob: boolean;
  handleClickEditButton: (id: string, resourceType: string) => void;
  handleReplaceEvents: (eventInfo: any) => void;
  showEditEventSidebar: (event: any) => void;
}) {
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const schedulerLocked = useAppSelector(
    (state) => state.settings.schedulerLocked,
  );
  const settingsTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const settingsWeekends = useAppSelector(
    (state) => state.settings.settingValues?.weekends,
  );
  const isolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );

  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );

  // Context for active day and view
  const { activeDay, activeView } = useCalendarViewContext();

  // Context for FullCalendar API
  const { updateCalendarSize } = useFullcalendarApiContext();

  const isSchedulerEditable = useMemo(
    () => hasUserPermissionOnLockedScheduler(currentUser, schedulerLocked),
    [currentUser, schedulerLocked],
  );

  const timeZone = useMemo(
    () =>
      settingsTimezone === Intl.DateTimeFormat().resolvedOptions().timeZone
        ? 'local'
        : settingsTimezone,
    [settingsTimezone],
  );

  const eventOrder = useFullcalendarConfigEventOrder();
  const { slotMinTime, slotMaxTime } = useFullcalendarConfigSlotMinMaxTime();
  const resourceAreaWidth = useFullcalendarConfigResourceAreaWidth();
  const resourceLabelContent = useFullcalendarConfigResourceLabelContent({
    hasCurrentDayHaveOptimizerJob,
    handleClickEditButton,
  });
  const { resourceAreaColumns, eventSortOrder } =
    useFullcalendarConfigResourceAreaColumns({
      resourceLabelContent,
    });

  const { customButtons, duration } = useFullcalendarConfigCustomButtons();

  const views = useFullcalendarConfigViews({
    duration,
  });

  const datesSet = useFullcalendarConfigDatesSet();

  const slotLaneDidMount = useFullcalendarConfigSlotLaneDidMount({
    duration,
  });
  const slotLabelContent = useFullcalendarConfigSlotLabelContent();

  const { eventResizeStart, eventResizeStop, eventResize } =
    useFullcalendarConfigEventResize({
      handleReplaceEvents,
    });

  const { eventDragStart, eventDragStop, eventChange } =
    useFullcalendarConfigEventChange({
      handleReplaceEvents,
    });

  const eventReceive = useFullcalendarConfigEventReceive({
    hasCurrentDayHaveOptimizerJob,
  });

  const eventClick = useFullcalendarConfigEventClick({
    hasCurrentDayHaveOptimizerJob,
    showEditEventSidebar,
  });

  const eventDidMount = useFullcalendarConfigEventDidMount();

  const select = useFullcalendarConfigSelect({
    hasCurrentDayHaveOptimizerJob,
  });

  const resourceGroupLabelDidMount =
    useFullcalendarConfigResourceGroupLabelDidMount();

  const resourceGroupLabelContent = useCallback((arg: any) => {
    const groupName = arg.groupValue?.split('|')?.[0] || '';
    return <span>{groupName}</span>;
  }, []);

  const resourceLaneDidMount = useFullcalendarConfigResourceLaneDidMount();
  const resourceLabelDidMount = useFullcalendarConfigResourceLabelDidMount();
  const resourceLabelWillUnmount =
    useFullcalendarConfigResourceLabelWillUnmount();

  const dayHeaderContent = useFullcalendarConfigDayHeaderContent();

  const eventsSet = useLatestCallback(() => updateCalendarSize(400));
  const resourcesSet = useLatestCallback(() => updateCalendarSize(400));

  /* FullCalendar Config */
  const calendarOptions = {
    ref: calendarRef,
    resourceLabelClassNames,
    resourceClassNames,
    resourceLaneClassNames,
    plugins,
    filterResourcesWithEvents: true,
    timeZone,
    headerToolbar: false as const,
    editable:
      isSchedulerEditable && !!role_permissions(currentUser, 'editEvent'),
    selectable: !!role_permissions(currentUser, 'createEvent'),
    eventResizableFromStart: true,
    eventConstraint,
    eventLongPressDelay: 30000,
    selectLongPressDelay: 500,
    initialView: getCalendarView(activeView, activeDay) ?? 'Day_Timeline',
    dragScroll: true,
    weekends: settingsWeekends,
    slotMinWidth: 40,
    refetchResourcesOnNavigate: true,
    eventOrder,
    slotMinTime,
    slotMaxTime,
    eventInteractive: false,
    resourceAreaWidth,
    stickyHeaderDates: true,
    resourceAreaColumns:
      role_permissions(currentUser, 'dataAccess') !== 'User'
        ? (resourceAreaColumns as any)
        : undefined,
    scrollTime: '05:00:00',
    dayMaxEventRows: true,
    navLinks: true,
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    displayEventTime: true,
    nowIndicator: timeZone === 'local',
    displayEventEnd: true,
    resourceOrder: eventSortOrder,
    resourcesInitiallyExpanded: false,
    height: '100%',
    customButtons,
    dayHeaderFormat,
    views,
    initialDate: moment.utc(storeCalendarStart).format('YYYY-MM-DD'),
    ...(role_permissions(currentUser, 'dataAccess') !== 'User' &&
      isolatedResources.length !== 1 && {
        resourceGroupField: 'groupId',
      }),
    datesSet,
    slotLabelContent,
    slotLaneDidMount,
    eventResizeStart,
    eventResizeStop,
    eventResize,
    eventDragStart,
    eventDragStop,
    eventChange,
    eventReceive,
    eventContent: renderItem,
    eventClassNames,
    eventClick,
    eventDidMount,
    select,
    // TODO
    // Resource functions
    resourceGroupLabelDidMount,
    resourceGroupLabelContent,
    resourceLaneDidMount,
    resourceLabelDidMount,
    resourceLabelWillUnmount,
    resourceLabelContent,
    dayHeaderContent,
    eventsSet,
    resourcesSet,
  };

  return calendarOptions;
}
