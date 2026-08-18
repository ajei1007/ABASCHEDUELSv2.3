import moment from 'moment';
import { memo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useAppSelector } from 'store/hooks';
import CalendarDayHeaderOptimizerJobChip from '../CalendarDayHeaderOptimizerJobChip';

interface ISlotLabelContentProps {
  calendarViewType: any;
  level?: number;
  text: string;
  timestamp: number;
}

const SlotLabelContent = ({
  calendarViewType,
  level = 0,
  text,
  timestamp,
}: ISlotLabelContentProps) => {
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );
  const defaultActivity = useAppSelector(
    (store) => store.settings.settingValues.defaultActivity,
  );
  const statsViewEnabled = useAppSelector(
    (store) => store.settings.settingValues.statsViewEnabled,
  );
  const storeStatisticsCapacityUsers = useAppSelector(
    (store) => store.calendar.statistics.capacity.users,
  );
  const storeActivityResources = useAppSelector(
    (store) => store.calendar.activityResources,
  );

  const dayMoment = moment.tz(new Date(timestamp), storeSettingsValuesTimezone);
  const monthDay = dayMoment.format('MMM D');
  const weekday = dayMoment.format('ddd');

  return (
    <div>
      {calendarViewType === 'Day_Timeline' &&
        statsViewEnabled &&
        storeActivityResources
          .filter((resource) => resource.id === defaultActivity)
          .map((resource) => {
            const num1 =
              (storeStatisticsCapacityUsers[resource.id] &&
                storeStatisticsCapacityUsers[resource.id].tally[
                  moment(timestamp).valueOf()
                ]) ||
              0;
            const num2 =
              (storeStatisticsCapacityUsers[resource.id] &&
                storeStatisticsCapacityUsers[resource.id].tally[
                  moment(timestamp).add(30, 'minutes').valueOf()
                ]) ||
              0;
            return (
              <Stack flexDirection='row'>
                <Stack px={2}>
                  <Typography color={resource.color} fontSize='0.875rem'>
                    {num1}
                  </Typography>
                </Stack>
                <Stack pl={1}>
                  <Typography color={resource.color} fontSize='0.875rem'>
                    {num2}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
      <Stack direction='row' alignItems='center' gap={1}>
        <Typography
          textTransform='none'
          color='#6b859e'
          fontSize={level === 0 ? '0.875rem' : '0.55rem'}
        >
          {calendarViewType === 'Week_Timeline' ? (
            level === 0 ? (
              <>
                {weekday}
                <br />
                {monthDay}
              </>
            ) : level === 1 ? (
              <Box
                sx={{
                  transform: 'rotate(-50deg) translateY(-2px) translateX(-2px)',
                  transformOrigin: 'center center',
                }}
              >
                {text.slice(0, -1)}
              </Box>
            ) : (
              text
            )
          ) : (
            text.slice(0, -1)
          )}
        </Typography>
        {calendarViewType === 'Week_Timeline' && level === 0 && (
          <CalendarDayHeaderOptimizerJobChip timestamp={timestamp} />
        )}
      </Stack>
    </div>
  );
};

export default memo(SlotLabelContent);
