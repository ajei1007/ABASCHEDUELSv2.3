
const eventsFields = {
  id: { type: 'id', label: 'ID' },

    users: { type: 'relation_many', label: 'Users',

    },

    start: { type: 'datetime', label: 'Start',

    },

    end: { type: 'datetime', label: 'End',

    },

    address: { type: 'string', label: 'Address',

    },

    longitude: { type: 'decimal', label: 'Longitude',

    },

    latitude: { type: 'decimal', label: 'Latitude',

    },

    cancellations: { type: 'relation_many', label: 'Cancellations',

    },

    exclusions: { type: 'relation_many', label: 'Exclusions',

    },

    daysOfWeek: { type: 'relation_many', label: 'Days',

    },

    startRecur: { type: 'date', label: 'Start Recur',

    },

    endRecur: { type: 'date', label: 'End Recur',

    },

    frequency: { type: 'enum', label: 'Frequency',

      options: [

        { value: 'Weekly', label: 'Weekly' },

        { value: 'Monthly', label: 'Monthly' },

        { value: 'Yearly', label: 'Yearly' },

        { value: 'Daily', label: 'Daily' },

      ]

    },

    interval: { type: 'int', label: 'Interval',

    },

    background: { type: 'string', label: 'Background',

    },

    border: { type: 'string', label: 'Border',

    },

    notes: { type: 'string', label: 'Notes',

    },

    secondary: { type: 'boolean', label: 'Secondary',

    },

    eventConnect: { type: 'relation_one', label: 'Event Connect',

    },

    allDay: { type: 'boolean', label: 'All Day',

    },


    status: { type: 'relation_one', label: 'Status',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    usersVirtual: { type: 'relation_many', label: 'Virtual Users',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    visible: { type: 'boolean', label: 'Visible',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    activity0: { type: 'relation_one', label: 'Activity 0',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    location0: { type: 'relation_one', label: 'Location 0',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    M: { type: 'boolean', label: 'M',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    T: { type: 'boolean', label: 'T',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    W: { type: 'boolean', label: 'W',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    R: { type: 'boolean', label: 'R',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    F: { type: 'boolean', label: 'F',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    S: { type: 'boolean', label: 'S',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    U: { type: 'boolean', label: 'U',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    bysetpos: { type: 'enum', label: 'Bysetpos',

      options: [

        { value: '-1', label: '-1' },

        { value: '1', label: '1' },

        { value: '2', label: '2' },

        { value: '3', label: '3' },

        { value: '4', label: '4' },

      ]

    },

}

export default eventsFields;
