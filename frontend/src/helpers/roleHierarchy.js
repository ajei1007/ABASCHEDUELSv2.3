const isRoleOrHigher = (userRole, targetRole) => {
    const roleHierarchy = {
      'admin': ['admin'],
      'superAdmin': ['admin', 'superAdmin'], // superAdmin inherits Admin
    };
  
    return roleHierarchy[userRole]?.includes(targetRole) || false;
  };
  
  export default isRoleOrHigher;