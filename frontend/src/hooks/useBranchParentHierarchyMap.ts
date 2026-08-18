import { useMemo } from 'react';

function createBranchParentHierarchyMap(branches: any[]) {
  const result: Record<string, Set<string>> = {};
  branches.forEach((branch) => {
    let parentIds = new Set<string>();
    let parentId = branch?.parentId;
    while (parentId) {
      parentIds.add(parentId);
      const _parentId = parentId;
      const parent = branches.find(
        (t) => t.id === _parentId && t.parentId !== _parentId,
      );
      parentId = parent ? parent.parentId : null;
    }
    result[branch.id] = parentIds;
  });
  return result;
}

export const useBranchParentHierarchyMap = (branches: any[]) => {
  const branchParentHierarchyMap = useMemo(
    () => createBranchParentHierarchyMap(branches),
    [branches],
  );

  return {
    branchParentHierarchyMap,
  };
};
