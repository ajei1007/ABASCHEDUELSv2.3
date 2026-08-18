import { useMemo, type FC } from 'react';
import { Stack, Skeleton } from '@mui/material';

interface IChecklistBodyLoadingProps {
  count?: number;
  height?: string;
}

const ChecklistBodyLoading: FC<IChecklistBodyLoadingProps> = ({
  count = 3,
  height = '90px',
}) => {
  // Memoize skeleton elements to avoid re-creating on each render
  const skeletonElements = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          width='100%'
          height={height}
          variant='rectangular'
          animation='wave'
          sx={{
            transform: 'none',
            borderRadius: '8px',
            bgcolor: '#e9ecef', // Consistent with other skeleton components
          }}
        />
      )),
    [count, height],
  );

  return (
    <Stack
      flexDirection='column'
      pt={2}
      rowGap='1rem'
      role='progressbar'
      aria-label='Loading checklist items'
      aria-busy='true'
    >
      {skeletonElements}
    </Stack>
  );
};

ChecklistBodyLoading.displayName = 'ChecklistBodyLoading';

export default ChecklistBodyLoading;
