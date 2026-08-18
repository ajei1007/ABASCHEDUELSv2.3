const db = require('../db/models');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const AuthIntegrationsDBApi = require('../db/api/authIntegrations');
const EventsDBApi = require('../db/api/events');
const IntegrationImportSyncAuditDBApi = require('../db/api/integrationImportSyncAudit')
const UsersDBApi = require('../db/api/users');
const RolesDBApi = require('../db/api/roles');
const UsersInegrationDataDBApi = require('../db/api/usersIntegrationData');
const RolesIntegrationDataDBApi = require('../db/api/rolesIntegrationData');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const getUsersByResourceName = require('../utils/getUsersByResourceName');
const wrapAsync = require('../helpers').wrapAsync;
const { checkIntersectionArray } = require('../utils/arrayIntersections');
const runActions = require('../integration/rethink');
const formatIntegrationOperations = require('../integration/formatters/formatIntegrationOperations');
const {
  syncUsers,
  getUsersToken,
  getSystemUsers,
  doActions,
} = require('../integration/actions/theralytics');
const doActionsCentralReach = require('../integration/actions/centralreach_new_auth');
// const doActionsCentralReach = require('../integration/actions/centralreach');
const doActionsMeasurePM = require('../integration/actions/measurepm');
const { 
  loginToRethink,
  getEmployeeRethink,
  getClientRethink, 
  getFundersRethink, 
  getLocationsRethink,
  getRolesRethink,
  getActivitiesRethink,
} = require('../integration/actions/rethink');
const importUsersFromIntegration = require('../utils/integrations/importUsersFromIntegration');
const reconcileEntityConnections = require('../utils/integrations/reconcileEntityConnections')
const syncLinkedResources = require('../utils/integrations/syncLinkedResources')
const syncLinkedRoles = require('../utils/integrations/syncLinkedRoles')
const { ROOT_ROLE_NAMES } = require('../constants/roles');

const {
  loginToTherapyPMS,
  getClientsTherapyPMS,
  getLocationsTherapyPMS,
  getEmployeeTherapyPMS,
  getActivitiesTherapyPMS
} = require('../integration/actions/therapypms');

const importRolesFromIntegration = require('../utils/integrations/importRolesFromIntegration');
const requireIntegrationAuth = require('../middlewares/requireIntegrationAuth');
const matchExternalToLocalFLNames = require('../utils/integrations/matchExternalToLocalFLNames');
const { enrichEventsWithIntegrationData } = require('../services/eventIntegrations');
const { mapEventToRethinkPayload } = require('../integration/formatters/rethinkFormatter');
const syncEventsToRethink = require('../integration/actions/rethink/syncEventsToRethink');
const syncEventsToTherapypms = require('../integration/actions/therapypms/syncEventsToTherapypms');
const connectUsersOnIntegrationSyncing = require('../utils/integrations/connectUsersOnIntegrationSyncing')
const connectRolesOnIntegrationSyncing = require('../utils/integrations/connectRolesOnIntegrationSyncing');
const EventsIntegrationDataDBApi = require('../db/api/eventsIntegrationData');
const importRethinkEvents = require('../integration/actions/rethink/importRethinkEvents');
const importTherapypmsEvents = require('../integration/actions/therapypms/importTherapypmsEvents');

const router = require('../utils/createRouter')();

router.post(
  '/centralreach',
  wrapAsync(async (req, res) => {
    const credentials = req.body.credentials;
    const timezone = req.body?.timezone;

    if (!credentials?.email || !credentials?.password) {
      return res.status(401).json('Invalid credentials!');
    }

    const payload = await EventsDBApi.findToBeIntegrated({
      branches: req.body.branches,
      syncEventUpdatedInThePast: req.body?.syncEventUpdatedInThePast,
    });
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

    const integrationOperations = formatIntegrationOperations(
      payload,
      roleHierarchy,
      false,
    );
    if (integrationOperations.hasValues) {
      const updates = await doActionsCentralReach(
        integrationOperations,
        credentials.email,
        credentials.password,
        timezone,
      );

      if (updates == 'login failure') {
        return res
          .status(400)
          .send('Login failed: Invalid username or password');
      }
      if (updates?.createdEventsSuccessful.length) {
        await EventsDBApi.updateEventsIntegratedAt(
          updates.createdEventsSuccessful,
        );
      }
      return res.status(200).json({ msg: 'Integrated successfully!' });
    }
    return res.status(200).json({ msg: 'Nothing to integrate!' });
  }),
);

// TODO make reusable/refactored as /theralytics @halmedov
router.post('/rethink', async (req, res) => {
  const userCreds = req.body.credentials || null;
  console.log('plate', userCreds);

  if (!userCreds?.email || !userCreds?.password) {
    throw new Error('User is not defined!');
  }
  // TODO first need to check creds of the user

  const payload = await EventsDBApi.findToBeIntegrated({
    branches: req.body.branches,
    syncEventUpdatedInThePast: req.body?.syncEventUpdatedInThePast,
  });
  const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

  let create_events = [];
  let delete_events = [];
  let update_events = [];
  let cancel_events = [];
  for (let index = 0; index < payload.length; index++) {
    const e = payload[index];
    let employee = null;
    let client = null;
    e.users.forEach((user) => {
      const user_roles = user.roles.map((role) => role.name);
      const all_roles = user_roles.flatMap((r) => roleHierarchy[r]);
      // console.log('gooft', all_roles);
      if (all_roles.includes('Employee')) {
        employee = user;
      } else if (all_roles.includes('Client')) {
        client = user;
      }
    });
    let rules = [];
    if (e.U) rules.push(0);
    if (e.M) rules.push(1);
    if (e.T) rules.push(2);
    if (e.W) rules.push(3);
    if (e.R) rules.push(4);
    if (e.F) rules.push(5);
    if (e.S) rules.push(6);
    rules = rules.join(',');
    if (employee?.idCustom && client?.idCustom && e.activity0.idCustom) {
      // console.log('bazo : ', e);
      let basic_info = {
        eventId: e.id,
        deletedAt: e.deletedAt,
        eventIdCustom: e.eventIdCustom,
        course: e.eventIdCustom,
        activityId: e.activity0.idCustom,
        isCancelled: e.isCancelled,
        employeeId: employee.idCustom,
        clientId: client.idCustom,
        start: moment.utc(e.start).format('HH:mm:ss'),
        end: moment.utc(e.end).format('HH:mm:ss'),
        duration: moment.utc(e.end).diff(moment.utc(e.start), 'seconds'),
        startRecur: e.startRecur,
        endRecur: e.endRecur,
        timezone: e.timezone,
        recurring:
          moment(e.endRecur, 'YYYY-MM-DD').diff(
            moment(e.startRecur, 'YYYY-MM-DD'),
            'days',
          ) > 1,
        sunday: e.U,
        monday: e.M,
        tuesday: e.T,
        wednesday: e.W,
        thursday: e.R,
        friday: e.F,
        saturday: e.S,
        interval: e.interval,
        rules: rules,
        timezone: e.timezone,
        startRecur_format: moment(e.startRecur).format('MM/DD/YYYY'),
      };
      if (!(e.deletedAt && !e.eventIdCustom)) {
        if (e.eventIdCustom) {
          if (e.deletedAt) {
            delete_events.push(basic_info);
          } else if (e.isCancelled) {
            //update_events.push(basic_info);
            cancel_events.push(basic_info);
          } else {
            update_events.push(basic_info);
          }
        } else {
          if (e.isCancelled) {
            cancel_events.push(basic_info);
          } else {
            create_events.push(basic_info);
          }
        }
      }
    }
  }
  let filtered_events = {
    create_events,
    delete_events,
    update_events,
    cancel_events,
  };

  // if (updates.created_events_successful.length > 0) {
  //   await EventsDBApi.updateCustomEventIds(updates.created_events_successful);
  // }
  //console.log('seever1', feedback_complete);
  if (
    [...create_events, ...delete_events, ...update_events, ...cancel_events]
      .length > 0
  ) {
    console.log('glimmy', filtered_events);

    const updates = await runActions(filtered_events, userCreds).catch(
      (error) => console.error('hello', error),
    );
    console.log('updates_now', updates);

    if (updates?.created_events_successful.length > 0) {
      await EventsDBApi.updateCustomEventIds(updates.created_events_successful);
    }
  }
  return res.status(200).json({ msg: 'Integrated successfully!' });
});

// TODO remove
router.get(
  '/hi-rasmus/clients',
  wrapAsync(async (req, res) => {
    const payload = await getUsersByResourceName(req, 'Client', true);
    let result = payload.rows.map((item) => {
      const firstName = item.firstName || '';
      const lastName = item.lastName || '';
      const name = firstName + ' ' + lastName;

      return {
        id: item.id,
        name: name.trim(), // trim to remove any leading or trailing whitespace
        alias: '',
      };
    });

    res.status(200).send(result);
  }),
);

// TODO remove
router.get(
  '/hi-rasmus/employees',
  wrapAsync(async (req, res) => {
    const payload = await getUsersByResourceName(req, 'Employee', true);
    let result = payload.rows.map((item) => {
      const firstName = item.firstName || '';
      const lastName = item.lastName || '';
      const name = firstName + ' ' + lastName;

      return {
        id: item.id,
        name: name.trim(), // trim to remove any leading or trailing whitespace
        email: item.email || '',
      };
    });

    res.status(200).send(result);
  }),
);

// TODO remove
router.get(
  '/hi-rasmus/events',
  wrapAsync(async (req, res) => {
    let query = {};
    let peopleValues = [];
    let ClientRoles = [];
    let EmployeeRoles = [];

    let lastUpdateProvidedInRequest = false;
    if (req.query.lastUpdate) {
      // Parse the date using moment
      const parsedDate = moment.utc(req.query.lastUpdate);

      // Check if the date is valid
      if (parsedDate.isValid()) {
        // Calculate one month ago from now
        const oneMonthAgo = moment.utc().subtract(1, 'months');

        if (parsedDate.isBefore(oneMonthAgo)) {
          // If parsedDate is older than one month, set it to one month ago
          query.updatedAtStart = oneMonthAgo.format('YYYY-MM-DD HH:mm:ss');
        } else {
          // Otherwise, use the parsed date
          query.updatedAtStart = parsedDate.format('YYYY-MM-DD HH:mm:ss');
        }
        lastUpdateProvidedInRequest = true;
      }
    }

    if (!lastUpdateProvidedInRequest) {
      res.status(200).send([]);
      return;
    }

    query.companyId = req.currentUser.companyId;
    // Check if clientId is present in req.query and add it to the peopleValues array
    if (req.query.clientId) {
      peopleValues.push(req.query.clientId);
    }

    // Check if employeeId is present in req.query and add it to the peopleValues array
    if (req.query.employeeId) {
      peopleValues.push(req.query.employeeId);
    }

    // Join the values in peopleValues with '|' and assign it to query.people
    query.people = peopleValues.join('|');
    const payload = await EventsDBApi.findAllForTimezone({
      updatedAtStart: query.updatedAtStart,
      people: query.people,
      specificCompanyId: query.companyId,
      bol: 'true',
    });

    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (checkIntersectionArray(value, ['Client'])) {
        ClientRoles.push(key);
      }
      if (checkIntersectionArray(value, ['Employee'])) {
        EmployeeRoles.push(key);
      }
    });

    let response = new Array();
    for (let p = 0; p < payload.rows.length; p++) {
      let currentEvent = payload.rows[p].dataValues;
      let formattedEvent = {
        id: currentEvent.id,
        name: '',
        clientIds: [],
        employeeIds: [],
        start: currentEvent.start,
        end: currentEvent.end,
        status: '',
      };

      for (let pu = 0; pu < currentEvent.users.length; pu++) {
        let currentUserRoleNames = currentEvent.users[pu].dataValues.roles.map(
          (item) => item.dataValues.name,
        );
        if (checkIntersectionArray(currentUserRoleNames, EmployeeRoles)) {
          formattedEvent.employeeIds.push(currentEvent.users[pu].dataValues.id);
          continue;
        }

        if (checkIntersectionArray(currentUserRoleNames, ClientRoles)) {
          formattedEvent.clientIds.push(currentEvent.users[pu].dataValues.id);
          continue;
        }
      }

      response.push(formattedEvent);
    }

    res.status(200).send(response);
  }),
);

router.post(
  '/measurepm',
  wrapAsync(async (req, res) => {
    const credentials = req.body.credentials;
    const timezone = req.body?.timezone;

    if (!credentials?.email || !credentials?.password) {
      return res.status(401).json('Invalid credentials!');
    }

    const payload = await EventsDBApi.findToBeIntegrated({
      branches: req.body.branches,
      syncEventUpdatedInThePast: req.body?.syncEventUpdatedInThePast,
    });
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

    const integrationOperations = formatIntegrationOperations(
      payload,
      roleHierarchy,
      false,
    );
    // if (integrationOperations.hasValues) {
    const updates = await doActionsMeasurePM(
      integrationOperations,
      credentials.email,
      credentials.password,
      timezone,
    );

    if (updates == 'login failure') {
      return res.status(400).send('Login failed: Invalid username or password');
    }
    if (updates?.createdEventsSuccessful.length) {
      await EventsDBApi.updateEventsIntegratedAt(
        updates.createdEventsSuccessful,
      );
    }
    return res.status(200).json({ msg: 'Integrated successfully!' });
    // }
    return res.status(200).json({ msg: 'Nothing to integrate!' });
  }),
);

router.post(
  '/theralytics',
  wrapAsync(async (req, res) => {
    // Authenticate user
    const tokenOrOther = await getUsersToken(req, res);
    const { token, question } = tokenOrOther;

    // It might return quesion as well
    if (question) {
      return res.status(200).json(tokenOrOther);
    }

    const payload = await EventsDBApi.findToBeIntegrated({
      branches: req.body.branches,
      syncEventUpdatedInThePast: req.body?.syncEventUpdatedInThePast,
    });
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);

    const integrationOperations = formatIntegrationOperations(
      payload,
      roleHierarchy,
      true,
    );

    if (integrationOperations.hasValues) {
      const createdEvents = integrationOperations.createdEvents;
      const updatedEvents = integrationOperations.updatedEvents;

      const usersUUIDs = createdEvents
        .concat(updatedEvents)
        .reduce((acc, ev) => {
          if (ev.employeeUuid) acc.push(ev.employeeUuid);
          if (ev.clientUuid) acc.push(ev.clientUuid);
          return acc;
        }, []);

      let existingSyncedUsers = await UsersInegrationDataDBApi.findAllByUserIds(
        {
          integratingSoftware: 'theralytics',
          userIds: usersUUIDs,
        },
      );

      let filteredAbaUserData = {};
      existingSyncedUsers.forEach((user) => {
        filteredAbaUserData[user.dataInOtherSoftware.id] =
          user.dataInOtherSoftware;
      });

      const updates = await doActions(
        integrationOperations,
        token,
        filteredAbaUserData,
      );

      if (updates?.createdEventsSuccessful.length) {
        await EventsDBApi.updateEventsIntegratedAt(
          updates.createdEventsSuccessful,
        );
      }
      if (updates.failedEvents?.length) {
        // TODO log errors
        return res.status(400).send(updates.failedEvents);
      }
    }
    return res.status(200).send([]);
  }),
);

router.post(
  '/sync-users/theralytics',
  wrapAsync(async (req, res) => {
    const branches = req.body.branch;

    // Authenticate user
    const tokenOrOther = await getUsersToken(req, res);
    const { token, question } = tokenOrOther;

    // It might return quesion as well
    if (question) {
      return res.status(200).json(tokenOrOther);
    }

    // Get system users
    const { branchUsers, existingSyncedUsers } = await getSystemUsers({
      branches,
      companyId: req.currentUser.companyId,
    });

    let syncedUsers = [];
    // Sync users
    let updatedSyncedUsers = await syncUsers(token, branchUsers);
    if (updatedSyncedUsers?.length > 0) {
      for (let syncedUserData of updatedSyncedUsers) {
        const existingData = existingSyncedUsers.find(
          (user) => user.userId === syncedUserData.id,
        );
        if (!existingData) {
          await UsersInegrationDataDBApi.create({
            userId: syncedUserData.id,
            integratingSoftware: 'theralytics',
            dataInOtherSoftware: syncedUserData,
          });
        } else {
          await UsersInegrationDataDBApi.update(existingData.id, {
            userId: syncedUserData.id,
            integratingSoftware: 'theralytics',
            dataInOtherSoftware: syncedUserData,
          });
        }

        if (syncedUserData.id && syncedUserData.customId) {
          await UsersDBApi.updateIdCustom(
            syncedUserData.id,
            syncedUserData.customId,
            req,
          );
        }

        syncedUsers.push({
          id: syncedUserData.id,
          userType: syncedUserData.userType,
          firstName: syncedUserData.firstName,
          lastName: syncedUserData.lastName,
        });
      }
    }

    const failedUsers = branchUsers.filter(
      (u) =>
        syncedUsers.findIndex((syncedUser) => syncedUser.id === u.id) === -1,
    );

    res.status(200).send({ syncedUsers, failedUsers });
  }),
);

router.get(
  '/synced-users/theralytics',
  wrapAsync(async (req, res) => {
    const branches = req.query.branch;

    // Get system users
    const { branchUsers, existingSyncedUsers } = await getSystemUsers({
      branches,
      companyId: req.currentUser.companyId,
    });

    // Make failedUsers and syncedUsers arrays
    let failedUsers = [];
    let syncedUsers = [];
    for (const user of branchUsers) {
      const isUserExisting = existingSyncedUsers.find(
        (u) => u.userId === user.id,
      );
      if (isUserExisting) {
        syncedUsers = [...syncedUsers, user];
      } else {
        failedUsers = [...failedUsers, user];
      }
    }

    res.status(200).send({ syncedUsers, failedUsers });
  }),
);

// Check login credentials (NEW reusable one)
router.get(
  '/check-login-credentials/:software',
  wrapAsync(async (req, res) => {
    if (!req.params.software){
      res.status(200).send({ result : false })
      return
    }

    const userCreds = await AuthIntegrationsDBApi.checkLoginCredentialOfUser({
      userId: req.currentUser.id,
      companyId: req.currentUser.companyId,
      integratingSoftware: req.params.software
    });
    res.status(200).send({ result : userCreds.length > 0})
  }),
);

// Login (NEW reusable one)
router.post(
  '/login-to/:software',
  wrapAsync(async (req, res) => {
    if (req.params.software === 'rethink'){
      // check if credentials was provided
      if (!req.body.credentials.clientId || !req.body.credentials.clientSecret){
        res.status(400).send({ result : "Invalid credentials"})
        return
      }
      let response = await loginToRethink(req.body.credentials, req.currentUser)
      if (!response){
        res.status(400).send({ result : "Invalid credentials"})
        return
      }
      res.status(200).send({ result : "success"})
      return
    }
    
    if (req.params.software === 'therapypms'){
      // check if credentials was provided
      if (!req.body.credentials.email || !req.body.credentials.password){
        res.status(400).send({ result : "Invalid credentials"})
        return
      }

      let response = await loginToTherapyPMS(req.body.credentials, req.currentUser)
      
      if (!response){
        res.status(400).send({ result : "Invalid credentials"})
        return
      }

      res.status(200).send({ result : "success"})
      return
    }
    res.status(400).send({ result : "Invalid software"})

  }),
)


// Import employee (NEW reusable one)
router.post(
  '/import-employee/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected resources from usersIntegrationData table
      //         Extract the latest import date with ordering by createdAT and use it
      //         for getting the created users after last import
      let alreadyConnectedEmployees = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'rethink',
        companyId: req.currentUser.companyId,
        resourceType: 'employee'
      })

      // STEP 2: Get the root Employee role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const employeeRootRole = roles.rows.find(
        (role) => role.name === "Employee",
      )?.id;

      if (!employeeRootRole){
        res.status(409).send({ result : 'There is no root Employee role in this company'})
        return
      }

      // STEP 3: Get the new employees from rethink
      let lastImportedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'employee'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      const employees = await getEmployeeRethink(req.integrationToken, lastImportedDate);

      // STEP 4: For every emmployee on rethink:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with rethink employee in usersIntegrationsData table
      
      const importNumber = await importUsersFromIntegration({
        externalUsers: employees,
        alreadyConnected: alreadyConnectedEmployees,
        rootRoleId: employeeRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'employee',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (user, { id, mappedRoleId, rootRoleId, currentUser }) => ({
          id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phone,
          email: user.email,
          password: user.email,
          address: `${user.addressStreet}, ${user.city}`,
          companyId: currentUser.companyId,
          branches: currentUser.branches.map((branch) => branch.id),
          roles: [mappedRoleId || rootRoleId],
          notes: `This user has been imported from ${req.params.software}`,

        }),
        getExternalId: (user) => user.staffId,
      })

      res.status(200).send({importNumber})
      return
    }

    if (req.params.software === 'therapypms') {
      // STEP 1: Get the already connected resources from usersIntegrationData table
      //         Extract the latest import date with ordering by createdAT and use it
      //         for getting the created users after last import
      let alreadyConnectedEmployees = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'therapypms',
        companyId: req.currentUser.companyId,
        resourceType: 'employee'
      })

      // STEP 2: Get the root Employee role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const employeeRootRole = roles.rows.find(
        (role) => role.name === "Employee",
      )?.id;

      if (!employeeRootRole){
        res.status(409).send({ result : 'There is no root Employee role in this company'})
        return
      }

      // STEP 3: Get the new employees from therapypms
      let lastImportedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'employee'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      const employees = await getEmployeeTherapyPMS(req.integrationToken, lastImportedDate);

      // STEP 4: For every emmployee on therapypms:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with therapypms employee in usersIntegrationsData table
      
      const importNumber = await importUsersFromIntegration({
        externalUsers: employees,
        alreadyConnected: alreadyConnectedEmployees,
        rootRoleId: employeeRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'employee',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (user, { id, mappedRoleId, rootRoleId, currentUser }) => ({
          id,
          firstName: user.provider_first_name,
          lastName: user.provider_last_name,
          phoneNumber: user.provider_phone_number,
          email: user.provider_email,
          password: user.provider_email,
          companyId: currentUser.companyId,
          branches: currentUser.branches.map((branch) => branch.id),
          roles: [mappedRoleId || rootRoleId],
          notes: `This user has been imported from ${req.params.software}`,

        }),
        getExternalId: (user) => user.provider_id,
      })

      res.status(200).send({importNumber})
      return

    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

// Sync employee (NEW reusable one)
router.post(
  '/sync-employee/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    if (req.params.software === 'rethink'){
      let transaction = await db.sequelize.transaction();
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedEmployees = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'employee'
      })

      // STEP 2: Get the employees from ABA
      const employeesFromABA = await getUsersByResourceName(req, 'Employee', true);

      // STEP 3: Get the latest sync employee call for rethink
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'employee'
        },
        { transaction },
      );

      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified employees from rethink
      const employeesFromRethink = await getEmployeeRethink(req.integrationToken, lastSyncedDate);

      // STEP 5: Get the already connected roles from rolesIntegrationData table
      let alreadyConnectedRoles = await RolesIntegrationDataDBApi.findAll({
        companyId: req.currentUser.companyId,
        integratingSoftware: req.params.software,
      })

      // STEP 6: distribute entities
      const result = reconcileEntityConnections({
        localEntities: employeesFromABA.rows, 
        externalEntities: employeesFromRethink, 
        connections: alreadyConnectedEmployees, 
        externalRefKey: 'staffId',
      });

      // STEP 7: Update the employee data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        connectedRoles: alreadyConnectedRoles,
        resourceType: "employee",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.firstName,
          lastName: external.lastName,
          phoneNumber: external.phone,
          email: external.email,
          gender: local.gender,
          address: `${external.addressStreet}, ${external.city}`,
          address2: local.address2,
          birthday: local.birthday,
          roles: local.roles.map(role => role.id),
        }),
      })

      // STEP 8: Connect employees with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'employee',
        transaction,
        getExternalId: (user) => user.staffId,
      })

      // STEP 9: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'employee'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }

    if (req.params.software === 'therapypms') {
      let transaction = await db.sequelize.transaction();
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedEmployees = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'employee'
      })

      // STEP 2: Get the employees from ABA
      const employeesFromABA = await getUsersByResourceName(req, 'Employee', true);

      // STEP 3: Get the latest sync employee call for therapypms
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'employee'
        },
        { transaction },
      );

      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified employees from therapypms
      const employeesFromTherapyPMS = await getEmployeeTherapyPMS(req.integrationToken, lastSyncedDate);

      // STEP 5: Get the already connected roles from rolesIntegrationData table
      let alreadyConnectedRoles = await RolesIntegrationDataDBApi.findAll({
        companyId: req.currentUser.companyId,
        integratingSoftware: req.params.software,
      })

      // STEP 6: distribute entities
      const result = reconcileEntityConnections({
        localEntities: employeesFromABA.rows, 
        externalEntities: employeesFromTherapyPMS, 
        connections: alreadyConnectedEmployees, 
        externalRefKey: 'provider_id',
      });

      // STEP 7: Update the employee data in ABA from therapypms
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        connectedRoles: alreadyConnectedRoles,
        resourceType: "employee",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.provider_first_name,
          lastName: external.provider_last_name,
          phoneNumber: external.provider_phone_number || local.phoneNumber,
          email: external.provider_email || local.email,
          gender: local.gender,
          address: local.address,
          address2: local.address2,
          birthday: local.birthday,
          roles: local.roles.map(role => role.id),
        }),
      })

      // STEP 8: Connect employees with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'provider_first_name',
        externalLastNameKey: 'provider_last_name',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'employee',
        transaction,
        getExternalId: (user) => user.provider_id,
      })

      // STEP 9: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'employee'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

// Import clients (NEW reusable one)
router.post(
  '/import-client/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected resources from usersIntegrationData table
      //         Extract the latest import date with ordering by createdAT and use it
      //         for getting the created users after last import
      let alreadyConnectedClients = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'rethink',
        companyId: req.currentUser.companyId,
        resourceType: 'client'
      })

      // STEP 2: Get the root Client role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const clientRootRole = roles.rows.find(
        (role) => role.name === "Client",
      )?.id;

      if (!clientRootRole){
        res.status(409).send({ result : 'There is no root Client role in this company'})
        return
      }

      // STEP 3: Get the new clients from rethink
      let lastImportedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'client'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      const clients = await getClientRethink(req.integrationToken, lastImportedDate);

      // STEP 4: For every client on rethink:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with rethink client in usersIntegrationsData table
      const importNumber = await importUsersFromIntegration({
        externalUsers: clients,
        alreadyConnected: alreadyConnectedClients,
        rootRoleId: clientRootRole,
        resourceType: 'client',
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (user, { id, currentUser, rootRoleId }) => {
          const randomUUID = uuidv4();
          
          return ({
            id,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.genderId === 1 ? 'M' : 'F',
            address: `${user.addressStreet}, ${user.city}`,
            email: `${randomUUID}@mail.com`, // We set to randomuuid@mail because they do not have email in rethink
            password: randomUUID,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (user) => user.clientId,
      })

      res.status(200).send({importNumber})
      return
    } 

    if (req.params.software === 'therapypms') {
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedClients = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'therapypms',
        companyId: req.currentUser.companyId,
        resourceType: 'client'
      });

      // STEP 2: Get the root Client role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const clientRootRole = roles.rows.find(
        (role) => role.name === "Client",
      )?.id;

      if (!clientRootRole){
        res.status(409).send({ result: 'There is no root Client role in this company' });
        return;
      }

      // STEP 3: Get the new clients from TherapyPMS
      let lastImportedDate = '2000-01-20';
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'client'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      const clients = await getClientsTherapyPMS(req.integrationToken, lastImportedDate);

      // STEP 4: Import clients
      const importNumber = await importUsersFromIntegration({
        externalUsers: clients,
        alreadyConnected: alreadyConnectedClients,
        rootRoleId: clientRootRole,
        resourceType: 'client',
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (user, { id, currentUser, rootRoleId }) => {
          const randomUUID = uuidv4();

          let patientFormattedBirthday = null;
          if (user.patient_dob && user.patient_dob !== '') {
            const parsedDate = moment(user.patient_dob);
            if (parsedDate.isValid()) {
              patientFormattedBirthday = parsedDate.format('YYYY-MM-DD');
            }
          }

          let patientPhoneNumber = null;
          if (user.patient_phone_number && user.patient_phone_number.trim() !== '') {
            patientPhoneNumber = user.patient_phone_number;
          }

          let patientGender = null;
          if (user.patient_gender === 'Male') {
            patientGender = 'M';
          } else if (user.patient_gender === 'Female') {
            patientGender = 'F';
          }

          return ({
            id,
            firstName: user.patient_first_name,
            lastName: user.patient_last_name,
            gender: patientGender,
            email: user.patient_email,
            password: randomUUID,
            phoneNumber: patientPhoneNumber,
            birthday: patientFormattedBirthday,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (user) => user.patient_id,
      });

      res.status(200).send({ importNumber });
      return;
    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

// Sync client (NEW reusable one)
router.post(
  '/sync-client/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    if (req.params.software === 'rethink'){
      const transaction = await db.sequelize.transaction();
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedClients = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'client'
      })

      // STEP 2: Get the clients from ABA
      const clientsFromABA = await getUsersByResourceName(req, 'Client', true);

      // STEP 3: Get the latest sync client call for rethink
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'client'
        },
        { transaction },
      );

      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified clients from rethink
      const clientsFromRethink = await getClientRethink(req.integrationToken, lastSyncedDate);

      // STEP 5: distribute entities
      const result = reconcileEntityConnections({
        localEntities: clientsFromABA.rows, 
        externalEntities: clientsFromRethink, 
        connections: alreadyConnectedClients, 
        externalRefKey: 'clientId',
      });

      // STEP 6: Update the client data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "client",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.firstName,
          lastName: external.lastName,
          email: local.email,
          gender: external.genderId === 1 ? 'M' : 'F',
          address: `${external.addressStreet}, ${external.city}`,
          address2: local.address2,
          birthday: local.birthday,
          phoneNumber: local.phoneNumber,
        }),
      })

      // STEP 7: Connect clients with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'client',
        transaction,
        getExternalId: (user) => user.clientId,
      })

      // STEP 8: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'client'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }

    if (req.params.software === 'therapypms'){
      const transaction = await db.sequelize.transaction();
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedClients = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'client'
      })

      // STEP 2: Get the clients from ABA
      const clientsFromABA = await getUsersByResourceName(req, 'Client', true);

      // STEP 3: Get the latest sync client call for rethink
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'client'
        },
        { transaction },
      );

      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified clients from TherapyPMS
      const clientsFromTherapyPMS = await getClientsTherapyPMS(req.integrationToken, lastSyncedDate);

      // STEP 5: distribute entities
      const result = reconcileEntityConnections({
        localEntities: clientsFromABA.rows, 
        externalEntities: clientsFromTherapyPMS, 
        connections: alreadyConnectedClients, 
        externalRefKey: 'patient_id',
      });

      // STEP 6: Update the client data in ABA from TherapyPMS
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "client",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => {
          let patientFormattedBirthday = null;
          if (external.patient_dob && external.patient_dob !== '') {
            const parsedDate = moment(external.patient_dob);
            if (parsedDate.isValid()) {
              patientFormattedBirthday = parsedDate.format('YYYY-MM-DD');
            }
          }

          let patientPhoneNumber = null;
          if (external.patient_phone_number && external.patient_phone_number.trim() !== '') {
            patientPhoneNumber = external.patient_phone_number;
          }

          let patientGender = null;
          if (external.patient_gender === 'Male') {
            patientGender = 'M';
          } else if (external.patient_gender === 'Female') {
            patientGender = 'F';
          }

          return {
            firstName: external.patient_first_name,
            lastName: external.patient_last_name,
            email: external.patient_email || local.email,
            gender: patientGender,
            address: local.address,
            address2: local.address2,
            birthday: patientFormattedBirthday || local.birthday,
            phoneNumber: patientPhoneNumber || local.phoneNumber,
          }
        },
      })

      // STEP 7: Connect clients with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'patient_first_name',
        externalLastNameKey: 'patient_last_name',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'client',
        transaction,
        getExternalId: (user) => user.patient_id,
      })

      // STEP 8: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'client'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }
    
    res.status(400).send({ result : "Invalid software"})
  }),
)

// Read synced resources
router.get(
  '/synced-resources',
  wrapAsync(async (req, res) => {
    if (!req.query.software || !req.query.resourceType){
      res.status(400).send({ result : "Bad request !!!"})
      return
    }
      
    let result = await UsersInegrationDataDBApi.findAllForImportModal({
      integratingSoftware: req.query.software,
      companyId: req.currentUser.companyId,
      resourceType: req.query.resourceType,
      limit: req.query.limit,
      page: req.query.page
    })

    res.status(200).send(result)
    return
  }),
)
// Import funders (NEW reusable one)
router.post(
  '/import-funder/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected resources from usersIntegrationData table
      //         Extract the latest import date with ordering by createdAT and use it
      //         for getting the created users after last import
      let alreadyConnectedFunders = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'rethink',
        companyId: req.currentUser.companyId,
        resourceType: 'funder'
      })

      // STEP 2: Get the root Funder role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const funderRootRole = roles.rows.find(
        (role) => role.name === "Funder",
      )?.id;

      if (!funderRootRole){
        res.status(409).send({ result : 'There is no root Funder role in this company'})
        return
      }

      // STEP 3: Get the all funders from rethink
      const funders = await getFundersRethink(req.integrationToken);

      // STEP 4: For every funder on rethink:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with rethink funder in usersIntegrationsData table
      const importNumber = await importUsersFromIntegration({
        externalUsers: funders,
        alreadyConnected: alreadyConnectedFunders,
        rootRoleId: funderRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'funder',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (user, { id, currentUser, rootRoleId }) => {
          const randomUUID = uuidv4();

          return ({
            id,
            firstName: user.name,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
            email: `${randomUUID}@mail.com`,
          });
        },
        getExternalId: (user) => user.id,
      })

      res.status(200).send({importNumber})
      return
    }

    if (req.params.software === 'therapypms') {
      // STEP 1: Get the already connected funders from usersIntegrationData table
      let alreadyConnectedFunders = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'therapypms',
        companyId: req.currentUser.companyId,
        resourceType: 'funder'
      })

      // STEP 2: Get the root Funder role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const funderRootRole = roles.rows.find(
        (role) => role.name === "Funder",
      )?.id;

      if (!funderRootRole){
        res.status(409).send({ result : 'There is no root Funder role in this company'})
        return
      }

      // STEP 3: Get the new activities from TherapyPMS since funders are connected to activities
      let lastImportedDate = '2000-01-20';
      const lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'funder'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      const activities = await getActivitiesTherapyPMS(req.integrationToken, lastImportedDate);

      // Step 4: Extract the funders from activities and group them by funder_id
      const fundersMap = new Map()
      for (const activity of activities) {
        const funderdId = activity.funder_id;
        const funderName = activity.funder;
            
        if (!fundersMap.has(funderdId)) {
          fundersMap.set(funderdId, {
            funder_id: funderdId,
            funder: funderName,
            activities: []
          });
        }
      
        fundersMap.get(funderdId).activities.push({
          ...activity,
        });
      }
      const funders = Array.from(fundersMap.values());

      // STEP 5: For every funder on therapyPMS:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with therapyPMS activity in usersIntegrationsData table

      const importNumber = await importUsersFromIntegration({
        externalUsers: funders,
        alreadyConnected: alreadyConnectedFunders,
        rootRoleId: funderRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'funder',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (funder, { id, rootRoleId, currentUser }) => {
          const randomUUID = uuidv4();

          return ({
            id,
            firstName: funder.funder,
            email: `${randomUUID}@mail.com`,
            password: randomUUID,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (funder) => funder.funder_id,
      })

      res.status(200).send({importNumber})
      return
    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

// Sync funders (NEW reusable one)
router.post(
  '/sync-funder/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    if (req.params.software === 'rethink'){
      const transaction = await db.sequelize.transaction();
      
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedFunders = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'funder'
      })

      // STEP 2: Get the funders from ABA
      const fundersFromABA = await getUsersByResourceName(req, 'Funder', true);
      
      // STEP 3: Get the funders from rethink
      const fundersFromRethink = await getFundersRethink(req.integrationToken);

      // STEP 4: distribute entities
      const result = reconcileEntityConnections({
        localEntities: fundersFromABA.rows, 
        externalEntities: fundersFromRethink, 
        connections: alreadyConnectedFunders, 
        externalRefKey: 'id',
      });

      // STEP 5: Update the funder data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "funder",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.name,
          email: external.email || local.email,
          address: local.address,
          address2: local.address2,
          birthday: local.birthday,
        }),
      })

      // STEP 6: Connect funders with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'name',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'funder',
        transaction,
        getExternalId: (funder) => funder.id,
      })

      // STEP 7: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'funder'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }

    if (req.params.software === 'therapypms') {
      const transaction = await db.sequelize.transaction();
      
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedFunders = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'funder'
      })

      // STEP 2: Get the funders from ABA
      const fundersFromABA = await getUsersByResourceName(req, 'Funder', true);
      
      // STEP 3: Get the latest sync funder call for therapypms
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'funder'
        },
        { transaction },
      );

      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified activities from TherapyPMS and extract funders
      const activities = await getActivitiesTherapyPMS(req.integrationToken, lastSyncedDate);

      // STEP 5: Extract the funders from activities and group them by funder_id
      const fundersMap = new Map()
      for (const activity of activities) {
        const funderId = activity.funder_id;
        const funderName = activity.funder;
            
        if (!fundersMap.has(funderId)) {
          fundersMap.set(funderId, {
            funder_id: funderId,
            funder: funderName,
            activities: []
          });
        }
      
        fundersMap.get(funderId).activities.push({
          ...activity,
        });
      }
      const fundersFromTherapyPMS = Array.from(fundersMap.values());

      // STEP 6: distribute entities
      const result = reconcileEntityConnections({
        localEntities: fundersFromABA.rows, 
        externalEntities: fundersFromTherapyPMS, 
        connections: alreadyConnectedFunders, 
        externalRefKey: 'funder_id',
      });

      // STEP 7: Update the funder data in ABA from TherapyPMS
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "funder",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.funder,
          email: local.email, // Keep existing email since TherapyPMS doesn't provide funder emails
          address: local.address,
          address2: local.address2,
          birthday: local.birthday,
        }),
      })

      // STEP 8: Connect funders with firstName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'funder',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'funder',
        transaction,
        getExternalId: (funder) => funder.funder_id,
      })

      // STEP 9: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'funder'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

// Import locations (NEW reusable one)
router.post(
  '/import-location/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedLocations = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'rethink',
        companyId: req.currentUser.companyId,
        resourceType: 'location'
      })

      // STEP 2: Get the root Location role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const locationRootRole = roles.rows.find(
        (role) => role.name === "Location",
      )?.id;

      if (!locationRootRole){
        res.status(409).send({ result : 'There is no root Location role in this company'})
        return
      }

      // STEP 3: Get all locations from rethink
      const locations = await getLocationsRethink(req.integrationToken);

      // STEP 4: For every location on rethink:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with rethink location in usersIntegrationsData table

      const importNumber = await importUsersFromIntegration({
        externalUsers: locations,
        alreadyConnected: alreadyConnectedLocations,
        rootRoleId: locationRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'location',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (location, { id, rootRoleId, currentUser }) => {
          const randomUUID = uuidv4();

          return ({
            id,
            firstName: location.locationName,
            phoneNumber: location.phone,
            email: location.email || `${randomUUID}@mail.com`,
            password: randomUUID,
            address: location.address1,
            address2: location.address2,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (location) => location.locationId,
      })

      res.status(200).send({importNumber})
      return
    }

    if (req.params.software === 'therapypms') {
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedLocations = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'therapypms',
        companyId: req.currentUser.companyId,
        resourceType: 'location'
      })

      // STEP 2: Get the root Location role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const locationRootRole = roles.rows.find(
        (role) => role.name === "Location",
      )?.id;

      if (!locationRootRole) {
        res.status(409).send({ result : 'There is no root Location role in this company'})
        return
      }

      // STEP 3: Get the new locations from TherapyPMS
      let lastImportedDate = '2000-01-20';
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'location'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      const locations = await getLocationsTherapyPMS(req.integrationToken, lastImportedDate);

      // STEP 4: For every location on therapyPMS:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with therapyPMS location in usersIntegrationsData table

      const importNumber = await importUsersFromIntegration({
        externalUsers: locations,
        alreadyConnected: alreadyConnectedLocations,
        rootRoleId: locationRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'location',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (location, { id, rootRoleId, currentUser }) => {
          const randomUUID = uuidv4();

          return ({
            id,
            firstName: location.place_of_service_name,
            email: `${randomUUID}@mail.com`,
            password: randomUUID,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (location) => location.place_of_service_code,
      })

      res.status(200).send({importNumber})
      return
    }

    res.status(400).send({ result : "Invalid software"})
  }),
)

// Sync locations (NEW reusable one)
router.post(
  '/sync-location/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    if (req.params.software === 'rethink'){
      const transaction = await db.sequelize.transaction();
      
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedLocations = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'location'
      })

      // STEP 2: Get the locations from ABA
      const locationsFromABA = await getUsersByResourceName(req, 'Location', true);
      
      // STEP 3: Get the locations from rethink
      const locationsFromRethink = await getLocationsRethink(req.integrationToken);

      // STEP 4: distribute entities
      const result = reconcileEntityConnections({
        localEntities: locationsFromABA.rows, 
        externalEntities: locationsFromRethink, 
        connections: alreadyConnectedLocations, 
        externalRefKey: 'locationId',
      });

      // STEP 5: Update the location data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "location",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.locationName,
          phoneNumber: external.phone,
          email: external.email || local.email,
          address: external.address1,
          address2: external.address2,
        }),
      })

      // STEP 6: Connect locations with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'locationName',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'location',
        transaction,
        getExternalId: (location) => location.locationId,
      })

      // STEP 7: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'location'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }

    if (req.params.software === 'therapypms') {
      const transaction = await db.sequelize.transaction();
      
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedLocations = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'location'
      })

      // STEP 2: Get the locations from ABA
      const locationsFromABA = await getUsersByResourceName(req, 'Location', true);

      // STEP 3: Get the latest sync employee call for rethink
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'location'
        },
        { transaction },
      );

      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the locations from therapypms
      const locationsFromTherapyPMS = await getLocationsTherapyPMS(req.integrationToken, lastSyncedDate);

      // STEP 5: distribute entities
      const result = reconcileEntityConnections({
        localEntities: locationsFromABA.rows, 
        externalEntities: locationsFromTherapyPMS, 
        connections: alreadyConnectedLocations, 
        externalRefKey: 'place_of_service_code',
      });

      // STEP 6: Update the location data in ABA from therapypms
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "location",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.place_of_service_name,
          phoneNumber: local.phoneNumber,
          email: local.email,
          address: local.address,
          address2: local.address2,
        }),
      })

      // STEP 7: Connect locations with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'place_of_service_name',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'location',
        transaction,
        getExternalId: (location) => location.place_of_service_code,
      })

      // STEP 8: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'location'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

router.post(
  '/import-role/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected roles from rolesIntegrationData table
      let alreadyConnectedRoles = await RolesIntegrationDataDBApi.findAll({
        companyId: req.currentUser.companyId,
        integratingSoftware: 'rethink',
      })

      // STEP 2: Get the root Employee role to set as parentId
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const employeeRootRole = roles.rows.find(
        (role) => role.name === "Employee",
      )?.id;

      if (!employeeRootRole){
        res.status(409).send({ result : 'There is no root Employee role in this company'})
        return
      }

      // STEP 3: Get the new roles from rethink
      const rolesRethink = await getRolesRethink(req.integrationToken);

      // STEP 4: For every role on rethink:
      //          *) Check if that role is already connected
      //         **) Create role in ABA Schedules
      //        ***) Connect it with rethink role in rolesIntegrationsData table
      const importNumber = await importRolesFromIntegration({
        externalRoles: rolesRethink,
        alreadyConnected: alreadyConnectedRoles,
        rootRoleId: employeeRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        transaction,
        currentUser: req.currentUser,
        mapExternalToRole: (role, { id, rootRoleId, currentUser }) => ({
          id,
          name: ROOT_ROLE_NAMES.includes(role.roleTitle) ? `${role.roleTitle} (${req.params.software})` : role.roleTitle,
          parent: rootRoleId,
          companyId: currentUser.companyId,
          dataAccess: 'All'
        }),
        getExternalId: (role) => role.roleId,
      })

      res.status(200).send({importNumber})
      return
    }
    
    res.status(400).send({ result : "Invalid software"})
  }),
)

// Sync roles (NEW reusable one)
router.post(
  '/sync-role/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected roles from rolesIntegrationData table
      let alreadyConnectedRoles = await RolesIntegrationDataDBApi.findAll({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
      })

      // STEP 2: Get the roles from ABA
      const rolesFromABA = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });

      // STEP 3: Get the newly modified roles from rethink
      const rolesFromRethink = await getRolesRethink(req.integrationToken);

      // STEP 4: distribute entities
      const result = reconcileEntityConnections({
        localEntities: rolesFromABA.rows,
        externalEntities: rolesFromRethink,
        connections: alreadyConnectedRoles,
        localRefKey: 'roleId',
        externalRefKey: 'roleId',
      });

      // STEP 5: Update the role data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedRoles({
        linkedPairs: result.linkedPairs,
        transaction,
        currentUser: req.currentUser,
        mapExternalToRole: (external, local) => ({
          name: ROOT_ROLE_NAMES.includes(external.roleTitle)
            ? `${external.roleTitle} (${req.params.software})`
            : external.roleTitle,
        }),
      })

      // STEP 6: Connect roles with name
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'roleTitle',
        localFirstNameKey: 'name',
        isRole: true,
        matchExternalRoleToLocalRole: (ext) => {
          return ROOT_ROLE_NAMES.includes(ext)
            ? `${ext} (${req.params.software})`
            : ext
        },
      })

      // STEP 7: Connect roles that match with name
      let newConnectionNumber = await connectRolesOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        transaction,
        getExternalId: (role) => role.roleId,
      })

      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }

    res.status(400).send({ result : "Invalid software"})

  }),
)

router.post(
  '/import-activity/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    let transaction = await db.sequelize.transaction();

    if (req.params.software === 'rethink'){
      // STEP 1: Get the already connected activities from usersIntegrationData table
      //         Extract the latest import date with ordering by createdAT and use it
      //         for getting the created users after last import
      let alreadyConnectedActivities = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'rethink',
        companyId: req.currentUser.companyId,
        resourceType: 'Activity'
      })

      // STEP 2: Get the root Activity role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const activityRootRole = roles.rows.find(
        (role) => role.name === "Activity",
      )?.id;

      if (!activityRootRole){
        res.status(409).send({ result : 'There is no root Activity role in this company'})
        return
      }

      // STEP 3: Get all activities from rethink
      let lastImportedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'activity'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      const activities = await getActivitiesRethink(req.integrationToken, lastImportedDate);

      // STEP 4: For every activity on rethink:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with rethink activity in usersIntegrationsData table

      const importNumber = await importUsersFromIntegration({
        externalUsers: activities,
        alreadyConnected: alreadyConnectedActivities,
        rootRoleId: activityRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'activity',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (activity, { id, rootRoleId, currentUser }) => {
          const randomUUID = uuidv4();

          return ({
            id,
            firstName: activity.serviceName,
            email: `${randomUUID}@mail.com`,
            password: randomUUID,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (activity) => activity.serviceId,
      })

      res.status(200).send({importNumber})
      return
    }

    if (req.params.software === 'therapypms') {
      // STEP 1: Get the already connected activities from usersIntegrationData table
      let alreadyConnectedActivities = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: 'therapypms',
        companyId: req.currentUser.companyId,
        resourceType: 'activity'
      })

      // STEP 2: Get the root Activity role
      const roles = await RolesDBApi.findAll({
        companyId: req.currentUser.companyId,
      });
      const activityRootRole = roles.rows.find(
        (role) => role.name === "Activity",
      )?.id;

      if (!activityRootRole){
        res.status(409).send({ result : 'There is no root Activity role in this company'})
        return
      }

      // STEP 3: Get the new activities from TherapyPMS
      let lastImportedDate = '2000-01-20';
      const lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'import',
          integratingSoftware: req.params.software,
          resourceType: 'activity'
        },
        { transaction },
      );
      if (lastActionCall){
        lastImportedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      const activities = await getActivitiesTherapyPMS(req.integrationToken, lastImportedDate);

      // STEP 4: For every activity on therapyPMS:
      //          *) Check if that user is already connected
      //         **) Create user in ABA Schedules
      //        ***) Connect it with therapyPMS activity in usersIntegrationsData table

      const importNumber = await importUsersFromIntegration({
        externalUsers: activities,
        alreadyConnected: alreadyConnectedActivities,
        rootRoleId: activityRootRole,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'activity',
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (activity, { id, rootRoleId, currentUser }) => {
          const randomUUID = uuidv4();

          return ({
            id,
            firstName: activity.activity_name,
            email: `${randomUUID}@mail.com`,
            password: randomUUID,
            companyId: currentUser.companyId,
            branches: currentUser.branches.map((branch) => branch.id),
            roles: [rootRoleId],
            notes: `This user has been imported from ${req.params.software}`,
          });
        },
        getExternalId: (activity) => activity.activity_id,
      })

      res.status(200).send({importNumber})
      return
    }

    res.status(400).send({ result : "Invalid software"})
  })
)

router.post(
  '/sync-activity/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    if (req.params.software === 'rethink'){
      const transaction = await db.sequelize.transaction();
      
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedActivities = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'activity'
      })

      // STEP 2: Get the activities from ABA
      const activitiesFromABA = await getUsersByResourceName(req, 'Activity', true);

      // STEP 3: Get the latest sync activity call for rethink
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'activity'
        },
        { transaction },
      );
      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified activities from rethink
      const activitiesFromRethink = await getActivitiesRethink(req.integrationToken, lastSyncedDate);

      // STEP 5: distribute entities
      const result = reconcileEntityConnections({
        localEntities: activitiesFromABA.rows, 
        externalEntities: activitiesFromRethink, 
        connections: alreadyConnectedActivities, 
        externalRefKey: 'serviceId',
      });

      // STEP 6: Update the activity data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "activity",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.serviceName,
          email: external.email || local.email,
        }),
      })

      // STEP 7: Connect activities with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'serviceName',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'activity',
        transaction,
        getExternalId: (activity) => activity.serviceId,
      })

      // STEP 8: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'activity'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }

    if (req.params.software === 'therapypms'){
      const transaction = await db.sequelize.transaction();
      
      // STEP 1: Get the already connected resources from usersIntegrationData table
      let alreadyConnectedActivities = await UsersInegrationDataDBApi.findAllByResourceType({
        integratingSoftware: req.params.software,
        companyId: req.currentUser.companyId,
        resourceType: 'activity'
      })

      // STEP 2: Get the activities from ABA
      const activitiesFromABA = await getUsersByResourceName(req, 'Activity', true);

      // STEP 3: Get the latest sync activity call for rethink
      let lastSyncedDate = '2000-01-20'
      let lastActionCall = await IntegrationImportSyncAuditDBApi.findBy(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'activity'
        },
        { transaction },
      );
      if (lastActionCall){
        lastSyncedDate = moment.utc(lastActionCall.updatedAt).format("YYYY-MM-DD")
      }
      
      // STEP 4: Get the newly modified activities from rethink
      const activitiesFromTherapyPMS = await getActivitiesTherapyPMS(req.integrationToken, lastSyncedDate);

      // STEP 5: distribute entities
      const result = reconcileEntityConnections({
        localEntities: activitiesFromABA.rows, 
        externalEntities: activitiesFromTherapyPMS, 
        connections: alreadyConnectedActivities, 
        externalRefKey: 'activity_id',
      });

      // STEP 6: Update the activity data in ABA from rethink
      const updatedAlreadyConnected = await syncLinkedResources({
        linkedPairs: result.linkedPairs,
        resourceType: "activity",
        transaction,
        currentUser: req.currentUser,
        mapExternalToUser: (external, local) => ({
          firstName: external.activity_name,
          email: local.email,
        }),
      })

      // STEP 7: Connect activities with firstName + lastName
      let matchings = matchExternalToLocalFLNames({
        externals: result.unlinkedEntities.external,
        locals: result.unlinkedEntities.local,
        externalFirstNameKey: 'activity_name',
      })
      let newConnectionNumber = await connectUsersOnIntegrationSyncing({
        matchings,
        companyInfo: req.currentUser.company,
        integratingSoftware: req.params.software,
        resourceType: 'activity',
        transaction,
        getExternalId: (activity) => activity.activity_id,
      })

      // STEP 8: Upsert integrationImportSyncAudit
      await IntegrationImportSyncAuditDBApi.upsert(
        {
          companyId: req.currentUser.companyId,
          action: 'sync',
          integratingSoftware: req.params.software,
          resourceType: 'activity'
        },
        { transaction },
      )
      transaction.commit();

      res.status(200).send({
        updated: updatedAlreadyConnected,
        connected: newConnectionNumber
      })
      return
    }
    
    res.status(400).send({ result : "Invalid software"})

  }),
)

router.post(
  '/integrate-events/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    const software = req.params.software;
    const { branches, syncEventUpdatedInThePast } = req.body
    if (!software) return res.status(400).send({ result: "Invalid software" })
    
    // Choose the appropriate finder
    const findMethod = EventsDBApi.findToBeIntegratedWithIntegrationsData;

    // Fetch the events that need (re-)syncing
    const events = await findMethod(
      { branches, syncEventUpdatedInThePast, integratingSoftware: software },
    );

    if (events.length === 0) return res.status(200).json({ msg: 'Nothing to integrate!' });
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    const eventsWithIntegrationData = await enrichEventsWithIntegrationData(events, software, roleHierarchy);

    if (software === 'rethink') {
      const successfullyIntegratedEvents = await syncEventsToRethink(eventsWithIntegrationData, req.integrationToken);
      console.log("🚀 ~ rethink ~ successfullyIntegratedEvents:", successfullyIntegratedEvents)

      if (successfullyIntegratedEvents.length) {
        await EventsIntegrationDataDBApi.upsertIntegrationRows(successfullyIntegratedEvents, 'rethink');
      }
      return res.status(200).json({ msg: 'Integrated successfully!' });
    }
    if (software === 'therapypms') {
      const successfullyIntegratedEvents = await syncEventsToTherapypms(eventsWithIntegrationData, req.integrationToken);
      console.log("🚀 ~ therapypms ~ successfullyIntegratedEvents:", successfullyIntegratedEvents)

      if (successfullyIntegratedEvents.length) {
        await EventsIntegrationDataDBApi.upsertIntegrationRows(successfullyIntegratedEvents, 'therapypms');
      }

      return res.status(200).json({ msg: 'Integrated successfully!' });
    }
    return res.status(400).send({ result: "Invalid software" })
  }),
);


router.post(
  '/import-events/:software',
  requireIntegrationAuth,
  wrapAsync(async (req, res) => {
    const software = req.params.software;
  const { branches, importEventsUpdatedInThePast, timezone } = req.body
    if (!software) return res.status(400).send({ result: "Invalid software" })
    
    let alreadyConnectedClients = await UsersInegrationDataDBApi.findAllByResourceType({
      integratingSoftware: req.params.software,
      companyId: req.currentUser.companyId,
      resourceType: 'client'
    });
    
    let alreadyConnectedEmployees = await UsersInegrationDataDBApi.findAllByResourceType({
      integratingSoftware: req.params.software,
      companyId: req.currentUser.companyId,
      resourceType: 'employee'
    })

    let alreadyConnectedActivities = await UsersInegrationDataDBApi.findAllByResourceType({
      integratingSoftware: req.params.software,
      companyId: req.currentUser.companyId,
      resourceType: 'activity'
    })

    let alreadyConnectedLocations = await UsersInegrationDataDBApi.findAllByResourceType({
      integratingSoftware: req.params.software,
      companyId: req.currentUser.companyId,
      resourceType: 'location'
    })

    // TODO: Enable after testing
    // const lookbackMs = Number(importEventsUpdatedInThePast) || 30 * 24 * 60 * 60 * 1000;
    const lookbackMs = 1 * 24 * 60 * 60 * 1000;
    
    if (software === 'rethink') {
      const importResult = await importRethinkEvents({
        token: req.integrationToken,
        branches,
        resources: {
          clients: alreadyConnectedClients?.map((client) => ({ userId: client.userId, idOther: client.idOther })) || [],
          employees: alreadyConnectedEmployees?.map((employee) => ({ userId: employee.userId, idOther: employee.idOther })) || [],
          activities: alreadyConnectedActivities?.map((activity) => ({ userId: activity.userId, idOther: activity.idOther })) || []
        },
        lookbackMs,
        currentUser: req.currentUser,
        timezone,
      });
      return res.status(200).json({ msg: 'Imported successfully!', data: importResult });
    }

    if (software === 'therapypms') {
      const importResult = await importTherapypmsEvents({
        token: req.integrationToken,
        branches,
        resources: {
          clients: alreadyConnectedClients?.map((client) => ({ userId: client.userId, idOther: client.idOther })) || [],
          employees: alreadyConnectedEmployees?.map((employee) => ({ userId: employee.userId, idOther: employee.idOther })) || [],
          activities: alreadyConnectedActivities?.map((activity) => ({ userId: activity.userId, idOther: activity.idOther })) || [],
          locations: alreadyConnectedLocations?.map((location) => ({ userId: location.userId, idOther: location.idOther, name: location.dataInOtherSoftware?.place_of_service_name ?? '' })) || [],
        },
        lookbackMs,
        currentUser: req.currentUser,
        timezone,
      });
      return res.status(200).json({ msg: 'Imported successfully!', data: importResult });
    }

    return res.status(400).send({ result: "Invalid software" })
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
