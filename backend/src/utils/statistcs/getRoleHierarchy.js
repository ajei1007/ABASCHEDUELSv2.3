const { getRoleHierarchy } = require('../roleHierarchy');

const roleHierarchy = async (companyID) => {
  const roleHierarchy = await getRoleHierarchy(companyID);
  return roleHierarchy ;
};

module.exports = roleHierarchy;
