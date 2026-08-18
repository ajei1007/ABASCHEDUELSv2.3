import data, { type TimezoneType } from 'constants/timezonesArr';
import moment from 'moment-timezone';

export const convertToSpecificTimezone = (time: any, tz: string) => {
  const convertedTimeZone = moment(time).tz(tz, true).format();
  return convertedTimeZone;
};

export const getTimeZones = (): TimezoneType[] => {
  return data;
};

export const getTimezoneObjectFromValue = (val: string | undefined | null) => {
  if (!val)
    return {
      ...usersTimeZone(),
      value: usersTimeZone().id,
    };
  const timezones = getTimeZones().map((val) => ({
    ...val,
    value: val.id,
  }));
  const selectedBranchTimezone = timezones.find((t) => t.id === val) ?? null;
  return selectedBranchTimezone ?? null;
};

export const usersTimeZone = () => {
  const tz: any = getTimeZones().find(
    (t: TimezoneType) => t.id === moment.tz.guess(),
  );
  return tz ?? '';
};
