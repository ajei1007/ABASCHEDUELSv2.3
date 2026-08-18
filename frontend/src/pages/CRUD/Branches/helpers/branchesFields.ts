
const branchesFields = {
  id: { type: 'id', label: 'ID' },

    name: { type: 'string', label: 'Name',

    },

    branchType: { type: 'relation_one', label: 'Branch Type',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    parent: { type: 'relation_one', label: 'Parent',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    user: { type: 'relation_one', label: 'Location',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    drivetime: { type: 'int', label: 'Drivetime',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    replyToEmail: { type: 'string', label: 'Reply to E-mail' },
    timezone: { type: 'relation_one', label: 'Timezone' },
    inactive: { type: 'boolean', label: 'Inactive' },
}

export default branchesFields;
