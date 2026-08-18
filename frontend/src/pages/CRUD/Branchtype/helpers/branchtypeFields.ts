const branchtypeFields = {
  id: { type: 'id', label: 'ID' },


    name: { type: 'string', label: 'Name',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    parent: { type: 'relation_one', label: 'Parent',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    bol: { type: 'boolean', label: 'Bol',

      options: [

        { value: 'value', label: 'value' },

      ]

    },
    physical: { type: 'boolean', label: 'Physical',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

}


export default branchtypeFields;
