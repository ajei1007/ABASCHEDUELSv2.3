import React, { useCallback, useMemo, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import { getAddressCoordinates } from 'utils/getAddressCoordinates';
import { debounce } from 'lodash';

type OptionType = {
  label: string;
  value: any;
};

type AddressAutcompleteInputProps = {
  form: any;
  label: string;
  name: string;
  disabled?: boolean;
  dataQa?: string;
};

const AddressAutcompleteInput: React.FC<AddressAutcompleteInputProps> = ({
  form,
  name,
  label,
  disabled,
  dataQa = 'address-autocomplete-input',
}) => {
  const { setFieldValue, values } = form;

  const handleSelectAddress = useCallback(
    (option: any) => {
      if (!option) {
        setFieldValue(name, null);
        return;
      }
      setFieldValue(name, option);
      getAddressCoordinates(option.label).then(({ latitude, longitude }) => {
        setFieldValue('latitude', latitude);
        setFieldValue('longitude', longitude);
      });
    },
    [name, setFieldValue],
  );

  // 1) create a debounced fetch that calls the callback
  const debouncedFetch = useMemo(
    () =>
      debounce(
        (inputValue: string, callback: (opts: any) => void) => {
          if (!inputValue) {
            callback([]);
            return;
          }
          axios
            .get('/places/autocomplete', { params: { input: inputValue } })
            .then((res) => {
              const opts: any = res.data.predictions.map((p: any) => ({
                label: p.description,
                value: p,
              }));
              callback(opts);
            })
            .catch(() => {
              callback([]);
            });
        },
        500, // 500ms debounce
      ),
    [],
  );

  // 2) clean up on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  return (
    <div className='form-group'>
      <label>{label}</label>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={debouncedFetch}
        onChange={handleSelectAddress}
        value={values[name] as OptionType}
        isClearable
        isDisabled={disabled}
        styles={selectInputControlStyles(false, false, false)}
        placeholder=''
        data-qa={dataQa}
      />
    </div>
  );
};

export default AddressAutcompleteInput;
