module.exports = {
  testEnvironment: 'node',

  testMatch: ['**/__tests__/**/*.spec.js'],

  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],

  testTimeout: 120000,

  maxWorkers: 4,

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/__tests__/**',
    '!src/integration/**',
    '!src/db/migrations/**',
    '!src/db/models/init-models.js'
  ],

  clearMocks: true,

  forceExit: true,

  detectOpenHandles: true,
};