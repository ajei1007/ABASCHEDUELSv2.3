const axios = require('axios');
const qs = require('qs');
const AuthIntegrationsDBApi = require('../../db/api/authIntegrations');

const db = require('../../db/models');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

const authentication_url =
  'https://id.rethinkbehavioralhealth.com/connect/token';
const BASE_URL = 'https://api.rethinkbehavioralhealth.com/api/v1';

const loginToRethink = async (credentials, currentUser) => {
  try {
    let token = null;
    const existingCompanyCreds = await AuthIntegrationsDBApi.findBy({
      companyId: currentUser.companyId,
      integratingSoftware: { [Op.in]: ['rethink', ''] },
    });

    // Authenticate user and get token
    const data = await authenticateToRethink(
      credentials?.clientId,
      credentials?.clientSecret,
      authentication_url,
    );

    if (!data) {
      return false;
    }

    let loginResp = JSON.parse(data);
    token = loginResp.access_token;

    const toBeSaved = {
      password: 'sample_it_cant_be_empty',
      username: 'sample_it_cant_be_empty',
      company: currentUser?.companyId,
      user: currentUser.id,
      token: token || '',
      integratingSoftware: 'rethink',
      credentials: {
        clientId: credentials?.clientId,
        clientSecret: credentials?.clientSecret,
      },
    };
    if (existingCompanyCreds) {
      AuthIntegrationsDBApi.update(existingCompanyCreds.id, toBeSaved, {
        currentUser: currentUser,
      });
    } else {
      AuthIntegrationsDBApi.create(toBeSaved, {
        currentUser: currentUser,
      });
    }
    return token;
  } catch (error) {
    throw error;
  }
};

const authenticateToRethink = async (client_id, client_secret, url) => {
  try {
    const data = qs.stringify({
      client_id: client_id,
      client_secret: client_secret,
      grant_type: 'client_credentials',
    });

    const config = {
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    const response = await axios(config);
    return JSON.stringify(response.data); // Return the stringified response data
  } catch (error) {
    return false
  }
};

const getEmployeeRethink = async (token, date) => {
  let actual_data = [];
  try {
    for (let page = 1; page < 1000; page++) {
      const url = `${BASE_URL}/Staffs/search?IncludeDeleted=false&After=${date}T00%3A00%3A00Z&PageSize=50&CurrentPage=${page}`;
      const config = {
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios(config);
      console.log('rethink.employee', page, response.data.count);

      if (response.data.count == 0) {
        break;
      }
      actual_data = [...actual_data, ...response.data.data];
    }
    return actual_data; // Return the stringified response data
  } catch (error) {
    console.error('Error getting staff:', error);
  }
};

const getClientRethink = async (token, date) => {
  let actual_data = [];
  try {
    for (let page = 1; page < 1000; page++) {
      const url = `${BASE_URL}/Clients/search?IncludeDeleted=false&After=${date}T00%3A00%3A00Z&PageSize=50&Page=${page}`;
      const config = {
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios(config);
      console.log('rethink.client', page, response.data.count);

      if (response.data.count == 0) {
        break;
      }
      actual_data = [...actual_data, ...response.data.data];
    }
    return actual_data; // Return the stringified response data
  } catch (error) {
    return actual_data; 
  }
};

const getFundersRethink = async (token) => {
  let actual_data = [];
  try {
    const url = `${BASE_URL}/Funders`;
    const config = {
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios(config);
    console.log('funder', response.data.length);

    
    actual_data = [...response.data];
    return actual_data; // Return the stringified response data
  } catch (error) {
    console.log('Error getting funders:', error);
  }
};

const getLocationsRethink = async (token) => {
  let actual_data = [];
  try {
    const url = `${BASE_URL}/Locations`;
    const config = {
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios(config);
    console.log('rethink.location', response.data.length);

    actual_data = [...response.data];
    return actual_data; // Return the stringified response data
  } catch (error) {
    console.log('Error getting locations:', error);
  }
}

const getRolesRethink = async (token) => {
  let actual_data = [];
  try {
    const url = `${BASE_URL}/StaffRoles/all`;
    const config = {
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios(config);
    console.log('rethink.role', response.data.length);

    actual_data = [...response.data];
    return actual_data; // Return the stringified response data
  } catch (error) {
    console.log('Error getting roles:', error);
  }
}

const getActivitiesRethink = async (token, date) => {
  let actual_data = [];
  try {
    for (let page = 1; page < 1000; page++) {
      const url = `${BASE_URL}/Services?IncludeDeleted=false&After=${date}T00%3A00%3A00Z&PageSize=50&CurrentPage=${page}`;
      const config = {
        method: 'get',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios(config);
      console.log('rethink.activity', page, response.data.count);

      if (response.data.count == 0) {
        break;
      }
      actual_data = [...actual_data, ...response.data.data];
    }
    return actual_data; // Return the stringified response data
  } catch (error) {
    console.error('Error getting activities:', error);
  }
}

const createAppointmentRethink = async (token, payload) => {
  console.log("🚀 ~ createAppointmentRethink ~ payload:", payload)
  try {
    const url = `${BASE_URL}/Appointments/add`;
    const config = {
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },  
      data: payload,
    };
    const response = await axios(config);

    const eventIdOther = response?.data?.id;
    if (eventIdOther) {
      const successObj = {
        eventIdOther,
        eventId: payload.eventId,
      };
      return successObj;
    }
    return null;
  } catch (error) {
    console.error('Error creating appointment:', error.response.data ?? 'Unknown Rethink error');
  }
};

const updateAppointmentRethink = async (token, payload) => {
  console.log("🚀 ~ updateAppointmentRethink ~ payload:", payload);
  try {
    const url = `${BASE_URL}/Appointments/update`;
    const config = {
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    };
    const response = await axios(config);

    // Rethink returns the updated record’s ID in data.id
    const eventIdOther = response?.data?.id;
    if (eventIdOther) {
      return {
        eventIdOther,
        eventId: payload.eventId,
      };
    }
    return null;
  } catch (error) {
    console.error(
      'Error updating appointment:',
      error.response?.data ?? error.message
    );
    return null;
  }
};

const deleteAppointmentRethink = async (token, payload) => {
  console.log("🚀 ~ deleteAppointmentRethink ~ payload:", payload);
  try {
    const url = `${BASE_URL}/Appointments/delete`;
    const config = {
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: [payload.appointmentId],
    };
    const response = await axios(config);
    console.log("🚀 ~ deleteAppointmentRethink ~ response?.data:", response?.data)

    // Rethink returns the updated record’s ID in data.id
    const status = response?.data?.status;
    if (status === 'success') {
      return {
        eventIdOther: payload.appointmentId,
        eventId: payload.eventId,
      };
    }
    return null;
  } catch (error) {
    console.error(
      'Error updating appointment:',
      error.response?.data ?? error.message
    );
    return null;
  }
};

const searchAppointmentsRethink = async (
  token,
  { After, ToDate, PageSize = 100, Page = 1 }
) => {
  const url = `${BASE_URL}/Appointments/search`;

  // Build params; include only defined values
  const queryParams = {
    IncludeDeleted: false,
  };
  if (After != null) queryParams.After = After;
  if (ToDate != null) queryParams.ToDate = ToDate;
  if (PageSize != null) queryParams.PageSize = PageSize;
  if (Page != null) queryParams.Page = Page;

  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
    });

    const data = response?.data ?? {};
    // API shape safety: try common property names
    const appointments = data.appointments || [];

    return {
      appointments,
      currentPage: data.currentPage,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      totalCount: data.totalCount,
    };
  } catch (error) {
    console.error(
      'Error searching appointments:',
      error.response?.data ?? error.message
    );
    return null;
  }
}

module.exports = {
  loginToRethink,
  getEmployeeRethink,
  getClientRethink,
  getFundersRethink,
  getLocationsRethink,
  getRolesRethink,
  getActivitiesRethink,
  createAppointmentRethink,
  updateAppointmentRethink,
  deleteAppointmentRethink,
  searchAppointmentsRethink
};
