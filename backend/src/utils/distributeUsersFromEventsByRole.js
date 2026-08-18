const {
  getIntersectionArray,
  checkIntersectionArray,
} = require('./arrayIntersections');

const distributeUsersFromEventsByRole = (
  users,
  roleHierarchy,
  role_names,
  branches = '',
) => {
  let ro = [];
  ro = users.filter(
    (e) =>
      branches == '' ||
      e.branches.filter((r) => branches.includes(r.id)).length > 0,
  );
  // generate map with key = role and value = event users with that role
  let res = new Map();
  for (let m = 0; m < role_names.length; m++) {
    res.set(role_names[m], new Array());
  }

  for (let k = 0; k < ro.length; k++) {
    let dataValues = ro[k].dataValues || ro[k];
    const roles_current = dataValues.roles.map((r) => r.name);
    let crh = [];
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      //push the decendents
      if (checkIntersectionArray(roles_current, value)) {
        crh.push(key);
      }

      //push the ancestors
      if (checkIntersectionArray(roles_current, [key])) {
        const filteredValues = value.filter((item) => item !== key);
        crh.push(...filteredValues);
      }
    });
    const currentUserRoleHierarchy = [...new Set(crh)];
    const intersectingRoles = getIntersectionArray(
      role_names,
      currentUserRoleHierarchy,
    );

    for (let p = 0; p < intersectingRoles.length; p++) {
      let r = res.get(intersectingRoles[p]);
      r.push(ro[k]);
    }
  }

  return res;
};

module.exports = distributeUsersFromEventsByRole;
