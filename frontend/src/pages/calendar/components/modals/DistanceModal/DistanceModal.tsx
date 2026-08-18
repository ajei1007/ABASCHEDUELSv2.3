import { useCallback, memo, type FC } from 'react';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import DistanceModalContent from './DistanceModalContent';
import { selectDistanceModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleDistanceModalOpen,
  hideDistanceModal,
} from 'store/slices/calendarOverlayingPanels/actions';

const DistanceModal: FC = () => {
  const dispatch = useAppDispatch();
  const distanceModalOpen = useAppSelector(selectDistanceModalOpen);

  const handleClose = () => {
    dispatch(hideDistanceModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleDistanceModalOpen());
  }, []);

  return (
    <CustomModal
      open={distanceModalOpen}
      onClose={handleClose}
      aria-labelledby='Distance Modal'
      aria-describedby='Distance Modal For Scheduler'
      title='Distance & Duration Calculator'
      maxWidth='md'
    >
      <DistanceModalContent toggleModalOpen={toggleModalOpen} />
    </CustomModal>
  );
};

DistanceModal.displayName = 'DistanceModal';

export default memo(DistanceModal);
