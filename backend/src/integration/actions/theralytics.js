const axios = require('axios');
const moment = require('moment');
const momentTz = require('moment-timezone');
const { RRule } = require('rrule');

const AuthIntegrationsDBApi = require('../../db/api/authIntegrations');
const UsersDBApi = require('../../db/api/users');
const UsersInegrationDataDBApi = require('../../db/api/usersIntegrationData');
const { encrypt, decrypt } = require('../../utils/crypto');
const { getRoleHierarchy } = require('../../utils/roleHierarchy');
const AuthTheralytics = require('../auth/theralytics');
const ApiService = require('../services/apiService');

const db = require('../../db/models');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// URL
const URL = 'https://api.theralytics.net';
const PATIENTS_URL = `/patients/GetPatientsList`;
const STAFFS_URL = `/Staffs/GetStaffs`;

// Templates
const eventObjTemplate = {
  appointmentSupervsieeStaffs: [],
  customAddress: null,
  isTelehealthAppointment: false,
  isRecurrence: false,
  isClientRequired: true,
  isBillableAppointment: true,
  isBillable: true,
  isExcludedFromMileage: false,
  isDirectService: true,
  driveTime: null,
  serviceAddress: null,
  isExcludedFromPayroll: false,
  payRateTypeId: null,
  clinicalRoomId: null,
  isClientCheckedIn: false,
  isMakeUpSession: false,
  makeUpSessionHours: null,
  isRBTTracking: false,
  modeOfMeetingId: null,
  supervisionTypeId: null,
  isObservedWithclient: false,
  patientEncounterId: null,
  // 
  patientAddressID: null,
  patientAppointmentId: 0,
  serviceLocationID: 1,
  officeAddressID: 1,
  customAddressID: 8,
  latitude: 26.1403369,
  longitude: -80.1836051,
  offset: -240,
  timezone: 'Eastern Daylight Time',
  noteTypeId: 0,
};
const recurringEventObjTemplate = {
  allowMultipleStaff: false,
  canEdit: false,
  defaultDuration: 0,
  isBillable: false,
  isClientCheckedIn: false,
  isClientRequired: true,
  isDirectService: true,
  isEvvPayer: false,
  isExcludedFromMileage: false,
  isExcludedFromPayroll: false,
  isNotificationSent: false,
  isObservedWithclient: false,
  isRBTTracking: false,
  isRecurrence: true,
  isRequiredAuthorization: false,
  isSavedAsDraft: false,
  isServiceTimeOver: false,
  isTelehealthAppointment: false,
  noteTypeId: 0,
  patientAppointmentId: 0,
  timeDifference: 0,
  totalBillableHours: 0,
  totalCanceledHours: 0,
  totalRenderedHours: 0,
  totalScheduledHours: 0,
  //
  patientAddressID: 1471,
  serviceLocationID: 1,
  customAddressID: 8,
  latitude: 26.1403369,
  longitude: -80.1836051,
  offSet: 0,
  availabilityMessages: [
    {
      code: 5,
      message: ' All set!',
      valid: true,
    },
  ],
};
// Utils
const mapUsersToIds = (existingUsers, typeUsers, userType) =>
  existingUsers
    .filter(user => user.userType === userType)
    .map(user => {
      const match = typeUsers.find(
        u => u.firstName === user.firstName && u.lastName === user.lastName
      );
      if (match) {
        return { ...user, customId: match.id };
      }
      return null;
    }).filter(user => user !== null);
function formatToBeCreatedEvent(template, obj, index) {
  const formattedObj = JSON.parse(JSON.stringify(template));

  const timezone = obj.timezone;
  const startRecur = obj.startRecur;
  const start = obj.start;
  const end = obj.end;

  const startDateTime = momentTz.tz(`${startRecur}T${start}`, timezone).format('YYYY-MM-DDTHH:mm:ss');
  const endDateTime = momentTz.tz(`${startRecur}T${end}`, timezone).format('YYYY-MM-DDTHH:mm:ss');

  formattedObj.startDateTime = startDateTime;
  formattedObj.endDateTime = endDateTime;
  formattedObj.recurrenceRule = obj?.recurrenceRule ?? '';

  formattedObj.patientID = obj.clientId ? parseInt(obj.clientId) : null;
  formattedObj.appointmentTypeID = obj.activityId ? parseInt(obj.activityId) : 1;
  formattedObj.patientInsuranceId = obj.customPayorClientId
    ? parseInt(obj.customPayorClientId)
    : null;
  formattedObj.authorizationId = obj.authorizationId ? parseInt(obj.authorizationId) : null;
  formattedObj.serviceLocationID = obj.locationId
    ? parseInt(obj.locationId)
    : 1;
  formattedObj.serviceAddress = obj.serviceAddress ?? null

  if (obj.customAddressId) {
    formattedObj.patientAddressID = obj.customAddressId
      ? parseInt(obj.customAddressId)
      : null;
    formattedObj.officeAddressID = null;
  }


  if (index > 0) {
    formattedObj.parentAppointmentId = 0;
    
  } else { // Parent event
    formattedObj.isBillable = true;
    formattedObj.isMakeUpSession = false;
    formattedObj.offSet = -420;
    if (obj.employeeId) {
      formattedObj.appointmentStaffs = [
        {
          staffId: parseInt(obj.employeeId),
          isDeleted: false,
        },
      ]
    }
  }

  return formattedObj;
}
function findMinStartAndMaxEnd(events) {
  return events.reduce((acc, event) => {
    if (!acc.fromDate || new Date(event.startRecur) < new Date(acc.fromDate)) {
      acc.fromDate = event.startRecur;
    }
    if (!acc.toDate || new Date(event.endRecur) > new Date(acc.toDate)) {
      acc.toDate = event.endRecur;
    }
    return acc;
  }, { fromDate: null, toDate: null });
}
const generateRecurringOrNonRecurringEvents = (event) => {
  const {
    start,
    timezone,
    startRecur,
    endRecur,
    interval,
    frequency,
    days,
    bysetpos,
  } = event;

  const frequencyMap = {
    Daily: RRule.DAILY,
    Weekly: RRule.WEEKLY,
    Monthly: RRule.MONTHLY,
    Yearly: RRule.YEARLY,
  };

  const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const startRule = moment
    .utc(
      startRecur + ' ' + moment.utc(start).format('HH:mm'),
      'YYYY-MM-DD HH:mm',
    )
    .toDate();
  let endRule = moment.utc(endRecur).toDate();

  const ruleOptions = {
    freq: frequencyMap[frequency] || RRule.WEEKLY,
    interval: interval,
    byweekday: days.map((day) => RRule[dayMap[day]]),
    dtstart: startRule,
    until: endRule,
  };
  if (bysetpos) {
    ruleOptions.bysetpos = bysetpos;
  }

  const rule = new RRule(ruleOptions);
  const eventDates = rule.all();

  const untilString = moment(endRecur).subtract(1, 'day').endOf('day').format('YYYYMMDDTHHmmss[Z]')
  const byDayString = days.map((day) => dayMap[day]).join(',');
  const recurrenceRule = `FREQ=${frequency.toUpperCase()};INTERVAL=${interval};BYDAY=${byDayString};UNTIL=${untilString}`;

  const recurringEvents = eventDates.map((date) => {
    const withUpdatedDates = {
      ...event,
      start: momentTz.tz(event.start, timezone).format('HH:mm:ss'),
      end: momentTz.tz(event.end, timezone).format('HH:mm:ss'),
      startRecur: momentTz.tz(date, timezone).format('YYYY-MM-DD'),
      endRecur: momentTz.tz(date, timezone).format('YYYY-MM-DD'),
      recurrenceRule,
    };
    return withUpdatedDates;
  });

  const formattedEvents = [];

  // Recurring
  if (recurringEvents.length > 1) {
     recurringEvents.forEach((event, index) => {
      const convertedEvent = formatToBeCreatedEvent(
        recurringEventObjTemplate,
        event,
        index
      );
      formattedEvents.push(convertedEvent);
    });
  } else { // Non recurring
   const convertedEvent = formatToBeCreatedEvent(
      eventObjTemplate,
      { ...recurringEvents[0], recurrenceRule: '' },
      0
    );
    formattedEvents.push(convertedEvent);
  }

  return formattedEvents;
};
const getValidAuthorizations = (authorizations) => {
    const currentDate = new Date();

    return authorizations.filter(auth => {
        const endDate = new Date(auth.endDate);
        return endDate > currentDate && !auth.isExpired;
    });
};
function updateCreateEventsData(temp, clientData, empData) {
  temp.clientId = clientData.customId;
  temp.employeeId = empData.customId;
  temp.customAddressId = clientData.customAddressId;
  temp.customPayorClientId = clientData.customPayerId;
  temp.authorizationId = null;

  if (clientData.authorizationData?.length) {
    const validAuthorizations = getValidAuthorizations(clientData.authorizationData);
    if (validAuthorizations?.length) {
      temp.authorizationId = validAuthorizations[0].authorizationId;
    } else {
      temp.authorizationId = clientData.authorizationData[0].authorizationId
    }
  }

  return temp;
}

// Actions
async function addAppointment(payload, headers) {
  const url = 'https://api.theralytics.net/api/PatientAppointments/SavePatientAppointment'
  try {
    const response = await axios.post(url, payload, {
      headers: {
        ...headers.headers,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      params: {
        IsFinish: true,
        isAdmin: false,
        isMileageUpdatedByStaff: false,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding appointment:', error);
  }
}
async function getAppointmentsOfStaffs(headers, params) {
  try {
    const response = await axios.get('https://api.theralytics.net/api/PatientAppointments/GetPatientAppointmentList', {
      headers: {
        ...headers.headers,
        'Content-Type': 'application/json',
      },
      params: {
        ...params,
        locationIds: '4,6,1,5,2,3',
        isDisplayNumberOfHours: false,
      },
    });
    return response.data?.data ?? [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return null;
  }
}
async function getPatientDetails2(patientId, token) {
  const url = `https://api.theralytics.net/patients/GetPatientsDetails`;
  const params = { id: patientId };
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.get(url, { params, headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
}
async function deleteAppointment(headers, appointmentId) {
  const url = `https://api.theralytics.net/api/PatientAppointments/DeleteAppointment`;
  try {
    const response = await axios.patch(url, null, {
      headers: {
        ...headers.headers,
        'Content-Type': 'application/json',
      },
      params: {
        appointmentId,
        parentAppointmentId: null,
        deleteSeries: true,
        isAdmin: false,
      }
    });
    console.log('deleteAppointment response.data', response.data)
    return response.data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}
async function cancelAppointment(payload, headers) {
  try {
    const response = await axios.post('https://api.theralytics.net/api/PatientAppointments/CancelAppointments', payload, {
      headers: {
        ...headers.headers,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling appointment:', error);
  }
}
async function doActions(operations, token, filteredAbaUserData) {
  try {
    const createdEvents = operations.createdEvents;
    const deletedEvents = operations.deletedEvents;
    const updatedEvents = operations.updatedEvents;
    const canceledEvents = operations.canceledEvents;

    let createdEventsSuccessful = [];
    const failedEvents = [];

    for (let i = 0; i < updatedEvents.length; i++) {
      createdEvents.push(updatedEvents[i]);
      deletedEvents.push(updatedEvents[i]);
    }

    const createdEventsUpdated = createdEvents.map((data) => {
      const empData = filteredAbaUserData[data.employeeUuid];
      const clientData = filteredAbaUserData[data.clientUuid];
      return updateCreateEventsData(data, clientData, empData);
    });

    // TODO
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    if (deletedEvents.length > 0) {
      for (const event of deletedEvents) {
        await deleteAppointment(headers, event.eventIdCustom);
      }
    }

    if (createdEventsUpdated?.length) {
      for (const createdEvent of createdEventsUpdated) {
        if (createdEvent.address) {
          createdEvent.serviceAddress = createdEvent.address
        }
        if (!createdEvent.customAddressId) {
          const res = await getPatientDetails2(
            createdEvent.clientId,
            token,
          );

          const clientDetailed = res.data;
          const primaryAddress = clientDetailed.patientAddressesModel.find(address => address?.isPrimary);
          const clientAddress = clientDetailed.patientInfo?.[0]?.address;

          if (primaryAddress) {
            createdEvent.customAddressId = primaryAddress.addressID;
          }
          if (clientAddress) {
            createdEvent.serviceAddress = clientAddress
          }
        }

        const formattedEvent = generateRecurringOrNonRecurringEvents(createdEvent);

        const reqCretedEvent = await addAppointment(formattedEvent, headers);
        const payloadObj = { eventId: createdEvent.eventId, startDateTime: formattedEvent?.[0]?.startDateTime, patientID: formattedEvent?.[0]?.patientID }

         if (reqCretedEvent.statusCode === 200) {
           createdEventsSuccessful.push(payloadObj);
         } else {
           failedEvents.push({
            ...payloadObj,
            errorMessage: reqCretedEvent?.message ?? '',
           });
         }
      }

      // Get appointments
      const staffIds = createdEventsUpdated.map((ev) => ev.employeeId).join(',');
      const { fromDate, toDate } = findMinStartAndMaxEnd(createdEventsUpdated)
      const appointments = await getAppointmentsOfStaffs(headers, { staffIds, fromDate, toDate });

      createdEventsSuccessful = createdEventsSuccessful.map((ev) => {
        const matchedEvent = appointments.find((event) => {
          return event.startDateTime === ev.startDateTime && event.patientID === ev.patientID
        });
        if (matchedEvent) {
          return {
            ...ev,
            eventIdCustom: matchedEvent.patientAppointmentId
          } 
        }
        return ev;
      })
    }

    if (canceledEvents.length > 0) {
      let toBeCanceledEvents = []
      for (const event of canceledEvents) {
        const formattedEvent = generateRecurringOrNonRecurringEvents(event);
        toBeCanceledEvents = [...toBeCanceledEvents, ...formattedEvent]
      }

      // Get appointments
      let staffIds = canceledEvents.map((ev) => ev.employeeId).join(',');
      const { fromDate, toDate } = findMinStartAndMaxEnd(canceledEvents)
      const appointments = await getAppointmentsOfStaffs(headers, { staffIds, fromDate, toDate });

      const customEventIds = toBeCanceledEvents.map((ev) => {
        const matchedEvent = appointments.find((event) => event.startDateTime === ev.startDateTime && event.patientID === ev.patientID);
        return matchedEvent ? matchedEvent.patientAppointmentId : null;
      }).filter(ev => ev !== null);

      const cancelPayload = {
        CancelTypeId: 89,
        CancelReason: 'Sick',
        Ids: customEventIds,
      };
      await cancelAppointment(cancelPayload, headers);
    }

    return {
      createdEventsSuccessful,
      //
      failedEvents,
    };
  } catch (error) {
    console.log('error', error);
  }
}

// Actions
const checkTokenIsWorkingInTheralytics = async (token) => {
  const url = `/AppConfigurations/GetAppConfigurations`;
  const apiService = new ApiService(URL, token);

  try {
    const response = await apiService.get(url);
    return response.data.statusCode
  } catch (error) {
    console.error('Error fetching AppConfigurations:', error);
    throw error;
  }
};
const getUsersToken = async (req, res) => {
  try {
    // There is parameter `withCredentials: true | false`.
    // If true, then it is directly makes login request.
    // if false, then first it checks authTheralytics database to get user creds
    const withCredentials = req.body?.withCredentials ?? false;
    const ipaddress = req.body?.ipaddress ?? '';
    let credentials = req.body.credentials;

    let token = null;
    const existingUserCreds = await AuthIntegrationsDBApi.findBy({
      userId: req.currentUser.id,
      integratingSoftware: { [Op.in]: ['theralytics', ''] }
    });
    if (withCredentials) {
      if (
        !credentials.username ||
        !credentials?.password
      ) {
        const error = new Error('Login credentials are not proper!');
        error.statusCode = 401;
        throw error;
      }

      const loginBody = {
        ...credentials,
        username: credentials.username,
        password: credentials?.id
          ? decrypt(credentials.password)
          : credentials.password,
        ipaddress,
      };
      // Authenticate user and get token
      const loginRes = await AuthTheralytics.doLogin(loginBody);

      if (loginRes.question) {
        return loginRes
      }
      if (!loginRes.token) {
        const error = new Error('Invalid credentials!');
        error.statusCode = 401;
        throw error;
      }
      token = loginRes.token

      const toBeSaved = {
        ...loginBody,
        password: encrypt(loginBody.password),
        user: req.currentUser?.id,
        token: token,
        integratingSoftware: 'theralytics'
      };
      if (existingUserCreds) {
        AuthIntegrationsDBApi.update(existingUserCreds.id, toBeSaved, {
          currentUser: req.currentUser,
        });
      } else {
        AuthIntegrationsDBApi.create(toBeSaved, {
          currentUser: req.currentUser,
        });
      }
    }
    if (!withCredentials && !existingUserCreds) {
      const error = new Error('Please login to continue the operation!');
      error.statusCode = 404;
      throw error;
    }
    if (!withCredentials && existingUserCreds) {
      credentials = existingUserCreds;
      token = existingUserCreds?.token;

      if ((await checkTokenIsWorkingInTheralytics(token)) !== 200) {
        const error = new Error('Invalid credentials!');
        error.statusCode = 401;
        throw error;
      }
    }
    return { token };
  } catch (error) {
    throw error;
  }
}
const getPatientDetails = async (patientId, token) => {
  const url = `/patients/GetPatientsDetails`;
  const params = {
    id: patientId,
  };
  const apiService = new ApiService(URL, token);

  try {
    const response = await apiService.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};
const getAllAuthorizationsForPatient = async (
  patientId,
  pageNumber,
  pageSize,
  authType,
  token,
) => {
  const url = `/Authorizations/GetAllAuthorizationsForPatient`;
  const params = {
    patientId,
    pageNumber,
    pageSize,
    authType,
  };
  const apiService = new ApiService(URL, token);

  try {
    const response = await apiService.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching authorizations for patient:', error);
    throw error;
  }
};
const getPayerByPatientId = async (patientID, token) => {
  const url = `/GetPayerByPatientForAuthorization`;
  const params = {
    PatientID: patientID,
    Key: '',
  };
  const apiService = new ApiService(URL, token);

  try {
    const response = await apiService.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching payer by patient for authorization:', error);
    throw error;
  }
};
const getUserDetails = async (user, token) => {
  if (user.userType === 'employee') {
    return { ...user, customAddressId: null, customPayerId: null, insuranceCompanyId: null, authorizationData: null };
  }

  const patientDetails = await getPatientDetails(user.customId, token);
  const { patientAddressesModel } = patientDetails.data;
  const primaryAddress = patientAddressesModel.find(detail => detail.isPrimary);
  const addressId = primaryAddress ? primaryAddress.addressID : null;

  const patientPayerDetails = await getPayerByPatientId(user.customId, token);
  const payerDetails = patientPayerDetails.data[0];
  const customPayerId = payerDetails ? payerDetails.patientInsuranceId : null;
  const insuranceCompanyId = payerDetails ? payerDetails.insuranceCompanyId : null;

  const patientAuthorizationData = await getAllAuthorizationsForPatient(user.customId, 1, 100, null, token);
  const authorizationData = patientAuthorizationData.data.Authorization;

  return {
    ...user,
    customAddressId: addressId,
    customPayerId,
    insuranceCompanyId,
    authorizationData
  };
};
const getUsers = async (type = 'staff', url, token) => {
  const params = {
    pageNumber: 1,
    pageSize: 1000,
    LocationIDs: 0,
    ShowInactiveUsersOnly: 0,
    ShowInactiveClientsOnly: 0,
    sortColumn: 'firstName',
    sortOrder: 'asc'
  };

  const apiService = new ApiService(URL, token);

  try {
    const res = await apiService.get(url, { params })

    const users = res?.data?.data ?? [];
    if (users?.length) {
      return users.map((user) => ({
        id: type === 'staff' ? user?.staffID : user?.patientId,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
        userId: user?.userID,
        isActive: user.isActive ?? false,
      }))
    }
    return []

  } catch (error) {
    console.error('Error fetching inactive staff and patient data:', error);
    throw error;
  }
};
const getSystemUsers = async (filters) => {
  const { companyId, branches } = filters;

  // STEP 1: get roles
  // I use this role lists when I am checking the userType of each user
  let employeeRoleList = [];
  let clientRoleList = [];
  const roleHierarchy = await getRoleHierarchy(companyId);
  Object.entries(roleHierarchy).map((t) => {
    const [key, value] = t;
    if (value.includes('Client')) {
      clientRoleList.push(key);
    }
    if (value.includes('Employee')) {
      employeeRoleList.push(key);
    }
  });

  // STEP 2: Get users of branch
  const payload = await UsersDBApi.findAll({
    branches,
    companyId,
  });
  const allUsers = payload.rows;

  // STEP 3: Filter users by client, employee roles
  const filteredUsers = allUsers.map(user => {
    let userType = '';
    let isClient = user.roles.some((role) => clientRoleList.includes(role.name));
    let isEmployee = user.roles.some((role) => employeeRoleList.includes(role.name));

    if (isClient) userType = 'client';
    if (isEmployee) userType = 'employee';
    if (isClient || isEmployee) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userType,
      }
    }
    return null;
  }).filter(user => user !== null);
  const filteredUserIds = filteredUsers.map(u => u.id);

  // STEP 4: Find existing synced users from usersIntegrationData table
  let existingSyncedUsers = await UsersInegrationDataDBApi.findAllByUserIds({
    integratingSoftware: 'theralytics',
    userIds: filteredUserIds
  });

  return { existingSyncedUsers, branchUsers: filteredUsers }
}

const syncUsers = async (token, existingUsers) => {
  if (token) {
    const [staffs, patients] = await Promise.all([getUsers('staff', STAFFS_URL, token), getUsers('patient', PATIENTS_URL, token)])

    // Make users array
    const usersWithCustomIds = [
      ...mapUsersToIds(existingUsers, patients, 'client'),
      ...mapUsersToIds(existingUsers, staffs, 'employee')
    ];

    // Get extra data of each user
    const usersWithAuthorizationData = await Promise.all(usersWithCustomIds.map(user => getUserDetails(user, token)));

    return usersWithAuthorizationData;
  }
};


module.exports = {
  getUsersToken,
  syncUsers,
  checkTokenIsWorkingInTheralytics,
  getSystemUsers,
  doActions
}