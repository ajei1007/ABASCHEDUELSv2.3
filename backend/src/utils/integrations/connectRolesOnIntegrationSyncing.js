const RolesIntegrationDataDBApi = require('../../db/api/rolesIntegrationData');

async function connectRolesOnIntegrationSyncing({
  matchings,
  companyInfo,
  integratingSoftware,
  transaction,
  getExternalId,
}) {
  const integrationDataToCreate = [];

  for (const m of matchings) {
    const externalId = getExternalId(m.external);

    integrationDataToCreate.push({
      roleId: m.local.id,
      integratingSoftware,
      dataInOtherSoftware: m.external,
      idOther: externalId,
      companyId: companyInfo.id,
      tableName: 'roles',
    });
  }

  if (integrationDataToCreate.length > 0) {
    await RolesIntegrationDataDBApi.createMany(integrationDataToCreate, { transaction });
  }

  return integrationDataToCreate.length;
}

module.exports = connectRolesOnIntegrationSyncing;