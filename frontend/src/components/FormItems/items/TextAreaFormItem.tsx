import React from 'react';
import FormErrors from 'components/FormItems/formErrors';
import { FastField } from 'formik';
import type {ItemProps} from '../../../types/formik/item';
import { Typography } from '@mui/material';

const TextAreaFormItem = (props: ItemProps) => {
  const {
    name,
    schema,
    hint,
    size,
    type = 'text',
    placeholder,
    autoFocus,
    autoComplete,
    inputProps,
    errorMessage,
    required = false,
    // required2 = false,
    helperText,
  } = props;

  const { label } = schema[name!];

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
          <textarea
            id={name}
            type={type}
            onChange={(event) => {
              form!.setFieldValue(name, event.target.value);
              form!.setFieldTouched(name);
            }}
            value={form!.values[name!] || ''}
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
          <div className='invalid-feedback'>
            {FormErrors.displayableError(form!, name!, errorMessage!)}
          </div>
          {helperText && <Typography fontSize='0.85rem' pt={'0.5rem'} color='#6b859e'>{helperText}</Typography>}
          {!!hint && <small className='form-text text-muted'>{hint}</small>}
        </div>
      )}
    </FastField>
  );
}

export default TextAreaFormItem;
