// TODO make reusable
const intersect_arrays = (arr1, arr2) => {
  return arr1 ? arr1.filter((e) => arr2.includes(e)) : [];
};

const filterUsersFromEvents = (
  users,
  roleHierarchy,
  role_names,
  branches = '',
  bol = true,
) => {
  let ro = [];
  ro = users
    .filter(
      (e) =>
        branches == '' ||
        e.branches.filter((r) => branches.includes(r.id)).length > 0,
    )
    .filter((e) => {
      let dataValues = e.dataValues || e;
      const roles_current = dataValues.roles.map((r) => r.name);
      for (let index = 0; index < roles_current.length; index++) {
        const element = roles_current[index];
        if (
          role_names.includes(element) == bol ||
          intersect_arrays(roleHierarchy[element], role_names).length > 0 == bol
        ) {
          return true;
        }
      }
      return false;
    });
  return ro;
};

module.exports = filterUsersFromEvents;