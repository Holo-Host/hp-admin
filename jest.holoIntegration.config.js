const config = require('./jest.common.config')

module.exports = {
  ...config,
  globalSetup: './holoIntegration-setup/setup.js',
  globalTeardown: './holoIntegration-setup/teardown.js',
  testEnvironment: './holoIntegration-setup/puppeteer_environment.js',
  testMatch: [
    '<rootDir>/src/**/__integration_tests__/holo/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.holoIntegration.{spec,test}.{js,jsx,ts,tsx}'
  ]
}
