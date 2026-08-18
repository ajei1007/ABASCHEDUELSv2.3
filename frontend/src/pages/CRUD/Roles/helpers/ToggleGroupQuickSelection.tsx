import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export interface ToggleGroupQuickSelectionProps {
  value: string | null;
  options: {
    value: string;
    label: string;
    color: 'green' | 'blue' | 'red';
  }[];
  onChange: (value: string) => void;
}

const ToggleGroupQuickSelection: React.FC<ToggleGroupQuickSelectionProps> = ({
  value,
  options,
  onChange,
}) => {
  return (
    <ToggleButtonGroup
      value={value}
      size='small'
      orientation='vertical'
      exclusive
      unselectable='off'
      sx={{
        '& .MuiToggleButton-root': {
          height: '26px',
          fontSize: '0.65rem',
          lineHeight: '1rem',
          padding: '1px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
      onChange={(_, newValue) => {
        if (newValue === null) {
          return;
        }
        onChange(newValue);
      }}
    >
      {options.map((option, index) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          size='small'
          sx={{
            '&.Mui-selected': {
              bgcolor:
                option.color === 'green'
                  ? '#4caf50!important'
                  : option.color === 'blue'
                    ? '#1976d2!important'
                    : '#f44336!important',
              color: '#fff!important',
              borderColor:
                option.color === 'green'
                  ? '#4caf50!important'
                  : option.color === 'blue'
                    ? '#1976d2!important'
                    : '#f44336!important',
              boxShadow:
                index === options.length - 1
                  ? '0 -1px 2px rgba(0,0,0,0.1)!important'
                  : '0 1px 2px rgba(0,0,0,0.1)!important',
            },
          }}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ToggleGroupQuickSelection;
