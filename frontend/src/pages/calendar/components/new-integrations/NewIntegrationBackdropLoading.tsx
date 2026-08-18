import s from 'pages/calendar/Calendar.module.scss';
import { Backdrop, Stack } from '@mui/material';
import Loader from 'components/Loader/Loader';
import CustomButton from 'components/Button';

const NewIntegrationBackdropLoading = ({
  open,
  title,
  onCancel,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
}) => {
  return (
    <Backdrop className={s.backdropLoader} open={open}>
      <Stack direction='column' alignItems='center' spacing='1rem'>
        <Loader />
        <p>{title}</p>
        <CustomButton
          sx={{
            marginTop: '1.5rem!important',
            width: '6rem',
            minWidth: '1rem',
          }}
          variant='contained'
          color='error'
          onClick={onCancel}
        >
          <span>Cancel</span>
        </CustomButton>
      </Stack>
    </Backdrop>
  );
};

export default NewIntegrationBackdropLoading;
