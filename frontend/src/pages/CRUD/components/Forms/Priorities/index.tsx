import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import prioritiesFields from 'pages/CRUD/Priorities/helpers/prioritiesFields';
import type { FormikProps } from 'formik';
import { Grid2 as Grid } from '@mui/material';
import type { FC } from 'react';

interface PriorityFormProps {
  form: FormikProps<{
    [rest: string]: any;
  }>;
  modal: any;
  priority?: any;
  index?: any;
  isFormArray?: boolean;
  hasUserField?: boolean;
  searchUsers?: (_: any, val: string) => Array<any>;
}

const PriorityForm: FC<PriorityFormProps> = ({
  form,
  modal,
  priority = null,
  index = null,
  isFormArray = false,
  hasUserField = false,
  searchUsers,
}) => {
  return (
    <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
      {hasUserField && (
        <Grid
          size={{
            sm: 12,
            md: 12
          }}>
          <UsersSelectItem
            name={'user1'}
            schema={prioritiesFields}
            showCreate={!modal}
            form={form}
            fieldLabel='User 1'
            required
            extraFetchFunction={searchUsers}
            fieldOptionData={'user1'}
          />
        </Grid>
      )}
      <Grid
        size={{
          sm: 12,
          md: 6
        }}>
        <UsersSelectItem
          name={isFormArray ? `priorities.${index}.user2` : 'user2'}
          schema={prioritiesFields}
          showCreate={!modal}
          form={form}
          fieldOption={priority}
          fieldName='user2'
          fieldLabel='User 2'
          required
          extraFetchFunction={searchUsers}
          fieldOptionData={'user2'}
        />
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 6
        }}>
        <InputNumberFormItem
          name={isFormArray ? `priorities.${index}.rank` : 'rank'}
          schema={prioritiesFields}
          required
          fieldOption={priority}
          fieldName='rank'
        />
      </Grid>
    </Grid>
  );
};

export default PriorityForm;
