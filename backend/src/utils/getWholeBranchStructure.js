const getWholeBranchStructure = async (nodes) => {
  const childrenMap = new Map();
  const parentMap = new Map();

  // Build the adjacency list
  nodes.forEach((node) => {
    if (!childrenMap.has(node.id)) {
      childrenMap.set(node.id, []);
    }
    if (node.parentId !== null) {
      if (!childrenMap.has(node.parentId)) {
        childrenMap.set(node.parentId, []);
      }
      childrenMap.get(node.parentId).push(node.id);
      parentMap.set(node.id, node.parentId);
    }
  });

  // Initialize the result object
  const result = {};

  // Memoization maps
  const descendantsMemo = new Map();
  const ancestorsMemo = new Map();

  // Helper function to get all descendants using DFS
  function getDescendants(id) {
    if (descendantsMemo.has(id)) {
      return descendantsMemo.get(id);
    }

    const descendants = [];
    const stack = [id];
    const visited = new Set();

    while (stack.length > 0) {
      const currentId = stack.pop();
      if (!visited.has(currentId)) {
        visited.add(currentId);
        descendants.push(currentId);
        const children = childrenMap.get(currentId) || [];
        children.forEach((childId) => {
          if (!visited.has(childId)) {
            stack.push(childId);
          }
        });
      }
    }

    const filteredDescendants = descendants.filter((descId) => descId !== id);
    descendantsMemo.set(id, filteredDescendants);
    return filteredDescendants;
  }

  // Helper function to get all ancestors
  function getAncestors(id) {
    if (ancestorsMemo.has(id)) {
      return ancestorsMemo.get(id);
    }

    const ancestors = [];
    let currentNodeId = id;
    const visited = new Set();

    while (parentMap.has(currentNodeId) && !visited.has(currentNodeId)) {
      const parentId = parentMap.get(currentNodeId);
      visited.add(currentNodeId);
      ancestors.push(parentId);
      currentNodeId = parentId;
    }

    ancestorsMemo.set(id, ancestors);
    return ancestors;
  }

  // Populate the result object with descendants and ancestors for each node
  nodes.forEach((node) => {
    const id = node.id;
    const descendants = getDescendants(id);
    const ancestors = getAncestors(id);
    result[id] = [...descendants, ...ancestors, id];
  });

  return result;
};

module.exports = getWholeBranchStructure;
