const config = require('../../config');
//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const moment = require('moment');
const momentTz = require('moment-timezone');
const { getCentralReachHeaders } = require('./getCentralReachHeaders');
const logger = require('../../services/logger/logger');

// Add the reCAPTCHA-solving plugin
puppeteer
  .use(StealthPlugin())
  .use(
    RecaptchaPlugin({
      provider: { id: '2captcha', token: 'f86f3f0592660f8d6519951b3737d50a' }, // Replace with your 2Captcha API key
    }),
  );

const formatDeletePayload = (data) => {
  const date = data.startRecur;
  const course = Number(data.course);

  const obj = {
    course: course,
    date: date,
    reason: 0,
    reasonName: '',
    note: '',
    _track: {
      channel: 'scheduling',
      action: 'course/delete',
      source: 'Desktop',
      latitude: 0,
      longitude: 0,
      metric: 0,
    },
  };
  if (data.isCancelled) {
    let reason = 1;
    let reasonName = 'Client Cancellation';
    if (data.cancellationReason?.name && data.cancellationReason?.customId) {
      reason = data.cancellationReason.customId;
      reasonName = data.cancellationReason.name;
    }
    obj.reason = reason;
    obj.reasonName = reasonName;
  }
  return obj;
};
const convertUtcToSeconds = (time, timezone, date) => {
  const utcTimeString = moment.utc(time).format('HH:mm:ss');

  if (!utcTimeString || !timezone || !date) {
    throw new Error('Invalid input parameters.');
  }

  // Parse the UTC time string into a Date object
  const utcDate = new Date(`${date}T${utcTimeString}Z`);

  if (isNaN(utcDate)) {
    throw new Error('Invalid UTC date or time string.');
  }

  // Use Intl.DateTimeFormat to get the local time in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Format the UTC date into the local time
  const [hours, minutes] = formatter.format(utcDate).split(':').map(Number);

  // Convert hours and minutes into total seconds since midnight
  return hours * 3600 + minutes * 60;
};
const formatEventObj = (event, op) => {
  const {
    startRecur,
    endRecur,
    start,
    end,
    employeeId,
    clientId,
    funderId,
    activityId,
    activityTitle,
    timezone,
    duration,
    locationId,
    activityCode,
    recurring,
    rules,
    interval,
    repetitions,
    course,
    placeOfService,
    billingAuth,
  } = event;

  const tz = timezone || 'America/New_York';
  const startTime = convertUtcToSeconds(start, tz, startRecur);
  const endTime = convertUtcToSeconds(end, tz, startRecur);

  let obj = {
    op,
    date: startRecur,
    startDate: startRecur,
    startTime,
    endTime,
    principal1: Number(employeeId),
    principal2: Number(clientId),
    placeOfServiceId: '', // Hardcoded as office for now
    billing: `<a><s><l>${duration}</l><c>0</c><a>0</a></s></a>`,
    type: Number(activityId),
    name: activityTitle || '',
    timeZone: tz,
    userTimeZone: tz,
    _utcOffsetMinutes: 240, // TODO: Make dynamic if necessary
    note: '',
    eventLabels: '',
    courseLabels: '',
    hidden: false,
    qualificationWarningsOverridden: false,
    feeScheduleRateIds: [],
    _track: {
      channel: 'scheduling',
      action: 'event/update',
      source: 'Desktop',
      latitude: 0,
      longitude: 0,
      metric: 0,
    },
  };
  if (locationId) obj.placeOfServiceId = Number(placeOfService);

  // TODO Need to work on location setter
  if (locationId) obj.locationId = Number(locationId);

  // <a><s><l>[duration]</l><c>[billingCodeId]</c><a>[authId]</a></s></a>
  if (duration && billingAuth?.billingCodeId && billingAuth?.authId) {
    obj.billing = `<a><s><l>${duration}</l><c>${billingAuth?.billingCodeId}</c><a>${billingAuth?.authId}</a></s></a>`;
  }

  if (op === 'updateevent' || op === 'updatecourse') {
    obj = {
      ...obj,
      course: Number(course),
      isCanceledUpdate: false,
      isEventRecover: false,
    };
  }

  if (recurring) {
    let currentDate = moment(startRecur);
    const daysArray = rules.split(',').map(Number);

    // Adjust the start date based on the first matching day in the recurring rules
    let i = 0;
    while (
      i < 10 &&
      daysArray.length > 0 &&
      !daysArray.includes(currentDate.day())
    ) {
      currentDate.add(1, 'days');
      i++;
    }
    const adjustedStartDate = currentDate.format('YYYY-MM-DD');

    obj = {
      ...obj,
      startDate: adjustedStartDate,
      date: adjustedStartDate,
      interval,
      period: 2, // Default period
      rules,
      ...(repetitions
        ? { repetitions }
        : {
            endDate: moment(endRecur).subtract(1, 'days').format('YYYY-MM-DD'),
          }),
    };
  }

  return { event, reqPayloadEvent: obj };
};

// Function to generate all dates for recurring events
const generateRecurringDates = (start, end, days) => {
  const startDate = momentTz(start);
  const endDate = momentTz(end);
  const dates = [];

  let currentDate = startDate.clone();

  while (currentDate.isSameOrBefore(endDate, 'day')) {
    if (days.includes(currentDate.isoWeekday())) {
      // 1 = Monday, 7 = Sunday
      dates.push(currentDate.format('YYYY-MM-DD'));
    }
    currentDate.add(1, 'day');
  }

  return dates;
};

const findEventUpdated = async (headers, event, timezone) => {
  try {
    // Initialize variables
    const _utcOffsetMinutes = momentTz.tz(timezone).utcOffset();

    let datesToFetch = [];

    // Check if the event is recurring
    if (event.recurring) {
      // Generate all relevant dates based on recurrence
      datesToFetch = generateRecurringDates(
        event.startRecur,
        event.endRecur,
        event.days,
      );

      // Handle case where no dates match the recurrence pattern
      if (datesToFetch.length === 0) {
        logger.centralReach('warn', 'No dates match the recurrence pattern.', { event });
        return [];
      }
    } else {
      // For non-recurring events, use the single start date
      datesToFetch = [event.startRecur];
    }

    // Prepare all API requests
    const fetchPromises = datesToFetch.map((date) => {
      const filters = {
        course: event.course,
        date: date,
        userTimeZone: timezone,
        _utcOffsetMinutes: _utcOffsetMinutes,
      };

      const data = {
        ...filters,
        includeInactive: true,
        _track: {
          channel: 'scheduling',
          action: 'event',
          source: 'Desktop',
        },
      };

      const url = 'https://members.centralreach.com/api/?scheduling.loadevent';

      // Return the Axios POST promise
      return axios
        .post(url, data, { headers })
        .then((response) => response.data)
        .catch((error) => {
          logger.centralReach('warn', `Error loading event for date ${date}:`, { error });
          return { date: date, data: null, error: error };
        });
    });

    // Execute all API requests in parallel
    const results = await Promise.all(fetchPromises);

    // Optionally, filter out failed requests or handle them as needed
    const successfulResults = results.filter((result) => result.data !== null);

    if (successfulResults.length === 0) {
      logger.centralReach('warn', 'All event fetch requests failed.');
      return { eventObj: null, converted: false };
    }

    // Extract the first event object
    const firstEventObj = successfulResults[0];

    // Check if any of the event objects have segmentsConverted: true
    const converted = successfulResults.some(
      (data) => data?.appointment?.segmentsConverted === true,
    );

    return {
      eventObj: firstEventObj,
      converted,
    };
  } catch (error) {
    logger.centralReach('warn', 'Error loading event:', { error });
    return [];
  }
};
/* Actions */
const performAppointmentAction = async (url, headers, data, eventId) => {
  try {
    const response = await axios.post(url, data, { headers });
    if (
      (response.data?.success && response.data?.appointment?.course) ||
      response?.data?.course
    ) {
      const successObj = {
        eventIdCustom:
          response?.data?.appointment?.course ?? response?.data?.course,
        eventId,
      };
      return successObj;
    }
    logger.centralReach('warn', `Error performing action ${url}:`, { response });
    return;
  } catch (error) {
    logger.centralReach('warn', `Error requesting ${url}:`, { error });
    return;
  }
};
/** Convert a mixed string/number to a Number, treating ‘’ or null as 0 */
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Score how “big” an auth is – larger score ⇒ higher priority */
const capacityScore = (auth) => Math.max(
  toNumber(auth.groupScheduledUnitsTotal),
  toNumber(auth.scheduledUnitsTotal),
  toNumber(auth.groupConvertedUnitsTotal),
  toNumber(auth.convertedUnitsTotal)
);
/**
 * Fetch authorizations from CentralReach and pick the best one.
 *
 * @param {object} headers – axios headers with session cookies, etc.
 * @param {object} data    – payload for scheduling.loadauthsandcodes
 * @returns {object|null}   the chosen authorization, or null on failure
 */
const findBillingAuth = async (headers, data) => {
  try {
    const { data: resp } = await axios.post(
      'https://members.centralreach.com/api/?scheduling.loadauthsandcodes',
      data,
      { headers }
    );

    let authList = resp?.authList || [];

    /* filter by activity auth code for ex: 97153 or 97154 */
    if (data.activityCode) {
      authList = authList.filter(
        (a) => String(a.authCode) === String(data.activityCode)
      );
    }    

    if (!authList.length) {
      logger.centralReach('warn', 'No auth list returned!', { resp });
      return null;
    }

    // Split by insurance type
    const commercial = authList.filter(
      (a) => (a.authInsuranceCompany || '').toLowerCase() !== 'medicaid'
    );
    const medicaid = authList.filter(
      (a) => (a.authInsuranceCompany || '').toLowerCase() === 'medicaid'
    );

    // Helper: pick the auth with the highest capacity score
    const pickLargest = (list) =>
      list.reduce((best, current) =>
        capacityScore(current) > capacityScore(best) ? current : best
        , list[0]);

    let chosenAuth = null;

    if (commercial.length) {
      chosenAuth = pickLargest(commercial);
    } else if (medicaid.length) {
      chosenAuth = pickLargest(medicaid);
    }

    if (!chosenAuth) {
      logger.centralReach('warn', 'No matching auth found after all rules!', { authList });
      return null;
    }

    return chosenAuth;
  } catch (err) {
    logger.centralReach('warn', 'Error fetching authorizations!', { err });
    return null;
  }
};

const doActionsCentralReach = async (operations, email, password, timezone) => {
  const {
    createdEvents,
    deletedEvents,
    updatedEvents,
    canceledEvents,
  } = operations;

  const MAX_ATTEMPTS = 3;
  let attempt = 0;

  const successfulOperations = { createdEventsSuccessful: [] };

  while (attempt < MAX_ATTEMPTS) {
    try {
      attempt += 1;

      /* ─── 1. Get (or refresh) CentralReach headers ───────────── */
      const { headers  } =
        await getCentralReachHeaders(email, password, { skipCache: true }); // For now skip cache since CR auth system is not stable

      /* ─── 2. DELETE / CANCEL / UPDATE (as delete-then-add) ───── */
      const toBeDeleted = [
        ...deletedEvents.filter(e => e.course),
        ...updatedEvents.filter(e => e.course),
        ...canceledEvents.filter(e => e.course),
      ];

      for (const ev of toBeDeleted) {
        const { event } = formatEventObj(ev, 'course/delete');
        const { eventObj, converted } = await findEventUpdated(headers, event, timezone);

        if (!converted && eventObj?.appointment) {
          const eventStart =
            eventObj.appointment.startDate ?? eventObj.appointment.date;
          const startDate = moment(eventStart, 'MM/DD/YYYY HH:mm:ss')
            .format('YYYY-MM-DD');

          const deletePayload = formatDeletePayload({
            course: event.course,
            startRecur: startDate,
            isCancelled: ev.isCancelled ?? false,
            cancellationReason: ev.cancellationReason ?? null,
          });

          await performAppointmentAction(
            'https://members.centralreach.com/api/?scheduling.deletecourse',
            headers,
            deletePayload,
            event.eventId,
          );
        }
      }

      /* ─── 3. CREATE / RE-ADD EVENTS ──────────────────────────── */
      const toBeAdded = [...createdEvents, ...updatedEvents];

      for (const ev of toBeAdded) {
        /* 3a. Try to find the best billing auth */
        let billingAuth = null;
        if (config.appEnv !== 'jbk') {
          billingAuth = await findBillingAuth(headers, {
            providerId: ev.employeeId,
            apptWithId: ev.clientId,
            date: ev.startRecur,
            _utcOffsetMinutes: 480,
            activityCode: ev.activityCode,
          });
        }

        const { event, reqPayloadEvent } =
          formatEventObj({ ...ev, billingAuth }, 'addcourse');

        let converted = false;
        if (event.course) {
          const existing = await findEventUpdated(headers, event, timezone);
          converted = existing.converted;
        }

        if (!converted) {
          const successObj = await performAppointmentAction(
            'https://members.centralreach.com/api/?scheduling.addcourse',
            headers,
            reqPayloadEvent,
            event.eventId,
          );

          if (successObj) {
            /* de-dup if this eventId was re-added in the same run */
            const i = successfulOperations.createdEventsSuccessful
              .findIndex(v => v.eventId === successObj.eventId);

            if (i !== -1) successfulOperations.createdEventsSuccessful.splice(i, 1);
            successfulOperations.createdEventsSuccessful.push(successObj);
          }
        }
      }

      return successfulOperations;                     // ← all done
    } catch (err) {
      logger.centralReach('error', 'CentralReach Integration Error', { 
        err,
        response: err?.response || err?.originalError?.response,
        user: { email }
      });
      if (attempt >= MAX_ATTEMPTS) {
        throw err;
      }
    }
  }
};

module.exports = doActionsCentralReach;
