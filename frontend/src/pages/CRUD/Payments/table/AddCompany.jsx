/* eslint-disable eqeqeq */
import { useState } from 'react';
import industries from 'constants/industries';
import FormTreeStructure from './FormTreeStructure';
import { useAppDispatch } from 'store/hooks';
import { loginUser, registerUser } from 'store/actions/authActions';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { Formik } from 'formik';
import companiesFields from '../helpers/paymentsFields';
import IniValues from 'components/FormItems/iniValues';
import CustomInput from 'components/CustomInputModal/CustomInput';
import { Grid2 as Grid, Stack } from '@mui/material';
import CustomButton from 'components/Button';

const AddCompany = (props) => {
  const dispatch = useAppDispatch();
  const industry_options = [{ value: 'ABA', label: 'ABA' }];
  // eslint-disable-next-line no-unused-vars
  const [industry, setIndustry] = useState('ABA');
  const [companyName, setCompanyName] = useState(uuidv4());
  const [roleStructure, setRoleStructure] = useState(
    industries['ABA']['roles'],
  );
  const [branchStructure, setBranchStructure] = useState(
    industries['ABA']['branches'],
  );
  const [cancellationTypesStructure, setCancellationTypesStructure] = useState(
    industries['ABA']['cancellationtypes'],
  );

  const [adminNameFirst, setAdminNameFirst] = useState(uuidv4());
  const [adminNameLast, setAdminNameLast] = useState(uuidv4());
  const [adminEmail, setAdminEmail] = useState(`${uuidv4()}@mail.com`);
  const [adminEmail2, setAdminEmail2] = useState(`${uuidv4()}@mail.com`);
  const [adminPassword, setAdminPassword] = useState('password');

  const iniValues = () => {
    return IniValues(companiesFields, {});
  };

  const postCompany = (data) => {
    axios.post('/scheduler/add_company', data);
  };

  const handleAddCompany = () => {
    setTimeout(() => {
      postCompany({
        industry: industries[industry],
        companyName,
        roleStructure,
        cancellationTypesStructure,
        branchStructure,
      });
    }, 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      registerUser({
        email: adminEmail,
        password: adminPassword,
        firstName: adminNameFirst,
        lastName: adminNameLast,
      }),
    );
    dispatch(
      registerUser({
        email: adminEmail2,
        password: adminPassword,
        firstName: 'abaAdmin',
        lastName: 'abaAdmin',
      }),
    );
    setTimeout(
      () => dispatch(loginUser({ email: adminEmail, password: adminPassword })),
      3000,
    );
    handleAddCompany();
  };

  return (
    <Formik onSubmit={handleSubmit}>
      {(form) => (
        <form onSubmit={form.handleSubmit} initialValues={iniValues()}>
          <Grid container spacing={2} size={12}>
            <Grid size={6}>
              <label>{'Industry'}</label>
              <CustomSelect
                isMulti={false}
                //menuPortalTarget={document.body}
                //id={res.name}
                className={'w-100'}
                classNamePrefix='select'
                placeholder=''
                isClearable={false}
                options={industry_options}
                value={industry_options.filter((e) => e.value == industry)}
                onChange={(data) => {}}
              />
            </Grid>
            <Grid size={6}>
              <label>{'Company Name'}</label>
              <CustomInput
                value={companyName}
                onChange={(data) => {
                  setCompanyName(data.target.value);
                  setAdminEmail(
                    `${data.target.value.replace(/\s+/g, '')}@mail.com`,
                  );
                  setAdminEmail2(
                    `ABA.${data.target.value.replace(/\s+/g, '')}@mail.com`,
                  );
                }}
              />
            </Grid>
            <Grid size={6}>
              <label>{'Admin First Name'}</label>
              <CustomInput
                value={adminNameFirst}
                onChange={(data) => {
                  setAdminNameFirst(data.target.value);
                }}
              />
            </Grid>
            <Grid size={6}>
              <label>{'Admin Last Name'}</label>
              <CustomInput
                value={adminNameLast}
                onChange={(data) => {
                  setAdminNameLast(data.target.value);
                }}
              />
            </Grid>
            <Grid size={6}>
              <label>{'Admin Email'}</label>
              <CustomInput
                value={adminEmail}
                onChange={(data) => {
                  setAdminEmail(data.target.value.replace(/\s+/g, ''));
                }}
              />
            </Grid>
            <Grid size={6}>
              <label>{'Admin Password'}</label>
              <CustomInput
                type='password'
                value={adminPassword}
                onChange={(data) => {
                  setAdminPassword(data.target.value);
                }}
              />
            </Grid>
          </Grid>

          <FormTreeStructure
            initialData={industries['ABA']['roles']}
            type={'Role'}
            roleStructure={roleStructure}
            setRoleStructure={setRoleStructure}
            levels={true}
            plus={true}
            color={true}
          />

          <FormTreeStructure
            initialData={industries['ABA']['branches']}
            roleStructure={branchStructure}
            setRoleStructure={setBranchStructure}
            type={'Branch'}
            levels={true}
            color={false}
            plus={false}
          />

          <FormTreeStructure
            initialData={industries['ABA']['cancellationtypes']}
            type={'Cancellation Types'}
            roleStructure={cancellationTypesStructure}
            setRoleStructure={setCancellationTypesStructure}
            levels={false}
            color={false}
            plus={true}
          />
          <Stack alignItems='center'>
            <CustomButton type={'submit'}>Add Company</CustomButton>
          </Stack>
        </form>
      )}
    </Formik>
  );
};

export default AddCompany;
