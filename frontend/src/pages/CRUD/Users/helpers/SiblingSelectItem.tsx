import axios from 'axios';
import React from 'react';
//@ts-ignore
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import { connect } from 'react-redux';
import { type UsersSelectItemProps } from '../../../../types/formik/users/usersSelectItem';

async function selectList(
  query: string,
  limit: number,
  name: string,
  click: any,
) {
  const params = { query, limit };
  const response = await axios.get(`/users/siblingGroups`, { params });
  return response.data.rows;
}

const SiblingSelectItem = (props: UsersSelectItemProps) => {
  const fetchToItem = (value: any, limit: number) => {
    const { extraFetchFunction, schema, fieldOptionData, autoCompleteName } =
      props;
    if (extraFetchFunction) {
      return extraFetchFunction(fieldOptionData, value);
    }
    return selectList(value, limit, schema.type_type ?? autoCompleteName, schema.flick);
  };
  const mapper = {
    intoSelect(originalValue: UsersSelectItemProps) {
      if (!originalValue) {
        return undefined;
      }

      const value = originalValue.id;
      let label = originalValue.label
        ? originalValue.label
        : originalValue.firstName;
      if(!originalValue.label && originalValue.lastName){
        label = originalValue.firstName + ' ' + originalValue.lastName
      }
      return {
        key: value,
        value,
        label,
      };
    },

    intoValue(originalValue: UsersSelectItemProps) {
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
  hasPermissionToCreate: state.users.hasPermissionToCreate,
});

export default connect(select)(SiblingSelectItem);
