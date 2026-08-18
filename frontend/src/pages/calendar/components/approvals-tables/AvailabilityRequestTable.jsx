/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchAvailabilitiesRequestData } from 'store/actions/approvalsActions';
import { requestAvailabilitiesTableColumns } from 'pages/calendar/utils/calendarTableColumns';
import UndynamicTable from '../UndynamicTable';

const AvailabilityRequestTable = ({
  rowSelectionAvailability,
  setRowSelectionAvailability,
}) => {
  const dispatch = useAppDispatch();
  const availabilitiesRequestData = useAppSelector(
    (state) => state.approvals.availabilitiesRequestData,
  );

  useEffect(() => {
    if (availabilitiesRequestData.length === 0) {
      dispatch(fetchAvailabilitiesRequestData());
    }
  }, []);

  return (
    <UndynamicTable
      columns={requestAvailabilitiesTableColumns}
      rows={availabilitiesRequestData}
      enableRowSelection
      onRowSelectionChange={setRowSelectionAvailability}
      rowSelection={rowSelectionAvailability}
    />
  );
};

export default AvailabilityRequestTable;
