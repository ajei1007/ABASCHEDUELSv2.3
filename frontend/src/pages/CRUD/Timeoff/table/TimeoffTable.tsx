/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/timeoff/timeoffListActions';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import { Stack, Typography } from '@mui/material';
import role_permissions from 'helpers/role_permissions';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';

const TimeoffTable = () => {
  const [localFilters, setLocalFilters] = useState({});
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector((store) => store.timeoff.list.loading);
  const rows = useTypedSelector((store) => store.timeoff.list.rows);
  const count = useTypedSelector((store) => store.timeoff.list.count);
  const modalOpen = useTypedSelector((store) => store.timeoff.list.modalOpen);
  const idToDelete = useTypedSelector((store) => store.timeoff.list.idToDelete);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editBranch'
        deletePermissionType='deleteBranch'
        editEvent={() => navigate(`/admin/timeoff/${cell}/edit`)}
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
        id: 'user',
        header: 'User',
        enableColumnFilter: true,
        Cell: (row: any) => {
          const user = row.row.original?.user;
          if (user) {
            return (
              <Link to={`/admin/branchtype/${user.id}/edit`}>
                {user?.firstName} {user?.lastName}
              </Link>
            );
          }
          return;
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        size: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        enableColumnFilter: false,
      },
      {
        id: 'approved',
        header: 'Approved',
        Cell: (row: any) => {
          const approved = row.row.original.approved;
          return <Typography>{approved ? 'Yes' : 'No'}</Typography>;
        },
        size: 120,
        enableColumnFilter: false,
      },
      {
        id: 'duration',
        header: 'Duration',
        Cell: (row) => {
          const duration = row.row.original?.duration;
          const totalMinutes = duration / 60000;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = Math.round(totalMinutes % 60);

          return `${hours}h ${minutes}min`;
        },
        size: 100,
        enableColumnFilter: false,
      },
      {
        Cell: (row: any) => {
          const datetimestart = row.row.original.datetimestart;
          if (datetimestart) {
            const datetimestartFormatted =
              moment(datetimestart).format('MM-DD-YYYY');
            return datetimestartFormatted;
          }
          return '';
        },
        id: 'datetimestart',
        header: 'Datetime Start',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        Cell: (row: any) => {
          const datetimeend = row.row.original.datetimeend;
          if (datetimeend) {
            const datetimeendFormatted =
              moment(datetimeend).format('MM-DD-YYYY');
            return datetimeendFormatted;
          }
          return '';
        },
        id: 'datetimestart',
        header: 'Datetime Start',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: 'reason',
        header: 'Reason',
        Cell: (row: any) => {
          const reasontype = row.row.original.reasontype;
          if (reasontype) {
            return reasontype?.name;
          }
        },
        size: 120,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'paid',
        header: 'Paid',
        size: 80,
        enableColumnFilter: false,
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

  const handleExportTimeoffTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/timeoff', {
        params: filter,
      });
      const formattedData = response.data.rows.map((row: any) => ({
        User: row.user?.firstName + ' ' + row.user?.lastName,
        Reason: row.reason,
        Notes: row.notes,
        Approved: row?.approved ? 'Yes' : 'No',
        Duration: row.duration,
        'Datetime start': row.datetimestart,
        'Reason type': row.reasontype,
        Paid: row.paid,
        'Datetime end': row.datetimeend,
        Status: row.status,
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  console.log('rows', rows);
  return (
    <div>
      <Widget className='widget-p-md' title={<h4>Timeoff</h4>}>
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
              <Link to='/admin/timeoff/new'>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name='Timeoff'
            handleExport={handleExportTimeoffTable}
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

export default TimeoffTable;
