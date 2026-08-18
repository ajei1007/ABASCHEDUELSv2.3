const getFullName = (user) => {
  if (!user) return '';

  let fullName = `${user?.firstName || ''} ${user?.lastName || ''}`;
  return fullName;
};

module.exports = getFullName;