/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line
import actions from 'store/actions/subgroups/subgroupsListActions';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Stack, Typography } from '@mui/material';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import role_permissions from 'helpers/role_permissions';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';
import TAGS_TYPES_WITH_ICONS from 'pages/calendar/utils/tagsWithIcons';
import { TagValueTypes } from 'pages/CRUD/CustomConstraints/helpers/customTypes';
import Loader from 'components/Loader/Loader';

const SubgroupsTable = ({ groupType }: { groupType: string }) => {
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const loading = useTypedSelector((store) => store.subgroups.list.loading);
  const rows = useTypedSelector((store) => store.subgroups.list.rows);
  const count = useTypedSelector((store) => store.subgroups.list.count);
  const modalOpen = useTypedSelector((store) => store.subgroups.list.modalOpen);
  const idToDelete = useTypedSelector(
    (store) => store.subgroups.list.idToDelete,
  );
  const settingsValuesSelectedBranches = useTypedSelector(
    (state) => state.settings.settingValues.selectedBranches,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [branchesOptions, setBranchesOptions] = useState<any[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const localLoading = branchesLoading;
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
  }, []);

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editSubgroups'
        deletePermissionType='deleteSubgroup'
        editEvent={() =>
          navigate(`/admin/subgroups/groupings/${groupType}/${cell}/edit`)
        }
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
        enableSorting: false,
        enableColumnFilter: false,
        size: 80,
      },
      {
        accessorKey: 'name',
        enablePinning: false,
        header: 'Name',
        enableColumnFilter: true,
      },
      {
        accessorFn: (row: any) => row.group?.name,
        id: 'group',
        header: 'Group',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          if (row.row.original?.group) {
            return row.row.original.group.name;
          }
          return '';
        },
      },
      {
        accessorFn: (row: any) => row.branch?.name,
        id: 'branch',
        header: 'Branch',
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: branchesOptions,
        Cell: (row: any) => {
          const branch = row.row.original?.branch;
          if (branch) {
            return (
              <Link to={`/admin/branches/${branch.id}`}>
                <Typography>{branch.name}</Typography>
              </Link>
            );
          }
          return '';
        },
      },
      {
        accessorFn: (row: any) => row.user?.name,
        id: 'user',
        header: 'Users',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const users = row.row.original.user;
          if (users && users.length > 0) {
            return (
              <>
                {users.slice(0, 5).map((user: any, index: number) => {
                  if (users.length > 4 && index === 4) {
                    return <p key={index}>More...</p>;
                  }
                  return (
                    <Link to={`/admin/users/${user.id}`} key={user.id}>
                      <Typography>
                        {user.firstName} {user.lastName ?? ''}
                      </Typography>
                    </Link>
                  );
                })}
              </>
            );
          }
        },
      },
      {
        accessorFn: (row: any) => row.group?.name,
        id: 'iconName',
        header: 'Icon Name',
        enableSorting: false,
        Cell: (row: any) => {
          let iconName: any = null;
          const record = row.row.original;
          if (record?.iconName) {
            const selectedIcon = TAGS_TYPES_WITH_ICONS.find(
              (opt) => opt.value === (record.iconName as TagValueTypes),
            );
            iconName = selectedIcon;
          }
          if (iconName) {
            return (
              <Stack flexDirection='row' alignItems='center' columnGap={1}>
                {iconName.icon && iconName.icon}
                {iconName.value}
              </Stack>
            );
          }
          return '';
        },
      },
    ],
    [groupType, branchesOptions],
  );

  const handleDelete = () => {
    const id = idToDelete;
    dispatch(actions.doDelete(id!, groupType));
  };

  const openModal = (event: React.MouseEvent, cell: string) => {
    const id = cell;
    event.stopPropagation();
    dispatch(actions.doOpenConfirm(id));
  };

  const closeModal = () => {
    dispatch(actions.doCloseConfirm());
  };

  const handleExportSubgroupsTable = async () => {
    try {
      const response = await axios.get(`/subgroups/groupings/${groupType}`);
      const formattedData = response.data.rows.map((row: any) => ({
        Name: row.name,
        Group: row.group?.name,
        Users: row.user
          ?.map((user: any) => user.firstName + ' ' + user.lastName)
          .join(', '),
        'All Branches': row?.allbranches ? 'Yes' : 'No',
      }));
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };
  const defaultSelectedBranchesOption = useMemo(() => {
    const findUsersBranch =
      Array.isArray(settingsValuesSelectedBranches) &&
      settingsValuesSelectedBranches.length > 0
        ? branchesOptions.find(
            (t: any) => t.value === settingsValuesSelectedBranches[0].id,
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
              id: 'branch',
              value: defaultSelectedBranchesOption.value,
            },
          ]
        : [],
    [defaultSelectedBranchesOption],
  );

  return (
    <div>
      <Widget className='widget-p-md' title={<h4>{groupType}</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            {role_permissions(currentUser, 'createSubgroup') && (
              <Link to={`/admin/subgroups/groupings/${groupType}/new`}>
                <CustomButton type='button'>New</CustomButton>
              </Link>
            )}
          </Stack>
          <ExportTableButton
            name={groupType}
            handleExport={handleExportSubgroupsTable}
          />
        </Stack>
        {/* Table */}
        {localLoading ? (
          <Loader />
        ) : (
          <DynamicTable
            columns={columns}
            rows={rows}
            loading={loading}
            count={count}
            type={groupType}
            fetchData={(filterObj: any) =>
              dispatch(actions.doFetch(filterObj, groupType))
            }
            defaultColumnFilters={defaultColumnFilters as any}
          />
        )}
      </Widget>

      <TableDeleteModal
        isOpen={modalOpen}
        toggleModal={closeModal}
        handleConfirm={handleDelete}
      />
    </div>
  );
};

export default SubgroupsTable;
