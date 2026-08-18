import { useEffect, useState, lazy, Suspense } from 'react';
import { Stack, Typography } from '@mui/material';
import CustomButton from 'components/Button';
import Widget from 'components/Widget/Widget';
import config from 'config';
import axios from 'axios'
import { toast } from 'react-toastify';

const ABASchedulesLogoAnimated = lazy(
  () => import('components/AnimatedCompanyLogos/ABASchedulesLogoAnimated'),
);

// TODO move utls
function getQueryParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const SchedulerConfirmation = () => {
  const { companyLabel } = config;
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('Confirming your schedules...')

  useEffect(() => {
    const id = getQueryParameter('id')
    if (id) {
      confirmSchedules(id)
    } else {
      setText('Something went wrong. Try again!')
    }
  }, [])

  const confirmSchedules = async (id) => {
    let message = ''
    setLoading(true);
    try {
      const res = await axios.get(`/email-confirmation/${id}`)
      if (res.data) {
        message = 'Your schedules are successfully confirmed!'
      } else {
        message = 'The link is expired!'
      }
    } catch (error) {
      const msg = error?.response?.data;
      if (msg) {
        message = msg;
      } else {
        message = 'Something went wrong. Try again!'
      }
      toast.error(message);
    } finally {
      setLoading(false)
    }
    setText(message)
  }

  return (
    <div style={{ height: '100vh' }}>
      <Widget className='widget-p-md widget-h-100'>
        <Stack justifyContent='center' alignItems='center' spacing={4} pt={6}>
          <Stack width={300} mt={2} alignItems='flex-star'>
            <Suspense>
              <ABASchedulesLogoAnimated />
            </Suspense>
          </Stack>
          <Stack spacing={2} alignItems='center' justifyContent='center'>
            <Typography fontSize='24px' fontWeight='600'>
              {text}
            </Typography>
            <CustomButton loading={loading} onClick={() => window.location.href = '/admin/scheduler'} size='large'>Go the app</CustomButton>
          </Stack>
        </Stack>
        <footer className='auth-footer'>
          {new Date().getFullYear()} &copy; {companyLabel}
        </footer>
      </Widget>
    </div>
  );
};

export default SchedulerConfirmation;
