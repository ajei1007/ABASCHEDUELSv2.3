/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchCancellationsRequestData } from 'store/actions/approvalsActions';
import { requestCancellationsTableColumns } from 'pages/calendar/utils/calendarTableColumns';
import UndynamicTable from '../UndynamicTable';

const CancellationRequestsTable = ({
  setRowSelectionCancellation,
  rowSelectionCancellation,
  handleChangeUpdatedNotes,
}) => {
  const dispatch = useAppDispatch();
  const cancellationsRequestData = useAppSelector(
    (state) => state.approvals.cancellationsRequestData,
  );

  useEffect(() => {
    if (cancellationsRequestData.length === 0) {
      dispatch(fetchCancellationsRequestData());
    }
  }, []);

  return (
    <UndynamicTable
      enableEditing
      columns={requestCancellationsTableColumns}
      rows={cancellationsRequestData}
      enableRowSelection
      onRowSelectionChange={setRowSelectionCancellation}
      rowSelection={rowSelectionCancellation}
      handleCellChange={handleChangeUpdatedNotes}
    />
  );
};

export default CancellationRequestsTable;
