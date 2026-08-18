const UsersDBApi = require('../db/api/users');
const { getRoleHierarchy } = require('./roleHierarchy');

const getUserAndRole = async (userId, currentUser, cache = true) => {
  const user = await UsersDBApi.findBy({ id: userId, cache });
  const role = await getUsersRole(currentUser);
  return {
    user,
    role,
  };
};


//Gets the users Role
const getUsersRole = async (currentUser) => {
  const roleHierarchy = await getRoleHierarchy(currentUser.companyId);

  const roles2 = currentUser['roles'].map((e) => {
    return e['name'];
  });
  let arr = [];
  roles2.forEach((role) => {
    arr = arr.concat(roleHierarchy[role], role);
  });
  arr = [...new Set(arr)];

  let role_mobile = 'Client';
  if (arr.includes('Super Admin')) {
    role_mobile = 'Admin';
  } else if (arr.includes('Employee')) {
    role_mobile = 'Employee';
  } else if (arr.includes('Client')) {
    role_mobile = 'Client';
  }

  return role_mobile
};

module.exports = {
  getUserAndRole,
  getUsersRole,
};
