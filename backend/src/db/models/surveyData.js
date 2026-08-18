
module.exports = function (sequelize, DataTypes) {
  const surveyData = sequelize.define('surveyData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'surveyData',
  });

  surveyData.associate = (db) => {
    surveyData.belongsTo(db.users, { foreignKey: 'userId' });
  
    surveyData.hasMany(db.surveyQuestionRatings, {
      foreignKey: 'surveyDataId',
      as: 'questionRatings',
      onDelete: 'CASCADE',
    });
  };

  return surveyData;
};
