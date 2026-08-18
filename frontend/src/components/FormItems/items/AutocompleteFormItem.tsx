import { FastField } from 'formik';
import FormErrors from 'components/FormItems/formErrors';
// @ts-ignore
import AsyncSelect from 'react-select/async';
import type { ItemProps } from '../../../types/formik/item';
import CustomErrorMessage from 'components/CustomErrorMessage/CustomErrorMessage';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import { REACT_SELECT_OPTION_DISABLED } from 'constants/symbols'

const AUTOCOMPLETE_SERVER_FETCH_SIZE = 300;

const AutocompleteFormItem = (props: ItemProps) => {
  const {
    form,
    name,
    mapper,
    schema,
    fetchFn,
    placeholder,
    autoFocus,
    inputProps,
    errorMessage,
    isClearable = true,
    mode = 'default',
    required = false,
    required2,
    fieldName,
    fieldOption,
    fieldLabel,
  } = props;

  const namesArr = name?.split('.');
  const updatedName = namesArr ? namesArr[namesArr?.length - 1] : '';
  const { label } = schema[updatedName!];

  const formObject = fieldOption ? fieldOption[fieldName] : form!.values[name!];

  const valueOne = () => {
    if (formObject) {
      return mapper!.intoSelect(formObject);
    }
    return '';
  };

  const valueMultiple = () => {
    if (formObject) {
      return formObject.map((value: object) => mapper!.intoSelect(value));
    }
    return [];
  };

  const value = () => {
    return mode === 'multiple' ? valueMultiple() : valueOne();
  };

  const handleSelectOne = (value: object) => {
    if (!value) {
      form!.setFieldValue(name, '');
      return;
    }
    form!.setFieldValue(name, mapper!.intoValue(value));
  };

  const handleSelectMultiple = async (values: Array<any>) => {
    if (!values) {
      form!.setFieldValue(name, []);
      return;
    }

    const selectAll = values.length ? values.find((val: any) => val.key === 'select-all') : null;
    if (selectAll) {
      const results = await fetchFn!('', AUTOCOMPLETE_SERVER_FETCH_SIZE);
      return form!.setFieldValue(
        name,
        results
          .filter(
            (item: any) => !Object.hasOwn(item, REACT_SELECT_OPTION_DISABLED),
          )
          .map((val: any) =>
            mapper!.intoValue({
              ...val,
              value: val.id,
            }),
          ),
      );
    }
    return form!.setFieldValue(
      name,
      values.map((value) => mapper!.intoValue(value)),
    );
  };

  const handleSelect = (value: object | Array<any>) => {
    form!.setFieldTouched(name);
    if (mode === 'multiple' && Array.isArray(value)) {
      return handleSelectMultiple(value);
    } else {
      return handleSelectOne(value);
    }
  };

  const handleSearch = async (value: string) => {
    try {
      const results = await fetchFn!(value, AUTOCOMPLETE_SERVER_FETCH_SIZE);

      if (mode !== 'multiple' || results.length === 0 || value !== '') {
        return results.map((result: string) => mapper!.intoSelect(result));
      }

      let updatedResults = [
        {
          id: 'select-all',
          label: 'Select All',
          name: 'Select All',
        },
        ...results,
      ];
      return updatedResults.map((result: string) => mapper!.intoSelect(result));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const isInvalid = !!FormErrors.displayableError(form!, name!, errorMessage!);
  const controlStyles = selectInputControlStyles(isInvalid, required2);

  return (
    <FastField name={name}>
      {() => (
        <div
          style={{ color: required2 ? 'red' : 'black' }}
          className='required form-group'
        >
          {!!label && (
            <label
              className={`required ${
                required ? 'required' : null
              }`}
              htmlFor={name}
            >
              {`${fieldLabel || label}${required ? ' *' : ''}`}
            </label>
          )}
          <div style={{ display: 'flex' }}>
            <AsyncSelect
              className={'w-100'}
              styles={controlStyles}
              classNamePrefix='select'
              id={name?.replaceAll('.', '-') + '-user-form'}
              name={name}
              defaultOptions={true}
              isMulti={mode === 'multiple' ? true : false}
              loadOptions={handleSearch}
              placeholder={placeholder || ''}
              isOptionDisabled={(option: any) => Object.hasOwn(option, REACT_SELECT_OPTION_DISABLED)}
              autoFocus={autoFocus || undefined}
              onChange={handleSelect}
              value={value()}
              isClearable={isClearable}
              {...inputProps}
            />
          </div>
          <CustomErrorMessage name={name} form={form} />
        </div>
      )}
    </FastField>
  );
};

export default AutocompleteFormItem;
