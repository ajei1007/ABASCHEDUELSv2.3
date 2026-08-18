import type { FC } from 'react';
import { Box, LinearProgress, Skeleton } from '@mui/material';

export interface IChecklistHeaderLinearProgressProps {
  percentage: number;
  isLoading: boolean;
}

const ChecklistHeaderLinearProgress: FC<
  IChecklistHeaderLinearProgressProps
> = ({ percentage, isLoading }) => {
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      {isLoading ? (
        <Skeleton
          width='100%'
          height='8px'
          variant='rectangular'
          animation='wave'
          sx={{
            transform: 'none',
            borderRadius: '100px',
          }}
        />
      ) : (
        <LinearProgress
          variant='determinate'
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 5,
            backgroundColor: '#f3f4f6',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4d53e0',
              transition: 'all 0.3s',
            },
          }}
        />
      )}
    </Box>
  );
};

export default ChecklistHeaderLinearProgress;
