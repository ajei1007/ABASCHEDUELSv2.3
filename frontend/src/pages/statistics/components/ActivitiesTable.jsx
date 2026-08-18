import { useMemo, useState } from 'react';
import UndynamicTable from 'pages/calendar/components/UndynamicTable';
import CustomInput from '../../../components/CustomInputModal/CustomInput';
import { Stack, Tooltip } from '@mui/material';
import { colourNameToHex } from 'utils/colorNameToHex';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';

const ActivitiesTable = ({ response }) => {
  const [search, setSearch] = useState('');
  const columns = useMemo(() => {
    return [
      {
        accessorFn: (row) => row.user,
        id: 'name',
        header: 'Name',
        Cell: (row) => {
          const user = row.row.original.user;
          return `${user?.firstName} ${user?.lastName || ''}`;
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 90,
        Cell: (row) => {
          const total = row.row.original?.total;
          if (total) {
            return total;
          }
        },
      },
      {
        accessorKey: 'totalBillable',
        header: 'Billable',
        size: 120,
        Cell: (row) => {
          const totalBillable = row.row.original?.totalBillable;
          if (totalBillable) {
            return totalBillable;
          }
        },
      },
      {
        accessorKey: 'totalNonBillable',
        header: 'Nonbillable',
        size: 130,
        Cell: (row) => {
          const totalNonBillable = row.row.original?.totalNonBillable;
          if (totalNonBillable) {
            return totalNonBillable;
          }
        },
      },
      {
        accessorKey: 'productivity',
        header: 'Productivity',
        Cell: (row) => {
          const productivity = row.row.original?.productivity;
          if (productivity) {
            return `${productivity}%`;
          }
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
          const efficiency = row.row.original?.efficiency;
          if (efficiency) {
            return `${efficiency}%`;
          }
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
        Cell: (row) => {
          const cancellationRate = row.row.original?.cancellationRate;
          if (cancellationRate) {
            return `${cancellationRate}%`;
          }
        },
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
        Cell: (row) => {
          const supervisionRate = row.row.original?.supervisionRate;
          if (supervisionRate) {
            return `${supervisionRate}%`;
          }
        },
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

  const handleExportActivityTable = async () => {
    const resColumns = response.columns;
    const resRows = response.rows;

    const tableRows = resRows.map((row) => {
      let newObj = {
        User: `${row?.user?.firstName} ${row?.user?.lastName ?? ''}`,
        Email: row?.user?.email ?? '',
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
        <ExportTableButton
          name={'Activity Table'}
          handleExport={handleExportActivityTable}
          data-qa='reporting-export'
        />
      </Stack>
      <UndynamicTable
        columns={columns}
        rows={filteredRows}
        enableSorting
        dataQa='reports'
      />
    </>
  );
};

export default ActivitiesTable;
