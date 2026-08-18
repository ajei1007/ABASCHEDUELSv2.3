
const statuseventsFields = {
  id: { type: 'id', label: 'ID' },

    event: { type: 'relation_one', label: 'Event',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    startdatetime: { type: 'datetime', label: 'Start Datetime',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    user: { type: 'relation_one', label: 'User',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    status: { type: 'enum', label: 'Status',

      options: [

        { value: 'Confirmed', label: 'Confirmed' },

        { value: 'Pending Confirmation', label: 'Pending Confirmation' },

        { value: 'Pending Cancelation', label: 'Pending Cancelation' },

        { value: 'Canceled', label: 'Canceled' },

      ]

    },

    note: { type: 'string', label: 'Note',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    noteadmin: { type: 'string', label: 'Noteadmin',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    late: { type: 'boolean', label: 'Late',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    latetime: { type: 'int', label: 'Latetime',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

}

export default statuseventsFields;
