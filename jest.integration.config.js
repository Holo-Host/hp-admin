const config = require('./jest.common.config')

module.exports = {
  ...config,
  testMatch: [
    '<rootDir>/src/**/__integration_tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.integration.{spec,test}.{js,jsx,ts,tsx}'
  ]
}
