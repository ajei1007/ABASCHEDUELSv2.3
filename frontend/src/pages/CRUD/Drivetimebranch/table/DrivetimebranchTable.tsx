import actions from 'store/actions/drivetimebranch/drivetimebranchListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { Stack } from '@mui/material';
import CustomButton from 'components/Button';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import axios from 'axios';
import { toast } from 'react-toastify';
import role_permissions from 'helpers/role_permissions';

const DrivetimebranchTable = () => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector(
    (store) => store.drivetimebranch.list.loading,
  );
  const rows = useTypedSelector((store) => store.drivetimebranch.list.rows);
  const count = useTypedSelector((store) => store.drivetimebranch.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.drivetimebranch.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.drivetimebranch.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editAvailability'
        deletePermissionType='deleteAvailability'
        editEvent={() => navigate(`/admin/drivetimebranch/${cell}/edit`)}
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
        accessorFn: (row: any) => row.branch1?.name,
        id: 'branch1',
        header: 'Branch 1',
        Cell: (row: any) => {
          const data = row.row.original?.branch1;
          if (data) {
            return data.name;
          }
        },
      },
      {
        accessorFn: (row: any) => row.branch2?.name,
        id: 'branch2',
        header: 'Branch 2',
        Cell: (row: any) => {
          const data = row.row.original?.branch2;
          if (data) {
            return data.name;
          }
        },
      },
      { accessorKey: 'time', header: 'Time', size: 60 },
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

  const handleExportDrivetimebranchTable = async () => {
    try {
      const response = await axios.get('/drivetimebranch');
      const formattedData = response.data.rows.map((row: any) => ({
        'Branch 1': row.branch1?.name,
        'Branch 2': row.branch2?.name,
        Time: row.time,
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };
  return (
    <div>
      <Widget className='widget-p-md' title={<h4>Drivetimebranch</h4>}>
        {/* Header Buttons */}
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createBranch') && (
            <Link to='/admin/drivetimebranch/new'>
              <CustomButton type='button'>New</CustomButton>
            </Link>
             )}
          </Stack>
          <ExportTableButton
            name='Drivetimebranch'
            handleExport={handleExportDrivetimebranchTable}
          />
        </Stack>

        <DynamicTable
          columns={columns}
          rows={rows}
          count={count}
          loading={loading}
          fetchData={(filterObj: any) => dispatch(actions.doFetch(filterObj))}
          enableColumnFilters={false}
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

export default DrivetimebranchTable;
