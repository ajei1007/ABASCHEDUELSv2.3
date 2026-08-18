const express = require('express');

const EventsService = require('../services/events');
const EventsDBApi = require('../db/api/events');
const BranchesDBApi = require('../db/api/branches');
const StatuseventsDBApi = require('../db/api/statusevents');
const DistancematrixDBApi = require('../db/api/distancematrix');
const getDescendentBranches = require('../utils/statistcs/getBranchHierarchy');
const getBranchTreeOfBranchList = require('../utils/getBranchTreeOfBranchList');

const SettingscompanyDBApi = require('../db/api/settingscompany');
const passport = require('passport');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const filterUsersFromEvents = require('../utils/filterUsersFromEvents');
const wrapAsync = require('../helpers').wrapAsync;
const router = require('../utils/createRouter')();
const moment = require('moment');
const rule_RRule = require('rrule');
const UsersDBApi = require('../db/api/users');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const getAvailabilitiesForDateRange = require('../utils/statistcs/getAvailabilitiesForDateRange');
const { v4: uuidv4 } = require('uuid');
const moment2 = require('moment-timezone');

const {
  getTimeconstraintUserRelation,
  getUserToSessionFrequencyConstraintRelation,
  getUserToUserFrequencyConstraintRelation,
  getGapsconstraintUserRelation,
  getStartOfWeekOfDate,
  getGroupingconstraintUserRelation,
  getNotProperSlostOnDayForUser,
  getDriveconstraintUserRelation,
  getAuthConstraintUserRelation,
  getSessionLengthconstraintUserRelation,
  getBacktobackconstraintUserRelation,
  getBreakQuantityconstraintUserRelation,
  getDistanceconstraintUserRelation,
  getSupervisionRateconstraintUserRelation,
} = require('../utils/flaging');
const { generateSchedulerEvents } = require('../controllers/events');
const getUserActivityTableDuringDateRange = require('../utils/statistcs/getUserActivityTableDuringDateRange');
const ValidationError = require('../services/notifications/errors/validation');

// TODO move to Middleware
async function checkPermissionEditEvents(req, res, next) {
  try {
    let hasUserPermission = false;
    for (let i = 0; i < req.currentUser.roles.length; i++) {
      let currentRole = req.currentUser.roles[i];
      if (currentRole.canEditEventSchedulerLocked) {
        hasUserPermission = true;
        break;
      }
    }

    // forbidden if user doesn't have permission
    if (!hasUserPermission) {
      let ancestorsBranchsMap =
        await BranchesDBApi.getAntecedentBranchesSchedulerLock(
          req.query.branches,
          req.currentUser.companyId,
          false,
        );

      if (
        !ancestorsBranchsMap.branches ||
        ancestorsBranchsMap.branches.length === 0
      ) {
        return res.status(404).send('Branch not found!');
      }

      if (ancestorsBranchsMap.hasLock) {
        return res.status(403).send('Scheduler is Locked!');
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}
// TODO make reusable
const getFullName = (a) => {
  let fullName = a.firstName;
  if (a.lastName) {
    fullName = `${a.firstName} ${a.lastName}`;
  }
  return fullName;
};
function checkIntersection(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}

// TODO: deprecated ? remove ?
router.post('/', checkPermissionEditEvents, async (req, res) => {
  await EventsService.create(
    req.body.data,
    req.currentUser,
    req.body.pushNotification,
    true,
    req.headers.referer,
  );
  const payload = true;
  res.status(200).send(payload);
});

router.post(
  '/create/multiple',
  checkPermissionEditEvents,
  wrapAsync(async (req, res) => {
    const { arr: selectedEvents, pushNotification } = req.body;

    const createdRows = await EventsService.bulkCreate(
      selectedEvents,
      req.currentUser,
      pushNotification,
    );

    const createdIds = createdRows.map((e) => e.id);
    const calendar = await generateSchedulerEvents(createdIds, false, req);

    res.status(200).send({
      calendar: calendar.requestedRange,
      created: createdIds,
      updated: [],
      deleted: [],
    });
  }),
);


router.put(
  '/:id',
  checkPermissionEditEvents,
  wrapAsync(async (req, res, next) => {
    const payload = await EventsService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
      req.body.pushNotification,
      next,
    );
    res.status(200).send(payload);
  }),
);

router.put(
  '/update/multiple',
  checkPermissionEditEvents,
  wrapAsync(async (req, res, next) => {
    const selectedEvents = req.body.arr;
    let affectedEventIds = [];
    let deletedEvents = [];
    let createdEvents = [];
    let updatedEvents = [];
    let UPDATE_LEVEL = req.query.update_level;
    let UPDATE_TYPE = req.query.update_type;
    let CANCELLATION_UPDATE = req.query.cancellation_update;
    let SANDBOX_UPDATE = req.query.sandbox_update
    for (const event of selectedEvents) {
      if (UPDATE_LEVEL === 'RRULE') {
        if (UPDATE_TYPE !== 'ALL') {
          // if UPDATE_TYPE is not ALL for RRULE UPDATE_LEVEL
          // we need to skip
          continue;
        }

        const payload = await EventsService.updateLevelRRULE(
          event.data,
          event.isolationGroupId,
          req.currentUser,
          req.body.pushNotification,
          next,
          {
            left: event.leftEventId,
            right: event.rightEventId,
            main: event.mainEventId,
          },
        );
        createdEvents = [...createdEvents, ...payload.created];
        deletedEvents = [...deletedEvents, ...payload.deleted];
        updatedEvents = [...updatedEvents, ...payload.updated];
        affectedEventIds = [...affectedEventIds, ...payload.allAffectedIds];
        continue;
      }

      if (UPDATE_LEVEL === 'SIMPLE') {
        const payload = await EventsService.updateLevelSIMPLE(
          event.data,
          UPDATE_TYPE,
          CANCELLATION_UPDATE,
          event.isolationGroupId,
          req.currentUser,
          req.body.pushNotification,
          next,
          {
            left: event.leftEventId,
            right: event.rightEventId,
            main: event.mainEventId,
          },
          SANDBOX_UPDATE,
        );

        createdEvents = [...createdEvents, ...payload.created];
        deletedEvents = [...deletedEvents, ...payload.deleted];
        updatedEvents = [...updatedEvents, ...payload.updated];
        affectedEventIds = [...affectedEventIds, ...payload.allAffectedIds];
        continue;
      }
    }

    // filter out duplicates
    affectedEventIds = [...new Set(affectedEventIds)];

    // Generating formatted events
    const schedulerEvents = await generateSchedulerEvents(
      affectedEventIds,
      true,
      req,
    );

    return res.status(200).send({
      calendar: schedulerEvents.requestedRange,
      created: createdEvents,
      updated: updatedEvents,
      deleted: deletedEvents,
    });
  }),
);

// TODO: deprecated ? remove ?
router.put(
  '/update/sandbox',
  checkPermissionEditEvents,
  wrapAsync(async (req, res, next) => {
    await EventsService.enableSandboxModeOfEvents(req.body.data, next);
    res.status(200).send(true);
  }),
);

router.post(
  '/multiple/undo',
  checkPermissionEditEvents,
  wrapAsync(async (req, res) => {
    let { affectedEventIds, destroyedEventsData } =
      await EventsService.undoMultiple(req.body, req.currentUser);

    // filter out duplicates
    affectedEventIds = [...new Set(affectedEventIds)];

    const schedulerEvents = await generateSchedulerEvents(
      affectedEventIds,
      true,
      req,
    );

    const deletedAt = new Date().toISOString();

    // We do not have the destroyed events. So in order to flush them from calendar we
    // need to respond them virtually with deletedAt.
    // Also we need to give emit in socket too
    const io = req.app.get('socketio');
    for (let i = 0; i < destroyedEventsData.length; i++) {
      let obj = {
        id: destroyedEventsData[i].id,
        deletedAt,
      };
      schedulerEvents.requestedRange.push(obj);
      let event_a = { o: obj, rule: {} };
      io.to(destroyedEventsData[i].users).emit('receive_message', {
        data: [event_a],
      });
    }

    return res.status(200).send({
      calendar: schedulerEvents.requestedRange,
      created: [],
      updated: [],
      deleted: [],
    });
  }),
);

router.post(
  '/remove/multiple',
  passport.authenticate('jwt', { session: false }),
  checkPermissionEditEvents,
  wrapAsync(async (req, res) => {
    const selectedEvents = req.body.arr;
    let affectedEventIds = [];
    let deletedEvents = [];
    let createdEvents = [];
    let updatedEvents = [];
    let isolatedEvents = [];
    let DELETE_TYPE = req.query.delete_type;
    for (const event of selectedEvents) {
      const payload = await EventsService.removeGroupedEvents(
        event.data,
        DELETE_TYPE,
        event.isolationGroupId,
        req.currentUser,
        req.body.pushNotification,
        {
          left: event.leftEventId,
          right: event.rightEventId,
          main: event.mainEventId,
        },
      );

      createdEvents = [...createdEvents, ...payload.created];
      deletedEvents = [...deletedEvents, ...payload.deleted];
      updatedEvents = [...updatedEvents, ...payload.updated];
      isolatedEvents = [...isolatedEvents, ...payload.isolated];
      affectedEventIds = [...affectedEventIds, ...payload.allAffectedIds];
      continue;
    }

    // Generating formatted events
    const schedulerEvents = await generateSchedulerEvents(
      affectedEventIds,
      true,
      req,
    );

    return res.status(200).send({
      calendar: schedulerEvents.requestedRange,
      created: createdEvents,
      updated: updatedEvents,
      deleted: deletedEvents,
      isolated: isolatedEvents,
    });
  }),
);

router.post(
  '/undelete/multiple',
  passport.authenticate('jwt', { session: false }),
  checkPermissionEditEvents,
  wrapAsync(async (req, res) => {
    const selectedEvents = req.body.arr;
    let affectedEventIds = [];
    let undeletedEvents = [];
    for (const event of selectedEvents) {
      const payload = await EventsService.undeleteGroupedEvents(
        event,
        req.currentUser,
      );

      undeletedEvents = [...undeletedEvents, ...payload.undeleted];
      affectedEventIds = [...affectedEventIds, ...payload.allAffectedIds];
      continue;
    }

    // Generating formatted events
    const schedulerEvents = await generateSchedulerEvents(
      affectedEventIds,
      true,
      req,
    );

    return res.status(200).send({
      calendar: schedulerEvents.requestedRange,
      undeleted: undeletedEvents,
    });
  }),
);

// TODO: deprecated ? remove ?
router.delete(
  '/:id',
  checkPermissionEditEvents,
  wrapAsync(async (req, res) => {
    await EventsService.remove(
      req.params.id,
      req.currentUser,
      req.body.pushNotification,
    );
    res.status(200).send(true);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    const dataAccessArray = req.currentUser.roles.map(
      (role) => role.dataAccess,
    );
    let dataAccess = 'User';
    let query = { ...req.query, companyId: req.currentUser.companyId };

    // set branches
    if (query.branches) {
      query.branches = await BranchesDBApi.getDescendentBranches({
        branchIds: query.branches,
      });
    } else {
      query.branches = [];
    }

    //set company
    query.companyId = req.currentUser.companyId;

    // set roles
    // Previously it was setting all Person roles
    // I set it by default for not breaking anything
    // If there is role filter it will override it
    let roleList = [];
    let mainRole = 'Person';
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    if (req.query.role) {
      mainRole = req.query.role;
    }
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (value.includes(mainRole)) {
        roleList.push(key);
      }
    });

    // I use this role lists when I am checking the resource type of each user
    let employeeRoleList = [];
    let clientRoleList = [];
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (value.includes('Client')) {
        clientRoleList.push(key);
      }

      if (value.includes('Employee')) {
        employeeRoleList.push(key);
      }
    });

    query.roles = roleList;

    if (dataAccessArray.includes('All')) {
      dataAccess = 'All';
    } else if (dataAccessArray.includes('Branch')) {
      dataAccess = 'Branch';
    }

    let result = {
      rows: [],
      count: 0,
    };
    if (dataAccess == 'User') {
      result = await EventsDBApi.findAllEventsForTable({
        ...req.query,
        users: req.currentUser.id,
        companyId: req.currentUser.companyId,
      });
    } else {
      result = await EventsDBApi.findAllEventsForTable(query);
    }
    const events = result?.rows ?? [];

    let eventIds = new Array();
    for (let p = 0; p < events.length; p++) {
      eventIds.push(events[p].id);
    }
    let statuses = await StatuseventsDBApi.findAllForConfirmation({
      includeEvent: false,
      companyId: req.currentUser.companyId,
      event: eventIds.join('|'),
    });

    // group statuses by event
    let groupedByEventId = new Map();
    for (let i = 0; i < statuses.length; i++) {
      if (!groupedByEventId.has(statuses[i].eventId)) {
        groupedByEventId.set(statuses[i].eventId, new Array());
      }
      let currentStatusGroup = groupedByEventId.get(statuses[i].eventId);
      currentStatusGroup.push(statuses[i]);
    }

    // if event has no status then create empty array in map
    for (let p = 0; p < events.length; p++) {
      if (!groupedByEventId.has(events[p].id)) {
        groupedByEventId.set(events[p].id, new Array());
      }
    }

    // add each users status in event
    const eventsWithStatuses = events.map((currentEvent) => {
      let currentEventsStatuses = groupedByEventId.get(currentEvent.id) || [];

      const eventUsers = currentEvent.users.map((currentUser) => {
        const updatedUser = {
          ...currentUser,
          resourceType: '',
        };

        // Check if currentUser's resourceType
        const isClient = currentUser.roles.some((role) =>
          clientRoleList.includes(role.name),
        );
        const isEmployee =
          !isClient &&
          currentUser.roles.some((role) =>
            employeeRoleList.includes(role.name),
          );
        updatedUser.resourceType = isClient
          ? 'Client'
          : isEmployee
          ? 'Employee'
          : '';

        // remove roles as they are not needed in the response
        //delete updatedUser.roles;

        let hasStatus = false;
        for (let w = 0; w < currentEventsStatuses.length; w++) {
          if (
            currentEventsStatuses[w].user &&
            currentEventsStatuses[w].user.id === currentUser.id
          ) {
            delete currentEventsStatuses[w].user;
            updatedUser.statusEvent = currentEventsStatuses[w];
            hasStatus = true;
            break;
          }
        }

        // Note: If user doesn't have any status then it is "Pending Confirmation"
        if (!hasStatus) {
          updatedUser.statusEvent = {
            id: null,
            startdatetime: null,
            status: 'Pending Confirmation',
            note: null,
            noteadmin: null,
            late: null,
            latetime: null,
            importHash: null,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.createdAt,
            deletedAt: null,
            eventId: updatedUser.id,
            userId: updatedUser.id,
            reasonId: null,
            createdById: null,
            updatedById: null,
            reason: null,
            updatedBy: null,
          };
        }
        return updatedUser;
      });

      return {
        ...currentEvent,
        users: eventUsers,
      };
    });

    return res.status(200).send({
      rows: eventsWithStatuses,
      page: req.query.page ? Number(req.query.page) : -1,
      count: result.count,
    });
  }),
);

router.get(
  '/list/for-analytics',
  wrapAsync(async (req, res) => {
    // This route is only for ABC. So validate for that company
    if (req.currentUser.companyId !== '5bc531ab-611f-41f3-9373-b7cc5d09c93d'){
      throw new ValidationError(
        'errors.forbidden.message',
      );
    }
    // get Employee and Client role list
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    // I use this role lists when I am checking the resource type of each user
    let employeeRoleList = [];
    let clientRoleList = [];
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (value.includes('Client')) {
        clientRoleList.push(key);
      }

      if (value.includes('Employee')) {
        employeeRoleList.push(key);
      }
    });
    if (!req.query.updatedAt){
      throw new ValidationError('events.missingRequiredQueryParam');
    }

    if (isNaN(new Date(req.query.updatedAt).getTime())){
      throw new ValidationError('events.invalidQueryParameter');
    }

    // Get the date 90 days ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    // Check if the updatedAt date is older than 3 months ago
    if (new Date(req.query.updatedAt) < threeMonthsAgo) {
      throw new ValidationError('events.invalidQueryParameter');
    }

    let query = { updatedAt: req.query.updatedAt, companyId: req.currentUser.companyId, showDeleted: req.query.showDeleted, cancelled: req.query.cancelled, page: req.query.page };
    result = await EventsDBApi.findAllEventsForAnalytics(query, { clientRoles: clientRoleList, employeeRoles: employeeRoleList });
    return res.status(200).send({
      rows: result.events,
      count: result.events.length,
      page : result.page
    });
  }),
);

router.get(
  '/ids',
  wrapAsync(async (req, res) => {
    const dataAccessArray = req.currentUser.roles.map(
      (role) => role.dataAccess,
    );
    let dataAccess = 'User';
    let query = { ...req.query };
    if (dataAccessArray.includes('All')) {
      dataAccess = 'All';
    } else if (dataAccessArray.includes('Branch')) {
      dataAccess = 'Branch';
    }
    if (dataAccess == 'User') {
      const events = await EventsDBApi.findAll({
        ...req.query,
        users: req.currentUser.id,
      });
      const events_ids = events.rows.map((event) => event.id).join('|');
      query = { ...query, ids: events_ids };
    }
    const payload = await EventsDBApi.findAllIds(query);

    res.status(200).send(payload);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await EventsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    { companyId: req.currentUser.companyId },
  );

  res.status(200).send(payload);
});

router.get('/statusevents', async (req, res) => {
  let userIds = new Array();
  let statuses = new Array();
  if (req.query.people && req.query.people != '') {
    userIds = req.query.people.split('|');
  }
  if (req.query.status && req.query.status != '') {
    statuses = req.query.status.split('|');
  }
  let startInUTC = moment.utc(req.query.start).toDate();
  let endInUTC = moment.utc(req.query.end).toDate();

  const payload = await StatuseventsDBApi.findAllForSchedulerTable({
    limit: req.query.limit,
    page: req.query.page,
    user: userIds,
    status: statuses,
    start: startInUTC,
    end: endInUTC,
  });

  res.status(200).send(payload);
});

router.post(
  '/group/ids',
  wrapAsync(async (req, res) => {
    const payload = await EventsDBApi.findByGroupIds({
      eventGroupIds: req.body.ids || '',
      companyId: req.currentUser.companyId || '',
    });

    const groupedEvents = Object.values(
      payload.reduce((acc, event) => {
        const groupId = event.eventGroupId;
        if (!acc[groupId]) {
          acc[groupId] = { eventGroupId: groupId, events: [], count: 0 };
        }
        acc[groupId].events.push(event);
        acc[groupId].count++;
        return acc;
      }, {}),
    );

    res.status(200).send({ result: groupedEvents });
  }),
);

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await EventsDBApi.findBy({ id: req.params.id });
    if (!payload) {
      throw new ValidationError('events.notFound');
    }

    // TODO Refactor the following @jepbarasgarov :
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    // I use this role lists when I am checking the resource type of each user
    let employeeRoleList = [];
    let clientRoleList = [];
    Object.entries(roleHierarchy).map((t) => {
      const [key, value] = t;
      if (value.includes('Client')) {
        clientRoleList.push(key);
      }

      if (value.includes('Employee')) {
        employeeRoleList.push(key);
      }
    });
    const clients_list = filterUsersFromEvents(payload.users, roleHierarchy, [
      'Client',
    ]).map((ty) => getFullName(ty.dataValues));
    const employees_list = filterUsersFromEvents(payload.users, roleHierarchy, [
      'Employee',
    ]).map((ty) => getFullName(ty.dataValues));
    const activity = filterUsersFromEvents(payload.users, roleHierarchy, [
      'Activity',
    ]).find((t) => {
      const role_names = t.dataValues.roles.map((ro) => ro.dataValues.name);
      for (let index = 0; index < role_names.length; index++) {
        const element = role_names[index];
        if (roleHierarchy[element].includes('Activity')) {
          return true;
        }
      }
      return false;
    });
    const locations_list = filterUsersFromEvents(payload.users, roleHierarchy, [
      'Location',
    ]).map((ty) => getFullName(ty.dataValues));

    const color = activity?.dataValues?.color ?? 'black';
    const event = JSON.parse(JSON.stringify(payload));

    let statuses = await StatuseventsDBApi.findAllForConfirmation({
      includeEvent: false,
      companyId: req.currentUser.companyId,
      event: event.id,
    });
    const eventUsersWithStatus = event.users.map((currentUser) => {
      const updatedUser = {
        ...currentUser,
        resourceType: '',
      };

      // Check if currentUser's resourceType
      const isClient = currentUser.roles.some((role) =>
        clientRoleList.includes(role.name),
      );
      const isEmployee =
        !isClient &&
        currentUser.roles.some((role) => employeeRoleList.includes(role.name));
      updatedUser.resourceType = isClient
        ? 'Client'
        : isEmployee
        ? 'Employee'
        : '';

      // remove roles as they are not needed in the response
      //delete updatedUser.roles;
      let currentEventsStatuses = statuses;

      let hasStatus = false;
      for (let w = 0; w < currentEventsStatuses.length; w++) {
        if (
          currentEventsStatuses[w].user &&
          currentEventsStatuses[w].user.id === currentUser.id
        ) {
          delete currentEventsStatuses[w].user;
          updatedUser.statusEvent = currentEventsStatuses[w];
          hasStatus = true;
          break;
        }
      }

      // Note: If user doesn't have any status and it is Person then it is "Pending Confirmation"
      if (!hasStatus && (isClient || isEmployee)) {
        updatedUser.statusEvent = {
          id: null,
          startdatetime: null,
          status: 'Pending Confirmation',
          note: null,
          noteadmin: null,
          late: null,
          latetime: null,
          importHash: null,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.createdAt,
          deletedAt: null,
          eventId: updatedUser.id,
          userId: updatedUser.id,
          reasonId: null,
          createdById: null,
          updatedById: null,
          reason: null,
          updatedBy: null,
        };
      }
      return updatedUser;
    });

    const allStatusEvents = eventUsersWithStatus
      .filter((item) => item.statusEvent)
      .map((item) => ({
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        resourceType: item.resourceType,
        statusEvent: item.statusEvent,
      }));

    res.status(200).send({
      startRecur: event.startRecur,
      endRecur: event.endRecur,
      id: event.id,
      start: event.start,
      end: event.end,
      address: event.address,
      notes: event.notes,
      employees: employees_list,
      clients: clients_list,
      locations: locations_list,
      activity: activity?.dataValues?.firstName ?? 'None',
      eventGroupId: event.eventGroupId,
      createdById: event.createdById,
      updatedById: event.updatedById,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      color,
      isCancelled: event.isCancelled,
      statusevents: allStatusEvents,
    });
  }),
);

router.post(
  '/eventhistory/constraints/:id',
  wrapAsync(async (req, res) => {
    const event = await EventsDBApi.findByIdForConstraints({
      id: req.params.id,
    });
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    let mostPriorConstriants = new Array();

    if (req.body.hard && req.body.hard.length > 0) {
      mostPriorConstriants.push(...req.body.hard.split('|'));
    }

    if (req.body.highPriority && req.body.highPriority.length > 0) {
      mostPriorConstriants.push(...req.body.highPriority.split('|'));
    }
    if (!event) {
      res.status(404).send('not found');
      return;
    }

    // consider the requested timezone while calculating overbooking
    const timezone = req.body?.timezone ?? 'America/Los_Angeles';

    if (!event.isCancelled) {
      // generate the rule of event
      const startRuleAccordingEvent = moment
        .utc(
          event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .toDate();
      const endRuleAccordingEvent = moment.utc(event.endRecur).toDate();

      let weekDaysOfEvent = [];
      // set the weekdays of rule
      if (event.M) {
        weekDaysOfEvent.push(0);
      }
      if (event.T) {
        weekDaysOfEvent.push(1);
      }
      if (event.W) {
        weekDaysOfEvent.push(2);
      }
      if (event.R) {
        weekDaysOfEvent.push(3);
      }
      if (event.F) {
        weekDaysOfEvent.push(4);
      }
      if (event.S) {
        weekDaysOfEvent.push(5);
      }
      if (event.U) {
        weekDaysOfEvent.push(6);
      }
      if (weekDaysOfEvent.length === 0) {
        res.status(200).send(true);
      }

      let startRule = startRuleAccordingEvent;
      let endRule = endRuleAccordingEvent;

      let rruleObject = {
        freq: rule_RRule.RRule[event.frequency.toUpperCase()],
        interval: event.interval,
        byweekday: weekDaysOfEvent,
        dtstart: startRule,
        until: endRule,
      };

      if (event.bysetpos !== null) {
        rruleObject = {
          ...rruleObject,
          bysetpos: Number(event.bysetpos),
        };
      }

      let rule = new rule_RRule.RRule(rruleObject);

      // get all recurring events
      let allEventsWithRule = rule.all();
      let convertedDates = new Array();

      for (let j = 0; j < allEventsWithRule.length; j++) {
        const converted = moment(allEventsWithRule[j])
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ssZ');

        convertedDates.push(moment(converted).toDate());
      }

      // sort converted dates in increasing order
      convertedDates.sort((a, b) => a - b);

      let usersCostraints = new Array();
      let userIdArray = new Array();
      for (let k = 0; k < event.users.length; k++) {
        let currentUser = event.users[k];
        const user = await UsersDBApi.getUserRoleSubgroupBranchList({
          id: currentUser.id,
        });

        let roleList = [];
        let subgroupList = [];
        let branchList = [];
        const roleHierarchy = await getRoleHierarchy(user.companyId);
        //set role set
        if (user.roles.length > 0) {
          // Fetch from backend
          const roleNameArray = user.roles.map((role) => role.name);
          Object.entries(roleHierarchy).map((t) => {
            const [key, value] = t;
            //push the decendents
            if (checkIntersection(roleNameArray, value)) {
              roleList.push(key);
            }

            //push the ancestors
            if (checkIntersection(roleNameArray, [key])) {
              const filteredValues = value.filter((item) => item !== key);
              roleList.push(...filteredValues);
            }
          });
        }

        //set subgroup set
        if (user.subgroups.length > 0) {
          subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
        }

        //set branch set
        if (user.branches.length > 0) {
          // Fetch from backend
          const branchIds = user.branches.map((branch) => branch.id);
          branchList = await BranchesDBApi.getDescendentAndAncestorBranches({
            branchIds: branchIds.join('|'),
          });
        }

        //check if the user is person
        if (!checkIntersection(roleList, ['Person'])) {
          continue;
        }

        const constraintsOfUser =
          await NewconstraintgeneratorDBApi.findConstraintsForUserSpecific({
            branches: branchList,
            roles: roleList,
            subgroups: subgroupList,
            userId: user.id,
            start: event.startRecur,
            end: event.endRecur,
            companyId: req.currentUser.companyId,
          });
        usersCostraints.push({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          roles: roleList,
          subgroups: currentUser.subgroups,
          constraints: constraintsOfUser.rows,
        });

        userIdArray.push(currentUser.id);
      }

      let eventHistory = new Array();

      let response = new Array();
      let overbookings = new Array();

      //get all dates
      let minStartForAllDates = moment
        .utc(convertedDates[0])
        .add(-7, 'days')
        .toDate();
      let maxEndForAllDates = moment
        .utc(convertedDates[convertedDates.length - 1])
        .add(7, 'days')
        .toDate();

      //get all events once
      let allEventsForAlluser =
        await EventsDBApi.findAllEventsOfMultipleUsersForConstraintBreakCheck({
          start: minStartForAllDates,
          end: maxEndForAllDates,
          userIds: userIdArray,
          sandboxMode: req.body.sandboxMode,
        });
      const availabilitiesListData = await getAvailabilitiesForDateRange(
        minStartForAllDates,
        maxEndForAllDates,
        req.currentUser.companyId,
        [],
        [],
        [],
        userIdArray,
        true,
      );

      const filteredEvents = allEventsForAlluser.rows.filter(
        (e) => !e.isCancelled,
      );

      allEventsForAlluser.rows = filteredEvents;
      allEventsForAlluser.count = filteredEvents.length;

      // get all distances once
      let distanceMatrix = new Map();
      let distances = await DistancematrixDBApi.findAllDistanceMatrixOfCompany({
        companyId: req.currentUser.companyId,
      });

      for (let dist = 0; dist < distances.length; dist++) {
        let key = [distances[dist].address1, distances[dist].address2]
          .sort()
          .join('|');
        distanceMatrix.set(key, {
          distanceInMeter: distances[dist].distance,
          durationInSecond: distances[dist].duration,
        });
      }

      for (let k = 0; k < usersCostraints.length; k++) {
        let crntUser = usersCostraints[k];
        let events = new Array();
        let availabilities = new Array();
        for (let p = 0; p < allEventsForAlluser.count; p++) {
          let e = allEventsForAlluser.rows[p];
          for (let q = 0; q < e.users.length; q++) {
            if (e.users[q].id === crntUser.userId) {
              events.push(e);
              break;
            }
          }

          if (e.activity0 && e.activity0.id === crntUser.userId) {
            events.push(e);
          }

          if (e.location0 && e.location0.id === crntUser.userId) {
            events.push(e);
          }
        }

        for (let n = 0; n < availabilitiesListData.data.count; n++) {
          let a = availabilitiesListData.data.rows[n];
          if (a.user.id === crntUser.userId) {
            availabilities.push(a);
          }
        }

        crntUser.events = {
          rows: events,
          count: events.length,
        };

        crntUser.availabilities = {
          rows: availabilities,
          count: availabilities.length,
        };
      }

      for (let i = 0; i < usersCostraints.length; i++) {
        let user = usersCostraints[i];
        if (user.constraints.length > 0) {
          for (let j = 0; j < user.constraints.length; j++) {
            let currentUsersCurrentConstraint = user.constraints[j];
            if (
              !mostPriorConstriants.includes(currentUsersCurrentConstraint.id)
            ) {
              continue;
            }
            if (currentUsersCurrentConstraint.constraintType === 'time') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }

              //if none of the users match then check the activity and location
              if (!isItContainingTheEvent) {
                let activityMatches = true;
                let locationMatches = true;

                //check the id of activity and location
                if (consequenceUserId) {
                  if (event.activity0.id !== consequenceUserId) {
                    activityMatches = false;
                  }

                  if (
                    event.location0 &&
                    event.location0.id !== consequenceUserId
                  ) {
                    locationMatches = false;
                  }
                }
                //check the role of activity and location
                if (consequenceRoleHierarchy.length > 0) {
                  let locationRoles = [];
                  let activityRoles = event.activity0.roles.map(
                    (role) => role.name,
                  );

                  if (event.location0 && event.location0.roles) {
                    locationRoles = event.location0.roles.map(
                      (role) => role.name,
                    );
                  }

                  if (
                    !checkIntersection(activityRoles, consequenceRoleHierarchy)
                  ) {
                    activityMatches = false;
                  }

                  if (
                    !checkIntersection(locationRoles, consequenceRoleHierarchy)
                  ) {
                    locationMatches = false;
                  }
                }

                //check the subgroups of activity and location
                if (consequenceSubgroupId) {
                  let locationSubgroups = [];
                  let activitySubgroups = event.activity0.subgroups.map(
                    (sbg) => sbg.id,
                  );

                  if (event.location0 && event.location0.subgroups) {
                    locationSubgroups = event.location0.subgroups.map(
                      (sbg) => sbg.id,
                    );
                  }

                  if (
                    !checkIntersection(activitySubgroups, [
                      consequenceSubgroupId,
                    ])
                  ) {
                    activityMatches = false;
                  }

                  if (
                    !checkIntersection(locationSubgroups, [
                      consequenceSubgroupId,
                    ])
                  ) {
                    locationMatches = false;
                  }
                }

                if (activityMatches || locationMatches) {
                  isItContainingTheEvent = true;
                }
              }

              if (isItContainingTheEvent) {
                let previousPayload = false;
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    // if it is custom frequency constraint
                    if (currentUsersCurrentConstraint.frequency === 'custom') {
                      //if the previous also in that custom frequency
                      if (
                        m > 0 &&
                        convertedDates[m - 1] >= startOfConstraint &&
                        convertedDates[m - 1] <= endOfConstriant
                      ) {
                        //check for total relationsip
                        for (
                          let p = 0;
                          p < previousPayload.totalRelation.length;
                          p++
                        ) {
                          let total = previousPayload.totalRelation[p];
                          if (
                            total.actual > currentUsersCurrentConstraint.max ||
                            total.actual < currentUsersCurrentConstraint.min
                          ) {
                            let actualAfterConvertion = total.actual;
                            let minConverted =
                              currentUsersCurrentConstraint.min;
                            let maxConverted =
                              currentUsersCurrentConstraint.max;
                            if (
                              currentUsersCurrentConstraint.units === 'unit'
                            ) {
                              actualAfterConvertion = total.actual / (60 * 15);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 15);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 15);
                            }
                            if (
                              currentUsersCurrentConstraint.units === 'hours'
                            ) {
                              actualAfterConvertion = total.actual / (60 * 60);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 60);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 60);
                            }

                            if (
                              currentUsersCurrentConstraint.units === 'minutes'
                            ) {
                              actualAfterConvertion = total.actual / 60;
                              minConverted =
                                currentUsersCurrentConstraint.min / 60;
                              maxConverted =
                                currentUsersCurrentConstraint.max / 60;
                            }

                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'time',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: minConverted,
                              max: maxConverted,
                              minSeconds: currentUsersCurrentConstraint.min,
                              maxSeconds: currentUsersCurrentConstraint.max,
                              unit: currentUsersCurrentConstraint.units,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {},
                              event: {},
                              actual: actualAfterConvertion,
                            });
                          }
                        }

                        //check individual relations
                        for (
                          let p = 0;
                          p < previousPayload.userPairsRelations.length;
                          p++
                        ) {
                          let userConsequence =
                            previousPayload.userPairsRelations[p];
                          if (
                            userConsequence.actual >
                              currentUsersCurrentConstraint.max ||
                            userConsequence.actual <
                              currentUsersCurrentConstraint.min
                          ) {
                            if (
                              checkIntersection(userIdArray, [
                                userConsequence.userId,
                              ])
                            ) {
                              let actualAfterConvertion =
                                userConsequence.actual;
                              let minConverted =
                                currentUsersCurrentConstraint.min;
                              let maxConverted =
                                currentUsersCurrentConstraint.max;
                              if (
                                currentUsersCurrentConstraint.units === 'unit'
                              ) {
                                actualAfterConvertion =
                                  userConsequence.actual / (60 * 15);
                                minConverted =
                                  currentUsersCurrentConstraint.min / (60 * 15);
                                maxConverted =
                                  currentUsersCurrentConstraint.max / (60 * 15);
                              }
                              if (
                                currentUsersCurrentConstraint.units === 'hours'
                              ) {
                                actualAfterConvertion =
                                  userConsequence.actual / (60 * 60);
                                minConverted =
                                  currentUsersCurrentConstraint.min / (60 * 60);
                                maxConverted =
                                  currentUsersCurrentConstraint.max / (60 * 60);
                              }

                              if (
                                currentUsersCurrentConstraint.units ===
                                'minutes'
                              ) {
                                actualAfterConvertion =
                                  userConsequence.actual / 60;
                                minConverted =
                                  currentUsersCurrentConstraint.min / 60;
                                maxConverted =
                                  currentUsersCurrentConstraint.max / 60;
                              }

                              response.push({
                                id: currentUsersCurrentConstraint.id,
                                constraintType: 'time',
                                description:
                                  currentUsersCurrentConstraint.description,
                                min: minConverted,
                                max: maxConverted,
                                minSeconds: currentUsersCurrentConstraint.min,
                                maxSeconds: currentUsersCurrentConstraint.max,
                                unit: currentUsersCurrentConstraint.units,
                                date: moment(convertedDates[m]).format(
                                  'YYYY-MM-DD',
                                ),
                                antecedentUser: {
                                  id: user.userId,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                },
                                consequenceUser: {
                                  id: userConsequence.userId,
                                  firstName: userConsequence.firstName,
                                  lastName: userConsequence.lastName,
                                },
                                event: {},
                                actual: actualAfterConvertion,
                              });
                            }
                          }
                        }

                        //check session relations
                        for (
                          let p = 0;
                          p < previousPayload.sessionRelations.length;
                          p++
                        ) {
                          let session = previousPayload.sessionRelations[p];
                          if (
                            session.actual >
                              currentUsersCurrentConstraint.max ||
                            session.actual < currentUsersCurrentConstraint.min
                          ) {
                            let actualAfterConvertion = session.actual;
                            let minConverted =
                              currentUsersCurrentConstraint.min;
                            let maxConverted =
                              currentUsersCurrentConstraint.max;
                            if (
                              currentUsersCurrentConstraint.units === 'unit'
                            ) {
                              actualAfterConvertion =
                                session.actual / (60 * 15);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 15);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 15);
                            }
                            if (
                              currentUsersCurrentConstraint.units === 'hours'
                            ) {
                              actualAfterConvertion =
                                session.actual / (60 * 60);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 60);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 60);
                            }

                            if (
                              currentUsersCurrentConstraint.units === 'minutes'
                            ) {
                              actualAfterConvertion = session.actual / 60;
                              minConverted =
                                currentUsersCurrentConstraint.min / 60;
                              maxConverted =
                                currentUsersCurrentConstraint.max / 60;
                            }

                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'time',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: minConverted,
                              max: maxConverted,
                              minSeconds: currentUsersCurrentConstraint.min,
                              maxSeconds: currentUsersCurrentConstraint.max,
                              unit: currentUsersCurrentConstraint.units,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {},
                              event: {
                                eventId: session.eventId,
                                users: session.users,
                              },
                              actual: actualAfterConvertion,
                            });
                          }
                        }
                        continue;
                      }
                      let payload = await getTimeconstraintUserRelation({
                        timeconstraint: currentUsersCurrentConstraint,
                        userId: user.userId,
                        date: convertedDates[m],
                        roleHierarchy: roleHierarchy,
                        consequenceRoleHierarchy: consequenceRoleHierarchy,
                        events: false,
                      });

                      previousPayload = payload;

                      //check for total relationsip
                      for (let p = 0; p < payload.totalRelation.length; p++) {
                        let total = payload.totalRelation[p];
                        if (
                          total.actual > currentUsersCurrentConstraint.max ||
                          total.actual < currentUsersCurrentConstraint.min
                        ) {
                          let actualAfterConvertion = total.actual;
                          let minConverted = currentUsersCurrentConstraint.min;
                          let maxConverted = currentUsersCurrentConstraint.max;
                          if (currentUsersCurrentConstraint.units === 'unit') {
                            actualAfterConvertion = total.actual / (60 * 15);
                            minConverted =
                              currentUsersCurrentConstraint.min / (60 * 15);
                            maxConverted =
                              currentUsersCurrentConstraint.max / (60 * 15);
                          }
                          if (currentUsersCurrentConstraint.units === 'hours') {
                            actualAfterConvertion = total.actual / (60 * 60);
                            minConverted =
                              currentUsersCurrentConstraint.min / (60 * 60);
                            maxConverted =
                              currentUsersCurrentConstraint.max / (60 * 60);
                          }

                          if (
                            currentUsersCurrentConstraint.units === 'minutes'
                          ) {
                            actualAfterConvertion = total.actual / 60;
                            minConverted =
                              currentUsersCurrentConstraint.min / 60;
                            maxConverted =
                              currentUsersCurrentConstraint.max / 60;
                          }

                          response.push({
                            id: currentUsersCurrentConstraint.id,
                            constraintType: 'time',
                            description:
                              currentUsersCurrentConstraint.description,
                            min: minConverted,
                            max: maxConverted,
                            minSeconds: currentUsersCurrentConstraint.min,
                            maxSeconds: currentUsersCurrentConstraint.max,
                            unit: currentUsersCurrentConstraint.units,
                            date: moment(convertedDates[m]).format(
                              'YYYY-MM-DD',
                            ),
                            antecedentUser: {
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                            consequenceUser: {},
                            event: {},
                            actual: actualAfterConvertion,
                          });
                        }
                      }

                      //check individual relations
                      for (
                        let p = 0;
                        p < payload.userPairsRelations.length;
                        p++
                      ) {
                        let userConsequence = payload.userPairsRelations[p];
                        if (
                          userConsequence.actual >
                            currentUsersCurrentConstraint.max ||
                          userConsequence.actual <
                            currentUsersCurrentConstraint.min
                        ) {
                          if (
                            checkIntersection(userIdArray, [
                              userConsequence.userId,
                            ])
                          ) {
                            let actualAfterConvertion = userConsequence.actual;
                            let minConverted =
                              currentUsersCurrentConstraint.min;
                            let maxConverted =
                              currentUsersCurrentConstraint.max;
                            if (
                              currentUsersCurrentConstraint.units === 'unit'
                            ) {
                              actualAfterConvertion =
                                userConsequence.actual / (60 * 15);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 15);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 15);
                            }
                            if (
                              currentUsersCurrentConstraint.units === 'hours'
                            ) {
                              actualAfterConvertion =
                                userConsequence.actual / (60 * 60);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 60);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 60);
                            }

                            if (
                              currentUsersCurrentConstraint.units === 'minutes'
                            ) {
                              actualAfterConvertion =
                                userConsequence.actual / 60;
                              minConverted =
                                currentUsersCurrentConstraint.min / 60;
                              maxConverted =
                                currentUsersCurrentConstraint.max / 60;
                            }
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'time',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: minConverted,
                              max: maxConverted,
                              minSeconds: currentUsersCurrentConstraint.min,
                              maxSeconds: currentUsersCurrentConstraint.max,
                              unit: currentUsersCurrentConstraint.units,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {
                                id: userConsequence.userId,
                                firstName: userConsequence.firstName,
                                lastName: userConsequence.lastName,
                              },
                              event: {},
                              actual: actualAfterConvertion,
                            });
                          }
                        }
                      }

                      //check session relations
                      for (
                        let p = 0;
                        p < payload.sessionRelations.length;
                        p++
                      ) {
                        let session = payload.sessionRelations[p];
                        if (
                          session.actual > currentUsersCurrentConstraint.max ||
                          session.actual < currentUsersCurrentConstraint.min
                        ) {
                          let actualAfterConvertion = session.actual;
                          let minConverted = currentUsersCurrentConstraint.min;
                          let maxConverted = currentUsersCurrentConstraint.max;
                          if (currentUsersCurrentConstraint.units === 'unit') {
                            actualAfterConvertion = session.actual / (60 * 15);
                            minConverted =
                              currentUsersCurrentConstraint.min / (60 * 15);
                            maxConverted =
                              currentUsersCurrentConstraint.max / (60 * 15);
                          }
                          if (currentUsersCurrentConstraint.units === 'hours') {
                            actualAfterConvertion = session.actual / (60 * 60);
                            minConverted =
                              currentUsersCurrentConstraint.min / (60 * 60);
                            maxConverted =
                              currentUsersCurrentConstraint.max / (60 * 60);
                          }

                          if (
                            currentUsersCurrentConstraint.units === 'minutes'
                          ) {
                            actualAfterConvertion = session.actual / 60;
                            minConverted =
                              currentUsersCurrentConstraint.min / 60;
                            maxConverted =
                              currentUsersCurrentConstraint.max / 60;
                          }
                          response.push({
                            id: currentUsersCurrentConstraint.id,
                            constraintType: 'time',
                            description:
                              currentUsersCurrentConstraint.description,
                            min: minConverted,
                            max: maxConverted,
                            minSeconds: currentUsersCurrentConstraint.min,
                            maxSeconds: currentUsersCurrentConstraint.max,
                            unit: currentUsersCurrentConstraint.units,
                            date: moment(convertedDates[m]).format(
                              'YYYY-MM-DD',
                            ),
                            antecedentUser: {
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                            consequenceUser: {},
                            event: {
                              eventId: session.eventId,
                              users: session.users,
                            },
                            actual: actualAfterConvertion,
                          });
                        }
                      }
                      continue;
                    }
                    // if it is weekly and you do not have recalculate current date
                    if (
                      m > 0 &&
                      currentUsersCurrentConstraint.frequency === 'week'
                    ) {
                      let startOfThisDatesWeek = moment(
                        getStartOfWeekOfDate(convertedDates[m]),
                      ).format('YYYY-MM-DD');
                      let startOfPreviousDatesWeek = moment(
                        getStartOfWeekOfDate(convertedDates[m - 1]),
                      ).format('YYYY-MM-DD');

                      if (
                        startOfThisDatesWeek == startOfPreviousDatesWeek &&
                        previousPayload
                      ) {
                        //check for total relationsip
                        for (
                          let p = 0;
                          p < previousPayload.totalRelation.length;
                          p++
                        ) {
                          x;
                          let total = previousPayload.totalRelation[p];
                          if (
                            total.actual > currentUsersCurrentConstraint.max ||
                            total.actual < currentUsersCurrentConstraint.min
                          ) {
                            let actualAfterConvertion = total.actual;
                            let minConverted =
                              currentUsersCurrentConstraint.min;
                            let maxConverted =
                              currentUsersCurrentConstraint.max;
                            if (
                              currentUsersCurrentConstraint.units === 'unit'
                            ) {
                              actualAfterConvertion = total.actual / (60 * 15);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 15);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 15);
                            }
                            if (
                              currentUsersCurrentConstraint.units === 'hours'
                            ) {
                              actualAfterConvertion = total.actual / (60 * 60);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 60);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 60);
                            }

                            if (
                              currentUsersCurrentConstraint.units === 'minutes'
                            ) {
                              actualAfterConvertion = total.actual / 60;
                              minConverted =
                                currentUsersCurrentConstraint.min / 60;
                              maxConverted =
                                currentUsersCurrentConstraint.max / 60;
                            }
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'time',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: minConverted,
                              max: maxConverted,
                              minSeconds: currentUsersCurrentConstraint.min,
                              maxSeconds: currentUsersCurrentConstraint.max,
                              unit: currentUsersCurrentConstraint.units,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {},
                              event: {},
                              actual: actualAfterConvertion,
                            });
                          }
                        }

                        //check individual relations
                        for (
                          let p = 0;
                          p < previousPayload.userPairsRelations.length;
                          p++
                        ) {
                          let userConsequence =
                            previousPayload.userPairsRelations[p];
                          if (
                            userConsequence.actual >
                              currentUsersCurrentConstraint.max ||
                            userConsequence.actual <
                              currentUsersCurrentConstraint.min
                          ) {
                            if (
                              checkIntersection(userIdArray, [
                                userConsequence.userId,
                              ])
                            ) {
                              let actualAfterConvertion =
                                userConsequence.actual;
                              let minConverted =
                                currentUsersCurrentConstraint.min;
                              let maxConverted =
                                currentUsersCurrentConstraint.max;
                              if (
                                currentUsersCurrentConstraint.units === 'unit'
                              ) {
                                actualAfterConvertion =
                                  userConsequence.actual / (60 * 15);
                                minConverted =
                                  currentUsersCurrentConstraint.min / (60 * 15);
                                maxConverted =
                                  currentUsersCurrentConstraint.max / (60 * 15);
                              }
                              if (
                                currentUsersCurrentConstraint.units === 'hours'
                              ) {
                                actualAfterConvertion =
                                  userConsequence.actual / (60 * 60);
                                minConverted =
                                  currentUsersCurrentConstraint.min / (60 * 60);
                                maxConverted =
                                  currentUsersCurrentConstraint.max / (60 * 60);
                              }

                              if (
                                currentUsersCurrentConstraint.units ===
                                'minutes'
                              ) {
                                actualAfterConvertion =
                                  userConsequence.actual / 60;
                                minConverted =
                                  currentUsersCurrentConstraint.min / 60;
                                maxConverted =
                                  currentUsersCurrentConstraint.max / 60;
                              }
                              response.push({
                                id: currentUsersCurrentConstraint.id,
                                constraintType: 'time',
                                description:
                                  currentUsersCurrentConstraint.description,
                                min: minConverted,
                                max: maxConverted,
                                minSeconds: currentUsersCurrentConstraint.min,
                                maxSeconds: currentUsersCurrentConstraint.max,
                                unit: currentUsersCurrentConstraint.units,
                                date: moment(convertedDates[m]).format(
                                  'YYYY-MM-DD',
                                ),
                                antecedentUser: {
                                  id: user.userId,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                },
                                consequenceUser: {
                                  id: userConsequence.userId,
                                  firstName: userConsequence.firstName,
                                  lastName: userConsequence.lastName,
                                },
                                event: {},
                                actual: actualAfterConvertion,
                              });
                            }
                          }
                        }

                        //check session relations
                        for (
                          let p = 0;
                          p < previousPayload.sessionRelations.length;
                          p++
                        ) {
                          let session = previousPayload.sessionRelations[p];
                          if (
                            session.actual >
                              currentUsersCurrentConstraint.max ||
                            session.actual < currentUsersCurrentConstraint.min
                          ) {
                            let actualAfterConvertion = session.actual;
                            let minConverted =
                              currentUsersCurrentConstraint.min;
                            let maxConverted =
                              currentUsersCurrentConstraint.max;
                            if (
                              currentUsersCurrentConstraint.units === 'unit'
                            ) {
                              actualAfterConvertion =
                                session.actual / (60 * 15);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 15);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 15);
                            }
                            if (
                              currentUsersCurrentConstraint.units === 'hours'
                            ) {
                              actualAfterConvertion =
                                session.actual / (60 * 60);
                              minConverted =
                                currentUsersCurrentConstraint.min / (60 * 60);
                              maxConverted =
                                currentUsersCurrentConstraint.max / (60 * 60);
                            }

                            if (
                              currentUsersCurrentConstraint.units === 'minutes'
                            ) {
                              actualAfterConvertion = session.actual / 60;
                              minConverted =
                                currentUsersCurrentConstraint.min / 60;
                              maxConverted =
                                currentUsersCurrentConstraint.max / 60;
                            }
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'time',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: minConverted,
                              max: maxConverted,
                              minSeconds: currentUsersCurrentConstraint.min,
                              maxSeconds: currentUsersCurrentConstraint.max,
                              unit: currentUsersCurrentConstraint.units,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {},
                              event: {
                                eventId: session.eventId,
                                users: session.users,
                              },
                              actual: actualAfterConvertion,
                            });
                          }
                        }
                        continue;
                      }
                    }
                    let payload = await getTimeconstraintUserRelation({
                      timeconstraint: currentUsersCurrentConstraint,
                      userId: user.userId,
                      date: convertedDates[m],
                      roleHierarchy: roleHierarchy,
                      consequenceRoleHierarchy: consequenceRoleHierarchy,
                      events: user.events,
                    });

                    previousPayload = payload;

                    //check for total relationsip
                    for (let p = 0; p < payload.totalRelation.length; p++) {
                      let total = payload.totalRelation[p];
                      if (
                        total.actual > currentUsersCurrentConstraint.max ||
                        total.actual < currentUsersCurrentConstraint.min
                      ) {
                        let actualAfterConvertion = total.actual;
                        let minConverted = currentUsersCurrentConstraint.min;
                        let maxConverted = currentUsersCurrentConstraint.max;
                        if (currentUsersCurrentConstraint.units === 'unit') {
                          actualAfterConvertion = total.actual / (60 * 15);
                          minConverted =
                            currentUsersCurrentConstraint.min / (60 * 15);
                          maxConverted =
                            currentUsersCurrentConstraint.max / (60 * 15);
                        }
                        if (currentUsersCurrentConstraint.units === 'hours') {
                          actualAfterConvertion = total.actual / (60 * 60);
                          minConverted =
                            currentUsersCurrentConstraint.min / (60 * 60);
                          maxConverted =
                            currentUsersCurrentConstraint.max / (60 * 60);
                        }

                        if (currentUsersCurrentConstraint.units === 'minutes') {
                          actualAfterConvertion = total.actual / 60;
                          minConverted = currentUsersCurrentConstraint.min / 60;
                          maxConverted = currentUsersCurrentConstraint.max / 60;
                        }

                        response.push({
                          id: currentUsersCurrentConstraint.id,
                          constraintType: 'time',
                          description:
                            currentUsersCurrentConstraint.description,
                          min: minConverted,
                          max: maxConverted,
                          minSeconds: currentUsersCurrentConstraint.min,
                          maxSeconds: currentUsersCurrentConstraint.max,
                          unit: currentUsersCurrentConstraint.units,
                          date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                          antecedentUser: {
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                          },
                          consequenceUser: {},
                          event: {},
                          actual: actualAfterConvertion,
                        });
                      }
                    }

                    //check individual relations
                    for (
                      let p = 0;
                      p < payload.userPairsRelations.length;
                      p++
                    ) {
                      let userConsequence = payload.userPairsRelations[p];
                      if (
                        userConsequence.actual >
                          currentUsersCurrentConstraint.max ||
                        userConsequence.actual <
                          currentUsersCurrentConstraint.min
                      ) {
                        if (
                          checkIntersection(userIdArray, [
                            userConsequence.userId,
                          ])
                        ) {
                          let actualAfterConvertion = userConsequence.actual;
                          let minConverted = currentUsersCurrentConstraint.min;
                          let maxConverted = currentUsersCurrentConstraint.max;
                          if (currentUsersCurrentConstraint.units === 'unit') {
                            actualAfterConvertion =
                              userConsequence.actual / (60 * 15);
                            minConverted =
                              currentUsersCurrentConstraint.min / (60 * 15);
                            maxConverted =
                              currentUsersCurrentConstraint.max / (60 * 15);
                          }
                          if (currentUsersCurrentConstraint.units === 'hours') {
                            actualAfterConvertion =
                              userConsequence.actual / (60 * 60);
                            minConverted =
                              currentUsersCurrentConstraint.min / (60 * 60);
                            maxConverted =
                              currentUsersCurrentConstraint.max / (60 * 60);
                          }
                          if (
                            currentUsersCurrentConstraint.units === 'minutes'
                          ) {
                            actualAfterConvertion = userConsequence.actual / 60;
                            minConverted =
                              currentUsersCurrentConstraint.min / 60;
                            maxConverted =
                              currentUsersCurrentConstraint.max / 60;
                          }

                          response.push({
                            id: currentUsersCurrentConstraint.id,
                            constraintType: 'time',
                            description:
                              currentUsersCurrentConstraint.description,
                            min: minConverted,
                            max: maxConverted,
                            minSeconds: currentUsersCurrentConstraint.min,
                            maxSeconds: currentUsersCurrentConstraint.max,
                            unit: currentUsersCurrentConstraint.units,
                            date: moment(convertedDates[m]).format(
                              'YYYY-MM-DD',
                            ),
                            antecedentUser: {
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                            consequenceUser: {
                              id: userConsequence.userId,
                              firstName: userConsequence.firstName,
                              lastName: userConsequence.lastName,
                            },
                            event: {},
                            actual: actualAfterConvertion,
                          });
                        }
                      }
                    }

                    //check session relations
                    for (let p = 0; p < payload.sessionRelations.length; p++) {
                      let session = payload.sessionRelations[p];
                      if (
                        session.actual > currentUsersCurrentConstraint.max ||
                        session.actual < currentUsersCurrentConstraint.min
                      ) {
                        let actualAfterConvertion = session.actual;
                        let minConverted = currentUsersCurrentConstraint.min;
                        let maxConverted = currentUsersCurrentConstraint.max;
                        if (currentUsersCurrentConstraint.units === 'unit') {
                          actualAfterConvertion = session.actual / (60 * 15);
                          minConverted =
                            currentUsersCurrentConstraint.min / (60 * 15);
                          maxConverted =
                            currentUsersCurrentConstraint.max / (60 * 15);
                        }
                        if (currentUsersCurrentConstraint.units === 'hours') {
                          actualAfterConvertion = session.actual / (60 * 60);
                          minConverted =
                            currentUsersCurrentConstraint.min / (60 * 60);
                          maxConverted =
                            currentUsersCurrentConstraint.max / (60 * 60);
                        }
                        if (currentUsersCurrentConstraint.units === 'minutes') {
                          actualAfterConvertion = session.actual / 60;
                          minConverted = currentUsersCurrentConstraint.min / 60;
                          maxConverted = currentUsersCurrentConstraint.max / 60;
                        }
                        response.push({
                          id: currentUsersCurrentConstraint.id,
                          constraintType: 'time',
                          description:
                            currentUsersCurrentConstraint.description,
                          min: minConverted,
                          max: maxConverted,
                          minSeconds: currentUsersCurrentConstraint.min,
                          maxSeconds: currentUsersCurrentConstraint.max,
                          unit: currentUsersCurrentConstraint.units,
                          date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                          antecedentUser: {
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                          },
                          consequenceUser: {},
                          event: {
                            eventId: session.eventId,
                            users: session.users,
                          },
                          actual: actualAfterConvertion,
                        });
                      }
                    }
                  }
                }
              }
            }

            // TODO: This is temporarily commented for checking of the performance
            // issue is related to this authorization constraint
            // if (
            //   currentUsersCurrentConstraint.constraintType === 'authorization'
            // ) {
            //   let startOfConstraint = moment
            //     .utc(currentUsersCurrentConstraint.start)
            //     .toDate();
            //   let endOfConstriant = moment
            //     .utc(currentUsersCurrentConstraint.end)
            //     .toDate();
            //   //check if the constraint contains this event
            //   let consequenceRoleHierarchy = [];
            //   Object.entries(roleHierarchy).map((t) => {
            //     const [key, value] = t;
            //     //push the decendents
            //     if (
            //       currentUsersCurrentConstraint.consequenceRole &&
            //       checkIntersection(
            //         [currentUsersCurrentConstraint.consequenceRole.name],
            //         value,
            //       )
            //     ) {
            //       consequenceRoleHierarchy.push(key);
            //     }
            //   });
            //   if (
            //     currentUsersCurrentConstraint.antecedentTypeActivityId !==
            //     event.activity0.id
            //   ) {
            //     continue;
            //   }

            //   let previousPayload = false;
            //   for (let m = 0; m < convertedDates.length; m++) {
            //     if (
            //       convertedDates[m] >= startOfConstraint &&
            //       convertedDates[m] <= endOfConstriant
            //     ) {
            //       // if it is rollovered
            //       if (currentUsersCurrentConstraint.rollover) {
            //         //if the previous also in that custom frequency
            //         if (
            //           m > 0 &&
            //           convertedDates[m - 1] >= startOfConstraint &&
            //           convertedDates[m - 1] <= endOfConstriant &&
            //           previousPayload
            //         ) {
            //           response.push({
            //             id: previousPayload.id,
            //             constraintType: previousPayload.constraintType,
            //             description: previousPayload.description,
            //             min: previousPayload.min,
            //             max: previousPayload.max,
            //             minSeconds: previousPayload.minSeconds,
            //             maxSeconds: previousPayload.maxSeconds,
            //             unit: previousPayload.units,
            //             rollover: previousPayload.rollover,
            //             date: moment(convertedDates[m]).format('YYYY-MM-DD'),
            //             antecedentUser: {
            //               id: user.userId,
            //               firstName: user.firstName,
            //               lastName: user.lastName,
            //             },
            //             consequenceUser: {},
            //             event: {},
            //             activity: previousPayload.activity,
            //             actual: previousPayload.actual,
            //           });
            //           continue;
            //         }

            //         let payload = await getAuthConstraintUserRelation({
            //           authconstraint: currentUsersCurrentConstraint,
            //           userId: user.userId,
            //           date: convertedDates[m],
            //           roleHierarchy: roleHierarchy,
            //           consequenceRoleHierarchy: consequenceRoleHierarchy,
            //           events: false,
            //         });

            //         if (
            //           payload.userPairsRelations.actual <
            //           currentUsersCurrentConstraint.max
            //         ) {
            //           continue;
            //         }

            //         let constraintInfo = {
            //           id: currentUsersCurrentConstraint.id,
            //           constraintType:
            //             currentUsersCurrentConstraint.constraintType,
            //           description: currentUsersCurrentConstraint.description,
            //           min: currentUsersCurrentConstraint.min,
            //           max: currentUsersCurrentConstraint.max,
            //           minSeconds: currentUsersCurrentConstraint.min,
            //           maxSeconds: currentUsersCurrentConstraint.max,
            //           unit: currentUsersCurrentConstraint.units,
            //           rollover: currentUsersCurrentConstraint.rollover,
            //           date: moment(convertedDates[m]).format('YYYY-MM-DD'),
            //           consequenceUser: {},
            //           event: {},
            //           actual: payload.userPairsRelations.actual,
            //           antecedentUser: {
            //             id: user.userId,
            //             firstName: user.firstName,
            //             lastName: user.lastName,
            //           },
            //           activity: {
            //             id: payload.userPairsRelations.activity.id,
            //             firstName:
            //               payload.userPairsRelations.activity.firstName,
            //           },
            //         };

            //         if (currentUsersCurrentConstraint.units === 'unit') {
            //           constraintInfo.actual = Number(
            //             (constraintInfo.actual / (60 * 15)).toFixed(2),
            //           );
            //           constraintInfo.min = Number(
            //             (constraintInfo.min / (60 * 15)).toFixed(2),
            //           );
            //           constraintInfo.max = Number(
            //             (constraintInfo.max / (60 * 15)).toFixed(2),
            //           );
            //         }
            //         if (currentUsersCurrentConstraint.units === 'hours') {
            //           constraintInfo.actual = Number(
            //             (constraintInfo.actual / (60 * 60)).toFixed(2),
            //           );
            //           constraintInfo.min = Number(
            //             (constraintInfo.min / (60 * 60)).toFixed(2),
            //           );
            //           constraintInfo.max = Number(
            //             (constraintInfo.max / (60 * 60)).toFixed(2),
            //           );
            //         }

            //         if (currentUsersCurrentConstraint.units === 'minutes') {
            //           constraintInfo.actual = Number(
            //             (constraintInfo.actual / 60).toFixed(2),
            //           );
            //           constraintInfo.min = Number(
            //             (constraintInfo.min / 60).toFixed(2),
            //           );
            //           constraintInfo.max = Number(
            //             (constraintInfo.max / 60).toFixed(2),
            //           );
            //         }

            //         previousPayload = constraintInfo;
            //         response.push(constraintInfo);
            //         continue;
            //       } else {
            //         // if it is weekly and you do not have recalculate current date
            //         if (m > 0) {
            //           let startOfThisDatesWeek = moment(
            //             getStartOfWeekOfDate(convertedDates[m]),
            //           ).format('YYYY-MM-DD');
            //           let startOfPreviousDatesWeek = moment(
            //             getStartOfWeekOfDate(convertedDates[m - 1]),
            //           ).format('YYYY-MM-DD');

            //           if (
            //             startOfThisDatesWeek == startOfPreviousDatesWeek &&
            //             previousPayload
            //           ) {
            //             response.push({
            //               id: previousPayload.id,
            //               constraintType: previousPayload.constraintType,
            //               description: previousPayload.description,
            //               min: previousPayload.min,
            //               max: previousPayload.max,
            //               minSeconds: previousPayload.minSeconds,
            //               maxSeconds: previousPayload.maxSeconds,
            //               unit: previousPayload.units,
            //               rollover: previousPayload.rollover,
            //               date: moment(convertedDates[m]).format('YYYY-MM-DD'),
            //               antecedentUser: {
            //                 id: user.userId,
            //                 firstName: user.firstName,
            //                 lastName: user.lastName,
            //               },
            //               consequenceUser: {},
            //               event: {},
            //               activity: previousPayload.activity,
            //               actual: previousPayload.actual,
            //             });
            //             continue;
            //           }
            //         }
            //       }
            //       let payload = await getAuthConstraintUserRelation({
            //         authconstraint: currentUsersCurrentConstraint,
            //         userId: user.userId,
            //         date: convertedDates[m],
            //         roleHierarchy: roleHierarchy,
            //         consequenceRoleHierarchy: consequenceRoleHierarchy,
            //         events: user.events,
            //       });

            //       if (
            //         payload.userPairsRelations.actual <
            //         currentUsersCurrentConstraint.min
            //       ) {
            //         continue;
            //       }

            //       let constraintInfo = {
            //         id: currentUsersCurrentConstraint.id,
            //         constraintType:
            //           currentUsersCurrentConstraint.constraintType,
            //         description: currentUsersCurrentConstraint.description,
            //         min: currentUsersCurrentConstraint.min,
            //         max: currentUsersCurrentConstraint.max,
            //         minSeconds: currentUsersCurrentConstraint.min,
            //         maxSeconds: currentUsersCurrentConstraint.max,
            //         unit: currentUsersCurrentConstraint.units,
            //         rollover: currentUsersCurrentConstraint.rollover,
            //         date: moment(convertedDates[m]).format('YYYY-MM-DD'),
            //         antecedentUser: {
            //           id: user.userId,
            //           firstName: user.firstName,
            //           lastName: user.lastName,
            //         },
            //         consequenceUser: {},
            //         event: {},
            //         actual: payload.userPairsRelations.actual,
            //         activity: {
            //           id: payload.userPairsRelations.activity.id,
            //           firstName: payload.userPairsRelations.activity.firstName,
            //         },
            //       };

            //       if (currentUsersCurrentConstraint.units === 'unit') {
            //         constraintInfo.actual = Number(
            //           (constraintInfo.actual / (60 * 15)).toFixed(2),
            //         );
            //         constraintInfo.min = Number(
            //           (constraintInfo.min / (60 * 15)).toFixed(2),
            //         );
            //         constraintInfo.max = Number(
            //           (constraintInfo.max / (60 * 15)).toFixed(2),
            //         );
            //       }
            //       if (currentUsersCurrentConstraint.units === 'hours') {
            //         constraintInfo.actual = Number(
            //           (constraintInfo.actual / (60 * 60)).toFixed(2),
            //         );
            //         constraintInfo.min = Number(
            //           (constraintInfo.min / (60 * 60)).toFixed(2),
            //         );
            //         constraintInfo.max = Number(
            //           (constraintInfo.max / (60 * 60)).toFixed(2),
            //         );
            //       }

            //       if (currentUsersCurrentConstraint.units === 'minutes') {
            //         constraintInfo.actual = Number(
            //           (constraintInfo.actual / 60).toFixed(2),
            //         );
            //         constraintInfo.min = Number(
            //           (constraintInfo.min / 60).toFixed(2),
            //         );
            //         constraintInfo.max = Number(
            //           (constraintInfo.max / 60).toFixed(2),
            //         );
            //       }

            //       previousPayload = constraintInfo;
            //       response.push(constraintInfo);
            //     }
            //   }
            // }

            if (
              currentUsersCurrentConstraint.constraintType === 'supervisionrate'
            ) {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              if (
                currentUsersCurrentConstraint.antecedentTypeActivityId !==
                event.activity0.id
              ) {
                continue;
              }

              let previousPayload = false;
              for (let m = 0; m < convertedDates.length; m++) {
                if (
                  convertedDates[m] >= startOfConstraint &&
                  convertedDates[m] <= endOfConstriant
                ) {
                  // if it is monthly
                  if (currentUsersCurrentConstraint.frequency === 'month') {
                    // if it is weekly and you do not have recalculate current date
                    if (m > 0) {
                      let startOfThisDatesMonth = moment(convertedDates[m])
                        .startOf('month')
                        .format('YYYY-MM-DD');
                      let startOfPreviousDatesMonth = moment(
                        convertedDates[m - 1],
                      )
                        .startOf('month')
                        .format('YYYY-MM-DD');

                      if (
                        startOfThisDatesMonth == startOfPreviousDatesMonth &&
                        previousPayload
                      ) {
                        if (
                          previousPayload.supervisionRate <=
                            currentUsersCurrentConstraint.max &&
                          previousPayload.supervisionRate >=
                            currentUsersCurrentConstraint.min
                        ) {
                          continue;
                        }
                        // TODO supervisionrate
                        // response.push({
                        //   id: currentUsersCurrentConstraint.id,
                        //   constraintType: "supervisionrate",
                        //   description:
                        //     currentUsersCurrentConstraint.description,
                        //   min: currentUsersCurrentConstraint.min,
                        //   max: currentUsersCurrentConstraint.max,
                        //   minSeconds: currentUsersCurrentConstraint.min,
                        //   maxSeconds: currentUsersCurrentConstraint.max,
                        //   unit: currentUsersCurrentConstraint.units,
                        //   date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        //   frequency: currentUsersCurrentConstraint.frequency,
                        //   antecedentUser: {
                        //     id: user.userId,
                        //     firstName: user.firstName,
                        //     lastName: user.lastName,
                        //   },
                        //   consequenceUser: {},
                        //   actual: previousPayload.supervisionRate,
                        //   activity: {
                        //     id: event.activity0.id,
                        //     firstName: event.activity0.firstName,
                        //   },
                        // });
                        continue;
                      }
                    }

                    let payload =
                      await getSupervisionRateconstraintUserRelation({
                        supervisionrateconstraint:
                          currentUsersCurrentConstraint,
                        userId: user.userId,
                        date: convertedDates[m],
                        roleHierarchy: roleHierarchy,
                        consequenceRoleHierarchy: consequenceRoleHierarchy,
                        events: false,
                      });
                    previousPayload = payload;

                    if (
                      payload.supervisionRate <=
                        currentUsersCurrentConstraint.max &&
                      payload.supervisionRate >=
                        currentUsersCurrentConstraint.min
                    ) {
                      continue;
                    }

                    let constraintInfo = {
                      id: currentUsersCurrentConstraint.id,
                      constraintType: 'supervisionrate',
                      description: currentUsersCurrentConstraint.description,
                      min: currentUsersCurrentConstraint.min,
                      max: currentUsersCurrentConstraint.max,
                      minSeconds: currentUsersCurrentConstraint.min,
                      maxSeconds: currentUsersCurrentConstraint.max,
                      unit: currentUsersCurrentConstraint.units,
                      date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                      frequency: currentUsersCurrentConstraint.frequency,
                      antecedentUser: {
                        id: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                      },
                      consequenceUser: {},
                      actual: payload.supervisionRate,
                      activity: {
                        id: event.activity0.id,
                        firstName: event.activity0.firstName,
                      },
                    };

                    // TODO supervisionrate
                    // response.push(constraintInfo);
                  }

                  // if it is weekly
                  if (currentUsersCurrentConstraint.frequency === 'week') {
                    // if it is weekly and you do not have recalculate current date
                    if (m > 0) {
                      let startOfThisDatesWeek = moment(convertedDates[m])
                        .startOf('week')
                        .format('YYYY-MM-DD');
                      let startOfPreviousDatesWeek = moment(
                        convertedDates[m - 1],
                      )
                        .startOf('week')
                        .format('YYYY-MM-DD');

                      if (
                        startOfThisDatesWeek == startOfPreviousDatesWeek &&
                        previousPayload
                      ) {
                        if (
                          previousPayload.supervisionRate <=
                            currentUsersCurrentConstraint.max &&
                          previousPayload.supervisionRate >=
                            currentUsersCurrentConstraint.min
                        ) {
                          continue;
                        }
                        // response.push({
                        //   id: currentUsersCurrentConstraint.id,
                        //   constraintType: "supervisionrate",
                        //   description:
                        //     currentUsersCurrentConstraint.description,
                        //   min: currentUsersCurrentConstraint.min,
                        //   max: currentUsersCurrentConstraint.max,
                        //   minSeconds: currentUsersCurrentConstraint.min,
                        //   maxSeconds: currentUsersCurrentConstraint.max,
                        //   unit: currentUsersCurrentConstraint.units,
                        //   date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        //   frequency: currentUsersCurrentConstraint.frequency,
                        //   antecedentUser: {
                        //     id: user.userId,
                        //     firstName: user.firstName,
                        //     lastName: user.lastName,
                        //   },
                        //   consequenceUser: {},
                        //   actual: previousPayload.supervisionRate,
                        //   activity: {
                        //     id: event.activity0.id,
                        //     firstName: event.activity0.firstName,
                        //   },
                        // });
                        continue;
                      }
                    }

                    let payload =
                      await getSupervisionRateconstraintUserRelation({
                        supervisionrateconstraint:
                          currentUsersCurrentConstraint,
                        userId: user.userId,
                        date: convertedDates[m],
                        roleHierarchy: roleHierarchy,
                        consequenceRoleHierarchy: consequenceRoleHierarchy,
                        events: user.events,
                      });

                    previousPayload = payload;

                    if (
                      payload.supervisionRate <=
                        currentUsersCurrentConstraint.max &&
                      payload.supervisionRate >=
                        currentUsersCurrentConstraint.min
                    ) {
                      continue;
                    }

                    let constraintInfo = {
                      id: currentUsersCurrentConstraint.id,
                      constraintType: 'supervisionrate',
                      description: currentUsersCurrentConstraint.description,
                      min: currentUsersCurrentConstraint.min,
                      max: currentUsersCurrentConstraint.max,
                      minSeconds: currentUsersCurrentConstraint.min,
                      maxSeconds: currentUsersCurrentConstraint.max,
                      unit: currentUsersCurrentConstraint.units,
                      date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                      frequency: currentUsersCurrentConstraint.frequency,
                      antecedentUser: {
                        id: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                      },
                      consequenceUser: {},
                      actual: payload.supervisionRate,
                      activity: {
                        id: event.activity0.id,
                        firstName: event.activity0.firstName,
                      },
                    };

                    // response.push(constraintInfo);
                  }
                }
              }
            }

            if (
              currentUsersCurrentConstraint.constraintType === 'sessionlength'
            ) {
              console.log('sifter2');
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  console.log('sifter4');
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    console.log('sifter5');
                    continue;
                  }
                }
                //check the role
                console.log('sifter6');
                if (consequenceRoleHierarchy.length > 0) {
                  console.log('sifter7');
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    console.log('sifter8');
                    continue;
                  }
                }
                console.log('sifter3');

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              if (isItContainingTheEvent) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    let result = await getSessionLengthconstraintUserRelation({
                      sessionlengthconstraint: currentUsersCurrentConstraint,
                      userId: user.userId,
                      date: convertedDates[m],
                      roleHierarchy: roleHierarchy,
                      events: user.events,
                    });

                    //session checking
                    for (let j = 0; j < result.sessionRelations.length; j++) {
                      if (result.sessionRelations[j].eventId !== event.id) {
                        continue;
                      }
                      if (
                        result.sessionRelations[j].actual >
                          currentUsersCurrentConstraint.max ||
                        (result.sessionRelations[j].actual != 0 &&
                          result.sessionRelations[j].actual <
                            currentUsersCurrentConstraint.min)
                      ) {
                        let constraintInfo = {
                          id: currentUsersCurrentConstraint.id,
                          constraintType: 'sessionlength',
                          description:
                            currentUsersCurrentConstraint.description,
                          min: currentUsersCurrentConstraint.min,
                          max: currentUsersCurrentConstraint.max,
                          minSeconds: currentUsersCurrentConstraint.min,
                          maxSeconds: currentUsersCurrentConstraint.max,
                          unit: currentUsersCurrentConstraint.units,
                          date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                          antecedentUser: {
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                          },
                          consequenceUser: {},
                          event: {},
                        };

                        let actualAfterConvertion =
                          result.sessionRelations[j].actual;
                        if (currentUsersCurrentConstraint.units === 'unit') {
                          actualAfterConvertion = Number(
                            (
                              result.sessionRelations[j].actual /
                              (60 * 15)
                            ).toFixed(2),
                          );
                        }
                        if (currentUsersCurrentConstraint.units === 'hours') {
                          actualAfterConvertion = Number(
                            (
                              result.sessionRelations[j].actual /
                              (60 * 60)
                            ).toFixed(2),
                          );
                        }

                        if (currentUsersCurrentConstraint.units === 'minutes') {
                          Number(
                            (actualAfterConvertion =
                              result.sessionRelations[j].actual / 60).toFixed(
                              2,
                            ),
                          );
                        }

                        (constraintInfo.event.id =
                          result.sessionRelations[j].eventId),
                          (constraintInfo.event.users =
                            result.sessionRelations[j].users),
                          (constraintInfo.event.actual = actualAfterConvertion);
                        if (currentUsersCurrentConstraint.units === 'unit') {
                          Number(
                            (constraintInfo.min =
                              constraintInfo.min / (15 * 60)).toFixed(2),
                          );
                          Number(
                            (constraresult.max =
                              constraintInfo.max / (15 * 60)).toFixed(2),
                          );
                        }
                        if (currentUsersCurrentConstraint.units === 'hours') {
                          Number(
                            (constraintInfo.min =
                              constraintInfo.min / (60 * 60)).toFixed(2),
                          );
                          Number(
                            (constraintInfo.max =
                              constraintInfo.max / (60 * 60)).toFixed(2),
                          );
                        }

                        if (currentUsersCurrentConstraint.units === 'minutes') {
                          Number(
                            (constraintInfo.min =
                              constraintInfo.min / 60).toFixed(2),
                          );
                          Number(
                            (constraintInfo.max =
                              constraintInfo.max / 60).toFixed(2),
                          );
                        }
                        response.push(constraintInfo);
                      }
                    }
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'matching') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingAnyConsequenceUser = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingAnyConsequenceUser = true;
                break;
              }
              if (!isItContainingAnyConsequenceUser) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    // fill broken constriants
                    response.push({
                      id: currentUsersCurrentConstraint.id,
                      constraintType: 'matching',
                      description: currentUsersCurrentConstraint.description,
                      date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                      antecedentUser: {
                        id: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                      },
                      consequenceUser: {},
                      event: {
                        id: event.id,
                      },
                      actual: 0,
                    });
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'unmatching') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingAnyConsequenceUser = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              let breakingUsers = new Array();
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }

                breakingUsers.push({
                  id: currentUser.id,
                  firstName: currentUser.firstName,
                  lastName: currentUser.lastName,
                });

                isItContainingAnyConsequenceUser = true;
              }
              if (isItContainingAnyConsequenceUser) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    // fill broken constriants
                    response.push({
                      id: currentUsersCurrentConstraint.id,
                      constraintType: 'unmatching',
                      description: currentUsersCurrentConstraint.description,
                      date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                      antecedentUser: {
                        id: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                      },
                      consequenceUser: {},
                      event: {
                        id: event.id,
                        breakingUsers: breakingUsers,
                      },
                      actual: 0,
                    });
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'usertouser') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              let consequenceUserArray = new Array();
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });

              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                consequenceUserArray.push({
                  id: currentUser.id,
                  firstName: currentUser.firstName,
                  lastName: currentUser.lastName,
                });
              }
              if (isItContainingTheEvent) {
                let previousPayload = false;
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    if (currentUsersCurrentConstraint.frequency !== 'session') {
                      // if it is custom frequency constraint
                      if (
                        currentUsersCurrentConstraint.frequency === 'custom'
                      ) {
                        //if the previous also in that custom frequency
                        if (
                          m > 0 &&
                          convertedDates[m - 1] >= startOfConstraint &&
                          convertedDates[m - 1] <= endOfConstriant
                        ) {
                          //check for weekly or daily frequency constraints
                          if (
                            previousPayload.actualWorkedUserNumber >
                              currentUsersCurrentConstraint.max ||
                            previousPayload.actualWorkedUserNumber <
                              currentUsersCurrentConstraint.min
                          ) {
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'usertouser',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: currentUsersCurrentConstraint.min,
                              max: currentUsersCurrentConstraint.max,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              event: {},
                              consequenceUser: {},
                              usersWorkedWith: previousPayload.usersWorkedWith,
                              actual: previousPayload.actualWorkedUserNumber,
                            });
                          }
                          continue;
                        }
                        let payload =
                          await getUserToUserFrequencyConstraintRelation({
                            userToUserFrequencyConstraint:
                              currentUsersCurrentConstraint,
                            userId: user.userId,
                            date: convertedDates[m],
                            roleHierarchy: roleHierarchy,
                            consequenceRoleHierarchy: consequenceRoleHierarchy,
                            events: false,
                          });
                        previousPayload = payload;

                        if (
                          payload.actualWorkedUserNumber >
                            currentUsersCurrentConstraint.max ||
                          payload.actualWorkedUserNumber <
                            currentUsersCurrentConstraint.min
                        ) {
                          response.push({
                            id: currentUsersCurrentConstraint.id,
                            constraintType: 'usertouser',
                            description:
                              currentUsersCurrentConstraint.description,
                            min: currentUsersCurrentConstraint.min,
                            max: currentUsersCurrentConstraint.max,
                            date: moment(convertedDates[m]).format(
                              'YYYY-MM-DD',
                            ),
                            antecedentUser: {
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                            event: {},
                            consequenceUser: {},
                            usersWorkedWith: payload.usersWorkedWith,
                            actual: payload.actualWorkedUserNumber,
                          });
                        }
                        continue;
                      }
                      // if it is weekly and you do not have recalculate current date
                      if (
                        m > 0 &&
                        currentUsersCurrentConstraint.frequency === 'week'
                      ) {
                        let startOfThisDatesWeek = moment(
                          getStartOfWeekOfDate(convertedDates[m]),
                        ).format('YYYY-MM-DD');
                        let startOfPreviousDatesWeek = moment(
                          getStartOfWeekOfDate(convertedDates[m - 1]),
                        ).format('YYYY-MM-DD');

                        if (
                          startOfThisDatesWeek == startOfPreviousDatesWeek &&
                          previousPayload
                        ) {
                          if (
                            previousPayload.actualWorkedUserNumber >
                              currentUsersCurrentConstraint.max ||
                            previousPayload.actualWorkedUserNumber <
                              currentUsersCurrentConstraint.min
                          ) {
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'usertouser',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: currentUsersCurrentConstraint.min,
                              max: currentUsersCurrentConstraint.max,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              event: {},
                              consequenceUser: {},
                              usersWorkedWith: previousPayload.usersWorkedWith,
                              actual: previousPayload.actualWorkedUserNumber,
                            });
                          }
                          continue;
                        }
                      }
                      let payload =
                        await getUserToUserFrequencyConstraintRelation({
                          userToUserFrequencyConstraint:
                            currentUsersCurrentConstraint,
                          userId: user.userId,
                          date: convertedDates[m],
                          roleHierarchy: roleHierarchy,
                          consequenceRoleHierarchy: consequenceRoleHierarchy,
                          events: user.events,
                        });

                      previousPayload = payload;

                      //check for weekly or daily frequency constraints
                      if (
                        payload.actualWorkedUserNumber >
                          currentUsersCurrentConstraint.max ||
                        payload.actualWorkedUserNumber <
                          currentUsersCurrentConstraint.min
                      ) {
                        response.push({
                          id: currentUsersCurrentConstraint.id,
                          constraintType: 'usertouser',
                          description:
                            currentUsersCurrentConstraint.description,
                          min: currentUsersCurrentConstraint.min,
                          max: currentUsersCurrentConstraint.max,
                          date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                          antecedentUser: {
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                          },
                          event: {},
                          consequenceUser: {},
                          usersWorkedWith: payload.usersWorkedWith,
                          actual: payload.actualWorkedUserNumber,
                        });
                      }
                    } else {
                      //check for session frequency constraints
                      if (
                        consequenceUserArray.length >
                          currentUsersCurrentConstraint.max ||
                        consequenceUserArray.length <
                          currentUsersCurrentConstraint.min
                      ) {
                        response.push({
                          id: currentUsersCurrentConstraint.id,
                          constraintType: 'usertouser',
                          description:
                            currentUsersCurrentConstraint.description,
                          min: currentUsersCurrentConstraint.min,
                          max: currentUsersCurrentConstraint.max,
                          date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                          antecedentUser: {
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                          },
                          event: {
                            id: event.id,
                            usersWorkedWith: consequenceUserArray,
                          },
                          consequenceUser: {},
                          usersWorkedWith: {},
                          actual: consequenceUserArray.length,
                        });
                      }
                    }
                  }
                }
              }
            }

            if (
              currentUsersCurrentConstraint.constraintType === 'usertosession'
            ) {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              if (isItContainingTheEvent) {
                let previousPayload = false;
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    // if it is custom frequency constraint
                    if (currentUsersCurrentConstraint.frequency === 'custom') {
                      //if the previous also in that custom frequency
                      if (
                        m > 0 &&
                        convertedDates[m - 1] >= startOfConstraint &&
                        convertedDates[m - 1] <= endOfConstriant
                      ) {
                        //check for total relationsip
                        for (
                          let p = 0;
                          p < previousPayload.totalRelation.length;
                          p++
                        ) {
                          let total = previousPayload.totalRelation[p];
                          if (
                            total.actual > currentUsersCurrentConstraint.max ||
                            total.actual < currentUsersCurrentConstraint.min
                          ) {
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'usertosession',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: currentUsersCurrentConstraint.min,
                              max: currentUsersCurrentConstraint.max,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {},
                              event: {},
                              actual: total.actual,
                            });
                          }
                        }

                        //check individual relations
                        for (
                          let p = 0;
                          p < previousPayload.userPairsRelations.length;
                          p++
                        ) {
                          let userConsequence =
                            previousPayload.userPairsRelations[p];
                          if (
                            userConsequence.actual >
                              currentUsersCurrentConstraint.max ||
                            userConsequence.actual <
                              currentUsersCurrentConstraint.min
                          ) {
                            if (
                              checkIntersection(userIdArray, [
                                userConsequence.userId,
                              ])
                            ) {
                              response.push({
                                id: currentUsersCurrentConstraint.id,
                                constraintType: 'usertosession',
                                description:
                                  currentUsersCurrentConstraint.description,
                                min: currentUsersCurrentConstraint.min,
                                max: currentUsersCurrentConstraint.max,
                                date: moment(convertedDates[m]).format(
                                  'YYYY-MM-DD',
                                ),
                                antecedentUser: {
                                  id: user.userId,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                },
                                consequenceUser: {
                                  id: userConsequence.userId,
                                  firstName: userConsequence.firstName,
                                  lastName: userConsequence.lastName,
                                },
                                event: {},
                                actual: userConsequence.actual,
                              });
                            }
                          }
                        }
                        continue;
                      }

                      let payload =
                        await getUserToSessionFrequencyConstraintRelation({
                          userToSessionFrequencyConstraint:
                            currentUsersCurrentConstraint,
                          userId: user.userId,
                          date: convertedDates[m],
                          roleHierarchy: roleHierarchy,
                          consequenceRoleHierarchy: consequenceRoleHierarchy,
                          events: false,
                        });
                      previousPayload = payload;

                      //check for total relationsip
                      for (let p = 0; p < payload.totalRelation.length; p++) {
                        let total = payload.totalRelation[p];
                        if (
                          total.actual > currentUsersCurrentConstraint.max ||
                          total.actual < currentUsersCurrentConstraint.min
                        ) {
                          response.push({
                            id: currentUsersCurrentConstraint.id,
                            constraintType: 'usertosession',
                            description:
                              currentUsersCurrentConstraint.description,
                            min: currentUsersCurrentConstraint.min,
                            max: currentUsersCurrentConstraint.max,
                            date: moment(convertedDates[m]).format(
                              'YYYY-MM-DD',
                            ),
                            antecedentUser: {
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                            consequenceUser: {},
                            event: {},
                            actual: total.actual,
                          });
                        }
                      }

                      //check individual relations
                      for (
                        let p = 0;
                        p < payload.userPairsRelations.length;
                        p++
                      ) {
                        let userConsequence = payload.userPairsRelations[p];
                        if (
                          userConsequence.actual >
                            currentUsersCurrentConstraint.max ||
                          userConsequence.actual <
                            currentUsersCurrentConstraint.min
                        ) {
                          if (
                            checkIntersection(userIdArray, [
                              userConsequence.userId,
                            ])
                          ) {
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'usertosession',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: currentUsersCurrentConstraint.min,
                              max: currentUsersCurrentConstraint.max,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {
                                id: userConsequence.userId,
                                firstName: userConsequence.firstName,
                                lastName: userConsequence.lastName,
                              },
                              event: {},
                              actual: userConsequence.actual,
                            });
                          }
                        }
                      }
                      continue;
                    }
                    // if it is weekly and you do not have recalculate current date
                    if (
                      m > 0 &&
                      currentUsersCurrentConstraint.frequency === 'week'
                    ) {
                      let startOfThisDatesWeek = moment(
                        getStartOfWeekOfDate(convertedDates[m]),
                      ).format('YYYY-MM-DD');
                      let startOfPreviousDatesWeek = moment(
                        getStartOfWeekOfDate(convertedDates[m - 1]),
                      ).format('YYYY-MM-DD');

                      if (
                        startOfThisDatesWeek == startOfPreviousDatesWeek &&
                        previousPayload
                      ) {
                        //check for total relationsip
                        for (
                          let p = 0;
                          p < previousPayload.totalRelation.length;
                          p++
                        ) {
                          let total = previousPayload.totalRelation[p];
                          if (
                            total.actual > currentUsersCurrentConstraint.max ||
                            total.actual < currentUsersCurrentConstraint.min
                          ) {
                            response.push({
                              id: currentUsersCurrentConstraint.id,
                              constraintType: 'usertosession',
                              description:
                                currentUsersCurrentConstraint.description,
                              min: currentUsersCurrentConstraint.min,
                              max: currentUsersCurrentConstraint.max,
                              date: moment(convertedDates[m]).format(
                                'YYYY-MM-DD',
                              ),
                              antecedentUser: {
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                              },
                              consequenceUser: {},
                              event: {},
                              actual: total.actual,
                            });
                          }
                        }

                        //check individual relations
                        for (
                          let p = 0;
                          p < previousPayload.userPairsRelations.length;
                          p++
                        ) {
                          let userConsequence =
                            previousPayload.userPairsRelations[p];
                          if (
                            userConsequence.actual >
                              currentUsersCurrentConstraint.max ||
                            userConsequence.actual <
                              currentUsersCurrentConstraint.min
                          ) {
                            if (
                              checkIntersection(userIdArray, [
                                userConsequence.userId,
                              ])
                            ) {
                              response.push({
                                id: currentUsersCurrentConstraint.id,
                                constraintType: 'usertosession',
                                description:
                                  currentUsersCurrentConstraint.description,
                                min: currentUsersCurrentConstraint.min,
                                max: currentUsersCurrentConstraint.max,
                                date: moment(convertedDates[m]).format(
                                  'YYYY-MM-DD',
                                ),
                                antecedentUser: {
                                  id: user.userId,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                },
                                consequenceUser: {
                                  id: userConsequence.userId,
                                  firstName: userConsequence.firstName,
                                  lastName: userConsequence.lastName,
                                },
                                event: {},
                                actual: userConsequence.actual,
                              });
                            }
                          }
                        }
                        continue;
                      }
                    }
                    let payload =
                      await getUserToSessionFrequencyConstraintRelation({
                        userToSessionFrequencyConstraint:
                          currentUsersCurrentConstraint,
                        userId: user.userId,
                        date: convertedDates[m],
                        roleHierarchy: roleHierarchy,
                        consequenceRoleHierarchy: consequenceRoleHierarchy,
                        events: user.events,
                      });
                    previousPayload = payload;

                    //check for total relationsip
                    for (let p = 0; p < payload.totalRelation.length; p++) {
                      let total = payload.totalRelation[p];
                      if (
                        total.actual > currentUsersCurrentConstraint.max ||
                        total.actual < currentUsersCurrentConstraint.min
                      ) {
                        response.push({
                          id: currentUsersCurrentConstraint.id,
                          constraintType: 'usertosession',
                          description:
                            currentUsersCurrentConstraint.description,
                          min: currentUsersCurrentConstraint.min,
                          max: currentUsersCurrentConstraint.max,
                          date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                          antecedentUser: {
                            id: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                          },
                          consequenceUser: {},
                          event: {},
                          actual: total.actual,
                        });
                      }
                    }

                    //check individual relations
                    for (
                      let p = 0;
                      p < payload.userPairsRelations.length;
                      p++
                    ) {
                      let userConsequence = payload.userPairsRelations[p];
                      if (
                        userConsequence.actual >
                          currentUsersCurrentConstraint.max ||
                        userConsequence.actual <
                          currentUsersCurrentConstraint.min
                      ) {
                        if (
                          checkIntersection(userIdArray, [
                            userConsequence.userId,
                          ])
                        ) {
                          response.push({
                            id: currentUsersCurrentConstraint.id,
                            constraintType: 'usertosession',
                            description:
                              currentUsersCurrentConstraint.description,
                            min: currentUsersCurrentConstraint.min,
                            max: currentUsersCurrentConstraint.max,
                            date: moment(convertedDates[m]).format(
                              'YYYY-MM-DD',
                            ),
                            antecedentUser: {
                              id: user.userId,
                              firstName: user.firstName,
                              lastName: user.lastName,
                            },
                            consequenceUser: {
                              id: userConsequence.userId,
                              firstName: userConsequence.firstName,
                              lastName: userConsequence.lastName,
                            },
                            event: {},
                            actual: userConsequence.actual,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'gaps') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });

              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              if (isItContainingTheEvent) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    let payload = await getGapsconstraintUserRelation({
                      gapsconstraint: currentUsersCurrentConstraint,
                      userId: user.userId,
                      date: convertedDates[m],
                      roleHierarchy: roleHierarchy,
                      consequenceRoleHierarchy: consequenceRoleHierarchy,
                      events: user.events,
                      availabilities: user.availabilities,
                    });

                    if (
                      payload.totalGapDurationInSecond >
                      currentUsersCurrentConstraint.max
                    ) {
                      let actualAfterConvertion =
                        payload.totalGapDurationInSecond;
                      let minConverted = currentUsersCurrentConstraint.min;
                      let maxConverted = currentUsersCurrentConstraint.max;

                      if (currentUsersCurrentConstraint.units === 'unit') {
                        actualAfterConvertion =
                          payload.totalGapDurationInSecond / (60 * 15);
                        minConverted =
                          currentUsersCurrentConstraint.min / (60 * 15);
                        maxConverted =
                          currentUsersCurrentConstraint.max / (60 * 15);
                      }
                      if (currentUsersCurrentConstraint.units === 'hours') {
                        actualAfterConvertion =
                          payload.totalGapDurationInSecond / (60 * 60);
                        minConverted =
                          currentUsersCurrentConstraint.min / (60 * 60);
                        maxConverted =
                          currentUsersCurrentConstraint.max / (60 * 60);
                      }
                      if (currentUsersCurrentConstraint.units === 'minutes') {
                        actualAfterConvertion =
                          payload.totalGapDurationInSecond / 60;
                        minConverted = currentUsersCurrentConstraint.min / 60;
                        maxConverted = currentUsersCurrentConstraint.max / 60;
                      }
                      response.push({
                        id: currentUsersCurrentConstraint.id,
                        constraintType: 'gaps',
                        description: currentUsersCurrentConstraint.description,
                        min: minConverted,
                        max: maxConverted,
                        minSeconds: currentUsersCurrentConstraint.min,
                        maxSeconds: currentUsersCurrentConstraint.max,
                        unit: currentUsersCurrentConstraint.units,
                        date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        antecedentUser: {
                          id: user.userId,
                          firstName: user.firstName,
                          lastName: user.lastName,
                        },
                        event: {},
                        consequenceUser: {},
                        usersWorkedWith: {},
                        actual: actualAfterConvertion,
                      });
                    }
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'drive') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });

              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              //if none of the users match then check the activity
              if (!isItContainingTheEvent) {
                let activityMatches = true;

                //check the id of activity
                if (consequenceUserId) {
                  if (event.activity0.id !== consequenceUserId) {
                    activityMatches = false;
                  }
                }
                //check the role of activity
                if (consequenceRoleHierarchy.length > 0) {
                  let activityRoles = event.activity0.roles.map(
                    (role) => role.name,
                  );
                  if (
                    !checkIntersection(activityRoles, consequenceRoleHierarchy)
                  ) {
                    activityMatches = false;
                  }
                }

                //check the subgroups of activity
                if (consequenceSubgroupId) {
                  let activitySubgroups = event.activity0.subgroups.map(
                    (sbg) => sbg.id,
                  );

                  if (
                    !checkIntersection(activitySubgroups, [
                      consequenceSubgroupId,
                    ])
                  ) {
                    activityMatches = false;
                  }
                }

                if (activityMatches) {
                  isItContainingTheEvent = true;
                }
              }

              if (isItContainingTheEvent) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    let payload = await getDriveconstraintUserRelation({
                      driveConstraint: currentUsersCurrentConstraint,
                      userId: user.userId,
                      userAddress: user.address,
                      date: convertedDates[m],
                      roleHierarchy: roleHierarchy,
                      consequenceRoleHierarchy: consequenceRoleHierarchy,
                      events: user.events,
                      distanceMatrix: distanceMatrix,
                    });

                    if (
                      payload.totalDriveTimeInSecond >
                      currentUsersCurrentConstraint.max
                    ) {
                      let actualAfterConvertion =
                        payload.totalDriveTimeInSecond;
                      let minConverted = currentUsersCurrentConstraint.min;
                      let maxConverted = currentUsersCurrentConstraint.max;

                      if (currentUsersCurrentConstraint.units === 'unit') {
                        actualAfterConvertion = Number(
                          (payload.totalDriveTimeInSecond / (60 * 15)).toFixed(
                            2,
                          ),
                        );
                        minConverted = Number(
                          (
                            currentUsersCurrentConstraint.min /
                            (60 * 15)
                          ).toFixed(2),
                        );
                        maxConverted = Number(
                          (
                            currentUsersCurrentConstraint.max /
                            (60 * 15)
                          ).toFixed(2),
                        );
                      }
                      if (currentUsersCurrentConstraint.units === 'hours') {
                        actualAfterConvertion = Number(
                          (payload.totalDriveTimeInSecond / (60 * 60)).toFixed(
                            2,
                          ),
                        );
                        minConverted = Number(
                          (
                            currentUsersCurrentConstraint.min /
                            (60 * 60)
                          ).toFixed(2),
                        );
                        maxConverted = Number(
                          (
                            currentUsersCurrentConstraint.max /
                            (60 * 60)
                          ).toFixed(2),
                        );
                      }
                      if (currentUsersCurrentConstraint.units === 'minutes') {
                        actualAfterConvertion = Number(
                          (payload.totalDriveTimeInSecond / 60).toFixed(2),
                        );
                        Number(
                          (minConverted =
                            currentUsersCurrentConstraint.min / 60).toFixed(2),
                        );
                        Number(
                          (maxConverted =
                            currentUsersCurrentConstraint.max / 60).toFixed(2),
                        );
                      }
                      response.push({
                        id: currentUsersCurrentConstraint.id,
                        constraintType: 'drive',
                        description: currentUsersCurrentConstraint.description,
                        min: minConverted,
                        max: maxConverted,
                        minSeconds: currentUsersCurrentConstraint.min,
                        maxSeconds: currentUsersCurrentConstraint.max,
                        unit: currentUsersCurrentConstraint.units,
                        date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        antecedentUser: {
                          id: user.userId,
                          firstName: user.firstName,
                          lastName: user.lastName,
                        },
                        event: {},
                        consequenceUser: {},
                        usersWorkedWith: {},
                        actual: actualAfterConvertion,
                      });
                    }
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'distance') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });

              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              //if none of the users match then check the activity
              if (!isItContainingTheEvent) {
                let activityMatches = true;

                //check the id of activity
                if (consequenceUserId) {
                  if (event.activity0.id !== consequenceUserId) {
                    activityMatches = false;
                  }
                }
                //check the role of activity
                if (consequenceRoleHierarchy.length > 0) {
                  let activityRoles = event.activity0.roles.map(
                    (role) => role.name,
                  );
                  if (
                    !checkIntersection(activityRoles, consequenceRoleHierarchy)
                  ) {
                    activityMatches = false;
                  }
                }

                //check the subgroups of activity
                if (consequenceSubgroupId) {
                  let activitySubgroups = event.activity0.subgroups.map(
                    (sbg) => sbg.id,
                  );

                  if (
                    !checkIntersection(activitySubgroups, [
                      consequenceSubgroupId,
                    ])
                  ) {
                    activityMatches = false;
                  }
                }

                if (activityMatches) {
                  isItContainingTheEvent = true;
                }
              }

              if (isItContainingTheEvent) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    let payload = await getDistanceconstraintUserRelation({
                      distanceConstraint: currentUsersCurrentConstraint,
                      userId: user.userId,
                      userAddress: user.address,
                      date: convertedDates[m],
                      roleHierarchy: roleHierarchy,
                      consequenceRoleHierarchy: consequenceRoleHierarchy,
                      events: user.events,
                      distanceMatrix: distanceMatrix,
                    });

                    if (
                      payload.totalPassedDistanceInMeters >
                      currentUsersCurrentConstraint.max
                    ) {
                      let actualAfterConvertion = payload.t;
                      let minConverted = currentUsersCurrentConstraint.min;
                      let maxConverted = currentUsersCurrentConstraint.max;

                      if (currentUsersCurrentConstraint.units === 'miles') {
                        actualAfterConvertion = Number(
                          (payload.totalPassedDistanceInMeters / 1610).toFixed(
                            2,
                          ),
                        );
                        minConverted = Number(
                          (currentUsersCurrentConstraint.min / 1610).toFixed(2),
                        );
                        maxConverted = Number(
                          (currentUsersCurrentConstraint.max / 1610).toFixed(2),
                        );
                      }
                      if (
                        currentUsersCurrentConstraint.units === 'kilometers'
                      ) {
                        actualAfterConvertion = Number(
                          (payload.totalPassedDistanceInMeters / 1000).toFixed(
                            2,
                          ),
                        );
                        minConverted = Number(
                          (currentUsersCurrentConstraint.min / 1000).toFixed(2),
                        );
                        maxConverted = Number(
                          (currentUsersCurrentConstraint.max / 1000).toFixed(2),
                        );
                      }

                      response.push({
                        id: currentUsersCurrentConstraint.id,
                        constraintType: 'distance',
                        description: currentUsersCurrentConstraint.description,
                        min: minConverted,
                        max: maxConverted,
                        minMeters: currentUsersCurrentConstraint.min,
                        maxMeters: currentUsersCurrentConstraint.max,
                        unit: currentUsersCurrentConstraint.units,
                        date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        antecedentUser: {
                          id: user.userId,
                          firstName: user.firstName,
                          lastName: user.lastName,
                        },
                        event: {},
                        consequenceUser: {},
                        usersWorkedWith: {},
                        actual: actualAfterConvertion,
                      });
                    }
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'backToBack') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              if (isItContainingTheEvent) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    let result = await getBacktobackconstraintUserRelation({
                      backtobackconstraint: currentUsersCurrentConstraint,
                      userId: user.userId,
                      date: convertedDates[m],
                      roleHierarchy: consequenceRoleHierarchy,
                      events: user.events,
                    });
                    //check the matchs are because of this event
                    let backtoBackedTimes = new Array();
                    let startAdded = false;
                    let endAdded = false;
                    for (let p = 0; p < result.backtobacks.length; p++) {
                      if (!startAdded) {
                        if (
                          moment(result.backtobacks[p]).format('h:mm A') ===
                          moment(event.start).format('h:mm A')
                        ) {
                          backtoBackedTimes.push(result.backtobacks[p]);
                          startAdded = true;
                          continue;
                        }
                      }

                      if (!endAdded) {
                        if (
                          moment(result.backtobacks[p]).format('h:mm A') ===
                          moment(event.end).format('h:mm A')
                        ) {
                          backtoBackedTimes.push(result.backtobacks[p]);
                          continue;
                        }
                      }

                      if (startAdded && endAdded) {
                        break;
                      }
                    }

                    // if it is breaking, then add it to response
                    if (backtoBackedTimes.length > 0) {
                      let constraintInfo = {
                        id: currentUsersCurrentConstraint.id,
                        constraintType:
                          currentUsersCurrentConstraint.constraintType,
                        description: currentUsersCurrentConstraint.description,
                        frequency: currentUsersCurrentConstraint.frequency,
                        min: currentUsersCurrentConstraint.min,
                        max: currentUsersCurrentConstraint.max,
                        minSeconds: currentUsersCurrentConstraint.min,
                        maxSeconds: currentUsersCurrentConstraint.max,
                        unit: currentUsersCurrentConstraint.units,
                        consequenceTypeEachOrAll:
                          currentUsersCurrentConstraint.consequenceTypeEachOrAll,
                        date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        antecedentUser: {
                          id: user.userId,
                          firstName: user.firstName,
                          lastName: user.lastName,
                        },
                        each: null,
                        all: {
                          actual: 0,
                        },
                        backtobackedTimes: [],
                      };
                      for (let p = 0; p < backtoBackedTimes.length; p++) {
                        constraintInfo.backtobackedTimes.push(
                          moment(backtoBackedTimes[p]).format('h:mm A'),
                        );
                      }
                      response.push(constraintInfo);
                    }
                  }
                }
              }
            }

            if (
              currentUsersCurrentConstraint.constraintType === 'breakQuantity'
            ) {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }
              // if (isItContainingTheEvent) {
              for (let m = 0; m < convertedDates.length; m++) {
                if (
                  convertedDates[m] >= startOfConstraint &&
                  convertedDates[m] <= endOfConstriant
                ) {
                  let result = await getBreakQuantityconstraintUserRelation({
                    breakQuantityconstraint: currentUsersCurrentConstraint,
                    userId: user.userId,
                    date: convertedDates[m],
                    roleHierarchy: consequenceRoleHierarchy,
                    events: user.events,
                  });

                  let constraintInfo = {
                    id: currentUsersCurrentConstraint.id,
                    firstName: 'sss',
                    constraintType:
                      currentUsersCurrentConstraint.constraintType,
                    description: currentUsersCurrentConstraint.description,
                    frequency: currentUsersCurrentConstraint.frequency,
                    min: currentUsersCurrentConstraint.min,
                    max: currentUsersCurrentConstraint.max,
                    unit: currentUsersCurrentConstraint.units,
                    minSeconds: currentUsersCurrentConstraint.min,
                    maxSeconds: currentUsersCurrentConstraint.max,
                    actualBreakCount: result.actualNumberBreaks,
                    actualDurationExceptBreaks:
                      result.actualTotalDurationExceptBreaksInSeconds,
                    date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                    antecedentUser: {
                      id: user.userId,
                      firstName: user.firstName,
                      lastName: user.lastName,
                    },
                  };

                  if (currentUsersCurrentConstraint.units === 'unit') {
                    constraintInfo.max = Number(
                      (constraintInfo.max / (15 * 60)).toFixed(2),
                    );
                    constraintInfo.actualDurationExceptBreaks = Number(
                      (
                        constraintInfo.actualDurationExceptBreaks /
                        (15 * 60)
                      ).toFixed(2),
                    );
                  }
                  if (currentUsersCurrentConstraint.units === 'hours') {
                    constraintInfo.max = Number(
                      (constraintInfo.max / (60 * 60)).toFixed(2),
                    );
                    constraintInfo.actualDurationExceptBreaks = Number(
                      (
                        constraintInfo.actualDurationExceptBreaks /
                        (60 * 60)
                      ).toFixed(2),
                    );
                  }

                  if (currentUsersCurrentConstraint.units === 'minutes') {
                    constraintInfo.max = Number(
                      (constraintInfo.max / 60).toFixed(2),
                    );
                    constraintInfo.actualDurationExceptBreaks = Number(
                      (constraintInfo.actualDurationExceptBreaks / 60).toFixed(
                        2,
                      ),
                    );
                  }

                  if (
                    constraintInfo.maxSeconds <=
                      result.actualTotalDurationExceptBreaksInSeconds &&
                    constraintInfo.actualBreakCount < constraintInfo.min
                  ) {
                    response.push(constraintInfo);
                  }
                }
              }
            }

            if (currentUsersCurrentConstraint.constraintType === 'grouping') {
              let startOfConstraint = moment
                .utc(currentUsersCurrentConstraint.start)
                .toDate();
              let endOfConstriant = moment
                .utc(currentUsersCurrentConstraint.end)
                .toDate();
              //check if the constraint contains this event
              let isItContainingTheEvent = false;
              let consequenceUserId =
                currentUsersCurrentConstraint.consequenceUserId;
              let consequenceSubgroupId =
                currentUsersCurrentConstraint.consequenceSubgroupId;
              let consequenceRoleHierarchy = [];
              Object.entries(roleHierarchy).map((t) => {
                const [key, value] = t;
                //push the decendents
                if (
                  currentUsersCurrentConstraint.consequenceRole &&
                  checkIntersection(
                    [currentUsersCurrentConstraint.consequenceRole.name],
                    value,
                  )
                ) {
                  consequenceRoleHierarchy.push(key);
                }
              });
              for (let l = 0; l < event.users.length; l++) {
                let currentUser = event.users[l];
                if (currentUser.id === user.userId) {
                  continue;
                }
                //check the id
                if (consequenceUserId) {
                  if (currentUser.id !== consequenceUserId) {
                    continue;
                  }
                }
                //check the role
                if (consequenceRoleHierarchy.length > 0) {
                  let usersRoles = currentUser.roles.map((role) => role.name);
                  if (
                    !checkIntersection(usersRoles, consequenceRoleHierarchy)
                  ) {
                    continue;
                  }
                }

                //check the subgroups
                if (consequenceSubgroupId) {
                  let userSubgroups = currentUser.subgroups.map(
                    (sbg) => sbg.id,
                  );
                  if (
                    !checkIntersection(userSubgroups, [consequenceSubgroupId])
                  ) {
                    continue;
                  }
                }
                isItContainingTheEvent = true;
                break;
              }

              if (isItContainingTheEvent) {
                for (let m = 0; m < convertedDates.length; m++) {
                  if (
                    convertedDates[m] >= startOfConstraint &&
                    convertedDates[m] <= endOfConstriant
                  ) {
                    let payload = await getGroupingconstraintUserRelation({
                      groupingconstraint: currentUsersCurrentConstraint,
                      user: user,
                      date: convertedDates[m],
                      roleHierarchy: roleHierarchy,
                      consequenceRoleHierarchy: consequenceRoleHierarchy,
                      events: { rows: [event], count: 1 },
                    });

                    if (payload.brokenEvents.has(event.id)) {
                      response.push({
                        id: currentUsersCurrentConstraint.id,
                        constraintType: 'groupings',
                        description: currentUsersCurrentConstraint.description,
                        min: currentUsersCurrentConstraint.min,
                        max: currentUsersCurrentConstraint.max,
                        date: moment(convertedDates[m]).format('YYYY-MM-DD'),
                        antecedentUser: {
                          id: user.userId,
                          firstName: user.firstName,
                          lastName: user.lastName,
                        },
                        antecedentUserSubgroups:
                          payload.antecedentUserSubgroups,
                        event: {
                          id: event.id,
                          breakingUsers: payload.brokenEvents.get(event.id)
                            .breakingUsers,
                        },
                        consequenceUser: {},
                        usersWorkedWith: {},
                        actual: payload.totalGapDurationInMinute,
                      });
                    }
                  }
                }
              }
            }
          }
        }

        //check if the user is person
        let calculateoverbooking = false;
        if (checkIntersection(user.roles, ['Person'])) {
          calculateoverbooking = true;
        }

        if (calculateoverbooking) {
          for (let m = 0; m < convertedDates.length; m++) {
            let result = await getNotProperSlostOnDayForUser({
              events: user.events,
              start: moment.utc(convertedDates[m]).toDate(),
              end: moment.utc(convertedDates[m]).add(1, 'days').toDate(),
              timezone: timezone,
              calculateOverbookings: true,
            });

            for (let k = 0; k < result.overbooking.length; k++) {
              let overbookedEvents = result.overbooking[k];
              if (
                overbookedEvents.events[0].id === event.id ||
                overbookedEvents.events[1].id === event.id
              ) {
                overbookings.push({
                  date: moment2.tz(convertedDates[m], timezone).format('YYYY-MM-DD'),
                  user: {
                    id: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                  },
                  overbookedEvent: overbookedEvents.events,
                  conflict: {
                    startTime: moment
                      .utc(result.overbooking[k].conflict.start)
                      .format('h:mm A'),
                    endTime: moment
                      .utc(result.overbooking[k].conflict.end)
                      .format('h:mm A'),
                  },
                });
              }
            }
          }
        }
      }

      let groupByUsers = new Map();

      // fill the groupByUser map
      for (let p = 0; p < response.length; p++) {
        if (!groupByUsers.has(response[p].antecedentUser.id)) {
          groupByUsers.set(response[p].antecedentUser.id, {
            userId: response[p].antecedentUser.id,
            firstName: response[p].antecedentUser.firstName,
            lastName: response[p].antecedentUser.lastName,
            constraints: [],
            overbookings: [],
          });
        }
      }

      for (let q = 0; q < overbookings.length; q++) {
        if (!groupByUsers.has(overbookings[q].user.id)) {
          groupByUsers.set(overbookings[q].user.id, {
            userId: overbookings[q].user.id,
            firstName: overbookings[q].user.firstName,
            lastName: overbookings[q].user.lastName,
            constraints: [],
            overbookings: [],
          });
        }
      }

      ////////////////////////////////////////////////

      //group constraints by user
      for (let s = 0; s < response.length; s++) {
        let userConstraintOverbooking = groupByUsers.get(
          response[s].antecedentUser.id,
        );
        userConstraintOverbooking.constraints.push({
          ...response[s],
          broken: true,
        });
      }

      //group overbookings by user
      for (let s = 0; s < overbookings.length; s++) {
        let userConstraintOverbooking = groupByUsers.get(
          overbookings[s].user.id,
        );
        userConstraintOverbooking.overbookings.push(overbookings[s]);
      }

      // fill the response
      for (let [_, value] of groupByUsers) {
        eventHistory.push(value);
      }

      res.status(200).send(eventHistory);

      return;
    }

    res.status(200).send([]);
  }),
);

// Activity Table (NEW)
router.get('/activity-table/statistics-activity-table', async (req, res) => {
  if (!req.query.start || !req.query.end) {
    res.status(400).send({ code: 400, message: 'bad request' });
    return;
  }

  if (req.query.start && req.query.start.includes(' ')) {
    req.query.start = req.query.start.replace(' ', '+')
  }
  if (req.query.end && req.query.end.includes(' ')) {
    req.query.end = req.query.end.replace(' ', '+');
  }
  
  // set companyId from req.currentUser
  req.query.companyId = req.currentUser.companyId;

  try {
    let startInUTC = moment.utc(req.query.start).toDate();
    let endInUTC = moment.utc(req.query.end).toDate();

    let roleList = [];
    let subgroupList = [];
    let branchList = [];
    let userList = [];
    let type = 'appointments';

    // In case there is no role requested we responde
    // only `Person`'s in response by default.
    // But anyway, if user needs to get the activites or locations
    // he/she can filter by selecting Activity/Location manually
    if (!req.query.roles) {
      req.query.roles = 'Person';
    }

    //set role set
    if (req.query.roles) {
      const roles = req.query.roles.split('|');
      // Fetch from backend
      const roleHierarchy = await getRoleHierarchy(req.query.companyID);
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        if (checkIntersection(roles, value)) {
          roleList.push(key);
        }
      });
    }

    //set subgroup set
    if (req.query.subgroups) {
      subgroupList = req.query.subgroups.split('|');
    }

    //set user set
    if (req.query.users) {
      userList = req.query.users.split('|');
    }

    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    if (req.query.type === 'cancellations') {
      type = 'cancellations';
    }

    const result = await getUserActivityTableDuringDateRange(
      startInUTC,
      endInUTC,
      req.currentUser.companyId,
      //req.query.companyId,
      branchList,
      subgroupList,
      roleList,
      userList,
      type,
    );

    res.status(200).send({
      rows: result.userStatsPerActivity,
      columns: result.columnData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: 'Internal Server Error' });
  }
});

router.post(
  '/eventfuture/constraints',
  wrapAsync(async (req, res) => {
    const roleHierarchy = await getRoleHierarchy(req.currentUser.companyId);
    let requestedEvents = [];
    let mostPriorConstriants = new Array();
    if (req.body.highPriority && req.body.highPriority.length > 0) {
      mostPriorConstriants.push(...req.body.highPriority.split('|'));
    }

    if (req.body.events && req.body.events.length > 0) {
      requestedEvents = req.body.events;
    }

    let allResourceIds = new Array();
    let response = new Array();
    for (let i = 0; i < requestedEvents.length; i++) {
      let currentEvent = requestedEvents[i];
      for (let m = 0; m < currentEvent.resourceIds.length; m++) {
        allResourceIds.push(currentEvent.resourceIds[m].slice(0, -1));
      }
    }
    // remove duplicates
    allResourceIds = Array.from(new Set(allResourceIds));

    let usersCostraints = new Array();
    let allUserRoleSubgroupInfo = new Map();
    let userIdArray = new Array();
    let convertedDate = moment(
      moment(requestedEvents[0].start)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ssZ'),
    ).toDate();
    let currentDate = moment.utc(requestedEvents[0].new_start).toDate();

    console.time('Collect resource data (roles, subgroups): ');
    let allBrancheListOfPerson = new Array();
    let allRoleListOfPerson = new Array();
    let allSubgroupListOfPerson = new Array();

    // get all users role, subgroup, branches in single db call
    let allUsers = await UsersDBApi.getUserRoleSubgroupBranchListInBulk({
      userIds: allResourceIds,
    });
    // Loop through allUsers and set each element to the map
    allUsers.forEach((user) => {
      allUserRoleSubgroupInfo.set(user.id, user);
    });

    // get branch hierarchy , and then use it when generating for each user
    let branchHierarchy = await BranchesDBApi.getBranchIdParentIds({
      companyId: req.currentUser.companyId,
    });

    for (let k = 0; k < allResourceIds.length; k++) {
      let currentUser = allResourceIds[k];
      let isUserPerson = true;
      if (!allUserRoleSubgroupInfo.has(currentUser)) {
        continue;
      }
      let user = allUserRoleSubgroupInfo.get(currentUser);

      let roleList = [];
      let subgroupList = [];
      let branchList = [];

      //set role set
      if (user.roles.length > 0) {
        // Fetch from backend
        const roleNameArray = user.roles.map((role) => role.name);
        Object.entries(roleHierarchy).map((t) => {
          const [key, value] = t;
          //push the decendents
          if (checkIntersection(roleNameArray, value)) {
            roleList.push(key);
          }

          //push the ancestors
          if (checkIntersection(roleNameArray, [key])) {
            const filteredValues = value.filter((item) => item !== key);
            roleList.push(...filteredValues);
          }
        });
      }

      //check if the user is person
      if (!checkIntersection(roleList, ['Person'])) {
        isUserPerson = false;
      }

      //set subgroup set
      if (user.subgroups.length > 0) {
        subgroupList = user.subgroups.map((sbgrp) => sbgrp.id);
      }

      if (isUserPerson) {
        //set branch set
        if (user.branches.length > 0) {
          // Fetch from backend
          const branchIds = user.branches.map((branch) => branch.id);
          branchList = getBranchTreeOfBranchList(branchIds, branchHierarchy);
        }

        // add them to all roles
        allRoleListOfPerson.push(...roleList);

        // add them to all subgroups
        allSubgroupListOfPerson.push(...subgroupList);

        // add them to all branches
        allBrancheListOfPerson.push(...branchList);
      }

      usersCostraints.push({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId,
        roles: user.roles,
        subgroups: user.subgroups,
        isPerson: isUserPerson,
        roleList: roleList,
        branchList: branchList,
        subgroupList: subgroupList,
        constraints: [],
      });

      user.isPerson = isUserPerson;

      userIdArray.push(user.id);
    }

    console.timeEnd('Collect resource data (roles, subgroups): ');

    // remove duplicates
    allBrancheListOfPerson = Array.from(new Set(allBrancheListOfPerson));
    allRoleListOfPerson = Array.from(new Set(allRoleListOfPerson));
    allSubgroupListOfPerson = Array.from(new Set(allSubgroupListOfPerson));
    console.time('Collect resource data (constraints): ');

    // get all constraints
    const allConstraintsForAllUser =
      await NewconstraintgeneratorDBApi.findConstraintsForBulkUser({
        branches: allBrancheListOfPerson,
        roles: allRoleListOfPerson,
        subgroups: allSubgroupListOfPerson,
        userIds: allResourceIds,
        date: currentDate || undefined,
        companyId: req.currentUser.companyId,
        constraintTypes: ['unmatching', 'matching', 'sessionlength', 'grouping'], // We put only these 4 temporarily for optimizing eventfuture
      });

    // distribute constriants to each user
    for (let w = 0; w < allConstraintsForAllUser.rows.length; w++) {
      let crntConstraint = allConstraintsForAllUser.rows[w];
      let constraintAntecedentRoleHierarchy = [];
      let constraintsBranchIds = crntConstraint.branches.map(
        (brnch) => brnch.id,
      );

      // generate constriant antecedent role hierarchy
      Object.entries(roleHierarchy).map((t) => {
        const [key, value] = t;
        //push the decendents
        if (
          crntConstraint.antecedentRole &&
          checkIntersection([crntConstraint.antecedentRole.name], value)
        ) {
          constraintAntecedentRoleHierarchy.push(key);
        }
      });

      for (let ww = 0; ww < usersCostraints.length; ww++) {
        let crntUser = usersCostraints[ww];

        // if user is not person, continue
        if (!crntUser.isPerson) {
          continue;
        }
        // check if antecedentUser not null
        if (
          crntConstraint.antecedentUserId &&
          crntUser.userId !== crntConstraint.antecedentUserId
        ) {
          continue;
        }

        // check if antecedentRole not null
        if (
          crntConstraint.antecedentRoleId &&
          !checkIntersection(
            crntUser.roleList,
            constraintAntecedentRoleHierarchy,
          )
        ) {
          continue;
        }

        // check if antecedentSubgroup not null
        if (
          crntConstraint.antecedentSubgroupId &&
          !checkIntersection(crntUser.subgroupList, [
            crntConstraint.antecedentSubgroupId,
          ])
        ) {
          continue;
        }

        // check the branch maching
        if (
          constraintsBranchIds.length > 0 &&
          !checkIntersection(constraintsBranchIds, crntUser.branchList)
        ) {
          continue;
        }

        crntUser.constraints.push(crntConstraint);
      }
    }

    console.timeEnd('Collect resource data (constraints): ');

    console.time('Collect event, availabilities per resource: ');
    //get all dates
    let minStartForAllDates = moment
      .utc(convertedDate)
      .add(-7, 'days')
      .toDate();
    let maxEndForAllDates = moment.utc(convertedDate).add(7, 'days').toDate();

    //get all events once
    // Temporarily commented to not get the events as they will not be used in current
    // constraint checks [matching, unmatching, sessionlength, siblingbranch]
    let allEventsForAlluser = { rows: [], count: 0 };
    // let allEventsForAlluser =
    //   await EventsDBApi.findAllEventsOfMultipleUsersForConstraintBreakCheck({
    //     start: minStartForAllDates,
    //     end: maxEndForAllDates,
    //     userIds: userIdArray,
    //     sandboxMode: true,
    //   });

    // get all availabilities once
    // Temporarily commented to not get the events as they will not be used in current
    // constraint checks [matching, unmatching, sessionlength, siblingbranch]
    let availabilitiesListData = { data: { count: 0 } };
    // const availabilitiesListData = await getAvailabilitiesForDateRange(
    //   minStartForAllDates,
    //   maxEndForAllDates,
    //   req.currentUser.companyId,
    //   [],
    //   [],
    //   [],
    //   userIdArray,
    //   true,
    // );

    const filteredEvents = allEventsForAlluser.rows.filter(
      (e) => !e.isCancelled,
    );

    allEventsForAlluser.rows = filteredEvents;
    allEventsForAlluser.count = filteredEvents.length;

    // fill the events and availabilities for each user
    for (let k = 0; k < usersCostraints.length; k++) {
      let crntUser = usersCostraints[k];
      let events = new Array();
      let availabilities = new Array();
      for (let p = 0; p < allEventsForAlluser.count; p++) {
        let e = allEventsForAlluser.rows[p];
        for (let q = 0; q < e.users.length; q++) {
          if (e.users[q].id === crntUser.userId) {
            events.push(e);
            break;
          }
        }

        if (e.activity0 && e.activity0.id === crntUser.userId) {
          events.push(e);
        }

        if (e.location0 && e.location0.id === crntUser.userId) {
          events.push(e);
        }
      }

      for (let n = 0; n < availabilitiesListData.data.count; n++) {
        let a = availabilitiesListData.data.rows[n];
        if (a.user.id === crntUser.userId) {
          availabilities.push(a);
        }
      }

      crntUser.events = {
        rows: events,
        count: events.length,
      };

      crntUser.availabilities = {
        rows: availabilities,
        count: availabilities.length,
      };
    }
    console.timeEnd('Collect event, availabilities per resource: ');

    console.time('Rest calculation logic: ');
    for (let v = 0; v < requestedEvents.length; v++) {
      let currentEVENT = requestedEvents[v];
      let eventDurationInSeconds = moment(currentEVENT.end).diff(
        moment(currentEVENT.start),
        'seconds',
      );
      let currentEventResourceIds = new Array();
      let thisEventInResp = {
        id: currentEVENT.id,
        constraints: new Array(),
      };
      // push this events resources by removing the last letter (it is being sent from
      // frontend by adding `a` at the end I do not know why)
      for (let m = 0; m < currentEVENT.resourceIds.length; m++) {
        currentEventResourceIds.push(currentEVENT.resourceIds[m].slice(0, -1));
      }
      for (let i = 0; i < usersCostraints.length; i++) {
        let user = usersCostraints[i];

        // if currentUser is not in the resources of current event continue
        if (!currentEventResourceIds.includes(user.userId)) {
          continue;
        }
        //console.log('filly', user.constraints);

        // check constraints
        for (let j = 0; j < user.constraints.length; j++) {
          let currentUsersCurrentConstraint = user.constraints[j];
          if (
            !mostPriorConstriants.includes(currentUsersCurrentConstraint.id)
          ) {
            continue;
          }

          // TIME constraint is commented out because of disabling it temporarily
          // if (currentUsersCurrentConstraint.constraintType === 'time') {
          //   let startOfConstraint = moment
          //     .utc(currentUsersCurrentConstraint.start)
          //     .toDate();
          //   let endOfConstriant = moment
          //     .utc(currentUsersCurrentConstraint.end)
          //     .toDate();
          //   //check if the constraint contains this event
          //   let isItContainingTheEvent = false;
          //   let eventUsersInConsequencePart = new Array();
          //   let consequenceUserId =
          //     currentUsersCurrentConstraint.consequenceUserId;
          //   let consequenceSubgroupId =
          //     currentUsersCurrentConstraint.consequenceSubgroupId;
          //   let consequenceRoleHierarchy = [];
          //   Object.entries(roleHierarchy).map((t) => {
          //     const [key, value] = t;
          //     //push the decendents
          //     if (
          //       currentUsersCurrentConstraint.consequenceRole &&
          //       checkIntersection(
          //         [currentUsersCurrentConstraint.consequenceRole.name],
          //         value,
          //       )
          //     ) {
          //       consequenceRoleHierarchy.push(key);
          //     }
          //   });

          //   for (let l = 0; l < currentEventResourceIds.length; l++) {
          //     let currentUser = allUserRoleSubgroupInfo.get(
          //       currentEventResourceIds[l],
          //     );

          //     if (currentUser.id === user.userId) {
          //       continue;
          //     }
          //     //check the id
          //     if (consequenceUserId) {
          //       if (currentUser.id !== consequenceUserId) {
          //         continue;
          //       }
          //     }
          //     //check the role
          //     if (consequenceRoleHierarchy.length > 0) {
          //       let usersRoles = currentUser.roles.map((role) => role.name);
          //       if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
          //         continue;
          //       }
          //     }

          //     //check the subgroups
          //     if (consequenceSubgroupId) {
          //       let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
          //       if (
          //         !checkIntersection(userSubgroups, [consequenceSubgroupId])
          //       ) {
          //         continue;
          //       }
          //     }
          //     eventUsersInConsequencePart.push({
          //       userId: currentUser.id,
          //       firstName: currentUser.firstName,
          //       lastName: currentUser.lastName,
          //     });
          //     isItContainingTheEvent = true;
          //     break;
          //   }
          //   if (
          //     isItContainingTheEvent &&
          //     convertedDate <= endOfConstriant &&
          //     convertedDate >= startOfConstraint
          //   ) {
          //     let payload = await getTimeconstraintUserRelation({
          //       timeconstraint: currentUsersCurrentConstraint,
          //       userId: user.userId,
          //       date: convertedDate,
          //       roleHierarchy: roleHierarchy,
          //       consequenceRoleHierarchy: consequenceRoleHierarchy,
          //       events: user.events,
          //     });

          //     //check for total relationsip
          //     for (let p = 0; p < payload.totalRelation.length; p++) {
          //       let total = payload.totalRelation[p];
          //       total.actual += eventDurationInSeconds;
          //       if (
          //         total.actual > currentUsersCurrentConstraint.max ||
          //         total.actual < currentUsersCurrentConstraint.min
          //       ) {
          //         let actualAfterConvertion = total.actual;
          //         let minConverted = currentUsersCurrentConstraint.min;
          //         let maxConverted = currentUsersCurrentConstraint.max;
          //         if (currentUsersCurrentConstraint.units === 'unit') {
          //           actualAfterConvertion = total.actual / (60 * 15);
          //           minConverted =
          //             currentUsersCurrentConstraint.min / (60 * 15);
          //           maxConverted =
          //             currentUsersCurrentConstraint.max / (60 * 15);
          //         }
          //         if (currentUsersCurrentConstraint.units === 'hours') {
          //           actualAfterConvertion = total.actual / (60 * 60);
          //           minConverted =
          //             currentUsersCurrentConstraint.min / (60 * 60);
          //           maxConverted =
          //             currentUsersCurrentConstraint.max / (60 * 60);
          //         }

          //         if (currentUsersCurrentConstraint.units === 'minutes') {
          //           actualAfterConvertion = total.actual / 60;
          //           minConverted = currentUsersCurrentConstraint.min / 60;
          //           maxConverted = currentUsersCurrentConstraint.max / 60;
          //         }

          //         thisEventInResp.constraints.push({
          //           id: currentUsersCurrentConstraint.id,
          //           constraintType: 'time',
          //           description: currentUsersCurrentConstraint.description,
          //           min: minConverted,
          //           max: maxConverted,
          //           minSeconds: currentUsersCurrentConstraint.min,
          //           maxSeconds: currentUsersCurrentConstraint.max,
          //           unit: currentUsersCurrentConstraint.units,
          //           date: moment(convertedDate).format('YYYY-MM-DD'),
          //           hard: !currentUsersCurrentConstraint.soft,
          //           antecedentUser: {
          //             id: user.userId,
          //             firstName: user.firstName,
          //             lastName: user.lastName,
          //           },
          //           consequenceUser: {},
          //           event: {},
          //           actual: actualAfterConvertion,
          //         });
          //       }
          //     }

          //     //check individual relations
          //     for (let p = 0; p < payload.userPairsRelations.length; p++) {
          //       let userConsequence = payload.userPairsRelations[p];
          //       userConsequence.actual += eventDurationInSeconds;
          //       if (
          //         userConsequence.actual > currentUsersCurrentConstraint.max ||
          //         userConsequence.actual < currentUsersCurrentConstraint.min
          //       ) {
          //         if (
          //           checkIntersection(currentEventResourceIds, [
          //             userConsequence.userId,
          //           ])
          //         ) {
          //           let actualAfterConvertion = userConsequence.actual;
          //           let minConverted = currentUsersCurrentConstraint.min;
          //           let maxConverted = currentUsersCurrentConstraint.max;
          //           if (currentUsersCurrentConstraint.units === 'unit') {
          //             actualAfterConvertion =
          //               userConsequence.actual / (60 * 15);
          //             minConverted =
          //               currentUsersCurrentConstraint.min / (60 * 15);
          //             maxConverted =
          //               currentUsersCurrentConstraint.max / (60 * 15);
          //           }
          //           if (currentUsersCurrentConstraint.units === 'hours') {
          //             actualAfterConvertion =
          //               userConsequence.actual / (60 * 60);
          //             minConverted =
          //               currentUsersCurrentConstraint.min / (60 * 60);
          //             maxConverted =
          //               currentUsersCurrentConstraint.max / (60 * 60);
          //           }
          //           if (currentUsersCurrentConstraint.units === 'minutes') {
          //             actualAfterConvertion = userConsequence.actual / 60;
          //             minConverted = currentUsersCurrentConstraint.min / 60;
          //             maxConverted = currentUsersCurrentConstraint.max / 60;
          //           }

          //           thisEventInResp.constraints.push({
          //             id: currentUsersCurrentConstraint.id,
          //             constraintType: 'time',
          //             description: currentUsersCurrentConstraint.description,
          //             min: minConverted,
          //             max: maxConverted,
          //             minSeconds: currentUsersCurrentConstraint.min,
          //             maxSeconds: currentUsersCurrentConstraint.max,
          //             unit: currentUsersCurrentConstraint.units,
          //             date: moment(convertedDate).format('YYYY-MM-DD'),
          //             hard: !currentUsersCurrentConstraint.soft,
          //             antecedentUser: {
          //               id: user.userId,
          //               firstName: user.firstName,
          //               lastName: user.lastName,
          //             },
          //             consequenceUser: {
          //               id: userConsequence.userId,
          //               firstName: userConsequence.firstName,
          //               lastName: userConsequence.lastName,
          //             },
          //             event: {},
          //             actual: actualAfterConvertion,
          //           });
          //         }
          //       }
          //     }

          //     //check session relations
          //     //if it is session frequency the only mattering event is this
          //     if (currentUsersCurrentConstraint.frequency === 'session') {
          //       let session = {};
          //       session.actual = eventDurationInSeconds;
          //       if (
          //         session.actual > currentUsersCurrentConstraint.max ||
          //         session.actual < currentUsersCurrentConstraint.min
          //       ) {
          //         let actualAfterConvertion = session.actual;
          //         let minConverted = currentUsersCurrentConstraint.min;
          //         let maxConverted = currentUsersCurrentConstraint.max;
          //         if (currentUsersCurrentConstraint.units === 'unit') {
          //           actualAfterConvertion = session.actual / (60 * 15);
          //           minConverted =
          //             currentUsersCurrentConstraint.min / (60 * 15);
          //           maxConverted =
          //             currentUsersCurrentConstraint.max / (60 * 15);
          //         }
          //         if (currentUsersCurrentConstraint.units === 'hours') {
          //           actualAfterConvertion = session.actual / (60 * 60);
          //           minConverted =
          //             currentUsersCurrentConstraint.min / (60 * 60);
          //           maxConverted =
          //             currentUsersCurrentConstraint.max / (60 * 60);
          //         }
          //         if (currentUsersCurrentConstraint.units === 'minutes') {
          //           actualAfterConvertion = session.actual / 60;
          //           minConverted = currentUsersCurrentConstraint.min / 60;
          //           maxConverted = currentUsersCurrentConstraint.max / 60;
          //         }
          //         thisEventInResp.constraints.push({
          //           id: currentUsersCurrentConstraint.id,
          //           constraintType: 'time',
          //           description: currentUsersCurrentConstraint.description,
          //           min: minConverted,
          //           max: maxConverted,
          //           minSeconds: currentUsersCurrentConstraint.min,
          //           maxSeconds: currentUsersCurrentConstraint.max,
          //           unit: currentUsersCurrentConstraint.units,
          //           date: moment(convertedDate).format('YYYY-MM-DD'),
          //           hard: !currentUsersCurrentConstraint.soft,
          //           antecedentUser: {
          //             id: user.userId,
          //             firstName: user.firstName,
          //             lastName: user.lastName,
          //           },
          //           consequenceUser: {},
          //           event: {
          //             eventId: currentEVENT.id,
          //             users: eventUsersInConsequencePart,
          //           },
          //           actual: actualAfterConvertion,
          //         });
          //       }
          //     }
          //   }
          // }

          // AUTHORIZATION constraint is commented out because of disabling it temporarily
          // if (
          //   currentUsersCurrentConstraint.constraintType === 'authorization'
          // ) {
          //   //check if the constraint contains this event
          //   let consequenceRoleHierarchy = [];
          //   Object.entries(roleHierarchy).map((t) => {
          //     const [key, value] = t;
          //     //push the decendents
          //     if (
          //       currentUsersCurrentConstraint.consequenceRole &&
          //       checkIntersection(
          //         [currentUsersCurrentConstraint.consequenceRole.name],
          //         value,
          //       )
          //     ) {
          //       consequenceRoleHierarchy.push(key);
          //     }
          //   });

          //   if (
          //     !currentEventResourceIds.includes(
          //       currentUsersCurrentConstraint.antecedentTypeActivityId,
          //     )
          //   ) {
          //     continue;
          //   }

          //   // if it is rollovered
          //   if (currentUsersCurrentConstraint.rollover) {
          //     let payload = await getAuthConstraintUserRelation({
          //       authconstraint: currentUsersCurrentConstraint,
          //       userId: user.userId,
          //       date: convertedDate,
          //       roleHierarchy: roleHierarchy,
          //       consequenceRoleHierarchy: consequenceRoleHierarchy,
          //       events: false,
          //     });

          //     payload.userPairsRelations.actual += eventDurationInSeconds;

          //     if (
          //       payload.userPairsRelations.actual <
          //       currentUsersCurrentConstraint.max
          //     ) {
          //       continue;
          //     }

          //     let constraintInfo = {
          //       id: currentUsersCurrentConstraint.id,
          //       constraintType: currentUsersCurrentConstraint.constraintType,
          //       description: currentUsersCurrentConstraint.description,
          //       min: currentUsersCurrentConstraint.min,
          //       max: currentUsersCurrentConstraint.max,
          //       minSeconds: currentUsersCurrentConstraint.min,
          //       maxSeconds: currentUsersCurrentConstraint.max,
          //       unit: currentUsersCurrentConstraint.units,
          //       rollover: currentUsersCurrentConstraint.rollover,
          //       date: moment(convertedDate).format('YYYY-MM-DD'),
          //       hard: !currentUsersCurrentConstraint.soft,
          //       consequenceUser: {},
          //       event: {},
          //       actual: payload.userPairsRelations.actual,
          //       antecedentUser: {
          //         id: user.userId,
          //         firstName: user.firstName,
          //         lastName: user.lastName,
          //       },
          //       activity: {
          //         id: payload.userPairsRelations.activity.id,
          //         firstName: payload.userPairsRelations.activity.firstName,
          //       },
          //     };

          //     if (currentUsersCurrentConstraint.units === 'unit') {
          //       constraintInfo.actual = Number(
          //         (constraintInfo.actual / (60 * 15)).toFixed(2),
          //       );
          //       constraintInfo.min = Number(
          //         (constraintInfo.min / (60 * 15)).toFixed(2),
          //       );
          //       constraintInfo.max = Number(
          //         (constraintInfo.max / (60 * 15)).toFixed(2),
          //       );
          //     }
          //     if (currentUsersCurrentConstraint.units === 'hours') {
          //       constraintInfo.actual = Number(
          //         (constraintInfo.actual / (60 * 60)).toFixed(2),
          //       );
          //       constraintInfo.min = Number(
          //         (constraintInfo.min / (60 * 60)).toFixed(2),
          //       );
          //       constraintInfo.max = Number(
          //         (constraintInfo.max / (60 * 60)).toFixed(2),
          //       );
          //     }

          //     if (currentUsersCurrentConstraint.units === 'minutes') {
          //       constraintInfo.actual = Number(
          //         (constraintInfo.actual / 60).toFixed(2),
          //       );
          //       constraintInfo.min = Number(
          //         (constraintInfo.min / 60).toFixed(2),
          //       );
          //       constraintInfo.max = Number(
          //         (constraintInfo.max / 60).toFixed(2),
          //       );
          //     }

          //     thisEventInResp.constraints.push(constraintInfo);
          //     continue;
          //   }

          //   // if it is not rolledover
          //   let payload = await getAuthConstraintUserRelation({
          //     authconstraint: currentUsersCurrentConstraint,
          //     userId: user.userId,
          //     date: convertedDate,
          //     roleHierarchy: roleHierarchy,
          //     consequenceRoleHierarchy: consequenceRoleHierarchy,
          //     events: user.events,
          //   });

          //   payload.userPairsRelations.actual += eventDurationInSeconds;

          //   if (
          //     payload.userPairsRelations.actual <
          //     currentUsersCurrentConstraint.min
          //   ) {
          //     continue;
          //   }

          //   let constraintInfo = {
          //     id: currentUsersCurrentConstraint.id,
          //     constraintType: currentUsersCurrentConstraint.constraintType,
          //     description: currentUsersCurrentConstraint.description,
          //     min: currentUsersCurrentConstraint.min,
          //     max: currentUsersCurrentConstraint.max,
          //     minSeconds: currentUsersCurrentConstraint.min,
          //     maxSeconds: currentUsersCurrentConstraint.max,
          //     unit: currentUsersCurrentConstraint.units,
          //     rollover: currentUsersCurrentConstraint.rollover,
          //     date: moment(convertedDate).format('YYYY-MM-DD'),
          //     hard: !currentUsersCurrentConstraint.soft,
          //     antecedentUser: {
          //       id: user.userId,
          //       firstName: user.firstName,
          //       lastName: user.lastName,
          //     },
          //     consequenceUser: {},
          //     event: {},
          //     actual: payload.userPairsRelations.actual,
          //     activity: {
          //       id: payload.userPairsRelations.activity.id,
          //       firstName: payload.userPairsRelations.activity.firstName,
          //     },
          //   };

          //   if (currentUsersCurrentConstraint.units === 'unit') {
          //     constraintInfo.actual = Number(
          //       (constraintInfo.actual / (60 * 15)).toFixed(2),
          //     );
          //     constraintInfo.min = Number(
          //       (constraintInfo.min / (60 * 15)).toFixed(2),
          //     );
          //     constraintInfo.max = Number(
          //       (constraintInfo.max / (60 * 15)).toFixed(2),
          //     );
          //   }
          //   if (currentUsersCurrentConstraint.units === 'hours') {
          //     constraintInfo.actual = Number(
          //       (constraintInfo.actual / (60 * 60)).toFixed(2),
          //     );
          //     constraintInfo.min = Number(
          //       (constraintInfo.min / (60 * 60)).toFixed(2),
          //     );
          //     constraintInfo.max = Number(
          //       (constraintInfo.max / (60 * 60)).toFixed(2),
          //     );
          //   }

          //   if (currentUsersCurrentConstraint.units === 'minutes') {
          //     constraintInfo.actual = Number(
          //       (constraintInfo.actual / 60).toFixed(2),
          //     );
          //     constraintInfo.min = Number((constraintInfo.min / 60).toFixed(2));
          //     constraintInfo.max = Number((constraintInfo.max / 60).toFixed(2));
          //   }

          //   thisEventInResp.constraints.push(constraintInfo);
          // }

          if (
            currentUsersCurrentConstraint.constraintType === 'sessionlength'
          ) {
            //check if the constraint contains this event
            let isItContainingTheEvent = false;
            let eventUsersInConsequencePart = new Array();
            let consequenceUserId =
              currentUsersCurrentConstraint.consequenceUserId;
            let consequenceSubgroupId =
              currentUsersCurrentConstraint.consequenceSubgroupId;
            let consequenceRoleHierarchy = [];
            Object.entries(roleHierarchy).map((t) => {
              const [key, value] = t;
              //push the decendents
              if (
                currentUsersCurrentConstraint.consequenceRole &&
                checkIntersection(
                  [currentUsersCurrentConstraint.consequenceRole.name],
                  value,
                )
              ) {
                consequenceRoleHierarchy.push(key);
              }
            });
            for (let l = 0; l < currentEventResourceIds.length; l++) {
              let currentUser = allUserRoleSubgroupInfo.get(
                currentEventResourceIds[l],
              );

              if (currentUser.id === user.userId) {
                continue;
              }
              //check the id
              if (consequenceUserId) {
                if (currentUser.id !== consequenceUserId) {
                  continue;
                }
              }
              //check the role
              if (consequenceRoleHierarchy.length > 0) {
                let usersRoles = currentUser.roles.map((role) => role.name);
                if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                  continue;
                }
              }

              //check the subgroups
              if (consequenceSubgroupId) {
                let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
                if (
                  !checkIntersection(userSubgroups, [consequenceSubgroupId])
                ) {
                  continue;
                }
              }
              eventUsersInConsequencePart.push({
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              });
              isItContainingTheEvent = true;
              break;
            }

            if (isItContainingTheEvent) {
              let session = {};
              session.actual = eventDurationInSeconds;
              console.log(
                'flimpy2',
                session.actual,
                currentUsersCurrentConstraint.max,
                currentUsersCurrentConstraint.min,
              );
              if (
                session.actual > currentUsersCurrentConstraint.max ||
                (session.actual != 0 &&
                  session.actual < currentUsersCurrentConstraint.min)
              ) {
                console.log('flimpy');
                let constraintInfo = {
                  id: currentUsersCurrentConstraint.id,
                  constraintType: 'sessionlength',
                  description: currentUsersCurrentConstraint.description,
                  min: currentUsersCurrentConstraint.min,
                  max: currentUsersCurrentConstraint.max,
                  minSeconds: currentUsersCurrentConstraint.min,
                  maxSeconds: currentUsersCurrentConstraint.max,
                  unit: currentUsersCurrentConstraint.units,
                  date: moment(convertedDate).format('YYYY-MM-DD'),
                  hard: !currentUsersCurrentConstraint.soft,
                  antecedentUser: {
                    id: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                  },
                  consequenceUser: {},
                  event: {},
                };

                let actualAfterConvertion = session.actual;
                if (currentUsersCurrentConstraint.units === 'unit') {
                  actualAfterConvertion = Number(
                    (session.actual / (60 * 15)).toFixed(2),
                  );
                }
                if (currentUsersCurrentConstraint.units === 'hours') {
                  actualAfterConvertion = Number(
                    (session.actual / (60 * 60)).toFixed(2),
                  );
                }

                if (currentUsersCurrentConstraint.units === 'minutes') {
                  Number(
                    (actualAfterConvertion = session.actual / 60).toFixed(2),
                  );
                }

                (constraintInfo.event.id = currentEVENT.id),
                  (constraintInfo.event.users = eventUsersInConsequencePart),
                  (constraintInfo.event.actual = actualAfterConvertion);
                if (currentUsersCurrentConstraint.units === 'unit') {
                  Number(
                    (constraintInfo.min =
                      constraintInfo.min / (15 * 60)).toFixed(2),
                  );
                  Number(
                    (constraresult.max =
                      constraintInfo.max / (15 * 60)).toFixed(2),
                  );
                }
                if (currentUsersCurrentConstraint.units === 'hours') {
                  Number(
                    (constraintInfo.min =
                      constraintInfo.min / (60 * 60)).toFixed(2),
                  );
                  Number(
                    (constraintInfo.max =
                      constraintInfo.max / (60 * 60)).toFixed(2),
                  );
                }

                if (currentUsersCurrentConstraint.units === 'minutes') {
                  Number(
                    (constraintInfo.min = constraintInfo.min / 60).toFixed(2),
                  );
                  Number(
                    (constraintInfo.max = constraintInfo.max / 60).toFixed(2),
                  );
                }
                thisEventInResp.constraints.push(constraintInfo);
              }
            }
          }

          if (currentUsersCurrentConstraint.constraintType === 'matching') {
            let isItContainingAnyConsequenceUser = false;
            let consequenceUserId =
              currentUsersCurrentConstraint.consequenceUserId;
            let consequenceSubgroupId =
              currentUsersCurrentConstraint.consequenceSubgroupId;
            let consequenceRoleHierarchy = [];
            Object.entries(roleHierarchy).map((t) => {
              const [key, value] = t;
              //push the decendents
              if (
                currentUsersCurrentConstraint.consequenceRole &&
                checkIntersection(
                  [currentUsersCurrentConstraint.consequenceRole.name],
                  value,
                )
              ) {
                consequenceRoleHierarchy.push(key);
              }
            });

            for (let l = 0; l < currentEventResourceIds.length; l++) {
              let currentUser = allUserRoleSubgroupInfo.get(
                currentEventResourceIds[l],
              );

              if (currentUser.id === user.userId) {
                continue;
              }
              //check the id
              if (consequenceUserId) {
                if (currentUser.id !== consequenceUserId) {
                  continue;
                }
              }
              //check the role
              if (consequenceRoleHierarchy.length > 0) {
                let usersRoles = currentUser.roles.map((role) => role.name);
                if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                  continue;
                }
              }

              //check the subgroups
              if (consequenceSubgroupId) {
                let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
                if (
                  !checkIntersection(userSubgroups, [consequenceSubgroupId])
                ) {
                  continue;
                }
              }

              isItContainingAnyConsequenceUser = true;
              break;
            }
            if (!isItContainingAnyConsequenceUser) {
              // fill broken constriants
              thisEventInResp.constraints.push({
                id: currentUsersCurrentConstraint.id,
                constraintType: 'matching',
                description: currentUsersCurrentConstraint.description,
                date: moment(convertedDate).format('YYYY-MM-DD'),
                hard: !currentUsersCurrentConstraint.soft,
                antecedentUser: {
                  id: user.userId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
                consequenceUser: {},
                event: {
                  id: currentEVENT.id,
                },
                actual: 0,
              });
            }
          }

          if (currentUsersCurrentConstraint.constraintType === 'unmatching') {
            let isItContainingAnyConsequenceUser = false;
            let consequenceUserId =
              currentUsersCurrentConstraint.consequenceUserId;
            let consequenceSubgroupId =
              currentUsersCurrentConstraint.consequenceSubgroupId;
            let consequenceRoleHierarchy = [];
            let breakingUsers = new Array();
            Object.entries(roleHierarchy).map((t) => {
              const [key, value] = t;
              //push the decendents
              if (
                currentUsersCurrentConstraint.consequenceRole &&
                checkIntersection(
                  [currentUsersCurrentConstraint.consequenceRole.name],
                  value,
                )
              ) {
                consequenceRoleHierarchy.push(key);
              }
            });

            for (let l = 0; l < currentEventResourceIds.length; l++) {
              let currentUser = allUserRoleSubgroupInfo.get(
                currentEventResourceIds[l],
              );

              if (currentUser.id === user.userId) {
                continue;
              }
              //check the id
              if (consequenceUserId) {
                if (currentUser.id !== consequenceUserId) {
                  continue;
                }
              }
              //check the role
              if (consequenceRoleHierarchy.length > 0) {
                let usersRoles = currentUser.roles.map((role) => role.name);
                if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                  continue;
                }
              }

              //check the subgroups
              if (consequenceSubgroupId) {
                let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
                if (
                  !checkIntersection(userSubgroups, [consequenceSubgroupId])
                ) {
                  continue;
                }
              }
              breakingUsers.push({
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
              });
              isItContainingAnyConsequenceUser = true;
            }

            if (isItContainingAnyConsequenceUser) {
              // fill broken constriants
              thisEventInResp.constraints.push({
                id: currentUsersCurrentConstraint.id,
                constraintType: 'unmatching',
                description: currentUsersCurrentConstraint.description,
                date: moment(convertedDate).format('YYYY-MM-DD'),
                hard: !currentUsersCurrentConstraint.soft,
                antecedentUser: {
                  id: user.userId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
                consequenceUser: {},
                event: {
                  id: currentEVENT.id,
                  breakingUsers: breakingUsers,
                },
                actual: 0,
              });
            }
          }

          if (currentUsersCurrentConstraint.constraintType === 'grouping') {
            let consequenceUserId =
              currentUsersCurrentConstraint.consequenceUserId;
            let consequenceSubgroupId =
              currentUsersCurrentConstraint.consequenceSubgroupId;
            let consequenceRoleHierarchy = [];
            let subgroupIdsOfMainGroup = new Array();
            let subgroupsOfMainGroup = new Array();
            let breakingUsers = new Array();
            for (let k = 0; k < user.subgroups.length; k++) {
              if (
                user.subgroups[k].groupId === currentUsersCurrentConstraint.groupingId
              ) {
                subgroupIdsOfMainGroup.push(user.subgroups[k].id);
                subgroupsOfMainGroup.push(user.subgroups[k]);
              }
            }
            Object.entries(roleHierarchy).map((t) => {
              const [key, value] = t;
              //push the decendents
              if (
                currentUsersCurrentConstraint.consequenceRole &&
                checkIntersection(
                  [currentUsersCurrentConstraint.consequenceRole.name],
                  value,
                )
              ) {
                consequenceRoleHierarchy.push(key);
              }
            });

            for (let l = 0; l < currentEventResourceIds.length; l++) {
              let currentUser = allUserRoleSubgroupInfo.get(
                currentEventResourceIds[l],
              );

              if (currentUser.id === user.userId) {
                continue;
              }
              //check the id
              if (consequenceUserId) {
                if (currentUser.id !== consequenceUserId) {
                  continue;
                }
              }
              //check the role
              if (consequenceRoleHierarchy.length > 0) {
                let usersRoles = currentUser.roles.map((role) => role.name);
                if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
                  continue;
                }
              }

              //check the subgroups
              let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
              if (consequenceSubgroupId) {
                if (
                  !checkIntersection(userSubgroups, [consequenceSubgroupId])
                ) {
                  continue;
                }
              }

              // If it came to this point, currentUser is in consequence set
              // so check if they share common subgroup
              if (checkIntersection(userSubgroups, subgroupIdsOfMainGroup)) {
                continue;
              }

              breakingUsers.push({
                userId: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                subgroups: currentUser.subgroups.map((sbg) => sbg.name)
              });
            }

            if (breakingUsers.length > 0) {
              thisEventInResp.constraints.push({
                id: currentUsersCurrentConstraint.id,
                constraintType: 'grouping',
                description: currentUsersCurrentConstraint.description,
                date: moment(convertedDate).format('YYYY-MM-DD'),
                hard: !currentUsersCurrentConstraint.soft,
                antecedentUser: {
                  id: user.userId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  subgroups: subgroupsOfMainGroup.map((sbg) => sbg.name),
                },
                consequenceUser: {},
                event: {
                  id: currentEVENT.id,
                  breakingUsers: breakingUsers,
                },
                actual: 0,
              });
            }
          }

          // USERTOUSER constraint is commented out because of disabling it temporarily
          // if (currentUsersCurrentConstraint.constraintType === 'usertouser') {
          //   let isItContainingTheEvent = false;
          //   let consequenceUserId =
          //     currentUsersCurrentConstraint.consequenceUserId;
          //   let consequenceSubgroupId =
          //     currentUsersCurrentConstraint.consequenceSubgroupId;
          //   let consequenceRoleHierarchy = [];
          //   let consequenceUserArray = new Array();
          //   Object.entries(roleHierarchy).map((t) => {
          //     const [key, value] = t;
          //     //push the decendents
          //     if (
          //       currentUsersCurrentConstraint.consequenceRole &&
          //       checkIntersection(
          //         [currentUsersCurrentConstraint.consequenceRole.name],
          //         value,
          //       )
          //     ) {
          //       consequenceRoleHierarchy.push(key);
          //     }
          //   });

          //   for (let l = 0; l < currentEventResourceIds.length; l++) {
          //     let currentUser = allUserRoleSubgroupInfo.get(
          //       currentEventResourceIds[l],
          //     );

          //     if (currentUser.id === user.userId) {
          //       continue;
          //     }
          //     //check the id
          //     if (consequenceUserId) {
          //       if (currentUser.id !== consequenceUserId) {
          //         continue;
          //       }
          //     }
          //     //check the role
          //     if (consequenceRoleHierarchy.length > 0) {
          //       let usersRoles = currentUser.roles.map((role) => role.name);
          //       if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
          //         continue;
          //       }
          //     }

          //     //check the subgroups
          //     if (consequenceSubgroupId) {
          //       let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
          //       if (
          //         !checkIntersection(userSubgroups, [consequenceSubgroupId])
          //       ) {
          //         continue;
          //       }
          //     }
          //     consequenceUserArray.push({
          //       userId: currentUser.id,
          //       firstName: currentUser.firstName,
          //       lastName: currentUser.lastName,
          //     });
          //     isItContainingTheEvent = true;
          //   }

          //   if (isItContainingTheEvent) {
          //     if (currentUsersCurrentConstraint.frequency !== 'session') {
          //       // if it is not session frequency constraint
          //       let payload = await getUserToUserFrequencyConstraintRelation({
          //         userToUserFrequencyConstraint: currentUsersCurrentConstraint,
          //         userId: user.userId,
          //         date: convertedDate,
          //         roleHierarchy: roleHierarchy,
          //         consequenceRoleHierarchy: consequenceRoleHierarchy,
          //         events: false,
          //       });

          //       // remove duplicates after adding the currentEVENT users
          //       for (let u = 0; u < consequenceUserArray.length; u++) {
          //         let uId = consequenceUserArray[u].userId;
          //         let isItAlreadyExisting = false;
          //         for (let w = 0; w < payload.usersWorkedWith.length; w++) {
          //           if (payload.usersWorkedWith[w].userId === uId) {
          //             isItAlreadyExisting = true;
          //             break;
          //           }
          //         }

          //         if (!isItAlreadyExisting) {
          //           payload.usersWorkedWith.push(consequenceUserArray[u]);
          //         }
          //       }

          //       payload.actualWorkedUserNumber = payload.usersWorkedWith.length;

          //       if (
          //         payload.actualWorkedUserNumber >
          //           currentUsersCurrentConstraint.max ||
          //         payload.actualWorkedUserNumber <
          //           currentUsersCurrentConstraint.min
          //       ) {
          //         thisEventInResp.constraints.push({
          //           id: currentUsersCurrentConstraint.id,
          //           constraintType: 'usertouser',
          //           description: currentUsersCurrentConstraint.description,
          //           min: currentUsersCurrentConstraint.min,
          //           max: currentUsersCurrentConstraint.max,
          //           date: moment(convertedDate).format('YYYY-MM-DD'),
          //           hard: !consequenceRoleHierarchy.soft,
          //           antecedentUser: {
          //             id: user.userId,
          //             firstName: user.firstName,
          //             lastName: user.lastName,
          //           },
          //           event: {},
          //           consequenceUser: {},
          //           usersWorkedWith: payload.usersWorkedWith,
          //           actual: payload.usersWorkedWith.length,
          //         });
          //       }
          //     } else {
          //       //check for session frequency constraints
          //       if (
          //         consequenceUserArray.length >
          //           currentUsersCurrentConstraint.max ||
          //         consequenceUserArray.length <
          //           currentUsersCurrentConstraint.min
          //       ) {
          //         thisEventInResp.constraints.push({
          //           id: currentUsersCurrentConstraint.id,
          //           constraintType: 'usertouser',
          //           description: currentUsersCurrentConstraint.description,
          //           min: currentUsersCurrentConstraint.min,
          //           max: currentUsersCurrentConstraint.max,
          //           date: moment(convertedDate).format('YYYY-MM-DD'),
          //           hard: !currentUsersCurrentConstraint.soft,
          //           antecedentUser: {
          //             id: user.userId,
          //             firstName: user.firstName,
          //             lastName: user.lastName,
          //           },
          //           event: {
          //             id: currentEVENT.id,
          //             usersWorkedWith: consequenceUserArray,
          //           },
          //           consequenceUser: {},
          //           usersWorkedWith: {},
          //           actual: consequenceUserArray.length,
          //         });
          //       }
          //     }
          //   }
          // }

          // USERTOSESSION constraint is commented out because of disabling it temporarily
          // if (
          //   currentUsersCurrentConstraint.constraintType === 'usertosession'
          // ) {
          //   //check if the constraint contains this event
          //   let isItContainingTheEvent = false;
          //   let consequenceUserId =
          //     currentUsersCurrentConstraint.consequenceUserId;
          //   let consequenceSubgroupId =
          //     currentUsersCurrentConstraint.consequenceSubgroupId;
          //   let consequenceUsersOfThisEvent = new Array();
          //   let consequenceRoleHierarchy = [];
          //   Object.entries(roleHierarchy).map((t) => {
          //     const [key, value] = t;
          //     //push the decendents
          //     if (
          //       currentUsersCurrentConstraint.consequenceRole &&
          //       checkIntersection(
          //         [currentUsersCurrentConstraint.consequenceRole.name],
          //         value,
          //       )
          //     ) {
          //       consequenceRoleHierarchy.push(key);
          //     }
          //   });
          //   for (let l = 0; l < currentEventResourceIds.length; l++) {
          //     let currentUser = allUserRoleSubgroupInfo.get(
          //       currentEventResourceIds[l],
          //     );

          //     if (currentUser.id === user.userId) {
          //       continue;
          //     }
          //     //check the id
          //     if (consequenceUserId) {
          //       if (currentUser.id !== consequenceUserId) {
          //         continue;
          //       }
          //     }
          //     //check the role
          //     if (consequenceRoleHierarchy.length > 0) {
          //       let usersRoles = currentUser.roles.map((role) => role.name);
          //       if (!checkIntersection(usersRoles, consequenceRoleHierarchy)) {
          //         continue;
          //       }
          //     }

          //     //check the subgroups
          //     if (consequenceSubgroupId) {
          //       let userSubgroups = currentUser.subgroups.map((sbg) => sbg.id);
          //       if (
          //         !checkIntersection(userSubgroups, [consequenceSubgroupId])
          //       ) {
          //         continue;
          //       }
          //     }

          //     isItContainingTheEvent = true;
          //     consequenceUsersOfThisEvent.push(currentUser.id);
          //   }

          //   if (isItContainingTheEvent) {
          //     let payload = await getUserToSessionFrequencyConstraintRelation({
          //       userToSessionFrequencyConstraint: currentUsersCurrentConstraint,
          //       userId: user.userId,
          //       date: convertedDate,
          //       roleHierarchy: roleHierarchy,
          //       consequenceRoleHierarchy: consequenceRoleHierarchy,
          //       events: false,
          //     });

          //     //check for total relationsip
          //     for (let p = 0; p < payload.totalRelation.length; p++) {
          //       let total = payload.totalRelation[p];
          //       total.actual += 1;
          //       if (
          //         total.actual > currentUsersCurrentConstraint.max ||
          //         total.actual < currentUsersCurrentConstraint.min
          //       ) {
          //         thisEventInResp.constraints.push({
          //           id: currentUsersCurrentConstraint.id,
          //           constraintType: 'usertosession',
          //           description: currentUsersCurrentConstraint.description,
          //           min: currentUsersCurrentConstraint.min,
          //           max: currentUsersCurrentConstraint.max,
          //           date: moment(convertedDate).format('YYYY-MM-DD'),
          //           hard: !currentUsersCurrentConstraint.soft,
          //           antecedentUser: {
          //             id: user.userId,
          //             firstName: user.firstName,
          //             lastName: user.lastName,
          //           },
          //           consequenceUser: {},
          //           event: {},
          //           actual: total.actual,
          //         });
          //       }
          //     }

          //     //check individual relations
          //     for (let p = 0; p < payload.userPairsRelations.length; p++) {
          //       let userConsequence = payload.userPairsRelations[p];
          //       if (
          //         !consequenceUsersOfThisEvent.includes(userConsequence.userId)
          //       ) {
          //         continue;
          //       }
          //       userConsequence.actual += 1;
          //       if (
          //         userConsequence.actual > currentUsersCurrentConstraint.max ||
          //         userConsequence.actual < currentUsersCurrentConstraint.min
          //       ) {
          //         if (
          //           checkIntersection(userIdArray, [userConsequence.userId])
          //         ) {
          //           thisEventInResp.constraints.push({
          //             id: currentUsersCurrentConstraint.id,
          //             constraintType: 'usertosession',
          //             description: currentUsersCurrentConstraint.description,
          //             min: currentUsersCurrentConstraint.min,
          //             max: currentUsersCurrentConstraint.max,
          //             date: moment(convertedDate).format('YYYY-MM-DD'),
          //             hard: !currentUsersCurrentConstraint.soft,
          //             antecedentUser: {
          //               id: user.userId,
          //               firstName: user.firstName,
          //               lastName: user.lastName,
          //             },
          //             consequenceUser: {
          //               id: userConsequence.userId,
          //               firstName: userConsequence.firstName,
          //               lastName: userConsequence.lastName,
          //             },
          //             event: {},
          //             actual: userConsequence.actual,
          //           });
          //         }
          //       }
          //     }
          //   }
          // }
        }

        // check sibling branch constraint
        if (!user.isPerson) {
          continue;
        }

        let conflictingUserPairs = new Array();
        for (let p = 0; p < currentEventResourceIds.length; p++) {
          let secondUser = allUserRoleSubgroupInfo.get(
            currentEventResourceIds[p],
          );
          if (
            !secondUser.isPerson ||
            currentEventResourceIds[p] === user.userId
          ) {
            continue;
          }
          let branchIdsOfuser = secondUser.branches.map((br) => br.id);
          if (!checkIntersection(branchIdsOfuser, user.branchList)) {
            conflictingUserPairs.push({
              id: secondUser.id,
              firstName: secondUser.firstName,
              lastName: secondUser.lastName,
            });
          }
        }

        if (conflictingUserPairs.length > 0) {
          thisEventInResp.constraints.push({
            id: uuidv4(),
            constraintType: 'siblingBranch',
            description: 'Not in same Branch',
            min: 0,
            max: 0,
            date: moment(convertedDate).format('YYYY-MM-DD'),
            hard: true,
            antecedentUser: {
              id: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            conflictingUser: conflictingUserPairs,
          });
        }
      }

      response.push(thisEventInResp);
    }

    console.timeEnd('Rest calculation logic: ');

    let response_obj = {};
    response.forEach((r) => {
      response_obj = { ...response_obj, [r.id]: r };
    });

    res.status(200).send(response_obj);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
