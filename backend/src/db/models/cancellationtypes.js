const config = require('../../config');

module.exports = function (sequelize, DataTypes) {
  const cancellationtypes = sequelize.define(
    'cancellationtypes',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: DataTypes.TEXT,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      // New customId column
      customId: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  cancellationtypes.associate = (db) => {
    db.cancellationtypes.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.cancellationtypes.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return cancellationtypes;
};
