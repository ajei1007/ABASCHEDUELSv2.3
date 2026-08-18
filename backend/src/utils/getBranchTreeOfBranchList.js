const getBranchTreeOfBranchList = (branchIds, branchHierarchy) => {
    let requestedBranchesAndTheirParents = [];
    for (let i = 0; i < branchIds.length; i++) {
      requestedBranchesAndTheirParents.push(branchIds[i]);
    }
    let requestedBranchesAndTheirChilds = branchIds;

    let parentChildBranch = new Map();
    let childParentBranch = new Map();

    for (let i = 0; i < branchHierarchy.length; i++) {
      if (!parentChildBranch.has(branchHierarchy[i].parentId)) {
        let childs = [branchHierarchy[i].id, branchHierarchy[i].parentId];
        parentChildBranch.set(branchHierarchy[i].parentId, childs);
      } else {
        parentChildBranch.get(branchHierarchy[i].parentId).push(branchHierarchy[i].id);
      }

      if (!parentChildBranch.has(branchHierarchy[i].id)) {
        let childs = [branchHierarchy[i].id];
        parentChildBranch.set(branchHierarchy[i].id, childs);
      }

      childParentBranch.set(branchHierarchy[i].id, branchHierarchy[i].parentId);
    }

    // fill with the child branches
    for (let j = 0; j < requestedBranchesAndTheirChilds.length; j++) {
      let childs = parentChildBranch.get(requestedBranchesAndTheirChilds[j]);
      for (let m = 0; m < childs.length; m++) {
        if (!requestedBranchesAndTheirChilds.includes(childs[m])) {
          requestedBranchesAndTheirChilds.push(childs[m]);
        }
      }
    }

    // fill the way up till main branch
    for (let j = 0; j < requestedBranchesAndTheirParents.length; j++) {
      let parent = childParentBranch.get(requestedBranchesAndTheirParents[j]);
      if (parent && !requestedBranchesAndTheirParents.includes(parent)) {
        requestedBranchesAndTheirParents.push(parent);
      }
    }

    return [
      ...new Set([
        ...requestedBranchesAndTheirChilds,
        ...requestedBranchesAndTheirParents,
      ]),
    ];
};

module.exports = getBranchTreeOfBranchList;
