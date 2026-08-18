import AsyncSelect from 'react-select/async';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';

const CustomAsyncSelect = ({
  value,
  onChange,
  placeholder = '',
  className = 'w-100',
  isMulti = false,
  isInvalid = false,
  loadOptions,
  ...rest
}) => {
  return (
    <AsyncSelect
      styles={selectInputControlStyles(isInvalid, false, false)}
      className={className}
      classNamePrefix='select'
      placeholder={placeholder}
      isMulti={isMulti}
      loadOptions={loadOptions}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

export default CustomAsyncSelect;
