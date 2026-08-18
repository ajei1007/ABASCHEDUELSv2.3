const db = require('../db/models');
const EventsDBApi = require('../db/api/events');
/* Push Notification */
const {
  sendMultipleEventNotifications,
} = require('../utils/pushNotifications');
const ValidationError = require('./notifications/errors/validation');
const validateTimeAndDate = require('../utils/validateTimeAndDate');
const validateEventInputData = require('../utils/validateEventInputData');
const subtractDateDifference = require('../utils/subtractDateDifference');
const getWeekDayIdsFromWeekdayNumber = require('../utils/getWeekDayIdsFromWeekdayNumber');
const getWeekDayIdsBetweenDates = require('../utils/getWeekDayIdsBetweenDates');
const { getIntersectionArray } = require('../utils/arrayIntersections');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');
const { v4: uuidv4 } = require('uuid');


const getAdjustedDaysOfWeek = ({ startDate, endDate, daysOfWeek }) => {
  const possibleDaysOfWeek = getWeekDayIdsBetweenDates(startDate, endDate);
  return getIntersectionArray(daysOfWeek, possibleDaysOfWeek);
};

module.exports = class EventsService {
  // it just creates event that is all
  static async create(data, currentUser, pushNotification) {
    const transaction = await db.sequelize.transaction();
    try {
      validateEventInputData(data)
      validateTimeAndDate(data, 'events');

      const event = await EventsDBApi.create(data, {
        currentUser,
        transaction,
      });

      if (pushNotification?.send && pushNotification?.to?.length > 0) {
        sendMultipleEventNotifications(
          pushNotification.to,
          event,
          currentUser,
          pushNotification?.message,
          'created',
        );
      }

      await transaction.commit();
      return event;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // EventsService.js
static async bulkCreate(rawEvents, currentUser, pushNotification) {
  /** Build a flat array of rows ready for INSERT */
  const rowsBaseEvent = [];
  const rowsSupervisionEvent = [];

  for (const wrapper of rawEvents) {
    // ── base event ─────────────────────────────────────────────
    const base = {
      ...wrapper.data,
      supervisionId: null,
    };

    // run the SAME validations you use in single-create
    validateEventInputData(base);
    validateTimeAndDate(base, 'events');

    // ── supervision copy (optional) ────────────────────────────
    if (wrapper.data?.supervisionEvent) {
      const supId = uuidv4();
      const sup = {
        ...base,
        ...wrapper.data.supervisionEvent,
        id: supId,
        eventGroupId: uuidv4(),
      };
      
      base.supervisionId = supId
      rowsSupervisionEvent.push(sup);
    }
    rowsBaseEvent.push(base);
  }
 

  // ── one trip to DB inside one transaction ────────────────────
  const tx = await db.sequelize.transaction();
  try {
    const createdSupervisionEvents = await EventsDBApi.bulkCreate(rowsSupervisionEvent, { 
      currentUser,
      transaction: tx,
    });

    const createdBaseEvents = await EventsDBApi.bulkCreate(rowsBaseEvent, {
      currentUser,
      transaction: tx,
    });
    // merge supervision events with base events
   const created = [...createdBaseEvents, ...createdSupervisionEvents];

    if (pushNotification?.send && pushNotification?.to?.length) {
      sendMultipleEventNotifications(
        pushNotification.to,
        created,
        currentUser,
        pushNotification.message,
        'created'
      );
    }

    await tx.commit();
    return created;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}


  // it just updates event that is all
  static async update(data, id, currentUser, pushNotification, next) {
    const transaction = await db.sequelize.transaction();
    try {
      let existingEvent = await EventsDBApi.findBy({ id }, { transaction });

      if (!existingEvent) {
        throw new ValidationError('events.notFound');
      }
      validateEventInputData(data)
      validateTimeAndDate(data, 'events');
      
      const updatedEvent = await EventsDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      if (pushNotification?.send && pushNotification?.to?.length > 0) {
        sendMultipleEventNotifications(
          pushNotification.to,
          updatedEvent,
          currentUser,
          pushNotification?.message,
          'updated',
        );
      }
      await transaction.commit();
      return {
        updatedEvent,
        oldEvent: existingEvent,
      };
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async updateLevelRRULE(data, isolationGroupId, currentUser, pushNotification, next, additionalIds) {
    const transaction = await db.sequelize.transaction();
    try {
      if (!data.eventGroupId) {
        throw new ValidationError('events.notFound');
      }

      const allEventsOfGroup = await EventsDBApi.findByGroupIds({
        eventGroupIds: data.eventGroupId,
        companyId: currentUser.companyId || '',
      });

      if (allEventsOfGroup.length === 0) {
        throw new ValidationError('events.notFound');
      }
      validateEventInputData(data);
      validateTimeAndDate(data, 'events');

      // adjust the daysOfWeek based on the new startRecur and endRecur
      const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
        startDate: data.startRecur,
        endDate: data.endRecur,
        daysOfWeek: data.daysOfWeek,
      });

      if (adjustedDaysOfWeek.length === 0) {
        throw new ValidationError('events.invalidDaysOfWeek');
      }

      data = {
        ...data,
        daysOfWeek: adjustedDaysOfWeek,
      };

      let deletedEvents = [];
      let createdEvents = [];
      let updatedEvents = [];
      let toBeDeletedIds = [];
      let allAffectedIds = []

      // If the group was containing only 1 event
      // then just update it
      if (allEventsOfGroup.length === 1){
        let oldEvent = allEventsOfGroup[0]
        const copyOfData = { ...data };

        let newHasSupervision = false;
        let oldHasSupervision = false;
        if (oldEvent.supervisionId) {
          oldHasSupervision = true;
        }

        if (copyOfData?.supervisionEvent) {
          newHasSupervision = true;
        }

        // if there is supervision after update, we need to create if there is no in old
        if (newHasSupervision && !oldHasSupervision) {
          // set random uuid for making new one
          const supervisionEvent = data?.supervisionEvent;
          supervisionEvent.id = uuidv4();
          supervisionEvent.eventGroupId = uuidv4();

          const supervisionEventData = {
            ...copyOfData,
            ...supervisionEvent,
          };
          supervisionEventData.supervisionId = null

          // create new supervisionEvent
          const newSupervisionEvent = await EventsDBApi.create(
            supervisionEventData,
            {
              currentUser,
              transaction,
            },
          );
          if (newSupervisionEvent) {
            copyOfData.supervisionId = newSupervisionEvent.id;
            createdEvents.push(newSupervisionEvent.id);
            // add new supervisionId to allAffectedIds
            allAffectedIds.push(newSupervisionEvent.id);
          }
        }

        // if there is supervision after update, we need to update if there is already in old
        if (newHasSupervision && oldHasSupervision) {
          // set random uuid for making new one
          const supervisionEvent = copyOfData?.supervisionEvent;
          supervisionEvent.eventGroupId = uuidv4();

          const supervisionEventData = {
            ...copyOfData,
            ...supervisionEvent,
          };

          supervisionEventData.id = oldEvent.supervisionId
          supervisionEventData.supervisionId = null
          // update supervisionEvent
          const updatedSupervisionEvent = await EventsDBApi.update(
            oldEvent.supervisionId,
            supervisionEventData,
            {
              currentUser,
              transaction,
            },
          );

          if (updatedSupervisionEvent) {
            delete supervisionEventData.supervisionEvent
            const oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({ id: oldEvent.supervisionId });
            updatedEvents.push({
              id: oldEvent.supervisionId,
              old: oldSupervisionData,
              new: supervisionEventData,
            });
            copyOfData.supervisionId = oldEvent.supervisionId;
            // add supervisionId to allAffectedIds
            allAffectedIds.push(oldEvent.supervisionId);
          }
        }

        // if there is NO supervision after update, we need to delete if there is in old
        if (!newHasSupervision && oldHasSupervision) {
          copyOfData.supervisionId = null
          toBeDeletedIds.push(oldEvent.supervisionId);
        }

        // update the main event
        copyOfData.updateSupervisionID = true
        copyOfData.id = oldEvent.id;
        const updatedEvent = await EventsDBApi.update(
          oldEvent.id,
          copyOfData,
          {
            currentUser,
            transaction,
          },
        );

        if (updatedEvent) {
          delete copyOfData.supervisionEvent
          oldEvent.users = oldEvent.userIds
          updatedEvents.push({
            id: oldEvent.id,
            old: oldEvent,
            new: copyOfData,
          });
          // add updated eventId to allAffectedIds
          allAffectedIds.push(oldEvent.id);

          if (pushNotification?.send && pushNotification?.to?.length > 0) {
            sendMultipleEventNotifications(
              pushNotification.to,
              updatedEvent,
              currentUser,
              pushNotification?.message,
              'updated',
            );
          }
        }

        // delete all events of the group for creating single new one
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });

        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
        
        await transaction.commit();
        return {
          deleted: deletedEvents,
          created: createdEvents,
          updated: updatedEvents,
          allAffectedIds: allAffectedIds,
        };
      }
      
      // If the group was containing more than
      // 1 event then delete all of them and create new one
      allEventsOfGroup.forEach((e) => {
        toBeDeletedIds.push(e.id);
        if (e.supervisionId !== null) {
          toBeDeletedIds.push(e.supervisionId);
        }
      });
      // if there is no supervisionEvent then set null
      if (!data?.supervisionEvent){
        data.supervisionId = null
      }

      // delete all events of the group for creating single new one
      deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
        transaction,
      });
      // add deleted eventIds to allAffectedIds
      allAffectedIds = [...deletedEvents]

      // set random uuid from frontend making new one
      data.id = uuidv4();
      data.eventGroupId = isolationGroupId;
      const supervisionEvent = data?.supervisionEvent;
      if (supervisionEvent) {
        // set random uuid for making new one
        supervisionEvent.id = uuidv4();
        supervisionEvent.eventGroupId = uuidv4();

        const supervisionEventData = {
          ...data,
          ...supervisionEvent,
        };

        // create new supervisionEvent
        const newSupervisionEvent = await EventsDBApi.create(
          supervisionEventData,
          {
            currentUser,
            transaction,
          },
        );
        if (newSupervisionEvent) {
          data.supervisionId = newSupervisionEvent.id;
          createdEvents.push(newSupervisionEvent.id);
          // add new supervisionId to allAffectedIds
          allAffectedIds.push(newSupervisionEvent.id)
        }
      }

      // create the main event
      // set the new id from the request of Frontend if it was provided
      data.id = null
      if (additionalIds && additionalIds.main){
        data.id = additionalIds.main
      }
      const newEvent = await EventsDBApi.create(data, {
        currentUser,
        transaction,
      });
      if (newEvent) {
        createdEvents.push(newEvent.id);
        // add newEvent id to allAffectedIds
        allAffectedIds.push(newEvent.id)
      }

      if (pushNotification?.send && pushNotification?.to?.length > 0) {
        sendMultipleEventNotifications(
          pushNotification.to,
          newEvent,
          currentUser,
          pushNotification?.message,
          'updated',
        );
      }
      await transaction.commit();
      return {
        deleted: deletedEvents,
        created: createdEvents,
        updated: updatedEvents,
        allAffectedIds: allAffectedIds,
      };
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async updateLevelSIMPLE(data, updateType, cancellationUpdate, isolationGroupId, currentUser, pushNotification, next, additionalIds, sandboxUpdate) {
    const transaction = await db.sequelize.transaction();
    try {
      let isCancellationChanged = false
      if (cancellationUpdate && (cancellationUpdate === true || cancellationUpdate === 'true')){
        isCancellationChanged = true
      }
      // TEMPORARY, eventGroupId should be provided by frontend
      // otherwise, just respond not found if eventGroupid is not provided
      if (!data.eventGroupId) {
        let existingEvent = await EventsDBApi.findBy({ id: data.id }, { transaction });
        if (!existingEvent) {
          throw new ValidationError('events.notFound');
        }
        data.eventGroupId = existingEvent.eventGroupId
      }

      const allEventsOfGroup = await EventsDBApi.findByGroupIds({
        eventGroupIds: data.eventGroupId,
        companyId: currentUser.companyId || '',
      });

      if (allEventsOfGroup.length === 0) {
        throw new ValidationError('events.notFound');
      }
      validateEventInputData(data);
      validateTimeAndDate(data, 'events');
      let deletedEvents = [];
      let createdEvents = [];
      let updatedEvents = [];
      let toBeDeletedIds = [];
      let allAffectedIds = []

      // if there is no supervisionEvent then set null
      if (!data?.supervisionEvent){
        data.supervisionId = null
      }

      // CASE 1: if the UPDATE_TYPE=ALL
      // step 1: Loop through all events of group and check if each had supervision
      // step 2: Do this steps to each element of main group:
      //    step 2.a: If new has supervision and old doesn't --> create supervision
      //    step 2.b: If new has supervision and old too     --> update supervision
      //    step 2.c: If new doesn't have while old does     --> delete supervision
      //    step 3: Update event
      if (updateType === "ALL"){
        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup){
          // if there was cancellation related change, then only update 
          // isCancelled, cancellationReasonId, cancelledbyUserId columns
          if (isCancellationChanged){
            const copyOfOldData = { ...oldEvent };
            copyOfOldData.isCancelled = data.isCancelled
            copyOfOldData.cancellationReasonId = data.cancellationReasonId
            copyOfOldData.cancelledByUserId = data.cancelledByUserId
            copyOfOldData.isCancelled = data.isCancelled
            // it is for formatting reason 
            copyOfOldData.users = oldEvent.userIds
            // update the main event
            copyOfOldData.id = oldEvent.id
            const updatedEvent = await EventsDBApi.update(
              oldEvent.id,
              copyOfOldData,
              {
                currentUser,
                transaction,
              },
            );
            if (updatedEvent) {
              oldEvent.users = oldEvent.userIds
              updatedEvents.push({
                id: oldEvent.id,
                old: oldEvent,
                new: copyOfOldData,
              });
              // add updated eventId to allAffectedIds
              allAffectedIds.push(oldEvent.id);

              if (pushNotification?.send && pushNotification?.to?.length > 0) {
                sendMultipleEventNotifications(
                  pushNotification.to,
                  updatedEvent,
                  currentUser,
                  pushNotification?.message,
                  'updated',
                );
              }
            }
            continue
          }

          const copyOfData = { ...data };
          // set the RRULE formula to be the same as before
          copyOfData.startRecur = oldEvent.startRecur;
          copyOfData.endRecur = oldEvent.endRecur;
          copyOfData.interval = oldEvent.interval;
          copyOfData.bysetpos = oldEvent.bysetpos;
          copyOfData.frequency = oldEvent.frequency;
          // TODO1: filter out daysOfWeek that are not in the new startRecur and endRecur
          copyOfData.daysOfWeek = oldEvent.daysOfWeek;

          let newHasSupervision = false;
          let oldHasSupervision = false;
          if (oldEvent.supervisionId) {
            oldHasSupervision = true;
          }

          if (copyOfData?.supervisionEvent) {
            newHasSupervision = true;
          }

          // if there is supervision after update, we need to create if there is no in old
          if (newHasSupervision && !oldHasSupervision) {
            // set random uuid for making new one
            const supervisionEvent = data?.supervisionEvent;
            supervisionEvent.id = uuidv4();
            supervisionEvent.eventGroupId = uuidv4();

            const supervisionEventData = {
              ...copyOfData,
              ...supervisionEvent,
            };
            supervisionEventData.supervisionId = null

            // create new supervisionEvent
            const newSupervisionEvent = await EventsDBApi.create(
              supervisionEventData,
              {
                currentUser,
                transaction,
              },
            );
            if (newSupervisionEvent) {
              copyOfData.supervisionId = newSupervisionEvent.id;
              createdEvents.push(newSupervisionEvent.id);
              // add new supervisionId to allAffectedIds
              allAffectedIds.push(newSupervisionEvent.id);
            }
          }

          // if there is supervision after update, we need to update if there is already in old
          if (newHasSupervision && oldHasSupervision) {
            // set random uuid for making new one
            const supervisionEvent = copyOfData?.supervisionEvent;
            supervisionEvent.eventGroupId = uuidv4();

            const supervisionEventData = {
              ...copyOfData,
              ...supervisionEvent,
            };

            supervisionEventData.id = oldEvent.supervisionId
            supervisionEventData.supervisionId = null
            // update supervisionEvent
            const updatedSupervisionEvent = await EventsDBApi.update(
              oldEvent.supervisionId,
              supervisionEventData,
              {
                currentUser,
                transaction,
              },
            );

            if (updatedSupervisionEvent) {
              delete supervisionEventData.supervisionEvent
              const oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({ id: oldEvent.supervisionId });
              updatedEvents.push({
                id: oldEvent.supervisionId,
                old: oldSupervisionData,
                new: supervisionEventData,
              });
              copyOfData.supervisionId = oldEvent.supervisionId;
              // add supervisionId to allAffectedIds
              allAffectedIds.push(oldEvent.supervisionId);
            }
          }

          // if there is NO supervision after update, we need to delete if there is in old
          if (!newHasSupervision && oldHasSupervision) {
            copyOfData.supervisionId = null
            toBeDeletedIds.push(oldEvent.supervisionId);
          }

          // update the main event
          copyOfData.updateSupervisionID = true
          copyOfData.id = oldEvent.id;
          const updatedEvent = await EventsDBApi.update(
            oldEvent.id,
            copyOfData,
            {
              currentUser,
              transaction,
            },
          );

          if (updatedEvent) {
            delete copyOfData.supervisionEvent
            oldEvent.users = oldEvent.userIds
            updatedEvents.push({
              id: oldEvent.id,
              old: oldEvent,
              new: copyOfData,
            });
            // add updated eventId to allAffectedIds
            allAffectedIds.push(oldEvent.id);

            if (pushNotification?.send && pushNotification?.to?.length > 0) {
              sendMultipleEventNotifications(
                pushNotification.to,
                updatedEvent,
                currentUser,
                pushNotification?.message,
                'updated',
              );
            }
          }
        }

        // delete all tobedeleted
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
      }

      // CASE 2: if the UPDATE_TYPE=ONLY
      // step 1.a: get the being updated event check the event recurring duration
      // step 1.b: check the LEFT and RIGHT parts length after ONLY modification
      //           (they might become 0 length too)
      // step 2: check if the new and old has/not supervision:
      //    step 2.a: If new HAS and old NOT:
      //          step 2.a.1: create supervision for being updated date
      //                      and then update that being updated part of group to that specific date
      //                      by assigning the new supervision to it.
      //          step 2.a.2: create new event for LEFT with OLD data
      //          step 2.a.3: create new event for RIGHT with OLD data
      //    step 2.b: If new HAS and old HAS:
      //          step 2.b.1: update supervision for being updated date
      //                      and then update that being updated part of group to that specific date
      //          step 2.b.2: create supervision_LEFT for LEFT part of updated date
      //                      and then create new event for LEFT with OLD data and assign supervision_LEFT 
      //          step 2.b.3: create supervision_RIGHT for RIGHT part of updated date
      //                      and then create new event for RIGHT with OLD data and assign supervision_RIGHT
      //    step 2.c: If new NOT and old HAS:
      //          step 2.c.1: delete supervision for being updated date
      //                      and then update that being updated part of group to that specific date
      //          step 2.c.2: create supervision_LEFT for LEFT part of updated date
      //                      and then create new event for LEFT with OLD data and assign supervision_LEFT 
      //          step 2.c.3: create supervision_RIGHT for RIGHT part of updated date
      //                      and then create new event for RIGHT with OLD data and assign supervision_RIGHT
      //    step 2.d: If new NOT and old NOT:
      //          step 2.d.1: update that being updated part of group to that specific date
      //          step 2.d.2: create new event for LEFT with OLD data
      //          step 2.d.3: create new event for RIGHT with OLD data
      if (updateType === 'ONLY') {
        const eventsGroupLastIndex = allEventsOfGroup.length - 1;
        let startEdgeRecur = allEventsOfGroup[0].startRecur;
        let endEdgeRecur = allEventsOfGroup[eventsGroupLastIndex].endRecur;

        // if the startRecur is the same as the first event of the group
        if (data.startRecur === allEventsOfGroup[0].startRecur) {
          if (
            data.endRecur === allEventsOfGroup[0].endRecur &&
            allEventsOfGroup.length > 1
          ) {
            startEdgeRecur = allEventsOfGroup[1].startRecur;
          } else {
            startEdgeRecur = data.endRecur;
          }
        }

        // if the endRecur is the same as the last event of the group
        if (data.endRecur === allEventsOfGroup[eventsGroupLastIndex].endRecur) {
          if (
            data.startRecur ===
              allEventsOfGroup[eventsGroupLastIndex].startRecur &&
            allEventsOfGroup.length > 1
          ) {
            endEdgeRecur = allEventsOfGroup[eventsGroupLastIndex - 1].endRecur;
          } else {
            endEdgeRecur = data.startRecur;
          }
        }

        // get the adjusted daysOfWeek for the updated event
        const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
          startDate: startEdgeRecur,
          endDate: endEdgeRecur,
          daysOfWeek: allEventsOfGroup[0].daysOfWeek,
        });

        // check if the daysOfWeek has changed
        const hasDaysOfWeekChanged =
          allEventsOfGroup[0].daysOfWeek.length !== adjustedDaysOfWeek.length;

        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup) {
          let isItPastEvent = false;
          let isItFutureEvent = false;
          let isItCurrentEvent = false;
          if (
            oldEvent.startRecur < data.startRecur &&
            oldEvent.endRecur < data.endRecur
          ) {
            isItPastEvent = true;
          }
          if (
            oldEvent.startRecur <= data.startRecur &&
            oldEvent.endRecur >= data.endRecur &&
            data.id === oldEvent.id
          ) {
            isItCurrentEvent = true;
          }
          if (
            oldEvent.startRecur > data.startRecur &&
            oldEvent.endRecur > data.endRecur
          ) {
            isItFutureEvent = true;
          }

          if (isItPastEvent) {
            // if daysOfWeek has not changed then skip
            if (
              hasDaysOfWeekChanged &&
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeek.length > 0
            ) {
              const pastEvent = { ...oldEvent };
              pastEvent.id = oldEvent.id;
              pastEvent.users = oldEvent.userIds;
              pastEvent.daysOfWeek = adjustedDaysOfWeek;

              const updatedPastEvent = await EventsDBApi.update(
                oldEvent.id,
                pastEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              pastEvent.id = oldEvent.id;
              if (updatedPastEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: pastEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          if (isItFutureEvent) {
            // if it is not cancellation related change or daysOfWeek has not changed then skip
            if (
              hasDaysOfWeekChanged &&
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeek.length > 0
            ) {
              const futureEvent = { ...oldEvent };
              futureEvent.id = oldEvent.id;
              futureEvent.users = oldEvent.userIds;
              futureEvent.daysOfWeek = adjustedDaysOfWeek;

              const updatedFutureEvent = await EventsDBApi.update(
                oldEvent.id,
                futureEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              futureEvent.id = oldEvent.id;
              if (updatedFutureEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: futureEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          if (isItCurrentEvent) {
            let oldSupervisionData = false;
            let eventDuration = subtractDateDifference(
              data.endRecur,
              data.startRecur,
            );
            let leftDuration = subtractDateDifference(
              data.startRecur,
              oldEvent.startRecur,
            );
            let rightDuration = subtractDateDifference(
              oldEvent.endRecur,
              data.endRecur,
            );

            // it is ONLY so difference must be 1 day
            // LEFT and RIGHT must be non-negative
            if (eventDuration != 1 || leftDuration < 0 || rightDuration < 0) {
              // skip the current event and continue
              continue;
            }

            // GET the copy for LEFT and RIGHT of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };

            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (data?.supervisionEvent) {
              newHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };

            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = data?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...data,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;

              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                data.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }

              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId;
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = data.startRecur;
                copyForLeft.daysOfWeek = adjustedDaysOfWeek;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // right start on the ONLY.endRecur
                copyForRight.id = null;
                copyForRight.users = copyForRight.userIds;
                copyForRight.startRecur = data.endRecur;
                copyForRight.daysOfWeek = adjustedDaysOfWeek;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = data?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...data,
                ...supervisionEvent,
              };

              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null;

              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );

              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                data.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }

              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId;
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // set random uuid for making new one
                copyForLeftSupervision.id = uuidv4();
                copyForLeftSupervision.eventGroupId = uuidv4();

                // left ends on the ONLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = data.startRecur;
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeek;

                // create new supervisionEvent (LEFT)
                const newSupervisionEventForLeft = await EventsDBApi.create(
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForLeft) {
                  copyForLeft.supervisionId = newSupervisionEventForLeft.id;
                  createdEvents.push(newSupervisionEventForLeft.id);
                  // add new supervision id of LEFT to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForLeft.id);
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = data.startRecur;
                copyForLeft.daysOfWeek = adjustedDaysOfWeek;
                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // set random uuid for making new one
                copyForRightSupervision.id = uuidv4();
                copyForRightSupervision.eventGroupId = uuidv4();

                // right start on the ONLY.endRecur
                copyForRightSupervision.supervisionId = null;
                copyForRightSupervision.startRecur = data.endRecur;
                copyForRightSupervision.daysOfWeek = adjustedDaysOfWeek;

                // create new supervisionEvent (RIGHT)
                const newSupervisionEventForRight = await EventsDBApi.create(
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForRight) {
                  copyForRight.supervisionId = newSupervisionEventForRight.id;
                  createdEvents.push(newSupervisionEventForRight.id);
                  // add new supervisionId of right to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForRight.id);
                }

                // right start on the ONLY.endRecur
                copyForRight.id = null;
                copyForRight.startRecur = data.endRecur;
                copyForRight.daysOfWeek = adjustedDaysOfWeek;
                copyForRight.users = copyForRight.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              let mainSupervisionFoundPlace = false;
              // if the LEFT and RIGHT are empty then delete supervision
              if (
                (leftDuration === 0 && rightDuration === 0) ||
                adjustedDaysOfWeek.length === 0
              ) {
                // push the current supervision to delete array
                toBeDeletedIds.push(oldEvent.supervisionId);
                mainSupervisionFoundPlace = true;
              }

              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId;
              data.supervisionId = null;
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // if LEFT is not empty so the supevision of main has not found the plac
                // I mean mainSupervisionFoundPlace=FALSE, so update it to be LEFT

                // LEFT ends on the ONLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = data.startRecur;
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeek;
                copyForLeftSupervision.id = oldEvent.supervisionId;
                // update supervisionEvent to the LEFT
                const updatedSupervisionEventLEFT = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEventLEFT) {
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  copyForLeft.supervisionId = oldEvent.supervisionId;
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                  mainSupervisionFoundPlace = true;
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = data.startRecur;
                copyForLeft.daysOfWeek = adjustedDaysOfWeek;
                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // it means the supervision already moved to LEFT
                if (mainSupervisionFoundPlace) {
                  // set random uuid for making new one
                  copyForRightSupervision.id = uuidv4();
                  copyForRightSupervision.eventGroupId = uuidv4();

                  // right start on the ONLY.endRecur
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeek;

                  // create new supervisionEvent (RIGHT)
                  const newSupervisionEventForRight = await EventsDBApi.create(
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForRight) {
                    copyForRight.supervisionId = newSupervisionEventForRight.id;
                    createdEvents.push(newSupervisionEventForRight.id);
                    // add new supervisionId of right to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForRight.id);
                  }
                } else {
                  // It means mainSupervisionFoundPlace=FALSE so leftDuration=0
                  // so we can move the main supervision to be the RIGHT

                  // RIGHT starts on the ONLY.endRecur
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeek;
                  copyForRightSupervision.id = oldEvent.supervisionId;
                  // update supervisionEvent to the RIGHT
                  const updatedSupervisionEventRIGHT = await EventsDBApi.update(
                    oldEvent.supervisionId,
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (updatedSupervisionEventRIGHT) {
                    updatedEvents.push({
                      id: oldEvent.supervisionId,
                      old: oldSupervisionData,
                      new: updatedSupervisionEventRIGHT,
                    });
                    copyForRight.supervisionId = oldEvent.supervisionId;
                    // add supervisionId to allAffectedIds
                    allAffectedIds.push(oldEvent.supervisionId);
                    mainSupervisionFoundPlace = true;
                  }
                }

                // right start on the ONLY.endRecur
                copyForRight.id = null;
                copyForRight.startRecur = data.endRecur;
                copyForRight.daysOfWeek = adjustedDaysOfWeek;
                copyForRight.users = copyForRight.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, and there is NO supervision before too
            if (!newHasSupervision && !oldHasSupervision) {
              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId;
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = data.startRecur;
                copyForLeft.daysOfWeek = adjustedDaysOfWeek;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // right start on the ONLY.endRecur
                copyForRight.id = null;
                copyForRight.users = copyForRight.userIds;
                copyForRight.startRecur = data.endRecur;
                copyForRight.daysOfWeek = adjustedDaysOfWeek;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }
          }
        }

        // delete all tobedeleted
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents];
      }

      // CASE 3: if the UPDATE_TYPE=FUTURE
      // step 1: check the LEFT and RIGHT parts length after FUTURE modification of part X of group 
      //         (they might become 0 length too)
      // step 2: check if the new and old has/not supervision:
      //    step 2.a: If new HAS and old NOT:
      //          step 2.a.1: create supervision_RIGHT for the RIGHT side of part X
      //                      and then update that being updated part of group to be the RIGHT
      //                      by assigning the new supervision to it.
      //          step 2.a.2: create new event for LEFT part of X with OLD data
      //          step 2.a.3: create supervision for each element of whole group which are in the future of X
      //                      and then update all of them with new data and assign the supervision to each of them
      //    step 2.b: If new HAS and old HAS:
      //          step 2.b.1: update supervision_RIGHT for the RIGHT side of part X
      //                      and then update that being updated part of group to be the RIGHT
      //          step 2.b.2: create supervision_LEFT for LEFT part of X with old data
      //                      and then create new event for LEFT part of X with OLD data and assign supervision_LEFT 
      //          step 2.b.3: update supervision for each element of whole group which are in the future of X with new data
      //                      and then update all of them with new data
      //    step 2.c: If new NOT and old HAS:
      //          step 2.c.1: delete supervision for being updated event X
      //                      and then update that being updated part of group to be the RIGHT
      //          step 2.c.2: create supervision_LEFT for LEFT part of X with old data
      //                      and then create new event for LEFT part of X with OLD data and assign supervision_LEFT 
      //          step 2.c.3: delete supervision from each element of whole group which are in the future of X
      //                      and then update all of them with new data
      //    step 2.d: If new NOT and old NOT:
      //          step 2.d.1: update that being updated part of group to be the RIGHT
      //          step 2.d.2: create new event for LEFT part of X with OLD data
      //          step 2.d.3: update each element of whole group which are in the future of X with new data
      if (updateType === "FUTURE"){
        let startEdgeRecur = allEventsOfGroup[0].startRecur;
        let endEdgeRecur = data.startRecur;

        const currentEventIndex = allEventsOfGroup.findIndex(
          (event) =>
            event.startRecur <= data.startRecur &&
            event.endRecur === data.endRecur &&
            event.id === data.id,
        );
        const currentEvent =
          currentEventIndex !== -1 ? allEventsOfGroup[currentEventIndex] : null;

        if (
          currentEvent &&
          currentEvent.startRecur === data.startRecur &&
          currentEventIndex - 1 >= 0
        ) {
          endEdgeRecur = allEventsOfGroup[currentEventIndex - 1].endRecur;
        }

        // get the adjusted daysOfWeek for the updated event
        const adjustedDaysOfWeekForPast = getAdjustedDaysOfWeek({
          startDate: startEdgeRecur,
          endDate: endEdgeRecur,
          daysOfWeek: allEventsOfGroup[0].daysOfWeek,
        });

        // check if the daysOfWeek has changed
        const hasDaysOfWeekChanged =
          allEventsOfGroup[0].daysOfWeek.length !== adjustedDaysOfWeekForPast.length;

        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup) {
          let isItPastEvent = false;
          let isItFutureEvent = false;
          let isItCurrentEvent = false;
          if (
            oldEvent.startRecur < data.startRecur &&
            oldEvent.endRecur < data.endRecur
          ) {
            isItPastEvent = true;
          }
          if (
            oldEvent.startRecur <= data.startRecur &&
            oldEvent.endRecur === data.endRecur &&
            data.id === oldEvent.id
          ) {
            isItCurrentEvent = true;
          }
          if (
            oldEvent.startRecur > data.startRecur &&
            oldEvent.endRecur > data.endRecur
          ) {
            isItFutureEvent = true;
          }
          
          if (isItPastEvent) {
            if (
              isCancellationChanged &&
              hasDaysOfWeekChanged &&
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeekForPast.length > 0
            ) {
              const pastEvent = { ...oldEvent };
              pastEvent.id = oldEvent.id;
              pastEvent.users = oldEvent.userIds;
              pastEvent.daysOfWeek = adjustedDaysOfWeekForPast;

              const updatedPastEvent = await EventsDBApi.update(
                oldEvent.id,
                pastEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              pastEvent.id = oldEvent.id;
              if (updatedPastEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: pastEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          // UPDATE it with new data if it is fully in the future
          if (isItFutureEvent) {
            // if there was cancellation related change, then only update
            // isCancelled, cancellationReasonId, cancelledbyUserId columns
            if (isCancellationChanged) {
              // create new adjusted daysOfWeek for the future events
              const adjustedDaysOfWeekForFuture = getAdjustedDaysOfWeek({
                startDate: data.startRecur,
                endDate: allEventsOfGroup[allEventsOfGroup.length - 1].endRecur,
                daysOfWeek: oldEvent.daysOfWeek,
              });

              const copyOfOldData = { ...oldEvent };
              copyOfOldData.isCancelled = data.isCancelled;
              copyOfOldData.cancellationReasonId = data.cancellationReasonId;
              copyOfOldData.cancelledByUserId = data.cancelledByUserId;
              copyOfOldData.isCancelled = data.isCancelled;
              // it is for formatting reason
              copyOfOldData.users = oldEvent.userIds;

              // In fact, adjustedDaysOfWeekForFuture.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              if (adjustedDaysOfWeekForFuture.length > 0) {
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyOfOldData.daysOfWeek = adjustedDaysOfWeekForFuture;
              }

              // isolate the event by setting random UUID from frontend
              copyOfOldData.eventGroupId = isolationGroupId;
              copyOfOldData.id = oldEvent.id;
              // update the main event
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfOldData,
                {
                  currentUser,
                  transaction,
                },
              );

              copyOfOldData.id = oldEvent.id;
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfOldData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
              continue;
            }

            const copyOfData = { ...data };
            // set the RRULE formula to be the same as before
            copyOfData.startRecur = oldEvent.startRecur;
            copyOfData.endRecur = oldEvent.endRecur;
            copyOfData.interval = oldEvent.interval;
            copyOfData.bysetpos = oldEvent.bysetpos;
            copyOfData.frequency = oldEvent.frequency;
            copyOfData.daysOfWeek = oldEvent.daysOfWeek;
            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }
            if (copyOfData?.supervisionEvent) {
              newHasSupervision = true;
            }
            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = data?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();
              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;
              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                copyOfData.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }
            }
            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();
              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null;
              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                const oldSupervisionData =
                  await EventsDBApi.findByIdForUndoRedo({
                    id: oldEvent.supervisionId,
                  });
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                copyOfData.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }
            }
            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              copyOfData.supervisionId = null;
              toBeDeletedIds.push(oldEvent.supervisionId);
            }
            // update the main event
            copyOfData.updateSupervisionID = true;
            copyOfData.id = oldEvent.id;
            const updatedEvent = await EventsDBApi.update(
              oldEvent.id,
              copyOfData,
              {
                currentUser,
                transaction,
              },
            );
            if (updatedEvent) {
              delete copyOfData.supervisionEvent;
              oldEvent.users = oldEvent.userIds;
              updatedEvents.push({
                id: oldEvent.id,
                old: oldEvent,
                new: copyOfData,
              });
              // add updated eventId to allAffectedIds
              allAffectedIds.push(oldEvent.id);

              if (pushNotification?.send && pushNotification?.to?.length > 0) {
                sendMultipleEventNotifications(
                  pushNotification.to,
                  updatedEvent,
                  currentUser,
                  pushNotification?.message,
                  'updated',
                );
              }
            }
          }

          // UPDATE it with new data and move it to RIGHT side, create new with old data for LEFT
          if (isItCurrentEvent) {
            const copyOfData = { ...data };
            copyOfData.endRecur = oldEvent.endRecur;
            let oldSupervisionData = false;
            let leftDuration = subtractDateDifference(
              copyOfData.startRecur,
              oldEvent.startRecur,
            );
            let rightDuration = subtractDateDifference(
              copyOfData.endRecur,
              copyOfData.startRecur,
            );

            // GET the copy for LEFT of old event
            const copyForLeft = { ...oldEvent };

            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (copyOfData?.supervisionEvent) {
              newHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };

            // create new adjusted daysOfWeek for the future events
            const adjustedDaysOfWeekForFuture = getAdjustedDaysOfWeek({
              startDate: data.startRecur,
              endDate: allEventsOfGroup[allEventsOfGroup.length - 1].endRecur,
              daysOfWeek: oldEvent.daysOfWeek,
            });

            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;

              // if there was cancellation related change
              // then isolate the right part from group
              if (isCancellationChanged) {
                // In fact, adjustedDaysOfWeekForFuture.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeekForFuture.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfData.daysOfWeek = adjustedDaysOfWeekForFuture;
                  supervisionEventData.daysOfWeek = adjustedDaysOfWeekForFuture;
                }
                copyOfData.eventGroupId = isolationGroupId;
              }

              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                copyOfData.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }

              // update the main event
              copyOfData.updateSupervisionID = true;
              // the main event will become the right part
              copyOfData.id = oldEvent.id;

              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfData,
                {
                  currentUser,
                  transaction,
                },
              );

              

              // create for LEFT
              if (
                leftDuration > 0 &&
                (!isCancellationChanged ||
                  (isCancellationChanged &&
                    // In fact, adjustedDaysOfWeekForPast.length == 0 case should not happen,
                    // leaving this check in case of other edge cases
                    adjustedDaysOfWeekForPast.length > 0))
              ) {
                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = copyOfData.startRecur;

                if (isCancellationChanged) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForPast;
                }

                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };

              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null;

              // if there was cancellation related change
              // then isolate the right part from group
              if (isCancellationChanged) {
                // In fact, adjustedDaysOfWeekForFuture.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeekForFuture.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfData.daysOfWeek = adjustedDaysOfWeekForFuture;
                  supervisionEventData.daysOfWeek = adjustedDaysOfWeekForFuture;
                }

                copyOfData.eventGroupId = isolationGroupId;
              }

              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );

              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                copyOfData.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }

              // update the main event
              copyOfData.updateSupervisionID = true;
              // the main event will become the right part
              copyOfData.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfData,
                {
                  currentUser,
                  transaction,
                },
              );

              // create for LEFT
              if (
                leftDuration > 0 &&
                (!isCancellationChanged ||
                  (isCancellationChanged &&
                    // In fact, adjustedDaysOfWeekForPast.length == 0 case should not happen,
                    // leaving this check in case of other edge cases
                    adjustedDaysOfWeekForPast.length > 0))
              ) {
                // set random uuid for making new one
                copyForLeftSupervision.id = uuidv4();
                copyForLeftSupervision.eventGroupId = uuidv4();

                // left ends on the ONLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = copyOfData.startRecur;

                if (isCancellationChanged) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForPast;
                }

                // create new supervisionEvent (LEFT)
                const newSupervisionEventForLeft = await EventsDBApi.create(
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForLeft) {
                  copyForLeft.supervisionId = newSupervisionEventForLeft.id;
                  createdEvents.push(newSupervisionEventForLeft.id);
                  // add new supervision id of LEFT to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForLeft.id);
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = copyOfData.startRecur;
                copyForLeft.users = copyForLeft.userIds;

                if (isCancellationChanged) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForPast;
                }

                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              // if the LEFT is empty then delete supervision
              if (leftDuration === 0) {
                toBeDeletedIds.push(oldEvent.supervisionId);
              }

              // the main event will become the right part
              // update the main event
              copyOfData.updateSupervisionID = true;
              copyOfData.supervisionId = null;
              copyOfData.id = oldEvent.id;
              // if there was cancellation related change
              // then isolate the right part from group
              if (isCancellationChanged) {
                // In fact, adjustedDaysOfWeekForFuture.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeekForFuture.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfData.daysOfWeek = adjustedDaysOfWeekForFuture;
                }

                copyOfData.eventGroupId = isolationGroupId;
              }
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfData,
                {
                  currentUser,
                  transaction,
                },
              );

              // create for LEFT
              if (
                leftDuration > 0 &&
                (!isCancellationChanged ||
                  (isCancellationChanged &&
                    // In fact, adjustedDaysOfWeekForPast.length == 0 case should not happen,
                    // leaving this check in case of other edge cases
                    adjustedDaysOfWeekForPast.length > 0))
              ) {
                // if LEFT is not empty so the supevision of main has not found the place
                // so update it to be LEFT

                // LEFT ends on the ONLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = copyOfData.startRecur;

                if (isCancellationChanged) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForPast;
                }

                copyForLeftSupervision.id = oldEvent.supervisionId;
                // update supervisionEvent to the LEFT
                const updatedSupervisionEventLEFT = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEventLEFT) {
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  copyForLeft.supervisionId = oldEvent.supervisionId;
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = copyOfData.startRecur;

                if (isCancellationChanged) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForPast;
                }

                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, and there is NO supervision before too
            if (!newHasSupervision && !oldHasSupervision) {
              // update the main event
              // the main event will become the right part
              copyOfData.updateSupervisionID = true;
              copyOfData.id = oldEvent.id;
              // if there was cancellation related change
              // then isolate the right part from group
              if (isCancellationChanged) {
                // In fact, adjustedDaysOfWeekForFuture.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeekForFuture.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfData.daysOfWeek = adjustedDaysOfWeekForFuture;
                }

                copyOfData.eventGroupId = isolationGroupId;
              }

              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfData,
                {
                  currentUser,
                  transaction,
                },
              );

              // create for LEFT
              if (
                leftDuration > 0 &&
                (!isCancellationChanged ||
                  (isCancellationChanged &&
                    // In fact, adjustedDaysOfWeekForPast.length == 0 case should not happen,
                    // leaving this check in case of other edge cases
                    adjustedDaysOfWeekForPast.length > 0))
              ) {
                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = copyOfData.startRecur;

                if (isCancellationChanged) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForPast;
                }

                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (
                  pushNotification?.send &&
                  pushNotification?.to?.length > 0
                ) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }
          }
        }

        // delete all events of the group for creating single new one
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents];
      }

      if (updateType === "PARTLY"){
        const leftNearestEventIndex = allEventsOfGroup.findIndex(
          (event) =>
            event.endRecur > data.startRecur &&
            event.startRecur < data.endRecur,
        );
        let rightNearestEventIndex = [...allEventsOfGroup]
          .reverse()
          .findIndex(
            (event) =>
              event.startRecur < data.endRecur &&
              event.endRecur > data.startRecur,
          );

        rightNearestEventIndex =
          rightNearestEventIndex !== -1
            ? allEventsOfGroup.length - 1 - rightNearestEventIndex
            : -1;

        const leftNearestEvent =
          leftNearestEventIndex !== -1
            ? allEventsOfGroup[leftNearestEventIndex]
            : null;
        const rightNearestEvent =
          rightNearestEventIndex !== -1
            ? allEventsOfGroup[rightNearestEventIndex]
            : null;

        // if there is no left or right event, then do nothing
        if (!leftNearestEvent || !rightNearestEvent) {
          await transaction.commit();
          return {
            deleted: deletedEvents,
            created: createdEvents,
            updated: updatedEvents,
            allAffectedIds: allAffectedIds,
          };
        }

        if (leftNearestEvent.startRecur > data.startRecur) {
          data = {
            ...data,
            startRecur: leftNearestEvent.startRecur,
          };
        }

        if (rightNearestEvent.endRecur < data.endRecur) {
          data = {
            ...data,
            endRecur: rightNearestEvent.endRecur,
          };
        }

        let startEdgeRecur = allEventsOfGroup[0].startRecur;
        let endEdgeRecur =
          allEventsOfGroup[allEventsOfGroup.length - 1].endRecur;

        if (data.startRecur === startEdgeRecur) {
          if (
            data.endRecur === rightNearestEvent.endRecur &&
            rightNearestEventIndex + 1 < allEventsOfGroup.length
          ) {
            startEdgeRecur =
              allEventsOfGroup[rightNearestEventIndex + 1].startRecur;
          } else {
            startEdgeRecur = data.endRecur;
          }
        }

        if (data.endRecur === endEdgeRecur) {
          if (
            data.startRecur === leftNearestEvent.startRecur &&
            leftNearestEventIndex - 1 >= 0
          ) {
            endEdgeRecur = allEventsOfGroup[leftNearestEventIndex - 1].endRecur;
          } else {
            endEdgeRecur = data.startRecur;
          }
        }

        const adjustedDaysOfWeekForOldEvents = getAdjustedDaysOfWeek({
          startDate: startEdgeRecur,
          endDate: endEdgeRecur,
          daysOfWeek: allEventsOfGroup[0].daysOfWeek,
        });

        const hasDaysOfWeekForOldEventsChanged =
          allEventsOfGroup[0].daysOfWeek.length !==
          adjustedDaysOfWeekForOldEvents.length;
        
        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup) {
          let isItFullyInside = false
          let isItExplodeRight = false
          let isItExplodeLeft = false
          let isItExplodeBothSide = false
          let isItPastEvent = false
          let isItFutureEvent = false
          // if being requested start is later than end then do nothing
          if (data.startRecur >= data.endRecur) {
            continue
          }

          // if it starts later the range then ---> isItFutureEvent=true
          if (oldEvent.startRecur >= data.endRecur) {
            isItFutureEvent = true
          }

          // if it ends before the range then ---> isItPastEvent=true
          if (oldEvent.endRecur <= data.startRecur) {
            isItPastEvent = true
          }

          // if it starts early and ends not later then ---> isItExplodeLeft=true
          // isItExplodeLeft=true ---> range must contain data.startRecur and at the same time it shouldnt end later
          if (oldEvent.startRecur < data.startRecur && oldEvent.endRecur > data.startRecur && oldEvent.endRecur <= data.endRecur) {
            isItExplodeLeft = true
          }

          // if it starts later and ends not before then ---> isItExplodeRight=true
          // isItExplodeRight=true ---> range must contain data.endRecur and at the same time it shouldnt start before
          if (oldEvent.startRecur < data.endRecur && oldEvent.endRecur > data.endRecur && oldEvent.startRecur >= data.startRecur) {
            isItExplodeRight = true
          }

          // if it starts early and ends later then ---> isItExplodeBothSide=true
          if (oldEvent.startRecur < data.startRecur && oldEvent.endRecur > data.endRecur){
            isItExplodeBothSide = true
          }

          // if it starts not early and ends not later then ---> isItFullyInside=true
          if (oldEvent.startRecur >= data.startRecur && oldEvent.endRecur <= data.endRecur){
            isItFullyInside = true
          }

          // STEP 0: Skip PAST or FUTURE
          // NOT IN RANGE skipping

          if (isItPastEvent) {
            if (
              hasDaysOfWeekForOldEventsChanged &&
              // In fact, adjustedDaysOfWeekForOldEvents.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeekForOldEvents.length > 0
            ) {
              const pastEvent = { ...oldEvent };
              pastEvent.id = oldEvent.id;
              pastEvent.users = oldEvent.userIds;
              pastEvent.daysOfWeek = adjustedDaysOfWeekForOldEvents;

              const updatedPastEvent = await EventsDBApi.update(
                oldEvent.id,
                pastEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              pastEvent.id = oldEvent.id;
              if (updatedPastEvent) {
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: pastEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          if (isItFutureEvent) {
            if (
              hasDaysOfWeekForOldEventsChanged &&
              // In fact, adjustedDaysOfWeekForOldEvents.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeekForOldEvents.length > 0
            ) {
              const futureEvent = { ...oldEvent };
              futureEvent.id = oldEvent.id;
              futureEvent.users = oldEvent.userIds;
              futureEvent.daysOfWeek = adjustedDaysOfWeekForOldEvents;

              const updatedFutureEvent = await EventsDBApi.update(
                oldEvent.id,
                futureEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              futureEvent.id = oldEvent.id;
              if (updatedFutureEvent) {
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: futureEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          // STEP 1: Update FULLY INSIDE
          // FULLY IN RANGE updating
          if (isItFullyInside){
            // create new adjusted daysOfWeek for the partly being isolated events
            const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
              startDate: data.startRecur,
              endDate: data.endRecur,
              daysOfWeek: oldEvent.daysOfWeek,
            });

            // if there was onlysandbox change, then do not touch anyting
            if (sandboxUpdate){
              const copyOfOldData = { ...oldEvent };
              copyOfOldData.sandboxMode = data.sandboxMode;
              // it is for formatting reason
              copyOfOldData.users = oldEvent.userIds;
              
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              if (adjustedDaysOfWeek.length > 0) {
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyOfOldData.daysOfWeek = adjustedDaysOfWeek;
              }

              // isolate the event by setting random UUID from frontend
              copyOfOldData.eventGroupId = isolationGroupId
              copyOfOldData.id = oldEvent.id
              // update the main event
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfOldData,
                {
                  currentUser,
                  transaction,
                },
              );

              copyOfOldData.id = oldEvent.id
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfOldData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }

              // if there is supervision update it
              let oldSupervisionData = false
              if (oldEvent.supervisionId) {
                oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                  id: oldEvent.supervisionId,
                });

                const copyOfOldSupervisionData = { ...oldSupervisionData };
                copyOfOldSupervisionData.sandboxMode = data.sandboxMode
                // it is for formatting reason 
                copyOfOldSupervisionData.users = oldSupervisionData.userIds
                
                // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeek.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfOldSupervisionData.daysOfWeek = adjustedDaysOfWeek;
                }

                // isolate the event by setting random UUID from frontend
                copyOfOldSupervisionData.eventGroupId = uuidv4()
                copyOfOldSupervisionData.id = oldSupervisionData.id
                // update the main event
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldSupervisionData.id,
                  copyOfOldSupervisionData,
                  {
                    currentUser,
                    transaction,
                  },
                );

                updatedSupervisionEvent.id = oldSupervisionData.id
                if (updatedSupervisionEvent) {
                  oldSupervisionData.users = oldSupervisionData.userIds
                  updatedEvents.push({
                    id: oldSupervisionData.id,
                    old: oldSupervisionData,
                    new: copyOfOldSupervisionData,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldSupervisionData.id);
                }
              }
              continue
            }
            // if there was cancellation related change, then only update 
            // isCancelled, cancellationReasonId, cancelledbyUserId columns
            if (isCancellationChanged){
              const copyOfOldData = { ...oldEvent };
              copyOfOldData.isCancelled = data.isCancelled
              copyOfOldData.cancellationReasonId = data.cancellationReasonId
              copyOfOldData.cancelledByUserId = data.cancelledByUserId
              copyOfOldData.isCancelled = data.isCancelled
              // it is for formatting reason 
              copyOfOldData.users = oldEvent.userIds

              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              if (adjustedDaysOfWeek.length > 0) {
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyOfOldData.daysOfWeek = adjustedDaysOfWeek;
              }

              // isolate the event by setting random UUID from frontend
              copyOfOldData.eventGroupId = isolationGroupId
              copyOfOldData.id = oldEvent.id
              // update the main event
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfOldData,
                {
                  currentUser,
                  transaction,
                },
              );

              copyOfOldData.id = oldEvent.id
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfOldData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
              continue
            }
            const copyOfData = { ...data };
            // set the RRULE formula to be the same as before
            copyOfData.startRecur = oldEvent.startRecur;
            copyOfData.endRecur = oldEvent.endRecur;
            copyOfData.interval = oldEvent.interval;
            copyOfData.bysetpos = oldEvent.bysetpos;
            copyOfData.frequency = oldEvent.frequency;

            // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
            // leaving this check in case of other edge cases
            if (adjustedDaysOfWeek.length > 0) {
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyOfData.daysOfWeek = adjustedDaysOfWeek;
            }
            

            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }
            if (copyOfData?.supervisionEvent) {
              newHasSupervision = true;
            }
            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = data?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();
              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;
              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                copyOfData.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }
            }
            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();
              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null;
              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                const oldSupervisionData =
                  await EventsDBApi.findByIdForUndoRedo({
                    id: oldEvent.supervisionId,
                  });
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                copyOfData.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }
            }
            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              copyOfData.supervisionId = null;
              toBeDeletedIds.push(oldEvent.supervisionId);
            }
            // update the main event
            copyOfData.updateSupervisionID = true;
            copyOfData.id = oldEvent.id

            // isolate the event by setting random UUID from frontend
            copyOfData.eventGroupId = isolationGroupId;
            const updatedEvent = await EventsDBApi.update(
              oldEvent.id,
              copyOfData,
              {
                currentUser,
                transaction,
              },
            );
            if (updatedEvent) {
              delete copyOfData.supervisionEvent;
              oldEvent.users = oldEvent.userIds;
              updatedEvents.push({
                id: oldEvent.id,
                old: oldEvent,
                new: copyOfData,
              });
              // add updated eventId to allAffectedIds
              allAffectedIds.push(oldEvent.id);

              if (pushNotification?.send && pushNotification?.to?.length > 0) {
                sendMultipleEventNotifications(
                  pushNotification.to,
                  updatedEvent,
                  currentUser,
                  pushNotification?.message,
                  'updated',
                );
              }
            }
            continue
          }

          // STEP 2: Explode LEFT
          // EXPLODE LEFT move it to right part and create for left
          if (isItExplodeLeft){
            // create new adjusted daysOfWeek for the partly being isolated events
            const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
              startDate: data.startRecur,
              endDate: data.endRecur,
              daysOfWeek: oldEvent.daysOfWeek,
            });

            // if there was onlysandbox change, then do not touch anyting
            if (sandboxUpdate){
              const copyOfOldData = { ...oldEvent };
              // GET the copy for LEFT of old event
              // use it for left exploding part
              const copyForLeft = { ...oldEvent };
              
              copyOfOldData.sandboxMode = data.sandboxMode
              copyOfOldData.startRecur = data.startRecur

              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              if (adjustedDaysOfWeek.length > 0) {
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyOfOldData.daysOfWeek = adjustedDaysOfWeek;
              }

              // it is for formatting reason 
              copyOfOldData.users = oldEvent.userIds

              // isolate the event by setting random UUID from frontend
              copyOfOldData.eventGroupId = isolationGroupId
              copyOfOldData.id = oldEvent.id
              // update the main event
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfOldData,
                {
                  currentUser,
                  transaction,
                },
              );

              copyOfOldData.id = oldEvent.id
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfOldData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }

              let oldSupervisionData = false
              let leftDuration = subtractDateDifference(
                data.startRecur,
                oldEvent.startRecur,
              );

              if (oldEvent.supervisionId) {
                oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                  id: oldEvent.supervisionId,
                });

                // use it for left exploding part
                let copyForLeftSupervision = { ...oldSupervisionData };

                const copyOfOldSupervisionData = { ...oldSupervisionData };
                copyOfOldSupervisionData.sandboxMode = data.sandboxMode
                copyOfOldSupervisionData.startRecur = data.startRecur

                // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeek.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfOldSupervisionData.daysOfWeek = adjustedDaysOfWeek;
                }

                // it is for formatting reason 
                copyOfOldSupervisionData.users = oldSupervisionData.userIds

                // isolate the event by setting random UUID from frontend
                copyOfOldSupervisionData.eventGroupId = uuidv4()
                copyOfOldSupervisionData.id = oldSupervisionData.id
                // update the main event
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldSupervisionData.id,
                  copyOfOldSupervisionData,
                  {
                    currentUser,
                    transaction,
                  },
                );

                updatedSupervisionEvent.id = oldSupervisionData.id
                if (updatedSupervisionEvent) {
                  oldSupervisionData.users = oldSupervisionData.userIds
                  updatedEvents.push({
                    id: oldSupervisionData.id,
                    old: oldSupervisionData,
                    new: copyOfOldSupervisionData,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldSupervisionData.id);
                }


                // create for LEFT
                if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // set random uuid for making new one
                  copyForLeftSupervision.id = uuidv4();
                  copyForLeftSupervision.eventGroupId = uuidv4();

                  // left ends on the ONLY.startRecur
                  copyForLeftSupervision.supervisionId = null;
                  copyForLeftSupervision.endRecur = data.startRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                  // create new supervisionEvent (LEFT)
                  const newSupervisionEventForLeft = await EventsDBApi.create(
                    copyForLeftSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForLeft) {
                    copyForLeft.supervisionId = newSupervisionEventForLeft.id;
                    createdEvents.push(newSupervisionEventForLeft.id);
                    // add new supervision id of LEFT to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForLeft.id);
                  }

                  // left ends on the ONLY.startRecur
                  copyForLeft.id = null;
                  copyForLeft.endRecur = data.startRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  copyForLeft.users = copyForLeft.userIds;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.left) {
                    copyForLeft.id = additionalIds.left;
                  }
                  const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                    currentUser,
                    transaction,
                  });

                  if (newLeftEvent) {
                    createdEvents.push(newLeftEvent.id);
                    // add new left event id to allAffectedIds
                    allAffectedIds.push(newLeftEvent.id);
                  }
                }
              }

              if (!oldEvent.supervisionId) {
                // create for LEFT
                if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // left ends on the ONLY.startRecur
                  copyForLeft.id = null;
                  copyForLeft.users = copyForLeft.userIds;
                  copyForLeft.endRecur = data.startRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.left) {
                    copyForLeft.id = additionalIds.left;
                  }
                  const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                    currentUser,
                    transaction,
                  });
  
                  if (newLeftEvent) {
                    createdEvents.push(newLeftEvent.id);
                    // add new left event id to allAffectedIds
                    allAffectedIds.push(newLeftEvent.id);
                  }
                }
              }
  
              continue
            }
            // UPDATE it with new data and move it to RIGHT side, create new with old data for LEFT
            const copyOfData = { ...data };

            // set the RRULE formula to be the same as before (except startRecur)
            // because no matter with which part of group is called to update PARTLY we need to 
            // RRULE formulas of each part same except the left most events right parts startRecur
            // as it might have explosion on left
            copyOfData.endRecur = oldEvent.endRecur;
            copyOfData.interval = oldEvent.interval;
            copyOfData.bysetpos = oldEvent.bysetpos;
            copyOfData.frequency = oldEvent.frequency;

            // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
            // leaving this check in case of other edge cases
            if (adjustedDaysOfWeek.length > 0) {
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyOfData.daysOfWeek = adjustedDaysOfWeek;
            }

            let oldSupervisionData = false;
            let leftDuration = subtractDateDifference(
              copyOfData.startRecur,
              oldEvent.startRecur,
            );
      
            // GET the copy for LEFT of old event
            const copyForLeft = { ...oldEvent };

            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (copyOfData?.supervisionEvent) {
              newHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };

            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;

              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                copyOfData.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }

              // update the main event
              copyOfData.updateSupervisionID = true;
              // the main event will become the right part
              copyOfData.id = oldEvent.id;
              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = copyOfData.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };

              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null;

              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );

              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                copyOfData.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }

              // update the main event
              copyOfData.updateSupervisionID = true;
              // the main event will become the right part
              copyOfData.id = oldEvent.id;

              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // set random uuid for making new one
                copyForLeftSupervision.id = uuidv4();
                copyForLeftSupervision.eventGroupId = uuidv4();

                // left ends on the ONLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = copyOfData.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                // create new supervisionEvent (LEFT)
                const newSupervisionEventForLeft = await EventsDBApi.create(
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForLeft) {
                  copyForLeft.supervisionId = newSupervisionEventForLeft.id;
                  createdEvents.push(newSupervisionEventForLeft.id);
                  // add new supervision id of LEFT to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForLeft.id);
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = copyOfData.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              // if the LEFT is empty then delete supervision
              if (leftDuration === 0 || adjustedDaysOfWeekForOldEvents.length === 0){
                toBeDeletedIds.push(oldEvent.supervisionId);
              }
              
              // the main event will become the right part
              // update the main event
              copyOfData.updateSupervisionID = true;
              copyOfData.supervisionId = null;
              copyOfData.id = oldEvent.id;
              
              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // if LEFT is not empty so the supevision of main has not found the place
                // so update it to be LEFT

                // LEFT ends on the ONLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = copyOfData.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeftSupervision.id = oldEvent.supervisionId
                // update supervisionEvent to the LEFT
                const updatedSupervisionEventLEFT = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEventLEFT) {
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  copyForLeft.supervisionId = oldEvent.supervisionId;
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = copyOfData.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, and there is NO supervision before too
            if (!newHasSupervision && !oldHasSupervision) {
              // update the main event
              // the main event will become the right part
              copyOfData.updateSupervisionID = true;
              copyOfData.id = oldEvent.id;
              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;

              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = copyOfData.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }
          }

          // STEP 3: Explode RIGHT
          // EXPLODE RIGHT move it to left part and create for right
          if (isItExplodeRight){
            // create new adjusted daysOfWeek for the partly being isolated events
            const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
              startDate: data.startRecur,
              endDate: data.endRecur,
              daysOfWeek: oldEvent.daysOfWeek,
            });

            // if there was onlysandbox change, then do not touch anyting
            if (sandboxUpdate){
              const copyOfOldData = { ...oldEvent };
              // GET the copy for RIGHT of old event
              // use it for right exploding part
              const copyForRight = { ...oldEvent };
              
              copyOfOldData.sandboxMode = data.sandboxMode
              copyOfOldData.endRecur = data.endRecur

              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              if (adjustedDaysOfWeek.length > 0) {
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyOfOldData.daysOfWeek = adjustedDaysOfWeek;
              }
              
              // it is for formatting reason 
              copyOfOldData.users = oldEvent.userIds

              // isolate the event by setting random UUID from frontend
              copyOfOldData.eventGroupId = isolationGroupId
              copyOfOldData.id = oldEvent.id
              // update the main event
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfOldData,
                {
                  currentUser,
                  transaction,
                },
              );

              copyOfOldData.id = oldEvent.id
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfOldData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }

              let oldSupervisionData = false
              let rightDuration = subtractDateDifference(
                oldEvent.endRecur,
                data.endRecur,
              );

              if (oldEvent.supervisionId) {
                oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                  id: oldEvent.supervisionId,
                });

                // use it for right exploding part
                let copyForRightSupervision = { ...oldSupervisionData };

                const copyOfOldSupervisionData = { ...oldSupervisionData };
                copyOfOldSupervisionData.sandboxMode = data.sandboxMode
                copyOfOldSupervisionData.endRecur = data.endRecur

                // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeek.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfOldSupervisionData.daysOfWeek = adjustedDaysOfWeek;
                }

                // it is for formatting reason 
                copyOfOldSupervisionData.users = oldSupervisionData.userIds

                // isolate the event by setting random UUID from frontend
                copyOfOldSupervisionData.eventGroupId = uuidv4()
                copyOfOldSupervisionData.id = oldSupervisionData.id
                // update the main event
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldSupervisionData.id,
                  copyOfOldSupervisionData,
                  {
                    currentUser,
                    transaction,
                  },
                );

                updatedSupervisionEvent.id = oldSupervisionData.id
                if (updatedSupervisionEvent) {
                  oldSupervisionData.users = oldSupervisionData.userIds
                  updatedEvents.push({
                    id: oldSupervisionData.id,
                    old: oldSupervisionData,
                    new: copyOfOldSupervisionData,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldSupervisionData.id);
                }


                // create for RIGHT
                if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // set random uuid for making new one
                  copyForRightSupervision.id = uuidv4();
                  copyForRightSupervision.eventGroupId = uuidv4();

                  // right starts on the PARTLY.endRecur
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                  // create new supervisionEvent (RIGHT)
                  const newSupervisionEventForRight = await EventsDBApi.create(
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForRight) {
                    copyForRight.supervisionId = newSupervisionEventForRight.id;
                    createdEvents.push(newSupervisionEventForRight.id);
                    // add new supervision id of RIGHT to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForRight.id);
                  }

                  // right starts on the PARTLY.endRecur
                  copyForRight.id = null;
                  copyForRight.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  copyForRight.users = copyForRight.userIds;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.right) {
                    copyForRight.id = additionalIds.right;
                  }
                  const newRightEvent = await EventsDBApi.create(copyForRight, {
                    currentUser,
                    transaction,
                  });

                  if (newRightEvent) {
                    createdEvents.push(newRightEvent.id);
                    // add new right event id to allAffectedIds
                    allAffectedIds.push(newRightEvent.id);
                  }
                }
              }

              if (!oldEvent.supervisionId) {
                // create for RIGHT
                if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // right starts on the PARTLY.endRecyr
                  copyForRight.id = null;
                  copyForRight.users = copyForRight.userIds;
                  copyForRight.startRecur = data.endRecur
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.right) {
                    copyForRight.id = additionalIds.right;
                  }
                  const newRightEvent = await EventsDBApi.create(copyForRight, {
                    currentUser,
                    transaction,
                  });
  
                  if (newRightEvent) {
                    createdEvents.push(newRightEvent.id);
                    // add new right event id to allAffectedIds
                    allAffectedIds.push(newRightEvent.id);
                  }
                }
              }
              continue
            }
            // UPDATE it with new data and move it to LEFT side, create new with old data for RIGHT
            const copyOfData = { ...data };

            // set the RRULE formula to be the same as before (except endRecur)
            // because no matter with which part of group is called to update PARTLY we need to keep same
            // RRULE formulas of each part same except the right most event's left parts endRecur
            // as it might have explosion on left
            copyOfData.startRecur = oldEvent.startRecur;
            copyOfData.interval = oldEvent.interval;
            copyOfData.bysetpos = oldEvent.bysetpos;
            copyOfData.frequency = oldEvent.frequency;

            // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
            // leaving this check in case of other edge cases
            if (adjustedDaysOfWeek.length > 0) {
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyOfData.daysOfWeek = adjustedDaysOfWeek;
            }

            let oldSupervisionData = false;
            let rightDuration = subtractDateDifference(
              oldEvent.endRecur,
              copyOfData.endRecur,
            );
      
            // GET the copy for RIGHT of old event
            const copyForRight = { ...oldEvent };

            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (copyOfData?.supervisionEvent) {
              newHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForRightSupervision = { ...oldSupervisionData };
            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;

              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                copyOfData.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }

              // update the main event
              copyOfData.updateSupervisionID = true;
              // the main event will become the right part
              copyOfData.id = oldEvent.id;
              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // right starts on the PART.endRecur
                copyForRight.id = null;
                copyForRight.users = copyForRight.userIds;
                copyForRight.startRecur = copyOfData.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = copyOfData?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...copyOfData,
                ...supervisionEvent,
              };

              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null;

              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );

              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                copyOfData.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }

              // update the main event
              copyOfData.updateSupervisionID = true;
              // the main event will become the right part
              copyOfData.id = oldEvent.id;

              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // set random uuid for making new one
                copyForRightSupervision.id = uuidv4();
                copyForRightSupervision.eventGroupId = uuidv4();

                // right starts on the PARTLY.endRecur
                copyForRightSupervision.supervisionId = null;
                copyForRightSupervision.startRecur = copyOfData.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                // create new supervisionEvent (RIGHT)
                const newSupervisionEventForRight = await EventsDBApi.create(
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForRight) {
                  copyForRight.supervisionId = newSupervisionEventForRight.id;
                  createdEvents.push(newSupervisionEventForRight.id);
                  // add new supervision id of RIGHT to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForRight.id);
                }

                // right starts on the PARTLY.endRecur
                copyForRight.id = null;
                copyForRight.startRecur = copyOfData.endRecur;
                copyForRight.users = copyForRight.userIds;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              // if the RIGHT is empty then delete supervision
              if (rightDuration === 0 || adjustedDaysOfWeekForOldEvents.length === 0){
                toBeDeletedIds.push(oldEvent.supervisionId);
              }
              
              // the main event will become the left part
              // update the main event
              copyOfData.updateSupervisionID = true;
              copyOfData.supervisionId = null;
              copyOfData.id = oldEvent.id;
              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;

              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // if RIGHT is not empty so the supevision of main has not found the place
                // so update it to be RIGHT

                // RIGHT starts on the PARTLY.endRecur
                copyForRightSupervision.supervisionId = null;
                copyForRightSupervision.startRecur = copyOfData.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRightSupervision.id = oldEvent.supervisionId
                // update supervisionEvent to the RIGHT
                const updatedSupervisionEventRIGHT = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEventRIGHT) {
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForRightSupervision,
                  });
                  copyForRight.supervisionId = oldEvent.supervisionId;
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // right starts on the PARTLY.endRecur
                copyForRight.id = null;
                copyForRight.startRecur = copyOfData.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRight.users = copyForRight.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, and there is NO supervision before too
            if (!newHasSupervision && !oldHasSupervision) {
              // update the main event
              // the main event will become the left part
              copyOfData.updateSupervisionID = true;
              copyOfData.id = oldEvent.id;
              // then isolate the right part from group
              copyOfData.eventGroupId = isolationGroupId;

              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyOfData, {
                currentUser,
                transaction,
              });

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // right starts on the PARTLY.endRecur
                copyForRight.id = null;
                copyForRight.users = copyForRight.userIds;
                copyForRight.startRecur = copyOfData.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete copyOfData.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }
          }

          // STEP 4: Explode BOTH
          // EXPLODE BOTH, update it to be the updated range and create for left and right with old data
          if (isItExplodeBothSide){
            // create new adjusted daysOfWeek for the partly being isolated events
            const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
              startDate: data.startRecur,
              endDate: data.endRecur,
              daysOfWeek: oldEvent.daysOfWeek,
            });

            if (sandboxUpdate){
              const copyOfOldData = { ...oldEvent };
              // GET the copy for LEFT and RIGHT of old event
              // use it for left exploding part
              const copyForLeft = { ...oldEvent };
              const copyForRight = { ...oldEvent };
              
              copyOfOldData.sandboxMode = data.sandboxMode
              copyOfOldData.startRecur = data.startRecur
              copyOfOldData.endRecur = data.endRecur
              
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              if (adjustedDaysOfWeek.length > 0) {
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyOfOldData.daysOfWeek = adjustedDaysOfWeek;
              }

              // it is for formatting reason 
              copyOfOldData.users = oldEvent.userIds

              // isolate the event by setting random UUID from frontend
              copyOfOldData.eventGroupId = isolationGroupId
              copyOfOldData.id = oldEvent.id
              // update the main event
              const updatedEvent = await EventsDBApi.update(
                oldEvent.id,
                copyOfOldData,
                {
                  currentUser,
                  transaction,
                },
              );

              copyOfOldData.id = oldEvent.id
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyOfOldData,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }

              let oldSupervisionData = false
              let leftDuration = subtractDateDifference(
                data.startRecur,
                oldEvent.startRecur,
              );

              let rightDuration = subtractDateDifference(
                oldEvent.endRecur,
                data.endRecur,
              );


              if (oldEvent.supervisionId) {
                oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                  id: oldEvent.supervisionId,
                });

                // use it for left and right exploding part
                let copyForLeftSupervision = { ...oldSupervisionData };
                let copyForRightSupervision = { ...oldSupervisionData };

                const copyOfOldSupervisionData = { ...oldSupervisionData };
                copyOfOldSupervisionData.sandboxMode = data.sandboxMode
                copyOfOldSupervisionData.startRecur = data.startRecur
                copyOfOldSupervisionData.endRecur = data.endRecur

                // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
                // leaving this check in case of other edge cases
                if (adjustedDaysOfWeek.length > 0) {
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyOfOldSupervisionData.daysOfWeek = adjustedDaysOfWeek;
                }

                // it is for formatting reason 
                copyOfOldSupervisionData.users = oldSupervisionData.userIds

                // isolate the event by setting random UUID from frontend
                copyOfOldSupervisionData.eventGroupId = uuidv4()
                copyOfOldSupervisionData.id = oldSupervisionData.id
                // update the main event
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldSupervisionData.id,
                  copyOfOldSupervisionData,
                  {
                    currentUser,
                    transaction,
                  },
                );

                updatedSupervisionEvent.id = oldSupervisionData.id
                if (updatedSupervisionEvent) {
                  oldSupervisionData.users = oldSupervisionData.userIds
                  updatedEvents.push({
                    id: oldSupervisionData.id,
                    old: oldSupervisionData,
                    new: copyOfOldSupervisionData,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldSupervisionData.id);
                }

                // create for LEFT
                if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // set random uuid for making new one
                  copyForLeftSupervision.id = uuidv4();
                  copyForLeftSupervision.eventGroupId = uuidv4();

                  // left ends on the ONLY.startRecur
                  copyForLeftSupervision.supervisionId = null;
                  copyForLeftSupervision.endRecur = data.startRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                  // create new supervisionEvent (LEFT)
                  const newSupervisionEventForLeft = await EventsDBApi.create(
                    copyForLeftSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForLeft) {
                    copyForLeft.supervisionId = newSupervisionEventForLeft.id;
                    createdEvents.push(newSupervisionEventForLeft.id);
                    // add new supervision id of LEFT to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForLeft.id);
                  }

                  // left ends on the ONLY.startRecur
                  copyForLeft.id = null;
                  copyForLeft.endRecur = data.startRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  copyForLeft.users = copyForLeft.userIds;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.left) {
                    copyForLeft.id = additionalIds.left;
                  }
                  const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                    currentUser,
                    transaction,
                  });

                  if (newLeftEvent) {
                    createdEvents.push(newLeftEvent.id);
                    // add new left event id to allAffectedIds
                    allAffectedIds.push(newLeftEvent.id);
                  }
                }

                // create for RIGHT
                if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // set random uuid for making new one
                  copyForRightSupervision.id = uuidv4();
                  copyForRightSupervision.eventGroupId = uuidv4();

                  // right starts on the PARTLY.endRecur
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                  // create new supervisionEvent (RIGHT)
                  const newSupervisionEventForRight = await EventsDBApi.create(
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForRight) {
                    copyForRight.supervisionId = newSupervisionEventForRight.id;
                    createdEvents.push(newSupervisionEventForRight.id);
                    // add new supervision id of RIGHT to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForRight.id);
                  }

                  // right starts on the PARTLY.endRecur
                  copyForRight.id = null;
                  copyForRight.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  copyForRight.users = copyForRight.userIds;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.right) {
                    copyForRight.id = additionalIds.right;
                  }
                  const newRightEvent = await EventsDBApi.create(copyForRight, {
                    currentUser,
                    transaction,
                  });

                  if (newRightEvent) {
                    createdEvents.push(newRightEvent.id);
                    // add new right event id to allAffectedIds
                    allAffectedIds.push(newRightEvent.id);
                  }
                }
              }

              if (!oldEvent.supervisionId) {
                // create for LEFT
                if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // left ends on the ONLY.startRecur
                  copyForLeft.id = null;
                  copyForLeft.users = copyForLeft.userIds;
                  copyForLeft.endRecur = data.startRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.left) {
                    copyForLeft.id = additionalIds.left;
                  }
                  const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                    currentUser,
                    transaction,
                  });
  
                  if (newLeftEvent) {
                    createdEvents.push(newLeftEvent.id);
                    // add new left event id to allAffectedIds
                    allAffectedIds.push(newLeftEvent.id);
                  }
                }

                // create for RIGHT
                if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                  // right starts on the PARTLY.endRecur
                  copyForRight.id = null;
                  copyForRight.users = copyForRight.userIds;
                  copyForRight.startRecur = data.endRecur
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.right) {
                    copyForRight.id = additionalIds.right;
                  }
                  const newRightEvent = await EventsDBApi.create(copyForRight, {
                    currentUser,
                    transaction,
                  });
  
                  if (newRightEvent) {
                    createdEvents.push(newRightEvent.id);
                    // add new right event id to allAffectedIds
                    allAffectedIds.push(newRightEvent.id);
                  }
                }
              }
              continue
            }
            let oldSupervisionData = false;
            
            // set the RRULE formula to be the same as before (except startRecur,endRecur)
            // because no matter with which part of group is called to update PARTLY we need to 
            // RRULE formulas of each part same except the startRecur and endRecur
            data.interval = oldEvent.interval;
            data.bysetpos = oldEvent.bysetpos;
            data.frequency = oldEvent.frequency;

            // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
            // leaving this check in case of other edge cases
            if (adjustedDaysOfWeek.length > 0) {
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              data.daysOfWeek = adjustedDaysOfWeek;
            }

            let leftDuration = subtractDateDifference(
              data.startRecur,
              oldEvent.startRecur,
            );
            let rightDuration = subtractDateDifference(
              oldEvent.endRecur,
              data.endRecur,
            );

            // GET the copy for LEFT and RIGHT of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };

            let newHasSupervision = false;
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (data?.supervisionEvent) {
              newHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };

            // if there is supervision after update, we need to create if there is no in old
            if (newHasSupervision && !oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = data?.supervisionEvent;
              supervisionEvent.id = uuidv4();
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...data,
                ...supervisionEvent,
              };
              supervisionEventData.supervisionId = null;

              // create new supervisionEvent
              const newSupervisionEvent = await EventsDBApi.create(
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );
              if (newSupervisionEvent) {
                data.supervisionId = newSupervisionEvent.id;
                createdEvents.push(newSupervisionEvent.id);
                // add new supervisionId to allAffectedIds
                allAffectedIds.push(newSupervisionEvent.id);
              }

              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId;
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // left ends on the PARTLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // right start on the PARTLY.endRecur
                copyForRight.id = null;
                copyForRight.users = copyForRight.userIds;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is supervision after update, we need to update if there is already in old
            if (newHasSupervision && oldHasSupervision) {
              // set random uuid for making new one
              const supervisionEvent = data?.supervisionEvent;
              supervisionEvent.eventGroupId = uuidv4();

              const supervisionEventData = {
                ...data,
                ...supervisionEvent,
              };

              supervisionEventData.id = oldEvent.supervisionId;
              supervisionEventData.supervisionId = null

              // update supervisionEvent
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                supervisionEventData,
                {
                  currentUser,
                  transaction,
                },
              );

              if (updatedSupervisionEvent) {
                delete supervisionEventData.supervisionEvent;
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: supervisionEventData,
                });
                data.supervisionId = oldEvent.supervisionId;
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }

              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // set random uuid for making new one
                copyForLeftSupervision.id = uuidv4();
                copyForLeftSupervision.eventGroupId = uuidv4();

                // left ends on the PARTLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                // create new supervisionEvent (LEFT)
                const newSupervisionEventForLeft = await EventsDBApi.create(
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForLeft) {
                  copyForLeft.supervisionId = newSupervisionEventForLeft.id;
                  createdEvents.push(newSupervisionEventForLeft.id);
                  // add new supervision id of LEFT to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForLeft.id);
                }

                // left ends on the ONLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // set random uuid for making new one
                copyForRightSupervision.id = uuidv4();
                copyForRightSupervision.eventGroupId = uuidv4();

                // right start on the PARTLY.endRecur
                copyForRightSupervision.supervisionId = null;
                copyForRightSupervision.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                // create new supervisionEvent (RIGHT)
                const newSupervisionEventForRight = await EventsDBApi.create(
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForRight) {
                  copyForRight.supervisionId = newSupervisionEventForRight.id;
                  createdEvents.push(newSupervisionEventForRight.id);
                  // add new supervisionId of right to allAffectedIds
                  allAffectedIds.push(newSupervisionEventForRight.id);
                }

                // right start on the ONLY.endRecur
                copyForRight.id = null;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRight.users = copyForRight.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, we need to delete if there is in old
            if (!newHasSupervision && oldHasSupervision) {
              let mainSupervisionFoundPlace = false;
              // if the LEFT and RIGHT are empty then delete supervision
              if (
                (leftDuration === 0 && rightDuration === 0) ||
                adjustedDaysOfWeekForOldEvents.length === 0
              ) {
                // push the current supervision to delete array
                toBeDeletedIds.push(oldEvent.supervisionId);
                mainSupervisionFoundPlace = true;
              }

              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId
              data.supervisionId = null;
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // if LEFT is not empty so the supevision of main has not found the place
                // I mean mainSupervisionFoundPlace=FALSE, so update it to be LEFT

                // LEFT ends on the PARTLY.startRecur
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeftSupervision.id = oldEvent.supervisionId
                // update supervisionEvent to the LEFT
                const updatedSupervisionEventLEFT = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEventLEFT) {
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  copyForLeft.supervisionId = oldEvent.supervisionId;
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                  mainSupervisionFoundPlace = true
                }

                // left ends on the PARTLY.startRecur
                copyForLeft.id = null;
                copyForLeft.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.users = copyForLeft.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // it means the supervision already moved to LEFT
                if (mainSupervisionFoundPlace){
                  // set random uuid for making new one
                  copyForRightSupervision.id = uuidv4();
                  copyForRightSupervision.eventGroupId = uuidv4();

                  // right start on the PARTLY.endRecur
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

                  // create new supervisionEvent (RIGHT)
                  const newSupervisionEventForRight = await EventsDBApi.create(
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForRight) {
                    copyForRight.supervisionId = newSupervisionEventForRight.id;
                    createdEvents.push(newSupervisionEventForRight.id);
                    // add new supervisionId of right to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForRight.id);
                  }
                }else{
                  // It means mainSupervisionFoundPlace=FALSE so leftDuration=0
                  // so we can move the main supervision to be the RIGHT

                  // RIGHT starts on the PARTLY.endRecur
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                  copyForRightSupervision.id = oldEvent.supervisionId
                  // update supervisionEvent to the RIGHT
                  const updatedSupervisionEventRIGHT = await EventsDBApi.update(
                    oldEvent.supervisionId,
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (updatedSupervisionEventRIGHT) {
                    updatedEvents.push({
                      id: oldEvent.supervisionId,
                      old: oldSupervisionData,
                      new: updatedSupervisionEventRIGHT,
                    });
                    copyForRight.supervisionId = oldEvent.supervisionId;
                    // add supervisionId to allAffectedIds
                    allAffectedIds.push(oldEvent.supervisionId);
                    mainSupervisionFoundPlace = true;
                  }
                }

                // right start on the PARTLY.endRecur
                copyForRight.id = null;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRight.users = copyForRight.userIds;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }

            // if there is NO supervision after update, and there is NO supervision before too
            if (!newHasSupervision && !oldHasSupervision) {
              // update the main event
              // isolate the date by setting random UUID from frontend
              data.updateSupervisionID = true;
              data.eventGroupId = isolationGroupId
              data.id = oldEvent.id;
              const updatedEvent = await EventsDBApi.update(oldEvent.id, data, {
                currentUser,
                transaction,
              });

              // create for LEFT
              if (leftDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // left ends on the PARTLY.startRecur
                copyForLeft.id = null;
                copyForLeft.users = copyForLeft.userIds;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.endRecur = data.startRecur;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });

                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new left event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
                }
              }

              // create for RIGHT
              if (rightDuration > 0 && adjustedDaysOfWeekForOldEvents.length > 0) {
                // right start on the PARTLY.endRecur
                copyForRight.id = null;
                copyForRight.users = copyForRight.userIds;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRight.startRecur = data.endRecur;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });

                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new right event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
                }
              }

              if (updatedEvent) {
                delete data.supervisionEvent;
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: data,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);

                if (pushNotification?.send && pushNotification?.to?.length > 0) {
                  sendMultipleEventNotifications(
                    pushNotification.to,
                    updatedEvent,
                    currentUser,
                    pushNotification?.message,
                    'updated',
                  );
                }
              }
            }
          }
        }

        // delete all events of the group for creating single new one
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
      }

      await transaction.commit();
      return {
        deleted: deletedEvents,
        created: createdEvents,
        updated: updatedEvents,
        allAffectedIds: allAffectedIds,
      };
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async removeGroupedEvents(data, deleteType, isolationGroupId, currentUser, pushNotification, additionalIds) {
    const transaction = await db.sequelize.transaction();
    try {
      // TEMPORARY, eventGroupId should be provided by frontend
      // otherwise, just respond not found if eventGroupid is not provided
      if (!data.eventGroupId) {
        let existingEvent = await EventsDBApi.findBy({ id: data.id }, { transaction });
        if (!existingEvent) {
          throw new ValidationError('events.notFound');
        }
        data.eventGroupId = existingEvent.eventGroupId
      }

      const allEventsOfGroup = await EventsDBApi.findByGroupIds({
        eventGroupIds: data.eventGroupId,
        companyId: currentUser.companyId || '',
      });

      if (allEventsOfGroup.length === 0) {
        throw new ValidationError('events.notFound');
      }
      let deletedEvents = [];
      let createdEvents = [];
      let updatedEvents = [];
      let isolatedEvents = [];
      let toBeDeletedIds = [];
      let toBeDeletedButNotNotified = [];
      let allAffectedIds = []

      // CASE 1: if the DELETE_TYPE=ALL
      // Step 1: loop through whole group and delete all events and supervisions related
      if (deleteType === "ALL"){
        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup){
          // if there is supervision, then delete it
          if (oldEvent.supervisionId) {
            toBeDeletedIds.push(oldEvent.supervisionId);
          }

          // delete the main event
          if (oldEvent.id) {
            toBeDeletedIds.push(oldEvent.id);
          }

          if (pushNotification?.send && pushNotification?.to?.length > 0) {
            sendMultipleEventNotifications(
              pushNotification.to,
              oldEvent,
              currentUser,
              pushNotification?.message,
              'deleted',
            );
          }
        }

        // delete all tobedeleted
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
      }

      // CASE 2: if the DELETE_TYPE=ONLY
      // Step 1: Check the LEFT, RIGHT parts lentgh after deletion
      // Step 2.a: IF LEFT=RIGHT=0:
      //    Step 2.a.1: Isolate the event by changing eventGroupId and respond it in isolated
      //    Step 2.a.2: Just delete the event and respond it in deleted array frontend will be able to undo with that
      // Step 2.b: IF LEFT > 0:
      //    Step 2.b.1: Update the event to the LEFT part
      //    Step 2.b.2: Create new event on the date of deletion, then delete it but respond it in created array
      //                so frontend will be able to undo with that
      //    Step 2.b.3: IF RIGHT > 0: create new event for the right part
      // Step 2.c: IF LEFT = 0 AND RIGHT > 0:
      //    Step 2.c.1: Update the event to the RIGHT part
      //    Step 2.c.2: Create new event on the date of deletion, then delete it but respond it in created array
      //                so frontend will be able to undo with that
      if (deleteType === "ONLY"){
        const eventsGroupLastIndex = allEventsOfGroup.length - 1;
        let startEdgeRecur = allEventsOfGroup[0].startRecur;
        let endEdgeRecur = allEventsOfGroup[eventsGroupLastIndex].endRecur;

        // if the startRecur is the same as the first event of the group
        if (data.startRecur === allEventsOfGroup[0].startRecur) {
          if (
            data.endRecur === allEventsOfGroup[0].endRecur &&
            allEventsOfGroup.length > 1
          ) {
            startEdgeRecur = allEventsOfGroup[1].startRecur;
          } else {
            startEdgeRecur = data.endRecur;
          }
        }

        // if the endRecur is the same as the last event of the group
        if (data.endRecur === allEventsOfGroup[eventsGroupLastIndex].endRecur) {
          if (
            data.startRecur ===
              allEventsOfGroup[eventsGroupLastIndex].startRecur &&
            allEventsOfGroup.length > 1
          ) {
            endEdgeRecur = allEventsOfGroup[eventsGroupLastIndex - 1].endRecur;
          } else {
            endEdgeRecur = data.startRecur;
          }
        }

        // get the adjusted daysOfWeek for the updated event
        const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
          startDate: startEdgeRecur,
          endDate: endEdgeRecur,
          daysOfWeek: allEventsOfGroup[0].daysOfWeek,
        });

        // check if the daysOfWeek has changed
        const hasDaysOfWeekChanged =
          allEventsOfGroup[0].daysOfWeek.length !== adjustedDaysOfWeek.length;

        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup) {
          let isItPastEvent = false;
          let isItFutureEvent = false;
          let isItCurrentEvent = false;
          if (
            oldEvent.startRecur < data.startRecur &&
            oldEvent.endRecur < data.endRecur
          ) {
            isItPastEvent = true;
          }
          if (
            oldEvent.startRecur <= data.startRecur &&
            oldEvent.endRecur >= data.endRecur &&
            data.id === oldEvent.id
          ) {
            isItCurrentEvent = true;
          }
          if (
            oldEvent.startRecur > data.startRecur &&
            oldEvent.endRecur > data.endRecur
          ) {
            isItFutureEvent = true;
          }

          if (isItPastEvent) {
            // if daysOfWeek has not changed then skip
            if (
              hasDaysOfWeekChanged &&
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeek.length > 0
            ) {
              const pastEvent = { ...oldEvent };
              pastEvent.id = oldEvent.id;
              pastEvent.users = oldEvent.userIds;
              pastEvent.daysOfWeek = adjustedDaysOfWeek;

              const updatedPastEvent = await EventsDBApi.update(
                oldEvent.id,
                pastEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              pastEvent.id = oldEvent.id;
              if (updatedPastEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: pastEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          if (isItFutureEvent) {
            // if daysOfWeek has not changed then skip
            if (
              hasDaysOfWeekChanged &&
              // In fact, adjustedDaysOfWeek.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeek.length > 0
            ) {
              const futureEvent = { ...oldEvent };
              futureEvent.id = oldEvent.id;
              futureEvent.users = oldEvent.userIds;
              futureEvent.daysOfWeek = adjustedDaysOfWeek;

              const updatedFutureEvent = await EventsDBApi.update(
                oldEvent.id,
                futureEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              futureEvent.id = oldEvent.id;
              if (updatedFutureEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: futureEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          if (isItCurrentEvent) {
            let oldSupervisionData = false;
            let eventDuration = subtractDateDifference(
              data.endRecur,
              data.startRecur,
            );
            let leftDuration = subtractDateDifference(
              data.startRecur,
              oldEvent.startRecur,
            );
            let rightDuration = subtractDateDifference(
              oldEvent.endRecur,
              data.endRecur,
            );

            // it is ONLY so difference must be 1 day
            // LEFT and RIGHT must be non-negative
            if (eventDuration != 1 || leftDuration < 0 || rightDuration < 0) {
              // skip the current event and continue
              continue;
            }

            // GET the copy for LEFT and RIGHT, MIDDLE of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };
            const copyForMiddle = { ...oldEvent };

            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };
            let copyForMiddleSupervision = { ...oldSupervisionData };

            // if there is supervision on the event
            if (oldHasSupervision) {
              let mainEventFoundItsPlace = false;
              // if left and right is empty, then just delete the event
              // also delete the supervision too
              if ((leftDuration === 0 && rightDuration === 0) || adjustedDaysOfWeek.length === 0) {
                toBeDeletedIds.push(oldEvent.id);
                toBeDeletedIds.push(oldEvent.supervisionId);
                mainEventFoundItsPlace = true; // it is in the MIDDLE

                // Isolate the date and add it in isolated array for using it in undo
                await EventsDBApi.updateEventGroupId(
                  oldEvent.id,
                  isolationGroupId,
                  { transaction },
                );
                isolatedEvents.push({
                  eventId: oldEvent.id,
                  eventGroupId: oldEvent.eventGroupId,
                });
              }

              // 1. Move the event to left
              // 2. Create for event that deleted date
              // 3. Create event for right
              // if LEFT > 0 ----> it means mainEventFoundItsPlace=FALSE
              if (leftDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // --------------------LEFT-------------------------------- //
                copyForLeftSupervision.id = oldEvent.supervisionId;
                copyForLeftSupervision.supervisionId = null;
                // For shifting it to left we need to set startRecur of deleted date
                copyForLeftSupervision.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeek;
                // update supervisionEvent, squize it to LEFT
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEvent) {
                  delete copyForLeftSupervision.supervisionEvent;
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // update the main event
                copyForLeft.id = oldEvent.id;
                copyForLeft.supervisionId = oldEvent.supervisionId;
                copyForLeft.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeek;
                copyForLeft.users = copyForLeft.userIds;

                const updatedEvent = await EventsDBApi.update(
                  oldEvent.id,
                  copyForLeft,
                  {
                    currentUser,
                    transaction,
                  },
                );
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForLeft,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                  mainEventFoundItsPlace = true; // it is in the LEFT
                }

                // -------------------------LEFT - END-------------------------------- //

                // --------------------------MIDDLE-------------------------------- //
                // set random uuid for making new one
                copyForMiddleSupervision.id = uuidv4();
                copyForMiddleSupervision.eventGroupId = uuidv4();

                // set the startRecur and endRecur for deleted date
                copyForMiddleSupervision.supervisionId = null;
                copyForMiddleSupervision.startRecur = data.startRecur;
                copyForMiddleSupervision.endRecur = data.endRecur;

                // create new supervisionEvent (MIDDLE)
                const newSupervisionEventForMiddle = await EventsDBApi.create(
                  copyForMiddleSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForMiddle) {
                  copyForMiddle.supervisionId = copyForMiddleSupervision.id;
                  createdEvents.push(copyForMiddleSupervision.id);
                  // add new supervision id of MIDDLE to allAffectedIds
                  allAffectedIds.push(copyForMiddleSupervision.id);

                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(copyForMiddleSupervision.id);
                }

                copyForMiddle.id = null;
                copyForMiddle.startRecur = data.startRecur;
                copyForMiddle.endRecur = data.endRecur;
                copyForMiddle.users = copyForMiddle.userIds;
                copyForMiddle.eventGroupId = isolationGroupId;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.main) {
                  copyForMiddle.id = additionalIds.main;
                }
                const newMiddleEvent = await EventsDBApi.create(copyForMiddle, {
                  currentUser,
                  transaction,
                });

                if (newMiddleEvent) {
                  createdEvents.push(newMiddleEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newMiddleEvent.id);

                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newMiddleEvent.id);
                }
                // ------------------------MIDDLE - END-------------------------------- //
                // --------------------------RIGHT-------------------------------- //
                if (rightDuration) {
                  // set random uuid for making new one
                  copyForRightSupervision.id = uuidv4();
                  copyForRightSupervision.eventGroupId = uuidv4();

                  // RIGHT starts on the date of deletion
                  copyForRightSupervision.supervisionId = null;
                  copyForRightSupervision.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRightSupervision.daysOfWeek = adjustedDaysOfWeek;

                  // create new supervisionEvent (RIGHT)
                  const newSupervisionEventForRight = await EventsDBApi.create(
                    copyForRightSupervision,
                    {
                      currentUser,
                      transaction,
                    },
                  );

                  if (newSupervisionEventForRight) {
                    copyForRight.supervisionId = newSupervisionEventForRight.id;
                    createdEvents.push(newSupervisionEventForRight.id);
                    // add new supervision id of RIGHT to allAffectedIds
                    allAffectedIds.push(newSupervisionEventForRight.id);
                  }

                  // right starts on the ONLY.endRecur
                  copyForRight.id = null;
                  copyForRight.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRight.daysOfWeek = adjustedDaysOfWeek;
                  copyForRight.users = copyForRight.userIds;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.right) {
                    copyForRight.id = additionalIds.right;
                  }
                  const newRightEvent = await EventsDBApi.create(copyForRight, {
                    currentUser,
                    transaction,
                  });

                  if (newRightEvent) {
                    createdEvents.push(newRightEvent.id);
                    // add new right event id to allAffectedIds
                    allAffectedIds.push(newRightEvent.id);
                  }
                }

                // ------------------------RIGHT - END-------------------------------- //
              }

              // it means LEFT = 0
              // 1. Move the event to right
              // 2. Create event for deleted date
              if (rightDuration > 0 && !mainEventFoundItsPlace && adjustedDaysOfWeek.length > 0) {
                // --------------------RIGHT-------------------------------- //
                copyForRightSupervision.id = oldEvent.supervisionId;
                copyForRightSupervision.supervisionId = null;

                // For shifting it to right we need to set endRecur of deleted date
                copyForRightSupervision.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRightSupervision.daysOfWeek = adjustedDaysOfWeek;
                // update supervisionEvent, squize it to RIGHT
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEvent) {
                  delete copyForRightSupervision.supervisionEvent;
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForRightSupervision,
                  });
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // update the main event
                copyForRight.id = oldEvent.id;
                copyForRight.supervisionId = oldEvent.supervisionId;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeek;
                copyForRight.users = copyForLeft.userIds;

                const updatedEvent = await EventsDBApi.update(
                  oldEvent.id,
                  copyForRight,
                  {
                    currentUser,
                    transaction,
                  },
                );
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForRight,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                  mainEventFoundItsPlace = true; // it is in the RIGHT
                }

                // -------------------------RIGHT - END-------------------------------- //

                // --------------------------MIDDLE-------------------------------- //
                // set random uuid for making new one
                copyForMiddleSupervision.id = uuidv4();
                copyForMiddleSupervision.eventGroupId = uuidv4();

                // set the startRecur and endRecur for deleted date
                copyForMiddleSupervision.supervisionId = null;
                copyForMiddleSupervision.startRecur = data.startRecur;
                copyForMiddleSupervision.endRecur = data.endRecur;

                // create new supervisionEvent (MIDDLE)
                const newSupervisionEventForMiddle = await EventsDBApi.create(
                  copyForMiddleSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForMiddle) {
                  copyForMiddle.supervisionId = copyForMiddleSupervision.id;
                  createdEvents.push(copyForMiddleSupervision.id);
                  // add new supervision id of MIDDLE to allAffectedIds
                  allAffectedIds.push(copyForMiddleSupervision.id);

                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(copyForMiddleSupervision.id);
                }

                copyForMiddle.id = null;
                copyForMiddle.startRecur = data.startRecur;
                copyForMiddle.endRecur = data.endRecur;
                copyForMiddle.users = copyForMiddle.userIds;
                copyForMiddle.eventGroupId = isolationGroupId;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.main) {
                  copyForMiddle.id = additionalIds.main;
                }
                const newMiddleEvent = await EventsDBApi.create(copyForMiddle, {
                  currentUser,
                  transaction,
                });

                if (newMiddleEvent) {
                  createdEvents.push(newMiddleEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newMiddleEvent.id);

                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newMiddleEvent.id);
                }
                // ------------------------MIDDLE - END-------------------------------- //
              }
            }

            // if there is no supervision on the event
            if (!oldHasSupervision) {
              let mainEventFoundItsPlace = false;
              // if left and right is empty, then just delete the event
              // also delete the supervision too
              if ((leftDuration === 0 && rightDuration === 0) || adjustedDaysOfWeek.length === 0) {
                toBeDeletedIds.push(oldEvent.id);
                mainEventFoundItsPlace = true; // it is in the MIDDLE

                // Isolate the date and add it in isolated array for using it in undo
                await EventsDBApi.updateEventGroupId(
                  oldEvent.id,
                  isolationGroupId,
                  { transaction },
                );
                isolatedEvents.push({
                  eventId: oldEvent.id,
                  eventGroupId: oldEvent.eventGroupId,
                });
              }

              // 1. Move the event to left
              // 2. Create for event that deleted date
              // 3. Create event for right
              // if LEFT > 0 ----> it means mainEventFoundItsPlace=FALSE
              if (leftDuration > 0 && adjustedDaysOfWeek.length > 0) {
                // --------------------LEFT-------------------------------- //
                // update the main event to the LEFT
                copyForLeft.id = oldEvent.id;
                copyForLeft.endRecur = data.startRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeek;
                copyForLeft.users = copyForLeft.userIds;

                const updatedEvent = await EventsDBApi.update(
                  oldEvent.id,
                  copyForLeft,
                  {
                    currentUser,
                    transaction,
                  },
                );
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForLeft,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                  mainEventFoundItsPlace = true; // it is in the LEFT
                }

                // -------------------------LEFT - END-------------------------------- //

                // --------------------------MIDDLE-------------------------------- //
                // create and delete event for the deleted date
                copyForMiddle.id = null;
                copyForMiddle.startRecur = data.startRecur;
                copyForMiddle.endRecur = data.endRecur;
                copyForMiddle.users = copyForMiddle.userIds;
                copyForMiddle.eventGroupId = isolationGroupId;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.main) {
                  copyForMiddle.id = additionalIds.main;
                }
                const newMiddleEvent = await EventsDBApi.create(copyForMiddle, {
                  currentUser,
                  transaction,
                });

                if (newMiddleEvent) {
                  createdEvents.push(newMiddleEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newMiddleEvent.id);

                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newMiddleEvent.id);
                }
                // ------------------------MIDDLE - END-------------------------------- //
                // --------------------------RIGHT-------------------------------- //
                // create event for right part
                if (rightDuration) {
                  // right starts on the ONLY.endRecur
                  copyForRight.id = null;
                  copyForRight.startRecur = data.endRecur;
                  // here we're adjusting the daysOfWeek to avoid data inconsistency
                  copyForRight.daysOfWeek = adjustedDaysOfWeek;
                  copyForRight.users = copyForRight.userIds;
                  // set the new id from the request of Frontend if it was provided
                  if (additionalIds && additionalIds.right) {
                    copyForRight.id = additionalIds.right;
                  }
                  const newRightEvent = await EventsDBApi.create(copyForRight, {
                    currentUser,
                    transaction,
                  });

                  if (newRightEvent) {
                    createdEvents.push(newRightEvent.id);
                    // add new right event id to allAffectedIds
                    allAffectedIds.push(newRightEvent.id);
                  }
                }

                // ------------------------RIGHT - END-------------------------------- //
              }

              // it means LEFT = 0
              // 1. Move the event to right
              // 2. Create event for deleted date
              if (rightDuration > 0 && !mainEventFoundItsPlace && adjustedDaysOfWeek.length > 0) {
                // --------------------RIGHT-------------------------------- //
                // update the main event to the right
                copyForRight.id = oldEvent.id;
                copyForRight.supervisionId = oldEvent.supervisionId;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeek;
                copyForRight.users = copyForLeft.userIds;

                const updatedEvent = await EventsDBApi.update(
                  oldEvent.id,
                  copyForRight,
                  {
                    currentUser,
                    transaction,
                  },
                );
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForRight,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                  mainEventFoundItsPlace = true; // it is in the RIGHT
                }

                // -------------------------RIGHT - END-------------------------------- //

                // --------------------------MIDDLE-------------------------------- //
                copyForMiddle.id = null;
                copyForMiddle.startRecur = data.startRecur;
                copyForMiddle.endRecur = data.endRecur;
                copyForMiddle.users = copyForMiddle.userIds;
                copyForMiddle.eventGroupId = isolationGroupId;
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.main) {
                  copyForMiddle.id = additionalIds.main;
                }
                const newMiddleEvent = await EventsDBApi.create(copyForMiddle, {
                  currentUser,
                  transaction,
                });

                if (newMiddleEvent) {
                  createdEvents.push(newMiddleEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newMiddleEvent.id);

                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newMiddleEvent.id);
                }
                // ------------------------MIDDLE - END-------------------------------- //
              }
            }
          }
        }
      

        // delete all tobedeleted
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });

        // delete all toBeDeletedButNotNotified
        if (toBeDeletedButNotNotified && toBeDeletedButNotNotified.length > 0){
          let deletedEventsNotNotify = await EventsDBApi.bulkRemove(toBeDeletedButNotNotified, {
            transaction,
          });
        }
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
      }

      // CASE 3: if the DELETE_TYPE=FUTURE
      // Step 1: Check the LEFT part lentgh after deletion
      // Step 2.a: IF LEFT=0:
      //    Step 2.a.1: Isolate the event by changing eventGroupId and respond it in isolated
      //    Step 2.a.2: Just delete the event and respond it in deleted array frontend will be able to undo with that
      //    Step 2.a.3: Delete and isolate all elements of group which are in the future (respond them in isolated)
      // Step 2.b: IF LEFT > 0:
      //    Step 2.b.1: Update the event to the LEFT part
      //    Step 2.b.2: IF RIGHT > 0: create new event (isolated) for the right part and then delete it. Respond it in created
      //                in order to make that destroyed on undo
      //    Step 2.b.3: Delete all elements in the future also isolate them. Then respond them in isolated in order to let
      //                frontend use it in undo
      if (deleteType === "FUTURE"){
        let startEdgeRecur = allEventsOfGroup[0].startRecur;
        let endEdgeRecur = data.startRecur;

        const currentEventIndex = allEventsOfGroup.findIndex(
          (event) =>
            event.startRecur <= data.startRecur &&
            event.endRecur === data.endRecur &&
            event.id === data.id,
        );
        const currentEvent =
          currentEventIndex !== -1 ? allEventsOfGroup[currentEventIndex] : null;

        if (
          currentEvent &&
          currentEvent.startRecur === data.startRecur &&
          currentEventIndex - 1 >= 0
        ) {
          endEdgeRecur = allEventsOfGroup[currentEventIndex - 1].endRecur;
        }

        // get the adjusted daysOfWeek for the updated event
        const adjustedDaysOfWeekForPast = getAdjustedDaysOfWeek({
          startDate: startEdgeRecur,
          endDate: endEdgeRecur,
          daysOfWeek: allEventsOfGroup[0].daysOfWeek,
        });

        // check if the daysOfWeek has changed
        const hasDaysOfWeekChanged =
          allEventsOfGroup[0].daysOfWeek.length !== adjustedDaysOfWeekForPast.length;

        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup) {
          let isItPastEvent = false
          let isItFutureEvent = false
          let isItCurrentEvent = false
          if (oldEvent.startRecur < data.startRecur && oldEvent.endRecur < data.endRecur) {
            isItPastEvent = true
          }
          if (oldEvent.startRecur <= data.startRecur && oldEvent.endRecur === data.endRecur && data.id === oldEvent.id) {
            isItCurrentEvent = true
          }
          if (oldEvent.startRecur > data.startRecur && oldEvent.endRecur > data.endRecur) {
            isItFutureEvent = true
          }

          if (isItPastEvent) {
            if (
              hasDaysOfWeekChanged &&
              // In fact, adjustedDaysOfWeekForPast.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeekForPast.length > 0
            ) {
              const pastEvent = { ...oldEvent };
              pastEvent.id = oldEvent.id;
              pastEvent.users = oldEvent.userIds;
              pastEvent.daysOfWeek = adjustedDaysOfWeekForPast;

              const updatedPastEvent = await EventsDBApi.update(
                oldEvent.id,
                pastEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              pastEvent.id = oldEvent.id;
              if (updatedPastEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: pastEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue
          }

          // If it is future event, then delete it and isolate it
          if (isItFutureEvent){
            // if there is supervision, then delete it
            if (oldEvent.supervisionId) {
              toBeDeletedIds.push(oldEvent.supervisionId);
            }
  
            // delete the main event
            if (oldEvent.id) {
              toBeDeletedIds.push(oldEvent.id);
            }

            // Isolate the date and add it in isolated array for using it in undo
            await EventsDBApi.updateEventGroupId(oldEvent.id, isolationGroupId, {transaction})
            isolatedEvents.push({
              eventId: oldEvent.id,
              eventGroupId: oldEvent.eventGroupId
            })
    
            if (pushNotification?.send && pushNotification?.to?.length > 0) {
              sendMultipleEventNotifications(
                pushNotification.to,
                oldEvent,
                currentUser,
                pushNotification?.message,
                'deleted',
              );
            }
          }

          // If it is current event
          if (isItCurrentEvent){
            const copyOfData = { ...data };
            copyOfData.endRecur = oldEvent.endRecur
            let oldSupervisionData = false;
            let leftDuration = subtractDateDifference(
              copyOfData.startRecur,
              oldEvent.startRecur,
            );

            // GET the copy for LEFT and RIGHT of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };

            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };

            // if there is supervision on the event
            if (oldHasSupervision) {
              // if left is empty, then just delete the event
              // also delete the supervision too
              if (leftDuration === 0 || adjustedDaysOfWeekForPast.length === 0) {
                toBeDeletedIds.push(oldEvent.id)
                toBeDeletedIds.push(oldEvent.supervisionId)

                // Isolate the part and add it in isolated array for using it in undo
                await EventsDBApi.updateEventGroupId(oldEvent.id, isolationGroupId, {transaction})
                isolatedEvents.push({
                  eventId: oldEvent.id,
                  eventGroupId: oldEvent.eventGroupId
                })
              }
              
              // 1. Move the event to left
              // 2. Create event for right
              if (leftDuration > 0 && adjustedDaysOfWeekForPast.length > 0){            
                // --------------------LEFT-------------------------------- //
                copyForLeftSupervision.id = oldEvent.supervisionId;
                copyForLeftSupervision.supervisionId = null
                // For shifting it to left we need to set startRecur of deleted date
                copyForLeftSupervision.endRecur = data.startRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForPast;

                // update supervisionEvent, squize it to LEFT
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEvent) {
                  delete copyForLeftSupervision.supervisionEvent;
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // update the main event
                copyForLeft.id = oldEvent.id;
                copyForLeft.supervisionId = oldEvent.supervisionId;
                copyForLeft.endRecur = data.startRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForPast;
                copyForLeft.users = copyForLeft.userIds
                
                const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForLeft, {
                  currentUser,
                  transaction,
                });
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForLeft,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                }

                // -------------------------LEFT - END-------------------------------- //

                // --------------------------RIGHT-------------------------------- //
                // set random uuid for making new one
                copyForRightSupervision.id = uuidv4();
                copyForRightSupervision.eventGroupId = uuidv4();

                // set the startRecur and endRecur for delete right part
                copyForRightSupervision.supervisionId = null;
                copyForRightSupervision.startRecur = data.startRecur;
                copyForRightSupervision.endRecur = data.endRecur;

                // create new supervisionEvent (RIGHT)
                const newSupervisionEventForRight = await EventsDBApi.create(
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForRight) {
                  copyForRight.supervisionId = copyForRightSupervision.id;
                  createdEvents.push(copyForRightSupervision.id);
                  // add new supervision id of RIGHT to allAffectedIds
                  allAffectedIds.push(copyForRightSupervision.id);

                  // it is deleted part, so just delete it
                  toBeDeletedButNotNotified.push(copyForRightSupervision.id)
                }

                copyForRight.id = null;
                copyForRight.startRecur = data.startRecur;
                copyForRight.endRecur = data.endRecur;
                copyForRight.users = copyForRight.userIds;
                copyForRight.eventGroupId = isolationGroupId
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });
    
                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
    
                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newRightEvent.id)
                }

                // --------------------------RIGHT - END-------------------------------- //
              }
            }

            // if there is no supervision on the event
            if (!oldHasSupervision) {
              // if left is empty, then just delete the event
              if (leftDuration === 0 || adjustedDaysOfWeekForPast.length === 0) {
                toBeDeletedIds.push(oldEvent.id)
                // Isolate the event and add it in isolated array for using it in undo
                await EventsDBApi.updateEventGroupId(oldEvent.id, isolationGroupId, {transaction})
                isolatedEvents.push({
                  eventId: oldEvent.id,
                  eventGroupId: oldEvent.eventGroupId
                })
              }
              
              // 1. Move the event to left
              // 2. Create event for right
              if (leftDuration > 0 && adjustedDaysOfWeekForPast.length > 0){            
                // --------------------LEFT-------------------------------- //   
                // update the main event
                copyForLeft.id = oldEvent.id;
                copyForLeft.endRecur = data.startRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForPast;
                copyForLeft.users = copyForLeft.userIds
                
                const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForLeft, {
                  currentUser,
                  transaction,
                });
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForLeft,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                }

                // -------------------------LEFT - END-------------------------------- //

                // --------------------------RIGHT-------------------------------- //
                copyForRight.id = null;
                copyForRight.startRecur = data.startRecur;
                copyForRight.endRecur = data.endRecur;
                copyForRight.users = copyForRight.userIds;
                copyForRight.eventGroupId = isolationGroupId
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });
    
                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
    
                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newRightEvent.id)
                }

                // --------------------------RIGHT - END-------------------------------- //
              }
            }
          }
        }

        // delete all tobedeleted
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });

        // delete all toBeDeletedButNotNotified
        if (toBeDeletedButNotNotified && toBeDeletedButNotNotified.length > 0){
          let deletedEventsNotNotify = await EventsDBApi.bulkRemove(toBeDeletedButNotNotified, {
            transaction,
          });
        }
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
      }

      if (deleteType === "PARTLY"){
        const leftNearestEventIndex = allEventsOfGroup.findIndex(
          (event) =>
            event.endRecur > data.startRecur &&
            event.startRecur < data.endRecur,
        );
        let rightNearestEventIndex = [...allEventsOfGroup]
          .reverse()
          .findIndex(
            (event) =>
              event.startRecur < data.endRecur &&
              event.endRecur > data.startRecur,
          );

        rightNearestEventIndex =
          rightNearestEventIndex !== -1
            ? allEventsOfGroup.length - 1 - rightNearestEventIndex
            : -1;

        const leftNearestEvent =
          leftNearestEventIndex !== -1
            ? allEventsOfGroup[leftNearestEventIndex]
            : null;
        const rightNearestEvent =
          rightNearestEventIndex !== -1
            ? allEventsOfGroup[rightNearestEventIndex]
            : null;

        // if there is no left or right event, then do nothing
        if (!leftNearestEvent || !rightNearestEvent) {
          await transaction.commit();
          return {
            deleted: deletedEvents,
            created: createdEvents,
            updated: updatedEvents,
            allAffectedIds: allAffectedIds,
          };
        }

        if (leftNearestEvent.startRecur > data.startRecur) {
          data = {
            ...data,
            startRecur: leftNearestEvent.startRecur,
          };
        }

        if (rightNearestEvent.endRecur < data.endRecur) {
          data = {
            ...data,
            endRecur: rightNearestEvent.endRecur,
          };
        }

        let startEdgeRecur = allEventsOfGroup[0].startRecur;
        let endEdgeRecur =
          allEventsOfGroup[allEventsOfGroup.length - 1].endRecur;

        if (data.startRecur === startEdgeRecur) {
          if (
            data.endRecur === rightNearestEvent.endRecur &&
            rightNearestEventIndex + 1 < allEventsOfGroup.length
          ) {
            startEdgeRecur =
              allEventsOfGroup[rightNearestEventIndex + 1].startRecur;
          } else {
            startEdgeRecur = data.endRecur;
          }
        }

        if (data.endRecur === endEdgeRecur) {
          if (
            data.startRecur === leftNearestEvent.startRecur &&
            leftNearestEventIndex - 1 >= 0
          ) {
            endEdgeRecur = allEventsOfGroup[leftNearestEventIndex - 1].endRecur;
          } else {
            endEdgeRecur = data.startRecur;
          }
        }

        const adjustedDaysOfWeekForOldEvents = getAdjustedDaysOfWeek({
          startDate: startEdgeRecur,
          endDate: endEdgeRecur,
          daysOfWeek: allEventsOfGroup[0].daysOfWeek,
        });

        const hasDaysOfWeekForOldEventsChanged =
          allEventsOfGroup[0].daysOfWeek.length !==
          adjustedDaysOfWeekForOldEvents.length;

        // loop through all parts of group
        for (let oldEvent of allEventsOfGroup) {
          let isItFullyInside = false
          let isItExplodeRight = false
          let isItExplodeLeft = false
          let isItExplodeBothSide = false
          let isItPastEvent = false;
          let isItFutureEvent = false;
          // if being requested start is later than end then do nothing
          if (data.startRecur >= data.endRecur) {
            continue
          }

          // if it starts later the range then ---> isItFutureEvent=true
          if (oldEvent.startRecur >= data.endRecur) {
            isItFutureEvent = true;
          }

          // if it ends before the range then ---> isItPastEvent=true
          if (oldEvent.endRecur <= data.startRecur) {
            isItPastEvent = true;
          }

          // if it starts early and ends not later then ---> isItExplodeLeft=true
          // isItExplodeLeft=true ---> range must contain data.startRecur and at the same time it shouldnt end later
          if (oldEvent.startRecur < data.startRecur && oldEvent.endRecur > data.startRecur && oldEvent.endRecur <= data.endRecur) {
            isItExplodeLeft = true
          }

          // if it starts later and ends not before then ---> isItExplodeRight=true
          // isItExplodeRight=true ---> range must contain data.endRecur and at the same time it shouldnt start before
          if (oldEvent.startRecur < data.endRecur && oldEvent.endRecur > data.endRecur && oldEvent.startRecur >= data.startRecur) {
            isItExplodeRight = true
          }

          // if it starts early and ends later then ---> isItExplodeBothSide=true
          if (oldEvent.startRecur < data.startRecur && oldEvent.endRecur > data.endRecur){
            isItExplodeBothSide = true
          }

          // if it starts not early and ends not later then ---> isItFullyInside=true
          if (oldEvent.startRecur >= data.startRecur && oldEvent.endRecur <= data.endRecur){
            isItFullyInside = true
          }

          // STEP 0: Skip PAST
          // NOT IN RANGE skipping}
          if (isItPastEvent) {
            if (
              hasDaysOfWeekForOldEventsChanged &&
              // In fact, adjustedDaysOfWeekForOldEvents.length == 0 case should not happen,
              // leaving this check in case of other edge cases
              adjustedDaysOfWeekForOldEvents.length > 0
            ) {
              const pastEvent = { ...oldEvent };
              pastEvent.id = oldEvent.id;
              pastEvent.users = oldEvent.userIds;
              pastEvent.daysOfWeek = adjustedDaysOfWeekForOldEvents;

              const updatedPastEvent = await EventsDBApi.update(
                oldEvent.id,
                pastEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              pastEvent.id = oldEvent.id;
              if (updatedPastEvent) {
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: pastEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          // STEP 0: Skip FUTURE
          // NOT IN RANGE skipping}
          if (isItFutureEvent) {
            if (
              hasDaysOfWeekForOldEventsChanged &&
              // In fact, adjustedDaysOfWeekForOldEvents.length == 0 case should not happen, 
              // leaving this check in case of other edge cases
              adjustedDaysOfWeekForOldEvents.length > 0
            ) {
              const futureEvent = { ...oldEvent };
              futureEvent.id = oldEvent.id;
              futureEvent.users = oldEvent.userIds;
              futureEvent.daysOfWeek = adjustedDaysOfWeekForOldEvents;

              const updatedFutureEvent = await EventsDBApi.update(
                oldEvent.id,
                futureEvent,
                {
                  currentUser,
                  transaction,
                },
              );

              futureEvent.id = oldEvent.id;
              if (updatedFutureEvent) {
                updatedEvents.push({
                  id: oldEvent.id,
                  old: {
                    ...oldEvent,
                    users: oldEvent.userIds,
                  },
                  new: futureEvent,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
            }
            continue;
          }

          const deleteOldEvent = async () => {
            // if there is supervision, then delete it
            if (oldEvent.supervisionId) {
              toBeDeletedIds.push(oldEvent.supervisionId);
            }

            // delete the main event
            if (oldEvent.id) {
              toBeDeletedIds.push(oldEvent.id);
            }

            // Isolate the date and add it in isolated array for using it in undo
            await EventsDBApi.updateEventGroupId(
              oldEvent.id,
              isolationGroupId,
              { transaction },
            );
            isolatedEvents.push({
              eventId: oldEvent.id,
              eventGroupId: oldEvent.eventGroupId,
            });

            if (pushNotification?.send && pushNotification?.to?.length > 0) {
              sendMultipleEventNotifications(
                pushNotification.to,
                oldEvent,
                currentUser,
                pushNotification?.message,
                'deleted',
              );
            }
          };

          // STEP 1: Update FULLY INSIDE
          // FULLY IN RANGE deleting
          if (isItFullyInside){
            await deleteOldEvent();
            continue
          }

          // STEP 2: Explode LEFT
          // EXPLODE LEFT move it to left part and create for right then delete
          if (isItExplodeLeft){
            // It means that no need to preserve event itself
            if (adjustedDaysOfWeekForOldEvents.length === 0) {
              await deleteOldEvent();
              continue;
            }

            let oldSupervisionData = false;
            let leftDuration = subtractDateDifference(
              data.startRecur,
              oldEvent.startRecur,
            );

            // GET the copy for LEFT and RIGHT of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };

            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };

            // if there is supervision on the event
            if (oldHasSupervision) {
              // 1. Move the event to left
              // 2. Create event for right
              if (leftDuration > 0){            
                // --------------------LEFT-------------------------------- //
                copyForLeftSupervision.id = oldEvent.supervisionId;
                copyForLeftSupervision.supervisionId = null
                // For shifting it to left we need to set startRecur of deleted date
                copyForLeftSupervision.endRecur = data.startRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // update supervisionEvent, squize it to LEFT
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEvent) {
                  delete copyForLeftSupervision.supervisionEvent;
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForLeftSupervision,
                  });
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // update the main event
                copyForLeft.id = oldEvent.id;
                copyForLeft.supervisionId = oldEvent.supervisionId;
                copyForLeft.endRecur = data.startRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.users = copyForLeft.userIds
                
                const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForLeft, {
                  currentUser,
                  transaction,
                });
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForLeft,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                }

                // -------------------------LEFT - END-------------------------------- //

                // --------------------------RIGHT-------------------------------- //
                // set random uuid for making new one
                copyForRightSupervision.id = uuidv4();
                copyForRightSupervision.eventGroupId = uuidv4();

                // set the startRecur for delete right part
                copyForRightSupervision.supervisionId = null;
                copyForRightSupervision.startRecur = data.startRecur;

                // create new supervisionEvent (RIGHT)
                const newSupervisionEventForRight = await EventsDBApi.create(
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForRight) {
                  copyForRight.supervisionId = copyForRightSupervision.id;
                  createdEvents.push(copyForRightSupervision.id);
                  // add new supervision id of RIGHT to allAffectedIds
                  allAffectedIds.push(copyForRightSupervision.id);

                  // it is deleted part, so just delete it
                  toBeDeletedButNotNotified.push(copyForRightSupervision.id)
                }

                copyForRight.id = null;
                copyForRight.startRecur = data.startRecur;
                copyForRight.users = copyForRight.userIds;
                copyForRight.eventGroupId = isolationGroupId
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });
    
                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
    
                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newRightEvent.id)
                }

                // --------------------------RIGHT - END-------------------------------- //
              }
            }

            // if there is no supervision on the event
            if (!oldHasSupervision) {
              // 1. Move the event to left
              // 2. Create event for right
              if (leftDuration > 0){            
                // --------------------LEFT-------------------------------- //   
                // update the main event
                copyForLeft.id = oldEvent.id;
                copyForLeft.endRecur = data.startRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForLeft.users = copyForLeft.userIds
                
                const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForLeft, {
                  currentUser,
                  transaction,
                });
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForLeft,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                }

                // -------------------------LEFT - END-------------------------------- //

                // --------------------------RIGHT-------------------------------- //
                copyForRight.id = null;
                copyForRight.startRecur = data.startRecur;
                copyForRight.users = copyForRight.userIds;
                copyForRight.eventGroupId = isolationGroupId
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.right) {
                  copyForRight.id = additionalIds.right;
                }
                const newRightEvent = await EventsDBApi.create(copyForRight, {
                  currentUser,
                  transaction,
                });
    
                if (newRightEvent) {
                  createdEvents.push(newRightEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newRightEvent.id);
    
                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newRightEvent.id)
                }

                // --------------------------RIGHT - END-------------------------------- //
              }
            }
            continue
          }

          // STEP 3: Explode RIGHT
          // EXPLODE RIGHT move it to right part and create for left then delete
          if (isItExplodeRight){
            // It means that no need to preserve event itself
            if (adjustedDaysOfWeekForOldEvents.length === 0) {
              await deleteOldEvent();
              continue;
            }

            let oldSupervisionData = false;
            let rightDuration = subtractDateDifference(
              oldEvent.endRecur,
              data.endRecur,
            );

            // GET the copy for LEFT and RIGHT of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };

            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }

            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }

            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };

            // if there is supervision on the event
            if (oldHasSupervision) {
              // 1. Move the event to right
              // 2. Create event for left
              if (rightDuration > 0){            
                // --------------------RIGHT-------------------------------- //
                copyForRightSupervision.id = oldEvent.supervisionId;
                copyForRightSupervision.supervisionId = null
                // For shifting it to right we need to set endRecur of deleted range to the startRecur
                copyForRightSupervision.startRecur = data.endRecur
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                // update supervisionEvent, squize it to RIGHT
                const updatedSupervisionEvent = await EventsDBApi.update(
                  oldEvent.supervisionId,
                  copyForRightSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (updatedSupervisionEvent) {
                  delete copyForRightSupervision.supervisionEvent;
                  updatedEvents.push({
                    id: oldEvent.supervisionId,
                    old: oldSupervisionData,
                    new: copyForRightSupervision,
                  });
                  // add supervisionId to allAffectedIds
                  allAffectedIds.push(oldEvent.supervisionId);
                }

                // update the main event
                copyForRight.id = oldEvent.id;
                copyForRight.supervisionId = oldEvent.supervisionId;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRight.users = copyForRight.userIds
                
                const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForRight, {
                  currentUser,
                  transaction,
                });
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForRight,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                }

                // -------------------------RIGHT - END-------------------------------- //

                // --------------------------LEFT-------------------------------- //
                // set random uuid for making new one
                copyForLeftSupervision.id = uuidv4();
                copyForLeftSupervision.eventGroupId = uuidv4();

                // set the endRecur for delete left part
                copyForLeftSupervision.supervisionId = null;
                copyForLeftSupervision.endRecur = data.endRecur;

                // create new supervisionEvent (LEFT)
                const newSupervisionEventForLeft = await EventsDBApi.create(
                  copyForLeftSupervision,
                  {
                    currentUser,
                    transaction,
                  },
                );

                if (newSupervisionEventForLeft) {
                  copyForLeft.supervisionId = copyForLeftSupervision.id;
                  createdEvents.push(copyForLeftSupervision.id);
                  // add new supervision id of LEFT to allAffectedIds
                  allAffectedIds.push(copyForLeftSupervision.id);

                  // it is deleted part, so just delete it
                  toBeDeletedButNotNotified.push(copyForLeftSupervision.id)
                }

                copyForLeft.id = null;
                copyForLeft.endRecur = data.endRecur;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.eventGroupId = isolationGroupId
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });
    
                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
    
                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newLeftEvent.id)
                }

                // --------------------------LEFT - END-------------------------------- //
              }
            }

            // if there is no supervision on the event
            if (!oldHasSupervision) {
              // 1. Move the event to right
              // 2. Create event for left
              if (rightDuration > 0){            
                // --------------------RIGHT-------------------------------- //   
                // update the main event
                copyForRight.id = oldEvent.id;
                copyForRight.supervisionId = oldEvent.supervisionId;
                copyForRight.startRecur = data.endRecur;
                // here we're adjusting the daysOfWeek to avoid data inconsistency
                copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
                copyForRight.users = copyForRight.userIds
                
                const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForRight, {
                  currentUser,
                  transaction,
                });
                if (updatedEvent) {
                  oldEvent.users = oldEvent.userIds;
                  updatedEvents.push({
                    id: oldEvent.id,
                    old: oldEvent,
                    new: copyForRight,
                  });
                  // add updated eventId to allAffectedIds
                  allAffectedIds.push(oldEvent.id);
                }

                // -------------------------RIGHT - END-------------------------------- //

                // --------------------------LEFT-------------------------------- //
                copyForLeft.id = null;
                copyForLeft.endRecur = data.endRecur;
                copyForLeft.users = copyForLeft.userIds;
                copyForLeft.eventGroupId = isolationGroupId
                // set the new id from the request of Frontend if it was provided
                if (additionalIds && additionalIds.left) {
                  copyForLeft.id = additionalIds.left;
                }
                const newLeftEvent = await EventsDBApi.create(copyForLeft, {
                  currentUser,
                  transaction,
                });
    
                if (newLeftEvent) {
                  createdEvents.push(newLeftEvent.id);
                  // add new middle event id to allAffectedIds
                  allAffectedIds.push(newLeftEvent.id);
    
                  // it is deleted date, so just delete it
                  toBeDeletedButNotNotified.push(newLeftEvent.id)
                }
                // --------------------------LEFT - END-------------------------------- //
              }
            }
            continue
          }

          // STEP 4: Explode BOTH
          // EXPLODE BOTH, update it to be the left , create new for right , create new for requested range (then delete it)
          if (isItExplodeBothSide){
            // It means that no need to preserve event itself
            if (adjustedDaysOfWeekForOldEvents.length === 0) {
              await deleteOldEvent();
              continue;
            }

            let oldSupervisionData = false;
            // GET the copy for LEFT and RIGHT, MIDDLE of old event
            const copyForLeft = { ...oldEvent };
            const copyForRight = { ...oldEvent };
            const copyForMiddle = { ...oldEvent };
    
            let oldHasSupervision = false;
            if (oldEvent.supervisionId) {
              oldHasSupervision = true;
            }
    
            if (oldHasSupervision) {
              oldSupervisionData = await EventsDBApi.findByIdForUndoRedo({
                id: oldEvent.supervisionId,
              });
            }
    
            let copyForLeftSupervision = { ...oldSupervisionData };
            let copyForRightSupervision = { ...oldSupervisionData };
            let copyForMiddleSupervision = { ...oldSupervisionData };
    
            // if there is supervision on the event
            if (oldHasSupervision) {
              // 1. Move the event to left
              // 2. Create for event that deleted date range
              // 3. Create event for right
              
              // --------------------LEFT-------------------------------- //
              copyForLeftSupervision.id = oldEvent.supervisionId;
              copyForLeftSupervision.supervisionId = null
              // For shifting it to left we need to set startRecur of deleted date
              copyForLeftSupervision.endRecur = data.startRecur
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyForLeftSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;
              // update supervisionEvent, squize it to LEFT
              const updatedSupervisionEvent = await EventsDBApi.update(
                oldEvent.supervisionId,
                copyForLeftSupervision,
                {
                  currentUser,
                  transaction,
                },
              );
  
              if (updatedSupervisionEvent) {
                delete copyForLeftSupervision.supervisionEvent;
                updatedEvents.push({
                  id: oldEvent.supervisionId,
                  old: oldSupervisionData,
                  new: copyForLeftSupervision,
                });
                // add supervisionId to allAffectedIds
                allAffectedIds.push(oldEvent.supervisionId);
              }
  
              // update the main event
              copyForLeft.id = oldEvent.id;
              copyForLeft.supervisionId = oldEvent.supervisionId;
              copyForLeft.endRecur = data.startRecur
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
              copyForLeft.users = copyForLeft.userIds
              
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForLeft, {
                currentUser,
                transaction,
              });
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyForLeft,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
  
              // -------------------------LEFT - END-------------------------------- //
  
              // --------------------------MIDDLE-------------------------------- //
              // set random uuid for making new one
              copyForMiddleSupervision.id = uuidv4();
              copyForMiddleSupervision.eventGroupId = uuidv4();
  
              // set the startRecur and endRecur for deleted date
              copyForMiddleSupervision.supervisionId = null;
              copyForMiddleSupervision.startRecur = data.startRecur;
              copyForMiddleSupervision.endRecur = data.endRecur;
  
              // create new supervisionEvent (MIDDLE)
              const newSupervisionEventForMiddle = await EventsDBApi.create(
                copyForMiddleSupervision,
                {
                  currentUser,
                  transaction,
                },
              );
  
              if (newSupervisionEventForMiddle) {
                copyForMiddle.supervisionId = copyForMiddleSupervision.id;
                createdEvents.push(copyForMiddleSupervision.id);
                // add new supervision id of MIDDLE to allAffectedIds
                allAffectedIds.push(copyForMiddleSupervision.id);
  
                // it is deleted date, so just delete it
                toBeDeletedButNotNotified.push(copyForMiddleSupervision.id)
              }
  
              copyForMiddle.id = null;
              copyForMiddle.startRecur = data.startRecur;
              copyForMiddle.endRecur = data.endRecur;
              copyForMiddle.users = copyForMiddle.userIds;
              copyForMiddle.eventGroupId = isolationGroupId
              // set the new id from the request of Frontend if it was provided
              if (additionalIds && additionalIds.main) {
                copyForMiddle.id = additionalIds.main;
              }
              const newMiddleEvent = await EventsDBApi.create(copyForMiddle, {
                currentUser,
                transaction,
              });
  
              if (newMiddleEvent) {
                createdEvents.push(newMiddleEvent.id);
                // add new middle event id to allAffectedIds
                allAffectedIds.push(newMiddleEvent.id);
  
                // it is deleted date, so just delete it
                toBeDeletedButNotNotified.push(newMiddleEvent.id)
              }
              // ------------------------MIDDLE - END-------------------------------- //
              
              // --------------------------RIGHT-------------------------------- //
              // set random uuid for making new one
              copyForRightSupervision.id = uuidv4();
              copyForRightSupervision.eventGroupId = uuidv4();

              // RIGHT starts on the date of deletion
              copyForRightSupervision.supervisionId = null;
              copyForRightSupervision.startRecur = data.endRecur;
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyForRightSupervision.daysOfWeek = adjustedDaysOfWeekForOldEvents;

              // create new supervisionEvent (RIGHT)
              const newSupervisionEventForRight = await EventsDBApi.create(
                copyForRightSupervision,
                {
                  currentUser,
                  transaction,
                },
              );

              if (newSupervisionEventForRight) {
                copyForRight.supervisionId = newSupervisionEventForRight.id;
                createdEvents.push(newSupervisionEventForRight.id);
                // add new supervision id of RIGHT to allAffectedIds
                allAffectedIds.push(newSupervisionEventForRight.id);
              }

              // right starts on the ONLY.endRecur
              copyForRight.id = null;
              copyForRight.startRecur = data.endRecur;
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
              copyForRight.users = copyForRight.userIds;
              // set the new id from the request of Frontend if it was provided
              if (additionalIds && additionalIds.right) {
                copyForRight.id = additionalIds.right;
              }
              const newRightEvent = await EventsDBApi.create(copyForRight, {
                currentUser,
                transaction,
              });

              if (newRightEvent) {
                createdEvents.push(newRightEvent.id);
                // add new right event id to allAffectedIds
                allAffectedIds.push(newRightEvent.id);
              }
  
              // ------------------------RIGHT - END-------------------------------- //  
            }
    
            // if there is no supervision on the event
            if (!oldHasSupervision) {
              // 1. Move the event to left
              // 2. Create for event that deleted date
              // 3. Create event for right
              // --------------------LEFT-------------------------------- //
              // update the main event to the LEFT
              copyForLeft.id = oldEvent.id;
              copyForLeft.endRecur = data.startRecur
              copyForLeft.users = copyForLeft.userIds
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyForLeft.daysOfWeek = adjustedDaysOfWeekForOldEvents;
              
              const updatedEvent = await EventsDBApi.update(oldEvent.id, copyForLeft, {
                currentUser,
                transaction,
              });
              if (updatedEvent) {
                oldEvent.users = oldEvent.userIds;
                updatedEvents.push({
                  id: oldEvent.id,
                  old: oldEvent,
                  new: copyForLeft,
                });
                // add updated eventId to allAffectedIds
                allAffectedIds.push(oldEvent.id);
              }
  
              // -------------------------LEFT - END-------------------------------- //
  
              // --------------------------MIDDLE-------------------------------- //
              // create and delete event for the deleted date
              copyForMiddle.id = null;
              copyForMiddle.startRecur = data.startRecur;
              copyForMiddle.endRecur = data.endRecur;
              copyForMiddle.users = copyForMiddle.userIds;
              copyForMiddle.eventGroupId = isolationGroupId
              // set the new id from the request of Frontend if it was provided
              if (additionalIds && additionalIds.main) {
                copyForMiddle.id = additionalIds.main;
              }
              const newMiddleEvent = await EventsDBApi.create(copyForMiddle, {
                currentUser,
                transaction,
              });
  
              if (newMiddleEvent) {
                createdEvents.push(newMiddleEvent.id);
                // add new middle event id to allAffectedIds
                allAffectedIds.push(newMiddleEvent.id);
  
                // it is deleted date, so just delete it
                toBeDeletedButNotNotified.push(newMiddleEvent.id)
              }
              // ------------------------MIDDLE - END-------------------------------- //

              // --------------------------RIGHT-------------------------------- //
              // create event for right part
              // right starts on the ONLY.endRecur
              copyForRight.id = null;
              copyForRight.startRecur = data.endRecur;
              // here we're adjusting the daysOfWeek to avoid data inconsistency
              copyForRight.daysOfWeek = adjustedDaysOfWeekForOldEvents;
              copyForRight.users = copyForRight.userIds;
              // set the new id from the request of Frontend if it was provided
              if (additionalIds && additionalIds.right) {
                copyForRight.id = additionalIds.right;
              }
              const newRightEvent = await EventsDBApi.create(copyForRight, {
                currentUser,
                transaction,
              });

              if (newRightEvent) {
                createdEvents.push(newRightEvent.id);
                // add new right event id to allAffectedIds
                allAffectedIds.push(newRightEvent.id);
              }
  
              // ------------------------RIGHT - END-------------------------------- //  
            }
            continue
          }
        }

        // delete all tobedeleted
        deletedEvents = await EventsDBApi.bulkRemove(toBeDeletedIds, {
          transaction,
        });

        // delete all toBeDeletedButNotNotified
        if (toBeDeletedButNotNotified && toBeDeletedButNotNotified.length > 0){
          let deletedEventsNotNotify = await EventsDBApi.bulkRemove(toBeDeletedButNotNotified, {
            transaction,
          });
        }
        
        // add deleted eventIds to allAffectedIds
        allAffectedIds = [...allAffectedIds, ...deletedEvents]
      }

      await transaction.commit();
      return {
        deleted: deletedEvents,
        created: createdEvents,
        updated: updatedEvents,
        allAffectedIds: allAffectedIds,
        isolated : isolatedEvents,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async undeleteGroupedEvents(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      if (!data.eventGroupId) {
        throw new ValidationError('events.notFound');
      }

      const allEventsOfGroup = await EventsDBApi.findByGroupIds({
        eventGroupIds: data.eventGroupId,
        companyId: currentUser.companyId || '',
        includeDeleted: true,
      });

      if (allEventsOfGroup.length === 0) {
        throw new ValidationError('events.notFound');
      }
      
      let undeletedEvents = [];
      let toBeUndeletedIds = []
      let allAffectedIds = []

      for (let oldEvent of allEventsOfGroup){
        if (oldEvent.supervisionId) {
          toBeUndeletedIds.push(oldEvent.supervisionId);
        }

        if (oldEvent.id) {
          toBeUndeletedIds.push(oldEvent.id);
        }
      }

      undeletedEvents = await EventsDBApi.bulkUndelete(toBeUndeletedIds, {
        transaction,
      });

      allAffectedIds = [...allAffectedIds, ...undeletedEvents]

      await transaction.commit();
      return {
        undeleted: undeletedEvents,
        allAffectedIds: allAffectedIds,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async undoMultiple(data, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError('errors.forbidden.message');
      }
      let affectedEventIds = new Array();

      // undelete all soft deleted events
      if (data.deleted && data.deleted.length) {
        await EventsDBApi.restoreSoftDeletedInBulk({ ids: data.deleted }, {transaction});
        affectedEventIds = [...affectedEventIds, ...data.deleted]
      }

      // update back all updated events
      if (data.updated && data.updated.length) {
        for (let i = 0; i < data.updated.length; i++) {
          if (!data.updated[i].id || !data.updated[i].new){
            continue
          }
          // it is needed for updating the supervisionId back
          data.updated[i].old.updateSupervisionID = true
          let updatedEvent =await EventsDBApi.update(data.updated[i].id, data.updated[i].old, {
            currentUser,
            transaction,
          });

          if (updatedEvent){
            affectedEventIds.push(data.updated[i].id)
          }          
        }
      }
      

      let destroyedEventsData = new Array()
      // destroy (hard) all elements which are created in previous step
      if (data.created && data.created.length) {
        destroyedEventsData = await EventsDBApi.removeHardDeleteInBulk({ ids: data.created }, {transaction});
      }

      // integrate the isolated deleted events back
      if (data.isolated && data.isolated.length){
        for (let i = 0; i < data.isolated.length; i++) {
          await EventsDBApi.updateEventGroupId(data.isolated[i].eventId, data.isolated[i].eventGroupId, {transaction})
        }
      }

      if (data.undeleted && data.undeleted.length) {
        const deletedEvents = await EventsDBApi.bulkRemove(data.undeleted, {
          transaction,
        });
        affectedEventIds = [...affectedEventIds, ...deletedEvents];
      }

      await transaction.commit();
      
      return { affectedEventIds, destroyedEventsData };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async enableSandboxModeOfEvents(data, next) {
    const transaction = await db.sequelize.transaction();
    try {
      // TODO First find events by eventIds then update

      await EventsDBApi.enableSandboxModeOfEvents(data, {
        transaction,
      });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async cancelBulk(data, currentUser) {
    const cancelEvent = async ({ eventData, currentUser, transaction }) => {
      if (!eventData.eventGroupId) {
        throw new ValidationError('events.notFound');
      }

      const allEventsOfGroup = await EventsDBApi.findByGroupIds({
        eventGroupIds: eventData.eventGroupId,
        companyId: currentUser.companyId || '',
      });

      if (allEventsOfGroup.length === 0) {
        throw new ValidationError('events.notFound');
      }

      const cancellingEvent = allEventsOfGroup.find(
        (event) => event.id === eventData.eventId,
      );
      if (!cancellingEvent) {
        throw new ValidationError('events.notFound');
      }

      const eventsGroupLastIndex = allEventsOfGroup.length - 1;
      let startEdgeRecur = allEventsOfGroup[0].startRecur;
      let endEdgeRecur = allEventsOfGroup[eventsGroupLastIndex].endRecur;

      // if the startRecur is the same as the first event of the group
      if (cancellingEvent.startRecur === allEventsOfGroup[0].startRecur) {
        if (
          cancellingEvent.endRecur === allEventsOfGroup[0].endRecur &&
          allEventsOfGroup.length > 1
        ) {
          startEdgeRecur = allEventsOfGroup[1].startRecur;
        } else {
          startEdgeRecur = cancellingEvent.endRecur;
        }
      }

      // if the endRecur is the same as the last event of the group
      if (
        cancellingEvent.endRecur ===
        allEventsOfGroup[eventsGroupLastIndex].endRecur
      ) {
        if (
          cancellingEvent.startRecur ===
            allEventsOfGroup[eventsGroupLastIndex].startRecur &&
          allEventsOfGroup.length > 1
        ) {
          endEdgeRecur = allEventsOfGroup[eventsGroupLastIndex - 1].endRecur;
        } else {
          endEdgeRecur = cancellingEvent.startRecur;
        }
      }

      // get the adjusted daysOfWeek for the updated event
      const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
        startDate: startEdgeRecur,
        endDate: endEdgeRecur,
        daysOfWeek: allEventsOfGroup[0].daysOfWeek,
      });

      // check if the daysOfWeek has changed
      const hasDaysOfWeekChanged =
        allEventsOfGroup[0].daysOfWeek.length !== adjustedDaysOfWeek.length;

      for (let event of allEventsOfGroup) {
        let isItPastEvent = false;
        let isItFutureEvent = false;
        let isItCurrentEvent = false;
        if (
          event.startRecur < cancellingEvent.startRecur &&
          event.endRecur < cancellingEvent.endRecur
        ) {
          isItPastEvent = true;
        }
        if (
          event.startRecur === cancellingEvent.startRecur &&
          event.endRecur === cancellingEvent.endRecur &&
          event.id === cancellingEvent.id
        ) {
          isItCurrentEvent = true;
        }
        if (
          event.startRecur > cancellingEvent.startRecur &&
          event.endRecur > cancellingEvent.endRecur
        ) {
          isItFutureEvent = true;
        }

        if (isItPastEvent) {
          // if daysOfWeek has not changed then skip
          if (hasDaysOfWeekChanged && adjustedDaysOfWeek.length > 0) {
            const pastEvent = { ...event };
            pastEvent.id = event.id;
            pastEvent.users = event.userIds;
            pastEvent.daysOfWeek = adjustedDaysOfWeek;
            await EventsDBApi.update(event.id, pastEvent, {
              currentUser,
              transaction,
            });
          }
          continue;
        }

        if (isItFutureEvent) {
          // if daysOfWeek has not changed then skip
          if (hasDaysOfWeekChanged && adjustedDaysOfWeek.length > 0) {
            const futureEvent = { ...event };
            futureEvent.id = event.id;
            futureEvent.users = event.userIds;
            futureEvent.daysOfWeek = adjustedDaysOfWeek;

            await EventsDBApi.update(event.id, futureEvent, {
              currentUser,
              transaction,
            });
          }
          continue;
        }

        if (isItCurrentEvent) {
          const currentEvent = { ...event };
          currentEvent.id = event.id;
          currentEvent.eventGroupId = uuidv4();
          currentEvent.users = event.userIds;
          const adjustedDaysOfWeek = getAdjustedDaysOfWeek({
            startDate: currentEvent.startRecur,
            endDate: currentEvent.endRecur,
            daysOfWeek: currentEvent.daysOfWeek,
          });
          if (adjustedDaysOfWeek.length > 0) {
            currentEvent.daysOfWeek = adjustedDaysOfWeek;
          }
          currentEvent.isCancelled = true;
          currentEvent.cancellationReasonId = eventData.cancellationReasonId;
          currentEvent.cancelledByUserId = eventData.cancelledByUserId;

          await EventsDBApi.update(event.id, currentEvent, {
            currentUser,
            transaction,
          });
        }
      }
    };

    const transaction = await db.sequelize.transaction();
    try {
      for (let i = 0; i < data.length; i++) {
        await cancelEvent({
          eventData: data[i],
          currentUser,
          transaction,
        });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // it just removes event that is all
  static async remove(id, currentUser, pushNotification) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError('errors.forbidden.message');
      }

      const event = await EventsDBApi.remove(id, {
        currentUser,
        transaction,
      });

      if (pushNotification?.send && pushNotification?.to?.length > 0) {
        sendMultipleEventNotifications(
          pushNotification.to,
          event,
          currentUser,
          pushNotification?.message,
          'deleted',
        );
      }

      await transaction.commit();
      return event;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
