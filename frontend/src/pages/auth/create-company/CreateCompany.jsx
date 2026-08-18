/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, lazy, Suspense } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useLocation, useNavigate } from 'react-router';
import {
  createCompany,
  validateToken,
} from 'store/actions/authActions';
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

const initialValues = {
  companyName: '',
};

const schema = yup.object({
  companyName: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Company Name is required'),
});

const CreateCompany = () => {
  const { companyLabel, companyLogo, hasLogoAnimation } = config;
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  //
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      const userObj = await dispatch(validateToken(token));
      if (userObj) {
        setUser(userObj);
      }
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const data = {
      ...values,
      user: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
      },
    };
    await dispatch(createCompany(data));

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <div className='auth-page'>
      <Grid container>
        <Grid
          alignItems='center'
          justifyContent='center'
          size={{
            xs: 12,
            lg: 6
          }}>
          <Stack
            height='100%'
            flexDirection='row'
            alignItems='center'
            justifyContent='center'
          >
            <Stack className='widget-auth' padding={'24px 32px'}>
              <Stack py={6} spacing={2}>
                <Typography variant='h4'>
                  Hi {user?.firstName} {user?.lastName}!
                </Typography>
                <Typography variant='subtitle1'>
                  Please continue to create your company.
                </Typography>
              </Stack>
              <Formik
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={schema}
                enableReinitialize={false}
              >
                {(form) => (
                  <Form onSubmit={form.handleSubmit}>
                    <Stack direction='column' spacing={2}>
                      <div>
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
                      </div>
                      <CustomButton loading={loading} type='submit'>
                        Create
                      </CustomButton>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Stack>
          </Stack>
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

export default CreateCompany;
