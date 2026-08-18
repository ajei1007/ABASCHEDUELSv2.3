// eslint-disable-next-line
import actions from 'store/actions/branchtype/branchtypeListActions';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';

import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Stack } from '@mui/material';
import CustomButton from 'components/Button';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import role_permissions from 'helpers/role_permissions';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import axios from 'axios';
import { toast } from 'react-toastify';

const BranchtypeTable = () => {
  const [localFilters, setLocalFilters] = useState({});
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const rows = useTypedSelector((store) => store.branchtype.list.rows);
  const count = useTypedSelector((store) => store.branchtype.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.branchtype.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.branchtype.list.idToDelete,
  );
  const loading = useTypedSelector((store) => store.branchtype.list.loading);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/branchtype/${cell}/edit`) }
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
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorFn: (row: any) => row.parent?.name,
        id: 'parent',
        header: 'Parent',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          if (row.row.original?.parent) {
            return (
              <Link to={`/admin/branches/${row.row.original?.parent.id}/edit`}>
                {row.row.original?.parent.name}
              </Link>
            );
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.parent?.bol,
        id: 'bol',
        header: 'Bol',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row:any) => {
          if(row.row.original?.bol){
            return (
              row.row.original?.bol ? 'Yes' : 'No'
            )
          }
        }
      },
      {
        accessorFn: (row: any) => row.parent?.physical,
        id: 'physical',
        header: 'Physical',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row:any) => {
          if(row.row.original?.physical){
            return (
              row.row.original?.physical ? 'Yes' : 'No'
            )
          }
        }
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

  const handleExportBranchTypeTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/branchtype', {
        params: filter,
      });
      const formattedData = response.data.rows.map((row: any) => ({
        Name: row.name,
        Parent: row.parent?.name,
        Bol: row.bol ? 'Yes' : 'No',
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
      <Widget className='widget-p-md' title={<h4>Branchtype</h4>}>
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
              <Link to='/admin/branchtype/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name='Branches'
            handleExport={handleExportBranchTypeTable}
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
    </>
  );
};

export default BranchtypeTable;
