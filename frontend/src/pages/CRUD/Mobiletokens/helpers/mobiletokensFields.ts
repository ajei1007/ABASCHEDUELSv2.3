
const mobiletokensFields = {
  id: { type: 'id', label: 'ID' },

    token: { type: 'string', label: 'Token',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    users: { type: 'relation_many', label: 'Users',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

}

export default mobiletokensFields;
