import moment from 'moment';
import { memo } from 'react';
import { Stack, Typography } from '@mui/material';
import { useAppSelector } from 'store/hooks';
import CalendarDayHeaderOptimizerJobChip from './CalendarDayHeaderOptimizerJobChip';

const CalendarDayHeaderContent = ({
  calendarViewType,
  text,
  timestamp,
}: {
  text: string;
  calendarViewType: string;
  timestamp: number;
}) => {
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const dayMoment = moment.tz(new Date(timestamp), storeSettingsValuesTimezone);
  const monthDay = dayMoment.format('MMM D');
  return (
    <Stack direction='row' alignItems='center' gap={1}>
      <Typography
        textTransform='none'
        lineHeight='1.3 !important'
        color='#6b859e'
        fontSize='0.875rem !important'
      >
        {text}
        <br />
        {monthDay}
      </Typography>
      {calendarViewType === 'resourceTimeGridWeek' && (
        <CalendarDayHeaderOptimizerJobChip timestamp={timestamp} />
      )}
    </Stack>
  );
};

export default memo(CalendarDayHeaderContent);
