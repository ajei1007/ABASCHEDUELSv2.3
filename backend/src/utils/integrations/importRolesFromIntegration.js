// utils/importUsersFromIntegration.js

const { v4: uuidv4 } = require('uuid');
const RolesDBApi = require('../../db/api/roles');
const RolesIntegrationDataDBApi = require('../../db/api/rolesIntegrationData');

/**
 * Imports roles from an external integration.
 * 
 * @param {Object[]} externalRoles - Roles from the external system.
 * @param {Object[]} alreadyConnected - Roles already connected in your system.
 * @param {string} rootRoleId - The root role ID for the role type.
 * @param {Object} companyInfo - { companyId, branches }
 * @param {string} integratingSoftware - Name of the integration (e.g., 'rethink').
 * @param {Object} transaction - DB transaction object.
 * @param {Object} currentUser - The current user performing the import.
 * @param {Function} mapExternalToRole - Function to map external role to your role model.
 * @param {Function} getExternalId - Function to get the unique external role ID.
 * @returns {Promise<number>} - Number of roles imported.
 */
async function importRolesFromIntegration({
  externalRoles,
  alreadyConnected,
  rootRoleId,
  companyInfo,
  integratingSoftware,
  transaction,
  currentUser,
  mapExternalToRole,
  getExternalId,
}) {
  const rolesToCreate = [];
  const integrationDataToCreate = [];

  for (const externalRole of externalRoles) {
    const externalId = getExternalId(externalRole);

    if (alreadyConnected.some(connectedRole => String(connectedRole.idOther) === String(externalId))) {
      continue;
    }

    const randomUUID = uuidv4();

    rolesToCreate.push(
      mapExternalToRole(externalRole, {
        id: randomUUID,
        rootRoleId,
        currentUser,
      })
    );

    integrationDataToCreate.push({
      roleId: randomUUID,
      integratingSoftware,
      dataInOtherSoftware: externalRole,
      idOther: externalId,
      companyId: companyInfo.id,
      tableName: 'roles',
    });
  }

  if (rolesToCreate.length > 0) {
    await RolesDBApi.createMany(rolesToCreate, { transaction, currentUser });
    await RolesIntegrationDataDBApi.createMany(integrationDataToCreate, { transaction });
  }

  transaction.commit();

  return rolesToCreate.length;
}

module.exports = importRolesFromIntegration;