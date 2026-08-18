import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { Popover, Stack, Button, Tooltip } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import CustomButton from 'components/Button';
import { DateRangePicker } from 'react-date-range';

type DateRangePickerState = {
  startDate: Date;
  endDate: Date;
  key: string;
  dataQa?: string;
};

interface CustomDateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onSubmit: (sDate: Date, eDate: Date) => void;
  containerStyle?: any;
  disabled?: boolean;
  dataQa?: string;
}

const DateRangeText = ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => (
  <>
    {moment(startDate).format('MM/DD/YYYY') !==
    moment(endDate).format('MM/DD/YYYY')
      ? moment(startDate).format('MM/DD/YYYY') +
        ' - ' +
        moment(endDate).format('MM/DD/YYYY')
      : moment(startDate).format('MM/DD/YYYY')}
  </>
);

const CustomDateRangePicker: FC<CustomDateRangePickerProps> = ({
  startDate,
  endDate,
  onSubmit,
  containerStyle,
  disabled = false,
  dataQa,
}) => {
  const [dateRange, setDateRange] = useState<Array<DateRangePickerState>>([
    {
      startDate,
      endDate,
      key: 'selection',
    },
  ]);
  useEffect(() => {
    setDateRange([
      {
        startDate,
        endDate,
        key: 'selection',
      },
    ]);
  }, [startDate, endDate]);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectRange = (item: any) => {
    setDateRange([item.selection]);
  };

  const handleSubmit = () => {
    let drStartDate = dateRange[0].startDate;
    let drEndDate = dateRange[0].endDate;
    if (drStartDate && drEndDate) {
      drEndDate = moment(drEndDate).toDate();
      onSubmit(drStartDate, drEndDate);
      handleClose();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const pickerWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !pickerWrapRef.current) return;

    const inputs = pickerWrapRef.current.querySelectorAll<HTMLInputElement>(
      '.rdrDateDisplay input',
    );
    if (inputs.length >= 2) {
      inputs[0].setAttribute('data-qa', `${dataQa}-start-date`);
      inputs[1].setAttribute('data-qa', `${dataQa}-end-date`);
    }
  }, [open, dataQa]);

  return (
    <Stack>
      <div
        className='control-button-group'
        style={{ zIndex: 2, ...containerStyle }}
        data-qa={dataQa}
      >
        <Tooltip arrow title='Date Range' placement='top'>
          <Button
            className='custom-datepicker-input'
            startIcon={<CalendarMonthOutlinedIcon />}
            endIcon={<ArrowDropDownOutlinedIcon />}
            onClick={handleClick}
            disabled={disabled}
            data-qa={`${dataQa}-date-range`}
          >
            <DateRangeText startDate={startDate} endDate={endDate} />
          </Button>
        </Tooltip>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack>
          <DateRangePicker
            ranges={dateRange}
            months={2}
            rangeColors={['#4d53e0']}
            color='#4d53e0'
            onChange={handleSelectRange}
            direction='horizontal'
          />
          <Stack
            direction='row'
            justifyContent='flex-end'
            alignItems='center'
            columnGap='0.5rem'
            p='0.5rem'
          >
            <DateRangeText startDate={startDate} endDate={endDate} />
            <CustomButton
              variant='outlined'
              onClick={handleClose}
              disabled={disabled}
            >
              Cancel
            </CustomButton>
            <CustomButton onClick={handleSubmit} disabled={disabled}>
              Apply
            </CustomButton>
          </Stack>
        </Stack>
      </Popover>
    </Stack>
  );
};

export default CustomDateRangePicker;
