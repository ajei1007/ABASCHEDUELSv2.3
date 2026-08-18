export const userSelectors = {
  navigation: {
    employeeLink: {role: 'link', name: 'Employee'},
    dataLink: {role: 'link', name: 'Data'},
    locationLink: {role: 'link', name: 'Location'},
    clientLink: {role: 'link', name: 'Client'},
    activityLink: {role: 'link', name: 'Activity'},
  },
  buttons: {
    new: {role: 'button', name: 'New'},
    generatePassword: {role: 'button', name: 'Generate password'},
    save: {role: 'button', name: 'Save'},
  },
  form: {
    firstNameInput: '#firstName-user-form',
    lastNameInput: '#lastName-user-form',
    emailInput: '#email-user-form',
    roleSelect: '.select__input-container',
    permissionsSelect: '.select__value-container.select__value-container--is-multi > .select__input-container',
    selectAllOption: {role: 'option', name: 'Select All'},
  },
  messages: {
    success: {text: 'User created'}
  }
} as const;
