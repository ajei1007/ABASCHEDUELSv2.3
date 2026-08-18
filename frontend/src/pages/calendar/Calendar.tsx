// Third-party styles
import 'react-datepicker/dist/react-datepicker.css';

// Third-party components
import { Stack } from '@mui/material';

// Contexts
import { useCalendarSelectedResourcesContext } from './context/CalendarSelectedResourcesContext';

// Hooks
import { usePreserveScrollPositionEffect } from './hooks/usePreserveScrollPositionEffect';
import { useCalendarDataFetch } from './hooks/useCalendarDataFetch';
import { useCalendarNpsSurveyTrigger } from './hooks/useCalendarNpsSurveyTrigger';
import { useCalendarOptimizerPreviewGuard } from './hooks/useCalendarOptimizerPreviewGuard';
import { useAutoSelectFirstPersonInMonthView } from './hooks/useAutoSelectFirstPersonInMonthView';
import { useCalendarViewSwitchOnBranchHierarchyChange } from './hooks/useCalendarViewSwitchOnBranchHierarchyChange';

// Components
import CalendarBody from './components/CalendarBody';
import AddEventSidebar from './components/AddEventSidebar';
import CalendarRightSideBar from './components/CalendarRightSideBar/CalendarRightSideBar';
import CalendarBackdropLoadings from './components/CalendarBackdropLoadings/CalendarBackdropLoadings';
import CalendarEventOperationsFailedPopup from './components/CalendarEventOperationsFailedPopup';
import CalendarModals from './components/CalendarModals';

// Hooks
import { useAppCrash } from 'hooks/useAppCrash';

const Calendar = () => {
  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  // Custom hook to fetch initial data for the calendar
  useCalendarDataFetch();

  // Custom hook to trigger NPS survey check when the calendar page mounts
  useCalendarNpsSurveyTrigger();

  // Custom hook to handle optimizer preview mode and navigation blocking
  useCalendarOptimizerPreviewGuard({
    onModeActivated: resetAnySelected,
  });

  // Custom hook to automatically select the first available person in month view
  useAutoSelectFirstPersonInMonthView();

  // Custom hook to switch calendar view when branch hierarchy changes
  useCalendarViewSwitchOnBranchHierarchyChange();

  // WORKAROUND: Preserve scroll position when sidebar opens/closes
  // This prevents other components from resetting the page scroll to top
  usePreserveScrollPositionEffect();

  // Crash hook for testing error boundaries,
  // NOTE: works only in dev or beta environments
  useAppCrash({
    crashFnName: 'crashCalendar',
    errorMessage: 'Calendar crashed!',
  });

  return (
    <>
      {/* Backdrop loadings */}
      <CalendarBackdropLoadings />

      {/* Popup for retrying failed operations */}
      <CalendarEventOperationsFailedPopup />

      {/* Modals */}
      <CalendarModals />

      <div className='app-calendar overflow-hidden' tabIndex={0}>
        <Stack
          direction='row'
          justifyContent='space-between'
          height='900px'
          spacing={2}
        >
          <Stack flex={1} boxSizing='border-box' overflow='hidden'>
            <CalendarBody />
          </Stack>
          <CalendarRightSideBar />
        </Stack>
      </div>

      <AddEventSidebar />
    </>
  );
};

export default Calendar;
