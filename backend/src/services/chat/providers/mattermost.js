const axios = require('axios');
const crypto = require('crypto');
const config = require('../../../config');
const MattermostUsersDBApi = require('../../../db/api/mattermostUsers');
const { encryptPassword, decryptPassword } = require('../../../utils/encryption');

class MattermostProvider {
  constructor() {
    this.apiBase = config.mattermost.apiUrl;
    this.token = config.mattermost.token;
    this.encryptionKey = config.mattermost.encryptionKey;
    this.client = axios.create({
      baseURL: this.apiBase,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateToken(userId) {
    try {
      const mappings = await this.getUserMappings([userId]);
      const mapping = mappings[0];
      if (!mapping) {
        throw new Error(`No Mattermost mapping found for user ID ${userId}`);
      }

      const loginId = mapping.mattermostUsername;
      const password = decryptPassword(mapping.mattermostPassword, this.encryptionKey);

      const response = await axios.post(
        `${this.apiBase}/users/login`,
        {
          login_id: loginId,
          password: password,
        },
      );

      const token = response.headers['token'];
      if (!token) {
        throw new Error('No session token received from Mattermost');
      }

      return token;
    } catch (error) {
      console.error(`Failed to generate Mattermost session token for user ${userId}:`, error.response?.data || error);
      throw error;
    }
  }

  async upsertUsers(usersData) {
    try {
      if (usersData.length === 0) {
        return { status: 'completed', totalUpserted: 0 };
      }

      let createdUserIds = [];
      let team = null;
      
      // Assuming all batch of users are from the same company
      const teamName = this._generateTeamName(usersData[0].company.name);
      const teamExists = await this._checkIfTeamExists(teamName);

      if (!teamExists) {
        team = await this._createTeam(teamName);
      } else {
        team = await this._getTeamByName(teamName);
      }

      await Promise.all(
        usersData.map(async (user) => {
          const existing = await this._findUserByEmail(user.email);
      
          if (!existing) {
            const password = this._generateTempPassword();
            const createdUser = await this._createUser(user, password);
            const encryptedPassword = encryptPassword(password, this.encryptionKey);
      
            createdUserIds.push(createdUser.id);
      
            // Create user in Mattermost
            await MattermostUsersDBApi.create({
              userId: user.id,
              mattermostUserId: createdUser.id,
              mattermostUsername: createdUser.username,
              mattermostPassword: encryptedPassword,
              mattermostTeamId: team.id,
            });
          }
        })
      );

      if (createdUserIds.length > 0) {
        await this._addUsersToTeam(team.id, createdUserIds);
      }
  
      return { status: 'completed', totalUpserted: usersData.length };
    } catch (error) {
      console.error('Error upserting users in Mattermost:', error);
      throw error;
    }
  }
  

  async deleteUsers(userIds) {
    try {
      if (userIds.length === 0) return { status: 'completed', totalChecked: 0 };

      // Get Mattermost user IDs for the given user IDs
      const mattermostMappings = await this.getUserMappings(userIds);
      const mattermostUserIds = mattermostMappings.map(mapping => mapping.mattermostUserId);

      await Promise.all(mattermostUserIds.map(async mattermostId => {
        try {
          await this.client.delete(`/users/${mattermostId}?permanent=true`);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // ignore, means the user is already deleted
          } else {
            throw err;
          }
        }
      }));

      // Remove the mappings from our database
      await this.removeUserMappings(userIds);

      return { status: 'completed', totalChecked: mattermostUserIds.length };
    } catch (error) {
      console.error('Error deleting users in Mattermost:', error);
      throw error;
    }
  }

  async getUserMappings(userIds) {
    return await MattermostUsersDBApi.findByUserIds(userIds);
  }

  async removeUserMappings(userIds) {
    return await MattermostUsersDBApi.removeByUserIds(userIds);
  }

  // --- Private Mattermost-specific methods ---

  async _createUser(user, password) {
    const response = await this.client.post('/users', {
      email: user.email,
      username: this._generateUsername(user),
      password,
      first_name: user.firstName,
      last_name: user.lastName,
    });

    return response.data;
  }

  async _createTeam(teamName) {
    const response = await this.client.post('/teams', {
      name: teamName,
      display_name: teamName,
      type: 'O'
    });
    return response.data;
  }

  async _getTeamByName(teamName) {
    const response = await this.client.get(`/teams/name/${teamName}`);
    return response.data;
  }

  async _addUsersToTeam(teamId, userIds) {
    const response = await this.client.post(
      `/teams/${teamId}/members/batch`,
      userIds.map((userId) => ({
        user_id: userId,
        team_id: teamId,
      })),
    );
  
    return response.data;
  }

  async _checkIfTeamExists(teamName) {
    const response = await this.client.get(`/teams/name/${teamName}/exists`);
    return response.data.exists;
  }

  async _findUserByEmail(email) {
    try {
      const response = await this.client.get(`/users/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }

  _generateUsername(user) {
    const base = `${user.firstName}.${user.lastName}`.toLowerCase();
    const cleaned = base.replace(/[^a-z0-9._-]/g, '');
    const validStart = /^[a-z]/.test(cleaned) ? cleaned : `u${cleaned}`;
    const trimmed = validStart.substring(0, 14); // reserve 8 chars
  
    // Secure random 8-character hex suffix (4 bytes = 8 hex chars)
    const randomSuffix = crypto.randomBytes(4).toString('hex');
  
    return `${trimmed}${randomSuffix}`;
  }

  _generateTempPassword() {
    return Math.random().toString(36).slice(-10) + '!Aa1'; // must meet Mattermost complexity rules
  }

  _generateTeamName(companyName) {
    return companyName
        .toLowerCase()                  // lowercase
        .trim()                         // remove leading/trailing spaces
        .replace(/\s+/g, '-')           // replace spaces with dashes
        .replace(/[^a-z0-9-]/g, '')     // remove invalid characters
        .replace(/^-+|-+$/g, '')        // trim dashes at start/end
        .substring(0, 64);              // limit to 64 characters
  }
}

module.exports = new MattermostProvider(); 