/* eslint-disable react-hooks/exhaustive-deps */
import { FieldArray, type FormikProps } from 'formik';
import CustomConstraintFormFields from 'pages/CRUD/CustomConstraints/form/CustomConstraintFormFields';
import { Stack } from '@mui/system';
import initializeCustomConstraintValues from 'pages/CRUD/CustomConstraints/helpers/initializeCustomConstraintValues';

type CustomConstraintsFormProps = {
  form: FormikProps<{
    [rest: string]: any;
  }>;
  modal: any;
  resourceName: string;
  users?: any;
  roles?: any;
  locations?: any;
  activities?: any;
  subgroups?: any;
  branches?: any;
  weekdays?: any;
  groupings?: any;
};

const CustomConstraintsGroup = ({
  form,
  modal,
  resourceName,
  groupings,
  users,
  branches,
  weekdays,
  locations,
  activities,
  subgroups,
  roles,
}: CustomConstraintsFormProps) => {
  const { values } = form;
  return (
    <FieldArray name='constraints'>
      {({ remove, push }) => (
        <div>
          {values?.constraints?.length > 0 &&
            values.constraints.map((constraint: any, index: any) => (
              <div className='user-form-block' key={index}>
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
                  //
                  isNested
                  constraint={constraint}
                  formIndex={index}
                />
                <Stack direction='row' justifyContent='flex-end' mt={2}>
                  <button
                    className='btn remove-btn'
                    type='button'
                    onClick={() => {
                      remove(index);
                      if (constraint.id) {
                        const deletedConstraints =
                          form.values.deletedConstraints;
                        if (deletedConstraints) {
                          deletedConstraints.push(constraint.id);
                          form!.setFieldValue(
                            'deletedConstraints',
                            deletedConstraints,
                          );
                        } else {
                          form!.setFieldValue('deletedConstraints', [
                            constraint.id,
                          ]);
                        }
                      }
                    }}
                  >
                    Remove Custom Constraint
                  </button>
                </Stack>
              </div>
            ))}
          <Stack
            direction='row'
            justifyContent='center'
            className='add-user-form-block'
          >
            <button
              className='btn add-btn'
              type='button'
              onClick={() => {
                push(
                  initializeCustomConstraintValues(null, {
                    groupings,
                    users,
                    branches,
                    weekdays,
                    locations,
                    activities,
                    subgroups,
                    roles,
                  }),
                );
              }}
            >
              Add Custom Constraint
            </button>
          </Stack>
        </div>
      )}
    </FieldArray>
  );
};

export default CustomConstraintsGroup;
