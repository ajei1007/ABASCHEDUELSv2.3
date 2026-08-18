import GreenSolutions from '../../../assets/LMS/GreenSolutions.png';
import SortingSolutions from '../../../assets/LMS/SortingSolutions.png';
import OrangeSolutions from '../../../assets/LMS/OrangeSolutions.png';
import YellowSolutions from '../../../assets/LMS/YellowSolutions.png';
import addActivity from '../../../assets/LMS/addActivity.png';
import RecurringAppointments from '../../../assets/LMS/RecurringAppointments.png'
import creatingAppointments from '../../../assets/LMS/creatingAppointments.png'
import AutoPopulateFunder from '../../../assets/LMS/AutoPopulateFunder.png'
import AutoPopulateAddress from '../../../assets/LMS/AutoPopulateAddress.png'
import CancellAppointment from '../../../assets/LMS/CancellAppointment.png'
import PushNotification from '../../../assets/LMS/PushNotification.png'
import DragEvents from '../../../assets/LMS/DragEvents.png'
import CustomizingColors from '../../../assets/LMS/CustomizingColors.png'
import EditingUser from '../../../assets/LMS/EditingUser.png'
import Isolate from '../../../assets/LMS/Isolate.png'
import AddingUnavailability from '../../../assets/LMS/AddingUnavailability.png'
import Sandbox1 from '../../../assets/LMS/Sandbox1.png'
import Sandbox2 from '../../../assets/LMS/Sandbox2.png'
import Buttons from '../../../assets/LMS/Buttons.png'
import TrashCan from '../../../assets/LMS/TrashCan.png'
import CopyPaste from '../../../assets/LMS/Copy&Paste.png'
import UndoRedo from '../../../assets/LMS/UndoRedo.png'
import SchedulerViews from '../../../assets/LMS/SchedulerViews.png'
import Quick from '../../../assets/LMS/Quick.png'
import PDFView from '../../../assets/LMS/PDFView.png'
import AddingNewActivity from '../../../assets/LMS/AddingNewActivity.png'
import AddingNewUser from '../../../assets/LMS/AddingNewUser.png'
import EmployeePermissions from '../../../assets/LMS/EmployeePermissions.png'
import CustomizingActivities from '../../../assets/LMS/CustomizingActivities.png'
import ClientInactive from '../../../assets/LMS/ClientInactive.png'
import Filter from '../../../assets/LMS/filter.png'
import AddEditQuickView from '../../../assets/LMS/AddEditQuickView.png'
import Chart from '../../../assets/LMS/Chart.png'
import ActivityTable from '../../../assets/LMS/ActivityTable.png'
import mob1 from '../../../assets/LMS/mob1.png'
import mob2 from '../../../assets/LMS/mob2.png'
import mob3 from '../../../assets/LMS/mob3.png'
import EventsTable from '../../../assets/LMS/EventsTable.png'
import CancellationTable from '../../../assets/LMS/CancellationTable.png'
import CancellationType from '../../../assets/LMS/CancellationType.png'


export const FeatureGroups: any = [
  //6
  {
    title: 'Solution Generator',
    subItems: [
      //Solution Generator
      {
        url: '9oeeCUGi0YE',
        title: 'Overview',
        img: '',
        subtitle: [
          `When you click on a client a list of employees will appear in white rectangles  below it. These are all of the possible solutions that can work with those clients based on certain criteria you set within your organization.`,
        ],
        id: 11,
      },
      //Green Solutions
      {
        url: 'i2Fq3ZvruOw',
        title: 'Green Solutions',
        img: GreenSolutions,
        subtitle: [
          `Whenever you click someone's name it is going to enable the solution generator. The green solutions are going to show you the activities and sessions that would not be breaking any constraints. You may see a few different shades of green. The lightest green is going to be the most important based on the criteria you have put in under the sorting feature on the left side of the screen.`,
        ],
        id: 12,
      },
      //Sorting solutions
      {
        url: 'Tn36ToL3jK8',
        title: 'Sorting solutions',
        img: SortingSolutions,
        subtitle: [
          'Whenever you click the solution generator you will notice that there are different shades of green. The light green is going to be the most important based on the criteria you have on the left side of the screen. You can sort by several different things such as duration, start time, end time, etc. You can also change the amount of solutions you are able to view.',
        ],
        id: 13,
      },
      //Orange solutions
      {
        url: 'L8WPJTbmJy0',
        title: 'Orange solutions',
        img: OrangeSolutions,
        subtitle: [
          'When this feature is turned on orange rectangles will populate along with the white rectangles. (Orange rectangles show possible solutions outside teams, matches, credentialing, etc)',
        ],
        id: 14,
      },
      //Yellow solutions
      {
        url: 'BQ-S7hCtgG8',
        title: 'Yellow solutions',
        img: YellowSolutions,
        subtitle: [
          'When there are non billable appointments scheduled and you click the solution generator it will show yellow appointments if there are billable appointments that can replace that non billable appointment. ',
        ],
        id: 15,
      },
      //How to add an activity to the solution generator
      {
        url: 'K8lfRG-DNTk',
        title: 'How to add an activity to the solution generator',
        img: addActivity,
        subtitle: [
          'On the left side of the screen under ‘constraints’ there will be a tab labeled ‘capacity’. This is where you will set up a new activity for the solution generator. User 1 is the activity that you would like to add to the solution generator for. Role 1 is the first user that is part of the session. Example:. RBT. Role 2 would be the second user that is part of the activity. Example: The client. The min and max will generally be 1 and 1 unless you are working with group therapy or a 2:1 client.',
        ],
        id: 16,
      },
    ],
    id: 1
  },
  //4
  {
    title: 'Appointments',
    subItems: [
      {
        title: 'Recurring appointments',
        img: RecurringAppointments,
        subtitle: ['When an appointment is created and the pop up is up with all of the details of the session there will be an option at the bottom to make the appointment recurring. There are some options to choose from or you can create your own custom rule and date range. '],
        id: 21,
        url: 'p7rmLrGmf6E',
      },
      {
        url: '2KXEF6C3IZ0',
        title: 'Creating appointments',
        img: creatingAppointments,
        subtitle: [
          `1. You can easily drag an event from the ‘draggable events’ sidebar to the client or employee you would like to schedule an appointment with. To edit the appointment and add additional details, you would just click the session and the bow below will pop up.`,
          `2. Solution generator`,
          `3. Highlight the boxes next to the employee or client you would like to create an appointment with.`,
          [`Once you select the boxes with the time range that you would like to create an appointment then this box will pop up on the right side of the screen. In this box is where you will edit all of the appointment details. Such as:`,
          `- The employee`,
          `- The client`,
          `- The activity`,
          `- Where the appointment takes place`,
          `- The funder`,
          `- If it belongs to a certain block `,
          `- Add any notes to the session`,
          `- Select the session address `,
          ]
        ],
        subItems: [
          {
            title: 'Auto Populate Funder',
            img: AutoPopulateFunder,
            subtitle:
              ['When creating an appointment there is a little magic wand in the funder box. If the funder is in the clients profile, you can click the magic wand and it will auto populate.'],
            id: 221,
            url: 'SkrVSOzgHTc',
          },
          {
            title: 'Auto populate address',
            img: AutoPopulateAddress,
            subtitle:
              ['When creating an appointment there is a little magic wand in the address box. Once you select the location of the appointment you can click the wand and the address will auto populate if there is an address in the system associated with the location. '],
            id: 222,
            url: '1eYr_qsp9pM',
          },
          {
            title: 'How to cancel an appointment',
            img: CancellAppointment,
            subtitle: [
              'To cancel an appointment, you would click the appointment and there would be a pop up on the right side of the screen. At the button of the pop up there is a toggle that says ‘cancel appointment’. Once you toggle this on there will be a few different options for you to select. You will need to:',
              ['Choose who is canceling the appointment',
              'The reason the appointment is being canceled',
              'The reason the appointment is being canceled',
              `There is a toggle that you can turn on if you would like to cancel all the appointments (of the person who is canceling) for the entire day and make them unavailable.
          Wherever did the canceling, there will be a black X over their name, and whoever was canceled on will have a white X over their session. 
          `,],
            ],
            id: 223,
            url: '_Z53jmdosWo',
          },
        ],
        id: 22,
      },
      {
        url: 'Orkg9TdMxx8',
        title: 'Push notification',
        img: PushNotification,
        subtitle: [`You have the ability to send push notifications when needed. If you click an appointment and scroll to the bottom of the pop up there will be a toggle that says ‘push notification’. If you toggle it on it will allow you to choose who you would like the notification to go to. You also have the ability to type in a custom message that will pop up once they receive the notification. `],
        id: 23,
      },
      {
        url: 'IYVgZjJR8pA',
        title: 'Drag events',
        img: DragEvents,
        subtitle: [
          'On the right side of the screen there will be a tab called ‘Drag Events’. You can easily drag these events to the scheduler with one click. At the top you will see the customized activities within your organization. Below that you will see a list of clients and employees.',
        ],
        id: 24,
      },
    ],
    id: 2
  },
  //9
  {
    title: 'Scheduler',
    subItems: [
      {
        url: 't37AaaD3m6k',
        title: 'Customizing Colors',
        img: CustomizingColors,
        subtitle: [
          `All of the colors are customizable. In each profile you have the ability to customize the background colors and the border color for an activity or user. Meaning when looking at a session the colors of the session and the border can mean two different things. This is edited in the settings where the drop downs say ‘background color role’ and ‘border color role`,
        ],
        id: 31,
      },
      {
        url: 'JiwOxiQS0oE',
        title: 'Editing user from scheduler',
        img: EditingUser,
        subtitle: [
          `There is a little pencil to the left of a user's name. If you click on it it will pull up their profile and allow you to edit any information.`,
        ],
        id: 32,
      },
      {
        url: 'e0YTd_JH5x8',
        title: 'Isolate & cancel',
        img: Isolate,
        subtitle: [
          'When this toggle is turned on in the settings area the system will automatically isolate an appointment when there is a cancellation. It will isolate the user that was canceled on so that you can find a replacement for that user. ',
        ],
        id: 33,
      },
      {
        url: 'dvG7z6lR2cM',
        title: 'Live events',
        subtitle: [
          'All of the events are live and can automatically be seen in real time in another browser as changes are made. Please see the link below.',
        ],
        id: 34,
      },
      {
        url: 'TRyIght5QJ8',
        title: 'Multiselect',
        subtitle: [
          'With this feature you can select multiple appointments and move them to another user. First you would click the copy button and then select the appointments you would like to move. When you select them you will see an orange border around them letting you know they have been selected.',
        ],
        id: 35,
      },
      {
        url: '947rIW-Dmgg',
        title: 'Adding unavailability',
        img: AddingUnavailability,
        subtitle: [
          'You can  make a user unavailable from the scheduler view as well. You will just highlight boxes you would like to make a person unavailable and then the appointment box will pop up. You can do it for an entire day at a time or just a few hours.',
        ],
        id: 36,
      },
      {
        url: 'ks3WOq_Ig68',
        title: 'Blocks',
        subtitle: [
          'This is where you will add/edit/delete/name the blocks that you would like to use when you have block scheduling turned on in the setting area.',
        ],
        id: 37,
      },
      {
        url: 'ca9FEoCISnI',
        title: 'Sandbox mode',
        img: [Sandbox1, Sandbox2],
        subtitle: [
          'In SandBox mode you have the ability to edit and create appointments without them being seen live by other users. Once you take the appointment out of sandbox mode then the appointment will be live and be able to be seen by other users.',
        ],
        id: 38,
      },
      {
        title: 'Buttons',
        subItems: [
          {
            url: 'CdfhG-Amc58',
            title: 'Overview',
            img: Buttons,
            subtitle: [
              'There are several buttons at the top of the scheduler, each with their own function',
              'Starting from the left.',
              ' - There are two icons grouped together. One of them allows you to isolate a user and then the other one will show everyone on the scheduler again',
              ' - The trash can allows you to delete appointments of selected users',
              ' - The copy and paste buttons are directly next to that',
              ' - The next button is the different views you can view the schedule in.',
              [' - D-Day', ' - W-week', ' - T-timeline', ' - G-gridview'],
              ' - The undo/redo buttons (two arrows)',
              ' - The Quick view Stats (percentage button)',
              ' - PDF download (arrow pointing down)',
              ' - Optimizer (robot)',
              ' - Settings',
            ],
            id: 337,
          },
          {
            url: 'wF5_8BaH300',
            title:
              'Trash Can (under buttons)',
            img: TrashCan,
            subtitle: [
              `This button allows you to delete a single user's appointments or appointments in bulk.`,
            ],
            id: 331,
          },
          {
            url: 'MrbQfAO9Lv4',
            title: 'Copy & paste',
            img: CopyPaste,
            subtitle: [
              `This feature allows you to copy an entire week's schedule and paste it to another week. You can also copy a specific day or person to paste it to as well.`,
            ],
            id: 332,
          },
          {
            url: 'hxXcth6vSNE',
            title: 'Undo/Redo',
            img: UndoRedo,
            subtitle: [
              'The two arrows at the top of the scheduler are to undo/redo any actions.',
            ],
            id: 333,
          },
          {
            url: 'Plp6B28mnck',
            title: 'Scheduler View',
            img: SchedulerViews,
            subtitle: [
              'This video will show you the different views that the scheduler has. ',
            ],
            id: 334,
          },
          {
            url: 'Gzq3cuYWHPU',
            title: 'Quickview stats',
            img: Quick,
            subtitle: [
              'This button will allow you to add and remove the quick view stats to and from and the schedule as seen above.You also have the ability to edit which stats show up in the quick view.',
              '1. Click settings',
              '2. Edit which data you would like displayed.',
            ],
            id: 335,
          },
          {
            url: 'HaYyhn8eVWg',
            title: 'PDF View',
            img: PDFView,
            subtitle: [
              `This button allows you to view the schedule in a different format. It will pull everyone's schedule and create a nice PDF view for you. If you only want to view one person's schedule- you would isolate that person and then click the PDF view.`,
            ],
            id: 336,
          },
        ],
        id: 39,
      },
    ],
    id: 3
  },
  //6
  {
    title: 'Adding and customizing user and activities',
    subItems: [
      {
        url: '6Lqq029Pemw',
        title: 'Adding a new activity ',
        img: AddingNewActivity,
        subtitle: [`To add a new activity to the scheduler you will need to click on the activity tab on the right side of the screen. There will be a tab underneath that says ‘data’. Once you click that all of your current activities will show up. If you would like to add a new one, there will be a button that says ‘new’ in the top right corner. The activity can be named anything you like and you can also customize the color in this area as well. Most importantly- you need to make sure that you add availability for the activity so it can show up in the solution generator. 
        *Remember you still have to add the activity to the solution generator as well, see pg 7.*
        `],
        id: 41,
      },
      {
        url: '2MPfoRdNiJc',
        title: 'Adding a new user',
        img: AddingNewUser,
        subtitle: [
          'To add a new user, client or employee, you would click either the client or employee tab and then the data tab. In the top left corner there will be a button that says ‘new’. When adding a new user it is very important to add availability for them so that they can show up in the solution generator.',
        ],
        id: 42,
      },
      {
        url: 'O11GSUI63_k',
        title: 'Employee Permissions',
        img: EmployeePermissions,
        subtitle: [`Under the employees tab, there is a roles tab. There is where you can see all the different roles that you can assign an employee. This is also where you have the ability to edit the permissions associated with each role. `],
        id: 43,
      },
      {
        url: 'LDaPgDOL-jg',
        title: 'Customizing activities',
        img: CustomizingActivities,
        subtitle: [
          'The activities can be customized in a few different ways. Under the activity tab >Data is where you can customize them. You can:',
          '-Edit the availability of an activity Ex: You only want lunches to happen between 11 and 1',
          '-Edit the color of the activities',
          '-Edit the name of the activity',
          '-Add new activities',
        ],
        id: 44,
      },
      {
        url: 'uQsPbj4gvvw',
        title: 'How to make a client inactive',
        img: ClientInactive,
        subtitle: [
          `In the clients profile under the user information tab there is a box towards that bottom that you can check that says ‘disabled’. This will make the client inactive in the system and they will not show up on the scheduler. If you would like to delete a client from the system you would need to go to the client tab>data and then there would be a little red trash can next to their name. It is typically better to disable clients vs make them inactive so that you keep the history of the data. `,
        ],
        id: 45,
      },
      {
        url: 'iXEz7zEuIZg',
        title: 'Employee Roles',
        img: '',
        subtitle: [
          `Under this tab you can add new roles and edit the permissions of each of the roles. `,
        ],
        id: 46,
      },
    ],
    id: 4
  },
  //2
  {
    title: 'Settings',
    subItems: [
      {
        url: 'PdOyVvr8Hhs',
        title: 'How to filter',
        img: Filter,
        subtitle: [`When you click settings and scroll down to the bottom of the pop up there will be a spot that says ‘filters’. There are three different options, Groups Filter, Roles Filter, and User Filter. Groups filter will allow you to filter by groups such as males, high severity clients, etc. Roles filter will allow you to see just certain roles such as Lead RBT, BCBAs, etc. Then the User filter will let you single out just certain users. `],
        id: 51,
      },
      {
        url: 'Wd7lZI49Quw',
        title: 'How to add/edit quick view stats to schedule',
        img: AddEditQuickView,
        subtitle: [
          'The percentage button at the top will allow you to add the quick view stats to the scheduler. This can be customizable in the settings area to where you can view any activity on the scheduler you would like.',
        ],
        id: 52,
      },
    ],
    id: 5
  },
  //2
  {
    title: 'Statistics',
    subItems: [
      {
        url: 'j2rpnhO6DrY',
        title: 'Charts',
        img: Chart,
        subtitle: [
          `In the charts tab you are going to see several different graphs that measure your data. You can sort this data by roles and branches. Each graph is going to display different data for you. On some of the graphs you can even compare your branches.`,
        ],
        id: 61,
      },
      {
        url: 'sMYkMDK6ObI',
        title: 'Activity Table',
        img: ActivityTable,
        subtitle: [
          `This table is going to break down each activity that you schedule for. You will see each of the activities at the top of the graph and each of the users on the left side. Additional information that is in the table is the cancellation rate per user and the efficiency rate per user.`, 

          `You can also sort the information all different ways:`,
          [`Date range`,
          `By Branch`,
          `By any role`,
          `Specific user`,],
          `There is also a search bar so you can search for any data specifically.`,
        ],
        id: 62,
      },
    ],
    id: 6
  },
  //2
  {
    title: 'Mobile Application',
    subItems: [
      {
        title: 'Mobile Application',
        subtitle: [`On the home screen you will see all of the upcoming events`],
        img: [mob1, mob2, mob3],
        url: '',
        id: 73,
      },
      {
        url: 'jT_QQ2ywCvc',
        title: 'Events Table (separate tab from statistics tab)',
        img: EventsTable,
        subtitle: [
          `This table is going to list out all the different events that are on the scheduler. You can filter what events show up on the table a few different ways:`,
          [`Date range`,
          `By Branch`,
          `What the event contains`,
          `Any notes within the event`], 
          `The event is going to show up with a start range and end range. If you wanted to populate the events individually then would turn the toggle on the top right and then export the events to an excel form. `,
        ],
        id: 71,
      },
      {
        url: '',
        title: 'Cancellation Table (separate from Statistics tab)',
        img: CancellationTable,
        subtitle: [
          `Under this tab it is going to show you all your cancellations for the date range that you have selected. There is also the ability to sort by branch as well. In each line there will be information about the cancellation. Some of the information will be:`,
            [`Who canceled`, 
            `The reason for the cancellation`,
            `The duration`, 
            `Start and end time`,
            `The type of event`],
        ],
          subItems: [
              {
              url: '6Lqq029Pemw',
              title: 'Cancellation types',
              img: CancellationType,
              subtitle: [`This tab is underneath the cancellation tab. This is where you would customize your cancellation reasons. When you make a cancellation on the scheduler these are the reasons that will populate. `],
              id: 771,
              }
          ],
        id: 72,
      },
    ],
    id: 7
  },
  //5
  {
    title: 'FAQ',
    subItems: [
      {
        url: 'jT_QQ2ywCvc',
        title:
          'I do not want everyone seeing when I am editing the schedule, can I turn off the live updates?',
        subtitle: [
          'Yes! If you turn the toggle on for ‘sandbox mode’ only you will be able to see the changes you are making until you take those appointments out of sandbox mode. You can click an appointment and then at the bottom of the pop up there will be a toggle to take the appointment out of sandbox mode. If you need to take multiple appointments out of sandbox mode, check the names with the sandbox appointments and then there will be a button appear at the top next to the copy and paste button. It will say ‘make unsandboxed’. The appointments will then be live for everyone to see. ',
        ],
        id: 81,
      },
      {
        url: 'D02LW8qYQmM',
        title:
          'The solution generator is not generating anything for a client, how do I troubleshoot?',
        subtitle: [`- Did you recently change this employee's role? The solution generator is based on the roles. We can always add in a role, if needed.`,
        `- Did you add in a new constraint? If so, try making that constraint a ‘soft constraint’ and turn on your orange solutions to see if there are solutions under that employee. The constraint may have been entered wrong.`, 
        `- Do you have a capacity constraint created for the activity?`,
        `- Does this employee have availability on this day?`,
        `- Does the activity have availability?`,
        `- Is the solution generator working on other days? Other clients?`,
        [`- These questions will help us pinpoint if it is a user error or something our developers may need to take a quick look at.`],
        ],
        id: 82,
      },
      {
        url: 't37AaaD3m6k',
        title:
          'How do I change the color on the schedule to reflect an employee, not an activity?',
        subtitle: [`All of the colors are customizable. In each profile you have the ability to customize the background colors and the border color for an activity or user. Meaning when looking at a session the colors of the session and the border can mean two different things. This is edited in the settings where the drop downs say ‘background color role’ and ‘border color role’`],
        id: 83,
      },
      {
        url: 'Fddy0h_BAKU',
        title: 'How to make a client or employee inactive?',
        subtitle: [
          `1. Find the constraint tab on the left side of the screen`,
          `2. Click on it and the click the ‘groups’ tab`,
          '3. Create a group and add what kind of users will belong to that group. I.e clients, RBTs, or both. Click save',
          `4. Refresh the screen and you should see the group show up under the tags`,
          `5. Create the RBT or client team/tags under that group`,
          `6. Go back up to the constraint tab and click the ‘custom’ tab`,
          `7. Select ‘group’ for the constraint type`,
          `8. Choose branch that it applies to`,
          `9. Choose ‘team’ (or whatever you named your group) for the grouping`,
          `10. On the left you can select ‘role’ and the ‘RBT’ for the role`,
          `11. On the right you can select role and the ‘client’ for the role`,
          '12. This constraint will apply to all teams you create under that group in the future.',
        ],
        id: 84,
      },
      {
        url: '8uS_Pq8hR-o',
        title: 'Can I add a future client into the system?',
        subtitle: [
          `Yes! In the availability section of the clients profile there is the ability to set the start range to whatever date you would like. This allows you to go out several weeks to plan ahead without affecting your current schedule’s efficiency.`,
        ],
        id: 85,
      },

      // {
      //   url: '',
      //   title: 'How do I create RBT or client teams?',
      //   subtitle: [
      //     `Did you recently change this employee's role? The solution generator is based on the roles. We can always add in a role, if needed.`,
      //     'Did you add in a new constraint? If so, try making that constraint a ‘soft constraint’ and turn on your orange solutions to see if there are solutions under that employee. The constraint may have been entered wrong. ',
      //     'Do you have a capacity constraint created for the activity?',
      //     'Does this employee have availability on this day?',
      //     'Does the activity have availability?',
      //     'Is the solution generator working on other days? Other clients?',
      //     'These questions will help us pinpoint if it is a user error or something our developers may need to take a quick look at. ',
      //   ],
      //   id: 63,
      // },


      // {
      //   url: '',
      //   title: 'How can I make an activity only show at certain times?',
      //   subtitle: [],
      //   id: 66,
      // },
      
    ],
    id: 8
  },
  // {
  //   title: 'Mobile App',
  //   subtitle: [''],
  //   url: '',
  //   id: 7,
  // },
  // {
  //   title: 'Optimizer',
  //   subtitle: [''],
  //   url: '',
  //   id: 8,
  // },
  // {
  //   title: 'Custom Constraint builder',
  //   subtitle: [''],
  //   url: '',
  //   id: 9,
  // },
  // {
  //   title: 'Tags',
  //   subtitle: [''],
  //   url: '',
  //   id: 10,
  // },
  // {
  //   title: 'Flagging Alert',
  //   subtitle: [''],
  //   url: '',
  //   id: 11,
  // },
  // {
  //   title: 'Requests',
  //   subtitle: [''],
  //   url: '',
  //   id: 12,
  // },
];
