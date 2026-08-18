const UsersDBApi = require('../db/api/users');
const { getRoleHierarchy } = require('./roleHierarchy');


const getEmployeeClientNumber = async (companyId, branchList, subgroupList) => {
  const roleHierarchy = await getRoleHierarchy(companyId);
 
  let employeeRoleList = [];
  let clientRoleList = [];
 
 
  Object.entries(roleHierarchy).map((t) => {
    const [key, value] = t;
    if (value.includes('Client')) {
      clientRoleList.push(key);
    }

    if (value.includes('Employee')) {
      employeeRoleList.push(key);
    }
  });
   
  let result = await UsersDBApi.countEmployeeClientUsers({
    companyId: companyId,
    employee: employeeRoleList,
    client :clientRoleList,
    branches: branchList,
    subgroups: subgroupList,
  });


  let employeeNumber = result.employee
  let clientNumber = result.client

  return {employee : employeeNumber, client : clientNumber};
};

module.exports = {
    getEmployeeClientNumber
};
  