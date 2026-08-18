import * as Yup from 'yup';

export const passwordValidationSchema = Yup.string()
  .required('Please enter a password')
  .min(8, 'Password too short')
  .test(
    'isValidPass',
    'Must contain minimum 8 characters, one uppercase, one lowercase, one number and one symbol',
    (value: any, _) => {
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      /*=========Fixed: /[-!$%^&*()_+|~={}\[\]:";'<>?,.\/@#\\]/.test(value); ============ */
      const hasSymbole = /[-!$%^&*()_+|~=`{}[\]:";'<>?,./@#\\]/.test(value);
      let validConditions = 0;
      const numberOfMustBeValidConditions = 4;
      const conditions = [hasLowerCase, hasUpperCase, hasNumber, hasSymbole];
      conditions.forEach((condition) => (condition ? validConditions++ : null));
      if (validConditions >= numberOfMustBeValidConditions) {
        return true;
      }
      return false;
    },
  );

export const passwordConfirmValidationSchema = Yup.string()
  .required('Passwords must match')
  .oneOf([Yup.ref('password'), null], 'Passwords must match');
