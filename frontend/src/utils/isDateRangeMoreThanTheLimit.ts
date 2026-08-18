import moment from 'moment';

const isDateRangeMoreThanTheLimit = (sDate: any, eDate: any, limit = 31) => {
  const _startDate = moment(sDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (zz)');
  const _endDate = moment(eDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (zz)');

  const durationInDays = moment(_endDate).diff(_startDate, 'days');
  return durationInDays > limit;
}

export default isDateRangeMoreThanTheLimit;