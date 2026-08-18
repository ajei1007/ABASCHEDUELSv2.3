import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Button, Tooltip } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePickerInput = forwardRef(({ value, disabled = false, onClick }, ref) => (
  <Tooltip arrow title='Date' placement='top'>
    <Button
      className='custom-datepicker-input'
      startIcon={<CalendarMonthOutlinedIcon />}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
    >
      {value}
    </Button>
  </Tooltip>
));

const CustomDatePicker = ({ selected, onChange, containerStyle, disabled = false }) => {
  const updatedSelected = selected ? new Date(selected) : new Date();
  return (
    <div
      className='control-button-group'
      style={{ zIndex: 999, ...containerStyle }}
    >
      <DatePicker
        dateFormat='MM/dd/yyyy'
        selected={updatedSelected}
        onChange={onChange}
        customInput={<CustomDatePickerInput />}
        disabled={disabled}
        color='#4d53e0'
      />
    </div>
  );
};

export default CustomDatePicker;
