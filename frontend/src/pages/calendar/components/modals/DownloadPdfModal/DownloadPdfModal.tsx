import { memo, type FC } from 'react';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectPdfModalOpen } from 'store/slices/calendarOverlayingPanels';
import { hidePdfModal } from 'store/slices/calendarOverlayingPanels/actions';
import { checkNpsSurvey } from 'store/slices/npsSurvey/actions';
import DownloadPdfModalContent from './DownloadPdfModalContent';

const DownloadPdfModal: FC = () => {
  const dispatch = useAppDispatch();
  const pdfModalOpen = useAppSelector(selectPdfModalOpen);

  const handleClose = () => {
    dispatch(hidePdfModal());
    dispatch(
      checkNpsSurvey({
        chance: 1, // 100% chance to show NPS survey
      }),
    );
  };

  return (
    <CustomModal
      open={pdfModalOpen}
      onClose={handleClose}
      aria-labelledby='Download Scheduler as a PDF'
      aria-describedby='Download Scheduler as a PDF'
      title={'Download Scheduler as a PDF'}
      maxWidth='xl'
      actionbuttons={
        <>
          <CustomButton onClick={handleClose} variant='outlined'>
            Cancel
          </CustomButton>
        </>
      }
    >
      <DownloadPdfModalContent />
    </CustomModal>
  );
};

DownloadPdfModal.displayName = 'DownloadPdfModal';

export default memo(DownloadPdfModal);
