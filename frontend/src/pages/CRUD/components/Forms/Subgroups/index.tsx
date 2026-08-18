import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import type { FormikProps } from 'formik';
import { Grid2 as Grid, Stack } from '@mui/material';
import type { FC } from 'react';
import InputFormItem from 'components/FormItems/items/InputFormItem';
import subgroupsFields from 'pages/CRUD/Subgroups/helpers/subgroupsFields';
import { subgroups_array } from 'constants/user_arrays';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import BranchesSelectItem from 'pages/CRUD/Branches/helpers/BranchesSelectItem';
import TAGS_TYPES_WITH_ICONS from 'pages/calendar/utils/tagsWithIcons';
import { components, type OptionProps, type ControlProps } from 'react-select';

const formName = 'Subgroup';

interface SubgroupFormProps {
  form: FormikProps<{
    [rest: string]: any;
  }>;
  modal: any;
  record: any;
}

const IconOption = (props: OptionProps<any>) => {
  return (
    <components.Option {...props}>
      <Stack flexDirection='row' alignItems='center' columnGap={1}>
        {props.data.icon && props.data.icon}
        {props.data.value}
      </Stack>
    </components.Option>
  );
};

const Control = ({ children, ...props }: ControlProps<any, false>) => {
  // @ts-ignore
  const SelectedIcon = props.selectProps.value?.icon;
  return (
    <components.Control {...props}>
      <Stack pl={1}>{SelectedIcon && SelectedIcon}</Stack>
      {children}
    </components.Control>
  );
};

const SubgroupForm: FC<SubgroupFormProps> = ({ form, modal, record }) => {
  let roles_arr = ['Resource'];
  if (record?.group?.roles1?.length > 0) {
    roles_arr = [];
    for (const role of record.group.roles1) {
      roles_arr.push(role.name);
    }
  }
  return (
    <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
      <Grid
        size={{
          sm: 12,
          md: 12
        }}>
        <InputFormItem
          name={'name'}
          schema={subgroupsFields}
          autoFocus
          required={subgroups_array[formName]['name']}
        />
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 12
        }}>
        <UsersSelectItem
          name={'user'}
          schema={{ ...subgroupsFields, type_type: roles_arr.join('|') }}
          showCreate={!modal}
          mode='multiple'
          form={form}
          //required={subgroups_array[formName]['user']}
        />
      </Grid>
      <Grid
        size={{
          sm: 12,
          md: 12
        }}>
        <div className='form-group'>
          <label>Icon</label>
          <CustomSelect
            onChange={(val: any) => form.setFieldValue('iconName', val)}
            value={form.values.iconName}
            options={TAGS_TYPES_WITH_ICONS}
            components={{ Option: IconOption, Control }}
          />
        </div>
      </Grid>
      {/* <Grid item sm={12} md={12}>
        <SubgroupsSelectItem
          name={'subgroup3'}
          schema={subgroupsFields}
          showCreate={!modal}
          mode='multiple'
          form={form}
          //required={subgroups_array[formName]['user']}
        />
      </Grid> */}
      <Grid
        size={{
          sm: 12,
          md: 12
        }}>
        <BranchesSelectItem
          name={'branch'}
          schema={subgroupsFields}
          showCreate={!modal}
          form={form}
        />
      </Grid>
    </Grid>
  );
};

export default SubgroupForm;
