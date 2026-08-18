import { useState, useRef, useEffect } from 'react';
import { useBlocker } from 'react-router';
import { createPortal } from 'react-dom';
import { Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import CustomButton from 'components/Button';
import ModalWrapper from 'components/ModalWrapper';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import NewIntegrationBackdropLoading from '../../NewIntegrationBackdropLoading';
import RethinkResourceTypeSelectModal from './RethinkResourceTypeSelectModal';
import type { TRethinkResourceTypeSelectModalPropsForRef } from './RethinkResourceTypeSelectModal';
import RethinkActionStatusModal from './RethinkActionStatusModal';
import type { TRethinkActionStatusModalPropsForRef } from './RethinkActionStatusModal';
import { useRethinkResourcesImport } from '../../../../hooks/new-integrations/rethink/useRethinkResourcesImport';
import { useRethinkResourcesSync } from '../../../../hooks/new-integrations/rethink/useRethinkResourcesSync';
import { useNewIntegrationsConfirmBeforeClose } from '../../../../hooks/new-integrations/useNewIntegrationsConfirmBeforeClose';
import { resourceTypePlurals } from '../../../../constants/integrations';
import { EventEmitter } from 'utils/eventEmitter';

const RethinkResourcesActions = ({
  eventBus,
  onCancel,
}: {
  eventBus: EventEmitter<{
    refetch: number | undefined;
  }>;
  onCancel: () => void;
}) => {
  const [_, setSelectedResourceType] = useState<any>(null);

  const resourceTypeSelectModalRef =
    useRef<IModalWrapperRef<TRethinkResourceTypeSelectModalPropsForRef, any>>(
      null,
    );

  const actionStatusModalRef =
    useRef<IModalWrapperRef<TRethinkActionStatusModalPropsForRef, any>>(null);

  const {
    importResourcesLoading,
    importingResourcesType,
    handleImportResources,
    cancelImportResources,
  } = useRethinkResourcesImport({
    eventBus,
    actionStatusModalRef,
    resourceTypeSelectModalRef,
    setSelectedResourceType,
  });

  const { syncResourcesLoading, handleSyncResources, cancelSyncResources } =
    useRethinkResourcesSync({
      actionStatusModalRef,
      resourceTypeSelectModalRef,
      setSelectedResourceType,
    });

  const isLoading = importResourcesLoading || syncResourcesLoading;

  const handleCancelLoading = () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel the loading?',
    );
    if (!confirmed) {
      return;
    }

    if (importResourcesLoading) {
      cancelImportResources();
    } else {
      cancelSyncResources();
    }
  };

  const { handlePromptConfirm } = useNewIntegrationsConfirmBeforeClose({
    shouldConfirm: isLoading,
  });

  // Block navigating elsewhere when data has been entered into the input
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname && isLoading,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const userConfirmed = handlePromptConfirm();
      if (!userConfirmed) {
        blocker.reset();
        return;
      }
      blocker.proceed();
    }
  }, [blocker, handlePromptConfirm]);

  const backdropOpen = isLoading;
  const backdropTitle = (() => {
    if (!importResourcesLoading && !syncResourcesLoading) {
      return '';
    }

    const label =
      importingResourcesType in resourceTypePlurals
        ? resourceTypePlurals[
            importingResourcesType as keyof typeof resourceTypePlurals
          ]
        : 'Resources';

    return importResourcesLoading ? `Importing ${label}` : `Syncing ${label}`;
  })();

  return (
    <>
      <Stack
        flexDirection='row'
        justifyContent='flex-end'
        alignItems='center'
        width={'100%'}
      >
        <Stack
          flexDirection='row'
          justifyContent='flex-end'
          alignItems='center'
          columnGap={1}
        >
          <CustomButton
            startIcon={<DownloadIcon />}
            type='button'
            onClick={handleImportResources}
          >
            Import Resources
          </CustomButton>
          <CustomButton
            startIcon={<SyncOutlinedIcon />}
            type='button'
            onClick={handleSyncResources}
          >
            Sync Resources
          </CustomButton>
          <CustomButton variant='outlined' type='button' onClick={onCancel}>
            Cancel
          </CustomButton>
        </Stack>
      </Stack>

      {createPortal(
        <>
          <ModalWrapper
            ref={resourceTypeSelectModalRef}
            renderModal={(
              isOpen,
              modalProps: TRethinkResourceTypeSelectModalPropsForRef,
              handleClose,
              handleConfirm,
            ) => (
              <RethinkResourceTypeSelectModal
                isOpen={isOpen}
                handleClose={handleClose}
                handleConfirm={handleConfirm}
                {...modalProps}
              />
            )}
          />
          <ModalWrapper
            ref={actionStatusModalRef}
            renderModal={(
              isOpen,
              modalProps: TRethinkActionStatusModalPropsForRef,
              handleClose,
            ) => (
              <RethinkActionStatusModal
                isOpen={isOpen}
                handleClose={handleClose}
                payload={modalProps.payload!}
                {...modalProps}
              />
            )}
          />
          <NewIntegrationBackdropLoading
            open={backdropOpen}
            title={backdropTitle}
            onCancel={handleCancelLoading}
          />
        </>,
        document.body,
      )}
    </>
  );
};

export default RethinkResourcesActions;
