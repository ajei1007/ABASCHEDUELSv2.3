import actions from 'store/actions/eventpair/eventpairListActions';
import React, { useMemo, useState } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import { Stack } from '@mui/material';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import { toast } from 'react-toastify';
import axios from 'axios';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';

const EventpairTable = () => {
  const [localFilters, setLocalFilters] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = useTypedSelector((store:any) => store.auth.currentUser);
  const loading = useTypedSelector((store:any) => store.eventpair.list.loading);
  const rows = useTypedSelector((store:any) => store.eventpair.list.rows);
  const count = useTypedSelector((store:any) => store.eventpair.list.count);
  const modalOpen = useTypedSelector((store:any) => store.eventpair.list.modalOpen);
  const idToDelete = useTypedSelector(
    (store:any) => store.eventpair.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/eventpair/${cell}/edit`)}
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  // const columns: Array<any> = [

  //   { dataField: "roles1",
  //     sort: true,

  //     formatter: rolesDataFormat.listFormatter,

  //     text: "Roles 1"
  //   },

  //   { dataField: "activity1",
  //     sort: true,

  //     formatter: usersDataFormat.listFormatter,

  //     text: "Activity 1"
  //   },

  //   { dataField: "activity2",
  //     sort: true,

  //     formatter: usersDataFormat.listFormatter,

  //     text: "Activity 2"
  //   },

  //   { dataField: "roles2",
  //     sort: true,

  //     formatter: rolesDataFormat.listFormatter,

  //     text: "Roles 2"
  //   },

  //   {
  //     dataField: 'id',
  //     text: 'Actions',
  //     formatter: actionFormatter
  //   }
  // ];

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '',
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
        size: 80,
      },
      // {
      //   accessorKey: 'roles1',
      //   header: 'Roles 1',
      // },
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

  const handleExportEventpairTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/eventpair', {
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
    <div>
      <Widget className='widget-p-md' title={<h4>Eventpair</h4>}>
        {/* Header Buttons */}
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {/* {role_permissions(currentUser, 'createBranch') && (
              <Link to='/admin/eventpair/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )} */}
          </Stack>
          <ExportTableButton
            name='Eventpair'
            handleExport={handleExportEventpairTable}
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

export default EventpairTable;
