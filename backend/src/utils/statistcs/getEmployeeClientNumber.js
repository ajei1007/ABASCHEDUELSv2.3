const { getEmployeeClientNumber } = require('../getEmployeeClientCount');

const employeeClientNumber = async (companyID, branches, subgroups) => {
  const userCount = await getEmployeeClientNumber(
    companyID,
    branches,
    subgroups,
  );

  return { data: userCount };
};

module.exports = employeeClientNumber;
