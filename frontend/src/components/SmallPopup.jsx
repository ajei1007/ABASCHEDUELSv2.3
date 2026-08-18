import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CustomButton from './Button';

const SmallPopup = ({
  message,
  handleClosePopup,
  handleClickActionButton,
  open,
  actionText = '',
}) => {
  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    handleClosePopup();
  };

  const action = (
    <React.Fragment>
      <CustomButton onClick={handleClickActionButton}>
        {actionText}
      </CustomButton>
      <IconButton
        size='small'
        aria-label='close'
        color='inherit'
        onClick={handleClose}
      >
        <CloseIcon fontSize='small' />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message={message}
      action={actionText ? action : null}
    />
  );
};

export default React.memo(SmallPopup);
