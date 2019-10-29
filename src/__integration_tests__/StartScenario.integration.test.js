import { connect } from '@holochain/hc-web-client'
import startTestConductor from '../scripts/startTestConductor.js'

const startScenario = async (testingFn) => {
  startTestConductor()
    .then(() => {
      console.log('Successful connection to Conductor!')
      // async
      return connect({ url: process.env.REACT_APP_DNA_INTERFACE_URL })
        .then(async ({ callZome }) => {
          const scenarioTest = async () => testingFn(callZome)
          await scenarioTest()
            .then(_ => process.exit())
        })
      // await console.log('Testing Scenario Closed.')
      // await console.log('Shutting down conductor...')
      // // TODO: LOOK AT ENVOY

      // await console.log('Deleting Storage Files...')
      // // TODO: REMOVE TMP FILES (all DNA PERSISTED STORAGE)...
      // await deleteDirectoryRecursive('../../tmp')
    })
}

export default startScenario
