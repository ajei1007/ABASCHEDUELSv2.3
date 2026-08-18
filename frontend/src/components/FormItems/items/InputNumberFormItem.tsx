import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import FormErrors from 'components/FormItems/formErrors';
import { FastField } from 'formik';
import type { ItemProps } from '../../../types/formik/item';

const InputNumberFormItem = (props: ItemProps) => {
  const {
    name,
    schema,
    size,
    type = 'number',
    placeholder,
    autoFocus,
    autoComplete,
    inputProps,
    errorMessage,
    required = false,
    fieldOption,
    fieldName,
  } = props;

  const namesArr = name?.split('.');
  const updatedName = namesArr ? namesArr[namesArr?.length - 1] : '';
  const { label } = schema[updatedName!];

  const sizeInputClassName = {
    small: 'form-control-sm',
    large: 'form-control-lg',
  }[size!] || '';

  return (
    <FastField name={name}>
      {({ form }: ItemProps) => (
        <div className='form-group'>
          {!!label && (
            <label className={`${required ? 'required' : null}`} htmlFor={name}>
              {`${label}${required ? '*' : ''}`}
            </label>
          )}
          <input
            id={name?.replaceAll('.', '-') + '-user-form'}
            name={name}
            type={type}
            onChange={(event) => {
              form!.setFieldValue(name, event.target.value);
            }}
            value={
              (fieldOption ? fieldOption[fieldName] : form!.values[name!]) || ''
            }
            placeholder={placeholder || undefined}
            autoFocus={autoFocus || undefined}
            autoComplete={autoComplete || undefined}
            className={`form-control ${sizeInputClassName} ${FormErrors.validateStatus(
              form!,
              name!,
              errorMessage!,
            )}`}
            {...inputProps}
          />
          <CustomErrorMessage name={name} form={form} />
        </div>
      )}
    </FastField>
  );
}

export default InputNumberFormItem;
