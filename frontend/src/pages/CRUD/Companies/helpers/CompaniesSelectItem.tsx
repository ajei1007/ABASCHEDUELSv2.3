import axios from 'axios';
import React from 'react';
import AutocompleteFormItem from 'components/FormItems/items/AutocompleteFormItem';
import { connect } from 'react-redux';
import type { CompaniesSelectItemProps } from '../../../../types/formik/companies/companiesSelectItem'

async function selectList(routeName: string, query: string, limit: number) {
  const params = { query, limit };
  const response = await axios.get(routeName, { params });
  return response.data;
}

const CompaniesSelectItem = (props: CompaniesSelectItemProps) => {
  const {
    routeName = '/companies/autocomplete'
  } = props;
  const fetchToItem = (value: any, limit: number) => {
    return selectList(routeName, value, limit);
  };

  const mapper = {
    intoSelect(originalValue: CompaniesSelectItemProps) {
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

  intoValue(originalValue: CompaniesSelectItemProps) {
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
  hasPermissionToCreate: state.companies.hasPermissionToCreate
});

export default connect(select)(
  CompaniesSelectItem,
);
