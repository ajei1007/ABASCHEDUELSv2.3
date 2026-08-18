import {
  useState,
  useMemo,
  useRef,
  useEffect,
  type FC,
  useCallback,
} from 'react';
import { Chip, Button, Grid2 as Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import Loader from 'components/Loader/Loader';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import OptimizerActionLogsDatePicker from './OptimizerActionLogsDatePicker';
import type { IApiOptimizerActionLogItem } from 'types/api';
import { useOptimizerActionLogsCompanyOptions } from '../hooks/useOptimizerActionLogsCompanyOptions';
import { useOptimizerActionLogsQueryParams } from '../hooks/useOptimizerActionLogsQueryParams';
import { BUTTON_STYLES } from '../constants/tableConstants';
import {
  formatDateTime,
  formatDuration,
  getStatusChipColor,
  getUserFullName,
} from '../utils/tableUtils';

export interface OptimizerActionLogsTableProps {
  items: IApiOptimizerActionLogItem[];
  totalCount: number;
  isLoading: boolean;
  fetchItems: (params: Record<string, any>) => void;
  deleteItem: (id: string) => void;
  showPayloadModal: (props: { title: string; payload?: any }) => void;
}

const statusOptions = [
  {
    label: 'Both',
    value: '',
  },
  {
    label: 'Success',
    value: 'success',
  },
  {
    label: 'Failed',
    value: 'failed',
  },
];

const OptimizerActionLogsTable: FC<OptimizerActionLogsTableProps> = ({
  items,
  totalCount,
  isLoading,
  fetchItems,
  deleteItem,
  showPayloadModal,
}) => {
  const {
    companyId,
    setCompanyId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useOptimizerActionLogsQueryParams();
  const [localLoading, setLocalLoading] = useState(true);

  const { companyOptions, fetchCompanyOptions } =
    useOptimizerActionLogsCompanyOptions();

  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const idToDelete = useRef<string | null>(null);
  const openModal = useCallback((event: React.MouseEvent, cell: string) => {
    idToDelete.current = cell; // Store the ID to delete
    event.stopPropagation();
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    const id = idToDelete.current;
    deleteItem(id!);
    idToDelete.current = null; // Clear the ID after deletion
    closeModal();
  }, [deleteItem, closeModal]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ renderedCellValue }: any) => (
          <ActionFormatter
            deleteEvent={(event: React.MouseEvent) => {
              openModal(event, renderedCellValue as string);
            }}
          />
        ),
        size: 50,
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) =>
          row.triggerByUser?.company?.name,
        id: 'companyId',
        header: 'Company',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) =>
          row.original.triggerByUser?.company?.name || 'N/A',
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) =>
          row.triggerByUser?.email,
        id: 'triggerByUser',
        header: 'Triggered By',
        enablePinning: false,
        enableColumnFilter: true,
        filterVariant: 'text',
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) =>
          getUserFullName(row.original.triggerByUser),
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) => row.createdAt,
        id: 'createdAt',
        header: 'Triggered At',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 150,
        grow: true,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) =>
          formatDateTime(row.original.createdAt),
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) => row.status,
        id: 'status',
        header: 'Status',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: statusOptions,
        size: 100,
        grow: true,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) => {
          const { status } = row.original;
          return (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              sx={{
                color: 'white',
                backgroundColor: getStatusChipColor(status),
              }}
            />
          );
        },
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) => row.startTime,
        id: 'startedAt',
        header: 'Started At',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 150,
        grow: true,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) =>
          formatDateTime(row.original.startTime),
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) => row.endTime,
        id: 'endedAt',
        header: 'Ended At',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 150,
        grow: true,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) =>
          formatDateTime(row.original.endTime),
      },
      {
        accessorKey: 'duration',
        id: 'duration',
        header: 'Duration',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 130,
        grow: true,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) =>
          formatDuration(row.original.startTime, row.original.endTime),
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) => row.requestPayload,
        id: 'requestPayload',
        header: 'Request Payload',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 120,
        grow: true,
        Cell: ({ row }: any) => (
          <Button
            size='small'
            variant='contained'
            sx={{
              ...BUTTON_STYLES.common,
              ...BUTTON_STYLES.request,
            }}
            startIcon={<VisibilityIcon sx={{ fontSize: '1rem!important' }} />}
            aria-label='View request payload'
            onClick={() =>
              showPayloadModal({
                title: 'Request Payload',
                payload: row?.original?.requestPayload || {},
              })
            }
          >
            View Payload
          </Button>
        ),
      },
      {
        accessorFn: (row: IApiOptimizerActionLogItem) => row.responsePayload,
        id: 'responsePayload',
        header: 'Response Payload',
        enablePinning: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        grow: true,
        Cell: ({ row }: { row: { original: IApiOptimizerActionLogItem } }) => {
          const { status } = row.original;
          const isSuccess = status === 'success';

          return (
            <Button
              size='small'
              variant='contained'
              sx={{
                ...BUTTON_STYLES.common,
                ...(isSuccess ? BUTTON_STYLES.success : BUTTON_STYLES.warning),
              }}
              startIcon={<VisibilityIcon sx={{ fontSize: '1rem!important' }} />}
              aria-label='View response payload'
              onClick={() =>
                showPayloadModal({
                  title: 'Response Payload',
                  payload: row?.original?.responsePayload || {},
                })
              }
            >
              View Payload
            </Button>
          );
        },
      },
    ],
    [openModal, showPayloadModal],
  );

  const latestParams = useRef<Record<string, any>>({});

  const fetchData = useCallback(
    (params: Record<string, any>) => {
      latestParams.current = params;
      fetchItems({
        ...params,
        companyId,
        start: startDate ? startDate.toISOString() : null,
        end: endDate ? endDate.toISOString() : null,
      });
    },
    [companyId, startDate, endDate, fetchItems],
  );

  useEffect(() => {
    const init = async () => {
      setLocalLoading(true);
      try {
        await fetchCompanyOptions();
      } catch {
        //
      } finally {
        setLocalLoading(false);
      }
    };

    init();
  }, [fetchCompanyOptions]);

  // Ref to skip first effect run
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    fetchData(latestParams.current || {});
  }, [companyId, startDate, endDate, fetchData]);

  return localLoading ? (
    <Loader />
  ) : (
    <>
      <Grid
        container
        spacing={2}
        columns={{ sm: 12, md: 12 }}
        sx={{
          mb: '1rem',
          mt: 0,
          alignItems: 'flex-end',
          direction: 'row',
          overflow: 'visible', // Allow the dropdown to overflow if needed
          width: '100%',
          marginTop: '0.5rem',
        }}
        alignItems='flex-end' // Aligns items vertically in the center
        direction='row' // Ensures that items are aligned horizontally in a row
      >
        <Grid
          sx={{ position: 'relative', zIndex: '900' }}
          size={{
            sm: 12,
            md: 2,
          }}
        >
          <label htmlFor='Company'>Company</label>
          <CustomSelect
            isMulti={false}
            onChange={(val: any) =>
              setCompanyId(val ? (val?.value ?? null) : null)
            }
            value={
              companyOptions.find((option) => option.value === companyId) ||
              null
            }
            placeholder='Select Company'
            options={companyOptions}
            name='Company'
            menuPortalTarget={document.body}
            isClearable
          />
        </Grid>
        <Grid
          size={{
            sm: 12,
            md: 'auto',
          }}
        >
          <label>Start Date</label>
          <div>
            <OptimizerActionLogsDatePicker
              selected={startDate}
              placeholderText='Select Start Date'
              onChange={(value) => {
                setStartDate(value);
              }}
            />
          </div>
        </Grid>
        <Grid
          size={{
            sm: 12,
            md: 'auto',
          }}
        >
          <label>End Date</label>
          <div>
            <OptimizerActionLogsDatePicker
              selected={endDate}
              placeholderText='Select End Date'
              onChange={(value) => {
                setEndDate(value);
              }}
            />
          </div>
        </Grid>
      </Grid>

      <DynamicTable
        columns={columns}
        rows={items}
        count={totalCount}
        loading={isLoading}
        fetchData={fetchData}
      />

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </>
  );
};

export default OptimizerActionLogsTable;
