const AvailabilitiesDBApi = require('../db/api/availabilities');
const { getRoleHierarchy } = require('./roleHierarchy');

const getAvailabilitiesByResourceName = async (req, resourceName, bol = false) => {
  const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

  let branches = req.currentUser.branches.map((e) => e.id);
    branches = branches.length == 0 ? ['d'] : branches;

  let payload = [];
  let query = {...req.query}
  let dataAccess = 'User';


  const dataAccessArray = req.currentUser.roles.map((role) => role.dataAccess);
  let roles_list = [];
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
    query = {...req.query,companyId: req.currentUser.companyId}

  } else if (dataAccessArray.includes('Branch')) {
    dataAccess = 'Branch';
    query = {branches:branches.join('|'),...req.query,companyId: req.currentUser.companyId}

  }
  if (dataAccess == 'User') {
    payload = await AvailabilitiesDBApi.findAll({
        user:req.currentUser.id,
        companyId: req.currentUser.companyId,
        bol,
    });
  } else {
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (value.includes(resourceName)) {
        roles_list.push(key);
      }
    });
    
    // NOTE: In `AvailabilitiesDBApi.findAll`, there's already a filter applied for `user`,
    // but it filters by `userId` rather than `firstName` or `lastName`.
    // To avoid potential issues elsewhere in the code, I've used the `userName` filter
    // instead of modifying the existing `user` filter.
    // As a solution, I also updated the frontend to send `userName` instead of `user`.
    payload = await AvailabilitiesDBApi.findAll({
      ...query,
      companyId: req.currentUser.companyId,
      resource: roles_list.join('|'),
      bol,
    });
  }
  payload['count'] = payload.count;

  return payload;
};

module.exports = getAvailabilitiesByResourceName;
