const puppeteer = require('puppeteer'); // puppeteer is for auto login and get headers and cookies
const axios = require('axios');
const moment = require('moment'); // This library used for parsing, validating, manipulating, and formatting dates.

module.exports = class IntegrationCR {
  static async login(filtered_events) {
    console.log('smikky', filtered_events);
    const delete_event_json = (e, type, cancel = false) => {
      // this function is for deleting events with given event,type and cancel is false for defualt
      //type = "course/delete" or "event/delete"
      const date = e.startRecur; //"2024-04-05"
      const course = Number(e.course); //203223783
      let url = 'https://members.centralreach.com/api/?scheduling.deletecourse';
      if (type == 'event/delete') {
        url = 'https://members.centralreach.com/api/?scheduling.deleteevent';
      }
      let obj = {
        course: course,
        date: date,
        reason: 0,
        reasonName: '',
        note: '',
        _track: {
          channel: 'scheduling',
          action: type,
          source: 'Desktop',
          latitude: 0,
          longitude: 0,
          metric: 0,
        },
        _utcOffsetMinutes: 240,
      };
      if (cancel) {
        const reason = 1; //e.reason //1
        const reasonName = 'Client Cancellation'; // e.reasonName //"Client Cancellation"
        obj = { ...obj, reason: reason, reasonName: reasonName };
      }
      return [e, JSON.stringify(obj)];
    }; // Got it delete_event_json function fully

    function convertUtcToSeconds(utcTimeString, timezone, date) {
      // Parse the UTC time string to a Date object
      const utcDate = new Date(`${date}T${utcTimeString}Z`); //`1970-01-01T${utcTimeString}Z`

      // Use Intl.DateTimeFormat to format the date in the specified timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      // Extract the local time string
      const localTimeString = formatter.format(utcDate);
      // Extract hours and minutes from the local time string
      let [hours, minutes] = localTimeString.split(':').map(Number);
      // Calculate total minutes past midnight
      const totalMinutes = hours * 60 + minutes;
      const totalSeconds = totalMinutes * 60;
      return totalSeconds;
    } // This is basically Utc conversion function it take Z time and converts to seconds. Got it

    const event_json = (e, op) => {
      //type is "addcourse" or "updateevent" or "updatecourse"
      let startDate = e.startRecur; //"2024-06-27"
      let endDate = e.endRecur; //"2024-06-27"
      endDate = moment(endDate, 'YYYY-MM-DD');
      endDate.subtract(1, 'days');
      endDate = endDate.format('YYYY-MM-DD');
      const timezone = 'America/New_York';
      const startTime = convertUtcToSeconds(e.start, timezone, startDate); //62100, 12am = 0 and every minute adds 60
      const endTime = convertUtcToSeconds(e.end, timezone, startDate); //64800
      const principal1 = e.employeeId; //3238882 , therapist id, Adam Daniel
      const principal2 = Number(e.clientId); //1928596, Client Test id
      const duration = e.duration; //duration, in seconds
      const type = Number(e.activityId); //16521285 direct therapy id
      //const type = e.type //16521285 , Activity id
      let obj = {
        op: op,
        date: startDate,
        startDate: startDate,
        note: '',
        startTime: startTime,
        endTime: endTime,
        principal1: principal1,
        principal2: principal2,
        participants: '',
        billing: `<a><s><l>${duration}</l><c>0</c><a>0</a></s></a>`,
        eventLabels: '',
        courseLabels: '',
        hidden: false,
        placeOfServiceId: '',
        timeZone: 'America/New_York',
        userTimeZone: 'America/New_York',
        type: type,
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
        _utcOffsetMinutes: 240,
      };
      if (op == 'updateevent' || op == 'updatecourse') {
        const course = Number(e.course); //id of CR event (course)
        obj = {
          ...obj,
          course: course,
          isCanceledUpdate: false,
          isEventRecover: false,
        };
      }
      if (e.recurring) {
        const rules = e.rules; // "0,1,2,3,4,5,6"
        // Convert start date to a Moment object
        let currentDate = moment(startDate);
        let daysArray = rules.split(',').map((t) => Number(t));

        // Check if the day of week of the start date is in the days array
        let i = 0;
        console.log('seever1', daysArray, currentDate.day());
        while (
          (i < 10) & (daysArray.length > 0) &&
          !daysArray.includes(currentDate.day())
        ) {
          // If not in the array, add one day
          console.log('foomer');
          currentDate.add(1, 'days');
          i = i + 1;
        }
        startDate = currentDate.format('YYYY-MM-DD');
        const interval = e.interval; //1
        //const period = e.period // 2
        const period = 2;

        obj = {
          ...obj,
          startDate: startDate,
          date: startDate,
          interval: interval,
          newRepeatSummary: '',
          oldRepeatSummary: '',
          period: period,
          rules: rules,
        };
        if (e.repetitions) {
          const repetitions = e.repetitions; //5 times
          obj = { ...obj, repetitions: repetitions };
        } else {
          obj = { ...obj, endDate: endDate };
        }
      }

      return [e, JSON.stringify(obj)];
    }; // Got it this is for adding events if it is recurring

    const created_events_successful = [];
    const updated_events_successful = [];
    const canceled_events_successful = [];
    const deleted_events_successful = [];

    const created_events_failed = [];
    const updated_events_failed = [];
    const canceled_events_failed = [];
    const deleted_events_failed = [];

    const browser = await puppeteer.launch({ headless: true }); // Set headless: true to run browser in the background
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 720 });

    const loginCompletionPromise = new Promise((resolve, reject) => {
      page.on('request', async (interceptedRequest) => {
        // Filter out the request of interest, for example by URL or type
        //if (interceptedRequest.url().includes('/your-form-submission-endpoint') && interceptedRequest.method() === 'POST') {
        if (
          interceptedRequest
            .url()
            .includes(
              'https://members.centralreach.com/api/?contacts.loadcontactdetails',
            )
        ) {
          const headers = interceptedRequest.headers();
          //const requestBody = interceptedRequest.postData();
          const cookies = await page.cookies();

          // Log or process the request details
          console.log('here we are: ');
          console.log('URL:', interceptedRequest.url());
          let url = '';
          let method = '';

          //create event
          url = 'https://members.centralreach.com/api/?scheduling.addcourse';
          method = 'post'; // axios uses lowercase methods
          let data_arr_created = filtered_events.create_events.map((event) =>
            event_json(event, 'addcourse'),
          );
          let data_arr_updated = filtered_events.update_events.map((event) =>
            event_json(event, 'updatecourse'),
          );
          let data_arr_deleted = filtered_events.delete_events.map((event) =>
            delete_event_json(event, 'course/delete'),
          );
          let data_arr_canceled = filtered_events.cancel_events.map((event) =>
            delete_event_json(event, 'course/delete', true),
          );
          //let data = [{ "op": "addcourse", "startDate": "2024-06-27", "startTime": 62100, "endTime": 64800, "principal1": 3238882, "principal2": 1928596, "participants": "", "billing": "<a><s><l>2700</l><c>0</c><a>0</a></s></a>", "eventLabels": "", "courseLabels": "", "hidden": false, "placeOfServiceId": "", "timeZone": "America/New_York", "userTimeZone": "America/New_York", "type": 16521285, "qualificationWarningsOverridden": false, "feeScheduleRateIds": [], "_track": { "channel": "scheduling", "action": "event/update", "source": "Desktop", "latitude": 0, "longitude": 0, "metric": 0 }, "_utcOffsetMinutes": 240 }]
          const cookieString = cookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join('; ');

          // Include cookies in the headers
          headers['Cookie'] = cookieString;

          // Use axios to make the request
          //await setTimeout(1000);
          console.log('soomer_created', data_arr_created);
          console.log('soomer_updated', data_arr_updated);
          console.log('soomer_canceled', data_arr_canceled);
          console.log('soomer_deleted', data_arr_deleted);
          let data = [];
          let data_actual = [];

          const loadEvent = async (course, date) => {
            url = 'https://members.centralreach.com/api/?scheduling.loadevent';
            data = {
              course: course,
              userTimeZone: 'America/New_York',
              includeInactive: true,
              date: date,
              _track: {
                channel: 'scheduling',
                action: 'event',
                source: 'Desktop',
                latitude: 0,
                longitude: 0,
                metric: 0,
              },
              _utcOffsetMinutes: 240,
            };
            let event = '';
            await axios({ url, method, headers, data })
              .then((response) => {
                event = response.data;
              })
              .catch((error) => console.error('Error:', error));
            return event;
          };

          const create_appointment = async (data, data_actual = []) => {
            let event = undefined;
            url = `https://members.centralreach.com/api/?scheduling.addcourse`;
            console.log('foomy', data);
            await axios({ url, method, headers, data })
              .then((response) => {
                if (
                  response.data?.success &&
                  response.data?.appointment?.course
                ) {
                  console.log('fooby', response.data);
                  const success_obj = {
                    cr_eventId: response.data.appointment.course,
                    cacheDate: response.data.cacheDate,
                    eventId: data_actual.eventId,
                  };
                  event = success_obj;
                  created_events_successful.push(success_obj);
                } else {
                  const fail_obj = {
                    eventId: data_actual.eventId,
                    cacheDate: response.data.cacheDate,
                    data: response.data,
                  };
                  console.log('cliffy', JSON.stringify(response.data));
                  created_events_failed.push(fail_obj);
                  event = fail_obj;
                }
              })
              .catch((error) => console.error('Error:', error));
            return event;
          };

          const delete_appointment = async (data, data_actual = []) => {
            let event = {};
            url = `https://members.centralreach.com/api/?scheduling.deletecourse`;
            console.log('meep_delete', data);
            await axios({ url, method, headers, data })
              .then((response) => {
                if (response.data?.cacheDate) {
                  console.log('soomer', response.data);
                  const success_obj = {
                    cacheDate: response.data.cacheDate,
                    cr_eventId: response.data.course,
                    eventId: data_actual?.eventId,
                  };
                  event = success_obj;
                  deleted_events_successful.push(success_obj);
                } else {
                  const fail_obj = {
                    eventId: data_actual?.eventId,
                    cacheDate: response.data.cacheDate,
                    data: response.data,
                  };
                  deleted_events_failed.push(fail_obj);
                  event = fail_obj;
                }
              })
              .catch((error) => console.error('Error:', error));
            return event;
          };

          //CREATE EVENT
          for (let index = 0; index < data_arr_created.length; index++) {
            data = data_arr_created[index][1];
            data_actual = data_arr_created[index][0];
            await create_appointment(data, data_actual);
          }

          //CANCEL EVENT
          let data_real = [];
          let combined_arr = [
            ...data_arr_canceled,
            ...data_arr_deleted,
            ...data_arr_updated,
          ];
          for (let index = 0; index < combined_arr.length; index++) {
            data = combined_arr[index][1];
            data_real = JSON.parse(
              JSON.stringify(JSON.parse(combined_arr[index][1])),
            );
            data_actual = JSON.parse(JSON.stringify(combined_arr[index][0]));
            url =
              'https://members.centralreach.com/api/?scheduling.deletecourse';
            console.log('meep_cancel', data);
            let event = await loadEvent(
              data_actual.course,
              data_actual.startRecur,
            );
            if (event.appointment) {
              let startDate = moment(
                event.appointment.startDate,
                'MM/DD/YYYY HH:mm:ss',
              ).format('YYYY-MM-DD');
              let dEvent = delete_event_json(
                { course: data_actual.course, startRecur: startDate },
                'event/delete',
              );
              await delete_appointment(dEvent[1], data_actual);
            }
            let cEvent = event_json(data_actual, 'addcourse');
            // const arr_act =
            //   data_real['op'] == 'updatecourse' ? data_actual : [];
            const arr_act = data_actual;
            let created_appointment = await create_appointment(
              cEvent[1],
              arr_act,
            );
            const op2 = data_real['op'];
            console.log('soover', data_real['op']);
            if (!created_appointment || data_real['op'] == 'updatecourse') {
              continue;
            }
            console.log('soover2', data_real['op']);

            // event = await loadEvent(created_appointment.cr_eventId, JSON.parse(cEvent[1])['date'])
            // console.log('freedom', cEvent[1], JSON.parse(cEvent[1])['date'], event);
            data_real['course'] = created_appointment.cr_eventId;
            data_real['_track']['action'] = 'course/delete';
            data_real['_track']['source'] = 'Mobile';
            data = JSON.stringify(data_real);
            //await setTimeout(1000);
            url =
              'https://members.centralreach.com/api/?scheduling.deletecourse';
            console.log(
              'soovy',
              url,
              created_appointment.cr_eventId,
              created_appointment,
              data,
            );
            await axios({ url, method, headers, data })
              .then((response) => {
                if (response.data?.cacheDate) {
                  console.log('sooby', response.data);
                  const success_obj = {
                    cacheDate: response.data.cacheDate,
                    cr_eventId: response.data.course,
                    eventId: data_actual.eventId,
                  };
                  canceled_events_successful.push(success_obj);
                } else {
                  const fail_obj = {
                    eventId: data_actual.eventId,
                    cacheDate: response.data.cacheDate,
                    data: response.data,
                  };
                  canceled_events_failed.push(fail_obj);
                }
              })
              .catch((error) => console.error('Error:', error));
          }
          //await browser.close();
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
      // You might also want to handle possible errors by rejecting the promise
      page.on('error', (error) => {
        reject(error);
      });

      // Timeout or other conditions to reject the promise can also be added
    });

    // const response = await page.goto(
    //     'https://members.centralreach.com/#scheduling/dayplanner/',
    // ); // Change URL to the login page of the website you want to access

    const response = await page.goto(
      'https://members.centralreach.com/#account',
    ); // Change URL to the login page of the website you want to access
    console.log('fleemer1');

    // Replace '#username' and '#password' with the selectors for the username and password fields
    await page.waitForSelector('#Username');
    console.log('fleemer2');
    await page.type('#Username', 'silver.inventor@gmail.com'); // Replace 'yourUsername' with your actual username
    console.log('fleemer3');
    await page.type('#Password', 'e6?wFTJiB*9tv?6'); // Replace 'yourPassword' with your actual password

    // Replace 'button.login' with the selector for the login button
    await page.click('#login'); // You might need to adjust this if the page uses a different element to submit

    // Wait for navigation after login (optional, depends on the website's behavior)
    await page.waitForNavigation();

    try {
      //await page.click('.logged-in-single-device-continue-to-login');
      const continueSelector = '.logged-in-single-device-continue-to-login';
      await page.waitForSelector(continueSelector, {
        timeout: 5000,
      });
      await page.click(continueSelector);
    } catch (e) {
      console.log('Button not found');
    }
    // Get cookies

    return loginCompletionPromise
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
  }
};
