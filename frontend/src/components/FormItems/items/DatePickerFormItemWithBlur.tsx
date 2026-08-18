import { useState, useRef } from 'react';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { useFormikContext } from 'formik';
// @ts-ignore
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { ItemProps } from '../../../types/formik/item';

const DatePickerFormItemWithBlur = (props: ItemProps) => {
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

  const sizeInputClassName =
    {
      small: 'form-control-sm',
      large: 'form-control-lg',
    }[size!] || '';

  const form = useFormikContext();
  const { setFieldValue, setFieldTouched, values } = form as any;

  const initialDate = fieldOption
    ? fieldOption[fieldName]
    : values[name] || null;
  // State to track the temporary date selection
  const [selectedDate, setSelectedDate] = useState(initialDate);
  // State to track the confirmed date (after blur)
  const [_, setConfirmedDate] = useState(initialDate);
  // Ref to track if date was changed
  const dateWasChanged = useRef(false);
  const datePickerRef = useRef<any>();

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    dateWasChanged.current = true;
  };

  const handleBlur = () => {
    // Only trigger onChange if the date was actually changed
    if (dateWasChanged.current) {
      setConfirmedDate(selectedDate);
      setFieldValue(name, selectedDate);
      setFieldTouched(name, true, false);
      dateWasChanged.current = false;
    }
  };

  const handleSelect = () => {
    window.setTimeout(() => {
      datePickerRef.current?.input?.blur?.();
    }, 20);
  };

  return (
    <div className='form-group'>
      {!!label && (
        <label className={`${required ? 'required' : ''}`} htmlFor={name}>
          {`${label}${required ? '*' : ''}`}
        </label>
      )}{' '}
      <br />
      <DatePicker
        ref={datePickerRef}
        id={name?.replaceAll('.', '-') + '-user-form'}
        name={name}
        className={`form-control ${sizeInputClassName}`}
        selected={selectedDate}
        onChange={handleDateChange}
        onBlur={handleBlur}
        onSelect={handleSelect}
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
};

export default DatePickerFormItemWithBlur;
