const puppeteer = require('puppeteer');
const axios = require('axios');
const moment = require('moment');
const { create } = require('lodash');

module.exports = class IntegrationReThink {
  static async login(filtered_events, request_type) {
    // Converter functions start
    function subtractHoursAndFormat(timeString, hoursToSubtract) {
      // Parse the time string
      const parsedTime = moment(timeString, 'HH:mm:ss');

      // Subtract the specified number of hours
      const subtractedTime = parsedTime.subtract(hoursToSubtract, 'hours');

      // Format the result in AM/PM format without seconds
      const formattedTime = subtractedTime.format('hh:mm A');

      return [formattedTime, subtractedTime.format('HH:mm:ss')];
    }

    function timeToMinutes(timeString) {
      // Split the time string into hours, minutes, and AM/PM
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);

      // Convert hours to 24-hour format
      let hours24 = hours % 12; // Convert 12-hour to 24-hour format
      if (period === 'PM') {
        hours24 += 12; // Add 12 hours for PM
      }

      // Calculate total minutes since midnight
      const totalMinutes = hours24 * 60 + minutes;
      return totalMinutes;
    }

    const objectConverter = (template, obj) => {
      template.appointment.formatedStartDate = obj.startRecur;
      template.appointment.formatedEndDate = obj.startRecur;
      template.appointment.formatedStartTime = subtractHoursAndFormat(
        obj.start,
        5,
      )[1];
      template.appointment.formatedEndTime = subtractHoursAndFormat(
        obj.end,
        5,
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
        5,
      )[0];
      template.appointment.displayEndTime = subtractHoursAndFormat(
        obj.end,
        5,
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
      template.eventDetailsAppointment.frequencyInterval =
        obj.frequencyInterval;
      template.eventDetailsAppointment.occurrenceTypeName =
        obj.occurrenceTypeName;
      template.eventDetailsAppointment.statusName = obj.statusName;
      template.eventDetailsAppointment.evvStatusName = obj.evvStatusName;
      template.eventDetailsAppointment.evvStatusId = obj.evvStatusId;
      template.eventDetailsAppointment.startDate = obj.startDate;
      template.eventDetailsAppointment.endDate = obj.endDate;
      template.eventDetailsAppointment.startTime = obj.startTime;
      template.eventDetailsAppointment.endTime = obj.endTime;
      template.eventDetailsAppointment.scheduledById = obj.scheduledById;
      template.eventDetailsAppointment.dateCreated = obj.dateCreated;
      template.eventDetailsAppointment.appointmentTypeId =
        obj.appointmentTypeId;
      template.eventDetailsAppointment.funderId = obj.funderId;
      template.eventDetailsAppointment.stateId = obj.stateId;
      template.eventDetailsAppointment.funderName = obj.funderName;
      template.eventDetailsAppointment.serviceId = obj.serviceId;
      template.eventDetailsAppointment.providerServiceId =
        obj.providerServiceId;
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
      template.eventDetailsAppointment.clientContactName =
        obj.clientContactName;
      template.eventDetailsAppointment.clientContactRelationship =
        obj.clientContactRelationship;
      template.eventDetailsAppointment.paycodeId = obj.paycodeId;
      template.eventDetailsAppointment.locationId = obj.locationId;
      template.eventDetailsAppointment.dateBillingReported =
        adjustTimeAndConvertToUTC(obj.dateBillingReported);
      template.eventDetailsAppointment.dateLastModified =
        adjustTimeAndConvertToUTC(obj.dateLastModified);
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

    const add_jsonString = JSON.stringify(event_payload);
    const update_jsonString = JSON.stringify(update_payload);
    const delete_jsonString = JSON.stringify(delete_payload);

    // console.log('add_jsonString : ', add_jsonString);
    // console.log('update_jsonString : ', update_jsonString);
    // console.log('delete_jsonString : ', delete_jsonString);
    const add_url =
      'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/AddAppointment';

    const delete_url =
      'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/deleteAppointment';

    const update_url =
      'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/UpdateAppointment';

    const cancel_url =
      'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/CancelAppointment';

    const get_appointment_url =
      'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/GetAppointmentsListNewAsync';

    let get_appointments_payload = {
      startDate: '2024-04-22T00:00:00',
      endDate: '2024-04-29T00:00:00',
      memberIds: [729905],
      clientIds: null,
      checkExceedAuthorization: false,
    };

    const getAppointment = async (payload, url, headers, cookies) => {
      try {
        // Assuming you want to make a POST request to add an appointment
        console.log('Getting weekly appointment...');
        const response = await axios.post(url, payload, {
          headers: {
            ...headers,
            'Content-Type': 'application/json', // Add other necessary headers
          },
          withCredentials: true,
          // Include cookies in the request
          headers: {
            Cookie: cookies,
            // .map((cookie) => `${cookie.name}=${cookie.value}`)
            // .join('; '),
          },
        });
        // const csrfToken = response.headers['x-csrf-token'];
        console.log('Retrieving appointments successfully:,', response.data);
        return [response.data, ''];
      } catch (error) {
        console.error('Error adding appointment:', error);
      }
    };

    const addAppointment = async (payload, url, headers, cookies) => {
      try {
        // Assuming you want to make a POST request to add an appointment
        console.log('Adding appointment...');
        // let my_cookie = cookies
        //   .map((cookie) => `${cookie.name}=${cookie.value}`)
        //   .join('; ');
        const response = await axios.post(url, payload, {
          headers: {
            ...headers,
            'Content-Type': 'application/json', // Add other necessary headers
          },
          withCredentials: true,
          // Include cookies in the request

          headers: {
            Cookie: cookies,
            // .map((cookie) => `${cookie.name}=${cookie.value}`)
            // .join('; '),
          },
        });
        console.log('Adding Cookie', cookies);
        console.log('Adding Headers', headers);
        console.log('Appointment added successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error adding appointment:', error);
      }
    };

    const deleteAppointment = async (payload, url, headers, cookies) => {
      try {
        // Assuming you want to make a POST request to delete an appointment
        console.log('Deleting appointment...');
        const response = await axios.post(url, payload, {
          headers: {
            ...headers,
            'Content-Type': 'application/json; charset=utf-8', // Add other necessary headers
          },
          withCredentials: true,
          // Include cookies in the request
          headers: {
            Cookie: cookies
              .map((cookie) => `${cookie.name}=${cookie.value}`)
              .join('; '),
          },
        });
        console.log('Appointment deleted successfully :', response.data);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    };

    const updateAppointment = async (payload, url, headers, cookies) => {
      try {
        // Assuming you want to make a POST request to update an appointment
        console.log('Updating appointment...');
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
        console.log('Appointment updated successfully:', response.data);
      } catch (error) {
        console.error('Error updating appointment:', error);
      }
    };

    const cancelAppointment = async (
      payload,
      url,
      headers,
      cookies,
      csrfToken,
    ) => {
      try {
        // Assuming you want to make a POST request to add an appointment
        console.log('Canceling appointment...');
        const response = await axios.post(url, payload, {
          headers: {
            ...headers,
            'Content-Type': 'application/json; charset=utf-8', // Add other necessary headers
            // 'X-CSRF-TOKEN':
            //   'CfDJ8GuLT3o0Se1JlBInSe7jMgSvMgIWpLEDzpyDXE72K_irTO4sn-KR9cAai0YLnzj-2tpxcK9otVFO8nIYB2NNgEe2mgGtJTZ3CtZ0Hcz0bMRgS1-rVXmypmvsgfSjj4pKuiRD0xX8M4F4Q4mEWPRLCpMdXFsDjfULDjhdJ4NIdoTzddzci_bpp2S2SBwtmDGkeQ',
          },
          withCredentials: true,
          // Include cookies in the request
          headers: {
            Cookie: cookies,
            // .map((cookie) => `${cookie.name}=${cookie.value}`)
            // .join('; '),
          },
        });
        console.log('Appointment canceled successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error canceling appointment:', error);
      }
    };

    const convertPayload = (e) => {
      // First convert event (e) to payload then return
      // For now this is just a simple example
      return event_payload;
    };

    try {
      const browser = await puppeteer.launch({
        headless: false,
        timeout: 60000,
      }); // run the browser background
      const page = await browser.newPage(); // Create a new page
      // await page.setRequestInterception(true);
      await page.setViewport({ width: 1080, height: 720 });

      const created_events_successful = [];
      const updated_events_successful = [];
      const canceled_events_successful = [];
      const deleted_events_successful = [];

      const created_events_failed = [];
      const updated_events_failed = [];
      const canceled_events_failed = [];
      const deleted_events_failed = [];

      const loginPromise = new Promise((resolve, reject) => {
        page.on('request', async (interceptedRequest) => {
          // async request
          if (
            interceptedRequest.url().includes(
              // 'https://webapp.rethinkbehavioralhealth.com/HealthCare/User/GetUserCredentials',
              // 'https://webapp.rethinkbehavioralhealth.com/Shared/Task/GetNewTasksCount',
              // 'https://webapp.rethinkbehavioralhealth.com/HealthCare/FunderForm/GetDefaultElementsAsync',
              // 'https://webapp.rethinkbehavioralhealth.com/core/scheduler',
              // 'https://webapp.rethinkbehavioralhealth.com/HealthCare/FunderForm/GetDefaultElementsAsync',
              'https://webapp.rethinkbehavioralhealth.com/core/api/scheduling/scheduling/GetAppointmentsListNewAsync',
            )
          ) {
            const my_headers = interceptedRequest.headers();
            //const requestBody = interceptedRequest.postData();
            const my_cookies = await page.cookies();

            // Hardcoded cookies start
            const cookies =
              '.AspNetCore.Antiforgery.dhHko_vIir0=CfDJ8BIAPrQtNy9DkFe71lkotEf0MLCX-USsBiD9SrMK-65-Ko7T_xOs5wm1G83PxT8tdw0ASQFnkt07yAlkqZqfhqPp5sIS-ZB88fjSx8Mm4HSWYXdD3UlEpBaKUg3-eihw-_iIfAIpblr7zZie_iuBtJo; __RequestVerificationToken=ktUbV_b_h5k93-Cbv5ET9-08HaL6zTaLT25K_gzHuAAkmBoXNfmI4qIlzIjhmOYoAboQopkLcRnaWkRYLRdiEINDPXU1; ai_user=YWRJloCryYKm4rBIldQfnQ|2024-04-17T08:13:31.889Z; apt.uid=AP-OZQJMSAAG2FI-2-1713341637800-11777418.0.2.4e378b04-d609-46f8-82ca-c0c60dc7be5b; ASP.NET_SessionId=5eqeql4gmn5iqipyqw3rxmxm; user_device_AdamDaniels=Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMjQuMC4wLjAgU2FmYXJpLzUzNy4zNiI=; IsUserParent=false; GainsightIdentity=%7B%22id%22%3A729905%2C%22accountInfoId%22%3A22225%2C%22email%22%3A%22adam%40abaschedules.com%22%2C%22firstName%22%3A%22Adam%22%2C%22lastName%22%3A%22Daniels%22%2C%22division%22%3A%22BH%22%2C%22product%22%3A%22BH%22%2C%22roleName%22%3A%22Role%204.0%22%2C%22jobTitle%22%3A%22System%20Admin%22%2C%22accountName%22%3A%22Innovations%20Developmental%20Solutions%22%7D; LogRocketIdentity=%7B%22userName%22%3A%22adamdaniels%22%2C%22id%22%3A729905%2C%22fullName%22%3A%22Adam%20Daniels%22%2C%22email%22%3A%22adam%40abaschedules.com%22%7D; _lr_uf_-uucelm=f16c82e0-481d-400c-a933-91a4608b6120; apt.sid=AP-OZQJMSAAG2FI-2-1714578217730-13471893; adminlogin=4BDFD42AB60872A0C4C428E308D49C54443FF9C601639717A7480CDE729489596827AAFF9951A5975F6DAD512367578DEB2094EBCCC702622BEE02B6006918B197FB2A285ACD7CE61E6353E7DDEBC1F7AB5FA4E2B2C0AD22B92E20039BEFCBF00D606646372C9EEC2125A28D23131CEF0359F9333BC09A942244E3A513AA440963097C6F482FA04F0241438606D325735DC36DA7846810C2F0FFA02B34B1DF1EF9C1A9EC07BD7F9E6AE0DED7D606392819640B11820879388B3DE3A15E7AB067410DDB91; XSRF-TOKEN=CfDJ8GuLT3o0Se1JlBInSe7jMgRzSlfJ4CU76V-qKSy9GTYNJpJHmgzHeWSgV1vEwOYgXhLwXI-kBmufUmYBhb24yex8cN3AYOprcaV1heqeermMBxHjqfH1zFrw3hpNDS2r6KQRcHKwz5K0dEnx0WjFf9DGp8rP0jeuk6uS_tYo3COz3Z2BPqNrH4n3B2lmmKq3sw; _lr_tabs_-uucelm%2Frethinkbh={%22sessionID%22:1%2C%22recordingID%22:%225-ae256b39-684b-4ab0-91af-7b323d4fa626%22%2C%22webViewID%22:null%2C%22lastActivity%22:1714578313721}; _lr_hb_-uucelm%2Frethinkbh={%22heartbeat%22:1714578313722}; ai_session=LmkrtVkinMi6Qw6SF6Un0T|1714576845272|1714578313894; roletypeid=89198; rethinkbh_newuilook=0';

            // Hardcoded cookies end

            let csrfToken = '';
            // let my_new_cookie = cookies
            //   .map((cookie) => `${cookie.name}=${cookie.value}`)
            //   .join('; ');
            // Log or process the request details
            console.log('here we are: ', filtered_events);
            console.log('URL:', interceptedRequest.url());
            console.log('Request_Headers:', my_headers);
            // console.log('Requests_cookie:', my_new_cookie);

            const headers = my_headers;
            const create_events_data = filtered_events.create_events.filter(
              (item) => {
                return item.clientId === '131689';
              },
            );
            const delete_events_data = filtered_events.delete_events.filter(
              (item) => {
                return item.clientId === '131689';
              },
            );
            const update_events_data = filtered_events.update_events.filter(
              (item) => {
                return item.clientId === '131689';
              },
            );
            const cancel_events_data = filtered_events.cancel_events.filter(
              (item) => {
                return item.clientId === '131689';
              },
            );

            console.log('aa : ', filtered_events.create_events.length > 0);
            console.log('bb : ', filtered_events.create_events);

            let week_day_dateString = null;

            if (create_events_data.length > 0) {
              console.log('Creating True');
              week_day_dateString = create_events_data[0]['startRecur'];
            }
            if (delete_events_data.length > 0) {
              console.log('Deleting True');
              week_day_dateString = delete_events_data[0]['startRecur'];
            }
            if (update_events_data.length > 0) {
              console.log('Updating True');
              week_day_dateString = update_events_data[0]['startRecur'];
            }
            if (cancel_events_data.length > 0) {
              console.log('Canceling True');
              week_day_dateString = cancel_events_data[0]['startRecur'];
            }

            let week_data = [];

            if (week_day_dateString !== null) {
              console.log('Getting week data');
              let week_day_date = getWeekStartAndEnd(week_day_dateString);
              get_appointments_payload.startDate = week_day_date.startDate;
              get_appointments_payload.endDate = week_day_date.endDate;
              console.log(get_appointments_payload);
              const weekly_appointments = await getAppointment(
                get_appointments_payload,
                get_appointment_url,
                headers,
                cookies,
              );
              // console.log('week1 : ', weekly_appointments);
              week_data = weekly_appointments[0];
              csrfToken = 'weekly_appointments[1];';
            }

            // console.log('Week Data : ', week_data.appointments[0].events);
            // Here we can add events (add,delete,update)
            if (create_events_data.length > 0) {
              for (let index = 0; index < create_events_data.length; index++) {
                let req_payload = objectConverter(
                  event_payload,
                  create_events_data[index],
                );
                try {
                  await addAppointment(req_payload, add_url, headers, cookies);
                } catch {
                  console.log('Adding Error');
                }
              }
            }

            if (cancel_events_data.length > 0) {
              for (let index = 0; index < cancel_events_data.length; index++) {
                let ev_cancel = week_data.appointments[0];
                console.log('Cancelling Starts');
                // for (let ii = 0; ii < week_data.appointments.length; ii++) {
                //   let start_minutes =
                //     120 + timeToMinutes(cancel_events_data[index].start);
                //   let end_minutes =
                //     120 + timeToMinutes(cancel_events_data[index].end);
                //   if (
                //     week_data.appointments[ii].staffId ===
                //       cancel_events_data[index].employeeId &&
                //     week_data.appointments[ii].clientId ===
                //       cancel_events_data[index].clientId &&
                //     week_data.appointments[ii].startTime === start_minutes &&
                //     week_data.appointments[ii].endTime === end_minutes &&
                //     week_data.appointments[ii].startDate.slice(0, 10) ===
                //       cancel_events_data[index].startRecur
                //   ) {
                //     console.log('Hello Cancel Event');
                //     ev_cancel = week_data.appointments[ii];
                //     break;
                //   }
                // }
                try {
                  if (ev_cancel !== null) {
                    let req_payload = cancelObjectConverter(
                      cancel_payload,
                      ev_cancel,
                    );
                    await cancelAppointment(
                      req_payload,
                      cancel_url,
                      headers,
                      cookies,
                      csrfToken,
                    );
                  }
                } catch (error) {
                  console.error(
                    'An error occurred while processing cancellation:',
                    error,
                  );
                }
              }
            }
            // if (request_type === 'delete') {
            //   // let delete_payload_string = JSON.stringify(delete_payload);
            //   await deleteAppointment(
            //     delete_payload,
            //     delete_url,
            //     headers,
            //     cookies,
            //   );
            // }

            // if (request_type === 'update') {
            //   await updateAppointment(
            //     update_payload,
            //     update_url,
            //     headers,
            //     cookies,
            //   );
            // }
            // End adding events

            const cookieString = cookies;
            // .map((cookie) => `${cookie.name}=${cookie.value}`)
            // .join('; ');

            // Include cookies in the headers
            headers['Cookie'] = cookieString;
            console.log('headers: ' + headers);

            resolve({
              created_events_successful,
              updated_events_successful,
              canceled_events_successful,
              deleted_events_successful,
              created_events_failed,
              updated_events_failed,
              canceled_events_failed,
              deleted_events_failed,
            });
          }
        });
        page.on('error', (error) => {
          reject(error);
        });
      });

      await page.goto(
        // 'https://webapp.rethinkbehavioralhealth.com/Healthcare#/Login',
        'https://webapp.rethinkbehavioralhealth.com/Healthcare#/',
      ); // Navigate to the login page
      console.log('ww1');
      // Wait for the login form to appear
      await page.waitForSelector('input[name="User"]');
      await page.waitForSelector('input[name="Password"]');
      console.log('ww2');

      // Fill in the login credentials
      await page.type('input[name="User"]', 'adamdaniels');
      await page.type('input[name="Password"]', 'Password123!');
      console.log('ww3');

      // Click the login button
      await page.click('.ra-btn.ra-btn-gradient.loginBtn');
      console.log('ww4');

      // Wait for navigation to complete
      await page.waitForNavigation();

      console.log('Successfully logged in');

      await page.goto(
        'https://webapp.rethinkbehavioralhealth.com/core/scheduler',
      );
      // await page.goto(
      //   'https://webapp.rethinkbehavioralhealth.com/Healthcare#/',
      // );
      // await page.goto(
      //   'https://webapp.rethinkbehavioralhealth.com/core/scheduler/individual',
      // );
      return loginPromise
        .then((data) => {
          // Optional cleanup or additional processing
          browser.close(); // Don't forget to close the browser
          return data; // This is the data resolved from within your event listener
        })
        .catch((error) => {
          // Handle or throw the error
          browser.close(); // Ensure browser closure on error
          throw error;
        });
      // Adding a new Appointments
      // if (request_type === 'add') {
      //   let converted_payload = convertPayload(filtered_events);
      //   await addAppointment(converted_payload, add_url);
      // }
      // Delete the existing Appointments

      // Update the existing Appointments

      // Close the browser when done
      await browser.close();
    } catch (error) {
      console.error('Error during login:', error);
    }
  }
};
