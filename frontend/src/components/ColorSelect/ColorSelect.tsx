import React from 'react';
//@ts-ignore
import { CirclePicker, type ColorResult } from 'react-color';
import { Popover, Stack } from '@mui/material';
import { colourHexToName, colourNameToHex } from 'utils/colorNameToHex';
import CustomButton from 'components/Button';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import capitalizeString from 'utils/capitalizeString';

interface ColorSelectProps<T> {
  options: T[];
  selectedOption: T;
  onOptionChange: (option: T) => void;
  label: string;
}

const ColorSelect = <T extends { name: string; value: string }>({
  label,
  options,
  selectedOption,
  onOptionChange,
}: ColorSelectProps<T>) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (color: ColorResult) => {
    const updatedOption = {
      name: colourHexToName(color.hex),
      value: color.hex,
    };

    onOptionChange(updatedOption as any);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <div className='form-group'>
      <label>{label}</label>
      <div>
        <CustomButton
          startIcon={
            <FiberManualRecordIcon sx={{ color: selectedOption?.value, display: selectedOption ? 'inline' : 'none' }} />
          }
          aria-describedby={id}
          variant='outlined'
          onClick={handleClick}
          fullWidth
        >
          { selectedOption ? capitalizeString(selectedOption?.name) : 'Not selected'}
        </CustomButton>
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        className='color-popover'
      >
        <Stack maxWidth='500px' padding={2}>
          <CirclePicker
            color={selectedOption?.value}
            onChange={handleColorChange}
            width='auto'
            colors={options.map((option) => colourNameToHex(option.value))}
          />
        </Stack>
      </Popover>
    </div>
  );
};

export default ColorSelect;
