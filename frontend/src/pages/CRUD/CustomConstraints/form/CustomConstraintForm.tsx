/* eslint-disable react-hooks/exhaustive-deps */
import { type FC, useState } from 'react';
import Widget from 'components/Widget/Widget';
import { Formik, type FormikProps } from 'formik';
import customFormValidationSchema from '../helpers/customFormValidationSchema';
import FormActions from 'pages/CRUD/components/FormActions';
import Loader from 'components/Loader/Loader';
import { Alert, Stack } from '@mui/material';
import CustomConstraintFormFields from './CustomConstraintFormFields';
import customFields from '../helpers/customFields';
import PreparedValues from 'components/FormItems/preparedValues';
import _ from 'lodash';
import generateDescription from '../helpers/generateDescription';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomButton from 'components/Button';
import CustomConstraintExampleModal from './CustomConstarintExampleModal';
import initializeCustomConstraintValues from '../helpers/initializeCustomConstraintValues';
import moment from 'moment';

type CustomFormProps = {
  isEditing: boolean;
  findLoading: boolean;
  saveLoading: boolean;
  record: {
    [rest: string]: any;
  };
  onSubmit: Function;
  onCancel: Function;
  currentUser?: any;
  users: Array<any>;
  locations: Array<any>;
  activities: Array<any>;
  roles: Array<any>;
  subgroups: Array<any>;
  branches: Array<any>;
  weekdays: Array<any>;
  groupings: Array<any>;
};

const CustomConstraintForm: FC<CustomFormProps> = ({
  isEditing,
  findLoading,
  saveLoading,
  record,
  onSubmit,
  onCancel,
  users,
  locations,
  activities,
  roles,
  subgroups,
  branches,
  weekdays,
  groupings,
}) => {
  const [openIconModal, setOpenIconModal] = useState(false);
  // Track current step in local state
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = (values: { [rest: string]: any }) => {
    // @ts-ignore
    const { id, ...data } = PreparedValues(customFields, values || {});
    const description = generateDescription(values);

    if (values.forever) {
      // @ts-ignore
      data.start = '1970-01-01';
      // @ts-ignore
      data.end = '2200-01-01';
    } else {
      // @ts-ignore
      data.start = moment(values.start).format('YYYY-MM-DD');
      // @ts-ignore
      data.end = moment(values.end).format('YYYY-MM-DD');
    }
    onSubmit(id, { ...data, description });
  };

  const title = () =>
    isEditing ? 'Edit Custom Constraints' : 'Add Custom Constraints';
  if (isEditing && !record) return <Loader />;
  return (
    <>
      <Widget
        className='widget-p-md'
        title={
          <Stack flexDirection='row' justifyContent='space-between'>
            <h4>{title()}</h4>
            <CustomButton
              variant='outlined'
              startIcon={<HelpOutlineIcon />}
              onClick={() => setOpenIconModal(!openIconModal)}
            >
              Need Help?
            </CustomButton>
          </Stack>
        }
      >
        <Formik
          onSubmit={handleSubmit}
          initialValues={initializeCustomConstraintValues(record, {
            groupings,
            users,
            branches,
            weekdays,
            locations,
            activities,
            subgroups,
            roles,
          })}
          validationSchema={customFormValidationSchema()}
          enableReinitialize
        >
          {(form: FormikProps<any>) => (
            <form onSubmit={form.handleSubmit}>
              <Stack rowGap='1rem'>
                <CustomConstraintFormFields
                  form={form}
                  users={users}
                  locations={locations}
                  activities={activities}
                  roles={roles}
                  subgroups={subgroups}
                  branches={branches}
                  weekdays={weekdays}
                  groupings={groupings}
                  id={record?.id}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                />
                {!_.isEmpty(form.errors) && (
                  <Alert severity='error'>
                    There is an error in the form, please check all fields!
                  </Alert>
                )}
                <FormActions
                  onSubmit={form.handleSubmit}
                  onReset={(event) => {
                    form.handleReset(event);
                    setActiveStep(0);
                  }}
                  onCancel={() => onCancel()}
                  saveLoading={saveLoading}
                />
              </Stack>
            </form>
          )}
        </Formik>
      </Widget>
      {openIconModal && (
        <CustomConstraintExampleModal
          openIconModal={openIconModal}
          setOpenIconModal={() => setOpenIconModal(!openIconModal)}
        />
      )}
    </>
  );
};

export default CustomConstraintForm;
