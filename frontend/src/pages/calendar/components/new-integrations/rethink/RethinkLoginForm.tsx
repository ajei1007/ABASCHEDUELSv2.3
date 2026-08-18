import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Stack } from '@mui/material';
import CustomButton from 'components/Button';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { useAppDispatch } from 'store/hooks';
import {
  setShownLoginModal,
  setShownIntegrationModal,
} from 'store/slices/newIntegration/actions';

interface ILoginFormSchema {
  clientId: string;
  clientSecret: string;
}

const RethinkLoginForm = ({ onCancel }: { onCancel: () => void }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  const initialValues = useMemo(
    () =>
      ({
        clientId: '',
        clientSecret: '',
      } as ILoginFormSchema),
    [],
  );

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        clientId: yup.string().required('ClientID is required'),
        clientSecret: yup.string().required('Client Secret is required'),
      }),
    [],
  );

  const handleSubmit = async (values: ILoginFormSchema) => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/integrations/login-to/rethink`, {
        credentials: values,
      });

      if (response.data.result === 'success') {
        dispatch(setShownLoginModal(false));
        dispatch(setShownIntegrationModal(true));
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(form) => (
        <form onSubmit={form.handleSubmit}>
          <Stack direction='column' spacing='1.5rem'>
            <div>
              <CustomInput
                name='clientId'
                id='clientId'
                value={form.values.clientId}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                type='text'
                label='Client ID'
                error={!!form.touched.clientId && !!form.errors.clientId}
              />
              <CustomErrorMessage name='clientId' form={form} />
            </div>
            <div>
              <CustomInput
                name='clientSecret'
                id='clientSecret'
                value={form.values.clientSecret}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                type='text'
                label='Client Secret'
                error={
                  !!form.touched.clientSecret && !!form.errors.clientSecret
                }
              />
              <CustomErrorMessage name='clientSecret' form={form} />
            </div>
          </Stack>
          <Stack
            flexDirection='row'
            justifyContent='flex-end'
            alignItems='center'
            marginTop={4}
            width={'100%'}
          >
            <Stack
              flexDirection='row'
              justifyContent='flex-end'
              alignItems='center'
              columnGap={1}
            >
              <CustomButton loading={loading} variant='contained' type='submit'>
                Authenticate
              </CustomButton>
              <CustomButton
                variant='outlined'
                disabled={loading}
                type='button'
                onClick={!loading ? onCancel : undefined}
              >
                Cancel
              </CustomButton>
            </Stack>
          </Stack>
        </form>
      )}
    </Formik>
  );
};

export default RethinkLoginForm;
