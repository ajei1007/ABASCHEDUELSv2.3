import { useMemo, useState } from 'react';
import { Divider, Stack } from '@mui/material';
import CustomButton, { type ICustomButtonProps } from 'components/Button';
import CustomModal from 'components/Modal';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSelect from 'components/CustomSelect/CustomSelect';

export interface ISelectAndConfirmUnavailabilityModalProps {
  isOpen: boolean;
  title: string;
  confirmButtonText: string;
  confirmButtonColor: ICustomButtonProps['color'];
  showResourceList: boolean;
  checkedResources: { label: string; type: string }[];
  mode?: 'add' | 'remove'; // optional if you need special logic
  handleClose: () => void;
  handleConfirm: (payload?: any) => void;
}

export type ISelectAndConfirmUnavailabilityPropsForRef = Omit<
  ISelectAndConfirmUnavailabilityModalProps,
  'isOpen' | 'handleClose' | 'handleConfirm' | 'showResourceList'
>;

function SelectAndConfirmUnavailabilityModal({
  isOpen,
  title,
  confirmButtonText,
  confirmButtonColor,
  showResourceList,
  checkedResources,
  mode,
  handleClose,
  handleConfirm,
}: ISelectAndConfirmUnavailabilityModalProps) {
  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={`${title} Modal`}
      aria-describedby={`${title} Modal for Unavailability Confirmation`}
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
        <>
          <p>
            {mode === 'remove'
              ? 'Resources to Remove Unavailability:'
              : 'Resources to Add Unavailability:'}
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
            {checkedResources.map((resource, index) => (
              <>
                <li key={index} style={{ margin: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'end',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '550' }}>
                      {resource?.label}
                    </span>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {resource?.type}
                    </span>
                  </div>
                </li>
                <Divider />
              </>
            ))}
          </ul>
        </>
      </Stack>
    </CustomModal>
  );
}

export default SelectAndConfirmUnavailabilityModal;
