import { Grid2 as Grid, Skeleton } from '@mui/material';

const NpsStatisticsContentSkeletonLoading = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
        <Skeleton height='500px' variant='rounded' animation='wave' />
      </Grid>
      <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
        <Skeleton height='500px' variant='rounded' animation='wave' />
      </Grid>
      <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
        <Skeleton height='400px' variant='rounded' animation='wave' />
      </Grid>
      <Grid size={{ sm: 12, md: 12, lg: 6 }} alignItems='stretch'>
        <Skeleton height='400px' variant='rounded' animation='wave' />
      </Grid>
      <Grid size={{ sm: 12 }}>
        <Skeleton height='250px' variant='rounded' animation='wave' />
      </Grid>
      <Grid size={{ sm: 12 }}>
        <Skeleton height='80px' variant='rounded' animation='wave' />
      </Grid>
    </Grid>
  );
};

export default NpsStatisticsContentSkeletonLoading;
