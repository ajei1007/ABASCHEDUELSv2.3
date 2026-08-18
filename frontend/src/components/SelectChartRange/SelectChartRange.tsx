import { useState } from 'react';
// @ts-ignore
import Select from 'react-select';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';

const DATE_RANGE = [
  {
    label: 'This Week', 
    value: 'weekly'
  },
  {
    label: 'This Month', 
    value: 'monthly'
  }
]

const SelectChartRange = () => {
  const [selected, setSelected] = useState(DATE_RANGE[0]);

  const handleChange = (_selected: any) => {
    setSelected(_selected);
  };
  return (
    <Select
      name='select-chart-range'
      classNamePrefix='select'
      isMulti={false}
      onChange={handleChange}
      styles={selectInputControlStyles(false, false, false)}
      className={'w-100'}
      value={selected}
      options={DATE_RANGE}
    />
  );
};

export default SelectChartRange;
