import { Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const ContentLoadError = ({
  errorMessage,
  refetch,
}: {
  errorMessage: any;
  refetch: () => void;
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        bgcolor: 'background.paper',
        p: 4,
        mt: 4,
      }}
    >
      <Box
        sx={{
          fontSize: 24,
          color: '#f44336',
          mb: 2,
        }}
      >
        {errorMessage || 'Something went wrong while loading NPS statistics.'}
      </Box>
      <Button
        color='primary'
        variant='contained'
        size='small'
        onClick={refetch}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
        }}
        startIcon={<RefreshIcon />}
      >
        Retry
      </Button>
    </Box>
  );
};

export default ContentLoadError;
