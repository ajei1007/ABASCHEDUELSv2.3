const BranchesDBApi = require('../../db/api/branches');

const getDescendentBranches = async (branches) => {
  const branchList = await BranchesDBApi.getDescendentBranches({
    branchIds: branches,
  });
  return branchList;
};

module.exports = getDescendentBranches;
