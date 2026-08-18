/**
 * Check if user has a specific permission based on their roles
 * @param {Object} user - The user object with roles array
 * @param {string} permission - The permission to check (e.g., 'viewOnboardingChecklist')
 * @returns {boolean} - True if user has the permission, false otherwise
 */
const checkUserPermission = (user, permission) => {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }

  // Check if any of the user's roles have the specified permission
  return user.roles.some(role => {
    return role[permission] === true || role[permission] === 1;
  });
};

module.exports = checkUserPermission; 