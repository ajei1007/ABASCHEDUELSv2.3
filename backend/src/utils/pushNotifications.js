// const TimeofftypesDBApi = require('../db/api/timeofftypes');
// const UsersDBApi = require('../db/api/users');
const filterDisabled = require('./filterDisabled');
// Utils
const UsersDBApi = require('../db/api/users');
const PushnotificationsService = require('../services/pushnotifications');
const { getUserAndRole } = require('./getUserRole');
const sendPushNotification = require('./sendPushNotification');
const moment = require('moment');
const { getIO } = require('../socket');
const logger = require('../services/logger/logger');

/* NOTIFICATIONS */

// New appointment Created (multiple notification)
const sendMultipleEventNotifications = async (
  userIds,
  event,
  currentUser,
  message = null,
  type = 'created',
) => {
  logger.info('Sending multiple event notifications');
  let preTitle = '';
  switch (type) {
    case 'created':
      preTitle = 'Created';
      break;
    case 'updated':
      preTitle = 'Updated';
      break;
    case 'deleted':
      preTitle = 'Deleted';
      break;
    default:
      break;
  }
  // const date = moment(event.start).format('MM/DD')
  // const startTime = moment(event.start).format('hh:mma')
  // const endTime = moment(event.end).format('hh:mma')
  // const location = event?.location0?.firstName;

  const title = `Event ${preTitle}`;
  const body = message || '';

  for (let i = 0; i < userIds.length; i++) {
    try {
      // FIND USER AND USER"S ROLE

      const { user } = await getUserAndRole(userIds[i], currentUser, false);
      if (!user) continue;
      // if (role.toLowerCase() === 'admin') continue;

      // Notification data
      // const startRecur = moment(event.startRecur).format('MM/DD/YYYY HH:mm')
      // const endRecur = moment(event.endRecur).format('MM/DD/YYYY HH:mm')

      const pushNotificationData = {
        event: event.id,
        date: event.start,
        users: [userIds[i]],
        message: body,
      };
      // Create Push Notification
      const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);

      if (newPushNotification) {
        const data = { eventId: event.id, date: event.start, users: userIds, pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
        await sendPushNotification(user.mobiletokens, { title, body, data }, `sendMultipleEventNotifications:user-${currentUser.id}:company-${currentUser.company.id}`);
      }
    } catch (error) {
      console.log('error', error);
      logger.error(error, {
        message: 'Error sending multiple event notifications',
        error: error.message,
        stack: error.stack,
        user: userIds[i],
        event: event.id,
      });
      return;
    }
    logger.info('Finished sending multiple event notifications');
  }
};

// Client changes his/her appointment status (multiple notification)
const sendAppointmentStatusChangeNotificationToAdmins = async (statusData, currentUser) => {
  logger.info('Sending appointment status change notification to admins');
  if (statusData.status !== 'Pending Cancelation') return

  const io = getIO();

  let payload = await UsersDBApi.findAllAdmin({
    adminNames: ['Super Admin'],
    company: currentUser.companyId
  });
  const parsedPayload = JSON.parse(JSON.stringify(filterDisabled(payload)));
  const admins = parsedPayload.rows ?? [];

  if (admins?.length === 0) return;

  let titleMessage = '';
  for (const user of admins) {
    if (!user) continue;

    if (statusData.status === 'Confirmed')
      titleMessage = `Confirmed`; //  by ${currentUser.firstName}
    if (statusData.status === 'Pending Confirmation')
      titleMessage = `Pending Confirmation`;
    if (statusData.status === 'Pending Cancelation')
      titleMessage = `Pending Cancellation`;
    if (statusData.status === 'Canceled')
      titleMessage = `Cancellation`;

    // const startRecur = moment(data.startdatetime).format('MM/DD/YYYY HH:mm');
    const title = titleMessage;
    const body = `Note: ${statusData?.note ?? 'No any notes!'}`;
    // TODO update saved data
    const pushNotificationData = {
      eventId: statusData?.event,
      date: statusData?.startdatetime,
      users: [user.id],
      message: titleMessage,
      type: 'requests',
    };

    // Create Push Notification
    const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);
    if (newPushNotification) {
      const data = { eventId: statusData?.event, date: statusData?.startdatetime, users: [user.id], pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
      await sendPushNotification(user.mobiletokens, { title, body, data }, `sendAppointmentStatusChangeNotificationToAdmins:user-${currentUser.id}:company-${currentUser.company.id}`);
    }
  }

  const userIds = admins.map(admin => admin.id);

  const pushNotificationDataToEmit = {
    eventId: statusData?.event,
    date: statusData?.startdatetime,
    users: userIds,
    message: titleMessage,
    type: 'requests',
  }

  io.to(userIds).emit('notification', { pushNotificationDataToEmit });
  logger.info('Finished sending appointment status change notification to admins');
};

// Send notif to users when request is Approved/Declined
const sendAppointmentStatusChangeNotificationToUsers = async (data, currentUser) => {
  logger.info('Sending appointment status change notification to users');
  const event = data.event;
  const users = event.users;

  // if (data.status !== 'Confirmed' || data.status === 'Canceled') return
  if (users?.length === 0) return;
  const userIds = users.map((u) => u.id);

  for (let i = 0; i < userIds.length; i++) {
    try {
      // FIND USER AND USER"S ROLE
      let user = await UsersDBApi.findBy({ id: userIds[i] });
      if (!user) continue;

      // Notification data
      let titleMessage = '';
      if (data.status === 'Confirmed')
        titleMessage = `Your Appointment is Confirmed by ${currentUser.firstName}`;
      if (data.status === 'Canceled')
        titleMessage = `Your Appointment is Canceled by ${currentUser.firstName}`;
      if (data.status === 'Pending Confirmation')
        titleMessage = `Your Appointment is Pending Confirmation`;

      const title = 'Request update!';
      const event = data.event;
      const body = titleMessage;

      const pushNotificationData = {
        eventId: event.id,
        date: event.start,
        users: [user.id],
        message: titleMessage,
        type: 'requests',
        notificationType: data.status === 'Canceled' ? 'Danger' : 'Default',
      };

      // Create Push Notification
      const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);
      if (newPushNotification) {
        const finalData = { ...pushNotificationData, pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
        await sendPushNotification(user.mobiletokens, { title, body, data: finalData }, `sendAppointmentStatusChangeNotificationToUsers:user-${currentUser.id}:company-${currentUser.company.id}`);
      }
    } catch (error) {
      console.log('error', error);
      return;
    }
  }
  logger.info('Finished sending appointment status change notification to users');
};

// Client requests availability/timeoff requests (multiple notification)
const sendAavailabilityRequestNotificationToAdmins = async (requestData, currentUser) => {
  logger.info('Sending availability request notification to admins');
  if (!requestData.user) return;

  let payload = await UsersDBApi.findAllAdmin({
    adminNames: ['Super Admin'],
    company: currentUser.companyId
  });
  const parsedPayload = JSON.parse(JSON.stringify(filterDisabled(payload)));
  const admins = parsedPayload.rows ?? [];

  if (admins?.length === 0) return;

  for (const user of admins) {
    if (!user) continue;

    let requestedUser = await UsersDBApi.findBy({ id: requestData.user });
    const requestedUserFullName = `${requestedUser?.firstName} ${requestedUser?.lastName ?? ''}`
    let titleMessage = requestData?.timeoff ?
      `Time Off Request by ${requestedUserFullName}` :
      `Availability Request by ${requestedUserFullName}`;

    const startRecur = moment(requestData.startRange).format('MM/DD/YYYY')
    const endRecur = moment(requestData.endRange).format('MM/DD/YYYY')
    const title = titleMessage;
    const body = `From ${startRecur} to ${endRecur}`;
    const pushNotificationData = {
      eventId: '',
      date: requestData.requestedAt,
      users: [user.id],
      message: titleMessage,
      type: 'requests',
    };

    // Create Push Notification
    const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);
    if (newPushNotification) {
      const data = { ...pushNotificationData, pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
      await sendPushNotification(user.mobiletokens, { title, body, data }, `sendAavailabilityRequestNotificationToAdmins:user-${currentUser.id}:company-${currentUser.company.id}`);
    }
  }
  logger.info('Finished sending availability request notification to admins');
};
// Send notif to users when request is Approved/Declined
const sendAvailabilityRequestStatusChangeNotificationToUsers = async (data, status, currentUser) => {
  logger.info('Sending availability request status change notification to users');
  if (!data.user) return;
  try {
    // FIND USER AND USER"S ROLE
    let user = await UsersDBApi.findBy({ id: data.user.id });
    if (!user) return;

    // Notification data
    const title = `Your ${data?.timeoff ? 'Time Off' : 'Availability'} Request is ${status} by ${currentUser.firstName}`;
    const startRecur = moment(data.startRange).format('MM/DD/YYYY')
    const endRecur = moment(data.endRange).format('MM/DD/YYYY')
    const body = `From ${startRecur} to ${endRecur}`;

    const pushNotificationData = {
      eventId: '',
      date: data.requestedAt,
      users: [user.id],
      message: title,
      type: 'requests',
    };
    // Create Push Notification
    const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);
    if (newPushNotification) {
      const data = { ...pushNotificationData, pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
      await sendPushNotification(user.mobiletokens, { title, body, data }, `sendAvailabilityRequestStatusChangeNotificationToUsers:user-${currentUser.id}:company-${currentUser.company.id}`);
    }
  } catch (error) {
    console.log('error', error);
    return;
  }
  logger.info('Finished sending availability request status change notification to users');
};

// New appointment Created (multiple notification)
const sendMultipleOnCallNotifications = async (
  userIds,
  availability,
  currentUser,
) => {
  logger.info('Sending multiple on call notifications');
  const title = `ABASchedules`;
  const body = `On-call scheduled: ${moment(availability.startRange).format('MM/DD/YYYY')}`;

  for (const userId of userIds) {
    try {
      // FIND USER AND USER"S ROLE
      const { user } = await getUserAndRole(userId, currentUser, false);
      if (!user) continue;

      const pushNotificationData = {
        date: availability.startRange,
        users: [userId],
        message: body,
      };
      // Create Push Notification
      const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);

      if (newPushNotification) {
        const data = { availabilityId: availability.id, date: availability.startRange, users: userIds, pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
        await sendPushNotification(user.mobiletokens, { title, body, data }, `sendMultipleOnCallNotifications:user-${currentUser.id}:company-${currentUser.company.id}`);
      }
    } catch (error) {
      console.log('error', error);
      return;
    } 
  }
  logger.info('Finished sending multiple on call notifications');
};

// Send notifications to multiple users at once
const sendMultiplNotifs = async (
  userIds,
  message,
  currentUser,
  req
) => {
  logger.info('Sending multiple notifications');
  // SOCKET CODE
  const io = req.app.get('socketio');

  const title = `ABASchedules`;
  const currentDate = moment().format();
  
  try {
    if (userIds.length === 0) return;

    const userPromises = userIds.map(userId => getUserAndRole(userId, currentUser, false));
    const userResults = await Promise.all(userPromises);
    
    for (const userData of userResults) {
      const { user } = userData;

      if (!user) {
        continue;
      }
      
      const pushNotificationData = {
        date: moment().format(),
        users: [user.id],
        message: message,
        checked: false
      };

      // Create Push Notification
      const newPushNotification = await PushnotificationsService.create(pushNotificationData, currentUser);

      if (newPushNotification) {
        const data = { date: moment().format(), users: userIds, pushNotificaion: { ...pushNotificationData, id: newPushNotification.id } };
        await sendPushNotification(user.mobiletokens, { title, body: message, data }, `sendMultiplNotifs:user-${currentUser.id}:company-${currentUser.company.id}`);
      }
    }

    const pushNotificationDataToEmit = {
      date: currentDate,
      users: userIds,
      message: message,
      checked: false
    }

    // Emit socket notification to all users at once
    io.to(userIds).emit('notification', {pushNotificationDataToEmit});
  } catch (error) {
    console.log('error sending multiple notifications:', error);
    logger.error(error, {
      message: 'Error sending multiple notifications',
      error: error.message,
      stack: error.stack,
      userIds: userIds,
    });
  }
  logger.info('Finished sending multiple notifications');
};

module.exports = {
  // appointment
  sendMultipleEventNotifications,
  sendAppointmentStatusChangeNotificationToAdmins,
  sendAppointmentStatusChangeNotificationToUsers,
  sendMultipleOnCallNotifications,
  sendMultiplNotifs,
  sendAavailabilityRequestNotificationToAdmins,
  sendAvailabilityRequestStatusChangeNotificationToUsers
  // timeoff
  // sendCreatedTimeoffNotification,
  // sendDeletedTimeoffNotification,
  // sendTimeOffStatusChangeNotification,
};
