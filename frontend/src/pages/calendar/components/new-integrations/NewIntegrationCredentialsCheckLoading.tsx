import { memo } from 'react';
import { useAppSelector } from 'store/hooks';
import BackdropLoading from '../BackdropLoading';

const NewIntegrationCredentialsCheckLoading = () => {
  const checkingCredentials = useAppSelector(
    (state) => state.newIntegration.checkingCredentials,
  );

  return (
    <BackdropLoading
      open={checkingCredentials}
      title='Checking integration credentials...'
    />
  );
};

export default memo(NewIntegrationCredentialsCheckLoading);
