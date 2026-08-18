import { Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const ContentNoData = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        p: 4,
        mt: 4,
      }}
    >
      <Box
        sx={{
          fontSize: 48,
          color: 'grey.400',
          mb: 2,
        }}
      >
        <RefreshIcon fontSize='inherit' />
      </Box>
      <Box
        sx={{
          fontWeight: 500,
          fontSize: '1.2rem',
          mb: 1,
          color: 'text.primary',
          textAlign: 'center',
        }}
      >
        No statistics available
      </Box>
      <Box
        sx={{
          color: 'text.secondary',
          fontSize: '1rem',
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        Please select a company, question, and quarter to view NPS statistics.
      </Box>
    </Box>
  );
};

export default ContentNoData;
