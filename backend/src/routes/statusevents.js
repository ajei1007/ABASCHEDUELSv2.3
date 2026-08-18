const express = require('express');
const StatuseventsService = require('../services/statusevents');
const StatuseventsDBApi = require('../db/api/statusevents');
const CancellationsService = require('../services/cancellations');
const { v4: uuidv4 } = require('uuid');
const EventsService = require('../services/events');
const wrapAsync = require('../helpers').wrapAsync;
const getEventsForDay = require('../utils/statistcs/getEventsForDay');
const getDescendentBranches = require('../utils/statistcs/getBranchHierarchy');
const moment = require('moment');
const EventsDBApi = require('../db/api/events');
const isEventRecurring = require('../utils/isEventRecurring');
const rule_RRule = require('rrule');

const router = require('../utils/createRouter')();

// TODO make it reusable
router.post(
  '/',
  wrapAsync(async (req, res, next) => {
  const reqBody = req.body.data;
  const event = await EventsDBApi.findBy({
    id: reqBody.event,
  });

  let toBeAdded = [];
  let toBeUpdated = [];
  if (event) {
    // Format here
    let parsedEvent = JSON.parse(JSON.stringify(event));
    parsedEvent.users = [...new Set(parsedEvent?.users?.map((u) => u?.id))];
    if (isEventRecurring(parsedEvent.endRecur, parsedEvent.startRecur)) {
      if (parsedEvent.supervision) {
        parsedEvent.supervision.users = parsedEvent.supervision.users.map(
          (user) => user?.id,
        );
        parsedEvent.supervision.cancelledByUserId =
          parsedEvent.supervision?.cancelledByUser?.id ?? null;
        parsedEvent.supervision.cancellationReasonId =
          parsedEvent.supervision?.cancellationReason?.id ?? null;
        parsedEvent.supervision.isCancelled =
          parsedEvent.supervision?.isCancelled ?? false;
      }

      const startDate = moment(reqBody.startdatetime);
      const startDatePlusOneDay = moment(reqBody.startdatetime).add(1, 'days');

      // Add past events
      if (
        moment(startDate.format('YYYY-MM-DD')).isSame(
          parsedEvent.startRecur,
        ) === false
      ) {
        toBeAdded.push({
          ...parsedEvent,
          id: uuidv4(),
          endRecur: startDate.format('YYYY-MM-DD'),
        });
      }
      // add future recurring events
      if (
        isEventRecurring(parsedEvent.endRecur, startDate.format('YYYY-MM-DD'))
      ) {
        toBeAdded.push({
          ...parsedEvent,
          id: uuidv4(),
          startRecur: startDatePlusOneDay.format('YYYY-MM-DD'),
        });
      }
      // update event for today
      toBeUpdated.push({
        ...parsedEvent,
        startRecur: startDate.format('YYYY-MM-DD'),
        endRecur: startDatePlusOneDay.format('YYYY-MM-DD'),
      });

      // Add events
      for (const data of toBeAdded) {
        // we shouldnt set any supervisionId before the actual creation of supervision
        if (data.supervisionId){
          data.supervisionId = null
        }

        // create event with same eventGroupId for left/right
        const newEvent = await EventsService.create(
          data,
          req.currentUser,
          req.body.pushNotification,
          true,
          req.headers.referer,
        );
        const supervisionEvent = data?.supervision;
        if (supervisionEvent && newEvent) {
          const supervisionEventData = {
            ...data,
            ...supervisionEvent,
            id: uuidv4(),
            eventGroupId: uuidv4()
          };
          // create supervision event for left/right specifically with new id and eventGroupId
          await EventsService.create(
            supervisionEventData,
            req.currentUser,
            req?.body?.pushNotification,
            true,
            req.headers.referer,
          );
          await EventsDBApi.updateSupervision(
            newEvent.id,
            supervisionEvent?.id,
          );
        }
      }

      // Update events
      for (const data of toBeUpdated) {
        const payload = await EventsService.update(
          data,
          data.id,
          req.currentUser,
          req.body.pushNotification,
          next,
        );
        const updatedEvent = payload.updatedEvent;

        const supervisionEvent = data?.supervision;
        if (supervisionEvent && updatedEvent) {
          const supervisionEventData = {
            ...data,
            ...supervisionEvent,
          };
          await EventsService.update(
            supervisionEventData,
            supervisionEvent.id,
            req.currentUser,
            req?.body?.pushNotification,
            next,
          );
        }
      }
    }
  }
  let payload = await StatuseventsService.create(
    reqBody,
    req.currentUser,
    true,
    req.headers.referer,
  );
  res.status(200).send(payload);
}));

router.put(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await StatuseventsService.update(
      req.body.data,
      req.body.id,
      req.currentUser,
    );
    return res.status(200).send(payload);
  }),
);

router.put(
  '/status/multiple',
  wrapAsync(async (req, res) => {
    const body = req.body;
    const existingCancellationRequests = await StatuseventsDBApi.findAllForConfirmation({
      ...req.query,
      includeEvent: true,
      companyId: req.currentUser.companyId,
      ids: body.map((t) => t.id).join('|'),
    });
    const cancellationRequests = existingCancellationRequests.map(c => {
      const updatedReq = body.find(r => r.id === c.id);
      return {
        ...c,
        ...updatedReq,
      }
    })

    if (cancellationRequests && cancellationRequests.length) {
      for (const data of cancellationRequests) {
        await StatuseventsService.updateStatus(data, data.id, req.currentUser);
      }
      if (cancellationRequests[0].status === 'Canceled') {
        let cancellationArray = cancellationRequests.map((obj) => ({
          eventId: obj.eventId || null,
          eventGroupId: obj.event.eventGroupId,
          cancelledByUserId: obj.userId || null,
          cancellationReasonId: obj.reasonId || null,
        }));
        await EventsService.cancelBulk(cancellationArray, req.currentUser); 
      }
    }

    return res.status(200).send(true);
  }),
);

router.delete(
  '/:id',
  wrapAsync(async (req, res) => {
    await StatuseventsService.remove(req.params.id, req.currentUser);
    const payload = true;
    res.status(200).send(payload);
  }),
);

router.get(
  '/',
  wrapAsync(async (req, res) => {
    res.status(200).send({
      rows: [],
      count: 0,
    });
  }),
);

router.get(
  '/new',
  wrapAsync(async (req, res) => {
    const payload = await StatuseventsDBApi.findAllForConfirmation({
      ...req.query,
      includeEvent: true,
      includeEventUsers: true,
      companyId: req.currentUser.companyId,
    });
    res.status(200).send(payload);
  }),
);

router.get(
  '/confirmations',
  wrapAsync(async (req, res) => {
    let startUtc = moment.utc(req.query.start).toDate();
    let endUtc = moment.utc(req.query.start).add(1, 'days').toDate();
    req.query.start = moment.utc(req.query.start).startOf('day').toDate();
    req.query.end = moment
      .utc(req.query.start)
      .startOf('day')
      .add(1, 'days')
      .toDate();

    let result = new Array();

    //set branch set
    if (req.query.branches) {
      // Fetch from backend
      branchList = await getDescendentBranches(req.query.branches);
    }

    // Fetch from backend
    let groupedByEventId = new Map();
    let todaysEventIds = new Array();
    const eventListData = await getEventsForDay(
      startUtc,
      endUtc,
      req.currentUser.companyId,
      branchList,
      [],
      [],
      [],
    );
    let startDayOfWeek = startUtc.getDay();
    let endDayOfWeek = endUtc.getDay();
    let eventsForDay = eventListData.data;

    // populate event and check if that falls in today
    for (let i = 0; i < eventsForDay.count; i++) {
      let event = eventsForDay.rows[i];

      // generate the rule of event
      const startRule = moment
        .utc(
          event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'),
          'YYYY-MM-DD HH:mm',
        )
        .format();
      const endRule = moment.utc(event.endRecur).format('YYYY-MM-DD');
      let weekDaysOfEvent = [];

      // set the weekdays of rule
      if (event.M) {
        if (startDayOfWeek === 1 || endDayOfWeek === 1) {
          weekDaysOfEvent.push(0);
        }
      }
      if (event.T) {
        if (startDayOfWeek === 2 || endDayOfWeek === 2) {
          weekDaysOfEvent.push(1);
        }
      }
      if (event.W) {
        if (startDayOfWeek === 3 || endDayOfWeek === 3) {
          weekDaysOfEvent.push(2);
        }
      }

      if (event.R) {
        if (startDayOfWeek === 4 || endDayOfWeek === 4) {
          weekDaysOfEvent.push(3);
        }
      }

      if (event.F) {
        if (startDayOfWeek === 5 || endDayOfWeek === 5) {
          weekDaysOfEvent.push(4);
        }
      }

      if (event.S) {
        if (startDayOfWeek === 6 || endDayOfWeek === 6) {
          weekDaysOfEvent.push(5);
        }
      }
      if (event.U) {
        if (startDayOfWeek === 0 || endDayOfWeek === 0) {
          weekDaysOfEvent.push(6);
        }
      }

      if (weekDaysOfEvent.length === 0) {
        continue;
      }

      const fr = event?.frequency?.toUpperCase() ?? 'WEEKLY';
      let rruleObject = {
        freq: rule_RRule.RRule[fr],
        interval: event.interval,
        byweekday: weekDaysOfEvent,
        dtstart: new Date(startRule),
        until: new Date(endRule),
      };

      if (event.bysetpos !== null) {
        rruleObject = {
          ...rruleObject,
          bysetpos: Number(event.bysetpos),
        };
      }

      let rule = new rule_RRule.RRule(rruleObject);

      // get all recurring events
      let allEventsFallingForToday = rule.between(startUtc, endUtc);
      if (allEventsFallingForToday.length > 0) {
        if (!groupedByEventId.has(event.id)) {
          groupedByEventId.set(event.id, {
            actualUsers: event.users,
            confirmedUsers: new Array(),
            actualEvent: event,
          });
        }
        todaysEventIds.push(event.id);
        continue;
      }
    }

    // get confirmed statusevents of that events
    const payload = await StatuseventsDBApi.findAllForConfirmation({
      event: todaysEventIds.join('|'),
      includeEvent: false,
      includeEventUsers: false,
      status: 'Confirmed',
      companyId: req.currentUser.companyId,
    });

    // fill the confirmed users of each event
    for (let i = 0; i < payload.length; i++) {
      let eventDataInGroup = groupedByEventId.get(payload[i].eventId);
      payload[i].event = eventDataInGroup.actualEvent;
      eventDataInGroup.confirmedUsers.push(payload[i]);
    }

    // add confirmed and non-conformed statusevents into response
    for (const [_, groupedEvent] of groupedByEventId) {
      //add confirmed users
      let confUsers = new Array();
      for (let j = 0; j < groupedEvent.confirmedUsers.length; j++) {
        result.push(groupedEvent.confirmedUsers[j]);
        confUsers.push(groupedEvent.confirmedUsers[j].userId);
        template = { ...groupedEvent.confirmedUsers[j] };
      }

      //add non-confirmed users
      for (let k = 0; k < groupedEvent.actualUsers.length; k++) {
        let currentUserId = groupedEvent.actualUsers[k].id;
        let isConfirmed = false;
        for (let m = 0; m < groupedEvent.confirmedUsers.length; m++) {
          if (currentUserId === groupedEvent.confirmedUsers[m].userId) {
            isConfirmed = true;
            break;
          }
        }

        if (!isConfirmed) {
          let m = {};
          m.id = '';
          m.status = 'Pending Confirmation';
          m.userId = currentUserId;
          m.note = '';
          m.user = groupedEvent.actualUsers[k];
          m.event = groupedEvent.actualEvent;
          result.push(m);
        }
      }
    }


    res.status(200).send(result);
  }),
);

router.get('/autocomplete', async (req, res) => {
  const payload = await StatuseventsDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
  );

  res.status(200).send(payload);
});

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const payload = await StatuseventsDBApi.findBy({ id: req.params.id });

    res.status(200).send(payload);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
