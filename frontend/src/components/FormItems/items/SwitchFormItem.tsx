import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { useFormikContext } from 'formik';
import type { ItemProps } from '../../../types/formik/item';

const SwitchFormItem = (props: ItemProps) => {
  const {
    name,
    schema,
    children,
    inputProps,
    required,
    fieldOption,
    fieldName,
    disabled = false,
    onChange
  } = props;

  const namesArr = name?.split('.');
  const updatedName = namesArr ? namesArr[namesArr?.length - 1] : '';
  const { label } = schema[updatedName!];

  const form: any = useFormikContext();
  return (
    <div>
      {!!label && (
        <label className={`${required ? 'required' : null}`} htmlFor={name}>
          {`${label}${required ? '*' : ''}`}
          {children}
        </label>
      )}
      <div>
        <input
          type='checkbox'
          disabled={disabled}
          id={name?.replaceAll('.', '-') + '-user-form'}
          name={name}
          onChange={(event) => {
            if (onChange && typeof onChange === 'function') {
              onChange(event)
            } else {
              form.setFieldValue(name, event.target.checked);
            }
          }}
          checked={
            !!(fieldOption ? fieldOption[fieldName] : form!.values[name!]) || ''
          }
          {...inputProps}
        />
        <label htmlFor={name}>&#160;</label>
      </div>
      <CustomErrorMessage name={name} form={form} />
    </div>
  );
};

export default SwitchFormItem;
