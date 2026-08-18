import { memo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppDispatch } from 'store/hooks';
import { toggleOptimizerResultsDisabledConstraintsModal } from 'store/actions/optimizerActions';

const OptimizerResultsAnalyzerNotPassed = ({ clickable = true }) => {
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        display: 'flex',
        columnGap: '0.45rem',
        alignItems: 'center',
        paddingTop: '0.15rem',
        paddingX: '0.15rem',
      }}
    >
      <button
        style={{
          display: 'flex',
          columnGap: '0.45rem',
          alignItems: 'center',
          padding: 0,
          margin: 0,
          border: 'none',
          background: 'none',
          cursor: clickable ? 'pointer' : 'default',
        }}
        type='button'
        onClick={
          clickable
            ? () => {
                dispatch(toggleOptimizerResultsDisabledConstraintsModal());
              }
            : undefined
        }
      >
        <CancelIcon fontSize='small' color='error' />
        <Typography
          fontSize='1rem'
          fontWeight='600'
          color='#d32f2f'
          sx={{
            paddingTop: '1px',
            lineHeight: 1.5,
          }}
        >
          Not passed
        </Typography>
      </button>

      {clickable && (
        <IconButton
          size='small'
          sx={{
            marginLeft: 'auto',
          }}
          color='error'
          onClick={() => {
            dispatch(toggleOptimizerResultsDisabledConstraintsModal());
          }}
        >
          <OpenInNewIcon fontSize='small' />
        </IconButton>
      )}
    </Box>
  );
};

export default memo(OptimizerResultsAnalyzerNotPassed);
