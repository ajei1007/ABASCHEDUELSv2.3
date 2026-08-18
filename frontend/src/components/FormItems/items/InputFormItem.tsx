import Tooltip from '@mui/material/Tooltip';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import FormErrors from 'components/FormItems/formErrors';
import { useFormikContext } from 'formik';
import type { ItemProps } from '../../../types/formik/item';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import passwordGenerator from 'utils/passwordGenerator';
import { Stack, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const InputFormItem = (props: ItemProps) => {
  const {
    name,
    schema,
    size,
    password,
    placeholder,
    autoFocus,
    autoComplete,
    inputProps,
    errorMessage,
    required = false,
    fieldOption,
    fieldName,
    label1,
    type = 'text',
    helperText,
    tooltip = '',
  } = props;
  const form = useFormikContext<any>();

  const handleGeneratePassword = () => {
    const password = passwordGenerator();
    form!.setValues({
      ...form!.values,
      password,
      passwordConfirm: password,
    });
  };

  const namesArr = name?.split('.');
  const updatedName = namesArr ? namesArr[namesArr?.length - 1] : '';

  let { label } = label1 ? label1 : schema[updatedName!];
  label = label1 ? label1 : label;

  const sizeInputClassName =
    {
      small: 'form-control-sm',
      large: 'form-control-lg',
    }[size!] || '';

  return (
    <div className='form-group'>
      <Stack direction='row'>
        {!!label && (
          <label className={`${required ? 'required' : null}`} htmlFor={name}>
            {`${label}${required ? '*' : ''}`}
          </label>
        )}
        {type === 'password' && (
          <Tooltip title='Generate password' placement='right' arrow>
            <button
              id='MagicButtonTooltip'
              className='magic-button'
              type='button'
              onClick={() => {
                handleGeneratePassword();
              }}
            >
              <AutoFixHighOutlinedIcon />
            </button>
          </Tooltip>
        )}
        {tooltip && (
            <Tooltip title={tooltip} placement='right' arrow>
            <button
              id='MagicButtonTooltip'
              className='magic-button'
              type='button'
              
            >
              <HelpOutlineIcon fontSize='small' />
            </button>
          </Tooltip>
        )}
      </Stack>
      <input
        id={name?.replaceAll('.', '-') + '-user-form'}
        name={name}
        type={password ? 'password' : 'text'}
        onChange={(event) => {
          form!.setFieldValue(name as string, event.target.value);
        }}
        value={
          (fieldOption
            ? fieldOption[fieldName]
            : form.values[name as string]) || ''
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
      {helperText && <Typography fontSize='0.85rem' pt={'0.5rem'} color='#6b859e'>{helperText}</Typography>}
      <CustomErrorMessage name={name} form={form} />
    </div>
  );
};

export default InputFormItem;
