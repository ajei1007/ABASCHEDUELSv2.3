const crypto = require('crypto');

// Define the algorithm and the secret key
const algorithm = 'aes-256-cbc';
const secretKeyString = 'abaschedules-is-awasome-software';
const fixedIv = 'abaschedules-is-secure-software';
const secretKey = crypto.createHash('sha256').update(secretKeyString).digest('base64').substr(0, 32);
const iv = crypto.createHash('sha256').update(String(fixedIv)).digest('base64').substr(0, 16);

// Function to encrypt a password
function encrypt(password) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Function to decrypt a password
function decrypt(encryptedPassword) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
}
