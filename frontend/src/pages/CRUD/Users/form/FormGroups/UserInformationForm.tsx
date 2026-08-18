import InputFormItem from 'components/FormItems/items/InputFormItem';
import SwitchFormItem from 'components/FormItems/items/SwitchFormItem';
import RadioFormItem from 'components/FormItems/items/RadioFormItem';
import DatePickerFormItem from 'components/FormItems/items/DatePickerFormItem';
import usersFields from 'pages/CRUD/Users/helpers/usersFields';
import UsersSelectItem from 'pages/CRUD/Users/helpers/UsersSelectItem';
import SiblingSelectItem from 'pages/CRUD/Users/helpers/SiblingSelectItem';
import RolesSelectItem from 'pages/CRUD/Roles/helpers/RolesSelectItem';
import BranchesSelectItem from 'pages/CRUD/Branches/helpers/BranchesSelectItem';
import TotaltypesSelectItem from 'pages/CRUD/Totaltypes/helpers/TotaltypesSelectItem';
import { Grid2 as Grid, IconButton, Tooltip } from '@mui/material';
import { user_arrays } from 'constants/user_arrays';
import InputNumberFormItem from 'components/FormItems/items/InputNumberFormItem';
import AddressAutcompleteInput from './AddressAutcompleteInput';
import ColorSelect from 'components/ColorSelect/ColorSelect';
import {
  backgroundColorArray,
  borderColorArray,
  colorPalette,
} from 'constants/color';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TextAreaFormItem from 'components/FormItems/items/TextAreaFormItem';
import { useAppSelector } from 'store/hooks';
import CustomSelect from 'components/CustomSelect/CustomSelect';

type UserInformationFormProps = {
  form: any;
  resources: string;
  modal?: any;
  isEditing?: boolean;
  currentUser?: any;
};

interface LabelTooltipProps {
  title: string;
  icon: React.ReactNode;
}

export const LabelTooltip: React.FC<LabelTooltipProps> = ({ title, icon }) => {
  return (
    <Tooltip title={title} placement='top' arrow>
      <IconButton style={{ padding: 0, marginLeft: '4px' }}>{icon}</IconButton>
    </Tooltip>
  );
};

const UserInformationForm = ({
  form,
  resources,
  modal,
  isEditing,
  currentUser,
}: UserInformationFormProps) => {
  const isCurrentUser = currentUser.id === form.values?.id;
  const settingsCompany = useAppSelector(
    (state) => state.settings.settingsCompany,
  );
  return (
    <Grid container spacing={2} columns={{ sm: 12, md: 12 }}>
      {Object.keys(user_arrays[resources]).includes('firstName') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'firstName'}
            label1={
              resources === 'Employee' || resources === 'Client'
                ? 'First Name'
                : 'Name'
            }
            schema={usersFields}
            required={user_arrays[resources]['firstName']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('lastName') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'lastName'}
            schema={usersFields}
            required={user_arrays[resources]['lastName']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('alias') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem name='alias' schema={usersFields} tooltip='Alias' />
        </Grid>
      )}
      {(!settingsCompany?.customLabels ||
        !settingsCompany?.customLabels?.resources?.[resources.toLowerCase()]?.ID
          ?.hide) &&
        Object.keys(user_arrays[resources]).includes('idCustom') && (
          <Grid
            size={{
              sm: 12,
              md: 6,
            }}
          >
            <InputFormItem
              label1={
                settingsCompany?.customLabels?.resources?.[
                  resources.toLowerCase()
                ]?.ID?.relabel ?? 'ID'
              }
              name={'idCustom'}
              schema={usersFields}
              required={
                user_arrays[resources]['idCustom'] ||
                settingsCompany?.customLabels?.resources?.[
                  resources.toLowerCase()
                ]?.ID?.required
              }
            />
          </Grid>
        )}
      {(!settingsCompany?.customLabels ||
        !settingsCompany?.customLabels?.resources?.[resources.toLowerCase()]
          ?.ID2?.hide) &&
        Object.keys(user_arrays[resources]).includes('idCustom2') && (
          <Grid
            size={{
              sm: 12,
              md: 6,
            }}
          >
            <InputFormItem
              label1={
                settingsCompany?.customLabels?.resources?.[
                  resources.toLowerCase()
                ]?.ID2?.relabel ?? 'ID2'
              }
              name={'idCustom2'}
              schema={usersFields}
              required={
                user_arrays[resources]['idCustom2'] ||
                settingsCompany?.customLabels?.resources?.[
                  resources.toLowerCase()
                ]?.ID2?.required
              }
            />
          </Grid>
        )}
      {Object.keys(user_arrays[resources]).includes('codeCustom') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name='codeCustom'
            schema={usersFields}
            tooltip='Code'
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('roomparent') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'roomparent'}
            schema={{
              ...usersFields,
              type_type: 'Location',
              flick: form.values,
            }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['roomparent']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('rooms') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'rooms'}
            schema={usersFields}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['rooms']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('capacity') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputNumberFormItem
            name={'capacity'}
            schema={usersFields}
            required={user_arrays[resources]['capacity']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('parent') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'parent'}
            schema={usersFields}
            showCreate={!modal}
            form={form}
            required={user_arrays[resources]['parent']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('email') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'email'}
            schema={usersFields}
            required={
              resources !== 'Location' && user_arrays[resources]['email']
            }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('email1') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'email1'}
            schema={usersFields}
            required={user_arrays[resources]['email1']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('email2') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'email2'}
            schema={usersFields}
            required={user_arrays[resources]['email2']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('phoneNumber') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'phoneNumber'}
            schema={usersFields}
            required={user_arrays[resources]['phoneNumber']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('password') &&
        !isEditing && (
          <>
            <Grid
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <InputFormItem
                name={'password'}
                schema={usersFields}
                required={user_arrays[resources]['password']}
                type='password'
              />
            </Grid>
            <Grid
              size={{
                sm: 12,
                md: 6,
              }}
            >
              <InputFormItem
                name={'passwordConfirm'}
                schema={usersFields}
                required={user_arrays[resources]['passwordConfirm']}
              />
            </Grid>
          </>
        )}
      {Object.keys(user_arrays[resources]).includes('otherPhones') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'otherPhones'}
            schema={usersFields}
            required={user_arrays[resources]['otherPhones']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('otherEmails') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputFormItem
            name={'otherEmails'}
            schema={usersFields}
            required={user_arrays[resources]['otherEmails']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('roles') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <RolesSelectItem
            name={'roles'}
            schema={{ ...usersFields, type_type: resources }}
            showCreate={!modal}
            form={form}
            required={user_arrays[resources]['roles']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('branches') && ( // resources !== 'Activity'
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <BranchesSelectItem
            name={'branches'}
            schema={usersFields}
            showCreate={!modal}
            form={form}
            required={user_arrays[resources]['branches']}
            mode='multiple'
            routeName='/branches/autocomplete'
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('address') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <AddressAutcompleteInput form={form} name='address' label='Address' />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('birthday') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <DatePickerFormItem
            name={'birthday'}
            schema={usersFields}
            required={user_arrays[resources]['birthday']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('gender') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <RadioFormItem
            name={'gender'}
            schema={usersFields}
            required={user_arrays[resources]['gender']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('relationshipUsers') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'relationshipUsers'}
            schema={{ ...usersFields, type_type: 'Person' }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['relationshipUsers']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('primarylocation') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <RolesSelectItem
            name={'primarylocation'}
            schema={{ ...usersFields, type_type: 'Location' }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['primarylocation']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('userdefaultlocation') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'userdefaultlocation'}
            schema={{ ...usersFields, type_type: 'Location' }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['userdefaultlocation']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('userdefaultactivity') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'userdefaultactivity'}
            schema={usersFields}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['userdefaultactivity']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('credential') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <RolesSelectItem
            name={'credential'}
            schema={{ ...usersFields, type_type: 'Person' }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['credential']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('roster') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <RolesSelectItem
            name={'roster'}
            schema={{ ...usersFields, type_type: 'Person' }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['roster']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('credentialFunders') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <UsersSelectItem
            name={'credentialFunders'}
            schema={{ ...usersFields, type_type: 'Funder' }}
            showCreate={!modal}
            mode='multiple'
            form={form}
            required={user_arrays[resources]['credentialFunders']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('color') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <ColorSelect
            label='Background Color'
            options={backgroundColorArray}
            selectedOption={form.values.color}
            onOptionChange={(data) => {
              const _color = colorPalette[data.name];

              // Border color based on bg color
              let borderColorBasedBgColor = null;
              if (_color) {
                borderColorBasedBgColor = borderColorArray.find(
                  (c) => _color === c.name,
                );
              } else {
                borderColorBasedBgColor = borderColorArray[0];
              }
              form.setValues({
                ...form!.values,
                color: data,
                borderColor: borderColorBasedBgColor,
              });
            }}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('borderColor') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <ColorSelect
            label='Border Color'
            options={borderColorArray}
            selectedOption={form.values.borderColor}
            onOptionChange={(data) => form.setFieldValue('borderColor', data)}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('hourlyrate') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <InputNumberFormItem
            name={`hourlyrate`}
            schema={usersFields}
            showCreate={!modal}
            form={form}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('salary') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <InputNumberFormItem
            name={`salary`}
            schema={usersFields}
            showCreate={!modal}
            form={form}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('hourlyrevenue') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <InputNumberFormItem
            name={`hourlyrevenue`}
            schema={usersFields}
            showCreate={!modal}
            form={form}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('totals') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <TotaltypesSelectItem
            name={'totals'}
            schema={usersFields}
            showCreate={!modal}
            mode='multiple'
            form={form}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('priority') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <InputNumberFormItem
            name={'priority'}
            schema={usersFields}
            required={user_arrays[resources]['priority']}
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('siblingGroupId') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <SiblingSelectItem
            name={'siblingGroupId'}
            schema={usersFields}
            form={form}
            showCreate={!modal}
            fieldLabel='Sibling Group'
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('defaultDuration') && (
        <Grid
          size={{
            sm: 12,
            md: 6,
          }}
        >
          <label>{usersFields.defaultDuration.label}</label>
          <CustomSelect
            options={usersFields.defaultDuration.options}
            value={usersFields.defaultDuration.options.find(
              (option) => option.value === form.values.defaultDuration,
            )}
            onChange={(data: { value: number }) =>
              form.setFieldValue('defaultDuration', data.value)
            }
            placeholder='Select Duration'
          />
        </Grid>
      )}
      {/* Booleans */}
      {Object.keys(user_arrays[resources]).includes('billable') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'billable'}
            schema={usersFields}
            required={user_arrays[resources]['billable']}
            children={
              <LabelTooltip
                title='Billable: Is this appointment an appointment that can be reimbursed by insurance?'
                icon={<HelpOutlineIcon fontSize='small' />}
              />
            }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('paid') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'paid'}
            schema={usersFields}
            required={user_arrays[resources]['paid']}
            children={
              <LabelTooltip
                title='Paid: Is the employee paid for this activity?'
                icon={<HelpOutlineIcon fontSize='small' />}
              />
            }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('notWorking') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'notWorking'}
            schema={usersFields}
            required={user_arrays[resources]['notWorking']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('auth') && (
        <Grid
          display='none'
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'auth'}
            schema={usersFields}
            required={user_arrays[resources]['auth']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('calendarhide') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'calendarhide'}
            schema={usersFields}
            required={user_arrays[resources]['calendarhide']}
            children={
              <LabelTooltip
                title='Hide on Calendar: Hide this user on the calendar but not make them inactive'
                icon={<HelpOutlineIcon fontSize='small' />}
              />
            }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('waitlisted') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'waitlisted'}
            schema={usersFields}
            required={user_arrays[resources]['waitlisted']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('disabled') &&
        !isCurrentUser && (
          <Grid
            size={{
              sm: 12,
              md: 3,
            }}
          >
            <SwitchFormItem
              name={'disabled'}
              schema={usersFields}
              required={user_arrays[resources]['disabled']}
              // children={
              //   <LabelTooltip
              //     title='Test'
              //     icon={<HelpOutlineIcon fontSize='small' />}
              //   />
              // }
            />
          </Grid>
        )}
      {Object.keys(user_arrays[resources]).includes('supervision') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'supervision'}
            schema={usersFields}
            required={user_arrays[resources]['supervision']}
            children={
              <LabelTooltip
                title='Supervision: Is this activity supervision?'
                icon={<HelpOutlineIcon fontSize='small' />}
              />
            }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('productivityInclude') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'productivityInclude'}
            schema={usersFields}
            required={user_arrays[resources]['productivityInclude']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('productivityExclude') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'productivityExclude'}
            schema={usersFields}
            required={user_arrays[resources]['productivityExclude']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes(
        'supervisionRateInclude',
      ) && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'supervisionRateInclude'}
            schema={usersFields}
            required={user_arrays[resources]['supervisionRateInclude']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('clientReq') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'clientReq'}
            schema={usersFields}
            required={user_arrays[resources]['clientReq']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('locReq') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'locReq'}
            schema={usersFields}
            required={user_arrays[resources]['locReq']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('empNotReq') && (
        <Grid
          size={{
            sm: 12,
            md: 3,
          }}
        >
          <SwitchFormItem
            name={'empNotReq'}
            schema={usersFields}
            required={user_arrays[resources]['empNotReq']}
            // children={
            //   <LabelTooltip
            //     title='Test'
            //     icon={<HelpOutlineIcon fontSize='small' />}
            //   />
            // }
          />
        </Grid>
      )}
      {Object.keys(user_arrays[resources]).includes('notes') && (
        <Grid
          size={{
            sm: 12,
          }}
        >
          <TextAreaFormItem name={'notes'} schema={usersFields} />
        </Grid>
      )}
    </Grid>
  );
};

export default UserInformationForm;
