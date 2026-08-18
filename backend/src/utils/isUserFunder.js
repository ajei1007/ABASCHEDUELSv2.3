const isUserFunder = (user) => {
  let isFunder = false;
  for (let p = 0; p < user.roles.length; p++) {
    if (user.roles[p].name === 'Funder') {
      isFunder = true;
      break;
    }
  }

  return isFunder;
};

module.exports = isUserFunder;
