import * as React from 'react';
import { memo, type FC } from 'react';
import CustomModal from 'components/Modal';   
import CustomButton from 'components/Button';

interface ITableDeleteModal {
  isOpen: boolean;
  toggleModal: () => void;
  handleConfirm: any; 
  title?: string
  loading?: boolean;
}

const TableDeleteModal: FC<ITableDeleteModal>  = memo(({
  isOpen,
  // 
  toggleModal,
  handleConfirm,
  title = 'Are you sure you want to delete this item?',
  loading = false,
}: ITableDeleteModal) => {
  return (
    <CustomModal
      open={isOpen}
      onClose={toggleModal}
      aria-labelledby={`Confirm Delete Modal`}
      aria-describedby={`Are you sure you want to delete this item?`}
      title='Confirm Delete'
      maxWidth='xs'
      actionbuttons={
        <>
          <CustomButton onClick={toggleModal} variant='outlined' loading={loading}>
            Cancel
          </CustomButton>
          <CustomButton onClick={handleConfirm} color='error' loading={loading}>
            Delete
          </CustomButton>
        </>
      }
    >
      <p>{title}</p>
    </CustomModal>
  )
});

export default TableDeleteModal