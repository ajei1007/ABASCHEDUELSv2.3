/* eslint-disable react-hooks/exhaustive-deps */
import { MaterialReactTable } from 'material-react-table';
import { useEffect, useMemo, useState } from 'react';
import { intersectArrays } from 'pages/calendar/utils/intersectArrays';

const TreeTable = ({ columns, rows, loading = false, fetchData, count }) => {
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    initFetch();
  }, []);

  const initFetch = () => {
    const initFilter = {
      expandable: true,
    };
    initFilter.expandedRows = [];
    fetchData(initFilter);
  };

  const handleOpenSubRow = (val) => {
    let expandedRowIds =
      val === true
        ? 'all'
        : Object.entries(val)
            .filter(([_managerId, isExpanded]) => isExpanded)
            .map(([managerId]) => managerId);

    // If there is no the top branch then send empty
    const rootRows = rows.filter((row) => !row.parentId).map((r) => r.id);
    const isParentUnCollapsed =
      intersectArrays(rootRows, expandedRowIds)?.length === 0;
    if (isParentUnCollapsed) {
      expandedRowIds = [];
    }
    fetchData({
      expandedRows: expandedRowIds,
      expandable: true,
    });
  };

  const rootData = useMemo(() => rows.filter((r) => !r.parentId), [rows]);
  return (
    <>
      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={rootData}
        enablePagination={false}
        state={{ showSkeletons: loading, expanded }}
        rowCount={Number(count)}
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
        getRowCanExpand={(row) => !!row?.original?.subordinateIds?.length}
        getRowId={(row) => row.id}
        getSubRows={(row) => rows.filter((r) => r?.parentId === row.id)}
        onExpandedChange={(updater) => {
          const nextState = updater(expanded);
          setExpanded(nextState);
          handleOpenSubRow(nextState);
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
        displayColumnDefOptions={{
          'mrt-row-expand': {
            enableResizing: true,
            size: 120,
          },
        }}
      />
    </>
  );
};

export default TreeTable;
