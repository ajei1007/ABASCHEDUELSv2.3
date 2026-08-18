const RolesDBApi = require('../../db/api/roles');
const RolesIntegrationDataDBApi = require('../../db/api/rolesIntegrationData');

async function syncLinkedRoles({
    linkedPairs, 
    mapExternalToRole,
    transaction,
    currentUser
}) {
  for (const pair of linkedPairs) {
    const localId = pair.local.id;
    const data = mapExternalToRole(pair.external, pair.local)

    // Update the role
    await RolesDBApi.updateForIntegration(localId, data, { transaction, currentUser });
    pair.connection.dataInOtherSoftware = pair.external

    // Update the connection
    await RolesIntegrationDataDBApi.update(pair.connection.id, pair.connection, {transaction});
  }
  
  return linkedPairs.length
}

module.exports = syncLinkedRoles;
