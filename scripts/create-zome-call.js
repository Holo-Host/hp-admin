const initAndGetHolochainClient = require('./holochain-client.js')

function createZomeCall (instanceId, zomeName, functionName) {
  return async function (args = {}) {
    const hc = await initAndGetHolochainClient()
    return hc.callZome(instanceId, zomeName, functionName)(args)
  }
}

module.exports = createZomeCall
