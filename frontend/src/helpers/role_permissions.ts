const role_permissions = (currentUser: any, permission: string) => {
  let perm: boolean | string = false;
  if (currentUser) {
    if (permission === 'dataAccess') {
      perm = 'User';
      currentUser.roles.forEach((t: any) => {
        if (t['dataAccess'] === 'All') {
          perm = 'All';
        } else if (perm === 'User' && t['dataAccess'] === 'Branch') {
          perm = 'Branch';
        }
      });
    } else {
      currentUser.roles.forEach((t: any) => {
        if (t[permission] && t[permission] !== '0') {
          perm = true;
        }
      });
    }
  }
  return perm;
};

export default role_permissions;
