import { Stack } from '@mui/material';
import CustomButton from 'components/Button';
import type { FC } from 'react';

interface IFormActionsProps {
  saveLoading: boolean;
  onCancel: () => void;
  onSubmit: (e: any) => void;
  onReset: (e: any) => void;
  hideSaveAndReset?: boolean;
}

const FormActions: FC<IFormActionsProps> = ({
  saveLoading,
  onCancel,
  onSubmit,
  onReset,
  hideSaveAndReset,
}) => {
  return (
    <Stack direction='row' spacing='0.5rem'>
      {!hideSaveAndReset && (
        <>
          <CustomButton
            disabled={saveLoading}
            type='button'
            // @ts-ignore
            onClick={onSubmit}
          >
            Save
          </CustomButton>
          <CustomButton
            variant='outlined'
            type='button'
            disabled={saveLoading}
            onClick={onReset}
          >
            Reset
          </CustomButton>
        </>
      )}
      <CustomButton
        variant='outlined'
        type='button'
        disabled={saveLoading}
        onClick={onCancel}
      >
        Cancel
      </CustomButton>
    </Stack>
  );
};

export default FormActions;
