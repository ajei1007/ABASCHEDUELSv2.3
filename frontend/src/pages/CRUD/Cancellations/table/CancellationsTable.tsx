/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import actions from 'store/actions/cancellations/cancellationsListActions';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Stack } from '@mui/material';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import { toast } from 'react-toastify';
import axios from 'axios';
import moment from 'moment';
import Loader from 'components/Loader/Loader';
import moment2 from 'moment-timezone';
import getDurationInHoursDecimal from 'utils/getDurationInHoursDecimal';

const cancelledByUserRoleOptions = [
  {
    value: '',
    label: 'None',
  },
  {
    value: 'Client',
    label: 'Client',
  },
  {
    value: 'Employee',
    label: 'Employee',
  },
];

const CancellationsTable = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const rows = useTypedSelector((store) => store.cancellations.list.rows);
  const count = useTypedSelector((store) => store.cancellations.list.count);
  const loading = useTypedSelector((store) => store.cancellations.list.loading);
  const modalOpen = useTypedSelector(
    (store) => store.cancellations.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.cancellations.list.idToDelete,
  );
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  const [activityOptions, setActivityOptions] = useState([
    {
      id: 1,
      value: '',
      label: 'None',
    },
  ]);

  const fetchActivity = async () => {
    const res = await axios.get('/users/autocomplete/Activity');
    const activity = res.data;
    const mappedActivity = activity.map((activity: any) => ({
      label: activity.label,
      value: activity.id,
    }));
    setActivityOptions([{ id: 1, value: '', label: 'None' }, ...mappedActivity]);
  };

  /* Table Roles Logic */
  const [selectedRolesOption, setSelectedRolesOption] = useState<any>(null);

  const [rolesOptions, setRolesOptions] = useState([
    {
      id: 1,
      value: '',
      label: 'None',
    },
    {
      id: 2,
      value: 'All',
      label: 'All',
    },
  ]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/roles/autocomplete');
      const roles = res.data;
      const mappedRoles = roles.map((roles: any) => ({
        ...roles,
        value: roles.label,
      }));
      setRolesOptions((prev) => [...prev, ...mappedRoles]);
      setSelectedRolesOption(rolesOptions[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setLocalLoading(false);
    }
  };

  /* Table Cancellation Reason Logic */
  const [cancellationReasonOptions, setCancellationReasonOptions] = useState([
    {
      id: 1,
      value: '',
      label: 'None',
    },
  ]);
  const fetchCancellationReason = async () => {
    const res = await axios.get('/scheduler/reasons_canceled');
    const cancellationReason = res.data;
    const mappedCancellationReason = cancellationReason.map((reason: any) => ({
      label: reason.label,
      value: reason.value,
    }));
    setCancellationReasonOptions([
      { id: 1, value: '', label: 'None' },
      ...mappedCancellationReason,
    ]);
  };

  /* Table Branches Logics */
  const [branchesOptions, setBranchesOptions] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [selectedBranchesOption, setSelectedBranchesOption] =
    useState<any>(null);
  const [localFilters, setLocalFilters] = useState({});

  const getUsersDefaultBranchFromSettings = async () => {
    const response = await axios.get(`/settings`);
    const data = response.data.rows[0];

    const branchDefaultId = data.branchDefaultId;
    const usersBranchId = branchDefaultId
      ? branchDefaultId
      : currentUser.branches?.[0]?.id;

    return usersBranchId;
  };
  const fetchBranches = async (currentBranchId: any) => {
    const res = await axios.get(`/scheduler/branches`);

    const branches = res.data;
    setBranchesOptions(branches);

    // Find branch
    const findUsersBranch = currentBranchId
      ? Object.values(branches)
          .flatMap((t: any) => t.options)
          .find((t: any) => t.value === currentBranchId)
      : null;
    let defaultSelectedBranch = null;
    for (const structure of branches) {
      if (structure?.options?.[0]) {
        defaultSelectedBranch = structure?.options?.[0];
        break;
      }
    }
    const selectedBranch = findUsersBranch
      ? findUsersBranch
      : defaultSelectedBranch;

    setSelectedBranchesOption(selectedBranch);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLocalLoading(true);
        const currentBranchId = await getUsersDefaultBranchFromSettings();
        await Promise.all([
          fetchBranches(currentBranchId),
          fetchActivity(),
          fetchRoles(),
          fetchCancellationReason(),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLocalLoading(false);
      }
    };
    init();
  }, []);
  /*  */

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editRocreateCancelationle'
        deletePermissionType='deleteCancelation'
        editEvent={() => navigate(`/admin/cancellations/${cell}/edit`)}
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
        enableColumnFilter: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'activity',
        header: 'Activity',
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: activityOptions,
        Cell: (row: any) => {
          return row.row.original?.event.activity0.firstName;
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'location',
        header: 'Location',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          return row.row.original?.event?.location0?.firstName;
        },
      },
      {
        accessorFn: (row: any) => row.original?.event?.users,
        id: 'users',
        header: 'Participants',
        Cell: (row: any) => {
          const user = row.row.original?.event?.users.map(
            (u: string | any, index: number | any) => (
              <p key={index}>{u.firstName + ' ' + 
                (u.lastName ? u.lastName : '')}</p>
            ),
          );
          return user;
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'reason',
        header: 'Reason',
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: cancellationReasonOptions,
        Cell: (row: any) => {
          return row.row.original?.reason.name;
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'cancelledByUser',
        header: 'User Cancelled',
        Cell: (row: any) => {
          return (
            row.row.original?.user.firstName +
            ' ' +
            row.row.original?.user.lastName
          );
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'cancelledByUserRole',
        header: 'Canceled By',
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: cancelledByUserRoleOptions,
        Cell: (row: any) => {
          return row.row.original?.user.mainRole;
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'description',
        header: 'Description',
        enableColumnFilter: false,
        Cell: (row: any) => {
          const description = row.row.original?.event?.description;
          return description.charAt(0).toUpperCase() + description.slice(1);
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => row,
        id: 'date',
        header: 'Date',
        enableColumnFilter: false,
        Cell: (row: any) => {
          return (
            <p>
              {row.row.original?.date
                ? moment(row.row.original.date).format('MM/DD/YYYY')
                : ''}
            </p>
          );
        },
        enableSorting: false,
      },
      {
        accessorFn: (row: any) => moment(row.start).format('hh:mm a'),
        id: 'start',
        header: 'Start Time',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          const startTime = row.row.original?.event?.start;
          const timezone = row.row.original?.event?.timezone;
          let startTZ = moment(startTime).format('hh:mm a');
          if (timezone) {
            startTZ = moment2.tz(startTime, timezone).format('hh:mm a');
          }

          if (startTime) {
            return startTZ;
          }
          return;
        },
        size: 120,
      },
      {
        accessorFn: (row: any) => moment(row.end).format('hh:mm a'),
        id: 'end',
        header: 'End Time',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          const endTime = row.row.original?.event?.end;
          const timezone = row.row.original?.event?.timezone;
          let endTZ = moment(endTime).format('hh:mm a');
          if (timezone) {
            endTZ = moment2.tz(endTime, timezone).format('hh:mm a');
          }

          if (endTime) {
            return endTZ;
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.timezone,
        id: 'timezone',
        header: 'Timezone',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          return row.row?.original?.event?.timezone;
        },
      },
      {
        id: 'duration',
        header: 'Duration',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          const start = row.row.original?.event?.start;
          const end = row.row.original?.event?.end;
          if (start && end) {
            return getDurationInHoursDecimal(start, end);
          }
          return;
        },
        size: 110,
      },
    ],
    [activityOptions, cancellationReasonOptions],
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

  const handleExportCancellationsTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get('/cancellations', {
        params: filter,
      });
      const data = Array.isArray(response.data?.rows) ? response.data.rows : [];
      const formattedData =
        data.length > 0
          ? data.map((row: any) => {
              const start = row.event?.start;
              const end = row?.event?.end;
              const participants = row?.event?.users
                .map((u: any) => u?.firstName + ' ' + u?.lastName)
                .join(', ');
              let duration = 0;
              if (start && end) {
                duration = getDurationInHoursDecimal(start, end);
              }
              return {
                Event: row.event?.activity0.firstName,
                Participants: participants,
                Date: row.date ? moment(row.date).format('MM/DD/YYYY') : '',
                Duration: duration,
                Reason: row.reason.name,
                'User Cancelled': row.user.firstName + ' ' + row.user.lastName,
                Rescheduled: row.rescheduled ? 'Yes' : 'No',
                'Partial Rescheduled': row.partialRescheduled ? 'Yes' : 'No',
              };
            })
          : [
              {
                Event: '',
                Participants: '',
                Date: '',
                Duration: '',
                Reason: '',
                'User Cancelled': '',
                Rescheduled: '',
                'Partial Rescheduled': '',
              },
            ];
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return;
    }
  };

  const selectFields = useMemo(() => {
    return [
      {
        name: 'branches',
        label: 'Branches',
        value: selectedBranchesOption,
        onChange: (val: any) => {
          setSelectedBranchesOption(val);
        },
        options: branchesOptions,
      },
      {
        name: 'role',
        label: 'Role',
        value: selectedRolesOption,
        onChange: (val: any) => setSelectedRolesOption(val),
        options: rolesOptions,
      },
    ];
  }, [
    branchesOptions,
    rolesOptions,
    selectedBranchesOption,
    selectedRolesOption,
  ]);

  const fetchData = useCallback(
    (filterObj: any) => {
      filterObj = {
        ...filterObj,
        start: moment(filterObj.start).format('YYYY-MM-DD'),
        end: moment(filterObj.end).add(1, 'days').format('YYYY-MM-DD'),
      };
      setLocalFilters(filterObj);
      dispatch(actions.doFetch(filterObj));
    },
    [dispatch],
  );

  return (
    <>
      <Widget className='widget-p-md' title={<h4>Cancellations</h4>}>
        {/* Header Buttons */}
        <Stack direction='row' justifyContent='flex-end'>
          <ExportTableButton
            name='Cancellations'
            handleExport={handleExportCancellationsTable}
          />
        </Stack>
        {/* Table */}
        {localLoading ? (
          <Loader />
        ) : (
          <DynamicTable
            columns={columns}
            rows={rows}
            count={count}
            loading={loading}
            fetchData={fetchData}
            enabledDateRange
            selectFields={selectFields as any}
          />
        )}
      </Widget>
      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </>
  );
};

export default CancellationsTable;
