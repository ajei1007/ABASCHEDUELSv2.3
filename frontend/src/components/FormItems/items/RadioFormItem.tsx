import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { useFormikContext } from 'formik';
import type { ItemProps } from '../../../types/formik/item';
import { Grid2 as Grid } from '@mui/material';

const RadioFormItem = (props: ItemProps) => {
  const { name, schema, fieldName, fieldOption, required = false } = props;
  const form = useFormikContext<any>();
  const namesArr = name?.split('.');
  const updatedName = namesArr ? namesArr[namesArr?.length - 1] : '';
  const { label, options } = schema[updatedName!];

  return (
    <Grid container>
      {/* <div className='form-group'> */}
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 12
        }}>
        {!!label && (
          <label className={`${required ? 'required' : null}`} htmlFor={name}>
            {`${label}${required ? '*' : ''}`}
          </label>
        )}
        <br />
      </Grid>
      <Grid
        container
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 6
        }}>
        {options.map((option: { [rest: string]: any }, index: number) => (
          <Grid
            key={option.value}
            size={{
              sm: 12,
              xs: 12,
              md: 3,
              lg: 2
            }}>
            <input
              className='form-check-input'
              type='radio'
              id={name?.replaceAll('.', '-') + '-user-form'}
              name={`${name}-${option.value}`}
              value={option.value}
              checked={
                option.value ===
                (fieldOption ? fieldOption[fieldName] : form!.values[name!])
              }
              onChange={(e) =>
                form!.setFieldValue(name as string, e.target.value)
              }
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className='form-check-label'
            >
              {option.label}
            </label>
          </Grid>
        ))}
      </Grid>
      <CustomErrorMessage name={name} form={form} />
      {/* </div> */}
    </Grid>
  );
};

export default RadioFormItem;
