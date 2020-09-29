const config = require('./jest.common.config')

module.exports = {
  ...config,
  testMatch: [
    '<rootDir>/src/**/__integration_tests__/holochain/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.hcIntegration.{spec,test}.{js,jsx,ts,tsx}'
  ]
}
