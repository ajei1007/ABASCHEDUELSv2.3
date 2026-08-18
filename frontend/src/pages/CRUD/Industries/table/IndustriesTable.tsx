import actions from 'store/actions/industries/industriesListActions';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import { Stack } from '@mui/material';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import role_permissions from 'helpers/role_permissions';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import axios from 'axios';
import { toast } from 'react-toastify';

const IndustriesTable = () => {
  const [localFilters, setLocalFilters] = useState({});
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector((store) => store.industries.list.loading);
  const rows = useTypedSelector((store) => store.industries.list.rows);
  const count = useTypedSelector((store) => store.industries.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.industries.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.industries.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/industries/${cell}/edit`)}
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
        accessorKey: 'name',
        header: 'Name',
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

  const handleExportIndustriesTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/branchtype', {
        params: filter,
      });
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
    <div>
      <Widget className='widget-p-md' title={<h4>Industries</h4>}>
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
              <Link to='/admin/industries/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name='Industries'
            handleExport={handleExportIndustriesTable}
          />
        </Stack>

        {/* Table */}
        <DynamicTable
          columns={columns}
          rows={rows}
          count={count}
          loading={loading}
          fetchData={(filterObj: any) => {
            setLocalFilters(filterObj);
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

export default IndustriesTable;
