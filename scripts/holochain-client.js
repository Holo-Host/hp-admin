const { connect: hcWebClientConnect } = require('@holochain/hc-web-client')
const { websocketPort } = require('./read-test-conductor')
require('dotenv').config()

export const HOLOCHAIN_LOGGING = true && process.env.NODE_ENV === 'development'
let holochainClient

async function initAndGetHolochainClient () {
  if (holochainClient) return holochainClient
  try {
    const url = `ws://localhost:${websocketPort}`
    const holochainClient = await hcWebClientConnect({
      url,
      wsClient: { max_reconnects: 0 }
    })
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain')
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
