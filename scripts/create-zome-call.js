const { findInstanceForAgent } = require('../src/utils/conductorConfig')
const { connect } = require('@holochain/hc-web-client')
require('dotenv').config()

console.log('findInstanceForAgent', findInstanceForAgent)

async function createZomeCall (instanceId, zomeName, functionName, agentIndex = 0) {
  const { callZome, close } = await connect({ url: process.env.REACT_APP_DNA_INTERFACE_URL })
  const realInstanceId = findInstanceForAgent(instanceId, agentIndex)
  return async args => {
    const result = await callZome(realInstanceId, zomeName, functionName)(args)
    await close()
    return result
  }
}

module.exports = createZomeCall
