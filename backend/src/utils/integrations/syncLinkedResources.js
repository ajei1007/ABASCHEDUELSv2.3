const UsersDBApi = require('../../db/api/users'); 
const UsersInegrationDataDBApi = require('../../db/api/usersIntegrationData')

async function syncLinkedResources({
    linkedPairs, 
    mapExternalToUser,
    connectedRoles,
    resourceType,
    transaction,
    currentUser
}) {
  for (const pair of linkedPairs) {
    const localId = pair.local.id;
    const data = mapExternalToUser(pair.external, pair.local)
    if (resourceType === "employee"){
      const match = connectedRoles.find(r => Number(r.idOther) === pair.external.roleId);
      if (match){
        data.roles.push(match.roleId)
        data.roles = [...new Set(data.roles)];
      }
    }

    // Update the user
    await UsersDBApi.updateForIntegration(localId, data, { transaction, currentUser });
    pair.connection.dataInOtherSoftware = pair.external

    // Update the connection
    await UsersInegrationDataDBApi.update(pair.connection.id, pair.connection, {transaction});
  }
  return linkedPairs.length
}

module.exports = syncLinkedResources;
