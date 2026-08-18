import { DialogTitle, Stack, Typography, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export interface ISurveyFormHeaderProps {
  hideCloseButton?: boolean;
  onClose: () => void;
}

const SurveyFormHeader = ({
  hideCloseButton = false,
  onClose,
}: ISurveyFormHeaderProps) => {
  return (
    <Stack
      flexDirection='column'
      alignItems='center'
      sx={{
        px: '10px',
        pt: '10px',
      }}
    >
      <Stack
        height='1.5rem'
        width='100%'
        flexDirection='row'
        alignItems='center'
      >
        {!hideCloseButton && (
          <IconButton sx={{ p: '1px', ml: 'auto' }} onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Stack>

      <Stack
        sx={{
          transform: 'translateY(-0.5rem)',
        }}
        flexDirection='column'
        width='100%'
        rowGap='0.35rem'
      >
        <DialogTitle
          sx={{
            p: 0,
            color: '#16365f',
            fontWeight: 600,
            mx: 'auto',
            fontSize: '1.4rem',
          }}
        >
          Customer Feedback Survey
        </DialogTitle>
        <Typography
          sx={{
            color: '#666',
            fontWeight: 500,
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          Help us improve by sharing your experience with ABA Schedules
        </Typography>
      </Stack>
    </Stack>
  );
};

export default SurveyFormHeader;
