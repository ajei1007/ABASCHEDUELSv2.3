import { lazy } from 'react';
import { Routes, Route } from 'react-router';
import { useAppSelector } from 'store/hooks';
import role_permissions from 'helpers/role_permissions';
import lazyWithRetry from '../../utils/lazyWithRetry';

const CustomConstraintsTable = lazy(
  () => import('pages/CRUD/CustomConstraints/table/CustomConstraintsTable'),
);
const CustomConstraintFormPage = lazy(
  () => import('pages/CRUD/CustomConstraints/form/CustomConstraintFormPage'),
);
const EventsTablePage = lazy(
  () => import('pages/CRUD/Events/table/EventsTablePage'),
);
const CapacityconstraintsTablePage = lazyWithRetry(
  () =>
    import('pages/CRUD/Capacityconstraints/table/CapacityconstraintsTablePage'),
);
const CapacityconstraintsViewPage = lazyWithRetry(
  () =>
    import('pages/CRUD/Capacityconstraints/page/CapacityconstraintsViewPage'),
);
const CapacityconstraintsFormPage = lazyWithRetry(
  () =>
    import('pages/CRUD/Capacityconstraints/form/CapacityconstraintsFormPage'),
);
const CalendarPage = lazyWithRetry(() => import('pages/calendar/CalendarPage'));
const Statistics = lazyWithRetry(() => import('pages/statistics/Statistics'));
const StatuseventsTablePage = lazy(
  () => import('pages/CRUD/Statusevents/table/StatuseventsTablePage'),
);
const StatuseventsViewPage = lazy(
  () => import('pages/CRUD/Statusevents/page/StatuseventsViewPage'),
);
const StatuseventsFormPage = lazy(
  () => import('pages/CRUD/Statusevents/form/StatuseventsFormPage'),
);
const EventpairTablePage = lazy(
  () => import('pages/CRUD/Eventpair/table/EventpairTablePage'),
);
const EventpairViewPage = lazy(
  () => import('pages/CRUD/Eventpair/page/EventpairViewPage'),
);
const EventpairFormPage = lazy(
  () => import('pages/CRUD/Eventpair/form/EventpairFormPage'),
);
const PrioritiesTablePage = lazyWithRetry(
  () => import('pages/CRUD/Priorities/table/PrioritiesTablePage'),
);
const PrioritiesViewPage = lazyWithRetry(
  () => import('pages/CRUD/Priorities/page/PrioritiesViewPage'),
);
const PrioritiesFormPage = lazyWithRetry(
  () => import('pages/CRUD/Priorities/form/PrioritiesFormPage'),
);
const TotaltypesTablePage = lazyWithRetry(
  () => import('pages/CRUD/Totaltypes/table/TotaltypesTablePage'),
);
const TotaltypesViewPage = lazyWithRetry(
  () => import('pages/CRUD/Totaltypes/page/TotaltypesViewPage'),
);
const TotaltypesFormPage = lazyWithRetry(
  () => import('pages/CRUD/Totaltypes/form/TotaltypesFormPage'),
);
const UsersTablePage = lazyWithRetry(
  () => import('pages/CRUD/Users/table/UsersTablePage'),
);
const UsersViewPage = lazyWithRetry(
  () => import('pages/CRUD/Users/page/UsersViewPage'),
);
const UsersFormPage = lazyWithRetry(
  () => import('pages/CRUD/Users/form/UsersFormPage'),
);
const GroupingsTablePage = lazyWithRetry(
  () => import('pages/CRUD/Groupings/table/GroupingsTablePage'),
);
const GroupingsViewPage = lazyWithRetry(
  () => import('pages/CRUD/Groupings/page/GroupingsViewPage'),
);
const GroupingsFormPage = lazyWithRetry(
  () => import('pages/CRUD/Groupings/form/GroupingsFormPage'),
);
const CancellationtypesTablePage = lazy(
  () => import('pages/CRUD/Cancellationtypes/table/CancellationtypesTablePage'),
);
const CancellationtypesViewPage = lazy(
  () => import('pages/CRUD/Cancellationtypes/page/CancellationtypesViewPage'),
);
const CancellationtypesFormPage = lazy(
  () => import('pages/CRUD/Cancellationtypes/form/CancellationtypesFormPage'),
);
const RolesTablePage = lazyWithRetry(
  () => import('pages/CRUD/Roles/table/RolesTablePage'),
);
const RolesViewPage = lazyWithRetry(
  () => import('pages/CRUD/Roles/page/RolesViewPage'),
);
const RolesFormPage = lazyWithRetry(
  () => import('pages/CRUD/Roles/form/RolesFormPage'),
);
const BranchesTablePage = lazyWithRetry(
  () => import('pages/CRUD/Branches/table/BranchesTablePage'),
);
const BranchesViewPage = lazyWithRetry(
  () => import('pages/CRUD/Branches/page/BranchesViewPage'),
);
const BranchesFormPage = lazyWithRetry(
  () => import('pages/CRUD/Branches/form/BranchesFormPage'),
);
const AvailabilitiesTablePage = lazyWithRetry(
  () => import('pages/CRUD/Availabilities/table/AvailabilitiesTablePage'),
);
const AvailabilitiesViewPage = lazyWithRetry(
  () => import('pages/CRUD/Availabilities/page/AvailabilitiesViewPage'),
);
const AvailabilitiesFormPage = lazyWithRetry(
  () => import('pages/CRUD/Availabilities/form/AvailabilitiesFormPage'),
);
const SubgroupsTablePage = lazyWithRetry(
  () => import('pages/CRUD/Subgroups/table/SubgroupsTablePage'),
);
const SubgroupsViewPage = lazyWithRetry(
  () => import('pages/CRUD/Subgroups/page/SubgroupsViewPage'),
);
const SubgroupsFormPage = lazyWithRetry(
  () => import('pages/CRUD/Subgroups/form/SubgroupsFormPage'),
);
const DrivetimebranchTablePage = lazyWithRetry(
  () => import('pages/CRUD/Drivetimebranch/table/DrivetimebranchTablePage'),
);
const DrivetimebranchViewPage = lazyWithRetry(
  () => import('pages/CRUD/Drivetimebranch/page/DrivetimebranchViewPage'),
);
const DrivetimebranchFormPage = lazyWithRetry(
  () => import('pages/CRUD/Drivetimebranch/form/DrivetimebranchFormPage'),
);
const DrivetimelocationTablePage = lazyWithRetry(
  () => import('pages/CRUD/Drivetimelocation/table/DrivetimelocationTablePage'),
);
const DrivetimelocationViewPage = lazyWithRetry(
  () => import('pages/CRUD/Drivetimelocation/page/DrivetimelocationViewPage'),
);
const DrivetimelocationFormPage = lazyWithRetry(
  () => import('pages/CRUD/Drivetimelocation/form/DrivetimelocationFormPage'),
);
const CancellationsTablePage = lazy(
  () => import('pages/CRUD/Cancellations/table/CancellationsTablePage'),
);
const CancellationsViewPage = lazy(
  () => import('pages/CRUD/Cancellations/page/CancellationsViewPage'),
);
const TimeoffTablePage = lazy(
  () => import('pages/CRUD/Timeoff/table/TimeoffTablePage'),
);
const TimeoffViewPage = lazy(
  () => import('pages/CRUD/Timeoff/page/TimeoffViewPage'),
);
const TimeoffFormPage = lazy(
  () => import('pages/CRUD/Timeoff/form/TimeoffFormPage'),
);
const TimeofftypesTablePage = lazy(
  () => import('pages/CRUD/Timeofftypes/table/TimeofftypesTablePage'),
);
const TimeofftypesViewPage = lazy(
  () => import('pages/CRUD/Timeofftypes/page/TimeofftypesViewPage'),
);
const TimeofftypesFormPage = lazy(
  () => import('pages/CRUD/Timeofftypes/form/TimeofftypesFormPage'),
);
const MobiletokensTablePage = lazy(
  () => import('pages/CRUD/Mobiletokens/table/MobiletokensTablePage'),
);
const IndustriesTablePage = lazy(
  () => import('pages/CRUD/Industries/table/IndustriesTablePage'),
);
const IndustriesFormPage = lazy(
  () => import('pages/CRUD/Industries/form/IndustriesFormPage'),
);
const DistanceMatrixTablePage = lazy(
  () => import('pages/CRUD/DistanceMatrix/table/DistanceMatrixTablePage'),
);
const DistanceMatrixViewPage = lazy(
  () => import('pages/CRUD/DistanceMatrix/page/DistanceMatrixViewPage'),
);
const DistanceMatrixFormPage = lazy(
  () => import('pages/CRUD/DistanceMatrix/form/DistanceMatrixFormPage'),
);
const FounderServiceLinesTablePage = lazyWithRetry(
  () =>
    import('pages/CRUD/FounderServiceLines/table/FounderServiceLinesTablePage'),
);
const FounderServiceLinesViewPage = lazyWithRetry(
  () =>
    import('pages/CRUD/FounderServiceLines/page/FounderServiceLinesViewPage'),
);
const FounderServiceLinesFormPage = lazyWithRetry(
  () =>
    import('pages/CRUD/FounderServiceLines/form/FounderServiceLinesFormPage'),
);

const BranchtypeTablePage = lazy(
  () => import('pages/CRUD/Branchtype/table/BranchtypeTablePage'),
);
const BranchtypeViewPage = lazy(
  () => import('pages/CRUD/Branchtype/page/BranchtypeViewPage'),
);
const BranchtypeFormPage = lazy(
  () => import('pages/CRUD/Branchtype/form/BranchtypeFormPage'),
);

export default function AdminRoutes() {
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const settingsLoading = useAppSelector(
    (store) => store.settings.settingsLoading,
  );

  return (
    <Routes>
      <Route path={'statusevents'} element={<StatuseventsTablePage />} />
      <Route path={'statusevents/new'} element={<StatuseventsFormPage />} />
      <Route
        path={'statusevents/:id/edit'}
        element={<StatuseventsFormPage />}
      />
      <Route path={'statusevents/:id'} element={<StatuseventsViewPage />} />
      <Route path={'eventpair'} element={<EventpairTablePage />} />
      <Route path={'eventpair/new'} element={<EventpairFormPage />} />
      <Route path={'eventpair/:id/edit'} element={<EventpairFormPage />} />
      <Route path={'eventpair/:id'} element={<EventpairViewPage />} />
      <Route path={'timeoff'} element={<TimeoffTablePage />} />
      <Route path={'timeoff/new'} element={<TimeoffFormPage />} />
      <Route path={'timeoff/:id/edit'} element={<TimeoffFormPage />} />
      <Route path={'timeoff/:id'} element={<TimeoffViewPage />} />
      <Route path={'priorities'} element={<PrioritiesTablePage />} />
      <Route path={'priorities/new'} element={<PrioritiesFormPage />} />
      <Route path={'priorities/:id/edit'} element={<PrioritiesFormPage />} />
      <Route path={'priorities/:id'} element={<PrioritiesViewPage />} />
      <Route path={'totaltypes'} element={<TotaltypesTablePage />} />
      <Route path={'totaltypes/new'} element={<TotaltypesFormPage />} />
      <Route path={'totaltypes/:id/edit'} element={<TotaltypesFormPage />} />
      <Route path={'totaltypes/:id'} element={<TotaltypesViewPage />} />
      <Route path={'scheduler'} element={<CalendarPage />} />
      {role_permissions(currentUser, 'viewReport') && !settingsLoading && (
        <Route path='statistics' element={<Statistics />} />
      )}
      <Route path={'users'} element={<UsersTablePage />} />
      <Route path={'users/new'} element={<UsersFormPage />} />
      <Route path={'users/:id/edit'} element={<UsersFormPage />} />
      <Route path={'users/:id'} element={<UsersViewPage />} />
      <Route path={'users/resources/:resources'} element={<UsersTablePage />} />
      <Route
        path={'users/resources/:resources/new'}
        element={<UsersFormPage />}
      />
      <Route
        path={'users/resources/:resources/:id/edit'}
        element={<UsersFormPage />}
      />
      <Route
        path={'users/resources/:resources/:id'}
        element={<UsersViewPage />}
      />
      <Route
        path={'subgroups/groupings/:groups'}
        element={<SubgroupsTablePage />}
      />
      <Route
        path={'subgroups/groupings/:groups/new'}
        element={<SubgroupsFormPage />}
      />
      <Route
        path={'subgroups/groupings/:groups/:id/edit'}
        element={<SubgroupsFormPage />}
      />
      <Route
        path={'subgroups/groupings/:groups/:id'}
        element={<UsersTablePage />}
      />
      <Route path={'groupings'} element={<GroupingsTablePage />} />
      <Route path={'groupings/new'} element={<GroupingsFormPage />} />
      <Route path={'groupings/:id/edit'} element={<GroupingsFormPage />} />
      <Route path={'groupings/:id'} element={<GroupingsViewPage />} />
      <Route
        path={'cancellationtypes'}
        element={<CancellationtypesTablePage />}
      />
      <Route
        path={'cancellationtypes/new'}
        element={<CancellationtypesFormPage />}
      />
      <Route
        path={'cancellationtypes/:id/edit'}
        element={<CancellationtypesFormPage />}
      />
      <Route
        path={'cancellationtypes/:id'}
        element={<CancellationtypesViewPage />}
      />
      <Route path={'industries'} element={<IndustriesTablePage />} />
      <Route path={'industries/new'} element={<IndustriesFormPage />} />
      <Route path={'industries/:id/edit'} element={<IndustriesFormPage />} />
      <Route path={'subgroups'} element={<SubgroupsTablePage />} />
      <Route path={'subgroups/new'} element={<SubgroupsFormPage />} />
      <Route path={'subgroups/:id/edit'} element={<SubgroupsFormPage />} />
      <Route path={'subgroups/:id'} element={<SubgroupsViewPage />} />
      <Route path={'roles'} element={<RolesTablePage />} />
      <Route path={'roles/new'} element={<RolesFormPage />} />
      <Route path={'roles/:id/edit'} element={<RolesFormPage />} />
      <Route path={'roles/:id'} element={<RolesViewPage />} />
      <Route path={'roles/resources/:resources'} element={<RolesTablePage />} />
      <Route
        path={'roles/resources/:resources/new'}
        element={<RolesFormPage />}
      />
      <Route
        path={'roles/resources/:resources/:id/edit'}
        element={<RolesFormPage />}
      />
      <Route
        path={'roles/resources/:resources/:id'}
        element={<RolesTablePage />}
      />
      {/* Custom Constraints */}
      <Route path={'custom'} element={<CustomConstraintsTable />} />
      {currentUser?.internalAdmin && (
        <>
          <Route path={'custom/new'} element={<CustomConstraintFormPage />} />
          <Route
            path={'custom/:id/edit'}
            element={<CustomConstraintFormPage />}
          />
        </>
      )}
      <Route path={'branches'} element={<BranchesTablePage />} />
      <Route path={'branches/new'} element={<BranchesFormPage />} />
      <Route path={'branches/:id/edit'} element={<BranchesFormPage />} />
      <Route path={'branches/:id'} element={<BranchesViewPage />} />
      <Route path={'drivetimebranch'} element={<DrivetimebranchTablePage />} />
      <Route
        path={'drivetimebranch/new'}
        element={<DrivetimebranchFormPage />}
      />
      <Route
        path={'drivetimebranch/:id/edit'}
        element={<DrivetimebranchFormPage />}
      />
      <Route
        path={'drivetimebranch/:id'}
        element={<DrivetimebranchViewPage />}
      />
      <Route
        path={'drivetimelocation'}
        element={<DrivetimelocationTablePage />}
      />
      <Route
        path={'drivetimelocation/new'}
        element={<DrivetimelocationFormPage />}
      />
      <Route
        path={'drivetimelocation/:id/edit'}
        element={<DrivetimelocationFormPage />}
      />
      <Route
        path={'drivetimelocation/:id'}
        element={<DrivetimelocationViewPage />}
      />
      {role_permissions(currentUser, 'viewAvailability') && (
        <Route path={'availabilities'} element={<AvailabilitiesTablePage />} />
      )}
      {role_permissions(currentUser, 'createAvailability') && (
        <Route
          path={'availabilities/new'}
          element={<AvailabilitiesFormPage />}
        />
      )}
      {role_permissions(currentUser, 'editAvailability') && (
        <Route
          path={'availabilities/:id/edit'}
          element={<AvailabilitiesFormPage />}
        />
      )}
      {role_permissions(currentUser, 'viewAvailability') && (
        <Route
          path={'availabilities/:id'}
          element={<AvailabilitiesViewPage />}
        />
      )}

      {role_permissions(currentUser, 'viewAvailability') && (
        <Route
          path={'availabilities/resources/:resources'}
          element={<AvailabilitiesTablePage />}
        />
      )}
      {role_permissions(currentUser, 'createAvailability') && (
        <Route
          path={'availabilities/resources/:resources/new'}
          element={<AvailabilitiesFormPage />}
        />
      )}
      {role_permissions(currentUser, 'editAvailability') && (
        <Route
          path={'availabilities/resources/:resources/:id/edit'}
          element={<AvailabilitiesFormPage />}
        />
      )}
      {role_permissions(currentUser, 'viewAvailability') && (
        <Route
          path={'availabilities/resources/:resources/:id'}
          element={<AvailabilitiesViewPage />}
        />
      )}
      <Route path={'events'} element={<EventsTablePage />} />
      {role_permissions(currentUser, 'viewCancelation') && (
        <Route
          path={'cancellationtypes'}
          element={<CancellationtypesTablePage />}
        />
      )}
      {role_permissions(currentUser, 'createCancelation') && (
        <Route
          path={'cancellationtypes/new'}
          element={<CancellationtypesFormPage />}
        />
      )}
      {role_permissions(currentUser, 'editCancelation') && (
        <Route
          path={'cancellationtypes/:id/edit'}
          element={<CancellationtypesFormPage />}
        />
      )}
      {role_permissions(currentUser, 'viewCancelation') && (
        <Route
          path={'cancellationtypes/:id'}
          element={<CancellationtypesViewPage />}
        />
      )}
      {role_permissions(currentUser, 'viewCancelation') && (
        <Route path={'cancellations'} element={<CancellationsTablePage />} />
      )}
      {role_permissions(currentUser, 'viewCancelation') && (
        <Route path={'cancellations/:id'} element={<CancellationsViewPage />} />
      )}
      <Route
        path={'capacityconstraints'}
        element={<CapacityconstraintsTablePage />}
      />
      <Route
        path={'capacityconstraints/new'}
        element={<CapacityconstraintsFormPage />}
      />
      <Route
        path={'capacityconstraints/:id/edit'}
        element={<CapacityconstraintsFormPage />}
      />
      <Route
        path={'capacityconstraints/:id'}
        element={<CapacityconstraintsViewPage />}
      />
      <Route path={'timeofftypes'} element={<TimeofftypesTablePage />} />
      <Route path={'timeofftypes/new'} element={<TimeofftypesFormPage />} />
      <Route
        path={'timeofftypes/:id/edit'}
        element={<TimeofftypesFormPage />}
      />
      <Route path={'timeofftypes/:id'} element={<TimeofftypesViewPage />} />
      <Route path={'mobiletokens'} element={<MobiletokensTablePage />} />
      <Route path='distancematrix' element={<DistanceMatrixTablePage />} />
      <Route path='distancematrix/new' element={<DistanceMatrixFormPage />} />
      <Route
        path={'distancematrix/:id/edit'}
        element={<DistanceMatrixFormPage />}
      />
      <Route path={'distancematrix/:id'} element={<DistanceMatrixViewPage />} />
      <Route
        path='founderServiceLines'
        element={<FounderServiceLinesTablePage />}
      />
      <Route
        path='founderServiceLines/new'
        element={<FounderServiceLinesFormPage />}
      />
      <Route
        path={'founderServiceLines/:id/edit'}
        element={<FounderServiceLinesFormPage />}
      />
      <Route
        path={'founderServiceLines/:id'}
        element={<FounderServiceLinesViewPage />}
      />
      {currentUser?.internalAdmin && (
        <>
          <Route path={'branchtype'} element={<BranchtypeTablePage />} />
          <Route path={'branchtype/new'} element={<BranchtypeFormPage />} />
          <Route
            path={'branchtype/:id/edit'}
            element={<BranchtypeFormPage />}
          />
          <Route path={'branchtype/:id'} element={<BranchtypeViewPage />} />
        </>
      )}
    </Routes>
  );
}
