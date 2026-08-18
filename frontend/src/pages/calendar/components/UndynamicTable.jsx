import { Stack, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';

const UndynamicTable = ({
  columns,
  rows = [],
  enableSorting = false,
  // row selection
  enableRowSelection = false,
  onRowSelectionChange = () => null,
  rowSelection = {},
  enableEditing = false,
  handleCellChange = () => null,
  isExpandable = false,
  dataQa = '',
}) => {
  return (
    <MaterialReactTable
      columns={columns ?? []}
      data={rows}
      enableColumnActions={false}
      enableColumnFilters={false}
      enableHiding={false}
      enableSorting={enableSorting}
      enableColumnPinning={true}
      enableRowSelection={enableRowSelection}
      enableEditing={enableEditing}
      editDisplayMode='table'
      getRowId={(row) => row.id}
      muiEditTextFieldProps={({ cell }) => ({
        onBlur: (event) => {
          handleCellChange(cell.row.id, event.target.value);
        },
      })}
      onRowSelectionChange={onRowSelectionChange}
      state={{ rowSelection }}
      initialState={{
        columnPinning: {
          left: [
            'mrt-row-expand',
            'id',
            'id2',
            'Original Center',
            'type',
            'name',
            'firstName',
            'lastName',
          ],
        },
      }}
      enableTopToolbar={false}
      muiTableProps={{
        sx: {
          tableLayout: 'fixed',
        },
      }}
      muiTableContainerProps={{
        'data-qa': `${dataQa}-data-table`,
        sx: {
          // overflow: 'unset !important',
          overflowY: 'auto',
        },
      }}
      muiTableHeadRowProps={{ sx: { boxShadow: 'none' } }}
      muiSkeletonProps={{ sx: { minHeight: '30px' } }}
      muiTableHeadProps={{
        sx: () => ({
          '& th, p': {
            border: 'none',
            boxShadow: 'none',
            color: '#16365f',
            fontWeight: '600',
            fontSize: '0.875rem',
          },
          '& th[data-pinned]:before': {
            display: 'none',
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
          '& tr td[data-pinned]:before': {
            display: 'none',
          },
        }),
      }}
      muiTableBodyRowProps={{
        'data-qa': `${dataQa}-table-row`,
        hover: true,
        sx: {
          // '&:hover': {
          //   '& *': { color: 'white', fill: 'white' },
          //   '& td': { backgroundColor: '#4d53e0 !important' },
          // },
        },
      }}
      muiPaginationProps={{
        'data-qa': `${dataQa}-pagination`,
        rowsPerPageOptions: [10, 25, 50, 100],
        showFirstButton: false,
        showLastButton: false,
        SelectProps: {
          inputProps: {
            'data-qa': `${dataQa}-pagination`,
          },
        },
        backIconButtonProps: {
          'data-qa': `${dataQa}-prev-page`,
        },
        nextIconButtonProps: {
          'data-qa': `${dataQa}-next-page`,
        },
      }}
      renderDetailPanel={
        isExpandable
          ? ({ row }) => {
              const arr = row.original.users;
              if (arr?.length) {
                return (
                  <Stack paddingLeft={'60px'} spacing={2}>
                    {arr.map((val, index) => (
                      <Stack flexDirection='row' fontSize={'14px'} key={index}>
                        <Typography
                          fontWeight={600}
                          fontSize={'14px'}
                          width='180px'
                        >
                          {val?.name}
                        </Typography>
                        <Stack flexDirection='row' columnGap={2} width='180px'>
                          <Typography fontSize={'14px'}>Distance: </Typography>
                          <Typography fontSize={'14px'} fontWeight={600}>
                            {val?.distance}
                          </Typography>
                        </Stack>
                        <Stack flexDirection='row' columnGap={2} width='180px'>
                          <Typography fontSize={'14px'}>Center: </Typography>
                          <Typography fontSize={'14px'} fontWeight={600}>
                            {val?.center}
                          </Typography>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                );
              }
              return (
                <Stack paddingLeft={'60px'} spacing={2}>
                  No data found!
                </Stack>
              );
            }
          : null
      }
      muiTableHeadCellProps={({ column }) => {
        return column.getCanSort()
          ? { 'data-qa': `${dataQa}-sort-header` }
          : {};
      }}
    />
  );
};

export default UndynamicTable;
