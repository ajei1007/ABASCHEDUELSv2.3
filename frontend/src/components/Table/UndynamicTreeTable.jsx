/* eslint-disable react-hooks/exhaustive-deps */
import { MaterialReactTable } from 'material-react-table';
import { useMemo, useState } from 'react';

const UndynamicTreeTable = ({ columns, rows, dataQa = '' }) => {
  const [expanded, setExpanded] = useState({});

  const rootData = useMemo(() => rows.filter((r) => !r.parentId), [rows]);
  return (
    <>
      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={rootData}
        enablePagination={false}
        state={{ showSkeletons: false, expanded }}
        rowCount={Number(rows.length)}
        enableColumnActions={false}
        enableColumnFilters={false}
        enableHiding={false}
        enableColumnPinning={true}
        initialState={{
          columnPinning: {
            left: ['mrt-row-expand', 'id', 'name', 'firstName', 'lastName'],
          },
        }}
        enableTopToolbar={false}
        // Expandable
        enableExpandAll={false}
        enableExpanding={true}
        getRowCanExpand={(row) => !!row?.original?.subRows?.length}
        getRowId={(row) => row.id}
        getSubRows={(row) => row.subRows}
        onExpandedChange={(updater) => {
          const nextState = updater(expanded);
          setExpanded(nextState);
          // handleOpenSubRow(nextState);
        }}
        // Props
        muiTableProps={{ sx: { tableLayout: 'fixed' } }}
        muiTableHeadRowProps={{ sx: { boxShadow: 'none' } }}
        muiSkeletonProps={{ sx: { minHeight: '30px' } }}
        muiTableHeadProps={{
          sx: () => ({
            '& th': {
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
            },
            '& tr:nth-of-type(odd)': {
              backgroundColor: '#F7F8FB !important',
              boxShadow: 'none',
              '& td': {
                backgroundColor: '#F7F8FB',
                boxShadow: 'none',
              },
            },
            '& tr td[data-pinned]:before': {
              display: 'none',
            },
          }),
        }}
        muiTableBodyRowProps={{
          'data-qa': `${dataQa}table-row`,
          hover: true,
          sx: {
            '&:hover': {
              '& *': { color: 'white' },
              '& td': { backgroundColor: '#4d53e0 !important' },
            },
          },
        }}
        muiPaginationProps={{
          rowsPerPageOptions: [10, 25, 50, 100],
          showFirstButton: false,
          showLastButton: false,
        }}
        muiTableHeadCellProps={({ column }) => ({
          'data-qa': column.getCanSort() ? `${dataQa}-sort-header` : undefined,
        })}
      />
    </>
  );
};

export default UndynamicTreeTable;
