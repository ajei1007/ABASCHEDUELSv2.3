import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { useFormikContext } from 'formik';
// @ts-ignore
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { ItemProps } from '../../../types/formik/item';

const DatePickerFormItem = (props: ItemProps) => {
  const {
    name,
    schema,
    size,
    placeholder,
    autoFocus,
    autoComplete,
    inputProps,
    required = false,
    fieldOption,
    fieldName,
    showTimeSelectOnly = false,
  } = props;

  const namesArr = name?.split('.');
  const updatedName = namesArr ? namesArr[namesArr?.length - 1] : '';
  const { label } = schema[updatedName!];

  const sizeInputClassName = {
    small: 'form-control-sm',
    large: 'form-control-lg',
  }[size!] || '';

  const form = useFormikContext();
  const { setFieldValue, setFieldTouched, values } = form as any;

  return (
    <div className='form-group'>
      {!!label && (
        <label className={`${required ? 'required' : ''}`} htmlFor={name}>
          {`${label}${required ? '*' : ''}`}
        </label>
      )}{' '}
      <br />
      <DatePicker
        id={name?.replaceAll('.', '-') + '-user-form'}
        name={name}
        className={`form-control ${sizeInputClassName}`}
        selected={fieldOption ? fieldOption[fieldName] : values[name] || null}
        onChange={(value) => {
          // Set the value and immediately mark the field as touched
          setFieldValue(name, value);
          setFieldTouched(name, true, false); // false prevents revalidation
        }}
        onBlur={() => setFieldTouched(name, true)} // Ensure field is touched on blur
        placeholderText={placeholder || ''}
        autoFocus={autoFocus || undefined}
        autoComplete={autoComplete || undefined}
        dateFormat={showTimeSelectOnly ? 'h:mm aa' : 'MM-dd-yyyy'}
        timeIntervals={15}
        showTimeSelect={showTimeSelectOnly}
        showTimeSelectOnly={showTimeSelectOnly}
        timeCaption='Time'
        {...inputProps}
      />
      {/* Render errors */}
      <CustomErrorMessage name={name} form={form} />
    </div>
  );
}

export default DatePickerFormItem;
