const db = require('../db/models');
const NewconstraintgeneratorDBApi = require('../db/api/newconstraintgenerator');
const ValidationError = require('./notifications/errors/validation');
const isUserRoleOrHigher = require('../utils/isUserRoleOrHigher');

module.exports = class NewconstraintgeneratorService {
  static async create(data, currentUser) {
    if (
      data.constraintType === 'time' ||
      data.constraintType === 'gaps' ||
      data.constraintType === 'sessionlength' ||
      data.constraintType === 'authorization' ||
      data.constraintType === 'drive'

    ) {
      //convert min and max to second
      if (data.units === 'unit') {
        data.min = data.min * 15 * 60;
        data.max = data.max * 15 * 60;
        data.offset = data.offset * 15 * 60;
      }
      if (data.units === 'minutes') {
        data.min = data.min * 60;
        data.max = data.max * 60;
        data.offset = data.offset * 60;
      }
      if (data.units === 'hours') {
        data.min = data.min * 60 * 60;
        data.max = data.max * 60 * 60;
        data.offset = data.offset * 60 * 60;
      }

      if (!data.units) {
        data.units = 'seconds';
      }
    }

    if (data.constraintType === 'breakQuantity') {
      //convert min and max to second
      if (data.units === 'unit') {
        data.max = data.max * 15 * 60;
      }
      if (data.units === 'minutes') {
        data.max = data.max * 60;
      }
      if (data.units === 'hours') {
        data.max = data.max * 60 * 60;
      }

      if (!data.units) {
        data.units = 'seconds';
      }
    }

    if (data.constraintType === 'distance') {
      if (!data.units) {
        data.units = 'kilometers';
      }
      //convert min and max to second
      if (data.units === 'miles') {
        data.max = data.max * 1610
        data.min = data.min * 1610

      }
      if (data.units === 'kilometers') {
        data.max = data.max * 1000
        data.min = data.min * 1000
      }
    }

    const transaction = await db.sequelize.transaction();
    try {
      await NewconstraintgeneratorDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let newconstraintgenerator = await NewconstraintgeneratorDBApi.findBy(
        { id },
        { transaction },
      );

      if (!newconstraintgenerator) {
        throw new ValidationError('newconstraintgeneratorNotFound');
      }
      if (
        data.constraintType === 'time' ||
        data.constraintType === 'gaps' ||
        data.constraintType === 'sessionlength' ||
        data.constraintType === 'authorization' ||
        data.constraintType === 'drive'
      ) {
        //convert min and max to second
        if (data.units === 'unit') {
          data.min = data.min * 15 * 60;
          data.max = data.max * 15 * 60;
          data.offset = data.offset * 15 * 60;
        }
        if (data.units === 'minutes') {
          data.min = data.min * 60;
          data.max = data.max * 60;
          data.offset = data.offset * 60;
        }
        if (data.units === 'hours') {
          data.min = data.min * 60 * 60;
          data.max = data.max * 60 * 60;
          data.offset = data.offset * 60 * 60;
        }
        if (!data.units) {
          data.units = 'seconds';
        }
      }

      if (data.constraintType === 'breakQuantity') {
        //convert min and max to second
        if (data.units === 'unit') {
          data.max = data.max * 15 * 60;
        }
        if (data.units === 'minutes') {
          data.max = data.max * 60;
        }
        if (data.units === 'hours') {
          data.max = data.max * 60 * 60;
        }

        if (!data.units) {
          data.units = 'seconds';
        }
      }

      if (data.constraintType === 'distance') {
        if (!data.units) {
          data.units = 'kilometers';
        }
        //convert min and max to second
        if (data.units === 'miles') {
          data.max = data.max * 1610
          data.min = data.min * 1610

        }
        if (data.units === 'kilometers') {
          data.max = data.max * 1000
          data.min = data.min * 1000
        }
      }

      await NewconstraintgeneratorDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return newconstraintgenerator;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateSoft(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let newconstraintgenerator = await NewconstraintgeneratorDBApi.findBy(
        { id },
        { transaction },
      );

      if (!newconstraintgenerator) {
        throw new ValidationError('newconstraintgeneratorNotFound');
      }

      
      await NewconstraintgeneratorDBApi.updateSoft(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (!isUserRoleOrHigher(currentUser.role, 'admin')) {
        throw new ValidationError('errors.forbidden.message');
      }

      await NewconstraintgeneratorDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
