import { memo } from 'react';
import s from '../Calendar.module.scss';
import { Backdrop, Stack } from '@mui/material';
import Loader from 'components/Loader/Loader';

const BackdropLoading = ({ open, title }) => {
  return (
    <Backdrop className={s.backdropLoader} open={open}>
      <Stack direction='column' spacing='1rem'>
        <Loader />
        <p>{title}</p>
      </Stack>
    </Backdrop>
  );
};

export default memo(BackdropLoading);
