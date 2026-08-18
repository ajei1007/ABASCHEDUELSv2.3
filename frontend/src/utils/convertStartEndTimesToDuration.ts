import moment from 'moment';

const convertStartEndTimesToDuration = (start: string, end: string) => {
  const duration = moment.duration(moment(end).diff(start));
  // duration in hours
  const hours = duration.asHours();
  let formattedHours = '';
  if (hours >= 1) {
    formattedHours = hours ? Math.floor(hours) + ' hr' + (hours > 1 ? 's ' : '') : '';
  }
  // duration in minutes
  const minutes = duration.asMinutes() % 60;
  const formattedMinutes = minutes
    ? minutes + ' min' + (minutes > 1 ? 's ' : '')
    : '';
  return `${formattedHours} ${formattedMinutes}`;
};

export default convertStartEndTimesToDuration;