import { Box, CircularProgress } from '@mui/material';

export interface InfoViewActionItemProps {
  label: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  hasAccess?: boolean;
  onClick?: () => void;
}

const InfoViewActionItem = ({
  label,
  isDisabled = false,
  isLoading = false,
  onClick = () => {},
}: InfoViewActionItemProps) => {
  return (
    <Box
      component='button'
      display='flex'
      alignItems='center'
      height='40px'
      color='red'
      px={1}
      sx={{
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'background-color 0.2s ease',
        userSelect: 'none',
        fontSize: '0.875rem',
        backgroundColor: 'transparent',
        border: 'none',
        '&:hover': {
          backgroundColor: '#eee',
        },
        '&:active': {
          backgroundColor: '#dedede',
        },
        '&:disabled': {
          backgroundColor: 'transparent',
          cursor: 'not-allowed',
          opacity: 0.6,
        },
      }}
      disabled={isDisabled}
      onClick={onClick}
    >
      <span>{label}</span>
      {isLoading && (
        <CircularProgress
          size='1rem'
          sx={{
            ml: 'auto',
            mr: 0.5,
            color: 'red',
          }}
        />
      )}
    </Box>
  );
};

export default InfoViewActionItem;
