import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import { toast } from 'react-toastify';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { resourceTypePlurals } from '../../../constants/integrations';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import type { TRethinkResourceTypeSelectModalPropsForRef } from '../../../components/new-integrations/rethink/RethinkTabPanelUsers/RethinkResourceTypeSelectModal';
import type { TRethinkActionStatusModalPropsForRef } from '../../../components/new-integrations/rethink/RethinkTabPanelUsers/RethinkActionStatusModal';
import { EventEmitter } from 'utils/eventEmitter';

export function useRethinkResourcesImport({
  eventBus,
  actionStatusModalRef,
  resourceTypeSelectModalRef,
  setSelectedResourceType,
}: {
  eventBus: EventEmitter<{
    refetch: number | undefined;
  }>;
  actionStatusModalRef: React.RefObject<
    IModalWrapperRef<TRethinkActionStatusModalPropsForRef, any>
  >;
  resourceTypeSelectModalRef: React.RefObject<
    IModalWrapperRef<TRethinkResourceTypeSelectModalPropsForRef, any>
  >;
  setSelectedResourceType: React.Dispatch<any>;
}) {
  const [importResourcesLoading, setImportResourcesLoading] = useState(false);
  const [importingResourcesType, setImportingResourcesType] = useState('');
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const _importResourcesRequest = useCallback(async (resourceType: string) => {
    cancelTokenSourceRef.current = axios.CancelToken.source();
    return axios.post(
      `/integrations/import-${resourceType}/rethink`,
      undefined,
      {
        cancelToken: cancelTokenSourceRef.current.token,
      },
    );
  }, []);

  const importResources = useLatestCallback(async (resourceType: string) => {
    if (importResourcesLoading) {
      return {
        isSuccess: false as const,
        isCanceled: true,
      };
    }

    setImportResourcesLoading(true);
    setImportingResourcesType(resourceType);
    try {
      if (resourceType === 'employee') {
        setImportingResourcesType('role');
        await _importResourcesRequest('role');
        setImportingResourcesType(resourceType);
      }

      const response = await _importResourcesRequest(resourceType);
      
      const resourceTypeLabel =
        resourceType in resourceTypePlurals
          ? resourceTypePlurals[
              resourceType as keyof typeof resourceTypePlurals
            ]
          : 'Resources';

      toast.success(`${resourceTypeLabel} has been imported successfully`);
      return {
        isSuccess: true as const,
        payload: {
          count: response.data?.importNumber ?? 0,
        },
      };
    } catch (error: any) {
      const isCanceled = axios.isCancel(error);
      if (!isCanceled) {
        const msg = error?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again!');
        }
      }
      return {
        isSuccess: false as const,
        isCanceled,
      };
    } finally {
      setImportResourcesLoading(false);
      setImportingResourcesType('');
    }
  });

  const cancelImportResources = useCallback(() => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Request cancelled');
    }
  }, []);

  const handleImportResources = useCallback(async () => {
    if (!resourceTypeSelectModalRef.current) {
      console.warn(
        'resourceTypeSelectModalRef ref is not attached to component',
      );
      return;
    }

    const result = await resourceTypeSelectModalRef.current.show({
      title: 'Import Resources',
    });
    if (!result.isSubmit) {
      return;
    }
    const resourceType = result.payload;
    setSelectedResourceType(resourceType);
    const startTs = new Date().getTime();
    const importResult = await importResources(resourceType);
    if (!importResult.isSuccess && importResult.isCanceled) {
      return;
    }

    if (!actionStatusModalRef.current) {
      console.warn('actionStatusModalRef ref is not attached to component');
      return;
    }

    await actionStatusModalRef.current.show({
      action: 'import',
      isSuccess: importResult.isSuccess,
      payload: importResult.payload,
      resourceType,
    });

    if (importResult.isSuccess) {
      eventBus.emit('refetch', startTs);
    }
  }, [
    eventBus,
    resourceTypeSelectModalRef,
    actionStatusModalRef,
    setSelectedResourceType,
    importResources,
  ]);

  return {
    importResourcesLoading,
    importingResourcesType,
    handleImportResources,
    cancelImportResources,
  };
}
