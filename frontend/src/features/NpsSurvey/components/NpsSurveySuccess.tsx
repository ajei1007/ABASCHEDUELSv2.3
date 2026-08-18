import { DialogContent, Box, Typography, Button, Avatar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const NpsSurveySuccess = ({ handleClose }: { handleClose: () => void }) => {
  return (
    <DialogContent sx={{ overflowY: 'unset' }}>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        pt={6}
        pb={3}
        textAlign='center'
        rowGap={2}
      >
        <Avatar
          sx={{
            backgroundColor: 'rgba(0, 128, 0, 0.2)',
            width: '5rem',
            height: '5rem',
          }}
        >
          <CheckIcon sx={{ color: 'success.main', fontSize: 32 }} />
        </Avatar>
        <Typography
          sx={{
            fontSize: '2rem!important',
          }}
          fontWeight={600}
        >
          Thank You!
        </Typography>
        <Typography
          color='text.secondary'
          sx={{
            fontSize: '1.15rem!important',
          }}
        >
          Your feedback helps us improve our service.
        </Typography>
        <Button
          sx={{
            mt: 2,
            height: '2.75rem',
            width: '8rem',
          }}
          onClick={handleClose}
          variant='outlined'
        >
          Close
        </Button>
      </Box>
    </DialogContent>
  );
};

export default NpsSurveySuccess;
