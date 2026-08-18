const UsersDBApi = require('../db/api/users');
const { getRoleHierarchy } = require('./roleHierarchy');

const getUsersByResourceName = async (req, resourceName, bol = false) => {
  const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

  let payload = [];
  const intersect_arrays = (arr1, arr2) => {
    return arr1 ? arr1.filter((e) => arr2.includes(e)) : [];
  };
  const resourceNameArray = resourceName.split('|');

  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  let dataAccess = 'User';
  let roles_list = [];
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
  }
  if (dataAccess == 'User') {
    payload = await UsersDBApi.findAll({
      id: req.currentUser.id,
      companyId: req.currentUser.companyId,
      bol,
    });
  } else {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (intersect_arrays(value, resourceNameArray).length > 0) {
        roles_list.push(key);
      }
    });
    let branches = req.currentUser.branches.map((e) => e.id);
    branches = branches.length == 0 ? ['d'] : branches;

    if (roles_list.length == 0) {
      payload = {
        rows: [],
        count: 0,
      };
      return payload;
    }

    payload = await UsersDBApi.findAll({
      ...req.query,
      companyId: req.currentUser.companyId,
      resource: roles_list.join('|'),
      bol,
    });
  }
  payload['count'] = payload.count;

  return payload;
};

module.exports = getUsersByResourceName;
