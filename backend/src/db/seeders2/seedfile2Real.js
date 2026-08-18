'use strict';



const bcrypt = require('bcrypt');
const config = require('../../config');
const resource_ids = require('../uuids/resources');
const privilege_ids = require('../uuids/privileges');
const industries_ids = require('../uuids/industries');
const day_ids = require('../uuids/days');
const colors = require('../uuids/colors');
var _ = require("lodash")
const names = require('../uuids/names');
let uuid_arr = require('../uuids/uuid_arr');

const { v4: uuidv4 } = require('uuid');

function getRandomInt(max) {
  return Math.floor(Math.random() * max)+1;
}



const addresses = [
  '9625 SW 17th Ave Gainesville, Florida',
  '975 SE 41st Ave Gainesville, Florida',
  '9851 SW 34th Rd Gainesville, Florida',
  '809 Victoria Ct Gainesville, Florida',
  '827 NW 64th Ter Gainesville, Florida',
  '8430 SW 7th Pl Gainesville, Florida',
  '3527 SW 20th Ave Gainesville, Florida',
  '938 SW 82nd Ter Gainesville, Florida',
  '6206 SW 10th Pl Gainesville, Florida',
  '3527 SW 20th Ave Gainesville, Florida',
  '1714 SW 70th Ter Gainesville, Florida',
 // '6900 SW 21st Ln 2 Gainesville, Florida',
  '938 SW 82nd Ter Gainesville, Florida',
  '620 SW 67th Ter Gainesville, Florida',
  '209 SW 91st St Gainesville, Florida',
  //'3600 SW 19th Ave 21 Gainesville, Florida',
  '442 NW 48th Blvd Gainesville, Florida',
  '6206 SW 10th Pl Gainesville, Florida',
  '3527 SW 20th Ave Gainesville, Florida',

]

const ids = [
  '193bf4b5-9f07-4bd5-9a43-e7e41f3e96af',
  'af5a87be-8f9c-4630-902a-37a60b7005ba',
  '5bc531ab-611f-41f3-9373-b7cc5d09c93d',
  'b69e7c2d-07c2-47d6-957f-860b923fdb4d',
  '6be6c6ea-ca29-4855-a50d-18563b79c44e',
  '5f92135e-e918-45df-af58-692bb5a13aa0',
  '6e02717c-7d57-458a-8413-51713eeb594a',
  '1c663844-411b-4373-ae16-208da76d27f0',
  '2e2aeee2-c180-4da7-a8fa-103af4f3c4b9',
  'b069f020-8ac4-44e8-b96b-e702e4d4b292',
  '3dd4fd11-6ea5-439d-95fc-7a27cd81c30f',
  '025c4c8e-f4a7-4ffb-b6d3-0384806e6426',
  '167b36ba-7d71-470b-a080-a528b80d47fd',
  'e03336ef-2ca9-4bff-9038-3644771d2c2f',
];


function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


const date = new Date()
const today = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

const range_start1 = new Date(new Date().getTime() - 5* 24 * 60 * 60 * 1000)
const range_end1 = new Date(new Date().getTime() + 18* 24 * 60 * 60 * 1000)

let date_range_start1 = new Date(new Date().getTime() - 5* 24 * 60 * 60 * 100000)
let date_range_end1 = new Date(new Date().getTime() + 5* 24 * 60 * 60 * 100000)

date_range_start1 = date_range_start1.getFullYear() + '-' + (date_range_start1.getMonth()+1) + '-' + date_range_start1.getDate()
date_range_end1 = date_range_end1.getFullYear() + '-' + (date_range_end1.getMonth()+1) + '-' + date_range_end1.getDate()

const date_range_six_month_start = new Date(new Date().getTime() - 0.25* 24 * 60 * 60 *365* 1000)
const date_range_six_month_end = new Date(new Date().getTime() + 0.25* 24 * 60 * 60*365 * 1000)

const date_range_six_month_end2 = new Date(new Date().getTime() + 0.5* 24 * 60 * 60*365 * 1000)

const now = new Date()

const start_date1 = new Date("2021-12-06 10:00:00")
const end_date1 = new Date("2021-12-06 14:00:00")

const start_datetime0 = new Date(`${today} 00:00:00 EDT`)
const end_datetime0 = new Date(`${today} 20:00:00 EDT`)

const start_datetime1 = new Date(`${today} 10:00:00 EDT`)
const end_datetime1 = new Date(`${today} 14:00:00 EDT`)

const start_datetime2 = new Date(`${today} 12:00:00 EDT`)
const end_datetime2 = new Date(`${today} 18:00:00 EDT`)

const start_datetime3 = new Date(`${today} 20:00:00 EDT`)
const end_datetime3 = new Date(`${today} 22:00:00 EDT`)

const start_datetime4 = new Date(`${today} 06:00:00 EDT`)
const end_datetime4 = new Date(`${today} 16:00:00 EDT`)

const start_datetime4_lunch = new Date(`${today} 11:00:00 EDT`)
const end_datetime4_lunch = new Date(`${today} 13:00:00 EDT`)

const start_datetime4_break = new Date(`${today} 09:00:00 EDT`)
const end_datetime4_break = new Date(`${today} 15:00:00 EDT`)

const start_datetime_block1_lunch = new Date(`${today} 11:00:00 EDT`)
const end_datetime_block1_lunch = new Date(`${today} 11:30:00 EDT`)
const start_datetime_block2_lunch = new Date(`${today} 11:30:00 EDT`)
const end_datetime_block2_lunch = new Date(`${today} 12:00:00 EDT`)
const start_datetime_block3_lunch = new Date(`${today} 12:00:00 EDT`)
const end_datetime_block3_lunch = new Date(`${today} 12:30:00 EDT`)
const start_datetime_block4_lunch = new Date(`${today} 12:30:00 EDT`)
const end_datetime_block4_lunch = new Date(`${today} 13:00:00 EDT`)

const start_datetime_block1 = new Date(`${today} 08:00:00 EDT`)
const end_datetime_block1 = new Date(`${today} 11:00:00 EDT`)

const start_datetime_block2 = new Date(`${today} 11:00:00 EDT`)
const end_datetime_block2 = new Date(`${today} 13:00:00 EDT`)

const start_datetime_block3 = new Date(`${today} 13:00:00 EDT`)
const end_datetime_block3 = new Date(`${today} 14:00:00 EDT`)

const start_datetime_block4 = new Date(`${today} 14:00:00 EDT`)
const end_datetime_block4 = new Date(`${today} 16:00:00 EDT`)

const start_datetime5 = new Date(`${today} 09:15:00 EDT`)
const end_datetime5 = new Date(`${today} 16:00:00 EDT`)


const trans = (p,id) => {
  return p.map(e=> {
    e.createdById=id; e.updatedById=id; e.createdAt= new Date(); e.updatedAt = new Date(); return e})
}

const trans2 = (p) => {
  return p.map(e=> {
    e.createdAt= new Date(); e.updatedAt = new Date(); return e})
}

const trans3 = (id,p) => {
  return p.map(e=> {
    e.createdById=id; e.createdAt= new Date(); e.updatedAt = new Date(); return e})
}

const give_id = (p) => {
  const len = p.length
  let arr = []

  p.map(e=> {
    arr.push(uuid_arr.pop())
    })
    arr.sort()
  return p.map((e,index)=> {
    e.id= arr[index]
    return e})
}


const up_insert1 = async (array, queryInterface) => {
  let a = []
  for (let index = 0; index < array.length; index++) {
    const r = array[index];
    for (let index2 = 0; index2 < r.length; index2++) {
      const e = r[index2];
      a = await queryInterface.bulkInsert(e, trans2(eval(e)))
    }
  }
  return a
}

const colors_array = give_id(Object.keys(colors).map(color=>({color:color})))

const general = {
  daysofweek: [{id:day_ids.sunday_id,name:'Sunday'},{id:day_ids.monday_id,name:'Monday'},{id:day_ids.tuesday_id,name:'Tuesday'},{id:day_ids.wednesday_id,name:'Wednesday'},{id:day_ids.thursday_id,name:'Thursday'},{id:day_ids.friday_id,name:'Friday'},{id:day_ids.saturday_id,name:'Saturday'}]
}

const roles = {
  resource: {id: uuid_arr.pop(), name: 'Resource'},
  person: {id: uuid_arr.pop(), name: 'Person'},
  location: {id: uuid_arr.pop(), name: 'Location'},
  activity: {id: uuid_arr.pop(), name: 'Activity'},
  employee: {id: uuid_arr.pop(), name: 'Employee'},
  client: {id: uuid_arr.pop(), name: 'Client'},
  physical: {id: uuid_arr.pop(), name: 'Physical'},
  remote: {id: uuid_arr.pop(), name: 'Remote'},
  home: {id: uuid_arr.pop(), name: 'Home'},
  clinic: {id: uuid_arr.pop(), name: 'Clinic'},
  telehealth: {id: uuid_arr.pop(), name: 'Telehealth'},
  school: {id: uuid_arr.pop(), name: 'School'},
  rbt: {id: uuid_arr.pop(), name: 'RBT'},
  bcaba: {id: uuid_arr.pop(), name: 'BCABA'},
  bcba: {id: uuid_arr.pop(), name: 'BCBA'},
  bt: {id: uuid_arr.pop(), name: 'BT'},
  director: {id: uuid_arr.pop(), name: 'Director'},
  admin: {id: uuid_arr.pop(), name: 'Admin'},
  ot: {id: uuid_arr.pop(), name: 'OT'},
  slp: {id: uuid_arr.pop(), name: 'SLP'},
  pt: {id: uuid_arr.pop(), name: 'PT'},
  aba: {id: uuid_arr.pop(), name: 'ABA'}
}

const super_privs = {statistics:'E',constraints:'E',events:'E',subgroups:'E',scheduler:'E',availabilities:'E',branches:'E',cancellations:'E',cancellationtypes:'E',capacityconstraints:'E',clock:'E',distanceconstraints:'E',eventpair:'E',groupings:'E',matches:'E',nogapsconstraint:'E',priorities:'E',relationships:'E',roles:'E',settings:'E',settingscompany:'E',statusevents:'E',timeconstraints:'E',timeoff:'E',timeofftypes:'E',users:'E'}
//const basic_privs = {statistics:'NA',constraints:'NA',events:'NA',subgroups:'NA',cancellations:'NA',availabilities:'NA',scheduler:'V'}
const industries2 = {
  ABA: {
    roles: [{name:'Resource'},{name:'Person',parent:'Resource'},{name:'Location',parent:'Resource',color:'brown'},{name:'Block',parent:'Resource',color:'orange'},
   // {name:'Block_Lunch',parent:'Block',color:'orange'},
    {name:'Attribute',parent:'Resource',color:'red'},{name:'Gender',parent:'Attribute'},{name:'Male',parent:'Gender'},{name:'Female',parent:'Gender'},
    {name:'Activity',parent:'Resource',color:'black'},
    //{name:'subActivity',parent:'Activity'},
    {name:'Employee',parent:'Person',color:'green'},{name:'Contact',parent:'Person',color:'green'},{name:'Funder',parent:'Resource',color:'red'},{name:'Client',parent:'Person',color:'blue',dataAccess:'User',privileges:{statistics:'NA',constraints:'NA',events:'NA',subgroups:'NA',cancellations:'NA',availabilities:'NA',scheduler:'V'}},
    {name:'Physical',parent:'Location'},{name:'Remote',parent:'Location'},
    {name:'Home',parent:'Physical'},{name:'Clinic',parent:'Physical'},{name:'Room',parent:'Physical'},
    {name:'School',parent:'Physical'},{name:'Community',parent:'Physical'},{name:'Virtual',parent:'Remote'},
    {name:'Super Admin',parent:'Employee',dataAccess:'All',privileges:{...super_privs}},
    {name:'RBT',parent:'Employee'},{name:'BT',parent:'Employee'},
    {name:'BCBA',parent:'Employee',dataAccess:'Branch',privileges:{statistics:'E',constraints:'E',events:'E',subgroups:'E',cancellations:'E',availabilities:'E',scheduler:'E'}},{name:'BCABA',parent:'Employee'},
    {name:'Director',parent:'Employee'},{name:'Admin',parent:'Employee'},{name:'OT',parent:'Client'},{name:'SP',parent:'Client'},
    {name:'PT',parent:'Client'},
    //{name:'ABA',parent:'Client',dataAccess:'User',privileges:{statistics:'NA',constraints:'NA',events:'NA',subgroups:'NA',cancellations:'NA',availabilities:'NA',scheduler:'V'}},
    ].map(e=>({...e,id:uuid_arr.pop()})),

    cancellationtypes: give_id([{name:'Sick'},{name:'Doctor Appointment'}]),
    timeofftypes: give_id([{name:'Holiday'},{name:'Vacation'},{name:'Personal'}]),
    relationships: give_id([{name:'Mother'},{name:'Father'},{name:'Grandmother'},{name:'Grandfather'},{name:'Guardian'}]),
    //nogapsconstraint: ['Client'],
    capacityconstraints: give_id([
      {user1Id: 'Direct', role1Id:'RBT',min1:1,max1:1,role2Id:'ABA',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
      {user1Id: 'Supervision', role1Id:'BCBA',min1:1,max1:1,role2Id:'ABA',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
      {user1Id: 'Lunch', role1Id:'Employee',min1:1,max1:1},
      {user1Id: 'Lunch', role1Id:'Client',min1:1,max1:1},
      {user1Id: 'Client_Meeting', role1Id:'Employee',min1:1,max1:1},
      {user1Id: 'Drive', role1Id:'Employee',min1:1,max1:1},
      {user1Id: 'Break', role1Id:'Employee',min1:1,max1:1},
    ]),
    groupings: give_id([
      {name: 'Unmatch', min: 0, max: 0, roles1:['Resource'], roles2: ['Resource']},
      {name: 'Severity', min: 1, max: 10000, roles1:['Employee'], roles2: ['Client']},
      {name: 'Funders', min: 1, max: 10000, roles1:['Employee'], roles2: ['Client']},
      {name: 'Rooms', min: 1, max: 10000, roles1:['Room'], roles2: ['Person']},
      {name: 'Teams', min: 1, max: 10000, roles1:['Employee'], roles2: ['Client']},
      {name: 'Languages', min: 1, max: 10000, roles1:['Employee'], roles2: ['Client']},
      {name: 'Allergies', min: 0, max: 0, roles1:['Employee'], roles2: ['Client']},
      {name: 'RBT REQ', min: 1, max: 1, roles1:['Employee'], roles2: ['Funder']},
      {name: 'Home', min: 1, max: 1, roles1:['Activity'], roles2: ['Home']},
      {name: 'Not Male', min: 0, max: 0, roles1:['Male'], roles2: ['Gender']},
      {name: 'Not Female', min: 0, max: 0, roles1:['Female'], roles2: ['Gender']},
    ]),
    // eventpair: give_id([{roles1:['RBT','ABA'],roles2:['BCBA','BCABA'],activity1:'Direct',activity2:'Supervision'},
    // {roles1:['Behavioral Interventionist'],roles2:['BCBA'],activity1:'Direct',activity2:'Supervision'}]),
    eventpair: [],
    settingscompany:[{cancellationdeadline:86400000, timeoffdeadline:259200000}],
    subgroups: give_id([

      {name: 'Home Client', groupId: 'Home'},

      {name: 'Not Male', groupId: 'Not Male'},
      {name: 'Not Female', groupId: 'Not Female'},
      
      {name: 'RBT REQ', groupId: 'RBT REQ'},

      {name: 'Room 101', groupId: 'Rooms'},
      {name: 'Room 102', groupId: 'Rooms'},
      {name: 'Room 103', groupId: 'Rooms'},

      {name: 'Team Blue', groupId: 'Teams'},
      {name: 'Team Red', groupId: 'Teams'},
      {name: 'Team Yellow', groupId: 'Teams'},
      {name: 'Team Green', groupId: 'Teams'},

      {name: 'Medicaid', groupId: 'Funders'},
      {name: 'BCBS', groupId: 'Funders'},
      {name: 'Gardner', groupId: 'Funders'},
      {name: 'Private Pay', groupId: 'Funders'},

      {name: 'High Severity', groupId: 'Severity'},
      {name: 'Low Severity', groupId: 'Severity'},

      {name: 'English', groupId: 'Languages'},
      {name: 'Spanish', groupId: 'Languages'},


    ])

  },
  Tutoring: {
    roles: [{name:'Resource'},{name:'Person',parent:'Resource'},{name:'Location',parent:'Resource'},{name:'Activity',parent:'Resource',color:'purple'},{name:'subActivity',parent:'Activity'},
    {name:'Employee',parent:'Person',color:'pink'},{name:'Client',parent:'Person'},{name:'Physical',parent:'Location'},{name:'Remote',parent:'Location'},
    {name:'Home',parent:'Physical'},{name:'Center',parent:'Physical'},{name:'Room',parent:'Physical'},{name:'School',parent:'Physical'},{name:'Community',parent:'Physical'},{name:'School',parent:'Physical'},{name:'Telehealth',parent:'Remote'},
    {name:'Super Admin',parent:'Employee',dataAccess:'All',privileges:{statistics:'E',constraints:'E',events:'E',subgroups:'E',cancellations:'E',availabilities:'E',scheduler:'E'}},
    {name:'Tutor',parent:'Employee'},
    {name:'Student',parent:'Client'},
    ].map(e=>({...e,id:uuid_arr.pop()})),

    cancellationtypes: [{name:'Sick'},{name:'Doctor Appointment'}].map(e=>({...e,id:uuid_arr.pop()})),

    capacityconstraints: give_id([
      {user1Id: 'One-on-One', role1Id:'Tutor',min1:1,max1:1,role2Id:'Student',min2:1,max2:1},
      {user1Id: 'Group', role1Id:'Tutor',min1:1,max1:1,role2Id:'Student',min2:1,max2:10},
      {user1Id: 'Lunch', role1Id:'Person',min1:1,max1:1},
    ]),
    groupings: give_id([
      {name: 'Unmatch', min: 0, max: 0, roles1:['Resource'], roles2: ['Resource']},
      {name: 'Subjects', min: 1, max: 10000, roles1:['Tutor','Student'], roles2: ['subActivity']},
      {name: 'Languages', min: 1, max: 10000, roles1:['Tutor'], roles2: ['Student']},
    //  {name: 'Allergies', min: 0, max: 0, roles1:['Employee'], roles2: ['Client']},
    ]),
    eventpair: [],
    subgroups: give_id([
      {name: 'Leadership', groupId: 'Subjects'},
      {name: 'Science', groupId: 'Subjects'},
      {name: 'Sales', groupId: 'Subjects'},
      {name: 'Marketing', groupId: 'Subjects'},
      {name: 'Math', groupId: 'Subjects'},
      {name: 'Accounting', groupId: 'Subjects'},
      {name: 'Business', groupId: 'Subjects'},
      

      {name: 'English', groupId: 'Languages'},
      {name: 'Spanish', groupId: 'Languages'},


    ])

  },


}

// const av_t = Object.values(day_ids).map(e=>{
//   return {startTime: start_datetime4, endTime: end_datetime4, day:e, available: true, startRange:date_range_start1, endRange:date_range_end1}
// })


const teams_ABA = industries2.ABA.subgroups.filter(y=>y.groupId=='Teams').map(y=>y.name)
const rooms_ABA = industries2.ABA.subgroups.filter(y=>y.groupId=='Rooms').map(y=>y.name)
const subgroups_ABA = industries2.ABA.subgroups.filter(y=>y.groupId=='Severity').map(y=>y.name)
const languages_ABA = industries2.ABA.subgroups.filter(y=>y.groupId=='Languages').map(y=>y.name)
const av_t = [{startTime: start_datetime4, endTime: end_datetime4, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]

const av_t_lunch = [{startTime: start_datetime4_lunch, endTime: end_datetime4_lunch, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_break = [{startTime: start_datetime4_break, endTime: end_datetime4_break, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]


const av_t_f = () => {
  let arr = []
//   Object.values(day_ids).map(day=>{
//   let startHour = 7
//   const endHour = 18
//   //const hour_start = startHour + Math.random() * (endHour - startHour) | 0;
//   const hour_start = startHour | 0;
//   startHour = hour_start
//   //const hour_end = startHour + Math.random() * (endHour - startHour) | 0;
//   const hour_end = startHour + (endHour - startHour) | 0;
//   let date_start = new Date(`${today} 07:00:00 EDT`)
//   let date_end = new Date(`${today} 17:00:00 EDT`)
//   //date_start.setHours(hour_start)
//   //date_end.setHours(hour_end)
//   return arr.push({startTime: date_start, endTime: date_end, days:[day], available: true, startRange:date_range_start1, endRange:date_range_end1})
// })
 // Object.values(day_ids).map(day=>{
  let startHour = 7
  const endHour = 18
  //const hour_start = startHour + Math.random() * (endHour - startHour) | 0;
  const hour_start = startHour | 0;
  startHour = hour_start
  //const hour_end = startHour + Math.random() * (endHour - startHour) | 0;
  const hour_end = startHour + (endHour - startHour) | 0;
  let date_start = new Date(`${today} 07:00:00 EDT`)
  let date_end = new Date(`${today} 17:00:00 EDT`)
  //date_start.setHours(hour_start)
  //date_end.setHours(hour_end)
  arr.push({startTime: date_start, endTime: date_end, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1})
//})
return arr
}

const av_t_block1 = [{startTime: start_datetime_block1, endTime: end_datetime_block1, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_block2 = [{startTime: start_datetime_block2, endTime: end_datetime_block2, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_block3 = [{startTime: start_datetime_block3, endTime: end_datetime_block3, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_block4 = [{startTime: start_datetime_block4, endTime: end_datetime_block4, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]

const av_t_block1_lunch = [{startTime: start_datetime_block1_lunch, endTime: end_datetime_block1_lunch, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_block2_lunch = [{startTime: start_datetime_block2_lunch, endTime: end_datetime_block2_lunch, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_block3_lunch = [{startTime: start_datetime_block3_lunch, endTime: end_datetime_block3_lunch, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]
const av_t_block4_lunch = [{startTime: start_datetime_block4_lunch, endTime: end_datetime_block4_lunch, days:Object.values(day_ids), available: true, startRange:date_range_start1, endRange:date_range_end1}]



let hash = bcrypt.hashSync(config.admin.password, config.bcrypt.saltRounds);

const superAdminIds = [
  'c9391e02-6894-406f-874c-5584b238ca55',
  '8cdccd18-c0e9-45f3-9654-d659a87e5713',
  '3db36638-5f30-4b23-86d8-76d0f41367d7',
  'ff47a608-0cac-4e01-9a12-04869f34b7f6',
  '213f1113-1adc-4e29-8306-609140012c37',
]

const types_pos = ['RBT','RBT','RBT','RBT','RBT','BCBA','ABA','ABA','ABA','ABA','ABA']
const branch_rand = ['Gainesville','Atlanta']
const number_of_people = 0
const users_random = (branch_rand,types_pos,number_of_people) => {
  //const branch_length =
  //return names.people.slice(0,number_of_people).map(name =>{
   // return {firstName: name,roles:[_.sample(types_pos)],branches:[_.sample(branch_rand)]}  
  return _.sampleSize(names.people,number_of_people).map(name =>{
  return {firstName: name,roles:[_.sample(types_pos)],branches:[_.sample(branch_rand)]}
})
}

const company_info1 = {
  industry: 'ABA',
  company: 'Autism Worldwide',
  companyId: ids[0],
  branches: ['Gainesville','Atlanta'],
  //superUserId: 'c9391e02-6894-406f-874c-5584b238ca55',
  //superUser: {firstName: 'Bill Welsh',id:'c9391e02-6894-406f-874c-5584b238ca55',branches:['Gainesville'],email:'silver.inventor@gmail.com',role:'admin',roles:["RBT"],password: hash},
  users: users_random(branch_rand,types_pos,number_of_people).concat([{firstName: 'Alicia Lasaga',subgroups:["Spanish",'High Severity',"English","Low Severity","BCBS"],branches:['Gainesville','Atlanta'], roles:["BCBA","Female"]},{firstName: 'Tyson Silver',subgroups:["English"],branches:['Gainesville'], roles:["ABA","Male"], address:addresses[8]},{firstName: 'Ariel Baner',subgroups:["English","Low Severity","Medicaid","Not Female"],branches:['Gainesville'], roles:["ABA","Male"], address:addresses[9]},{firstName: 'Andy Perez',subgroups:["Spanish",'High Severity',"BCBS","Not Male"],branches:['Gainesville','Atlanta'],roles:["ABA","Female"], address:addresses[10]},
  {firstName:'101',roles:['Room'],capacity:20,parent:["Gainesville"]},{firstName:'102',roles:['Room'],capacity:20,parent:["Gainesville"]},{firstName:'103',roles:['Room'],capacity:20,parent:["Gainesville"]},{firstName: 'Gainesville',branches:['Gainesville'],roles:["Clinic"], address:addresses[6]},{firstName: 'Custom',branches:['Gainesville','Atlanta'],roles:["Physical"]},{firstName: 'Telehealth',branches:['Atlanta','Gainesville'],roles:["Remote"]}, {firstName: 'Atlanta',branches:['Atlanta'],roles:["Clinic"], address:addresses[7]}, {firstName: 'Home_Client',branches:['Gainesville','Atlanta'],roles:["Home"], subgroups:['Home Client']},
{firstName: 'Direct',color: 'Green',roles:['Activity'], subgroups:['Home Client'] }, {firstName: 'Client_Meeting',color: 'pink',roles:['Activity']}, {firstName: 'One-On-One',roles:['subActivity'],parent: ['Client_Meeting']}, {firstName: 'Two-On-One',roles:['subActivity'],parent: ['Client_Meeting']}, {firstName: 'Supervision',color: 'Purple',roles:['Activity'], subgroups:['Home Client']},
{firstName: 'Lunch',color: 'Blue',roles:['Activity']},{firstName: 'Block A',color: 'Blue',branches:['Gainesville'],roles:['Block']},{firstName: 'Block B',color: 'Blue',branches:['Gainesville','Atlanta'],roles:['Block']},{firstName: 'Block C',color: 'Blue',branches:['Gainesville'],roles:['Block']},{firstName: 'Block D',color: 'Blue',branches:['Gainesville'],roles:['Block']}, {firstName: 'Medicaid', subgroups:['RBT REQ'], roles:['Funder'],branches:['Gainesville','Atlanta']}, {firstName: 'BCBS', roles:['Funder'],branches:['Gainesville','Atlanta']}, {firstName: 'Drive',color: 'Grayer',roles:['Activity']},{firstName: 'Nap',color: 'Red',roles:['Activity']},{firstName: 'Training',color: 'Yellow',roles:['Activity']}
  ]).map(e=>e.roles.includes('Activity') || e.roles.includes('subActivity') || e.roles.includes('Room') ? {...e,branches:['Gainesville','Atlanta']} : {...e}).map(e=> ({...e,available:[...av_t],id:uuid_arr.pop()})).concat([{firstName: 'Bill Welsh',subgroups:["English","Low Severity","Medicaid"],superUser:true,id:superAdminIds[0],available:[...av_t],branches:['Atlanta','Gainesville'],email:'silver.inventor@gmail.com',role:'admin',roles:["Super Admin","RBT","Male"],subgroups:['RBT REQ','Medicaid','English','Low Severity'],password: hash}]).map(e=>{
    if(e.firstName == 'Block A'){
      return {...e,available:[...av_t_block1]}
    }
    if(e.firstName == 'Block B'){
      return {...e,available:[...av_t_block2]}
    }
    if(e.firstName == 'Block C'){
      return {...e,available:[...av_t_block3]}
    }
    if(e.firstName == 'Block D'){
      return {...e,available:[...av_t_block4]}
    }
    return e
  }),



  events: [
    {
      users:['Bill Welsh','Andy Perez','Gainesville','Direct','Ariel Baner'],start: new Date(`${today} 10:00:00 EDT`), end: new Date(`${today} 13:00:00 EDT`), address: addresses[0],
       startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1, secondary:false,
    },
    {
      users:['Alicia Lasaga','Tyson Silver','Atlanta','Direct'],start: new Date(`${today} 11:00:00 EDT`), end: new Date(`${today} 15:00:00 EDT`), address: addresses[1],
       startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    },
    {
      users:['Bill Welsh','Gainesville','Supervision'],start: new Date(`${today} 10:00:00 EDT`), end: new Date(`${today} 11:00:00 EDT`), address: addresses[2],
       startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    },
    {
      users:['Bill Welsh','Gainesville','Training'],start: new Date(`${today} 08:15:00 EDT`), end: new Date(`${today} 09:30:00 EDT`), address: addresses[3],
     startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    },
    {
      users:['Alicia Lasaga','Atlanta','Lunch'],start: new Date(`${today} 13:00:00 EDT`), end: new Date(`${today} 15:00:00 EDT`), address: addresses[4],
       startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    },
    {
      users:['Andy Perez','Gainesville','Nap'],start: new Date(`${today} 09:00:00 EDT`), end: new Date(`${today} 10:30:00 EDT`), address: addresses[5],
      startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    }
  ].map(e=> ({...e,days:[...Object.values(day_ids)],id:uuid_arr.pop()})),

  timeconstraints: give_id([
    {user1Id:"Andy Perez",user2Id:"Direct",min:1000, max:1200, unit:'Hours', frequency:'Total', start:date_range_six_month_start, end:date_range_six_month_end},
    {user1Id:"Andy Perez",user2Id:"Direct",min:2.5, max:10, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
    {user1Id:"Andy Perez",user2Id:"Direct",min:5, max:10, unit:'Hours', frequency:'Weekly', start:date_range_six_month_start, end:date_range_six_month_end},
    {user1Id:"Bill Welsh",user2Id:"Direct",min:5, max:10, unit:'Hours', frequency:'Weekly', start:date_range_six_month_start, end:date_range_six_month_end},
    {user1Id:"Bill Welsh",user2Id:"Direct",min:2.5, max:10, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
  ]),

  priorities: give_id([
    {user1Id:"Alicia Lasaga", user2Id:"Andy Perez", rank:1},
  {user1Id:"Alicia Lasaga", user2Id:"Ariel Baner", rank:3},
  {user1Id:"Alicia Lasaga", user2Id:"Tyson Silver", rank:2},
  ])


}

const aces_branches = {
'Florida': {
  'South Tampa': '2111 West Swann Ave Ste 100 Tampa, FL'
}
}

//CHANGED START
// const aces_branches = {
//   Arizona: {
//  'Phoenix': '10320 W. McDowell Road, Suite K-1136 Avondale, AZ 85392',
//  'Tempe':'1801 South Jentilly Avenue, Unit C-20 Tempe, AZ 85281'
//   },
// California: {
//   'Bakersfield':'1405 Commercial Way, Ste 120, Bakersfield, CA 93309',
//   'Brentwood':'1191 Central Blvd., Suite A, Brentwood, CA 94513',
//   'Carlsbad': '2928 Jefferson Street, Suite 100 Carlsbad, CA 92008',
//   'Cerritos': '12604 Hiddencreek Way, Unit C Cerritos, CA 90703',
//   'Chula Vista': '310 3rd Ave #B8, Chula Vista, CA 91910',
//   'City of Industry': '17462 Colima Road Rowland Heights, CA 91748',
//   'Concord': '1855 2nd St, Suite B Concord, CA 94519',
//   'Corona': '1295 Corona Pointe Court, Suite 102 Corona, CA 92879',
//   'El Cajon': '321 Van Houten Ave., El Cajon, CA 92020',
//   'Escondido': '',
//   'Fairfield': '801 Jefferson St., Suite 3 Fairfield, CA 94533',
//   'Fresno': '530 East Herndon Avenue, Suite 105 Fresno, CA 93720',
//   'Garden Grove': '12465 Lewis Street, Suite 102 Garden Grove, CA 92840',
//   'Hayward': '1180 B. Street Hayward, CA 94541',
//   'Irvine': '16782 Von Karman Avenue, Suite 11 Irvine, CA 92606',
// 'Long Beach': '3431 Cherry Avenue, Long Beach, CA 90807',
// 'Modesto': '1101 Staniford Ave., Suite A1 Modesto, CA 95350',
// 'Mountain View': '1134 West El Camino Real, Mountain View CA 94040',
//  'Newark': '39899 Balentine Drive, Suite 110, Newark, CA 94560',
//  'Otay Ranch': '',
//   'Petaluma': '1425 N McDowell Blvd. Suite 206 Petaluma, CA 94954',
//   'Phillips Ranch': '21 Rancho Camino Dr. STE 106, 108 Pomona, CA 91766',
//   'Rancho Bernardo': '',
//  'Sacramento': '',
//  'Salinas': '',
//  'San Bruno': '901 Sneath Lane, Suite 105 San Bruno, CA 94066',
//   'San Diego': '5333 Mission Center Road, Suite 110 San Diego, CA 92108',
//   'San Diego Academy': '3715 6th Avenue San Diego, CA 92103',
//   'San Jose': '1887 Monterey Road, Suite 225 San Jose, CA 95112',
// 'Santa Cruz': '',
// 'Santa Rosa': '1160 N Dutton Ave., Suite 140 Santa Rosa, CA 95401',
//  'Stockton': '2453 Grand Canal Blvd., Suite A, Stockton, CA 95207',
// 'Temecula': '',
// 'Torrance': '23740 Hawthorne Blvd., Suite 104, Torrance, CA 90505',
// 'Tracy': '2850 N. Tracy Blvd. Suite 202 Tracy, CA 95376',
// 'Van Nuys': '16360 Roscoe Blvd. #100 Van Nuys, CA 91406'
// },
//   Colorado: {
//     'Colorado Springs':'1330 Quail Lake Loop, Suite 120 Colorado Springs, CO 80906'
//     ,'Denver': ''
//   },
//   Hawaii: {
//     'Aiea': '98-939 Moanalua, Building 3, Aiea, HI 96701'
//     ,'Waipahu': '94-849 Lumiaina Street, Suite 201 Waipahu, HI 96797'
//   },
//   Oklahoma: {
//     'Bartlesville': ''
//     ,'Bixby': '7810 East 108th Street, Tulsa, OK 74133'
//     ,'Norman': '1018 24th Ave. NW, Suite 110, Norman, OK 73069'
//     , 'Oklahoma City': ''
//     , 'Owasso': '9500 N 129th E Ave. Suite 114 Owasso, OK 74055'
//     ,'Tulsa': '7306 S Yale Ave., Tulsa, OK 74136'
//     ,},
//   Texas: {'Austin': '1101 W 40th St, Suite 102 Austin, TX 78756'
//   ,'Dallas Developmental Services': ''
//   , 'El Paso': '725 South Mesa Hills Drive, Building 3 El Paso, TX 79912'
//   ,'Killeen and Fort Hood': ''
//   , 'San Antonio': ''
// },
//   Utah: {'Salt Lake City':''},
//   Washington: {
//     'Lakewood': '10015 Lakewood Dr SW Lakewood, WA 98499',
//   'Seattle':''}
// }
//CHANGED END

//CHANGE START
// let user_counts_aces = give_id([
//  // {name: 'ABA', parent:'Client', type: 'Partial', count: 4200},
//  {name: 'ABA', parent:'Client', relationships:['Father','Mother'], type: 'Partial', count: 2000},
//   {name: 'Behavioral Interventionist', parent:'Employee', type: 'Partial', count: 2000, },
//   {name: 'Supervisor',parent:'Employee', type: 'Partial', count: 300},
//   {name: 'Front Desk',parent:'Employee', type: 'Full', count: 60},
//   {name: 'Client Onboarding Specialists',parent:'Employee', type: 'Full', count: 12},
//   {name: 'Schedulers',parent:'Employee', type: 'Full', count: 19},
//   {name: 'Reschedulers + Support',parent:'Employee', type: 'Full', count: 12},
//   {name: 'IT Team',parent:'Employee', type: 'Full', count: 4},
//   {name: 'Management',parent:'Employee', type: 'Full', count: 5},
//   {name: 'Marketing',parent:'Employee', type: 'Full', count: 5},
// ])
//CHANGE END
let user_counts_aces = give_id([
  // {name: 'ABA', parent:'Client', type: 'Partial', count: 4200},
  {name: 'ABA', parent:'Client', relationships:['Father','Mother'], type: 'Partial', count: 10},
  {name: 'Occupational Therapist', parent:'Employee', type: 'Partial', count: 1, },
  {name: 'Physical Therapist', parent:'Employee', type: 'Partial', count: 1, },
  {name: 'Speech Therapist', parent:'Employee', type: 'Partial', count: 1, },
  {name: 'Behavioral Interventionist', parent:'Employee', type: 'Partial', count: 10, },
   {name: 'Supervisor',dataAccessGroup:'Teams',parent:'Employee', type: 'Partial', count: 1},
  //  {name: 'Front Desk',parent:'Employee', type: 'Full', count: 1},
  //  {name: 'Client Onboarding Specialists',parent:'Employee', type: 'Full', count: 2},
  //  {name: 'Schedulers',parent:'Employee', type: 'Full', count: 1},
  //  {name: 'Reschedulers + Support',parent:'Employee', type: 'Full', count: 1},
  //  {name: 'IT Team',parent:'Employee', type: 'Full', count: 1},
  //  {name: 'Management',parent:'Employee', type: 'Full', count: 1},
  //  {name: 'Marketing',parent:'Employee', type: 'Full', count: 1},
 ])
let ii = 0
user_counts_aces = user_counts_aces.map(e=> {
  const fraction = Math.round(e.count/1)+1
  const fraction2 = e.relationships ? fraction*(e.relationships.length) : fraction
  //console.log('slicky',fraction,fraction2)
  //return 'd'
  //console.log('smitty',ii,ii+fraction,ii+fraction+1,ii+fraction+fraction2+1);
  const obj = {...e, firstNames: names.people.slice(ii,ii+fraction), relationships_firstNames:names.people.slice(ii+fraction+1,ii+fraction+fraction2+1)}
  ii += fraction+fraction2+2
  //const obj = {...e, firstNames: names.people.slice(ii,ii+e.count)}
  //ii += e.count
  //return ['sdvsd']
  return obj
})


const aces_branches_names = Object.values(aces_branches).flatMap(e=>Object.keys(e))
const user_aces_locations = aces_branches_names.flatMap(e=>{
  return [{id:uuid_arr.pop(),capacity:30,address:_.sample(addresses),firstName:e,roles:['Clinic'], color:'Black', branches:[e]},
  // {firstName:`101 ${e}`,subgroups:['Room 101'],roles:['Room'],capacity:8,parent:[e],color:'Red', branches:[e]},
  // {firstName:`102 ${e}`,subgroups:['Room 102'],roles:['Room'],capacity:8,parent:[e],color:'Pink', branches:[e]},
  // {firstName:`103 ${e}`,subgroups:['Room 103'],roles:['Room'],capacity:8,parent:[e],color:'Yellow', branches:[e]},
]
})
const user_aces_activities = [
  {firstName: 'Home',color: 'Blue',address:_.sample(addresses),roles:['Home']},
  {firstName: 'Telehealth',color: 'Purple',roles:['Virtual']},
  {firstName: 'Direct',billable:true,color: 'Green',roles:['Activity']},
  
  {firstName: 'SP',color: 'Orange',roles:['Activity']},
  {firstName: 'Parent Training',color: 'Black',roles:['Activity']},

  
  {firstName: 'OT',color: 'Magenta',roles:['Activity']},
  {firstName: 'PT',color: 'Brown',roles:['Activity']},
  {firstName: 'Supervision',billable:true,color: 'Purple',roles:['Activity']},
 // {firstName: 'Group',color: 'Yellow',roles:['Activity']},
  {firstName: 'Assessment',billable:true,color: 'Yellow',roles:['Activity']},
  {firstName: 'Nap',color: 'Red',roles:['Activity']},
  {firstName: 'Drive',color: 'Blue',roles:['Activity']},
  {firstName: 'Break',color: 'Pink',roles:['Activity'],available:[...av_t_break]},
  {firstName: 'Lunch',color: 'Orange',roles:['Activity'],available:[...av_t_lunch]},

].map(e=>{
  return {...e,id:uuid_arr.pop(),branches:aces_branches_names}
})
//CHANGE START
// const user_aces_funders = [
//   //{firstName: 'Medicaid',color: 'Green',roles:['Funder']},
  
//   //{firstName: 'BCBS',color: 'Purple',roles:['Funder']},
// ].map(e=>{
//   return {...e,id:uuid_arr.pop(),branches:aces_branches_names}
// })
//CHANGE END
const user_aces_funders = [
  //{firstName: 'Medicaid',color: 'Green',roles:['Funder']},
  {firstName: 'TRICARE',color: 'Green',roles:['Funder']},
 // {firstName: 'BCBS',color: 'Purple',roles:['Funder']},
].map(e=>{
  return {...e,id:uuid_arr.pop(),branches:aces_branches_names}
})

const user_aces_blocks = [
  //{firstName: 'Medicaid',color: 'Green',roles:['Funder']},
  //{firstName: 'Lunch_Block A',available:[...av_t_block1_lunch],color: 'Purple',roles:['Block_Lunch']},
 // {firstName: 'Lunch_Block B',available:[...av_t_block2_lunch],color: 'Purple',roles:['Block_Lunch']},
 // {firstName: 'Lunch_Block C',available:[...av_t_block3_lunch],color: 'Purple',roles:['Block_Lunch']},
 // {firstName: 'Lunch_Block D',available:[...av_t_block4_lunch],color: 'Purple',roles:['Block_Lunch']},
  {firstName: 'Block A',available:[...av_t_block1],color: 'Purple',roles:['Block']},
  {firstName: 'Block B',available:[...av_t_block2],color: 'Purple',roles:['Block']},
  {firstName: 'Block C',available:[...av_t_block3],color: 'Purple',roles:['Block']},
  {firstName: 'Block D',available:[...av_t_block4],color: 'Purple',roles:['Block']},
].map(e=>{
  return {...e,id:uuid_arr.pop(),branches:aces_branches_names}
})
const branch_length = aces_branches_names.length
let branch_counter = 0
//console.log('slomby',aces_branches_names);
const user_counts_aces_users = user_counts_aces.flatMap(e=> {
  return e.firstNames.flatMap((p,index)=>{
    //const branch = _.sample(aces_branches_names)
    const branch = aces_branches_names[branch_counter]
    branch_counter = (branch_counter + 1) % branch_length
    
    let obj = [{firstName: p,address:_.sample(addresses),subgroups:[..._.sampleSize(teams_ABA,getRandomInt(teams_ABA.length)),..._.sampleSize(subgroups_ABA,getRandomInt(subgroups_ABA.length)),..._.sampleSize(languages_ABA,getRandomInt(languages_ABA.length))],branches:[branch], roles:[e.name]}]
    if(e.name == 'ABA'){

      
      obj[0] = {...obj[0],roles:['ABA','OT','SP','PT'],subgroups:[...obj[0].subgroups,..._.sampleSize(rooms_ABA,getRandomInt(1))],available:[...av_t_f().map(t=>({...t,location:[_.sample(['Home',branch])]}))]}
    }
    if(e.relationships){
     
     //THIS CREATES THE CONTACTS
      // e.relationships.map((relationship,index5)=>{
      //   obj.push({firstName: e.relationships_firstNames[(index*(e.relationships.length))+index5],subgroups:[],branches:[branch], relationship_user_firstName: p, relationship:relationship, roles:['Contact']})
      // })
      //THIS CREATES THE CONTACTS
    }
    return obj
  })
})

//console.log('flicky5',user_counts_aces_users);
//console.log('stimpy',user_counts_aces);
const company_info3 = {
  industry: 'ABA',
  company: 'ACES',
  companyId: ids[2],
  nogapsconstraint: ['Client'],
  eventpair: give_id([{roles1:['Behavioral Interventionist','ABA'],roles2:['Supervisor'],activity1:'Direct',activity2:'Supervision'}]),
  capacityconstraints: give_id([
    //{user1Id: 'Direct', role1Id:'Behavioral Interventionist',min1:1,max1:1,role2Id:'ABA',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1,role4Id:'Block',min4:1,max4:1},
    {user1Id: 'Direct', role1Id:'Behavioral Interventionist',min1:1,max1:1,role2Id:'ABA',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
    {user1Id: 'Supervision', role1Id:'Supervisor',min1:1,max1:1,role2Id:'ABA',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
    {user1Id: 'OT', role1Id:'Occupational Therapist',min1:1,max1:1,role2Id:'OT',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
    {user1Id: 'SP', role1Id:'Speech Therapist',min1:1,max1:1,role2Id:'SP',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
    {user1Id: 'PT', role1Id:'Physical Therapist',min1:1,max1:1,role2Id:'PT',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
    {user1Id: 'Parent Training', role1Id:'Supervisor',min1:1,max1:1,role2Id:'ABA',min2:1,max2:1,role3Id:'Funder',min3:1,max3:1},
    //{user1Id: 'Lunch', role1Id:'Employee',min1:1,max1:1,role2Id:'Block_Lunch',min2:1,max2:1},
    {user1Id: 'Lunch', role1Id:'Employee',min1:1,max1:1},
    //{user1Id: 'Lunch', role1Id:'Client',min1:1,max1:1},
   // {user1Id: 'Client_Meeting', role1Id:'Employee',min1:1,max1:1},
    {user1Id: 'Drive', role1Id:'Employee',min1:1,max1:1},
    {user1Id: 'Break', role1Id:'Employee',min1:1,max1:1},
    {user1Id: 'Nap', role1Id:'Client',min1:1,max1:1},
  ]),
  //cancellationtypes: [],
  locations: [{name:'Home',parent:'Physical'},{name:'Clinic',parent:'Physical'},],
  branches: aces_branches_names,
  roles: user_counts_aces.map(e=>({id:e.id,name:e.name,parent:e.parent,dataAccessGroup:e.dataAccessGroup})),
  //superUserId: 'c9391e02-6894-406f-874c-5584b238ca55',
  //superUser: {firstName: 'Bill Welsh',id:'c9391e02-6894-406f-874c-5584b238ca55',branches:['Gainesville'],email:'silver.inventor@gmail.com',role:'admin',roles:["RBT"],password: hash},
  users: user_aces_locations.concat(user_aces_activities,user_aces_blocks,user_aces_funders).map(e=> {
    if(e.available){
      return {...e,id:uuid_arr.pop()}  
    }
    return {...e,available:[...av_t],id:uuid_arr.pop()}
}).concat(user_counts_aces_users.map(e=> (e.available ? {...e,id:uuid_arr.pop()}  : {...e,available:[...av_t_f()],id:uuid_arr.pop()})),[{firstName: 'Bill Welsh',subgroups:["English","Low Severity","Medicaid"],superUser:true,id:superAdminIds[2],available:[...av_t],branches:aces_branches_names,email:'silver.inventor@gmail.com',role:'admin',roles:["Super Admin","RBT"],password: hash},]),



  events: [
   ].map(e=> ({...e,days:[...Object.values(day_ids)],id:uuid_arr.pop()})),

  timeconstraints: give_id(
    user_counts_aces_users.flatMap(e=>{
      let stuff = []
    if(e.roles.includes('ABA')){
      stuff = [...stuff,{user1Id:e.firstName,user2Id:"Direct",min:36, max:36, unit:'Hours', frequency:'Weekly', start:new Date(), end:date_range_six_month_end2},
    {user1Id:e.firstName,user2Id:"Direct",min:1, max:8, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
    {user1Id:e.firstName,user2Id:"Supervision",min:50, max:100, unit:'Hours', frequency:'Total', start:new Date(), end:date_range_six_month_end2},
    {user1Id:e.firstName,user2Id:"Supervision",min:0.5, max:6, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end}
  ]
    }
    if(e.roles.includes('OT')){
        stuff = [...stuff,{user1Id:e.firstName,user2Id:"OT",min:25, max:25, unit:'Hours', frequency:'Total', start:new Date(), end:date_range_six_month_end2},
        {user1Id:e.firstName,user2Id:"OT",min:.25, max:1, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
      ]
      }
      if(e.roles.includes('SP')){
        stuff = [...stuff,{user1Id:e.firstName,user2Id:"SP",min:25, max:25, unit:'Hours', frequency:'Total', start:new Date(), end:date_range_six_month_end2},
        {user1Id:e.firstName,user2Id:"SP",min:.25, max:1, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
      ]
      }
      if(e.roles.includes('PT')){
        stuff = [...stuff,{user1Id:e.firstName,user2Id:"PT",min:25, max:25, unit:'Hours', frequency:'Total', start:new Date(), end:date_range_six_month_end2},
        {user1Id:e.firstName,user2Id:"PT",min:.25, max:1, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
      ]
      }
    // if(e.roles.includes('OT')){
    //   stuff = [...stuff,{user1Id:e.firstName,user2Id:"OT",min:1, max:1, unit:'Hours', frequency:'Weekly', start:new Date(), end:date_range_six_month_end2},
    //   {user1Id:e.firstName,user2Id:"OT",min:.25, max:1, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
    // ]
    // }
    // if(e.roles.includes('SP')){
    //   stuff = [...stuff,{user1Id:e.firstName,user2Id:"SP",min:1, max:1, unit:'Hours', frequency:'Weekly', start:new Date(), end:date_range_six_month_end2},
    //   {user1Id:e.firstName,user2Id:"SP",min:.25, max:1, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
    // ]
    // }
    // if(e.roles.includes('PT')){
    //   stuff = [...stuff,{user1Id:e.firstName,user2Id:"PT",min:1, max:1, unit:'Hours', frequency:'Weekly', start:new Date(), end:date_range_six_month_end2},
    //   {user1Id:e.firstName,user2Id:"PT",min:.25, max:1, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
    // ]
    // }

    return stuff
 
    
  }).concat(
    [{role1Id:'Client',user1Id:'TRICARE',user2Id:"Direct",min:0, max:8, unit:'Hours', frequency:'Daily', start:date_range_six_month_start, end:date_range_six_month_end}]
  //  {user1Id:'Break',user2Id:'Break',min:.25, max:.25, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end}
    )
  ),

  priorities: give_id([
  //   {user1Id:"Alicia Lasaga", user2Id:"Andy Perez", rank:1},
  // {user1Id:"Alicia Lasaga", user2Id:"Ariel Baner", rank:3},
  // {user1Id:"Alicia Lasaga", user2Id:"Tyson Silver", rank:2},
  ])


}


const company_info2 = {
  industry: 'Tutoring',
  company: 'FoxDen Tutoring',
  companyId: ids[1],
  branches: ['Conway','Little Rock'],
  //superUserId: 'c9391e02-6894-406f-874c-5584b238ca55',
  //superUser: {firstName: 'Bill Welsh',id:'c9391e02-6894-406f-874c-5584b238ca55',branches:['Gainesville'],email:'silver.inventor@gmail.com',role:'admin',roles:["RBT"],password: hash},
  users: [{firstName: 'Bill Welsh',subgroups:["Math"],branches:['Conway','Little Rock'], roles:["Student"]},{firstName: 'Gracie Lively',subgroups:["Marketing"],branches:['Little Rock'], roles:["Tutor"], address:addresses[8]},{firstName: 'Ben Watson',subgroups:["Leadership"],branches:['Little Rock'], roles:["Student"], address:addresses[9]},{firstName: 'Jacob Lively',subgroups:["Business"],branches:['Little Rock','Conway'],roles:["Tutor"], address:addresses[10]},
  {firstName:'101',roles:['Room'],capacity:20,parent:["Little Rock"]},{firstName:'102',roles:['Room'],capacity:20,parent:["Little Rock"]},{firstName:'103',roles:['Room'],capacity:20,parent:["Little Rock"]},{firstName: 'Little Rock',branches:['Little Rock'],roles:["Center"], address:addresses[6]}, {firstName: 'Conway',branches:['Conway'],roles:["Center"], address:addresses[7]}, {firstName: 'Home_Client',branches:['Little Rock','Conway'],roles:["Home"]},
{firstName: 'One-on-One',color: 'Green',roles:['Activity']},{firstName: 'Group',color: 'Green',roles:['Activity']},
{firstName: 'Lunch',color: 'Blue',roles:['Activity']}, {firstName: 'Training',color: 'Yellow',roles:['Activity']},{firstName:'Science',roles:['subActivity'],subgroups:["Science"],parent:["One-on-One","Group"]},{firstName:'Math',roles:['subActivity'],subgroups:["Math"],parent:["One-on-One","Group"]},
  ].map(e=>e.roles.includes('Activity') || e.roles.includes('subActivity') || e.roles.includes('Room') ? {...e,branches:['Conway','Little Rock']} : {...e}).map(e=> ({...e,available:[...av_t],id:uuid_arr.pop()})).concat([{firstName: 'Todd Denton',subgroups:["Science"],superUser:true,id:superAdminIds[1],available:[...av_t],branches:['Little Rock'],email:'silver.inventors@gmail.com',role:'admin',roles:["Super Admin","Tutor"],password: hash}]),

  events: [
    {
      users:['Gracie Lively','Ben Watson','Little Rock','Group','Science'],start: new Date(`${today} 10:00:00 EDT`), end: new Date(`${today} 13:00:00 EDT`), address: addresses[0],
       startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1, secondary:false,
    },
    {
      users:['Todd Denton','Jacob Lively','Conway','Group','Math'],start: new Date(`${today} 11:00:00 EDT`), end: new Date(`${today} 15:00:00 EDT`), address: addresses[1],
       startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    },
    // {
    //   users:['Bill Welsh','Gainesville','Supervision'],start: new Date(`${today} 10:00:00 EDT`), end: new Date(`${today} 11:00:00 EDT`), address: addresses[2],
    //    startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    // },
    // {
    //   users:['Bill Welsh','Gainesville','Training'],start: new Date(`${today} 08:15:00 EDT`), end: new Date(`${today} 09:30:00 EDT`), address: addresses[3],
    //  startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    // },
    // {
    //   users:['Alicia Lasaga','Atlanta','Lunch'],start: new Date(`${today} 13:00:00 EDT`), end: new Date(`${today} 15:00:00 EDT`), address: addresses[4],
    //    startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    // },
    // {
    //   users:['Andy Perez','Gainesville','Nap'],start: new Date(`${today} 09:00:00 EDT`), end: new Date(`${today} 10:30:00 EDT`), address: addresses[5],
    //   startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
    // }
  ].map(e=> ({...e,days:[...Object.values(day_ids)],id:uuid_arr.pop()})),

  // timeconstraints: give_id([
  //   {user1Id:"Andy Perez",user2Id:"Direct",min:1000, max:1200, unit:'Hours', frequency:'Total', start:date_range_six_month_start, end:date_range_six_month_end},
  //   {user1Id:"Andy Perez",user2Id:"Direct",min:2.5, max:10, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
  //   {user1Id:"Andy Perez",user2Id:"Direct",min:5, max:10, unit:'Hours', frequency:'Weekly', start:date_range_six_month_start, end:date_range_six_month_end},
  //   {user1Id:"Bill Welsh",user2Id:"Direct",min:5, max:10, unit:'Hours', frequency:'Weekly', start:date_range_six_month_start, end:date_range_six_month_end},
  //   {user1Id:"Bill Welsh",user2Id:"Direct",min:2.5, max:10, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
  // ]),
  timeconstraints: [],

  // priorities: give_id([
  //   {user1Id:"Alicia Lasaga", user2Id:"Andy Perez", rank:1},
  // {user1Id:"Alicia Lasaga", user2Id:"Ariel Baner", rank:3},
  // {user1Id:"Alicia Lasaga", user2Id:"Tyson Silver", rank:2},
  // ])

  priorities: [],


}


const convert_company = (company_info1) => {
  //console.log('steamer2',JSON.stringify(company_info1));
  //return
  const companyId = company_info1.companyId
  const industry = company_info1.industry
  //const superUserId = company_info1.superUserId.id

  //const superUserId = company_info1.users.find(e=>e.firstName==company_info1.superUser).id
  const superUserId = company_info1.users.find(e=>e.superUser).id
  let usersRoomsUsers = []
  let usersRelationshipsRelationships = []
  let usersRelationshipUsersUsers = []
  let nogapsconstraintRolesRoles = []
  let availabilitiesLocation2Users = []

  const companies = trans2([{id:companyId, name: company_info1.company}])
  
  const cancellationtypes_temp = industries2[industry].cancellationtypes

  const cancellationtypes = trans3(superUserId,cancellationtypes_temp)

  const timeofftypes_temp = industries2[industry].timeofftypes

  const timeofftypes = trans3(superUserId,timeofftypes_temp)

  const relationships_temp = industries2[industry].relationships

  const relationships = trans3(superUserId,relationships_temp)
//console.log('cricky',company_info1.users);
//return
  const users = trans2(company_info1.users.flatMap(e=>{
    if(!e.email){
      e.email = `${e.firstName.replace(" ",'.')}@gmail.com`
    }
    let obj = {address:e.address,companyId:companyId,id:e.id,firstName:e.firstName,email:e.email,emailVerified: true,role:'Admin',password:hash,}
    if(e.roles.includes('ABA')){
      
      const d = randomDate(new Date(2005, 0, 1), new Date(2020, 0, 1));
      obj = {...obj,birthday:d}
    }
    if(e.capacity){
      obj = {...obj,capacity:e.capacity}
    }
    if(e.billable){
      obj = {...obj,billable:true}
    }
    if(e.relationship){
      const relationship_id = relationships.find(relationship=>e.relationship == relationship.name).id
      usersRelationshipsRelationships.push({userId:e.id,relationshipId:relationship_id})
      const relationship_user_id = company_info1.users.find(user=>user.firstName == e.relationship_user_firstName).id
      usersRelationshipUsersUsers.push({userId:e.id,relationshipUserId:relationship_user_id})
      
      //obj = {...obj, relationshipId: relationships.find(relationship=>e.relationship == relationship.name).id}
    }
    let array =[obj]
    if(e.roles.includes('Room') || e.roles.includes('subActivity')){
        const room_id = e.id
        array = []
        array.push({companyId:companyId,capacity:e.capacity,id:room_id,firstName:e.firstName,emailVerified: true,role:'Admin',password:hash,})
        e.parent.map(parentName => {
          const parent = company_info1.users.find(user=>user.firstName == parentName)
        
          usersRoomsUsers.push({userId:parent.id,roomId:room_id})
        })
        
      
    }
    return array
  }))
  const branches = trans3(superUserId,company_info1.branches.map(e=>({name:e,id:uuid_arr.pop()})))
  const settingscompany = trans3(superUserId,industries2[industry].settingscompany.map(e=>({...e,id:uuid_arr.pop()})))
  let groupingsRoles1Roles = []
  let groupingsRoles2Roles = []

  let eventpairRoles1Roles = []
  let eventpairRoles2Roles = []
  let rolesDataAccessGroupsRealGroupings = []
  industries2[industry].roles = give_id(industries2[industry].roles)
  
  
  const roles_temp = company_info1.roles ? industries2[industry].roles.concat(company_info1.roles) : industries2[industry].roles

  const roles = trans3(superUserId,roles_temp.map(e=>{
                const parent = e.parent
                let obj = {name:e.name, id:e.id}
                if(parent){
                  const parentId = industries2[company_info1.industry].roles.find(r=>r.name==parent).id
                  obj = {...obj, parentId: parentId}
                }
                if(e.dataAccess){
                  obj = {...obj, dataAccess:e.dataAccess}
                }
                else{
                  obj = {...obj, dataAccess:'User'}
                }
                if(e.dataAccessGroup){
                  rolesDataAccessGroupsRealGroupings.push({roleId:e.id,groupingId:industries2[industry].groupings.find(t=>t.name == e.dataAccessGroup).id})
                  //obj = {...obj, dataAccessGroupId:roles_temp.find(t=>t.name == e.dataAccessGroup).id}
                }
                if(e.privileges){
                  Object.entries(e.privileges).map(p=>{
                    const [key,value] = p
                    obj = {...obj, [key]:value}
                  })
                }
                else {
                  obj = {...obj, statistics:'NA',constraints:'NA',events:'NA',subgroups:'NA',cancellations:'NA',availabilities:'NA',scheduler:'V'}
                }
                return obj
              }))

  const groupings = trans3(superUserId,industries2[industry].groupings.map(e=>{
    const groupId = uuid_arr.pop()
    e.roles1.map(role=>groupingsRoles1Roles.push({groupingId:groupId,roleId:roles.find(r=>r.name==role).id}))
    e.roles2.map(role=>groupingsRoles2Roles.push({groupingId:groupId,roleId:roles.find(r=>r.name==role).id}))
    return {id:groupId,name:e.name,min:e.min,max:e.max}
  }))

const subgroups = trans3(superUserId,industries2[industry].subgroups.map(e=>({id:e.id,name:e.name, groupId: groupings.find(t=>t.name==e.groupId).id})))

  const usersBranchesBranches = trans2(company_info1.users.filter(e=>e.branches).flatMap(e=>{
   
    return e.branches.map(branch => {
     //console.log('hoopy',branch,branches);
    return {branchId:branches.find(t=>t.name == branch).id,userId:e.id}
   })
     }))

    const usersRolesRoles = trans2(company_info1.users.filter(e=>e.roles).flatMap(e=>{
    let rooms = []
      if(e.rooms){
        e.rooms.map(room=>{
          rooms.push({roleId:roles.find(t=>t.name == 'Room').id,userId:users.find(t=>t.firstName == room).id})
        //const roomId = users.find(t=>t.name == room).id
        })
    }
      return e.roles.map(role => {
      return {roleId:roles.find(t=>t.name == role).id,userId:e.id}
    })
      }))

      const eventpair_temp = company_info1.eventpair ? company_info1.eventpair : industries2[industry].eventpair

      const eventpair = trans3(superUserId, eventpair_temp.map(e=>{
        const activity1 = users.find(t=>t.firstName == e['activity1']).id
        const activity2 = users.find(t=>t.firstName == e['activity2']).id
        e.roles1.map(role=>eventpairRoles1Roles.push({eventpairId:e.id,roleId:roles.find(r=>r.name==role).id}))
        e.roles2.map(role=>eventpairRoles2Roles.push({eventpairId:e.id,roleId:roles.find(r=>r.name==role).id}))
        return {id:e.id,activity1Id:activity1,activity2Id:activity2}
      }))

    const events = trans3(superUserId,company_info1.events.map(e=>({id:e.id,startRecur:e.startRecur,endRecur:e.endRecur,start:e.start,end:e.end,frequency:e.frequency,interval:e.interval,address:e.address})))
    const eventsDaysOfWeekDaysofweek = trans2(company_info1.events.filter(e=>e.days).flatMap(e=>{
      return e.days.map(day => {
        //console.log('plot',day)
        return {daysofweekId:day,eventId:e.id}
      })
        }))

    const eventsUsersUsers = trans2(company_info1.events.filter(e=>e.users).flatMap(e=>{
      return e.users.map(user => {
        return {userId:users.find(t=>t.firstName == user).id,eventId:e.id}
      })
        }))

    const subgroupsUserUsers = trans2(company_info1.users.filter(e=>e.subgroups).flatMap(e=>{
      return e.subgroups.map(subgroup => {
       // console.log('plik',subgroup)
        return {subgroupId:subgroups.find(t=>t.name == subgroup).id,userId:e.id}
      })
        }))

    const capacityconstraints_temp = company_info1.capacityconstraints ? company_info1.capacityconstraints : industries2[industry].capacityconstraints


    const capacityconstraints = trans3(superUserId, capacityconstraints_temp.map(e=>{
      const userId = users.find(t=>t.firstName == e[`user1Id`])
      const userId2 = users.find(t=>t.firstName == e[`user2Id`])
      let obj = userId2 && userId2.id ? {id:e.id,user1Id: userId.id,user2Id: userId2.id} : {id:e.id,user1Id: userId.id}
      for (let index = 1; index < 6; index++) {
        //const userId = users.find(t=>t.firstName == e[`user${index}Id`])
        const roleId = roles.find(t=>t.name == e[`role${index}Id`])
        const min = e[`min${index}`]
        const max = e[`max${index}`]

        if(userId && roleId && userId.id && roleId.id && min && max){
          obj = {...obj, [`role${index}Id`]:roleId.id,[`min${index}`]:min,[`max${index}`]:max }
        }
        
      }
      //console.log('thrig',obj)
      return obj
    }))



  let availabilitiesDaysDaysofweek = []
  const availabilities = trans3(superUserId,company_info1.users.flatMap(e=>e.available.map(r=> {
    const availabilityId = uuid_arr.pop()
    //console.log('smocker',r);
    if(r.location){
      //console.log('smicker',r.location);
      r.location.map(loc=>{
        const user = users.find(user=>user.firstName == loc).id
        availabilitiesLocation2Users.push({availabilityId:availabilityId,userId:user})
      })
    }
    r.days.map(dayId=>availabilitiesDaysDaysofweek.push({availabilityId:availabilityId,daysOfWeekId:dayId}))
    return {startTime:r.startTime,endTime:r.endTime,available:r.available,startRange:r.startRange,endRange:r.endRange,id:availabilityId,userId:e.id}}
    )))

  const timeconstraints = trans3(superUserId,company_info1.timeconstraints.map(e=> {
    const user1Id = users.find(user=>user.firstName == e.user1Id).id
    const user2Id = users.find(user=>user.firstName == e.user2Id).id
    let obj_here = {...e, user1Id:user1Id, user2Id:user2Id}
    if(e.role1Id){
      const role1Id = roles.find(t=>t.name == e.role1Id)
      obj_here = {...obj_here, role1Id:role1Id.id}
    }
    return obj_here
  }))

  const priorities = trans3(superUserId,company_info1.priorities.map(e=> {
    const user1Id = users.find(user=>user.firstName == e.user1Id).id
    const user2Id = users.find(user=>user.firstName == e.user2Id).id
    return {...e, user1Id:user1Id, user2Id:user2Id}
  }))

  const nogapsconstraint = trans3(superUserId,company_info1.nogapsconstraint.map(e=> {
    const id = uuid_arr.pop()
    nogapsconstraintRolesRoles.push({roleId:roles.find(t=>t.name == e).id,nogapsconstraintId:id})
    return {id}
  }
  ))
  

  nogapsconstraintRolesRoles = trans2(nogapsconstraintRolesRoles)
    availabilitiesDaysDaysofweek = trans2(availabilitiesDaysDaysofweek)
    usersRoomsUsers = trans2(usersRoomsUsers)
    groupingsRoles1Roles = trans2(groupingsRoles1Roles)
    groupingsRoles2Roles = trans2(groupingsRoles2Roles)
    eventpairRoles1Roles = trans2(eventpairRoles1Roles)
    eventpairRoles2Roles = trans2(eventpairRoles2Roles)
    usersRelationshipsRelationships = trans2(usersRelationshipsRelationships)
    usersRelationshipUsersUsers = trans2(usersRelationshipUsersUsers)
    availabilitiesLocation2Users = trans2(availabilitiesLocation2Users)
    rolesDataAccessGroupsRealGroupings = trans2(rolesDataAccessGroupsRealGroupings)

  return {
    companies:[companies,'id',false],
    users:[users,'companyId',false],
    branches:[branches,'name',true],
    roles:[roles,'name',true],
    settingscompany:[settingscompany,'name',true],
    cancellationtypes:[cancellationtypes,'name',true],
    timeofftypes:[timeofftypes,'name',true],
    relationships:[relationships,'name',true],
    availabilities:[availabilities,false,true],
    availabilitiesDaysDaysofweek:[availabilitiesDaysDaysofweek,false,false],
    usersRoomsUsers:[usersRoomsUsers,false,false],
    usersRelationshipsRelationships:[usersRelationshipsRelationships,false,false],
    usersRelationshipUsersUsers:[usersRelationshipUsersUsers,false,false],
    usersBranchesBranches:[usersBranchesBranches,false,false],
    usersRolesRoles:[usersRolesRoles,false,false],
    eventsUsersUsers:[eventsUsersUsers,false,false],
    subgroupsUserUsers:[subgroupsUserUsers,false,false],
    availabilitiesLocation2Users:[availabilitiesLocation2Users,false,false],
    events:[events,false,true],
    groupings:[groupings,'name',true],
    subgroups:[subgroups,'name',true],
    timeconstraints: [timeconstraints,false,true],
    priorities: [priorities,false,true],
    nogapsconstraint: [nogapsconstraint,false,true],
    capacityconstraints:[capacityconstraints,false,true],
    eventsDaysOfWeekDaysofweek:[eventsDaysOfWeekDaysofweek,false,false],
    groupingsRoles1Roles:[groupingsRoles1Roles,false,false],
    groupingsRoles2Roles:[groupingsRoles2Roles,false,false],
    eventpair:[eventpair,false,true],
    eventpairRoles1Roles:[eventpairRoles1Roles,false,false],
    eventpairRoles2Roles:[eventpairRoles2Roles,false,false],
    nogapsconstraintRolesRoles:[nogapsconstraintRolesRoles,false,false],
    rolesDataAccessGroupsRealGroupings:[rolesDataAccessGroupsRealGroupings,false,false]
  } 
}



const aba_industry = {id:industries_ids['ABA'],name:'ABA'}
const tutoring_industry = {id:industries_ids['Tutoring'],name:'Tutoring'}
const cleaning_industry = {id:industries_ids['Cleaning'],name:'Cleaning'}
const painting_industry = {id:industries_ids['Painting'],name:'Painting'}
const oil_industry = {id:industries_ids['Oil'],name:'Oil'}

const industries = [aba_industry,tutoring_industry,painting_industry,cleaning_industry,oil_industry]

const autismWorldwide = {name: 'Autism Worldwide', industryId:aba_industry.id}
const pediatricsPlus = {name: 'Pediatrics Plus', industryId:aba_industry.id}

const companies = give_id([autismWorldwide,pediatricsPlus])

const employee = {id: resource_ids.employees_id,name: 'Employee', reusable:true}
const client = {id: resource_ids.clients_id,name: 'Client', reusable:true}
const contact = {id: resource_ids.contacts_id,name: 'Contact', reusable:true}
const location = {id: resource_ids.locations_id,name: 'Location', reusable:true}
const activity = {id: resource_ids.activitys_id,name: 'Activity', reusable:true}
let resources = [employee,client,location,contact,activity]

const visitor = {name:'Visitor', reusable:true}
resources = resources.concat(give_id([visitor]))

let resource_role = {name:'Resource'}
let resource_role2 = give_id([resource_role])

const person_role = {name: 'Person',parentId:resource_role.id}
const location_role = {name: 'Location',parentId:resource_role.id}
const activity_role = {name: 'Activity',parentId:resource_role.id}


let resources_all = give_id([person_role,location_role,activity_role])

const employee_role = {name:'Employee',parentId:person_role.id}
const client_role = {name:'Client',parentId:person_role.id}
const physcial_role = {name: 'Physical', parentId:location_role.id}
const remote_role = {name: 'Remote', parentId:location_role.id}

let people = give_id([employee_role,client_role])
let locations_type_all = give_id([physcial_role,remote_role])


const home_role = {name: 'Home',parentId:physcial_role.id}
const community_role = {name: 'Community',parentId:physcial_role.id}
const clinic_role = {name: 'Clinic',parentId:physcial_role.id}
const telehealth_role = {name: 'Telehealth',parentId:remote_role.id}
const school_role = {name: 'School',parentId:physcial_role.id}

let locations_all = give_id([home_role,community_role,clinic_role,telehealth_role,school_role])


const rbt = {name: 'RBT',parentId:employee_role.id, scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const bcba = {name: 'BCBA',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const bcaba = {name: 'BCaBA',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const bt = {name: 'BT',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const director = {name: 'Director',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const admin = {name: 'Admin',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const ot = {name: 'OT',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const slp = {name: 'SLP',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const pt = {name: 'PT',parentId:employee_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}
const aba = {name: 'ABA',parentId:client_role.id,scheduler:"E", dataAccess:"All",availabilities:"E",cancellations:"E"}

let employees_all = give_id([rbt, bcba, bcaba, bt, director, admin, ot, slp, pt])
let clients_all = give_id([aba])

const guest = {name: 'Guest', typeId:visitor.id}
//const roles = give_id([rbt, bcba, bcaba, bt, director, admin, ot, slp, pt, aba,guest,
//home_role,community_role,clinic_role,telehealth_role,school_role])

const roles_list = [
  resource_role2,resources_all,people,locations_type_all,locations_all,employees_all,clients_all,
  //,[],[],[]
]

const user_first = [{
  id: ids[0],
  firstName: 'Admin',
  email: config.admin.email,
  emailVerified: true,
  role: 'admin',
  provider: config.providers.local,
  password: hash,
  createdAt: new Date(),
  updatedAt: new Date()
}]

let users = [
  
  {
    id: ids[1],
    firstName: 'John',
    email: 'john@doe.com',
    emailVerified: true,
    role: 'user',
    provider: config.providers.local,
    password: hash,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: ids[2],
    firstName: 'Client',
    email: 'client@hello.com',
    emailVerified: true,
    role: 'user',
    provider: config.providers.local,
    password: hash,
    createdAt: new Date(),
    updatedAt: new Date()
  },
]
const sunday = {id:day_ids.sunday_id,name:'Sunday'}
const monday = {id:day_ids.monday_id,name:'Monday'}
const tuesday = {id:day_ids.tuesday_id,name:'Tuesday'}
const wednesday = {id:day_ids.wednesday_id,name:'Wednesday'}
const thursday = {id:day_ids.thursday_id,name:'Thursday'}
const friday = {id:day_ids.friday_id,name:'Friday'}
const saturday = {id:day_ids.saturday_id,name:'Saturday'}
const daysofweek = [sunday,monday,tuesday,wednesday,thursday,friday,saturday]

const branch_gainesville = {name: "Gainesville"}
const branch_atlanta = {name: "Atlanta"}

const branches = give_id([branch_gainesville, branch_atlanta])

const severity = {name: 'Severity', min: 1, max: 10000}
const funders = {name: 'Funders', min: 1, max: 10000}
const teams = {name: 'Teams', min: 1, max: 10000}
const languages = {name: 'Languages', min: 1, max: 10000}
const allergies = {name: 'Allergies', min: 0, max: 0}

const groupings = give_id([funders,teams,severity, languages, allergies])




const english = {name: 'English', groupId: languages.id}
const spanish = {name: 'Spanish', groupId: languages.id}

const severe = {name: 'High Severity', groupId: severity.id}
const nonSevere = {name: 'Low Severity', groupId: severity.id}

const medicaid = {name: 'Medicaid', groupId: funders.id}
const bcbs = {name: 'BCBS', groupId: funders.id}
const gardner = {name: 'Gardner', groupId: funders.id}
const private_pay = {name: 'Private Pay', groupId: funders.id}

const team_blue = {name: 'Team Blue', groupId: teams.id}
const team_red = {name: 'Team Red', groupId: teams.id}
const team_yellow = {name: 'Team Yellow', groupId: teams.id}
const team_green = {name: 'Team Green', groupId: teams.id}

const subgroups = give_id([team_blue,team_red,team_yellow,team_green,bcbs,gardner,private_pay,medicaid,english, spanish, severe, nonSevere])

const sick = {name: 'sick'}
const noShow = {name: 'No Show'}
const exclusion = {name: 'Exclusions'}

const cancellationtypes = give_id([sick, noShow,exclusion])


const data_constraint_male_female = {name: 'Male Employees Cannot Work With Female Clients', active: true}
const data_constraint_branches = {name: 'Only People in the Same Branch Can Match Together', active: true}
const dataconstraints = give_id([data_constraint_branches, data_constraint_male_female])

//const insurance = {name: "Insurance"}
//const scholarship = {name: "Scholarship"}
//const private_pay_type = {name: "Private Pay"}


//const funderstype = give_id([insurance, scholarship, private_pay_type])

const cpt = {name: 'CPT'}
const hcode = {name: 'Hcode'}

const codetype = give_id([cpt, hcode])

//const medicaid = {name: 'Medicaid', typeId: insurance.id, codeTypeId: cpt.id}
//const bcbs = {name: 'BCBS', typeId: insurance.id, codeTypeId: hcode.id}
//const gardner = {name: "Gardner", typeId: scholarship.id}
//const private_pay = {name: "Private Pay", typeId: private_pay_type.id}

//const funders = give_id([medicaid, bcbs, gardner, private_pay])


//const home = {name: 'Home'}
const community = {name: 'Community'}
const clinic = {name: 'Clinic'}
const telehealth = {name: 'Telehealth'}
const school = {name: 'School'}

let locationstypes = give_id([community, clinic, telehealth, school])

const adam = {firstName: 'Bill Welsh',email:'silver.inventor@gmail.com',role:'admin',password: hash,emailVerified: true}
const alicia = {firstName: 'Alicia Lasaga',emailVerified: true}

const tyson = {firstName: 'Tyson Silver',emailVerified: true, address:addresses[8]}
const ariel = {firstName: 'Ariel Baner',emailVerified: true, address:addresses[9]}
const andy = {firstName: 'Andy Perez',emailVerified: true, address:addresses[10]}

const gainesville = {firstName: 'Gainesville',emailVerified: true, address:addresses[6]}
const atlanta = {firstName: 'Atlanta',emailVerified: true, address:addresses[7]}

const home = {firstName: 'Home Client',emailVerified: true}

const direct = {firstName: 'Direct',color: 'Green',emailVerified: true}
const client_meeting = {firstName: 'Client_Meeting',color: 'pink',emailVerified: true}
const supervision = {firstName: 'Supervision',color: 'Purple',emailVerified: true}
const lunch = {firstName: 'Lunch',color: 'Blue',emailVerified: true}
const drive = {firstName: 'Drive',color: 'Grayer',emailVerified: true}
const break2 = {firstName: 'Break',color: 'Pink',emailVerified: true}
const nap = {firstName: 'Nap',color: 'Red',emailVerified: true}
const training = {firstName: 'Training',color: 'Yellow',emailVerified: true}

const ruth_custom = {firstName: 'Ruth',color: 'Yellow',emailVerified: true}

users = users.concat(trans2(give_id([client_meeting,adam,alicia,tyson,ariel,andy,gainesville,atlanta,home,direct,supervision,drive,break2,lunch,nap,training,ruth_custom])))
//users = users.concat(trans2(give_id([adam])))

//const users2_ids = users2.map(e => e.id)
//console.log('hello',users)

const capacityconstraints = give_id([
  {user1Id: direct.id, role1Id:rbt.id,min1:1,max1:1,role2Id:aba.id,min2:1,max2:1},
  {user1Id: supervision.id, role1Id:bcba.id,min1:1,max1:1,role2Id:aba.id,min2:1,max2:1},
  {user1Id: lunch.id, role1Id:person_role.id,min1:1,max1:1},
  {user1Id: client_meeting.id, role1Id:employee_role.id,min1:1,max1:1},
  {user1Id: drive.id, role1Id:employee_role.id,min1:1,max1:1},
])

const event_direct1 = {
  start: new Date(`${today} 10:00:00 EDT`), end: new Date(`${today} 13:00:00 EDT`), address: addresses[0],
   startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1, secondary:false,
}

const event_direct2 = {
  start: new Date(`${today} 11:00:00 EDT`), end: new Date(`${today} 15:00:00 EDT`), address: addresses[1],
   startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
}

const event_lunch1 = {
  start: new Date(`${today} 10:00:00 EDT`), end: new Date(`${today} 11:00:00 EDT`), address: addresses[2],
   startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
}

const event_training1 = {
  start: new Date(`${today} 08:15:00 EDT`), end: new Date(`${today} 09:30:00 EDT`), address: addresses[3],
 startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
}

const event_supervision1 = {
  start: new Date(`${today} 13:00:00 EDT`), end: new Date(`${today} 15:00:00 EDT`), address: addresses[4],
   startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
}

const event_nap1 = {
  start: new Date(`${today} 09:00:00 EDT`), end: new Date(`${today} 10:30:00 EDT`), address: addresses[5],
  startRecur: date_range_start1, endRecur: date_range_end1, frequency: 'Weekly', interval: 1,secondary:false,
}


// const event2 = {start1: start_date1, end1: end_date1}
// const event3 = {start1: start_date1, end1: end_date1}

const events = give_id([event_direct1, event_direct2, event_lunch1,event_training1,event_supervision1,event_nap1])

const event_direct1_c = {eventId:event_direct1.id,reasonId:sick.id,userId:adam.id, date:new Date(`${today} 13:00:00 EDT`)}

const cancellations = give_id([event_direct1_c])

const event_direct1_e = {datetime: date}

const exclusions = give_id([event_direct1_e])

const matches = give_id([
  {user1Id: alicia.id, user2Id:andy.id, compatible: false}
])

const timeconstraints = give_id([
  {user1Id:andy.id,user2Id:direct.id,min:1000, max:1200, unit:'Hours', frequency:'Total', start:date_range_six_month_start, end:date_range_six_month_end},
  {user1Id:andy.id,user2Id:direct.id,min:2.5, max:10, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
  {user1Id:andy.id,user2Id:direct.id,min:5, max:10, unit:'Hours', frequency:'Weekly', start:date_range_six_month_start, end:date_range_six_month_end},
  {user1Id:adam.id,user2Id:direct.id,min:5, max:10, unit:'Hours', frequency:'Weekly', start:date_range_six_month_start, end:date_range_six_month_end},
  {user1Id:adam.id,user2Id:direct.id,min:2.5, max:10, unit:'Hours', frequency:'Per Session', start:date_range_six_month_start, end:date_range_six_month_end},
])

const eventsUsersUsers = [
  {eventId: event_direct1.id, userId: adam.id},
  {eventId: event_direct1.id, userId: gainesville.id},
  {eventId: event_direct1.id, userId: direct.id},

  {eventId: event_direct2.id, userId: alicia.id},
  {eventId: event_direct2.id, userId: gainesville.id},
  {eventId: event_direct2.id, userId: direct.id},

  {eventId: event_supervision1.id, userId: adam.id},
  {eventId: event_supervision1.id, userId: gainesville.id},
  {eventId: event_supervision1.id, userId: supervision.id},

  {eventId: event_training1.id, userId: alicia.id},
  {eventId: event_training1.id, userId: atlanta.id},
  {eventId: event_training1.id, userId: training.id},

  {eventId: event_lunch1.id, userId: alicia.id},
  {eventId: event_lunch1.id, userId: atlanta.id},
  {eventId: event_lunch1.id, userId: lunch.id},

  {eventId: event_direct1.id, userId: andy.id},

  {eventId: event_direct2.id, userId: tyson.id},

  {eventId: event_supervision1.id, userId: andy.id},

  {eventId: event_nap1.id, userId: tyson.id},
  {eventId: event_nap1.id, userId: gainesville.id},
  {eventId: event_nap1.id, userId: nap.id},
]

const priorities = give_id([
  {user1Id:alicia.id, user2Id:andy.id, rank:1},
  {user1Id:alicia.id, user2Id:ariel.id, rank:3},
  {user1Id:alicia.id, user2Id:tyson.id, rank:2},

])

const availabilities = give_id([
  {startTime: start_datetime4, endTime: end_datetime4, userId: adam.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: alicia.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime3, endTime: end_datetime3, userId: adam.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime3, endTime: end_datetime3, userId: alicia.id, available: true, startRange:date_range_start1, endRange:date_range_end1},

  {startTime: start_datetime3, endTime: end_datetime3, userId: ruth_custom.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
 
  {startTime: start_datetime4, endTime: end_datetime4, userId: ariel.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: tyson.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime2, endTime: end_datetime2, userId: tyson.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime2, endTime: end_datetime2, userId: ariel.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime3, endTime: end_datetime3, userId: tyson.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime3, endTime: end_datetime3, userId: ariel.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime3, endTime: end_datetime3, userId: tyson.id, available: false, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime3, endTime: end_datetime3, userId: ariel.id, available: false, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime1, endTime: end_datetime1, userId: andy.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: andy.id, available: true, startRange:date_range_start1, endRange:date_range_end1},

  //locations
  {startTime: start_datetime4, endTime: end_datetime4, userId: gainesville.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: atlanta.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime0, endTime: end_datetime0, userId: home.id, available: true, startRange:date_range_start1, endRange:date_range_end1},

  //activities
  {startTime: start_datetime4, endTime: end_datetime4, userId: direct.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: supervision.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: lunch.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime0, endTime: end_datetime0, userId: drive.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  
  {startTime: start_datetime4, endTime: end_datetime4, userId: nap.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: training.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
  {startTime: start_datetime4, endTime: end_datetime4, userId: client_meeting.id, available: true, startRange:date_range_start1, endRange:date_range_end1},

  //visitors
  {startTime: start_datetime4, endTime: end_datetime4, userId: ruth_custom.id, available: true, startRange:date_range_start1, endRange:date_range_end1},
])

const eventsExclusionsExclusions = [
  {eventId:event_direct1.id, exclusionId:event_direct1_e.id}
]

const eventsCancellationsCancellations = [
  {eventId:event_direct1.id, cancellationId:event_direct1_c.id}
]

const usersRolesRoles = [
  {userId:alicia.id,roleId:bcba.id},
  {userId:adam.id,roleId:rbt.id},
  {userId:andy.id,roleId:aba.id},
  {userId:ariel.id,roleId:aba.id},
  {userId:tyson.id,roleId:aba.id},
  {userId:gainesville.id,roleId:clinic_role.id},
  {userId:atlanta.id,roleId:clinic_role.id},
  {userId:home.id,roleId:home_role.id},
  //{userId:home.id,roleId:client_role.id},
  {userId:direct.id,roleId:activity_role.id},
  {userId:supervision.id,roleId:activity_role.id},
  {userId:client_meeting.id,roleId:activity_role.id},
  {userId:lunch.id,roleId:activity_role.id},
  {userId:drive.id,roleId:activity_role.id},
  {userId:nap.id,roleId:activity_role.id},
  {userId:training.id,roleId:activity_role.id},
 // {userId:ruth_custom.id,roleId:guest.id},
  
]

const usersBranchesBranches = [
  {userId:adam.id, branchId:branch_gainesville.id},
  {userId:alicia.id, branchId:branch_gainesville.id},
  {userId:alicia.id, branchId:branch_atlanta.id},
  {userId:tyson.id, branchId:branch_gainesville.id},
  {userId:ariel.id, branchId:branch_gainesville.id},
  {userId:andy.id, branchId:branch_gainesville.id},
  {userId:andy.id, branchId:branch_atlanta.id},
  {userId:gainesville.id, branchId:branch_gainesville.id},
  {userId:atlanta.id, branchId:branch_atlanta.id},
  {userId:home.id, branchId:branch_gainesville.id},
  {userId:home.id, branchId:branch_atlanta.id},
]

// const usersFundersFunders = [
//   {userId: andy.id, funderId: medicaid.id},
//   {userId: andy.id, funderId: bcbs.id},
//   {userId: tyson.id, funderId: medicaid.id},
//   {userId: ariel.id, funderId: bcbs.id},
//   {userId: adam.id, funderId: medicaid.id},
//   {userId: adam.id, funderId: bcbs.id},
//   {userId: alicia.id, funderId: medicaid.id},
// ]

const subgroupsUserUsers = [
  {subgroupId: spanish.id, userId: andy.id},
  {subgroupId: severe.id, userId: andy.id},
  {subgroupId: english.id, userId: ariel.id},
  {subgroupId: nonSevere.id, userId: ariel.id},
  {subgroupId: english.id, userId: tyson.id},
  {subgroupId: spanish.id, userId: alicia.id},
  {subgroupId: severe.id, userId: alicia.id},
  {subgroupId: english.id, userId: alicia.id},
  {subgroupId: nonSevere.id, userId: alicia.id},
  {subgroupId: english.id, userId: adam.id},
  {subgroupId: nonSevere.id, userId: adam.id},
  {subgroupId: medicaid.id, userId: adam.id},
  {subgroupId: bcbs.id, userId: alicia.id},
  {subgroupId: medicaid.id, userId: ariel.id},
  {subgroupId: bcbs.id, userId: andy.id},
]

const availabilitiesDaysDaysofweek = availabilities.flatMap(e => {
  return [{availabilityId:e.id,daysOfWeekId:monday.id},
    //{availabilityId:e.id,daysOfWeekId:tuesday.id},
    {availabilityId:e.id,daysOfWeekId:wednesday.id},
    {availabilityId:e.id,daysOfWeekId:thursday.id},
    {availabilityId:e.id,daysOfWeekId:friday.id},
    //{availabilityId:e.id,daysOfWeekId:saturday.id},
    {availabilityId:e.id,daysOfWeekId:sunday.id},
  ]
})

const eventsDaysOfWeekDaysofweek = events.flatMap(e => {
  return [{eventId:e.id,daysOfWeekId:monday.id},
    {eventId:e.id,daysOfWeekId:tuesday.id},
    {eventId:e.id,daysOfWeekId:wednesday.id},
    {eventId:e.id,daysOfWeekId:thursday.id},
    {eventId:e.id,daysOfWeekId:friday.id},
    {eventId:e.id,daysOfWeekId:saturday.id},
    {eventId:e.id,daysOfWeekId:sunday.id},
  ]
})

const array_general = [
  ['industries'],
]

const array_before = [
  
  ['companies'],
  //['users'],
  //['funderstype',]
  ['codetype','daysofweek', 'groupings','cancellationtypes','dataconstraints'],
  //['funders'],
  ['branches'],
]

const array_users = [['users']]


const array_all = [
  
  ['events','subgroups','priorities'],
  ['cancellations','exclusions', 'matches'],
  ['availabilities']
]
const array_all2 = [
  ['availabilitiesDaysDaysofweek'],
  ['usersBranchesBranches','usersRolesRoles','eventsUsersUsers','subgroupsUserUsers'],
  //['usersFundersFunders'],
  ['timeconstraints','capacityconstraints'],
  ['eventsDaysOfWeekDaysofweek'],
  ['eventsCancellationsCancellations','eventsExclusionsExclusions']
]


//https://stackoverflow.com/questions/39538473/using-settimeout-on-promise-chain
//Might need this
//const comp_array = convert_company(company_info1)
//const comp_array2 = convert_company(company_info2)
const comp_array3 = convert_company(company_info3)

const general_info = 
  {
    daysofweek:[trans2(daysofweek),false,false],
  }


module.exports = {
  up: async (queryInterface, Sequelize) => {
    let a = []
    const array2 = Object.entries(general_info)
  //  const array = array2.concat(Object.entries(comp_array))
    //const array = array2.concat(Object.entries(comp_array).concat(Object.entries(comp_array2)))
  
    //const array = array2
    const array = array2.concat(Object.entries(comp_array3))
    
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      let [key, values] = e
      values = values[0]
      for (let index2 = 0; index2 < values.length; index2++) {
        let obj = values[index2];
        //console.log('glib',obj)
        a = await queryInterface.bulkInsert(key, [obj])
      }
      
    }
    return a
  },

  

  down: async (queryInterface, Sequelize) => {
    let b = []
    const array2 = Object.entries(general_info)
    //const array = Object.entries(comp_array).reverse().concat(array2)
    //const array = Object.entries(comp_array).reverse().concat(Object.entries(comp_array2).reverse(),array2)
    const array = Object.entries(comp_array3).reverse().concat(array2)
   
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      let [key, values] = e
      console.log('plok', values)
      values = values[0].reverse()
      let str =e[1][1]
      let bol = e[1][2]
      
      for (let index2 = 0; index2 < values.length; index2++) {
        let obj_where = {}
        const obj = values[index2];
      if(str){
        obj_where = {...obj_where, [str] : {
          [Sequelize.Op.eq]: obj[str]
        }
      }
    }
      if(bol){
        obj_where = {...obj_where, createdById : {
         // [Sequelize.Op.eq]: superAdminIds[0]
         //[Sequelize.Op.eq]: superAdminIds[0]
         [Sequelize.Op.eq]: obj['createdById']
        }
      }
      }
      console.log('street',key,bol)
        //if(!obj[str]){str='firstName'}
        b = await queryInterface.bulkDelete(key, obj_where)
      }
      
    }
    return b
    

  }

}


















// module.exports = {
//   up: async (queryInterface, Sequelize) => {



    
    

//     //queryInterface.bulkInsert('locations_types', locations_types)
//     let a = []
//    // a = queryInterface.bulkInsert('resources', trans2(eval('resources')))
//    // a = queryInterface.bulkInsert('locations_types', trans2(eval('locations_types')))
//    // a = queryInterface.bulkInsert('privileges', trans2(eval('privileges')))
//   //  for (let index = 0; index < array_before.length; index++) {
//   //    const r = array_before[index];
//   //    for (let index2 = 0; index2 < r.length; index2++) {
//   //      const e = r[index2];
//   //      a = await queryInterface.bulkInsert(e, trans2(eval(e)))
//   //    }
//   //  }
//    a = await up_insert1(array_before, queryInterface)
//   //  array_before.map(r=> r.map(e => {
//   //   a = await queryInterface.bulkInsert(e, trans2(eval(e)))
    
//   // })
//   // )
//   a = await up_insert1(array_users, queryInterface)

//   for (let index = 0; index < roles_list.length; index++) {
//     const r = roles_list[index];
//    a = await queryInterface.bulkInsert('roles', trans2(r))
//   }
//   // roles_list.map(r=>
//   //   a = queryInterface.bulkInsert('roles', trans2(r))
    
//   // )
//     //a = await queryInterface.bulkInsert('users', trans2(user_first))
//     // array_all.map(r=> r.map(e => {
//     //   a = queryInterface.bulkInsert(e, trans2(eval(e)))
      
//     // })
//     // )
//     a = await up_insert1(array_all, queryInterface)

//     // for (let index = 0; index < array_all2.length; index++) {
//     //   const r = array_all2[index];
//     //   for (let index2 = 0; index2 < r.length; index2++) {
//     //     const e = r[index2];
//     //     a = await queryInterface.bulkInsert(e, trans2(eval(e)))
//     //   }
//     // }
//     a = await up_insert1(array_all2, queryInterface)

//     // array_all2.map(r=> r.map(e => {
//     //   a = queryInterface.bulkInsert(e, trans2(eval(e)))
      
//     // })
//     // )

//     return a
    

    
//   },
//   down: (queryInterface, Sequelize) => {
//     let b = []
//     //queryInterface.bulkDelete('users',{})

//     array_all2.reverse().map(r=> r.map(e => {
//       b =queryInterface.bulkDelete(e, {})
//     }));
//     array_all.reverse().map(r=> r.map(e => {
//       b = queryInterface.bulkDelete(e, {})
//     }));

//     array_users.reverse().map(r=> r.map(e => {
//       b = queryInterface.bulkDelete(e, {})
//     }));

//     roles_list.reverse().map(r=> r.map(e => {
//       b = queryInterface.bulkDelete('roles', {
//         name: {
//           [Sequelize.Op.eq]: e.name,
//         },
//       })
//     }));

//     array_before.reverse().map(r=> r.map(e => {
//       b = queryInterface.bulkDelete(e, {})
//     }));

//     b = queryInterface.bulkDelete('distancematrix', {})

//     // queryInterface.bulkDelete(
//     //   'users',
//     //   {
//     //     id: {
//     //       [Sequelize.Op.in]: ids[0],
//     //     },
//     //   },
//     //   {},
//     // );
    
//    // queryInterface.bulkDelete('availabilities',{})
//     //queryInterface.bulkDelete('resources',{})
//     //queryInterface.bulkDelete('locations_types',{})
//     //queryInterface.bulkDelete('privileges',{})

    
//     // b = queryInterface.bulkDelete('users', {
//     //   id: {
//     //     [Sequelize.Op.in]: users2_ids,
//     //   }
//     // }, {});
//     //return b
//     return b
//     //queryInterface.bulkDelete('locations_types', {});

//     // return queryInterface.bulkDelete('users', {
//     //   id: {
//     //     [Sequelize.Op.in]: ids,
//     //   }
//     // }, {});



//   }
// };

