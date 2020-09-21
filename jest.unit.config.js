const config = require('./jest.common.config')

module.exports = {
  ...config,
  testMatch: [
    '<rootDir>/src/**/(*.unit).{spec,test}.{js,jsx,ts,tsx}'
    // '<rootDir>/src/**/!(__integration_tests__)/**/*.{js,jsx,ts,tsx}' // ,
    // '<rootDir>/src/**/!(*.hcIntegration).{spec,test}.{js,jsx,ts,tsx}',
    // '<rootDir>/src/**/!(*.holoIntegration).{spec,test}.{js,jsx,ts,tsx}'
  ]
}
