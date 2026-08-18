import { Box, CircularProgress } from '@mui/material';

const ContentWrapperWithLoading = ({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      {children}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1,
            borderRadius: 2,
            px: 2,
            pb: 2,
            pt: '10rem',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'sticky',
              top: '10rem',
            }}
          >
            <CircularProgress
              sx={{
                fontSize: '2rem!important',
                color: 'white!important',
              }}
            />
            <Box
              sx={{
                mt: 2,
                fontSize: '1.5rem',
                fontWeight: 500,
                textAlign: 'center',
                color: 'white',
              }}
            >
              Loading statistics...
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ContentWrapperWithLoading;
