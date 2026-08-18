/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { fetchConfirmationsRequestData } from 'store/actions/approvalsActions';
import { requestConfirmationTableColumns } from 'pages/calendar/utils/calendarTableColumns';
import CustomTable from 'components/Table/Table';

const statusFieldOptions = [
  {
    label: "All",
    value: ""
  },
  {
    label: "Pending Confirmation",
    value: "Pending Confirmation"
  },
  {
    label: "Confirmed",
    value: 'Confirmed'
  }

] 
const ConfirmationRequestsTable = () => {
  const dispatch = useAppDispatch();
  const confirmationsRequestData = useSelector((state) => state.approvals.confirmationsRequestData);
  const confirmationsRequestDataCount = useSelector((state) => state.approvals.confirmationsRequestDataCount)
  const [ selectedStatusOption, setSelectedStatusOption ] = useState(statusFieldOptions[0])

  useEffect(() => {
    if (confirmationsRequestData.length === 0) {
      dispatch(fetchConfirmationsRequestData())
    }
  }, [])

  const selectFields = [
    {
      name: 'status',
      label: 'Status',
      value: selectedStatusOption,
      onChange: (val) => setSelectedStatusOption(val),
      options: statusFieldOptions,
    }
  ];
  return (
    <CustomTable
      columns={requestConfirmationTableColumns}
      rows={confirmationsRequestData}
      count={confirmationsRequestDataCount}
      // loading={loading}
      fetchData={(filterObj) => {
      //  setLocalFilters(filterObj);
      //  dispatch(actions.doFetch(filterObj));
     }}
     selectFields={selectFields}
     searchFields={[{value: 'users', label: 'Users'}]}
     enabledDateRange
    />
  )
}

export default ConfirmationRequestsTable