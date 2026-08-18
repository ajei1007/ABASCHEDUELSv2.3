
const cancellationsFields = {
  id: { type: 'id', label: 'ID' },

    event: { type: 'relation_one', label: 'Event',

    },

    date: { type: 'date', label: 'Date',

    },

    reason: { type: 'relation_one', label: 'Reason',

    },

    user: { type: 'relation_one', label: 'User Canceled',

    },


    rescheduled: { type: 'boolean', label: 'Rescheduled',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    partialRescheduled: { type: 'boolean', label: 'Partial Rescheduled',

      options: [

        { value: 'value', label: 'value' },

      ]

    },


}

export default cancellationsFields;
