import { Stack, Grid2 as Grid } from '@mui/material';
import RectangularSkeleton from 'components/SkeletonLoadings/RectangularSkeletonLoading';

const DashboardSkeltonLoading = () => {
  return (
    <Stack rowGap={2}>
      {/* <Stack direction='row' alignItems='center' spacing={1}>
        {Array(3)
          .fill()
          .map((_, i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height='30px'
              width='100px'
              sx={{ borderRadius: '1rem' }}
            />
          ))}
      </Stack> */}
      <Grid container columns={{ sm: 12, lg: 12 }} spacing='1rem'>
        <Grid
          size={{
            sm: 6,
            lg: 3
          }}>
          <RectangularSkeleton height='88px' />
        </Grid>
        <Grid
          size={{
            sm: 6,
            lg: 3
          }}>
          <RectangularSkeleton height='88px' />
        </Grid>
        <Grid
          size={{
            sm: 6,
            lg: 3
          }}>
          <RectangularSkeleton height='88px' />
        </Grid>
        <Grid
          size={{
            sm: 6,
            lg: 3
          }}>
          <RectangularSkeleton height='88px' />
        </Grid>
      </Grid>
      <Stack>
        <RectangularSkeleton height='471px' />
      </Stack>
    </Stack>
  );
};

export default DashboardSkeltonLoading;
