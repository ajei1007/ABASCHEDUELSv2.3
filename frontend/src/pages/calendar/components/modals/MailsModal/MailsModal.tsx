import { useCallback, memo, type FC } from 'react';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectMailsModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  hideMailsModal,
  toggleMailsModalOpen,
} from 'store/slices/calendarOverlayingPanels/actions';
import MailsModalContent from './MailsModalContent';

const MailsModal: FC = () => {
  const dispatch = useAppDispatch();
  const mailsModalOpen = useAppSelector(selectMailsModalOpen);

  const handleClose = () => {
    dispatch(hideMailsModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleMailsModalOpen());
  }, []);

  return (
    <CustomModal
      maxWidth='md'
      open={mailsModalOpen}
      onClose={handleClose}
      aria-labelledby='Email and/or Mass Push Notification Modal'
      aria-describedby='Email and/or Mass Push Notification Modal For Scheduler'
      title='Email and/or Mass Push Notification'
    >
      <MailsModalContent toggleModalOpen={toggleModalOpen} />
    </CustomModal>
  );
};

MailsModal.displayName = 'MailsModal';

export default memo(MailsModal);
