import type { FC } from 'react';
import { FieldArray, type FormikProps } from 'formik';
// @ts-ignore
import Select from 'react-select';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import { Stack, Typography } from '@mui/material';
// import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import FormErrors from 'components/FormItems/formErrors';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';

type DynamicFieldsProps = {
  label: string;
  name: string;
  form: FormikProps<any>;
  options: Array<{
    label: string;
    value: string;
  }>;
  isMulti?: boolean;
};

const DynamicFields: FC<DynamicFieldsProps> = ({
  label,
  name,
  form,
  options,
  isMulti = true,
}) => {
  return (
    <Stack>
      {/* <Typography
        marginBottom='1rem'
        fontWeight='600'
        fontSize='1.15rem'
        textTransform='capitalize'
      >
        {label}
      </Typography> */}
      <FieldArray name={name}>
        {() => (
          <>
            {form.values?.[name].length > 0 &&
              form.values?.[name].map((val: any, index: any) => {
                const fieldValue = val;
                const fieldName = `${name}.${index}`;
                return (
                  <Stack marginBottom='1rem' key={index}>
                    <Typography textTransform='capitalize'>{label}</Typography>
                    <Stack direction='row' alignItems='center' spacing='1rem'>
                      <Select
                        id={name + index}
                        isMulti={isMulti}
                        className='w-100'
                        classNamePrefix='select'
                        placeholder=''
                        styles={selectInputControlStyles(
                          !!FormErrors.displayableError(form!, name!),
                        )}
                        options={options}
                        value={fieldValue}
                        onChange={(vals: any) => {
                          if (isMulti) {
                            form!.setFieldValue(
                              fieldName,
                              vals.map((val: any) => ({
                                ...val,
                                id: val.value,
                              })),
                            );
                          } else {
                            form!.setFieldValue(fieldName, {
                              ...vals,
                              id: vals.value,
                            });
                          }
                        }}
                      />
                      {/* {index > 0 && (
                        <IconButton
                          aria-label='delete'
                          onClick={() => remove(index)}
                        >
                          <HighlightOffOutlinedIcon />
                        </IconButton>
                      )} */}
                    </Stack>
                    <CustomErrorMessage name={name} form={form} />
                  </Stack>
                );
              })}
            {/* <Stack
              direction='row'
              justifyContent='center'
              className='add-user-form-block'
            >
              <IconButton onClick={() => push([])}>
                <AddCircleOutlineOutlinedIcon />
              </IconButton>
            </Stack> */}
          </>
        )}
      </FieldArray>
    </Stack>
  );
};

export default DynamicFields;
