import React from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export interface ToggleGroupProps {
  value: string[];
  onChange: (
    event: React.MouseEvent<HTMLElement>,
    newValue: string[] | null,
  ) => void;
  children: React.ReactNode;
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onChange,
  children,
}) => {
  return (
    <ToggleButtonGroup
      value={value}
      size='small'
      color='primary'
      sx={{
        '& .MuiToggleButton-root': {
          textTransform: 'capitalize',
          minWidth: '50px',
          height: '32px',
          fontSize: '0.8rem',
          lineHeight: '1rem',
          padding: '1px 12px 1px 8px',
          '& .checked-icon': {
            opacity: 0,
          },
          '& .unchecked-icon': {
            opacity: 1,
          },
          '&.Mui-selected': {
            color: '#4d53e0 !important',
            borderColor: '#4d53e0 !important',
            backgroundColor: 'rgba(77, 83, 224, 0.2) !important',
            boxShadow: 'none !important',
            '& .checked-icon': {
              opacity: 1,
            },
            '& .unchecked-icon': {
              opacity: 0,
            },
          },
        },
      }}
      onChange={onChange}
    >
      {children}
    </ToggleButtonGroup>
  );
};

export default ToggleGroup;
