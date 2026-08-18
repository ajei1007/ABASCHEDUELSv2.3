import { FastField } from 'formik';
import React, { useEffect, useState} from 'react';
import FormErrors from '../formErrors';
// @ts-ignore
import Select from 'react-select';
import type {ItemProps} from '../../../types/formik/item';

const AutocompleteInMemoryFormItem = (props: ItemProps) => {
  const {
    form,
    label,
    name,
    mapper,
    fetchFn,
    hint,
    size,
    placeholder,
    autoFocus,
    inputProps,
    errorMessage,
    showCreate,
    hasPermissionToCreate,
    mode = 'default',
    required = false,required2 = false,
    isClearable = true,
  } = props;

  const [fullDataSource, setFullDataSource] = useState<any[] | never[]>([])
  const [loading, setLoading] = useState(false);

  const valueOne = () => {
    if (form!.values[name!]) {
      return mapper!.toAutocomplete(form!.values[name!]);
    }
    return '';
  }

  const valueMultiple = () => {
    if (form!.values[name!]) {
      return form!.values[name!].map((value: {[rest: string]: any}) => mapper!.toAutocomplete(value));
    }
    return [];
  }

  const value = () => {
    if (mode === 'multiple') {
      return valueMultiple();
    } else {
      return valueOne();
    }
  }

  const handleSelectOne = (value: {[rest: string]: any}) => {
    if (!value) {
      form!.setFieldValue(name, '');
      return;
    }
    form!.setFieldValue(name, mapper!.toValue(value))
  }

  const handleSelectMultiple = (values: {[rest: string]: any}[]) => {
    if (!values) {
      form!.setFieldValue(name, []);
      return;
    }
    form!.setFieldValue(
      name,
      values.map((value) => mapper!.toValue(value))
    );
  };

  const handleSelect = (value: {[rest: string]: any}[] | ItemProps) => {
    form!.setFieldTouched(name);
    if (mode === 'multiple' && Array.isArray(value)) {
      return handleSelectMultiple(value);
    } else {
      return handleSelectOne(value);
    }
  };

  const fetchAllResults = async () => {
    setLoading(true);
    try {
      let fullDataSource = await fetchFn!();
      fullDataSource = fullDataSource.map((data: ItemProps) => mapper!.toAutocomplete(data));
      setFullDataSource([...fullDataSource]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setFullDataSource([]);
      setLoading(false);
      return [];
    }
  };

  const options = (): any[] => {
    // MEANINGLESS FUNCTION
    // @ts-ignore
    setFullDataSource([...options]);
    if (!options) {
      return [];
    }
    if (value()) {
      if (mode === 'multiple') {
        // @ts-ignore
        return [...value(), ...options];
      } else {
        // @ts-ignore
        return [...value(), ...options];
      }
    }
    // @ts-ignore
    return options;
  }

  useEffect(() => {
    async function processData() {
      await fetchAllResults();
    }
    processData();
  }, []);

  const hintOrLoading = loading
    ? 'Loading'
    : hint;

  const isInvalid = !!FormErrors.displayableError(
    form!,
    name!,
    errorMessage!,
  );

  const controlStyles = isInvalid
    ? { control: (provided: React.CSSProperties) => ({ ...provided, borderColor: 'red' }) }
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
          <div style={{ display: 'flex' }}>
            <Select
              className='w-100'
              styles={controlStyles}
              id={name}
              name={name}
              isMulti={mode === 'multiple' ? true : false}
              placeholder={placeholder || ''}
              autoFocus={autoFocus || undefined}
              onChange={handleSelect}
              value={value()}
              isClearable={isClearable}
              options={options()}
              loadingMessage={() => 'autocomplete.loading'}
              noOptionsMessage={() => 'autocomplete.noOptions'}
              {...inputProps}
            />

            {showCreate && hasPermissionToCreate ? (
              <button
                style={{ marginLeft: '16px' }}
                className='btn btn-primary'
                type='button'
                onClick={() => {}}
              >
                <i className='fas fa-plus'></i>
              </button>
            ) : null}
          </div>
          <div className='invalid-feedback'>
            {FormErrors.displayableError(form!, name!, errorMessage!)}
          </div>
          {!!hintOrLoading && (
            <small className='form-text text-muted'>{hintOrLoading}</small>
          )}
        </div>
      )}
    </FastField>
  );
}

export default AutocompleteInMemoryFormItem;
