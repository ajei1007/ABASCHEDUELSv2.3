/* eslint-disable @typescript-eslint/no-unused-vars */
import PreparedValues from 'components/FormItems/preparedValues';
import moment from 'moment-timezone';
import { convertToSpecificTimezone } from 'utils/timezones';
import availabilitiesFields from './availabilitiesFields';
import { weekdayOptions } from 'constants/recurrenceOptions';

const EVERY_DAY_IDS = weekdayOptions.map((w) => w.value);

const formatAvailabilities = (av: any) => {
  const preparedValues = PreparedValues(availabilitiesFields, av || {});
  const oncall = av.oncall;
  // @ts-ignore
  let branch = preparedValues.branch;
  if (!oncall) {
    //@ts-ignore
    branch = null;
  }
  const ALLDAY_START = moment
    .tz(av.timezone.id)
    .set({ hour: 5, minute: 0, second: 0, millisecond: 0 });
  const ALLDAY_END = moment
    .tz(av.timezone.id)
    .set({ hour: 22, minute: 0, second: 0, millisecond: 0 });

  let forever = av.forever;
  let allDay = av.allDay;
  let everyDay = av.everyDay;

  forever = forever === true || forever === 'true';
  // @ts-ignore
  let preparedStartRange = preparedValues.startRange;
  // @ts-ignore
  let preparedEndRange = preparedValues.endRange;

  if (forever) {
    preparedStartRange = '2000-01-01';
    preparedEndRange = '2100-01-01';
  } else {
    preparedStartRange = moment(av.startRange).format('YYYY-MM-DD');
    preparedEndRange = moment(av.endRange).add(1, 'day').format('YYYY-MM-DD');
  }

  const rawStartTime = allDay ? ALLDAY_START : av.startTime;
  const rawEndTime = allDay ? ALLDAY_END : av.endTime;

  const startTime = av?.timezone?.id
    ? convertToSpecificTimezone(rawStartTime, av.timezone.id)
    : moment(rawStartTime, 'HH:mm').format();

  const endTime = av?.timezone?.id
    ? convertToSpecificTimezone(rawEndTime, av.timezone.id)
    : moment(rawEndTime, 'HH:mm').format();

  let days = av?.days;
  if (everyDay) {
    days = EVERY_DAY_IDS;
  }
  return {
    ...preparedValues,
    startRange: preparedStartRange,
    endRange: preparedEndRange,
    startTime,
    endTime,
    branch,
    forever,
    allDay,
    ...(everyDay ? { days: EVERY_DAY_IDS } : {}),
  };
};

export default formatAvailabilities;
