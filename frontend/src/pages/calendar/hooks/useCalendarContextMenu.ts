import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppSelector } from 'store/hooks';
import { selectCalendarSupervisionEventsMap } from 'store/slices/calendar/selectors';
import { useCalendarOptimizerJobUtilsContext } from '../context/CalendarOptimizerJobUtilsContext';
import type {
  IContextMenuRef,
  IContextMenuProps,
} from 'components/ContextMenu';
import role_permissions from 'helpers/role_permissions';

function createBgEventContextMenuProps({
  currentUser,
  mouseX,
  mouseY,
  hasSelectedEvents,
  hasRunningOptimizerJob,
}: {
  currentUser: any;
  mouseX: number;
  mouseY: number;
  hasSelectedEvents: boolean;
  hasRunningOptimizerJob: boolean;
}): IContextMenuProps {
  return {
    anchorReference: 'anchorPosition',
    anchorPosition: {
      left: mouseX,
      top: mouseY,
    },
    options: [
      {
        label: 'Paste',
        icon: ContentPasteIcon,
        value: 'paste',
        hasAccess: Boolean(role_permissions(currentUser, 'createEvent')),
        disabled: !hasSelectedEvents || hasRunningOptimizerJob,
      },
      {
        label: 'Copy/Select All',
        icon: CopyAllIcon,
        value: 'copyAll',
        hasAccess: Boolean(
          role_permissions(currentUser, 'createEvent') ||
            role_permissions(currentUser, 'editEvent') ||
            role_permissions(currentUser, 'deleteEvent'),
        ),
      },
      {
        label: 'Unselect All',
        icon: CloseIcon,
        value: 'unselectAll',
        disabled: !hasSelectedEvents,
      },
      {
        label: 'Delete All Selected',
        icon: DeleteIcon,
        value: 'deleteAll',
        hasAccess: Boolean(role_permissions(currentUser, 'deleteEvent')),
        disabled: !hasSelectedEvents || hasRunningOptimizerJob,
      },
    ].filter((opt) => opt.hasAccess !== false), // Filter out options without access
  };
}

function createEventContextMenuProps({
  currentUser,
  mouseX,
  mouseY,
  isSelected,
  isDeleted,
  hasRunningOptimizerJob,
}: {
  currentUser: any;
  mouseX: number;
  mouseY: number;
  isSelected: boolean;
  isDeleted: boolean;
  hasRunningOptimizerJob: boolean;
}): IContextMenuProps {
  return {
    anchorReference: 'anchorPosition',
    anchorPosition: {
      left: mouseX,
      top: mouseY,
    },
    options: [
      {
        label: !isSelected
          ? isDeleted
            ? 'Select'
            : 'Copy/Select'
          : 'Unselect',
        icon: !isSelected ? ContentCopyIcon : CloseIcon,
        value: 'copy',
        hasAccess: Boolean(
          role_permissions(currentUser, 'createEvent') ||
            role_permissions(currentUser, 'editEvent') ||
            role_permissions(currentUser, 'deleteEvent'),
        ),
      },
      {
        label: !isDeleted ? 'Edit' : 'Show',
        icon: !isDeleted ? EditIcon : VisibilityIcon,
        value: 'edit',
        hasAccess: !isDeleted
          ? Boolean(role_permissions(currentUser, 'editEvent'))
          : true,
        disabled: isSelected || hasRunningOptimizerJob,
      },
      ...(!isDeleted
        ? [
            {
              label: 'Delete',
              icon: DeleteIcon,
              value: 'delete',
              hasAccess: Boolean(role_permissions(currentUser, 'deleteEvent')),
              disabled: isSelected || hasRunningOptimizerJob,
            },
          ]
        : []),
    ].filter((opt) => opt.hasAccess !== false), // Filter out options without access
  };
}

function useEventHandlers({
  calendarApi,
  contextMenuRef,
  copyActive,
  selectedEvents,
  hasCurrentDayHaveOptimizerJob,
  setCopyActive,
  setSelectedEvents,
  toggleSelectedEvent,
  showEditEventSidebar,
  pasteEvents,
  deleteEvents,
}: {
  calendarApi: any;
  contextMenuRef: RefObject<IContextMenuRef>;
  copyActive: boolean;
  selectedEvents: any[];
  hasCurrentDayHaveOptimizerJob: boolean;
  setCopyActive: (active: boolean) => void;
  setSelectedEvents: (events: any[]) => void;
  toggleSelectedEvent: (event: any) => void;
  showEditEventSidebar: (event: any) => void;
  pasteEvents: () => void;
  deleteEvents: (events: any[]) => void;
}) {
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const storeEvents = useAppSelector((state) => state.calendar.events);
  const supervisionEventsMap = useAppSelector(
    selectCalendarSupervisionEventsMap,
  );

  const { hasOptimizerJobRunning } = useCalendarOptimizerJobUtilsContext();

  const evaluateCopyActive = useLatestCallback(() => {
    if (selectedEvents.length === 0) {
      setCopyActive(false);
    }
  });

  const handleCopyAll = useLatestCallback(() => {
    let events: any[] = [];
    const calendarEvents = calendarApi?.getEvents() || [];
    storeEvents.forEach((event) => {
      const _events = calendarEvents.filter((ev: any) => {
        return (
          ev &&
          ev?.id === event?.id &&
          // Exclude supervision events
          !supervisionEventsMap.has(ev.id)
        );
      });
      if (_events.length > 0) {
        events = [...events, ..._events];
      }
    });

    if (events.length === 0) {
      return;
    }

    if (!copyActive) {
      setCopyActive(true);
    }
    setSelectedEvents(events);
  });

  const handleUnselectAll = useLatestCallback(() => {
    if (copyActive) {
      setCopyActive(false);
    }
    setSelectedEvents([]);
  });

  const handleDeleteAll = useLatestCallback(() => {
    deleteEvents(selectedEvents);
  });

  const handleBgEventContextMenu = async ({
    mouseX,
    mouseY,
  }: {
    mouseX: number;
    mouseY: number;
  }) => {
    if (!contextMenuRef.current) {
      return;
    }

    const menuProps = createBgEventContextMenuProps({
      currentUser,
      hasSelectedEvents: selectedEvents.length > 0,
      hasRunningOptimizerJob: hasCurrentDayHaveOptimizerJob,
      mouseX,
      mouseY,
    });

    if (
      !Array.isArray(menuProps.options) ||
      menuProps.options.length === 0 ||
      menuProps.options.every((opt) => opt.disabled)
    ) {
      return;
    }

    const result = await contextMenuRef.current.show(menuProps);
    if (!result.isSelected) {
      return;
    }

    switch (result.payload) {
      case 'paste':
        pasteEvents();
        break;

      case 'copyAll':
        handleCopyAll();
        break;

      case 'unselectAll':
        handleUnselectAll();
        break;

      case 'deleteAll':
        handleDeleteAll();
        break;

      default:
        break;
    }
  };

  const handleCopy = useLatestCallback((event: any) => {
    if (!copyActive) {
      setCopyActive(true);
    }
    toggleSelectedEvent(event);
    // evaluate copyActive after all selected events are unselected
    window.setTimeout(evaluateCopyActive, 5);
  });

  const handleEventContextMenu = async ({
    eventEl,
    eventId,
    mouseX,
    mouseY,
  }: {
    eventEl: Element;
    eventId: string | null;
    mouseX: number;
    mouseY: number;
  }) => {
    if (!contextMenuRef.current) {
      return;
    }

    const event = eventId
      ? calendarApi?.getEvents().find((e: any) => e.id === eventId) || null
      : null;
    if (
      !event ||
      supervisionEventsMap.has(event.id) ||
      ['t', 'n'].includes(event?.extendedProps?.av)
    ) {
      return;
    }

    const isSelected = selectedEvents.some(
      (p) =>
        p?.id === event?.id &&
        p?.extendedProps?.updatedBy === event?.extendedProps?.updatedBy,
    );
    const isDeleted = !!event.extendedProps?.deletedAt;

    eventEl.classList.add('eventContextMenuShown');
    try {
      const menuProps = createEventContextMenuProps({
        currentUser,
        mouseX,
        mouseY,
        isSelected,
        isDeleted,
        hasRunningOptimizerJob:
          hasCurrentDayHaveOptimizerJob || hasOptimizerJobRunning(event),
      });

      if (
        !Array.isArray(menuProps.options) ||
        menuProps.options.length === 0 ||
        menuProps.options.every((opt) => opt.disabled)
      ) {
        return;
      }

      const result = await contextMenuRef.current.show(menuProps);
      if (!result.isSelected) {
        return;
      }

      switch (result.payload) {
        case 'copy':
          handleCopy(event);
          break;

        case 'edit':
          if (!isSelected) {
            showEditEventSidebar(event);
          }
          break;

        case 'delete':
          if (!isSelected) {
            deleteEvents([event]);
          }
          break;

        default:
          break;
      }
    } finally {
      eventEl.classList.remove('eventContextMenuShown');
    }
  };

  return {
    handleBgEventContextMenu,
    handleEventContextMenu,
  };
}

export function useCalendarContextMenu({
  calendarApi,
  copyActive,
  selectedEvents,
  isOptimizerResultsPreviewMode,
  hasCurrentDayHaveOptimizerJob,
  setCopyActive,
  setSelectedEvents,
  toggleSelectedEvent,
  showEditEventSidebar,
  pasteEvents,
  deleteEvents,
}: {
  calendarApi: any;
  copyActive: boolean;
  selectedEvents: any[];
  isOptimizerResultsPreviewMode: boolean;
  hasCurrentDayHaveOptimizerJob: boolean;
  setCopyActive: (active: boolean) => void;
  setSelectedEvents: (events: any[]) => void;
  toggleSelectedEvent: (event: any) => void;
  showEditEventSidebar: (event: any) => void;
  pasteEvents: () => void;
  deleteEvents: (events: any[]) => void;
}) {
  const contextMenuRef = useRef<IContextMenuRef>(null);

  const { handleBgEventContextMenu, handleEventContextMenu } = useEventHandlers(
    {
      contextMenuRef,
      calendarApi,
      copyActive,
      selectedEvents,
      hasCurrentDayHaveOptimizerJob,
      setCopyActive,
      setSelectedEvents,
      toggleSelectedEvent,
      showEditEventSidebar,
      pasteEvents,
      deleteEvents,
    },
  );

  const handleCalendarContextMenu = useLatestCallback((e: MouseEvent) => {
    if (!contextMenuRef.current || isOptimizerResultsPreviewMode) {
      return;
    }

    const target = e.target as HTMLElement;
    const eventEl = target?.closest('.fc-event');
    if (!eventEl) {
      return;
    }

    if (eventEl.classList.contains('fc-bg-event')) {
      e.preventDefault();
      handleBgEventContextMenu({
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
      return;
    }

    if (
      ['fc-timeline-event', 'fc-timegrid-event'].some((cls) =>
        eventEl.classList.contains(cls),
      )
    ) {
      e.preventDefault();
      const eventId = eventEl.getAttribute('data-event-id');
      handleEventContextMenu({
        eventEl,
        eventId,
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
    }
  });

  useEffect(() => {
    if (!calendarApi) {
      return;
    }

    const calendarEl = calendarApi.el as HTMLElement;
    if (!calendarEl) {
      return;
    }

    calendarEl.addEventListener('contextmenu', handleCalendarContextMenu);
    return () => {
      calendarEl.removeEventListener('contextmenu', handleCalendarContextMenu);
    };
  }, [calendarApi, handleCalendarContextMenu]);

  return {
    contextMenuRef,
  };
}
