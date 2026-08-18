/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchTimeOffRequestData } from 'store/actions/approvalsActions';
import { requestTimeOffTableColumns } from 'pages/calendar/utils/calendarTableColumns';
import UndynamicTable from '../UndynamicTable';

const TimeOffApprovalsTable = ({
  setRowSelectionTimeOff,
  rowSelectionTimeOff,
}) => {
  const dispatch = useAppDispatch();
  const timeoffRequestData = useAppSelector(
    (state) => state.approvals.timeoffRequestData,
  );

  useEffect(() => {
    if (timeoffRequestData.length === 0) {
      dispatch(fetchTimeOffRequestData());
    }
  }, []);

  return (
    <UndynamicTable
      columns={requestTimeOffTableColumns}
      rows={timeoffRequestData}
      enableRowSelection
      onRowSelectionChange={setRowSelectionTimeOff}
      rowSelection={rowSelectionTimeOff}
    />
  );
};

export default TimeOffApprovalsTable;
