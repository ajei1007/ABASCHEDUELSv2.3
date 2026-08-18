const isUserActivity = (user) => {
    let isActivity = false;
    for (let p = 0; p < user.roles.length; p++) {
      if (user.roles[p].name === 'Activity') {
        isActivity = true;
        break;
      }
    }
  
    return isActivity;
  };
  
  module.exports = isUserActivity;
  