const { connect: hcWebClientConnect } = require('@holochain/hc-web-client')
require('dotenv').config()

const HOLOCHAIN_LOGGING = true

function createZomeCall (instanceId, zomeName, functionName, agentIndex = 0) {
  return async function (args = {}) {
    const hc = await holochainClient(agentIndex)
    return hc.callZome(instanceId, zomeName, functionName)(args)
  }
}

async function holochainClient (agentIndex) {
  let url;
  try {
    if (agentIndex == 0) {
      url = 'ws://localhost:3400'
    }
    else if (agentIndex == 1) {
      url = 'ws://localhost:3500'
    }
    let hc = await hcWebClientConnect({
      url,
      wsClient: { max_reconnects: 0 }
    })
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain!')
    }
    return hc
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    throw (error)
  }
}

module.exports = createZomeCall
