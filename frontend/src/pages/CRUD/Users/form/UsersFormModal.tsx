import { useState, useEffect, type FC } from 'react';
import UsersForm from 'pages/CRUD/Users/form/UsersForm';
import actions from 'store/actions/users/usersFormActions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
// import { useRouteMatch } from 'react-router';
import axios from 'axios';
import { fetchFrontendRolesHierarchy } from 'store/slices/calendar/thunks';
import getSelectedActivities from 'pages/CRUD/CustomConstraints/helpers/getSelectedActivities';
import getSelectedBranchesUsers from 'pages/CRUD/CustomConstraints/helpers/getSelectedBranchesUsers';
import Loader from 'components/Loader/Loader';
import TableConfirmModal from 'components/TableConfirmModal/TableConfirmModal';
import daysOfWeek from 'constants/daysOfWeek';
import { useBranchParentHierarchyMap } from 'hooks/useBranchParentHierarchyMap';

interface IUsersFormModalProps {
  id: string;
  resourceType: string;
  onClose: () => void;
}

type ConfirmModalData = {
  id: string;
  data: any;
} | null;

const UsersFormModal: FC<IUsersFormModalProps> = ({
  id,
  resourceType,
  onClose,
}) => {
  const frontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );
  const record = useAppSelector((store) => store.users.form.record);
  const findLoading = useAppSelector((store) => store.users.form.findLoading);
  const saveLoading = useAppSelector((store) => store.users.form.saveLoading);
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const [users, setUsers] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<any>>([]);
  const [activities, setActivities] = useState<Array<any>>([]);
  const [roles, setRoles] = useState<Array<any>>([]);
  const [subgroups, setSubgroups] = useState<Array<any>>([]);
  const [allBranches, setAllBranches] = useState<Array<any>>([]);
  const [branches, setBranches] = useState<Array<any>>([]);
  const [groupings, setGroupings] = useState<Array<any>>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] =
    useState<ConfirmModalData>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // @ts-ignore
  // const match = useRouteMatch();
  const dispatch = useAppDispatch();

  const [dispatched, setDispatched] = useState(false);

  const { branchParentHierarchyMap } = useBranchParentHierarchyMap(allBranches);

  const doSubmit = (
    id: string,
    data: any,
    forceSubmit: boolean = true,
    deleteEvents: boolean = false,
  ) => {
    if (data?.disabled && !forceSubmit) {
      setConfirmModalData({
        id,
        data,
      });
      return toggleModal();
    }
    const _id = id ?? confirmModalData?.id;
    const _data = data ?? confirmModalData?.data;
    _data.deleteEvents = deleteEvents;
    _data.deleteEventsFromDate = selectedDate;

    dispatch(actions.doUpdate(_id, _data, false, resourceType, onClose));
    setModalOpen(false);
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  useEffect(() => {
    if (id) {
      init(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // match,
    dispatch,
    id,
  ]);

  const init = async (userId: any) => {
    if (Object.keys(frontendRolesHierarchy).length === 0) {
      dispatch(fetchFrontendRolesHierarchy());
    }
    await Promise.all([
      fetchSelectedActivities(),
      fetchSelectedBranchesUsers(),
      fetchLocations(),
      fetchRoles(),
      fetchSubgroups(),
      fetchGroupings(),
      fetchBranches(),
    ]);

    dispatch(actions.doFind(userId));
    setDispatched(true);
  };

  const fetchSelectedBranchesUsers = async () => {
    // @ts-ignore
    const users = await getSelectedBranchesUsers(branches);
    setUsers(users);
  };
  const fetchSelectedActivities = async () => {
    const activity = await getSelectedActivities();
    // @ts-ignore
    setActivities(activity);
  };
  const fetchGroupings = async () => {
    const res = await axios.get(`/groupings/autocomplete`);
    setGroupings(
      res.data.map((p: any) => ({ ...p, label: p.label, value: p.id })),
    );
  };
  const fetchRoles = async () => {
    const res = await axios.get(`/roles/autocomplete`);
    setRoles(res.data.map((p: any) => ({ label: p.label, value: p.id })));
  };
  const fetchSubgroups = async () => {
    const res = await axios.get(`/subgroups/autocomplete`);
    setSubgroups(res.data.map((p: any) => ({ label: p.label, value: p.id })));
  };
  const fetchBranches = async () => {
    const [branches, highestBranches] = await Promise.all([
      (async () => {
        const res = await axios.get('/scheduler/branches');
        return res.data as any[];
      })(),
      (async () => {
        if (resourceType !== 'Activity') {
          return [] as any[];
        }
        const res = await axios.get('branches/highest/autocomplete');
        return res.data as any[];
      })(),
    ]);

    setBranches(resourceType === 'Activity' ? highestBranches : branches);
    setAllBranches(branches.flatMap((b) => b?.options ?? []));
  };
  const fetchLocations = async () => {
    const res = await axios.get(`/users/autocomplete/Location`);
    setLocations(res.data.map((p: any) => ({ label: p.label, value: p.id })));
  };
  return (
    <>
      {record && dispatched && !findLoading ? (
        <UsersForm
          saveLoading={saveLoading}
          currentUser={currentUser}
          resource_type={resourceType}
          record={record || {}}
          isEditing={true}
          onSubmit={doSubmit}
          onCancel={onClose}
          users={users}
          locations={locations}
          activities={activities}
          roles={roles}
          subgroups={subgroups}
          branches={branches}
          weekdays={daysOfWeek}
          groupings={groupings}
          branchParentHierarchyMap={branchParentHierarchyMap}
        />
      ) : (
        <Loader />
      )}

      <TableConfirmModal
        isOpen={modalOpen}
        toggleModal={toggleModal}
        handleConfirm={doSubmit}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        type='disable'
      />
    </>
  );
};

export default UsersFormModal;
