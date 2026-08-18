const config = require('../config');
const EmailSender = require('../services/email');
const puppeteer = require('puppeteer');
const {
  userEventsForSchedulerPDF,
  userSchedulesContents,
} = require('../services/notifications/templates/scheduler');
const _ = require('lodash');
const BranchesDBApi = require('../db/api/branches');
const UsersDBApi = require('../db/api/users');
const { getRoleHierarchy } = require('../utils/roleHierarchy');
const moment = require('moment');
const moment_tz = require('moment-timezone');
const EventsDBApi = require('../db/api/events');
const EmailSentPendingConfirmationsDBApi = require('../db/api/emailSentPendingConfirmations');
const rule_RRule = require('rrule');
const { sendMultiplNotifs } = require('../utils/pushNotifications');
const isDateInDST = require('../utils/isDateInDST');
const calculateTotalMinuteForPDF = require('../utils/calculateTotalMinuteForPDF')
const { createEvents } = require('ics');


// TODO move to utils
function checkIntersection(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}
const calculateMinutesBetweenTimesIgnoreDates = (end, begin) => {
  const beginTime = moment.utc(begin).format('HH:mm');
  const endTime = moment.utc(end).format('HH:mm');

  let diffInMinutes = moment
    .utc(endTime, 'HH:mm')
    .diff(moment.utc(beginTime, 'HH:mm'), 'minutes');

  //in case the ending and beginning on different dates then the difference will be 1440 minutes less than actual
  if (diffInMinutes < 0) {
    diffInMinutes += 1440;
  }
  return diffInMinutes;
};

const generatePdf = async (user, userEvents, url) => {
  if (!user) return;
  // Launch a new browser session.
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-namespace-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  // Open a new Page.
  const page = await browser.newPage();

  // Generate html
  const content = userEventsForSchedulerPDF(user, userEvents, url);
  // Set the content of the page.
  await page.setContent(content);

  // Render the page as a PDF.
  const pdf = await page.pdf({ format: 'A4', landscape: true });

  // Close the browser session.
  await browser.close();
  return pdf;
};

const sendEmails = async (body, currentUser, host, req) => {
  const {
    users,
    subject,
    message,
    cc,
    bcc,
    replyTo,
    branchId,
    start,
    end,
    emailEnabled,
    weeklySchedulesEnabled,
    pushNotificationEnabled,
    pushNotificationMessage,
  } = body;

  const usersIds = users.map((u) => u?.value)?.join('|');
  const usersIdsArr = users.map((u) => u?.value);
  const subjectId = _.random(1000, 9999);
  const startOfWeek = moment(start).startOf('week').format('MM/DD');
  const endOfWeek = moment(start).endOf('week').format('MM/DD');
  let content = {
    emails: '',
    subject: `${subject} #${subjectId}`,
    message: '',
    cc: '',
    bcc: '',
    replyTo: '',
    attachments: [],
  };
  if (cc?.length > 1000 || bcc?.length > 1000 || replyTo?.length > 1000) {
    throw new Error(
      'Limit exceeded! You are trying to send more than 500 emails.',
    );
  }
  const ccString = cc.join(', ');
  content.cc = ccString;

  const bccString = bcc.join(', ');
  content.bcc = bccString;

  if (emailEnabled) {
    content.companyId = currentUser.companyId;
    content.payload = req.body;

    if (weeklySchedulesEnabled) {
      /* Sends an email with different attachement to each user separately */

      // File name
      let emailMessage =
        message !== ''
          ? message
          : `Hello, here is your ABA schedule for ${startOfWeek} to ${endOfWeek}`;
      content.subject = `${startOfWeek} - ${endOfWeek} ${content.subject}`;
      const scheduleMessage = `Your weekly schedules: ${startOfWeek} - ${endOfWeek}`;

      // Get events of the user (expanded to include siblings in the data set)
      // Expand selected user IDs with their siblings so the dataset contains all relevant schedules
      let expandedIdsSet = new Set(users.map((u) => u?.value));
      try {
        // Fetch sibling groups and expand
        for (const u of users) {
          const details = await UsersDBApi.findBy({ id: u.value });
          const siblingGroupId = details?.siblingGroupId?.id
            ? details.siblingGroupId.id
            : details?.siblingGroupId;
          if (siblingGroupId) {
            const siblingIds = await UsersDBApi.findUserIdsInSiblingGroup({
              siblingGroupId,
            });
            siblingIds.forEach((sid) => expandedIdsSet.add(sid));
          }
        }
      } catch (e) {}
      const expandedIds = Array.from(expandedIdsSet).join('|');
      const filters = { resources: expandedIds, branchId, start, end };
      const schedulerEvents = await getWeeklySchedulesOfUsers(
        filters,
        currentUser,
        true,
      );
      const allUserEvents = [
        ...schedulerEvents.employees,
        ...schedulerEvents.clients,
      ];

      const branchReplyToEmail = schedulerEvents?.branch?.replyToEmail;
      if (branchReplyToEmail) {
        content.replyTo = [...replyTo, branchReplyToEmail].join(', ');
      } else {
        content.replyTo = replyTo.join(', ');
      }

      for (const user of users) {
        const userEmails = [user.email];
        if (user?.email1) userEmails.push(user.email1);
        if (user?.email2) userEmails.push(user.email2);
        content.emails = userEmails.join(',');

        // Build list of events for the selected user AND their siblings
        let userEventsList = [];
        try {
          const userDetails = await UsersDBApi.findBy({ id: user.value });
          const siblingGroupId = userDetails?.siblingGroupId?.id
            ? userDetails.siblingGroupId.id
            : userDetails?.siblingGroupId;
          let siblingIds = [];
          if (siblingGroupId) {
            siblingIds = await UsersDBApi.findUserIdsInSiblingGroup({
              siblingGroupId,
            });
          }
          const uniqueUserIdsToInclude = [...new Set([user.value, ...siblingIds])];
          userEventsList = uniqueUserIdsToInclude
            .map((id) => allUserEvents.find((obj) => obj.userId === id))
            .filter(Boolean);
        } catch (e) {
          userEventsList = [];
        }
        // Fallback to just the selected user's events
        if (!userEventsList.length) {
          const single =
            allUserEvents.find((obj) => obj.userId === user.value) ?? {
              total: '0',
              eventsByDate: [],
            };
          userEventsList = [single];
        }

        let url = '';
        // Confirmation URL should only include the selected user's events
        if (userEventsList[0]?.eventsByDate?.length) {
          let allEventIdsOfUser = new Array();
          for (let i = 0; i < 7; i++) {
            let currentDaysEventNumber =
              userEventsList[0].eventsByDate[i].events.length;
            for (let j = 0; j < currentDaysEventNumber; j++) {
              allEventIdsOfUser.push(userEventsList[0].eventsByDate[i].events[j].id);
            }
          }

          // join all different eventIds
          const eventIdConcatination = [...new Set(allEventIdsOfUser)].join(
            '|',
          );

          // create EmailSentPendingConfirmationsDBApi on dedicated table
          const espcId = await EmailSentPendingConfirmationsDBApi.upsert({
            userId: user.value,
            eventIdConcatenation: eventIdConcatination,
          });

          url = `${host}/confirmation?id=${espcId.dataValues.id}`;
        }
        const pdfBuffer = await generatePdf(user, userEventsList, url);
        content.attachments = [
          { filename: `${scheduleMessage}.pdf`, content: pdfBuffer },
        ];

        // add the confirmation URL to the content.message
        emailMessage = emailMessage.replace(/\n/g, '<br>');
        content.message = userSchedulesContents(emailMessage, url);

        const emailService = new EmailSender();
        await emailService.sendMultiple(content);
      }
    } else {
      /* Sends the same mail to the multiple user at once */
      const emails = users.map((user) => user.email)?.join(', ');
      content.emails = emails;

      const emailService = new EmailSender();
      await emailService.sendMultiple(content);
    }
  }

  if (pushNotificationEnabled) {
    await sendMultiplNotifs(usersIdsArr, pushNotificationMessage, currentUser, req);
  }

  return true;
};

const getWeeklySchedulesOfUsers = async (
  filters,
  currentUser,
  hipaa = false,
) => {
  let resp = {
    branchId: filters.branchId,
    branch: '',
    employees: [],
    clients: [],
  };

  let branchList = [];
  let clientRoles = [];
  let employeeRoles = [];

  let startOfWeekInUTC = moment.utc(filters.start).toDate();
  let endOfWeekInUTC = moment.utc(filters.end).toDate();

  let offsetOfRequest = moment.parseZone(filters.end).utcOffset();

  // this are in requested TZ time but with +0 at end
  let startOfWeekInRequestedTZ = moment
    .utc(startOfWeekInUTC)
    .add(offsetOfRequest, 'minutes')
    .toDate();
  let endOfWeekInRequestedTZ = moment
    .utc(endOfWeekInUTC)
    .add(offsetOfRequest, 'minutes')
    .toDate();

  //set branch set
  branchList = await BranchesDBApi.getDescendentBranches({
    branchIds: filters.branchId,
  });

  let mainBranch = await BranchesDBApi.findBranchName({
    id: filters.branchId,
  });

  resp.branch = mainBranch;

  const roleHierarchy = await getRoleHierarchy(currentUser.companyId);

  // set client roles
  Object.entries(roleHierarchy).map((t) => {
    const [key, value] = t;
    if (checkIntersection(['Client'], value)) {
      clientRoles.push(key);
    }
  });

  //set employee roles
  Object.entries(roleHierarchy).map((t) => {
    const [key, value] = t;
    if (checkIntersection(['Employee'], value)) {
      employeeRoles.push(key);
    }
  });

  const eventsOfWeek = await EventsDBApi.findAllEventsForEventWeekPdf({
    start: startOfWeekInUTC,
    end: endOfWeekInUTC,
    branches: branchList,
    resources: filters.resources,
    activities: filters.activities,
    locations: filters.locations,
  });

  let EmployeeInfoDuringWeek = new Map();
  let ClientInfoDuringWeek = new Map();

  for (let j = 0; j < eventsOfWeek.count; j++) {
    let event = eventsOfWeek.rows[j];
    if (event.isCancelled) {
      continue;
    }

    // generate the rule of event
    let startRuleAccordingEvent = moment
      .utc(
        event.startRecur +
          ' ' +
          moment.utc(event.start).utcOffset(offsetOfRequest).format('HH:mm'),
        'YYYY-MM-DD HH:mm',
      )
      .toDate();
    let endRuleAccordingEvent = moment.utc(event.endRecur).toDate();

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

    // if it has no weekday then ignore it
    if (weekDaysOfEvent.length === 0) {
      continue;
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

    for (let p = 0; p < allEventsWithRule.length; p++) {
      let duration = calculateMinutesBetweenTimesIgnoreDates(
        event.end,
        event.start,
      );
      let isTheEndingInside = false;
      let isTheBeginningInside = false;
      //check if the event lies in our range
      let ruleStartDate = moment(allEventsWithRule[p])
        //.add(300, 'minutes')
        .toDate();
      const currentDateIsOnDaylightSaving = isDateInDST(ruleStartDate);
      const startDateIsOnDaylightSaving = isDateInDST(
        moment.utc(event.start).toDate(),
      );

      let s = moment(allEventsWithRule[p]).toDate();
      if (currentDateIsOnDaylightSaving != startDateIsOnDaylightSaving) {
        if (currentDateIsOnDaylightSaving) {
          s = moment(s).subtract(1, 'hours').toDate();
        } else {
          s = moment(s).add(1, 'hours').toDate();
        }
      }
      let e = moment.utc(s).add(duration, 'minutes').toDate();

      if (s >= startOfWeekInRequestedTZ && s < endOfWeekInRequestedTZ) {
        isTheBeginningInside = true;
        if (e <= endOfWeekInRequestedTZ) {
          isTheEndingInside = true;
        } else {
          duration = moment
            .utc(endOfWeekInRequestedTZ)
            .diff(moment.utc(s), 'minutes');
        }
      }

      if (!isTheBeginningInside) {
        if (e > startOfWeekInRequestedTZ && e <= endOfWeekInRequestedTZ) {
          isTheEndingInside = true;
          duration = moment
            .utc(e)
            .diff(moment.utc(startOfWeekInRequestedTZ), 'minutes');
        }
      }

      //if it lies, add it to the response
      if (isTheBeginningInside || isTheEndingInside) {
        let eventPostionsInWeek = [[], [], [], [], [], [], []];
        let eventInfo = {
          id: event.id,
          activity: event.activity0?.firstName,
          paid: event.activity0?.paid,
          billable: event.activity0?.billable,
          notes: event.notes,
          activityColor:
            event.activity0?.color ?? 'black',
          users: [],
          time: '',
          location: '',
        };
        if (event.location0) {
          eventInfo.location = event.location0.firstName;
        }

        const beginTimeFormatted = moment
          .utc(s)
          .format('h:mma')
          .replace('m', '');
        const endTimeFormatted = moment.utc(e).format('h:mma').replace('m', '');

        // I use this for sorting the events on everyday for each user by star time in ascending order
        // because if I do it in A.M and P.M format then just string comparison will fail because it
        // will assume 09:00 PM < 10:00AM.
        const beginTimeFormattedIn24Hour = moment.utc(s).format('HH:mm');
        const endTimeFormattedIn24Hour = moment.utc(e).format('HH:mm')

        for (let i = 0; i < event.users.length; i++) {
          let username = '';
          if (event.users[i].firstName) {
            username += event.users[i].firstName;
          }

          if (event.users[i].lastName) {
            username += ' ' + event.users[i].lastName;
          }
          eventInfo.users.push(username);
        }

        // add activity to the users group in even
        if (event.activity0) {
          eventInfo.users.push(event.activity0.firstName);
        }

        //if location is in user array then remove it from there
        eventInfo.users = eventInfo.users.filter(
          (user) => user !== eventInfo.location,
        );

        // just add to the firstday
        if (!isTheBeginningInside) {
          eventInfo.time = '12:00a - ' + endTimeFormatted;
          (eventInfo.startIn24hour = '00:00'),
            eventPostionsInWeek[0].push(eventInfo);
            eventInfo.endIn24Hour = endTimeFormattedIn24Hour
        }

        //just add to the last day
        if (!isTheEndingInside) {
          eventInfo.time = beginTimeFormatted + ' - 12:00a';
          eventInfo.startIn24hour = beginTimeFormattedIn24Hour;
          eventInfo.endIn24Hour = '24:00'
          eventPostionsInWeek[6].push(eventInfo);
        }

        if (isTheBeginningInside && isTheEndingInside) {
          let beginDifference = moment
            .utc(s)
            .diff(moment.utc(startOfWeekInRequestedTZ), 'minutes');

          let endDifference = moment
            .utc(e)
            .diff(moment.utc(startOfWeekInRequestedTZ), 'minutes');

          let beginDay = Math.floor(beginDifference / 1440);
          let endDay = Math.floor(endDifference / 1440);

          // if it begin and end on different days, then add two partly events on each day
          if (beginDay < endDay) {
            //beginning
            if (beginDay > -1 && beginDay < 7) {
              eventPostionsInWeek[beginDay].push({
                id: eventInfo.id,
                activity: eventInfo.activity,
                activityColor: eventInfo.activityColor,
                users: eventInfo.users,
                notes: eventInfo.notes,
                time: beginTimeFormatted + ' - 12:00a',
                location: eventInfo.location,
                paid: eventInfo?.paid,
                billable: eventInfo?.billable,
                startIn24hour: beginTimeFormattedIn24Hour,
                endIn24Hour: '24:00'
              });
            }

            //ending
            if (endDay > -1 && endDay < 7) {
              eventPostionsInWeek[endDay].push({
                id: eventInfo.id,
                activity: eventInfo.activity,
                activityColor: eventInfo.activityColor,
                users: eventInfo.users,
                notes: eventInfo.notes,
                time: '12:00a - ' + endTimeFormatted,
                location: eventInfo.location,
                paid: eventInfo?.paid,
                billable: eventInfo?.billable,
                startIn24hour: '00:00',
                endIn24Hour: endTimeFormattedIn24Hour
              });
            }
          } else {
            //if it is completely inside of day
            if (beginDay > -1 && beginDay < 7) {
              eventPostionsInWeek[beginDay].push({
                id: eventInfo.id,
                activity: eventInfo.activity,
                activityColor: eventInfo.activityColor,
                users: eventInfo.users,
                notes: eventInfo.notes,
                time: beginTimeFormatted + ' - ' + endTimeFormatted,
                location: eventInfo.location,
                paid: eventInfo?.paid,
                billable: eventInfo?.billable,
                startIn24hour: beginTimeFormattedIn24Hour,
                endIn24Hour: endTimeFormattedIn24Hour
              });
            }
          }
        }
        let client_names = [];

        for (let i = 0; i < event.users.length; i++) {
          if (clientRoles.includes(event.users[i].roles[0].name)) {
            client_names.push(
              `${event.users[i].firstName} ${event.users[i].lastName}`,
            );
          }
        }
        client_names = [...new Set(client_names)];

        for (let i = 0; i < event.users.length; i++) {
          // if user emplyee, then add it to employee map
          if (employeeRoles.includes(event.users[i].roles[0].name)) {
            if (!EmployeeInfoDuringWeek.has(event.users[i].id)) {
              let username = '';
              if (event.users[i].firstName) {
                username += event.users[i].firstName;
              }

              if (event.users[i].lastName) {
                username += ' ' + event.users[i].lastName;
              }
              let userInfo = {
                userId: event.users[i].id,
                name: username,
                total: 0,
                paidTotal: 0,
                billableTotal: 0,
                eventsByDate: [],
              };

              userInfo.eventsByDate.push(
                {
                  weekdayTitle: 'Sunday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ).format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Monday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(1, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Tuesday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(2, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Wednesday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(3, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Thursday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(4, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Friday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(5, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Saturday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(6, 'days')
                    .format('M/D'),
                  events: [],
                },
              );

              EmployeeInfoDuringWeek.set(event.users[i].id, userInfo);
            }

            let employee = EmployeeInfoDuringWeek.get(event.users[i].id);

            for (let j = 0; j < 7; j++) {
              for (let k = 0; k < eventPostionsInWeek[j].length; k++) {
                let filteredEventInfo = {
                  ...eventPostionsInWeek[j][k],
                  users: [...new Set(eventPostionsInWeek[j][k].users)].filter(
                    (user) => user !== employee.name,
                  ),
                };

                employee.eventsByDate[j].events.push(filteredEventInfo);
              }
            }
          }

          // if user client, then add it to client map
          if (clientRoles.includes(event.users[i].roles[0].name)) {
            if (!ClientInfoDuringWeek.has(event.users[i].id)) {
              let clientName = '';
              if (event.users[i].firstName) {
                clientName += event.users[i].firstName;
              }

              if (event.users[i].lastName) {
                clientName += ' ' + event.users[i].lastName;
              }
              let userInfo = {
                userId: event.users[i].id,
                name: clientName,
                total: 0,
                eventsByDate: [],
              };

              userInfo.eventsByDate.push(
                {
                  weekdayTitle: 'Sunday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ).format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Monday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(1, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Tuesday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(2, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Wednesday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(3, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Thursday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(4, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Friday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(5, 'days')
                    .format('M/D'),
                  events: [],
                },
                {
                  weekdayTitle: 'Saturday',
                  weekdayDate: moment.utc(startOfWeekInRequestedTZ)
                    .add(6, 'days')
                    .format('M/D'),
                  events: [],
                },
              );

              ClientInfoDuringWeek.set(event.users[i].id, userInfo);
            }

            let client = ClientInfoDuringWeek.get(event.users[i].id);

            for (let j = 0; j < 7; j++) {
              for (let k = 0; k < eventPostionsInWeek[j].length; k++) {
                let filteredEventInfo = {
                  ...eventPostionsInWeek[j][k],
                  users: [...new Set(eventPostionsInWeek[j][k].users)].filter(
                    (user) => {
                      return (
                        user !== client.name &&
                        (!client_names.includes(user) || !hipaa)
                      );
                    },
                  ),
                };

                client.eventsByDate[j].events.push(filteredEventInfo);
              }
            }
          }
        }
      }
    }
  }

  // fill the response with the employee info
  for (let [_, employee] of EmployeeInfoDuringWeek) {
    // sort events by starttime asc
    for (let j = 0; j < employee.eventsByDate.length; j++) {
      employee.eventsByDate[j].events.sort((a, b) => {
        // Extracting hours and minutes from time strings
        const [hoursA, minutesA] = a.startIn24hour.split(':').map(Number);
        const [hoursB, minutesB] = b.startIn24hour.split(':').map(Number);

        // Comparing hours first
        if (hoursA !== hoursB) {
          return hoursA - hoursB;
        } else {
          // If hours are the same, compare minutes
          return minutesA - minutesB;
        }
      });

      // Calculate custom total duration for that day by considering overlapping
      const totalRanges = [];
      const paidRanges = [];
      const billableRanges = [];

      for (const event of employee.eventsByDate[j].events) {
        const range = [event.startIn24hour, event.endIn24Hour];
        totalRanges.push(range);
        if (event?.paid) paidRanges.push(range);
        if (event?.billable) billableRanges.push(range);
      }

      if (totalRanges.length){
        employee.total += calculateTotalMinuteForPDF(totalRanges)
      }
      if (paidRanges.length){
        employee.paidTotal += calculateTotalMinuteForPDF(paidRanges)
      }
      if (billableRanges.length){
        employee.billableTotal += calculateTotalMinuteForPDF(billableRanges)
      }
    }

    // Convert all values from minutes to hours consistently
    const totalHours = Number((employee.total / 60).toFixed(2));
    const paidTotalHours = Number((employee.paidTotal / 60).toFixed(2));
    const billableTotalHours = Number((employee.billableTotal / 60).toFixed(2));

    resp.employees.push({
      ...employee,
      total: totalHours,
      paidTotal: paidTotalHours,
      billableTotal: billableTotalHours,
      eventsByDate: employee.eventsByDate,
    });
  }

  // fill the response with the client info
  for (let [_, client] of ClientInfoDuringWeek) {
    for (let j = 0; j < client.eventsByDate.length; j++) {
      // calculate total duration for that day by considering overlapping
      let eventMinuteStartEndRange = client.eventsByDate[j].events.map(item => [item.startIn24hour, item.endIn24Hour]);
      if (eventMinuteStartEndRange.length){
        client.total += calculateTotalMinuteForPDF(eventMinuteStartEndRange)
      }
    }
    resp.clients.push({
      ...client,
      total: Number((client.total / 60).toFixed(2)),
      eventsByDate: client.eventsByDate,
    });
  }

  // Sorting
  resp.employees.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  resp.clients.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  resp.employees.forEach((employee) => {
    employee.eventsByDate.forEach((date) => {
      date.events.sort((a, b) => {
        return a.startIn24hour.localeCompare(b.startIn24hour);
      });
    });
  });
  resp.clients.forEach((client) => {
    client.eventsByDate.forEach((date) => {
      date.events.sort((a, b) => {
        return a.startIn24hour.localeCompare(b.startIn24hour);
      });
    });
  });

  return {
    branchId: resp.branchId,
    branch: resp.branch,
    employees: resp.employees,
    clients: resp.clients,
  };
};

const getScheduleOfUserForCalendar = async (filters, currentUser) => {
  const events = await EventsDBApi.findAllEventsForCalendar({
    start: moment.utc(filters.start).toDate(),
    end: moment.utc(filters.end).toDate(),
    userId: currentUser.id,
  });

  const calendarEvents = [];

  for (let j = 0; j < events.count; j++) {
    const event = events.rows[j];
    if (event.isCancelled) continue;

    const eventTZ = event.timezone || "America/Los_Angeles";

    let startRecurInUTC = moment.utc(event.startRecur);
    const startTimeInTZ = moment_tz.utc(event.startRecur + ' ' + moment.utc(event.start).format('HH:mm'), 'YYYY-MM-DD HH:mm').tz(eventTZ);

    const dayDifference = moment.utc(startTimeInTZ.format("YYYY-MM-DD")).diff(moment.utc(startRecurInUTC.format("YYYY-MM-DD")), 'days');
    
    startRecurInUTC.subtract(dayDifference, 'days');

    const endRecurInUTC = moment.utc(event.endRecur).toDate();

    const weekDaysOfEvent = [];
    if (event.M) weekDaysOfEvent.push(rule_RRule.RRule.MO);
    if (event.T) weekDaysOfEvent.push(rule_RRule.RRule.TU);
    if (event.W) weekDaysOfEvent.push(rule_RRule.RRule.WE);
    if (event.R) weekDaysOfEvent.push(rule_RRule.RRule.TH);
    if (event.F) weekDaysOfEvent.push(rule_RRule.RRule.FR);
    if (event.S) weekDaysOfEvent.push(rule_RRule.RRule.SA);
    if (event.U) weekDaysOfEvent.push(rule_RRule.RRule.SU);

    if (weekDaysOfEvent.length === 0) continue;

    const rruleOptions = {
      freq: rule_RRule.RRule[event.frequency.toUpperCase()],
      interval: event.interval,
      byweekday: weekDaysOfEvent,
      until: endRecurInUTC,
    };

    if (event.bysetpos !== null) {
      rruleOptions.bysetpos = Number(event.bysetpos);
    }

    const rule = new rule_RRule.RRule(rruleOptions);

    let eventTitle = event.activity0?.firstName || 'Event';
    for (const user of event.users) {
      if (user.id != currentUser.id) {
        eventTitle += ` - ${user?.firstName|| ""} ${user?.lastName||""}`;
      }
    }

    calendarEvents.push({
      uid: event.id?.toString() ?? undefined,
      title: eventTitle,
      start: [
        startRecurInUTC.toDate().getUTCFullYear(),
        startRecurInUTC.toDate().getUTCMonth() + 1, // +1 because getUTCMonth() is 0-based, but .ics expects 1-based months
        startRecurInUTC.toDate().getUTCDate(),
        moment.utc(event.start).toDate().getUTCHours(),
        moment.utc(event.start).toDate().getUTCMinutes(),
      ],
      duration: {
        minutes: calculateMinutesBetweenTimesIgnoreDates(event.end, event.start),
      },
      startInputType: "utc",
      recurrenceRule: rule.toString().split('\n').find(line => line.startsWith('RRULE:')).substring(6),
    });
  }

  const icsContent = await new Promise((resolve, reject) => {
    createEvents(calendarEvents, (error, value) => {
      if (error) return reject(error);
      resolve(value);
    });
  });

  return icsContent;
};

module.exports = {
  sendEmails,
  getWeeklySchedulesOfUsers,
  getScheduleOfUserForCalendar,
};
