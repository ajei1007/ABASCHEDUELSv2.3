import { Alert, Slide, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import React from 'react';
import CustomButton from 'components/Button';

interface RefreshBannerProps {
  open: boolean;
  onRefresh?: () => void;
  onClose?: () => void;
  message?: string;
}

const RefreshBanner: React.FC<RefreshBannerProps> = ({
  open,
  onRefresh,
  onClose,
}) => {
  return (
    <Slide direction='down' in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 2000,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Alert
          severity='warning'
          sx={{
            borderRadius: 0,
            justifyContent: 'center',
            textAlign: 'center',
            alignItems: 'center',
          }}
          action={
            <CustomButton
              aria-label='refresh'
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </CustomButton>
          }
          onClose={onClose}
        >
          Please refresh the page to get better experience
        </Alert>
      </Box>
    </Slide>
  );
};

export default RefreshBanner;
