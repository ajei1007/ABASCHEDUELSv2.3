module.exports = function (sequelize, DataTypes) {
  const surveyQuestionRatings = sequelize.define(
    'surveyQuestionRatings',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      surveyQuestionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'surveyQuestions',
          key: 'id',
        },
      },
      surveyDataId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'surveyData',
          key: 'id',
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 10,
        },
      },
    },
    {
      tableName: 'surveyQuestionRatings',
    },
  );

  surveyQuestionRatings.associate = (db) => {
    surveyQuestionRatings.belongsTo(db.surveyQuestions, {
      foreignKey: 'surveyQuestionId',
      as: 'question',
    });

    surveyQuestionRatings.belongsTo(db.surveyData, {
      foreignKey: 'surveyDataId',
      as: 'surveyData',
    });
  };

  return surveyQuestionRatings;
};
