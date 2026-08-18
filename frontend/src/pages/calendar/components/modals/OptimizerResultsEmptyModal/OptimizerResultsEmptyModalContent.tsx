import { memo } from 'react';
import { Typography, Box, Divider } from '@mui/material';
import { useAppSelector } from 'store/hooks';
import { optimizerDisabledConstraintsSelector } from 'store/selectors/optimizerSelectors';
import OptimizerResultsDisabledConstraintsTable from '../../OptimizerResultsDisabledConstraintsTable';

const OptimizerResultsEmptyModalContent = () => {
  const optimizerDisabledConstraints = useAppSelector(
    optimizerDisabledConstraintsSelector,
  );

  return (
    <Box
      sx={{
        minHeight: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography
        variant='h6'
        fontWeight='500'
        textAlign='center'
        marginTop={2}
        marginBottom={4}
      >
        Sorry, there are no results to show. <br /> The optimizer couldn't
        generate optimized solutions here.
      </Typography>

      {optimizerDisabledConstraints.length > 0 && (
        <>
          <Divider flexItem sx={{ opacity: 0.5 }} />
          <Typography
            variant='h6'
            fontWeight='500'
            textAlign='center'
            fontSize='1rem'
            marginTop={3}
            marginBottom={3}
            color='error'
          >
            You could disable the following constraints and try again:
          </Typography>
          <OptimizerResultsDisabledConstraintsTable />
        </>
      )}
    </Box>
  );
};

OptimizerResultsEmptyModalContent.displayName =
  'OptimizerResultsEmptyModalContent';

export default memo(OptimizerResultsEmptyModalContent);
