import moment from 'moment';

// Compare start time and end time
const isSameOrBefore = (startTime: any, endTime: any) => {
  return moment(startTime).isBefore(moment(endTime));
};

export default isSameOrBefore;