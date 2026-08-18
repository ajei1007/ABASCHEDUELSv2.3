import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';

interface SheetErrorModalProps {
  isOpen: boolean;
  toggleModal: () => any;
  fileErrors: any[];
}

const SheetErrorModal = ({ isOpen, toggleModal, fileErrors }: SheetErrorModalProps) => {
  return (
    <CustomModal
      open={isOpen}
      onClose={toggleModal}
      aria-labelledby='Invalid Resource Values Modal'
      aria-describedby='Invalid Resource Values Scheduler'
      title='Validation Error!'
      actionbuttons={
        <CustomButton variant='outlined' onClick={toggleModal}>
          Close
        </CustomButton>
      }
    >
      <ul>
        {fileErrors &&
          fileErrors.length && fileErrors.map((err, index) => (
            <li key={index} style={{ color: '#FF4B23', fontSize: '1rem' }}>
              {err}
            </li>
          ))}
      </ul>
    </CustomModal>
  );
};

export default SheetErrorModal;
