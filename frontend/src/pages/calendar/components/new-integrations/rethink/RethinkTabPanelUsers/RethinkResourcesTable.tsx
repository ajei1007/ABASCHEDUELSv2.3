import { MaterialReactTable } from 'material-react-table';
import { useMemo } from 'react';
import moment from 'moment';
import { Chip } from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import type { IApiIntegrationResourceItem } from 'types/api/integrations';

export interface IRethinkResourcesTableProps {
  rows: IApiIntegrationResourceItem[];
  count: number;
  page: number;
  limit: number;
  lastImported: number | null;
  loading?: boolean;
  updatePagination: (pagination: { page: number; limit: number }) => void;
}

const RethinkResourcesTable = ({
  rows,
  count,
  page,
  limit,
  lastImported,
  loading = false,
  updatePagination,
}: IRethinkResourcesTableProps) => {
  const pagination = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: limit,
    }),
    [page, limit],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'resourceName',
        header: 'Resource Name',
        Cell: (row: any) => {
          const firstName = row?.row.original?.user?.firstName ?? '';
          const lastName = row?.row.original?.user?.lastName ?? '';
          return `${firstName} ${lastName}`;
        },
        size: 150,
        grow: true,
        enableEditing: false,
      },
      {
        accessorKey: 'resourceType',
        header: 'Type',
        Cell: (row: any) => {
          const resourceType = row?.row.original?.resourceType;
          if (resourceType) {
            return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
          }
          return '';
        },
        size: 130,
        grow: true,
        enableEditing: false,
      },
      {
        accessorKey: 'createdAt',
        header: 'Imported At',
        Cell: (row: any) => {
          return moment(row?.row.original?.createdAt).format(
            'MM/DD/YYYY HH:mm:ss',
          );
        },
        size: 110,
        grow: false,
        enableEditing: false,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Synced At',
        Cell: (row: any) => {
          return moment(row?.row.original?.updatedAt).format(
            'MM/DD/YYYY HH:mm:ss',
          );
        },
        size: 100,
        grow: false,
        enableEditing: false,
      },
      {
        accessorKey: 'empty',
        header: '',
        Cell: (row: any) => {
          const lastImportedDate = moment(lastImported);
          const createdAtDate = moment(row?.row.original?.createdAt);
          const isNew = createdAtDate.isAfter(lastImportedDate);
          if (!isNew) {
            return ' ';
          }

          return (
            <Chip
              label='New'
              size='small'
              color='info'
              icon={
                <GradeIcon
                  sx={{
                    fontSize: '12px!important',
                  }}
                />
              }
              sx={{
                color: 'white',
                fontSize: '10px',
                py: '1px',
                height: '20px',
                opacity: 0.7,
              }}
            />
          );
        },
        size: 10,
        grow: false,
        enableEditing: false,
      },
    ],
    [lastImported],
  );

  return (
    <>
      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={rows}
        rowCount={Number(count)}
        // Pagination
        manualPagination
        enablePagination={true}
        onPaginationChange={(updater) => {
          const nextState =
            typeof updater === 'function' ? updater(pagination) : updater;
          updatePagination({
            page: nextState.pageIndex + 1,
            limit: nextState.pageSize,
          });
        }}
        // States
        initialState={{
          density: 'compact',
        }}
        state={{
          pagination,
          showSkeletons: loading,
        }}
        // Sorting
        manualSorting
        // Filters
        manualFiltering
        enableGlobalFilter={false}
        //
        enableSorting={false}
        enableColumnActions={false}
        enableColumnFilters={false}
        enableHiding={false}
        enableColumnPinning={false}
        enableTopToolbar={false}
        editDisplayMode='table'
        // Styles
        muiTableProps={{
          sx: {
            tableLayout: 'fixed',
          },
        }}
        muiTableContainerProps={{
          sx: {
            // overflow: 'unset !important',
            overflowY: 'auto',
          },
        }}
        muiTableHeadRowProps={{ sx: { boxShadow: 'none' } }}
        muiSkeletonProps={({ column }) => ({
          sx: {
            display: column.id === 'empty' ? 'none' : undefined,
            minHeight: '16px',
          },
        })}
        muiTableHeadProps={{
          sx: () => ({
            '& th, p': {
              border: 'none',
              boxShadow: 'none',
              color: '#16365f',
              fontWeight: '600',
              fontSize: '0.875rem',
            },
          }),
        }}
        muiTableBodyProps={{
          sx: () => ({
            '& td': {
              border: 'none',
              color: '#16365f',
              boxShadow: 'none !important',
            },
            '& tr': {
              transition: 'none',
              '& td': {
                overflow: 'unset !important',
              },
            },
            '& tr:nth-of-type(odd)': {
              boxShadow: 'none',
              backgroundColor: '#F7F8FB',
              '& td': {
                backgroundColor: '#F7F8FB',
                boxShadow: 'none',
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'unset !important',
            },
          }),
        }}
        muiTableBodyRowProps={{
          hover: true,
        }}
        muiPaginationProps={{
          rowsPerPageOptions: [10, 25, 50, 100],
          showFirstButton: false,
          showLastButton: false,
        }}
      />
    </>
  );
};

export default RethinkResourcesTable;
