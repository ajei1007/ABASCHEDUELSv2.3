const express = require('express');
const EventsDBApi = require('../db/api/events');
const BranchesDBApi = require('../db/api/branches');
const AvailabilitiesDBApi = require('../db/api/availabilities');
const UsersDBApi = require('../db/api/users');
const moment = require('moment');

const wrapAsync = require('../helpers').wrapAsync;

const { getRoleHierarchy } = require('../utils/roleHierarchy');
const { getEmployeeClientNumber } = require('../utils/getEmployeeClientCount');

const router = require('../utils/createRouter')();

router.get(
  '/role-hierarchy',
  wrapAsync(async (req, res) => {
    const roleHierarchy = await getRoleHierarchy(req.query.companyId);
    res.status(200).send(roleHierarchy);
  }),
);

router.get(
  '/branch-hierarchy',
  wrapAsync(async (req, res) => {
    let response = [];
    if (req.query.branches) {
      const branchList = await BranchesDBApi.getDescendentBranches({
        branchIds: req.query.branches,
      });
      response = branchList;
    }

    res.status(200).send(response);
  }),
);

router.get(
  '/events-day',
  wrapAsync(async (req, res) => {
    let branches = [];
    let roles = [];
    let subgroups = [];
    let users = [];

    if (req.query.branches) {
      branches = req.query.branches;
    }

    if (req.query.users) {
      users = req.query.users;
    }

    if (req.query.subgroups) {
      subgroups = req.query.subgroups;
    }

    if (req.query.roles) {
      roles = req.query.roles;
    }

    if (!req.query.companyId || !req.query.start || !req.query.end) {
      res
        .status(400)
        .send({ code: 400, mmessage: 'request form is incorrect' });
      return;
    }
    const companyID = req.query.companyId;
    const start = moment(req.query.start).toDate();
    const end = moment(req.query.end).toDate();

    const eventsForDay = await EventsDBApi.findAllEventsForDashboardDay({
      companyId: companyID,
      start: start,
      end: end,
      branches: branches,
      subgroups: subgroups,
      roles: roles,
      users: users,
    });

    const filteredEvents = eventsForDay.rows.filter((e) => !e.isCancelled);

    res.status(200).send({
      code: 200,
      data: {
        rows: filteredEvents,
        count: filteredEvents.length,
      },
    });
  }),
);

router.get(
  '/events-week',
  wrapAsync(async (req, res) => {
    let branches = [];
    let roles = [];
    let subgroups = [];

    if (req.query.branches) {
      branches = req.query.branches;
    }

    if (req.query.subgroups) {
      subgroups = req.query.subgroups;
    }

    if (req.query.roles) {
      roles = req.query.roles;
    }

    if (!req.query.companyId || !req.query.start || !req.query.end) {
      res
        .status(400)
        .send({ code: 400, mmessage: 'request form is incorrect' });
      return;
    }
    const companyID = req.query.companyId;
    const start = moment(req.query.start).toDate();
    const end = moment(req.query.end).toDate();

    const eventsForWeek = await EventsDBApi.findAllEventsForDashboardDateRange({
      companyId: companyID,
      start: start,
      end: end,
      branches: branches,
      subgroups: subgroups,
      roles: roles,
      users: [],
      includeLocations: true,
    });

    const filteredEvents = eventsForWeek.rows.filter((e) => !e.isCancelled);

    res.status(200).send({
      code: 200,
      data: {
        rows: filteredEvents,
        count: filteredEvents.length,
      },
    });
  }),
);

router.get(
  '/availabilities-day',
  wrapAsync(async (req, res) => {
    let branches = [];
    let roles = [];
    let subgroups = [];
    let users = [];

    if (req.query.branches) {
      branches = req.query.branches;
    }

    if (req.query.users) {
      users = req.query.users;
    }

    if (req.query.subgroups) {
      subgroups = req.query.subgroups;
    }

    if (req.query.roles) {
      roles = req.query.roles;
    }

    if (
      !req.query.companyId ||
      !req.query.start ||
      !req.query.end ||
      !req.query.firstDayID ||
      !req.query.secondDayID
    ) {
      res
        .status(400)
        .send({ code: 400, mmessage: 'request form is incorrect' });
      return;
    }
    const companyID = req.query.companyId;
    const start = moment(req.query.start).toDate();
    const end = moment(req.query.end).toDate();

    const availabilitiesForDay =
      await AvailabilitiesDBApi.findAllAvailabilitiesOfDay({
        companyId: companyID,
        start: start,
        end: end,
        branches: branches,
        subgroups: subgroups,
        firstDayOfWeek: req.query.firstDayID,
        secondDayOfWeek: req.query.secondDayID,
        roles: roles,
        users: users,
      });

    res.status(200).send({
      code: 200,
      data: availabilitiesForDay,
    });
  }),
);

router.get(
  '/availabilities-week',
  wrapAsync(async (req, res) => {
    let branches = [];
    let roles = [];
    let subgroups = [];
    let users = [];

    if (req.query.branches) {
      branches = req.query.branches;
    }

    if (req.query.users) {
      users = req.query.users;
    }

    if (req.query.subgroups) {
      subgroups = req.query.subgroups;
    }

    if (req.query.roles) {
      roles = req.query.roles;
    }

    if (!req.query.companyId || !req.query.start || !req.query.end) {
      res
        .status(400)
        .send({ code: 400, mmessage: 'request form is incorrect' });
      return;
    }
    const companyID = req.query.companyId;
    const start = moment(req.query.start).toDate();
    const end = moment(req.query.end).toDate();

    const availabilitiesForWeek =
      await AvailabilitiesDBApi.findAllAvailabilitiesOfWeek({
        companyId: companyID,
        start: start,
        end: end,
        branches: branches,
        subgroups: subgroups,
        roles: roles,
        users: users,
      });

    res.status(200).send({
      code: 200,
      data: availabilitiesForWeek,
    });
  }),
);

router.get(
  '/cancelled-event-ids',
  wrapAsync(async (req, res) => {
    let dates = [];
    if (!req.query.dates) {
      res.status(400).send({ code: 400, mmessage: 'bad request' });
      return;
    }

    dates = req.query.dates;

    const canceledEventIdsOfDay =
      await EventsDBApi.findCancelledEventIdsOfDates(dates);
    res.status(200).send({
      code: 200,
      data: canceledEventIdsOfDay,
    });
  }),
);

router.get(
  '/cancelled-event-id-dates',
  wrapAsync(async (req, res) => {
    let dates = [];
    if (!req.query.dates) {
      res.status(400).send({ code: 400, mmessage: 'bad request' });
      return;
    }

    dates = req.query.dates;

    const result = await EventsDBApi.findCancelledEventIdsOfWeek(dates);
    res.status(200).send({
      code: 200,
      data: result,
    });
  }),
);

router.get(
  '/employee-client-count',
  wrapAsync(async (req, res) => {
    let branches = [];
    let subgroups = [];

    if (!req.query.companyId) {
      res.status(400).send({ code: 400, mmessage: 'bad request' });
      return;
    }

    if (req.query.branches) {
      branches = req.query.branches;
    }

    if (req.query.subgroups) {
      subgroups = req.query.subgroups;
    }

    const userCount = await getEmployeeClientNumber(
      req.query.companyId,
      branches,
      subgroups,
    );

    res.status(200).send({
      code: 200,
      data: userCount,
    });
  }),
);

router.get(
  '/users-for-activity-table',
  wrapAsync(async (req, res) => {
    let branches = [];
    let subgroups = [];
    let roles = [];
    let users = [];

    if (!req.query.companyId) {
      res.status(400).send({ code: 400, mmessage: 'bad request' });
      return;
    }

    if (req.query.branches) {
      branches = req.query.branches;
    }

    if (req.query.subgroups) {
      subgroups = req.query.subgroups;
    }

    if (req.query.roles) {
      roles = req.query.roles;
    }

    if (req.query.users) {
      users = req.query.users;
    }

    const userList = await UsersDBApi.findAllUsersAccordingBranchRoleSubgroup({
      companyId: req.query.companyId,
      branches: branches,
      subgroups: subgroups,
      roles: roles,
      users: users,
    });

    res.status(200).send({
      code: 200,
      data: userList,
    });
  }),
);

module.exports = router;
