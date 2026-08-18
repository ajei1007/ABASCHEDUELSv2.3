const SubgroupsDBApi = require('../db/api/subgroups');

const getNonFunderTagsFromSubgroupList = async (data) => {
  let res = new Array();

  // get already funder tags from request
  const alreadyFunderTags = await SubgroupsDBApi.findSubgroupIdsByGroupId({
    ids: data.subgroups,
    groupId: data.groupId,
  });

  // exclude already funder tags from request
  for (let h = 0; h < data.subgroups.length; h++) {
    let isItFunderTag = false;
    for (let g = 0; g < alreadyFunderTags.length; g++) {
      if (data.subgroups[h] === alreadyFunderTags[g].id) {
        isItFunderTag = true;
        break;
      }
    }

    if (!isItFunderTag) {
      res.push(data.subgroups[h]);
    }
  }

  return res;
};

module.exports = getNonFunderTagsFromSubgroupList;
