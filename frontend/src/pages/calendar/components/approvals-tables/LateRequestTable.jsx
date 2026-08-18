/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { fetchLateRequestData } from 'store/actions/approvalsActions';
import { requesLateTableColumns } from 'pages/calendar/utils/calendarTableColumns'
import UndynamicTable from '../UndynamicTable';

const LateRequestTable = ({ setRowSelectionLate, rowSelectionLate }) => {
  const dispatch = useAppDispatch();
  const lateRequestData = useSelector((state) => state.approvals.lateRequestData);

  useEffect(() => {
    if (lateRequestData?.length === 0) {
      dispatch(fetchLateRequestData())
    }
  }, [])
  
  return (
    <UndynamicTable
      columns={requesLateTableColumns}
      rows={lateRequestData}
      enableRowSelection
      onRowSelectionChange={setRowSelectionLate}
      rowSelection={rowSelectionLate}
    />
  )
}

export default LateRequestTable