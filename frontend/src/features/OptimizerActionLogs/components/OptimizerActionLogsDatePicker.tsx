import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Box } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseIcon from '@mui/icons-material/Close';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePickerInput = forwardRef<
  HTMLElement,
  {
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    onClick?: () => void;
    onClear?: () => void;
  }
>(({ value, placeholder, onClick, onClear }, ref) => {
  return (
    <Box
      ref={ref}
      component='div'
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '40px',
        columnGap: '0.35rem',
        width: '100%',
        minWidth: '150px',
        borderRadius: '8px',
        borderColor: 'hsl(0, 0%, 80%)',
        borderWidth: '1px',
        borderStyle: 'solid',
        fontSize: '0.75rem',
        margin: '0',
        backgroundColor: 'white',
        textAlign: 'left',
        padding: '0.5rem 0.65rem',
        paddingLeft: '0.65rem',
        py: '0.5rem',
        paddingRight: '0.5rem',
        lineHeight: '1.25rem',
      }}
      onClick={onClick}
    >
      <CalendarMonthOutlinedIcon
        sx={{
          fontSize: '0.9rem!important',
          mb: '2px',
        }}
      />
      {value || (
          <Box
            component='span'
            sx={{
              color: 'hsl(0, 0%, 55%)',
              fontSize: '0.75rem',
            }}
          >
            {placeholder}
          </Box>
        ) ||
        ''}
      {value && (
        <Box
          component='button'
          sx={{
            ml: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            my: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClear) onClear();
          }}
        >
          <CloseIcon
            sx={{
              fontSize: '0.875rem!important',
              color: 'hsl(0, 0%, 50%)',
              cursor: 'pointer',
              pb: '1px',
            }}
          />
        </Box>
      )}
    </Box>
  );
});

const OptimizerActionLogsDatePicker = ({
  selected,
  onChange,
  ...restProps
}: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  [key: string]: any; // Allow additional props
}) => {
  const onClear = () => {
    onChange(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={<CustomDatePickerInput onClear={onClear} />}
        {...restProps}
      />
    </Box>
  );
};

export default OptimizerActionLogsDatePicker;
