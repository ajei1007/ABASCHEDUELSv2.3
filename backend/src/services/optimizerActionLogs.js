const db = require('../db/models');
const OptimizerActionLogsDBApi = require('../db/api/optimizerActionLogs');

/**
 * Service class for managing optimizer action logs
 */
class OptimizerActionLogsService {
  /**
   * Capture optimizer action log
   * @param {Object} data - Log data containing action details
   * @param {Object} currentUser - Current user from session
   * @returns {Promise<string>} Promise that resolves to the created log ID
   * @throws {Error} Throws error if log creation fails
   */
  static async captureLog(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      const createdLog = await OptimizerActionLogsDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return createdLog.id;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get optimizer action logs with filtering and pagination
   * @param {Object} filters - Filter parameters for querying logs
   * @param {number} [filters.page=1] - Page number for pagination
   * @param {number} [filters.limit=10] - Number of items per page
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.userId] - Filter by user ID
   * @param {string} [filters.companyId] - Filter by company ID
   * @param {string} [filters.startDate] - Filter logs from this date (ISO string)
   * @param {string} [filters.endDate] - Filter logs until this date (ISO string)
   * @returns {Promise<{count: number, rows: Array<Object>}>} Promise that resolves to paginated logs with total count
   * @throws {Error} Throws error if query fails
   */
  static async getLogs(filters) {
    try {
      const result = await OptimizerActionLogsDBApi.findAndCountAll(filters);

      // Transform response to match the API specification
      const transformedRows = result.rows.map((log) => log.toJSON());

      return {
        count: result.count,
        rows: transformedRows,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Soft delete an optimizer action log
   * @param {string} logId - Log ID to delete (UUID format)
   * @returns {Promise<void>} Promise that resolves when the log is successfully deleted
   * @throws {Error} Throws error if deletion fails or log not found
   */
  static async deleteLog(logId) {
    const transaction = await db.sequelize.transaction();
    try {
      await OptimizerActionLogsDBApi.destroy(logId, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = OptimizerActionLogsService;
