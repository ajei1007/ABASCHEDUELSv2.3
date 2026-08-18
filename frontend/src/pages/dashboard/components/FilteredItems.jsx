import { Chip } from '@mui/material';
import { Stack } from '@mui/system';
import { useSelector } from 'react-redux';

const FilteredItems = () => {
  const selectedDashboardRoles = useSelector(
    (state) => state.statistics.selectedDashboardRoles,
  );
  const selectedDashboardBranches = useSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );

  const filterItemsArray = [
    ...selectedDashboardRoles,
    ...selectedDashboardBranches,
  ];

  return (
    <Stack>
      {filterItemsArray.length > 0 && (
        <Stack direction='row' alignItems='center' spacing={1}>
          {filterItemsArray
            .filter((item) => item !== null && item !== undefined)
            .map((item) => (
              <Chip label={item.label} key={item.id} variant='outlined' />
            ))}
        </Stack>
      )}
    </Stack>
  );
};

export default FilteredItems;
