const initAndGetHolochainClient = require('./holochain-client.js')

function createZomeCall (instanceId, zomeName, functionName, agentIndex = 0) {
  return async function (args = {}) {
    const hc = await initAndGetHolochainClient(agentIndex)
    return hc.callZome(instanceId, zomeName, functionName)(args)
  }
}

module.exports = createZomeCall
