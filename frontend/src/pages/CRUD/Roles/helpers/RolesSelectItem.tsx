import axios from 'axios';
import React from 'react';
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import { connect } from 'react-redux';
import type { RolesSelectItemProps } from '../../../../types/formik/roles/rolesSelectItem';

async function selectList(query: string, limit: number, name: string) {
  const params = { query, limit };
  let response = { data: [] };
  if (name) {
    response = await axios.get(`/roles/autocomplete/${name}`, { params });
  } else {
    response = await axios.get(`/roles/autocomplete`, { params });
  }
  return response.data;
}

const RolesSelectItem = (props: RolesSelectItemProps) => {
  const fetchToItem = (value: any, limit: number) => {
    return selectList(value, limit, props.schema.type_type);
  };

  const mapper = {
    intoSelect(originalValue: RolesSelectItemProps) {
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
      };
    },

    intoValue(originalValue: RolesSelectItemProps) {
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

const select = (state: { [rest: string]: any }) => ({
  hasPermissionToCreate: state.roles.hasPermissionToCreate,
});

export default connect(select)(RolesSelectItem);
