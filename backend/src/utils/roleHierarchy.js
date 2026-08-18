const RolesDBApi = require('../db/api/roles');
const RolesCacheApi = require('../cache/roles');

const getRoleHierarchy = async (companyId) => {
  // Find from Cache
  const roleHierarchyFromRedis = await RolesCacheApi.findRoleHierarchy(companyId);
  if (roleHierarchyFromRedis) {
    return roleHierarchyFromRedis;
  }

  // If not found then query roles
  const roles = await RolesDBApi.findAll({ companyId });
  const roleHierarchy = {};
  roles.rows.forEach((e) => {
    let roles_all = [e.name];

    let parent_id = e.parent ? e.parent.name : null;
    let i = 0;
    while (parent_id && parent_id != null && i < 1000) {
      roles_all.push(parent_id);
      const role_parent = roles.rows.find((r) => r.name == parent_id).parent;
      parent_id = role_parent != null ? role_parent.name : null;
      i++;
    }
    roleHierarchy[e.name] = roles_all;
  });
  await RolesCacheApi.createRoleHierarchy(companyId, roleHierarchy)
  return roleHierarchy;
};

const getRolesAndDescendants = async (companyId, roleNames) => {
  if (roleNames.length === 0) {
    return [];
  }

  const roleHierarchy = await getRoleHierarchy(companyId);
  const rolesWithDescendants = new Set();

  for (const [role, ancestors] of Object.entries(roleHierarchy)) {
    for (const roleName of roleNames) {
      if (ancestors.includes(roleName)) {
        rolesWithDescendants.add(role);
      }
    }
  }

  return Array.from(rolesWithDescendants);
};


const getRolesAndAncestors = async (companyId, roleNames) => {
  if (roleNames.length === 0) {
    return [];
  }

  const roleHierarchy = await getRoleHierarchy(companyId);

  const rolesWithAncestors = roleNames.flatMap(roleName =>
    roleHierarchy[roleName] || []
  );

  const uniqueRolesWithAncestors = Array.from(new Set(rolesWithAncestors));

  return uniqueRolesWithAncestors;
};

module.exports = {
  getRoleHierarchy,
  getRolesAndDescendants,
  getRolesAndAncestors,
}; 