/* eslint-disable react-hooks/exhaustive-deps */
import { Formik } from 'formik';
import { type FC, type FormEvent, useEffect, useState } from 'react';
import Loader from 'components/Loader/Loader';
import prioritiesFields from 'pages/CRUD/Priorities/helpers/prioritiesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import PriorityForm from 'pages/CRUD/components/Forms/Priorities';
import priorityValidationSchema from 'pages/CRUD/components/Forms/Priorities/helpers/priorityValidationSchema';
import FormActions from 'pages/CRUD/components/FormActions';
import axios from 'axios';

type PrioritiesFormProps = {
  isEditing: boolean;
  isProfile: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: {
    [rest: string]: any
  };
  onSubmit: Function;
  onCancel: Function;
  modal?: any;
  currentUser?: any;
}

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 100;

const PrioritiesForm: FC<PrioritiesFormProps> = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      await fetchUsers();
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const params = { limit: AUTOCOMPLETE_SERVER_FETCH_SIZE };
    const response = await axios.get(`/users/autocomplete/Resource`, {
      params,
    });
    setUsers(response.data);
  };
  const searchUsers = (_: any, val: string) => {
    if (users.length) {
      return users.filter((obj: any) =>
        obj.label.toLowerCase().includes(val.toLowerCase()),
      );
    }
    return [];
  };

  const iniValues = () => {
    return IniValues(prioritiesFields, record || {});
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(prioritiesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) return 'Edit My Profile';
    return isEditing ? 'Edit Priorities' : 'Add Priorities';
  };

  if (findLoading || loading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={priorityValidationSchema(true)}
      >
        {(form) => (
          <form>
            <PriorityForm form={form} modal={modal} hasUserField  searchUsers={searchUsers}/>
            <FormActions
              onSubmit={(e: FormEvent<HTMLFormElement>) => form.handleSubmit(e)}
              onReset={form.handleReset}
              onCancel={() => onCancel()}
              saveLoading={saveLoading}
            />
          </form>
        )}
      </Formik>
    </Widget>
  );
};

export default PrioritiesForm;
