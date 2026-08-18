import { Formik } from 'formik';
import type { FC, FormEvent } from 'react';
import Loader from 'components/Loader/Loader';
import subgroupsFields from 'pages/CRUD/Subgroups/helpers/subgroupsFields';
import IniValues from 'components/FormItems/iniValues';
import PreparedValues from 'components/FormItems/preparedValues';
import Widget from 'components/Widget/Widget';
import SubgroupForm from 'pages/CRUD/components/Forms/Subgroups';
import subgroupValidationSchema from 'pages/CRUD/components/Forms/Subgroups/helpers/subgroupValidationSchema';
import { Stack } from '@mui/material';
import CustomButton from 'components/Button';
import TAGS_TYPES_WITH_ICONS from 'pages/calendar/utils/tagsWithIcons';
import { TagValueTypes } from 'pages/CRUD/CustomConstraints/helpers/customTypes';

type SubgroupsFormProps = {
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
  groupName?: any;
};

const SubgroupsForm: FC<SubgroupsFormProps> = ({
  isEditing,
  isProfile,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  modal,
  groupName,
}) => {
  const iniValues = () => {
    if (record?.iconName) {
      const selectedIcon = TAGS_TYPES_WITH_ICONS.find((opt) => opt.value === record.iconName as TagValueTypes);
      record.iconName = selectedIcon
    }
    return IniValues(subgroupsFields, record || {});
  };
  

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(subgroupsFields, values || {});
    onSubmit(id, data);
  };

  const title = () => {
    if (isProfile) {
      return 'Edit My Profile';
    }
    let roles_arr = ['Resource']
  if(record?.group?.roles1?.length > 0){
    roles_arr = []
    for (const role of record.group.roles1){
      roles_arr.push(role.name)
  }
}

    return isEditing
      ? `Edit '${groupName}' Tag for ${roles_arr.join('s and ')}s`
      : `Add '${groupName}' Tag for ${roles_arr.join(' and ')}s`;
  };

  if (findLoading) return <Loader />;
  if (isEditing && !record) return <Loader />;
  return (
    <Widget className='widget-p-md' title={<h4>{title()}</h4>}>
      <Formik
        onSubmit={handleSubmit}
        initialValues={iniValues()}
        validationSchema={subgroupValidationSchema()}
      >
        {(form) => (
          <form>
            <SubgroupForm form={form} modal={modal} record={record} />
            <Stack direction='row' spacing='0.5rem'>
              <CustomButton
                disabled={saveLoading}
                type='button'
                // @ts-ignore
                onClick={(e: FormEvent<HTMLFormElement>) =>
                  form.handleSubmit(e)
                }
              >
                Save
              </CustomButton>
              <CustomButton
                variant='outlined'
                type='button'
                disabled={saveLoading}
                onClick={form.handleReset}
              >
                Reset
              </CustomButton>
              <CustomButton
                variant='outlined'
                type='button'
                disabled={saveLoading}
                onClick={() => onCancel()}
              >
                Cancel
              </CustomButton>
            </Stack>
          </form>
        )}
      </Formik>
    </Widget>
  );
};

export default SubgroupsForm;
