import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Footer from 'components/Footer/Footer';
import { Stack, Typography } from '@mui/material';
import CustomButton from 'components/Button';
import Widget from 'components/Widget/Widget';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

const ErrorPage = () => {
  return (
    <div style={{ height: '100vh' }}>
      <Widget className='widget-p-md widget-h-100'>
        <Stack
          direction='row'
          justifyContent='center'
          alignItems='center'
          height='90vh'
        >
          <Stack spacing={2} sx={{ width: '40%' }}>
            <Typography variant='h1' fontWeight='600' color='#4d53e0'>
              <span>4</span>
              <span style={{ color: 'rgb(237, 100, 100)' }}>0</span>
              <span>4</span>
            </Typography>
            <Typography fontSize='24px' fontWeight='600'>
              <span
                style={{
                  color: 'rgb(237, 100, 100)',
                  fontSize: '36px',
                  fontWeight: '700',
                }}
              >
                Oops.
              </span>{' '}
              Looks like the page you're looking for no longer exists.
            </Typography>
            <Typography fontSize='16px'>
              But we're here to bring you back to safety.
            </Typography>
            <Link to='/app'>
              <CustomButton size='large'>Back to Home</CustomButton>
            </Link>
          </Stack>
          <Stack width={500} mt={2} alignItems='flex-star'>
            <Suspense>
              <ABASchedulesLogoAnimated />
            </Suspense>
          </Stack>
        </Stack>
        <Stack>
          <Footer />
        </Stack>
      </Widget>
    </div>
  );
};

export default ErrorPage;
