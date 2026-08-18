import { useState, memo } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import InternalPortal from 'components/InternalPortal';
import TabPanel from 'components/TabPanel/TabPanel';
import CancellationRequestsTable from '../../approvals-tables/CancellationRequestsTable';
import AvailabilityRequestTable from '../../approvals-tables/AvailabilityRequestTable';
import TimeOffRequestTable from '../../approvals-tables/TimeOffApprovalsTable';
import CustomButton from 'components/Button';
import {
  fetchAvailabilitiesRequestData,
  fetchCancellationsRequestData,
  fetchTimeOffRequestData,
  updateCancellationRequests,
  updateRequests,
  setSelectedEndDate,
  setSelectedStartDate,
} from 'store/actions/approvalsActions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { EventStatuses } from 'utils/eventStatuses';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import isDateRangeMoreThanTheLimit from 'utils/isDateRangeMoreThanTheLimit';
import { toast } from 'react-toastify';

const ApprovalsModalContent = ({
  requestTab,
  setRequestTab,
  actionButtonsTargetRef,
  toggleModalOpen,
}: {
  requestTab: number;
  setRequestTab: (value: number) => void;
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
}) => {
  const dispatch = useAppDispatch();
  const selectedStartDate = useAppSelector(
    (state) => state.approvals.selectedStartDate,
  );
  const selectedEndDate = useAppSelector(
    (state) => state.approvals.selectedEndDate,
  );
  //
  const [loading, setLoading] = useState(false);
  const [rowSelectionTimeOff, setRowSelectionTimeOff] = useState({});
  const [rowSelectionAvailability, setRowSelectionAvailability] = useState({});
  const [rowSelectionCancellation, setRowSelectionCancellation] = useState({});
  // const [rowSelectionLate, setRowSelectionLate] = useState({});
  const [updatedNotes, setUpdatedNotes] = useState<any[]>([]);

  const handleChangeTab = (_: any, newValue: any) => {
    setRequestTab(newValue);
  };

  const updateRequestStatues = async (status = 'approved') => {
    setLoading(true);
    try {
      const statusRequests = status === 'approved' ? 'Approved' : 'Declined';
      const statusCancellations =
        status === 'approved'
          ? EventStatuses.CANCELED
          : EventStatuses.PENDING_CONFIRM;

      const availabilitySelectionIds = Object.keys(rowSelectionAvailability);
      const timeoffSelectionIds = Object.keys(rowSelectionTimeOff);
      const cancellationSelectionIds = Object.keys(rowSelectionCancellation);
      // const lateSelectionIds = Object.keys(rowSelectionLate);

      let availabilityRequests: any[] = [];
      if (availabilitySelectionIds.length) {
        availabilityRequests = availabilitySelectionIds.map((r) => ({
          id: r,
          status: statusRequests,
          // statusType: 'Edit',
        }));
      }
      let timeoffRequests: any[] = [];
      if (timeoffSelectionIds.length) {
        timeoffRequests = timeoffSelectionIds.map((r) => ({
          id: r,
          status: statusRequests,
          // statusType: 'Edit',
        }));
      }
      let cancellationRequests: any[] = [];
      if (cancellationSelectionIds.length) {
        cancellationRequests = cancellationSelectionIds.map((r) => {
          const obj: any = {
            id: r,
            status: statusCancellations,
          };
          const noteadmin: any = updatedNotes.find((n) => n.id === r);
          if (noteadmin) {
            obj.noteadmin = noteadmin.value;
          }
          return obj;
        });
      }
      let confirmationRequests: any[] = [];
      let lateRequest: any[] = [];
      // if (lateSelectionIds.length) {
      //   lateRequest = lateSelectionIds.map((r) => ({
      //     id: r,
      //     status: statusRequests,
      //   }));
      // }
      const availabilityTimeoffRequests = [
        ...availabilityRequests,
        ...timeoffRequests,
      ];
      const cancellationConfirmationRequests = [
        ...cancellationRequests,
        ...confirmationRequests,
        ...lateRequest,
      ];
      if (availabilityTimeoffRequests.length) {
        await dispatch(updateRequests(availabilityTimeoffRequests));
      }
      if (cancellationConfirmationRequests.length) {
        await dispatch(
          updateCancellationRequests(cancellationConfirmationRequests),
        );
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setUpdatedNotes([]);
      setRowSelectionTimeOff({});
      setRowSelectionAvailability({});
      setRowSelectionCancellation({});
      toggleModalOpen();
    }
  };

  const handleAccept = () => updateRequestStatues('approved');

  const handleDecline = () => updateRequestStatues('declined');

  const handleChangeUpdatedNotes = (id: any, value: any) => {
    const isExisting =
      updatedNotes.findIndex((note: any) => note.id === id) !== -1;
    if (!isExisting) {
      setUpdatedNotes((prev: any) => [...prev, { id, value }]);
    }
  };

  const handleChangeTableDate = (startDate: Date, endDate: Date) => {
    if (isDateRangeMoreThanTheLimit(startDate, endDate)) {
      return toast.error('Date range cannot be more than 31 days!');
    }

    dispatch(setSelectedStartDate(startDate));
    dispatch(setSelectedEndDate(endDate));

    if (requestTab === 0) {
      dispatch(fetchCancellationsRequestData());
    }
    if (requestTab === 1) {
      dispatch(fetchAvailabilitiesRequestData());
    }
    if (requestTab === 2) {
      dispatch(fetchTimeOffRequestData());
    }
  };

  return (
    <Stack>
      <Stack>
        <Stack direction='column' alignItems='start'>
          <label>Filter by date:</label>
          <CustomDateRangePicker
            startDate={selectedStartDate!}
            endDate={selectedEndDate!}
            onSubmit={handleChangeTableDate}
          />
        </Stack>
        <Tabs value={requestTab} onChange={handleChangeTab}>
          <Tab label='Cancellations' />
          <Tab label='Availabilities' />
          <Tab label='Time off' />
        </Tabs>
      </Stack>
      <TabPanel value={requestTab} index={0}>
        <CancellationRequestsTable
          setRowSelectionCancellation={setRowSelectionCancellation}
          rowSelectionCancellation={rowSelectionCancellation}
          handleChangeUpdatedNotes={handleChangeUpdatedNotes}
        />
      </TabPanel>
      <TabPanel value={requestTab} index={1}>
        <AvailabilityRequestTable
          setRowSelectionAvailability={setRowSelectionAvailability}
          rowSelectionAvailability={rowSelectionAvailability}
        />
      </TabPanel>
      <TabPanel value={requestTab} index={2}>
        <TimeOffRequestTable
          setRowSelectionTimeOff={setRowSelectionTimeOff}
          rowSelectionTimeOff={rowSelectionTimeOff}
        />
      </TabPanel>

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={handleAccept} loading={loading}>
          Accept
        </CustomButton>
        <CustomButton
          onClick={handleDecline}
          variant='outlined'
          loading={loading}
        >
          Decline
        </CustomButton>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </Stack>
  );
};

ApprovalsModalContent.displayName = 'ApprovalsModalContent';

export default memo(ApprovalsModalContent);
