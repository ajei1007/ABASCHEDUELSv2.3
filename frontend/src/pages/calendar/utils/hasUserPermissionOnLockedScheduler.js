const hasUserPermissionOnLockedScheduler = (currentUser, schedulerLocked) => {
  const hasUserPermission = currentUser.roles?.[0]?.canEditEventSchedulerLocked ?? false;
  if (hasUserPermission) {
    return true;
  }
  return !schedulerLocked;
}

export default hasUserPermissionOnLockedScheduler;