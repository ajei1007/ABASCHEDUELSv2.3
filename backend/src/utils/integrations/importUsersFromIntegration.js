// utils/importUsersFromIntegration.js

const { v4: uuidv4 } = require('uuid');
const UsersDBApi = require('../../db/api/users');
const UsersIntegrationDataDBApi = require('../../db/api/usersIntegrationData');
const RolesIntegrationDataDBApi = require('../../db/api/rolesIntegrationData');
const AvailabilitiesDBApi = require('../../db/api/availabilities');
const IntegrationImportSyncAuditDBApi = require('../../db/api/integrationImportSyncAudit')

/**
 * Imports users from an external integration.
 * 
 * @param {Object[]} externalUsers - Users from the external system.
 * @param {Object[]} alreadyConnected - Users already connected in your system.
 * @param {string} rootRoleId - The root role ID for the user type.
 * @param {Object} companyInfo - { companyId, branches }
 * @param {string} integratingSoftware - Name of the integration (e.g., 'rethink').
 * @param {string} resourceType - Type of resource ('employee', 'client', etc.).
 * @param {Object} transaction - DB transaction object.
 * @param {Object} currentUser - The current user performing the import.
 * @param {Function} mapExternalToUser - Function to map external user to your user model.
 * @param {Function} getExternalId - Function to get the unique external user ID.
 * @returns {Promise<number>} - Number of users imported.
 */
async function importUsersFromIntegration({
  externalUsers,
  alreadyConnected,
  rootRoleId,
  companyInfo,
  integratingSoftware,
  resourceType,
  transaction,
  currentUser,
  mapExternalToUser,
  getExternalId,
}) {
  const usersToCreate = [];
  const integrationDataToCreate = [];

  for (const externalUser of externalUsers) {
    const externalId = getExternalId(externalUser);

    if (alreadyConnected.some(connectedUser => String(connectedUser.idOther) === String(externalId))) {
      continue;
    }

    const randomUUID = uuidv4();
    const mappedRoleId = await getMappedRoleId(externalUser.roleId, integratingSoftware);

    usersToCreate.push(
      mapExternalToUser(externalUser, {
        id: randomUUID,
        mappedRoleId,
        rootRoleId,
        currentUser,
      })
    );

    integrationDataToCreate.push({
      userId: randomUUID,
      integratingSoftware,
      dataInOtherSoftware: externalUser,
      idOther: externalId,
      companyId: companyInfo.id,
      tableName: 'users',
      resourceType,
    });
  }

  if (usersToCreate.length > 0) {
    await UsersDBApi.createMany(usersToCreate, { transaction, currentUser });
    await UsersIntegrationDataDBApi.createMany(integrationDataToCreate, { transaction });
  }

  if (resourceType === 'activity') {
    // If the user that we add is activity, we need to create default availability for it
    const defaultAvailability = {
      startTime: '2025-06-04T05:00:00-04:00',
      endTime: '2025-06-04T20:00:00-04:00',
      days: [
        '20770718-a98e-499f-ae8b-c395f0f743bb',
        '2d0599e7-2729-49ee-acbe-ede6de8ad9b7',
        '3260c7e7-c57b-4144-803f-7db9cf88393c',
        '56cbe76a-0cf6-4647-8a49-2ef9fd102079',
        '6d92706c-9bb1-447e-bf74-572609066663',
        'ecd70b60-3fef-4d43-9181-2f9db60e19fe',
        'fa2adb44-e5ba-4586-ae19-5f1e1767228d'
      ],
      timezone: 'America/New_York',
      interval: '1',
      frequency: 'Weekly',
      bysetpos: '1',
      roleLocation: [],
      available: true,
      startRange: '2000-01-01',
      endRange: '2300-01-02',
      disabled: '',
      location2: [],
      M: '',
      T: '',
      W: '',
      R: '',
      F: '',
      S: '',
      U: '',
      status: 'Approved',
      oncall: '',
      branch: null,
      forever: false,
      allDay: false,
      everyDay: false
    }
    for (const user of usersToCreate) {
      await AvailabilitiesDBApi.create({
        ...defaultAvailability,
        user: user.id,
      }, { transaction, currentUser });
    }
  }

  // Upsert integrationImportSyncAudit
  await IntegrationImportSyncAuditDBApi.upsert(
    {
      companyId: companyInfo.id,
      action: 'import',
      integratingSoftware: integratingSoftware,
      resourceType: resourceType
    },
    { transaction },
  )
  transaction.commit();

  return usersToCreate.length;
}

async function getMappedRoleId(externalRoleId, integratingSoftware) {
  if (!externalRoleId) return null;

  // Check if we imported this role from integration before
  const role = await RolesIntegrationDataDBApi.findBy({
    idOther: externalRoleId,
    integratingSoftware: integratingSoftware,
  });
  return role?.roleId || null;
}

module.exports = importUsersFromIntegration;