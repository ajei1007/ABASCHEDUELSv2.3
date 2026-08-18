const UsersDBApi = require('../../db/api/users');

const getUsersAccordingBranchRoleSubgroup = async (
  companyID,
  branches,
  subgroups,
  roles,
  users,
  includeBranchInfo,
  disabled = true,
) => {
  const userList = await UsersDBApi.findAllUsersAccordingBranchRoleSubgroup({
    companyId: companyID,
    branches: branches,
    subgroups: subgroups,
    roles: roles,
    users: users,
    includeBranchInfo: includeBranchInfo,
    disabled: disabled,
  });

  return { data: userList };
};

module.exports = getUsersAccordingBranchRoleSubgroup;
