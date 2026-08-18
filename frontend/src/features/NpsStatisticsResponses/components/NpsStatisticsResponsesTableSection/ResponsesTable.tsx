import { MaterialReactTable } from 'material-react-table';
import { useMemo } from 'react';
import moment from 'moment';
import { Box, Chip } from '@mui/material';
import {
  getNpsScoreLabel,
  getNpsScoreFgColor,
  getNpsScoreBgColor,
} from '../../utils';
import type { IApiNpsStatisticsResponseItem } from 'types/api';

export interface IRethinkResourcesTableProps {
  rows: IApiNpsStatisticsResponseItem[];
  count: number;
  page: number;
  limit: number;
  loading?: boolean;
  hideCompanyColumn?: boolean;
  updatePagination: (pagination: { page: number; limit: number }) => void;
}

const columns = [
  {
    accessorKey: 'company',
    header: 'Company',
    Cell: (row: any) => {
      const companyName = row?.row.original?.company?.name;
      return companyName || '-';
    },
    size: 100,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'userType',
    header: 'User Type',
    Cell: (row: any) => {
      const userType = row?.row.original?.userType;
      return row?.row.original?.userType ? (
        <Chip
          label={`${row?.row.original?.userType}`}
          variant='filled'
          sx={{
            color:
              userType === 'client' ? 'rgb(30, 64, 175)' : 'rgb(107, 33, 168)',
            backgroundColor:
              userType === 'client'
                ? 'rgb(219, 234, 254)'
                : 'rgb(243, 232, 255)',
            py: '1px',
            height: '28px',
            textTransform: 'capitalize',
          }}
        />
      ) : (
        '-'
      );
    },
    size: 90,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'standardRoles',
    header: 'Standard Role',
    Cell: (row: any) => {
      const roles = Array.isArray(row?.row.original?.roles)
        ? row?.row.original?.roles
        : [];
      return roles.length === 0 ? (
        '-'
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {roles.map((role: any) => (
            <Chip
              key={role.id}
              label={role.standardRoles}
              variant='outlined'
              sx={{
                py: '1px',
                height: '28px',
                textTransform: 'capitalize',
              }}
            />
          ))}
        </Box>
      );
    },
    size: 90,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    Cell: (row: any) => {
      const roles = Array.isArray(row?.row.original?.roles)
        ? row?.row.original?.roles
        : [];
      return roles.length === 0 ? (
        '-'
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {roles.map((role: any) => (
            <Chip
              key={role.id}
              label={role.name}
              variant='outlined'
              sx={{
                py: '1px',
                height: '28px',
                textTransform: 'capitalize',
              }}
            />
          ))}
        </Box>
      );
    },
    size: 90,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'fullName',
    header: 'Full Name',
    Cell: (row: any) => {
      const firstName = row?.row.original?.firstName ?? '';
      const lastName = row?.row.original?.lastName ?? '';
      return `${firstName} ${lastName}`;
    },
    size: 120,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    Cell: (row: any) => {
      const rating = row?.row.original?.rating;
      const color = getNpsScoreFgColor(rating);
      const backgroundColor = getNpsScoreBgColor(rating);

      return (
        <Chip
          label={`${rating}/10`}
          variant='filled'
          sx={{
            color,
            backgroundColor,
            py: '1px',
            height: '28px',
            textTransform: 'capitalize',
          }}
        />
      );
    },
    size: 70,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    Cell: (row: any) => {
      const rating = row?.row.original?.rating;

      return getNpsScoreLabel(rating);
    },
    size: 80,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'feedback',
    header: 'Feedback',
    Cell: (row: any) => {
      return row?.row.original?.feedback ?? '-';
    },
    size: 140,
    grow: true,
    enableEditing: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Surveyed At',
    Cell: (row: any) => {
      return moment(row?.row.original?.createdAt).format('MM/DD/YYYY HH:mm:ss');
    },
    size: 100,
    grow: false,
    enableEditing: false,
  },
];

const ResponsesTable = ({
  rows,
  count,
  page,
  limit,
  loading = false,
  hideCompanyColumn = false,
  updatePagination,
}: IRethinkResourcesTableProps) => {
  const pagination = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: limit,
    }),
    [page, limit],
  );

  const tableColumns = useMemo(() => {
    return hideCompanyColumn
      ? columns.filter((col) => col.accessorKey !== 'company')
      : columns;
  }, [hideCompanyColumn]);

  return (
    <>
      {/* Table */}
      <MaterialReactTable
        columns={tableColumns}
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
          density: 'comfortable',
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

export default ResponsesTable;
