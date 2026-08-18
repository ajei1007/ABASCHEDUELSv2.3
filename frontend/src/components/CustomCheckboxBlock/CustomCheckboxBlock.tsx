import { Checkbox, Stack } from '@mui/material';
import type { FC } from 'react';

const CheckBoxIcon = ({ color }: { color: string }) => (
  <svg
    width='20px'
    height='20px'
    viewBox='0 0 24 24'
    version='1.1'
    fill={color || '#000000'}
  >
    <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
    <g
      id='SVGRepo_tracerCarrier'
      strokeLinecap='round'
      strokeLinejoin='round'
    ></g>
    <g id='SVGRepo_iconCarrier'>
      <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
        {' '}
        <g
          id='ic_fluent_checkbox_checked_24_filled'
          fill='#212121'
          fillRule='nonzero'
        >
          {' '}
          <path
            d='M18,3 C19.6568542,3 21,4.34314575 21,6 L21,18 C21,19.6568542 19.6568542,21 18,21 L6,21 C4.34314575,21 3,19.6568542 3,18 L3,6 C3,4.34314575 4.34314575,3 6,3 L18,3 Z M16.4696699,7.96966991 L10,14.4393398 L7.53033009,11.9696699 C7.23743687,11.6767767 6.76256313,11.6767767 6.46966991,11.9696699 C6.1767767,12.2625631 6.1767767,12.7374369 6.46966991,13.0303301 L9.46966991,16.0303301 C9.76256313,16.3232233 10.2374369,16.3232233 10.5303301,16.0303301 L17.5303301,9.03033009 C17.8232233,8.73743687 17.8232233,8.26256313 17.5303301,7.96966991 C17.2374369,7.6767767 16.7625631,7.6767767 16.4696699,7.96966991 Z'
            fill={color || '#000000'}
          >
            {' '}
          </path>{' '}
        </g>{' '}
      </g>{' '}
    </g>
  </svg>
);
const UncheckedCheckboxIcon = ({ color }: { color: string }) => (
  <svg
    width='20px'
    height='20px'
    viewBox='0 0 24 24'
    version='1.1'
    fill={color || '#000000'}
  >
    <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
    <g
      id='SVGRepo_tracerCarrier'
      strokeLinecap='round'
      strokeLinejoin='round'
    ></g>
    <g id='SVGRepo_iconCarrier'>
      <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
        {' '}
        <g
          id='ic_fluent_checkbox_unchecked_24_filled'
          fill='#212121'
          fillRule='nonzero'
        >
          {' '}
          <path
            d='M6,3 L18,3 C19.6568542,3 21,4.34314575 21,6 L21,18 C21,19.6568542 19.6568542,21 18,21 L6,21 C4.34314575,21 3,19.6568542 3,18 L3,6 C3,4.34314575 4.34314575,3 6,3 Z M6,5 C5.44771525,5 5,5.44771525 5,6 L5,18 C5,18.5522847 5.44771525,19 6,19 L18,19 C18.5522847,19 19,18.5522847 19,18 L19,6 C19,5.44771525 18.5522847,5 18,5 L6,5 Z'
            fill={color || '#000000'}
          >
            {' '}
          </path>{' '}
        </g>{' '}
      </g>{' '}
    </g>
  </svg>
);

interface CustomCheckboxBlockProps {
  label?: string;
  checked?: boolean;
  color?: string;
  value?: string;
  disabled?: boolean;
  onChange: (val: any) => any;
  dataQa?: string;
}

const CustomCheckboxBlock: FC<CustomCheckboxBlockProps> = ({
  label = null,
  checked,
  onChange,
  color = '#4d53e0',
  disabled = false,
  value,
  dataQa = 'custom-checkbox',
}) => {
  return (
    <Stack direction='row' alignItems='center' padding='0.25rem 0'>
      <Checkbox
        sx={{
          padding: '0',
          borderRadius: '10px',
        }}
        size='small'
        checked={checked}
        value={value}
        onChange={onChange}
        icon={<UncheckedCheckboxIcon color={!disabled ? color : '#dedede'} />}
        checkedIcon={<CheckBoxIcon color={!disabled ? color : '#dedede'} />}
        disabled={disabled}
        data-qa={dataQa}
      />
      {label && (
        <span
          style={{
            marginLeft: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b859e',
          }}
        >
          {label}
        </span>
      )}
    </Stack>
  );
};

export default CustomCheckboxBlock;
