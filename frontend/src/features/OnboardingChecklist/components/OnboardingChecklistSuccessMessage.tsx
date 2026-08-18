import { Stack, Paper, Box, Typography, Avatar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const OnboardingChecklistSuccessMessage = () => {
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: '8px',
        bgcolor: 'rgb(240, 253, 244)',
        border: '1px solid rgb(187, 247, 208)',
        px: 4,
        pt: 2,
        pb: 2.5,
        textAlign: 'center',
      }}
    >
      <Stack rowGap={1} alignItems='center'>
        <Box
          mb={1.5}
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgb(34, 197, 94)',
            }}
          >
            <CheckIcon
              sx={{
                color: 'white',
                fontSize: 32,
              }}
            />
          </Avatar>
        </Box>

        <Typography
          variant='h5'
          component='h3'
          sx={{
            fontWeight: 'bold',
            color: 'rgb(22, 101, 52)',
          }}
        >
          Congratulations! 🎉
        </Typography>

        <Typography
          variant='body1'
          sx={{
            color: 'rgb(21, 128, 61)',
          }}
        >
          The company has been successfully onboarded to ABA Schedules!
        </Typography>
      </Stack>
    </Paper>
  );
};

OnboardingChecklistSuccessMessage.displayName =
  'OnboardingChecklistSuccessMessage';

export default OnboardingChecklistSuccessMessage;
