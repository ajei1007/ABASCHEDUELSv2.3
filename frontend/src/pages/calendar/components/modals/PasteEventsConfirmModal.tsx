import { useState } from 'react';
import { FormControlLabel, Checkbox, Stack } from '@mui/material';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';

export interface IPasteEventsConfirmModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (payload: { includeCanceled: boolean }) => void;
}

// Props that can be passed via ModalWrapper.show()
export interface IPasteEventsConfirmModalPropsForRef {}

const PasteEventsConfirmModal = ({
  isOpen,
  handleClose,
  handleConfirm,
}: IPasteEventsConfirmModalProps) => {
  const [includeCanceled, setIncludeCanceled] = useState<boolean>(false);

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={`Paste Copied Events Modal`}
      aria-describedby={`Paste Copied Events Modal For Scheduler`}
      title={'Paste Copied Events'}
      maxWidth='xs'
      transitionDuration={200}
      data-qa='confirmation-dialog'
      actionbuttons={
        <>
          <CustomButton
            onClick={handleClose}
            variant='outlined'
            data-qa='dialog-cancel'
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={() => handleConfirm({ includeCanceled })}
            color='primary'
            data-qa='dialog-confirm'
          >
            Paste
          </CustomButton>
        </>
      }
    >
      <Stack
        spacing={2}
        sx={{
          px: 0.35,
          pt: 1,
          pb: 2,
        }}
      >
        <FormControlLabel
          label='Include pasting canceled appointments that were copied'
          control={
            <Checkbox
              checked={includeCanceled}
              onChange={(e) => setIncludeCanceled(e.target.checked)}
              sx={{
                p: 0,
                mr: 1.5,
                color: '#4d53e0',
                '&.Mui-checked': {
                  color: '#4d53e0',
                },
              }}
            />
          }
          slotProps={{
            typography: {
              fontSize: '0.9rem',
            },
          }}
        />
      </Stack>
    </CustomModal>
  );
};

export default PasteEventsConfirmModal;
