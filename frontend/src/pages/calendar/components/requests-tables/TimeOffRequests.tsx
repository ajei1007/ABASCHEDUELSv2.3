/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  deleteRequest,
  getTimeOffRequests,
} from 'store/actions/requestsActions';
import UndynamicTable from '../UndynamicTable';
import moment from 'moment';
import { Stack, Typography } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import Loader from 'components/Loader/Loader';

const TimeOffRequestsTable = ({
  handleClickEdit,
}: {
  handleClickEdit: (data: any) => any;
}) => {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const dispatch = useAppDispatch();
  const timeoffRequests = useAppSelector(
    (state) => state.requests.timeoffRequests ?? [],
  );
  const isDeleting = useAppSelector((state) => state.requests.isDeleting);
  const timeoffLoading = useAppSelector(
    (state) => state.requests.timeoffLoading,
  );
  useEffect(() => {
    dispatch(getTimeOffRequests());
  }, []);

  const actionFormatter = (cell: any) => {
    return (
      <ActionFormatter
        deleteEvent={(event) => openModal(event, cell)}
        editEvent={() => handleClickEdit(cell)}
      />
    );
  };
  const requestsTimeoffTableColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '',
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
        size: 80,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: (row: any): React.ReactNode => {
          const statusType = row?.row.original?.statusType;
          const status = row?.row.original?.status;
          return (
            <Typography color='#ff4b23'>
              {statusType} {status}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'user',
        header: 'User',
        Cell: (row: any): React.ReactNode => {
          const grouping = row?.row.original?.user;
          return `${grouping?.firstName} ${grouping?.lastName ?? ''}`;
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
      },
      {
        id: 'dates',
        header: 'Dates',
        Cell: (row: any) => {
          const startRange = row.row.original?.startRange;
          const endRange = row.row.original?.endRange;
          const startDate = moment(startRange).format('MM-DD-YYYY');
          const endDate = moment(endRange).format('MM-DD-YYYY');
          return (
            <Typography fontSize='0.875rem' fontWeight='600'>
              {startDate} <br /> {endDate}
            </Typography>
          );
        },
        size: 120,
      },
      {
        accessorFn: (row: any) => moment(row.start).format('hh:mm a'),
        id: 'start',
        header: 'Start Time',
        enableSorting: false,
        Cell: (row: any) => {
          const startTime = row.row.original?.startTime;
          if (startTime) {
            return moment(startTime).format('hh:mm a');
          }
          return;
        },
        size: 120,
      },
      {
        accessorFn: (row: any) => moment(row.end).format('hh:mm a'),
        id: 'end',
        header: 'End Time',
        enableSorting: false,
        Cell: (row: any) => {
          const endTime = row.row.original?.endTime;
          if (endTime) {
            return moment(endTime).format('hh:mm a');
          }
          return;
        },
      },
      {
        accessorFn: (row) => row,
        id: 'days',
        header: 'Days',
        enableSorting: false,
        Cell: (row) => {
          const days = row.row.original.days;
          if (days) {
            return (
              <Stack direction='row' spacing='5px'>
                {days.map((day: any) => (
                  <Typography>{day.name.substr(0, 2)}</Typography>
                ))}
              </Stack>
            );
          }
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
      },
    ],
    [],
  );

  const handleDelete = async () => {
    await dispatch(deleteRequest(selectedEvent));
    closeModal();
    await dispatch(getTimeOffRequests());
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    setOpenEditModal((prev) => !prev);
    setSelectedEvent(id);
  };
  const closeModal = () => {
    setOpenEditModal((prev) => !prev);
  };

  return (
    <>
      {timeoffLoading ? (
        <Loader />
      ) : (
        <UndynamicTable
          columns={requestsTimeoffTableColumns}
          rows={timeoffRequests as any}
        />
      )}
      <TableDeleteModal
        isOpen={openEditModal}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default TimeOffRequestsTable;
