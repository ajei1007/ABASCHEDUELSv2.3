import CustomModal from 'components/Modal';
import RequestsFormModalContent from './RequestsFormModalContent';

const RequestsFormModal = ({
  isEdit,
  openFormModal,
  setOpenFormModal,
  requestTab,
  selectedRequest,
  record,
  setRecord,
}: any) => {
  return (
    <CustomModal
      open={openFormModal}
      onClose={() => setOpenFormModal(false)}
      aria-labelledby='Requests Modal'
      aria-describedby='Requests Modal For Scheduler'
      title='Requests'
      maxWidth='md'
    >
      <RequestsFormModalContent
        isEdit={isEdit}
        openFormModal={openFormModal}
        setOpenFormModal={setOpenFormModal}
        requestTab={requestTab}
        selectedRequest={selectedRequest}
        record={record}
        setRecord={setRecord}
      />
    </CustomModal>
  );
};

export default RequestsFormModal;
