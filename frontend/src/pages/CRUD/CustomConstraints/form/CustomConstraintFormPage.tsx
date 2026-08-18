/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import actions from 'store/actions/custom/customFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams, useNavigate } from 'react-router';
import CustomConstraintForm from './CustomConstraintForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from 'components/Loader/Loader';
import getSelectedBranchesUsers from '../helpers/getSelectedBranchesUsers';
import getSelectedActivities from '../helpers/getSelectedActivities';
import daysOfWeek from 'constants/daysOfWeek';

const CustomConstraintFormPage = () => {
  const record = useTypedSelector((store) => store.custom.form.record);
  const findLoading = useTypedSelector((store) => store.custom.form.findLoading);
  const saveLoading = useTypedSelector((store) => store.custom.form.saveLoading);
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  // 
    // Internal States
  const [fetched, setFetched] = useState<boolean>(false)
  const [users, setUsers] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<any>>([]);
  const [activities, setActivities] = useState<Array<any>>([]);
  const [roles, setRoles] = useState<Array<any>>([]);
  const [subgroups, setSubgroups] = useState<Array<any>>([]);
  const [branches, setBranches] = useState<Array<any>>([]);
  const [groupings, setGroupings] = useState<Array<any>>([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const isEditing = () => {
    return !!id;
  };

  const doSubmit = (id: string, data: any) => {
    if (isEditing()) {
      dispatch(actions.doUpdate(id, data, false));
    } else {
      dispatch(actions.doCreate(data));
    }
  };

  useEffect(() => {
    init();
  }, []);

  // useEffect(() => {
  //   if (isEditing()) {
  //     // fetchSelectedActivities()
  //     if (record?.branches && record?.branches?.length) {
  //       fetchSelectedBranchesUsers(record?.branches);
  //     }
  //   }
  // }, [record]);

  const init = async () => {
    await fetchData();
    if (isEditing()) {
      dispatch(actions.doFind(id || ''));
    } else {
      dispatch(actions.doNew());
    }
    setFetched(true);
  }

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchSelectedActivities(),
        fetchSelectedBranchesUsers(),
        fetchLocations(),
        fetchRoles(),
        fetchSubgroups(),
        fetchGroupings(),
        fetchBranches(),
      ]);
    } catch (error: any) {
      const msg = error?.response?.data;
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again!');
      }
    } finally {
    }
  };
  const fetchSelectedBranchesUsers = async () => {
    // @ts-ignore
    const users =  await getSelectedBranchesUsers(branches);
    setUsers(users);
  };
  const fetchSelectedActivities = async() => {
    const activity= await getSelectedActivities();
    // @ts-ignore
    setActivities(activity)
  }
  const fetchGroupings = async () => {
    const res = await axios.get(`/groupings/autocomplete`);
    setGroupings(res.data.map((p: any) => ({ label: p.label, value: p.id })));
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
    const res = await axios.get(`/scheduler/branches`);
    const branches = res.data;
    setBranches(branches);
  };
  const fetchLocations = async () => {
    const res = await axios.get(`/users/autocomplete/Location`);
    setLocations(res.data.map((p: any) => ({ label: p.label, value: p.id })));
  };

  return (
    <>
      {fetched ? (
        <CustomConstraintForm
          saveLoading={saveLoading}
          findLoading={findLoading}
          currentUser={currentUser}
          record={isEditing() ? record : null}
          isEditing={isEditing()}
          onSubmit={doSubmit}
          onCancel={() => navigate('/admin/custom')}
          users={users}
          locations={locations}
          activities={activities}
          roles={roles}
          subgroups={subgroups}
          branches={branches}
          weekdays={daysOfWeek}
          groupings={groupings}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

export default CustomConstraintFormPage;
