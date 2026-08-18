import React from 'react';
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import daysOfWeek from 'constants/daysOfWeek';

export type DaysofweekSelectItemProps = {
  id?: number | string;
  label?: string;
  value?: any;
  form?: any;
  schema?: any;required?:any;required2?:any;
  name?: any;
  showCreate?: any;
  mode?: any;
  fieldOption?: any;
  fieldName?: any;
  fieldOptionData?: any;
  extraFetchFunction?: any;
}

const DaysofweekSelectItem = (props: DaysofweekSelectItemProps) => {
  const fetchToItem = (value: any) => {
    const { extraFetchFunction, fieldOptionData } = props;
    if (extraFetchFunction) {
      return extraFetchFunction(fieldOptionData, value);
    }

    return  daysOfWeek.reduce((acc, item)=>{
      if (!value || item.label.toLowerCase().includes(`${value}`.toLowerCase())) {
        acc.push({
          id: item.value,
          label: item.label,
        })
      }
      return acc;
    }, [] as { id: string, label: string, }[])  
  };

  const mapper = {
    intoSelect(originalValue: DaysofweekSelectItemProps) {
      if (!originalValue) {
        return undefined;
      }

      const value = originalValue.id;
      let label = originalValue.label
        ? originalValue.label
        : originalValue.name;

      return {
        key: value,
        value,
        label,
        ...Object.getOwnPropertySymbols(originalValue).reduce((acc, symb) => {
          acc[symb] = true;
          return acc;
        }, {} as any),
      };
    },

    intoValue(originalValue: DaysofweekSelectItemProps) {
      if (!originalValue) {
        return undefined;
      }

      return {
        id: originalValue.value,
        label: originalValue.label,
      };
    },
  };

  const { form, ...rest } = props;

  return (
    <React.Fragment>
      <AutocompleteFormItem
        {...rest}
        fetchFn={fetchToItem}
        mapper={mapper}
        form={form}
      />
    </React.Fragment>
  );
};

export default DaysofweekSelectItem;
