import React, { useEffect } from 'react';
import CompaniesWidget from 'pages/CRUD/Companies/page/CompaniesWidget';
import actions from 'store/actions/companies/companiesFormActions';
import { useAppDispatch } from 'store/hooks';
import { useTypedSelector } from "../../../../hooks/useTypedSelector";
import { useParams } from 'react-router';

const CompaniesViewPage = () => {
  const loading = useTypedSelector(store => store.companies.form.findLoading);
  const record = useTypedSelector(store => store.companies.form.record);
  const dispatch = useAppDispatch();
  const { id } = useParams<any>();

  useEffect(() => {
    dispatch(actions.doFind(id || ''))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <React.Fragment>
      <CompaniesWidget
      loading={loading}
      record={record}
      />
    </React.Fragment>
  );
}

export default CompaniesViewPage;
