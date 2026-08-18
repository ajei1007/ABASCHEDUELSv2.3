const day_ids = require('../db/uuids/days');

const weekdayOptions = [
    { value: day_ids['sunday_id'], label: 'Su'},
    { value: day_ids['monday_id'], label: 'Mo'},
    { value: day_ids['tuesday_id'], label: 'Tu'},
    { value: day_ids['wednesday_id'], label: 'We'},
    { value: day_ids['thursday_id'], label: 'Th'},
    { value: day_ids['friday_id'], label: 'Fr'},
    { value: day_ids['saturday_id'], label: 'Sa'},
  ]

module.exports = weekdayOptions;