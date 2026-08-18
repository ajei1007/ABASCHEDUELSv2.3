import moment from 'moment';

const convertDateToTodaysDate = (date: string) => {
  const _date = moment(date)
  return moment().set({
    hour: _date.hour(),
    minute: _date.minute(),
    second: _date.second(),
    millisecond: _date.millisecond()
  }).toDate();
}

export default convertDateToTodaysDate;