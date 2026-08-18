require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const moment = require('moment');
const moment2 = require('moment-timezone');
const config = require('../config');

const getHeadersAndCookies = async (userCreds) => {
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
    await page.setViewport({ width: 1080, height: 720 });

    const loginPromise = new Promise((resolve, reject) => {
      page.on('request', async (interceptedRequest) => {
        if (
          interceptedRequest
            .url()
            .includes('https://login.measurepm.com/Appointment/ReadCalendar')
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

    await page.goto('https://login.measurepm.com/');
    console.log('Starting login process...');
    await page.waitForSelector('input[name="user_name"]', { timeout: 10000 });
    await page.waitForSelector('input[name="Password"]', { timeout: 10000 });
    await page.type('input[name="user_name"]', userCreds?.email); // TODO should be input by user on the FE
    await page.type('input[name="Password"]', userCreds?.password); // TODO should be input by user on the FE
    await page.waitForSelector('#loginButton');
    // Click the button
    await page.click('#loginButton');
    // await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Successfully logged in');

    // await page.goto(
    //   'https://webapp.rethinkbehavioralhealth.com/core/scheduler',
    //   { waitUntil: 'networkidle2' },
    // );

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

// Payload templates ---start

let hardCodedPayload =
  'sort=&group=&filter=&TaskID=0&AppointmentDriveTimeLogId=&DisplacementId=&IsFillIn=false&LinkedAppointment=false&AppointmentId=0&PatientId=5128&Message=&HoursString=&Gender=0&EmployeeName=&PatientName=&ActingSupervisor=&Auth_desc=&AuthDetailNotes=&Address=&AuthId=95192&AuthDetailId=523773&ServiceTypeId=0&ServiceSubTypeId=&EmployeeId=4528&Color=&ScheduledMinutes=&ScheduledHours=&AppointmentStatusId=319&AppointmentStatusName=&Treatmenttypename=&ServiceDetails=&AuthDetaiDate=&Servicetype=&ScheduledDate=&ScheduleEnd=2024-08-08T15%3A10%3A41.363Z&LocationId=13565&Miles=0&HasPayroll=false&HasBilling=false&Notes=&IsBillable=false&IsBillableString=1&RecurrenceRuleString=&IsInternalAppointment=false&IsNonPayable=false&GroupMasterId=&GroupAppointment=&RecurrenceID=&Start1=2024-08-08T15%3A10%3A41.363Z&End1=2024-08-08T15%3A10%3A41.363Z&StartLocal=2024-08-08T15%3A10%3A41.363Z&EndLocal=2024-08-08T15%3A10%3A41.363Z&IsDealyTime=false&FilterTypeId=0&color=&BorderColor=&CreateDate=&CreatedBy=&UpdateDate=&UpdatedBy=&Name=&Address1=&Address2=&Address3=&City=&StateId=0&ZipCode=&CountryCodeId=&Phone=&AltPhone=&PlaceOfServiceId=0&SiteId=0&SelectedEmployee%5B0%5D=4528&IgnoreRules=false&IsInternalAppointmentTemp=true&Isdeleted=false&IsClientAppointment=false&TestId=&TestName=&sProviderId=&sClientId=&AuthDescriptionForAppointment=&AuthDetailDescriptionForAppointment=&Appointmentstatus=&AppointmentLocation=&RenderDateTime=&ASiteId=0&CreatedDeviceBy=&UpdatedDeviceBy=&AppointmentStatusCategoryId=0&RenderedMinutes=&Sunday=&Monday=&Tuesday=&Wednesday=&Thrusday=&Friday=&Saturday=&LastAppointmentDate=&SingleUse=&IsAltered=false&POS=&ENAppointmentId=&ENClientId=&ENEmployeeId=&IsMakeUp=false&All=&OnlyProvider=&OnlyTime=&LocationName=&Abbreviation=&IsNewData=false&SmallNotes=&MakeupDate=&CoPay=&IsClientDetailAccess=false&IsSmsButtonAccess=false&DriveTime=&Mileage=&LunchTimeMinutes=&IsDriveTime=false&IsRecurrrenceAppointment=false&HideProviderName=false&RecurrenceRule=&RecurrenceException=&Title=&Start=2024-08-08T10%3A00%3A00.000Z&End=2024-08-08T12%3A00%3A00.000Z&Description=&IsAllDay=false&StartTimezone=&EndTimezone=';

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
  AuthDetailId: '523773',
  ServiceTypeId: '0',
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

let deletePayload = {
  sort: '',
  group: '',
  filter: '',
  AppointmentDriveTimeLogId: '',
  DisplacementId: '',
  IsFillIn: false,
  LinkedAppointment: false,
  AppointmentId: 0,
  PatientId: '10995',
  Message: '',
  HoursString: '',
  Gender: '2',
  EmployeeName: 'Schneider, Brooke',
  PatientName: 'Dallas, Konstantina',
  ActingSupervisor: 'Latuszek, Juliann',
  Patient: '',
  Auth_desc: 'F84.0',
  AuthDetailNotes: '',
  Address: ' 5225 Old Orchard Rd.  Suite 15,Skokie,IL 60076',
  AuthId: '109747',
  AuthDetailId: '606688',
  ServiceTypeId: '9037',
  ServiceSubTypeId: '0',
  EmployeeId: '4528',
  Color: '#3E5B7F',
  ScheduledMinutes: '60',
  ScheduledHours: '1',
  AppointmentStatusId: '319',
  AppointmentStatusName: 'Confirmed',
  Treatmenttypename: 'ABA(BT)',
  ServiceDetails: 'Direct Behavior Therapy by BCBA',
  AuthDetaiDate: '2024-12-31T08:00:00.000Z',
  Servicetype: 'Direct Behavior Therapy by BCBA',
  ScheduledDate: 'Fri,Jul 05,2024 09:00AM',
  ScheduleEnd: '2024-07-05T17:00:00.000Z',
  LocationId: '13565',
  Miles: 0,
  HasPayroll: false,
  HasBilling: false,
  Notes: '',
  IsBillable: false,
  IsBillableString: 1,
  RecurrenceRuleString: '',
  IsInternalAppointment: false,
  IsNonPayable: false,
  GroupMasterId: '0',
  GroupAppointment: 'I',
  RecurrenceID: '',
  Start1: '2024-07-05T02:00:00.000Z',
  End1: '2024-07-05T03:00:00.000Z',
  StartLocal: '2024-07-05T02:00:00.000Z',
  EndLocal: '0001-01-01T07:52:58.000Z',
  IsDealyTime: false,
  DateTimeDifference: '0001-01-01T00:00:00+00:00',
  FilterTypeId: '1',
  color: '',
  BorderColor: 'green',
  TaskID: '16308692',
  CreateDate: '2024-07-03T21:52:23.727Z',
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
  PlaceOfServiceId: 0,
  SiteId: 0,
  'SelectedEmployee[0]': '4528',
  IgnoreRules: false,
  IsInternalAppointmentTemp: true,
  Isdeleted: false,
  IsClientAppointment: true,
  TestId: '',
  TestName: '',
  sProviderId: '',
  sClientId: '',
  AuthDescriptionForAppointment: '',
  AuthDetailDescriptionForAppointment: '',
  Appointmentstatus: '',
  AppointmentLocation: '',
  RenderDateTime: '',
  ASiteId: 45,
  CreatedDeviceBy: 'W',
  UpdatedDeviceBy: '',
  AppointmentStatusCategoryId: 2,
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
  IsAltered: false,
  POS: '(O)',
  ENAppointmentId: 'MTYzMDg2OTI=',
  ENClientId: 'MTA5OTU=',
  ENEmployeeId: 'NDUyOA==',
  IsMakeUp: false,
  All: true,
  OnlyProvider: '',
  OnlyTime: '',
  LocationName: '',
  Abbreviation: '',
  IsNewData: false,
  SmallNotes: '',
  MakeupDate: '',
  CoPay: '',
  IsClientDetailAccess: true,
  IsSmsButtonAccess: true,
  DriveTime: '',
  Mileage: '',
  LunchTimeMinutes: '',
  IsDriveTime: false,
  IsRecurrrenceAppointment: false,
  HideProviderName: false,
  RecurrenceRule: '',
  RecurrenceException: '',
  Title: '',
  Start: '2024-07-05T09:00:00.000Z',
  End: '2024-07-05T10:00:00.000Z',
  Description: '',
  IsAllDay: false,
  StartTimezone: '',
  EndTimezone: '',
};

let readCalendarPayload = (obj) => {
  return `sort=&group=&filter=&Start=${obj.startRecur}T00:00:00.000Z&End=${obj.endRecur}T00:00:00.000Z&PatientIds=&EmployeeIds=${obj.employeeId}`;
};

// Payload templates ---end

// Helper functions ---start
function getTimezoneOffsetInHoursInt(timezone) {
  // Get the current time in the specified timezone
  const currentTime = moment2.tz(moment(), timezone);

  // Get the timezone offset in hours as an integer
  const offsetInHoursInt = Math.floor(currentTime.utcOffset() / 60); // Convert minutes to hours and round down

  return offsetInHoursInt;
}

function subtractHoursAndFormat(timeString, timezone) {
  const currentTime = moment2.tz(moment(), timezone);
  const offsetInHoursInt = Math.floor(currentTime.utcOffset() / 60); // Convert minutes to hours and round down
  // Parse the time string
  hoursToSubtract = offsetInHoursInt * -1;
  const parsedTime = moment(timeString, 'HH:mm:ss');

  // Subtract the specified number of hours
  const subtractedTime = parsedTime.subtract(hoursToSubtract, 'hours');

  return subtractedTime.format('HH:mm:ss');
}

// console.log(
//   'timezone : ',
//   subtractHoursAndFormat('13:00:00', 'America/New_York'),
// );
// Helper functions ---start

// Converting Payload ---start

const convertCreateNewPayload = (temp, obj) => {
  // This is only hard coded need to get obj data and put into temp
  const currentDate = new Date();
  const dateString = currentDate.toISOString();
  temp.ScheduleEnd = dateString;
  temp.Start1 = dateString;
  temp.End1 = dateString;
  temp.StartLocal = dateString;
  temp.EndLocal = dateString;
  temp.PatientId = obj.clientId;
  // temp.SelectedEmployee = obj.employeeId;
  temp.EmployeeId = obj.employeeId;
  temp.Start =
    obj.startRecur +
    'T' +
    subtractHoursAndFormat(obj.start, obj.timezone) +
    '.000Z';
  temp.End =
    obj.startRecur +
    'T' +
    subtractHoursAndFormat(obj.end, obj.timezone) +
    '.000Z';
  let mergedString = Object.entries(temp)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return mergedString;
};

// Converting Payload ---end

// Requesting Urls ---start
const createNewUrl = 'https://login.measurepm.com/Appointment/CreateNew';
const readCalendarUrl = 'https://login.measurepm.com/Appointment/ReadCalendar';
const deleteUrl = 'https://login.measurepm.com/Appointment/Delete';
// Requesting Urls ---end

// Requests ---start
const createNewAppointment = async (payload, url, headers, cookies) => {
  try {
    // Assuming you want to make a POST request to add an appointment
    console.log('Creating New Appointment...');
    const response = await axios.post(url, hardCodedPayload, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // Add other necessary headers
      },
      withCredentials: true,
      // Include cookies in the request

      headers: {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
    });
    console.log(
      'New Appointment',
      JSON.parse(JSON.stringify(response.data?.Data)),
    );
    console.log(
      'Errors',
      JSON.parse(JSON.stringify(response.data?.Errors)),
    );
    // return response.data;
  } catch (error) {
    console.error('Error adding appointment:', error);
  }
};

const readCalendar = async (payload, url, headers, cookies) => {
  try {
    // Assuming you want to make a POST request to add an appointment
    console.log('Reading Calendar...', payload);
    const response = await axios.post(url, payload, {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // Add other necessary headers
      },
      withCredentials: true,
      // Include cookies in the request

      headers: {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
      },
    });
    console.log('Calendar Read Successfully:', JSON.stringify(response.data));
    // return response.data;
  } catch (error) {
    console.error('Error reading calendar :', error);
  }
};
// Requests ---end

const runIntegrationMeasurePM = async (filteredEvents) => {
  await getHeadersAndCookies({
    // email: 'bschneider@orange4kidz.com',
    // password: 'Lindsay123!',
    email: 'hgoschey1@thechicagoschool.edu',
    password: 'Orange123!',
  }).then(async (data) => {
    console.log(data);
    const headers = data.headers;
    const cookies = data.cookies;

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
    const update_events_data = filteredEvents.update_events;

    const tempSuccessCreatedEvents = [];
    for (let index = 0; index < create_events_data.length; index++) {
      if (!create_events_data[index].recurring) {
        let convertedPayload = convertCreateNewPayload(
          createNewTemplate,
          create_events_data[index],
        );
        console.log(convertedPayload);
        let createApp = await createNewAppointment(
          convertedPayload,
          createNewUrl,
          headers,
          cookies,
        );
        let appointments = await readCalendar(
          readCalendarPayload(create_events_data[index]),
          readCalendarUrl,
          headers,
          cookies,
        );
        console.log('Appointments : ', appointments);
      }
    }
  });
};

let testData = {
  create_events: [
    {
      eventId: 'fc54bec6-8ea9-47ed-bd3b-0ee12e033ac1',
      deletedAt: null,
      eventIdCustom: null,
      course: null,
      activityId: '16521285',
      isCancelled: false,
      employeeId: '4528',
      clientId: '5155',
      start: '12:30:00',
      end: '13:30:00',
      duration: 7200,
      startRecur: '2024-10-07',
      endRecur: '2024-10-07',
      recurring: false,
      sunday: false,
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      timezone: 'America/New_York',
      interval: 1,
      rules: '3',
      startRecur_format: '08/05/2024',
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

const doBetaRunIntegration = async () => {
  await runIntegrationMeasurePM(testData);
}

module.exports = {
  doBetaRunIntegration,
}