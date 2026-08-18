import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import { type FC, type ReactNode, useEffect, useRef } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface ICustomModalProps extends DialogProps {
  children: JSX.Element;
  title: string | ReactNode;
  actionbuttons?: JSX.Element;
  onClose: () => void;
  hideClose?: boolean;
}

const CustomModal: FC<ICustomModalProps> = ({
  hideClose = false,
  ...props
}) => {
  const { title, children, actionbuttons, open, onClose } = props;
  const descriptionElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef as any;
      if (descriptionElement !== null) {
        descriptionElement?.focus();
      }
    }
  }, [open]);

  return (
    <Dialog
      {...props}
      scroll='body'
      fullWidth
      maxWidth={props.maxWidth || 'md'}
      PaperProps={{
        className: 'custom-modal-paper',
      }}
      onClose={() => null}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        padding='16px 24px 0 24px'
      >
        <DialogTitle
          style={{
            padding: '0',
            color: '#16365f',
            textTransform: 'capitalize',
          }}
          data-qa='dialog-title'
        >
          {title}
        </DialogTitle>
        {!hideClose && (
          <IconButton onClick={onClose} data-qa='dialog-close'>
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Stack>
      <DialogContent style={{ overflowY: 'unset' }} data-qa='dialog-message'>
        {children}
      </DialogContent>
      {actionbuttons && (
        <DialogActions style={{ padding: '0 24px 16px 24px' }}>
          {actionbuttons}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomModal;
