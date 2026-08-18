import { useMemo, useState } from 'react';
import { Stack } from '@mui/material';
import CustomButton, { type ICustomButtonProps } from 'components/Button';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomModal from 'components/Modal';
import { eventOptions } from '../../constants';

export interface ISelectAndConfirmPromiseModalProps {
  isOpen: boolean;
  title: string;
  confirmButtonText: string;
  confirmButtonColor: ICustomButtonProps['color'];
  enableTypeToConfirm?: boolean;
  showSelectInput: boolean;
  options: {
    value: string;
    label: string;
  }[];
  handleClose: () => void;
  handleConfirm: (payload: any) => void;
}

export interface ISelectAndConfirmPromiseModalPropsForRef
  extends Pick<
    ISelectAndConfirmPromiseModalProps,
    'options' | 'showSelectInput'
  > {}

const SelectAndConfirmPromiseModal = ({
  isOpen,
  title,
  confirmButtonText,
  confirmButtonColor = 'primary',
  enableTypeToConfirm = false,
  showSelectInput,
  options,
  handleClose,
  handleConfirm,
}: ISelectAndConfirmPromiseModalProps) => {
  const [text, setText] = useState('');
  const [value, setValue] = useState<(typeof eventOptions)[number]>(options[0]);

  const disabledConfirmButton = useMemo(() => {
    if (enableTypeToConfirm) {
      return text !== 'delete';
    }
    return false;
  }, [enableTypeToConfirm, text]);

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={`${title} Modal`}
      aria-describedby={`${title} Modal For Scheduler`}
      title={title}
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
            onClick={() =>
              handleConfirm(
                eventOptions.findIndex((e) => e.label === value.label),
              )
            }
            color={confirmButtonColor}
            disabled={disabledConfirmButton}
            data-qa='dialog-confirm'
          >
            {confirmButtonText}
          </CustomButton>
        </>
      }
    >
      {enableTypeToConfirm || showSelectInput ? (
        <Stack spacing={2}>
          {enableTypeToConfirm && (
            <CustomInput
              label='To confirm, type "delete" in the box below'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
          {showSelectInput && (
            <CustomSelect
              isMulti={false}
              options={options}
              value={value}
              onChange={setValue}
            />
          )}
        </Stack>
      ) : (
        <></>
      )}
    </CustomModal>
  );
};

export default SelectAndConfirmPromiseModal;
