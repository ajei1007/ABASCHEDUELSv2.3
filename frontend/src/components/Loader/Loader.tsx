import { CircularProgress, Stack } from '@mui/material';

const Loader = () => (
  <Stack direction='row' justifyContent='center' data-qa='loader'>
    <CircularProgress />
  </Stack>
);

export default Loader;
