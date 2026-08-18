
const timeoffFields = {
  id: { type: 'id', label: 'ID' },

    user: { type: 'relation_one', label: 'User',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    reason: { type: 'enum', label: 'Reason',

      options: [

        { value: 'Vacation', label: 'Vacation' },

        { value: 'Holiday', label: 'Holiday' },

        { value: 'Sick', label: 'Sick' },

        { value: 'Personal', label: 'Personal' },

      ]

    },

    notes: { type: 'string', label: 'Notes',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    approved: { type: 'boolean', label: 'Approved',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    duration: { type: 'int', label: 'Duration',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    datetimestart: { type: 'datetime', label: 'Datetime Start',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    reasontype: { type: 'relation_one', label: 'Reason',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    paid: { type: 'enum', label: 'Paid',

      options: [

        { value: 'Paid', label: 'Paid' },

        { value: 'Unpaid', label: 'Unpaid' },

      ]

    },

    datetimeend: { type: 'datetime', label: 'Datetime End',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    status: { type: 'enum', label: 'Status',

      options: [

        { value: 'Pending', label: 'Pending' },

        { value: 'Approved', label: 'Approved' },

        { value: 'Declined', label: 'Declined' },

      ]

    },

}

export default timeoffFields;
