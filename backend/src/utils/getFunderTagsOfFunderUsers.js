const UsersDBApi = require('../db/api/users');

const getFunderTagsOfFunderUsers = async (funderIds) => {
  let res = new Array();

  if (!funderIds || funderIds?.length === 0){
    return res
  }

  // get credential funder users
  const credentials = await UsersDBApi.findUserManyToManyRelationsByIds(
    funderIds.join('|'),
  );

  // set the funder tags of credential funder to subgroups
  for (let j = 0; j < credentials.rows.length; j++) {
    let currentFunder = credentials.rows[j];
    let currentFundersSubgroups = credentials.rows[j].subgroups;
    for (let p = 0; p < currentFundersSubgroups.length; p++) {
      if (currentFundersSubgroups[p].name === currentFunder.firstName) {
        res.push(currentFundersSubgroups[p].id);
      }
    }
  }

  return res
};

module.exports = getFunderTagsOfFunderUsers;
