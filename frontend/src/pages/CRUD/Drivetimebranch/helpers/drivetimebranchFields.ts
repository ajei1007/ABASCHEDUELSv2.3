
const drivetimebranchFields = {
  id: { type: 'id', label: 'ID' },

    branch1: { type: 'relation_one', label: 'Branch 1',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    branch2: { type: 'relation_one', label: 'Branch 2',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    time: { type: 'int', label: 'Time',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

}

export default drivetimebranchFields;
