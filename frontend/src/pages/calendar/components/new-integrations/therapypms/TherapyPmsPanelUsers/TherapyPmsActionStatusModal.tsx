import { Dialog, DialogActions, DialogContent, Stack } from '@mui/material';
import CustomButton from 'components/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { resourceTypePlurals } from '../../../../constants/integrations';

export type TtherapyPmsActionStatusModalProps =
  | {
      isOpen: boolean;
      action: 'import' | 'sync';
      isSuccess: true;
      payload: {
        count: number;
      };
      resourceType: string;
      handleClose: () => void;
    }
  | {
      isOpen: boolean;
      action: 'import' | 'sync';
      isSuccess: false;
      payload?: {
        count: number;
      };
      resourceType: string;
      handleClose: () => void;
    };

export type TtherapyPmsActionStatusModalPropsForRef = Omit<
  TtherapyPmsActionStatusModalProps,
  'isOpen' | 'handleClose'
>;

const TherapyPmsActionStatusModal = ({
  isOpen,
  action,
  isSuccess,
  payload,
  resourceType,
  handleClose,
}: TtherapyPmsActionStatusModalProps) => {
  const resourceTypeLabel = (
    resourceType in resourceTypePlurals
      ? resourceTypePlurals[resourceType as keyof typeof resourceTypePlurals]
      : 'Resources'
  ).toLowerCase();

  return (
    <Dialog
      open={isOpen}
      aria-labelledby='Action Status'
      aria-describedby='Action Status'
      scroll='body'
      fullWidth
      maxWidth='xs'
      onClose={() => null}
    >
      <DialogContent style={{ overflowY: 'unset' }}>
        <Stack spacing={2} py={1}>
          <Stack
            flexDirection='row'
            pt={1}
            alignItems='center'
            justifyContent='center'
          >
            {isSuccess ? (
              <CheckCircleIcon
                sx={{
                  fontSize: '4rem',
                }}
                color='success'
              />
            ) : (
              <ErrorIcon
                sx={{
                  fontSize: '4rem',
                }}
                color='error'
              />
            )}
          </Stack>
          <Stack
            px={1}
            py={1}
            textAlign='center'
            color={isSuccess ? 'green' : 'red'}
          >
            {isSuccess
              ? `Total ${payload.count} ${resourceTypeLabel} have been ${
                  action === 'import' ? 'imported' : 'synced'
                } successfully!`
              : `Something went wrong, couldn't ${action} ${resourceTypeLabel}`}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions style={{ padding: '0 24px 16px 24px' }}>
        <CustomButton fullWidth onClick={handleClose} variant='outlined'>
          Close
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default TherapyPmsActionStatusModal;
