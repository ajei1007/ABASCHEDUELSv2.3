/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import actions from 'store/actions/availabilities/availabilitiesListActions';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import { Link } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import CustomButton from 'components/Button';
import moment from 'moment';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getTimezoneObjectFromValue } from 'utils/timezones';
import Loader from 'components/Loader/Loader';

const availableFieldOptions = [
  {
    label: 'Both',
    value: '',
  },
  {
    label: 'Yes',
    value: 'true',
  },
  {
    label: 'No',
    value: 'false',
  }
]



const AvailabilitiesTable = ({ resourceType }: { resourceType: any }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useTypedSelector(
    (store) => store.availabilities.list.loading,
  );
  const rows = useTypedSelector((store) => store.availabilities.list.rows);
  const count = useTypedSelector((store) => store.availabilities.list.count);
  const modalOpen = useTypedSelector(
    (store) => store.availabilities.list.modalOpen,
  );
  const idToDelete = useTypedSelector(
    (store) => store.availabilities.list.idToDelete,
  );
  // 
  const [ selectedAvailableOption, setSelectedAvailableOption ] = useState(
    availableFieldOptions[0]
  )
  const [branchesOptions, setBranchesOptions] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [selectedBranchesOption, setSelectedBranchesOption] = useState<any>(null);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`/scheduler/branches`);

      const branches = res.data;
      setBranchesOptions(branches);

      let defaultSelectedBranch = null;
      for (const structure of branches) {
        if (structure?.options?.[0]) {
          defaultSelectedBranch = structure?.options?.[0];
          break;
        }
      }
      if (defaultSelectedBranch) {
        setSelectedBranchesOption(defaultSelectedBranch);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLocalLoading(false);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editAvailability'
        deletePermissionType='deleteAvailability'
        editEvent={() =>
          navigate(
            `/admin/availabilities/resources/${resourceType}/${cell}/edit`,
          )
        }
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const newColumns = useMemo(
    () => {
      const showLocationCol = resourceType !== 'Activity' ? true : false;
      const cols = [
        {
          accessorKey: 'id',
          header: '',
          Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
            return actionFormatter(renderedCellValue);
          },
          size: 120,
          enableSorting: false,
          enableColumnFilter: false,
        },
        {
          accessorFn: (row: any) => row.user?.name,
          id: 'userName',
          header: 'User',
          enableSorting: false,
          enableColumnFilter: true,
          Cell: (row: any) => {
            const user = row.row.original?.user;
            if (user) {
              return (
                <Link to={`/admin/branchtype/${user.id}/edit`}>
                  {user?.firstName}{' '}
                  {user?.lastName}
                </Link>
              );
            }
            return;
          },
        },
        {
          accessorFn: (row: any) => row.startTime,
          filterVariant: 'date-range',
          Cell: (row: any) => {
            const timezone = getTimezoneObjectFromValue(row.row?.original?.timezone);
            return moment(row.row?.original?.startTime).tz(timezone?.value).format('hh:mm a')
          },
          id: 'startTime',
          header: 'Start Time',
          enableSorting: false,
          enableColumnFilter: false,
          size: 120,
        },
        {
          accessorFn: (row: any) => row.endTime,
          Cell: (row: any) => {
            const timezone = getTimezoneObjectFromValue(row.row?.original?.timezone);
            return moment(row.row?.original?.endTime).tz(timezone?.value).format('hh:mm a')
          },
          id: 'endTime',
          header: 'End Time',
          enableSorting: false,
          enableColumnFilter: false,
          size: 120,
        },
        {
          accessorFn: (row: any) => row.days,
          id: 'days',
          header: 'Days',
          enableSorting: false,
          enableColumnFilter: false,
          Cell: (row: any) => {
            const days = row.row.original?.days;
            if (days && days?.length > 0) {
              return (
                <Stack direction='row' spacing='5px'>
                  {days.map((day: any) => (
                    <Typography key={day.id}>{day.name.slice(0, 2)}</Typography>
                  ))}
                </Stack>
              );
            }
            return;
          },
          size: 200,
        },
        {
          accessorFn: (row: any) => row.timezone,
          id: 'timezone',
          header: 'Timezone',
          Cell: (row: any) => {
            return row.row?.original?.timezone;
          },
          size: 150,
          enableSorting: false,
          enableColumnFilter: false,
        },
        {
          accessorFn: (row: any) => row.available,
          id: 'available',
          header: 'Available',
          filterVariant: 'select',
          filterSelectOptions: availableFieldOptions,
          Cell: ({ cell }: any) => {
          return cell.getValue() === true ? 'Yes' : 'No'
          },
          size: 160,
        },
        {
          accessorFn: (row: any) => moment(row.startRange).format('MM-DD-YYYY'),
          id: 'startRange',
          header: 'Start Range',
          enableSorting: false,
          enableColumnFilter: false,
        },
        {
          accessorFn: (row: any) => moment(row.endRange).format('MM-DD-YYYY'),
          id: 'endRange',
          header: 'End Range',
          enableSorting: false,
          enableColumnFilter: false,
        },
        {
          accessorKey: 'status',
          header: 'Status',
          enableColumnFilter: false,
        },
        {
          accessorFn: (row: any) => row.oncall?.name,
          id: 'oncall',
          header: 'Oncall',
          Cell: (row: any) => {
            const data = row.row.original.oncall;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
          size: 120,
          enableColumnFilter: false,
        },
        {
          accessorFn: (row: any) => row.disabled?.name,
          id: 'disabled',
          header: 'inactive',
          Cell: (row: any) => {
            const data = row.row.original.disabled;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
          size: 120,
          enableColumnFilter: false,
        },
      ]
      if (showLocationCol) {
        cols.splice(cols.length - 3, 0, {
          accessorFn: (row: any) => row.location2,
          id: 'location2',
          header: 'Location',
          enableSorting: true,
          enableColumnFilter: false,
          Cell: (row: any) => {
            if (
              row.row.original.location2 &&
              row.row.original.location2.length > 0
            ) {
              const data = row.row.original.location2;
              return (
                <>
                  {data.map((d: any) => (
                    <Typography key={d.id}>{d.firstName}</Typography>
                  ))}
                </>
              );
            }
            return;
          },
          size: 150,
        });
      }
      return cols
    },
    [resourceType],
  );

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete(id!, resourceType));
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const handleExportAvailabilityTable = async () => {
    try {
      const response = await axios.get(
        `/availabilities/resources/${resourceType}`,
      );
      const formattedData = response.data.rows.map((row: any) => ({
        User: row.user?.firstName + ' ' + row.user?.lastName,
        'Start Time': moment(row.startTime).format('hh:mm a'),
        'End Time': moment(row.endTime).format('hh:mm a'),
        Days: row.days?.map((day: any) => day.name.slice(0, 2)).join(', '),
        Available: row?.available ? 'Yes' : 'No',
        'Start Range': moment(row.startRange).format('MM-DD-YYYY'),
        'End Range': moment(row.endRange).format('MM-DD-YYYY'),
        Location: row.location2
          ?.map((location: any) => location.firstName)
          .join(', '),
        Disabled: row.disabled ? 'Yes' : 'No',
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  const selectFields = [
    {
      name: 'available',
      label: 'Available',
      value: selectedAvailableOption,
      onChange: (val: any) => setSelectedAvailableOption(val),
      options: availableFieldOptions,
    },
    // {
    //   name: 'oncall',
    //   label: 'Oncall',
    //   value: selectedOncallOption,
    //   onChange: (val: any) => setSelectedOncallOption(val),
    //   options: oncallFieldOptions,
    // },
    {
      name: 'branches',
      label: 'Branches',
      value: selectedBranchesOption,
      onChange: (val: any) => setSelectedBranchesOption(val),
      options: branchesOptions,
    },
  ]
  return (
    <>
      <Widget className='widget-p-md' title={<h4>Availabilities</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            <Link to={`/admin/availabilities/resources/${resourceType}/new`}>
              <CustomButton type='button'>New</CustomButton>
            </Link>

          </Stack>

          <ExportTableButton
            name={`${resourceType} Availabilities`}
            handleExport={handleExportAvailabilityTable}
          />
        </Stack>
        {/* Table */}
        {localLoading ? (
          <Loader />
        ) :
          <DynamicTable
            key={resourceType}
            columns={newColumns}
            rows={rows}
            count={count}
            loading={loading}
            type={resourceType}
            fetchData={(filterObj: any) =>
              dispatch(actions.doFetch(filterObj, resourceType))
            }
          />
        }
      </Widget>

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </>
  );
};

export default AvailabilitiesTable;
