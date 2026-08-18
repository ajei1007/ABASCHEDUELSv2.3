import axios from 'axios';
import React from 'react';
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import { connect } from 'react-redux';
import type { EventpairSelectItemProps } from '../../../../types/formik/eventpair/eventpairSelectItem'

async function selectList(query: string, limit: number) {
  const params = { query, limit };
  const response = await axios.get(`/eventpair/autocomplete`, { params });
  return response.data;
}

const EventpairSelectItem = (props: EventpairSelectItemProps) => {
  const fetchToItem = (value: any, limit: number) => {
    return selectList(value, limit);
  };

  const mapper = {
    intoSelect(originalValue: EventpairSelectItemProps) {
    if (!originalValue) {
      return undefined;
    }

    const value = originalValue.id;
    let label = originalValue.label ? originalValue.label : originalValue.roles1;

    return {
      key: value,
      value,
      label,
    };
  },

  intoValue(originalValue: EventpairSelectItemProps) {
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
  hasPermissionToCreate: state.eventpair.hasPermissionToCreate
});

export default connect(select)(
  EventpairSelectItem,
);
