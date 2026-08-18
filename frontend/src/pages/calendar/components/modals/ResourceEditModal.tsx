import { memo, type FC } from 'react';
import CustomModal from 'components/Modal';
import UsersFormModal from 'pages/CRUD/Users/form/UsersFormModal';

export interface IResourceEditModalProps {
  isOpen: boolean;
  modalData: {
    id: string;
    type: string;
  } | null;
  handleClose: () => void;
  handleConfirm: () => void;
}

export type IResourceEditModalPropsForRef = Pick<
  IResourceEditModalProps,
  'modalData'
>;

const ResourceEditModal: FC<IResourceEditModalProps> = ({
  isOpen,
  modalData,
  handleClose,
}) => {
  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='Edit Modal'
      aria-describedby='Edit Modal For Scheduler'
      title='Edit'
      maxWidth='lg'
    >
      {modalData ? (
        <UsersFormModal
          id={modalData.id}
          resourceType={modalData.type}
          onClose={handleClose}
        />
      ) : (
        <></>
      )}
    </CustomModal>
  );
};

export default memo(ResourceEditModal);
