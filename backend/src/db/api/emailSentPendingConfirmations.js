const db = require('../models');
const moment = require('moment');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class EmailSentPendingConfirmationsDBApi {
  static async upsert(data) {
    // Check if a record with the given userId exists
    const existingRecord = await db.emailSentPendingConfirmations.findOne({
      where: { userId: data.userId },
    });

    if (existingRecord) {
      // If a record exists, update it
      const currentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
      const updatedRecord = await existingRecord.update({
        eventIdConcatenation: data.eventIdConcatenation || '',
        updatedAt: currentDateTime,
      });
      return updatedRecord; // Return the updated record
    } else {
      // If no record exists, create a new one
      const newRecord = await db.emailSentPendingConfirmations.create({
        userId: data.userId,
        eventIdConcatenation: data.eventIdConcatenation || '',
      });
      return newRecord; // Return the newly created record
    }
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const result = await db.emailSentPendingConfirmations.findOne(
      { where },
      { transaction },
    );

    if (!result) {
      return null;
    }

    return result;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const espc = await db.emailSentPendingConfirmations.findByPk(id, options);
    if (!espc) {
      return null
    }

    // I set eventIdConcatenation empty string for clearing memory
    // because that field is not useful anymore and it is just long string
    await espc.update(
      {
        eventIdConcatenation : "",
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await espc.destroy({
      transaction,
    });

    return espc;
  }
};
