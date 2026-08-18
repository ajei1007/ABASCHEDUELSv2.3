module.exports = function (sequelize, DataTypes) {
  const emailSentPendingConfirmations = sequelize.define(
    'emailSentPendingConfirmations',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      eventIdConcatenation: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  emailSentPendingConfirmations.associate = (db) => {
    db.emailSentPendingConfirmations.belongsTo(db.users, {
      as: 'user',
      constraints: false,
    });
  };

  return emailSentPendingConfirmations;
};
