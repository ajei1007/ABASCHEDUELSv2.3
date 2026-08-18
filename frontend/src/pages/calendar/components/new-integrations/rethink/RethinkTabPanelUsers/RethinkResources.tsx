import { useEffect, useState } from 'react';
import { Stack, Grid2 as Grid } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { resourceTypeOptions } from '../../../../constants/integrations';
import RethinkResourcesTable from './RethinkResourcesTable';
import { useRethinkResourcesFetch } from '../../../../hooks/new-integrations/rethink/useRethinkResourcesFetch';
import { EventEmitter } from 'utils/eventEmitter';

const RethinkResources = ({
  eventBus,
}: {
  eventBus: EventEmitter<{
    refetch: number | undefined;
  }>;
}) => {
  const [resourceType, setResourceType] = useState<{
    value: string;
    label: string;
  } | null>(resourceTypeOptions[0]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [lastImported, setLastImported] = useState<number | null>(null);

  const { resources, resourcesCount, resourcesLoading, fetchResources } =
    useRethinkResourcesFetch();

  const updatePagination = (pagination: { page: number; limit: number }) => {
    const newLimit = pagination.limit;
    const newPage = limit !== newLimit ? 1 : pagination.page;

    setPage(newPage);
    setLimit(newLimit);
    fetchResources({
      resourceType: resourceType?.value || '',
      page: newPage,
      limit: newLimit,
    });
  };

  const handleResourceTypeChange = (
    selectedOption: {
      value: string;
      label: string;
    } | null,
  ) => {
    setResourceType(selectedOption);
    fetchResources({
      resourceType: selectedOption?.value || '',
      page: 1,
      limit,
    });
  };

  useEffect(() => {
    fetchResources({
      page: 1,
      limit: 10,
      resourceType: resourceTypeOptions[0].value,
    });
  }, [fetchResources]);

  useEffect(() => {
    const handleRefetch = (startTs?: number) => {
      setLastImported(startTs ? startTs : null);
      fetchResources({
        page: 1,
        limit,
        resourceType: resourceType?.value || '',
      });
    };

    eventBus.on('refetch', handleRefetch);
    return () => {
      eventBus.off('refetch', handleRefetch);
    };
  }, [eventBus, fetchResources, resourceType, limit]);

  return (
    <Stack minHeight='300px' direction='column' spacing='1.5rem' py={2}>
      <Grid container marginTop='1rem !important' gap={2}>
        <Grid
          size={{
            xs: 3,
            sm: 3,
            md: 3,
          }}
        >
          <CustomSelect
            options={resourceTypeOptions}
            value={resourceType}
            onChange={handleResourceTypeChange}
            placeholder='Resource Type'
          />
        </Grid>
      </Grid>
      <RethinkResourcesTable
        rows={resources}
        count={resourcesCount}
        page={page}
        limit={limit}
        loading={resourcesLoading}
        lastImported={lastImported}
        updatePagination={updatePagination}
      />
    </Stack>
  );
};

export default RethinkResources;
