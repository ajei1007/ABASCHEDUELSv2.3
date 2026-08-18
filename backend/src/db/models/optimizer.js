const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const optimizer = sequelize.define(
    'optimizer',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      slotduration: {
        type: DataTypes.INTEGER,
      },

      maxtime: {
        type: DataTypes.INTEGER,
      },

      timeconstraints: {
        type: DataTypes.INTEGER,
      },

      nogapsequation: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      constraintdrive: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      constraintteam: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      constraintlunch: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      constraintlunchduration: {
        type: DataTypes.INTEGER,
      },

      constraintbreak: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      orange: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      blocks: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      breaktime: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      lunchtime: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      isdaily: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      multi: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      workers: {
        type: DataTypes.INTEGER,
      },

      minsession: {
        type: DataTypes.INTEGER,
      },

      maxsession: {
        type: DataTypes.INTEGER,
      },

      teamamount: {
        type: DataTypes.INTEGER,
      },

      teammin: {
        type: DataTypes.INTEGER,
      },

      teamtolerance: {
        type: DataTypes.INTEGER,
      },

      teamtolormin: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      percentignore: {
        type: DataTypes.INTEGER,
      },

      scratchoroptimize: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      startdate: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('startdate')
            ? moment.utc(this.getDataValue('startdate')).format('YYYY-MM-DD')
            : null;
        },
      },

      enddate: {
        type: DataTypes.DATEONLY,

        get: function () {
          return this.getDataValue('enddate')
            ? moment.utc(this.getDataValue('enddate')).format('YYYY-MM-DD')
            : null;
        },
      },

      is_events: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      break_length: {
        type: DataTypes.INTEGER,
      },

      part1: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_overlap_constraint: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_minSession_constraint: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      allOrNothingBlocks: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      maxEmployeeHoursPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 8,
      },
      maxClientHoursPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 8,
      },
      maxGapEmployeeSchedule: {
        type: DataTypes.INTEGER,
        defaultValue: 60,
      },
      maxGapClientSchedule: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      clientsMaxAppointmentsPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      employeesMaxAppointmentsPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      breakQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      oneBreakHours: {
        type: DataTypes.DECIMAL(5, 2),
      },
      twoBreakHours: {
        type: DataTypes.DECIMAL(5, 2),
      },
      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  optimizer.associate = (db) => {
    db.optimizer.belongsToMany(db.branches, {
      as: 'teams',
      constraints: false,
      through: 'optimizerTeamsBranches',
    });

    db.optimizer.belongsToMany(db.roles, {
      as: 'objectiverolesmany',
      constraints: false,
      through: 'optimizerObjectiverolesmanyRoles',
    });

    db.optimizer.belongsToMany(db.users, {
      as: 'objectiveactivitiesmany',
      constraints: false,
      through: 'optimizerObjectiveactivitiesmanyUsers',
    });

    db.optimizer.belongsToMany(db.newconstraintgenerator, {
      as: 'highprioritymany',
      constraints: false,
      through: 'optimizerhighprioritymanynewconstraintgenerator',
    });
    db.optimizer.belongsToMany(db.newconstraintgenerator, {
      as: 'lowprioritymany',
      constraints: false,
      through: 'optimizerlowprioritymanynewconstraintgenerator',
    });
    db.optimizer.belongsToMany(db.newconstraintgenerator, {
      as: 'disabledmany',
      constraints: false,
      through: 'optimizerdisabledmanynewconstraintgenerator',
    });
    db.optimizer.belongsToMany(db.newconstraintgenerator, {
      as: 'mandatorymany',
      constraints: false,
      through: 'optimizermandatorymanynewconstraintgenerator',
    });

    db.optimizer.belongsTo(db.roles, {
      as: 'nogapsequationrole',
      constraints: false,
    });

    db.optimizer.belongsTo(db.roles, {
      as: 'objectiverole',
      constraints: false,
    });

    db.optimizer.belongsTo(db.users, {
      as: 'objectiveactivity',
      constraints: false,
    });

    db.optimizer.belongsTo(db.roles, {
      as: 'nogapsrole',
      constraints: false,
    });

    db.optimizer.belongsTo(db.branches, {
      as: 'branch',
      constraints: false,
    });

    db.optimizer.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.optimizer.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return optimizer;
};
