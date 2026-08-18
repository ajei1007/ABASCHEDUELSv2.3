// eslint-disable-next-line
import actions from 'store/actions/mobiletokens/mobiletokensListActions';
import React, { useMemo } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';

const MobiletokensTable = () => {
  const loading = useTypedSelector((store) => store.mobiletokens.list.loading);
  const rows = useTypedSelector((store) => store.mobiletokens.list.rows);
  const count = useTypedSelector((store) => store.mobiletokens.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.mobiletokens.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.mobiletokens.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/mobiletokens/${cell}/edit`)}
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
        size: 80,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'token',
        header: 'Token',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row: any) => row.users?.firstName,
        id: 'users',
        header: 'Users',
        Cell: (row: any) => {
          <p>{row.row.original?.users.firstName}</p>;
          const user = row.row.original?.users;
          if(user){
            return user.map((u: any) => (
              <div>{u.firstName + ' ' + u.lastName}</div>
            ));
          }
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div>
      <Widget className='widget-p-md' title={<h4>Mobiletokens</h4>}>
        {/* Table */}
        <DynamicTable
          columns={columns}
          rows={rows}
          count={count}
          loading={loading}
          fetchData={(filterObj: any) => {
            dispatch(actions.doFetch(filterObj));
          }}
        />
      </Widget>
      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </div>
  );
};

export default MobiletokensTable;
