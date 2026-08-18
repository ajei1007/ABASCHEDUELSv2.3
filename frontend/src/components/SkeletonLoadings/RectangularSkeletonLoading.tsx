import { Skeleton } from '@mui/material';

const RectangularSkeleton = ({ height }: { height: string }) => (
  <Skeleton
    sx={{ bgcolor: '#e9ecef', borderRadius: '10px' }}
    variant='rectangular'
    height={height}
  />
);

export default RectangularSkeleton;
