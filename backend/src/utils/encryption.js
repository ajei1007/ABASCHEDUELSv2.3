const crypto = require('crypto');

/**
 * Encrypt a password using AES-256-CBC
 * @param {string} password - The password to encrypt
 * @returns {string} - Encrypted password in format: iv:encryptedData
 */
const encryptPassword = (password, encryptionKey) => {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt a password using AES-256-CBC
 * @param {string} encryptedPassword - The encrypted password in format: iv:encryptedData
 * @returns {string} - The decrypted password
 */
const decryptPassword = (encryptedPassword, encryptionKey) => {
  const parts = encryptedPassword.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = {
  encryptPassword,
  decryptPassword,
}; 