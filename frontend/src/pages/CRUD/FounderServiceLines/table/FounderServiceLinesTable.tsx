/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/founderServiceLines/founderServiceLinesListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Stack, Typography } from '@mui/material';
import CustomTable from 'components/Table/Table';
import role_permissions from 'helpers/role_permissions';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';

const rows =  [
  {
      id: "24d4a979-dee9-4ec5-afc7-a1e2938ad4d6",
      name: "test service line NAME haha",
      description: "test service line DESCRIPTION",
      disabled: false,
      importHash: "test service line IMPORTHASHssss",
      createdAt: "2024-10-13T12:26:31.000Z",
      updatedAt: "2024-10-13T12:26:31.000Z",
      deletedAt: null,
      createdById: "3db36638-5f30-4b23-86d8-76d0f41367d7",
      updatedById: "3db36638-5f30-4b23-86d8-76d0f41367d7",
      createdBy: {
          id: "3db36638-5f30-4b23-86d8-76d0f41367d7",
          firstName: "Bill"
      }
  },
  {
      id: "1c9190f2-8877-4192-b197-f6edaa19b9c0",
      name: "test service line NAME",
      description: "test service line DESCRIPTION",
      disabled: false,
      importHash: "test service line IMPORTHASHss",
      createdAt: "2024-10-13T12:25:53.000Z",
      updatedAt: "2024-10-13T12:25:53.000Z",
      deletedAt: null,
      createdById: "3db36638-5f30-4b23-86d8-76d0f41367d7",
      updatedById: "3db36638-5f30-4b23-86d8-76d0f41367d7",
      createdBy: {
          id: "3db36638-5f30-4b23-86d8-76d0f41367d7",
          firstName: "Bill"
      }
  },
  {
      id: "229f4b39-a9af-4d82-88da-d9e1999b9e93",
      name: "test service line NAME",
      description: "test service line DESCRIPTION",
      disabled: false,
      importHash: "test service line IMPORTHASH",
      createdAt: "2024-10-13T12:06:48.000Z",
      updatedAt: "2024-10-13T12:07:01.000Z",
      deletedAt: null,
      createdById: "3db36638-5f30-4b23-86d8-76d0f41367d7",
      updatedById: "3db36638-5f30-4b23-86d8-76d0f41367d7",
      createdBy: {
          id: "3db36638-5f30-4b23-86d8-76d0f41367d7",
          firstName: "Bill"
      }
  }
]


const FounderServiceLinesTable = () => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector(
    (store) => store.founderServiceLines.list.loading,
  );
  // const rows = useTypedSelector((store) => store.founderServiceLines.list.rows);
  const count = useTypedSelector(
    (store) => store.founderServiceLines.list.count,
  );
  const modalOpen = useTypedSelector(
    (store) => store.founderServiceLines.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.founderServiceLines.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editConstraint'
        deletePermissionType='deleteConstraint'
        editEvent={() => navigate(`/admin/founderServiceLines/${cell}/edit`)}
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
        size: 120,
      },
      {
        accessorFn: (row: any) => row.createdBy?.firstName,
        id: 'createdBy',
        header: 'Created By',
        enableSorting: false,
        Cell: (row: any) => {
          if (row.row.original?.createdBy) {
            return <Typography>{row.row.original.createdBy.firstName}</Typography>;
          }
          return;
        },
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 100,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 100,
      },
      {
        accessorKey: 'importHash',
        header: 'Import Hash',
        size: 100,
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
      <Widget className='widget-p-md' title={<h4>Founder ServiceLines</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createConstraint') && (
              <Link to='/admin/founderServiceLines/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
        </Stack>
        <CustomTable
          columns={columns}
          rows={rows}
          loading={loading}
          count={count}
          fetchData={(filterObj: any) => dispatch(actions.doFetch(filterObj))}
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

export default FounderServiceLinesTable;
