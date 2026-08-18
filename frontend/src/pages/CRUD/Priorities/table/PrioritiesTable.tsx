/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/priorities/prioritiesListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import { Stack } from '@mui/material';
import role_permissions from 'helpers/role_permissions';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';

const PrioritiesTable = () => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector((store) => store.priorities.list.loading);
  const rows = useTypedSelector((store) => store.priorities.list.rows);
  const count = useTypedSelector((store) => store.priorities.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.priorities.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.priorities.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editConstraint'
        deletePermissionType='deleteConstraint'
        editEvent={() => navigate(`/admin/priorities/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '',
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
        size: 60,
      },
      {
        accessorFn: (row: any) => row.user1?.firstName,
        id: 'user1',
        header: 'User1',
        enableSorting: false,
        Cell: (row: any) => {
          if (row.row.original?.user1) {
            return (
              <Link
                to={`/admin/branchtype/${row.row.original.user1?.firstName}/edit`}
              >
                {row.row.original.user1.firstName}
              </Link>
            );
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.user2?.firstName,
        id: 'user2',
        header: 'User2',
        enableSorting: false,
        Cell: (row: any) => {
          if (row.row.original?.user2) {
            return (
              <Link
                to={`/admin/branchtype/${row.row.original.user2?.firstName}/edit`}
              >
                {row.row.original.user2.firstName}
              </Link>
            );
          }
          return;
        },
      },
      {
        accessorKey: 'rank',
        header: 'Rank',
        size: 60,
      },
    ],
    [],
  );

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

  const handleExportPrioritiesTable = async () => {
    try {
      const response = await axios.get('/priorities');
      const formattedData = response.data.rows.map((row: any) => ({
        'User 1': row.user1?.firstName,
        'User 2': row.user2?.firstName,
        Rank: row?.rank,
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
      <Widget className='widget-p-md' title={<h4>Priorities</h4>}>
        {/* Header buttons */}
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createConstraint') && (
              <Link to='/admin/priorities/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name='Priorities'
            handleExport={handleExportPrioritiesTable}
          />
        </Stack>
        {/* Table */}
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

export default PrioritiesTable;
