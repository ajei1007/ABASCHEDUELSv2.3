import { useCallback, useRef } from 'react';
import Widget from 'components/Widget/Widget';
import { useOptimizerActionLogsFetch } from './hooks/useOptimizerActionLogsFetch';
import { useOptimizerActionLogsDeleteItem } from './hooks/useOptimizerActionLogsDeleteItem';
import OptimizerActionLogsErrorMessage from './components/OptimizerActionLogsErrorMessage';
import OptimizerActionLogsTable from './components/OptimizerActionLogsTable';
import ModalWrapper, { type IModalWrapperRef } from 'components/ModalWrapper';
import OptimizerActionLogsPayloadModal, {
  type IOptimizerActionLogsPayloadModalPropsForRef,
} from './components/OptimizerActionLogsPayloadModal';

const OptimizerActionLogs = () => {
  const {
    logItems,
    totalCount,
    isLogItemsLoading,
    logItemsErrorMessage,
    fetchLogItems,
    refetchLogItems,
  } = useOptimizerActionLogsFetch();

  const { deleteItem } = useOptimizerActionLogsDeleteItem({
    onSuccess: refetchLogItems,
  });

  const payloadModalRef =
    useRef<IModalWrapperRef<IOptimizerActionLogsPayloadModalPropsForRef, any>>(
      null,
    );

  const showPayloadModal = useCallback(
    (props: IOptimizerActionLogsPayloadModalPropsForRef) => {
      if (payloadModalRef.current) {
        payloadModalRef.current.show(props);
      }
    },
    [],
  );

  return (
    <Widget className='widget-p-md' title={<h4>Optimizer Action Logs</h4>}>
      {logItemsErrorMessage && (
        <OptimizerActionLogsErrorMessage
          errorMessage={logItemsErrorMessage}
          onRetry={refetchLogItems}
        />
      )}
      <OptimizerActionLogsTable
        items={logItems}
        totalCount={totalCount}
        isLoading={isLogItemsLoading}
        fetchItems={fetchLogItems}
        deleteItem={deleteItem}
        showPayloadModal={showPayloadModal}
      />

      <ModalWrapper
        ref={payloadModalRef}
        renderModal={(
          isOpen,
          modalProps: IOptimizerActionLogsPayloadModalPropsForRef,
          handleClose,
          handleConfirm,
        ) => (
          <OptimizerActionLogsPayloadModal
            isOpen={isOpen}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            {...modalProps}
          />
        )}
      />
    </Widget>
  );
};

export default OptimizerActionLogs;
