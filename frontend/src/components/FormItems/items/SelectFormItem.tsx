import React from 'react';
import FormErrors from 'components/FormItems/formErrors';
import { FastField } from 'formik';
// @ts-ignore
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import type { ItemProps } from '../../../types/formik/item';

const SelectFormItem = (props: ItemProps) => {
  const {
    schema,
    form,
    name,
    hint,
    errorMessage,
    required = false,
    placeholder,
    isClearable = true,
  } = props;

  const { label, options } = schema[name!];

  const value = () => {
    if (form!.values[name!]) {
      return options.find(
        (option: { [rest: string]: any }) =>
          option.value === form!.values[name!],
      );
    }
    return '';
  };

  const handleSelect = (data: ItemProps) => {
    form!.setFieldTouched(name);

    if (!data) {
      form!.setFieldValue(name, undefined);
      return;
    }

    form!.setFieldValue(name, data.value);
  };

  const isInvalid = !!FormErrors.displayableError(form!, name!, errorMessage!);

  const controlStyles = isInvalid
    ? ({
        control: (provided: React.CSSProperties) => ({
          ...provided,
          borderColor: 'red',
        }),
      } as StylesConfig)
    : undefined;

  return (
    <FastField name={name}>
      {({ form }: ItemProps) => (
        <div className='form-group'>
          {!!label && (
            <label className={`${required ? 'required' : null}`} htmlFor={name}>
              {`${label}${required ? '*' : ''}`}
            </label>
          )}
          <br />
          <Select
            className='w-100'
            value={value()}
            onChange={handleSelect}
            id={name}
            name={name}
            options={options}
            isMulti={false}
            placeholder={placeholder || ''}
            isClearable={isClearable}
            styles={controlStyles}
            loadingMessage={() => 'Loading'}
            noOptionsMessage={() => 'No options'}
          />

          <div className='invalid-feedback'>
            {FormErrors.displayableError(form!, name!, errorMessage!)}
          </div>

          {!!hint && <small className='form-text text-muted'>{hint}</small>}
        </div>
      )}
    </FastField>
  );
};

export default SelectFormItem;
