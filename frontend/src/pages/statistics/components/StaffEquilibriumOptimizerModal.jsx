import { Grid2 as Grid, Stack, Typography } from '@mui/material';
import CustomButton from 'components/Button';
import Loader from 'components/Loader/Loader';
import CustomModal from 'components/Modal';
import UndynamicTable from 'pages/calendar/components/UndynamicTable';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import {
  confirmStaffingEquilibriumOptimizer,
  setStaffingEquilibriumOptimizerModal,
} from 'store/slices/statistics/actions';

const columns = [
  {
    accessorKey: 'Original Center',
    header: 'Original Center',
  },
  {
    accessorFn: (row) => row.type,
    id: 'type',
    header: 'Type',
    Cell: (row) => {
      const type = row.row.original?.type;
      if (type) {
        // const typeColor = type === 'delete' ? '#ff4b23' : '#43bc13';
        // const typeLabel = type === 'delete' ? 'Replacing' : 'Creating';
        let typeColor = '#000000';
        let typeLabel = '-';
        if (type === 'Send') {
          typeColor = '#43bc13';
          typeLabel = 'Send';
        } else if (type === 'Received') {
          typeColor = '#ffa100';
          typeLabel = 'Received';
        }
        return <p style={{ color: typeColor }}>{typeLabel}</p>;
      }
      return;
    },
    size: 90,
  },
  {
    accessorKey: 'Clients',
    header: 'Clients',
    size: 90,
  },
  {
    accessorKey: 'Initial Employees',
    header: 'Initial Employees',
  },
  {
    accessorKey: 'Final Employees',
    header: 'Final Employees',
  },
  {
    accessorKey: 'initial_ratio_difference',
    header: 'Initial Ratio Difference',
    size: 130,
  },
  {
    accessorKey: 'final_ratio_difference',
    header: 'Final Ratio Difference',
    size: 130,
  },
  {
    accessorKey: 'Final Ratio',
    header: 'Final Ratio',
    size: 130,
  },
  {
    accessorKey: 'Initial Ratio',
    header: 'Initial Ratio',
  },
  {
    accessorKey: 'Received',
    header: 'Received',
    size: 100,
  },
  {
    accessorKey: 'Sent',
    header: 'Sent',
    size: 80,
  },
  {
    accessorKey: 'Target Ratio',
    header: 'Target Ratio',
  },
];

const StaffEquilibriumOptimizerModal = () => {
  const dispatch = useAppDispatch();
  const staffingEquilibriumOptimizerModal = useSelector(
    (state) => state.statistics.staffingEquilibriumOptimizerModal,
  );
  const staffingEquilibriumOptimizerData = useSelector(
    (state) => state.statistics.staffingEquilibriumOptimizerData,
  );
  const staffingEquilibriumOptimizerLoading = useSelector(
    (state) => state.statistics.staffingEquilibriumOptimizerLoading,
  );

  const toggleModal = () => {
    dispatch(
      setStaffingEquilibriumOptimizerModal(!staffingEquilibriumOptimizerModal),
    );
  };

  const handleStart = () => {
    dispatch(confirmStaffingEquilibriumOptimizer());
  };

  return (
    <CustomModal
      maxWidth='xl'
      open={staffingEquilibriumOptimizerModal}
      hideClose
      onClose={toggleModal}
      aria-labelledby='StaffEquilibriumOptimizerModal'
      aria-describedby='StaffEquilibriumOptimizerModal'
      title='Staff Equilibrium Optimizer'
      data-qa='equilibrium-optimizer-modal'
      actionbuttons={
        <>
          <CustomButton
            disabled={staffingEquilibriumOptimizerLoading}
            onClick={handleStart}
            data-qa='equilibrium-optimizer-confirm'
          >
            Confirm
          </CustomButton>
          <CustomButton
            onClick={toggleModal}
            variant='outlined'
            data-qa='equilibrium-optimizer-confirm'
          >
            Close
          </CustomButton>
        </>
      }
    >
      {!staffingEquilibriumOptimizerLoading &&
      staffingEquilibriumOptimizerData ? (
        <Stack>
          {staffingEquilibriumOptimizerData.stats?.length && (
            <Grid
              container
              spacing='0.5rem'
              columns={{ sm: 12, md: 12 }}
              mb={2}
            >
              {staffingEquilibriumOptimizerData.stats.map((stat) => (
                <Grid
                  key={stat.title}
                  size={{
                    md: 4,
                  }}
                >
                  <Stack
                    style={{
                      backgroundColor: '#f7f8fb',
                      padding: '1rem',
                      borderRadius: '8px',
                    }}
                  >
                    <Typography fontSize='0.875rem' color='#6b859e'>
                      {stat.title}
                    </Typography>
                    <Typography fontSize='1rem' fontWeight='600'>
                      {stat.value}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          )}

          <UndynamicTable
            columns={columns}
            rows={staffingEquilibriumOptimizerData.rows}
            isExpandable
          />
        </Stack>
      ) : (
        <Loader />
      )}
    </CustomModal>
  );
};

export default StaffEquilibriumOptimizerModal;
