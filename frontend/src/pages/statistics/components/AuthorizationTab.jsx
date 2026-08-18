/* eslint-disable react-hooks/exhaustive-deps */
import { Stack } from '@mui/material';
import Loader from 'components/Loader/Loader';
import { useSelector } from 'react-redux';
import AuthorizationTable from './AuthorizationTable'

const AuthorizationTab = () => {
  const authorizationTableData = useSelector((state) => state.statistics.authorizationTableData);
  const authorizationTableLoading = useSelector((state) => state.statistics.authorizationTableLoading);

  return (
    <>
    {authorizationTableLoading || authorizationTableData === null ? (
      <Loader />
    ) : (
      <Stack direction='column' spacing={2}>
        {/* Table  */}
        <AuthorizationTable response={authorizationTableData}/>
      </Stack>
    )}
  </>
  )
}

export default AuthorizationTab