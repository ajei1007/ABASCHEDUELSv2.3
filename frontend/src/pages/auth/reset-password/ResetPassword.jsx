/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useLocation, useNavigate } from 'react-router';
import { resetPassword } from 'store/actions/authActions';
import Widget from '../../../components/Widget/Widget';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
  passwordConfirmValidationSchema,
  passwordValidationSchema,
} from 'helpers/validations/passwordValidationSchema';
import Tooltip from '@mui/material/Tooltip';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import passwordGenerator from 'utils/passwordGenerator';
import { Stack, Grid2 as Grid, Typography, FormControl } from '@mui/material';
import CustomButton from 'components/Button';
import CustomInput from '../../../components/CustomInputModal/CustomInput';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import config from 'config';

const ResetPassword = () => {
  const [userToken, setUserToken] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { companyLabel, companyLogo } = config;
  //
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    if (data.password && userToken) {
      setLoading(true);
      await dispatch(resetPassword(userToken, data.password));
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setUserToken(token)
    } else {
      navigate('/login');
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
              <Stack pb={2}>
                <Typography className='auth-header' mb={0}>Reset Password</Typography>
              </Stack>
              <Formik
                onSubmit={handleSubmit}
                initialValues={{
                  password: '',
                  passwordConfirm: '',
                }}
                enableReinitialize
                validationSchema={Yup.object().shape({
                  password: passwordValidationSchema,
                  passwordConfirm: passwordConfirmValidationSchema,
                })}
              >
                {(form) => {
                  const {
                    values,
                    setFieldValue,
                    setValues,
                    handleBlur,
                    touched,
                    errors,
                  } = form;
                  return (
                    <Form>
                      <FormControl sx={{ mb : 2 }} fullWidth>
                        <Stack direction='row'>
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
                                setValues({
                                  ...values,
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
                          onChange={(e) =>
                            setFieldValue('password', e.target.value)
                          }
                          onBlur={handleBlur}
                          value={values.password}
                          type='text'
                          name='password'
                          error={!!touched.password && !!errors.password}
                        />
                        <CustomErrorMessage name='password' form={form} />
                      </FormControl>
                      <FormControl sx={{ mb: 2 }}  fullWidth>
                        <CustomInput
                          id='confirm-password'
                          value={values.passwordConfirm}
                          onChange={(e) =>
                            setFieldValue('passwordConfirm', e.target.value)
                          }
                          type='text'
                          label='Confirm Password'
                          name='passwordConfirm'
                          onBlur={handleBlur}
                          error={
                            !!touched.passwordConfirm &&
                            !!errors.passwordConfirm
                          }
                        />
                        <CustomErrorMessage
                          name='passwordConfirm'
                          form={form}
                        />
                      </FormControl>
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
                  );
                }}
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
              <img
                src={companyLogo}
                width={550}
                height={550}
                alt='ABA Schedules'
              />
            </div>
          </Grid>
      </Grid>
      <footer className='auth-footer'>
        {new Date().getFullYear()} &copy; {companyLabel}
      </footer>
    </div>
  );
};

export default ResetPassword;
