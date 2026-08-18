const isUserRoleOrHigher = (userRole, targetRole) => {
  const roleHierarchy = {
    user: ['user'],
    admin: ['user', 'admin'], // admin inherits user
    superAdmin: ['user', 'admin', 'superAdmin'], // superAdmin inherits user and admin
  };

  return roleHierarchy[userRole]?.includes(targetRole) || false;
};

module.exports = isUserRoleOrHigher;
