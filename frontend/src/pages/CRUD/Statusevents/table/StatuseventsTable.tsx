import actions from 'store/actions/statusevents/statuseventsListActions';
import React, { useMemo, useState } from 'react';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import { Typography } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import moment from 'moment';

const StatuseventsTable = () => {
  const [localFilters, setLocalFilters] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector((store) => store.statusevents.list.loading);
  const rows = useTypedSelector((store) => store.statusevents.list.rows);
  const count = useTypedSelector((store) => store.statusevents.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.statusevents.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.statusevents.list.idToDelete,
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/statusevents/${cell}/edit`)}
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
        accessorFn: (row: any) => row.event,
        id: 'event',
        header: 'Event',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const event = row.row.original.event;
          if (event) {
            return (
              <>
                <div>{event.endRecur}</div>
                <div>{event.startRecur}</div>
              </>
            );
          }
        },
      },
      {
        accessorFn: (row: any) =>
          moment(row.startdatetime).format('MM-DD-YYYY'),
        id: 'startdatetime',
        header: 'Start Datetime',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row: any) => row.user,
        id: 'user',
        header: 'User',
        enableSorting: false,
        Cell: (row: any) => {
          if (row.row.original?.user) {
            return (
              <>
                {row.row.original.user?.firstName}{' '}
                {row.row.original.user?.lastName}
              </>
            );
          }
          return;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 180,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'note',
        header: 'Note',
        size: 180,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'noteadmin',
        header: 'Noteadmin',
        size: 180,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row: any) => row.late,
        id: 'late',
        header: 'Late',
        Cell: (row: any) => {
          const data = row.row.original.late;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => moment(row.latetime).format('MM-DD-YYYY'),
        id: 'latetime',
        header: 'Latetime',
        enableSorting: false,
        enableColumnFilter: false,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExportStatuseventsTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/statusevents', {
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
      <Widget className='widget-p-md' title={<h4>Statusevents</h4>}>
        {/* Header Buttons */}
        {/* <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createBranch') && (
              <Link to='/admin/statusevents/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name='Status events'
            handleExport={handleExportStatuseventsTable}
          />
        </Stack> */}

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

export default StatuseventsTable;
