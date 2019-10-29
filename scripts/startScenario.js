import { connect } from '@holochain/hc-web-client'
import startTestConductor from './startTestConductor.js'

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
    })
}

export default startScenario
