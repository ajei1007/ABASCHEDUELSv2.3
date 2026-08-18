const UsersDBApi = require('../db/api/users');
const { getRoleHierarchy } = require('./roleHierarchy');

const getUsersByType = async (req, type) => {
  const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
  const intersect_arrays = (arr1, arr2) => {
    return arr1 ? arr1.filter((e) => arr2.includes(e)) : [];
  };
  const resourceNameArray = type.split('|');
  roles_list = [];
  Object.entries(roleHierarchy).map((t) => {
    const [key, value] = t;
    if (intersect_arrays(value, resourceNameArray).length > 0) {
      roles_list.push(key);
    }
  });
  let branches = req.currentUser.branches.map((e) => e.id);
  branches = branches.length == 0 ? ['d'] : branches;

  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  let dataAccess = 'User';
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }

  let query = { company: req.currentUser.companyId, type };
  if (dataAccess != 'All') {
    query = { ...query, branches: branches.join('|') };
  }
  query = { company: req.currentUser.companyId, type };
  let payload = await UsersDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    query,
    roles_list,
  );

  // payload = payload.filter(e=> {
  //   const roles_now = e.roles.map(r => r.name);

  //   for (let index = 0; index < roles_now.length; index++) {
  //     const element = roles_now[index];
  //     if(element == type || roleHierarchy[element].includes(type)){
  //       return true
  //     }
  //   }
  //   return false
  // })
  return payload;
};

module.exports = getUsersByType;
