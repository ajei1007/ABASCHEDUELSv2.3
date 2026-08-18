import actions from 'store/actions/cancellationtypes/cancellationtypesListActions';
import React, { useMemo } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Stack } from '@mui/material';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import { Link } from 'react-router-dom';
import CustomButton from 'components/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

const CancellationtypesTable = () => {
  const rows = useTypedSelector((store) => store.cancellationtypes.list.rows);
  const count = useTypedSelector((store) => store.cancellationtypes.list.count);
  const loading = useTypedSelector(
    (store) => store.cancellationtypes.list.loading,
  );
  const modalOpen = useTypedSelector(
    (store) => store.cancellationtypes.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.cancellationtypes.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='createCancelation'
        deletePermissionType='deleteCancelation'
        editEvent={() => navigate(`/admin/cancellationtypes/${cell}/edit`)}
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
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'name',
        header: 'Name',
        Cell: (row: any) => {
          return row.row.original?.name;
        },
        size: 60
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete(id!));
  };

  const handleExportCancellationsTable = async () => {
    try {
      const response = await axios.get('/cancellationtypes');
      const formattedData = response.data.rows.map((row: any) => ({
        Name: row.name,
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
      <Widget className='widget-p-md' title={<h4>Cancellation Types</h4>}>
        {/* Header Buttons */}
        <Stack direction='row' justifyContent='space-between'>
          <Link to='/admin/cancellationtypes/new'>
            <CustomButton type='button'>New</CustomButton>
          </Link>
          <ExportTableButton
            name='Cancellations'
            handleExport={handleExportCancellationsTable}
          />
        </Stack>

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
    </>
  );
};

export default CancellationtypesTable;
