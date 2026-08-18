const role_hierarchy = (frontend_roles_hierarchy, resources, role) => {
  if (
    frontend_roles_hierarchy &&
    frontend_roles_hierarchy[resources] &&
    frontend_roles_hierarchy[resources].includes(role)
  ) {
    return true;
  } else {
    return false;
  }
};

export default role_hierarchy;