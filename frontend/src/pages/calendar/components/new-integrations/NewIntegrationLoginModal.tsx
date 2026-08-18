import { memo } from 'react';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  newIntegrationSoftwareSelector,
  newIntegrationShownLoginModalSelector,
} from 'store/slices/newIntegration/selectors';
import {
  setSoftware,
  setShownLoginModal,
} from 'store/slices/newIntegration/actions';
import RethinkLoginForm from './rethink/RethinkLoginForm';
import TherapyPmsLoginForm from './therapypms/TherapyPmsLoginForm';

const INTEGRATION_LOGIN_FORMS = {
  rethink: RethinkLoginForm,
  therapypms: TherapyPmsLoginForm,
};

const NewIntegrationLoginModal = () => {
  const dispatch = useAppDispatch();

  const newIntegrationShownLoginModal = useAppSelector(
    newIntegrationShownLoginModalSelector,
  );
  const newIntegrationSoftware = useAppSelector(newIntegrationSoftwareSelector);

  const LoginForm = newIntegrationSoftware
    ? INTEGRATION_LOGIN_FORMS[newIntegrationSoftware]
    : null;

  const handleModalClose = () => {
    dispatch(setSoftware(null));
    dispatch(setShownLoginModal(false));
  };

  return (
    <CustomModal
      maxWidth='sm'
      open={newIntegrationShownLoginModal}
      onClose={handleModalClose}
      aria-labelledby='Integration Login Modal'
      aria-describedby='Integration Login Modal'
      title={`${newIntegrationSoftware} Login`}
    >
      <>
        {LoginForm && (
          <LoginForm key={newIntegrationSoftware} onCancel={handleModalClose} />
        )}
      </>
    </CustomModal>
  );
};

export default memo(NewIntegrationLoginModal);
