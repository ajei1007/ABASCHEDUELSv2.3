
const companiesFields = {
  id: { type: 'id', label: 'ID' },

    name: { type: 'string', label: 'Name',

    },

    membership: { type: 'string', label: 'Membership',

    },

    industry: { type: 'relation_one', label: 'Industry',

    },

    disabled: { type: 'boolean', label: 'Inactive',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

}

export default companiesFields;
