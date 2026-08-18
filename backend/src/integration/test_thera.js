const puppeteer = require('puppeteer');
const axios = require('axios');
const moment = require('moment');
const { method } = require('lodash');

module.exports = class IntegrationTheralytics {
  static async login(filtered_events) {
    try {
      const add_payload = [
        {
          PatientAppointmentId: 0,
          AppointmentTypeID: 10,
          AppointmentStaffs: [
            {
              StaffId: 19,
              IsDeleted: false,
            },
          ],
          AppointmentSupervsieeStaffs: [],
          PatientID: 11,
          ServiceLocationID: 1,
          OfficeAddressID: null,
          PatientAddressID: 21,
          CustomAddressID: 8,
          CustomAddress: null,
          latitude: 26.1403369,
          longitude: -80.1836051,
          StartDateTime: '2024-05-01T08:30:00',
          EndDateTime: '2024-05-01T09:00:00',
          IsTelehealthAppointment: false,
          IsRecurrence: false,
          RecurrenceRule: '',
          IsClientRequired: true,
          IsBillableAppointment: true,
          IsBillable: true,
          Offset: -240,
          Timezone: 'Eastern Daylight Time',
          IsExcludedFromMileage: false,
          IsDirectService: true,
          DriveTime: null,
          PatientEncounterId: null,
          patientInsuranceId: 17,
          authorizationId: 19,
          serviceAddress:
            '1230 Northwest 29th Way , Fort Lauderdale, FL, US, 33311',
          IsExcludedFromPayroll: false,
          noteTypeId: 0,
          PayRateTypeId: null,
          ClinicalRoomId: null,
          IsClientCheckedIn: false,
          IsMakeUpSession: false,
          MakeUpSessionHours: null,
          IsRBTTracking: false,
          ModeOfMeetingId: null,
          SupervisionTypeId: null,
          IsObservedWithclient: false,
        },
      ];

      const convertAddPayload = (temp_payload, obj) => {
        temp_payload.AppointmentStaffs[0].StaffId = parseInt(obj.employeeId);
        temp_payload.PatientID = parseInt(obj.clientId);
        temp_payload.StartDateTime =
          obj.startRecur +
          'T' +
          moment(obj.start, 'HH:mm:ss').subtract(5, 'hours').format('HH:mm:ss');
        temp_payload.EndDateTime =
          obj.startRecur +
          'T' +
          moment(obj.end, 'HH:mm:ss').subtract(5, 'hours').format('HH:mm:ss');
        return temp_payload;
      };

      const addAppointment = async (payload, url, headers) => {
        try {
          console.log('Adding appointment...');

          const response = await axios.post(url, payload, {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });

          console.log('Appointment added successfully:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error adding appointment:', error);
        }
      };

      const getAppointments = async (url, headers) => {
        try {
          const response = await axios.get(url, {
            headers: headers,
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching appointments:', error);
          return null;
        }
      };

      const deleteAppointment = async (url, headers) => {
        try {
          console.log('Deleting headers:', headers);
          let temp_headers = headers;
          console.log('Deleting temp headers:', temp_headers.authorization);
          const response = await axios.patch(url, null, {
            headers: {
              ...headers,
              'Content-Type': 'application/json', // Add other necessary headers
              Authorization: temp_headers.authorization,
              //   'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJVc2VySUQiOiIzMCIsIlJvbGVJRCI6IjMiLCJVc2VyTmFtZSI6ImFkYW0uZGFuaWVscyIsIk9yZ2FuaXphdGlvbklEIjoiMjk0IiwiU3RhZmZJRCI6IjE5IiwiTG9jYXRpb25JRCI6IjEiLCJEb21haW5OYW1lIjoiYXV0aXNtY2VudGVyIiwic3ViIjoiYWRhbS5kYW5pZWxzIiwianRpIjoiZmI5ZDBjN2ItNjg5Zi00NzhjLTlmNjYtYmY3ZjI4ZDBmMTQ4IiwiaWF0IjoxNzE0NzU5MTA4LCJIZWFsdGhDYXJlIjoiSUFtQXV0aG9yaXplZCIsIm5iZiI6MTcxNDc1OTEwNywiZXhwIjoxNzE0NzYwMDA3LCJpc3MiOiJTdXBlckF3ZXNvbWVUb2tlblNlcnZlciIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTEyNjkvIiwicm9sZXMiOlsiQXV0aXNtIENlbnRlciBBZG1pbiJdfQ.',
            },
          });
          console.log('Appointment deleted successfully:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error deleting appointment:', error);
          throw error; // Throw the error to handle it in the calling code
        }
      };
      const cancelAppointment = async (payload, url, headers) => {
        try {
          console.log('Canceling appointment...');

          const response = await axios.post(url, payload, {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });

          console.log('Appointment canceled successfully:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error canceling appointment:', error);
        }
      };

      const activateAppointment = async (appointmentId, headers) => {
        try {
          const url = `https://api.theralytics.net/api/PatientAppointments/ActivateAppointments?appointmentId=${appointmentId}`;

          const response = await axios.patch(url, null, {
            headers: {
              ...headers,
              'Content-Type': 'application/json', // Add other necessary headers
            },
          });

          console.log('Appointment activated successfully:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error activating appointment:', error);
          throw error; // Throw the error to handle it in the calling code
        }
      }; // this is for reactivate canceled appointments

      const getWeekRange = (dateString) => {
        const inputDate = new Date(dateString);
        const startOfWeek = new Date(inputDate);
        const endOfWeek = new Date(inputDate);

        const diff = inputDate.getDay();
        startOfWeek.setDate(inputDate.getDate() - diff);
        endOfWeek.setDate(inputDate.getDate() - diff + 6);

        return {
          start_date: startOfWeek.toISOString().split('T')[0],
          end_date: endOfWeek.toISOString().split('T')[0],
        };
      };

      // URLS
      const add_url =
        'https://api.theralytics.net/api/PatientAppointments/SavePatientAppointment?IsFinish=true&isAdmin=false&isMileageUpdatedByStaff=false';

      const get_url = (locationIds, fromDate, toDate, staffIds) => {
        return `https://api.theralytics.net/api/PatientAppointments/GetPatientAppointmentList?locationIds=${locationIds}&fromDate=${fromDate}&toDate=${toDate}&staffIds=${staffIds}&isDisplayNumberOfHours=false`;
      };

      const delete_url = (appointment_id) => {
        return `https://api.theralytics.net/api/PatientAppointments/DeleteAppointment?appointmentId=${appointment_id}&parentAppointmentId=null&deleteSeries=null&isAdmin=false`;
      };

      const cancel_url =
        'https://api.theralytics.net/api/PatientAppointments/CancelAppointments';
      //urls

      const browser = await puppeteer.launch({
        headless: true,
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

      await page.goto(
        // 'https://webapp.rethinkbehavioralhealth.com/Healthcare#/Login',
        'https://autismcenter.theralytics.net/login',
      ); // Navigate to the login page
      console.log('ww1');
      // Wait for the login form to appear
      await page.waitForSelector('input[name="userName"]');
      await page.waitForSelector('input[type="password"]');
      console.log('ww2');

      // Fill in the login credentials
      await page.type('input[name="userName"]', 'adam.daniels');
      await page.type('input[type="password"]', 'Autism123!');
      console.log('ww3');

      // Click the login button
      await page.waitForSelector('button[type="submit"]');
      await page.click('button[type="submit"]');
      console.log('ww4');

      // await page.goto('https://autismcenter.theralytics.net/question');

      const questionSelector = 'div[tabindex="0"]';
      let questionOccur = false;
      try {
        await page.waitForSelector(questionSelector, { timeout: 10000 }); // Adjust timeout as needed
        console.log('Question is presented');
        questionOccur = true;
        // Handle the question here
      } catch (error) {
        console.log('No question presented within the timeout');
        // Continue with other actions if needed
      }
      // Click on the div to focus it
      if (page.url() !== 'https://autismcenter.theralytics.net/dashboard') {
        console.log('Page Url : ', page.url());
        await page.waitForSelector('div[tabindex="0"]');
        const elementHandle = await page.$('div[tabindex="0"]');
        await elementHandle.click();
        // await page.click('div[tabindex="0"]');

        // Wait for the options to appear
        // await page.waitForSelector('div[tabindex="0"] option');

        console.log('ok until here');

        // Select the desired option (replace "What is your pet's name?" with the text of the option you want to select)
        await page.waitForXPath('//span[@tabindex="1"]');
        console.log('ok until here 2');
        // Focus on the span element
        await page.focus('[tabindex="1"]');
        console.log('ok until here 3');
        // Perform actions on the focused element, such as clicking
        await page.waitForSelector('[tabindex="1"]');
        await page.click('[tabindex="1"]');

        await page.waitForSelector('input[name="Answer"]');
        await page.type('input[name="Answer"]', 'Mary');
        console.log('ok until here 4 ');
        await page.waitForSelector('button[type="submit"]');
        await page.click('button[type="submit"]');
      }

      // Wait for navigation to complete
      console.log('Successfully logged in');
      // await page.waitForNavigation();

      await page.goto('https://autismcenter.theralytics.net/scheduling');
      const loginPromise = new Promise((resolve, reject) => {
        page.on('request', async (interceptedRequest) => {
          // async request
          if (
            interceptedRequest.url().includes(
              // 'https://api.theralytics.net/GetUserByToken'
              'https://api.theralytics.net/api/MasterData/MasterDataByName', // with this url sometimes can not get the bearer token
              // 'https://api.theralytics.net/AdminDashboard/GetAdminDashboardData', // if you want to use this url you have to use 'response' instead of 'request' (not tested fully)
            )
          ) {
            const my_headers = interceptedRequest.headers();
            console.log('here we are: ', filtered_events);
            console.log('URL:', interceptedRequest.url());
            console.log('Request_Headers:', my_headers);
            // const headersObject = JSON.parse(my_headers);
            if ('authorization' in my_headers) {
              console.log('Authorization Header:', my_headers.authorization);
            } else {
              console.log('Authorization Header is not present.');
            }
            // console.log('Requests_cookie:', my_new_cookie);

            const headers = my_headers;
            const create_events_data = filtered_events.create_events;
            const delete_events_data = filtered_events.delete_events;
            const update_events_data = filtered_events.update_events;
            const cancel_events_data = filtered_events.cancel_events;
            const create_events_actual = [];
            const RetrieveEventsData = [];

            const create_appointment = async (
              data,
              raw_data,
              data_actual = [],
            ) => {
              let event = undefined;
              let url = add_url;
              let method = 'post';
              let loc_id = data[0].ServiceLocationID;
              let staff_id = data[0].AppointmentStaffs[0].StaffId;
              const week_range = getWeekRange(
                data[0].StartDateTime.slice(0, 10),
              );
              let start_date = week_range.start_date;
              let end_date = week_range.end_date;
              let success = false;
              // let headers = my_headers;
              // console.log('foomy', data);
              await axios({ url, method, headers, data })
                .then((response) => {
                  if (response.data?.statusCode) {
                    success = true;
                    // const success_obj = {
                    //   cr_eventId: response.data.appointment.course,
                    //   cacheDate: response.data.cacheDate,
                    //   eventId: data_actual.eventId,
                    // };
                    // event = success_obj;
                    // created_events_successful.push(success_obj);
                  }
                })
                .catch((error) => console.error('Error:', error));
              console.log('woomy : ', success);
              if (success) {
                console.log('success : ', success);
                const weeklyAppointments = await getAppointments(
                  get_url(loc_id, start_date, end_date, staff_id),
                  headers,
                );
                console.log('Weekly Appointments : ', weeklyAppointments);
                for (let ii = 0; ii < weeklyAppointments.data.length; ii++) {
                  console.log(
                    'Weekly Appointments [',
                    ii,
                    ']: ',
                    weeklyAppointments.data[ii],
                    data[0],
                  );
                  if (
                    weeklyAppointments.data[ii].startDateTime ==
                      data[0].StartDateTime &&
                    weeklyAppointments.data[ii].endDateTime ==
                      data[0].EndDateTime &&
                    weeklyAppointments.data[ii].patientID == data[0].PatientID
                  ) {
                    const success_obj = {
                      cr_eventId:
                        weeklyAppointments.data[ii].patientAppointmentId,
                      cacheDate: null,
                      eventId: raw_data.eventId,
                    };
                    console.log('Matched : ', weeklyAppointments.data[ii]);
                    created_events_successful.push(success_obj); // pushed object must be modified
                    event = success_obj;
                    break;
                  }
                }
              } else {
                const fail_obj = {
                  eventId: raw_data.eventId,
                  cacheDate: null,
                  data: null,
                };
                // console.log('cliffy', JSON.stringify(response.data));
                created_events_failed.push(fail_obj);
                event = fail_obj;
              }
              return event;
            };

            const delete_appointment = async (
              data,
              del_url,
              data_actual = [],
            ) => {
              let event = {};
              let method = 'patch';
              let url = del_url;
              let headers = my_headers;
              console.log('meep_delete', data);
              await axios({ url, method, headers })
                .then((response) => {
                  if (response.statusCode) {
                    console.log('soomer', response.data);
                    const success_obj = {
                      cacheDate: null,
                      cr_eventId: data.eventIdCustom,
                      eventId: data.eventId,
                    };
                    event = success_obj;
                    deleted_events_successful.push(success_obj);
                  } else {
                    const fail_obj = {
                      eventId: data.eventId,
                      cacheDate: null,
                      data: data,
                    };
                    deleted_events_failed.push(fail_obj);
                    event = fail_obj;
                  }
                })
                .catch((error) => console.error('Error:', error));
              return event;
            };

            console.log('bb : ', filtered_events.create_events.length);

            let addedEvents = 0;

            if (create_events_data.length > 0) {
              for (let index = 0; index < create_events_data.length; index++) {
                console.log('Creating : ', index);

                let req_payload = [
                  convertAddPayload(add_payload[0], create_events_data[index]),
                ];
                try {
                  addedEvents += 1;
                  // await addAppointment(req_payload, add_url, headers);
                  create_appointment(req_payload, create_events_data[index]);
                } catch (e) {
                  console.log('Adding Error', e);
                }
              }
            }
            if (delete_events_data.length > 0) {
              console.log('Deleting Started');
              for (let index = 0; index < delete_events_data.length; index++) {
                let event_id = parseInt(
                  delete_events_data[index].eventIdCustom,
                );
                let del_url = delete_url(event_id);
                console.log('Delete URL : ', del_url);
                // let delete_app = await deleteAppointment(del_url, headers);
                let delete_app = await delete_appointment(
                  delete_events_data[index],
                  del_url,
                );
              }
            }
            // if (cancel_events_data.length > 0) {
            //   console.log('Cancelling...');
            //   for (let index = 0; index < cancel_events_data.length; index++) {
            //     let cancel_payload = {
            //       CancelTypeId: 89,
            //       CancelReason: 'Sick',
            //       Ids: [cancel_events_data[index].eventIdCustom],
            //     };
            //     await cancelAppointment(cancel_payload, cancel_url, headers);
            //   }
            // }
            // console.log('headers: ' + headers);
            console.log('Number of events added: ', addedEvents);

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
      console.log('Page Url : ', page.url());
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
    } catch (e) {
      console.error('', e);
    }
  }
};
