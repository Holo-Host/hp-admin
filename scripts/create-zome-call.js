const { findInstanceForAgent } = require('../src/utils/conductorConfig')
const { connect: hcWebClientConnect } = require('@holochain/hc-web-client')
require('dotenv').config()

const HOLOCHAIN_LOGGING = true

let holochainClient

async function initAndGetHolochainClient () {
  if (holochainClient) return holochainClient
  try {
    holochainClient = await hcWebClientConnect({
      url: process.env.REACT_APP_DNA_INTERFACE_URL,
      wsClient: { max_reconnects: 0 }
    })
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain!')
    }
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    throw (error)
  }
}

async function createZomeCall (instanceId, zomeName, functionName, agentIndex = 0) {
  await initAndGetHolochainClient()
  const realInstanceId = findInstanceForAgent(instanceId, agentIndex).id

  return async function (args = {}) {
    return holochainClient.callZome(realInstanceId, zomeName, functionName)(args)
  }
}

module.exports = createZomeCall
