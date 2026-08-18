function reconcileEntityConnections({ localEntities, externalEntities, connections, localRefKey = 'userId', externalRefKey }) {
  const localMap = new Map(localEntities.map(item => [item.id, item]));
  const externalMap = new Map(externalEntities.map(item => [String(item[externalRefKey]), item]));

  const connectedLocalIds = new Set();
  const connectedExternalIds = new Set();
  const linkedPairs = [];
  for (const conn of connections) {
    const local = localMap.get(conn[localRefKey]);
    const external = externalMap.get(conn.idOther);

    if (local && external) {
      connectedLocalIds.add(conn[localRefKey]);
      connectedExternalIds.add(external[externalRefKey]);
      linkedPairs.push({ local, external, connection: conn });
    }else if (local && !external){
      connectedLocalIds.add(conn[localRefKey]);
    }else if (!local && external){
      connectedExternalIds.add(external[externalRefKey]);
    }
  }

  const unconnectedLocal = localEntities.filter(entity => !connectedLocalIds.has(entity.id));
  const unconnectedExternal = externalEntities.filter(entity => !connectedExternalIds.has(entity[externalRefKey]));

  return {
    unlinkedEntities: {
      local: unconnectedLocal,
      external: unconnectedExternal
    },
    linkedPairs,
  };
}

module.exports = reconcileEntityConnections;
