/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import UsersForm from 'pages/CRUD/Users/form/UsersForm';
import actions from 'store/actions/users/usersFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { useParams, useMatch, useNavigate } from 'react-router';
import axios from 'axios';
import Widget from 'components/Widget/Widget';
import { fetchFrontendRolesHierarchy } from 'store/slices/calendar/thunks';
import getSelectedBranchesUsers from 'pages/CRUD/CustomConstraints/helpers/getSelectedBranchesUsers';
import getSelectedActivities from 'pages/CRUD/CustomConstraints/helpers/getSelectedActivities';
import Loader from 'components/Loader/Loader';
import TableConfirmModal from 'components/TableConfirmModal/TableConfirmModal';
import daysOfWeek from 'constants/daysOfWeek';
import { useBranchParentHierarchyMap } from 'hooks/useBranchParentHierarchyMap';
import { Alert } from '@mui/material';

type ConfirmModalData = {
  id: string;
  data: any;
} | null;

const UsersFormPage = () => {
  const frontend_roles_hierarchy = useTypedSelector(
    (state: any) => state.calendar.frontend_roles_hierarchy,
  );
  const record = useTypedSelector((store) => store.users.form.record);
  const findLoading = useTypedSelector((store) => store.users.form.findLoading);
  const saveLoading = useTypedSelector((store) => store.users.form.saveLoading);
  const currentUser = useTypedSelector((store) => store.auth.currentUser);

  const [users, setUsers] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<any>>([]);
  const [activities, setActivities] = useState<Array<any>>([]);
  const [roles, setRoles] = useState<Array<any>>([]);
  const [subgroups, setSubgroups] = useState<Array<any>>([]);
  const [branches, setBranches] = useState<Array<any>>([]);
  const [allBranches, setAllBranches] = useState<Array<any>>([]);
  const [groupings, setGroupings] = useState<Array<any>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] =
    useState<ConfirmModalData>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  type Params = {
    resources: any;
  };
  let { resources } = useParams<Params>();

  const navigate = useNavigate();
  const { id } = useParams();
  const isProfileMatch = useMatch('/app/user');

  const dispatch = useAppDispatch();

  const [dispatched, setDispatched] = useState(false);

  const { branchParentHierarchyMap } = useBranchParentHierarchyMap(allBranches);

  const isEditing = () => {
    return !!id;
  };

  const isProfile = () => {
    return !!isProfileMatch;
  };

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

    if (isEditing() || isProfile()) {
      dispatch(actions.doUpdate(_id, _data, isProfile(), resources));
    } else {
      dispatch(actions.doCreate(_data, resources));
    }

    setModalOpen(false);
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isProfileMatch, dispatch]);

  const init = async () => {
    try {
      if (Object.keys(frontend_roles_hierarchy).length === 0) {
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
      if (isEditing()) {
        dispatch(actions.doFind(id || ''));
      } else {
        if (isProfile()) {
          // @ts-ignore
          const currentUser = JSON.parse(localStorage.getItem('user'));
          const currentUserId = currentUser.user.id;
          dispatch(actions.doFind(currentUserId));
        } else {
          dispatch(actions.doNew());
        }
      }
    } catch (error) {
    } finally {
      setDispatched(true);
    }
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
        if (resources !== 'Activity') {
          return [] as any[];
        }
        const res = await axios.get('branches/highest/autocomplete');
        return res.data as any[];
      })(),
    ]);

    setBranches(resources === 'Activity' ? highestBranches : branches);
    setAllBranches(branches.flatMap((b) => b?.options ?? []));
  };
  const fetchLocations = async () => {
    const res = await axios.get(`/users/autocomplete/Location`);
    setLocations(res.data.map((p: any) => ({ label: p.label, value: p.id })));
  };

  const title = () => {
    if (isProfile()) {
      return 'Edit My Profile';
    }
    return isEditing() ? `Edit ${resources}` : `Add ${resources}`;
  };
  return (
    <>
      <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
        {record?.immutable && (
          <Alert severity='warning' sx={{ mb: 2, borderRadius: '8px' }}>
            Activity is immutable, can't be edited
          </Alert>
        )}
        {(!isEditing() || record) && dispatched && !findLoading ? (
          <UsersForm
            id={id}
            saveLoading={saveLoading}
            currentUser={currentUser}
            resource_type={resources}
            record={isEditing() || isProfile() ? record : {}}
            isEditing={isEditing()}
            onSubmit={doSubmit}
            onCancel={() => navigate(`/admin/users/resources/${resources}`)}
            users={users}
            locations={locations}
            activities={activities}
            roles={roles}
            subgroups={subgroups}
            branches={branches}
            weekdays={daysOfWeek}
            groupings={groupings}
            branchParentHierarchyMap={branchParentHierarchyMap}
            immutable={record?.immutable}
          />
        ) : (
          <Loader />
        )}
      </Widget>
      <TableConfirmModal
        isOpen={modalOpen}
        toggleModal={toggleModal}
        handleConfirm={doSubmit}
        type='disable'
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default UsersFormPage;
