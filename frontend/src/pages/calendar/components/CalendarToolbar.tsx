import moment from 'moment';
import { useMemo, memo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { CustomIconButton, iconProps } from './ParameterButtons';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setEventsLoading,
  setSandboxMode,
  setIncludeDeleted,
} from 'store/slices/calendar/actions';
import { fetchEvents, fetchStatistics } from 'store/slices/calendar/thunks';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import role_permissions from 'helpers/role_permissions';

interface ICalendarToolbarProps {
  calendarApi: any;
  activeDay: string;
}

const CalendarToolbar = memo(
  ({ calendarApi, activeDay }: ICalendarToolbarProps) => {
    const currentUser = useAppSelector((store) => store.auth.currentUser);
    const dispatch = useAppDispatch();
    const sandboxMode = useAppSelector((state) => state.calendar.sandboxMode);
    const includeDeleted = useAppSelector(
      (state) => state.calendar.includeDeleted,
    );
    const eventsLoading = useAppSelector(
      (state) => state.calendar.eventsLoading,
    );
    const settingValuesStatsViewEnabled = useAppSelector(
      (state) => state.settings.settingValues.statsViewEnabled,
    );
    const calendarStart = useAppSelector(
      (state) => state.calendar.calendar_start,
    );
    const calendarEnd = useAppSelector((state) => state.calendar.calendar_end);
    const timezone = useAppSelector(
      (state) => state.settings.settingValues.timezone,
    );
    const isOptimizerResultsPreviewMode = useAppSelector(
      isOptimizerResultsPreviewModeSelector,
    );

    const handleChangeSandboxMode = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      dispatch(setEventsLoading(true));
      const isChecked = event.target.checked;
      dispatch(setSandboxMode(isChecked));

      await dispatch(fetchEvents({ bol: false }));
      if (settingValuesStatsViewEnabled) {
        dispatch(
          fetchStatistics({
            start: calendarStart,
            end: calendarEnd,
          }),
        );
      }

      dispatch(setEventsLoading(false));
    };

    const handleChangeIncludeDeleted = async (event: any) => {
      dispatch(setEventsLoading(true));
      const isChecked = event.target.checked;
      dispatch(setIncludeDeleted(isChecked));

      await dispatch(fetchEvents({ bol: false }));
      if (settingValuesStatsViewEnabled) {
        dispatch(
          fetchStatistics({
            start: calendarStart,
            end: calendarEnd,
          }),
        );
      }
      dispatch(setEventsLoading(false));
    };

    const differentTimezone = useMemo(() => {
      if (Intl.DateTimeFormat().resolvedOptions().timeZone === timezone) {
        return '';
      }
      return timezone;
    }, [timezone]);

    const dateDisplay = useMemo(() => {
      if (!calendarApi) return '';
      const startDate = moment(calendarStart).tz(timezone);
      const endDate = moment(calendarEnd).tz(timezone);

      let displayDate = '';

      if (activeDay === 'Week') {
        displayDate = `${startDate.format('dddd, MMM D')} - ${endDate
          .subtract(1, 'day')
          .format('dddd, MMM D, YYYY')}`;
      } else if (activeDay === 'Month') {
        displayDate = moment.utc(calendarApi.getDate()).format('MMMM, YYYY');
      } else {
        displayDate = startDate.format('dddd, MMM D, yyyy');
      }
      return displayDate;
    }, [activeDay, timezone, calendarApi, calendarStart, calendarEnd]);

    if (!calendarApi) {
      return null;
    }

    const handlePrev = () => {
      calendarApi.prev();
    };
    const handleToday = () => {
      calendarApi.today();
    };
    const handleNext = () => {
      calendarApi.next();
    };
    return (
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        width='100%'
        mb={1}
      >
        <Stack className='control-button-group' direction='row'>
          <CustomIconButton
            name={'Previous Day'}
            onClick={handlePrev}
            disabled={eventsLoading || isOptimizerResultsPreviewMode}
          >
            <ChevronLeftRoundedIcon {...iconProps()} />
          </CustomIconButton>
          <CustomIconButton
            onClick={handleToday}
            style={{ color: '#6b859e' }}
            disabled={eventsLoading || isOptimizerResultsPreviewMode}
          >
            <Typography fontSize='0.875rem'>Today</Typography>
          </CustomIconButton>
          <CustomIconButton
            name='Next Day'
            onClick={handleNext}
            disabled={eventsLoading || isOptimizerResultsPreviewMode}
          >
            <ChevronRightRoundedIcon {...iconProps()} />
          </CustomIconButton>
        </Stack>
        <Stack>
          {differentTimezone && (
            <Typography textAlign='center' fontSize='.75rem' color='#ff4b23'>
              Timezone: {differentTimezone}
            </Typography>
          )}
          <Typography variant='h6' fontWeight='600'>
            {dateDisplay}
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}>
          <Stack direction='row' alignItems='center' spacing={1}>
            {role_permissions(currentUser, 'createEvent') && (
              <>
                <CustomSwitch
                  checked={sandboxMode}
                  disabled={isOptimizerResultsPreviewMode}
                  onChange={handleChangeSandboxMode}
                  data-qa='navbar-sandbox-toggle'
                />
                <Typography color='#6b859e' fontSize='0.875rem'>
                  Sandbox Mode
                </Typography>
              </>
            )}
          </Stack>
        </Box>
      </Stack>
    );
  },
);

export type { ICalendarToolbarProps };
export default CalendarToolbar;
