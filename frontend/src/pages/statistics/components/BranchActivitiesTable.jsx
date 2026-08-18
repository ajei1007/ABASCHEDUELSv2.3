import { useMemo, useState } from 'react';
import CustomInput from '../../../components/CustomInputModal/CustomInput';
import { Stack, Tooltip, Typography } from '@mui/material';
import { colourNameToHex } from 'utils/colorNameToHex';
import UndynamicTreeTable from 'components/Table/UndynamicTreeTable';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { periodOptions } from 'constants/statistics';
import {
  fetchStatisticsBranchActivitiesTable,
  setSelectedPeriod,
} from 'store/slices/statistics/actions';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import Loader from 'components/Loader/Loader';

const BranchActivitiesTable = ({ response }) => {
  const dispatch = useAppDispatch();
  const selectedPeriod = useSelector(
    (state) => state.statistics.selectedPeriod,
  );
  const branchActivitiesAllLoaded = useSelector(
    (state) => state.statistics.branchActivitiesAllLoaded,
  );
  const selectedDashboardBranches = useSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );
  //
  const [search, setSearch] = useState('');

  const columns = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.user,
        id: 'name',
        header: 'Name',
        Cell: (row) => {
          const name = row.row.original.name;
          return name;
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 90,
        Cell: (row) =>
          row.row.original?.total === 0 ? '' : row.row.original?.total,
      },
      {
        accessorKey: 'totalBillable',
        header: 'Billable',
        Cell: (row) =>
          row.row.original?.totalBillable === 0
            ? ''
            : row.row.original?.totalBillable,
        size: 120,
      },
      {
        accessorKey: 'totalNonBillable',
        header: 'Nonbillable',
        Cell: (row) =>
          row.row.original?.totalNonBillable === 0
            ? ''
            : row.row.original?.totalNonBillable,
        size: 130,
      },
      {
        accessorKey: 'productivity',
        header: 'Productivity',
        Cell: (row) => {
          const thisRow = row.row.original;
          return thisRow?.productivity > 0 ? `${thisRow.productivity}%` : '';
        },
        Header: () => (
          <Tooltip title='Productivity' arrow placement='top-start'>
            <span>Productivity</span>
          </Tooltip>
        ),
        size: 90,
      },
      {
        accessorKey: 'efficiency',
        header: 'Efficiency',
        Cell: (row) => {
          const thisRow = row.row.original;
          return thisRow?.efficiency > 0 ? `${thisRow.efficiency}%` : '';
        },
        Header: () => (
          <Tooltip title='Efficiency' arrow placement='top-start'>
            <span>Efficiency</span>
          </Tooltip>
        ),
        size: 90,
      },
      {
        accessorKey: 'cancellationRate',
        header: 'Cancellation Rate',
        Cell: (row) =>
          row.row.original?.cancellationRate === 0
            ? ''
            : `${row.row.original?.cancellationRate}%`,
        Header: () => (
          <Tooltip title='Cancellation Rate' arrow placement='top-start'>
            <span>Cancellation Rate</span>
          </Tooltip>
        ),
        size: 90,
      },
      {
        accessorKey: 'supervisionRate',
        header: 'Supervision Rate',
        Cell: (row) =>
          row.row.original?.supervisionRate === 0
            ? ''
            : `${row.row.original?.supervisionRate}%`,
        Header: () => (
          <Tooltip title='Supervision Rate' arrow placement='top-start'>
            <span>Supervision Rate</span>
          </Tooltip>
        ),
        size: 90,
      },
      ...response.columns
        .filter((val) => {
          return val.total !== 0;
        })
        .map((val) => ({
          accessorFn: (row) =>
            row[val.id].total === 0 ? '' : row[val.id].total,
          id: val.id,
          header: val.name,
          Header: ({ column }) => {
            return (
              <Tooltip
                title={column.columnDef.header}
                arrow
                placement='top-start'
              >
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    color: colourNameToHex(val?.color),
                  }}
                >
                  {column.columnDef.header}
                </span>
              </Tooltip>
            );
          },
          size: 100,
        })),
    ];
  }, [response]);

  const filteredRows = useMemo(() => {
    return response.rows.filter((row) => {
      const label = `${row.user?.firstName} ${row.user?.lastName || ''}`;
      // if (!label) {
      //   return false;
      // }
      return label.toLowerCase().includes(search.toLowerCase());
    });
  }, [response.rows, search]);

  const handleSelectPeriod = (val) => {
    // if (isDateRangeMoreThanTheLimit(selectedBranchActivitiesStartDate, selectedBranchActivitiesEndDate, 180) && val.value === 'weekly') {
    //   return toast.error('Date range cannot be more than 6 months in weekly period!')
    // }
    dispatch(
      fetchStatisticsBranchActivitiesTable({
        selectedPeriod: val.value,
        branches: selectedDashboardBranches,
      }),
    );
    dispatch(setSelectedPeriod(val));
  };

  const handleExportActivityTable = async () => {
    const resColumns = response.columns;
    const resRows = response.rows;

    let allRows = [];
    resRows.forEach((r) => {
      allRows = [...allRows, r];
      if (r?.subRows?.length) {
        const subRows = r.subRows.map((s) => ({
          ...s,
          date: s.name,
          name: r.name,
        }));
        allRows = [...allRows, ...subRows];
      }
    });
    const tableRows = allRows.map((row) => {
      let newObj = {
        Name: `${row?.name}`,
        Date: `${row?.date ?? ''}`,
        Total: row?.total,
        Billable: row?.totalBillable,
        Nonbillable: row?.totalNonBillable,
        Productivity: row?.productivity > 0 ? `${row.productivity}%` : '',
        Efficiency: row?.efficiency > 0 ? `${row.efficiency}%` : '',
        'Cancellation Rate': row?.cancellationRate,
        'Supervision Rate': row?.supervisionRate,
      };
      Object.entries(row).forEach((rowKeyValue) => {
        const key = rowKeyValue[0];
        const value = rowKeyValue[1];
        const findResource = resColumns.find((col) => col.id === key);
        if (findResource) {
          newObj = {
            ...newObj,
            [findResource.name]: value.total,
          };
        }
      });
      return newObj;
    });

    return tableRows;
  };
  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack width='300px'>
          <CustomInput
            name='search'
            placeholder='Search'
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            data-qa='reports-search'
          />
        </Stack>
        <Stack
          direction='row'
          alignItems='center'
          flexWrap='wrap'
          columnGap='1rem'
          rowGap='10px'
        >
          <div style={{ minWidth: '120px' }}>
            <CustomSelect
              options={periodOptions}
              value={selectedPeriod}
              onChange={handleSelectPeriod}
              placeholder='Period'
              data-qa='reports-filter-dropdown'
            />
          </div>
          <ExportTableButton
            name={'Branch Activities Table'}
            handleExport={handleExportActivityTable}
            data-qa='reporting-export'
          />
        </Stack>
      </Stack>
      {branchActivitiesAllLoaded && (
        <Stack flexDirection='row' justifyContent='center' alignItems='center'>
          <Loader />
          <Typography pl='16px'>Loading partially...</Typography>
        </Stack>
      )}
      <UndynamicTreeTable
        columns={columns}
        rows={filteredRows}
        dataQa='reports'
      />
    </>
  );
};

export default BranchActivitiesTable;
