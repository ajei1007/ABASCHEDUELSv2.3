import type { FC } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import { Stack, Box } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

export interface ToggleGroupButtonProps {
  value: string;
  label: string;
}

const ToggleGroupButton: FC<ToggleGroupButtonProps> = ({ value, label }) => {
  return (
    <ToggleButton value={value} size='small'>
      <Stack flexDirection='row' alignItems='center' gap={0.65}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <RadioButtonUncheckedIcon
            className='unchecked-icon'
            sx={{
              mb: '1px',
              fontSize: '0.8rem',
              transition: 'opacity 0.2s',
            }}
          />
          <RadioButtonCheckedIcon
            className='checked-icon'
            sx={{
              fontSize: '0.8rem',
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'opacity 0.2s',
            }}
          />
        </Box>
        <span>{label}</span>
      </Stack>
    </ToggleButton>
  );
};

export default ToggleGroupButton;
