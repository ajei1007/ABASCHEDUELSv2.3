import { Formik } from 'formik';
import { useMemo, type FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import InputFormItem from 'components/FormItems/items/InputFormItem';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
import rolesFields from 'pages/CRUD/Roles/helpers/rolesFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import { roles_array } from 'constants/user_arrays';
import BranchtypeSelectItem from 'pages/CRUD/Branchtype/helpers/BranchtypeSelectItem';
import FormActions from 'pages/CRUD/components/FormActions';
import rolesFormValidationSchema from '../helpers/rolesFormValidationSchema';
import { ScrollToFieldError } from 'pages/CRUD/Users/form/ScrollToFieldError';
import { Grid2 as Grid } from '@mui/material';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { STANDARD_ROLES_OPTIONS } from '../helpers/standardRolesOptions';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import PermissionsGrid from '../helpers/PermissionsGrid';

type RolesFormProps = {
  isEditing: boolean;
  isProfile: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: {
    [rest: string]: any;
  };
  onSubmit: Function;
  onCancel: Function;
  modal?: any;
  currentUser?: any;
  resources?: any;
};

const FORM_NAME = 'Role';

const RolesForm = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
  resources,
}: RolesFormProps) => {
  const membership = useTypedSelector(
    (state) => state.settings.settingsCompany.company.membership,
  );
  const integrationEnabled =
    useTypedSelector(
      (state) => state.settings.settingsCompany.integrationEnabled,
    ) ?? false;

  const isClient = resources === 'Client';
  const isEmployeeOrClient = resources === 'Employee' || isClient;
  const isEmployee = resources === 'Employee';

  const standardRolesOptions = useMemo(
    () =>
      STANDARD_ROLES_OPTIONS.filter(
        (option) =>
          !Array.isArray(option.resourceTypes) ||
          option.resourceTypes.includes(resources),
      ),
    [resources],
  );

  const iniValues = () => {
    const values = isEditing
      ? {
          ...(record ?? {}),

          standardRoles: record?.standardRoles
            ? STANDARD_ROLES_OPTIONS.find(
                (option) =>
                  option.value === record.standardRoles ||
                  option.value === record.standardRoles?.value,
              ) || STANDARD_ROLES_OPTIONS[0]
            : STANDARD_ROLES_OPTIONS[0],
        }
      : {
          standardRoles: STANDARD_ROLES_OPTIONS[0],
          ...(record ?? {}),
        };

    return IniValues(rolesFields, {
      ...values,
      supervisor: !!(isEmployee && record?.supervisor),
    });
  };

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(rolesFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }
    return isEditing ? 'Edit Roles' : 'Add Roles';
  };

  const rolesFieldsDataAccess = useMemo(
    () =>
      isClient
        ? {
            dataAccess: {
              ...rolesFields.dataAccess,
              options: [{ value: 'User', label: 'User' }],
            },
          }
        : rolesFields,
    [isClient],
  );

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={rolesFormValidationSchema}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <ScrollToFieldError />
            <Grid container spacing={2} columns={{ sm: 12, md: 12 }} mb={4}>
              <Grid
                size={{
                  sm: 12,
                  md: 12,
                }}
              >
                <InputFormItem
                  name={'name'}
                  schema={rolesFields}
                  autoFocus
                  required={roles_array[FORM_NAME]['name']}
                />
                <Grid
                  size={{
                    sm: 12,
                    md: 12,
                  }}
                >
                  <RadioFormItem
                    name={'dataAccess'}
                    schema={rolesFieldsDataAccess}
                    required={roles_array[FORM_NAME]['dataAccess']}
                  />
                </Grid>
                <PermissionsGrid
                  formValues={form.values}
                  setFormValues={form.setValues}
                  isClient={isClient}
                  isEmployee={isEmployee}
                  membership={membership}
                  integrationEnabled={integrationEnabled}
                />
              </Grid>
              <Grid
                size={{
                  sm: 6,
                  md: 6,
                }}
              >
                <BranchtypeSelectItem
                  name={'branchType'}
                  schema={rolesFields}
                  showCreate={!modal}
                  form={form}
                />
              </Grid>
              {isEmployeeOrClient && (
                <Grid
                  size={{
                    sm: 6,
                    md: 6,
                  }}
                >
                  <div className='form-group'>
                    <label>Standard Role</label>
                    <CustomSelect
                      value={(form.values as any).standardRoles}
                      options={standardRolesOptions}
                      onChange={(val: any) =>
                        form.setFieldValue('standardRoles', val)
                      }
                    />
                  </div>
                </Grid>
              )}
              {isEmployee && (
                <Grid
                  size={{
                    sm: 6,
                    md: 6,
                  }}
                >
                  <SwitchFormItem name={'supervisor'} schema={rolesFields} />
                </Grid>
              )}
              <Grid
                size={{
                  sm: 6,
                  md: 6,
                }}
              >
                <SwitchFormItem name={'allowAlias'} schema={rolesFields} />
              </Grid>
            </Grid>
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

export default RolesForm;
