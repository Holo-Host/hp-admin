const config = require('./jest.common.config')

module.exports = {
  ...config,
  testMatch: [
    '<rootDir>/src/**/(*.unit).{spec,test}.{js,jsx,ts,tsx}'
  ]
}
