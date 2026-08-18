/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/capacityconstraints/capacityconstraintsListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Chip, Stack, Typography, Box } from '@mui/material';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import role_permissions from 'helpers/role_permissions';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';

const CapacityconstraintsTable = () => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector(
    (store) => store.capacityconstraints.list.loading,
  );
  const rows = useTypedSelector((store) => store.capacityconstraints.list.rows);
  const count = useTypedSelector(
    (store) => store.capacityconstraints.list.count,
  );
  const modalOpen = useTypedSelector(
    (store) => store.capacityconstraints.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.capacityconstraints.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const roleCol = (i: number) => ({
    accessorFn: (row: any) => row[`role${i}`]?.name,
    id: `role${i}`,
    header: `role${i}`,
    enableSorting: false,
    Cell: ({ row }: any) =>
      row.original[`role${i}`] ? (
        <Chip
          label={row.original[`role${i}`].name}
          component='a'
          href='/'
          variant='outlined'
          clickable
        />
      ) : null,
  });

  const tagCol = (i: number) => ({
    accessorFn: (row: any) =>
      row[`subgroup${i}`]?.name ?? row[`subgroup${i}`]?.label,
    id: `tag${i}`,
    header: `tag${i}`,
    enableSorting: false,
    Cell: ({ row }: any) => {
      const label =
        row.original[`subgroup${i}`]?.name ??
        row.original[`subgroup${i}`]?.label;
      return label ? (
        <Chip
          label={label}
          component='a'
          href='/'
          variant='outlined'
          clickable
        />
      ) : null;
    },
  });

  const minCol = (i: number) => ({
    accessorKey: `min${i}`,
    id: `min${i}`,
    header: `min${i}`,
    size: 110,
    Cell: ({ row }: any) =>
      row.original[`role${i}`] && (
        <Box pl={0.75}>{row.original[`min${i}`] ?? ''}</Box>
      ),
  });

  const maxCol = (i: number) => ({
    accessorKey: `max${i}`,
    id: `max${i}`,
    header: `max${i}`,
    size: 110,
    Cell: ({ row }: any) =>
      row.original[`role${i}`] && (
        <Box pl={0.75}>{row.original[`max${i}`] ?? ''}</Box>
      ),
  });

  const baseCols = [
    {
      accessorKey: 'id',
      header: '',
      size: 70,
      Cell: ({ renderedCellValue }: { renderedCellValue: any }) =>
        actionFormatter(renderedCellValue),
    },
    {
      accessorFn: (row: any) => row.activity?.name,
      id: 'activity',
      header: 'Activity',
      enableSorting: false,
      Cell: ({ row }: any) =>
        row.original?.user1 ? (
          <Link to='/'>{row.original.user1.firstName}</Link>
        ) : null,
    },
    {
      accessorKey: 'disabled',
      id: 'disabled',
      header: 'Inactive',
      size: 120,
      Cell: ({ cell }: any) => (
        <Typography>{cell.getValue() ? 'Yes' : 'No'}</Typography>
      ),
    },
    {
      accessorKey: 'locationDisabled',
      id: 'locationDisabled',
      header: 'Location Disabled',
      size: 150,
      Cell: ({ cell }: any) => (
        <Typography>{cell.getValue() ? 'Yes' : 'No'}</Typography>
      ),
    },
  ];

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editConstraint'
        deletePermissionType='deleteConstraint'
        editEvent={() => navigate(`/admin/capacityconstraints/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useMemo(() => {
    const constraintCols = Array.from({ length: 5 }, (_, k) => {
      const i = k + 1;
      return [roleCol(i), tagCol(i), minCol(i), maxCol(i)];
    }).flat();

    return [...baseCols, ...constraintCols];
  }, []);

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete(id!));
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const handleExportCapacityconstraintsTable = async () => {
    try {
      const response = await axios.get(`/capacityconstraints`);
      const formattedData = response.data.rows.map((row: any) => ({
        'User 1': row.user1?.firstName,
        'Role 1': row?.role1?.name,
        'Min 1': row?.min1,
        'Max 1': row?.max1,
        'Role 2': row?.role2?.name,
        'Min 2': row?.min2,
        'Max 2': row?.max2,
        'Role 3': row?.role3?.name,
        'Min 3': row?.min3,
        'Max 3': row?.max3,
        'Role 4': row?.role4?.name,
        'Min 4': row?.min4,
        'Max 4': row?.max4,
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  return (
    <>
      <Widget className='widget-p-md' title={<h4>Capacity Constraints</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createConstraint') && (
              <Link to='/admin/capacityconstraints/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name='Capacityconstraints'
            handleExport={handleExportCapacityconstraintsTable}
          />
        </Stack>
        <DynamicTable
          columns={columns}
          rows={rows}
          loading={loading}
          count={count}
          fetchData={(filterObj: any) => dispatch(actions.doFetch(filterObj))}
          enableColumnFilters={false}
        />
      </Widget>

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </>
  );
};

export default CapacityconstraintsTable;
