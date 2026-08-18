const UsersDBApi = require('../db/api/users');

const getAllAutocompleteUsers = async (req) => {
  let branches = req.currentUser.branches.map((e) => e.id);
  branches = branches.length == 0 ? ['d'] : branches;
  const dataAccessArray = req.currentUser.roles.map(
    (role) => role.dataAccess,
  );
  let dataAccess = 'User';
  let query = { companyId: req.currentUser.companyId };
  if (dataAccessArray.includes('All')) {
    dataAccess = 'All';
    query = { companyId: req.currentUser.companyId };
  } else {
    query = {
      companyId: req.currentUser.companyId,
      branches: branches.join('|'),
    };
  }
  const payload = await UsersDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    query,
  );
  return payload;
};

module.exports = getAllAutocompleteUsers;