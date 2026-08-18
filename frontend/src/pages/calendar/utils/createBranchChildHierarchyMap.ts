export function createBranchChildHierarchyMap(branches: any[]) {
  // Build a map: parentId -> [childId, ...]
  const childrenMap: Record<string, string[]> = {};
  const result: Record<string, string[]> = {};

  // Initialize childrenMap
  branches.forEach((item) => {
    if (item.parentId) {
      if (!childrenMap[item.parentId]) {
        childrenMap[item.parentId] = [];
      }
      if (item.parentId !== item.id) {
        // Only add if the item is not its own parent
        childrenMap[item.parentId].push(item.id);
      }
    }
    // Each node at least contains itself
    result[item.id] = [item.id];
  });

  // Helper to get all descendants using iterative DFS
  function getAllDescendants(rootId: string): string[] {
    const stack = [...(childrenMap[rootId] || [])];
    const descendants: string[] = [];
    while (stack.length > 0) {
      const current = stack.pop()!;
      descendants.push(current);
      if (childrenMap[current]) {
        stack.push(...childrenMap[current]);
      }
    }
    return descendants;
  }

  // For each node that is a parent, add all its descendants
  Object.keys(childrenMap).forEach((parentId) => {
    const descendants = getAllDescendants(parentId);
    result[parentId] = [parentId, ...descendants];
  });

  return result;
}
