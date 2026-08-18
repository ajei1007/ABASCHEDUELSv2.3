import axios from 'axios';
import React from 'react';
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import { connect } from 'react-redux';
import type { FounderServiceLinesSelectItemProps } from '../../../../types/formik/founderServiceLines/founderServiceLinesSelectItem'

async function selectList(query: string, limit: number) {
  const params = { query, limit };
  const response = await axios.get(`/founderServiceLines/autocomplete`, { params });
  return response.data;
}

const FounderServiceLinesSelectItem = (props: FounderServiceLinesSelectItemProps) => {
  const fetchToItem = (value: any, limit: number) => {
    return selectList(value, limit);
  };

  const mapper = {
    intoSelect(originalValue: FounderServiceLinesSelectItemProps) {
    if (!originalValue) {
      return undefined;
    }

    const value = originalValue.id;
    let label = originalValue.label ? originalValue.label : originalValue.user1;

    return {
      key: value, 
      value,
      label,
    };
  },

  intoValue(originalValue: FounderServiceLinesSelectItemProps) {
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
  hasPermissionToCreate: state.founderServiceLines.hasPermissionToCreate
});

export default connect(select)(
  FounderServiceLinesSelectItem,
);
