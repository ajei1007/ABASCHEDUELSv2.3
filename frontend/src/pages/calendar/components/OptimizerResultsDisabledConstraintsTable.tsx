import { memo, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { useAppSelector } from 'store/hooks';
import { CONSTRAINT_TYPES } from 'pages/CRUD/CustomConstraints/helpers/customTypes';
import { optimizerDisabledConstraintsSelector } from 'store/selectors/optimizerSelectors';

const tableColumns = [
  {
    accessorKey: 'constraintType',
    header: 'Constraint Type',
    enableSorting: false,
    Cell: (row: any) => {
      const constraintType = row?.row.original?.constraintType;
      const constraintTypeObj = CONSTRAINT_TYPES.find(
        (type: any) => type.value === constraintType,
      );
      return constraintTypeObj?.label || '';
    },
    size: 120,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    enableSorting: false,
    Cell: (row: any) => {
      const content = row?.row.original?.content;
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    },
    size: 240,
  },
];

const OptimizerResultsDisabledConstraintsTable = () => {
  const flaggingCustomConstraints = useAppSelector((state) =>
    Array.isArray(state.flagging?.customConstraints)
      ? state.flagging?.customConstraints
      : [],
  );
  const optimizerDisabledConstraints = useAppSelector(
    optimizerDisabledConstraintsSelector,
  );

  const constraints = useMemo(
    () =>
      flaggingCustomConstraints.filter((constraint) =>
        optimizerDisabledConstraints.includes(constraint.constraintId),
      ),
    [flaggingCustomConstraints, optimizerDisabledConstraints],
  );

  return (
    <MaterialReactTable
      columns={tableColumns}
      data={constraints}
      manualPagination
      enablePagination={false}
      rowCount={constraints.length}
      enableColumnActions={false}
      enableColumnFilters={false}
      enableHiding={false}
      manualSorting
      enableColumnPinning={false}
      enableRowPinning={false}
      initialState={{
        columnPinning: {
          left: ['mrt-row-expand', 'id', 'name', 'firstName', 'lastName'],
        },
      }}
      enableTopToolbar={false}
      enableBottomToolbar={false}
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

          '.MuiIconButton-root': {
            padding: '0.5rem !important',
          },
          '.MuiIconButton-root svg': {
            height: '0.75rem !important',
            width: '0.75rem !important',
          },
        }),
      }}
      muiTableBodyProps={{
        sx: () => ({
          '& td': {
            border: 'none',
            color: '#16365f',
            boxShadow: 'none !important',
            whiteSpace: 'normal', // Allow text to wrap to a new line
            wordWrap: 'break-word', // Ensure long words wrap within cells
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
    />
  );
};

export default memo(OptimizerResultsDisabledConstraintsTable);
