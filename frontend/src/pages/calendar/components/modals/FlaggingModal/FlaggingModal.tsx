import { memo, useCallback, type FC } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { hideFlaggingModal } from 'store/slices/flagging/actions';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import FlaggingModalContent from './FlaggingModalContent';

const FlaggingModal: FC = () => {
  const dispatch = useAppDispatch();

  const flaggingModalOpen = useAppSelector(
    (state) => state.flagging?.flaggingModalOpen || false,
  );

  const handleModalClose = useCallback(() => {
    dispatch(hideFlaggingModal());
  }, [dispatch]);

  return (
    <CustomModal
      open={flaggingModalOpen}
      maxWidth='xl'
      onClose={handleModalClose}
      aria-labelledby='Flagging Modal'
      aria-describedby='Flagging Modal For Scheduler'
      title='Flagging'
      data-qa='flagging-modal'
      actionbuttons={
        <>
          <CustomButton
            onClick={handleModalClose}
            variant='outlined'
            data-qa='flagging-cancel'
          >
            Cancel
          </CustomButton>
        </>
      }
    >
      <FlaggingModalContent />
    </CustomModal>
  );
};

FlaggingModal.displayName = 'FlaggingModal';

export default memo(FlaggingModal);
