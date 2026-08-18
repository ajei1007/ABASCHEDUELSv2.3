const config = require('../config');
const puppeteer = require('puppeteer');

module.exports = class IntegrationCR {
  static async login(filtered_events) {
    const created_events_successful = [];
    const updated_events_successful = [];
    const canceled_events_successful = [];
    const deleted_events_successful = [];

    const browser = await puppeteer.launch({
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

    await page.goto('https://members.centralreach.com/#scheduling/dayplanner/'); // Change URL to the login page of the website you want to access
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
      await page.waitForXPath(
        '//span[contains(@class, "MuiButton-label") and contains(text(), "Continue To Login")]',
        {
          timeout: 5000,
        },
      );
    } catch (e) {}

    let [button] = await page.$x(
      "//span[contains(@class, 'MuiButton-label') and contains(text(), 'Continue To Login')]",
    );

    try {
      await button.click();
    } catch (e) {
      console.log('Button not found');
    }

    // if (button) {
    //   // Click the button if it was found
    //   await button.click();
    // } else {
    //   console.log('Button not found');
    // }
    console.log('hetho1');
    const change_date = async (date) => {
      // await page.waitForSelector('#appt-date');
      // await page.click('#appt-date');
      // await page.type('#appt-date', date);
      // await page.keyboard.press('Enter');

      await page.waitForSelector('#appt-date');
      await page.focus('#appt-date');
      await page.keyboard.press('End'); // Move cursor to the end
      await page.keyboard.down('Shift');
      await page.keyboard.press('Home'); // Select everything by holding Shift and pressing Home
      await page.keyboard.up('Shift');
      await page.keyboard.press('Backspace'); // Delete the selected text
      //await page.waitForTimeout(500); // Adjust time as needed
      await page.type('#appt-date', date);
      // await page.waitForTimeout(500); // Adjust time as needed
    };

    function convertUtcToMinutes(utcTimeString, timezone) {
      // Parse the UTC time string to a Date object
      const utcDate = new Date(`1970-01-01T${utcTimeString}Z`);

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
      const [hours, minutes] = localTimeString.split(':').map(Number);
      // Calculate total minutes past midnight
      const totalMinutes = hours * 60 + minutes;
      return totalMinutes;
    }

    const change_time = async (num, time) => {
      //#tab-details > div:nth-child(2) > div > div:nth-child(2) > div > div.inline-block.width-full-xs.flex-xs.margin-md-top-xs.time-input-wrapper.sched-datetime-item > span:nth-child(1) > input
      //#tab-details > div:nth-child(2) > div > div:nth-child(2) > div > div.inline-block.width-full-xs.flex-xs.margin-md-top-xs.time-input-wrapper.sched-datetime-item > span:nth-child(3) > input
      await page.waitForSelector('.time-input-wrapper');

      // Step 1: Click the first time picker dropdown
      await page.click(
        `.time-input-wrapper .time-input:nth-of-type(${num}) .time-input-caret`,
      );
      //const timeDropdownTrigger = `.time-input-wrapper:nth-of-type(${num}) .time-input-caret`;
      //await page.waitForSelector(timeDropdownTrigger);
      //await page.click(timeDropdownTrigger);
      //await page.waitForTimeout(100); // Adjust time as needed
      // Example usage:
      const timezone = 'America/New_York';
      const utcTimeString = '18:00:00';
      const minutesPastMidnight = convertUtcToMinutes(time, timezone);
      console.log(minutesPastMidnight); // This will print the total minutes past midnight for 6 PM UTC in America/New_York timezone
      //let timeOptionSelector = `.time-input.dropdown ul.times li[data-time="${minutesPastMidnight}"]`;
      await page.waitForSelector(
        `.time-input-wrapper .time-input:nth-of-type(${num}) .dropdown-menu li[data-time="${minutesPastMidnight}"]`,
      );
      console.log('hemmy1');
      await page.waitForTimeout(500); // Adjust time as needed
      await page.click(
        `.time-input-wrapper .time-input:nth-of-type(${num}) .dropdown-menu li[data-time="${minutesPastMidnight}"]`,
      );
      console.log('hemmy2');
      await page.waitForTimeout(100); // Adjust time as needed
      // await page.waitForSelector(timeOptionSelector);
      // await page.click(timeOptionSelector);
    };

    const change_start_time = async (time) => change_time(1, time);

    const change_end_time = async (time) => change_time(2, time);

    const accept_overlap = async () => {
      const selector =
        'input[type="checkbox"][data-bind="checked: acceptOverlapWarnings"]';

      try {
        await page.waitForSelector(
          'input[type="checkbox"][data-bind="checked: acceptOverlapWarnings"]',
          {
            visible: true,
            timeout: 1000,
          },
        );
      } catch (e) {}
      // Find the checkbox
      const checkbox = await page.$(selector);

      // If the checkbox exists, click it
      if (checkbox) {
        console.log('kooky', checkbox);
        try {
          await page.click(selector);
        } catch (e) {}
        console.log('Checkbox found and clicked.');
      } else {
        console.log('Checkbox not found.');
      }
    };

    const add_therapist = async (id) => {
      // await page.waitForSelector('#s2id_autogen19');
      // await page.type('#s2id_autogen19', id);
      await page.waitForTimeout(500);
      await page.waitForSelector('#s2id_appt-provider > a');
      await page.click('#s2id_appt-provider > a');
      await page.waitForSelector('.select2-input.select2-focused');
      await page.type('.select2-input.select2-focused', id);
      await page.waitForTimeout(1000); // Adjust time as needed
      await page.keyboard.press('Enter');
    };

    const add_client = async (id) => {
      await page.waitForTimeout(500);
      await page.waitForSelector('#s2id_appt-attendee > a');
      await page.click('#s2id_appt-attendee > a');
      await page.waitForSelector('.select2-input.select2-focused');
      await page.type('.select2-input.select2-focused', id);
      await page.waitForTimeout(1000); // Adjust time as needed
      await page.keyboard.press('Enter');
    };

    const add_activity = async (id) => {
      // The ID of the <select> tag
      const selectId = 'appt-types';
      await page.evaluate(
        (id, value) => {
          document.querySelector(`#${id}`).value = value;
          // Trigger change event in case the page relies on it
          const event = new Event('change', { bubbles: true });
          document.querySelector(`#${id}`).dispatchEvent(event);
        },
        selectId,
        id,
      );
    };

    const add_cancel_reason = async (id) => {
      // The ID of the <select> tag
      const selectId = 'form-control.margin-md-bottom[data-bind*="reason"]';
      await page.evaluate(
        (id, value) => {
          document.querySelector(`.${id}`).value = value;
          // Trigger change event in case the page relies on it
          const event = new Event('change', { bubbles: true });
          document.querySelector(`.${id}`).dispatchEvent(event);
        },
        selectId,
        id,
      );
    };

    const add_cancel_reason_input = async (text) => {
      const elements = await page.$$('.form-control[data-bind*="note"]');

      // Ensure there is at least one element
      if (elements.length > 0) {
        // Target the last element in the array
        const lastElement = elements[elements.length - 1];

        // Type the text into the last element
        await lastElement.type(text);
      } else {
        console.log('No elements found matching the selector');
      }
      //await page.click('.form-control[data-bind*="note"]');
      //await page.type('.form-control[data-bind*="note"]', text);
      // const elements = await page.$x(
      //   "//input[contains(@class, 'form-control') and @type='text' and contains(@placeholder, 'Please provide an optional reason')]",
      // );
      // if (elements.length > 0) {
      //   await elements[0].type('other');
      // } else {
      //   console.log('Element not found');
      // }
    };

    const click_save = async () => {
      await page.waitForSelector(
        'button.btn.btn-primary.no-disable-during[data-bind*="click: saveNew"]',
        { visible: true, timeout: 300 },
      );

      await page.click(
        'button.btn.btn-primary.no-disable-during[data-bind*="click: saveNew"]',
      );
    };

    const click_update = async () => {
      await page.waitForSelector(
        'button.btn.btn-primary.no-disable-during[data-bind*="click: runSaveModal"]',
        { visible: true, timeout: 300 },
      );

      await page.click(
        'button.btn.btn-primary.no-disable-during[data-bind*="click: runSaveModal"]',
      );
    };

    const click_update_save = async () => {
      await page.waitForSelector(
        'button.btn.btn-primary.btn-block[data-bind*="click: saveAll"]',
        { visible: true, timeout: 1000 },
      );

      await page.click(
        'button.btn.btn-primary.btn-block[data-bind*="click: saveAll"]',
      );
    };

    const click_delete = async () => {
      await page.waitForSelector(
        'button.btn.btn-default.no-disable-during[data-bind*="click: showDeletePanel"]',
        { visible: true, timeout: 1000 },
      );

      await page.click(
        'button.btn.btn-default.no-disable-during[data-bind*="click: showDeletePanel"]',
      );

      await page.waitForSelector(
        'button.btn.btn-danger.pull-left[data-bind*="click: deleteAll"]',
        { visible: true, timeout: 1000 },
      );

      await page.click(
        'button.btn.btn-danger.pull-left[data-bind*="click: deleteAll"]',
      );
    };

    const click_cancel = async () => {
      await page.waitForSelector(
        'button.btn.btn-default.no-disable-during[data-bind*="click: showCancelPanel"]',
        { visible: true, timeout: 1000 },
      );

      await page.click(
        'button.btn.btn-default.no-disable-during[data-bind*="click: showCancelPanel"]',
      );
      add_cancel_reason('3');
      add_cancel_reason_input('other');

      await page.waitForSelector(
        'button.btn.btn-danger[data-bind*="click: cancelAll"]',
        { visible: true, timeout: 1000 },
      );

      await page.click('button.btn.btn-danger[data-bind*="click: cancelAll"]');
    };

    const extract_id_from_url = (url) => {
      const regex = /\/(\d+)\//;
      const match = url.match(regex);

      if (match && match.length > 1) {
        const extractedNumber = match[1];
        console.log('extractedNumber', extractedNumber); // Output: 196426600
        return extractedNumber;
      }
      console.log('Number not found in the string.');
      return null;
    };

    const create_appointment = async (event) => {
      let emp_id = event.employeeId; //'3238882';
      let client_id = event.clientId; //'1928596';
      const activity_id = '16521285';
      const start = event.start; //'15:00:00';
      const end = event.end; //'18:00:00';
      const date = event.startRecur_format; //'02/01/2024';
      const eventId = event.eventId;
      console.log('hetho1.5');
      //await page.goto(`https://members.centralreach.com/#scheduling/appt/d/2024-02-13/f1`);
      await page.goto('https://members.centralreach.com/#scheduling/appt/d'); // Change URL to the login page of the website you want to access
      console.log('hetho2');
      await change_date(date);
      console.log('hetho3');
      await change_start_time(start);
      console.log('hetho4');
      await change_end_time(end);
      console.log('hetho5');
      await add_therapist(emp_id);
      await add_client(client_id);
      await add_activity(activity_id);
      await accept_overlap();
      await click_save();
      await page.waitForTimeout(1000);
      let currentUrl = page.url();
      console.log('currentUrl', currentUrl);
      const cr_eventId = extract_id_from_url(currentUrl);
      console.log('fleemer', cr_eventId);
      created_events_successful.push({
        cr_eventId,
        eventId,
      });
    };

    const update_appointment = async (event) => {
      let emp_id = event.employeeId; //'3238882';
      let client_id = event.clientId; //'1928596';
      const activity_id = '16521285';
      const start = event.start; //'15:00:00';
      const end = event.end; //'18:00:00';
      const date = event.startRecur_format; //'02/01/2024';
      const startRecur = event.startRecur; //'02/01/2024';
      const eventId = event.eventId;
      const eventIdCustom = event.eventIdCustom;
      console.log('hetho1.5');
      //await page.goto(`https://members.centralreach.com/#scheduling/appt/d/2024-02-13/f1`);
      await page.goto(
        `https://members.centralreach.com/#scheduling/edit/a/${eventIdCustom}/dt/${startRecur}`,
      ); // Change URL to the login page of the website you want to access
      console.log('hetho2');
      await change_date(date);
      console.log('hetho3');
      await change_start_time(start);
      console.log('hetho4');
      await change_end_time(end);
      console.log('hetho5');
      //await add_therapist(emp_id);
      //await add_client(client_id);
      //await add_activity(activity_id);
      await accept_overlap();
      await click_update();
      await click_update_save();
      await page.waitForTimeout(1000);
      let currentUrl = page.url();
      console.log('currentUrl', currentUrl);
      const cr_eventId = extract_id_from_url(currentUrl);
      console.log('fleemer', cr_eventId);
      updated_events_successful.push({
        cr_eventId,
        eventId,
      });
    };

    const delete_appointment = async (event) => {
      let emp_id = event.employeeId; //'3238882';
      const startRecur = event.startRecur; //'02/01/2024';
      const eventId = event.eventId;
      const eventIdCustom = event.eventIdCustom;
      console.log('delete hetho1.5');
      //await page.goto(`https://members.centralreach.com/#scheduling/appt/d/2024-02-13/f1`);
      await page.goto(
        `https://members.centralreach.com/#scheduling/edit/a/${eventIdCustom}/dt/${startRecur}`,
      ); // Change URL to the login page of the website you want to access
      await click_delete();
      deleted_events_successful.push({
        eventId,
      });
    };

    const cancel_appointment = async (event) => {
      const startRecur = event.startRecur; //'02/01/2024';
      const eventId = event.eventId;
      const eventIdCustom = event.eventIdCustom;
      console.log('delete hetho1.5');
      //await page.goto(`https://members.centralreach.com/#scheduling/appt/d/2024-02-13/f1`);
      await page.goto(
        `https://members.centralreach.com/#scheduling/edit/a/${eventIdCustom}/dt/${startRecur}`,
      ); // Change URL to the login page of the website you want to access

      await click_cancel();
      canceled_events_successful.push({
        eventId,
      });
    };

    console.log('veery', filtered_events.create_events.length);
    for (let index = 0; index < filtered_events.create_events.length; index++) {
      const event = filtered_events.create_events[index];
      console.log('event created');
      await create_appointment(event);
    }
    for (let index = 0; index < filtered_events.update_events.length; index++) {
      const event = filtered_events.update_events[index];
      console.log('event updated', event);
      await update_appointment(event);
    }

    for (let index = 0; index < filtered_events.delete_events.length; index++) {
      const event = filtered_events.delete_events[index];
      console.log('event deleted', event);
      await delete_appointment(event);
    }

    for (let index = 0; index < filtered_events.cancel_events.length; index++) {
      const event = filtered_events.cancel_events[index];
      console.log('event canceled', event);
      await cancel_appointment(event);
    }

    // await page.waitForSelector('a.select2-choice.select2-default');

    // const Sha256 = require('./sha256');
    // const hash = Sha256.hash('your message here');
    // console.log('loomy', hash);
    // // Click on the link
    // await page.click('a.select2-choice.select2-default');

    //let currentUrl = page.url();
    await browser.close();
    return {
      created_events_successful,
      updated_events_successful,
      canceled_events_successful,
      deleted_events_successful,
    };
  }
};
