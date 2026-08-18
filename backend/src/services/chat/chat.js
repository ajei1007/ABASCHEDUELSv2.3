/**
 * Chat Service
 * Handles chat-related operations with provider-specific logic separated
 */
class ChatService {
  constructor() {
    this.provider = require('./providers/mattermost');
  }

  /**
   * Generate Mattermost session token for WebSocket auth
   * @param {string} userId - Your app's user ID
   * @returns {Promise<string>} Mattermost session token
   */
  async generateToken(userId) {
    return await this.provider.generateToken(userId);
  }

  /**
   * Create or update users in the chat system
   * @param {Array} usersData - Array of user objects
   * @returns {Promise<Object>} Result of the operation
   */
  async upsertUsers(usersData) {
    return await this.provider.upsertUsers(usersData);
  }

  /**
   * Delete users from the chat system
   * @param {Array} userIds - Array of user IDs to delete
   * @returns {Promise<Object>} Result of the operation
   */
  async deleteUsersIfExists(userIds) {
    return await this.provider.deleteUsers(userIds);
  }
}

module.exports = new ChatService();
