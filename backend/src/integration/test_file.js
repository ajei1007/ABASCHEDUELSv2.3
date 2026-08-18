const { subtract, template } = require('lodash');
const { errors } = require('../services/notifications/list');
const IntegrationReThink = require('./test_rethink');
const IntegrationTheralytics = require('./_thera');
const moment = require('moment');

// let a = IntegrationReThink.login({}, 'delete');
// let a = IntegrationTheralytics.login({}, 'delete');

let goomy = {
  create_events: [
    {
      eventId: '180a95d4-e244-4a3a-9c8b-cbf4767dabb2',
      deletedAt: null,
      eventIdCustom: null,
      course: null,
      activityId: '16521285',
      isCancelled: false,
      employeeId: '19',
      clientId: '11',
      start: '13:00:00',
      end: '15:30:00',
      duration: 9000,
      startRecur: '2024-05-09',
      endRecur: '2024-05-09',
      recurring: false,
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: false,
      saturday: false,
      interval: 1,
      rules: '3',
      startRecur_format: '05/09/2024',
    },
  ],
  delete_events: [
    // {
    //   eventId: '180a95d4-e244-4a3a-9c8b-cbf4767dabb2',
    //   deletedAt: null,
    //   eventIdCustom: 863,
    //   course: null,
    //   activityId: '16521285',
    //   isCancelled: false,
    //   employeeId: '19',
    //   clientId: '11',
    //   start: '13:00:00',
    //   end: '15:30:00',
    //   duration: 9000,
    //   startRecur: '2024-05-08',
    //   endRecur: '2024-05-08',
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
    //   startRecur_format: '05/02/2024',
    // },
  ],
  update_events: [],
  cancel_events: [
    // {
    //   eventId: '180a95d4-e244-4a3a-9c8b-cbf4767dabb2',
    //   deletedAt: null,
    //   eventIdCustom: 746,
    //   course: null,
    //   activityId: '16521285',
    //   isCancelled: false,
    //   employeeId: '19',
    //   clientId: '11',
    //   start: '13:00:00',
    //   end: '15:30:00',
    //   duration: 9000,
    //   startRecur: '2024-05-02',
    //   endRecur: '2024-05-02',
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
    //   startRecur_format: '05/02/2024',
    // },
  ],
};

let a = IntegrationTheralytics.login(goomy);

let needed_json_data = {
  appointment: {
    formatedStartDate: '2024-04-16',
    formatedEndDate: '2024-04-16',
    formatedStartTime: '10:30:00',
    formatedEndTime: '10:45:00',
    startDate: '2024-04-16T00:00:00',
    startTime: 750,
    endTime: 780,
    staffId: 309886,
    clientId: 131689,
    displayDate: '2024-04-16T14:30:00.000Z',
    displayStartTime: '10:30 AM',
    displayEndTime: '11:00 AM',
    existingStartDate: '2024-04-16T00:00:00',
  },
  remindersData: {
    startDate: '2024-04-16T10:30:00',
  },
};

// let a = IntegrationReThink.login(goomy, 'add');
// Converter functions start

// function subtractHoursAndFormat(timeString, hoursToSubtract) {
//   // Parse the time string
//   const parsedTime = moment(timeString, 'HH:mm:ss');

//   // Subtract the specified number of hours
//   const subtractedTime = parsedTime.subtract(hoursToSubtract, 'hours');

//   // Format the result in AM/PM format without seconds
//   const formattedTime = subtractedTime.format('hh:mm A');

//   return [formattedTime, subtractedTime.format('HH:mm:ss')];
// }

// function timeToMinutes(timeString) {
//   // Split the time string into hours, minutes, and AM/PM
//   const [time, period] = timeString.split(' ');
//   const [hours, minutes] = time.split(':').map(Number);

//   // Convert hours to 24-hour format
//   let hours24 = hours % 12; // Convert 12-hour to 24-hour format
//   if (period === 'PM') {
//     hours24 += 12; // Add 12 hours for PM
//   }

//   // Calculate total minutes since midnight
//   const totalMinutes = hours24 * 60 + minutes;
//   return totalMinutes;
// }

// // Converter functions end

// const timeString = '13:00:00'; // 24-hour time format
// let resultTime = subtractHoursAndFormat(timeString, 5)[1];
// let resultTime2 = subtractHoursAndFormat(timeString, 5)[0];
// console.log(resultTime, resultTime2); // Output: 08:00:00

// const objectConverter = (template, obj) => {
//   template.appointment.formatedStartDate = obj.startRecur;
//   template.appointment.formatedEndDate = obj.startRecur;
//   template.appointment.formatedStartTime = subtractHoursAndFormat(
//     obj.start,
//     5,
//   )[1];
//   template.appointment.formatedEndTime = subtractHoursAndFormat(obj.end, 5)[1];
//   template.appointment.startDate = obj.startRecur + 'T00:00:00';
//   template.appointment.startTime =
//     120 + timeToMinutes(template.appointment.formatedStartTime);
//   template.appointment.endTime =
//     120 + timeToMinutes(template.appointment.formatedEndTime);
//   template.appointment.staffId = obj.employeeId;
//   template.appointment.clientId = obj.clientId;
//   template.appointment.displayDate = obj.startRecur;
//   template.appointment.displayStartTime = subtractHoursAndFormat(
//     obj.start,
//     5,
//   )[0];
//   template.appointment.displayEndTime = subtractHoursAndFormat(obj.end, 5)[0];
//   template.appointment.existingStartDate = obj.startRecur + 'T00:00:00';
//   template.remindersData.startDate =
//     obj.startRecur + 'T' + template.appointment.formatedStartTime;
//   return template;
// };

// console.log(objectConverter(needed_json_data, goomy.create_events[0]));

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

const cancelObjectConverter = (template, obj) => {
  const currentDate = new Date();
  const dateString = currentDate.toISOString();
  template.appointmentInstances.appointmentId = obj.id;
  template.appointmentInstances.startDate = obj.startDate;
  template.cancellation.dueDate = dateString;
  template.eventDetailsAppointment.clientContactId = obj.clientContactId;
  template.eventDetailsAppointment.clientLocation = obj.clientLocation;
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
  template.eventDetailsAppointment.toLocation = obj.clientLocation;
  template.eventDetailsAppointment.events = obj.events;

  template.eventDetailsAppointment.authorizationUsedHours =
    obj.authorizationUsedHours;
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
  template.eventDetailsAppointment.toLocationLatitude = obj.toLocationLatitude;
  template.eventDetailsAppointment.toLocationLongitude =
    obj.toLocationLongitude;
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
    obj.startDate +
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

let cancel_payload = {
  appointmentInstances: [
    {
      appointmentId: 52700112,
      startDate: '2024-04-24T00:00:00',
    },
  ],
  cancellation: {
    cancellationTypeId: 1,
    dueDate: '2024-04-26T16:24:37.669Z',
    statusId: 4,
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
    rescheduleDueDate: '2024-04-26T16:24:37.669Z',
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
    initAppointmentStartDate: '2024-04-24T08:00:00',
    initAppointmentStartTime: 600,
    initAppointmentEndTime: 750,
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
    id: 52700112,
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
    statusId: 4,
    statusName: 'Needs Verification',
    evvStatusId: 1,
    evvStatusName: 'Pending',
    evvProviderStatusUuid: null,
    evvRejectedReason: null,
    startDate: '2024-04-24T00:00:00',
    endDate: '2024-04-24T00:00:00',
    startTime: 600,
    endTime: 750,
    actualStartTime: null,
    actualEndTime: null,
    scheduledById: 309886,
    dateCreated: '2024-04-25T13:02:13.643',
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
        id: 52700112,
        text: '08:00 AM - 10:30 AM',
        html: '10:00 AM - 12:30 PM',
        start: '2024-04-24 08:00:00',
        end: '2024-04-24 10:30:00',
        resource: '131689',
        bubbleHtml:
          '<strong>Client Name:</strong> Training Client<br />\r\n<strong>Staff Member Name:</strong> Adam Daniels<br />\r\n<strong>Service Line:</strong> ABA<br />\r\n<strong>Service:</strong> BT 1:1<br />\r\n<strong>Activity:</strong> <br />\r\n<strong>Date:</strong> 4/24/2024<br />\r\n<strong>Time:</strong> 08:00 AM - 10:30 AM<br />\r\n<strong>Supervisor Name:</strong> <br />\r\n<strong>Appointment Status:</strong> Needs Verification<br />\r\n',
        statusId: 2,
        statusName: 'Needs Verification',
        evvStatusName: 'Pending',
        checkExceedAuthorizationHours: true,
        procedureCodeId: 1717819,
        minutes: 150,
        hours: 2,
        isExceedAuthorizationHours: null,
        isExceedSchedulingGoal: null,
        startDateTimeText: '4/24/2024 08:00 AM',
        endDateTimeText: '4/24/2024 10:30 AM',
        validationReasons: null,
        appointmentTypeId: 1,
        validation: null,
        isOvernight: false,
        sortStartDate: '2024-04-24T12:00:00.000Z',
        sortEndDate: '2024-04-24T14:30:00.000Z',
        eventDate: '2024-04-24T08:00:00',
        date: 'Apr 24 2024',
        eventDataMonth: '2024-04-24T12:00:00.000Z',
        eventDayName: 'Wed',
        eventIsToday: false,
        timeText: '08:00 AM - 10:30 AM',
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
    authorizationUsedHours: 3.25,
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
    dateBillingReported: '2024-04-26T12:51:00.000Z',
    datePayrollReported: null,
    modifiedBy: 729905,
    dateLastModified: '2024-04-25T15:02:13.000Z',
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
    originalEndTime: 750,
    existingStartTime: 480,
    existingEndTime: 630,
    formatedStartDate: '2024-04-24',
    formatedPrincipalVerificationDate: '2024-04-26',
    occurrenceText: 'None',
    savedAppointmentTypeId: 1,
    initOccurrenceEndDate: '2024-04-24T00:00:00',
    displayDate: '2024-04-24T12:00:00.000Z',
    displayStartTime: '08:00 AM',
    displayEndTime: '10:30 AM',
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
    dueDate: '2024-04-26T16:24:37.669Z',
    isBulkCancellation: false,
    rescheduleAssignedToName: '',
    occurrenceEndType: 0,
    isExceedSchedulingGoal: false,
    isExceedAuthorizationHours: false,
    existingStartDate: '2024-04-24T00:00:00',
  },
};

let returned_addAppointment = {
  description: null,
  signatureParentName: null,
  verifiedFromSessionNote: null,
  clientContactId: 0,
  clientLocation: null,
  cancellationTypeName: null,
  rescheduleDueDate: '0001-01-01T00:00:00',
  rescheduleAssignedToId: 0,
  sessionNoteFormId: 0,
  sessionNoteComments: null,
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
  cancellationTagName: null,
  checkAuthorizationExceed: false,
  verifiedById: null,
  verifiedByName: null,
  verifiedByTitle: null,
  rescheduleFromId: null,
  initAppointmentStartDate: null,
  initAppointmentStartTime: null,
  initAppointmentEndTime: null,
  missingSessionNotesFileCabinet: null,
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
  id: 52700112,
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
  startDate: '2024-04-24T00:00:00',
  endDate: '2024-04-24T00:00:00',
  startTime: 600,
  endTime: 750,
  actualStartTime: null,
  actualEndTime: null,
  scheduledById: 309886,
  dateCreated: '2024-04-25T13:02:13.643',
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
  evvClearingHouseId: null,
  stateId: 6,
  funderName: 'Colorado Medicaid',
  billingCode: '97153',
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
  locationName: 'Client Home',
  mileage: null,
  procedureCodeId: 1717819,
  staffSignatureId: null,
  clientSignatureId: null,
  principalSignatureId: null,
  parentSignature: null,
  events: [Array],
  sessionNoteResponseId: 0,
  seriesAppointmentId: null,
  occurrenceEndDate: null,
  providerBillingCodeId: 0,
  providerBillingCodeCredentialId: 0,
  expirationDate: null,
  seriesAppointmentStartDate: null,
  initOccurrenceStartDate: null,
  isParentVerificationRequired: null,
  isSessionNoteEnteredRequired: true,
  sessionNoteReviewedBy: 0,
  authorizationUsedHours: 0,
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
  paycode: 'ADM',
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
  dateBillingReported: '2024-04-26T10:51:00.777',
  datePayrollReported: null,
  modifiedBy: 729905,
  dateLastModified: '2024-04-25T13:02:13.64',
  location: null,
  status: null,
  dateDoeBilled: null,
  statusDoeBilled: null,
  sessionNoteDraftResponseId: null,
  noAuthRequired: false,
  authorizationEndDate: '2024-11-22T00:00:00',
  authorizationStartDate: '2024-02-01T00:00:00',
  authorizedWeeklyHours: 61.69491525423729,
  occurrenceLookup: false,
  isClientDemo: true,
  validation: null,
  authorizationNumber: '12344532',
  units: 15,
  renderingProvider: 'Cathie Christmas',
  referringProviderName: '',
  includeReferringProviderRequiredOnClaim: false,
  evvReasons: [],
  acknowledgeableExceptions: null,
  evvActionTakenId: null,
  isEVV: true,
  clockInLatitude: null,
  clockInLongitude: null,
  clockOutLatitude: null,
  clockOutLongitude: null,
  toLocationLatitude: null,
  toLocationLongitude: null,
  clockInAddress: null,
  clockOutAddress: null,
  modifier1: null,
  modifier2: null,
  lastModified: '2024-04-25T13:02:13.64',
  isMissingBillingInfo: false,
  isPendingSubmission: false,
  clearingHouseId: 4,
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
};

let goomy2 = {
  create_events: [],
  delete_events: [
    {
      eventId: '180a95d4-e244-4a3a-9c8b-cbf4767dabb2',
      deletedAt: null,
      eventIdCustom: 745,
      course: null,
      activityId: '16521285',
      isCancelled: true,
      employeeId: '309886',
      clientId: '131689',
      start: '13:00:00',
      end: '15:30:00',
      duration: 9000,
      startRecur: '2024-04-24',
      endRecur: '2024-04-25',
      recurring: false,
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: false,
      saturday: false,
      interval: 1,
      rules: '3',
      startRecur_format: '04/24/2024',
    },
  ],
  update_events: [],
  cancel_events: [
    // {
    //   eventId: '180a95d4-e244-4a3a-9c8b-cbf4767dabb2',
    //   deletedAt: null,
    //   eventIdCustom: null,
    //   course: null,
    //   activityId: '16521285',
    //   isCancelled: true,
    //   employeeId: '309886',
    //   clientId: '131689',
    //   start: '13:00:00',
    //   end: '15:30:00',
    //   duration: 9000,
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
};

let goomy3 = {
  create_events: [],
  delete_events: [
    {
      eventId: 'fc54bec6-8ea9-47ed-bd3b-0ee12e033ac1',
      deletedAt: '2024-04-25T17:07:44.000Z',
      eventIdCustom: null,
      course: null,
      activityId: '16521285',
      isCancelled: false,
      employeeId: '309886',
      clientId: '131689',
      start: '17:00:00',
      end: '19:00:00',
      duration: 7200,
      startRecur: '2024-04-24',
      endRecur: '2024-04-25',
      recurring: false,
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: false,
      saturday: false,
      interval: 1,
      rules: '3',
      startRecur_format: '04/24/2024',
    },
  ],
  update_events: [],
  cancel_events: [],
};

// let a_test = IntegrationReThink.login(goomy3, 'test');
