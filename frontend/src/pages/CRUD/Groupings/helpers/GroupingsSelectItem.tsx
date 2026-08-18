import axios from 'axios';
import React from 'react';
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import { connect } from 'react-redux';
import type { GroupingsSelectItemProps } from '../../../../types/formik/groupings/groupingsSelectItem'

async function selectList(query: string, limit: number) {
  const params = { query, limit };
  const response = await axios.get(`/groupings/autocomplete`, { params });
  return response.data;
}

const GroupingsSelectItem = (props: GroupingsSelectItemProps) => {
  const fetchToItem = (value: any, limit: number) => {
    return selectList(value, limit);
  };

  const mapper = {
    intoSelect(originalValue: GroupingsSelectItemProps) {
    if (!originalValue) {
      return undefined;
    }

    const value = originalValue.id;
    let label = originalValue.label ? originalValue.label : originalValue.name;

    return {
      key: value,
      value,
      label,
    };
  },

  intoValue(originalValue: GroupingsSelectItemProps) {
    if (!originalValue) {
      return undefined;
    }

    return {
      id: originalValue.value,
      label: originalValue.label,
    };
  },
};

  const {
    form,
    ...rest
  } = props;

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
}

const select = (state: {
  [rest: string]: any
}) => ({
  hasPermissionToCreate: state.groupings.hasPermissionToCreate
});

export default connect(select)(
  GroupingsSelectItem,
);
