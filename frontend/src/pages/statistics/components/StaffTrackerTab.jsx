/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, LinearProgress, Stack } from '@mui/material';
import StaffTrackerHeatmap from 'components/Charts/StaffTrackerHeatmap';

const StaffTrackerTab = () => {
  const staffTrackerData = useSelector(
    (state) => state.statistics.staffTrackerData,
  );
  const staffTrackerLoading = useSelector(
    (state) => state.statistics.staffTrackerLoading,
  );
  const staffTrackerView = useSelector(
    (state) => state.statistics.staffTrackerView,
  );

  const heatmapData = useMemo(() => {
    if (staffTrackerData) {
      if (staffTrackerView) {
        return staffTrackerData?.data_after
      }
      return staffTrackerData?.data_before
    }
    return [];
  }, [staffTrackerData, staffTrackerView])

  return (
    <Stack direction='column' spacing={2} overflow='auto' width='100%'>
      {staffTrackerLoading && <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>}
      <StaffTrackerHeatmap data={heatmapData} />
    </Stack>
  );
};

export default StaffTrackerTab;
