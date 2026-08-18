const config = require('../../config');
//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const moment = require('moment');
const momentTz = require('moment-timezone');
const waitForRequestHeaders = require('../services/waitForRequestHeaders');
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
  console.log('🚀 ~ formatEventObj ~ billingAuth:', billingAuth);

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
function filterAuthRecords(records) {
  const now = new Date();
  if (records?.length === 1) {
    const record = records[0];
    return [
      {
        billingCodeId: record.billingCodeId,
        authId: record.authId,
      },
    ];
  }
  return records
    .filter((record) => {
      // Ensure billingDefaultMinutes is truthy (non-zero)
      // and authEndDate is after the current date.
      if (!record.billingDefaultMinutes) return false;

      const authEnd = new Date(record.authEndDate);
      return authEnd > now;
    })
    .map((record) => ({
      billingCodeId: record.billingCodeId,
      authId: record.authId,
    }));
}

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
        console.warn('No dates match the recurrence pattern.');
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
          console.error(`Error loading event for date ${date}:`, error);
          return { date: date, data: null, error: error };
        });
    });

    // Execute all API requests in parallel
    const results = await Promise.all(fetchPromises);

    // Optionally, filter out failed requests or handle them as needed
    const successfulResults = results.filter((result) => result.data !== null);

    if (successfulResults.length === 0) {
      console.warn('All event fetch requests failed.');
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
    console.error('Error loading event:', error);
    return [];
  }
};
/* Actions */
const findEvent = async (headers, event, timezone) => {
  const filters = {
    course: event.course,
    date: event.startRecur,
    userTimeZone: timezone,
    _utcOffsetMinutes: momentTz().tz(timezone).utcOffset(),
  };
  const url = 'https://members.centralreach.com/api/?scheduling.loadevent';
  const data = {
    ...filters,
    includeInactive: true,
    _track: {
      channel: 'scheduling',
      action: 'event',
      source: 'Desktop',
    },
  };

  try {
    console.log('data', data);
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error loading event:', error);
    // throw new Error('Error loading event!')
    return;
  }
};
const performAppointmentAction = async (url, headers, data, eventId) => {
  try {
    console.log(`performAppointmentAction ${url}`, data);
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
    console.error(`Error performing action ${url} 1:`, response.data);
    return;
  } catch (error) {
    console.error(`Error performing action ${url} 2`, error);
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

    const authList = resp?.authList || [];
    if (!authList.length) {
      console.error('No auth list returned!', resp);
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
      console.error('No matching auth found after all rules!', authList);
      return null;
    }
    console.log("🚀 ~ findBillingAuth ~ chosenAuth:", chosenAuth)

    return chosenAuth;
  } catch (err) {
    console.error('Error fetching authorizations!', err);
    return null;
  }
};

const typeWithDelay = async (page, selector, text) => {
  for (const char of text) {
    await page.type(selector, char);
    // Randomized delay between keystrokes (e.g., between 50ms and 150ms)
    await page.waitForTimeout(Math.floor(Math.random() * 100) + 50);
  }
};

const doActionsCentralReach = async (operations, email, password, timezone) => {
  const { createdEvents, deletedEvents, updatedEvents, canceledEvents } =
    operations;
  const MAX_ATTEMPTS = 3;
  let attempt = 0;
  const successfulOperations = {
    createdEventsSuccessful: [],
  };

  while (attempt < MAX_ATTEMPTS) {
    let browser;
    try {
      attempt += 1;
      console.log(`Running doActionsCentralReach... Attempt #${attempt}`);

      browser = await puppeteer.launch({
          headless: 'new',
          executablePath: '/usr/bin/google-chrome-stable',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-namespace-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,800',
          ],
        });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('https://login.centralreach.com/applications', {
        waitUntil: 'networkidle0',
      });
      let str_types = '';
      await page.waitForTimeout(1003);

      await typeWithDelay(page, '#Username', email);
      const loginValue = await page.$eval('#Username', (el) => el.value);
      str_types = `${loginValue}`;
      await page.waitForTimeout(1012);
      await page.click('#Username');
      await page.mouse.move(102, 109);
      await page.mouse.move(205, 202, { steps: 12 }); // Move with steps to simulate smoother movement
      await page.waitForSelector('#login', { timeout: 500 });
      //await page.solveRecaptchas();
      await page.click('#login');
      await page.waitForTimeout(3013);
      await page.mouse.move(155, 133);
      await page.mouse.move(242, 211, { steps: 10 }); // Move with steps to simulate smoother movement
      await page.waitForSelector('#Password', { timeout: 10000 });
      await typeWithDelay(page, '#Password', password);
      //await page.type('#Password', password);
      const passwordValue = await page.$eval('#Password', (el) => el.value);
      str_types = `${str_types} ${passwordValue}`;
      console.log('Text field value:', passwordValue);
      await page.waitForTimeout(1017);

      // Solve reCAPTCHAs on the page (if detected)
      await page.solveRecaptchas();

      await page.click('#login');
      await page.waitForTimeout(9016);

      // If login failed it reloads the page and shows error message
      // If login success it redirects to the https://members.centralreach.com/
      //await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 19999 });
      const currentUrl = page.url();
      const errorSelector = '.validation-summary-errors ul li';
      const errorMessage = await page.$(errorSelector);
      let errorText = 'NOTHING';
      if (errorMessage) {
        errorText = await page.evaluate(
          (element) => element.textContent,
          errorMessage,
        );
        errorText = `${errorText}`;
        console.log(`Error message detected: ${errorText}`);
      } else {
        console.log('No error message detected. Login might be successful.');
      }
      console.log('currentUrl', currentUrl);
      if (currentUrl.includes('https://login.centralreach.com/applications')) {
        throw new Error(
          `There is more than one account in Central Reach with this email. Please change email in CR!`,
        );
      }
      if (currentUrl.includes('https://login.centralreach.com')) {
        console.log('Login failed: Invalid username or password');
        throw new Error(
          `Login failed: Invalid username or password ${errorText} ${currentUrl}`,
        );
      }

      const isSingleDeviceContinue = await page.$(
        '.logged-in-single-device-continue-to-login',
      );
      if (isSingleDeviceContinue) {
        await page.waitForSelector(
          '.logged-in-single-device-continue-to-login',
          {
            visible: true,
            timeout: 5000,
          },
        );
        await page.click('.logged-in-single-device-continue-to-login');
      }

      await page.goto('https://members.centralreach.com/#account', {
        waitUntil: 'domcontentloaded',
      });

      // Wait for the request headers from the specific API request
      const headersCaptured = await waitForRequestHeaders(
        page,
        'https://members.centralreach.com/api/?contacts.loadcontactdetails',
      );
      if (!headersCaptured) {
        throw new Error('Failed to capture request headers.');
      }

      const cookies = await page.cookies();
      const cookieString = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join('; ');

      const headers = {
        ...headersCaptured,
        Cookie: cookieString,
      };

      /* Delete Events */
      const toBeDeletedEvents = [
        ...deletedEvents.filter((e) => e.course),
        ...updatedEvents.filter((e) => e.course),
        ...canceledEvents.filter((e) => e.course),
      ];
      for (const toBeDeletedEvent of toBeDeletedEvents) {
        console.time('deleted');
        const { event } = formatEventObj(toBeDeletedEvent, 'course/delete');
        const { eventObj, converted } = await findEventUpdated(
          headers,
          event,
          timezone,
        );

        // If event is existing then delete
        // If event is converted on CR then do not integrate that event
        if (!converted && eventObj?.appointment) {
          const eventStartDate =
            eventObj.appointment.startDate ?? eventObj.appointment.date;
          const startDate = moment(
            eventStartDate,
            'MM/DD/YYYY HH:mm:ss',
          ).format('YYYY-MM-DD');

          const deletePayload = formatDeletePayload({
            course: event.course,
            startRecur: startDate,
            isCancelled: toBeDeletedEvent.isCancelled ?? false,
            cancellationReason: toBeDeletedEvent.cancellationReason ?? null,
          });

          const successObj = await performAppointmentAction(
            'https://members.centralreach.com/api/?scheduling.deletecourse',
            headers,
            deletePayload,
            event.eventId,
          );
          // if (successObj) successfulOperations.createdEventsSuccessful.push(successObj)
        }
        console.timeEnd('deleted');
      }

      /* Create Events */
      const toBeCreatedEvents = [...createdEvents, ...updatedEvents];
      for (const toBeCreatedEvent of toBeCreatedEvents) {
        // Find auth first
        let billingAuth = null;
        if (config.appEnv !== 'jbk') {
          billingAuth = await findBillingAuth(headers, {
            providerId: toBeCreatedEvent.employeeId, // Employee id
            apptWithId: toBeCreatedEvent.clientId, // Client id
            date: toBeCreatedEvent.startRecur,
            _utcOffsetMinutes: 480,
          });
        }
        const { event, reqPayloadEvent } = formatEventObj(
          { ...toBeCreatedEvent, billingAuth },
          'addcourse',
        );
        let existingEvent = null;
        let converted = false;
        if (event.course) {
          existingEvent = await findEventUpdated(headers, event, timezone);
          converted = existingEvent.converted;
        }

        // If event is existing then delete
        // If event is converted on CR then do not integrate that event
        if (!converted) {
          const successObj = await performAppointmentAction(
            'https://members.centralreach.com/api/?scheduling.addcourse',
            headers,
            reqPayloadEvent,
            event.eventId,
          );

          if (successObj) {
            const existingIndex =
              successfulOperations.createdEventsSuccessful.findIndex(
                (v) => v.eventId === successObj.eventId,
              );
            if (existingIndex !== -1) {
              successfulOperations.createdEventsSuccessful.splice(
                existingIndex,
                1,
              );
            }
            successfulOperations.createdEventsSuccessful.push(successObj);
          }
        }
      }
      console.log('successfulOperations', successfulOperations);

      await browser.close();
      return successfulOperations;
    } catch (error) {
      console.error('CR integration error:', error);
      if (browser) {
        await browser.close();
      }

      // If we've already tried the max number of times, rethrow
      if (attempt >= MAX_ATTEMPTS) {
        console.log('Max retries reached. Throwing error...');
        throw error;
      } else {
        // Otherwise, log and retry
        console.log(`Retrying... (Attempt ${attempt} of ${MAX_ATTEMPTS})\n`);
        logger.centralReach('error', `Retrying... (Attempt ${attempt} of ${MAX_ATTEMPTS})\n`, error);
      }
    }
  }
};

module.exports = doActionsCentralReach;
