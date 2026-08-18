import { Stack, Grid2 as Grid } from '@mui/material';
import RectangularSkeleton from 'components/SkeletonLoadings/RectangularSkeletonLoading';

const StatisticsSkeletongLoading = () => {
  return (
    <>
      <Grid container columns={{ sm: 12, lg: 12 }} spacing={2}>
        <Grid
          size={{
            sm: 12,
            lg: 6
          }}>
          <RectangularSkeleton height='421px' />
        </Grid>
        <Grid
          size={{
            sm: 12,
            lg: 6
          }}>
          <RectangularSkeleton height='421px' />
        </Grid>
      </Grid>
      <Stack>
        <RectangularSkeleton height='400px' />
      </Stack>
    </>
  );
}

export default StatisticsSkeletongLoading