/* eslint-disable react-hooks/exhaustive-deps */
import actions from 'store/actions/roles/rolesListActions';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { useNavigate } from 'react-router';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import ActionFormatter from 'components/ActionButtons/ActionFormatter';
import { Chip, Stack, Typography } from '@mui/material';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import CustomButton from 'components/Button';
import TableDeleteModal from 'components/TableDeleteModal/TableDeleteModal';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import axios from 'axios';
import { toast } from 'react-toastify';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';
import { STANDARD_ROLES_MAP } from '../helpers/standardRolesOptions';

const RolesTable = ({ resourceType }: { resourceType: any }) => {
  const loading = useTypedSelector((store) => store.roles.list.loading);
  const rows = useTypedSelector((store) => store.roles.list.rows);
  const count = useTypedSelector((store) => store.roles.list.count);
  const modalOpen = useTypedSelector((store) => store.roles.list.modalOpen);
  const idToDelete = useTypedSelector((store) => store.roles.list.idToDelete);
  const membership = useTypedSelector(
    (state) => state.settings.settingsCompany.company.membership,
  );

  const isEmployeeOrClient = ['Employee', 'Client'].includes(resourceType);
  const isEmployee = resourceType === 'Employee';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const actionFormatter = (cell: string) => {
    return (
      <ActionFormatter
        editPermissionType='editRole'
        deletePermissionType='deleteRole'
        editEvent={() =>
          navigate(`/admin/roles/resources/${resourceType}/${cell}/edit`)
        }
        deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
      />
    );
  };

  const newColumns = useMemo(() => {
    let arr = [
      {
        accessorKey: 'id',
        header: '',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
          return actionFormatter(renderedCellValue);
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorFn: (row: any) => row.parent?.name,
        id: 'parent',
        header: 'Parent',
        Cell: (row: any) => {
          const parent = row.row.original?.parent;
          if (parent) {
            return <Chip label={parent.name} variant='outlined' />;
          }
          return;
        },
      },
      ...(isEmployeeOrClient
        ? [
            {
              accessorFn: (row: any) => row.standardRoles,
              id: 'standardRoles',
              header: 'Standard Role',
              enableSorting: false,
              Cell: (row: any) => {
                const standardRoles = row.row.original?.standardRoles;
                if (STANDARD_ROLES_MAP[standardRoles]) {
                  return (
                    <Chip
                      label={STANDARD_ROLES_MAP[standardRoles]}
                      variant='outlined'
                    />
                  );
                }
                return;
              },
            },
          ]
        : []),
      {
        accessorKey: 'dataAccess',
        header: 'Data Access',
      },
      ...(isEmployee
        ? [
            {
              accessorFn: (row: any) => row.supervisor,
              id: 'supervisor',
              header: 'Supervisor',
              enableSorting: false,
              Cell: (row: any) => {
                const data = row.row.original.supervisor;
                return <Typography>{data ? 'Yes' : 'No'}</Typography>;
              },
            },
            {
              accessorFn: (row: any) => row.clockInOut,
              id: 'clockInOut',
              header: 'Can Clock In/Out',
              Cell: (row: any) => {
                const data = row.row.original.clockInOut;
                return <Typography>{data ? 'Yes' : 'No'}</Typography>;
              },
            },
          ]
        : []),
      {
        accessorFn: (row: any) => row.createEvent?.name,
        id: 'createEvent',
        header: 'Create Event',
        Cell: (row: any) => {
          const data = row.row.original.createEvent;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editEvent?.name,
        id: 'editEvent',
        header: 'Edit Event',
        Cell: (row: any) => {
          const data = row.row.original.editEvent;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteEvent?.name,
        id: 'deleteEvent',
        header: 'Delete Event',
        Cell: (row: any) => {
          const data = row.row.original.deleteEvent;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createUser?.name,
        id: 'createUser',
        header: 'Create User',
        Cell: (row: any) => {
          const data = row.row.original.createUser;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editUser?.name,
        id: 'editUser',
        header: 'Edit User',
        Cell: (row: any) => {
          const data = row.row.original.editUser;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteUser?.name,
        id: 'deleteUser',
        header: 'Delete User',
        Cell: (row: any) => {
          const data = row.row.original.deleteUser;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createActivity,
        id: 'createActivity',
        header: 'Create Activity',
        Cell: (row: any) => {
          const data = row.row.original.createActivity;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editActivity,
        id: 'editActivity',
        header: 'Edit Activity',
        Cell: (row: any) => {
          const data = row.row.original.editActivity;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createCancelation?.name,
        id: 'createCancelation',
        header: 'Create Cancellation',
        Cell: (row: any) => {
          const data = row.row.original.createCancelation;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteCancelation?.name,
        id: 'deleteCancelation',
        header: 'Delete Cancellation',
        Cell: (row: any) => {
          const data = row.row.original.deleteCancelation;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createAvailability?.name,
        id: 'createAvailability',
        header: 'Create Availability',
        Cell: (row: any) => {
          const data = row.row.original.createAvailability;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editAvailability?.name,
        id: 'editAvailability',
        header: 'Edit Availability',
        Cell: (row: any) => {
          const data = row.row.original.editAvailability;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.adminPushNotification?.name,
        id: 'adminPushNotification',
        header: 'Admin Push Notification',
        Cell: (row: any) => {
          const data = row.row.original.adminPushNotification;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteAvailability?.name,
        id: 'deleteAvailability',
        header: 'Delete Availability',
        Cell: (row: any) => {
          const data = row.row.original.deleteAvailability;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewReport?.name,
        id: 'viewReport',
        header: 'View Report',
        Cell: (row: any) => {
          const data = row.row.original.viewReport;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewRole?.name,
        id: 'viewRole',
        header: 'View Role',
        Cell: (row: any) => {
          const data = row.row.original.viewRole;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createRole?.name,
        id: 'createRole',
        header: 'Create Role',
        Cell: (row: any) => {
          const data = row.row.original.createRole;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editRole?.name,
        id: 'editRole',
        header: 'Edit Role',
        Cell: (row: any) => {
          const data = row.row.original.editRole;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteRole?.name,
        id: 'deleteRole',
        header: 'Delete Role',
        Cell: (row: any) => {
          const data = row.row.original.deleteRole;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewUser?.name,
        id: 'viewUser',
        header: 'View User',
        Cell: (row: any) => {
          const data = row.row.original.viewUser;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewAvailability?.name,
        id: 'viewAvailability',
        header: 'View Availability',
        Cell: (row: any) => {
          const data = row.row.original.viewAvailability;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewCancelation?.name,
        id: 'viewCancelation',
        header: 'View Cancellation',
        Cell: (row: any) => {
          const data = row.row.original.viewCancelation;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createBranch?.name,
        id: 'createBranch',
        header: 'Create Branch',
        Cell: (row: any) => {
          const data = row.row.original.createBranch;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editBranch?.name,
        id: 'editBranch',
        header: 'Edit Branch',
        Cell: (row: any) => {
          const data = row.row.original.editBranch;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteBranch?.name,
        id: 'deleteBranch',
        header: 'Delete Branch',
        Cell: (row: any) => {
          const data = row.row.original.deleteBranch;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewBranch?.name,
        id: 'viewBranch',
        header: 'View Branch',
        Cell: (row: any) => {
          const data = row.row.original.viewBranch;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createConstraint?.name,
        id: 'createConstraint',
        header: 'Create Constraint',
        Cell: (row: any) => {
          const data = row.row.original.createConstraint;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editConstraint?.name,
        id: 'editConstraint',
        header: 'Edit Constraint',
        Cell: (row: any) => {
          const data = row.row.original.editConstraint;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteConstraint?.name,
        id: 'deleteConstraint',
        header: 'Delete Constraint',
        Cell: (row: any) => {
          const data = row.row.original.deleteConstraint;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewConstraint?.name,
        id: 'viewConstraint',
        header: 'View Constraint',
        Cell: (row: any) => {
          const data = row.row.original.viewConstraint;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.editSubgroups?.name,
        id: 'editSubgroups',
        header: 'Edit Subgroups',
        Cell: (row: any) => {
          const data = row.row.original.editSubgroups;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.createSubgroup?.name,
        id: 'createSubgroup',
        header: 'Create Subgroups',
        Cell: (row: any) => {
          const data = row.row.original.createSubgroup;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.deleteSubgroup?.name,
        id: 'deleteSubgroup',
        header: 'Delete Subgroups',
        Cell: (row: any) => {
          const data = row.row.original.deleteSubgroup;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.viewSubgroup?.name,
        id: 'viewSubgroup',
        header: 'View Subgroups',
        Cell: (row: any) => {
          const data = row.row.original.viewSubgroup;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.canEditEventSchedulerLocked?.name,
        id: 'canEditEventSchedulerLocked',
        header: 'Edit Locked Scheduler',
        Cell: (row: any) => {
          const data = row.row.original.canEditEventSchedulerLocked;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.canLockScheduler,
        id: 'canLockScheduler',
        header: 'Can Lock Scheduler',
        Cell: (row: any) => {
          const data = row.row.original.canLockScheduler;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.productivityInclude,
        id: 'productivityInclude',
        header: 'Productivity Include',
        Cell: (row: any) => {
          const data = row.row.original.productivityInclude;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.allowAlias,
        id: 'allowAlias',
        header: 'Allow Alias',
        Cell: (row: any) => {
          const data = row.row.original.allowAlias;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
      },
      {
        accessorFn: (row: any) => row.branchType?.name,
        id: 'branchType',
        header: 'Branch Type',
        enableSorting: false,
        Cell: (row: any) => {
          const branchType = row.row.original?.branchType;
          if (branchType) {
            return (
              <Link to={`/admin/branchtype/${branchType.id}/edit`}>
                {branchType.name}
              </Link>
            );
          }
          return;
        },
      },
    ];
    if (checkCompanyPlanFeature(membership, 'requests')) {
      arr = [
        ...arr,
        {
          accessorFn: (row: any) => row.requestCancelation?.name,
          id: 'requestCancelation',
          header: 'Request Cancellation on Mobile',
          Cell: (row: any) => {
            const data = row.row.original.requestCancelation;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },

        {
          accessorFn: (row: any) => row.requestTimeoff?.name,
          id: 'requestTimeoff',
          header: 'Request Timeoff on Mobile',
          Cell: (row: any) => {
            const data = row.row.original.requestTimeoff;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },

        {
          accessorFn: (row: any) => row.requestAvailability?.name,
          id: 'requestAvailability',
          header: 'Request Availability on Mobile',
          Cell: (row: any) => {
            const data = row.row.original.requestAvailability;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },

        {
          accessorFn: (row: any) => row.requestConfirmation?.name,
          id: 'requestConfirmation',
          header: 'Request Confirmation on Mobile',
          Cell: (row: any) => {
            const data = row.row.original.requestConfirmation;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },
        {
          accessorFn: (row: any) => row.requestsFeature,
          id: 'requestsFeature',
          header: 'Approvals Feature',
          Cell: (row: any) => {
            const data = row.row.original.requestsFeature;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },
        {
          accessorFn: (row: any) => row.enableRequestNotifications,
          id: 'enableRequestNotifications',
          header: 'Recieve Notifications on Request Updates',
          Cell: (row: any) => {
            const data = row.row.original.enableRequestNotifications;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },
      ];
    }
    if (checkCompanyPlanFeature(membership, 'optimizer')) {
      arr = [
        ...arr,
        {
          accessorFn: (row: any) => row.optimizerFeature,
          id: 'optimizerFeature',
          header: 'Optimizer Feature',
          Cell: (row: any) => {
            const data = row.row.original.optimizerFeature;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },
      ];
    }
    if (checkCompanyPlanFeature(membership, 'flagging')) {
      arr = [
        ...arr,
        {
          accessorFn: (row: any) => row.flaggingFeature,
          id: 'flaggingFeature',
          header: 'Flagging Feature',
          Cell: (row: any) => {
            const data = row.row.original.flaggingFeature;
            return <Typography>{data ? 'Yes' : 'No'}</Typography>;
          },
        },
      ];
    }

    return arr;
  }, [resourceType]);

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

  const handleExportRolesTable = async () => {
    try {
      const response = await axios.get(`/roles/resources/${resourceType}`);
      const formattedData = response.data.rows.map((row: any) => {
        return {
          Name: row?.name,
          Parent: row.parent?.name,
          'Data Access': row?.dataAccess,
          'Create Event': row?.createEvent ? 'Yes' : 'No',
          'Edit Event': row?.editEvent ? 'Yes' : 'No',
          'Delete Event': row?.deleteEvent ? 'Yes' : 'No',
          'Create User': row?.createUser ? 'Yes' : 'No',
          'Edit User': row?.editUser ? 'Yes' : 'No',
          'Delete User': row?.deleteUser ? 'Yes' : 'No',
          'Create Activity': row?.createActivity ? 'Yes' : 'No',
          'Edit Activity': row?.editActivity ? 'Yes' : 'No',
          'Create Cancelation': row?.createCancelation ? 'Yes' : 'No',
          'Delete Cancelation': row?.deleteCancelation ? 'Yes' : 'No',
          'Create Availability': row?.createAvailability ? 'Yes' : 'No',
          'Edit Availability': row?.editAvailability ? 'Yes' : 'No',
          'Delete Availability': row?.deleteAvailability ? 'Yes' : 'No',
          'View Report': row?.viewReport ? 'Yes' : 'No',
          'View Role': row?.viewRole ? 'Yes' : 'No',
          'Create Role': row?.createRole ? 'Yes' : 'No',
          'Edit Role': row?.editRole ? 'Yes' : 'No',
          'Delete Role': row?.deleteRole ? 'Yes' : 'No',
          'View User': row?.viewUser ? 'Yes' : 'No',
          'View Availability': row?.viewAvailability ? 'Yes' : 'No',
          'View Cancelation': row?.viewCancelation ? 'Yes' : 'No',
          'Create Branch': row?.createBranch ? 'Yes' : 'No',
          'Edit Branch': row?.editBranch ? 'Yes' : 'No',
          'Delete Branch': row?.deleteBranch ? 'Yes' : 'No',
          'View Branch': row?.viewBranch ? 'Yes' : 'No',
          'Create Constraint': row?.createConstraint ? 'Yes' : 'No',
          'Edit Constraint': row?.editConstraint ? 'Yes' : 'No',
          'Delete Constraint': row?.deleteConstraint ? 'Yes' : 'No',
          'View Constraint': row?.viewConstraint ? 'Yes' : 'No',
          'Edit Subgroups': row?.editSubgroups ? 'Yes' : 'No',
          'Delete Subgroups': row?.deleteSubgroup ? 'Yes' : 'No',
          'View Subgroups': row?.viewSubgroup ? 'Yes' : 'No',
          'Admin Push Notification': row?.adminPushNotification ? 'Yes' : 'No',
          'Edit Locked Scheduler': row?.canEditEventSchedulerLocked
            ? 'Yes'
            : 'No',
          'Productivity Include': row?.productivityInclude ? 'Yes' : 'No',
          'Allow Alias': row?.allowAlias ? 'Yes' : 'No',
          ...(checkCompanyPlanFeature(membership, 'requests') && {
            'Request Cancelation on Mobile': row?.requestCancelation
              ? 'Yes'
              : 'No',
            'Request Timeoff on Mobile': row?.requestTimeoff ? 'Yes' : 'No',
            'Request Availability on Mobile': row?.requestAvailability
              ? 'Yes'
              : 'No',
            'Request Confirmation on Mobile': row?.requestConfirmation
              ? 'Yes'
              : 'No',
            'Approvals Feature': row?.requestsFeature ? 'Yes' : 'No',
            'Recieve Notifications on Request Updates':
              row?.enableRequestNotifications ? 'Yes' : 'No',
          }),
          ...(checkCompanyPlanFeature(membership, 'optimizer') && {
            'Optimizer Feature': row?.optimizerFeature ? 'Yes' : 'No',
          }),
          ...(checkCompanyPlanFeature(membership, 'flagging') && {
            'Flagging Feature': row?.flaggingFeature ? 'Yes' : 'No',
          }),
          'Branch Type': row?.branchType?.name,
        };
      });
      return formattedData;
    } catch (err: any) {
      const errMsg = err?.response?.data;
      toast.error(errMsg);
      return null;
    }
  };

  return (
    <div>
      <Widget className='widget-p-md' title={<h4>{resourceType} Roles</h4>}>
        <Stack direction='row' justifyContent='space-between'>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap='1rem'
            rowGap='10px'
          >
            <Link to={`/admin/roles/resources/${resourceType}/new`}>
              <CustomButton type='button'>New</CustomButton>
            </Link>
          </Stack>

          <ExportTableButton
            name={`${resourceType} Roles`}
            handleExport={handleExportRolesTable}
          />
        </Stack>
        {/* Table */}
        <DynamicTable
          key={resourceType}
          columns={newColumns}
          rows={rows}
          count={count}
          loading={loading}
          type={resourceType}
          enableColumnFilters={false}
          fetchData={(filterObj: any) =>
            dispatch(actions.doFetch(filterObj, resourceType))
          }
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

export default RolesTable;
