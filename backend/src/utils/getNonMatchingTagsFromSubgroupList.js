const SubgroupsDBApi = require('../db/api/subgroups');

const getNonMatchingTagsFromSubgroupList = async (data) => {
  let res = new Array();

  // get already matchung tags from request
  const alreadyMatchingTags = await SubgroupsDBApi.findSubgroupIdsByGroupId({
    ids: data.subgroups,
    groupId: data.groupId,
  });

  // exclude already matching tags from request
  for (let h = 0; h < data.subgroups.length; h++) {
    let isItMatchingTag = false;
    for (let g = 0; g < alreadyMatchingTags.length; g++) {
      if (data.subgroups[h] === alreadyMatchingTags[g].id) {
        isItMatchingTag = true;
        break;
      }
    }

    if (!isItMatchingTag) {
      res.push(data.subgroups[h]);
    }
  }

  return res;
};

module.exports = getNonMatchingTagsFromSubgroupList;
