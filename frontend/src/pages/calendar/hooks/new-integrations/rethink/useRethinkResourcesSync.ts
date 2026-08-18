import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import { toast } from 'react-toastify';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { resourceTypePlurals } from '../../../constants/integrations';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import type { TRethinkResourceTypeSelectModalPropsForRef } from '../../../components/new-integrations/rethink/RethinkTabPanelUsers/RethinkResourceTypeSelectModal';
import type { TRethinkActionStatusModalPropsForRef } from '../../../components/new-integrations/rethink/RethinkTabPanelUsers/RethinkActionStatusModal';

export function useRethinkResourcesSync({
  actionStatusModalRef,
  resourceTypeSelectModalRef,
  setSelectedResourceType,
}: {
  actionStatusModalRef: React.RefObject<
    IModalWrapperRef<TRethinkActionStatusModalPropsForRef, any>
  >;
  resourceTypeSelectModalRef: React.RefObject<
    IModalWrapperRef<TRethinkResourceTypeSelectModalPropsForRef, any>
  >;
  setSelectedResourceType: React.Dispatch<any>;
}) {
  const [syncResourcesLoading, setSyncResourcesLoading] = useState(false);
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const syncResources = useLatestCallback(async (resourceType: string) => {
    if (syncResourcesLoading) {
      return {
        isSuccess: false as const,
        isCanceled: true,
      };
    }

    setSyncResourcesLoading(true);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 2000));

      const resourceTypeLabel =
        resourceType in resourceTypePlurals
          ? resourceTypePlurals[
              resourceType as keyof typeof resourceTypePlurals
            ]
          : 'Resources';

      toast.success(`${resourceTypeLabel} has been synced successfully`);
      return {
        isSuccess: true as const,
        payload: {
          count: 100,
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
      setSyncResourcesLoading(false);
    }
  });

  const cancelSyncResources = useCallback(() => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Request cancelled');
    }
  }, []);

  const handleSyncResources = useCallback(async () => {
    if (!resourceTypeSelectModalRef.current) {
      console.warn(
        'resourceTypeSelectModalRef ref is not attached to component',
      );
      return;
    }

    const result = await resourceTypeSelectModalRef.current.show({
      title: 'Sync Resources',
    });
    if (!result.isSubmit) {
      return;
    }
    const resourceType = result.payload;
    setSelectedResourceType(resourceType);

    const syncResult = await syncResources(resourceType);
    if (!syncResult.isSuccess && syncResult.isCanceled) {
      return;
    }

    if (!actionStatusModalRef.current) {
      console.warn('actionStatusModalRef ref is not attached to component');
      return;
    }

    actionStatusModalRef.current.show({
      action: 'sync',
      isSuccess: syncResult.isSuccess,
      payload: syncResult.payload,
      resourceType,
    });
  }, [
    resourceTypeSelectModalRef,
    actionStatusModalRef,
    setSelectedResourceType,
    syncResources,
  ]);

  return {
    syncResourcesLoading,
    handleSyncResources,
    cancelSyncResources,
  };
}
