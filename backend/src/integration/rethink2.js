const config = require('../config');
const puppeteer = require('puppeteer');
const axios = require('axios');
const moment = require('moment');
const Cookie = require('cookie');
const { email } = require('../config');
const moment2 = require('moment-timezone');
const qs = require('qs');

// First we need to get headers and cookies with puppeteer
const getAuth = async (userCreds) => {
  let browser;
  try {
    client_id = 'acclaim_autism';
    client_secret = '5B63M650ELuL9hDCyz';
    await getAuthorization(client_id, client_secret, authentication_url);
    return data;
  } catch (error) {}
};

const getHeadersAndCookies = async (userCreds) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      timeout: 60000,
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
    await page.setViewport({ width: 1080, height: 720 });

    const loginPromise = new Promise((resolve, reject) => {
      page.on('request', async (interceptedRequest) => {
        if (
          interceptedRequest
            .url()
            .includes(
              'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/GetAppointmentsListNewAsync',
            )
        ) {
          try {
            const myHeaders = interceptedRequest.headers();
            const myCookies = await page.cookies();
            resolve({
              headers: myHeaders,
              cookies: myCookies,
            });
          } catch (error) {
            reject(error);
          }
        }
      });
      page.on('error', (error) => {
        reject(error);
      });
    });

    await page.goto('https://webapp.rethinkbehavioralhealth.com/Healthcare#/', {
      waitUntil: 'networkidle2',
    });
    console.log('Starting login process...');
    await page.waitForSelector('input[name="User"]', { timeout: 10000 });
    await page.type('input[name="User"]', userCreds?.email); // TODO should be input by user on the FE
    await page.waitForSelector(
      'div.ra-btn.ra-btn-gradient.loginBtn[ng-click="Next(LoginForm)"]',
      {
        timeout: 10000,
      },
    );
    console.log('helper1');
    await page.click(
      'div.ra-btn.ra-btn-gradient.loginBtn[ng-click="Next(LoginForm)"]',
    );
    await page.waitForSelector('input[name="Password"]', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.type('input[name="Password"]', userCreds?.password); // TODO should be input by user on the FE
    console.log('helper2');
    await page.waitForSelector(
      'div.ra-btn.ra-btn-gradient.loginBtn[ng-click="Login(LoginForm);"]',
      {
        timeout: 10000,
      },
    );
    console.log('helper2.5');
    await page.waitForTimeout(500);
    await page.click(
      'div.ra-btn.ra-btn-gradient.loginBtn[ng-click="Login(LoginForm);"]',
    );
    console.log('helper3');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Successfully logged in');

    await page.goto(
      'https://webapp.rethinkbehavioralhealth.com/core/scheduler',
      { waitUntil: 'networkidle2' },
    );

    const data = await loginPromise;
    await browser.close();
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
};

// We need to define necessary functions to convert, add,delete and cancel
const getAuthorization = async (client_id, client_secret, url) => {
  try {
    const data = qs.stringify({
      client_id: 'acclaim_autism',
      client_secret: '5B63M650ELuL9hDCyz',
      grant_type: 'client_credentials',
    });

    const config = {
      method: 'post',
      url: 'https://id.rethinkbehavioralhealth.com/connect/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log('keemy', JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log('Adding Cookie', headers.Cookie);
    console.log('Adding Headers', headers);
    console.log(
      'Appointment added successfully:',
      JSON.stringify(response.data),
      response.data.appointment.id,
    );
    return response.data;
  } catch (error) {
    console.error('Error adding appointment:', error);
  }
};

// We need to define necessary functions to convert, add,delete and cancel
const addAppointment = async (payload, url, headers, cookies) => {
  try {
    // Assuming you want to make a POST request to add an appointment
    console.log('Adding appointment...');
    const response = await axios.post(url, payload, {
      headers: {
        ...headers,
        'Content-Type': 'application/json', // Add other necessary headers
      },
      withCredentials: true,
      // Include cookies in the request

      headers: {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
    });
    console.log('Adding Cookie', headers.Cookie);
    console.log('Adding Headers', headers);
    console.log(
      'Appointment added successfully:',
      JSON.stringify(response.data),
      response.data.appointment.id,
    );
    return response.data;
  } catch (error) {
    console.error('Error adding appointment:', error);
  }
};

const cancelAppointment = async (payload, url, headers, cookies) => {
  try {
    console.log('Canceling appointment...');
    const response = await axios.post(url, payload, {
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=utf-8',
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
      withCredentials: true,
    });
    console.log(
      'Appointment canceled successfully:',
      JSON.stringify(response.data),
    );
    return response.data;
  } catch (error) {
    console.error('Error canceling appointment:', error);
  }
};

const deleteAppointment = async (payload, url, headers, cookies) => {
  try {
    console.log('Deleting appointment...');
    const response = await axios.post(url, payload, {
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=utf-8',
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
      withCredentials: true,
    });
    console.log('Appointment deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
  }
};

const updateAppointment = async (payload, url, headers, cookies) => {
  try {
    console.log('Updating appointment...');
    const response = await axios.post(url, payload, {
      headers: {
        ...headers,
        'Content-Type': 'application/json; charset=utf-8',
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
      withCredentials: true,
    });
    console.log('Appointment updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating appointment:', error);
  }
};

// Utils

function getTimezoneOffsetInHoursInt(timezone) {
  // Get the current time in the specified timezone
  const currentTime = moment2.tz(moment(), timezone);

  // Get the timezone offset in hours as an integer
  const offsetInHoursInt = Math.floor(currentTime.utcOffset() / 60); // Convert minutes to hours and round down

  return offsetInHoursInt;
}

// console.log('timezone : ', getTimezoneOffsetInHoursInt('America/New_York'));

function subtractHoursAndFormat(timeString, hoursToSubtract) {
  // Parse the time string
  hoursToSubtract = hoursToSubtract * -1;
  const parsedTime = moment(timeString, 'HH:mm:ss');

  // Subtract the specified number of hours
  const subtractedTime = parsedTime.subtract(hoursToSubtract, 'hours');

  // Format the result in AM/PM format without seconds
  const formattedTime = subtractedTime.format('hh:mm A');

  return [formattedTime, subtractedTime.format('HH:mm:ss')];
}

// console.log(
//   subtractHoursAndFormat(
//     '13:00:00',
//     getTimezoneOffsetInHoursInt('America/New_York'),
//   ),
// );

function timeToMinutes(timeString) {
  // Split the time string into hours, minutes, and AM/PM
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  // // Convert hours to 24-hour format
  // let hours24 = hours; // Convert 12-hour to 24-hour format
  // if (period === 'PM') {
  //   hours24 += 12; // Add 12 hours for PM
  // }

  // Calculate total minutes since midnight
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes;
}

const objectConverter = (template, obj) => {
  template.appointment.formatedStartDate = obj.startRecur;
  template.appointment.formatedEndDate = obj.startRecur;
  template.appointment.formatedStartTime = subtractHoursAndFormat(
    obj.start,
    getTimezoneOffsetInHoursInt(obj.timezone),
  )[1];
  template.appointment.formatedEndTime = subtractHoursAndFormat(
    obj.end,
    getTimezoneOffsetInHoursInt(obj.timezone),
  )[1];
  template.appointment.startDate = obj.startRecur + 'T00:00:00';
  template.appointment.startTime =
    120 + timeToMinutes(template.appointment.formatedStartTime);
  template.appointment.endTime =
    120 + timeToMinutes(template.appointment.formatedEndTime);
  template.appointment.staffId = obj.employeeId;
  template.appointment.clientId = obj.clientId;
  template.appointment.displayDate = obj.startRecur;
  template.appointment.displayStartTime = subtractHoursAndFormat(
    obj.start,
    getTimezoneOffsetInHoursInt(obj.timezone),
  )[0];
  template.appointment.displayEndTime = subtractHoursAndFormat(
    obj.end,
    getTimezoneOffsetInHoursInt(obj.timezone),
  )[0];
  template.appointment.existingStartDate = obj.startRecur + 'T00:00:00';
  template.remindersData.startDate =
    obj.startRecur + 'T' + template.appointment.formatedStartTime;
  return template;
};

const cancelObjectConverter = (template, obj) => {
  const currentDate = new Date();
  const dateString = currentDate.toISOString();
  template.appointmentInstances[0].appointmentId = obj.id;
  template.appointmentInstances[0].startDate = obj.startDate;
  template.cancellation.dueDate = dateString;
  template.eventDetailsAppointment.clientContactId = obj.clientContactId;
  template.eventDetailsAppointment.clientLocation = obj.toLocation;
  template.eventDetailsAppointment.rescheduleDueDate = dateString;
  template.eventDetailsAppointment.initAppointmentStartTime = obj.startTime;
  template.eventDetailsAppointment.initAppointmentEndTime = obj.endTime;
  template.eventDetailsAppointment.id = obj.id;
  template.eventDetailsAppointment.staffId = obj.staffId;
  template.eventDetailsAppointment.staffName = obj.staffName;
  template.eventDetailsAppointment.staffInitials = obj.staffInitials;
  template.eventDetailsAppointment.staffTitle = obj.staffTitle;
  template.eventDetailsAppointment.staffLocation = obj.staffLocation;
  template.eventDetailsAppointment.clientId = obj.clientId;
  template.eventDetailsAppointment.clientName = obj.clientName;
  template.eventDetailsAppointment.clientInitials = obj.clientInitials;
  template.eventDetailsAppointment.clientShortName = obj.clientShortName;
  template.eventDetailsAppointment.occurrenceTypeId = obj.occurrenceTypeId;
  template.eventDetailsAppointment.occurrenceFrequency =
    obj.occurrenceFrequency;
  template.eventDetailsAppointment.frequencyInterval = obj.frequencyInterval;
  template.eventDetailsAppointment.occurrenceTypeName = obj.occurrenceTypeName;
  template.eventDetailsAppointment.statusName = obj.statusName;
  template.eventDetailsAppointment.evvStatusName = obj.evvStatusName;
  template.eventDetailsAppointment.evvStatusId = obj.evvStatusId;
  template.eventDetailsAppointment.startDate = obj.startDate;
  template.eventDetailsAppointment.endDate = obj.endDate;
  template.eventDetailsAppointment.startTime = obj.startTime;
  template.eventDetailsAppointment.endTime = obj.endTime;
  template.eventDetailsAppointment.scheduledById = obj.scheduledById;
  template.eventDetailsAppointment.dateCreated = obj.dateCreated;
  template.eventDetailsAppointment.appointmentTypeId = obj.appointmentTypeId;
  template.eventDetailsAppointment.funderId = obj.funderId;
  template.eventDetailsAppointment.stateId = obj.stateId;
  template.eventDetailsAppointment.funderName = obj.funderName;
  template.eventDetailsAppointment.serviceId = obj.serviceId;
  template.eventDetailsAppointment.providerServiceId = obj.providerServiceId;
  template.eventDetailsAppointment.serviceName = obj.serviceName;
  template.eventDetailsAppointment.providerServiceName =
    obj.providerServiceName;
  template.eventDetailsAppointment.propagatingServiceName =
    obj.propagatingServiceName;
  template.eventDetailsAppointment.toLocationId = obj.toLocationId;
  template.eventDetailsAppointment.toLocation = obj.toLocation;
  template.eventDetailsAppointment.procedureCodeId = obj.procedureCodeId;
  template.eventDetailsAppointment.serviceId = obj.serviceId;
  template.eventDetailsAppointment.serviceId = obj.serviceId;

  template.eventDetailsAppointment.dateCreated = obj.dateCreated;
  // template.eventDetailsAppointment.clientLocation = obj.toLocation;
  template.eventDetailsAppointment.events[0] = {
    ...template.eventDetailsAppointment.events[0],
    ...obj.events[0],
  };
  template.eventDetailsAppointment.events[0].startDateTimeText =
    '4/30/2024 08:00 AM';
  template.eventDetailsAppointment.events[0].endDateTimeText =
    '4/30/2024 09:15 AM';
  // template.eventDetailsAppointment.authorizationUsedHours =
  //   obj.authorizationUsedHours;
  template.eventDetailsAppointment.clientContactName = obj.clientContactName;
  template.eventDetailsAppointment.clientContactRelationship =
    obj.clientContactRelationship;
  template.eventDetailsAppointment.paycodeId = obj.paycodeId;
  template.eventDetailsAppointment.locationId = obj.locationId;
  template.eventDetailsAppointment.dateBillingReported =
    adjustTimeAndConvertToUTC(obj.dateBillingReported);
  template.eventDetailsAppointment.dateLastModified = adjustTimeAndConvertToUTC(
    obj.dateLastModified,
  );
  template.eventDetailsAppointment.notes = obj.notes;

  template.eventDetailsAppointment.authorizationNumber =
    obj.authorizationNumber;
  // template.eventDetailsAppointment.toLocationLatitude =
  //   obj.toLocationLatitude;
  // template.eventDetailsAppointment.toLocationLongitude =
  //   obj.toLocationLongitude;
  template.eventDetailsAppointment.originalStartTime = obj.startTime;
  template.eventDetailsAppointment.originalEndTime = obj.endTime;
  template.eventDetailsAppointment.existingStartTime = obj.startTime - 120;
  template.eventDetailsAppointment.existingEndTime = obj.endTime - 120;
  template.eventDetailsAppointment.formatedStartDate = obj.startDate.slice(
    0,
    10,
  );
  template.eventDetailsAppointment.formatedPrincipalVerificationDate =
    getCurrentDateString();
  template.eventDetailsAppointment.initOccurrenceEndDate = obj.startDate;
  template.eventDetailsAppointment.displayDate =
    obj.startDate.slice(0, 10) +
    'T' +
    minutesToTime(obj.startTime + 120).slice(0, 5) +
    ':00.000Z'; //;
  template.eventDetailsAppointment.service.serviceLineId = obj.serviceId;
  template.eventDetailsAppointment.service.providerServiceId =
    obj.providerServiceId;
  template.eventDetailsAppointment.service.funderId = obj.funderId;
  template.eventDetailsAppointment.service.procedureCodeId =
    obj.procedureCodeId;

  template.eventDetailsAppointment.displayStartTime = minutesToTime(
    obj.startTime - 120,
  );
  template.eventDetailsAppointment.displayEndTime = minutesToTime(
    obj.endTime - 120,
  );
  template.eventDetailsAppointment.dueDate = dateString;
  template.eventDetailsAppointment.existingStartDate = obj.startDate;

  return template;
};

function minutesToTime(totalMinutes) {
  // Calculate hours and minutes
  const hours = Math.floor(totalMinutes / 60) % 24; // Modulo 24 for hours in a day
  const minutes = totalMinutes % 60;

  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';

  // Format hours and minutes
  const formattedHours = (hours % 12 === 0 ? 12 : hours % 12)
    .toString()
    .padStart(2, '0'); // Convert 0 to 12 for 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, '0');

  // Construct the time string
  const timeString = `${formattedHours}:${formattedMinutes} ${period}`;

  return timeString;
}

function getWeekStartAndEnd(dateString) {
  // Parse the input date
  const date = moment(dateString, 'YYYY-MM-DD');

  // Get the start of the week (Sunday) and end of the week (Saturday)
  const startOfWeek = date.clone().startOf('week'); // Sunday
  const endOfWeek = date.clone().endOf('week'); // Saturday

  // Adjust to start of week being Monday instead of Sunday
  startOfWeek.add(1, 'days');
  endOfWeek.add(1, 'days');

  // Format the dates
  const formattedStartOfWeek = startOfWeek.toISOString();
  const formattedEndOfWeek = endOfWeek.toISOString();

  // Return the start and end dates of the week
  return {
    startDate: formattedStartOfWeek.slice(0, 19),
    endDate: formattedEndOfWeek.slice(0, 19),
  };
}

function adjustTimeAndConvertToUTC(dateTimeString) {
  // Parse the input datetime string
  const dateTime = moment(dateTimeString);

  // Add 2 hours to the datetime
  const adjustedDateTime = dateTime.add(2, 'hours');

  // Convert the adjusted datetime to UTC timezone
  const utcDateTime = adjustedDateTime.utc();

  // Format the datetime to ISO string format
  const formattedDateTime = utcDateTime.toISOString();

  return formattedDateTime;
}

function getCurrentDateString() {
  // Get the current date
  const currentDate = new Date();

  // Extract the year, month, and day
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month starts from 0
  const day = String(currentDate.getDate()).padStart(2, '0');

  // Assemble the date string
  const dateString = `${year}-${month}-${day}`;

  return dateString;
}

const getFormattedDate = (date) => {
  const pad = (num) => num.toString().padStart(2, '0');
  const padMilliseconds = (num) => num.toString().padStart(3, '0');

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1); // months are zero-indexed
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const milliseconds = padMilliseconds(date.getUTCMilliseconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
};

const getAppointmentWithId = async (id, startDate, headers, cookies) => {
  const url = `https://webapp.rethinkbehavioralhealth.com/core/api/v2/scheduling/scheduling/GetAppointmentsByIdAsync?appointmentId=${id}&memberId=&startDate=${startDate}T00:00:00.000Z`;

  try {
    console.log('Getting appointment...');
    const response = await axios.get(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
      withCredentials: true,
    });
    console.log('Appointment retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error retrieving appointment:', error);
  }
};

// Converter functions end

let event_payload = {
  appointment: {
    formatedStartDate: '2024-04-16',
    formatedEndDate: '2024-04-16',
    formatedStartTime: '10:30:00',
    formatedEndTime: '10:45:00',
    startDate: '2024-04-16T00:00:00',
    startTime: 750,
    endTime: 780,
    statusId: 1,
    exceedAuthorizedHours: false,
    isExceedAuthorizationHours: false,
    isExceedSchedulingGoal: false,
    occurrenceTypeId: 1,
    clientContactRelationship: '',
    clientContactName: '',
    staffId: 309886,
    staffName: '',
    clientId: 131689,
    clientName: 'Training Client',
    occurrenceText: 'None',
    initAppointmentStartDate: '2024-04-16T10:30:00',
    funderId: 3761,
    serviceId: 773,
    procedureCodeId: 1717819,
    providerServiceId: 1979,
    providerBillingCodeCredentialId: 0,
    hasErrors: false,
    appointmentTypeId: 1,
    displayDate: '2024-04-16T14:30:00.000Z',
    displayStartTime: '10:30 AM',
    displayEndTime: '11:00 AM',
    repeat: false,
    paycodeId: 3406,
    activityTagId: null,
    service: {
      funderId: 3761,
      serviceLineId: 773,
      providerServiceId: 1979,
      procedureCodeId: 1717819,
      providerBillingCodeId: null,
      providerBillingCodeCredentialId: null,
      groupName: 'Colorado Medicaid > ABA',
      description: 'BT 1:1, 97153, 12344532, 2/1/2024 - 11/22/2024',
      funderCopay: null,
      funderName: 'Colorado Medicaid',
      serviceLineName: 'ABA',
      serviceName: 'BT 1:1',
      schedulingRules: {
        appointmentDuplicateClientTimeAlertId: 3,
        appointmentDuplicateClientTimeServiceAlertId: 3,
        appointmentMissingBillingDataAlertId: 3,
        appointmentExceedingAuthorizationAlertId: 1,
        appointmentExpiredCertificationAlertId: 1,
      },
      preventBillableAppointmentDates: [],
      restrictToStaffCredential: false,
      credentialId: null,
      totalAuthHours: 650,
      authorizationNumber: '12344532',
      checkExceedAuthorizationWarning: true,
      authorizationStartDate: '2024-02-01T00:00:00',
      authorizationEndDate: '2024-11-22T00:00:00',
      billingCodeDescription:
        'Adaptive behavior treatment by protocol (Replacing 0364T/0365T)',
      noOfUnits: 2600,
      unit: 15,
      billingCode: '97153',
      billingCode2: null,
      schedulingGoalNoOfUnits: 2600,
      isMissingBillingInfo: false,
      isUntimed: false,
      isPendingSubmission: false,
      hcFrequencyTypeId: 4,
      totalFrequencyUnit: 650,
      schedulingGoalFrequencyTypeId: 4,
      totalSchedulingFrequencyUnit: 650,
      authorizedWeeklyHours: 15.423728813559322,
      noAuthRequired: false,
      isDPH: false,
      diagnosisEndDate: '0001-01-01T00:00:00',
      rate: 0,
      payerSequenceId: 1,
      payerSequenceName: 'Primary',
      funderTypeId: 1,
      isAppointmentCurrentService: false,
      id: '773_1979_3761_1717819_0_null',
    },
    locationId: 3,
    toLocationId: 2,
    toLocation: '1234 Main Street, Denver, Colorado, 80502',
    toLocationLatitude: null,
    toLocationLongitude: null,
    fromLocation: null,
    isStaffCancelled: false,
    isClientCancelled: false,
    notes: 'TEST-bazo',
    isRescheduled: false,
    isCopaymentEntered: false,
    addTravelAppointment: false,
    mileage: null,
    overnightDate: null,
    actualStartTime: null,
    actualEndTime: null,
    appointmentTypeName: 'Billable',
    scheduledById: 309886,
    endDate: '0001-01-01T00:00:00',
    locationName: '12 - Home',
    toLocationName: 'Client Home',
    fromLocationName: '',
    serviceName: 'BT 1:1',
    paycodeName: 'Aministrative',
    activityTagName: '',
    cancellationTypeName: '',
    authorizedWeeklyHours: 0,
    existingStartDate: '2024-04-16T00:00:00',
    occurrenceEndType: 0,
    clientContactId: 0,
    rescheduleAssignedToId: 0,
    sessionNoteFormId: 0,
    associatedAppointmentId: 0,
    diagnosisId: 0,
    id: 0,
    occurrenceFrequency: 0,
    frequencyInterval: 0,
    monthDay: 0,
    sessionNoteResponseId: 0,
    cancellationTypeId: 0,
    units: 0,
    modifiedBy: 0,
    checkAuthorizationExceed: false,
    linkedToEncounter: false,
    linkedToApprovedEncounter: false,
    isEVV: false,
    isClientDemo: false,
    occurrenceLookup: false,
    isMissingBillingInfo: false,
    isPendingSubmission: false,
    noAuthRequired: false,
    rescheduleDueDate: '0001-01-01T00:00:00',
    dateCreated: '0001-01-01T00:00:00',
    dateLastModified: '0001-01-01T00:00:00',
    authorizationStartDate: '0001-01-01T00:00:00',
    authorizationEndDate: '0001-01-01T00:00:00',
    lastModified: '0001-01-01T00:00:00',
  },
  checkExceedAuthorization: false,
  remindersData: {
    clientContacts: [],
    staffMember: null,
    startDate: '2024-04-16T10:30:00',
    appointmentDateChanged: false,
  },
};

let delete_payload = {
  appointment: {
    description: '',
    signatureParentName: null,
    verifiedFromSessionNote: null,
    clientContactId: 117927,
    clientLocation: '1234 Main Street, Denver, Colorado 80502',
    cancellationTypeName: 'All',
    rescheduleDueDate: '0001-01-01T00:00:00',
    rescheduleAssignedToId: 0,
    sessionNoteFormId: 0,
    sessionNoteComments: [],
    staffSignature: null,
    clientSignature: null,
    principalSignature: null,
    associatedAppointmentId: 0,
    diagnosisId: 0,
    startingAddress: null,
    endingAddress: null,
    sessionNoteReviewedOn: null,
    sessionNoteReviewedByName: null,
    sessionNoteReviewedByTitle: null,
    copaymentMethodId: null,
    copaymentReferenceNumber: null,
    copaymentAmountCollected: null,
    cancellationTagName: '',
    checkAuthorizationExceed: false,
    verifiedById: null,
    verifiedByName: null,
    verifiedByTitle: null,
    rescheduleFromId: null,
    initAppointmentStartDate: '2024-04-16T10:30:00',
    initAppointmentStartTime: 750,
    initAppointmentEndTime: 795,
    missingSessionNotesFileCabinet: false,
    sessionNoteDraftFormId: null,
    sessionNoteDraftOn: null,
    sessionNoteDraftStaffMemberId: null,
    sessionNoteDraftStaffMemberName: null,
    linkedToEncounter: false,
    linkedToApprovedEncounter: false,
    hasTrialSetData: null,
    hasBehaviorPlanData: null,
    providerPrincipalSignature: false,
    sessionNoteSubmitOn: null,
    sessionNoteSubmitBy: null,
    sessionNoteStatus: null,
    hasDiscrepancy: false,
    sessionNoteDraftAutoSaved: false,
    unarchivedReasonDescription: null,
    uncancelReasonDescription: null,
    id: 52614143,
    staffId: 309886,
    memberId: 0,
    staffName: 'Adam Daniels',
    staffInitials: 'AD',
    staffTitle: 'System Admin',
    staffLocation: 'Broomfield',
    staffSupervisorName: '',
    clientId: 131689,
    clientName: 'Training Client',
    clientInitials: 'TC',
    clientShortName: null,
    occurrenceTypeId: 1,
    occurrenceFrequency: 0,
    frequencyInterval: 0,
    occurrenceTypeName: 'Single',
    statusId: 2,
    statusName: 'Needs Verification',
    evvStatusId: 1,
    evvStatusName: 'Pending',
    evvProviderStatusUuid: null,
    evvRejectedReason: null,
    startDate: '2024-04-16T00:00:00',
    endDate: '0001-01-01T00:00:00',
    startTime: 750,
    endTime: 795,
    actualStartTime: null,
    actualEndTime: null,
    scheduledById: 309886,
    dateCreated: '2024-04-24T11:32:49.643',
    appointmentTypeId: 1,
    dayTypes: [],
    monthDay: 0,
    monthTypeId: null,
    monthOccurrenceTypeId: null,
    monthOccurrenceDayId: null,
    appointmentTypeName: 'Billable',
    staffVerificationDate: '0001-01-01T00:00:00',
    clientVerificationDate: '0001-01-01T00:00:00',
    principalVerificationDate: '0001-01-01T00:00:00',
    funderId: 3761,
    evvClearingHouseId: 4,
    stateId: 6,
    funderName: 'Colorado Medicaid',
    billingCode: null,
    serviceId: 773,
    providerServiceId: 1979,
    serviceName: 'ABA',
    providerServiceName: 'BT 1:1',
    propagatingServiceName: 'BT 1:1',
    propagatingServiceEndDate: null,
    fromLocationId: null,
    fromLocation: null,
    toLocationId: 2,
    toLocation: '1234 Main Street, Denver, Colorado, 80502',
    locationName: null,
    mileage: null,
    procedureCodeId: 1717819,
    staffSignatureId: null,
    clientSignatureId: null,
    principalSignatureId: null,
    parentSignature: null,
    events: [
      {
        id: 52614143,
        text: '10:30 AM - 11:15 AM',
        html: '12:30 PM - 01:15 PM',
        start: '2024-04-16 10:30:00',
        end: '2024-04-16 11:15:00',
        resource: '131689',
        bubbleHtml:
          '<strong>Client Name:</strong> Training Client<br />\r\n<strong>Staff Member Name:</strong> Adam Daniels<br />\r\n<strong>Service Line:</strong> ABA<br />\r\n<strong>Service:</strong> BT 1:1<br />\r\n<strong>Activity:</strong> <br />\r\n<strong>Date:</strong> 4/16/2024<br />\r\n<strong>Time:</strong> 10:30 AM - 11:15 AM<br />\r\n<strong>Supervisor Name:</strong> <br />\r\n<strong>Appointment Status:</strong> Needs Verification<br />\r\n',
        statusId: 2,
        statusName: 'Needs Verification',
        evvStatusName: 'Pending',
        checkExceedAuthorizationHours: true,
        procedureCodeId: 1717819,
        minutes: 45,
        hours: 0,
        isExceedAuthorizationHours: null,
        isExceedSchedulingGoal: null,
        startDateTimeText: '4/16/2024 10:30 AM',
        endDateTimeText: '4/16/2024 11:15 AM',
        validationReasons: null,
        appointmentTypeId: 1,
        validation: null,
        isOvernight: false,
        sortStartDate: '2024-04-16T14:30:00.000Z',
        sortEndDate: '2024-04-16T15:15:00.000Z',
        eventDate: '2024-04-16T10:30:00',
        date: 'Apr 16 2024',
        eventDataMonth: '2024-04-16T14:30:00.000Z',
        eventDayName: 'Tue',
        eventIsToday: false,
        timeText: '10:30 AM - 11:15 AM',
      },
    ],
    sessionNoteResponseId: 0,
    seriesAppointmentId: null,
    occurrenceEndDate: null,
    providerBillingCodeId: null,
    providerBillingCodeCredentialId: null,
    expirationDate: null,
    seriesAppointmentStartDate: null,
    initOccurrenceStartDate: null,
    isParentVerificationRequired: null,
    isSessionNoteEnteredRequired: true,
    sessionNoteReviewedBy: null,
    authorizationUsedHours: 1,
    activityTagName: '',
    cancellationTypeId: 0,
    cancellationTagId: null,
    exceedAuthorizedHours: false,
    checkExceedAuthorizationHours: true,
    procedureCodeIdPreviousReference: null,
    notes: 'TEST-bazo',
    clientContactName: 'Cathie Christmas',
    clientContactRelationship: 'Mother',
    paycodeId: 3406,
    paycode: null,
    paycodeName: null,
    signatureParentRelationship: null,
    locationId: 3,
    adminVerificationDate: null,
    adminVerifiedBy: null,
    parentLatitude: null,
    parentLongitude: null,
    staffMemberLatitude: null,
    staffMemberLongitude: null,
    parentVerifiedAddress: null,
    staffVerifiedAddress: null,
    activityTagId: null,
    address: null,
    dateBillingReported: null,
    datePayrollReported: null,
    modifiedBy: 729905,
    dateLastModified: '2024-04-24T15:55:51.000Z',
    location: null,
    status: null,
    dateDoeBilled: null,
    statusDoeBilled: null,
    sessionNoteDraftResponseId: null,
    noAuthRequired: false,
    authorizationEndDate: '0001-01-01T00:00:00',
    authorizationStartDate: '0001-01-01T00:00:00',
    authorizedWeeklyHours: 0,
    occurrenceLookup: false,
    isClientDemo: false,
    validation: null,
    authorizationNumber: '12344532',
    units: 0,
    renderingProvider: null,
    referringProviderName: null,
    includeReferringProviderRequiredOnClaim: false,
    evvReasons: [],
    acknowledgeableExceptions: null,
    evvActionTakenId: null,
    isEVV: true,
    clockInLatitude: null,
    clockInLongitude: null,
    clockOutLatitude: null,
    clockOutLongitude: null,
    toLocationLatitude: 40.1619302,
    toLocationLongitude: -105.1039067,
    clockInAddress: null,
    clockOutAddress: null,
    modifier1: null,
    modifier2: null,
    lastModified: '0001-01-01T00:00:00',
    isMissingBillingInfo: false,
    isPendingSubmission: false,
    clearingHouseId: null,
    postfix: null,
    staffRecordInd: null,
    parentRecordInd: null,
    isForAuthCalc: null,
    cancellationNote: null,
    unarchivedReasonId: null,
    uncancelReasonId: null,
    staffAddressId: 0,
    wasRescheduled: null,
    overnightId: null,
    overnightDate: null,
    overnightEndTime: null,
    isFullOvernightAppointment: false,
    originalStartTime: 750,
    originalEndTime: 795,
    existingStartTime: 630,
    existingEndTime: 675,
    formatedStartDate: '2024-04-16',
    formatedPrincipalVerificationDate: '2024-04-24',
    occurrenceText: 'None',
    savedAppointmentTypeId: 1,
    initOccurrenceEndDate: '0001-01-01T00:00:00',
    displayDate: '2024-04-16T14:30:00.000Z',
    displayStartTime: '10:30 AM',
    displayEndTime: '11:15 AM',
    repeat: false,
    service: {
      serviceLineId: 773,
      providerServiceId: 1979,
      funderId: 3761,
      procedureCodeId: 1717819,
      providerBillingCodeId: null,
    },
    isStaffVerified: false,
    isParentVerified: false,
    isStaffCancelled: false,
    isClientCancelled: false,
    isAutoCancelled: false,
    isRescheduled: false,
    isCopaymentEntered: false,
    addTravelAppointment: false,
    hasErrors: false,
    existingStartDate: '2024-04-16T00:00:00',
    occurrenceEndType: 0,
    isExceedSchedulingGoal: false,
    isExceedAuthorizationHours: false,
  },
  checkExceedAuthorization: false,
  reschedulling: false,
};

let update_payload = {
  appointment: {
    description: '',
    signatureParentName: null,
    verifiedFromSessionNote: null,
    clientContactId: 117927,
    clientLocation: '1234 Main Street, Denver, Colorado 80502',
    cancellationTypeName: '',
    rescheduleDueDate: '0001-01-01T00:00:00',
    rescheduleAssignedToId: 0,
    sessionNoteFormId: 0,
    sessionNoteComments: [],
    staffSignature: null,
    clientSignature: null,
    principalSignature: null,
    associatedAppointmentId: 0,
    diagnosisId: 0,
    startingAddress: null,
    endingAddress: null,
    sessionNoteReviewedOn: null,
    sessionNoteReviewedByName: null,
    sessionNoteReviewedByTitle: null,
    copaymentMethodId: null,
    copaymentReferenceNumber: null,
    copaymentAmountCollected: null,
    cancellationTagName: '',
    checkAuthorizationExceed: false,
    verifiedById: null,
    verifiedByName: null,
    verifiedByTitle: null,
    rescheduleFromId: null,
    initAppointmentStartDate: '2024-04-16T10:30:00',
    initAppointmentStartTime: 750,
    initAppointmentEndTime: 780,
    missingSessionNotesFileCabinet: false,
    sessionNoteDraftFormId: null,
    sessionNoteDraftOn: null,
    sessionNoteDraftStaffMemberId: null,
    sessionNoteDraftStaffMemberName: null,
    linkedToEncounter: false,
    linkedToApprovedEncounter: false,
    hasTrialSetData: null,
    hasBehaviorPlanData: null,
    providerPrincipalSignature: false,
    sessionNoteSubmitOn: null,
    sessionNoteSubmitBy: null,
    sessionNoteStatus: null,
    hasDiscrepancy: false,
    sessionNoteDraftAutoSaved: false,
    unarchivedReasonDescription: null,
    uncancelReasonDescription: null,
    id: 52614143,
    staffId: 309886,
    memberId: 0,
    staffName: 'Adam Daniels',
    staffInitials: 'AD',
    staffTitle: 'System Admin',
    staffLocation: 'Broomfield',
    staffSupervisorName: '',
    clientId: 131689,
    clientName: 'Training Client',
    clientInitials: 'TC',
    clientShortName: null,
    occurrenceTypeId: 1,
    occurrenceFrequency: 0,
    frequencyInterval: 0,
    occurrenceTypeName: 'Single',
    statusId: 2,
    statusName: 'Needs Verification',
    evvStatusId: 1,
    evvStatusName: 'Pending',
    evvProviderStatusUuid: null,
    evvRejectedReason: null,
    startDate: '2024-04-16T00:00:00',
    endDate: '0001-01-01T00:00:00',
    startTime: 750,
    endTime: 795,
    actualStartTime: null,
    actualEndTime: null,
    scheduledById: 309886,
    dateCreated: '2024-04-24T11:32:49.643',
    appointmentTypeId: 1,
    dayTypes: [],
    monthDay: 0,
    monthTypeId: null,
    monthOccurrenceTypeId: null,
    monthOccurrenceDayId: null,
    appointmentTypeName: 'Billable',
    staffVerificationDate: '0001-01-01T00:00:00',
    clientVerificationDate: '0001-01-01T00:00:00',
    principalVerificationDate: '0001-01-01T00:00:00',
    funderId: 3761,
    evvClearingHouseId: 4,
    stateId: 6,
    funderName: 'Colorado Medicaid',
    billingCode: null,
    serviceId: 773,
    providerServiceId: 1979,
    serviceName: 'ABA',
    providerServiceName: 'BT 1:1',
    propagatingServiceName: 'BT 1:1',
    propagatingServiceEndDate: null,
    fromLocationId: null,
    fromLocation: null,
    toLocationId: 2,
    toLocation: '1234 Main Street, Denver, Colorado, 80502',
    locationName: '12 - Home',
    mileage: null,
    procedureCodeId: 1717819,
    staffSignatureId: null,
    clientSignatureId: null,
    principalSignatureId: null,
    parentSignature: null,
    events: [
      {
        id: 52614143,
        text: '10:30 AM - 11:00 AM',
        html: '12:30 PM - 01:00 PM',
        start: '2024-04-16 10:30:00',
        end: '2024-04-16 11:00:00',
        resource: '131689',
        bubbleHtml:
          '<strong>Client Name:</strong> Training Client<br />\r\n<strong>Staff Member Name:</strong> Adam Daniels<br />\r\n<strong>Service Line:</strong> ABA<br />\r\n<strong>Service:</strong> BT 1:1<br />\r\n<strong>Activity:</strong> <br />\r\n<strong>Date:</strong> 4/16/2024<br />\r\n<strong>Time:</strong> 10:30 AM - 11:00 AM<br />\r\n<strong>Supervisor Name:</strong> <br />\r\n<strong>Appointment Status:</strong> Needs Verification<br />\r\n',
        statusId: 2,
        statusName: 'Needs Verification',
        evvStatusName: 'Pending',
        checkExceedAuthorizationHours: true,
        procedureCodeId: 1717819,
        minutes: 30,
        hours: 0,
        isExceedAuthorizationHours: null,
        isExceedSchedulingGoal: null,
        startDateTimeText: '4/16/2024 10:30 AM',
        endDateTimeText: '4/16/2024 11:00 AM',
        validationReasons: null,
        appointmentTypeId: 1,
        validation: null,
        isOvernight: false,
        sortStartDate: '2024-04-16T14:30:00.000Z',
        sortEndDate: '2024-04-16T15:00:00.000Z',
        eventDate: '2024-04-16T10:30:00',
        date: 'Apr 16 2024',
        eventDataMonth: '2024-04-16T14:30:00.000Z',
        eventDayName: 'Tue',
        eventIsToday: false,
        timeText: '10:30 AM - 11:00 AM',
      },
    ],
    sessionNoteResponseId: 0,
    seriesAppointmentId: null,
    occurrenceEndDate: null,
    providerBillingCodeCredentialId: 0,
    expirationDate: null,
    seriesAppointmentStartDate: null,
    initOccurrenceStartDate: null,
    isParentVerificationRequired: null,
    isSessionNoteEnteredRequired: true,
    sessionNoteReviewedBy: null,
    authorizationUsedHours: 0.75,
    activityTagName: '',
    cancellationTypeId: 0,
    cancellationTagId: null,
    exceedAuthorizedHours: false,
    checkExceedAuthorizationHours: true,
    procedureCodeIdPreviousReference: null,
    notes: 'TEST-bazo',
    clientContactName: 'Cathie Christmas',
    clientContactRelationship: 'Mother',
    paycodeId: 3406,
    paycode: null,
    paycodeName: 'Aministrative',
    signatureParentRelationship: null,
    locationId: 3,
    adminVerificationDate: null,
    adminVerifiedBy: null,
    parentLatitude: null,
    parentLongitude: null,
    staffMemberLatitude: null,
    staffMemberLongitude: null,
    parentVerifiedAddress: null,
    staffVerifiedAddress: null,
    activityTagId: null,
    address: null,
    dateBillingReported: null,
    datePayrollReported: null,
    modifiedBy: 729905,
    dateLastModified: '2024-04-24T13:32:49.000Z',
    location: null,
    status: null,
    dateDoeBilled: null,
    statusDoeBilled: null,
    sessionNoteDraftResponseId: null,
    noAuthRequired: false,
    authorizationEndDate: '0001-01-01T00:00:00',
    authorizationStartDate: '0001-01-01T00:00:00',
    authorizedWeeklyHours: 0,
    occurrenceLookup: false,
    isClientDemo: false,
    validation: null,
    authorizationNumber: '12344532',
    units: 0,
    renderingProvider: null,
    referringProviderName: null,
    includeReferringProviderRequiredOnClaim: false,
    evvReasons: [],
    acknowledgeableExceptions: null,
    evvActionTakenId: null,
    isEVV: true,
    clockInLatitude: null,
    clockInLongitude: null,
    clockOutLatitude: null,
    clockOutLongitude: null,
    toLocationLatitude: 40.1619302,
    toLocationLongitude: -105.1039067,
    clockInAddress: null,
    clockOutAddress: null,
    modifier1: null,
    modifier2: null,
    lastModified: '0001-01-01T00:00:00',
    isMissingBillingInfo: false,
    isPendingSubmission: false,
    clearingHouseId: null,
    postfix: null,
    staffRecordInd: null,
    parentRecordInd: null,
    isForAuthCalc: null,
    cancellationNote: null,
    unarchivedReasonId: null,
    uncancelReasonId: null,
    staffAddressId: 0,
    wasRescheduled: null,
    overnightId: null,
    overnightDate: null,
    overnightEndTime: null,
    isFullOvernightAppointment: false,
    originalStartTime: 750,
    originalEndTime: 780,
    existingStartTime: 630,
    existingEndTime: 660,
    formatedStartDate: '2024-04-16',
    formatedPrincipalVerificationDate: '2024-04-24',
    occurrenceText: 'None',
    savedAppointmentTypeId: 1,
    initOccurrenceEndDate: '2024-04-16T00:00:00',
    hasErrors: false,
    displayDate: '2024-04-16T14:30:00.000Z',
    displayStartTime: '10:30 AM',
    displayEndTime: '11:15 AM',
    repeat: false,
    service: {
      serviceLineId: 773,
      providerServiceId: 1979,
      funderId: 3761,
      procedureCodeId: 1717819,
      providerBillingCodeId: null,
    },
    isStaffVerified: false,
    isParentVerified: false,
    isStaffCancelled: false,
    isClientCancelled: false,
    isRescheduled: false,
    isCopaymentEntered: false,
    addTravelAppointment: false,
    toLocationName: 'Client Home',
    fromLocationName: '',
    occurrenceEndType: 0,
    isExceedSchedulingGoal: false,
    isExceedAuthorizationHours: false,
    existingStartDate: '2024-04-16T00:00:00',
  },
  checkExceedAuthorization: false,
  remindersData: {
    clientContacts: [],
    staffMember: null,
    appointmentId: 52614143,
    startDate: '2024-04-16T10:30:00',
    appointmentDateChanged: false,
  },
};

let cancel_payload = {
  appointmentInstances: [
    {
      appointmentId: 53059256,
      startDate: '2024-05-01T00:00:00',
    },
  ],
  cancellation: {
    cancellationNote: null,
    cancellationTagId: 4838,
    cancellationTypeId: 1,
    dueDate: '2024-05-01T18:04:47.228Z',
    isBulkCancellation: false,
    rescheduleAssignedToId: 0,
    statusId: 4,
  },
  eventDetailsAppointment: {
    acknowledgeableExceptions: null,
    activityTagId: null,
    activityTagName: '',
    actualEndTime: null,
    actualStartTime: null,
    address: null,
    addTravelAppointment: false,
    adminVerificationDate: null,
    adminVerifiedBy: null,
    appointmentTypeId: 1,
    appointmentTypeName: 'Billable',
    associatedAppointmentId: 0,
    authorizationEndDate: '0001-01-01T00:00:00',
    authorizationNumber: '12344532',
    authorizationStartDate: '0001-01-01T00:00:00',
    authorizationUsedHours: 36.5,
    authorizedWeeklyHours: 0,
    billingCode: null,
    cancellationNote: null,
    cancellationTagId: 4838,
    cancellationTagName: '',
    cancellationTypeId: 1,
    cancellationTypeName: 'All',
    checkAuthorizationExceed: false,
    checkExceedAuthorizationHours: true,
    clearingHouseId: null,
    clientContactId: 0,
    clientContactName: 'Cathie Christmas',
    clientContactRelationship: 'Mother',
    clientId: 131689,
    clientInitials: 'TC',
    clientLocation: '1234 Main Street, Denver, Colorado, 80502',
    clientName: 'Training Client',
    clientShortName: null,
    clientSignature: null,
    clientSignatureId: null,
    clientVerificationDate: '0001-01-01T00:00:00',
    clockInAddress: null,
    clockInLatitude: null,
    clockInLongitude: null,
    clockOutAddress: null,
    clockOutLatitude: null,
    clockOutLongitude: null,
    copaymentAmountCollected: null,
    copaymentMethodId: null,
    copaymentReferenceNumber: null,
    dateBillingReported: null,
    dateCreated: '2024-05-01T12:37:42.38',
    dateDoeBilled: null,
    dateLastModified: '2024-05-01T18:37:42.377Z',
    datePayrollReported: null,
    dayTypes: [],
    description: '',
    diagnosisId: 0,
    displayDate: '2024-05-01T12:00:00.000Z',
    displayEndTime: '09:15 AM',
    displayStartTime: '08:00 AM',
    dueDate: '2024-05-01T18:04:47.228Z',
    endDate: '2024-05-01T00:00:00',
    endingAddress: null,
    endTime: 675,
    events: [
      {
        appointmentTypeId: 1,
        bubbleHtml:
          '<strong>Client Name:</strong> Training Client<br />\\r\n<strong>Staff Member Name:</strong> Adam Daniels<br />\r\n<strong>Service Line:</strong> ABA<br />\r\n<strong>Service:</strong> BT 1:1<br />\r\n<strong>Activity:</strong> <br />\r\n<strong>Date:</strong> 5/1/2024<br />\r\n<strong>Time:</strong> 10:00 AM - 11:15 AM<br />\r\n<strong>Supervisor Name:</strong> <br />\r\n<strong>Appointment Status:</strong> Needs Verification<br />\r\n',
        checkExceedAuthorizationHours: true,
        date: 'Apr 30 2024',
        end: '2024-05-01T11:15:00',
        endDateTimeText: '4/30/2024 09:15 AM',
        eventDataMonth: '2024-04-30T12:00:00.000Z',
        eventDate: '2024-04-30T08:00:00',
        eventDayName: 'Tue',
        eventIsToday: false,
        evvStatusName: 'Pending',
        hours: 1,
        html: '10:00 AM - 11:15 AM',
        id: 53059256,
        isExceedAuthorizationHours: null,
        isExceedSchedulingGoal: null,
        isOvernight: false,
        minutes: 75,
        procedureCodeId: 1717819,
        resource: '131689',
        sortEndDate: '2024-04-30T13:15:00.000Z',
        sortStartDate: '2024-04-30T12:00:00.000Z',
        start: '2024-05-01T10:00:00',
        startDateTimeText: '4/30/2024 08:00 AM',
        statusId: 2,
        statusName: 'Needs Verification',
        text: '10:00 AM - 11:15 AM',
        timeText: '08:00 AM - 09:15 AM',
        validation: null,
        validationReasons: null,
      },
    ],
    evvActionTakenId: null,
    evvClearingHouseId: 4,
    evvProviderStatusUuid: null,
    evvReasons: [],
    evvRejectedReason: null,
    evvStatusId: 1,
    evvStatusName: 'Pending',
    exceedAuthorizedHours: false,
    existingEndTime: 555,
    existingStartDate: '2024-05-01T00:00:00',
    existingStartTime: 480,
    expirationDate: null,
    formatedPrincipalVerificationDate: '2024-05-01',
    formatedStartDate: '2024-05-01',
    frequencyInterval: 0,
    fromLocation: null,
    fromLocationId: null,
    funderId: 3761,
    funderName: 'Colorado Medicaid',
    hasBehaviorPlanData: null,
    hasDiscrepancy: false,
    hasErrors: false,
    hasTrialSetData: null,
    id: 53059256,
    includeReferringProviderRequiredOnClaim: false,
    initAppointmentEndTime: 675,
    initAppointmentStartDate: '2024-04-30T08:00:00',
    initAppointmentStartTime: 600,
    initOccurrenceEndDate: '2024-05-01T00:00:00',
    initOccurrenceStartDate: null,
    isAutoCancelled: false,
    isBulkCancellation: false,
    isClientCancelled: false,
    isClientDemo: false,
    isCopaymentEntered: false,
    isEVV: true,
    isExceedAuthorizationHours: false,
    isExceedSchedulingGoal: false,
    isForAuthCalc: null,
    isFullOvernightAppointment: false,
    isMissingBillingInfo: false,
    isParentVerificationRequired: null,
    isParentVerified: false,
    isPendingSubmission: false,
    isRescheduled: false,
    isSessionNoteEnteredRequired: true,
    isStaffCancelled: false,
    isStaffVerified: false,
    lastModified: '0001-01-01T00:00:00',
    linkedToApprovedEncounter: false,
    linkedToEncounter: false,
    location: null,
    locationId: 3,
    locationName: null,
    memberId: 0,
    mileage: null,
    missingSessionNotesFileCabinet: false,
    modifiedBy: 729905,
    modifier1: null,
    modifier2: null,
    monthDay: 0,
    monthOccurrenceDayId: null,
    monthOccurrenceTypeId: null,
    monthTypeId: null,
    noAuthRequired: false,
    notes: 'TEST-bazo',
    occurrenceEndDate: null,
    occurrenceEndType: 0,
    occurrenceFrequency: 0,
    occurrenceLookup: false,
    occurrenceText: 'None',
    occurrenceTypeId: 1,
    occurrenceTypeName: 'Single',
    originalEndTime: 675,
    originalStartTime: 600,
    overnightDate: null,
    overnightEndTime: null,
    overnightId: null,
    parentLatitude: null,
    parentLongitude: null,
    parentRecordInd: null,
    parentSignature: null,
    parentVerifiedAddress: null,
    paycode: null,
    paycodeId: 3406,
    paycodeName: null,
    postfix: null,
    principalSignature: null,
    principalSignatureId: null,
    principalVerificationDate: '0001-01-01T00:00:00',
    procedureCodeId: 1717819,
    procedureCodeIdPreviousReference: null,
    propagatingServiceEndDate: null,
    propagatingServiceName: 'BT 1:1',
    providerBillingCodeCredentialId: null,
    providerBillingCodeId: null,
    providerPrincipalSignature: false,
    providerServiceId: 1979,
    providerServiceName: 'BT 1:1',
    referringProviderName: null,
    renderingProvider: null,
    repeat: false,
    rescheduleAssignedToId: 0,
    rescheduleAssignedToName: '',
    rescheduleDueDate: '2024-05-01T18:04:47.228Z',
    rescheduleFromId: null,
    savedAppointmentTypeId: 1,
    scheduledById: 309886,
    seriesAppointmentId: null,
    seriesAppointmentStartDate: null,
    service: {
      funderId: 3761,
      procedureCodeId: 1717819,
      providerBillingCodeId: null,
      providerServiceId: 1979,
      serviceLineId: 773,
    },
    serviceId: 773,
    serviceName: 'ABA',
    sessionNoteComments: [],
    sessionNoteDraftAutoSaved: false,
    sessionNoteDraftFormId: null,
    sessionNoteDraftOn: null,
    sessionNoteDraftResponseId: null,
    sessionNoteDraftStaffMemberId: null,
    sessionNoteDraftStaffMemberName: null,
    sessionNoteFormId: 0,
    sessionNoteResponseId: 0,
    sessionNoteReviewedBy: null,
    sessionNoteReviewedByName: null,
    sessionNoteReviewedByTitle: null,
    sessionNoteReviewedOn: null,
    sessionNoteStatus: null,
    sessionNoteSubmitBy: null,
    sessionNoteSubmitOn: null,
    signatureParentName: null,
    signatureParentRelationship: null,
    staffAddressId: 0,
    staffId: 309886,
    staffInitials: 'AD',
    staffLocation: 'Broomfield',
    staffMemberLatitude: null,
    staffMemberLongitude: null,
    staffName: 'Adam Daniels',
    staffRecordInd: null,
    staffSignature: null,
    staffSignatureId: null,
    staffSupervisorName: '',
    staffTitle: 'System Admin',
    staffVerificationDate: '0001-01-01T00:00:00',
    staffVerifiedAddress: null,
    startDate: '2024-05-01T00:00:00',
    startingAddress: null,
    startTime: 600,
    stateId: 6,
    status: null,
    statusDoeBilled: null,
    statusId: 4,
    statusName: 'Needs Verification',
    toLocation: '1234 Main Street, Denver, Colorado, 80502',
    toLocationId: 2,
    toLocationLatitude: 40.1619302,
    toLocationLongitude: -105.1039067,
    unarchivedReasonDescription: null,
    unarchivedReasonId: null,
    uncancelReasonDescription: null,
    uncancelReasonId: null,
    units: 0,
    validation: null,
    verifiedById: null,
    verifiedByName: null,
    verifiedByTitle: null,
    verifiedFromSessionNote: null,
    wasRescheduled: null,
  },
  needToSaveAppointment: false,
};

// Constants

const authentication_url =
  'https://id.rethinkbehavioralhealth.com/connect/token';

const add_url =
  'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/AddAppointment';

const delete_url =
  'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/deleteAppointment';

const update_url =
  'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/UpdateAppointment';

const cancel_url =
  'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/CancelAppointments';

const get_appointment_url =
  'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/GetAppointmentsListNewAsync';

let get_appointments_payload = {
  startDate: '2024-04-22T00:00:00',
  endDate: '2024-04-29T00:00:00',
  memberIds: [729905],
  clientIds: null,
  checkExceedAuthorization: false,
};

let temp_cancel_payload = {
  appointmentInstances: [
    {
      appointmentId: 54687871,
      startDate: '2024-05-28T00:00:00',
    },
  ],
  cancellation: {
    cancellationTypeId: 1,
    dueDate: '2024-05-28T15:16:09.364Z',
    statusId: 5,
    isBulkCancellation: false,
    cancellationTagId: 4838,
    rescheduleAssignedToId: 0,
    cancellationNote: null,
  },
  needToSaveAppointment: false,
  eventDetailsAppointment: {
    description: '',
    signatureParentName: null,
    verifiedFromSessionNote: null,
    clientContactId: 117927,
    clientLocation: '1234 Main Street, Denver, Colorado 80502',
    cancellationTypeName: 'All',
    rescheduleDueDate: '2024-05-28T15:16:09.364Z',
    rescheduleAssignedToId: 0,
    sessionNoteFormId: 0,
    sessionNoteComments: [],
    staffSignature: null,
    clientSignature: null,
    principalSignature: null,
    associatedAppointmentId: 0,
    diagnosisId: 0,
    startingAddress: null,
    endingAddress: null,
    sessionNoteReviewedOn: null,
    sessionNoteReviewedByName: null,
    sessionNoteReviewedByTitle: null,
    copaymentMethodId: null,
    copaymentReferenceNumber: null,
    copaymentAmountCollected: null,
    cancellationTagName: '',
    checkAuthorizationExceed: false,
    verifiedById: null,
    verifiedByName: null,
    verifiedByTitle: null,
    rescheduleFromId: null,
    initAppointmentStartDate: '2024-05-28T08:00:00',
    initAppointmentStartTime: 600,
    initAppointmentEndTime: 660,
    missingSessionNotesFileCabinet: false,
    sessionNoteDraftFormId: null,
    sessionNoteDraftOn: null,
    sessionNoteDraftStaffMemberId: null,
    sessionNoteDraftStaffMemberName: null,
    linkedToEncounter: false,
    linkedToApprovedEncounter: false,
    hasTrialSetData: null,
    hasBehaviorPlanData: null,
    providerPrincipalSignature: false,
    sessionNoteSubmitOn: null,
    sessionNoteSubmitBy: null,
    sessionNoteStatus: null,
    hasDiscrepancy: false,
    sessionNoteDraftAutoSaved: false,
    unarchivedReasonDescription: null,
    uncancelReasonDescription: null,
    id: 54687871,
    staffId: 309886,
    memberId: 0,
    staffName: 'Adam Daniels',
    staffInitials: 'AD',
    staffTitle: 'System Admin',
    staffLocation: 'Broomfield',
    staffSupervisorName: '',
    clientId: 131689,
    clientName: 'Training Client',
    clientInitials: 'TC',
    clientShortName: null,
    occurrenceTypeId: 1,
    occurrenceFrequency: 0,
    frequencyInterval: 0,
    occurrenceTypeName: 'Single',
    statusId: 5,
    statusName: 'Needs Verification',
    evvStatusId: 1,
    evvStatusName: 'Pending',
    evvProviderStatusUuid: null,
    evvRejectedReason: null,
    startDate: '2024-05-28T00:00:00',
    endDate: '2024-05-28T00:00:00',
    startTime: 600,
    endTime: 660,
    actualStartTime: null,
    actualEndTime: null,
    scheduledById: 309886,
    dateCreated: '2024-05-28T11:15:38.63',
    appointmentTypeId: 1,
    dayTypes: [],
    monthDay: 0,
    monthTypeId: null,
    monthOccurrenceTypeId: null,
    monthOccurrenceDayId: null,
    appointmentTypeName: 'Billable',
    staffVerificationDate: '0001-01-01T00:00:00',
    clientVerificationDate: '0001-01-01T00:00:00',
    principalVerificationDate: '0001-01-01T00:00:00',
    funderId: 3761,
    evvClearingHouseId: 4,
    stateId: 6,
    funderName: 'Colorado Medicaid',
    billingCode: null,
    serviceId: 773,
    providerServiceId: 1979,
    serviceName: 'ABA',
    providerServiceName: 'BT 1:1',
    propagatingServiceName: 'BT 1:1',
    propagatingServiceEndDate: null,
    fromLocationId: null,
    fromLocation: null,
    toLocationId: 2,
    toLocation: '1234 Main Street, Denver, Colorado, 80502',
    locationName: null,
    mileage: null,
    procedureCodeId: 1717819,
    staffSignatureId: null,
    clientSignatureId: null,
    principalSignatureId: null,
    parentSignature: null,
    events: [
      {
        id: 54687871,
        text: '08:00 AM - 09:00 AM',
        html: '10:00 AM - 11:00 AM',
        start: '2024-05-28 08:00:00',
        end: '2024-05-28 09:00:00',
        resource: '131689',
        bubbleHtml:
          '<strong>Client Name:</strong> Training Client<br />\r\n<strong>Staff Member Name:</strong> Adam Daniels<br />\r\n<strong>Service Line:</strong> ABA<br />\r\n<strong>Service:</strong> BT 1:1<br />\r\n<strong>Activity:</strong> <br />\r\n<strong>Date:</strong> 5/28/2024<br />\r\n<strong>Time:</strong> 08:00 AM - 09:00 AM<br />\r\n<strong>Supervisor Name:</strong> <br />\r\n<strong>Appointment Status:</strong> Needs Verification<br />\r\n',
        statusId: 2,
        statusName: 'Needs Verification',
        evvStatusName: 'Pending',
        checkExceedAuthorizationHours: true,
        procedureCodeId: 1717819,
        minutes: 60,
        hours: 1,
        isExceedAuthorizationHours: null,
        isExceedSchedulingGoal: null,
        startDateTimeText: '5/28/2024 08:00 AM',
        endDateTimeText: '5/28/2024 09:00 AM',
        validationReasons: null,
        appointmentTypeId: 1,
        validation: null,
        isOvernight: false,
        sortStartDate: '2024-05-28T12:00:00.000Z',
        sortEndDate: '2024-05-28T13:00:00.000Z',
        eventDate: '2024-05-28T08:00:00',
        date: 'May 28 2024',
        eventDataMonth: '2024-05-28T12:00:00.000Z',
        eventDayName: 'Tue',
        eventIsToday: true,
        timeText: '08:00 AM - 09:00 AM',
      },
    ],
    sessionNoteResponseId: 0,
    seriesAppointmentId: null,
    occurrenceEndDate: null,
    providerBillingCodeId: null,
    providerBillingCodeCredentialId: null,
    expirationDate: null,
    seriesAppointmentStartDate: null,
    initOccurrenceStartDate: null,
    isParentVerificationRequired: null,
    isSessionNoteEnteredRequired: true,
    sessionNoteReviewedBy: null,
    authorizationUsedHours: 37,
    activityTagName: '',
    cancellationTypeId: 1,
    cancellationTagId: 4838,
    exceedAuthorizedHours: false,
    checkExceedAuthorizationHours: true,
    procedureCodeIdPreviousReference: null,
    notes: 'TEST-bazo',
    clientContactName: 'Cathie Christmas',
    clientContactRelationship: 'Mother',
    paycodeId: 3406,
    paycode: null,
    paycodeName: null,
    signatureParentRelationship: null,
    locationId: 3,
    adminVerificationDate: null,
    adminVerifiedBy: null,
    parentLatitude: null,
    parentLongitude: null,
    staffMemberLatitude: null,
    staffMemberLongitude: null,
    parentVerifiedAddress: null,
    staffVerifiedAddress: null,
    activityTagId: null,
    address: null,
    dateBillingReported: null,
    datePayrollReported: null,
    modifiedBy: 729905,
    dateLastModified: '2024-05-28T13:15:38.000Z',
    location: null,
    status: null,
    dateDoeBilled: null,
    statusDoeBilled: null,
    sessionNoteDraftResponseId: null,
    noAuthRequired: false,
    authorizationEndDate: '0001-01-01T00:00:00',
    authorizationStartDate: '0001-01-01T00:00:00',
    authorizedWeeklyHours: 0,
    occurrenceLookup: false,
    isClientDemo: false,
    validation: null,
    authorizationNumber: '12344532',
    units: 0,
    renderingProvider: null,
    referringProviderName: null,
    includeReferringProviderRequiredOnClaim: false,
    evvReasons: [],
    acknowledgeableExceptions: null,
    evvActionTakenId: null,
    isEVV: true,
    clockInLatitude: null,
    clockInLongitude: null,
    clockOutLatitude: null,
    clockOutLongitude: null,
    toLocationLatitude: 40.1619302,
    toLocationLongitude: -105.1039067,
    clockInAddress: null,
    clockOutAddress: null,
    modifier1: null,
    modifier2: null,
    lastModified: '0001-01-01T00:00:00',
    isMissingBillingInfo: false,
    isPendingSubmission: false,
    clearingHouseId: null,
    postfix: null,
    staffRecordInd: null,
    parentRecordInd: null,
    isForAuthCalc: null,
    cancellationNote: null,
    unarchivedReasonId: null,
    uncancelReasonId: null,
    staffAddressId: 0,
    wasRescheduled: null,
    overnightId: null,
    overnightDate: null,
    overnightEndTime: null,
    isFullOvernightAppointment: false,
    originalStartTime: 600,
    originalEndTime: 660,
    existingStartTime: 480,
    existingEndTime: 540,
    formatedStartDate: '2024-05-28',
    formatedPrincipalVerificationDate: '2024-05-28',
    occurrenceText: 'None',
    savedAppointmentTypeId: 1,
    initOccurrenceEndDate: '2024-05-28T00:00:00',
    hasErrors: false,
    displayDate: '2024-05-28T12:00:00.000Z',
    displayStartTime: '08:00 AM',
    displayEndTime: '09:00 AM',
    repeat: false,
    service: {
      serviceLineId: 773,
      providerServiceId: 1979,
      funderId: 3761,
      procedureCodeId: 1717819,
      providerBillingCodeId: null,
    },
    isStaffVerified: false,
    isParentVerified: false,
    isStaffCancelled: false,
    isClientCancelled: false,
    isRescheduled: false,
    isCopaymentEntered: false,
    addTravelAppointment: false,
    dueDate: '2024-05-28T15:16:09.364Z',
    isBulkCancellation: false,
    rescheduleAssignedToName: '',
    occurrenceEndType: 0,
    isExceedSchedulingGoal: false,
    isExceedAuthorizationHours: false,
    existingStartDate: '2024-05-28T00:00:00',
  },
};

const recurringpayload = {
  appointment: {
    formatedStartDate: '2024-06-04',
    formatedEndDate: '2024-06-04',
    formatedStartTime: '08:30:00',
    formatedEndTime: '08:45:00',
    startDate: '2024-06-04T00:00:00',
    startTime: 600,
    endTime: 660,
    statusId: 1,
    exceedAuthorizedHours: false,
    isExceedAuthorizationHours: false,
    isExceedSchedulingGoal: false,
    occurrenceTypeId: 2,
    clientContactRelationship: '',
    clientContactName: '',
    staffId: 309886,
    staffName: '',
    occurrenceText: ' on every Tuesday, Monday and Friday effective 6/4/2024',
    initAppointmentStartDate: '2024-06-04T08:30:00',
    hasErrors: false,
    appointmentTypeId: 1,
    displayDate: '2024-06-04T12:00:00.000Z',
    displayStartTime: '08:00 AM',
    displayEndTime: '09:00 AM',
    repeat: true,
    paycodeId: 3406,
    activityTagId: null,
    clientId: 131689,
    service: {
      funderId: 3761,
      serviceLineId: 773,
      providerServiceId: 1979,
      procedureCodeId: 1717819,
      providerBillingCodeId: null,
      providerBillingCodeCredentialId: null,
      groupName: 'Colorado Medicaid > ABA',
      description: 'BT 1:1, 97153, 12344532, 2/1/2024 - 11/22/2024',
      funderCopay: null,
      funderName: 'Colorado Medicaid',
      serviceLineName: 'ABA',
      serviceName: 'BT 1:1',
      schedulingRules: {
        appointmentDuplicateClientTimeAlertId: 3,
        appointmentDuplicateClientTimeServiceAlertId: 3,
        appointmentMissingBillingDataAlertId: 3,
        appointmentExceedingAuthorizationAlertId: 1,
        appointmentExpiredCertificationAlertId: 1,
      },
      preventBillableAppointmentDates: [],
      restrictToStaffCredential: false,
      credentialId: null,
      totalAuthHours: 650,
      authorizationNumber: '12344532',
      checkExceedAuthorizationWarning: true,
      authorizationStartDate: '2024-02-01T00:00:00',
      authorizationEndDate: '2024-11-22T00:00:00',
      billingCodeDescription:
        'Adaptive behavior treatment by protocol (Replacing 0364T/0365T)',
      noOfUnits: 2600,
      unit: 15,
      billingCode: '97153',
      billingCode2: null,
      schedulingGoalNoOfUnits: 2600,
      isMissingBillingInfo: false,
      isUntimed: false,
      isPendingSubmission: false,
      hcFrequencyTypeId: 4,
      totalFrequencyUnit: 650,
      schedulingGoalFrequencyTypeId: 4,
      totalSchedulingFrequencyUnit: 650,
      authorizedWeeklyHours: 15.423728813559322,
      noAuthRequired: false,
      isDPH: false,
      diagnosisEndDate: '0001-01-01T00:00:00',
      rate: 0,
      payerSequenceId: 1,
      payerSequenceName: 'Primary',
      funderTypeId: 1,
      isAppointmentCurrentService: false,
      id: '3761_773_1979_1717819_null',
    },
    locationId: 2,
    toLocationId: 2,
    toLocation: '1234 Main Street, Denver, Colorado, 80502',
    toLocationLatitude: null,
    toLocationLongitude: null,
    fromLocation: null,
    isStaffCancelled: false,
    isClientCancelled: false,
    notes: null,
    isRescheduled: false,
    isCopaymentEntered: false,
    addTravelAppointment: false,
    mileage: null,
    overnightDate: null,
    actualStartTime: null,
    actualEndTime: null,
    serviceId: 773,
    providerServiceId: 1979,
    funderId: 3761,
    procedureCodeId: 1717819,
    appointmentTypeName: 'Billable',
    providerBillingCodeCredentialId: 0,
    frequencyInterval: 1,
    occurrenceEndType: 2,
    monthDay: 4,
    dayTypes: [2, 1, 16],
    occurrenceEndDate: '2024-06-20T00:00:00',
    occurrenceFrequency: '0',
    scheduledById: 309886,
    endDate: '0001-01-01T00:00:00',
    locationName: '11 - Office',
    toLocationName: 'Client Home',
    fromLocationName: '',
    serviceName: 'BT 1:1',
    clientName: 'Training Client',
    paycodeName: 'Aministrative',
    activityTagName: '',
    cancellationTypeName: '',
    existingStartDate: '2024-06-04T00:00:00',
    clientContactId: 0,
    rescheduleAssignedToId: 0,
    sessionNoteFormId: 0,
    associatedAppointmentId: 0,
    diagnosisId: 0,
    id: 0,
    sessionNoteResponseId: 0,
    cancellationTypeId: 0,
    units: 0,
    modifiedBy: 0,
    authorizedWeeklyHours: 0,
    checkAuthorizationExceed: false,
    linkedToEncounter: false,
    linkedToApprovedEncounter: false,
    isEVV: false,
    isClientDemo: false,
    occurrenceLookup: false,
    isMissingBillingInfo: false,
    isPendingSubmission: false,
    noAuthRequired: false,
    rescheduleDueDate: '0001-01-01T00:00:00',
    dateCreated: '0001-01-01T00:00:00',
    dateLastModified: '0001-01-01T00:00:00',
    authorizationStartDate: '0001-01-01T00:00:00',
    authorizationEndDate: '0001-01-01T00:00:00',
    lastModified: '0001-01-01T00:00:00',
  },
  checkExceedAuthorization: false,
  remindersData: {
    clientContacts: [],
    staffMember: null,
    startDate: '2024-06-04T08:00:00',
    appointmentDateChanged: true,
  },
};
// Define functions for flow

const runActions = async (filteredEvents, userCreds) => {
  await getAuth(userCreds)
    .then(async (data) => {
      const rethinkHeaders = data.headers;
      const rethinkCookies = data.cookies;

      console.log('Headers and cookies : ', rethinkHeaders, rethinkCookies);

      const created_events_successful = [];
      const updated_events_successful = [];
      const canceled_events_successful = [];
      const deleted_events_successful = [];

      const created_events_failed = [];
      const updated_events_failed = [];
      const canceled_events_failed = [];
      const deleted_events_failed = [];

      const create_events_data = filteredEvents.create_events;
      const cancel_events_data = filteredEvents.cancel_events;
      const delete_events_data = filteredEvents.delete_events;

      if (create_events_data.length > 0) {
        for (let index = 0; index < create_events_data.length; index++) {
          let req_payload = objectConverter(
            event_payload,
            create_events_data[index],
          );
          try {
            let addApp = await addAppointment(
              req_payload,
              add_url,
              rethinkHeaders,
              rethinkCookies,
            );
            const success_obj = {
              cr_eventId: addApp.appointment.id,
              cacheDate: null,
              eventId: create_events_data[index].eventId,
            };
            created_events_successful.push(success_obj);
          } catch {
            console.log('Adding Error');
          }
        }
      }

      if (cancel_events_data.length > 0) {
        for (let index = 0; index < cancel_events_data.length; index++) {
          console.log('Cancelling Starts');
          let customId = cancel_events_data[index].eventIdCustom;
          let startDate = cancel_events_data[index].startRecur;
          let ev_cancel = await getAppointmentWithId(
            customId,
            startDate,
            rethinkHeaders,
            rethinkCookies,
          );
          // console.log('ev cancel : ', ev_cancel);

          // let updateEventPayload = {
          //   appointment: ev_cancel.appointment,
          //   appointmentChanges: null,
          //   reminderChanges: {
          //     clientChanged: false,
          //     clientNew: 131689,
          //     clientOld: 131689,
          //     dateIsUpdated: false,
          //     staffChanged: false,
          //     staffNew: 309886,
          //     staffOld: 309886,
          //     typeIsUpdated: false,
          //   },
          //   success: true,
          // };

          // updateEventPayload.appointment.cancellationTagId = 4838;

          // console.log('update pay : ', updateEventPayload);
          // let updating = await updateAppointment(
          //   updateEventPayload,
          //   update_url,
          //   rethinkHeaders,
          //   rethinkCookies,
          // );

          ev_cancel['checkExceedAuthorization'] = false;
          ev_cancel['reschedulling'] = false;
          let dueDateAssigned = getFormattedDate(new Date());
          let cancelPayloadNew = {
            appointmentInstances: [
              { appointmentId: customId, startDate: startDate + 'T00:00:00' },
            ],
            cancellation: {
              cancellationNote: null,
              cancellationTagId: 4838,
              cancellationTypeId: 1,
              dueDate: dueDateAssigned,
              isBulkCancellation: false,
              rescheduleAssignedToId: 0,
              statusId: 5,
            },
            eventDetailsAppointment: {
              ...ev_cancel.appointment,
              cancellationTagId: 4838,
              cancellationTypeId: 1,
              authorizationEndDate: '0001-01-01T00:00:00',
              authorizationStartDate: '0001-01-01T00:00:00',
              addTravelAppointment: false,
              displayDate: '', // Hard coded
              displayEndTime: '', // Hard coded
              displayStartTime: '', // Hard coded
              dueDate: dueDateAssigned,
              service: {
                funderId: 3761,
                procedureCodeId: 1717819,
                providerBillingCodeId: null,
                providerServiceId: 1979,
                serviceLineId: 773,
              },
              existingEndTime: null, // Hard coded 540,
              existingStartDate: '', // Hard coded '2024-06-10T00:00:00',
              existingStartTime: null, // Hard coded 480,
              formatedPrincipalVerificationDate: '', // Hard coded '2024-06-11',
              formatedStartDate: '', // hard coded '2024-06-10',
              hasErrors: false,
              initOccurrenceEndDate: '', // Hard coded "2024-06-10T00:00:00",
              // isAutoCancelled: false,
              statusId: 5,
              isBulkCancellation: false,
              isClientCancelled: false,
              isCopaymentEntered: false,
              isExceedAuthorizationHours: false,
              isExceedSchedulingGoal: false,
              isParentVerified: false,
              isRescheduled: false,
              isStaffCancelled: false,
              isStaffVerified: false,
              noAuthRequired: false,
              occurrenceEndType: 0,
              occurrenceText: null,
              originalEndTime: null, // Hard coded 660,
              originalStartTime: null, // Hard coded 660,
              providerBillingCodeCredentialId: null,
              repeat: false,
              rescheduleAssignedToName: '',
              savedAppointmentTypeId: 1,
              statusName: 'Needs Verification',
            },
            needToSaveAppointment: false,
          };
          cancelPayloadNew.eventDetailsAppointment.events = [
            {
              ...cancelPayloadNew.eventDetailsAppointment.events[0],
              eventDataMonth: '', // Hard coded
              eventDate: '', // Hard coded
              eventDayName: '', // Hard coded
              eventIsToday: false,
              date: '',
              sortEndDate: '', // Hard coded
              sortStartDate: '', // Hard coded
              timeText: '', // Hard coded "08:00 AM - 09:00 AM",
            },
          ];
          console.log('Retrieving Event : ', cancelPayloadNew);
          // temp_cancel_payload.eventDetailsAppointment = {
          //   ...temp_cancel_payload.eventDetailsAppointment,
          //   ...ev_cancel.appointment,
          // };
          // temp_cancel_payload.appointmentInstances[0].appointmentId = customId;
          console.log(
            'Cancel Event Payload : ',
            JSON.stringify(cancelPayloadNew),
          );
          try {
            await cancelAppointment(
              cancelPayloadNew,
              cancel_url,
              rethinkHeaders,
              rethinkCookies,
            );
          } catch (error) {
            console.error(
              'An error occurred while processing cancellation:',
              error,
            );
          }
        }
      }
      if (delete_events_data.length > 0) {
        for (let index = 0; index < cancel_events_data.length; index++) {
          console.log('Deleting Starts...');
          let customId = cancel_events_data[index].eventIdCustom;
          let startDate = cancel_events_data[index].startRecur;
          let delete_cancel = await getAppointmentWithId(
            customId,
            startDate,
            rethinkHeaders,
            rethinkCookies,
          );
          delete_cancel['checkExceedAuthorization'] = false;
          delete_cancel['reschedulling'] = false;
          console.log('Retrieving Event : ', delete_cancel);
          try {
            await deleteAppointment(
              delete_cancel,
              delete_url,
              rethinkHeaders,
              rethinkCookies,
            );
          } catch (error) {
            console.error('An error occurred while processing delete:', error);
          }
        }
      }
      return {
        created_events_successful,
        updated_events_successful,
        canceled_events_successful,
        deleted_events_successful,
        created_events_failed,
        updated_events_failed,
        canceled_events_failed,
        deleted_events_failed,
      };
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

module.exports = runActions;
// We need to test

let testData = {
  create_events: [
    {
      eventId: 'fc54bec6-8ea9-47ed-bd3b-0ee12e033ac1',
      deletedAt: null,
      eventIdCustom: 54469564,
      course: null,
      activityId: '16521285',
      isCancelled: false,
      employeeId: '309886',
      clientId: '131689',
      start: '13:00:00',
      end: '14:00:00',
      duration: 7200,
      startRecur: '2024-06-25',
      endRecur: '2024-06-26',
      recurring: false,
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: false,
      saturday: false,
      timezone: 'America/New_York',
      interval: 1,
      rules: '3',
      startRecur_format: '06/25/2024',
    },
  ],
  delete_events: [
    // {
    //   eventId: 'fc54bec6-8ea9-47ed-bd3b-0ee12e033ac1',
    //   deletedAt: '2024-04-25T17:07:44.000Z',
    //   eventIdCustom: null,
    //   course: null,
    //   activityId: '16521285',
    //   isCancelled: false,
    //   employeeId: '309886',
    //   clientId: '131689',
    //   start: '17:00:00',
    //   end: '19:00:00',
    //   duration: 7200,
    //   startRecur: '2024-04-24',
    //   endRecur: '2024-04-25',
    //   recurring: false,
    //   sunday: false,
    //   monday: false,
    //   tuesday: false,
    //   wednesday: true,
    //   thursday: false,
    //   friday: false,
    //   saturday: false,
    //   interval: 1,
    //   rules: '3',
    //   startRecur_format: '04/24/2024',
    // },
  ],
  update_events: [],
  cancel_events: [
    // {
    //   eventId: 'fc54bec6-8ea9-47ed-bd3b-0ee12e033ac1',
    //   deletedAt: '2024-04-28T17:07:44.000Z',
    //   eventIdCustom: 56636159,
    //   course: null,
    //   activityId: '16521285',
    //   isCancelled: false,
    //   employeeId: '309886',
    //   clientId: '131689',
    //   start: '08:00:00',
    //   end: '09:00:00',
    //   duration: 7200,
    //   startRecur: '2024-06-25',
    //   endRecur: '2024-06-26',
    //   recurring: false,
    //   sunday: false,
    //   monday: false,
    //   tuesday: false,
    //   wednesday: true,
    //   thursday: false,
    //   friday: false,
    //   saturday: false,
    //   interval: 1,
    //   rules: '3',
    //   startRecur_format: '06/25/2024',
    // },
  ],
};

// runActions(testData, { email: 'adamdaniels', password: 'Password123!' });

// async function loginToRethink() {
//   const url =
//     'https://webapp.rethinkbehavioralhealth.com/HealthCare/User/Login';
//   const payload = {
//     User: 'adamdaniels',
//     Password: 'Password123!',
//     setPermissions: true,
//   };

//   try {
//     const response = await axios.post(url, payload, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     // Extract cookies from response
//     const setCookieHeader = response.headers['set-cookie'];
//     console.log(setCookieHeader, response.headers);
//     let cookies = '';
//     if (setCookieHeader) {
//       cookies = setCookieHeader
//         .map((cookie) => Cookie.parse(cookie))
//         .map((parsedCookie) => `${parsedCookie.name}=${parsedCookie.value}`)
//         .join('; ');
//     }
//     if (response.status === 200) {
//       console.log('Login successful');
//       return response.data;
//     } else {
//       console.log(`Login failed with status code ${response.status}`);
//       return null;
//     }
//   } catch (error) {
//     console.error(`Error during login: ${error.message}`);
//     return null;
//   }
// }

// // Example usage
// loginToRethink().then((response) => {
//   if (response) {
//     console.log(response);
//   }
// });

// Create a new function for adjusting the cancel payload

const adjustCancelPayload = (templatePayload, actualEvent) => {
  let cancelDueDate = getFormattedDate(new Date());
  let cancelPayload = {
    appointmentInstances: [
      {
        appointmentId: actualEvent.appointment.id,
        startDate: actualEvent.appointment.startDate,
      },
    ],
    cancellation: {
      cancellationNote: null,
      cancellationTagId: 4838,
      cancellationTypeId: 1,
      dueDate: cancelDueDate,
      isBulkCancellation: false,
      rescheduleAssignedToId: 0,
      statusId: 5,
    },
    eventDetailsAppointment: {
      ...templatePayload.eventDetailsAppointment,
      addTravelAppointment: false,
      authorizationEndDate: '0001-01-01T00:00:00',
      authorizationStartDate: '0001-01-01T00:00:00',
      appointmentTypeId: actualEvent.appointment.appointmentTypeId,
      appointmentTypeName: actualEvent.appointment.appointmentTypeName,
      authorizationUsedHours: actualEvent.appointment.authorizationUsedHours,
      cancellationNote: null,
      cancellationTagId: 4838,
      cancellationTagName: '',
      cancellationTypeId: 1,
      cancellationTypeName: 'All',
      checkAuthorizationExceed: false,
      checkExceedAuthorizationHours: true,
      clientContactId: actualEvent.appointment.clientContactId,
      clientContactName: actualEvent.appointment.clientContactName,
      clientContactRelationship:
        actualEvent.appointment.clientContactRelationship,
      clientId: actualEvent.appointment.clientId,
      clientInitials: actualEvent.appointment.clientInitials,
      clientLocation: actualEvent.appointment.clientLocation,
      clientName: actualEvent.appointment.clientName,
      clientVerificationDate: '0001-01-01T00:00:00',
      dateCreated: actualEvent.appointment.dateCreated,
      dateLastModified: actualEvent.appointment.dateLastModified,
      // hard coded
      displayDate: '2024-05-28T12:00:00.000Z',
      displayEndTime: '09:00 AM',
      displayStartTime: '08:00 AM',
      // hard coded
      dueDate: cancelDueDate,
      endDate: actualEvent.appointment.endDate,
      endTime: actualEvent.appointment.endTime,
    },
  };
};

const convertRecurringPayload = (temp, data) => {};
