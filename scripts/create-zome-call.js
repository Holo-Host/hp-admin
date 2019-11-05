const { findInstanceForAgent } = require('../src/utils/integration-testing/conductorConfig')
const initAndGetHolochainClient = require('./holochain-client.js')

function createZomeCall (instanceId, zomeName, functionName, agentIndex = 0) {
  const realInstanceId = findInstanceForAgent(instanceId, agentIndex).id

  return async function (args = {}) {
    const holochainClient = await initAndGetHolochainClient()
    return holochainClient.callZome(realInstanceId, zomeName, functionName)(args)
  }
}

module.exports = createZomeCall
