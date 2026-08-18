import { Divider, Stack } from '@mui/material';
import CustomButton, { type ICustomButtonProps } from 'components/Button';
import CustomModal from 'components/Modal';

export interface ISelectAndConfirmAvailabilityModalProps {
  isOpen: boolean;
  title: string;
  confirmButtonText: string;
  confirmButtonColor: ICustomButtonProps['color'];
  showResourceList: boolean;
  checkedResources: { label: string; type: string }[];
  handleClose: () => void;
  handleConfirm: (payload?: any) => void;
}

export type ISelectAndConfirmAvailabilityPropsForRef = Omit<
  ISelectAndConfirmAvailabilityModalProps,
  'isOpen' | 'handleClose' | 'handleConfirm' | 'showResourceList'
>;

function SelectAndConfirmAvailabilityModal({
  isOpen,
  title,
  confirmButtonText,
  confirmButtonColor,
  showResourceList,
  checkedResources,
  handleClose,
  handleConfirm,
}: ISelectAndConfirmAvailabilityModalProps) {
  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={`${title} Modal`}
      aria-describedby={`${title} Modal for Availability Confirmation`}
      title={title}
      maxWidth='sm'
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
            onClick={handleConfirm}
            variant='contained'
            color={confirmButtonColor}
            data-qa='dialog-confirm'
          >
            Confirm
          </CustomButton>
        </>
      }
    >
      <Stack spacing={2}>
        <p>Resources to Add Availability:</p>
        <ul style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          {checkedResources.map((resource, index) => (
            <div key={index}>
              <li style={{ margin: '4px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 550 }}>
                    {resource?.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    {resource?.type}
                  </span>
                </div>
              </li>
              <Divider />
            </div>
          ))}
        </ul>
      </Stack>
    </CustomModal>
  );
}

export default SelectAndConfirmAvailabilityModal;
