
const totaltypesFields = {
  id: { type: 'id', label: 'ID' },

    name: { type: 'string', label: 'Name',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

    activities: { type: 'relation_many', label: 'Activities',

      options: [

        { value: 'value', label: 'value' },

      ]

    },

}

export default totaltypesFields;
