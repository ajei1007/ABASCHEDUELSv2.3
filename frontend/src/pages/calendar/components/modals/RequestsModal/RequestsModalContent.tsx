import { useState, memo } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import Portal from 'components/Portal';
import InternalPortal from 'components/InternalPortal';
import TabPanel from 'components/TabPanel/TabPanel';
import CustomButton from 'components/Button';
import TimeOffRequestsTable from '../../requests-tables/TimeOffRequests';
import AvailabilityRequestTable from '../../requests-tables/AvailabilityRequests';
import RequestsFormModal from '../RequestFormModal/RequestsFormModal';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import isDateRangeMoreThanTheLimit from 'utils/isDateRangeMoreThanTheLimit';
import { toast } from 'react-toastify';
import {
  getAvailabilityRequests,
  getTimeOffRequests,
  setSelectedEndDate,
  setSelectedStartDate,
} from 'store/actions/requestsActions';

const RequestsModalContent = ({
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
    (state) => state.requests.selectedStartDate,
  );
  const selectedEndDate = useAppSelector(
    (state) => state.requests.selectedEndDate,
  );
  //
  const [openFormModal, setOpenFormModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [record, setRecord] = useState(null);

  const handleChangeTab = (_: any, newValue: any) => {
    setRequestTab(newValue);
  };

  const requestAdd = () => {
    setIsEdit(false);
    setRecord(null);
    setSelectedRequest(null);
    setOpenFormModal(true);
  };

  const handleClickEdit = (id: any) => {
    setIsEdit(true);
    setSelectedRequest(id);
    setOpenFormModal(true);
  };

  const handleChangeTableDate = (startDate: Date, endDate: Date) => {
    if (isDateRangeMoreThanTheLimit(startDate, endDate)) {
      return toast.error('Date range cannot be more than 31 days!');
    }

    dispatch(setSelectedStartDate(startDate));
    dispatch(setSelectedEndDate(endDate));

    if (requestTab === 0) {
      dispatch(getTimeOffRequests());
    }
    if (requestTab === 1) {
      dispatch(getAvailabilityRequests());
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
          <Tab label='Time off' />
          <Tab label='Availabilities' />
        </Tabs>
      </Stack>
      <TabPanel value={requestTab} index={0}>
        <TimeOffRequestsTable handleClickEdit={handleClickEdit} />
      </TabPanel>

      <TabPanel value={requestTab} index={1}>
        <AvailabilityRequestTable handleClickEdit={handleClickEdit} />
      </TabPanel>

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
        <CustomButton onClick={requestAdd}>
          Add {requestTab === 0 ? ' Time Off' : ' Availabilities'}
        </CustomButton>
      </InternalPortal>

      {/* 
        Render RequestsForm in a portal to allow it to be rendered outside the modal's DOM hierarchy
        This is useful for modals that need to be rendered in a different part of the DOM
        to avoid overflow issues or z-index conflicts with other components.
       */}
      <Portal>
        <RequestsFormModal
          isEdit={isEdit}
          selectedRequest={selectedRequest}
          openFormModal={openFormModal}
          setOpenFormModal={setOpenFormModal}
          requestTab={requestTab}
          record={record}
          setRecord={setRecord}
        />
      </Portal>
    </Stack>
  );
};

export default memo(RequestsModalContent);
