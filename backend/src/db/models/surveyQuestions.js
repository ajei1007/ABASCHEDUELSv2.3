module.exports = function (sequelize, DataTypes) {
    const surveyQuestions = sequelize.define('surveyQuestions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      tableName: 'surveyQuestions',
      timestamps: true,
    });

    surveyQuestions.associate = (db) => {
        surveyQuestions.hasMany(db.surveyQuestionRatings, {
          foreignKey: 'surveyQuestionId',
          as: 'questionRatings',
          onDelete: 'CASCADE',
        });
      };
    
  
    return surveyQuestions;
  };