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
  email: string;
  password: string;
}

const TherapyPmsLoginForm = ({ onCancel }: { onCancel: () => void }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  const initialValues = useMemo(
    () =>
      ({
        email: '',
        password: '',
      }) as ILoginFormSchema,
    [],
  );

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        email: yup.string().required('Email is required'),
        password: yup.string().required('Password is required'),
      }),
    [],
  );

  const handleSubmit = async (values: ILoginFormSchema) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`/integrations/login-to/therapypms`, {
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
                name='email'
                id='email'
                value={form.values.email}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                type='text'
                label='Email'
                error={!!form.touched.email && !!form.errors.email}
              />
              <CustomErrorMessage name='email' form={form} />
            </div>
            <div>
              <CustomInput
                name='password'
                id='password'
                value={form.values.password}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                type='text'
                label='Password'
                error={!!form.touched.password && !!form.errors.password}
              />
              <CustomErrorMessage name='password' form={form} />
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

export default TherapyPmsLoginForm;
