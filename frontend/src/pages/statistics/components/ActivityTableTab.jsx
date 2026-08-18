/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from 'react-redux'
import { Stack } from '@mui/material'
import Loader from 'components/Loader/Loader'
import ActivitiesTable from './ActivitiesTable'


const ActivityTableTab = () => {
  const activityTableData = useSelector((state) => state.statistics.activityTableData);
  const activityTableLoading = useSelector((state) => state.statistics.activityTableLoading);

  return (
    <>
      {activityTableLoading || activityTableData === null ? (
        <Loader />
      ) : (
        <Stack direction='column' spacing={2}>
          {/* Table  */}
          <ActivitiesTable response={activityTableData} />
        </Stack>
      )}
    </>
  )
}

export default ActivityTableTab