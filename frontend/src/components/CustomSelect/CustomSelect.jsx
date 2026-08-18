import { useMemo } from 'react';
import Select from 'react-select';
import { components } from 'react-select';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = '',
  className = 'w-100',
  isMulti = false,
  isInvalid = false,
  dataQa = '',
  ...rest
}) => {
  const QaSelectContainer = useMemo(
    () => (props) => (
      <components.SelectContainer
        {...props}
        innerProps={{
          ...props.innerProps,
          'data-qa': dataQa /* ← lands on root <div> */,
        }}
      />
    ),
    [dataQa],
  );

  return (
    <Select
      styles={selectInputControlStyles(isInvalid, false, false)}
      className={className}
      classNamePrefix='select'
      placeholder={placeholder}
      isMulti={isMulti}
      options={options}
      value={value}
      onChange={onChange}
      components={{ SelectContainer: QaSelectContainer }}
      {...rest}
    />
  );
};

export default CustomSelect;
