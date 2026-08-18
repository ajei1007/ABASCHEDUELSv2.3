import { Stack } from '@mui/material';
import CustomButton, { type ICustomButtonProps } from 'components/Button';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomModal from 'components/Modal';
import { useEffect, useMemo, useState, memo } from 'react';

export interface ISelectAndConfirmModalProps {
  isOpen: boolean;
  options: any;
  value: any;
  title: string;
  confirmButtonText: string;
  confirmButtonColor: ICustomButtonProps['color'];
  showSelectInput?: boolean;
  //
  toggleModal: () => void;
  handleSelectOption: (data: any) => void;
  handleConfirm: () => void;
  //
  enableTypeToConfirm?: boolean;
}

const SelectAndConfirmModal = ({
  isOpen,
  options,
  value,
  title,
  confirmButtonText,
  confirmButtonColor = 'primary',
  showSelectInput = true,
  //
  toggleModal,
  handleSelectOption,
  handleConfirm,
  //
  enableTypeToConfirm = false,
}: ISelectAndConfirmModalProps) => {
  const [text, setText] = useState('');

  const disabledConfirmButton = useMemo(() => {
    if (enableTypeToConfirm) {
      return text !== 'delete';
    }
    return false;
  }, [enableTypeToConfirm, text]);

  useEffect(() => {
    if (isOpen) {
      setText('');
    }
  }, [isOpen]);

  return (
    <CustomModal
      open={isOpen}
      onClose={toggleModal}
      aria-labelledby={`${title} Modal`}
      aria-describedby={`${title} Modal For Scheduler`}
      title={title}
      maxWidth='xs'
      actionbuttons={
        <>
          <CustomButton onClick={toggleModal} variant='outlined'>
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleConfirm}
            color={confirmButtonColor}
            disabled={disabledConfirmButton}
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
              onChange={handleSelectOption}
            />
          )}
        </Stack>
      ) : (
        <></>
      )}
    </CustomModal>
  );
};

export default memo(SelectAndConfirmModal);
