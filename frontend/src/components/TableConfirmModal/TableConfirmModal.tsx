import { memo, type FC } from 'react';
import CustomModal from 'components/Modal';   
import CustomButton from 'components/Button';
import { Stack } from '@mui/material';
import CustomDatePicker from 'components/CustomDatePicker/CustomDatePicker';

interface ITableConfirmModal {
  isOpen: boolean;
  toggleModal: () => void;
  handleConfirm?: any;
  handleDelete?: any;
  type?: 'disable' | 'delete';
  selectedDate?: Date;
  setSelectedDate?: (date: any) => any;
}

const TableConfirmModal: FC<ITableConfirmModal>  = memo(({
  isOpen,
  // 
  toggleModal,
  handleConfirm,
  handleDelete,
  selectedDate,
  setSelectedDate,
  type = 'delete'
}: ITableConfirmModal) => {

  const doConfirmation = (deleteEvents: boolean) => {
    if (type === 'disable') {
      handleConfirm(null, null, false, deleteEvents)
    } else {
      handleDelete(deleteEvents)
    }
  }
  return (
    <CustomModal
      open={isOpen}
      onClose={toggleModal}
      aria-labelledby={`Confirm Modal`}
      aria-describedby={`Confirm User Update`}
      title={`Confirm ${type}`}
      maxWidth='sm'
      actionbuttons={
        <Stack width='100%' alignItems='center' flexDirection='row' justifyContent='space-between'>
          <CustomButton onClick={() => doConfirmation(true)} color='error'>
            Confirm Deletion
          </CustomButton>
          <Stack alignItems='center' flexDirection='row' justifyContent='center' columnGap={1}>
            <CustomButton onClick={() => doConfirmation(false)}>
              Only {type === 'disable' ? 'Update' : 'Delete'}
            </CustomButton>
            <CustomButton onClick={toggleModal} variant='outlined'>
              Cancel
            </CustomButton>
          </Stack>
        </Stack>
      }
    >
      <Stack flexDirection='row' alignItems='center' columnGap={2}>
        <p style={{ margin: 0 }}>Disabling the user deletes events from</p>
        {setSelectedDate && 
          <CustomDatePicker
          selected={selectedDate}
          onChange={(date: any) => setSelectedDate(date)} containerStyle={undefined}          />
        }
      </Stack>
    </CustomModal>
  )
});

export default TableConfirmModal