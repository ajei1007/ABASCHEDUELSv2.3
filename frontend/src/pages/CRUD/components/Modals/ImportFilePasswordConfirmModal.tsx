import CustomButton from 'components/Button';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomModal from 'components/Modal';
import { type FC, useState } from 'react';

interface IImportFilePasswordConfirmModalProps {
  name: string;
  loading: boolean;
  passwordActionModal: boolean;
  togglePasswordActionModal: () => void;
  onSubmit: (password: string) => void;
}

const ImportFilePasswordConfirmModal: FC<IImportFilePasswordConfirmModalProps> = ({
  name,
  passwordActionModal,
  togglePasswordActionModal,
  loading,
  onSubmit,
}) => {
  const [password, setPassword] = useState('');

  const changePassword = (e: any) => {
    setPassword(e.target.value);
  };

  const handleSubmitPassword = () => {
    onSubmit(password);
  }

  return (
    <CustomModal
      maxWidth='sm'
      open={passwordActionModal}
      onClose={togglePasswordActionModal}
      aria-labelledby='Importing password Modal'
      aria-describedby='Importing password Scheduler'
      title={`Password required to upload ${name}s`}
      actionbuttons={
        <>
          <CustomButton onClick={handleSubmitPassword} loading={loading}>
            Submit
          </CustomButton>
          <CustomButton variant='outlined' onClick={togglePasswordActionModal}>
            Close
          </CustomButton>
        </>
      }
    >
      <CustomInput
        id='importPassword'
        value={password}
        onChange={changePassword}
        type='password'
        name='importPassword'
        placeholder='Password'
        label={'Password'}
        required={false}
        error={false}
      />
    </CustomModal>
  );
};

export default ImportFilePasswordConfirmModal;
