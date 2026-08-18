import { memo } from 'react';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  newIntegrationSoftwareSelector,
  newIntegrationShownIntegrationModalSelector,
} from 'store/slices/newIntegration/selectors';
import {
  setSoftware,
  setShownIntegrationModal,
} from 'store/slices/newIntegration/actions';
import RethinkModalContent from './rethink/RethinkModalContent';
import TherapyPmsModalContent from './therapypms/TherapyPmsModalContent';

const INTEGRATION_CONTENT = {
  rethink: RethinkModalContent,
  therapypms: TherapyPmsModalContent,
};

const NewIntegrationModal = () => {
  const dispatch = useAppDispatch();

  const newIntegrationShownIntegrationModal = useAppSelector(
    newIntegrationShownIntegrationModalSelector,
  );
  const newIntegrationSoftware = useAppSelector(newIntegrationSoftwareSelector);

  const IntegrationContent = newIntegrationSoftware
    ? INTEGRATION_CONTENT[newIntegrationSoftware]
    : null;

  const handleModalClose = () => {
    dispatch(setSoftware(null));
    dispatch(setShownIntegrationModal(false));
  };

  return (
    <CustomModal
      maxWidth='md'
      open={newIntegrationShownIntegrationModal}
      onClose={handleModalClose}
      aria-labelledby='Integration Login Modal'
      aria-describedby='Integration Login Modal'
      title={`${newIntegrationSoftware} Integration`}
    >
      <>
        {IntegrationContent && (
          <IntegrationContent
            key={newIntegrationSoftware}
            onCancel={handleModalClose}
          />
        )}
      </>
    </CustomModal>
  );
};

export default memo(NewIntegrationModal);
