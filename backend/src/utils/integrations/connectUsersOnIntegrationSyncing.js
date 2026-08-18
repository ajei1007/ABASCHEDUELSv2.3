const UsersIntegrationDataDBApi = require('../../db/api/usersIntegrationData');

async function connectUsersOnIntegrationSyncing({
  matchings,
  companyInfo,
  integratingSoftware,
  resourceType,
  transaction,
  getExternalId,
}) {
  const integrationDataToCreate = [];

  for (const m of matchings) {
    const externalId = getExternalId(m.external);

    integrationDataToCreate.push({
      userId: m.local.id,
      integratingSoftware,
      dataInOtherSoftware: m.external,
      idOther: externalId,
      companyId: companyInfo.id,
      tableName: 'users',
      resourceType,
    });
  }

  if (integrationDataToCreate.length > 0) {
    await UsersIntegrationDataDBApi.createMany(integrationDataToCreate, { transaction });
  }

  return integrationDataToCreate.length;
}

module.exports = connectUsersOnIntegrationSyncing;