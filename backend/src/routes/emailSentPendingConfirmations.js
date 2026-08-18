const express = require('express');

const StatuseventsDBApi = require('../db/api/statusevents');
const EmailSentPendingConfirmationsDBApi = require('../db/api/emailSentPendingConfirmations');
const EventsDBApi = require('../db/api/events');
const db = require('../db/models');
const wrapAsync = require('../helpers').wrapAsync;
const moment = require('moment');

const router = require('../utils/createRouter')();

router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const transaction = await db.sequelize.transaction();
    // get the emailSentPendingConfirmation
    let espc = await EmailSentPendingConfirmationsDBApi.findBy(
      {
        id: req.params.id,
      },
      { transaction },
    );
    if (!espc) {
      await transaction.commit()
      res.status(200).send(false);
      return;
    }

    // split eventIds of emailSentPendingConfirmation
    let eventIds = espc.eventIdConcatenation.split('|');
    let userId = espc.userId;

    /* ==================================================================================================== 
    =======================================================================================================
    =======================================================================================================

    Get the all event start, startRecur for creating the startdatetime of statusevent                    
    Here I do 2 exclusion on events:                                                                     
                                                                                  
     1.  If the user is removed from event after he has been sent email
         I do not create confirmation for that event because he is not in that event
    
     2.  If the event is deleted after it has been sent in email to some user.

    Basically I get the events with the ids in espc.eventIdConcatenation and user with espc.userId
    That is why I assigned the variable existingEvents

    =======================================================================================================
    =======================================================================================================
    ==================================================================================================== */
    let existingEvents =
      await EventsDBApi.findAllEventDateInfoOfUserForStatuseventConfirmation(
        {
          eventIds: eventIds,
          userId: userId,
        },
        { transaction },
      );

    // create Confirmed statusevent for each event
    // If there is statusevent with same (status, startdatetime, userId, eventId)
    // it will not create duplicated statusevent
    for (let i = 0; i < existingEvents.rows.length; i++) {
      await StatuseventsDBApi.create(
        {
          startdatetime: moment
            .utc(
              existingEvents.rows[i].startRecur +
                ' ' +
                moment.utc(existingEvents.rows[i].start).format('HH:mm'),
            )
            .toDate(),
          status: 'Confirmed',
          event: existingEvents.rows[i].id,
          user: userId,
        },
        {
          currentUser: {
            id: userId,
          },
          transaction,
        },
      );
    }


    // remove emailSentPendingConfirmation after confirming all events
    await EmailSentPendingConfirmationsDBApi.remove(req.params.id, {
      currentUser: {
        id: userId,
      },
      transaction,
    });

    await transaction.commit();
    res.status(200).send(true);
  }),
);

router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
