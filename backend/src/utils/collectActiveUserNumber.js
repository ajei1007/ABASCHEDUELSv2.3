const CompaniesDBApi = require('../db/api/companies');
const CompanyActiveUserStatsDBApi = require('../db/api/companyActiveUserStats');
const getEmployeeClientNumber = require('../utils/statistcs/getEmployeeClientNumber');
const moment = require('moment');

const collectActiveUserNumber = async () => {
  // 1. Get the company list
  const companies = await CompaniesDBApi.findAll({ excludeDisabled: true });
  let companyStats = new Array();
  for (let i = 0; i < companies.rows.length; i++) {
    companyStats.push({
      id: companies.rows[i].dataValues.id,
      employeeNumber: 0,
      clientNumber: 0,
      date: moment.utc().format('YYYY-MM-DD'),
    });
  }

  // 2. Get the active user number for each company
  // 3. Add the active user number for employee and client for each company
  for (let m = 0; m < companyStats.length; m++) {
    let currentCompany = companyStats[m];
    // no branch and subgroup filter that is why last 2 parameters are empty arrays
    const userCount = await getEmployeeClientNumber(currentCompany.id, [], []);
    currentCompany.employeeNumber = userCount.data.employee;
    currentCompany.clientNumber = userCount.data.client;
    let alreadyExistingStats = await CompanyActiveUserStatsDBApi.findBy({
      date: currentCompany.date,
      companyId: currentCompany.id,
    });
    if (!alreadyExistingStats) {
      // if company X has no stats for date Y then create it
      await CompanyActiveUserStatsDBApi.create(
        {
          companyId: currentCompany.id,
          date: currentCompany.date,
          employeeNumber: currentCompany.employeeNumber,
          clientNumber: currentCompany.clientNumber,
        },
        {},
      );
    } else {
      // if company X has stats for date Y then update it if there is increase on client or employee number
      let isThereIncrease = false;
      let maxEmployee = alreadyExistingStats.employeeNumber;
      let maxClient = alreadyExistingStats.clientNumber;

      // check employee number
      if (currentCompany.employeeNumber > alreadyExistingStats.employeeNumber) {
        maxEmployee = currentCompany.employeeNumber;
        isThereIncrease = true;
      }

      // check client number
      if (currentCompany.clientNumber > alreadyExistingStats.clientNumber) {
        maxClient = currentCompany.clientNumber;
        isThereIncrease = true;
      }

      if (isThereIncrease) {
        await CompanyActiveUserStatsDBApi.update(
          alreadyExistingStats.id,
          {
            employeeNumber: maxEmployee,
            clientNumber: maxClient,
          },
          {},
        );
      }
    }
  }
};

module.exports = {
  collectActiveUserNumber,
};
