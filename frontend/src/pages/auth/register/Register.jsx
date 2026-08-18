/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAppDispatch } from 'store/hooks';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import { decodeJwt } from 'jose';
import { receiveToken, doInit, registerUser } from 'store/actions/authActions';
import CustomButton from 'components/Button';
import { Stack, Grid2 as Grid, Typography, Tooltip } from '@mui/material';
import CustomInput from '../../../components/CustomInputModal/CustomInput';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import config from 'config';
import passwordGenerator from 'utils/passwordGenerator';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import {
  passwordConfirmValidationSchema,
  passwordValidationSchema,
} from 'helpers/validations/passwordValidationSchema';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  secretCode: '',
};

const schema = yup.object({
  firstName: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('First Name is required'),
  lastName: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Last Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: passwordValidationSchema,
  passwordConfirm: passwordConfirmValidationSchema,
  secretCode: yup
    .string()
    .required('Secret Code is required'),
});

const Register = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { companyLabel, companyLogo, hasLogoAnimation } = config;

  const [loading, setLoading] = useState(false);

  const handleRegister = async (values, { resetForm }) => {
    setLoading(true);
    const isValid = await dispatch(registerUser(values));
    if (isValid) {
      resetForm()
    }
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
      <Grid container sx={{height: '100%'}}>
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
        <Grid
          alignItems='center'
          justifyContent='center'
          size={{
            xs: 12,
            lg: 6
          }}>
          <Stack
            height='100%'
            width='100%'
            flexDirection='row'
            alignItems='center'
            justifyContent='center'
            sx={{background: '#fff'}}
          >
            <Stack className='widget-auth' padding={'24px 32px'} sx={{background: '#fff'}}>
              <Stack py={3} direction='row' justifyContent='space-between'>
                <Typography variant='h4'>
                  Register
                </Typography>
                <div className='logo-block'>
                  <Typography variant='body1' mb={0}>
                    {companyLabel}
                  </Typography>
                </div>
              </Stack>
              <Formik
                onSubmit={handleRegister}
                initialValues={initialValues}
                validationSchema={schema}
                enableReinitialize={false}
              >
                {(form) => (
                  <Form onSubmit={form.handleSubmit}>
                    <Stack direction='column' spacing={2}>
                      <div>
                        <CustomInput
                          name='firstName'
                          id='firstName'
                          value={form.values.firstName}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          type='text'
                          label='First Name'
                          error={
                            !!form.touched.firstName && !!form.errors.firstName
                          }
                        />
                        <CustomErrorMessage name='firstName' form={form} />
                      </div>
                      <div>
                        <CustomInput
                          name='lastName'
                          id='lastName'
                          value={form.values.lastName}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          type='text'
                          label='Last Name'
                          error={
                            !!form.touched.lastName && !!form.errors.lastName
                          }
                        />
                        <CustomErrorMessage name='lastName' form={form} />
                      </div>
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
                      {/* <div>
                      <CustomInput
                        name='companyName'
                        id='companyName'
                        value={form.values.companyName}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        type='text'
                        label='Company Name'
                        error={
                          !!form.touched.companyName &&
                          !!form.errors.companyName
                        }
                      />
                      <CustomErrorMessage name='companyName' form={form} />
                    </div> */}
                      <div>
                        <Stack justifyContent='space-between' direction='row'>
                          <label>Password</label>
                          <Tooltip
                            title='Generate password'
                            placement='right'
                            arrow
                          >
                            <button
                              id='MagicButtonTooltip'
                              className='magic-button'
                              type='button'
                              onClick={() => {
                                const password = passwordGenerator();
                                form.setValues({
                                  ...form.values,
                                  password,
                                  passwordConfirm: password,
                                });
                              }}
                            >
                              <AutoFixHighOutlinedIcon />
                            </button>
                          </Tooltip>
                        </Stack>
                        <CustomInput
                          id='password'
                          value={form.values.password}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          // type='password'
                          name='password'
                          error={
                            !!form.touched.password && !!form.errors.password
                          }
                        />
                        <CustomErrorMessage name='password' form={form} />
                      </div>
                      <div>
                        <CustomInput
                          name='passwordConfirm'
                          id='passwordConfirm'
                          value={form.values.passwordConfirm}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          type='passwordConfirm'
                          label='Confirm Password'
                          error={
                            !!form.touched.passwordConfirm &&
                            !!form.errors.passwordConfirm
                          }
                        />
                        <CustomErrorMessage
                          name='passwordConfirm'
                          form={form}
                        />
                      </div>
                      <div>
                      <CustomInput
                          name='secretCode'
                          id='secretCode'
                          value={form.values.secretCode}
                          onChange={form.handleChange}
                          onBlur={form.handleBlur}
                          type='text'
                          label='Secret Code'
                          error={
                            !!form.touched.secretCode &&
                            !!form.errors.secretCode
                          }
                        />
                        <CustomErrorMessage
                          name='secretCode'
                          form={form}
                        />
                      </div>
                      <CustomButton loading={loading} type='submit'>
                        Register
                      </CustomButton>
                      <Link to='/login'>
                        <CustomButton
                          type='button'
                          variant='outlined'
                          style={{ width: '100%' }}
                        >
                          Login
                        </CustomButton>
                      </Link>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <footer className='auth-footer'>
        {new Date().getFullYear()} &copy; {companyLabel}
      </footer>
    </div>
  );
};

Register.isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  const date = new Date().getTime() / 1000;
  const data = decodeJwt(token);
  if (!data) return;
  return date < data.exp;
};

export default Register;
