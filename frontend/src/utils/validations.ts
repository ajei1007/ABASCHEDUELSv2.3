import moment from 'moment';

export const validateEmail = (email: string) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
export const isValidDateTime = (dateTime: any) => {
  return moment(dateTime, 'MM-DD-YYYYY LT', true).isValid();
}
