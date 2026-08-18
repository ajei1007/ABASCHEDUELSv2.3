/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/users/usersListActions';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
// @ts-ignore
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { user_arrays } from 'constants/user_arrays';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import { switchUser } from 'store/actions/authActions';
import role_permissions from 'helpers/role_permissions';
import isSameOrBefore from 'utils/isSameOrBefore';
import ExportSheetButton from 'components/ExportSheetButton/ExportSheetButton';
import ImportSheetsButton from 'components/ImportSheetsButton/ImportSheetsButton';
import SheetErrorModal from 'components/SheetErrorModal/SheetErrorModal';
import findDuplicates from 'utils/findDuplicates';
import passwordGenerator from 'utils/passwordGenerator';
import { useGeolocation } from 'hooks/useGeolocation';
import { Chip, Stack, Typography } from '@mui/material';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { isValidDateTime, validateEmail } from 'utils/validations';
import type { UsersAddress } from 'types/redux/users/usersList';
import { convertToSpecificTimezone, getTimeZones } from 'utils/timezones';
import type { TimezoneType } from 'constants/timezonesArr';
import CustomButton from 'components/Button';
import ImportFilePasswordConfirmModal from 'pages/CRUD/components/Modals/ImportFilePasswordConfirmModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import { colourHexToName } from 'utils/colorNameToHex';
import Loader from 'components/Loader/Loader';
import TableConfirmModal from 'components/TableConfirmModal/TableConfirmModal';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import daysOfWeek from 'constants/daysOfWeek';

const activitiesSheetValidationSchema = {
  columns: [
    {
      name: 'name',
      required: true,
    },
    {
      name: 'color',
      required: true,
    },
    {
      name: 'branches',
      required: true,
    },
  ],
};
const blocksSheetValidationSchema = {
  columns: [
    {
      name: 'name',
      required: true,
    },
    {
      name: 'branches',
      required: true,
    },
  ],
};
const clientsSheetValidationSchema = {
  columns: [
    {
      name: 'firstName',
      required: true,
    },
    {
      name: 'lastName',
      required: true,
    },
    {
      name: 'email',
      required: true,
    },
    {
      name: 'roles',
      required: true,
    },
    {
      name: 'branches',
      required: true,
    },
  ],
};
const employeesSheetValidationSchema = {
  columns: [
    {
      name: 'firstName',
      required: true,
    },
    {
      name: 'lastName',
      required: true,
    },
    {
      name: 'email',
      required: true,
    },
    {
      name: 'roles',
      required: true,
    },
    {
      name: 'branches',
      required: true,
    },
  ],
};
const fundersSheetValidationSchema = {
  columns: [
    {
      name: 'name',
      required: true,
    },
    {
      name: 'branches',
      required: true,
    },
  ],
};
const locationsSheetValidationSchema = {
  columns: [
    {
      name: 'name',
      required: true,
    },
    {
      name: 'color',
      required: true,
    },
    {
      name: 'email',
      required: true,
    },
    {
      name: 'branches',
      required: true,
    },
    {
      name: 'roles',
      required: true,
    },
  ],
};

const formatUsersSheetsValidationSchema = (resource: string) => {
  const usersSheetsValidationSchema: any = {
    tables: {
      availabilities: {
        columns: [
          {
            name: 'user',
            required: true,
          },
          {
            name: 'startTime',
            required: true,
          },
          {
            name: 'endTime',
            required: true,
          },
          {
            name: 'days',
            required: true,
          },
          {
            name: 'startRange',
            required: true,
          },
          {
            name: 'endRange',
            required: true,
          },
          {
            name: 'timezone',
            required: true,
          },
        ],
        isRequiredTable: false,
      },
      priorities: {
        columns: [
          {
            name: 'user1',
            required: true,
          },
          {
            name: 'user2',
            required: true,
          },
          {
            name: 'rank',
            required: true,
          },
        ],
        isRequiredTable: false,
      },
      timeconstraints: {
        columns: [
          {
            name: 'user1',
            required: true,
          },
          {
            name: 'activity',
            //required: true,
          },
          {
            name: 'min',
            required: true,
          },
          {
            name: 'max',
            required: true,
          },
          {
            name: 'unit',
            required: true,
          },
          {
            name: 'frequency',
            required: true,
          },
          {
            name: 'start',
            required: true,
          },
          {
            name: 'end',
            required: true,
          },
          {
            name: 'offset',
            required: false,
          },
        ],
        isRequiredTable: false,
      },
    },
  };

  if (resource === 'Activity')
    usersSheetsValidationSchema.tables.activities =
      activitiesSheetValidationSchema;
  if (resource === 'Block')
    usersSheetsValidationSchema.tables.blocks = blocksSheetValidationSchema;
  if (resource === 'Client')
    usersSheetsValidationSchema.tables.clients = clientsSheetValidationSchema;
  if (resource === 'Employee')
    usersSheetsValidationSchema.tables.employees =
      employeesSheetValidationSchema;
  if (resource === 'Funder')
    usersSheetsValidationSchema.tables.funders = fundersSheetValidationSchema;
  if (resource === 'Location')
    usersSheetsValidationSchema.tables.locations =
      locationsSheetValidationSchema;

  return usersSheetsValidationSchema;
};

const activitiesSheetsExportSchema: any = {
  name: 'activities',
  initialValues: [
    {
      name: 'Test Activity 1',
      color: 'black',
      branches: 'Branch 1, Branch 2',
      billable: false,
      paid: false,
    },
    {
      name: 'Test Activity 2',
      color: 'black',
      branches: 'Branch 1, Branch 2',
      billable: false,
      paid: false,
    },
    {
      name: 'Test Activity 3',
      color: 'black',
      branches: 'Branch 1, Branch 2',
      billable: false,
      paid: false,
    },
  ],
};

const blocksSheetsExportSchema: any = {
  name: 'blocks',
  initialValues: [
    {
      name: 'Block 1',
      branches: 'Branch 1, Branch 2',
    },
    {
      name: 'Block 2',
      branches: 'Branch 1, Branch 2',
    },
    {
      name: 'Block 3',
      branches: 'Branch 1, Branch 2',
    },
  ],
};

const clientsSheetsExportSchema: any = {
  name: 'clients',
  initialValues: [
    {
      firstName: 'Client Name 1',
      lastName: 'Client Last Name 1',
      email: 'client1@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      otherPhones: '+1 (987) 777 777 77, +1 (987) 888 888 88',
      otherEmails: 'other1@gmail.com, other2@gmail.com',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      birthday: '06/31/1999',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
      credentialFunders: 'Funder 1, Funder 2',
      idCustom: '123',
      idCustom2: '321',
    },
    {
      firstName: 'Client Name 2',
      lastName: 'Client Last Name 2',
      email: 'client1@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      otherPhones: '+1 (987) 777 777 77, +1 (987) 888 888 88',
      otherEmails: 'other1@gmail.com, other2@gmail.com',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      birthday: '06/31/1999',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
      credentialFunders: 'Funder 1, Funder 2',
      idCustom: '123',
      idCustom2: '321',
    },
    {
      firstName: 'Client Name 3',
      lastName: 'Client Last Name 3',
      email: 'client1@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      otherPhones: '+1 (987) 777 777 77, +1 (987) 888 888 88',
      otherEmails: 'other1@gmail.com, other2@gmail.com',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      birthday: '06/31/1999',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
      credentialFunders: 'Funder 1, Funder 2',
      idCustom: '123',
      idCustom2: '321',
    },
  ],
};

const employeesSheetsExportSchema: any = {
  name: 'employees',
  initialValues: [
    {
      ID: '1',
      firstName: 'Client Name 1',
      lastName: 'Client Last Name 1',
      email: 'client1@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      otherPhones: '+1 (987) 777 777 77, +1 (987) 888 888 88',
      otherEmails: 'other1@gmail.com, other2@gmail.com',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      birthday: '06/31/1999',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
      credentialFunders: 'Funder 1, Funder 2',
      idCustom: '123',
      idCustom2: '321',
    },
    {
      ID: '2',
      firstName: 'Client Name 2',
      lastName: 'Client Last Name 2',
      email: 'client1@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      otherPhones: '+1 (987) 777 777 77, +1 (987) 888 888 88',
      otherEmails: 'other1@gmail.com, other2@gmail.com',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      birthday: '06/31/1999',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
      credentialFunders: 'Funder 1, Funder 2',
      idCustom: '123',
      idCustom2: '321',
    },
    {
      ID: '3',
      firstName: 'Client Name 3',
      lastName: 'Client Last Name 3',
      email: 'client1@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      otherPhones: '+1 (987) 777 777 77, +1 (987) 888 888 88',
      otherEmails: 'other1@gmail.com, other2@gmail.com',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      birthday: '06/31/1999',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
      credentialFunders: 'Funder 1, Funder 2',
      idCustom: '123',
      idCustom2: '321',
    },
  ],
};

const fundersSheetsExportSchema: any = {
  name: 'funders',
  initialValues: [
    {
      name: 'Funer 1',
      branches: 'Branch 1, Branch 2',
      credential: 'Person 1, Person 2',
      roster: 'Person 1, Person 2',
      subgroups: 'Subgroup 1, Subgroup 2',
    },
    {
      name: 'Funer 2',
      branches: 'Branch 1, Branch 2',
      credential: 'Person 1, Person 2',
      roster: 'Person 1, Person 2',
      subgroups: 'Subgroup 1, Subgroup 2',
    },
    {
      name: 'Funer 3',
      branches: 'Branch 1, Branch 2',
      credential: 'Person 1, Person 2',
      roster: 'Person 1, Person 2',
      subgroups: 'Subgroup 1, Subgroup 2',
    },
  ],
};

const locationsSheetsExportSchema: any = {
  name: 'locations',
  initialValues: [
    {
      name: 'Location 1',
      roomparent: 'Location, Location',
      rooms: 'User 1, User 2',
      capacity: 10,
      color: 'black',
      email: 'example@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
    },
    {
      name: 'Location 2',
      roomparent: 'Location, Location',
      rooms: 'User 1, User 2',
      capacity: 10,
      color: 'black',
      email: 'example@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
    },
    {
      name: 'Location 3',
      roomparent: 'Location, Location',
      rooms: 'User 1, User 2',
      capacity: 10,
      color: 'black',
      email: 'example@gmail.com',
      phoneNumber: '+1 (987) 987 987 97',
      address: '1224 Westwood Drive, Marrero, LA, USA',
      roles: 'Role 1, Role 2',
      branches: 'Branch 1, Branch 2',
      subgroups: 'Subgroup 1, Subgroup 2',
    },
  ],
};

const formatUsersSheetsExportSchema = (resource: string) => {
  const usersSheetsExportSchema = [
    {
      name: 'availabilities',
      initialValues: [
        {
          user: '',
          startTime: '',
          endTime: '',
          days: '',
          location2: '',
          startRange: '',
          endRange: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      ],
    },
    {
      name: 'priorities',
      initialValues: [
        {
          user1: '',
          user2: '',
          rank: '',
        },
      ],
    },
    {
      name: 'timeconstraints',
      initialValues: [
        {
          user1: '',
          activity: '',
          min: '',
          max: '',
          unit: '',
          frequency: '',
          start: '',
          end: '',
          offset: '',
        },
      ],
    },
    {
      name: 'frequency',
      initialValues: [
        //{ value: 'Per Session', label: 'Per Session' },
        { value: 'Total', label: 'Total' },
        { value: 'Daily', label: 'Daily' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Annually', label: 'Annually' },
      ],
    },
    {
      name: 'unit',
      initialValues: [
        { value: 'Hours', label: 'Hours' },
        { value: 'Minutes', label: 'Minutes' },
        { value: 'Seconds', label: 'Seconds' },
        { value: 'Units', label: 'Units' },
      ],
    },
    {
      name: 'timezones',
      initialValues: getTimeZones().map((t: TimezoneType) => ({
        label: t.label,
      })),
    },
  ];

  if (resource === 'Activity')
    usersSheetsExportSchema.unshift(activitiesSheetsExportSchema);
  if (resource === 'Block')
    usersSheetsExportSchema.unshift(blocksSheetsExportSchema);
  if (resource === 'Client')
    usersSheetsExportSchema.unshift(clientsSheetsExportSchema);
  if (resource === 'Employee')
    usersSheetsExportSchema.unshift(employeesSheetsExportSchema);
  if (resource === 'Funder')
    usersSheetsExportSchema.unshift(fundersSheetsExportSchema);
  if (resource === 'Location')
    usersSheetsExportSchema.unshift(locationsSheetsExportSchema);

  return usersSheetsExportSchema;
};

const disabledFieldOptions = [
  {
    label: 'None',
    value: '',
  },
  {
    label: 'Show Disabled',
    value: 'true',
  },
  {
    label: "Don't Show Disabled",
    value: 'false',
  },
];
const UsersTable = ({ resourceType }: { resourceType: string }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { getLatLonFromAddress } = useGeolocation();
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const rows = useTypedSelector((store) => store.users.list.rows);
  const count = useTypedSelector((store) => store.users.list.count);
  const loading = useTypedSelector((store) => store.users.list.loading);
  const modalOpen = useTypedSelector((store) => store.users.list.modalOpen);
  const idToDelete = useTypedSelector((store) => store.users.list.idToDelete);
  const addresses = useTypedSelector((store) => store.users.list.addresses);
  const settingsCompany = useTypedSelector(
    (state) => state.settings.settingsCompany,
  );

  const settingsValuesSelectedBranches = useAppSelector(
    (state) => state.settings.settingValues.selectedBranches,
  );
  const settingsLoading = useAppSelector(
    (state) => state.settings.settingsLoading,
  );

  const [importLoading, setImportLoading] = useState(false);
  const [importSubmittingLoading, setImportSubmittingLoading] = useState(false);
  const [passwordActionModal, setPasswordActionModal] = useState(false);
  const [importFileData, setImportFileData] = useState<any>(null);
  // Modal
  const [invalidFileModal, setInvalidFileModal] = useState<boolean>(false);
  const [fileErrors, setFileErrors] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);

  const localLoading = branchesLoading || rolesLoading;

  const editPermission =
    resourceType === 'Activity' ? 'editActivity' : 'editUser';
  const deletePermission =
    resourceType === 'Activity' ? 'editActivity' : 'deleteUser';

  let storedAddresses: UsersAddress[] = addresses;

  const addUserAddress = (address: UsersAddress) => {
    storedAddresses = [...storedAddresses, address];
    dispatch(actions.doAddUserAddress(address));
  };
  /* Table Role Logics */
  const [roleOptions, setRoleOptions] = useState([]);
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('/roles/autocomplete');
        const roles = res.data;
        const formattedRoles = roles.map((structure: any) => ({
          id: structure.id,
          label: structure.label,
          value: structure.id,
        }));
        setRoleOptions(formattedRoles);
      } catch (error) {
        console.log(error);
      } finally {
        setRolesLoading(false);
      }
    };
    fetchBranches();
  }, [resourceType]);

  /* Table Branches Logics */
  const [branchesOptions, setBranchesOptions] = useState<any[]>([]);
  const [localFilters, setLocalFilters] = useState({});

  // Fetch branches for filtering
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`/scheduler/branches`);

        const branches = res.data;
        const formattedBranches = branches.map((structure: any) => ({
          id: structure.value,
          options: structure.options.map((option: any) => ({
            label: option.label,
            value: option.value,
          })),
        }));

        const formattedBranchesOptions = formattedBranches.flatMap(
          (val: any) => val.options,
        );
        setBranchesOptions(formattedBranchesOptions);
      } catch (error) {
        console.log(error);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, [resourceType]);

  const actionFormatter = (cell: string, row?: any) => {
    if (resourceType === 'Activity' && row?.immutable) {
      return null;
    }
    return (
      <ActionFormatter
        editPermissionType={editPermission}
        deletePermissionType={deletePermission}
        switchEvent={
          resourceType === 'Employee' || resourceType === 'Client'
            ? () => dispatch(switchUser(cell))
            : null
        }
        editEvent={() =>
          navigate(`/admin/users/resources/${resourceType}/${cell}/edit`)
        }
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const columns = useMemo(() => {
    let c: any = [
      {
        accessorKey: 'firstName',
        header:
          resourceType === 'Employee' || resourceType === 'Client'
            ? 'First Name'
            : 'Name',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
      },
      {
        accessorKey: 'email',
        header: 'E-mail',
        size: 300,
      },
      {
        accessorFn: (row: any) => row.roles?.name,
        id: 'roles',
        header: 'Roles',
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: roleOptions,
        Cell: (row: any) => {
          const data = row.row.original?.roles;
          if (data && data?.length > 0) {
            return (
              <>
                {data.map((x: any) => (
                  <Chip
                    label={x.name}
                    key={x.id}
                    component='a'
                    variant='outlined'
                    href={`/`}
                    clickable
                  />
                ))}
              </>
            );
          }
          return;
        },
        size: 100,
      },
      {
        accessorFn: (row: any) => row.branches?.name,
        id: 'branches',
        header: 'Branches',
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: branchesOptions,
        Cell: (row: any) => {
          const data = row.row.original?.branches;
          if (data && data?.length > 0) {
            return (
              <>
                {data.slice(0, 5).map((val: any, index: number) => {
                  if (data.length > 4 && index === 4)
                    return <p key={index}>More...</p>;
                  return (
                    <Link to={`/admin/branches/${val.id}`} key={val.id}>
                      <Typography>{val.name}</Typography>
                    </Link>
                  );
                })}
              </>
            );
          }
          return;
        },
      },
      // {
      //   accessorKey: 'idCustom',
      //   header: 'ID',
      //   Header: () => {
      //       return settingsCompany?.customLabels?.resources?.[resourceType.toLowerCase()]?.ID?.relabel ??'ID'
      //   },
      //   enableSorting: false,
      //   enableColumnFilter: false,
      // },
      // {
      //   accessorKey: 'idCustom2',
      //   header: 'ID2',
      //   Header: () => {
      //     return settingsCompany?.customLabels?.resources?.[resourceType.toLowerCase()]?.ID2?.relabel ??'ID2'
      // },
      //   enableSorting: false,
      //   enableColumnFilter: false,
      // },
      {
        accessorFn: (row: any) => row.roomparent?.name,
        id: 'roomparent',
        header: 'Room Parents',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const roomparent = row.row.original?.roomparent;
          if (roomparent && roomparent?.length > 0) {
            return (
              <>
                {roomparent.slice(0, 5).map((val: any, index: number) => {
                  if (roomparent.length > 4 && index === 4)
                    return <p key={index}>More...</p>;
                  return (
                    <Link to={`/admin/users/${val.id}`} key={val.id}>
                      <Typography>{val.firstName}</Typography>
                    </Link>
                  );
                })}
              </>
            );
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.rooms?.name,
        id: 'rooms',
        header: 'Rooms',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const data = row.row.original?.rooms;
          if (data && data?.length > 0) {
            return (
              <>
                {data.slice(0, 5).map((val: any, index: number) => {
                  if (data.length > 4 && index === 4)
                    return <p key={index}>More...</p>;
                  return (
                    <Link to={`/admin/users/${val.id}`} key={val.id}>
                      <Typography>{val.firstName}</Typography>
                    </Link>
                  );
                })}
              </>
            );
          }
          return;
        },
      },
      {
        accessorKey: 'capacity',
        header: 'Capacity',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row: any) => row.subgroups,
        id: 'subgroups',
        header: 'Subgroups',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const data = row.row.original?.subgroups;
          if (data && data?.length > 0) {
            return (
              <>
                {data.slice(0, 5).map((val: any, index: number) => {
                  if (data.length > 4 && index === 4)
                    return <p key={index}>More...</p>;
                  return <Typography key={val.id}>{val.name}</Typography>;
                })}
              </>
            );
          }
          return;
        },
      },
      {
        accessorKey: 'alias',
        header: resourceType === 'Client' && 'Alias',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'address',
        header: 'Address',
      },
      {
        accessorFn: (row: any) => (row.billable ? 'true' : 'false'),
        id: 'billable',
        header: 'Billable',
        enableColumnFilter: false,
        Cell: ({ cell }: any) => {
          return cell.getValue() === 'true' ? 'Yes' : 'No';
        },
        size: 150,
      },
      {
        accessorFn: (row: any) => (row.paid ? 'true' : 'false'),
        id: 'paid',
        header: 'Paid',
        enableColumnFilter: false,
        Cell: ({ cell }: any) => {
          return cell.getValue() === 'true' ? 'Yes' : 'No';
        },
        size: 120,
      },
      {
        accessorFn: (row: any) => (row.notWorking ? 'true' : 'false'),
        id: 'notWorking',
        header: 'Not Working',
        enableColumnFilter: false,
        Cell: ({ cell }: any) => {
          return cell.getValue() === 'true' ? 'Yes' : 'No';
        },
        size: 180,
      },
      {
        accessorFn: (row: any) => (row.auth ? 'true' : 'false'),
        id: 'auth',
        header: 'Needs Authorization',
        enableColumnFilter: false,
        Cell: ({ cell }: any) => {
          return cell.getValue() === 'true' ? 'Yes' : 'No';
        },
        size: 180,
      },
      {
        accessorFn: (row: any) => row.credential?.name,
        id: 'credential',
        header: 'Credential',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const data = row.row.original?.credential;
          if (data && data?.length > 0) {
            return (
              <Stack direction='row' gap='5px' flexWrap='wrap'>
                {data.map((x: any) => (
                  <Chip label={x.name} variant='outlined' component='a' />
                ))}
              </Stack>
            );
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.roster?.name,
        id: 'roster',
        header: 'Roster',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const data = row.row.original?.roster;
          if (data && data?.length > 0) {
            return (
              <Stack direction='row' gap='5px' flexWrap='wrap'>
                {data.map((x: any) => (
                  <Chip label={x.name} variant='outlined' component='a' />
                ))}
              </Stack>
            );
          }
          return;
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: 'color',
        header: 'Color',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          if (row.row.original?.color) {
            return (
              <Typography
                style={{ color: colourHexToName(row.row.original.color) }}
              >
                {colourHexToName(row.row.original.color)}
              </Typography>
            );
          }
        },
      },
      {
        id: 'borderColor',
        header: 'Border Color',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          if (row.row.original?.borderColor) {
            return (
              <Typography
                style={{ color: colourHexToName(row.row.original.borderColor) }}
              >
                {colourHexToName(row.row.original.borderColor)}
              </Typography>
            );
          }
        },
      },
      {
        accessorFn: (row: any) => (row.disabled ? 'true' : 'false'),
        id: 'disabled',
        header: 'Inactive',
        filterVariant: 'select',
        filterSelectOptions: disabledFieldOptions,
        Cell: ({ cell }: any) => {
          return cell.getValue() === 'true' ? 'Yes' : 'No';
        },
        size: 120,
      },
    ];
    if (
      role_permissions(currentUser, editPermission) ||
      role_permissions(currentUser, deletePermission)
    ) {
      c.unshift({
        accessorKey: 'id',
        header: '',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({
          row,
          renderedCellValue,
        }: {
          row: any;
          renderedCellValue: any;
        }) => {
          return actionFormatter(renderedCellValue, row?.original);
        },
        size: 120,
      });
    }
    if (user_arrays[resourceType]) {
      c = c.filter((e: any) =>
        Object.keys(user_arrays[resourceType]).includes(e.accessorKey || e.id),
      );
    }
    if (
      (!settingsCompany?.customLabels ||
        !settingsCompany?.customLabels?.resources?.[resourceType.toLowerCase()]
          ?.ID?.hide) &&
      Object.keys(user_arrays[resourceType]).includes('idCustom')
    ) {
      c.splice(4, 0, {
        accessorKey: 'idCustom',
        header: 'ID',
        Header: () => {
          return (
            settingsCompany?.customLabels?.resources?.[
              resourceType.toLowerCase()
            ]?.ID?.relabel ?? 'ID'
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      });
    }
    if (
      (!settingsCompany?.customLabels ||
        !settingsCompany?.customLabels?.resources?.[resourceType.toLowerCase()]
          ?.ID2?.hide) &&
      Object.keys(user_arrays[resourceType]).includes('idCustom2')
    ) {
      c.splice(4, 0, {
        accessorKey: 'idCustom2',
        header: 'ID2',
        Header: () => {
          return (
            settingsCompany?.customLabels?.resources?.[
              resourceType.toLowerCase()
            ]?.ID2?.relabel ?? 'ID2'
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      });
    }
    return c;
  }, [user_arrays, resourceType, branchesOptions]);

  const defaultSelectedBranchesOption = useMemo(() => {
    const findUsersBranch =
      Array.isArray(settingsValuesSelectedBranches) &&
      settingsValuesSelectedBranches.length > 0
        ? branchesOptions.find(
            (t) => t.value === settingsValuesSelectedBranches[0].id,
          )
        : null;

    const defaultSelectedBranch = findUsersBranch
      ? findUsersBranch
      : branchesOptions[0]
        ? branchesOptions[0]
        : null;

    return defaultSelectedBranch ?? null;
  }, [branchesOptions, settingsValuesSelectedBranches]);

  const defaultColumnFilters = useMemo(
    () =>
      defaultSelectedBranchesOption
        ? [
            {
              id: 'branches',
              value: defaultSelectedBranchesOption.value,
            },
          ]
        : [],
    [defaultSelectedBranchesOption],
  );

  const handleDelete = async (deleteEvents: boolean) => {
    const id = idToDelete;

    await dispatch(actions.doDelete(id!, deleteEvents, selectedDate));
    dispatch(actions.doFetch(localFilters, resourceType));
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  /* IMPORTING XLSX FUNCTIONS */

  const toggleInvalidFileModal = () => setInvalidFileModal((prev) => !prev);

  const fetchUsersSheetData = async (resourceType: string) => {
    try {
      const params = { query: '', limit: 100000000 };
      const response = await axios.get(`/users/sheet-data/${resourceType}`, {
        params,
      });
      return response.data;
    } catch (error) {
      return null;
    }
  };
  const checkTableEmptyValues = (data: object) => {
    return (
      Boolean(Object.values(data).filter((e) => e !== '')?.length) || false
    );
  };
  const setErrorMessage = (prefix: string, data: string[]) => {
    const msg = `${prefix}: ${data.join(', ')}`;
    return setFileErrors((prev) => [...prev, msg]);
  };
  const findDuplicatedValues = (arr: string[]): any[] => {
    if (arr && arr.length) {
      return [...new Set(findDuplicates(arr))];
    }
    return [];
  };
  const checkExistingValues = (
    arr1: any[],
    arr2: any[],
    findWith: string = 'label',
  ): any[] => {
    if (arr1 && arr1.length && arr2 && arr2.length) {
      let existingValues: string[] = [];
      arr1.forEach((name: string) => {
        const foundIndex = arr2.findIndex(
          (val: any) => val[findWith]?.toLowerCase() === name?.toLowerCase(),
        );
        if (foundIndex !== -1) {
          existingValues.push(name);
        }
      });
      return [...new Set(existingValues)];
    }
    return [];
  };
  const checkInvalidMultiValues = (arr1: any[], arr2: any[]): any[] => {
    if (arr1 && arr1.length && arr2 && arr2.length) {
      let invalidValues: string[] = [];
      arr1.forEach((values: string[]) => {
        values.forEach((val: string) => {
          const foundIndex = arr2.findIndex(
            (r: any) => r.label?.toLowerCase() === val.toLowerCase(),
          );
          if (foundIndex === -1) {
            invalidValues.push(val);
          }
        });
      });
      return [...new Set(invalidValues)];
    }
    return [];
  };

  /* Validate resource tables */
  const validateUsersTable = (
    clients: any,
    sheetData: any,
    type = 'client',
  ): boolean => {
    let isAllDataValid: boolean = true;

    // Validate client names
    const clientNames = clients.map(
      (client: any) => `${client?.firstName || ''} ${client?.lastName || ''}`,
    );
    let duplicatedClientNames = findDuplicatedValues(clientNames);
    // Check if new client name exists in db
    let existingClientNames = checkExistingValues(clientNames, sheetData.users);

    // Validate client emails
    const clientEmails = clients.map((client: any) => client.email);
    let duplicatedClientEmails = findDuplicatedValues(clientEmails);
    // Check if new client email exists in db
    let existingClientEmails = checkExistingValues(
      clientEmails,
      sheetData.users,
      'email',
    );

    // Check email is valid or not
    let invalidEmails: string[] = [];
    if (clientEmails && clientEmails.length) {
      clientEmails.forEach((email: string) => {
        const isValidEmail = validateEmail(email.trim());
        if (!isValidEmail) {
          invalidEmails.push(email);
        }
      });
      invalidEmails = [...new Set(invalidEmails)];
    }

    // Validate roles
    const clientRoles = clients.map((client: any) => [
      ...new Set(client.roles.split(',').map((role: string) => role.trim())),
    ]);
    let invalidRoles = checkInvalidMultiValues(clientRoles, sheetData.roles);

    // Validate branches
    const clientBranches = clients.map((client: any) => [
      ...new Set(
        client.branches.split(',').map((branch: string) => branch.trim()),
      ),
    ]);
    let invalidBranches = checkInvalidMultiValues(
      clientBranches,
      sheetData.branches,
    );

    // Validate subgroups (not required field)
    let invalidSubgroups: any[] = [];
    const clientSubgroups = clients.map((client: any) => {
      if (client.subgroups) {
        return [
          ...new Set(
            client.subgroups.split(',').map((sb: string) => sb.trim()),
          ),
        ];
      } else {
        return [];
      }
    });
    if (clientSubgroups) {
      invalidSubgroups = checkInvalidMultiValues(
        clientSubgroups,
        sheetData.subgroups,
      );
    }

    // Validate credential funders (this field is not required) for employee
    let invalidCredentialFunders: any[] = [];
    const clientCredentialFunders = clients.map((client: any) => {
      if (client.credentialFunders) {
        return [
          ...new Set(
            client.credentialFunders.split(',').map((sb: string) => sb.trim()),
          ),
        ];
      } else {
        return [];
      }
    });
    if (clientCredentialFunders && clientCredentialFunders.length) {
      invalidCredentialFunders = checkInvalidMultiValues(
        clientCredentialFunders,
        sheetData.funders,
      );
    }

    if (duplicatedClientNames.length) {
      setErrorMessage(`Duplicated ${type} firstNames`, duplicatedClientNames);
      isAllDataValid = false;
    }
    if (duplicatedClientEmails.length) {
      setErrorMessage(`Duplicated ${type} emails`, duplicatedClientEmails);
      isAllDataValid = false;
    }
    if (existingClientNames.length) {
      setErrorMessage(
        `These ${type} names are already in the database`,
        existingClientNames,
      );
      isAllDataValid = false;
    }
    if (existingClientEmails.length) {
      setErrorMessage(
        `These ${type} emails are already in the database`,
        existingClientEmails,
      );
      isAllDataValid = false;
    }
    if (invalidEmails.length) {
      setErrorMessage('Invalid emails', invalidEmails);
      isAllDataValid = false;
    }
    if (invalidRoles.length) {
      setErrorMessage('Invalid roles', invalidRoles);
      isAllDataValid = false;
    }
    if (invalidBranches.length) {
      setErrorMessage('Invalid branches', invalidBranches);
      isAllDataValid = false;
    }
    if (invalidSubgroups.length) {
      setErrorMessage('Invalid subgroups', invalidSubgroups);
      isAllDataValid = false;
    }
    if (invalidCredentialFunders.length) {
      setErrorMessage('Invalid credential funders', invalidCredentialFunders);
      isAllDataValid = false;
    }
    return isAllDataValid;
  };
  const validateActivitiesTable = (
    activities: any,
    sheetData: any,
  ): boolean => {
    let isAllDataValid: boolean = true;

    // Validate activities names
    const activityNames = activities.map((activity: any) => activity.name);
    let duplicatedActivityNames = findDuplicatedValues(activityNames);
    let existingActivityNames = checkExistingValues(
      activityNames,
      sheetData.activitiesData,
    );

    // Validate branches
    const activityBranches = activities.map((activity: any) => [
      ...new Set(
        activity.branches.split(',').map((branch: string) => branch.trim()),
      ),
    ]);
    let invalidBranches = checkInvalidMultiValues(
      activityBranches,
      sheetData.branches,
    );

    if (duplicatedActivityNames.length) {
      setErrorMessage(`Duplicated activity names`, duplicatedActivityNames);
      isAllDataValid = false;
    }
    if (existingActivityNames.length) {
      setErrorMessage(
        `These activity names are already in the database`,
        existingActivityNames,
      );
      isAllDataValid = false;
    }
    if (invalidBranches.length) {
      setErrorMessage('Invalid branches', invalidBranches);
      isAllDataValid = false;
    }
    return isAllDataValid;
  };
  const validateBlocksTable = (blocks: any, sheetData: any): boolean => {
    let isAllDataValid: boolean = true;

    // Validate activities names
    const blockNames = blocks.map((block: any) => block.name);
    let duplicatedBlockNames = findDuplicatedValues(blockNames);
    let existingBlockNames = checkExistingValues(
      blockNames,
      sheetData.blocksData,
    );

    // Validate branches
    const blockBranches = blocks.map((block: any) => [
      ...new Set(
        block.branches.split(',').map((branch: string) => branch.trim()),
      ),
    ]);
    let invalidBranches = checkInvalidMultiValues(
      blockBranches,
      sheetData.branches,
    );

    if (duplicatedBlockNames.length) {
      setErrorMessage(`Duplicated block names`, duplicatedBlockNames);
      isAllDataValid = false;
    }
    if (existingBlockNames.length) {
      setErrorMessage(
        `These block names are already in the database`,
        existingBlockNames,
      );
      isAllDataValid = false;
    }
    if (invalidBranches.length) {
      setErrorMessage('Invalid branches', invalidBranches);
      isAllDataValid = false;
    }
    return isAllDataValid;
  };
  const validateFundersTable = (funders: any, sheetData: any): boolean => {
    let isAllDataValid: boolean = true;

    // Validate funders names
    const funderNames = funders.map((f: any) => f.name);
    let duplicatedFunderNames = findDuplicatedValues(funderNames);
    let existingFunderNames = checkExistingValues(
      funderNames,
      sheetData.fundersData,
    );

    // Validate branches
    const funderBranches = funders.map((block: any) => [
      ...new Set(
        block.branches.split(',').map((branch: string) => branch.trim()),
      ),
    ]);
    let invalidBranches = checkInvalidMultiValues(
      funderBranches,
      sheetData.branches,
    );

    // Validate credentials (not required field)
    const funderCredentials = funders.map((funder: any) => {
      if (funder.credential) {
        return [
          ...new Set(
            funder.credential.split(',').map((sb: string) => sb.trim()),
          ),
        ];
      } else {
        return [];
      }
    });
    let invalidCredentials: any[] = [];
    if (funderCredentials) {
      invalidCredentials = checkInvalidMultiValues(
        funderCredentials,
        sheetData.roles,
      );
    }
    // Validate rosters (not required field)
    let invalidRosters: any[] = [];
    const funderRosters = funders.map((funder: any) => {
      if (funder.roster) {
        return [
          ...new Set(funder.roster.split(',').map((sb: string) => sb.trim())),
        ];
      } else {
        return [];
      }
    });
    if (funderRosters) {
      invalidRosters = checkInvalidMultiValues(funderRosters, sheetData.roles);
    }

    // Validate subgroups (not required field)
    let invalidSubgroups: any[] = [];
    const funderSubgroups = funders.map((funder: any) => {
      if (funder.subgroups) {
        return [
          ...new Set(
            funder.subgroups.split(',').map((sb: string) => sb.trim()),
          ),
        ];
      } else {
        return [];
      }
    });
    if (funderSubgroups) {
      invalidSubgroups = checkInvalidMultiValues(
        funderSubgroups,
        sheetData.subgroups,
      );
    }

    if (duplicatedFunderNames.length) {
      setErrorMessage(`Duplicated funder names`, duplicatedFunderNames);
      isAllDataValid = false;
    }
    if (existingFunderNames.length) {
      setErrorMessage(
        `These funder names are already in the database`,
        existingFunderNames,
      );
      isAllDataValid = false;
    }
    if (invalidBranches.length) {
      setErrorMessage('Invalid branches', invalidBranches);
      isAllDataValid = false;
    }
    if (invalidCredentials.length) {
      setErrorMessage('Invalid credentials', invalidCredentials);
      isAllDataValid = false;
    }
    if (invalidRosters.length) {
      setErrorMessage('Invalid rosters', invalidRosters);
      isAllDataValid = false;
    }
    if (invalidSubgroups.length) {
      setErrorMessage('Invalid subgroups', invalidSubgroups);
      isAllDataValid = false;
    }
    return isAllDataValid;
  };
  const validateLocationsTable = (locations: any, sheetData: any): boolean => {
    let isAllDataValid: boolean = true;

    // Validate funders names
    const locationNames = locations.map((block: any) => block.name);
    let duplicatedLocationNames = findDuplicatedValues(locationNames);
    const existingLocationNames = checkExistingValues(
      locationNames,
      sheetData.locationsData,
    ); // validate

    // Validate client emails
    const locationEmails = locations.map((location: any) => location.email);
    const duplicatedLocationEmails = findDuplicatedValues(locationEmails); // validate
    // Check if new client email exists in db
    const existingClientEmails = checkExistingValues(
      locationEmails,
      sheetData.users,
      'email',
    ); // validate
    // Check email is valid or not
    let invalidEmails: string[] = []; // validate
    locationEmails.forEach((email: string) => {
      const isValidEmail = validateEmail(email.trim());
      if (!isValidEmail) {
        invalidEmails.push(email);
      }
    });
    invalidEmails = [...new Set(invalidEmails)];

    // Validate branches
    const locationBranches = locations.map((location: any) => [
      ...new Set(
        location.branches.split(',').map((branch: string) => branch.trim()),
      ),
    ]);
    const invalidBranches = checkInvalidMultiValues(
      locationBranches,
      sheetData.branches,
    );

    // Validate roles
    const locationRoles = locations.map((location: any) => [
      ...new Set(location.roles.split(',').map((role: string) => role.trim())),
    ]);
    const invalidRoles = checkInvalidMultiValues(
      locationRoles,
      sheetData.roles,
    );

    // Validate subgroups (not required field)
    let invalidSubgroups: any[] = [];
    const locationSubgroups = locations.map((location: any) => {
      if (location.subgroups) {
        return [
          ...new Set(
            location.subgroups.split(',').map((sb: string) => sb.trim()),
          ),
        ];
      } else {
        return [];
      }
    });
    if (locationSubgroups) {
      invalidSubgroups = checkInvalidMultiValues(
        locationSubgroups,
        sheetData.subgroups,
      );
    }

    // Validate roomparents (not required field)
    let invalidRoomparents: any[] = [];
    const locationRoomparents = locations.map((funder: any) => {
      if (funder.roomparent) {
        return [
          ...new Set(
            funder.roomparent.split(',').map((sb: string) => sb.trim()),
          ),
        ];
      } else {
        return [];
      }
    });
    if (locationRoomparents) {
      invalidRoomparents = checkInvalidMultiValues(
        locationRoomparents,
        sheetData.locationsData,
      );
    }

    // Validate rooms (not required field)
    let invalidRooms: any[] = [];
    const locationRooms = locations.map((location: any) => {
      if (location.rooms) {
        return [
          ...new Set(location.rooms.split(',').map((sb: string) => sb.trim())),
        ];
      } else {
        return [];
      }
    });
    if (locationRoomparents) {
      invalidRooms = checkInvalidMultiValues(locationRooms, sheetData.users);
    }

    if (duplicatedLocationNames.length) {
      setErrorMessage(`Duplicated location names`, duplicatedLocationNames);
      isAllDataValid = false;
    }
    if (existingLocationNames.length) {
      setErrorMessage(
        `These location names are already in the database`,
        existingLocationNames,
      );
      isAllDataValid = false;
    }
    if (duplicatedLocationEmails.length) {
      setErrorMessage(`Duplicated location emails`, duplicatedLocationEmails);
      isAllDataValid = false;
    }
    if (existingClientEmails.length) {
      setErrorMessage(
        `These location emails are already in the database`,
        existingClientEmails,
      );
      isAllDataValid = false;
    }
    if (invalidEmails.length) {
      setErrorMessage('Invalid emails', invalidEmails);
      isAllDataValid = false;
    }
    if (invalidRoles.length) {
      setErrorMessage('Invalid roles', invalidRoles);
      isAllDataValid = false;
    }
    if (invalidBranches.length) {
      setErrorMessage('Invalid branches', invalidBranches);
      isAllDataValid = false;
    }
    if (invalidSubgroups.length) {
      setErrorMessage('Invalid subgroups', invalidSubgroups);
      isAllDataValid = false;
    }
    if (invalidRoomparents.length) {
      setErrorMessage('Invalid roomparents', invalidRoomparents);
      isAllDataValid = false;
    }
    if (invalidRooms.length) {
      setErrorMessage('Invalid rooms', invalidRooms);
      isAllDataValid = false;
    }
    return isAllDataValid;
  };

  // Validate address
  const checkAddressLatLon = async (address: string) => {
    if (!address) return null;
    const findAddress = storedAddresses.find(
      (a: UsersAddress) => a.address === address,
    );

    if (findAddress) {
      const { lat, lng } = findAddress;
      return { lat, lng };
    } else {
      try {
        const geoLocation = await getLatLonFromAddress(address);
        if (geoLocation) {
          const { lat, lng } = geoLocation;
          addUserAddress({
            address,
            lat,
            lng,
          });
          return { lat, lng };
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    }
  };
  const handleImportClients = async (data: any) => {
    setFileErrors([]);
    setImportLoading(true);
    // Get users sheet data
    const sheetData = await fetchUsersSheetData(resourceType);
    let isAllDataValid: boolean = true;
    let userNames: any[] = [];

    // Validation for Clients
    if (resourceType === 'Client') {
      if (data.clients) {
        isAllDataValid = validateUsersTable(data.clients, sheetData, 'client');
        userNames = data.clients.map(
          (val: any) => `${val.firstName} ${val.lastName}`,
        );
      } else {
        toast.error('Please create a clients table!');
        isAllDataValid = false;
        return;
      }
    }
    // Validation for Employees
    if (resourceType === 'Employee') {
      if (data.employees) {
        isAllDataValid = validateUsersTable(
          data.employees,
          sheetData,
          'employee',
        );
        userNames = data.employees.map(
          (val: any) => `${val.firstName} ${val.lastName}`,
        );
      } else {
        toast.error('Please create a employees table!');
        isAllDataValid = false;
        return;
      }
    }
    // Validation for Activity
    if (resourceType === 'Activity') {
      if (data.activities) {
        isAllDataValid = validateActivitiesTable(data.activities, sheetData);
        userNames = data.activities.map((val: any) => val.name);
      } else {
        toast.error('Please create a activities table!');
        isAllDataValid = false;
        return;
      }
    }
    // Validation for Block
    if (resourceType === 'Block') {
      if (data.blocks) {
        isAllDataValid = validateBlocksTable(data.blocks, sheetData);
        userNames = data.blocks.map((val: any) => val.name);
      } else {
        toast.error('Please create a blocks table!');
        isAllDataValid = false;
        return;
      }
    }
    // Validation for Funder
    if (resourceType === 'Funder') {
      if (data.funders) {
        isAllDataValid = validateFundersTable(data.funders, sheetData);
        userNames = data.funders.map((val: any) => val.name);
      } else {
        toast.error('Please create a funders table!');
        isAllDataValid = false;
        return;
      }
    }
    // Validation for Funder
    if (resourceType === 'Location') {
      if (data.locations) {
        isAllDataValid = validateLocationsTable(data.locations, sheetData);
        userNames = data.locations.map((val: any) => val.name);
      } else {
        toast.error('Please create a locations table!');
        isAllDataValid = false;
        return;
      }
    }

    /* Validate availabilities table */
    const availabilities = data?.availabilities;
    let isAvailabilitiesNotEmpty = false;
    if (availabilities?.length) {
      isAvailabilitiesNotEmpty = checkTableEmptyValues(availabilities[0]);
      if (isAvailabilitiesNotEmpty) {
        // Validate user
        const avUsers = availabilities.map(
          (availability: any) => availability.user,
        );
        let wrongAvailabilityUsers: string[] = [];
        avUsers.forEach((user: string) => {
          const foundIndex = userNames.findIndex(
            (val: any) => val.toLowerCase() === user.toLowerCase(),
          );
          if (foundIndex === -1) {
            wrongAvailabilityUsers.push(user);
          }
        });
        wrongAvailabilityUsers = [...new Set(wrongAvailabilityUsers)];

        // Validate startTimes
        const startTimes = availabilities.map(
          (availability: any) => availability.startTime,
        );
        let wrongStartTimes: string[] = [];
        startTimes.forEach((time: string) => {
          const isValidTime = isValidDateTime(time);
          if (!isValidTime) {
            wrongStartTimes.push(time);
          }
        });

        // Validate endTimes
        const endTimes = availabilities.map(
          (availability: any) => availability.endTime,
        );
        let wrongEndTimes: string[] = [];
        endTimes.forEach((time: string) => {
          const isValidTime = isValidDateTime(time);
          if (!isValidTime) {
            wrongEndTimes.push(time);
          }
        });

        // Validate startRanges
        const startRanges = availabilities.map(
          (availability: any) => availability.startRange,
        );
        let wrongStartRanges: string[] = [];
        startRanges.forEach((time: string) => {
          const isValidTime = isValidDateTime(time);
          if (!isValidTime) {
            wrongStartRanges.push(time);
          }
        });

        // Validate endRanges
        const endRanges = availabilities.map(
          (availability: any) => availability.endRange,
        );
        let wrongEndRanges: string[] = [];
        endRanges.forEach((time: string) => {
          const isValidTime = isValidDateTime(time);
          if (!isValidTime) {
            wrongEndRanges.push(time);
          }
        });

        if (wrongAvailabilityUsers.length) {
          setErrorMessage(
            'Invalid users in availabilities table',
            wrongAvailabilityUsers,
          );
          isAllDataValid = false;
        }
        if (wrongStartTimes.length) {
          setErrorMessage(
            'Invalid start times in availabilities table',
            wrongStartTimes,
          );
          isAllDataValid = false;
        }
        if (wrongEndTimes.length) {
          setErrorMessage(
            'Invalid end times for availabilities table',
            wrongEndTimes,
          );
          isAllDataValid = false;
        }
        if (wrongStartRanges.length) {
          setErrorMessage(
            'Invalid start ranges for availabilities table',
            wrongStartRanges,
          );
          isAllDataValid = false;
        }
        if (wrongEndRanges.length) {
          setErrorMessage(
            'Invalid end ranges for availabilities table',
            wrongEndRanges,
          );
          isAllDataValid = false;
        }

        // Validate startTime and endTime diff
        // Validate startRange and endRange diff
        let invalidStartEndTimes: string[] = [];
        let invalidStartEndRanges: string[] = [];
        const timeFormat = 'hh:mm A';
        const dateFormat = 'MM/DD/YYYY';
        availabilities.forEach((availability: any) => {
          const { startTime, endTime, startRange, endRange } = availability;

          const isValidTime = isSameOrBefore(startTime, endTime);
          if (!isValidTime) {
            invalidStartEndTimes.push(
              `${moment(startTime).format(timeFormat)} - ${moment(
                endTime,
              ).format(timeFormat)}`,
            );
          }

          const updatedStartRange = moment(startRange).add(1, 'hours');
          const updatedEndRange = moment(endRange).add(1, 'hours');
          const isValidRange = isSameOrBefore(
            updatedStartRange,
            updatedEndRange,
          );
          if (!isValidRange) {
            invalidStartEndRanges.push(
              `${moment(updatedStartRange).format(dateFormat)} - ${moment(
                updatedEndRange,
              ).format(dateFormat)}`,
            );
          }
        });

        // Validate availability days
        const availabilityDays = availabilities.map((availability: any) => [
          ...new Set(
            availability.days.split(',').map((day: string) => day.trim()),
          ),
        ]);

        let wrongDays: string[] = [];
        availabilityDays.forEach((days: string[]) => {
          days.forEach((day: string) => {
            if (day) {
              const dayIndex = daysOfWeek.findIndex(
                (d) => d.label?.toLowerCase() === day.toLowerCase(),
              );
              if (dayIndex === -1) {
                wrongDays.push(day);
              }
            }
          });
        });
        wrongDays = [...new Set(wrongDays)];

        // Validate availability locations
        const availabilityLocations = availabilities.map(
          (availability: any) => {
            if (availability.location2) {
              return [
                ...new Set(
                  availability.location2
                    ?.split(',')
                    .map((location: string) => location.trim()),
                ),
              ];
            }
            return [];
          },
        );
        let wrongLocations: string[] = [];
        if (availabilityLocations && availabilityLocations.length) {
          availabilityLocations.forEach((locations: string[]) => {
            locations.forEach((location: string) => {
              const locationIndex = sheetData.locationsData.findIndex(
                (l: any) => l.label?.toLowerCase() === location.toLowerCase(),
              );
              if (locationIndex === -1) {
                wrongLocations.push(location);
              }
            });
          });
        }
        wrongLocations = [...new Set(wrongLocations)];

        // Validate availability timezones
        const availabilityTimeZones = availabilities.map(
          (availability: any) => availability.timezone,
        );
        let wrongTimeZones: string[] = [];
        if (availabilityTimeZones && availabilityTimeZones.length) {
          availabilityTimeZones.forEach((timezone: string | undefined) => {
            if (timezone) {
              const locationIndex = getTimeZones().findIndex(
                (tz: TimezoneType) =>
                  tz.label?.toLowerCase() === timezone.toLowerCase(),
              );
              if (locationIndex === -1) {
                wrongTimeZones.push(timezone);
              }
            }
          });
        }
        wrongTimeZones = [...new Set(wrongTimeZones)];

        if (invalidStartEndTimes.length) {
          setErrorMessage(
            'Invalid start and end times for availabilities table',
            invalidStartEndTimes,
          );
          isAllDataValid = false;
        }
        if (invalidStartEndRanges.length) {
          setErrorMessage(
            'Invalid start and end ranges for availabilities table',
            invalidStartEndRanges,
          );
          isAllDataValid = false;
        }
        if (wrongDays.length) {
          setErrorMessage('Invalid days for availabilities table', wrongDays);
          isAllDataValid = false;
        }
        if (wrongLocations.length) {
          setErrorMessage(
            'Invalid locations for availabilities table',
            wrongLocations,
          );
          isAllDataValid = false;
        }
        if (wrongTimeZones.length) {
          setErrorMessage(
            'Invalid timezones for availabilities table',
            wrongTimeZones,
          );
          isAllDataValid = false;
        }
      }
    }

    /* Validate priorities table */
    const priorities = data?.priorities;
    let isPrioritiesNotEmpty = false;
    if (priorities?.length) {
      isPrioritiesNotEmpty = checkTableEmptyValues(priorities[0]);
      if (isPrioritiesNotEmpty) {
        // Validate priority user1
        const priorityUsers1 = priorities.map(
          (priority: any) => priority.user1,
        );
        let wrongPriorityUsers1: string[] = [];
        priorityUsers1.forEach((user: string) => {
          const foundIndex = userNames.findIndex(
            (val: any) => val.toLowerCase() === user.toLowerCase(),
          );
          if (foundIndex === -1) {
            wrongPriorityUsers1.push(user);
          }
        });
        wrongPriorityUsers1 = [...new Set(wrongPriorityUsers1)];

        // Validate priority user2
        const priorityUsers2 = priorities.map(
          (priority: any) => priority.user2,
        );
        let wrongPriorityUsers2: string[] = [];
        priorityUsers2.forEach((user: string) => {
          const userIndex = sheetData.users.findIndex(
            (l: any) => l.label?.toLowerCase() === user.toLowerCase(),
          );
          if (userIndex === -1) {
            wrongPriorityUsers2.push(user);
          }
        });
        wrongPriorityUsers2 = [...new Set(wrongPriorityUsers2)];

        if (wrongPriorityUsers1.length) {
          setErrorMessage(
            'Invalid users1 for priorities table',
            wrongPriorityUsers1,
          );
          isAllDataValid = false;
        }
        if (wrongPriorityUsers2.length) {
          setErrorMessage(
            'Invalid user2 for priorities table',
            wrongPriorityUsers2,
          );
          isAllDataValid = false;
        }
      }
    }

    /* Validate timeconstraints table */
    const timeconstraints = data?.timeconstraints;
    let isTimeconstraintsNotEmpty = false;
    if (timeconstraints?.length) {
      isTimeconstraintsNotEmpty = checkTableEmptyValues(timeconstraints[0]);
      if (isTimeconstraintsNotEmpty) {
        // Validate timeconstraint user1
        const timeconstraintUsers1 = timeconstraints.map(
          (timeconstraint: any) => timeconstraint.user1,
        );
        let wrongTimeconstraintUsers1: string[] = [];
        timeconstraintUsers1.forEach((user: string) => {
          const userIndex = userNames.findIndex(
            (val: any) => val.toLowerCase() === user.toLowerCase(),
          );
          if (userIndex === -1) {
            wrongTimeconstraintUsers1.push(user);
          }
        });
        wrongTimeconstraintUsers1 = [...new Set(wrongTimeconstraintUsers1)];

        // Validate timeconstraint activity (user2)
        const timeconstraintUsers2 = timeconstraints.map(
          (timeconstraint: any) => timeconstraint.activity,
        );
        let wrongTimeconstraintUsers2: string[] = [];
        timeconstraintUsers2.forEach((activity: string) => {
          const userIndex = sheetData.activitiesData.findIndex(
            (l: any) => l.label?.toLowerCase() === activity?.toLowerCase(),
          );
          if (userIndex === -1) {
            wrongTimeconstraintUsers2.push(activity);
          }
        });
        wrongTimeconstraintUsers2 = [...new Set(wrongTimeconstraintUsers2)];

        // Validate min/max
        let invalidMinMax: string[] = [];
        timeconstraints.forEach((timeconstraint: any, index: number) => {
          const { min, max } = timeconstraint;
          const isValidMinMax = max >= min;
          if (!isValidMinMax) {
            invalidMinMax.push(`Column ${index + 2}: min: ${min}, max: ${max}`);
          }
        });

        // Validate start
        const start = timeconstraints.map(
          (timeconstraint: any) => timeconstraint.start,
        );
        let wrongStartDates: string[] = [];
        start.forEach((time: string) => {
          const isValidTime = isValidDateTime(time);
          if (!isValidTime) {
            wrongStartDates.push(time);
          }
        });

        // Validate start
        const end = timeconstraints.map(
          (timeconstraint: any) => timeconstraint.end,
        );
        let wrongEndDates: string[] = [];
        end.forEach((time: string) => {
          const isValidTime = isValidDateTime(time);
          if (!isValidTime) {
            wrongEndDates.push(time);
          }
        });

        if (wrongTimeconstraintUsers1.length) {
          setErrorMessage(
            'Invalid user1 values for timeconstraints table',
            wrongTimeconstraintUsers1,
          );
          isAllDataValid = false;
        }
        // if (wrongTimeconstraintUsers2.length) {
        //   setErrorMessage(
        //     'Invalid activity values for timeconstraints table',
        //     wrongTimeconstraintUsers2,
        //   );
        //   isAllDataValid = false;
        // }
        if (invalidMinMax.length) {
          setErrorMessage(
            'Invalid min/max values for timeconstraints table',
            invalidMinMax,
          );
          isAllDataValid = false;
        }
        if (wrongStartDates.length) {
          setErrorMessage(
            'Invalid start date values for timeconstraints table',
            wrongStartDates,
          );
          isAllDataValid = false;
        }
        if (wrongEndDates.length) {
          setErrorMessage(
            'Invalid end date values for timeconstraints table',
            wrongEndDates,
          );
          isAllDataValid = false;
        }

        // Validate start and end diff
        let invalidStartEndTimes: string[] = [];
        const dateFormat = 'MM/DD/YYYY';
        timeconstraints.forEach((timeconstraint: any) => {
          const { start, end } = timeconstraint;

          const updatedStart = moment(start).add(1, 'hours');
          const updatedEnd = moment(end).add(1, 'hours');
          const isValidTime = isSameOrBefore(updatedStart, updatedEnd);
          if (!isValidTime) {
            invalidStartEndTimes.push(
              `${moment(updatedStart).format(dateFormat)} - ${moment(
                updatedEnd,
              ).format(dateFormat)}`,
            );
          }
        });

        // Validate unit
        const units = timeconstraints.map(
          (timeconstraint: any) => timeconstraint.unit,
        );
        const unitsData = [
          { value: 'Hours', label: 'Hours' },
          { value: 'Minutes', label: 'Minutes' },
          { value: 'Seconds', label: 'Seconds' },
          { value: 'Units', label: 'Units' },
        ];

        let wrongUnits: string[] = [];
        units.forEach((unit: string) => {
          const unitIndex = unitsData.findIndex(
            (val: any) => val.label?.toLowerCase() === unit.toLowerCase(),
          );
          if (unitIndex === -1) {
            wrongUnits.push(unit);
          }
        });
        wrongUnits = [...new Set(wrongUnits)];

        // Validate frequency
        const frequencies = timeconstraints.map(
          (timeconstraint: any) => timeconstraint.frequency,
        );
        const frequencyData = [
          // { value: 'Per Session', label: 'Per Session' },
          { value: 'Total', label: 'Total' },
          { value: 'Daily', label: 'Daily' },
          { value: 'Weekly', label: 'Weekly' },
          { value: 'Monthly', label: 'Monthly' },
          { value: 'Annually', label: 'Annually' },
        ];

        let wrongFrequencies: string[] = [];
        frequencies.forEach((frequency: string) => {
          const frequencyIndex = frequencyData.findIndex(
            (val: any) => val.label?.toLowerCase() === frequency.toLowerCase(),
          );
          if (frequencyIndex === -1) {
            wrongFrequencies.push(frequency);
          }
        });
        wrongFrequencies = [...new Set(wrongFrequencies)];

        if (invalidStartEndTimes.length) {
          setErrorMessage(
            'Invalid start and end dates for timeconstraints table',
            invalidStartEndTimes,
          );
          isAllDataValid = false;
        }
        if (wrongUnits.length) {
          setErrorMessage(
            'Invalid unit values for timeconstraints table',
            wrongUnits,
          );
          isAllDataValid = false;
        }
        if (wrongFrequencies.length) {
          setErrorMessage(
            'Invalid frequency values for timeconstraints table',
            wrongFrequencies,
          );
          isAllDataValid = false;
        }
      }
    }

    if (isAllDataValid) {
      // Prepare resource object
      let invalidAddresses: any[] = [];
      let newResourcesData: any[] = [];
      if (resourceType === 'Client') {
        for (const client of data.clients) {
          let updatedClientObj = {
            ...client,
            password: passwordGenerator(),
            branches: [
              ...new Set(
                client.branches
                  .split(',')
                  .map((branch: string) => branch.trim()),
              ),
            ],
            roles: [client.roles.split(',')[0].trim()],
            subgroups: client.subgroups
              ? [
                  ...new Set(
                    client.subgroups
                      .split(',')
                      .map((subgroup: string) => subgroup.trim()),
                  ),
                ]
              : [],
            credentialFunders: client.credentialFunders
              ? [
                  ...new Set(
                    client.credentialFunders
                      .split(',')
                      .map((val: string) => val.trim()),
                  ),
                ]
              : [],
          };
          // Validate address
          if (client.address) {
            const coords = await checkAddressLatLon(client.address);
            if (coords) {
              updatedClientObj.longitude = coords.lng;
              updatedClientObj.latitude = coords.lat;
              updatedClientObj.address = client.address;
            } else {
              invalidAddresses.push(client.address);
            }
          }
          updatedClientObj.branches = updatedClientObj.branches.map(
            (branch: string) => {
              const findBranch = sheetData.branches.find(
                (val: any) => val.label.toLowerCase() === branch.toLowerCase(),
              );
              return findBranch?.id ?? '';
            },
          );
          updatedClientObj.roles = updatedClientObj.roles.map(
            (role: string) => {
              const findRole = sheetData.roles.find(
                (val: any) => val.label.toLowerCase() === role.toLowerCase(),
              );
              return findRole?.id ?? '';
            },
          );
          updatedClientObj.subgroups = updatedClientObj.subgroups.length
            ? updatedClientObj.subgroups.map((subgroup: string) => {
                const findRole = sheetData.subgroups.find(
                  (val: any) =>
                    val.label.toLowerCase() === subgroup.toLowerCase(),
                );
                return findRole?.id ?? '';
              })
            : [];
          updatedClientObj.credentialFunders =
            updatedClientObj.credentialFunders
              ? updatedClientObj.credentialFunders.map((f: string) => {
                  const findValue = sheetData.funders.find(
                    (val: any) => val.label.toLowerCase() === f.toLowerCase(),
                  );
                  return findValue?.id ?? '';
                })
              : [];
          newResourcesData.push(updatedClientObj);
        }
      }
      if (resourceType === 'Employee') {
        for (const employee of data.employees) {
          let updatedEmpObj = {
            ...employee,
            password: passwordGenerator(),
            branches: [
              ...new Set(
                employee.branches
                  .split(',')
                  .map((branch: string) => branch.trim()),
              ),
            ],
            roles: [employee.roles.split(',')[0].trim()],
            credentialFunders: employee.credentialFunders
              ? [
                  ...new Set(
                    employee.credentialFunders
                      .split(',')
                      .map((val: string) => val.trim()),
                  ),
                ]
              : [],
            subgroups: employee.subgroups
              ? [
                  ...new Set(
                    employee.subgroups
                      .split(',')
                      .map((subgroup: string) => subgroup.trim()),
                  ),
                ]
              : [],
          };
          // Validate address
          if (employee.address) {
            const coords = await checkAddressLatLon(employee.address);
            if (coords) {
              updatedEmpObj.longitude = coords.lng;
              updatedEmpObj.latitude = coords.lat;
              updatedEmpObj.address = employee.address;
            } else {
              invalidAddresses.push(employee.address);
            }
          }
          updatedEmpObj.branches = updatedEmpObj.branches.map(
            (branch: string) => {
              const findBranch = sheetData.branches.find(
                (val: any) => val.label.toLowerCase() === branch.toLowerCase(),
              );
              return findBranch?.id ?? '';
            },
          );
          updatedEmpObj.roles = updatedEmpObj.roles.map((role: string) => {
            const findRole = sheetData.roles.find(
              (val: any) => val.label.toLowerCase() === role.toLowerCase(),
            );
            return findRole?.id ?? '';
          });
          updatedEmpObj.credentialFunders = updatedEmpObj.credentialFunders
            ? updatedEmpObj.credentialFunders.map((f: string) => {
                const findValue = sheetData.funders.find(
                  (val: any) => val.label.toLowerCase() === f.toLowerCase(),
                );
                return findValue?.id ?? '';
              })
            : [];
          updatedEmpObj.subgroups = updatedEmpObj.subgroups
            ? updatedEmpObj.subgroups.map((subgroup: string) => {
                const findRole = sheetData.subgroups.find(
                  (val: any) =>
                    val.label.toLowerCase() === subgroup.toLowerCase(),
                );
                return findRole?.id ?? '';
              })
            : [];
          newResourcesData.push(updatedEmpObj);
        }
      }
      if (resourceType === 'Activity') {
        for (const activity of data.activities) {
          let updatedEmpObj = {
            ...activity,
            firstName: activity.name,
            color: null,
            branches: [
              ...new Set(
                activity.branches
                  .split(',')
                  .map((branch: string) => branch.trim()),
              ),
            ],
          };
          updatedEmpObj.branches = updatedEmpObj.branches.map(
            (branch: string) => {
              const findBranch = sheetData.branches.find(
                (val: any) => val.label.toLowerCase() === branch.toLowerCase(),
              );
              return findBranch?.id ?? [];
            },
          );
          newResourcesData.push(updatedEmpObj);
        }
      }
      if (resourceType === 'Block') {
        for (const block of data.blocks) {
          let updatedEmpObj = {
            ...block,
            firstName: block.name,
            branches: [
              ...new Set(
                block.branches
                  .split(',')
                  .map((branch: string) => branch.trim()),
              ),
            ],
          };
          updatedEmpObj.branches = updatedEmpObj.branches.map(
            (branch: string) => {
              const findBranch = sheetData.branches.find(
                (val: any) => val.label.toLowerCase() === branch.toLowerCase(),
              );
              return findBranch?.id ?? '';
            },
          );
          newResourcesData.push(updatedEmpObj);
        }
      }
      if (resourceType === 'Funder') {
        for (const funder of data.funders) {
          let updatedEmpObj = {
            ...funder,
            firstName: funder.name,
            branches: [
              ...new Set(
                funder.branches
                  .split(',')
                  .map((branch: string) => branch.trim()),
              ),
            ],
            roster: funder.roster
              ? [
                  ...new Set(
                    funder.roster.split(',').map((val: string) => val.trim()),
                  ),
                ]
              : [],
            credential: funder.credential
              ? [
                  ...new Set(
                    funder.credential
                      .split(',')
                      .map((val: string) => val.trim()),
                  ),
                ]
              : [],
          };
          updatedEmpObj.branches = updatedEmpObj.branches.map(
            (branch: string) => {
              const findBranch = sheetData.branches.find(
                (val: any) => val.label.toLowerCase() === branch.toLowerCase(),
              );
              return findBranch?.id ?? '';
            },
          );
          updatedEmpObj.roster = updatedEmpObj.roster
            ? updatedEmpObj.roster.map((f: string) => {
                const findValue = sheetData.roles.find(
                  (val: any) => val.label.toLowerCase() === f.toLowerCase(),
                );
                return findValue?.id ?? '';
              })
            : [];
          updatedEmpObj.credential = updatedEmpObj.credential
            ? updatedEmpObj.credential.map((f: string) => {
                const findValue = sheetData.roles.find(
                  (val: any) => val.label.toLowerCase() === f.toLowerCase(),
                );
                return findValue?.id ?? '';
              })
            : [];
          newResourcesData.push(updatedEmpObj);
        }
      }
      if (resourceType === 'Location') {
        let invalidAddresses: any[] = [];
        for (const location of data.locations) {
          let updatedEmpObj = {
            ...location,
            firstName: location.name,
            color: null,
            branches: [
              ...new Set(
                location.branches
                  .split(',')
                  .map((branch: string) => branch.trim()),
              ),
            ],
            roles: [location.roles.split(',')[0].trim()],
            subgroups: location.subgroups
              ? [
                  ...new Set(
                    location.subgroups
                      .split(',')
                      .map((subgroup: string) => subgroup.trim()),
                  ),
                ]
              : [],
            roomparent: location.roomparent
              ? [
                  ...new Set(
                    location.roomparent
                      .split(',')
                      .map((val: string) => val.trim()),
                  ),
                ]
              : [],
            rooms: location.rooms
              ? [
                  ...new Set(
                    location.rooms.split(',').map((val: string) => val.trim()),
                  ),
                ]
              : [],
          };
          // Validate address
          if (location.address) {
            const coords = await checkAddressLatLon(location.address);
            if (coords) {
              updatedEmpObj.longitude = coords.lng;
              updatedEmpObj.latitude = coords.lat;
              updatedEmpObj.address = location.address;
            } else {
              invalidAddresses.push(location.address);
            }
          }
          updatedEmpObj.branches = updatedEmpObj.branches.map(
            (branch: string) => {
              const findBranch = sheetData.branches.find(
                (val: any) => val.label.toLowerCase() === branch.toLowerCase(),
              );
              return findBranch?.id ?? '';
            },
          );
          updatedEmpObj.roles = updatedEmpObj.roles.map((role: string) => {
            const findRole = sheetData.roles.find(
              (val: any) => val.label.toLowerCase() === role.toLowerCase(),
            );
            return findRole?.id ?? '';
          });
          updatedEmpObj.subgroups = updatedEmpObj.subgroups
            ? updatedEmpObj.subgroups.map((subgroup: string) => {
                const findRole = sheetData.subgroups.find(
                  (val: any) =>
                    val.label.toLowerCase() === subgroup.toLowerCase(),
                );
                return findRole?.id ?? '';
              })
            : [];
          updatedEmpObj.roomparent = updatedEmpObj.roomparent
            ? updatedEmpObj.roomparent.map((r: string) => {
                const findVal = sheetData.locationsData.find(
                  (val: any) => val.label.toLowerCase() === r.toLowerCase(),
                );
                return findVal?.id ?? '';
              })
            : [];
          updatedEmpObj.rooms = updatedEmpObj.rooms
            ? updatedEmpObj.rooms.map((r: string) => {
                const findVal = sheetData.users.find(
                  (val: any) => val.label.toLowerCase() === r.toLowerCase(),
                );
                return findVal?.id ?? '';
              })
            : [];
          newResourcesData.push(updatedEmpObj);
        }
      }

      if (invalidAddresses.length) {
        setErrorMessage('Invalid address values', invalidAddresses);
        setInvalidFileModal(true);
        setImportLoading(false);
        return;
      }

      // Prepare availabilities object
      let newAvailabilitiesData: any[] = [];
      if (isAvailabilitiesNotEmpty) {
        data.availabilities.forEach((availability: any) => {
          const startTime = moment(availability.startTime).format(
            '2022-02-28 HH:mm:ss',
          );
          const endTime = moment(availability.endTime).format(
            '2022-02-28 HH:mm:ss',
          );
          const startUtc = moment(startTime).format();
          const endUtc = moment(endTime).format();

          let updatedAvailabilityObj = {
            ...availability,
            available: true,
            startRange: moment(availability.startRange).format(),
            endRange: moment(availability.endRange).format(),
            startTime: moment(startUtc).utcOffset(0).format(),
            endTime: moment(endUtc).utcOffset(0).format(),
            days: [
              ...new Set(
                availability.days.split(',').map((day: string) => day.trim()),
              ),
            ],
            location2: availability.location2
              ? [
                  ...new Set(
                    availability.location2
                      .split(',')
                      .map((location: string) => location.trim()),
                  ),
                ]
              : [],
          };
          updatedAvailabilityObj.days = updatedAvailabilityObj.days.map(
            (day: string) => {
              const findDay = daysOfWeek.find(
                (val: any) => val.label.toLowerCase() === day.toLowerCase(),
              );
              return findDay?.value ?? '';
            },
          );
          updatedAvailabilityObj.location2 = updatedAvailabilityObj.location2
            .length
            ? updatedAvailabilityObj.location2.map((loc: string) => {
                const findLocation = sheetData.locationsData.find(
                  (val: any) => val.label.toLowerCase() === loc.toLowerCase(),
                );
                return findLocation?.id ?? '';
              })
            : [];
          updatedAvailabilityObj.timezone = updatedAvailabilityObj.timezone
            ? getTimeZones().find(
                (tz: TimezoneType) =>
                  tz.label.toLowerCase() ===
                  updatedAvailabilityObj.timezone?.toLowerCase(),
              )?.id
            : '';
          updatedAvailabilityObj.startTime = updatedAvailabilityObj.timezone
            ? convertToSpecificTimezone(
                updatedAvailabilityObj.startTime,
                updatedAvailabilityObj.timezone,
              )
            : moment(updatedAvailabilityObj.startTime).format();
          updatedAvailabilityObj.endTime = updatedAvailabilityObj.timezone
            ? convertToSpecificTimezone(
                updatedAvailabilityObj.endTime,
                updatedAvailabilityObj.timezone,
              )
            : moment(updatedAvailabilityObj.endTime).format();
          newAvailabilitiesData.push(updatedAvailabilityObj);
        });
      }

      // Prepare priorities object
      let newPrioritiesData: any[] = [];
      if (isPrioritiesNotEmpty) {
        data.priorities.forEach((priority: any) => {
          let updatedPriorityObj = {
            ...priority,
          };
          updatedPriorityObj.user2 =
            sheetData.users.find(
              (val: any) =>
                val.label.toLowerCase() ===
                updatedPriorityObj.user2.toLowerCase(),
            )?.id ?? '';
          newPrioritiesData.push(updatedPriorityObj);
        });
      }

      // Prepare timeconstraints object
      let newTimeconstraintsData: any[] = [];
      if (isTimeconstraintsNotEmpty) {
        data.timeconstraints.forEach((timeconstraint: any) => {
          let updatedTimeconstrainObj = {
            ...timeconstraint,
            start: moment(timeconstraint.start).format(),
            end: moment(timeconstraint.end).format(),
            min: String(timeconstraint.min),
            max: String(timeconstraint.max),
            offset: timeconstraint.offset
              ? Number(timeconstraint.offset)
              : null,
          };
          updatedTimeconstrainObj.user2 =
            sheetData.activitiesData.find(
              (val: any) =>
                val.label.toLowerCase() ===
                updatedTimeconstrainObj.activity?.toLowerCase(),
            )?.id ?? '';
          newTimeconstraintsData.push(updatedTimeconstrainObj);
        });
      }

      const values = {
        resources: newResourcesData.map((r) => ({
          ...r,
          resourceName: resourceType,
        })),
        availabilities: newAvailabilitiesData,
        priorities: newPrioritiesData,
        timeconstraints: newTimeconstraintsData,
      };

      setImportFileData(values);
      setPasswordActionModal(true);
    } else {
      setInvalidFileModal(true);
    }

    setImportLoading(false);
  };
  const handleSubmitImportFileData = async (password: string) => {
    if (password !== import.meta.env.REACT_APP_IMPORT_FILE_PASSWORD) {
      return toast.error('Wrong password!');
    }
    if (importFileData) {
      setImportSubmittingLoading(true);
      try {
        await axios.post('/users/form-sheet', { data: importFileData });
        dispatch(
          actions.doFetch(
            {
              limit: 10,
              page: 1,
            },
            resourceType,
          ),
        );
      } catch (err: any) {
        const msg = err?.response?.data;
        if (msg) {
          toast.error(msg);
        } else {
          toast.error('Something went wrong. Try again');
        }
      } finally {
        setImportSubmittingLoading(false);
        setPasswordActionModal(false);
      }
    } else {
      toast.error('Something went wrong. Try again');
    }
  };

  const formatResourceData = (rows: any) => {
    if (resourceType === 'Employee') {
      return rows.map((row: any) => ({
        'First Name': row.firstName,
        'Last Name': row.lastName,
        'Phone Number': row.phoneNumber,
        'E-mail': row.email,
        Roles: row?.roles.map((role: any) => role.name).join(', '),
        Branches: row?.branches.map((branch: any) => branch.name).join(', '),
        Address: row.address,
        Disabled: row.disabled ? 'Yes' : 'No',

        'ID Custom': row.idCustom ?? '',
        'ID Custom2': row.idCustom2 ?? '',
      }));
    }
    if (resourceType === 'Client') {
      return rows.map((row: any) => ({
        'First Name': row.firstName,
        'Last Name': row.lastName,
        'Phone Number': row.phoneNumber,
        'E-mail': row.email,
        Subgroups: row?.subgroups
          .map((subgroup: any) => subgroup.name)
          .join(', '),
        Roles: row?.roles.map((role: any) => role.name).join(', '),
        Branches: row?.branches.map((branch: any) => branch.name).join(', '),
        Address: row.address,
        Disabled: row.disabled ? 'Yes' : 'No',

        'ID Custom': row.idCustom ?? '',
        'ID Custom2': row.idCustom2 ?? '',
      }));
    }
    if (resourceType === 'Funder') {
      return rows.map((row: any) => ({
        Name: row?.firstName,
        Branches: row?.branches.map((branch: any) => branch.name).join(', '),
        Credential: row?.credential
          .map((credential: any) => credential.name)
          .join(', '),
        Roster: row?.roster.map((roster: any) => roster.name).join(', '),
        Disabled: row.disabled ? 'Yes' : 'No',
      }));
    }
    if (resourceType === 'Location') {
      return rows.map((row: any) => ({
        Name: row?.firstName,
        'Room Parents': row?.roomparent
          .map((roomparent: any) => roomparent.firstName)
          .join(', '),
        Rooms: row?.rooms.map((rooms: any) => rooms.firstName).join(', '),
        Capacity: row?.capacity,
        Color: row?.color,
        'Phone Number': row.phoneNumber,
        'E-mail': row.email,
        Roles: row?.roles.map((role: any) => role.name).join(', '),
        Branches: row?.branches.map((branch: any) => branch.name).join(', '),
        Address: row.address,
        Disabled: row.disabled ? 'Yes' : 'No',
      }));
    }
    if (resourceType === 'Block') {
      return rows.map((row: any) => ({
        Name: row?.firstName,
        Branches: row?.branches.map((branch: any) => branch.name).join(', '),
        Disabled: row.disabled ? 'Yes' : 'No',
      }));
    }
    if (resourceType === 'Activity') {
      return rows.map((row: any) => ({
        Name: row?.firstName,
        Color: row?.color,
        Branches: row?.branches.map((branch: any) => branch.name).join(', '),
        Billable: row.billable ? 'Yes' : 'No',
        Paid: row.paid ? 'Yes' : 'No',
        NotWorking: row.notWorking ? 'Yes' : 'No',
        Auth: row.auth ? 'Yes' : 'No',
        Priority: row.priority,
        Disabled: row.disabled ? 'Yes' : 'No',
      }));
    }
  };
  const handleExportUsersTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    try {
      const response = await axios.get(`/users/resources/${resourceType}`, {
        params: filter,
      });
      const formattedData = formatResourceData(response.data.rows);
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };
  const handleExportClientsSheet = async () => {
    const data = await fetchUsersSheetData(resourceType);
    return data;
  };

  return (
    <div>
      <Widget className='widget-p-md' title={<h4>{resourceType}</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(
              currentUser,
              resourceType === 'Activity' ? 'createActivity' : 'createUser',
            ) && (
              <Link to={`/admin/users/resources/${resourceType}/new`}>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
            {/* XLSX */}
            <div style={{ display: 'none' }}>
              <ImportSheetsButton
                sheetsValidationSchema={formatUsersSheetsValidationSchema(
                  resourceType,
                )}
                importLoading={importLoading}
                handleUpload={handleImportClients}
              />
              <ExportSheetButton
                name={resourceType}
                exportShema={formatUsersSheetsExportSchema(resourceType)}
                handleExport={handleExportClientsSheet}
              />
            </div>
          </Stack>
          <ExportTableButton
            name={resourceType}
            handleExport={handleExportUsersTable}
          />
        </Stack>

        {/* Table */}
        {localLoading || settingsLoading ? (
          <Loader />
        ) : (
          <DynamicTable
            key={resourceType}
            columns={columns}
            rows={rows}
            loading={loading}
            count={count}
            type={resourceType}
            fetchData={(filterObj: any) => {
              setLocalFilters(filterObj);
              dispatch(actions.doFetch(filterObj, resourceType));
            }}
            defaultColumnFilters={defaultColumnFilters as any}
          />
        )}
      </Widget>

      <TableConfirmModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleDelete={handleDelete}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        type='delete'
      />

      <ImportFilePasswordConfirmModal
        name={resourceType}
        loading={importSubmittingLoading}
        passwordActionModal={passwordActionModal}
        togglePasswordActionModal={() =>
          setPasswordActionModal((prev) => !prev)
        }
        onSubmit={handleSubmitImportFileData}
      />
      <SheetErrorModal
        isOpen={invalidFileModal}
        toggleModal={toggleInvalidFileModal}
        fileErrors={fileErrors}
      />
    </div>
  );
};

export default UsersTable;
