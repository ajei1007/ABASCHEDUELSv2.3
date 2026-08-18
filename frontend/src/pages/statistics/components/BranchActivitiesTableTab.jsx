/* eslint-disable react-hooks/exhaustive-deps */
import { useSelector } from 'react-redux'
import { Stack } from '@mui/material'
import Loader from 'components/Loader/Loader'
import BranchActivitiesTable from './BranchActivitiesTable'


const BranchActivitiesTableTab = () => {
  const branchActivitiesTableData = useSelector((state) => state.statistics.branchActivitiesTableData);
  const branchActivitiesTableLoading = useSelector((state) => state.statistics.branchActivitiesTableLoading);

  return (
    <>
      {branchActivitiesTableLoading || branchActivitiesTableData === null ? (
        <Loader />
      ) : (
        <Stack direction='column' spacing={2}>
          {/* Table  */}
          <BranchActivitiesTable response={branchActivitiesTableData} />
        </Stack>
      )}
    </>
  )
}

export default BranchActivitiesTableTab