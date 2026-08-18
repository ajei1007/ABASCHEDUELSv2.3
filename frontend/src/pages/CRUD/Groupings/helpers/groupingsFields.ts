const groupingsFields = {
  id: { type: 'id', label: 'ID' },

  name: { type: 'string', label: 'Name' },

  min: { type: 'int', label: 'Min' },

  max: { type: 'int', label: 'Max' },

  roles1: { type: 'relation_many', label: 'Roles 1' },

  roles2: { type: 'relation_many', label: 'Roles 2' },

    noTag: { type: 'boolean', label: 'No Tag',

      options: [

        { value: 'value', label: 'value' },

      ]

    },
     active: { type: 'boolean', label: 'Active' },
     required: { type: 'boolean', label: 'Required' },

}


export default groupingsFields;
