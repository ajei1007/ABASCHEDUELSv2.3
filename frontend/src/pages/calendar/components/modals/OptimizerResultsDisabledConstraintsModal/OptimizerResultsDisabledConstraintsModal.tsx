import { memo } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Typography, Box } from '@mui/material';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import OptimizerResultsDisabledConstraintsTable from '../../OptimizerResultsDisabledConstraintsTable';
import { toggleOptimizerResultsDisabledConstraintsModal } from 'store/actions/optimizerActions';

const modalTitle = 'Optimizer Analyzer Status';

const OptimizerResultsDisabledConstraintsModal = () => {
  const dispatch = useAppDispatch();
  const optimizerResultsDisabledConstraintsModal = useAppSelector(
    (state) => state.optimizer.optimizerResultsDisabledConstraintsModal,
  );

  const handleToggleOptimizerResultsDisabledConstraintsModal = () => {
    dispatch(toggleOptimizerResultsDisabledConstraintsModal());
  };

  return (
    <CustomModal
      open={optimizerResultsDisabledConstraintsModal}
      onClose={handleToggleOptimizerResultsDisabledConstraintsModal}
      aria-labelledby={`${modalTitle} Modal`}
      aria-describedby={`${modalTitle} Modal For Scheduler`}
      title={modalTitle}
      maxWidth='lg'
      actionbuttons={
        <>
          <CustomButton
            onClick={handleToggleOptimizerResultsDisabledConstraintsModal}
            variant='outlined'
          >
            Close
          </CustomButton>
        </>
      }
    >
      <Box
        sx={{
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
          fontSize='1.15rem'
          marginTop={2}
          marginBottom={4}
          color='error'
        >
          For more optimal results, you can disable these constraints:
        </Typography>
        <OptimizerResultsDisabledConstraintsTable />
      </Box>
    </CustomModal>
  );
};

export default memo(OptimizerResultsDisabledConstraintsModal);
