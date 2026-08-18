import React from 'react';
import CompaniesTable from 'pages/CRUD/Companies/table/CompaniesTable';
import AddCompany from 'pages/CRUD/CompaniesOld/table/AddCompany';

const CompaniesTablePage = () => {
  return (
    <div>
      <CompaniesTable />
      <AddCompany />
    </div>
  );
}

export default CompaniesTablePage;
