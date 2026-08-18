import moment from 'moment';
import { Stack } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSelectedEvent } from 'store/slices/calendar/actions';
import { selectRightSidebarOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleRightSidebarOpen,
  toggleEventFormDrawerOpen,
} from 'store/slices/calendarOverlayingPanels/actions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import CustomButton from 'components/Button';
import { OpenIconButton } from '../OpenIconButton';
import { CustomIconButton } from '../ParameterButtons';

export const SideBarHead = () => {
  const dispatch = useAppDispatch();

  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );

  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings?.settingValues?.timezone,
  );

  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const sidebarOpen = useAppSelector(selectRightSidebarOpen);

  const toggleSidebarOpen = () => {
    dispatch(toggleRightSidebarOpen());
  };

  const handleCreateEvent = () => {
    const weekday = moment(storeCalendarStart)
      .tz(
        storeSettingsValuesTimezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
      .weekday();
    const startTime = moment(storeCalendarStart)
      .tz(
        storeSettingsValuesTimezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
      .startOf('day')
      .add(8, 'hours')
      .format();
    const endTime = moment(storeCalendarStart)
      .tz(
        storeSettingsValuesTimezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
      .startOf('day')
      .add(9, 'hours')
      .format();

    const event = {
      title: '',
      start: startTime,
      end: endTime,
      allDay: false,
      url: '',
      extendedProps: {
        calendar: '',
        guests: [],
        location: '',
        description: '',
      },
      clients: [],
      employees: [],
      daysofweek: [weekday],
      users: [],
    };
    dispatch(setSelectedEvent(event));
    dispatch(toggleEventFormDrawerOpen());
  };
  return (
    <Stack
      alignItems={!sidebarOpen ? 'flex-start' : 'center'}
      justifyContent='flex-start'
      direction={sidebarOpen ? 'row' : 'column'}
      spacing={1}
    >
      <OpenIconButton
        sidebarOpen={sidebarOpen}
        toggleSidebarOpen={toggleSidebarOpen}
        disabled={isOptimizerResultsPreviewMode}
      />
      {!sidebarOpen ? (
        <CustomIconButton
          name='Create Event'
          onClick={handleCreateEvent}
          id='ToggleSideBarControlButtonGroup'
          className={`toggle-sidebar-button-add`}
          disabled={isOptimizerResultsPreviewMode}
          style={{
            zIndex: '1',
            background: '#fff',
            borderRadius: '8px',
            transition: 'right 0.2s',
          }}
        >
          <AddOutlinedIcon
            style={{
              color: sidebarOpen ? '#4d53e0' : 'inherit',
            }}
          />
        </CustomIconButton>
      ) : (
        <CustomButton
          variant='outlined'
          startIcon={<AddOutlinedIcon />}
          disabled={isOptimizerResultsPreviewMode}
          onClick={handleCreateEvent}
          sx={{
            width: '100%',
            border: 'none',
            ':hover': {
              border: 'none',
              background: 'white !important',
            },
          }}
          data-qa='sidebar-create-event'
        >
          Create Event
        </CustomButton>
      )}
    </Stack>
  );
};

export default SideBarHead;
