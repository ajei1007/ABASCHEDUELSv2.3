const isUserHome = (firstName, lastName) => {
    let isHome = false;
    if (firstName && firstName === 'Home' && !lastName){
        isHome = true
    }

    if (lastName && lastName === 'Home' && !firstName){
        isHome = true
    }
  
    return isHome;
  };
  
  module.exports = isUserHome;
  