/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useLocation } from 'react-router';
import {
  receiveToken,
  doInit,
  sendPasswordResetEmail,
} from 'store/actions/authActions';
import Widget from '../../../components/Widget/Widget';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import CustomButton from 'components/Button';
import { Stack, Grid2 as Grid, Typography } from '@mui/material';
import CustomInput from '../../../components/CustomInputModal/CustomInput';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import config from 'config';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

const ForgotPassword = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { companyLabel, companyLogo, hasLogoAnimation } = config;
  //
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    await dispatch(sendPasswordResetEmail(data.email));
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      dispatch(receiveToken(token));
      dispatch(doInit());
    }
  }, []);

  return (
    <div className='auth-page'>
      <Grid
        container
        alignItems='center'
        justifyContent='space-between'
        height='100%'
      >
        <Grid
          height='100%'
          size={{
            xs: 12,
            lg: 6
          }}>
          <Widget className='widget-auth widget-p-lg' sectionClass='widget-c'>
            <Stack py={3}>
              <Typography className='auth-header' mb={0}>
                Forgot Password
              </Typography>
            </Stack>
            <Formik
              onSubmit={handleSubmit}
              initialValues={{
                email: '',
              }}
              enableReinitialize
              validationSchema={Yup.object().shape({
                email: Yup.string()
                  .required('Email is required')
                  .email('Invalid email'),
              })}
            >
              {(form) => (
                <Form onSubmit={form.handleSubmit}>
                  <Stack mb={1}>
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
                  </Stack>
                  <Stack
                    direction='column'
                    alignItems='center'
                    justifyContent='flex-start'
                    spacing='1rem'
                  >
                    <CustomButton
                      type='submit'
                      style={{ width: '100%' }}
                      loading={loading}
                    >
                      Submit
                    </CustomButton>
                    <Link
                      to='/login'
                      style={{ display: 'block', width: '100%' }}
                    >
                      <CustomButton
                        type='button'
                        variant='outlined'
                        style={{ width: '100%' }}
                      >
                        Go to login page
                      </CustomButton>
                    </Link>
                  </Stack>
                </Form>
              )}
            </Formik>
          </Widget>
        </Grid>
        <Grid
          sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
          }}
          size={{
            xs: 0,
            lg: 6
          }}>
           <div>
            {hasLogoAnimation ? (
              <Suspense>
                <ABASchedulesLogoAnimated width={'700'} height={'700'} />
              </Suspense>
            ) : (
              <img
                src={companyLogo}
                width={550}
                height={550}
                alt='ABASchedules logo'
              />
            )}
          </div>
        </Grid>
      </Grid>
      <footer className='auth-footer'>
        {new Date().getFullYear()} &copy; {companyLabel}
      </footer>
    </div>
  );
};

export default ForgotPassword;
