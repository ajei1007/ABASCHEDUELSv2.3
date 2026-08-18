/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  deleteRequest,
  getAvailabilityRequests,
} from 'store/actions/requestsActions';
import UndynamicTable from '../UndynamicTable';
import moment from 'moment';
import { Stack, Typography } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import Loader from 'components/Loader/Loader';

const AvailabilityRequestsTable = ({
  handleClickEdit,
}: {
  handleClickEdit: (data: any) => any;
}) => {
  const dispatch = useAppDispatch();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const availabilityRequestData = useAppSelector(
    (state) => state.requests.availabilityRequests ?? [],
  );
  const isDeleting = useAppSelector((state) => state.requests.isDeleting);
  const availabilityLoading = useAppSelector(
    (state) => state.requests.availabilityLoading,
  );

  useEffect(() => {
    dispatch(getAvailabilityRequests());
  }, []);

  const actionFormatter = (cell: any) => {
    return (
      <ActionFormatter
        deleteEvent={(event) => openModal(event, cell)}
        editEvent={() => handleClickEdit(cell)}
      />
    );
  };

  const availabilityTimeoffTableColumns = useMemo(
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
        accessorFn: (row) => row,
        id: 'location2',
        header: 'Location',
        enableSorting: false,
        Cell: (row) => {
          const location = row.row.original.location2;
          if (location) {
            return (
              <Stack direction='row' spacing='5px'>
                {location.map((l: any) => (
                  <Typography>{l.firstName}</Typography>
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
    await dispatch(getAvailabilityRequests());
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
      {availabilityLoading ? (
        <Loader />
      ) : (
        <UndynamicTable
          columns={availabilityTimeoffTableColumns}
          rows={availabilityRequestData as any}
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

export default AvailabilityRequestsTable;
