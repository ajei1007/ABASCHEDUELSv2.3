const db = require('../db/models');

/**
 * Executes a function within a database transaction, handling commit/rollback automatically.
 * If an external transaction is provided, it will use that instead of creating a new one.
 * 
 * @param {Function} operation - The async function to execute within the transaction
 * @param {Object} options - Options object
 * @param {Object} options.transaction - External transaction to use (optional)
 * @returns {Promise<any>} - The result of the operation
 */
async function withTransaction(operation, options = {}) {
  const externalTransaction = options.transaction;
  const transaction = externalTransaction || await db.sequelize.transaction();
  const createdTransaction = !externalTransaction;

  try {
    const result = await operation(transaction);
    
    if (createdTransaction) {
      await transaction.commit();
    }
    
    return result;
  } catch (error) {
    if (createdTransaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

module.exports = {
  withTransaction,
}; 