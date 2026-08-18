/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line
import actions from 'store/actions/distanceMatrix/distanceMatrixListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { Stack } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import CustomButton from 'components/Button';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';

const DistanceMatrixTable = () => {
  const rows = useTypedSelector((store) => store.distanceMatrix.list.rows);
  const count = useTypedSelector((store) => store.distanceMatrix.list.count);
  const loading = useTypedSelector(
    (store) => store.distanceMatrix.list.loading,
  );
  const modalOpen = useTypedSelector(
    (store) => store.distanceMatrix.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.distanceMatrix.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editEvent'
        deletePermissionType='deleteEvent'
        editEvent={() => navigate(`/admin/distancematrix/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
        size: 80,
      },
      {
        accessorFn: (row: any) => row.user1?.name,
        id: 'user1',
        header: 'User 1',
        Cell: (row: any) => {
          const user = row.row.original?.user1;
          return `${user?.firstName || ''} ${user?.lastName || ''}`;
        },
      },
      {
        accessorFn: (row: any) => row.user2?.name,
        id: 'user2',
        header: 'User 2',
        Cell: (row: any) => {
          const user = row.row.original?.user2;
          return `${user?.firstName || ''} ${user?.lastName || ''}`;
        },
      },
      {
        accessorKey: 'address1',
        header: 'Address 1',
      },
      {
        accessorKey: 'address2',
        header: 'Address 2',
      },
      {
        accessorKey: 'distance',
        header: 'Distance',
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
      },
      {
        accessorFn: (row: any) => row.duration_early?.name,
        id: 'duration_early',
        header: 'Duration Early',
        Cell: (row: any) => {
          const data = row.row.original?.duration_early;
          if (data) {
            return data.name;
          }
        },
      },
      {
        accessorFn: (row: any) => row.duration_late?.name,
        id: 'duration_late',
        header: 'Duration Late',
        Cell: (row: any) => {
          const data = row.row.original?.duration_late;
          if (data) {
            return data.name;
          }
        },
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

  return (
    <>
      <Widget className='widget-p-md' title={<h4>Distance Matrix</h4>}>
        {/* Header Buttons */}
        <Stack direction='row' justifyContent='space-between' mb={2}>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            <Link to='/admin/distancematrix/new'>
              <CustomButton type='button'>New</CustomButton>
            </Link>
          </Stack>
        </Stack>
        <DynamicTable
          columns={columns}
          rows={rows}
          count={count}
          loading={loading}
          fetchData={(filterObj: any) => {
            dispatch(actions.doFetch(filterObj));
          }}
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

export default DistanceMatrixTable;
