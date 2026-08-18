/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useLocation } from 'react-router';
import { loginUser, receiveToken, doInit } from 'store/actions/authActions';
import Widget from '../../../components/Widget/Widget';
import CustomButton from 'components/Button';
import { Stack, Grid2 as Grid, Typography } from '@mui/material';
import CustomInput from '../../../components/CustomInputModal/CustomInput';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import config from 'config';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

const Login = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { companyLabel, companyLogo, hasLogoAnimation } = config;

  const [loading, setLoading] = useState(false);

  const doLogin = async (values) => {
    setLoading(true);
    await dispatch(loginUser(values));
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

  const initialValues = {
    email: '',
    password: '',
  };

  const loginSchema = yup.object({
    email: yup
      .string()
      .email('Please enter a valid email')
      .required('Email is required'),
    password: yup.string().required('Password is required'),
  });

  return (
    <div className='auth-page'>
      <Grid container sx={{ height: '100%' }}>
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <Widget className='widget-auth widget-p-lg' sectionClass='widget-c'>
            <Stack py={3} direction='row' justifyContent='space-between'>
              <Typography className='auth-header' mb={0}>
                Login
              </Typography>
              <div className='logo-block'>
                <Typography variant='body1' mb={0}>
                  {companyLabel}
                </Typography>
              </div>
            </Stack>
            <Formik
              onSubmit={doLogin}
              initialValues={initialValues}
              validationSchema={loginSchema}
              enableReinitialize={false}
            >
              {(form) => (
                <Form onSubmit={form.handleSubmit} data-qa='login-form'>
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
                        data-qa='login-email'
                      />
                      <CustomErrorMessage
                        name='email'
                        form={form}
                        data-qa='login-error'
                      />
                    </div>
                    <div>
                      <Stack justifyContent='space-between' direction='row'>
                        <label htmlFor='password'>Password</label>
                        <Link to='/forgot-password'>Forgot password?</Link>
                      </Stack>
                      <CustomInput
                        id='password'
                        value={form.values.password}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        type='password'
                        name='password'
                        error={
                          !!form.touched.password && !!form.errors.password
                        }
                        data-qa='login-password'
                      />
                      <CustomErrorMessage
                        name='password'
                        form={form}
                        data-qa='login-error'
                      />
                    </div>
                    <CustomButton
                      loading={loading}
                      style={{ width: '100%' }}
                      type='submit'
                      data-qa='login-submit'
                    >
                      Login
                    </CustomButton>
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
            lg: 6,
          }}
        >
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

export default Login;
