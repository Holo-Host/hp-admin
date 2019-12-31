const { connect: hcWebClientConnect } = require('@holochain/hc-web-client')
require('dotenv').config()

const HOLOCHAIN_LOGGING = true
let holochainClient

async function initAndGetHolochainClient (agentIndex = 0) {
  if (holochainClient) return holochainClient
  let url
  try {
    if (agentIndex === 0) {
      url = 'ws://localhost:3400'
    } else if (agentIndex === 1) {
      url = 'ws://localhost:3401'
    }
    const holochainClient = await hcWebClientConnect({
      url,
      wsClient: { max_reconnects: 0 }
    })
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain!')
    }
    return holochainClient
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    throw (error)
  }
}

module.exports = initAndGetHolochainClient
