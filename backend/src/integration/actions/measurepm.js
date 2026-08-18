// TODO Refactor @parahatreis
const config = require('../../config');
const puppeteer = require('puppeteer');
const axios = require('axios');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const waitForRequestHeaders = require('../services/waitForRequestHeaders');

const CREATE_ROUTE = 'https://login.measurepm.com/Appointment/CreateNew';
const READ_CALENDAR_ROUTE = 'https://login.measurepm.com/Appointment/ReadCalendar';
const DELETE_ROUTE = 'https://login.measurepm.com/Appointment/Delete';

let createNewTemplate = {
  sort: '',
  group: '',
  filter: '',
  TaskID: '0',
  AppointmentDriveTimeLogId: '',
  DisplacementId: '',
  IsFillIn: 'false',
  LinkedAppointment: 'false',
  AppointmentId: '0',
  PatientId: '10995',
  Message: '',
  HoursString: '',
  Gender: '0',
  EmployeeName: '',
  PatientName: '',
  ActingSupervisor: '',
  Auth_desc: '',
  AuthDetailNotes: '',
  Address: '',
  AuthId: '95192',
  AuthDetailId: '790566',
  ServiceTypeId: '7809',
  ServiceSubTypeId: '',
  EmployeeId: '4528',
  Color: '',
  ScheduledMinutes: '',
  ScheduledHours: '',
  AppointmentStatusId: '319',
  AppointmentStatusName: '',
  Treatmenttypename: '',
  ServiceDetails: '',
  AuthDetaiDate: '',
  Servicetype: '',
  ScheduledDate: '',
  ScheduleEnd: '',
  LocationId: '13565',
  Miles: '0',
  HasPayroll: 'false',
  HasBilling: 'false',
  Notes: '',
  IsBillable: 'false',
  IsBillableString: '1',
  RecurrenceRuleString: '',
  IsInternalAppointment: 'false',
  IsNonPayable: 'false',
  GroupMasterId: '',
  GroupAppointment: '',
  RecurrenceID: '',
  Start1: '',
  End1: '',
  StartLocal: '',
  EndLocal: '',
  IsDealyTime: 'false',
  FilterTypeId: '0',
  color: '',
  BorderColor: '',
  CreateDate: '',
  CreatedBy: '',
  UpdateDate: '',
  UpdatedBy: '',
  Name: '',
  Address1: '',
  Address2: '',
  Address3: '',
  City: '',
  StateId: '0',
  ZipCode: '',
  CountryCodeId: '',
  Phone: '',
  AltPhone: '',
  PlaceOfServiceId: '0',
  SiteId: '0',
  'SelectedEmployee%5B0%5D': '4528',
  IgnoreRules: 'false',
  IsInternalAppointmentTemp: 'true',
  Isdeleted: 'false',
  IsClientAppointment: 'false',
  TestId: '',
  TestName: '',
  sProviderId: '',
  sClientId: '',
  AuthDescriptionForAppointment: '',
  AuthDetailDescriptionForAppointment: '',
  Appointmentstatus: '',
  AppointmentLocation: '',
  RenderDateTime: '',
  ASiteId: '0',
  CreatedDeviceBy: '',
  UpdatedDeviceBy: '',
  AppointmentStatusCategoryId: '0',
  RenderedMinutes: '',
  Sunday: '',
  Monday: '',
  Tuesday: '',
  Wednesday: '',
  Thrusday: '',
  Friday: '',
  Saturday: '',
  LastAppointmentDate: '',
  SingleUse: '',
  IsAltered: 'false',
  POS: '',
  ENAppointmentId: '',
  ENClientId: '',
  ENEmployeeId: '',
  IsMakeUp: 'false',
  All: '',
  OnlyProvider: '',
  OnlyTime: '',
  LocationName: '',
  Abbreviation: '',
  IsNewData: 'false',
  SmallNotes: '',
  MakeupDate: '',
  CoPay: '',
  IsClientDetailAccess: 'false',
  IsSmsButtonAccess: 'false',
  DriveTime: '',
  Mileage: '',
  LunchTimeMinutes: '',
  IsDriveTime: 'false',
  IsRecurrrenceAppointment: 'false',
  HideProviderName: 'false',
  RecurrenceRule: '',
  RecurrenceException: '',
  Title: '',
  Start: '2024-07-05T16:00:00.000Z',
  End: '2024-07-05T16:30:00.000Z',
  Description: '',
  IsAllDay: 'false',
  StartTimezone: '',
  EndTimezone: '',
};

// Functions
const mapDays = (daysArray) => {
  const daysMap = {
    0: 'SU',
    1: 'MO',
    2: 'TU',
    3: 'WE',
    4: 'TH',
    5: 'FR',
    6: 'SA',
  };

  return daysArray.map((day) => daysMap[day]).join(',');
};
const generateRecurrenceRule = (data) => {
  if (!data.recurring) {
    return '';
  }
  // Start building the RRULE string
  let rule = `FREQ=${data.frequency.toUpperCase()}`;

  // TODO Check if the following required
  // Add INTERVAL if it's greater than 1
  // if (data.interval && data.interval > 1) {
  //   rule += `;INTERVAL=${data.interval}`;
  // }

  // Add UNTIL date in UTC format
  if (data.endRecur) {
    // Assuming endRecur is in 'YYYY-MM-DD' format
    const untilMoment = moment(data.endRecur, 'YYYY-MM-DD')
      .subtract(1, 'day')
      .endOf('day')
      .utc();
    const untilFormatted = untilMoment.format('YYYYMMDD[T]HHmmss[Z]');
    rule += `;UNTIL=${untilFormatted}`;
  }

  // Add BYDAY for weekly frequency
  if (data.frequency.toLowerCase() === 'weekly' && data.days && data.days.length > 0) {
    const byDay = mapDays(data.days);
    rule += `;BYDAY=${byDay}`;
  }

  return rule;
};
function convertToLocalTimeWithZ(datetimeStr, timezone) {
  return (
    momentTimezone
      .utc(datetimeStr) // Parse as UTC
      .tz(timezone) // Convert to target timezone
      .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
  ); // Format and append 'Z'
}
const convertCreateNewPayload = (event) => {
  const formattedEvents = JSON.parse(JSON.stringify(createNewTemplate));
  formattedEvents.PatientId = event.clientId;
  formattedEvents.EmployeeId = event.employeeId;

  const currentDate = new Date();
  const dateString = currentDate.toISOString();

  formattedEvents.ScheduleEnd = dateString;
  formattedEvents.Start1 = dateString;
  formattedEvents.End1 = dateString;
  formattedEvents.StartLocal = dateString;
  formattedEvents.EndLocal = dateString;

  const timezone = event.timezone ?? 'America/New_York';
  const eventStart = convertToLocalTimeWithZ(event.start, timezone);
  const eventEnd = convertToLocalTimeWithZ(event.end, timezone);
  formattedEvents.Start = eventStart;
  formattedEvents.End = eventEnd;

  formattedEvents.RecurrenceRuleString = generateRecurrenceRule(event)

  let mergedString = Object.entries(formattedEvents)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return mergedString;
};
function makeReadCalendarPayload(data) {
  // Initialize variables for min and max dates
  let minStart = data[0].startRecur;
  let maxEnd = data[0].endRecur;

  // Sets to store unique employeeIds and clientIds
  const employeeSet = new Set();
  const patientSet = new Set();

  data.forEach((item) => {
    const { startRecur, endRecur, employeeId, clientId } = item;

    // Update minStart
    if (startRecur < minStart) {
      minStart = startRecur;
    }

    // Update maxEnd
    if (endRecur > maxEnd) {
      maxEnd = endRecur;
    }

    // Add to sets
    if (employeeId) {
      employeeSet.add(employeeId);
    }

    if (clientId) {
      patientSet.add(clientId);
    }
  });

  return {
    start: minStart,
    end: maxEnd,
    EmployeeIds: Array.from(employeeSet).join(','),
    PatientIds: Array.from(patientSet).join(','),
  };
}


// Actions
const createNewAppointment = async (payload, eventId, headers, cookies) => {
  try {
    // Assuming you want to make a POST request to add an appointment
    console.log('Creating New Appointment...');
    const response = await axios.post(CREATE_ROUTE, payload, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // Add other necessary headers
      },
      withCredentials: true,
      headers: {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
    });
    const createdEvent = response.data?.Data?.[0];
    if (createdEvent) {
      // console.log(
      //   '---------------- createdEvent',
      //   JSON.parse(JSON.stringify(response.data?.Data?.[0])),
      // );

      // For now using `CreateDate` because of inproper flow of measurePm
      const createDate = createdEvent.CreateDate.slice(0, 19);
      console.log('createDate', createDate);
      const successObj = {
        eventIdCustom: createDate,
        eventId,
      };
      return successObj;
    }
    console.warn('Errors', JSON.parse(JSON.stringify(response.data?.Errors)));
    return;
  } catch (error) {
    console.error('Error adding appointment:', error);
  }
};
const readCalendar = async (payload, headers, cookies) => {
  try {
    console.log('Reading Calendar...', payload);

    const payloadString = new URLSearchParams(payload).toString();
    const response = await axios.post(
      READ_CALENDAR_ROUTE,
      payloadString,
      {
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        withCredentials: true,
        headers: {
          Cookie: cookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join('; '),
        },
      },
    );
    // console.log('Calendar Read Successfully:', JSON.parse(JSON.stringify(response.data)));
    return response.data?.Data ?? [];
  } catch (error) {
    console.error('Error reading calendar :', error);
  }
};
const deleteAppointment = async (payload, headers, cookies) => {
  try {
    console.log('Deleting Appointment...');

    const payloadString = new URLSearchParams(payload).toString();
    const response = await axios.post(DELETE_ROUTE, payloadString, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // Add other necessary headers
      },
      withCredentials: true,
      headers: {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
    });
  } catch (error) {
    console.error('Error Deleting Appointment:', error);
  }
};

const doActionsMeasurePM = async (operations, email, password, timezone) => {
  const { createdEvents, deletedEvents, updatedEvents, canceledEvents } =
    operations;

  const successfulOperations = {
    createdEventsSuccessful: [],
  };

  let browser;
  try {
    browser = await puppeteer.launch({
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
    const page = await browser.newPage();

    await page.goto('https://login.measurepm.com/Account/Login', { waitUntil: 'domcontentloaded' });
    // await page.goto('https://login.measurepm.com/Appointment/Schedule');

    await page.waitForSelector('input[name="user_name"]', { timeout: 500 });
    await page.waitForSelector('input[name="Password"]', { timeout: 500 });
    await page.type('input[name="user_name"]', email);
    await page.type('input[name="Password"]', password);

    // Click the button
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 60000
      }),
      page.click('#loginButton')
    ]);
    console.log('Clicked login button and waited for navigation.');

    const errorMsg = await page.$('.field-validation-error');
    if (errorMsg) {
      console.log('Login failed: Invalid username or password');
      throw new Error('Login failed: Invalid username or password');
    }

    await page.goto('https://login.measurepm.com/Appointment/Schedule', { waitUntil: 'domcontentloaded', timeout: 11999 });

    // Wait for the request headers from the specific API request
    const headersCaptured = await waitForRequestHeaders(
      page,
      'https://login.measurepm.com/Appointment/GetAvailabilityEmployee',
    );
    if (!headersCaptured) {
      throw new Error('Failed to capture request headers.');
    }
    const headers = headersCaptured;
    const cookies = await page.cookies();

    /* Delete Events */
    const toBeDeletedEvents = [...deletedEvents, ...updatedEvents, ...canceledEvents];
    if (toBeDeletedEvents?.length) {
      const readPayload = makeReadCalendarPayload(toBeDeletedEvents);
      const existingEvents = await readCalendar(readPayload, headers, cookies);

      let toDeletedExistingEvents = [];
      toBeDeletedEvents.forEach((ev) => {
        let foundExistingEvents = [];
        existingEvents.forEach(existingEvent => {
          if (existingEvent.CreateDate) {
            if (existingEvent.CreateDate.includes(ev.eventIdCustom)) {
              foundExistingEvents.push(existingEvent);
            }
          }
        });
        if (foundExistingEvents.length) {
          toDeletedExistingEvents = [...toDeletedExistingEvents, ...foundExistingEvents]
        }
      });

      for (const toBeDeletedExistingEvent of toDeletedExistingEvents) {
        await deleteAppointment(toBeDeletedExistingEvent, headers, cookies)
      }
    }

    /* Create Events */
    const toBeCreatedEvents = [...createdEvents, ...updatedEvents];
    for (const toBeCreatedEvent of toBeCreatedEvents) {
      const convertedPayload = convertCreateNewPayload(toBeCreatedEvent);

      const successObj = await createNewAppointment(
        convertedPayload,
        toBeCreatedEvent?.eventId,
        headers,
        cookies,
      );

      if (successObj) {
        const existingIndex = successfulOperations.createdEventsSuccessful.findIndex(v => v.eventId === successObj.eventId);
        if (existingIndex !== -1) {
          successfulOperations.createdEventsSuccessful.splice(existingIndex, 1);
        }
        successfulOperations.createdEventsSuccessful.push(successObj);
      }
    }
    console.log('successfulOperations', successfulOperations);

    await browser.close();
    return successfulOperations;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    // TODO log error
    console.error('MPM integration error:', error);
    throw error;
  }
};

module.exports = doActionsMeasurePM;
