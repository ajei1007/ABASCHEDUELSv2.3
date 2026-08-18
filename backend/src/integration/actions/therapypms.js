const axios = require('axios');
const AuthIntegrationsDBApi = require('../../db/api/authIntegrations');
const extractErrorMessage = require('../../utils/extractErrorMessage');

const db = require('../../db/models');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

const base_url = 'https://app.therapypms.com/api/aba-scheduler/admin';

/**
 * Authenticates with TherapyPMS API and stores credentials
 * @param {Object} credentials - Email and password for TherapyPMS
 * @param {Object} currentUser - Current user information
 * @returns {String|Boolean} - Access token or false if authentication fails
 */
const loginToTherapyPMS = async (credentials, currentUser) => {
  try {
    let token = null;
    const existingCompanyCreds = await AuthIntegrationsDBApi.findBy({
      companyId: currentUser.companyId,
      integratingSoftware: { [Op.in]: ['therapypms', ''] },
    });

    // Authenticate user and get token
    const data = await authenticateToTherapyPMS(
      credentials?.email,
      credentials?.password,
    );

    if (!data) {
      return false;
    }

    const loginResp = data;
    token = loginResp.access_token;

    const toBeSaved = {
      password: 'sample_it_cant_be_empty',
      username: 'sample_it_cant_be_empty',
      company: currentUser?.companyId,
      user: currentUser.id,
      token: token || '',
      integratingSoftware: 'therapypms',
      credentials: {
        email: credentials?.email,
        password: credentials?.password,
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
    console.error('Error logging into TherapyPMS:', error);
    throw error;
  }
};

/**
 * Authenticates to TherapyPMS API
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object|Boolean} - Response data or false if authentication fails
 */
const authenticateToTherapyPMS = async (email, password) => {
  try {
    const config = {
      method: 'post',
      url: `${base_url}/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        email,
        password,
      },
    };

    const response = await axios(config);
    
    if (response.data.status === 'success') {
      return response.data; // Return the response data directly
    } else {
      console.error('Authentication failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Error authenticating to TherapyPMS:', error);
    return false;
  }
};

/**
 * Fetches clients/patients from TherapyPMS
 * @param {String} token - Authentication token
 * @param {String} lastImportedDate - Date of last import (YYYY-MM-DD format)
 * @returns {Array} - List of clients/patients
 */
const getClientsTherapyPMS = async (token, lastImportedDate = null) => {
    try {
      const url = `${base_url}/get/patients/list`;

      const config = {
        method: 'post',
        url: url,
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        data: lastImportedDate ? { updated_after: lastImportedDate } : {},
      };
    
      const response = await axios(config);
      console.log('therapypms.client', response.data.patients.length);

      if (response.data.status === 'success' && response.data.patients) {
        return response.data.patients;
      } else {
        console.error('Failed to fetch clients:', response.data.message || 'Unknown error');
        return [];
      }        
    } catch (error) {
      console.error('Error fetching clients from TherapyPMS:', error.response?.data || error.message);
      return [];
    }
};


const getEmployeeTherapyPMS = async (token, lastImportedDate = null) => {
  try {
    const url = `${base_url}/get/providers/list`;

    const config = {
      method: 'post',
      url: url,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      data: lastImportedDate ? { updated_after: lastImportedDate } : {},
    };

    const response = await axios(config);
    console.log('therapypms.employee', response.data.providers?.length || 0);


    if (response.data.status === 'success'){
      return response.data.providers || [];
    } else {
      console.error('Failed to fetch employees:', response.data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching employees from TherapyPMS:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Fetches locations from TherapyPMS
 * @param {String} token - Authentication token
 * @param {String} lastImportedDate - Date of last import (YYYY-MM-DD format)
 * @returns {Array} - List of locations
 */
const getLocationsTherapyPMS = async (token, lastImportedDate = null) => {
  try {
    const url = `${base_url}/placeofservice/list`;

    const config = {
      method: 'post',
      url: url,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      data: lastImportedDate ? { updated_after: lastImportedDate } : {},
    };

    const response = await axios(config);

    if (response.data.status === 'success' && response.data.place_of_service) {
      return response.data.place_of_service;
    } else {
      console.error('Failed to fetch locations:', response.data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error fetching locations from TherapyPMS:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Creates or updates an appointment in TherapyPMS
 * @param {String} token           - Authentication token for TherapyPMS API
 * @param {Object} appointmentData - Appointment data payload matching TherapyPMS schema
 * @param {String} appointmentData.event_id - Internal event ID for mapping
 * @returns {Promise<Object|null>} Success object with mapped IDs, or null if no appointment ID returned
 * @throws {Error} When API request fails or returns error status
 */
const createAndUpdateAppointmentTherapyPMS = async (token, appointmentData) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  if (!appointmentData) {
    throw new Error('Appointment data is required');
  }

  try {
    const response = await axios({
      method: 'post',
      url: `${base_url}/appointment`,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      data: appointmentData,
    });

    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response from TherapyPMS API');
    }

    // Handle API-level errors
    if (response.data.status === 'error') {
      const errorMessage = response.data.msg || response.data.message || 'Unknown API error';
      throw new Error(`TherapyPMS API error: ${errorMessage}`);
    }

    // Extract appointment data from response
    const appointmentId = response.data?.original?.appointment_id;
    const recurringEventId = response.data?.original?.recurring_id;

    // Return mapped appointment data if appointment ID exists
    if (appointmentId) {
      return {
        eventIdOther: appointmentId,
        eventId: appointmentData.event_id,
        recurringEventIdOther: recurringEventId || null,
      };
    }

    // No appointment ID means the operation didn't create/update an appointment
    return null;
  } catch (error) {
    // Extract meaningful error message from various error sources
    const errorMessage = extractErrorMessage(error);
    throw new Error(`Failed to create/update appointment in TherapyPMS: ${errorMessage}`);
  }
};

/**
 * Creates/Updates an appointment in TherapyPMS
 * @param {String} token           - Authentication token
 * @param {Object} eventIdCustom, eventId
 */
const deleteAppointmentTherapyPMS = async (token, ev) => {
  try {
    const url = `${base_url}/appointment/delete`;

    const config = {
      method: 'delete',
      url,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      data: {
        appointment_id: Number(ev.appointment_id),
      },
    };
    const response = await axios(config);

    return {
      eventIdOther: ev.appointment_id,
      eventId: ev.event_id,
    };
  } catch (error) {
    console.log("🚀 ~ Error deleting appointment in TherapyPMS:", error.response?.data)
    return null;
  }
};

/**
 * Lists appointments from TherapyPMS.
 * - Single page: pass { all: false, page }
 * - All pages aggregated: pass { all: true, concurrency? }
 * Returns raw response for single-page; returns aggregated array for all-pages.
 * @param {String} token - Authentication token
 * @param {Object} filters - { start_date: 'YYYY-MM-DD', end_date: 'YYYY-MM-DD', client_ids?: number[], provider_ids?: number[], status?: string[], billable?: boolean, place_of_service?: string }
 * @param {Object} options - { all?: boolean, page?: number, concurrency?: number }
 */
const listAppointmentsTherapyPMS = async (token, filters, options = {}) => {
  const { all = false, page = 1, concurrency = 5 } = options || {};

  const requestPage = async (p) => {
    const url = `${base_url}/appointments/list${p > 1 ? `?page=${p}` : ''}`;
    const cfg = {
      method: 'post',
      url,
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      data: filters,
    };
    const resp = await axios(cfg);
    return resp.data;
  };

  try {
    if (!all) {
      return await requestPage(page);
    }

    const first = await requestPage(1);
    const fetchedAppointments = [...(first.data_all || [])];
    const lastPage = Number(first.pagination?.last_page || 1);
    if (lastPage <= 1) return fetchedAppointments;

    const remainingPages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2);
    // Batched parallel fetching with controlled concurrency
    for (let i = 0; i < remainingPages.length; i += concurrency) {
      const batch = remainingPages.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((p) => requestPage(p).catch((e) => ({ data_all: [], pagination: {} })))
      );
      for (const r of batchResults) fetchedAppointments.push(...(r.data_all || []));
    }

    return fetchedAppointments;
  } catch (error) {
    console.error('Error listing appointments from TherapyPMS:', error.response?.data || error.message);
    return all ? [] : { data_all: [], pagination: { total: 0, current_page: 1, last_page: 1 } };
  }
};

/**
 * Fetch the list of activity IDs for a single client.
 * @param {string} token
 * @param {number} clientId
 * @param {string} updatedAfter — ISO date string, e.g. evt.updatedAt
 * @returns {Promise<number[]>}
 */
async function fetchClientActivityIdsTherapyPMS(token, clientId, updatedAfter = '2022-07-04') {
  try {
    const resp = await axios.post(
      `${base_url}/patient/activity`,
      { client_id: clientId, updated_after: updatedAfter },
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );
    if (resp.data.activity_data) {
      return resp.data.activity_data.map(a => a.activity_id);
    }
    return [];
  } catch (error) {
    console.error(
      'Error fetching activities from TherapyPMS:',
      error.response?.data || error.message
    );
    return [];
  }
}

/**
 * Fetches activities from TherapyPMS
 * @param {String} token - Authentication token
 * @param {String} lastImportedDate - Date of last import (YYYY-MM-DD format)
 * @returns {Array} - List of activities
 */
const getActivitiesTherapyPMS = async (token, lastImportedDate = null) => {
  try {
    // We can't pass lastImportedDate to this function because it's not a patient activity
    const clients = await getClientsTherapyPMS(token);
    const activities = [];

    const requestUrl = `${base_url}/patient/activity`;

    const headers = {
      Authorization: token,
      'Content-Type': 'application/json',
    };

    await Promise.all(clients.map(async (client) => {
      const clientId = client.patient_id;

      const data = {
        client_id: clientId,
        ...(lastImportedDate && { updated_after: lastImportedDate }),
      };
      
      try {
        const response = await axios.post(requestUrl, data, { headers });

        const { status, activity_data } = response.data;
        if (status === 'success' && activity_data) {
          activities.push(...activity_data);
        }
      } catch (clientError) {
        console.warn(`Failed to fetch activities for client ${clientId}:`, clientError.response?.data || clientError.message);
      }
    }));

    console.log('therapypms.activities', activities.length);

    return activities;
  } catch (error) {
    console.error('Error fetching activities from TherapyPMS:', error.response?.data || error.message);
    return [];
  }
};

  
module.exports = {
  loginToTherapyPMS,
  getClientsTherapyPMS,
  getEmployeeTherapyPMS,
  getLocationsTherapyPMS,
  getActivitiesTherapyPMS,
  listAppointmentsTherapyPMS,
  createAndUpdateAppointmentTherapyPMS,
  deleteAppointmentTherapyPMS,
  fetchClientActivityIdsTherapyPMS,
};